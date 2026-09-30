/**
 * The physics behind the group HK pictures (Grades 9–12), shared by the pictures and the
 * harness checks. SI units: m, s, m/s, kg, N; angles in degrees.
 */

export const G_EARTH = 9.8;

/** Launch components, flight time, range and top of a projectile (SI; θ in degrees). */
export function projectileOf(v: number, deg: number, h: number, g = G_EARTH) {
  const vx = v * Math.cos((deg * Math.PI) / 180);
  const vy = v * Math.sin((deg * Math.PI) / 180);
  const T = (vy + Math.sqrt(Math.max(0, vy * vy + 2 * g * h))) / g;
  return { vx, vy, T, R: vx * T, H: vy > 0 ? h + (vy * vy) / (2 * g) : h };
}
