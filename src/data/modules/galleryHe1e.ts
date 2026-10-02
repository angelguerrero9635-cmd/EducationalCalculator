/**
 * College gallery demos, round 1, group E (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC10: `functionGraph` families expr, hill, bateman, a repeated dose, a real power and erfc.
 * HC12: regions (area, signed, between, strip, level, accumulation), Levenspiel and equal area.
 */
import { erf } from '@/components/module/reps/functionGraphHe1e';
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, Representation, StepText } from './types';

type Solver = (v: Values) => number | number[] | undefined;
type Rule = { relation: Relation; steps: Record<string, StepText> };

/** A value typed or worked out: min to max. */
const num = (
  id: string,
  symbol: string,
  name: string,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({
  id,
  symbol,
  name,
  min,
  max,
  // A value with a unit keeps it: the graph reads the numbers as shown.
  ...(more.unit ? { units: [more.unit] } : {}),
  ...more,
});

/** A finite number, or nothing. */
const fin = (x: number) => (Number.isFinite(x) ? x : undefined);
const div = (a: number, b: number) => (b === 0 ? undefined : fin(a / b));

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
): Rule => rule(id, display, [x, ...inputs], (v) => v[x]! - (f(v) ?? NaN), { [x]: [f, expr, how] });

/** A rule the values must keep, with the message when they don't. */
const limit = (id: string, display: string, ok: (v: Values) => boolean, message: string): Rule => ({
  relation: {
    id,
    display,
    constraint: true,
    vars: [...new Set([...display.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!))],
    residual: (v: Values) => (ok(v) ? 0 : 1),
    solve: {},
    message: (v: Values) => (ok(v) ? undefined : message),
  },
  steps: {},
});

