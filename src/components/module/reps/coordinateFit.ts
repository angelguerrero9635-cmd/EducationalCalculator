/**
 * `coordinatePlane` `fit` (H96, group H2B): the plane sized to the points instead of a fixed
 * extent. Shared by CoordinatePlane.tsx and the harness. Plain math.
 */

/**
 * The smallest of 5, 10 and 20 (no more than `extent`) that holds `reach`, the largest
 * |coordinate| drawn, with a unit to spare; otherwise `extent` (past it the plane grows to a
 * round size, as without `fit`).
 */
export function fitExtent(reach: number, extent: number): number {
  for (const e of [5, 10, 20]) if (e <= extent && reach + 1 <= e) return e;
  return extent;
}
