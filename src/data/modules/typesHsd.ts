/**
 * Picture specs for Grades 9–12, group D (see docs/RENDERINGS_HS.md, H06–H11 and H14): the unit
 * circle, algebra tiles, vectors, the complex plane, the polar grid, conics and matrices. Kept
 * apart from `types.ts` so that file's union only lists them. A `NumOrVar` field is a fixed
 * number or a variable id.
 */
import type { NumOrVar } from './typesGraphs';

/** A trig function of the unit circle. */
export type TrigFn = 'sin' | 'cos' | 'tan';

/**
 * The unit circle: an angle θ from the positive x-axis (counterclockwise for a positive angle,
 * more than one turn drawn as a spiral), its point (cos θ, sin θ) with the reference triangle
 * (the cosine and sine as its legs) and the reference angle, and the special angles marked.
 * Drag the point around the circle to change θ.
 */
export interface UnitCircleSpec {
  kind: 'unitCircle';
  /** The angle θ. */
  angle: NumOrVar;
  /**
   * How the angle's value is held: degrees (default), radians, or a multiple of π (a variable
   * with `fraction: 12` holding 5/6 for 5π/6, so the box shows the fraction).
   */
  measure?: 'degrees' | 'radians' | 'pi';
  /** Labels in degrees or radians (default: degrees for `degrees`, radians otherwise). */
  show?: 'degrees' | 'radians';
  /** Variables holding cos θ, sin θ and tan θ, when the page works them out (checked). */
  cos?: string;
  sin?: string;
  tan?: string;
  /** Unroll sine or cosine beside the circle, the same point marked on both. */
  graph?: 'sin' | 'cos';
  /**
   * Every angle on one turn (0° ≤ θ < 360°) where the function takes `value`, marked on the
   * circle: the line y = value (sine), x = value (cosine) or the line through the origin of
   * slope value (tangent). `angles` are the variables holding the solutions (checked).
   * `principal` marks only the inverse function's answer and shades its range (arcsin and
   * arctan: −90° to 90°; arccos: 0° to 180°).
   */
  solutions?: { fn: TrigFn; value: NumOrVar; angles?: string[]; principal?: boolean };
  /** The arc from 0 to θ, its length the angle in radians (a variable holding it, checked). */
  arc?: string;
  /** Typed values held while the point is dragged (see `LineOf.keep`). */
  keep?: string[];
  /** No handle. */
  fixed?: boolean;
}

/** A polynomial ax² + bx + c by its coefficients (numbers or variables; a missing one is 0). */
export interface TileCounts {
  x2?: NumOrVar;
  x?: NumOrVar;
  unit?: NumOrVar;
}

/**
 * Algebra tiles: x² tiles (x by x), x tiles (x by 1) and unit tiles (1 by 1), positive in one
 * color and negative in the other, each count from a coefficient from −10 to 10.
 *
 * - `collect`: a polynomial's tiles, and `plus` a second one's beside them; each positive tile
 *   with a negative one of the same size is a zero pair, struck out. `sum` names the result's
 *   coefficients (checked).
 * - `rectangle`: the factors (px + q)(rx + s) along the top and left edges and the product
 *   filling the rectangle. `given: 'factors'` multiplies them; `given: 'product'` factors the
 *   trinomial `product` (its tiles arranged into the rectangle). `product` names the
 *   coefficients of the product (checked).
 * - `square`: completing the square of x² + bx + c: the x² tile, b/2 x tiles on two sides and
 *   the missing corner of (b/2)² unit tiles drawn dashed; c's tiles beside it. `k` names b/2
 *   and `missing` names (b/2)² (checked).
 * - `equation`: ax + b = cx + d on a mat, the two sides split by the equals sign; `solution`
 *   names x (checked: both sides equal there).
 */
export type AlgebraTilesSpec = { kind: 'algebraTiles' } & (
  | { mode: 'collect'; tiles: TileCounts; plus?: TileCounts; sum?: TileCounts }
  | {
      mode: 'rectangle';
      /** (px + q) across the top, (rx + s) down the left. */
      factors: { p: NumOrVar; q: NumOrVar; r: NumOrVar; s: NumOrVar };
      product?: TileCounts;
      given?: 'factors' | 'product';
    }
  | { mode: 'square'; b: NumOrVar; c?: NumOrVar; k?: string; missing?: string }
  | {
      mode: 'equation';
      left: { x: NumOrVar; unit: NumOrVar };
      right: { x: NumOrVar; unit: NumOrVar };
      solution?: string;
    }
);

export type HsdSpec = UnitCircleSpec | AlgebraTilesSpec;

/** The variable ids a spec above names (for the module tests). */
export function hsdSpecVars(r: HsdSpec): string[] {
  const ids = (...xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  switch (r.kind) {
    case 'unitCircle':
      return ids(
        r.angle,
        r.cos,
        r.sin,
        r.tan,
        r.arc,
        r.solutions?.value,
        ...(r.solutions?.angles ?? []),
      );
    case 'algebraTiles': {
      const t = (x?: TileCounts) => (x ? [x.x2, x.x, x.unit] : []);
      switch (r.mode) {
        case 'collect':
          return ids(...t(r.tiles), ...t(r.plus), ...t(r.sum));
        case 'rectangle':
          return ids(r.factors.p, r.factors.q, r.factors.r, r.factors.s, ...t(r.product));
        case 'square':
          return ids(r.b, r.c, r.k, r.missing);
        case 'equation':
          return ids(r.left.x, r.left.unit, r.right.x, r.right.unit, r.solution);
      }
    }
  }
}
