/**
 * The `solidCut` card (H96, group H2B): a solid 2 units across centered at the origin (y up), a
 * cutting plane n · p = d, and the cross section worked out from them, seen from above and to
 * the right. Shared by cardFiguresHs2b.tsx and the harness. Plain math.
 */
import type { SolidCutCard } from '@/data/modules/typesHs2b';

export type V3 = [number, number, number];

const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: V3): V3 => {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** The cuts that only a cube takes. */
export const CUBE_ONLY = ['edges', 'corners', 'pentagon'] as const;

/** The plane of a cut: unit normal n and offset d (points p with n · p = d). */
export function planeOf(f: SolidCutCard): { n: V3; d: number } {
  switch (f.cut) {
    case 'level':
      return { n: [0, 1, 0], d: 0 };
    case 'axis':
      return { n: [1, 0, 0], d: 0 };
    case 'slant':
      // Tilted enough to show, never as steep as a cone's side: it misses the bases.
      return f.solid === 'cone'
        ? { n: norm([0.4, 1, 0]), d: 0.2 / Math.hypot(0.4, 1) }
        : { n: norm([0.45, 1, 0]), d: 0 };
    case 'edges':
      return { n: norm([1, 0, 1]), d: 0 };
    case 'corners':
      return { n: norm([1, 1, 1]), d: 1 / Math.sqrt(3) };
    case 'pentagon':
      return { n: norm([2, 1, 1]), d: 1.5 / Math.sqrt(6) };
  }
}

/** Whether p is inside (or on) the solid. */
export function inside(solid: SolidCutCard['solid'], [x, y, z]: V3): boolean {
  const e = 1e-9;
  const r = Math.hypot(x, z);
  switch (solid) {
    case 'cube':
      return Math.max(Math.abs(x), Math.abs(y), Math.abs(z)) <= 1 + e;
    case 'pyramid':
      return y >= -1 - e && y <= 1 + e && Math.max(Math.abs(x), Math.abs(z)) <= (1 - y) / 2 + e;
    case 'cylinder':
      return r <= 1 + e && Math.abs(y) <= 1 + e;
    case 'cone':
      return y >= -1 - e && y <= 1 + e && r <= (1 - y) / 2 + e;
    case 'sphere':
      return Math.hypot(x, y, z) <= 1 + e;
  }
}

/** Two unit directions across the plane: v as near "up" as the plane allows, u across. */
export function planeBasis(n: V3): [V3, V3] {
  const up: V3 = Math.abs(n[1]) > 0.99 ? [0, 0, -1] : [0, 1, 0];
  const v = norm([up[0] - n[0] * dot(up, n), up[1] - n[1] * dot(up, n), up[2] - n[2] * dot(up, n)]);
  return [norm(cross(v, n)), v];
}

/**
 * The cross section's boundary (the solids are convex, so it is the farthest point inside
 * in each direction across the plane from the point of the plane nearest the center); empty
 * when the plane misses the solid.
 */
export function sectionOf(f: SolidCutCard, steps = 240): V3[] {
  const { n, d } = planeOf(f);
  const c0: V3 = [n[0] * d, n[1] * d, n[2] * d];
  if (!inside(f.solid, c0)) return [];
  const [u, v] = planeBasis(n);
  return Array.from({ length: steps }, (_, k) => {
    const t = (2 * Math.PI * k) / steps;
    const dir: V3 = [
      u[0] * Math.cos(t) + v[0] * Math.sin(t),
      u[1] * Math.cos(t) + v[1] * Math.sin(t),
      u[2] * Math.cos(t) + v[2] * Math.sin(t),
    ];
    let [lo, hi] = [0, 4];
    for (let i = 0; i < 40; i++) {
      const m = (lo + hi) / 2;
      if (inside(f.solid, [c0[0] + dir[0] * m, c0[1] + dir[1] * m, c0[2] + dir[2] * m])) lo = m;
      else hi = m;
    }
    return [c0[0] + dir[0] * lo, c0[1] + dir[1] * lo, c0[2] + dir[2] * lo];
  });
}

/** The corners of a polyhedron's section: one per edge the plane crosses (cube, pyramid). */
export function sectionSides(f: SolidCutCard): number | undefined {
  const { n, d } = planeOf(f);
  const cube: V3[] = [];
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) cube.push([x, y, z]);
  const verts: V3[] =
    f.solid === 'cube'
      ? cube
      : f.solid === 'pyramid'
        ? [
            [-1, -1, -1],
            [1, -1, -1],
            [1, -1, 1],
            [-1, -1, 1],
            [0, 1, 0],
          ]
        : [];
  if (!verts.length) return undefined;
  const edges: [number, number][] =
    f.solid === 'cube'
      ? cube.flatMap((a, i) =>
          cube.flatMap((b, j) =>
            j > i && a.filter((x, k) => x !== b[k]).length === 1
              ? [[i, j] as [number, number]]
              : [],
          ),
        )
      : [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 0],
          [0, 4],
          [1, 4],
          [2, 4],
          [3, 4],
        ];
  const side = (p: V3) => dot(n, p) - d;
  // A corner on the plane counts once; an edge counts when its ends lie strictly either side.
  const on = verts.filter((p) => Math.abs(side(p)) < 1e-9).length;
  const crossed = edges.filter(([i, j]) => side(verts[i]!) * side(verts[j]!) < -1e-12).length;
  return on + crossed;
}

/** The view: turned 32° about the vertical and tipped 22° toward the viewer; x right, y up. */
export function project([x, y, z]: V3): [number, number] {
  const a = (-32 * Math.PI) / 180;
  const b = (22 * Math.PI) / 180;
  const x1 = x * Math.cos(a) + z * Math.sin(a);
  const z1 = -x * Math.sin(a) + z * Math.cos(a);
  return [x1, y * Math.cos(b) - z1 * Math.sin(b)];
}

/** Toward the viewer, for telling front faces from back ones. */
export const VIEW: V3 = (() => {
  const a = (-32 * Math.PI) / 180;
  const b = (22 * Math.PI) / 180;
  // The direction that projects to a point: z1 axis tipped by b, turned back by a.
  const z1: V3 = [0, Math.sin(b), Math.cos(b)];
  return [-z1[2] * Math.sin(a), z1[1], z1[2] * Math.cos(a)];
})();
