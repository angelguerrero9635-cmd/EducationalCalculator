/**
 * College gallery demos, round 4, group M (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC174: `soilPhases`, the new kind (he.engineering.soil-mechanics#0, #1~sand-cone).
 * HC175: `losScale`, the new kind (he.engineering.transportation#3).
 * HC180: `oneLine`, the new kind (he.engineering.power-systems#2, ~slg).
 * HC181: `rfSpectrum`, the new kind (he.engineering.communication-systems#0, ~fm).
 * HC182: `complexPlane` `constellation` (he.engineering.communication-systems#1).
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
  // A display in words is checked as the step's arithmetic.
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
    // College pages are metric unless the page says otherwise; the example opens whole.
    unitSystems: ['metric'],
    ...rest,
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

// ─── HC174: soil phases (soil-mechanics#0 main, #1~sand-cone) ─────────────────

const eOf = (v: Values) => ((v.w! / 100) * v.Gs!) / v.S!;
const nOf = (v: Values) => v.e! / (1 + v.e!);
const gdOf = (v: Values) => (v.Gs! * 9.81) / (1 + v.e!);
const gOf = (v: Values) => v.gd! * (1 + v.w! / 100);

const phasesPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'γ_w = 9.81 kN/m³; the air weighs nothing.',
      'The block holds 1 m³ of solids, so the void volume is e and the water volume is Se.',
      'w is the weight of water over the weight of solids, written in %.',
    ],
    variables: [
      num('Gs', 'G_s', 'Specific gravity of solids', undefined, 2.4, 3, { step: 0.01 }),
      num('w', 'w', 'Water content', '%', 0.1, 200, { step: 0.1 }),
      num('S', 'S', 'Degree of saturation', undefined, 0.01, 1, { step: 0.01 }),
      out('e', 'e', 'Void ratio'),
      out('n', 'n', 'Porosity'),
      out('gd', 'γ_d', 'Dry unit weight', 'kN/m³'),
      out('g', 'γ', 'Moist unit weight', 'kN/m³'),
    ],
    rules: [
      derive(
        'e',
        'e',
        ['w', 'Gs', 'S'],
        '{e} = {w} ÷ 100 × {Gs} ÷ {S}',
        eOf,
        '{w} ÷ 100 × {Gs} ÷ {S}',
        'Se = wG_s: the water fills S of the voids, and its volume is w times the solids’ weight over γ_w.',
      ),
      derive(
        'n',
        'n',
        ['e'],
        '{n} = {e} ÷ (1 + {e})',
        nOf,
        '{e} ÷ (1 + {e})',
        'Porosity is the voids over the whole volume: e over 1 + e.',
      ),
      derive(
        'gd',
        'gd',
        ['Gs', 'e'],
        '{gd} = {Gs} × 9.81 ÷ (1 + {e})',
        gdOf,
        '{Gs} × 9.81 ÷ (1 + {e})',
        'The solids weigh G_sγ_w for each 1 of their volume, spread over the whole 1 + e.',
      ),
      derive(
        'g',
        'g',
        ['gd', 'w'],
        '{g} = {gd} × (1 + {w} ÷ 100)',
        gOf,
        '{gd} × (1 + {w} ÷ 100)',
        'The water adds w times the solids’ weight.',
      ),
    ],
    example: example(typed, ['e', eOf], ['n', nOf], ['gd', gdOf], ['g', gOf]),
    startWith: ['Gs', 'w', 'S'],
    representation: {
      kind: 'soilPhases',
      Gs: 'Gs',
      w: 'w',
      S: 'S',
      e: 'e',
      gammaW: 9.81,
      porosity: 'n',
      dryUnitWeight: 'gd',
      unitWeight: 'g',
    },
  });

const PHASES = phasesPage(
  'g.he-soilPhases-main',
  'Void ratio, porosity and unit weights',
  'Use this for “A soil has G_s = 2.70, w = 18% and S = 0.9. Find e, n, γ_d and γ.”',
  { Gs: 2.7, w: 18, S: 0.9 },
);

/** Fully saturated: no air, the voids all water (S = 1). */
const PHASES_SATURATED = phasesPage(
  'g.he-soilPhases-saturated',
  'A saturated clay’s phases',
  'Use this for “A saturated clay has w = 40% and G_s = 2.75. Find its void ratio and unit weight.”',
  { Gs: 2.75, w: 40, S: 1 },
);

