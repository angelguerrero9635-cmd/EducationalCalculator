/**
 * College gallery demos, round 4, group L (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example (docs/plans/he.mechanical.md).
 * Spread into gallery.ts.
 *
 * HC165 `moodyChart` (he.engineering.fluid-mechanics#4, ME-P13).
 * HC166 `gearPair` (he.engineering.machine-design#3, ~train, ME-P18).
 */
import type { Relation, Values, VariableDef } from '@/engine/types';
import { colebrookF } from '@/components/module/reps/he4lMath';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

/** g on the engineering pages, m/s². */
const G = 9.81;

interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}

/** Gathers rules into a module's `relations` and `steps`. */
const rules = (...rs: Rule[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

type Solve = (v: Values) => number | number[] | undefined;

/**
 * A relation from its display and residual; `parts` gives each variable's solver, step
 * expression and explanation (null: never solved for that variable, it is only checked).
 */
const rule = (
  id: string,
  display: string,
  residual: (v: Values) => number,
  parts: Record<string, [Solve, StepText['expr'], string] | null>,
): Rule => ({
  relation: {
    id,
    display,
    vars: [
      ...new Set([...Object.keys(parts), ...[...display.matchAll(/\{(\w+)\}/g)].map((x) => x[1]!)]),
    ],
    residual,
    solve: Object.fromEntries(
      Object.entries(parts).map(([k, p]) => [k, p ? p[0] : () => undefined]),
    ) as Relation['solve'],
  },
  steps: Object.fromEntries(
    Object.entries(parts).flatMap(([k, p]) => (p ? [[k, { expr: p[1], how: p[2] }]] : [])),
  ),
});

/** A measured value with its unit and range. */
const q = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  step = 0.1,
  extra: Partial<VariableDef> = {},
): VariableDef => ({
  id,
  symbol,
  name,
  ...(unit ? { unit, units: [unit] } : {}),
  min,
  max,
  step,
  ...extra,
});

/** A pressure kept in pascals for the formulas and shown in kPa. */
const kPa = (id: string, symbol: string, name: string) =>
  q(id, symbol, name, 'Pa', 0, 1e9, 10, { units: ['Pa', 'kPa'], shownIn: 'kPa' });

const div = (a: number, b: number) => (Math.abs(b) < 1e-15 ? undefined : a / b);
const root = (x: number) => (x < 0 ? undefined : Math.sqrt(x));

/** A demo module: the page's values and rules, the picture, a title and its use line. */
const demo = (
  id: string,
  title: string,
  use: string,
  m: Omit<ModuleDef, 'id' | 'title' | 'use'>,
): ModuleDef => ({ id, title, use, workedFigures: 4, unitSystems: ['metric'], ...m });

// ─── HC165: the Moody chart (fluid-mechanics#4) ─────────────────────────────────

const reynoldsRule = rule(
  'Re = VD ÷ ν',
  '{Re} = {V} × {D} ÷ {nu}',
  (v) => v.Re! - (v.V! * v.D!) / v.nu!,
  {
    Re: [
      (v) => div(v.V! * v.D!, v.nu!),
      '{V} × {D} ÷ {nu}',
      'Reynolds number: inertia over viscosity, speed times diameter over ν.',
    ],
    V: [(v) => div(v.Re! * v.nu!, v.D!), '{Re} × {nu} ÷ {D}', 'Multiply Re by ν and divide by D.'],
    D: [(v) => div(v.Re! * v.nu!, v.V!), '{Re} × {nu} ÷ {V}', 'Multiply Re by ν and divide by V.'],
    nu: [(v) => div(v.V! * v.D!, v.Re!), '{V} × {D} ÷ {Re}', 'Speed times diameter over Re.'],
  },
);

const colebrookRule = rule(
  'Colebrook',
  '1 ÷ √{f} = −2 × log₁₀({eps} ÷ (3.7 × {D}) + 2.51 ÷ ({Re} × √{f}))',
  (v) =>
    1 / Math.sqrt(v.f!) + 2 * Math.log10(v.eps! / (3.7 * v.D!) + 2.51 / (v.Re! * Math.sqrt(v.f!))),
  {
    f: [
      (v) => colebrookF(v.Re!, v.eps! / v.D!),
      // f is on both sides: the last round of the iteration, with the f it settles on.
      (v: Values) =>
        `(1 ÷ (−2 × log₁₀({eps} ÷ (3.7 × {D}) + 2.51 ÷ ({Re} × √${Number(colebrookF(v.Re!, v.eps! / v.D!).toPrecision(8))}))))²`,
      'Colebrook has f on both sides: guess f = 0.02, put it in on the right, and repeat until f stops changing. The last round is shown.',
    ],
    eps: null,
    D: null,
    Re: null,
  },
);

const laminarRule = rule('f = 64 ÷ Re', '{f} = 64 ÷ {Re}', (v) => v.f! - 64 / v.Re!, {
  f: [(v) => div(64, v.Re!), '64 ÷ {Re}', 'Laminar flow: the friction factor is 64 over Re.'],
  Re: [(v) => div(64, v.f!), '64 ÷ {f}', 'Laminar flow: Re is 64 over f.'],
});

const darcyRule = rule(
  'h_L = f(L ÷ D)V² ÷ 2g',
  '{hL} = {f} × {L} ÷ {D} × {V}² ÷ (2 × 9.81)',
  (v) => v.hL! - (v.f! * v.L! * v.V! ** 2) / (v.D! * 2 * G),
  {
    hL: [
      (v) => (v.f! * v.L! * v.V! ** 2) / (v.D! * 2 * G),
      '{f} × {L} ÷ {D} × {V}² ÷ (2 × 9.81)',
      'Darcy–Weisbach: the friction factor times the pipe’s length in diameters times the velocity head V² ÷ 2g.',
    ],
    L: [
      (v) => div(v.hL! * v.D! * 2 * G, v.f! * v.V! ** 2),
      '{hL} × {D} × 2 × 9.81 ÷ ({f} × {V}²)',
      'Solve Darcy–Weisbach for L.',
    ],
    V: [
      (v) => root(div(v.hL! * v.D! * 2 * G, v.f! * v.L!) ?? NaN),
      '√({hL} × {D} × 2 × 9.81 ÷ ({f} × {L}))',
      'Solve Darcy–Weisbach for V².',
    ],
    f: null,
    D: null,
  },
);

const dropRule = (rho: number) =>
  rule('ΔP = ρgh_L', `{dP} = ${rho} × 9.81 × {hL}`, (v) => v.dP! - rho * G * v.hL!, {
    dP: [
      (v) => rho * G * v.hL!,
      `${rho} × 9.81 × {hL}`,
      'A head of h_L metres of the fluid is a pressure of ρgh_L.',
    ],
    hL: [(v) => v.dP! / (rho * G), `{dP} ÷ (${rho} × 9.81)`, 'Divide the pressure by ρg.'],
  });

/** A pipe-flow page: f from Colebrook (or 64 ÷ Re when laminar), its point on the Moody chart. */
function moodyDemo(
  id: string,
  title: string,
  use: string,
  ex: { V: number; D: number; L: number; nu: number; eps?: number; rho: number; fluid: string },
  laminar = false,
): ModuleDef {
  const Re = (ex.V * ex.D) / ex.nu;
  const f = laminar ? 64 / Re : colebrookF(Re, ex.eps! / ex.D);
  const hL = (f * ex.L * ex.V ** 2) / (ex.D * 2 * G);
  return demo(id, title, use, {
    assumptions: [
      laminar
        ? `Steady, fully developed laminar flow (Re < 2300) of ${ex.fluid}, ρ = ${ex.rho} kg/m³.`
        : `Steady, fully developed turbulent flow (Re ≥ 2300) of ${ex.fluid}, ρ = ${ex.rho} kg/m³.`,
      'g = 9.81 m/s²; minor losses are ignored.',
      laminar
        ? 'Laminar f does not depend on the roughness.'
        : 'Colebrook is solved numerically (fixed-point iteration on 1 ÷ √f).',
    ],
    variables: [
      q('V', 'V', 'Mean speed', 'm/s', 0.01, 100, 0.01),
      q('D', 'D', 'Diameter', 'm', 0.001, 10, 0.001),
      q('L', 'L', 'Length', 'm', 0.1, 1e6, 1),
      q('nu', 'ν', 'Kinematic viscosity', 'm²/s', 1e-8, 1e-2, 1e-8, { scientific: true }),
      ...(laminar
        ? []
        : [
            q('eps', 'ε', 'Roughness', 'm', 1e-7, 0.01, 0.000001, {
              units: ['mm', 'm'],
              shownIn: 'mm',
            }),
          ]),
      laminar
        ? q('Re', 'Re', 'Reynolds number', undefined, 1000, 2299, 1)
        : q('Re', 'Re', 'Reynolds number', undefined, 2300, 1e8, 1),
      q('f', 'f', 'Friction factor', undefined, 0.005, 0.1, 0.0001),
      q('hL', 'h_L', 'Head loss', 'm', 0, 1e6, 0.01),
      kPa('dP', 'ΔP', 'Pressure drop'),
    ],
    ...rules(reynoldsRule, laminar ? laminarRule : colebrookRule, darcyRule, dropRule(ex.rho)),
    example: {
      V: ex.V,
      D: ex.D,
      L: ex.L,
      nu: ex.nu,
      ...(laminar ? {} : { eps: ex.eps }),
      Re,
      f,
      hL,
      dP: ex.rho * G * hL,
    },
    startWith: laminar ? ['V', 'D', 'L', 'nu'] : ['V', 'D', 'L', 'nu', 'eps'],
    pictureLabels: ['V', 'L', 'nu', 'hL', 'dP'],
    representation: laminar
      ? { kind: 'moodyChart', re: 'Re', f: 'f' }
      : { kind: 'moodyChart', re: 'Re', f: 'f', epsilon: 'eps', diameter: 'D' },
  });
}

const MOODY_STEEL = moodyDemo(
  'g.he-moodyChart-turbulent',
  'Head loss in a steel pipe: f from the Moody chart',
  'Use this for “Water at 2 m/s in 100 m of 0.1 m steel pipe (ε = 0.045 mm). Find f, h_L and ΔP.”',
  { V: 2, D: 0.1, L: 100, nu: 1e-6, eps: 0.000045, rho: 1000, fluid: 'water' },
);

/** The rough edge: a concrete main where f hardly changes with Re. */
const MOODY_ROUGH = moodyDemo(
  'g.he-moodyChart-rough',
  'A rough concrete main: f flattens out',
  'Use this for “Water at 3 m/s in 500 m of 0.5 m concrete pipe (ε = 1 mm). Find f and the head loss.”',
  { V: 3, D: 0.5, L: 500, nu: 1e-6, eps: 0.001, rho: 1000, fluid: 'water' },
);

/** Below Re = 2300 the point leaves the curves for the laminar line. */
const MOODY_LAMINAR = moodyDemo(
  'g.he-moodyChart-laminar',
  'Oil in a small tube: laminar, f = 64 ÷ Re',
  'Use this for “Oil (ν = 10⁻⁵ m²/s, ρ = 880 kg/m³) at 0.6 m/s in 20 m of 20 mm tube. Find f and ΔP.”',
  { V: 0.6, D: 0.02, L: 20, nu: 1e-5, rho: 880, fluid: 'oil' },
  true,
);

// ─── HC166: spur gears (machine-design#3, ~train) ───────────────────────────────

/** a = k × b × c …, solvable for each factor (`kText` writes k in the steps). */
const product = (
  id: string,
  a: string,
  bs: string[],
  k: number,
  kText: string,
  how: string,
): Rule => {
  const prod = (v: Values, skip?: string) => bs.reduce((p, b) => (b === skip ? p : p * v[b]!), k);
  const show = (skip?: string) =>
    [kText, ...bs.filter((b) => b !== skip).map((b) => `{${b}}`)].filter(Boolean).join(' × ');
  return rule(id, `{${a}} = ${show()}`, (v) => v[a]! - prod(v), {
    [a]: [(v) => prod(v), show(), how],
    ...Object.fromEntries(
      bs.map((b) => [
        b,
        [
          (v: Values) => div(v[a]!, prod(v, b)),
          `{${a}} ÷ (${show(b)})`,
          'Divide by the other factors.',
        ] as [Solve, string, string],
      ]),
    ),
  });
};

/** n_a N_a = n_b N_b: the pitch circles roll together, so teeth pass at one rate. */
const meshRule = (na: string, Na: string, nb: string, Nb: string, label: string) =>
  rule(label, `{${na}} × {${Na}} = {${nb}} × {${Nb}}`, (v) => v[na]! * v[Na]! - v[nb]! * v[Nb]!, {
    [nb]: [
      (v) => div(v[na]! * v[Na]!, v[Nb]!),
      `{${na}} × {${Na}} ÷ {${Nb}}`,
      'Teeth pass the mesh at one rate: the driver’s speed times its teeth, over the driven gear’s teeth.',
    ],
    [na]: [
      (v) => div(v[nb]! * v[Nb]!, v[Na]!),
      `{${nb}} × {${Nb}} ÷ {${Na}}`,
      'The driven gear’s speed times its teeth, over the driver’s teeth.',
    ],
    [Nb]: [
      (v) => div(v[na]! * v[Na]!, v[nb]!),
      `{${na}} × {${Na}} ÷ {${nb}}`,
      'Teeth passing per minute, over the driven gear’s speed.',
    ],
    [Na]: [
      (v) => div(v[nb]! * v[Nb]!, v[na]!),
      `{${nb}} × {${Nb}} ÷ {${na}}`,
      'Teeth passing per minute, over the driver’s speed.',
    ],
  });

const teethVar = (id: string, symbol: string, name: string, integer = true) =>
  q(id, symbol, name, undefined, 8, 400, 1, { integer });
const rpm = (id: string, symbol: string, name: string) => q(id, symbol, name, 'rpm', 0.1, 1e5, 0.1);

/** The main page: a pinion driving a gear, d = mN, speeds, pitch-line speed and W_t. */
function gearPairDemo(
  id: string,
  title: string,
  use: string,
  ex: { N1: number; N2: number; m: number; n1: number; P: number },
): ModuleDef {
  const d1 = ex.m * ex.N1;
  const d2 = ex.m * ex.N2;
  const n2 = (ex.n1 * ex.N1) / ex.N2;
  const V = (Math.PI * d1 * ex.n1) / 60000;
  return demo(id, title, use, {
    assumptions: [
      'Spur gears with standard teeth: both gears have the same module m, so d = mN.',
      'The pitch circles roll without slipping; the power is passed without loss.',
      'd in mm and n in rpm, so V = πd₁n₁ ÷ 60000 in m/s; P in kW, so W_t = 1000P ÷ V in N.',
    ],
    variables: [
      teethVar('N1', 'N₁', 'Pinion teeth'),
      teethVar('N2', 'N₂', 'Gear teeth'),
      q('m', 'm', 'Module', 'mm', 0.5, 50, 0.5),
      q('d1', 'd₁', 'Pinion pitch diameter', 'mm', 1, 10000, 0.1),
      q('d2', 'd₂', 'Gear pitch diameter', 'mm', 1, 10000, 0.1),
      rpm('n1', 'n₁', 'Pinion speed'),
      rpm('n2', 'n₂', 'Gear speed'),
      q('P', 'P', 'Power', 'kW', 0.01, 10000, 0.1),
      q('V', 'V', 'Pitch-line speed', 'm/s', 0.001, 200, 0.01),
      q('Wt', 'W_t', 'Tangential force', 'N', 0.1, 1e7, 1),
    ],
    ...rules(
      product(
        'd₁ = mN₁',
        'd1',
        ['m', 'N1'],
        1,
        '',
        'The pitch diameter is the module times the teeth.',
      ),
      product(
        'd₂ = mN₂',
        'd2',
        ['m', 'N2'],
        1,
        '',
        'The pitch diameter is the module times the teeth.',
      ),
      meshRule('n1', 'N1', 'n2', 'N2', 'n₁N₁ = n₂N₂'),
      product(
        'V = πd₁n₁',
        'V',
        ['d1', 'n1'],
        Math.PI / 60000,
        'π ÷ 60000',
        'The pitch circle’s rim speed: πd₁ per turn, n₁ turns a minute (mm to m, minutes to seconds).',
      ),
      rule('W_t = P ÷ V', '{Wt} = 1000 × {P} ÷ {V}', (v) => v.Wt! * v.V! - 1000 * v.P!, {
        Wt: [
          (v) => div(1000 * v.P!, v.V!),
          '1000 × {P} ÷ {V}',
          'Power is force times speed at the pitch line: the power in watts over V.',
        ],
        P: [(v) => (v.Wt! * v.V!) / 1000, '{Wt} × {V} ÷ 1000', 'Force times speed, in kW.'],
        V: [
          (v) => div(1000 * v.P!, v.Wt!),
          '1000 × {P} ÷ {Wt}',
          'The power in watts over the force.',
        ],
      }),
    ),
    example: { ...ex, d1, d2, n2, V, Wt: (1000 * ex.P) / V },
    startWith: ['N1', 'N2', 'm', 'n1', 'P'],
    representation: {
      kind: 'gearPair',
      teeth: ['N1', 'N2'],
      module: 'm',
      diameters: ['d1', 'd2'],
      speeds: ['n1', 'n2'],
      power: 'P',
      pitchSpeed: 'V',
      force: 'Wt',
    },
  });
}

const GEAR_PAIR = gearPairDemo(
  'g.he-gearPair-pair',
  'Spur gears: pitch diameters, speeds and the tooth load',
  'Use this for “A 20-tooth pinion (m = 3 mm) at 1500 rpm drives a 60-tooth gear with 5 kW. Find d₁, d₂, n₂, V and W_t.”',
  { N1: 20, N2: 60, m: 3, n1: 1500, P: 5 },
);

/** The small-pinion edge: 12 teeth (about the fewest a standard 20° pinion takes) into 84. */
const GEAR_PAIR_SMALL = gearPairDemo(
  'g.he-gearPair-small-pinion',
  'A 12-tooth pinion: a 7-to-1 reduction in one mesh',
  'Use this for “A 12-tooth pinion (m = 5 mm) at 3000 rpm drives an 84-tooth gear with 15 kW. Find n₂ and W_t.”',
  { N1: 12, N2: 84, m: 5, n1: 3000, P: 15 },
);

/** A train: e = ΠN_driving ÷ ΠN_driven, n_out = e n_in. */
function gearTrainDemo(
  id: string,
  title: string,
  use: string,
  teeth: number[],
  nIn: number,
): ModuleDef {
  const ids = teeth.map((_, i) => `N${i + 1}`);
  const subs = '₁₂₃₄';
  const compound = teeth.length === 4;
  const e = compound
    ? (teeth[0]! * teeth[2]!) / (teeth[1]! * teeth[3]!)
    : teeth[0]! / teeth[teeth.length - 1]!;
  const eDisplay = compound ? '{e} = ({N1} × {N3}) ÷ ({N2} × {N4})' : '{e} = {N1} ÷ {N3}';
  const eExpr = compound ? '({N1} × {N3}) ÷ ({N2} × {N4})' : '{N1} ÷ {N3}';
  const eOf = (v: Values) => (compound ? div(v.N1! * v.N3!, v.N2! * v.N4!) : div(v.N1!, v.N3!));
  return demo(id, title, use, {
    assumptions: compound
      ? [
          'Gears 2 and 3 are keyed to one shaft, so they turn together.',
          'Gears 1 and 3 drive; gears 2 and 4 are driven.',
        ]
      : [
          'Gear 2 is an idler: it meshes with both, so its teeth cancel from the train value.',
          'Each mesh reverses the direction of turning.',
        ],
    variables: [
      ...ids.map((x, i) => teethVar(x, `N${subs[i]}`, `Gear ${i + 1} teeth`, false)),
      q('e', 'e', 'Train value', undefined, 1e-4, 1e4, 0.0001, { derived: true }),
      rpm('nin', 'n_in', 'Input speed'),
      rpm('nout', 'n_out', 'Output speed'),
      ...(compound ? [] : [rpm('n2', 'n₂', 'Idler speed')]),
    ],
    ...rules(
      rule('e = ΠN driving ÷ ΠN driven', eDisplay, (v) => v.e! - (eOf(v) ?? NaN), {
        e: [
          (v) => eOf(v),
          eExpr,
          compound
            ? 'Multiply the driving gears’ teeth, and divide by the driven gears’ teeth.'
            : 'The idler’s teeth cancel: the first gear’s teeth over the last gear’s.',
        ],
      }),
      product('n_out = e n_in', 'nout', ['e', 'nin'], 1, '', 'The output turns e times as fast.'),
      ...(compound ? [] : [meshRule('nin', 'N1', 'n2', 'N2', 'n₁N₁ = n₂N₂')]),
    ),
    example: {
      ...Object.fromEntries(ids.map((x, i) => [x, teeth[i]!])),
      e,
      nin: nIn,
      nout: e * nIn,
      ...(compound ? {} : { n2: (nIn * teeth[0]!) / teeth[1]! }),
    },
    startWith: [...ids, 'nin'],
    representation: {
      kind: 'gearPair',
      teeth: ids,
      speeds: compound ? ['nin', null, null, 'nout'] : ['nin', 'n2', 'nout'],
      value: 'e',
    },
  });
}

const GEAR_TRAIN = gearTrainDemo(
  'g.he-gearPair-train',
  'A compound gear train: the train value',
  'Use this for “Gears of 20, 60, 18 and 54 teeth form a compound train (60 and 18 on one shaft). The input turns at 1800 rpm. Find e and the output speed.”',
  [20, 60, 18, 54],
  1800,
);

const GEAR_IDLER = gearTrainDemo(
  'g.he-gearPair-idler',
  'An idler gear: direction changes, ratio does not',
  'Use this for “A 20-tooth gear at 1200 rpm drives a 35-tooth idler and a 40-tooth gear. Find e and the output speed.”',
  [20, 35, 40],
  1200,
);

export const HE4L_GALLERY_MODULES: ModuleDef[] = [
  MOODY_STEEL,
  MOODY_ROUGH,
  MOODY_LAMINAR,
  GEAR_PAIR,
  GEAR_PAIR_SMALL,
  GEAR_TRAIN,
  GEAR_IDLER,
];

export const HE4L_GALLERY_LAYOUTS: LayoutDef[] = [];
