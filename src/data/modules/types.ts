import type { Relation, Values, VariableDef } from '@/engine/types';
import type { Written } from './written';
import type { UnitSystem } from '@/engine/units';
import type {
  FunctionMachineSpec,
  LineSystemSpec,
  LinearFunctionSpec,
  MappingSpec,
  TransformationSpec,
} from './typesGraphs';
import type { EnergyPyramidSpec, GenerationsSpec } from './typesLife';
import type { FunctionGraphSpec } from './typesFunctionGraph';
import type { ChemSpec } from './typesChem';
import type { EnergyTrackSpec, MotionGraphSpec, SkatersSpec } from './typesMechanics';
import type { Physics8Spec } from './typesPhysics8';
import type { HscSpec } from './typesHsc';
import type { HsbSpec } from './typesHsb';
import type { HsdSpec } from './typesHsd';
import type { CircleSector, PlaneGeometry, SideSplitter } from './typesHsf';
import type { HsgSpec, PunnettInheritance } from './typesHsg';
import type { HskSpec } from './typesHsk';
import type { CardIcon } from './layouts/types';
import type { TreeChances, TwoWaySpec, VennChances } from './typesHse';

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

/** A thing measured with cubes in compare rows (drawn as the real object). */
export type MeasuredThing = 'pencil' | 'ribbon' | 'crayon';

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
      /** The distance from start to end; not needed with `count`. */
      jump?: string;
      end: string;
      min: number;
      max: number;
      /** Labelled tick spacing; with tick > 1, unlabelled ticks still mark every 1. */
      tick?: number;
      /**
       * 'tens': draw the jump as jumps of 10, then one jump for the ones (38 → 48 → 58 → 63).
       * 'ticks': one jump per tick (500 → 510 → 520 → 530 → 540 by 10s), then any rest.
       */
      jumps?: 'tens' | 'ticks';
      /**
       * A line that starts at this value (500) instead of `min`, running `span` ticks of
       * `every` (500 to 600 by 10s); `min` and `max` are then ignored. A caption says the
       * number sentence: "500 + 40 = 540".
       */
      from?: string;
      /** Tick spacing as a value (1, 10 or 100) for a `from` line; default `tick`. */
      every?: string;
      /** Ticks on a `from` line (default 10). */
      span?: number;
      /**
       * On a `from` line: the ticks counted from the start to the point, drawn one jump per
       * tick and named in the caption as a count ("Start at 500. 4 jumps of 10: 510, 520, 530,
       * 540."), so no distance value is needed. Dragging the point snaps to a tick.
       */
      count?: string;
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
      /**
       * Take-away (K): the `second` counters are the ones taken, drawn filled and crossed out
       * (✕) after the `first` ones left; the sentence reads total − second = first.
       */
      takeAway?: boolean;
      /**
       * Take from ten (Grade 1, `first` 10): this many counters crossed out inside the full ten,
       * the `second` ones left alone in the next frame.
       */
      crossOut?: string;
    }
  /** Hundred chart (rows of ten). Tap a number to set `value`; `marks` are outlined. */
  | {
      kind: 'hundredChart';
      value: string;
      /** 1000: only the hundred holding `value` (601–700), or three rows of it with `piece`. */
      max: 100 | 120 | 1000;
      marks?: string[];
      /** Counting by tens from `value`: dots on the numbers passed, one row down per ten. */
      tens?: { count: string };
      /**
       * Only a piece of the chart: `value` and the numbers before, after, above and below it
       * (a hundred-chart puzzle); the other squares are blank.
       */
      piece?: boolean;
      /** Shade every multiple of this value instead of every number up to `value`. */
      multiplesOf?: string;
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
      /** The thing measured, drawn above each row of cubes from the same left edge (or one per row). */
      object?: MeasuredThing | [MeasuredThing, MeasuredThing];
    }
  /**
   * Tape diagram. Part-whole: one bar cut into `parts`, with a bracket for the `total`.
   * Compare: two bars from the same start; the bracket is the `difference`. Drag bar ends.
   */
  | {
      kind: 'tape';
      parts: string[];
      /** The whole: a value, or a fixed amount the story sets (all the water is 100 cups). */
      total: string | { value: number; label: string };
      /**
       * The total is this many equal groups (a two-step problem): dashed lines mark them, up
       * to 12; past that a label names them (86 groups of 23).
       */
      groups?: string;
      /** The part the groups make up, when it isn't the whole bar (3 boxes of 8, and 5 more). */
      groupsPart?: string;
      /** A sentence under the bar, with {id} for values. */
      caption?: string;
      /** Values that aren't whole read as mixed numbers (33 1/3, 2 3/8 L), read exactly. */
      mixed?: boolean;
    }
  /**
   * A ratio as two bars of equal boxes (3 boxes and 5 boxes), every box worth `unit`; the bars'
   * amounts, the total and how many more the longer bar has. Three parts (6 : 5 : 2) draw a
   * third bar and bracket the total beside the three.
   */
  | {
      kind: 'tape';
      ratio: [string, string] | [string, string, string];
      unit: string;
      amounts?: [string, string] | [string, string, string];
      total?: string;
      difference?: string;
    }
  /**
   * An equation px + q = r as a bar (Grade 7): `times` boxes of the `unknown`, then `plus`,
   * together as long as `total`; a negative `plus` is a piece of the boxes taken off past the
   * total. `grouped`: p(x + q) = r, `times` equal groups each of x and q (or one box "x − 15").
   * Drag the end of the bar to change the total.
   */
  | {
      kind: 'tape';
      equation: {
        times: string;
        unknown: string;
        plus: string;
        total: string;
        grouped?: boolean;
      };
    }
  | {
      kind: 'tape';
      compare: [string, string];
      difference: string;
      /** The bigger bar drawn as this many copies of the smaller one (3 times as many). */
      times?: string;
      /** A sentence under the bars, with {id} for values, e.g. "Ben has {d} more than Ana." */
      caption?: string;
      /** Values that aren't whole read as mixed numbers (33 1/3, 2 3/8 L), read exactly. */
      mixed?: boolean;
    }
  /** Line plot: an X for each object above its value on a number line; tap to set counts. */
  | {
      kind: 'linePlot';
      /** `label` names the mark when it isn't a whole number ("2 1/4"). */
      points: { var: string; at: number; label?: string }[];
      unit?: string;
      /** The first length on the line; the others follow by 1 (default: the points' `at`). */
      start?: string;
      /**
       * With `start`: the marks are halves, quarters or eighths (2, 4, 8, or a value), so the
       * lengths run start, start + 1/4, start + 2/4, … (labelled "3 1/4"; `at` and `label` are
       * then not used).
       */
      marks?: 2 | 4 | 8 | string;
      /**
       * With `marks`: the start may be a fraction in these parts of a unit (4: 3 3/4 inches), its
       * slider steps by 1/4, and every mark reads as a mixed number (3 3/4, 4, 4 1/4, …).
       */
      startParts?: 2 | 4 | 8;
    }
  /**
   * Regular polygon with `sides` sides (and as many corners); change it with the sliders. `angle`
   * words (Grade 2) say “angles” and name any 4-sided shape a quadrilateral.
   */
  | {
      kind: 'polygon';
      /** The number of sides (a stepper changes it). Not used with `sideValues`. */
      sides?: string;
      /** With `sides`: every side labeled with this length (equal sides); `around` under it. */
      side?: string;
      /**
       * A shape with one side per value (3–6), each side labeled with its length and an
       * unknown one as “?”; `around` is the perimeter, labeled under it.
       */
      sideValues?: string[];
      around?: string;
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
   * A hanger (Grade 7–8 equations): a wooden beam on a hook with a tray on each end holding
   * `x` blocks of the `unknown` and `units` unit weights (a value or a fixed count, whole and
   * not negative). Level when both sides weigh the same (always level while the unknown is
   * "?"). `steps` adds buttons that walk the solving: take the same from both sides, then
   * split into as many equal parts as there are blocks.
   */
  | {
      kind: 'hanger';
      unknown: string;
      left: { x?: string | number; units?: string | number };
      right: { x?: string | number; units?: string | number };
      steps?: boolean;
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
      /**
       * Draw the blocks from these counts instead of the number's digits (a regroup lesson:
       * 2 rods and 17 cubes for 37, each full ten of cubes boxed).
       */
      places?: { hundreds?: string; tens: string; ones: string };
      /**
       * Taking this value away from the one group: its blocks after any trade (a traded ten
       * drawn as 10 cubes, a traded hundred as 10 rods), with this value's blocks crossed out.
       */
      takeAway?: string;
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
  /**
   * A shape cut into `parts` equal parts, `shaded` of them shaded. Tap parts to shade. `set`:
   * the whole is a set of `parts` objects in a row, `shaded` of them marked (3 of 7 umbrellas).
   */
  | {
      kind: 'partition';
      parts: string;
      shaded: string;
      shape: 'circle' | 'rectangle' | 'set';
      /** The things in a set (default counters). */
      object?: 'umbrella' | 'counter';
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
      /**
       * A value, or a fixed number of jumps (4 quarters in a minute); left out, the jumps run
       * to the total.
       */
      count?: string | number;
      total: string;
      start?: string;
      /** Count back: the jumps go left from the start. */
      back?: boolean;
      /**
       * A second row of jumps from 0 under the line (the multiples of another number): both
       * rows run to `total`, the first landing they share (the least common multiple), circled.
       */
      second?: { step: string };
      /**
       * Past 30 jumps (to 999): one arc per ten jumps, per hundred past 300, then the single
       * jumps left; each run named at the top (“10 × 10 jumps: +20”).
       */
      group?: boolean;
    }
  /**
   * Number line with one hop per step of a word problem: start at `start`, hop forward (sign 1)
   * or back (sign -1) by each hop's value, landing on `end`. the sliders change the start and hops.
   */
  | {
      kind: 'hops';
      start: string;
      /**
       * Each hop forward (1) or back (−1). A sign can name a variable holding 1 or −1: the hop
       * then has a +/− switch that flips it.
       */
      hops: { var: string; sign: 1 | -1 | string }[];
      end: string;
      min: number;
      max: number;
      tick?: number;
    }
  /** The same number of dots in a line, rows, a circle or scattered (a toggle picks). */
  | { kind: 'dotSet'; count: string }
  /** A tally chart: one row of tally marks per category. */
  | {
      kind: 'tally';
      rows: string[];
      total?: string;
      /** A card icon per row, beside its name (apple, banana, grapes; sun, rain cloud). */
      icons?: CardIcon[];
    }
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
  | {
      kind: 'equalGroups';
      groups: string;
      each: string;
      total: string;
      /** 10: each item is a ten-rod, and `each` counts tens (4 groups of 6 tens). */
      unit?: 10;
      /** Up to 90 groups: past 12, rows of ten small circles with `each` written in each. */
      bundles?: true;
    }
  /** A prism on a base with `sides` sides (a cube when the base is a square). the sliders change it. */
  | {
      kind: 'prism';
      sides: string;
      faces: string;
      edges: string;
      corners: string;
      /** Faces / Edges / Corners buttons that number each one on the solid. */
      counting?: boolean;
    }
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
      /** Label the sides: the rows at the left, the columns under; an unknown side reads “?”. */
      sides?: boolean;
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
      /**
       * Half-inch (2) or quarter-inch (4) marks between the numbers: the lengths are then
       * counted in those marks (9 quarter marks = 2 and 1/4 inches). A variable id reads the
       * marks per unit from that value (2 or 4).
       */
      marks?: 2 | 4 | string;
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
      /** `icon`: a small card icon under the bar's name (science pages: a sun, a rain cloud). */
      bars: { var: string; editable?: boolean; icon?: CardIcon }[];
      /** Smallest range shown (grows to fit larger values). */
      min: number;
      max: number;
      total?: string;
      /**
       * A numbered scale on the left with a grid line every `scale` (bar graphs, Grade 2+); a
       * variable id reads the spacing from that value (a scaled graph whose scale changes).
       */
      scale?: number | string;
      /** No number on top of each bar: read its height against the scale (scaled graphs). */
      readScale?: boolean;
    }
  /** Picture graph: one column of icons per category; tap a cell to set that count. */
  | {
      kind: 'pictureGraph';
      /** A shape, or a card icon drawn in its colors ('apple', 'frog'). */
      columns: { var: string; icon: 'circle' | 'square' | 'triangle' | 'star' | CardIcon }[];
      max: number;
      total?: string;
      /** How many each picture stands for (a scaled picture graph's key). */
      key?: string;
      /**
       * With `key`: half pictures are in the key (half a picture = key ÷ 2), and tapping a
       * column's top picture takes half of it away.
       */
      half?: boolean;
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
      /** Draw the unit squares even with only a perimeter (to count the area too). */
      grid?: boolean;
      /** Draw it as a real roof in perspective: slate shingles, a gutter and rain falling. */
      roof?: boolean;
      extent: number;
    }
  /** 10 × 10 grid with `percent` squares shaded. Tap a square to set the percent. */
  | {
      kind: 'grid100';
      percent: string;
      caption?: { part: string; whole: string };
      /** A second grid beside the first, `second` squares shaded (compare 0.4 and 0.35). */
      second?: string;
      /** Whole grids, fully shaded, before the first: the ones of a decimal (1.35). */
      wholes?: string;
      /** Past 3 whole grids, one stack of grids with its count ("45 whole grids"): ones to 99. */
      stack?: boolean;
      /** A percent past 100 draws a full grid per 100 before the rest (125% = 1 grid + 25). */
      past100?: boolean;
      /** Shade tenths of a square exactly (37.5 fills half of square 38) instead of rounding. */
      exact?: boolean;
      /**
       * Tenths times tenths (0.7 × 0.4): the first factor's tenths as columns, the second's as
       * rows, the overlap the product (`percent`, a decimal) in hundredths. A factor of 1 or
       * more, or past tenths, draws the area model of the two factors instead.
       */
      product?: [string, string];
    }
  /**
   * A figure on a grid and its scaled copy beside it (Grade 7 scale drawings): the original is
   * `width` × `height` squares in the outline `shape` (default an L), the copy is `factor` times
   * each length, joined by an arrow labelled with the factor. `copyWidth`, `copyHeight` and
   * `area` (original, copy) are values the module works out; drag the copy's corner to change
   * the factor.
   */
  | {
      kind: 'scaleCopy';
      factor: string;
      width: string | number;
      height: string | number;
      copyWidth?: string;
      copyHeight?: string;
      area?: [string, string];
      shape?: 'rectangle' | 'triangle' | 'L' | 'trapezoid';
      /**
       * Grades 9–12 dilation: the copy drawn on the original's grid as its dilation from this
       * center ([x, y] in squares from the original's bottom left corner, numbers or values), a
       * ray from the center through each corner and its image; drag the image's corner.
       */
      center?: [string | number, string | number];
      /** Grades 9–12 side-splitter (see `SideSplitter`): `width`, `height` are AB and AC. */
      splitter?: SideSplitter;
    }
  /** Circle with a radius handle; optional labels for diameter, circumference and area. */
  | {
      kind: 'circle';
      radius: string;
      extent: number;
      diameter?: string;
      circumference?: string;
      area?: string;
      /**
       * Grade 7 pictures, with buttons to switch when there are two or more: 'radius' (the
       * circle above), 'unroll' (the circle rolled one turn: its circumference along a line,
       * π diameters, with three diameters marked under it) and 'wedges' (the circle cut into
       * `wedges` pieces laid top and bottom in a near-parallelogram π × r long and r tall).
       */
      views?: ('radius' | 'unroll' | 'wedges' | 'sector' | 'radian')[];
      /** How many wedges (even, 4–24; a number or a value). Default 8. */
      wedges?: number | string;
      /**
       * Grades 9–12: a sector by its central angle (`CircleSector`), shown by the view 'sector'
       * (the default view when this is set); 'radian' wraps radius-long arcs around the circle.
       */
      sector?: CircleSector;
    }
  /** Right triangle (vertical leg `a`, horizontal leg `b`, hypotenuse `c`) with side squares. */
  | {
      kind: 'rightTriangle';
      a: string;
      b: string;
      c: string;
      extent: number;
      /** Each square ruled in unit squares (sides up to 12), so the areas can be counted. */
      grid?: boolean;
    }
  /**
   * A glass cylinder, cone or sphere full of water, to scale, its radius (and height) marked
   * and draggable; the caption works V with the numbers. `compare` (cone or sphere) stands the
   * cylinder of the same radius and height (2r for a sphere) beside it, holding the solid's
   * water: 1/3 of it for a cone, 2/3 for a sphere. `extent` is the biggest diameter or height
   * drawn before the scale shrinks (shown units).
   */
  | {
      kind: 'curvedSolid';
      shape: 'cylinder' | 'cone' | 'sphere';
      radius: string;
      /** The height (cylinder and cone; a sphere has none). */
      height?: string;
      volume?: string;
      compare?: boolean;
      extent: number;
      /**
       * Grades 9–12: the surface-area net under the solid (a cylinder's rectangle and two
       * circles, a cone's sector and base, a sphere's four great circles); `slant` is a cone's
       * slant height and `surface` the total surface area (values, checked).
       */
      net?: boolean;
      slant?: string;
      surface?: string;
      /** Grades 9–12 (a cylinder): Cavalieri's two stacks of coins, one straight, one leaning. */
      cavalieri?: boolean;
    }
  /**
   * A scatter plot of fixed data `points` ([x, y], in the axes' numbers) with a line of fit
   * y = `slope` × x + `intercept` (two variables), dragged by a handle near each end; the
   * caption counts points above and below it. `clusters` rings named groups (point indices),
   * `outlier` rings one point; `at` reads an input up to the line and across to its prediction
   * (the module's relation gives y = slope × x + intercept).
   */
  | {
      kind: 'scatter';
      x: { label: string; min: number; max: number; step?: number };
      y: { label: string; min: number; max: number; step?: number };
      points: [number, number][];
      /** Values, or (Grades 9–12, with `leastSquares: 'fit'`) the calculator's numbers. */
      slope: string | number;
      intercept: string | number;
      clusters?: { label: string; points: number[] }[];
      outlier?: number;
      at?: { x: string; y: string };
      /**
       * Grades 9–12 (H18). `residuals`: each point's residual (actual − predicted) as a segment
       * to the line; 'plot' adds a residual plot under the scatter plot. `r`: the correlation
       * coefficient's value (checked against the points). `leastSquares`: the least-squares
       * line dashed beside the dragged one ('beside'), or the module's slope and intercept are
       * it ('fit': checked to the cent, no handles). `residualOf`: one point (an index) with
       * its residual labelled, and the residual's value (checked).
       */
      residuals?: 'segments' | 'plot';
      r?: string | true;
      leastSquares?: 'beside' | 'fit';
      residualOf?: { point: number; residual?: string };
    }
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
      /** Dashed lines through 0 to compare with (y = slope × x), labelled ("Water"). */
      reference?: { slope: number; label: string }[];
      /**
       * A proportional relationship y = kx: this variable is k. The line through (0, 0) with
       * the point (1, k) ringed; drag it up or down to change k.
       */
      unitRate?: string;
      /** A table beside the graph: these x values with y and y ÷ x; the point's row outlined. */
      table?: number[];
    }
  /**
   * Rounding: a number line from the multiple of `to` below `value` to the one above, the
   * halfway point marked, and an arrow to the nearer one. Drag the point or use the sliders.
   */
  | {
      kind: 'rounding';
      value: string;
      /** The ends of the line, when the page has them as values (the picture works them out). */
      lower?: string;
      upper?: string;
      rounded: string;
      /** The place rounded to, or the variable that holds it (10, 100, 1,000, … or 1, 0.1, 0.01). */
      to: number | string;
      /**
       * A second number's line under the first, with its arrow to its rounded value (estimating
       * a sum or difference): `estimate` = rounded + second rounded (`minus`: − it), in the caption.
       */
      second?: { value: string; rounded: string; estimate?: string; minus?: boolean };
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
      /**
       * The numerator as a sum of these tops (3/8 + 6/8): each addend's run of jumps gets its
       * own shade, and dragging the point changes the last addend with the others pinned.
       */
      parts?: string[];
      /** The numerator as this many copies of one fraction (4 × 2/3): the runs alternate shade. */
      copies?: string;
      /**
       * A second line under the first, cut by another denominator, with its own point; a
       * dashed line joins the two points when they are the same distance from 0.
       */
      second?: { numerator: string; denominator: string };
      /** Tenths and hundredths as decimals: the tenths are labeled 0.1, 0.2 … and the point too. */
      decimal?: boolean;
      /**
       * The first whole on the line (a number or a value id): it runs from here to here +
       * `wholes` (1 to 3), stretching to take in the point; the point is still counted from 0.
       */
      startWhole?: number | string;
      /**
       * Mixed-number jumps (18 1/4 − 2 3/4): a jump from this value to the numerator, both
       * counted in parts (18 1/4 is 73 fourths), drawn as one jump of whole numbers and one of
       * the parts left. The line shows only the wholes around the two points (at least
       * `wholes`) and names both points as mixed numbers.
       */
      from?: string;
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
      /**
       * Which rows the caption compares (default the first two). Four entries compare the
       * first pair and say what it means for the second: "9/12 > 8/12, so 3/4 > 2/3".
       */
      compare?: [number, number] | [number, number, number, number];
      /** A sentence under the bars instead of the comparison, with {id} for values. */
      caption?: string;
      /**
       * Wholes laid out in every row (default 1). A fraction past one whole always takes the
       * bars it needs (7/4 is one whole and 3/4 of the next), up to 6; setting this keeps the
       * bars' size still while the values change.
       */
      wholes?: number;
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
      /** Jumps count back from the end time (default: when the page opens on the end time). */
      back?: boolean;
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
      /**
       * A second reading before the `total` (after): two scales side by side, the cup fizzing
       * on the second and its bubbles labelled with the difference (gas that escaped).
       */
      before?: string;
      /**
       * A spring scale hanging from a bar, in newtons: `count` washers of `each` on its hook,
       * the pointer at the `total` (scale up to `max`).
       */
      hanging?: boolean;
    }
  /** A measuring jug with liter marks up to `max`; the `parts` stack up to the `total`. */
  | {
      kind: 'beaker';
      parts: string[];
      total: string;
      max: number;
      /** Amounts that aren't whole read as mixed numbers (2 3/8 L), read exactly. */
      mixed?: boolean;
    }
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
      /** The first rectangle; with a `cut`, the whole rectangle (its area may be left to the picture). */
      left: { width: string; height: string; area?: string };
      /** A second rectangle standing beside the first on the same base (an L or a step). */
      right?: { width: string; height: string; area: string };
      /**
       * Or a rectangle cut out of the first one's top right corner: the shape is the first
       * rectangle take away this one (`total` = the first area − the cut area).
       */
      cut?: { width: string; height: string; area?: string };
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
      /**
       * Each thermometer stands in a cup of water in the sun: a dark or a light cup, one per
       * item (the sun shines on them from the top left).
       */
      cups?: ('dark' | 'light')[];
    }
  /**
   * Two trays of soil on a slope under a watering can, the second planted with grass; below
   * each, a jar with the soil the water washed off (`bare`, `grass`; the jars' scale is `max`,
   * grown to fit).
   */
  | { kind: 'grassSlope'; bare: string; grass: string; difference?: string; max: number }
  /**
   * The same flashlight `near` from a wall and `times` as far (`far` = near × times): the lit
   * circle `times` as wide, and, seen face on, `times` × `times` squares of the near circle's
   * size, one shaded.
   */
  | { kind: 'flashlights'; near: string; times: string; far?: string }
  /**
   * Two potted plants, one in the sun and one in the shade (`places`), with as many green
   * leaves as their counts (`items`); `difference` is how many more the first has.
   */
  | {
      kind: 'leafCount';
      items: [string, string];
      difference?: string;
      places?: ['sun' | 'shade', 'sun' | 'shade'];
    }
  /** Rock layers stacked on a fossil, each `years` old; `total` is the fossil's age. */
  /** Two fossils in a column of rock layers: `fossils` are the layers above each; deeper is older. */
  | { kind: 'rockLayers'; fossils: [string, string]; difference: string }
  /**
   * A square root as a side (Grade 8): the square of area `area` on a unit grid, its side
   * `side`, the whole-number squares just under and over it dashed, and a number line to the
   * same scale placing the root between two whole numbers, beside fixed `marks` (√2 at
   * 1.41421…, π at 3.14159…). Drag the corner to change the area.
   */
  | {
      kind: 'rootSquare';
      area: string;
      side: string;
      marks?: { at: number; label: string }[];
      /** Values holding the whole numbers just under and over the root (6 and 7 for √39). */
      between?: [string, string];
      /**
       * 'cube': a cube of volume `area` with edge `side` (∛ of the volume) instead of a square,
       * the edge dropped onto the number line.
       */
      solid?: 'cube';
    }
  /**
   * Exponent rules as rows of factors (Grade 8): each power a row of its `base` repeated.
   * `rule` 'product': b^first × b^second, the two rows joined into one of `result` factors;
   * 'quotient': b^first ÷ b^second, one row over the other, the pairs that cancel crossed out
   * and what is left (factors of 1/b when the bottom has more); 'power': (b^first)^second,
   * `second` copies of the row. `result` is the answer's exponent. Drag a row's end.
   */
  | {
      kind: 'factorRows';
      base: string;
      first: string;
      second: string;
      result: string;
      rule: 'product' | 'quotient' | 'power';
    }
  /**
   * Scientific notation on a powers-of-ten ruler (Grade 8): the `number` placed on a log scale
   * of 10ⁿ⁻² … 10ⁿ⁺³, its decade opened up below as a ruler from 1 to 10 where the `mantissa`
   * is read, "× 10ⁿ" with the `exponent`. Drag the mantissa, or the number to another decade.
   */
  | {
      kind: 'powerScale';
      number: string;
      mantissa: string;
      exponent: string;
      /** No handles: the front and the power are worked out (a product), not typed. */
      fixed?: boolean;
      /** A second number to compare, marked on the upper ruler (at its edge when off it). */
      second?: string;
      /**
       * Grades 9–12 log mode: the log scale (0 to 1) under the 1–10 ruler reads the mantissa's
       * log, and `log` (a value, log₁₀ of the number) is worked in the caption: 5 + 0.672.
       */
      log?: string;
    }
  /**
   * An equation with the unknown on both sides as a pan balance (Grade 8): `left` and `right`
   * are [coefficient, constant] (variables or numbers) of `x`, so 3x + 4 = x + 10 is
   * left [3, 4], right [1, 10]. Each pan holds wooden x-blocks and unit counters; negatives
   * are balloons (−x, −1) pulling the pan up. The beam tips at the current `x` and is level
   * when the sides are equal. `cancel` crosses out what the two pans share.
   */
  | {
      kind: 'equationBalance';
      x: string;
      left: [string | number, string | number];
      right: [string | number, string | number];
      cancel?: boolean;
    }
  /** A box pushed from both sides; arrows scaled to the pushes, `extra` the unbalanced part. */
  | { kind: 'pushes'; right: string; left: string; extra: string; max: number }
  /**
   * The area model for multiplication: `top` holds one factor's place-value parts, `side` the
   * other's; `parts[j][i]` is the product of top[i] and side[j]; `total` their sum.
   */
  | { kind: 'areaModel'; top: string[]; side: string[]; parts: string[][]; total: string }
  /**
   * The same, from the two factors: the picture splits each into its places (347 → 300, 40, 7;
   * 2.35 → 2, 0.3, 0.05) and works out every box, so the module holds no part values.
   */
  | { kind: 'areaModel'; factors: [string, string]; total: string }
  /**
   * Division as an area model: the divisor down the side, the quotient split by place along
   * the top (partial quotients), the amount each takes inside, and the remainder beside.
   */
  | {
      kind: 'areaModel';
      divide: { dividend: string; divisor: string; quotient: string; remainder?: string };
    }
  /**
   * Two angles on one vertex (`parts`) making the `whole` angle; drag the middle ray. A whole
   * of 90 or 180 is a right angle (complementary parts, with its corner mark) or a straight
   * line (supplementary): only the middle ray turns, and the second part follows it.
   */
  | {
      kind: 'angles';
      parts: [string, string];
      /** The whole angle: a value, or a fixed number of degrees (a full turn, 360). */
      whole: string | number;
      /**
       * Values with sliders instead of the two parts (a turn cut into k parts, n of them in
       * the angle): the rays are then not dragged, since a part can't take any degree.
       */
      sliders?: string[];
      /**
       * `whole: 180` only: two crossing lines. The first line runs on through the vertex, so
       * each part has a vertical angle across from it, labelled with `first` and `second`
       * (values equal to the parts), or with the part's own value.
       */
      cross?: { first?: string; second?: string };
      /**
       * A triangle instead: `parts` are the two bottom angles, `third` the top one (the three
       * add to 180°), and `whole` the exterior angle at the top (equal to the two parts).
       */
      triangle?: { third: string };
      /**
       * `whole: 180` only: two parallel lines cut by a transversal, the eight angles numbered;
       * 1, 3, 5 and 7 are the first part, 2, 4, 6 and 8 the second (its supplement).
       */
      parallel?: boolean;
    }
  /**
   * Two number lines that line up: the top counted in one unit (bigger units), the bottom in
   * another, `per` bottom units for each top unit. A mark joins the two readings; drag it.
   */
  | {
      kind: 'doubleNumberLine';
      top: string;
      bottom: string;
      per: string;
      /** Whole top units drawn (grows to fit the value). */
      ticks: number;
      /** "$" before the bottom numbers (unit prices), written to the cent. */
      prefix?: '$';
    }
  /**
   * Coordinate plane with a point (x, y) to drag; optionally a second point, with the line
   * through both and a rise-over-run triangle labelled with `slope`.
   */
  | {
      kind: 'coordinatePlane';
      x: string;
      y: string;
      second?: { x: string; y: string };
      slope?: string;
      /**
       * Grade 8 slope: the rise and the run as values. The triangle is shaded, each leg drawn
       * heavy with an arrow and labelled with its value ("rise = 6", "run = 3").
       */
      rise?: string;
      run?: string;
      /**
       * The pattern's earlier points, back to the start: each one `across` less and `up` less
       * than the next (numbers or variables), drawn as small dots and listed in a table.
       */
      trail?: { across: number | string; up: number | string };
      /** The segment between the two points (no line or slope), labelled with `distance`. */
      segment?: boolean;
      distance?: string;
      /**
       * With `segment`: the right triangle under it (legs across and up, dashed, with their
       * lengths and a right angle), and the caption works d² = a² + b² (Grade 8 distance).
       */
      legs?: boolean;
      /** The point's images across the x-axis, the y-axis and both, drawn hollow. */
      reflect?: boolean;
      /** A rectangle from its left and right x-coordinates and bottom and top y-coordinates. */
      rect?: { left: string; right: string; bottom: string; top: string };
      /**
       * Plot a point (first quadrant): tap the grid or drag to place (x, y); the path from 0,
       * across then up, is drawn to it.
       */
      plot?: boolean;
      /** Numerals I–IV in the quadrants. */
      quadrantLabels?: boolean;
      /** Largest |coordinate| drawn (grows to fit). */
      extent: number;
      quadrants: 1 | 4;
      /** Grades 9–12: midpoint, partition, a polygon and its side slopes (`PlaneGeometry`). */
      midpoint?: PlaneGeometry['midpoint'];
      partition?: PlaneGeometry['partition'];
      polygon?: PlaneGeometry['polygon'];
      slopes?: boolean;
    }
  /** Grade 8 functions, systems and transformations (specs in `typesGraphs.ts`). */
  | LinearFunctionSpec
  | LineSystemSpec
  | FunctionMachineSpec
  | MappingSpec
  | TransformationSpec
  /** Grades 9–12: the graph of any function family (spec in `typesFunctionGraph.ts`). */
  | FunctionGraphSpec
  /** Grade 7 life science: energy pyramid, generations (specs in `typesLife.ts`). */
  | EnergyPyramidSpec
  | GenerationsSpec
  /** Grade 7–8 chemistry: molecules, reactions, heating curves, the periodic table (`typesChem.ts`). */
  | ChemSpec
  /** Grade 8 motion, forces and energy (specs in `typesMechanics.ts`). */
  | MotionGraphSpec
  | SkatersSpec
  | EnergyTrackSpec
  /** Grade 8 spectrum, circuits, electromagnet and orbit (specs in `typesPhysics8.ts`). */
  | Physics8Spec
  /** Grades 9–12 geometry: triangle solver (specs in `typesHsc.ts`). */
  | HscSpec
  /** Grades 9–12 statistics and counting, group HB (specs in `typesHsb.ts`). */
  | HsbSpec
  /** Grades 9–12 group D: unit circle, algebra tiles, vectors, … (specs in `typesHsd.ts`). */
  | HsdSpec
  /** Grades 9–12 biology, group HG: membrane, DNA strand (specs in typesHsg.ts). */
  | HsgSpec
  /** Grades 9–12 physics, group HK: projectile, free body, … (specs in typesHsk.ts). */
  | HskSpec
  /** Box plot: the five-number summary on a number line, each mark draggable. */
  | {
      kind: 'boxPlot';
      min: string;
      q1: string;
      median: string;
      q3: string;
      max: string;
      range: [number, number];
      /** Brackets over the plot for the range and the interquartile range. */
      brackets?: { range?: string; iqr?: string };
      /**
       * The values the five numbers come from, drawn as dots above the plot (only the first
       * `count` of them); the middle one (odd) or two (even) are ringed at the median. The
       * five numbers are then read from the values, not dragged.
       */
      data?: string[];
      count?: string;
      /**
       * Grades 9–12 (H19): the 1.5 × IQR fences, dashed, at Q₁ − 1.5 × IQR and Q₃ + 1.5 × IQR
       * (`lower` and `upper` name the module's values for them, checked). With `data`, values
       * past a fence are outliers, drawn as open dots, and the whiskers stop at the last values
       * inside; without it, a least or greatest value past a fence is marked an outlier.
       */
      fences?: { lower?: string; upper?: string };
      /** Grades 9–12 (H19): a second box plot under the first on the same scale. */
      second?: { min: string; q1: string; median: string; q3: string; max: string };
      /** The two box plots' names ("Class A", "Class B"). */
      labels?: [string, string];
    }
  /** Pie chart: `parts` are percents of the whole (or counts, with `total`). */
  | {
      kind: 'pieChart';
      parts: string[];
      total?: string;
      /** Palette color names, one per part, when a part's color means something (ice, sea). */
      colors?: string[];
      /** Parts that make a named value (fresh = frozen + liquid): pulled out and bracketed. */
      group?: { id: string; parts: string[] };
    }
  /**
   * Fraction × fraction as an area model: a unit square cut into `first.den` columns and
   * `second.den` rows, `first.num` columns and `second.num` rows shaded; the overlap is the
   * product.
   */
  | {
      kind: 'fractionArea';
      first: { num: string; den: string };
      second: { num: string; den: string };
      product?: { num: string; den: string };
      /**
       * Fractions past one whole (10/3): a block of unit squares, up to `wholes` a side, each cut
       * into den × den pieces, whole-square borders heavier; the product counted in pieces.
       */
      wholes?: number;
    }
  /** Unit cubes filling a box `length` × `width` × `height`, drawn layer by layer. */
  | {
      kind: 'unitCubes';
      length: string;
      width: string;
      height: string;
      volume: string;
      max: number;
      /**
       * A second box joined to the first's right side (an L or a step), its bottom layer
       * shaded apart; `total` is the two volumes together.
       */
      second?: { length: string; width: string; height: string; volume: string };
      total?: string;
      /** Cubes of edge 1/cube (2: half-unit cubes) fill the box; `volume` stays in unit cubes. */
      cube?: 2 | 3 | 4;
      /**
       * Past `max` a side, draw the box to scale (40 × 60 × 80 cm): each edge labelled, lines
       * every few units on its faces and one unit cube under it for size.
       */
      scale?: boolean;
    }
  /**
   * Place-value chart: the digits of `value` in labelled columns, `decimals` places (0–3) past
   * the point. `highlight` outlines the column of that place value (100) with “× 10” and “÷ 10”
   * to its neighbors; `from` draws the number before a × or ÷ by 10 in a row above, so the
   * digits are seen moving; `compare` draws a second number under it and outlines the first
   * place where the two differ.
   */
  | {
      kind: 'placeValueChart';
      value: string;
      decimals: number;
      highlight?: string;
      from?: string;
      compare?: string;
      /**
       * Adding: `value` and `plus` stacked by place, points lined up, and their sum `total` in a
       * third row under a rule.
       */
      plus?: string;
      total?: string;
      /**
       * Whole numbers past the millions (to hundred billions): columns grouped in periods (ones,
       * thousands, millions, billions) under one header each, compact 100 · 10 · 1 headers.
       * Numbers to the millions draw as without it. Only with `decimals` 0.
       */
      periods?: boolean;
    }
  /** Factor tree of `value` down to its prime factors; `count` is how many primes (with repeats). */
  | {
      kind: 'factorTree';
      value: string;
      count?: string;
      /** A second number's tree beside it; the caption names the primes they share. */
      second?: string;
      gcf?: string;
      lcm?: string;
      /**
       * Grades 9–12: simplifying the root of `value`. Under the tree, each pair of equal primes
       * (each three for a cube root, `index` 3) is ringed and brings one out; the rest stay
       * under the root: √72 = 6√2. `outside` and `inside` are the 6 and the 2 as values.
       */
      root?: { index?: 2 | 3; outside?: string; inside?: string };
    }
  /**
   * Every rectangle with `value` unit squares, one under another (1 × 12, 2 × 6, 3 × 4); the
   * typed pair (`first` × `second`) is outlined. A prime has only one.
   */
  | { kind: 'factorPairs'; value: string; first?: string; second?: string; count?: string }
  /**
   * `wholes` bars shared by `people`: each bar cut into as many parts as people, one person’s
   * part shaded in every bar (3 wholes shared by 4 is 3 × 1/4 = 3/4 each).
   */
  | { kind: 'shareWholes'; wholes: string; people: string; each?: string }
  /**
   * A number line through 0 (across, or up and down with `vertical`): `value` as a point to
   * drag, its `opposite` mirrored through 0, its distance from 0 (`absolute`) bracketed, or a
   * `second` point with the jump between the two (`change`). Shown from `min` to `max`, growing
   * to fit.
   */
  | {
      kind: 'integerLine';
      value: string;
      opposite?: string;
      absolute?: string;
      second?: string;
      change?: string;
      min: number;
      max: number;
      vertical?: boolean;
      /** A fixed unit written after the numbers ("°C"). */
      unit?: string;
      /**
       * An inequality with `value` as its bound (across only): an open (<, >) or closed (≤, ≥)
       * circle, an arrow over the solutions, and a `test` point marked true or false. `sign` is
       * one of the four, or a variable (1 <, 2 ≤, 3 >, 4 ≥) with buttons to change it;
       * `letter` names the unknown from Grade 6 (default x).
       */
      inequality?: {
        sign: string;
        test?: string;
        letter?: string;
        /**
         * Grade 7: the inequality as written is `times`·x + `plus` (sign) `total`; `value` is its
         * solved bound, (total − plus) ÷ times. A negative `times` flips the drawn sign.
         */
        twoStep?: { times: string; plus: string; total: string };
      };
      /**
       * Adding (`op` '+', the default) or subtracting ('−') a signed number as a jump from
       * `value` by `by` to `result`: right for a positive jump, left for a negative one;
       * subtracting jumps the other way (adding the opposite). Drag the start or the end.
       */
      jump?: { by: string; result: string; op?: '+' | '−' };
      /**
       * Grades 9–12 (H17): a compound inequality with `value` and `second` as its bounds (value
       * the lower). 'and': value < x < second, the stretch between them; 'or': x < value or
       * x > second, two rays outward. `closed` includes a bound (≤, ≥; default both open).
       * With `center` and `radius` it is |x − center| < radius ('and') or > radius ('or'): the
       * center marked and the distance bracketed to each bound (value = center − radius,
       * second = center + radius). `test` is a number checked in both parts.
       */
      compound?: {
        join: 'and' | 'or';
        closed?: [boolean, boolean];
        center?: string;
        radius?: string;
        letter?: string;
        test?: string;
      };
    }
  /** A percent bar: 0%–100% over 0–whole, the part shaded; ticks every 10% or 25%. */
  | {
      kind: 'percentBar';
      percent: string;
      part: string;
      whole: string;
      onePercent?: string;
      ticks?: 4 | 10;
      /**
       * Tax, tip, markup or discount, and percent change: `part` is the change and `total`
       * the new amount. Three bars (the original, the change, the new amount), or with
       * `bars: 2` before and after with the change marked. `direction` follows the values
       * (a negative percent or a smaller total is down) unless it is given.
       */
      change?: { total: string; direction?: 'up' | 'down'; bars?: 2 | 3 };
    }
  /**
   * A table of equivalent ratios: the parts `first` : `second`, rows 1–4 times them (or `rows`)
   * with the row `times` slotted in and outlined; `graph` plots the pairs beside it.
   */
  | {
      kind: 'ratioTable';
      first: string;
      second: string;
      times: string;
      amounts: [string, string];
      rows?: number[];
      graph?: boolean;
    }
  /**
   * Two-color counters for adding (`op` '+', the default) or subtracting ('−') integers: `first`
   * and `second` as yellow + and red − counters; each + with a − is a zero pair (0). Subtracting
   * adds zero pairs when there are too few to take away. Up to 20 of each kind.
   */
  | { kind: 'zeroPairs'; first: string; second: string; result: string; op?: '+' | '−' }
  /**
   * The sign rule for multiplying (or dividing, `op: '÷'`): a 2 × 2 table of the two numbers'
   * signs, each cell the answer's sign; the numbers' cell outlined with their equation. Tap a
   * cell to give the numbers those signs.
   */
  | { kind: 'signTable'; first: string; second: string; result: string; op?: '×' | '÷' }
  /**
   * Dividing fractions: `groups` lays groups the size of the divisor along the dividend;
   * `share` shows the dividend filling the divisor's parts of the whole, each part labelled.
   */
  | {
      kind: 'fractionFit';
      dividend: { num: string; den: string };
      divisor: { num: string; den: string };
      quotient?: string;
      mode: 'groups' | 'share';
      /** Wholes on the ruler (grows to fit the dividend). */
      wholes: number;
    }
  /** Two overlapping circles of factors (or prime factors); the shared ones in the overlap. */
  | {
      kind: 'venn';
      first: string;
      second: string;
      list: 'factors' | 'primes';
      gcf?: string;
      lcm?: string;
    }
  /** Grades 9–12 (H22): a Venn diagram of probabilities (spec in `typesHse.ts`). */
  | { kind: 'venn'; chances: VennChances }
  /**
   * A parallelogram, triangle, trapezoid or house with its base thick and its height dashed
   * (drag the top to lean it). `top` is the trapezoid's top base or the house's roof height.
   */
  | {
      kind: 'baseHeight';
      shape: 'parallelogram' | 'triangle' | 'trapezoid' | 'house';
      base: string;
      height: string;
      top?: string;
      area: string;
      show?: 'rearrange' | 'double';
    }
  /**
   * A box, cube, square pyramid or triangular prism unfolded, each face labelled with its
   * area; Fold/Unfold.
   */
  | {
      kind: 'net';
      /**
       * `triangularPrism`: `width` and `height` are the triangle's base and height, `slant` its
       * third side (`triangle: 'right'`, the default) or each equal side (`'isosceles'`), and
       * `length` the prism's length; the net is three rectangles with a triangle on each side.
       */
      solid: 'box' | 'cube' | 'squarePyramid' | 'triangularPrism';
      triangle?: 'right' | 'isosceles';
      length: string;
      width?: string;
      height?: string;
      /** The height of each triangle on a pyramid's faces. */
      slant?: string;
      total?: string;
    }
  /**
   * A clear solid cut by a plane, the cut face shaded: a box or a pyramid on a `length` ×
   * `width` base (`width` left out: square), or a triangular prism lying with its triangle at
   * the front (a right triangle with legs `length` across and `width` up, or `isosceles` with
   * base `length` and height `width`) and its `height` running back. `cut: 'base'` (the
   * default) is parallel to the base, `at` up the height (the prism: back along it); `'side'`
   * is across it, `at` back across the width (the prism: up the triangle); `'diagonal'` stands
   * on the base's diagonal. Drag the plane's corner to move `at`. `area` is the cut's area
   * and `volume` the solid's.
   */
  | {
      kind: 'crossSection';
      /** Grades 9–12: a cylinder or cone (`length` its radius; cut 'base' or 'side'). */
      solid: 'box' | 'triangularPrism' | 'pyramid' | 'cylinder' | 'cone';
      length: string;
      width?: string;
      height: string;
      triangle?: 'right' | 'isosceles';
      cut?: 'base' | 'side' | 'diagonal';
      at?: string;
      area?: string;
      volume?: string;
    }
  /**
   * A population of `population` dots (up to 400) with a random sample of `size` ringed, of
   * whom `found` have the trait. With `trait` (how many in the population have it) those are
   * colored and "Take a new sample" draws again, setting `found`; without it only the sample
   * shows who has it. `estimate` is found ÷ size × population. `labels` name having and not
   * having the trait ("like soccer", "do not").
   */
  | {
      kind: 'sample';
      population: string;
      size: string;
      found: string;
      trait?: string;
      estimate?: string;
      labels?: [string, string];
    }
  /**
   * A spinner cut into equal sectors: `parts` are how many sectors each outcome has (up to 24
   * in all), in `colors` (red, blue, green, yellow, orange, purple) and named by `names` (the
   * color names by default). The event is outcome `pick` (0 first), its sectors outlined;
   * `chance` is its probability, parts[pick] ÷ `total`. "Spin" turns the arrow.
   */
  | {
      kind: 'spinner';
      parts: string[];
      colors?: ('red' | 'blue' | 'green' | 'yellow' | 'orange' | 'purple')[];
      names?: string[];
      pick?: number;
      chance?: string;
      total?: string;
    }
  /**
   * Two dice as a 6 × 6 grid of their 36 pairs, each cell showing the `event` (sum, the
   * difference bigger − smaller, or product); the cells whose number `compare`s (=, <, ≤, >,
   * ≥) with `target` are shaded. `count` is how many, `chance` is count ÷ 36. Tap a cell to
   * make its number the target.
   */
  | {
      kind: 'diceGrid';
      target: string;
      event?: 'sum' | 'difference' | 'product';
      compare?: '=' | '<' | '≤' | '>' | '≥';
      count?: string;
      chance?: string;
    }
  /**
   * A tree diagram for two stages (or three, with `third`) with `first`, `second` and `third`
   * equally likely outcomes (1 to 6 each): a branch per outcome marked 1/n, the leaves listing
   * every pair or triple (the first 24). `names` name each stage's outcomes (A, B, …; 1, 2, …;
   * X, Y, … by default), `stages` the stages; `path` (0-based, one index a stage) is
   * highlighted and `chance` is its probability, 1 ÷ `total`.
   */
  | {
      kind: 'treeDiagram';
      first: string;
      second: string;
      third?: string;
      total?: string;
      names?: string[][];
      stages?: string[];
      path?: number[];
      chance?: string;
    }
  /** Grades 9–12 (H21): a probability tree, a chance on every branch (spec in `typesHse.ts`). */
  | { kind: 'treeDiagram'; chances: TreeChances }
  /**
   * A clear bag of marbles: `parts` are how many of each color (40 in all at most), in
   * `colors` and named by `names` (the color names by default). The event is color `pick`
   * (0 first); `chance` is parts[pick] ÷ `total`. "Draw a marble" takes one out at random.
   */
  | {
      kind: 'marbles';
      parts: string[];
      colors?: ('red' | 'blue' | 'green' | 'yellow' | 'orange' | 'purple')[];
      names?: string[];
      pick?: number;
      chance?: string;
      total?: string;
    }
  /** A dot plot: a dot per value, the mean as a balance point, the median, the range. */
  | {
      kind: 'dotPlot';
      data: string[];
      min: number;
      max: number;
      mean?: string;
      median?: string;
      range?: string;
      deviations?: boolean;
      /**
       * How many values there are (3 to 10): only the first `count` of `data` are drawn, the
       * middle one (odd) or two (even) ringed and the median marked between them. With
       * `second`, both samples are their first `count` values.
       */
      count?: string;
      /**
       * A second sample's dot plot under the first on the same scale (two samples compared):
       * its values and its mean or median; `labels` name the two, `difference` is the gap
       * between their means (or medians), marked between the plots.
       */
      second?: { data: string[]; mean?: string; median?: string };
      labels?: [string, string];
      difference?: string;
      /**
       * Grades 9–12 (H19): the standard deviation's value (σ, over n, by default; s, over
       * n − 1, with `kind: 'sample'`), checked against the data: the mean drawn as a line and a
       * band from mean − SD to mean + SD, the values inside it counted. Needs `mean`.
       */
      sd?: { id: string; kind?: 'population' | 'sample' };
    }
  /** A microscope's field of view with `across` cells end to end along its middle. */
  | { kind: 'fieldOfView'; field: string; across: string; size?: string }
  /** A graduated cylinder: the level before (dashed), after, and the rise (the object's volume). */
  | { kind: 'gradCylinder'; before: string; after: string; volume?: string; max: number }
  /**
   * Protractor: one arm on 0°, the other at `angle`; `other` is the reading on the outer scale.
   * With `arms`, neither arm is on 0: each reads a mark on the inner scale (45 and 135), both
   * drag, and `angle` is the difference.
   */
  | {
      kind: 'protractor';
      angle: string;
      other?: string;
      arms?: { first: string; second: string };
    }
  /**
   * A wave drawn with its `wavelength` (and `amplitude`, when the lesson has one; else a
   * fixed height); `extent` is the width shown in wavelength units.
   */
  | {
      kind: 'wave';
      amplitude?: string;
      wavelength: string;
      /** Wavelengths drawn across: a number, or a value (the waves counted along a rope). */
      extent: number | string;
      frequency?: string;
    }
  /**
   * Punnett square: each parent's count of dominant alleles (0–2) sets its two alleles; the
   * four offspring boxes are shaded by genotype, `dominant` counts those showing the trait.
   */
  | {
      kind: 'punnettSquare';
      first: string;
      second: string;
      dominant: string;
      recessive?: string;
      letter: string;
      /** Grade 9: dihybrid, incomplete or codominant, X-linked (`typesHsg.ts`). */
      inheritance?: PunnettInheritance;
    }
  /** Table sweeping `sweep` over `rows`, computing `output` with `params` held. Tap a row. */
  | {
      kind: 'table';
      sweep: string;
      output: string;
      params: string[];
      /** The inputs, one per row; or worked out from the values (lengths 1 to half the perimeter − 1). */
      rows: number[] | ((v: Values) => number[]);
      /** A sentence naming what a parameter's value means ("1 foot = 12 inches"), over the table. */
      named?: { param: string; names: Record<number, string> };
      /** A name for each swept row ("Moon", "Mars"), in a first column. */
      rowNames?: string[];
    }
  /** Grades 9–12 (H20): a two-way frequency table (spec in `typesHse.ts`). */
  | { kind: 'table'; twoWay: TwoWaySpec }
  /** Block of mass `mass` pushed by force `force`, with its acceleration arrow. Drag the force. */
  | {
      kind: 'force';
      force: string;
      mass: string;
      acceleration: string;
      /** Smallest force / acceleration the arrows are scaled to (grows to fit). */
      forceExtent: number;
      accelerationExtent: number;
      /**
       * 'cart': a lab cart carrying the mass as metal blocks, pulled by a rope, with
       * F = m × a worked under it (reps/ForceCart.tsx). Default: a crate pushed.
       */
      object?: 'crate' | 'cart';
      /** One block's mass in the module's mass unit (default: a round size, up to 10 blocks). */
      block?: number;
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
  /**
   * The work set out on paper under this step (a column sum, a long-division bracket; see
   * `written.ts`). Left out, a plain arithmetic line gets the grid a student at the grade
   * would write (`autoWritten`) when the step has no `work` lines; `false` refuses one.
   */
  written?: false | ((v: Values) => Written | undefined);
  /** The grid after the work lines instead of before them (compare first, then subtract). */
  writtenLast?: boolean;
}

