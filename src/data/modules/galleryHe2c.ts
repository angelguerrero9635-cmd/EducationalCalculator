/**
 * College gallery demos, round 2, group C (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC17: `propertyDiagram` (ME-P10, ACC-P10): water's vapor dome on T–v, P–v and T–s from the
 * IAPWS saturation equations, air on T–s (an entropy change, a compressor, the Brayton cycle),
 * the Rankine cycle, and a real gas's isotherm on P–v (virial, van der Waals).
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

// ─── Building blocks ─────────────────────────────────────────────────────────

type Solver = (v: Values) => number | undefined;

/** A relation and its steps from one table: each value it solves for, with its text. */
function rule(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  solves: Record<string, [Solver, string, string]>,
): { relation: Relation; steps: Record<string, StepText> } {
  return {
    relation: {
      id,
      display,
      vars,
      residual,
      solve: Object.fromEntries(Object.entries(solves).map(([k, [f]]) => [k, f])),
    },
    steps: Object.fromEntries(
      Object.entries(solves).map(([k, [, expr, how]]) => [k, { expr, how }]),
    ),
  };
}

const rules = (...rs: ReturnType<typeof rule>[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

const div = (a: number, b: number) => (b === 0 || !Number.isFinite(b) ? undefined : a / b);
const pos = (x: number) => (x > 0 && Number.isFinite(x) ? x : undefined);

/** A value with one unit (the formula is written in it). */
const q = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  step: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({
  id,
  symbol,
  name,
  ...(unit ? { unit, units: [unit] } : {}),
  min,
  max,
  step,
  ...more,
});

// ─── HC17: a wet mixture on T–v (thermodynamics#0) ───────────────────────────

const QUALITY = rules(
  rule(
    'x = (v − v_f) ÷ (v_g − v_f)',
    '{x} = ({v} − {vf}) ÷ ({vg} − {vf})',
    ['x', 'v', 'vf', 'vg'],
    (v) => v.x! * (v.vg! - v.vf!) - (v.v! - v.vf!),
    {
      x: [
        (v) => div(v.v! - v.vf!, v.vg! - v.vf!),
        '({v} − {vf}) ÷ ({vg} − {vf})',
        'The quality is how far v lies along the tie line from v_f to v_g: subtract v_f from v, then divide by the line’s length v_g − v_f.',
      ],
      v: [
        (v) => v.vf! + v.x! * (v.vg! - v.vf!),
        '{vf} + {x} × ({vg} − {vf})',
        'Start at v_f and go the fraction x of the way to v_g.',
      ],
      vf: [
        (v) => div(v.v! - v.x! * v.vg!, 1 - v.x!),
        '({v} − {x} × {vg}) ÷ (1 − {x})',
        'v = (1 − x)v_f + xv_g: take xv_g from v, then divide by the liquid’s share 1 − x.',
      ],
      vg: [
        (v) => div(v.v! - (1 - v.x!) * v.vf!, v.x!),
        '({v} − (1 − {x}) × {vf}) ÷ {x}',
        'v = (1 − x)v_f + xv_g: take the liquid’s part (1 − x)v_f from v, then divide by x.',
      ],
    },
  ),
  rule(
    'h = h_f + xh_fg',
    '{h} = {hf} + {x} × {hfg}',
    ['h', 'hf', 'x', 'hfg'],
    (v) => v.h! - v.hf! - v.x! * v.hfg!,
    {
      h: [
        (v) => v.hf! + v.x! * v.hfg!,
        '{hf} + {x} × {hfg}',
        'The liquid’s enthalpy h_f, plus the fraction x of the heat of vaporization h_fg.',
      ],
      hf: [
        (v) => v.h! - v.x! * v.hfg!,
        '{h} − {x} × {hfg}',
        'Take the vapor’s share x × h_fg from h.',
      ],
      x: [
        (v) => div(v.h! - v.hf!, v.hfg!),
        '({h} − {hf}) ÷ {hfg}',
        'Subtract h_f from h, then divide by h_fg.',
      ],
      hfg: [
        (v) => div(v.h! - v.hf!, v.x!),
        '({h} − {hf}) ÷ {x}',
        'Subtract h_f from h, then divide by x.',
      ],
    },
  ),
);

const mixtureVars = (Pmax: number): VariableDef[] => [
  q('P', 'P', 'Pressure (the table values are read here)', 'kPa', 1, Pmax, 1),
  q('vf', 'v_f', 'Specific volume of saturated liquid', 'm³/kg', 0.0009, 0.004, 0.000001),
  q('vg', 'v_g', 'Specific volume of saturated vapor', 'm³/kg', 0.002, 300, 0.0001),
  q('v', 'v', 'Specific volume of the mixture', 'm³/kg', 0.0009, 300, 0.0001),
  q('x', 'x', 'Quality (the vapor’s mass fraction)', undefined, 0, 1, 0.001),
  q('hf', 'h_f', 'Enthalpy of saturated liquid', 'kJ/kg', 1, 2100, 0.1),
  q('hfg', 'h_fg', 'Heat of vaporization', 'kJ/kg', 1, 2600, 0.1),
  q('h', 'h', 'Enthalpy of the mixture', 'kJ/kg', 1, 2800, 0.1),
];

function mixtureExample(P: number, vf: number, vg: number, v: number, hf: number, hfg: number) {
  const x = (v - vf) / (vg - vf);
  return { P, vf, vg, v, x, hf, hfg, h: hf + x * hfg };
}

const MIXTURE_ASSUMPTIONS = [
  'The state is under the dome, 0 ≤ x ≤ 1: liquid and vapor at the same T_sat and P.',
  'v_f, v_g, h_f and h_fg are read from the saturated-water table at the same P.',
  'The dome is drawn from the IAPWS-IF97 saturation equations.',
];

const mixtureStandalone = {
  vars: ['P'],
  why: 'P names the pressure the table values are read at; no formula on this page uses it.',
};

const tvMixture: ModuleDef = {
  id: 'g.he-propertyDiagram-tv-mixture',
  title: 'T–v diagram: the quality and enthalpy of wet steam at 200 kPa',
  use: 'Use this for the quality and enthalpy of a liquid–vapor mixture from table values at one pressure.',
  assumptions: MIXTURE_ASSUMPTIONS,
  standalone: mixtureStandalone,
  variables: mixtureVars(22000),
  ...QUALITY,
  example: mixtureExample(200, 0.001061, 0.8857, 0.4, 504.7, 2201.6),
  startWith: ['P', 'vf', 'vg', 'v', 'hf', 'hfg'],
  representation: {
    kind: 'propertyDiagram',
    plane: 'Tv',
    substance: 'water',
    tie: { P: 'P', vf: 'vf', vg: 'vg' },
    states: [{ name: 'State', P: 'P', v: 'v', x: 'x' }],
    more: ['h'],
  },
};

const pvHighPressure: ModuleDef = {
  id: 'g.he-propertyDiagram-pv-high-pressure',
  title: 'P–v diagram: wet steam at 10 MPa, near the top of the dome',
  use: 'Use this for the quality of a mixture at a high pressure, where v_f and v_g close in.',
  assumptions: MIXTURE_ASSUMPTIONS,
  standalone: mixtureStandalone,
  variables: mixtureVars(22000),
  ...QUALITY,
  example: mixtureExample(10000, 0.001452, 0.01803, 0.012, 1407.8, 1317.3),
  startWith: ['P', 'vf', 'vg', 'v', 'hf', 'hfg'],
  representation: {
    kind: 'propertyDiagram',
    plane: 'Pv',
    substance: 'water',
    tie: { P: 'P', vf: 'vf', vg: 'vg' },
    states: [{ name: 'State', P: 'P', v: 'v', x: 'x' }],
    more: ['h'],
  },
};

// ─── HC17: Δs of air on T–s (thermodynamics#2~entropy) ───────────────────────

const CP = 1.005;
const R_AIR = 0.287;
const K_AIR = 1.4;
/** (k − 1) ÷ k for air, as the pages write it. */
const EXP = (K_AIR - 1) / K_AIR;

const ENTROPY = rules(
  rule(
    'Δs = c_p ln(T₂ ÷ T₁) − R ln(P₂ ÷ P₁)',
    `{ds} = ${CP} × ln({T2} ÷ {T1}) − ${R_AIR} × ln({P2} ÷ {P1})`,
    ['ds', 'T2', 'T1', 'P2', 'P1'],
    (v) => v.ds! - (CP * Math.log(v.T2! / v.T1!) - R_AIR * Math.log(v.P2! / v.P1!)),
    {
      ds: [
        (v) => CP * Math.log(v.T2! / v.T1!) - R_AIR * Math.log(v.P2! / v.P1!),
        `${CP} × ln({T2} ÷ {T1}) − ${R_AIR} × ln({P2} ÷ {P1})`,
        'Heating adds c_p ln(T₂ ÷ T₁); squeezing takes away R ln(P₂ ÷ P₁).',
      ],
      T2: [
        (v) => v.T1! * Math.exp((v.ds! + R_AIR * Math.log(v.P2! / v.P1!)) / CP),
        `{T1} × e^(({ds} + ${R_AIR} × ln({P2} ÷ {P1})) ÷ ${CP})`,
        'Add the pressure term back to Δs, divide by c_p, raise e to that and multiply by T₁.',
      ],
      T1: [
        (v) => v.T2! / Math.exp((v.ds! + R_AIR * Math.log(v.P2! / v.P1!)) / CP),
        `{T2} ÷ e^(({ds} + ${R_AIR} × ln({P2} ÷ {P1})) ÷ ${CP})`,
        'Add the pressure term back to Δs, divide by c_p, raise e to that and divide T₂ by it.',
      ],
      P2: [
        (v) => v.P1! * Math.exp((CP * Math.log(v.T2! / v.T1!) - v.ds!) / R_AIR),
        `{P1} × e^((${CP} × ln({T2} ÷ {T1}) − {ds}) ÷ ${R_AIR})`,
        'Take Δs from the heating term, divide by R, raise e to that and multiply by P₁.',
      ],
      P1: [
        (v) => v.P2! / Math.exp((CP * Math.log(v.T2! / v.T1!) - v.ds!) / R_AIR),
        `{P2} ÷ e^((${CP} × ln({T2} ÷ {T1}) − {ds}) ÷ ${R_AIR})`,
        'Take Δs from the heating term, divide by R, raise e to that and divide P₂ by it.',
      ],
    },
  ),
);

const tsEntropy: ModuleDef = {
  id: 'g.he-propertyDiagram-ts-entropy',
  title: 'T–s diagram: the entropy change of air heated and compressed',
  use: 'Use this for the entropy change of an ideal gas between two states (T and P at each).',
  assumptions: [
    `Air is an ideal gas with constant c_p = ${CP} kJ/(kg·K) and R = ${R_AIR} kJ/(kg·K).`,
    'Temperatures in kelvins. Δs depends on the end states only, not the path.',
  ],
  variables: [
    q('T1', 'T₁', 'Temperature at state 1', 'K', 1, 3000, 0.1),
    q('P1', 'P₁', 'Pressure at state 1', 'kPa', 1, 100000, 0.1),
    q('T2', 'T₂', 'Temperature at state 2', 'K', 1, 3000, 0.1),
    q('P2', 'P₂', 'Pressure at state 2', 'kPa', 1, 100000, 0.1),
    q('ds', 'Δs', 'Entropy change', 'kJ/(kg·K)', -10, 10, 0.0001),
  ],
  ...ENTROPY,
  example: {
    T1: 300,
    P1: 100,
    T2: 500,
    P2: 300,
    ds: CP * Math.log(500 / 300) - R_AIR * Math.log(3),
  },
  startWith: ['T1', 'P1', 'T2', 'P2'],
  representation: {
    kind: 'propertyDiagram',
    plane: 'Ts',
    substance: 'gas',
    gas: { cp: CP, R: R_AIR },
    units: { T: 'K', P: 'kPa' },
    states: [
      { name: '1', T: 'T1', P: 'P1' },
      { name: '2', T: 'T2', P: 'P2' },
    ],
    steps: [{ from: '1', to: '2', process: 'actual' }],
    isobars: [
      { P: 'P1', name: 'P₁' },
      { P: 'P2', name: 'P₂' },
    ],
    ds: { from: '1', to: '2', value: 'ds' },
  },
};

// ─── HC17: a compressor, ideal and real (thermodynamics#2~isentropic) ────────

const COMPRESSOR = rules(
  rule(
    'T₂s = T₁r_p^((k − 1) ÷ k)',
    `{T2s} = {T1} × {rp}^${EXP.toFixed(4)}`,
    ['T2s', 'T1', 'rp'],
    (v) => v.T2s! - v.T1! * v.rp! ** EXP,
    {
      T2s: [
        (v) => v.T1! * v.rp! ** EXP,
        '{T1} × {rp}^(0.4 ÷ 1.4)',
        'An isentropic compression: raise the pressure ratio to (k − 1) ÷ k, then multiply by T₁.',
      ],
      T1: [
        (v) => div(v.T2s!, v.rp! ** EXP),
        '{T2s} ÷ {rp}^(0.4 ÷ 1.4)',
        'Divide T₂s by the pressure ratio raised to (k − 1) ÷ k.',
      ],
      rp: [
        (v) => pos((v.T2s! / v.T1!) ** (1 / EXP)),
        '({T2s} ÷ {T1})^(1.4 ÷ 0.4)',
        'Divide T₂s by T₁, then raise it to k ÷ (k − 1).',
      ],
    },
  ),
  rule(
    'T₂ = T₁ + (T₂s − T₁) ÷ η_c',
    '{T2} = {T1} + ({T2s} − {T1}) ÷ {eta}',
    ['T2', 'T1', 'T2s', 'eta'],
    (v) => (v.T2! - v.T1!) * v.eta! - (v.T2s! - v.T1!),
    {
      T2: [
        (v) => div(v.T2s! - v.T1!, v.eta!)! + v.T1!,
        '{T1} + ({T2s} − {T1}) ÷ {eta}',
        'The real compressor needs more work: divide the ideal rise by η_c, then add it to T₁.',
      ],
      T2s: [
        (v) => v.T1! + (v.T2! - v.T1!) * v.eta!,
        '{T1} + ({T2} − {T1}) × {eta}',
        'The ideal rise is η_c times the real one: multiply, then add T₁.',
      ],
      eta: [
        (v) => div(v.T2s! - v.T1!, v.T2! - v.T1!),
        '({T2s} − {T1}) ÷ ({T2} − {T1})',
        'The efficiency is the ideal rise over the real rise.',
      ],
      T1: [
        (v) => div(v.T2s! - v.eta! * v.T2!, 1 - v.eta!),
        '({T2s} − {eta} × {T2}) ÷ (1 − {eta})',
        'Multiply out η_c(T₂ − T₁) = T₂s − T₁, gather the T₁ terms, then divide by 1 − η_c.',
      ],
    },
  ),
  rule(
    'w = c_p(T₂ − T₁)',
    `{w} = ${CP} × ({T2} − {T1})`,
    ['w', 'T2', 'T1'],
    (v) => v.w! - CP * (v.T2! - v.T1!),
    {
      w: [
        (v) => CP * (v.T2! - v.T1!),
        `${CP} × ({T2} − {T1})`,
        'The work in is c_p times the real temperature rise.',
      ],
      T2: [(v) => v.T1! + v.w! / CP, `{T1} + {w} ÷ ${CP}`, 'Divide w by c_p, then add T₁.'],
      T1: [
        (v) => v.T2! - v.w! / CP,
        `{T2} − {w} ÷ ${CP}`,
        'Divide w by c_p, then take it from T₂.',
      ],
    },
  ),
);

function compressorExample(T1: number, rp: number, eta: number): Values {
  const T2s = T1 * rp ** EXP;
  const T2 = T1 + (T2s - T1) / eta;
  return { T1, rp, T2s, eta, T2, w: CP * (T2 - T1) };
}

const compressorModule = (id: string, title: string, example: Values): ModuleDef => ({
  id,
  title,
  use: 'Use this for a compressor’s exit temperature and work from its pressure ratio and isentropic efficiency.',
  assumptions: [
    `Air is an ideal gas with constant c_p = ${CP} kJ/(kg·K) and k = ${K_AIR}.`,
    'Steady flow, adiabatic; kinetic and potential energy changes neglected.',
  ],
  variables: [
    q('T1', 'T₁', 'Inlet temperature', 'K', 1, 3000, 0.1),
    q('rp', 'r_p', 'Pressure ratio P₂ ÷ P₁', undefined, 1.01, 100, 0.01),
    q('T2s', 'T₂s', 'Ideal (isentropic) exit temperature', 'K', 1, 5000, 0.1),
    q('eta', 'η_c', 'Isentropic efficiency', undefined, 0.3, 1, 0.01),
    q('T2', 'T₂', 'Real exit temperature', 'K', 1, 5000, 0.1),
    q('w', 'w', 'Work in per kilogram', 'kJ/kg', 0.1, 5000, 0.1),
  ],
  ...COMPRESSOR,
  example,
  startWith: ['T1', 'rp', 'eta'],
  representation: {
    kind: 'propertyDiagram',
    plane: 'Ts',
    substance: 'gas',
    gas: { cp: CP, k: K_AIR },
    units: { T: 'K' },
    states: [
      { name: '1', T: 'T1', P: 1 },
      { name: '2s', T: 'T2s', P: 'rp', ideal: true },
      { name: '2', T: 'T2', P: 'rp' },
    ],
    steps: [
      { from: '1', to: '2s', process: 'isentropic' },
      { from: '1', to: '2', process: 'actual' },
    ],
    isobars: [
      { P: 1, name: 'P₁' },
      { P: 'rp', name: 'P₂ = r_p P₁' },
    ],
    more: ['w'],
  },
});

const tsCompressor = compressorModule(
  'g.he-propertyDiagram-ts-compressor',
  'T–s diagram: an air compressor, ideal and real',
  compressorExample(300, 8, 0.85),
);

const tsCompressorPoor = compressorModule(
  'g.he-propertyDiagram-ts-compressor-poor',
  'T–s diagram: a poor compressor at a high pressure ratio',
  compressorExample(300, 20, 0.7),
);

// ─── HC17: the Brayton cycle (thermodynamics#3, propulsion#0) ────────────────

const ratioPow = (v: Values) => v.rp! ** EXP;

const BRAYTON = rules(
  rule(
    'T₂ = T₁r_p^((γ − 1) ÷ γ)',
    `{T2} = {T1} × {rp}^${EXP.toFixed(4)}`,
    ['T2', 'T1', 'rp'],
    (v) => v.T2! - v.T1! * ratioPow(v),
    {
      T2: [
        (v) => v.T1! * ratioPow(v),
        '{T1} × {rp}^(0.4 ÷ 1.4)',
        'The compressor is isentropic: raise r_p to (γ − 1) ÷ γ, then multiply by T₁.',
      ],
      T1: [
        (v) => div(v.T2!, ratioPow(v)),
        '{T2} ÷ {rp}^(0.4 ÷ 1.4)',
        'Divide T₂ by r_p^((γ − 1) ÷ γ).',
      ],
      rp: [
        (v) => pos((v.T2! / v.T1!) ** (1 / EXP)),
        '({T2} ÷ {T1})^(1.4 ÷ 0.4)',
        'Divide T₂ by T₁, then raise it to γ ÷ (γ − 1).',
      ],
    },
  ),
  rule(
    'T₄ = T₃ ÷ r_p^((γ − 1) ÷ γ)',
    `{T4} = {T3} ÷ {rp}^${EXP.toFixed(4)}`,
    ['T4', 'T3', 'rp'],
    (v) => v.T4! * ratioPow(v) - v.T3!,
    {
      T4: [
        (v) => div(v.T3!, ratioPow(v)),
        '{T3} ÷ {rp}^(0.4 ÷ 1.4)',
        'The turbine is isentropic over the same ratio: divide T₃ by r_p^((γ − 1) ÷ γ).',
      ],
      T3: [
        (v) => v.T4! * ratioPow(v),
        '{T4} × {rp}^(0.4 ÷ 1.4)',
        'Multiply T₄ by r_p^((γ − 1) ÷ γ).',
      ],
      rp: [
        (v) => pos((v.T3! / v.T4!) ** (1 / EXP)),
        '({T3} ÷ {T4})^(1.4 ÷ 0.4)',
        'Divide T₃ by T₄, then raise it to γ ÷ (γ − 1).',
      ],
    },
  ),
  rule(
    'w_c = c_p(T₂ − T₁)',
    `{wc} = ${CP} × ({T2} − {T1})`,
    ['wc', 'T2', 'T1'],
    (v) => v.wc! - CP * (v.T2! - v.T1!),
    {
      wc: [
        (v) => CP * (v.T2! - v.T1!),
        `${CP} × ({T2} − {T1})`,
        'Compressor work: c_p times its temperature rise.',
      ],
      T2: [(v) => v.T1! + v.wc! / CP, `{T1} + {wc} ÷ ${CP}`, 'Divide w_c by c_p, then add T₁.'],
      T1: [
        (v) => v.T2! - v.wc! / CP,
        `{T2} − {wc} ÷ ${CP}`,
        'Divide w_c by c_p, then take it from T₂.',
      ],
    },
  ),
  rule(
    'w_t = c_p(T₃ − T₄)',
    `{wt} = ${CP} × ({T3} − {T4})`,
    ['wt', 'T3', 'T4'],
    (v) => v.wt! - CP * (v.T3! - v.T4!),
    {
      wt: [
        (v) => CP * (v.T3! - v.T4!),
        `${CP} × ({T3} − {T4})`,
        'Turbine work: c_p times its temperature drop.',
      ],
      T3: [(v) => v.T4! + v.wt! / CP, `{T4} + {wt} ÷ ${CP}`, 'Divide w_t by c_p, then add T₄.'],
      T4: [
        (v) => v.T3! - v.wt! / CP,
        `{T3} − {wt} ÷ ${CP}`,
        'Divide w_t by c_p, then take it from T₃.',
      ],
    },
  ),
  rule(
    'w_net = w_t − w_c',
    '{wnet} = {wt} − {wc}',
    ['wnet', 'wt', 'wc'],
    (v) => v.wnet! - v.wt! + v.wc!,
    {
      wnet: [
        (v) => v.wt! - v.wc!,
        '{wt} − {wc}',
        'The turbine’s work less what the compressor takes.',
      ],
      wt: [(v) => v.wnet! + v.wc!, '{wnet} + {wc}', 'Add the compressor’s work back to the net.'],
      wc: [(v) => v.wt! - v.wnet!, '{wt} − {wnet}', 'Take the net from the turbine’s work.'],
    },
  ),
  rule(
    'η = 1 − 1 ÷ r_p^((γ − 1) ÷ γ)',
    `{eta} = 1 − 1 ÷ {rp}^${EXP.toFixed(4)}`,
    ['eta', 'rp'],
    (v) => v.eta! - (1 - 1 / ratioPow(v)),
    {
      eta: [
        (v) => 1 - 1 / ratioPow(v),
        '1 − 1 ÷ {rp}^(0.4 ÷ 1.4)',
        'The ideal Brayton efficiency depends on r_p alone.',
      ],
      rp: [
        (v) => (v.eta! < 1 ? pos((1 / (1 - v.eta!)) ** (1 / EXP)) : undefined),
        '(1 ÷ (1 − {eta}))^(1.4 ÷ 0.4)',
        'Take η from 1, take the reciprocal, then raise it to γ ÷ (γ − 1).',
      ],
    },
  ),
);

function braytonExample(rp: number, T1: number, T3: number): Values {
  const T2 = T1 * rp ** EXP;
  const T4 = T3 / rp ** EXP;
  const wc = CP * (T2 - T1);
  const wt = CP * (T3 - T4);
  return { rp, T1, T3, T2, T4, wc, wt, wnet: wt - wc, eta: 1 - 1 / rp ** EXP };
}

const tsBrayton: ModuleDef = {
  id: 'g.he-propertyDiagram-ts-brayton',
  title: 'T–s diagram: the ideal Brayton cycle',
  use: 'Use this for the temperatures, works and efficiency of an ideal gas-turbine (Brayton) cycle.',
  assumptions: [
    `Air-standard cycle: constant c_p = ${CP} kJ/(kg·K), γ = ${K_AIR}.`,
    'Isentropic compressor and turbine; heat added and rejected at constant pressure.',
  ],
  variables: [
    q('rp', 'r_p', 'Pressure ratio', undefined, 1.01, 100, 0.01),
    q('T1', 'T₁', 'Compressor inlet temperature', 'K', 1, 3000, 0.1),
    q('T3', 'T₃', 'Turbine inlet temperature', 'K', 1, 3000, 0.1),
    q('T2', 'T₂', 'Compressor exit temperature', 'K', 1, 5000, 0.1),
    q('T4', 'T₄', 'Turbine exit temperature', 'K', 1, 3000, 0.1),
    q('wc', 'w_c', 'Compressor work', 'kJ/kg', 0.1, 5000, 0.1),
    q('wt', 'w_t', 'Turbine work', 'kJ/kg', 0.1, 5000, 0.1),
    q('wnet', 'w_net', 'Net work', 'kJ/kg', -5000, 5000, 0.1),
    q('eta', 'η', 'Thermal efficiency', undefined, 0, 1, 0.001),
  ],
  ...BRAYTON,
  example: braytonExample(10, 300, 1400),
  startWith: ['rp', 'T1', 'T3'],
  representation: {
    kind: 'propertyDiagram',
    plane: 'Ts',
    substance: 'gas',
    cycle: 'brayton',
    gas: { cp: CP, k: K_AIR },
    units: { T: 'K' },
    states: [
      { name: '1', T: 'T1', P: 1 },
      { name: '2', T: 'T2', P: 'rp' },
      { name: '3', T: 'T3', P: 'rp' },
      { name: '4', T: 'T4', P: 1 },
    ],
    steps: [
      { from: '1', to: '2', process: 'isentropic' },
      { from: '2', to: '3', process: 'isobaric', heat: 'in' },
      { from: '3', to: '4', process: 'isentropic' },
      { from: '4', to: '1', process: 'isobaric', heat: 'out' },
    ],
    isobars: [
      { P: 1, name: 'P₁' },
      { P: 'rp', name: 'P₂ = r_p P₁' },
    ],
    more: ['wnet', 'eta'],
  },
};

// ─── HC17: the Rankine cycle (thermodynamics#3~rankine) ──────────────────────

const RANKINE = rules(
  rule(
    'w_p = v₁(P₂ − P₁)',
    '{wp} = {v1} × ({P2} − {P1})',
    ['wp', 'v1', 'P2', 'P1'],
    (v) => v.wp! - v.v1! * (v.P2! - v.P1!),
    {
      wp: [
        (v) => v.v1! * (v.P2! - v.P1!),
        '{v1} × ({P2} − {P1})',
        'The pump pushes nearly incompressible water: its work is v times the pressure rise (m³/kg × kPa = kJ/kg).',
      ],
      v1: [
        (v) => div(v.wp!, v.P2! - v.P1!),
        '{wp} ÷ ({P2} − {P1})',
        'Divide the pump work by the pressure rise.',
      ],
      P2: [
        (v) => div(v.wp!, v.v1!)! + v.P1!,
        '{P1} + {wp} ÷ {v1}',
        'Divide w_p by v₁, then add P₁.',
      ],
      P1: [
        (v) => v.P2! - div(v.wp!, v.v1!)!,
        '{P2} − {wp} ÷ {v1}',
        'Divide w_p by v₁, then take it from P₂.',
      ],
    },
  ),
  rule(
    'q_in = h₃ − h₁ − w_p',
    '{qin} = {h3} − {h1} − {wp}',
    ['qin', 'h3', 'h1', 'wp'],
    (v) => v.qin! - (v.h3! - v.h1! - v.wp!),
    {
      qin: [
        (v) => v.h3! - v.h1! - v.wp!,
        '{h3} − {h1} − {wp}',
        'The boiler heats from h₂ = h₁ + w_p up to h₃.',
      ],
      h3: [(v) => v.qin! + v.h1! + v.wp!, '{qin} + {h1} + {wp}', 'Add q_in to h₂ = h₁ + w_p.'],
      h1: [(v) => v.h3! - v.qin! - v.wp!, '{h3} − {qin} − {wp}', 'Take q_in and w_p from h₃.'],
      wp: [(v) => v.h3! - v.h1! - v.qin!, '{h3} − {h1} − {qin}', 'Take h₁ and q_in from h₃.'],
    },
  ),
  rule(
    'w_net = (h₃ − h₄) − w_p',
    '{wnet} = ({h3} − {h4}) − {wp}',
    ['wnet', 'h3', 'h4', 'wp'],
    (v) => v.wnet! - (v.h3! - v.h4! - v.wp!),
    {
      wnet: [
        (v) => v.h3! - v.h4! - v.wp!,
        '({h3} − {h4}) − {wp}',
        'The turbine’s drop h₃ − h₄, less the pump’s work.',
      ],
      h3: [(v) => v.wnet! + v.h4! + v.wp!, '{wnet} + {h4} + {wp}', 'Add w_net, h₄ and w_p.'],
      h4: [(v) => v.h3! - v.wp! - v.wnet!, '{h3} − {wp} − {wnet}', 'Take w_p and w_net from h₃.'],
      wp: [
        (v) => v.h3! - v.h4! - v.wnet!,
        '({h3} − {h4}) − {wnet}',
        'Take w_net from the turbine’s drop.',
      ],
    },
  ),
  rule(
    'η = w_net ÷ q_in',
    '{eta} = {wnet} ÷ {qin}',
    ['eta', 'wnet', 'qin'],
    (v) => v.eta! * v.qin! - v.wnet!,
    {
      eta: [
        (v) => div(v.wnet!, v.qin!),
        '{wnet} ÷ {qin}',
        'The share of the heat in that comes out as net work.',
      ],
      wnet: [(v) => v.eta! * v.qin!, '{eta} × {qin}', 'Multiply η by q_in.'],
      qin: [(v) => div(v.wnet!, v.eta!), '{wnet} ÷ {eta}', 'Divide w_net by η.'],
    },
  ),
);

function rankineExample(
  v1: number,
  P1: number,
  P2: number,
  h1: number,
  h3: number,
  h4: number,
): Values {
  const wp = v1 * (P2 - P1);
  const qin = h3 - h1 - wp;
  const wnet = h3 - h4 - wp;
  return { v1, P1, P2, h1, h3, h4, wp, qin, wnet, eta: wnet / qin };
}

const tsRankine: ModuleDef = {
  id: 'g.he-propertyDiagram-ts-rankine',
  title: 'T–s diagram: the Rankine cycle from table enthalpies',
  use: 'Use this for the pump work, heat in, net work and efficiency of a Rankine cycle from typed enthalpies.',
  assumptions: [
    'Ideal Rankine cycle: saturated liquid leaves the condenser (1); the pump and turbine are isentropic.',
    'h₁, h₃ and h₄ are read from the steam tables; the dome is drawn from the IAPWS-IF97 saturation equations.',
    'Kinetic and potential energy changes neglected.',
  ],
  variables: [
    q('v1', 'v₁', 'Specific volume of the pumped water', 'm³/kg', 0.0009, 0.002, 0.00001),
    q('P1', 'P₁', 'Condenser pressure', 'kPa', 1, 22000, 0.1),
    q('P2', 'P₂', 'Boiler pressure', 'kPa', 1, 22000, 0.1),
    q('h1', 'h₁', 'Enthalpy leaving the condenser', 'kJ/kg', 1, 2000, 0.1),
    q('h3', 'h₃', 'Enthalpy into the turbine', 'kJ/kg', 1, 4500, 0.1),
    q('h4', 'h₄', 'Enthalpy leaving the turbine', 'kJ/kg', 1, 4000, 0.1),
    q('wp', 'w_p', 'Pump work', 'kJ/kg', 0.01, 100, 0.01),
    q('qin', 'q_in', 'Heat in', 'kJ/kg', 1, 5000, 0.1),
    q('wnet', 'w_net', 'Net work', 'kJ/kg', -5000, 5000, 0.1),
    q('eta', 'η', 'Thermal efficiency', undefined, 0, 1, 0.001),
  ],
  ...RANKINE,
  example: rankineExample(0.00101, 10, 8000, 192, 3400, 2100),
  startWith: ['v1', 'P1', 'P2', 'h1', 'h3', 'h4'],
  representation: {
    kind: 'propertyDiagram',
    plane: 'Ts',
    substance: 'water',
    cycle: 'rankine',
    states: [
      { name: '1', P: 'P1', h: 'h1' },
      { name: '2', P: 'P2', h: ['h1', 'wp'] },
      { name: '3', P: 'P2', h: 'h3' },
      { name: '4', P: 'P1', h: 'h4' },
    ],
    steps: [
      { from: '1', to: '2', process: 'isentropic' },
      { from: '2', to: '3', process: 'isobaric', heat: 'in', q: 'qin' },
      { from: '3', to: '4', process: 'isentropic' },
      { from: '4', to: '1', process: 'isobaric', heat: 'out' },
    ],
    more: ['wnet', 'eta'],
  },
};

// ─── HC17: a real gas's isotherm, virial (chemical-thermodynamics#0) ─────────

const R_MOL = 8.314;

const VIRIAL = rules(
  rule('T_r = T ÷ T_c', '{Tr} = {T} ÷ {Tc}', ['Tr', 'T', 'Tc'], (v) => v.Tr! * v.Tc! - v.T!, {
    Tr: [
      (v) => div(v.T!, v.Tc!),
      '{T} ÷ {Tc}',
      'Reduced temperature: T over the critical temperature.',
    ],
    T: [(v) => v.Tr! * v.Tc!, '{Tr} × {Tc}', 'Multiply T_r by T_c.'],
    Tc: [(v) => div(v.T!, v.Tr!), '{T} ÷ {Tr}', 'Divide T by T_r.'],
  }),
  rule('P_r = P ÷ P_c', '{Pr} = {P} ÷ {Pc}', ['Pr', 'P', 'Pc'], (v) => v.Pr! * v.Pc! - v.P!, {
    Pr: [(v) => div(v.P!, v.Pc!), '{P} ÷ {Pc}', 'Reduced pressure: P over the critical pressure.'],
    P: [(v) => v.Pr! * v.Pc!, '{Pr} × {Pc}', 'Multiply P_r by P_c.'],
    Pc: [(v) => div(v.P!, v.Pr!), '{P} ÷ {Pr}', 'Divide P by P_r.'],
  }),
  rule(
    'B⁰ = 0.083 − 0.422 ÷ T_r^1.6',
    '{B0} = 0.083 − 0.422 ÷ {Tr}^1.6',
    ['B0', 'Tr'],
    (v) => v.B0! - (0.083 - 0.422 / v.Tr! ** 1.6),
    {
      B0: [
        (v) => 0.083 - 0.422 / v.Tr! ** 1.6,
        '0.083 − 0.422 ÷ {Tr}^1.6',
        'Pitzer’s first term: raise T_r to 1.6, divide 0.422 by it, take that from 0.083.',
      ],
      Tr: [
        (v) => (v.B0! < 0.083 ? (0.422 / (0.083 - v.B0!)) ** (1 / 1.6) : undefined),
        '(0.422 ÷ (0.083 − {B0}))^(1 ÷ 1.6)',
        'Take B⁰ from 0.083, divide 0.422 by it, then take the 1.6th root.',
      ],
    },
  ),
  rule(
    'B¹ = 0.139 − 0.172 ÷ T_r^4.2',
    '{B1} = 0.139 − 0.172 ÷ {Tr}^4.2',
    ['B1', 'Tr'],
    (v) => v.B1! - (0.139 - 0.172 / v.Tr! ** 4.2),
    {
      B1: [
        (v) => 0.139 - 0.172 / v.Tr! ** 4.2,
        '0.139 − 0.172 ÷ {Tr}^4.2',
        'Pitzer’s second term: raise T_r to 4.2, divide 0.172 by it, take that from 0.139.',
      ],
      Tr: [
        (v) => (v.B1! < 0.139 ? (0.172 / (0.139 - v.B1!)) ** (1 / 4.2) : undefined),
        '(0.172 ÷ (0.139 − {B1}))^(1 ÷ 4.2)',
        'Take B¹ from 0.139, divide 0.172 by it, then take the 4.2th root.',
      ],
    },
  ),
  rule(
    'Z = 1 + (B⁰ + ωB¹)P_r ÷ T_r',
    '{Z} = 1 + ({B0} + {w} × {B1}) × {Pr} ÷ {Tr}',
    ['Z', 'B0', 'w', 'B1', 'Pr', 'Tr'],
    (v) => v.Z! - (1 + ((v.B0! + v.w! * v.B1!) * v.Pr!) / v.Tr!),
    {
      Z: [
        (v) => 1 + ((v.B0! + v.w! * v.B1!) * v.Pr!) / v.Tr!,
        '1 + ({B0} + {w} × {B1}) × {Pr} ÷ {Tr}',
        'Add ω times B¹ to B⁰, multiply by P_r ÷ T_r, then add 1.',
      ],
      Pr: [
        (v) => div((v.Z! - 1) * v.Tr!, v.B0! + v.w! * v.B1!),
        '({Z} − 1) × {Tr} ÷ ({B0} + {w} × {B1})',
        'Take 1 from Z, multiply by T_r, then divide by B⁰ + ωB¹.',
      ],
      w: [
        (v) => div(((v.Z! - 1) * v.Tr!) / v.Pr! - v.B0!, v.B1!),
        '(({Z} − 1) × {Tr} ÷ {Pr} − {B0}) ÷ {B1}',
        'Undo the outer steps to get B⁰ + ωB¹, take B⁰ off, then divide by B¹.',
      ],
    },
  ),
);

function virialExample(Tc: number, Pc: number, w: number, T: number, P: number): Values {
  const Tr = T / Tc;
  const Pr = P / Pc;
  const B0 = 0.083 - 0.422 / Tr ** 1.6;
  const B1 = 0.139 - 0.172 / Tr ** 4.2;
  return { Tc, Pc, w, T, P, Tr, Pr, B0, B1, Z: 1 + ((B0 + w * B1) * Pr) / Tr };
}

const pvVirial: ModuleDef = {
  id: 'g.he-propertyDiagram-pv-virial',
  title: 'P–v diagram: propane’s compressibility from the virial equation',
  use: 'Use this for a gas’s compressibility factor Z from its critical constants (the Pitzer virial form).',
  assumptions: [
    'Low to moderate pressure: the two-term virial form holds roughly where V_r > 2.',
    'A nonpolar gas; T_c, P_c and ω from a table (propane: 369.8 K, 42.48 bar, 0.152).',
    `R = ${R_MOL} J/(mol·K) to draw the isotherm.`,
  ],
  variables: [
    q('Tc', 'T_c', 'Critical temperature', 'K', 1, 2000, 0.1),
    q('Pc', 'P_c', 'Critical pressure', 'bar', 0.1, 1000, 0.01),
    q('w', 'ω', 'Acentric factor', undefined, -0.5, 2, 0.001),
    q('T', 'T', 'Temperature', 'K', 1, 3000, 0.1),
    q('P', 'P', 'Pressure', 'bar', 0.01, 1000, 0.01),
    q('Tr', 'T_r', 'Reduced temperature', undefined, 0.3, 10, 0.0001),
    q('Pr', 'P_r', 'Reduced pressure', undefined, 0.0001, 10, 0.0001),
    q('B0', 'B⁰', 'First virial term', undefined, -3, 0.083, 0.0001),
    q('B1', 'B¹', 'Second virial term', undefined, -50, 0.139, 0.0001),
    q('Z', 'Z', 'Compressibility factor', undefined, 0.05, 3, 0.0001),
  ],
  ...VIRIAL,
  example: virialExample(369.8, 42.48, 0.152, 400, 10),
  startWith: ['Tc', 'Pc', 'w', 'T', 'P'],
  representation: {
    kind: 'propertyDiagram',
    plane: 'Pv',
    substance: 'gas',
    units: { P: 'bar', V: 'L/mol' },
    isotherm: { model: 'virial', T: 'T', R: R_MOL, Z: 'Z', P: 'P', name: 'propane' },
  },
};

// ─── HC17: van der Waals (chemical-thermodynamics#0~van-der-waals) ───────────

const VDW = rules(
  rule(
    'a = 27R²T_c² ÷ 64P_c',
    `{a} = 27 × ${R_MOL}² × {Tc}² ÷ (64 × {Pc} × 10⁵)`,
    ['a', 'Tc', 'Pc'],
    (v) => v.a! - (27 * R_MOL ** 2 * v.Tc! ** 2) / (64 * v.Pc! * 1e5),
    {
      a: [
        (v) => (27 * R_MOL ** 2 * v.Tc! ** 2) / (64 * v.Pc! * 1e5),
        `27 × ${R_MOL}² × {Tc}² ÷ (64 × {Pc} × 10⁵)`,
        'From the critical point: square R and T_c, multiply by 27, divide by 64P_c (P_c in pascals).',
      ],
      Pc: [
        (v) => div(27 * R_MOL ** 2 * v.Tc! ** 2, 64 * v.a! * 1e5),
        `27 × ${R_MOL}² × {Tc}² ÷ (64 × {a} × 10⁵)`,
        'Swap a and P_c: 27R²T_c² ÷ 64a, then from pascals to bar.',
      ],
    },
  ),
  rule(
    'b = RT_c ÷ 8P_c',
    `{b} = ${R_MOL} × {Tc} ÷ (8 × {Pc} × 10⁵)`,
    ['b', 'Tc', 'Pc'],
    (v) => v.b! - (R_MOL * v.Tc!) / (8 * v.Pc! * 1e5),
    {
      b: [
        (v) => (R_MOL * v.Tc!) / (8 * v.Pc! * 1e5),
        `${R_MOL} × {Tc} ÷ (8 × {Pc} × 10⁵)`,
        'The molecules’ own volume: RT_c over 8P_c (P_c in pascals).',
      ],
      Tc: [
        (v) => (8 * v.b! * v.Pc! * 1e5) / R_MOL,
        `8 × {b} × {Pc} × 10⁵ ÷ ${R_MOL}`,
        'Multiply b by 8P_c (in pascals), then divide by R.',
      ],
      Pc: [
        (v) => div(R_MOL * v.Tc!, 8 * v.b! * 1e5),
        `${R_MOL} × {Tc} ÷ (8 × {b} × 10⁵)`,
        'Divide RT_c by 8b, then from pascals to bar.',
      ],
    },
  ),
  rule(
    'P = RT ÷ (V − b) − a ÷ V²',
    `{P} = (${R_MOL} × {T} ÷ ({V} × 10⁻³ − {b}) − {a} ÷ ({V} × 10⁻³)²) ÷ 10⁵`,
    ['P', 'T', 'V', 'b', 'a'],
    (v) => v.P! * 1e5 - ((R_MOL * v.T!) / (v.V! * 1e-3 - v.b!) - v.a! / (v.V! * 1e-3) ** 2),
    {
      P: [
        (v) => ((R_MOL * v.T!) / (v.V! * 1e-3 - v.b!) - v.a! / (v.V! * 1e-3) ** 2) / 1e5,
        `(${R_MOL} × {T} ÷ ({V} × 10⁻³ − {b}) − {a} ÷ ({V} × 10⁻³)²) ÷ 10⁵`,
        'V in m³/mol: the molecules’ volume b leaves less room (RT ÷ (V − b)), their pull lowers it by a ÷ V²; then pascals to bar.',
      ],
      T: [
        (v) => ((v.P! * 1e5 + v.a! / (v.V! * 1e-3) ** 2) * (v.V! * 1e-3 - v.b!)) / R_MOL,
        `({P} × 10⁵ + {a} ÷ ({V} × 10⁻³)²) × ({V} × 10⁻³ − {b}) ÷ ${R_MOL}`,
        'Add a ÷ V² to P, multiply by V − b, then divide by R.',
      ],
      a: [
        (v) => ((R_MOL * v.T!) / (v.V! * 1e-3 - v.b!) - v.P! * 1e5) * (v.V! * 1e-3) ** 2,
        `(${R_MOL} × {T} ÷ ({V} × 10⁻³ − {b}) − {P} × 10⁵) × ({V} × 10⁻³)²`,
        'Take P from the repulsive term RT ÷ (V − b), then multiply by V².',
      ],
      b: [
        (v) => {
          const V = v.V! * 1e-3;
          const room = v.P! * 1e5 + v.a! / V ** 2;
          return room > 0 ? V - (R_MOL * v.T!) / room : undefined;
        },
        `{V} × 10⁻³ − ${R_MOL} × {T} ÷ ({P} × 10⁵ + {a} ÷ ({V} × 10⁻³)²)`,
        'Add a ÷ V² to P, divide RT by it, then take that from V.',
      ],
    },
  ),
  rule(
    'Z = PV ÷ RT',
    `{Z} = {P} × 10⁵ × {V} × 10⁻³ ÷ (${R_MOL} × {T})`,
    ['Z', 'P', 'V', 'T'],
    (v) => v.Z! * R_MOL * v.T! - v.P! * 100 * v.V!,
    {
      Z: [
        (v) => div(v.P! * 100 * v.V!, R_MOL * v.T!),
        `{P} × 10⁵ × {V} × 10⁻³ ÷ (${R_MOL} × {T})`,
        'Compare PV with RT, both in SI: Z below 1 means attraction wins.',
      ],
      P: [
        (v) => div(v.Z! * R_MOL * v.T!, 100 * v.V!),
        `{Z} × ${R_MOL} × {T} ÷ ({V} × 10⁻³) ÷ 10⁵`,
        'Multiply Z by RT, divide by V, then pascals to bar.',
      ],
      V: [
        (v) => div(v.Z! * R_MOL * v.T!, 100 * v.P!),
        `{Z} × ${R_MOL} × {T} ÷ ({P} × 10⁵) × 10³`,
        'Multiply Z by RT, divide by P, then m³ to L.',
      ],
      T: [
        (v) => div(v.P! * 100 * v.V!, v.Z! * R_MOL),
        `{P} × 10⁵ × {V} × 10⁻³ ÷ ({Z} × ${R_MOL})`,
        'Divide PV by ZR.',
      ],
    },
  ),
);

function vdwExample(Tc: number, Pc: number, T: number, V: number): Values {
  const a = (27 * R_MOL ** 2 * Tc ** 2) / (64 * Pc * 1e5);
  const b = (R_MOL * Tc) / (8 * Pc * 1e5);
  const Vs = V * 1e-3;
  const P = ((R_MOL * T) / (Vs - b) - a / Vs ** 2) / 1e5;
  return { Tc, Pc, a, b, T, V, P, Z: (P * 1e5 * Vs) / (R_MOL * T) };
}

const pvVdw: ModuleDef = {
  id: 'g.he-propertyDiagram-pv-vdw',
  title: 'P–v diagram: CO₂ by van der Waals against the ideal gas',
  use: 'Use this for the pressure of a gas at a molar volume by the van der Waals equation, and its Z.',
  assumptions: [
    'The van der Waals equation, a and b from the critical point (CO₂: 304.2 K, 73.83 bar).',
    `R = ${R_MOL} J/(mol·K); a in Pa·m⁶/mol², b in m³/mol, V typed in L/mol.`,
  ],
  variables: [
    q('Tc', 'T_c', 'Critical temperature', 'K', 1, 2000, 0.1),
    q('Pc', 'P_c', 'Critical pressure', 'bar', 0.1, 1000, 0.01),
    q('a', 'a', 'Attraction constant', 'Pa·m⁶/mol²', 0.0001, 100, 0.0001),
    q('b', 'b', 'Excluded volume', 'm³/mol', 0.000001, 0.01, 0.0000001),
    q('T', 'T', 'Temperature', 'K', 1, 3000, 0.1),
    q('V', 'V', 'Molar volume', 'L/mol', 0.01, 1000, 0.001),
    q('P', 'P', 'Pressure', 'bar', -1000, 10000, 0.01),
    q('Z', 'Z', 'Compressibility factor', undefined, -5, 5, 0.001),
  ],
  ...VDW,
  example: vdwExample(304.2, 73.83, 300, 1),
  startWith: ['Tc', 'Pc', 'T', 'V'],
  representation: {
    kind: 'propertyDiagram',
    plane: 'Pv',
    substance: 'gas',
    units: { P: 'bar', V: 'L/mol' },
    isotherm: { model: 'vdw', T: 'T', R: R_MOL, a: 'a', b: 'b', V: 'V', P: 'P', name: 'CO₂' },
  },
};

export const HE2C_GALLERY_MODULES: ModuleDef[] = [
  tvMixture,
  pvHighPressure,
  tsEntropy,
  tsCompressor,
  tsCompressorPoor,
  tsBrayton,
  tsRankine,
  pvVirial,
  pvVdw,
];

export const HE2C_GALLERY_LAYOUTS: LayoutDef[] = [];
