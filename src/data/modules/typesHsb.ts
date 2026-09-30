/**
 * Picture specs for the Grades 9–12 statistics and counting pictures of group HB (kept apart
 * from `types.ts` so that file's union only lists them). A `NumOrVar` field is a fixed number or
 * a variable id; every value is in the variable's shown units.
 */
import type { NumOrVar } from './typesGraphs';
import type { SignOf } from './typesHs2a';
import type { HistogramHs2g, PascalFraction, TermsChartHs2g } from './typesHs2g';

/**
 * A normal curve over mean μ and standard deviation σ, with an x axis (ticks at μ + kσ, the
 * values written) and a z axis under it (−3 to 3). Without `mean` and `sd` it is the standard
 * normal curve on the z axis alone.
 *
 * - `shade`: the area between two x values, or a tail (leave out `from` or `to`), or both tails
 *   outside them (`outside`), written as a probability to 4 decimals.
 * - `mark`: a value x on the axis, a line up to the curve, with its z-score.
 * - `bands`: the 68–95–99.7 rule, each band shaded and bracketed.
 * - `sample`: the sampling distribution of the mean for samples of n (σ/√n) drawn over the
 *   population's curve (dashed); `shade`, `mark` and `interval` then use the sampling curve.
 * - `interval`: a confidence interval, center ± margin, as a bar under the curve with the middle
 *   area shaded.
 * - `intervals`: 20–100 simulated intervals at a confidence level from a fixed seed, stacked
 *   under the curve around the true mean; the ones that miss it are red, and the caption counts
 *   (seed 152 by default: 94 of 100 at 95%).
 * - `test`: the null curve on the z axis, the rejection region (α) shaded red, the p-value
 *   hatched beyond the statistic z, and the decision in the caption.
 * - `chiSquare`: the chi-square curve for df 1–10 in place of the normal curve, the right tail
 *   past the statistic shaded (the p-value) and the critical value for α marked.
 *
 * Handles drag the shaded ends, the mark, the test statistic and the chi-square statistic
 * (when they are variables), holding `keep` (default: the mean, the SD, n and the level).
 */
export interface NormalCurveSpec {
  kind: 'normalCurve';
  mean?: NumOrVar;
  sd?: NumOrVar;
  /** The x axis's name with its unit, "Height (cm)". */
  axis?: string;
  shade?: { from?: NumOrVar; to?: NumOrVar; outside?: boolean; area?: string };
  mark?: { x: string; z?: string };
  bands?: boolean;
  sample?: { n: NumOrVar; se?: string };
  interval?: { center: NumOrVar; margin: NumOrVar; level?: NumOrVar };
  intervals?: { count: number; n: NumOrVar; level: NumOrVar; seed?: number };
  /** `tail` from a sign box (H90): Hₐ's sign, 1 < or 2 ≤ left, 3 > or 4 ≥ right, 6 ≠ both. */
  test?: { stat: NumOrVar; alpha: NumOrVar; tail: 'left' | 'right' | 'two' | SignOf; p?: string };
  chiSquare?: { df: NumOrVar; stat?: NumOrVar; alpha?: NumOrVar; p?: string };
  /** Typed values held while a handle is dragged. */
  keep?: string[];
  /** No handles (a drag can't be solved back). */
  fixed?: boolean;
}

/**
 * A histogram. Bins run from `start` in steps of `width` (left end in, right end out) to `end`:
 * from raw `data` (numbers or variable ids), or from `counts` per bin. `relative` draws the
 * relative frequencies. `mean` and `median` mark the center (`true` works it out from the data;
 * from counts the mean is estimated from the bin midpoints), and `shape: true` names the shape
 * in the caption (symmetric, skewed left or right, uniform, bimodal), or a word given.
 *
 * `probability` draws a probability distribution: a bar of P(X = k) over each value, E(X)
 * marked; `binomial` works those bars out from n and p. `lit` lights one bin (1-based) or one
 * value k. Count and probability bars drag by their tops when they are variables, holding
 * `keep`.
 */
export interface HistogramSpec extends HistogramHs2g {
  kind: 'histogram';
  data?: NumOrVar[];
  counts?: NumOrVar[];
  width?: NumOrVar;
  start?: NumOrVar;
  end?: NumOrVar;
  relative?: boolean;
  mean?: true | NumOrVar;
  median?: true | NumOrVar;
  shape?: true | string;
  /** The value axis's name with its unit, "Score". */
  axis?: string;
  lit?: NumOrVar;
  probability?: { values: NumOrVar[]; probs: NumOrVar[]; mean?: string };
  binomial?: { n: NumOrVar; p: NumOrVar; mean?: string; sd?: string };
  keep?: string[];
  fixed?: boolean;
}

