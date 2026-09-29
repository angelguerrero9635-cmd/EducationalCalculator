/**
 * Solving a triangle from three of its parts (TriangleSolver.tsx and its harness check): the
 * sides a, b, c opposite the angles A, B, C in degrees. SSS, SAS, ASA and AAS give one
 * triangle; SSA gives none, one or two. A set of parts that makes no triangle says why.
 */
import { formatNumber } from '@/engine/format';

import type { TriPart } from '@/data/modules/typesHsc';

export interface Tri {
  a: number;
  b: number;
  c: number;
  A: number;
  B: number;
  C: number;
}

export type Criterion = 'SSS' | 'SAS' | 'ASA' | 'AAS' | 'SSA' | 'HL';

export interface Solved {
  /** The triangles the three parts make: none, one, or two (SSA). */
  triangles: Tri[];
  /** The three parts the triangle was built from. */
  basis: TriPart[];
  criterion?: Criterion;
  /** Why no triangle fits (a sentence), when `triangles` is empty. */
  reason?: string;
}

const SIDES = ['a', 'b', 'c'] as const;
const ANGLES = ['A', 'B', 'C'] as const;
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const n = (x: number) => formatNumber(Number(x.toFixed(2)));

/** The triangle with sides s[i] opposite angles g[i] (i = 0, 1, 2 for A, B, C). */
const make = (s: number[], g: number[]): Tri => ({
  a: s[0]!,
  b: s[1]!,
  c: s[2]!,
  A: g[0]!,
  B: g[1]!,
  C: g[2]!,
});

/** The angle opposite side `x` from three sides (law of cosines), degrees. */
const cosAngle = (x: number, y: number, z: number) =>
  deg(Math.acos(Math.max(-1, Math.min(1, (y * y + z * z - x * x) / (2 * y * z)))));

/**
 * The triangle(s) from the known parts, built from three of them: `order` lists the parts to
 * try first (the given ones). A basis needs a side; three angles fix only the shape.
 */
export function solveTriangle(
  known: Partial<Record<TriPart, number>>,
  order: TriPart[] = [],
): Solved {
  const have = [...order, ...SIDES, ...ANGLES].filter(
    (p, i, all) => known[p] !== undefined && all.indexOf(p) === i,
  );
  // The first three known parts in order, swapping in a side when all three are angles.
  let basis = have.slice(0, 3);
  if (basis.length === 3 && basis.every((p) => p === p.toUpperCase())) {
    const side = have.find((p) => p === p.toLowerCase());
    if (side) basis = [basis[0]!, basis[1]!, side];
  }
  if (basis.length < 3) return { triangles: [], basis, reason: 'Three parts fix a triangle.' };
  const s = SIDES.map((p) => (basis.includes(p) ? known[p]! : undefined));
  const g = ANGLES.map((p) => (basis.includes(p) ? known[p]! : undefined));
  const S = [0, 1, 2].filter((i) => s[i] !== undefined);
  const G = [0, 1, 2].filter((i) => g[i] !== undefined);
  const name = (i: number, side: boolean) => (side ? SIDES[i]! : ANGLES[i]!);
  const none = (reason: string, criterion?: Criterion): Solved => ({
    triangles: [],
    basis,
    reason,
    ...(criterion ? { criterion } : {}),
  });
  if (s.some((x) => x !== undefined && !(x > 0))) return none('Every side must be longer than 0.');
  if (g.some((x) => x !== undefined && !(x > 0 && x < 180)))
    return none('Every angle must be between 0° and 180°.');

  if (S.length === 0) return none('Three angles fix the shape, not the size: give a side.');

  if (S.length === 3) {
    const [a, b, c] = s as number[];
    const order3 = [
      [a!, b!, c!, 'a', 'b', 'c'],
      [b!, c!, a!, 'b', 'c', 'a'],
      [a!, c!, b!, 'a', 'c', 'b'],
    ] as const;
    const longest = order3.find(([x, y, z]) => z >= x && z >= y) ?? order3[0];
    const [x, y, z, nx, ny, nz] = longest;
    if (x + y <= z + 1e-9)
      return none(
        `${nx} + ${ny} = ${n(x + y)} is not longer than ${nz} = ${n(z)}: the sides don't close.`,
        'SSS',
      );
    return {
      triangles: [close3(a!, b!, c!)],
      basis,
      criterion: 'SSS',
    };
  }

  if (S.length === 2) {
    const [i, j] = S as [number, number];
    const k = 3 - i - j;
    if (g[k] !== undefined) {
      // SAS: the angle between the two sides.
      const x = s[i]!;
      const y = s[j]!;
      const K = g[k]!;
      const z = Math.sqrt(x * x + y * y - 2 * x * y * Math.cos(rad(K)));
      const sides = [0, 0, 0];
      sides[i] = x;
      sides[j] = y;
      sides[k] = z;
      return { triangles: [close3(sides[0]!, sides[1]!, sides[2]!)], basis, criterion: 'SAS' };
    }
    // SSA: the angle opposite one of the sides.
    const at = G[0]!;
    const other = at === i ? j : i;
    const x = s[at]!; // opposite the known angle
    const y = s[other]!;
    const X = g[at]!;
    const sinY = (y * Math.sin(rad(X))) / x;
    const right = X === 90 ? 'HL' : 'SSA';
    if (sinY > 1 + 1e-9)
      return none(
        `${name(other, true)} × sin ${name(at, false)} = ${n(y * Math.sin(rad(X)))} is longer than ${name(at, true)} = ${n(x)}: ${name(at, true)} can't reach the third side.`,
        right,
      );
    const Y1 = deg(Math.asin(Math.min(1, sinY)));
    const candidates = [Y1, 180 - Y1].filter(
      (Y, idx, all) => X + Y < 180 - 1e-9 && (idx === 0 || Math.abs(Y - all[0]!) > 1e-6),
    );
    if (candidates.length === 0)
      return none(
        `${name(at, false)} = ${n(X)}° is not acute, so ${name(at, true)} must be the longest side: ${name(at, true)} = ${n(x)} is not longer than ${name(other, true)} = ${n(y)}.`,
        right,
      );
    const triangles = candidates.map((Y) => {
      const Z = 180 - X - Y;
      const z = (x * Math.sin(rad(Z))) / Math.sin(rad(X));
      const sides = [0, 0, 0];
      const angles = [0, 0, 0];
      sides[at] = x;
      sides[other] = y;
      sides[k] = z;
      angles[at] = X;
      angles[other] = Y;
      angles[k] = Z;
      return make(sides, angles);
    });
    return { triangles, basis, criterion: right };
  }

  // One side and two angles: ASA when the side lies between them, else AAS.
  const i = S[0]!;
  const [p, q] = G as [number, number];
  const third = 3 - p - q;
  const angles = [0, 0, 0];
  angles[p] = g[p]!;
  angles[q] = g[q]!;
  angles[third] = 180 - g[p]! - g[q]!;
  const criterion: Criterion = i === third ? 'ASA' : 'AAS';
  if (angles[third]! <= 1e-9)
    return none(
      `${name(p, false)} + ${name(q, false)} = ${n(g[p]! + g[q]!)}°: two angles of a triangle add to less than 180°.`,
      criterion,
    );
  const ratio = s[i]! / Math.sin(rad(angles[i]!));
  const sides = angles.map((A) => ratio * Math.sin(rad(A)));
  return { triangles: [make(sides, angles)], basis, criterion };
}

