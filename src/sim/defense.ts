/**
 * The CPU's person-to-person ("man") defense.
 *
 * Each defender guards the offensive player with the same number. The AI only
 * decides where defenders run (their targets); the rules engine in
 * possession.ts decides blocks, catches and the stall count.
 *
 * - Marker: sets up on the break side of the thrower, inside stall range.
 * - Downfield: positions slightly deep and on the open side of their player,
 *   re-reading them every ~0.2-0.35 s. That reaction delay is what lets a
 *   sharp cut get open.
 * - On a throw: the one or two defenders who can get there sprint to the disc.
 */
import type { Point } from './field';
import { matchupOf, openSide, SPEED } from './possession';
import { seededRng, type Rng } from './rng';
import type { Flight, GameState, Player } from './types';

export const DEFENSE = {
  /** Marker offset from the thrower: downfield, and toward the break side. */
  markerAhead: 1.2,
  markerBreakSide: 1.3,
  /** Downfield defenders sit this far deep of their player (taking away the huck)... */
  coverDeep: 1.3,
  /** ...and this far toward the open side (taking away the easy open-side cut). */
  coverOpenSide: 0.8,
  /** How far ahead (in seconds) a defender anticipates their player's movement. */
  anticipation: 0.2,
  /** Seconds between a downfield defender's re-reads of their player. */
  reactMin: 0.18,
  reactMax: 0.34,
  maxChasers: 2,
  /** A defender chases a throw if they could arrive within this long after it lands. */
  chaseSlack: 0.8,
} as const;

export interface DefenseAI {
  rng: Rng;
  /** Seconds until each defender next re-reads their player. */
  reactIn: Map<Player, number>;
  /** Defenders sprinting to the current throw. */
  chasing: Set<Player>;
  /** The throw the chasers were picked for, to notice new throws. */
  chasedFlight: Flight | null;
}

export function createDefense(rng: Rng = seededRng(1)): DefenseAI {
  return { rng, reactIn: new Map(), chasing: new Set(), chasedFlight: null };
}

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** Set every defender's target for this frame. Call before `step`. */
export function updateDefense(ai: DefenseAI, state: GameState, dt: number): void {
  if (state.phase === 'over') return;

  const flight = state.disc.flight;
  if (flight !== ai.chasedFlight) {
    ai.chasedFlight = flight;
    ai.chasing.clear();
    if (flight) pickChasers(ai, state, flight);
  }

  const dir = state.attackDir;
  const open = openSide(state.attackDir, state.force);

  for (const d of state.players) {
    if (d.side !== 'defense' || ai.chasing.has(d)) continue;
    const o = matchupOf(state, d);

    if (o === state.thrower) {
      d.target = { x: o.pos.x + dir * DEFENSE.markerAhead, y: o.pos.y - open * DEFENSE.markerBreakSide };
      d.maxSpeed = SPEED.defender;
      continue;
    }

    const wait = (ai.reactIn.get(d) ?? 0) - dt;
    if (wait > 0) {
      ai.reactIn.set(d, wait);
      continue;
    }
    ai.reactIn.set(d, DEFENSE.reactMin + ai.rng() * (DEFENSE.reactMax - DEFENSE.reactMin));
    d.target = {
      x: o.pos.x + dir * DEFENSE.coverDeep + o.vel.x * DEFENSE.anticipation,
      y: o.pos.y + open * DEFENSE.coverOpenSide + o.vel.y * DEFENSE.anticipation,
    };
    d.maxSpeed = SPEED.defender;
  }
}

function pickChasers(ai: DefenseAI, state: GameState, flight: Flight): void {
  const marker = matchupOf(state, flight.thrower);
  const candidates = state.players
    .filter((d) => d.side === 'defense' && d !== marker)
    .map((d) => ({ d, eta: dist(d.pos, flight.to) / SPEED.defender }))
    .filter(({ eta }) => eta <= flight.duration + DEFENSE.chaseSlack)
    .sort((a, b) => a.eta - b.eta)
    .slice(0, DEFENSE.maxChasers);
  for (const { d } of candidates) {
    ai.chasing.add(d);
    d.target = { ...flight.to };
    d.maxSpeed = SPEED.defender;
  }
}
