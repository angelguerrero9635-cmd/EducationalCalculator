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

/** R27: n × 10^k past the millions, the chart grouped in periods (placeValueChart `periods`). */
const powersToBillions = (
  id: string,
  title: string,
  example: { n: number; k: number },
): ModuleDef => ({
  id,
  title,
  assumptions: [
    'The exponent counts how many tens are multiplied: 10⁹ = 1,000,000,000.',
    'Multiplying by 10 moves every digit one place to the left.',
    'Past the millions, the places are grouped in threes: ones, thousands, millions, billions.',
  ],
  variables: [
    whole('n', 'n', 'Number', 1, 999),
    whole('k', 'k', 'Exponent', 0, 9),
    // No `allowed` list to 10⁹: the sampling test lists every whole number between its ends.
    // 10^k = e keeps e a power of 10.
    whole('e', 'e', 'Power of 10', 1, 1e9),
    whole('p', 'p', 'Product', 1, 999e9),
  ],
  relations: [
    {
      id: 'e = 10^k',
      display: '10^{k} = {e}',
      vars: ['e', 'k'],
      residual: (v: Values) => v.e! - 10 ** v.k!,
      solve: {
        e: (v: Values) => 10 ** v.k!,
        k: (v: Values) => {
          const k = Math.round(Math.log10(v.e!));
          return 10 ** k === v.e ? k : undefined;
        },
      },
    },
    {
      id: 'p = n × e',
      display: '{n} × {e} = {p}',
      vars: ['p', 'n', 'e'],
      residual: (v: Values) => v.p! - v.n! * v.e!,
      solve: {
        p: (v: Values) => v.n! * v.e!,
        n: (v: Values) => div(v.p!, v.e!),
        e: (v: Values) => div(v.p!, v.n!),
      },
    },
  ],
  steps: {
    'e = 10^k': {
      e: { expr: '10^{k}', how: 'Multiply that many tens together.' },
      k: { expr: 'zeros in {e}', how: 'Count the zeros after the 1.' },
    },
    'p = n × e': {
      p: { expr: '{n} × {e}', how: 'Write the zeros after the number.', written: false },
      n: { expr: '{p} ÷ {e}', how: 'Take the zeros off the end.', written: false },
      e: { expr: '{p} ÷ {n}', how: 'Divide the product by the number.', written: false },
    },
  },
  example: { ...example, e: 10 ** example.k, p: example.n * 10 ** example.k },
  startWith: ['n', 'k'],
  representation: { kind: 'placeValueChart', value: 'p', decimals: 0, from: 'n', periods: true },
});

/** R28: n ÷ d as jumps of d, grouped by tens and hundreds past 30 (skipCount `group`). */
const groupedJumps = (id: string, title: string, example: { n: number; d: number }): ModuleDef => ({
  id,
  title,
  assumptions: [
    'Dividing by a decimal asks how many of it fit.',
    'Past 30 jumps, ten jumps are drawn as one arc, and past 300 a hundred jumps are.',
    'Divisors from 0.01 to 0.99, quotients to 999.',
  ],
  variables: [
    { id: 'n', symbol: 'n', name: 'Dividend', min: 0.01, max: 999, step: 0.01, multipleOf: 0.01 },
    { id: 'd', symbol: 'd', name: 'Divisor', min: 0.01, max: 0.99, step: 0.01, multipleOf: 0.01 },
    whole('q', 'q', 'Quotient', 1, 999),
  ],
  relations: [
    {
      id: 'n = q × d',
      display: '{n} ÷ {d} = {q}',
      vars: ['n', 'q', 'd'],
      residual: (v: Values) => v.n! - v.q! * v.d!,
      solve: {
        n: (v: Values) => Number((v.q! * v.d!).toFixed(9)),
        q: (v: Values) => (v.d ? Number((v.n! / v.d).toFixed(9)) : undefined),
        d: (v: Values) => (v.q ? Number((v.n! / v.q).toFixed(9)) : undefined),
      },
    },
  ],
  steps: {
    'n = q × d': {
      q: { expr: '{n} ÷ {d}', how: 'How many jumps of the divisor fit in the dividend?' },
      n: { expr: '{q} × {d}', how: 'That many of the divisor.' },
      d: { expr: '{n} ÷ {q}', how: 'Share the dividend into that many equal parts.' },
    },
  },
  example: { ...example, q: Math.round(example.n / example.d) },
  startWith: ['n', 'd'],
  representation: { kind: 'skipCount', step: 'd', count: 'q', total: 'n', group: true },
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
  powersToBillions('g.place-value-periods', 'Powers of ten, as the page starts', { n: 34, k: 3 }),
  powersToBillions('g.place-value-billions', 'Powers of ten to billions', { n: 1, k: 9 }),
  powersToBillions('g.place-value-edge', 'Hundreds of billions', { n: 999, k: 9 }),
  groupedJumps('g.jumps-grouped-page', 'Decimal jumps, as the page starts', { n: 1.2, d: 0.3 }),
  groupedJumps('g.jumps-grouped-tens', 'Decimal jumps in tens', { n: 21, d: 0.2 }),
  groupedJumps('g.jumps-grouped-hundreds', 'Decimal jumps in hundreds', { n: 199.8, d: 0.2 }),
];
