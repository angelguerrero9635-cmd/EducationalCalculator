/**
 * A conic in polar form (H106): r = k ÷ (m − n cos θ) as a page types it, its eccentricity, its
 * directrix and the equation as written. Pure, for the picture and the harness.
 */
import type { PolarConicHs3b } from '@/data/modules/typesHs3b';

import { short } from './hsdKit';

export interface PolarConicParts {
  k: number;
  m: number;
  n: number;
  fn: 'cos' | 'sin';
  /** e = |n| ÷ m and d = k ÷ |n| (undefined when n is 0: a circle, no directrix). */
  e: number;
  d?: number;
  /** The directrix: x = at (cos) or y = at (sin). */
  at?: number;
  name: 'a circle' | 'an ellipse' | 'a parabola' | 'a hyperbola';
}

export function polarConicParts(c: PolarConicHs3b, v: Record<string, number>): PolarConicParts {
  const [k, m, n] = [v.k!, v.m ?? 1, v.n!];
  const fn = c.fn ?? 'cos';
  const e = Math.abs(n) / m;
  const d = n === 0 ? undefined : k / Math.abs(n);
  // r(m − n cos θ) = k is mr = k + n x: the directrix is x = −k ÷ n (x = −d when n > 0).
  const at = n === 0 ? undefined : -k / n;
  const name =
    n === 0
      ? 'a circle'
      : Math.abs(e - 1) < 1e-9
        ? 'a parabola'
        : e < 1
          ? 'an ellipse'
          : 'a hyperbola';
  return { k, m, n, fn, e, d, at, name };
}

/** "r = 6 ÷ (2 − cos θ)", "r = 4 ÷ (1 + sin θ)" */
export function polarConicText(
  p: { k: number; m: number; n: number; fn: 'cos' | 'sin' },
  // A number whose box is "?" reads as its letter: "r = 4 ÷ (m − n sin θ)".
  letters: { k?: string; m?: string; n?: string } = {},
) {
  const tail =
    letters.n !== undefined
      ? ` − ${letters.n} ${p.fn} θ`
      : p.n === 0
        ? ''
        : ` ${p.n > 0 ? '−' : '+'} ${Math.abs(p.n) === 1 ? '' : `${short(Math.abs(p.n))} `}${p.fn} θ`;
  return `r = ${letters.k ?? short(p.k)} ÷ (${letters.m ?? short(p.m)}${tail})`;
}
