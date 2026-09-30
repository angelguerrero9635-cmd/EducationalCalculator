/**
 * A regular polygon for `markedFigure` `regular` (H96, group H2B), in math coordinates (y up):
 * n corners on a circle of radius 1, side AB flat at the bottom, A at its left, then B, C, …
 * counterclockwise. The fan of diagonals from A, the run-on of AB past B (E) and the angle
 * measures come from it. Shared by RegularPolygon.tsx and the harness. Plain math.
 */
export type R2 = [number, number];

export interface RegularFigure {
  n: number;
  /** The corners, A first. */
  pts: R2[];
  /** A point on AB run on past B (the exterior angle's side). */
  E: R2;
  sum: number;
  interior: number;
  exterior: number;
  /** Why the values make no polygon (drawn faded, the caption says why). */
  reason?: string;
}

export const REGULAR_MAX = 30;

/** Corner names: A–Z, then A₁, B₁, … (only A, B and C are drawn). */
export const cornerName = (i: number) =>
  i < 26 ? String.fromCharCode(65 + i) : `${String.fromCharCode(65 + (i - 26))}₁`;

export function buildRegular(n: number | undefined): RegularFigure {
  let reason: string | undefined;
  if (n === undefined) reason = 'Type the number of sides.';
  else if (!Number.isInteger(n)) reason = 'A polygon has a whole number of sides.';
  else if (n < 3) reason = 'A polygon has at least 3 sides.';
  else if (n > REGULAR_MAX) reason = `The picture draws up to ${REGULAR_MAX} sides.`;
  const k = reason ? 6 : n!;
  const step = (2 * Math.PI) / k;
  const start = -Math.PI / 2 - step / 2;
  const pts = Array.from(
    { length: k },
    (_, i) => [Math.cos(start + i * step), Math.sin(start + i * step)] as R2,
  );
  const [A, B] = [pts[0]!, pts[1]!];
  const side = B[0] - A[0];
  const E: R2 = [B[0] + side * 0.9 + 0.25, B[1]];
  const sum = (k - 2) * 180;
  return { n: k, pts, E, sum, interior: sum / k, exterior: 360 / k, reason };
}

/** The angle at v between the rays to p and q, in degrees. */
export function angleAt(v: R2, p: R2, q: R2): number {
  const a = Math.atan2(p[1] - v[1], p[0] - v[0]);
  const b = Math.atan2(q[1] - v[1], q[0] - v[0]);
  let d = Math.abs(a - b);
  if (d > Math.PI) d = 2 * Math.PI - d;
  return (d * 180) / Math.PI;
}
