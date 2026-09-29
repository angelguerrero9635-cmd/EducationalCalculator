/**
 * Picture specs for the Grades 9–12 geometry pictures of group HC (H04, H05, H12 in
 * `pictureRequestsHs.ts`): a triangle solved to scale, a figure with its congruence marks, and
 * the circle theorems. Kept apart from `types.ts` so that file's union only lists them. Every
 * string is a variable id; a number is a fixed value the page doesn't ask for.
 */

/** A triangle's parts: sides a, b, c opposite the angles A, B, C (degrees). */
export type TriPart = 'a' | 'b' | 'c' | 'A' | 'B' | 'C';

/** Three names, for the vertices A, B, C of a triangle (or D, E, F of its copy). */
export type TriNames = [string, string, string];

/**
 * A triangle drawn to scale from any three of its parts (a side among them). Parts the student
 * typed (or the example's) are the given parts, drawn in the highlight with their marks; the
 * worked-out parts are labelled in ink once known, "?" before. Values that make no triangle
 * (sides that don't close, angles past 180°) draw faded with the reason in the caption. When
 * the given parts are two sides and an angle opposite one of them (SSA) and two triangles fit,
 * both are drawn: the one the values hold solid, the other dashed.
 */
export interface TriangleSolverSpec {
  kind: 'triangleSolver';
  /** Each part: a value id, or a fixed number (C: 90 for a right triangle). */
  parts: Partial<Record<TriPart, string | number>>;
  /** Vertex names (default A, B, C). */
  names?: TriNames;
  /** The parts the problem gives, marked; default: the values typed (or the example's). */
  given?: TriPart[];
  /**
   * Two congruent triangles, the copy (D, E, F) turned over beside the first, the given parts
   * matched by tick marks and arcs, and the criterion between them. `criterion` defaults to
   * what the given parts are: SSS, SAS, ASA, AAS, HL (a right angle, the hypotenuse and a leg)
   * or SSA, which draws the two triangles SSA allows to show it proves nothing.
   */
  congruence?: { criterion?: 'SSS' | 'SAS' | 'ASA' | 'AAS' | 'HL'; names?: TriNames };
  /**
   * A similar triangle (D, E, F) at the scale factor `scale` (a value id), beside the first,
   * the equal angles matched by arcs; `sides` are its sides' value ids, labelled.
   */
  similar?: { scale: string; sides?: Partial<Record<'a' | 'b' | 'c', string>>; names?: TriNames };
  /**
   * Right-triangle trig: the right angle at C, θ at `angle`, the sides named opposite,
   * adjacent and hypotenuse from θ; the caption works sin, cos and tan of θ.
   */
  trig?: { angle: 'A' | 'B' };
  /**
   * A special right triangle (right angle at C; A = 45° or 30°): every side exact as a
   * radical (5√2, 4√3) and the side ratio 1 : 1 : √2 or 1 : √3 : 2 beside it.
   */
  special?: '45-45-90' | '30-60-90';
  /**
   * The right triangle as a real thing (right angle at C on the ground, the angle at A):
   * a wooden ramp, a ladder against a wall, or a line of sight to a treetop at an angle of
   * elevation from an eye `eye` units above the ground (a value id or number, default none).
   */
  scene?: { kind: 'ramp' | 'ladder' | 'sight'; eye?: string | number };
  /** Values a drag keeps (default: the other given parts). */
  keep?: string[];
  /** No handles (the default drag moves vertex B along side c when c is given). */
  fixed?: boolean;
}

/** A point of a marked figure: numbers, or value ids read as coordinates. */
export type FigurePoint = [string | number, string | number];

/**
 * A part of a marked figure, by point names: 'AB' a segment, ray or line, 'ABC' the angle at B.
 * Marks mean what they say: `ticks` sides with equal counts are equal, `arcs` angles with equal
 * counts are equal, `right` a right angle, `parallel` segments with equal counts are parallel.
 */
export type FigurePart =
  | { segment: string; dashed?: boolean }
  | { ray: string }
  | { line: string; dashed?: boolean }
  | { ticks: string; count: number }
  | { arcs: string; count: number }
  | { right: string }
  | { parallel: string; count: number }
  | { circle: string; through: string; dashed?: boolean }
  /** A value (id) or text beside a segment or inside an angle; `inCaption` writes it under the figure. */
  | { label: string; value?: string; text?: string; inCaption?: boolean };

/**
 * A proof step lit on the figure: the parts it uses (`given`) in one tint, the part it proves
 * in another; refs are the part names ('AB', 'ABC', a triangle '△ABD').
 */
export interface ProofStep {
  given: string[];
  proved: string[];
  /** The statement and its reason, under the figure. */
  text: string;
}