/** A demo from its rules. */
function page(
  d: Omit<ModuleDef, 'relations' | 'steps' | 'representation'> & {
    rules: Rule[];
    representation: Representation;
  },
): ModuleDef {
  const { rules, ...rest } = d;
  return {
    ...rest,
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

// ── HC10: expr ──

/** y = y₀e^(−kt) + (A ÷ k)(1 − e^(−k(t − τ)))u(t − τ). */
const laplaceStep = (v: Values) =>
  v.y0! * Math.exp(-v.k! * v.t!) +
  (v.t! >= v.tau! ? (v.A! / v.k!) * (1 - Math.exp(-v.k! * (v.t! - v.tau!))) : 0);

const EXPR_STEP = page({
  id: 'g.he-functionGraph-expr',
  title: 'A switched-on input, by Laplace transforms',
  use: 'Use this for “Solve y′ + 0.5y = 2u(t − 2), y(0) = 1, by the Laplace transform.”',
  assumptions: [
    'L{y′} = sY − y₀: the starting value enters the transform.',
    'e^(−τs) shifts the input by τ; the unit step u(t − τ) is 0 before τ and 1 after.',
    'k > 0, so after the switch the solution settles toward A ÷ k.',
  ],
  variables: [
    num('k', 'k', 'Rate constant', 0.01, 10, { step: 0.1 }),
    num('A', 'A', 'Input size', -100, 100, { step: 0.5 }),
    num('tau', 'τ', 'Switch-on time', 0, 50, { step: 0.5 }),
    num('y0', 'y₀', 'Starting value', -100, 100, { step: 0.5 }),
    num('t', 't', 'Time', 0, 100, { step: 0.1 }),
    num('y', 'y', 'Value at time t', -100000, 100000),
  ],
  rules: [
    rule(
      'laplace-step',
      '{y} = {y0} × e^(−{k} × {t}) + ({A} ÷ {k}) × (1 − e^(−{k} × ({t} − {tau}))) × u({t} − {tau})',
      ['y', 'y0', 'k', 'A', 't', 'tau'],
      (v) => v.y! - laplaceStep(v),
      {
        y: [
          (v) => fin(laplaceStep(v)),
          (v) =>
            v.t! >= v.tau!
              ? '{y0} × e^(−{k} × {t}) + {A} ÷ {k} × (1 − e^(−{k} × ({t} − {tau})))'
              : '{y0} × e^(−{k} × {t})',
          (v) =>
            v.t! >= v.tau!
              ? 'After the switch, u(t − τ) = 1: the start fades as e^(−kt) while the input’s part climbs toward A ÷ k.'
              : 'Before the switch, u(t − τ) = 0: only the starting value, fading as e^(−kt), is left.',
        ],
        y0: [
          (v) =>
            fin(
              (v.y! -
                (v.t! >= v.tau! ? (v.A! / v.k!) * (1 - Math.exp(-v.k! * (v.t! - v.tau!))) : 0)) *
                Math.exp(v.k! * v.t!),
            ),
          (v) =>
            v.t! >= v.tau!
              ? '({y} − {A} ÷ {k} × (1 − e^(−{k} × ({t} − {tau})))) × e^({k} × {t})'
              : '{y} × e^({k} × {t})',
          'Take away the input’s part, then undo the fading by multiplying by e^(kt).',
        ],
      },
    ),
  ],
  example: example({ k: 0.5, A: 2, tau: 2, y0: 1, t: 4 }, ['y', laplaceStep]),
  startWith: ['t', 'k', 'A', 'tau', 'y0'],
  representation: {
    kind: 'functionGraph',
    family: 'expr',
    expr: 'y0 * exp(-k * t) + A / k * (1 - exp(-k * (t - tau))) * u(t - tau)',
    of: 't',
    from: 0,
    name: 'y',
    input: 't',
    at: { x: 't', y: 'y' },
    xMin: 0,
    axes: { x: 'Time t', y: 'Solution y' },
  },
});

/** ∫ from a to b of x·e^(kx) dx = [e^(kx)(x ÷ k − 1 ÷ k²)] from a to b. */
const byParts = (v: Values) => {
  const F = (x: number) => Math.exp(v.k! * x) * (x / v.k! - 1 / v.k! ** 2);
  return F(v.b!) - F(v.a!);
};

const EXPR_PARTS = page({
  id: 'g.he-functionGraph-expr-parts',
  title: 'Integration by parts: x times an exponential',
  use: 'Use this for “Evaluate ∫ from 0 to 1 of x eˣ dx.”',
  assumptions: [
    '∫u dv = uv − ∫v du, with u = x (simpler once differentiated) and dv = e^(kx) dx.',
    'k is not 0 (k = 0 leaves ∫x dx, no exponential).',
  ],
  variables: [
    num('k', 'k', 'Rate in the exponent', -5, 5, { step: 0.5 }),
    num('a', 'a', 'Lower limit', -10, 10, { step: 0.5 }),
    num('b', 'b', 'Upper limit', -10, 10, { step: 0.5 }),
    num('I', 'I', 'Integral', -1e9, 1e9, { derived: true }),
  ],
  rules: [
    derive(
      'by-parts',
      'I',
      ['k', 'a', 'b'],
      '{I} = e^({k} × {b}) × ({b} ÷ {k} − 1 ÷ {k}²) − e^({k} × {a}) × ({a} ÷ {k} − 1 ÷ {k}²)',
      (v) => fin(byParts(v)),
      'e^({k} × {b}) × ({b} ÷ {k} − 1 ÷ {k}²) − e^({k} × {a}) × ({a} ÷ {k} − 1 ÷ {k}²)',
      'By parts, ∫x e^(kx) dx = x e^(kx) ÷ k − e^(kx) ÷ k². Evaluate it at b, then take its value at a.',
    ),
    limit(
      'k-not-0',
      '{k} ≠ 0',
      (v) => v.k !== 0,
      'k = 0 leaves ∫x dx: no exponential to integrate.',
    ),
  ],
  example: example({ k: 1, a: 0, b: 1 }, ['I', byParts]),
  startWith: ['k', 'a', 'b'],
  representation: {
    kind: 'functionGraph',
    family: 'expr',
    expr: 'x * exp(k * x)',
    area: { from: 'a', to: 'b', value: 'I' },
  },
});

// ── HC10: hill ──

const hillAt = (L: number, K: number, n: number, top = 1) => (top * L ** n) / (K ** n + L ** n);

const HILL = page({
  id: 'g.he-functionGraph-hill',
  title: 'Cooperative binding: the Hill equation',
  use: 'Use this for “With K = 26 and n = 2.8, how saturated is the protein at 40?”',
  workedFigures: 3,
  unitSystems: ['metric'],
  assumptions: [
    'Binding is cooperative: one ligand bound makes the next bind more easily (n > 1).',
    'K is the ligand level that fills half the sites, in the same unit as [L].',
  ],
  variables: [
    num('K', 'K', 'Half-saturation pressure', 0.001, 1000, { unit: 'mmHg', step: 1 }),
    num('nH', 'n', 'Hill coefficient', 0.5, 4, { step: 0.1 }),
    num('L', 'L', 'Oxygen pressure', 0, 1000, { unit: 'mmHg', step: 1 }),
    num('theta', 'θ', 'Fraction bound', 0, 0.9999),
  ],
  rules: [
    rule(
      'hill',
      '{theta} = {L}^{nH} ÷ ({K}^{nH} + {L}^{nH})',
      ['theta', 'L', 'K', 'nH'],
      (v) => v.theta! - hillAt(v.L!, v.K!, v.nH!),
      {
        theta: [
          (v) => fin(hillAt(v.L!, v.K!, v.nH!)),
          '{L}^{nH} ÷ ({K}^{nH} + {L}^{nH})',
          'Raise [L] and K to the Hill coefficient; the share bound is [L]ⁿ over their sum.',
        ],
        L: [
          (v) =>
            v.theta! >= 1 ? undefined : fin(v.K! * (v.theta! / (1 - v.theta!)) ** (1 / v.nH!)),
          '{K} × ({theta} ÷ (1 − {theta}))^(1 ÷ {nH})',
          'Bound over free is ([L] ÷ K)ⁿ: take the n-th root and multiply by K.',
        ],
        K: [
          (v) =>
            v.theta! <= 0 ? undefined : fin(v.L! * ((1 - v.theta!) / v.theta!) ** (1 / v.nH!)),
          '{L} × ((1 − {theta}) ÷ {theta})^(1 ÷ {nH})',
          'Free over bound is (K ÷ [L])ⁿ: take the n-th root and multiply by [L].',
        ],
      },
    ),
  ],
  example: example({ K: 26, nH: 2.8, L: 40 }, ['theta', (v) => hillAt(v.L!, v.K!, v.nH!)]),
  startWith: ['L', 'K', 'nH'],
  representation: {
    kind: 'functionGraph',
    family: 'hill',
    K: 'K',
    n: 'nH',
    name: 'θ',
    input: 'L',
    at: { x: 'L', y: 'theta' },
    xMin: 0,
    axes: { x: 'Oxygen pressure L (mmHg)', y: 'Fraction bound θ' },
  },
});

const HILL_N1 = page({
  id: 'g.he-functionGraph-hill-n1',
  title: 'An enzyme sensor saturates (n = 1)',
  use: 'Use this for “Why does a glucose sensor read low at 20 mM?”',
  workedFigures: 3,
  unitSystems: ['metric'],
  assumptions: [
    'One site per enzyme (n = 1): the current follows i_max C ÷ (K_m + C).',
    'The reading is nearly linear only well under K_m.',
  ],
  variables: [
    num('imax', 'i_max', 'Largest current', 0.01, 10000, { unit: 'nA', step: 1 }),
    num('Km', 'K_m', 'Half-saturation concentration', 0.01, 1000, { unit: 'mM', step: 0.5 }),
    num('C', 'C', 'Glucose concentration', 0, 1000, { unit: 'mM', step: 0.5 }),
    num('i', 'i', 'Current', 0, 10000, { unit: 'nA' }),
  ],
  rules: [
    rule(
      'saturation',
      '{i} = {imax} × {C} ÷ ({Km} + {C})',
      ['i', 'imax', 'C', 'Km'],
      (v) => v.i! - hillAt(v.C!, v.Km!, 1, v.imax!),
      {
        i: [
          (v) => fin(hillAt(v.C!, v.Km!, 1, v.imax!)),
          '{imax} × {C} ÷ ({Km} + {C})',
          'The current is i_max times the share of enzyme busy, C ÷ (K_m + C).',
        ],
        C: [
          (v) => div(v.i! * v.Km!, v.imax! - v.i!),
          '{i} × {Km} ÷ ({imax} − {i})',
          'Multiply out, collect the C terms, and divide by i_max − i.',
        ],
        Km: [
          (v) => div(v.C! * (v.imax! - v.i!), v.i!),
          '{C} × ({imax} − {i}) ÷ {i}',
          'Multiply both sides by K_m + C, then solve for K_m.',
        ],
        imax: [
          (v) => div(v.i! * (v.Km! + v.C!), v.C!),
          '{i} × ({Km} + {C}) ÷ {C}',
          'Divide the current by the busy share C ÷ (K_m + C).',
        ],
      },
    ),
  ],
  example: example({ imax: 100, Km: 5, C: 6 }, ['i', (v) => hillAt(v.C!, v.Km!, 1, v.imax!)]),
  startWith: ['C', 'imax', 'Km'],
  representation: {
    kind: 'functionGraph',
    family: 'hill',
    K: 'Km',
    n: 1,
    top: 'imax',
    name: 'i',
    input: 'C',
    at: { x: 'C', y: 'i' },
    xMin: 0,
    marks: ['asymptotes'],
    axes: { x: 'Concentration C (mM)', y: 'Current i (nA)' },
  },
});

// ── HC10: bateman and a repeated dose ──

const tmaxOf = (v: Values) => Math.log(v.ka! / v.k!) / (v.ka! - v.k!);
const cAt = (v: Values, t: number) =>
  ((v.F! * v.D! * v.ka!) / (v.V! * (v.ka! - v.k!))) * (Math.exp(-v.k! * t) - Math.exp(-v.ka! * t));

const BATEMAN = page({
  id: 'g.he-functionGraph-bateman',
  title: 'An oral dose: peak time and peak level',
  use: 'Use this for “A 500 mg tablet is absorbed at 1 per hour and cleared at 0.1 per hour. When does it peak?”',
  workedFigures: 3,
  unitSystems: ['metric'],
  assumptions: [
    'One well-mixed compartment; first-order absorption (k_a) and elimination (k).',
    'k_a ≠ k. A fraction F of the dose reaches the blood.',
  ],
  variables: [
    num('F', 'F', 'Fraction absorbed', 0.01, 1, { step: 0.05 }),
    num('D', 'D', 'Dose', 0.01, 10000, { unit: 'mg', step: 10 }),
    num('V', 'V', 'Volume of distribution', 1, 1000, { unit: 'L', step: 1 }),
    num('ka', 'k_a', 'Absorption rate constant', 0.01, 20, { step: 0.05 }),
    num('k', 'k', 'Elimination rate constant', 0.001, 10, { step: 0.01 }),
    num('tmax', 't_max', 'Time of the peak', 0, 1000, { unit: 'h', derived: true }),
    num('Cmax', 'C_max', 'Peak concentration', 0, 100000, { unit: 'mg/L', derived: true }),
  ],
  rules: [
    derive(
      'tmax',
      'tmax',
      ['ka', 'k'],
      '{tmax} = ln({ka} ÷ {k}) ÷ ({ka} − {k})',
      (v) => fin(tmaxOf(v)),
      'ln({ka} ÷ {k}) ÷ ({ka} − {k})',
      'At the peak, absorption in equals elimination out: k_a e^(−k_a t) = k e^(−kt).',
    ),
    derive(
      'cmax',
      'Cmax',
      ['F', 'D', 'V', 'ka', 'k', 'tmax'],
      '{Cmax} = {F} × {D} × {ka} ÷ ({V} × ({ka} − {k})) × (e^(−{k} × {tmax}) − e^(−{ka} × {tmax}))',
      (v) => fin(cAt(v, v.tmax!)),
      '{F} × {D} × {ka} ÷ ({V} × ({ka} − {k})) × (e^(−{k} × {tmax}) − e^(−{ka} × {tmax}))',
      'Put t_max into the Bateman curve: the level climbs while absorption leads, then falls.',
    ),
    limit('ka-not-k', '{ka} ≠ {k}', (v) => v.ka !== v.k, 'k_a = k makes the formula 0 ÷ 0.'),
  ],
  example: example(
    { F: 1, D: 500, V: 50, ka: 1, k: 0.1 },
    ['tmax', tmaxOf],
    ['Cmax', (v) => cAt(v, v.tmax!)],
  ),
  startWith: ['D', 'F', 'V', 'ka', 'k'],
  representation: {
    kind: 'functionGraph',
    family: 'bateman',
    F: 'F',
    D: 'D',
    V: 'V',
    ka: 'ka',
    k: 'k',
    feature: { x: 'tmax', y: 'Cmax' },
    name: 'C',
    input: 't',
    xMin: 0,
    axes: { x: 'Time t (h)', y: 'Concentration C (mg/L)' },
  },
});

const REPEAT = page({
  id: 'g.he-functionGraph-repeat',
  title: 'Repeated doses build to a steady level',
  use: 'Use this for “A 500 mg dose every 8 h, clearance 5 L/h. What is the average steady-state level?”',
  workedFigures: 3,
  unitSystems: ['metric'],
  assumptions: [
    'Each dose is given at once into one well-mixed compartment and cleared at first order.',
    'Doses add: the level is the sum of every dose so far, each fading as e^(−kt).',
  ],
  variables: [
    num('D', 'D', 'Dose', 0.01, 10000, { unit: 'mg', step: 10 }),
    num('tau', 'τ', 'Dosing interval', 0.5, 72, { unit: 'h', step: 0.5 }),
    num('CL', 'CL', 'Clearance', 0.01, 100, { unit: 'L/h', step: 0.5 }),
    num('V', 'V', 'Volume of distribution', 1, 1000, { unit: 'L', step: 1 }),
    num('k', 'k', 'Elimination rate constant', 0.0001, 10),
    num('Css', 'C_ss,avg', 'Average steady level', 0, 100000, { unit: 'mg/L' }),
    num('R', 'R', 'Accumulation factor', 1, 1000, { derived: true }),
  ],
  rules: [
    rule('k', '{k} = {CL} ÷ {V}', ['k', 'CL', 'V'], (v) => v.k! - v.CL! / v.V!, {
      k: [
        (v) => div(v.CL!, v.V!),
        '{CL} ÷ {V}',
        'Clearance over volume is the share cleared each hour.',
      ],
      CL: [(v) => v.k! * v.V!, '{k} × {V}', 'Multiply the rate constant by the volume.'],
      V: [(v) => div(v.CL!, v.k!), '{CL} ÷ {k}', 'Divide the clearance by the rate constant.'],
    }),
    rule(
      'css',
      '{Css} = {D} ÷ ({CL} × {tau})',
      ['Css', 'D', 'CL', 'tau'],
      (v) => v.Css! - v.D! / (v.CL! * v.tau!),
      {
        Css: [
          (v) => div(v.D!, v.CL! * v.tau!),
          '{D} ÷ ({CL} × {tau})',
          'At steady state, each interval clears one dose: the average level is D ÷ (CL τ).',
        ],
        D: [(v) => v.Css! * v.CL! * v.tau!, '{Css} × {CL} × {tau}', 'Multiply the level by CL τ.'],
        tau: [
          (v) => div(v.D!, v.Css! * v.CL!),
          '{D} ÷ ({Css} × {CL})',
          'Divide the dose by the level times the clearance.',
        ],
      },
    ),
    derive(
      'accumulation',
      'R',
      ['k', 'tau'],
      '{R} = 1 ÷ (1 − e^(−{k} × {tau}))',
      (v) => div(1, 1 - Math.exp(-v.k! * v.tau!)),
      '1 ÷ (1 − e^(−{k} × {tau}))',
      'Each dose leaves e^(−kτ) of the last behind; the doses sum to 1 ÷ (1 − e^(−kτ)) of one.',
    ),
  ],
  example: example(
    { D: 500, tau: 8, CL: 5, V: 50 },
    ['k', (v) => v.CL! / v.V!],
    ['Css', (v) => v.D! / (v.CL! * v.tau!)],
    ['R', (v) => 1 / (1 - Math.exp(-v.k! * v.tau!))],
  ),
  startWith: ['D', 'tau', 'CL', 'V'],
  representation: {
    kind: 'functionGraph',
    family: 'expr',
    expr: 'D / V * exp(-k * t)',
    of: 't',
    repeat: { every: 'tau', count: 6, avg: 'Css' },
    name: 'C',
    input: 't',
    xMin: 0,
    axes: { x: 'Time t (h)', y: 'Concentration C (mg/L)' },
  },
});

// ── HC10: a real power ──

const SPECIES_AREA = page({
  id: 'g.he-functionGraph-power-real',
  title: 'Species and area: S = cA^z',
  use: 'Use this for “If a reserve keeps half its area and z = 0.25, what share of species remains?”',
  workedFigures: 3,
  unitSystems: ['metric'],
  assumptions: [
    'The species–area rule holds over this range of areas, with the same c and z.',
    'Keeping a share p of the area keeps a share p^z of the species.',
  ],
  variables: [
    num('c', 'c', 'Species in 1 km²', 0.1, 1000, { step: 1 }),
    num('z', 'z', 'Exponent', 0.1, 0.4, { step: 0.01 }),
    num('A', 'A', 'Area', 1, 1e7, { unit: 'km²', step: 100 }),
    num('S', 'S', 'Species', 0, 1e7),
    num('p', 'p', 'Share of area kept', 0.01, 1, { step: 0.05 }),
    num('q', 'q', 'Share of species kept', 0, 1),
  ],
  rules: [
    rule(
      'species-area',
      '{S} = {c} × {A}^{z}',
      ['S', 'c', 'A', 'z'],
      (v) => v.S! - v.c! * v.A! ** v.z!,
      {
        S: [
          (v) => fin(v.c! * v.A! ** v.z!),
          '{c} × {A}^{z}',
          'Raise the area to z and multiply by c.',
        ],
        c: [(v) => div(v.S!, v.A! ** v.z!), '{S} ÷ {A}^{z}', 'Divide the species by A^z.'],
        A: [
          (v) => (v.S! > 0 && v.c! > 0 ? fin((v.S! / v.c!) ** (1 / v.z!)) : undefined),
          '({S} ÷ {c})^(1 ÷ {z})',
          'Divide by c, then take the z-th root (raise to 1 ÷ z).',
        ],
      },
    ),
    rule('kept', '{q} = {p}^{z}', ['q', 'p', 'z'], (v) => v.q! - v.p! ** v.z!, {
      q: [
        (v) => fin(v.p! ** v.z!),
        '{p}^{z}',
        'S = cA^z, so a share p of the area keeps p^z of S.',
      ],
      p: [
        (v) => (v.q! > 0 ? fin(v.q! ** (1 / v.z!)) : undefined),
        '{q}^(1 ÷ {z})',
        'Undo the power: raise the species share to 1 ÷ z.',
      ],
      z: [
        (v) =>
          v.p! > 0 && v.p! !== 1 && v.q! > 0 ? fin(Math.log(v.q!) / Math.log(v.p!)) : undefined,
        'ln({q}) ÷ ln({p})',
        'Take logs of both sides: ln q = z ln p.',
      ],
    }),
  ],
  example: example(
    { c: 20, z: 0.25, A: 10000, p: 0.5 },
    ['S', (v) => v.c! * v.A! ** v.z!],
    ['q', (v) => v.p! ** v.z!],
  ),
  startWith: ['A', 'c', 'z', 'p'],
  representation: {
    kind: 'functionGraph',
    family: 'power',
    a: 'c',
    exponent: 'z',
    name: 'S',
    input: 'A',
    at: { x: 'A', y: 'S' },
    xMin: 0,
    axes: { x: 'Area A (km²)', y: 'Species S' },
  },
});

const HEART_RATE = page({
  id: 'g.he-functionGraph-power-negative',
  title: 'Heart rate falls with body mass: f = aM^b',
  use: 'Use this for “With f = 241M^(−0.25), what resting heart rate fits a 70 kg mammal?”',
  workedFigures: 3,
  unitSystems: ['metric'],
  assumptions: [
    'An allometric rule fitted across mammals; one animal can differ from it.',
    'A negative exponent: the bigger the animal, the slower the heart.',
  ],
  variables: [
    num('a', 'a', 'Rate at 1 kg', 1, 1000, { step: 1 }),
    num('b', 'b', 'Exponent', -1, -0.1, { step: 0.01 }),
    num('M', 'M', 'Body mass', 0.001, 100000, { unit: 'kg', step: 1 }),
    num('f', 'f', 'Heart rate (beats a minute)', 0, 100000),
  ],
  rules: [
    rule(
      'allometry',
      '{f} = {a} × {M}^{b}',
      ['f', 'a', 'M', 'b'],
      (v) => v.f! - v.a! * v.M! ** v.b!,
      {
        f: [
          (v) => fin(v.a! * v.M! ** v.b!),
          '{a} × {M}^{b}',
          'Raise the mass to b and multiply by a.',
        ],
        a: [(v) => div(v.f!, v.M! ** v.b!), '{f} ÷ {M}^{b}', 'Divide the rate by M^b.'],
        M: [
          (v) => (v.f! > 0 && v.a! > 0 ? fin((v.f! / v.a!) ** (1 / v.b!)) : undefined),
          '({f} ÷ {a})^(1 ÷ {b})',
          'Divide by a, then raise to 1 ÷ b.',
        ],
      },
    ),
  ],
  example: example({ a: 241, b: -0.25, M: 70 }, ['f', (v) => v.a! * v.M! ** v.b!]),
  startWith: ['M', 'a', 'b'],
  representation: {
    kind: 'functionGraph',
    family: 'power',
    a: 'a',
    exponent: 'b',
    name: 'f',
    input: 'M',
    at: { x: 'M', y: 'f' },
    xMin: 0,
    marks: ['asymptotes'],
    axes: { x: 'Body mass M (kg)', y: 'Heart rate f (per minute)' },
  },
});

// ── HC10: erfc ──

/** 2√(Dt) in mm, with D in m²/s and t in hours. */
const diffLength = (v: Values) => 2 * Math.sqrt(v.D! * v.t! * 3600) * 1000;

const CARBURIZE = page({
  id: 'g.he-functionGraph-erfc',
  title: 'Carburizing: carbon at a depth',
  use: 'Use this for “Steel at 0.20 wt% C is carburized at 1.00 wt% for 10 h. What is the carbon 0.5 mm down?”',
  workedFigures: 3,
  unitSystems: ['metric'],
  assumptions: [
    'The surface holds C_s from the start, and the steel is deep compared with 2√(Dt).',
    'D does not change with the carbon content (one temperature, one D).',
  ],
  variables: [
    num('C0', 'C₀', 'Starting carbon', 0, 2, { unit: 'wt%', step: 0.05 }),
    num('Cs', 'C_s', 'Surface carbon', 0.01, 2, { unit: 'wt%', step: 0.05 }),
    num('x', 'x', 'Depth', 0, 20, { unit: 'mm', step: 0.05 }),
    num('D', 'D', 'Diffusion coefficient (m²/s)', 1e-15, 1e-8, { scientific: true }),
    num('t', 't', 'Time', 0.01, 1000, { unit: 'h', step: 0.5 }),
    num('L', '2√(Dt)', 'Diffusion length', 0.000001, 1000, { unit: 'mm', derived: true }),
    num('z', 'z', 'Depth over the diffusion length', 0, 1000),
    num('Cx', 'C_x', 'Carbon at the depth', 0, 2, { unit: 'wt%', derived: true }),
  ],
  rules: [
    derive(
      'length',
      'L',
      ['D', 't'],
      '{L} = 2 × √({D} × {t} × 3600) × 1000',
      (v) => fin(diffLength(v)),
      '2 × √({D} × {t} × 3600) × 1000',
      'Turn the hours into seconds (× 3600), take 2√(Dt) in metres, then × 1000 for millimetres.',
    ),
    rule('z', '{z} = {x} ÷ {L}', ['z', 'x', 'L'], (v) => v.z! - v.x! / v.L!, {
      z: [(v) => div(v.x!, v.L!), '{x} ÷ {L}', 'Measure the depth in diffusion lengths.'],
      x: [(v) => v.z! * v.L!, '{z} × {L}', 'Multiply z by the diffusion length.'],
    }),
    derive(
      'profile',
      'Cx',
      ['Cs', 'C0', 'z'],
      '{Cx} = {Cs} − ({Cs} − {C0}) × erf({z})',
      (v) => fin(v.Cs! - (v.Cs! - v.C0!) * erf(v.z!)),
      '{Cs} − ({Cs} − {C0}) × erf({z})',
      'Fick’s second law with a fixed surface: (C_x − C₀) ÷ (C_s − C₀) = 1 − erf(z).',
    ),
  ],
  example: example(
    { C0: 0.2, Cs: 1, x: 0.5, D: 1.6e-11, t: 10 },
    ['L', diffLength],
    ['z', (v) => v.x! / v.L!],
    ['Cx', (v) => v.Cs! - (v.Cs! - v.C0!) * erf(v.z!)],
  ),
  startWith: ['x', 'C0', 'Cs', 'D', 't'],
  representation: {
    kind: 'functionGraph',
    family: 'erfc',
    Cs: 'Cs',
    C0: 'C0',
    width: 'L',
    name: 'C',
    input: 'x',
    at: { x: 'x', y: 'Cx' },
    xMin: 0,
    axes: { x: 'Depth x (mm)', y: 'Carbon C (wt%)' },
  },
});

// ── HC12: regions ──

/** F(x) = px³ ÷ 3 + qx² ÷ 2 + rx, an antiderivative of px² + qx + r. */
const antiQuad = (v: Values, x: number) => (v.p! * x ** 3) / 3 + (v.q! * x ** 2) / 2 + v.r! * x;

/** ∫ from a to b of (px² + qx + r) dx, shaded (signed: the parts above and below apart). */
function definite(id: string, title: string, use: string, typed: Values, signed: boolean) {
  const exactly = { fraction: 12, improper: true } as const;
  return page({
    id,
    title,
    use,
    assumptions: [
      'F′ = f (the Fundamental Theorem, part 2): any antiderivative gives F(b) − F(a).',
      'Area below the axis counts negative; a > b flips the sign.',
    ],
    variables: [
      num('p', 'p', 'x² coefficient', -50, 50, { step: 0.5 }),
      num('q', 'q', 'x coefficient', -50, 50, { step: 0.5 }),
      num('r', 'r', 'Constant term', -50, 50, { step: 0.5 }),
      num('a', 'a', 'Lower limit', -100, 100, { step: 0.5 }),
      num('b', 'b', 'Upper limit', -100, 100, { step: 0.5 }),
      num('Fa', 'F(a)', 'Antiderivative at a', -1e8, 1e8, { derived: true, ...exactly }),
      num('Fb', 'F(b)', 'Antiderivative at b', -1e8, 1e8, { derived: true, ...exactly }),
      num('I', 'I', 'Integral', -1e8, 1e8, { derived: true, ...exactly }),
    ],
    rules: [
      derive(
        'F(a)',
        'Fa',
        ['p', 'q', 'r', 'a'],
        '{Fa} = {p} × {a}³ ÷ 3 + {q} × {a}² ÷ 2 + {r} × {a}',
        (v) => antiQuad(v, v.a!),
        '{p} × {a}³ ÷ 3 + {q} × {a}² ÷ 2 + {r} × {a}',
        'An antiderivative of px² + qx + r is px³ ÷ 3 + qx² ÷ 2 + rx: put in a.',
      ),
      derive(
        'F(b)',
        'Fb',
        ['p', 'q', 'r', 'b'],
        '{Fb} = {p} × {b}³ ÷ 3 + {q} × {b}² ÷ 2 + {r} × {b}',
        (v) => antiQuad(v, v.b!),
        '{p} × {b}³ ÷ 3 + {q} × {b}² ÷ 2 + {r} × {b}',
        'The same antiderivative at b.',
      ),
      derive(
        'I = F(b) − F(a)',
        'I',
        ['Fb', 'Fa'],
        '{I} = {Fb} − {Fa}',
        (v) => v.Fb! - v.Fa!,
        '{Fb} − {Fa}',
        'The integral is the change in the antiderivative from a to b.',
      ),
    ],
    example: example(
      typed,
      ['Fa', (v) => antiQuad(v, v.a!)],
      ['Fb', (v) => antiQuad(v, v.b!)],
      ['I', (v) => v.Fb! - v.Fa!],
    ),
    startWith: ['p', 'q', 'r', 'a', 'b'],
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'standard',
      a: 'p',
      b: 'q',
      c: 'r',
      area: { from: 'a', to: 'b', value: 'I', ...(signed ? { signed: true } : {}) },
    },
  });
}

const AREA = definite(
  'g.he-functionGraph-area',
  'A definite integral, shaded',
  'Use this for “Evaluate the integral of x² + 1 from 1 to 3.”',
  { p: 1, q: 0, r: 1, a: 1, b: 3 },
  false,
);
const SIGNED = definite(
  'g.he-functionGraph-signed',
  'Signed area: above the axis counts +, below counts −',
  'Use this for “Evaluate the integral of x² − 1 from 0 to 2, and say why it is less than the area.”',
  { p: 1, q: 0, r: -1, a: 0, b: 2 },
  true,
);

/** The crossings of y = mx + c and y = x²: x² − mx − c = 0. */
const crossAt = (v: Values, sign: -1 | 1) => (v.m! + sign * Math.sqrt(v.m! ** 2 + 4 * v.c!)) / 2;

const BETWEEN = page({
  id: 'g.he-functionGraph-between',
  title: 'The area between a line and a parabola',
  use: 'Use this for “Find the area between y = x + 2 and y = x².”',
  assumptions: [
    'The line is above the parabola between the crossings, so the area is ∫(line − parabola) dx.',
    'The line meets the parabola twice: m² + 4c > 0.',
  ],
  variables: [
    num('m', 'm', 'Slope of the line', -20, 20, { step: 0.5 }),
    num('c', 'c', 'Intercept of the line', -20, 100, { step: 0.5 }),
    num('x1', 'x₁', 'Left crossing', -100, 100, { derived: true }),
    num('x2', 'x₂', 'Right crossing', -100, 100, { derived: true }),
    num('A', 'A', 'Area between', 0, 1e7, { derived: true, fraction: 12, improper: true }),
  ],
  rules: [
    derive(
      'x1',
      'x1',
      ['m', 'c'],
      '{x1} = ({m} − √({m}² + 4 × {c})) ÷ 2',
      (v) => fin(crossAt(v, -1)),
      '({m} − √({m}² + 4 × {c})) ÷ 2',
      'Set mx + c = x², so x² − mx − c = 0; the quadratic formula’s smaller root.',
    ),
    derive(
      'x2',
      'x2',
      ['m', 'c'],
      '{x2} = ({m} + √({m}² + 4 × {c})) ÷ 2',
      (v) => fin(crossAt(v, 1)),
      '({m} + √({m}² + 4 × {c})) ÷ 2',
      'The larger root of x² − mx − c = 0.',
    ),
    derive(
      'A',
      'A',
      ['x1', 'x2'],
      '{A} = ({x2} − {x1})³ ÷ 6',
      (v) => (v.x2! - v.x1!) ** 3 / 6,
      '({x2} − {x1})³ ÷ 6',
      'Between the roots, mx + c − x² = (x − x₁)(x₂ − x), whose integral is (x₂ − x₁)³ ÷ 6.',
    ),
    limit(
      'two-crossings',
      '{m}² + 4 × {c} > 0',
      (v) => v.m! ** 2 + 4 * v.c! > 0,
      'The line must cross the parabola twice to close a region.',
    ),
  ],
  example: example(
    { m: 1, c: 2 },
    ['x1', (v) => crossAt(v, -1)],
    ['x2', (v) => crossAt(v, 1)],
    ['A', (v) => (v.x2! - v.x1!) ** 3 / 6],
  ),
  startWith: ['m', 'c'],
  representation: {
    kind: 'functionGraph',
    family: 'linear',
    m: 'm',
    b: 'c',
    other: { family: 'quadratic', form: 'standard', a: 1, b: 0, c: 0 },
    between: { value: 'A' },
  },
});

const STRIP = page({
  id: 'g.he-functionGraph-strip',
  title: 'A region between y = x² and y = kx, sliced',
  use: 'Use this for “Find the double integral of x over the region between y = x² and y = 2x.”',
  assumptions: [
    'Type I: for each x from 0 to k, y runs from x² up to kx (one upright slice).',
    'k > 0, so the line is above the parabola between the crossings 0 and k.',
  ],
  variables: [
    num('k', 'k', 'Slope of the line', 0.1, 10, { step: 0.1 }),
    num('xm', 'x', 'A slice’s x (the middle)', 0, 5, { derived: true }),
    num('I', 'I', 'Double integral of x', 0, 1e6, { derived: true, fraction: 12, improper: true }),
  ],
  rules: [
    derive(
      'slice',
      'xm',
      ['k'],
      '{xm} = {k} ÷ 2',
      (v) => v.k! / 2,
      '{k} ÷ 2',
      'One slice in the middle of 0 to k shows the inner integral, from x² up to kx.',
    ),
    derive(
      'I',
      'I',
      ['k'],
      '{I} = {k}⁴ ÷ 12',
      (v) => v.k! ** 4 / 12,
      '{k}⁴ ÷ 12',
      'Inside, ∫ x dy from x² to kx is x(kx − x²). Outside, ∫ (kx² − x³) dx from 0 to k is k⁴ ÷ 3 − k⁴ ÷ 4.',
    ),
  ],
  example: example({ k: 1 }, ['xm', (v) => v.k! / 2], ['I', (v) => v.k! ** 4 / 12]),
  startWith: ['k'],
  representation: {
    kind: 'functionGraph',
    family: 'linear',
    m: 'k',
    b: 0,
    other: { family: 'quadratic', form: 'standard', a: 1, b: 0, c: 0 },
    between: {},
    strip: { at: 'xm' },
  },
});

// ── HC12: a level line ──

const potential = (v: Values) => v.a! * v.x! ** 3 - v.b! * v.x! ** 2;

const POTENTIAL = page({
  id: 'g.he-functionGraph-level',
  title: 'A potential curve and an energy level',
  use: 'Use this for “With U(x) = x³ − 3x² J and E = −1 J, where can the particle be, and how fast?”',
  unitSystems: ['metric'],
  assumptions: [
    'Energy is conserved: K = E − U, so the particle moves only where U ≤ E.',
    'The turning points are where the level E meets U(x).',
  ],
  variables: [
    num('a', 'a', 'Cubic coefficient (J/m³)', -100, 100, { step: 0.5 }),
    num('b', 'b', 'Square coefficient (J/m²)', -100, 100, { step: 0.5 }),
    num('x', 'x', 'Position', -10, 10, { unit: 'm', step: 0.1 }),
    num('U', 'U', 'Potential energy', -1e6, 1e6, { unit: 'J' }),
    num('E', 'E', 'Total energy', -1e6, 1e6, { unit: 'J', step: 0.5 }),
    num('K', 'K', 'Kinetic energy', 0, 1e6, { unit: 'J' }),
  ],
  rules: [
    rule('U', '{U} = {a} × {x}³ − {b} × {x}²', ['U', 'a', 'x', 'b'], (v) => v.U! - potential(v), {
      U: [potential, '{a} × {x}³ − {b} × {x}²', 'Put the position into U(x).'],
      a: [
        (v) => div(v.U! + v.b! * v.x! ** 2, v.x! ** 3),
        '({U} + {b} × {x}²) ÷ {x}³',
        'Add bx², then divide by x³.',
      ],
      b: [
        (v) => div(v.a! * v.x! ** 3 - v.U!, v.x! ** 2),
        '({a} × {x}³ − {U}) ÷ {x}²',
        'Move U across, then divide by x².',
      ],
    }),
    rule('K', '{K} = {E} − {U}', ['K', 'E', 'U'], (v) => v.K! - (v.E! - v.U!), {
      K: [(v) => v.E! - v.U!, '{E} − {U}', 'The energy not stored as U is kinetic.'],
      E: [(v) => v.K! + v.U!, '{K} + {U}', 'The total is kinetic plus potential.'],
      U: [(v) => v.E! - v.K!, '{E} − {K}', 'Take the kinetic energy from the total.'],
    }),
  ],
  example: example({ a: 1, b: 3, x: 1, E: -1 }, ['U', potential], ['K', (v) => v.E! - v.U!]),
  startWith: ['x', 'a', 'b', 'E'],
  representation: {
    kind: 'functionGraph',
    family: 'expr',
    expr: 'a * x^3 - b * x^2',
    name: 'U',
    at: { x: 'x', y: 'U' },
    level: { y: 'E', label: 'E' },
    axes: { x: 'Position x (m)', y: 'Energy (J)' },
  },
});

/** The turning radii: the roots of εr² + GMr − h² ÷ 2 = 0 (ε < 0). */
const turnAt = (v: Values, sign: -1 | 1) => {
  const root = Math.sqrt(v.GM! ** 2 + 2 * v.eps! * v.h! ** 2);
  // The nearer root as h² ÷ (GM + √…): the same root, with no cancellation when GM is large.
  return sign > 0 ? v.h! ** 2 / (v.GM! + root) : (-v.GM! - root) / (2 * v.eps!);
};

const TURNING = page({
  id: 'g.he-functionGraph-level-turning',
  title: 'An orbit’s turning points on the effective potential',
  use: 'Use this for “An orbit has ε = −20.82 km²/s² and h = 59,500 km²/s. How close and how far does it go?”',
  unitSystems: ['metric'],
  assumptions: [
    'Per unit mass, U_eff = −GM ÷ r + h² ÷ (2r²); the radial motion stops where U_eff = ε.',
    'A bound orbit: ε < 0, and above the well’s floor, so there are two turning points.',
  ],
  variables: [
    num('GM', 'GM', 'Gravitational parameter (km³/s²)', 1, 1e9, { step: 100 }),
    num('eps', 'ε', 'Energy per mass (km²/s²)', -1e6, -0.000001, { step: 0.01 }),
    num('h', 'h', 'Angular momentum per mass (km²/s)', 1, 1e9, { step: 100 }),
    num('rmin', 'r_min', 'Closest distance', 0, 1e9, { unit: 'km', derived: true }),
    num('rmax', 'r_max', 'Farthest distance', 0, 1e9, { unit: 'km', derived: true }),
  ],
  rules: [
    derive(
      'rmin',
      'rmin',
      ['GM', 'eps', 'h'],
      '{rmin} = {h}² ÷ ({GM} + √({GM}² + 2 × {eps} × {h}²))',
      (v) => fin(turnAt(v, 1)),
      '{h}² ÷ ({GM} + √({GM}² + 2 × {eps} × {h}²))',
      'Set U_eff = ε and multiply by r²: εr² + GMr − h² ÷ 2 = 0. The nearer root, written so nothing cancels.',
    ),
    derive(
      'rmax',
      'rmax',
      ['GM', 'eps', 'h'],
      '{rmax} = (−{GM} − √({GM}² + 2 × {eps} × {h}²)) ÷ (2 × {eps})',
      (v) => fin(turnAt(v, -1)),
      '(−{GM} − √({GM}² + 2 × {eps} × {h}²)) ÷ (2 × {eps})',
      'The other root of the same quadratic is the farther turning point.',
    ),
    limit(
      'bound',
      '{GM}² + 2 × {eps} × {h}² > 0',
      (v) => v.GM! ** 2 + 2 * v.eps! * v.h! ** 2 > 0,
      'Below the floor of the well: no orbit has this energy and angular momentum.',
    ),
  ],
  example: example(
    { GM: 398600, eps: -20.82, h: 59500 },
    ['rmin', (v) => turnAt(v, 1)],
    ['rmax', (v) => turnAt(v, -1)],
  ),
  startWith: ['GM', 'eps', 'h'],
  representation: {
    kind: 'functionGraph',
    family: 'expr',
    expr: '-GM / r + h^2 / (2 * r^2)',
    of: 'r',
    from: 0,
    name: 'U_eff',
    input: 'r',
    level: { y: 'eps', label: 'ε', at: ['rmin', 'rmax'] },
    axes: { x: 'Distance r (km)', y: 'Energy per mass (km²/s²)' },
  },
});

// ── HC12: accumulation ──

const areaSoFar = (v: Values) => (v.m! * (v.x! ** 2 - v.a! ** 2)) / 2 + v.c! * (v.x! - v.a!);

const ACCUMULATION = page({
  id: 'g.he-functionGraph-accumulation',
  title: 'The area function F(x) and its slope',
  use: 'Use this for “F(x) is the integral of 2t + 1 from 0 to x. Find F(3) and F′(3).”',
  assumptions: [
    'F(x) = ∫ from a to x of f(t) dt collects the signed area as x moves.',
    'The Fundamental Theorem, part 1: F′(x) = f(x).',
  ],
  variables: [
    num('m', 'm', 'Slope of f', -20, 20, { step: 0.5 }),
    num('c', 'c', 'Intercept of f', -20, 20, { step: 0.5 }),
    num('a', 'a', 'Start', -20, 20, { step: 0.5 }),
    num('x', 'x', 'End', -20, 20, { step: 0.1 }),
    num('F', 'F(x)', 'Area so far', -1e6, 1e6, { derived: true }),
    num('Fp', 'F′(x)', 'Slope of F at x', -1e6, 1e6),
  ],
  rules: [
    derive(
      'F',
      'F',
      ['m', 'c', 'a', 'x'],
      '{F} = {m} × ({x}² − {a}²) ÷ 2 + {c} × ({x} − {a})',
      (v) => areaSoFar(v),
      '{m} × ({x}² − {a}²) ÷ 2 + {c} × ({x} − {a})',
      'An antiderivative of mt + c is mt² ÷ 2 + ct: take its value at x minus its value at a.',
    ),
    rule(
      'Fp',
      '{Fp} = {m} × {x} + {c}',
      ['Fp', 'm', 'x', 'c'],
      (v) => v.Fp! - (v.m! * v.x! + v.c!),
      {
        Fp: [
          (v) => v.m! * v.x! + v.c!,
          '{m} × {x} + {c}',
          'F′(x) = f(x): the slope of the area function is the height of f at x.',
        ],
        x: [
          (v) => div(v.Fp! - v.c!, v.m!),
          '({Fp} − {c}) ÷ {m}',
          'Find where f reaches that height.',
        ],
        c: [(v) => v.Fp! - v.m! * v.x!, '{Fp} − {m} × {x}', 'Take mx from the height.'],
      },
    ),
  ],
  example: example({ m: 2, c: 1, a: 0, x: 3 }, ['F', areaSoFar], ['Fp', (v) => v.m! * v.x! + v.c!]),
  startWith: ['x', 'm', 'c', 'a'],
  representation: {
    kind: 'functionGraph',
    family: 'linear',
    m: 'm',
    b: 'c',
    input: 't',
    at: { x: 'x', y: 'Fp' },
    accumulation: { from: 'a', x: 'x', value: 'F' },
  },
});

// ── HC12: presets ──

const vCstr = (v: Values) => (v.FA0! * v.X!) / (v.k! * v.CA0! * (1 - v.X!));
const vPfr = (v: Values) => (v.FA0! / (v.k! * v.CA0!)) * -Math.log(1 - v.X!);

const LEVENSPIEL = page({
  id: 'g.he-functionGraph-levenspiel',
  title: 'Levenspiel plot: which reactor is smaller',
  use: 'Use this for “For a first-order reaction at 80% conversion, which is smaller, a CSTR or a PFR?”',
  workedFigures: 3,
  unitSystems: ['metric'],
  assumptions: [
    'First order, liquid phase (constant density), isothermal: −r_A = kC_A0(1 − X).',
    'A CSTR runs at the exit rate (the rectangle); a PFR passes every rate on the way (the area).',
  ],
  variables: [
    num('FA0', 'F_A0', 'Feed rate of A', 0.01, 10000, { unit: 'mol/min', step: 1 }),
    num('k', 'k', 'Rate constant (per min)', 0.001, 100, { step: 0.01 }),
    num('CA0', 'C_A0', 'Feed concentration', 0.001, 100, { unit: 'mol/L', step: 0.1 }),
    num('X', 'X', 'Conversion', 0.01, 0.99, { step: 0.01 }),
    num('Vc', 'V_CSTR', 'CSTR volume', 0, 1e9, { unit: 'L', derived: true }),
    num('Vp', 'V_PFR', 'PFR volume', 0, 1e9, { unit: 'L', derived: true }),
  ],
  rules: [
    derive(
      'Vc',
      'Vc',
      ['FA0', 'k', 'CA0', 'X'],
      '{Vc} = {FA0} × {X} ÷ ({k} × {CA0} × (1 − {X}))',
      (v) => fin(vCstr(v)),
      '{FA0} × {X} ÷ ({k} × {CA0} × (1 − {X}))',
      'A CSTR works at the exit rate: V = F_A0X ÷ (−r_A) at X, the rectangle.',
    ),
    derive(
      'Vp',
      'Vp',
      ['FA0', 'k', 'CA0', 'X'],
      '{Vp} = {FA0} ÷ ({k} × {CA0}) × (−ln(1 − {X}))',
      (v) => fin(vPfr(v)),
      '{FA0} ÷ ({k} × {CA0}) × (−ln(1 − {X}))',
      'A PFR adds up F_A0 dX ÷ (−r_A) from 0 to X, the area under the curve.',
    ),
  ],
  example: example({ FA0: 20, k: 0.2, CA0: 2, X: 0.8 }, ['Vc', vCstr], ['Vp', vPfr]),
  startWith: ['FA0', 'k', 'CA0', 'X'],
  representation: {
    kind: 'functionGraph',
    family: 'levenspiel',
    FA0: 'FA0',
    k: 'k',
    CA0: 'CA0',
    X: 'X',
    cstr: 'Vc',
    pfr: 'Vp',
    input: 'X',
    name: 'F_A0/(−r_A)',
    axes: { x: 'Conversion X', y: 'F_A0 ÷ (−r_A) (L)' },
  },
});

const RAD = Math.PI / 180;
const d0Of = (v: Values) => Math.asin(v.pm! / v.pmax!) / RAD;
const dcOf = (v: Values) => {
  const d0 = v.d0! * RAD;
  return Math.acos((Math.PI - 2 * d0) * Math.sin(d0) - Math.cos(d0)) / RAD;
};
const tcrOf = (v: Values) =>
  Math.sqrt((4 * v.H! * (v.dc! - v.d0!) * RAD) / (2 * Math.PI * v.f! * v.pm!));

const EQUAL_AREA = page({
  id: 'g.he-functionGraph-equalarea',
  title: 'Equal-area criterion: the critical clearing angle',
  use: 'Use this for “Find the critical clearing time for a generator with H = 5 s delivering 1 pu with P_max = 2 pu.”',
  workedFigures: 3,
  unitSystems: ['metric'],
  assumptions: [
    'The fault drops the power sent to 0 until cleared; the same line returns after.',
    'Damping is ignored: the rotor speeds up over A₁ and must give it all back over A₂.',
  ],
  variables: [
    num('pm', 'P_m', 'Mechanical power (pu)', 0.01, 10, { step: 0.05 }),
    num('pmax', 'P_max', 'Largest power sent (pu)', 0.01, 20, { step: 0.05 }),
    num('H', 'H', 'Inertia constant', 1, 20, { unit: 's', step: 0.5 }),
    num('f', 'f', 'Frequency', 1, 100, { unit: 'Hz', step: 1 }),
    num('d0', 'δ₀', 'Starting angle', 0, 90, { unit: '°', derived: true }),
    num('dc', 'δ_cr', 'Critical clearing angle', 0, 180, { unit: '°', derived: true }),
    num('dmax', 'δ_max', 'Largest swing angle', 90, 180, { unit: '°', derived: true }),
    num('tcr', 't_cr', 'Critical clearing time', 0, 100, { unit: 's', derived: true }),
  ],
  rules: [
    derive(
      'd0',
      'd0',
      ['pm', 'pmax'],
      '{d0} = sin⁻¹({pm} ÷ {pmax})',
      (v) => fin(d0Of(v)),
      'sin⁻¹({pm} ÷ {pmax})',
      'Before the fault the power sent matches P_m: P_max sin δ₀ = P_m.',
    ),
    derive(
      'dc',
      'dc',
      ['d0'],
      '{dc} = cos⁻¹((π − 2 × {d0} × π ÷ 180) × sin({d0}°) − cos({d0}°))',
      (v) => fin(dcOf(v)),
      'cos⁻¹((π − 2 × {d0} × π ÷ 180) × sin({d0}°) − cos({d0}°))',
      'A₁ = A₂ gives cos δ_cr = (π − 2δ₀) sin δ₀ − cos δ₀, with δ₀ in radians inside the bracket.',
    ),
    derive(
      'dmax',
      'dmax',
      ['d0'],
      '{dmax} = 180 − {d0}',
      (v) => 180 - v.d0!,
      '180 − {d0}',
      'The swing can go as far as where the sine falls back to P_m: 180° − δ₀.',
    ),
    derive(
      'tcr',
      'tcr',
      ['H', 'dc', 'd0', 'f', 'pm'],
      '{tcr} = √(4 × {H} × ({dc} − {d0}) × π ÷ 180 ÷ (2 × π × {f} × {pm}))',
      (v) => fin(tcrOf(v)),
      '√(4 × {H} × ({dc} − {d0}) × π ÷ 180 ÷ (2 × π × {f} × {pm}))',
      'With no power out, the angle grows as δ₀ + (πfP_m ÷ (2H))t²: solve for the time to reach δ_cr.',
    ),
    limit(
      'pm-under-pmax',
      '{pm} < {pmax}',
      (v) => v.pm! < v.pmax!,
      'P_m must be less than P_max to run at all.',
    ),
  ],
  example: example(
    { pm: 1, pmax: 2, H: 5, f: 60 },
    ['d0', d0Of],
    ['dc', dcOf],
    ['dmax', (v) => 180 - v.d0!],
    ['tcr', tcrOf],
  ),
  startWith: ['pm', 'pmax', 'H', 'f'],
  representation: {
    kind: 'functionGraph',
    family: 'equalArea',
    pm: 'pm',
    pmax: 'pmax',
    dc: 'dc',
    d0: 'd0',
    dmax: 'dmax',
    name: 'P',
    input: 'δ',
    axes: { x: 'Rotor angle δ (°)', y: 'Power P (pu)' },
  },
});

// ── HC12: an area under a real power (its edge, n = 0, is a constant force) ──

const workOf = (v: Values) => (v.c! * (v.x2! ** (v.n! + 1) - v.x1! ** (v.n! + 1))) / (v.n! + 1);

const POWER_WORK = page({
  id: 'g.he-functionGraph-area-power',
  title: 'Work by a force F = cxⁿ, the area under it',
  use: 'Use this for “A force F = 30x² N acts from 1 m to 2 m. How much work does it do?”',
  workedFigures: 3,
  unitSystems: ['metric'],
  assumptions: [
    'The force acts along the motion, so the work is the area under F from x₁ to x₂.',
    'x ≥ 0 here, so xⁿ is defined for every n.',
  ],
  variables: [
    num('c', 'c', 'Force constant (N/mⁿ)', -1000, 1000, { step: 1 }),
    num('n', 'n', 'Power', 0, 4, { integer: true }),
    num('x1', 'x₁', 'Start', 0, 100, { unit: 'm', step: 0.1 }),
    num('x2', 'x₂', 'End', 0, 100, { unit: 'm', step: 0.1 }),
    num('W', 'W', 'Work', -1e12, 1e12, { unit: 'J', derived: true }),
  ],
  rules: [
    derive(
      'W',
      'W',
      ['c', 'n', 'x1', 'x2'],
      '{W} = {c} × ({x2}^({n} + 1) − {x1}^({n} + 1)) ÷ ({n} + 1)',
      (v) => fin(workOf(v)),
      '{c} × ({x2}^({n} + 1) − {x1}^({n} + 1)) ÷ ({n} + 1)',
      'The power rule: ∫cxⁿ dx = cxⁿ⁺¹ ÷ (n + 1); take its value at x₂ minus at x₁.',
    ),
  ],
  example: example({ c: 30, n: 2, x1: 1, x2: 2 }, ['W', workOf]),
  startWith: ['c', 'n', 'x1', 'x2'],
  representation: {
    kind: 'functionGraph',
    family: 'power',
    a: 'c',
    exponent: 'n',
    name: 'F',
    area: { from: 'x1', to: 'x2', value: 'W' },
    xMin: 0,
    axes: { x: 'Position x (m)', y: 'Force F (N)' },
  },
});

export const HE1E_GALLERY_MODULES: ModuleDef[] = [
  EXPR_STEP,
  EXPR_PARTS,
  HILL,
  HILL_N1,
  BATEMAN,
  REPEAT,
  SPECIES_AREA,
  HEART_RATE,
  CARBURIZE,
  AREA,
  SIGNED,
  BETWEEN,
  STRIP,
  POTENTIAL,
  TURNING,
  ACCUMULATION,
  LEVENSPIEL,
  EQUAL_AREA,
  POWER_WORK,
];

export const HE1E_GALLERY_LAYOUTS: LayoutDef[] = [];
