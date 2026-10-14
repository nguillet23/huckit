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

/** How far up the screen a yard of height lifts the disc, to sell the arc of a throw. */
const HEIGHT_LIFT = 0.45;

interface DiscDrawOptions {
  /** The disc is held: draw it just off the holder's hand, on the far side from this point (the marker). */
  awayFrom?: Point;
  /** The disc is in the air at this height (yards): lift it off its ground shadow. */
  height?: number;
}

/** The disc with its shadow on the ground. */
export function drawDisc(ctx: CanvasRenderingContext2D, pos: Point, opts: DiscDrawOptions = {}): void {
  let x = pos.x;
  let y = pos.y;
  let shadowX = x + 0.2;
  let shadowY = y + 0.28;
  if (opts.awayFrom) {
    const len = Math.hypot(pos.x - opts.awayFrom.x, pos.y - opts.awayFrom.y) || 1;
    x += ((pos.x - opts.awayFrom.x) / len) * DISC_OFFSET;
    y += ((pos.y - opts.awayFrom.y) / len) * DISC_OFFSET;
    shadowX = x + 0.2;
    shadowY = y + 0.28;
  } else if (opts.height) {
    shadowX = pos.x;
    shadowY = pos.y;
    y -= opts.height * HEIGHT_LIFT;
  }

  ctx.beginPath();
  ctx.ellipse(shadowX, shadowY, DISC_RADIUS, DISC_RADIUS * 0.7, 0, 0, Math.PI * 2);
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
