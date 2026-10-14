import { BRICK_MARKS, FIELD, GOAL_LINE } from '../sim/field';

export const FIELD_COLORS = {
  surround: '#2f6b37',
  grassLight: '#3f8f49',
  grassDark: '#3a8644',
  endzoneTint: 'rgba(255, 255, 255, 0.07)',
  line: 'rgba(255, 255, 255, 0.92)',
} as const;

const STRIPE = 5;
const LINE_WIDTH = 0.25;
const BRICK_SIZE = 0.7;

/** Draws the field in yard coordinates; call after applyCamera. */
export function drawField(ctx: CanvasRenderingContext2D): void {
  for (let x = 0; x < FIELD.length; x += STRIPE) {
    ctx.fillStyle = (x / STRIPE) % 2 === 0 ? FIELD_COLORS.grassLight : FIELD_COLORS.grassDark;
    ctx.fillRect(x, 0, STRIPE, FIELD.width);
  }

  ctx.fillStyle = FIELD_COLORS.endzoneTint;
  ctx.fillRect(0, 0, GOAL_LINE.left, FIELD.width);
  ctx.fillRect(GOAL_LINE.right, 0, FIELD.length - GOAL_LINE.right, FIELD.width);

  ctx.strokeStyle = FIELD_COLORS.line;
  ctx.lineWidth = LINE_WIDTH;
  ctx.strokeRect(0, 0, FIELD.length, FIELD.width);
  for (const x of [GOAL_LINE.left, GOAL_LINE.right]) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, FIELD.width);
    ctx.stroke();
  }

  ctx.lineWidth = LINE_WIDTH * 0.8;
  for (const b of BRICK_MARKS) {
    ctx.beginPath();
    ctx.moveTo(b.x - BRICK_SIZE, b.y - BRICK_SIZE);
    ctx.lineTo(b.x + BRICK_SIZE, b.y + BRICK_SIZE);
    ctx.moveTo(b.x + BRICK_SIZE, b.y - BRICK_SIZE);
    ctx.lineTo(b.x - BRICK_SIZE, b.y + BRICK_SIZE);
    ctx.stroke();
  }
}
