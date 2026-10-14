import { createDefense, updateDefense, type DefenseAI } from './defense';
import { createPossession, step, type PossessionOptions } from './possession';
import type { GameState } from './types';

/** The simulation always advances in fixed steps, so it behaves the same at any frame rate. */
export const SIM_DT = 1 / 60;

/** A possession plus the CPU defense playing it. */
export interface Game {
  state: GameState;
  defense: DefenseAI;
  /** Real time not yet simulated (less than one SIM_DT). */
  carry: number;
}

export function createGame(opts: PossessionOptions): Game {
  const state = createPossession(opts);
  return { state, defense: createDefense(state.rng), carry: 0 };
}

/** Advance by `seconds` of real time, in fixed SIM_DT steps. */
export function advance(game: Game, seconds: number): void {
  game.carry += seconds;
  while (game.carry >= SIM_DT - 1e-9) {
    updateDefense(game.defense, game.state, SIM_DT);
    step(game.state, SIM_DT);
    game.carry -= SIM_DT;
  }
}
