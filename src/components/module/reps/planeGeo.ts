/**
 * Coordinate geometry for the plane's Grades 9–12 marks (H25): the point that splits a segment
 * in a ratio, and a polygon's side slopes with its parallel and perpendicular sides. Shared by
 * the picture and the harness. Plain math, no drawing.
 */

export type Pt = [number, number];

const clean = (x: number) => Number(x.toFixed(9));

/** The point m ÷ (m + n) of the way from a to b (the midpoint is 1 : 1). */
export function partitionOf(a: Pt, b: Pt, m: number, n: number): Pt {
  const t = m / (m + n);
  return [clean(a[0] + t * (b[0] - a[0])), clean(a[1] + t * (b[1] - a[1]))];
}

export interface Side {
  from: number;
  to: number;
  /** Rise over run; undefined for a vertical side. */
  slope?: number;
  /** 1, 2, … for sides parallel to another side (the same number for each such pair). */
  parallel: number;
}

/** The sides of a polygon (corners in order) with their slopes and parallel groups. */
export function sidesOf(ps: Pt[]): Side[] {
  const sides = ps.map((p, i) => {
    const q = ps[(i + 1) % ps.length]!;
    const run = q[0] - p[0];
    return {
      from: i,
      to: (i + 1) % ps.length,
      slope: Math.abs(run) < 1e-12 ? undefined : (q[1] - p[1]) / run,
      parallel: 0,
    } as Side;
  });
  const same = (a?: number, b?: number) =>
    a === undefined || b === undefined ? a === b : Math.abs(a - b) < 1e-9;
  let group = 0;
  sides.forEach((s, i) => {
    if (s.parallel) return;
    const others = sides.filter((o, j) => j > i && !o.parallel && same(o.slope, s.slope));
    if (!others.length) return;
    group += 1;
    for (const o of [s, ...others]) o.parallel = group;
  });
  return sides;
}

/** The corners where the two sides meeting there are perpendicular. */
export function rightCorners(ps: Pt[]): number[] {
  return ps.flatMap((p, i) => {
    const a = ps[(i + ps.length - 1) % ps.length]!;
    const b = ps[(i + 1) % ps.length]!;
    const dot = (a[0] - p[0]) * (b[0] - p[0]) + (a[1] - p[1]) * (b[1] - p[1]);
    const size = Math.hypot(a[0] - p[0], a[1] - p[1]) * Math.hypot(b[0] - p[0], b[1] - p[1]);
    return size > 0 && Math.abs(dot) < 1e-9 * size ? [i] : [];
  });
}
