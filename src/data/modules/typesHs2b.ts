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
