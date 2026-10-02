/**
 * The arithmetic behind the oscillator's college options (HC11, OscillatorHe.tsx): a damped
 * free vibration in each regime, the forced response and transmissibility, and the two modes
 * of two coupled masses. SI units. Shared by the picture and its harness check.
 */

export type Regime = 'under' | 'critical' | 'over' | 'none';

export interface Free {
  wn: number;
  zeta: number;
  /** ω_d (underdamped), else 0. */
  wd: number;
  regime: Regime;
  x: (t: number) => number;
  /** The envelope amplitude X e^(−ζω_n t) (underdamped and undamped), else undefined. */
  envelope?: (t: number) => number;
  /** Times of the crests (maxima of x), the first `n` of them (underdamped and undamped). */
  crests: (n: number) => number[];
}

/** m x″ + c x′ + k x = 0 from x(0) = x₀, x′(0) = v₀. */
export function freeVibration(m: number, c: number, k: number, x0: number, v0: number): Free {
  const wn = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(k * m));
  const a = -c / (2 * m);
  if (c === 0 || zeta < 1 - 1e-9) {
    const wd = wn * Math.sqrt(1 - zeta * zeta);
    const C1 = x0;
    const C2 = (v0 - a * x0) / wd;
    const X = Math.hypot(C1, C2);
    // x = X e^(at) cos(wd t − θ); its maxima sit where the derivative is 0.
    const theta = Math.atan2(C2, C1);
    const lead = Math.atan2(-a, wd);
    return {
      wn,
      zeta,
      wd,
      regime: c === 0 ? 'none' : 'under',
      x: (t) => Math.exp(a * t) * (C1 * Math.cos(wd * t) + C2 * Math.sin(wd * t)),
      envelope: (t) => X * Math.exp(a * t),
      crests: (n) => {
        // x′ = 0 where wd t − θ = −lead + 2πj (a maximum).
        const first = (theta - lead) / wd;
        const step = (2 * Math.PI) / wd;
        const t0 = first - Math.floor(first / step) * step;
        return Array.from({ length: n }, (_, j) => t0 + j * step);
      },
    };
  }
  if (Math.abs(zeta - 1) <= 1e-9) {
    const C2 = v0 + wn * x0;
    return {
      wn,
      zeta,
      wd: 0,
      regime: 'critical',
      x: (t) => (x0 + C2 * t) * Math.exp(-wn * t),
      crests: () => [],
    };
  }
  const s = wn * Math.sqrt(zeta * zeta - 1);
  const [r1, r2] = [a + s, a - s];
  const C2 = (v0 - r1 * x0) / (r2 - r1);
  const C1 = x0 - C2;
  return {
    wn,
    zeta,
    wd: 0,
    regime: 'over',
    x: (t) => C1 * Math.exp(r1 * t) + C2 * Math.exp(r2 * t),
    crests: () => [],
  };
}

/** The forced response's magnification X ÷ δ_st and phase lag (rad, 0 to π) at r = ω/ω_n. */
export function forced(r: number, zeta: number) {
  const mag = 1 / Math.sqrt((1 - r * r) ** 2 + (2 * zeta * r) ** 2);
  const lag = Math.atan2(2 * zeta * r, 1 - r * r);
  return { mag, lag };
}

/** Transmissibility at r = ω/ω_n. */
export const transmissibility = (r: number, zeta: number) =>
  Math.sqrt(1 + (2 * zeta * r) ** 2) / Math.sqrt((1 - r * r) ** 2 + (2 * zeta * r) ** 2);

/**
 * The two modes of m₁ and m₂ on springs k₁ (wall–m₁), k₂ (between) and k₃ (m₂–wall; 0 for a
 * free end): K = [k₁ + k₂, −k₂; −k₂, k₂ + k₃], M = diag(m₁, m₂). ω² are the roots of
 * det(K − ω²M) = 0; each mode's ratio x₂/x₁ = (k₁ + k₂ − m₁ω²) ÷ k₂.
 */
export function twoModes(m1: number, m2: number, k1: number, k2: number, k3: number) {
  const a = m1 * m2;
  const b = -(m1 * (k2 + k3) + m2 * (k1 + k2));
  const c = (k1 + k2) * (k2 + k3) - k2 * k2;
  const disc = Math.max(0, b * b - 4 * a * c);
  const w2 = [(-b - Math.sqrt(disc)) / (2 * a), (-b + Math.sqrt(disc)) / (2 * a)] as const;
  const w = w2.map((x) => Math.sqrt(Math.max(0, x))) as unknown as [number, number];
  const ratios = w2.map((x) => (k1 + k2 - m1 * x) / k2) as unknown as [number, number];
  /** det(K − ω²M) at ω², over its scale: 0 at a mode. */
  const residual = (x: number) =>
    (a * x * x + b * x + c) / Math.max(1e-30, Math.abs(c), Math.abs(b * x), Math.abs(a * x * x));
  /** m₁ started alone at x₁ = 1 (x₂ = 0), both at rest: each block's position at t. */
  const [r1, r2] = ratios;
  // x = q₁(1, r₁) cos ω₁t + q₂(1, r₂) cos ω₂t with q₁ + q₂ = 1, q₁r₁ + q₂r₂ = 0.
  const q1 = r2 / (r2 - r1);
  const q2 = 1 - q1;
  const motion = (t: number) => {
    const [c1, c2] = [Math.cos(w[0] * t), Math.cos(w[1] * t)];
    return [q1 * c1 + q2 * c2, q1 * r1 * c1 + q2 * r2 * c2] as const;
  };
  return { w, w2, ratios, residual, motion };
}
