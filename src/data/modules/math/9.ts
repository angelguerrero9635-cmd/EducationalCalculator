/**
 * Grade 9 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md; the
 * direction plan and build notes: docs/BUILD_HS.md.
 * The layout pages (explore, sort, sequence, observe) are in `../layouts/math9.ts`.
 */
import { formatNumber, parseNumber, significant, superscript } from '@/engine/format';
import type { Relation, Values, VariableDef } from '@/engine/types';

import { div } from '../helpers';
import type { ModuleDef, StepText } from '../types';

type Solver = (v: Values) => number | number[] | undefined;

const fmt = (x: number) => formatNumber(x);
/** A value as a fraction or mixed number with a denominator up to `most`, as its box shows it. */
const fr = (x: number, most = 12) => formatNumber(x, { fraction: most, improper: true });
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

/** A check that only rejects values (a ≠ 0); `why` is the reason shown when it fails. */
function constraint(
  id: string,
  display: string,
  vars: string[],
  bad: (v: Values) => boolean,
  why?: (v: Values) => string,
) {
  return {
    relation: {
      id,
      constraint: true,
      display,
      vars,
      residual: (v: Values) => (bad(v) ? 1 : 0),
      solve: {},
      ...(why && { message: (v: Values) => (bad(v) ? why(v) : undefined) }),
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
    // A figure-only rule places the drawing: no steps.
    steps: Object.fromEntries(
      rules.filter((r) => !r.relation.hidden).map((r) => [r.relation.id, r.steps]),
    ),
  };
}

/** A rule that only places the drawing: kept out of the formulas, the steps and the check. */
const figure = (r: Rule): Rule => ({ relation: { ...r.relation, hidden: true }, steps: {} });
/** A value worked out for the picture only (see VariableDef.hidden). */
const pictureOnly = { derived: true, hidden: true } as const;

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
const EXPONENTIAL_MAIN = page({
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
  example: { a: 300, b: 2, x: 3, y: 2400 },
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

/** The power of b that makes n (8 as a power of 2 is 3), when it is a whole number. */
const powerOf = (b: number, n: number) => {
  if (!(b >= 2) || !(n >= 1)) return undefined;
  const k = Math.round(Math.log(n) / Math.log(b));
  return b ** k === n ? k : undefined;
};
/** The smallest base both p and q are whole powers of (4 and 8: 2), or nothing. */
const commonBase = (p: number, q: number) => {
  for (let b = 2; b <= Math.max(p, q); b++) if (powerOf(b, p) && powerOf(b, q)) return b;
  return undefined;
};
/** Digits (and a minus) raised: 12 → ¹². */
const raised = (x: number) => superscript(`^${x}`).replace(/^\^/, '');

const EXPONENTIAL: ModuleDef[] = [
  // ── Exponential functions: growth and decay (F-LE.1–3, F-LE.5, F-IF.8b) ──
  EXPONENTIAL_MAIN,
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
      num('A', 'A', 'Amount after t periods', 0.01, 9999999.99, { unit: '$' }),
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
    id: 'm.9.exponential-functions~same-base',
    title: 'Solve by writing the same base',
    use: 'Use this for “Solve 4⁶ = 8ˣ.”',
    assumptions: [
      'Write both sides as powers of one base: 4 = 2² and 8 = 2³.',
      'A power of a power multiplies the exponents: (2²)⁶ = 2¹².',
      'When the bases are equal, the exponents are equal: solve 3x = 12.',
    ],
    variables: [
      int('p', 'p', 'Base on the left', 2, 100),
      int('a', 'a', 'Exponent on the left', -10, 10),
      int('q', 'q', 'Base on the right', 2, 100),
      int('b', 'b', 'Common base', 2, 100, { derived: true }),
      int('s', 's', 'p as a power of b', 1, 10, { derived: true }),
      int('t', 't', 'q as a power of b', 1, 10, { derived: true }),
      int('e', 'e', 'Exponent of b on each side', -1000, 1000, { derived: true }),
      num('x', 'x', 'Solution', -100, 100, { fraction: 12 }),
      num('R', 'R', 'Each side’s value, b to the power e', 0, 1e21, { derived: true }),
      num('Q', 'Q', 'q to the power x, for the table', 0, 1e21, pictureOnly),
    ],
    rules: [
      derive(
        'b = common base of p and q',
        'b',
        ['p', 'q'],
        '{b} = the common base of {p} and {q}',
        (v) => commonBase(v.p!, v.q!),
        'the common base of {p} and {q}',
        'Find the smallest number both bases are powers of.',
        {},
        {
          message: (v) =>
            known(v, 'p', 'q') && commonBase(v.p!, v.q!) === undefined
              ? 'These bases are not powers of one number: this needs logarithms (Algebra 2).'
              : undefined,
        },
      ),
      derive(
        's: p = b^s',
        's',
        ['b', 'p'],
        '{s} = the power of {b} that makes {p}',
        (v) => powerOf(v.b!, v.p!),
        'the power of {b} that makes {p}',
        'Write the left base as a power of b.',
        { work: (v) => [`${fmt(v.p!)} = ${fmt(v.b!)}${raised(v.s!)}`] },
      ),
      derive(
        't: q = b^t',
        't',
        ['b', 'q'],
        '{t} = the power of {b} that makes {q}',
        (v) => powerOf(v.b!, v.q!),
        'the power of {b} that makes {q}',
        'Write the right base as a power of b too.',
        { work: (v) => [`${fmt(v.q!)} = ${fmt(v.b!)}${raised(v.t!)}`] },
      ),
      derive(
        'e = s × a',
        'e',
        ['s', 'a'],
        '{e} = {s} × {a}',
        (v) => v.s! * v.a!,
        '{s} × {a}',
        'A power of a power multiplies the exponents: the left side is b to the power sa.',
      ),
      rule('x = e ÷ t', '{x} = {e} ÷ {t}', ['x', 'e', 't'], (v) => v.x! * v.t! - v.e!, {
        x: [
          (v) => div(v.e!, v.t!),
          '{e} ÷ {t}',
          'The right side is b to the power tx. The bases match, so tx = e: divide by t.',
        ],
        e: [(v) => v.t! * v.x!, '{t} × {x}', 'The same, solved for e: e = tx.'],
      }),
      derive(
        'R = b^e',
        'R',
        ['b', 'e'],
        '{R} = {b}^{e}',
        (v) => fin(v.b! ** v.e!),
        '{b}^{e}',
        'Check: both sides are this number.',
        {},
        { check: (v) => `${fmt(v.p!)}${raised(v.a!)} = ${fmt(v.R!)}` },
      ),
      figure(
        derive(
          'Q = q^x',
          'Q',
          ['q', 'x'],
          '{Q} = {q}^{x}',
          (v) => fin(v.q! ** v.x!),
          '{q}^{x}',
          '',
        ),
      ),
    ],
    example: { p: 4, a: 6, q: 8, b: 2, s: 2, t: 3, e: 12, x: 4, R: 4096, Q: 4096 },
    startWith: ['p', 'a', 'q'],
    equation: '{p}^{a} = {q}^x',
    representation: {
      kind: 'table',
      sweep: 'x',
      output: 'Q',
      params: ['q'],
      rows: [0, 1, 2, 3, 4, 5, 6],
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
      num('k', 'k', 'Number of doublings', 0, 10000, { derived: true }),
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
        {
          message: (v) =>
            known(v, 'N0', 'k') && v.N0! * 2 ** v.k! > 1e40
              ? `${fmt(v.k!)} doublings make the amount too large to show: try a shorter time.`
              : undefined,
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
/** The same, as a fraction or mixed number when it isn't whole: (−3 2/3). */
const sgf = (x: number, most = 20) => (x < 0 ? `(${fr(x, most)})` : fr(x, most));
/** A polynomial from its terms, highest power first: [[2, 'x²'], [−5, 'x'], [−12, '']]. */
function poly(terms: [number, string][], f: (x: number) => string = fmt): string {
  const parts = terms.filter(([k]) => k !== 0);
  if (parts.length === 0) return '0';
  return parts
    .map(([k, s], i) => {
      const size = Math.abs(k) === 1 && s ? s : `${f(Math.abs(k))}${s}`;
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
      num('L', 't_land', 'Landing time', 0, 10000, { unit: 's', units: ['s'], derived: true }),
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
        'h = at² + vt + h₀',
        '{H} = {A} × {t}² + {v} × {t} + {h0}',
        ['H', 'A', 't', 'v', 'h0'],
        (v) => v.H! - (v.A! * v.t! ** 2 + v.v! * v.t! + v.h0!),
        {
          H: [
            (v) => exact(v.A! * v.t! ** 2 + v.v! * v.t! + v.h0!),
            '{A} × {t}² + {v} × {t} + {h0}',
            'Put the time into the height rule.',
          ],
          t: [
            (v) => {
              const D = v.v! ** 2 - 4 * v.A! * (v.h0! - v.H!);
              if (D < 0 || !v.A) return undefined;
              return [(-v.v! + Math.sqrt(D)) / (2 * v.A!), (-v.v! - Math.sqrt(D)) / (2 * v.A!)]
                .filter((x) => x >= 0)
                .map(exact);
            },
            '(−{v} ± √({v}² − 4 × {A} × ({h0} − {H}))) ÷ (2 × {A})',
            'Write the rule = 0 and use the quadratic formula: the ball is at a height once going up, once coming down.',
          ],
          h0: [
            (v) => exact(v.H! - v.A! * v.t! ** 2 - v.v! * v.t!),
            '{H} − {A} × {t}² − {v} × {t}',
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
      derive(
        't_land = (v + √(v² + 2gh₀)) ÷ g',
        'L',
        ['v', 'g', 'h0'],
        '{L} = ({v} + √({v}² + 2 × {g} × {h0})) ÷ {g}',
        (v) => div(v.v! + Math.sqrt(v.v! ** 2 + 2 * v.g! * v.h0!), v.g!),
        '({v} + √({v}² + 2 × {g} × {h0})) ÷ {g}',
        'Set h = 0 and use the quadratic formula; the positive root is the landing.',
      ),
    ],
    example: {
      g: 9.8,
      v: 19.6,
      h0: 2,
      t: 1,
      H: 16.7,
      A: -4.9,
      T: 2,
      M: 21.6,
      L: (19.6 + Math.sqrt(19.6 ** 2 + 2 * 9.8 * 2)) / 9.8,
    },
    // The graph's axes are in meters and seconds, so the units stay put.
    unitSystems: ['metric'],
    startWith: ['t', 'g', 'v', 'h0'],
    pictureLabels: ['L'],
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
      // The second polynomial as added (its opposite when subtracting): the tiles' second group.
      tile('D', 'd′', 'x² added', pictureOnly),
      tile('E', 'e′', 'x added', pictureOnly),
      tile('F', 'f′', 'Number added', pictureOnly),
      int('p', 'p', 'x² in the answer', -20, 20, { derived: true }),
      int('q', 'q', 'x in the answer', -20, 20, { derived: true }),
      int('r', 'r', 'Number in the answer', -20, 20, { derived: true }),
    ],
    rules: [
      ...(
        [
          ['D', 'd'],
          ['E', 'e'],
          ['F', 'f'],
        ] as const
      ).map(([id, from]) =>
        figure(
          derive(
            `${id} = ±${from}`,
            id,
            [from, 'o'],
            `{${id}} = {${from}} × (1 or −1, as {o} says)`,
            // 1 for +, −1 for − (o is 1 or 2): one smooth rule, so the search reads it right.
            (v) => v[from]! * (3 - 2 * v.o!),
            `{${from}}`,
            'The second group of tiles: the second polynomial, or its opposite when subtracting.',
          ),
        ),
      ),
      ...(
        [
          ['p', 'a', 'd', 'x² terms'],
          ['q', 'b', 'e', 'x terms'],
          ['r', 'c', 'f', 'numbers'],
        ] as const
      ).map(([id, x, y, what], i) =>
        rule(
          `${id} = ${x} ± ${y}`,
          `{${id}} = {${x}} ± {${y}}, − when {o} is 2`,
          [id, x, y, 'o'],
          (v) => v[id]! - (v[x]! + v[y]! * (3 - 2 * v.o!)),
          {
            [id]: [
              (v) => exact(v[x]! + v[y]! * (3 - 2 * v.o!)),
              (v) => (v.o === 2 ? `{${x}} − {${y}}` : `{${x}} + {${y}}`),
              (v) =>
                v.o === 2
                  ? `Subtracting adds the opposite: combine the ${what}, the second one’s sign changed.`
                  : `Combine the ${what}.`,
              {
                // The subtraction written as adding the opposite, once, before the like terms.
                ...(i === 0
                  ? {
                      work: (v: Values) =>
                        v.o === 2 && known(v, 'd', 'e', 'f')
                          ? [
                              `−(${poly([
                                [v.d!, 'x²'],
                                [v.e!, 'x'],
                                [v.f!, ''],
                              ])}) = ${poly([
                                [-v.d!, 'x²'],
                                [-v.e!, 'x'],
                                [-v.f!, ''],
                              ])}`,
                            ]
                          : [],
                    }
                  : {}),
                ...(i === 2
                  ? {
                      note: (v: Values) =>
                        known(v, 'p', 'q', 'r')
                          ? `→ ${poly([
                              [v.p!, 'x²'],
                              [v.q!, 'x'],
                              [v.r!, ''],
                            ])}`
                          : '',
                    }
                  : {}),
              },
            ],
          },
          {
            check: (v) =>
              v.o === 2
                ? `${fmt(v[id]!)} = ${fmt(v[x]!)} − ${sg(v[y]!)}`
                : `${fmt(v[id]!)} = ${fmt(v[x]!)} + ${sg(v[y]!)}`,
          },
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

/**
 * p and q with p + q = b and p × q = c, when b² − 4c is a perfect square: p the larger, unless
 * it is 0 (then the other). The harness reads "the number in the pair of c that adds to b" the
 * same way (phrasesM9.ts).
 */
const pairFor = (b: number, c: number) => {
  const r = intRoot(b * b - 4 * c);
  if (r === undefined) return undefined;
  const [p, q] = [(b + r) / 2, (b - r) / 2];
  return p === 0 ? { p: q, q: p } : { p, q };
};
/** ax + b as a bracket's inside: 2x + 1, x − 3, x. */
const bin = (a: number, b: number) =>
  poly([
    [a, 'x'],
    [b, ''],
  ]);
/** The most tiles an edge of the rectangle holds. */
const EDGE = 10;
const noPair = (v: Values) => {
  if (v.b === undefined || v.c === undefined) return undefined;
  const pq = pairFor(v.b, v.c);
  if (!pq)
    return 'No two whole numbers multiply to c and add to b: it does not factor over the integers.';
  return Math.abs(pq.p) > EDGE || Math.abs(pq.q) > EDGE
    ? `${fmt(pq.p)} and ${fmt(pq.q)} work: (${bin(1, pq.p)})(${bin(1, pq.q)}). The tiles hold at most ${EDGE} on an edge, so this page stops there.`
    : undefined;
};

/**
 * The ac method for ax² + bx + c (a > 0): m + n = b, m × n = ac; then p = GCF(a, m), the
 * common bracket (rx + s) = (ax + m) ÷ p, and q = n ÷ r.
 */
function acSplit(a: number, b: number, c: number) {
  const pair = pairFor(b, a * c);
  if (pair === undefined || !(a > 0)) return undefined;
  const { p: m, q: n } = pair;
  const p = gcd(a, m) || a;
  const r = a / p;
  const s = m / p;
  return { m, n, p, r, s, q: n / r };
}
const noSplit = (v: Values) => {
  if (v.a === undefined || v.b === undefined || v.c === undefined) return undefined;
  const f = acSplit(v.a, v.b, v.c);
  if (!f)
    return 'No two whole numbers multiply to ac and add to b: it does not factor over the integers.';
  return [f.p, f.q, f.r, f.s].some((x) => Math.abs(x) > EDGE)
    ? `It factors as (${bin(f.p, f.q)})(${bin(f.r, f.s)}), but the tiles hold at most ${EDGE} on an edge, so this page stops there.`
    : undefined;
};

/** The perfect squares 1 to 100: a difference of two squares starts from them. */
const SQUARES = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];

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
        'p: the pair of c that adds to b',
        'p',
        ['c', 'b'],
        '{p} = the number in the pair of {c} that adds to {b}',
        (v) => pairFor(v.b!, v.c!)?.p,
        'the number in the pair of {c} that adds to {b}',
        'List the factor pairs of c and find the pair that adds to b; p is the larger of the two.',
        {
          work: (v) => {
            const q = v.b! - v.p!;
            return [
              `${sg(v.p!)} × ${sg(q)} = ${fmt(v.c!)}`,
              `${sg(v.p!)} + ${sg(q)} = ${fmt(v.b!)}`,
            ];
          },
        },
        { message: noPair, check: (v) => `${sg(v.p!)} × ${sg(v.b! - v.p!)} = ${fmt(v.c!)}` },
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
        { check: (v) => `${sg(v.p!)} + ${sg(v.q!)} = ${fmt(v.b!)}` },
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
      'Take out any common factor of a, b and c first, or a bracket keeps one.',
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
        'm: the pair of ac that adds to b',
        'm',
        ['a', 'c', 'b'],
        '{m} = the number in the pair of {a} × {c} that adds to {b}',
        (v) => acSplit(v.a!, v.b!, v.c!)?.m,
        'the number in the pair of {a} × {c} that adds to {b}',
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
        {
          message: noSplit,
          check: (v) => `${sg(v.m!)} × ${sg(v.b! - v.m!)} = ${fmt(v.a! * v.c!)}`,
        },
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
        { check: (v) => `${sg(v.m!)} + ${sg(v.n!)} = ${fmt(v.b!)}` },
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
            const split = `${fmt(v.p!)}x(${common}) ${v.q! < 0 ? '−' : '+'} ${fmt(Math.abs(v.q!))}(${common})`;
            const out = `${split} = (${bin(v.p!, v.q!)})(${common})`;
            // A common factor left in a bracket comes out too: (4x + 2)(x + 2) = 2(2x + 1)(x + 2).
            const g = gcd(v.p!, v.q!);
            return g > 1
              ? `→ ${out} = ${fmt(g)}(${bin(v.p! / g, v.q! / g)})(${common})`
              : `→ ${out}`;
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
        {
          note: (v) =>
            known(v, 'a', 'b', 'g', 'p', 'q')
              ? `→ ${poly([
                  [v.a!, 'x²'],
                  [v.b!, 'x'],
                ])} = ${v.g === 1 ? '' : fmt(v.g!)}x(${bin(v.p!, v.q!)})`
              : '',
        },
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
      int('a', 'a', 'x² coefficient', 1, 100, { allowed: SQUARES }),
      int('c', 'c', 'Number taken away', 1, 100, { allowed: SQUARES }),
      tile('p', 'p', 'Square root of a', { derived: true }),
      tile('q', 'q', 'Square root of c', { derived: true }),
      tile('u', 'u', 'Number in the second bracket', { derived: true }),
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
        {},
        { check: (v) => `${fmt(v.q!)} + ${sg(v.u!)} = 0` },
      ),
      derive(
        'z = p × u + q × p',
        'z',
        ['p', 'u', 'q'],
        '{z} = {p} × {u} + {q} × {p}',
        (v) => v.p! * v.u! + v.q! * v.p!,
        '{p} × {u} + {q} × {p}',
        'Check the middle: the outer and inner x terms are opposites, so they cancel.',
        {
          note: (v) =>
            known(v, 'a', 'c', 'p', 'q')
              ? `→ ${v.a === 1 ? '' : fmt(v.a!)}x² − ${fmt(v.c!)} = (${bin(v.p!, v.q!)})(${bin(v.p!, -v.q!)})`
              : '',
        },
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
function monicZeros(set: (lo: string, hi: string) => string): Rule[] {
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
      sign > 0
        ? {
            note: (v) => (known(v, 'x1', 'x2') ? `→ ${set(fr(v.x1!, 20), fr(v.x2!, 20))}` : ''),
          }
        : {},
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
    rules: monicZeros((lo, hi) => `${lo} < x < ${hi}`),
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
    rules: monicZeros((lo, hi) => `x ≤ ${lo} or x ≥ ${hi}`),
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
      num('x1', 'x₁', 'Root with −√D', -1e6, 1e6, { derived: true, fraction: 12 }),
      num('x2', 'x₂', 'Root with +√D', -1e6, 1e6, { derived: true, fraction: 12 }),
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
      num('h', 'h', 'Vertex x, −p', -50, 50, pictureOnly),
      num('k', 'k', 'Vertex y, −q', -10000, 1000, pictureOnly),
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
      figure(
        derive(
          'h = −p',
          'h',
          ['p'],
          '{h} = −{p}',
          (v) => -v.p!,
          '−{p}',
          'On the graph of y = (x + p)² − q the vertex is at x = −p.',
        ),
      ),
      figure(
        derive(
          'k = −q',
          'k',
          ['q'],
          '{k} = −{q}',
          (v) => -v.q!,
          '−{q}',
          'Moving q to the left side puts the vertex at y = −q; the roots are the zeros.',
        ),
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
        {
          work: (v) =>
            known(v, 'b', 'c', 'k', 'm', 'R')
              ? [
                  `${poly([
                    [1, 'x²'],
                    [v.b!, 'x'],
                    [v.m!, ''],
                  ])} = ${fmt(-v.c!)} + ${fmt(v.m!)}`,
                  `(${xPlus(v.k!)})² = ${fmt(v.R!)}`,
                ]
              : [],
        },
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
function bothSides(
  a: string,
  b: string,
  c: string,
  d: string,
  check?: (v: Values) => string,
): Rule {
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
            ? `Take ${c}x from both sides so the x terms are on the left, take ${b} away, then divide.`
            : `Take ${a}x from both sides so the x terms are on the right, take ${d} away, then divide.`,
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
              ...(k === 1 ? [] : [`Divide both sides by ${fmt(k)}: x = ${fr(v.x!, 20)}`]),
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
        // (every number solves it when b = d too, but a message refuses the newest input)
        v[b] !== v[d]
          ? sameX(v[b]!, v[d]!)
          : undefined,
      // Every number solves it when b = d too: said, never refusing an input.
      explain: (v) =>
        v[a] !== undefined && v[a] === v[c] && v[b] !== undefined && v[b] === v[d]
          ? sameX(v[b]!, v[d]!)
          : undefined,
      ...(check ? { check } : {}),
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
    use: 'Use this for “2(3x − 4) = 4x + 2” (numbers after distributing up to 10).',
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
      bothSides('A', 'B', 'c', 'd', (v) =>
        known(v, 'p', 'a', 'b')
          ? `${fmt(v.p!)} × (${fmt(v.a!)} × ${sgf(v.x!)} + ${sg(v.b!)}) = ${fmt(v.c!)} × ${sgf(v.x!)} + ${sg(v.d!)}`
          : `${fmt(v.A!)} × ${sgf(v.x!)} + ${sg(v.B!)} = ${fmt(v.c!)} × ${sgf(v.x!)} + ${sg(v.d!)}`,
      ),
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
      num('P', 'P', 'Perimeter', 0.4, 100000, { unit: 'cm', step: 0.1 }),
      num('l', 'l', 'Length', 0.1, 50000, { unit: 'cm', step: 0.1 }),
      num('w', 'w', 'Width', 0.1, 50000, { unit: 'cm', step: 0.1 }),
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
  page({
    id: 'm.9.solving-equations~literal-line',
    title: 'Solve ax + by = c for y',
    use: 'Use this for “Solve 2x + 3y = 12 for y. What is y when x = 3?”',
    assumptions: [
      'Treat x as a number you know and undo what is done to y.',
      'Take ax from both sides, then divide every term by b: y = (c − ax) ÷ b.',
      'The points (x, y) that make it true lie on one straight line.',
    ],
    variables: [
      int('a', 'a', 'x coefficient', -20, 20),
      int('b', 'b', 'y coefficient', -20, 20),
      int('c', 'c', 'Right side', -100, 100),
      num('x', 'x', 'Point’s x', -50, 50, { step: 0.5, fraction: 12 }),
      num('y', 'y', 'Point’s y', -2000, 2000, { fraction: 12 }),
      num('m', 'm', 'Slope', -100, 100, pictureOnly),
      num('k', 'k', 'y-intercept', -1000, 1000, pictureOnly),
    ],
    rules: [
      nonzero('b', 'The y coefficient'),
      rule(
        'ax + by = c',
        '{a} × {x} + {b} × {y} = {c}',
        ['a', 'x', 'b', 'y', 'c'],
        (v) => v.a! * v.x! + v.b! * v.y! - v.c!,
        {
          y: [
            (v) => (v.b ? exact((v.c! - v.a! * v.x!) / v.b!) : undefined),
            '({c} − {a} × {x}) ÷ {b}',
            'Take ax from both sides, then divide both sides by b.',
            {
              note: (v) =>
                known(v, 'a', 'b', 'c')
                  ? `→ solved for y: y = (${fmt(v.c!)} − ${v.a! < 0 ? `(${fmt(v.a!)})` : fmt(v.a!)}x) ÷ ${sg(v.b!)}`
                  : '',
            },
          ],
          x: [
            (v) => (v.a ? exact((v.c! - v.b! * v.y!) / v.a!) : undefined),
            '({c} − {b} × {y}) ÷ {a}',
            'Solve for x the same way: take by from both sides, then divide by a.',
          ],
          c: [
            (v) => exact(v.a! * v.x! + v.b! * v.y!),
            '{a} × {x} + {b} × {y}',
            'Put the point into the left side.',
          ],
        },
        {
          message: (v) =>
            v.a === 0 && v.b !== undefined && v.c !== undefined && v.y !== undefined
              ? v.b * v.y === v.c
                ? 'a is 0, so x can be any number: the line is flat at this y.'
                : 'a is 0, so y is c ÷ b for every x: this y is not on the line.'
              : undefined,
        },
      ),
      derive(
        'm = −a ÷ b',
        'm',
        ['a', 'b'],
        '{m} = −{a} ÷ {b}',
        (v) => div(-v.a!, v.b!),
        '−{a} ÷ {b}',
        'The slope of the line.',
        {},
        { hidden: true },
      ),
      derive(
        'k = c ÷ b',
        'k',
        ['c', 'b'],
        '{k} = {c} ÷ {b}',
        (v) => div(v.c!, v.b!),
        '{c} ÷ {b}',
        'Where the line crosses the y-axis.',
        {},
        { hidden: true },
      ),
    ],
    example: { a: 2, b: 3, c: 12, x: 3, y: 2, m: -2 / 3, k: 4 },
    startWith: ['x', 'a', 'b', 'c'],
    equation: '{a:coef}x + {b:coef}y = {c}',
    representation: {
      kind: 'functionGraph',
      family: 'linear',
      m: 'm',
      b: 'k',
      at: { x: 'x', y: 'y' },
      marks: ['intercept'],
    },
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
      num('y', 'y', 'Output f(x)', -300, 300),
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
      num('y', 'y', 'Output f(x)', -100000, 100000, { derived: true }),
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
      num('y1', 'y₁', 'Output at x₁, f(x₁)', -500, 500, { derived: true }),
      num('y2', 'y₂', 'Output at x₂, f(x₂)', -500, 500, { derived: true }),
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
      num('y1', 'y₁', 'Output at x₁, f(x₁)', -10000, 10000, { derived: true }),
      num('y2', 'y₂', 'Output at x₂, f(x₂)', -10000, 10000, { derived: true }),
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
        'r = (y₂ − y₁) ÷ Δx',
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
              work: (v) => {
                const m = v.m!;
                const slope = m === 1 ? '' : m === -1 ? '−' : m < 0 ? `(${fr(m)})` : fr(m);
                return [
                  `${xPlus(-v.y1!, 'y')} = ${slope}(${xPlus(-v.x1!)})`,
                  `${xPlus(-v.y1!, 'y')} = ${poly(
                    [
                      [m, 'x'],
                      [exact(-m * v.x1!), ''],
                    ],
                    fr,
                  )}`,
                  `y = ${poly(
                    [
                      [m, 'x'],
                      [v.b!, ''],
                    ],
                    fr,
                  )}`,
                ];
              },
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
      num('m2', 'm₂', 'Slope of the new line', -1000, 1000, { derived: true, fraction: 12 }),
      num('b2', 'b₂', 'y-intercept of the new line', -100000, 100000, {
        derived: true,
        fraction: 12,
      }),
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
            v.k === 2 ? `${fr(v.m2!)} = −1 ÷ ${sg(v.m1!)}` : `${fr(v.m2!)} = ${fmt(v.m1!)}`,
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

/** "→ true" or "→ false" after a test's 1 or 0. */
const truthNote =
  (id = 'h') =>
  (v: Values) =>
    v[id] === undefined ? '' : `→ ${v[id] ? 'true' : 'false'}`;
/** How two numbers really compare: <, = or >. */
const cmp = (l: number, r: number) => (l < r ? '<' : l > r ? '>' : '=');
/** A test's check: the two sides as they compare, and what that says about the test number. */
const testCheck = (l: number, r: number, ok: boolean, what = 'the test number') =>
  `${fmt(l)} ${cmp(l, r)} ${fmt(r)}, so ${what} ${ok ? 'is' : 'is not'} a solution`;
/** ax + b at t with its arithmetic, for a check line: 3 × (−6) − 4 = −22. */
const atLine = (k: number, t: number, n: number) =>
  `${fmt(k)} × ${sg(t)} ${n < 0 ? '−' : '+'} ${fmt(Math.abs(n))} = ${fmt(exact(k * t + n))}`;

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
            const after = SIGNS[(k < 0 ? flip(v.s) : v.s) - 1]!;
            const bound = v.k === undefined ? '' : `: x ${after} ${fr(v.k, 20)}`;
            lines.push(
              k < 0
                ? `Divide both sides by ${fmt(k)}, a negative, so ${sign} flips to ${after}${bound}`
                : `Divide both sides by ${fmt(k)}; the sign stays ${sign}${bound}`,
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
              note: (v) =>
                known(v, 'f', 'k')
                  ? `→ sign ${SIGNS[v.f! - 1]}: x ${SIGNS[v.f! - 1]} ${fr(v.k!, 20)}`
                  : '',
            },
          ],
        },
        {
          check: (v) =>
            `${fmt(v.a!)} ${cmp(v.a!, v.c!)} ${fmt(v.c!)}, so ${
              v.a! - v.c! < 0
                ? `${SIGNS[v.s! - 1]} flips to ${SIGNS[v.f! - 1]}`
                : `the sign stays ${SIGNS[v.s! - 1]}`
            }`,
        },
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
              note: truthNote(),
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
          check: (v) =>
            testCheck(
              exact(v.a! * v.t! + v.b!),
              exact(v.c! * v.t! + v.d!),
              compare(v.a! * v.t! + v.b!, v.s!, v.c! * v.t! + v.d!),
            ),
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
  check: (v: Values) => string,
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
        { work: (v) => lines(v), written: false, note: truthNote() },
      ],
    },
    { check },
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
        {
          // (no interval when the bounds cross: the message says why)
          note: (v) => (known(v, 'L', 'U') && v.L! < v.U! ? `→ ${fr(v.L!)} < x ≤ ${fr(v.U!)}` : ''),
        },
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
        (v) => {
          const m = exact(v.a! * v.t! + v.b!);
          const ok = v.l! < m && m <= v.r!;
          return `${atLine(v.a!, v.t!, v.b!)}, so ${fmt(v.t!)} ${ok ? 'is' : 'is not'} a solution`;
        },
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
                : `→ x < ${fr(v.L!)} or x ≥ ${fr(v.U!)}`
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
        (v) => {
          const ok = v.a! * v.t! + v.b! < v.c! || v.d! * v.t! + v.e! >= v.f!;
          return `${atLine(v.a!, v.t!, v.b!)}, so ${fmt(v.t!)} ${ok ? 'is' : 'is not'} a solution`;
        },
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
        num('yl', 'y_line', 'Height of the line at x₀', -120, 120, { derived: true }),
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
                note: truthNote(),
                work: (v) => [
                  `${fmt(v.ty!)} ${sign} ${fmt(v.yl!)} is ${compare(v.ty!, code, v.yl!) ? 'true' : 'false'}`,
                ],
                written: false,
              },
            ],
          },
          {
            check: (v) => testCheck(v.ty!, v.yl!, compare(v.ty!, code, v.yl!), 'the test point'),
          },
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
      num('n', 'n', 'Bound on the visits', 0, 1000, { derived: true }),
      int('N', 'N', 'Most or fewest whole visits', 0, 1000, { derived: true }),
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
        {},
        {
          message: (v) =>
            known(v, 'B', 'F') && v.B! < v.F!
              ? v.s === 4
                ? 'The fixed cost alone is past the amount: no visits are needed.'
                : 'The fixed cost is more than the budget: no visits fit.'
              : undefined,
        },
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
                ? `→ ${fr(v.L!, 20)} ≤ x ≤ ${fr(v.U!, 20)}`
                : `→ x ≤ ${fr(v.L!, 20)} or x ≥ ${fr(v.U!, 20)}`
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
              note: truthNote('k'),
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
            testCheck(
              Math.abs(exact(v.a! * v.t! + v.b!)),
              v.c!,
              compare(Math.abs(v.a! * v.t! + v.b!), within ? 2 : 4, v.c!),
            ),
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
      derive(
        'h = (x₁ + x₂) ÷ 2',
        'h',
        ['x1', 'x2'],
        '{h} = ({x1} + {x2}) ÷ 2',
        (v) => (v.x1! + v.x2!) / 2,
        '({x1} + {x2}) ÷ 2',
        'The center is halfway between the two solutions, where ax + b = 0.',
      ),
      derive(
        'd = |x₁ − x₂| ÷ 2',
        'd',
        ['x1', 'x2'],
        '{d} = |{x1} − {x2}| ÷ 2',
        (v) => Math.abs(v.x1! - v.x2!) / 2,
        '|{x1} − {x2}| ÷ 2',
        'Each solution is this far from the center: c ÷ |a|.',
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
      num('d1', 'd₁', 'Test point’s height above the first line', -250, 250, {
        derived: true,
      }),
      num('d2', 'd₂', 'Test point’s height above the second line', -250, 250, {
        derived: true,
      }),
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
      num('m1', 'm₁', 'First slope', -100, 100, { ...pictureOnly, fraction: 12 }),
      num('i1', 'i₁', 'First y-intercept', -100, 100, pictureOnly),
      num('m2', 'm₂', 'Second slope', -100, 100, { ...pictureOnly, fraction: 12 }),
      num('i2', 'i₂', 'Second y-intercept', -100, 100, pictureOnly),
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
        {
          work: (v) => {
            if (!known(v, 'a', 'b', 'c', 'd', 'e', 'f', 'k1', 'k2')) return [];
            const side = (a: number, b: number) =>
              poly([
                [a, 'x'],
                [b, 'y'],
              ]);
            const times = (k: number, a: number, b: number, c: number) =>
              k === 1
                ? `${side(a, b)} = ${fmt(c)}`
                : `${fmt(k)}(${side(a, b)}) = ${fmt(k)}(${fmt(c)}): ${side(k * a, k * b)} = ${fmt(k * c)}`;
            return [
              times(v.k1!, v.a!, v.b!, v.c!),
              times(v.k2!, v.d!, v.e!, v.f!),
              `Add: ${poly([[v.k1! * v.a! + v.k2! * v.d!, 'x']])} = ${fmt(v.k1! * v.c! + v.k2! * v.f!)}`,
            ];
          },
        },
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
        {},
        {
          // Found from the first equation, so check it in the second.
          check: (v) => `${fmt(v.d!)} × ${sgf(v.x!)} + ${sg(v.e!)} × ${sgf(v.y!)} = ${fmt(v.f!)}`,
        },
      ),
      figure(
        derive(
          'm₁ = −a ÷ b',
          'm1',
          ['a', 'b'],
          '{m1} = −{a} ÷ {b}',
          (v) => div(-v.a!, v.b!),
          '−{a} ÷ {b}',
          'For the graph: the first line’s slope, solving for y.',
        ),
      ),
      figure(
        derive(
          'i₁ = c ÷ b',
          'i1',
          ['c', 'b'],
          '{i1} = {c} ÷ {b}',
          (v) => div(v.c!, v.b!),
          '{c} ÷ {b}',
          'And its y-intercept.',
        ),
      ),
      figure(
        derive(
          'm₂ = −d ÷ e',
          'm2',
          ['d', 'e'],
          '{m2} = −{d} ÷ {e}',
          (v) => div(-v.d!, v.e!),
          '−{d} ÷ {e}',
          'The second line’s slope.',
        ),
      ),
      figure(
        derive(
          'i₂ = f ÷ e',
          'i2',
          ['f', 'e'],
          '{i2} = {f} ÷ {e}',
          (v) => div(v.f!, v.e!),
          '{f} ÷ {e}',
          'And its y-intercept.',
        ),
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
      num('m1', 'm₁', 'Slope of the money line', -100000, 0, { derived: true, fraction: 12 }),
      num('i1', 'i₁', 'Money line’s s-intercept', 0, 1e7, { derived: true }),
      num('cx', 'a', 'Corner: adult tickets', 0, 1000, { derived: true }),
      num('cy', 's', 'Corner: student tickets', 0, 1000, { derived: true }),
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
        'a = (M − SN) ÷ (A − S)',
        'cx',
        ['M', 'S', 'N', 'A'],
        '{cx} = ({M} − {S} × {N}) ÷ ({A} − {S})',
        (v) => {
          const a = div(v.M! - v.S! * v.N!, v.A! - v.S!);
          return a !== undefined && a >= 0 && a <= v.N! ? a : undefined;
        },
        '({M} − {S} × {N}) ÷ ({A} − {S})',
        'Where the lines cross: put s = N − a into Aa + Ss = M, so (A − S)a = M − SN.',
        {},
        {
          message: (v) => {
            if (!known(v, 'A', 'S', 'M', 'N')) return undefined;
            if (v.A === v.S)
              return 'The two prices are equal: the lines are parallel, so there is no corner.';
            const a = (v.M! - v.S! * v.N!) / (v.A! - v.S!);
            return a < 0 || a > v.N!
              ? 'The lines cross outside the first quadrant: no whole-ticket corner there.'
              : undefined;
          },
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

// ── Radicals and exponents ──

/** The largest perfect square (index 2) or cube (3) that divides n. */
function largestPower(n: number, index: 2 | 3): number {
  let best = 1;
  for (let k = 1; k ** index <= n; k++) if (n % k ** index === 0) best = k ** index;
  return best;
}
/** Whether n has no factor that is a perfect square (or cube) but 1. */
const powerFree = (n: number, index: 2 | 3) => largestPower(n, index) === 1;

/** √n = k√r (or ∛): the number outside from the largest perfect power factor, and what is left. */
function rootRules(n: string, index: 2 | 3, k = 'k', r = 'r'): Rule[] {
  const sign = index === 3 ? '∛' : '√';
  const word = index === 3 ? 'cube' : 'square';
  const pow = index === 3 ? '³' : '²';
  return [
    constraint(
      'nothing more comes out',
      `{${r}} has no factor that is a perfect ${word} but 1`,
      [r],
      (v) => !powerFree(v[r]!, index),
    ),
    derive(
      `${k} = ${sign}(largest perfect ${word} factor of ${n})`,
      k,
      [n],
      `{${k}} = ${sign}(largest perfect ${word} factor of {${n}})`,
      (v) => Math.round(largestPower(v[n]!, index) ** (1 / index)),
      `${sign}(largest perfect ${word} factor of {${n}})`,
      `Each ${index === 3 ? 'group of three' : 'pair'} of equal prime factors brings one out: together they make the ${sign} of the largest perfect ${word} factor.`,
      {
        work: (v) => {
          const big = largestPower(v[n]!, index);
          return big === 1
            ? []
            : [
                `${fmt(v[n]!)} = ${fmt(big)} × ${fmt(v[n]! / big)}`,
                `${sign}${fmt(big)} = ${fmt(v[k]!)}`,
              ];
        },
      },
    ),
    derive(
      `${r} = ${n} ÷ ${k}${pow}`,
      r,
      [n, k],
      `{${r}} = {${n}} ÷ {${k}}${pow}`,
      (v) => div(v[n]!, v[k]! ** index),
      `{${n}} ÷ {${k}}${pow}`,
      'What is left under the root: divide out the perfect factor.',
      {
        note: (v) =>
          !known(v, n, k, r)
            ? ''
            : v[r] === 1
              ? `→ ${sign}${fmt(v[n]!)} = ${fmt(v[k]!)}`
              : v[k] === 1
                ? `→ ${sign}${fmt(v[n]!)} is already in simplest form`
                : `→ ${sign}${fmt(v[n]!)} = ${fmt(v[k]!)}${sign}${fmt(v[r]!)}`,
      },
    ),
  ];
}

/** The qth root of b as it is written: √b, ∛b, ∜b, the fifth root of b. */
const ROOT_OF: Record<number, string> = {
  2: '√{b}',
  3: '∛{b}',
  4: '∜{b}',
  5: 'the fifth root of {b}',
};

/** A fraction in lowest terms, improper: −50/3, 4. */
const improper = (top: number, bottom: number) => {
  const g = gcd(top, bottom) || 1;
  const [t, b] = [top / g, bottom / g];
  const s = t * b < 0 ? '−' : '';
  return Math.abs(b) === 1
    ? `${s}${fmt(Math.abs(t))}`
    : `${s}${fmt(Math.abs(t))}/${fmt(Math.abs(b))}`;
};

const RADICALS: ModuleDef[] = [
  page({
    id: 'm.9.radicals',
    assumptions: [
      '√(ab) = √a × √b for a, b ≥ 0.',
      'Each pair of equal prime factors comes out as one.',
      'The radical is simplest when no square factor but 1 is left inside.',
    ],
    variables: [
      int('n', 'n', 'Number under the root', 2, 1000),
      int('k', 'k', 'Number outside', 1, 40, { derived: true }),
      int('r', 'r', 'Number left inside', 1, 1000, { derived: true }),
    ],
    rules: rootRules('n', 2),
    example: { n: 180, k: 6, r: 5 },
    startWith: ['n'],
    equation: '√{n} = {k:coef}√{r}',
    representation: {
      kind: 'factorTree',
      value: 'n',
      root: { index: 2, outside: 'k', inside: 'r' },
    },
  }),
  page({
    id: 'm.9.radicals~cube-root',
    title: 'Simplify a cube root',
    use: 'Use this for “Simplify ∛54.”',
    assumptions: [
      '∛(ab) = ∛a × ∛b, for any numbers.',
      'Each three equal prime factors come out as one.',
      'The cube root is simplest when no cube factor but 1 is left inside.',
    ],
    variables: [
      int('n', 'n', 'Number under the root', 2, 1000),
      int('k', 'k', 'Number outside', 1, 10, { derived: true }),
      int('r', 'r', 'Number left inside', 1, 1000, { derived: true }),
    ],
    rules: rootRules('n', 3),
    example: { n: 54, k: 3, r: 2 },
    startWith: ['n'],
    equation: '∛{n} = {k:coef}∛{r}',
    representation: {
      kind: 'factorTree',
      value: 'n',
      root: { index: 3, outside: 'k', inside: 'r' },
    },
  }),
  page({
    id: 'm.9.radicals~rational-exponent',
    title: 'Rational exponents',
    use: 'Use this for “Evaluate 27^(2/3)” or “16^(3/2)”.',
    assumptions: [
      'b^(1/q) is the qth root of b: 27^(1/3) = ∛27 = 3.',
      'b^(p/q) is that root raised to the power p: take the root first, the numbers stay small.',
      'A negative p means 1 over the power.',
    ],
    variables: [
      num('b', 'b', 'Base', 1, 1000, { step: 1 }),
      int('p', 'p', 'Top of the exponent', -6, 6),
      int('q', 'q', 'Bottom of the exponent', 2, 5, { allowed: [2, 3, 4, 5] }),
      num('w', 'w', 'The qth root of b', 1, 32, { derived: true }),
      num('v', 'v', 'Value', 0, 1e18, { derived: true, fraction: 1000 }),
    ],
    rules: [
      derive(
        'w = b^(1/q)',
        'w',
        ['b', 'q'],
        '{w} = {b}^(1/{q})',
        (v) => fin(v.b! ** (1 / v.q!)),
        // The root the exponent names, written as a root sign.
        (v) => ROOT_OF[v.q!] ?? '{b}^(1/{q})',
        'The bottom of the exponent is the root: find the number that, used q times as a factor, makes b.',
        {},
        { check: (v) => `${fmt(v.w!)} = ${(ROOT_OF[v.q!] ?? '').replace('{b}', fmt(v.b!))}` },
      ),
      derive(
        'v = w^p',
        'v',
        ['w', 'p'],
        '{v} = {w}^{p}',
        (v) => v.w! ** v.p!,
        '{w}^{p}',
        'The top of the exponent is the power: raise the root to it.',
      ),
    ],
    example: { b: 27, p: 2, q: 3, w: 3, v: 9 },
    startWith: ['b', 'p', 'q'],
    equation: '{b}^{{p}/{q}} = {v}',
    pictureLabels: ['w'],
    representation: {
      kind: 'table',
      sweep: 'p',
      output: 'v',
      params: ['b', 'q'],
      rows: [1, 2, 3, 4],
    },
  }),
  page({
    id: 'm.9.radicals~monomials',
    title: 'Divide monomials',
    use: 'Use this for “Simplify 12x⁷ ÷ 3x².”',
    assumptions: [
      'Divide the numbers in front, and subtract the exponents of x: xᵐ ÷ xⁿ = xᵐ⁻ⁿ.',
      'A negative exponent means 1 over the power: x⁻² = 1/x².',
      'The table checks both sides at a few values of x.',
    ],
    variables: [
      int('a', 'a', 'Number in front, top', -50, 50),
      int('m', 'm', 'Exponent on top', -10, 10),
      int('b', 'b', 'Number in front, bottom', -50, 50),
      int('n', 'n', 'Exponent on the bottom', -10, 10),
      num('c', 'c', 'Number in front of the answer', -50, 50, { derived: true, fraction: 50 }),
      int('k', 'k', 'Exponent of the answer', -20, 20, { derived: true }),
      int('x', 'x', 'Value of x to check', 1, 3),
      num('y', 'y', 'Both sides at x', -1e12, 1e12, { derived: true, fraction: 100000 }),
    ],
    rules: [
      nonzero('b', 'The number in front on the bottom'),
      derive(
        'c = a ÷ b',
        'c',
        ['a', 'b'],
        '{c} = {a} ÷ {b}',
        (v) => div(v.a!, v.b!),
        '{a} ÷ {b}',
        'Divide the numbers in front.',
      ),
      derive(
        'k = m − n',
        'k',
        ['m', 'n'],
        '{k} = {m} − {n}',
        (v) => v.m! - v.n!,
        '{m} − {n}',
        'Dividing powers of x subtracts the exponents.',
        {
          note: (v) => {
            if (!known(v, 'a', 'b', 'k')) return '';
            const c = improper(v.a!, v.b!);
            const x = v.k === 0 ? '' : v.k === 1 ? 'x' : superscript(`x^${v.k}`);
            const front = !x
              ? c
              : c === '1'
                ? ''
                : c === '−1'
                  ? '−'
                  : c.includes('/')
                    ? `(${c})`
                    : c;
            return `→ ${front}${x}`;
          },
        },
      ),
      derive(
        'y = c × x^k',
        'y',
        ['c', 'x', 'k'],
        '{y} = {c} × {x}^{k}',
        (v) => v.c! * v.x! ** v.k!,
        '{c} × {x}^{k}',
        'Check: put x into the answer; the first expression gives the same value there.',
      ),
      rule(
        'y = c when k = 0',
        '{y} = {c} when {k} is 0',
        ['y', 'c', 'k'],
        (v) => (v.k === 0 ? v.y! - v.c! : 0),
        {
          y: [
            // (with x known, the rule before gives y the same value)
            (v) => (v.k === 0 ? v.c : v.x === undefined ? undefined : fin(v.c! * v.x ** v.k!)),
            '{c}',
            'The exponents are equal, so x cancels (x⁰ = 1): both sides are c at every x.',
          ],
        },
        {
          // The first expression at the same x: both sides agree.
          check: (v) =>
            v.x === undefined
              ? `${fr(v.y!, 100000)} = ${fr(v.c!, 50)}`
              : superscript(
                  `${fr(v.y!, 100000)} = ${fmt(v.a!)} × ${fmt(v.x!)}^${v.m} ÷ (${fmt(v.b!)} × ${fmt(v.x!)}^${v.n})`,
                ),
        },
      ),
    ],
    example: { a: 12, m: 7, b: 3, n: 2, c: 4, k: 5, x: 2, y: 128 },
    startWith: ['a', 'm', 'b', 'n', 'x'],
    equation: '{a}x^{m} ÷ {b}x^{n} = {c}x^{k}',
    representation: {
      kind: 'table',
      sweep: 'x',
      output: 'y',
      params: ['a', 'm', 'b', 'n'],
      rows: [1, 2, 3],
    },
  }),
  page({
    id: 'm.9.radicals~multiply',
    title: 'Multiply square roots',
    use: 'Use this for “Simplify √6 × √15.”',
    assumptions: [
      '√a × √b = √(ab) for a, b ≥ 0: multiply under one root.',
      'Then take out the largest perfect square factor.',
    ],
    variables: [
      int('a', 'a', 'First number under a root', 1, 100),
      int('b', 'b', 'Second number under a root', 1, 100),
      int('p', 'p', 'Product under one root', 1, 10000, { derived: true }),
      int('k', 'k', 'Number outside', 1, 100, { derived: true }),
      int('r', 'r', 'Number left inside', 1, 10000, { derived: true }),
    ],
    rules: [
      derive(
        'p = a × b',
        'p',
        ['a', 'b'],
        '{p} = {a} × {b}',
        (v) => v.a! * v.b!,
        '{a} × {b}',
        'Multiply the numbers under one root.',
      ),
      ...rootRules('p', 2),
    ],
    example: { a: 6, b: 15, p: 90, k: 3, r: 10 },
    startWith: ['a', 'b'],
    equation: '√{a} × √{b} = √{p} = {k:coef}√{r}',
    representation: {
      kind: 'factorTree',
      value: 'p',
      root: { index: 2, outside: 'k', inside: 'r' },
    },
  }),
];

// ── Sequences ──

/** The first n terms of a₁, then k × (the one before) + c. */
function terms(a1: number, k: number, c: number, n: number): number[] {
  const out = [a1];
  while (out.length < n) out.push(exact(k * out.at(-1)! + c));
  return out;
}
const SUB = '₀₁₂₃₄₅₆₇₈₉';
/** A whole number as subscript digits: 12 → "₁₂". */
const sub = (n: number) => [...String(n)].map((ch) => SUB[Number(ch)]).join('');

const SEQUENCES: ModuleDef[] = [
  page({
    id: 'm.9.sequences',
    assumptions: [
      'Each term adds the same difference d to the one before.',
      'n counts the terms from 1, so the nth term is n − 1 steps past the first.',
      'An arithmetic sequence is a linear function of n, with slope d.',
    ],
    variables: [
      num('a1', 'a₁', 'First term', -100, 100, { step: 0.5 }),
      num('d', 'd', 'Common difference', -50, 50, { step: 0.5 }),
      int('n', 'n', 'Term number', 1, 1000),
      num('an', 'aₙ', 'nth term', -100000, 100000),
      // The chart draws the first 30 terms at most; the nth is marked when it is one of them.
      num('nc', 'n_drawn', 'Terms drawn', 1, 30, pictureOnly),
      num('tl', 'a_drawn', 'Last term drawn', -100000, 100000, pictureOnly),
    ],
    rules: [
      rule(
        'aₙ = a₁ + (n − 1) × d',
        '{an} = {a1} + ({n} − 1) × {d}',
        ['an', 'a1', 'n', 'd'],
        (v) => v.an! - (v.a1! + (v.n! - 1) * v.d!),
        {
          an: [
            (v) => exact(v.a1! + (v.n! - 1) * v.d!),
            '{a1} + ({n} − 1) × {d}',
            'Start at the first term and add n − 1 differences.',
          ],
          a1: [
            (v) => exact(v.an! - (v.n! - 1) * v.d!),
            '{an} − ({n} − 1) × {d}',
            'Take the n − 1 differences back off.',
          ],
          d: [
            (v) => (v.n === 1 ? undefined : exact((v.an! - v.a1!) / (v.n! - 1))),
            '({an} − {a1}) ÷ ({n} − 1)',
            'Share the change from a₁ to aₙ over the n − 1 steps.',
          ],
          n: [
            (v) => {
              if (!v.d) return undefined;
              const n = exact(1 + (v.an! - v.a1!) / v.d);
              return Number.isInteger(n) && n >= 1 ? n : undefined;
            },
            '1 + ({an} − {a1}) ÷ {d}',
            'Count the steps of d from a₁ to aₙ, then add 1 for the first term.',
          ],
        },
        {
          message: (v) =>
            known(v, 'an', 'a1', 'd') && v.d && !Number.isInteger(exact(1 + (v.an! - v.a1!) / v.d!))
              ? 'That value is not a term: no whole number of steps of d reaches it.'
              : undefined,
        },
      ),
      figure(
        derive(
          'terms drawn = n, at most 30',
          'nc',
          ['n'],
          '{nc} = {n}, at most 30',
          (v) => Math.min(v.n!, 30),
          '{n}',
          'The chart draws the first 30 terms at most.',
        ),
      ),
      figure(
        rule(
          'the nth term is drawn when n ≤ 30',
          '{tl} = {an} when {n} ≤ 30',
          ['tl', 'an', 'n'],
          (v) => (v.n! > 30 ? 0 : v.tl! - v.an!),
          { tl: [(v) => (v.n! > 30 ? undefined : v.an), '{an}', 'The nth term, marked.'] },
        ),
      ),
    ],
    example: { a1: 7, d: 4, n: 20, an: 83, nc: 20, tl: 83 },
    startWith: ['n', 'a1', 'd'],
    equation: 'aₙ = {a1} + ({n} − 1){d} = {an}',
    representation: {
      kind: 'termsChart',
      type: 'arithmetic',
      first: 'a1',
      step: 'd',
      count: 'nc',
      as: 'points',
      term: 'tl',
    },
  }),
  page({
    id: 'm.9.sequences~geometric',
    title: 'Geometric sequence: the nth term',
    use: 'Use this for “3, 6, 12, … What is the 8th term?”',
    assumptions: [
      'Each term multiplies the one before by the same ratio r.',
      'The nth term is the first times r, n − 1 times: a₁ × rⁿ⁻¹.',
      'A geometric sequence is an exponential function of n.',
    ],
    variables: [
      num('a1', 'a₁', 'First term', -1000, 1000, { step: 0.5 }),
      num('r', 'r', 'Common ratio', -10, 10, { step: 0.5 }),
      int('n', 'n', 'Term number', 1, 20),
      int('e', 'e', 'Factors of r, n − 1', 0, 19, { derived: true }),
      num('an', 'aₙ', 'nth term', -1e15, 1e15),
    ],
    rules: [
      nonzero('r', 'The ratio'),
      derive(
        'e = n − 1',
        'e',
        ['n'],
        '{e} = {n} − 1',
        (v) => v.n! - 1,
        '{n} − 1',
        'From the first term to the nth there are n − 1 steps, each a factor of r.',
      ),
      rule(
        'aₙ = a₁ × r^(n − 1)',
        '{an} = {a1} × {r}^{e}',
        ['an', 'a1', 'r', 'e'],
        (v) => v.an! - v.a1! * v.r! ** v.e!,
        {
          an: [
            (v) => fin(v.a1! * v.r! ** v.e!),
            '{a1} × {r}^{e}',
            'Start at the first term and multiply by r, e times.',
          ],
          a1: [
            (v) => fin(v.an! / v.r! ** v.e!),
            '{an} ÷ {r}^{e}',
            'Divide out the e factors of r.',
          ],
        },
      ),
    ],
    example: { a1: 3, r: 2, n: 8, e: 7, an: 384 },
    startWith: ['n', 'a1', 'r'],
    equation: 'aₙ = {a1} × {r}^{{n} − 1} = {an}',
    representation: {
      kind: 'termsChart',
      type: 'geometric',
      first: 'a1',
      step: 'r',
      count: 'n',
      term: 'an',
    },
  }),
  page({
    id: 'm.9.sequences~recursive',
    title: 'Recursive rule',
    use: 'Use this for “a₁ = 2 and each term is 3 times the one before, minus 1. Find a₄.”',
    assumptions: [
      'A recursive rule gives the first term and how each term comes from the one before.',
      'Here aₙ = k × aₙ₋₁ + c: multiply the term before by k, then add c.',
      'Work out the terms in order; the table lists the first eight.',
    ],
    variables: [
      num('a1', 'a₁', 'First term', -100, 100, { step: 0.5 }),
      num('k', 'k', 'Multiply by', -5, 5, { step: 0.5 }),
      num('c', 'c', 'Then add', -100, 100, { step: 0.5 }),
      int('n', 'n', 'Term number', 1, 10),
      num('an', 'aₙ', 'nth term', -1e9, 1e9, { derived: true }),
    ],
    rules: [
      derive(
        'aₙ from the rule',
        'an',
        ['a1', 'k', 'c', 'n'],
        '{an} = term {n} of {a1}, each term {k} × the one before + {c}',
        (v) => terms(v.a1!, v.k!, v.c!, v.n!).at(-1),
        // The rule in words and letters: the numbers go into the work lines, one term at a time.
        (v) => (v.n === 1 ? '{a1}' : 'k × aₙ₋₁ + c'),
        'Start at a₁ and use the rule again and again: each term is k times the one before, plus c.',
        {
          work: (v) => {
            const t = terms(v.a1!, v.k!, v.c!, v.n!);
            return t
              .slice(1)
              .map((_, i) => `a${sub(i + 2)} = ${sideLines(v.k!, t[i]!, v.c!).line}`);
          },
          note: (v) => (v.n === undefined ? '' : `→ a${sub(v.n)} = ${fmt(v.an!)}`),
          written: false,
        },
        {
          check: (v) => {
            const t = terms(v.a1!, v.k!, v.c!, v.n!);
            return t.length < 2
              ? `${fmt(v.an!)} = ${fmt(v.a1!)}`
              : `${fmt(v.an!)} = ${fmt(v.k!)} × ${sg(t.at(-2)!)} + ${sg(v.c!)}`;
          },
        },
      ),
    ],
    example: { a1: 2, k: 3, c: -1, n: 4, an: 41 },
    startWith: ['a1', 'k', 'c', 'n'],
    representation: {
      kind: 'table',
      sweep: 'n',
      output: 'an',
      params: ['a1', 'k', 'c'],
      rows: [1, 2, 3, 4, 5, 6, 7, 8],
    },
  }),
];

// ── Regression ──

/** Practice hours and points scored in a game (made up for the lesson). */
const PRACTICE_POINTS: [number, number][] = [
  [1, 52],
  [2, 58],
  [3, 61],
  [4, 68],
  [5, 70],
  [6, 77],
  [7, 80],
  [8, 86],
];
/** Outside temperature (°F) and hot drinks sold (made up for the lesson). */
const TEMPERATURE_DRINKS: [number, number][] = [
  [40, 60],
  [45, 52],
  [50, 57],
  [55, 46],
  [60, 50],
  [65, 41],
  [70, 45],
  [75, 36],
];

/** ŷ = mx + b, solved for the prediction and for x. */
const prediction = (m: string | number, b: string | number, note?: (v: Values) => string) => {
  const M = (v: Values) => (typeof m === 'number' ? m : v[m]!);
  const B = (v: Values) => (typeof b === 'number' ? b : v[b]!);
  const ms = typeof m === 'number' ? fmt(m) : `{${m}}`;
  const bs = typeof b === 'number' ? fmt(b) : `{${b}}`;
  const vars = ['y', 'x', ...[m, b].filter((z): z is string => typeof z === 'string')];
  return rule('ŷ = mx + b', `{y} = ${ms} × {x} + ${bs}`, vars, (v) => v.y! - (M(v) * v.x! + B(v)), {
    y: [
      (v) => exact(M(v) * v.x! + B(v)),
      `${ms} × {x} + ${bs}`,
      'Put x into the line: slope times x, plus the intercept.',
      note ? { note } : {},
    ],
    x: [
      (v) => (M(v) ? exact((v.y! - B(v)) / M(v)) : undefined),
      `({y} − ${bs}) ÷ ${ms}`,
      'Take the intercept from the prediction, then divide by the slope.',
    ],
  });
};

const REGRESSION: ModuleDef[] = [
  page({
    id: 'm.9.regression',
    assumptions: [
      'Residual = actual − predicted; a point above the line has a positive residual.',
      'A good line leaves residuals scattered about 0 with no pattern.',
      'Predict only inside the data’s x values.',
    ],
    variables: [
      num('m', 'm', 'Slope', -20, 20, { step: 0.1 }),
      num('b', 'b', 'y-intercept', 0, 100, { step: 0.1 }),
      num('x', 'x', 'Practice hours', 1, 8, { step: 0.5 }),
      num('y', 'ŷ', 'Predicted points', -200, 300),
      num('e', 'e', 'Residual of point 3, (3, 61)', -300, 300, { derived: true }),
    ],
    rules: [
      prediction('m', 'b'),
      derive(
        'e = 61 − (3m + b)',
        'e',
        ['m', 'b'],
        '{e} = 61 − ({m} × 3 + {b})',
        (v) => 61 - (v.m! * 3 + v.b!),
        '61 − ({m} × 3 + {b})',
        'Point 3 is (3, 61): its actual points minus the line’s prediction at x = 3.',
      ),
    ],
    example: { m: 5, b: 47, x: 4.5, y: 69.5, e: -1 },
    startWith: ['x', 'm', 'b'],
    representation: {
      kind: 'scatter',
      x: { label: 'Practice hours', min: 0, max: 9 },
      y: { label: 'Points scored', min: 40, max: 100 },
      points: PRACTICE_POINTS,
      slope: 'm',
      intercept: 'b',
      at: { x: 'x', y: 'y' },
      residuals: 'plot',
      residualOf: { point: 2, residual: 'e' },
    },
  }),
  page({
    id: 'm.9.regression~correlation-r',
    title: 'The least-squares line and r',
    use: 'Use this for “Predict the drinks sold at 62 °F from the line of best fit, and describe r.”',
    assumptions: [
      'A calculator gives the least-squares line: here ŷ ≈ −0.59x + 82.19.',
      'r ≈ −0.90: the negative sign says the points fall; near −1 says they are close to a line.',
      'Correlation is not causation: warm days bring other changes too.',
    ],
    variables: [
      num('x', 'x', 'Temperature', 30, 85, { unit: '°F', units: ['°F'], step: 0.5 }),
      num('y', 'ŷ', 'Predicted drinks sold', -100, 200),
    ],
    rules: [
      prediction(-0.59, 82.19, (v) =>
        v.y === undefined ? '' : `→ about ${fmt(Math.round(v.y))} drinks`,
      ),
    ],
    example: { x: 62, y: 45.61 },
    startWith: ['x'],
    unitSystems: ['us'],
    representation: {
      kind: 'scatter',
      x: { label: 'Temperature (°F)', min: 35, max: 80 },
      y: { label: 'Hot drinks sold', min: 30, max: 65 },
      points: TEMPERATURE_DRINKS,
      slope: -0.59,
      intercept: 82.19,
      at: { x: 'x', y: 'y' },
      r: true,
      residuals: 'segments',
      leastSquares: 'fit',
    },
  }),
];

// ── One-variable statistics ──

const BINS = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'];
const MIDS = [5, 15, 25, 35, 45, 55];
/** The five-number summary's ids and names. */
const FIVE = ['lo', 'q1', 'md', 'q3', 'hi'];
const FIVE_NAMES = ['Least', 'First quartile', 'Median', 'Third quartile', 'Greatest'];
const FIVE_SYMBOLS = ['min', 'Q₁', 'M', 'Q₃', 'max'];
/** The five numbers in order, as checks. */
const ordered = (ids: string[]): Rule[] =>
  ids
    .slice(1)
    .map((big, i) =>
      constraint(
        `${big} ≥ ${ids[i]}`,
        `{${big}} is at least {${ids[i]}}`,
        [big, ids[i]!],
        (v) => !(v[big]! >= v[ids[i]!]!),
      ),
    );
/** IQR = Q₃ − Q₁. */
const iqr = (I: string, q3: string, q1: string, how = 'The width of the box: the middle half.') =>
  derive(
    `${I} = ${q3} − ${q1}`,
    I,
    [q3, q1],
    `{${I}} = {${q3}} − {${q1}}`,
    (v) => v[q3]! - v[q1]!,
    `{${q3}} − {${q1}}`,
    how,
  );

const DATA_IDS = ['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8'];
/** The first n of a list's ids (n its count value), and their values. */
const firstIds = (ids: string[], v: Values) => ids.slice(0, v.n);
const firstValues = (ids: string[], v: Values) => firstIds(ids, v).map((id) => v[id]!);
const sumList = (xs: number[]) => exact(xs.reduce((t, x) => t + x, 0));
/** The middle of a list in order, or halfway between the middle two. */
const medianOf = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2]! : exact((s[n / 2 - 1]! + s[n / 2]!) / 2);
};
/** The lower (or upper) half of a list in order, the median left out when the count is odd. */
const halfOf = (xs: number[], upper: boolean) => {
  const s = [...xs].sort((a, b) => a - b);
  const h = Math.floor(s.length / 2);
  return upper ? s.slice(s.length - h) : s.slice(0, h);
};
/** A value of a counted list: its name, 0 to `max`, counted while n is at least its place. */
const listValue = (id: string, i: number, name: string, max: number): VariableDef =>
  num(id, `x${sub(i + 1)}`, name, 0, max, {
    step: 1,
    countedBy: { count: 'n', index: i + 1 },
    group: 'data',
  });

/** Up to 12 values for a box plot drawn from the data. */
const LIST_IDS = Array.from({ length: 12 }, (_, i) => `d${i + 1}`);
/** One of the five numbers read from the first n values: least, median, a quartile, greatest. */
const listRule = (
  id: string,
  word: string,
  fn: (xs: number[]) => number,
  how: string,
  inOrder = false,
) =>
  rule(
    `${id} = ${word}`,
    `{${id}} = ${word} of the {n} values`,
    [id, 'n', ...LIST_IDS],
    (v) => v[id]! - fn(firstValues(LIST_IDS, v)),
    {
      [id]: [
        (v) => exact(fn(firstValues(LIST_IDS, v))),
        (v) =>
          `${word} of ${firstIds(LIST_IDS, v)
            .map((x) => `{${x}}`)
            .join(', ')}`,
        how,
        {
          work: (v) => {
            const s = [...firstValues(LIST_IDS, v)].sort((a, b) => a - b);
            if (inOrder) return [`In order: ${s.map(fmt).join(', ')}`];
            if (word === 'first quartile' || word === 'third quartile') {
              const half = halfOf(s, word === 'third quartile');
              return [
                `${word === 'first quartile' ? 'Lower' : 'Upper'} half: ${half.map(fmt).join(', ')}`,
              ];
            }
            return [];
          },
          written: false,
        },
      ],
    },
    {
      check: (v) => `${fmt(v[id]!)} = ${word} of ${firstValues(LIST_IDS, v).map(fmt).join(', ')}`,
    },
  );

const DATA_DISPLAYS: ModuleDef[] = [
  page({
    id: 'm.9.data-displays',
    assumptions: [
      'A histogram groups values into equal bins; each bin takes its left end and leaves out its right.',
      'From the counts alone the mean is an estimate: each value counts as its bin’s midpoint.',
      'A long right tail pulls the mean above the median.',
    ],
    variables: [
      ...BINS.map((id, i) =>
        int(id, `f${sub(i + 1)}`, `Count, ${i * 10} to ${i * 10 + 10} minutes`, 0, 50),
      ),
      int('n', 'n', 'Number of students', 0, 300, { derived: true }),
      num('mean', 'x̄', 'Estimated mean', 0, 60, { unit: 'min', units: ['min'], derived: true }),
    ],
    rules: [
      derive(
        'n = f₁ + … + f₆',
        'n',
        BINS,
        `{n} = ${BINS.map((b) => `{${b}}`).join(' + ')}`,
        (v) => BINS.reduce((t, b) => t + v[b]!, 0),
        BINS.map((b) => `{${b}}`).join(' + '),
        'Add the counts of all the bins.',
      ),
      derive(
        'x̄ ≈ Σ(midpoint × f) ÷ n',
        'mean',
        [...BINS, 'n'],
        `{mean} = (${BINS.map((b, i) => `${MIDS[i]} × {${b}}`).join(' + ')}) ÷ {n}`,
        (v) =>
          div(
            BINS.reduce((t, b, i) => t + MIDS[i]! * v[b]!, 0),
            v.n!,
          ),
        `(${BINS.map((b, i) => `${MIDS[i]} × {${b}}`).join(' + ')}) ÷ {n}`,
        'Count each value as its bin’s midpoint, add them all, then divide by how many there are.',
      ),
    ],
    example: { f1: 2, f2: 5, f3: 8, f4: 6, f5: 3, f6: 1, n: 25, mean: 27.4 },
    startWith: BINS,
    unitSystems: ['metric'],
    representation: {
      kind: 'histogram',
      counts: BINS,
      start: 0,
      width: 10,
      mean: 'mean',
      shape: true,
      axis: 'Minutes of reading',
    },
  }),
  page({
    id: 'm.9.data-displays~outliers',
    title: 'Outliers and the 1.5 × IQR fences',
    use: 'Use this for “The five-number summary is 12, 20, 24, 28, 45. Is 45 an outlier?”',
    assumptions: [
      'The fences sit 1.5 × IQR below Q₁ and 1.5 × IQR above Q₃.',
      'A value past a fence is an outlier.',
      'An outlier moves the mean and the range a lot, the median and the IQR hardly at all.',
    ],
    variables: [
      ...FIVE.map((id, i) => num(id, FIVE_SYMBOLS[i]!, FIVE_NAMES[i]!, 0, 1000, { step: 0.5 })),
      num('I', 'IQR', 'Interquartile range', 0, 1000, { derived: true }),
      num('L', 'L', 'Lower fence', -1500, 1000, { derived: true }),
      num('U', 'U', 'Upper fence', 0, 2500, { derived: true }),
    ],
    rules: [
      ...ordered(FIVE),
      iqr('I', 'q3', 'q1'),
      derive(
        'L = Q₁ − 1.5 × IQR',
        'L',
        ['q1', 'I'],
        '{L} = {q1} − 1.5 × {I}',
        (v) => v.q1! - 1.5 * v.I!,
        '{q1} − 1.5 × {I}',
        'Go 1.5 box-widths below the first quartile.',
      ),
      derive(
        'U = Q₃ + 1.5 × IQR',
        'U',
        ['q3', 'I'],
        '{U} = {q3} + 1.5 × {I}',
        (v) => v.q3! + 1.5 * v.I!,
        '{q3} + 1.5 × {I}',
        'Go 1.5 box-widths above the third quartile.',
        {
          note: (v) => {
            if (!known(v, 'lo', 'hi', 'L', 'U')) return '';
            const out = [
              ...(v.lo! < v.L! ? [fmt(v.lo!)] : []),
              ...(v.hi! > v.U! ? [fmt(v.hi!)] : []),
            ];
            return out.length ? `→ outlier: ${out.join(' and ')}` : '→ no outliers';
          },
        },
      ),
    ],
    example: { lo: 12, q1: 20, md: 24, q3: 28, hi: 45, I: 8, L: 8, U: 40 },
    startWith: FIVE,
    representation: {
      kind: 'boxPlot',
      min: 'lo',
      q1: 'q1',
      median: 'md',
      q3: 'q3',
      max: 'hi',
      range: [0, 50],
      fences: { lower: 'L', upper: 'U' },
    },
  }),
  page({
    id: 'm.9.data-displays~five-number-summary',
    title: 'Box plot from a data list',
    use: 'Use this for “Points in nine games: 12, 18, 9, 22, 15, 30, 14, 17, 20. Make a box plot.”',
    assumptions: [
      'Put the values in order first; the median splits them into a lower and an upper half.',
      'Q₁ and Q₃ are the medians of the two halves, the median itself left out when n is odd.',
      'The box runs from Q₁ to Q₃: the middle half of the data.',
    ],
    variables: [
      int('n', 'n', 'Number of values', 5, 12),
      ...LIST_IDS.map((id, i) => listValue(id, i, `Value ${i + 1}`, 50)),
      num('lo', 'min', 'Least', 0, 50, { derived: true }),
      num('q1', 'Q₁', 'First quartile', 0, 50, { derived: true }),
      num('md', 'M', 'Median', 0, 50, { derived: true }),
      num('q3', 'Q₃', 'Third quartile', 0, 50, { derived: true }),
      num('hi', 'max', 'Greatest', 0, 50, { derived: true }),
      num('I', 'IQR', 'Interquartile range', 0, 50, { derived: true }),
    ],
    rules: [
      listRule('lo', 'least', (xs) => Math.min(...xs), 'The smallest value, first in order.', true),
      listRule(
        'md',
        'median',
        medianOf,
        'The middle value in order (halfway between the middle two).',
      ),
      listRule(
        'q1',
        'first quartile',
        (xs) => medianOf(halfOf(xs, false)),
        'The median of the lower half.',
      ),
      listRule(
        'q3',
        'third quartile',
        (xs) => medianOf(halfOf(xs, true)),
        'The median of the upper half.',
      ),
      listRule('hi', 'greatest', (xs) => Math.max(...xs), 'The largest value, last in order.'),
      iqr('I', 'q3', 'q1'),
    ],
    example: {
      n: 9,
      d1: 12,
      d2: 18,
      d3: 9,
      d4: 22,
      d5: 15,
      d6: 30,
      d7: 14,
      d8: 17,
      d9: 20,
      lo: 9,
      q1: 13,
      md: 17,
      q3: 21,
      hi: 30,
      I: 8,
    },
    startWith: ['n', ...LIST_IDS.slice(0, 9)],
    representation: {
      kind: 'boxPlot',
      min: 'lo',
      q1: 'q1',
      median: 'md',
      q3: 'q3',
      max: 'hi',
      range: [0, 50],
      data: LIST_IDS,
      count: 'n',
      brackets: { iqr: 'I' },
    },
  }),
  page({
    id: 'm.9.data-displays~standard-deviation',
    title: 'Standard deviation',
    use: 'Use this for “Find the mean and the standard deviation of 1, 3, 3, 5, 5, 7, 7, 9.”',
    assumptions: [
      'The standard deviation is the typical distance of the values from the mean.',
      'σ = √(sum of squared deviations ÷ n): square each distance, add, divide by n, take the root.',
      'Most values lie within one standard deviation of the mean.',
      'From 3 to 8 values: n says how many.',
    ],
    variables: [
      int('n', 'n', 'Number of values', 3, 8),
      ...DATA_IDS.map((id, i) => listValue(id, i, `Value ${i + 1}`, 100)),
      num('m', 'x̄', 'Mean', 0, 100, { derived: true }),
      num('S', 'S', 'Sum of squared deviations', 0, 100000, { derived: true }),
      num('sd', 'σ', 'Standard deviation', 0, 100, { derived: true }),
    ],
    rules: [
      rule(
        'x̄ = sum ÷ n',
        '{m} = sum of the {n} values ÷ {n}',
        ['m', 'n', ...DATA_IDS],
        (v) => v.m! * v.n! - sumList(firstValues(DATA_IDS, v)),
        {
          m: [
            (v) => div(sumList(firstValues(DATA_IDS, v)), v.n!),
            (v) =>
              `(${firstIds(DATA_IDS, v)
                .map((x) => `{${x}}`)
                .join(' + ')}) ÷ {n}`,
            'Add the values, then divide by how many there are.',
            {
              work: (v) => {
                const xs = firstValues(DATA_IDS, v);
                const t = sumList(xs);
                return [
                  `${xs.map(fmt).join(' + ')} = ${fmt(t)}`,
                  `${fmt(t)} ÷ ${v.n} = ${fmt(v.m!)}`,
                ];
              },
              written: false,
            },
          ],
        },
        {
          check: (v) =>
            `(${firstValues(DATA_IDS, v).map(fmt).join(' + ')}) ÷ ${v.n} = ${fmt(v.m!)}`,
        },
      ),
      rule(
        'S = Σ(x − x̄)²',
        '{S} = sum of the squared distances of the {n} values from {m}',
        ['S', 'm', 'n', ...DATA_IDS],
        (v) => v.S! - sumList(firstValues(DATA_IDS, v).map((x) => (x - v.m!) ** 2)),
        {
          S: [
            (v) => sumList(firstValues(DATA_IDS, v).map((x) => (x - v.m!) ** 2)),
            (v) =>
              firstIds(DATA_IDS, v)
                .map((x) => `({${x}} − {m})²`)
                .join(' + '),
            'Each value’s distance from the mean, squared, all added.',
            {
              work: (v) => {
                const sq = firstValues(DATA_IDS, v).map((x) => exact((x - v.m!) ** 2));
                return [
                  `Squared distances: ${sq.map(fmt).join(', ')}`,
                  `${sq.map(fmt).join(' + ')} = ${fmt(sumList(sq))}`,
                ];
              },
              written: false,
            },
          ],
        },
        {
          check: (v) =>
            `${firstValues(DATA_IDS, v)
              .map((x) => `(${fmt(x)} − ${fmt(v.m!)})²`)
              .join(' + ')} = ${fmt(v.S!)}`,
        },
      ),
      derive(
        'σ = √(S ÷ n)',
        'sd',
        ['S', 'n'],
        '{sd} = √({S} ÷ {n})',
        (v) => div(Math.sqrt(v.S!), Math.sqrt(v.n!)),
        '√({S} ÷ {n})',
        'Divide by n, then take the square root.',
      ),
    ],
    example: {
      n: 8,
      x1: 1,
      x2: 3,
      x3: 3,
      x4: 5,
      x5: 5,
      x6: 7,
      x7: 7,
      x8: 9,
      m: 5,
      S: 48,
      sd: Math.sqrt(6),
    },
    startWith: ['n', ...DATA_IDS],
    representation: {
      kind: 'dotPlot',
      data: DATA_IDS,
      count: 'n',
      min: 0,
      max: 10,
      mean: 'm',
      sd: { id: 'sd', kind: 'population' },
    },
  }),
  page({
    id: 'm.9.data-displays~compare',
    title: 'Compare two box plots',
    use: 'Use this for “Compare the reading minutes of two classes by their medians and IQRs.”',
    assumptions: [
      'Put both box plots on one number line so their boxes line up.',
      'Compare the centers with the medians and the spreads with the IQRs.',
      'The medians and IQRs are hardly moved by an outlier, so they suit skewed data.',
    ],
    variables: [
      ...FIVE.map((id, i) =>
        num(`${id}A`, `${FIVE_SYMBOLS[i]}_A`, `Class A ${FIVE_NAMES[i]!.toLowerCase()}`, 0, 100, {
          step: 0.5,
        }),
      ),
      ...FIVE.map((id, i) =>
        num(`${id}B`, `${FIVE_SYMBOLS[i]}_B`, `Class B ${FIVE_NAMES[i]!.toLowerCase()}`, 0, 100, {
          step: 0.5,
        }),
      ),
      num('IA', 'IQR_A', 'Class A interquartile range', 0, 100, { derived: true }),
      num('IB', 'IQR_B', 'Class B interquartile range', 0, 100, { derived: true }),
      num('D', 'D', 'Difference of the medians (B − A)', -100, 100, { derived: true }),
    ],
    rules: [
      ...ordered(FIVE.map((id) => `${id}A`)),
      ...ordered(FIVE.map((id) => `${id}B`)),
      iqr('IA', 'q3A', 'q1A', 'Class A’s box width: the spread of its middle half.'),
      iqr('IB', 'q3B', 'q1B', 'Class B’s box width.'),
      derive(
        'D = M_B − M_A',
        'D',
        ['mdB', 'mdA'],
        '{D} = {mdB} − {mdA}',
        (v) => v.mdB! - v.mdA!,
        '{mdB} − {mdA}',
        'How far B’s median is above A’s: the difference in centers.',
      ),
    ],
    example: {
      loA: 10,
      q1A: 18,
      mdA: 25,
      q3A: 32,
      hiA: 50,
      loB: 15,
      q1B: 22,
      mdB: 28,
      q3B: 40,
      hiB: 55,
      IA: 14,
      IB: 18,
      D: 3,
    },
    startWith: [...FIVE.map((id) => `${id}A`), ...FIVE.map((id) => `${id}B`)],
    representation: {
      kind: 'boxPlot',
      min: 'loA',
      q1: 'q1A',
      median: 'mdA',
      q3: 'q3A',
      max: 'hiA',
      range: [0, 60],
      second: { min: 'loB', q1: 'q1B', median: 'mdB', q3: 'q3B', max: 'hiB' },
      labels: ['Class A', 'Class B'],
    },
  }),
];

// ── Two-way tables ──

const cell = (id: string, name: string) => int(id, id, name, 0, 500);
const CELLS = [
  cell('a', 'Grade 9, plays an instrument'),
  cell('b', 'Grade 9, does not'),
  cell('c', 'Grade 10, plays an instrument'),
  cell('d', 'Grade 10, does not'),
];
const grandTotal = derive(
  'n = a + b + c + d',
  'n',
  ['a', 'b', 'c', 'd'],
  '{n} = {a} + {b} + {c} + {d}',
  (v) => v.a! + v.b! + v.c! + v.d!,
  '{a} + {b} + {c} + {d}',
  'The grand total: add all four cells.',
);
/** f = part ÷ whole, a relative frequency. */
const share = (f: string, part: string, whole: string, how: string, more: Partial<StepText> = {}) =>
  derive(
    `${f} = ${part} ÷ ${whole}`,
    f,
    [part, whole],
    `{${f}} = {${part}} ÷ {${whole}}`,
    (v) => div(v[part]!, v[whole]!),
    `{${part}} ÷ {${whole}}`,
    how,
    more,
  );
/** "→ 45%" after a share. */
const percentNote = (id: string): Partial<StepText> => ({
  note: (v) => (v[id] === undefined ? '' : `→ ${fmt(exact(v[id] * 100))}%`),
});
/** A total of two cells. */
const sum2cells = (t: string, x: string, y: string, how: string) =>
  derive(
    `${t} = ${x} + ${y}`,
    t,
    [x, y],
    `{${t}} = {${x}} + {${y}}`,
    (v) => v[x]! + v[y]!,
    `{${x}} + {${y}}`,
    how,
  );
const TABLE = {
  rows: ['Grade 9', 'Grade 10'],
  cols: ['Plays an instrument', 'Does not'],
  cells: [
    ['a', 'b'],
    ['c', 'd'],
  ],
};
const freq = (id: string, symbol: string, name: string) =>
  num(id, symbol, name, 0, 1, { derived: true });
const total = (id: string, name: string, symbol = id) =>
  int(id, symbol, name, 0, 2000, { derived: true });

const TWO_WAY_TABLES: ModuleDef[] = [
  page({
    id: 'm.9.two-way-tables',
    assumptions: [
      'A relative frequency is a count divided by a total.',
      'A joint relative frequency divides one cell by the grand total.',
      'The row and column totals are the margins of the table.',
    ],
    variables: [...CELLS, total('n', 'Grand total'), freq('p', 'p', 'Joint relative frequency')],
    rules: [grandTotal, share('p', 'a', 'n', 'One cell out of everyone: Grade 9 and plays.')],
    example: { a: 18, b: 22, c: 12, d: 28, n: 80, p: 0.225 },
    startWith: ['a', 'b', 'c', 'd'],
    representation: {
      kind: 'table',
      twoWay: { ...TABLE, lit: { row: 0, col: 0 }, of: 'total', frequency: 'p' },
    },
  }),
  page({
    id: 'm.9.two-way-tables~marginal',
    title: 'Marginal relative frequency',
    use: 'Use this for “What fraction of all the students play an instrument?”',
    assumptions: [
      'A marginal relative frequency uses a total at the edge of the table.',
      'Divide a column (or row) total by the grand total.',
    ],
    variables: [
      ...CELLS,
      total('C', 'Plays an instrument, total'),
      total('n', 'Grand total'),
      freq('p', 'p', 'Marginal relative frequency'),
    ],
    rules: [
      sum2cells('C', 'a', 'c', 'The column total: everyone who plays.'),
      grandTotal,
      share('p', 'C', 'n', 'The column total out of everyone.'),
    ],
    example: { a: 18, b: 22, c: 12, d: 28, C: 30, n: 80, p: 0.375 },
    startWith: ['a', 'b', 'c', 'd'],
    representation: {
      kind: 'table',
      twoWay: { ...TABLE, lit: { col: 0 }, of: 'total', frequency: 'p' },
    },
  }),
  page({
    id: 'm.9.two-way-tables~conditional',
    title: 'Conditional relative frequency',
    use: 'Use this for “Of the Grade 9 students, what fraction play? Is grade linked to playing?”',
    assumptions: [
      'A conditional relative frequency divides a cell by its own row total.',
      'Compare the rows: if their fractions differ, the two variables are associated.',
      'If every row has the same fraction, there is no association.',
    ],
    variables: [
      ...CELLS,
      total('R1', 'Grade 9 total', 'R₁'),
      total('R2', 'Grade 10 total', 'R₂'),
      freq('p1', 'p₁', 'Share of Grade 9 who play'),
      freq('p2', 'p₂', 'Share of Grade 10 who play'),
      num('g', 'g', 'Gap between the rows', -1, 1, { derived: true }),
    ],
    rules: [
      sum2cells('R1', 'a', 'b', 'The row total for Grade 9.'),
      sum2cells('R2', 'c', 'd', 'The row total for Grade 10.'),
      share('p1', 'a', 'R1', 'Of the Grade 9 students, the fraction who play.', percentNote('p1')),
      share('p2', 'c', 'R2', 'Of the Grade 10 students, the fraction who play.', percentNote('p2')),
      derive(
        'g = p₁ − p₂',
        'g',
        ['p1', 'p2'],
        '{g} = {p1} − {p2}',
        (v) => v.p1! - v.p2!,
        '{p1} − {p2}',
        'Compare the rows: a gap between them means grade and playing are associated.',
      ),
    ],
    example: { a: 18, b: 22, c: 12, d: 28, R1: 40, R2: 40, p1: 0.45, p2: 0.3, g: 0.15 },
    startWith: ['a', 'b', 'c', 'd'],
    pictureLabels: ['p2', 'g'],
    representation: {
      kind: 'table',
      twoWay: { ...TABLE, lit: { row: 0, col: 0 }, of: 'row', frequency: 'p1', bar: 'rows' },
    },
  }),
];

// ── Piecewise, step and absolute value functions ──

/** The four steps drawn: the last one holds the hours charged (hours 1–4 up to 4 hours). */
const STEP_HOURS = [1, 2, 3, 4];

const PIECEWISE_FUNCTIONS: ModuleDef[] = [
  page({
    id: 'm.9.piecewise-functions',
    assumptions: [
      'Use the piece whose condition x meets.',
      'At the break, the closed dot is the value; the open dot is only where the other piece heads.',
      'The pieces need not meet.',
    ],
    variables: [
      num('p', 'p', 'Break', -10, 10, { step: 0.5 }),
      num('m1', 'm₁', 'Left piece’s slope', -10, 10, { step: 0.5 }),
      num('b1', 'b₁', 'Left piece’s y-intercept', -20, 20, { step: 0.5 }),
      num('m2', 'm₂', 'Right piece’s slope', -10, 10, { step: 0.5 }),
      num('b2', 'b₂', 'Right piece’s y-intercept', -20, 20, { step: 0.5 }),
      num('x', 'x', 'Input', -20, 20, { step: 0.5 }),
      num('y', 'y', 'Output f(x)', -500, 500),
      num('L', 'L', 'Left piece’s end at the break', -500, 500, { derived: true }),
      num('R', 'y_p', 'Value at the break, f(p)', -500, 500, { derived: true }),
    ],
    rules: [
      rule(
        'f(x) = m₁x + b₁ (x < p), m₂x + b₂ (x ≥ p)',
        '{y} = {m1} × {x} + {b1} if {x} < {p}, {m2} × {x} + {b2} if {x} ≥ {p}',
        ['y', 'x', 'p', 'm1', 'b1', 'm2', 'b2'],
        (v) => v.y! - (v.x! < v.p! ? v.m1! * v.x! + v.b1! : v.m2! * v.x! + v.b2!),
        {
          y: [
            (v) => exact(v.x! < v.p! ? v.m1! * v.x! + v.b1! : v.m2! * v.x! + v.b2!),
            (v) => (v.x! < v.p! ? '{m1} × {x} + {b1}' : '{m2} × {x} + {b2}'),
            (v) =>
              v.x! < v.p!
                ? 'x is left of the break (x < p): use the left piece.'
                : 'x is at the break or right of it (x ≥ p): use the right piece.',
          ],
        },
        {
          check: (v) =>
            v.x! < v.p!
              ? `${fmt(v.y!)} = ${fmt(v.m1!)} × ${sg(v.x!)} + ${sg(v.b1!)}`
              : `${fmt(v.y!)} = ${fmt(v.m2!)} × ${sg(v.x!)} + ${sg(v.b2!)}`,
        },
      ),
      derive(
        'L = m₁p + b₁',
        'L',
        ['m1', 'p', 'b1'],
        '{L} = {m1} × {p} + {b1}',
        (v) => v.m1! * v.p! + v.b1!,
        '{m1} × {p} + {b1}',
        'The left piece heads here at the break, but x < p leaves it out: an open dot.',
      ),
      derive(
        'y_p = m₂p + b₂',
        'R',
        ['m2', 'p', 'b2'],
        '{R} = {m2} × {p} + {b2}',
        (v) => v.m2! * v.p! + v.b2!,
        '{m2} × {p} + {b2}',
        'x ≥ p takes the break into the right piece: the closed dot is f(p).',
      ),
    ],
    example: { p: 1, m1: 1, b1: 2, m2: -2, b2: 7, x: 3, y: 1, L: 3, R: 5 },
    startWith: ['x', 'p', 'm1', 'b1', 'm2', 'b2'],
    pictureLabels: ['L', 'R'],
    representation: {
      kind: 'functionGraph',
      family: 'piecewise',
      pieces: [
        { f: { family: 'linear', m: 'm1', b: 'b1' }, to: 'p', ends: '()' },
        { f: { family: 'linear', m: 'm2', b: 'b2' }, from: 'p', ends: '[)' },
      ],
      at: { x: 'x', y: 'y' },
      fixed: true,
    },
  }),
  page({
    id: 'm.9.piecewise-functions~context',
    title: 'A phone plan with extra data',
    use: 'Use this for “$30 a month covers 5 GB; each GB past that costs $8. What does 8 GB cost?”',
    assumptions: [
      'Up to the included amount the cost is the plan fee: a flat piece.',
      'Past it, each unit more adds the extra rate: C = F + r(u − L).',
      'To find the use from a cost above the fee, undo the second piece.',
    ],
    variables: [
      num('F', 'F', 'Plan fee', 0, 1000, { unit: '$', step: 0.01 }),
      num('L', 'L', 'Included data (GB)', 0, 100, { step: 0.5 }),
      num('r', 'r', 'Extra rate per GB', 0.01, 100, { unit: '$', step: 0.01 }),
      num('u', 'u', 'Data used (GB)', 0, 200, { step: 0.5 }),
      num('C', 'C', 'Cost', 0, 100000, { unit: '$' }),
      num('B', 'B', 'Where the rising piece meets the y-axis', -100000, 1000, {
        unit: '$',
        ...pictureOnly,
      }),
    ],
    rules: [
      rule(
        'C = F + r × (u − L) past L',
        '{C} = {F} if {u} ≤ {L}, {F} + {r} × ({u} − {L}) if {u} > {L}',
        ['C', 'F', 'r', 'u', 'L'],
        (v) => v.C! - (v.F! + v.r! * Math.max(0, v.u! - v.L!)),
        {
          C: [
            (v) => exact(v.F! + v.r! * Math.max(0, v.u! - v.L!)),
            (v) => (v.u! > v.L! ? '{F} + {r} × ({u} − {L})' : '{F}'),
            (v) =>
              v.u! > v.L!
                ? 'Past the included data: the fee plus the rate for each GB over.'
                : 'Within the included data: just the plan fee.',
          ],
          u: [
            (v) => (v.C! > v.F! && v.r ? exact(v.L! + (v.C! - v.F!) / v.r!) : undefined),
            '{L} + ({C} − {F}) ÷ {r}',
            'The cost is above the fee, so it is on the rising piece: take the fee away, divide by the rate, add L.',
          ],
        },
        {
          check: (v) =>
            v.u! > v.L!
              ? `${fmt(v.C!)} = ${fmt(v.F!)} + ${fmt(v.r!)} × (${fmt(v.u!)} − ${fmt(v.L!)})`
              : `${fmt(v.C!)} = ${fmt(v.F!)}`,
          message: (v) =>
            known(v, 'C', 'F') && v.C! < v.F!
              ? 'The cost can’t be less than the plan fee.'
              : undefined,
        },
      ),
      figure(
        derive(
          'B = F − rL',
          'B',
          ['F', 'r', 'L'],
          '{B} = {F} − {r} × {L}',
          (v) => v.F! - v.r! * v.L!,
          '{F} − {r} × {L}',
          'For the graph: the rising piece written as y = rx + B.',
        ),
      ),
    ],
    example: { F: 30, L: 5, r: 8, u: 8, C: 54, B: -10 },
    startWith: ['u', 'F', 'L', 'r'],
    representation: {
      kind: 'functionGraph',
      family: 'piecewise',
      name: 'C',
      pieces: [
        { f: { family: 'linear', m: 0, b: 'F' }, from: 0, to: 'L', ends: '[]' },
        { f: { family: 'linear', m: 'r', b: 'B' }, from: 'L', ends: '()' },
      ],
      at: { x: 'u', y: 'C' },
      xMin: 0,
      axes: { x: 'Data used u (GB)', y: 'Cost C ($)' },
      fixed: true,
    },
  }),
  page({
    id: 'm.9.piecewise-functions~step',
    title: 'A step function: pay by the started hour',
    use: 'Use this for “Parking is $4 for each hour or part of an hour. What do 2.5 hours cost?”',
    assumptions: [
      'Each started hour is charged in full, so the hours are rounded up.',
      'The graph is a staircase: flat, then a jump at each whole hour.',
      'Each step includes its right end (closed) but not its left end (open).',
    ],
    variables: [
      num('R', 'R', 'Rate per started hour', 0.01, 100, { unit: '$', step: 0.01 }),
      num('h', 'h', 'Hours parked', 0.1, 24, { step: 0.1 }),
      int('H', 'H', 'Hours charged', 1, 24, { derived: true }),
      num('C', 'C', 'Cost', 0, 2400, { unit: '$', derived: true }),
      // The drawn steps' ends (T₀ … T₄) and heights (C₁ … C₄), for the graph only.
      ...[0, ...STEP_HOURS].map((k) =>
        int(`T${k}`, `T${sub(k)}`, `End of step ${k}`, 0, 24, pictureOnly),
      ),
      ...STEP_HOURS.map((k) =>
        num(`S${k}`, `C${sub(k)}`, `Height of step ${k}`, 0, 2400, { unit: '$', ...pictureOnly }),
      ),
    ],
    rules: [
      derive(
        'H = h rounded up',
        'H',
        ['h'],
        '{H} = {h} rounded up to a whole number',
        (v) => Math.ceil(v.h! - 1e-9),
        '{h} rounded up to a whole number',
        'A started hour counts as a whole hour.',
      ),
      derive(
        'C = R × H',
        'C',
        ['R', 'H'],
        '{C} = {R} × {H}',
        (v) => v.R! * v.H!,
        '{R} × {H}',
        'Pay the rate for each hour charged.',
      ),
      figure(
        derive(
          'T₀ = H − 4, at least 0',
          'T0',
          ['H'],
          '{T0} = {H} − 4, at least 0',
          (v) => Math.max(0, v.H! - 4),
          '{H} − 4',
          'For the graph: the four steps drawn end at the hours charged.',
        ),
      ),
      ...STEP_HOURS.map((k) =>
        figure(
          derive(
            `T${k} = T0 + ${k}`,
            `T${k}`,
            ['T0'],
            `{T${k}} = {T0} + ${k}`,
            (v) => v.T0! + k,
            `{T0} + ${k}`,
            `For the graph: the end of step ${k}.`,
          ),
        ),
      ),
      ...STEP_HOURS.map((k) =>
        figure(
          derive(
            `C${k} = R × T${k}`,
            `S${k}`,
            ['R', `T${k}`],
            `{S${k}} = {R} × {T${k}}`,
            (v) => v.R! * v[`T${k}`]!,
            `{R} × {T${k}}`,
            `For the graph: the height of step ${k}.`,
          ),
        ),
      ),
    ],
    example: {
      R: 4,
      h: 2.5,
      H: 3,
      C: 12,
      T0: 0,
      T1: 1,
      T2: 2,
      T3: 3,
      T4: 4,
      S1: 4,
      S2: 8,
      S3: 12,
      S4: 16,
    },
    startWith: ['h', 'R'],
    representation: {
      kind: 'functionGraph',
      family: 'piecewise',
      name: 'C',
      pieces: STEP_HOURS.map((k) => ({
        f: { family: 'linear' as const, m: 0, b: `S${k}` },
        from: `T${k - 1}`,
        to: `T${k}`,
        ends: '(]' as const,
      })),
      at: { x: 'h', y: 'C' },
      axes: { x: 'Hours h', y: 'Cost C ($)' },
      xMin: 0,
      fixed: true,
    },
  }),
  page({
    id: 'm.9.piecewise-functions~absolute-function',
    title: 'Absolute value function',
    use: 'Use this for “Graph y = −2|x − 1| + 6: its vertex, which way it opens, and its zeros.”',
    assumptions: [
      'y = a|x − h| + k is a V with its vertex at (h, k).',
      'a > 0 opens up, a < 0 opens down; a bigger |a| is steeper.',
      'The zeros solve a|x − h| + k = 0: |x − h| = −k ÷ a.',
    ],
    variables: [
      num('a', 'a', 'Stretch', -5, 5, { step: 0.5 }),
      num('h', 'h', 'Vertex x', -10, 10, { step: 0.5 }),
      num('k', 'k', 'Vertex y', -10, 10, { step: 0.5 }),
      num('x1', 'x₁', 'Left zero', -40, 40, { derived: true }),
      num('x2', 'x₂', 'Right zero', -40, 40, { derived: true }),
      num('x', 'x', 'Input', -20, 20, { step: 0.5 }),
      num('y', 'y', 'Output', -300, 300),
    ],
    rules: [
      nonzero('a', 'The stretch'),
      rule(
        'y = a|x − h| + k',
        '{y} = {a} × |{x} − {h}| + {k}',
        ['y', 'a', 'x', 'h', 'k'],
        (v) => v.y! - (v.a! * Math.abs(v.x! - v.h!) + v.k!),
        {
          y: [
            (v) => exact(v.a! * Math.abs(v.x! - v.h!) + v.k!),
            '{a} × |{x} − {h}| + {k}',
            'Take the distance from x to h, multiply by a, then add k.',
            {
              work: (v) => {
                const d = exact(Math.abs(v.x! - v.h!));
                return [
                  `y = ${fmt(v.a!)} × ${fmt(d)} + ${sg(v.k!)}`,
                  `y = ${fmt(exact(v.a! * d))} + ${sg(v.k!)}`,
                ];
              },
            },
          ],
          x: [
            (v) => {
              const s = v.a ? (v.y! - v.k!) / v.a! : -1;
              return s < 0 ? undefined : [exact(v.h! - s), exact(v.h! + s)];
            },
            '{h} ± ({y} − {k}) ÷ {a}',
            'Take k away and divide by a to get |x − h|; x is that far from h on either side.',
          ],
        },
      ),
      ...(
        [
          ['x1', -1],
          ['x2', 1],
        ] as const
      ).map(([id, sign]) =>
        derive(
          `${id} = h ${sign < 0 ? '−' : '+'} (−k ÷ a)`,
          id,
          ['h', 'k', 'a'],
          `{${id}} = {h} ${sign < 0 ? '−' : '+'} (−{k} ÷ {a})`,
          (v) => {
            const s = v.a ? -v.k! / v.a! : -1;
            return s < 0 ? undefined : v.h! + sign * s;
          },
          `{h} ${sign < 0 ? '−' : '+'} (−{k} ÷ {a})`,
          sign < 0
            ? 'Set y = 0: |x − h| = −k ÷ a. The left zero is that far left of h.'
            : 'And the right zero is as far right of h.',
          {},
          {
            message: (v) =>
              known(v, 'a', 'k') && v.a && -v.k! / v.a! < 0
                ? 'The V never reaches the x-axis: there are no zeros.'
                : undefined,
          },
        ),
      ),
    ],
    example: { a: -2, h: 1, k: 6, x1: -2, x2: 4, x: 0, y: 4 },
    startWith: ['x', 'a', 'h', 'k'],
    equation: 'y = {a}|x − {h}| + {k}',
    representation: {
      kind: 'functionGraph',
      family: 'absolute',
      a: 'a',
      h: 'h',
      k: 'k',
      at: { x: 'x', y: 'y' },
      shows: { vertex: { x: 'h', y: 'k' }, zeros: ['x1', 'x2'] },
      marks: ['vertex', 'zeros'],
    },
  }),
];

// ── Units, accuracy and precision (N-Q.1–3) ──

/** x rounded to n significant figures, a tie rounding up as on paper (4.35 → 4.4). */
const toFigures = (x: number, n: number) =>
  x === 0 ? 0 : Number(parseNumber(significant(x, Math.min(21, Math.max(1, n)))));
/** Whether x is a whole number of steps of u (a reading to the nearest u). */
const onStep = (x: number, u: number) => Math.abs(x / u - Math.round(x / u)) < 1e-6;
/** Why a side can't be a reading to the nearest u. */
const notAReading = (x: number, u: number) =>
  `${fmt(x)} cm is not a reading to the nearest ${fmt(u)} cm: measure to a finer unit or re-type the sides.`;

const UNITS_PRECISION: ModuleDef[] = [
  page({
    id: 'm.9.units-precision',
    use: 'Use this for “A car goes 45 miles per hour. How many feet per second is that?”',
    assumptions: [
      '1 mi = 5280 ft and 1 h = 3600 s exactly, so each conversion factor equals 1.',
      'Write each factor with the unit to cancel on the other side of the fraction bar.',
      'The units left after cancelling are the answer’s unit: a check that the setup is right.',
    ],
    // US units only: the chain is written in mi/h and ft/s, so the values stay in them.
    unitSystems: ['us'],
    variables: [
      num('v', 'v', 'Speed in miles per hour', 0, 600, { unit: 'mph', units: ['mph'], step: 0.1 }),
      num('u', 'u', 'Speed in feet per second', 0, 880, { unit: 'ft/s', units: ['ft/s'] }),
    ],
    rules: [
      rule(
        'u = v × 5280/3600',
        '{u} = {v} × 5280/3600',
        ['u', 'v'],
        (v) => v.u! - (v.v! * 5280) / 3600,
        {
          u: [
            (v) => exact((v.v! * 5280) / 3600),
            '{v} × 5280/3600',
            'Multiply by 5280 ft per mi and by 1 h per 3600 s: mi and h cancel, leaving ft/s.',
            {
              work: (v) => [
                `u = ${fmt(v.v!)} mi/h × 5280 ft/1 mi × 1 h/3600 s`,
                `u = ${fmt(exact(v.v! * 5280))} ft ÷ 3600 s`,
              ],
            },
          ],
          v: [
            (v) => exact((v.u! * 3600) / 5280),
            '{u} × 3600/5280',
            'Run the chain backwards: multiply by 3600 s per h and by 1 mi per 5280 ft.',
            {
              work: (v) => [
                `v = ${fmt(v.u!)} ft/s × 3600 s/1 h × 1 mi/5280 ft`,
                `v = ${fmt(exact(v.u! * 3600))} mi ÷ 5280 h`,
              ],
            },
          ],
        },
      ),
    ],
    example: { v: 45, u: 66 },
    startWith: ['v'],
    representation: {
      kind: 'unitChain',
      mode: 'chain',
      start: 'v',
      unit: 'mi',
      per: 'h',
      factors: [
        { top: 5280, topUnit: 'ft', bottom: 1, bottomUnit: 'mi' },
        { top: 1, topUnit: 'h', bottom: 3600, bottomUnit: 's' },
      ],
      result: 'u',
    },
  }),
  page({
    id: 'm.9.units-precision~area-units',
    title: 'Square units and a cost',
    use: 'Use this for “Carpet costs $30 a square yard. What does it cost for a 12 ft by 15 ft room?”',
    assumptions: [
      '1 yd = 3 ft, so 1 yd² = 3 ft × 3 ft = 9 ft²: square the length factor.',
      'The price is per square yard, so change the area to square yards before multiplying.',
    ],
    // US units only: the chain is written in ft² and yd², so the values stay in them.
    unitSystems: ['us'],
    variables: [
      num('l', 'l', 'Length', 0.1, 500, { unit: 'ft', units: ['ft'], step: 0.1 }),
      num('w', 'w', 'Width', 0.1, 500, { unit: 'ft', units: ['ft'], step: 0.1 }),
      num('F', 'A_ft', 'Area in square feet', 0.01, 250000, { unit: 'ft²', units: ['ft²'] }),
      num('Y', 'A_yd', 'Area in square yards', 0.001, 27778, { unit: 'yd²', units: ['yd²'] }),
      num('p', 'p', 'Price per square yard', 0.01, 100, { unit: '$', step: 0.01 }),
      num('C', 'C', 'Cost', 0, 3000000, { unit: '$' }),
    ],
    rules: [
      rule('A_ft = l × w', '{F} = {l} × {w}', ['F', 'l', 'w'], (v) => v.F! - v.l! * v.w!, {
        F: [
          (v) => exact(v.l! * v.w!),
          '{l} × {w}',
          'The floor’s area is its length times its width.',
        ],
        l: [(v) => fin(v.F! / v.w!), '{F} ÷ {w}', 'Divide the area by the width.'],
        w: [(v) => fin(v.F! / v.l!), '{F} ÷ {l}', 'Divide the area by the length.'],
      }),
      rule('A_yd = A_ft ÷ 9', '{Y} = {F} × 1/9', ['Y', 'F'], (v) => v.Y! - v.F! / 9, {
        Y: [
          (v) => exact(v.F! / 9),
          '{F} ÷ 9',
          'Multiply by 1 yd² per 9 ft²: the ft² cancel, leaving square yards.',
        ],
        F: [(v) => exact(v.Y! * 9), '{Y} × 9', 'Each square yard is 9 square feet.'],
      }),
      rule('C = p × A_yd', '{C} = {p} × {Y}', ['C', 'p', 'Y'], (v) => v.C! - v.p! * v.Y!, {
        C: [
          (v) => exact(v.p! * v.Y!),
          '{p} × {Y}',
          'Dollars per square yard times square yards: the yd² cancel, leaving dollars.',
        ],
        p: [(v) => fin(v.C! / v.Y!), '{C} ÷ {Y}', 'Divide the cost by the square yards.'],
        Y: [(v) => fin(v.C! / v.p!), '{C} ÷ {p}', 'Divide the cost by the price per square yard.'],
      }),
    ],
    example: { l: 15, w: 12, F: 180, Y: 20, p: 30, C: 600 },
    startWith: ['l', 'w', 'p'],
    representation: {
      kind: 'unitChain',
      mode: 'chain',
      start: 'F',
      unit: 'ft²',
      factors: [{ top: 1, topUnit: 'yd²', bottom: 9, bottomUnit: 'ft²' }],
      result: 'Y',
    },
  }),
  page({
    id: 'm.9.units-precision~formula-units',
    title: 'Units in a formula: d = rt',
    use: 'Use this for “A cyclist rides at 18 km per hour for 40 minutes. How far does she go?”',
    assumptions: [
      'The rate is per hour, so the time must be in hours before multiplying.',
      'Divide minutes by 60 to get hours: 30 min is 1/2 h.',
      'Kilometers per hour times hours leaves kilometers: the hours cancel.',
    ],
    variables: [
      num('r', 'r', 'Rate', 0.1, 300, { unit: 'km/h', units: ['km/h', 'mph'], step: 0.1 }),
      num('t', 't', 'Time in minutes', 1, 600, { unit: 'min', units: ['min'], step: 1 }),
      num('h', 'h', 'Time in hours', 1 / 60, 10, {
        unit: 'h',
        units: ['h'],
        derived: true,
        fraction: 60,
      }),
      num('d', 'd', 'Distance', 0, 3000, { unit: 'km', units: ['km', 'mi'] }),
    ],
    rules: [
      rule('h = t ÷ 60', '{h} = {t} ÷ 60', ['h', 't'], (v) => v.h! - v.t! / 60, {
        h: [
          (v) => exact(v.t! / 60),
          '{t} ÷ 60',
          'An hour is 60 minutes, so divide by 60 to write the time in hours, as the rate is.',
        ],
        t: [(v) => exact(v.h! * 60), '{h} × 60', 'Each hour is 60 minutes.'],
      }),
      rule('d = r × h', '{d} = {r} × {h}', ['d', 'r', 'h'], (v) => v.d! - v.r! * v.h!, {
        d: [
          (v) => exact(v.r! * v.h!),
          '{r} × {h}',
          'Distance per hour times hours: the hours cancel, leaving the distance.',
        ],
        r: [(v) => fin(v.d! / v.h!), '{d} ÷ {h}', 'Divide the distance by the time in hours.'],
        h: [(v) => fin(v.d! / v.r!), '{d} ÷ {r}', 'Divide the distance by the rate.'],
      }),
    ],
    example: { r: 18, t: 40, h: 2 / 3, d: 12 },
    startWith: ['r', 't'],
    representation: { kind: 'doubleNumberLine', top: 'h', bottom: 'd', per: 'r', ticks: 1 },
  }),
  page({
    id: 'm.9.units-precision~bounds',
    title: 'Precision: least and greatest possible area',
    use: 'Use this for “A rectangle measures 8 cm by 5 cm to the nearest centimeter. What are the least and greatest possible areas and perimeters?”',
    unitSystems: ['metric'],
    assumptions: [
      'A length measured to the nearest u is off by at most half of u, the greatest possible error.',
      'The true sides lie between l − e and l + e, so the true area lies between the two products.',
      'A finer tool (a smaller u) narrows the range of possible areas.',
    ],
    variables: [
      num('l', 'l', 'Length as measured', 0.1, 1000, { unit: 'cm', units: ['cm'], step: 0.1 }),
      num('w', 'w', 'Width as measured', 0.1, 1000, { unit: 'cm', units: ['cm'], step: 0.1 }),
      num('u', 'u', 'Measured to the nearest', 0.1, 10, {
        unit: 'cm',
        units: ['cm'],
        allowed: [0.1, 0.5, 1, 5, 10],
      }),
      num('e', 'e', 'Greatest possible error', 0.05, 5, {
        unit: 'cm',
        units: ['cm'],
        derived: true,
      }),
      num('A', 'A', 'Area as measured', 0.01, 1000000, { unit: 'cm²', units: ['cm²'] }),
      num('lo', 'A_min', 'Least possible area', 0, 1000000, {
        unit: 'cm²',
        units: ['cm²'],
        derived: true,
      }),
      num('hi', 'A_max', 'Greatest possible area', 0, 1100000, {
        unit: 'cm²',
        units: ['cm²'],
        derived: true,
      }),
      num('plo', 'P_min', 'Least possible perimeter', 0, 4000, {
        unit: 'cm',
        units: ['cm'],
        derived: true,
      }),
      num('phi', 'P_max', 'Greatest possible perimeter', 0, 4020, {
        unit: 'cm',
        units: ['cm'],
        derived: true,
      }),
    ],
    rules: [
      constraint(
        'l to the nearest u',
        'The length {l} is a multiple of {u}, as a reading to the nearest {u} is',
        ['l', 'u'],
        (v) => !onStep(v.l!, v.u!),
        (v) => notAReading(v.l!, v.u!),
      ),
      constraint(
        'w to the nearest u',
        'The width {w} is a multiple of {u}, as a reading to the nearest {u} is',
        ['w', 'u'],
        (v) => !onStep(v.w!, v.u!),
        (v) => notAReading(v.w!, v.u!),
      ),
      derive(
        'e = u ÷ 2',
        'e',
        ['u'],
        '{e} = {u} ÷ 2',
        (v) => v.u! / 2,
        '{u} ÷ 2',
        'A reading to the nearest u can be off by up to half of u either way.',
      ),
      rule('A = l × w', '{A} = {l} × {w}', ['A', 'l', 'w'], (v) => v.A! - v.l! * v.w!, {
        A: [(v) => exact(v.l! * v.w!), '{l} × {w}', 'The area from the measured sides.'],
        l: [(v) => fin(v.A! / v.w!), '{A} ÷ {w}', 'Divide the area by the width.'],
        w: [(v) => fin(v.A! / v.l!), '{A} ÷ {l}', 'Divide the area by the length.'],
      }),
      derive(
        'A_min = (l − e)(w − e)',
        'lo',
        ['l', 'w', 'e'],
        '{lo} = ({l} − {e}) × ({w} − {e})',
        (v) => (v.l! - v.e!) * (v.w! - v.e!),
        '({l} − {e}) × ({w} − {e})',
        'The shortest sides the readings allow give the least area.',
      ),
      derive(
        'A_max = (l + e)(w + e)',
        'hi',
        ['l', 'w', 'e'],
        '{hi} = ({l} + {e}) × ({w} + {e})',
        (v) => (v.l! + v.e!) * (v.w! + v.e!),
        '({l} + {e}) × ({w} + {e})',
        'The longest sides the readings allow give the greatest area.',
      ),
      derive(
        'P_min = 2(l − e) + 2(w − e)',
        'plo',
        ['l', 'w', 'e'],
        '{plo} = 2 × ({l} − {e}) + 2 × ({w} − {e})',
        (v) => 2 * (v.l! - v.e!) + 2 * (v.w! - v.e!),
        '2 × ({l} − {e}) + 2 × ({w} − {e})',
        'The shortest sides the readings allow give the least perimeter too.',
      ),
      derive(
        'P_max = 2(l + e) + 2(w + e)',
        'phi',
        ['l', 'w', 'e'],
        '{phi} = 2 × ({l} + {e}) + 2 × ({w} + {e})',
        (v) => 2 * (v.l! + v.e!) + 2 * (v.w! + v.e!),
        '2 × ({l} + {e}) + 2 × ({w} + {e})',
        'The longest sides the readings allow give the greatest perimeter.',
      ),
    ],
    example: { l: 8, w: 5, u: 1, e: 0.5, A: 40, lo: 33.75, hi: 46.75, plo: 24, phi: 28 },
    startWith: ['u', 'l', 'w'],
    representation: { kind: 'rectangle', length: 'l', width: 'w', inside: 'A', extent: 10 },
  }),
  page({
    id: 'm.9.units-precision~significant-figures',
    title: 'A product to the right significant figures',
    use: 'Use this for “A table is 4.25 m by 3.1 m. Give its area to the right number of significant figures.”',
    unitSystems: ['metric'],
    assumptions: [
      'A product is no more precise than its least precise factor.',
      'Count the significant figures in each measurement; round the answer to the fewer.',
      'Type the counts yourself: 3.10 has 3 significant figures, though its box shows 3.1.',
    ],
    variables: [
      num('l', 'l', 'Length', 1, 500, { unit: 'm', units: ['m'], step: 0.001 }),
      num('w', 'w', 'Width', 1, 500, { unit: 'm', units: ['m'], step: 0.001 }),
      int('n1', 'n₁', 'Significant figures in l', 1, 5),
      int('n2', 'n₂', 'Significant figures in w', 1, 5),
      int('n', 'n', 'Significant figures in the answer', 1, 5, { derived: true }),
      num('P', 'P', 'Area as calculated', 1, 250000, { unit: 'm²', units: ['m²'] }),
      num('R', 'A', 'Area, rounded', 1, 250000, { unit: 'm²', units: ['m²'], derived: true }),
    ],
    rules: [
      constraint(
        'l has n₁ figures',
        'The length {l} can be written with {n1} significant figures',
        ['l', 'n1'],
        (v) => Math.abs(toFigures(v.l!, v.n1!) - v.l!) > 1e-9 * v.l!,
      ),
      constraint(
        'w has n₂ figures',
        'The width {w} can be written with {n2} significant figures',
        ['w', 'n2'],
        (v) => Math.abs(toFigures(v.w!, v.n2!) - v.w!) > 1e-9 * v.w!,
      ),
      rule('P = l × w', '{P} = {l} × {w}', ['P', 'l', 'w'], (v) => v.P! - v.l! * v.w!, {
        P: [(v) => exact(v.l! * v.w!), '{l} × {w}', 'Multiply the measurements as they are.'],
        l: [(v) => fin(v.P! / v.w!), '{P} ÷ {w}', 'Divide the area by the width.'],
        w: [(v) => fin(v.P! / v.l!), '{P} ÷ {l}', 'Divide the area by the length.'],
      }),
      derive(
        'n = the smaller of n₁ and n₂',
        'n',
        ['n1', 'n2'],
        '{n} = the smaller of {n1} and {n2}',
        (v) => Math.min(v.n1!, v.n2!),
        'the smaller of {n1} and {n2}',
        'The answer keeps as many significant figures as the less precise measurement.',
      ),
      derive(
        'A = P to n figures',
        'R',
        ['P', 'n'],
        '{R} = {P} rounded to {n} significant figures',
        (v) => toFigures(v.P!, v.n!),
        '{P} rounded to {n} significant figures',
        'Round the calculated area; the digits past n are not known from these measurements.',
        {
          // The box drops a trailing zero (3.0 shows 3): write the answer with its n figures.
          note: (v) =>
            v.P === undefined || v.n === undefined
              ? ''
              : `→ written with ${v.n} significant figures: ${significant(v.P, v.n)} m²`,
        },
      ),
    ],
    example: { l: 4.25, w: 3.1, n1: 3, n2: 2, n: 2, P: 13.175, R: 13 },
    startWith: ['l', 'w', 'n1', 'n2'],
    representation: { kind: 'rectangle', length: 'l', width: 'w', inside: 'R', extent: 5 },
  }),
];

/** Every Grade 9 math calculator, by skill in taxonomy order. */
export const MATH_9_MODULES: ModuleDef[] = [
  ...SOLVING_EQUATIONS,
  ...UNITS_PRECISION,
  ...LINEAR_INEQUALITIES,
  ...LINEAR_INEQUALITIES_MORE,
  ...ABSOLUTE_VALUE,
  ...FUNCTION_NOTATION,
  ...LINEAR_MODELING,
  ...REGRESSION,
  ...INEQUALITY_SYSTEMS,
  ...PIECEWISE_FUNCTIONS,
  ...RADICALS,
  ...EXPONENTIAL,
  ...SEQUENCES,
  ...POLYNOMIAL_OPERATIONS,
  ...FACTORING,
  ...QUADRATIC_FUNCTIONS,
  ...QUADRATIC_FORMULA,
  ...QUADRATIC_INEQUALITIES,
  ...DATA_DISPLAYS,
  ...TWO_WAY_TABLES,
];
