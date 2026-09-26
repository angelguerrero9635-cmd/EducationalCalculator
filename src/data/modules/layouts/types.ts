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
  /** A shape from corners in a 0–100 box (y down), closed unless `open` (a corner, clock hands). */
  | { kind: 'polygon'; points: [number, number][]; open?: boolean }
  | { kind: 'circle' }
  | { kind: 'heart' };

/** Stages to put in order, each with how long it takes; the total under the strip. */
export interface SequenceLayout extends LayoutBase {
  kind: 'sequence';
  /** "Put the stages in order." */
  question: string;
  /** In the right order. */
  stages: { label: string; span?: number }[];
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
  | { kind: 'earth' };

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
  /** Whether the lamp is on, and what sits in the light's way (a `lightPath` figure). */
  light?: { lamp: boolean; blocker?: 'hand' | 'mirror' };
  /** How the particles are packed (a `particles` figure). */
  particles?: { state: 'solid' | 'liquid' | 'gas'; mixed?: boolean; squeezed?: boolean };
  /** Where the person stands, whether the ball is thrown, and the time of day when lit (an `earth` figure). */
  earth?: {
    spot: 'top' | 'side' | 'bottom';
    thrown?: boolean;
    sunlit?: 'morning' | 'noon' | 'evening' | 'midnight';
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
