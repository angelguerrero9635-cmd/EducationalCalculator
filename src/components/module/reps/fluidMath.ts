/**
 * The fluid relations the `fluidSystem` picture draws from (HC6), shared with its harness check
 * and the gallery demos so all three agree. SI units throughout. No constant is fixed here: g
 * and every density come from the page (`DEFAULT_G` is only the engineering pages' value when a
 * page names none).
 */

/** g on the engineering pages (docs/HE_NEEDS.md decisions), when a page passes none. */
export const DEFAULT_G = 9.81;

/** Below this Reynolds number a flat plate's layer is laminar. */
export const PLATE_LAMINAR_RE = 5e5;

/** A storm sewer's full velocity below this (m/s) lets solids settle. */
export const SELF_CLEANING = 0.9;

/** Pressure under a depth h of fluid: ρgh. */
export const hydrostatic = (rho: number, g: number, h: number) => rho * g * h;

/** A vertical rectangle's centroid depth, force and center of pressure. */
export function gateOf(rho: number, g: number, b: number, H: number, d: number) {
  const hc = d + H / 2;
  const F = rho * g * hc * b * H;
  const ycp = hc + (H * H) / (12 * hc);
  return { hc, F, ycp };
}

/** The first size made (mm in `sizes`) at least D (m), in m; undefined past the largest. */
export const laidSize = (D: number, sizes: number[] | undefined) => {
  const mm = sizes?.find((x) => x >= D * 1000 * (1 - 1e-9));
  return mm === undefined ? undefined : mm / 1000;
};

/** Pipe area from a diameter. */
export const areaOf = (D: number) => (Math.PI * D * D) / 4;

/** A venturi's inlet and throat speeds from the pressure difference (continuity + Bernoulli). */
export function venturiOf(D1: number, D2: number, rho: number, dP: number) {
  const r4 = (D1 / D2) ** 4;
  const V1 = Math.sqrt((2 * dP) / (rho * (r4 - 1)));
  const V2 = V1 * (D1 / D2) ** 2;
  return { V1, V2, Q: areaOf(D1) * V1 };
}

/**
 * The force of a jet on a fixed vane that turns it through θ (degrees): the change in the jet's
 * momentum per second is ṁV(cos θ − 1, sin θ), and the vane feels the opposite.
 */
export function jetForce(mdot: number, V: number, thetaDeg: number) {
  const t = (thetaDeg * Math.PI) / 180;
  return { Fx: mdot * V * (1 - Math.cos(t)), Fy: mdot * V * Math.sin(t) };
}

/** Colebrook's friction factor, by fixed-point iteration (f = 64 ÷ Re when laminar). */
export function colebrook(Re: number, relRough: number): number {
  if (!(Re > 0)) return NaN;
  if (Re < 2300) return 64 / Re;
  let x = 8; // 1 ÷ √f
  for (let i = 0; i < 60; i++) x = -2 * Math.log10(relRough / 3.7 + (2.51 * x) / Re);
  return 1 / (x * x);
}

/** Swamee–Jain's explicit friction factor (within 1% of Colebrook). */
export const swameeJain = (Re: number, relRough: number) =>
  0.25 / Math.log10(relRough / 3.7 + 5.74 / Re ** 0.9) ** 2;

/** Darcy–Weisbach head loss f(L ÷ D)V² ÷ 2g. */
export const darcy = (f: number, L: number, D: number, V: number, g: number) =>
  (f * (L / D) * V * V) / (2 * g);

/** Hazen–Williams head loss (SI): 10.67LQ^1.852 ÷ (C^1.852D^4.87). */
export const hazenWilliams = (L: number, Q: number, C: number, D: number) =>
  (10.67 * L * Math.abs(Q) ** 1.852) / (C ** 1.852 * D ** 4.87);

/** The share of Q in pipe 1 of two in parallel with equal Hazen–Williams losses (same C). */
export const parallelShare = (D1: number, L1: number, D2: number, L2: number) =>
  1 / (1 + ((L1 / L2) * (D2 / D1) ** 4.87) ** (1 / 1.852));

/** One Hardy Cross step on a loop with h_f = KQ|Q| (Q signed, + clockwise). */
export function hardyCross(pipes: { K: number; Q: number }[]) {
  const hf = pipes.map((p) => p.K * p.Q * Math.abs(p.Q));
  const sum = hf.reduce((a, b) => a + b, 0);
  const slope = pipes.reduce((a, p) => a + 2 * p.K * Math.abs(p.Q), 0);
  const dQ = slope === 0 ? 0 : -sum / slope;
  return { hf, sum, slope, dQ, next: pipes.map((p) => p.Q + dQ) };
}

/** A full circular pipe's diameter by Manning (SI): (3.208Qn ÷ √S)^(3/8). */
export const manningFull = (Q: number, n: number, S: number) =>
  ((3.208 * Q * n) / Math.sqrt(S)) ** (3 / 8);

/** A flat plate's layer thickness at x (laminar Blasius, or the 1/7-power turbulent fit). */
export function layerAt(x: number, V: number, nu: number, turbulent: boolean): number {
  if (!(x > 0)) return 0;
  const Re = (V * x) / nu;
  return turbulent ? (0.37 * x) / Re ** 0.2 : (5 * x) / Math.sqrt(Re);
}

/** u ÷ U across a layer at y ÷ δ (laminar: the quartic fit; turbulent: the 1/7 power). */
export const profileAt = (eta: number, turbulent: boolean) => {
  const e = Math.min(1, Math.max(0, eta));
  return turbulent ? e ** (1 / 7) : 2 * e - 2 * e ** 3 + e ** 4;
};

/** The model's speed that matches the prototype by Reynolds or by Froude. */
export function modelSpeed(
  rule: 'reynolds' | 'froude',
  Vp: number,
  Lp: number,
  Lm: number,
  nuP = 1,
  nuM = 1,
) {
  return rule === 'reynolds' ? (Vp * Lp * nuM) / (Lm * nuP) : Vp * Math.sqrt(Lm / Lp);
}
