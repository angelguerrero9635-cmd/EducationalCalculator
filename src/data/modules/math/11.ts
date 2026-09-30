/**
 * Grade 11 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md; the
 * direction plan and build notes: docs/BUILD_HS.md and docs/build/m.11.md.
 * The layout pages (explore, sort, sequence, observe) are in `../layouts/math11.ts`.
 */
import { invPhi, Phi } from '@/components/module/reps/statMath';
import type { Relation, Values, VariableDef } from '@/engine/types';

import { div } from '../helpers';
import type { ModuleDef, StepText } from '../types';

// ── Toolkit ──

type Solver = (v: Values) => number | number[] | undefined;
type Rule = { relation: Relation; steps: Record<string, StepText> };

/** A value: its id, symbol, name and any options (range, step, derived…). */
const V = (
  id: string,
  symbol: string,
  name: string,
  extra: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...extra });
/** Whole numbers from min to max. */
const W = (id: string, symbol: string, name: string, min: number, max: number) =>
  V(id, symbol, name, { integer: true, min, max });
/** Rounded to 12 significant figures, so 0.1 + 0.2 is 0.3 when a value is worked out. */
const exact = (x: number) => Number(x.toPrecision(12));
/** A finite result, or nothing. */
const fin = (x: number | undefined) =>
  x !== undefined && Number.isFinite(x) ? exact(x) : undefined;

/**
 * A relation with its steps: for each value it is solved for, the solver, the rearranged right
 * side and the explanation. A solver with no argument (`() => undefined`) never solves for its
 * value and gets no step.
 */
function rule(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  parts: Record<string, [Solver, StepText['expr'], StepText['how']] | [Solver]>,
  extra: Partial<Relation> & { work?: Record<string, StepText['work']> } = {},
): Rule {
  const { work, ...more } = extra;
  const solve: Record<string, Solver> = {};
  const steps: Record<string, StepText> = {};
  for (const [v, [fn, expr, how]] of Object.entries(parts)) {
    solve[v] = fn;
    if (fn.length > 0 && expr !== undefined && how !== undefined)
      steps[v] = { expr, how, ...(work?.[v] ? { work: work[v] } : {}) };
  }
  return { relation: { id, display, vars, residual, solve, ...more }, steps };
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
  extra: Partial<Relation> = {},
): Rule {
  return rule(
    id,
    display,
    [x, ...inputs],
    (v) => v[x]! - (f(v) ?? NaN),
    {
      [x]: [(v: Values) => fin(f(v)), expr, how],
      ...Object.fromEntries(inputs.map((i) => [i, [() => undefined]])),
    },
    extra,
  );
}

/**
 * A limit the rule needs (b ≠ 1, |r| < 1): values that break it are rejected, with the reason
 * under the box.
 */
function limit(id: string, vars: string[], ok: (v: Values) => boolean, why: string): Rule {
  return {
    relation: {
      id,
      constraint: true,
      display: id,
      vars,
      residual: (v: Values) => (ok(v) ? 0 : 1),
      solve: {},
      message: (v: Values) => (ok(v) ? undefined : why),
    },
    steps: {},
  };
}

/** A page from its rules: the relations and the steps keyed by relation. */
function page(m: Omit<ModuleDef, 'relations' | 'steps'> & { rules: Rule[] }): ModuleDef {
  const { rules, ...rest } = m;
  return {
    ...rest,
    relations: rules.map((r) => r.relation),
    steps: Object.fromEntries(rules.map((r) => [r.relation.id, r.steps])),
  };
}

// ── Statistics helpers ──

const inOpen = (p: number) => p > 0 && p < 1;
/** A probability, 0 to 1. */
const prob = (id: string, symbol: string, name: string, extra: Partial<VariableDef> = {}) =>
  V(id, symbol, name, { min: 0, max: 1, step: 0.0001, ...extra });
const zVar = (id = 'z', name = 'z-score', symbol = 'z') =>
  V(id, symbol, name, { min: -6, max: 6, step: 0.01 });

