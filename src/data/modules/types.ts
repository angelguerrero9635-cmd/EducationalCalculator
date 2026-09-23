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
  /**
   * Ten-frame with two colors of counters: `first` dark, then `second` light, `total` in all.
   * Tap a cell inside the dark counters to set `first`; beyond them to set `total`.
   */
  | { kind: 'tenFrame'; first: string; second: string; total: string }
  /** Bar chart. Bars marked `editable` can be dragged; the range grows to fit the values. */
  | {
      kind: 'bars';
      bars: { var: string; editable?: boolean }[];
      /** Smallest range shown (grows to fit larger values). */
      min: number;
      max: number;
      total?: string;
    }
  /** Picture graph: one column of icons per category; tap a cell to set that count. */
  | {
      kind: 'pictureGraph';
      columns: { var: string; icon: 'circle' | 'square' | 'triangle' }[];
      max: number;
      total?: string;
    }
  /**
   * Waterfall chart: each item adds (`sign: 1`) or subtracts (`sign: -1`) from a running total,
   * ending with the `total` bar. Editable items can be dragged.
   */
  | {
      kind: 'waterfall';
      items: { var: string; sign: 1 | -1; editable?: boolean }[];
      total: string;
      /** Subtotals listed under the chart (e.g. natural increase, net migration). */
      caption?: string[];
    }
  /**
   * Rectangle with side lengths and a value written inside. Drag the corner. `extent` is the
   * smallest side length the drawing fits; it grows for larger values.
   */
  | { kind: 'rectangle'; length: string; width: string; inside?: string; extent: number }
  /** 10 × 10 grid with `percent` squares shaded. Tap a square to set the percent. */
  | { kind: 'grid100'; percent: string; caption?: { part: string; whole: string } }
  /** Circle with a radius handle; optional labels for diameter, circumference and area. */
  | {
      kind: 'circle';
      radius: string;
      extent: number;
      diameter?: string;
      circumference?: string;
      area?: string;
    }
  /** Right triangle (vertical leg `a`, horizontal leg `b`, hypotenuse `c`) with side squares. */
  | { kind: 'rightTriangle'; a: string; b: string; c: string; extent: number }
  /**
   * Graph of `y` against `x`. The curve is computed by the solver with `params` held at
   * their current values; the point sits at the current (x, y) and drags along x.
   */
  | {
      kind: 'plot';
      x: Axis;
      y: Axis;
      params: string[];
      /** Grow the axes to keep the point and curve in view (axis ranges are the minimum). */
      autoRange?: boolean;
      /** Draw the tangent through the point with this slope variable. */
      tangentSlope?: string;
      /** Draw a rise/run triangle (run 1) at the point, using this slope variable. */
      slopeTriangle?: string;
      /** Mark the y-intercept (0, value of this variable). */
      intercept?: string;
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
      /** Smallest force / acceleration the arrows are scaled to (grows to fit). */
      forceExtent: number;
      accelerationExtent: number;
    }
  /**
   * Series circuit: a source `source` driving `current` through resistors in a loop, each
   * labeled with its resistance and voltage drop. Drag the source or a resistor up or down.
   */
  | {
      kind: 'seriesCircuit';
      source: string;
      current: string;
      resistors: { r: string; v: string }[];
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
  /**
   * Variables pre-filled from the example when the module opens, oldest first. When a student
   * types another value, the oldest input is the one recalculated, so list first the value
   * students most often solve for (e.g. x in f(x) = c·xⁿ, t in kinematics).
   */
  startWith: string[];
  representation: Representation;
}
