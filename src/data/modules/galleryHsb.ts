/**
 * Grades 9–12 gallery demos (group HB; see pictureRequestsHs.ts and docs/RENDERINGS_HS.md).
 * Each demo stands in for a planned page: real variables, relations, steps and a use line, so
 * `scripts/promote-demo.mjs` can copy it into a grade file. Spread into gallery.ts.
 */
import {
  binomialPmf,
  chiCdf,
  chiCritical,
  choose,
  invPhi,
  Phi,
} from '@/components/module/reps/statMath';
import type { Relation, Values, VariableDef } from '@/engine/types';

import { atLeast, div } from './helpers';
import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

type Rel = { relation: Relation; steps: Record<string, StepText> };

const V = (
  id: string,
  symbol: string,
  name: string,
  extra: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...extra });

/** A probability, 0 to 1. */
const prob = (id: string, symbol: string, name: string) =>
  V(id, symbol, name, { min: 0, max: 1, step: 0.0001 });
const zVar = (id = 'z', name = 'z-score', symbol = 'z') =>
  V(id, symbol, name, { min: -6, max: 6, step: 0.01 });

/** z = (x − μ) ÷ σ. */
function zScore(z: string, x: string, m: string, s: string): Rel {
  return {
    relation: {
      id: `${z} = (${x} − ${m}) ÷ ${s}`,
      display: `{${z}} = ({${x}} − {${m}}) ÷ {${s}}`,
      vars: [z, x, m, s],
      residual: (v: Values) => v[z]! * v[s]! - (v[x]! - v[m]!),
      solve: {
        [z]: (v: Values) => div(v[x]! - v[m]!, v[s]!),
        [x]: (v: Values) => v[m]! + v[z]! * v[s]!,
        [m]: (v: Values) => v[x]! - v[z]! * v[s]!,
        [s]: (v: Values) => div(v[x]! - v[m]!, v[z]!),
      },
    },
    steps: {
      [z]: {
        expr: `({${x}} − {${m}}) ÷ {${s}}`,
        how: 'How many standard deviations the value is from the mean.',
      },
      [x]: {
        expr: `{${m}} + {${z}} × {${s}}`,
        how: 'Start at the mean and go z standard deviations.',
      },
      [m]: {
        expr: `{${x}} − {${z}} × {${s}}`,
        how: 'Go back z standard deviations from the value.',
      },
      [s]: {
        expr: `({${x}} − {${m}}) ÷ {${z}}`,
        how: 'The distance from the mean, split into z equal steps.',
      },
    },
  };
}

const inOpen = (p: number) => (p > 0 && p < 1 ? p : undefined);

/** P = Φ(z), the area left of z. */
function leftArea(P: string, z: string): Rel {
  return {
    relation: {
      id: `${P} = Φ(${z})`,
      display: `{${P}} = Φ({${z}})`,
      vars: [P, z],
      residual: (v: Values) => v[P]! - Phi(v[z]!),
      solve: {
        [P]: (v: Values) => Phi(v[z]!),
        [z]: (v: Values) => (inOpen(v[P]!) === undefined ? undefined : invPhi(v[P]!)),
      },
    },
    steps: {
      [P]: {
        expr: `Φ({${z}})`,
        how: 'Φ(z) is the area under the standard normal curve left of z.',
      },
      [z]: { expr: `invNorm({${P}})`, how: 'invNorm undoes Φ: the z with that area to its left.' },
    },
  };
}

/** P = 1 − Φ(z), the area right of z. */
function rightArea(P: string, z: string): Rel {
  return {
    relation: {
      id: `${P} = 1 − Φ(${z})`,
      display: `{${P}} = 1 − Φ({${z}})`,
      vars: [P, z],
      residual: (v: Values) => v[P]! - (1 - Phi(v[z]!)),
      solve: {
        [P]: (v: Values) => 1 - Phi(v[z]!),
        [z]: (v: Values) => (inOpen(v[P]!) === undefined ? undefined : invPhi(1 - v[P]!)),
      },
    },
    steps: {
      [P]: { expr: `1 − Φ({${z}})`, how: 'The whole area is 1; take away the area left of z.' },
      [z]: { expr: `invNorm(1 − {${P}})`, how: 'The area left of z is 1 minus the right tail.' },
    },
  };
}

/** SE = σ ÷ √n. */
const standardError: Rel = {
  relation: {
    id: 'SE = σ ÷ √n',
    display: '{SE} = {s} ÷ √{n}',
    vars: ['SE', 's', 'n'],
    residual: (v: Values) => v.SE! * Math.sqrt(v.n!) - v.s!,
    solve: {
      SE: (v: Values) => div(v.s!, Math.sqrt(v.n!)),
      s: (v: Values) => v.SE! * Math.sqrt(v.n!),
      n: (v: Values) => (v.SE! > 0 ? (v.s! / v.SE!) ** 2 : undefined),
    },
  },
  steps: {
    SE: { expr: '{s} ÷ √{n}', how: 'Means of n values spread less: divide σ by the root of n.' },
    s: { expr: '{SE} × √{n}', how: 'Undo the division by the root of n.' },
    n: { expr: '({s} ÷ {SE})²', how: 'Square both sides: n = (σ ÷ SE)².' },
  },
};

