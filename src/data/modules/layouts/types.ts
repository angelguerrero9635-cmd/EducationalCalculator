/**
 * Module layouts other than the calculator (docs/MODULE_GUIDE.md, "Module layouts"). A
 * lesson whose idea isn't a quantity relationship gets one of these: the page keeps the
 * grade's words and the review process, but there are no values, formulas or walkthrough.
 * Everything a student reads is content here, never in a component.
 */

interface LayoutBase {
  /** Skill id, or `<skill id>~<slug>` for a problem type. */
  id: string;
  /** Name of a problem-type page. */
  title?: string;
  /** Problem types: what the page is for, in one line ("Use this for …"). */
  use?: string;
  /** "Good to know" bullets, in the grade's words. */
  assumptions: string[];
}

/** Cards to put into labelled groups by one property, with a count per group. */
export interface SortLayout extends LayoutBase {
  kind: 'sort';
  /** The question the sort answers: "Does it bend?" */
  question: string;
  bins: {
    id: string;
    label: string;
    /** One sentence about the property, shown when the group is full. */
    why: string;
  }[];
  cards: { label: string; bin: string; figure?: CardFigure }[];
}

/** A small drawing on a sort card, so the property is seen, not remembered. */
export type CardFigure =
  /** Two lines: parallel at `angle` degrees, or crossing at that angle (90 = perpendicular). */
  | { kind: 'lines'; angle: number; parallel?: boolean }
  /** A big letter. */
  | { kind: 'letter'; text: string }
  /**
   * A shape from corners in a 0–100 box (y down), closed unless `open` (a corner, clock hands).
   * `curved` draws that side (from corner i to the next) as an arc; `marks` adds the square
   * corner marks and equal-side ticks, worked out from the corners.
   */
  | {
      kind: 'polygon';
      points: [number, number][];
      open?: boolean;
      curved?: number;
      marks?: boolean;
    }
  | { kind: 'circle' }
  | { kind: 'heart' }
  /** A solid shape in outline. */
  | { kind: 'solid'; shape: 'sphere' | 'cube' | 'cylinder' | 'cone' | 'box' }
  /**
   * A circle, square or rectangle cut into `parts`, equal or not, with the first `shaded`
   * parts shaded. Straight cuts are strips (a square in fourths is a 2 × 2 grid); diagonal
   * cuts go corner to corner (2 or 4 parts).
   */
  | {
      kind: 'cut';
      shape: 'circle' | 'square' | 'rectangle';
      parts: number;
      equal: boolean;
      cuts?: 'straight' | 'diagonal';
      shaded?: number;
    }
  /**
   * A ribbon `length` cubes long, with cubes under it laid end to end (`cubes`), with gaps,
   * overlapping, or not lined up with the ribbon's start (`offset`).
   */
  | { kind: 'bar'; length: number; units?: 'cubes' | 'gap' | 'overlap' | 'offset' }
  /** Dots in pairs, two rows; an odd count leaves one without a partner. */
  | { kind: 'dots'; count: number }
  /** A small drawing of an everyday thing. */
  | { kind: 'icon'; icon: CardIcon }
  /** Fraction bars of the same whole, one under the other: [shaded parts, parts]. */
  | { kind: 'fractionBars'; bars: [number, number][] }
  /** A line with no arrowheads (a segment, with its endpoints), one (a ray) or two (a line); or one point. */
  | { kind: 'ray'; arrows: 0 | 1 | 2; point?: boolean };

/** The everyday things a card can show. */
export type CardIcon =
  | 'sun'
  | 'moon'
  | 'feather'
  | 'leaf'
  | 'crayon'
  | 'sock'
  | 'brick'
  | 'watermelon'
  | 'backpack'
  | 'bowling ball'
  | 'paper clip'
  | 'door'
  | 'eraser'
  | 'bed'
  | 'bus';

/** Stages to put in order, each with how long it takes; the total under the strip. */
export interface SequenceLayout extends LayoutBase {
  kind: 'sequence';
  /** "Put the stages in order." */
  question: string;
  /** In the right order. */
  stages: { label: string; span?: number; figure?: CardFigure }[];
  /** The unit of the spans ("days"). */
  unit?: string;
  /** Label of the sum of the spans ("Whole cycle"). */
  totalLabel?: string;
}

