/**
 * Grade 12 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md; the
 * direction plan and build notes: docs/BUILD_HS.md.
 * The layout pages (explore, sort, sequence, observe) are in `../layouts/math12.ts`.
 */
import { chiCdf, invPhi, Phi, tCdf, tStar } from '@/components/module/reps/statMath';
import { formatNumber, superscript } from '@/engine/format';
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
  // A figure-only relation places the drawing: it has no steps.
  steps: Object.fromEntries(
    rs.filter((r) => !r.relation.hidden).map((r) => [r.relation.id, r.steps]),
  ),
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

/** A relation that only places the picture (its value is `hidden`): no row, step or check. */
const hide = (r: Rel): Rel => ({ ...r, relation: { ...r.relation, hidden: true } });

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

/** A p-value under 0.0001 reads "< 0.0001" in its box. */
const prob = (id: string, symbol: string, name: string, extra: Partial<VariableDef> = {}) =>
  V(id, symbol, name, {
    min: 0,
    max: 1,
    step: 0.0001,
    ...(name === 'p-value' ? { belowStep: true } : {}),
    ...extra,
  });
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
      : v[P]! < v[a]!
        ? `→ ${v[P]! < 0.0001 ? 'below' : `${shown(v[P]!)} <`} α = ${fmt(v[a]!)}: reject H₀`
        : `→ ${shown(v[P]!)} ≥ α = ${fmt(v[a]!)}: fail to reject H₀`;
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

/** Hₐ's side as the sign box codes it: 1 for <, 3 for >, 6 for ≠ (the picture's tail). */
const tailVar = (what: string, of: string) =>
  V('h', 'Hₐ', `Hₐ: ${what} < ${of} (1), > ${of} (3) or ≠ ${of} (6)`, {
    integer: true,
    min: 1,
    max: 6,
    allowed: [1, 3, 6],
  });
/** The z tail on Hₐ's side: left of z (1), right of z (3), or both past |z| (6). */
const zTail = (v: Values, z: string, h: string) =>
  v[h] === 1 ? Phi(v[z]!) : v[h] === 3 ? 1 - Phi(v[z]!) : 2 * (1 - Phi(Math.abs(v[z]!)));
