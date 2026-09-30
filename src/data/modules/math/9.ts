/**
 * Grade 9 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md; the
 * direction plan and build notes: docs/BUILD_HS.md.
 * The layout pages (explore, sort, sequence, observe) are in `../layouts/math9.ts`.
 */
import { formatNumber } from '@/engine/format';
import type { Relation, Values, VariableDef } from '@/engine/types';

import { div } from '../helpers';
import type { ModuleDef, StepText } from '../types';

type Solver = (v: Values) => number | number[] | undefined;

const fmt = (x: number) => formatNumber(x);
/** Rounded to 12 significant figures, so 0.1 + 0.2 is 0.3 when a value is worked out. */
const exact = (x: number) => Number(x.toPrecision(12));
/** A finite result, or nothing. */
const fin = (x: number) => (Number.isFinite(x) ? exact(x) : undefined);
/** A positive result, or nothing (a root out of its domain). */
const pos = (x: number) => (x > 0 && Number.isFinite(x) ? exact(x) : undefined);

/** A value typed or worked out: min to max, in steps of `step`. */
const num = (
  id: string,
  symbol: string,
  name: string,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, min, max, ...more });
/** A whole-number value. */
const int = (
  id: string,
  symbol: string,
  name: string,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, min, max, step: 1, integer: true, ...more });

/**
 * A relation with its steps: for each variable it is solved for, the solver, the rearranged
 * right side and the explanation (a solver with no parameters is never solved: no step).
 */
function rule(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  parts: Record<string, [Solver, StepText['expr'], StepText['how'], Partial<StepText>?]>,
  more: Partial<Relation> = {},
) {
  const solve: Record<string, Solver> = {};
  const steps: Record<string, StepText> = {};
  for (const [v, [fn, expr, how, extra]] of Object.entries(parts)) {
    solve[v] = fn;
    if (fn.length > 0) steps[v] = { expr, how, ...extra };
  }
  for (const v of vars) if (!(v in solve)) solve[v] = () => undefined;
  const relation: Relation = { id, display, vars, residual, solve, ...more };
  return { relation, steps };
}

/** A value worked out from others, never solved backwards. */
function derive(
  id: string,
  x: string,
  inputs: string[],
  display: string,
  f: (v: Values) => number | undefined,
  expr: StepText['expr'],
  how: StepText['how'],
  more: Partial<StepText> = {},
  rel: Partial<Relation> = {},
) {
  return rule(
    id,
    display,
    [x, ...inputs],
    (v) => v[x]! - (f(v) ?? NaN),
    {
      [x]: [
        (v: Values) => {
          const y = f(v);
          return y === undefined || !Number.isFinite(y) ? undefined : exact(y);
        },
        expr,
        how,
        more,
      ],
    },
    rel,
  );
}

/** A check that only rejects values (a ≠ 0). */
function constraint(id: string, display: string, vars: string[], bad: (v: Values) => boolean) {
  return {
    relation: {
      id,
      constraint: true,
      display,
      vars,
      residual: (v: Values) => (bad(v) ? 1 : 0),
      solve: {},
    } as Relation,
    steps: {} as Record<string, StepText>,
  };
}

type Rule = ReturnType<typeof rule>;

/** A page from its rules: the relations and the steps keyed by relation. */
function page(m: Omit<ModuleDef, 'relations' | 'steps'> & { rules: Rule[] }): ModuleDef {
  const { rules, ...rest } = m;
  return {
    ...rest,
    relations: rules.map((r) => r.relation),
    steps: Object.fromEntries(rules.map((r) => [r.relation.id, r.steps])),
  };
}

// ── Exponential functions ──

/** y = a · bˣ, solved for y, a and b (x needs logarithms: Algebra 2). */
const EXP_RULE = rule(
  'y = a × b^x',
  '{y} = {a} × {b}^{x}',
  ['y', 'a', 'b', 'x'],
  (v) => v.y! - v.a! * v.b! ** v.x!,
  {
    y: [
      (v) => fin(v.a! * v.b! ** v.x!),
      '{a} × {b}^{x}',
      'Start at a and multiply by b once for each step of 1 in x.',
    ],
    a: [(v) => fin(v.y! / v.b! ** v.x!), '{y} ÷ {b}^{x}', 'Divide both sides by bˣ.'],
    b: [
      (v) => (v.x === 0 ? undefined : pos((v.y! / v.a!) ** (1 / v.x!))),
      '({y} ÷ {a})^(1 ÷ {x})',
      'Divide both sides by a, then take the x-th root.',
    ],
  },
);