export interface ModuleDef {
  /**
   * Grade 6 only: `letters` for a page that teaches letters (6.EE, the area and cube
   * formulas); every other Grade 6 page names its values in words, as Grades 3–5 do.
   */
  notation?: 'words' | 'letters';
  /**
   * Grade 6 words pages only: the letters the page itself teaches (x in "3x + 5 when x = 4");
   * every other value is still named in words.
   */
  letters?: string[];
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
   * Show the slider row for this picture. The default depends on the picture kind
   * (`src/components/module/sliderPolicy.ts`): sliders only where sweeping a value teaches
   * something and the picture has no handle or tap of its own. Set it to override.
   */
  sliders?: boolean;
  /**
   * The inputs drawn as the equation itself instead of one row per value: a template with
   * {id} for each box, where `{a}/{b}` is a stacked fraction ('{a}/{b} ÷ {c}/{d} = {e}/{f}'),
   * `{w} {a}/{b}` a mixed number, and `{b}^{n}`, `10^{n}` or `{a}^2` a power. Text written
   * against a box is drawn touching it (`{p}x + {q} = {r}`, `{a}° + {b}° = 180°`); a line
   * break starts a second equation (a system). Values not in the template keep their rows
   * below it. Grades 9–12 parts (a group in braces, (…)^n, √, {s:sign}, log_{b}, ^{A}_{Z}X,
   * [[…]], {a:unit}, {a:coef}) and which pages use one: docs/EQUATION_INPUTS.md.
   */
  equation?: string;
  /**
   * Unit systems offered for the whole module (default: metric and US customary). Mixed units
   * stay available either way.
   */
  unitSystems?: UnitSystem[];
}
