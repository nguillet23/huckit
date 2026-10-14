import { describe, expect, it } from 'vitest';
import type { Point } from './field';
import {
  createPossession,
  drainEvents,
  findPlayer,
  flightTime,
  RULES,
  setTarget,
  SPEED,
  step,
  throwTo,
} from './possession';
import type { GameState, Player, TurnoverReason } from './types';

const DT = 1 / 60;

/**
 * Attacking +x with a forehand force, so the open side is +y. The thrower
 * (offense #1) starts at (30, 20). A constant rng of 0.5 means "no luck either
 * way": no handblocks or lane blocks, no interceptions, and every catch is made.
 */
function setup(rng = 0.5): GameState {
  return createPossession({ disc: { x: 30, y: 20 }, attackDir: 1, force: 'forehand', rng: () => rng });
}

function place(p: Player, at: Point): void {
  p.pos = { ...at };
  p.target = { ...at };
  p.vel = { x: 0, y: 0 };
}

/** Park every defender far upfield so only the ones a test places matter. */
function clearDefense(state: GameState): void {
  state.players
    .filter((p) => p.side === 'defense')
    .forEach((p, i) => place(p, { x: 2, y: 2 + i * 5 }));
}

function run(state: GameState, seconds: number): void {
  for (let t = 0; t < seconds; t += DT) step(state, DT);
}

function runFlight(state: GameState): void {
  for (let i = 0; i < 60 * 10 && state.phase === 'flight'; i++) step(state, DT);
}

function turnoverReason(state: GameState): TurnoverReason | undefined {
  return state.result?.kind === 'turnover' ? state.result.reason : undefined;
}

describe('a new possession', () => {
  it('starts 7 v 7 with offense #1 holding the disc', () => {
    const state = setup();
    expect(state.players).toHaveLength(14);
    expect(state.phase).toBe('play');
    expect(state.thrower).toBe(findPlayer(state, 'offense', 1));
    expect(state.disc.holder).toBe(state.thrower);
    expect(state.stall).toBe(0);
  });
});

describe('pivot rule', () => {
  it("doesn't let the thrower run with the disc", () => {
    const state = setup();
    const thrower = state.thrower!;
    setTarget(state, thrower, { x: 60, y: 20 }, SPEED.sprint);
    run(state, 2);
    expect(thrower.pos).toEqual({ x: 30, y: 20 });
  });

  it('lets other players run, up to their top speed', () => {
    const state = setup();
    const cutter = findPlayer(state, 'offense', 3);
    const start = { ...cutter.pos };
    setTarget(state, cutter, { x: start.x + 40, y: start.y }, SPEED.sprint);
    run(state, 1.5);
    expect(Math.hypot(cutter.vel.x, cutter.vel.y)).toBeCloseTo(SPEED.sprint, 1);
    expect(cutter.pos.x - start.x).toBeGreaterThan(8);
  });
});

describe('stall count', () => {
  it('counts once a second while the marker is within 10 ft, and turns it over at 10', () => {
    const state = setup();
    run(state, 5.5);
    expect(state.stall).toBe(6);
    run(state, 5);
    expect(turnoverReason(state)).toBe('stall');
    expect(state.phase).toBe('over');
    expect(drainEvents(state)).toContainEqual(expect.objectContaining({ type: 'turnover', reason: 'stall' }));
  });

  it("doesn't start until the marker is in range", () => {
    const state = setup();
    place(findPlayer(state, 'defense', 1), { x: 36, y: 20 });
    run(state, 12);
    expect(state.stall).toBe(0);
    expect(state.phase).toBe('play');
  });

  it('resets when the disc is thrown', () => {
    const state = setup();
    clearDefense(state);
    place(findPlayer(state, 'defense', 1), { x: 31, y: 19 });
    run(state, 4);
    expect(state.stall).toBeGreaterThan(3);
    const receiver = findPlayer(state, 'offense', 3);
    throwTo(state, receiver.pos, receiver);
    expect(state.stall).toBe(0);
  });
});

