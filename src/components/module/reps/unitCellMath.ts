/**
 * Sums for HC16 `unitCell` (UnitCellSpec in typesHe2b.ts), shared by the picture and its
 * harness check: each lattice's sites (by where they sit, so they count to Z), the touching
 * direction and a from r, a plane's polygon in the cell, d and Bragg's law.
 */

export type Lattice = 'sc' | 'bcc' | 'fcc' | 'rocksalt' | 'cesiumChloride' | 'zincBlende';
export const LATTICES: Lattice[] = ['sc', 'bcc', 'fcc', 'rocksalt', 'cesiumChloride', 'zincBlende'];

/** A page's structure code (atoms per cell, as the pages pick it) to its lattice. */
export const latticeOfZ = (z: number): Lattice | undefined =>
  z === 1 ? 'sc' : z === 2 ? 'bcc' : z === 4 ? 'fcc' : undefined;

export type Site = 'corner' | 'edge' | 'face' | 'body';
/** The share of an atom inside the cell, by where it sits. */
export const SHARE: Record<Site, number> = { corner: 1 / 8, edge: 1 / 4, face: 1 / 2, body: 1 };

export interface CellAtom {
  p: [number, number, number];
  site: Site;
  /** 0: the metal, or the anion; 1: the cation. */
  species: 0 | 1;
}

const CORNERS: [number, number, number][] = [0, 1].flatMap((x) =>
  [0, 1].flatMap((y) => [0, 1].map((z) => [x, y, z] as [number, number, number])),
);
const FACES: [number, number, number][] = [
  [0.5, 0.5, 0],
  [0.5, 0.5, 1],
  [0.5, 0, 0.5],
  [0.5, 1, 0.5],
  [0, 0.5, 0.5],
  [1, 0.5, 0.5],
];
const EDGES: [number, number, number][] = [0, 1].flatMap((a) =>
  [0, 1].flatMap((b) => [
    [0.5, a, b] as [number, number, number],
    [a, 0.5, b] as [number, number, number],
    [a, b, 0.5] as [number, number, number],
  ]),
);
const at = (ps: [number, number, number][], site: Site, species: 0 | 1): CellAtom[] =>
  ps.map((p) => ({ p, site, species }));

/** Every atom drawn in the cell (corners, edges, faces and inside). */
export function cellAtoms(l: Lattice): CellAtom[] {
  const fcc = [...at(CORNERS, 'corner', 0), ...at(FACES, 'face', 0)];
  switch (l) {
    case 'sc':
      return at(CORNERS, 'corner', 0);
    case 'bcc':
      return [...at(CORNERS, 'corner', 0), ...at([[0.5, 0.5, 0.5]], 'body', 0)];
    case 'fcc':
      return fcc;
    case 'rocksalt':
      return [...fcc, ...at(EDGES, 'edge', 1), ...at([[0.5, 0.5, 0.5]], 'body', 1)];
    case 'cesiumChloride':
      return [...at(CORNERS, 'corner', 0), ...at([[0.5, 0.5, 0.5]], 'body', 1)];
    case 'zincBlende':
      return [
        ...fcc,
        ...at(
          [
            [0.25, 0.25, 0.25],
            [0.75, 0.75, 0.25],
            [0.75, 0.25, 0.75],
            [0.25, 0.75, 0.75],
          ],
          'body',
          1,
        ),
      ];
  }
}

/** Formula units (or atoms) per cell, counted from the shares: 1, 2, 4, 4, 1, 4. */
export const cellZ = (l: Lattice, species: 0 | 1 = 0) =>
  cellAtoms(l)
    .filter((a) => a.species === species)
    .reduce((s, a) => s + SHARE[a.site], 0);

/** Atoms touch along the edge, the face diagonal or the body diagonal. */
export type Touch = 'edge' | 'face' | 'body';
export const TOUCH: Record<Lattice, Touch> = {
  sc: 'edge',
  bcc: 'body',
  fcc: 'face',
  rocksalt: 'edge',
  cesiumChloride: 'body',
  zincBlende: 'body',
};

/**
 * The edge a from the radii: the touching line holds `radii` radii (sc 2r = a, bcc 4r = √3a,
 * fcc 4r = √2a; rock salt 2(r₊ + r₋) = a, CsCl 2(r₊ + r₋) = √3a, zinc blende 4(r₊ + r₋) = √3a).
 */
