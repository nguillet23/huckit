/**
 * One offensive possession: the core rules engine.
 *
 * The player's team (offense) holds the disc until a goal or a turnover, and
 * either one ends the possession. The CPU never goes on offense. This module
 * owns the rules (pivot, stall count, throws, catches, turnovers). Who runs
 * where is decided by commands (`setTarget`, `throwTo`) and, later, the AI.
 */
import { FIELD, GOAL_LINE, isInBounds, type Point } from './field';
import { verticalStack, type Direction } from './lineups';
import { movePlayer } from './movement';
import { seededRng, type Rng } from './rng';
import type { Force, GameState, Player, SimEvent, TurnoverReason } from './types';

export const RULES = {
  stallLimit: 10,
  /** The marker must be within 10 ft (3.3 yd) of the thrower to count. */
  stallRange: 3.3,
} as const;

export const SPEED = {
  sprint: 7.6,
  jog: 4.5,
  defender: 7.1,
} as const;

/**
 * Teaching-tuned odds: correct reads should reliably work, and bad reads
 * (break-side throws into the marker, throws into a defender) should get punished.
 */
export const ODDS = {
  catchReach: 1.6,
  catchOpen: 0.99,
  catchContested: 0.85,
  /** A defender this close to the catch point is contesting it. */
  contestedMargin: 0.6,
  interceptRange: 1.0,
  interceptChance: 0.45,
  markRange: 2.5,
  handblockBreakSide: 0.25,
  handblockOpenSide: 0.03,
  laneRange: 1.0,
  laneMaxHeight: 2.2,
  laneBlockChance: 0.45,
  laneInterceptShare: 0.35,
} as const;

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const lerp = (a: Point, b: Point, s: number): Point => ({ x: a.x + (b.x - a.x) * s, y: a.y + (b.y - a.y) * s });
const copy = (p: Point): Point => ({ x: p.x, y: p.y });

/** Seconds in the air. Longer throws hang longer, which gives defenders time to recover. */
export function flightTime(distance: number): number {
  return 0.25 + distance / 19 + Math.max(0, distance - 25) * 0.025;
}

/** Peak height in yards. Only the low parts of a throw can be blocked mid-flight. */
export function throwHeight(distance: number): number {
  return Math.min(6, distance * 0.13);
}

/**
 * The open side, as +1/-1 in y. A right-handed thrower facing +x has their
 * forehand side toward +y, so forcing forehand opens the +y side when attacking +x.
 */
export function openSide(attackDir: Direction, force: Force): Direction {
  return force === 'forehand' ? attackDir : ((-attackDir) as Direction);
}

export interface PossessionOptions {
  disc: Point;
  attackDir: Direction;
  force: Force;
  /** Seed for a replayable possession. Ignored when `rng` is given. */
  seed?: number;
  rng?: Rng;
}

/** Start a possession with offense #1 holding the disc, in a vertical stack vs. man defense. */
export function createPossession(opts: PossessionOptions): GameState {
  const players: Player[] = verticalStack(opts.disc, opts.attackDir, openSide(opts.attackDir, opts.force)).map(
    (s) => ({
      side: s.side,
      number: s.number,
      pos: copy(s.pos),
      vel: { x: 0, y: 0 },
      target: copy(s.pos),
      maxSpeed: s.side === 'offense' ? SPEED.jog : SPEED.defender,
    }),
  );
  const thrower = players.find((p) => p.side === 'offense' && p.number === 1)!;
  return {
    time: 0,
    phase: 'play',
    attackDir: opts.attackDir,
    force: opts.force,
    players,
    disc: { pos: copy(thrower.pos), height: 0, holder: thrower, flight: null },
    thrower,
    stall: 0,
    stallClock: 0,
    events: [],
    result: null,
    rng: opts.rng ?? seededRng(opts.seed ?? Date.now()),
  };
}

export function findPlayer(state: GameState, side: Player['side'], number: number): Player {
  return state.players.find((p) => p.side === side && p.number === number)!;
}

/** The defender guarding this offensive player (or vice versa). */
export function matchupOf(state: GameState, p: Player): Player {
  return findPlayer(state, p.side === 'offense' ? 'defense' : 'offense', p.number);
}

