/**
 * Round-2 gallery demos (range raises on existing picture kinds, see pictureRequests.ts). Spread
 * into GALLERY_MODULES in gallery.ts; kept apart so that file's other demos merge easily.
 */
import type { Values } from '@/engine/types';

import { times, whole } from './helpers';
import type { ModuleDef } from './types';

/** Factor pairs of a number to 200 (R21): past 100 the rectangles are thin bars to scale. */
function factorPairsDemo(id: string, example: { a: number; b: number; n: number }): ModuleDef {
  const pair = times('n = a × b', ['a', 'b', 'n'], ['first factor', 'second factor', 'number']);
  return {
    id,
    title: 'Factor pairs to 200',
    assumptions: [
      'A factor pair is two whole numbers that multiply to the number.',
      'Each pair makes one rectangle of unit squares, all drawn to the same scale.',
    ],
    variables: [
      whole('a', 'a', 'First factor', 1, 200),
      whole('b', 'b', 'Second factor', 1, 200),
      whole('n', 'n', 'Number', 1, 200),
    ],
    relations: [pair.relation],
    steps: { [pair.relation.id]: pair.steps },
    example,
    startWith: ['a', 'b'],
    representation: { kind: 'factorPairs', value: 'n', first: 'a', second: 'b' },
  };
}

/** A piece of the 1,000 chart (R21): a number and the squares above, below, before and after. */
function chartPieceDemo(id: string, n: number): ModuleDef {
  const near = (v: string, d: number) => ({
    id: `${v} = n ${d < 0 ? '−' : '+'} ${Math.abs(d)}`,
    display: `{n} ${d < 0 ? '−' : '+'} ${Math.abs(d)} = {${v}}`,
    vars: [v, 'n'],
    residual: (x: Values) => x[v]! - x.n! - d,
    solve: { [v]: (x: Values) => x.n! + d, n: (x: Values) => x[v]! - d },
  });
  return {
    id,
    title: 'A piece of the 1,000 chart',
    assumptions: ['Across a row, each number is 1 more.', 'Down a column, each number is 10 more.'],
    variables: [
      whole('n', 'n', 'Number', 11, 990),
      { ...whole('u', 'u', 'Above', 1, 980), derived: true },
      { ...whole('w', 'w', 'Below', 21, 1000), derived: true },
      { ...whole('l', 'l', 'Before', 10, 989), derived: true },
      { ...whole('r', 'r', 'After', 12, 991), derived: true },
    ],
    relations: [near('u', -10), near('w', 10), near('l', -1), near('r', 1)],
    steps: {
      'u = n − 10': {
        u: { expr: '{n} − 10', how: 'Above is 10 less.' },
        n: { expr: '{u} + 10', how: 'The number is 10 more than the one above.' },
      },
      'w = n + 10': {
        w: { expr: '{n} + 10', how: 'Below is 10 more.' },
        n: { expr: '{w} − 10', how: 'The number is 10 less than the one below.' },
      },
      'l = n − 1': {
        l: { expr: '{n} − 1', how: 'Before is 1 less.' },
        n: { expr: '{l} + 1', how: 'The number is 1 more than the one before.' },
      },
      'r = n + 1': {
        r: { expr: '{n} + 1', how: 'After is 1 more.' },
        n: { expr: '{r} − 1', how: 'The number is 1 less than the one after.' },
      },
    },
    example: { n, u: n - 10, w: n + 10, l: n - 1, r: n + 1 },
    startWith: ['n'],
    representation: {
      kind: 'hundredChart',
      value: 'n',
      max: 1000,
      marks: ['u', 'w', 'l', 'r'],
      piece: true,
    },
  };
}

/** Is it a multiple? on the 1,000 chart (R21): the hundred holding the number, multiples shaded. */
function multiplesDemo(id: string, k: number, n: number): ModuleDef {
  return {
    id,
    title: 'Multiples to 1,000',
    assumptions: [
      'A multiple of 5 is 5 times a whole number: 5, 10, 15, 20 and so on.',
      'To check, divide. A remainder of 0 means it is a multiple.',
      'The chart shows the hundred the number is in. It shades every multiple.',
    ],
    variables: [
      whole('k', 'k', 'One-digit number', 2, 9),
      whole('n', 'n', 'Number to test', 1, 1000),
      { ...whole('q', 'q', 'Quotient', 0, 500), derived: true },
      { ...whole('r', 'r', 'Remainder', 0, 8), derived: true },
    ],
    relations: [
      {
        id: 'q = whole groups of k in n',
        display: '{n} ÷ {k} → {q} whole groups',
        words: 'Number to test ÷ one-digit number = {q}, with a remainder',
        vars: ['q', 'n', 'k'],
        residual: (v: Values) => v.q! - Math.floor(v.n! / v.k!),
        solve: {
          q: (v: Values) => Math.floor(v.n! / v.k!),
          n: () => undefined,
          k: () => undefined,
        },
      },
      {
        id: 'r = left over when n is shared by k',
        display: 'left over when {n} is shared by {k} = {r}',
        words: 'What is left after the whole groups = {r}',
        vars: ['r', 'n', 'k'],
        residual: (v: Values) => v.r! - (v.n! % v.k!),
        solve: { r: (v: Values) => v.n! % v.k!, n: () => undefined, k: () => undefined },
      },
    ],
    steps: {
      'q = whole groups of k in n': {
        q: {
          expr: 'whole groups of {k} in {n}',
          how: 'Divide by the one-digit number. Use a times fact you know.',
          work: (v) => {
            const m = v.q! * v.k!;
            return [`${v.q} × ${v.k} = ${m}`, ...(m < v.n! ? [`${v.n} − ${m} = ${v.n! - m}`] : [])];
          },
        },
      },
      'r = left over when n is shared by k': {
        r: {
          expr: 'left over when {n} is shared by {k}',
          how: 'The remainder is what the whole groups leave.',
          work: (v) => [`${v.n} − ${Math.floor(v.n! / v.k!) * v.k!} = ${v.r}`],
          note: (v) =>
            v.r === 0
              ? `(remainder 0: ${v.n} is a multiple of ${v.k})`
              : `(remainder ${v.r}: ${v.n} is not a multiple of ${v.k})`,
        },
      },
    },
    example: { k, n, q: Math.floor(n / k), r: n % k },
    startWith: ['k', 'n'],
    representation: { kind: 'hundredChart', value: 'n', max: 1000, multiplesOf: 'k' },
  };
}

export const R2A_GALLERY_MODULES: ModuleDef[] = [
  factorPairsDemo('g.factor-pairs-126', { a: 9, b: 14, n: 126 }),
  factorPairsDemo('g.factor-pairs-200', { a: 8, b: 25, n: 200 }),
  chartPieceDemo('g.chart-piece-652', 652),
  chartPieceDemo('g.chart-piece-990', 990),
  multiplesDemo('g.multiples-652', 5, 652),
  multiplesDemo('g.multiples-1000', 8, 1000),
];
