import type { Relation, Values, VariableDef } from '@/engine/types';
import type { UnitSystem } from '@/engine/units';

/**
 * Plot axis: which variable it shows and the visible range, as numbers in the shown unit.
 * The label defaults to the symbol and the current unit, e.g. "t (s)".
 */
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
  /**
   * Number line: a point at `start`, a jump of `jump`, landing on `end`. Drag start or end.
   * `tick` sets the labeled tick spacing (default 1).
   */
  | {
      kind: 'numberLine';
      start: string;
      jump: string;
      end: string;
      min: number;
      max: number;
      tick?: number;
    }
  /**
   * Ten-frames with two colors of counters: `first` dark, then `second` light, `total` in all.
   * `second` and `total` may be fixed numbers (e.g. "one more", "make 10"). Tap a cell inside
   * the dark counters to set `first`; beyond them to set the total (or the second group).
   */
  | {
      kind: 'tenFrame';
      first: string;
      second: string | number;
      total: string | number;
      /** 1 frame (10) or 2 frames (20). */
      frames?: 1 | 2;
    }
  /** Hundred chart (rows of ten). Tap a number to set `value`; `marks` are outlined. */
  | { kind: 'hundredChart'; value: string; max: 100 | 120; marks?: string[] }
  /** Two rows of objects lined up one-to-one, showing which has more (or is longer). */
  | {
      kind: 'compareRows';
      a: string;
      b: string;
      difference?: string;
      icon: 'dot' | 'cube';
      /** Words for the comparison, e.g. ['more', 'fewer'] or ['longer', 'shorter']. */
      words: [string, string];
    }
  /** Regular polygon with `sides` sides (and as many corners); change it with − / +. */
  | { kind: 'polygon'; sides: string }
  /** Balance scale: the counters on each pan are the listed values. Level when equal. */
  | { kind: 'balance'; left: string[]; right: string[] }
  /**
   * Base-ten blocks (hundreds flats, tens rods, ones cubes) for each group, and for the total.
   * `controls` add − / + buttons (e.g. ±1, ±10) that change a value.
   */
  | {
      kind: 'baseTen';
      groups: string[];
      total?: string;
      controls: { var: string; steps: number[] }[];
    }
  /** An object measured two ways: in small units (`total`) and in bigger units of `size`. */
  | { kind: 'unitTiles'; count: string; size: string; total: string }
  /** Clock face: drag the minute hand (snaps to `minuteStep`); tap a number to set the hour. */
  | { kind: 'clock'; hour: string; minute: string; minuteStep: number }
  /** A shape cut into `parts` equal parts, `shaded` of them shaded. Tap parts to shade. */
  | { kind: 'partition'; parts: string; shaded: string; shape: 'circle' | 'rectangle' }
  /** Number line from 0 with `count` equal jumps of `step`, ending at `total`. Drag the end. */
  | { kind: 'skipCount'; step: string; count: string; total: string }
  /** Objects arranged in pairs; an odd one sticks out. */
  | { kind: 'pairs'; value: string; max: number }
  /** Dot array with `rows` × `columns`. Drag the corner. */
  | { kind: 'array'; rows: string; columns: string; total: string; max: number }
  /** Objects measured against a ruler in the shown unit. Drag each object's end. */
  | { kind: 'ruler'; lengths: string[]; difference?: string; extent: number }
  /** Coins by type, each with its value in cents; − / + change the counts. */
  | {
      kind: 'coins';
      coins: { var: string; cents: number; name: string }[];
      total: string;
    }
  /** Cube trains built from the same parts in different orders (equal lengths). */
  | { kind: 'cubeTrains'; rows: string[][]; total: string }
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
  /**
   * Unit systems offered for the whole module (default: metric and US customary). Mixed units
   * stay available either way.
   */
  unitSystems?: UnitSystem[];
}
