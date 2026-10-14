import { describe, expect, it } from 'vitest';
import { FIELD } from '../sim/field';
import { screenToField, SKY_ASPECT, skyCamera, VIEW_MARGIN } from './camera';

describe('skyCamera', () => {
  it('fits the field plus margin exactly when the canvas has the Sky aspect ratio', () => {
    const width = 1160;
    const cam = skyCamera(width, width / SKY_ASPECT);
    expect(cam.scale).toBeCloseTo(width / (FIELD.length + 2 * VIEW_MARGIN));
    expect(cam.offsetX).toBeCloseTo(VIEW_MARGIN * cam.scale);
    expect(cam.offsetY).toBeCloseTo(VIEW_MARGIN * cam.scale);
  });

  it('maps a click back to the field point drawn there', () => {
    const cam = skyCamera(1160, 1160 / SKY_ASPECT);
    const fieldPoint = { x: 42, y: 13 };
    const screen = { x: cam.offsetX + fieldPoint.x * cam.scale, y: cam.offsetY + fieldPoint.y * cam.scale };
    const back = screenToField(cam, screen.x, screen.y);
    expect(back.x).toBeCloseTo(42);
    expect(back.y).toBeCloseTo(13);
  });

  it('centers the field in a canvas that is too tall', () => {
    const cam = skyCamera(580, 1000);
    const fieldHeight = FIELD.width * cam.scale;
    expect(cam.offsetY).toBeCloseTo((1000 - fieldHeight) / 2);
  });
});
