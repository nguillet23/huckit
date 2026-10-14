import { matchupOf } from '../sim/possession';
import type { GameState } from '../sim/types';
import { applyCamera, type Camera } from './camera';
import { drawField, FIELD_COLORS } from './drawField';
import { drawFlightPath, drawStall, drawThrowerRing } from './drawOverlays';
import { drawDisc, drawPlayers } from './drawPlayers';

/** Draw one frame of a possession in the Sky view. */
export function drawGame(ctx: CanvasRenderingContext2D, state: GameState, cam: Camera, dpr: number): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = FIELD_COLORS.surround;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  applyCamera(ctx, cam, dpr);
  drawField(ctx);

  const { disc, thrower } = state;
  if (disc.flight) drawFlightPath(ctx, disc.flight.from, disc.flight.to);
  if (thrower) drawThrowerRing(ctx, thrower.pos);
  drawPlayers(ctx, state.players);

  if (disc.holder) drawDisc(ctx, disc.pos, { awayFrom: matchupOf(state, disc.holder).pos });
  else drawDisc(ctx, disc.pos, { height: disc.height });

  if (thrower && state.stall > 0) drawStall(ctx, matchupOf(state, thrower).pos, state.stall);
}
