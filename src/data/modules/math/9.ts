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

// ── Solving linear equations ──

/** "3x", "x", "−x", "0x" for a coefficient of x. */
const xs = (k: number) => (k === 1 ? 'x' : k === -1 ? '−x' : `${fmt(k)}x`);
/** Why ax + b = cx + d has no single solution, when the x terms match. */
const sameX = (b: number, d: number) =>
  b === d
    ? 'Both sides are the same: every number is a solution.'
    : 'The x terms cancel and the numbers left differ: there is no solution.';

/**
 * ax + b = cx + d solved for x (and for d, so typing x moves d): the x terms go to the side
 * with the larger coefficient, so the x term stays positive.
 */
function bothSides(a: string, b: string, c: string, d: string): Rule {
  const left = (v: Values) => v[a]! > v[c]!;
  return rule(
    `${a}x + ${b} = ${c}x + ${d}`,
    `{${a}} × {x} + {${b}} = {${c}} × {x} + {${d}}`,
    ['x', a, b, c, d],
    (v) => v[a]! * v.x! + v[b]! - (v[c]! * v.x! + v[d]!),
    {
      x: [
        (v) => (v[a] === v[c] ? undefined : exact((v[d]! - v[b]!) / (v[a]! - v[c]!))),
        (v) =>
          left(v)
            ? `({${d}} − {${b}}) ÷ ({${a}} − {${c}})`
            : `({${b}} − {${d}}) ÷ ({${c}} − {${a}})`,
        (v) =>
          left(v)
            ? 'Take cx from both sides so the x terms are on the left, take b away, then divide.'
            : 'Take ax from both sides so the x terms are on the right, take d away, then divide.',
        {
          work: (v) => {
            const [big, small, keep, move] = left(v)
              ? [v[a]!, v[c]!, v[b]!, v[d]!]
              : [v[c]!, v[a]!, v[d]!, v[b]!];
            const k = big - small;
            const take = (n: number, what: string) =>
              n < 0
                ? `Add ${what.replace(/^−/, '')} to both sides`
                : `Take ${what} from both sides`;
            const sides = (l: string, r: string) => (left(v) ? `${l} = ${r}` : `${r} = ${l}`);
            return [
              ...(small
                ? [
                    `${take(small, xs(small))}: ${sides(`${xs(k)} ${keep < 0 ? '−' : '+'} ${fmt(Math.abs(keep))}`, fmt(move))}`,
                  ]
                : []),
              ...(keep ? [`${take(keep, fmt(keep))}: ${sides(xs(k), fmt(move - keep))}`] : []),
            ];
          },
          written: false,
        },
      ],
      [d]: [
        (v) => exact((v[a]! - v[c]!) * v.x! + v[b]!),
        `({${a}} − {${c}}) × {x} + {${b}}`,
        'Choose the right side’s number so both sides agree at this x.',
      ],
      [b]: [
        (v) => exact((v[c]! - v[a]!) * v.x! + v[d]!),
        `({${c}} − {${a}}) × {x} + {${d}}`,
        'Choose the left side’s number so both sides agree at this x.',
      ],
    },
    {
      message: (v) =>
        v[a] !== undefined &&
        v[a] === v[c] &&
        v[b] !== undefined &&
        v[d] !== undefined &&
        v[b] !== v[d]
          ? sameX(v[b]!, v[d]!)
          : undefined,
    },
  );
}

const SOLVING_EQUATIONS: ModuleDef[] = [
  page({
    id: 'm.9.solving-equations',
    assumptions: [
      'Doing the same thing to both sides keeps the equation true.',
      'Collect the x terms on the side with the larger coefficient, so the x term stays positive.',
      'When a = c there is no solution (b ≠ d) or every number is a solution (b = d).',
    ],
    variables: [
      tile('a', 'a', 'x on the left'),
      tile('b', 'b', 'Number on the left'),
      tile('c', 'c', 'x on the right'),
      tile('d', 'd', 'Number on the right'),
      num('x', 'x', 'Solution', -20, 20, { fraction: 20 }),
    ],
    rules: [bothSides('a', 'b', 'c', 'd')],
    example: { a: 5, b: 1, c: 2, d: 10, x: 3 },
    startWith: ['d', 'a', 'b', 'c'],
    equation: '{a}x + {b} = {c}x + {d}',
    representation: {
      kind: 'algebraTiles',
      mode: 'equation',
      left: { x: 'a', unit: 'b' },
      right: { x: 'c', unit: 'd' },
      solution: 'x',
    },
  }),
  page({
    id: 'm.9.solving-equations~distribute',
    title: 'Distribute first',
    use: 'Use this for “2(3x − 4) = 4x + 2”.',
    assumptions: [
      'Multiply every term in the brackets by the number outside: p(ax + b) = pax + pb.',
      'Then collect the x terms on one side and the numbers on the other.',
      'Check by putting x back into both sides of the first equation.',
    ],
    variables: [
      int('p', 'p', 'Number outside', 1, 5),
      tile('a', 'a', 'x in the brackets'),
      tile('b', 'b', 'Number in the brackets'),
      tile('c', 'c', 'x on the right'),
      tile('d', 'd', 'Number on the right'),
      tile('A', 'A', 'x after distributing', { derived: true }),
      tile('B', 'B', 'Number after distributing', { derived: true }),
      num('x', 'x', 'Solution', -20, 20, { fraction: 20 }),
    ],
    rules: [
      rule('A = p × a', '{A} = {p} × {a}', ['A', 'p', 'a'], (v) => v.A! - v.p! * v.a!, {
        A: [
          (v) => v.p! * v.a!,
          '{p} × {a}',
          'Multiply the x term in the brackets by the number outside.',
        ],
        a: [(v) => div(v.A!, v.p!), '{A} ÷ {p}', 'Undo the distributing: divide by p.'],
      }),
      rule('B = p × b', '{B} = {p} × {b}', ['B', 'p', 'b'], (v) => v.B! - v.p! * v.b!, {
        B: [
          (v) => v.p! * v.b!,
          '{p} × {b}',
          'Multiply the number in the brackets too: every term inside.',
        ],
        b: [(v) => div(v.B!, v.p!), '{B} ÷ {p}', 'Undo the distributing: divide by p.'],
      }),
      bothSides('A', 'B', 'c', 'd'),
    ],
    example: { p: 2, a: 3, b: -4, c: 4, d: 2, A: 6, B: -8, x: 5 },
    startWith: ['d', 'p', 'a', 'b', 'c'],
    equation: '{p}({a}x + {b}) = {c}x + {d}',
    representation: {
      kind: 'algebraTiles',
      mode: 'equation',
      left: { x: 'A', unit: 'B' },
      right: { x: 'c', unit: 'd' },
      solution: 'x',
    },
  }),
  page({
    id: 'm.9.solving-equations~literal',
    title: 'Solve a formula for a letter',
    use: 'Use this for “Solve P = 2l + 2w for w.”',
    assumptions: [
      'Solve for the letter first, then put the numbers in last.',
      'Undo the operations on w in reverse order: take 2l away, then divide by 2.',
      'All three lengths use the same unit.',
    ],
    variables: [
      num('P', 'P', 'Perimeter', 0, 100000, { unit: 'cm', step: 0.1 }),
      num('l', 'l', 'Length', 0, 50000, { unit: 'cm', step: 0.1 }),
      num('w', 'w', 'Width', 0, 50000, { unit: 'cm', step: 0.1 }),
    ],
    rules: [
      rule(
        'P = 2l + 2w',
        '{P} = 2 × {l} + 2 × {w}',
        ['P', 'l', 'w'],
        (v) => v.P! - (2 * v.l! + 2 * v.w!),
        {
          w: [
            (v) => exact((v.P! - 2 * v.l!) / 2),
            '({P} − 2 × {l}) ÷ 2',
            'Take 2l from both sides, then divide both sides by 2: w = (P − 2l) ÷ 2.',
          ],
          l: [
            (v) => exact((v.P! - 2 * v.w!) / 2),
            '({P} − 2 × {w}) ÷ 2',
            'Take 2w from both sides, then divide both sides by 2: l = (P − 2w) ÷ 2.',
          ],
          P: [
            (v) => exact(2 * v.l! + 2 * v.w!),
            '2 × {l} + 2 × {w}',
            'Two lengths and two widths go around the rectangle.',
          ],
        },
      ),
    ],
    example: { P: 30, l: 9, w: 6 },
    startWith: ['l', 'P'],
    representation: { kind: 'rectangle', length: 'l', width: 'w', around: 'P', extent: 10 },
  }),
];

// ── Function notation ──

