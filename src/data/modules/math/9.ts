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

const EXPONENTIAL: ModuleDef[] = [
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

// ── Shared lines for polynomials and quadratics ──

/** A number as a factor in a line: negatives bracketed, (−3). */
const sg = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x));
/** A polynomial from its terms, highest power first: [[2, 'x²'], [−5, 'x'], [−12, '']]. */
function poly(terms: [number, string][]): string {
  const parts = terms.filter(([k]) => k !== 0);
  if (parts.length === 0) return '0';
  return parts
    .map(([k, s], i) => {
      const size = Math.abs(k) === 1 && s ? s : `${fmt(Math.abs(k))}${s}`;
      return i === 0 ? `${k < 0 ? '−' : ''}${size}` : ` ${k < 0 ? '−' : '+'} ${size}`;
    })
    .join('');
}
/** x + p written the way a class writes it: x + 3, x − 3, x. */
const xPlus = (p: number, x = 'x') =>
  poly([
    [1, x],
    [p, ''],
  ]);
/** Whether every value named is known. */
const known = (v: Values, ...ids: string[]) => ids.every((id) => v[id] !== undefined);
/** Greatest common factor of two whole numbers (0 when both are 0). */
function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}
/** A whole number's square root, when it has one. */
const intRoot = (n: number) => {
  if (n < 0) return undefined;
  const r = Math.round(Math.sqrt(n));
  return r * r === n ? r : undefined;
};

/** a ≠ 0, as a check. */
const nonzero = (id: string, what: string) =>
  constraint(`${id} ≠ 0`, `${what} {${id}} is not 0`, [id], (v) => v[id] === 0);

/**
 * The zeros of a parabola with vertex (h, k) and stretch a: x = h ∓ √(−k ÷ a), smallest first,
 * worked out; none when the parabola doesn't reach the x-axis.
 */
function vertexZeros(a = 'a', h = 'h', k = 'k', x1 = 'x1', x2 = 'x2'): Rule[] {
  const s = (v: Values) => (v[a] ? -v[k]! / v[a]! : NaN);
  const none = (v: Values) =>
    v[a] !== undefined && v[k] !== undefined && v[a] !== 0 && s(v) < 0
      ? 'The parabola never reaches the x-axis: there are no real zeros.'
      : undefined;
  const one = (id: string, sign: 1 | -1) =>
    derive(
      `${id} = ${h} ${sign < 0 ? '−' : '+'} √(−${k} ÷ ${a})`,
      id,
      [a, h, k],
      `{${id}} = {${h}} ${sign < 0 ? '−' : '+'} √(−{${k}} ÷ {${a}})`,
      (v) => (s(v) >= 0 ? v[h]! + sign * Math.sqrt(s(v)) : undefined),
      `{${h}} ${sign < 0 ? '−' : '+'} √(−{${k}} ÷ {${a}})`,
      sign < 0
        ? 'Set y = 0: a(x − h)² = −k, so x − h = ±√(−k ÷ a). The minus gives the left zero.'
        : 'The plus gives the right zero, as far right of the axis as the left one is left of it.',
      {},
      { message: none },
    );
  return [one(x1, -1), one(x2, 1)];
}

/** The two inputs where a parabola with vertex (h, k) and stretch a reaches y. */
const inputsAt = (v: Values, a = 'a', h = 'h', k = 'k', y = 'y') => {
  const s = v[a] ? (v[y]! - v[k]!) / v[a]! : -1;
  return s < 0 ? undefined : [exact(v[h]! - Math.sqrt(s)), exact(v[h]! + Math.sqrt(s))];
};

// ── Quadratic functions ──

