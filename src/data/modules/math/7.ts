/**
 * Grade 7 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { diceCount } from '@/components/module/reps/dice';
import { decimalDigits, formatNumber } from '@/engine/format';
import type { Relation, Values } from '@/engine/types';

import { whole } from '../helpers';
import type { ModuleDef, StepText } from '../types';
import { decimalLongDivision } from '../written';

const fmt = (x: number) => formatNumber(x);
/**
 * Rounds off floating-point dust (0.1 + 0.2 = 0.30000000000000004) to 12 significant figures,
 * fine enough that thirds stay thirds (3 × 8/3 is still 8 to the whole-number checks).
 */
const exact = (x: number) => Number(x.toPrecision(12));
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
/** A signed number as those pages show it: twelfths as fractions, other values as decimals. */
const sf = (x: number) => formatNumber(x, { fraction: 12 });

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
      : // Any decimal or fraction: 2/3 − 5/6 prints as fractions (twelfths), 3.5 as a decimal.
        { id: vid, symbol: vid, name, min: -r, max: r, step, fraction: 12 };
  const op = subtract ? '−' : '+';
  const rel = `r = a ${op} b`;
  return {
    id,
    ...head,
    // The number sentence itself: −3.5 + 5 = ?
    equation: `{a} ${op} {b} = {r}`,
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
                `${sf(v.r!)} + ${v.b! < 0 ? `(${sf(v.b!)})` : sf(v.b!)} = ${sf(v.a!)}`,
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
              how:
                representation.kind === 'zeroPairs'
                  ? 'Pair each + counter with a − counter; each pair is 0. The counters left over are the sum.'
                  : 'Start at the first number; a positive number jumps right, a negative one left.',
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
  (() => {
    const d = quotient('d', 'a', 'b', [
      'Divide the sizes; the sign rule is the same as for multiplying.',
      'Multiply the quotient by b.',
      'Divide a by the quotient.',
    ]);
    return {
      ...d,
      relation: {
        ...d.relation,
        message: (v: Values) =>
          v.b === 0 ? 'Dividing by 0 has no answer: no number times 0 makes a.' : undefined,
      },
    };
  })(),
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

/** A count that comes out whole, allowing for a typed value rounded to what the box shows. */
const whole0 = (x: number | undefined) =>
  x !== undefined && Math.abs(x - Math.round(x)) < 1e-4 * Math.max(1, Math.abs(x))
    ? Math.round(x)
    : undefined;

/** p × x + q = r, solvable for any of the four (p only when it comes out whole). */
const twoStep: Relation = {
  id: 'px + q = r',
  display: '{p} × {x} + {q} = {r}',
  vars: ['p', 'x', 'q', 'r'],
  residual: (v: Values) => v.p! * v.x! + v.q! - v.r!,
  solve: {
    x: (v: Values) => q(v.r! - v.q!, v.p!),
    r: (v: Values) => exact(v.p! * v.x! + v.q!),
    q: (v: Values) => exact(v.r! - v.p! * v.x!),
    p: (v: Values) => whole0(q(v.r! - v.q!, v.x!)),
  },
};
/** x as the equation pages show it: twelfths as fractions. */
const xf = (x: number) => formatNumber(x, { fraction: 12 });
const twoStepSteps: Record<string, Record<string, StepText>> = {
  'px + q = r': {
    x: {
      expr: '({r} − {q}) ÷ {p}',
      how: 'Take q from both sides, then divide both sides by p.',
      work: (v: Values) => [
        `${v.q! < 0 ? `Add ${fmt(-v.q!)} to` : `Take ${fmt(v.q!)} from`} both sides: ${fmt(v.p!)}x = ${fmt(v.r! - v.q!)}`,
        `Divide both sides by ${fmt(v.p!)}: x = ${xf(v.x!)}`,
      ],
      written: false,
    },
    r: { expr: '{p} × {x} + {q}', how: 'Multiply, then add.' },
    q: { expr: '{r} − {p} × {x}', how: 'Take the x part away from the right side.' },
    p: { expr: '({r} − {q}) ÷ {x}', how: 'Take q from both sides, then divide by x.' },
  },
};

/** Whether the test number makes p × t + q (sign) r true; the signs are 1 <, 2 ≤, 3 >, 4 ≥. */
const holdsAt = (v: Values) => {
  const lhs = v.p! * v.t! + v.q!;
  return [lhs < v.r!, lhs <= v.r!, lhs > v.r!, lhs >= v.r!][v.s! - 1] ?? false;
};

/** copy = k × original: the copy's length from the scale factor. */
const scaledCopy = (copy: string, original: string) => ({
  relation: {
    id: `${copy} = k × ${original}`,
    display: `{${copy}} = {k} × {${original}}`,
    vars: [copy, 'k', original],
    residual: (v: Values) => v[copy]! - v.k! * v[original]!,
    solve: {
      [copy]: (v: Values) => exact(v.k! * v[original]!),
      k: (v: Values) => q(v[copy]!, v[original]!),
      [original]: () => undefined,
    },
  } satisfies Relation,
  steps: {
    [copy]: { expr: `{k} × {${original}}`, how: 'Multiply the length by the scale factor.' },
    k: { expr: `{${copy}} ÷ {${original}}`, how: 'Divide the copy’s length by the original’s.' },
  } satisfies Record<string, StepText>,
});

/** The picture's grid holds the original and its copy side by side (26 × 24 squares). */
const fitsGrid: Relation = {
  id: 'fits the grid',
  constraint: true,
  display: 'The original {w} by {h} and its copy at scale {k} fit side by side on the grid',
  vars: ['w', 'h', 'k'],
  residual: (v: Values) => (v.w! * (1 + v.k!) <= 26 && Math.max(v.h!, v.h! * v.k!) <= 24 ? 0 : 1),
  solve: {},
};

const length = (id: string, symbol: string, name: string, max: number, derived = false) => ({
  id,
  symbol,
  name,
  unit: 'cm',
  min: 0,
  max,
  step: 0.1,
  ...(derived ? { derived: true } : {}),
});

/** x = f(v), worked out only (its inputs are not solved back from it). */
function derive(
  id: string,
  x: string,
  inputs: string[],
  display: string,
  f: (v: Values) => number | undefined,
): Relation {
  return {
    id,
    display,
    vars: [x, ...inputs],
    residual: (v: Values) => v[x]! - (f(v) ?? NaN),
    solve: {
      [x]: (v: Values) => {
        const y = f(v);
        return y === undefined ? undefined : exact(y);
      },
      ...Object.fromEntries(inputs.map((i) => [i, () => undefined])),
    },
  };
}

/** A value longer than another (strictly). */
const longer = (big: string, small: string, display: string): Relation => ({
  id: `${big} > ${small}`,
  constraint: true,
  display,
  vars: [big, small],
  residual: (v: Values) => (v[big]! > v[small]! ? 0 : 1),
  solve: {},
});

/** A value no bigger than another. */
const atMost = (small: string, big: string): Relation => ({
  id: `${small} ≤ ${big}`,
  constraint: true,
  display: `{${small}} is at most {${big}}`,
  vars: [small, big],
  residual: (v: Values) => (v[small]! <= v[big]! ? 0 : 1),
  solve: {},
});

/** An angle in whole degrees. */
const degrees = (id: string, name: string, max = 180) => ({
  ...whole(id, id, name, 0, max),
  unit: '°',
});

/** a + b = whole (90 or 180): each angle is the whole less the other. */
function anglePair(total: 90 | 180, what: string) {
  const id = `a + b = ${total}`;
  return {
    relation: {
      id,
      display: `{a} + {b} = ${total}`,
      vars: ['a', 'b'],
      residual: (v: Values) => v.a! + v.b! - total,
      solve: { a: (v: Values) => total - v.b!, b: (v: Values) => total - v.a! },
    } satisfies Relation,
    steps: {
      [id]: {
        a: { expr: `${total} − {b}`, how: `${what} Take the other angle away from ${total}°.` },
        b: { expr: `${total} − {a}`, how: `${what} Take the other angle away from ${total}°.` },
      },
    } satisfies Record<string, Record<string, StepText>>,
  };
}
const straightPair = anglePair(180, 'The two angles make a straight line.');
const rightPair = anglePair(90, 'The two angles make a right angle.');

/** A length in centimeters, and a worked-out area or volume. */
const cmLength = (id: string, name: string) => ({
  id,
  symbol: id,
  name,
  unit: 'cm',
  min: 0.1,
  max: 100,
  step: 0.1,
});
const worked = (id: string, name: string, unit: 'cm²' | 'cm³') => ({
  id,
  symbol: id,
  name,
  unit,
  min: 0,
  max: 10000000,
  derived: true,
});

/** Two samples of up to 8 values each, counted by n. */
const SAMPLE_A = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'];
const SAMPLE_B = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8'];
const firstN = (ids: string[], v: Values) => ids.slice(0, v.n);
const meanOf = (ids: string[]) => (v: Values) =>
  firstN(ids, v).reduce((t, id) => t + v[id]!, 0) / v.n!;
const madOfSample = (ids: string[], mean: string) => (v: Values) =>
  firstN(ids, v).reduce((t, id) => t + Math.abs(v[id]! - v[mean]!), 0) / v.n!;

/** The pairs of two dice with a sum of s, as a list ("1 + 6, 2 + 5, …"). */
/** The pairs for each sum from s up to 12: 3, 2, 1 for s = 10. */
const sumsFrom = (s: number) =>
  Array.from({ length: 13 - s }, (_, i) => diceCount('sum', '=', s + i));
const dicePairs = (s: number) =>
  [1, 2, 3, 4, 5, 6].filter((a) => s - a >= 1 && s - a <= 6).map((a) => `${a} + ${s - a}`);

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
      { id: 'a', symbol: 'a', name: 'New amount', min: 0, max: 1100000, step: 0.01 },
      {
        id: 'c',
        symbol: 'c',
        name: 'Change',
        min: -100000,
        max: 300000,
        step: 0.01,
        derived: true,
      },
      { id: 'p', symbol: 'p', name: 'Percent change', unit: '%', min: -100, max: 1000, step: 0.1 },
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
      { id: 'm', symbol: 'm', name: 'Measured value', min: 0, max: 400000, step: 0.5 },
      { id: 'e', symbol: 'e', name: 'Error', min: 0, max: 300000, step: 0.01, derived: true },
      { id: 'p', symbol: 'p', name: 'Percent error', unit: '%', min: 0, max: 300, step: 0.01 },
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
    0.01,
  ),
  signedSum(
    'm.7.rational-operations~zero-pairs',
    {
      title: 'Adding with counters',
      use: 'Use this for “Show 3 + (−5) with counters.”',
    },
    false,
    [
      'A + counter is +1 and a − counter is −1.',
      'A + and a − together make a zero pair: 0. The counters left over are the sum.',
      'The sign of the sum is the sign of the counters left over.',
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
    0.01,
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
    id: 'm.7.rational-operations~fraction-to-decimal',
    title: 'Fractions as decimals',
    use: 'Use this for “Write 3/8 as a decimal” or “Which decimal is closest to 29/40?”',
    assumptions: [
      'A fraction is a division: numerator ÷ denominator.',
      'The decimal ends when a remainder is 0.',
      'It repeats when a remainder comes back: 1/3 = 0.333…, written with a bar over the 3.',
    ],
    variables: [
      whole('n', 'n', 'Numerator', 0, 99),
      whole('d', 'd', 'Denominator', 1, 99),
      {
        id: 'q',
        symbol: 'q',
        name: 'Decimal',
        min: 0,
        max: 99,
        repeating: true,
        derived: true,
      },
    ],
    relations: [
      {
        // The number line shows up to 24 wholes.
        id: 'n ≤ 24d',
        constraint: true,
        display: '{n} ÷ {d} is at most 24, so the number line can show it',
        vars: ['n', 'd'],
        residual: (v: Values) => (v.n! <= 24 * v.d! ? 0 : 1),
        solve: {},
      },
      {
        ...derive('q = n ÷ d', 'q', ['n', 'd'], '{q} = {n} ÷ {d}', (v) => v.n! / v.d!),
        check: (v: Values) => `${fmt(v.q! * v.d!)} = ${v.n}`,
      },
    ],
    steps: {
      'n ≤ 24d': {},
      'q = n ÷ d': {
        q: {
          expr: '{n} ÷ {d}',
          how: (v: Values) =>
            (decimalDigits(v.n! / v.d!, 999)?.repeat ?? '') === ''
              ? 'Divide the numerator by the denominator, adding zeros after the point until the remainder is 0.'
              : 'Divide the numerator by the denominator. A remainder comes back, so the digits after it repeat.',
          written: (v: Values) => decimalLongDivision(v.n!, v.d!, 8, true),
        },
      },
    },
    example: { n: 3, d: 8, q: 0.375 },
    startWith: ['n', 'd'],
    equation: '{n}/{d} = {q}',
    representation: {
      kind: 'fractionLine',
      numerator: 'n',
      denominator: 'd',
      wholes: 1,
    },
  },

  // ── Two-step equations and inequalities (7.EE.4) ──
  {
    id: 'm.7.two-step-equations',
    assumptions: [
      'Every block weighs the same unknown amount x; every small weight weighs 1.',
      'The hanger is level when both sides weigh the same: that is what = means.',
      'Take the same from both sides, then share what is left among the blocks.',
      'Check by putting x back in.',
    ],
    variables: [
      whole('p', 'p', 'Blocks', 1, 8),
      whole('q', 'q', 'Weights with the blocks', 0, 20),
      whole('r', 'r', 'Weights on the right', 0, 40),
      { id: 'x', symbol: 'x', name: 'Block weight', min: 0, max: 40, step: 0.5, fraction: 12 },
    ],
    relations: [twoStep],
    steps: twoStepSteps,
    example: { p: 3, q: 2, r: 11, x: 3 },
    startWith: ['p', 'q', 'r'],
    equation: '{p}x + {q} = {r}',
    representation: {
      kind: 'hanger',
      unknown: 'x',
      left: { x: 'p', units: 'q' },
      right: { units: 'r' },
      steps: true,
    },
  },
  {
    id: 'm.7.two-step-equations~negatives',
    title: 'px + q = r with negative numbers',
    use: 'Use this for “3x − 5 = 20” and “15 + 3x = 42”.',
    assumptions: [
      'The bar is p equal boxes of x and a piece q, together as long as r.',
      'A negative q is a piece taken off the end of the boxes.',
      'Undo the adding first, then the multiplying.',
    ],
    variables: [
      whole('p', 'p', 'Boxes', 1, 12),
      whole('q', 'q', 'Added', -50, 50),
      whole('r', 'r', 'Total', 0, 200),
      { id: 'x', symbol: 'x', name: 'One box', min: 0.5, max: 100, step: 0.5, fraction: 12 },
    ],
    relations: [twoStep],
    steps: twoStepSteps,
    example: { p: 3, q: -5, r: 16, x: 7 },
    startWith: ['p', 'q', 'r'],
    equation: '{p}x + {q} = {r}',
    representation: {
      kind: 'tape',
      equation: { times: 'p', unknown: 'x', plus: 'q', total: 'r' },
    },
  },
  {
    id: 'm.7.two-step-equations~grouped',
    title: 'p(x + q) = r',
    use: 'Use this for “3 boxes, 15 markers given from each, 90 left: how many were in a box?”',
    assumptions: [
      'The bar is p equal groups, each x and q, together as long as r.',
      'A negative q makes each group x less q: one box says x − 15.',
      'Divide by p first for one group, or multiply out first: both work.',
    ],
    variables: [
      whole('p', 'p', 'Groups', 1, 12),
      whole('q', 'q', 'Added to each', -50, 50),
      whole('r', 'r', 'Total', 1, 300),
      { id: 'x', symbol: 'x', name: 'Unknown', min: 0.5, max: 100, step: 0.5, fraction: 12 },
    ],
    relations: [
      {
        id: 'p(x + q) = r',
        display: '{p} × ({x} + {q}) = {r}',
        vars: ['p', 'x', 'q', 'r'],
        residual: (v: Values) => v.p! * (v.x! + v.q!) - v.r!,
        solve: {
          x: (v: Values) => {
            const each = q(v.r!, v.p!);
            return each === undefined ? undefined : exact(each - v.q!);
          },
          r: (v: Values) => exact(v.p! * (v.x! + v.q!)),
          q: (v: Values) => {
            const each = q(v.r!, v.p!);
            return each === undefined ? undefined : exact(each - v.x!);
          },
          p: (v: Values) => whole0(q(v.r!, v.x! + v.q!)),
        },
      },
    ],
    steps: {
      'p(x + q) = r': {
        x: {
          expr: '{r} ÷ {p} − {q}',
          how: 'Divide both sides by p, then take q from both sides.',
          work: (v: Values) => [
            `Divide both sides by ${fmt(v.p!)}: x + ${v.q! < 0 ? `(${fmt(v.q!)})` : fmt(v.q!)} = ${xf(v.r! / v.p!)}`,
            `${v.q! < 0 ? `Add ${fmt(-v.q!)} to` : `Take ${fmt(v.q!)} from`} both sides: x = ${xf(v.x!)}`,
          ],
          written: false,
        },
        r: { expr: '{p} × ({x} + {q})', how: 'Add inside the brackets, then multiply.' },
        q: { expr: '{r} ÷ {p} − {x}', how: 'Divide by p for one group, then take away x.' },
        p: { expr: '{r} ÷ ({x} + {q})', how: 'Divide the total by one group.' },
      },
    },
    example: { p: 3, q: -15, r: 90, x: 45 },
    startWith: ['p', 'q', 'r'],
    equation: '{p}(x + {q}) = {r}',
    representation: {
      kind: 'tape',
      equation: { times: 'p', unknown: 'x', plus: 'q', total: 'r', grouped: true },
    },
  },
  {
    id: 'm.7.two-step-equations~inequality',
    title: 'Two-step inequalities',
    use: 'Use this for “Solve −2x + 1 ≤ 7 and graph it” and “What is the least whole number x with 2x > 11?”',
    assumptions: [
      'Adding or taking the same number from both sides keeps an inequality true.',
      'Dividing both sides by a negative number flips the sign (< becomes >).',
      'A test number is a solution when it makes the written inequality true.',
      'The least whole number above a bound is the next whole number up.',
    ],
    variables: [
      whole('p', 'p', 'Times x', -10, 10),
      whole('q', 'q', 'Added', -500, 500),
      whole('r', 'r', 'Right side', -1000, 1000),
      whole('s', 's', 'Sign (1 <, 2 ≤, 3 >, 4 ≥)', 1, 4),
      { id: 'b', symbol: 'b', name: 'Bound', min: -1500, max: 1500, derived: true },
      whole('t', 't', 'Test number', -200, 200),
      { ...whole('h', 'h', 'True (1) or false (0)', 0, 1), derived: true },
    ],
    relations: [
      {
        id: 'p ≠ 0',
        constraint: true,
        display: '{p} is not 0',
        vars: ['p'],
        residual: (v: Values) => (v.p! !== 0 ? 0 : 1),
        solve: {},
      },
      {
        id: 'b = (r − q) ÷ p',
        display: '{b} = ({r} − {q}) ÷ {p}',
        vars: ['b', 'r', 'q', 'p'],
        residual: (v: Values) => v.b! * v.p! - (v.r! - v.q!),
        solve: {
          b: (v: Values) => q(v.r! - v.q!, v.p!),
          r: (v: Values) => exact(v.b! * v.p! + v.q!),
          q: (v: Values) => exact(v.r! - v.b! * v.p!),
          p: () => undefined,
        },
      },
      {
        id: 'h = test',
        display: 'test {t} in {p}x + {q}, sign {s}, {r}: {h}',
        words: '{t} put in for x: {h}',
        check: (v: Values) => `${holdsAt(v) ? 1 : 0} = ${v.h}`,
        vars: ['h', 't', 's', 'p', 'q', 'r'],
        residual: (v: Values) => ([1, 2, 3, 4].includes(v.s!) ? v.h! - (holdsAt(v) ? 1 : 0) : NaN),
        solve: {
          h: (v: Values) => (holdsAt(v) ? 1 : 0),
          t: () => undefined,
          s: () => undefined,
          p: () => undefined,
          q: () => undefined,
          r: () => undefined,
        },
      },
    ],
    steps: {
      'p ≠ 0': {},
      'b = (r − q) ÷ p': {
        b: {
          expr: '({r} − {q}) ÷ {p}',
          how: 'Take q from both sides, then divide both sides by p.',
          work: (v: Values) => {
            // No sign tapped yet: the lines wait for it.
            if (v.s === undefined) return [];
            const sign = '<≤>≥'[v.s! - 1]!;
            const flipped =
              v.p! < 0 ? ({ '<': '>', '≤': '≥', '>': '<', '≥': '≤' }[sign] ?? sign) : sign;
            const rest = v.r! - v.q!;
            return [
              `${v.q! < 0 ? `Add ${fmt(-v.q!)} to` : `Take ${fmt(v.q!)} from`} both sides: ${fmt(v.p!)}x ${sign} ${fmt(rest)}`,
              v.p! < 0
                ? `Divide both sides by ${fmt(v.p!)}, a negative, so ${sign} flips to ${flipped}: x ${flipped} ${fmt(v.b!)}`
                : `Divide both sides by ${fmt(v.p!)}: x ${sign} ${fmt(v.b!)}`,
            ];
          },
          written: false,
        },
        r: { expr: '{b} × {p} + {q}', how: 'Undo the steps: multiply, then add.' },
        q: { expr: '{r} − {b} × {p}', how: 'Take the x part from the right side.' },
      },
      'h = test': {
        h: {
          expr: (v: Values) => `${holdsAt(v) ? 1 : 0}`,
          how: 'Put the test number in for x. True is 1, false is 0.',
          work: (v: Values) => {
            const pt = v.p! * v.t!;
            const lhs = pt + v.q!;
            return [
              `${fmt(v.p!)} × ${v.t! < 0 ? `(${fmt(v.t!)})` : fmt(v.t!)} = ${fmt(pt)}`,
              `${pt < 0 ? `(${fmt(pt)})` : fmt(pt)} ${v.q! < 0 ? '−' : '+'} ${fmt(Math.abs(v.q!))} = ${fmt(lhs)}`,
              `${fmt(lhs)} ${'<≤>≥'[v.s! - 1]} ${fmt(v.r!)} is ${holdsAt(v) ? 'true' : 'false'}`,
            ];
          },
          written: false,
        },
      },
    },
    example: { p: -2, q: 1, r: 7, s: 2, b: -3, t: 1, h: 1 },
    startWith: ['p', 'q', 'r', 's', 't'],
    // The sign is a box to tap through <, ≤, >, ≥ (1–4, as s stores it).
    equation: '{p}x + {q} {s:sign} {r}',
    representation: {
      kind: 'integerLine',
      value: 'b',
      min: -8,
      max: 8,
      inequality: { sign: 's', test: 't', twoStep: { times: 'p', plus: 'q', total: 'r' } },
    },
  },

  // ── Scale drawings (7.G.1) ──
  {
    id: 'm.7.scale-drawings',
    assumptions: [
      'A scale says what 1 unit on the drawing stands for: 1 in represents 4 ft.',
      'Every length on the drawing is multiplied by the same scale.',
      'The scale factor has no units: both lengths in inches, then actual ÷ drawing.',
      'Angles do not change.',
    ],
    variables: [
      {
        id: 's',
        symbol: 's',
        name: 'Feet for 1 inch on the drawing',
        min: 0.1,
        max: 10000,
        step: 0.1,
      },
      {
        id: 'd',
        symbol: 'd',
        name: 'Length on the drawing',
        unit: 'in',
        units: ['in'],
        min: 0.1,
        max: 100,
        step: 0.05,
      },
      {
        id: 'a',
        symbol: 'a',
        name: 'Actual length',
        unit: 'ft',
        units: ['ft'],
        min: 0.1,
        max: 1000000,
        step: 0.1,
      },
      { id: 'k', symbol: 'k', name: 'Scale factor', min: 1.2, max: 120000, derived: true },
    ],
    relations: [
      {
        id: 'a = s × d',
        display: '{a} = {s} × {d}',
        vars: ['a', 's', 'd'],
        residual: (v: Values) => v.a! - v.s! * v.d!,
        solve: {
          a: (v: Values) => exact(v.s! * v.d!),
          s: (v: Values) => q(v.a!, v.d!),
          d: (v: Values) => q(v.a!, v.s!),
        },
      },
      {
        id: 'k = 12 × s',
        display: '{k} = 12 × {s}',
        vars: ['k', 's'],
        residual: (v: Values) => v.k! - 12 * v.s!,
        solve: { k: (v: Values) => exact(12 * v.s!), s: (v: Values) => q(v.k!, 12) },
      },
    ],
    steps: {
      'a = s × d': {
        a: { expr: '{s} × {d}', how: 'Each inch on the drawing stands for s feet.' },
        s: { expr: '{a} ÷ {d}', how: 'The feet that one inch of the drawing stands for.' },
        d: { expr: '{a} ÷ {s}', how: 'Divide the actual length by the feet for each inch.' },
      },
      'k = 12 × s': {
        k: {
          expr: '12 × {s}',
          how: 'Put both lengths in inches: s feet is 12 × s inches for every inch drawn.',
        },
        s: { expr: '{k} ÷ 12', how: 'Divide the scale factor by 12 inches in a foot.' },
      },
    },
    example: { s: 4, d: 2.75, a: 11, k: 48 },
    startWith: ['s', 'd'],
    representation: { kind: 'doubleNumberLine', top: 'd', bottom: 'a', per: 's', ticks: 4 },
  },
  {
    id: 'm.7.scale-drawings~map-miles',
    title: 'Map distances in miles',
    use: 'Use this for “On a map, 1 inch represents 15 miles. Two towns are 3.5 inches apart. How far apart are they?”',
    unitSystems: ['us'],
    assumptions: [
      'A map scale says what 1 in on the map stands for: 1 in represents 15 mi.',
      'Every distance on the map is multiplied by the same number.',
      'Measure the map distance, then multiply by the mi for each in.',
    ],
    variables: [
      {
        id: 's',
        symbol: 's',
        name: 'Miles for 1 inch on the map',
        min: 0.01,
        max: 10000,
        step: 0.01,
      },
      {
        id: 'd',
        symbol: 'd',
        name: 'Distance on the map',
        unit: 'in',
        units: ['in'],
        min: 0.1,
        max: 100,
        step: 0.05,
      },
      {
        id: 'a',
        symbol: 'a',
        name: 'Actual distance',
        unit: 'mi',
        units: ['mi'],
        min: 0.01,
        max: 1000000,
        step: 0.01,
      },
    ],
    relations: [
      {
        id: 'a = s × d',
        display: '{a} = {s} × {d}',
        vars: ['a', 's', 'd'],
        residual: (v: Values) => v.a! - v.s! * v.d!,
        solve: {
          a: (v: Values) => exact(v.s! * v.d!),
          s: (v: Values) => q(v.a!, v.d!),
          d: (v: Values) => q(v.a!, v.s!),
        },
      },
    ],
    steps: {
      'a = s × d': {
        a: { expr: '{s} × {d}', how: 'Each in on the map stands for s mi.' },
        s: { expr: '{a} ÷ {d}', how: 'The mi that one in of the map stands for.' },
        d: { expr: '{a} ÷ {s}', how: 'Divide the actual distance by the mi for each in.' },
      },
    },
    example: { s: 15, d: 3.5, a: 52.5 },
    startWith: ['s', 'd'],
    representation: { kind: 'doubleNumberLine', top: 'd', bottom: 'a', per: 's', ticks: 4 },
  },
  {
    id: 'm.7.scale-drawings~map-km',
    title: 'Map distances in kilometers',
    use: 'Use this for “On a map, 1 cm represents 5 km. How far is a 7.2 cm route?”',
    unitSystems: ['metric'],
    assumptions: [
      'A map scale says what 1 cm on the map stands for: 1 cm represents 5 km.',
      'Every distance on the map is multiplied by the same number.',
      'Measure the map distance, then multiply by the km for each cm.',
    ],
    variables: [
      {
        id: 's',
        symbol: 's',
        name: 'Kilometers for 1 cm on the map',
        min: 0.01,
        max: 10000,
        step: 0.01,
      },
      {
        id: 'd',
        symbol: 'd',
        name: 'Distance on the map',
        unit: 'cm',
        units: ['cm'],
        min: 0.1,
        max: 100,
        step: 0.05,
      },
      {
        id: 'a',
        symbol: 'a',
        name: 'Actual distance',
        unit: 'km',
        units: ['km'],
        min: 0.01,
        max: 1000000,
        step: 0.01,
      },
    ],
    relations: [
      {
        id: 'a = s × d',
        display: '{a} = {s} × {d}',
        vars: ['a', 's', 'd'],
        residual: (v: Values) => v.a! - v.s! * v.d!,
        solve: {
          a: (v: Values) => exact(v.s! * v.d!),
          s: (v: Values) => q(v.a!, v.d!),
          d: (v: Values) => q(v.a!, v.s!),
        },
      },
    ],
    steps: {
      'a = s × d': {
        a: { expr: '{s} × {d}', how: 'Each cm on the map stands for s km.' },
        s: { expr: '{a} ÷ {d}', how: 'The km that one cm of the map stands for.' },
        d: { expr: '{a} ÷ {s}', how: 'Divide the actual distance by the km for each cm.' },
      },
    },
    example: { s: 5, d: 7.2, a: 36.0 },
    startWith: ['s', 'd'],
    representation: { kind: 'doubleNumberLine', top: 'd', bottom: 'a', per: 's', ticks: 4 },
  },
  {
    id: 'm.7.scale-drawings~scaled-copy',
    title: 'Scaled copies on a grid',
    use: 'Use this for “A 5 by 3 photo is enlarged to 10 long. How wide is it?”',
    assumptions: [
      'A scaled copy multiplies every length by the same scale factor.',
      'Its angles stay the same, so the copy has the same shape.',
      'A factor under 1 makes a smaller copy.',
    ],
    variables: [
      { id: 'k', symbol: 'k', name: 'Scale factor', min: 0.25, max: 4, step: 0.25 },
      whole('w', 'w', 'Width', 1, 12),
      whole('h', 'h', 'Height', 1, 12),
      { id: 'W', symbol: 'W', name: 'Copy width', min: 0, max: 48, derived: true },
      { id: 'H', symbol: 'H', name: 'Copy height', min: 0, max: 48, derived: true },
    ],
    relations: [fitsGrid, scaledCopy('W', 'w').relation, scaledCopy('H', 'h').relation],
    steps: {
      'fits the grid': {},
      [scaledCopy('W', 'w').relation.id]: scaledCopy('W', 'w').steps,
      [scaledCopy('H', 'h').relation.id]: scaledCopy('H', 'h').steps,
    },
    example: { k: 2, w: 5, h: 3, W: 10, H: 6 },
    startWith: ['k', 'w', 'h'],
    representation: {
      kind: 'scaleCopy',
      factor: 'k',
      width: 'w',
      height: 'h',
      copyWidth: 'W',
      copyHeight: 'H',
      shape: 'L',
    },
  },
  {
    id: 'm.7.scale-drawings~area',
    title: 'Scale factor and area',
    use: 'Use this for “A triangle has area 6. Its copy has scale factor 2. What is the copy’s area?”',
    assumptions: [
      'Every length of the copy is k times the original’s.',
      'The copy is k times as wide and k times as tall: k × k times the area.',
      'A scale factor of 3 makes 9 times the area, not 3 times.',
    ],
    variables: [
      { id: 'k', symbol: 'k', name: 'Scale factor', min: 0.25, max: 4, step: 0.25 },
      whole('w', 'w', 'Base', 1, 12),
      whole('h', 'h', 'Height', 1, 12),
      { id: 'A', symbol: 'A', name: 'Area', min: 0, max: 72, derived: true },
      { id: 'B', symbol: 'B', name: 'Copy area', min: 0, max: 1152, derived: true },
    ],
    relations: [
      fitsGrid,
      {
        id: 'A = w × h ÷ 2',
        display: '{A} = {w} × {h} ÷ 2',
        vars: ['A', 'w', 'h'],
        residual: (v: Values) => v.A! - (v.w! * v.h!) / 2,
        solve: {
          A: (v: Values) => (v.w! * v.h!) / 2,
          w: () => undefined,
          h: () => undefined,
        },
      },
      {
        id: 'B = A × k²',
        display: '{B} = {A} × {k} × {k}',
        vars: ['B', 'A', 'k'],
        residual: (v: Values) => v.B! - v.A! * v.k! * v.k!,
        solve: {
          B: (v: Values) => exact(v.A! * v.k! * v.k!),
          A: () => undefined,
          k: () => undefined,
        },
      },
    ],
    steps: {
      'fits the grid': {},
      'A = w × h ÷ 2': {
        A: { expr: '{w} × {h} ÷ 2', how: 'A triangle is half of its base times its height.' },
      },
      'B = A × k²': {
        B: {
          expr: '{A} × {k} × {k}',
          how: 'The copy is k times as wide and k times as tall: k × k times the area.',
        },
      },
    },
    example: { k: 2, w: 4, h: 3, A: 6, B: 24 },
    startWith: ['k', 'w', 'h'],
    representation: {
      kind: 'scaleCopy',
      factor: 'k',
      width: 'w',
      height: 'h',
      area: ['A', 'B'],
      shape: 'triangle',
    },
  },

  // ── Circumference and area of circles (7.G.4) ──
  {
    id: 'm.7.circles',
    assumptions: [
      'Every point on the circle is the same distance, the radius, from the center.',
      'π is the circumference divided by the diameter of any circle: about 3.14.',
      'Cut into wedges and laid top and bottom, a circle is close to a parallelogram half the circumference long and a radius tall.',
      'Area is in square units.',
    ],
    standalone: {
      vars: ['n'],
      why: 'How many wedges the circle is cut into changes only the picture, not the area.',
    },
    variables: [
      { ...length('r', 'r', 'Radius', 1000), step: 0.5 },
      length('d', 'd', 'Diameter', 2000),
      { ...length('C', 'C', 'Circumference', 6300), pi: true },
      { ...length('A', 'A', 'Area', 3200000), unit: 'cm²', pi: true },
      { ...whole('n', 'n', 'Wedges', 4, 24), allowed: [4, 6, 8, 10, 12, 16, 20, 24] },
    ],
    relations: [
      {
        id: 'd = 2r',
        display: '{d} = 2 × {r}',
        vars: ['d', 'r'],
        residual: (v: Values) => v.d! - 2 * v.r!,
        solve: { d: (v: Values) => 2 * v.r!, r: (v: Values) => v.d! / 2 },
      },
      {
        id: 'C = πd',
        display: '{C} = π × {d}',
        vars: ['C', 'd'],
        residual: (v: Values) => v.C! - Math.PI * v.d!,
        solve: { C: (v: Values) => Math.PI * v.d!, d: (v: Values) => v.C! / Math.PI },
      },
      {
        id: 'A = πr²',
        display: '{A} = π × {r}²',
        vars: ['A', 'r'],
        residual: (v: Values) => v.A! - Math.PI * v.r! ** 2,
        solve: {
          A: (v: Values) => Math.PI * v.r! ** 2,
          r: (v: Values) => Math.sqrt(v.A! / Math.PI),
        },
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
      'A = πr²': {
        A: { expr: 'π × {r}²', how: 'Square the radius, then multiply by π.' },
        r: {
          expr: '√({A} ÷ π)',
          how: 'Divide both sides by π, then take the square root (a radius is never negative).',
          work: (v: Values) => [
            `r² = ${formatNumber(v.A!, { pi: true })} ÷ π = ${fmt(Number((v.r! ** 2).toPrecision(12)))}`,
          ],
        },
      },
    },
    example: { r: 3, d: 6, C: 6 * Math.PI, A: 9 * Math.PI, n: 8 },
    startWith: ['r', 'n'],
    representation: {
      kind: 'circle',
      radius: 'r',
      extent: 5,
      diameter: 'd',
      circumference: 'C',
      area: 'A',
      views: ['radius', 'unroll', 'wedges'],
      wedges: 'n',
    },
  },
  {
    id: 'm.7.circles~wheel',
    title: 'Circumference and wheels',
    use: 'Use this for “A 27-inch wheel turns 15 times. How far does the bike go?”',
    assumptions: [
      'One turn of a wheel rolls it one circumference along the ground.',
      'The distance is the circumference times the number of turns.',
      'Use the diameter of the whole wheel, tire included.',
    ],
    variables: [
      { id: 'd', symbol: 'd', name: 'Diameter', unit: 'in', min: 1, max: 100, step: 0.5 },
      { id: 'r', symbol: 'r', name: 'Radius', unit: 'in', min: 0.5, max: 50, derived: true },
      { id: 'C', symbol: 'C', name: 'Circumference', unit: 'in', min: 0, max: 320, derived: true },
      { id: 'n', symbol: 'n', name: 'Turns', min: 0, max: 10000, step: 0.5 },
      { id: 'L', symbol: 'L', name: 'Distance rolled', unit: 'in', min: 0, max: 3200000 },
    ],
    relations: [
      {
        id: 'r = d ÷ 2',
        display: '{r} = {d} ÷ 2',
        vars: ['r', 'd'],
        residual: (v: Values) => 2 * v.r! - v.d!,
        solve: { r: (v: Values) => v.d! / 2, d: (v: Values) => 2 * v.r! },
      },
      {
        id: 'C = πd',
        display: '{C} = π × {d}',
        vars: ['C', 'd'],
        residual: (v: Values) => v.C! - Math.PI * v.d!,
        solve: { C: (v: Values) => Math.PI * v.d!, d: (v: Values) => v.C! / Math.PI },
      },
      {
        id: 'L = C × n',
        display: '{L} = {C} × {n}',
        vars: ['L', 'C', 'n'],
        residual: (v: Values) => v.L! - v.C! * v.n!,
        solve: {
          L: (v: Values) => v.C! * v.n!,
          C: (v: Values) => q(v.L!, v.n!),
          n: (v: Values) => q(v.L!, v.C!),
        },
      },
    ],
    steps: {
      'r = d ÷ 2': {
        r: { expr: '{d} ÷ 2', how: 'The radius is half the diameter.' },
        d: { expr: '2 × {r}', how: 'The diameter is two radii.' },
      },
      'C = πd': {
        C: { expr: 'π × {d}', how: 'One turn rolls one circumference: π times the diameter.' },
        d: { expr: '{C} ÷ π', how: 'Divide the circumference by π.' },
      },
      'L = C × n': {
        L: { expr: '{C} × {n}', how: 'Each turn rolls one circumference: multiply by the turns.' },
        C: { expr: '{L} ÷ {n}', how: 'Divide the distance by the turns.' },
        n: { expr: '{L} ÷ {C}', how: 'Divide the distance by one circumference.' },
      },
    },
    example: { d: 27, r: 13.5, C: 27 * Math.PI, n: 15, L: 405 * Math.PI },
    startWith: ['d', 'n'],
    representation: {
      kind: 'circle',
      radius: 'r',
      extent: 50,
      diameter: 'd',
      circumference: 'C',
      views: ['unroll'],
    },
  },
  {
    id: 'm.7.circles~in-a-square',
    title: 'A circle in a square',
    use: 'Use this for “A circle of radius 3 is inside a square. What area is left in the corners?”',
    assumptions: [
      'The circle touches all four sides, so the square’s side is the diameter: 2r.',
      'The area left in the corners is the square’s area minus the circle’s.',
      'The corners are always about 21% of the square, whatever its size.',
    ],
    variables: [
      { ...length('r', 'r', 'Radius', 100), step: 0.5, min: 0.5 },
      length('s', 's', 'Side of the square', 200, true),
      { ...length('Q', 'Q', 'Area of the square', 40000, true), unit: 'cm²' },
      { ...length('A', 'A', 'Area of the circle', 31500, true), unit: 'cm²' },
      { ...length('L', 'L', 'Area left in the corners', 8600, true), unit: 'cm²' },
    ],
    relations: [
      {
        id: 's = 2r',
        display: '{s} = 2 × {r}',
        vars: ['s', 'r'],
        residual: (v: Values) => v.s! - 2 * v.r!,
        solve: { s: (v: Values) => 2 * v.r!, r: (v: Values) => v.s! / 2 },
      },
      {
        id: 'Q = s²',
        display: '{Q} = {s}²',
        vars: ['Q', 's'],
        residual: (v: Values) => v.Q! - v.s! ** 2,
        solve: { Q: (v: Values) => v.s! ** 2, s: (v: Values) => Math.sqrt(v.Q!) },
      },
      {
        id: 'A = πr²',
        display: '{A} = π × {r}²',
        vars: ['A', 'r'],
        residual: (v: Values) => v.A! - Math.PI * v.r! ** 2,
        solve: {
          A: (v: Values) => Math.PI * v.r! ** 2,
          r: (v: Values) => Math.sqrt(v.A! / Math.PI),
        },
      },
      {
        id: 'L = Q − A',
        display: '{L} = {Q} − {A}',
        vars: ['L', 'Q', 'A'],
        residual: (v: Values) => v.L! - v.Q! + v.A!,
        solve: {
          L: (v: Values) => v.Q! - v.A!,
          Q: (v: Values) => v.L! + v.A!,
          A: (v: Values) => v.Q! - v.L!,
        },
      },
    ],
    steps: {
      's = 2r': {
        s: { expr: '2 × {r}', how: 'The circle touches both sides: the side is a diameter.' },
        r: { expr: '{s} ÷ 2', how: 'Half the side.' },
      },
      'Q = s²': {
        Q: { expr: '{s}²', how: 'A square’s area is its side times itself.' },
        s: { expr: '√{Q}', how: 'The side is the square root of the area.' },
      },
      'A = πr²': {
        A: { expr: 'π × {r}²', how: 'Square the radius, then multiply by π.' },
        r: {
          expr: '√({A} ÷ π)',
          how: 'Divide by π, then take the square root.',
          work: (v: Values) => [
            `r² = ${formatNumber(v.A!, { pi: true })} ÷ π = ${fmt(Number((v.r! ** 2).toPrecision(12)))}`,
          ],
        },
      },
      'L = Q − A': {
        L: { expr: '{Q} − {A}', how: 'Take the circle’s area from the square’s.' },
        Q: { expr: '{L} + {A}', how: 'The corners and the circle make the square.' },
        A: { expr: '{Q} − {L}', how: 'The square less its corners.' },
      },
    },
    example: { r: 3, s: 6, Q: 36, A: 9 * Math.PI, L: 36 - 9 * Math.PI },
    startWith: ['r'],
    pictureLabels: ['s', 'Q', 'L'],
    representation: { kind: 'circle', radius: 'r', extent: 5, area: 'A' },
  },
  {
    id: 'm.7.circles~pi-graph',
    title: 'Circumference is proportional to diameter',
    use: 'Use this for “The graph of C against d passes through (1, π). Name three more points.”',
    assumptions: [
      'Every circle’s circumference is π times its diameter, so C and d are proportional.',
      'π is the constant of proportionality: the graph is a line through (0, 0) and (1, π).',
      'π is about 3.14, so a circle is a little more than 3 diameters around.',
    ],
    variables: [
      { id: 'd', symbol: 'd', name: 'Diameter', min: 0.5, max: 20, step: 0.5 },
      { id: 'C', symbol: 'C', name: 'Circumference', min: 0, max: 63, pi: true },
      {
        id: 'k',
        symbol: 'k',
        name: 'Constant of proportionality',
        min: 3,
        max: 3.2,
        pi: true,
        derived: true,
      },
    ],
    relations: [
      {
        id: 'C = πd',
        display: '{C} = π × {d}',
        vars: ['C', 'd'],
        residual: (v: Values) => v.C! - Math.PI * v.d!,
        solve: { C: (v: Values) => Math.PI * v.d!, d: (v: Values) => v.C! / Math.PI },
      },
      {
        id: 'k = C ÷ d',
        display: '{k} = {C} ÷ {d}',
        vars: ['k', 'C', 'd'],
        residual: (v: Values) => v.k! * v.d! - v.C!,
        solve: { k: (v: Values) => q(v.C!, v.d!), C: () => undefined, d: () => undefined },
      },
    ],
    steps: {
      'C = πd': {
        C: { expr: 'π × {d}', how: 'Circumference is π times the diameter.' },
        d: { expr: '{C} ÷ π', how: 'Divide the circumference by π.' },
      },
      'k = C ÷ d': {
        k: { expr: '{C} ÷ {d}', how: 'Circumference ÷ diameter is the same for every circle.' },
      },
    },
    example: { d: 2, C: 2 * Math.PI, k: Math.PI },
    startWith: ['d'],
    representation: {
      kind: 'plot',
      x: { var: 'd', min: 0, max: 6 },
      y: { var: 'C', min: 0, max: 20 },
      params: ['k'],
      autoRange: true,
      unitRate: 'k',
      table: [0, 1, 2, 3],
    },
  },

  // ── Angle relationships (7.G.5) ──
  {
    id: 'm.7.angle-relationships',
    assumptions: [
      'The two angles share a vertex and a ray; their outer rays make a straight line.',
      'Angles that add to 180° are supplementary.',
      'Adjacent angles share a vertex and a ray and do not overlap.',
    ],
    variables: [
      { ...degrees('a', 'First angle', 179), min: 1 },
      { ...degrees('b', 'Second angle', 179), min: 1 },
    ],
    relations: [straightPair.relation],
    steps: straightPair.steps,
    example: { a: 115, b: 65 },
    startWith: ['a'],
    equation: '{a}° + {b}° = 180°',
    representation: { kind: 'angles', parts: ['a', 'b'], whole: 180 },
  },
  {
    id: 'm.7.angle-relationships~complementary',
    title: 'Complementary angles',
    use: 'Use this for “Two angles make a right angle. One is 35°. What is the other?”',
    assumptions: [
      'The two angles share a ray and together make a right angle.',
      'Angles that add to 90° are complementary.',
    ],
    variables: [
      { ...degrees('a', 'First angle', 89), min: 1 },
      { ...degrees('b', 'Second angle', 89), min: 1 },
    ],
    relations: [rightPair.relation],
    steps: rightPair.steps,
    example: { a: 35, b: 55 },
    startWith: ['a'],
    equation: '{a}° + {b}° = 90°',
    representation: { kind: 'angles', parts: ['a', 'b'], whole: 90 },
  },
  {
    id: 'm.7.angle-relationships~vertical',
    title: 'Vertical angles',
    use: 'Use this for “Two lines cross. One angle is 50°. Find the other three.”',
    assumptions: [
      'Two straight lines cross at one point and make four angles.',
      'Angles next to each other on a line add to 180°.',
      'Angles across from each other are vertical angles: they are equal.',
    ],
    variables: [
      { ...degrees('a', 'Angle a', 179), min: 1 },
      { ...degrees('b', 'Angle beside it', 179), min: 1 },
      { ...degrees('c', 'Angle across from a', 179), min: 1 },
    ],
    relations: [
      straightPair.relation,
      {
        id: 'c = a',
        display: '{c} = {a}',
        vars: ['c', 'a'],
        residual: (v: Values) => v.c! - v.a!,
        solve: { c: (v: Values) => v.a!, a: (v: Values) => v.c! },
      },
    ],
    steps: {
      ...straightPair.steps,
      'c = a': {
        c: { expr: '{a}', how: 'Vertical angles are across from each other, so they are equal.' },
        a: { expr: '{c}', how: 'Vertical angles are across from each other, so they are equal.' },
      },
    },
    example: { a: 50, b: 130, c: 50 },
    startWith: ['a'],
    representation: { kind: 'angles', parts: ['a', 'b'], whole: 180, cross: { first: 'c' } },
  },
  {
    id: 'm.7.angle-relationships~equation',
    title: 'Unknown angles with an equation',
    use: 'Use this for “Two supplementary angles: one is twice the other. Find both.”',
    assumptions: [
      'Call the smaller angle a. The bigger one is k times as big: k × a.',
      'Together they make a straight line: a + k × a = 180, so (1 + k) × a = 180.',
      'Divide 180 by 1 + k for the smaller angle.',
    ],
    variables: [
      { id: 'k', symbol: 'k', name: 'Times as big', min: 1, max: 10, step: 0.5 },
      { id: 'a', symbol: 'a', name: 'Smaller angle', unit: '°', min: 0, max: 90, derived: true },
      { id: 'b', symbol: 'b', name: 'Bigger angle', unit: '°', min: 0, max: 180, derived: true },
    ],
    relations: [
      {
        id: 'a = 180 ÷ (1 + k)',
        display: '{a} = 180 ÷ (1 + {k})',
        vars: ['a', 'k'],
        residual: (v: Values) => v.a! * (1 + v.k!) - 180,
        solve: { a: (v: Values) => exact(180 / (1 + v.k!)), k: (v: Values) => q(180 - v.a!, v.a!) },
      },
      {
        id: 'b = k × a',
        display: '{b} = {k} × {a}',
        vars: ['b', 'k', 'a'],
        residual: (v: Values) => v.b! - v.k! * v.a!,
        solve: {
          b: (v: Values) => exact(v.k! * v.a!),
          k: (v: Values) => q(v.b!, v.a!),
          a: (v: Values) => q(v.b!, v.k!),
        },
      },
    ],
    steps: {
      'a = 180 ÷ (1 + k)': {
        a: {
          expr: '180 ÷ (1 + {k})',
          how: 'a and k × a make 180, so 1 + k of the smaller angle make 180.',
        },
        k: { expr: '(180 − {a}) ÷ {a}', how: 'The bigger angle is 180 − a; divide it by a.' },
      },
      'b = k × a': {
        b: { expr: '{k} × {a}', how: 'The bigger angle is k times the smaller.' },
        k: { expr: '{b} ÷ {a}', how: 'Divide the bigger angle by the smaller.' },
        a: { expr: '{b} ÷ {k}', how: 'Divide the bigger angle by k.' },
      },
    },
    example: { k: 2, a: 60, b: 120 },
    startWith: ['k'],
    representation: { kind: 'angles', parts: ['a', 'b'], whole: 180 },
  },
  {
    id: 'm.7.angle-relationships~triangle',
    title: 'Angles in a triangle',
    use: 'Use this for “A triangle has angles of 66° and 33°. What is the third?” or “An exterior angle is 135°.”',
    assumptions: [
      'The three angles of any triangle add to 180°.',
      'An exterior angle and the angle beside it make a straight line.',
      'So an exterior angle equals the sum of the two far angles.',
    ],
    variables: [
      { ...degrees('a', 'First angle', 178), min: 1 },
      { ...degrees('b', 'Second angle', 178), min: 1 },
      { ...degrees('c', 'Third angle', 178), min: 1 },
      { ...degrees('e', 'Exterior angle at c', 179), min: 2 },
    ],
    relations: [
      {
        id: 'a + b + c = 180',
        display: '{a} + {b} + {c} = 180',
        vars: ['a', 'b', 'c'],
        residual: (v: Values) => v.a! + v.b! + v.c! - 180,
        solve: {
          a: (v: Values) => 180 - v.b! - v.c!,
          b: (v: Values) => 180 - v.a! - v.c!,
          c: (v: Values) => 180 - v.a! - v.b!,
        },
      },
      {
        id: 'e + c = 180',
        display: '{e} + {c} = 180',
        vars: ['e', 'c'],
        residual: (v: Values) => v.e! + v.c! - 180,
        solve: { e: (v: Values) => 180 - v.c!, c: (v: Values) => 180 - v.e! },
      },
    ],
    steps: {
      'a + b + c = 180': {
        a: { expr: '180 − {b} − {c}', how: 'The three angles make 180°: take the other two away.' },
        b: { expr: '180 − {a} − {c}', how: 'The three angles make 180°: take the other two away.' },
        c: { expr: '180 − {a} − {b}', how: 'The three angles make 180°: take the other two away.' },
      },
      'e + c = 180': {
        e: {
          expr: '180 − {c}',
          how: 'The exterior angle and c make a straight line. It equals a + b.',
        },
        c: { expr: '180 − {e}', how: 'The exterior angle and c make a straight line.' },
      },
    },
    example: { a: 66, b: 33, c: 81, e: 99 },
    startWith: ['a', 'b'],
    equation: '{a}° + {b}° + {c}° = 180°',
    representation: {
      kind: 'angles',
      parts: ['a', 'b'],
      whole: 'e',
      triangle: { third: 'c' },
    },
  },
  {
    id: 'm.7.angle-relationships~parallel-lines',
    title: 'Parallel lines and a transversal',
    use: 'Use this for “Lines ℓ and m are parallel. Angle 1 is 50°. Which angles are 50° and which are 130°?”',
    assumptions: [
      'When parallel lines are cut by a third line, the eight angles have only two sizes.',
      'Corresponding, alternate interior and vertical angles are equal.',
      'Any two angles side by side on a line add to 180°.',
    ],
    variables: [
      { ...degrees('a', 'Angle 1', 179), min: 1 },
      { ...degrees('b', 'Angle 2', 179), min: 1 },
    ],
    relations: [straightPair.relation],
    steps: straightPair.steps,
    example: { a: 50, b: 130 },
    startWith: ['a'],
    representation: { kind: 'angles', parts: ['a', 'b'], whole: 180, parallel: true },
  },

  // ── Volume and surface area of prisms (7.G.3, 7.G.6) ──
  {
    id: 'm.7.prisms',
    assumptions: [
      'A prism has the same cross-section all the way up, so volume = base area × height.',
      'The cut is parallel to the base.',
      'Surface area adds every face: two bases plus the sides, which unroll to a rectangle, height × perimeter.',
      'Volume is in cubic units, surface area in square units.',
    ],
    standalone: {
      vars: ['a'],
      why: 'Where the plane cuts does not change the cut: a prism is the same all the way up.',
    },
    variables: [
      cmLength('l', 'Length'),
      cmLength('w', 'Width'),
      cmLength('h', 'Height'),
      { ...cmLength('a', 'Cut height'), min: 0 },
      worked('B', 'Base area', 'cm²'),
      worked('V', 'Volume', 'cm³'),
      worked('S', 'Surface area', 'cm²'),
    ],
    relations: [
      atMost('a', 'h'),
      derive('B = l × w', 'B', ['l', 'w'], '{B} = {l} × {w}', (v) => v.l! * v.w!),
      derive('V = B × h', 'V', ['B', 'h'], '{V} = {B} × {h}', (v) => v.B! * v.h!),
      derive(
        'S = 2B + h(2l + 2w)',
        'S',
        ['B', 'h', 'l', 'w'],
        '{S} = 2 × {B} + {h} × (2 × {l} + 2 × {w})',
        (v) => 2 * v.B! + v.h! * (2 * v.l! + 2 * v.w!),
      ),
    ],
    steps: {
      'a ≤ h': {},
      'B = l × w': {
        B: { expr: '{l} × {w}', how: 'The cut is the base: a rectangle, length times width.' },
      },
      'V = B × h': {
        V: { expr: '{B} × {h}', how: 'Stack the base area up the height: base area times height.' },
      },
      'S = 2B + h(2l + 2w)': {
        S: {
          expr: '2 × {B} + {h} × (2 × {l} + 2 × {w})',
          how: 'Two bases, and the four sides unrolled: the height times the distance around the base.',
        },
      },
    },
    example: { l: 6, w: 4, h: 5, a: 2, B: 24, V: 120, S: 148 },
    startWith: ['l', 'w', 'h', 'a'],
    representation: {
      kind: 'crossSection',
      solid: 'box',
      length: 'l',
      width: 'w',
      height: 'h',
      at: 'a',
      area: 'B',
      volume: 'V',
    },
  },
  {
    id: 'm.7.prisms~triangular',
    title: 'Triangular prism',
    use: 'Use this for “A prism stands on a right triangle with legs 6 and 8 and slanted side 10, and is 12 long. Find its volume and surface area.”',
    assumptions: [
      'The two ends are the same right triangle; each rectangle is one side of the triangle by the length.',
      'Volume = the triangle’s area × the length.',
      'Surface area = two triangles + the length × the distance around the triangle.',
    ],
    variables: [
      cmLength('b', 'First leg'),
      cmLength('h', 'Second leg'),
      cmLength('s', 'Slanted side'),
      cmLength('L', 'Length'),
      worked('B', 'Area of one end', 'cm²'),
      worked('V', 'Volume', 'cm³'),
      worked('S', 'Surface area', 'cm²'),
    ],
    relations: [
      longer('s', 'b', 'The slanted side {s} is longer than {b}'),
      longer('s', 'h', 'The slanted side {s} is longer than {h}'),
      {
        // (not the Pythagorean theorem, which is Grade 8: any sides that close the triangle)
        id: 's < b + h',
        constraint: true,
        display: 'The slanted side {s} is shorter than {b} + {h}',
        vars: ['b', 'h', 's'],
        residual: (v: Values) => (v.s! < v.b! + v.h! ? 0 : 1),
        solve: {},
      },
      derive('B = bh ÷ 2', 'B', ['b', 'h'], '{B} = {b} × {h} ÷ 2', (v) => (v.b! * v.h!) / 2),
      derive('V = B × L', 'V', ['B', 'L'], '{V} = {B} × {L}', (v) => v.B! * v.L!),
      derive(
        'S = 2B + L(b + h + s)',
        'S',
        ['B', 'L', 'b', 'h', 's'],
        '{S} = 2 × {B} + {L} × ({b} + {h} + {s})',
        (v) => 2 * v.B! + v.L! * (v.b! + v.h! + v.s!),
      ),
    ],
    steps: {
      's > b': {},
      's > h': {},
      's < b + h': {},
      'B = bh ÷ 2': {
        B: { expr: '{b} × {h} ÷ 2', how: 'The end is a right triangle: half of leg times leg.' },
      },
      'V = B × L': {
        V: { expr: '{B} × {L}', how: 'Stack the end’s area along the length.' },
      },
      'S = 2B + L(b + h + s)': {
        S: {
          expr: '2 × {B} + {L} × ({b} + {h} + {s})',
          how: 'Two triangles, and three rectangles: the length times the distance around the triangle.',
          written: false,
        },
      },
    },
    example: { b: 6, h: 8, s: 10, L: 12, B: 24, V: 288, S: 336 },
    startWith: ['b', 'h', 's', 'L'],
    representation: {
      kind: 'net',
      solid: 'triangularPrism',
      width: 'b',
      height: 'h',
      slant: 's',
      length: 'L',
      total: 'S',
    },
  },
  {
    id: 'm.7.prisms~tent',
    title: 'Tent-shaped prism',
    use: 'Use this for “A tent is a prism: its end is a triangle with base 6 ft, height 4 ft and two 5 ft sides, and it is 8 ft long.”',
    assumptions: [
      'The two ends are the same triangle with two equal slanted sides; each rectangle is one side of the triangle by the length.',
      'Volume = the triangle’s area × the length; the triangle’s area is base × height ÷ 2.',
      'Surface area = two triangles + the length × the distance around the triangle.',
    ],
    variables: [
      cmLength('b', 'Base of the triangle'),
      cmLength('h', 'Height of the triangle'),
      cmLength('s', 'Each slanted side'),
      cmLength('L', 'Length'),
      worked('B', 'Area of one end', 'cm²'),
      worked('V', 'Volume', 'cm³'),
      worked('S', 'Surface area', 'cm²'),
    ],
    relations: [
      longer('s', 'h', 'Each slanted side {s} is longer than the height {h}'),
      {
        id: 's > b ÷ 2',
        constraint: true,
        display: 'Each slanted side {s} is longer than half the base {b}',
        vars: ['s', 'b'],
        residual: (v: Values) => (v.s! > v.b! / 2 ? 0 : 1),
        solve: {},
      },
      derive('B = bh ÷ 2', 'B', ['b', 'h'], '{B} = {b} × {h} ÷ 2', (v) => (v.b! * v.h!) / 2),
      derive('V = B × L', 'V', ['B', 'L'], '{V} = {B} × {L}', (v) => v.B! * v.L!),
      derive(
        'S = 2B + L(b + 2s)',
        'S',
        ['B', 'L', 'b', 's'],
        '{S} = 2 × {B} + {L} × ({b} + 2 × {s})',
        (v) => 2 * v.B! + v.L! * (v.b! + 2 * v.s!),
      ),
    ],
    steps: {
      's > h': {},
      's > b ÷ 2': {},
      'B = bh ÷ 2': {
        B: { expr: '{b} × {h} ÷ 2', how: 'The end is a triangle: half of base times height.' },
      },
      'V = B × L': {
        V: { expr: '{B} × {L}', how: 'Stack the end’s area along the length.' },
      },
      'S = 2B + L(b + 2s)': {
        S: {
          expr: '2 × {B} + {L} × ({b} + 2 × {s})',
          how: 'Two triangles, and three rectangles: the floor and the two slanted sides.',
          written: false,
        },
      },
    },
    example: { b: 6, h: 4, s: 5, L: 8, B: 12, V: 96, S: 152 },
    startWith: ['b', 'h', 's', 'L'],
    representation: {
      kind: 'net',
      solid: 'triangularPrism',
      triangle: 'isosceles',
      width: 'b',
      height: 'h',
      slant: 's',
      length: 'L',
      total: 'S',
    },
  },
  {
    id: 'm.7.prisms~trapezoid-base',
    title: 'Prism on a trapezoid',
    use: 'Use this for “A stage is a trapezoidal prism: bases 20 ft and 10 ft, 12 ft apart, 2 ft high. What is its volume?”',
    assumptions: [
      'The base is a trapezoid: its area is the average of the two parallel sides × the distance between them.',
      'Volume = base area × the prism’s height.',
      'All lengths in the same unit; volume in cubic units.',
    ],
    variables: [
      cmLength('a', 'Long base'),
      cmLength('b', 'Short base'),
      cmLength('t', 'Trapezoid height'),
      cmLength('h', 'Prism height'),
      worked('B', 'Base area', 'cm²'),
      worked('V', 'Volume', 'cm³'),
    ],
    relations: [
      atMost('b', 'a'),
      derive(
        'B = (a + b) ÷ 2 × t',
        'B',
        ['a', 'b', 't'],
        '{B} = ({a} + {b}) ÷ 2 × {t}',
        (v) => ((v.a! + v.b!) / 2) * v.t!,
      ),
      derive('V = B × h', 'V', ['B', 'h'], '{V} = {B} × {h}', (v) => v.B! * v.h!),
    ],
    steps: {
      'b ≤ a': {},
      'B = (a + b) ÷ 2 × t': {
        B: {
          expr: '({a} + {b}) ÷ 2 × {t}',
          how: 'The average of the parallel sides times the distance between them.',
        },
      },
      'V = B × h': {
        V: { expr: '{B} × {h}', how: 'Stack the base area up the prism’s height.' },
      },
    },
    example: { a: 20, b: 10, t: 12, h: 2, B: 180, V: 360 },
    startWith: ['a', 'b', 't', 'h'],
    pictureLabels: ['h', 'V'],
    representation: {
      kind: 'baseHeight',
      shape: 'trapezoid',
      base: 'a',
      top: 'b',
      height: 't',
      area: 'B',
    },
  },
  {
    id: 'm.7.prisms~composite-base',
    title: 'A base made of rectangles',
    use: 'Use this for “The base is an L shape, 8 by 5 with a 3 by 3 corner cut out. The prism is 5 cm tall. Find its volume and surface area.”',
    assumptions: [
      'The base is a rectangle with a rectangle cut from one corner: an L.',
      'Base area = the whole rectangle − the cut-out. Volume = base area × height.',
      'Cutting a corner keeps the perimeter: the two new sides are as long as the two lost. A notch cut from the middle of a side adds twice its depth.',
      'Surface area = 2 bases + perimeter × height, since the sides unroll to one rectangle.',
    ],
    variables: [
      { ...cmLength('l', 'Length of the whole rectangle'), max: 20 },
      { ...cmLength('w', 'Width of the whole rectangle'), max: 20 },
      { ...cmLength('c', 'Length of the cut-out'), max: 20 },
      { ...cmLength('d', 'Width of the cut-out'), max: 20 },
      cmLength('h', 'Prism height'),
      worked('B', 'Base area', 'cm²'),
      worked('V', 'Volume', 'cm³'),
      worked('S', 'Surface area', 'cm²'),
    ],
    relations: [
      {
        id: 'c < l',
        constraint: true,
        display: 'The cut-out’s length {c} is less than the whole length {l}',
        vars: ['c', 'l'],
        residual: (v: Values) => (v.c! < v.l! ? 0 : 1),
        solve: {},
      },
      {
        id: 'd < w',
        constraint: true,
        display: 'The cut-out’s width {d} is less than the whole width {w}',
        vars: ['d', 'w'],
        residual: (v: Values) => (v.d! < v.w! ? 0 : 1),
        solve: {},
      },
      derive(
        'B = l × w − c × d',
        'B',
        ['l', 'w', 'c', 'd'],
        '{B} = {l} × {w} − {c} × {d}',
        (v) => v.l! * v.w! - v.c! * v.d!,
      ),
      derive('V = B × h', 'V', ['B', 'h'], '{V} = {B} × {h}', (v) => v.B! * v.h!),
      derive(
        'S = 2B + (2l + 2w) × h',
        'S',
        ['B', 'l', 'w', 'h'],
        '{S} = 2 × {B} + (2 × {l} + 2 × {w}) × {h}',
        (v) => 2 * v.B! + (2 * v.l! + 2 * v.w!) * v.h!,
      ),
    ],
    steps: {
      'c < l': {},
      'd < w': {},
      'B = l × w − c × d': {
        B: {
          expr: '{l} × {w} − {c} × {d}',
          how: 'The whole rectangle, take away the corner cut out.',
        },
      },
      'V = B × h': {
        V: { expr: '{B} × {h}', how: 'Stack the base area up the prism’s height.' },
      },
      'S = 2B + (2l + 2w) × h': {
        S: {
          expr: '2 × {B} + (2 × {l} + 2 × {w}) × {h}',
          how: 'Two L-shaped bases, and the sides: the perimeter times the height.',
          work: (v: Values) => [
            `Perimeter of the L = 2 × ${fmt(v.l!)} + 2 × ${fmt(v.w!)} = ${fmt(2 * v.l! + 2 * v.w!)} cm`,
            `${fmt(2 * v.B!)} + ${fmt((2 * v.l! + 2 * v.w!) * v.h!)} = ${fmt(v.S!)}`,
          ],
        },
      },
    },
    example: { l: 8, w: 5, c: 3, d: 3, h: 5, B: 31, V: 155, S: 192 },
    startWith: ['l', 'w', 'c', 'd', 'h'],
    pictureLabels: ['h', 'V', 'S'],
    representation: {
      kind: 'rectilinear',
      left: { width: 'l', height: 'w' },
      cut: { width: 'c', height: 'd' },
      total: 'B',
      extent: 8,
    },
  },

  // ── Random sampling (7.SP.1–4) ──
  {
    id: 'm.7.sampling',
    assumptions: [
      'Every student is as likely as any other to be picked: a random sample.',
      'The sample’s share is about the population’s share, not exactly.',
      'A bigger sample usually lands closer.',
      'Take a new sample: the estimate moves a little each time.',
    ],
    variables: [
      whole('N', 'N', 'Students in the school', 1, 1000),
      whole('n', 'n', 'Students in the sample', 1, 1000),
      whole('k', 'k', 'Sample who walk to school', 0, 1000),
      whole('T', 'T', 'Whole school who walk', 0, 1000),
      { id: 'E', symbol: 'E', name: 'Estimate for the school', min: 0, max: 1000, derived: true },
    ],
    relations: [
      atMost('n', 'N'),
      atMost('k', 'n'),
      atMost('T', 'N'),
      atMost('k', 'T'),
      {
        // The sample's others (who don't walk) come from the school's others.
        id: 'n − k ≤ N − T',
        constraint: true,
        display: '{n} − {k} is at most {N} − {T}',
        vars: ['n', 'k', 'N', 'T'],
        residual: (v: Values) => (v.n! - v.k! <= v.N! - v.T! ? 0 : 1),
        solve: {},
      },
      derive(
        'E = k ÷ n × N',
        'E',
        ['k', 'n', 'N'],
        '{E} = {k} ÷ {n} × {N}',
        (v) => (v.k! / v.n!) * v.N!,
      ),
    ],
    steps: {
      'n ≤ N': {},
      'k ≤ n': {},
      'T ≤ N': {},
      'k ≤ T': {},
      'n − k ≤ N − T': {},
      'E = k ÷ n × N': {
        E: {
          expr: '{k} ÷ {n} × {N}',
          how: 'The share who walk in the sample, times everyone in the school.',
        },
      },
    },
    example: { N: 200, n: 20, k: 6, T: 64, E: 60 },
    startWith: ['N', 'n', 'k', 'T'],
    standalone: {
      vars: ['T'],
      why: 'The whole school is what the sample estimates; the picture colors it so a new sample can be drawn.',
    },
    representation: {
      kind: 'sample',
      population: 'N',
      size: 'n',
      found: 'k',
      trait: 'T',
      estimate: 'E',
      labels: ['walk', 'do not'],
    },
  },
  {
    id: 'm.7.sampling~compare',
    title: 'Compare two samples',
    use: 'Use this for “Which class read longer last night, and by how much?”',
    assumptions: [
      'Each class is a random sample of its grade. Times are in minutes.',
      'The mean is the balance point of a dot plot; the MAD is the mean distance from it.',
      'A gap between the means of two or more MADs says the groups really differ.',
    ],
    variables: [
      whole('n', 'n', 'Students in each class', 3, 8),
      ...SAMPLE_A.map((id, i) => ({
        ...whole(id, id, `Class A, student ${i + 1}`, 0, 60),
        countedBy: { count: 'n', index: i + 1 },
      })),
      ...SAMPLE_B.map((id, i) => ({
        ...whole(id, id, `Class B, student ${i + 1}`, 0, 60),
        countedBy: { count: 'n', index: i + 1 },
      })),
      { id: 'P', symbol: 'P', name: 'Mean of class A', min: 0, max: 60, derived: true },
      { id: 'Q', symbol: 'Q', name: 'Mean of class B', min: 0, max: 60, derived: true },
      { id: 'd', symbol: 'd', name: 'Difference of the means', min: 0, max: 60, derived: true },
      { id: 'M', symbol: 'M', name: 'MAD of class A', min: 0, max: 60, derived: true },
      {
        id: 'D',
        symbol: 'D',
        name: 'Gap in MADs',
        min: 0,
        max: 1000,
        derived: true,
      },
    ],
    relations: [
      {
        ...derive(
          'P = mean of A',
          'P',
          ['n', ...SAMPLE_A],
          'mean of class A’s {n} times = {P}',
          meanOf(SAMPLE_A),
        ),
        check: (v: Values) =>
          `(${firstN(SAMPLE_A, v)
            .map((id) => fmt(v[id]!))
            .join(' + ')}) ÷ ${v.n} = ${fmt(v.P!)}`,
      },
      {
        ...derive(
          'Q = mean of B',
          'Q',
          ['n', ...SAMPLE_B],
          'mean of class B’s {n} times = {Q}',
          meanOf(SAMPLE_B),
        ),
        check: (v: Values) =>
          `(${firstN(SAMPLE_B, v)
            .map((id) => fmt(v[id]!))
            .join(' + ')}) ÷ ${v.n} = ${fmt(v.Q!)}`,
      },
      {
        ...derive('d = |Q − P|', 'd', ['P', 'Q'], 'the gap from {P} to {Q} = {d}', (v) =>
          Math.abs(v.Q! - v.P!),
        ),
        check: (v: Values) =>
          `${fmt(Math.max(v.P!, v.Q!))} − ${fmt(Math.min(v.P!, v.Q!))} = ${fmt(v.d!)}`,
      },
      {
        ...derive(
          'M = MAD of A',
          'M',
          ['n', 'P', ...SAMPLE_A],
          'mean distance of class A’s {n} times from {P} = {M}',
          madOfSample(SAMPLE_A, 'P'),
        ),
        check: (v: Values) =>
          `(${firstN(SAMPLE_A, v)
            .map((id) => `|${fmt(v[id]!)} − ${fmt(v.P!)}|`)
            .join(' + ')}) ÷ ${v.n} = ${fmt(v.M!)}`,
      },
      {
        ...derive('D = d ÷ M', 'D', ['d', 'M'], '{D} = {d} ÷ {M}', (v) =>
          v.M! > 0 ? v.d! / v.M! : undefined,
        ),
      },
    ],
    steps: {
      'P = mean of A': {
        P: {
          expr: (v: Values) =>
            `(${firstN(SAMPLE_A, v)
              .map((id) => `{${id}}`)
              .join(' + ')}) ÷ {n}`,
          how: 'Add class A’s times and share them out evenly.',
          work: (v: Values) => {
            const xs = firstN(SAMPLE_A, v).map((id) => v[id]!);
            const total = xs.reduce((t, x) => t + x, 0);
            return [
              `${xs.map(fmt).join(' + ')} = ${fmt(total)}`,
              `${fmt(total)} ÷ ${v.n} = ${fmt(v.P!)}`,
            ];
          },
          written: false,
        },
      },
      'Q = mean of B': {
        Q: {
          expr: (v: Values) =>
            `(${firstN(SAMPLE_B, v)
              .map((id) => `{${id}}`)
              .join(' + ')}) ÷ {n}`,
          how: 'Add class B’s times and share them out evenly.',
          work: (v: Values) => {
            const xs = firstN(SAMPLE_B, v).map((id) => v[id]!);
            const total = xs.reduce((t, x) => t + x, 0);
            return [
              `${xs.map(fmt).join(' + ')} = ${fmt(total)}`,
              `${fmt(total)} ÷ ${v.n} = ${fmt(v.Q!)}`,
            ];
          },
          written: false,
        },
      },
      'd = |Q − P|': {
        d: {
          expr: (v: Values) => (v.Q! >= v.P! ? '{Q} − {P}' : '{P} − {Q}'),
          how: 'Take the smaller mean from the bigger one.',
        },
      },
      'M = MAD of A': {
        M: {
          expr: (v: Values) =>
            `(${firstN(SAMPLE_A, v)
              .map((id) => `|{${id}} − {P}|`)
              .join(' + ')}) ÷ {n}`,
          how: 'How far each time is from the mean, on average.',
          work: (v: Values) => {
            const ds = firstN(SAMPLE_A, v).map((id) => Math.abs(v[id]! - v.P!));
            const total = ds.reduce((t, x) => t + x, 0);
            return [
              `Distances from ${fmt(v.P!)}: ${ds.map(fmt).join(', ')}`,
              `${ds.map(fmt).join(' + ')} = ${fmt(total)}`,
              `${fmt(total)} ÷ ${v.n} = ${fmt(v.M!)}`,
            ];
          },
          written: false,
        },
      },
      'D = d ÷ M': {
        D: {
          expr: '{d} ÷ {M}',
          how: (v: Values) =>
            v.D! >= 2
              ? 'The means are two or more MADs apart: the classes really differ.'
              : 'The means are less than two MADs apart: the gap could be chance.',
        },
      },
    },
    example: {
      n: 8,
      a1: 10,
      a2: 15,
      a3: 15,
      a4: 20,
      a5: 20,
      a6: 20,
      a7: 25,
      a8: 35,
      b1: 20,
      b2: 25,
      b3: 30,
      b4: 30,
      b5: 30,
      b6: 35,
      b7: 40,
      b8: 46,
      P: 20,
      Q: 32,
      d: 12,
      M: 5,
      D: 2.4,
    },
    startWith: ['n', ...SAMPLE_A, ...SAMPLE_B],
    representation: {
      kind: 'dotPlot',
      data: SAMPLE_A,
      count: 'n',
      min: 0,
      max: 50,
      mean: 'P',
      second: { data: SAMPLE_B, mean: 'Q' },
      labels: ['Class A', 'Class B'],
      difference: 'd',
    },
  },

  // ── Probability (7.SP.5–8) ──
  {
    id: 'm.7.probability',
    assumptions: [
      'The spinner is cut into equal sectors.',
      'The arrow is as likely to stop in any sector as any other.',
      'A probability is a number from 0 (impossible) to 1 (certain): favorable sectors ÷ all sectors.',
      'Spin many times: the share of red comes close to the probability.',
    ],
    variables: [
      whole('r', 'r', 'Red sectors', 0, 12),
      whole('b', 'b', 'Blue sectors', 0, 12),
      whole('y', 'y', 'Yellow sectors', 0, 12),
      whole('n', 'n', 'Sectors in all', 1, 24),
      { id: 'P', symbol: 'P', name: 'Chance of red', min: 0, max: 1, fraction: 24, derived: true },
      {
        id: 'R',
        symbol: 'R',
        name: 'Chance of red or blue',
        min: 0,
        max: 1,
        fraction: 24,
        derived: true,
      },
    ],
    relations: [
      {
        id: 'n = r + b + y',
        display: '{n} = {r} + {b} + {y}',
        vars: ['n', 'r', 'b', 'y'],
        residual: (v: Values) => v.n! - v.r! - v.b! - v.y!,
        solve: {
          n: (v: Values) => v.r! + v.b! + v.y!,
          r: (v: Values) => v.n! - v.b! - v.y!,
          b: (v: Values) => v.n! - v.r! - v.y!,
          y: (v: Values) => v.n! - v.r! - v.b!,
        },
      },
      derive('P = r ÷ n', 'P', ['r', 'n'], '{P} = {r} ÷ {n}', (v) => v.r! / v.n!),
      derive(
        'R = (r + b) ÷ n',
        'R',
        ['r', 'b', 'n'],
        '{R} = ({r} + {b}) ÷ {n}',
        (v) => (v.r! + v.b!) / v.n!,
      ),
    ],
    steps: {
      'n = r + b + y': {
        n: { expr: '{r} + {b} + {y}', how: 'Add the sectors of every color.' },
        r: { expr: '{n} − {b} − {y}', how: 'Take the blue and yellow sectors from all of them.' },
        b: { expr: '{n} − {r} − {y}', how: 'Take the red and yellow sectors from all of them.' },
        y: { expr: '{n} − {r} − {b}', how: 'Take the red and blue sectors from all of them.' },
      },
      'P = r ÷ n': {
        P: { expr: '{r} ÷ {n}', how: 'The red sectors out of all the equal sectors.' },
      },
      'R = (r + b) ÷ n': {
        R: {
          expr: '({r} + {b}) ÷ {n}',
          how: 'Red or blue: count both colors’ sectors, then divide by all of them.',
        },
      },
    },
    example: { r: 3, b: 4, y: 1, n: 8, P: 3 / 8, R: 7 / 8 },
    startWith: ['r', 'b', 'y'],
    representation: {
      kind: 'spinner',
      parts: ['r', 'b', 'y'],
      colors: ['red', 'blue', 'yellow'],
      chance: 'P',
      total: 'n',
    },
  },
  {
    id: 'm.7.probability~marbles',
    title: 'A bag of marbles',
    use: 'Use this for “A bag has 5 red, 3 blue and 2 green marbles. What is the chance of blue?”',
    assumptions: [
      'The marbles are the same size and feel the same.',
      'Each marble is as likely to be drawn as any other.',
      'The chance of blue is the blue marbles out of all the marbles.',
    ],
    variables: [
      whole('r', 'r', 'Red marbles', 0, 15),
      whole('b', 'b', 'Blue marbles', 0, 15),
      whole('g', 'g', 'Green marbles', 0, 10),
      whole('n', 'n', 'Marbles in all', 1, 40),
      { id: 'P', symbol: 'P', name: 'Chance of blue', min: 0, max: 1, fraction: 40, derived: true },
    ],
    relations: [
      {
        id: 'n = r + b + g',
        display: '{n} = {r} + {b} + {g}',
        vars: ['n', 'r', 'b', 'g'],
        residual: (v: Values) => v.n! - v.r! - v.b! - v.g!,
        solve: {
          n: (v: Values) => v.r! + v.b! + v.g!,
          r: (v: Values) => v.n! - v.b! - v.g!,
          b: (v: Values) => v.n! - v.r! - v.g!,
          g: (v: Values) => v.n! - v.r! - v.b!,
        },
      },
      derive('P = b ÷ n', 'P', ['b', 'n'], '{P} = {b} ÷ {n}', (v) => v.b! / v.n!),
    ],
    steps: {
      'n = r + b + g': {
        n: { expr: '{r} + {b} + {g}', how: 'Add the marbles of every color.' },
        r: { expr: '{n} − {b} − {g}', how: 'Take the blue and green marbles from all of them.' },
        b: { expr: '{n} − {r} − {g}', how: 'Take the red and green marbles from all of them.' },
        g: { expr: '{n} − {r} − {b}', how: 'Take the red and blue marbles from all of them.' },
      },
      'P = b ÷ n': { P: { expr: '{b} ÷ {n}', how: 'The blue marbles out of all the marbles.' } },
    },
    example: { r: 5, b: 3, g: 2, n: 10, P: 0.3 },
    startWith: ['r', 'b', 'g'],
    representation: {
      kind: 'marbles',
      parts: ['r', 'b', 'g'],
      colors: ['red', 'blue', 'green'],
      pick: 1,
      chance: 'P',
      total: 'n',
    },
  },
  {
    id: 'm.7.probability~expected',
    title: 'Expected results in the long run',
    use: 'Use this for “4 of 9 sectors say singing. In 225 classes, about how many are singing?”',
    assumptions: [
      'The probability says the share of trials in the long run.',
      'Expected count = probability × trials; the real count is near it, not exactly it.',
      'Past results do not change the next spin: each spin starts fresh.',
    ],
    variables: [
      whole('f', 'f', 'Favorable sectors', 0, 24),
      whole('n', 'n', 'Sectors in all', 1, 24),
      { ...whole('o', 'o', 'Other sectors', 0, 24), derived: true },
      { id: 'P', symbol: 'P', name: 'Probability', min: 0, max: 1, fraction: 24, derived: true },
      whole('t', 't', 'Trials', 1, 10000),
      { id: 'E', symbol: 'E', name: 'Expected count', min: 0, max: 10000, derived: true },
    ],
    relations: [
      atMost('f', 'n'),
      derive('o = n − f', 'o', ['n', 'f'], '{o} = {n} − {f}', (v) => v.n! - v.f!),
      derive('P = f ÷ n', 'P', ['f', 'n'], '{P} = {f} ÷ {n}', (v) => v.f! / v.n!),
      derive('E = P × t', 'E', ['P', 't'], '{E} = {P} × {t}', (v) => v.P! * v.t!),
    ],
    steps: {
      'f ≤ n': {},
      'o = n − f': { o: { expr: '{n} − {f}', how: 'The sectors that are not favorable.' } },
      'P = f ÷ n': { P: { expr: '{f} ÷ {n}', how: 'The favorable sectors out of all of them.' } },
      'E = P × t': {
        E: { expr: '{P} × {t}', how: 'The share of the trials: probability times trials.' },
      },
    },
    example: { f: 4, n: 9, o: 5, P: 4 / 9, t: 225, E: 100 },
    startWith: ['f', 'n', 't'],
    representation: {
      kind: 'spinner',
      parts: ['f', 'o'],
      colors: ['red', 'blue'],
      chance: 'P',
      total: 'n',
    },
  },
  {
    id: 'm.7.probability~two-dice',
    title: 'Two dice',
    use: 'Use this for “Two dice are rolled. What is the chance the sum is 7?”',
    assumptions: [
      'Each die is fair: every face is as likely as any other.',
      'The 36 pairs of faces are equally likely.',
      'Count the cells of the grid with the sum, then divide by 36.',
    ],
    variables: [
      whole('s', 's', 'Sum', 2, 12),
      { ...whole('k', 'k', 'Pairs with that sum', 0, 36), derived: true },
      {
        id: 'P',
        symbol: 'P',
        name: 'Chance of that sum',
        min: 0,
        max: 1,
        fraction: 36,
        derived: true,
      },
    ],
    relations: [
      {
        ...derive('k = pairs with sum s', 'k', ['s'], 'pairs with a sum of {s}: {k}', (v) =>
          diceCount('sum', '=', v.s!),
        ),
        check: (v: Values) => `${dicePairs(v.s!).length} = ${v.k}`,
      },
      derive('P = k ÷ 36', 'P', ['k'], '{P} = {k} ÷ 36', (v) => v.k! / 36),
    ],
    steps: {
      'k = pairs with sum s': {
        k: {
          expr: (v: Values) => `${dicePairs(v.s!).length}`,
          how: 'Count the cells of the grid that show the sum.',
          work: (v: Values) => [dicePairs(v.s!).join(', ')],
          written: false,
        },
      },
      'P = k ÷ 36': {
        P: { expr: '{k} ÷ 36', how: 'The pairs with the sum out of all 36 equally likely pairs.' },
      },
    },
    example: { s: 7, k: 6, P: 1 / 6 },
    startWith: ['s'],
    representation: { kind: 'diceGrid', target: 's', count: 'k', chance: 'P' },
  },
  {
    id: 'm.7.probability~at-least',
    title: 'Two dice: a sum of at least',
    use: 'Use this for “Two dice are rolled. What is the chance the sum is at least 10?”',
    assumptions: [
      'The 36 pairs of faces are equally likely.',
      '“At least 10” means 10, 11 or 12. Count the pairs for each sum and add.',
      'The chance of “less than 10” is 1 minus the chance of “at least 10”.',
    ],
    variables: [
      whole('s', 's', 'Smallest sum', 2, 12),
      { ...whole('k', 'k', 'Pairs with that sum or more', 0, 36), derived: true },
      {
        id: 'P',
        symbol: 'P',
        name: 'Chance of that sum or more',
        min: 0,
        max: 1,
        fraction: 36,
        derived: true,
      },
    ],
    relations: [
      {
        ...derive(
          'k = pairs with sum at least s',
          'k',
          ['s'],
          'pairs with a sum of at least {s}: {k}',
          (v) => diceCount('sum', '≥', v.s!),
        ),
        check: (v: Values) => `${sumsFrom(v.s!).join(' + ')} = ${v.k}`,
      },
      derive('P = k ÷ 36', 'P', ['k'], '{P} = {k} ÷ 36', (v) => v.k! / 36),
    ],
    steps: {
      'k = pairs with sum at least s': {
        k: {
          expr: (v: Values) => sumsFrom(v.s!).join(' + '),
          how: 'Count the pairs for each sum from the smallest up to 12, then add.',
          work: (v: Values) => [
            sumsFrom(v.s!)
              .map((k, i) => `sum ${v.s! + i}: ${k}`)
              .join(', '),
          ],
          written: false,
        },
      },
      'P = k ÷ 36': {
        P: { expr: '{k} ÷ 36', how: 'Those pairs out of all 36 equally likely pairs.' },
      },
    },
    example: { s: 10, k: 6, P: 1 / 6 },
    startWith: ['s'],
    representation: { kind: 'diceGrid', target: 's', compare: '≥', count: 'k', chance: 'P' },
  },
  {
    id: 'm.7.probability~tree',
    title: 'Tree diagram',
    use: 'Use this for “A coin is flipped and a spinner with 3 sectors spun. How many outcomes are there, and what is the chance of heads (A) and 2?”',
    assumptions: [
      'Each stage has equally likely outcomes: a coin has 2 (heads A, tails B), a spinner with 3 sectors has 3.',
      'Each branch of the first stage splits into every outcome of the second: multiply.',
      'One path, like A then 2, is one of those equally likely outcomes. For three stages, multiply again.',
    ],
    variables: [
      whole('a', 'a', 'First-stage outcomes', 2, 6),
      whole('b', 'b', 'Second-stage outcomes', 2, 6),
      { ...whole('n', 'n', 'Outcomes in all', 1, 36), derived: true },
      {
        id: 'P',
        symbol: 'P',
        name: 'Chance of one outcome',
        min: 0,
        max: 1,
        fraction: 36,
        derived: true,
      },
    ],
    relations: [
      derive('n = a × b', 'n', ['a', 'b'], '{n} = {a} × {b}', (v) => v.a! * v.b!),
      derive('P = 1 ÷ n', 'P', ['n'], '{P} = 1 ÷ {n}', (v) => 1 / v.n!),
    ],
    steps: {
      'n = a × b': {
        n: {
          expr: '{a} × {b}',
          how: 'Each first-stage outcome branches into every second-stage outcome.',
        },
      },
      'P = 1 ÷ n': {
        P: {
          expr: '1 ÷ {n}',
          how: 'One path, such as A then 2, is one of the equally likely outcomes.',
        },
      },
    },
    example: { a: 2, b: 3, n: 6, P: 1 / 6 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'treeDiagram',
      first: 'a',
      second: 'b',
      total: 'n',
      names: [
        ['A', 'B', 'C', 'D', 'E', 'F'],
        ['1', '2', '3', '4', '5', '6'],
      ],
      stages: ['First stage', 'Second stage'],
      path: [0, 1],
      chance: 'P',
    },
  },
  {
    id: 'm.7.probability~three-stages',
    title: 'Tree diagram with three stages',
    use: 'Use this for “A coin is flipped three times. What is the chance of heads all three times?”',
    assumptions: [
      'Each stage has equally likely outcomes, numbered 1, 2, …: a coin has 2, heads (1) and tails (2); a spinner with 3 sectors has 3.',
      'Every path through the three stages is one outcome: multiply the three counts.',
      'The chance of one path is 1 out of all of them: the three branch chances multiplied.',
    ],
    variables: [
      whole('a', 'a', 'First-stage outcomes', 2, 4),
      whole('b', 'b', 'Second-stage outcomes', 2, 4),
      whole('c', 'c', 'Third-stage outcomes', 2, 4),
      { ...whole('n', 'n', 'Outcomes in all', 1, 64), derived: true },
      {
        id: 'P',
        symbol: 'P',
        name: 'Chance of one outcome',
        min: 0,
        max: 1,
        fraction: 64,
        derived: true,
      },
    ],
    relations: [
      derive(
        'n = a × b × c',
        'n',
        ['a', 'b', 'c'],
        '{n} = {a} × {b} × {c}',
        (v) => v.a! * v.b! * v.c!,
      ),
      derive('P = 1 ÷ n', 'P', ['n'], '{P} = 1 ÷ {n}', (v) => 1 / v.n!),
    ],
    steps: {
      'n = a × b × c': {
        n: {
          expr: '{a} × {b} × {c}',
          how: 'Each branch splits into every outcome of the next stage, twice over.',
        },
      },
      'P = 1 ÷ n': {
        P: {
          expr: '1 ÷ {n}',
          how: 'One path, such as heads three times, is one of the equally likely outcomes.',
        },
      },
    },
    example: { a: 2, b: 2, c: 2, n: 8, P: 1 / 8 },
    startWith: ['a', 'b', 'c'],
    representation: {
      kind: 'treeDiagram',
      first: 'a',
      second: 'b',
      third: 'c',
      total: 'n',
      names: [
        ['1', '2', '3', '4'],
        ['1', '2', '3', '4'],
        ['1', '2', '3', '4'],
      ],
      stages: ['First', 'Second', 'Third'],
      path: [0, 0, 0],
      chance: 'P',
    },
  },
];