const FUNCTION_NOTATION: ModuleDef[] = [
  page({
    id: 'm.9.function-notation',
    assumptions: [
      'f(x) is the output for input x, not f times x.',
      'f(4) = 10 means the point (4, 10) is on the graph.',
      'To solve f(x) = 13, set the rule equal to 13 and solve for x.',
    ],
    variables: [
      num('m', 'm', 'Slope', -10, 10, { step: 0.5 }),
      num('b', 'b', 'y-intercept', -20, 20, { step: 0.5 }),
      num('x', 'x', 'Input', -20, 20, { step: 0.5, fraction: 20 }),
      num('y', 'f(x)', 'Output', -300, 300),
    ],
    rules: [
      rule(
        'f(x) = mx + b',
        '{y} = {m} × {x} + {b}',
        ['y', 'm', 'x', 'b'],
        (v) => v.y! - (v.m! * v.x! + v.b!),
        {
          y: [
            (v) => exact(v.m! * v.x! + v.b!),
            '{m} × {x} + {b}',
            'Put the input in for x: multiply by the slope, then add b.',
          ],
          x: [
            (v) => (v.m ? exact((v.y! - v.b!) / v.m!) : undefined),
            '({y} − {b}) ÷ {m}',
            'Set mx + b equal to the output: take b from both sides, then divide by m.',
          ],
          b: [(v) => exact(v.y! - v.m! * v.x!), '{y} − {m} × {x}', 'Take mx from both sides.'],
        },
        {
          message: (v) =>
            v.m === 0 && v.y !== undefined && v.b !== undefined && v.y !== v.b
              ? 'The slope is 0: f(x) is always b, so it never reaches this output.'
              : undefined,
        },
      ),
    ],
    example: { m: 3, b: -2, x: 4, y: 10 },
    startWith: ['x', 'm', 'b'],
    equation: 'f({x}) = {y}',
    representation: {
      kind: 'functionGraph',
      family: 'linear',
      m: 'm',
      b: 'b',
      at: { x: 'x', y: 'y' },
      marks: ['intercept'],
    },
  }),
  page({
    id: 'm.9.function-notation~evaluate',
    title: 'Evaluate a quadratic',
    use: 'Use this for “f(x) = 2x² − 3x + 1. Find f(−2).”',
    assumptions: [
      'Put the input in brackets wherever x is: 2(−2)², not 2 × −2².',
      'Square first, then multiply, then add and subtract.',
      'Two inputs can give the same output, so here the output is only worked out.',
    ],
    variables: [
      num('a', 'a', 'x² coefficient', -10, 10, { step: 0.5 }),
      num('b', 'b', 'x coefficient', -20, 20, { step: 0.5 }),
      num('c', 'c', 'Number term', -50, 50, { step: 0.5 }),
      num('x', 'x', 'Input', -20, 20, { step: 0.5 }),
      num('y', 'f(x)', 'Output', -100000, 100000, { derived: true }),
    ],
    rules: [
      derive(
        'f(x) = ax² + bx + c',
        'y',
        ['a', 'x', 'b', 'c'],
        '{y} = {a} × {x}² + {b} × {x} + {c}',
        (v) => v.a! * v.x! ** 2 + v.b! * v.x! + v.c!,
        '{a} × {x}² + {b} × {x} + {c}',
        'Put the input in for x, then square, multiply and add in that order.',
      ),
    ],
    example: { a: 2, b: -3, c: 1, x: -2, y: 15 },
    startWith: ['x', 'a', 'b', 'c'],
    equation: 'f(x) = {a:coef}x² + {b}x + {c}\nf({x}) = {y}',
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'standard',
      a: 'a',
      b: 'b',
      c: 'c',
      at: { x: 'x', y: 'y' },
      fixed: true,
    },
  }),
  page({
    id: 'm.9.function-notation~domain-range',
    title: 'Domain and range',
    use: 'Use this for “f(x) = −2x + 5 for −1 ≤ x ≤ 4. What is its range?”',
    assumptions: [
      'The domain is the inputs allowed; the range is the outputs they give.',
      'A line is highest and lowest at the ends of its domain.',
      'Write each as an inequality, least first: −3 ≤ y ≤ 7.',
    ],
    variables: [
      num('m', 'm', 'Slope', -10, 10, { step: 0.5 }),
      num('b', 'b', 'y-intercept', -20, 20, { step: 0.5 }),
      num('x1', 'x₁', 'Least input', -20, 20, { step: 0.5 }),
      num('x2', 'x₂', 'Greatest input', -20, 20, { step: 0.5 }),
      num('y1', 'f(x₁)', 'Output at x₁', -500, 500, { derived: true }),
      num('y2', 'f(x₂)', 'Output at x₂', -500, 500, { derived: true }),
      num('lo', 'y_min', 'Least output', -500, 500, { derived: true }),
      num('hi', 'y_max', 'Greatest output', -500, 500, { derived: true }),
    ],
    rules: [
      constraint(
        'x₁ < x₂',
        'The least input {x1} is below the greatest {x2}',
        ['x1', 'x2'],
        (v) => !(v.x1! < v.x2!),
      ),
      derive(
        'y₁ = m x₁ + b',
        'y1',
        ['m', 'x1', 'b'],
        '{y1} = {m} × {x1} + {b}',
        (v) => v.m! * v.x1! + v.b!,
        '{m} × {x1} + {b}',
        'The output at the left end of the domain.',
      ),
      derive(
        'y₂ = m x₂ + b',
        'y2',
        ['m', 'x2', 'b'],
        '{y2} = {m} × {x2} + {b}',
        (v) => v.m! * v.x2! + v.b!,
        '{m} × {x2} + {b}',
        'The output at the right end.',
      ),
      derive(
        'y_min = the smaller of y₁ and y₂',
        'lo',
        ['y1', 'y2'],
        '{lo} = the smaller of {y1} and {y2}',
        (v) => Math.min(v.y1!, v.y2!),
        'the smaller of {y1} and {y2}',
        'A line only rises or only falls, so the least output is at one end.',
      ),
      derive(
        'y_max = the larger of y₁ and y₂',
        'hi',
        ['y1', 'y2'],
        '{hi} = the larger of {y1} and {y2}',
        (v) => Math.max(v.y1!, v.y2!),
        'the larger of {y1} and {y2}',
        'And the greatest output at the other end.',
      ),
    ],
    example: { m: -2, b: 5, x1: -1, x2: 4, y1: 7, y2: -3, lo: -3, hi: 7 },
    startWith: ['m', 'b', 'x1', 'x2'],
    representation: {
      kind: 'functionGraph',
      family: 'piecewise',
      pieces: [{ f: { family: 'linear', m: 'm', b: 'b' }, from: 'x1', to: 'x2', ends: '[]' }],
      marks: ['domain', 'range'],
      fixed: true,
    },
  }),
  page({
    id: 'm.9.function-notation~rate-of-change',
    title: 'Average rate of change',
    use: 'Use this for “Find the average rate of change of f(x) = x² − 4x + 1 from x = 1 to x = 4.”',
    assumptions: [
      'The average rate of change is the change in output over the change in input.',
      'It is the slope of the line through the two points on the graph.',
      'For a curve it changes with the interval; for a line it is always the slope.',
    ],
    variables: [
      num('a', 'a', 'x² coefficient', -10, 10, { step: 0.5 }),
      num('b', 'b', 'x coefficient', -20, 20, { step: 0.5 }),
      num('c', 'c', 'Number term', -50, 50, { step: 0.5 }),
      num('x1', 'x₁', 'Start of the interval', -20, 20, { step: 0.5 }),
      num('x2', 'x₂', 'End of the interval', -20, 20, { step: 0.5 }),
      num('y1', 'f(x₁)', 'Output at x₁', -10000, 10000, { derived: true }),
      num('y2', 'f(x₂)', 'Output at x₂', -10000, 10000, { derived: true }),
      num('h', 'Δx', 'Change in input', -40, 40, { derived: true }),
      num('r', 'r', 'Average rate of change', -10000, 10000, { derived: true }),
    ],
    rules: [
      constraint(
        'x₁ ≠ x₂',
        'The interval’s ends {x1} and {x2} differ',
        ['x1', 'x2'],
        (v) => v.x1 === v.x2,
      ),
      derive(
        'f(x₁)',
        'y1',
        ['a', 'x1', 'b', 'c'],
        '{y1} = {a} × {x1}² + {b} × {x1} + {c}',
        (v) => v.a! * v.x1! ** 2 + v.b! * v.x1! + v.c!,
        '{a} × {x1}² + {b} × {x1} + {c}',
        'The output at the start of the interval.',
      ),
      derive(
        'f(x₂)',
        'y2',
        ['a', 'x2', 'b', 'c'],
        '{y2} = {a} × {x2}² + {b} × {x2} + {c}',
        (v) => v.a! * v.x2! ** 2 + v.b! * v.x2! + v.c!,
        '{a} × {x2}² + {b} × {x2} + {c}',
        'The output at the end.',
      ),
      derive(
        'Δx = x₂ − x₁',
        'h',
        ['x2', 'x1'],
        '{h} = {x2} − {x1}',
        (v) => v.x2! - v.x1!,
        '{x2} − {x1}',
        'How far the input moves.',
      ),
      derive(
        'r = (f(x₂) − f(x₁)) ÷ Δx',
        'r',
        ['y2', 'y1', 'h'],
        '{r} = ({y2} − {y1}) ÷ {h}',
        (v) => div(v.y2! - v.y1!, v.h!),
        '({y2} − {y1}) ÷ {h}',
        'The change in output over the change in input: the slope of the secant line.',
      ),
    ],
    example: { a: 1, b: -4, c: 1, x1: 1, x2: 4, y1: -2, y2: 1, h: 3, r: 1 },
    startWith: ['a', 'b', 'c', 'x1', 'x2'],
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'standard',
      a: 'a',
      b: 'b',
      c: 'c',
      secant: { x: 'x1', h: 'h', slope: 'r' },
      fixed: true,
    },
  }),
];