const QUADRATIC_FUNCTIONS: ModuleDef[] = [
  page({
    id: 'm.9.quadratic-functions',
    assumptions: [
      'The vertex is (h, k) and the axis of symmetry is x = h.',
      'a > 0 opens up, with a least value k; a < 0 opens down, with a greatest value k.',
      'The zeros are where y = 0; the y-intercept is where x = 0.',
    ],
    variables: [
      num('a', 'a', 'Stretch', -10, 10, { step: 0.5, fraction: 12 }),
      num('h', 'h', 'Vertex x', -20, 20, { step: 0.5 }),
      num('k', 'k', 'Vertex y', -20, 20, { step: 0.5 }),
      num('c', 'c', 'y-intercept', -5000, 5000),
      num('x1', 'x₁', 'Left zero', -100, 100, { derived: true }),
      num('x2', 'x₂', 'Right zero', -100, 100, { derived: true }),
      num('x', 'x', 'Input', -40, 40, { step: 0.5 }),
      num('y', 'y', 'Output', -100000, 100000),
    ],
    rules: [
      nonzero('a', 'The stretch'),
      rule(
        'y = a(x − h)² + k',
        '{y} = {a} × ({x} − {h})² + {k}',
        ['y', 'a', 'x', 'h', 'k'],
        (v) => v.y! - (v.a! * (v.x! - v.h!) ** 2 + v.k!),
        {
          y: [
            (v) => exact(v.a! * (v.x! - v.h!) ** 2 + v.k!),
            '{a} × ({x} − {h})² + {k}',
            'Find the distance from h, square it, multiply by a, then add k.',
          ],
          x: [
            (v) => inputsAt(v),
            '{h} ± √(({y} − {k}) ÷ {a})',
            'Take k from both sides, divide by a, then take the square root: one input each side of the axis.',
          ],
        },
      ),
      rule(
        'c = a × h² + k',
        '{c} = {a} × {h}² + {k}',
        ['c', 'a', 'h', 'k'],
        (v) => v.c! - (v.a! * v.h! ** 2 + v.k!),
        {
          c: [
            (v) => exact(v.a! * v.h! ** 2 + v.k!),
            '{a} × {h}² + {k}',
            'Put x = 0 into the rule: y = a(0 − h)² + k = ah² + k.',
          ],
          a: [
            (v) => (v.h ? exact((v.c! - v.k!) / v.h! ** 2) : undefined),
            '({c} − {k}) ÷ {h}²',
            'The y-intercept is on the graph: take k from both sides, then divide by h².',
          ],
        },
      ),
      ...vertexZeros(),
    ],
    example: { a: 2, h: 1, k: -8, c: -6, x1: -1, x2: 3, x: 4, y: 10 },
    startWith: ['x', 'a', 'h', 'k'],
    equation: 'y = {a}(x − {h})² + {k}',
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'vertex',
      a: 'a',
      h: 'h',
      k: 'k',
      at: { x: 'x', y: 'y' },
      shows: { vertex: { x: 'h', y: 'k' }, zeros: ['x1', 'x2'], intercept: 'c' },
      marks: ['vertex', 'zeros', 'intercept', 'range'],
    },
  }),
  page({
    id: 'm.9.quadratic-functions~standard-form',
    title: 'Standard form: the vertex from −b/(2a)',
    use: 'Use this for “Find the vertex and the zeros of y = x² − 6x + 5.”',
    assumptions: [
      'In y = ax² + bx + c the axis of symmetry is x = −b/(2a).',
      'Put that x back into the rule to get the vertex’s y.',
      'c is the y-intercept, the value at x = 0.',
    ],
    variables: [
      num('a', 'a', 'x² coefficient', -10, 10, { step: 0.5, fraction: 12 }),
      num('b', 'b', 'x coefficient', -20, 20, { step: 0.5 }),
      num('c', 'c', 'Constant (y-intercept)', -50, 50, { step: 0.5 }),
      num('h', 'h', 'Vertex x', -1000, 1000, { derived: true, fraction: 40 }),
      num('k', 'k', 'Vertex y', -1e6, 1e6, { derived: true, fraction: 40 }),
      num('x1', 'x₁', 'Left zero', -1000, 1000, { derived: true }),
      num('x2', 'x₂', 'Right zero', -1000, 1000, { derived: true }),
      num('x', 'x', 'Input', -40, 40, { step: 0.5 }),
      num('y', 'y', 'Output', -1e6, 1e6),
    ],
    rules: [
      nonzero('a', 'The x² coefficient'),
      derive(
        'h = −b ÷ (2a)',
        'h',
        ['b', 'a'],
        '{h} = −{b} ÷ (2 × {a})',
        (v) => div(-v.b!, 2 * v.a!),
        '−{b} ÷ (2 × {a})',
        'The axis of symmetry is x = −b/(2a), halfway between the zeros.',
      ),
      derive(
        'k = ah² + bh + c',
        'k',
        ['a', 'h', 'b', 'c'],
        '{k} = {a} × {h}² + {b} × {h} + {c}',
        (v) => v.a! * v.h! ** 2 + v.b! * v.h! + v.c!,
        '{a} × {h}² + {b} × {h} + {c}',
        'The vertex is on the graph: put x = h into the rule.',
      ),
      ...vertexZeros(),
      rule(
        'y = ax² + bx + c',
        '{y} = {a} × {x}² + {b} × {x} + {c}',
        ['y', 'a', 'x', 'b', 'c'],
        (v) => v.y! - (v.a! * v.x! ** 2 + v.b! * v.x! + v.c!),
        {
          y: [
            (v) => exact(v.a! * v.x! ** 2 + v.b! * v.x! + v.c!),
            '{a} × {x}² + {b} × {x} + {c}',
            'Put the input into the rule: square it first, then multiply and add.',
          ],
        },
      ),
    ],
    example: { a: 1, b: -6, c: 5, h: 3, k: -4, x1: 1, x2: 5, x: 6, y: 5 },
    startWith: ['x', 'a', 'b', 'c'],
    equation: 'y = {a:coef}x² + {b}x + {c}',
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'standard',
      a: 'a',
      b: 'b',
      c: 'c',
      at: { x: 'x', y: 'y' },
      shows: { vertex: { x: 'h', y: 'k' }, zeros: ['x1', 'x2'], intercept: 'c' },
      marks: ['vertex', 'zeros', 'intercept'],
    },
  }),
  page({
    id: 'm.9.quadratic-functions~factored-form',
    title: 'Factored form: the zeros',
    use: 'Use this for “Graph y = −2(x − 1)(x − 5): its zeros, axis, vertex and y-intercept.”',
    assumptions: [
      'y = a(x − p)(x − q) is 0 when x = p or x = q: a product is 0 only when a factor is 0.',
      'The axis of symmetry is halfway between the zeros.',
      'Put the axis’s x into the rule to get the vertex’s y.',
    ],
    variables: [
      num('a', 'a', 'Stretch', -10, 10, { step: 0.5, fraction: 12 }),
      num('p', 'p', 'First zero', -20, 20, { step: 0.5 }),
      num('q', 'q', 'Second zero', -20, 20, { step: 0.5 }),
      num('h', 'h', 'Axis of symmetry x', -20, 20, { derived: true }),
      num('k', 'k', 'Vertex y', -100000, 100000, { derived: true }),
      num('c', 'c', 'y-intercept', -100000, 100000, { derived: true }),
    ],
    rules: [
      nonzero('a', 'The stretch'),
      derive(
        'h = (p + q) ÷ 2',
        'h',
        ['p', 'q'],
        '{h} = ({p} + {q}) ÷ 2',
        (v) => (v.p! + v.q!) / 2,
        '({p} + {q}) ÷ 2',
        'The axis is halfway between the zeros: their mean.',
      ),
      derive(
        'k = a(h − p)(h − q)',
        'k',
        ['a', 'h', 'p', 'q'],
        '{k} = {a} × ({h} − {p}) × ({h} − {q})',
        (v) => v.a! * (v.h! - v.p!) * (v.h! - v.q!),
        '{a} × ({h} − {p}) × ({h} − {q})',
        'The vertex is on the axis: put x = h into the rule.',
      ),
      derive(
        'c = a × p × q',
        'c',
        ['a', 'p', 'q'],
        '{c} = {a} × (0 − {p}) × (0 − {q})',
        (v) => v.a! * v.p! * v.q!,
        '{a} × (0 − {p}) × (0 − {q})',
        'Put x = 0 into the rule for the y-intercept.',
      ),
    ],
    example: { a: -2, p: 1, q: 5, h: 3, k: 8, c: -10 },
    startWith: ['a', 'p', 'q'],
    equation: 'y = {a}(x − {p})(x − {q})',
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'factored',
      a: 'a',
      p: 'p',
      q: 'q',
      shows: { vertex: { x: 'h', y: 'k' }, intercept: 'c' },
      marks: ['zeros', 'vertex', 'intercept'],
    },
  }),
  page({
    id: 'm.9.quadratic-functions~projectile',
    title: 'A ball thrown up',
    use: 'Use this for “A ball is thrown up at 19.6 m/s from 2 m. When is it highest, and how high?”',
    assumptions: [
      'Gravity pulls the ball down at g = 9.8 m/s², so the t² term is −½gt² = −4.9t².',
      'The top is halfway between the times the ball is at any one height, at t = v ÷ g.',
      'The ball lands when h = 0; take the positive time.',
    ],
    variables: [
      num('g', 'g', 'Gravity', 0.1, 30, { unit: 'm/s²', units: ['m/s²'], step: 0.1 }),
      num('v', 'v', 'Launch speed', 0, 100, { unit: 'm/s', units: ['m/s'], step: 0.1 }),
      num('h0', 'h₀', 'Starting height', 0, 500, { unit: 'm', units: ['m'], step: 0.1 }),
      num('t', 't', 'Time', 0, 60, { unit: 's', units: ['s'], step: 0.1 }),
      num('H', 'h', 'Height', 0, 10000, { unit: 'm', units: ['m'] }),
      num('A', 'a', 't² coefficient, −½g', -15, -0.05, {
        unit: 'm/s²',
        units: ['m/s²'],
        derived: true,
      }),
      num('T', 't_top', 'Time at the top', 0, 1000, { unit: 's', units: ['s'], derived: true }),
      num('M', 'h_max', 'Greatest height', 0, 100000, { unit: 'm', units: ['m'], derived: true }),
    ],
    rules: [
      derive(
        'a = −g ÷ 2',
        'A',
        ['g'],
        '{A} = −{g} ÷ 2',
        (v) => -v.g! / 2,
        '−{g} ÷ 2',
        'Gravity’s pull makes the t² term −½g.',
      ),
      rule(
        'h = −½gt² + vt + h₀',
        '{H} = −{g} ÷ 2 × {t}² + {v} × {t} + {h0}',
        ['H', 'g', 't', 'v', 'h0'],
        (v) => v.H! - (-(v.g! / 2) * v.t! ** 2 + v.v! * v.t! + v.h0!),
        {
          H: [
            (v) => exact(-(v.g! / 2) * v.t! ** 2 + v.v! * v.t! + v.h0!),
            '−{g} ÷ 2 × {t}² + {v} × {t} + {h0}',
            'Put the time into the height rule.',
          ],
          t: [
            (v) => {
              const D = v.v! ** 2 + 2 * v.g! * (v.h0! - v.H!);
              if (D < 0) return undefined;
              return [(v.v! - Math.sqrt(D)) / v.g!, (v.v! + Math.sqrt(D)) / v.g!]
                .filter((x) => x >= 0)
                .map(exact);
            },
            '({v} ± √({v}² + 2 × {g} × ({h0} − {H}))) ÷ {g}',
            'Write the rule = 0 and use the quadratic formula: the ball is at a height once going up, once coming down.',
          ],
          h0: [
            (v) => exact(v.H! + (v.g! / 2) * v.t! ** 2 - v.v! * v.t!),
            '{H} + {g} ÷ 2 × {t}² − {v} × {t}',
            'Move the t terms to the other side.',
          ],
        },
      ),
      derive(
        't_top = v ÷ g',
        'T',
        ['v', 'g'],
        '{T} = {v} ÷ {g}',
        (v) => div(v.v!, v.g!),
        '{v} ÷ {g}',
        'The top is on the axis of symmetry, t = −b/(2a) = v ÷ g.',
      ),
      derive(
        'h_max = h₀ + v² ÷ (2g)',
        'M',
        ['h0', 'v', 'g'],
        '{M} = {h0} + {v}² ÷ (2 × {g})',
        (v) => v.h0! + v.v! ** 2 / (2 * v.g!),
        '{h0} + {v}² ÷ (2 × {g})',
        'Put the top’s time into the height rule; it simplifies to h₀ + v² ÷ (2g).',
      ),
    ],
    example: { g: 9.8, v: 19.6, h0: 2, t: 1, H: 16.7, A: -4.9, T: 2, M: 21.6 },
    // The graph's axes are in meters and seconds, so the units stay put.
    unitSystems: ['metric'],
    startWith: ['t', 'g', 'v', 'h0'],
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'standard',
      a: 'A',
      b: 'v',
      c: 'h0',
      name: 'h',
      at: { x: 't', y: 'H' },
      xMin: 0,
      axes: { x: 'Time t (s)', y: 'Height h (m)' },
      shows: { vertex: { x: 'T', y: 'M' } },
      marks: ['vertex', 'zeros'],
    },
  }),
];

