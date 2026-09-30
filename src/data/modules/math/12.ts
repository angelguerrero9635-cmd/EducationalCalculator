/**
 * Grade 12 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md; the
 * direction plan and build notes: docs/BUILD_HS.md.
 * The layout pages (explore, sort, sequence, observe) are in `../layouts/math12.ts`.
 */
import { chiCdf, invPhi, Phi } from '@/components/module/reps/statMath';
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
  solves: Record<string, [Solver, string, string]>,
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
function zScore(z: string, x: string, m: string, s: string): Rel {
  return rel(
    `${z} = (${x} − ${m}) ÷ ${s}`,
    `{${z}} = ({${x}} − {${m}}) ÷ {${s}}`,
    [z, x, m, s],
    (v) => v[z]! * v[s]! - (v[x]! - v[m]!),
    {
      [z]: [
        (v) => div(v[x]! - v[m]!, v[s]!),
        `({${x}} − {${m}}) ÷ {${s}}`,
        'How many standard errors the estimate is from the value H₀ claims.',
      ],
      [x]: [
        (v) => v[m]! + v[z]! * v[s]!,
        `{${m}} + {${z}} × {${s}}`,
        'Start at the H₀ value and go z standard errors.',
      ],
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
const leftTail = (P: string, z: string) =>
  rel(`${P} = Φ(${z})`, `{${P}} = Φ({${z}})`, [P, z], (v) => v[P]! - Phi(v[z]!), {
    [P]: [(v) => Phi(v[z]!), `Φ({${z}})`, 'Hₐ says “less”, so the p-value is the area left of z.'],
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
];

export const MATH_12_MODULES: ModuleDef[] = [...MATH_12_STATS];