// ── Linear modeling ──

const LINEAR_MODELING: ModuleDef[] = [
  page({
    id: 'm.9.linear-modeling',
    assumptions: [
      'Point-slope form needs one point (x₁, y₁) and the slope m.',
      'Distribute m and add y₁ to both sides to reach y = mx + b.',
      'A negative x₁ reads x + 3, not x − (−3).',
    ],
    variables: [
      num('m', 'm', 'Slope', -10, 10, { step: 0.5, fraction: 12 }),
      num('x1', 'x₁', 'Point’s x', -20, 20, { step: 0.5 }),
      num('y1', 'y₁', 'Point’s y', -20, 20, { step: 0.5 }),
      num('b', 'b', 'y-intercept', -250, 250),
    ],
    rules: [
      rule(
        'b = y₁ − m x₁',
        '{b} = {y1} − {m} × {x1}',
        ['b', 'y1', 'm', 'x1'],
        (v) => v.b! - (v.y1! - v.m! * v.x1!),
        {
          b: [
            (v) => exact(v.y1! - v.m! * v.x1!),
            '{y1} − {m} × {x1}',
            'Distribute: y − y₁ = mx − mx₁, then add y₁ to both sides; the number left is b.',
            {
              note: (v) =>
                known(v, 'm', 'b')
                  ? `→ y = ${poly([
                      [v.m!, 'x'],
                      [v.b!, ''],
                    ])}`
                  : '',
            },
          ],
          y1: [
            (v) => exact(v.b! + v.m! * v.x1!),
            '{m} × {x1} + {b}',
            'The point is on the line: put its x into y = mx + b.',
          ],
          m: [
            (v) => (v.x1 ? exact((v.y1! - v.b!) / v.x1!) : undefined),
            '({y1} − {b}) ÷ {x1}',
            'The slope from the point and the y-intercept (0, b): rise over run.',
          ],
        },
      ),
    ],
    example: { m: 3, x1: 2, y1: 5, b: -1 },
    startWith: ['m', 'x1', 'y1'],
    equation: 'y − {y1} = {m}(x − {x1})',
    representation: {
      kind: 'functionGraph',
      family: 'linear',
      m: 'm',
      b: 'b',
      at: { x: 'x1', y: 'y1' },
      marks: ['intercept'],
    },
  }),
  page({
    id: 'm.9.linear-modeling~parallel-perpendicular',
    title: 'Parallel and perpendicular lines',
    use: 'Use this for “Write the line through (4, 3) perpendicular to y = 2x + 1.”',
    assumptions: [
      'Parallel lines have the same slope.',
      'Perpendicular slopes multiply to −1: flip the slope and change its sign.',
      'Then put the point into y = mx + b to find b.',
    ],
    variables: [
      num('m1', 'm₁', 'Slope of the given line', -10, 10, { step: 0.5 }),
      num('b1', 'b₁', 'y-intercept of the given line', -20, 20, { step: 0.5 }),
      num('x1', 'x₁', 'Point’s x', -20, 20, { step: 0.5 }),
      num('y1', 'y₁', 'Point’s y', -20, 20, { step: 0.5 }),
      int('k', 'k', 'Parallel (1) or perpendicular (2)', 1, 2, { allowed: [1, 2] }),
      num('m2', 'm₂', 'Slope of the new line', -1000, 1000, { derived: true }),
      num('b2', 'b₂', 'y-intercept of the new line', -100000, 100000, { derived: true }),
    ],
    rules: [
      derive(
        'm₂ = m₁ or −1 ÷ m₁',
        'm2',
        ['m1', 'k'],
        '{m2} = {m1} when {k} is 1, −1 ÷ {m1} when it is 2',
        // m₁ when k is 1, −1 ÷ m₁ when k is 2: one smooth rule, so the search reads it right.
        (v) => (v.k === 2 && !v.m1 ? undefined : (2 - v.k!) * v.m1! + (v.k! - 1) * (-1 / v.m1!)),
        (v) => (v.k === 2 ? '−1 ÷ {m1}' : '{m1}'),
        (v) =>
          v.k === 2
            ? 'Perpendicular: the negative reciprocal, so the two slopes multiply to −1.'
            : 'Parallel: the same slope, so the lines never meet.',
        {},
        {
          message: (v) =>
            v.k === 2 && v.m1 === 0
              ? 'A line perpendicular to a flat line is upright (x = x₁): it has no slope.'
              : undefined,
          check: (v) =>
            v.k === 2 ? `${fmt(v.m2!)} = −1 ÷ ${sg(v.m1!)}` : `${fmt(v.m2!)} = ${fmt(v.m1!)}`,
        },
      ),
      derive(
        'b₂ = y₁ − m₂ x₁',
        'b2',
        ['y1', 'm2', 'x1'],
        '{b2} = {y1} − {m2} × {x1}',
        (v) => v.y1! - v.m2! * v.x1!,
        '{y1} − {m2} × {x1}',
        'The new line passes through the point: put it into y = m₂x + b₂ and solve for b₂.',
      ),
    ],
    example: { m1: 2, b1: 1, x1: 4, y1: 3, k: 2, m2: -0.5, b2: 5 },
    startWith: ['m1', 'b1', 'x1', 'y1', 'k'],
    standalone: {
      vars: ['b1'],
      why: 'The given line’s intercept only places it on the graph: the new slope uses its slope alone.',
    },
    pictureLabels: ['k'],
    representation: {
      kind: 'lineSystem',
      lines: [
        { slope: 'm1', intercept: 'b1', label: 'Given line' },
        { slope: 'm2', intercept: 'b2', label: 'New line' },
      ],
      test: { x: 'x1', y: 'y1' },
      fixed: true,
    },
  }),
  page({
    id: 'm.9.linear-modeling~context',
    title: 'A linear model in a story',
    use: 'Use this for “A class costs $25 to join plus $12.50 a class. What do 8 classes cost?”',
    assumptions: [
      'The total is the starting amount plus the rate times the count: C = b + mx.',
      'b is the value when x = 0; m is how much each one more adds.',
      'x is a whole number of classes, 0 or more: the domain of the story.',
    ],
    variables: [
      num('b', 'b', 'Starting amount', 0, 10000, { unit: '$', step: 0.01 }),
      num('m', 'm', 'Cost per class', 0, 1000, { unit: '$', step: 0.01 }),
      int('x', 'x', 'Classes', 0, 1000),
      num('C', 'C', 'Total cost', 0, 1000000, { unit: '$' }),
      int('dx', 'Δx', 'More classes', 0, 1000),
      num('dC', 'ΔC', 'Added cost', 0, 1000000, { unit: '$' }),
    ],
    rules: [
      rule(
        'C = b + m x',
        '{C} = {b} + {m} × {x}',
        ['C', 'b', 'm', 'x'],
        (v) => v.C! - (v.b! + v.m! * v.x!),
        {
          C: [
            (v) => exact(v.b! + v.m! * v.x!),
            '{b} + {m} × {x}',
            'The starting amount plus the rate for each class.',
          ],
          x: [
            (v) => (v.m ? exact((v.C! - v.b!) / v.m!) : undefined),
            '({C} − {b}) ÷ {m}',
            'Take the starting amount from the total, then divide by the rate.',
          ],
          b: [
            (v) => exact(v.C! - v.m! * v.x!),
            '{C} − {m} × {x}',
            'Take the classes’ cost from the total.',
          ],
          m: [
            (v) => (v.x ? exact((v.C! - v.b!) / v.x!) : undefined),
            '({C} − {b}) ÷ {x}',
            'Take the starting amount away, then share the rest over the classes.',
          ],
        },
      ),
      rule('ΔC = m Δx', '{dC} = {m} × {dx}', ['dC', 'm', 'dx'], (v) => v.dC! - v.m! * v.dx!, {
        dC: [
          (v) => exact(v.m! * v.dx!),
          '{m} × {dx}',
          'Each class more adds the rate once, whatever the starting amount.',
        ],
        dx: [
          (v) => (v.m ? exact(v.dC! / v.m!) : undefined),
          '{dC} ÷ {m}',
          'Divide the added cost by the rate.',
        ],
      }),
    ],
    example: { b: 25, m: 12.5, x: 8, C: 125, dx: 3, dC: 37.5 },
    startWith: ['x', 'b', 'm', 'dx'],
    pictureLabels: ['dx', 'dC'],
    representation: {
      kind: 'functionGraph',
      family: 'linear',
      m: 'm',
      b: 'b',
      name: 'C',
      at: { x: 'x', y: 'C' },
      xMin: 0,
      axes: { x: 'Classes x', y: 'Total cost C ($)' },
      marks: ['intercept'],
    },
  }),
];

