/**
 * Picture specs for Grades 9–12, group D (see docs/RENDERINGS_HS.md, H06–H11 and H14): the unit
 * circle, algebra tiles, vectors, the complex plane, the polar grid, conics and matrices. Kept
 * apart from `types.ts` so that file's union only lists them. A `NumOrVar` field is a fixed
 * number or a variable id.
 */
import type {
  AlgebraTilesHs2g,
  ComplexPlaneHs2g,
  SolutionsAlso,
  UnitCircleHs2g,
} from './typesHs2g';
import type { NumOrVar } from './typesGraphs';

/** A trig function of the unit circle. */
export type TrigFn = 'sin' | 'cos' | 'tan';

/**
 * The unit circle: an angle θ from the positive x-axis (counterclockwise for a positive angle,
 * more than one turn drawn as a spiral), its point (cos θ, sin θ) with the reference triangle
 * (the cosine and sine as its legs) and the reference angle, and the special angles marked.
 * Drag the point around the circle to change θ.
 */
export interface UnitCircleSpec extends UnitCircleHs2g {
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
  solutions?: {
    fn: TrigFn;
    value: NumOrVar;
    angles?: string[];
    principal?: boolean;
  } & SolutionsAlso;
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
  | AlgebraTilesHs2g // H95: 'box' and 'monomial'
);

/**
 * One vector: by its components (x, y) or by its magnitude and direction (degrees from the
 * positive x-axis, counterclockwise), with a name ("u", "F₁", "boat").
 */
export interface VectorOf {
  name: string;
  x?: NumOrVar;
  y?: NumOrVar;
  magnitude?: NumOrVar;
  direction?: NumOrVar;
}

/**
 * Vectors as arrows on a grid, given by components or by magnitude and direction. `sum` adds
 * two vectors tip to tail or as a parallelogram, the resultant drawn in its own color; `scalar`
 * draws k times the first vector; `angle` marks the angle between two vectors, with the dot
 * product's sign. Physics pages pass `unit` (m/s, N) and `axes` names. Drag a vector's tip.
 */
export interface VectorDiagramSpec {
  kind: 'vectorDiagram';
  vectors: [VectorOf] | [VectorOf, VectorOf];
  sum?: 'tipToTail' | 'parallelogram';
  /** The resultant's values, when the page works them out (checked). */
  result?: { name?: string; x?: string; y?: string; magnitude?: string; direction?: string };
  /** k times the first vector; x and y name its components (checked). */
  scalar?: { k: NumOrVar; x?: string; y?: string };
  /** The angle between the two vectors (degrees) and their dot product (checked). */
  angle?: { value?: string; dot?: string };
  /** Dashed x and y components of each vector. */
  components?: boolean;
  /** The unit of every vector's size ("m/s", "N"). */
  unit?: string;
  axes?: { x: string; y: string };
  keep?: string[];
  fixed?: boolean;
}

/** A complex number: a + bi by its parts, or r(cos θ + i sin θ) by its modulus and argument. */
export type ComplexOf = { re: NumOrVar; im: NumOrVar } | { modulus: NumOrVar; argument: NumOrVar };

/**
 * The complex plane: z = a + bi as a point and an arrow from 0, with the real and imaginary
 * axes. `conjugate` reflects it across the real axis; `w` with `op` adds a second number (the
 * parallelogram), subtracts it, or multiplies (moduli multiply, arguments add). `modulus` and
 * `argument` mark |z| and arg z (variables checked); `polar` writes z = r(cos θ + i sin θ).
 * Drag z's point.
 */
export interface ComplexPlaneSpec extends ComplexPlaneHs2g {
  kind: 'complexPlane';
  z: ComplexOf;
  conjugate?: boolean;
  w?: { re: NumOrVar; im: NumOrVar };
  op?: 'sum' | 'difference' | 'product';
  /** The answer's parts, when the page works them out (checked). */
  result?: { re?: string; im?: string };
  modulus?: string;
  argument?: string;
  polar?: boolean;
  keep?: string[];
  fixed?: boolean;
}

/** A polar curve r = f(θ), θ in degrees (the spiral's θ in radians inside r = aθ). */
export type PolarCurve =
  /** r = a, or r = a cos θ / a sin θ with `fn`. */
  | { shape: 'circle'; a: NumOrVar; fn?: 'cos' | 'sin' }
  /** r = a cos(nθ) or a sin(nθ): n petals when n is odd, 2n when even. */
  | { shape: 'rose'; a: NumOrVar; n: NumOrVar; fn?: 'cos' | 'sin' }
  /** r = a + b cos θ (or sin): a cardioid when a = b, a limaçon otherwise. */
  | { shape: 'cardioid'; a: NumOrVar; b?: NumOrVar; fn?: 'cos' | 'sin' }
  /** r = aθ, θ in radians, for `turns` turns (default 2). */
  | { shape: 'spiral'; a: NumOrVar; turns?: number };

/** A path x(t), y(t) by family; t in degrees for the circle and ellipse, seconds otherwise. */
export type ParametricPath =
  /** x = x₀ + at, y = y₀ + bt. */
  | { family: 'line'; x0: NumOrVar; y0: NumOrVar; a: NumOrVar; b: NumOrVar }
  /** x = h + a cos t, y = k + b sin t (a circle when a = b). */
  | { family: 'ellipse'; h: NumOrVar; k: NumOrVar; a: NumOrVar; b: NumOrVar }
  /** x = v cos α · t, y = y₀ + v sin α · t − ½gt² (g = 9.8 m/s²). */
  | { family: 'projectile'; v: NumOrVar; angle: NumOrVar; y0: NumOrVar };

