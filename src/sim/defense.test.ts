import { describe, expect, it } from 'vitest';
import type { Point } from './field';
import { createDefense, updateDefense, type DefenseAI } from './defense';
import { createPossession, findPlayer, RULES, setTarget, SPEED, step, throwTo } from './possession';
import type { GameState, Player } from './types';

const DT = 1 / 60;
const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** Attacking +x with a forehand force (open side +y); the thrower starts at (30, 20). */
function setup(): { state: GameState; ai: DefenseAI } {
  const state = createPossession({ disc: { x: 30, y: 20 }, attackDir: 1, force: 'forehand', rng: () => 0.5 });
  return { state, ai: createDefense(() => 0.5) };
}

function tick(state: GameState, ai: DefenseAI): void {
  updateDefense(ai, state, DT);
  step(state, DT);
}

function run(state: GameState, ai: DefenseAI, seconds: number, each?: () => void): void {
  for (let t = 0; t < seconds; t += DT) {
    tick(state, ai);
    each?.();
  }
}

function place(p: Player, at: Point): void {
  p.pos = { ...at };
  p.target = { ...at };
  p.vel = { x: 0, y: 0 };
}

describe('the marker', () => {
  it('runs up to the thrower and sets up on the break side, inside stall range', () => {
    const { state, ai } = setup();
    const marker = findPlayer(state, 'defense', 1);
    place(marker, { x: 45, y: 30 });
    run(state, ai, 3);
    const thrower = state.thrower!;
    expect(dist(marker.pos, thrower.pos)).toBeLessThan(RULES.stallRange);
    expect(marker.pos.y).toBeLessThan(thrower.pos.y); // open side is +y, so the break side is -y
    expect(state.stall).toBeGreaterThan(0);
  });

  it('switches to the new thrower after a completion', () => {
    const { state, ai } = setup();
    const receiver = findPlayer(state, 'offense', 3);
    place(receiver, { x: 40, y: 32 });
    for (const d of state.players.filter((p) => p.side === 'defense' && p.number > 3)) place(d, { x: 100, y: 5 });
    place(findPlayer(state, 'defense', 2), { x: 100, y: 10 });
    // Close enough to become the marker, too far to block the pass.
    place(findPlayer(state, 'defense', 3), { x: 48, y: 36 });
    throwTo(state, receiver.pos, receiver);
    run(state, ai, 4);
    expect(state.thrower).toBe(receiver);
    expect(dist(findPlayer(state, 'defense', 3).pos, receiver.pos)).toBeLessThan(RULES.stallRange);
  });
});

describe('downfield defenders', () => {
  it('stick with their player, deep and on the open side', () => {
    const { state, ai } = setup();
    run(state, ai, 2);
    for (let n = 2; n <= 7; n++) {
      const o = findPlayer(state, 'offense', n);
      const d = findPlayer(state, 'defense', n);
      expect(dist(o.pos, d.pos)).toBeLessThan(2);
      expect(d.pos.x).toBeGreaterThan(o.pos.x); // deep side when attacking +x
      expect(d.pos.y).toBeGreaterThan(o.pos.y); // open side is +y
    }
  });

  it('react late, so a sharp under cut gets open, then recover once the cutter stops', () => {
    const { state, ai } = setup();
    run(state, ai, 1);
    const cutter = findPlayer(state, 'offense', 3);
    const defender = findPlayer(state, 'defense', 3);
    const start = dist(cutter.pos, defender.pos);

    let maxSeparation = 0;
    setTarget(state, cutter, { x: 33, y: 30 }, SPEED.sprint);
    run(state, ai, 1.5, () => {
      maxSeparation = Math.max(maxSeparation, dist(cutter.pos, defender.pos));
    });
    expect(maxSeparation).toBeGreaterThan(start + 1);

    run(state, ai, 3);
    expect(dist(cutter.pos, defender.pos)).toBeLessThan(2);
  });
});

describe('on a throw', () => {
  it('sends the nearest defender (not the marker) to the disc', () => {
    const { state, ai } = setup();
    run(state, ai, 0.5);
    const spot = { x: 45, y: 26 };
    throwTo(state, spot);
    updateDefense(ai, state, DT);

    const marker = findPlayer(state, 'defense', 1);
    expect(ai.chasing.has(marker)).toBe(false);
    expect(ai.chasing.size).toBeGreaterThan(0);
    for (const d of ai.chasing) expect(d.target).toEqual(spot);
  });

  it("doesn't chase throws no defender can reach", () => {
    const { state, ai } = setup();
    for (const d of state.players.filter((p) => p.side === 'defense' && p.number !== 1)) place(d, { x: 100, y: 5 });
    throwTo(state, { x: 40, y: 35 });
    updateDefense(ai, state, DT);
    expect(ai.chasing.size).toBe(0);
  });
});

it('stands still once the possession is over', () => {
  const { state, ai } = setup();
  run(state, ai, 11); // stalled out
  expect(state.phase).toBe('over');
  const before = state.players.map((p) => ({ ...p.target }));
  run(state, ai, 1);
  expect(state.players.map((p) => p.target)).toEqual(before);
});
