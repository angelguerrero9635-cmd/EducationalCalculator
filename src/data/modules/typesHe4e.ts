/**
 * College pictures, round 4, group E (docs/RENDERINGS_HE.md). Kept apart from `types.ts`,
 * `typesHsb.ts` and `typesFunctionGraph.ts` so each gains a line. A `NumOrVar` field is a fixed
 * number or a variable id, read in the variable's shown unit; a string field is the page's own
 * value, checked.
 *
 * - HC114 `normalCurve` `family: 't'`: the t curve over the dashed normal, ±t⋆ marked, the
 *   interval x̄ ± t⋆s ÷ √n bracketed on a value axis lined up with the t axis, an observed t.
 * - HC152 `normalCurve` `shift`: the breeder's equation, parents above and offspring below.
 * - HC151 `alleleFrequencies` `after`: p′ after one generation of selection beside p.
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── HC114: normalCurve family 't' ─────────────────────────────────────────────

/**
 * HC114 (C-P19): the t curve for `df` (default `bracket.n` − 1) drawn solid over the standard
 * normal (dashed), the middle `level` (default 0.95) between −t⋆ and t⋆ shaded and its area
 * written. `tStar` is the page's critical t (typed until the engine picks it by n); left out,
 * the picture works it out from df and the level.
 *
 * `bracket` adds a value axis under the t axis, lined up with it (a value x sits at
 * t = (x − center) ÷ (s ÷ √n)): the interval x̄ ± t⋆s ÷ √n bracketed, its ends and x̄ written;
 * `half`, `lower` and `upper` are the page's half-width and ends (checked). With `mu` (a t-test
 * against a known value) the axis is centered at μ, x̄ sits at the observed t, and the bracket
 * shows whether μ lies inside it. `observed` is the page's t (|x̄ − μ|√n ÷ s), placed on the t
 * axis on x̄'s side of μ. A "?" draws nothing for that value.
 */
export interface NormalCurveHe4e {
  family?: 't';
  df?: NumOrVar;
  tStar?: NumOrVar;
  level?: number;
  observed?: NumOrVar;
  shift?: ShiftHe4e;
  bracket?: {
    mean: NumOrVar;
    s: NumOrVar;
    n: NumOrVar;
    mu?: NumOrVar;
    half?: string;
    lower?: string;
    upper?: string;
    /** The value axis's name with its unit, "Concentration (mg/L)". */
    axis?: string;
  };
}

// ─── HC152: normalCurve shift ──────────────────────────────────────────────────

/**
 * HC152 (B-P18): response to selection, R = h²S, on the curve's `mean` (the parents' mean) and
 * `sd` (a fixed spread is fine: the page needs none). Two panels on one value axis: the
 * parents' curve with the selected tail shaded (the tail whose mean is μ + S, its cutoff and
 * share written) and S arrowed from μ; under it the offspring's curve shifted by R, its mean
 * marked and R arrowed from μ. `selected` is S (negative selects the low tail), `response` R,
 * `h2` the heritability and `after` the offspring's mean (checked: after = μ + R, R = h²S).
 */
export interface ShiftHe4e {
  selected: NumOrVar;
  response: NumOrVar;
  h2?: NumOrVar;
  after?: string;
}

/** Whether a normal curve is drawn by group E's pictures (HC114's t, HC152's shift). */
export const isNormalHe4e = (r: NormalCurveHe4e): boolean => r.family === 't' || !!r.shift;

/** The variable ids HC114's and HC152's fields name. */
export function normalCurveHe4eVars(r: NormalCurveHe4e): string[] {
  const b = r.bracket;
  const sh = r.shift;
  return [
    ...ids(r.df, r.tStar, r.observed, b?.mean, b?.s, b?.n, b?.mu, b?.half, b?.lower, b?.upper),
    ...ids(sh?.selected, sh?.response, sh?.h2, sh?.after),
  ];
}

// ─── HC151: alleleFrequencies after ────────────────────────────────────────────

/**
 * HC151 (B-P17): one generation of selection. `after` is p′ (a variable id): a second tray of
 * 100 beads for p′ beside p's, both on one p scale with Δp arrowed from p to p′. `change` is
 * the page's Δp (checked: p′ − p, and the arrow points its way); `fitness` the three genotype
 * fitnesses w_AA, w_Aa, w_aa, written under the trays (with `mean`, w̄; checked).
 */
export interface AlleleFrequenciesHe4e {
  after?: string;
  change?: string;
  fitness?: [NumOrVar, NumOrVar, NumOrVar];
  mean?: string;
}

/** The variable ids HC151's fields name. */
export const alleleHe4eVars = (r: AlleleFrequenciesHe4e): string[] =>
  ids(r.after, r.change, ...(r.fitness ?? []), r.mean);