// ── Inequalities ──

/** The sign box's codes: 1 <, 2 ≤, 3 >, 4 ≥. */
const SIGNS = ['<', '≤', '>', '≥'] as const;
/** The sign after both sides are multiplied or divided by a negative number. */
const flip = (s: number) => [3, 4, 1, 2][s - 1]!;
/** Whether l (sign s) r is true. */
const compare = (l: number, s: number, r: number) =>
  s === 1 ? l < r : s === 2 ? l <= r : s === 3 ? l > r : l >= r;
/** 1 for true, 0 for false. */
const truth = (x: boolean) => (x ? 1 : 0);
/**
 * A test value h against its truth: 0 exactly when they agree. Curved in h, so the solver never
 * mistakes an always-false test (h − 0) for a straight-line rule that forces h = 0.
 */
const tested = (h: number, t: number) => (h - t) * (1 + h * h);
/** A test that is 1 when true and 0 when false. */
const holdsVar = (id = 'h') =>
  int(id, id, 'Test is true (1) or false (0)', 0, 1, { derived: true });
/** A signed number bracketed after an operation sign: 3 × (−2). */
const inner = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x));

/** A test number put into both sides: 3 × (−6) − 4 = −22 and 5 × (−6) + 6 = −24. */
const sideLines = (k: number, t: number, n: number) => {
  const kt = exact(k * t);
  const total = exact(kt + n);
  return {
    // Written the way a class substitutes, 3(2) + 4 = 10.
    line: n
      ? `${fmt(k)}(${fmt(t)}) ${n < 0 ? '−' : '+'} ${fmt(Math.abs(n))} = ${fmt(total)}`
      : `${fmt(k)}(${fmt(t)}) = ${fmt(total)}`,
    total,
  };
};

const LINEAR_INEQUALITIES: ModuleDef[] = [
  page({
    id: 'm.9.linear-inequalities',
    assumptions: [
      'Dividing or multiplying both sides by a negative number reverses the sign.',
      '< and > leave the bound out (an open circle); ≤ and ≥ put it in (a closed circle).',
      'A test number from the shaded side makes the first inequality true.',
    ],
    variables: [
      tile('a', 'a', 'x on the left'),
      tile('b', 'b', 'Number on the left'),
      int('s', 's', 'Sign (1 <, 2 ≤, 3 >, 4 ≥)', 1, 4, { allowed: [1, 2, 3, 4] }),
      tile('c', 'c', 'x on the right'),
      tile('d', 'd', 'Number on the right'),
      num('k', 'k', 'Bound', -20, 20, { derived: true, fraction: 20 }),
      int('f', 'f', 'Sign of the answer (1 <, 2 ≤, 3 >, 4 ≥)', 1, 4, { derived: true }),
      num('t', 't', 'Test number', -20, 20, { step: 0.5 }),
      holdsVar(),
    ],
    rules: [
      derive(
        'k = (d − b) ÷ (a − c)',
        'k',
        ['d', 'b', 'a', 'c'],
        '{k} = ({d} − {b}) ÷ ({a} − {c})',
        (v) => div(v.d! - v.b!, v.a! - v.c!),
        '({d} − {b}) ÷ ({a} − {c})',
        'Take cx and b from both sides, as in an equation, then divide by the x left.',
        {
          work: (v) => {
            if (v.s === undefined) return [];
            const k = v.a! - v.c!;
            const sign = SIGNS[v.s - 1]!;
            const rest = v.d! - v.b!;
            const lines = [];
            if (v.c) {
              lines.push(
                `${v.c < 0 ? `Add ${xs(-v.c)} to` : `Take ${xs(v.c)} from`} both sides: ${xs(k)}${v.b ? ` ${v.b < 0 ? '−' : '+'} ${fmt(Math.abs(v.b))}` : ''} ${sign} ${fmt(v.d!)}`,
              );
            }
            if (v.b) {
              lines.push(
                `${v.b < 0 ? `Add ${fmt(-v.b)} to` : `Take ${fmt(v.b)} from`} both sides: ${xs(k)} ${sign} ${fmt(rest)}`,
              );
            }
            lines.push(
              k < 0
                ? `Divide both sides by ${fmt(k)}, a negative, so ${sign} flips to ${SIGNS[flip(v.s) - 1]}`
                : `Divide both sides by ${fmt(k)}; the sign stays ${sign}`,
            );
            return lines;
          },
          written: false,
        },
        {
          message: (v) =>
            v.a !== undefined && v.a === v.c
              ? 'The x terms cancel: the inequality is true for every number or for none.'
              : undefined,
        },
      ),
      rule(
        'f = s, flipped when a − c < 0',
        'sign {f} from sign {s}, flipped when {a} − {c} is negative',
        ['f', 's', 'a', 'c'],
        (v) => v.f! - (v.a! - v.c! < 0 ? flip(v.s!) : v.s!),
        {
          f: [
            (v) => (v.a! - v.c! < 0 ? flip(v.s!) : v.s!),
            (v) => `${v.a! - v.c! < 0 ? flip(v.s!) : v.s!}`,
            (v) =>
              v.a! - v.c! < 0
                ? `a − c is negative: dividing by it flips ${SIGNS[v.s! - 1]} to ${SIGNS[flip(v.s!) - 1]}.`
                : `a − c is positive: the sign stays ${SIGNS[v.s! - 1]}.`,
            {
              note: (v) => (known(v, 'f', 'k') ? `→ x ${SIGNS[v.f! - 1]} ${fmt(v.k!)}` : ''),
            },
          ],
        },
        { check: (v) => `${v.a! - v.c! < 0 ? flip(v.s!) : v.s!} = ${v.f}` },
      ),
      rule(
        'h = test',
        'test {t} in {a}x + {b} (sign {s}) {c}x + {d}: {h}',
        ['h', 't', 'a', 'b', 's', 'c', 'd'],
        (v) => tested(v.h!, truth(compare(v.a! * v.t! + v.b!, v.s!, v.c! * v.t! + v.d!))),
        {
          h: [
            (v) => truth(compare(v.a! * v.t! + v.b!, v.s!, v.c! * v.t! + v.d!)),
            (v) => `${truth(compare(v.a! * v.t! + v.b!, v.s!, v.c! * v.t! + v.d!))}`,
            'Put the test number into both sides of the first inequality: 1 is true, 0 is false.',
            {
              work: (v) => {
                const l = sideLines(v.a!, v.t!, v.b!);
                const r = sideLines(v.c!, v.t!, v.d!);
                const ok = compare(l.total, v.s!, r.total);
                return [
                  l.line,
                  r.line,
                  `${fmt(l.total)} ${SIGNS[v.s! - 1]} ${fmt(r.total)} is ${ok ? 'true' : 'false'}`,
                ];
              },
              written: false,
            },
          ],
        },
        {
          check: (v) => `${truth(compare(v.a! * v.t! + v.b!, v.s!, v.c! * v.t! + v.d!))} = ${v.h}`,
        },
      ),
    ],
    example: { a: 3, b: -4, s: 3, c: 5, d: 6, k: -5, f: 1, t: -6, h: 1 },
    startWith: ['d', 'a', 'b', 'c', 's', 't'],
    equation: '{a}x + {b} {s:sign} {c}x + {d}',
    representation: {
      kind: 'integerLine',
      value: 'k',
      min: -20,
      max: 20,
      inequality: { sign: 'f', test: 't' },
    },
  }),
];

/** Least common multiple of two whole numbers (positive). */
const lcm = (a: number, b: number) => (a && b ? Math.abs(a * b) / gcd(a, b) : 0);

/** A test rule for a compound inequality: 1 when the test number t makes it true. */
function compoundTest(
  display: string,
  vars: string[],
  holds: (v: Values) => boolean,
  lines: (v: Values) => string[],
  how: string,
): Rule {
  return rule(
    'h = test',
    display,
    ['h', ...vars],
    (v) => tested(v.h!, truth(holds(v))),
    {
      h: [
        (v) => truth(holds(v)),
        (v) => `${truth(holds(v))}`,
        how,
        { work: (v) => lines(v), written: false },
      ],
    },
    { check: (v) => `${truth(holds(v))} = ${v.h}` },
  );
}

/** ax + b at t, worked: "3 × 0 + 4 = 4". */
const at = (a: number, b: number, t: number) => sideLines(a, t, b);