// ── Polynomial operations ──

/** A coefficient on tile edges: a whole number from −10 to 10. */
const tile = (id: string, symbol: string, name: string, more: Partial<VariableDef> = {}) =>
  int(id, symbol, name, -10, 10, more);

const POLYNOMIAL_OPERATIONS: ModuleDef[] = [
  page({
    id: 'm.9.polynomial-operations',
    assumptions: [
      'Every term of one factor multiplies every term of the other: four products.',
      'The two x terms are like terms: combine them.',
      'A negative times a negative is positive.',
    ],
    variables: [
      tile('a', 'a', 'x in the first factor'),
      tile('b', 'b', 'Number in the first factor'),
      tile('c', 'c', 'x in the second factor'),
      tile('d', 'd', 'Number in the second factor'),
      int('p', 'p', 'x² terms', -100, 100, { derived: true }),
      int('q', 'q', 'x terms', -200, 200, { derived: true }),
      int('r', 'r', 'Number term', -100, 100, { derived: true }),
    ],
    rules: [
      nonzero('a', 'The x in the first factor'),
      nonzero('c', 'The x in the second factor'),
      derive(
        'p = a × c',
        'p',
        ['a', 'c'],
        '{p} = {a} × {c}',
        (v) => v.a! * v.c!,
        '{a} × {c}',
        'First terms: ax times cx gives acx².',
      ),
      derive(
        'q = a × d + b × c',
        'q',
        ['a', 'd', 'b', 'c'],
        '{q} = {a} × {d} + {b} × {c}',
        (v) => v.a! * v.d! + v.b! * v.c!,
        '{a} × {d} + {b} × {c}',
        'Outer and inner terms: ax times d and b times cx are both x terms, so add them.',
      ),
      derive(
        'r = b × d',
        'r',
        ['b', 'd'],
        '{r} = {b} × {d}',
        (v) => v.b! * v.d!,
        '{b} × {d}',
        'Last terms: the two numbers multiply to the number term.',
        {
          note: (v) =>
            known(v, 'p', 'q', 'r')
              ? `→ ${poly([
                  [v.p!, 'x²'],
                  [v.q!, 'x'],
                  [v.r!, ''],
                ])}`
              : '',
        },
      ),
    ],
    example: { a: 2, b: 3, c: 1, d: -4, p: 2, q: -5, r: -12 },
    startWith: ['a', 'b', 'c', 'd'],
    equation: '({a:coef}x + {b})({c:coef}x + {d}) = {p:coef}x² + {q}x + {r}',
    representation: {
      kind: 'algebraTiles',
      mode: 'rectangle',
      given: 'factors',
      factors: { p: 'a', q: 'b', r: 'c', s: 'd' },
      product: { x2: 'p', x: 'q', unit: 'r' },
    },
  }),
  page({
    id: 'm.9.polynomial-operations~add-subtract',
    title: 'Add and subtract polynomials',
    use: 'Use this for “(3x² − 2x + 5) − (x² + 4x − 1)”.',
    assumptions: [
      'Only like terms combine: x² with x², x with x, numbers with numbers.',
      'To subtract, add the opposite: change the sign of every term in the second bracket.',
      'A positive and a negative tile of the same size make zero.',
    ],
    variables: [
      tile('a', 'a', 'x² in the first'),
      tile('b', 'b', 'x in the first'),
      tile('c', 'c', 'Number in the first'),
      int('o', 'o', 'Add (1) or subtract (2)', 1, 2, { allowed: [1, 2] }),
      tile('d', 'd', 'x² in the second'),
      tile('e', 'e', 'x in the second'),
      tile('f', 'f', 'Number in the second'),
      tile('D', 'd′', 'x² added', { derived: true }),
      tile('E', 'e′', 'x added', { derived: true }),
      tile('F', 'f′', 'Number added', { derived: true }),
      int('p', 'p', 'x² in the answer', -20, 20, { derived: true }),
      int('q', 'q', 'x in the answer', -20, 20, { derived: true }),
      int('r', 'r', 'Number in the answer', -20, 20, { derived: true }),
    ],
    rules: [
      ...(
        [
          ['D', 'd', 'x²'],
          ['E', 'e', 'x'],
          ['F', 'f', 'number'],
        ] as const
      ).map(([id, from, what]) =>
        derive(
          `${id} = ±${from}`,
          id,
          [from, 'o'],
          `{${id}} = {${from}} × (1 or −1, as {o} says)`,
          // 1 for +, −1 for − (o is 1 or 2): one smooth rule, so the search reads it right.
          (v) => v[from]! * (3 - 2 * v.o!),
          (v) => (v.o === 2 ? `−1 × {${from}}` : `{${from}}`),
          (v) =>
            v.o === 2
              ? `Subtracting adds the opposite: the second ${what} term changes sign.`
              : `Adding keeps the second ${what} term as it is.`,
          {},
          {
            check: (v) =>
              v.o === 2
                ? `${fmt(v[id]!)} = −1 × ${sg(v[from]!)}`
                : `${fmt(v[id]!)} = ${fmt(v[from]!)}`,
          },
        ),
      ),
      ...(
        [
          ['p', 'a', 'D', 'x² terms'],
          ['q', 'b', 'E', 'x terms'],
          ['r', 'c', 'F', 'numbers'],
        ] as const
      ).map(([id, x, y, what]) =>
        derive(
          `${id} = ${x} + ${y}`,
          id,
          [x, y],
          `{${id}} = {${x}} + {${y}}`,
          (v) => v[x]! + v[y]!,
          `{${x}} + {${y}}`,
          `Combine the ${what}.`,
        ),
      ),
    ],
    example: { a: 3, b: -2, c: 5, o: 2, d: 1, e: 4, f: -1, D: -1, E: -4, F: 1, p: 2, q: -6, r: 6 },
    startWith: ['a', 'b', 'c', 'o', 'd', 'e', 'f'],
    equation:
      '({a:coef}x² + {b}x + {c}) {o:op} ({d:coef}x² + {e}x + {f}) = {p:coef}x² + {q}x + {r}',
    representation: {
      kind: 'algebraTiles',
      mode: 'collect',
      tiles: { x2: 'a', x: 'b', unit: 'c' },
      plus: { x2: 'D', x: 'E', unit: 'F' },
      sum: { x2: 'p', x: 'q', unit: 'r' },
    },
  }),
  page({
    id: 'm.9.polynomial-operations~square',
    title: 'Square a binomial',
    use: 'Use this for “(3x − 2)²”.',
    assumptions: [
      '(ax + b)² means (ax + b)(ax + b), a square of tiles.',
      'The middle term is 2abx, from the two equal rectangles: (ax + b)² is not a²x² + b².',
    ],
    variables: [
      tile('a', 'a', 'x in the bracket'),
      tile('b', 'b', 'Number in the bracket'),
      int('p', 'p', 'x² terms', 0, 100, { derived: true }),
      int('q', 'q', 'x terms', -200, 200, { derived: true }),
      int('r', 'r', 'Number term', 0, 100, { derived: true }),
    ],
    rules: [
      nonzero('a', 'The x in the bracket'),
      derive(
        'p = a²',
        'p',
        ['a'],
        '{p} = {a}²',
        (v) => v.a! ** 2,
        '{a}²',
        'The x term times itself.',
      ),
      derive(
        'q = 2ab',
        'q',
        ['a', 'b'],
        '{q} = 2 × {a} × {b}',
        (v) => 2 * v.a! * v.b!,
        '2 × {a} × {b}',
        'The outer and inner products are the same, abx twice.',
      ),
      derive(
        'r = b²',
        'r',
        ['b'],
        '{r} = {b}²',
        (v) => v.b! ** 2,
        '{b}²',
        'The number times itself: always 0 or more.',
      ),
    ],
    example: { a: 3, b: -2, p: 9, q: -12, r: 4 },
    startWith: ['a', 'b'],
    equation: '({a:coef}x + {b})² = {p:coef}x² + {q}x + {r}',
    representation: {
      kind: 'algebraTiles',
      mode: 'rectangle',
      given: 'factors',
      factors: { p: 'a', q: 'b', r: 'a', s: 'b' },
      product: { x2: 'p', x: 'q', unit: 'r' },
    },
  }),
];