/** A = P · gᵗ with the growth factor g = 1 ± r%, r typed as a percent. */
function percentChange(up: boolean): Rule[] {
  const s = up ? '+' : '−';
  return [
    rule(
      `g = 1 ${s} r ÷ 100`,
      `{g} = 1 ${s} {r} ÷ 100`,
      ['g', 'r'],
      (v) => v.g! - (up ? 1 + v.r! / 100 : 1 - v.r! / 100),
      {
        g: [
          (v) => exact(up ? 1 + v.r! / 100 : 1 - v.r! / 100),
          `1 ${s} {r} ÷ 100`,
          up
            ? 'Write the rate as a decimal and add it to 1: the amount is multiplied by g each period.'
            : 'Write the rate as a decimal and take it from 1: each period keeps g of the amount.',
          { work: (v) => [`${fmt(v.r!)}% = ${fmt(exact(v.r! / 100))}`] },
        ],
        r: [
          (v) => exact(up ? 100 * (v.g! - 1) : 100 * (1 - v.g!)),
          up ? '100 × ({g} − 1)' : '100 × (1 − {g})',
          up
            ? 'Take 1 from the growth factor and write the decimal as a percent.'
            : 'Take the decay factor from 1 and write the decimal as a percent.',
        ],
      },
    ),
    rule(
      'A = P × g^t',
      '{A} = {P} × {g}^{t}',
      ['A', 'P', 'g', 't'],
      (v) => v.A! - v.P! * v.g! ** v.t!,
      {
        A: [
          (v) => fin(v.P! * v.g! ** v.t!),
          '{P} × {g}^{t}',
          'Multiply the starting amount by g once for each period.',
        ],
        P: [(v) => fin(v.A! / v.g! ** v.t!), '{A} ÷ {g}^{t}', 'Divide both sides by gᵗ.'],
        g: [
          (v) => (v.t ? pos((v.A! / v.P!) ** (1 / v.t)) : undefined),
          '({A} ÷ {P})^(1 ÷ {t})',
          'Divide both sides by P, then take the t-th root.',
        ],
      },
    ),
  ];
}

/** The exponential main page (moved from the pilot; see docs/build/m.9.md). */
export const EXPONENTIAL_MAIN = page({
  id: 'm.9.exponential-functions',
  assumptions: [
    'a is the value at x = 0, the y-intercept.',
    'b > 1 grows and 0 < b < 1 decays (b = 1 is a flat line).',
    'Each step of 1 in x multiplies y by b.',
  ],
  variables: [
    num('a', 'a', 'Starting value', 0.01, 1000000, { step: 0.01 }),
    num('b', 'b', 'Growth factor', 0.01, 10, { step: 0.01 }),
    num('x', 'x', 'Input', -10, 30, { step: 0.1 }),
    num('y', 'y', 'Output', 0, 1e40),
  ],
  rules: [EXP_RULE, constraint('b ≠ 1', 'The factor {b} is not 1', ['b'], (v) => v.b === 1)],
  example: { a: 500, b: 2, x: 3, y: 4000 },
  startWith: ['x', 'a', 'b'],
  equation: 'y = {a}({b})^x',
  representation: {
    kind: 'functionGraph',
    family: 'exponential',
    a: 'a',
    b: 'b',
    at: { x: 'x', y: 'y' },
    marks: ['intercept', 'asymptotes'],
  },
});