/** What an explore figure can show; a scene sets one of these. */
export type Figure =
  /** A thing made of named parts, each with its job; a scene highlights one part. */
  | { kind: 'parts'; parts: { name: string; job: string }[] }
  /** A ball and a box; a scene puts the ball above, below, beside, in front of or behind. */
  | { kind: 'position' }
  /** A clock face; a scene sets the time. */
  | { kind: 'clock' }
  /** Animals as dots: alone, or together in a group. */
  | { kind: 'dots' }
  /** Two bar magnets facing each other; a scene turns one round. */
  | { kind: 'magnets' }
  /** A flashlight code: a pattern of flashes. */
  | { kind: 'flashes' }
  /** A lamp, an object and an eye; a scene turns the lamp on or off and puts a hand or mirror in the way. */
  | { kind: 'lightPath' }
  /** Particles in a box; a scene packs them as a solid, liquid or gas, mixes a second kind in, or squeezes the box. */
  | { kind: 'particles' }
  /**
   * A globe with a person and a dropped ball at a spot, the pull arrow toward the center; a
   * scene can throw the ball up, or light one half from a sun and mark the time of day.
   */
  | { kind: 'earth' }
  /** A ball on the floor seen from above, a hand pushing (or a string pulling) and the path after. */
  | { kind: 'push' }
  /** One sound maker, still or shaking, with sound marks when it shakes. */
  | { kind: 'vibration' }
  /** The sky over a house from East to West: the sun on its path, or the night sky. */
  | { kind: 'sky' }
  /** A balloon, plain or rubbed, near paper bits, hair, a wall or a second balloon. */
  | { kind: 'static' }
  /** An addition or times table from 0 to 10; a scene lights rows, columns, cells or the mirror line. */
  | { kind: 'timesTable' };

export interface Scene {
  label: string;
  /** What to read about this scene, one sentence per line. */
  lines: string[];
  /** The part to highlight (a `parts` figure). */
  part?: string;
  /** Where the ball is (a `position` figure). */
  position?: 'above' | 'below' | 'beside' | 'in front of' | 'behind';
  /** [hour, minutes] (a `clock` figure). */
  time?: [number, number];
  /** [groups, animals in each] (a `dots` figure). */
  dots?: [number, number];
  /** Which poles face each other (a `magnets` figure). */
  poles?: 'N–S' | 'N–N' | 'S–S';
  /** The flashes, as "● ● ●" with "—" for a long one (a `flashes` figure). */
  flashes?: string;
  /**
   * Whether the lamp is on and what sits in the light's way (a `lightPath` figure). With a
   * `wall`, or a blocker made of a material (clear, cloudy, solid), the figure is a lamp, the
   * thing and a wall with its shadow; `height` puts the lamp low (a long shadow) or high.
   */
  light?: {
    lamp: boolean;
    blocker?: 'hand' | 'mirror' | 'clear' | 'cloudy' | 'solid';
    height?: 'low' | 'high';
    wall?: boolean;
  };
  /** How the particles are packed (a `particles` figure). */
  particles?: { state: 'solid' | 'liquid' | 'gas'; mixed?: boolean; squeezed?: boolean };
  /** Where the person stands, whether the ball is thrown, and the time of day when lit (an `earth` figure). */
  earth?: {
    spot: 'top' | 'side' | 'bottom';
    thrown?: boolean;
    sunlit?: 'morning' | 'noon' | 'evening' | 'midnight';
  };
  /** Where the push comes from, how hard, and whether it is a pull on a string (a `push` figure). */
  push?: { from: 'behind' | 'front' | 'side'; strength: 'gentle' | 'hard'; pull?: boolean };
  /** The sound maker and whether it is shaking (a `vibration` figure). */
  vibrate?: { thing: 'band' | 'drum' | 'bell' | 'voice'; shaking: boolean };
  /** The sun at a spot on its path, or the night sky (a `sky` figure). */
  sky?: { body: 'sun' | 'night'; at?: 'east' | 'high' | 'west' };
  /** Whether the balloon was rubbed, and what it is near (a `static` figure). */
  charge?: { rubbed: boolean; near: 'paper' | 'hair' | 'wall' | 'balloon' };
  /** What the table shows and lights (a `timesTable` figure). Rows and columns are 0–10. */
  table?: {
    op: '×' | '+';
    rows?: number[];
    columns?: number[];
    cells?: 'even' | 'odd';
    mirror?: boolean;
  };
}

/** An idea with no honest quantity: a picture with a few scenes to switch between. */
export interface ExploreLayout extends LayoutBase {
  kind: 'explore';
  figure: Figure;
  scenes: Scene[];
}

/** A quantity recorded over time: a table the student changes, its chart, the pattern. */
export interface ObserveLayout extends LayoutBase {
  kind: 'observe';
  /** Column headings ("Week 1", …). */
  columns: string[];
  /** What the row measures ("Rain"). */
  rowLabel: string;
  unit: string;
  max: number;
  step: number;
  /** The opening values, one per column. */
  initial: number[];
  /** The pattern in a sentence, from the current values. */
  pattern: (values: number[]) => string;
}

export type LayoutDef = SortLayout | SequenceLayout | ExploreLayout | ObserveLayout;