const vOf = (v: Values) => (v.msand! * 1000) / v.rhoSand!;
const rhoOf = (v: Values) => (v.mwet! * 1000) / v.V!;
const rhoDOf = (v: Values) => v.rho! / (1 + v.w! / 100);
const gdConeOf = (v: Values) => v.rhoD! * 9.81;
const eConeOf = (v: Values) => (v.Gs! * 1) / v.rhoD! - 1;

const SAND_CONE = page({
  id: 'g.he-soilPhases-sand-cone',
  title: 'Field density by the sand cone',
  use: 'Use this for “1.62 kg of 1.50 g/cm³ sand fills the hole, and the soil dug out weighs 2.07 kg at w = 10%. Find the dry unit weight.”',
  assumptions: [
    'The sand used is the sand in the hole (the cone’s own sand already taken off).',
    'ρ_w = 1.00 g/cm³, so G_s ÷ ρ_d gives 1 + e; 1 g/cm³ weighs 9.81 kN/m³.',
    'The hole’s soil is all the soil dug out of it.',
  ],
  variables: [
    num('msand', 'm_sand', 'Sand used', 'kg', 0.01, 100, { step: 0.01 }),
    num('rhoSand', 'ρ_sand', 'Sand density', 'g/cm³', 1, 2.5, { step: 0.01 }),
    out('V', 'V', 'Hole volume', 'cm³'),
    num('mwet', 'M', 'Wet soil mass', 'kg', 0.01, 100, { step: 0.01 }),
    out('rho', 'ρ', 'Moist density', 'g/cm³'),
    num('w', 'w', 'Water content', '%', 0.1, 200, { step: 0.1 }),
    out('rhoD', 'ρ_d', 'Dry density', 'g/cm³'),
    out('gd', 'γ_d', 'Dry unit weight', 'kN/m³'),
    num('Gs', 'G_s', 'Specific gravity of solids', undefined, 2.4, 3, { step: 0.01 }),
    // A soil denser than its own solids has no voids: the page refuses it.
    out('e', 'e', 'Void ratio', undefined, { min: 0.01 }),
  ],
  rules: [
    derive(
      'V',
      'V',
      ['msand', 'rhoSand'],
      '{V} = {msand} × 1000 ÷ {rhoSand}',
      vOf,
      '{msand} × 1000 ÷ {rhoSand}',
      'The sand’s mass over its density is the hole’s volume (1 kg = 1000 g).',
    ),
    derive(
      'rho',
      'rho',
      ['mwet', 'V'],
      '{rho} = {mwet} × 1000 ÷ {V}',
      rhoOf,
      '{mwet} × 1000 ÷ {V}',
      'The soil’s mass over the hole’s volume is its moist density.',
    ),
    derive(
      'rhoD',
      'rhoD',
      ['rho', 'w'],
      '{rhoD} = {rho} ÷ (1 + {w} ÷ 100)',
      rhoDOf,
      '{rho} ÷ (1 + {w} ÷ 100)',
      'Taking the water out leaves the solids: divide by 1 + w.',
    ),
    derive(
      'gd',
      'gd',
      ['rhoD'],
      '{gd} = {rhoD} × 9.81',
      gdConeOf,
      '{rhoD} × 9.81',
      'Each 1 g/cm³ weighs 9.81 kN/m³.',
    ),
    derive(
      'e',
      'e',
      ['Gs', 'rhoD'],
      '{e} = {Gs} × 1 ÷ {rhoD} − 1',
      eConeOf,
      '{Gs} × 1 ÷ {rhoD} − 1',
      'The solids alone would be G_sρ_w dense; spread over 1 + e they make ρ_d.',
    ),
  ],
  example: example(
    { msand: 1.62, rhoSand: 1.5, mwet: 2.07, w: 10, Gs: 2.65 },
    ['V', vOf],
    ['rho', rhoOf],
    ['rhoD', rhoDOf],
    ['gd', gdConeOf],
    ['e', eConeOf],
  ),
  startWith: ['msand', 'rhoSand', 'mwet', 'w', 'Gs'],
  representation: {
    kind: 'soilPhases',
    Gs: 'Gs',
    w: 'w',
    e: 'e',
    volume: 'V',
    mass: 'mwet',
    density: 'rho',
    dryDensity: 'rhoD',
  },
});