export const MATH_9_MODULES: ModuleDef[] = [
  // ── Exponential functions: growth and decay (F-LE.1–3, F-LE.5, F-IF.8b) ──
  page({
    id: 'm.9.exponential-functions~percent-growth',
    title: 'Growth by a percent',
    use: 'Use this for “$800 earns 3% a year, compounded yearly. How much after 4 years?”',
    assumptions: [
      'The amount grows by the same percent r each period: it compounds.',
      'Write r as a decimal: 3% is 0.03, so the growth factor is 1.03.',
      'To find t for a target amount, look along the graph or a table.',
    ],
    variables: [
      num('P', 'P', 'Starting amount', 0.01, 1000000, { unit: '$', step: 0.01 }),
      num('r', 'r', 'Rate per period', 0.1, 50, { unit: '%', step: 0.1 }),
      int('t', 't', 'Periods', 0, 100),
      num('g', 'g', 'Growth factor', 1.001, 1.5, { derived: true }),
      num('A', 'A', 'Amount after t periods', 0.01, 999999999, { unit: '$' }),
    ],
    rules: percentChange(true),
    example: { P: 800, r: 3, t: 4, g: 1.03, A: 900.407048 },
    startWith: ['t', 'P', 'r'],
    equation: '{A} = {P}(1 + {r}%)^{t}',
    representation: {
      kind: 'functionGraph',
      family: 'exponential',
      a: 'P',
      b: 'g',
      at: { x: 't', y: 'A' },
      xMin: 0,
      axes: { x: 'Periods t', y: 'Amount A ($)' },
      marks: ['intercept'],
    },
  }),
  page({
    id: 'm.9.exponential-functions~decay',
    title: 'Decay by a percent',
    use: 'Use this for “A $18,000 car loses 15% of its value each year. When is it worth under $9,000?”',
    assumptions: [
      'The amount loses the same percent r each period, so it keeps 1 − r of itself.',
      'Write r as a decimal: 15% is 0.15, so the decay factor is 0.85.',
      'Read down the table for the first period past a target.',
    ],
    variables: [
      num('P', 'P', 'Starting amount', 0.01, 1000000, { unit: '$', step: 0.01 }),
      num('r', 'r', 'Rate lost per period', 0.1, 99, { unit: '%', step: 0.1 }),
      int('t', 't', 'Periods', 0, 50),
      num('g', 'g', 'Decay factor', 0.01, 0.999, { derived: true }),
      num('A', 'A', 'Amount after t periods', 0.01, 1000000, { unit: '$' }),
    ],
    rules: percentChange(false),
    example: { P: 18000, r: 15, t: 3, g: 0.85, A: 11054.25 },
    startWith: ['t', 'P', 'r'],
    equation: '{A} = {P}(1 − {r}%)^{t}',
    representation: {
      kind: 'table',
      sweep: 't',
      output: 'A',
      params: ['P', 'r'],
      rows: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
  }),
  page({
    id: 'm.9.exponential-functions~doubling',
    title: 'Doubling time',
    use: 'Use this for “400 cells double every 3 hours. How many are there after 12 hours?”',
    assumptions: [
      'The amount doubles once every T time units, however large it is.',
      'After time t it has doubled t ÷ T times, so multiply by 2 that many times.',
      'Use the same time unit for t and T.',
    ],
    variables: [
      num('N0', 'N₀', 'Starting amount', 0.01, 1e9, { step: 1 }),
      num('t', 't', 'Time passed', 0, 1000, { step: 0.5 }),
      num('T', 'T', 'Doubling time', 0.1, 1000, { step: 0.1 }),
      num('k', 'k', 'Number of doublings', 0, 100, { derived: true }),
      num('N', 'N', 'Amount after time t', 0.01, 1e40),
    ],
    rules: [
      derive(
        'k = t ÷ T',
        'k',
        ['t', 'T'],
        '{k} = {t} ÷ {T}',
        (v) => div(v.t!, v.T!),
        '{t} ÷ {T}',
        'Count the doublings: the time passed divided by the doubling time.',
      ),
      rule(
        'N = N0 × 2^k',
        '{N} = {N0} × 2^{k}',
        ['N', 'N0', 'k'],
        (v) => v.N! - v.N0! * 2 ** v.k!,
        {
          N: [
            (v) => fin(v.N0! * 2 ** v.k!),
            '{N0} × 2^{k}',
            'Multiply the starting amount by 2 once for each doubling.',
          ],
          N0: [
            (v) => fin(v.N! / 2 ** v.k!),
            '{N} ÷ 2^{k}',
            'Halve the amount once for each doubling: divide by 2ᵏ.',
          ],
        },
      ),
    ],
    example: { N0: 400, t: 12, T: 3, k: 4, N: 6400 },
    startWith: ['t', 'N0', 'T'],
    equation: '{N} = {N0}(2)^{{t}/{T}}',
    representation: {
      kind: 'table',
      sweep: 't',
      output: 'N',
      params: ['N0', 'T'],
      rows: (v: Values) => [0, 1, 2, 3, 4, 5].map((i) => i * (v.T ?? 1)),
    },
  }),
];
