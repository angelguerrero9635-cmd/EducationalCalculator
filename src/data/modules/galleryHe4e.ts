/**
 * College gallery demos, round 4, group E (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC114: `normalCurve` `family: 't'` (he.chemistry.analytical#0, ~t-test).
 * HC152: `normalCurve` `shift` (he.biology.evolution#0~breeders).
 * HC151: `alleleFrequencies` `after` (he.biology.evolution#0).
 */
import type { Relation, Values, VariableDef } from '@/engine/types';
import { invT } from '@/components/module/reps/statMath';

import type { LayoutDef } from './layouts';
import type { ModuleDef, Representation, StepText } from './types';

type Solver = (v: Values) => number | number[] | undefined;
type Rule = { relation: Relation; steps: Record<string, StepText> };

/** A value with its unit (one unit: the formula is written in it). */
const num = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({
  id,
  symbol,
  name,
  ...(unit ? { unit, units: [unit] } : {}),
  min,
  max,
  ...more,
});

/** A value worked out, never typed. */
const out = (
  id: string,
  symbol: string,
  name: string,
  unit?: string,
  more: Partial<VariableDef> = {},
) => num(id, symbol, name, unit, -1e12, 1e12, { derived: true, ...more });

/** A number written into step text: up to 7 figures, a negative one bracketed. */
const lit = (x: number) => {
  const s = String(Number(x.toPrecision(7))).replace('-', '−');
  return x < 0 ? `(${s})` : s;
};
/** A template with each {id} replaced by its value. */
const fill = (t: string, v: Values) => t.replace(/\{(\w+)\}/g, (_, id: string) => lit(v[id]!));
/** A finite number, or nothing. */
const fin = (x: number) => (Number.isFinite(x) ? x : undefined);

/** A relation with its steps: each variable's solver, expression and explanation. */
function rule(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  parts: Record<string, [Solver, StepText['expr'], StepText['how']]>,
): Rule {
  const solve: Record<string, Solver> = {};
  const steps: Record<string, StepText> = {};
  for (const [v, [fn, expr, how]] of Object.entries(parts)) {
    solve[v] = fn;
    steps[v] = { expr, how };
  }
  for (const v of vars) if (!(v in solve)) solve[v] = () => undefined;
  return { relation: { id, display, vars, residual, solve }, steps };
}

/** A value worked out from others, never solved backwards. */
const derive = (
  id: string,
  x: string,
  inputs: string[],
  display: string,
  f: (v: Values) => number | undefined,
  expr: StepText['expr'],
  how: StepText['how'],
): Rule => {
  const r = rule(id, display, [x, ...inputs], (v) => v[x]! - (f(v) ?? NaN), {
    [x]: [(v) => fin(f(v) ?? NaN), expr, how],
  });
  // A display in words ("invT(…)") is checked as the step's arithmetic.
  if (/[A-Za-z]{3,}/.test(display.replace(/\{\w+\}/g, '')))
    r.relation.check = (v) =>
      `${fill(typeof expr === 'string' ? expr : expr(v), v)} = ${lit(v[x]!)}`;
  return r;
};

/** A demo from its rules. */
function page(
  d: Omit<ModuleDef, 'relations' | 'steps' | 'representation' | 'startWith'> & {
    rules: Rule[];
    representation: Representation;
    startWith?: string[];
  },
): ModuleDef {
  const { rules, ...rest } = d;
  return {
    ...rest,
    // College pages are metric; every typed value opens filled (the example is whole).
    unitSystems: ['metric'],
    startWith: d.startWith ?? d.variables.filter((v) => !v.derived).map((v) => v.id),
    relations: rules.map((r) => r.relation),
    steps: Object.fromEntries(rules.map((r) => [r.relation.id, r.steps])),
  };
}

/** Values worked out from the typed ones of an example, in order. */
function example(typed: Values, ...work: [string, (v: Values) => number][]): Values {
  const v: Values = { ...typed };
  for (const [id, f] of work) v[id] = f(v);
  return v;
}

// ─── HC114: the t curve and a confidence interval (analytical#0) ───────────────

const tOf = (v: Values) => invT(0.975, v.df!);
const halfOf = (v: Values) => (v.t! * v.s!) / Math.sqrt(v.n!);

