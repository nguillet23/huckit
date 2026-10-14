import type { SimEvent, TurnoverReason } from '../sim/types';

export const TURNOVER_TEXT: Record<TurnoverReason, string> = {
  drop: "Dropped: the receiver got a hand on it but didn't catch it.",
  incomplete: 'Incomplete: the disc hit the ground with no one there.',
  block: 'Blocked: a defender got to the disc first.',
  interception: 'Intercepted by the defense!',
  handblock: 'Handblock: the marker blocked it right out of the thrower’s hand.',
  out: 'Out of bounds: the disc landed out.',
  caught_out: 'Caught out of bounds: a receiver has to land in bounds.',
  stall: 'Stalled: the marker counted to 10 before the throw.',
};

/** One line for the play-by-play log, or null for events not worth a line. */
export function describeEvent(e: SimEvent): string | null {
  switch (e.type) {
    case 'throw':
      return null;
    case 'completion': {
      const gain = e.gain >= 0 ? `${e.gain} yd gain` : `${-e.gain} yd back`;
      return `#${e.from} → #${e.to}, ${gain}${e.isBreak ? ' (break throw!)' : ''}`;
    }
    case 'goal':
      return `GOAL! #${e.scorer} scores.`;
    case 'turnover':
      return `Turnover. ${TURNOVER_TEXT[e.reason]}`;
  }
}
