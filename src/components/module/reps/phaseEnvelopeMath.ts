/**
 * The arithmetic behind the college phase diagrams (HC8, group He1i): a binary's bubble and dew
 * curves (Raoult's law, one-parameter Margules, Antoine), the x–y equilibrium curve, the
 * McCabe–Thiele and absorber staircases, and a one-component substance's vapor curve by
 * Clausius–Clapeyron. Pure functions, shared by the pictures, the harness and the demos.
 */

/** log₁₀ P^sat = A − B ÷ (T + C): mmHg and °C, as the plans write Antoine constants. */
export type Antoine = [number, number, number];

export const antoineP = ([A, B, C]: Antoine, T: number) => 10 ** (A - B / (T + C));

/** Margules (one parameter): ln γ₁ = A x₂², ln γ₂ = A x₁². A = 0 is Raoult's law. */
export const margules = (A: number, x1: number): [number, number] => [
  Math.exp(A * (1 - x1) ** 2),
  Math.exp(A * x1 ** 2),
];

/** Bubble pressure and vapor mole fraction at liquid x₁ (Raoult, or Margules with A). */
export function bubbleP(x1: number, p1: number, p2: number, A = 0) {
  const [g1, g2] = margules(A, x1);
  const P = x1 * g1 * p1 + (1 - x1) * g2 * p2;
  return { P, y1: (x1 * g1 * p1) / P };
}

/** Dew pressure at vapor y₁ (Raoult): 1 ÷ P = y₁ ÷ P₁sat + (1 − y₁) ÷ P₂sat. */
export function dewP(y1: number, p1: number, p2: number) {
  const P = 1 / (y1 / p1 + (1 - y1) / p2);
  return { P, x1: (y1 * P) / p1 };
}

/** The tie line of an ideal binary at pressure P: x₁ = (P − P₂sat) ÷ (P₁sat − P₂sat). */
export function tieAt(P: number, p1: number, p2: number) {
  const x1 = (P - p2) / (p1 - p2);
  return { x1, y1: (x1 * p1) / P };
}

/** Solves f(t) = 0 on [lo, hi] by bisection (f changes sign there), or undefined. */
export function bisect(f: (t: number) => number, lo: number, hi: number, n = 80) {
  let [a, b] = [lo, hi];
  let fa = f(a);
  if (!Number.isFinite(fa) || fa * f(b) > 0) return undefined;
  for (let k = 0; k < n; k++) {
    const m = (a + b) / 2;
    const fm = f(m);
    if (fa * fm <= 0) b = m;
    else [a, fa] = [m, fm];
  }
  return (a + b) / 2;
}

/** The boiling point of a pure liquid at P (°C) from its Antoine constants. */
export const boilingT = ([A, B, C]: Antoine, P: number) => B / (A - Math.log10(P)) - C;

/** Bubble temperature (°C) at liquid x₁ and pressure P, and the vapor y₁. */
export function bubbleT(x1: number, P: number, a1: Antoine, a2: Antoine) {
  const [t1, t2] = [boilingT(a1, P), boilingT(a2, P)];
  const T = bisect(
    (t) => x1 * antoineP(a1, t) + (1 - x1) * antoineP(a2, t) - P,
    Math.min(t1, t2) - 1,
    Math.max(t1, t2) + 1,
  );
  return T === undefined ? undefined : { T, y1: (x1 * antoineP(a1, T)) / P };
}

/** Dew temperature (°C) at vapor y₁ and pressure P, and the liquid x₁. */
export function dewT(y1: number, P: number, a1: Antoine, a2: Antoine) {
  const [t1, t2] = [boilingT(a1, P), boilingT(a2, P)];
  const T = bisect(
    (t) => y1 / antoineP(a1, t) + (1 - y1) / antoineP(a2, t) - 1 / P,
    Math.min(t1, t2) - 1,
    Math.max(t1, t2) + 1,
  );
  return T === undefined ? undefined : { T, x1: (y1 * P) / antoineP(a1, T) };
}

// ─── x–y diagrams ────────────────────────────────────────────────────────────

/** An equilibrium curve: constant relative volatility α, or a straight line y = mx. */
export type Equilibrium = { alpha: number } | { m: number };

export const yEq = (e: Equilibrium, x: number) =>
  'alpha' in e ? (e.alpha * x) / (1 + (e.alpha - 1) * x) : e.m * x;

export const xEq = (e: Equilibrium, y: number) =>
  'alpha' in e ? y / (e.alpha - (e.alpha - 1) * y) : y / e.m;