const replicateVars = (): VariableDef[] => [
  num('n', 'n', 'Measurements', undefined, 2, 30, { integer: true, step: 1 }),
  num('xbar', 'x̄', 'Mean', 'mg/L', 0.001, 1e6, { step: 0.01 }),
  num('s', 's', 'Standard deviation', 'mg/L', 0.0001, 1e5, { step: 0.01 }),
  out('df', 'df', 'Degrees of freedom', undefined, { integer: true }),
];

const dfRule = derive(
  'df',
  'df',
  ['n'],
  '{df} = {n} − 1',
  (v) => v.n! - 1,
  '{n} − 1',
  'The t curve for a mean of n readings has n − 1 degrees of freedom.',
);

const tRule = (t: string) =>
  derive(
    'tstar',
    t,
    ['df'],
    `{${t}} = invT(0.975, {df})`,
    (v) => invT(0.975, v.df!),
    'invT(0.975, {df})',
    'For 95% two-sided, 2.5% is left in each tail: t⋆ has 0.975 of the t curve to its left.',
  );

const intervalPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'Random error only: the readings scatter normally about the true mean.',
      'The interval is where the true mean lies with 95% confidence, not where 95% of the readings lie.',
      's comes from the same n readings, so t (with n − 1 degrees of freedom) replaces z.',
    ],
    variables: [
      ...replicateVars(),
      out('t', 't⋆', 'Critical t at 95%'),
      out('half', 'Δ', 'Half-width', 'mg/L'),
      out('lower', 'L', 'Lower end', 'mg/L'),
      out('upper', 'U', 'Upper end', 'mg/L'),
    ],
    rules: [
      dfRule,
      tRule('t'),
      derive(
        'half',
        'half',
        ['t', 's', 'n'],
        '{half} = {t} × {s} ÷ √{n}',
        halfOf,
        '{t} × {s} ÷ √{n}',
        'The half-width is t⋆ standard errors, and the standard error of a mean is s ÷ √n.',
      ),
      derive(
        'lower',
        'lower',
        ['xbar', 'half'],
        '{lower} = {xbar} − {half}',
        (v) => v.xbar! - v.half!,
        '{xbar} − {half}',
        'The interval runs from the mean minus the half-width …',
      ),
      derive(
        'upper',
        'upper',
        ['xbar', 'half'],
        '{upper} = {xbar} + {half}',
        (v) => v.xbar! + v.half!,
        '{xbar} + {half}',
        '… to the mean plus the half-width.',
      ),
    ],
    example: example(
      typed,
      ['df', (v) => v.n! - 1],
      ['t', tOf],
      ['half', halfOf],
      ['lower', (v) => v.xbar! - v.half!],
      ['upper', (v) => v.xbar! + v.half!],
    ),
    startWith: ['n', 'xbar', 's'],
    representation: {
      kind: 'normalCurve',
      family: 't',
      df: 'df',
      tStar: 't',
      bracket: {
        mean: 'xbar',
        s: 's',
        n: 'n',
        half: 'half',
        lower: 'lower',
        upper: 'upper',
        axis: 'Concentration (mg/L)',
      },
    },
  });

const T_INTERVAL = intervalPage(
  'g.he-normalCurve-t-interval',
  'A 95% confidence interval for a mean',
  'Use this for “Five replicate readings average 10.12 mg/L with s = 0.15 mg/L. Give the 95% confidence interval.”',
  { n: 5, xbar: 10.12, s: 0.15 },
);

/** The edge of the range: two readings, df = 1, where t⋆ = 12.71 makes the interval wide. */
const T_INTERVAL_TWO = intervalPage(
  'g.he-normalCurve-t-two-readings',
  'A confidence interval from two readings',
  'Use this for “Two readings average 10.12 mg/L with s = 0.15 mg/L. How wide is the 95% confidence interval?”',
  { n: 2, xbar: 10.12, s: 0.15 },
);

const tObsOf = (v: Values) => (Math.abs(v.xbar! - v.mu!) * Math.sqrt(v.n!)) / v.s!;

