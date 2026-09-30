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

/** The card figures group H2B adds (`components/module/layouts/cardFiguresHs2b.tsx`). */
export type Hs2bCard = MarkedTrianglesCard;