/** z⋆ = invNorm(1 − (1 − C) ÷ 2), the critical value for confidence C. */
const critical: Rel = {
  relation: {
    id: 'z⋆ = invNorm(1 − (1 − C) ÷ 2)',
    display: '{zs} = invNorm(1 − (1 − {C}) ÷ 2)',
    vars: ['zs', 'C'],
    residual: (v: Values) => Phi(v.zs!) - (1 - (1 - v.C!) / 2),
    solve: {
      zs: (v: Values) => (inOpen(v.C!) === undefined ? undefined : invPhi(1 - (1 - v.C!) / 2)),
      C: (v: Values) => 2 * Phi(v.zs!) - 1,
    },
  },
  steps: {
    zs: {
      expr: 'invNorm(1 − (1 − {C}) ÷ 2)',
      how: 'Half of what is left over, 1 − C, sits in each tail.',
    },
    C: { expr: '2 × Φ({zs}) − 1', how: 'The middle area between −z⋆ and z⋆.' },
  },
};

/** E = z⋆ × SE, the margin of error. */
const margin: Rel = {
  relation: {
    id: 'E = z⋆ × SE',
    display: '{E} = {zs} × {SE}',
    vars: ['E', 'zs', 'SE'],
    residual: (v: Values) => v.E! - v.zs! * v.SE!,
    solve: {
      E: (v: Values) => v.zs! * v.SE!,
      zs: (v: Values) => div(v.E!, v.SE!),
      SE: (v: Values) => div(v.E!, v.zs!),
    },
  },
  steps: {
    E: { expr: '{zs} × {SE}', how: 'The margin of error is z⋆ standard errors.' },
    zs: { expr: '{E} ÷ {SE}', how: 'How many standard errors the margin is.' },
    SE: { expr: '{E} ÷ {zs}', how: 'Divide the margin by z⋆.' },
  },
};

/** a = b ± c (the ends of an interval). */
function offset(a: string, b: string, c: string, sign: 1 | -1): Rel {
  const op = sign > 0 ? '+' : '−';
  return {
    relation: {
      id: `${a} = ${b} ${op} ${c}`,
      display: `{${a}} = {${b}} ${op} {${c}}`,
      vars: [a, b, c],
      residual: (v: Values) => v[a]! - (v[b]! + sign * v[c]!),
      solve: {
        [a]: (v: Values) => v[b]! + sign * v[c]!,
        [b]: (v: Values) => v[a]! - sign * v[c]!,
        [c]: (v: Values) => sign * (v[a]! - v[b]!),
      },
    },
    steps: {
      [a]: {
        expr: `{${b}} ${op} {${c}}`,
        how: sign > 0 ? 'Go up by the margin.' : 'Go down by the margin.',
      },
      [b]: {
        expr: `{${a}} ${sign > 0 ? '−' : '+'} {${c}}`,
        how: 'The estimate is in the middle of the interval.',
      },
      [c]: {
        expr: sign > 0 ? `{${a}} − {${b}}` : `{${b}} − {${a}}`,
        how: 'The margin is the distance from the estimate to the end.',
      },
    },
  };
}

