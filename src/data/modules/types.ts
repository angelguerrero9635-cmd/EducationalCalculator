import type { Relation, Values, VariableDef } from '@/engine/types';

/** Plot axis: which variable it shows and the visible range. */
export interface Axis {
  var: string;
  min: number;
  max: number;
  label?: string;
}

/**
 * The table, chart or diagram that best shows a module's lesson. Every variable a
 * representation references must be one of the module's variables; interacting with it
 * sets those variables exactly like typing into the formula inputs.
 */
export type Representation =
  /** Number line: a point at `start`, a jump of `jump`, landing on `end`. Drag start or end. */
  | { kind: 'numberLine'; start: string; jump: string; end: string; min: number; max: number }
  /** Bar chart. Bars marked `editable` can be dragged; `total` is shown as a caption. */
  | {
      kind: 'bars';
      bars: { var: string; editable?: boolean }[];
      min: number;
      max: number;
      total?: string;
    }
  /** Rectangle with side lengths and a value written inside. Drag the corner. */
  | { kind: 'rectangle'; length: string; width: string; inside?: string; max: number }
  /** 10 × 10 grid with `percent` squares shaded. Tap a square to set the percent. */
  | { kind: 'grid100'; percent: string; caption?: { part: string; whole: string } }
  /** Circle with radius handle; optional labels for diameter, circumference and area. */
  | {
      kind: 'circle';
      radius: string;
      max: number;
      diameter?: string;
      circumference?: string;
      area?: string;
    }
  /** Right triangle with vertical leg `a`, horizontal leg `b` and hypotenuse `c`. */
  | { kind: 'rightTriangle'; a: string; b: string; c: string; max: number }
  /**
   * Graph of `y` against `x`. The curve is computed by the solver with `params` held at
   * their current values; the point sits at the current (x, y) and drags along x.
   */
  | {
      kind: 'plot';
      x: Axis;
      y: Axis;
      params: string[];
      /** Draw the tangent through the point with this slope variable. */
      tangentSlope?: string;
      /** Shade the area between the curve and the x-axis from x.min to the point. */
      shadeToPoint?: boolean;
    }
  /** Table sweeping `sweep` over `rows`, computing `output` with `params` held. Tap a row. */
  | { kind: 'table'; sweep: string; output: string; params: string[]; rows: number[] }
  /** Block of mass `mass` pushed by force `force`, with its acceleration arrow. Drag the force. */
  | {
      kind: 'force';
      force: string;
      mass: string;
      acceleration: string;
      maxForce: number;
      maxAcceleration: number;
    };

/** One rearrangement, explained: `expr` is the right-hand side as a display template. */
export interface StepText {
  expr: string;
  how: string;
}

export interface ModuleDef {
  /** Taxonomy skill id, or a course topic key (`<courseId>#<topicIndex>`). */
  id: string;
  assumptions: string[];
  variables: VariableDef[];
  relations: Relation[];
  /**
   * Step-by-step text: for each relation id, for each variable it can be solved for, the
   * rearranged expression and a plain-language explanation of the rearrangement.
   */
  steps: Record<string, Record<string, StepText>>;
  /** A consistent worked example (every variable). */
  example: Values;
  /** Variables pre-filled from the example when the module opens. */
  startWith: string[];
  representation: Representation;
}
