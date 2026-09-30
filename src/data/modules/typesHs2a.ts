/**
 * Picture options for Grades 9–12, round 2, group A (H89–H92; see pictureRequestsHs.ts): a sign
 * box that drives a picture, the number line's window and ticks, the equal compound, and the
 * line system's upright boundaries, marks and given point. Kept apart from the kinds' own type
 * files so those only gain a line each. A `NumOrVar` field is a fixed number or a variable id.
 */
import type { Representation } from './types';
import type { InequalitySign, NumOrVar } from './typesGraphs';

/**
 * H90: a sign box driving a picture. `sign` is the id of the value holding the sign's code as
 * `{s:sign}` stores it (1 <, 2 ≤, 3 >, 4 ≥; 5 = from a relation box; 6 ≠); `flip`, a value
 * id, reverses the sign while that value is negative (both sides divided by it).
 */
export interface SignOf {
  sign: string;
  flip?: string;
}

/** An inequality's sign: fixed, or from a sign box. */
export type ShadeSign = InequalitySign | SignOf;

/** H90: the one-variable inequality f(x) (sign) 0 on `functionGraph`. */
export interface FunctionGraphHs2a {
  /**
   * Where the curve is above (>, ≥) or below (<, ≤) the x-axis: that region between the curve
   * and the axis shaded, the solutions drawn on the x-axis with closed (≤, ≥) or open (<, >)
   * circles at the zeros, and written in the caption ("−2 < x < 4").
   */
  inequality?: SignOf;
}

/** H92: `lineSystem`'s upright boundaries, marks and the given point. */
export interface LineSystemHs2a {
  /**
   * Upright lines x = k, or boundaries x (sign) k with `shade` (right of the line for > and ≥,
   * left for < and ≤; dashed when strict). Drawn in their own colour; their shading counts in
   * the overlap with the lines' (a box: −1 ≤ x ≤ 1 with −2 ≤ y ≤ 2 as two flat lines).
   */
  upright?: { x: NumOrVar; shade?: ShadeSign; label?: string }[];
  /**
   * Parallel arrows on both lines when their slopes are equal (and they are two lines); a
   * right-angle square where they cross when the slopes multiply to −1.
   */
  marks?: boolean;
  /** The given point (x₀, y₀), marked and labelled: the second line goes through it. */
  given?: { x: NumOrVar; y: NumOrVar };
}

/** H89: `integerLine`'s window and ticks. */
export interface IntegerLineHs2a {
  /**
   * The line spans its own values (the bounds, the center, the test number) with a margin,
   * rather than 0 and `min` to `max`: 10 ≤ x ≤ 30 draws 5 to 35, 344 to 356 draws 340 to 360.
   */
  fit?: boolean;
  /** A tick every `ticks` (5 or 10, say), labelled where they fit. */
  ticks?: number;
}

/** Every variable id these options name (for the module tests). */
export function hs2aSpecVars(r: Representation): string[] {
  const ids = (...xs: (NumOrVar | ShadeSign | boolean | undefined)[]): string[] =>
    xs.flatMap((x) =>
      typeof x === 'object' ? ids(x.sign, x.flip) : typeof x === 'string' ? [x] : [],
    );
  const sign = (s: ShadeSign | undefined) => (typeof s === 'object' ? ids(s) : []);
  switch (r.kind) {
    case 'linearFunction':
      return sign(r.shade);
    case 'lineSystem':
      return [
        ...r.lines.flatMap((l) => sign(l.shade)),
        ...(r.upright ?? []).flatMap((u) => [...ids(u.x), ...sign(u.shade)]),
        ...ids(r.given?.x, r.given?.y),
      ];
    case 'functionGraph':
      return r.inequality ? ids(r.inequality) : [];
    case 'integerLine':
      return (r.compound?.closed ?? []).flatMap((x) => (typeof x === 'string' ? [x] : []));
    case 'normalCurve':
      return typeof r.test?.tail === 'object' ? ids(r.test.tail) : [];
    default:
      return [];
  }
}