// ── Factoring ──

/** p and q with p + q = b and p × q = c (p the larger), when b² − 4c is a perfect square. */
const pairFor = (b: number, c: number) => {
  const r = intRoot(b * b - 4 * c);
  return r === undefined ? undefined : { p: (b + r) / 2, q: (b - r) / 2 };
};
const noPair = (v: Values) =>
  v.b !== undefined && v.c !== undefined && !pairFor(v.b, v.c)
    ? 'No two whole numbers multiply to c and add to b: it does not factor over the integers.'
    : undefined;

/**
 * The ac method for ax² + bx + c (a > 0): m + n = b, m × n = ac; then p = GCF(a, m), the
 * common bracket (rx + s) = (ax + m) ÷ p, and q = n ÷ r.
 */
function acSplit(a: number, b: number, c: number) {
  const r0 = intRoot(b * b - 4 * a * c);
  if (r0 === undefined || !(a > 0)) return undefined;
  let m = (b + r0) / 2;
  let n = b - m;
  if (m === 0) [m, n] = [n, m];
  const p = gcd(a, m) || a;
  const r = a / p;
  const s = m / p;
  return { m, n, p, r, s, q: n / r };
}
const noSplit = (v: Values) =>
  v.a !== undefined && v.b !== undefined && v.c !== undefined && !acSplit(v.a, v.b, v.c)
    ? 'No two whole numbers multiply to ac and add to b: it does not factor over the integers.'
    : undefined;

