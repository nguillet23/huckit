import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { GameCanvas } from '../components/GameCanvas';
import { describeEvent, TURNOVER_TEXT } from '../content/eventText';
import type { Point } from '../sim/field';
import { createGame, type Game } from '../sim/game';
import type { Direction } from '../sim/lineups';
import { throwTo } from '../sim/possession';
import type { Force, GameState, PossessionResult, SimEvent } from '../sim/types';

/** Clicking within this many yards of a teammate throws to them rather than to the spot. */
const PICK_RADIUS = 2;
const LOG_LENGTH = 8;

interface Hud {
  phase: GameState['phase'];
  stall: number;
  thrower: number | null;
  result: PossessionResult | null;
}

interface LogLine {
  id: number;
  text: string;
}

const hudOf = (s: GameState): Hud => ({
  phase: s.phase,
  stall: s.stall,
  thrower: s.thrower?.number ?? null,
  result: s.result,
});

const sameHud = (a: Hud, b: Hud) =>
  a.phase === b.phase && a.stall === b.stall && a.thrower === b.thrower && a.result === b.result;

function statusText(hud: Hud): string {
  if (hud.result?.kind === 'goal') return 'GOAL! Possession over.';
  if (hud.result?.kind === 'turnover') return `Turnover. ${TURNOVER_TEXT[hud.result.reason]}`;
  if (hud.phase === 'flight') return 'Disc in the air…';
  if (hud.thrower === null) return '';
  return `Blue #${hud.thrower} has the disc${hud.stall > 0 ? `, stall ${hud.stall}` : ''}.`;
}

/**
 * Milestone 1 preview: one live possession against the CPU man defense.
 * Click a teammate (or open grass) to throw; the full controls come in Milestone 2.
 */
export function FieldPreviewPage() {
  const [attackDir, setAttackDir] = useState<Direction>(1);
  const [force, setForce] = useState<Force>('forehand');
  const [paused, setPaused] = useState(false);
  const [hud, setHud] = useState<Hud>({ phase: 'play', stall: 0, thrower: 1, result: null });
  const [log, setLog] = useState<LogLine[]>([]);
  const gameRef = useRef<Game | null>(null);
  const nextLogId = useRef(0);

  const newPossession = useCallback(() => {
    gameRef.current = createGame({ disc: { x: attackDir === 1 ? 35 : 75, y: 24 }, attackDir, force, seed: Date.now() });
    setHud(hudOf(gameRef.current.state));
    setLog([]);
    setPaused(false);
  }, [attackDir, force]);

  useEffect(newPossession, [newPossession]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.target instanceof HTMLButtonElement) return;
      e.preventDefault();
      setPaused((p) => !p);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onFrame = useCallback((state: GameState) => {
    setHud((prev) => {
      const next = hudOf(state);
      return sameHud(prev, next) ? prev : next;
    });
  }, []);

  const onEvents = useCallback((events: SimEvent[]) => {
    const lines = events
      .map(describeEvent)
      .filter((text): text is string => text !== null)
      .map((text) => ({ id: nextLogId.current++, text }));
    if (lines.length) setLog((prev) => [...lines.reverse(), ...prev].slice(0, LOG_LENGTH));
  }, []);

  const onFieldClick = useCallback(
    (point: Point) => {
      const state = gameRef.current?.state;
      if (!state || paused || state.phase !== 'play' || !state.thrower) return;
      const teammate = state.players
        .filter((p) => p.side === 'offense' && p !== state.thrower)
        .map((p) => ({ p, d: Math.hypot(p.pos.x - point.x, p.pos.y - point.y) }))
        .sort((a, b) => a.d - b.d)[0];
      if (teammate && teammate.d <= PICK_RADIUS) throwTo(state, teammate.p.pos, teammate.p);
      else throwTo(state, point);
    },
    [paused],
  );

  return (
    <main className="preview">
      <header className="preview-header">
        <Link to="/">← Back</Link>
        <h1>Field preview</h1>
      </header>

      <div className="status-bar">
        <p className="status" aria-live="polite">
          {statusText(hud)}
        </p>
        <button type="button" onClick={() => setPaused((p) => !p)} disabled={hud.phase === 'over'}>
          {paused ? 'Resume' : 'Pause'} <kbd>Space</kbd>
        </button>
        <button type="button" onClick={newPossession}>
          New possession
        </button>
      </div>

      <GameCanvas
        game={gameRef}
        paused={paused}
        onFrame={onFrame}
        onEvents={onEvents}
        onFieldClick={onFieldClick}
        label={`Live possession: Blue attacking ${attackDir === 1 ? 'right' : 'left'} against Red's man defense forcing ${force}.`}
      />

      <p className="preview-note">
        Click a blue teammate to throw to them, or click open grass to throw to space. Watch the red marker count the
        stall, and the defenders chase the throw.
      </p>

      <div className="preview-controls">
        <fieldset>
          <legend>Blue attacks</legend>
          <button type="button" aria-pressed={attackDir === -1} onClick={() => setAttackDir(-1)}>
            ← Left
          </button>
          <button type="button" aria-pressed={attackDir === 1} onClick={() => setAttackDir(1)}>
            Right →
          </button>
        </fieldset>
        <fieldset>
          <legend>Red forces</legend>
          <button type="button" aria-pressed={force === 'forehand'} onClick={() => setForce('forehand')}>
            Forehand
          </button>
          <button type="button" aria-pressed={force === 'backhand'} onClick={() => setForce('backhand')}>
            Backhand
          </button>
        </fieldset>
      </div>

      <section className="log">
        <h2>Play-by-play</h2>
        {log.length === 0 ? (
          <p className="preview-note">Nothing yet. Make a throw!</p>
        ) : (
          <ol>
            {log.map((line) => (
              <li key={line.id}>{line.text}</li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
