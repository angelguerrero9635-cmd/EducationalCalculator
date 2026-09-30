/**
 * Grade 11 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md; the
 * direction plan and build notes: docs/BUILD_HS.md and docs/build/m.11.md.
 * The layout pages (explore, sort, sequence, observe) are in `../layouts/math11.ts`.
 */
import { binomialPmf, choose, invPhi, Phi } from '@/components/module/reps/statMath';
import { formatNumber } from '@/engine/format';
import type { Relation, Values, VariableDef } from '@/engine/types';

import { atLeast, div } from '../helpers';
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
  extra: Partial<Relation> & { work?: StepText['work'] } = {},
): Rule {
  const { work, ...more } = extra;
  return rule(
    id,
    display,
    [x, ...inputs],
    (v) => v[x]! - (f(v) ?? NaN),
    {
      [x]: [(v: Values) => fin(f(v)), expr, how],
      ...Object.fromEntries(inputs.map((i) => [i, [() => undefined]])),
    },
    { ...more, ...(work ? { work: { [x]: work } } : {}) },
  );
}

/**
 * A limit the rule needs (b ≠ 1, |r| < 1): values that break it are rejected, with the reason
 * under the box.
 */
function limit(
  id: string,
  display: string,
  vars: string[],
  ok: (v: Values) => boolean,
  why: string,
): Rule {
  return {
    relation: {
      id,
      constraint: true,
      display,
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

/** C(n, k) for whole 0 ≤ k ≤ n, else nothing (so the solver never reads it as a flat 0). */
const nCk = (n: number, k: number) =>
  Number.isInteger(n) && Number.isInteger(k) && k >= 0 && k <= n ? choose(n, k) : undefined;

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

const log10 = Math.log10;
const ln = Math.log;
const fmt = (x: number) => formatNumber(x);
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
/** An integer exponent raised: 5 → "⁵", −4 → "⁻⁴". */
const sup = (n: number) =>
  `${n < 0 ? '⁻' : ''}${[...String(Math.abs(n))].map((ch) => SUP[Number(ch)]).join('')}`;
/** A number as written after an operator, a negative one bracketed: (−4). */
const par = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x));
/** A power as written, a negative base bracketed: (−3)². */
const pw = (b: number, e: number) => `${b < 0 ? `(${fmt(b)})` : fmt(b)}${sup(e)}`;
const BASE_NOT_1 = 'Every power of 1 is 1, so a base of 1 can’t make any other number.';

/** The vertical factors a transformation page offers. */
const STRETCH = [-4, -3, -2, -1, -0.5, 0.5, 1, 2, 3, 4];

/** Whether a rational equation's candidate is kept: it must not make x or x − p zero. */
const candidateHow = (v: Values, x: number, name: string) =>
  Math.abs(x) < 1e-9 || Math.abs(x - v.p!) < 1e-9
    ? `${name} makes a denominator 0: it is extraneous, so reject it.`
    : `${name} keeps every denominator nonzero: it is a solution.`;

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

  // ── Binomial distributions and expected value (S-MD.1–S-MD.6) ──
  page({
    id: 'm.11.probability-distributions',
    assumptions: [
      'There are n trials, and each one is a success or not.',
      'Every trial has the same chance p, and the trials are independent.',
      'E is the long-run average count of successes, not a promise for one round of n trials.',
    ],
    variables: [
      W('n', 'n', 'Trials', 1, 40),
      prob('p', 'p', 'Chance of success on each trial', { step: 0.01 }),
      W('k', 'k', 'Successes', 0, 40),
      V('C', 'C', 'Orders of k successes, C(n, k)', {
        integer: true,
        min: 1,
        max: 1e12,
        derived: true,
      }),
      prob('P', 'P', 'P(X = k)', { derived: true }),
      V('E', 'E', 'Expected successes E(X)', { min: 0, max: 40, step: 0.01 }),
      V('S', 'σ', 'Standard deviation', { min: 0, max: 10, step: 0.0001, derived: true }),
    ],
    rules: [
      { relation: atLeast('n', 'k') as Relation, steps: {} },
      derive(
        'C = C(n, k)',
        'C',
        ['n', 'k'],
        '{C} = C({n}, {k})',
        (v) => nCk(v.n!, v.k!),
        'C({n}, {k})',
        'The ways to pick which k of the n trials are the successes.',
      ),
      derive(
        'P = C × p^k × (1 − p)^(n − k)',
        'P',
        ['C', 'p', 'k', 'n'],
        '{P} = {C} × {p}^{k} × (1 − {p})^({n} − {k})',
        (v) => v.C! * v.p! ** v.k! * (1 - v.p!) ** (v.n! - v.k!),
        '{C} × {p}^{k} × (1 − {p})^({n} − {k})',
        'Each order has k successes at p and n − k failures at 1 − p.',
      ),
      rule('E = n × p', '{E} = {n} × {p}', ['E', 'n', 'p'], (v) => v.E! - v.n! * v.p!, {
        E: [(v) => exact(v.n! * v.p!), '{n} × {p}', 'On average, p of the n trials succeed.'],
        p: [(v) => fin(div(v.E!, v.n!)), '{E} ÷ {n}', 'The expected successes per trial.'],
        n: [() => undefined],
      }),
      derive(
        'σ = √(n × p × (1 − p))',
        'S',
        ['n', 'p'],
        '{S} = √({n} × {p} × (1 − {p}))',
        (v) => Math.sqrt(v.n! * v.p! * (1 - v.p!)),
        '√({n} × {p} × (1 − {p}))',
        'The typical distance of the count from its mean.',
      ),
    ],
    example: {
      n: 10,
      p: 0.3,
      k: 2,
      C: 45,
      P: binomialPmf(10, 0.3, 2),
      E: 3,
      S: Math.sqrt(2.1),
    },
    startWith: ['n', 'p', 'k'],
    sliders: true,
    pictureLabels: ['C', 'P'],
    representation: {
      kind: 'histogram',
      binomial: { n: 'n', p: 'p', mean: 'E', sd: 'S' },
      lit: 'k',
      axis: 'Successes (k)',
    },
  }),
  page({
    id: 'm.11.probability-distributions~expected-value',
    title: 'Expected value of a game',
    use: 'Use this for “A spinner pays −2, 0, 5 or 20 points with chances 0.5, 0.3, 0.15, 0.05. What is the expected value?”',
    assumptions: [
      'X takes four values, each with its own probability.',
      'The probabilities add to 1, so the last one is 1 minus the others.',
      'E(X) is the average of X over many plays: each value times its probability, added.',
    ],
    variables: [
      V('x1', 'x₁', 'First value', { min: -1000, max: 1000, step: 1 }),
      V('x2', 'x₂', 'Second value', { min: -1000, max: 1000, step: 1 }),
      V('x3', 'x₃', 'Third value', { min: -1000, max: 1000, step: 1 }),
      V('x4', 'x₄', 'Fourth value', { min: -1000, max: 1000, step: 1 }),
      prob('p1', 'p₁', 'P(X = x₁)', { step: 0.01 }),
      prob('p2', 'p₂', 'P(X = x₂)', { step: 0.01 }),
      prob('p3', 'p₃', 'P(X = x₃)', { step: 0.01 }),
      prob('p4', 'p₄', 'P(X = x₄)', { step: 0.01, derived: true }),
      V('E', 'E', 'Expected value E(X)', { min: -1000, max: 1000, step: 0.01, derived: true }),
    ],
    rules: [
      derive(
        'p₄ = 1 − (p₁ + p₂ + p₃)',
        'p4',
        ['p1', 'p2', 'p3'],
        '{p4} = 1 − ({p1} + {p2} + {p3})',
        (v) => 1 - (v.p1! + v.p2! + v.p3!),
        '1 − ({p1} + {p2} + {p3})',
        'All the probabilities add to 1.',
      ),
      derive(
        'E = x₁p₁ + x₂p₂ + x₃p₃ + x₄p₄',
        'E',
        ['x1', 'p1', 'x2', 'p2', 'x3', 'p3', 'x4', 'p4'],
        '{E} = {x1} × {p1} + {x2} × {p2} + {x3} × {p3} + {x4} × {p4}',
        (v) => v.x1! * v.p1! + v.x2! * v.p2! + v.x3! * v.p3! + v.x4! * v.p4!,
        '{x1} × {p1} + {x2} × {p2} + {x3} × {p3} + {x4} × {p4}',
        'Weight each value by its probability, then add.',
      ),
    ],
    example: { x1: -2, x2: 0, x3: 5, x4: 20, p1: 0.5, p2: 0.3, p3: 0.15, p4: 0.05, E: 0.75 },
    startWith: ['x1', 'x2', 'x3', 'x4', 'p1', 'p2', 'p3'],
    representation: {
      kind: 'histogram',
      probability: {
        values: ['x1', 'x2', 'x3', 'x4'],
        probs: ['p1', 'p2', 'p3', 'p4'],
        mean: 'E',
      },
      axis: 'Points (x)',
      keep: ['x1', 'x2', 'x3', 'x4', 'p1', 'p2', 'p3'],
    },
  }),

  // ── The binomial theorem and Pascal's triangle (A-APR.5) ──
  page({
    id: 'm.11.binomial-theorem',
    assumptions: [
      'Write (ax + b)ⁿ as (A + B)ⁿ with A = ax and B = b: row n of Pascal’s triangle gives the coefficients.',
      'In every term the powers of A and B add up to n: the xᵏ term is C(n, k)Aᵏ Bⁿ⁻ᵏ.',
      'A negative b makes every other term negative.',
    ],
    variables: [
      V('a', 'a', 'Coefficient of x', { integer: true, min: -5, max: 5 }),
      V('b', 'b', 'Constant', { integer: true, min: -10, max: 10 }),
      W('n', 'n', 'Power', 1, 12),
      W('k', 'k', 'Power of x in the term', 0, 12),
      V('C', 'C', 'Pascal entry C(n, k)', { integer: true, min: 1, max: 1000, derived: true }),
      V('T', 'T', 'Coefficient of xᵏ', { integer: true, min: -1e16, max: 1e16, derived: true }),
    ],
    rules: [
      { relation: atLeast('n', 'k') as Relation, steps: {} },
      derive(
        'C = C(n, k)',
        'C',
        ['n', 'k'],
        '{C} = C({n}, {k})',
        (v) => nCk(v.n!, v.k!),
        'C({n}, {k})',
        'Entry k of row n of Pascal’s triangle: the ways to pick k of the n factors for ax.',
      ),
      derive(
        'T = C × a^k × b^(n − k)',
        'T',
        ['C', 'a', 'k', 'b', 'n'],
        '{T} = {C} × {a}^{k} × {b}^({n} − {k})',
        (v) => v.C! * v.a! ** v.k! * v.b! ** (v.n! - v.k!),
        '{C} × {a}^{k} × {b}^({n} − {k})',
        'k factors give ax and the other n − k give b.',
        {
          work: (v) => [
            `${fmt(v.C!)} × ${pw(v.a!, v.k!)} × ${pw(v.b!, v.n! - v.k!)}`,
            `${fmt(v.C!)} × ${fmt(v.a! ** v.k!)} × ${fmt(v.b! ** (v.n! - v.k!))}`,
          ],
        },
      ),
    ],
    example: { a: 2, b: -3, n: 5, k: 3, C: 10, T: 720 },
    startWith: ['a', 'b', 'n', 'k'],
    equation: '({a}x + {b})^{n}',
    representation: { kind: 'pascalTriangle', n: 'n', k: 'k', expand: { a: 'A', b: 'B' } },
  }),
  page({
    id: 'm.11.binomial-theorem~expand',
    title: 'Expand (ax + b)ⁿ',
    use: 'Use this for “Expand (x + 2)⁴.”',
    assumptions: [
      'Row n of Pascal’s triangle gives the coefficients: 1, 4, 6, 4, 1 for n = 4.',
      'The xʲ term is C(n, j) × aʲ × bⁿ⁻ʲ: the powers of a climb as the powers of b fall.',
      'There are n + 1 terms; a power of x above n has coefficient 0.',
    ],
    variables: [
      V('a', 'a', 'Coefficient of x', { integer: true, min: -5, max: 5 }),
      V('b', 'b', 'Constant', { integer: true, min: -10, max: 10 }),
      V('n', 'n', 'Power', { allowed: [0, 1, 2, 3, 4, 5, 6], min: 0, max: 6 }),
      ...[6, 5, 4, 3, 2, 1, 0].map((j) =>
        V(
          `c${j}`,
          `c${'₀₁₂₃₄₅₆'[j]}`,
          j === 0 ? 'Constant term' : `Coefficient of x${j > 1 ? '⁰¹²³⁴⁵⁶'[j] : ''}`,
          {
            integer: true,
            min: -1e9,
            max: 1e9,
            derived: true,
          },
        ),
      ),
    ],
    rules: [6, 5, 4, 3, 2, 1, 0].map((j) =>
      derive(
        `c${j} = C(n, ${j}) × a^${j} × b^(n − ${j})`,
        `c${j}`,
        ['n', 'a', 'b'],
        `{c${j}} = C({n}, ${j}) × {a}^${j} × {b}^({n} − ${j})`,
        (v) => (v.n! < j ? 0 : choose(v.n!, j) * v.a! ** j * v.b! ** (v.n! - j)),
        (v) => (v.n! < j ? '0' : `C({n}, ${j}) × {a}^${j} × {b}^({n} − ${j})`),
        (v) =>
          v.n! < j
            ? `(ax + b)ⁿ has no power of x above n.`
            : `Row n, entry ${j}, times a to the ${j} and b to the rest of the power.`,
        {
          work: (v) =>
            v.n! < j
              ? []
              : [
                  `${choose(v.n!, j)} × ${pw(v.a!, j)} × ${pw(v.b!, v.n! - j)}`,
                  `${choose(v.n!, j)} × ${fmt(v.a! ** j)} × ${fmt(v.b! ** (v.n! - j))}`,
                ],
        },
      ),
    ),
    example: { a: 1, b: 2, n: 4, c6: 0, c5: 0, c4: 1, c3: 8, c2: 24, c1: 32, c0: 16 },
    startWith: ['a', 'b', 'n'],
    equation: '({a}x + {b})^{n}',
    representation: { kind: 'pascalTriangle', n: 'n', rows: 6, expand: { a: 'A', b: 'B' } },
  }),
  page({
    id: 'm.11.binomial-theorem~pascal-rule',
    title: 'Pascal’s rule: add the two above',
    use: 'Use this for “Fill in row 6 of Pascal’s triangle” or “Find C(6, 2) from row 5.”',
    assumptions: [
      'Each row starts and ends with 1.',
      'Every other entry is the sum of the two entries above it: C(n, k) = C(n − 1, k − 1) + C(n − 1, k).',
    ],
    variables: [
      W('n', 'n', 'Row', 2, 12),
      W('k', 'k', 'Entry', 1, 11),
      V('L', 'L', 'Entry above left, C(n − 1, k − 1)', {
        integer: true,
        min: 1,
        max: 1000,
        derived: true,
      }),
      V('R', 'R', 'Entry above right, C(n − 1, k)', {
        integer: true,
        min: 1,
        max: 1000,
        derived: true,
      }),
      V('E', 'E', 'Entry C(n, k)', { integer: true, min: 1, max: 1000, derived: true }),
    ],
    rules: [
      limit(
        'k is at most n − 1',
        '{k} is at most {n} − 1',
        ['n', 'k'],
        (v) => v.k! <= v.n! - 1,
        'The inside entries of row n run from k = 1 to n − 1; the ends are 1.',
      ),
      derive(
        'L = C(n − 1, k − 1)',
        'L',
        ['n', 'k'],
        '{L} = C({n} − 1, {k} − 1)',
        (v) => nCk(v.n! - 1, v.k! - 1),
        'C({n} − 1, {k} − 1)',
        'The entry up and to the left, in row n − 1.',
      ),
      derive(
        'R = C(n − 1, k)',
        'R',
        ['n', 'k'],
        '{R} = C({n} − 1, {k})',
        (v) => nCk(v.n! - 1, v.k!),
        'C({n} − 1, {k})',
        'The entry up and to the right, in row n − 1.',
      ),
      derive(
        'E = L + R',
        'E',
        ['L', 'R'],
        '{E} = {L} + {R}',
        (v) => v.L! + v.R!,
        '{L} + {R}',
        'Add the two entries above it.',
      ),
    ],
    example: { n: 6, k: 2, L: 5, R: 10, E: 15 },
    startWith: ['n', 'k'],
    sliders: true,
    representation: { kind: 'pascalTriangle', n: 'n', k: 'k' },
  }),

  // ── Logarithms and log properties (F-LE.4, F-BF.5) ──
  page({
    id: 'm.11.logarithms',
    assumptions: [
      'A log is an exponent: log_b(x) is the power of b that makes x, so log_b(x) = y means bʸ = x.',
      'Only a positive x has a log.',
      'The base b is positive and not 1.',
    ],
    variables: [
      V('b', 'b', 'Base', { min: 0.1, max: 20, step: 0.01 }),
      V('x', 'x', 'Number', { min: 0.001, max: 1e9, step: 0.01 }),
      V('y', 'y', 'Logarithm', { min: -30, max: 30, step: 0.01 }),
    ],
    rules: [
      limit('b ≠ 1', 'The base {b} is not 1', ['b'], (v) => v.b !== 1, BASE_NOT_1),
      rule('x = b^y', '{x} = {b}^{y}', ['x', 'b', 'y'], (v) => ln(v.x!) - v.y! * ln(v.b!), {
        y: [
          (v) => (v.b === 1 || !(v.x! > 0) ? undefined : fin(log10(v.x!) / log10(v.b!))),
          'log₁₀ {x} ÷ log₁₀ {b}',
          'The power of b that makes x; the common logs of x and b give it by dividing.',
        ],
        x: [(v) => fin(v.b! ** v.y!), '{b}^{y}', 'Rewrite log_b(x) = y as bʸ = x.'],
        b: [
          (v) => (v.y === 0 || !(v.x! > 0) ? undefined : fin(v.x! ** (1 / v.y!))),
          '{x}^(1 ÷ {y})',
          'bʸ = x, so b is the yth root of x.',
        ],
      }),
    ],
    example: { b: 2, x: 32, y: 5 },
    startWith: ['b', 'x'],
    equation: 'log_{b}({x}) = {y}',
    representation: {
      kind: 'functionGraph',
      family: 'log',
      b: 'b',
      at: { x: 'x', y: 'y' },
      marks: ['zeros', 'asymptotes', 'domain'],
    },
  }),
  page({
    id: 'm.11.logarithms~change-of-base',
    title: 'Change of base',
    use: 'Use this for “Estimate log₃ 20” with the log key on a calculator.',
    assumptions: [
      'log_b(x) = log x ÷ log b, with the common logs (base 10) on a calculator.',
      'Any base works for both logs, if both use the same one.',
      'The base b is positive and not 1, and x is positive.',
    ],
    variables: [
      V('b', 'b', 'Base', { min: 0.1, max: 20, step: 0.01 }),
      V('x', 'x', 'Number', { min: 0.001, max: 1e9, step: 0.01 }),
      V('L1', 'log x', 'Common log of x', { min: -3, max: 9, step: 0.0001, derived: true }),
      V('L2', 'log b', 'Common log of b', { min: -1, max: 1.31, step: 0.0001, derived: true }),
      V('y', 'y', 'log_b(x)', { min: -1000, max: 1000, step: 0.0001, derived: true }),
    ],
    rules: [
      limit('b ≠ 1', 'The base {b} is not 1', ['b'], (v) => v.b !== 1, BASE_NOT_1),
      derive(
        'log x = log₁₀ x',
        'L1',
        ['x'],
        '{L1} = log₁₀ {x}',
        (v) => (v.x! > 0 ? log10(v.x!) : undefined),
        'log₁₀ {x}',
        'The common log: the power of 10 that makes x.',
      ),
      derive(
        'log b = log₁₀ b',
        'L2',
        ['b'],
        '{L2} = log₁₀ {b}',
        (v) => (v.b! > 0 ? log10(v.b!) : undefined),
        'log₁₀ {b}',
        'The common log of the base.',
      ),
      derive(
        'y = log x ÷ log b',
        'y',
        ['L1', 'L2'],
        '{y} = {L1} ÷ {L2}',
        (v) => div(v.L1!, v.L2!),
        '{L1} ÷ {L2}',
        'Change of base: divide the two common logs.',
      ),
    ],
    example: { b: 3, x: 20, L1: log10(20), L2: log10(3), y: log10(20) / log10(3) },
    startWith: ['b', 'x'],
    pictureLabels: ['L1', 'L2'],
    representation: {
      kind: 'functionGraph',
      family: 'log',
      b: 'b',
      at: { x: 'x', y: 'y' },
      marks: ['zeros', 'asymptotes'],
    },
  }),
  page({
    id: 'm.11.logarithms~common-log',
    title: 'Common logs from scientific notation',
    use: 'Use this for “Find log 3,000 using log 3 ≈ 0.4771.”',
    assumptions: [
      'Write N as a × 10ⁿ with a from 1 up to 10.',
      'log(a × 10ⁿ) = n + log a: the exponent is the whole part, and log a, from 0 up to 1, is the rest.',
      'A number under 1 has a negative n, so its log is negative.',
    ],
    variables: [
      V('N', 'N', 'Number', { min: 0.001, max: 9.999e12, full: true }),
      V('a', 'a', 'Number from 1 up to 10', { min: 1, max: 9.999, step: 0.001 }),
      V('n', 'n', 'Power of ten', { min: -3, max: 12, step: 1, integer: true }),
      V('L', 'L', 'log₁₀ N', { min: -3, max: 13, step: 0.0001, derived: true }),
    ],
    rules: [
      rule(
        'N = a × 10^n',
        '{N} = {a} × 10^{n}',
        ['N', 'a', 'n'],
        (v) => log10(v.N!) - log10(v.a!) - v.n!,
        {
          N: [
            (v) => exact(v.a! * 10 ** v.n!),
            '{a} × 10^{n}',
            'The number from 1 up to 10 times the power of ten.',
          ],
          a: [
            (v) => exact(v.N! / 10 ** v.n!),
            '{N} ÷ 10^{n}',
            'Divide by the power of ten to leave one digit, not 0, before the point.',
          ],
          n: [() => undefined],
        },
      ),
      rule(
        'n from N',
        '{n} = exponent of the power of ten at or below {N}',
        ['n', 'N'],
        (v) => v.n! - Math.floor(log10(v.N!) + 1e-9),
        {
          n: [
            (v) => (v.N! > 0 ? Math.floor(log10(v.N!) + 1e-9) : undefined),
            'exponent of the power of ten at or below {N}',
            'How many places the point moves: the whole part of the log.',
          ],
          N: [() => undefined],
        },
      ),
      derive(
        'L = n + log a',
        'L',
        ['n', 'a'],
        '{L} = {n} + log₁₀ {a}',
        (v) => v.n! + log10(v.a!),
        '{n} + log₁₀ {a}',
        'The log of a product is the sum of the logs, and log₁₀ 10ⁿ = n.',
      ),
    ],
    example: { N: 3000, a: 3, n: 3, L: 3 + log10(3) },
    startWith: ['N'],
    representation: {
      kind: 'powerScale',
      number: 'N',
      mantissa: 'a',
      exponent: 'n',
      log: 'L',
      fixed: true,
    },
  }),

  // ── Exponential and log equations, e and continuous growth (F-LE.4, A-SSE.3c) ──
  page({
    id: 'm.11.exp-log-equations',
    assumptions: [
      'Divide by a first, then take the log of both sides: x log b = log(c ÷ a).',
      'Any base works for the logs, if both sides use the same one.',
      'bˣ is always positive, so c ÷ a must be positive for a solution.',
    ],
    variables: [
      V('a', 'a', 'Starting value', { min: -1000, max: 1000, step: 0.5 }),
      V('b', 'b', 'Base', { min: 0.1, max: 20, step: 0.01 }),
      V('c', 'c', 'Target value', { min: -1e6, max: 1e6, step: 0.5 }),
      V('x', 'x', 'Solution', { min: -1000, max: 1000, step: 0.001, derived: true }),
    ],
    rules: [
      limit(
        'a ≠ 0',
        '{a} is not 0',
        ['a'],
        (v) => v.a !== 0,
        'With a = 0 the left side is always 0.',
      ),
      limit('b ≠ 1', 'The base {b} is not 1', ['b'], (v) => v.b !== 1, BASE_NOT_1),
      rule(
        'a × b^x = c',
        '{a} × {b}^{x} = {c}',
        ['a', 'b', 'x', 'c'],
        (v) => v.a! * v.b! ** v.x! - v.c!,
        {
          x: [
            (v) =>
              v.b === 1 || !((div(v.c!, v.a!) ?? 0) > 0)
                ? undefined
                : fin(log10(v.c! / v.a!) / log10(v.b!)),
            'log₁₀({c} ÷ {a}) ÷ log₁₀ {b}',
            'Divide by a, take the log of both sides, then divide by log b.',
          ],
          c: [() => undefined],
          a: [() => undefined],
          b: [() => undefined],
        },
        {
          message: (v) =>
            v.a !== undefined && v.c !== undefined && v.a !== 0 && v.c / v.a <= 0
              ? 'bˣ is always positive, so a × bˣ has the sign of a: no x makes it c.'
              : undefined,
        },
      ),
    ],
    example: { a: 5, b: 2, c: 60, x: log10(12) / log10(2) },
    startWith: ['a', 'b', 'c'],
    equation: '{a} × {b}^x = {c}',
    representation: {
      kind: 'functionGraph',
      family: 'exponential',
      a: 'a',
      b: 'b',
      other: { family: 'linear', m: 0, b: 'c' },
      crossing: { x: 'x', y: 'c' },
      marks: ['asymptotes'],
    },
  }),
  page({
    id: 'm.11.exp-log-equations~same-base',
    title: 'Powers of the same base',
    use: 'Use this for “Solve 4⁶ = 8ˣ” by writing both sides as powers of 2.',
    assumptions: [
      'Write both sides as powers of one base g: 4 = 2² and 8 = 2³.',
      'A power of a power multiplies the exponents: (gᵖ)ᵐ = gᵖᵐ.',
      'Equal powers of the same base have equal exponents, so p × m = q × x.',
    ],
    variables: [
      W('g', 'g', 'Common base', 2, 10),
      W('p', 'p', 'Power of g on the left', 1, 6),
      W('q', 'q', 'Power of g on the right', 1, 6),
      W('m', 'm', 'Exponent on the left', 1, 20),
      V('B1', 'gᵖ', 'Left base', { integer: true, min: 2, max: 1e6, derived: true }),
      V('B2', 'g^q', 'Right base', { integer: true, min: 2, max: 1e6, derived: true }),
      V('x', 'x', 'Exponent on the right', { min: 0, max: 200, fraction: 12 }),
    ],
    rules: [
      derive(
        'B1 = g^p',
        'B1',
        ['g', 'p'],
        '{B1} = {g}^{p}',
        (v) => v.g! ** v.p!,
        '{g}^{p}',
        'The left base as a power of g.',
      ),
      derive(
        'B2 = g^q',
        'B2',
        ['g', 'q'],
        '{B2} = {g}^{q}',
        (v) => v.g! ** v.q!,
        '{g}^{q}',
        'The right base as a power of g.',
      ),
      rule(
        'q × x = p × m',
        '{q} × {x} = {p} × {m}',
        ['q', 'x', 'p', 'm'],
        (v) => v.q! * v.x! - v.p! * v.m!,
        {
          x: [
            (v) => fin(div(v.p! * v.m!, v.q!)),
            '{p} × {m} ÷ {q}',
            'Both sides are powers of g, so the exponents p × m and q × x are equal.',
          ],
          m: [
            (v) => fin(div(v.q! * v.x!, v.p!)),
            '{q} × {x} ÷ {p}',
            'The exponents are equal: divide q × x by p.',
          ],
          p: [() => undefined],
          q: [() => undefined],
        },
      ),
    ],
    example: { g: 2, p: 2, q: 3, m: 6, B1: 4, B2: 8, x: 4 },
    startWith: ['g', 'p', 'q', 'm'],
    equation: '({g}^{p})^{m} = ({g}^{q})^{x}',
    pictureLabels: ['B1', 'm', 'x'],
    representation: {
      kind: 'termsChart',
      type: 'geometric',
      first: 'g',
      step: 'g',
      count: 'q',
      term: 'B2',
    },
  }),
  page({
    id: 'm.11.exp-log-equations~continuous',
    title: 'Continuous growth',
    use: 'Use this for “$2,000 grows at 5% a year compounded continuously. How long until it reaches $3,000?”',
    assumptions: [
      'e ≈ 2.71828 is what compounding more and more often approaches.',
      'The rate r is a decimal: 5% is 0.05.',
      'To find t, divide by P and take ln of both sides: rt = ln(A ÷ P).',
    ],
    variables: [
      V('P', 'P', 'Starting amount ($)', { min: 1, max: 1e6, step: 1 }),
      V('r', 'r', 'Rate per year', { min: 0.001, max: 1, step: 0.001 }),
      V('t', 't', 'Time (years)', { min: 0, max: 100, step: 0.01 }),
      V('A', 'A', 'Amount ($)', { min: 1, max: 1e50, step: 0.01 }),
    ],
    rules: [
      rule(
        'A = P × e^(r × t)',
        '{A} = {P} × e^({r} × {t})',
        ['A', 'P', 'r', 't'],
        (v) => ln(v.A!) - ln(v.P!) - v.r! * v.t!,
        {
          A: [
            (v) => fin(v.P! * Math.exp(v.r! * v.t!)),
            '{P} × e^({r} × {t})',
            'Raise e to r × t, then multiply by the starting amount.',
          ],
          t: [
            (v) => fin(div(ln(v.A! / v.P!), v.r!)),
            'ln({A} ÷ {P}) ÷ {r}',
            'Divide by P, take ln of both sides, then divide by r.',
          ],
          P: [
            (v) => fin(v.A! / Math.exp(v.r! * v.t!)),
            '{A} ÷ e^({r} × {t})',
            'Divide the amount by the growth factor.',
          ],
          r: [
            (v) => fin(div(ln(v.A! / v.P!), v.t!)),
            'ln({A} ÷ {P}) ÷ {t}',
            'Divide by P, take ln of both sides, then divide by t.',
          ],
        },
      ),
    ],
    example: { P: 2000, r: 0.05, t: 10, A: 2000 * Math.exp(0.5) },
    startWith: ['t', 'P', 'r'],
    equation: '{A} = {P}e^{{r}{t}}',
    representation: {
      kind: 'functionGraph',
      family: 'exponential',
      a: 'P',
      r: 'r',
      name: 'A',
      at: { x: 't', y: 'A' },
      axes: { x: 'Time t (years)', y: 'Amount A ($)' },
      xMin: 0,
      marks: ['intercept'],
    },
  }),
  page({
    id: 'm.11.exp-log-equations~log-equation',
    title: 'Solve a log equation',
    use: 'Use this for “Solve log₃(2x − 1) = 4.”',
    assumptions: [
      'Rewrite log_b(u) = y as u = bʸ, with u = ax + c: the log is an exponent.',
      'Then solve ax + c = bʸ for x.',
      'Check: ax + c must be positive, and it is, since bʸ is.',
    ],
    variables: [
      V('b', 'b', 'Base', { min: 0.1, max: 20, step: 0.01 }),
      V('a', 'a', 'Coefficient of x', { min: -100, max: 100, step: 1 }),
      V('c', 'c', 'Constant', { min: -1000, max: 1000, step: 1 }),
      V('y', 'y', 'Value of the log', { min: -20, max: 20, step: 0.5 }),
      V('u', 'u', 'Inside of the log, ax + c', { min: 0, max: 1e30, derived: true }),
      V('x', 'x', 'Solution', { min: -1e30, max: 1e30, fraction: 12, derived: true }),
    ],
    rules: [
      limit('b ≠ 1', 'The base {b} is not 1', ['b'], (v) => v.b !== 1, BASE_NOT_1),
      limit(
        'a ≠ 0',
        '{a} is not 0',
        ['a'],
        (v) => v.a !== 0,
        'With a = 0 there is no x to solve for.',
      ),
      derive(
        'u = b^y',
        'u',
        ['b', 'y'],
        '{u} = {b}^{y}',
        (v) => v.b! ** v.y!,
        '{b}^{y}',
        'log_b(u) = y means bʸ = u.',
      ),
      derive(
        'x = (u − c) ÷ a',
        'x',
        ['u', 'c', 'a'],
        '{x} = ({u} − {c}) ÷ {a}',
        (v) => div(v.u! - v.c!, v.a!),
        '({u} − {c}) ÷ {a}',
        'Solve ax + c = u: take away c, then divide by a.',
      ),
    ],
    example: { b: 3, a: 2, c: -1, y: 4, u: 81, x: 41 },
    startWith: ['b', 'a', 'c', 'y'],
    equation: 'log_{b}({a}x + {c}) = {y}',
    representation: {
      kind: 'functionGraph',
      family: 'log',
      b: 'b',
      input: 'u',
      other: { family: 'linear', m: 0, b: 'y' },
      crossing: { x: 'u', y: 'y' },
      marks: ['asymptotes'],
    },
  }),

  // ── Series and sigma notation (A-SSE.4, F-BF.2) ──
  page({
    id: 'm.11.series',
    assumptions: [
      'Each term is the one before times the common ratio r.',
      'Multiply S by r and subtract: all but two terms cancel, leaving S(1 − r) = a₁(1 − rⁿ).',
      'For r = 1 every term is a₁, so S is just n × a₁.',
    ],
    variables: [
      V('a1', 'a₁', 'First term', { min: -100, max: 100, step: 0.5 }),
      V('r', 'r', 'Common ratio', { min: -5, max: 5, step: 0.05 }),
      W('n', 'n', 'Number of terms', 1, 30),
      V('an', 'aₙ', 'Last term', { min: -1e25, max: 1e25, derived: true }),
      V('S', 'Sₙ', 'Sum of the n terms', { min: -1e25, max: 1e25, derived: true }),
    ],
    rules: [
      limit(
        'r ≠ 1',
        'The ratio {r} is not 1',
        ['r'],
        (v) => v.r !== 1,
        'With r = 1 the formula divides by 0; the sum is n × a₁.',
      ),
      derive(
        'aₙ = a₁ × r^(n − 1)',
        'an',
        ['a1', 'r', 'n'],
        '{an} = {a1} × {r}^({n} − 1)',
        (v) => v.a1! * v.r! ** (v.n! - 1),
        '{a1} × {r}^({n} − 1)',
        'From the first term, multiply by r, n − 1 times.',
        {
          work: (v) => [
            `${fmt(v.a1!)} × ${pw(v.r!, v.n! - 1)}`,
            `${fmt(v.a1!)} × ${fmt(v.r! ** (v.n! - 1))}`,
          ],
        },
      ),
      derive(
        'Sₙ = a₁ × (1 − rⁿ) ÷ (1 − r)',
        'S',
        ['a1', 'r', 'n'],
        '{S} = {a1} × (1 − {r}^{n}) ÷ (1 − {r})',
        (v) => div(v.a1! * (1 - v.r! ** v.n!), 1 - v.r!),
        '{a1} × (1 − {r}^{n}) ÷ (1 − {r})',
        'The sum of a geometric series: a₁ times (1 − rⁿ) over (1 − r).',
      ),
    ],
    example: { a1: 3, r: 2, n: 6, an: 96, S: 189 },
    startWith: ['a1', 'r', 'n'],
    sliders: true,
    equation: '{S} = {a1} × {1 − {r}^{n}}/{1 − {r}}',
    representation: {
      kind: 'termsChart',
      type: 'geometric',
      first: 'a1',
      step: 'r',
      count: 'n',
      sums: true,
      term: 'an',
      sum: 'S',
    },
  }),
  page({
    id: 'm.11.series~arithmetic',
    title: 'Arithmetic series',
    use: 'Use this for “Find the sum of the first 10 terms of 5, 9, 13, ….”',
    assumptions: [
      'The terms go up by the same common difference d each time.',
      'Pair the first and last terms, the second and second-to-last, and so on: each pair adds to a₁ + aₙ.',
      'n terms make n ÷ 2 pairs, so Sₙ = n(a₁ + aₙ) ÷ 2.',
    ],
    variables: [
      V('a1', 'a₁', 'First term', { min: -1000, max: 1000, step: 1 }),
      V('d', 'd', 'Common difference', { min: -100, max: 100, step: 0.5 }),
      W('n', 'n', 'Number of terms', 1, 30),
      V('an', 'aₙ', 'Last term', { min: -1e5, max: 1e5, step: 1 }),
      V('S', 'Sₙ', 'Sum of the n terms', { min: -1e7, max: 1e7, step: 1 }),
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
            'From the first term, n − 1 steps of d.',
          ],
          a1: [
            (v) => exact(v.an! - (v.n! - 1) * v.d!),
            '{an} − ({n} − 1) × {d}',
            'Go back n − 1 steps of d.',
          ],
          d: [
            (v) => fin(div(v.an! - v.a1!, v.n! - 1)),
            '({an} − {a1}) ÷ ({n} − 1)',
            'The rise from a₁ to aₙ, over n − 1 steps.',
          ],
          n: [() => undefined],
        },
      ),
      rule(
        'Sₙ = n × (a₁ + aₙ) ÷ 2',
        '{S} = {n} × ({a1} + {an}) ÷ 2',
        ['S', 'n', 'a1', 'an'],
        (v) => v.S! - (v.n! * (v.a1! + v.an!)) / 2,
        {
          S: [
            (v) => exact((v.n! * (v.a1! + v.an!)) / 2),
            '{n} × ({a1} + {an}) ÷ 2',
            'n ÷ 2 pairs, each adding to a₁ + aₙ.',
          ],
          an: [
            (v) => fin((div(2 * v.S!, v.n!) ?? NaN) - v.a1!),
            '2 × {S} ÷ {n} − {a1}',
            'Each pair adds to 2Sₙ ÷ n; take away a₁.',
          ],
          a1: [
            (v) => fin((div(2 * v.S!, v.n!) ?? NaN) - v.an!),
            '2 × {S} ÷ {n} − {an}',
            'Each pair adds to 2Sₙ ÷ n; take away aₙ.',
          ],
          n: [() => undefined],
        },
      ),
    ],
    example: { a1: 5, d: 4, n: 10, an: 41, S: 230 },
    startWith: ['a1', 'd', 'n'],
    sliders: true,
    representation: {
      kind: 'termsChart',
      type: 'arithmetic',
      first: 'a1',
      step: 'd',
      count: 'n',
      sums: true,
      term: 'an',
      sum: 'S',
    },
  }),
  page({
    id: 'm.11.series~sigma',
    title: 'Sigma notation',
    use: 'Use this for “Evaluate the sum from k = 1 to 8 of (3k − 1).”',
    assumptions: [
      'Σ from k = 1 to n of (ck + e) adds the terms for k = 1, 2, …, n.',
      'The terms go up by c each time, so the sum is an arithmetic series.',
      'Find the first and last terms, then Sₙ = n(a₁ + aₙ) ÷ 2.',
    ],
    variables: [
      V('c', 'c', 'Coefficient of k', { min: -100, max: 100, step: 0.5 }),
      V('e', 'e', 'Constant', { min: -1000, max: 1000, step: 0.5 }),
      W('n', 'n', 'Last value of k', 1, 30),
      V('a1', 'a₁', 'First term (k = 1)', { min: -2000, max: 2000, derived: true }),
      V('an', 'aₙ', 'Last term (k = n)', { min: -1e5, max: 1e5, derived: true }),
      V('S', 'S', 'Sum', { min: -1e7, max: 1e7, derived: true }),
    ],
    rules: [
      derive(
        'a₁ = c × 1 + e',
        'a1',
        ['c', 'e'],
        '{a1} = {c} × 1 + {e}',
        (v) => v.c! + v.e!,
        '{c} × 1 + {e}',
        'Put k = 1 into ck + e.',
      ),
      derive(
        'aₙ = c × n + e',
        'an',
        ['c', 'n', 'e'],
        '{an} = {c} × {n} + {e}',
        (v) => v.c! * v.n! + v.e!,
        '{c} × {n} + {e}',
        'Put k = n into ck + e.',
      ),
      derive(
        'S = n × (a₁ + aₙ) ÷ 2',
        'S',
        ['n', 'a1', 'an'],
        '{S} = {n} × ({a1} + {an}) ÷ 2',
        (v) => (v.n! * (v.a1! + v.an!)) / 2,
        '{n} × ({a1} + {an}) ÷ 2',
        'n ÷ 2 pairs of first plus last, as in any arithmetic series.',
      ),
    ],
    example: { c: 3, e: -1, n: 8, a1: 2, an: 23, S: 100 },
    startWith: ['c', 'e', 'n'],
    sliders: true,
    representation: {
      kind: 'termsChart',
      type: 'arithmetic',
      first: 'a1',
      step: 'c',
      count: 'n',
      sums: true,
      term: 'an',
      sum: 'S',
    },
  }),
  page({
    id: 'm.11.series~infinite',
    title: 'Infinite geometric series',
    use: 'Use this for “Find the sum of 12 + 3 + 3/4 + ….”',
    assumptions: [
      'With r between −1 and 1, rⁿ shrinks toward 0 as n grows.',
      'The partial sums Sₙ = a₁(1 − rⁿ) ÷ (1 − r) close in on S = a₁ ÷ (1 − r).',
      'With |r| ≥ 1 the terms do not shrink, and the sum has no limit.',
    ],
    variables: [
      V('a1', 'a₁', 'First term', { min: -100, max: 100, step: 0.5 }),
      V('r', 'r', 'Common ratio', { min: -5, max: 5, step: 0.05 }),
      W('n', 'n', 'Terms added so far', 1, 30),
      V('Sn', 'Sₙ', 'Sum of the first n terms', { min: -1e5, max: 1e5, derived: true }),
      V('S', 'S', 'Sum of the series', { min: -1e5, max: 1e5, derived: true }),
    ],
    rules: [
      limit(
        '|r| < 1',
        '{r} is between −1 and 1',
        ['r'],
        (v) => Math.abs(v.r!) < 1,
        'With |r| ≥ 1 the terms do not shrink, so the sums grow without end.',
      ),
      derive(
        'Sₙ = a₁ × (1 − rⁿ) ÷ (1 − r)',
        'Sn',
        ['a1', 'r', 'n'],
        '{Sn} = {a1} × (1 − {r}^{n}) ÷ (1 − {r})',
        (v) => div(v.a1! * (1 - v.r! ** v.n!), 1 - v.r!),
        '{a1} × (1 − {r}^{n}) ÷ (1 − {r})',
        'The first n terms of the geometric series.',
      ),
      derive(
        'S = a₁ ÷ (1 − r)',
        'S',
        ['a1', 'r'],
        '{S} = {a1} ÷ (1 − {r})',
        (v) => div(v.a1!, 1 - v.r!),
        '{a1} ÷ (1 − {r})',
        'As n grows, rⁿ goes to 0, leaving a₁ ÷ (1 − r).',
      ),
    ],
    example: { a1: 12, r: 0.25, n: 6, Sn: (12 * (1 - 0.25 ** 6)) / 0.75, S: 16 },
    startWith: ['a1', 'r', 'n'],
    sliders: true,
    representation: {
      kind: 'termsChart',
      type: 'geometric',
      first: 'a1',
      step: 'r',
      count: 'n',
      sums: true,
      limit: 'S',
      sum: 'Sn',
    },
  }),

  // ── Parent functions and transformations (F-BF.3, F-IF.7) ──
  page({
    id: 'm.11.function-transformations',
    assumptions: [
      'Here f(x) = |x|, the dashed parent; h moves the graph right when h is positive, because x − h = 0 at x = h.',
      'k moves it up; a stretches it by a factor of |a| and flips it over the x-axis when a is negative.',
      'The parent’s vertex (0, 0) lands at (h, k).',
    ],
    variables: [
      V('a', 'a', 'Vertical factor', { allowed: STRETCH, min: -4, max: 4 }),
      V('h', 'h', 'Shift right', { min: -10, max: 10, step: 0.5 }),
      V('k', 'k', 'Shift up', { min: -10, max: 10, step: 0.5 }),
      V('x', 'x', 'Input', { min: -20, max: 20, step: 0.5 }),
      V('y', 'y', 'Output', { min: -200, max: 200, derived: true }),
    ],
    rules: [
      derive(
        'y = a|x − h| + k',
        'y',
        ['a', 'x', 'h', 'k'],
        '{y} = {a} × |{x} − {h}| + {k}',
        (v) => v.a! * Math.abs(v.x! - v.h!) + v.k!,
        '{a} × |{x} − {h}| + {k}',
        'Shift x by h, take the absolute value, stretch by a, then shift up by k.',
      ),
    ],
    example: { a: 2, h: 3, k: -1, x: 5, y: 3 },
    startWith: ['a', 'h', 'k', 'x'],
    equation: 'y = {a}f(x − {h}) + {k}',
    representation: {
      kind: 'functionGraph',
      family: 'absolute',
      a: 'a',
      h: 'h',
      k: 'k',
      parent: true,
      at: { x: 'x', y: 'y' },
      marks: ['vertex'],
    },
  }),
  page({
    id: 'm.11.function-transformations~point',
    title: 'Where a point goes',
    use: 'Use this for “(2, 4) is on y = 2ˣ. Where is it on y = −3 × 2^(x + 1) + 5?”',
    assumptions: [
      'Horizontal moves change x only: the point (p, 2ᵖ) moves to x = p + h.',
      'Vertical moves change y only: the y-value is stretched by a, then moved up k.',
      'The asymptote y = 0 moves to y = k.',
    ],
    variables: [
      V('p', 'p', 'x on the parent', { min: -2, max: 4, step: 0.5 }),
      V('q', 'q', 'y on the parent, 2ᵖ', { min: 0, max: 16, derived: true }),
      V('a', 'a', 'Vertical factor', { allowed: STRETCH, min: -4, max: 4 }),
      V('h', 'h', 'Shift right', { min: -10, max: 10, step: 0.5 }),
      V('k', 'k', 'Shift up', { min: -10, max: 10, step: 0.5 }),
      V('X', 'X', 'x of the moved point', { min: -20, max: 20, derived: true }),
      V('Y', 'Y', 'y of the moved point', { min: -100, max: 100, derived: true }),
    ],
    rules: [
      derive(
        'q = 2^p',
        'q',
        ['p'],
        '{q} = 2^{p}',
        (v) => 2 ** v.p!,
        '2^{p}',
        'The point on the parent y = 2ˣ.',
      ),
      derive(
        'X = p + h',
        'X',
        ['p', 'h'],
        '{X} = {p} + {h}',
        (v) => v.p! + v.h!,
        '{p} + {h}',
        'The shift right moves the x of every point by h.',
      ),
      derive(
        'Y = a × q + k',
        'Y',
        ['a', 'q', 'k'],
        '{Y} = {a} × {q} + {k}',
        (v) => v.a! * v.q! + v.k!,
        '{a} × {q} + {k}',
        'Stretch the y by a, then move it up by k.',
      ),
    ],
    example: { p: 2, q: 4, a: -3, h: -1, k: 5, X: 1, Y: -7 },
    startWith: ['p', 'a', 'h', 'k'],
    pictureLabels: ['p', 'q'],
    representation: {
      kind: 'functionGraph',
      family: 'exponential',
      a: 'a',
      b: 2,
      h: 'h',
      k: 'k',
      parent: true,
      at: { x: 'X', y: 'Y' },
      marks: ['asymptotes'],
    },
  }),

  // ── Complex numbers (N-CN.1–N-CN.3, N-CN.7) ──
  page({
    id: 'm.11.complex-numbers',
    assumptions: [
      'i² = −1, so the i × i term moves to the real part with its sign changed.',
      'Multiply every term by every term, as with two binomials.',
      'On the plane the lengths multiply and the angles add.',
    ],
    variables: [
      V('a', 'a', 'Real part of the first', { integer: true, min: -10, max: 10 }),
      V('b', 'b', 'Imaginary part of the first', { integer: true, min: -10, max: 10 }),
      V('c', 'c', 'Real part of the second', { integer: true, min: -10, max: 10 }),
      V('d', 'd', 'Imaginary part of the second', { integer: true, min: -10, max: 10 }),
      V('p', 'p', 'Real part of the product', {
        integer: true,
        min: -200,
        max: 200,
        derived: true,
      }),
      V('q', 'q', 'Imaginary part of the product', {
        integer: true,
        min: -200,
        max: 200,
        derived: true,
      }),
    ],
    rules: [
      derive(
        'p = ac − bd',
        'p',
        ['a', 'c', 'b', 'd'],
        '{p} = {a} × {c} − {b} × {d}',
        (v) => v.a! * v.c! - v.b! * v.d!,
        '{a} × {c} − {b} × {d}',
        'The real part: a × c, and bi × di = bd × i², which is −bd.',
      ),
      derive(
        'q = ad + bc',
        'q',
        ['a', 'd', 'b', 'c'],
        '{q} = {a} × {d} + {b} × {c}',
        (v) => v.a! * v.d! + v.b! * v.c!,
        '{a} × {d} + {b} × {c}',
        'The imaginary part: a × di and bi × c, the two outer and inner terms.',
      ),
    ],
    example: { a: 2, b: 3, c: 1, d: -4, p: 14, q: -5 },
    startWith: ['a', 'b', 'c', 'd'],
    equation: '({a} + {b}i)({c} + {d}i) = {p} + {q}i',
    representation: {
      kind: 'complexPlane',
      z: { re: 'a', im: 'b' },
      w: { re: 'c', im: 'd' },
      op: 'product',
      result: { re: 'p', im: 'q' },
    },
  }),
  page({
    id: 'm.11.complex-numbers~add-subtract',
    title: 'Add or subtract complex numbers',
    use: 'Use this for “(4 − 2i) − (−1 + 5i)”.',
    assumptions: [
      'Combine real parts with real parts and imaginary parts with imaginary parts.',
      'Subtracting a + bi is adding its opposite, −a − bi: the picture adds that.',
      'On the plane, adding is joining the arrows end to end.',
    ],
    variables: [
      V('a', 'a', 'Real part of the first', { integer: true, min: -10, max: 10 }),
      V('b', 'b', 'Imaginary part of the first', { integer: true, min: -10, max: 10 }),
      V('o', 'o', 'Add (1) or subtract (2)', { allowed: [1, 2], min: 1, max: 2 }),
      V('c', 'c', 'Real part of the second', { integer: true, min: -10, max: 10 }),
      V('d', 'd', 'Imaginary part of the second', { integer: true, min: -10, max: 10 }),
      V('C', 'C', 'Real part added', { integer: true, min: -10, max: 10, derived: true }),
      V('D', 'D', 'Imaginary part added', { integer: true, min: -10, max: 10, derived: true }),
      V('p', 'p', 'Real part of the answer', { integer: true, min: -20, max: 20, derived: true }),
      V('q', 'q', 'Imaginary part of the answer', {
        integer: true,
        min: -20,
        max: 20,
        derived: true,
      }),
    ],
    rules: [
      derive(
        'C = ±c',
        'C',
        ['o', 'c'],
        '{C} = (3 − 2 × {o}) × {c}',
        (v) => (3 - 2 * v.o!) * v.c!,
        (v) => (v.o === 2 ? '−1 × {c}' : '{c}'),
        (v) =>
          v.o === 2
            ? 'Subtracting: change the sign of the second real part.'
            : 'Adding: the second real part as it is.',
      ),
      derive(
        'D = ±d',
        'D',
        ['o', 'd'],
        '{D} = (3 − 2 × {o}) × {d}',
        (v) => (3 - 2 * v.o!) * v.d!,
        (v) => (v.o === 2 ? '−1 × {d}' : '{d}'),
        (v) =>
          v.o === 2
            ? 'Subtracting: change the sign of the second imaginary part.'
            : 'Adding: the second imaginary part as it is.',
      ),
      derive(
        'p = a + C',
        'p',
        ['a', 'C'],
        '{p} = {a} + {C}',
        (v) => v.a! + v.C!,
        '{a} + {C}',
        'Real parts together.',
      ),
      derive(
        'q = b + D',
        'q',
        ['b', 'D'],
        '{q} = {b} + {D}',
        (v) => v.b! + v.D!,
        '{b} + {D}',
        'Imaginary parts together.',
      ),
    ],
    example: { a: 4, b: -2, o: 2, c: -1, d: 5, C: 1, D: -5, p: 5, q: -7 },
    startWith: ['a', 'b', 'o', 'c', 'd'],
    equation: '({a} + {b}i) {o:op} ({c} + {d}i) = {p} + {q}i',
    representation: {
      kind: 'complexPlane',
      z: { re: 'a', im: 'b' },
      w: { re: 'C', im: 'D' },
      op: 'sum',
      result: { re: 'p', im: 'q' },
    },
  }),
  page({
    id: 'm.11.complex-numbers~quadratic',
    title: 'Complex solutions of a quadratic',
    use: 'Use this for “Solve x² − 4x + 13 = 0.”',
    assumptions: [
      'When b² − 4ac is negative, the square root in the quadratic formula is imaginary: √(−36) = 6i.',
      'The two solutions are p + qi and p − qi, a conjugate pair.',
      'Check by putting p + qi back into the equation, with i² = −1.',
    ],
    variables: [
      V('a', 'a', 'Coefficient of x²', { integer: true, min: -20, max: 20 }),
      V('b', 'b', 'Coefficient of x', { integer: true, min: -20, max: 20 }),
      V('c', 'c', 'Constant', { integer: true, min: -20, max: 20 }),
      V('D', 'D', 'Discriminant b² − 4ac', { integer: true, min: -2000, max: -1, derived: true }),
      V('p', 'p', 'Real part', { min: -20, max: 20, fraction: 40, derived: true }),
      V('q', 'q', 'Imaginary part', { min: -20, max: 20, derived: true }),
    ],
    rules: [
      limit(
        'a ≠ 0',
        '{a} is not 0',
        ['a'],
        (v) => v.a !== 0,
        'With a = 0 there is no x², so the equation is not a quadratic.',
      ),
      limit(
        'b² − 4ac < 0',
        '{b}² − 4 × {a} × {c} is negative',
        ['a', 'b', 'c'],
        (v) => v.b! ** 2 - 4 * v.a! * v.c! < 0,
        'b² − 4ac is 0 or more, so the solutions are real: use the quadratic formula page.',
      ),
      derive(
        'D = b² − 4ac',
        'D',
        ['b', 'a', 'c'],
        '{D} = {b}² − 4 × {a} × {c}',
        (v) => v.b! ** 2 - 4 * v.a! * v.c!,
        '{b}² − 4 × {a} × {c}',
        'The discriminant: negative means no real solutions.',
      ),
      derive(
        'p = −b ÷ (2a)',
        'p',
        ['b', 'a'],
        '{p} = −{b} ÷ (2 × {a})',
        (v) => div(-v.b!, 2 * v.a!),
        '−{b} ÷ (2 × {a})',
        'The real part of both solutions: the −b ÷ 2a of the formula.',
        { work: (v) => [`${fmt(-v.b!)} ÷ ${par(2 * v.a!)}`] },
      ),
      derive(
        'q = √(−D) ÷ (2a)',
        'q',
        ['D', 'a'],
        '{q} = √(−1 × {D}) ÷ (2 × {a})',
        (v) => (v.D! < 0 ? div(Math.sqrt(-v.D!), 2 * v.a!) : undefined),
        '√(−1 × {D}) ÷ (2 × {a})',
        '√D = √(−D) × i, since √(−1) = i: this is the i part, taken plus and minus.',
      ),
    ],
    example: { a: 1, b: -4, c: 13, D: -36, p: 2, q: 3 },
    startWith: ['a', 'b', 'c'],
    equation: '{a}x² + {b}x + {c} = 0',
    representation: {
      kind: 'complexPlane',
      z: { re: 'p', im: 'q' },
      conjugate: true,
    },
  }),

  // ── Function operations, composition and inverses (F-BF.1b, F-BF.4) ──
  page({
    id: 'm.11.inverse-functions',
    assumptions: [
      'f(g(x)) puts g(x) wherever f has x: here f(x) = px² + qx + r and g(x) = mx + c.',
      'Work inside out: g first, then f.',
      'f(g(x)) and g(f(x)) are usually different.',
    ],
    variables: [
      V('p', 'p', 'x² coefficient of f', { min: -10, max: 10, step: 1 }),
      V('q', 'q', 'x coefficient of f', { min: -10, max: 10, step: 1 }),
      V('r', 'r', 'Constant of f', { min: -10, max: 10, step: 1 }),
      V('m', 'm', 'Slope of g', { min: -10, max: 10, step: 1 }),
      V('c', 'c', 'Constant of g', { min: -10, max: 10, step: 1 }),
      V('A', 'A', 'x² coefficient of f(g(x))', { min: -1000, max: 1000, derived: true }),
      V('B', 'B', 'x coefficient of f(g(x))', { min: -3000, max: 3000, derived: true }),
      V('C', 'C', 'Constant of f(g(x))', { min: -2000, max: 2000, derived: true }),
      V('x', 'x', 'Input', { min: -20, max: 20, step: 0.5 }),
      V('y', 'y', 'f(g(x))', { min: -1e6, max: 1e6, derived: true }),
    ],
    rules: [
      limit('p ≠ 0', '{p} is not 0', ['p'], (v) => v.p !== 0, 'With p = 0, f is not a quadratic.'),
      limit(
        'm ≠ 0',
        '{m} is not 0',
        ['m'],
        (v) => v.m !== 0,
        'With m = 0, g is a constant and f(g(x)) is flat.',
      ),
      derive(
        'A = p × m²',
        'A',
        ['p', 'm'],
        '{A} = {p} × {m}²',
        (v) => v.p! * v.m! ** 2,
        '{p} × {m}²',
        'p(mx + c)² starts with p × m²x².',
      ),
      derive(
        'B = 2pmc + qm',
        'B',
        ['p', 'm', 'c', 'q'],
        '{B} = 2 × {p} × {m} × {c} + {q} × {m}',
        (v) => 2 * v.p! * v.m! * v.c! + v.q! * v.m!,
        '2 × {p} × {m} × {c} + {q} × {m}',
        'The x terms: 2mc x from the square, times p, and q × mx.',
      ),
      derive(
        'C = pc² + qc + r',
        'C',
        ['p', 'c', 'q', 'r'],
        '{C} = {p} × {c}² + {q} × {c} + {r}',
        (v) => v.p! * v.c! ** 2 + v.q! * v.c! + v.r!,
        '{p} × {c}² + {q} × {c} + {r}',
        'The constants: f(c), since g(0) = c.',
      ),
      derive(
        'y = Ax² + Bx + C',
        'y',
        ['A', 'x', 'B', 'C'],
        '{y} = {A} × {x}² + {B} × {x} + {C}',
        (v) => v.A! * v.x! ** 2 + v.B! * v.x! + v.C!,
        '{A} × {x}² + {B} × {x} + {C}',
        'Evaluate the combined function at x.',
      ),
    ],
    example: { p: 1, q: -3, r: 0, m: 2, c: 1, A: 4, B: -2, C: -2, x: 1, y: 0 },
    startWith: ['p', 'q', 'r', 'm', 'c', 'x'],
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'standard',
      a: 'A',
      b: 'B',
      c: 'C',
      at: { x: 'x', y: 'y' },
    },
  }),
  page({
    id: 'm.11.inverse-functions~operations',
    title: 'Add, subtract and multiply functions',
    use: 'Use this for “f(x) = 2x − 1 and g(x) = x + 4. Find (f + g)(3), (f − g)(3) and (f · g)(3).”',
    assumptions: [
      '(f + g)(x) = f(x) + g(x): find each function’s value at x, then add.',
      'Subtract or multiply the same way: (f − g)(x) = f(x) − g(x), (f · g)(x) = f(x) × g(x).',
    ],
    variables: [
      V('a', 'a', 'Slope of f', { min: -10, max: 10, step: 0.5 }),
      V('b', 'b', 'Intercept of f', { min: -10, max: 10, step: 0.5 }),
      V('c', 'c', 'Slope of g', { min: -10, max: 10, step: 0.5 }),
      V('d', 'd', 'Intercept of g', { min: -10, max: 10, step: 0.5 }),
      V('x', 'x', 'Input', { min: -20, max: 20, step: 0.5 }),
      V('F', 'f(x)', 'Value of f', { min: -300, max: 300, derived: true }),
      V('G', 'g(x)', 'Value of g', { min: -300, max: 300, derived: true }),
      V('S', '(f + g)(x)', 'Sum', { min: -600, max: 600, derived: true }),
      V('Df', '(f − g)(x)', 'Difference', { min: -600, max: 600, derived: true }),
      V('P', '(f · g)(x)', 'Product', { min: -1e5, max: 1e5, derived: true }),
    ],
    rules: [
      derive(
        'f(x) = ax + b',
        'F',
        ['a', 'x', 'b'],
        '{F} = {a} × {x} + {b}',
        (v) => v.a! * v.x! + v.b!,
        '{a} × {x} + {b}',
        'Put x into f.',
      ),
      derive(
        'g(x) = cx + d',
        'G',
        ['c', 'x', 'd'],
        '{G} = {c} × {x} + {d}',
        (v) => v.c! * v.x! + v.d!,
        '{c} × {x} + {d}',
        'Put x into g.',
      ),
      derive(
        '(f + g)(x) = f(x) + g(x)',
        'S',
        ['F', 'G'],
        '{S} = {F} + {G}',
        (v) => v.F! + v.G!,
        '{F} + {G}',
        'Add the two values at x.',
      ),
      derive(
        '(f − g)(x) = f(x) − g(x)',
        'Df',
        ['F', 'G'],
        '{Df} = {F} − {G}',
        (v) => v.F! - v.G!,
        '{F} − {G}',
        'Take g’s value from f’s.',
      ),
      derive(
        '(f · g)(x) = f(x) × g(x)',
        'P',
        ['F', 'G'],
        '{P} = {F} × {G}',
        (v) => v.F! * v.G!,
        '{F} × {G}',
        'Multiply the two values at x.',
      ),
    ],
    example: { a: 2, b: -1, c: 1, d: 4, x: 3, F: 5, G: 7, S: 12, Df: -2, P: 35 },
    startWith: ['a', 'b', 'c', 'd', 'x'],
    pictureLabels: ['S', 'Df', 'P'],
    representation: {
      kind: 'functionGraph',
      family: 'linear',
      m: 'a',
      b: 'b',
      other: { family: 'linear', m: 'c', b: 'd', name: 'g' },
      at: { x: 'x', y: 'F' },
    },
  }),
  page({
    id: 'm.11.inverse-functions~inverse',
    title: 'The inverse of a linear function',
    use: 'Use this for “Find f⁻¹(x) for f(x) = 3x − 6, and check f(f⁻¹(x)) = x.”',
    assumptions: [
      'Swap x and y in y = ax + b, then solve for y: f⁻¹(x) = (x − b) ÷ a = mx + n.',
      '(x, y) on f is (y, x) on f⁻¹: the two graphs are reflections over y = x.',
      'a is not 0, or f is flat and has no inverse.',
    ],
    variables: [
      V('a', 'a', 'Slope of f', { min: -10, max: 10, step: 0.5 }),
      V('b', 'b', 'Intercept of f', { min: -20, max: 20, step: 0.5 }),
      V('m', 'm', 'Slope of f⁻¹', { min: -100, max: 100, fraction: 20, derived: true }),
      V('n', 'n', 'Intercept of f⁻¹', { min: -1000, max: 1000, fraction: 20, derived: true }),
      V('x', 'x', 'Input of f', { min: -20, max: 20, step: 0.5 }),
      V('y', 'y', 'f(x), the input of f⁻¹', { min: -500, max: 500, step: 0.5 }),
    ],
    rules: [
      limit(
        'a ≠ 0',
        '{a} is not 0',
        ['a'],
        (v) => v.a !== 0,
        'A flat line takes every x to the same y, so no inverse can undo it.',
      ),
      rule(
        'y = ax + b',
        '{y} = {a} × {x} + {b}',
        ['y', 'a', 'x', 'b'],
        (v) => v.y! - (v.a! * v.x! + v.b!),
        {
          y: [(v) => exact(v.a! * v.x! + v.b!), '{a} × {x} + {b}', 'Put x into f.'],
          x: [
            (v) => fin(div(v.y! - v.b!, v.a!)),
            '({y} − {b}) ÷ {a}',
            'The inverse at y: take away b, then divide by a.',
          ],
          b: [(v) => exact(v.y! - v.a! * v.x!), '{y} − {a} × {x}', 'Take a × x away from y.'],
          a: [() => undefined],
        },
      ),
      derive(
        'm = 1 ÷ a',
        'm',
        ['a'],
        '{m} = 1 ÷ {a}',
        (v) => div(1, v.a!),
        '1 ÷ {a}',
        'Solving x = ay + b for y divides by a.',
      ),
      derive(
        'n = −b ÷ a',
        'n',
        ['b', 'a'],
        '{n} = −{b} ÷ {a}',
        (v) => div(-v.b!, v.a!),
        '−{b} ÷ {a}',
        'The −b, divided by a too.',
        { work: (v) => [`${fmt(-v.b!)} ÷ ${par(v.a!)}`] },
      ),
    ],
    example: { a: 3, b: -6, m: 1 / 3, n: 2, x: 4, y: 6 },
    startWith: ['a', 'b', 'x'],
    pictureLabels: ['m', 'n'],
    representation: {
      kind: 'functionGraph',
      family: 'linear',
      m: 'a',
      b: 'b',
      inverse: true,
      at: { x: 'x', y: 'y' },
    },
  }),

  // ── Radical functions and equations (A-REI.2, F-IF.7b) ──
  page({
    id: 'm.11.radical-functions',
    assumptions: [
      'Square both sides to undo the root: ax + b = c².',
      'A square root is never negative, so c must be 0 or more.',
      'Check the answer in the first equation.',
    ],
    variables: [
      V('a', 'a', 'Coefficient of x', { min: -10, max: 10, step: 1 }),
      V('b', 'b', 'Constant under the root', { min: -50, max: 50, step: 1 }),
      V('c', 'c', 'Right side', { min: -20, max: 20, step: 1 }),
      V('x', 'x', 'Solution', { min: -500, max: 500, fraction: 12 }),
    ],
    rules: [
      limit(
        'a ≠ 0',
        '{a} is not 0',
        ['a'],
        (v) => v.a !== 0,
        'With a = 0 there is no x to solve for.',
      ),
      limit(
        'c ≥ 0',
        '{c} is 0 or more',
        ['c'],
        (v) => v.c! >= 0,
        'A square root is never negative, so no x works.',
      ),
      rule(
        'ax + b = c²',
        '{a} × {x} + {b} = {c}²',
        ['a', 'x', 'b', 'c'],
        (v) => v.a! * v.x! + v.b! - v.c! ** 2,
        {
          x: [
            (v) => fin(div(v.c! ** 2 - v.b!, v.a!)),
            '({c}² − {b}) ÷ {a}',
            'Square both sides, take b from both sides, then divide by a.',
          ],
          c: [
            (v) => (v.a! * v.x! + v.b! < 0 ? undefined : exact(Math.sqrt(v.a! * v.x! + v.b!))),
            '√({a} × {x} + {b})',
            'Put x in and take the square root.',
          ],
          b: [
            (v) => exact(v.c! ** 2 - v.a! * v.x!),
            '{c}² − {a} × {x}',
            'Square both sides, then take ax away.',
          ],
          a: [() => undefined],
        },
      ),
    ],
    example: { a: 3, b: 4, c: 5, x: 7 },
    startWith: ['a', 'b', 'c'],
    equation: '√({a}x + {b}) = {c}',
    representation: {
      kind: 'plot',
      x: { var: 'x', min: -2, max: 20, label: 'x' },
      y: { var: 'c', min: 0, max: 8, label: 'y' },
      params: ['a', 'b'],
      autoRange: true,
    },
  }),
  page({
    id: 'm.11.radical-functions~extraneous',
    title: 'Extraneous solutions',
    use: 'Use this for “Solve √(x + 7) = x + 1” and reject the extraneous solution.',
    assumptions: [
      'Squaring both sides gives x + a = (x + b)², a quadratic: the graph shows its two zeros, the candidates.',
      'Squaring can add a false solution: one where x + b is negative, since a root never is.',
      'Check each candidate in the first equation; keep only the ones that work.',
    ],
    variables: [
      V('a', 'a', 'Constant under the root', { min: -50, max: 50, step: 1 }),
      V('b', 'b', 'Constant on the right', { min: -50, max: 50, step: 1 }),
      V('B', 'B', 'x coefficient after squaring, 2b − 1', { min: -101, max: 99, derived: true }),
      V('C', 'C', 'Constant after squaring, b² − a', { min: -50, max: 2550, derived: true }),
      V('x1', 'x₁', 'Larger candidate', { min: -100, max: 100, derived: true }),
      V('x2', 'x₂', 'Smaller candidate', { min: -100, max: 100, derived: true }),
      V('L2', 'L', 'Left side at x₂', { min: 0, max: 100, derived: true }),
      V('R2', 'R', 'Right side at x₂', { min: -100, max: 100, derived: true }),
    ],
    rules: [
      limit(
        '1 + 4a − 4b ≥ 0',
        '1 + 4 × {a} − 4 × {b} is 0 or more',
        ['a', 'b'],
        (v) => 1 + 4 * v.a! - 4 * v.b! >= 0,
        'The line never meets the root curve: the quadratic has no real candidates, so there is no solution.',
      ),
      derive(
        'B = 2b − 1',
        'B',
        ['b'],
        '{B} = 2 × {b} − 1',
        (v) => 2 * v.b! - 1,
        '2 × {b} − 1',
        'Square both sides: x + a = x² + 2bx + b², so x² + (2b − 1)x + (b² − a) = 0.',
      ),
      derive(
        'C = b² − a',
        'C',
        ['b', 'a'],
        '{C} = {b}² − {a}',
        (v) => v.b! ** 2 - v.a!,
        '{b}² − {a}',
        'The constant of the squared equation.',
      ),
      derive(
        'x₁ = ((1 − 2b) + √(1 + 4a − 4b)) ÷ 2',
        'x1',
        ['b', 'a'],
        '{x1} = ((1 − 2 × {b}) + √(1 + 4 × {a} − 4 × {b})) ÷ 2',
        (v) => (1 - 2 * v.b! + Math.sqrt(1 + 4 * v.a! - 4 * v.b!)) / 2,
        '((1 − 2 × {b}) + √(1 + 4 × {a} − 4 × {b})) ÷ 2',
        'x² + (2b − 1)x + b² − a = 0 by the quadratic formula; here x + b > 0, so it always works.',
      ),
      derive(
        'x₂ = ((1 − 2b) − √(1 + 4a − 4b)) ÷ 2',
        'x2',
        ['b', 'a'],
        '{x2} = ((1 − 2 × {b}) − √(1 + 4 × {a} − 4 × {b})) ÷ 2',
        (v) => (1 - 2 * v.b! - Math.sqrt(1 + 4 * v.a! - 4 * v.b!)) / 2,
        '((1 − 2 × {b}) − √(1 + 4 × {a} − 4 × {b})) ÷ 2',
        'The other candidate, with the minus sign.',
      ),
      derive(
        'L = √(x₂ + a)',
        'L2',
        ['x2', 'a'],
        '{L2} = √({x2} + {a})',
        (v) => Math.sqrt(Math.max(0, v.x2! + v.a!)),
        '√({x2} + {a})',
        'Check x₂ in the left side of the first equation.',
      ),
      derive(
        'R = x₂ + b',
        'R2',
        ['x2', 'b'],
        '{R2} = {x2} + {b}',
        (v) => v.x2! + v.b!,
        '{x2} + {b}',
        (v) =>
          v.x2! + v.b! < -1e-9
            ? 'The right side is negative but a root is not: x₂ is extraneous, so reject it.'
            : 'The right side equals the root: x₂ is a solution too.',
      ),
    ],
    example: { a: 7, b: 1, B: 1, C: -6, x1: 2, x2: -3, L2: 2, R2: -2 },
    startWith: ['a', 'b'],
    equation: '√(x + {a}) = x + {b}',
    pictureLabels: ['L2', 'R2'],
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'standard',
      a: 1,
      b: 'B',
      c: 'C',
      shows: { zeros: ['x2', 'x1'] },
      marks: ['zeros'],
    },
  }),
  page({
    id: 'm.11.radical-functions~graph',
    title: 'Graph a square root function',
    use: 'Use this for “Find the domain and range of y = 2√(x + 3) + 1.”',
    assumptions: [
      'y = a√(x − h) + k starts at (h, k): the parent √x moved right h and up k.',
      'The domain is x ≥ h; the range is y ≥ k when a > 0 and y ≤ k when a < 0.',
    ],
    variables: [
      V('a', 'a', 'Vertical factor', { min: -10, max: 10, step: 0.5 }),
      V('h', 'h', 'Start x', { min: -20, max: 20, step: 0.5 }),
      V('k', 'k', 'Start y', { min: -20, max: 20, step: 0.5 }),
      V('x', 'x', 'Input', { min: -20, max: 60, step: 0.5 }),
      V('y', 'y', 'Output', { min: -200, max: 200 }),
    ],
    rules: [
      limit(
        'a ≠ 0',
        '{a} is not 0',
        ['a'],
        (v) => v.a !== 0,
        'With a = 0 the graph is the flat line y = k.',
      ),
      limit(
        'x ≥ h',
        '{x} is at least {h}',
        ['x', 'h'],
        (v) => v.x! >= v.h!,
        'Left of x = h the root would be of a negative number: x is outside the domain.',
      ),
      rule(
        'y = a√(x − h) + k',
        '{y} = {a} × √({x} − {h}) + {k}',
        ['y', 'a', 'x', 'h', 'k'],
        (v) => v.y! - (v.a! * Math.sqrt(v.x! - v.h!) + v.k!),
        {
          y: [
            (v) => (v.x! < v.h! ? undefined : exact(v.a! * Math.sqrt(v.x! - v.h!) + v.k!)),
            '{a} × √({x} − {h}) + {k}',
            'Take the square root of x − h, multiply by a, then add k.',
          ],
          x: [
            (v) =>
              v.a === 0 || (v.y! - v.k!) / v.a! < 0
                ? undefined
                : exact(v.h! + ((v.y! - v.k!) / v.a!) ** 2),
            '{h} + (({y} − {k}) ÷ {a})²',
            'Take away k, divide by a, square both sides, then add h.',
          ],
          a: [() => undefined],
          h: [() => undefined],
          k: [() => undefined],
        },
      ),
    ],
    example: { a: 2, h: -3, k: 1, x: 6, y: 7 },
    startWith: ['a', 'h', 'k', 'x'],
    representation: {
      kind: 'functionGraph',
      family: 'root',
      index: 2,
      a: 'a',
      h: 'h',
      k: 'k',
      parent: true,
      at: { x: 'x', y: 'y' },
      marks: ['domain', 'range'],
    },
  }),

  // ── Rational expressions, equations and functions (A-APR.6, A-REI.2, F-IF.7d) ──
  page({
    id: 'm.11.rational-functions',
    assumptions: [
      'y = a(x − z)(x − c) ÷ ((x − p)(x − c)): a factor that cancels leaves a hole at x = c, not an asymptote.',
      'A factor left in the denominator gives a vertical asymptote, x = p.',
      'Equal degrees top and bottom: the horizontal asymptote is y = a.',
    ],
    variables: [
      V('a', 'a', 'Leading factor', { min: -10, max: 10, step: 0.5 }),
      V('z', 'z', 'Zero', { min: -10, max: 10, step: 0.5 }),
      V('p', 'p', 'Vertical asymptote', { min: -10, max: 10, step: 0.5 }),
      V('c', 'c', 'x of the hole', { min: -10, max: 10, step: 0.5 }),
      V('H', 'H', 'y of the hole', { min: -1000, max: 1000, fraction: 40, derived: true }),
      V('x', 'x', 'Input', { min: -20, max: 20, step: 0.5 }),
      V('y', 'y', 'Output', { min: -1e4, max: 1e4, derived: true }),
    ],
    rules: [
      limit(
        'a ≠ 0',
        '{a} is not 0',
        ['a'],
        (v) => v.a !== 0,
        'With a = 0 the function is 0 everywhere.',
      ),
      limit(
        'z ≠ p',
        '{z} is not {p}',
        ['z', 'p'],
        (v) => v.z !== v.p,
        'With z = p that factor cancels too: there would be no asymptote.',
      ),
      limit(
        'c ≠ p',
        '{c} is not {p}',
        ['c', 'p'],
        (v) => v.c !== v.p,
        'With c = p the denominator has (x − p)²; the hole would be an asymptote.',
      ),
      limit(
        'x ≠ c',
        '{x} is not {c}',
        ['x', 'c'],
        (v) => v.x !== v.c,
        'At x = c the function has a hole: it has no value there.',
      ),
      derive(
        'H = a(c − z) ÷ (c − p)',
        'H',
        ['a', 'c', 'z', 'p'],
        '{H} = {a} × ({c} − {z}) ÷ ({c} − {p})',
        (v) => div(v.a! * (v.c! - v.z!), v.c! - v.p!),
        '{a} × ({c} − {z}) ÷ ({c} − {p})',
        'Cancel x − c, then put x = c into what is left: the hole’s height.',
      ),
      derive(
        'y = a(x − z) ÷ (x − p)',
        'y',
        ['a', 'x', 'z', 'p'],
        '{y} = {a} × ({x} − {z}) ÷ ({x} − {p})',
        (v) => div(v.a! * (v.x! - v.z!), v.x! - v.p!),
        '{a} × ({x} − {z}) ÷ ({x} − {p})',
        'Cancel the shared factor x − c, then evaluate.',
      ),
    ],
    example: { a: 1, z: 1, p: 3, c: -2, H: 0.6, x: 5, y: 2 },
    startWith: ['a', 'z', 'p', 'c', 'x'],
    pictureLabels: ['H'],
    representation: {
      kind: 'functionGraph',
      family: 'rational',
      a: 'a',
      zeros: ['z', 'c'],
      poles: ['p', 'c'],
      at: { x: 'x', y: 'y' },
      marks: ['zeros', 'asymptotes'],
    },
  }),
  page({
    id: 'm.11.rational-functions~add-subtract',
    title: 'Add or subtract rational expressions',
    use: 'Use this for “Write 3/(x − 1) + 2/(x + 4) as one fraction.”',
    assumptions: [
      'The common denominator is (x − p)(x − q) = x² + Sx + P.',
      'Multiply each top by the other bottom: a(x − q) ± c(x − p) = Ax + B.',
      'p and q are different, or the fractions already share a denominator.',
    ],
    variables: [
      V('a', 'a', 'First top', { min: -20, max: 20, step: 1 }),
      V('p', 'p', 'First bottom is x − p', { min: -20, max: 20, step: 1 }),
      V('o', 'o', 'Add (1) or subtract (2)', { allowed: [1, 2], min: 1, max: 2 }),
      V('c', 'c', 'Second top', { min: -20, max: 20, step: 1 }),
      V('q', 'q', 'Second bottom is x − q', { min: -20, max: 20, step: 1 }),
      V('A', 'A', 'x coefficient on top', { min: -40, max: 40, derived: true }),
      V('B', 'B', 'Constant on top', { min: -1000, max: 1000, derived: true }),
      V('S', 'S', 'x coefficient below', { min: -40, max: 40, derived: true }),
      V('P', 'P', 'Constant below', { min: -400, max: 400, derived: true }),
      V('Z', 'Z', 'Zero of the result', { min: -1e4, max: 1e4, fraction: 40, derived: true }),
    ],
    rules: [
      limit(
        'p ≠ q',
        '{p} is not {q}',
        ['p', 'q'],
        (v) => v.p !== v.q,
        'The denominators are the same: add or subtract the tops over x − p.',
      ),
      derive(
        'A = a ± c',
        'A',
        ['a', 'o', 'c'],
        '{A} = {a} + (3 − 2 × {o}) × {c}',
        (v) => v.a! + (3 - 2 * v.o!) * v.c!,
        (v) => (v.o === 2 ? '{a} − {c}' : '{a} + {c}'),
        'The x terms of a(x − q) and c(x − p).',
      ),
      derive(
        'B = −(aq ± cp)',
        'B',
        ['a', 'q', 'o', 'c', 'p'],
        '{B} = −({a} × {q} + (3 − 2 × {o}) × {c} × {p})',
        (v) => -(v.a! * v.q! + (3 - 2 * v.o!) * v.c! * v.p!),
        (v) => (v.o === 2 ? '−({a} × {q} − {c} × {p})' : '−({a} × {q} + {c} × {p})'),
        'The numbers: a × (−q) and c × (−p), combined the same way.',
        {
          work: (v) => {
            const s1 = v.a! * v.q!;
            const s2 = (3 - 2 * v.o!) * v.c! * v.p!;
            return [`−(${fmt(s1)} + ${par(s2)})`, `−${par(s1 + s2)}`];
          },
        },
      ),
      derive(
        'S = −(p + q)',
        'S',
        ['p', 'q'],
        '{S} = −({p} + {q})',
        (v) => -(v.p! + v.q!),
        '−({p} + {q})',
        '(x − p)(x − q) has x terms −px − qx.',
        { work: (v) => [`−${par(v.p! + v.q!)}`] },
      ),
      derive(
        'P = pq',
        'P',
        ['p', 'q'],
        '{P} = {p} × {q}',
        (v) => v.p! * v.q!,
        '{p} × {q}',
        '(−p) × (−q) is pq.',
      ),
      derive(
        'Z = −B ÷ A',
        'Z',
        ['B', 'A'],
        '{Z} = −{B} ÷ {A}',
        (v) => div(-v.B!, v.A!),
        '−{B} ÷ {A}',
        'The top Ax + B is 0 here: the graph crosses the x-axis.',
        { work: (v) => [`${fmt(-v.B!)} ÷ ${par(v.A!)}`] },
      ),
    ],
    example: { a: 3, p: 1, o: 1, c: 2, q: -4, A: 5, B: 10, S: 3, P: -4, Z: -2 },
    startWith: ['a', 'p', 'o', 'c', 'q'],
    equation: '{a}/{x − {p}} {o:op} {c}/{x − {q}} = {{A}x + {B}}/{x² + {S}x + {P}}',
    pictureLabels: ['Z'],
    representation: {
      kind: 'functionGraph',
      family: 'rational',
      a: 'A',
      zeros: ['Z'],
      poles: ['p', 'q'],
      marks: ['zeros', 'asymptotes'],
    },
  }),
  page({
    id: 'm.11.rational-functions~solve',
    title: 'Solve a rational equation',
    use: 'Use this for “Solve x/(x − 2) = 2/(x − 2) + 3/x” and reject the extraneous solution.',
    assumptions: [
      'Multiply every term by x(x − p) to clear the fractions: x² − (a + b)x + bp = 0.',
      'A candidate that makes a denominator 0 (x = 0 or x = p) is extraneous: reject it.',
      'On the graph of the left side minus the right, an extraneous candidate is a hole.',
    ],
    variables: [
      V('p', 'p', 'Denominator is x − p', { min: -20, max: 20, step: 1 }),
      V('a', 'a', 'Top of the first right-hand fraction', { min: -20, max: 20, step: 1 }),
      V('b', 'b', 'Top of the second right-hand fraction', { min: -20, max: 20, step: 1 }),
      V('x1', 'x₁', 'Larger candidate', { min: -100, max: 100, derived: true }),
      V('x2', 'x₂', 'Smaller candidate', { min: -100, max: 100, derived: true }),
    ],
    rules: [
      limit(
        'p ≠ 0',
        '{p} is not 0',
        ['p'],
        (v) => v.p !== 0,
        'With p = 0 two denominators are the same x: use x/x = 1 instead.',
      ),
      limit(
        '(a + b)² − 4bp ≥ 0',
        '({a} + {b})² − 4 × {b} × {p} is 0 or more',
        ['a', 'b', 'p'],
        (v) => (v.a! + v.b!) ** 2 - 4 * v.b! * v.p! >= 0,
        'The quadratic has no real candidates, so the equation has no solution.',
      ),
      derive(
        'x₁ = ((a + b) + √((a + b)² − 4bp)) ÷ 2',
        'x1',
        ['a', 'b', 'p'],
        '{x1} = (({a} + {b}) + √(({a} + {b})² − 4 × {b} × {p})) ÷ 2',
        (v) => (v.a! + v.b! + Math.sqrt((v.a! + v.b!) ** 2 - 4 * v.b! * v.p!)) / 2,
        '(({a} + {b}) + √(({a} + {b})² − 4 × {b} × {p})) ÷ 2',
        (v) => candidateHow(v, v.x1!, 'x₁'),
      ),
      derive(
        'x₂ = ((a + b) − √((a + b)² − 4bp)) ÷ 2',
        'x2',
        ['a', 'b', 'p'],
        '{x2} = (({a} + {b}) − √(({a} + {b})² − 4 × {b} × {p})) ÷ 2',
        (v) => (v.a! + v.b! - Math.sqrt((v.a! + v.b!) ** 2 - 4 * v.b! * v.p!)) / 2,
        '(({a} + {b}) − √(({a} + {b})² − 4 × {b} × {p})) ÷ 2',
        (v) => candidateHow(v, v.x2!, 'x₂'),
      ),
    ],
    example: { p: 2, a: 2, b: 3, x1: 3, x2: 2 },
    startWith: ['p', 'a', 'b'],
    equation: 'x/{x − {p}} = {a}/{x − {p}} + {b}/x',
    representation: {
      kind: 'functionGraph',
      family: 'rational',
      zeros: ['x1', 'x2'],
      poles: [0, 'p'],
      marks: ['zeros', 'asymptotes'],
    },
  }),
  page({
    id: 'm.11.rational-functions~variation',
    title: 'Inverse variation',
    use: 'Use this for “6 workers take 10 days. How long do 4 workers take?”',
    assumptions: [
      'y varies inversely with x when y = k ÷ x: the product xy is the same constant k.',
      'Doubling x halves y.',
    ],
    variables: [
      V('x1', 'x₁', 'First x', { min: 0.01, max: 60, step: 0.5 }),
      V('y1', 'y₁', 'First y', { min: 0.01, max: 60, step: 0.5 }),
      V('k', 'k', 'Constant of variation', { min: 0.0001, max: 1e6, derived: true }),
      V('x2', 'x₂', 'Second x', { min: 0.01, max: 1000, step: 0.5 }),
      V('y2', 'y₂', 'Second y', { min: 0.0001, max: 1e8 }),
    ],
    rules: [
      derive(
        'k = x₁y₁',
        'k',
        ['x1', 'y1'],
        '{k} = {x1} × {y1}',
        (v) => v.x1! * v.y1!,
        '{x1} × {y1}',
        'The product xy is the same for every pair.',
      ),
      rule('y₂ = k ÷ x₂', '{y2} = {k} ÷ {x2}', ['y2', 'k', 'x2'], (v) => v.y2! * v.x2! - v.k!, {
        y2: [(v) => fin(div(v.k!, v.x2!)), '{k} ÷ {x2}', 'Share the constant k by the new x.'],
        x2: [(v) => fin(div(v.k!, v.y2!)), '{k} ÷ {y2}', 'Share the constant k by the new y.'],
        k: [() => undefined],
      }),
    ],
    example: { x1: 6, y1: 10, k: 60, x2: 4, y2: 15 },
    startWith: ['x1', 'y1', 'x2'],
    pictureLabels: ['x1', 'y1'],
    representation: {
      kind: 'functionGraph',
      family: 'rational',
      a: 'k',
      zeros: [],
      poles: [0],
      at: { x: 'x2', y: 'y2' },
      marks: ['asymptotes'],
    },
  }),
];
