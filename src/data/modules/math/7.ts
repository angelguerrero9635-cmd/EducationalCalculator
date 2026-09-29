/**
 * Grade 7 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { formatNumber } from '@/engine/format';
import type { Relation, Values } from '@/engine/types';

import { whole } from '../helpers';
import type { ModuleDef, StepText } from '../types';

const fmt = (x: number) => formatNumber(x);
/** Rounds off floating-point dust (0.1 + 0.2), so answers print as class writes them. */
const exact = (x: number) => Number(x.toFixed(9));
const q = (a: number, b: number) => (b === 0 ? undefined : exact(a / b));

/** `c = a × b` with its steps. */
const product = (
  c: string,
  a: string,
  b: string,
  how: [string, string, string],
): { relation: Relation; steps: Record<string, StepText> } => ({
  relation: {
    id: `${c} = ${a} × ${b}`,
    display: `{${c}} = {${a}} × {${b}}`,
    vars: [c, a, b],
    residual: (v: Values) => v[c]! - v[a]! * v[b]!,
    solve: {
      [c]: (v: Values) => exact(v[a]! * v[b]!),
      [a]: (v: Values) => q(v[c]!, v[b]!),
      [b]: (v: Values) => q(v[c]!, v[a]!),
    },
  },
  steps: {
    [c]: { expr: `{${a}} × {${b}}`, how: how[0] },
    [a]: { expr: `{${c}} ÷ {${b}}`, how: how[1] },
    [b]: { expr: `{${c}} ÷ {${a}}`, how: how[2] },
  },
});

/** `c = a ÷ b` with its steps. */
const quotient = (
  c: string,
  a: string,
  b: string,
  how: [string, string, string],
): { relation: Relation; steps: Record<string, StepText> } => ({
  relation: {
    id: `${c} = ${a} ÷ ${b}`,
    display: `{${c}} = {${a}} ÷ {${b}}`,
    vars: [c, a, b],
    residual: (v: Values) => v[c]! * v[b]! - v[a]!,
    solve: {
      [c]: (v: Values) => q(v[a]!, v[b]!),
      [a]: (v: Values) => exact(v[c]! * v[b]!),
      [b]: (v: Values) => q(v[a]!, v[c]!),
    },
  },
  steps: {
    [c]: { expr: `{${a}} ÷ {${b}}`, how: how[0] },
    [a]: { expr: `{${c}} × {${b}}`, how: how[1] },
    [b]: { expr: `{${a}} ÷ {${c}}`, how: how[2] },
  },
});

/** Money in dollars. */
const money = (id: string, name: string, max: number, derived = false) => ({
  id,
  symbol: id,
  name,
  unit: '$',
  min: 0,
  max,
  step: 0.01,
  ...(derived ? { derived: true } : {}),
});

/**
 * A price with a percent added on (tax, tip, markup) or taken off (discount): the change is
 * p% of the price, and the new amount is the price plus or minus the change.
 */