// ─── HC175: level of service on a basic freeway segment (transportation#3) ─────

const fhvOf = (v: Values) => 1 / (1 + (v.PT! / 100) * (v.ET! - 1));
const vpOf = (v: Values) => v.V! / (v.PHF! * v.N! * v.fhv!);
const dOf = (v: Values) => v.vp! / v.S!;

const losPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    // HCM pages are in US units, as the manual is.
    unitSystems: ['us'],
    assumptions: [
      'A basic freeway segment (HCM 7th edition): A ≤ 11, B ≤ 18, C ≤ 26, D ≤ 35, E ≤ 45 pc/mi/ln, F above.',
      'S is read from the speed–flow curve and typed here.',
      'Each truck counts as E_T passenger cars.',
    ],
    variables: [
      num('V', 'V', 'Hourly volume', 'veh/h', 1, 20000, { step: 10 }),
      num('PHF', 'PHF', 'Peak-hour factor', undefined, 0.25, 1, { step: 0.01 }),
      num('N', 'N', 'Lanes in one direction', undefined, 1, 6, { integer: true, step: 1 }),
      num('PT', 'P_T', 'Truck share of traffic', '%', 0, 60, { step: 1 }),
      num('ET', 'E_T', 'Truck equivalent', undefined, 1, 6, { step: 0.1 }),
      out('fhv', 'f_HV', 'Heavy-vehicle factor'),
      out('vp', 'v_p', 'Flow rate', 'pc/h/ln'),
      num('S', 'S', 'Mean speed', 'mi/h', 5, 80, { step: 1 }),
      out('D', 'D', 'Density', 'pc/mi/ln'),
    ],
    rules: [
      derive(
        'fhv',
        'fhv',
        ['PT', 'ET'],
        '{fhv} = 1 ÷ (1 + {PT} ÷ 100 × ({ET} − 1))',
        fhvOf,
        '1 ÷ (1 + {PT} ÷ 100 × ({ET} − 1))',
        'Each truck takes the room of E_T cars, so trucks add P_T(E_T − 1) to every car.',
      ),
      derive(
        'vp',
        'vp',
        ['V', 'PHF', 'N', 'fhv'],
        '{vp} = {V} ÷ ({PHF} × {N} × {fhv})',
        vpOf,
        '{V} ÷ ({PHF} × {N} × {fhv})',
        'The peak 15 minutes as an hourly rate, shared by the lanes, in passenger cars.',
      ),
      derive(
        'D',
        'D',
        ['vp', 'S'],
        '{D} = {vp} ÷ {S}',
        dOf,
        '{vp} ÷ {S}',
        'Cars passing an hour over miles driven an hour is cars per mile.',
      ),
    ],
    example: example(typed, ['fhv', fhvOf], ['vp', vpOf], ['D', dOf]),
    startWith: ['V', 'PHF', 'N', 'PT', 'ET', 'S'],
    representation: { kind: 'losScale', density: 'D', flow: 'vp', speed: 'S' },
  });

const LOS = losPage(
  'g.he-losScale-freeway',
  'Flow rate, density and level of service',
  'Use this for “4000 veh/h, PHF 0.92, 3 lanes, 10% trucks with E_T = 2, S = 70 mi/h. What is the level of service?”',
  { V: 4000, PHF: 0.92, N: 3, PT: 10, ET: 2, S: 70 },
);

