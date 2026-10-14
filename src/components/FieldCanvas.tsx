import { useEffect, useRef } from 'react';
import type { Point } from '../sim/field';
import type { PlayerSpot } from '../sim/lineups';
import { applyCamera, SKY_ASPECT, skyCamera } from '../render/camera';
import { drawField, FIELD_COLORS } from '../render/drawField';
import { drawDisc, drawPlayers } from '../render/drawPlayers';

/** The field canvas may use up to this fraction of the window's height. */
const VIEWPORT_SHARE = 0.75;

function nearestDefender(players: readonly PlayerSpot[], p: Point): Point | undefined {
  let best: Point | undefined;
  let bestD = Infinity;
  for (const s of players) {
    if (s.side !== 'defense') continue;
    const d = Math.hypot(s.pos.x - p.x, s.pos.y - p.y);
    if (d < bestD) {
      bestD = d;
      best = s.pos;
    }
  }
  return best;
}

interface FieldCanvasProps {
  players: readonly PlayerSpot[];
  disc: Point;
  label: string;
}

/** Sky view of the field. Redraws when its props change or its container resizes. */
export function FieldCanvas({ players, disc, label }: FieldCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wrap || !canvas || !ctx) return;

    const draw = () => {
      // As wide as the container allows, but no taller than VIEWPORT_SHARE of the window.
      const width = Math.min(wrap.clientWidth, window.innerHeight * VIEWPORT_SHARE * SKY_ASPECT);
      const height = width / SKY_ASPECT;
      const dpr = window.devicePixelRatio || 1;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = FIELD_COLORS.surround;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      applyCamera(ctx, skyCamera(width, height), dpr);
      drawField(ctx);
      drawPlayers(ctx, players);
      drawDisc(ctx, disc, nearestDefender(players, disc));
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(wrap);
    window.addEventListener('resize', draw);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', draw);
    };
  }, [players, disc]);

  return (
    <div ref={wrapRef} className="field-canvas">
      <canvas ref={canvasRef} role="img" aria-label={label} />
    </div>
  );
}
