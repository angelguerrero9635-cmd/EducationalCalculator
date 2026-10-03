/**
 * Geometry for `vsepr` with 5–6 domains and `complex` (HC72): every shape from 2 to 6 electron
 * domains with its hybrid and example molecule; 3-D directions with lone pairs equatorial in
 * 5 domains and trans in 6; a complex's ligand places for cis, trans, fac and mer. No drawing,
 * so the harness checks the same numbers.
 */
import { SHAPES, directions as smallDirections, type Vec } from './vseprGeo';

export interface ExpandedShape {
  name: string;
  domains: string;
  hybrid: string;
  /** The smallest ideal angle between two electron domains (θ from d). */
  domainAngle: number;
  /** The angle marked: between the first two bonds, ideal (or measured for 2–4 domains). */
  bondAngle: number;
  example: { central: string; outer: string; formula: string };
}

const HYBRID = ['', '', 'sp', 'sp²', 'sp³', 'sp³d', 'sp³d²'];
const DOMAIN_ANGLE = [0, 0, 180, 120, 109.5, 90, 90];
/** θ from d: the smallest ideal angle between d (2–6) electron domains. */
export const domainAngleOf = (d: number) => DOMAIN_ANGLE[Math.round(d)] || NaN;
const DOMAIN_NAME = [
  '',
  '',
  'linear',
  'trigonal planar',
  'tetrahedral',
  'trigonal bipyramidal',
  'octahedral',
];

const BIG: Record<string, { name: string; angle: number; example: [string, string, string] }> = {
  '5,0': { name: 'trigonal bipyramidal', angle: 90, example: ['P', 'Cl', 'PCl₅'] },
  '4,1': { name: 'seesaw', angle: 90, example: ['S', 'F', 'SF₄'] },
  '3,2': { name: 'T-shaped', angle: 90, example: ['Cl', 'F', 'ClF₃'] },
  '2,3': { name: 'linear', angle: 180, example: ['Xe', 'F', 'XeF₂'] },
  '6,0': { name: 'octahedral', angle: 90, example: ['S', 'F', 'SF₆'] },
  '5,1': { name: 'square pyramidal', angle: 90, example: ['Br', 'F', 'BrF₅'] },
  '4,2': { name: 'square planar', angle: 90, example: ['Xe', 'F', 'XeF₄'] },
};

const sub = (s: string) => s.replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]!);

/** The shape of `bonded` atoms (1–6) and `lone` pairs (0–3) on a central atom, 2–6 domains. */
export function expandedShape(bonded: number, lone: number): ExpandedShape | undefined {
  const b = Math.round(bonded);
  const l = Math.round(lone);
  const d = b + l;
  if (b < 2 || l < 0 || d > 6) return undefined;
  const key = `${b},${l}`;
  const big = BIG[key];
  if (big)
    return {
      name: big.name,
      domains: DOMAIN_NAME[d]!,
      hybrid: HYBRID[d]!,
      domainAngle: DOMAIN_ANGLE[d]!,
      bondAngle: big.angle,
      example: { central: big.example[0], outer: big.example[1], formula: big.example[2] },
    };
  const s = SHAPES[key];
  if (!s) return undefined;
  return {
    name: s.name,
    domains: DOMAIN_NAME[d]!,
    hybrid: HYBRID[d]!,
    domainAngle: DOMAIN_ANGLE[d]!,
    bondAngle: s.angle,
    example: {
      central: s.example.central,
      outer: s.example.outer,
      formula: sub(s.example.formula),
    },
  };
}

const RAD = Math.PI / 180;
/** Equatorial direction at `deg` around the upright axis (y up, z toward the viewer). */
const eq = (deg: number): Vec => [Math.cos(deg * RAD), 0, Math.sin(deg * RAD)];
const UP: Vec = [0, 1, 0];
const DOWN: Vec = [0, -1, 0];

/**
 * Bond and lone-pair directions. Five domains: lone pairs take equatorial places first (they
 * have the room: two neighbors at 90° instead of three). Six: a second lone pair goes trans to
 * the first. Two to four domains keep the Grades 9–12 directions.
 */
