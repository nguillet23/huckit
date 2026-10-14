import type { Point } from '../sim/field';
import type { PlayerSpot } from '../sim/lineups';

export const TEAM_COLORS = {
  offense: '#2f6fd6',
  defense: '#d64545',
} as const;

const PLAYER_RADIUS = 0.85;
const DISC_RADIUS = 0.45;

/** Whiteboard-style dots: a filled circle per player with their number. Call after applyCamera. */
export function drawPlayers(ctx: CanvasRenderingContext2D, players: readonly PlayerSpot[]): void {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 1px system-ui, sans-serif';
  for (const p of players) {
    ctx.beginPath();
    ctx.arc(p.pos.x, p.pos.y, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = TEAM_COLORS[p.side];
    ctx.fill();
    ctx.lineWidth = 0.15;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(String(p.number), p.pos.x, p.pos.y + 0.05);
  }
}

const DISC_OFFSET = 1.0;

/**
 * The disc, drawn just off the holder's hand with a small shadow. Pass `awayFrom`
 * (usually the marker) to keep the disc on the holder's far side so it isn't hidden.
 */
export function drawDisc(ctx: CanvasRenderingContext2D, pos: Point, awayFrom?: Point): void {
  let dx = 0.7;
  let dy = -0.7;
  if (awayFrom) {
    const len = Math.hypot(pos.x - awayFrom.x, pos.y - awayFrom.y) || 1;
    dx = ((pos.x - awayFrom.x) / len) * DISC_OFFSET;
    dy = ((pos.y - awayFrom.y) / len) * DISC_OFFSET;
  }
  const x = pos.x + dx;
  const y = pos.y + dy;
  ctx.beginPath();
  ctx.ellipse(x + 0.15, y + 0.2, DISC_RADIUS, DISC_RADIUS * 0.7, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, DISC_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 0.08;
  ctx.strokeStyle = '#1d2a1f';
  ctx.stroke();
}
