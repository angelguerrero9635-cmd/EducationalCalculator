/**
 * Grade 12 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md; the
 * direction plan and build notes: docs/BUILD_HS.md.
 * The layout pages (explore, sort, sequence, observe) are in `../layouts/math12.ts`.
 */
import { chiCdf, invPhi, Phi } from '@/components/module/reps/statMath';
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
  expr: string,
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

/** 0 < p < 1, or undefined. */
const inOpen = (p: number) => (p > 0 && p < 1 ? p : undefined);

// ── Statistics ──

const prob = (id: string, symbol: string, name: string, extra: Partial<VariableDef> = {}) =>
  V(id, symbol, name, { min: 0, max: 1, step: 0.0001, ...extra });
const zVar = (id = 'z', name = 'Test statistic') =>
  V(id, 'z', name, { min: -50, max: 50, step: 0.01 });
const alphaVar = V('a', 'α', 'Significance level', {
  allowed: [0.01, 0.05, 0.1],
  min: 0.01,
  max: 0.1,
});
const ALPHA_WHY =
  'The significance level is chosen before the test; the picture compares the p-value with it.';

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

/** A number as the steps show it (at most 4 decimals). */
const fmt = (x: number) => formatNumber(Number(x.toFixed(4)));

/** The 2 × 3 table of the independence test, row by row. */
const CELLS = [
  ['a', 'b', 'e'],
  ['c', 'd', 'f'],
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
      seProportion('E', 'p0', 'n', 'If H₀ is true, p̂ spreads by √(p₀(1 − p₀) ÷ n): use p₀, not p̂.'),
      zScore('z', 'p', 'p0', 'E'),
      twoTail('P', 'z'),
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
    ...rels(seMean('E', 's', 'n'), zScore('z', 'x', 'm', 'E'), leftTail('P', 'z')),
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
    id: 'm.12.hypothesis-testing~two-sample',
    title: 'Two-sample z-test for means',
    use: 'Use this for “Do two groups have different means?” from two samples of 30 or more.',
    assumptions: [
      'Two independent random samples, or two groups assigned at random; H₀: μ₁ = μ₂, Hₐ: μ₁ ≠ μ₂.',
      'Each sample has 30 or more, so z is close to the t-test a statistics class uses.',
      'With random assignment, a significant difference is evidence the treatment caused it.',
    ],
    variables: [
      V('x1', 'x̄₁', 'Mean of sample 1', { unit: 'cm', min: -10000, max: 10000, step: 0.1 }),
      V('s1', 's₁', 'Standard deviation 1', { unit: 'cm', min: 0.01, max: 10000, step: 0.1 }),
      V('n1', 'n₁', 'Size of sample 1', { integer: true, min: 2, max: 100000 }),
      V('x2', 'x̄₂', 'Mean of sample 2', { unit: 'cm', min: -10000, max: 10000, step: 0.1 }),
      V('s2', 's₂', 'Standard deviation 2', { unit: 'cm', min: 0.01, max: 10000, step: 0.1 }),
      V('n2', 'n₂', 'Size of sample 2', { integer: true, min: 2, max: 100000 }),
      V('E', 'SE', 'Standard error of x̄₁ − x̄₂', {
        unit: 'cm',
        min: 0.0001,
        max: 10000,
        step: 0.01,
        derived: true,
      }),
      zVar(),
      prob('P', 'P', 'p-value'),
      alphaVar,
    ],
    ...rels(
      derive(
        'SE = √(s₁²/n₁ + s₂²/n₂)',
        '{E} = √({s1}² ÷ {n1} + {s2}² ÷ {n2})',
        'E',
        ['s1', 'n1', 's2', 'n2'],
        (v) => Math.sqrt(v.s1! ** 2 / v.n1! + v.s2! ** 2 / v.n2!),
        '√({s1}² ÷ {n1} + {s2}² ÷ {n2})',
        'The variances of two independent means add; the root gives the spread of the difference.',
      ),
      rel(
        'z = (x̄₁ − x̄₂) ÷ SE',
        '{z} = ({x1} − {x2}) ÷ {E}',
        ['z', 'x1', 'x2', 'E'],
        (v) => v.z! * v.E! - (v.x1! - v.x2!),
        {
          z: [
            (v) => div(v.x1! - v.x2!, v.E!),
            '({x1} − {x2}) ÷ {E}',
            'H₀ says the difference is 0: count how many standard errors it is from 0.',
          ],
          x1: [(v) => v.x2! + v.z! * v.E!, '{x2} + {z} × {E}', 'Go z standard errors from x̄₂.'],
          x2: [
            (v) => v.x1! - v.z! * v.E!,
            '{x1} − {z} × {E}',
            'Go back z standard errors from x̄₁.',
          ],
        },
      ),
      twoTail('P', 'z'),
    ),
    standalone: { vars: ['a'], why: ALPHA_WHY },
    example: {
      x1: 52,
      s1: 6,
      n1: 36,
      x2: 49,
      s2: 6,
      n2: 36,
      E: Math.SQRT2,
      z: 3 / Math.SQRT2,
      P: 2 * (1 - Phi(3 / Math.SQRT2)),
      a: 0.05,
    },
    startWith: ['x1', 's1', 'n1', 'x2', 's2', 'n2', 'a'],
    unitSystems: ['metric'],
    representation: {
      kind: 'normalCurve',
      mean: 0,
      sd: 'E',
      axis: 'Difference x̄₁ − x̄₂ (cm) if H₀ is true',
      test: { stat: 'z', alpha: 'a', tail: 'two', p: 'P' },
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
      V('lo', 'L', 'Lower end', { min: -3000000, max: 3000000, step: 0.01 }),
      V('hi', 'U', 'Upper end', { min: -3000000, max: 3000000, step: 0.01 }),
    ],
    ...rels(
      critical,
      seMean('SE', 's', 'n'),
      margin,
      end('lo', 'x', 'E', -1),
      end('hi', 'x', 'E', 1),
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
      derive(
        'n = ⌈z⋆² × p(1 − p) ÷ E²⌉',
        '{n} = ⌈{z}² × {p} × (1 − {p}) ÷ {E}²⌉',
        'n',
        ['z', 'p', 'E'],
        (v) => Math.ceil(exact((v.z! ** 2 * v.p! * (1 - v.p!)) / v.E! ** 2)),
        '⌈{z}² × {p} × (1 − {p}) ÷ {E}²⌉',
        'Square E = z⋆√(p(1 − p) ÷ n) and solve for n, then round up to a whole person.',
      ),
      derive(
        'SE = √(p(1 − p) ÷ n)',
        '{SE} = √({p} × (1 − {p}) ÷ {n})',
        'SE',
        ['p', 'n'],
        (v) => Math.sqrt((v.p! * (1 - v.p!)) / v.n!),
        '√({p} × (1 − {p}) ÷ {n})',
        'The standard error with that many people; z⋆ of them is within the margin.',
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
      leftTail('P', 'z', 'Φ(z) is the area under the standard normal curve left of z.'),
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
      rightTail('P', 'z', 'The whole area is 1; take away the area left of z.'),
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
    use: 'Use this for “In 40 trials with p = 0.25, find the mean and standard deviation of the count.”',
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
          work: (v) => {
            const E = [v.p1!, v.p2!, v.p3!].map((p) => v.n! * p);
            const O = [v.O1!, v.O2!, v.O3!];
            const terms = O.map((o, i) => (o - E[i]!) ** 2 / E[i]!);
            return [
              `Expected counts E = n × p: ${E.map(fmt).join(', ')}`,
              `${terms.map(fmt).join(' + ')} = ${fmt(terms.reduce((t, x) => t + x, 0))}`,
            ];
          },
        },
      ),
      chiTail2,
    ),
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
    },
    startWith: ['O1', 'O2', 'O3', 'p1', 'p2'],
    representation: {
      kind: 'normalCurve',
      chiSquare: { df: 2, stat: 'X', p: 'P' },
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
      V('e', 'e', 'Grade 11, car', { integer: true, min: 0, max: 100000 }),
      V('c', 'c', 'Grade 12, walk', { integer: true, min: 0, max: 100000 }),
      V('d', 'd', 'Grade 12, bus', { integer: true, min: 0, max: 100000 }),
      V('f', 'f', 'Grade 12, car', { integer: true, min: 0, max: 100000 }),
      V('X', 'X²', 'Chi-square statistic', { min: 0, max: 10000000, step: 0.01, derived: true }),
      prob('P', 'P', 'p-value', { derived: true }),
    ],
    ...rels(
      {
        relation: {
          id: 'X² = Σ(O − E)² ÷ E',
          display: '{X} = Σ(O − E)² ÷ E over the cells {a}, {b}, {e}, {c}, {d}, {f}',
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
            how: 'Each cell expects row total × column total ÷ grand total; add (O − E)² ÷ E over the six cells.',
            work: (v) => {
              const cells = expectedCounts(v);
              const terms = cells.map((c) => (c.O - c.E) ** 2 / c.E);
              return [
                `Expected counts, row by row: ${cells.map((c) => fmt(c.E)).join(', ')}`,
                `${terms.map(fmt).join(' + ')} = ${fmt(terms.reduce((t, x) => t + x, 0))}`,
              ];
            },
          },
        },
      },
      chiTail2,
    ),
    example: {
      a: 20,
      b: 30,
      e: 50,
      c: 30,
      d: 20,
      f: 50,
      X: 4,
      P: Math.exp(-2),
    },
    startWith: ['a', 'b', 'e', 'c', 'd', 'f'],
    representation: {
      kind: 'table',
      twoWay: {
        rows: ['Grade 11', 'Grade 12'],
        cols: ['Walk', 'Bus', 'Car'],
        cells: [
          ['a', 'b', 'e'],
          ['c', 'd', 'f'],
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

export const MATH_12_MODULES: ModuleDef[] = [...MATH_12_STATS, ...MATH_12_CONICS];