/** Just past E: the flow breaks down (LOS F). */
const LOS_F = losPage(
  'g.he-losScale-breakdown',
  'A freeway segment past capacity',
  'Use this for “4160 veh/h on 2 lanes, PHF 0.95, 5% trucks with E_T = 2, S = 50 mi/h. Is it LOS F?”',
  { V: 4160, PHF: 0.95, N: 2, PT: 5, ET: 2, S: 50 },
);

// ─── HC180: fault currents on a one-line diagram (power-systems#2, ~slg) ───────

const ibaseOf = (v: Values) => (v.Sbase! * 1000) / (Math.sqrt(3) * v.Vbase!);
const baseVars = (): VariableDef[] => [
  num('Sbase', 'S_base', 'Base power', 'MVA', 1, 5000, { step: 1 }),
  num('Vbase', 'V_base', 'Base voltage (line to line)', 'kV', 0.2, 800, { step: 0.1 }),
  out('Ibase', 'I_base', 'Base current', 'A'),
  out('IkA', 'I_kA', 'Fault current in kA', 'kA'),
];
const baseRules = (I: string): Rule[] => [
  derive(
    'Ibase',
    'Ibase',
    ['Sbase', 'Vbase'],
    '{Ibase} = {Sbase} × 1000 ÷ (√3 × {Vbase})',
    ibaseOf,
    '{Sbase} × 1000 ÷ (√3 × {Vbase})',
    'Three-phase power is √3 × line voltage × current; MVA ÷ kV is kA, so × 1000 for amperes.',
  ),
  derive(
    'IkA',
    'IkA',
    [I, 'Ibase'],
    `{IkA} = {${I}} × {Ibase} ÷ 1000`,
    (v) => (v[I]! * v.Ibase!) / 1000,
    `{${I}} × {Ibase} ÷ 1000`,
    'A per-unit current times the base current is amperes; ÷ 1000 for kA.',
  ),
];
const PU = { step: 0.01 };

const ifOf = (v: Values) => v.Vf! / v.Xth!;

const faultPage = (
  id: string,
  title: string,
  use: string,
  typed: Values,
  faultBus?: number,
): ModuleDef => {
  // A fault on bus k sees the elements before it: the generator alone, or all three.
  const parts = ['Xg', 'Xt', 'Xl'].slice(0, faultBus ?? 3);
  const sum = (v: Values) => parts.reduce((a, p) => a + v[p]!, 0);
  return page({
    id,
    title,
    use,
    assumptions: [
      'A bolted three-phase fault; loads ignored, so no current flows before it.',
      'Reactances only, every one in pu on the common base.',
      faultBus === 1
        ? 'The fault is on the generator’s bus: only the generator’s reactance is between them.'
        : 'The reactances from the source to the fault add in series to X_th.',
    ],
    variables: [
      num('Vf', 'V_f', 'Prefault voltage', 'pu', 0.5, 1.2, PU),
      num('Xg', 'X_G', 'Generator reactance', 'pu', 0.01, 2, PU),
      ...(faultBus === 1 ? [] : [num('Xt', 'X_T', 'Transformer reactance', 'pu', 0.01, 2, PU)]),
      ...(faultBus === 1 ? [] : [num('Xl', 'X_L', 'Line reactance', 'pu', 0.01, 2, PU)]),
      out('Xth', 'X_th', 'Thévenin reactance', 'pu'),
      out('If', 'I_f', 'Fault current', 'pu'),
      ...baseVars(),
      out('Sf', 'S_f', 'Fault power', 'MVA'),
    ],
    rules: [
      derive(
        'Xth',
        'Xth',
        parts,
        `{Xth} = ${parts.map((p) => `{${p}}`).join(' + ')}`,
        sum,
        parts.map((p) => `{${p}}`).join(' + '),
        'Seen from the fault, the reactances back to the source are in series.',
      ),
      derive(
        'If',
        'If',
        ['Vf', 'Xth'],
        '{If} = {Vf} ÷ {Xth}',
        ifOf,
        '{Vf} ÷ {Xth}',
        'The prefault voltage drives the fault current through X_th alone.',
      ),
      ...baseRules('If'),
      derive(
        'Sf',
        'Sf',
        ['Vf', 'If', 'Sbase'],
        '{Sf} = {Vf} × {If} × {Sbase}',
        (v) => v.Vf! * v.If! * v.Sbase!,
        '{Vf} × {If} × {Sbase}',
        'Per-unit power times the base power: V_f × I_f in pu, times S_base.',
      ),
    ],
    example: example(
      typed,
      ['Xth', sum],
      ['If', ifOf],
      ['Ibase', ibaseOf],
      ['IkA', (v) => (v.If! * v.Ibase!) / 1000],
      ['Sf', (v) => v.Vf! * v.If! * v.Sbase!],
    ),
    startWith: ['Vf', ...parts, 'Sbase', 'Vbase'],
    representation: {
      kind: 'oneLine',
      elements: [
        { type: 'generator', name: 'G', x: 'Xg' },
        { type: 'transformer', name: 'T', ...(faultBus === 1 ? {} : { x: 'Xt' }) },
        { type: 'line', name: 'Line', ...(faultBus === 1 ? {} : { x: 'Xl' }) },
      ],
      fault: '3φ',
      ...(faultBus ? { faultBus } : {}),
      vf: 'Vf',
      xth: 'Xth',
      current: 'If',
      base: { s: 'Sbase', v: 'Vbase', iBase: 'Ibase', iKA: 'IkA', mva: 'Sf' },
    },
  });
};

