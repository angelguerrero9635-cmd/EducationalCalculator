/**
 * Grade 12 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md; the
 * direction plan and build notes: docs/BUILD_HS.md.
 * The layout pages (explore, sort, sequence, observe) are in `../layouts/math12.ts`.
 */
import { chiCdf, invPhi, Phi, tCdf, tStar } from '@/components/module/reps/statMath';
import { formatNumber } from '@/engine/format';
import type { Relation, Values, VariableDef } from '@/engine/types';

import { div } from '../helpers';
import type { ModuleDef, StepText } from '../types';

// ── Helpers only Grade 12 needs ──

type Rel = { relation: Relation; steps: Record<string, StepText> };
type Solver = (v: Values) => number | number[] | undefined;

const V = (
  id: string,
  symbol: string,
  name: string,
  extra: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...extra });

/** Rounded to 12 significant figures, so 0.1 + 0.2 is 0.3 when a value is worked out. */
const exact = (x: number) => Number(x.toPrecision(12));

/** The relations and their step text, as a page spreads them. */
const rels = (...rs: Rel[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

/**
 * One relation: its display (`{id}` for each value), the residual, and each rearrangement as
 * [solver, expression, why]. Values it names without a rearrangement are never solved from it
 * (no numeric search), unless `search` lists them.
 */
function rel(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  solves: Record<string, [Solver, StepText['expr'], string]>,
  extra: Partial<Relation> & { search?: string[] } = {},
): Rel {
  const { search = [], ...more } = extra;
  return {
    relation: {
      id,
      display,
      vars,
      residual,
      solve: {
        ...Object.fromEntries(
          vars
            .filter((x) => !(x in solves) && !search.includes(x))
            .map((x) => [x, () => undefined]),
        ),
        ...Object.fromEntries(Object.entries(solves).map(([x, [f]]) => [x, f])),
      },
      ...more,
    },
    steps: Object.fromEntries(
      Object.entries(solves).map(([x, [, expr, how]]) => [x, { expr, how }]),
    ),
  };
}

/** x = f(inputs), worked one way only. */
function derive(
  id: string,
  display: string,
  x: string,
  inputs: string[],
  f: (v: Values) => number | undefined,
  expr: StepText['expr'],
  how: string,
): Rel {
  return rel(id, display, [x, ...inputs], (v) => v[x]! - (f(v) ?? NaN), {
    [x]: [
      (v) => {
        const y = f(v);
        return y === undefined || !Number.isFinite(y) ? undefined : exact(y);
      },
      expr,
      how,
    ],
  });
}

/** A relation with more said under one of its steps (work lines, a note). */
const withStep = (r: Rel, id: string, more: Partial<StepText>): Rel => ({
  ...r,
  steps: { ...r.steps, [id]: { ...r.steps[id]!, ...more } },
});

/** A relation with its check line written out. */
const withCheck = (r: Rel, check: (v: Values) => string): Rel => ({
  ...r,
  relation: { ...r.relation, check },
});

/** A rule that only checks (never solved): 0 when it holds; `why` is the reason shown when not. */
const limit = (
  id: string,
  display: string,
  vars: string[],
  ok: (v: Values) => boolean,
  why: string | ((v: Values) => string),
): Rel => ({
  relation: {
    id,
    constraint: true,
    display,
    vars,
    residual: (v) => (ok(v) ? 0 : 1),
    solve: {},
    message: (v) => (ok(v) ? undefined : typeof why === 'string' ? why : why(v)),
  },
  steps: {},
});

/** 0 < p < 1, or undefined. */
const inOpen = (p: number) => (p > 0 && p < 1 ? p : undefined);

// ── Statistics ──

const prob = (id: string, symbol: string, name: string, extra: Partial<VariableDef> = {}) =>
  V(id, symbol, name, { min: 0, max: 1, step: 0.0001, ...extra });
const zVar = (id = 'z', name = 'Test statistic') =>
  V(id, 'z', name, { min: -50, max: 50, step: 0.01 });
const alphaOf = (id = 'a') =>
  V(id, 'α', 'Significance level', { allowed: [0.01, 0.05, 0.1], min: 0.01, max: 0.1 });
const alphaVar = alphaOf();
const ALPHA_WHY =
  'The significance level is chosen before the test; the p-value step compares the p-value with it.';

/** The decision, after the p-value: below α rejects H₀. */
const decide =
  (P = 'P', a = 'a') =>
  (v: Values) =>
    v[P] === undefined || v[a] === undefined
      ? ''
      : `→ ${v[P]! < 0.0001 ? 'P < 0.0001' : `P = ${fmt(v[P]!)}`}, ${
          v[P]! < v[a]! ? 'below' : 'not below'
        } α = ${fmt(v[a]!)}: ${v[P]! < v[a]! ? 'reject H₀' : 'fail to reject H₀'}`;
/** A p-value relation with the decision written after its answer. */
const decided = (r: Rel, a = 'a') => withStep(r, 'P', { note: decide('P', a) });

/** z = (x − m) ÷ s: how many standard errors the estimate is from the H₀ value. */
function zScore(
  z: string,
  x: string,
  m: string,
  s: string,
  how = [
    'How many standard errors the estimate is from the value H₀ claims.',
    'Start at the H₀ value and go z standard errors.',
  ],
): Rel {
  return rel(
    `${z} = (${x} − ${m}) ÷ ${s}`,
    `{${z}} = ({${x}} − {${m}}) ÷ {${s}}`,
    [z, x, m, s],
    (v) => v[z]! * v[s]! - (v[x]! - v[m]!),
    {
      [z]: [(v) => div(v[x]! - v[m]!, v[s]!), `({${x}} − {${m}}) ÷ {${s}}`, how[0]!],
      [x]: [(v) => v[m]! + v[z]! * v[s]!, `{${m}} + {${z}} × {${s}}`, how[1]!],
    },
  );
}

/** P = 2(1 − Φ(|z|)): both tails past |z|. */
const twoTail = (P: string, z: string) =>
  derive(
    `${P} = 2(1 − Φ(|${z}|))`,
    `{${P}} = 2 × (1 − Φ(|{${z}}|))`,
    P,
    [z],
    (v) => 2 * (1 - Phi(Math.abs(v[z]!))),
    `2 × (1 − Φ(|{${z}}|))`,
    'Hₐ says “not equal”, so both tails past |z| count as at least as extreme.',
  );

/** P = Φ(z): the tail left of z. */
const leftTail = (
  P: string,
  z: string,
  how = 'Hₐ says “less”, so the p-value is the area left of z.',
) =>
  rel(`${P} = Φ(${z})`, `{${P}} = Φ({${z}})`, [P, z], (v) => v[P]! - Phi(v[z]!), {
    [P]: [(v) => Phi(v[z]!), `Φ({${z}})`, how],
    [z]: [
      (v) => (inOpen(v[P]!) === undefined ? undefined : invPhi(v[P]!)),
      `invNorm({${P}})`,
      'invNorm undoes Φ: the z with that area to its left.',
    ],
  });

/** P = 1 − Φ(z): the tail right of z. */
const rightTail = (P: string, z: string, how: string) =>
  rel(`${P} = 1 − Φ(${z})`, `{${P}} = 1 − Φ({${z}})`, [P, z], (v) => v[P]! - (1 - Phi(v[z]!)), {
    [P]: [(v) => 1 - Phi(v[z]!), `1 − Φ({${z}})`, how],
    [z]: [
      (v) => (inOpen(v[P]!) === undefined ? undefined : invPhi(1 - v[P]!)),
      `invNorm(1 − {${P}})`,
      'The area left of z is 1 minus the right tail.',
    ],
  });

/** p = k ÷ n, a sample proportion. */
const proportion = (p: string, k: string, n: string) =>
  rel(`${p} = ${k} ÷ ${n}`, `{${p}} = {${k}} ÷ {${n}}`, [p, k, n], (v) => v[p]! * v[n]! - v[k]!, {
    [p]: [
      (v) => div(v[k]!, v[n]!),
      `{${k}} ÷ {${n}}`,
      'The share of the sample that are successes.',
    ],
    [k]: [(v) => v[p]! * v[n]!, `{${p}} × {${n}}`, 'The share of the sample times its size.'],
  });

/** SE = σ ÷ √n. */
const seMean = (E: string, s: string, n: string) =>
  rel(
    `${E} = ${s} ÷ √${n}`,
    `{${E}} = {${s}} ÷ √{${n}}`,
    [E, s, n],
    (v) => v[E]! * Math.sqrt(v[n]!) - v[s]!,
    {
      [E]: [
        (v) => div(v[s]!, Math.sqrt(v[n]!)),
        `{${s}} ÷ √{${n}}`,
        'Means of n values spread less than single values: divide σ by the root of n.',
      ],
      [s]: [(v) => v[E]! * Math.sqrt(v[n]!), `{${E}} × √{${n}}`, 'Undo the division by √n.'],
      [n]: [
        (v) => (v[E]! > 0 ? (v[s]! / v[E]!) ** 2 : undefined),
        `({${s}} ÷ {${E}})²`,
        'Square both sides: n = (σ ÷ SE)².',
      ],
    },
  );

/** SE = √(p(1 − p) ÷ n). */
const seProportion = (E: string, p: string, n: string, how: string) =>
  rel(
    `${E} = √(${p}(1 − ${p}) ÷ ${n})`,
    `{${E}} = √({${p}} × (1 − {${p}}) ÷ {${n}})`,
    [E, p, n],
    (v) => v[E]! ** 2 * v[n]! - v[p]! * (1 - v[p]!),
    {
      [E]: [
        (v) => (v[n]! > 0 ? Math.sqrt((v[p]! * (1 - v[p]!)) / v[n]!) : undefined),
        `√({${p}} × (1 − {${p}}) ÷ {${n}})`,
        how,
      ],
      [n]: [
        (v) => div(v[p]! * (1 - v[p]!), v[E]! ** 2),
        `{${p}} × (1 − {${p}}) ÷ {${E}}²`,
        'Square both sides, then swap n and SE².',
      ],
    },
  );

/** z⋆ = invNorm(1 − (1 − C) ÷ 2), the critical value for confidence C. */
const critical = rel(
  'z⋆ = invNorm(1 − (1 − C) ÷ 2)',
  '{z} = invNorm(1 − (1 − {C}) ÷ 2)',
  ['z', 'C'],
  (v) => Phi(v.z!) - (1 - (1 - v.C!) / 2),
  {
    z: [
      (v) => (inOpen(v.C!) === undefined ? undefined : invPhi(1 - (1 - v.C!) / 2)),
      'invNorm(1 − (1 − {C}) ÷ 2)',
      'The middle C of the curve is inside ±z⋆, so half of the rest, 1 − C, sits in each tail.',
    ],
  },
);

/** E = z⋆ × SE, the margin of error. */
const margin = rel(
  'E = z⋆ × SE',
  '{E} = {z} × {SE}',
  ['E', 'z', 'SE'],
  (v) => v.E! - v.z! * v.SE!,
  {
    E: [(v) => v.z! * v.SE!, '{z} × {SE}', 'The margin of error is z⋆ standard errors.'],
    SE: [(v) => div(v.E!, v.z!), '{E} ÷ {z}', 'Divide the margin by z⋆.'],
  },
);

/** a = b ± c, the ends of an interval. */
function end(a: string, b: string, c: string, sign: 1 | -1): Rel {
  const op = sign > 0 ? '+' : '−';
  return rel(
    `${a} = ${b} ${op} ${c}`,
    `{${a}} = {${b}} ${op} {${c}}`,
    [a, b, c],
    (v) => v[a]! - (v[b]! + sign * v[c]!),
    {
      [a]: [
        (v) => v[b]! + sign * v[c]!,
        `{${b}} ${op} {${c}}`,
        sign > 0
          ? 'Go up from the estimate by the margin.'
          : 'Go down from the estimate by the margin.',
      ],
    },
  );
}

/** L < U: an interval's ends in order. */
const ordered = limit(
  'L < U',
  'The lower end {lo} is below the upper end {hi}',
  ['lo', 'hi'],
  (v) => v.lo! < v.hi!,
  'The lower end must be below the upper end: the interval is the estimate ± a positive margin.',
);

// ── The t distribution (engine need 1) ──

const tVar = () =>
  V('t', 't', 'Test statistic', { min: -1000, max: 1000, step: 0.01, derived: true });

/** df = n − 1. */
const degreesOfFreedom = (df: string, n: string) =>
  derive(
    `${df} = ${n} − 1`,
    `{${df}} = {${n}} − 1`,
    df,
    [n],
    (v) => v[n]! - 1,
    `{${n}} − 1`,
    'One less than the sample size: the mean uses up one degree of freedom.',
  );

/** P = 2(1 − tcdf(|t|, df)): both tails of the t curve past |t|. */
const tTwoTail = (P: string, t: string, df: string) =>
  derive(
    `${P} = 2(1 − tcdf(|${t}|, ${df}))`,
    `{${P}} = 2 × (1 − tcdf(|{${t}}|, {${df}}))`,
    P,
    [t, df],
    (v) => 2 * (1 - tCdf(Math.abs(v[t]!), v[df]!)),
    `2 × (1 − tcdf(|{${t}}|, {${df}}))`,
    'Hₐ says “not equal”, so both tails of the t curve past |t| count; tcdf(t, df) is the area left of t.',
  );

/** t⋆ = invT(1 − (1 − C) ÷ 2, df), the critical value for confidence C. */
const tCritical = withCheck(
  derive(
    't⋆ = invT(1 − (1 − C) ÷ 2, df)',
    '{ts} = invT(1 − (1 − {C}) ÷ 2, {df})',
    'ts',
    ['C', 'df'],
    (v) => tStar(v.C!, v.df!),
    (v: Values) => `invT(${fmt(1 - (1 - v.C!) / 2)}, {df})`,
    'The middle C of the t curve lies within ±t⋆, so the area left of t⋆ is 1 − (1 − C) ÷ 2.',
  ),
  (v) => `${fmt(v.ts!)} = invT(${fmt(1 - (1 - v.C!) / 2)}, ${fmt(v.df!)})`,
);

/** χ² p-value, df 2: the right tail past X. */
const chiTail2 = derive(
  'P = χ²cdf(X, ∞, 2)',
  '{P} = χ²cdf({X}, ∞, 2)',
  'P',
  ['X'],
  (v) => 1 - chiCdf(v.X!, 2),
  'χ²cdf({X}, ∞, 2)',
  'The area under the chi-square curve with df 2 past the statistic.',
);

const FIVE = [1, 2, 3, 4, 5];
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const FIVE_TERMS = FIVE.map((i) => `({O${i}} − {n} × {p${i}})² ÷ ({n} × {p${i}})`).join(' + ');

/** A number as the steps show it (at most 4 decimals). */
const fmt = (x: number) => formatNumber(Number(x.toFixed(4)));
/** A value as its box shows it (4 significant figures below 1), bracketed when negative. */
const shown = (x: number) => formatNumber(x);
const par = (x: number) => (x < 0 ? `(${shown(x)})` : shown(x));

/** The 2 × 3 table of the independence test, row by row. */
const CELLS = [
  ['a', 'b', 'c'],
  ['d', 'e', 'f'],
] as const;
const ALL_CELLS: string[] = CELLS.flat();
/** Each cell's expected count if the variables are independent: row × column ÷ grand total. */
function expectedCounts(v: Values): { id: string; O: number; E: number }[] {
  const N = ALL_CELLS.reduce((t, id) => t + v[id]!, 0);
  const row = CELLS.map((r) => r.reduce((t, id) => t + v[id]!, 0));
  const col = CELLS[0].map((id, j) => v[id]! + v[CELLS[1][j]!]!);
  return CELLS.flatMap((r, i) => r.map((id, j) => ({ id, O: v[id]!, E: (row[i]! * col[j]!) / N })));
}
const chiOfTable = (v: Values) => {
  const cells = expectedCounts(v);
  return cells.every((c) => c.E > 0)
    ? cells.reduce((t, c) => t + (c.O - c.E) ** 2 / c.E, 0)
    : undefined;
};

/** The other direction's chance, after a tail area: 1 − P. */
const complement = (P: number | undefined, what: string) =>
  P === undefined ? '' : `→ ${what}: 1 − ${fmt(P)} = ${fmt(1 - P)}`;

const MATH_12_STATS: ModuleDef[] = [
  // ── m.12.hypothesis-testing (S-IC.5, S-IC.6) ──
  {
    id: 'm.12.hypothesis-testing',
    assumptions: [
      'H₀: p = p₀ and Hₐ: p ≠ p₀, a two-sided test (a one-sided Hₐ is its own page).',
      'The sample is random, with np₀ ≥ 10 and n(1 − p₀) ≥ 10, so p̂ is close to normal.',
      'Reject H₀ when the p-value is below α; “fail to reject” never proves H₀ true.',
    ],
    variables: [
      V('p0', 'p₀', 'Proportion if H₀ is true', { min: 0.01, max: 0.99, step: 0.01 }),
      V('n', 'n', 'Sample size', { integer: true, min: 1, max: 100000 }),
      V('k', 'k', 'Successes in the sample', { integer: true, min: 0, max: 100000 }),
      prob('p', 'p̂', 'Sample proportion', { derived: true }),
      V('E', 'SE', 'Standard error if H₀ is true', {
        min: 0.00001,
        max: 1,
        step: 0.0001,
        derived: true,
      }),
      zVar(),
      prob('P', 'P', 'p-value'),
      alphaVar,
    ],
    ...rels(
      proportion('p', 'k', 'n'),
      withStep(
        seProportion(
          'E',
          'p0',
          'n',
          'If H₀ is true, p̂ spreads by √(p₀(1 − p₀) ÷ n): use p₀, not p̂.',
        ),
        'E',
        {
          // The normal curve needs np₀ ≥ 10 and n(1 − p₀) ≥ 10.
          note: (v) => {
            if (v.n === undefined || v.p0 === undefined) return '';
            const [what, x] = v.p0 <= 0.5 ? ['np₀', v.n * v.p0] : ['n(1 − p₀)', v.n * (1 - v.p0)];
            return x >= 10
              ? ''
              : `→ ${what} = ${fmt(x)} is below 10: the normal curve is a poor fit`;
          },
        },
      ),
      zScore('z', 'p', 'p0', 'E'),
      decided(twoTail('P', 'z')),
    ),
    standalone: { vars: ['a'], why: ALPHA_WHY },
    example: {
      p0: 0.5,
      n: 100,
      k: 60,
      p: 0.6,
      E: 0.05,
      z: 2,
      P: 2 * (1 - Phi(2)),
      a: 0.05,
    },
    startWith: ['p0', 'n', 'k', 'a'],
    representation: {
      kind: 'normalCurve',
      mean: 'p0',
      sd: 'E',
      axis: 'Sample proportion p̂ if H₀ is true',
      test: { stat: 'z', alpha: 'a', tail: 'two', p: 'P' },
      fixed: true,
    },
  },
  {
    id: 'm.12.hypothesis-testing~mean',
    title: 'One-mean z-test (left-tailed)',
    use: 'Use this for “Is the mean less than μ₀?” with σ known: a left-tailed z-test.',
    assumptions: [
      'H₀: μ = μ₀ and Hₐ: μ < μ₀, so only a low sample mean counts against H₀.',
      'The sample is random, σ is known, and x̄ is close to normal (a normal population or n ≥ 30).',
      'Reject H₀ when the p-value is below α.',
    ],
    variables: [
      V('m', 'μ₀', 'Mean if H₀ is true', { unit: 'g', min: 0.1, max: 100000, step: 0.5 }),
      V('s', 'σ', 'Standard deviation', { unit: 'g', min: 0.01, max: 10000, step: 0.1 }),
      V('n', 'n', 'Sample size', { integer: true, min: 2, max: 100000 }),
      V('x', 'x̄', 'Sample mean', { unit: 'g', min: 0.1, max: 100000, step: 0.1 }),
      V('E', 'SE', 'Standard error', { unit: 'g', min: 0.0001, max: 10000, step: 0.01 }),
      zVar(),
      prob('P', 'P', 'p-value'),
      alphaVar,
    ],
    ...rels(seMean('E', 's', 'n'), zScore('z', 'x', 'm', 'E'), decided(leftTail('P', 'z'))),
    standalone: { vars: ['a'], why: ALPHA_WHY },
    example: { m: 500, s: 12, n: 36, x: 496, E: 2, z: -2, P: Phi(-2), a: 0.05 },
    startWith: ['m', 's', 'n', 'x', 'a'],
    unitSystems: ['metric'],
    representation: {
      kind: 'normalCurve',
      mean: 'm',
      sd: 'E',
      axis: 'Sample mean x̄ (g) if H₀ is true',
      test: { stat: 'z', alpha: 'a', tail: 'left', p: 'P' },
      fixed: true,
    },
  },
  {
    id: 'm.12.hypothesis-testing~t-test',
    title: 'One-mean t-test',
    use: 'Use this for “A sample of 16 has mean 496 g and s = 8 g. Is the mean different from 500 g?”',
    assumptions: [
      'H₀: μ = μ₀ and Hₐ: μ ≠ μ₀; σ is unknown, so the sample’s s stands in for it.',
      'With s in place of σ the statistic follows a t curve with df = n − 1, wider in the tails than the normal.',
      'The sample is random and the population close to normal (or n ≥ 30).',
    ],
    variables: [
      V('m', 'μ₀', 'Mean if H₀ is true', { unit: 'g', min: 0.1, max: 100000, step: 0.5 }),
      V('s', 's', 'Sample standard deviation', { unit: 'g', min: 0.01, max: 10000, step: 0.1 }),
      V('n', 'n', 'Sample size', { integer: true, min: 2, max: 1000 }),
      V('x', 'x̄', 'Sample mean', { unit: 'g', min: 0.1, max: 100000, step: 0.1 }),
      V('df', 'df', 'Degrees of freedom', { integer: true, min: 1, max: 999, derived: true }),
      V('E', 'SE', 'Standard error', {
        unit: 'g',
        min: 0.0001,
        max: 10000,
        step: 0.01,
        derived: true,
      }),
      tVar(),
      prob('P', 'P', 'p-value', { derived: true }),
      alphaVar,
    ],
    ...rels(
      degreesOfFreedom('df', 'n'),
      derive(
        'SE = s ÷ √n',
        '{E} = {s} ÷ √{n}',
        'E',
        ['s', 'n'],
        (v) => div(v.s!, Math.sqrt(v.n!)),
        '{s} ÷ √{n}',
        'The sample’s s stands in for σ: divide it by the root of n.',
      ),
      rel(
        't = (x̄ − μ₀) ÷ SE',
        '{t} = ({x} − {m}) ÷ {E}',
        ['t', 'x', 'm', 'E'],
        (v) => v.t! * v.E! - (v.x! - v.m!),
        {
          t: [
            (v) => div(v.x! - v.m!, v.E!),
            '({x} − {m}) ÷ {E}',
            'How many standard errors x̄ is from the value H₀ claims.',
          ],
          x: [
            (v) => v.m! + v.t! * v.E!,
            '{m} + {t} × {E}',
            'Start at the H₀ value and go t standard errors.',
          ],
        },
      ),
      decided(tTwoTail('P', 't', 'df')),
    ),
    standalone: { vars: ['a'], why: ALPHA_WHY },
    example: {
      m: 500,
      s: 8,
      n: 16,
      x: 496,
      df: 15,
      E: 2,
      t: -2,
      P: 2 * (1 - tCdf(2, 15)),
      a: 0.05,
    },
    startWith: ['m', 's', 'n', 'x', 'a'],
    unitSystems: ['metric'],
    representation: {
      kind: 'normalCurve',
      mean: 'm',
      sd: 'E',
      axis: 'Sample mean x̄ (g) if H₀ is true',
      mark: { x: 'x' },
      fixed: true,
    },
  },
  {
    id: 'm.12.hypothesis-testing~two-sample',
    title: 'Two-sample t-test for means',
    use: 'Use this for “Do two groups have different means?” from two independent samples.',
    assumptions: [
      'Two independent random samples, or two groups assigned at random; H₀: μ₁ = μ₂, Hₐ: μ₁ ≠ μ₂.',
      'The statistic follows a t curve; by hand, df is the smaller sample size minus 1 (a safe, low choice).',
      'With random assignment, a significant difference is evidence the treatment caused it.',
    ],
    variables: [
      V('x1', 'x̄₁', 'Mean of sample 1', { unit: 'cm', min: -10000, max: 10000, step: 0.1 }),
      V('s1', 's₁', 'Standard deviation 1', { unit: 'cm', min: 0.01, max: 10000, step: 0.1 }),
      V('n1', 'n₁', 'Size of sample 1', { integer: true, min: 2, max: 1000 }),
      V('x2', 'x̄₂', 'Mean of sample 2', { unit: 'cm', min: -10000, max: 10000, step: 0.1 }),
      V('s2', 's₂', 'Standard deviation 2', { unit: 'cm', min: 0.01, max: 10000, step: 0.1 }),
      V('n2', 'n₂', 'Size of sample 2', { integer: true, min: 2, max: 1000 }),
      V('d', 'd', 'Difference of the means, x̄₁ − x̄₂', {
        unit: 'cm',
        min: -20000,
        max: 20000,
        step: 0.1,
        derived: true,
      }),
      V('E', 'SE', 'Standard error of d', {
        unit: 'cm',
        min: 0.0001,
        max: 10000,
        step: 0.01,
        derived: true,
      }),
      V('df', 'df', 'Degrees of freedom', { integer: true, min: 1, max: 999, derived: true }),
      tVar(),
      prob('P', 'P', 'p-value', { derived: true }),
      alphaVar,
    ],
    ...rels(
      derive(
        'd = x̄₁ − x̄₂',
        '{d} = {x1} − {x2}',
        'd',
        ['x1', 'x2'],
        (v) => v.x1! - v.x2!,
        '{x1} − {x2}',
        'The difference the samples show.',
      ),
      derive(
        'SE = √(s₁²/n₁ + s₂²/n₂)',
        '{E} = √({s1}² ÷ {n1} + {s2}² ÷ {n2})',
        'E',
        ['s1', 'n1', 's2', 'n2'],
        (v) => Math.sqrt(v.s1! ** 2 / v.n1! + v.s2! ** 2 / v.n2!),
        '√({s1}² ÷ {n1} + {s2}² ÷ {n2})',
        'The variances of two independent means add; the root gives the spread of the difference.',
      ),
      withCheck(
        derive(
          'df = smaller n − 1',
          '{df} = min({n1}, {n2}) − 1',
          'df',
          ['n1', 'n2'],
          (v) => Math.min(v.n1!, v.n2!) - 1,
          (v: Values) => (v.n1! <= v.n2! ? '{n1} − 1' : '{n2} − 1'),
          'Use one less than the smaller sample: fewer degrees of freedom, a wider curve, a safe p-value.',
        ),
        (v) => `${fmt(v.df!)} = ${fmt(Math.min(v.n1!, v.n2!))} − 1`,
      ),
      rel('t = d ÷ SE', '{t} = {d} ÷ {E}', ['t', 'd', 'E'], (v) => v.t! * v.E! - v.d!, {
        t: [
          (v) => div(v.d!, v.E!),
          '{d} ÷ {E}',
          'H₀ says the difference is 0: count how many standard errors it is from 0.',
        ],
      }),
      decided(tTwoTail('P', 't', 'df')),
    ),
    standalone: { vars: ['a'], why: ALPHA_WHY },
    example: {
      x1: 52,
      s1: 6,
      n1: 36,
      x2: 49,
      s2: 6,
      n2: 36,
      d: 3,
      E: Math.SQRT2,
      df: 35,
      t: 3 / Math.SQRT2,
      P: 2 * (1 - tCdf(3 / Math.SQRT2, 35)),
      a: 0.05,
    },
    startWith: ['x1', 's1', 'n1', 'x2', 's2', 'n2', 'a'],
    unitSystems: ['metric'],
    representation: {
      kind: 'normalCurve',
      mean: 0,
      sd: 'E',
      axis: 'Difference x̄₁ − x̄₂ (cm) if H₀ is true',
      mark: { x: 'd' },
      fixed: true,
    },
  },

  // ── m.12.confidence-intervals (S-IC.4) ──
  {
    id: 'm.12.confidence-intervals',
    assumptions: [
      'A random sample; σ is known (with σ unknown a t interval is used instead).',
      'x̄ is close to normal: the population is normal or n ≥ 30.',
      'The interval estimates the population mean μ, not where single values fall.',
    ],
    variables: [
      V('x', 'x̄', 'Sample mean', { min: -1000000, max: 1000000, step: 0.1 }),
      V('s', 'σ', 'Population standard deviation', { min: 0.001, max: 100000, step: 0.1 }),
      V('n', 'n', 'Sample size', { integer: true, min: 2, max: 1000000 }),
      V('C', 'C', 'Confidence level', {
        allowed: [0.9, 0.95, 0.99],
        min: 0.9,
        max: 0.99,
        multipleOf: 0.01,
      }),
      V('z', 'z⋆', 'Critical value', { min: 0.1, max: 4, step: 0.001, derived: true }),
      V('SE', 'SE', 'Standard error', { min: 0.000001, max: 100000, step: 0.01 }),
      V('E', 'E', 'Margin of error', { min: 0.000001, max: 1000000, step: 0.01 }),
      V('lo', 'L', 'Lower end', { min: -1000000, max: 1000000, step: 0.01 }),
      V('hi', 'U', 'Upper end', { min: -1000000, max: 1000000, step: 0.01 }),
    ],
    ...rels(
      critical,
      seMean('SE', 's', 'n'),
      margin,
      end('lo', 'x', 'E', -1),
      end('hi', 'x', 'E', 1),
      ordered,
    ),
    example: {
      x: 52,
      s: 8,
      n: 64,
      C: 0.95,
      z: invPhi(0.975),
      SE: 1,
      E: invPhi(0.975),
      lo: 52 - invPhi(0.975),
      hi: 52 + invPhi(0.975),
    },
    startWith: ['x', 's', 'n', 'C'],
    equation: '{x} ± {z} × {s}/√{n}',
    representation: {
      kind: 'normalCurve',
      mean: 'x',
      sd: 'SE',
      axis: 'Sample mean x̄',
      interval: { center: 'x', margin: 'E', level: 'C' },
      fixed: true,
    },
  },
  {
    id: 'm.12.confidence-intervals~t-interval',
    title: 'Confidence interval for a mean, σ unknown',
    use: 'Use this for “10 plants average 52 cm with s = 8 cm. Find a 95% confidence interval for μ.”',
    assumptions: [
      'σ is unknown, so the sample’s s stands in for it and t⋆ replaces z⋆, with df = n − 1.',
      't⋆ is larger than z⋆ for small samples, so the interval is wider; they agree as n grows.',
      'A random sample from a population close to normal (or n ≥ 30).',
    ],
    variables: [
      V('x', 'x̄', 'Sample mean', { min: -1000000, max: 1000000, step: 0.1 }),
      V('s', 's', 'Sample standard deviation', { min: 0.001, max: 100000, step: 0.1 }),
      V('n', 'n', 'Sample size', { integer: true, min: 2, max: 1000 }),
      V('C', 'C', 'Confidence level', {
        allowed: [0.9, 0.95, 0.99],
        min: 0.9,
        max: 0.99,
        multipleOf: 0.01,
      }),
      V('df', 'df', 'Degrees of freedom', { integer: true, min: 1, max: 999, derived: true }),
      V('ts', 't⋆', 'Critical value', { min: 0.1, max: 700, step: 0.001, derived: true }),
      V('SE', 'SE', 'Standard error', { min: 0.000001, max: 100000, step: 0.01, derived: true }),
      V('E', 'E', 'Margin of error', { min: 0.000001, max: 1000000, step: 0.01 }),
      V('lo', 'L', 'Lower end', { min: -1000000, max: 1000000, step: 0.01 }),
      V('hi', 'U', 'Upper end', { min: -1000000, max: 1000000, step: 0.01 }),
    ],
    ...rels(
      degreesOfFreedom('df', 'n'),
      tCritical,
      derive(
        'SE = s ÷ √n',
        '{SE} = {s} ÷ √{n}',
        'SE',
        ['s', 'n'],
        (v) => div(v.s!, Math.sqrt(v.n!)),
        '{s} ÷ √{n}',
        'The sample’s s stands in for σ: divide it by the root of n.',
      ),
      rel('E = t⋆ × SE', '{E} = {ts} × {SE}', ['E', 'ts', 'SE'], (v) => v.E! - v.ts! * v.SE!, {
        E: [(v) => v.ts! * v.SE!, '{ts} × {SE}', 'The margin of error is t⋆ standard errors.'],
      }),
      end('lo', 'x', 'E', -1),
      end('hi', 'x', 'E', 1),
      ordered,
    ),
    example: {
      x: 52,
      s: 8,
      n: 10,
      C: 0.95,
      df: 9,
      ts: tStar(0.95, 9),
      SE: 8 / Math.sqrt(10),
      E: (tStar(0.95, 9) * 8) / Math.sqrt(10),
      lo: 52 - (tStar(0.95, 9) * 8) / Math.sqrt(10),
      hi: 52 + (tStar(0.95, 9) * 8) / Math.sqrt(10),
    },
    startWith: ['x', 's', 'n', 'C'],
    equation: '{x} ± {ts} × {s}/√{n}',
    representation: {
      kind: 'normalCurve',
      mean: 'x',
      sd: 'SE',
      axis: 'Sample mean x̄',
      interval: { center: 'x', margin: 'E' },
      fixed: true,
    },
  },
  {
    id: 'm.12.confidence-intervals~proportion',
    title: 'Confidence interval for a proportion',
    use: 'Use this for “240 of 400 people said yes. Find a 95% confidence interval for p.”',
    assumptions: [
      'A random sample with at least 10 successes and 10 failures, so p̂ is close to normal.',
      'The standard error uses p̂, since the true p is what the interval estimates.',
      'The interval estimates the population proportion p.',
    ],
    variables: [
      V('k', 'k', 'Successes in the sample', { integer: true, min: 0, max: 1000000 }),
      V('n', 'n', 'Sample size', { integer: true, min: 1, max: 1000000 }),
      prob('p', 'p̂', 'Sample proportion', { derived: true }),
      V('C', 'C', 'Confidence level', {
        allowed: [0.9, 0.95, 0.99],
        min: 0.9,
        max: 0.99,
        multipleOf: 0.01,
      }),
      V('z', 'z⋆', 'Critical value', { min: 0.1, max: 4, step: 0.001, derived: true }),
      V('SE', 'SE', 'Standard error', { min: 0.000001, max: 1, step: 0.0001, derived: true }),
      V('E', 'E', 'Margin of error', { min: 0.000001, max: 4, step: 0.0001 }),
      V('lo', 'L', 'Lower end', { min: -4, max: 5, step: 0.0001 }),
      V('hi', 'U', 'Upper end', { min: -4, max: 5, step: 0.0001 }),
    ],
    ...rels(
      limit(
        'k ≥ 10, n − k ≥ 10',
        'At least 10 successes and 10 failures: {k} of {n}',
        ['k', 'n'],
        (v) => v.k! >= 10 && v.n! - v.k! >= 10,
        'The interval needs at least 10 successes and 10 failures in the sample.',
      ),
      proportion('p', 'k', 'n'),
      critical,
      seProportion(
        'SE',
        'p',
        'n',
        'The spread of p̂ from sample to sample, estimated with p̂ itself.',
      ),
      margin,
      end('lo', 'p', 'E', -1),
      end('hi', 'p', 'E', 1),
      ordered,
    ),
    example: {
      k: 240,
      n: 400,
      p: 0.6,
      C: 0.95,
      z: invPhi(0.975),
      SE: Math.sqrt(0.0006),
      E: invPhi(0.975) * Math.sqrt(0.0006),
      lo: 0.6 - invPhi(0.975) * Math.sqrt(0.0006),
      hi: 0.6 + invPhi(0.975) * Math.sqrt(0.0006),
    },
    startWith: ['k', 'n', 'C'],
    representation: {
      kind: 'normalCurve',
      mean: 'p',
      sd: 'SE',
      axis: 'Sample proportion p̂',
      interval: { center: 'p', margin: 'E', level: 'C' },
      fixed: true,
    },
  },
  {
    id: 'm.12.confidence-intervals~sample-size',
    title: 'Sample size for a margin of error',
    use: 'Use this for “How many people must be asked for a 95% margin of 3 points?”',
    assumptions: [
      'The margin is E = z⋆√(p(1 − p) ÷ n); solve it for n.',
      'With no earlier estimate, use p = 0.5: it gives the largest n, so the margin is met whatever p is.',
      'Round n up: rounding down would make the margin a little too wide.',
    ],
    variables: [
      V('C', 'C', 'Confidence level', {
        allowed: [0.9, 0.95, 0.99],
        min: 0.9,
        max: 0.99,
        multipleOf: 0.01,
      }),
      V('z', 'z⋆', 'Critical value', { min: 0.1, max: 4, step: 0.001, derived: true }),
      V('p', 'p', 'Guess for the proportion', { min: 0.01, max: 0.99, step: 0.01 }),
      V('E', 'E', 'Margin of error wanted', { min: 0.001, max: 0.5, step: 0.001 }),
      V('n', 'n', 'Sample size needed', { integer: true, min: 1, max: 10000000, derived: true }),
      V('SE', 'SE', 'Standard error with that n', {
        min: 0.00001,
        max: 1,
        step: 0.0001,
        derived: true,
      }),
    ],
    ...rels(
      critical,
      withStep(
        derive(
          'n = ⌈z⋆² × p(1 − p) ÷ E²⌉',
          '{n} = ⌈{z}² × {p} × (1 − {p}) ÷ {E}²⌉',
          'n',
          ['z', 'p', 'E'],
          (v) => Math.ceil(exact((v.z! ** 2 * v.p! * (1 - v.p!)) / v.E! ** 2)),
          '⌈{z}² × {p} × (1 − {p}) ÷ {E}²⌉',
          'Square E = z⋆√(p(1 − p) ÷ n) and solve for n, then round up to a whole person.',
        ),
        'n',
        {
          // The unrounded n first: rounding it up is the lesson.
          work: (v) => [
            `${fmt(v.z!)}² × ${fmt(v.p!)} × ${fmt(1 - v.p!)} ÷ ${fmt(v.E!)}² = ${fmt(
              (v.z! ** 2 * v.p! * (1 - v.p!)) / v.E! ** 2,
            )}, rounded up to ${fmt(v.n!)}`,
          ],
        },
      ),
      derive(
        'SE = √(p(1 − p) ÷ n)',
        '{SE} = √({p} × (1 − {p}) ÷ {n})',
        'SE',
        ['p', 'n'],
        (v) => Math.sqrt((v.p! * (1 - v.p!)) / v.n!),
        '√({p} × (1 − {p}) ÷ {n})',
        'The standard error with that many people: z⋆ standard errors fit within the margin.',
      ),
    ),
    example: {
      C: 0.95,
      z: invPhi(0.975),
      p: 0.5,
      E: 0.03,
      n: 1068,
      SE: Math.sqrt(0.25 / 1068),
    },
    startWith: ['E', 'C', 'p'],
    representation: {
      kind: 'normalCurve',
      mean: 'p',
      sd: 'SE',
      axis: 'Sample proportion p̂',
      interval: { center: 'p', margin: 'E' },
      fixed: true,
    },
  },
  {
    id: 'm.12.confidence-intervals~capture',
    title: 'What “95% confident” means',
    use: 'Use this for “What does it mean to be 95% confident?”: 100 samples, 100 intervals.',
    assumptions: [
      'The level is how often the method captures μ over many samples.',
      'Any one interval either captures μ or doesn’t; 95% is not the chance for that one.',
      'The picture draws 100 random samples of n and the interval from each.',
    ],
    variables: [
      V('C', 'C', 'Confidence level', {
        allowed: [0.9, 0.95, 0.99],
        min: 0.9,
        max: 0.99,
        multipleOf: 0.01,
      }),
      V('n', 'n', 'Sample size', { integer: true, min: 2, max: 400 }),
      V('K', 'K', 'Intervals expected to capture μ, of 100', {
        min: 0,
        max: 100,
        step: 0.1,
        derived: true,
      }),
    ],
    ...rels(
      derive(
        'K = 100 × C',
        '{K} = 100 × {C}',
        'K',
        ['C'],
        (v) => 100 * v.C!,
        '100 × {C}',
        'Over many samples the share C of intervals capture μ, so expect C of the 100.',
      ),
    ),
    standalone: {
      vars: ['n'],
      why: 'The sample size sets how wide each interval is, not how many of them capture μ.',
    },
    example: { C: 0.95, n: 25, K: 95 },
    startWith: ['C', 'n'],
    representation: {
      kind: 'normalCurve',
      mean: 50,
      sd: 10,
      axis: 'Sample mean x̄',
      intervals: { count: 100, n: 'n', level: 'C' },
    },
  },

  // ── m.12.sampling-distributions (S-IC.1, S-IC.4) ──
  {
    id: 'm.12.sampling-distributions',
    assumptions: [
      'The sample means x̄ center on the population mean μ and spread by σ ÷ √n.',
      'x̄ is close to normal when the population is normal or n ≥ 30 (the central limit theorem).',
      'Samples are random and less than 10% of the population.',
    ],
    variables: [
      V('m', 'μ', 'Population mean', { unit: 'cm', min: 0.1, max: 100000, step: 0.5 }),
      V('s', 'σ', 'Population standard deviation', {
        unit: 'cm',
        min: 0.01,
        max: 10000,
        step: 0.1,
      }),
      V('n', 'n', 'Sample size', { integer: true, min: 2, max: 1000 }),
      V('E', 'SE', 'Standard error of x̄', { unit: 'cm', min: 0.0001, max: 10000, step: 0.01 }),
      V('x', 'x̄', 'A sample mean', { unit: 'cm', min: 0.1, max: 100000, step: 0.1 }),
      V('z', 'z', 'z-score of x̄', { min: -50, max: 50, step: 0.01 }),
      prob('P', 'P', 'Chance the sample mean is at most x̄'),
    ],
    ...rels(
      seMean('E', 's', 'n'),
      zScore('z', 'x', 'm', 'E', [
        'How many standard errors x̄ is from μ.',
        'Start at μ and go z standard errors.',
      ]),
      withStep(
        leftTail('P', 'z', 'Φ(z) is the area under the standard normal curve left of z.'),
        'P',
        { note: (v) => complement(v.P, 'more than x̄') },
      ),
    ),
    example: { m: 170, s: 10, n: 25, E: 2, x: 173, z: 1.5, P: Phi(1.5) },
    startWith: ['m', 's', 'n', 'x'],
    unitSystems: ['metric'],
    representation: {
      kind: 'normalCurve',
      mean: 'm',
      sd: 's',
      axis: 'Height (cm)',
      sample: { n: 'n', se: 'E' },
      shade: { to: 'x', area: 'P' },
      fixed: true,
    },
  },
  {
    id: 'm.12.sampling-distributions~proportion',
    title: 'Sampling distribution of a proportion',
    use: 'Use this for “40% of voters agree. In a sample of 150, what is P(p̂ > 0.46)?”',
    assumptions: [
      'The sample proportions p̂ center on the population proportion p.',
      'They spread by √(p(1 − p) ÷ n) and are close to normal when np ≥ 10 and n(1 − p) ≥ 10.',
      'Samples are random and less than 10% of the population.',
    ],
    variables: [
      V('p', 'p', 'Population proportion', { min: 0.01, max: 0.99, step: 0.01 }),
      V('n', 'n', 'Sample size', { integer: true, min: 2, max: 100000 }),
      V('E', 'SE', 'Standard error of p̂', { min: 0.00001, max: 1, step: 0.0001 }),
      V('x', 'p̂', 'A sample proportion', { min: 0, max: 1, step: 0.01 }),
      V('z', 'z', 'z-score of p̂', { min: -50, max: 50, step: 0.01 }),
      prob('P', 'P', 'Chance the sample proportion is more than p̂'),
    ],
    ...rels(
      seProportion('E', 'p', 'n', 'Proportions of n people spread by √(p(1 − p) ÷ n).'),
      zScore('z', 'x', 'p', 'E', [
        'How many standard errors p̂ is from p.',
        'Start at p and go z standard errors.',
      ]),
      withStep(rightTail('P', 'z', 'The whole area is 1; take away the area left of z.'), 'P', {
        note: (v) => complement(v.P, 'at most p̂'),
      }),
    ),
    example: { p: 0.4, n: 150, E: 0.04, x: 0.46, z: 1.5, P: 1 - Phi(1.5) },
    startWith: ['p', 'n', 'x'],
    representation: {
      kind: 'normalCurve',
      mean: 'p',
      sd: 'E',
      axis: 'Sample proportion p̂',
      shade: { from: 'x', area: 'P' },
      fixed: true,
    },
  },
  {
    id: 'm.12.sampling-distributions~counts',
    title: 'Mean and spread of a binomial count',
    use: 'Use this for “In 40 trials with p = 0.25, find the mean and standard deviation of the count” (up to 40 trials).',
    assumptions: [
      'n independent trials, each a success with the same chance p; X counts the successes.',
      'X has mean np and standard deviation √(np(1 − p)).',
      'X is close to normal when np ≥ 10 and n(1 − p) ≥ 10.',
    ],
    variables: [
      V('n', 'n', 'Trials', { integer: true, min: 1, max: 40 }),
      V('p', 'p', 'Chance of success', { min: 0.01, max: 0.99, step: 0.01 }),
      V('M', 'μ', 'Mean count', { min: 0, max: 40, step: 0.01 }),
      V('S', 'σ', 'Standard deviation of the count', {
        min: 0,
        max: 10,
        step: 0.0001,
        derived: true,
      }),
    ],
    ...rels(
      rel('μ = np', '{M} = {n} × {p}', ['M', 'n', 'p'], (v) => v.M! - v.n! * v.p!, {
        M: [(v) => v.n! * v.p!, '{n} × {p}', 'On average, the share p of the n trials succeed.'],
        p: [(v) => div(v.M!, v.n!), '{M} ÷ {n}', 'The mean count per trial.'],
      }),
      derive(
        'σ = √(np(1 − p))',
        '{S} = √({n} × {p} × (1 − {p}))',
        'S',
        ['n', 'p'],
        (v) => Math.sqrt(v.n! * v.p! * (1 - v.p!)),
        '√({n} × {p} × (1 − {p}))',
        'Each trial adds p(1 − p) to the variance; the root is the spread of the count.',
      ),
    ),
    example: { n: 40, p: 0.25, M: 10, S: Math.sqrt(7.5) },
    startWith: ['n', 'p'],
    representation: {
      kind: 'histogram',
      binomial: { n: 'n', p: 'p', mean: 'M', sd: 'S' },
      axis: 'Successes',
    },
  },

  // ── m.12.chi-square (AP Statistics unit 8) ──
  {
    id: 'm.12.chi-square',
    assumptions: [
      'Use counts, not percents; every expected count n × p should be at least 5.',
      'H₀: the shares are p₁, p₂ and p₃; df = categories − 1 = 2.',
      'A large X² (a small p-value) means the counts don’t fit the shares.',
    ],
    variables: [
      V('O1', 'O₁', 'Red flowers counted', { integer: true, min: 0, max: 100000 }),
      V('O2', 'O₂', 'Pink flowers counted', { integer: true, min: 0, max: 100000 }),
      V('O3', 'O₃', 'White flowers counted', { integer: true, min: 0, max: 100000 }),
      V('p1', 'p₁', 'Expected share of red', { min: 0.01, max: 0.98, step: 0.01 }),
      V('p2', 'p₂', 'Expected share of pink', { min: 0.01, max: 0.98, step: 0.01 }),
      V('p3', 'p₃', 'Expected share of white', {
        min: 0.01,
        max: 0.98,
        step: 0.01,
        derived: true,
      }),
      V('n', 'n', 'Flowers in all', { integer: true, min: 1, max: 300000, derived: true }),
      V('X', 'X²', 'Chi-square statistic', { min: 0, max: 10000000, step: 0.01, derived: true }),
      prob('P', 'P', 'p-value', { derived: true }),
      alphaVar,
    ],
    ...rels(
      derive(
        'p₃ = 1 − p₁ − p₂',
        '{p3} = 1 − {p1} − {p2}',
        'p3',
        ['p1', 'p2'],
        (v) => 1 - v.p1! - v.p2!,
        '1 − {p1} − {p2}',
        'The three shares make up the whole, 1.',
      ),
      derive(
        'n = O₁ + O₂ + O₃',
        '{n} = {O1} + {O2} + {O3}',
        'n',
        ['O1', 'O2', 'O3'],
        (v) => v.O1! + v.O2! + v.O3!,
        '{O1} + {O2} + {O3}',
        'Add the counts for the size of the sample.',
      ),
      withStep(
        derive(
          'X² = Σ(O − E)² ÷ E',
          '{X} = ({O1} − {n} × {p1})² ÷ ({n} × {p1}) + ({O2} − {n} × {p2})² ÷ ({n} × {p2}) + ({O3} − {n} × {p3})² ÷ ({n} × {p3})',
          'X',
          ['O1', 'O2', 'O3', 'n', 'p1', 'p2', 'p3'],
          (v) =>
            (v.O1! - v.n! * v.p1!) ** 2 / (v.n! * v.p1!) +
            (v.O2! - v.n! * v.p2!) ** 2 / (v.n! * v.p2!) +
            (v.O3! - v.n! * v.p3!) ** 2 / (v.n! * v.p3!),
          '({O1} − {n} × {p1})² ÷ ({n} × {p1}) + ({O2} − {n} × {p2})² ÷ ({n} × {p2}) + ({O3} − {n} × {p3})² ÷ ({n} × {p3})',
          'Each expected count is E = n × p; add (O − E)² ÷ E over the three categories.',
        ),
        'X',
        {
          // The expected counts come first, before the formula that uses them.
          how: (v) =>
            `The expected counts are E = n × p: ${[v.p1!, v.p2!, v.p3!]
              .map((p) => fmt(v.n! * p))
              .join(', ')}. Add (O − E)² ÷ E over the three categories.`,
          work: (v) => {
            const E = [v.p1!, v.p2!, v.p3!].map((p) => v.n! * p);
            const O = [v.O1!, v.O2!, v.O3!];
            const terms = O.map((o, i) => (o - E[i]!) ** 2 / E[i]!);
            return [`${terms.map(fmt).join(' + ')} = ${fmt(terms.reduce((t, x) => t + x, 0))}`];
          },
        },
      ),
      decided(chiTail2),
    ),
    standalone: { vars: ['a'], why: ALPHA_WHY },
    example: {
      O1: 22,
      O2: 54,
      O3: 24,
      p1: 0.25,
      p2: 0.5,
      p3: 0.25,
      n: 100,
      X: 0.72,
      P: Math.exp(-0.36),
      a: 0.05,
    },
    startWith: ['O1', 'O2', 'O3', 'p1', 'p2', 'a'],
    representation: {
      kind: 'normalCurve',
      chiSquare: { df: 2, stat: 'X', p: 'P', alpha: 'a' },
    },
  },
  {
    id: 'm.12.chi-square~five-categories',
    title: 'Goodness of fit with five categories',
    use: 'Use this for “Do 200 lunch choices fit the shares 30%, 25%, 20%, 15% and 10%?”',
    assumptions: [
      'H₀: the five shares are p₁ to p₅; they add to 1, so p₅ is what is left.',
      'Every expected count n × p should be at least 5; df = 5 − 1 = 4.',
      'A large X² (a small p-value) means the counts don’t fit the shares.',
    ],
    variables: [
      ...FIVE.map((i) =>
        V(`O${i}`, `O${SUB[i]}`, `Count for choice ${i}`, {
          integer: true,
          min: 0,
          max: 100000,
          group: 'O',
        }),
      ),
      ...FIVE.slice(0, 4).map((i) =>
        V(`p${i}`, `p${SUB[i]}`, `Expected share of choice ${i}`, {
          min: 0.01,
          max: 0.96,
          step: 0.01,
          group: 'p',
        }),
      ),
      V('p5', 'p₅', 'Expected share of choice 5', {
        min: 0.01,
        max: 0.96,
        step: 0.01,
        derived: true,
      }),
      V('n', 'n', 'Choices in all', { integer: true, min: 1, max: 500000, derived: true }),
      V('X', 'X²', 'Chi-square statistic', { min: 0, max: 10000000, step: 0.01, derived: true }),
      prob('P', 'P', 'p-value', { derived: true }),
      alphaVar,
    ],
    ...rels(
      derive(
        'p₅ = 1 − p₁ − p₂ − p₃ − p₄',
        '{p5} = 1 − {p1} − {p2} − {p3} − {p4}',
        'p5',
        ['p1', 'p2', 'p3', 'p4'],
        (v) => 1 - v.p1! - v.p2! - v.p3! - v.p4!,
        '1 − {p1} − {p2} − {p3} − {p4}',
        'The five shares make up the whole, 1.',
      ),
      derive(
        'n = O₁ + … + O₅',
        '{n} = {O1} + {O2} + {O3} + {O4} + {O5}',
        'n',
        FIVE.map((i) => `O${i}`),
        (v) => FIVE.reduce((t, i) => t + v[`O${i}`]!, 0),
        '{O1} + {O2} + {O3} + {O4} + {O5}',
        'Add the counts for the size of the sample.',
      ),
      withStep(
        derive(
          'X² = Σ(O − E)² ÷ E, 5 categories',
          `{X} = ${FIVE_TERMS}`,
          'X',
          ['n', ...FIVE.flatMap((i) => [`O${i}`, `p${i}`])],
          (v) =>
            FIVE.reduce(
              (t, i) => t + (v[`O${i}`]! - v.n! * v[`p${i}`]!) ** 2 / (v.n! * v[`p${i}`]!),
              0,
            ),
          FIVE_TERMS,
          'Each expected count is E = n × p; add (O − E)² ÷ E over the five choices.',
        ),
        'X',
        {
          how: (v) =>
            `The expected counts are E = n × p: ${FIVE.map((i) => fmt(v.n! * v[`p${i}`]!)).join(
              ', ',
            )}. Add (O − E)² ÷ E over the five choices.`,
          work: (v) => {
            const E = FIVE.map((i) => v.n! * v[`p${i}`]!);
            const terms = FIVE.map((i, k) => (v[`O${i}`]! - E[k]!) ** 2 / E[k]!);
            return [`${terms.map(fmt).join(' + ')} = ${fmt(terms.reduce((t, x) => t + x, 0))}`];
          },
        },
      ),
      decided(
        derive(
          'P = χ²cdf(X, ∞, 4)',
          '{P} = χ²cdf({X}, ∞, 4)',
          'P',
          ['X'],
          (v) => 1 - chiCdf(v.X!, 4),
          'χ²cdf({X}, ∞, 4)',
          'The area under the chi-square curve with df 4 past the statistic.',
        ),
      ),
    ),
    standalone: { vars: ['a'], why: ALPHA_WHY },
    example: {
      O1: 66,
      O2: 44,
      O3: 40,
      O4: 36,
      O5: 14,
      p1: 0.3,
      p2: 0.25,
      p3: 0.2,
      p4: 0.15,
      p5: 0.1,
      n: 200,
      X: 4.32,
      P: 1 - chiCdf(4.32, 4),
      a: 0.05,
    },
    startWith: ['O1', 'O2', 'O3', 'O4', 'O5', 'p1', 'p2', 'p3', 'p4', 'a'],
    representation: {
      kind: 'normalCurve',
      chiSquare: { df: 4, stat: 'X', p: 'P', alpha: 'a' },
    },
  },
  {
    id: 'm.12.chi-square~independence',
    title: 'Chi-square test of independence',
    use: 'Use this for “Is the way students get to school independent of their grade?” from a 2 × 3 table.',
    assumptions: [
      'H₀: the two variables are independent; each cell then expects row total × column total ÷ grand total.',
      'Every expected count should be at least 5; df = (2 − 1)(3 − 1) = 2.',
      'A test of homogeneity (do two groups share one distribution?) uses the same arithmetic.',
    ],
    variables: [
      V('a', 'a', 'Grade 11, walk', { integer: true, min: 0, max: 100000 }),
      V('b', 'b', 'Grade 11, bus', { integer: true, min: 0, max: 100000 }),
      V('c', 'c', 'Grade 11, car', { integer: true, min: 0, max: 100000 }),
      V('d', 'd', 'Grade 12, walk', { integer: true, min: 0, max: 100000 }),
      V('e', 'e', 'Grade 12, bus', { integer: true, min: 0, max: 100000 }),
      V('f', 'f', 'Grade 12, car', { integer: true, min: 0, max: 100000 }),
      V('X', 'X²', 'Chi-square statistic', { min: 0, max: 10000000, step: 0.01, derived: true }),
      prob('P', 'P', 'p-value', { derived: true }),
      alphaOf('al'),
    ],
    ...rels(
      {
        relation: {
          id: 'X² = Σ(O − E)² ÷ E',
          display: '{X} = Σ(O − E)² ÷ E over the cells {a}, {b}, {c}, {d}, {e}, {f}',
          vars: ['X', ...ALL_CELLS],
          residual: (v) => v.X! - (chiOfTable(v) ?? NaN),
          solve: {
            X: (v) => {
              const x = chiOfTable(v);
              return x === undefined ? undefined : exact(x);
            },
            ...Object.fromEntries(ALL_CELLS.map((id) => [id, () => undefined])),
          },
          check: (v) =>
            `${expectedCounts(v)
              .map((c) => `(${fmt(c.O)} − ${fmt(c.E)})² ÷ ${fmt(c.E)}`)
              .join(' + ')} = ${fmt(v.X!)}`,
        },
        steps: {
          X: {
            expr: (v) =>
              expectedCounts(v)
                .map((c) => `({${c.id}} − ${fmt(c.E)})² ÷ ${fmt(c.E)}`)
                .join(' + '),
            how: (v) => {
              const cells = expectedCounts(v);
              const N = cells.reduce((t, c) => t + c.O, 0);
              const row = v.a! + v.b! + v.c!;
              const col = v.a! + v.d!;
              return `Each cell expects row total × column total ÷ grand total; walk, grade 11: ${fmt(row)} × ${fmt(col)} ÷ ${fmt(N)} = ${fmt(cells[0]!.E)}. Row by row they are ${cells.map((c) => fmt(c.E)).join(', ')}.`;
            },
            work: (v) => {
              const terms = expectedCounts(v).map((c) => (c.O - c.E) ** 2 / c.E);
              return [`${terms.map(fmt).join(' + ')} = ${fmt(terms.reduce((t, x) => t + x, 0))}`];
            },
          },
        },
      },
      decided(chiTail2, 'al'),
    ),
    standalone: { vars: ['al'], why: ALPHA_WHY },
    example: {
      a: 20,
      b: 30,
      c: 50,
      d: 30,
      e: 20,
      f: 50,
      X: 4,
      P: Math.exp(-2),
      al: 0.05,
    },
    startWith: ['a', 'b', 'c', 'd', 'e', 'f', 'al'],
    representation: {
      kind: 'table',
      twoWay: {
        rows: ['Grade 11', 'Grade 12'],
        cols: ['Walk', 'Bus', 'Car'],
        cells: [
          ['a', 'b', 'c'],
          ['d', 'e', 'f'],
        ],
        expected: 'independence',
        chiSquare: 'X',
      },
    },
  },
];

// ── Conics ──

const real = (id: string, symbol: string, name: string, min: number, max: number) =>
  V(id, symbol, name, { min, max, step: 0.01 });

const CENTER_WHY = 'The center only places the curve; its shape, c and the rest come from a and b.';

const MATH_12_CONICS: ModuleDef[] = [
  // ── m.12.conics (G-GPE.3) ──
  {
    id: 'm.12.conics',
    assumptions: [
      'a goes with x and b with y: a > b is a wide ellipse, a < b a tall one.',
      'The foci lie on the long axis, c from the center, with c² = a² − b² (the larger square first).',
      'From any point on the ellipse, the distances to the two foci add to the long axis, 2a or 2b.',
    ],
    variables: [
      real('h', 'h', 'Center, x', -100, 100),
      real('k', 'k', 'Center, y', -100, 100),
      real('a', 'a', 'Half-width', 0.5, 20),
      real('b', 'b', 'Half-height', 0.5, 20),
      V('c', 'c', 'Center to each focus', { min: 0, max: 20, step: 0.01, derived: true }),
      V('e', 'e', 'Eccentricity', { min: 0, max: 1, step: 0.0001, derived: true }),
    ],
    ...rels(
      rel(
        'c = √|a² − b²|',
        '{c} = √(|{a}² − {b}²|)',
        ['c', 'a', 'b'],
        (v) => v.c! - Math.sqrt(Math.abs(v.a! ** 2 - v.b! ** 2)),
        {
          c: [
            (v) => Math.sqrt(Math.abs(v.a! ** 2 - v.b! ** 2)),
            (v: Values) => (v.a! >= v.b! ? '√({a}² − {b}²)' : '√({b}² − {a}²)'),
            'The long half-axis squared is c² plus the short one squared: take the smaller square from the larger.',
          ],
        },
      ),
      {
        relation: {
          id: 'e = c ÷ long half-axis',
          display: '{e} = {c} ÷ max({a}, {b})',
          vars: ['e', 'c', 'a', 'b'],
          residual: (v) => v.e! * Math.max(v.a!, v.b!) - v.c!,
          solve: {
            e: (v) => div(v.c!, Math.max(v.a!, v.b!)),
            c: () => undefined,
            a: () => undefined,
            b: () => undefined,
          },
          check: (v) => `${fmt(v.e!)} = ${fmt(v.c!)} ÷ ${fmt(Math.max(v.a!, v.b!))}`,
        },
        steps: {
          e: {
            expr: (v) => (v.a! >= v.b! ? '{c} ÷ {a}' : '{c} ÷ {b}'),
            how: 'Eccentricity is c over the long half-axis: 0 is a circle, near 1 very flat.',
          },
        },
      },
    ),
    standalone: { vars: ['h', 'k'], why: CENTER_WHY },
    example: { h: 1, k: -2, a: 5, b: 3, c: 4, e: 0.8 },
    startWith: ['h', 'k', 'a', 'b'],
    equation: '{(x − {h})²}/{a}^2 + {(y − {k})²}/{b}^2 = 1',
    representation: {
      kind: 'conicGraph',
      conic: 'ellipse',
      h: 'h',
      k: 'k',
      a: 'a',
      b: 'b',
      c: 'c',
    },
  },
  {
    id: 'm.12.conics~parabola',
    title: 'Parabola: focus and directrix',
    use: 'Use this for “Find the focus and directrix of (x − 2)² = 8(y + 1).”',
    assumptions: [
      'In (x − h)² = 4p(y − k), the vertex is (h, k) and the number before (y − k) is 4p.',
      'The focus is p above the vertex and the directrix p below it (p < 0 opens down).',
      'Every point on the parabola is as far from the focus as from the directrix.',
    ],
    variables: [
      real('h', 'h', 'Vertex, x', -100, 100),
      real('k', 'k', 'Vertex, y', -100, 100),
      V('q', '4p', 'Number before (y − k)', { min: -100, max: 100, step: 0.01 }),
      V('p', 'p', 'Vertex to focus', { min: -25, max: 25, step: 0.01, derived: true }),
      real('F', 'F', 'Focus, y', -200, 200),
      real('L', 'L', 'Directrix y =', -200, 200),
      real('x', 'x', 'Point, x', -1000, 1000),
      real('y', 'y', 'Point, y', -100000, 100000),
    ],
    ...rels(
      rel('p = 4p ÷ 4', '{p} = {q} ÷ 4', ['p', 'q'], (v) => 4 * v.p! - v.q!, {
        p: [(v) => v.q! / 4, '{q} ÷ 4', 'The number before (y − k) is 4p: divide it by 4.'],
      }),
      rel('F = k + p', '{F} = {k} + {p}', ['F', 'k', 'p'], (v) => v.F! - v.k! - v.p!, {
        F: [(v) => v.k! + v.p!, '{k} + {p}', 'The focus is p from the vertex, along the axis.'],
      }),
      rel('L = k − p', '{L} = {k} − {p}', ['L', 'k', 'p'], (v) => v.L! - v.k! + v.p!, {
        L: [
          (v) => v.k! - v.p!,
          '{k} − {p}',
          'The directrix is p from the vertex on the other side.',
        ],
      }),
      rel(
        '(x − h)² = 4p(y − k)',
        '({x} − {h})² = {q} × ({y} − {k})',
        ['y', 'x', 'h', 'q', 'k'],
        (v) => (v.x! - v.h!) ** 2 - v.q! * (v.y! - v.k!),
        {
          y: [
            (v) => (v.q === 0 ? undefined : v.k! + (v.x! - v.h!) ** 2 / v.q!),
            '{k} + ({x} − {h})² ÷ {q}',
            'Divide both sides by 4p, then add k.',
          ],
          x: [
            (v) => {
              const r = v.q! * (v.y! - v.k!);
              return r < 0 ? undefined : [v.h! + Math.sqrt(r), v.h! - Math.sqrt(r)];
            },
            '{h} ± √({q} × ({y} − {k}))',
            'Take the square root of both sides (two points share each y), then add h.',
          ],
        },
      ),
    ),
    example: { h: 2, k: -1, q: 8, p: 2, F: 1, L: -3, x: 6, y: 1 },
    startWith: ['x', 'h', 'k', 'q'],
    equation: '(x − {h})² = {q}(y − {k})',
    pictureLabels: ['F', 'L'],
    representation: {
      kind: 'conicGraph',
      conic: 'parabola',
      axis: 'vertical',
      h: 'h',
      k: 'k',
      p: 'p',
      c: 'p',
      point: { x: 'x', y: 'y' },
    },
  },
  {
    id: 'm.12.conics~hyperbola',
    title: 'Hyperbola: foci and asymptotes',
    use: 'Use this for “Find the foci and asymptotes of x²/9 − y²/16 = 1.”',
    assumptions: [
      'The x term is positive, so the hyperbola opens left and right; the vertices are a from the center.',
      'The foci are c from the center, with c² = a² + b².',
      'The asymptotes pass through the center with slopes ±b/a; the branches get closer and closer to them.',
    ],
    variables: [
      real('h', 'h', 'Center, x', -100, 100),
      real('k', 'k', 'Center, y', -100, 100),
      real('a', 'a', 'Center to vertex', 0.5, 20),
      real('b', 'b', 'Half the box’s height', 0.5, 20),
      V('c', 'c', 'Center to each focus', { min: 0, max: 30, step: 0.01, derived: true }),
      V('s', 's', 'Asymptote slope (±)', { min: 0, max: 40, step: 0.0001, derived: true }),
    ],
    ...rels(
      derive(
        'c = √(a² + b²)',
        '{c} = √({a}² + {b}²)',
        'c',
        ['a', 'b'],
        (v) => Math.hypot(v.a!, v.b!),
        '√({a}² + {b}²)',
        'For a hyperbola, c² is the sum of the squares.',
      ),
      derive(
        's = b ÷ a',
        '{s} = {b} ÷ {a}',
        's',
        ['b', 'a'],
        (v) => div(v.b!, v.a!),
        '{b} ÷ {a}',
        'The asymptotes are the diagonals of the a-by-b box: rise b over run a.',
      ),
    ),
    standalone: { vars: ['h', 'k'], why: CENTER_WHY },
    example: { h: 0, k: 0, a: 3, b: 4, c: 5, s: 4 / 3 },
    startWith: ['h', 'k', 'a', 'b'],
    equation: '{(x − {h})²}/{a}^2 − {(y − {k})²}/{b}^2 = 1',
    representation: {
      kind: 'conicGraph',
      conic: 'hyperbola',
      axis: 'horizontal',
      h: 'h',
      k: 'k',
      a: 'a',
      b: 'b',
      c: 'c',
    },
  },
];

// ── Matrices ──

const entry = (id: string, symbol: string, name: string, range = 1000) =>
  V(id, symbol, name, { min: -range, max: range, step: 0.01 });

/** The 3 × 3 determinant expanded along the first row. */
const det3 = (v: Values) =>
  v.a! * (v.e! * v.k! - v.f! * v.h!) -
  v.b! * (v.d! * v.k! - v.f! * v.g!) +
  v.c! * (v.d! * v.h! - v.e! * v.g!);
const DET3 =
  '{a} × ({e} × {k} − {f} × {h}) − {b} × ({d} × {k} − {f} × {g}) + {c} × ({d} × {h} − {e} × {g})';

const MATH_12_MATRICES: ModuleDef[] = [
  // ── m.12.matrices (A-REI.8, A-REI.9, N-VM.6–12) ──
  {
    id: 'm.12.matrices',
    assumptions: [
      'The system x + y + z = d₁, 2x − y + z = d₂, x + 2y − z = d₃ as an augmented matrix; type the right sides.',
      'Each row operation keeps the same solutions; the goal is zeros under the diagonal, then back-substitution.',
      'A row that reads 0 = a number that is not 0 means the system has no solution.',
    ],
    variables: [
      real('d1', 'd₁', 'First right side', -1000, 1000),
      real('d2', 'd₂', 'Second right side', -1000, 1000),
      real('d3', 'd₃', 'Third right side', -1000, 1000),
      real('x', 'x', 'x', -10000, 10000),
      real('y', 'y', 'y', -10000, 10000),
      real('z', 'z', 'z', -10000, 10000),
    ],
    ...rels(
      rel(
        'Row 3: −7z = d₂ − 5d₁ + 3d₃',
        '−7 × {z} = {d2} − 5 × {d1} + 3 × {d3}',
        ['z', 'd1', 'd2', 'd3'],
        (v) => -7 * v.z! - (v.d2! - 5 * v.d1! + 3 * v.d3!),
        {
          z: [
            (v) => (v.d2! - 5 * v.d1! + 3 * v.d3!) / -7,
            '({d2} − 5 × {d1} + 3 × {d3}) ÷ (−7)',
            'After the row operations the last row has only z: divide by −7.',
          ],
          d1: [
            (v) => (v.d2! + 3 * v.d3! + 7 * v.z!) / 5,
            '({d2} + 3 × {d3} + 7 × {z}) ÷ 5',
            'Solve the last row for d₁.',
          ],
          d2: [
            (v) => 5 * v.d1! - 3 * v.d3! - 7 * v.z!,
            '5 × {d1} − 3 × {d3} − 7 × {z}',
            'Solve the last row for d₂.',
          ],
          d3: [
            (v) => (-7 * v.z! - v.d2! + 5 * v.d1!) / 3,
            '(−7 × {z} − {d2} + 5 × {d1}) ÷ 3',
            'Solve the last row for d₃.',
          ],
        },
      ),
      rel(
        'Row 2: y − 2z = d₃ − d₁',
        '{y} − 2 × {z} = {d3} − {d1}',
        ['y', 'z', 'd1', 'd3'],
        (v) => v.y! - 2 * v.z! - (v.d3! - v.d1!),
        {
          y: [
            (v) => v.d3! - v.d1! + 2 * v.z!,
            '{d3} − {d1} + 2 × {z}',
            'Put z into the second row (after the swap) and add 2z to both sides.',
          ],
          z: [
            (v) => (v.y! - v.d3! + v.d1!) / 2,
            '({y} − {d3} + {d1}) ÷ 2',
            'Solve the second row for z.',
          ],
          d3: [
            (v) => v.y! - 2 * v.z! + v.d1!,
            '{y} − 2 × {z} + {d1}',
            'Solve the second row for d₃.',
          ],
        },
      ),
      rel(
        'Row 1: x + y + z = d₁',
        '{x} + {y} + {z} = {d1}',
        ['x', 'y', 'z', 'd1'],
        (v) => v.x! + v.y! + v.z! - v.d1!,
        {
          x: [
            (v) => v.d1! - v.y! - v.z!,
            '{d1} − {y} − {z}',
            'Put y and z into the first row and take them from both sides.',
          ],
          d1: [(v) => v.x! + v.y! + v.z!, '{x} + {y} + {z}', 'Add the three unknowns.'],
          z: [(v) => v.d1! - v.x! - v.y!, '{d1} − {x} − {y}', 'Take x and y from d₁.'],
        },
      ),
    ),
    example: { d1: 6, d2: 3, d3: 2, x: 1, y: 2, z: 3 },
    startWith: ['d1', 'd2', 'd3'],
    representation: {
      kind: 'matrixGrid',
      mode: 'rowReduce',
      system: [
        [1, 1, 1, 'd1'],
        [2, -1, 1, 'd2'],
        [1, 2, -1, 'd3'],
      ],
      steps: [
        { add: 2, from: 1, times: -2 },
        { add: 3, from: 1, times: -1 },
        { swap: [2, 3] },
        { add: 3, from: 2, times: 3 },
        { scale: 3, by: -1 / 7 },
      ],
      solution: ['x', 'y', 'z'],
    },
  },
  {
    id: 'm.12.matrices~multiply',
    title: 'A matrix times a vector',
    use: 'Use this for “Multiply [[2, 1], [3, 4]] by the column (5, −1).”',
    assumptions: [
      'Each row of the matrix times the column gives one entry: across the row, down the column.',
      'The matrix must have as many columns as the vector has rows.',
    ],
    variables: [
      entry('a', 'a', 'Row 1, column 1'),
      entry('b', 'b', 'Row 1, column 2'),
      entry('c', 'c', 'Row 2, column 1'),
      entry('d', 'd', 'Row 2, column 2'),
      entry('x', 'x', 'Vector, top'),
      entry('y', 'y', 'Vector, bottom'),
      entry('p', 'p', 'Answer, top', 2000000),
      entry('q', 'q', 'Answer, bottom', 2000000),
    ],
    ...rels(
      rel(
        'p = ax + by',
        '{p} = {a} × {x} + {b} × {y}',
        ['p', 'a', 'x', 'b', 'y'],
        (v) => v.p! - (v.a! * v.x! + v.b! * v.y!),
        {
          p: [
            (v) => v.a! * v.x! + v.b! * v.y!,
            '{a} × {x} + {b} × {y}',
            'Row 1 times the column: multiply entry by entry, then add.',
          ],
        },
      ),
      rel(
        'q = cx + dy',
        '{q} = {c} × {x} + {d} × {y}',
        ['q', 'c', 'x', 'd', 'y'],
        (v) => v.q! - (v.c! * v.x! + v.d! * v.y!),
        {
          q: [
            (v) => v.c! * v.x! + v.d! * v.y!,
            '{c} × {x} + {d} × {y}',
            'Row 2 times the column: multiply entry by entry, then add.',
          ],
        },
      ),
    ),
    example: { a: 2, b: 1, c: 3, d: 4, x: 5, y: -1, p: 9, q: 11 },
    startWith: ['a', 'b', 'c', 'd', 'x', 'y'],
    equation: '[[{a}, {b}; {c}, {d}]] [[{x}; {y}]] = [[{p}; {q}]]',
    representation: {
      kind: 'matrixGrid',
      mode: 'multiply',
      a: [
        ['a', 'b'],
        ['c', 'd'],
      ],
      b: [['x'], ['y']],
      product: [['p'], ['q']],
    },
  },
  {
    id: 'm.12.matrices~determinant',
    title: 'Determinant of a 3 × 3 matrix',
    use: 'Use this for “Find the determinant of [[2, 0, 1], [1, 3, 2], [1, 1, 4]].”',
    assumptions: [
      'Expand along the first row: each entry times the 2 × 2 determinant left when its row and column are crossed out.',
      'The signs go +, −, + along the row.',
      'D = 0 means the matrix has no inverse and its system has no single solution.',
    ],
    variables: [
      entry('a', 'a', 'Row 1, column 1', 100),
      entry('b', 'b', 'Row 1, column 2', 100),
      entry('c', 'c', 'Row 1, column 3', 100),
      entry('d', 'd', 'Row 2, column 1', 100),
      entry('e', 'e', 'Row 2, column 2', 100),
      entry('f', 'f', 'Row 2, column 3', 100),
      entry('g', 'g', 'Row 3, column 1', 100),
      entry('h', 'h', 'Row 3, column 2', 100),
      entry('k', 'k', 'Row 3, column 3', 100),
      { ...entry('D', 'D', 'Determinant', 10000000), derived: true },
    ],
    ...rels(
      rel(
        'D = a(ek − fh) − b(dk − fg) + c(dh − eg)',
        `{D} = ${DET3}`,
        ['D', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'k'],
        (v) => v.D! - det3(v),
        {
          D: [det3, DET3, 'Each first-row entry times its 2 × 2 minor, with signs +, −, +.'],
        },
      ),
    ),
    example: { a: 2, b: 0, c: 1, d: 1, e: 3, f: 2, g: 1, h: 1, k: 4, D: 18 },
    startWith: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'k'],
    equation: '||{a}, {b}, {c}; {d}, {e}, {f}; {g}, {h}, {k}|| = {D}',
    representation: {
      kind: 'table',
      sweep: 'k',
      output: 'D',
      params: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
      rows: (v: Values) => [-2, -1, 0, 1, 2].map((i) => (v.k ?? 4) + i),
    },
  },
  {
    id: 'm.12.matrices~inverse',
    title: 'Inverse of a 2 × 2 matrix',
    use: 'Use this for “Find the inverse of [[4, 7], [2, 6]].”',
    assumptions: [
      'For A = [[a, b], [c, d]], swap a and d, change the signs of b and c, then divide by D = ad − bc.',
      'A times its inverse is the identity [[1, 0], [0, 1]]: the picture multiplies them.',
      'D = 0 means there is no inverse.',
    ],
    variables: [
      entry('a', 'a', 'A, row 1, column 1'),
      entry('b', 'b', 'A, row 1, column 2'),
      entry('c', 'c', 'A, row 2, column 1'),
      entry('d', 'd', 'A, row 2, column 2'),
      V('D', 'D', 'Determinant ad − bc', {
        min: -2000000,
        max: 2000000,
        step: 0.01,
        derived: true,
      }),
      V('e', 'e', 'A⁻¹, row 1, column 1', {
        min: -1000000,
        max: 1000000,
        step: 0.0001,
        derived: true,
      }),
      V('f', 'f', 'A⁻¹, row 1, column 2', {
        min: -1000000,
        max: 1000000,
        step: 0.0001,
        derived: true,
      }),
      V('g', 'g', 'A⁻¹, row 2, column 1', {
        min: -1000000,
        max: 1000000,
        step: 0.0001,
        derived: true,
      }),
      V('h', 'h', 'A⁻¹, row 2, column 2', {
        min: -1000000,
        max: 1000000,
        step: 0.0001,
        derived: true,
      }),
    ],
    ...rels(
      derive(
        'D = ad − bc',
        '{D} = {a} × {d} − {b} × {c}',
        'D',
        ['a', 'd', 'b', 'c'],
        (v) => v.a! * v.d! - v.b! * v.c!,
        '{a} × {d} − {b} × {c}',
        'Multiply down the main diagonal and take away the other diagonal.',
      ),
      derive(
        'e = d ÷ D',
        '{e} = {d} ÷ {D}',
        'e',
        ['d', 'D'],
        (v) => div(v.d!, v.D!),
        '{d} ÷ {D}',
        'Swap a and d: the top left of the inverse is d over D.',
      ),
      derive(
        'f = −b ÷ D',
        '{f} = −{b} ÷ {D}',
        'f',
        ['b', 'D'],
        (v) => div(-v.b!, v.D!),
        '−{b} ÷ {D}',
        'Change the sign of b, then divide by D.',
      ),
      derive(
        'g = −c ÷ D',
        '{g} = −{c} ÷ {D}',
        'g',
        ['c', 'D'],
        (v) => div(-v.c!, v.D!),
        '−{c} ÷ {D}',
        'Change the sign of c, then divide by D.',
      ),
      derive(
        'h = a ÷ D',
        '{h} = {a} ÷ {D}',
        'h',
        ['a', 'D'],
        (v) => div(v.a!, v.D!),
        '{a} ÷ {D}',
        'Swap a and d: the bottom right of the inverse is a over D.',
      ),
    ),
    example: { a: 4, b: 7, c: 2, d: 6, D: 10, e: 0.6, f: -0.7, g: -0.2, h: 0.4 },
    startWith: ['a', 'b', 'c', 'd'],
    equation: '[[{a}, {b}; {c}, {d}]]^{−1} = [[{e}, {f}; {g}, {h}]]',
    representation: {
      kind: 'matrixGrid',
      mode: 'multiply',
      a: [
        ['a', 'b'],
        ['c', 'd'],
      ],
      b: [
        ['e', 'f'],
        ['g', 'h'],
      ],
    },
  },
  {
    id: 'm.12.matrices~cramer',
    title: 'Cramer’s rule for two equations',
    use: 'Use this for “Solve 2x + 3y = 13 and x − y = −1 by Cramer’s rule.”',
    assumptions: [
      'D is the determinant of the coefficients, ad − bc; it must not be 0.',
      'For x, put the right sides in the x column: x = (pd − bq) ÷ D. For y, in the y column: y = (aq − pc) ÷ D.',
      'The point (x, y) is where the two lines cross.',
    ],
    variables: [
      entry('a', 'a', 'x in the first'),
      entry('b', 'b', 'y in the first'),
      entry('p', 'p', 'Right side of the first'),
      entry('c', 'c', 'x in the second'),
      entry('d', 'd', 'y in the second'),
      entry('q', 'q', 'Right side of the second'),
      V('D', 'D', 'Determinant ad − bc', {
        min: -2000000,
        max: 2000000,
        step: 0.01,
        derived: true,
      }),
      V('x', 'x', 'Solution x', { min: -10000000, max: 10000000, step: 0.0001, derived: true }),
      V('y', 'y', 'Solution y', { min: -10000000, max: 10000000, step: 0.0001, derived: true }),
    ],
    ...rels(
      derive(
        'D = ad − bc',
        '{D} = {a} × {d} − {b} × {c}',
        'D',
        ['a', 'd', 'b', 'c'],
        (v) => v.a! * v.d! - v.b! * v.c!,
        '{a} × {d} − {b} × {c}',
        'The determinant of the coefficients: down the main diagonal, take away the other.',
      ),
      derive(
        'x = (pd − bq) ÷ D',
        '{x} = ({p} × {d} − {b} × {q}) ÷ {D}',
        'x',
        ['p', 'd', 'b', 'q', 'D'],
        (v) => div(v.p! * v.d! - v.b! * v.q!, v.D!),
        '({p} × {d} − {b} × {q}) ÷ {D}',
        'Dx puts the right sides in the x column; divide it by D.',
      ),
      derive(
        'y = (aq − pc) ÷ D',
        '{y} = ({a} × {q} − {p} × {c}) ÷ {D}',
        'y',
        ['a', 'q', 'p', 'c', 'D'],
        (v) => div(v.a! * v.q! - v.p! * v.c!, v.D!),
        '({a} × {q} − {p} × {c}) ÷ {D}',
        'Dy puts the right sides in the y column; divide it by D.',
      ),
    ),
    example: { a: 2, b: 3, p: 13, c: 1, d: -1, q: -1, D: -5, x: 2, y: 3 },
    startWith: ['a', 'b', 'p', 'c', 'd', 'q'],
    equation: '{a}x + {b}y = {p}\n{c}x + {d}y = {q}',
    representation: { kind: 'coordinatePlane', x: 'x', y: 'y', extent: 10, quadrants: 4 },
  },
];

// ── Trigonometry ──

const RAD = Math.PI / 180;
/** Degrees to a y axis: sin⁻¹ and tan⁻¹ graphs stretched by 180/π read in degrees. */
const DEG = 180 / Math.PI;
const deg = (id: string, symbol: string, name: string, min: number, max: number, extra = {}) =>
  V(id, symbol, name, { unit: '°', min, max, step: 0.01, ...extra });
const unitValue = (id: string, symbol: string, name: string, extra = {}) =>
  V(id, symbol, name, { min: -1, max: 1, step: 0.0001, ...extra });

/** t = A × π/180, the same angle in radians. */
const toRadians = (t: string, A: string) =>
  derive(
    `${t} = ${A} × π/180`,
    `{${t}} = {${A}} × π/180`,
    t,
    [A],
    (v) => v[A]! * RAD,
    `{${A}} × π/180`,
    'A half turn, 180°, is π radians: multiply by π/180.',
  );
const radians = (
  id: string,
  min: number,
  max: number,
  symbol = 't',
  name = 'The angle in radians',
) => V(id, symbol, name, { min, max, step: 0.0001, derived: true, pi: 'fraction' });

/** A = f⁻¹(x) on the inverse's range, and x = f(A) back. */
function inverse(fn: 'sin' | 'cos' | 'tan', A: string, x: string, how: string): Rel {
  const inv = fn === 'sin' ? Math.asin : fn === 'cos' ? Math.acos : Math.atan;
  const f = fn === 'sin' ? Math.sin : fn === 'cos' ? Math.cos : Math.tan;
  return rel(
    `${A} = ${fn}⁻¹(${x})`,
    `{${A}} = ${fn}⁻¹({${x}})`,
    [A, x],
    (v) => f(v[A]! * RAD) - v[x]!,
    {
      [A]: [
        (v) => (fn !== 'tan' && Math.abs(v[x]!) > 1 ? undefined : inv(v[x]!) / RAD),
        `${fn}⁻¹({${x}})`,
        how,
      ],
      [x]: [
        (v) => f(v[A]! * RAD),
        `${fn}({${A}}°)`,
        `Take the ${fn === 'sin' ? 'sine' : fn === 'cos' ? 'cosine' : 'tangent'} of both sides.`,
      ],
    },
    // The check goes the other way, through the function itself.
    { check: (v) => `${fn}(${shown(v[A]!)}°) = ${shown(v[x]!)}` },
  );
}

const MATH_12_TRIG: ModuleDef[] = [
  // ── m.12.inverse-trig (F-TF.6, F-TF.7) ──
  {
    id: 'm.12.inverse-trig',
    assumptions: [
      'sin⁻¹(x) is the one angle from −90° to 90° whose sine is x.',
      'The sine is one-to-one only on −90° to 90°, so the range is restricted there.',
      'x must be from −1 to 1: no angle has a sine of 1.5.',
      'sin⁻¹(x) is the inverse function, not 1 ÷ sin(x).',
    ],
    variables: [
      unitValue('x', 'x', 'The sine'),
      deg('A', 'A', 'The angle', -90, 90),
      radians('t', -Math.PI / 2, Math.PI / 2),
    ],
    ...rels(
      inverse('sin', 'A', 'x', 'The one angle from −90° to 90° whose sine is x.'),
      toRadians('t', 'A'),
    ),
    example: { x: 0.5, A: 30, t: Math.PI / 6 },
    startWith: ['x'],
    equation: 'sin⁻¹({x}) = {A}°',
    representation: {
      kind: 'functionGraph',
      family: 'arcsin',
      a: DEG,
      at: { x: 'x', y: 'A' },
      marks: ['domain', 'range'],
      axes: { x: 'x', y: 'A (°)' },
    },
  },
  {
    id: 'm.12.inverse-trig~arccos',
    title: 'Inverse cosine',
    use: 'Use this for “Find cos⁻¹(−1/2) in degrees and radians.”',
    assumptions: [
      'cos⁻¹(x) is the one angle from 0° to 180° whose cosine is x (the shaded half).',
      'The cosine is one-to-one there, so that is the range; x must be from −1 to 1.',
      'A negative x gives an angle past 90°, in the second quadrant.',
    ],
    variables: [
      unitValue('x', 'x', 'The cosine'),
      deg('A', 'A', 'The angle', 0, 180),
      radians('t', 0, Math.PI),
    ],
    ...rels(
      inverse('cos', 'A', 'x', 'The one angle from 0° to 180° whose cosine is x.'),
      toRadians('t', 'A'),
    ),
    example: { x: -0.5, A: 120, t: (2 * Math.PI) / 3 },
    startWith: ['x'],
    equation: 'cos⁻¹({x}) = {A}°',
    representation: {
      kind: 'unitCircle',
      angle: 'A',
      fixed: true,
      solutions: { fn: 'cos', value: 'x', angles: ['A'], principal: true },
    },
  },
  {
    id: 'm.12.inverse-trig~arctan',
    title: 'Inverse tangent: the angle of a slope',
    use: 'Use this for “A road rises 3 m over 40 m of ground. What angle does it make with the level?”',
    assumptions: [
      'The angle of a slope is tan⁻¹ of rise over run.',
      'tan⁻¹(x) is the one angle between −90° and 90° whose tangent is x; every x has one.',
      'The curve nears ±90° but never reaches them: those are asymptotes.',
    ],
    variables: [
      V('r', 'rise', 'Rise', { unit: 'm', min: -100000, max: 100000, step: 0.01 }),
      V('u', 'run', 'Run', { unit: 'm', min: 0.001, max: 100000, step: 0.01 }),
      V('x', 'x', 'Rise over run', { min: -100000, max: 100000, step: 0.0001, derived: true }),
      deg('A', 'A', 'Angle of the slope', -89.99, 89.99),
    ],
    ...rels(
      rel('x = rise ÷ run', '{x} = {r} ÷ {u}', ['x', 'r', 'u'], (v) => v.x! * v.u! - v.r!, {
        x: [(v) => div(v.r!, v.u!), '{r} ÷ {u}', 'The slope is the rise for each 1 of run.'],
        r: [(v) => v.x! * v.u!, '{x} × {u}', 'The rise is the slope times the run.'],
        u: [(v) => div(v.r!, v.x!), '{r} ÷ {x}', 'Divide the rise by the slope.'],
      }),
      inverse('tan', 'A', 'x', 'The angle between −90° and 90° whose tangent is rise over run.'),
    ),
    example: { r: 3, u: 40, x: 0.075, A: Math.atan(0.075) / RAD },
    startWith: ['r', 'u'],
    representation: {
      kind: 'functionGraph',
      family: 'arctan',
      a: DEG,
      at: { x: 'x', y: 'A' },
      marks: ['asymptotes', 'range'],
      axes: { x: 'Rise over run x', y: 'A (°)' },
    },
  },
  {
    id: 'm.12.inverse-trig~compose',
    title: 'The cosine of an inverse sine',
    use: 'Use this for “Find the exact value of cos(sin⁻¹(3/5)).”',
    assumptions: [
      'Let A = sin⁻¹(x): an angle from −90° to 90° with sin A = x.',
      'Then cos A = √(1 − x²), from sin²A + cos²A = 1.',
      'The root is positive because A is from −90° to 90°, where the cosine is not negative.',
    ],
    variables: [
      unitValue('x', 'x', 'The sine, sin A'),
      deg('A', 'A', 'The angle sin⁻¹(x)', -90, 90, { derived: true }),
      unitValue('y', 'y', 'cos(sin⁻¹(x))', { min: 0 }),
    ],
    ...rels(
      inverse('sin', 'A', 'x', 'The one angle from −90° to 90° whose sine is x.'),
      rel(
        'y = cos A = √(1 − x²)',
        '{y} = √(1 − {x}²)',
        ['y', 'x'],
        (v) => v.y! - Math.sqrt(1 - v.x! ** 2),
        {
          y: [
            (v) => (Math.abs(v.x!) > 1 ? undefined : Math.sqrt(1 - v.x! ** 2)),
            '√(1 − {x}²)',
            'cos A = √(1 − sin²A), and sin A = x; the root is positive since A is from −90° to 90°.',
          ],
          x: [
            (v) => (v.y! > 1 ? undefined : [Math.sqrt(1 - v.y! ** 2), -Math.sqrt(1 - v.y! ** 2)]),
            '±√(1 − {y}²)',
            'sin²A = 1 − cos²A; the sine can be either sign between −90° and 90°.',
          ],
        },
      ),
    ),
    example: { x: 0.6, A: Math.asin(0.6) / RAD, y: 0.8 },
    startWith: ['x'],
    equation: 'cos(sin⁻¹({x})) = {y}',
    representation: { kind: 'unitCircle', angle: 'A', sin: 'x', cos: 'y', fixed: true },
  },
];

/** Sine and cosine of degrees, exactly 0 at the multiples of 90° where they vanish. */
const sind = (x: number) => (x % 180 === 0 ? 0 : Math.sin(x * RAD));
const cosd = (x: number) => ((x - 90) % 180 === 0 ? 0 : Math.cos(x * RAD));
/** n√k ÷ d: a special value written exactly (√2/2, −1/2, (√6 + √2)/4's parts). */
type Surd = { n: number; k: number; d: number };
/** The sine of each multiple of 30° and 45° on one turn, as n√k ÷ 2. */
const SIN_EXACT: Record<number, [number, number]> = {
  0: [0, 1],
  30: [1, 1],
  45: [1, 2],
  60: [1, 3],
  90: [2, 1],
  120: [1, 3],
  135: [1, 2],
  150: [1, 1],
  180: [0, 1],
  210: [-1, 1],
  225: [-1, 2],
  240: [-1, 3],
  270: [-2, 1],
  300: [-1, 3],
  315: [-1, 2],
  330: [-1, 1],
};
/** The angles the sum and difference pages take: those with exact values. */
const SPECIAL_ANGLES = [...Object.keys(SIN_EXACT).map(Number), 360];
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const lowest = ({ n, k, d }: Surd): Surd => {
  if (n === 0) return { n: 0, k: 1, d: 1 };
  const g = gcd(Math.abs(n), d);
  return { n: n / g, k, d: d / g };
};
const exactTrig = (fn: 'sin' | 'cos', x: number): Surd | undefined => {
  const e = SIN_EXACT[((((fn === 'sin' ? x : x + 90) % 360) + 360) % 360) as number];
  return e && lowest({ n: e[0], k: e[1], d: 2 });
};
const surdText = ({ n, k, d }: Surd) => {
  if (n === 0) return '0';
  const a = Math.abs(n);
  return `${n < 0 ? '−' : ''}${k === 1 ? a : `${a === 1 ? '' : a}√${k}`}${d === 1 ? '' : `/${d}`}`;
};
/** A product of two exact values, its square factors taken out (√2 × √2 = 2). */
const surdTimes = (x: Surd, y: Surd): Surd => {
  let n = x.n * y.n;
  let k = x.k * y.k;
  for (const r of [2, 3]) {
    if (k % (r * r) === 0) {
      n *= r;
      k /= r * r;
    }
  }
  return lowest({ n, k, d: x.d * y.d });
};
/** p + q in lowest terms: like roots combine, unlike ones share a denominator. */
const surdSum = (p: Surd, q: Surd): string => {
  if (q.n === 0) return surdText(p);
  if (p.n === 0) return surdText(q);
  const d = (p.d * q.d) / gcd(p.d, q.d);
  const np = (p.n * d) / p.d;
  const nq = (q.n * d) / q.d;
  if (p.k === q.k) return surdText(lowest({ n: np + nq, k: p.k, d }));
  const g = gcd(gcd(Math.abs(np), Math.abs(nq)), d);
  const top = `${surdText({ n: np / g, k: p.k, d: 1 })} ${nq < 0 ? '−' : '+'} ${surdText({
    n: Math.abs(nq) / g,
    k: q.k,
    d: 1,
  })}`;
  return d / g === 1 ? top : `(${top})/${d / g}`;
};
type Factor = ['sin' | 'cos', number];
/**
 * The four special values exactly, then the two products as surds and their sum, ending at
 * the decimal: sin 45° = √2/2, …; √2/2 × √3/2 + √2/2 × 1/2 = √6/4 + √2/4 = (√6 + √2)/4 ≈ 0.9659.
 */
const exactWork = (a: Factor, b: Factor, c: Factor, d: Factor, value: number): string[] => {
  const all = [a, b, c, d];
  const vals = all.map(([fn, x]) => exactTrig(fn, x));
  if (vals.some((x) => x === undefined)) return [];
  const [sa, sb, sc, sd] = vals as Surd[];
  const factor = (x: Surd, first = false) => (x.n < 0 && !first ? `(${surdText(x)})` : surdText(x));
  const p = surdTimes(sa!, sb!);
  const q = surdTimes(sc!, sd!);
  const sum = surdSum(p, q);
  const middle =
    p.n !== 0 && q.n !== 0
      ? ` = ${surdText(p)} ${q.n < 0 ? '−' : '+'} ${surdText({ ...q, n: Math.abs(q.n) })}`
      : '';
  const tail = /√/.test(sum) ? ` ≈ ${fmt(value)}` : /\//.test(sum) ? ` = ${fmt(value)}` : '';
  return [
    all.map(([fn, x], i) => `${fn} ${fmt(x)}° = ${surdText(vals[i]!)}`).join(', '),
    `${factor(sa!, true)} × ${factor(sb!)} + ${factor(sc!)} × ${factor(sd!)}${middle} = ${sum}${tail}`,
  ];
};

/** k = (c − b) ÷ a: the equation a f(x) + b = c solved for f(x). */
const isolate = (fn: string) =>
  rel(
    `k = (c − b) ÷ a`,
    `{k} = ({c} − {b}) ÷ {a}`,
    ['k', 'c', 'b', 'a'],
    (v) => v.k! * v.a! - (v.c! - v.b!),
    {
      k: [
        (v) => div(v.c! - v.b!, v.a!),
        '({c} − {b}) ÷ {a}',
        `Take b from both sides, then divide by a: ${fn} x on its own.`,
      ],
      c: [(v) => v.a! * v.k! + v.b!, '{a} × {k} + {b}', 'Put the value of the function back in.'],
      b: [(v) => v.c! - v.a! * v.k!, '{c} − {a} × {k}', 'Take a times the function from c.'],
    },
  );

/** The sign of cos A from A's quadrant: negative in II and III, but never −0 (sin A = ±1). */
const cosSign = (v: Values) => ((v.q === 2 || v.q === 3) && Math.abs(v.s!) < 1 ? -1 : 1);

/**
 * The sign of sin(A/2) or cos(A/2) from the quadrant of A/2 (sine negative in III and IV,
 * cosine in II and III), never −0 when the root is 0.
 */
const halfSign = (v: Values, fn: 'sin' | 'cos') => {
  const root = fn === 'sin' ? 1 - v.c! : 1 + v.c!;
  const negative = fn === 'sin' ? v.q! >= 3 : v.q === 2 || v.q === 3;
  return negative && root > 0 ? -1 : 1;
};

/** A note after a second solution that is the first one again (k = ±1). */
const oneSolution = (v: Values) =>
  v.x1 !== undefined && v.x2 !== undefined && Math.abs(v.x1 - v.x2) < 1e-9
    ? '→ the same angle as x₁: one solution'
    : '';

const MATH_12_TRIG_EQUATIONS: ModuleDef[] = [
  // ── m.12.trig-formulas-equations (F-TF.9, F-TF.7) ──
  {
    id: 'm.12.trig-formulas-equations',
    assumptions: [
      'sin(A + B) = sin A cos B + cos A sin B; it is not sin A + sin B.',
      'Pick A and B with known exact values (30°, 45°, 60° and their relatives).',
      'The same formula with minus signs gives sin(A − B) = sin A cos B − cos A sin B.',
    ],
    variables: [
      deg('A', 'A', 'First angle', 0, 360, { allowed: SPECIAL_ANGLES }),
      deg('B', 'B', 'Second angle', 0, 360, { allowed: SPECIAL_ANGLES }),
      deg('C', 'C', 'The sum of the angles, A + B', 0, 720, { derived: true }),
      unitValue('S', 'S', 'sin(A + B)', { derived: true }),
    ],
    ...rels(
      derive(
        'C = A + B',
        '{C} = {A} + {B}',
        'C',
        ['A', 'B'],
        (v) => v.A! + v.B!,
        '{A} + {B}',
        'Add the two angles.',
      ),
      withStep(
        derive(
          'sin(A + B) = sin A cos B + cos A sin B',
          '{S} = sin({A}°) × cos({B}°) + cos({A}°) × sin({B}°)',
          'S',
          ['A', 'B'],
          (v) => sind(v.A!) * cosd(v.B!) + cosd(v.A!) * sind(v.B!),
          'sin({A}°) × cos({B}°) + cos({A}°) × sin({B}°)',
          'The sum formula: sin A cos B plus cos A sin B, from the four values you know.',
        ),
        'S',
        {
          work: (v) => exactWork(['sin', v.A!], ['cos', v.B!], ['cos', v.A!], ['sin', v.B!], v.S!),
        },
      ),
    ),
    example: { A: 45, B: 30, C: 75, S: Math.sin(75 * RAD) },
    startWith: ['A', 'B'],
    equation: 'sin({A}° + {B}°) = {S}',
    representation: { kind: 'unitCircle', angle: 'C', sin: 'S', fixed: true },
  },
  {
    id: 'm.12.trig-formulas-equations~difference',
    title: 'The difference formula for cosine',
    use: 'Use this for “Find the exact value of cos 15° as cos(45° − 30°).”',
    assumptions: [
      'cos(A − B) = cos A cos B + sin A sin B: the sign in the middle flips.',
      'Write the angle as a difference of angles with known exact values.',
      'cos(A + B) = cos A cos B − sin A sin B is the same formula with B made negative.',
    ],
    variables: [
      deg('A', 'A', 'First angle', 0, 360, { allowed: SPECIAL_ANGLES }),
      deg('B', 'B', 'Second angle', 0, 360, { allowed: SPECIAL_ANGLES }),
      deg('C', 'C', 'The difference of the angles, A − B', -360, 360, { derived: true }),
      unitValue('K', 'K', 'cos(A − B)', { derived: true }),
    ],
    ...rels(
      derive(
        'C = A − B',
        '{C} = {A} − {B}',
        'C',
        ['A', 'B'],
        (v) => v.A! - v.B!,
        '{A} − {B}',
        'Take the second angle from the first.',
      ),
      withStep(
        derive(
          'cos(A − B) = cos A cos B + sin A sin B',
          '{K} = cos({A}°) × cos({B}°) + sin({A}°) × sin({B}°)',
          'K',
          ['A', 'B'],
          (v) => cosd(v.A!) * cosd(v.B!) + sind(v.A!) * sind(v.B!),
          'cos({A}°) × cos({B}°) + sin({A}°) × sin({B}°)',
          'The difference formula: cos A cos B plus sin A sin B.',
        ),
        'K',
        {
          work: (v) => exactWork(['cos', v.A!], ['cos', v.B!], ['sin', v.A!], ['sin', v.B!], v.K!),
        },
      ),
    ),
    example: { A: 45, B: 30, C: 15, K: Math.cos(15 * RAD) },
    startWith: ['A', 'B'],
    equation: 'cos({A}° − {B}°) = {K}',
    representation: { kind: 'unitCircle', angle: 'C', cos: 'K', fixed: true },
  },
  {
    id: 'm.12.trig-formulas-equations~double-angle',
    title: 'Double-angle formulas',
    use: 'Use this for “sin A = 3/5 with A in Quadrant II. Find sin 2A and cos 2A.”',
    assumptions: [
      'sin 2A = 2 sin A cos A and cos 2A = cos²A − sin²A.',
      'Find cos A from sin²A + cos²A = 1; its sign comes from the quadrant (negative in II and III).',
      'The sine is positive in quadrants I and II and negative in III and IV.',
    ],
    variables: [
      unitValue('s', 's', 'sin A'),
      V('q', 'Q', 'Quadrant of A', { allowed: [1, 2, 3, 4], integer: true, min: 1, max: 4 }),
      unitValue('c', 'c', 'cos A', { derived: true }),
      deg('A', 'A', 'The angle', 0, 360, { derived: true }),
      unitValue('S', 'S', 'sin 2A'),
      unitValue('K', 'K', 'cos 2A'),
    ],
    ...rels(
      limit(
        'sign of sin A in its quadrant',
        'The sign of {s} fits quadrant {q}: not negative in I and II, not positive in III and IV',
        ['s', 'q'],
        (v) => (v.q! <= 2 ? v.s! >= 0 : v.s! <= 0),
        'The sine is not negative in quadrants I and II and not positive in III and IV.',
      ),
      rel(
        'cos A = ±√(1 − sin²A)',
        '{c} = ±√(1 − {s}²), the sign from quadrant {q}',
        ['c', 's', 'q'],
        (v) => v.c! - cosSign(v) * Math.sqrt(1 - v.s! ** 2),
        {
          c: [
            (v) => cosSign(v) * Math.sqrt(1 - v.s! ** 2),
            (v: Values) => (cosSign(v) < 0 ? '−√(1 − {s}²)' : '√(1 − {s}²)'),
            'cos²A = 1 − sin²A; the root is negative in quadrants II and III, positive in I and IV.',
          ],
        },
        {
          check: (v) =>
            `${fmt(v.c!)} = ${cosSign(v) < 0 ? '−' : ''}√(1 − ${v.s! < 0 ? `(${fmt(v.s!)})` : fmt(v.s!)}²)`,
        },
      ),
      rel(
        'A from sin A and its quadrant',
        '{A} = the angle in quadrant {q} with sine {s}',
        ['A', 's', 'q'],
        (v) => sind(v.A!) - v.s!,
        {
          A: [
            (v) => {
              const a = Math.asin(v.s!) / RAD;
              return v.q === 1 ? a : v.q === 4 ? 360 + a : 180 - a;
            },
            (v: Values) =>
              v.q === 1 ? 'sin⁻¹({s})' : v.q === 4 ? '360 + sin⁻¹({s})' : '180 − sin⁻¹({s})',
            'sin⁻¹ gives an angle from −90° to 90°; move it into the quadrant (180° − it in II and III).',
          ],
        },
        { check: (v) => `sin(${fmt(v.A!)}°) = ${fmt(v.s!)}` },
      ),
      rel(
        'sin 2A = 2 sin A cos A',
        '{S} = 2 × {s} × {c}',
        ['S', 's', 'c'],
        (v) => v.S! - 2 * v.s! * v.c!,
        {
          S: [(v) => 2 * v.s! * v.c!, '2 × {s} × {c}', 'The double-angle formula for sine.'],
        },
      ),
      rel(
        'cos 2A = cos²A − sin²A',
        '{K} = {c}² − {s}²',
        ['K', 'c', 's'],
        (v) => v.K! - (v.c! ** 2 - v.s! ** 2),
        {
          K: [(v) => v.c! ** 2 - v.s! ** 2, '{c}² − {s}²', 'The double-angle formula for cosine.'],
        },
      ),
    ),
    example: { s: 0.6, q: 2, c: -0.8, A: 180 - Math.asin(0.6) / RAD, S: -0.96, K: 0.28 },
    startWith: ['s', 'q'],
    representation: { kind: 'unitCircle', angle: 'A', sin: 's', cos: 'c', fixed: true },
  },
  {
    id: 'm.12.trig-formulas-equations~half-angle',
    title: 'Half-angle formulas',
    use: 'Use this for “cos A = 7/25 and A/2 is in Quadrant I. Find sin(A/2) and cos(A/2).”',
    assumptions: [
      'sin(A/2) = ±√((1 − cos A) ÷ 2) and cos(A/2) = ±√((1 + cos A) ÷ 2).',
      'The signs come from the quadrant of A/2, not of A: the sine is positive in I and II, the cosine in I and IV.',
      'For A from 0° to 360°, A/2 is from 0° to 180°: quadrant I or II.',
    ],
    variables: [
      unitValue('c', 'c', 'cos A'),
      V('q', 'Q', 'Quadrant of A/2', { allowed: [1, 2, 3, 4], integer: true, min: 1, max: 4 }),
      unitValue('S', 'S', 'sin(A/2)', { derived: true }),
      unitValue('K', 'K', 'cos(A/2)', { derived: true }),
      deg('H', 'H', 'The half angle, A/2', 0, 360, { derived: true }),
    ],
    ...rels(
      withCheck(
        derive(
          'sin(A/2) = ±√((1 − cos A) ÷ 2)',
          '{S} = ±√((1 − {c}) ÷ 2), the sign from quadrant {q}',
          'S',
          ['c', 'q'],
          (v) => halfSign(v, 'sin') * Math.sqrt((1 - v.c!) / 2),
          (v: Values) => (halfSign(v, 'sin') < 0 ? '−√((1 − {c}) ÷ 2)' : '√((1 − {c}) ÷ 2)'),
          'The half-angle formula for sine; the root is negative when A/2 is in quadrant III or IV.',
        ),
        (v) => `${shown(v.S!)} = ${halfSign(v, 'sin') < 0 ? '−' : ''}√((1 − ${par(v.c!)}) ÷ 2)`,
      ),
      withCheck(
        derive(
          'cos(A/2) = ±√((1 + cos A) ÷ 2)',
          '{K} = ±√((1 + {c}) ÷ 2), the sign from quadrant {q}',
          'K',
          ['c', 'q'],
          (v) => halfSign(v, 'cos') * Math.sqrt((1 + v.c!) / 2),
          (v: Values) => (halfSign(v, 'cos') < 0 ? '−√((1 + {c}) ÷ 2)' : '√((1 + {c}) ÷ 2)'),
          'The half-angle formula for cosine; the root is negative when A/2 is in quadrant II or III.',
        ),
        (v) => `${shown(v.K!)} = ${halfSign(v, 'cos') < 0 ? '−' : ''}√((1 + ${par(v.c!)}) ÷ 2)`,
      ),
      withCheck(
        derive(
          'H from cos(A/2) and its quadrant',
          '{H} = the angle in quadrant {q} with cosine {K}',
          'H',
          ['K', 'q'],
          (v) => (v.q! <= 2 ? Math.acos(v.K!) / RAD : 360 - Math.acos(v.K!) / RAD),
          (v: Values) => (v.q! <= 2 ? 'cos⁻¹({K})' : '360 − cos⁻¹({K})'),
          'cos⁻¹ gives an angle from 0° to 180°; in quadrants III and IV take it from 360°.',
        ),
        (v) => `cos(${fmt(v.H!)}°) = ${fmt(v.K!)}`,
      ),
    ),
    example: { c: 0.28, q: 1, S: 0.6, K: 0.8, H: Math.acos(0.8) / RAD },
    startWith: ['c', 'q'],
    representation: { kind: 'unitCircle', angle: 'H', sin: 'S', cos: 'K', fixed: true },
  },
  {
    id: 'm.12.trig-formulas-equations~sine-equation',
    title: 'Solve a sin x + b = c',
    use: 'Use this for “Solve 2 sin x + 3 = 4 for 0° ≤ x < 360°.”',
    assumptions: [
      'Get sin x on its own first; it must be from −1 to 1, or there is no solution.',
      'The level line y = k crosses the unit circle twice: at sin⁻¹(k) and at 180° minus it (once when k = ±1).',
      'Answers are from 0° up to 360°: add 360° to a negative angle.',
    ],
    variables: [
      V('a', 'a', 'Number before sin x', { min: -100, max: 100, step: 0.01 }),
      V('b', 'b', 'Number added', { min: -100, max: 100, step: 0.01 }),
      V('c', 'c', 'Right side', { min: -100, max: 100, step: 0.01 }),
      unitValue('k', 'k', 'k, the value of sin x', { derived: true }),
      deg('x1', 'x₁', 'First solution', 0, 360),
      deg('x2', 'x₂', 'Second solution', 90, 270),
      radians('r1', 0, 2 * Math.PI, 't₁', 'First solution in radians'),
      radians('r2', 0, 2 * Math.PI, 't₂', 'Second solution in radians'),
    ],
    ...rels(
      limit(
        'a ≠ 0',
        'The number before sin x, {a}, is not 0',
        ['a'],
        (v) => v.a !== 0,
        'With a = 0 there is no sin x left to solve for.',
      ),
      isolate('sin'),
      rel(
        'x₁ = sin⁻¹(k)',
        '{x1} = sin⁻¹({k})',
        ['x1', 'k'],
        (v) => sind(v.x1!) - v.k!,
        {
          x1: [
            (v) => (Math.abs(v.k!) > 1 ? undefined : (Math.asin(v.k!) / RAD + 360) % 360),
            (v: Values) => (v.k! < 0 ? 'sin⁻¹({k}) + 360' : 'sin⁻¹({k})'),
            'sin⁻¹ gives one angle; add 360° when it is negative so it lies on one turn from 0°.',
          ],
          k: [(v) => sind(v.x1!), 'sin({x1}°)', 'Take the sine of the angle.'],
        },
        { check: (v) => `sin(${fmt(v.x1!)}°) = ${fmt(v.k!)}` },
      ),
      withStep(
        rel(
          'x₂ = 180° − sin⁻¹(k)',
          '{x2} = 180 − sin⁻¹({k})',
          ['x2', 'k'],
          (v) => sind(v.x2!) - v.k!,
          {
            x2: [
              (v) => (Math.abs(v.k!) > 1 ? undefined : 180 - Math.asin(v.k!) / RAD),
              '180 − sin⁻¹({k})',
              'The mirror image across the y-axis has the same sine.',
            ],
          },
          { check: (v) => `sin(${fmt(v.x2!)}°) = ${fmt(v.k!)}` },
        ),
        'x2',
        { note: oneSolution },
      ),
      toRadians('r1', 'x1'),
      toRadians('r2', 'x2'),
    ),
    example: {
      a: 2,
      b: 3,
      c: 4,
      k: 0.5,
      x1: 30,
      x2: 150,
      r1: Math.PI / 6,
      r2: (5 * Math.PI) / 6,
    },
    startWith: ['a', 'b', 'c'],
    equation: '{a} sin x + {b} = {c}',
    representation: {
      kind: 'unitCircle',
      angle: 'x1',
      fixed: true,
      solutions: { fn: 'sin', value: 'k', angles: ['x1', 'x2'] },
    },
  },
  {
    id: 'm.12.trig-formulas-equations~tangent-equation',
    title: 'Solve a tan x + b = c',
    use: 'Use this for “Solve 3 tan x + 1 = 4 for 0° ≤ x < 360°.”',
    assumptions: [
      'Get tan x on its own first; every value has solutions.',
      'The tangent repeats every 180°, so the second solution is the first plus 180°.',
      'Answers are from 0° up to 360°: add 180° to a negative tan⁻¹.',
    ],
    variables: [
      V('a', 'a', 'Number before tan x', { min: -100, max: 100, step: 0.01 }),
      V('b', 'b', 'Number added', { min: -100, max: 100, step: 0.01 }),
      V('c', 'c', 'Right side', { min: -100, max: 100, step: 0.01 }),
      V('k', 'k', 'k, the value of tan x', {
        min: -100000,
        max: 100000,
        step: 0.0001,
        derived: true,
      }),
      deg('x1', 'x₁', 'First solution', 0, 180),
      deg('x2', 'x₂', 'Second solution', 180, 360),
      radians('r1', 0, Math.PI, 't₁', 'First solution in radians'),
      radians('r2', Math.PI, 2 * Math.PI, 't₂', 'Second solution in radians'),
    ],
    ...rels(
      limit(
        'a ≠ 0',
        'The number before tan x, {a}, is not 0',
        ['a'],
        (v) => v.a !== 0,
        'With a = 0 there is no tan x left to solve for.',
      ),
      isolate('tan'),
      rel(
        'x₁ = tan⁻¹(k)',
        '{x1} = tan⁻¹({k})',
        ['x1', 'k'],
        (v) => v.k! * cosd(v.x1!) - sind(v.x1!),
        {
          x1: [
            (v) => (Math.atan(v.k!) / RAD + 180) % 180,
            (v: Values) => (v.k! < 0 ? 'tan⁻¹({k}) + 180' : 'tan⁻¹({k})'),
            'tan⁻¹ gives one angle; add 180° when it is negative so it lies from 0° to 180°.',
          ],
          k: [(v) => Math.tan(v.x1! * RAD), 'tan({x1}°)', 'Take the tangent of the angle.'],
        },
        { check: (v) => `tan(${fmt(v.x1!)}°) = ${fmt(v.k!)}` },
      ),
      rel('x₂ = x₁ + 180°', '{x2} = {x1} + 180', ['x2', 'x1'], (v) => v.x2! - v.x1! - 180, {
        x2: [
          (v) => v.x1! + 180,
          '{x1} + 180',
          'Half a turn on, the opposite point has the same tangent.',
        ],
        x1: [(v) => v.x2! - 180, '{x2} − 180', 'Half a turn back gives the first solution.'],
      }),
      toRadians('r1', 'x1'),
      toRadians('r2', 'x2'),
    ),
    example: {
      a: 3,
      b: 1,
      c: 4,
      k: 1,
      x1: 45,
      x2: 225,
      r1: Math.PI / 4,
      r2: (5 * Math.PI) / 4,
    },
    startWith: ['a', 'b', 'c'],
    equation: '{a} tan x + {b} = {c}',
    representation: {
      kind: 'unitCircle',
      angle: 'x1',
      fixed: true,
      solutions: { fn: 'tan', value: 'k', angles: ['x1', 'x2'] },
    },
  },
];

// ── Vectors ──

/**
 * θ = the direction of (x, y), 0° to 360° from the positive x-axis: tan⁻¹(y ÷ x) put into the
 * arrow's quadrant (engine need 12, kept here).
 */
const directionOf = (x: number, y: number) =>
  x === 0 && y === 0 ? undefined : (((Math.atan2(y, x) / RAD + 360) % 360) as number);
function direction(t: string, x: string, y: string, what = 'arrow', r?: string): Rel {
  /** The angle wanted: the arrow's direction, turned half a turn when r is negative. */
  const want = (v: Values) => {
    const d = directionOf(v[x]!, v[y]!);
    if (d === undefined) return undefined;
    return r !== undefined && v[r]! < 0 ? (d + 180) % 360 : d;
  };
  return rel(
    `${t} = direction of (${x}, ${y})`,
    r === undefined
      ? `tan {${t}} = {${y}} ÷ {${x}}, {${t}} in the quadrant of ({${x}}, {${y}})`
      : `tan {${t}} = {${y}} ÷ {${x}}, {${t}} in the quadrant of ({${x}}, {${y}}), turned 180° when {${r}} < 0`,
    r === undefined ? [t, x, y] : [t, x, y, r],
    (v) => {
      const d = want(v);
      if (d === undefined) return NaN;
      const gap = (((d - v[t]!) % 360) + 360) % 360;
      return Math.min(gap, 360 - gap);
    },
    {
      [t]: [
        want,
        (v: Values) => {
          const d = want(v);
          if (v[x] === 0 || d === undefined) return fmt(d ?? 0);
          // tan⁻¹ gives −90° to 90°; the rest is a whole number of half turns.
          const offset = Math.round((d - Math.atan(v[y]! / v[x]!) / RAD) / 180) * 180;
          return offset === 0 ? `tan⁻¹({${y}} ÷ {${x}})` : `${offset} + tan⁻¹({${y}} ÷ {${x}})`;
        },
        r === undefined
          ? `tan⁻¹ gives an angle from −90° to 90°; add 180° when the ${what} points left, 360° when it points down and right.`
          : 'tan⁻¹ gives an angle from −90° to 90°; add half turns to reach the ray the point is on (the opposite ray when r < 0).',
      ],
    },
    {
      check: (v) =>
        v[x] === 0
          ? `${fmt(v[x]!)} = ${fmt(Math.hypot(v[x]!, v[y]!))} × cos(${fmt(v[t]!)}°)`
          : `tan(${fmt(v[t]!)}°) = ${fmt(v[y]!)} ÷ ${v[x]! < 0 ? `(${fmt(v[x]!)})` : fmt(v[x]!)}`,
    },
  );
}

/** m = √(x² + y²), and a missing component back from the length. */
const lengthOf = (
  m: string,
  x: string,
  y: string,
  how = 'The Pythagorean theorem on the components.',
) =>
  rel(
    `${m} = √(${x}² + ${y}²)`,
    `{${m}} = √({${x}}² + {${y}}²)`,
    [m, x, y],
    (v) => v[m]! - Math.hypot(v[x]!, v[y]!),
    {
      [m]: [(v) => Math.hypot(v[x]!, v[y]!), `√({${x}}² + {${y}}²)`, how],
      [x]: [
        (v) =>
          v[m]! < Math.abs(v[y]!)
            ? undefined
            : [Math.sqrt(v[m]! ** 2 - v[y]! ** 2), -Math.sqrt(v[m]! ** 2 - v[y]! ** 2)],
        `±√({${m}}² − {${y}}²)`,
        'Take the other component’s square from the length’s square, then the root (either sign).',
      ],
      [y]: [
        (v) =>
          v[m]! < Math.abs(v[x]!)
            ? undefined
            : [Math.sqrt(v[m]! ** 2 - v[x]! ** 2), -Math.sqrt(v[m]! ** 2 - v[x]! ** 2)],
        `±√({${m}}² − {${x}}²)`,
        'Take the other component’s square from the length’s square, then the root (either sign).',
      ],
    },
  );

/** s = a + b for one component. */
const sumOf = (s: string, a: string, b: string, which: string) =>
  rel(`${s} = ${a} + ${b}`, `{${s}} = {${a}} + {${b}}`, [s, a, b], (v) => v[s]! - v[a]! - v[b]!, {
    [s]: [(v) => v[a]! + v[b]!, `{${a}} + {${b}}`, `Add the ${which}-components.`],
    [a]: [(v) => v[s]! - v[b]!, `{${s}} − {${b}}`, `Take v’s ${which}-component from the sum’s.`],
    [b]: [(v) => v[s]! - v[a]!, `{${s}} − {${a}}`, `Take u’s ${which}-component from the sum’s.`],
  });

/** w = k × u for one component. */
const scaled = (w: string, k: string, u: string, which: string) =>
  rel(`${w} = ${k} × ${u}`, `{${w}} = {${k}} × {${u}}`, [w, k, u], (v) => v[w]! - v[k]! * v[u]!, {
    [w]: [(v) => v[k]! * v[u]!, `{${k}} × {${u}}`, `Multiply the ${which}-component by k.`],
    [k]: [
      (v) => div(v[w]!, v[u]!),
      `{${w}} ÷ {${u}}`,
      `Divide the new ${which}-component by the old one.`,
    ],
    [u]: [(v) => div(v[w]!, v[k]!), `{${w}} ÷ {${k}}`, `Divide the new ${which}-component by k.`],
  });

const comp = (id: string, symbol: string, name: string, range = 1000, extra = {}) =>
  V(id, symbol, name, { min: -range, max: range, step: 0.01, ...extra });

const MATH_12_VECTORS: ModuleDef[] = [
  // ── m.12.vectors (N-VM.1–5) ──
  {
    id: 'm.12.vectors',
    assumptions: [
      'The direction θ is measured counterclockwise from the positive x-axis.',
      'A vector has a length and a direction but no fixed place: move it and it is the same vector.',
      'tan⁻¹(vy ÷ vx) alone gives the wrong quadrant when vx < 0: add 180°.',
    ],
    variables: [
      V('m', '|v|', 'Length', { min: 0, max: 1000, step: 0.01 }),
      deg('t', 'θ', 'Direction', 0, 360),
      comp('vx', 'vₓ', 'x-component'),
      comp('vy', 'vᵧ', 'y-component'),
    ],
    ...rels(
      rel(
        'vₓ = |v| cos θ',
        '{vx} = {m} × cos({t}°)',
        ['vx', 'm', 't'],
        (v) => v.vx! - v.m! * cosd(v.t!),
        {
          vx: [
            (v) => v.m! * cosd(v.t!),
            '{m} × cos({t}°)',
            'The x-component is the length times the cosine of the direction.',
          ],
        },
      ),
      rel(
        'vᵧ = |v| sin θ',
        '{vy} = {m} × sin({t}°)',
        ['vy', 'm', 't'],
        (v) => v.vy! - v.m! * sind(v.t!),
        {
          vy: [
            (v) => v.m! * sind(v.t!),
            '{m} × sin({t}°)',
            'The y-component is the length times the sine of the direction.',
          ],
        },
      ),
      lengthOf('m', 'vx', 'vy'),
      direction('t', 'vx', 'vy'),
    ),
    example: { m: 10, t: 30, vx: 10 * cosd(30), vy: 5 },
    startWith: ['m', 't'],
    pictureLabels: ['vx', 'vy'],
    representation: {
      kind: 'vectorDiagram',
      vectors: [{ name: 'v', magnitude: 'm', direction: 't' }],
      components: true,
    },
  },
  {
    id: 'm.12.vectors~add',
    title: 'Adding vectors',
    use: 'Use this for “Find u + v for u = ⟨3, 1⟩ and v = ⟨1, 2⟩, and its length.”',
    assumptions: [
      'Add vectors by adding matching components.',
      'Tip to tail: start v where u ends; u + v runs from u’s tail to v’s tip.',
      'The length of the sum is not the sum of the lengths.',
    ],
    variables: [
      comp('ux', 'u₁', 'x-component of u'),
      comp('uy', 'u₂', 'y-component of u'),
      comp('vx', 'v₁', 'x-component of v'),
      comp('vy', 'v₂', 'y-component of v'),
      comp('sx', 's₁', 'x-component of u + v', 2000),
      comp('sy', 's₂', 'y-component of u + v', 2000),
      V('r', '|u + v|', 'Length of u + v', { min: 0, max: 3000, step: 0.01 }),
    ],
    ...rels(
      sumOf('sx', 'ux', 'vx', 'x'),
      sumOf('sy', 'uy', 'vy', 'y'),
      derive(
        '|u + v| = √(s₁² + s₂²)',
        '{r} = √({sx}² + {sy}²)',
        'r',
        ['sx', 'sy'],
        (v) => Math.hypot(v.sx!, v.sy!),
        '√({sx}² + {sy}²)',
        'The Pythagorean theorem on the sum’s components.',
      ),
    ),
    example: { ux: 3, uy: 1, vx: 1, vy: 2, sx: 4, sy: 3, r: 5 },
    startWith: ['ux', 'uy', 'vx', 'vy'],
    equation: '⟨{ux}, {uy}⟩ + ⟨{vx}, {vy}⟩ = ⟨{sx}, {sy}⟩',
    representation: {
      kind: 'vectorDiagram',
      vectors: [
        { name: 'u', x: 'ux', y: 'uy' },
        { name: 'v', x: 'vx', y: 'vy' },
      ],
      sum: 'tipToTail',
      result: { name: 'u + v', x: 'sx', y: 'sy', magnitude: 'r' },
    },
  },
  {
    id: 'm.12.vectors~scalar',
    title: 'A scalar times a vector',
    use: 'Use this for “Find −2u for u = ⟨3, 4⟩” or a unit vector along u.',
    assumptions: [
      'k multiplies each component, so ku is |k| times as long.',
      'A negative k reverses the direction.',
      'k = 1 ÷ |u| gives the unit vector along u: ⟨3, 4⟩ becomes ⟨0.6, 0.8⟩.',
    ],
    variables: [
      V('k', 'k', 'Scalar', { min: -1000, max: 1000, step: 0.01 }),
      comp('ux', 'u₁', 'x-component of u'),
      comp('uy', 'u₂', 'y-component of u'),
      comp('x', 'w₁', 'x-component of ku', 1000000),
      comp('y', 'w₂', 'y-component of ku', 1000000),
      V('m', '|u|', 'Length of u', { min: 0, max: 1500, step: 0.01, derived: true }),
      V('M', '|ku|', 'Length of ku', { min: 0, max: 2000000, step: 0.01 }),
    ],
    ...rels(
      scaled('x', 'k', 'ux', 'x'),
      scaled('y', 'k', 'uy', 'y'),
      derive(
        '|u| = √(u₁² + u₂²)',
        '{m} = √({ux}² + {uy}²)',
        'm',
        ['ux', 'uy'],
        (v) => Math.hypot(v.ux!, v.uy!),
        '√({ux}² + {uy}²)',
        'The Pythagorean theorem on u’s components.',
      ),
      rel(
        '|ku| = |k| × |u|',
        '{M} = |{k}| × {m}',
        ['M', 'k', 'm'],
        (v) => v.M! - Math.abs(v.k!) * v.m!,
        {
          M: [
            (v) => Math.abs(v.k!) * v.m!,
            '|{k}| × {m}',
            'Scaling by k scales the length by |k|; a negative k only turns it around.',
          ],
        },
      ),
    ),
    example: { k: -2, ux: 3, uy: 4, x: -6, y: -8, m: 5, M: 10 },
    startWith: ['k', 'ux', 'uy'],
    equation: '{k}⟨{ux}, {uy}⟩ = ⟨{x}, {y}⟩',
    representation: {
      kind: 'vectorDiagram',
      vectors: [{ name: 'u', x: 'ux', y: 'uy' }],
      scalar: { k: 'k', x: 'x', y: 'y' },
    },
  },
  {
    id: 'm.12.vectors~dot',
    title: 'The dot product and the angle between vectors',
    use: 'Use this for “Find the angle between ⟨2, 1⟩ and ⟨1, 3⟩” or “Are these vectors perpendicular?”',
    assumptions: [
      'u · v = ac + bd: multiply matching components and add.',
      'cos θ = u · v ÷ (|u||v|), with θ from 0° to 180°.',
      'A dot product of 0 means perpendicular: ⟨3, 4⟩ · ⟨4, −3⟩ = 0.',
    ],
    variables: [
      comp('a', 'a', 'x-component of u'),
      comp('b', 'b', 'y-component of u'),
      comp('c', 'c', 'x-component of v'),
      comp('d', 'd', 'y-component of v'),
      V('p', 'u · v', 'Dot product', { min: -2000000, max: 2000000, step: 0.01, derived: true }),
      V('m1', '|u|', 'Length of u', { min: 0, max: 1500, step: 0.01, derived: true }),
      V('m2', '|v|', 'Length of v', { min: 0, max: 1500, step: 0.01, derived: true }),
      deg('t', 'θ', 'Angle between u and v', 0, 180, { derived: true }),
    ],
    ...rels(
      derive(
        'u · v = ac + bd',
        '{p} = {a} × {c} + {b} × {d}',
        'p',
        ['a', 'c', 'b', 'd'],
        (v) => v.a! * v.c! + v.b! * v.d!,
        '{a} × {c} + {b} × {d}',
        'Multiply matching components and add.',
      ),
      derive(
        '|u| = √(a² + b²)',
        '{m1} = √({a}² + {b}²)',
        'm1',
        ['a', 'b'],
        (v) => Math.hypot(v.a!, v.b!),
        '√({a}² + {b}²)',
        'The Pythagorean theorem on u’s components.',
      ),
      derive(
        '|v| = √(c² + d²)',
        '{m2} = √({c}² + {d}²)',
        'm2',
        ['c', 'd'],
        (v) => Math.hypot(v.c!, v.d!),
        '√({c}² + {d}²)',
        'The Pythagorean theorem on v’s components.',
      ),
      derive(
        'θ = cos⁻¹(u · v ÷ (|u||v|))',
        '{t} = cos⁻¹({p} ÷ ({m1} × {m2}))',
        't',
        ['p', 'm1', 'm2'],
        (v) => {
          const q = div(v.p!, v.m1! * v.m2!);
          return q === undefined ? undefined : Math.acos(Math.max(-1, Math.min(1, q))) / RAD;
        },
        'cos⁻¹({p} ÷ ({m1} × {m2}))',
        'The cosine of the angle is the dot product over the product of the lengths.',
      ),
    ),
    example: { a: 2, b: 1, c: 1, d: 3, p: 5, m1: Math.sqrt(5), m2: Math.sqrt(10), t: 45 },
    startWith: ['a', 'b', 'c', 'd'],
    equation: '⟨{a}, {b}⟩ · ⟨{c}, {d}⟩ = {p}',
    representation: {
      kind: 'vectorDiagram',
      vectors: [
        { name: 'u', x: 'a', y: 'b' },
        { name: 'v', x: 'c', y: 'd' },
      ],
      angle: { value: 't', dot: 'p' },
    },
  },
  {
    id: 'm.12.vectors~resultant',
    title: 'The resultant of two forces',
    use: 'Use this for “Forces of 30 N at 0° and 40 N at 60° pull on a ring. Find the resultant.”',
    assumptions: [
      'F₁ points along the positive x-axis; F₂ makes angle a with it.',
      'Add the components: the resultant is the diagonal of the parallelogram the forces make.',
      'Its direction φ is measured from F₁, counterclockwise.',
    ],
    variables: [
      V('f1', 'F₁', 'First force', { unit: 'N', min: 0.01, max: 100000, step: 0.1 }),
      V('f2', 'F₂', 'Second force', { unit: 'N', min: 0.01, max: 100000, step: 0.1 }),
      deg('a', 'a', 'Angle of F₂', 0, 360),
      V('fx', 'Fₓ', 'x-component of the resultant', {
        unit: 'N',
        min: -200000,
        max: 200000,
        step: 0.01,
      }),
      V('fy', 'Fᵧ', 'y-component of the resultant', {
        unit: 'N',
        min: -200000,
        max: 200000,
        step: 0.01,
      }),
      V('F', 'F', 'Resultant', { unit: 'N', min: 0, max: 300000, step: 0.01 }),
      deg('p', 'φ', 'Direction of the resultant', 0, 360),
    ],
    ...rels(
      rel(
        'Fₓ = F₁ + F₂ cos a',
        '{fx} = {f1} + {f2} × cos({a}°)',
        ['fx', 'f1', 'f2', 'a'],
        (v) => v.fx! - v.f1! - v.f2! * cosd(v.a!),
        {
          fx: [
            (v) => v.f1! + v.f2! * cosd(v.a!),
            '{f1} + {f2} × cos({a}°)',
            'F₁ is all x; F₂ adds its x-component, F₂ cos a.',
          ],
        },
      ),
      rel(
        'Fᵧ = F₂ sin a',
        '{fy} = {f2} × sin({a}°)',
        ['fy', 'f2', 'a'],
        (v) => v.fy! - v.f2! * sind(v.a!),
        {
          fy: [
            (v) => v.f2! * sind(v.a!),
            '{f2} × sin({a}°)',
            'Only F₂ has a y-component, F₂ sin a.',
          ],
        },
      ),
      lengthOf('F', 'fx', 'fy', 'The resultant is the hypotenuse of its components.'),
      direction('p', 'fx', 'fy', 'resultant'),
    ),
    example: {
      f1: 30,
      f2: 40,
      a: 60,
      fx: 30 + 40 * cosd(60),
      fy: 40 * sind(60),
      F: Math.hypot(30 + 40 * cosd(60), 40 * sind(60)),
      p: Math.atan2(40 * sind(60), 30 + 40 * cosd(60)) / RAD,
    },
    startWith: ['f1', 'f2', 'a'],
    unitSystems: ['metric'],
    representation: {
      kind: 'vectorDiagram',
      vectors: [
        { name: 'F₁', magnitude: 'f1', direction: 0 },
        { name: 'F₂', magnitude: 'f2', direction: 'a' },
      ],
      sum: 'parallelogram',
      result: { name: 'F', x: 'fx', y: 'fy', magnitude: 'F', direction: 'p' },
      unit: 'N',
    },
  },
];

// ── Polar coordinates and complex numbers ──

/** x = r cos θ (or y = r sin θ): one rectangular coordinate from polar ones. */
const polarPart = (out: string, r: string, t: string, fn: 'cos' | 'sin', how: string) =>
  rel(
    `${out} = ${r} ${fn} ${t}`,
    `{${out}} = {${r}} × ${fn}({${t}}°)`,
    [out, r, t],
    (v) => v[out]! - v[r]! * (fn === 'cos' ? cosd(v[t]!) : sind(v[t]!)),
    {
      [out]: [
        (v) => exact(v[r]! * (fn === 'cos' ? cosd(v[t]!) : sind(v[t]!))),
        `{${r}} × ${fn}({${t}}°)`,
        how,
      ],
    },
  );

/** r² = x² + y²: the distance from the pole, either sign (the positive one first). */
const polarDistance = (r: string, x: string, y: string, signed: boolean) =>
  rel(
    `${r}² = ${x}² + ${y}²`,
    signed ? `{${r}}² = {${x}}² + {${y}}²` : `{${r}} = √({${x}}² + {${y}}²)`,
    [r, x, y],
    (v) => v[r]! ** 2 - v[x]! ** 2 - v[y]! ** 2,
    {
      [r]: [
        (v) => {
          const d = Math.hypot(v[x]!, v[y]!);
          return signed ? [d, -d] : d;
        },
        (v: Values) => (signed && v[r]! < 0 ? '−' : '') + `√({${x}}² + {${y}}²)`,
        signed
          ? 'The Pythagorean theorem gives the distance; r is its negative when the point is named on the opposite ray.'
          : 'The Pythagorean theorem: the distance from the pole to the point.',
      ],
    },
  );

const MATH_12_POLAR: ModuleDef[] = [
  // ── m.12.polar (N-CN.4–6) ──
  {
    id: 'm.12.polar',
    assumptions: [
      'θ is measured from the positive x-axis, counterclockwise.',
      'A point has many polar names: add 360° to θ, or make r negative and add 180°.',
      'A negative r lands on the ray opposite θ.',
    ],
    variables: [
      V('r', 'r', 'Distance from the pole', { min: -20, max: 20, step: 0.01 }),
      deg('t', 'θ', 'Angle', -360, 720),
      real('x', 'x', 'x-coordinate', -20, 20),
      real('y', 'y', 'y-coordinate', -20, 20),
    ],
    ...rels(
      polarPart('x', 'r', 't', 'cos', 'Go r along the angle; the across part is r cos θ.'),
      polarPart('y', 'r', 't', 'sin', 'The up part is r sin θ.'),
      polarDistance('r', 'x', 'y', true),
      direction('t', 'x', 'y', 'point', 'r'),
    ),
    example: { r: 4, t: 150, x: 4 * cosd(150), y: 2 },
    startWith: ['r', 't'],
    representation: { kind: 'polarGrid', point: { r: 'r', theta: 't', x: 'x', y: 'y' } },
  },
  {
    id: 'm.12.polar~complex-form',
    title: 'Polar form of a complex number',
    use: 'Use this for “Write 2(cos 60° + i sin 60°) as a + bi,” or back.',
    assumptions: [
      'r is the modulus |z| and θ the argument, measured from the positive real axis.',
      'a = r cos θ is the real part and b = r sin θ the imaginary part.',
      'Going back, r = √(a² + b²) and θ is in the quadrant of the point (a, b).',
    ],
    variables: [
      V('r', 'r', 'Modulus', { min: 0, max: 1000, step: 0.01 }),
      deg('t', 'θ', 'Argument', 0, 360),
      comp('a', 'a', 'Real part'),
      comp('b', 'b', 'Imaginary part'),
    ],
    ...rels(
      polarPart(
        'a',
        'r',
        't',
        'cos',
        'The real part is the modulus times the cosine of the argument.',
      ),
      polarPart(
        'b',
        'r',
        't',
        'sin',
        'The imaginary part is the modulus times the sine of the argument.',
      ),
      polarDistance('r', 'a', 'b', false),
      direction('t', 'a', 'b', 'point'),
    ),
    example: { r: 2, t: 60, a: 1, b: Math.sqrt(3) },
    startWith: ['r', 't'],
    equation: '{r}(cos {t}° + i sin {t}°) = {a} + {b}i',
    pictureLabels: ['a', 'b'],
    representation: { kind: 'complexPlane', z: { modulus: 'r', argument: 't' }, polar: true },
  },
  {
    id: 'm.12.polar~product',
    title: 'Multiplying in polar form',
    use: 'Use this for “Multiply 2(cos 30° + i sin 30°) by 3(cos 60° + i sin 60°).”',
    assumptions: [
      'Multiply the moduli and add the arguments.',
      'So multiplying by w stretches z by |w| and turns it by w’s argument.',
      'Subtract 360° from an argument past 360° if you want it on one turn.',
    ],
    variables: [
      V('r1', 'r₁', 'Modulus of z', { min: 0, max: 1000, step: 0.01 }),
      deg('t1', 'θ₁', 'Argument of z', 0, 360),
      V('r2', 'r₂', 'Modulus of w', { min: 0, max: 1000, step: 0.01 }),
      deg('t2', 'θ₂', 'Argument of w', 0, 360),
      comp('c', 'c', 'Real part of w', 1000, { derived: true }),
      comp('d', 'd', 'Imaginary part of w', 1000, { derived: true }),
      V('r', 'r', 'Modulus of zw', { min: 0, max: 1000000, step: 0.01 }),
      deg('t', 'θ', 'Argument of zw', 0, 720),
    ],
    ...rels(
      rel('r = r₁ × r₂', '{r} = {r1} × {r2}', ['r', 'r1', 'r2'], (v) => v.r! - v.r1! * v.r2!, {
        r: [(v) => v.r1! * v.r2!, '{r1} × {r2}', 'Moduli multiply.'],
        r1: [(v) => div(v.r!, v.r2!), '{r} ÷ {r2}', 'Divide the product’s modulus by w’s.'],
        r2: [(v) => div(v.r!, v.r1!), '{r} ÷ {r1}', 'Divide the product’s modulus by z’s.'],
      }),
      rel('θ = θ₁ + θ₂', '{t} = {t1} + {t2}', ['t', 't1', 't2'], (v) => v.t! - v.t1! - v.t2!, {
        t: [(v) => v.t1! + v.t2!, '{t1} + {t2}', 'Arguments add: the turns add up.'],
        t1: [(v) => v.t! - v.t2!, '{t} − {t2}', 'Take w’s argument from the product’s.'],
        t2: [(v) => v.t! - v.t1!, '{t} − {t1}', 'Take z’s argument from the product’s.'],
      }),
      polarPart('c', 'r2', 't2', 'cos', 'w’s real part, to draw it: r₂ cos θ₂.'),
      polarPart('d', 'r2', 't2', 'sin', 'w’s imaginary part, to draw it: r₂ sin θ₂.'),
    ),
    example: { r1: 2, t1: 30, r2: 3, t2: 60, c: 1.5, d: 3 * sind(60), r: 6, t: 90 },
    startWith: ['r1', 't1', 'r2', 't2'],
    representation: {
      kind: 'complexPlane',
      z: { modulus: 'r1', argument: 't1' },
      w: { re: 'c', im: 'd' },
      op: 'product',
      polar: true,
    },
  },
  {
    id: 'm.12.polar~de-moivre',
    title: 'Powers by De Moivre’s theorem',
    use: 'Use this for “Find (1 + i)⁸ with De Moivre’s theorem.”',
    assumptions: [
      'Write a + bi in polar form first: r = √(a² + b²), θ in the quadrant of (a, b).',
      'De Moivre: (r(cos θ + i sin θ))ⁿ = rⁿ(cos nθ + i sin nθ).',
      'Raise the modulus to the nth power and multiply the argument by n.',
    ],
    variables: [
      real('a', 'a', 'Real part', -10, 10),
      real('b', 'b', 'Imaginary part', -10, 10),
      V('n', 'n', 'Power', { integer: true, min: 1, max: 12 }),
      V('r', 'r', 'Modulus of a + bi', { min: 0, max: 15, step: 0.0001, derived: true }),
      deg('t', 'θ', 'Argument of a + bi', 0, 360, { derived: true }),
      V('R', 'R', 'Modulus of the power', { min: 0, max: 1e15, step: 0.01, derived: true }),
      deg('T', 'nθ', 'Argument of the power', 0, 4320, { derived: true }),
      V('p', 'p', 'Real part of the power', { min: -1e15, max: 1e15, step: 0.01, derived: true }),
      V('q', 'q', 'Imaginary part of the power', {
        min: -1e15,
        max: 1e15,
        step: 0.01,
        derived: true,
      }),
    ],
    ...rels(
      polarDistance('r', 'a', 'b', false),
      direction('t', 'a', 'b', 'point'),
      derive(
        'R = rⁿ',
        '{R} = {r}^{n}',
        'R',
        ['r', 'n'],
        (v) => v.r! ** v.n!,
        '{r}^{n}',
        'Raise the modulus to the nth power.',
      ),
      derive(
        'T = nθ',
        '{T} = {n} × {t}',
        'T',
        ['n', 't'],
        (v) => v.n! * v.t!,
        '{n} × {t}',
        'Multiply the argument by n: n turns of θ.',
      ),
      polarPart('p', 'R', 'T', 'cos', 'Back to a + bi: the real part is R cos nθ.'),
      polarPart('q', 'R', 'T', 'sin', 'The imaginary part is R sin nθ.'),
    ),
    example: { a: 1, b: 1, n: 8, r: Math.SQRT2, t: 45, R: 16, T: 360, p: 16, q: 0 },
    startWith: ['a', 'b', 'n'],
    equation: '({a} + {b}i)^{n} = {p} + {q}i',
    representation: { kind: 'complexPlane', z: { modulus: 'R', argument: 'T' }, polar: true },
  },
  {
    id: 'm.12.polar~rose',
    title: 'Rose curves',
    use: 'Use this for “How many petals does r = 4 cos 2θ have? Find r at θ = 30°.”',
    assumptions: [
      'r = a cos(nθ) draws a rose: n petals when n is odd, 2n when n is even.',
      'Each petal is a long; a negative r is plotted on the opposite ray.',
      'The whole curve is drawn as θ runs once around.',
    ],
    variables: [
      real('a', 'a', 'Petal length', -20, 20),
      V('n', 'n', 'Number in cos nθ', { integer: true, min: 1, max: 8 }),
      deg('t', 'θ', 'Angle', 0, 360),
      real('r', 'r', 'Distance from the pole', -20, 20),
      V('P', 'P', 'Petals', { integer: true, min: 1, max: 16, derived: true }),
    ],
    ...rels(
      rel(
        'r = a cos(nθ)',
        '{r} = {a} × cos({n} × {t}°)',
        ['r', 'a', 'n', 't'],
        (v) => v.r! - v.a! * cosd(v.n! * v.t!),
        {
          r: [
            (v) => exact(v.a! * cosd(v.n! * v.t!)),
            '{a} × cos({n} × {t}°)',
            'Put θ into the curve’s equation.',
          ],
        },
      ),
      rel(
        'P = n or 2n',
        '{P} = {n} if {n} is odd, 2 × {n} if even',
        ['P', 'n'],
        (v) => v.P! - (v.n! % 2 ? v.n! : 2 * v.n!),
        {
          P: [
            (v) => (v.n! % 2 ? v.n! : 2 * v.n!),
            (v: Values) => (v.n! % 2 ? '{n}' : '2 × {n}'),
            'An odd n retraces its petals; an even n gives twice as many.',
          ],
        },
        { check: (v) => `${fmt(v.P!)} = ${v.n! % 2 ? fmt(v.n!) : `2 × ${fmt(v.n!)}`}` },
      ),
    ),
    example: { a: 4, n: 2, t: 30, r: 2, P: 4 },
    startWith: ['a', 'n', 't'],
    representation: {
      kind: 'polarGrid',
      curve: { shape: 'rose', a: 'a', n: 'n' },
      point: { r: 'r', theta: 't' },
    },
  },
  {
    id: 'm.12.polar~limacon',
    title: 'Limaçons and cardioids',
    use: 'Use this for “Find r on r = 2 + 2 cos θ at θ = 60°” and the curve’s shape.',
    assumptions: [
      'r = a + b cos θ: a = b is a cardioid, through the pole with a heart shape.',
      'a < b has an inner loop; a > b has a dimple, or is an oval when a ≥ 2b.',
      'A negative r is plotted on the opposite ray.',
    ],
    variables: [
      real('a', 'a', 'Constant a', -20, 20),
      real('b', 'b', 'Number before cos θ', -20, 20),
      deg('t', 'θ', 'Angle', 0, 360),
      real('r', 'r', 'Distance from the pole', -40, 40),
    ],
    ...rels(
      rel(
        'r = a + b cos θ',
        '{r} = {a} + {b} × cos({t}°)',
        ['r', 'a', 'b', 't'],
        (v) => v.r! - v.a! - v.b! * cosd(v.t!),
        {
          r: [
            (v) => exact(v.a! + v.b! * cosd(v.t!)),
            '{a} + {b} × cos({t}°)',
            'Put θ into the curve’s equation.',
          ],
          a: [(v) => v.r! - v.b! * cosd(v.t!), '{r} − {b} × cos({t}°)', 'Take b cos θ from r.'],
        },
      ),
    ),
    example: { a: 2, b: 2, t: 60, r: 3 },
    startWith: ['a', 'b', 't'],
    representation: {
      kind: 'polarGrid',
      curve: { shape: 'cardioid', a: 'a', b: 'b' },
      point: { r: 'r', theta: 't' },
    },
  },
];

// ── Parametric equations ──

/** out = start + rate × t, solvable each way. */
const moveBy = (out: string, start: string, rate: string, t: string, which: string) =>
  rel(
    `${out} = ${start} + ${rate}t`,
    `{${out}} = {${start}} + {${rate}} × {${t}}`,
    [out, start, rate, t],
    (v) => v[out]! - v[start]! - v[rate]! * v[t]!,
    {
      [out]: [
        (v) => v[start]! + v[rate]! * v[t]!,
        `{${start}} + {${rate}} × {${t}}`,
        `Start at ${which}₀ and move ${rate} for each 1 of t.`,
      ],
      [start]: [
        (v) => v[out]! - v[rate]! * v[t]!,
        `{${out}} − {${rate}} × {${t}}`,
        'Take the move from the position.',
      ],
      [t]: [
        (v) => div(v[out]! - v[start]!, v[rate]!),
        `({${out}} − {${start}}) ÷ {${rate}}`,
        `Solve for t: the move in ${which} divided by ${rate}.`,
      ],
    },
  );

/** "− 3" for 3 and "+ 3" for −3: a number taken away, as written after a letter. */
const minusOf = (x: number) => (x < 0 ? `+ ${fmt(-x)}` : `− ${fmt(x)}`);

/** 4.9 m/s² is half of g = 9.8 m/s². */
const flightTime = (v: Values) => {
  const up = v.v! * sind(v.q!);
  return (up + Math.sqrt(up ** 2 + 19.6 * v.h!)) / 9.8;
};

const MATH_12_PARAMETRIC: ModuleDef[] = [
  // ── m.12.parametric (AP Precalculus 4.1–4.7) ──
  {
    id: 'm.12.parametric',
    assumptions: [
      't is the input; x and y are both outputs, and the point (x, y) moves as t grows.',
      'The arrows show the direction the point moves as t increases.',
      'To eliminate t, solve one equation for t and put it into the other: here a line of slope b ÷ a.',
    ],
    variables: [
      V('t', 't', 'Parameter', { min: -5, max: 5, step: 0.1 }),
      real('p', 'x₀', 'x at t = 0', -20, 20),
      real('q', 'y₀', 'y at t = 0', -20, 20),
      real('a', 'a', 'Change in x for each 1 of t', -10, 10),
      real('b', 'b', 'Change in y for each 1 of t', -10, 10),
      real('x', 'x', 'x at t', -100, 100),
      real('y', 'y', 'y at t', -100, 100),
      V('m', 'm', 'Slope of the line', { min: -10000, max: 10000, step: 0.0001, derived: true }),
    ],
    ...rels(
      moveBy('x', 'p', 'a', 't', 'x'),
      moveBy('y', 'q', 'b', 't', 'y'),
      withStep(
        derive(
          'm = b ÷ a',
          '{m} = {b} ÷ {a}',
          'm',
          ['b', 'a'],
          (v) => div(v.b!, v.a!),
          '{b} ÷ {a}',
          'Each 1 of t moves a across and b up, so the path’s slope is b over a.',
        ),
        'm',
        {
          note: (v) =>
            v.p === undefined || v.q === undefined || v.m === undefined
              ? ''
              : `→ y ${minusOf(v.q)} = ${fmt(v.m)}(x ${minusOf(v.p)})`,
        },
      ),
    ),
    example: { t: 2, p: 1, q: 3, a: 2, b: -1, x: 5, y: 1, m: -0.5 },
    startWith: ['t', 'p', 'q', 'a', 'b'],
    representation: {
      kind: 'polarGrid',
      parametric: {
        family: 'line',
        x0: 'p',
        y0: 'q',
        a: 'a',
        b: 'b',
        t: 't',
        range: [-5, 5],
        x: 'x',
        y: 'y',
      },
    },
  },
  {
    id: 'm.12.parametric~ellipse',
    title: 'An ellipse traced by an angle',
    use: 'Use this for “Eliminate the parameter from x = 1 + 3 cos t, y = −2 + 2 sin t.”',
    assumptions: [
      't is an angle from 0° to 360°; the point goes around once, counterclockwise.',
      'cos t = (x − h) ÷ a and sin t = (y − k) ÷ b, and cos²t + sin²t = 1.',
      'So ((x − h) ÷ a)² + ((y − k) ÷ b)² = 1: an ellipse with center (h, k), a circle when a = b.',
    ],
    variables: [
      real('h', 'h', 'Center, x', -20, 20),
      real('k', 'k', 'Center, y', -20, 20),
      real('a', 'a', 'Half-width', 0.5, 20),
      real('b', 'b', 'Half-height', 0.5, 20),
      deg('t', 't', 'Parameter (an angle)', 0, 360),
      real('x', 'x', 'x at t', -50, 50),
      real('y', 'y', 'y at t', -50, 50),
    ],
    ...rels(
      rel(
        'x = h + a cos t',
        '{x} = {h} + {a} × cos({t}°)',
        ['x', 'h', 'a', 't'],
        (v) => v.x! - v.h! - v.a! * cosd(v.t!),
        {
          x: [
            (v) => exact(v.h! + v.a! * cosd(v.t!)),
            '{h} + {a} × cos({t}°)',
            'Start at the center and go a cos t across.',
          ],
          h: [(v) => v.x! - v.a! * cosd(v.t!), '{x} − {a} × cos({t}°)', 'Take a cos t from x.'],
        },
      ),
      withStep(
        rel(
          'y = k + b sin t',
          '{y} = {k} + {b} × sin({t}°)',
          ['y', 'k', 'b', 't'],
          (v) => v.y! - v.k! - v.b! * sind(v.t!),
          {
            y: [
              (v) => exact(v.k! + v.b! * sind(v.t!)),
              '{k} + {b} × sin({t}°)',
              'Start at the center and go b sin t up.',
            ],
            k: [(v) => v.y! - v.b! * sind(v.t!), '{y} − {b} × sin({t}°)', 'Take b sin t from y.'],
          },
        ),
        'y',
        {
          note: (v) =>
            [v.h, v.k, v.a, v.b].some((x) => x === undefined)
              ? ''
              : `→ ((x ${minusOf(v.h!)}) ÷ ${fmt(v.a!)})² + ((y ${minusOf(v.k!)}) ÷ ${fmt(v.b!)})² = 1`,
        },
      ),
    ),
    example: { h: 1, k: -2, a: 3, b: 2, t: 60, x: 2.5, y: -2 + Math.sqrt(3) },
    startWith: ['t', 'h', 'k', 'a', 'b'],
    representation: {
      kind: 'polarGrid',
      parametric: {
        family: 'ellipse',
        h: 'h',
        k: 'k',
        a: 'a',
        b: 'b',
        t: 't',
        range: [0, 360],
        x: 'x',
        y: 'y',
      },
    },
  },
  {
    id: 'm.12.parametric~projectile',
    title: 'A launch as parametric equations',
    use: 'Use this for “A ball is thrown at 20 m/s, 30° up. Where is it after 1 s, and when does it land?”',
    assumptions: [
      'No air resistance; g = 9.8 m/s², so the fall is 4.9t² metres.',
      'x = (v cos θ)t and y = h + (v sin θ)t − 4.9t²: the parameter t is the time.',
      'It lands when y = 0: the positive root of that quadratic in t.',
    ],
    variables: [
      V('v', 'v', 'Launch speed', { unit: 'm/s', min: 0.5, max: 100, step: 0.5 }),
      deg('q', 'θ', 'Launch angle', 0, 90),
      V('h', 'h', 'Launch height', { unit: 'm', min: 0, max: 200, step: 0.5 }),
      V('t', 't', 'Time', { unit: 's', min: 0, max: 60, step: 0.01 }),
      V('X', 'x', 'Distance across at t', { unit: 'm', min: 0, max: 6000, step: 0.01 }),
      V('Y', 'y', 'Height at t', { unit: 'm', min: -20000, max: 1000, step: 0.01 }),
      V('T', 'T', 'Time to land', { unit: 's', min: 0, max: 60, step: 0.01, derived: true }),
    ],
    ...rels(
      rel(
        'x = v cos θ · t',
        '{X} = {v} × cos({q}°) × {t}',
        ['X', 'v', 'q', 't'],
        (v) => v.X! - v.v! * cosd(v.q!) * v.t!,
        {
          X: [
            (v) => v.v! * cosd(v.q!) * v.t!,
            '{v} × cos({q}°) × {t}',
            'Across, the speed stays v cos θ the whole flight.',
          ],
          t: [
            (v) => div(v.X!, v.v! * cosd(v.q!)),
            '{X} ÷ ({v} × cos({q}°))',
            'Divide the distance across by the speed across.',
          ],
        },
      ),
      rel(
        'y = h + v sin θ · t − 4.9t²',
        '{Y} = {h} + {v} × sin({q}°) × {t} − 4.9 × {t}²',
        ['Y', 'h', 'v', 'q', 't'],
        (v) => v.Y! - v.h! - v.v! * sind(v.q!) * v.t! + 4.9 * v.t! ** 2,
        {
          Y: [
            (v) => v.h! + v.v! * sind(v.q!) * v.t! - 4.9 * v.t! ** 2,
            '{h} + {v} × sin({q}°) × {t} − 4.9 × {t}²',
            'Start at h, rise at v sin θ, and fall 4.9t².',
          ],
          h: [
            (v) => v.Y! - v.v! * sind(v.q!) * v.t! + 4.9 * v.t! ** 2,
            '{Y} − {v} × sin({q}°) × {t} + 4.9 × {t}²',
            'Undo the rise and the fall.',
          ],
        },
      ),
      derive(
        'T: y = 0',
        '0 = {h} + {v} × sin({q}°) × {T} − 4.9 × {T}²',
        'T',
        ['v', 'q', 'h'],
        flightTime,
        '({v} × sin({q}°) + √(({v} × sin({q}°))² + 19.6 × {h})) ÷ 9.8',
        'Set y = 0 and use the quadratic formula; the positive root is when it lands.',
      ),
    ),
    example: {
      v: 20,
      q: 30,
      h: 1,
      t: 1,
      X: 20 * cosd(30),
      Y: 6.1,
      T: (10 + Math.sqrt(119.6)) / 9.8,
    },
    startWith: ['t', 'v', 'q', 'h'],
    unitSystems: ['metric'],
    representation: {
      kind: 'projectile',
      speed: 'v',
      angle: 'q',
      height: 'h',
      at: 't',
      x: 'X',
      y: 'Y',
      time: 'T',
      parametric: true,
    },
  },
];

// ── Limits ──

const quad = (v: Values, x: number) => v.a! * x ** 2 + v.b! * x + v.c!;

const MATH_12_LIMITS: ModuleDef[] = [
  // ── m.12.limits-intro (AP Calculus AB 1.2–2.2) ──
  {
    id: 'm.12.limits-intro',
    assumptions: [
      'The limit is the value f(x) approaches as x gets close to a, not the value f(a).',
      'Here f has no value at x = a (a hole in the graph), but the limit exists.',
      'Cancelling the common factor x − a is allowed because x never equals a on the way.',
    ],
    variables: [
      real('a', 'a', 'x approaches', -10, 10),
      real('b', 'b', 'The other zero', -10, 10),
      V('L', 'L', 'The limit', { min: -20, max: 20, step: 0.01, derived: true }),
      real('x', 'x', 'An x close to a', -30, 30),
      real('y', 'f(x)', 'f(x) there', -60, 60),
    ],
    ...rels(
      limit(
        'b ≠ a',
        'The other zero {b} is not {a}',
        ['a', 'b'],
        (v) => v.a !== v.b,
        'Pick another zero b: the page needs b and a apart, so the hole at a stands on its own.',
      ),
      limit(
        'x ≠ a',
        'f has no value at x = {a}, so {x} is not {a}',
        ['x', 'a'],
        (v) => v.x !== v.a,
        'f has no value at x = a (the hole): pick an x close to a instead.',
      ),
      withStep(
        derive(
          'L = a − b',
          '{L} = {a} − {b}',
          'L',
          ['a', 'b'],
          (v) => v.a! - v.b!,
          '{a} − {b}',
          'Cancel x − a: f(x) = x − b away from a, and x − b heads to a − b as x → a.',
        ),
        'L',
        {
          work: (v) =>
            [-0.1, -0.01, 0.01].map(
              (d) =>
                `x = ${fmt(v.a! + d)}: f(x) = ${fmt(v.a! + d)} − ${v.b! < 0 ? `(${fmt(v.b!)})` : fmt(v.b!)} = ${fmt(v.a! + d - v.b!)}`,
            ),
        },
      ),
      rel('f(x) = x − b', '{y} = {x} − {b}', ['y', 'x', 'b'], (v) => v.y! - v.x! + v.b!, {
        y: [(v) => v.x! - v.b!, '{x} − {b}', 'For x ≠ a, (x − a)(x − b) ÷ (x − a) is just x − b.'],
        x: [(v) => v.y! + v.b!, '{y} + {b}', 'Add b to f(x).'],
      }),
    ),
    example: { a: 3, b: -3, L: 6, x: 2.9, y: 5.9 },
    startWith: ['a', 'b', 'x'],
    representation: {
      kind: 'functionGraph',
      family: 'rational',
      zeros: ['a', 'b'],
      poles: ['a'],
      limit: { x: 'a' },
      at: { x: 'x', y: 'y' },
    },
  },
  {
    id: 'm.12.limits-intro~one-sided',
    title: 'One-sided limits and continuity',
    use: 'Use this for “f(x) = x + 1 for x < 2 and 2x − 3 for x ≥ 2. Is f continuous at 2?”',
    assumptions: [
      'Left of c the rule is m₁x + b₁; from c on it is m₂x + b₂, so f(c) = m₂c + b₂.',
      'The limit at c exists only when the left and right limits are equal (J = 0).',
      'f is continuous at c when the limit exists and equals f(c).',
    ],
    variables: [
      real('m1', 'm₁', 'Slope left of c', -20, 20),
      real('b1', 'b₁', 'Intercept left of c', -50, 50),
      real('m2', 'm₂', 'Slope from c on', -20, 20),
      real('b2', 'b₂', 'Intercept from c on', -50, 50),
      real('c', 'c', 'Where the rule changes', -10, 10),
      real('L1', 'L⁻', 'Limit from the left', -300, 300),
      real('L2', 'L⁺', 'Limit from the right, f(c)', -300, 300),
      V('J', 'J', 'Jump, L⁺ − L⁻', { min: -600, max: 600, step: 0.01, derived: true }),
    ],
    ...rels(
      rel(
        'L⁻ = m₁c + b₁',
        '{L1} = {m1} × {c} + {b1}',
        ['L1', 'm1', 'c', 'b1'],
        (v) => v.L1! - v.m1! * v.c! - v.b1!,
        {
          L1: [
            (v) => v.m1! * v.c! + v.b1!,
            '{m1} × {c} + {b1}',
            'From the left the left rule applies: put in x = c.',
          ],
          b1: [(v) => v.L1! - v.m1! * v.c!, '{L1} − {m1} × {c}', 'Take m₁c from the left limit.'],
        },
      ),
      rel(
        'L⁺ = m₂c + b₂',
        '{L2} = {m2} × {c} + {b2}',
        ['L2', 'm2', 'c', 'b2'],
        (v) => v.L2! - v.m2! * v.c! - v.b2!,
        {
          L2: [
            (v) => v.m2! * v.c! + v.b2!,
            '{m2} × {c} + {b2}',
            'From the right (and at c) the right rule applies: put in x = c.',
          ],
          b2: [(v) => v.L2! - v.m2! * v.c!, '{L2} − {m2} × {c}', 'Take m₂c from the right limit.'],
        },
      ),
      withStep(
        derive(
          'J = L⁺ − L⁻',
          '{J} = {L2} − {L1}',
          'J',
          ['L2', 'L1'],
          (v) => v.L2! - v.L1!,
          '{L2} − {L1}',
          'How far the graph jumps at c: 0 means the two sides meet.',
        ),
        'J',
        {
          note: (v) =>
            v.J === undefined
              ? ''
              : v.J === 0
                ? '→ the limit exists and equals f(c): continuous at c'
                : '→ the sides differ: no limit at c, so not continuous',
        },
      ),
    ),
    example: { m1: 1, b1: 1, m2: 2, b2: -3, c: 2, L1: 3, L2: 1, J: -2 },
    startWith: ['m1', 'b1', 'm2', 'b2', 'c'],
    pictureLabels: ['L1', 'L2', 'J'],
    representation: {
      kind: 'functionGraph',
      family: 'piecewise',
      pieces: [
        { f: { family: 'linear', m: 'm1', b: 'b1' }, to: 'c', ends: '()' },
        { f: { family: 'linear', m: 'm2', b: 'b2' }, from: 'c', ends: '[)' },
      ],
      limit: { x: 'c' },
    },
  },
  {
    id: 'm.12.limits-intro~derivative',
    title: 'From a secant slope to the derivative',
    use: 'Use this for “Find the slope of the secant of x² from 3 to 3.1, then the derivative at 3.”',
    assumptions: [
      'The secant through (x, f(x)) and (x + h, f(x + h)) has slope (f(x + h) − f(x)) ÷ h.',
      'For f(x) = ax² + bx + c that slope is 2ax + b + ah.',
      'As h → 0 the secant turns into the tangent, and its slope into the derivative 2ax + b.',
    ],
    variables: [
      real('a', 'a', 'Number before x²', -10, 10),
      real('b', 'b', 'Number before x', -50, 50),
      real('c', 'c', 'Constant', -100, 100),
      real('x', 'x', 'The point’s x', -10, 10),
      real('h', 'h', 'Step to the second point', -5, 5),
      V('m', 'm', 'Secant slope', { min: -10000, max: 10000, step: 0.0001, derived: true }),
      V('d', 'f′(x)', 'Derivative, the tangent’s slope', {
        min: -10000,
        max: 10000,
        step: 0.0001,
        derived: true,
      }),
    ],
    ...rels(
      limit(
        'h ≠ 0',
        'The step {h} is not 0',
        ['h'],
        (v) => v.h !== 0,
        'With h = 0 the two points are one point: there is no secant.',
      ),
      withStep(
        derive(
          'm = (f(x + h) − f(x)) ÷ h',
          '{m} = (f({x} + {h}) − f({x})) ÷ {h}, with f(x) = {a}x² + {b}x + {c}',
          'm',
          ['a', 'b', 'c', 'x', 'h'],
          (v) => div(quad(v, v.x! + v.h!) - quad(v, v.x!), v.h!),
          '(({a} × ({x} + {h})² + {b} × ({x} + {h}) + {c}) − ({a} × {x}² + {b} × {x} + {c})) ÷ {h}',
          'The rise from (x, f(x)) to (x + h, f(x + h)) over the run h.',
        ),
        'm',
        {
          work: (v) => [
            `f(${fmt(v.x! + v.h!)}) − f(${fmt(v.x!)}) = ${fmt(quad(v, v.x! + v.h!))} − ${fmt(quad(v, v.x!))} = ${fmt(quad(v, v.x! + v.h!) - quad(v, v.x!))}`,
          ],
        },
      ),
      derive(
        'f′(x) = 2ax + b',
        '{d} = 2 × {a} × {x} + {b}',
        'd',
        ['a', 'x', 'b'],
        (v) => 2 * v.a! * v.x! + v.b!,
        '2 × {a} × {x} + {b}',
        'The secant slope is 2ax + b + ah; let h shrink to 0.',
      ),
    ),
    example: { a: 1, b: 0, c: 0, x: 3, h: 0.1, m: 6.1, d: 6 },
    startWith: ['a', 'b', 'c', 'x', 'h'],
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'standard',
      a: 'a',
      b: 'b',
      c: 'c',
      secant: { x: 'x', h: 'h', slope: 'm' },
    },
  },
  {
    id: 'm.12.limits-intro~infinity',
    title: 'Limits at infinity',
    use: 'Use this for “Find the limit of (2x + 1) ÷ (x − 3) as x → ∞.”',
    assumptions: [
      'For (px + q) ÷ (rx + s), far out the x terms swamp the constants: f(x) approaches p ÷ r.',
      'So y = p ÷ r is a horizontal asymptote; x = −s ÷ r is a vertical one.',
      'Try x = 1000: f(1000) is already close to the limit.',
    ],
    variables: [
      real('p', 'p', 'Number before x on top', -50, 50),
      real('q', 'q', 'Constant on top', -100, 100),
      real('r', 'r', 'Number before x below', -50, 50),
      real('s', 's', 'Constant below', -100, 100),
      V('z', 'z', 'Zero, −q ÷ p', { min: -10000, max: 10000, step: 0.0001, derived: true }),
      V('v', 'v', 'Vertical asymptote, −s ÷ r', {
        min: -10000,
        max: 10000,
        step: 0.0001,
        derived: true,
      }),
      V('L', 'L', 'Limit as x → ∞', { min: -10000, max: 10000, step: 0.0001, derived: true }),
      real('x', 'x', 'A large x', -1000000, 1000000),
      real('y', 'f(x)', 'f(x) there', -1e9, 1e9),
    ],
    ...rels(
      limit(
        'p, r ≠ 0',
        'Both {p} and {r} are not 0',
        ['p', 'r'],
        (v) => v.p !== 0 && v.r !== 0,
        'With p or r at 0 the top or bottom has no x term: this page is for a line over a line.',
      ),
      limit(
        'no common factor',
        'The zero −{q} ÷ {p} is not the pole −{s} ÷ {r}',
        ['p', 'q', 'r', 's'],
        (v) => v.q! * v.r! !== v.s! * v.p!,
        'The top and bottom share a factor there: it cancels to a hole, not an asymptote.',
      ),
      limit(
        'x ≠ v',
        'f has no value at x = −{s} ÷ {r}, so {x} is not there',
        ['x', 'r', 's'],
        (v) => v.r! * v.x! + v.s! !== 0,
        'The bottom is 0 at that x: pick another x.',
      ),
      derive(
        'z = −q ÷ p',
        '{z} = −{q} ÷ {p}',
        'z',
        ['q', 'p'],
        (v) => div(-v.q!, v.p!),
        '−{q} ÷ {p}',
        'The top is 0 there: px + q = 0.',
      ),
      derive(
        'v = −s ÷ r',
        '{v} = −{s} ÷ {r}',
        'v',
        ['s', 'r'],
        (v) => div(-v.s!, v.r!),
        '−{s} ÷ {r}',
        'The bottom is 0 there: rx + s = 0.',
      ),
      derive(
        'L = p ÷ r',
        '{L} = {p} ÷ {r}',
        'L',
        ['p', 'r'],
        (v) => div(v.p!, v.r!),
        '{p} ÷ {r}',
        'Divide top and bottom by x: q ÷ x and s ÷ x go to 0, leaving p ÷ r.',
      ),
      rel(
        'f(x) = (px + q) ÷ (rx + s)',
        '{y} = ({p} × {x} + {q}) ÷ ({r} × {x} + {s})',
        ['y', 'p', 'x', 'q', 'r', 's'],
        (v) => v.y! * (v.r! * v.x! + v.s!) - (v.p! * v.x! + v.q!),
        {
          y: [
            (v) => div(v.p! * v.x! + v.q!, v.r! * v.x! + v.s!),
            '({p} × {x} + {q}) ÷ ({r} × {x} + {s})',
            'Put x into the function.',
          ],
        },
      ),
    ),
    example: { p: 2, q: 1, r: 1, s: -3, z: -0.5, v: 3, L: 2, x: 1000, y: 2001 / 997 },
    startWith: ['p', 'q', 'r', 's', 'x'],
    representation: {
      kind: 'functionGraph',
      family: 'rational',
      a: 'L',
      zeros: ['z'],
      poles: ['v'],
      shows: { ha: 'L' },
    },
  },
];

export const MATH_12_MODULES: ModuleDef[] = [
  ...MATH_12_TRIG,
  ...MATH_12_TRIG_EQUATIONS,
  ...MATH_12_VECTORS,
  ...MATH_12_POLAR,
  ...MATH_12_PARAMETRIC,
  ...MATH_12_MATRICES,
  ...MATH_12_LIMITS,
  ...MATH_12_CONICS,
  ...MATH_12_STATS,
];
