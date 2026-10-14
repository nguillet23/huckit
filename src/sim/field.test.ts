import { describe, expect, it } from 'vitest';
import { BRICK_MARKS, FIELD, GOAL_LINE, isInBounds, isInEndzone } from './field';

describe('field geometry', () => {
  it('has a 70-yard playing field proper between the goal lines', () => {
    expect(GOAL_LINE.right - GOAL_LINE.left).toBe(70);
  });

  it('places brick marks 20 yards from each goal line, centered', () => {
    expect(BRICK_MARKS).toEqual([
      { x: 40, y: 20 },
      { x: 70, y: 20 },
    ]);
  });

  it('treats the perimeter lines as in bounds', () => {
    expect(isInBounds({ x: 0, y: 0 })).toBe(true);
    expect(isInBounds({ x: FIELD.length, y: FIELD.width })).toBe(true);
    expect(isInBounds({ x: 55, y: -0.1 })).toBe(false);
  });

  it('detects the endzones but not the playing field proper', () => {
    expect(isInEndzone({ x: 10, y: 20 })).toBe(true);
    expect(isInEndzone({ x: 100, y: 20 })).toBe(true);
    expect(isInEndzone({ x: 55, y: 20 })).toBe(false);
    expect(isInEndzone({ x: 10, y: 45 })).toBe(false);
  });
});