const FAULT = faultPage(
  'g.he-oneLine-three-phase',
  'Three-phase fault current',
  'Use this for “Find the fault current for a bolted three-phase fault with X_th = 0.2 pu on a 100 MVA, 13.8 kV base.”',
  { Vf: 1, Xg: 0.1, Xt: 0.06, Xl: 0.04, Sbase: 100, Vbase: 13.8 },
);

/** A fault on the generator's own bus: only X_G limits it. */
const FAULT_GEN = faultPage(
  'g.he-oneLine-generator-bus',
  'A fault at the generator’s terminals',
  'Use this for “A 100 MVA, 13.8 kV generator with X″ = 0.1 pu faults at its terminals. Find the fault current in kA.”',
  { Vf: 1, Xg: 0.1, Sbase: 100, Vbase: 13.8 },
  1,
);

const iaOf = (v: Values) => (3 * v.Vf!) / (v.X1! + v.X2! + v.X0!);

const SLG = page({
  id: 'g.he-oneLine-slg',
  title: 'Single line-to-ground fault current',
  use: 'Use this for “X₁ = X₂ = 0.2 pu and X₀ = 0.1 pu. Find the line-to-ground fault current on a 100 MVA, 13.8 kV base.”',
  assumptions: [
    'A bolted fault from phase a to ground; loads ignored.',
    'The positive, negative and zero sequence networks connect in series at the fault.',
    'I_a = 3I_a1, all in pu on the common base.',
  ],
  variables: [
    num('Vf', 'V_f', 'Prefault voltage', 'pu', 0.5, 1.2, PU),
    num('X1', 'X₁', 'Positive-sequence reactance', 'pu', 0.01, 2, PU),
    num('X2', 'X₂', 'Negative-sequence reactance', 'pu', 0.01, 2, PU),
    num('X0', 'X₀', 'Zero-sequence reactance', 'pu', 0.01, 2, PU),
    out('Ia', 'I_a', 'Fault current', 'pu'),
    ...baseVars(),
  ],
  rules: [
    derive(
      'Ia',
      'Ia',
      ['Vf', 'X1', 'X2', 'X0'],
      '{Ia} = 3 × {Vf} ÷ ({X1} + {X2} + {X0})',
      iaOf,
      '3 × {Vf} ÷ ({X1} + {X2} + {X0})',
      'One current I_a1 flows through all three networks in series, and I_a = 3I_a1.',
    ),
    ...baseRules('Ia'),
  ],
  example: example(
    { Vf: 1, X1: 0.2, X2: 0.2, X0: 0.1, Sbase: 100, Vbase: 13.8 },
    ['Ia', iaOf],
    ['Ibase', ibaseOf],
    ['IkA', (v) => (v.Ia! * v.Ibase!) / 1000],
  ),
  startWith: ['Vf', 'X1', 'X2', 'X0', 'Sbase', 'Vbase'],
  representation: {
    kind: 'oneLine',
    elements: [
      { type: 'generator', name: 'G' },
      { type: 'transformer', name: 'T' },
      { type: 'line', name: 'Line' },
    ],
    fault: 'slg',
    vf: 'Vf',
    current: 'Ia',
    sequence: { x1: 'X1', x2: 'X2', x0: 'X0' },
    base: { s: 'Sbase', v: 'Vbase', iBase: 'Ibase', iKA: 'IkA' },
  },
});