/** The rectifying line y = R ÷ (R + 1) x + x_D ÷ (R + 1). */
export const rectifying = (R: number, xD: number) => ({
  slope: R / (R + 1),
  intercept: xD / (R + 1),
});

/**
 * Where the rectifying line meets the q-line y = q ÷ (q − 1) x − x_F ÷ (q − 1) (upright at
 * x = x_F when q = 1).
 */
export function feedPoint(R: number, xD: number, xF: number, q: number): [number, number] {
  const { slope, intercept } = rectifying(R, xD);
  if (Math.abs(q - 1) < 1e-9) return [xF, slope * xF + intercept];
  const qs = q / (q - 1);
  const x = (intercept + xF / (q - 1)) / (qs - slope);
  return [x, slope * x + intercept];
}

/** Where the q-line meets the equilibrium curve (the pinch of minimum reflux). */
export function qPinch(alpha: number, xF: number, q: number): [number, number] | undefined {
  const e = { alpha };
  if (Math.abs(q - 1) < 1e-9) return [xF, yEq(e, xF)];
  const qLine = (x: number) => (q / (q - 1)) * x - xF / (q - 1);
  const x = bisect((t) => yEq(e, t) - qLine(t), 1e-9, 1 - 1e-9);
  return x === undefined ? undefined : [x, yEq(e, x)];
}

/** Underwood for a saturated liquid feed and constant α: R_min. */
export const minReflux = (alpha: number, xF: number, xD: number) =>
  (xD / xF - (alpha * (1 - xD)) / (1 - xF)) / (alpha - 1);

/** Fenske: the fewest stages (total reflux), the reboiler counted. */
export const fenske = (alpha: number, xD: number, xB: number) =>
  Math.log((xD / (1 - xD)) * ((1 - xB) / xB)) / Math.log(alpha);

/** One stair: across from (x0, y) to the curve at (x1, y), then down (or up) to (x1, y1). */
export interface Stair {
  x0: number;
  y: number;
  x1: number;
  y1: number;
}

export interface Staircase {
  stairs: Stair[];
  /** The stage the feed enters (the first stair stepped on the stripping line), 1-based. */
  feed?: number;
  /** The operating lines cross above the curve: no number of stages reaches the end. */
  pinched: boolean;
}

/** The most stairs drawn before a pinch is called. */
export const MAX_STAIRS = 150;

/**
 * McCabe–Thiele from the top: (x_D, x_D) across to the curve, down to the rectifying line until
 * the stair passes the feed point, then the stripping line, until x ≤ x_B. With `R` undefined
 * the column runs at total reflux (both lines the 45° line).
 */
export function distillationStairs(
  alpha: number,
  xD: number,
  xB: number,
  opts: { R?: number; xF?: number; q?: number } = {},
): Staircase {
  const e = { alpha };
  const total = opts.R === undefined || opts.xF === undefined;
  const [xi, yi] = total ? [0, 0] : feedPoint(opts.R!, xD, opts.xF!, opts.q ?? 1);
  if (!total && (yEq(e, xi) <= yi + 1e-12 || xi <= xB || xi >= xD))
    return { stairs: [], pinched: true };
  const rect = total ? undefined : rectifying(opts.R!, xD);
  const strip = (x: number) => xB + ((yi - xB) / (xi - xB)) * (x - xB);
  const stairs: Stair[] = [];
  let feed: number | undefined;
  let y = xD;
  let x0 = xD;
  while (stairs.length < MAX_STAIRS) {
    const x1 = xEq(e, y);
    let y1: number;
    if (total) y1 = x1;
    else {
      if (feed === undefined && x1 < xi) feed = stairs.length + 1;
      y1 = feed === undefined ? rect!.slope * x1 + rect!.intercept : strip(x1);
    }
    stairs.push({ x0, y, x1, y1: x1 <= xB ? x1 : y1 });
    if (x1 <= xB * (1 + 1e-9)) return { stairs, feed, pinched: false };
    [x0, y] = [x1, y1];
  }
  return { stairs, feed, pinched: true };
}

/**
 * An absorber from the top: the gas leaves at y_out over liquid entering at x_in; across to the
 * curve y = mx, up to the operating line y = y_out + (L ÷ G)(x − x_in), until y ≥ y_in.
 */
