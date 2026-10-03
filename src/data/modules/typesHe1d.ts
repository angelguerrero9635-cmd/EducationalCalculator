/**
 * College pictures, round 1, group D (docs/RENDERINGS_HE.md): `functionGraph` time responses
 * (HC4) and log and flipped axes (HC9). Kept apart from `typesFunctionGraph.ts`, which only
 * gains a line each. A `NumOrVar` field is a fixed number or a variable id; a field named for a
 * value the page works out (`value`, `overshoot`, …) is a variable id, checked by the harness.
 */
import type { NumOrVar } from './typesGraphs';

/**
 * HC4: the family a time response draws (`family: 'response'` with `transient` or
 * `stepResponse`), and HC9: a soil's grain-size curve (`family: 'gradation'`, percent passing
 * against grain size on a log axis through D₁₀, D₃₀ and D₆₀, which are marked). Both are drawn
 * by `FunctionGraphHe1d`, not by the family graph.
 */
export type FamilyHe1d =
  { family: 'response' } | { family: 'gradation'; d10: NumOrVar; d30: NumOrVar; d60: NumOrVar };

/**
 * HC4: a first-order response x(t) = x_f + (x₀ − x_f)e^(−(t − θ)/τ) after a step at t = 0 (x₀
 * until the dead time θ), the final value dashed, τ to 5τ marked under the time axis, the 63.2%
 * point at θ + τ, and the point at `time`. With no `tau`, a ramp: from `initial`, rising by `rate`
 * a unit of time, or through the point (time, value) (an integrator).
 */
export interface TransientHe1d {
  initial: NumOrVar;
  final?: NumOrVar;
  tau?: NumOrVar;
  /** A ramp's slope (output per unit of time), when `tau` is left out. */
  rate?: NumOrVar;
  /** The time the page reads the response at; its point is dragged along the curve. */
  time?: NumOrVar;
  /** The page's response at `time` (checked). */
  value?: string;
  /** Dead time θ: the output holds x₀ until θ, then moves. */
  deadTime?: NumOrVar;
  /** The two-point fit: the 28.3% and 63.2% times marked; the page's t₂₈ and t₆₃ (checked). */
  points?: true | { t28?: string; t63?: string };
  /** A second first-order curve, dashed (the open loop under the closed loop). */
  second?: { final: NumOrVar; tau: NumOrVar; initial?: NumOrVar; label?: string };
}

/**
 * HC4: the standard second-order step response (gain K, final value K × size), with the ±2%
 * band, the first peak at (T_p, K(1 + OS)), T_s where the envelope enters the band, and the next
 * peak for the decay ratio; over- and critically damped curves for ζ ≥ 1. `mode: 'oscillation'`
 * draws a free decay A e^(−ζω_n t) cos ω_d t inside its dashed envelope instead, t½ marked where
 * the envelope is half the start. ζ comes from `zeta`, or from `alpha` as α ÷ ω_n (series RLC).
 */
export interface StepResponseHe1d {
  wn: NumOrVar;
  zeta?: NumOrVar;
  alpha?: NumOrVar;
  /** The final value (K times the step's size), default 1; the start of an oscillation. */
  gain?: NumOrVar;
  mode?: 'step' | 'oscillation';
  /** The page's percent overshoot (%OS, or OS as a fraction; checked). */
  overshoot?: string;
  /** The page's peak time T_p (checked). */
  peak?: string;
  /** The page's settling time T_s, 4 ÷ σ or the 2% envelope's entry (checked). */
  settling?: string;
  /** The page's decay ratio, OS² (checked; the next peak marked). */
  decay?: string;
  /** The page's damped period 2π ÷ ω_d (checked; bracketed between two peaks). */
  period?: string;
  /** The page's time to half amplitude, ln 2 ÷ (ζω_n) (oscillation; checked). */
  halfLife?: string;
  /** A time the page reads the response at (dragged along the curve), and its value. */
  time?: NumOrVar;
  value?: string;
}

/** HC9: an axis read in powers of ten. */
export type AxisScaleHe1d = 'log';

/** The HC4 and HC9 options on `functionGraph`. */
export interface FunctionGraphHe1d {
  /** HC4: a first-order (or ramp) response against time, with `family: 'response'`. */
  transient?: TransientHe1d;
  /** HC4: a second-order step response or free decay, with `family: 'response'`. */
  stepResponse?: StepResponseHe1d;
  /**
   * HC4: the input step drawn above on its own axis, from 0 to `size` at t = 0 (default 1),
   * named `name` (default u).
   */
  stepInput?: { size?: NumOrVar; name?: string };
  /** HC4: the steady-state error between the input and the final value, bracketed (checked). */
  error?: string;
  /**
   * HC9: log axes, decade ticks with minor ticks at 2–9; values ≤ 0 aren't drawn (a point there
   * is refused in the caption). A power law draws straight on log–log axes.
   */
  scale?: { x?: AxisScaleHe1d; y?: AxisScaleHe1d };
  /** HC9: the vertical axis grows downward (depth down). */
  invertY?: boolean;
  /** HC9: the input along the vertical axis and the output across (temperature against depth). */
  swap?: boolean;
  /** HC9: an x the page works out where the curve reaches y, dropped to the axis (checked). */
  reads?: { x: string; y: NumOrVar; label?: string }[];
}

const idsOf = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

/** Whether `FunctionGraphHe1d` draws the spec (a time response, a gradation, log or flipped). */
export const drawnByHe1d = (r: FunctionGraphHe1d & { family: string }): boolean =>
  r.family === 'response' ||
  r.family === 'gradation' ||
  !!r.scale?.x ||
  !!r.scale?.y ||
  !!r.invertY ||
  !!r.swap;

/** The variable ids an HC4 or HC9 family names. */
export function familyHe1dVars(f: FamilyHe1d): string[] {
  return f.family === 'gradation' ? idsOf(f.d10, f.d30, f.d60) : [];
}

/** The variable ids the HC4 and HC9 options name (for the module tests). */
export function functionGraphHe1dVars(r: FunctionGraphHe1d): string[] {
  const t = r.transient;
  const s = r.stepResponse;
  const pts = typeof t?.points === 'object' ? t.points : undefined;
  return [
    ...idsOf(t?.initial, t?.final, t?.tau, t?.rate, t?.time, t?.value, t?.deadTime),
    ...idsOf(pts?.t28, pts?.t63, t?.second?.final, t?.second?.tau, t?.second?.initial),
    ...idsOf(s?.wn, s?.zeta, s?.alpha, s?.gain, s?.overshoot, s?.peak, s?.settling, s?.decay),
    ...idsOf(s?.period, s?.halfLife, s?.time, s?.value, r.stepInput?.size, r.error),
    ...(r.reads ?? []).flatMap((p) => idsOf(p.x, p.y)),
  ];
}
