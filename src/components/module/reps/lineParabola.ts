/**
 * H106 (round 3, group B): the math of `lineSystem` with a parabola, y = ax² + mx + b beside a
 * line (or a second parabola): where they cross, which side of each a point is on, and the
 * equations as written. Pure, so the picture and the harness agree.
 */
import type { InequalitySign } from '@/data/modules/typesGraphs';
import { formatNumber } from '@/engine/format';

import { toFraction } from './exact';

/** A number as an equation writes it: 2/3 as a fraction, others as decimals (graphKit's `coef`). */
export function coef(x: number): string {
  const f = toFraction(x, 12);
  const cents = Math.abs(x * 100 - Math.round(x * 100)) < 1e-9;
  if (f && f[1] !== 1 && !(Math.abs(f[0]) > 12 && cents))
    return `${f[0] < 0 ? '−' : ''}${Math.abs(f[0])}/${f[1]}`;
  return formatNumber(x);
}

/** y = a·x² + m·x + b (a = 0: a line). */
export interface Quad {
  a: number;
  m: number;
  b: number;
}

export const quadAt = (q: Quad, x: number) => q.a * x * x + q.m * x + q.b;

/** Where two curves cross, left to right: 0, 1 or 2 points (all of them when they are one). */
export function quadCrossings(p: Quad, q: Quad): { x: number; y: number }[] | 'same' {
  const [A, B, C] = [p.a - q.a, p.m - q.m, p.b - q.b];
  const tiny = (v: number) => Math.abs(v) < 1e-12;
  if (tiny(A) && tiny(B)) return tiny(C) ? 'same' : [];
  let xs: number[];
  if (tiny(A)) xs = [-C / B];
  else {
    const D = B * B - 4 * A * C;
    const scale = 1e-12 * Math.max(1, B * B, Math.abs(4 * A * C));
    if (D < -scale) xs = [];
    else if (Math.abs(D) <= scale) xs = [-B / (2 * A)];
    else {
      const r = Math.sqrt(D);
      xs = [(-B - r) / (2 * A), (-B + r) / (2 * A)].sort((u, v) => u - v);
    }
  }
  return xs.map((x) => ({ x, y: quadAt(p, x) }));
}

/** Whether (x, y) is on the shaded side of y (sign) q(x) (a point on a solid curve counts). */
export function quadHolds(q: Quad, sign: InequalitySign, x: number, y: number) {
  const d = y - quadAt(q, x);
  const eps = 1e-9 * Math.max(1, Math.abs(y));
  return sign === '>' ? d > eps : sign === '≥' ? d >= -eps : sign === '<' ? d < -eps : d <= eps;
}

/** "y = x² − 2x − 3", "y = −(1/2)x² + 4", "y = ?x² + 2x + 1": the equation as written. */
export function quadEquation(
  q: Quad,
  known: { a: boolean; m: boolean; b: boolean },
  x = 'x',
  y = 'y',
): string {
  const lead = (v: number, ok: boolean, first: boolean, power: string) => {
    if (!ok) return `${first ? '' : ' + '}?${power}`;
    if (v === 0) return '';
    const t = coef(Math.abs(v));
    const body = `${Math.abs(v) === 1 && power ? '' : t.includes('/') && power ? `(${t})` : t}${power}`;
    return first ? `${v < 0 ? '−' : ''}${body}` : ` ${v < 0 ? '−' : '+'} ${body}`;
  };
  let out = '';
  for (const [v, ok, power] of [
    [q.a, known.a, `${x}²`],
    [q.m, known.m, x],
    [q.b, known.b, ''],
  ] as const) {
    const part = lead(v, ok, out === '', power);
    out += part;
  }
  return `${y} = ${out || '0'}`;
}