/**
 * A geometry figure with its marks, from named points (numbers or value ids) or a preset:
 * - `transversal`: two lines cut by a transversal at `angle` (angle 1), angles 1–8 numbered and
 *   equal ones matched by arcs; `second` (angle 5) tilts the second line when it differs, and
 *   the parallel arrows show only when the lines are parallel; `highlight` lights angle
 *   numbers (a pair: corresponding, alternate interior …).
 * - `triangle`: a triangle (`points`, or `sides` as three value ids) with its three medians,
 *   angle bisectors, perpendicular bisectors or altitudes and their center, or a midsegment.
 * - `quadrilateral`: a family drawn from `width`, `height` (or `side`), `angle`, with its
 *   diagonals and the marks the family has.
 * Every mark is worked out from the drawn figure, so it means exactly what it says.
 */
export interface MarkedFigureSpec {
  kind: 'markedFigure';
  /** Named points (plain figures, and the triangle preset's corners A, B, C). */
  points?: Record<string, FigurePoint>;
  /** The parts to draw on the points, in order. */
  parts?: FigurePart[];
  transversal?: {
    angle: string | number;
    second?: string | number;
    /** Angle numbers (1–8) lit, e.g. [3, 6] for alternate interior angles. */
    highlight?: number[];
    /** Values labelled in angles by number, e.g. { 1: 'x', 6: 'y' }. */
    labels?: Record<number, string>;
  };
  triangle?: {
    /** Three side values (BC, CA, AB) instead of `points`: the triangle from its sides. */
    sides?: [string | number, string | number, string | number];
    lines?: 'median' | 'bisector' | 'perpendicular' | 'altitude' | 'midsegment';
    /** With `lines`: its point of concurrency, and the circle it centers (in/circumcircle). */
    center?: boolean;
    /** Values labelled on parts, e.g. { AG: 'ag', GM: 'gm' } (G the center, M midpoints). */
    labels?: Record<string, string>;
  };
  quadrilateral?: {
    family: 'parallelogram' | 'rectangle' | 'rhombus' | 'square' | 'trapezoid' | 'kite';
    /** The base (AB), or the square's or rhombus's side. */
    width: string | number;
    /** The height (parallelogram, rectangle, trapezoid), or the kite's lower diagonal part. */
    height?: string | number;
    /** The angle at A (parallelogram, rhombus, trapezoid), degrees. */
    angle?: string | number;
    /** The trapezoid's top side DC. */
    top?: string | number;
    diagonals?: boolean;
    labels?: Record<string, string>;
  };
  /** Proof steps; `step` (a value id, 1 to the count) picks the one lit. */
  proof?: { step: string; steps: ProofStep[] };
}

/**
 * A circle with its theorem drawn from the values, points dragged along the circle:
 * - `inscribed`: the central angle AOB (`central`, the arc) and the inscribed angle APB
 *   (`inscribed`), half of it; P slides along the far arc and the angle stays the same.
 * - `semicircle`: AB a diameter, P on the circle, the right angle at P; `angle` is the angle
 *   at A, `other` the angle at B.
 * - `tangent`: the tangent at T at right angles to the radius, P on it: `radius`, `tangent`
 *   (PT) and `distance` (OP), r² + t² = d².
 * - `chords`: chords AB and CD crossing at E, AE × EB = CE × ED (`segments`: AE, EB, CE, ED).
 * - `secants`: from P outside, PA × PB = PC × PD (`segments`: PA, PB, PC, PD, whole lengths).
 * - `secantTangent`: PT² = PA × PB (`segments`: PT, PA, PB).
 * A figure the values can't make (an inscribed angle that isn't half its arc, products that
 * differ) draws faded with the reason in the caption.
 */
export interface CircleTheoremsSpec {
  kind: 'circleTheorems';
  theorem: 'inscribed' | 'semicircle' | 'tangent' | 'chords' | 'secants' | 'secantTangent';
  central?: string;
  inscribed?: string;
  angle?: string;
  other?: string;
  radius?: string;
  tangent?: string;
  distance?: string;
  segments?: string[];
  /** The products (chords, secants): value ids, labelled with the product. */
  product?: string;
  /** No handles. */
  fixed?: boolean;
}

export type HscSpec = TriangleSolverSpec | MarkedFigureSpec;

const ids = (xs: unknown[]): string[] => xs.filter((x): x is string => typeof x === 'string');

/** Every variable a group HC picture reads (modules.test.ts). */
export function hscSpecVars(r: HscSpec): string[] {
  switch (r.kind) {
    case 'triangleSolver':
      return ids([
        ...Object.values(r.parts),
        ...(r.similar ? [r.similar.scale, ...Object.values(r.similar.sides ?? {})] : []),
        r.scene?.eye,
        ...(r.keep ?? []),
      ]);
    case 'markedFigure':
      return ids([
        ...Object.values(r.points ?? {}).flat(),
        ...(r.parts ?? []).map((p) => ('value' in p ? p.value : undefined)),
        r.transversal?.angle,
        r.transversal?.second,
        ...Object.values(r.transversal?.labels ?? {}),
        ...(r.triangle?.sides ?? []),
        ...Object.values(r.triangle?.labels ?? {}),
        r.quadrilateral?.width,
        r.quadrilateral?.height,
        r.quadrilateral?.angle,
        r.quadrilateral?.top,
        ...Object.values(r.quadrilateral?.labels ?? {}),
        r.proof?.step,
      ]);
  }
}