/** z = (x − μ) ÷ σ. */
const zScore = (z: string, x: string, m: string, s: string): Rule =>
  rule(
    `${z} = (${x} − ${m}) ÷ ${s}`,
    `{${z}} = ({${x}} − {${m}}) ÷ {${s}}`,
    [z, x, m, s],
    (v) => v[z]! * v[s]! - (v[x]! - v[m]!),
    {
      [z]: [
        (v) => fin(div(v[x]! - v[m]!, v[s]!)),
        `({${x}} − {${m}}) ÷ {${s}}`,
        'How far the value is from the mean, in standard deviations.',
      ],
      [x]: [
        (v) => fin(v[m]! + v[z]! * v[s]!),
        `{${m}} + {${z}} × {${s}}`,
        'Start at the mean and go z standard deviations.',
      ],
      [m]: [
        (v) => fin(v[x]! - v[z]! * v[s]!),
        `{${x}} − {${z}} × {${s}}`,
        'Go back z standard deviations from the value.',
      ],
      [s]: [
        (v) => fin(div(v[x]! - v[m]!, v[z]!)),
        `({${x}} − {${m}}) ÷ {${z}}`,
        'The distance from the mean, split into z equal steps.',
      ],
    },
  );

/** P = Φ(z), the area left of z. */
const leftArea = (P: string, z: string): Rule =>
  rule(`${P} = Φ(${z})`, `{${P}} = Φ({${z}})`, [P, z], (v) => v[P]! - Phi(v[z]!), {
    [P]: [(v) => Phi(v[z]!), `Φ({${z}})`, 'Φ(z) is the area under the standard curve left of z.'],
    [z]: [
      (v) => (inOpen(v[P]!) ? invPhi(v[P]!) : undefined),
      `invNorm({${P}})`,
      'invNorm undoes Φ: the z with that area to its left.',
    ],
  });

/** E = N × P, the expected count out of N. */
const countOf = (E: string, N: string, P: string, what: string): Rule =>
  rule(`${E} = ${N} × ${P}`, `{${E}} = {${N}} × {${P}}`, [E, N, P], (v) => v[E]! - v[N]! * v[P]!, {
    [E]: [(v) => exact(v[N]! * v[P]!), `{${N}} × {${P}}`, what],
    [N]: [
      (v) => fin(div(v[E]!, v[P]!)),
      `{${E}} ÷ {${P}}`,
      'Divide the count by the share it is of the whole.',
    ],
    [P]: [(v) => fin(div(v[E]!, v[N]!)), `{${E}} ÷ {${N}}`, 'The count as a share of the whole.'],
  });

/** a = b ± c. */
const offset = (a: string, b: string, c: string, sign: 1 | -1, how: string): Rule => {
  const op = sign > 0 ? '+' : '−';
  return rule(
    `${a} = ${b} ${op} ${c}`,
    `{${a}} = {${b}} ${op} {${c}}`,
    [a, b, c],
    (v) => v[a]! - (v[b]! + sign * v[c]!),
    {
      [a]: [(v) => exact(v[b]! + sign * v[c]!), `{${b}} ${op} {${c}}`, how],
      [b]: [
        (v) => exact(v[a]! - sign * v[c]!),
        `{${a}} ${sign > 0 ? '−' : '+'} {${c}}`,
        'The center is halfway between the two ends.',
      ],
      [c]: [
        (v) => exact(sign * (v[a]! - v[b]!)),
        sign > 0 ? `{${a}} − {${b}}` : `{${b}} − {${a}}`,
        'The distance from the center to that end.',
      ],
    },
  );
};

const MU = (unit?: string, min = -1000, max = 1000) =>
  V('m', 'μ', 'Mean', { unit, min, max, step: 0.5 });
const SIGMA = (unit?: string, max = 500) =>
  V('s', 'σ', 'Standard deviation', { unit, min: 0.01, max, step: 0.1 });

/** The share within 1, 2 or 3 standard deviations, in percent, by the 68–95–99.7 rule. */
const EMPIRICAL: Record<number, number> = { 1: 68, 2: 95, 3: 99.7 };