export function absorberStairs(m: number, LG: number, yIn: number, yOut: number, xIn: number) {
  const e = { m };
  const stairs: Stair[] = [];
  if (!(LG > 0 && m > 0) || yOut - m * xIn <= 0 || yIn <= yOut)
    return { stairs, pinched: true } as Staircase;
  const xOut = xIn + (yIn - yOut) / LG;
  // Pinched at the bottom: the operating line touches the curve where the gas enters.
  if (m * xOut >= yIn - 1e-12) return { stairs, pinched: true } as Staircase;
  let y = yOut;
  let x0 = xIn;
  while (stairs.length < MAX_STAIRS) {
    const x1 = xEq(e, y);
    const y1 = yOut + LG * (x1 - xIn);
    stairs.push({ x0, y, x1, y1: Math.min(y1, yIn) });
    if (y1 >= yIn * (1 - 1e-9)) return { stairs, pinched: false } as Staircase;
    [x0, y] = [x1, y1];
  }
  return { stairs, pinched: true } as Staircase;
}

/**
 * Whether `n` stairs drawn match a fractional count N (Fenske, Kremser): N rounded up, or, with
 * N a whole number to its shown rounding, the stairs either side of it.
 */
export const stairsMatch = (n: number, N: number) =>
  n === Math.ceil(N - 1e-6) ||
  (Math.abs(N - Math.round(N)) < 5e-3 && Math.abs(n - Math.round(N) - 0.5) <= 0.5);

/** Kremser: N = ln[((y_in − mx_in) ÷ (y_out − mx_in))(1 − 1 ÷ A) + 1 ÷ A] ÷ ln A. */
export function kremser(yIn: number, yOut: number, xIn: number, m: number, A: number) {
  const r = (yIn - m * xIn) / (yOut - m * xIn);
  if (Math.abs(A - 1) < 1e-9) return r - 1;
  return Math.log(r * (1 - 1 / A) + 1 / A) / Math.log(A);
}

/** (L ÷ G)min = (y_in − y_out) ÷ (y_in ÷ m − x_in): the line pinched where the gas enters. */
export const minLiquid = (yIn: number, yOut: number, xIn: number, m: number) =>
  (yIn - yOut) / (yIn / m - xIn);

// ─── One component: the vapor curve by Clausius–Clapeyron ───────────────────

/** A point (T in K, P in the page's pressure unit). */
export type TP = [number, number];

/**
 * The vapor curve from the triple point to the critical point through the page's points:
 * straight in (1 ÷ T, ln P) between neighbours, which is Clausius–Clapeyron with a constant
 * ΔH_vap on each piece, so the curve passes every point exactly.
 */
export function vaporCurve(triple: TP, critical: TP, points: TP[], n = 60): TP[] {
  const knots = [triple, ...points, critical]
    .filter(([T, P]) => T > 0 && P > 0)
    .sort((a, b) => a[0] - b[0])
    .filter(([T], i, all) => i === 0 || T > all[i - 1]![0] + 1e-9);
  const out: TP[] = [];
  const [t0, t1] = [knots[0]![0], knots[knots.length - 1]![0]];
  for (let k = 0; k <= n; k++) {
    const T = t0 + ((t1 - t0) * k) / n;
    out.push([T, vaporP(knots, T)]);
  }
  // Every knot exactly on the curve.
  for (const p of knots) out.push(p);
  return out.sort((a, b) => a[0] - b[0]);
}

/** P on the piecewise Clausius–Clapeyron curve through sorted knots (beyond: the end piece). */
export function vaporP(knots: TP[], T: number): number {
  let i = 0;
  while (i < knots.length - 2 && T > knots[i + 1]![0]) i++;
  const [[Ta, Pa], [Tb, Pb]] = [knots[i]!, knots[i + 1] ?? knots[i]!];
  if (Tb === Ta) return Pa;
  const u = (1 / T - 1 / Ta) / (1 / Tb - 1 / Ta);
  return Math.exp(Math.log(Pa) + u * (Math.log(Pb) - Math.log(Pa)));
}

/** ln(P₂ ÷ P₁) = −(ΔH ÷ R)(1/T₂ − 1/T₁): P₂ from one point and ΔH (J/mol, R in J/(mol·K)). */
export const clausiusP2 = (dH: number, R: number, T1: number, P1: number, T2: number) =>
  P1 * Math.exp((-dH / R) * (1 / T2 - 1 / T1));

/** ΔH (J/mol) from two points on the curve. */
export const clausiusDH = (R: number, T1: number, P1: number, T2: number, P2: number) =>
  (-R * Math.log(P2 / P1)) / (1 / T2 - 1 / T1);

/** The phase rule: F = C − P + 2. */
export const degreesOfFreedom = (C: number, P: number) => C - P + 2;
