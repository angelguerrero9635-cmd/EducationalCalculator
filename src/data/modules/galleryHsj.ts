/**
 * Grades 9–12 gallery demos (group HJ; see pictureRequestsHs.ts and docs/RENDERINGS_HS.md).
 * Each demo stands in for a planned page: real variables, relations, steps and a use line, so
 * `scripts/promote-demo.mjs` can copy it into a grade file. Spread into gallery.ts.
 */
import type { Relation, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

/** A relation and its step text, built together so a demo lists both from one place. */
interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}

/** Gathers rules into a module's `relations` and `steps`. */
const rules = (...rs: Rule[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

const div = (a: number, b: number) => (b === 0 ? undefined : a / b);

// ─── H51 gasPiston ───────────────────────────────────────────────────────────

const SUB: Record<string, string> = { '1': '₁', '2': '₂', '': '' };
const when = (k: string) => (k === '1' ? ' before' : k === '2' ? ' after' : '');

const pressure = (k: string, unit = 'atm'): VariableDef => ({
  id: `P${k}`,
  symbol: `P${SUB[k]}`,
  name: `Pressure${when(k)}`,
  unit,
  min: unit === 'kPa' ? 0.1 : 0.001,
  max: unit === 'kPa' ? 100000 : 1000,
  step: unit === 'kPa' ? 1 : 0.01,
});
const volume = (k: string): VariableDef => ({
  id: `V${k}`,
  symbol: `V${SUB[k]}`,
  name: `Volume${when(k)}`,
  unit: 'L',
  units: ['L', 'mL'],
  min: 0.001,
  max: 10000,
  step: 0.01,
});
const kelvins = (k: string): VariableDef => ({
  id: `T${k}`,
  symbol: `T${SUB[k]}`,
  name: `Temperature${when(k)} in kelvins`,
  unit: 'K',
  min: 1,
  max: 10000,
  step: 1,
});
const moles: VariableDef = {
  id: 'n',
  symbol: 'n',
  name: 'Amount of gas',
  unit: 'mol',
  min: 0.001,
  max: 100,
  step: 0.001,
};

/** Boyle’s law, P₁V₁ = P₂V₂ (temperature and amount held). */
const boyle: Rule = {
  relation: {
    id: 'P₁V₁ = P₂V₂',
    display: '{P1} × {V1} = {P2} × {V2}',
    vars: ['P1', 'V1', 'P2', 'V2'],
    residual: (v) => v.P1! * v.V1! - v.P2! * v.V2!,
    solve: {
      P1: (v) => div(v.P2! * v.V2!, v.V1!),
      V1: (v) => div(v.P2! * v.V2!, v.P1!),
      P2: (v) => div(v.P1! * v.V1!, v.V2!),
      V2: (v) => div(v.P1! * v.V1!, v.P2!),
    },
  },
  steps: {
    P2: {
      expr: '({P1} × {V1})/{V2}',
      how: 'At one temperature, pressure times volume stays the same. Divide P₁V₁ by the new volume.',
    },
    V2: {
      expr: '({P1} × {V1})/{P2}',
      how: 'Pressure times volume stays the same, so divide P₁V₁ by the new pressure.',
    },
    P1: { expr: '({P2} × {V2})/{V1}', how: 'Divide P₂V₂ by the first volume.' },
    V1: { expr: '({P2} × {V2})/{P1}', how: 'Divide P₂V₂ by the first pressure.' },
  },
};

/** Charles’s law, V₁/T₁ = V₂/T₂ (pressure and amount held). */
const charles: Rule = {
  relation: {
    id: 'V₁/T₁ = V₂/T₂',
    display: '{V1}/{T1} = {V2}/{T2}',
    vars: ['V1', 'T1', 'V2', 'T2'],
    residual: (v) => v.V1! * v.T2! - v.V2! * v.T1!,
    solve: {
      V2: (v) => div(v.V1! * v.T2!, v.T1!),
      T2: (v) => div(v.V2! * v.T1!, v.V1!),
      V1: (v) => div(v.V2! * v.T1!, v.T2!),
      T1: (v) => div(v.V1! * v.T2!, v.V2!),
    },
  },
  steps: {
    V2: {
      expr: '({V1} × {T2})/{T1}',
      how: 'At one pressure, volume grows in step with the kelvin temperature. Scale V₁ by T₂/T₁.',
    },
    T2: { expr: '({V2} × {T1})/{V1}', how: 'Scale T₁ by how much the volume grew, V₂/V₁.' },
    V1: { expr: '({V2} × {T1})/{T2}', how: 'Scale V₂ back by T₁/T₂.' },
    T1: { expr: '({V1} × {T2})/{V2}', how: 'Scale T₂ back by V₁/V₂.' },
  },
};

/** Gay-Lussac’s law, P₁/T₁ = P₂/T₂ (volume and amount held). */
const gayLussac: Rule = {
  relation: {
    id: 'P₁/T₁ = P₂/T₂',
    display: '{P1}/{T1} = {P2}/{T2}',
    vars: ['P1', 'T1', 'P2', 'T2'],
    residual: (v) => v.P1! * v.T2! - v.P2! * v.T1!,
    solve: {
      P2: (v) => div(v.P1! * v.T2!, v.T1!),
      T2: (v) => div(v.P2! * v.T1!, v.P1!),
      P1: (v) => div(v.P2! * v.T1!, v.T2!),
      T1: (v) => div(v.P1! * v.T2!, v.P2!),
    },
  },
  steps: {
    P2: {
      expr: '({P1} × {T2})/{T1}',
      how: 'In a sealed, rigid container the pressure grows in step with the kelvin temperature.',
    },
    T2: { expr: '({P2} × {T1})/{P1}', how: 'Scale T₁ by how much the pressure grew, P₂/P₁.' },
    P1: { expr: '({P2} × {T1})/{T2}', how: 'Scale P₂ back by T₁/T₂.' },
    T1: { expr: '({P1} × {T2})/{P2}', how: 'Scale T₂ back by P₁/P₂.' },
  },
};

/** The combined gas law, P₁V₁/T₁ = P₂V₂/T₂ (amount held). */
const combined: Rule = {
  relation: {
    id: 'P₁V₁/T₁ = P₂V₂/T₂',
    display: '({P1} × {V1})/{T1} = ({P2} × {V2})/{T2}',
    vars: ['P1', 'V1', 'T1', 'P2', 'V2', 'T2'],
    residual: (v) => v.P1! * v.V1! * v.T2! - v.P2! * v.V2! * v.T1!,
    solve: {
      V2: (v) => div(v.P1! * v.V1! * v.T2!, v.T1! * v.P2!),
      P2: (v) => div(v.P1! * v.V1! * v.T2!, v.T1! * v.V2!),
      T2: (v) => div(v.P2! * v.V2! * v.T1!, v.P1! * v.V1!),
      V1: (v) => div(v.P2! * v.V2! * v.T1!, v.T2! * v.P1!),
      P1: (v) => div(v.P2! * v.V2! * v.T1!, v.T2! * v.V1!),
      T1: (v) => div(v.P1! * v.V1! * v.T2!, v.P2! * v.V2!),
    },
  },
  steps: {
    V2: {
      expr: '({P1} × {V1} × {T2})/({T1} × {P2})',
      how: 'Multiply both sides by T₂ and divide by P₂.',
    },
    P2: {
      expr: '({P1} × {V1} × {T2})/({T1} × {V2})',
      how: 'Multiply both sides by T₂ and divide by V₂.',
    },
    T2: {
      expr: '({P2} × {V2} × {T1})/({P1} × {V1})',
      how: 'Cross-multiply, then divide by P₁V₁.',
    },
    V1: {
      expr: '({P2} × {V2} × {T1})/({T2} × {P1})',
      how: 'Multiply both sides by T₁ and divide by P₁.',
    },
    P1: {
      expr: '({P2} × {V2} × {T1})/({T2} × {V1})',
      how: 'Multiply both sides by T₁ and divide by V₁.',
    },
    T1: {
      expr: '({P1} × {V1} × {T2})/({P2} × {V2})',
      how: 'Cross-multiply, then divide by P₂V₂.',
    },
  },
};

/** The ideal gas law, PV = nRT with R = 0.0821 L·atm/(mol·K). */
const ideal: Rule = {
  relation: {
    id: 'PV = nRT',
    display: '{P} × {V} = {n} × 0.0821 × {T}',
    vars: ['P', 'V', 'n', 'T'],
    residual: (v) => v.P! * v.V! - v.n! * 0.0821 * v.T!,
    solve: {
      V: (v) => div(v.n! * 0.0821 * v.T!, v.P!),
      P: (v) => div(v.n! * 0.0821 * v.T!, v.V!),
      n: (v) => div(v.P! * v.V!, 0.0821 * v.T!),
      T: (v) => div(v.P! * v.V!, v.n! * 0.0821),
    },
  },
  steps: {
    V: {
      expr: '({n} × 0.0821 × {T})/{P}',
      how: 'Divide both sides by P. R is 0.0821 L·atm/(mol·K), so V comes out in liters.',
    },
    P: {
      expr: '({n} × 0.0821 × {T})/{V}',
      how: 'Divide both sides by V. With R = 0.0821, the pressure comes out in atmospheres.',
    },
    n: { expr: '({P} × {V})/(0.0821 × {T})', how: 'Divide both sides by RT.' },
    T: { expr: '({P} × {V})/({n} × 0.0821)', how: 'Divide both sides by nR.' },
  },
};

const GAS_ASSUMPTIONS = [
  'The gas is ideal: its particles take up no room and do not attract each other.',
  'Temperatures are in kelvins: K = °C + 273.',
];

const GAS: ModuleDef[] = [
  {
    id: 'g.s10-gas-laws-boyle',
    title: 'Boyle’s law: squeezing a gas',
    use: 'Use this for a gas squeezed or let out at one temperature: “6 L of gas at 1 atm is pressed to 2 atm. What is its volume?”',
    unitSystems: ['metric'],
    assumptions: [...GAS_ASSUMPTIONS, 'The temperature and the amount of gas stay the same.'],
    variables: [pressure('1'), volume('1'), pressure('2'), volume('2')],
    ...rules(boyle),
    example: { P1: 1, V1: 6, P2: 2, V2: 3 },
    startWith: ['P1', 'V1', 'P2'],
    representation: {
      kind: 'gasPiston',
      law: 'boyle',
      before: { pressure: 'P1', volume: 'V1' },
      pressure: 'P2',
      volume: 'V2',
      keep: ['P1', 'V1'],
    },
  },
  {
    id: 'g.s10-gas-laws-charles',
    title: 'Charles’s law: heating a gas',
    use: 'Use this for a gas warmed or cooled at one pressure: “2 L of gas at 300 K is heated to 450 K. What is its volume?”',
    unitSystems: ['metric'],
    assumptions: [...GAS_ASSUMPTIONS, 'The pressure and the amount of gas stay the same.'],
    variables: [volume('1'), kelvins('1'), volume('2'), kelvins('2')],
    ...rules(charles),
    example: { V1: 2, T1: 300, V2: 3, T2: 450 },
    startWith: ['V1', 'T1', 'T2'],
    representation: {
      kind: 'gasPiston',
      law: 'charles',
      before: { volume: 'V1', temperature: 'T1' },
      volume: 'V2',
      temperature: 'T2',
      keep: ['V1', 'T1'],
    },
  },
  {
    id: 'g.s10-gas-laws-gay-lussac',
    title: 'Gay-Lussac’s law: a sealed, rigid can',
    use: 'Use this for a gas heated in a rigid container: “A can at 100 kPa and 300 K is warmed to 360 K. What is the pressure?”',
    unitSystems: ['metric'],
    assumptions: [...GAS_ASSUMPTIONS, 'The volume and the amount of gas stay the same.'],
    variables: [pressure('1', 'kPa'), kelvins('1'), pressure('2', 'kPa'), kelvins('2')],
    ...rules(gayLussac),
    example: { P1: 100, T1: 300, P2: 120, T2: 360 },
    startWith: ['P1', 'T1', 'T2'],
    representation: {
      kind: 'gasPiston',
      law: 'gayLussac',
      before: { pressure: 'P1', temperature: 'T1' },
      pressure: 'P2',
      temperature: 'T2',
    },
  },
  {
    id: 'g.s10-gas-laws-combined',
    title: 'The combined gas law',
    use: 'Use this when pressure, volume and temperature all change: “4 L at 1 atm and 300 K goes to 2 atm and 450 K. What is the volume?”',
    unitSystems: ['metric'],
    assumptions: [...GAS_ASSUMPTIONS, 'The amount of gas stays the same.'],
    variables: [pressure('1'), volume('1'), kelvins('1'), pressure('2'), volume('2'), kelvins('2')],
    ...rules(combined),
    example: { P1: 1, V1: 4, T1: 300, P2: 2, V2: 3, T2: 450 },
    startWith: ['P1', 'V1', 'T1', 'P2', 'T2'],
    representation: {
      kind: 'gasPiston',
      law: 'combined',
      before: { pressure: 'P1', volume: 'V1', temperature: 'T1' },
      pressure: 'P2',
      volume: 'V2',
      temperature: 'T2',
      keep: ['P1', 'V1', 'T1', 'T2'],
    },
  },
  {
    id: 'g.s10-gas-laws-ideal',
    title: 'The ideal gas law',
    use: 'Use this for one gas’s pressure, volume, moles and temperature: “2 mol of gas at 300 K and 2 atm. What volume does it take up?”',
    unitSystems: ['metric'],
    assumptions: [
      ...GAS_ASSUMPTIONS,
      'R = 0.0821 L·atm/(mol·K): volume in liters, pressure in atm.',
    ],
    variables: [pressure(''), { ...volume(''), units: ['L'] }, moles, kelvins('')],
    ...rules(ideal),
    example: { P: 2, V: 24.63, n: 2, T: 300 },
    startWith: ['P', 'n', 'T'],
    representation: {
      kind: 'gasPiston',
      law: 'ideal',
      pressure: 'P',
      volume: 'V',
      temperature: 'T',
      moles: 'n',
      keep: ['n', 'T'],
    },
  },
  {
    id: 'g.s10-gas-laws-ideal-hot',
    title: 'The ideal gas law: a hot gas, many moles',
    use: 'Use this for a large amount of hot gas: “4 mol of gas at 800 K and 5 atm. What is its volume?”',
    unitSystems: ['metric'],
    assumptions: [
      ...GAS_ASSUMPTIONS,
      'R = 0.0821 L·atm/(mol·K): volume in liters, pressure in atm.',
    ],
    variables: [pressure(''), { ...volume(''), units: ['L'] }, moles, kelvins('')],
    ...rules(ideal),
    example: { P: 5, V: 52.544, n: 4, T: 800 },
    startWith: ['P', 'n', 'T'],
    representation: {
      kind: 'gasPiston',
      law: 'ideal',
      pressure: 'P',
      volume: 'V',
      temperature: 'T',
      moles: 'n',
      keep: ['n', 'T'],
    },
  },
];

export const HSJ_GALLERY_MODULES: ModuleDef[] = [...GAS];
export const HSJ_GALLERY_LAYOUTS: LayoutDef[] = [];