export function isInAttackingEndzone(state: GameState, p: Point): boolean {
  if (!isInBounds(p)) return false;
  return state.attackDir === 1 ? p.x > GOAL_LINE.right : p.x < GOAL_LINE.left;
}

/** Return and clear the events since the last call. */
export function drainEvents(state: GameState): SimEvent[] {
  return state.events.splice(0);
}

/** Send a player toward a point. The thrower can't run with the disc, so it's ignored for them. */
export function setTarget(state: GameState, p: Player, target: Point, speed: number): void {
  if (p === state.disc.holder) return;
  p.target = copy(target);
  p.maxSpeed = speed;
}

function nearest(players: readonly Player[], p: Point): Player | null {
  let best: Player | null = null;
  let bestD = Infinity;
  for (const q of players) {
    const d = dist(q.pos, p);
    if (d < bestD) {
      bestD = d;
      best = q;
    }
  }
  return best;
}

/**
 * Throw to a spot. The receiver (by default the nearest teammate to the spot)
 * runs to it. Returns false if no one is holding the disc.
 */
export function throwTo(state: GameState, to: Point, receiver?: Player): boolean {
  const t = state.thrower;
  if (state.phase !== 'play' || !t) return false;
  const target = receiver ?? nearest(state.players.filter((p) => p.side === 'offense' && p !== t), to);
  if (!target) return false;

  const distance = dist(t.pos, to);
  const isBreak = (to.y - t.pos.y) * openSide(state.attackDir, state.force) < -1.5;
  const marker = matchupOf(state, t);
  const markerClose = dist(marker.pos, t.pos) < ODDS.markRange;
  const markBlock =
    markerClose && state.rng() < (isBreak ? ODDS.handblockBreakSide : ODDS.handblockOpenSide);

  state.disc.holder = null;
  state.disc.flight = {
    from: copy(t.pos),
    to: copy(to),
    elapsed: 0,
    duration: flightTime(distance),
    maxHeight: throwHeight(distance),
    thrower: t,
    receiver: target,
    isBreak,
    markBlock,
    checked: new Set([marker]),
  };
  state.thrower = null;
  state.stall = 0;
  state.phase = 'flight';
  target.target = copy(to);
  target.maxSpeed = SPEED.sprint;

  state.events.push({
    type: 'throw',
    time: state.time,
    from: t.number,
    to: target.number,
    distance: Math.round(distance),
    isBreak,
  });
  return true;
}

/** Advance the possession by `dt` seconds. */
export function step(state: GameState, dt: number): void {
  if (state.phase === 'over') {
    for (const p of state.players) movePlayer(p, dt);
    return;
  }
  state.time += dt;

  const holder = state.disc.holder;
  for (const p of state.players) {
    if (p === holder) {
      p.vel.x = 0;
      p.vel.y = 0;
      continue;
    }
    movePlayer(p, dt);
  }

  if (state.phase === 'play') updateStall(state, dt);
  else if (state.phase === 'flight') updateFlight(state, dt);

  if (state.disc.holder) state.disc.pos = copy(state.disc.holder.pos);
}

function updateStall(state: GameState, dt: number): void {
  const thrower = state.thrower!;
  if (state.stall === 0) {
    if (dist(matchupOf(state, thrower).pos, thrower.pos) <= RULES.stallRange) {
      state.stall = 1;
      state.stallClock = 0;
    }
    return;
  }
  state.stallClock += dt;
  while (state.stallClock >= 1) {
    state.stallClock -= 1;
    state.stall++;
    if (state.stall >= RULES.stallLimit) {
      endWithTurnover(state, 'stall', thrower.pos);
      return;
    }
  }
}

