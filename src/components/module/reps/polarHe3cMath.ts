/**
 * HC53 (college round 3, group C): the polar grid's swept areas, annular regions, tangent
 * slopes and a path's traced length. Pure, so the harness checks use them too. θ in degrees.
 */
import type { ParametricPath, PolarCurve } from '@/data/modules/typesHsd';

import { pathAt, polarR } from './polar';

const RAD = Math.PI / 180;
type Numbers = Record<string, number>;

/** A = ½∫ r² dθ from `from` to `to` (degrees), by Simpson's rule on 720 strips. */
export function polarArea(c: PolarCurve, v: Numbers, from: number, to: number): number {
  const n = 720;
  const h = ((to - from) * RAD) / n;
  let s = 0;
  for (let i = 0; i <= n; i++) {
    const r = polarR(c, v, from + ((to - from) * i) / n);
    s += r * r * (i === 0 || i === n ? 1 : i % 2 ? 4 : 2);
  }
  return (0.5 * (s * h)) / 3;
}

/** An annular sector's area, ½(β − α)(r₂² − r₁²), angles in degrees. */
export const regionArea = (r1: number, r2: number, from: number, to: number) =>
  0.5 * (to - from) * RAD * (r2 * r2 - r1 * r1);

/**
 * The tangent at θ: r, r′ (per radian), the direction (dx/dθ, dy/dθ) and the slope dy/dx
 * (undefined when the tangent is vertical).
 */
export function polarTangent(c: PolarCurve, v: Numbers, deg: number) {
  const r = polarR(c, v, deg);
  const e = 1e-4;
  const dr = (polarR(c, v, deg + e) - polarR(c, v, deg - e)) / (2 * e * RAD);
  const t = deg * RAD;
  const dx = dr * Math.cos(t) - r * Math.sin(t);
  const dy = dr * Math.sin(t) + r * Math.cos(t);
  const scale = Math.max(1, Math.abs(r), Math.abs(dr));
  return { r, dr, dx, dy, slope: Math.abs(dx) < 1e-9 * scale ? undefined : dy / dx };
}

/** The length of a path from t₀ to t₁, summed over 4000 chords. */
export function pathLength(p: ParametricPath, v: Numbers, t0: number, t1: number): number {
  const n = 4000;
  let s = 0;
  let a = pathAt(p, v, t0);
  for (let i = 1; i <= n; i++) {
    const b = pathAt(p, v, t0 + ((t1 - t0) * i) / n);
    s += Math.hypot(b.x - a.x, b.y - a.y);
    a = b;
  }
  return s;
}
