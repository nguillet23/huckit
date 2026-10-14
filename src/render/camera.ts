import { FIELD } from '../sim/field';

/** Grass shown around the field so the sidelines aren't flush with the canvas edge, in yards. */
export const VIEW_MARGIN = 3;

/** Width / height of the Sky view, for sizing its canvas. */
export const SKY_ASPECT = (FIELD.length + 2 * VIEW_MARGIN) / (FIELD.width + 2 * VIEW_MARGIN);

/** Maps field yards to CSS pixels: screen = offset + yards * scale. */
export interface Camera {
  scale: number;
  offsetX: number;
  offsetY: number;
}

/** The whole field from straight above, centered and fit to the canvas. */
export function skyCamera(width: number, height: number): Camera {
  const scale = Math.min(width / (FIELD.length + 2 * VIEW_MARGIN), height / (FIELD.width + 2 * VIEW_MARGIN));
  return {
    scale,
    offsetX: (width - FIELD.length * scale) / 2,
    offsetY: (height - FIELD.width * scale) / 2,
  };
}

/** After this, drawing calls take coordinates in yards. */
export function applyCamera(ctx: CanvasRenderingContext2D, cam: Camera, dpr: number): void {
  ctx.setTransform(cam.scale * dpr, 0, 0, cam.scale * dpr, cam.offsetX * dpr, cam.offsetY * dpr);
}