const FACTORING: ModuleDef[] = [
  page({
    id: 'm.9.factoring',
    assumptions: [
      'Find two numbers whose product is c and whose sum is b.',
      'Check by multiplying the brackets back out.',
      'Not every trinomial factors over the integers.',
    ],
    variables: [
      int('b', 'b', 'x coefficient', -20, 20),
      int('c', 'c', 'Number term', -100, 100),
      tile('p', 'p', 'First number', { derived: true }),
      tile('q', 'q', 'Second number', { derived: true }),
    ],
    rules: [
      derive(
        'p = (b + √(b² − 4c)) ÷ 2',
        'p',
        ['b', 'c'],
        '{p} = ({b} + √({b}² − 4 × {c})) ÷ 2',
        (v) => pairFor(v.b!, v.c!)?.p,
        '({b} + √({b}² − 4 × {c})) ÷ 2',
        'List the factor pairs of c and find the pair that adds to b; this is the larger of the two.',
        {
          work: (v) => {
            const q = v.b! - v.p!;
            return [
              `${sg(v.p!)} × ${sg(q)} = ${fmt(v.c!)}`,
              `${sg(v.p!)} + ${sg(q)} = ${fmt(v.b!)}`,
            ];
          },
        },
        { message: noPair },
      ),
      derive(
        'q = b − p',
        'q',
        ['b', 'p'],
        '{q} = {b} − {p}',
        (v) => v.b! - v.p!,
        '{b} − {p}',
        'The two numbers add to b.',
        {
          note: (v) =>
            known(v, 'b', 'c', 'p', 'q')
              ? `→ ${poly([
                  [1, 'x²'],
                  [v.b!, 'x'],
                  [v.c!, ''],
                ])} = (${xPlus(v.p!)})(${xPlus(v.q!)})`
              : '',
        },
      ),
    ],
    example: { b: 2, c: -15, p: 5, q: -3 },
    startWith: ['b', 'c'],
    equation: 'x² + {b}x + {c} = (x + {p})(x + {q})',
    representation: {
      kind: 'algebraTiles',
      mode: 'rectangle',
      given: 'product',
      factors: { p: 1, q: 'p', r: 1, s: 'q' },
      product: { x2: 1, x: 'b', unit: 'c' },
    },
  }),
  page({
    id: 'm.9.factoring~leading-coefficient',
    title: 'Factor when a is not 1',
    use: 'Use this for “Factor 2x² + 7x + 3.”',
    assumptions: [
      'Find two numbers m and n that multiply to ac and add to b.',
      'Split bx into mx + nx, then factor each pair: both leave the same bracket.',
      'Check by multiplying the brackets back out.',
    ],
    variables: [
      int('a', 'a', 'x² coefficient', 1, 10),
      int('b', 'b', 'x coefficient', -50, 50),
      int('c', 'c', 'Number term', -50, 50),
      int('m', 'm', 'First part of b', -500, 500, { derived: true }),
      int('n', 'n', 'Second part of b', -500, 500, { derived: true }),
      tile('p', 'p', 'x in the first factor', { derived: true }),
      tile('q', 'q', 'Number in the first factor', { derived: true }),
      tile('r', 'r', 'x in the second factor', { derived: true }),
      tile('s', 's', 'Number in the second factor', { derived: true }),
    ],
    rules: [
      derive(
        'm = (b + √(b² − 4ac)) ÷ 2',
        'm',
        ['a', 'b', 'c'],
        '{m} = ({b} + √({b}² − 4 × {a} × {c})) ÷ 2',
        (v) => acSplit(v.a!, v.b!, v.c!)?.m,
        '({b} + √({b}² − 4 × {a} × {c})) ÷ 2',
        'Multiply a by c, then find the factor pair of ac that adds to b.',
        {
          work: (v) => {
            const n = v.b! - v.m!;
            return [
              `${fmt(v.a!)} × ${sg(v.c!)} = ${fmt(v.a! * v.c!)}`,
              `${sg(v.m!)} × ${sg(n)} = ${fmt(v.a! * v.c!)}`,
              `${sg(v.m!)} + ${sg(n)} = ${fmt(v.b!)}`,
            ];
          },
        },
        { message: noSplit },
      ),
      derive(
        'n = b − m',
        'n',
        ['b', 'm'],
        '{n} = {b} − {m}',
        (v) => v.b! - v.m!,
        '{b} − {m}',
        'The two parts add to b.',
        {
          note: (v) =>
            known(v, 'a', 'm', 'n', 'c')
              ? `→ ${poly([
                  [v.a!, 'x²'],
                  [v.m!, 'x'],
                  [v.n!, 'x'],
                  [v.c!, ''],
                ])}`
              : '',
        },
      ),
      derive(
        'p = GCF of a and m',
        'p',
        ['a', 'm'],
        '{p} = greatest common factor of {a} and {m}',
        (v) => gcd(v.a!, v.m!) || v.a!,
        'greatest common factor of {a} and {m}',
        'Take the greatest common factor out of the first pair, ax² + mx.',
      ),
      derive(
        'r = a ÷ p',
        'r',
        ['a', 'p'],
        '{r} = {a} ÷ {p}',
        (v) => div(v.a!, v.p!),
        '{a} ÷ {p}',
        'What is left of ax² in the bracket, after px comes out.',
      ),
      derive(
        's = m ÷ p',
        's',
        ['m', 'p'],
        '{s} = {m} ÷ {p}',
        (v) => div(v.m!, v.p!),
        '{m} ÷ {p}',
        'What is left of mx in the bracket: the common bracket is (rx + s).',
      ),
      derive(
        'q = n ÷ r',
        'q',
        ['n', 'r'],
        '{q} = {n} ÷ {r}',
        (v) => div(v.n!, v.r!),
        '{n} ÷ {r}',
        'The second pair, nx + c, is q times the same bracket.',
        {
          note: (v) => {
            if (!known(v, 'p', 'q', 'r', 's')) return '';
            const common = poly([
              [v.r!, 'x'],
              [v.s!, ''],
            ]);
            return `→ ${fmt(v.p!)}x(${common}) ${v.q! < 0 ? '−' : '+'} ${fmt(Math.abs(v.q!))}(${common})`;
          },
        },
      ),
    ],
    example: { a: 2, b: 7, c: 3, m: 6, n: 1, p: 2, q: 1, r: 1, s: 3 },
    startWith: ['a', 'b', 'c'],
    equation: '{a:coef}x² + {b}x + {c} = ({p:coef}x + {q})({r:coef}x + {s})',
    representation: {
      kind: 'algebraTiles',
      mode: 'rectangle',
      given: 'product',
      factors: { p: 'p', q: 'q', r: 'r', s: 's' },
      product: { x2: 'a', x: 'b', unit: 'c' },
    },
  }),
  page({
    id: 'm.9.factoring~gcf',
    title: 'Take out the greatest common factor',
    use: 'Use this for “Factor 6x² + 15x.”',
    assumptions: [
      'Find the greatest common factor of the coefficients; x divides both terms too.',
      'Divide each term by the common factor to fill the bracket.',
      'Check by distributing back.',
    ],
    variables: [
      int('a', 'a', 'x² coefficient', -50, 50),
      int('b', 'b', 'x coefficient', -50, 50),
      tile('g', 'g', 'Greatest common factor', { derived: true }),
      tile('p', 'p', 'x in the bracket', { derived: true }),
      tile('q', 'q', 'Number in the bracket', { derived: true }),
    ],
    rules: [
      nonzero('a', 'The x² coefficient'),
      derive(
        'g = GCF of a and b',
        'g',
        ['a', 'b'],
        '{g} = greatest common factor of {a} and {b}',
        (v) => gcd(v.a!, v.b!) || undefined,
        'greatest common factor of {a} and {b}',
        'The largest whole number that divides both coefficients.',
      ),
      derive(
        'p = a ÷ g',
        'p',
        ['a', 'g'],
        '{p} = {a} ÷ {g}',
        (v) => div(v.a!, v.g!),
        '{a} ÷ {g}',
        'Divide the x² term by gx: what is left is px.',
      ),
      derive(
        'q = b ÷ g',
        'q',
        ['b', 'g'],
        '{q} = {b} ÷ {g}',
        (v) => div(v.b!, v.g!),
        '{b} ÷ {g}',
        'Divide the x term by gx: what is left is a number.',
      ),
    ],
    example: { a: 6, b: 15, g: 3, p: 2, q: 5 },
    startWith: ['a', 'b'],
    equation: '{a:coef}x² + {b}x = {g:coef}x({p:coef}x + {q})',
    representation: {
      kind: 'algebraTiles',
      mode: 'rectangle',
      given: 'product',
      factors: { p: 'g', q: 0, r: 'p', s: 'q' },
      product: { x2: 'a', x: 'b', unit: 0 },
    },
  }),
  page({
    id: 'm.9.factoring~special',
    title: 'Difference of two squares',
    use: 'Use this for “Factor 9x² − 25.”',
    assumptions: [
      'a²x² − b² = (ax + b)(ax − b): the two middle terms cancel.',
      'Both terms must be perfect squares, and they must be subtracted.',
      'A sum of two squares, such as x² + 4, does not factor over the integers.',
    ],
    variables: [
      int('a', 'a', 'x² coefficient', 1, 100),
      int('c', 'c', 'Number taken away', 1, 100),
      tile('p', 'p', 'Square root of a', { derived: true }),
      tile('q', 'q', 'Square root of c', { derived: true }),
      tile('u', '−q', 'Number in the second factor', { derived: true }),
      int('z', 'z', 'x terms, which cancel', -200, 200, { derived: true }),
    ],
    rules: [
      derive(
        'p = √a',
        'p',
        ['a'],
        '{p} = √{a}',
        (v) => intRoot(v.a!),
        '√{a}',
        'The first term is a square: (px)² = ax².',
        {},
        {
          message: (v) =>
            v.a !== undefined && intRoot(v.a) === undefined
              ? 'a is not a perfect square, so this is not a difference of two squares.'
              : undefined,
        },
      ),
      derive(
        'q = √c',
        'q',
        ['c'],
        '{q} = √{c}',
        (v) => intRoot(v.c!),
        '√{c}',
        'The number taken away is a square too: q² = c.',
        {},
        {
          message: (v) =>
            v.c !== undefined && intRoot(v.c) === undefined
              ? 'c is not a perfect square, so this is not a difference of two squares.'
              : undefined,
        },
      ),
      derive(
        'u = −q',
        'u',
        ['q'],
        '{u} = −{q}',
        (v) => -v.q!,
        '−{q}',
        'One bracket adds q and the other takes it away.',
      ),
      derive(
        'z = p × u + q × p',
        'z',
        ['p', 'u', 'q'],
        '{z} = {p} × {u} + {q} × {p}',
        (v) => v.p! * v.u! + v.q! * v.p!,
        '{p} × {u} + {q} × {p}',
        'Check the middle: the outer and inner x terms are opposites, so they cancel.',
      ),
    ],
    example: { a: 9, c: 25, p: 3, q: 5, u: -5, z: 0 },
    startWith: ['a', 'c'],
    equation: '{a:coef}x² − {c} = ({p:coef}x + {q})({p:coef}x − {q})',
    representation: {
      kind: 'algebraTiles',
      mode: 'rectangle',
      given: 'product',
      factors: { p: 'p', q: 'q', r: 'p', s: 'u' },
    },
  }),
];

