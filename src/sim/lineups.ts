import { FIELD, type Point } from './field';

export type Side = 'offense' | 'defense';

/** +1 attacks toward x = 110, -1 toward x = 0. */
export type Direction = 1 | -1;

export interface PlayerSpot {
  side: Side;
  /** Jersey number, 1-7. Offense and defense with the same number are matched up. */
  number: number;
  pos: Point;
}

const EDGE = 1.5;
const clampToField = (p: Point): Point => ({
  x: Math.min(FIELD.length - EDGE, Math.max(EDGE, p.x)),
  y: Math.min(FIELD.width - EDGE, Math.max(EDGE, p.y)),
});

/**
 * A vertical stack around the disc, guarded by person-to-person defense.
 *
 * `forceSide` is the open side as +1/-1 in y. The marker stands on the other
 * (break) side of the thrower, the reset handler waits behind on the break
 * side, and the stack shifts toward the break side to leave the open side
 * clear for cuts. Offense #1 is the thrower.
 */
export function verticalStack(disc: Point, attackDir: Direction, forceSide: Direction): PlayerSpot[] {
  const offense: Point[] = [
    disc,
    { x: disc.x - attackDir * 5, y: disc.y - forceSide * 6 },
    ...[0, 1, 2, 3, 4].map((i) => ({
      x: disc.x + attackDir * (10 + i * 3.5),
      y: FIELD.width / 2 - forceSide * 4,
    })),
  ].map(clampToField);

  const defense = offense.map((o, i) =>
    i === 0
      ? { x: o.x + attackDir * 1.2, y: o.y - forceSide * 1.3 }
      : { x: o.x + attackDir * 1.3, y: o.y + forceSide * 0.8 },
  );

  return [
    ...offense.map((pos, i) => ({ side: 'offense' as const, number: i + 1, pos })),
    ...defense.map((pos, i) => ({ side: 'defense' as const, number: i + 1, pos: clampToField(pos) })),
  ];
}
