/**
 * Picture specs for Grade 8 functions, systems and transformations (kept apart from
 * `types.ts` so that file's union only lists them). A `number | string` field is a fixed
 * number or a variable id.
 */

import { secondMoveVars, type SecondMove } from './typesHsf';

/** A number fixed by the picture, or the id of a variable that holds it. */
export type NumOrVar = number | string;

/**
 * y = mx + b on a coordinate grid: the line, the y-intercept (0, b) marked, and a slope
 * triangle from the intercept (run the fraction's bottom, so 2/3 rises 2 over 3). Drag the
 * intercept up and down, the triangle's corner to change the slope, and the point along
 * the line.
 */
export interface LinearFunctionSpec {
  kind: 'linearFunction';
  slope: NumOrVar;
  intercept: NumOrVar;
  /** A point on the line, (x, y); y usually follows from the relation. */
  point?: { x: string; y: string };
  /**
   * Largest |coordinate| on the grid (default 10; grows to fit); { x, y } for a context whose
   * axes differ (12 months across, $600 up).
   */
  extent?: number | { x: number; y: number };
  /** 4 (default) or the first quadrant only (a context: hours, dollars). */
  quadrants?: 1 | 4;
  /** Axis names for a context, e.g. { x: 'Hours', y: 'Cost ($)' }. */
  axes?: { x?: string; y?: string };
  /** Typed values held while the line is dragged (see `LineOf.keep`). */
  keep?: string[];
  /** No handles: every value on the line is worked out from points the student typed. */
  fixed?: boolean;
  /** Grades 9–12: the inequality y (sign) mx + b, its half-plane shaded (see `LineOf.shade`). */
  shade?: InequalitySign;
}

/**
 * Two lines y = m₁x + b₁ and y = m₂x + b₂ on one grid, the point where they cross marked
 * (none when parallel; the same line twice is every point). Each line's intercept (and a
 * slope point, when the slope is a variable) drags.
 */
export interface LineSystemSpec {
  kind: 'lineSystem';
  lines: [LineOf, LineOf];
  /** The solution's x and y, when the module solves for them (the crossing is labelled). */
  solution?: { x: string; y: string };
  extent?: number | { x: number; y: number };
  quadrants?: 1 | 4;
  axes?: { x?: string; y?: string };
  /**
   * Grades 9–12 elimination: the sum `x`·x + `y`·y = `c` of the two equations (each multiplied
   * first, as the page does), drawn as a third line through the solution; with `y` 0 it is the
   * upright line x = c ÷ `x`. `label` names it ("Sum").
   */
  sum?: { x: NumOrVar; y: NumOrVar; c: NumOrVar; label?: string };
  /** No handles: the lines are worked out from other values (standard-form coefficients). */
  fixed?: boolean;
  /** Grades 9–12: a point tested in both inequalities (in the overlap or not). */
  test?: { x: NumOrVar; y: NumOrVar };
}

/** An inequality's sign, y (sign) mx + b. */
export type InequalitySign = '<' | '≤' | '>' | '≥';

export interface LineOf {
  slope: NumOrVar;
  intercept: NumOrVar;
  /** A short name for the line ("Gym A"); default the equation. */
  label?: string;
  /**
   * Typed values held while this line's slope or intercept is dragged, so the one input left
   * free follows the drag instead of the oldest input being cleared (the cubic yards, while
   * the cost follows).
   */
  keep?: string[];
  /**
   * Grades 9–12: the inequality y (sign) mx + b. Its half-plane is shaded in the line's color
   * (above for > and ≥, below for < and ≤), the boundary dashed for < and > (left out) and
   * solid for ≤ and ≥; two shaded lines show their overlap, the system's solutions.
   */
  shade?: InequalitySign;
}

/** One step of a function rule: add, subtract, multiply or divide by a number. */
export interface RuleStep {
  op: '+' | '−' | '×' | '÷';
  by: NumOrVar;
}

