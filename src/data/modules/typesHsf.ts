/**
 * Optional fields that group HF (H23–H29 in `pictureRequestsHs.ts`) adds to existing picture
 * kinds for Grades 9–12. Kept apart so each kind's spec in `types.ts` / `typesGraphs.ts` gains
 * one line per field. Every string is a variable id; a number is a fixed value.
 */
import type { Mirror, NumOrVar } from './typesGraphs';

/** The second of two moves (H23): the same moves `transformation` makes, applied to A′. */
export type SecondMove =
  | { move: 'translate'; right: NumOrVar; up: NumOrVar }
  | { move: 'reflect'; mirror: Mirror }
  | { move: 'rotate'; angle: NumOrVar; center?: [NumOrVar, NumOrVar] }
  | { move: 'dilate'; factor: NumOrVar; center?: [NumOrVar, NumOrVar] };

/** The variable ids a second move names. */
export function secondMoveVars(m: SecondMove | undefined): string[] {
  if (!m) return [];
  const xs: (NumOrVar | undefined)[] =
    m.move === 'translate'
      ? [m.right, m.up]
      : m.move === 'reflect'
        ? typeof m.mirror === 'object'
          ? ['x' in m.mirror ? m.mirror.x : m.mirror.y]
          : []
        : m.move === 'rotate'
          ? [m.angle, ...(m.center ?? [])]
          : [m.factor, ...(m.center ?? [])];
  return xs.filter((x): x is string => typeof x === 'string');
}

/**
 * The side-splitter (H24): a line DE parallel to BC cuts the triangle's sides AB and AC at the
 * same fraction from A. With it, a `scaleCopy` spec's `width` and `height` are the sides AB and
 * AC and its `factor` is AD ÷ AB (the small triangle ADE is ABC dilated from A).
 */
export interface SideSplitter {
  /** Values labelling AD, DB, AE and EC (the caption checks AD ÷ DB = AE ÷ EC). */
  parts?: [string, string, string, string];
  /**
   * Values labelling DE and BC. With BC known the triangle is drawn to scale from its three
   * sides; without it, the angle at A is 50°.
   */
  base?: [string, string];
}

/**
 * Grades 9–12 coordinate geometry on a `coordinatePlane` (H25). With `second`: the segment's
 * midpoint M and the point P that splits it in the ratio m : n from the first point (its
 * m + n equal pieces ticked). `polygon` draws a figure from its corners, and with `slopes`
 * labels each side's slope, marks parallel sides with arrows and perpendicular ones with a
 * right-angle square.
 */
export interface PlaneGeometry {
  /** M's coordinates as values (checked: the average of the two points). */
  midpoint?: { x: string; y: string };
  /** P = A + m ÷ (m + n) × (B − A); `x`, `y` are P's coordinates as values. */
  partition?: { ratio: [NumOrVar, NumOrVar]; x?: string; y?: string };
  /** Corners A, B, C, … in order (3 to 6), numbers or values. */
  polygon?: [NumOrVar, NumOrVar][];
  slopes?: boolean;
}

/** The variable ids a `coordinatePlane`'s Grades 9–12 fields name. */
export function planeGeometryVars(r: PlaneGeometry): string[] {
  return [
    r.midpoint?.x,
    r.midpoint?.y,
    ...(r.partition ? [...r.partition.ratio, r.partition.x, r.partition.y] : []),
    ...(r.polygon ?? []).flat(),
  ].filter((x): x is string => typeof x === 'string');
}

/**
 * A sector of a `circle` (H26): the central angle `angle` in degrees (default) or radians, the
 * sector shaded from the radius pointing right, counterclockwise. `arc` and `area` are the arc
 * length and the sector's area as values (checked against the angle and the radius).
 */
export interface CircleSector {
  angle: NumOrVar;
  unit?: 'degrees' | 'radians';
  arc?: string;
  area?: string;
}

/** The variable ids a `circle`'s sector names. */
export function circleSectorVars(s: CircleSector | undefined): string[] {
  return s ? [s.angle, s.arc, s.area].filter((x): x is string => typeof x === 'string') : [];
}

/** The variable ids a `scaleCopy`'s Grades 9–12 fields name. */
export function scaleCopyHsfVars(r: {
  center?: [NumOrVar, NumOrVar];
  splitter?: SideSplitter;
}): string[] {
  return [...(r.center ?? []), ...(r.splitter?.parts ?? []), ...(r.splitter?.base ?? [])].filter(
    (x): x is string => typeof x === 'string',
  );
}
