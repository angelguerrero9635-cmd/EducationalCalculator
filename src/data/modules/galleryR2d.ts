/**
 * Round-2 gallery demos (range raises on existing picture kinds, see pictureRequests.ts). Spread
 * into GALLERY_MODULES in gallery.ts; kept apart so that file's other demos merge easily.
 */
import type { Values } from '@/engine/types';

import { div, whole } from './helpers';
import type { ModuleDef } from './types';

/** R26: fraction × fraction past one whole, a block of unit squares (fractionArea `wholes`). */
const fractionsPastOne = (
  id: string,
  title: string,
  example: { a: number; b: number; c: number; d: number },
): ModuleDef => ({
  id,
  title,
  sliders: false,
  assumptions: [
    'Multiply the numerators and multiply the denominators.',
    'A fraction past one whole takes more than one unit square. Each square is cut the same way.',
  ],
  variables: [
    whole('a', 'a', 'First numerator', 1, 12),
    whole('b', 'b', 'First denominator', 2, 12),
    whole('c', 'c', 'Second numerator', 1, 12),
    whole('d', 'd', 'Second denominator', 2, 12),
    { ...whole('p', 'p', 'Product numerator', 1, 144), derived: true },
    { ...whole('q', 'q', 'Product denominator', 4, 144), derived: true },
  ],
  relations: [
    ...(
      [
        ['a', 'b'],
        ['c', 'd'],
      ] as const
    ).map(([top, bottom]) => ({
      id: `${top} ≤ 6 × ${bottom}`,
      constraint: true,
      display: `{${top}}/{${bottom}} is at most 6`,
      vars: [top, bottom],
      residual: (v: Values) => (v[top]! <= 6 * v[bottom]! ? 0 : 1),
      solve: {},
    })),
    {
      id: 'p = a × c',
      display: '{a} × {c} = {p}',
      vars: ['p', 'a', 'c'],
      residual: (v: Values) => v.p! - v.a! * v.c!,
      solve: {
        p: (v: Values) => v.a! * v.c!,
        a: (v: Values) => div(v.p!, v.c!),
        c: (v: Values) => div(v.p!, v.a!),
      },
    },
    {
      id: 'q = b × d',
      display: '{b} × {d} = {q}',
      vars: ['q', 'b', 'd'],
      residual: (v: Values) => v.q! - v.b! * v.d!,
      solve: {
        q: (v: Values) => v.b! * v.d!,
        b: (v: Values) => div(v.q!, v.d!),
        d: (v: Values) => div(v.q!, v.b!),
      },
    },
  ],
  steps: {
    'a ≤ 6 × b': {},
    'c ≤ 6 × d': {},
    'p = a × c': {
      p: { expr: '{a} × {c}', how: 'Multiply the numerators: the shaded pieces.' },
      a: { expr: '{p} ÷ {c}', how: 'Divide the product numerator by the second numerator.' },
      c: { expr: '{p} ÷ {a}', how: 'Divide the product numerator by the first numerator.' },
    },
    'q = b × d': {
      q: { expr: '{b} × {d}', how: 'Multiply the denominators: the pieces in one whole square.' },
      b: { expr: '{q} ÷ {d}', how: 'Divide the product denominator by the second denominator.' },
      d: { expr: '{q} ÷ {b}', how: 'Divide the product denominator by the first denominator.' },
    },
  },
  example: { ...example, p: example.a * example.c, q: example.b * example.d },
  startWith: ['a', 'b', 'c', 'd'],
  representation: {
    kind: 'fractionArea',
    first: { num: 'a', den: 'b' },
    second: { num: 'c', den: 'd' },
    product: { num: 'p', den: 'q' },
    wholes: 6,
  },
});

export const R2D_GALLERY_MODULES: ModuleDef[] = [
  fractionsPastOne('g.fraction-area-wholes', 'Fraction area past one whole', {
    a: 5,
    b: 7,
    c: 10,
    d: 3,
  }),
  fractionsPastOne('g.fraction-area-mixed', 'Fraction area, both past one', {
    a: 5,
    b: 2,
    c: 4,
    d: 3,
  }),
  fractionsPastOne('g.fraction-area-edge', 'Fraction area, six wholes across', {
    a: 11,
    b: 2,
    c: 12,
    d: 5,
  }),
];