/**
 * An input-output machine: the input goes in, each step of the rule works on it in turn,
 * and the output comes out. `table` lists more inputs with their outputs beside it.
 */
export interface FunctionMachineSpec {
  kind: 'functionMachine';
  input: string;
  output: string;
  rule: RuleStep[];
  /** Other inputs (numbers) shown with their outputs in an input-output table. */
  table?: number[];
}

/**
 * A relation as input-output pairs: a mapping diagram (inputs in one oval, outputs in the
 * other, an arrow for each pair) and/or its graph with a vertical line to drag (the
 * vertical-line test). An input with two outputs is marked: not a function.
 */
export interface MappingSpec {
  kind: 'mapping';
  pairs: { x: NumOrVar; y: NumOrVar }[];
  /** 'both' (default): the diagram and the graph; or one of them. */
  view?: 'both' | 'arrows' | 'graph';
}

/** A mirror line: an axis, a diagonal, or the vertical line x = a / horizontal line y = b. */
export type Mirror = 'x-axis' | 'y-axis' | 'y = x' | 'y = −x' | { x: NumOrVar } | { y: NumOrVar };

/**
 * A figure (its corners A, B, C, … on a grid) and its image A′, B′, C′ after one move:
 * a translation (the slide arrow), a reflection (the mirror line), a rotation (the center
 * and the angle, counterclockwise for a positive angle) or a dilation (the center, the rays
 * and the scale factor). Drag the image (or the mirror line) to change the move.
 */
export type TransformationSpec = {
  kind: 'transformation';
  /** The corners in order, 2 to 6 of them (numbers or variables). */
  figure: [NumOrVar, NumOrVar][];
  /** A′'s coordinates as values, when the module works them out (checked against the move). */
  image?: { x: string; y: string };
  extent?: number;
  quadrants?: 1 | 4;
  /** Grades 9–12: a second move after the first; A′ drawn dashed between, A″ the final image. */
  then?: SecondMove;
  /** A″'s coordinates as values, when the module works them out (checked against both moves). */
  image2?: { x: string; y: string };
  /** Grades 9–12: the figure's lines of symmetry and its order of rotational symmetry. */
  symmetry?: boolean;
} & (
  | { move: 'translate'; right: NumOrVar; up: NumOrVar }
  | { move: 'reflect'; mirror: Mirror }
  | { move: 'rotate'; angle: NumOrVar; center?: [NumOrVar, NumOrVar] }
  | { move: 'dilate'; factor: NumOrVar; center?: [NumOrVar, NumOrVar] }
);

/** The variable ids a spec above names (for the module tests). */
export function graphSpecVars(
  r: LinearFunctionSpec | LineSystemSpec | FunctionMachineSpec | MappingSpec | TransformationSpec,
): string[] {
  const ids = (...xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  switch (r.kind) {
    case 'linearFunction':
      return ids(r.slope, r.intercept, r.point?.x, r.point?.y);
    case 'lineSystem':
      return ids(
        ...r.lines.flatMap((l) => [l.slope, l.intercept]),
        r.solution?.x,
        r.solution?.y,
        r.sum?.x,
        r.sum?.y,
        r.sum?.c,
        r.test?.x,
        r.test?.y,
      );
    case 'functionMachine':
      return ids(r.input, r.output, ...r.rule.map((s) => s.by));
    case 'mapping':
      return ids(...r.pairs.flatMap((p) => [p.x, p.y]));
    case 'transformation': {
      const move =
        r.move === 'translate'
          ? [r.right, r.up]
          : r.move === 'reflect'
            ? typeof r.mirror === 'object'
              ? ['x' in r.mirror ? r.mirror.x : r.mirror.y]
              : []
            : r.move === 'rotate'
              ? [r.angle, ...(r.center ?? [])]
              : [r.factor, ...(r.center ?? [])];
      const then = secondMoveVars(r.then);
      return ids(...r.figure.flat(), r.image?.x, r.image?.y, ...move, ...then).concat(
        ids(r.image2?.x, r.image2?.y),
      );
    }
  }
}