const rels = (...rs: Rel[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

const MU = (unit?: string, max = 1000) => V('m', 'μ', 'Mean', { unit, min: -max, max, step: 0.5 });
const SIGMA = (unit?: string, max = 500) =>
  V('s', 'σ', 'Standard deviation', { unit, min: 0.01, max, step: 0.1 });

const alphaVar = V('a', 'α', 'Significance level', { min: 0.001, max: 0.2, step: 0.005 });
const ALPHA_WHY =
  'The significance level is chosen before the test; the picture compares the p-value with it.';

// ── H02 normalCurve ──

const normalLeft: ModuleDef = {
  id: 'g.m11-normal-distribution-left',
  title: 'Normal curve: the area left of a value',
  use: 'Use this for the share of a normal population at or below a value, through its z-score.',
  assumptions: [
    'Heights of adults in one group are close to normal, with mean μ and standard deviation σ.',
    'The area under the curve left of x is the share of heights at or below x.',
  ],
  variables: [
    MU('cm', 300),
    SIGMA('cm', 100),
    V('x', 'x', 'Height', { unit: 'cm', min: 0, max: 300, step: 0.5 }),
    zVar(),
    prob('P', 'P', 'Share at or below x'),
  ],
  ...rels(zScore('z', 'x', 'm', 's'), leftArea('P', 'z')),
  example: { m: 170, s: 8, x: 182, z: 1.5, P: Phi(1.5) },
  startWith: ['m', 's', 'x'],
  unitSystems: ['metric'],
  representation: {
    kind: 'normalCurve',
    mean: 'm',
    sd: 's',
    axis: 'Height (cm)',
    shade: { to: 'x', area: 'P' },
    mark: { x: 'x', z: 'z' },
  },
};

const normalBetween: ModuleDef = {
  id: 'g.m11-normal-distribution-between',
  title: 'Normal curve: the area between two values',
  use: 'Use this for the share of a normal population between two values.',
  assumptions: [
    'Test scores are close to normal, with mean μ and standard deviation σ.',
    'The share between a and b is the area left of b minus the area left of a.',
  ],
  variables: [
    MU(),
    SIGMA(),
    V('lo', 'a', 'Lower score', { min: -1000, max: 2000, step: 5 }),
    V('hi', 'b', 'Upper score', { min: -1000, max: 2000, step: 5 }),
    zVar('za', 'z-score of a', 'z₁'),
    zVar('zb', 'z-score of b', 'z₂'),
    prob('P', 'P', 'Share between a and b'),
  ],
  ...rels(zScore('za', 'lo', 'm', 's'), zScore('zb', 'hi', 'm', 's'), {
    relation: {
      id: 'P = Φ(z₂) − Φ(z₁)',
      display: '{P} = Φ({zb}) − Φ({za})',
      vars: ['P', 'za', 'zb'],
      residual: (v: Values) => v.P! - (Phi(v.zb!) - Phi(v.za!)),
      solve: {
        P: (v: Values) => Phi(v.zb!) - Phi(v.za!),
        zb: (v: Values) => {
          const t = v.P! + Phi(v.za!);
          return inOpen(t) === undefined ? undefined : invPhi(t);
        },
        za: (v: Values) => {
          const t = Phi(v.zb!) - v.P!;
          return inOpen(t) === undefined ? undefined : invPhi(t);
        },
      },
    },
    steps: {
      P: { expr: 'Φ({zb}) − Φ({za})', how: 'The area left of b, less the area left of a.' },
      zb: {
        expr: 'invNorm({P} + Φ({za}))',
        how: 'The area left of b is P plus the area left of a.',
      },
      za: {
        expr: 'invNorm(Φ({zb}) − {P})',
        how: 'The area left of a is the area left of b less P.',
      },
    },
  }),
  example: { m: 500, s: 100, lo: 450, hi: 650, za: -0.5, zb: 1.5, P: Phi(1.5) - Phi(-0.5) },
  startWith: ['m', 's', 'lo', 'hi'],
  representation: {
    kind: 'normalCurve',
    mean: 'm',
    sd: 's',
    axis: 'Test score',
    shade: { from: 'lo', to: 'hi', area: 'P' },
  },
};

const normalBands: ModuleDef = {
  id: 'g.m11-normal-distribution-bands',
  title: 'The 68–95–99.7 rule',
  use: 'Use this for the share within k standard deviations of the mean.',
  assumptions: [
    'IQ scores are close to normal, with mean μ and standard deviation σ.',
    'Within 1, 2 and 3 standard deviations lie about 68%, 95% and 99.7% of the values.',
  ],
  variables: [
    MU(undefined, 500),
    SIGMA(undefined, 100),
    V('k', 'k', 'Standard deviations from the mean', { min: 0, max: 4, step: 0.5 }),
    V('lo', 'a', 'Lower end', { min: -1000, max: 1000, step: 0.5 }),
    V('hi', 'b', 'Upper end', { min: -1000, max: 1000, step: 0.5 }),
    prob('P', 'P', 'Share within k standard deviations'),
  ],
  ...rels(
    {
      relation: {
        id: 'a = μ − k × σ',
        display: '{lo} = {m} − {k} × {s}',
        vars: ['lo', 'm', 'k', 's'],
        residual: (v: Values) => v.lo! - (v.m! - v.k! * v.s!),
        solve: {
          lo: (v: Values) => v.m! - v.k! * v.s!,
          k: (v: Values) => div(v.m! - v.lo!, v.s!),
        },
      },
      steps: {
        lo: { expr: '{m} − {k} × {s}', how: 'Go down k standard deviations from the mean.' },
        k: { expr: '({m} − {lo}) ÷ {s}', how: 'How many standard deviations a is below the mean.' },
      },
    },
    {
      relation: {
        id: 'b = μ + k × σ',
        display: '{hi} = {m} + {k} × {s}',
        vars: ['hi', 'm', 'k', 's'],
        residual: (v: Values) => v.hi! - (v.m! + v.k! * v.s!),
        solve: { hi: (v: Values) => v.m! + v.k! * v.s! },
      },
      steps: { hi: { expr: '{m} + {k} × {s}', how: 'Go up k standard deviations from the mean.' } },
    },
    {
      relation: {
        id: 'P = 2 × Φ(k) − 1',
        display: '{P} = 2 × Φ({k}) − 1',
        vars: ['P', 'k'],
        residual: (v: Values) => v.P! - (2 * Phi(v.k!) - 1),
        solve: {
          P: (v: Values) => 2 * Phi(v.k!) - 1,
          k: (v: Values) => (inOpen(v.P!) === undefined ? undefined : invPhi((v.P! + 1) / 2)),
        },
      },
      steps: {
        P: {
          expr: '2 × Φ({k}) − 1',
          how: 'The area left of k, less the tail on the left side, twice over the middle.',
        },
        k: {
          expr: 'invNorm(({P} + 1) ÷ 2)',
          how: 'The middle P and the left tail together have area (P + 1) ÷ 2.',
        },
      },
    },
  ),
  example: { m: 100, s: 15, k: 2, lo: 70, hi: 130, P: 2 * Phi(2) - 1 },
  startWith: ['m', 's', 'k'],
  sliders: true,
  representation: {
    kind: 'normalCurve',
    mean: 'm',
    sd: 's',
    axis: 'IQ score',
    bands: true,
    shade: { from: 'lo', to: 'hi', area: 'P' },
    fixed: true,
  },
};

const normalTail: ModuleDef = {
  id: 'g.m11-normal-distribution-tail',
  title: 'Normal curve: a far right tail',
  use: 'Use this for the share above a value far from the mean.',
  assumptions: [
    'Package weights are close to normal, with mean μ and standard deviation σ.',
    'The area right of x is the share heavier than x; far from the mean it is tiny.',
  ],
  variables: [
    MU('g', 1000),
    SIGMA('g', 100),
    V('x', 'x', 'Weight', { unit: 'g', min: 0, max: 2000, step: 0.5 }),
    zVar(),
    prob('P', 'P', 'Share above x'),
  ],
  ...rels(zScore('z', 'x', 'm', 's'), rightArea('P', 'z')),
  example: { m: 50, s: 5, x: 66, z: 3.2, P: 1 - Phi(3.2) },
  startWith: ['m', 's', 'x'],
  unitSystems: ['metric'],
  representation: {
    kind: 'normalCurve',
    mean: 'm',
    sd: 's',
    axis: 'Weight (g)',
    shade: { from: 'x', area: 'P' },
    mark: { x: 'x', z: 'z' },
  },
};

const samplingMean: ModuleDef = {
  id: 'g.m12-sampling-distributions-mean',
  title: 'Sampling distribution of the mean',
  use: 'Use this for the chance a sample mean lands above a value, with σ ÷ √n.',
  assumptions: [
    'Wait times have mean μ and standard deviation σ; samples of n are taken at random.',
    'The sample means are close to normal, with mean μ and standard error σ ÷ √n.',
  ],
  variables: [
    MU('min', 200),
    SIGMA('min', 100),
    V('n', 'n', 'Sample size', { integer: true, min: 1, max: 400 }),
    V('SE', 'SE', 'Standard error', { unit: 'min', min: 0.001, max: 100, step: 0.01 }),
    V('xb', 'x̄', 'Sample mean', { unit: 'min', min: 0, max: 400, step: 0.5 }),
    zVar(),
    { ...prob('P', 'P', 'Chance the mean is x̄ or more'), derived: true },
  ],
  ...rels(standardError, zScore('z', 'xb', 'm', 'SE'), rightArea('P', 'z')),
  example: { m: 40, s: 12, n: 16, SE: 3, xb: 45, z: 5 / 3, P: 1 - Phi(5 / 3) },
  startWith: ['m', 's', 'n', 'xb'],
  unitSystems: ['metric'],
  representation: {
    kind: 'normalCurve',
    mean: 'm',
    sd: 's',
    axis: 'Mean wait (min)',
    sample: { n: 'n', se: 'SE' },
    shade: { from: 'xb', area: 'P' },
    mark: { x: 'xb', z: 'z' },
  },
};

const intervalMean: ModuleDef = {
  id: 'g.m12-confidence-intervals-mean',
  title: 'Confidence interval for a mean',
  use: 'Use this for x̄ ± z⋆ × σ ÷ √n at a confidence level.',
  assumptions: [
    'A random sample of n has mean x̄; the population’s σ is known.',
    'The middle C of the sampling curve lies within z⋆ standard errors of its center.',
  ],
  variables: [
    V('xb', 'x̄', 'Sample mean', { min: -1000, max: 1000, step: 0.1 }),
    SIGMA(),
    V('n', 'n', 'Sample size', { integer: true, min: 2, max: 1000000 }),
    V('SE', 'SE', 'Standard error', { min: 0.00001, max: 500, step: 0.01 }),
    V('C', 'C', 'Confidence level', { min: 0.01, max: 0.999, step: 0.01 }),
    V('zs', 'z⋆', 'Critical value', { min: 0.01, max: 3.3, step: 0.001 }),
    V('E', 'E', 'Margin of error', { min: 0, max: 100000, step: 0.01 }),
    V('lo', 'L', 'Lower end', { min: -3000, max: 3000, step: 0.01 }),
    V('hi', 'U', 'Upper end', { min: -3000, max: 3000, step: 0.01 }),
  ],
  ...rels(standardError, critical, margin, offset('lo', 'xb', 'E', -1), offset('hi', 'xb', 'E', 1)),
  example: {
    xb: 52.3,
    s: 6,
    n: 36,
    SE: 1,
    C: 0.95,
    zs: invPhi(0.975),
    E: invPhi(0.975),
    lo: 52.3 - invPhi(0.975),
    hi: 52.3 + invPhi(0.975),
  },
  startWith: ['xb', 's', 'n', 'C'],
  sliders: true,
  representation: {
    kind: 'normalCurve',
    mean: 'xb',
    sd: 'SE',
    axis: 'Sample mean',
    interval: { center: 'xb', margin: 'E', level: 'C' },
    fixed: true,
  },
};

/** 100 (or 20) simulated intervals around the true mean. */
function captureDemo(id: string, title: string, count: number, C: number): ModuleDef {
  const zs = invPhi(1 - (1 - C) / 2);
  return {
    id,
    title,
    use: 'Use this for what a confidence level means: the share of intervals that capture μ.',
    assumptions: [
      `${count} random samples of n are drawn from a population with mean μ and SD σ.`,
      'Each gives an interval x̄ ± z⋆ × σ ÷ √n; about C of them capture μ.',
    ],
    variables: [
      MU(undefined, 500),
      SIGMA(undefined, 100),
      V('n', 'n', 'Sample size', { integer: true, min: 2, max: 400 }),
      V('SE', 'SE', 'Standard error', { min: 0.001, max: 100, step: 0.01 }),
      V('C', 'C', 'Confidence level', { min: 0.5, max: 0.99, step: 0.01 }),
      V('zs', 'z⋆', 'Critical value', { min: 0.6, max: 3, step: 0.001 }),
      V('E', 'E', 'Margin of error', { min: 0, max: 400, step: 0.01 }),
    ],
    ...rels(standardError, critical, margin),
    standalone: {
      vars: ['m'],
      why: 'The true mean only places the curve; each interval’s width comes from σ, n and C.',
    },
    example: { m: 50, s: 10, n: 25, SE: 2, C, zs, E: zs * 2 },
    startWith: ['m', 's', 'n', 'C'],
    sliders: true,
    representation: {
      kind: 'normalCurve',
      mean: 'm',
      sd: 's',
      axis: 'Sample mean',
      intervals: { count, n: 'n', level: 'C' },
    },
  };
}

const testTwo: ModuleDef = {
  id: 'g.m12-hypothesis-testing-two',
  title: 'Two-sided z-test for a mean',
  use: 'Use this for a two-sided test of H₀: μ = μ₀ once the standard error is known.',
  assumptions: [
    'H₀: μ = μ₀ and Hₐ: μ ≠ μ₀; the sample is random.',
    'If H₀ is true, x̄ is close to normal with mean μ₀ and standard error SE = σ ÷ √n.',
  ],
  variables: [
    V('m', 'μ₀', 'Mean if H₀ is true', { min: -1e6, max: 1e6, step: 0.5 }),
    V('SE', 'SE', 'Standard error', { min: 1e-6, max: 1e6, step: 0.01 }),
    V('xb', 'x̄', 'Sample mean', { min: -1e6, max: 1e6, step: 0.05 }),
    { ...zVar('z', 'Test statistic'), min: -1e6, max: 1e6 },
    prob('p', 'p', 'p-value'),
    alphaVar,
  ],
  ...rels(zScore('z', 'xb', 'm', 'SE'), {
    relation: {
      id: 'p = 2 × (1 − Φ(|z|))',
      display: '{p} = 2 × (1 − Φ(|{z}|))',
      vars: ['p', 'z'],
      residual: (v: Values) => v.p! - 2 * (1 - Phi(Math.abs(v.z!))),
      solve: { p: (v: Values) => 2 * (1 - Phi(Math.abs(v.z!))) },
    },
    steps: {
      p: { expr: '2 × (1 − Φ(|{z}|))', how: 'Both tails past |z| count as at least as extreme.' },
    },
  }),
  standalone: { vars: ['a'], why: ALPHA_WHY },
  example: { m: 100, SE: 2.5, xb: 105.25, z: 2.1, p: 2 * (1 - Phi(2.1)), a: 0.05 },
  startWith: ['m', 'SE', 'xb', 'a'],
  representation: {
    kind: 'normalCurve',
    mean: 'm',
    sd: 'SE',
    axis: 'Sample mean if H₀ is true',
    test: { stat: 'z', alpha: 'a', tail: 'two', p: 'p' },
    keep: ['m', 'SE', 'a'],
  },
};

const testLeft: ModuleDef = {
  id: 'g.m12-hypothesis-testing-left',
  title: 'Left-tailed test on the z curve',
  use: 'Use this for a one-sided test where Hₐ says the value is less.',
  assumptions: [
    'The test statistic z is standard normal if H₀ is true.',
    'Hₐ points left, so the p-value is the area left of z.',
  ],
  variables: [zVar('z', 'Test statistic'), prob('p', 'p', 'p-value'), alphaVar],
  ...rels(leftArea('p', 'z')),
  standalone: { vars: ['a'], why: ALPHA_WHY },
  example: { z: -1.2, p: Phi(-1.2), a: 0.05 },
  startWith: ['z', 'a'],
  representation: { kind: 'normalCurve', test: { stat: 'z', alpha: 'a', tail: 'left', p: 'p' } },
};

/** p = χ²cdf(X², ∞, df), the right tail past the statistic. */
const chiTail: Rel = {
  relation: {
    id: 'p = χ²cdf(X², ∞, df)',
    display: '{p} = χ²cdf({X}, ∞, {df})',
    vars: ['p', 'X', 'df'],
    residual: (v: Values) => v.p! - (1 - chiCdf(v.X!, v.df!)),
    solve: {
      p: (v: Values) => 1 - chiCdf(v.X!, v.df!),
      X: (v: Values) => (inOpen(v.p!) === undefined ? undefined : chiCritical(v.p!, v.df!)),
    },
  },
  steps: {
    p: {
      expr: 'χ²cdf({X}, ∞, {df})',
      how: 'The area under the chi-square curve past the statistic.',
    },
    X: {
      expr: 'the χ² with right tail {p} at {df} df',
      how: 'The statistic whose right tail has area p.',
    },
  },
};

const chiGof: ModuleDef = {
  id: 'g.m12-chi-square-gof',
  title: 'Chi-square test: goodness of fit',
  use: 'Use this for the p-value of a chi-square statistic and its degrees of freedom.',
  assumptions: [
    'A die is rolled; the counts in k categories are compared with the expected counts.',
    'If H₀ fits, X² follows a chi-square curve with df = k − 1 (every expected count at least 5).',
  ],
  variables: [
    V('k', 'k', 'Categories', { integer: true, min: 2, max: 11 }),
    V('df', 'df', 'Degrees of freedom', { integer: true, min: 1, max: 10 }),
    V('X', 'X²', 'Chi-square statistic', { min: 0, max: 60, step: 0.1 }),
    prob('p', 'p', 'p-value'),
    alphaVar,
  ],
  ...rels(
    {
      relation: {
        id: 'df = k − 1',
        display: '{df} = {k} − 1',
        vars: ['df', 'k'],
        residual: (v: Values) => v.df! - (v.k! - 1),
        solve: { df: (v: Values) => v.k! - 1, k: (v: Values) => v.df! + 1 },
      },
      steps: {
        df: { expr: '{k} − 1', how: 'The last count is fixed by the total: one fewer is free.' },
        k: { expr: '{df} + 1', how: 'One more category than degrees of freedom.' },
      },
    },
    chiTail,
  ),
  standalone: { vars: ['a'], why: ALPHA_WHY },
  example: { k: 4, df: 3, X: 7.8, p: 1 - chiCdf(7.8, 3), a: 0.05 },
  startWith: ['k', 'X', 'a'],
  representation: {
    kind: 'normalCurve',
    chiSquare: { df: 'df', stat: 'X', alpha: 'a', p: 'p' },
    keep: ['k', 'a'],
  },
};

const chiIndependence: ModuleDef = {
  id: 'g.m12-chi-square-independence',
  title: 'Chi-square test: independence, df 10',
  use: 'Use this for a two-way table’s chi-square test, df = (r − 1) × (c − 1).',
  assumptions: [
    'A two-way table has r rows and c columns of counts.',
    'If the two variables are independent, X² follows a chi-square curve with df = (r − 1) × (c − 1).',
  ],
  variables: [
    V('r', 'r', 'Rows', { integer: true, min: 2, max: 6 }),
    V('c', 'c', 'Columns', { integer: true, min: 2, max: 6 }),
    V('df', 'df', 'Degrees of freedom', { integer: true, min: 1, max: 10 }),
    V('X', 'X²', 'Chi-square statistic', { min: 0, max: 60, step: 0.1 }),
    prob('p', 'p', 'p-value'),
    alphaVar,
  ],
  ...rels(
    {
      relation: {
        id: 'df = (r − 1) × (c − 1)',
        display: '{df} = ({r} − 1) × ({c} − 1)',
        vars: ['df', 'r', 'c'],
        residual: (v: Values) => v.df! - (v.r! - 1) * (v.c! - 1),
        solve: {
          df: (v: Values) => (v.r! - 1) * (v.c! - 1),
          r: (v: Values) => {
            const q = div(v.df!, v.c! - 1);
            return q === undefined ? undefined : q + 1;
          },
          c: (v: Values) => {
            const q = div(v.df!, v.r! - 1);
            return q === undefined ? undefined : q + 1;
          },
        },
      },
      steps: {
        df: {
          expr: '({r} − 1) × ({c} − 1)',
          how: 'One fewer free count in each row and each column.',
        },
        r: { expr: '{df} ÷ ({c} − 1) + 1', how: 'Undo the product, then add the fixed row back.' },
        c: {
          expr: '{df} ÷ ({r} − 1) + 1',
          how: 'Undo the product, then add the fixed column back.',
        },
      },
    },
    chiTail,
  ),
  standalone: { vars: ['a'], why: ALPHA_WHY },
  example: { r: 3, c: 6, df: 10, X: 21, p: 1 - chiCdf(21, 10), a: 0.01 },
  startWith: ['r', 'c', 'X', 'a'],
  representation: {
    kind: 'normalCurve',
    chiSquare: { df: 'df', stat: 'X', alpha: 'a', p: 'p' },
    keep: ['r', 'c', 'a'],
  },
};

// ── H03 histogram ──

/** n = f₁ + f₂ + …, the counts adding to the total. */
function totalOf(n: string, parts: string[], symbols: string[]): Rel {
  return {
    relation: {
      id: `n = ${symbols.join(' + ')}`,
      display: `{${n}} = ${parts.map((f) => `{${f}}`).join(' + ')}`,
      vars: [n, ...parts],
      residual: (v: Values) => v[n]! - parts.reduce((t, f) => t + v[f]!, 0),
      solve: {
        [n]: (v: Values) => parts.reduce((t, f) => t + v[f]!, 0),
        ...Object.fromEntries(
          parts.map((f) => [
            f,
            (v: Values) => v[n]! - parts.filter((g) => g !== f).reduce((t, g) => t + v[g]!, 0),
          ]),
        ),
      },
    },
    steps: {
      [n]: {
        expr: parts.map((f) => `{${f}}`).join(' + '),
        how: 'Every value is in one bin: add the counts.',
      },
      ...Object.fromEntries(
        parts.map((f) => [
          f,
          {
            expr: `{${n}} − (${parts
              .filter((g) => g !== f)
              .map((g) => `{${g}}`)
              .join(' + ')})`,
            how: 'The total less the other bins’ counts.',
          },
        ]),
      ),
    },
  };
}

const countVar = (id: string, symbol: string, name: string) =>
  V(id, symbol, name, { integer: true, min: 0, max: 60 });

/** Quiz scores of 24 students (made up for the demo; roughly symmetric). */
const SCORES = [
  52, 58, 61, 63, 65, 66, 68, 69, 70, 71, 72, 72, 73, 74, 75, 76, 78, 79, 81, 83, 85, 88, 91, 95,
];

const histData: ModuleDef = {
  id: 'g.m9-data-displays-histogram',
  title: 'Histogram: choosing the bins',
  use: 'Use this for drawing a histogram from data: the start, the bin width and the number of bins.',
  assumptions: [
    'The 24 quiz scores are 52, 58, 61, 63, 65, 66, 68, 69, 70, 71, 72, 72, 73, 74, 75, 76, 78, 79, 81, 83, 85, 88, 91 and 95.',
    'Each bin holds the scores from its left end up to, not including, its right end.',
  ],
  variables: [
    V('a', 'a', 'First bin starts at', { min: 0, max: 50, step: 5 }),
    V('w', 'w', 'Bin width', { min: 5, max: 25, step: 1 }),
    V('e', 'e', 'Last bin ends at', { min: 60, max: 150, step: 5 }),
    V('k', 'k', 'Number of bins', { integer: true, min: 1, max: 30 }),
  ],
  ...rels({
    relation: {
      id: 'k = (e − a) ÷ w',
      display: '{k} = ({e} − {a}) ÷ {w}',
      vars: ['k', 'e', 'a', 'w'],
      residual: (v: Values) => v.k! * v.w! - (v.e! - v.a!),
      solve: {
        k: (v: Values) => div(v.e! - v.a!, v.w!),
        e: (v: Values) => v.a! + v.k! * v.w!,
        a: (v: Values) => v.e! - v.k! * v.w!,
        w: (v: Values) => div(v.e! - v.a!, v.k!),
      },
    },
    steps: {
      k: { expr: '({e} − {a}) ÷ {w}', how: 'How many widths fit from the start to the end.' },
      e: { expr: '{a} + {k} × {w}', how: 'Start at a and add k widths.' },
      a: { expr: '{e} − {k} × {w}', how: 'Go back k widths from the end.' },
      w: { expr: '({e} − {a}) ÷ {k}', how: 'Share the span equally among the bins.' },
    },
  }),
  example: { a: 40, w: 10, e: 100, k: 6 },
  startWith: ['a', 'w', 'e'],
  sliders: true,
  representation: {
    kind: 'histogram',
    data: SCORES,
    start: 'a',
    width: 'w',
    end: 'e',
    mean: true,
    median: true,
    shape: true,
    axis: 'Quiz score',
  },
};

const WAITS = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'];
const SUBS = '₁₂₃₄₅₆₇';
const histCounts: ModuleDef = {
  id: 'g.m9-data-displays-frequency',
  title: 'Histogram from a frequency table',
  use: 'Use this for a histogram from counts in bins, and one bin’s relative frequency.',
  assumptions: [
    'Wait times at a clinic are counted in bins of 5 minutes, from 0 to 30.',
    'The relative frequency of a bin is its count divided by the total.',
  ],
  variables: [
    ...WAITS.map((id, i) => countVar(id, `f${SUBS[i]}`, `${5 * i} to ${5 * i + 5} minutes`)),
    V('n', 'n', 'Total', { integer: true, min: 1, max: 360 }),
    V('r', 'r', 'Relative frequency, 10 to 15 minutes', { min: 0, max: 1, step: 0.0001 }),
  ],
  ...rels(
    totalOf(
      'n',
      WAITS,
      WAITS.map((_, i) => `f${SUBS[i]}`),
    ),
    {
      relation: {
        id: 'r = f₃ ÷ n',
        display: '{r} = {f3} ÷ {n}',
        vars: ['r', 'f3', 'n'],
        residual: (v: Values) => v.r! * v.n! - v.f3!,
        solve: {
          r: (v: Values) => div(v.f3!, v.n!),
          f3: (v: Values) => v.r! * v.n!,
          n: (v: Values) => div(v.f3!, v.r!),
        },
      },
      steps: {
        r: { expr: '{f3} ÷ {n}', how: 'The bin’s share of all the values.' },
        f3: { expr: '{r} × {n}', how: 'That share of the total.' },
        n: { expr: '{f3} ÷ {r}', how: 'The count is r of the total.' },
      },
    },
  ),
  example: { f1: 4, f2: 9, f3: 7, f4: 4, f5: 2, f6: 1, n: 27, r: 7 / 27 },
  startWith: WAITS,
  representation: {
    kind: 'histogram',
    counts: WAITS,
    start: 0,
    width: 5,
    lit: 3,
    mean: true,
    shape: true,
    axis: 'Wait (min)',
  },
};

const HEIGHTS = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'];
const histBimodal: ModuleDef = {
  id: 'g.m9-data-displays-bimodal',
  title: 'Histogram: two peaks, relative frequencies',
  use: 'Use this for a relative frequency histogram, and a shape with two peaks.',
  assumptions: [
    'Heights of the players on a children’s team and an adults’ team, in bins of 10 cm from 120 cm.',
    'A relative frequency histogram has the same shape; its heights add to 1.',
  ],
  variables: [
    ...HEIGHTS.map((id, i) => countVar(id, `f${SUBS[i]}`, `${120 + 10 * i} to ${130 + 10 * i} cm`)),
    V('n', 'n', 'Total', { integer: true, min: 1, max: 420 }),
  ],
  ...rels(
    totalOf(
      'n',
      HEIGHTS,
      HEIGHTS.map((_, i) => `f${SUBS[i]}`),
    ),
  ),
  example: { g1: 3, g2: 8, g3: 4, g4: 2, g5: 5, g6: 9, g7: 3, n: 34 },
  startWith: HEIGHTS,
  representation: {
    kind: 'histogram',
    counts: HEIGHTS,
    start: 120,
    width: 10,
    relative: true,
    shape: true,
    axis: 'Height (cm)',
  },
};

const PROBS = ['p0', 'p1', 'p2', 'p3', 'p4'];
const probTyped: ModuleDef = {
  id: 'g.m11-probability-distributions-expected',
  title: 'Probability distribution and expected value',
  use: 'Use this for the expected value of a probability distribution.',
  assumptions: [
    'X is the number of goals a team scores in a game: 0, 1, 2, 3 or 4.',
    'The probabilities add to 1; E(X) is the sum of each value times its probability.',
  ],
  variables: [
    ...PROBS.map((id, k) => ({
      ...prob(id, `p${'₀₁₂₃₄'[k]}`, `P(X = ${k})`),
      ...(k === 4 ? { derived: true } : {}),
    })),
    V('E', 'E', 'Expected value E(X)', { min: 0, max: 4, step: 0.01 }),
  ],
  ...rels(
    {
      relation: {
        id: 'p₄ = 1 − (p₀ + p₁ + p₂ + p₃)',
        display: '{p4} = 1 − ({p0} + {p1} + {p2} + {p3})',
        vars: PROBS,
        residual: (v: Values) => v.p4! - (1 - v.p0! - v.p1! - v.p2! - v.p3!),
        solve: { p4: (v: Values) => 1 - v.p0! - v.p1! - v.p2! - v.p3! },
      },
      steps: {
        p4: { expr: '1 − ({p0} + {p1} + {p2} + {p3})', how: 'All the probabilities add to 1.' },
      },
    },
    {
      relation: {
        id: 'E = 0 × p₀ + 1 × p₁ + 2 × p₂ + 3 × p₃ + 4 × p₄',
        display: '{E} = 0 × {p0} + 1 × {p1} + 2 × {p2} + 3 × {p3} + 4 × {p4}',
        vars: ['E', ...PROBS],
        residual: (v: Values) => v.E! - (v.p1! + 2 * v.p2! + 3 * v.p3! + 4 * v.p4!),
        solve: { E: (v: Values) => v.p1! + 2 * v.p2! + 3 * v.p3! + 4 * v.p4! },
      },
      steps: {
        E: {
          expr: '0 × {p0} + 1 × {p1} + 2 × {p2} + 3 × {p3} + 4 × {p4}',
          how: 'Weight each value by its probability and add.',
        },
      },
    },
  ),
  example: { p0: 0.1, p1: 0.2, p2: 0.3, p3: 0.25, p4: 0.15, E: 2.15 },
  startWith: ['p0', 'p1', 'p2', 'p3'],
  representation: {
    kind: 'histogram',
    probability: { values: [0, 1, 2, 3, 4], probs: PROBS, mean: 'E' },
    axis: 'Goals in a game (k)',
    keep: ['p0', 'p1', 'p2', 'p3'],
  },
};

/** Binomial bars from n and p, with P(X = k), E(X) and the SD. */
function binomialDemo(
  id: string,
  title: string,
  ex: { n: number; p: number; k: number },
): ModuleDef {
  const { n, p, k } = ex;
  return {
    id,
    title,
    use: 'Use this for P(X = k) in n independent trials, each a success with chance p.',
    assumptions: [
      'n independent trials, each a success with the same chance p.',
      'X counts the successes: P(X = k) = C(n, k) × p^k × (1 − p)^(n − k).',
    ],
    variables: [
      V('n', 'n', 'Trials', { integer: true, min: 1, max: 40 }),
      V('p', 'p', 'Chance of success', { min: 0, max: 1, step: 0.01 }),
      V('k', 'k', 'Successes', { integer: true, min: 0, max: 40 }),
      prob('P', 'P', 'P(X = k)'),
      V('E', 'E', 'Expected value E(X)', { min: 0, max: 40, step: 0.01 }),
      V('S', 'σ', 'Standard deviation', { min: 0, max: 10, step: 0.0001, derived: true }),
    ],
    ...rels(
      { relation: atLeast('n', 'k') as Relation, steps: {} },
      {
        relation: {
          id: 'P = C(n, k) × p^k × (1 − p)^(n − k)',
          display: '{P} = C({n}, {k}) × {p}^{k} × (1 − {p})^({n} − {k})',
          vars: ['P', 'n', 'k', 'p'],
          residual: (v: Values) => v.P! - binomialPmf(v.n!, v.p!, v.k!),
          solve: {
            P: (v: Values) => choose(v.n!, v.k!) * v.p! ** v.k! * (1 - v.p!) ** (v.n! - v.k!),
          },
        },
        steps: {
          P: {
            expr: 'C({n}, {k}) × {p}^{k} × (1 − {p})^({n} − {k})',
            how: 'C(n, k) orders of k successes, each with chance p^k × (1 − p)^(n − k).',
          },
        },
      },
      {
        relation: {
          id: 'E = n × p',
          display: '{E} = {n} × {p}',
          vars: ['E', 'n', 'p'],
          residual: (v: Values) => v.E! - v.n! * v.p!,
          solve: {
            E: (v: Values) => v.n! * v.p!,
            p: (v: Values) => div(v.E!, v.n!),
            n: (v: Values) => div(v.E!, v.p!),
          },
        },
        steps: {
          E: { expr: '{n} × {p}', how: 'On average, p of the n trials succeed.' },
          p: { expr: '{E} ÷ {n}', how: 'The expected successes per trial.' },
          n: { expr: '{E} ÷ {p}', how: 'How many trials give E successes on average.' },
        },
      },
      {
        relation: {
          id: 'σ = √(n × p × (1 − p))',
          display: '{S} = √({n} × {p} × (1 − {p}))',
          vars: ['S', 'n', 'p'],
          residual: (v: Values) => v.S! - Math.sqrt(v.n! * v.p! * (1 - v.p!)),
          solve: { S: (v: Values) => Math.sqrt(v.n! * v.p! * (1 - v.p!)) },
        },
        steps: {
          S: { expr: '√({n} × {p} × (1 − {p}))', how: 'The spread of a binomial count.' },
        },
      },
    ),
    example: { n, p, k, P: binomialPmf(n, p, k), E: n * p, S: Math.sqrt(n * p * (1 - p)) },
    startWith: ['n', 'p', 'k'],
    sliders: true,
    representation: {
      kind: 'histogram',
      binomial: { n: 'n', p: 'p', mean: 'E', sd: 'S' },
      lit: 'k',
      axis: 'Successes (k)',
    },
  };
}

export const HSB_GALLERY_MODULES: ModuleDef[] = [
  normalLeft,
  normalBetween,
  normalBands,
  normalTail,
  samplingMean,
  intervalMean,
  captureDemo('g.m12-confidence-intervals-capture', '100 intervals at 95% confidence', 100, 0.95),
  captureDemo('g.m12-confidence-intervals-capture-20', '20 intervals at 80% confidence', 20, 0.8),
  testTwo,
  testLeft,
  chiGof,
  chiIndependence,
  histData,
  histCounts,
  histBimodal,
  probTyped,
  binomialDemo('g.m11-probability-distributions-binomial', 'Binomial distribution: 10 trials', {
    n: 10,
    p: 0.3,
    k: 3,
  }),
  binomialDemo('g.m12-sampling-distributions-binomial-40', 'Binomial distribution: 40 trials', {
    n: 40,
    p: 0.5,
    k: 20,
  }),
];
export const HSB_GALLERY_LAYOUTS: LayoutDef[] = [];
