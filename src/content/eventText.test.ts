import { describe, expect, it } from 'vitest';
import { describeEvent } from './eventText';

describe('describeEvent', () => {
  it('describes completions with the yards gained', () => {
    expect(describeEvent({ type: 'completion', time: 1, from: 1, to: 3, gain: 12, isBreak: false })).toBe(
      '#1 → #3, 12 yd gain',
    );
    expect(describeEvent({ type: 'completion', time: 1, from: 3, to: 2, gain: -4, isBreak: true })).toBe(
      '#3 → #2, 4 yd back (break throw!)',
    );
  });

  it('explains the rule behind a turnover', () => {
    expect(describeEvent({ type: 'turnover', time: 9, reason: 'stall', at: { x: 30, y: 20 } })).toMatch(/counted to 10/);
  });

  it('skips throws, since the catch or turnover tells the story', () => {
    expect(describeEvent({ type: 'throw', time: 1, from: 1, to: 3, distance: 12, isBreak: false })).toBeNull();
  });
});
