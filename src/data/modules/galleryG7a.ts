/**
 * Gallery demos for Grade 7 ratios, percents and signed numbers: a proportional graph with its
 * table, tax and discount bars, percent change, zero pairs, signed jumps and the sign table.
 * Spread into GALLERY_MODULES in gallery.ts; kept apart so that file's other demos merge easily.
 */
import { formatNumber } from '@/engine/format';
import type { Values } from '@/engine/types';

import { whole } from './helpers';
import type { ModuleDef, StepText } from './types';

const fmt = (x: number) => formatNumber(x);
const exact = (x: number) => Number(x.toFixed(9));
const q = (a: number, b: number) => (b === 0 ? undefined : exact(a / b));

/**
 * A price with a percent added on (tax, tip, markup) or taken off (discount): the change is
 * p% of the price, and the new amount is the price plus or minus the change.
 */
function percentOn(
  id: string,
  title: string,
  up: boolean,
  [changeName, totalName]: [string, string],
  example: Values,
): ModuleDef {
  const sign = up ? '+' : '−';
  const steps: Record<string, Record<string, StepText>> = {
    'c = w × p ÷ 100': {
      c: { expr: '{w} × {p} ÷ 100', how: `The ${changeName.toLowerCase()} is p% of the price.` },
      p: { expr: '{c} ÷ {w} × 100', how: 'Divide by the price, then multiply by 100.' },
      w: { expr: '{c} × 100 ÷ {p}', how: 'Multiply by 100, then divide by the percent.' },
    },
    [`T = w ${sign} c`]: {
      T: {
        expr: `{w} ${sign} {c}`,
        how: up ? `Add the ${changeName.toLowerCase()} on.` : 'Take the discount off.',
      },
      w: {
        expr: up ? '{T} − {c}' : '{T} + {c}',
        how: up ? `Take the ${changeName.toLowerCase()} off.` : 'Put the discount back.',
      },
      c: {
        expr: up ? '{T} − {w}' : '{w} − {T}',
        how: 'The difference between the two amounts.',
      },
    },
  };
  return {
    id,
    title,
    notation: 'letters',
    assumptions: [
      `The price is 100%. The ${changeName.toLowerCase()} is p% of it.`,
      up
        ? `The ${totalName.toLowerCase()} is 100% + p% of the price.`
        : `The ${totalName.toLowerCase()} is 100% − p% of the price.`,
    ],
    variables: [
      { id: 'w', symbol: 'w', name: 'Price', unit: '$', min: 0.01, max: 1000, step: 0.01 },
      {
        id: 'p',
        symbol: 'p',
        name: up ? `${changeName} rate` : 'Percent off',
        unit: '%',
        min: 0,
        max: up ? 200 : 100,
        step: 0.1,
      },
      { id: 'c', symbol: 'c', name: changeName, unit: '$', min: 0, max: 2000, step: 0.01 },
      { id: 'T', symbol: 'T', name: totalName, unit: '$', min: 0, max: 3000, step: 0.01 },
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
    steps,
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

/** a + b = r or a − b = r with integers, for two-color counters and signed jumps. */
function signedSum(
  id: string,
  title: string,
  subtract: boolean,
  assumptions: string[],
  example: Values,
  representation: ModuleDef['representation'],
  range = 20,
  /** Decimal steps (0.25) for rational numbers; whole numbers when left out. */
  step?: number,
): ModuleDef {
  const num = (id: string, name: string, r: number) =>
    step === undefined
      ? whole(id, id, name, -r, r)
      : { id, symbol: id, name, min: -r, max: r, step, multipleOf: step };
  const op = subtract ? '−' : '+';
  const rel = `r = a ${op} b`;
  return {
    id,
    title,
    notation: 'letters',
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
            r: { expr: '{a} − {b}', how: 'Take the second number away from the first.' },
            a: { expr: '{r} + {b}', how: 'Add the second number back on.' },
            b: { expr: '{a} − {r}', how: 'Take the difference from the first number.' },
          }
        : {
            r: { expr: '{a} + {b}', how: 'Add the two numbers.' },
            a: { expr: '{r} − {b}', how: 'Take the second number from the sum.' },
            b: { expr: '{r} − {a}', how: 'Take the first number from the sum.' },
          },
    },
    example,
    startWith: ['a', 'b'],
    // Counters have no handle of their own: sliders set the two numbers.
    ...(representation.kind === 'zeroPairs' ? { sliders: true } : {}),
    representation,
  };
}

export const G7A_GALLERY_MODULES: ModuleDef[] = [
  {
    id: 'g.proportional-graph',
    title: 'Proportional relationship',
    notation: 'letters',
    assumptions: [
      'In a proportional relationship y = kx, y ÷ x is the same k in every row.',
      'The graph is a line through (0, 0), and it passes through (1, k).',
    ],
    variables: [
      {
        id: 'k',
        symbol: 'k',
        name: 'Constant of proportionality',
        min: 0.1,
        max: 20,
        step: 0.1,
      },
      { id: 'x', symbol: 'x', name: 'Pounds of apples', min: 0, max: 20, step: 0.5 },
      { id: 'y', symbol: 'y', name: 'Cost in dollars', min: 0, max: 400 },
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
        y: { expr: '{k} × {x}', how: 'Multiply the pounds by the constant of proportionality.' },
        k: { expr: '{y} ÷ {x}', how: 'Divide both sides by x: k = y ÷ x.' },
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
  percentOn('g.sales-tax', 'Sales tax', true, ['Tax', 'Total'], { w: 40, p: 7.5, c: 3, T: 43 }),
  percentOn('g.discount', 'Discount', false, ['Discount', 'Sale price'], {
    w: 60,
    p: 25,
    c: 15,
    T: 45,
  }),
  {
    id: 'g.percent-change',
    title: 'Percent change',
    notation: 'letters',
    assumptions: [
      'The change is the new amount minus the original; it is negative for a decrease.',
      'Percent change = change ÷ original × 100.',
    ],
    variables: [
      { id: 'b', symbol: 'b', name: 'Before', min: 0.01, max: 1000, step: 0.01 },
      { id: 'a', symbol: 'a', name: 'After', min: 0, max: 4000, step: 0.01 },
      { id: 'c', symbol: 'c', name: 'Change', min: -1000, max: 3000, step: 0.01 },
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
  signedSum(
    'g.zero-pairs-add',
    'Adding with zero pairs',
    false,
    [
      'A yellow counter is +1 and a red counter is −1.',
      'A + and a − together make a zero pair: 0. The counters left over are the sum.',
    ],
    { a: 3, b: -5, r: -2 },
    { kind: 'zeroPairs', first: 'a', second: 'b', result: 'r' },
  ),
  signedSum(
    'g.zero-pairs-subtract',
    'Subtracting with zero pairs',
    true,
    [
      'Subtracting takes counters away. A zero pair is 0, so adding one changes nothing.',
      'With too few counters to take away, add zero pairs first.',
    ],
    { a: 2, b: 5, r: -3 },
    { kind: 'zeroPairs', first: 'a', second: 'b', result: 'r', op: '−' },
  ),
  {
    id: 'g.sign-table',
    title: 'Signs when multiplying',
    notation: 'letters',
    assumptions: [
      'Multiply the sizes of the numbers, then find the sign from the table.',
      'Same signs give a positive answer; different signs give a negative one.',
    ],
    variables: [
      { id: 'a', symbol: 'a', name: 'First number', min: -20, max: 20, step: 0.5 },
      { id: 'b', symbol: 'b', name: 'Second number', min: -20, max: 20, step: 0.5 },
      { id: 'r', symbol: 'r', name: 'Product', min: -400, max: 400, derived: true },
    ],
    relations: [
      {
        id: 'r = a × b',
        display: '{r} = {a} × {b}',
        check: (v: Values) => `${fmt(v.r!)} = ${fmt(v.a!)} × ${fmt(v.b!)}`,
        vars: ['r', 'a', 'b'],
        residual: (v: Values) => v.r! - v.a! * v.b!,
        solve: {
          r: (v: Values) => exact(v.a! * v.b!),
          a: (v: Values) => q(v.r!, v.b!),
          b: (v: Values) => q(v.r!, v.a!),
        },
      },
    ],
    steps: {
      'r = a × b': {
        r: { expr: '{a} × {b}', how: 'Multiply the sizes; same signs give +, different signs −.' },
        a: { expr: '{r} ÷ {b}', how: 'Divide both sides by b.' },
        b: { expr: '{r} ÷ {a}', how: 'Divide both sides by a.' },
      },
    },
    example: { a: -3, b: 4, r: -12 },
    startWith: ['a', 'b'],
    representation: { kind: 'signTable', first: 'a', second: 'b', result: 'r' },
  },
  signedSum(
    'g.signed-jump-add',
    'Adding on a number line',
    false,
    [
      'Start at the first number. A positive number jumps right; a negative one jumps left.',
      'Fractions and decimals jump the same way as whole numbers.',
    ],
    { a: -3.5, b: 5, r: 1.5 },
    { kind: 'integerLine', value: 'a', min: -5, max: 5, jump: { by: 'b', result: 'r' } },
    10,
    0.25,
  ),
  signedSum(
    'g.signed-jump-subtract',
    'Subtracting on a number line',
    true,
    [
      'Subtracting a number is adding its opposite, so the jump goes the other way.',
      'Subtracting a negative number jumps right.',
    ],
    { a: 2, b: -3.5, r: 5.5 },
    {
      kind: 'integerLine',
      value: 'a',
      min: -5,
      max: 5,
      jump: { by: 'b', result: 'r', op: '−' },
    },
    10,
    0.25,
  ),
];