const T_TEST = page({
  id: 'g.he-normalCurve-t-test',
  title: 'Does a mean differ from a known value? (t-test)',
  use: 'Use this for “A standard of 10.00 mg/L reads 10.12 mg/L on average over 5 runs, s = 0.15 mg/L. Is the difference significant at 95%?”',
  assumptions: [
    'Random error only; μ is the known (certified) value.',
    'Two-sided at 95%: the difference is significant when t > t⋆, the same as μ lying outside x̄ ± t⋆s ÷ √n.',
    'Not significant does not prove the method has no bias; more readings shrink the interval.',
  ],
  variables: [
    ...replicateVars(),
    num('mu', 'μ', 'Known value', 'mg/L', 0.001, 1e6, { step: 0.01 }),
    out('t', 't', 't calculated'),
    out('tc', 't⋆', 'Critical t at 95%'),
  ],
  rules: [
    dfRule,
    derive(
      'tcalc',
      't',
      ['xbar', 'mu', 'n', 's'],
      '{t} = |{xbar} − {mu}| × √{n} ÷ {s}',
      tObsOf,
      '|{xbar} − {mu}| × √{n} ÷ {s}',
      'How many standard errors (s ÷ √n) the mean lies from the known value.',
    ),
    tRule('tc'),
  ],
  example: example(
    { n: 5, xbar: 10.12, s: 0.15, mu: 10 },
    ['df', (v) => v.n! - 1],
    ['t', tObsOf],
    ['tc', tOf],
  ),
  startWith: ['xbar', 'mu', 's', 'n'],
  representation: {
    kind: 'normalCurve',
    family: 't',
    df: 'df',
    tStar: 'tc',
    observed: 't',
    bracket: { mean: 'xbar', s: 's', n: 'n', mu: 'mu', axis: 'Concentration (mg/L)' },
  },
});

// ─── HC152: response to selection (evolution#0~breeders) ──────────────────────

const breederPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'h² is the narrow-sense heritability: the share of the variation passed on additively.',
      'S is how far the chosen parents’ mean lies from the whole population’s mean.',
      'The curves are drawn with a spread of 5 cm; R = h²S does not depend on it.',
    ],
    variables: [
      num('h2', 'h²', 'Heritability', undefined, 0, 1, { step: 0.01 }),
      num('S', 'S', 'Selection differential', 'cm', -50, 50, { step: 0.1 }),
      num('m0', 'μ', 'Mean before', 'cm', 1, 1000, { step: 0.1 }),
      out('R', 'R', 'Response to selection', 'cm'),
      out('m1', 'μ′', 'Mean after', 'cm'),
    ],
    rules: [
      derive(
        'resp',
        'R',
        ['h2', 'S'],
        '{R} = {h2} × {S}',
        (v) => v.h2! * v.S!,
        '{h2} × {S}',
        'The breeder’s equation: the offspring move h² of the way the parents were chosen.',
      ),
      derive(
        'after',
        'm1',
        ['m0', 'R'],
        '{m1} = {m0} + {R}',
        (v) => v.m0! + v.R!,
        '{m0} + {R}',
        'The offspring’s mean is the old mean moved by R.',
      ),
    ],
    example: example(typed, ['R', (v) => v.h2! * v.S!], ['m1', (v) => v.m0! + v.R!]),
    startWith: ['h2', 'S', 'm0'],
    representation: {
      kind: 'normalCurve',
      mean: 'm0',
      sd: 5,
      axis: 'Plant height (cm)',
      shift: { selected: 'S', response: 'R', h2: 'h2', after: 'm1' },
      fixed: true,
    },
  });

const SHIFT = breederPage(
  'g.he-normalCurve-shift',
  'Response to selection: the breeder’s equation',
  'Use this for “With h² = 0.4, breeders 2 cm taller than average give offspring how much taller?”',
  { h2: 0.4, S: 2, m0: 80 },
);

/** Selection the other way, strongly heritable: shorter parents chosen. */
const SHIFT_DOWN = breederPage(
  'g.he-normalCurve-shift-down',
  'Selecting for shorter plants',
  'Use this for “Parents 6 cm shorter than average are bred; h² = 0.9. How much shorter are the offspring?”',
  { h2: 0.9, S: -6, m0: 80 },
);

// ─── HC151: one generation of selection (evolution#0) ─────────────────────────

const wbarOf = (v: Values) =>
  v.p! * v.p! * v.wAA! + 2 * v.p! * (1 - v.p!) * v.wAa! + (1 - v.p!) * (1 - v.p!) * v.waa!;
