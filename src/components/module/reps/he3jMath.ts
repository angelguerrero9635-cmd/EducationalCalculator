/**
 * The arithmetic the college round 3 group J pictures draw (HC60 `roadCurve`, HC61 `connection`,
 * HC88 `streamChannel` options, HC89 `hydrograph`, HC90 `blockDiagram`), shared with their
 * harness checks (`harness/picturesHe3j.ts`). Every function takes the formula's units.
 */

// ─── HC88: open channels ─────────────────────────────────────────────────────

/** Manning's discharge for a rectangular channel: Q = (k ÷ n)AR^(2/3)S^(1/2). */
export function manningQ(b: number, y: number, n: number, S: number, k = 1) {
  const A = b * y;
  const R = A / (b + 2 * y);
  return (k / n) * A * R ** (2 / 3) * Math.sqrt(S);
}

/** The Froude number V ÷ √(gy). */
export const froude = (V: number, y: number, g: number) => V / Math.sqrt(g * y);

/** Critical depth for a unit discharge q: (q² ÷ g)^(1/3). */
export const criticalDepth = (q: number, g: number) => Math.cbrt((q * q) / g);

/** Specific energy at depth y: y + q² ÷ (2gy²). */
export const specificEnergy = (y: number, q: number, g: number) => y + (q * q) / (2 * g * y * y);

/**
 * The alternate depth: the other depth with the same specific energy as y (below y_c when y is
 * above it, and the other way). Bisection on the far limb.
 */
export function alternateDepth(y: number, q: number, g: number) {
  const yc = criticalDepth(q, g);
  const E = specificEnergy(y, q, g);
  if (Math.abs(y - yc) < 1e-9 * yc) return yc;
  let [lo, hi] = y > yc ? [1e-6 * yc, yc] : [yc, E];
  // On the lower limb E falls as y grows; on the upper it rises.
  const falls = y > yc;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const above = specificEnergy(mid, q, g) > E;
    if (above === falls) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** The sequent depth after a jump: (y₁ ÷ 2)(√(1 + 8Fr₁²) − 1). */
export const jumpDepth = (y1: number, Fr1: number) => (y1 / 2) * (Math.sqrt(1 + 8 * Fr1 * Fr1) - 1);

/** The head lost in a jump: (y₂ − y₁)³ ÷ (4y₁y₂). */
export const jumpLoss = (y1: number, y2: number) => (y2 - y1) ** 3 / (4 * y1 * y2);

// ─── HC60: roads ─────────────────────────────────────────────────────────────

/** Distance covered while reacting, m: 0.278Vt (V in km/h). */
export const reactionDistance = (V: number, t: number) => 0.278 * V * t;

/** Braking distance, m: V² ÷ (254(a ÷ g + G)) (V in km/h, G a decimal, + uphill). */
export const brakingDistance = (V: number, a: number, G: number, g: number) =>
  (V * V) / (254 * (a / g + G));

/** A circular curve's elements from R (m) and Δ (degrees): T, L, E and the long chord. */
export function curveElements(R: number, deltaDeg: number) {
  const half = (deltaDeg * Math.PI) / 360;
  return {
    T: R * Math.tan(half),
    L: (R * deltaDeg * Math.PI) / 180,
    E: R * (1 / Math.cos(half) - 1),
    chord: 2 * R * Math.sin(half),
  };
}

/** The least radius for a speed: V² ÷ (127(e + f)). */
export const minRadius = (V: number, e: number, f: number) => (V * V) / (127 * (e + f));

/** 200(√h₁ + √h₂)², the constant of the crest-curve formulas (658 for 1.08 m and 0.60 m). */
export const crestConstant = (h1: number, h2: number) => 200 * (Math.sqrt(h1) + Math.sqrt(h2)) ** 2;

/** The crest curve's length for sight distance S: AS² ÷ K when S < L, else 2S − K ÷ A. */
export function crestLength(A: number, S: number, h1: number, h2: number) {
  const K = crestConstant(h1, h2);
  const long = (A * S * S) / K;
  return long >= S ? long : 2 * S - K / A;
}

/**
 * A crest vertical curve: grades g1 and g2 (%), length L (m), PVC at x = 0 and elevation 0.
 * Returns the road's elevation at x (m), straight grades outside the curve.
 */
export function crestProfile(g1: number, g2: number, L: number) {
  const r = (g1 - g2) / (100 * L);
  const yL = (g1 / 100) * L - (r * L * L) / 2;
  return (x: number) =>
    x <= 0
      ? (g1 / 100) * x
      : x >= L
        ? yL + (g2 / 100) * (x - L)
        : (g1 / 100) * x - (r * x * x) / 2;
}

/** The least height of a sight line above the road, eye at xe, the object S further on. */
function sightGap(y: (x: number) => number, xe: number, S: number, h1: number, h2: number) {
  const ya = y(xe) + h1;
  const yb = y(xe + S) + h2;
  // line − road is convex on a crest: a ternary search finds its least value.
  const gap = (x: number) => ya + ((yb - ya) * (x - xe)) / S - y(x);
  let [lo, hi] = [xe, xe + S];
  for (let i = 0; i < 120; i++) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;
    if (gap(m1) < gap(m2)) hi = m2;
    else lo = m1;
  }
  const x = (lo + hi) / 2;
  return { gap: gap(x), at: x };
}