// ─── HC181: AM and FM spectra (communication-systems#0, ~fm) ───────────────────

const ptOf = (v: Values) => v.Pc! * (1 + v.mu! ** 2 / 2);
const etaOf = (v: Values) => (100 * v.mu! ** 2) / (2 + v.mu! ** 2);

const amPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'Tone modulation: one message frequency f_m.',
      'μ ≤ 1, so the envelope never reaches zero (no overmodulation).',
      'The sidebands sit at f_c ± f_m, each μ ÷ 2 of the carrier’s height.',
    ],
    variables: [
      num('Pc', 'P_c', 'Carrier power', 'W', 0.001, 1e7, { step: 0.1 }),
      num('mu', 'μ', 'Modulation index', undefined, 0.01, 1, { step: 0.01 }),
      out('Pt', 'P_t', 'Total power', 'W'),
      out('Psb', 'P_sb', 'Sideband power', 'W'),
      out('eta', 'η', 'Efficiency', '%'),
      num('fm', 'f_m', 'Message frequency', 'kHz', 0.01, 100, { step: 0.1 }),
      out('B', 'B', 'Bandwidth', 'kHz'),
      num('fc', 'f_c', 'Carrier frequency', 'kHz', 100, 1e6, { step: 1 }),
      out('fL', 'f_L', 'Lower sideband', 'kHz'),
      out('fU', 'f_U', 'Upper sideband', 'kHz'),
    ],
    rules: [
      derive(
        'Pt',
        'Pt',
        ['Pc', 'mu'],
        '{Pt} = {Pc} × (1 + {mu}^2 ÷ 2)',
        ptOf,
        '{Pc} × (1 + {mu}^2 ÷ 2)',
        'Each sideband is μ ÷ 2 of the carrier’s amplitude, so the two add μ² ÷ 2 of its power.',
      ),
      derive(
        'Psb',
        'Psb',
        ['Pt', 'Pc'],
        '{Psb} = {Pt} − {Pc}',
        (v) => v.Pt! - v.Pc!,
        '{Pt} − {Pc}',
        'What the sidebands carry is the total less the carrier.',
      ),
      derive(
        'eta',
        'eta',
        ['mu'],
        '{eta} = 100 × {mu}^2 ÷ (2 + {mu}^2)',
        etaOf,
        '100 × {mu}^2 ÷ (2 + {mu}^2)',
        'The share of the power in the sidebands, where the message is.',
      ),
      derive(
        'B',
        'B',
        ['fm'],
        '{B} = 2 × {fm}',
        (v) => 2 * v.fm!,
        '2 × {fm}',
        'The sidebands reach f_m either side of the carrier.',
      ),
      derive(
        'fL',
        'fL',
        ['fc', 'fm'],
        '{fL} = {fc} − {fm}',
        (v) => v.fc! - v.fm!,
        '{fc} − {fm}',
        'The lower sideband sits f_m below the carrier …',
      ),
      derive(
        'fU',
        'fU',
        ['fc', 'fm'],
        '{fU} = {fc} + {fm}',
        (v) => v.fc! + v.fm!,
        '{fc} + {fm}',
        '… and the upper one f_m above it.',
      ),
    ],
    example: example(
      typed,
      ['Pt', ptOf],
      ['Psb', (v) => v.Pt! - v.Pc!],
      ['eta', etaOf],
      ['B', (v) => 2 * v.fm!],
      ['fL', (v) => v.fc! - v.fm!],
      ['fU', (v) => v.fc! + v.fm!],
    ),
    startWith: ['Pc', 'mu', 'fm', 'fc'],
    standalone: {
      vars: ['fm', 'B', 'fc', 'fL', 'fU'],
      why: 'The frequencies place the lines on the axis and the powers set their heights; the picture joins them.',
    },
    representation: {
      kind: 'rfSpectrum',
      mode: 'am',
      fc: 'fc',
      fm: 'fm',
      mu: 'mu',
      bandwidth: 'B',
      carrierPower: 'Pc',
      sidebandPower: 'Psb',
      totalPower: 'Pt',
      efficiency: 'eta',
    },
  });

