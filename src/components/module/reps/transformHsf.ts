/**
 * Symmetry of a figure from its corners (H23): the lines of symmetry and the order of
 * rotational symmetry, found by testing which reflections and turns about the figure's center
 * carry every side onto a side. Shared by the transformation picture and the harness. Plain
 * math, no drawing.
 */
import type { Pt } from './transform';

export interface Symmetry {
  /** The center the turns are about (the corners' average). */
  center: Pt;
  /** Each line of symmetry as a unit direction through the center (0 ≤ angle < 180°). */
  lines: Pt[];
  /** How many turns up to a full turn carry the figure onto itself (1: none but the full turn). */
  order: number;
}

/** The sides as index pairs (a segment has one side; 3 or more corners close up). */
const sidesOf = (n: number) =>
  n === 2 ? [[0, 1] as const] : Array.from({ length: n }, (_, i) => [i, (i + 1) % n] as const);

/** Whether the map carries every side of `ps` onto a side (within `tol`). */
function carries(ps: Pt[], map: (p: Pt) => Pt, tol: number): boolean {
  const moved = ps.map(map);
  const same = (p: Pt, q: Pt) => Math.hypot(p[0] - q[0], p[1] - q[1]) < tol;
  // Each moved corner lands on a corner…
  const onto = moved.map((m) => ps.findIndex((p) => same(p, m)));
  if (onto.some((i) => i < 0)) return false;
  // …and each side on a side.
  const sides = sidesOf(ps.length);
  const key = (i: number, j: number) => (i < j ? `${i}-${j}` : `${j}-${i}`);
  const have = new Set(sides.map(([i, j]) => key(i, j)));
  return sides.every(([i, j]) => have.has(key(onto[i]!, onto[j]!)));
}

export function symmetryOf(ps: Pt[]): Symmetry {
  const n = ps.length;
  const center: Pt = [ps.reduce((s, p) => s + p[0], 0) / n, ps.reduce((s, p) => s + p[1], 0) / n];
  const size = Math.max(1e-9, ...ps.map((p) => Math.hypot(p[0] - center[0], p[1] - center[1])));
  const tol = 1e-6 * Math.max(1, size);
  const [cx, cy] = center;
  // Turns: the largest n with a turn of 360°/n that carries the figure onto itself.
  let order = 1;
  for (let k = Math.max(2, n); k >= 2; k--) {
    const t = (2 * Math.PI) / k;
    const [cos, sin] = [Math.cos(t), Math.sin(t)];
    const turn = ([x, y]: Pt): Pt => [
      cx + (x - cx) * cos - (y - cy) * sin,
      cy + (x - cx) * sin + (y - cy) * cos,
    ];
    if (carries(ps, turn, tol)) {
      order = k;
      break;
    }
  }
  // Lines: a line of symmetry runs through the center and a corner, the middle of a side, or
  // square to a side; test each such direction.
  const dirs: Pt[] = [];
  const unit = (x: number, y: number): Pt | undefined => {
    const l = Math.hypot(x, y);
    if (l < tol) return undefined;
    // One of the two directions, pointing into the upper half (0 ≤ angle < 180°).
    const [ux, uy] = [x / l, y / l];
    return uy < -1e-12 || (Math.abs(uy) <= 1e-12 && ux < 0) ? [-ux, -uy] : [ux, uy];
  };
  const add = (d: Pt | undefined) => {
    if (d && !dirs.some((e) => Math.abs(e[0] * d[1] - e[1] * d[0]) < 1e-9)) dirs.push(d);
  };
  for (const p of ps) add(unit(p[0] - cx, p[1] - cy));
  for (const [i, j] of sidesOf(n)) {
    const [p, q] = [ps[i]!, ps[j]!];
    add(unit((p[0] + q[0]) / 2 - cx, (p[1] + q[1]) / 2 - cy));
    add(unit(-(q[1] - p[1]), q[0] - p[0]));
    add(unit(q[0] - p[0], q[1] - p[1]));
  }
  const lines = dirs
    .filter(([dx, dy]) =>
      carries(
        ps,
        ([x, y]) => {
          const t = (x - cx) * dx + (y - cy) * dy;
          const [fx, fy] = [cx + t * dx, cy + t * dy];
          return [2 * fx - x, 2 * fy - y];
        },
        tol,
      ),
    )
    .sort((a, b) => Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]));
  return { center, lines, order };
}
