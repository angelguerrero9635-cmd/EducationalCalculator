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

/** Every variable id these options name (for the module tests). */
export function hs2gSpecVars(r: Representation): string[] {
  const ids = (...xs: (NumOrVar | boolean | undefined)[]): string[] =>
    xs.filter((x): x is string => typeof x === 'string');
  switch (r.kind) {
    case 'termsChart':
      return ids(r.plus, r.lit, r.litTerm);
    default:
      return [];
  }
}