/** The triangle from three sides that close. */
function close3(a: number, b: number, c: number): Tri {
  const A = cosAngle(a, b, c);
  const B = cosAngle(b, c, a);
  return make([a, b, c], [A, B, 180 - A - B]);
}

/** A triangle's vertices: A at (0, 0), B at (c, 0), C above AB (y up). */
export function vertices(t: Tri): [[number, number], [number, number], [number, number]] {
  return [
    [0, 0],
    [t.c, 0],
    [t.b * Math.cos(rad(t.A)), t.b * Math.sin(rad(t.A))],
  ];
}

/**
 * How far the triangle is from satisfying the laws of sines and cosines and the angle sum
 * (0 when it is a true triangle), relative to its size.
 */
export function triangleError(t: Tri): number {
  const { a, b, c, A, B, C } = t;
  const k = a / Math.sin(rad(A));
  const scale = Math.max(a, b, c);
  return Math.max(
    Math.abs(A + B + C - 180) / 180,
    Math.abs(b / Math.sin(rad(B)) - k) / Math.max(1, k),
    Math.abs(c / Math.sin(rad(C)) - k) / Math.max(1, k),
    Math.abs(a * a - (b * b + c * c - 2 * b * c * Math.cos(rad(A)))) / (scale * scale),
    Math.abs(b * b - (a * a + c * c - 2 * a * c * Math.cos(rad(B)))) / (scale * scale),
    Math.abs(c * c - (a * a + b * b - 2 * a * b * Math.cos(rad(C)))) / (scale * scale),
  );
}

/** The part of a triangle, by name. */
export const partOf = (t: Tri, p: TriPart) => t[p];

/**
 * Exact text for a length that is a whole or short multiple of √2, √3 or √6 (5√2, 4√3, 2.5√3),
 * or of 1; undefined otherwise.
 */
export function radicalText(x: number): string | undefined {
  for (const r of [1, 2, 3, 6]) {
    const m = x / Math.sqrt(r);
    const m2 = Math.round(m * 100) / 100;
    if (Math.abs(m - m2) < 1e-6 * Math.max(1, m) && m2 > 0) {
      if (r === 1) return formatNumber(m2);
      return `${m2 === 1 ? '' : formatNumber(m2)}√${r}`;
    }
  }
  return undefined;
}
