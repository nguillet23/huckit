import type { Point } from '../sim/field';
import type { PlayerSpot } from '../sim/lineups';

export const TEAM_COLORS = {
  offense: '#2f6fd6',
  defense: '#d64545',
} as const;

// Dots are drawn larger than a real player's footprint so they read clearly at
// full-field zoom; tightly guarded matchups overlap slightly.
const PLAYER_RADIUS = 1.15;
const DISC_RADIUS = 0.65;

/**
 * Whiteboard-style dots: a filled circle per player with their number. Call after applyCamera.
 * Defenders are drawn first so offensive players stay on top, and every number is
 * drawn after all the circles so overlapping matchups never hide one.
 */
export function drawPlayers(ctx: CanvasRenderingContext2D, players: readonly PlayerSpot[]): void {
  const ordered = [...players].sort((a, b) => Number(a.side === 'offense') - Number(b.side === 'offense'));
  ctx.lineWidth = 0.18;
  ctx.strokeStyle = '#ffffff';
  for (const p of ordered) {
    ctx.beginPath();
    ctx.arc(p.pos.x, p.pos.y, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = TEAM_COLORS[p.side];
    ctx.fill();
    ctx.stroke();
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${PLAYER_RADIUS * 1.25}px system-ui, sans-serif`;
  ctx.fillStyle = '#ffffff';
  for (const p of ordered) ctx.fillText(String(p.number), p.pos.x, p.pos.y + 0.07);
}

const DISC_OFFSET = PLAYER_RADIUS + 0.35;

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
  ctx.ellipse(x + 0.2, y + 0.28, DISC_RADIUS, DISC_RADIUS * 0.7, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, DISC_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 0.12;
  ctx.strokeStyle = '#1d2a1f';
  ctx.stroke();
}