// ── Solving quadratics ──

/** The discriminant and the two roots of ax² + bx + c = 0, smallest first. */
function formulaRules(a = 'a', b = 'b', c = 'c'): Rule[] {
  const root = (id: string, first: boolean) =>
    derive(
      `${id} = (−b ${first ? '−' : '+'} √D) ÷ (2a)`,
      id,
      [b, 'D', a],
      `{${id}} = (−{${b}} ${first ? '−' : '+'} √{D}) ÷ (2 × {${a}})`,
      (v) => {
        if (!v[a] || v.D! < 0) return undefined;
        return (-v[b]! + (first ? -1 : 1) * Math.sqrt(v.D!)) / (2 * v[a]!);
      },
      `(−{${b}} ${first ? '−' : '+'} √{D}) ÷ (2 × {${a}})`,
      first
        ? 'The quadratic formula, x = (−b ± √D) ÷ (2a), with the minus sign.'
        : 'The quadratic formula with the plus sign.',
      first
        ? {
            work: (v) =>
              intRoot(v.D!) === undefined
                ? [`x = (${fmt(-v[b]!)} ± √${fmt(v.D!)}) ÷ ${fmt(2 * v[a]!)}, exactly`]
                : [],
          }
        : {},
    );
  return [
    derive(
      'D = b² − 4ac',
      'D',
      [b, a, c],
      `{D} = {${b}}² − 4 × {${a}} × {${c}}`,
      (v) => v[b]! ** 2 - 4 * v[a]! * v[c]!,
      `{${b}}² − 4 × {${a}} × {${c}}`,
      'The discriminant counts the roots: positive two, zero one, negative none.',
      {},
      {
        message: (v) =>
          v.D !== undefined && v.D < 0
            ? 'D is negative: the parabola misses the x-axis, so there are no real roots.'
            : undefined,
      },
    ),
    root('x1', true),
    root('x2', false),
  ];
}

