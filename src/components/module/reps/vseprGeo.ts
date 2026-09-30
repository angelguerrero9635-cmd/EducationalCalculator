/**
 * VSEPR geometry for the `vsepr` pictures (H48): the shape and bond angle from the bonded atoms
 * and lone pairs on the central atom, an example molecule for each, and 3-D directions of the
 * bonds and lone pairs. No drawing, so the harness checks the same numbers.
 */
import { trendValue } from './chemTrends';
import { atomicNumber } from './chem';

export type Vec = [number, number, number];

export interface Shape {
  name: string;
  /** The electron-domain geometry. */
  domains: string;
  /** Bond angle, degrees. */
  angle: number;
  /** An example molecule: central atom, outer atom, bond order. */
  example: { central: string; outer: string; order: number; formula: string };
}

/** Shapes by [bonded atoms, lone pairs] on the central atom. Angles are measured values. */
export const SHAPES: Record<string, Shape> = {
  '2,0': {
    name: 'linear',
    domains: 'linear',
    angle: 180,
    example: { central: 'C', outer: 'O', order: 2, formula: 'CO2' },
  },
  '3,0': {
    name: 'trigonal planar',
    domains: 'trigonal planar',
    angle: 120,
    example: { central: 'B', outer: 'F', order: 1, formula: 'BF3' },
  },
  '2,1': {
    name: 'bent',
    domains: 'trigonal planar',
    angle: 119,
    example: { central: 'S', outer: 'O', order: 2, formula: 'SO2' },
  },
  '4,0': {
    name: 'tetrahedral',
    domains: 'tetrahedral',
    angle: 109.5,
    example: { central: 'C', outer: 'H', order: 1, formula: 'CH4' },
  },
  '3,1': {
    name: 'trigonal pyramidal',
    domains: 'tetrahedral',
    angle: 107,
    example: { central: 'N', outer: 'H', order: 1, formula: 'NH3' },
  },
  '2,2': {
    name: 'bent',
    domains: 'tetrahedral',
    angle: 104.5,
    example: { central: 'O', outer: 'H', order: 1, formula: 'H2O' },
  },
};

export const shapeOf = (bonded: number, lone: number): Shape | undefined =>
  SHAPES[`${Math.round(bonded)},${Math.round(lone)}`];

const RAD = Math.PI / 180;
const unit = (v: Vec): Vec => {
  const l = Math.hypot(...v) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec, b: Vec): Vec => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** Two bonds `angle` apart in the x-y plane, symmetric about the downward axis (y up). */
const pairDown = (angle: number): [Vec, Vec] => {
  const h = (angle / 2) * RAD;
  return [
    [-Math.sin(h), -Math.cos(h), 0],
    [Math.sin(h), -Math.cos(h), 0],
  ];
};

/**
 * Directions (y up, z toward the viewer) of the bonds and lone pairs, turned so the first two
 * bonds lie in the page (their angle is seen true) and the rest lean out of it.
 */
export function directions(bonded: number, lone: number): { bonds: Vec[]; lone: Vec[] } {
  const shape = shapeOf(bonded, lone);
  if (!shape) return { bonds: [], lone: [] };
  let bonds: Vec[] = [];
  let pairs: Vec[] = [];
  if (bonded === 2 && lone === 0)
    bonds = [
      [-1, 0, 0],
      [1, 0, 0],
    ];
  else if (bonded === 3 && lone === 0) {
    const [a, b] = pairDown(120);
    bonds = [a, b, [0, 1, 0]];
  } else if (bonded === 2 && lone === 1) {
    bonds = pairDown(shape.angle);
    pairs = [[0, 1, 0]];
  } else if (bonded === 2 && lone === 2) {
    bonds = pairDown(shape.angle);
    const b = 55 * RAD;
    pairs = [
      [0, Math.cos(b), Math.sin(b)],
      [0, Math.cos(b), -Math.sin(b)],
    ];
  } else if (bonded === 4) {
    const [a, b] = pairDown(109.47);
    const [s, c] = [Math.sin(54.735 * RAD), Math.cos(54.735 * RAD)];
    bonds = [a, b, [0, c, s], [0, c, -s]];
  } else {
    // Trigonal pyramid: three bonds φ from the downward axis, 120° apart around it, so that
    // any two are `angle` apart; the lone pair straight up. Then turned so two lie in the page.
    const cos2 = (Math.cos(shape.angle * RAD) + 0.5) / 1.5;
    const phi = Math.acos(Math.sqrt(cos2));
    const raw: Vec[] = [0, 120, 240].map((a) => [
      Math.sin(phi) * Math.cos(a * RAD),
      -Math.cos(phi),
      Math.sin(phi) * Math.sin(a * RAD),
    ]);
    const ey = unit(add(raw[0]!, raw[1]!)).map((x) => -x) as Vec;
    const ex = unit(sub(raw[1]!, raw[0]!));
    const ez = cross(ex, ey);
    const turn = (v: Vec): Vec => [dot(v, ex), dot(v, ey), dot(v, ez)];
    bonds = raw.map(turn);
    pairs = [turn([0, 1, 0])];
    // The third bond leans toward the viewer.
    if (bonds[2]![2] < 0) {
      bonds = bonds.map((v) => [v[0], v[1], -v[2]]);
      pairs = pairs.map((v) => [v[0], v[1], -v[2]]);
    }
  }
  return { bonds, lone: pairs };
}

/** Tilts every direction about the x-axis by `deg` (so atoms straight behind others show). */
export const tilt = (v: Vec, deg: number): Vec => {
  const [c, s] = [Math.cos(deg * RAD), Math.sin(deg * RAD)];
  return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c];
};

/** Pauling electronegativity of an element (hydrogen 2.2). */
export const electronegativity = (el: string) =>
  trendValue('electronegativity', atomicNumber(el) ?? 0) ?? 0;

/**
 * The net dipole: the sum of the bond dipoles, each pointing from the central atom toward the
 * outer atom by (EN outer − EN central). Zero (to 1e-9) for a symmetric shape.
 */
export function netDipole(bonded: number, lone: number, central: string, outer: string): Vec {
  const d = electronegativity(outer) - electronegativity(central);
  return directions(bonded, lone).bonds.reduce<Vec>(
    (sum, b) => add(sum, [b[0] * d, b[1] * d, b[2] * d]),
    [0, 0, 0],
  );
}

export const isPolar = (bonded: number, lone: number, central: string, outer: string) =>
  Math.hypot(...netDipole(bonded, lone, central, outer)) > 1e-6;

/** Hydrogen bonds among n water molecules: one central molecule and up to four neighbors. */
export const hydrogenBonds = (n: number) => Math.max(0, Math.min(5, Math.round(n)) - 1);
