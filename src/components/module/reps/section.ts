/**
 * Solids and the plane sections through them, for the cross-section picture and its harness
 * check. Pure geometry (no drawing): x runs left to right (the length), y from front to back
 * (the width), z up (the height). A solid is a list of corners and its faces, each face a list
 * of corner indexes.
 */
export type P3 = [number, number, number];
export type SolidShape = 'box' | 'triangularPrism' | 'pyramid';
export type Cut = 'base' | 'side' | 'diagonal';

export interface Solid {
  corners: P3[];
  faces: number[][];
}

/**
 * The solid with length l, width w, height h. A box and a pyramid stand on an l × w base, the
 * pyramid's apex over its middle. A triangular prism lies on its side with its triangle at
 * the front: a right triangle with legs l (across) and w (up), or `isosceles` with base l and
 * height w; its height h (between the triangles) runs back.
 */
export function solidOf(shape: SolidShape, l: number, w: number, h: number, isosceles = false) {
  if (shape === 'box') {
    const c: P3[] = [
      [0, 0, 0],
      [l, 0, 0],
      [l, w, 0],
      [0, w, 0],
      [0, 0, h],
      [l, 0, h],
      [l, w, h],
      [0, w, h],
    ];
    const faces = [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [0, 1, 5, 4],
      [1, 2, 6, 5],
      [2, 3, 7, 6],
      [3, 0, 4, 7],
    ];
    return { corners: c, faces } satisfies Solid;
  }
  if (shape === 'triangularPrism') {
    // Lying on a rectangle: the triangle faces the front, the prism's height runs back.
    const tri: [number, number][] = isosceles
      ? [
          [0, 0],
          [l, 0],
          [l / 2, w],
        ]
      : [
          [0, 0],
          [l, 0],
          [0, w],
        ];
    const c: P3[] = [
      ...tri.map(([x, z]) => [x, 0, z] as P3),
      ...tri.map(([x, z]) => [x, h, z] as P3),
    ];
    const faces = [
      [0, 1, 2],
      [3, 4, 5],
      [0, 1, 4, 3],
      [1, 2, 5, 4],
      [2, 0, 3, 5],
    ];
    return { corners: c, faces } satisfies Solid;
  }
  const c: P3[] = [
    [0, 0, 0],
    [l, 0, 0],
    [l, w, 0],
    [0, w, 0],
    [l / 2, w / 2, h],
  ];
  const faces = [
    [0, 1, 2, 3],
    [0, 1, 4],
    [1, 2, 4],
    [2, 3, 4],
    [3, 0, 4],
  ];
  return { corners: c, faces } satisfies Solid;
}

/**
 * The plane of a cut as a point on it and its normal. `base`: parallel to the base (up the
 * height; for the triangular prism, back along it). `side`: across the base (parallel to the
 * front; for the triangular prism, parallel to the floor, up the triangle). `diagonal`:
 * upright through the base's diagonal (the box and the pyramid).
 */
export function planeOf(
  shape: SolidShape,
  cut: Cut,
  at: number,
  l: number,
  w: number,
): { p: P3; n: P3 } {
  const lying = shape === 'triangularPrism';
  if (cut === 'base')
    return lying ? { p: [0, at, 0], n: [0, 1, 0] } : { p: [0, 0, at], n: [0, 0, 1] };
  if (cut === 'side')
    return lying ? { p: [0, 0, at], n: [0, 0, 1] } : { p: [0, at, 0], n: [0, 1, 0] };
  return { p: [0, 0, 0], n: [w, -l, 0] };
}

const sub = (a: P3, b: P3): P3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: P3, b: P3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: P3, b: P3): P3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** Every edge of the solid once, as corner index pairs, with the faces on each side. */
export function edgesOf(s: Solid): { a: number; b: number; faces: number[] }[] {
  const map = new Map<string, { a: number; b: number; faces: number[] }>();
  s.faces.forEach((f, fi) =>
    f.forEach((a, k) => {
      const b = f[(k + 1) % f.length]!;
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      const e = map.get(key) ?? { a: Math.min(a, b), b: Math.max(a, b), faces: [] };
      e.faces.push(fi);
      map.set(key, e);
    }),
  );
  return [...map.values()];
}

/** A face's normal pointing out of the solid. */
export function outward(s: Solid, fi: number): P3 {
  const f = s.faces[fi]!.map((i) => s.corners[i]!);
  const n = cross(sub(f[1]!, f[0]!), sub(f[2]!, f[0]!));
  const mid = s.corners
    .reduce<P3>((m, p) => [m[0] + p[0], m[1] + p[1], m[2] + p[2]], [0, 0, 0])
    .map((x) => x / s.corners.length) as P3;
  return dot(n, sub(f[0]!, mid)) < 0 ? [-n[0], -n[1], -n[2]] : n;
}