const p2Of = (v: Values) => (v.p! * v.p! * v.wAA! + v.p! * (1 - v.p!) * v.wAa!) / v.wbar!;

const selectionPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'Random mating, a large population, no mutation or migration: only selection acts.',
      'Fitnesses are relative survival (0 to 1); w̄ is the population’s mean fitness.',
      'p′ counts the A alleles among the survivors: AA carry two, Aa one.',
    ],
    variables: [
      num('p', 'p', 'Frequency of A', undefined, 0, 1, { step: 0.01 }),
      num('wAA', 'w_AA', 'Fitness of AA', undefined, 0, 1, { step: 0.01 }),
      num('wAa', 'w_Aa', 'Fitness of Aa', undefined, 0, 1, { step: 0.01 }),
      num('waa', 'w_aa', 'Fitness of aa', undefined, 0, 1, { step: 0.01 }),
      out('q', 'q', 'Frequency of a'),
      out('wbar', 'w̄', 'Mean fitness'),
      out('p2', 'p′', 'Frequency of A next generation'),
      out('dp', 'Δp', 'Change in p'),
    ],
    rules: [
      derive(
        'q',
        'q',
        ['p'],
        '{q} = 1 − {p}',
        (v) => 1 - v.p!,
        '1 − {p}',
        'The two alleles’ frequencies add to 1.',
      ),
      derive(
        'wbar',
        'wbar',
        ['p', 'q', 'wAA', 'wAa', 'waa'],
        '{wbar} = {p}² × {wAA} + 2 × {p} × {q} × {wAa} + {q}² × {waa}',
        wbarOf,
        '{p}² × {wAA} + 2 × {p} × {q} × {wAa} + {q}² × {waa}',
        'Each genotype’s Hardy–Weinberg share times its fitness, added.',
      ),
      derive(
        'p2',
        'p2',
        ['p', 'q', 'wAA', 'wAa', 'wbar'],
        '{p2} = ({p}² × {wAA} + {p} × {q} × {wAa}) ÷ {wbar}',
        p2Of,
        '({p}² × {wAA} + {p} × {q} × {wAa}) ÷ {wbar}',
        'The A alleles among the survivors (all of AA’s, half of Aa’s), out of all survivors.',
      ),
      derive(
        'dp',
        'dp',
        ['p2', 'p'],
        '{dp} = {p2} − {p}',
        (v) => v.p2! - v.p!,
        '{p2} − {p}',
        'The change in one generation.',
      ),
    ],
    example: example(
      typed,
      ['q', (v) => 1 - v.p!],
      ['wbar', wbarOf],
      ['p2', p2Of],
      ['dp', (v) => v.p2! - v.p!],
    ),
    startWith: ['p', 'wAA', 'wAa', 'waa'],
    representation: {
      kind: 'alleleFrequencies',
      p: 'p',
      q: 'q',
      after: 'p2',
      change: 'dp',
      fitness: ['wAA', 'wAa', 'waa'],
      mean: 'wbar',
      keep: ['wAA', 'wAa', 'waa'],
    },
  });

const SELECTION = selectionPage(
  'g.he-alleleFrequencies-after',
  'Allele frequency after one generation of selection',
  'Use this for “p = 0.5 and aa survives half as well as AA and Aa. What is p in the next generation?”',
  { p: 0.5, wAA: 1, wAa: 1, waa: 0.5 },
);

/** Near fixation, selection against the common allele: Δp is negative. */
const SELECTION_AGAINST = selectionPage(
  'g.he-alleleFrequencies-after-against',
  'Selection against a common allele',
  'Use this for “A is at 0.95 but AA survives at 0.7, Aa at 0.85 and aa at 1. How much does p fall in one generation?”',
  { p: 0.95, wAA: 0.7, wAa: 0.85, waa: 1 },
);

export const HE4E_GALLERY_MODULES: ModuleDef[] = [
  SELECTION,
  SELECTION_AGAINST,
  T_INTERVAL,
  T_TEST,
  T_INTERVAL_TWO,
  SHIFT,
  SHIFT_DOWN,
];

export const HE4E_GALLERY_LAYOUTS: LayoutDef[] = [];