export function edgeFromRadius(l: Lattice, r: number, r2 = 0): number {
  switch (l) {
    case 'sc':
      return 2 * r;
    case 'bcc':
      return (4 * r) / Math.sqrt(3);
    case 'fcc':
      return 2 * Math.SQRT2 * r;
    case 'rocksalt':
      return 2 * (r + r2);
    case 'cesiumChloride':
      return (2 * (r + r2)) / Math.sqrt(3);
    case 'zincBlende':
      return (4 * (r + r2)) / Math.sqrt(3);
  }
}

/** The fraction of the cell the atoms fill: Z(4/3)πr³ ÷ a³ (both species for ions). */
export const packing = (l: Lattice, a: number, r: number, r2 = 0) =>
  ((4 / 3) * Math.PI * (cellZ(l, 0) * r ** 3 + cellZ(l, 1) * r2 ** 3)) / a ** 3;

/** d = a ÷ √(h² + k² + l²). */
export const spacing = (a: number, h: number, k: number, l: number) =>
  a / Math.sqrt(h * h + k * k + l * l);

/** The polygon where hx + ky + lz = m crosses the unit cell (cell units), in order round it. */
export function planePolygon(h: number, k: number, l: number, m = 1): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const n = [h, k, l];
  const f = (p: number[]) => n[0]! * p[0]! + n[1]! * p[1]! + n[2]! * p[2]! - m;
  // The cell's 12 edges: where the plane crosses each.
  for (const a of [0, 1])
    for (const b of [0, 1])
      for (let axis = 0; axis < 3; axis++) {
        const p0 = [0, 0, 0];
        const p1 = [0, 0, 0];
        const others = [0, 1, 2].filter((i) => i !== axis);
        p0[others[0]!] = p1[others[0]!] = a;
        p0[others[1]!] = p1[others[1]!] = b;
        p1[axis] = 1;
        const [f0, f1] = [f(p0), f(p1)];
        if (f0 === f1) continue;
        const t = f0 / (f0 - f1);
        if (t < -1e-9 || t > 1 + 1e-9) continue;
        const p: [number, number, number] = [0, 0, 0];
        for (let i = 0; i < 3; i++) p[i] = p0[i]! + t * (p1[i]! - p0[i]!);
        if (!pts.some((q) => q.every((v, i) => Math.abs(v - p[i]!) < 1e-9))) pts.push(p);
      }
  if (pts.length < 3) return [];
  // Order round the centre, in the plane's own frame.
  const c = [0, 1, 2].map((i) => pts.reduce((s, p) => s + p[i]!, 0) / pts.length);
  const len = Math.hypot(h, k, l);
  const nn = n.map((x) => x / len);
  const ref = Math.abs(nn[0]!) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const cross = (u: number[], v: number[]) => [
    u[1]! * v[2]! - u[2]! * v[1]!,
    u[2]! * v[0]! - u[0]! * v[2]!,
    u[0]! * v[1]! - u[1]! * v[0]!,
  ];
  const e1 = cross(nn, ref);
  const e2 = cross(nn, e1);
  const ang = (p: number[]) => {
    const d = [0, 1, 2].map((i) => p[i]! - c[i]!);
    return Math.atan2(
      d[0]! * e2[0]! + d[1]! * e2[1]! + d[2]! * e2[2]!,
      d[0]! * e1[0]! + d[1]! * e1[1]! + d[2]! * e1[2]!,
    );
  };
  return pts.sort((p, q) => ang(p) - ang(q));
}

/** The plane's intercepts on the axes in cell units: 1 ÷ h (none where the index is 0). */
export const intercepts = (h: number, k: number, l: number) =>
  [h, k, l].map((x) => (x === 0 ? undefined : 1 / x));

/** Bragg: the path difference 2d sin θ in wavelengths (whole when the waves are in phase). */
export const braggOrder = (d: number, thetaDeg: number, lambda: number) =>
  (2 * d * Math.sin((thetaDeg * Math.PI) / 180)) / lambda;

/** The coordination number a radius ratio r₊ ÷ r₋ predicts: 4, 6 or 8. */
export const coordinationOf = (ratio: number) => (ratio < 0.414 ? 4 : ratio < 0.732 ? 6 : 8);

/** a ÷ r for a metal picked by its atoms per cell: 2 (SC, 1), 4 ÷ √3 (BCC, 2), 2√2 (FCC, 4). */
export const edgePerRadius = (z: number) =>
  z === 1 ? 2 : z === 2 ? 4 / Math.sqrt(3) : z === 4 ? 2 * Math.SQRT2 : NaN;