/**
 * The section: the corners where the plane crosses the solid's edges, in order around it
 * (empty when the plane misses the solid or only touches it).
 */
export function sectionOf(s: Solid, plane: { p: P3; n: P3 }): P3[] {
  const d = s.corners.map((q) => dot(sub(q, plane.p), plane.n));
  const scale = Math.max(1e-9, ...d.map(Math.abs));
  const eps = 1e-9 * scale;
  const pts: P3[] = [];
  const add = (q: P3) => {
    if (!pts.some((r) => Math.hypot(...sub(q, r)) < 1e-7 * (1 + Math.hypot(...q)))) pts.push(q);
  };
  s.corners.forEach((q, i) => {
    if (Math.abs(d[i]!) <= eps) add(q);
  });
  for (const e of edgesOf(s)) {
    const [da, db] = [d[e.a]!, d[e.b]!];
    if ((da < -eps && db > eps) || (da > eps && db < -eps)) {
      const t = da / (da - db);
      const [qa, qb] = [s.corners[e.a]!, s.corners[e.b]!];
      add([qa[0] + t * (qb[0] - qa[0]), qa[1] + t * (qb[1] - qa[1]), qa[2] + t * (qb[2] - qa[2])]);
    }
  }
  if (pts.length < 3) return [];
  // Order around the middle, measured in two directions on the plane.
  const n = plane.n;
  const u: P3 = Math.abs(n[2]) > 0.9 ? [1, 0, 0] : cross([0, 0, 1], n);
  const v = cross(n, u);
  const mid = pts
    .reduce<P3>((m, p) => [m[0] + p[0], m[1] + p[1], m[2] + p[2]], [0, 0, 0])
    .map((x) => x / pts.length) as P3;
  const sorted = [...pts].sort(
    (a, b) =>
      Math.atan2(dot(sub(a, mid), v), dot(sub(a, mid), u)) -
      Math.atan2(dot(sub(b, mid), v), dot(sub(b, mid), u)),
  );
  // A flat section (every point on one line) has no area.
  return areaOf(sorted) > 1e-9 * scale * scale ? sorted : [];
}

/** The area of a flat polygon in space. */
export function areaOf(pts: P3[]): number {
  let t: P3 = [0, 0, 0];
  pts.forEach((a, i) => {
    const c = cross(a, pts[(i + 1) % pts.length]!);
    t = [t[0] + c[0], t[1] + c[1], t[2] + c[2]];
  });
  return Math.hypot(...t) / 2;
}

/** What the section is called, from its corners: a triangle, a rectangle, a trapezoid, … */
export function sectionName(pts: P3[]): string {
  const n = pts.length;
  if (n === 3) return 'triangle';
  if (n === 5) return 'pentagon';
  if (n === 6) return 'hexagon';
  if (n !== 4) return `${n}-sided shape`;
  const side = (i: number) => sub(pts[(i + 1) % 4]!, pts[i]!);
  const len = (a: P3) => Math.hypot(...a);
  const parallel = (a: P3, b: P3) => len(cross(a, b)) < 1e-6 * len(a) * len(b);
  const pairs = [parallel(side(0), side(2)), parallel(side(1), side(3))];
  const square = (i: number) => Math.abs(dot(side(i), side(i + 1))) < 1e-6 * len(side(i)) ** 2;
  if (pairs[0] && pairs[1]) {
    if (!square(0)) return 'parallelogram';
    return Math.abs(len(side(0)) - len(side(1))) < 1e-6 * len(side(0)) ? 'square' : 'rectangle';
  }
  return pairs[0] || pairs[1] ? 'trapezoid' : 'quadrilateral';
}

/** The side lengths of a section, in order around it. */
export const sidesOf = (pts: P3[]) =>
  pts.map((a, i) => Math.hypot(...sub(pts[(i + 1) % pts.length]!, a)));

/** The volume of the solid: base × height for a prism, a third of that for a pyramid. */
export const volumeOf = (shape: SolidShape, l: number, w: number, h: number) =>
  shape === 'box' ? l * w * h : shape === 'triangularPrism' ? (l * w * h) / 2 : (l * w * h) / 3;

/** How far the plane can move: from 0 to this (the height, the width or the triangle's). */
export const reachOf = (shape: SolidShape, cut: Cut, w: number, h: number) =>
  cut === 'diagonal'
    ? 0
    : shape === 'triangularPrism'
      ? cut === 'base'
        ? h
        : w
      : cut === 'base'
        ? h
        : w;
