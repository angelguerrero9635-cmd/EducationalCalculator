/**
 * The arithmetic behind the college round 4 group L pictures (HC165–HC172), shared by the
 * pictures and their harness checks so both draw and check from one formula.
 */

// ─── HC165: the Moody chart ─────────────────────────────────────────────────────

/** Re below this is laminar (f = 64 ÷ Re); from here to MOODY_TURBULENT is transition. */
export const MOODY_LAMINAR = 2300;
export const MOODY_TURBULENT = 4000;
/** The chart's window: Re from 10³ to 10⁸, f from 0.005 to 0.1. */
export const MOODY_RE: [number, number] = [1e3, 1e8];
export const MOODY_F: [number, number] = [0.005, 0.1];
/** The family drawn when a page names none: smooth, then ε ÷ D from 10⁻⁵ to 0.05. */
export const MOODY_CURVES = [0, 1e-5, 1e-4, 1e-3, 0.005, 0.01, 0.05];

/**
 * Colebrook's turbulent friction factor at any Re (no laminar switch), solved by fixed-point
 * iteration on x = 1 ÷ √f: x = −2 log₁₀(r ÷ 3.7 + 2.51x ÷ Re). Converges in a few rounds.
 */
export function colebrookF(re: number, r: number): number {
  if (!(re > 0) || !(r >= 0)) return NaN;
  let x = 8;
  for (let i = 0; i < 100; i++) {
    const next = -2 * Math.log10(r / 3.7 + (2.51 * x) / re);
    if (Math.abs(next - x) < 1e-13) {
      x = next;
      break;
    }
    x = next;
  }
  return 1 / (x * x);
}

/** The f a page takes at Re: 64 ÷ Re when laminar, else Colebrook. */
export const moodyF = (re: number, r: number) => (re < MOODY_LAMINAR ? 64 / re : colebrookF(re, r));

/** The flow regime at Re, as the chart's caption names it. */
export const moodyRegime = (re: number): 'laminar' | 'transition' | 'turbulent' =>
  re < MOODY_LAMINAR ? 'laminar' : re < MOODY_TURBULENT ? 'transition' : 'turbulent';
