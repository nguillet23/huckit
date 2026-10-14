import type { Player } from './types';

/** Yards per second, per second. Players can't change velocity instantly. */
export const ACCEL = 16;

/** Accelerate toward the player's target, slowing down on arrival. */
export function movePlayer(p: Player, dt: number): void {
  const dx = p.target.x - p.pos.x;
  const dy = p.target.y - p.pos.y;
  const d = Math.hypot(dx, dy);

  let vx = 0;
  let vy = 0;
  if (d > 0.05) {
    const speed = Math.min(p.maxSpeed, d * 3);
    vx = (dx / d) * speed;
    vy = (dy / d) * speed;
  }

  const ax = vx - p.vel.x;
  const ay = vy - p.vel.y;
  const a = Math.hypot(ax, ay);
  const maxA = ACCEL * dt;
  if (a > maxA) {
    p.vel.x += (ax / a) * maxA;
    p.vel.y += (ay / a) * maxA;
  } else {
    p.vel.x = vx;
    p.vel.y = vy;
  }

  p.pos.x += p.vel.x * dt;
  p.pos.y += p.vel.y * dt;
}