const LINEAR_INEQUALITIES_MORE: ModuleDef[] = [
  page({
    id: 'm.9.linear-inequalities~compound',
    title: 'Compound inequality with and',
    use: 'Use this for “Solve −5 < 3x + 4 ≤ 13.”',
    assumptions: [
      'Do the same to all three parts: take b from each, then divide each by a.',
      'The solutions are between the two bounds: both parts must be true.',
      'Here a is positive, so the signs stay; dividing by a negative would flip both.',
    ],
    variables: [
      int('l', 'l', 'Left number', -50, 50),
      int('a', 'a', 'x in the middle', 1, 10),
      int('b', 'b', 'Number in the middle', -50, 50),
      int('r', 'r', 'Right number', -50, 50),
      num('L', 'L', 'Lower bound', -20, 20, { derived: true, fraction: 12 }),
      num('U', 'U', 'Upper bound', -20, 20, { derived: true, fraction: 12 }),
      num('t', 't', 'Test number', -20, 20, { step: 0.5 }),
      holdsVar(),
    ],
    rules: [
      derive(
        'L = (l − b) ÷ a',
        'L',
        ['l', 'b', 'a'],
        '{L} = ({l} − {b}) ÷ {a}',
        (v) => div(v.l! - v.b!, v.a!),
        '({l} − {b}) ÷ {a}',
        'Take b from the left part, then divide it by a.',
      ),
      derive(
        'U = (r − b) ÷ a',
        'U',
        ['r', 'b', 'a'],
        '{U} = ({r} − {b}) ÷ {a}',
        (v) => div(v.r! - v.b!, v.a!),
        '({r} − {b}) ÷ {a}',
        'Do the same to the right part.',
        { note: (v) => (known(v, 'L', 'U') ? `→ ${fmt(v.L!)} < x ≤ ${fmt(v.U!)}` : '') },
        {
          message: (v) =>
            known(v, 'l', 'r') && v.l! >= v.r!
              ? 'The left number is not below the right one: no number is between them.'
              : undefined,
        },
      ),
      compoundTest(
        'test {t} in {l} < {a}x + {b} ≤ {r}: {h}',
        ['t', 'l', 'a', 'b', 'r'],
        (v) => v.l! < v.a! * v.t! + v.b! && v.a! * v.t! + v.b! <= v.r!,
        (v) => {
          const m = at(v.a!, v.b!, v.t!);
          const ok = v.l! < m.total && m.total <= v.r!;
          return [
            m.line,
            `${fmt(v.l!)} < ${fmt(m.total)} ≤ ${fmt(v.r!)} is ${ok ? 'true' : 'false'}`,
          ];
        },
        'Put the test number in the middle: both parts must be true. 1 is true, 0 is false.',
      ),
    ],
    example: { l: -5, a: 3, b: 4, r: 13, L: -3, U: 3, t: 0, h: 1 },
    startWith: ['l', 'a', 'b', 'r', 't'],
    equation: '{l} < {a}x + {b} ≤ {r}',
    representation: {
      kind: 'integerLine',
      value: 'L',
      second: 'U',
      min: -20,
      max: 20,
      compound: { join: 'and', closed: [false, true], test: 't' },
    },
  }),
  page({
    id: 'm.9.linear-inequalities~or',
    title: 'Compound inequality with or',
    use: 'Use this for “Solve 2x + 3 < −1 or 3x − 2 ≥ 7.”',
    assumptions: [
      'Solve each part on its own.',
      'The solutions are every number that makes at least one part true: two rays.',
      'If the rays meet or overlap, every number is a solution.',
    ],
    variables: [
      int('a', 'a', 'x in the first part', 1, 10),
      int('b', 'b', 'Number in the first part', -50, 50),
      int('c', 'c', 'Right side of the first part', -50, 50),
      int('d', 'd', 'x in the second part', 1, 10),
      int('e', 'e', 'Number in the second part', -50, 50),
      int('f', 'f', 'Right side of the second part', -50, 50),
      num('L', 'L', 'First bound', -20, 20, { derived: true, fraction: 12 }),
      num('U', 'U', 'Second bound', -20, 20, { derived: true, fraction: 12 }),
      num('t', 't', 'Test number', -20, 20, { step: 0.5 }),
      holdsVar(),
    ],
    rules: [
      derive(
        'L = (c − b) ÷ a',
        'L',
        ['c', 'b', 'a'],
        '{L} = ({c} − {b}) ÷ {a}',
        (v) => div(v.c! - v.b!, v.a!),
        '({c} − {b}) ÷ {a}',
        'First part: take b from both sides, then divide by a.',
      ),
      derive(
        'U = (f − e) ÷ d',
        'U',
        ['f', 'e', 'd'],
        '{U} = ({f} − {e}) ÷ {d}',
        (v) => div(v.f! - v.e!, v.d!),
        '({f} − {e}) ÷ {d}',
        'Second part: take e from both sides, then divide by d.',
        {
          note: (v) =>
            known(v, 'L', 'U')
              ? v.U! <= v.L!
                ? '→ the rays overlap: every number'
                : `→ x < ${fmt(v.L!)} or x ≥ ${fmt(v.U!)}`
              : '',
        },
      ),
      compoundTest(
        'test {t} in {a}x + {b} < {c} or {d}x + {e} ≥ {f}: {h}',
        ['t', 'a', 'b', 'c', 'd', 'e', 'f'],
        (v) => v.a! * v.t! + v.b! < v.c! || v.d! * v.t! + v.e! >= v.f!,
        (v) => {
          const p = at(v.a!, v.b!, v.t!);
          const q = at(v.d!, v.e!, v.t!);
          const ok = p.total < v.c! || q.total >= v.f!;
          return [
            p.line,
            q.line,
            `${fmt(p.total)} < ${fmt(v.c!)} or ${fmt(q.total)} ≥ ${fmt(v.f!)} is ${ok ? 'true' : 'false'}`,
          ];
        },
        'Put the test number into both parts: one true part is enough. 1 is true, 0 is false.',
      ),
    ],
    example: { a: 2, b: 3, c: -1, d: 3, e: -2, f: 7, L: -2, U: 3, t: 4, h: 1 },
    startWith: ['a', 'b', 'c', 'd', 'e', 'f', 't'],
    equation: '{a}x + {b} < {c} or {d}x + {e} ≥ {f}',
    representation: {
      kind: 'integerLine',
      value: 'L',
      second: 'U',
      min: -20,
      max: 20,
      compound: { join: 'or', closed: [false, true], test: 't' },
    },
  }),
  ...(
    [
      ['~two-variables', 'Graph y ≥ mx + b', '≥', 'y ≥ 2x − 3', 'above', 'solid', 4],
      ['~two-variables-below', 'Graph y < mx + b', '<', 'y < −x + 4', 'below', 'dashed', 1],
    ] as const
  ).map(([slug, title, sign, eg, side, line, code]) =>
    page({
      id: `m.9.linear-inequalities${slug}`,
      title,
      use: `Use this for “Graph ${eg} and test a point.”`,
      assumptions: [
        `Draw the boundary y = mx + b, ${line}: ${sign === '≥' ? '≥ includes' : '< leaves out'} the points on it.`,
        `Shade ${side} the line: every point there makes y ${sign} mx + b true.`,
        'A test point is a solution when its y is in the shaded part at its x.',
      ],
      variables: [
        num('m', 'm', 'Slope', -10, 10, { step: 0.5 }),
        num('b', 'b', 'y-intercept', -10, 10, { step: 0.5 }),
        num('tx', 'x₀', 'Test point x', -10, 10, { step: 0.5 }),
        num('ty', 'y₀', 'Test point y', -10, 10, { step: 0.5 }),
        num('yl', 'y_line', 'The line’s y at x₀', -120, 120, { derived: true }),
        holdsVar(),
      ],
      rules: [
        derive(
          'y_line = m x₀ + b',
          'yl',
          ['m', 'tx', 'b'],
          '{yl} = {m} × {tx} + {b}',
          (v) => v.m! * v.tx! + v.b!,
          '{m} × {tx} + {b}',
          'The boundary’s height at the test point’s x.',
        ),
        rule(
          'h = test',
          `test: {ty} ${sign} {yl} gives {h}`,
          ['h', 'ty', 'yl'],
          (v) => tested(v.h!, truth(compare(v.ty!, code, v.yl!))),
          {
            h: [
              (v) => truth(compare(v.ty!, code, v.yl!)),
              (v) => `${truth(compare(v.ty!, code, v.yl!))}`,
              `Compare the test point’s y with the line’s: 1 is true (shaded), 0 is false.`,
              {
                work: (v) => [
                  `${fmt(v.ty!)} ${sign} ${fmt(v.yl!)} is ${compare(v.ty!, code, v.yl!) ? 'true' : 'false'}`,
                ],
                written: false,
              },
            ],
          },
          { check: (v) => `${truth(compare(v.ty!, code, v.yl!))} = ${v.h}` },
        ),
      ],
      example:
        sign === '≥'
          ? { m: 2, b: -3, tx: 1, ty: 0, yl: -1, h: 1 }
          : { m: -1, b: 4, tx: 3, ty: 2, yl: 1, h: 0 },
      startWith: ['m', 'b', 'tx', 'ty'],
      equation: `y ${sign} {m}x + {b}`,
      pictureLabels: ['tx', 'ty', 'yl', 'h'],
      representation: {
        kind: 'linearFunction',
        slope: 'm',
        intercept: 'b',
        shade: sign,
        keep: ['tx', 'ty'],
        extent: 10,
      },
    }),
  ),
  page({
    id: 'm.9.linear-inequalities~whole-number-answers',
    title: 'Whole-number answers',
    use: 'Use this for “$12 to join plus $4 a visit, and at most $50. How many visits?”',
    assumptions: [
      'Write the story as an inequality: fixed cost + cost per visit × visits ≤ budget.',
      'Solve it as an equation, then keep the sign.',
      'Visits come in whole numbers: round down for at most, up for at least.',
    ],
    variables: [
      num('F', 'F', 'Fixed cost', 0, 1000, { unit: '$', step: 0.01 }),
      num('p', 'p', 'Cost per visit', 0.01, 1000, { unit: '$', step: 0.01 }),
      int('s', 's', 'At most (2) or at least (4)', 2, 4, { allowed: [2, 4] }),
      num('B', 'B', 'Budget', 0, 10000, { unit: '$', step: 0.01 }),
      num('n', 'n', 'Bound on the visits', 0, 20, { derived: true }),
      int('N', 'N', 'Most or fewest whole visits', 0, 20, { derived: true }),
    ],
    rules: [
      derive(
        'n = (B − F) ÷ p',
        'n',
        ['B', 'F', 'p'],
        '{n} = ({B} − {F}) ÷ {p}',
        (v) => div(v.B! - v.F!, v.p!),
        '({B} − {F}) ÷ {p}',
        'Take the fixed cost from both sides, then divide by the cost per visit: the sign stays.',
      ),
      derive(
        'N = n rounded',
        'N',
        ['n', 's'],
        '{N} = {n} rounded to a whole number, down or up as {s} says',
        (v) => (v.s === 4 ? Math.ceil(v.n! - 1e-9) : Math.floor(v.n! + 1e-9)),
        (v) =>
          v.s === 4 ? '{n} rounded up to a whole number' : '{n} rounded down to a whole number',
        (v) =>
          v.s === 4
            ? 'At least: the fewest whole visits at or above the bound.'
            : 'At most: the most whole visits at or below the bound.',
        {
          work: (v) => {
            const cost = (k: number) => exact(v.F! + v.p! * k);
            const next = v.s === 4 ? v.N! - 1 : v.N! + 1;
            return next < 0
              ? []
              : [
                  `${fmt(v.F!)} + ${fmt(v.p!)} × ${fmt(v.N!)} = ${fmt(cost(v.N!))}`,
                  `${fmt(v.F!)} + ${fmt(v.p!)} × ${fmt(next)} = ${fmt(cost(next))}`,
                ];
          },
          written: false,
        },
        {
          check: (v) =>
            `${fmt(v.N!)} = ${fmt(v.s === 4 ? Math.ceil(v.n! - 1e-9) : Math.floor(v.n! + 1e-9))}`,
        },
      ),
    ],
    example: { F: 12, p: 4, s: 2, B: 50, n: 9.5, N: 9 },
    startWith: ['F', 'p', 's', 'B'],
    pictureLabels: ['F', 'p', 'B'],
    representation: {
      kind: 'integerLine',
      value: 'n',
      min: 0,
      max: 20,
      inequality: { sign: 's', letter: 'v' },
    },
  }),
];