const AM = amPage(
  'g.he-rfSpectrum-am',
  'AM power, efficiency and bandwidth',
  'Use this for “A 100 W carrier is modulated to μ = 0.5. Find the total and sideband power.”',
  { Pc: 100, mu: 0.5, fm: 5, fc: 1000 },
);

/** Full modulation, μ = 1: the most the sidebands can carry, a third of the power. */
const AM_FULL = amPage(
  'g.he-rfSpectrum-am-full',
  'AM at 100% modulation',
  'Use this for “A 50 kW broadcast carrier is modulated 100%. What share of the power carries the message?”',
  { Pc: 50000, mu: 1, fm: 10, fc: 760 },
);

const betaOf = (v: Values) => v.df! / v.fm!;
const carsonOf = (v: Values) => 2 * (v.df! + v.fm!);

const fmPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'Tone modulation: one message frequency f_m.',
      'Carson’s rule: about 98% of the power lies within (β + 1)f_m of the carrier.',
      'The lines sit every f_m, each |J_n(β)| of the unmodulated carrier.',
    ],
    variables: [
      num('df', 'Δf', 'Peak frequency deviation', 'kHz', 0.01, 1000, { step: 0.1 }),
      num('fm', 'f_m', 'Message frequency', 'kHz', 0.01, 100, { step: 0.1 }),
      // The page draws to β = 25 (wideband FM); past it the lines are too many to show.
      out('beta', 'β', 'Modulation index', undefined, { max: 25 }),
      out('B', 'B', 'Carson bandwidth', 'kHz'),
    ],
    rules: [
      derive(
        'beta',
        'beta',
        ['df', 'fm'],
        '{beta} = {df} ÷ {fm}',
        betaOf,
        '{df} ÷ {fm}',
        'The swing of the frequency in units of the message frequency.',
      ),
      derive(
        'B',
        'B',
        ['df', 'fm'],
        '{B} = 2 × ({df} + {fm})',
        carsonOf,
        '2 × ({df} + {fm})',
        'Carson’s rule: the deviation plus one more message frequency, on each side.',
      ),
    ],
    example: example(typed, ['beta', betaOf], ['B', carsonOf]),
    startWith: ['df', 'fm'],
    representation: {
      kind: 'rfSpectrum',
      mode: 'fm',
      fm: 'fm',
      deviation: 'df',
      beta: 'beta',
      bandwidth: 'B',
    },
  });

const FM = fmPage(
  'g.he-rfSpectrum-fm',
  'FM bandwidth by Carson’s rule',
  'Use this for “Broadcast FM swings 75 kHz with a 15 kHz tone. Find β and the bandwidth.”',
  { df: 75, fm: 15 },
);

/** Narrowband FM (β < 1): little more than a carrier and one pair of lines, like AM. */
const FM_NARROW = fmPage(
  'g.he-rfSpectrum-fm-narrow',
  'Narrowband FM',
  'Use this for “A 2.5 kHz deviation carries a 5 kHz tone. Find β and the bandwidth.”',
  { df: 2.5, fm: 5 },
);

// ─── HC182: digital modulation's constellation (communication-systems#1) ───────