/**
 * The polar grid: rings and rays every 30°, a point (r, θ) with its ray and angle (a negative r
 * points the opposite way), and a polar curve — circle, rose, cardioid or limaçon, spiral —
 * with the point on it. `parametric` swaps the rings for an x-y grid and traces x(t), y(t) with
 * arrows showing the direction t runs and the point at t. Drag the point.
 */
export interface PolarGridSpec {
  kind: 'polarGrid';
  point?: { r: NumOrVar; theta: NumOrVar; x?: string; y?: string };
  curve?: PolarCurve;
  parametric?: ParametricPath & {
    t: NumOrVar;
    /** The t values the path runs over. */
    range: [number, number];
    x?: string;
    y?: string;
  };
  /** θ labels in degrees (default) or radians. */
  show?: 'degrees' | 'radians';
  keep?: string[];
  fixed?: boolean;
}

/**
 * A conic from its equation, centered (or with its vertex) at (h, k):
 * - `circle`: (x − h)² + (y − k)² = r², the radius drawn;
 * - `parabola`: (x − h)² = 4p(y − k) (or (y − k)² = 4p(x − h) with `axis: 'horizontal'`), its
 *   focus p from the vertex and its directrix p on the other side;
 * - `ellipse`: (x − h)²/a² + (y − k)²/b² = 1, its axes and its foci c from the center
 *   (c² = |a² − b²|, along the longer axis);
 * - `hyperbola`: (x − h)²/a² − (y − k)²/b² = 1 (or opening up and down with `axis: 'vertical'`),
 *   its asymptotes, the a-by-b box and its foci (c² = a² + b²).
 * `c` names the focal distance (checked); `point` a point on the curve (checked). Drag the
 * center (or vertex), and the radius, the axes' ends or the focus.
 */
export type ConicGraphSpec = {
  kind: 'conicGraph';
  h?: NumOrVar;
  k?: NumOrVar;
  c?: string;
  point?: { x: string; y: string };
  keep?: string[];
  fixed?: boolean;
} & (
  | { conic: 'circle'; r: NumOrVar }
  | { conic: 'parabola'; p: NumOrVar; axis?: 'vertical' | 'horizontal' }
  | { conic: 'ellipse'; a: NumOrVar; b: NumOrVar }
  | { conic: 'hyperbola'; a: NumOrVar; b: NumOrVar; axis?: 'horizontal' | 'vertical' }
);

/** One row operation on an augmented matrix; rows count from 1. */
export type RowOp =
  /** Swap two rows. */
  | { swap: [number, number] }
  /** Multiply a row by a number (not 0). */
  | { scale: number; by: number }
  /** Add `times` × row `from` to row `to`. */
  | { add: number; from: number; times: number };

/**
 * Matrices in square brackets, up to 4 × 4.
 * - `multiply`: A × B = C, with the row of A and the column of B that make one entry of C lit
 *   and their products summed beside it; tap an entry of C to light its row and column.
 *   `product` names C's entries (checked).
 * - `rowReduce`: an augmented matrix (a system, its right-hand sides after the bar) and each
 *   row operation in turn, written beside the arrow to the next matrix; `solution` names the
 *   unknowns (checked against the first matrix).
 */
export type MatrixGridSpec = { kind: 'matrixGrid' } & (
  | {
      mode: 'multiply';
      a: NumOrVar[][];
      b: NumOrVar[][];
      product?: string[][];
      /** The entry of C lit first, [row, column] from 1 (default [1, 1]). */
      entry?: [number, number];
    }
  | {
      mode: 'rowReduce';
      system: NumOrVar[][];
      steps: RowOp[];
      solution?: string[];
    }
);

export type HsdSpec =
  | UnitCircleSpec
  | AlgebraTilesSpec
  | VectorDiagramSpec
  | ComplexPlaneSpec
  | PolarGridSpec
  | ConicGraphSpec
  | MatrixGridSpec;

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
        default:
          return []; // H95's modes: hs2gSpecVars
      }
    }
    case 'vectorDiagram':
      return ids(
        ...r.vectors.flatMap((v) => [v.x, v.y, v.magnitude, v.direction]),
        r.result?.x,
        r.result?.y,
        r.result?.magnitude,
        r.result?.direction,
        r.scalar?.k,
        r.scalar?.x,
        r.scalar?.y,
        r.angle?.value,
        r.angle?.dot,
      );
    case 'complexPlane':
      return ids(
        ...('modulus' in r.z ? [r.z.modulus, r.z.argument] : [r.z.re, r.z.im]),
        r.w?.re,
        r.w?.im,
        r.result?.re,
        r.result?.im,
        r.modulus,
        r.argument,
      );
    case 'polarGrid': {
      const fields = (o: object | undefined) =>
        o
          ? Object.entries(o)
              .filter(([k]) => !['shape', 'fn', 'family', 'range', 'turns'].includes(k))
              .map(([, x]) => x as NumOrVar)
          : [];
      return ids(...fields(r.point), ...fields(r.curve), ...fields(r.parametric));
    }
    case 'matrixGrid':
      return r.mode === 'multiply'
        ? ids(...r.a.flat(), ...r.b.flat(), ...(r.product ?? []).flat())
        : ids(...r.system.flat(), ...(r.solution ?? []));
    case 'conicGraph':
      return ids(
        r.h,
        r.k,
        r.c,
        r.point?.x,
        r.point?.y,
        ...(r.conic === 'circle' ? [r.r] : r.conic === 'parabola' ? [r.p] : [r.a, r.b]),
      );
  }
}