// ── Absolute value ──

/** Where |ax + b| = c is centered, and how far each solution is from it. */
const centerRules = (): Rule[] => [
  derive(
    'h = −b ÷ a',
    'h',
    ['b', 'a'],
    '{h} = −{b} ÷ {a}',
    (v) => div(-v.b!, v.a!),
    '−{b} ÷ {a}',
    'The center, where ax + b = 0.',
  ),
  derive(
    'd = c ÷ |a|',
    'd',
    ['c', 'a'],
    '{d} = {c} ÷ |{a}|',
    (v) => div(v.c!, Math.abs(v.a!)),
    '{c} ÷ |{a}|',
    'How far each end is from the center: |ax + b| = |a| × |x − h|.',
  ),
];

/** |ax + b| (≤ or ≥) c: the two bounds h ∓ d, a test number. */
function absInequality(within: boolean): ModuleDef {
  const sign = within ? '≤' : '≥';
  const eg = within ? '|2x + 1| ≤ 7' : '|2x − 1| ≥ 5';
  return page({
    id: `m.9.absolute-value~${within ? 'inequality' : 'inequality-beyond'}`,
    title: within ? 'Absolute value inequality: within' : 'Absolute value inequality: beyond',
    use: `Use this for “Solve ${eg}.”`,
    assumptions: within
      ? [
          '|u| ≤ c means u is within c of 0: −c ≤ u ≤ c, one “and” inequality.',
          'The solutions are between two bounds, centered where ax + b = 0.',
          'A negative c has no solution: a distance is never negative.',
        ]
      : [
          '|u| ≥ c means u is at least c from 0: u ≤ −c or u ≥ c.',
          'The solutions are two rays pointing away from the center.',
          'A negative c makes every number a solution.',
        ],
    variables: [
      int('a', 'a', 'x inside the bars', -10, 10),
      int('b', 'b', 'Number inside the bars', -20, 20),
      int('c', 'c', 'Right side', -20, 20),
      num('h', 'h', 'Center', -20, 20, { derived: true, fraction: 20 }),
      num('d', 'd', 'Distance from the center', -20, 20, { derived: true, fraction: 20 }),
      num('L', 'L', 'Lower bound', -20, 20, { derived: true, fraction: 20 }),
      num('U', 'U', 'Upper bound', -20, 20, { derived: true, fraction: 20 }),
      num('t', 't', 'Test number', -20, 20, { step: 0.5 }),
      holdsVar('k'),
    ],
    rules: [
      nonzero('a', 'The x inside the bars'),
      ...centerRules(),
      derive(
        'L = h − d',
        'L',
        ['h', 'd'],
        '{L} = {h} − {d}',
        (v) => (v.d! >= 0 ? v.h! - v.d! : undefined),
        '{h} − {d}',
        'Go the distance to the left of the center.',
        {},
        {
          message: (v) =>
            v.d !== undefined && v.d < 0
              ? within
                ? 'c is negative: a distance is never negative, so no number works.'
                : 'c is negative: every distance is at least that, so every number works.'
              : undefined,
        },
      ),
      derive(
        'U = h + d',
        'U',
        ['h', 'd'],
        '{U} = {h} + {d}',
        (v) => (v.d! >= 0 ? v.h! + v.d! : undefined),
        '{h} + {d}',
        'And the same distance to the right.',
        {
          note: (v) =>
            known(v, 'L', 'U')
              ? within
                ? `→ ${fmt(v.L!)} ≤ x ≤ ${fmt(v.U!)}`
                : `→ x ≤ ${fmt(v.L!)} or x ≥ ${fmt(v.U!)}`
              : '',
        },
      ),
      rule(
        'k = test',
        `test {t} in |{a}x + {b}| ${sign} {c}: {k}`,
        ['k', 't', 'a', 'b', 'c'],
        (v) => tested(v.k!, truth(compare(Math.abs(v.a! * v.t! + v.b!), within ? 2 : 4, v.c!))),
        {
          k: [
            (v) => truth(compare(Math.abs(v.a! * v.t! + v.b!), within ? 2 : 4, v.c!)),
            (v) => `${truth(compare(Math.abs(v.a! * v.t! + v.b!), within ? 2 : 4, v.c!))}`,
            'Put the test number inside the bars, then compare its distance from 0 with c.',
            {
              work: (v) => {
                const m = at(v.a!, v.b!, v.t!);
                const size = Math.abs(m.total);
                return [
                  m.line,
                  `|${fmt(m.total)}| = ${fmt(size)}`,
                  `${fmt(size)} ${sign} ${fmt(v.c!)} is ${compare(size, within ? 2 : 4, v.c!) ? 'true' : 'false'}`,
                ];
              },
              written: false,
            },
          ],
        },
        {
          check: (v) =>
            `${truth(compare(Math.abs(v.a! * v.t! + v.b!), within ? 2 : 4, v.c!))} = ${v.k}`,
        },
      ),
    ],
    example: within
      ? { a: 2, b: 1, c: 7, h: -0.5, d: 3.5, L: -4, U: 3, t: 1, k: 1 }
      : { a: 2, b: -1, c: 5, h: 0.5, d: 2.5, L: -2, U: 3, t: 1, k: 0 },
    startWith: ['a', 'b', 'c', 't'],
    equation: `|{a}x + {b}| ${sign} {c}`,
    representation: {
      kind: 'integerLine',
      value: 'L',
      second: 'U',
      min: -20,
      max: 20,
      compound: {
        join: within ? 'and' : 'or',
        closed: [true, true],
        center: 'h',
        radius: 'd',
        test: 't',
      },
    },
  });
}

