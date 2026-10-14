import { describe, expect, it } from 'vitest';
import { isInBounds } from './field';
import { verticalStack, type Direction } from './lineups';

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

describe('verticalStack', () => {
  const cases: [Direction, Direction][] = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  it.each(cases)('puts 7 v 7 in bounds (attack %i, force %i)', (attackDir, forceSide) => {
    const spots = verticalStack({ x: 40, y: 20 }, attackDir, forceSide);
    expect(spots.filter((s) => s.side === 'offense')).toHaveLength(7);
    expect(spots.filter((s) => s.side === 'defense')).toHaveLength(7);
    for (const s of spots) expect(isInBounds(s.pos)).toBe(true);
  });

  it.each(cases)('keeps each defender on their matchup (attack %i, force %i)', (attackDir, forceSide) => {
    const spots = verticalStack({ x: 55, y: 20 }, attackDir, forceSide);
    for (let n = 1; n <= 7; n++) {
      const o = spots.find((s) => s.side === 'offense' && s.number === n)!;
      const d = spots.find((s) => s.side === 'defense' && s.number === n)!;
      expect(dist(o.pos, d.pos)).toBeLessThan(2.5);
    }
  });

  it('puts the marker on the break side, within stall range', () => {
    const spots = verticalStack({ x: 30, y: 20 }, 1, 1);
    const thrower = spots.find((s) => s.side === 'offense' && s.number === 1)!;
    const marker = spots.find((s) => s.side === 'defense' && s.number === 1)!;
    expect(marker.pos.y).toBeLessThan(thrower.pos.y); // open side is +y, so break side is -y
    expect(dist(marker.pos, thrower.pos)).toBeLessThan(3.3);
  });

  it('lines the stack up downfield of the disc', () => {
    for (const attackDir of [1, -1] as const) {
      const disc = { x: 55, y: 20 };
      const cutters = verticalStack(disc, attackDir, 1).filter((s) => s.side === 'offense' && s.number >= 3);
      for (const c of cutters) expect((c.pos.x - disc.x) * attackDir).toBeGreaterThan(0);
    }
  });
});
