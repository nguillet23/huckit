/**
 * Field geometry for USA Ultimate, in yards.
 *
 * x runs along the length (0..110) and y across the width (0..40).
 * The endzones are x 0..20 and x 90..110.
 */

export interface Point {
  x: number;
  y: number;
}

export const FIELD = {
  length: 110,
  width: 40,
  endzoneDepth: 20,
  /** Brick marks sit this far from each goal line, toward midfield. */
  brickDistance: 20,
} as const;

export const GOAL_LINE = {
  left: FIELD.endzoneDepth,
  right: FIELD.length - FIELD.endzoneDepth,
} as const;

export const BRICK_MARKS: readonly Point[] = [
  { x: GOAL_LINE.left + FIELD.brickDistance, y: FIELD.width / 2 },
  { x: GOAL_LINE.right - FIELD.brickDistance, y: FIELD.width / 2 },
];

export function isInBounds(p: Point): boolean {
  return p.x >= 0 && p.x <= FIELD.length && p.y >= 0 && p.y <= FIELD.width;
}

export function isInEndzone(p: Point): boolean {
  return isInBounds(p) && (p.x < GOAL_LINE.left || p.x > GOAL_LINE.right);
}
