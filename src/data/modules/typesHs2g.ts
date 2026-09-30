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

/**
 * H97: a Venn diagram of counts (`venn` `chances` with `counts`): a, b and both are whole
 * counts out of `total` (drawn in the corner, outside the circles); each region shows its count,
 * neither = total − (a + b − both); the shaded region's count is `count` (checked) and `result`
 * stays its probability, count ÷ total.
 */
export interface VennCounts {
  counts?: { total: NumOrVar; count?: string };
}

/**
 * H97: a third stage on a chance tree (`treeDiagram` `chances`): `third[i][j]` are the chances
 * after first outcome i and second outcome j (the last one left out is 1 − the others), named
 * by `thirdNames`; `path3` extends `path` to a leaf, and `chance` is then the product of the
 * three branches on it.
 */
export interface TreeChancesHs2g {
  third?: NumOrVar[][][];
  thirdNames?: string[];
  thirdStage?: string;
  path3?: number;
}

/**
 * H97: probability as a fraction of two counts on Pascal's triangle: C(`n`, `k`) lit in the
 * second colour over the triangle's own C(n, k) (the page's n and k), and drawn as a fraction
 * under it, C(5, 3) ÷ C(9, 3) = 10/84 = 5/42. `count` and `chance` name the top count and the
 * probability (checked).
 */
export interface PascalFraction {
  fraction?: { n: NumOrVar; k: NumOrVar; count?: string; chance?: string };
}

/**
 * H98: `unitCircle` pictures past one angle (drawn by `UnitCircleHs2g.tsx`; `angle` names θ, or
 * A ± B with `pair`, and is checked).
 */
export interface UnitCircleHs2g {
  /**
   * A point (x, y) off the circle on θ's terminal side: the circle of radius r = √(x² + y²)
   * through it, the legs x and y, r along the ray, and the unit circle with its point
   * (x ÷ r, y ÷ r) = (cos θ, sin θ) where the ray crosses it. `r` names r's value (checked);
   * `cos`, `sin` and `tan` are x ÷ r, y ÷ r and y ÷ x.
   */
  through?: { x: NumOrVar; y: NumOrVar; r?: string };
  /**
   * Two angles in turn: A from the x-axis, then B on from A (counterclockwise for a sum,
   * clockwise for a difference) to `angle` = A ± B, the three points marked. `cos`, `sin` and
   * `tan` are A ± B's.
   */
  pair?: { a: NumOrVar; b: NumOrVar; op?: 'sum' | 'difference' };
}

/**
 * H98: the solutions of an equation with two values, sin x = −1/2 or sin x = 1 (a factored
 * quadratic): `solutions.also` is the second value, both lines drawn and every angle marked;
 * `angles` holds them all, in order (checked).
 */
export interface SolutionsAlso {
  also?: NumOrVar;
}

/**
 * H99: `complexPlane` powers and roots (drawn by `ComplexPowers.tsx`; no handle). `power: n`
 * marks z, z², …, zⁿ joined in turn (each turns by arg z and stretches by |z|), zⁿ lit;
 * `result` is zⁿ (checked). `roots: n` marks the n nth roots of z on the circle of radius
 * |z|^(1/n), a regular polygon, the first at arg z ÷ n; `result` is that first root (checked).
 */
export interface ComplexPlaneHs2g {
  power?: NumOrVar;
  roots?: NumOrVar;
}

/**
 * H99: `histogram` bars lit as a range: the probability bars from `from` to `to` (values k; a
 * side left out runs to the end), or the bins from `from` to `to` (1-based) of counts. The
 * caption adds them, "P(X ≥ 4) = P(4) + P(5)"; `total` names the sum (checked).
 */
export interface HistogramHs2g {
  range?: { from?: NumOrVar; to?: NumOrVar; total?: string };
}

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
    case 'venn':
      return 'chances' in r ? ids(r.chances.counts?.total, r.chances.counts?.count) : [];
    case 'treeDiagram':
      return 'chances' in r ? ids(...(r.chances.third ?? []).flat(2)) : [];
    case 'pascalTriangle':
      return ids(r.fraction?.n, r.fraction?.k, r.fraction?.count, r.fraction?.chance);
    case 'complexPlane':
      return ids(r.power, r.roots);
    case 'histogram':
      return ids(r.range?.from, r.range?.to, r.range?.total);
    case 'unitCircle':
      return ids(r.through?.x, r.through?.y, r.through?.r, r.pair?.a, r.pair?.b, r.solutions?.also);
    default:
      return [];
  }
}
