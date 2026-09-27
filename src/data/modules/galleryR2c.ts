/**
 * Round-2 gallery demos (range raises on existing picture kinds, see pictureRequests.ts). Spread
 * into GALLERY_MODULES in gallery.ts; kept apart so that file's other demos merge easily.
 */
import { formatNumber } from '@/engine/format';
import type { Values } from '@/engine/types';

import { whole } from './helpers';
import type { ModuleDef } from './types';
import { decimalLongDivision } from './written';

/** Ones and hundredths on hundredths grids, ones to 99 (m.4.decimals-intro, R23). */
const onesAndHundredths = (id: string, title: string, o: number, h: number): ModuleDef => ({
  id,
  title,
  assumptions: [
    'The grid has 100 squares, so each square is a hundredth.',
    'A number past 1 has ones before the point: 45.06 is 45 ones and 6 hundredths.',
  ],
  variables: [
    whole('h', 'h', 'Hundredths past the ones', 0, 99),
    whole('o', 'o', 'Ones', 0, 99),
    { id: 'd', symbol: 'd', name: 'As a decimal', min: 0, max: 99.99, step: 0.01 },
  ],
  relations: [
    {
      id: 'd = o + h ÷ 100',
      display: '{o} + {h}/100 = {d}',
      words: 'Ones + hundredths past the ones ÷ 100 = {d}',
      vars: ['d', 'o', 'h'],
      residual: (v: Values) => v.d! - v.o! - v.h! / 100,
      solve: {
        d: (v: Values) => Number((v.o! + v.h! / 100).toFixed(2)),
        h: (v: Values) => Math.round((v.d! - v.o!) * 100),
        o: (v: Values) => Number((v.d! - v.h! / 100).toFixed(2)),
      },
    },
  ],
  steps: {
    'd = o + h ÷ 100': {
      d: {
        expr: '{o} + {h} ÷ 100',
        how: 'The ones go before the point. The tenths digit, then the hundredths digit, after it.',
        work: (v) => [`${v.o} ones and ${v.h} hundredths = ${v.o}.${String(v.h).padStart(2, '0')}`],
      },
      h: {
        expr: '({d} − {o}) × 100',
        how: 'Read the two digits after the point as hundredths.',
        work: (v) => [`${v.d!.toFixed(2)}: ${v.h} hundredths after the point`],
      },
      o: {
        expr: '{d} − {h} ÷ 100',
        how: 'The ones are the digits before the point.',
        work: (v) => [`${v.d!.toFixed(2)}: ${v.o} before the point`],
      },
    },
  },
  example: { o, h, d: Number((o + h / 100).toFixed(2)) },
  startWith: ['o', 'h'],
  representation: { kind: 'grid100', percent: 'h', wholes: 'o', stack: true },
});

const fmt = (x: number) => formatNumber(x);
const exact = (x: number) => Number(x.toFixed(9));
const q = (a: number, b: number) => (b === 0 ? undefined : exact(a / b));

/**
 * A fraction as a decimal and a percent on hundredths grids: past 100% and in tenths of a
 * square (m.6.percent~fraction-decimal-percent, R29).
 */
const percentGrids = (id: string, title: string, a: number, b: number): ModuleDef => ({
  id,
  title,
  use: 'Use this for “Write 5/4 as a decimal and a percent,” or 3/8 = 37.5%.',
  assumptions: [
    'A percent is hundredths: 125% = 125/100 = 1.25, one whole grid and 25 squares.',
    'Make the denominator 100 when it divides 100; else divide (3 ÷ 8 = 0.375 = 37.5%).',
    'Denominators 2, 4, 5, 8, 10, 20, 25, 40, 50 and 100.',
  ],
  variables: [
    whole('a', 'a', 'Numerator', 0, 1000),
    { ...whole('b', 'b', 'Denominator', 2, 100), allowed: [2, 4, 5, 8, 10, 20, 25, 40, 50, 100] },
    { id: 'd', symbol: 'd', name: 'Decimal', min: 0, max: 10, step: 0.001, multipleOf: 0.001 },
    {
      id: 'p',
      symbol: 'p',
      name: 'Percent',
      unit: '%',
      min: 0,
      max: 1000,
      step: 0.1,
      multipleOf: 0.1,
    },
  ],
  relations: [
    {
      id: 'd = a ÷ b',
      display: '{a} ÷ {b} = {d}',
      words: 'Numerator ÷ denominator = decimal',
      check: (v: Values) => `${fmt(v.d!)} × ${v.b} = ${v.a}`,
      vars: ['d', 'a', 'b'],
      residual: (v: Values) => v.d! * v.b! - v.a!,
      solve: {
        d: (v: Values) => q(v.a!, v.b!),
        a: (v: Values) => exact(v.d! * v.b!),
        b: (v: Values) => q(v.a!, v.d!),
      },
    },
    {
      id: 'p = d × 100',
      display: '{d} × 100 = {p}',
      words: 'Decimal × 100 = percent',
      vars: ['p', 'd'],
      residual: (v: Values) => v.p! - v.d! * 100,
      solve: { p: (v: Values) => exact(v.d! * 100), d: (v: Values) => exact(v.p! / 100) },
    },
  ],
  steps: {
    'd = a ÷ b': {
      d: {
        expr: '{a} ÷ {b}',
        how: 'Make the denominator 100: multiply the top and bottom by the same number.',
        work: (v) => {
          const k = 100 / v.b!;
          if (!Number.isInteger(k)) return [`${v.a} ÷ ${v.b} = ${fmt(v.d!)}`];
          return k === 1
            ? [`${v.a}/100 = ${fmt(v.d!)}`]
            : [
                `${v.a}/${v.b} = ${v.a! * k}/100 (multiply both by ${k})`,
                `${v.a! * k}/100 = ${fmt(v.d!)}`,
              ];
        },
        written: (v) =>
          Number.isInteger(100 / v.b!) ? undefined : decimalLongDivision(v.a!, v.b!),
      },
      a: {
        expr: '{d} × {b}',
        how: 'The numerator is the decimal of the denominator.',
        written: false,
      },
      b: { expr: '{a} ÷ {d}', how: 'Divide the numerator by the decimal.', written: false },
    },
    'p = d × 100': {
      p: { expr: '{d} × 100', how: 'Hundredths are percents: move the point two places.' },
      d: { expr: '{p} ÷ 100', how: 'A percent is that many hundredths.' },
    },
  },
  example: { a, b, d: exact(a / b), p: exact((a / b) * 100) },
  startWith: ['a', 'b'],
  representation: { kind: 'grid100', percent: 'p', past100: true, exact: true },
});

export const R2C_GALLERY_MODULES: ModuleDef[] = [
  onesAndHundredths('g.hundredths-ones', 'Ones and hundredths', 2, 34),
  onesAndHundredths('g.hundredths-many-ones', 'Many ones and hundredths', 45, 6),
  onesAndHundredths('g.hundredths-ones-99', 'Ones to 99', 99, 99),
  percentGrids('g.percent-grid-page', 'Percent grid', 3, 5),
  percentGrids('g.percent-grid-past-100', 'Percent past 100', 5, 4),
  percentGrids('g.percent-grid-tenths', 'Percent in tenths of a square', 3, 8),
  percentGrids('g.percent-grid-edge', 'Percent to 1000', 399, 40),
];
