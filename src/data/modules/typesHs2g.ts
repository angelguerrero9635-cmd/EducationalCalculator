/**
 * Picture options for Grades 9–12, round 2, group G (H93–H95, H97–H99; see
 * pictureRequestsHs.ts): sequences past 30 terms and by a recursive rule, function graphs
 * reflected, stretched sideways and cut at a value, polynomial area boxes and monomials,
 * probability counts, unit-circle points and angle pairs, and the statistics and complex-number
 * options. Kept apart from the kinds' own type files so those only gain a line each. A
 * `NumOrVar` field is a fixed number or a variable id.
 */
import type { Representation } from './types';
import type { NumOrVar } from './typesGraphs';

/** H93: `termsChart` past 30 terms, a recursive rule and a second lit term. */
export interface TermsChartHs2g {
  /**
   * Past 30 terms: while `count` is over 30 (up to 10,000) the chart draws the first six terms,
   * a break on the axis, then the nth term, lit; an arithmetic sequence's line runs dashed
   * across the break. At 30 or fewer it draws every term, as without it.
   */
  far?: true;
  /**
   * `type: 'recursive'`: aₙ = k × aₙ₋₁ + c with k = `step` and c = `plus` (default 0), each
   * term drawn from the one before, an arrow from each to the next.
   */
  plus?: NumOrVar;
  /**
   * A second lit term: its term number (a value id or a number), drawn in the second colour
   * and labelled. The chart runs to this term when it is past `count`.
   */
  lit?: NumOrVar;
  /** The id of the value the second lit term equals (checked). */
  litTerm?: string;
  /**
   * The terms as powers of the first term (a geometric sequence with r = a₁): the lit terms
   * read "2³ = 8" and the caption "the powers of 2".
   */
  powers?: true;
}

/** H94: `functionGraph` reflected, stretched sideways and cut at a value. */
export interface FunctionGraphHs2g {
  /**
   * |f(x)|: the parts of the curve below the x-axis reflected up, the curve before it dashed,
   * the formula in bars. No handles: the values have sliders.
   */
  abs?: true;
  /**
   * A horizontal factor b on the absolute, root, exponential and log families:
   * y = a·f(b(x − h)) + k, the graph squeezed toward x = h by 1/|b| and flipped across it when b
   * is negative. The parent (with `parent`) stays f(x).
   */
  horizontal?: NumOrVar;
  /**
   * The domain kept, x ≥ `from` (and x ≤ `to`): the curve drawn there with closed ends, the rest
   * dashed; with `inverse` only the kept part is reflected, and a vertex-form parabola kept on
   * x ≥ h writes its inverse h + √((x − k) ÷ a).
   */
  restrict?: { from?: NumOrVar; to?: NumOrVar };
}

/** H94: a rational function by its coefficients, (px + q) ÷ (rx + s). */
export interface RationalByCoefficients {
  family: 'rational';
  p: NumOrVar;
  q: NumOrVar;
  r: NumOrVar;
  s: NumOrVar;
}

/**
 * H95: two more `algebraTiles` modes. `box`: a generic rectangle for a product past the tiles,
 * one factor's terms across the top and the other's down the side (coefficients, highest power
 * first), every cell their product, each diagonal of like terms in its own tint and collected
 * under the box; `product` names the product's coefficients (checked). `monomial`: a·xᵐ ÷ b·xⁿ
 * written out as factors, x·x·x… over x·x, the pairs that cancel struck, a negative exponent's
 * factors on the other side of the bar; `c` and `k` name the answer c·xᵏ (checked).
 */
export type AlgebraTilesHs2g =
  | { mode: 'box'; top: NumOrVar[]; side: NumOrVar[]; product?: string[] }
  | {
      mode: 'monomial';
      a: NumOrVar;
      m: NumOrVar;
      b: NumOrVar;
      n: NumOrVar;
      c?: string;
      k?: string;
    };

/** Every variable id these options name (for the module tests). */
export function hs2gSpecVars(r: Representation): string[] {
  const ids = (...xs: (NumOrVar | boolean | undefined)[]): string[] =>
    xs.filter((x): x is string => typeof x === 'string');
  switch (r.kind) {
    case 'termsChart':
      return ids(r.plus, r.lit, r.litTerm);
    case 'functionGraph':
      return ids(r.horizontal, r.restrict?.from, r.restrict?.to);
    case 'algebraTiles':
      return r.mode === 'box'
        ? ids(...r.top, ...r.side, ...(r.product ?? []))
        : r.mode === 'monomial'
          ? ids(r.a, r.m, r.b, r.n, r.c, r.k)
          : [];
    default:
      return [];
  }
}