const rbOf = (v: Values) => v.Rs! * Math.log2(v.M!);
const bwOf = (v: Values) => v.Rs! * (1 + v.alpha!);

const constellationPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'Each symbol carries log₂M bits; M is 2, 4, 8, 16, 64 or 256.',
      'Raised-cosine pulses: the bandwidth is R_s(1 + α).',
      'PSK up to 8 points, square QAM from 16, each Gray-coded.',
    ],
    variables: [
      num('M', 'M', 'Points in the constellation', undefined, 2, 256, {
        integer: true,
        allowed: [2, 4, 8, 16, 64, 256],
      }),
      num('Rs', 'R_s', 'Symbol rate', 'Msym/s', 0.001, 1000, { step: 0.01 }),
      out('Rb', 'R_b', 'Bit rate', 'Mb/s'),
      num('alpha', 'α', 'Roll-off', undefined, 0, 1, { step: 0.01 }),
      out('B', 'B', 'Bandwidth', 'MHz'),
      out('eta', 'η', 'Spectral efficiency', 'b/s/Hz'),
    ],
    rules: [
      derive(
        'Rb',
        'Rb',
        ['Rs', 'M'],
        '{Rb} = {Rs} × log₂({M})',
        rbOf,
        '{Rs} × log₂({M})',
        'Each symbol picks one of M points, which is log₂M bits.',
      ),
      derive(
        'B',
        'B',
        ['Rs', 'alpha'],
        '{B} = {Rs} × (1 + {alpha})',
        bwOf,
        '{Rs} × (1 + {alpha})',
        'The pulses need R_s of bandwidth, plus the roll-off’s share.',
      ),
      derive(
        'eta',
        'eta',
        ['Rb', 'B'],
        '{eta} = {Rb} ÷ {B}',
        (v) => v.Rb! / v.B!,
        '{Rb} ÷ {B}',
        'Bits per second for each hertz used.',
      ),
    ],
    example: example(typed, ['Rb', rbOf], ['B', bwOf], ['eta', (v) => v.Rb! / v.B!]),
    startWith: ['M', 'Rs', 'alpha'],
    representation: {
      kind: 'complexPlane',
      z: { re: 0, im: 0 },
      j: true,
      constellation: {
        M: 'M',
        symbolRate: 'Rs',
        bitRate: 'Rb',
        rolloff: 'alpha',
        bandwidth: 'B',
        efficiency: 'eta',
      },
    },
  });

const QAM16 = constellationPage(
  'g.he-complexPlane-constellation-qam',
  'Bit rate and bandwidth of M-ary modulation',
  'Use this for “A 16-QAM link sends 1 Msymbol/s with roll-off 0.25. Find the bit rate and bandwidth.”',
  { M: 16, Rs: 1, alpha: 0.25 },
);

const PSK8 = constellationPage(
  'g.he-complexPlane-constellation-psk',
  '8-PSK: bits per symbol and bandwidth',
  'Use this for “An 8-PSK link sends 2 Msymbol/s with roll-off 0.35. Find its bit rate and spectral efficiency.”',
  { M: 8, Rs: 2, alpha: 0.35 },
);

/** The top of the list: 256-QAM, 8 bits a symbol (too many points to label). */
const QAM256 = constellationPage(
  'g.he-complexPlane-constellation-256',
  '256-QAM: the densest constellation',
  'Use this for “A cable channel runs 256-QAM at 5.36 Msymbol/s with roll-off 0.12. Find the bit rate.”',
  { M: 256, Rs: 5.36, alpha: 0.12 },
);

export const HE4M_GALLERY_MODULES: ModuleDef[] = [
  PHASES,
  PHASES_SATURATED,
  SAND_CONE,
  LOS,
  LOS_F,
  FAULT,
  FAULT_GEN,
  SLG,
  AM,
  AM_FULL,
  FM,
  FM_NARROW,
  QAM16,
  PSK8,
  QAM256,
];

export const HE4M_GALLERY_LAYOUTS: LayoutDef[] = [];