const ABSOLUTE_VALUE: ModuleDef[] = [
  page({
    id: 'm.9.absolute-value',
    assumptions: [
      '|u| = c means u is c from 0: u = c or u = −c.',
      'A negative c has no solution, and c = 0 has just one.',
      'Check each answer in the first equation.',
    ],
    variables: [
      int('a', 'a', 'x inside the bars', -10, 10),
      int('b', 'b', 'Number inside the bars', -20, 20),
      int('c', 'c', 'Right side', -20, 20),
      num('h', 'h', 'Center', -20, 20, { derived: true, fraction: 20 }),
      num('d', 'd', 'Distance from the center', -20, 20, { derived: true, fraction: 20 }),
      num('x1', 'x₁', 'Solution from u = c', -20, 20, { derived: true, fraction: 20 }),
      num('x2', 'x₂', 'Solution from u = −c', -20, 20, { derived: true, fraction: 20 }),
    ],
    rules: [
      nonzero('a', 'The x inside the bars'),
      ...centerRules(),
      derive(
        'x₁ = (c − b) ÷ a',
        'x1',
        ['c', 'b', 'a'],
        '{x1} = ({c} − {b}) ÷ {a}',
        (v) => (v.c! >= 0 ? div(v.c! - v.b!, v.a!) : undefined),
        '({c} − {b}) ÷ {a}',
        'Set ax + b = c: take b from both sides, then divide by a.',
        {},
        {
          message: (v) =>
            v.c !== undefined && v.c < 0
              ? 'c is negative: an absolute value is never negative, so there is no solution.'
              : undefined,
        },
      ),
      derive(
        'x₂ = (−c − b) ÷ a',
        'x2',
        ['c', 'b', 'a'],
        '{x2} = (−{c} − {b}) ÷ {a}',
        (v) => (v.c! >= 0 ? div(-v.c! - v.b!, v.a!) : undefined),
        '(−{c} − {b}) ÷ {a}',
        'Set ax + b = −c the same way. When c = 0 the two are one solution.',
      ),
    ],
    example: { a: 2, b: -3, c: 7, h: 1.5, d: 3.5, x1: 5, x2: -2 },
    startWith: ['c', 'a', 'b'],
    equation: '|{a}x + {b}| = {c}',
    pictureLabels: ['h', 'd'],
    representation: { kind: 'integerLine', value: 'x1', second: 'x2', min: -20, max: 20 },
  }),
  absInequality(true),
  absInequality(false),
];

// ── Systems: elimination and inequalities ──

/** Where y = m₁x + b₁ and y = m₂x + b₂ cross. */
function crossRules(m1: string, b1: string, m2: string, b2: string, x = 'x', y = 'y'): Rule[] {
  return [
    derive(
      `${x} = (${b2} − ${b1}) ÷ (${m1} − ${m2})`,
      x,
      [b2, b1, m1, m2],
      `{${x}} = ({${b2}} − {${b1}}) ÷ ({${m1}} − {${m2}})`,
      (v) => div(v[b2]! - v[b1]!, v[m1]! - v[m2]!),
      `({${b2}} − {${b1}}) ÷ ({${m1}} − {${m2}})`,
      'Where the boundaries cross: set the two right sides equal, gather x on one side, then divide.',
      {},
      {
        message: (v) =>
          v[m1] !== undefined && v[m1] === v[m2]
            ? 'The boundaries are parallel: they never cross, so there is no corner.'
            : undefined,
      },
    ),
    derive(
      `${y} = ${m1} × ${x} + ${b1}`,
      y,
      [m1, x, b1],
      `{${y}} = {${m1}} × {${x}} + {${b1}}`,
      (v) => v[m1]! * v[x]! + v[b1]!,
      `{${m1}} × {${x}} + {${b1}}`,
      'Put x into the first boundary.',
    ),
  ];
}