function percentOn(
  id: string,
  head: { title?: string; use?: string },
  up: boolean,
  names: { rate: string; change: string; total: string },
  assumptions: string[],
  example: Values,
): ModuleDef {
  const sign = up ? '+' : '−';
  const change = names.change.toLowerCase();
  return {
    id,
    ...head,
    assumptions,
    variables: [
      money('w', 'Price', 10000),
      { id: 'p', symbol: 'p', name: names.rate, unit: '%', min: 0, max: up ? 200 : 100, step: 0.1 },
      money('c', names.change, 20000),
      money('T', names.total, 30000),
    ],
    relations: [
      {
        id: 'c = w × p ÷ 100',
        display: '{c} = {w} × {p} ÷ 100',
        check: (v: Values) => `${fmt(v.c!)} = ${fmt(v.w!)} × ${fmt(v.p!)} ÷ 100`,
        vars: ['c', 'w', 'p'],
        residual: (v: Values) => v.c! - (v.w! * v.p!) / 100,
        solve: {
          c: (v: Values) => exact((v.w! * v.p!) / 100),
          p: (v: Values) => q(v.c! * 100, v.w!),
          w: (v: Values) => q(v.c! * 100, v.p!),
        },
      },
      {
        id: `T = w ${sign} c`,
        display: `{T} = {w} ${sign} {c}`,
        check: (v: Values) => `${fmt(v.T!)} = ${fmt(v.w!)} ${sign} ${fmt(v.c!)}`,
        vars: ['T', 'w', 'c'],
        residual: (v: Values) => v.T! - (up ? v.w! + v.c! : v.w! - v.c!),
        solve: {
          T: (v: Values) => exact(up ? v.w! + v.c! : v.w! - v.c!),
          w: (v: Values) => exact(up ? v.T! - v.c! : v.T! + v.c!),
          c: (v: Values) => exact(up ? v.T! - v.w! : v.w! - v.T!),
        },
      },
    ],
    steps: {
      'c = w × p ÷ 100': {
        c: { expr: '{w} × {p} ÷ 100', how: `The ${change} is p% of the price.` },
        p: { expr: '{c} ÷ {w} × 100', how: 'Divide by the price, then multiply by 100.' },
        w: { expr: '{c} × 100 ÷ {p}', how: 'Multiply by 100, then divide by the percent.' },
      },
      [`T = w ${sign} c`]: {
        T: {
          expr: `{w} ${sign} {c}`,
          how: up ? `Add the ${change} to the price.` : 'Take the discount off the price.',
        },
        w: {
          expr: up ? '{T} − {c}' : '{T} + {c}',
          how: up ? `Take the ${change} back off.` : 'Put the discount back.',
        },
        c: {
          expr: up ? '{T} − {w}' : '{w} − {T}',
          how: 'The difference between the two amounts.',
        },
      },
    },
    example,
    startWith: ['w', 'p'],
    representation: {
      kind: 'percentBar',
      percent: 'p',
      part: 'c',
      whole: 'w',
      change: { total: 'T', direction: up ? 'up' : 'down' },
    },
  };
}

/** a + b = r or a − b = r with signed numbers. */
function signedSum(
  id: string,
  head: { title?: string; use?: string },
  subtract: boolean,
  assumptions: string[],
  example: Values,
  representation: ModuleDef['representation'],
  range: number,
  step?: number,
): ModuleDef {
  const num = (vid: string, name: string, r: number) =>
    step === undefined
      ? whole(vid, vid, name, -r, r)
      : { id: vid, symbol: vid, name, min: -r, max: r, step, multipleOf: step };
  const op = subtract ? '−' : '+';
  const rel = `r = a ${op} b`;
  return {
    id,
    ...head,
    assumptions,
    variables: [
      num('a', 'First number', range),
      num('b', 'Second number', range),
      { ...num('r', subtract ? 'Difference' : 'Sum', 2 * range), derived: true },
    ],
    relations: [
      {
        id: rel,
        display: `{r} = {a} ${op} {b}`,
        vars: ['r', 'a', 'b'],
        // The subtraction's check is the addition it undoes (r + b = a).
        ...(subtract
          ? {
              check: (v: Values) =>
                `${fmt(v.r!)} + ${v.b! < 0 ? `(${fmt(v.b!)})` : fmt(v.b!)} = ${fmt(v.a!)}`,
            }
          : {}),
        residual: (v: Values) => v.r! - (subtract ? v.a! - v.b! : v.a! + v.b!),
        solve: {
          r: (v: Values) => exact(subtract ? v.a! - v.b! : v.a! + v.b!),
          a: (v: Values) => exact(subtract ? v.r! + v.b! : v.r! - v.b!),
          b: (v: Values) => exact(subtract ? v.a! - v.r! : v.r! - v.a!),
        },
      },
    ],
    steps: {
      [rel]: subtract
        ? {
            r: {
              expr: '{a} − {b}',
              how: 'Subtracting a number is adding its opposite: the jump goes the other way.',
            },
            a: { expr: '{r} + {b}', how: 'Add the second number back on.' },
            b: { expr: '{a} − {r}', how: 'Take the difference from the first number.' },
          }
        : {
            r: {
              expr: '{a} + {b}',
              how: 'Start at the first number; a positive number jumps right, a negative one left.',
            },
            a: { expr: '{r} − {b}', how: 'Take the second number from the sum.' },
            b: { expr: '{r} − {a}', how: 'Take the first number from the sum.' },
          },
    },
    example,
    startWith: ['a', 'b'],
    ...(representation.kind === 'zeroPairs' ? { sliders: true } : {}),
    representation,
  };
}

