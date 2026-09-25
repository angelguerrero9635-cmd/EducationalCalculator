/**
 * Grade 4 math (CCSS 4.OA, 4.NBT, 4.NF, 4.MD, 4.G). Letters appear only as labels next to a
 * name the student can see; the step explanations say names, not letters. Numbers reach
 * 1,000,000, fractions get unlike denominators and decimals appear (tenths, hundredths).
 */
import type { Values } from '@/engine/types';

import { formatNumber } from '@/engine/format';

import { div, whole } from './math-k2';
import type { ModuleDef } from './types';
import { divideWork, timesWork } from './work';

/** The factors of n in order: 24 → [1, 2, 3, 4, 6, 8, 12, 24]. */
const factorsOf = (n: number): number[] =>
  n < 1 ? [] : Array.from({ length: n }, (_, i) => i + 1).filter((k) => n % k === 0);

/** Factor pairs up to the square root: 24 → "1 × 24, 2 × 12, 3 × 8, 4 × 6". */
const factorPairs = (n: number): string =>
  factorsOf(n)
    .filter((k) => k * k <= n)
    .map((k) => `${k} × ${n / k}`)
    .join(', ');

export const MATH_4_MODULES: ModuleDef[] = [
  // ── Factors, multiples, primes and composites (4.OA.4) ──
  {
    id: 'm.4.factors-multiples',
    assumptions: [
      'A factor pair is two whole numbers that multiply to make the number.',
      'Find every pair by trying 1, 2, 3, … until the factors would swap places.',
      'A prime number has exactly 2 factors: 1 and itself. A composite number has more.',
      'The picture shows one factor pair as an array: rows × columns.',
    ],
    variables: [
      whole('n', 'n', 'Number', 1, 100),
      whole('a', 'a', 'One factor', 1, 12),
      whole('b', 'b', 'Its partner', 1, 12),
      { ...whole('f', 'f', 'Number of factors', 1, 12), derived: true },
    ],
    relations: [
      {
        id: 'n = a × b',
        display: '{a} × {b} = {n}',
        vars: ['n', 'a', 'b'],
        residual: (v: Values) => v.n! - v.a! * v.b!,
        solve: {
          n: (v: Values) => v.a! * v.b!,
          a: (v: Values) => div(v.n!, v.b!),
          b: (v: Values) => div(v.n!, v.a!),
        },
      },
      {
        id: 'f = factors of n',
        display: '{n} has {f} factors',
        vars: ['f', 'n'],
        residual: (v: Values) => v.f! - factorsOf(v.n!).length,
        // Many numbers share a factor count, so the number can't be found from it.
        solve: { f: (v: Values) => factorsOf(v.n!).length, n: () => undefined },
      },
    ],
    steps: {
      'n = a × b': {
        n: {
          expr: '{a} × {b}',
          how: 'Multiply the factor pair to get the number.',
          work: (v) => timesWork(v.a!, v.b!),
        },
        a: {
          expr: '{n} ÷ {b}',
          how: 'Divide the number by the partner factor.',
          work: (v) => divideWork(v.n!, v.b!),
        },
        b: {
          expr: '{n} ÷ {a}',
          how: 'Divide the number by the one factor you know.',
          work: (v) => divideWork(v.n!, v.a!, 'second'),
        },
      },
      'f = factors of n': {
        f: {
          expr: 'factors of {n}',
          how: 'List every factor pair from 1 up. Count the factors once each.',
          work: (v) => [
            `Factor pairs of ${v.n}: ${factorPairs(v.n!)}`,
            `Factors: ${factorsOf(v.n!).join(', ')} → ${v.f}`,
          ],
          note: (v) =>
            v.n === 1
              ? '(1 is neither prime nor composite)'
              : v.f === 2
                ? `(${v.n} is prime: only 1 and itself)`
                : `(${v.n} is composite: more than 2 factors)`,
        },
      },
    },
    example: { n: 24, a: 4, b: 6, f: 8 },
    startWith: ['a', 'b'],
    representation: { kind: 'array', rows: 'a', columns: 'b', total: 'n', max: 12 },
  },

  // ── Place value to 1,000,000: a digit's value and the place to its right (4.NBT.1) ──
  (() => {
    const fmt = (x: number) => formatNumber(x);
    const PLACES = [10, 100, 1000, 10000, 100000];
    const PLACE_NAMES: Record<number, string> = {
      10: 'tens',
      100: 'hundreds',
      1000: 'thousands',
      10000: 'ten thousands',
      100000: 'hundred thousands',
    };
    return {
      id: 'm.4.place-value-million',
      assumptions: [
        'A digit’s value is the digit times its place: 7 in the thousands place is 7,000.',
        'Each place is 10 times the place to its right. Moving a digit one place right divides its value by 10.',
        'Places up to hundred thousands: numbers to 999,999.',
        'Tap a row of the table to move the digit to that place.',
      ],
      variables: [
        whole('d', 'd', 'Digit', 1, 9),
        { ...whole('p', 'p', 'Its place', 10, 100000), allowed: PLACES },
        whole('v', 'v', 'Value of the digit', 10, 900000),
        whole('r', 'r', 'Same digit one place right', 1, 90000),
      ],
      relations: [
        {
          id: 'v = d × p',
          display: '{d} × {p} = {v}',
          vars: ['v', 'd', 'p'],
          residual: (v: Values) => v.v! - v.d! * v.p!,
          solve: {
            v: (v: Values) => v.d! * v.p!,
            d: (v: Values) => div(v.v!, v.p!),
            p: (v: Values) => div(v.v!, v.d!),
          },
        },
        {
          id: 'r = v ÷ 10',
          display: '{v} ÷ 10 = {r}',
          vars: ['r', 'v'],
          residual: (v: Values) => v.r! - v.v! / 10,
          solve: { r: (v: Values) => v.v! / 10, v: (v: Values) => v.r! * 10 },
        },
      ],
      steps: {
        'v = d × p': {
          v: {
            expr: '{d} × {p}',
            how: (v) =>
              `The digit is in the ${PLACE_NAMES[v.p!] ?? 'ones'} place. Multiply it by that place.`,
            work: (v) => [`${v.d} × ${fmt(v.p!)} = ${fmt(v.d! * v.p!)}`],
          },
          d: {
            expr: '{v} ÷ {p}',
            how: 'Divide the value by its place to get the digit.',
            work: (v) => [`${fmt(v.v!)} ÷ ${fmt(v.p!)} = ${v.v! / v.p!}`],
          },
          p: {
            expr: '{v} ÷ {d}',
            how: 'Divide the value by the digit to get its place.',
            work: (v) => [`${fmt(v.v!)} ÷ ${v.d} = ${fmt(v.v! / v.d!)}`],
          },
        },
        'r = v ÷ 10': {
          r: {
            expr: '{v} ÷ 10',
            how: 'One place to the right is worth ten times less: divide the value by 10.',
            work: (v) => [`${fmt(v.v!)} ÷ 10 = ${fmt(v.v! / 10)}`],
          },
          v: {
            expr: '{r} × 10',
            how: 'One place to the left is worth ten times more: multiply by 10.',
            work: (v) => [`${fmt(v.r!)} × 10 = ${fmt(v.r! * 10)}`],
          },
        },
      },
      example: { d: 7, p: 1000, v: 7000, r: 700 },
      startWith: ['d', 'p'],
      representation: { kind: 'table', sweep: 'p', output: 'v', params: ['d'], rows: PLACES },
    } satisfies ModuleDef;
  })(),
];
