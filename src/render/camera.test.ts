import { describe, expect, it } from 'vitest';
import { FIELD } from '../sim/field';
import { SKY_ASPECT, skyCamera, VIEW_MARGIN } from './camera';

describe('skyCamera', () => {
  it('fits the field plus margin exactly when the canvas has the Sky aspect ratio', () => {
    const width = 1160;
    const cam = skyCamera(width, width / SKY_ASPECT);
    expect(cam.scale).toBeCloseTo(width / (FIELD.length + 2 * VIEW_MARGIN));
    expect(cam.offsetX).toBeCloseTo(VIEW_MARGIN * cam.scale);
    expect(cam.offsetY).toBeCloseTo(VIEW_MARGIN * cam.scale);
  });

  it('centers the field in a canvas that is too tall', () => {
    const cam = skyCamera(580, 1000);
    const fieldHeight = FIELD.width * cam.scale;
    expect(cam.offsetY).toBeCloseTo((1000 - fieldHeight) / 2);
  });
});
