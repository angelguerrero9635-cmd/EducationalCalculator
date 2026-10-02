/**
 * College gallery demos, round 1, group E (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC10: `functionGraph` families expr, hill, bateman, a repeated dose, a real power and erfc.
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
];

export const HE1E_GALLERY_LAYOUTS: LayoutDef[] = [];
