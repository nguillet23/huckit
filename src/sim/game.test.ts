import { describe, expect, it } from 'vitest';
import { advance, createGame, SIM_DT } from './game';

const newGame = () => createGame({ disc: { x: 30, y: 20 }, attackDir: 1, force: 'forehand', rng: () => 0.5 });

describe('advance', () => {
  it('simulates exactly the elapsed time in fixed steps', () => {
    const game = newGame();
    advance(game, 0.5);
    expect(game.state.time).toBeCloseTo(0.5, 6);
  });

  it('gives the same result for uneven frame times as for one big step', () => {
    const smooth = newGame();
    const choppy = newGame();
    advance(smooth, 2);
    for (const dt of [0.007, 0.033, 0.016, 0.05, 0.011]) {
      for (let i = 0; i < 10; i++) advance(choppy, dt * (2 / 1.17));
    }
    expect(choppy.state.time).toBeCloseTo(smooth.state.time, 1);
    expect(choppy.state.stall).toBe(smooth.state.stall);
  });

  it('carries time shorter than one step over to the next call', () => {
    const game = newGame();
    advance(game, SIM_DT / 2);
    expect(game.state.time).toBe(0);
    advance(game, SIM_DT / 2);
    expect(game.state.time).toBeCloseTo(SIM_DT, 9);
  });

  it('runs the CPU defense: the marker counts a stall on an idle thrower', () => {
    const game = newGame();
    advance(game, 11);
    expect(game.state.result).toEqual({ kind: 'turnover', reason: 'stall' });
  });
});