describe('throws and catches', () => {
  it('completes an open pass, and the receiver becomes the thrower', () => {
    const state = setup();
    clearDefense(state);
    const receiver = findPlayer(state, 'offense', 3);
    place(receiver, { x: 45, y: 22 });
    expect(throwTo(state, receiver.pos, receiver)).toBe(true);
    expect(state.phase).toBe('flight');
    runFlight(state);
    expect(state.phase).toBe('play');
    expect(state.thrower).toBe(receiver);
    expect(state.disc.holder).toBe(receiver);
    expect(drainEvents(state)).toContainEqual(
      expect.objectContaining({ type: 'completion', from: 1, to: 3, gain: 15, isBreak: false }),
    );
  });

  it('scores a goal when the receiver catches it in the attacking endzone', () => {
    const state = setup();
    clearDefense(state);
    const receiver = findPlayer(state, 'offense', 7);
    place(receiver, { x: 95, y: 20 });
    throwTo(state, receiver.pos, receiver);
    runFlight(state);
    expect(state.result).toEqual({ kind: 'goal' });
    expect(drainEvents(state)).toContainEqual(expect.objectContaining({ type: 'goal', scorer: 7 }));
  });

  it("can't throw while the disc is in the air", () => {
    const state = setup();
    clearDefense(state);
    const receiver = findPlayer(state, 'offense', 3);
    throwTo(state, receiver.pos, receiver);
    expect(throwTo(state, { x: 50, y: 20 })).toBe(false);
  });
});

describe('turnovers', () => {
  it('is out of bounds when nobody catches a throw that lands out, put in where it crossed', () => {
    const state = setup();
    clearDefense(state);
    throwTo(state, { x: 50, y: -6 });
    runFlight(state);
    expect(turnoverReason(state)).toBe('out');
    const event = drainEvents(state).find((e) => e.type === 'turnover');
    expect(event && 'at' in event ? event.at.y : NaN).toBeCloseTo(0, 3);
  });

  it('is caught out of bounds when the receiver is standing out', () => {
    const state = setup();
    clearDefense(state);
    const receiver = findPlayer(state, 'offense', 3);
    place(receiver, { x: 40, y: -0.5 });
    throwTo(state, receiver.pos, receiver);
    runFlight(state);
    expect(turnoverReason(state)).toBe('caught_out');
  });

  it('is incomplete when the disc lands in bounds with no one there', () => {
    const state = setup();
    clearDefense(state);
    throwTo(state, { x: 60, y: 37 });
    runFlight(state);
    expect(turnoverReason(state)).toBe('incomplete');
  });

  it('is a block when a defender gets to the disc first', () => {
    const state = setup();
    clearDefense(state);
    place(findPlayer(state, 'defense', 3), { x: 40, y: 20 });
    const receiver = findPlayer(state, 'offense', 3);
    place(receiver, { x: 48, y: 20 });
    throwTo(state, { x: 40, y: 20 }, receiver);
    runFlight(state);
    expect(turnoverReason(state)).toBe('block');
  });

  it('can be an interception when the defender is right on the spot', () => {
    const state = setup(0);
    clearDefense(state);
    place(findPlayer(state, 'defense', 3), { x: 40, y: 26 });
    const receiver = findPlayer(state, 'offense', 3);
    place(receiver, { x: 48, y: 26 });
    throwTo(state, { x: 40, y: 26 }, receiver);
    runFlight(state);
    expect(turnoverReason(state)).toBe('interception');
  });

  it('can be a drop when the catch is contested', () => {
    const state = setup(0.9);
    clearDefense(state);
    const receiver = findPlayer(state, 'offense', 3);
    place(receiver, { x: 45, y: 26 });
    place(findPlayer(state, 'defense', 3), { x: 46.8, y: 26 });
    throwTo(state, receiver.pos, receiver);
    runFlight(state);
    expect(turnoverReason(state)).toBe('drop');
  });

  it('lets the marker handblock break-side throws', () => {
    const state = setup(0.1);
    const receiver = findPlayer(state, 'offense', 2);
    throwTo(state, { x: 40, y: 10 }, receiver); // open side is +y, so -y is the break side
    runFlight(state);
    expect(turnoverReason(state)).toBe('handblock');
  });

  it("rarely handblocks open-side throws (the same roll that blocked a break throw doesn't)", () => {
    const state = setup(0.1);
    clearDefense(state);
    place(findPlayer(state, 'defense', 1), { x: 31.2, y: 18.7 });
    const receiver = findPlayer(state, 'offense', 3);
    place(receiver, { x: 40, y: 30 });
    throwTo(state, receiver.pos, receiver);
    runFlight(state);
    expect(state.result).toBeNull();
    expect(state.thrower).toBe(receiver);
  });
});

describe('flight time', () => {
  it('grows with distance, and long hucks hang extra', () => {
    expect(flightTime(10)).toBeLessThan(flightTime(20));
    const shortRate = (flightTime(20) - flightTime(10)) / 10;
    const longRate = (flightTime(50) - flightTime(40)) / 10;
    expect(longRate).toBeGreaterThan(shortRate);
  });
});

describe('rules constants', () => {
  it('uses the USA Ultimate stall count of 10', () => {
    expect(RULES.stallLimit).toBe(10);
  });
});
