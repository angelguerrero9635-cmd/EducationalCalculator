/**
 * College gallery demos, round 3, group A (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC42: `functionGraph` `family: 'distribution'`: Maxwell's speeds (thermal-statistical#2~speeds,
 * gen-chem-1#2~kinetic), Planck's curves (thermal-statistical#3~photon-gas,
 * heat-transfer#2~blackbody), the three occupancies (thermal-statistical#3).
 * HC45: numerical methods (numerical-methods#0, ~bisection, #2, #3, #4 and its types): Newton's
 * tangents, bisection's brackets, Lagrange's polynomial through the nodes, the trapezoid and
 * Simpson's rule, Euler, Heun and RK4 over the exact curve.
 * HC92: `family: 'quantizer'`: an ADC and a DAC (embedded#0, ~dac), quantization
 * (signals#4~quantization).
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

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
/** A result as a box shows it: × 10ⁿ when very small or large (4.167 × 10⁻⁶). */
const shown = (x: number) => {
  const ax = Math.abs(x);
  if (ax === 0 || (ax >= 1e-4 && ax < 1e7)) return lit(x);
  const e = Math.floor(Math.log10(ax));
  const m = Number((x / 10 ** e).toPrecision(4));
  const sup = [...String(e)].map((ch) => (ch === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(ch)])).join('');
  return `${String(m).replace('-', '−')} × 10${sup}`;
};
/** A template with each {id} replaced by its value. */
const fill = (t: string, v: Values) => t.replace(/\{(\w+)\}/g, (_, id: string) => lit(v[id]!));
/** A finite number, or nothing. */
const fin = (x: number) => (Number.isFinite(x) ? x : undefined);
/** A number for a sentence: 4 figures. */
const say = (x: number) => String(Number(x.toPrecision(4))).replace('-', '−');
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sub = (n: number) => [...String(n)].map((d) => SUB[Number(d)]).join('');

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
  // A display in words ("Newton’s method from …") is checked as the step's arithmetic.
  if (/[A-Za-z]{3,}/.test(display.replace(/\{\w+\}/g, '')))
    r.relation.check = (v) =>
      `${fill(typeof expr === 'string' ? expr : expr(v), v)} = ${shown(v[x]!)}`;
  return r;
};

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
  d: Omit<ModuleDef, 'relations' | 'steps' | 'representation' | 'startWith'> & {
    rules: Rule[];
    representation: Representation;
  },
): ModuleDef {
  const { rules, ...rest } = d;
  return {
    ...rest,
    // College pages are metric; every typed value opens filled (the example is whole).
    unitSystems: ['metric'],
    startWith: d.variables.filter((v) => !v.derived).map((v) => v.id),
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

// ─── HC42: Maxwell's speeds ───────────────────────────────────────────────────

const vpOf = (v: Values) => Math.sqrt((2 * v.R! * v.T!) / (v.M! / 1000));
const avgOf = (v: Values) => Math.sqrt((8 * v.R! * v.T!) / (Math.PI * (v.M! / 1000)));
const rmsOf = (v: Values) => Math.sqrt((3 * v.R! * v.T!) / (v.M! / 1000));

const gasVars = (): VariableDef[] => [
  num('M', 'M', 'Molar mass', 'g/mol', 1, 400, { step: 0.01 }),
  num('T', 'T', 'Temperature', 'K', 1, 5000, { step: 1 }),
  num('R', 'R', 'Gas constant', 'J/(mol·K)', 8, 9, { step: 0.001 }),
];

const rmsRule = (x: string) =>
  derive(
    'rms',
    x,
    ['R', 'T', 'M'],
    `{${x}} = √(3 × {R} × {T} ÷ ({M} ÷ 1000))`,
    rmsOf,
    '√(3 × {R} × {T} ÷ ({M} ÷ 1000))',
    'The root-mean-square speed is √(3RT ÷ M), with M in kg/mol: divide the g/mol by 1000 first.',
  );

const MAXWELL = page({
  id: 'g.he-functionGraph-maxwell',
  title: 'Maxwell’s distribution of molecular speeds',
  use: 'Use this for “Find the most probable, mean and rms speeds of N₂ molecules at 300 K.”',
  assumptions: [
    'An ideal gas in equilibrium at T: the speeds follow the Maxwell–Boltzmann distribution.',
    'M is the molar mass in g/mol; the formulas need kg/mol, so it is divided by 1000.',
    'vₚ < ⟨v⟩ < vᵣₘₛ always: the long tail of fast molecules pulls the mean and the rms up.',
  ],
  variables: [
    ...gasVars(),
    num('T2', 'T₂', 'A second temperature (dashed)', 'K', 1, 5000, { step: 1 }),
    out('vp', 'v_p', 'Most probable speed', 'm/s'),
    out('vavg', '⟨v⟩', 'Mean speed', 'm/s'),
    out('vrms', 'v_rms', 'Root-mean-square speed', 'm/s'),
    out('vp2', 'v_p2', 'Most probable speed at T₂', 'm/s'),
  ],
  rules: [
    derive(
      'vp',
      'vp',
      ['R', 'T', 'M'],
      '{vp} = √(2 × {R} × {T} ÷ ({M} ÷ 1000))',
      vpOf,
      '√(2 × {R} × {T} ÷ ({M} ÷ 1000))',
      'The peak of f(v) is at √(2RT ÷ M), with M in kg/mol.',
    ),
    derive(
      'avg',
      'vavg',
      ['R', 'T', 'M'],
      '{vavg} = √(8 × {R} × {T} ÷ (π × {M} ÷ 1000))',
      avgOf,
      '√(8 × {R} × {T} ÷ (π × {M} ÷ 1000))',
      'The mean speed is √(8RT ÷ πM).',
    ),
    rmsRule('vrms'),
    derive(
      'vp2',
      'vp2',
      ['R', 'T2', 'M'],
      '{vp2} = √(2 × {R} × {T2} ÷ ({M} ÷ 1000))',
      (v) => vpOf({ ...v, T: v.T2! }),
      '√(2 × {R} × {T2} ÷ ({M} ÷ 1000))',
      'The same gas at T₂: its peak moves right and drops (dashed).',
    ),
  ],
  example: example(
    { M: 28.01, T: 300, R: 8.314, T2: 600 },
    ['vp', vpOf],
    ['vavg', avgOf],
    ['vrms', rmsOf],
    ['vp2', (v) => vpOf({ ...v, T: v.T2! })],
  ),
  representation: {
    kind: 'functionGraph',
    family: 'distribution',
    distribution: 'maxwell',
    molar: 'M',
    T: 'T',
    R: 'R',
    compare: { T: 'T2' },
    speeds: { vp: 'vp', avg: 'vavg', rms: 'vrms' },
    name: 'f',
    input: 'v',
    axes: { x: 'Speed v (m/s)', y: 'f(v) (10⁻³ s/m)' },
    fixed: true,
  },
});

const KINETIC = page({
  id: 'g.he-functionGraph-maxwell-kinetic',
  title: 'Root-mean-square speed and kinetic energy',
  use: 'Use this for “Find the rms speed and the average kinetic energy per mole of N₂ at 300 K.”',
  assumptions: [
    'R = 8.314 J/(mol·K); u = √(3RT ÷ M) with M in kg/mol.',
    'The average kinetic energy per mole, (3/2)RT, depends on T only.',
    'At the same T a lighter gas moves faster: helium (dashed) beside the gas typed.',
  ],
  variables: [
    ...gasVars(),
    num('M2', 'M₂', 'A second gas’s molar mass (dashed)', 'g/mol', 1, 400, { step: 0.001 }),
    out('u', 'u', 'Root-mean-square speed', 'm/s'),
    out('KE', 'KE', 'Average kinetic energy per mole', 'J/mol'),
    out('u2', 'u₂', 'Second gas’s rms speed', 'm/s'),
  ],
  rules: [
    rmsRule('u'),
    derive(
      'ke',
      'KE',
      ['R', 'T'],
      '{KE} = 3 ÷ 2 × {R} × {T}',
      (v) => 1.5 * v.R! * v.T!,
      '3 ÷ 2 × {R} × {T}',
      'The average kinetic energy per mole is (3/2)RT.',
    ),
    derive(
      'u2',
      'u2',
      ['R', 'T', 'M2'],
      '{u2} = √(3 × {R} × {T} ÷ ({M2} ÷ 1000))',
      (v) => rmsOf({ ...v, M: v.M2! }),
      '√(3 × {R} × {T} ÷ ({M2} ÷ 1000))',
      'The second gas at the same T: lighter, so faster (dashed).',
    ),
  ],
  example: example(
    { M: 28.01, T: 300, R: 8.314, M2: 4.003 },
    ['u', rmsOf],
    ['KE', (v) => 1.5 * v.R! * v.T!],
    ['u2', (v) => rmsOf({ ...v, M: v.M2! })],
  ),
  representation: {
    kind: 'functionGraph',
    family: 'distribution',
    distribution: 'maxwell',
    molar: 'M',
    T: 'T',
    R: 'R',
    compare: { molar: 'M2', gas: 'He' },
    speeds: { rms: 'u' },
    name: 'f',
    input: 'v',
    axes: { x: 'Speed v (m/s)', y: 'f(v) (10⁻³ s/m)' },
    fixed: true,
  },
});

// ─── HC42: Planck's curves ────────────────────────────────────────────────────

const PHOTON_GAS = page({
  id: 'g.he-functionGraph-planck',
  title: 'A blackbody’s spectrum: Wien and Stefan–Boltzmann',
  use: 'Use this for “At what wavelength does a 5800 K blackbody glow brightest, and what power per area does it give off?”',
  assumptions: [
    'A blackbody: its spectrum is Planck’s law, set by T alone.',
    'Wien’s law: λₘₐₓT = b, b = 2898 μm·K; ×1000 gives nm.',
    'Stefan–Boltzmann: the power per area is σT⁴, σ = 5.670 × 10⁻⁸ W/(m²·K⁴).',
  ],
  variables: [
    num('T', 'T', 'Temperature', 'K', 100, 50000, { step: 1 }),
    num('T2', 'T₂', 'A cooler body (dashed)', 'K', 100, 50000, { step: 1 }),
    num('b', 'b', 'Wien’s constant', 'μm·K', 2800, 3000, { step: 0.1 }),
    num('sigma', 'σ', 'Stefan–Boltzmann constant', 'W/(m²·K⁴)', 5e-8, 6e-8, {
      step: 1e-11,
      scientific: true,
    }),
    num('A', 'A', 'Area', 'm²', 0.0001, 1e6, { step: 0.01 }),
    out('lmax', 'λ_max', 'Peak wavelength', 'nm'),
    out('E', 'σT⁴', 'Power per area', 'W/m²', { scientific: true }),
    out('P', 'P', 'Total power', 'W', { scientific: true }),
    out('lmax2', 'λ_max2', 'Peak wavelength at T₂', 'nm'),
  ],
  rules: [
    derive(
      'wien',
      'lmax',
      ['b', 'T'],
      '{lmax} = {b} ÷ {T} × 1000',
      (v) => (v.b! / v.T!) * 1000,
      '{b} ÷ {T} × 1000',
      'Wien’s law: λₘₐₓ = b ÷ T in μm; times 1000 gives nm.',
    ),
    derive(
      'sb',
      'E',
      ['sigma', 'T'],
      '{E} = {sigma} × {T}⁴',
      (v) => v.sigma! * v.T! ** 4,
      '{sigma} × {T}^4',
      'Stefan–Boltzmann: every square meter gives off σT⁴.',
    ),
    derive(
      'power',
      'P',
      ['E', 'A'],
      '{P} = {E} × {A}',
      (v) => v.E! * v.A!,
      '{E} × {A}',
      'The total power is the power per area times the area.',
    ),
    derive(
      'wien2',
      'lmax2',
      ['b', 'T2'],
      '{lmax2} = {b} ÷ {T2} × 1000',
      (v) => (v.b! / v.T2!) * 1000,
      '{b} ÷ {T2} × 1000',
      'The cooler body peaks farther into the red (dashed).',
    ),
  ],
  example: example(
    { T: 5800, T2: 4000, b: 2898, sigma: 5.67e-8, A: 1 },
    ['lmax', (v) => (v.b! / v.T!) * 1000],
    ['E', (v) => v.sigma! * v.T! ** 4],
    ['P', (v) => v.E! * v.A!],
    ['lmax2', (v) => (v.b! / v.T2!) * 1000],
  ),
  representation: {
    kind: 'functionGraph',
    family: 'distribution',
    distribution: 'planck',
    T: 'T',
    others: ['T2'],
    wien: 'b',
    unit: 'nm',
    peak: 'lmax',
    name: 'E',
    input: 'λ',
    axes: { x: 'Wavelength λ (nm)', y: 'E_bλ (kW/(m²·nm))' },
    fixed: true,
  },
});

const BLACKBODY = page({
  id: 'g.he-functionGraph-planck-room',
  title: 'A blackbody at room temperature',
  use: 'Use this for “Where does a 300 K surface radiate most, and what is its blackbody emissive power?”',
  assumptions: [
    'λₘₐₓT = 2898 μm·K (Wien); E_b = σT⁴ (Stefan–Boltzmann), T in kelvins.',
    'At 300 K the peak is in the far infrared: almost nothing falls in the visible band.',
    'A real surface gives off εσT⁴ with ε ≤ 1; a blackbody has ε = 1.',
  ],
  variables: [
    num('T', 'T', 'Temperature', 'K', 100, 50000, { step: 1 }),
    num('b', 'b', 'Wien’s constant', 'μm·K', 2800, 3000, { step: 0.1 }),
    num('sigma', 'σ', 'Stefan–Boltzmann constant', 'W/(m²·K⁴)', 5e-8, 6e-8, {
      step: 1e-11,
      scientific: true,
    }),
    out('lmax', 'λ_max', 'Peak wavelength', 'μm'),
    out('Eb', 'E_b', 'Emissive power', 'W/m²'),
  ],
  rules: [
    derive(
      'wien',
      'lmax',
      ['b', 'T'],
      '{lmax} = {b} ÷ {T}',
      (v) => v.b! / v.T!,
      '{b} ÷ {T}',
      'Wien’s displacement law: λₘₐₓ = b ÷ T.',
    ),
    derive(
      'sb',
      'Eb',
      ['sigma', 'T'],
      '{Eb} = {sigma} × {T}⁴',
      (v) => v.sigma! * v.T! ** 4,
      '{sigma} × {T}^4',
      'Stefan–Boltzmann: E_b = σT⁴, with T in kelvins.',
    ),
  ],
  example: example(
    { T: 300, b: 2898, sigma: 5.67e-8 },
    ['lmax', (v) => v.b! / v.T!],
    ['Eb', (v) => v.sigma! * v.T! ** 4],
  ),
  representation: {
    kind: 'functionGraph',
    family: 'distribution',
    distribution: 'planck',
    T: 'T',
    wien: 'b',
    peak: 'lmax',
    yScale: 1,
    name: 'E',
    input: 'λ',
    axes: { x: 'Wavelength λ (μm)', y: 'E_bλ (W/(m²·μm))' },
    fixed: true,
  },
});

// ─── HC42: the three occupancies ──────────────────────────────────────────────

const xOf = (v: Values) => v.dE! / (v.kB! * v.T!);

const occupancy = (id: string, title: string, use: string, dE: number): ModuleDef =>
  page({
    id,
    title,
    use,
    assumptions: [
      'f is the mean number of particles in one state of energy E, at temperature T.',
      'Fermions never exceed 1 (Pauli); bosons pile up as E − μ → 0 (E − μ > 0 for bosons).',
      'All three agree when x = (E − μ) ÷ k_BT ≫ 1, the classical limit.',
    ],
    variables: [
      num('dE', 'E − μ', 'Energy above the chemical potential', 'eV', 0.0001, 10, { step: 0.001 }),
      num('T', 'T', 'Temperature', 'K', 1, 100000, { step: 1 }),
      num('kB', 'k_B', 'Boltzmann constant', 'eV/K', 8e-5, 9e-5, {
        step: 1e-9,
        scientific: true,
      }),
      out('x', 'x', '(E − μ) ÷ k_BT'),
      out('fFD', 'f_FD', 'Fermi–Dirac occupancy'),
      out('fBE', 'f_BE', 'Bose–Einstein occupancy'),
      out('fMB', 'f_MB', 'Boltzmann occupancy'),
    ],
    rules: [
      limit(
        'classical',
        '{dE} ≤ 40 × {kB} × {T}',
        (v) => v.dE! <= 40 * v.kB! * v.T!,
        'Past 40 k_BT every occupancy is below 10⁻¹⁷: take E − μ nearer μ or T higher.',
      ),
      derive(
        'x',
        'x',
        ['dE', 'kB', 'T'],
        '{x} = {dE} ÷ ({kB} × {T})',
        xOf,
        '{dE} ÷ ({kB} × {T})',
        'Measure the energy in units of k_BT.',
      ),
      derive(
        'fd',
        'fFD',
        ['x'],
        '{fFD} = 1 ÷ (e^{x} + 1)',
        (v) => 1 / (Math.exp(v.x!) + 1),
        '1 ÷ (e^{x} + 1)',
        'Fermi–Dirac: the +1 keeps it at most 1.',
      ),
      derive(
        'be',
        'fBE',
        ['x'],
        '{fBE} = 1 ÷ (e^{x} − 1)',
        (v) => (v.x! > 0 ? 1 / (Math.exp(v.x!) - 1) : undefined),
        '1 ÷ (e^{x} − 1)',
        'Bose–Einstein: the −1 lets it grow past 1 near μ.',
      ),
      derive(
        'mb',
        'fMB',
        ['x'],
        '{fMB} = e^(−{x})',
        (v) => Math.exp(-v.x!),
        'e^(−{x})',
        'Boltzmann: the classical factor, between the other two.',
      ),
    ],
    example: example(
      { dE, T: 300, kB: 8.617e-5 },
      ['x', xOf],
      ['fFD', (v) => 1 / (Math.exp(v.x!) + 1)],
      ['fBE', (v) => 1 / (Math.exp(v.x!) - 1)],
      ['fMB', (v) => Math.exp(-v.x!)],
    ),
    representation: {
      kind: 'functionGraph',
      family: 'distribution',
      distribution: 'occupancy',
      energy: 'dE',
      T: 'T',
      kB: 'kB',
      fd: 'fFD',
      be: 'fBE',
      mb: 'fMB',
      name: 'f',
      input: 'x',
      axes: { x: 'x = (E − μ) ÷ k_BT', y: 'Occupancy f' },
      fixed: true,
    },
  });

const OCCUPANCY = occupancy(
  'g.he-functionGraph-occupancy',
  'Fermi–Dirac, Bose–Einstein and Boltzmann occupancy',
  'Use this for “Compare the three occupancies of a state 0.05 eV above μ at 300 K.”',
  0.05,
);
const OCCUPANCY_NEAR = occupancy(
  'g.he-functionGraph-occupancy-near',
  'Occupancy just above the chemical potential',
  'Use this for “How full is a state 0.01 eV above μ at 300 K, for fermions and for bosons?”',
  0.01,
);

// ─── HC45: Newton's method ────────────────────────────────────────────────────

const cubic = (v: Values) => (x: number) => ((v.c3! * x + v.c2!) * x + v.c1!) * x + v.c0!;
const cubicD = (v: Values) => (x: number) => (3 * v.c3! * x + 2 * v.c2!) * x + v.c1!;
const newtonPts = (v: Values) => {
  const [f, d] = [cubic(v), cubicD(v)];
  const xs = [v.x0!];
  for (let i = 0; i < Math.round(v.k!); i++) xs.push(xs[i]! - f(xs[i]!) / d(xs[i]!));
  return xs;
};

const NEWTON = page({
  id: 'g.he-functionGraph-newton',
  title: 'Newton’s method for a root',
  use: 'Use this for “Take one Newton step for x³ − x − 3 = 0 from x₀ = 2 and find the approximate error.”',
  assumptions: [
    'f(x) = c₃x³ + c₂x² + c₁x + c₀; f′ by the power rule.',
    'Each step follows the tangent at xₖ down to the axis: xₖ₊₁ = xₖ − f(xₖ) ÷ f′(xₖ).',
    'ε_a = |x₁ − x₀| ÷ |x₁| measures how much the step changed x.',
  ],
  variables: [
    num('c3', 'c₃', 'x³ coefficient', undefined, -20, 20, { step: 0.5 }),
    num('c2', 'c₂', 'x² coefficient', undefined, -20, 20, { step: 0.5 }),
    num('c1', 'c₁', 'x coefficient', undefined, -20, 20, { step: 0.5 }),
    num('c0', 'c₀', 'Constant', undefined, -50, 50, { step: 0.5 }),
    num('x0', 'x₀', 'Starting guess', undefined, -20, 20, { step: 0.1 }),
    num('k', 'k', 'Steps drawn', undefined, 1, 5, { integer: true }),
    out('f0', 'f(x₀)', 'Value at x₀'),
    out('d0', 'f′(x₀)', 'Slope at x₀'),
    out('x1', 'x₁', 'Next guess'),
    out('ea', 'ε_a', 'Approximate error', '%'),
    out('xk', 'x_k', 'Guess after k steps'),
  ],
  rules: [
    derive(
      'f0',
      'f0',
      ['c3', 'c2', 'c1', 'c0', 'x0'],
      '{f0} = {c3} × {x0}³ + {c2} × {x0}² + {c1} × {x0} + {c0}',
      (v) => cubic(v)(v.x0!),
      '{c3} × {x0}^3 + {c2} × {x0}^2 + {c1} × {x0} + {c0}',
      'Put x₀ into f.',
    ),
    derive(
      'd0',
      'd0',
      ['c3', 'c2', 'c1', 'x0'],
      '{d0} = 3 × {c3} × {x0}² + 2 × {c2} × {x0} + {c1}',
      (v) => cubicD(v)(v.x0!),
      '3 × {c3} × {x0}^2 + 2 × {c2} × {x0} + {c1}',
      'The power rule: f′(x) = 3c₃x² + 2c₂x + c₁.',
    ),
    derive(
      'x1',
      'x1',
      ['x0', 'f0', 'd0'],
      '{x1} = {x0} − {f0} ÷ {d0}',
      (v) => (v.d0 === 0 ? undefined : v.x0! - v.f0! / v.d0!),
      '{x0} − {f0} ÷ {d0}',
      'Follow the tangent at x₀ down to the axis.',
    ),
    derive(
      'ea',
      'ea',
      ['x1', 'x0'],
      '{ea} = |{x1} − {x0}| ÷ |{x1}| × 100',
      (v) => (v.x1 === 0 ? undefined : (Math.abs(v.x1! - v.x0!) / Math.abs(v.x1!)) * 100),
      '|{x1} − {x0}| ÷ |{x1}| × 100',
      'The change as a percent of the new guess.',
    ),
    derive(
      'xk',
      'xk',
      ['c3', 'c2', 'c1', 'c0', 'x0', 'k'],
      '{xk} = Newton’s method on {c3}x³ + {c2}x² + {c1}x + {c0} from {x0}, {k} steps',
      (v) => fin(newtonPts(v)[Math.round(v.k!)]!),
      (v) => {
        const xs = newtonPts(v);
        const p = xs[xs.length - 2]!;
        return `${lit(p)} − ${lit(cubic(v)(p))} ÷ ${lit(cubicD(v)(p))}`;
      },
      (v) => {
        const xs = newtonPts(v);
        const k = xs.length - 1;
        return k === 1
          ? 'One step: x₁ = x₀ − f(x₀) ÷ f′(x₀).'
          : `Each step: xₖ₊₁ = xₖ − f(xₖ) ÷ f′(xₖ). So far ${xs
              .slice(1, -1)
              .map((x, i) => `x${sub(i + 1)} = ${say(x)}`)
              .join(', ')}; the last step starts at x${sub(k - 1)}.`;
      },
    ),
  ],
  example: example(
    { c3: 1, c2: 0, c1: -1, c0: -3, x0: 2, k: 2 },
    ['f0', (v) => cubic(v)(v.x0!)],
    ['d0', (v) => cubicD(v)(v.x0!)],
    ['x1', (v) => v.x0! - v.f0! / v.d0!],
    ['ea', (v) => (Math.abs(v.x1! - v.x0!) / Math.abs(v.x1!)) * 100],
    ['xk', (v) => newtonPts(v)[Math.round(v.k!)]!],
  ),
  representation: {
    kind: 'functionGraph',
    family: 'polynomial',
    coefficients: ['c3', 'c2', 'c1', 'c0'],
    newton: { x0: 'x0', steps: 'k', next: 'xk' },
    fixed: true,
  },
});

// ─── HC45: bisection ──────────────────────────────────────────────────────────

const g3 = (x: number) => x ** 3 - x - 3;
const bisectPts = (v: Values) => {
  let [a, b] = [v.a!, v.b!];
  const ms: number[] = [];
  for (let i = 0; i < Math.round(v.k!); i++) {
    const m = (a + b) / 2;
    ms.push(m);
    if (Math.sign(g3(m)) === Math.sign(g3(a))) a = m;
    else b = m;
  }
  return { ms, a, b };
};

const BISECT = page({
  id: 'g.he-functionGraph-bisect',
  title: 'Bisection: halving the bracket',
  use: 'Use this for “Bisect x³ − x − 3 on [1, 2] once, and say how many halvings reach a tolerance of 10⁻⁴.”',
  assumptions: [
    'f(x) = x³ − x − 3 changes sign on [a, b], so a root lies between.',
    'Each step keeps the half whose ends still differ in sign.',
    'After n halvings the bracket is (b − a) ÷ 2ⁿ wide: n = ⌈log₂((b − a) ÷ tol)⌉.',
  ],
  variables: [
    num('a', 'a', 'Left end', undefined, -10, 10, { step: 0.1 }),
    num('b', 'b', 'Right end', undefined, -10, 10, { step: 0.1 }),
    num('tol', 'tol', 'Tolerance', undefined, 1e-9, 1, { step: 0.0001 }),
    num('k', 'k', 'Halvings drawn', undefined, 1, 6, { integer: true }),
    out('fa', 'f(a)', 'Value at a'),
    out('m', 'm', 'First midpoint'),
    out('fm', 'f(m)', 'Value at the midpoint'),
    out('n', 'n', 'Halvings for the tolerance'),
    out('mk', 'm_k', 'Midpoint of halving k'),
  ],
  rules: [
    limit('bracket', '{a} < {b}', (v) => v.a! < v.b!, 'The left end must be below the right.'),
    limit(
      'sign',
      'f({a}) × f({b}) < 0',
      (v) => g3(v.a!) * g3(v.b!) < 0,
      'f must change sign between a and b (its root is near 1.67).',
    ),
    derive(
      'fa',
      'fa',
      ['a'],
      '{fa} = {a}³ − {a} − 3',
      (v) => g3(v.a!),
      '{a}^3 − {a} − 3',
      'Put a into f.',
    ),
    derive(
      'm',
      'm',
      ['a', 'b'],
      '{m} = ({a} + {b}) ÷ 2',
      (v) => (v.a! + v.b!) / 2,
      '({a} + {b}) ÷ 2',
      'The midpoint of the bracket.',
    ),
    derive(
      'fm',
      'fm',
      ['m'],
      '{fm} = {m}³ − {m} − 3',
      (v) => g3(v.m!),
      '{m}^3 − {m} − 3',
      'Its sign says which half keeps the root: the half whose ends differ in sign.',
    ),
    derive(
      'n',
      'n',
      ['a', 'b', 'tol'],
      '{n} = ⌈log₂(({b} − {a}) ÷ {tol})⌉',
      (v) => Math.ceil(Math.log((v.b! - v.a!) / v.tol!) / Math.LN2 - 1e-9),
      '⌈ln(({b} − {a}) ÷ {tol}) ÷ ln(2)⌉',
      'Halve until the width (b − a) ÷ 2ⁿ is under the tolerance; log₂ x = ln x ÷ ln 2, rounded up.',
    ),
    derive(
      'mk',
      'mk',
      ['a', 'b', 'k'],
      '{mk} = bisection on [{a}, {b}], {k} halvings',
      (v) => bisectPts(v).ms[Math.round(v.k!) - 1],
      (v) => {
        const prev = bisectPts({ ...v, k: Math.round(v.k!) - 1 });
        return `(${lit(prev.a)} + ${lit(prev.b)}) ÷ 2`;
      },
      (v) => {
        const k = Math.round(v.k!);
        const prev = bisectPts({ ...v, k: k - 1 });
        return k === 1
          ? 'The first midpoint.'
          : `After ${k - 1} halving${k === 2 ? '' : 's'} the bracket is [${say(prev.a)}, ${say(prev.b)}]: its midpoint.`;
      },
    ),
  ],
  example: example(
    { a: 1, b: 2, tol: 0.0001, k: 3 },
    ['fa', (v) => g3(v.a!)],
    ['m', (v) => (v.a! + v.b!) / 2],
    ['fm', (v) => g3(v.m!)],
    ['n', (v) => Math.ceil(Math.log((v.b! - v.a!) / v.tol!) / Math.LN2 - 1e-9)],
    ['mk', (v) => bisectPts(v).ms[2]!],
  ),
  representation: {
    kind: 'functionGraph',
    family: 'polynomial',
    coefficients: [1, 0, -1, -3],
    bisect: { a: 'a', b: 'b', steps: 'k', mid: 'mk' },
    fixed: true,
  },
});

// ─── HC45: Lagrange interpolation ─────────────────────────────────────────────

const lagrange = (v: Values) => {
  const [x0, x1, x2, y0, y1, y2, X] = [v.x0!, v.x1!, v.x2!, v.y0!, v.y1!, v.y2!, v.X!];
  return (
    (y0 * (X - x1) * (X - x2)) / ((x0 - x1) * (x0 - x2)) +
    (y1 * (X - x0) * (X - x2)) / ((x1 - x0) * (x1 - x2)) +
    (y2 * (X - x0) * (X - x1)) / ((x2 - x0) * (x2 - x1))
  );
};

const INTERPOLATE = page({
  id: 'g.he-functionGraph-interpolate',
  title: 'Quadratic interpolation through three points',
  use: 'Use this for “Find the quadratic through (1, 2), (2, 3) and (4, 11) and use it at x = 3.”',
  assumptions: [
    'One quadratic passes through three points with different x values.',
    'Lagrange’s form: each term is one yᵢ times a factor that is 1 at xᵢ and 0 at the others.',
    'Between the nodes it estimates; far outside them it may stray.',
  ],
  variables: [
    num('x0', 'x₀', 'First x', undefined, -100, 100, { step: 0.5 }),
    num('y0', 'y₀', 'First y', undefined, -1000, 1000, { step: 0.5 }),
    num('x1', 'x₁', 'Second x', undefined, -100, 100, { step: 0.5 }),
    num('y1', 'y₁', 'Second y', undefined, -1000, 1000, { step: 0.5 }),
    num('x2', 'x₂', 'Third x', undefined, -100, 100, { step: 0.5 }),
    num('y2', 'y₂', 'Third y', undefined, -1000, 1000, { step: 0.5 }),
    num('X', 'x', 'Where to estimate', undefined, -100, 100, { step: 0.1 }),
    out('Y', 'y', 'Interpolated value'),
  ],
  rules: [
    limit(
      'distinct',
      '{x0} ≠ {x1} ≠ {x2}',
      (v) => v.x0 !== v.x1 && v.x1 !== v.x2 && v.x0 !== v.x2,
      'The three x values must differ.',
    ),
    derive(
      'lagrange',
      'Y',
      ['x0', 'y0', 'x1', 'y1', 'x2', 'y2', 'X'],
      '{Y} = Lagrange’s sum through ({x0}, {y0}), ({x1}, {y1}), ({x2}, {y2}) at {X}',
      lagrange,
      '{y0} × ({X} − {x1}) × ({X} − {x2}) ÷ (({x0} − {x1}) × ({x0} − {x2})) + {y1} × ({X} − {x0}) × ({X} − {x2}) ÷ (({x1} − {x0}) × ({x1} − {x2})) + {y2} × ({X} − {x0}) × ({X} − {x1}) ÷ (({x2} − {x0}) × ({x2} − {x1}))',
      'Each y times its factor (1 at its own x, 0 at the other two), added.',
    ),
  ],
  example: example({ x0: 1, y0: 2, x1: 2, y1: 3, x2: 4, y2: 11, X: 3 }, ['Y', lagrange]),
  representation: {
    kind: 'functionGraph',
    family: 'lagrange',
    through: [
      { x: 'x0', y: 'y0' },
      { x: 'x1', y: 'y1' },
      { x: 'x2', y: 'y2' },
    ],
    at: { x: 'X', y: 'Y' },
  },
});

// ─── HC45: the trapezoid and Simpson's rule ───────────────────────────────────

const power = (v: Values) => (x: number) => v.kc! * x ** v.p!;
const nodes = (v: Values) => {
  const n = Math.round(v.n!);
  const h = (v.b! - v.a!) / n;
  return Array.from({ length: n + 1 }, (_, i) => power(v)(v.a! + i * h));
};
const trap = (v: Values) => {
  const fs = nodes(v);
  const h = (v.b! - v.a!) / Math.round(v.n!);
  return (h / 2) * (fs[0]! + fs[fs.length - 1]! + 2 * fs.slice(1, -1).reduce((s, y) => s + y, 0));
};
const simp = (v: Values) => {
  const fs = nodes(v);
  const h = (v.b! - v.a!) / Math.round(v.n!);
  const inner = fs.slice(1, -1).reduce((s, y, i) => s + (i % 2 ? 2 : 4) * y, 0);
  return (h / 3) * (fs[0]! + fs[fs.length - 1]! + inner);
};
const exactI = (v: Values) => (v.kc! * (v.b! ** (v.p! + 1) - v.a! ** (v.p! + 1))) / (v.p! + 1);

const quadrature = (o: {
  id: string;
  title: string;
  use: string;
  side: 'trapezoid' | 'simpson';
  typed: Values;
}): ModuleDef => {
  const S = o.side === 'simpson';
  const est = S ? simp : trap;
  const name = S ? 'S' : 'T';
  return page({
    id: o.id,
    title: o.title,
    use: o.use,
    assumptions: [
      'f(x) = kxᵖ on [a, b] with n panels of width h = (b − a) ÷ n.',
      S
        ? 'Simpson’s rule fits a parabola to each pair of panels: n must be even; it is exact for cubics.'
        : 'The trapezoid rule joins the curve’s points by straight lines; it overestimates a curve that bends up.',
      'The exact value is k(bᵖ⁺¹ − aᵖ⁺¹) ÷ (p + 1); the error is the gap as a percent of it.',
    ],
    variables: [
      num('kc', 'k', 'Coefficient', undefined, -10, 10, { step: 0.5 }),
      num('p', 'p', 'Power', undefined, 1, 5, { integer: true }),
      num('a', 'a', 'Lower limit', undefined, -10, 10, { step: 0.5 }),
      num('b', 'b', 'Upper limit', undefined, -10, 10, { step: 0.5 }),
      num('n', 'n', 'Panels', undefined, S ? 2 : 1, 20, { integer: true }),
      out('h', 'h', 'Panel width'),
      out('E', name, S ? 'Simpson’s estimate' : 'Trapezoid estimate'),
      out('I', 'I', 'Exact integral'),
      out('err', 'ε', 'Error', '%'),
    ],
    rules: [
      limit('order', '{a} < {b}', (v) => v.a! < v.b!, 'The lower limit must be below the upper.'),
      ...(S
        ? [
            limit(
              'even',
              '{n} even',
              (v) => Math.round(v.n!) % 2 === 0,
              'Simpson’s rule needs an even n.',
            ),
          ]
        : []),
      derive(
        'h',
        'h',
        ['a', 'b', 'n'],
        '{h} = ({b} − {a}) ÷ {n}',
        (v) => (v.b! - v.a!) / v.n!,
        '({b} − {a}) ÷ {n}',
        'The panel width.',
      ),
      derive(
        'est',
        'E',
        ['kc', 'p', 'a', 'b', 'n', 'h'],
        `{E} = ${S ? 'Simpson’s rule' : 'the trapezoid rule'} on {kc}x^{p} from {a} to {b}, {n} panels of {h}`,
        est,
        (v) => {
          const fs = nodes(v).map(lit);
          const last = fs.length - 1;
          const terms = fs.map((y, i) =>
            i === 0 || i === last ? y : `${S ? (i % 2 ? 4 : 2) : 2} × ${y}`,
          );
          return `{h} ÷ ${S ? 3 : 2} × (${terms.join(' + ')})`;
        },
        (v) =>
          `The heights at the ${Math.round(v.n!) + 1} nodes, f = ${say(v.kc!)}xᵖ: ${S ? 'ends once, odd nodes ×4, even inner nodes ×2, times h ÷ 3' : 'ends once, inner nodes twice, times h ÷ 2'}.`,
      ),
      derive(
        'I',
        'I',
        ['kc', 'p', 'a', 'b'],
        '{I} = {kc} × ({b}^({p} + 1) − {a}^({p} + 1)) ÷ ({p} + 1)',
        exactI,
        '{kc} × ({b}^({p} + 1) − {a}^({p} + 1)) ÷ ({p} + 1)',
        'The power rule for integrals.',
      ),
      derive(
        'err',
        'err',
        ['E', 'I'],
        '{err} = |{E} − {I}| ÷ |{I}| × 100',
        (v) => (v.I === 0 ? undefined : (Math.abs(v.E! - v.I!) / Math.abs(v.I!)) * 100),
        '|{E} − {I}| ÷ |{I}| × 100',
        'The gap as a percent of the exact value.',
      ),
    ],
    example: example(
      o.typed,
      ['h', (v) => (v.b! - v.a!) / v.n!],
      ['E', est],
      ['I', exactI],
      ['err', (v) => (Math.abs(v.E! - v.I!) / Math.abs(v.I!)) * 100],
    ),
    representation: {
      kind: 'functionGraph',
      family: 'power',
      a: 'kc',
      p: 'p',
      riemann: { n: 'n', from: 'a', to: 'b', side: o.side, sum: 'E' },
      fixed: true,
    },
  });
};

const TRAPEZOID = quadrature({
  id: 'g.he-functionGraph-trapezoid',
  title: 'The composite trapezoid rule',
  use: 'Use this for “Estimate the integral of x³ from 0 to 2 with the trapezoid rule, n = 4, and find the error.”',
  side: 'trapezoid',
  typed: { kc: 1, p: 3, a: 0, b: 2, n: 4 },
});
const SIMPSON = quadrature({
  id: 'g.he-functionGraph-simpson',
  title: 'Simpson’s rule',
  use: 'Use this for “Estimate the integral of x⁴ from 0 to 2 with Simpson’s rule, n = 2, and find the error.”',
  side: 'simpson',
  typed: { kc: 1, p: 4, a: 0, b: 2, n: 2 },
});

// ─── HC45: Euler, Heun and RK4 on dy/dt = ky ──────────────────────────────────

const exactY = (v: Values) => v.y0! * Math.exp(v.k! * v.h! * Math.round(v.n!));
const eulerY = (v: Values) => v.y0! * (1 + v.k! * v.h!) ** Math.round(v.n!);

/** A curve to compare with: k and y₀ not 0 (else there is nothing to decay or grow). */
const odeLimits = [
  limit('k', '{k} ≠ 0', (v) => v.k !== 0, 'The rate k must not be 0.'),
  limit('y0', '{y0} ≠ 0', (v) => v.y0 !== 0, 'Start from a y₀ other than 0.'),
];

const odeVars = (): VariableDef[] => [
  num('y0', 'y₀', 'Starting value', undefined, -1000, 1000, { step: 0.5 }),
  num('k', 'k', 'Rate constant', undefined, -100, 100, { step: 0.1 }),
  num('h', 'h', 'Step size', undefined, 0.001, 10, { step: 0.05 }),
];
const odeRep = (method: 'euler' | 'heun' | 'rk4', n: string | number, last: string) =>
  ({
    kind: 'functionGraph',
    family: 'exponential',
    a: 'y0',
    r: 'k',
    steps: { method, dy: 'k*y', h: 'h', n, y0: 'y0', last },
    name: 'y',
    input: 't',
    xMin: 0,
    fixed: true,
  }) as Representation;

const EULER = page({
  id: 'g.he-functionGraph-euler',
  title: 'Euler’s method against the exact solution',
  use: 'Use this for “Take 4 Euler steps of h = 0.5 on dy/dt = −0.5y from y = 10 and compare with the exact answer.”',
  assumptions: [
    'dy/dt = ky, y(0) = y₀: the exact solution is y₀e^(kt).',
    'Each Euler step multiplies y by (1 + kh), so after n steps y = y₀(1 + kh)ⁿ.',
    'The error shrinks about in proportion to h.',
  ],
  variables: [
    ...odeVars(),
    num('n', 'n', 'Steps', undefined, 1, 40, { integer: true }),
    out('t', 't', 'End time'),
    out('yE', 'y_Euler', 'Euler’s value'),
    out('yX', 'y_exact', 'Exact value'),
    out('err', 'ε', 'Error', '%'),
  ],
  rules: [
    ...odeLimits,
    derive(
      't',
      't',
      ['n', 'h'],
      '{t} = {n} × {h}',
      (v) => Math.round(v.n!) * v.h!,
      '{n} × {h}',
      'n steps of h.',
    ),
    derive(
      'euler',
      'yE',
      ['y0', 'k', 'h', 'n'],
      '{yE} = {y0} × (1 + {k} × {h})^{n}',
      eulerY,
      '{y0} × (1 + {k} × {h})^{n}',
      'Each step multiplies y by 1 + kh.',
    ),
    derive(
      'exact',
      'yX',
      ['y0', 'k', 't'],
      '{yX} = {y0} × e^({k} × {t})',
      (v) => v.y0! * Math.exp(v.k! * v.t!),
      '{y0} × e^({k} × {t})',
      'The exact solution of dy/dt = ky.',
    ),
    derive(
      'err',
      'err',
      ['yE', 'yX'],
      '{err} = |{yE} − {yX}| ÷ |{yX}| × 100',
      (v) => (v.yX === 0 ? undefined : (Math.abs(v.yE! - v.yX!) / Math.abs(v.yX!)) * 100),
      '|{yE} − {yX}| ÷ |{yX}| × 100',
      'The gap as a percent of the exact value.',
    ),
  ],
  example: example(
    { y0: 10, k: -0.5, h: 0.5, n: 4 },
    ['t', (v) => v.n! * v.h!],
    ['yE', eulerY],
    ['yX', exactY],
    ['err', (v) => (Math.abs(v.yE! - v.yX!) / Math.abs(v.yX!)) * 100],
  ),
  representation: odeRep('euler', 'n', 'yE'),
});

const UNSTABLE = page({
  id: 'g.he-functionGraph-euler-unstable',
  title: 'When Euler’s method is unstable',
  use: 'Use this for “For dy/dt = −50y, is Euler’s method with h = 0.05 stable? What step size is?”',
  assumptions: [
    'dy/dt = ky with k < 0 decays, but Euler multiplies y by g = 1 + kh each step.',
    'Stable when |g| ≤ 1, so h ≤ 2 ÷ |k|; past it the steps swing and grow.',
    'Here the exact curve is near 0 almost at once.',
  ],
  variables: [
    ...odeVars(),
    num('n', 'n', 'Steps', undefined, 1, 12, { integer: true }),
    out('g', 'g', 'Growth factor per step'),
    out('hmax', 'h_max', 'Largest stable step'),
    out('yE', 'y_n', 'Euler’s value after n steps'),
  ],
  rules: [
    ...odeLimits,
    derive(
      'g',
      'g',
      ['k', 'h'],
      '{g} = 1 + {k} × {h}',
      (v) => 1 + v.k! * v.h!,
      '1 + {k} × {h}',
      'Each Euler step multiplies y by 1 + kh.',
    ),
    derive(
      'hmax',
      'hmax',
      ['k'],
      '{hmax} = 2 ÷ |{k}|',
      (v) => (v.k === 0 ? undefined : 2 / Math.abs(v.k!)),
      '2 ÷ |{k}|',
      '|1 + kh| ≤ 1 holds up to h = 2 ÷ |k|.',
    ),
    derive(
      'euler',
      'yE',
      ['y0', 'g', 'n'],
      '{yE} = {y0} × {g}^{n}',
      (v) => v.y0! * v.g! ** Math.round(v.n!),
      '{y0} × {g}^{n}',
      'n steps multiply y₀ by gⁿ.',
    ),
  ],
  example: example(
    { y0: 1, k: -50, h: 0.05, n: 6 },
    ['g', (v) => 1 + v.k! * v.h!],
    ['hmax', (v) => 2 / Math.abs(v.k!)],
    ['yE', (v) => v.y0! * v.g! ** Math.round(v.n!)],
  ),
  representation: odeRep('euler', 'n', 'yE'),
});

const kSteps = (v: Values) => {
  const f = (y: number) => v.k! * y;
  const k1 = f(v.y0!);
  const k2 = f(v.y0! + (v.h! / 2) * k1);
  const k3 = f(v.y0! + (v.h! / 2) * k2);
  const k4 = f(v.y0! + v.h! * k3);
  return { k1, k2, k3, k4 };
};

const RK4 = page({
  id: 'g.he-functionGraph-rk4',
  title: 'One Runge–Kutta (RK4) step',
  use: 'Use this for “Take one RK4 step of h = 0.5 on dy/dt = −0.5y from y = 10.”',
  assumptions: [
    'RK4 samples the slope four times across a step: at the start, twice at the middle, at the end.',
    'y₁ = y₀ + (h ÷ 6)(k₁ + 2k₂ + 2k₃ + k₄).',
    'Its error per step shrinks like h⁵, so one step lands almost on the exact curve.',
  ],
  variables: [
    ...odeVars(),
    out('k1', 'k₁', 'Slope at the start'),
    out('k2', 'k₂', 'First slope at the middle'),
    out('k3', 'k₃', 'Second slope at the middle'),
    out('k4', 'k₄', 'Slope at the end'),
    out('y1', 'y₁', 'RK4 value'),
    out('yX', 'y_exact', 'Exact value'),
  ],
  rules: [
    ...odeLimits,
    derive(
      'k1',
      'k1',
      ['k', 'y0'],
      '{k1} = {k} × {y0}',
      (v) => v.k! * v.y0!,
      '{k} × {y0}',
      'The slope at the start.',
    ),
    derive(
      'k2',
      'k2',
      ['k', 'y0', 'h', 'k1'],
      '{k2} = {k} × ({y0} + {h} ÷ 2 × {k1})',
      (v) => v.k! * (v.y0! + (v.h! / 2) * v.k1!),
      '{k} × ({y0} + {h} ÷ 2 × {k1})',
      'The slope at the middle, reached with k₁.',
    ),
    derive(
      'k3',
      'k3',
      ['k', 'y0', 'h', 'k2'],
      '{k3} = {k} × ({y0} + {h} ÷ 2 × {k2})',
      (v) => v.k! * (v.y0! + (v.h! / 2) * v.k2!),
      '{k} × ({y0} + {h} ÷ 2 × {k2})',
      'The slope at the middle again, reached with k₂.',
    ),
    derive(
      'k4',
      'k4',
      ['k', 'y0', 'h', 'k3'],
      '{k4} = {k} × ({y0} + {h} × {k3})',
      (v) => v.k! * (v.y0! + v.h! * v.k3!),
      '{k} × ({y0} + {h} × {k3})',
      'The slope at the end, reached with k₃.',
    ),
    derive(
      'y1',
      'y1',
      ['y0', 'h', 'k1', 'k2', 'k3', 'k4'],
      '{y1} = {y0} + {h} ÷ 6 × ({k1} + 2 × {k2} + 2 × {k3} + {k4})',
      (v) => v.y0! + (v.h! / 6) * (v.k1! + 2 * v.k2! + 2 * v.k3! + v.k4!),
      '{y0} + {h} ÷ 6 × ({k1} + 2 × {k2} + 2 × {k3} + {k4})',
      'A weighted mean of the four slopes, times h.',
    ),
    derive(
      'exact',
      'yX',
      ['y0', 'k', 'h'],
      '{yX} = {y0} × e^({k} × {h})',
      (v) => v.y0! * Math.exp(v.k! * v.h!),
      '{y0} × e^({k} × {h})',
      'The exact solution at t = h.',
    ),
  ],
  example: example(
    { y0: 10, k: -0.5, h: 0.5 },
    ['k1', (v) => kSteps(v).k1],
    ['k2', (v) => kSteps(v).k2],
    ['k3', (v) => kSteps(v).k3],
    ['k4', (v) => kSteps(v).k4],
    ['y1', (v) => v.y0! + (v.h! / 6) * (v.k1! + 2 * v.k2! + 2 * v.k3! + v.k4!)],
    ['yX', (v) => v.y0! * Math.exp(v.k! * v.h!)],
  ),
  representation: odeRep('rk4', 1, 'y1'),
});

const HEUN = page({
  id: 'g.he-functionGraph-heun',
  title: 'One Heun step (improved Euler)',
  use: 'Use this for “Take one Heun step of h = 0.5 on dy/dt = −0.5y from y = 10.”',
  assumptions: [
    'Heun predicts with Euler, then averages the slopes at both ends.',
    'k₁ = f(y₀), k₂ = f(y₀ + hk₁); y₁ = y₀ + (h ÷ 2)(k₁ + k₂).',
    'Its error per step shrinks like h³.',
  ],
  variables: [
    ...odeVars(),
    out('k1', 'k₁', 'Slope at the start'),
    out('k2', 'k₂', 'Slope at the predicted end'),
    out('y1', 'y₁', 'Heun value'),
  ],
  rules: [
    ...odeLimits,
    derive(
      'k1',
      'k1',
      ['k', 'y0'],
      '{k1} = {k} × {y0}',
      (v) => v.k! * v.y0!,
      '{k} × {y0}',
      'The slope at the start.',
    ),
    derive(
      'k2',
      'k2',
      ['k', 'y0', 'h', 'k1'],
      '{k2} = {k} × ({y0} + {h} × {k1})',
      (v) => v.k! * (v.y0! + v.h! * v.k1!),
      '{k} × ({y0} + {h} × {k1})',
      'The slope where an Euler step would land.',
    ),
    derive(
      'y1',
      'y1',
      ['y0', 'h', 'k1', 'k2'],
      '{y1} = {y0} + {h} ÷ 2 × ({k1} + {k2})',
      (v) => v.y0! + (v.h! / 2) * (v.k1! + v.k2!),
      '{y0} + {h} ÷ 2 × ({k1} + {k2})',
      'Step with the mean of the two slopes.',
    ),
  ],
  example: example(
    { y0: 10, k: -0.5, h: 0.5 },
    ['k1', (v) => v.k! * v.y0!],
    ['k2', (v) => v.k! * (v.y0! + v.h! * v.k1!)],
    ['y1', (v) => v.y0! + (v.h! / 2) * (v.k1! + v.k2!)],
  ),
  representation: odeRep('heun', 1, 'y1'),
});

// ─── HC92: the quantizer ──────────────────────────────────────────────────────

const lsbMv = (v: Values) => (v.Vref! / 2 ** Math.round(v.n!)) * 1000;
const codeOf = (v: Values) => Math.floor((v.Vin! * 2 ** Math.round(v.n!)) / v.Vref! + 1e-9);

const ADC = page({
  id: 'g.he-functionGraph-quantizer-adc',
  title: 'An ADC’s code',
  use: 'Use this for “A 10-bit ADC with a 3.3 V reference reads 1.2 V. What code does it give?”',
  assumptions: [
    'An n-bit converter splits V_ref into 2ⁿ steps of 1 LSB = V_ref ÷ 2ⁿ.',
    'This one truncates: D = ⌊V_in ÷ LSB⌋ (some round to the nearest code).',
    'D runs from 0 to 2ⁿ − 1; the voltage back, D × LSB, is at most 1 LSB below V_in.',
  ],
  variables: [
    num('n', 'n', 'Bits', undefined, 1, 24, { integer: true, allowed: [8, 10, 12, 16] }),
    num('Vref', 'V_ref', 'Reference voltage', 'V', 0.1, 50, { step: 0.1 }),
    num('Vin', 'V_in', 'Input voltage', 'V', 0, 50, { step: 0.001 }),
    out('lsb', 'LSB', 'Step', 'mV'),
    out('D', 'D', 'Code'),
    out('Vb', 'V_back', 'Voltage back', 'V'),
  ],
  rules: [
    limit(
      'range',
      '0 ≤ {Vin} < {Vref}',
      (v) => v.Vin! >= 0 && v.Vin! < v.Vref!,
      'The input must be from 0 up to (not at) the reference.',
    ),
    derive(
      'lsb',
      'lsb',
      ['Vref', 'n'],
      '{lsb} = {Vref} ÷ 2^{n} × 1000',
      lsbMv,
      '{Vref} ÷ 2^{n} × 1000',
      'One LSB is V_ref ÷ 2ⁿ; × 1000 gives mV.',
    ),
    derive(
      'D',
      'D',
      ['Vin', 'n', 'Vref'],
      '{D} = ⌊{Vin} × 2^{n} ÷ {Vref}⌋',
      codeOf,
      '⌊{Vin} × 2^{n} ÷ {Vref}⌋',
      'V_in ÷ LSB, rounded down: the code of the step it falls on.',
    ),
    derive(
      'back',
      'Vb',
      ['D', 'lsb'],
      '{Vb} = {D} × {lsb} ÷ 1000',
      (v) => (v.D! * v.lsb!) / 1000,
      '{D} × {lsb} ÷ 1000',
      'The code times the step, in volts.',
    ),
  ],
  example: example(
    { n: 10, Vref: 3.3, Vin: 1.2 },
    ['lsb', lsbMv],
    ['D', codeOf],
    ['Vb', (v) => (v.D! * v.lsb!) / 1000],
  ),
  representation: {
    kind: 'functionGraph',
    family: 'quantizer',
    bits: 'n',
    vref: 'Vref',
    vin: 'Vin',
    code: 'D',
    back: 'Vb',
    name: 'D',
    input: 'V',
    axes: { x: 'Input V_in (V)', y: 'Code D' },
    fixed: true,
  },
});

const DAC = page({
  id: 'g.he-functionGraph-quantizer-dac',
  title: 'A DAC’s output voltage',
  use: 'Use this for “An 8-bit DAC with a 5 V reference gets the code 200. What voltage comes out?”',
  assumptions: [
    'V_out = D × V_ref ÷ 2ⁿ: each code adds one LSB.',
    'The top code, 2ⁿ − 1, gives V_ref less one LSB.',
    'The output holds each level until the code changes: a staircase.',
  ],
  variables: [
    num('n', 'n', 'Bits', undefined, 1, 24, { integer: true }),
    num('Vref', 'V_ref', 'Reference voltage', 'V', 0.1, 50, { step: 0.1 }),
    num('D', 'D', 'Code', undefined, 0, 16777215, { integer: true }),
    out('lsb', 'LSB', 'Step', 'mV'),
    out('Vo', 'V_out', 'Output voltage', 'V'),
  ],
  rules: [
    limit(
      'code',
      '{D} ≤ 2^{n} − 1',
      (v) => v.D! <= 2 ** Math.round(v.n!) - 1,
      'The code must fit in n bits.',
    ),
    derive(
      'lsb',
      'lsb',
      ['Vref', 'n'],
      '{lsb} = {Vref} ÷ 2^{n} × 1000',
      lsbMv,
      '{Vref} ÷ 2^{n} × 1000',
      'One LSB is V_ref ÷ 2ⁿ; × 1000 gives mV.',
    ),
    derive(
      'out',
      'Vo',
      ['D', 'Vref', 'n'],
      '{Vo} = {D} × {Vref} ÷ 2^{n}',
      (v) => (v.D! * v.Vref!) / 2 ** Math.round(v.n!),
      '{D} × {Vref} ÷ 2^{n}',
      'The code’s share of the reference.',
    ),
  ],
  example: example(
    { n: 8, Vref: 5, D: 200 },
    ['lsb', lsbMv],
    ['Vo', (v) => (v.D! * v.Vref!) / 2 ** v.n!],
  ),
  representation: {
    kind: 'functionGraph',
    family: 'quantizer',
    mode: 'dac',
    bits: 'n',
    vref: 'Vref',
    code: 'D',
    back: 'Vo',
    name: 'V',
    input: 'D',
    axes: { x: 'Code D', y: 'Output V_out (V)' },
    fixed: true,
  },
});

const sqnr = (v: Values) => 6.02 * Math.round(v.n!) + 1.76;

const QUANTIZATION = page({
  id: 'g.he-functionGraph-quantizer-levels',
  title: 'Quantization levels, step and SQNR',
  use: 'Use this for “A 3-bit quantizer covers 2 V. How many levels, how wide a step, and what SQNR?”',
  assumptions: [
    'b bits give 2ᵇ levels; the step is Δ = range ÷ 2ᵇ.',
    'For a full-scale sine wave, SQNR ≈ 6.02b + 1.76 dB: each bit adds about 6 dB.',
    'The sample is truncated to the step below it.',
  ],
  variables: [
    num('n', 'b', 'Bits', undefined, 1, 24, { integer: true }),
    num('Vref', 'range', 'Full-scale range', 'V', 0.1, 50, { step: 0.1 }),
    num('Vin', 'V_in', 'A sample', 'V', 0, 50, { step: 0.01 }),
    out('L', 'L', 'Levels'),
    out('step', 'Δ', 'Step', 'V'),
    out('D', 'D', 'Level of the sample'),
    out('S', 'SQNR', 'Signal-to-quantization-noise ratio', 'dB'),
  ],
  rules: [
    limit(
      'range',
      '0 ≤ {Vin} < {Vref}',
      (v) => v.Vin! >= 0 && v.Vin! < v.Vref!,
      'The sample must be inside the range.',
    ),
    derive(
      'L',
      'L',
      ['n'],
      '{L} = 2^{n}',
      (v) => 2 ** Math.round(v.n!),
      '2^{n}',
      'Each bit doubles the levels.',
    ),
    derive(
      'step',
      'step',
      ['Vref', 'L'],
      '{step} = {Vref} ÷ {L}',
      (v) => v.Vref! / v.L!,
      '{Vref} ÷ {L}',
      'The range shared among the levels.',
    ),
    derive(
      'D',
      'D',
      ['Vin', 'step'],
      '{D} = ⌊{Vin} ÷ {step}⌋',
      (v) => Math.floor(v.Vin! / v.step! + 1e-9),
      '⌊{Vin} ÷ {step}⌋',
      'Whole steps below the sample.',
    ),
    derive(
      'S',
      'S',
      ['n'],
      '{S} = 6.02 × {n} + 1.76',
      sqnr,
      '6.02 × {n} + 1.76',
      'About 6 dB per bit.',
    ),
  ],
  example: example(
    { n: 3, Vref: 2, Vin: 1.3 },
    ['L', (v) => 2 ** v.n!],
    ['step', (v) => v.Vref! / v.L!],
    ['D', (v) => Math.floor(v.Vin! / v.step! + 1e-9)],
    ['S', sqnr],
  ),
  representation: {
    kind: 'functionGraph',
    family: 'quantizer',
    bits: 'n',
    vref: 'Vref',
    vin: 'Vin',
    code: 'D',
    name: 'D',
    input: 'V',
    axes: { x: 'Sample (V)', y: 'Level D' },
    fixed: true,
  },
});

export const HE3A_GALLERY_MODULES: ModuleDef[] = [
  MAXWELL,
  KINETIC,
  PHOTON_GAS,
  BLACKBODY,
  OCCUPANCY,
  OCCUPANCY_NEAR,
  NEWTON,
  BISECT,
  INTERPOLATE,
  TRAPEZOID,
  SIMPSON,
  EULER,
  UNSTABLE,
  RK4,
  HEUN,
  ADC,
  DAC,
  QUANTIZATION,
];

export const HE3A_GALLERY_LAYOUTS: LayoutDef[] = [];
