/**
 * The relations the round-4 group B college pictures draw and the harness checks (HC96,
 * HC100, HC102, HC106, HC107, HC108, HC171). Pure: formula units in, numbers out.
 */
import { dot3, scale3, sub3, type V3 } from './vectorSpace';

const RAD = Math.PI / 180;

/** proj_v u = (u·v ÷ v·v)v and the part of u square to v (undefined for v = 0). */
export function projectOf(u: V3, v: V3) {
  const dot = dot3(u, v);
  const vv = dot3(v, v);
  if (!(vv > 0)) return undefined;
  const k = dot / vv;
  const proj = scale3(v, k);
  return { dot, vv, k, proj, perp: sub3(u, proj) };
}

/** The balance point of point masses: M = Σm, x = Σmx ÷ M, y = Σmy ÷ M. */
export function centerOf(ms: { m: number; x: number; y: number }[]) {
  const M = ms.reduce((s, p) => s + p.m, 0);
  if (!(M > 0)) return undefined;
  return {
    M,
    x: ms.reduce((s, p) => s + p.m * p.x, 0) / M,
    y: ms.reduce((s, p) => s + p.m * p.y, 0) / M,
  };
}

/** A force's direction in degrees from +x: its own, or from its angle to the horizontal. */
export function forceDirection(
  f: { left?: boolean; down?: boolean },
  direction: number | undefined,
  level: number,
) {
  if (direction !== undefined) return direction;
  const base = f.left ? 180 - level : level;
  return f.down ? -base : base;
}

/** A vector's parts from its size and direction (degrees). */
export const partsOf = (size: number, deg: number) => ({
  x: size * Math.cos(deg * RAD),
  y: size * Math.sin(deg * RAD),
});

/** A direction in degrees from 0° up to 360°. */
export const headingOf = (x: number, y: number) => {
  const d = Math.atan2(y, x) / RAD;
  return d < 0 ? d + 360 : d;
};

/** The acute angle a direction makes with the horizontal (0–90°). */
export const fromLevel = (deg: number) => {
  const d = ((deg % 180) + 180) % 180;
  return d > 90 ? 180 - d : d;
};

/** The vector model of L: |L| = √(ℓ(ℓ + 1)), cos θ = m ÷ |L|, 2ℓ + 1 states (in ħ). */
export function coneOf(l: number, m: number) {
  const size = Math.sqrt(Math.max(0, l * (l + 1)));
  const cos = size > 0 ? Math.max(-1, Math.min(1, m / size)) : 1;
  return {
    size,
    theta: Math.acos(cos) / RAD,
    states: 2 * l + 1,
    /** The radius of the cone's rim, where L_x and L_y spread. */
    rim: Math.sqrt(Math.max(0, size * size - m * m)),
  };
}

/** Rolling without slipping from a drop h: v = √(2gh ÷ (1 + c)), ω = v/r, K_t, K_r = cK_t. */
export function rollingOf(c: number, m: number, r: number, h: number, g: number) {
  const v = Math.sqrt(Math.max(0, (2 * g * h) / (1 + c)));
  const kt = 0.5 * m * v * v;
  return { v, w: r > 0 ? v / r : NaN, kt, kr: c * kt, total: m * g * h };
}

/** A uniform rod about an axis d from its center: I_cm = ML²/12, I = I_cm + Md². */
export function rodOf(M: number, L: number, d: number) {
  const icm = (M * L * L) / 12;
  return { icm, shift: M * d * d, I: icm + M * d * d };
}

/** A gyroscope: L = Iω, τ = mgr, Ω = τ/L, T_p = 2π/Ω (I = ½mR² unless given). */
export function precessionOf(
  m: number,
  R: number,
  omega: number,
  r: number,
  g: number,
  I?: number,
) {
  const inertia = I ?? 0.5 * m * R * R;
  const L = inertia * omega;
  const tau = m * g * r;
  const rate = L !== 0 ? tau / L : NaN;
  return { I: inertia, L, tau, rate, period: rate > 0 ? (2 * Math.PI) / rate : NaN };
}

/** A thin a × b plate: I₁ = Mb²/12 (axis along a), I₂ = Ma²/12 (along b), I₃ = I₁ + I₂. */
export function plateOf(M: number, a: number, b: number) {
  const i1 = (M * b * b) / 12;
  const i2 = (M * a * a) / 12;
  return { i1, i2, i3: i1 + i2 };
}
