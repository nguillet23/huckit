import { useEffect, useRef, type PointerEvent, type RefObject } from 'react';
import { screenToField, SKY_ASPECT, skyCamera, type Camera } from '../render/camera';
import { drawGame } from '../render/drawGame';
import type { Point } from '../sim/field';
import { advance, type Game } from '../sim/game';
import { drainEvents } from '../sim/possession';
import type { GameState, SimEvent } from '../sim/types';

/** The field canvas may use up to this fraction of the window's height. */
const VIEWPORT_SHARE = 0.75;
/** Longest real-time step simulated in one frame, so a background tab doesn't fast-forward. */
const MAX_FRAME = 0.05;

interface GameCanvasProps {
  /** The running game. Swap `game.current` to start a new possession. */
  game: RefObject<Game | null>;
  paused: boolean;
  /** Called every frame; keep it cheap and only update React state when something changed. */
  onFrame: (state: GameState) => void;
  onEvents: (events: SimEvent[]) => void;
  onFieldClick: (point: Point) => void;
  label: string;
}

/**
 * Runs the game loop and draws the Sky view. The simulation lives in a ref,
 * not React state: each animation frame steps it and redraws the canvas
 * directly, and React only hears about it through the callbacks.
 */
export function GameCanvas({ game, paused, onFrame, onEvents, onFieldClick, label }: GameCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<Camera>(skyCamera(1, 1));
  const latest = useRef({ paused, onFrame, onEvents });

  useEffect(() => {
    latest.current = { paused, onFrame, onEvents };
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wrap || !canvas || !ctx) return;

    let dpr = 1;
    const resize = () => {
      const width = Math.min(wrap.clientWidth, window.innerHeight * VIEWPORT_SHARE * SKY_ASPECT);
      const height = width / SKY_ASPECT;
      dpr = window.devicePixelRatio || 1;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      cameraRef.current = skyCamera(width, height);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    window.addEventListener('resize', resize);

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(MAX_FRAME, (now - last) / 1000);
      last = now;
      const g = game.current;
      if (g) {
        if (!latest.current.paused) advance(g, dt);
        const events = drainEvents(g.state);
        if (events.length) latest.current.onEvents(events);
        latest.current.onFrame(g.state);
        drawGame(ctx, g.state, cameraRef.current, dpr);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [game]);

  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onFieldClick(screenToField(cameraRef.current, e.clientX - rect.left, e.clientY - rect.top));
  };

  return (
    <div ref={wrapRef} className="field-canvas">
      <canvas ref={canvasRef} role="img" aria-label={label} onPointerDown={handlePointerDown} />
    </div>
  );
}