export function expandedDirections(bonded: number, lone: number): { bonds: Vec[]; lone: Vec[] } {
  const b = Math.round(bonded);
  const l = Math.round(lone);
  const d = b + l;
  if (d === 5) {
    // The first lone pair to the left in the page, the bonds' equatorial pair front and back.
    const eqs = [eq(180), eq(-60), eq(60)];
    const lonePlaces = eqs.slice(0, l);
    const bonds = [UP, DOWN, ...eqs.slice(l)];
    // A T or a line keeps its bonds in the page: the lone pairs lean back.
    return { bonds, lone: lonePlaces };
  }
  if (d === 6) {
    const axes: Vec[] = [UP, DOWN, [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]];
    // Lone pairs trans: the first at the bottom, the second at the top.
    const lone = l === 0 ? [] : l === 1 ? [DOWN] : [DOWN, UP];
    const bonds = axes.filter((v) => !lone.includes(v)).slice(0, b);
    // A square pyramid or plane: start with the two bonds in the page that are 90° apart.
    return { bonds: l > 0 ? [bonds[0]!, ...bonds.slice(1)] : bonds, lone };
  }
  return smallDirections(b, l);
}

/** The angle (degrees) between two directions. */
export const angleBetween = (a: Vec, b: Vec) =>
  Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))) / RAD;

/** The two bonds whose angle is marked: the smallest angle, the pair nearest the page. */
export function markedPair(bonds: Vec[]): [number, number] {
  let best: [number, number] = [0, 1];
  let key = Infinity;
  for (let i = 0; i < bonds.length; i++)
    for (let j = i + 1; j < bonds.length; j++) {
      const k =
        Math.round(angleBetween(bonds[i]!, bonds[j]!) * 10) * 10 +
        Math.abs(bonds[i]![2]) +
        Math.abs(bonds[j]![2]);
      if (k < key - 1e-9) {
        key = k;
        best = [i, j];
      }
    }
  return best;
}

/**
 * A direction for a straight (180°) arc to bend through: square to the pair and clear of
 * every place drawn.
 */
export function freeBend(a: Vec, places: Vec[]): Vec {
  const r = Math.SQRT1_2;
  const tries: Vec[] = [
    [0, 1, 0],
    [r, r, 0],
    [-r, r, 0],
    [r, 0, r],
    [0, r, r],
    [1, 0, 0],
  ];
  const dot = (p: Vec, q: Vec) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
  return (
    tries.find((t) => Math.abs(dot(t, a)) < 1e-6 && places.every((p) => angleBetween(p, t) > 20)) ??
    tries.find((t) => Math.abs(dot(t, a)) < 1e-6) ?? [0, 0, 1]
  );
}

// ─── Complexes ───────────────────────────────────────────────────────────────

export type ComplexGeometry = 'octahedral' | 'squarePlanar' | 'tetrahedral';
export type ComplexIsomer = 'cis' | 'trans' | 'fac' | 'mer';

/** The ligand places of a geometry, y up, z toward the viewer. */
export function complexPlaces(g: ComplexGeometry): Vec[] {
  if (g === 'octahedral') return [UP, [1, 0, 0], [0, 0, 1], [-1, 0, 0], [0, 0, -1], DOWN];
  if (g === 'squarePlanar')
    return [
      [1, 0, 0],
      [0, 0, 1],
      [-1, 0, 0],
      [0, 0, -1],
    ];
  const s = 1 / Math.sqrt(3);
  return [
    [s, s, s],
    [-s, -s, s],
    [-s, s, -s],
    [s, -s, -s],
  ];
}

/**
 * Which places the minority ligand takes: cis neighbors at 90°, trans opposite; fac three on
 * one face, mer three in a plane through the metal (two trans). Without an isomer, the places
 * in order (a single different ligand at the top).
 */
export function isomerPlaces(
  g: ComplexGeometry,
  minority: number,
  isomer?: ComplexIsomer,
): number[] {
  if (g === 'octahedral') {
    if (isomer === 'cis' && minority === 2) return [0, 1];
    if (isomer === 'trans' && minority === 2) return [0, 5];
    if (isomer === 'fac' && minority === 3) return [0, 1, 2];
    if (isomer === 'mer' && minority === 3) return [0, 1, 5];
  }
  if (g === 'squarePlanar') {
    if (isomer === 'cis' && minority === 2) return [0, 1];
    if (isomer === 'trans' && minority === 2) return [0, 2];
  }
  return Array.from({ length: minority }, (_, i) => i);
}

/** Whether an isomer name fits a geometry and a count of the minority ligand. */
export function isomerFits(g: ComplexGeometry, minority: number, isomer: ComplexIsomer): boolean {
  if (isomer === 'cis' || isomer === 'trans') return g !== 'tetrahedral' && minority === 2;
  return g === 'octahedral' && minority === 3;
}