const proportion = [
  quotient('k', 'a', 'b', [
    'The unit rate: the first numerator for 1 of the first denominator.',
    'Multiply the unit rate by the first denominator.',
    'Divide the first numerator by the unit rate.',
  ]),
  product('c', 'k', 'd', [
    'The same rate for the second pair: multiply the unit rate by the second denominator.',
    'Divide the second numerator by the second denominator.',
    'Divide the second numerator by the unit rate.',
  ]),
];

const fractionRates = [
  quotient('k', 'a', 'b', [
    'Sugar for 1 cup of flour: divide the sugar by the flour. Dividing by a fraction is multiplying by its reciprocal.',
    'Multiply the sugar per cup by the cups of flour.',
    'Divide the sugar by the sugar per cup of flour.',
  ]),
  product('s', 'k', 'f', [
    'Multiply the sugar for 1 cup of flour by the cups of flour wanted.',
    'Divide the sugar needed by the flour wanted.',
    'Divide the sugar needed by the sugar per cup of flour.',
  ]),
];

const signs = [
  product('r', 'a', 'b', [
    'Multiply the sizes; same signs give a positive answer, different signs a negative one.',
    'Divide both sides by b.',
    'Divide both sides by a.',
  ]),
  quotient('d', 'a', 'b', [
    'Divide the sizes; the sign rule is the same as for multiplying.',
    'Multiply the quotient by b.',
    'Divide a by the quotient.',
  ]),
];

const interest: { relation: Relation; steps: Record<string, StepText> }[] = [
  {
    relation: {
      id: 'I = P × r ÷ 100 × t',
      display: '{I} = {P} × {r} ÷ 100 × {t}',
      check: (v: Values) => `${fmt(v.I!)} = ${fmt(v.P!)} × ${fmt(v.r!)} ÷ 100 × ${fmt(v.t!)}`,
      vars: ['I', 'P', 'r', 't'],
      residual: (v: Values) => v.I! - (v.P! * v.r! * v.t!) / 100,
      solve: {
        I: (v: Values) => exact((v.P! * v.r! * v.t!) / 100),
        P: (v: Values) => q(v.I! * 100, v.r! * v.t!),
        r: (v: Values) => q(v.I! * 100, v.P! * v.t!),
        t: (v: Values) => q(v.I! * 100, v.P! * v.r!),
      },
    } satisfies Relation,
    steps: {
      I: {
        expr: '{P} × {r} ÷ 100 × {t}',
        how: 'Each year earns r% of the principal; multiply by the years.',
      },
      P: { expr: '{I} × 100 ÷ ({r} × {t})', how: 'Undo the percent and the years.' },
      r: {
        expr: '{I} × 100 ÷ ({P} × {t})',
        how: 'Interest for one year as a percent of the principal.',
      },
      t: { expr: '{I} × 100 ÷ ({P} × {r})', how: 'Divide the interest by one year’s interest.' },
    } satisfies Record<string, StepText>,
  },
  {
    relation: {
      id: 'A = P + I',
      display: '{A} = {P} + {I}',
      vars: ['A', 'P', 'I'],
      residual: (v: Values) => v.A! - v.P! - v.I!,
      solve: {
        A: (v: Values) => exact(v.P! + v.I!),
        P: (v: Values) => exact(v.A! - v.I!),
        I: (v: Values) => exact(v.A! - v.P!),
      },
    } satisfies Relation,
    steps: {
      A: { expr: '{P} + {I}', how: 'Add the interest to the principal.' },
      P: { expr: '{A} − {I}', how: 'Take the interest back off.' },
      I: { expr: '{A} − {P}', how: 'The amount in all, less the principal.' },
    } satisfies Record<string, StepText>,
  },
];