export const MATH_11_MODULES: ModuleDef[] = [
  // ── Normal distributions, z-scores and margin of error (S-ID.4, S-IC.4) ──
  page({
    id: 'm.11.normal-distribution',
    assumptions: [
      'The data are roughly bell-shaped and symmetric about the mean μ.',
      'A z-score counts standard deviations from the mean: above the mean it is positive.',
      'The area under the curve left of x is the share of the data below x.',
    ],
    variables: [
      MU('cm', 0, 300),
      SIGMA('cm', 100),
      V('x', 'x', 'Height', { unit: 'cm', min: 0, max: 300, step: 0.5 }),
      zVar(),
      prob('P', 'P', 'Share below x'),
    ],
    rules: [zScore('z', 'x', 'm', 's'), leftArea('P', 'z')],
    example: { m: 170, s: 8, x: 182, z: 1.5, P: Phi(1.5) },
    startWith: ['m', 's', 'x'],
    unitSystems: ['metric'],
    equation: '{z} = {{x:unit} − {m:unit}}/{s:unit}',
    representation: {
      kind: 'normalCurve',
      mean: 'm',
      sd: 's',
      axis: 'Height (cm)',
      shade: { to: 'x', area: 'P' },
      mark: { x: 'x', z: 'z' },
    },
  }),
  page({
    id: 'm.11.normal-distribution~between',
    title: 'The share between two values',
    use: 'Use this for “Scores have μ = 50 and σ = 5. What share is between 45 and 60, and how many of 400?”',
    assumptions: [
      'The data are roughly normal, with mean μ and standard deviation σ.',
      'The share between a and b is the area left of b minus the area left of a.',
      'Of N values, about N × P fall between a and b.',
    ],
    variables: [
      MU(),
      SIGMA(),
      V('a', 'a', 'Lower value', { min: -2000, max: 2000, step: 0.5 }),
      V('b', 'b', 'Upper value', { min: -2000, max: 2000, step: 0.5 }),
      zVar('za', 'z-score of a', 'z₁'),
      zVar('zb', 'z-score of b', 'z₂'),
      prob('P', 'P', 'Share between a and b'),
      W('N', 'N', 'Values in all', 1, 10000),
      V('E', 'E', 'Expected count between a and b', { min: 0, max: 10000, step: 0.1 }),
    ],
    rules: [
      zScore('za', 'a', 'm', 's'),
      zScore('zb', 'b', 'm', 's'),
      rule(
        'P = Φ(z₂) − Φ(z₁)',
        '{P} = Φ({zb}) − Φ({za})',
        ['P', 'za', 'zb'],
        (v) => v.P! - (Phi(v.zb!) - Phi(v.za!)),
        {
          P: [
            (v) => Phi(v.zb!) - Phi(v.za!),
            'Φ({zb}) − Φ({za})',
            'The area left of b, less the area left of a.',
          ],
          zb: [
            (v) => (inOpen(v.P! + Phi(v.za!)) ? invPhi(v.P! + Phi(v.za!)) : undefined),
            'invNorm({P} + Φ({za}))',
            'The area left of b is P plus the area left of a.',
          ],
          za: [
            (v) => (inOpen(Phi(v.zb!) - v.P!) ? invPhi(Phi(v.zb!) - v.P!) : undefined),
            'invNorm(Φ({zb}) − {P})',
            'The area left of a is the area left of b less P.',
          ],
        },
      ),
      countOf('E', 'N', 'P', 'The share P of the N values.'),
    ],
    example: {
      m: 50,
      s: 5,
      a: 45,
      b: 60,
      za: -1,
      zb: 2,
      P: Phi(2) - Phi(-1),
      N: 400,
      E: 400 * (Phi(2) - Phi(-1)),
    },
    startWith: ['m', 's', 'a', 'b', 'N'],
    pictureLabels: ['N', 'E'],
    representation: {
      kind: 'normalCurve',
      mean: 'm',
      sd: 's',
      axis: 'Score',
      shade: { from: 'a', to: 'b', area: 'P' },
    },
  }),
  page({
    id: 'm.11.normal-distribution~outside',
    title: 'The share more than a distance from the mean',
    use: 'Use this for “Weights have μ = 500 g and σ = 2 g. How many of 500 packages are more than 3 g off?”',
    assumptions: [
      'The data are roughly normal, with mean μ and standard deviation σ.',
      'The curve is symmetric, so the two tails beyond d from the mean hold the same area.',
      'Of N values, about N × P are more than d from the mean.',
    ],
    variables: [
      MU('g', 0, 10000),
      SIGMA('g', 1000),
      V('d', 'd', 'Distance from the mean', { unit: 'g', min: 0.01, max: 5000, step: 0.1 }),
      V('lo', 'L', 'Lower cutoff', { unit: 'g', min: -5000, max: 15000, step: 0.1 }),
      V('hi', 'U', 'Upper cutoff', { unit: 'g', min: -5000, max: 15000, step: 0.1 }),
      V('z', 'z', 'z-score of d', { min: 0, max: 6, step: 0.01 }),
      prob('P', 'P', 'Share more than d from the mean'),
      W('N', 'N', 'Values in all', 1, 100000),
      V('E', 'E', 'Expected count outside', { min: 0, max: 100000, step: 0.1 }),
    ],
    rules: [
      offset('lo', 'm', 'd', -1, 'Go down d from the mean.'),
      offset('hi', 'm', 'd', 1, 'Go up d from the mean.'),
      rule('z = d ÷ σ', '{z} = {d} ÷ {s}', ['z', 'd', 's'], (v) => v.z! * v.s! - v.d!, {
        z: [(v) => fin(div(v.d!, v.s!)), '{d} ÷ {s}', 'The distance in standard deviations.'],
        d: [(v) => exact(v.z! * v.s!), '{z} × {s}', 'z standard deviations, in grams.'],
        s: [(v) => fin(div(v.d!, v.z!)), '{d} ÷ {z}', 'The distance split into z equal steps.'],
      }),
      rule(
        'P = 2 × (1 − Φ(z))',
        '{P} = 2 × (1 − Φ({z}))',
        ['P', 'z'],
        (v) => v.P! - 2 * (1 - Phi(v.z!)),
        {
          P: [
            (v) => 2 * (1 - Phi(v.z!)),
            '2 × (1 − Φ({z}))',
            'One tail is 1 − Φ(z); the other side has the same area.',
          ],
          z: [
            (v) => (inOpen(v.P!) ? invPhi(1 - v.P! / 2) : undefined),
            'invNorm(1 − {P} ÷ 2)',
            'Each tail holds half of P, so the area left of z is 1 − P ÷ 2.',
          ],
        },
      ),
      countOf('E', 'N', 'P', 'The share P of the N values.'),
    ],
    example: {
      m: 500,
      s: 2,
      d: 3,
      lo: 497,
      hi: 503,
      z: 1.5,
      P: 2 * (1 - Phi(1.5)),
      N: 500,
      E: 1000 * (1 - Phi(1.5)),
    },
    startWith: ['m', 's', 'd', 'N'],
    unitSystems: ['metric'],
    pictureLabels: ['d', 'z', 'N', 'E'],
    representation: {
      kind: 'normalCurve',
      mean: 'm',
      sd: 's',
      axis: 'Weight (g)',
      shade: { from: 'lo', to: 'hi', outside: true, area: 'P' },
    },
  }),
  page({
    id: 'm.11.normal-distribution~empirical',
    title: 'The 68–95–99.7 rule',
    use: 'Use this for “IQ scores have μ = 100 and σ = 15. About what percent are between 70 and 130?”',
    assumptions: [
      'The data are roughly normal, with mean μ and standard deviation σ.',
      'About 68%, 95% and 99.7% of the data are within 1, 2 and 3 standard deviations of the mean.',
      'The rule gives rounded shares; a z-table gives more digits.',
    ],
    variables: [
      MU(),
      SIGMA(),
      V('k', 'k', 'Standard deviations from the mean', { allowed: [1, 2, 3], min: 1, max: 3 }),
      V('lo', 'a', 'Lower end', { min: -3000, max: 3000, step: 0.5 }),
      V('hi', 'b', 'Upper end', { min: -3000, max: 3000, step: 0.5 }),
      V('pct', 'P', 'Share within k standard deviations', {
        unit: '%',
        min: 0,
        max: 100,
        derived: true,
      }),
    ],
    rules: [
      rule(
        'a = μ − k × σ',
        '{lo} = {m} − {k} × {s}',
        ['lo', 'm', 'k', 's'],
        (v) => v.lo! - (v.m! - v.k! * v.s!),
        {
          lo: [
            (v) => exact(v.m! - v.k! * v.s!),
            '{m} − {k} × {s}',
            'Go down k standard deviations from the mean.',
          ],
          m: [
            (v) => exact(v.lo! + v.k! * v.s!),
            '{lo} + {k} × {s}',
            'Go back up k standard deviations.',
          ],
          s: [
            (v) => fin(div(v.m! - v.lo!, v.k!)),
            '({m} − {lo}) ÷ {k}',
            'The distance below the mean, split into k steps.',
          ],
          k: [() => undefined],
        },
      ),
      rule(
        'b = μ + k × σ',
        '{hi} = {m} + {k} × {s}',
        ['hi', 'm', 'k', 's'],
        (v) => v.hi! - (v.m! + v.k! * v.s!),
        {
          hi: [
            (v) => exact(v.m! + v.k! * v.s!),
            '{m} + {k} × {s}',
            'Go up k standard deviations from the mean.',
          ],
          m: [
            (v) => exact(v.hi! - v.k! * v.s!),
            '{hi} − {k} × {s}',
            'Go back down k standard deviations.',
          ],
          s: [
            (v) => fin(div(v.hi! - v.m!, v.k!)),
            '({hi} − {m}) ÷ {k}',
            'The distance above the mean, split into k steps.',
          ],
          k: [() => undefined],
        },
      ),
      derive(
        'P = share within k standard deviations',
        'pct',
        ['k'],
        '{pct} = share within {k} standard deviations',
        (v) => EMPIRICAL[v.k!],
        'share within {k} standard deviations',
        'The 68–95–99.7 rule: 1, 2 or 3 standard deviations each way.',
      ),
    ],
    example: { m: 100, s: 15, k: 2, lo: 70, hi: 130, pct: 95 },
    startWith: ['m', 's', 'k'],
    representation: {
      kind: 'normalCurve',
      mean: 'm',
      sd: 's',
      axis: 'Score',
      bands: true,
      shade: { from: 'lo', to: 'hi' },
      fixed: true,
    },
  }),
  page({
    id: 'm.11.normal-distribution~percentile',
    title: 'The value at a percentile',
    use: 'Use this for “Scores have μ = 500 and σ = 100. What score is at the 90th percentile?”',
    assumptions: [
      'The data are roughly normal, with mean μ and standard deviation σ.',
      'At the 90th percentile, 90% of the data are below: the area left of x is 0.90.',
      'invNorm(P) is the z with area P to its left.',
    ],
    variables: [
      MU(),
      SIGMA(),
      prob('P', 'P', 'Share below x (the percentile)', { min: 0.001, max: 0.999 }),
      zVar(),
      V('x', 'x', 'Value at the percentile', { min: -5000, max: 5000, step: 0.5 }),
    ],
    rules: [leftArea('P', 'z'), zScore('z', 'x', 'm', 's')],
    example: { m: 500, s: 100, P: 0.9, z: invPhi(0.9), x: 500 + 100 * invPhi(0.9) },
    startWith: ['m', 's', 'P'],
    representation: {
      kind: 'normalCurve',
      mean: 'm',
      sd: 's',
      axis: 'Score',
      shade: { to: 'x', area: 'P' },
      mark: { x: 'x', z: 'z' },
    },
  }),
  page({
    id: 'm.11.normal-distribution~margin',
    title: 'Margin of error of a sample proportion',
    use: 'Use this for “In a random sample of 400, 60% said yes. What is the margin of error?”',
    assumptions: [
      'The sample is random, and n is large enough that the sample proportions are about normal.',
      'The standard error of p̂ is √(p̂(1 − p̂) ÷ n).',
      'About 2 standard errors each way cover 95% of samples: that is the margin of error.',
    ],
    variables: [
      V('ph', 'p̂', 'Sample proportion', { min: 0.01, max: 0.99, step: 0.01 }),
      W('n', 'n', 'Sample size', 10, 10000),
      V('SE', 'SE', 'Standard error', { min: 0.0001, max: 0.5, step: 0.0001, derived: true }),
      V('E', 'E', 'Margin of error', { min: 0, max: 1, step: 0.0001, derived: true }),
      V('lo', 'L', 'Lower end', { min: -1, max: 2, step: 0.0001, derived: true }),
      V('hi', 'U', 'Upper end', { min: -1, max: 2, step: 0.0001, derived: true }),
    ],
    rules: [
      derive(
        'SE = √(p̂ × (1 − p̂) ÷ n)',
        'SE',
        ['ph', 'n'],
        '{SE} = √({ph} × (1 − {ph}) ÷ {n})',
        (v) => Math.sqrt((v.ph! * (1 - v.ph!)) / v.n!),
        '√({ph} × (1 − {ph}) ÷ {n})',
        'How much p̂ varies from sample to sample of size n.',
      ),
      derive(
        'E = 2 × SE',
        'E',
        ['SE'],
        '{E} = 2 × {SE}',
        (v) => 2 * v.SE!,
        '2 × {SE}',
        'About 95% of samples land within 2 standard errors.',
      ),
      derive(
        'L = p̂ − E',
        'lo',
        ['ph', 'E'],
        '{lo} = {ph} − {E}',
        (v) => v.ph! - v.E!,
        '{ph} − {E}',
        'Go down the margin from the estimate.',
      ),
      derive(
        'U = p̂ + E',
        'hi',
        ['ph', 'E'],
        '{hi} = {ph} + {E}',
        (v) => v.ph! + v.E!,
        '{ph} + {E}',
        'Go up the margin from the estimate.',
      ),
    ],
    example: {
      ph: 0.6,
      n: 400,
      SE: Math.sqrt(0.24 / 400),
      E: 2 * Math.sqrt(0.24 / 400),
      lo: 0.6 - 2 * Math.sqrt(0.24 / 400),
      hi: 0.6 + 2 * Math.sqrt(0.24 / 400),
    },
    startWith: ['ph', 'n'],
    representation: {
      kind: 'normalCurve',
      mean: 'ph',
      sd: 'SE',
      axis: 'Sample proportion p̂',
      interval: { center: 'ph', margin: 'E' },
      fixed: true,
    },
  }),
];