/** P from z on Hₐ's side, with the decision after it. */
const zSided = (P: string, z: string, h: string) =>
  decided(
    withCheck(
      derive(
        `${P} = the z tail on the side of Hₐ`,
        `{${P}} = the tail past {${z}} on {${h}}’s side`,
        P,
        [z, h],
        (v) => ([1, 3, 6].includes(v[h]!) ? zTail(v, z, h) : undefined),
        (v: Values) =>
          v[h] === 1 ? `Φ({${z}})` : v[h] === 3 ? `1 − Φ({${z}})` : `2 × (1 − Φ(|{${z}}|))`,
        'Hₐ < takes the area left of z; Hₐ > the area right of z; Hₐ ≠ both tails past |z|.',
      ),
      (v) => {
        const [P0, z0] = [shown(v[P]!), shown(v[z]!)];
        return v[h] === 1
          ? `${P0} = Φ(${z0})`
          : v[h] === 3
            ? `${P0} = 1 − Φ(${z0})`
            : `${P0} = 2 × (1 − Φ(|${z0}|))`;
      },
    ),
  );

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
/** x − h with the sign folded in: x − 2, x + 3. */
const minus = (x: string, h: number) => (h < 0 ? `${x} + ${fmt(-h)}` : `${x} − ${fmt(h)}`);
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

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
      'H₀: p = p₀; Hₐ says p < p₀, p > p₀ or p ≠ p₀ (typed as 1, 3 or 6).',
      'The sample is random, with np₀ ≥ 10 and n(1 − p₀) ≥ 10, so p̂ is close to normal.',
      'Reject H₀ when the p-value is below α; “fail to reject” never proves H₀ true.',
    ],
    variables: [
      V('p0', 'p₀', 'Proportion if H₀ is true', { min: 0.01, max: 0.99, step: 0.01 }),
      tailVar('p', 'p₀'),
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
      prob('P', 'P', 'p-value', { derived: true }),
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
      zSided('P', 'z', 'h'),
    ),
    standalone: { vars: ['a'], why: ALPHA_WHY },
    example: {
      p0: 0.5,
      h: 6,
      n: 100,
      k: 60,
      p: 0.6,
      E: 0.05,
      z: 2,
      P: 2 * (1 - Phi(2)),
      a: 0.05,
    },
    startWith: ['p0', 'h', 'n', 'k', 'a'],
    representation: {
      kind: 'normalCurve',
      mean: 'p0',
      sd: 'E',
      axis: 'Sample proportion p̂ if H₀ is true',
      test: { stat: 'z', alpha: 'a', tail: { sign: 'h' }, p: 'P' },
      fixed: true,
    },
  },
  {
    id: 'm.12.hypothesis-testing~mean',
    title: 'One-mean z-test',
    use: 'Use this for “Is the mean less than μ₀?” (or more than, or different from) with σ known.',
    assumptions: [
      'H₀: μ = μ₀; Hₐ says μ < μ₀, μ > μ₀ or μ ≠ μ₀ (typed as 1, 3 or 6).',
      'The sample is random, σ is known, and x̄ is close to normal (a normal population or n ≥ 30).',
      'Reject H₀ when the p-value is below α.',
    ],
    variables: [
      V('m', 'μ₀', 'Mean if H₀ is true', { unit: 'g', min: 0.1, max: 100000, step: 0.5 }),
      tailVar('μ', 'μ₀'),
      V('s', 'σ', 'Standard deviation', { unit: 'g', min: 0.01, max: 10000, step: 0.1 }),
      V('n', 'n', 'Sample size', { integer: true, min: 2, max: 100000 }),
      V('x', 'x̄', 'Sample mean', { unit: 'g', min: 0.1, max: 100000, step: 0.1 }),
      V('E', 'SE', 'Standard error', { unit: 'g', min: 0.0001, max: 10000, step: 0.01 }),
      zVar(),
      prob('P', 'P', 'p-value', { derived: true }),
      alphaVar,
    ],
    ...rels(seMean('E', 's', 'n'), zScore('z', 'x', 'm', 'E'), zSided('P', 'z', 'h')),
    standalone: { vars: ['a'], why: ALPHA_WHY },
    example: { m: 500, h: 1, s: 12, n: 36, x: 496, E: 2, z: -2, P: Phi(-2), a: 0.05 },
    startWith: ['m', 'h', 's', 'n', 'x', 'a'],
    unitSystems: ['metric'],
    representation: {
      kind: 'normalCurve',
      mean: 'm',
      sd: 'E',
      axis: 'Sample mean x̄ (g) if H₀ is true',
      test: { stat: 'z', alpha: 'a', tail: { sign: 'h' }, p: 'P' },
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
      t: { df: 'df' },
      test: { stat: 't', alpha: 'a', tail: 'two', p: 'P' },
      fixed: true,
    },
  },
  {
    id: 'm.12.hypothesis-testing~paired',
    title: 'Matched pairs t-test',
    use: 'Use this for “Twelve students gained 2.5 points on average after a review, s = 3.2. Did the review change scores?”',
    assumptions: [
      'Each subject is measured twice (before and after): work with the differences d, one per pair.',
      'H₀: μ_d = 0 and Hₐ: μ_d ≠ 0; the differences are a one-mean t-test with df = n − 1.',
      'The pairs are random and the differences close to normal (or n ≥ 30).',
    ],
    variables: [
      V('x', 'd̄', 'Mean of the differences', { min: -10000, max: 10000, step: 0.1 }),
      V('s', 's', 'Standard deviation of the differences', { min: 0.01, max: 10000, step: 0.1 }),
      V('n', 'n', 'Number of pairs', { integer: true, min: 2, max: 1000 }),
      V('df', 'df', 'Degrees of freedom', { integer: true, min: 1, max: 999, derived: true }),
      V('E', 'SE', 'Standard error', { min: 0.0001, max: 10000, step: 0.01, derived: true }),
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
        'The differences’ s over the root of the number of pairs.',
      ),
      rel('t = d̄ ÷ SE', '{t} = {x} ÷ {E}', ['t', 'x', 'E'], (v) => v.t! * v.E! - v.x!, {
        t: [
          (v) => div(v.x!, v.E!),
          '{x} ÷ {E}',
          'H₀ says the mean difference is 0: count how many standard errors d̄ is from 0.',
        ],
        x: [(v) => v.t! * v.E!, '{t} × {E}', 'Go t standard errors from 0.'],
      }),
      decided(tTwoTail('P', 't', 'df')),
    ),
    standalone: { vars: ['a'], why: ALPHA_WHY },
    example: {
      x: 2.5,
      s: 3.2,
      n: 12,
      df: 11,
      E: 3.2 / Math.sqrt(12),
      t: 2.5 / (3.2 / Math.sqrt(12)),
      P: 2 * (1 - tCdf(2.5 / (3.2 / Math.sqrt(12)), 11)),
      a: 0.05,
    },
    startWith: ['x', 's', 'n', 'a'],
    representation: {
      kind: 'normalCurve',
      mean: 0,
      sd: 'E',
      axis: 'Mean difference d̄ if H₀ is true',
      t: { df: 'df' },
      test: { stat: 't', alpha: 'a', tail: 'two', p: 'P' },
      fixed: true,
    },
  },
  {
    id: 'm.12.hypothesis-testing~two-proportion',
    title: 'Two-proportion z-test',
    use: 'Use this for “84 of 150 people sent a reminder voted, against 66 of 150 who were not. Is there a difference?”',
    assumptions: [
      'Two independent random samples, or two groups assigned at random; H₀: p₁ = p₂, Hₐ: p₁ ≠ p₂.',
      'If H₀ is true both samples share one proportion: pool them, p̂ = (k₁ + k₂) ÷ (n₁ + n₂).',
      'Each sample has at least 10 successes and 10 failures, so the difference is close to normal.',
    ],
    variables: [
      V('k1', 'k₁', 'Successes in sample 1', { integer: true, min: 0, max: 100000 }),
      V('n1', 'n₁', 'Size of sample 1', { integer: true, min: 1, max: 100000 }),
      V('k2', 'k₂', 'Successes in sample 2', { integer: true, min: 0, max: 100000 }),
      V('n2', 'n₂', 'Size of sample 2', { integer: true, min: 1, max: 100000 }),
      V('d', 'd', 'Difference of the proportions, p̂₁ − p̂₂', {
        min: -1,
        max: 1,
        step: 0.0001,
        derived: true,
      }),
      prob('p', 'p̂', 'Pooled proportion', { derived: true }),
      V('E', 'SE', 'Standard error if H₀ is true', {
        min: 0.00001,
        max: 1,
        step: 0.0001,
        derived: true,
      }),
      { ...zVar(), derived: true },
      prob('P', 'P', 'p-value', { derived: true }),
      alphaVar,
    ],
    ...rels(
      limit(
        'k₁ ≥ 10, n₁ − k₁ ≥ 10',
        'Sample 1 has at least 10 successes and 10 failures: {k1} of {n1}',
        ['k1', 'n1'],
        (v) => v.k1! >= 10 && v.n1! - v.k1! >= 10,
        'Each sample needs at least 10 successes and 10 failures for the normal curve.',
      ),
      limit(
        'k₂ ≥ 10, n₂ − k₂ ≥ 10',
        'Sample 2 has at least 10 successes and 10 failures: {k2} of {n2}',
        ['k2', 'n2'],
        (v) => v.k2! >= 10 && v.n2! - v.k2! >= 10,
        'Each sample needs at least 10 successes and 10 failures for the normal curve.',
      ),
      withStep(
        derive(
          'd = k₁ ÷ n₁ − k₂ ÷ n₂',
          '{d} = {k1} ÷ {n1} − {k2} ÷ {n2}',
          'd',
          ['k1', 'n1', 'k2', 'n2'],
          (v) => v.k1! / v.n1! - v.k2! / v.n2!,
          '{k1} ÷ {n1} − {k2} ÷ {n2}',
          'Each sample’s proportion of successes, p̂₁ − p̂₂.',
        ),
        'd',
        {
          work: (v) => [
            `${fmt(v.k1! / v.n1!)} − ${fmt(v.k2! / v.n2!)} = ${fmt(v.k1! / v.n1! - v.k2! / v.n2!)}`,
          ],
        },
      ),
      derive(
        'p̂ = (k₁ + k₂) ÷ (n₁ + n₂)',
        '{p} = ({k1} + {k2}) ÷ ({n1} + {n2})',
        'p',
        ['k1', 'k2', 'n1', 'n2'],
        (v) => (v.k1! + v.k2!) / (v.n1! + v.n2!),
        '({k1} + {k2}) ÷ ({n1} + {n2})',
        'If H₀ is true the two samples share one proportion: all the successes over everyone.',
      ),
      derive(
        'SE = √(p̂(1 − p̂)(1 ÷ n₁ + 1 ÷ n₂))',
        '{E} = √({p} × (1 − {p}) × (1 ÷ {n1} + 1 ÷ {n2}))',
        'E',
        ['p', 'n1', 'n2'],
        (v) => Math.sqrt(v.p! * (1 - v.p!) * (1 / v.n1! + 1 / v.n2!)),
        '√({p} × (1 − {p}) × (1 ÷ {n1} + 1 ÷ {n2}))',
        'The spread of p̂₁ − p̂₂ if H₀ is true, from the pooled proportion.',
      ),
      derive(
        'z = d ÷ SE',
        '{z} = {d} ÷ {E}',
        'z',
        ['d', 'E'],
        (v) => div(v.d!, v.E!),
        '{d} ÷ {E}',
        'H₀ says the difference is 0: count how many standard errors it is from 0.',
      ),
      decided(twoTail('P', 'z')),
    ),
    standalone: { vars: ['a'], why: ALPHA_WHY },
    example: {
      k1: 84,
      n1: 150,
      k2: 66,
      n2: 150,
      d: 0.12,
      p: 0.5,
      E: Math.sqrt(0.25 * (2 / 150)),
      z: 0.12 / Math.sqrt(0.25 * (2 / 150)),
      P: 2 * (1 - Phi(0.12 / Math.sqrt(0.25 * (2 / 150)))),
      a: 0.05,
    },
    startWith: ['k1', 'n1', 'k2', 'n2', 'a'],
    representation: {
      kind: 'normalCurve',
      mean: 0,
      sd: 'E',
      axis: 'Difference p̂₁ − p̂₂ if H₀ is true',
      mark: { x: 'd' },
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
      t: { df: 'df' },
      test: { stat: 't', alpha: 'a', tail: 'two', p: 'P' },
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
      V('x', 'x̄', 'Sample mean', { min: -10000000, max: 10000000, step: 0.1 }),
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
      V('x', 'x̄', 'Sample mean', { min: -10000000, max: 10000000, step: 0.1 }),
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
      t: { df: 'df' },
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
    use: 'Use this for “Draw 50 samples: how many of the 95% intervals should capture μ?”',
    assumptions: [
      'The level is how often the method captures μ over many samples.',
      'Any one interval either captures μ or doesn’t; 95% is not the chance for that one.',
      'The picture draws N random samples of n and the interval from each: 20, 50 or 100.',
    ],
    variables: [
      V('C', 'C', 'Confidence level', {
        allowed: [0.9, 0.95, 0.99],
        min: 0.9,
        max: 0.99,
        multipleOf: 0.01,
      }),
      V('n', 'n', 'Sample size', { integer: true, min: 2, max: 400 }),
      V('N', 'N', 'Samples drawn', { integer: true, allowed: [20, 50, 100], min: 20, max: 100 }),
      V('K', 'K', 'Intervals expected to capture μ, of N', {
        min: 0,
        max: 100,
        step: 0.1,
        derived: true,
      }),
    ],
    ...rels(
      derive(
        'K = N × C',
        '{K} = {N} × {C}',
        'K',
        ['N', 'C'],
        (v) => v.N! * v.C!,
        '{N} × {C}',
        'Over many samples the share C of intervals capture μ, so expect C of the N.',
      ),
    ),
    standalone: {
      vars: ['n'],
      why: 'The sample size sets how wide each interval is, not how many of them capture μ.',
    },
    example: { C: 0.95, n: 25, N: 100, K: 95 },
    startWith: ['C', 'n', 'N'],
    representation: {
      kind: 'normalCurve',
      mean: 50,
      sd: 10,
      axis: 'Sample mean x̄',
      intervals: { count: 'N', n: 'n', level: 'C' },
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
      limit(
        'expected counts ≥ 5',
        'Every expected count from {a}, {b}, {c}, {d}, {e}, {f} is at least 5',
        ALL_CELLS,
        (v) => expectedCounts(v).every((c) => c.E >= 5),
        'Every expected count must be at least 5 for the chi-square curve to fit: add more to the small rows or columns.',
      ),
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

/** b/a as a slope: a whole number, a fraction (4/3) or a decimal. */
const slopeText = (b: number, a: number) => {
  const s = b / a;
  if (Number.isInteger(s)) return s === 1 ? '' : `${s}`;
  if (Number.isInteger(b) && Number.isInteger(a)) {
    const g = gcd(b, a);
    return `(${b / g}/${a / g})`;
  }
  return fmt(s);
};
/** (x, y) as the steps write a point. */
const pt = (x: number, y: number) => `(${fmt(x)}, ${fmt(y)})`;
/** The ellipse's foci and vertices, on its long axis. */
const ellipsePoints = (v: Values) => {
  if ([v.h, v.k, v.a, v.b, v.c].some((x) => x === undefined)) return '';
  const { h, k, a, b, c } = v as Required<Values>;
  const wide = a! >= b!;
  const ends = (d: number) =>
    wide ? `${pt(h! - d, k!)} and ${pt(h! + d, k!)}` : `${pt(h!, k! - d)} and ${pt(h!, k! + d)}`;
  return `→ foci ${ends(c!)}; vertices ${ends(Math.max(a!, b!))}`;
};

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
      withStep(
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
        'c',
        { note: ellipsePoints },
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
      V('q', 'q', 'Number before (y − k), which is 4p', { min: -100, max: 100, step: 0.01 }),
      V('p', 'p', 'Vertex to focus', { min: -25, max: 25, step: 0.01, derived: true }),
      real('F', 'F', 'Focus, y', -200, 200),
      real('L', 'L', 'Directrix y =', -200, 200),
      real('x', 'x', 'Point, x', -1000, 1000),
      real('y', 'y', 'Point, y', -100000, 100000),
    ],
    ...rels(
      limit(
        '4p ≠ 0',
        'The number before (y − k), {q}, is not 0',
        ['q'],
        (v) => v.q !== 0,
        'The number before (y − k) is not 0: with 4p = 0 there is no parabola.',
      ),
      rel('p = (number before (y − k)) ÷ 4', '{p} = {q} ÷ 4', ['p', 'q'], (v) => 4 * v.p! - v.q!, {
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
      V('s', 's', 'Asymptote slope (±)', {
        min: 0,
        max: 40,
        step: 0.0001,
        derived: true,
        fraction: 100,
      }),
    ],
    ...rels(
      withStep(
        derive(
          'c = √(a² + b²)',
          '{c} = √({a}² + {b}²)',
          'c',
          ['a', 'b'],
          (v) => Math.hypot(v.a!, v.b!),
          '√({a}² + {b}²)',
          'For a hyperbola, c² is the sum of the squares.',
        ),
        'c',
        {
          note: (v) =>
            [v.h, v.k, v.c].some((x) => x === undefined)
              ? ''
              : `→ foci ${pt(v.h! - v.c!, v.k!)} and ${pt(v.h! + v.c!, v.k!)}`,
        },
      ),
      withStep(
        derive(
          's = b ÷ a',
          '{s} = {b} ÷ {a}',
          's',
          ['b', 'a'],
          (v) => div(v.b!, v.a!),
          '{b} ÷ {a}',
          'The asymptotes are the diagonals of the a-by-b box: rise b over run a.',
        ),
        's',
        {
          note: (v) =>
            [v.h, v.k, v.b, v.a].some((x) => x === undefined)
              ? ''
              : `→ asymptotes ${v.k === 0 ? 'y' : minus('y', v.k!)} = ±${slopeText(v.b!, v.a!)}${
                  v.h === 0 ? 'x' : `(${minus('x', v.h!)})`
                }`,
        },
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

/** The inverse as class writes it: 1/D times the swapped matrix, (1/10)[[6, −7], [−2, 4]]. */
const inverseNote = (v: Values) =>
  [v.a, v.b, v.c, v.d, v.D].some((x) => x === undefined) || v.D === 0
    ? ''
    : `→ A⁻¹ = (1/${fmt(v.D!)})[[${fmt(v.d!)}, ${fmt(-v.b! + 0)}], [${fmt(-v.c! + 0)}, ${fmt(v.a!)}]]`;

/** One entry of A⁻¹, worked out only to draw A⁻¹B (the system page's picture). */
const inverseEntry = (x: string, top: string, sign: 1 | -1) =>
  hide(
    derive(
      `${x} = ${sign < 0 ? '−' : ''}${top} ÷ D`,
      `{${x}} = ${sign < 0 ? '−' : ''}{${top}} ÷ {D}`,
      x,
      [top, 'D'],
      (v) => div(sign * v[top]!, v.D!),
      `${sign < 0 ? '−' : ''}{${top}} ÷ {D}`,
      'An entry of the inverse, to draw it.',
    ),
  );

/** A line's slope and intercept, worked out only to draw it (the Cramer page's picture). */
const lineOf = (n: string, which: string) => [
  V(`m${n}`, `m${n}`, `Slope of the ${which} line`, {
    min: -1e9,
    max: 1e9,
    step: 0.0001,
    derived: true,
    hidden: true,
  }),
  V(`i${n}`, `i${n}`, `Intercept of the ${which} line`, {
    min: -1e9,
    max: 1e9,
    step: 0.0001,
    derived: true,
    hidden: true,
  }),
];
/** ax + by = p as y = (−a ÷ b)x + p ÷ b, for the picture only (no line when b = 0). */
const lineRels = (n: string, a: string, b: string, p: string): Rel[] => [
  hide(
    derive(
      `m${n} = −${a} ÷ ${b}`,
      `{m${n}} = −{${a}} ÷ {${b}}`,
      `m${n}`,
      [a, b],
      (v) => div(-v[a]!, v[b]!),
      `−{${a}} ÷ {${b}}`,
      'The slope of the line, to draw it.',
    ),
  ),
  hide(
    derive(
      `i${n} = ${p} ÷ ${b}`,
      `{i${n}} = {${p}} ÷ {${b}}`,
      `i${n}`,
      [p, b],
      (v) => div(v[p]!, v[b]!),
      `{${p}} ÷ {${b}}`,
      'Where the line crosses the y-axis, to draw it.',
    ),
  ),
];

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
      V('e', 'e', 'Row 1, column 1 of A⁻¹', {
        min: -1000000,
        max: 1000000,
        step: 0.0001,
        derived: true,
        fraction: 1000,
      }),
      V('f', 'f', 'Row 1, column 2 of A⁻¹', {
        min: -1000000,
        max: 1000000,
        step: 0.0001,
        derived: true,
        fraction: 1000,
      }),
      V('g', 'g', 'Row 2, column 1 of A⁻¹', {
        min: -1000000,
        max: 1000000,
        step: 0.0001,
        derived: true,
        fraction: 1000,
      }),
      V('h', 'h', 'Row 2, column 2 of A⁻¹', {
        min: -1000000,
        max: 1000000,
        step: 0.0001,
        derived: true,
        fraction: 1000,
      }),
    ],
    ...rels(
      withStep(
        derive(
          'D = ad − bc',
          '{D} = {a} × {d} − {b} × {c}',
          'D',
          ['a', 'd', 'b', 'c'],
          (v) => v.a! * v.d! - v.b! * v.c!,
          '{a} × {d} − {b} × {c}',
          'Multiply down the main diagonal and take away the other diagonal.',
        ),
        'D',
        {
          // The inverse as class writes it: 1/D times the swapped matrix.
          note: inverseNote,
        },
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
    id: 'm.12.matrices~inverse-system',
    title: 'Solving a system with A⁻¹',
    use: 'Use this for “Solve 3x + 2y = 7 and 5x + 4y = 13 with the inverse matrix.”',
    assumptions: [
      'The system is AX = B: A holds the coefficients, X = [[x], [y]] and B the right sides.',
      'Multiply both sides by A⁻¹ on the left: X = A⁻¹B.',
      'A⁻¹ = (1/D)[[d, −b], [−c, a]] with D = ad − bc, so D = 0 means no single solution.',
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
      ...['e', 'f', 'g', 'h'].map((id) =>
        V(id, id, 'An entry of A⁻¹', {
          min: -1e9,
          max: 1e9,
          step: 0.0001,
          derived: true,
          hidden: true,
        }),
      ),
    ],
    ...rels(
      limit(
        'D ≠ 0',
        'The determinant {a} × {d} − {b} × {c} is not 0',
        ['a', 'b', 'c', 'd'],
        (v) => v.a! * v.d! - v.b! * v.c! !== 0,
        'With D = 0, A has no inverse: the lines are parallel or the same line.',
      ),
      withStep(
        derive(
          'D = ad − bc',
          '{D} = {a} × {d} − {b} × {c}',
          'D',
          ['a', 'd', 'b', 'c'],
          (v) => v.a! * v.d! - v.b! * v.c!,
          '{a} × {d} − {b} × {c}',
          'A⁻¹ needs the determinant: down the main diagonal, take away the other.',
        ),
        'D',
        { note: inverseNote },
      ),
      derive(
        'x = (dp − bq) ÷ D',
        '{x} = ({d} × {p} − {b} × {q}) ÷ {D}',
        'x',
        ['d', 'p', 'b', 'q', 'D'],
        (v) => div(v.d! * v.p! - v.b! * v.q!, v.D!),
        '({d} × {p} − {b} × {q}) ÷ {D}',
        'Row 1 of A⁻¹ times B: d times p, take away b times q, all over D.',
      ),
      derive(
        'y = (aq − cp) ÷ D',
        '{y} = ({a} × {q} − {c} × {p}) ÷ {D}',
        'y',
        ['a', 'q', 'c', 'p', 'D'],
        (v) => div(v.a! * v.q! - v.c! * v.p!, v.D!),
        '({a} × {q} − {c} × {p}) ÷ {D}',
        'Row 2 of A⁻¹ times B: −c times p plus a times q, all over D.',
      ),
      inverseEntry('e', 'd', 1),
      inverseEntry('f', 'b', -1),
      inverseEntry('g', 'c', -1),
      inverseEntry('h', 'a', 1),
    ),
    example: {
      a: 3,
      b: 2,
      p: 7,
      c: 5,
      d: 4,
      q: 13,
      D: 2,
      x: 1,
      y: 2,
      e: 2,
      f: -1,
      g: -2.5,
      h: 1.5,
    },
    startWith: ['a', 'b', 'p', 'c', 'd', 'q'],
    equation: '{a}x + {b}y = {p}\n{c}x + {d}y = {q}',
    representation: {
      kind: 'matrixGrid',
      mode: 'multiply',
      a: [
        ['e', 'f'],
        ['g', 'h'],
      ],
      b: [['p'], ['q']],
      product: [['x'], ['y']],
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
      ...lineOf('1', 'first'),
      ...lineOf('2', 'second'),
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
      withStep(
        derive(
          'x = (pd − bq) ÷ D',
          '{x} = ({p} × {d} − {b} × {q}) ÷ {D}',
          'x',
          ['p', 'd', 'b', 'q', 'D'],
          (v) => div(v.p! * v.d! - v.b! * v.q!, v.D!),
          '({p} × {d} − {b} × {q}) ÷ {D}',
          'Dₓ puts the right sides in the x column; divide it by D.',
        ),
        'x',
        {
          work: (v) => [
            `Dₓ = ${fmt(v.p!)} × ${par(v.d!)} − ${fmt(v.b!)} × ${par(v.q!)} = ${fmt(v.p! * v.d! - v.b! * v.q!)}`,
            `${fmt(v.p! * v.d! - v.b! * v.q!)} ÷ ${par(v.D!)} = ${fmt((v.p! * v.d! - v.b! * v.q!) / v.D!)}`,
          ],
        },
      ),
      withStep(
        derive(
          'y = (aq − pc) ÷ D',
          '{y} = ({a} × {q} − {p} × {c}) ÷ {D}',
          'y',
          ['a', 'q', 'p', 'c', 'D'],
          (v) => div(v.a! * v.q! - v.p! * v.c!, v.D!),
          '({a} × {q} − {p} × {c}) ÷ {D}',
          'Dᵧ puts the right sides in the y column; divide it by D.',
        ),
        'y',
        {
          work: (v) => [
            `Dᵧ = ${fmt(v.a!)} × ${par(v.q!)} − ${fmt(v.p!)} × ${par(v.c!)} = ${fmt(v.a! * v.q! - v.p! * v.c!)}`,
            `${fmt(v.a! * v.q! - v.p! * v.c!)} ÷ ${par(v.D!)} = ${fmt((v.a! * v.q! - v.p! * v.c!) / v.D!)}`,
          ],
        },
      ),
      ...lineRels('1', 'a', 'b', 'p'),
      ...lineRels('2', 'c', 'd', 'q'),
    ),
    example: {
      a: 2,
      b: 3,
      p: 13,
      c: 1,
      d: -1,
      q: -1,
      D: -5,
      x: 2,
      y: 3,
      m1: -2 / 3,
      i1: 13 / 3,
      m2: 1,
      i2: 1,
    },
    startWith: ['a', 'b', 'p', 'c', 'd', 'q'],
    equation: '{a}x + {b}y = {p}\n{c}x + {d}y = {q}',
    representation: {
      kind: 'lineSystem',
      lines: [
        { slope: 'm1', intercept: 'i1', label: 'First' },
        { slope: 'm2', intercept: 'i2', label: 'Second' },
      ],
      solution: { x: 'x', y: 'y' },
      fixed: true,
    },
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
      V('u', 'run', 'Run', { unit: 'm', min: 0.1, max: 100000, step: 0.01 }),
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
      'For A from 0° to 360°, A/2 is in quadrant I or II; a larger or negative A can put it in III or IV.',
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

/** m = √(x² + y²), and a missing component back from the magnitude. */
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
        'Take the other component’s square from the magnitude’s square, then the root (either sign).',
      ],
      [y]: [
        (v) =>
          v[m]! < Math.abs(v[x]!)
            ? undefined
            : [Math.sqrt(v[m]! ** 2 - v[x]! ** 2), -Math.sqrt(v[m]! ** 2 - v[x]! ** 2)],
        `±√({${m}}² − {${x}}²)`,
        'Take the other component’s square from the magnitude’s square, then the root (either sign).',
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
      'A vector has a magnitude (its length) and a direction but no fixed place: move it and it is the same vector.',
      'tan⁻¹(vy ÷ vx) alone gives the wrong quadrant when vx < 0: add 180°.',
    ],
    variables: [
      V('m', '|v|', 'Magnitude', { min: 0, max: 1000, step: 0.01 }),
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
            'The x-component is the magnitude times the cosine of the direction.',
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
            'The y-component is the magnitude times the sine of the direction.',
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
    use: 'Use this for “Find u + v for u = ⟨3, 1⟩ and v = ⟨1, 2⟩, and its magnitude.”',
    assumptions: [
      'Add vectors by adding matching components.',
      'Tip to tail: start v where u ends; u + v runs from u’s tail to v’s tip.',
      'The magnitude of the sum is not the sum of the magnitudes.',
    ],
    variables: [
      comp('ux', 'u₁', 'x-component of u'),
      comp('uy', 'u₂', 'y-component of u'),
      comp('vx', 'v₁', 'x-component of v'),
      comp('vy', 'v₂', 'y-component of v'),
      comp('sx', 's₁', 'x-component of u + v', 2000),
      comp('sy', 's₂', 'y-component of u + v', 2000),
      V('r', '|s|', 'Magnitude of s = u + v', { min: 0, max: 3000, step: 0.01 }),
    ],
    ...rels(
      sumOf('sx', 'ux', 'vx', 'x'),
      sumOf('sy', 'uy', 'vy', 'y'),
      derive(
        '|s| = √(s₁² + s₂²)',
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
    use: 'Use this for “Find −2u for u = ⟨3, 4⟩ and its magnitude.”',
    assumptions: [
      'k multiplies each component, so ku is |k| times as long.',
      'A negative k reverses the direction.',
      'Type k = 1 ÷ |u| for the unit vector along u: k = 0.2 turns ⟨3, 4⟩ into ⟨0.6, 0.8⟩.',
    ],
    variables: [
      V('k', 'k', 'Scalar', { min: -1000, max: 1000, step: 0.01 }),
      comp('ux', 'u₁', 'x-component of u'),
      comp('uy', 'u₂', 'y-component of u'),
      comp('x', 'w₁', 'x-component of ku', 1000000),
      comp('y', 'w₂', 'y-component of ku', 1000000),
      V('m', '|u|', 'Magnitude of u', { min: 0, max: 1500, step: 0.01, derived: true }),
      V('M', '|ku|', 'Magnitude of ku', { min: 0, max: 2000000, step: 0.01 }),
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
            'Scaling by k scales the magnitude by |k|; a negative k only turns it around.',
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
      V('m1', '|u|', 'Magnitude of u', { min: 0, max: 1500, step: 0.01, derived: true }),
      V('m2', '|v|', 'Magnitude of v', { min: 0, max: 1500, step: 0.01, derived: true }),
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
        'The cosine of the angle is the dot product over the product of the magnitudes.',
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
      V('f1', 'F₁', 'First force', { unit: 'N', min: 0.1, max: 10000, step: 0.1 }),
      V('f2', 'F₂', 'Second force', { unit: 'N', min: 0.1, max: 10000, step: 0.1 }),
      deg('a', 'a', 'Angle of F₂', 0, 360),
      V('fx', 'Fₓ', 'x-component of the resultant', {
        unit: 'N',
        min: -20000,
        max: 20000,
        step: 0.01,
      }),
      V('fy', 'Fᵧ', 'y-component of the resultant', {
        unit: 'N',
        min: -20000,
        max: 20000,
        step: 0.01,
      }),
      V('F', 'F', 'Resultant', { unit: 'N', min: 0, max: 30000, step: 0.01 }),
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
      V('r', 'r', 'Directed distance r', { min: -20, max: 20, step: 0.01 }),
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
      comp('c', 'c', 'Real part of w', 1000, { derived: true, hidden: true }),
      comp('d', 'd', 'Imaginary part of w', 1000, { derived: true, hidden: true }),
      V('r', 'r', 'Modulus of zw', { min: 0, max: 1000000, step: 0.01 }),
      deg('t', 'θ', 'Argument of zw', 0, 720),
      comp('p', 'p', 'Real part of zw', 1000000, { derived: true }),
      comp('q', 'q', 'Imaginary part of zw', 1000000, { derived: true }),
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
      hide(polarPart('c', 'r2', 't2', 'cos', 'w’s real part, to draw it: r₂ cos θ₂.')),
      hide(polarPart('d', 'r2', 't2', 'sin', 'w’s imaginary part, to draw it: r₂ sin θ₂.')),
      polarPart('p', 'r', 't', 'cos', 'Back to a + bi: the real part of zw is r cos θ.'),
      polarPart('q', 'r', 't', 'sin', 'The imaginary part of zw is r sin θ.'),
    ),
    example: { r1: 2, t1: 30, r2: 3, t2: 60, c: 1.5, d: 3 * sind(60), r: 6, t: 90, p: 0, q: 6 },
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
      withStep(
        derive(
          'R = rⁿ = (a² + b²)ⁿᐟ²',
          '{R} = ({a}² + {b}²)^({n} ÷ 2)',
          'R',
          ['a', 'b', 'n'],
          (v) => (v.a! ** 2 + v.b! ** 2) ** (v.n! / 2),
          (v: Values) => (v.n! % 2 === 0 ? `({a}² + {b}²)^${v.n! / 2}` : `√({a}² + {b}²)^${v.n!}`),
          'Raise the modulus to the nth power: r² = a² + b², so rⁿ is a² + b² to the power n ÷ 2, with no rounded r.',
        ),
        'R',
        {
          work: (v) => {
            const m = v.a! ** 2 + v.b! ** 2;
            return v.n! % 2 === 0
              ? [`${superscript(`${fmt(m)}^${v.n! / 2}`)} = ${fmt(v.R!)}`]
              : [`${superscript(`√${fmt(m)}^${v.n!}`)} = ${fmt(v.R!)}`];
          },
        },
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
      'Each petal is |a| long; a negative r is plotted on the opposite ray.',
      'The whole curve is drawn as θ runs once around.',
    ],
    variables: [
      real('a', 'a', 'Petal length', -20, 20),
      V('n', 'n', 'Number in cos nθ', { integer: true, min: 1, max: 8 }),
      deg('t', 'θ', 'Angle', 0, 360),
      real('r', 'r', 'Directed distance r', -20, 20),
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
      'r = a + b cos θ: |a| = |b| is a cardioid, through the pole with a heart shape.',
      '|a| < |b| has an inner loop; |a| > |b| has a dimple, or is convex when |a| ≥ 2|b|.',
      'A negative r is plotted on the opposite ray.',
    ],
    variables: [
      real('a', 'a', 'Constant a', -20, 20),
      real('b', 'b', 'Number before cos θ', -20, 20),
      deg('t', 'θ', 'Angle', 0, 360),
      real('r', 'r', 'Directed distance r', -40, 40),
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
      'So (x − h)²/a² + (y − k)²/b² = 1: an ellipse with center (h, k), a circle when a = b.',
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
              : `→ (x ${minusOf(v.h!)})²/${fmt(v.a! ** 2)} + (y ${minusOf(v.k!)})²/${fmt(v.b! ** 2)} = 1`,
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
      V('Y', 'y', 'Height at t', { unit: 'm', min: 0, max: 1000, step: 0.01 }),
      V('T', 'T', 'Time to land', { unit: 's', min: 0, max: 60, step: 0.01, derived: true }),
    ],
    ...rels(
      limit(
        't ≤ T',
        'The ball is still in the air: {t} is at most {T}',
        ['t', 'T'],
        (v) => v.t! <= v.T! + 1e-9,
        'The ball has landed by then: pick a time t no later than the landing time T.',
      ),
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
      withStep(
        derive(
          'T: y = 0',
          '0 = {h} + {v} × sin({q}°) × {T} − 4.9 × {T}²',
          'T',
          ['v', 'q', 'h'],
          flightTime,
          '({v} × sin({q}°) + √(({v} × sin({q}°))² + 19.6 × {h})) ÷ 9.8',
          'Set y = 0 and use the quadratic formula; the positive root is when it lands.',
        ),
        'T',
        {
          // The quadratic's a, b and c named before the simplified formula.
          how: (v) =>
            `Set y = 0: −4.9T² + ${fmt(v.v! * sind(v.q!))}T + ${fmt(v.h!)} = 0, so a = −4.9, b = v sin θ = ${fmt(
              v.v! * sind(v.q!),
            )} and c = h = ${fmt(v.h!)}. The quadratic formula’s positive root is when it lands.`,
        },
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
/** ax² + bx + c as written: no 1 before x², no 0 terms, a minus for a negative (x² − 4x). */
const polyText = (a: number, b: number, c: number) => {
  const terms: string[] = [];
  const add = (k: number, x: string) => {
    if (k === 0) return;
    const mag = Math.abs(k) === 1 && x ? '' : fmt(Math.abs(k));
    terms.push(
      terms.length === 0 ? `${k < 0 ? '−' : ''}${mag}${x}` : `${k < 0 ? '−' : '+'} ${mag}${x}`,
    );
  };
  add(a, 'x²');
  add(b, 'x');
  add(c, '');
  return terms.length === 0 ? '0' : terms.join(' ');
};

const MATH_12_LIMITS: ModuleDef[] = [
  // ── m.12.limits-intro (AP Calculus AB 1.2–2.2) ──
  {
    id: 'm.12.limits-intro',
    assumptions: [
      'f(x) = (x − a)(x − b) ÷ (x − a): factor the top first, as x² − 9 = (x − 3)(x + 3).',
      'The limit is the value f(x) approaches as x gets close to a, not the value f(a).',
      'Here f has no value at x = a (a hole in the graph), but the limit exists.',
    ],
    variables: [
      real('a', 'a', 'x approaches', -10, 10),
      real('b', 'b', 'The other zero', -10, 10),
      V('L', 'L', 'The limit', { min: -20, max: 20, step: 0.01, derived: true }),
      real('x', 'x', 'An x close to a', -30, 30),
      real('y', 'y', 'f(x) there', -60, 60),
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
      V('d', 'f′', 'Derivative, the tangent’s slope', {
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
      withCheck(
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
            how: (v) =>
              `Here f(x) = ${polyText(v.a!, v.b!, v.c!)}. The secant’s slope is the rise from (x, f(x)) to (x + h, f(x + h)) over the run h.`,
            work: (v) => {
              const rise = quad(v, v.x! + v.h!) - quad(v, v.x!);
              return [
                `f(${fmt(v.x! + v.h!)}) − f(${fmt(v.x!)}) = ${fmt(quad(v, v.x! + v.h!))} − ${par(Number(quad(v, v.x!).toFixed(4)))} = ${fmt(rise)}`,
                `${fmt(rise)} ÷ ${par(v.h!)} = ${fmt(rise / v.h!)}`,
              ];
            },
          },
        ),
        (v) =>
          `${fmt(v.m!)} = (${fmt(quad(v, v.x! + v.h!))} − ${par(Number(quad(v, v.x!).toFixed(4)))}) ÷ ${par(v.h!)}`,
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
      real('y', 'y', 'f(x) there', -1e9, 1e9),
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

// ── Vectors in space (added skill 13) ──

/** One component of a 3-D vector, one of a group of three (they count as one value). */
const comp3 = (id: string, symbol: string, name: string, group: string, range = 1000) =>
  V(id, symbol, name, { min: -range, max: range, step: 0.01, group });

/** The six components of u = ⟨a, b, c⟩ and v = ⟨d, e, f⟩. */
const UV: VariableDef[] = [
  comp3('a', 'u₁', 'x-component of u', 'u'),
  comp3('b', 'u₂', 'y-component of u', 'u'),
  comp3('c', 'u₃', 'z-component of u', 'u'),
  comp3('d', 'v₁', 'x-component of v', 'v'),
  comp3('e', 'v₂', 'y-component of v', 'v'),
  comp3('f', 'v₃', 'z-component of v', 'v'),
];

/** Each 3-D component's symbol, for the formulas' names. */
const SYM3: Record<string, string> = {
  a: 'u₁',
  b: 'u₂',
  c: 'u₃',
  d: 'v₁',
  e: 'v₂',
  f: 'v₃',
  g: 'w₁',
  h: 'w₂',
  k: 'w₃',
  x: 'w₁',
  y: 'w₂',
  z: 'w₃',
};

/** m = √(x² + y² + z²), a 3-D vector's length. */
const length3 = (m: string, [x, y, z]: string[], name: string) =>
  derive(
    `|${name}| = √(${SYM3[x!]}² + ${SYM3[y!]}² + ${SYM3[z!]}²)`,
    `{${m}} = √({${x}}² + {${y}}² + {${z}}²)`,
    m,
    [x!, y!, z!],
    (v) => Math.hypot(v[x!]!, v[y!]!, v[z!]!),
    `√({${x}}² + {${y}}² + {${z}}²)`,
    `The Pythagorean theorem twice: across the floor, then up. That is ${name}’s length.`,
  );

/** One component of u × v: the other two components crossed, first times second minus … */
const crossPart = (out: string, p: string, q: string, r: string, s: string, which: string) =>
  derive(
    `${SYM3[out]} = ${SYM3[p]}${SYM3[q]} − ${SYM3[r]}${SYM3[s]}`,
    `{${out}} = {${p}} × {${q}} − {${r}} × {${s}}`,
    out,
    [p, q, r, s],
    (v) => v[p]! * v[q]! - v[r]! * v[s]!,
    `{${p}} × {${q}} − {${r}} × {${s}}`,
    `The ${which}-component: cover the ${which} column and take the 2 × 2 determinant of what is left${which === 'y' ? ', with its sign changed' : ''}.`,
  );

const MATH_12_VECTORS_3D: ModuleDef[] = [
  // ── m.12.vectors-3d (N-VM.4, N-VM.5 in space) ──
  {
    id: 'm.12.vectors-3d',
    assumptions: [
      'A vector in space has three components, ⟨x, y, z⟩; u · v multiplies matching components and adds.',
      'cos θ = u · v ÷ (|u||v|), with θ from 0° to 180°.',
      'A dot product of 0 means the vectors are perpendicular.',
    ],
    variables: [
      ...UV,
      V('p', 'u · v', 'Dot product', { min: -3000000, max: 3000000, step: 0.01, derived: true }),
      V('m1', '|u|', 'Magnitude of u', { min: 0, max: 1800, step: 0.01, derived: true }),
      V('m2', '|v|', 'Magnitude of v', { min: 0, max: 1800, step: 0.01, derived: true }),
      deg('t', 'θ', 'Angle between u and v', 0, 180, { derived: true }),
    ],
    ...rels(
      derive(
        'u · v = u₁v₁ + u₂v₂ + u₃v₃',
        '{p} = {a} × {d} + {b} × {e} + {c} × {f}',
        'p',
        ['a', 'd', 'b', 'e', 'c', 'f'],
        (v) => v.a! * v.d! + v.b! * v.e! + v.c! * v.f!,
        '{a} × {d} + {b} × {e} + {c} × {f}',
        'Multiply matching components and add: the row u times the column v.',
      ),
      length3('m1', ['a', 'b', 'c'], 'u'),
      length3('m2', ['d', 'e', 'f'], 'v'),
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
        'The cosine of the angle is the dot product over the product of the magnitudes.',
      ),
    ),
    example: { a: 1, b: 2, c: 2, d: 4, e: 0, f: 3, p: 10, m1: 3, m2: 5, t: Math.acos(2 / 3) / RAD },
    startWith: ['a', 'b', 'c', 'd', 'e', 'f'],
    equation: '⟨{a}, {b}, {c}⟩ · ⟨{d}, {e}, {f}⟩ = {p}',
    pictureLabels: ['m1', 'm2', 't'],
    representation: {
      kind: 'matrixGrid',
      mode: 'multiply',
      a: [['a', 'b', 'c']],
      b: [['d'], ['e'], ['f']],
      product: [['p']],
    },
  },
  {
    id: 'm.12.vectors-3d~cross',
    title: 'The cross product',
    use: 'Use this for “Find u × v for u = ⟨1, 2, 3⟩ and v = ⟨2, 0, 1⟩, and the areas of the parallelogram and the triangle with sides u and v from one vertex.”',
    assumptions: [
      'u × v is a vector perpendicular to both u and v: its dot product with each is 0.',
      '|u × v| is the area of the parallelogram u and v span; the triangle is half of it.',
      'For a triangle PQR, take u = Q − P and v = R − P, the sides from one vertex.',
      'Order matters: v × u points the opposite way, −(u × v).',
    ],
    variables: [
      ...UV,
      comp3('x', 'w₁', 'x-component of u × v', 'w', 2000000),
      comp3('y', 'w₂', 'y-component of u × v', 'w', 2000000),
      comp3('z', 'w₃', 'z-component of u × v', 'w', 2000000),
      V('A', 'A', 'Area of the parallelogram, |u × v|', {
        min: 0,
        max: 4000000,
        step: 0.01,
        derived: true,
      }),
      V('Tri', 'A_T', 'Area of the triangle', { min: 0, max: 2000000, step: 0.01, derived: true }),
    ],
    ...rels(
      crossPart('x', 'b', 'f', 'c', 'e', 'x'),
      crossPart('y', 'c', 'd', 'a', 'f', 'y'),
      crossPart('z', 'a', 'e', 'b', 'd', 'z'),
      withStep(length3('A', ['x', 'y', 'z'], 'u × v'), 'A', {
        how: 'The length of u × v, by the Pythagorean theorem twice. |u × v| = |u||v| sin θ, base times height: the parallelogram’s area.',
      }),
      derive(
        'Area of the triangle = |u × v| ÷ 2',
        '{Tri} = {A} ÷ 2',
        'Tri',
        ['A'],
        (v) => v.A! / 2,
        '{A} ÷ 2',
        'The diagonal cuts the parallelogram into two equal triangles.',
      ),
    ),
    example: {
      a: 1,
      b: 2,
      c: 3,
      d: 2,
      e: 0,
      f: 1,
      x: 2,
      y: 5,
      z: -4,
      A: Math.sqrt(45),
      Tri: Math.sqrt(45) / 2,
    },
    startWith: ['a', 'b', 'c', 'd', 'e', 'f'],
    equation: '⟨{a}, {b}, {c}⟩ × ⟨{d}, {e}, {f}⟩ = ⟨{x}, {y}, {z}⟩',
    representation: {
      kind: 'table',
      sweep: 'f',
      output: 'A',
      params: ['a', 'b', 'c', 'd', 'e'],
      rows: (v: Values) => [-2, -1, 0, 1, 2].map((i) => (v.f ?? 1) + i),
    },
  },
  {
    id: 'm.12.vectors-3d~triple',
    title: 'Volume from the triple product',
    use: 'Use this for “Find the volume of the box that u = ⟨1, 2, 0⟩, v = ⟨0, 1, 3⟩ and w = ⟨2, 0, 1⟩ span.”',
    assumptions: [
      'u · (v × w) is the 3 × 3 determinant with rows u, v and w.',
      'The volume of the slanted box (parallelepiped) the three vectors span is its absolute value.',
      'A triple product of 0 means the three vectors lie in one plane.',
    ],
    variables: [
      comp3('a', 'u₁', 'x-component of u', 'u', 100),
      comp3('b', 'u₂', 'y-component of u', 'u', 100),
      comp3('c', 'u₃', 'z-component of u', 'u', 100),
      comp3('d', 'v₁', 'x-component of v', 'v', 100),
      comp3('e', 'v₂', 'y-component of v', 'v', 100),
      comp3('f', 'v₃', 'z-component of v', 'v', 100),
      comp3('g', 'w₁', 'x-component of w', 'w', 100),
      comp3('h', 'w₂', 'y-component of w', 'w', 100),
      comp3('k', 'w₃', 'z-component of w', 'w', 100),
      V('T', 'T', 'Triple product u · (v × w)', {
        min: -10000000,
        max: 10000000,
        step: 0.01,
        derived: true,
      }),
      V('Vol', 'V', 'Volume', { min: 0, max: 10000000, step: 0.01, derived: true }),
    ],
    ...rels(
      derive(
        'u · (v × w) = u₁(v₂w₃ − v₃w₂) − u₂(v₁w₃ − v₃w₁) + u₃(v₁w₂ − v₂w₁)',
        `{T} = ${DET3}`,
        'T',
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'k'],
        det3,
        DET3,
        'Expand the determinant along u’s row: each entry times the 2 × 2 determinant left, signs +, −, +.',
      ),
      derive(
        'V = |u · (v × w)|',
        '{Vol} = |{T}|',
        'Vol',
        ['T'],
        (v) => Math.abs(v.T!),
        '|{T}|',
        'A volume is never negative: the sign only says which way the three vectors turn.',
      ),
    ),
    example: { a: 1, b: 2, c: 0, d: 0, e: 1, f: 3, g: 2, h: 0, k: 1, T: 13, Vol: 13 },
    startWith: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'k'],
    equation: '||{a}, {b}, {c}; {d}, {e}, {f}; {g}, {h}, {k}|| = {T}',
    representation: {
      kind: 'table',
      sweep: 'k',
      output: 'Vol',
      params: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
      rows: (v: Values) => [-2, -1, 0, 1, 2].map((i) => (v.k ?? 1) + i),
    },
  },
  {
    id: 'm.12.vectors-3d~distance',
    title: 'Distance and midpoint in space',
    use: 'Use this for “Find the distance between P(1, 2, 3) and Q(3, 5, 9) and the midpoint of PQ.”',
    assumptions: [
      'A point in space has three coordinates (x, y, z); the axes meet at right angles.',
      'The distance is √(Δx² + Δy² + Δz²): the Pythagorean theorem across the floor, then up.',
      'The midpoint averages each coordinate.',
    ],
    variables: [
      comp3('p', 'x₁', 'x of P', 'P'),
      comp3('q', 'y₁', 'y of P', 'P'),
      comp3('r', 'z₁', 'z of P', 'P'),
      comp3('s', 'x₂', 'x of Q', 'Q'),
      comp3('t', 'y₂', 'y of Q', 'Q'),
      comp3('u', 'z₂', 'z of Q', 'Q'),
      V('d', 'd', 'Distance PQ', { min: 0, max: 3500, step: 0.01, derived: true }),
      V('mx', 'x_M', 'x of the midpoint M', {
        min: -1000,
        max: 1000,
        step: 0.01,
        group: 'M',
        derived: true,
      }),
      V('my', 'y_M', 'y of the midpoint M', {
        min: -1000,
        max: 1000,
        step: 0.01,
        group: 'M',
        derived: true,
      }),
      V('mz', 'z_M', 'z of the midpoint M', {
        min: -1000,
        max: 1000,
        step: 0.01,
        group: 'M',
        derived: true,
      }),
    ],
    ...rels(
      derive(
        'd = √((x₂ − x₁)² + (y₂ − y₁)² + (z₂ − z₁)²)',
        '{d} = √(({s} − {p})² + ({t} − {q})² + ({u} − {r})²)',
        'd',
        ['p', 'q', 'r', 's', 't', 'u'],
        (v) => Math.hypot(v.s! - v.p!, v.t! - v.q!, v.u! - v.r!),
        '√(({s} − {p})² + ({t} − {q})² + ({u} − {r})²)',
        'Subtract matching coordinates, square, add, and take the square root.',
      ),
      derive(
        'x_M = (x₁ + x₂) ÷ 2',
        '{mx} = ({p} + {s}) ÷ 2',
        'mx',
        ['p', 's'],
        (v) => (v.p! + v.s!) / 2,
        '({p} + {s}) ÷ 2',
        'The midpoint’s x is halfway between the two xs: their mean.',
      ),
      derive(
        'y_M = (y₁ + y₂) ÷ 2',
        '{my} = ({q} + {t}) ÷ 2',
        'my',
        ['q', 't'],
        (v) => (v.q! + v.t!) / 2,
        '({q} + {t}) ÷ 2',
        'The midpoint’s y is halfway between the two ys: their mean.',
      ),
      derive(
        'z_M = (z₁ + z₂) ÷ 2',
        '{mz} = ({r} + {u}) ÷ 2',
        'mz',
        ['r', 'u'],
        (v) => (v.r! + v.u!) / 2,
        '({r} + {u}) ÷ 2',
        'The midpoint’s z is halfway between the two zs: their mean.',
      ),
    ),
    example: { p: 1, q: 2, r: 3, s: 3, t: 5, u: 9, d: 7, mx: 2, my: 3.5, mz: 6 },
    startWith: ['p', 'q', 'r', 's', 't', 'u'],
    // Interim until the 3-D axes picture (H106): the distance as Q's z moves.
    representation: {
      kind: 'table',
      sweep: 'u',
      output: 'd',
      params: ['p', 'q', 'r', 's', 't'],
      rows: (v: Values) => [-2, -1, 0, 1, 2].map((i) => (v.u ?? 9) + i),
    },
  },
];

// ── Matrices as transformations (added skill 14) ──

const coord = (id: string, symbol: string, name: string, range = 1000, extra = {}) =>
  V(id, symbol, name, { min: -range, max: range, step: 0.01, ...extra });

/** A rotation's matrix entry: c = cos θ or s = sin θ. */
const trigOf = (out: string, fn: 'cos' | 'sin', t: string, which: string) =>
  derive(
    `${out} = ${fn} ${t === 'g' ? 'γ' : 'θ'}`,
    // No "°" on the letter (cos(θ)): the numbers get theirs when filled in, cos(30°).
    `{${out}} = ${fn}({${t}})`,
    out,
    [t],
    (v) => (fn === 'cos' ? cosd(v[t]!) : sind(v[t]!)),
    `${fn}({${t}})`,
    which,
  );

/** "(= √3/2 exactly)" after a rounded entry, or nothing. */
const exactNote = (e: Surd | undefined) => (e && e.k !== 1 ? `(= ${surdText(e)} exactly)` : '');
/** cos γ or sin γ exactly (1/2, √3/2), at a multiple of 30° or 45° that isn't one of 90°. */
const exactEntry = (fn: 'sin' | 'cos', g: number | undefined): Surd | undefined => {
  if (g === undefined || g % 90 === 0) return undefined;
  return exactTrig(fn, g);
};
/** n√k with a decimal n: 2, √3, −2√3, 1.5√2. */
const rootTerm = (n: number, k: number) =>
  k === 1 ? shown(n) : `${n === 1 ? '' : n === -1 ? '−' : fmt(n)}√${k}`;
/**
 * A row of R(γ) times (x, y) with the exact entries, when γ is a multiple of 30° or 45°:
 * cos γ × x ∓ sin γ × y = 2 − √3, so the line meets the answer (0.866 × 2 is not √3).
 */
const exactRow =
  (sym: string, first: ['sin' | 'cos', string], sign: 1 | -1, second: ['sin' | 'cos', string]) =>
  (v: Values): string[] => {
    const p = exactEntry(first[0], v.g);
    const q = exactEntry(second[0], v.g);
    if (!p || !q) return [];
    const terms = new Map<number, number>();
    for (const [e, x, k] of [
      [p, v[first[1]]!, 1],
      [q, v[second[1]]!, sign],
    ] as const) {
      const n = (k * e.n * x) / e.d;
      terms.set(e.k, (terms.get(e.k) ?? 0) + n);
    }
    const parts = [...terms]
      .map(([k, n]) => [k, Number(n.toFixed(4))] as const)
      .filter(([, n]) => n !== 0)
      .sort(([a], [b]) => a - b);
    if (parts.length === 0) return [];
    const text = parts
      .map(([k, n], i) =>
        i === 0 ? rootTerm(n, k) : `${n < 0 ? '−' : '+'} ${rootTerm(Math.abs(n), k)}`,
      )
      .join(' ');
    return [`${sym} = ${text}`];
  };

const MATH_12_TRANSFORMS: ModuleDef[] = [
  // ── m.12.matrix-transformations (N-VM.12) ──
  {
    id: 'm.12.matrix-transformations',
    assumptions: [
      'Turning by θ about the origin is the matrix [[cos θ, −sin θ], [sin θ, cos θ]]; a positive θ turns counterclockwise.',
      'Its columns are where (1, 0) and (0, 1) land: (cos θ, sin θ) and (−sin θ, cos θ).',
      'Multiply the matrix by the point as a column: each row times the column gives one coordinate.',
    ],
    variables: [
      deg('t', 'θ', 'Angle of turn', -360, 360),
      coord('x', 'x', 'x of the point'),
      coord('y', 'y', 'y of the point'),
      V('c', 'c', 'cos θ', { min: -1, max: 1, step: 0.0001, derived: true }),
      V('s', 's', 'sin θ', { min: -1, max: 1, step: 0.0001, derived: true }),
      coord('X', 'x′', 'x of the image', 1500),
      coord('Y', 'y′', 'y of the image', 1500),
    ],
    ...rels(
      trigOf('c', 'cos', 't', 'The first column is where (1, 0) lands: (cos θ, sin θ).'),
      trigOf('s', 'sin', 't', 'The same column’s second entry.'),
      rel(
        'x′ = cx − sy',
        '{X} = {c} × {x} − {s} × {y}',
        ['X', 'c', 'x', 's', 'y'],
        (v) => v.X! - (v.c! * v.x! - v.s! * v.y!),
        {
          X: [
            (v) => v.c! * v.x! - v.s! * v.y!,
            '{c} × {x} − {s} × {y}',
            'The first row [cos θ, −sin θ] times the column (x, y).',
          ],
        },
      ),
      rel(
        'y′ = sx + cy',
        '{Y} = {s} × {x} + {c} × {y}',
        ['Y', 's', 'x', 'c', 'y'],
        (v) => v.Y! - (v.s! * v.x! + v.c! * v.y!),
        {
          Y: [
            (v) => v.s! * v.x! + v.c! * v.y!,
            '{s} × {x} + {c} × {y}',
            'The second row [sin θ, cos θ] times the column (x, y).',
          ],
        },
      ),
      rel(
        'x = cx′ + sy′',
        '{x} = {c} × {X} + {s} × {Y}',
        ['x', 'c', 'X', 's', 'Y'],
        (v) => v.x! - (v.c! * v.X! + v.s! * v.Y!),
        {
          x: [
            (v) => v.c! * v.X! + v.s! * v.Y!,
            '{c} × {X} + {s} × {Y}',
            'Undo the turn: turning back by θ is the matrix [[cos θ, sin θ], [−sin θ, cos θ]].',
          ],
        },
      ),
      rel(
        'y = −sx′ + cy′',
        '{y} = −{s} × {X} + {c} × {Y}',
        ['y', 's', 'X', 'c', 'Y'],
        (v) => v.y! - (-v.s! * v.X! + v.c! * v.Y!),
        {
          y: [
            (v) => -v.s! * v.X! + v.c! * v.Y!,
            '−{s} × {X} + {c} × {Y}',
            'The second row of the turn back times the column (x′, y′).',
          ],
        },
      ),
    ),
    example: { t: 90, x: 3, y: 1, c: 0, s: 1, X: -1, Y: 3 },
    startWith: ['t', 'x', 'y'],
    pictureLabels: ['c', 's'],
    representation: {
      kind: 'transformation',
      figure: [
        ['x', 'y'],
        [0, 0],
      ],
      move: 'rotate',
      angle: 't',
      center: [0, 0],
      image: { x: 'X', y: 'Y' },
      extent: 6,
      quadrants: 4,
    },
  },
  {
    id: 'm.12.matrix-transformations~image',
    title: 'The image of a point, and undoing it',
    use: 'Use this for “Where does [[2, 1], [1, 1]] send (3, −1)? Which point does it send to (5, 2)?”',
    assumptions: [
      'The matrix [[a, b], [c, d]] sends (x, y) to (ax + by, cx + dy).',
      'Type x′ and y′ to undo it: the inverse matrix sends the image back, when D = ad − bc is not 0.',
      'D = 0 flattens the whole plane onto a line or a point, so the move can’t be undone.',
    ],
    variables: [
      { ...entry('a', 'a', 'Row 1, column 1', 100), group: 'A' },
      { ...entry('b', 'b', 'Row 1, column 2', 100), group: 'A' },
      { ...entry('c', 'c', 'Row 2, column 1', 100), group: 'A' },
      { ...entry('d', 'd', 'Row 2, column 2', 100), group: 'A' },
      coord('x', 'x', 'x of the point'),
      coord('y', 'y', 'y of the point'),
      coord('X', 'x′', 'x of the image', 200000),
      coord('Y', 'y′', 'y of the image', 200000),
      { ...entry('D', 'D', 'Determinant', 20000), derived: true },
    ],
    ...rels(
      rel(
        'x′ = ax + by',
        '{X} = {a} × {x} + {b} × {y}',
        ['X', 'a', 'x', 'b', 'y'],
        (v) => v.X! - (v.a! * v.x! + v.b! * v.y!),
        {
          X: [
            (v) => v.a! * v.x! + v.b! * v.y!,
            '{a} × {x} + {b} × {y}',
            'Row 1 times the column (x, y).',
          ],
          x: [
            (v) => div(v.X! - v.b! * v.y!, v.a!),
            '({X} − {b} × {y}) ÷ {a}',
            'Take by from x′, then divide by a.',
          ],
          y: [
            (v) => div(v.X! - v.a! * v.x!, v.b!),
            '({X} − {a} × {x}) ÷ {b}',
            'Take ax from x′, then divide by b.',
          ],
        },
      ),
      rel(
        'y′ = cx + dy',
        '{Y} = {c} × {x} + {d} × {y}',
        ['Y', 'c', 'x', 'd', 'y'],
        (v) => v.Y! - (v.c! * v.x! + v.d! * v.y!),
        {
          Y: [
            (v) => v.c! * v.x! + v.d! * v.y!,
            '{c} × {x} + {d} × {y}',
            'Row 2 times the column (x, y).',
          ],
          x: [
            (v) => div(v.Y! - v.d! * v.y!, v.c!),
            '({Y} − {d} × {y}) ÷ {c}',
            'Take dy from y′, then divide by c.',
          ],
          y: [
            (v) => div(v.Y! - v.c! * v.x!, v.d!),
            '({Y} − {c} × {x}) ÷ {d}',
            'Take cx from y′, then divide by d.',
          ],
        },
      ),
      derive(
        'D = ad − bc',
        '{D} = {a} × {d} − {b} × {c}',
        'D',
        ['a', 'd', 'b', 'c'],
        (v) => v.a! * v.d! - v.b! * v.c!,
        '{a} × {d} − {b} × {c}',
        'The determinant says whether the move can be undone: not when it is 0.',
      ),
      rel(
        'x = (dx′ − by′) ÷ D',
        '{x} = ({d} × {X} − {b} × {Y}) ÷ {D}',
        ['x', 'd', 'X', 'b', 'Y', 'D'],
        (v) => v.x! * v.D! - (v.d! * v.X! - v.b! * v.Y!),
        {
          x: [
            (v) => div(v.d! * v.X! - v.b! * v.Y!, v.D!),
            '({d} × {X} − {b} × {Y}) ÷ {D}',
            'The inverse (1/D)[[d, −b], [−c, a]] times (x′, y′): its first row.',
          ],
        },
        {
          message: (v) =>
            v.D === 0
              ? 'D = 0: the matrix flattens the plane onto a line, so many points share this image, or none has it.'
              : undefined,
        },
      ),
      rel(
        'y = (ay′ − cx′) ÷ D',
        '{y} = ({a} × {Y} − {c} × {X}) ÷ {D}',
        ['y', 'a', 'Y', 'c', 'X', 'D'],
        (v) => v.y! * v.D! - (v.a! * v.Y! - v.c! * v.X!),
        {
          y: [
            (v) => div(v.a! * v.Y! - v.c! * v.X!, v.D!),
            '({a} × {Y} − {c} × {X}) ÷ {D}',
            'The inverse’s second row times (x′, y′).',
          ],
        },
      ),
    ),
    example: { a: 2, b: 1, c: 1, d: 1, x: 3, y: -1, X: 5, Y: 2, D: 1 },
    startWith: ['x', 'y', 'a', 'b', 'c', 'd'],
    equation: '[[{a}, {b}; {c}, {d}]] [[{x}; {y}]] = [[{X}; {Y}]]',
    representation: {
      kind: 'matrixGrid',
      mode: 'multiply',
      a: [
        ['a', 'b'],
        ['c', 'd'],
      ],
      b: [['x'], ['y']],
      product: [['X'], ['Y']],
    },
  },
  {
    id: 'm.12.matrix-transformations~area',
    title: 'How a matrix changes area',
    use: 'Use this for “A shape of area 4 is transformed by [[3, 1], [1, 2]]. What is the new area?”',
    assumptions: [
      'The unit square lands on the parallelogram with sides (a, c) and (b, d), the matrix’s columns.',
      'Its area is |D| = |ad − bc|, and every area is multiplied by the same |D|.',
      'A negative D also flips the figure over; D = 0 squashes it flat.',
    ],
    variables: [
      { ...entry('a', 'a', 'Row 1, column 1', 100), group: 'A' },
      { ...entry('b', 'b', 'Row 1, column 2', 100), group: 'A' },
      { ...entry('c', 'c', 'Row 2, column 1', 100), group: 'A' },
      { ...entry('d', 'd', 'Row 2, column 2', 100), group: 'A' },
      { ...entry('D', 'D', 'Determinant', 20000), derived: true },
      V('S', 'S', 'Area before', { min: 0, max: 100000, step: 0.01 }),
      V('T', 'T', 'Area after', { min: 0, max: 2000000000, step: 0.01 }),
      { ...entry('p', 'p', 'x of the far corner', 200), derived: true, hidden: true },
      { ...entry('q', 'q', 'y of the far corner', 200), derived: true, hidden: true },
    ],
    ...rels(
      derive(
        'D = ad − bc',
        '{D} = {a} × {d} − {b} × {c}',
        'D',
        ['a', 'd', 'b', 'c'],
        (v) => v.a! * v.d! - v.b! * v.c!,
        '{a} × {d} − {b} × {c}',
        'The area of the unit square’s image, with a sign for flipping.',
      ),
      rel(
        'T = |D| × S',
        '{T} = |{D}| × {S}',
        ['T', 'D', 'S'],
        (v) => v.T! - Math.abs(v.D!) * v.S!,
        {
          T: [
            (v) => Math.abs(v.D!) * v.S!,
            '|{D}| × {S}',
            'Every unit square becomes a parallelogram of area |D|, so every area is multiplied by |D|.',
          ],
          S: [
            (v) => div(v.T!, Math.abs(v.D!)),
            '{T} ÷ |{D}|',
            'Undo the stretch: divide the new area by |D|.',
          ],
        },
      ),
      hide(
        derive(
          'p = a + b',
          '{p} = {a} + {b}',
          'p',
          ['a', 'b'],
          (v) => v.a! + v.b!,
          '{a} + {b}',
          'The far corner of the parallelogram, to draw it.',
        ),
      ),
      hide(
        derive(
          'q = c + d',
          '{q} = {c} + {d}',
          'q',
          ['c', 'd'],
          (v) => v.c! + v.d!,
          '{c} + {d}',
          'The far corner of the parallelogram, to draw it.',
        ),
      ),
    ),
    example: { a: 3, b: 1, c: 1, d: 2, D: 5, S: 4, T: 20, p: 4, q: 3 },
    startWith: ['a', 'b', 'c', 'd', 'S'],
    pictureLabels: ['D', 'S', 'T'],
    representation: {
      kind: 'coordinatePlane',
      x: 'a',
      y: 'c',
      polygon: [
        ['a', 'c'],
        ['p', 'q'],
        ['b', 'd'],
        [0, 0],
      ],
      extent: 6,
      quadrants: 4,
    },
  },
  {
    id: 'm.12.matrix-transformations~compose',
    title: 'Two turns in a row',
    use: 'Use this for “Turn (4, 2) by 30° and then by 60°. Which single matrix does both?”',
    assumptions: [
      'Doing α and then β is the product R(β)R(α), the later move written on the left.',
      'For two turns about the origin the product is one turn by γ = α + β.',
      'For most other pairs of moves the order changes the answer.',
    ],
    variables: [
      deg('a', 'α', 'First turn', -360, 360),
      deg('b', 'β', 'Second turn', -360, 360),
      deg('g', 'γ', 'Both turns', -720, 720, { derived: true }),
      V('c', 'c', 'cos γ', { min: -1, max: 1, step: 0.0001, derived: true }),
      V('s', 's', 'sin γ', { min: -1, max: 1, step: 0.0001, derived: true }),
      coord('x', 'x', 'x of the point'),
      coord('y', 'y', 'y of the point'),
      coord('X', 'x″', 'x of the final image', 1500),
      coord('Y', 'y″', 'y of the final image', 1500),
    ],
    ...rels(
      derive(
        'γ = α + β',
        '{g} = {a} + {b}',
        'g',
        ['a', 'b'],
        (v) => v.a! + v.b!,
        '{a} + {b}',
        'R(β)R(α) = R(α + β): multiplying the two matrices adds the angles (the sum formulas).',
      ),
      withStep(
        trigOf('c', 'cos', 'g', 'The first column of R(γ) is where (1, 0) lands: (cos γ, sin γ).'),
        'c',
        { note: (v) => exactNote(exactEntry('cos', v.g)) },
      ),
      withStep(trigOf('s', 'sin', 'g', 'The same column’s second entry.'), 's', {
        note: (v) =>
          v.c === undefined || v.s === undefined
            ? ''
            : `${exactNote(exactEntry('sin', v.g))} → the single matrix R(γ) = [[${fmt(v.c)}, ${fmt(-v.s)}], [${fmt(v.s)}, ${fmt(v.c)}]]`.trimStart(),
      }),
      withStep(
        rel(
          'x″ = cx − sy',
          '{X} = {c} × {x} − {s} × {y}',
          ['X', 'c', 'x', 's', 'y'],
          (v) => v.X! - (v.c! * v.x! - v.s! * v.y!),
          {
            X: [
              (v) => v.c! * v.x! - v.s! * v.y!,
              '{c} × {x} − {s} × {y}',
              'The first row of R(γ), [cos γ, −sin γ], times the column (x, y).',
            ],
          },
        ),
        'X',
        { work: exactRow('x″', ['cos', 'x'], -1, ['sin', 'y']) },
      ),
      withStep(
        rel(
          'y″ = sx + cy',
          '{Y} = {s} × {x} + {c} × {y}',
          ['Y', 's', 'x', 'c', 'y'],
          (v) => v.Y! - (v.s! * v.x! + v.c! * v.y!),
          {
            Y: [
              (v) => v.s! * v.x! + v.c! * v.y!,
              '{s} × {x} + {c} × {y}',
              'The second row of R(γ), [sin γ, cos γ], times the column (x, y).',
            ],
          },
        ),
        'Y',
        { work: exactRow('y″', ['sin', 'x'], 1, ['cos', 'y']) },
      ),
    ),
    example: { a: 30, b: 60, g: 90, c: 0, s: 1, x: 4, y: 2, X: -2, Y: 4 },
    startWith: ['a', 'b', 'x', 'y'],
    representation: {
      kind: 'transformation',
      figure: [
        ['x', 'y'],
        [0, 0],
      ],
      move: 'rotate',
      angle: 'a',
      center: [0, 0],
      then: { move: 'rotate', angle: 'b', center: [0, 0] },
      image2: { x: 'X', y: 'Y' },
      extent: 6,
      quadrants: 4,
    },
  },
];

// ── Polar equations of conics, rotation of axes (added skill 15) ──

/** The conic an eccentricity gives. */
const conicOf = (e: number) =>
  Math.abs(e - 1) < 1e-9 ? 'a parabola' : e < 1 ? 'an ellipse' : 'a hyperbola';
/** The conic a discriminant B² − 4AC gives (the degenerate cases aside). */
const conicByDiscriminant = (D: number) =>
  D < 0 ? 'an ellipse' : D === 0 ? 'a parabola' : 'a hyperbola';
/** x = r cos θ (or sin), its formula named with θ as the page writes it. */
const polarPartθ = (out: string, r: string, t: string, fn: 'cos' | 'sin', how: string): Rel => {
  const part = polarPart(out, r, t, fn, how);
  return { ...part, relation: { ...part.relation, id: `${out} = ${r} ${fn} θ` } };
};
/** The angle θ that removes the xy term: tan 2θ = B ÷ (A − C), θ from 0° to 90°. */
const turnAngle = withCheck(
  withStep(
    derive(
      'tan 2θ = B ÷ (A − C)',
      'tan(2 × {t}) = {B} ÷ ({A} − {C})',
      't',
      ['A', 'B', 'C'],
      (v) => {
        // No xy term: no turn needed (the rotated-equation page refuses B = 0 by a limit).
        if (v.B === 0) return 0;
        if (v.A === v.C) return 45;
        const w = Math.atan(v.B! / (v.A! - v.C!)) / RAD;
        return (w < 0 ? w + 180 : w) / 2;
      },
      (v: Values) =>
        v.B === 0
          ? '0'
          : v.A === v.C
            ? '90 ÷ 2'
            : v.B! / (v.A! - v.C!) < 0
              ? '(180 + tan⁻¹({B} ÷ ({A} − {C}))) ÷ 2'
              : 'tan⁻¹({B} ÷ ({A} − {C})) ÷ 2',
      'tan 2θ = B ÷ (A − C) is cot 2θ = (A − C) ÷ B turned over; add 180° to a negative 2θ, then halve.',
    ),
    't',
    {
      // The inverse tangent's own value before the halving: tan⁻¹(1) = 45°, so θ = 45° ÷ 2.
      work: (v) => {
        if (v.B === 0 || v.A === v.C) return [];
        const w = Math.atan(v.B! / (v.A! - v.C!)) / RAD;
        return w < 0
          ? [`θ = (180° − ${fmt(-w)}°) ÷ 2`, `θ = ${fmt(180 + w)}° ÷ 2`]
          : [`θ = ${fmt(w)}° ÷ 2`];
      },
      note: (v) =>
        v.B === 0
          ? '→ no xy term: no turn needed'
          : v.A === v.C
            ? '→ A = C, so cot 2θ = 0 and 2θ = 90°'
            : '',
    },
  ),
  (v) =>
    v.B === 0
      ? `tan(2 × ${fmt(v.t!)}°) = 0`
      : v.A === v.C
        ? `cos(2 × ${fmt(v.t!)}°) = 0`
        : // Near 2θ = 90° a tangent is steep: θ carries 8 figures so the sides agree as written.
          `tan(2 × ${Math.abs(v.B! / (v.A! - v.C!)) > 100 ? formatNumber(v.t!, { figures: 8 }) : fmt(v.t!)}°) = ${fmt(v.B!)} ÷ (${fmt(v.A!)} − ${par(v.C!)})`,
);
const noXyTerm = limit(
  'B ≠ 0',
  'The xy term {B} is not 0',
  ['B'],
  (v) => v.B !== 0,
  'B = 0: there is no xy term, so the axes need no turning.',
);

/**
 * A′ (sign 1) or C′ (sign −1) with the trig values put in: "A′ = 4 × 0.8536 + 2 × 0.3536 +
 * 2 × 0.1464", then the three products, before the sum.
 */
const rotatedWork =
  (sym: string, sign: 1 | -1) =>
  (v: Values): string[] => {
    if ([v.A, v.B, v.C, v.t].some((x) => x === undefined)) return [];
    const c = cosd(v.t!);
    const s = sind(v.t!);
    const [first, last] = sign === 1 ? [c * c, s * s] : [s * s, c * c];
    const mid = s * c;
    const join = (parts: number[]) =>
      parts
        .map((x, i) => {
          const neg = (i === 1 ? sign * x : x) < 0;
          const abs = shown(Math.abs(Number(x.toFixed(4))));
          return i === 0 ? shown(Number(x.toFixed(4))) : `${neg ? '−' : '+'} ${abs}`;
        })
        .join(' ');
    const r4 = (x: number) => Number(x.toFixed(4));
    return [
      `${sym} = ${par(v.A!)} × ${shown(r4(first))} ${sign === 1 ? '+' : '−'} ${par(v.B!)} × ${shown(r4(mid))} + ${par(v.C!)} × ${shown(r4(last))}`,
      `${sym} = ${join([v.A! * first, v.B! * mid, v.C! * last])}`,
    ];
  };

const MATH_12_POLAR_CONICS: ModuleDef[] = [
  // ── m.12.polar-conics (G-GPE.3 carried on) ──
  {
    id: 'm.12.polar-conics',
    assumptions: [
      'Divide the top and bottom by m to reach r = ed ÷ (1 − e cos θ): the eccentricity e and the directrix distance d.',
      'e < 1 is an ellipse, e = 1 a parabola, e > 1 a hyperbola; the focus is at the pole.',
      'n is the number after the minus: + cos θ is n = −1. With − cos θ the directrix is x = −d; with + cos θ it is x = d.',
    ],
    variables: [
      V('k', 'k', 'Top number', { min: 0.01, max: 1000, step: 0.01 }),
      V('m', 'm', 'Number in the bottom', { min: 0.01, max: 1000, step: 0.01 }),
      V('n', 'n', 'Number before cos θ', {
        min: -1000,
        max: 1000,
        step: 0.01,
      }),
      V('e', 'e', 'Eccentricity', { min: 0, max: 100000, step: 0.0001, derived: true }),
      V('d', 'd', 'Distance from the focus to the directrix', {
        min: 0,
        max: 100000,
        step: 0.01,
        derived: true,
      }),
      deg('t', 'θ', 'Angle', -360, 360),
      V('r', 'r', 'Distance from the pole', { min: -1000000, max: 1000000, step: 0.01 }),
    ],
    ...rels(
      withStep(
        derive(
          'e = |n| ÷ m',
          '{e} = |{n}| ÷ {m}',
          'e',
          ['n', 'm'],
          (v) => (v.n === 0 ? undefined : div(Math.abs(v.n!), v.m!)),
          '|{n}| ÷ {m}',
          'Dividing the bottom by m leaves 1 − e cos θ, so e is the number before cos θ over m.',
        ),
        'e',
        { note: (v) => (v.e === undefined ? '' : `→ ${conicOf(v.e)}`) },
      ),
      withStep(
        derive(
          'd = k ÷ |n|',
          '{d} = {k} ÷ |{n}|',
          'd',
          ['k', 'n'],
          (v) => (v.n === 0 ? undefined : div(v.k!, Math.abs(v.n!))),
          '{k} ÷ |{n}|',
          'The top over m is ed, and e is |n| ÷ m, so d = k ÷ |n|.',
        ),
        'd',
        {
          note: (v) =>
            v.d === undefined || v.n === undefined
              ? ''
              : `→ the directrix is x = ${v.n > 0 ? '−' : ''}${shown(v.d)}`,
        },
      ),
      rel(
        'r = k ÷ (m − n cos θ)',
        '{r} = {k} ÷ ({m} − {n} × cos({t}))',
        ['r', 'k', 'm', 'n', 't'],
        (v) => v.r! * (v.m! - v.n! * cosd(v.t!)) - v.k!,
        {
          r: [
            (v) => div(v.k!, v.m! - v.n! * cosd(v.t!)),
            '{k} ÷ ({m} − {n} × cos({t}))',
            'Put the angle into the equation: the point on the conic in that direction.',
          ],
          k: [
            (v) => v.r! * (v.m! - v.n! * cosd(v.t!)),
            '{r} × ({m} − {n} × cos({t}))',
            'Multiply both sides by the bottom.',
          ],
        },
        {
          message: (v) =>
            v.m !== undefined &&
            v.n !== undefined &&
            v.t !== undefined &&
            Math.abs(v.m - v.n * cosd(v.t)) < 1e-12
              ? 'The bottom is 0 at this angle: the conic never reaches this direction (it runs off parallel to it).'
              : undefined,
        },
      ),
    ),
    example: { k: 6, m: 2, n: 1, e: 0.5, d: 6, t: 60, r: 4 },
    startWith: ['k', 'm', 'n', 't'],
    equation: '{r} = {k}/{{m} − {n} cos {t}°}',
    representation: {
      kind: 'polarGrid',
      point: { r: 'r', theta: 't' },
      fixed: true,
    },
  },
  {
    id: 'm.12.polar-conics~sine',
    title: 'Polar conics with sin θ',
    use: 'Use this for “Name the conic r = 4 ÷ (1 + sin θ), its eccentricity and its directrix.”',
    assumptions: [
      'Divide the top and bottom by m to reach r = ed ÷ (1 − e sin θ): the eccentricity e and the directrix distance d.',
      'e < 1 is an ellipse, e = 1 a parabola, e > 1 a hyperbola; the focus is at the pole.',
      'n is the number after the minus: + sin θ is n = −1. The directrix is horizontal: y = −d with − sin θ, y = d with + sin θ.',
    ],
    variables: [
      V('k', 'k', 'Top number', { min: 0.01, max: 1000, step: 0.01 }),
      V('m', 'm', 'Number in the bottom', { min: 0.01, max: 1000, step: 0.01 }),
      V('n', 'n', 'Number before sin θ', {
        min: -1000,
        max: 1000,
        step: 0.01,
      }),
      V('e', 'e', 'Eccentricity', { min: 0, max: 100000, step: 0.0001, derived: true }),
      V('d', 'd', 'Distance from the focus to the directrix', {
        min: 0,
        max: 100000,
        step: 0.01,
        derived: true,
      }),
      deg('t', 'θ', 'Angle', -360, 360),
      V('r', 'r', 'Distance from the pole', { min: -1000000, max: 1000000, step: 0.01 }),
    ],
    ...rels(
      withStep(
        derive(
          'e = |n| ÷ m',
          '{e} = |{n}| ÷ {m}',
          'e',
          ['n', 'm'],
          (v) => (v.n === 0 ? undefined : div(Math.abs(v.n!), v.m!)),
          '|{n}| ÷ {m}',
          'Dividing the bottom by m leaves 1 − e sin θ, so e is the number before sin θ over m.',
        ),
        'e',
        { note: (v) => (v.e === undefined ? '' : `→ ${conicOf(v.e)}`) },
      ),
      withStep(
        derive(
          'd = k ÷ |n|',
          '{d} = {k} ÷ |{n}|',
          'd',
          ['k', 'n'],
          (v) => (v.n === 0 ? undefined : div(v.k!, Math.abs(v.n!))),
          '{k} ÷ |{n}|',
          'The top over m is ed, and e is |n| ÷ m, so d = k ÷ |n|.',
        ),
        'd',
        {
          note: (v) =>
            v.d === undefined || v.n === undefined
              ? ''
              : `→ the directrix is y = ${v.n > 0 ? '−' : ''}${shown(v.d)}`,
        },
      ),
      rel(
        'r = k ÷ (m − n sin θ)',
        '{r} = {k} ÷ ({m} − {n} × sin({t}))',
        ['r', 'k', 'm', 'n', 't'],
        (v) => v.r! * (v.m! - v.n! * sind(v.t!)) - v.k!,
        {
          r: [
            (v) => div(v.k!, v.m! - v.n! * sind(v.t!)),
            '{k} ÷ ({m} − {n} × sin({t}))',
            'Put the angle into the equation: the point on the conic in that direction.',
          ],
          k: [
            (v) => v.r! * (v.m! - v.n! * sind(v.t!)),
            '{r} × ({m} − {n} × sin({t}))',
            'Multiply both sides by the bottom.',
          ],
        },
        {
          message: (v) =>
            v.m !== undefined &&
            v.n !== undefined &&
            v.t !== undefined &&
            Math.abs(v.m - v.n * sind(v.t)) < 1e-12
              ? 'The bottom is 0 at this angle: the conic never reaches this direction (it runs off parallel to it).'
              : undefined,
        },
      ),
    ),
    example: { k: 4, m: 1, n: -1, e: 1, d: 4, t: 90, r: 2 },
    startWith: ['k', 'm', 'n', 't'],
    equation: '{r} = {k}/{{m} − {n} sin {t}°}',
    representation: {
      kind: 'polarGrid',
      point: { r: 'r', theta: 't' },
      fixed: true,
    },
  },
  {
    id: 'm.12.polar-conics~ellipse',
    title: 'A polar ellipse: vertices and axes',
    use: 'Use this for “For r = 3 ÷ (1 − 0.5 cos θ), find the vertices, the center and the lengths of the axes.”',
    assumptions: [
      'r = ed ÷ (1 − e cos θ) with 0 < e < 1 is an ellipse with one focus at the pole.',
      'Its vertices are at θ = 0° and θ = 180°; the major axis 2a is the sum of their distances.',
      'The center is c = ae from the focus, and b² = a² − c².',
    ],
    variables: [
      V('e', 'e', 'Eccentricity', { min: 0.01, max: 0.99, step: 0.01 }),
      V('k', 'k', 'Top number (ed)', { min: 0.0001, max: 1000, step: 0.01 }),
      V('d', 'd', 'Distance from the focus to the directrix', { min: 0.01, max: 1000, step: 0.01 }),
      V('R', 'R', 'Distance to the vertex at 0°', { min: 0.001, max: 200000, step: 0.01 }),
      V('S', 'S', 'Distance to the vertex at 180°', { min: 0.001, max: 1000, step: 0.01 }),
      V('a', 'a', 'Half the major axis', { min: 0.001, max: 200000, step: 0.01 }),
      V('c', 'c', 'Distance from the center to the focus', {
        min: 0,
        max: 200000,
        step: 0.01,
        derived: true,
      }),
      V('b', 'b', 'Half the minor axis', { min: 0, max: 200000, step: 0.01, derived: true }),
    ],
    ...rels(
      rel('k = ed', '{k} = {e} × {d}', ['k', 'e', 'd'], (v) => v.k! - v.e! * v.d!, {
        k: [(v) => v.e! * v.d!, '{e} × {d}', 'The top of r = ed ÷ (1 − e cos θ) is e times d.'],
        d: [
          (v) => div(v.k!, v.e!),
          '{k} ÷ {e}',
          'The top is ed: divide it by e to find the directrix distance.',
        ],
      }),
      // R and S read straight off the equation's top k (never a rounded d).
      rel(
        'R = k ÷ (1 − e)',
        '{R} = {k} ÷ (1 − {e})',
        ['R', 'k', 'e'],
        (v) => v.R! * (1 - v.e!) - v.k!,
        {
          R: [
            (v) => div(v.k!, 1 - v.e!),
            '{k} ÷ (1 − {e})',
            'At θ = 0°, cos θ = 1: the bottom is 1 − e.',
          ],
          k: [(v) => v.R! * (1 - v.e!), '{R} × (1 − {e})', 'Multiply by the bottom, 1 − e.'],
        },
      ),
      rel(
        'S = k ÷ (1 + e)',
        '{S} = {k} ÷ (1 + {e})',
        ['S', 'k', 'e'],
        (v) => v.S! * (1 + v.e!) - v.k!,
        {
          S: [
            (v) => div(v.k!, 1 + v.e!),
            '{k} ÷ (1 + {e})',
            'At θ = 180°, cos θ = −1: the bottom is 1 + e.',
          ],
          k: [(v) => v.S! * (1 + v.e!), '{S} × (1 + {e})', 'Multiply by the bottom, 1 + e.'],
        },
      ),
      rel(
        'a = (R + S) ÷ 2',
        '{a} = ({R} + {S}) ÷ 2',
        ['a', 'R', 'S'],
        (v) => 2 * v.a! - v.R! - v.S!,
        {
          a: [
            (v) => (v.R! + v.S!) / 2,
            '({R} + {S}) ÷ 2',
            'The vertices are on opposite sides of the focus: the major axis 2a is R + S.',
          ],
          R: [(v) => 2 * v.a! - v.S!, '2 × {a} − {S}', 'The major axis minus the near distance.'],
        },
      ),
      derive(
        'c = ae',
        '{c} = {a} × {e}',
        'c',
        ['a', 'e'],
        (v) => v.a! * v.e!,
        '{a} × {e}',
        'The center is ae from the focus: e is the share of a between the center and the focus.',
      ),
      derive(
        'b = √(RS)',
        '{b} = √({R} × {S})',
        'b',
        ['R', 'S'],
        (v) => Math.sqrt(v.R! * v.S!),
        '√({R} × {S})',
        'b² = a² − c² = (a + c)(a − c), and a + c = R, a − c = S.',
      ),
    ),
    example: { e: 0.5, k: 3, d: 6, R: 6, S: 2, a: 4, c: 2, b: Math.sqrt(12) },
    startWith: ['e', 'k'],
    representation: {
      kind: 'conicGraph',
      conic: 'ellipse',
      h: 'c',
      k: 0,
      a: 'a',
      b: 'b',
      c: 'c',
      fixed: true,
    },
  },
  {
    id: 'm.12.polar-conics~parabola',
    title: 'A polar parabola',
    use: 'Use this for “Find the vertex and the directrix of r = 4 ÷ (1 − cos θ), and the point at θ = 90°.”',
    assumptions: [
      'r = d ÷ (1 − cos θ) has e = 1: a parabola with its focus at the pole and directrix x = −d.',
      'Every point is as far from the focus as from the directrix.',
      'The vertex is halfway between them, at θ = 180°: r = d ÷ 2.',
    ],
    variables: [
      V('d', 'd', 'Distance from the focus to the directrix', { min: 0.01, max: 1000, step: 0.01 }),
      V('p', 'p', 'Distance from the vertex to the focus', {
        min: 0.005,
        max: 500,
        step: 0.01,
        derived: true,
      }),
      deg('t', 'θ', 'Angle', 10, 350),
      V('r', 'r', 'Distance from the pole', { min: 0, max: 100000, step: 0.01 }),
      coord('x', 'x', 'x of the point', 100000, { derived: true }),
      coord('y', 'y', 'y of the point', 100000, { derived: true }),
      V('h', 'h', 'x of the vertex', {
        min: -500,
        max: 0,
        step: 0.01,
        derived: true,
        hidden: true,
      }),
    ],
    ...rels(
      withStep(
        derive(
          'p = d ÷ 2',
          '{p} = {d} ÷ 2',
          'p',
          ['d'],
          (v) => v.d! / 2,
          '{d} ÷ 2',
          'The vertex is halfway from the focus to the directrix.',
        ),
        'p',
        {
          note: (v) =>
            v.d === undefined || v.p === undefined
              ? ''
              : `→ the vertex is (−${shown(v.p)}, 0): r = ${shown(v.p)} at θ = 180°; the directrix is x = −${shown(v.d)}`,
        },
      ),
      hide(
        derive(
          'h = −p',
          '{h} = −{p}',
          'h',
          ['p'],
          (v) => -v.p!,
          '−{p}',
          'The vertex, to draw the parabola.',
        ),
      ),
      rel(
        'r = d ÷ (1 − cos θ)',
        '{r} = {d} ÷ (1 − cos({t}))',
        ['r', 'd', 't'],
        (v) => v.r! * (1 - cosd(v.t!)) - v.d!,
        {
          r: [
            (v) => div(v.d!, 1 - cosd(v.t!)),
            '{d} ÷ (1 − cos({t}))',
            'Put the angle into the equation.',
          ],
          d: [
            (v) => v.r! * (1 - cosd(v.t!)),
            '{r} × (1 − cos({t}))',
            'Multiply both sides by the bottom.',
          ],
        },
      ),
      polarPartθ('x', 'r', 't', 'cos', 'Across: r times the cosine of the angle.'),
      polarPartθ('y', 'r', 't', 'sin', 'Up: r times the sine of the angle.'),
    ),
    example: { d: 4, p: 2, t: 90, r: 4, x: 0, y: 4, h: -2 },
    startWith: ['d', 't'],
    representation: {
      kind: 'conicGraph',
      conic: 'parabola',
      axis: 'horizontal',
      h: 'h',
      k: 0,
      p: 'p',
      point: { x: 'x', y: 'y' },
      fixed: true,
    },
  },
  {
    id: 'm.12.polar-conics~rotation',
    title: 'Rotating the axes',
    use: 'Use this for “Through what angle should the axes turn to remove the xy term of 4x² + 2xy + 2y² = 1? Which conic is it?”',
    assumptions: [
      'In Ax² + Bxy + Cy² + Dx + Ey + F = 0, turning the axes by θ with cot 2θ = (A − C) ÷ B removes the xy term.',
      'Take 2θ from 0° to 180°, so θ is from 0° to 90°; A = C gives θ = 45°.',
      'B² − 4AC names the conic: below 0 an ellipse, 0 a parabola, above 0 a hyperbola.',
    ],
    variables: [
      V('A', 'A', 'Number before x²', { min: -1000, max: 1000, step: 0.01 }),
      V('B', 'B', 'Number before xy', { min: -1000, max: 1000, step: 0.01 }),
      V('C', 'C', 'Number before y²', { min: -1000, max: 1000, step: 0.01 }),
      V('D', 'Δ', 'Discriminant B² − 4AC', {
        min: -5000000,
        max: 5000000,
        step: 0.01,
        derived: true,
      }),
      deg('t', 'θ', 'Angle to turn the axes', 0, 90, { derived: true }),
    ],
    ...rels(
      withStep(
        derive(
          'Δ = B² − 4AC',
          '{D} = {B}² − 4 × {A} × {C}',
          'D',
          ['B', 'A', 'C'],
          (v) => v.B! ** 2 - 4 * v.A! * v.C!,
          '{B}² − 4 × {A} × {C}',
          'Turning the axes changes A, B and C but not B² − 4AC, so it names the conic.',
        ),
        'D',
        // Only B = 0 with A = C is a circle (a turned circle keeps B = 0).
        {
          note: (v) =>
            v.D === undefined
              ? ''
              : `→ ${v.B === 0 && v.A === v.C && v.D < 0 ? 'a circle' : conicByDiscriminant(v.D)}`,
        },
      ),
      turnAngle,
    ),
    example: { A: 4, B: 2, C: 2, D: -28, t: 22.5 },
    startWith: ['A', 'B', 'C'],
    representation: { kind: 'unitCircle', angle: 't', fixed: true },
  },
  {
    id: 'm.12.polar-conics~rotated-equation',
    title: 'The equation after turning the axes',
    use: 'Use this for “Turn the axes to remove the xy term of 4x² + 2xy + 2y² = 1 and write the equation in x′ and y′.”',
    assumptions: [
      'Turning by θ puts x = x′ cos θ − y′ sin θ and y = x′ sin θ + y′ cos θ into the equation.',
      'With tan 2θ = B ÷ (A − C) the x′y′ term is 0, leaving A′x′² + C′y′² = −F.',
      'A′ + C′ = A + C: a quick check on the arithmetic.',
    ],
    variables: [
      V('A', 'A', 'Number before x²', { min: -1000, max: 1000, step: 0.01 }),
      V('B', 'B', 'Number before xy', { min: -1000, max: 1000, step: 0.01 }),
      V('C', 'C', 'Number before y²', { min: -1000, max: 1000, step: 0.01 }),
      deg('t', 'θ', 'Angle to turn the axes', 0, 90, { derived: true }),
      V('P', 'A′', 'Number before x′²', { min: -3000, max: 3000, step: 0.0001, derived: true }),
      V('Q', 'C′', 'Number before y′²', { min: -3000, max: 3000, step: 0.0001, derived: true }),
      V('F', 'F', 'Number alone', { min: -1000000, max: 1000000, step: 0.01 }),
    ],
    standalone: {
      vars: ['F'],
      why: 'The number alone has no x or y in it, so turning the axes leaves it as it is.',
    },
    ...rels(
      turnAngle,
      noXyTerm,
      withStep(
        derive(
          'A′ = A cos²θ + B sin θ cos θ + C sin²θ',
          '{P} = {A} × cos({t})² + {B} × sin({t}) × cos({t}) + {C} × sin({t})²',
          'P',
          ['A', 'B', 'C', 't'],
          (v) => v.A! * cosd(v.t!) ** 2 + v.B! * sind(v.t!) * cosd(v.t!) + v.C! * sind(v.t!) ** 2,
          '{A} × cos({t})² + {B} × sin({t}) × cos({t}) + {C} × sin({t})²',
          'Put x = x′ cos θ − y′ sin θ and y = x′ sin θ + y′ cos θ in, and collect the x′² terms.',
        ),
        'P',
        { work: rotatedWork('A′', 1) },
      ),
      withStep(
        derive(
          'C′ = A sin²θ − B sin θ cos θ + C cos²θ',
          '{Q} = {A} × sin({t})² − {B} × sin({t}) × cos({t}) + {C} × cos({t})²',
          'Q',
          ['A', 'B', 'C', 't'],
          (v) => v.A! * sind(v.t!) ** 2 - v.B! * sind(v.t!) * cosd(v.t!) + v.C! * cosd(v.t!) ** 2,
          '{A} × sin({t})² − {B} × sin({t}) × cos({t}) + {C} × cos({t})²',
          'Collect the y′² terms the same way; the signs of the sines change.',
        ),
        'Q',
        {
          work: rotatedWork('C′', -1),
          note: (v) =>
            v.P === undefined || v.Q === undefined
              ? ''
              : `→ ${fmt(v.P)}x′² ${v.Q < 0 ? '−' : '+'} ${fmt(Math.abs(v.Q))}y′² ${
                  v.F === undefined ? '+ F = 0' : `= ${fmt(-v.F)}`
                }, with A′ + C′ = A + C`,
        },
      ),
    ),
    example: {
      A: 4,
      B: 2,
      C: 2,
      t: 22.5,
      P: 3 + Math.SQRT2,
      Q: 3 - Math.SQRT2,
      F: -1,
    },
    startWith: ['A', 'B', 'C', 'F'],
    representation: { kind: 'unitCircle', angle: 't', fixed: true },
  },
];

// ── Partial fractions (added skill 16) ──

const coef = (id: string, symbol: string, name: string, range = 1000, extra = {}) =>
  V(id, symbol, name, { min: -range, max: range, step: 0.01, ...extra });

/** The top's zero z = −b ÷ a, worked out only to draw the graph. */
const topZero = hide(
  derive(
    'z = −b ÷ a',
    '{z} = −{b} ÷ {a}',
    'z',
    ['b', 'a'],
    (v) => div(-v.b!, v.a!),
    '−{b} ÷ {a}',
    'Where the top is 0, to draw the graph.',
  ),
);
const zeroVar = V('z', 'z', 'Zero of the top', {
  min: -1e9,
  max: 1e9,
  step: 0.0001,
  derived: true,
  hidden: true,
});
/** The graph's scale: the top's x term, or the number alone when the top has none. */
const leadVar = V('L', 'L', 'Leading number of the top', {
  min: -1000,
  max: 1000,
  step: 0.01,
  derived: true,
  hidden: true,
});
const topLead = hide(
  derive(
    'L = a, or b when a = 0',
    '{L} = {a} or {b}',
    'L',
    ['a', 'b'],
    (v) => (v.a !== 0 ? v.a! : v.b!),
    '{a}',
    'The top’s leading number, to draw the graph.',
  ),
);
/** The top ax + b is not 0 (then there is nothing to split). */
const topNotZero = limit(
  'top ≠ 0',
  'The top {a}x + {b} is not 0',
  ['a', 'b'],
  (v) => v.a !== 0 || v.b !== 0,
  'The top is 0, so the fraction is 0 everywhere: there is nothing to split.',
);

/** x² + jx + k at x. */
const quadAt = (v: Values, x: number) => x ** 2 + v.j! * x + v.k!;

const MATH_12_PARTIAL_FRACTIONS: ModuleDef[] = [
  // ── m.12.partial-fractions (A-APR.7 carried on) ──
  {
    id: 'm.12.partial-fractions',
    assumptions: [
      '(ax + b) ÷ ((x − p)(x − q)) = A ÷ (x − p) + B ÷ (x − q): one fraction for each linear factor.',
      'Cover-up: multiply by (x − p) and put x = p, so the B term drops out and A is left.',
      'Check by adding the two fractions back over the common bottom.',
      'If the top’s degree is not less than the bottom’s, divide first and split the remainder.',
    ],
    variables: [
      coef('a', 'a', 'Number before x on top'),
      coef('b', 'b', 'Number alone on top'),
      coef('p', 'p', 'Zero of the first factor', 100),
      coef('q', 'q', 'Zero of the second factor', 100),
      coef('A', 'A', 'Top of the first fraction', 1000000, { fraction: 200 }),
      coef('B', 'B', 'Top of the second fraction', 1000000, { fraction: 200 }),
      zeroVar,
      leadVar,
    ],
    ...rels(
      rel(
        'A = (ap + b) ÷ (p − q)',
        '{A} = ({a} × {p} + {b}) ÷ ({p} − {q})',
        ['A', 'a', 'p', 'b', 'q'],
        (v) => v.A! * (v.p! - v.q!) - (v.a! * v.p! + v.b!),
        {
          A: [
            (v) => div(v.a! * v.p! + v.b!, v.p! - v.q!),
            '({a} × {p} + {b}) ÷ ({p} − {q})',
            'Cover up (x − p) on the left and put x = p into what is left.',
          ],
          b: [
            (v) => v.A! * (v.p! - v.q!) - v.a! * v.p!,
            '{A} × ({p} − {q}) − {a} × {p}',
            'Multiply by p − q, then take ap away.',
          ],
        },
      ),
      rel(
        'B = (aq + b) ÷ (q − p)',
        '{B} = ({a} × {q} + {b}) ÷ ({q} − {p})',
        ['B', 'a', 'q', 'b', 'p'],
        (v) => v.B! * (v.q! - v.p!) - (v.a! * v.q! + v.b!),
        {
          B: [
            (v) => div(v.a! * v.q! + v.b!, v.q! - v.p!),
            '({a} × {q} + {b}) ÷ ({q} − {p})',
            'Cover up (x − q) and put x = q into what is left.',
          ],
          a: [
            (v) => div(v.B! * (v.q! - v.p!) - v.b!, v.q!),
            '({B} × ({q} − {p}) − {b}) ÷ {q}',
            'Multiply by q − p, take b away, then divide by q.',
          ],
        },
      ),
      limit(
        'p ≠ q',
        'The two factors {p} and {q} differ',
        ['p', 'q'],
        (v) => v.p !== v.q,
        'p = q is a repeated factor, (x − p)²: it needs A ÷ (x − p) + B ÷ (x − p)², the repeated-factor page.',
      ),
      topNotZero,
      topZero,
      topLead,
    ),
    example: { a: 5, b: 1, p: 1, q: -2, A: 2, B: 3, z: -0.2, L: 5 },
    startWith: ['a', 'b', 'p', 'q'],
    representation: {
      kind: 'functionGraph',
      family: 'rational',
      a: 'L',
      zeros: ['z'],
      poles: ['p', 'q'],
      marks: ['asymptotes'],
      fixed: true,
    },
  },
  {
    id: 'm.12.partial-fractions~repeated',
    title: 'A repeated factor',
    use: 'Use this for “Write (3x − 1) ÷ (x − 2)² as partial fractions.”',
    assumptions: [
      'A squared factor gets a fraction for each power: A ÷ (x − p) + B ÷ (x − p)².',
      'Multiply through by (x − p)²: ax + b = A(x − p) + B.',
      'Match the x terms for A, then put x = p for B.',
    ],
    variables: [
      coef('a', 'a', 'Number before x on top'),
      coef('b', 'b', 'Number alone on top'),
      coef('p', 'p', 'Zero of the factor', 100),
      coef('A', 'A', 'Top over (x − p)'),
      coef('B', 'B', 'Top over (x − p)²', 200000),
      zeroVar,
      leadVar,
    ],
    ...rels(
      rel('A = a', '{A} = {a}', ['A', 'a'], (v) => v.A! - v.a!, {
        A: [(v) => v.a!, '{a}', 'The x terms match: A(x − p) gives Ax, and the left has ax.'],
        a: [(v) => v.A!, '{A}', 'The x terms match.'],
      }),
      rel(
        'B = ap + b',
        '{B} = {a} × {p} + {b}',
        ['B', 'a', 'p', 'b'],
        (v) => v.B! - (v.a! * v.p! + v.b!),
        {
          B: [
            (v) => v.a! * v.p! + v.b!,
            '{a} × {p} + {b}',
            'Put x = p into ax + b = A(x − p) + B: the A term is 0, leaving B.',
          ],
          b: [(v) => v.B! - v.a! * v.p!, '{B} − {a} × {p}', 'Take ap from B.'],
          p: [(v) => div(v.B! - v.b!, v.a!), '({B} − {b}) ÷ {a}', 'Take b from B, divide by a.'],
        },
      ),
      topNotZero,
      topZero,
      topLead,
    ),
    example: { a: 3, b: -1, p: 2, A: 3, B: 5, z: 1 / 3, L: 3 },
    startWith: ['a', 'b', 'p'],
    representation: {
      kind: 'functionGraph',
      family: 'rational',
      a: 'L',
      zeros: ['z'],
      poles: ['p', 'p'],
      marks: ['asymptotes'],
      fixed: true,
    },
  },
  {
    id: 'm.12.partial-fractions~quadratic',
    title: 'A quadratic factor',
    use: 'Use this for “Write (3x² − 2x + 3) ÷ ((x − 1)(x² + 1)) as partial fractions.”',
    assumptions: [
      'A factor x² + jx + k that doesn’t split (j² < 4k) gets a linear top: A ÷ (x − p) + (Bx + C) ÷ (x² + jx + k).',
      'Cover up (x − p) and put x = p for A; then match the x² and x terms for B and C.',
      'The number terms must match too: Ak − Cp = c is the check.',
    ],
    variables: [
      coef('a', 'a', 'Number before x² on top', 1000, { group: 'top' }),
      coef('b', 'b', 'Number before x on top', 1000, { group: 'top' }),
      coef('c', 'c', 'Number on top', 1000, { group: 'top' }),
      coef('p', 'p', 'Zero of the linear factor', 100),
      coef('j', 'j', 'Number before x in the quadratic factor', 20, { group: 'quadratic' }),
      V('k', 'k', 'Number alone in the quadratic factor', {
        min: 0.01,
        max: 100,
        step: 0.01,
        group: 'quadratic',
      }),
      coef('A', 'A', 'Top over (x − p)', 1000000),
      coef('B', 'B', 'Number before x over the quadratic', 1000000),
      coef('C', 'C', 'Number alone over the quadratic', 100000000),
      coef('x', 'x', 'An x to check', 100),
      coef('y', 'y', 'The fraction’s value at x', 1e12, { derived: true }),
    ],
    ...rels(
      limit(
        'j² < 4k',
        '{j}² is less than 4 × {k}',
        ['j', 'k'],
        (v) => v.j! ** 2 < 4 * v.k!,
        'With j² ≥ 4k the quadratic splits into linear factors: use one fraction for each of them instead.',
      ),
      derive(
        'A = (ap² + bp + c) ÷ (p² + jp + k)',
        '{A} = ({a} × {p}² + {b} × {p} + {c}) ÷ ({p}² + {j} × {p} + {k})',
        'A',
        ['a', 'p', 'b', 'c', 'j', 'k'],
        (v) => div(v.a! * v.p! ** 2 + v.b! * v.p! + v.c!, v.p! ** 2 + v.j! * v.p! + v.k!),
        '({a} × {p}² + {b} × {p} + {c}) ÷ ({p}² + {j} × {p} + {k})',
        'Cover up (x − p) and put x = p: the top over what is left of the bottom.',
      ),
      derive(
        'B = a − A',
        '{B} = {a} − {A}',
        'B',
        ['a', 'A'],
        (v) => v.a! - v.A!,
        '{a} − {A}',
        'The x² terms: A(x² + jx + k) + (Bx + C)(x − p) has (A + B)x², so A + B = a.',
      ),
      withStep(
        derive(
          'C = b + Bp − Aj',
          '{C} = {b} + {B} × {p} − {A} × {j}',
          'C',
          ['b', 'B', 'p', 'A', 'j'],
          (v) => v.b! + v.B! * v.p! - v.A! * v.j!,
          '{b} + {B} × {p} − {A} × {j}',
          'The x terms: Ajx from the first fraction and (C − Bp)x from the second, so Aj + C − Bp = b.',
        ),
        'C',
        {
          note: (v) =>
            [v.A, v.k, v.C, v.p, v.c].some((x) => x === undefined)
              ? ''
              : `→ check: ${fmt(v.A!)} × ${par(v.k!)} − ${par(v.C!)} × ${par(v.p!)} = ${fmt(v.c!)}`,
        },
      ),
      withStep(
        rel(
          'y = (ax² + bx + c) ÷ ((x − p)(x² + jx + k))',
          '{y} = ({a} × {x}² + {b} × {x} + {c}) ÷ (({x} − {p}) × ({x}² + {j} × {x} + {k}))',
          ['y', 'a', 'x', 'b', 'c', 'p', 'j', 'k'],
          (v) => v.y! * (v.x! - v.p!) * quadAt(v, v.x!) - (v.a! * v.x! ** 2 + v.b! * v.x! + v.c!),
          {
            y: [
              (v) => div(v.a! * v.x! ** 2 + v.b! * v.x! + v.c!, (v.x! - v.p!) * quadAt(v, v.x!)),
              '({a} × {x}² + {b} × {x} + {c}) ÷ (({x} − {p}) × ({x}² + {j} × {x} + {k}))',
              'The fraction at one x; the two partial fractions add to the same number there.',
            ],
          },
          {
            message: (v) =>
              v.x !== undefined && v.x === v.p
                ? 'At x = p the bottom is 0: pick another x to check.'
                : undefined,
          },
        ),
        'y',
        {
          // The top and the bottom once each, then the quotient.
          work: (v) => {
            const top = v.a! * v.x! ** 2 + v.b! * v.x! + v.c!;
            const bottom = (v.x! - v.p!) * quadAt(v, v.x!);
            return [
              // The number alone first: every + is then followed by a product, so no part of
              // the line reads as a bare sum (the harness would add "2 + 3" in "… × 2 + 3").
              `Top: ${par(v.c!)} + ${par(v.b!)} × ${par(v.x!)} + ${par(v.a!)} × ${shown(v.x! ** 2)} = ${fmt(top)}`,
              `Bottom: ${par(v.x! - v.p!)} × ${par(quadAt(v, v.x!))} = ${fmt(bottom)}`,
              `y = ${par(top)} ÷ ${par(bottom)}`,
            ];
          },
          note: (v) =>
            [v.A, v.B, v.C, v.x, v.p, v.j, v.k].some((x) => x === undefined)
              ? ''
              : `→ A ÷ (x − p) + (Bx + C) ÷ (x² + jx + k) = ${fmt(v.A!)} ÷ ${par(v.x! - v.p!)} + (${fmt(v.B!)} × ${par(v.x!)} + ${par(v.C!)}) ÷ ${fmt(quadAt(v, v.x!))} = ${fmt(v.A! / (v.x! - v.p!) + (v.B! * v.x! + v.C!) / quadAt(v, v.x!))}`,
        },
      ),
    ),
    example: { a: 3, b: -2, c: 3, p: 1, j: 0, k: 1, A: 2, B: 1, C: -1, x: 2, y: 11 / 5 },
    startWith: ['a', 'b', 'c', 'p', 'j', 'k', 'x'],
    representation: {
      kind: 'table',
      sweep: 'x',
      output: 'y',
      params: ['a', 'b', 'c', 'p', 'j', 'k'],
      rows: (v: Values) => [-2, -1, 0, 1, 2, 3, 4].filter((x) => x !== v.p).slice(0, 5),
    },
  },
];

// ── Mathematical induction (added skill 17) ──

/**
 * The inductive step in numbers for a sum formula S(n): the formula at n, the next term, their
 * sum T, and the formula at n + 1, F. T = F is the step; the two are worked out separately.
 */
interface SumFormula {
  /** S(n) as the page writes it, with {n} (and {r}). */
  S: [display: string, f: (v: Values) => number, back?: [Solver, string, string]];
  /** The next term, a(n + 1). */
  a: [display: string, f: (v: Values) => number];
  /** S(n + 1). */
  F: [display: string, f: (v: Values) => number];
  /** What the formula is, for the steps. */
  what: string;
  /** The next term in words. */
  term: string;
  /** Extra inputs (the ratio r). */
  more?: string[];
  /** The inductive step in letters: formula at k + next term = formula at k + 1. */
  algebra: string[];
}
function inductionRels({ S, a, F, what, term, more = [], algebra }: SumFormula): Rel[] {
  const sym = (d: string) => d.replace(/\{(\w+)\}/g, '$1');
  return [
    withStep(
      rel(`S = ${sym(S[0])}`, `{S} = ${S[0]}`, ['S', 'n', ...more], (v) => v.S! - S[1](v), {
        S: [S[1], S[0], `The formula at n: ${what}.`],
        ...(S[2] ? { n: S[2] } : {}),
      }),
      'S',
      {
        // At n = 1 the sum is its first term alone: the base case, left side against right.
        note: (v) =>
          v.n === 1 && v.S !== undefined
            ? `→ base case: the left side is the first term, 1, and the formula gives ${fmt(v.S)}`
            : '',
      },
    ),
    derive(
      `a = ${sym(a[0])}`,
      `{a} = ${a[0]}`,
      'a',
      ['n', ...more],
      a[1],
      a[0],
      `The next term, number n + 1: ${term}.`,
    ),
    derive(
      'T = S + a',
      '{T} = {S} + {a}',
      'T',
      ['S', 'a'],
      (v) => v.S! + v.a!,
      '{S} + {a}',
      'If the formula holds at n, the sum through term n + 1 is S plus the next term.',
    ),
    withStep(
      derive(
        `F = ${sym(F[0])}`,
        `{F} = ${F[0]}`,
        'F',
        ['n', ...more],
        F[1],
        F[0],
        'The formula with n + 1 in place of n.',
      ),
      'F',
      {
        // The numbers are worked to the answer first; the step with k comes after it.
        note: (v) =>
          v.T === undefined || v.F === undefined
            ? ''
            : Math.abs(v.T - v.F) < 1e-9 * Math.max(1, Math.abs(v.F))
              ? `→ T = F = ${fmt(v.F)}: adding the next term gives the formula at n + 1. With k for n: ${algebra.join(' ')}`
              : `→ T = ${fmt(v.T)} is not F: the formula fails`,
      },
    ),
  ];
}

const count = (max: number) => V('n', 'n', 'Number of terms', { integer: true, min: 1, max });
const sumVar = (max: number, extra = {}) =>
  V('S', 'S', 'Sum of the first n terms', { integer: true, min: 1, max, ...extra });
const inductionVars = (max: number) => [
  V('a', 'a', 'Next term', { min: 1, max, step: 1, derived: true }),
  V('T', 'T', 'S plus the next term', { min: 1, max, step: 1, derived: true }),
  V('F', 'F', 'The formula at n + 1', { min: 1, max, step: 1, derived: true }),
];
const INDUCTION_WHY = [
  'Base case: check the formula at n = 1.',
  'Step: assume it holds at n = k; adding term k + 1 must give the formula at k + 1.',
];

const MATH_12_INDUCTION: ModuleDef[] = [
  // ── m.12.induction (Larson 9.4) ──
  {
    id: 'm.12.induction',
    assumptions: [
      ...INDUCTION_WHY,
      'Here: k(k + 1)/2 + (k + 1) = (k + 1)(k + 2)/2. Numbers check one case; the algebra proves every case.',
    ],
    variables: [count(30), sumVar(500), ...inductionVars(600)],
    ...rels(
      ...inductionRels({
        S: [
          '{n} × ({n} + 1) ÷ 2',
          (v) => (v.n! * (v.n! + 1)) / 2,
          [
            (v) => (Math.sqrt(1 + 8 * v.S!) - 1) / 2,
            '(√(1 + 8 × {S}) − 1) ÷ 2',
            'Solve n² + n = 2S for the positive n.',
          ],
        ],
        a: ['{n} + 1', (v) => v.n! + 1],
        F: ['({n} + 1) × ({n} + 2) ÷ 2', (v) => ((v.n! + 1) * (v.n! + 2)) / 2],
        what: '1 + 2 + … + n = n(n + 1)/2',
        term: 'the number n + 1 itself',
        algebra: ['k(k + 1)/2 + (k + 1) = (k + 1)(k + 2)/2'],
      }),
    ),
    example: { n: 4, S: 10, a: 5, T: 15, F: 15 },
    startWith: ['n'],
    representation: {
      kind: 'termsChart',
      type: 'arithmetic',
      first: 1,
      step: 1,
      count: 'n',
      as: 'bars',
      sums: true,
      sum: 'S',
    },
  },
  {
    id: 'm.12.induction~odd',
    title: 'The sum of odd numbers',
    use: 'Use this for “Prove 1 + 3 + 5 + … + (2n − 1) = n² by induction.”',
    assumptions: [
      ...INDUCTION_WHY,
      'Here: k² + (2k + 1) = (k + 1)², so the step holds for every k.',
    ],
    variables: [count(30), sumVar(900), ...inductionVars(1000)],
    ...rels(
      ...inductionRels({
        S: [
          '{n}²',
          (v) => v.n! ** 2,
          [(v) => Math.sqrt(v.S!), '√{S}', 'The square root of the sum.'],
        ],
        a: ['2 × {n} + 1', (v) => 2 * v.n! + 1],
        F: ['({n} + 1)²', (v) => (v.n! + 1) ** 2],
        what: '1 + 3 + … + (2n − 1) = n²',
        term: '2(n + 1) − 1 = 2n + 1',
        algebra: ['k² + (2k + 1) = (k + 1)²'],
      }),
    ),
    example: { n: 5, S: 25, a: 11, T: 36, F: 36 },
    startWith: ['n'],
    representation: {
      kind: 'termsChart',
      type: 'arithmetic',
      first: 1,
      step: 2,
      count: 'n',
      as: 'bars',
      sums: true,
      sum: 'S',
    },
  },
  {
    id: 'm.12.induction~powers',
    title: 'A geometric sum',
    use: 'Use this for “Prove 1 + 2 + 4 + … + 2ⁿ⁻¹ = 2ⁿ − 1 by induction.”',
    assumptions: [
      ...INDUCTION_WHY,
      'Here: (rᵏ − 1)/(r − 1) + rᵏ = (rᵏ⁺¹ − 1)/(r − 1), since rᵏ(r − 1) = rᵏ⁺¹ − rᵏ.',
    ],
    variables: [
      V('r', 'r', 'Ratio', { integer: true, min: 2, max: 10 }),
      count(20),
      sumVar(2e20, { integer: false, step: 1 }),
      V('a', 'a', 'Next term', { min: 1, max: 1e21, step: 1, derived: true }),
      V('T', 'T', 'S plus the next term', { min: 1, max: 1e21, step: 1, derived: true }),
      V('F', 'F', 'The formula at n + 1', { min: 1, max: 1e21, step: 1, derived: true }),
    ],
    ...rels(
      ...inductionRels({
        S: ['({r}^{n} − 1) ÷ ({r} − 1)', (v) => (v.r! ** v.n! - 1) / (v.r! - 1)],
        a: ['{r}^{n}', (v) => v.r! ** v.n!],
        F: ['({r}^({n} + 1) − 1) ÷ ({r} − 1)', (v) => (v.r! ** (v.n! + 1) - 1) / (v.r! - 1)],
        what: '1 + r + … + rⁿ⁻¹ = (rⁿ − 1)/(r − 1)',
        term: 'r to the power n',
        algebra: ['(rᵏ − 1)/(r − 1) + rᵏ = (rᵏ⁺¹ − 1)/(r − 1)'],
        more: ['r'],
      }),
    ),
    example: { r: 2, n: 5, S: 31, a: 32, T: 63, F: 63 },
    startWith: ['r', 'n'],
    representation: {
      kind: 'termsChart',
      type: 'geometric',
      first: 1,
      step: 'r',
      count: 'n',
      as: 'bars',
      sums: true,
      sum: 'S',
    },
  },
  {
    id: 'm.12.induction~squares',
    title: 'The sum of squares',
    use: 'Use this for “Prove 1² + 2² + … + n² = n(n + 1)(2n + 1)/6 by induction.”',
    assumptions: [
      ...INDUCTION_WHY,
      'Here: k(k + 1)(2k + 1)/6 + (k + 1)² = (k + 1)(k + 2)(2k + 3)/6; factor out k + 1 to see it.',
    ],
    variables: [count(1000), sumVar(400000000), ...inductionVars(500000000)],
    ...rels(
      ...inductionRels({
        S: ['{n} × ({n} + 1) × (2 × {n} + 1) ÷ 6', (v) => (v.n! * (v.n! + 1) * (2 * v.n! + 1)) / 6],
        a: ['({n} + 1)²', (v) => (v.n! + 1) ** 2],
        F: [
          '({n} + 1) × ({n} + 2) × (2 × {n} + 3) ÷ 6',
          (v) => ((v.n! + 1) * (v.n! + 2) * (2 * v.n! + 3)) / 6,
        ],
        what: '1² + 2² + … + n² = n(n + 1)(2n + 1)/6',
        term: '(n + 1)²',
        algebra: [
          'k(k + 1)(2k + 1)/6 + (k + 1)² = (k + 1)(2k² + 7k + 6)/6',
          '= (k + 1)(k + 2)(2k + 3)/6, since 2k² + 7k + 6 = (k + 2)(2k + 3)',
        ],
      }),
    ),
    example: { n: 3, S: 14, a: 16, T: 30, F: 30 },
    startWith: ['n'],
    representation: {
      kind: 'table',
      sweep: 'n',
      output: 'S',
      params: [],
      rows: (v: Values) => [1, 2, 3, 4, 5].map((i) => Math.max(0, (v.n ?? 3) - 3) + i),
    },
  },
  {
    id: 'm.12.induction~divisible',
    title: 'A divisibility proof',
    use: 'Use this for “Prove that n³ − n is divisible by 3 for every whole number n ≥ 1.”',
    assumptions: [
      'Base case: at n = 1, 1³ − 1 = 0, and 0 = 3 × 0 is divisible by 3.',
      'Step: f(k + 1) = f(k) + 3k(k + 1), so if 3 divides f(k) it divides f(k + 1).',
      'The numbers check the step at one n; the algebra with k proves every case.',
    ],
    variables: [
      V('n', 'n', 'Whole number n', { integer: true, min: 1, max: 30 }),
      V('f', 'f(n)', 'n³ − n', { integer: true, min: 0, max: 27000, derived: true }),
      V('g', 'q', 'f(n) divided by 3', { integer: true, min: 0, max: 9000, derived: true }),
      V('F', 'f(n + 1)', 'The next one, (n + 1)³ − (n + 1)', {
        integer: true,
        min: 6,
        max: 30000,
        derived: true,
      }),
      V('D', 'D', 'The jump f(n + 1) − f(n)', { integer: true, min: 6, max: 3000, derived: true }),
    ],
    ...rels(
      withStep(
        derive(
          'f(n) = n³ − n',
          '{f} = {n}³ − {n}',
          'f',
          ['n'],
          (v) => v.n! ** 3 - v.n!,
          '{n}³ − {n}',
          'Put n into the expression.',
        ),
        'f',
        {
          note: (v) => (v.n === 1 ? '→ base case: 0 = 3 × 0, a multiple of 3' : ''),
        },
      ),
      derive(
        'q = f(n) ÷ 3',
        '{g} = {f} ÷ 3',
        'g',
        ['f'],
        (v) => v.f! / 3,
        '{f} ÷ 3',
        'A whole number: 3 divides f(n) at this n.',
      ),
      derive(
        'f(n + 1) = (n + 1)³ − (n + 1)',
        '{F} = ({n} + 1)³ − ({n} + 1)',
        'F',
        ['n'],
        (v) => (v.n! + 1) ** 3 - (v.n! + 1),
        '({n} + 1)³ − ({n} + 1)',
        'The expression at the next whole number.',
      ),
      withStep(
        derive(
          'D = f(n + 1) − f(n)',
          '{D} = {F} − {f}',
          'D',
          ['F', 'f'],
          (v) => v.F! - v.f!,
          '{F} − {f}',
          'The step: how much the expression grows from n to n + 1.',
        ),
        'D',
        {
          // The algebra with k, then the same jump in numbers, ending at the answer.
          work: (v) => [
            'With k for n: (k + 1)³ − (k + 1) − (k³ − k) = 3k² + 3k = 3k(k + 1)',
            `3n(n + 1) = 3 × ${shown(v.n!)} × ${shown(v.n! + 1)} = ${shown(3 * v.n! * (v.n! + 1))}`,
          ],
          note: (v) =>
            v.D === undefined
              ? ''
              : '→ f(n + 1) = f(n) + 3n(n + 1): a multiple of 3 plus a multiple of 3 is a multiple of 3',
        },
      ),
    ),
    example: { n: 4, f: 60, g: 20, F: 120, D: 60 },
    startWith: ['n'],
    representation: {
      kind: 'table',
      sweep: 'n',
      output: 'g',
      params: [],
      rows: (v: Values) => [1, 2, 3, 4, 5].map((i) => Math.max(0, (v.n ?? 4) - 3) + i),
    },
  },
];

// ── The area under a curve, limits of sequences (added skill 18) ──

const rectangles = V('n', 'n', 'Number of rectangles', { integer: true, min: 1, max: 1000 });
const widthOf = derive(
  'w = b ÷ n',
  '{w} = {b} ÷ {n}',
  'w',
  ['b', 'n'],
  (v) => div(v.b!, v.n!),
  '{b} ÷ {n}',
  'Cut 0 to b into n strips of equal width.',
);
/** Once the exact area is known, S against it: the more rectangles, the closer. */
const towardA = (v: Values) =>
  v.S === undefined || v.A === undefined
    ? ''
    : Math.abs(v.S - v.A) <= 1e-9 * Math.max(1, Math.abs(v.A))
      ? '→ S equals the exact area: a flat line is covered exactly'
      : `→ S = ${fmt(v.S)} is ${v.S > v.A ? 'above' : 'below'} the exact area; more rectangles bring S closer to it`;

/** The limit of (pnʲ + q) ÷ (rnᵏ + s): p ÷ r for equal powers, 0 for a bigger bottom, none else. */
const degreeLimit = (v: Values) => (v.j === v.k ? div(v.p!, v.r!) : v.j! < v.k! ? 0 : undefined);

/** 1 + 2 + … + n (or with squares, power "²"), written out in full up to three terms. */
const termsTo = (n: number, power = '') =>
  n <= 3
    ? Array.from({ length: n }, (_, i) => `${i + 1}${power}`).join(' + ')
    : `1${power} + 2${power} + … + ${shown(n)}${power}`;

/**
 * "1 + 2 + … + 8 = 8 × 9 ÷ 2 = 36"; up to three terms the sum is short enough to add as it
 * is ("1 + 2 = 3"), and one term needs no line.
 */
const sumLine = (n: number, power: string, formula: string, value: number): string[] =>
  n === 1
    ? []
    : n <= 3
      ? [`${termsTo(n, power)} = ${shown(value)}`]
      : [`${termsTo(n, power)} = ${formula} = ${shown(value)}`];

const MATH_12_AREA: ModuleDef[] = [
  // ── m.12.area-under-curve (Larson 12.4–12.5) ──
  {
    id: 'm.12.area-under-curve',
    assumptions: [
      'Cut 0 to b into n strips of width w = b ÷ n; each rectangle is as tall as the curve at its right edge, x = iw.',
      'The heights add with Σi² = n(n + 1)(2n + 1)/6, so S = cw³ × n(n + 1)(2n + 1)/6.',
      'As n → ∞, S → cb³/3: the exact area under y = cx² from 0 to b.',
    ],
    variables: [
      V('c', 'c', 'Number before x²', { min: 0.01, max: 1000, step: 0.01 }),
      V('b', 'b', 'Right end', { min: 0.01, max: 100, step: 0.01 }),
      rectangles,
      V('w', 'w', 'Width of each rectangle', { min: 0, max: 100, step: 0.0001, derived: true }),
      V('S', 'S', 'Sum of the rectangles', {
        min: 0,
        max: 1e12,
        step: 0.0001,
        derived: true,
      }),
      V('A', 'A', 'Exact area', { min: 0, max: 1e12, step: 0.0001 }),
    ],
    ...rels(
      widthOf,
      withStep(
        derive(
          'S = cw³ × n(n + 1)(2n + 1) ÷ 6',
          '{S} = {c} × {w}³ × {n} × ({n} + 1) × (2 × {n} + 1) ÷ 6',
          'S',
          ['c', 'w', 'n'],
          (v) => (v.c! * v.w! ** 3 * v.n! * (v.n! + 1) * (2 * v.n! + 1)) / 6,
          '{c} × {w}³ × {n} × ({n} + 1) × (2 × {n} + 1) ÷ 6',
          'Each rectangle is w wide and c(iw)² tall; adding them gives cw³(1² + 2² + … + n²).',
        ),
        'S',
        {
          // The sum of squares is the idea of the step: work it out as a number first, named.
          work: (v) => {
            const sq = (v.n! * (v.n! + 1) * (2 * v.n! + 1)) / 6;
            return [
              ...sumLine(
                v.n!,
                '²',
                `${shown(v.n!)} × ${shown(v.n! + 1)} × ${shown(2 * v.n! + 1)} ÷ 6`,
                sq,
              ),
              `S = ${shown(v.c!)} × ${shown(v.w!)}³ × ${shown(sq)}`,
              `S = ${shown(exact(v.c! * v.w! ** 3))} × ${shown(sq)}`,
            ];
          },
        },
      ),
      withStep(
        rel(
          'A = cb³ ÷ 3',
          '{A} = {c} × {b}³ ÷ 3',
          ['A', 'c', 'b'],
          (v) => v.A! - (v.c! * v.b! ** 3) / 3,
          {
            A: [
              (v) => (v.c! * v.b! ** 3) / 3,
              '{c} × {b}³ ÷ 3',
              'The limit as n → ∞: n(n + 1)(2n + 1) ÷ n³ goes to 2, so S goes to cb³ × 2 ÷ 6.',
            ],
            b: [
              (v) => Math.cbrt((3 * v.A!) / v.c!),
              '∛(3 × {A} ÷ {c})',
              'Multiply by 3, divide by c, then take the cube root.',
            ],
            c: [(v) => div(3 * v.A!, v.b! ** 3), '3 × {A} ÷ {b}³', 'Multiply by 3, divide by b³.'],
          },
        ),
        'A',
        { note: towardA },
      ),
    ),
    example: { c: 1, b: 3, n: 6, w: 0.5, S: 11.375, A: 9 },
    startWith: ['c', 'b', 'n'],
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'vertex',
      a: 'c',
      h: 0,
      k: 0,
      shade: { from: 0, to: 'b' },
      fixed: true,
    },
  },
  {
    id: 'm.12.area-under-curve~line',
    title: 'The area under a line',
    use: 'Use this for “Estimate the area under y = 2x + 1 from 0 to 4 with 8 rectangles, then find it exactly.”',
    assumptions: [
      'Right-edge rectangles of width w = b ÷ n: heights m(iw) + k, for i = 1 to n.',
      'Σi = n(n + 1)/2 adds them: S = mw² × n(n + 1)/2 + kb.',
      'As n → ∞, S → mb²/2 + kb, the trapezoid’s area; the line stays on or above the x-axis here.',
    ],
    variables: [
      V('m', 'm', 'Slope', { min: -100, max: 100, step: 0.01 }),
      V('k', 'k', 'y-intercept', { min: 0, max: 1000, step: 0.01 }),
      V('b', 'b', 'Right end', { min: 0.01, max: 100, step: 0.01 }),
      rectangles,
      V('w', 'w', 'Width of each rectangle', { min: 0, max: 100, step: 0.0001, derived: true }),
      V('S', 'S', 'Sum of the rectangles', {
        min: 0,
        max: 1e9,
        step: 0.0001,
        derived: true,
      }),
      V('A', 'A', 'Exact area', { min: 0, max: 1e9, step: 0.0001, derived: true }),
    ],
    ...rels(
      widthOf,
      withStep(
        derive(
          'S = mw² × n(n + 1) ÷ 2 + kb',
          '{S} = {m} × {w}² × {n} × ({n} + 1) ÷ 2 + {k} × {b}',
          'S',
          ['m', 'w', 'n', 'k', 'b'],
          (v) => (v.m! * v.w! ** 2 * v.n! * (v.n! + 1)) / 2 + v.k! * v.b!,
          '{m} × {w}² × {n} × ({n} + 1) ÷ 2 + {k} × {b}',
          'Each rectangle is w by m(iw) + k; the m parts add to mw²(1 + 2 + … + n), the k parts to kb.',
        ),
        'S',
        {
          // The sum 1 + 2 + … + n as a number first, as on the main page.
          work: (v) => {
            const tri = (v.n! * (v.n! + 1)) / 2;
            const first = exact(v.m! * v.w! ** 2 * tri);
            const second = exact(v.k! * v.b!);
            return [
              ...sumLine(v.n!, '', `${shown(v.n!)} × ${shown(v.n! + 1)} ÷ 2`, tri),
              `S = ${shown(v.m!)} × ${shown(v.w!)}² × ${shown(tri)} + ${shown(v.k!)} × ${shown(v.b!)}`,
              `S = ${shown(first)} + ${shown(second)}`,
            ];
          },
        },
      ),
      withStep(
        derive(
          'A = mb² ÷ 2 + kb',
          '{A} = {m} × {b}² ÷ 2 + {k} × {b}',
          'A',
          ['m', 'b', 'k'],
          (v) => (v.m! * v.b! ** 2) / 2 + v.k! * v.b!,
          '{m} × {b}² ÷ 2 + {k} × {b}',
          'The limit: n(n + 1) ÷ n² goes to 1. It is also the trapezoid with heights k and mb + k.',
        ),
        'A',
        { note: towardA },
      ),
      limit(
        'mb + k ≥ 0',
        'The line is on or above the x-axis at b: {m} × {b} + {k} ≥ 0',
        ['m', 'b', 'k'],
        (v) => v.m! * v.b! + v.k! >= 0,
        'The line dips below the x-axis before b: this page adds areas above the axis only.',
      ),
    ),
    example: { m: 2, k: 1, b: 4, n: 8, w: 0.5, S: 22, A: 20 },
    startWith: ['m', 'k', 'b', 'n'],
    representation: {
      kind: 'functionGraph',
      family: 'linear',
      m: 'm',
      b: 'k',
      shade: { from: 0, to: 'b' },
      fixed: true,
    },
  },
  {
    id: 'm.12.area-under-curve~degrees',
    title: 'Limits at infinity by degree',
    use: 'Use this for “Find the limit of (3n + 1) ÷ (2n − 1) as n → ∞” or “of (2n² + 1) ÷ (n² − 3), or say there is none.”',
    assumptions: [
      'Divide the top and bottom by the bottom’s highest power of n; every term with n left under it goes to 0.',
      'Same power on top and bottom: the limit is the ratio of the leading numbers. A higher power in the bottom: 0.',
      'A higher power on top: the terms grow without bound, so there is no limit.',
    ],
    variables: [
      coef('p', 'p', 'Leading number on top', 100),
      V('j', 'j', 'Power of n on top', { integer: true, min: 0, max: 3 }),
      coef('q', 'q', 'Constant on top', 1000),
      coef('r', 'r', 'Leading number in the bottom', 100),
      V('k', 'k', 'Power of n in the bottom', { integer: true, min: 0, max: 3 }),
      coef('s', 's', 'Constant in the bottom', 1000),
      V('n', 'n', 'Term number', { integer: true, min: 1, max: 1000000 }),
      coef('a', 'aₙ', 'Term n', 1e21),
      coef('L', 'L', 'Limit', 1e6, { derived: true }),
    ],
    ...rels(
      rel(
        'aₙ = (pnʲ + q) ÷ (rnᵏ + s)',
        '{a} = ({p} × {n}^{j} + {q}) ÷ ({r} × {n}^{k} + {s})',
        ['a', 'p', 'n', 'j', 'q', 'r', 'k', 's'],
        (v) => v.a! * (v.r! * v.n! ** v.k! + v.s!) - (v.p! * v.n! ** v.j! + v.q!),
        {
          a: [
            (v) => div(v.p! * v.n! ** v.j! + v.q!, v.r! * v.n! ** v.k! + v.s!),
            '({p} × {n}^{j} + {q}) ÷ ({r} × {n}^{k} + {s})',
            'Put n into the rule.',
          ],
        },
        {
          message: (v) =>
            [v.r, v.n, v.k, v.s].every((x) => x !== undefined) && v.r! * v.n! ** v.k! + v.s! === 0
              ? 'The bottom is 0 for this n: that term doesn’t exist.'
              : undefined,
        },
      ),
      withStep(
        withCheck(
          rel(
            'L by degree',
            '{L} = {p} ÷ {r} if {j} = {k}, 0 if {j} < {k}',
            ['L', 'p', 'j', 'r', 'k'],
            (v) => v.L! - (degreeLimit(v) ?? NaN),
            {
              L: [
                (v) => degreeLimit(v),
                (v: Values) => (v.j === v.k ? '{p} ÷ {r}' : '0'),
                'Compare the powers: equal gives the leading numbers’ ratio, a higher power in the bottom gives 0.',
              ],
            },
            {
              explain: (v) =>
                v.j !== undefined && v.k !== undefined && v.j > v.k
                  ? 'The top’s power is higher, so the terms grow without bound: there is no limit.'
                  : undefined,
            },
          ),
          (v) => (v.j === v.k ? `${fmt(v.L!)} = ${fmt(v.p!)} ÷ ${par(v.r!)}` : `${fmt(v.L!)} = 0`),
        ),
        'L',
        {
          note: (v) =>
            v.j === undefined || v.k === undefined
              ? ''
              : v.j === v.k
                ? `→ equal powers: divide the top and bottom by ${v.k === 1 ? 'n' : superscript(`n^${v.k}`)}, and only ${shown(v.p!)} ÷ ${par(v.r!)} is left`
                : '→ the bottom’s power is higher: the bottom outgrows the top',
        },
      ),
      limit(
        'p ≠ 0, r ≠ 0',
        'The leading numbers {p} and {r} are not 0',
        ['p', 'r'],
        (v) => v.p !== 0 && v.r !== 0,
        'A leading number of 0 means that power isn’t there: type the highest power the expression really has.',
      ),
      limit(
        'j + k > 0',
        'There is an n on top or in the bottom: {j} + {k} > 0',
        ['j', 'k'],
        (v) => v.j! + v.k! > 0,
        'With both powers 0 there is no n left: the expression is the number (p + q) ÷ (r + s).',
      ),
    ),
    example: { p: 2, j: 2, q: 1, r: 1, k: 2, s: -3, n: 10, a: 201 / 97, L: 2 },
    startWith: ['p', 'j', 'q', 'r', 'k', 's', 'n'],
    representation: {
      kind: 'table',
      sweep: 'n',
      output: 'a',
      params: ['p', 'j', 'q', 'r', 'k', 's'],
      rows: [1, 10, 100, 1000],
    },
  },
];

// ── Inference for the slope of a regression line (added skill 19) ──

/** df = n − 2: the line's slope and intercept use up two degrees of freedom. */
const dfLine = derive(
  'df = n − 2',
  '{df} = {n} − 2',
  'df',
  ['n'],
  (v) => v.n! - 2,
  '{n} − 2',
  'The fitted line uses up two degrees of freedom, its slope and its intercept.',
);
const pointsVar = V('n', 'n', 'Number of data points', { integer: true, min: 3, max: 1000 });
const dfVar = V('df', 'df', 'Degrees of freedom', {
  integer: true,
  min: 1,
  max: 998,
  derived: true,
});
const slopeVar = V('b', 'b', 'Sample slope', { min: -1000000, max: 1000000, step: 0.001 });
const seSlope = (extra = {}) =>
  V('E', 'SE_b', 'Standard error of the slope', {
    min: 0.000001,
    max: 1000000,
    step: 0.001,
    ...extra,
  });
/** t = b ÷ SE_b: how many standard errors the slope is from 0. */
const tSlope = rel('t = b ÷ SE_b', '{t} = {b} ÷ {E}', ['t', 'b', 'E'], (v) => v.t! * v.E! - v.b!, {
  t: [
    (v) => div(v.b!, v.E!),
    '{b} ÷ {E}',
    'How many standard errors the sample slope is from 0, the slope H₀ claims.',
  ],
  b: [(v) => v.t! * v.E!, '{t} × {E}', 'Go t standard errors from 0.'],
});
const slopeCurve = {
  kind: 'normalCurve',
  mean: 0,
  sd: 'E',
  axis: 'Sample slope b if β = 0',
  mark: { x: 'b' },
  fixed: true,
} as const;

/** The side of Hₐ, coded as a choice: 0 for ≠, 1 for >, −1 for <. */
const sideVar = (what: string) =>
  V('h', 'Hₐ', `Hₐ: ${what} ≠ 0 (0), > 0 (1) or < 0 (−1)`, {
    integer: true,
    min: -1,
    max: 1,
    allowed: [-1, 0, 1],
  });
/** The t tail Hₐ asks for: both tails past |t|, the right tail, or the left tail. */
const tTail = (v: Values) =>
  v.h === 0
    ? 2 * (1 - tCdf(Math.abs(v.t!), v.df!))
    : v.h! > 0
      ? 1 - tCdf(v.t!, v.df!)
      : tCdf(v.t!, v.df!);
/**
 * The tail worked from tcdf's value: "P = 2 × (1 − 0.997519)", "P = 2 × 0.002481" (h 0), or
 * "P = 1 − 0.997519" (h 1). Nothing when the tail is under 0.0001 (P < 0.0001) or for h −1,
 * where tcdf is the answer itself.
 */
const tTailWork = (v: Values): string[] => {
  if (v.t === undefined || v.df === undefined || v.h === -1) return [];
  const c = tCdf(v.h === 0 ? Math.abs(v.t) : v.t, v.df);
  const tail = 1 - c;
  if (tail < 0.0001) return [];
  // Enough decimals that the tail keeps 4 significant figures.
  const d = Math.max(4, 3 - Math.floor(Math.log10(tail)));
  // Written out to d decimals (the box's 4 figures would round 0.997519 to 0.9975).
  const cut = (x: number) => String(Number(x.toFixed(d)));
  return v.h === 0 ? [`P = 2 × (1 − ${cut(c)})`, `P = 2 × ${cut(tail)}`] : [`P = 1 − ${cut(c)}`];
};
const tSided = withCheck(
  derive(
    'P = the t tail on the side of Hₐ',
    '{P} = the t tail past {t} on {h}’s side, with {df} degrees of freedom',
    'P',
    ['t', 'df', 'h'],
    tTail,
    (v: Values) =>
      v.h === 0
        ? '2 × (1 − tcdf(|{t}|, {df}))'
        : v.h! > 0
          ? '1 − tcdf({t}, {df})'
          : 'tcdf({t}, {df})',
    'Hₐ ≠ counts both tails past |t|; Hₐ > the area right of t; Hₐ < the area left of t (tcdf is the area left).',
  ),
  (v) => {
    const [t, df] = [shown(v.t!), shown(v.df!)];
    const P = shown(v.P!);
    return v.h === 0
      ? `${P} = 2 × (1 − tcdf(|${t}|, ${df}))`
      : v.h! > 0
        ? `${P} = 1 − tcdf(${t}, ${df})`
        : `${P} = tcdf(${t}, ${df})`;
  },
);
/**
 * The decision in context: below α is convincing evidence of the relationship Hₐ names. It
 * opens with Hₐ in words (the box shows its code), as "Hₐ: β ≠ 0, two tails".
 */
const decideSlope =
  (what = 'β') =>
  (v: Values) => {
    if (v.P === undefined || v.a === undefined) return '';
    const kind = v.h === 1 ? 'a positive ' : v.h === -1 ? 'a negative ' : 'a ';
    const side =
      v.h === 1
        ? `Hₐ: ${what} > 0, the right tail`
        : v.h === -1
          ? `Hₐ: ${what} < 0, the left tail`
          : `Hₐ: ${what} ≠ 0, two tails`;
    // A p-value is never 0: one the box rounds to 0 is written P < 0.0001.
    const tiny = v.P < 0.0001 ? 'P < 0.0001, ' : '';
    return v.P < v.a
      ? `→ ${side}: ${tiny}below α = ${fmt(v.a)}, so reject H₀: convincing evidence of ${kind}linear relationship between x and y`
      : `→ ${side}: not below α = ${fmt(v.a)}, so fail to reject H₀: not convincing evidence of ${kind}linear relationship`;
  };
const slopeP = (what: string) =>
  withStep(tSided, 'P', { work: tTailWork, note: decideSlope(what) });
/** t on the slope pages: past ±1000 when SE_b is tiny, never a reason to clear an input. */
const tSlopeVar = () => ({ ...tVar(), min: -1e9, max: 1e9 });

const MATH_12_REGRESSION: ModuleDef[] = [
  // ── m.12.regression-inference (S-ID.8 carried on; AP Statistics unit 9) ──
  {
    id: 'm.12.regression-inference',
    assumptions: [
      'H₀: β = 0 (no linear relationship); Hₐ is β ≠ 0, or β > 0 (β < 0) for a positive (negative) one.',
      't = b ÷ SE_b follows a t curve with df = n − 2.',
      'The points scatter evenly about a straight line, with residuals close to normal and independent.',
    ],
    variables: [
      slopeVar,
      seSlope(),
      pointsVar,
      dfVar,
      tSlopeVar(),
      sideVar('β'),
      prob('P', 'P', 'p-value', { derived: true }),
      alphaVar,
    ],
    ...rels(dfLine, tSlope, slopeP('β')),
    standalone: { vars: ['a'], why: ALPHA_WHY },
    example: {
      b: 0.8,
      E: 0.25,
      n: 20,
      df: 18,
      t: 3.2,
      h: 0,
      P: 2 * (1 - tCdf(3.2, 18)),
      a: 0.05,
    },
    startWith: ['b', 'E', 'n', 'h', 'a'],
    representation: slopeCurve,
  },
  {
    id: 'm.12.regression-inference~interval',
    title: 'Confidence interval for the slope',
    use: 'Use this for “b = 0.8 and SE_b = 0.25 from 20 points. Find a 95% confidence interval for the slope.”',
    assumptions: [
      'The interval is b ± t⋆ × SE_b, with t⋆ from the t curve with df = n − 2.',
      'An interval that doesn’t hold 0 means the slope is not 0 at that level.',
      'The same conditions as the test: a straight-line pattern, even scatter, close to normal residuals.',
    ],
    variables: [
      slopeVar,
      V('SE', 'SE_b', 'Standard error of the slope', {
        min: 0.000001,
        max: 1000000,
        step: 0.001,
      }),
      pointsVar,
      V('C', 'C', 'Confidence level', {
        allowed: [0.9, 0.95, 0.99],
        min: 0.9,
        max: 0.99,
        multipleOf: 0.01,
      }),
      dfVar,
      V('ts', 't⋆', 'Critical value', { min: 0.1, max: 700, step: 0.001, derived: true }),
      // Room for t⋆ = 63.66 (n = 3, 99%) times a big SE_b, so a typed 99% is never replaced.
      V('E', 'E', 'Margin of error', { min: 0.000001, max: 1e8, step: 0.001, derived: true }),
      V('lo', 'L', 'Lower end', { min: -1e8, max: 1e8, step: 0.001, derived: true }),
      V('hi', 'U', 'Upper end', { min: -1e8, max: 1e8, step: 0.001, derived: true }),
    ],
    ...rels(
      dfLine,
      tCritical,
      rel('E = t⋆ × SE_b', '{E} = {ts} × {SE}', ['E', 'ts', 'SE'], (v) => v.E! - v.ts! * v.SE!, {
        E: [(v) => v.ts! * v.SE!, '{ts} × {SE}', 'The margin of error is t⋆ standard errors.'],
        SE: [(v) => div(v.E!, v.ts!), '{E} ÷ {ts}', 'Divide the margin by t⋆.'],
      }),
      end('lo', 'b', 'E', -1),
      withStep(end('hi', 'b', 'E', 1), 'hi', {
        note: (v) =>
          v.lo === undefined || v.hi === undefined || v.C === undefined
            ? ''
            : v.lo > 0 || v.hi < 0
              ? `→ 0 is not between ${shown(v.lo)} and ${shown(v.hi)}: the slope differs from 0 at the ${shown(v.C * 100)}% level`
              : `→ 0 is between ${shown(v.lo)} and ${shown(v.hi)}: a slope of 0 can’t be ruled out at the ${shown(v.C * 100)}% level`,
      }),
      ordered,
    ),
    example: {
      b: 0.8,
      SE: 0.25,
      n: 20,
      C: 0.95,
      df: 18,
      ts: tStar(0.95, 18),
      E: tStar(0.95, 18) * 0.25,
      lo: 0.8 - tStar(0.95, 18) * 0.25,
      hi: 0.8 + tStar(0.95, 18) * 0.25,
    },
    startWith: ['b', 'SE', 'n', 'C'],
    equation: '{b} ± {ts} × {SE}',
    representation: {
      kind: 'normalCurve',
      mean: 'b',
      sd: 'SE',
      axis: 'Sample slope b',
      interval: { center: 'b', margin: 'E' },
      fixed: true,
    },
  },
  {
    id: 'm.12.regression-inference~correlation',
    title: 'Is the correlation significant?',
    use: 'Use this for “r = 0.6 for 18 pairs of data. Is the correlation significant at 0.05?”',
    assumptions: [
      'H₀: ρ = 0 (no linear relationship in the population); Hₐ is ρ ≠ 0, ρ > 0 or ρ < 0.',
      't = r√(n − 2) ÷ √(1 − r²), with df = n − 2: the same t as the slope test.',
      'The pairs are a random sample and the scatter follows a straight-line pattern.',
    ],
    variables: [
      V('r', 'r', 'Correlation coefficient', { min: -0.9999, max: 0.9999, step: 0.0001 }),
      pointsVar,
      dfVar,
      tSlopeVar(),
      sideVar('ρ'),
      prob('P', 'P', 'p-value', { derived: true }),
      alphaVar,
    ],
    ...rels(
      dfLine,
      rel(
        't = r√df ÷ √(1 − r²)',
        '{t} = {r} × √{df} ÷ √(1 − {r}²)',
        ['t', 'r', 'df'],
        (v) => v.t! * Math.sqrt(1 - v.r! ** 2) - v.r! * Math.sqrt(v.df!),
        {
          t: [
            (v) => div(v.r! * Math.sqrt(v.df!), Math.sqrt(1 - v.r! ** 2)),
            '{r} × √{df} ÷ √(1 − {r}²)',
            'A strong r or many points make t large; √(1 − r²) shrinks as r nears ±1.',
          ],
        },
      ),
      slopeP('ρ'),
    ),
    standalone: { vars: ['a'], why: ALPHA_WHY },
    example: { r: 0.6, n: 18, df: 16, t: 3, h: 0, P: 2 * (1 - tCdf(3, 16)), a: 0.05 },
    startWith: ['r', 'n', 'h', 'a'],
    representation: {
      kind: 'normalCurve',
      axis: 'Test statistic t if ρ = 0',
      mark: { x: 't' },
      fixed: true,
    },
  },
  {
    id: 'm.12.regression-inference~standard-error',
    title: 'The standard error of the slope',
    use: 'Use this for “The residuals have s = 2, the x values have sₓ = 1.5 and n = 10. Is b = 1.2 significant?”',
    assumptions: [
      'SE_b = s ÷ (sₓ√(n − 1)): s is the spread of the residuals, sₓ the spread of the x values.',
      'Points spread widely in x pin the slope down well, so SE_b is small.',
      'Then t = b ÷ SE_b with df = n − 2, as in the slope test.',
    ],
    variables: [
      V('s', 's', 'Standard deviation of the residuals', {
        min: 0.001,
        max: 1000000,
        step: 0.001,
      }),
      V('sx', 'sₓ', 'Standard deviation of x', { min: 0.001, max: 10000, step: 0.001 }),
      pointsVar,
      seSlope({ min: 1e-10, derived: true }),
      slopeVar,
      dfVar,
      tSlopeVar(),
      prob('P', 'P', 'p-value', { derived: true }),
      alphaVar,
    ],
    ...rels(
      derive(
        'SE_b = s ÷ (sₓ√(n − 1))',
        '{E} = {s} ÷ ({sx} × √({n} − 1))',
        'E',
        ['s', 'sx', 'n'],
        (v) => div(v.s!, v.sx! * Math.sqrt(v.n! - 1)),
        '{s} ÷ ({sx} × √({n} − 1))',
        'The residuals’ spread over the x values’ spread, shrinking as n grows.',
      ),
      tSlope,
      dfLine,
      withStep(tTwoTail('P', 't', 'df'), 'P', {
        work: (v) => tTailWork({ ...v, h: 0 }),
        note: (v) => decideSlope('β')({ ...v, h: 0 }),
      }),
    ),
    standalone: { vars: ['a'], why: ALPHA_WHY },
    example: {
      s: 2,
      sx: 1.5,
      n: 10,
      E: 2 / 4.5,
      b: 1.2,
      df: 8,
      t: 2.7,
      P: 2 * (1 - tCdf(2.7, 8)),
      a: 0.05,
    },
    startWith: ['s', 'sx', 'n', 'b', 'a'],
    representation: slopeCurve,
  },
];

// ── ANOVA and the F distribution (added skill 20) ──

/** ln Γ(x) (Lanczos), for the F distribution below (statMath keeps its own private). */
function lnGamma(x: number): number {
  const g = [
    676.5203681218851, -1259.1392167224028, 771.3234287776531, -176.6150291621406,
    12.507343278686905, -0.13857109526572012, 9.984369578019572e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  const y = x - 1;
  let a = 0.9999999999998099;
  const t = y + 7.5;
  g.forEach((c, i) => (a += c / (y + i + 1)));
  return 0.5 * Math.log(2 * Math.PI) + (y + 0.5) * Math.log(t) - t + Math.log(a);
}
/** The continued fraction of the incomplete beta function (modified Lentz). */
function betaFraction(a: number, b: number, x: number): number {
  const tiny = 1e-300;
  const fix = (z: number) => (Math.abs(z) < tiny ? tiny : z);
  let c = 1;
  let d = 1 / fix(1 - ((a + b) * x) / (a + 1));
  let h = d;
  for (let m = 1; m < 500; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((a + m2 - 1) * (a + m2));
    d = 1 / fix(1 + aa * d);
    c = fix(1 + aa / c);
    h *= d * c;
    aa = (-(a + m) * (a + b + m) * x) / ((a + m2) * (a + m2 + 1));
    d = 1 / fix(1 + aa * d);
    c = fix(1 + aa / c);
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-15) break;
  }
  return h;
}
/** The regularized incomplete beta function I_x(a, b). */
function betaI(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(
    lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x),
  );
  return x < (a + 1) / (a + b + 2)
    ? (front * betaFraction(a, b, x)) / a
    : 1 - (front * betaFraction(b, a, 1 - x)) / b;
}
/** P(F ≥ f) with d1 and d2 degrees of freedom: a calculator's Fcdf(f, ∞, d1, d2). */
export const fTail = (f: number, d1: number, d2: number) =>
  f <= 0 ? 1 : 1 - betaI((d1 * f) / (d1 * f + d2), d1 / 2, d2 / 2);

const ssVar = (id: string, symbol: string, name: string) =>
  V(id, symbol, name, { min: 0.0001, max: 1e9, step: 0.01 });
const msVar = (id: string, symbol: string, name: string, extra = {}) =>
  V(id, symbol, name, { min: 1e-9, max: 1e9, step: 0.0001, ...extra });
const fVar = (extra = {}) =>
  V('F', 'F', 'F statistic', { min: 0, max: 1e18, step: 0.0001, ...extra });
const dfOf = (id: string, symbol: string, name: string, extra = {}) =>
  V(id, symbol, name, { integer: true, min: 1, max: 10000, ...extra });
/** P = Fcdf(F, ∞, d1, d2): the right tail past F. */
const fTailRel = (d1: string | number, d2: string) =>
  derive(
    `P = Fcdf(F, ∞, ${typeof d1 === 'number' ? d1 : 'df₁'}, df₂)`,
    `{P} = Fcdf({F}, ∞, ${typeof d1 === 'number' ? d1 : `{${d1}}`}, {${d2}})`,
    'P',
    ['F', ...(typeof d1 === 'number' ? [] : [d1]), d2],
    (v) => fTail(v.F!, typeof d1 === 'number' ? d1 : v[d1]!, v[d2]!),
    `Fcdf({F}, ∞, ${typeof d1 === 'number' ? d1 : `{${d1}}`}, {${d2}})`,
    'The area under the F curve past the statistic: a large F, means far apart for their spread, leaves little.',
  );
/** F = M₁ ÷ M₂, between-group spread over within-group spread. */
const fRatio = rel(
  'F = MSB ÷ MSW',
  '{F} = {M1} ÷ {M2}',
  ['F', 'M1', 'M2'],
  (v) => v.F! * v.M2! - v.M1!,
  {
    F: [
      (v) => div(v.M1!, v.M2!),
      '{M1} ÷ {M2}',
      'How much the group means spread compared with the spread inside the groups.',
    ],
    M1: [(v) => v.F! * v.M2!, '{F} × {M2}', 'Undo the division by MSW.'],
  },
);
/**
 * The decision after an F test's p-value, in context: "P < 0.0001 < α = 0.05: reject H₀:
 * convincing evidence that …" (a p-value is never 0).
 */
const decideF =
  (evidence: (v: Values) => string) =>
  (v: Values): string => {
    if (v.P === undefined || v.a === undefined) return '';
    const P = v.P < 0.0001 ? 'P < 0.0001' : shown(v.P);
    return v.P < v.a
      ? `→ ${P} < α = ${fmt(v.a)}: reject H₀: convincing evidence that ${evidence(v)}`
      : `→ ${P} ≥ α = ${fmt(v.a)}: fail to reject H₀: not convincing evidence that ${evidence(v)}`;
  };
const groupsDiffer = decideF(() => 'at least one group mean differs');
const fTable = (params: string[], rows: number[]) =>
  ({ kind: 'table', sweep: 'F', output: 'P', params, rows }) as const;

const MATH_12_ANOVA: ModuleDef[] = [
  // ── m.12.anova (OpenStax Statistics 13) ──
  {
    id: 'm.12.anova',
    assumptions: [
      'H₀: every group has the same mean; Hₐ: at least one mean differs.',
      'df₁ = k − 1 for k groups and df₂ = N − k for N values in all; each mean square is SS ÷ df.',
      'The groups are independent random samples from normal populations with equal spreads.',
    ],
    variables: [
      ssVar('B', 'SSB', 'Sum of squares between groups'),
      dfOf('d1', 'df₁', 'Degrees of freedom between groups'),
      ssVar('W', 'SSW', 'Sum of squares within groups'),
      dfOf('d2', 'df₂', 'Degrees of freedom within groups'),
      V('T', 'SST', 'Total sum of squares', { min: 0.0002, max: 2e9, step: 0.01, derived: true }),
      msVar('M1', 'MSB', 'Mean square between groups', { derived: true }),
      msVar('M2', 'MSW', 'Mean square within groups', { derived: true }),
      fVar({ derived: true }),
      prob('P', 'P', 'p-value', { derived: true }),
      alphaVar,
    ],
    ...rels(
      rel('MSB = SSB ÷ df₁', '{M1} = {B} ÷ {d1}', ['M1', 'B', 'd1'], (v) => v.M1! * v.d1! - v.B!, {
        M1: [
          (v) => div(v.B!, v.d1!),
          '{B} ÷ {d1}',
          'A mean square is a sum of squares over its df.',
        ],
        B: [(v) => v.M1! * v.d1!, '{M1} × {d1}', 'Undo the division by df₁.'],
      }),
      derive(
        'MSW = SSW ÷ df₂',
        '{M2} = {W} ÷ {d2}',
        'M2',
        ['W', 'd2'],
        (v) => div(v.W!, v.d2!),
        '{W} ÷ {d2}',
        'The spread inside the groups, pooled: SSW over its df.',
      ),
      derive(
        'SST = SSB + SSW',
        '{T} = {B} + {W}',
        'T',
        ['B', 'W'],
        (v) => v.B! + v.W!,
        '{B} + {W}',
        'The total spread of every value about the grand mean splits into between and within.',
      ),
      fRatio,
      withStep(fTailRel('d1', 'd2'), 'P', { note: groupsDiffer }),
    ),
    standalone: { vars: ['a'], why: ALPHA_WHY },
    example: {
      B: 60,
      d1: 2,
      W: 72,
      d2: 12,
      T: 132,
      M1: 30,
      M2: 6,
      F: 5,
      P: fTail(5, 2, 12),
      a: 0.05,
    },
    startWith: ['B', 'd1', 'W', 'd2', 'a'],
    representation: fTable(['d1', 'd2'], [1, 2, 3, 4, 5, 6, 8, 10]),
  },
  {
    id: 'm.12.anova~groups',
    title: 'Three groups from their means and SDs',
    use: 'Use this for “Three groups of 5 have means 10, 14 and 12 and SDs 2, 3 and 2. Do the means differ?”',
    assumptions: [
      'Three groups of the same size n: MSB = n × Σ(x̄ᵢ − x̄)² ÷ 2, where x̄ is the grand mean.',
      'MSW = (s₁² + s₂² + s₃²) ÷ 3, the average of the three variances.',
      'df₁ = 3 − 1 = 2 and df₂ = 3n − 3; the groups are independent, normal and equally spread.',
    ],
    variables: [
      V('n', 'n', 'Size of each group', { integer: true, min: 2, max: 3000 }),
      V('m1', 'x̄₁', 'Mean of group 1', { min: 0, max: 1000000, step: 0.01, group: 'm' }),
      V('m2', 'x̄₂', 'Mean of group 2', { min: 0, max: 1000000, step: 0.01, group: 'm' }),
      V('m3', 'x̄₃', 'Mean of group 3', { min: 0, max: 1000000, step: 0.01, group: 'm' }),
      V('s1', 's₁', 'SD of group 1', { min: 0.001, max: 100000, step: 0.01, group: 's' }),
      V('s2', 's₂', 'SD of group 2', { min: 0.001, max: 100000, step: 0.01, group: 's' }),
      V('s3', 's₃', 'SD of group 3', { min: 0.001, max: 100000, step: 0.01, group: 's' }),
      V('g', 'x̄', 'Grand mean', { min: 0, max: 1000000, step: 0.0001, derived: true }),
      dfOf('d2', 'df₂', 'Degrees of freedom within groups', { max: 9000, derived: true }),
      msVar('M1', 'MSB', 'Mean square between groups', { min: 0, derived: true }),
      msVar('M2', 'MSW', 'Mean square within groups', { derived: true }),
      fVar({ derived: true }),
      prob('P', 'P', 'p-value', { derived: true }),
      alphaVar,
    ],
    ...rels(
      derive(
        'x̄ = (x̄₁ + x̄₂ + x̄₃) ÷ 3',
        '{g} = ({m1} + {m2} + {m3}) ÷ 3',
        'g',
        ['m1', 'm2', 'm3'],
        (v) => (v.m1! + v.m2! + v.m3!) / 3,
        '({m1} + {m2} + {m3}) ÷ 3',
        'The groups are the same size, so the grand mean is the mean of the three means.',
      ),
      derive(
        'df₂ = 3n − 3',
        '{d2} = 3 × {n} − 3',
        'd2',
        ['n'],
        (v) => 3 * v.n! - 3,
        '3 × {n} − 3',
        'N − k: 3n values in all, less one for each group’s mean.',
      ),
      derive(
        'MSB = nΣ(x̄ᵢ − x̄)² ÷ 2',
        '{M1} = {n} × (({m1} − {g})² + ({m2} − {g})² + ({m3} − {g})²) ÷ 2',
        'M1',
        ['n', 'm1', 'm2', 'm3', 'g'],
        (v) => (v.n! * ((v.m1! - v.g!) ** 2 + (v.m2! - v.g!) ** 2 + (v.m3! - v.g!) ** 2)) / 2,
        '{n} × (({m1} − {g})² + ({m2} − {g})² + ({m3} − {g})²) ÷ 2',
        'Each group mean stands for its n values, so its squared distance from the grand mean counts n times; divide by df₁ = 2.',
      ),
      derive(
        'MSW = (s₁² + s₂² + s₃²) ÷ 3',
        '{M2} = ({s1}² + {s2}² + {s3}²) ÷ 3',
        'M2',
        ['s1', 's2', 's3'],
        (v) => (v.s1! ** 2 + v.s2! ** 2 + v.s3! ** 2) / 3,
        '({s1}² + {s2}² + {s3}²) ÷ 3',
        'Equal groups: the pooled variance is the average of the three variances.',
      ),
      fRatio,
      withStep(fTailRel(2, 'd2'), 'P', { note: groupsDiffer }),
    ),
    standalone: { vars: ['a'], why: ALPHA_WHY },
    example: {
      n: 5,
      m1: 10,
      m2: 14,
      m3: 12,
      s1: 2,
      s2: 3,
      s3: 2,
      g: 12,
      d2: 12,
      M1: 20,
      M2: 17 / 3,
      F: 60 / 17,
      P: fTail(60 / 17, 2, 12),
      a: 0.05,
    },
    startWith: ['n', 'm1', 'm2', 'm3', 's1', 's2', 's3', 'a'],
    representation: {
      kind: 'bars',
      bars: [{ var: 'm1' }, { var: 'm2' }, { var: 'm3' }],
      min: 0,
      max: 20,
    },
  },
  {
    id: 'm.12.anova~two-variances',
    title: 'Comparing two variances',
    use: 'Use this for “Two samples of 16 have SDs 6 and 4. Are the population variances different?”',
    assumptions: [
      'H₀: σ₁² = σ₂²; Hₐ is σ₁² ≠ σ₂², or σ₁² > σ₂² for a larger first variance. Put the larger SD first so F = s₁² ÷ s₂² ≥ 1.',
      'F has df₁ = n₁ − 1 on top and df₂ = n₂ − 1 underneath; for ≠ the p-value doubles the tail past F, for > it is that tail.',
      'Both populations must be normal: this test is very sensitive to skew.',
    ],
    variables: [
      V('s1', 's₁', 'Larger sample SD', { min: 0.001, max: 100000, step: 0.01 }),
      V('s2', 's₂', 'Smaller sample SD', { min: 0.001, max: 100000, step: 0.01 }),
      V('n1', 'n₁', 'Size of the larger-SD sample', { integer: true, min: 2, max: 10000 }),
      V('n2', 'n₂', 'Size of the smaller-SD sample', {
        integer: true,
        min: 2,
        max: 10000,
      }),
      dfOf('d1', 'df₁', 'Degrees of freedom on top', { derived: true }),
      dfOf('d2', 'df₂', 'Degrees of freedom underneath', { derived: true }),
      fVar({ derived: true }),
      V('h', 'Hₐ', 'Hₐ: σ₁² ≠ σ₂² (0) or σ₁² > σ₂² (1)', {
        integer: true,
        min: 0,
        max: 1,
        allowed: [0, 1],
      }),
      prob('P', 'P', 'p-value', { derived: true }),
      alphaVar,
    ],
    ...rels(
      derive(
        'df₁ = n₁ − 1',
        '{d1} = {n1} − 1',
        'd1',
        ['n1'],
        (v) => v.n1! - 1,
        '{n1} − 1',
        'The first sample’s variance has n₁ − 1 degrees of freedom.',
      ),
      derive(
        'df₂ = n₂ − 1',
        '{d2} = {n2} − 1',
        'd2',
        ['n2'],
        (v) => v.n2! - 1,
        '{n2} − 1',
        'The second sample’s variance has n₂ − 1 degrees of freedom.',
      ),
      derive(
        'F = s₁² ÷ s₂²',
        '{F} = {s1}² ÷ {s2}²',
        'F',
        ['s1', 's2'],
        (v) => div(v.s1! ** 2, v.s2! ** 2),
        '{s1}² ÷ {s2}²',
        'The ratio of the variances: near 1 when the spreads match.',
      ),
      withStep(
        withCheck(
          derive(
            'P = the F tail on the side of Hₐ',
            '{P} = the F tail past {F} on {h}’s side, with {d1} and {d2} degrees of freedom',
            'P',
            ['F', 'd1', 'd2', 'h'],
            (v) => {
              const q = fTail(v.F!, v.d1!, v.d2!);
              return v.h === 1 ? q : 2 * Math.min(q, 1 - q);
            },
            (v: Values) =>
              v.h === 1
                ? 'Fcdf({F}, ∞, {d1}, {d2})'
                : fTail(v.F!, v.d1!, v.d2!) > 0.5
                  ? '2 × (1 − Fcdf({F}, ∞, {d1}, {d2}))'
                  : '2 × Fcdf({F}, ∞, {d1}, {d2})',
            'Hₐ ≠ doubles the smaller tail of the F curve at F; Hₐ > takes the right tail past F alone.',
          ),
          (v) => {
            const f = `Fcdf(${shown(v.F!)}, ∞, ${shown(v.d1!)}, ${shown(v.d2!)})`;
            return `${shown(v.P!)} = ${
              v.h === 1 ? f : fTail(v.F!, v.d1!, v.d2!) > 0.5 ? `2 × (1 − ${f})` : `2 × ${f}`
            }`;
          },
        ),
        'P',
        {
          // Hₐ in words first (its box shows the code), then the decision in context.
          note: (v) => {
            const side = v.h === 1 ? 'Hₐ: σ₁² > σ₂², the right tail' : 'Hₐ: σ₁² ≠ σ₂², two tails';
            const d = decideF((w) =>
              w.h === 1
                ? 'the first population’s variance is larger'
                : 'the population variances differ',
            )(v);
            return d ? `→ ${side}; ${d.slice(2)}` : '';
          },
        },
      ),
      limit(
        's₁ ≥ s₂',
        'The larger SD {s1} is first: at least {s2}',
        ['s1', 's2'],
        (v) => v.s1! >= v.s2!,
        'Put the larger standard deviation first, so F is at least 1 (swap the samples).',
      ),
    ),
    standalone: { vars: ['a'], why: ALPHA_WHY },
    example: {
      s1: 6,
      s2: 4,
      n1: 16,
      n2: 16,
      d1: 15,
      d2: 15,
      F: 2.25,
      h: 0,
      P: 2 * fTail(2.25, 15, 15),
      a: 0.05,
    },
    startWith: ['s1', 's2', 'n1', 'n2', 'h', 'a'],
    representation: fTable(['d1', 'd2'], [1, 1.5, 2, 2.5, 3, 4]),
  },
];

export const MATH_12_MODULES: ModuleDef[] = [
  ...MATH_12_TRIG,
  ...MATH_12_TRIG_EQUATIONS,
  ...MATH_12_VECTORS,
  ...MATH_12_VECTORS_3D,
  ...MATH_12_POLAR,
  ...MATH_12_PARAMETRIC,
  ...MATH_12_MATRICES,
  ...MATH_12_TRANSFORMS,
  ...MATH_12_LIMITS,
  ...MATH_12_AREA,
  ...MATH_12_CONICS,
  ...MATH_12_INDUCTION,
  ...MATH_12_PARTIAL_FRACTIONS,
  ...MATH_12_POLAR_CONICS,
  ...MATH_12_STATS,
  ...MATH_12_REGRESSION,
  ...MATH_12_ANOVA,
];
