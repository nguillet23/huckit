import type { Point } from './field';
import type { Direction, Side } from './lineups';
import type { Rng } from './rng';

export type Force = 'forehand' | 'backhand';

export interface Player {
  side: Side;
  /** Jersey number, 1-7. Offense and defense with the same number are matched up. */
  number: number;
  pos: Point;
  vel: Point;
  /** Where the player is running to. Set by commands and AI; ignored for the thrower (pivot). */
  target: Point;
  /** Yards per second this player will run at toward their target. */
  maxSpeed: number;
}

/** play: someone holds the disc. flight: a throw is in the air. over: the possession ended. */
export type Phase = 'play' | 'flight' | 'over';

export interface Flight {
  from: Point;
  to: Point;
  elapsed: number;
  duration: number;
  maxHeight: number;
  thrower: Player;
  receiver: Player;
  isBreak: boolean;
  /** Decided at release: the marker gets a hand on it just after it leaves the thrower's hand. */
  markBlock: boolean;
  /** Defenders who already had their one chance to block this throw mid-flight. */
  checked: Set<Player>;
}

export interface Disc {
  pos: Point;
  /** Yards above the ground, for drawing. */
  height: number;
  holder: Player | null;
  flight: Flight | null;
}

export type TurnoverReason =
  | 'drop'
  | 'incomplete'
  | 'block'
  | 'interception'
  | 'handblock'
  | 'out'
  | 'caught_out'
  | 'stall';

export type SimEvent =
  | { type: 'throw'; time: number; from: number; to: number; distance: number; isBreak: boolean }
  | { type: 'completion'; time: number; from: number; to: number; gain: number; isBreak: boolean }
  | { type: 'goal'; time: number; scorer: number }
  | { type: 'turnover'; time: number; reason: TurnoverReason; at: Point; defender?: number };

export type PossessionResult = { kind: 'goal' } | { kind: 'turnover'; reason: TurnoverReason };

export interface GameState {
  time: number;
  phase: Phase;
  attackDir: Direction;
  /** The force the CPU defense is playing. */
  force: Force;
  players: Player[];
  disc: Disc;
  /** The offensive player holding the disc during `play`; null otherwise. */
  thrower: Player | null;
  /** Current stall count; 0 until the marker is in range. */
  stall: number;
  /** Seconds since the last stall count. */
  stallClock: number;
  /** Events since the UI last drained them. */
  events: SimEvent[];
  result: PossessionResult | null;
  rng: Rng;
}
