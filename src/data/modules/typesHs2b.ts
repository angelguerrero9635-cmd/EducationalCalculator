/**
 * Grades 9–12 round 2, group H2B (H96 in `pictureRequestsHs.ts`): geometry options on existing
 * kinds. Each is an optional field a page sets; a page that doesn't set it draws as before.
 * Every string is a variable id; a number is a fixed value the page doesn't ask for.
 */

/**
 * `markedFigure` `regular`: a regular polygon of `sides` corners (3 to 30), a flat side at the
 * bottom (A at its left, B at its right, then C, D, … counterclockwise).
 */
export interface RegularPolygon {
  /** The number of sides (a value id, or a fixed number). */
  sides: string | number;
  /** The diagonals from A that cut it into n − 2 triangles, shaded in turn (numbered to 12). */
  triangles?: boolean;
  /** Side AB run on past B, and the exterior angle at B between it and BC marked. */
  exterior?: boolean;
  /**
   * Values labelled on the figure: `interior` in the angle at B, `exterior` beside the exterior
   * angle; `sum` (the interior angles' sum) is worked in the caption. Each is checked.
   */
  labels?: { sum?: string; interior?: string; exterior?: string };
}

/** The variable ids a regular polygon names. */
export function regularVars(r: RegularPolygon | undefined): string[] {
  if (!r) return [];
  return [r.sides, r.labels?.sum, r.labels?.interior, r.labels?.exterior].filter(
    (x): x is string => typeof x === 'string',
  );
}

/** A value id, or a fixed number. */
type Num = string | number;

/**
 * `circleTheorems` fields for the two theorems group H2B adds:
 * - `cyclic`: an inscribed quadrilateral ABCD, its angles from the values (A and B place it;
 *   C and D are checked: opposite angles add to 180°). Each angle stands on the arc across
 *   from it, drawn in its tint.
 * - `arcAngle`: an angle from two arcs. `where` is a + − box's code (`{o:op}`: 1 +, 2 −) or a
 *   fixed 1 or 2. 1 (inside): chords AB and CD cross at E and ∠AEC = (arc AC + arc BD) ÷ 2.
 *   2 (outside): secants from P cut the far arc BD and the near arc AC, and
 *   ∠P = (far − near) ÷ 2. `arcs` are [arc AC, arc BD] inside and [far, near] outside; `angle`
 *   is the angle's value.
 */
export interface CircleHs2b {
  cyclic?: { A?: Num; B?: Num; C?: Num; D?: Num };
  arcAngle?: { arcs: [Num, Num]; angle?: string; where: Num };
}

/** The variable ids a `circleTheorems` spec's group H2B fields name. */
export function circleHs2bVars(r: CircleHs2b): string[] {
  return [
    ...Object.values(r.cyclic ?? {}),
    ...(r.arcAngle ? [...r.arcAngle.arcs, r.arcAngle.angle, r.arcAngle.where] : []),
  ].filter((x): x is string => typeof x === 'string');
}

// ─── Card figures (sort cards and sequence stages) ───────────────────────────

/** A triangle on a card by its sides [a, b, c]: BC, CA and AB (any unit; drawn to scale). */
export type CardSides = [number, number, number];
export type TriSide = 'a' | 'b' | 'c';
export type TriCorner = 'A' | 'B' | 'C';

/**
 * Two triangles side by side, drawn to one scale from their sides, with the marks a
 * congruence or similarity card needs. Marks mean what they say on both triangles: `ticks`
 * sides with the same count are equal, `arcs` angles with the same count are equal, `right`
 * angles are 90° (each checked). The second is ABC's partner DEF (a with d, …).
 */
export interface MarkedTrianglesCard {
  kind: 'markedTriangles';
  triangles: [CardSides, CardSides];
  /** The second drawn turned over (its mirror image). */
  mirror?: boolean;
  /** Equal sides, the same count on both triangles: { a: 1, c: 2 }. */
  ticks?: Partial<Record<TriSide, number>>;
  /** Equal angles, the same count on both: { A: 1, B: 2 }. */
  arcs?: Partial<Record<TriCorner, number>>;
  /** Right angles, marked on both. */
  right?: TriCorner[];
  /** Side lengths written beside the sides (the numbers in `triangles`): all, or these sides. */
  lengths?: boolean | TriSide[];
  /** The corner letters A, B, C and D, E, F. */
  names?: boolean;
}

/**
 * A part of a construction card, by one-letter point names: 'AB' a segment, ray or line, 'ABC'
 * the angle at B. `id` names it for `lit`.
 */
export type CardPart = { id?: string } & (
  | { segment: string; dashed?: boolean }
  | { ray: string }
  | { line: string; dashed?: boolean }
  /** A circle about a center through a point. */
  | { circle: string; through: string }
  /** A compass arc about `compass` from one point to another (the short way, run on a little). */
  | { compass: string; from: string; to: string }
  /** A short compass arc about `compass` through a point, `span` degrees long (default 50). */
  | { compass: string; through: string; span?: number }
  /** A point drawn as a dot (its letter if it is named). */
  | { dot: string }
  /** A triangle filled ('PMR'). */
  | { fill: string }
  | { ticks: string; count: number }
  | { arcs: string; count: number }
  | { right: string }
  /** A short text (an angle's number, a line's name): in the angle 'ABC', or beside point 'A'. */
  | {
      text: string;
      at: string;
      /** In an angle: how far out from its corner, in the 0–100 box (default 16). */
      r?: number;
    }
);

/**
 * A construction or proof figure for a sequence stage (or a sort card), 104 × 104: named points
 * in a 0–100 box (y down) and the parts drawn on them, the stage's new or used parts `lit` in
 * the highlight. Compass arcs, ticks, arcs and right marks are checked against the points.
 */
export interface ConstructionCard {
  kind: 'construction';
  points: Record<string, [number, number]>;
  parts: CardPart[];
  /** The points whose letters show (default: every point). */
  named?: string[];
  /** Part ids drawn in the highlight. */
  lit?: string[];
}

/**
 * A solid in outline with a cutting plane through it and the cross section shaded, 96 × 84
 * (flat, seen from above and to the right). Cuts: `level` (across, halfway up), `axis`
 * (straight down through the middle: a cylinder's axis, a cone's tip), `slant` (tilted, missing
 * a cylinder's or cone's bases), and on a cube only `edges` (down through two opposite edges),
 * `corners` (through the three corners next to one corner) and `pentagon` (a tilted plane
 * crossing five faces). The section is worked out from the solid and the plane.
 */
export interface SolidCutCard {
  kind: 'solidCut';
  solid: 'cube' | 'pyramid' | 'cylinder' | 'cone' | 'sphere';
  cut: 'level' | 'axis' | 'slant' | 'edges' | 'corners' | 'pentagon';
}

/** The card figures group H2B adds (`components/module/layouts/cardFiguresHs2b.tsx`). */
export type Hs2bCard = MarkedTrianglesCard | ConstructionCard | SolidCutCard;