/** The zeros of x² + bx + c, smallest first, from D = b² − 4c. */
function monicZeros(): Rule[] {
  const root = (id: string, sign: 1 | -1) =>
    derive(
      `${id} = (−b ${sign < 0 ? '−' : '+'} √D) ÷ 2`,
      id,
      ['b', 'D'],
      `{${id}} = (−{b} ${sign < 0 ? '−' : '+'} √{D}) ÷ 2`,
      (v) => (v.D! >= 0 ? (-v.b! + sign * Math.sqrt(v.D!)) / 2 : undefined),
      `(−{b} ${sign < 0 ? '−' : '+'} √{D}) ÷ 2`,
      sign < 0
        ? 'Solve x² + bx + c = 0 first: the quadratic formula with a = 1 and the minus sign.'
        : 'The plus sign gives the larger zero.',
    );
  return [
    derive(
      'D = b² − 4c',
      'D',
      ['b', 'c'],
      '{D} = {b}² − 4 × {c}',
      (v) => v.b! ** 2 - 4 * v.c!,
      '{b}² − 4 × {c}',
      'The discriminant, with a = 1.',
      {},
      {
        message: (v) =>
          v.D !== undefined && v.D < 0
            ? 'D is negative: the parabola is above the x-axis everywhere, so it has no zeros to split the line.'
            : undefined,
      },
    ),
    root('x1', -1),
    root('x2', 1),
  ];
}

const QUADRATIC_INEQUALITIES: ModuleDef[] = [
  page({
    id: 'm.9.quadratic-formula~inequality',
    title: 'Quadratic inequality: between the zeros',
    use: 'Use this for “Solve x² − 2x − 8 < 0.”',
    assumptions: [
      'Solve the equation x² + bx + c = 0 first: its zeros split the number line.',
      'The parabola opens up, so it is below the x-axis between its zeros.',
      'The zeros make it 0, not less than 0, so they are left out: x₁ < x < x₂.',
    ],
    variables: [
      int('b', 'b', 'x coefficient', -20, 20),
      int('c', 'c', 'Number term', -100, 100),
      num('D', 'D', 'Discriminant', -400, 800, { derived: true }),
      num('x1', 'x₁', 'Smaller zero', -40, 40, { derived: true }),
      num('x2', 'x₂', 'Larger zero', -40, 40, { derived: true }),
    ],
    rules: monicZeros(),
    example: { b: -2, c: -8, D: 36, x1: -2, x2: 4 },
    startWith: ['b', 'c'],
    equation: 'x² + {b}x + {c} < 0',
    pictureLabels: ['D'],
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'standard',
      a: 1,
      b: 'b',
      c: 'c',
      shade: { from: 'x1', to: 'x2' },
      shows: { zeros: ['x1', 'x2'] },
      marks: ['zeros'],
    },
  }),
  page({
    id: 'm.9.quadratic-formula~inequality-outside',
    title: 'Quadratic inequality: outside the zeros',
    use: 'Use this for “Solve x² − x − 6 ≥ 0.”',
    assumptions: [
      'Solve the equation x² + bx + c = 0 first: its zeros split the number line.',
      'The parabola opens up, so it is on or above the x-axis outside its zeros.',
      'The zeros make it 0, so ≥ takes them in: x ≤ x₁ or x ≥ x₂.',
    ],
    variables: [
      int('b', 'b', 'x coefficient', -10, 10),
      int('c', 'c', 'Number term', -25, 25),
      num('D', 'D', 'Discriminant', -100, 200, { derived: true }),
      num('x1', 'x₁', 'Smaller zero', -10, 10, { derived: true }),
      num('x2', 'x₂', 'Larger zero', -10, 10, { derived: true }),
    ],
    rules: monicZeros(),
    example: { b: -1, c: -6, D: 25, x1: -2, x2: 3 },
    startWith: ['b', 'c'],
    equation: 'x² + {b}x + {c} ≥ 0',
    pictureLabels: ['D'],
    representation: {
      kind: 'integerLine',
      value: 'x1',
      second: 'x2',
      min: -10,
      max: 10,
      compound: { join: 'or', closed: [true, true] },
    },
  }),
];