const INEQUALITY_SYSTEMS: ModuleDef[] = [
  page({
    id: 'm.9.inequality-systems',
    assumptions: [
      'A dashed line (< or >) is not included; a solid one (≤ or ≥) is.',
      'The solutions are where the two shadings overlap.',
      'Test a point by putting it into both inequalities.',
    ],
    variables: [
      num('m1', 'm₁', 'First slope', -10, 10, { step: 0.5 }),
      num('b1', 'b₁', 'First y-intercept', -10, 10, { step: 0.5 }),
      num('m2', 'm₂', 'Second slope', -10, 10, { step: 0.5 }),
      num('b2', 'b₂', 'Second y-intercept', -10, 10, { step: 0.5 }),
      num('x', 'x', 'Corner x', -1000, 1000, { derived: true }),
      num('y', 'y', 'Corner y', -10000, 10000, { derived: true }),
      num('tx', 'x₀', 'Test point x', -10, 10, { step: 0.5 }),
      num('ty', 'y₀', 'Test point y', -10, 10, { step: 0.5 }),
      num('d1', 'd₁', 'Test point above the first line', -250, 250, { derived: true }),
      num('d2', 'd₂', 'Test point above the second line', -250, 250, { derived: true }),
    ],
    rules: [
      ...crossRules('m1', 'b1', 'm2', 'b2'),
      derive(
        'd₁ = y₀ − (m₁x₀ + b₁)',
        'd1',
        ['ty', 'm1', 'tx', 'b1'],
        '{d1} = {ty} − ({m1} × {tx} + {b1})',
        (v) => v.ty! - (v.m1! * v.tx! + v.b1!),
        '{ty} − ({m1} × {tx} + {b1})',
        'Put the test point into y > m₁x + b₁: it is true when y₀ is above the line, d₁ > 0.',
      ),
      derive(
        'd₂ = y₀ − (m₂x₀ + b₂)',
        'd2',
        ['ty', 'm2', 'tx', 'b2'],
        '{d2} = {ty} − ({m2} × {tx} + {b2})',
        (v) => v.ty! - (v.m2! * v.tx! + v.b2!),
        '{ty} − ({m2} × {tx} + {b2})',
        'And into y ≤ m₂x + b₂: true when y₀ is on or below the line, d₂ ≤ 0.',
        {
          note: (v) =>
            known(v, 'd1', 'd2')
              ? v.d1! > 0 && v.d2! <= 0
                ? '→ both are true: the point is a solution'
                : '→ not both true: the point is not a solution'
              : '',
        },
      ),
    ],
    example: { m1: 1, b1: -2, m2: -2, b2: 4, x: 2, y: 0, tx: 0, ty: 0, d1: 2, d2: -4 },
    startWith: ['tx', 'ty', 'm1', 'b1', 'm2', 'b2'],
    equation: 'y > {m1}x + {b1}\ny ≤ {m2}x + {b2}',
    representation: {
      kind: 'lineSystem',
      lines: [
        { slope: 'm1', intercept: 'b1', shade: '>' },
        { slope: 'm2', intercept: 'b2', shade: '≤' },
      ],
      solution: { x: 'x', y: 'y' },
      test: { x: 'tx', y: 'ty' },
      extent: 10,
    },
  }),
  page({
    id: 'm.9.inequality-systems~elimination',
    title: 'Solve a system by elimination',
    use: 'Use this for “Solve 3x + 2y = 16 and 5x − 4y = 12 by elimination.”',
    assumptions: [
      'Multiply one or both equations so the y terms are opposites.',
      'Add the equations: y cancels, leaving one equation in x.',
      'Put x back into the first equation to find y, then check in the second.',
    ],
    variables: [
      int('a', 'a', 'x in the first', -12, 12),
      int('b', 'b', 'y in the first', -12, 12),
      int('c', 'c', 'Right side of the first', -100, 100),
      int('d', 'd', 'x in the second', -12, 12),
      int('e', 'e', 'y in the second', -12, 12),
      int('f', 'f', 'Right side of the second', -100, 100),
      int('L', 'L', 'Least common multiple of the y terms', 1, 144, { derived: true }),
      int('k1', 'k₁', 'Multiply the first by', -12, 12, { derived: true }),
      int('k2', 'k₂', 'Multiply the second by', -12, 12, { derived: true }),
      int('p', 'p', 'x in the sum', -300, 300, { derived: true }),
      int('r', 'r', 'Right side of the sum', -3000, 3000, { derived: true }),
      num('x', 'x', 'Solution x', -1000, 1000, { derived: true, fraction: 20 }),
      num('y', 'y', 'Solution y', -1000, 1000, { derived: true, fraction: 20 }),
      num('m1', 'm₁', 'First slope', -100, 100, { derived: true }),
      num('i1', 'i₁', 'First y-intercept', -100, 100, { derived: true }),
      num('m2', 'm₂', 'Second slope', -100, 100, { derived: true }),
      num('i2', 'i₂', 'Second y-intercept', -100, 100, { derived: true }),
    ],
    rules: [
      nonzero('b', 'The y in the first'),
      nonzero('e', 'The y in the second'),
      derive(
        'L = lcm of b and e',
        'L',
        ['b', 'e'],
        '{L} = least common multiple of {b} and {e}',
        (v) => lcm(v.b!, v.e!),
        'least common multiple of {b} and {e}',
        'The smallest number both y coefficients go into (their sizes, without the signs).',
      ),
      derive(
        'k₁ = L ÷ |b|',
        'k1',
        ['L', 'b'],
        '{k1} = {L} ÷ |{b}|',
        (v) => div(v.L!, Math.abs(v.b!)),
        '{L} ÷ |{b}|',
        'Multiply the first equation so its y term is L or −L.',
      ),
      derive(
        'k₂ = lcm ÷ e, with the sign that cancels',
        'k2',
        ['k1', 'b', 'e'],
        '{k2} = −{k1} × {b} ÷ {e}',
        (v) => div(-v.k1! * v.b!, v.e!),
        '−{k1} × {b} ÷ {e}',
        'Multiply the second so its y term is the opposite of the first’s: k₂e = −k₁b.',
      ),
      derive(
        'p = k₁a + k₂d',
        'p',
        ['k1', 'a', 'k2', 'd'],
        '{p} = {k1} × {a} + {k2} × {d}',
        (v) => v.k1! * v.a! + v.k2! * v.d!,
        '{k1} × {a} + {k2} × {d}',
        'Add the x terms of the two multiplied equations; the y terms cancel.',
      ),
      derive(
        'r = k₁c + k₂f',
        'r',
        ['k1', 'c', 'k2', 'f'],
        '{r} = {k1} × {c} + {k2} × {f}',
        (v) => v.k1! * v.c! + v.k2! * v.f!,
        '{k1} × {c} + {k2} × {f}',
        'Add the right sides the same way.',
      ),
      derive(
        'x = r ÷ p',
        'x',
        ['r', 'p'],
        '{x} = {r} ÷ {p}',
        (v) => div(v.r!, v.p!),
        '{r} ÷ {p}',
        'The sum is px = r: divide both sides by p.',
        {},
        {
          message: (v) =>
            v.p === 0
              ? 'x cancels too: the lines are parallel (no solution) or the same line (every point).'
              : undefined,
        },
      ),
      derive(
        'y = (c − ax) ÷ b',
        'y',
        ['c', 'a', 'x', 'b'],
        '{y} = ({c} − {a} × {x}) ÷ {b}',
        (v) => div(v.c! - v.a! * v.x!, v.b!),
        '({c} − {a} × {x}) ÷ {b}',
        'Put x into the first equation, take ax from both sides, then divide by b.',
      ),
      derive(
        'm₁ = −a ÷ b',
        'm1',
        ['a', 'b'],
        '{m1} = −{a} ÷ {b}',
        (v) => div(-v.a!, v.b!),
        '−{a} ÷ {b}',
        'For the graph: the first line’s slope, solving for y.',
      ),
      derive(
        'i₁ = c ÷ b',
        'i1',
        ['c', 'b'],
        '{i1} = {c} ÷ {b}',
        (v) => div(v.c!, v.b!),
        '{c} ÷ {b}',
        'And its y-intercept.',
      ),
      derive(
        'm₂ = −d ÷ e',
        'm2',
        ['d', 'e'],
        '{m2} = −{d} ÷ {e}',
        (v) => div(-v.d!, v.e!),
        '−{d} ÷ {e}',
        'The second line’s slope.',
      ),
      derive(
        'i₂ = f ÷ e',
        'i2',
        ['f', 'e'],
        '{i2} = {f} ÷ {e}',
        (v) => div(v.f!, v.e!),
        '{f} ÷ {e}',
        'And its y-intercept.',
      ),
    ],
    example: {
      a: 3,
      b: 2,
      c: 16,
      d: 5,
      e: -4,
      f: 12,
      L: 4,
      k1: 2,
      k2: 1,
      p: 11,
      r: 44,
      x: 4,
      y: 2,
      m1: -1.5,
      i1: 8,
      m2: 1.25,
      i2: -3,
    },
    startWith: ['a', 'b', 'c', 'd', 'e', 'f'],
    equation: '{a}x + {b}y = {c}\n{d}x + {e}y = {f}',
    representation: {
      kind: 'lineSystem',
      lines: [
        { slope: 'm1', intercept: 'i1', label: 'First' },
        { slope: 'm2', intercept: 'i2', label: 'Second' },
      ],
      solution: { x: 'x', y: 'y' },
      sum: { x: 'p', y: 0, c: 'r', label: 'Sum' },
      fixed: true,
    },
  }),
  page({
    id: 'm.9.inequality-systems~modeling',
    title: 'A budget and a count',
    use: 'Use this for “Adult tickets are $10 and student tickets $6. Spend at most $144 on at most 20 tickets.”',
    assumptions: [
      'One inequality for the money, Aa + Ss ≤ M, and one for the count, a + s ≤ N.',
      'Solve each for s to graph it; both shade below their lines.',
      'Only whole numbers of tickets, 0 or more, make sense.',
    ],
    variables: [
      num('A', 'A', 'Adult price', 0.01, 1000, { unit: '$', step: 0.01 }),
      num('S', 'S', 'Student price', 0.01, 1000, { unit: '$', step: 0.01 }),
      num('M', 'M', 'Budget', 0, 100000, { unit: '$', step: 0.01 }),
      int('N', 'N', 'Most tickets', 0, 1000),
      int('ta', 'a₀', 'Adult tickets to test', 0, 1000),
      int('ts', 's₀', 'Student tickets to test', 0, 1000),
      num('m1', 'm₁', 'Slope of the money line', -100000, 0, { derived: true }),
      num('i1', 'i₁', 'Money line’s s-intercept', 0, 1e7, { derived: true }),
      num('cx', 'a', 'Corner: adult tickets', -1e6, 1e6, { derived: true }),
      num('cy', 's', 'Corner: student tickets', -1e6, 1e6, { derived: true }),
      num('cost', 'C', 'Test cost', 0, 1e7, { unit: '$', derived: true }),
      int('count', 'n', 'Test count', 0, 2000, { derived: true }),
    ],
    rules: [
      derive(
        'm₁ = −A ÷ S',
        'm1',
        ['A', 'S'],
        '{m1} = −{A} ÷ {S}',
        (v) => div(-v.A!, v.S!),
        '−{A} ÷ {S}',
        'Solve Aa + Ss ≤ M for s: take Aa from both sides and divide by S. This is the slope.',
      ),
      derive(
        'i₁ = M ÷ S',
        'i1',
        ['M', 'S'],
        '{i1} = {M} ÷ {S}',
        (v) => div(v.M!, v.S!),
        '{M} ÷ {S}',
        'And the s-intercept: all student tickets.',
      ),
      derive(
        'a = (N − i₁) ÷ (m₁ + 1)',
        'cx',
        ['N', 'i1', 'm1'],
        '{cx} = ({N} − {i1}) ÷ ({m1} + 1)',
        (v) => div(v.N! - v.i1!, v.m1! + 1),
        '({N} − {i1}) ÷ ({m1} + 1)',
        'Where the lines cross: set m₁a + i₁ equal to −a + N and solve for a.',
        {},
        {
          message: (v) =>
            v.m1 === -1 ? 'The two prices are equal: the lines are parallel.' : undefined,
        },
      ),
      derive(
        's = N − a',
        'cy',
        ['N', 'cx'],
        '{cy} = {N} − {cx}',
        (v) => v.N! - v.cx!,
        '{N} − {cx}',
        'On the count line, the rest of the tickets are student tickets.',
      ),
      derive(
        'C = A a₀ + S s₀',
        'cost',
        ['A', 'ta', 'S', 'ts'],
        '{cost} = {A} × {ta} + {S} × {ts}',
        (v) => v.A! * v.ta! + v.S! * v.ts!,
        '{A} × {ta} + {S} × {ts}',
        'Test the money inequality: the cost of the test tickets must be at most M.',
      ),
      derive(
        'n = a₀ + s₀',
        'count',
        ['ta', 'ts'],
        '{count} = {ta} + {ts}',
        (v) => v.ta! + v.ts!,
        '{ta} + {ts}',
        'Test the count: at most N tickets.',
        {
          note: (v) =>
            known(v, 'cost', 'count', 'M', 'N')
              ? v.cost! <= v.M! && v.count! <= v.N!
                ? '→ both are true: the test point is a solution'
                : '→ not both true: the test point is not a solution'
              : '',
        },
      ),
    ],
    example: {
      A: 10,
      S: 6,
      M: 144,
      N: 20,
      ta: 5,
      ts: 12,
      m1: -5 / 3,
      i1: 24,
      cx: 6,
      cy: 14,
      cost: 122,
      count: 17,
    },
    startWith: ['A', 'S', 'M', 'N', 'ta', 'ts'],
    pictureLabels: ['cost', 'count'],
    representation: {
      kind: 'lineSystem',
      lines: [
        { slope: 'm1', intercept: 'i1', label: 'Money', shade: '≤' },
        { slope: -1, intercept: 'N', label: 'Count', shade: '≤' },
      ],
      solution: { x: 'cx', y: 'cy' },
      test: { x: 'ta', y: 'ts' },
      quadrants: 1,
      axes: { x: 'Adult tickets a', y: 'Student tickets s' },
      fixed: true,
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
  ...SOLVING_EQUATIONS,
  ...FUNCTION_NOTATION,
  ...LINEAR_MODELING,
  ...LINEAR_INEQUALITIES,
  ...LINEAR_INEQUALITIES_MORE,
  ...ABSOLUTE_VALUE,
  ...INEQUALITY_SYSTEMS,
];