/**
 * Pascal's triangle, rows 0 to 12, with row n tinted and entry k (C(n, k)) lit, the two entries
 * above it that add to it marked. `slots` draws the counting slots for r places, n × (n − 1) × …,
 * and for a combination (`choose: true`) the division by r!. `expand` writes (a + b)ⁿ with row
 * n's coefficients in the caption. `triangle: false` leaves the triangle out (slots alone, for
 * n past 12). No handles: n, k and r move with their sliders.
 */
export interface PascalTriangleSpec extends PascalFraction {
  kind: 'pascalTriangle';
  n: NumOrVar;
  k?: NumOrVar;
  /** Rows drawn: 0 to this (default the larger of n and 6; at most 12). */
  rows?: number;
  triangle?: boolean;
  slots?: { r: NumOrVar; choose?: boolean; result?: string };
  expand?: { a: string; b: string };
}

/**
 * The terms of an arithmetic (aₙ = a₁ + (n − 1)d) or geometric (aₙ = a₁ × rⁿ⁻¹) sequence over
 * n = 1, 2, …, `count` (up to 30), as bars or points, the last one lit. `sums` draws the partial
 * sums Sₙ as a stepped line; `limit` draws an infinite geometric series' sum S = a₁ ÷ (1 − r)
 * dashed (when |r| < 1), the partial sums closing in on it. `term`, `sum` and `limit` (as a
 * variable id) are checked against the rule. No handles: the values have sliders.
 */
export interface TermsChartSpec extends TermsChartHs2g {
  kind: 'termsChart';
  /** H93: 'recursive', aₙ = step × aₙ₋₁ + plus (see `TermsChartHs2g`). */
  type: 'arithmetic' | 'geometric' | 'recursive';
  first: NumOrVar;
  /** The common difference d, or the common ratio r. */
  step: NumOrVar;
  count: NumOrVar;
  as?: 'bars' | 'points';
  sums?: boolean;
  limit?: true | string;
  term?: string;
  sum?: string;
}

/** How a sample is taken (the `studyDesign` figure and the sampling card icons). */
export type SamplingMethod =
  'simple random' | 'stratified' | 'cluster' | 'systematic' | 'convenience';

/**
 * A `studyDesign` scene (Grades 11–12): a population of 48 people, the sample a `method` takes
 * from it (default simple random, `sample` people, 6 to 24), then the design: a `survey` asks the
 * sample, an `observational` study sorts it by what people already do (`groups`), an
 * `experiment` assigns it at random to a treatment and a control group (`groups`). `lit` rings
 * one stage.
 */
export interface StudyScene {
  design: 'survey' | 'observational' | 'experiment';
  method?: SamplingMethod;
  sample?: number;
  groups?: [string, string];
  lit?: 'population' | 'sample' | 'groups';
}

export type HsbSpec = NormalCurveSpec | HistogramSpec | PascalTriangleSpec | TermsChartSpec;

/** Every variable id one of these pictures refers to. */
export function hsbSpecVars(r: HsbSpec): string[] {
  const v = (...xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  switch (r.kind) {
    case 'normalCurve':
      return v(
        r.mean,
        r.sd,
        r.shade?.from,
        r.shade?.to,
        r.shade?.area,
        r.mark?.x,
        r.mark?.z,
        r.sample?.n,
        r.sample?.se,
        r.interval?.center,
        r.interval?.margin,
        r.interval?.level,
        r.intervals?.n,
        r.intervals?.level,
        r.test?.stat,
        r.test?.alpha,
        r.test?.p,
        r.chiSquare?.df,
        r.chiSquare?.stat,
        r.chiSquare?.alpha,
        r.chiSquare?.p,
        ...(r.keep ?? []),
      );
    case 'histogram':
      return v(
        ...(r.data ?? []),
        ...(r.counts ?? []),
        r.width,
        r.start,
        r.end,
        r.mean === true ? undefined : r.mean,
        r.median === true ? undefined : r.median,
        r.lit,
        ...(r.probability ? [...r.probability.values, ...r.probability.probs] : []),
        r.probability?.mean,
        r.binomial?.n,
        r.binomial?.p,
        r.binomial?.mean,
        r.binomial?.sd,
        ...(r.keep ?? []),
      );
    case 'pascalTriangle':
      return v(r.n, r.k, r.slots?.r, r.slots?.result);
    case 'termsChart':
      return v(r.first, r.step, r.count, r.limit === true ? undefined : r.limit, r.term, r.sum);
  }
}