const QUADRATIC_FORMULA: ModuleDef[] = [
  page({
    id: 'm.9.quadratic-formula',
    assumptions: [
      'First write the equation as ax² + bx + c = 0.',
      'D = b² − 4ac: when D > 0 there are two roots, when D = 0 just one, and when D < 0 none that are real.',
      'Leave √D exact when D is not a perfect square; round only at the end.',
    ],
    variables: [
      num('a', 'a', 'x² coefficient', -20, 20, { step: 0.5 }),
      num('b', 'b', 'x coefficient', -100, 100, { step: 0.5 }),
      num('c', 'c', 'Number term', -100, 100, { step: 0.5 }),
      num('D', 'D', 'Discriminant', -100000, 100000, { derived: true }),
      num('x1', 'x₁', 'Root with −√D', -1e6, 1e6, { derived: true }),
      num('x2', 'x₂', 'Root with +√D', -1e6, 1e6, { derived: true }),
    ],
    rules: [nonzero('a', 'The x² coefficient'), ...formulaRules()],
    example: { a: 2, b: -3, c: -5, D: 49, x1: -1, x2: 2.5 },
    pictureLabels: ['D', 'x1', 'x2'],
    startWith: ['a', 'b', 'c'],
    equation: '{a:coef}x² + {b}x + {c} = 0',
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'standard',
      a: 'a',
      b: 'b',
      c: 'c',
      marks: ['zeros', 'vertex'],
    },
  }),
  page({
    id: 'm.9.quadratic-formula~square-roots',
    title: 'Solve by square roots',
    use: 'Use this for “(x − 3)² = 25”.',
    assumptions: [
      'Take the square root of both sides: there are two roots, + and −.',
      'A negative right side has no real solution.',
    ],
    variables: [
      num('p', 'p', 'Number in the bracket', -50, 50, { step: 0.5 }),
      num('q', 'q', 'Right side', -1000, 10000, { step: 0.5 }),
      num('h', 'h', 'Vertex x, −p', -50, 50, { derived: true }),
      num('k', 'k', 'Vertex y, −q', -10000, 1000, { derived: true }),
      num('x1', 'x₁', 'Smaller root', -200, 200, { derived: true }),
      num('x2', 'x₂', 'Larger root', -200, 200, { derived: true }),
    ],
    rules: [
      derive(
        'x₁ = −p − √q',
        'x1',
        ['p', 'q'],
        '{x1} = −{p} − √{q}',
        (v) => (v.q! >= 0 ? -v.p! - Math.sqrt(v.q!) : undefined),
        '−{p} − √{q}',
        'Take the square root of both sides, x + p = ±√q, then take p away. The minus root first.',
        {},
        {
          message: (v) =>
            v.q !== undefined && v.q < 0
              ? 'A square is never negative: there is no real solution.'
              : undefined,
        },
      ),
      derive(
        'x₂ = −p + √q',
        'x2',
        ['p', 'q'],
        '{x2} = −{p} + √{q}',
        (v) => (v.q! >= 0 ? -v.p! + Math.sqrt(v.q!) : undefined),
        '−{p} + √{q}',
        'The plus root.',
      ),
      derive(
        'h = −p',
        'h',
        ['p'],
        '{h} = −{p}',
        (v) => -v.p!,
        '−{p}',
        'On the graph of y = (x + p)² − q the vertex is at x = −p.',
      ),
      derive(
        'k = −q',
        'k',
        ['q'],
        '{k} = −{q}',
        (v) => -v.q!,
        '−{q}',
        'Moving q to the left side puts the vertex at y = −q; the roots are the zeros.',
      ),
    ],
    example: { p: -3, q: 25, h: 3, k: -25, x1: -2, x2: 8 },
    startWith: ['p', 'q'],
    equation: '(x + {p})² = {q}',
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'vertex',
      a: 1,
      h: 'h',
      k: 'k',
      shows: { vertex: { x: 'h', y: 'k' }, zeros: ['x1', 'x2'] },
      marks: ['vertex', 'zeros'],
    },
  }),
  page({
    id: 'm.9.quadratic-formula~complete-square',
    title: 'Complete the square',
    use: 'Use this for “Solve x² + 6x − 7 = 0 by completing the square.”',
    assumptions: [
      'Half of b fills each side of the x² tile; the missing corner is (b/2)² unit tiles.',
      'Add the corner to both sides, so the left side is (x + b/2)².',
      'Then solve by square roots.',
    ],
    variables: [
      int('b', 'b', 'x coefficient', -10, 10, {
        allowed: [-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10],
      }),
      int('c', 'c', 'Number term', -10, 10),
      num('k', 'k', 'Half of b', -5, 5, { derived: true }),
      num('m', 'm', 'Missing corner', 0, 25, { derived: true }),
      num('R', 'R', 'Right side after completing', -10, 35, { derived: true }),
      num('x1', 'x₁', 'Smaller root', -20, 20, { derived: true }),
      num('x2', 'x₂', 'Larger root', -20, 20, { derived: true }),
    ],
    rules: [
      derive(
        'k = b ÷ 2',
        'k',
        ['b'],
        '{k} = {b} ÷ 2',
        (v) => v.b! / 2,
        '{b} ÷ 2',
        'Split the x tiles in half, one half on each side of the x² tile.',
      ),
      derive(
        'm = k²',
        'm',
        ['k'],
        '{m} = {k}²',
        (v) => v.k! ** 2,
        '{k}²',
        'The missing corner is k by k.',
      ),
      derive(
        'R = m − c',
        'R',
        ['m', 'c'],
        '{R} = {m} − {c}',
        (v) => v.m! - v.c!,
        '{m} − {c}',
        'Move c to the right side and add the corner to both sides: (x + k)² = k² − c.',
      ),
      derive(
        'x₁ = −k − √R',
        'x1',
        ['k', 'R'],
        '{x1} = −{k} − √{R}',
        (v) => (v.R! >= 0 ? -v.k! - Math.sqrt(v.R!) : undefined),
        '−{k} − √{R}',
        'Take the square root of both sides, x + k = ±√R, then take k away.',
        {},
        {
          message: (v) =>
            v.R !== undefined && v.R < 0
              ? 'The right side is negative, and a square never is: no real solution.'
              : undefined,
        },
      ),
      derive(
        'x₂ = −k + √R',
        'x2',
        ['k', 'R'],
        '{x2} = −{k} + √{R}',
        (v) => (v.R! >= 0 ? -v.k! + Math.sqrt(v.R!) : undefined),
        '−{k} + √{R}',
        'The plus root.',
      ),
    ],
    example: { b: 6, c: -7, k: 3, m: 9, R: 16, x1: -7, x2: 1 },
    startWith: ['b', 'c'],
    equation: 'x² + {b}x + {c} = 0',
    representation: {
      kind: 'algebraTiles',
      mode: 'square',
      b: 'b',
      c: 'c',
      k: 'k',
      missing: 'm',
    },
  }),
];

/** Every Grade 9 math calculator, by skill in taxonomy order. */
export const MATH_9_MODULES: ModuleDef[] = [
  ...EXPONENTIAL,
  ...QUADRATIC_FUNCTIONS,
  ...POLYNOMIAL_OPERATIONS,
  ...FACTORING,
  ...QUADRATIC_FORMULA,
  ...QUADRATIC_INEQUALITIES,
];
