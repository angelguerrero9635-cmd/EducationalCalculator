/**
 * HC67 (college round 3, group C): the product rule's growing rectangle and a circle's area
 * under the arc and tangent. Pure, so the harness checks use them too.
 */

/** (uv)′ = u′v + uv′. */
export const productRate = (u: number, v: number, du: number, dv: number) => du * v + u * dv;

/** (u/v)′ = (u′v − uv′) ÷ v² (undefined at v = 0). */
export const quotientRate = (u: number, v: number, du: number, dv: number) =>
  v === 0 ? undefined : (du * v - u * dv) / (v * v);

/**
 * Under the circle's upper arc from its center's x to `b` across (0 ≤ b ≤ r): the arc's height
 * there, θ = sin⁻¹(b ÷ r) from the vertical radius, the triangle ½·b·y, the sector ½r²θ, and
 * their sum, ∫ from 0 to b of √(r² − x²) dx.
 */
export function underArc(r: number, b: number) {
  const y = Math.sqrt(Math.max(0, r * r - b * b));
  const theta = Math.asin(Math.max(-1, Math.min(1, b / r)));
  const triangle = (b * y) / 2;
  const sector = (r * r * theta) / 2;
  return { y, theta, triangle, sector, integral: triangle + sector };
}

/**
 * The tangent to a circle centered (h, k) at (x₀, y₀): square to the radius, slope
 * −(x₀ − h) ÷ (y₀ − k) (undefined where it is vertical) and its y-intercept.
 */
export function circleTangent(h: number, k: number, x0: number, y0: number) {
  if (Math.abs(y0 - k) < 1e-12) return { slope: undefined, intercept: undefined };
  const slope = -(x0 - h) / (y0 - k);
  return { slope, intercept: y0 - slope * x0 };
}