export const MATH_7_MODULES: ModuleDef[] = [
  // ── Proportional relationships (7.RP.1–3) ──
  {
    id: 'm.7.proportional-relationships',
    assumptions: [
      'In a proportional relationship, y ÷ x is the same number k for every pair: the constant of proportionality.',
      'The graph is a straight line through (0, 0), and it passes through (1, k).',
      'k is the unit rate: y for one x.',
      'If any pair gives a different y ÷ x, the relationship is not proportional.',
    ],
    variables: [
      {
        id: 'k',
        symbol: 'k',
        name: 'Constant of proportionality',
        min: 0.05,
        max: 100,
        step: 0.05,
      },
      { id: 'x', symbol: 'x', name: 'Input', min: 0, max: 1000, step: 0.5 },
      { id: 'y', symbol: 'y', name: 'Output', min: 0, max: 100000 },
    ],
    relations: [
      {
        id: 'y = kx',
        display: '{y} = {k}{x}',
        check: (v: Values) => `${fmt(v.y!)} = ${fmt(v.k!)} × ${fmt(v.x!)}`,
        vars: ['y', 'k', 'x'],
        residual: (v: Values) => v.y! - v.k! * v.x!,
        solve: {
          y: (v: Values) => exact(v.k! * v.x!),
          k: (v: Values) => q(v.y!, v.x!),
          x: (v: Values) => q(v.y!, v.k!),
        },
      },
    ],
    steps: {
      'y = kx': {
        y: { expr: '{k} × {x}', how: 'Multiply the input by the constant of proportionality.' },
        k: { expr: '{y} ÷ {x}', how: 'Divide both sides by x: k = y ÷ x, the output for 1.' },
        x: { expr: '{y} ÷ {k}', how: 'Divide both sides by k.' },
      },
    },
    example: { k: 2.5, x: 4, y: 10 },
    startWith: ['k', 'x'],
    representation: {
      kind: 'plot',
      x: { var: 'x', min: 0, max: 5 },
      y: { var: 'y', min: 0, max: 15 },
      params: ['k'],
      autoRange: true,
      unitRate: 'k',
      table: [0, 1, 2, 3],
    },
  },
  {
    id: 'm.7.proportional-relationships~proportion',
    title: 'Solve a proportion',
    use: 'Use this for “If 2/25 = n/500, what is n?” and “750 g of sugar makes 20 L; how much for 12 L?”',
    assumptions: [
      'Both fractions are the same ratio written with different numbers.',
      'Find the unit rate of one pair, then multiply.',
      'Check: the cross products are equal.',
    ],
    equation: '{a}/{b} = {c}/{d}',
    variables: [
      { id: 'a', symbol: 'a', name: 'First numerator', min: 0.01, max: 10000, step: 0.01 },
      { id: 'b', symbol: 'b', name: 'First denominator', min: 0.01, max: 10000, step: 0.01 },
      { id: 'c', symbol: 'c', name: 'Second numerator', min: 0.01, max: 10000, step: 0.01 },
      { id: 'd', symbol: 'd', name: 'Second denominator', min: 0.01, max: 10000, step: 0.01 },
      { id: 'k', symbol: 'k', name: 'Unit rate', min: 0, max: 1000000, derived: true },
    ],
    relations: proportion.map((r) => r.relation),
    steps: Object.fromEntries(proportion.map((r) => [r.relation.id, r.steps])),
    example: { a: 2, b: 25, c: 40, d: 500, k: 0.08 },
    startWith: ['a', 'b', 'd'],
    representation: { kind: 'doubleNumberLine', top: 'd', bottom: 'c', per: 'k', ticks: 5 },
  },
  {
    id: 'm.7.proportional-relationships~fraction-rates',
    title: 'Rates with fractions',
    use: 'Use this for “1/2 cup of sugar for every 3/4 cup of flour: how much sugar for 1 cup of flour?”',
    assumptions: [
      'A unit rate with fractions works like one with whole numbers: divide to find the amount for 1.',
      'Dividing by a fraction is multiplying by its reciprocal: 1/2 ÷ 3/4 = 1/2 × 4/3 = 2/3.',
      'Then multiply the amount for 1 by how many you want.',
    ],
    variables: [
      {
        id: 'a',
        symbol: 'a',
        name: 'Sugar',
        unit: 'cups',
        min: 0,
        max: 20,
        step: 0.125,
        fraction: 8,
      },
      {
        id: 'b',
        symbol: 'b',
        name: 'Flour',
        unit: 'cups',
        min: 0.125,
        max: 20,
        step: 0.125,
        fraction: 8,
      },
      {
        id: 'k',
        symbol: 'k',
        name: 'Sugar for 1 cup of flour',
        unit: 'cups',
        min: 0,
        max: 200,
        fraction: 16,
        derived: true,
      },
      {
        id: 'f',
        symbol: 'f',
        name: 'Flour wanted',
        unit: 'cups',
        min: 0.125,
        max: 40,
        step: 0.125,
        fraction: 8,
      },
      { id: 's', symbol: 's', name: 'Sugar needed', unit: 'cups', min: 0, max: 8000, fraction: 16 },
    ],
    relations: fractionRates.map((r) => r.relation),
    steps: Object.fromEntries(fractionRates.map((r) => [r.relation.id, r.steps])),
    example: { a: 0.5, b: 0.75, k: 2 / 3, f: 3, s: 2 },
    startWith: ['a', 'b', 'f'],
    representation: { kind: 'doubleNumberLine', top: 'f', bottom: 's', per: 'k', ticks: 4 },
  },

  // ── Percent applications (7.RP.3, 7.EE.3) ──
  percentOn(
    'm.7.percent-applications',
    {},
    true,
    { rate: 'Percent added', change: 'Amount added', total: 'Total' },
    [
      'The price is 100%. The tax, tip or markup is p% of it.',
      'The total is 100% + p% of the price.',
      'Sales tax, a tip and a markup all add a percent of the price.',
      'Round money to the nearest cent.',
    ],
    { w: 40, p: 7.5, c: 3, T: 43 },
  ),
  percentOn(
    'm.7.percent-applications~discount',
    {
      title: 'Discount and sale price',
      use: 'Use this for “A $49.99 jacket is 30% off. What is the sale price?”',
    },
    false,
    { rate: 'Percent off', change: 'Discount', total: 'Sale price' },
    [
      'The price is 100%. The discount is p% of it.',
      'The sale price is 100% − p% of the price.',
      'To find the original price, the sale price is (100 − p)% of it.',
    ],
    { w: 60, p: 25, c: 15, T: 45 },
  ),
  {
    id: 'm.7.percent-applications~percent-change',
    title: 'Percent increase and decrease',
    use: 'Use this for “The price went from 50¢ to 60¢. What is the percent increase?”',
    assumptions: [
      'The change is the new amount minus the original; it is negative for a decrease.',
      'Percent change = change ÷ original × 100: always divide by the original.',
      'A 20% increase then a 20% decrease does not bring the price back.',
    ],
    variables: [
      { id: 'b', symbol: 'b', name: 'Original amount', min: 0.01, max: 100000, step: 0.01 },
      { id: 'a', symbol: 'a', name: 'New amount', min: 0, max: 400000, step: 0.01 },
      {
        id: 'c',
        symbol: 'c',
        name: 'Change',
        min: -100000,
        max: 300000,
        step: 0.01,
        derived: true,
      },
      { id: 'p', symbol: 'p', name: 'Percent change', unit: '%', min: -100, max: 300, step: 0.1 },
    ],
    relations: [
      {
        id: 'c = a − b',
        display: '{c} = {a} − {b}',
        check: (v: Values) => `${fmt(v.c!)} = ${fmt(v.a!)} − ${fmt(v.b!)}`,
        vars: ['c', 'a', 'b'],
        residual: (v: Values) => v.c! - (v.a! - v.b!),
        solve: {
          c: (v: Values) => exact(v.a! - v.b!),
          a: (v: Values) => exact(v.b! + v.c!),
          b: (v: Values) => exact(v.a! - v.c!),
        },
      },
      {
        id: 'p = c ÷ b × 100',
        display: '{p} = {c} ÷ {b} × 100',
        check: (v: Values) => `${fmt(v.p!)} = ${fmt(v.c!)} ÷ ${fmt(v.b!)} × 100`,
        vars: ['p', 'c', 'b'],
        residual: (v: Values) => v.p! * v.b! - v.c! * 100,
        solve: {
          p: (v: Values) => q(v.c! * 100, v.b!),
          c: (v: Values) => exact((v.p! * v.b!) / 100),
          b: (v: Values) => q(v.c! * 100, v.p!),
        },
      },
    ],
    steps: {
      'c = a − b': {
        c: { expr: '{a} − {b}', how: 'Take the original from the new amount.' },
        a: { expr: '{b} + {c}', how: 'Add the change to the original.' },
        b: { expr: '{a} − {c}', how: 'Take the change off the new amount.' },
      },
      'p = c ÷ b × 100': {
        p: { expr: '{c} ÷ {b} × 100', how: 'Divide the change by the original, then × 100.' },
        c: { expr: '{p} × {b} ÷ 100', how: 'The change is p% of the original.' },
        b: { expr: '{c} × 100 ÷ {p}', how: 'Multiply by 100, then divide by the percent.' },
      },
    },
    example: { b: 40, a: 50, c: 10, p: 25 },
    startWith: ['b', 'a'],
    representation: {
      kind: 'percentBar',
      percent: 'p',
      part: 'c',
      whole: 'b',
      change: { total: 'a', bars: 2 },
    },
  },
  {
    id: 'm.7.percent-applications~percent-error',
    title: 'Percent error',
    use: 'Use this for “The thermometer reads 331.5°F when it is 325°F. What is the percent error?”',
    assumptions: [
      'The error is the gap between the measured value and the actual value, always positive.',
      'Percent error = error ÷ actual value × 100: divide by the actual value, not the measured one.',
      'A small percent error means a good measurement.',
    ],
    variables: [
      { id: 't', symbol: 't', name: 'Actual value', min: 0.01, max: 100000, step: 0.01 },
      { id: 'm', symbol: 'm', name: 'Measured value', min: 0, max: 400000, step: 0.01 },
      { id: 'e', symbol: 'e', name: 'Error', min: 0, max: 300000, step: 0.01, derived: true },
      { id: 'p', symbol: 'p', name: 'Percent error', unit: '%', min: 0, max: 100, step: 0.01 },
    ],
    relations: [
      {
        id: 'e = |m − t|',
        display: '{e} = |{m} − {t}|',
        check: (v: Values) =>
          v.m! >= v.t!
            ? `${fmt(v.e!)} = ${fmt(v.m!)} − ${fmt(v.t!)}`
            : `${fmt(v.e!)} = ${fmt(v.t!)} − ${fmt(v.m!)}`,
        vars: ['e', 'm', 't'],
        residual: (v: Values) => v.e! - Math.abs(v.m! - v.t!),
        solve: {
          e: (v: Values) => exact(Math.abs(v.m! - v.t!)),
          m: (v: Values) => [exact(v.t! + v.e!), exact(v.t! - v.e!)],
          t: (v: Values) => [exact(v.m! - v.e!), exact(v.m! + v.e!)],
        },
      },
      {
        id: 'p = e ÷ t × 100',
        display: '{p} = {e} ÷ {t} × 100',
        check: (v: Values) => `${fmt(v.p!)} = ${fmt(v.e!)} ÷ ${fmt(v.t!)} × 100`,
        vars: ['p', 'e', 't'],
        residual: (v: Values) => v.p! * v.t! - v.e! * 100,
        solve: {
          p: (v: Values) => q(v.e! * 100, v.t!),
          e: (v: Values) => exact((v.p! * v.t!) / 100),
          t: (v: Values) => q(v.e! * 100, v.p!),
        },
      },
    ],
    steps: {
      'e = |m − t|': {
        e: { expr: '|{m} − {t}|', how: 'The gap between the measured and the actual value.' },
        m: {
          expr: (v: Values) => (v.m! >= v.t! ? '{t} + {e}' : '{t} − {e}'),
          how: 'The actual value, off by the error: above it or below it.',
        },
        t: {
          expr: (v: Values) => (v.m! >= v.t! ? '{m} − {e}' : '{m} + {e}'),
          how: 'The measured value, corrected by the error.',
        },
      },
      'p = e ÷ t × 100': {
        p: { expr: '{e} ÷ {t} × 100', how: 'Divide the error by the actual value, then × 100.' },
        e: { expr: '{p} × {t} ÷ 100', how: 'The error is p% of the actual value.' },
        t: { expr: '{e} × 100 ÷ {p}', how: 'Multiply by 100, then divide by the percent.' },
      },
    },
    example: { t: 325, m: 331.5, e: 6.5, p: 2 },
    startWith: ['t', 'm'],
    representation: { kind: 'percentBar', percent: 'p', part: 'e', whole: 't' },
  },
  {
    id: 'm.7.percent-applications~simple-interest',
    title: 'Simple interest',
    use: 'Use this for “$500 at 4% a year for 3 years: how much interest?”',
    assumptions: [
      'The principal is the money saved or borrowed. Each year earns the same r% of it.',
      'Simple interest does not earn interest on interest.',
      'The amount in all is the principal plus the interest.',
    ],
    variables: [
      { ...money('P', 'Principal', 100000), min: 1 },
      { id: 'r', symbol: 'r', name: 'Rate per year', unit: '%', min: 0, max: 30, step: 0.1 },
      { id: 't', symbol: 't', name: 'Time', unit: 'years', min: 0, max: 30, step: 0.5 },
      money('I', 'Interest', 1000000),
      money('A', 'Amount in all', 1100000, true),
    ],
    relations: interest.map((r) => r.relation),
    steps: Object.fromEntries(interest.map((r) => [r.relation.id, r.steps])),
    example: { P: 500, r: 4, t: 3, I: 60, A: 560 },
    startWith: ['P', 'r', 't'],
    representation: {
      kind: 'table',
      sweep: 't',
      output: 'A',
      params: ['P', 'r'],
      rows: [0, 1, 2, 3, 4, 5],
    },
  },

  // ── Operations with rational numbers (7.NS.1–3) ──
  signedSum(
    'm.7.rational-operations',
    {},
    false,
    [
      'Start at the first number. A positive number jumps right; a negative one jumps left.',
      'Adding a negative number is the same as subtracting its opposite.',
      'A number and its opposite add to 0.',
      'Decimals and fractions jump the same way as whole numbers.',
    ],
    { a: -3.5, b: 5, r: 1.5 },
    { kind: 'integerLine', value: 'a', min: -5, max: 5, jump: { by: 'b', result: 'r' } },
    2000,
    0.25,
  ),
  signedSum(
    'm.7.rational-operations~zero-pairs',
    {
      title: 'Adding with counters',
      use: 'Use this for “Show 3 + (−5) with counters.”',
    },
    false,
    [
      'A yellow counter is +1 and a red counter is −1.',
      'A + and a − together make a zero pair: 0. The counters left over are the sum.',
      'The sign of the sum is the color left over.',
    ],
    { a: 3, b: -5, r: -2 },
    { kind: 'zeroPairs', first: 'a', second: 'b', result: 'r' },
    20,
  ),
  signedSum(
    'm.7.rational-operations~subtract',
    {
      title: 'Subtracting signed numbers',
      use: 'Use this for “−3 − 8” and “How many feet higher is 1,277 ft than −294 ft?”',
    },
    true,
    [
      'Subtracting a number is adding its opposite, so the jump goes the other way.',
      'Subtracting a negative number jumps right.',
      'The difference a − b is the distance from b to a, with a sign.',
    ],
    { a: 2, b: -3.5, r: 5.5 },
    { kind: 'integerLine', value: 'a', min: -5, max: 5, jump: { by: 'b', result: 'r', op: '−' } },
    2000,
    0.25,
  ),
  {
    id: 'm.7.rational-operations~multiply-divide',
    title: 'Multiplying and dividing signed numbers',
    use: 'Use this for “(−5)(−7)” and “48 ÷ (−8)”.',
    assumptions: [
      'Multiply or divide the sizes, then find the sign from the table.',
      'Same signs give a positive answer; different signs give a negative one.',
      'Dividing by a number is multiplying by its reciprocal, so the sign rule is the same.',
    ],
    variables: [
      {
        id: 'a',
        symbol: 'a',
        name: 'First number',
        min: -100,
        max: 100,
        step: 0.01,
        fraction: 100,
      },
      {
        id: 'b',
        symbol: 'b',
        name: 'Second number',
        min: -100,
        max: 100,
        step: 0.01,
        fraction: 100,
      },
      {
        id: 'r',
        symbol: 'r',
        name: 'Product',
        min: -10000,
        max: 10000,
        fraction: 100,
        derived: true,
      },
      {
        id: 'd',
        symbol: 'd',
        name: 'Quotient',
        min: -1000000,
        max: 1000000,
        fraction: 100,
        derived: true,
      },
    ],
    relations: signs.map((r) => r.relation),
    steps: Object.fromEntries(signs.map((r) => [r.relation.id, r.steps])),
    example: { a: -3, b: 4, r: -12, d: -0.75 },
    startWith: ['a', 'b'],
    representation: { kind: 'signTable', first: 'a', second: 'b', result: 'r' },
  },

  {
    id: 'm.7.circles',
    assumptions: [
      'Every point on the circle is the same distance (the radius) from the center.',
      'π ≈ 3.14159 is the ratio of any circle’s circumference to its diameter.',
      'All lengths use the same unit; area is in square units.',
    ],
    variables: [
      { id: 'r', symbol: 'r', name: 'Radius', unit: 'cm', min: 0, max: 1000, step: 0.5 },
      { id: 'd', symbol: 'd', name: 'Diameter', unit: 'cm', min: 0, max: 2000 },
      { id: 'C', symbol: 'C', name: 'Circumference', unit: 'cm', min: 0, max: 6300 },
      { id: 'A', symbol: 'A', name: 'Area', unit: 'cm²', min: 0, max: 3200000 },
    ],
    relations: [
      {
        id: 'd = 2r',
        display: '{d} = 2 × {r}',
        vars: ['d', 'r'],
        residual: (v) => v.d! - 2 * v.r!,
        solve: { d: (v) => 2 * v.r!, r: (v) => v.d! / 2 },
      },
      {
        id: 'C = πd',
        display: '{C} = π × {d}',
        vars: ['C', 'd'],
        residual: (v) => v.C! - Math.PI * v.d!,
        solve: { C: (v) => Math.PI * v.d!, d: (v) => v.C! / Math.PI },
      },
      {
        id: 'C = 2πr',
        display: '{C} = 2 × π × {r}',
        vars: ['C', 'r'],
        residual: (v) => v.C! - 2 * Math.PI * v.r!,
        solve: { C: (v) => 2 * Math.PI * v.r!, r: (v) => v.C! / (2 * Math.PI) },
      },
      {
        id: 'A = πr²',
        display: '{A} = π × {r}²',
        vars: ['A', 'r'],
        residual: (v) => v.A! - Math.PI * v.r! ** 2,
        solve: { A: (v) => Math.PI * v.r! ** 2, r: (v) => Math.sqrt(v.A! / Math.PI) },
      },
    ],
    steps: {
      'd = 2r': {
        d: { expr: '2 × {r}', how: 'A diameter is two radii end to end through the center.' },
        r: { expr: '{d} ÷ 2', how: 'The radius is half the diameter.' },
      },
      'C = πd': {
        C: { expr: 'π × {d}', how: 'Circumference is π times the diameter.' },
        d: { expr: '{C} ÷ π', how: 'Divide both sides by π.' },
      },
      'C = 2πr': {
        C: {
          expr: '2 × π × {r}',
          how: 'The diameter is 2r, and circumference is π times the diameter.',
        },
        r: { expr: '{C} ÷ (2 × π)', how: 'Divide both sides by 2π.' },
      },
      'A = πr²': {
        A: { expr: 'π × {r}²', how: 'Square the radius, then multiply by π.' },
        r: {
          expr: '√({A} ÷ π)',
          how: 'Divide both sides by π, then take the square root (a radius is never negative).',
        },
      },
    },
    example: { r: 3, d: 6, C: 6 * Math.PI, A: 9 * Math.PI },
    startWith: ['r'],
    representation: {
      kind: 'circle',
      radius: 'r',
      extent: 5,
      diameter: 'd',
      circumference: 'C',
      area: 'A',
    },
  },
];
