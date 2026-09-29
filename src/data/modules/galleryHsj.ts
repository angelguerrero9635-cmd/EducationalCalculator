/**
 * Grades 9–12 gallery demos (group HJ; see pictureRequestsHs.ts and docs/RENDERINGS_HS.md).
 * Each demo stands in for a planned page: real variables, relations, steps and a use line, so
 * `scripts/promote-demo.mjs` can copy it into a grade file. Spread into gallery.ts.
 */
import { solubilityAt } from '@/components/module/reps/solubility';
import type { Relation, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';
import type { SaltName } from './typesHsj';

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

// ─── H52 beaker: solutions ───────────────────────────────────────────────────

const molarityVar = (id: string, symbol: string, name: string): VariableDef => ({
  id,
  symbol,
  name,
  unit: 'mol/L',
  min: 0.0001,
  max: 20,
  step: 0.0001,
});
const solutionVolume = (id: string, symbol: string, name: string, unit = 'L'): VariableDef => ({
  id,
  symbol,
  name,
  unit,
  units: unit === 'L' ? ['L', 'mL'] : ['mL', 'L'],
  min: unit === 'L' ? 0.001 : 1,
  max: unit === 'L' ? 20 : 20000,
  step: unit === 'L' ? 0.001 : 1,
});
const soluteMoles: VariableDef = {
  id: 'n',
  symbol: 'n',
  name: 'Moles of solute',
  unit: 'mol',
  min: 0.0001,
  max: 100,
  step: 0.0001,
};

/** Molarity, M = n ÷ V. */
const molarityRule: Rule = {
  relation: {
    id: 'M = n/V',
    display: '{M} = {n}/{V}',
    vars: ['M', 'n', 'V'],
    residual: (v) => v.M! * v.V! - v.n!,
    solve: {
      M: (v) => div(v.n!, v.V!),
      n: (v) => v.M! * v.V!,
      V: (v) => div(v.n!, v.M!),
    },
  },
  steps: {
    M: { expr: '{n}/{V}', how: 'Molarity is moles of solute per liter of solution.' },
    n: { expr: '{M} × {V}', how: 'Multiply the moles in each liter by the liters.' },
    V: { expr: '{n}/{M}', how: 'Divide the moles by the moles in each liter.' },
  },
};

/** Molarity with the volume in milliliters, M = n ÷ (V ÷ 1000). */
const molarityMl: Rule = {
  relation: {
    id: 'M = n/(V ÷ 1000)',
    display: '{M} = {n}/({V} ÷ 1000)',
    vars: ['M', 'n', 'V'],
    residual: (v) => (v.M! * v.V!) / 1000 - v.n!,
    solve: {
      M: (v) => div(1000 * v.n!, v.V!),
      n: (v) => (v.M! * v.V!) / 1000,
      V: (v) => div(1000 * v.n!, v.M!),
    },
  },
  steps: {
    M: {
      expr: '{n}/({V} ÷ 1000)',
      how: 'Change the milliliters to liters, then divide the moles by the liters.',
    },
    n: { expr: '{M} × {V}/1000', how: 'Multiply the molarity by the liters.' },
    V: { expr: '1000 × {n}/{M}', how: 'Divide the moles by the molarity, then change to mL.' },
  },
};

/** Moles from grams, n = m ÷ molar mass. */
const fromGrams: Rule = {
  relation: {
    id: 'n = m/Mₘ',
    display: '{n} = {m}/{mm}',
    vars: ['n', 'm', 'mm'],
    residual: (v) => v.n! * v.mm! - v.m!,
    solve: {
      n: (v) => div(v.m!, v.mm!),
      m: (v) => v.n! * v.mm!,
      mm: (v) => div(v.m!, v.n!),
    },
  },
  steps: {
    n: { expr: '{m}/{mm}', how: 'Divide the grams by the grams in one mole.' },
    m: { expr: '{n} × {mm}', how: 'Multiply the moles by the grams in one mole.' },
    mm: { expr: '{m}/{n}', how: 'Divide the grams by the moles.' },
  },
};

/** Dilution, M₁V₁ = M₂V₂. */
const dilution: Rule = {
  relation: {
    id: 'M₁V₁ = M₂V₂',
    display: '{M1} × {V1} = {M2} × {V2}',
    vars: ['M1', 'V1', 'M2', 'V2'],
    residual: (v) => v.M1! * v.V1! - v.M2! * v.V2!,
    solve: {
      M2: (v) => div(v.M1! * v.V1!, v.V2!),
      V2: (v) => div(v.M1! * v.V1!, v.M2!),
      M1: (v) => div(v.M2! * v.V2!, v.V1!),
      V1: (v) => div(v.M2! * v.V2!, v.M1!),
    },
  },
  steps: {
    M2: {
      expr: '({M1} × {V1})/{V2}',
      how: 'Adding water keeps the moles of solute, M₁V₁. Spread them over the new volume.',
    },
    V2: {
      expr: '({M1} × {V1})/{M2}',
      how: 'The moles of solute, M₁V₁, stay the same. Divide them by the new molarity.',
    },
    M1: { expr: '({M2} × {V2})/{V1}', how: 'Divide the moles, M₂V₂, by the stock’s volume.' },
    V1: {
      expr: '({M2} × {V2})/{M1}',
      how: 'Divide the moles needed, M₂V₂, by the stock’s molarity.',
    },
  },
};

/** The water added in a dilution, w = V₂ − V₁. */
const waterAdded: Rule = {
  relation: {
    id: 'w = V₂ − V₁',
    display: '{w} = {V2} − {V1}',
    vars: ['w', 'V2', 'V1'],
    residual: (v) => v.w! - (v.V2! - v.V1!),
    solve: { w: (v) => v.V2! - v.V1!, V2: (v) => v.w! + v.V1!, V1: (v) => v.V2! - v.w! },
  },
  steps: {
    w: { expr: '{V2} − {V1}', how: 'The water makes up the difference between the volumes.' },
    V2: { expr: '{w} + {V1}', how: 'Add the water to the stock’s volume.' },
    V1: { expr: '{V2} − {w}', how: 'Take the water away from the final volume.' },
  },
};

const temperatureC: VariableDef = {
  id: 'T',
  symbol: 'T',
  name: 'Water temperature',
  unit: '°C',
  min: 0,
  max: 100,
  step: 1,
};
const grams = (id: string, symbol: string, name: string, derived = false): VariableDef => ({
  id,
  symbol,
  name,
  unit: 'g',
  units: ['g'],
  min: 0,
  max: 400,
  step: 0.1,
  ...(derived ? { derived: true } : {}),
});

/** The solubility read off a salt's curve (forward only: one reading, one temperature). */
const solubilityRule = (salt: SaltName, name: string): Rule => ({
  relation: {
    id: `S = solubility of ${name} at T`,
    display: `{s} = solubility of ${name} at {T} °C`,
    vars: ['s', 'T'],
    residual: (v) => v.s! - solubilityAt(salt, v.T!),
    solve: { s: (v) => solubilityAt(salt, v.T!), T: () => undefined },
  },
  steps: {
    s: {
      expr: `solubility of ${name} at {T} °C`,
      how: 'Go up from the temperature to the curve, then across to the grams.',
    },
  },
});

/** Unsaturated: the grams that can still dissolve, x = S − m. */
const roomLeft: Rule = {
  relation: {
    id: 'x = S − m',
    display: '{x} = {s} − {m}',
    vars: ['x', 's', 'm'],
    residual: (v) => v.x! - (v.s! - v.m!),
    solve: { x: (v) => v.s! - v.m!, m: (v) => v.s! - v.x!, s: (v) => v.x! + v.m! },
  },
  steps: {
    x: { expr: '{s} − {m}', how: 'Take what is dissolved from what can dissolve.' },
    m: { expr: '{s} − {x}', how: 'Take the room left from what can dissolve.' },
    s: { expr: '{x} + {m}', how: 'Add what is dissolved and the room left.' },
  },
};

/** Past saturation: the grams that settle out, e = m − S. */
const settles: Rule = {
  relation: {
    id: 'e = m − S',
    display: '{e} = {m} − {s}',
    vars: ['e', 'm', 's'],
    residual: (v) => v.e! - (v.m! - v.s!),
    solve: { e: (v) => v.m! - v.s!, m: (v) => v.e! + v.s!, s: (v) => v.m! - v.e! },
  },
  steps: {
    e: { expr: '{m} − {s}', how: 'Past what can dissolve, the rest settles to the bottom.' },
    m: { expr: '{e} + {s}', how: 'Add what settled to what dissolved.' },
    s: { expr: '{m} − {e}', how: 'Take what settled from the grams put in.' },
  },
};

const SOLUTION_ASSUMPTIONS = [
  'Molarity (M) is moles of solute per liter of solution: 1 M = 1 mol/L.',
  'The volume is the whole solution’s, solute and water together.',
];

const SOLUTIONS: ModuleDef[] = [
  {
    id: 'g.s10-molarity-moles-volume',
    title: 'Molarity from moles and volume',
    use: 'Use this for “0.25 mol of NaCl is dissolved to make 0.5 L of solution. What is its molarity?”',
    unitSystems: ['metric'],
    assumptions: SOLUTION_ASSUMPTIONS,
    variables: [
      molarityVar('M', 'M', 'Molarity'),
      soluteMoles,
      solutionVolume('V', 'V', 'Volume of solution'),
    ],
    ...rules(molarityRule),
    example: { M: 0.5, n: 0.25, V: 0.5 },
    startWith: ['n', 'V'],
    representation: {
      kind: 'beaker',
      solution: { mode: 'molarity', moles: 'n', volume: 'V', molarity: 'M', solute: 'NaCl' },
    },
  },
  {
    id: 'g.s10-molarity-from-grams',
    title: 'Molarity from grams of solute',
    use: 'Use this for “29.22 g of NaCl (58.44 g/mol) makes 250 mL of solution. What is the molarity?”',
    unitSystems: ['metric'],
    assumptions: [
      ...SOLUTION_ASSUMPTIONS,
      'Molar mass is the grams in one mole: NaCl is 58.44 g/mol.',
    ],
    variables: [
      molarityVar('M', 'M', 'Molarity'),
      soluteMoles,
      { ...solutionVolume('V', 'V', 'Volume of solution', 'mL'), units: ['mL'] },
      { ...grams('m', 'm', 'Mass of solute'), min: 0.001, max: 5000, step: 0.01 },
      {
        id: 'mm',
        symbol: 'Mₘ',
        name: 'Molar mass of the solute',
        unit: 'g/mol',
        min: 1,
        max: 1000,
        step: 0.01,
      },
    ],
    ...rules(molarityMl, fromGrams),
    example: { M: 2, n: 0.5, V: 250, m: 29.22, mm: 58.44 },
    startWith: ['m', 'mm', 'V'],
    pictureLabels: ['m', 'mm'],
    representation: {
      kind: 'beaker',
      solution: { mode: 'molarity', moles: 'n', volume: 'V', molarity: 'M', solute: 'NaCl' },
    },
  },
  {
    id: 'g.s10-molarity-concentrated',
    title: 'A concentrated acid',
    use: 'Use this for a strong stock solution: “How many moles of HCl are in 0.1 L of 12 M acid?”',
    unitSystems: ['metric'],
    assumptions: SOLUTION_ASSUMPTIONS,
    variables: [
      molarityVar('M', 'M', 'Molarity'),
      soluteMoles,
      solutionVolume('V', 'V', 'Volume of solution'),
    ],
    ...rules(molarityRule),
    example: { M: 12, n: 1.2, V: 0.1 },
    startWith: ['M', 'V'],
    representation: {
      kind: 'beaker',
      solution: { mode: 'molarity', moles: 'n', volume: 'V', molarity: 'M', solute: 'HCl' },
    },
  },
  {
    id: 'g.s10-molarity-dilution',
    title: 'Diluting a stock solution',
    use: 'Use this for “50 mL of 2 M CuSO₄ is diluted to 500 mL. What is the new molarity?”',
    unitSystems: ['metric'],
    assumptions: [
      ...SOLUTION_ASSUMPTIONS,
      'Water adds volume but no solute: the moles, M × V, stay the same.',
    ],
    variables: [
      molarityVar('M1', 'M₁', 'Stock molarity'),
      solutionVolume('V1', 'V₁', 'Stock volume', 'mL'),
      molarityVar('M2', 'M₂', 'Diluted molarity'),
      solutionVolume('V2', 'V₂', 'Diluted volume', 'mL'),
      { ...solutionVolume('w', 'w', 'Water added', 'mL'), min: 0, derived: true },
    ],
    ...rules(dilution, waterAdded),
    example: { M1: 2, V1: 50, M2: 0.2, V2: 500, w: 450 },
    startWith: ['M1', 'V1', 'V2'],
    representation: {
      kind: 'beaker',
      solution: {
        mode: 'dilution',
        stock: { molarity: 'M1', volume: 'V1' },
        diluted: { molarity: 'M2', volume: 'V2' },
        water: 'w',
        solute: 'CuSO₄',
      },
    },
  },
  {
    id: 'g.s10-molarity-solubility',
    title: 'Reading a solubility curve',
    use: 'Use this for “40 g of KNO₃ is stirred into 100 g of water at 40 °C. Is it saturated?”',
    unitSystems: ['metric'],
    assumptions: [
      'The curve gives the most salt that dissolves in 100 g of water at each temperature.',
      'Below the curve the solution is unsaturated; on it, saturated.',
    ],
    variables: [
      temperatureC,
      grams('s', 'S', 'Most that dissolves in 100 g of water', true),
      grams('m', 'm', 'Salt stirred into 100 g of water'),
      grams('x', 'x', 'More that can dissolve'),
    ],
    ...rules(solubilityRule('KNO3', 'KNO₃'), roomLeft),
    example: { T: 40, s: 63.9, m: 40, x: 23.9 },
    startWith: ['T', 'm'],
    pictureLabels: ['x'],
    representation: {
      kind: 'beaker',
      solution: {
        mode: 'solubility',
        salt: 'KNO3',
        temperature: 'T',
        amount: 'm',
        solubility: 's',
        others: ['NaNO3', 'NH4Cl', 'KCl', 'NaCl', 'KClO3'],
      },
    },
  },
  {
    id: 'g.s10-molarity-solubility-excess',
    title: 'More salt than dissolves',
    use: 'Use this for “50 g of NaCl is stirred into 100 g of water at 20 °C. How much settles out?”',
    unitSystems: ['metric'],
    assumptions: [
      'The curve gives the most salt that dissolves in 100 g of water at each temperature.',
      'Past the curve, the extra salt stays solid at the bottom.',
    ],
    variables: [
      temperatureC,
      grams('s', 'S', 'Most that dissolves in 100 g of water', true),
      grams('m', 'm', 'Salt stirred into 100 g of water'),
      grams('e', 'e', 'Salt that settles out'),
    ],
    ...rules(solubilityRule('NaCl', 'NaCl'), settles),
    example: { T: 20, s: 36, m: 50, e: 14 },
    startWith: ['T', 'm'],
    pictureLabels: ['e'],
    representation: {
      kind: 'beaker',
      solution: {
        mode: 'solubility',
        salt: 'NaCl',
        temperature: 'T',
        amount: 'm',
        solubility: 's',
        others: ['KNO3', 'KCl'],
      },
    },
  },
];

export const HSJ_GALLERY_MODULES: ModuleDef[] = [...GAS, ...SOLUTIONS];
export const HSJ_GALLERY_LAYOUTS: LayoutDef[] = [];
