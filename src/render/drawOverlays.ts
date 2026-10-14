import type { Point } from '../sim/field';

const STALL_WARNING = 7;

/** A ring around whoever has the disc. Call after applyCamera. */
export function drawThrowerRing(ctx: CanvasRenderingContext2D, pos: Point): void {
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 1.75, 0, Math.PI * 2);
  ctx.lineWidth = 0.22;
  ctx.strokeStyle = '#ffd84d';
  ctx.stroke();
}

/** The marker's stall count in a bubble above them; it turns red as time runs out. */
export function drawStall(ctx: CanvasRenderingContext2D, markerPos: Point, stall: number): void {
  const text = `Stall ${stall}`;
  ctx.font = '700 1.1px system-ui, sans-serif';
  const width = ctx.measureText(text).width + 1;
  const height = 1.6;
  const x = markerPos.x - width / 2;
  const y = markerPos.y - 3.1;

  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 0.4);
  ctx.fillStyle = stall >= STALL_WARNING ? '#d64545' : 'rgba(17, 22, 17, 0.85)';
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, markerPos.x, y + height / 2 + 0.05);
}

/** A faint dashed line showing where a throw is headed. */
export function drawFlightPath(ctx: CanvasRenderingContext2D, from: Point, to: Point): void {
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.setLineDash([0.8, 0.6]);
  ctx.lineWidth = 0.15;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.stroke();
  ctx.setLineDash([]);
}
