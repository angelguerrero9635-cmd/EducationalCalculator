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
      /** Labelled tick spacing; with tick > 1, unlabelled ticks still mark every 1. */
      tick?: number;
      /** 'tens': draw the jump as jumps of 10, then one jump for the ones (38 → 48 → 58 → 63). */
      jumps?: 'tens';
    }
  /**
   * Ten-frames with two kinds of counters: `first` solid (●), then `second` open (○), `total` in all.
   * `second` and `total` may be fixed numbers (e.g. "one more", "make 10"). Tap a cell inside
   * the solid counters to set `first`; beyond them to set the total (or the second group).
   */
  | {
      kind: 'tenFrame';
      /** A number keeps the first group fixed (e.g. 10 for the full ten in 11–19). */
      first: string | number;
      second: string | number;
      total: string | number;
      /** 1 frame (10) or 2 frames (20). */
      frames?: 1 | 2;
    }
  /** Hundred chart (rows of ten). Tap a number to set `value`; `marks` are outlined. */
  | {
      kind: 'hundredChart';
      value: string;
      max: 100 | 120;
      marks?: string[];
      /** Counting by tens from `value`: dots on the numbers passed, one row down per ten. */
      tens?: { count: string };
    }
  /** Two rows of objects lined up one-to-one, showing which has more (or is longer). */
  | {
      kind: 'compareRows';
      a: string;
      b: string;
      difference?: string;
      icon: 'dot' | 'cube' | 'cup';
      /** Words for the comparison, e.g. ['more', 'fewer'] or ['longer', 'shorter']. */
      words: [string, string];
    }
  /**
   * Tape diagram. Part-whole: one bar cut into `parts`, with a bracket for the `total`.
   * Compare: two bars from the same start; the bracket is the `difference`. Drag bar ends.
   */
  | {
      kind: 'tape';
      parts: string[];
      total: string;
      /** The total is this many equal groups (a two-step problem): dashed lines mark them. */
      groups?: string;
      /** The part the groups make up, when it isn't the whole bar (3 boxes of 8, and 5 more). */
      groupsPart?: string;
      /** A sentence under the bar, with {id} for values. */
      caption?: string;
    }
  | {
      kind: 'tape';
      compare: [string, string];
      difference: string;
      /** A sentence under the bars, with {id} for values, e.g. "Ben has {d} more than Ana." */
      caption?: string;
    }
  /** Line plot: an X for each object above its value on a number line; tap to set counts. */
  | {
      kind: 'linePlot';
      /** `label` names the mark when it isn't a whole number ("2 1/4"). */
      points: { var: string; at: number; label?: string }[];
      unit?: string;
      /** The first length on the line; the others follow by 1 (default: the points' `at`). */
      start?: string;
    }
  /**
   * Regular polygon with `sides` sides (and as many corners); change it with the sliders. `angle`
   * words (Grade 2) say “angles” and name any 4-sided shape a quadrilateral.
   */
  | {
      kind: 'polygon';
      sides: string;
      words?: 'corner' | 'angle';
      corners?: string;
      /**
       * Draw a shape with sides of different lengths (it has the same name); 'toggle' lets the
       * student switch between an even shape and a stretched one.
       */
      irregular?: boolean | 'toggle';
    }
  /** Balance scale: the counters on each pan are the listed values. Level when equal. */
  | {
      kind: 'balance';
      left: string[];
      right: string[];
      /** Taken away from the left pan: those counters are crossed out (10 − 2 on the left). */
      takeAway?: string;
    }
  /**
   * Base-ten blocks (hundreds flats, tens rods, ones cubes) for each group, and for the total.
   * `controls` add the sliders buttons (e.g. ±1, ±10) that change a value.
   */
  | {
      kind: 'baseTen';
      groups: string[];
      total?: string;
      /** With two groups: show which is greater with >, < or =. */
      compare?: boolean;
      /** Write this value in words under the blocks ("three hundred forty-seven"). */
      words?: string;
      controls: { var: string; steps: number[] }[];
    }
  /**
   * An object measured two ways: in small units (`total`) and in bigger units of `size`. A
   * number keeps the bigger unit's size fixed (e.g. a paper clip is 2 cubes long).
   */
  | {
      kind: 'unitTiles';
      count: string;
      size: string | number;
      total: string;
      /** Unit names, singular (default cube and the count's name, e.g. paper clip). */
      names?: { small: [string, string]; big: [string, string] };
    }
  /** Clock face: drag the minute hand (snaps to `minuteStep`); tap a number to set the hour. */
  | {
      kind: 'clock';
      hour: string;
      minute: string;
      minuteStep: number;
      /** Show an a.m. / p.m. choice next to the digital time. */
      ampm?: boolean;
    }
  /** A shape cut into `parts` equal parts, `shaded` of them shaded. Tap parts to shade. */
  | {
      kind: 'partition';
      parts: string;
      shaded: string;
      shape: 'circle' | 'rectangle';
      /** The value the the sliders buttons change (default `parts`), e.g. times cut in half. */
      control?: string;
      /** How much the sliders change it (default 1), e.g. 2 for halves ↔ fourths. */
      step?: number;
      /** Name the shaded amount as a fraction (3/4), Grade 3 on. */
      fraction?: boolean;
    }
  /**
   * Number line from `start` (default 0) with `count` equal jumps of `step`, ending at `total`.
   * Drag the end.
   */
  | {
      kind: 'skipCount';
      step: string | number;
      count: string;
      total: string;
      start?: string;
      /** Count back: the jumps go left from the start. */
      back?: boolean;
    }
  /**
   * Number line with one hop per step of a word problem: start at `start`, hop forward (sign 1)
   * or back (sign -1) by each hop's value, landing on `end`. the sliders change the start and hops.
   */
  | {
      kind: 'hops';
      start: string;
      hops: { var: string; sign: 1 | -1 }[];
      end: string;
      min: number;
      max: number;
      tick?: number;
    }
  /** The same number of dots in a line, rows, a circle or scattered (a toggle picks). */
  | { kind: 'dotSet'; count: string }
  /** A tally chart: one row of tally marks per category. */
  | { kind: 'tally'; rows: string[]; total?: string }
  /** A row of one kind of coin, picked with buttons (`value` in cents), `count` of them. */
  | { kind: 'coinRow'; value: string; count: string; total: string }
  /** A solid shape picked from sphere, cone, cylinder and cube, by its flat and curved faces. */
  | { kind: 'solid'; flat: string; curved: string }
  /** Every way to split `total` into two parts, one row each; `ways` counts the rows. */
  | { kind: 'partnerList'; total: string; ways: string }
  /** Number bond: the whole in the top circle, its two parts below. the sliders change the values. */
  | { kind: 'numberBond'; whole: string | number; parts: [string, string] }
  /**
   * A hexagon filled with pattern blocks: `trapezoids` (3 triangles each), `rhombuses` (2 each)
   * and `triangles`. the sliders change the blocks.
   */
  | { kind: 'patternBlocks'; trapezoids: string; rhombuses: string; triangles: string }
  /** Children in a line facing left; one is highlighted at `position`. Tap a child to pick. */
  | { kind: 'lineUp'; count: string; position: string; before: string; after: string }
  /** Equal groups: `groups` circles with `each` dots in each circle. the sliders change both. */
  | { kind: 'equalGroups'; groups: string; each: string; total: string }
  /** A prism on a base with `sides` sides (a cube when the base is a square). the sliders change it. */
  | { kind: 'prism'; sides: string; faces: string; edges: string; corners: string }
  /** Objects arranged in pairs; an odd one sticks out. */
  | { kind: 'pairs'; value: string; max: number }
  /** Array with `rows` × `columns` of dots (or unit squares that tile a rectangle). Drag the corner. */
  | {
      kind: 'array';
      rows: string;
      columns: string;
      total: string;
      max: number;
      cell?: 'dot' | 'square';
      /**
       * Split the columns into two parts (break apart a factor): `first` + `second` columns,
       * each part's product labeled under it (6 × 7 = 6 × 5 + 6 × 2).
       */
      split?: { first: string; second: string; firstTotal: string; secondTotal: string };
      /** Also draw the array turned a quarter turn (rows become columns): 4 × 7 = 7 × 4. */
      turned?: boolean;
    }
  /** Objects measured against a ruler in the shown unit. Drag each object's end. */
  | {
      kind: 'ruler';
      lengths: string[];
      difference?: string;
      extent: number;
      /** One object that starts at this mark instead of 0 (a “broken ruler”). */
      from?: string;
      /** The mark where that object ends. */
      to?: string;
    }
  /** Coins by type, each with its value in cents; the sliders change the counts. */
  | {
      kind: 'coins';
      coins: { var: string; cents: number; name: string }[];
      total: string;
      /** The total is in dollars (bills) instead of cents. */
      dollars?: boolean;
    }
  /** Cube trains built from the same parts in different orders (equal lengths). */
  | {
      kind: 'cubeTrains';
      /** Each train's parts in order; an inner array is a group added first, e.g. (a + b) + c. */
      rows: (string | string[])[][];
      total: string;
    }
  /** Bar chart. Bars marked `editable` can be dragged; the range grows to fit the values. */
  | {
      kind: 'bars';
      bars: { var: string; editable?: boolean }[];
      /** Smallest range shown (grows to fit larger values). */
      min: number;
      max: number;
      total?: string;
      /** A numbered scale on the left with a grid line every `scale` (bar graphs, Grade 2+). */
      scale?: number;
      /** No number on top of each bar: read its height against the scale (scaled graphs). */
      readScale?: boolean;
    }
  /** Picture graph: one column of icons per category; tap a cell to set that count. */
  | {
      kind: 'pictureGraph';
      columns: { var: string; icon: 'circle' | 'square' | 'triangle' | 'star' }[];
      max: number;
      total?: string;
      /** How many each picture stands for (a scaled picture graph's key). */
      key?: string;
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
  | {
      kind: 'rectangle';
      length: string;
      width: string;
      inside?: string;
      /** The perimeter: the outline is drawn heavy and labeled under the rectangle. */
      around?: string;
      extent: number;
    }
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
  /**
   * Rounding: a number line from the multiple of `to` below `value` to the one above, the
   * halfway point marked, and an arrow to the nearer one. Drag the point or use the sliders.
   */
  | {
      kind: 'rounding';
      value: string;
      lower: string;
      upper: string;
      rounded: string;
      to: 10 | 100;
    }
  /**
   * Fractions on a number line from 0 to `wholes`: each whole cut into `denominator` equal
   * parts, with one jump per part from 0 to `numerator`. Drag the point or use the sliders.
   */
  | {
      kind: 'fractionLine';
      numerator: string;
      denominator: string;
      wholes: number;
      /** What one whole is, e.g. "inch" (a ruler); the caption says "2 inches and 1/4 inch". */
      unit?: { one: string; many: string };
    }
  /**
   * Fraction bars of the same whole, one per row, with `num` of `den` parts shaded. `equal`
   * notes that the rows are the same size (equivalent fractions).
   */
  | {
      kind: 'fractionBars';
      rows: { num: string; den: string }[];
      controls: string[];
      equal?: boolean;
    }
  /**
   * Elapsed time on a number line: from the start time to the end time in jumps (to the next
   * hour, whole hours, the minutes left), each labeled with its length.
   */
  | {
      kind: 'timeline';
      startHour: string;
      startMinute: string;
      minutes: string;
      endHour: string;
      endMinute: string;
    }
  /**
   * A scale reading a total mass: the `items` on the pan (or `count` equal items of mass
   * `each`), and a dial that points at the `total` (dial up to `max`).
   */
  | {
      kind: 'scale';
      items?: string[];
      count?: string;
      each?: string;
      total: string;
      max: number;
    }
  /** A measuring jug with liter marks up to `max`; the `parts` stack up to the `total`. */
  | { kind: 'beaker'; parts: string[]; total: string; max: number }
  /**
   * A quadrilateral with 2 pairs of equal sides (`first`, `second`), square corners when
   * `rightAngles` is 4; named square, rectangle, rhombus or parallelogram.
   */
  | { kind: 'quadrilateral'; first: string; second: string; rightAngles: string }
  /**
   * Two rectangles side by side on the same base (a rectilinear shape), in unit squares, each
   * with its area inside; `extent` is the smallest width drawn.
   */
  | {
      kind: 'rectilinear';
      left: { width: string; height: string; area: string };
      right: { width: string; height: string; area: string };
      total: string;
      extent: number;
    }
  /** Thermometers side by side, one per value, numbered every 10°; drag the liquid's top. */
  | {
      kind: 'thermometers';
      items: string[];
      /** How far apart the first two are (labeled under the picture). */
      difference?: string;
      /** The scale shown at least from `min` to `max` (grows to fit the values). */
      min: number;
      max: number;
      /** Extra labeled marks, e.g. 32 where water freezes. */
      marks?: number[];
    }
  /** Rock layers stacked on a fossil, each `years` old; `total` is the fossil's age. */
  | { kind: 'rockLayers'; layers: string; years: string; total: string }
  /** A box pushed from both sides; arrows scaled to the pushes, `extra` the unbalanced part. */
  | { kind: 'pushes'; right: string; left: string; extra: string; max: number }
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
  /** The rearranged right side; a function picks a template from the solved values. */
  expr: string | ((v: Values) => string);
  /** A plain-language explanation; a function picks the sentence from the solved values. */
  how: string | ((v: Values) => string);
  /**
   * Worked arithmetic shown between the substituted line and the answer, so a student can
   * follow each step with a pencil (e.g. "2 quarters = 25 + 25 = 50¢"). Lines are templates
   * like `expr`, or a function of the solved values (in the formula's units).
   */
  work?: string[] | ((v: Values) => string[]);
  /** Added after the answer, e.g. "($1.68)" or "→ 3:30". */
  note?: (v: Values) => string;
}

export interface ModuleDef {
  /**
   * Taxonomy skill id, or a course topic key (`<courseId>#<topicIndex>`). A skill or topic can
   * have more modules for question types that need a different model: `<id>~<slug>`.
   */
  id: string;
  /** Name of a problem-type module (`<skill id>~<slug>`), e.g. "Compare problems". */
  title?: string;
  /**
   * Values "Clear all" (and typing over the example) start from, e.g. every coin count at 0 so a
   * student only types the coins they have.
   */
  clearTo?: Values;
  /**
   * Values the picture doesn't draw, labeled under it ("How much heavier: d = 3 cubes"), so
   * every value in the number sentences can be found in the picture.
   */
  pictureLabels?: string[];
  /** Problem types: what the page is for, in one line ("Use this for …"). */
  use?: string;
  /**
   * Values that stand on their own, with no formula linking them to the rest (e.g. a clock's
   * hour). Every other value must connect to the others through the formulas; otherwise the
   * module is really two lessons and should be split.
   */
  standalone?: { vars: string[]; why: string };
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