function updateFlight(state: GameState, dt: number): void {
  const disc = state.disc;
  const f = disc.flight!;
  f.elapsed += dt;
  const prog = Math.min(1, f.elapsed / f.duration);
  disc.pos = lerp(f.from, f.to, prog);
  disc.height = Math.sin(Math.PI * prog) * f.maxHeight;

  const length = dist(f.from, f.to);
  if (f.markBlock && prog >= Math.min(0.2, 1.5 / Math.max(1, length))) {
    endWithTurnover(state, 'handblock', disc.pos, matchupOf(state, f.thrower));
    return;
  }

  // Defenders under the low part of the throw get one chance each to get a hand on it.
  if (disc.height < ODDS.laneMaxHeight && prog > 0.08 && prog < 0.9) {
    for (const d of state.players) {
      if (d.side !== 'defense' || f.checked.has(d) || dist(d.pos, disc.pos) >= ODDS.laneRange) continue;
      f.checked.add(d);
      if (state.rng() < ODDS.laneBlockChance) {
        const reason = state.rng() < ODDS.laneInterceptShare ? 'interception' : 'block';
        endWithTurnover(state, reason, disc.pos, d);
        return;
      }
    }
  }

  if (prog >= 1) resolveCatch(state);
}

function resolveCatch(state: GameState): void {
  const f = state.disc.flight!;
  const P = f.to;
  const o = nearest(state.players.filter((p) => p.side === 'offense' && p !== f.thrower), P);
  const d = nearest(state.players.filter((p) => p.side === 'defense'), P);
  const oD = o ? dist(o.pos, P) : Infinity;
  const dD = d ? dist(d.pos, P) : Infinity;

  if (d && dD <= ODDS.catchReach && (dD < oD || oD > ODDS.catchReach)) {
    const intercepted = dD < ODDS.interceptRange && state.rng() < ODDS.interceptChance;
    endWithTurnover(state, intercepted ? 'interception' : 'block', P, d);
    return;
  }
  if (o && oD <= ODDS.catchReach) {
    const contested = dD <= ODDS.catchReach + ODDS.contestedMargin;
    if (state.rng() < (contested ? ODDS.catchContested : ODDS.catchOpen)) completion(state, o);
    else endWithTurnover(state, 'drop', P);
    return;
  }
  if (!isInBounds(P)) endWithTurnover(state, 'out', crossingPoint(f.from, P));
  else endWithTurnover(state, 'incomplete', P);
}

function completion(state: GameState, receiver: Player): void {
  const f = state.disc.flight!;
  // A receiver's feet decide in/out and whether it's in the endzone.
  if (!isInBounds(receiver.pos)) {
    endWithTurnover(state, 'caught_out', crossingPoint(f.from, receiver.pos));
    return;
  }
  if (isInAttackingEndzone(state, receiver.pos)) {
    endPossession(state, receiver);
    state.result = { kind: 'goal' };
    state.events.push({ type: 'goal', time: state.time, scorer: receiver.number });
    return;
  }

  // The receiver has to stop; they become the new thrower and can only pivot.
  receiver.vel = { x: 0, y: 0 };
  receiver.target = copy(receiver.pos);
  state.disc = { pos: copy(receiver.pos), height: 0, holder: receiver, flight: null };
  state.thrower = receiver;
  state.stall = 0;
  state.stallClock = 0;
  state.phase = 'play';
  state.events.push({
    type: 'completion',
    time: state.time,
    from: f.thrower.number,
    to: receiver.number,
    gain: Math.round((receiver.pos.x - f.from.x) * state.attackDir),
    isBreak: f.isBreak,
  });
}

function endWithTurnover(state: GameState, reason: TurnoverReason, at: Point, defender?: Player): void {
  const spot = {
    x: Math.min(FIELD.length, Math.max(0, at.x)),
    y: Math.min(FIELD.width, Math.max(0, at.y)),
  };
  endPossession(state, null);
  state.disc.pos = spot;
  state.result = { kind: 'turnover', reason };
  state.events.push({ type: 'turnover', time: state.time, reason, at: copy(spot), defender: defender?.number });
}

function endPossession(state: GameState, holder: Player | null): void {
  state.phase = 'over';
  state.thrower = null;
  state.disc = { pos: copy(holder?.pos ?? state.disc.pos), height: 0, holder, flight: null };
  for (const p of state.players) p.target = copy(p.pos);
}

/** Where a throw from `a` (in bounds) to `b` (out) crossed the boundary. */
function crossingPoint(a: Point, b: Point): Point {
  if (!isInBounds(a)) return b;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (isInBounds(lerp(a, b, mid))) lo = mid;
    else hi = mid;
  }
  return lerp(a, b, lo);
}