/**
 * The sight line at its worst place along a crest curve: the eye position whose line to the
 * object S further on passes closest to the road (or cuts it). `gap` > 0 clears, 0 touches,
 * < 0 is blocked; `at` is where it passes closest.
 */
export function worstSight(g1: number, g2: number, L: number, S: number, h1: number, h2: number) {
  const y = crestProfile(g1, g2, L);
  const lo0 = -S;
  const hi0 = L;
  const N = 240;
  let best = { xe: lo0, gap: Infinity, at: 0 };
  for (let i = 0; i <= N; i++) {
    const xe = lo0 + ((hi0 - lo0) * i) / N;
    const s = sightGap(y, xe, S, h1, h2);
    if (s.gap < best.gap) best = { xe, ...s };
  }
  // Refine around the best grid point.
  let [lo, hi] = [best.xe - (hi0 - lo0) / N, best.xe + (hi0 - lo0) / N];
  for (let i = 0; i < 80; i++) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;
    if (sightGap(y, m1, S, h1, h2).gap < sightGap(y, m2, S, h1, h2).gap) hi = m2;
    else lo = m1;
  }
  const xe = (lo + hi) / 2;
  const s = sightGap(y, xe, S, h1, h2);
  return s.gap < best.gap ? { xe, ...s } : best;
}

// ─── HC89: runoff ────────────────────────────────────────────────────────────

/** NRCS runoff depth: (P − I_a)² ÷ (P + 0.8S) when P > I_a = 0.2S, else 0. */
export function cnRunoff(P: number, S: number) {
  const Ia = 0.2 * S;
  return P > Ia ? (P - Ia) ** 2 / (P + 0.8 * S) : 0;
}

/** NRCS storage S = 1000 ÷ CN − 10 (inches). */
export const cnStorage = (CN: number) => 1000 / CN - 10;

/** The rational method's peak, m³/s: CiA ÷ 360 (i in mm/h, A in ha). */
export const rationalPeak = (C: number, i: number, A: number) => (C * i * A) / 360;

/** Detention storage between triangles: ½t_b(Q_i − Q_o) × seconds per t_b unit. */
export const detentionStorage = (Qi: number, Qo: number, tb: number, seconds: number) =>
  0.5 * tb * seconds * (Qi - Qo);

/** Where the outflow triangle's peak meets the inflow's falling limb (t, as t_b's share). */
export const outflowPeakAt = (Qi: number, Qo: number, peakAt: number) =>
  1 - (1 - peakAt) * (Qo / Qi);

// ─── HC90: loops ─────────────────────────────────────────────────────────────

/** P-only control of a first-order process: the final value, the offset and τ_cl. */
export function proportionalLoop(Kc: number, Kp: number, tau: number, r: number) {
  const K = Kc * Kp;
  const final = (r * K) / (1 + K);
  return { K, final, offset: r - final, tauCl: tau / (1 + K) };
}

/** n equal lags under P control: K_c,uK_p = sec(π ÷ n)ⁿ, ω_u = tan(π ÷ n) ÷ τ. */
export function equalLags(n: number, tau: number) {
  const th = Math.PI / n;
  const wu = Math.tan(th) / tau;
  return { loop: (1 / Math.cos(th)) ** n, wu, Pu: (2 * Math.PI) / wu };
}
