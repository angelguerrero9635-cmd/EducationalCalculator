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

// ─── H53 energyProfile ───────────────────────────────────────────────────────

const kJ = (id: string, symbol: string, name: string, min = -10000): VariableDef => ({
  id,
  symbol,
  name,
  unit: 'kJ',
  min,
  max: 10000,
  step: 1,
});

/** ΔH = products − reactants. */
const enthalpy: Rule = {
  relation: {
    id: 'ΔH = Hₚ − Hᵣ',
    display: '{dH} = {Hp} − {Hr}',
    vars: ['dH', 'Hp', 'Hr'],
    residual: (v) => v.dH! - (v.Hp! - v.Hr!),
    solve: { dH: (v) => v.Hp! - v.Hr!, Hp: (v) => v.dH! + v.Hr!, Hr: (v) => v.Hp! - v.dH! },
  },
  steps: {
    dH: {
      expr: '{Hp} − {Hr}',
      how: 'ΔH is where the reaction ends minus where it starts: negative when energy is given off.',
    },
    Hp: { expr: '{Hr} + {dH}', how: 'Start at the reactants and add ΔH.' },
    Hr: { expr: '{Hp} − {dH}', how: 'Take ΔH back off the products.' },
  },
};

/** The peak, reactants + Eₐ. */
const peakRule: Rule = {
  relation: {
    id: 'peak = Hᵣ + Eₐ',
    display: '{Ep} = {Hr} + {Ea}',
    vars: ['Ep', 'Hr', 'Ea'],
    residual: (v) => v.Ep! - (v.Hr! + v.Ea!),
    solve: { Ep: (v) => v.Hr! + v.Ea!, Ea: (v) => v.Ep! - v.Hr!, Hr: (v) => v.Ep! - v.Ea! },
  },
  steps: {
    Ep: { expr: '{Hr} + {Ea}', how: 'The reactants must climb Eₐ to reach the top of the hump.' },
    Ea: { expr: '{Ep} − {Hr}', how: 'The climb from the reactants to the top of the hump.' },
    Hr: { expr: '{Ep} − {Ea}', how: 'Come down Eₐ from the top of the hump.' },
  },
};

/** The reverse reaction's barrier, Eₐ − ΔH. */
const reverseRule: Rule = {
  relation: {
    id: 'Eₐ reverse = Eₐ − ΔH',
    display: '{Er} = {Ea} − {dH}',
    vars: ['Er', 'Ea', 'dH'],
    residual: (v) => v.Er! - (v.Ea! - v.dH!),
    solve: { Er: (v) => v.Ea! - v.dH!, Ea: (v) => v.Er! + v.dH!, dH: (v) => v.Ea! - v.Er! },
  },
  steps: {
    Er: {
      expr: '{Ea} − {dH}',
      how: 'Going back, the climb starts at the products: the forward climb minus ΔH.',
    },
    Ea: { expr: '{Er} + {dH}', how: 'Add ΔH to the reverse climb.' },
    dH: { expr: '{Ea} − {Er}', how: 'The difference between the two climbs.' },
  },
};

/** How much a catalyst lowers the barrier. */
const loweredRule: Rule = {
  relation: {
    id: 'lowered = Eₐ − Eₐ with catalyst',
    display: '{d} = {Ea} − {Ec}',
    vars: ['d', 'Ea', 'Ec'],
    residual: (v) => v.d! - (v.Ea! - v.Ec!),
    solve: { d: (v) => v.Ea! - v.Ec!, Ec: (v) => v.Ea! - v.d!, Ea: (v) => v.Ec! + v.d! },
  },
  steps: {
    d: { expr: '{Ea} − {Ec}', how: 'The catalyst’s path is lower by the difference.' },
    Ec: { expr: '{Ea} − {d}', how: 'Take what the catalyst saves off the barrier.' },
    Ea: { expr: '{Ec} + {d}', how: 'Add back what the catalyst saves.' },
  },
};

const PROFILE_ASSUMPTIONS = [
  'Energies are per mole of reaction as written, in kilojoules.',
  'Eₐ is the climb from the reactants to the top of the hump.',
];

/** q = mcΔT, and ΔT = T₂ − T₁. */
const heatRule: Rule = {
  relation: {
    id: 'q = mcΔT',
    display: '{q} = {m} × {c} × {dT}',
    vars: ['q', 'm', 'c', 'dT'],
    residual: (v) => v.q! - v.m! * v.c! * v.dT!,
    solve: {
      q: (v) => v.m! * v.c! * v.dT!,
      m: (v) => div(v.q!, v.c! * v.dT!),
      c: (v) => div(v.q!, v.m! * v.dT!),
      dT: (v) => div(v.q!, v.m! * v.c!),
    },
  },
  steps: {
    q: {
      expr: '{m} × {c} × {dT}',
      how: 'Heat is mass times specific heat times the change in temperature.',
    },
    m: { expr: '{q}/({c} × {dT})', how: 'Divide the heat by cΔT.' },
    c: { expr: '{q}/({m} × {dT})', how: 'Divide the heat by mΔT.' },
    dT: { expr: '{q}/({m} × {c})', how: 'Divide the heat by mc.' },
  },
};
const changeRule: Rule = {
  relation: {
    id: 'ΔT = T₂ − T₁',
    display: '{dT} = {T2} − {T1}',
    vars: ['dT', 'T2', 'T1'],
    residual: (v) => v.dT! - (v.T2! - v.T1!),
    solve: { dT: (v) => v.T2! - v.T1!, T2: (v) => v.T1! + v.dT!, T1: (v) => v.T2! - v.dT! },
  },
  steps: {
    dT: { expr: '{T2} − {T1}', how: 'The change is the final temperature minus the first.' },
    T2: { expr: '{T1} + {dT}', how: 'Add the change to the first temperature.' },
    T1: { expr: '{T2} − {dT}', how: 'Take the change off the final temperature.' },
  },
};
const metalRule: Rule = {
  relation: {
    id: 'c metal = q/(m metal × (T metal − T₂))',
    display: '{cm} = {q}/({mm} × ({Tm} − {T2}))',
    vars: ['cm', 'q', 'mm', 'Tm', 'T2'],
    residual: (v) => v.cm! * v.mm! * (v.Tm! - v.T2!) - v.q!,
    solve: {
      cm: (v) => div(v.q!, v.mm! * (v.Tm! - v.T2!)),
      q: (v) => v.cm! * v.mm! * (v.Tm! - v.T2!),
      mm: (v) => div(v.q!, v.cm! * (v.Tm! - v.T2!)),
      Tm: (v) => (v.cm! * v.mm! === 0 ? undefined : v.T2! + v.q! / (v.cm! * v.mm!)),
      T2: () => undefined,
    },
  },
  steps: {
    cm: {
      expr: '{q}/({mm} × ({Tm} − {T2}))',
      how: 'The heat the water took in is the heat the metal gave off as it cooled to T₂.',
    },
    q: { expr: '{cm} × {mm} × ({Tm} − {T2})', how: 'The heat the metal gave off as it cooled.' },
    mm: { expr: '{q}/({cm} × ({Tm} − {T2}))', how: 'Divide the heat by the metal’s cΔT.' },
    Tm: { expr: '{T2} + {q}/({cm} × {mm})', how: 'Add the metal’s drop to the final temperature.' },
  },
};

const celsius = (id: string, symbol: string, name: string): VariableDef => ({
  id,
  symbol,
  name,
  unit: '°C',
  min: -50,
  max: 150,
  step: 0.1,
});
const waterMass: VariableDef = {
  id: 'm',
  symbol: 'm',
  name: 'Mass of water',
  unit: 'g',
  units: ['g'],
  min: 1,
  max: 5000,
  step: 0.1,
};
const specificHeat = (id: string, name: string): VariableDef => ({
  id,
  symbol: id === 'c' ? 'c' : 'cₘ',
  name,
  unit: 'J/(g·°C)',
  min: 0.01,
  max: 20,
  step: 0.01,
});
const heatVar: VariableDef = {
  id: 'q',
  symbol: 'q',
  name: 'Heat the water takes in',
  unit: 'J',
  min: -1000000,
  max: 1000000,
  step: 0.1,
};
const changeVar: VariableDef = {
  id: 'dT',
  symbol: 'ΔT',
  name: 'Change in temperature',
  unit: '°C',
  min: -100,
  max: 100,
  step: 0.1,
};
const CALORIMETER_ASSUMPTIONS = [
  'The foam cups keep heat from getting in or out, so the water takes in all of it.',
  'Water’s specific heat is 4.18 J/(g·°C).',
];

const ENERGY: ModuleDef[] = [
  {
    id: 'g.s10-thermochemistry-exothermic',
    title: 'An exothermic reaction’s energy',
    use: 'Use this for a reaction that gives off heat: “Reactants at 120 kJ, products at 30 kJ, Eₐ = 60 kJ. What is ΔH?”',
    unitSystems: ['metric'],
    assumptions: PROFILE_ASSUMPTIONS,
    variables: [
      kJ('Hr', 'Hᵣ', 'Energy of the reactants'),
      kJ('Hp', 'Hₚ', 'Energy of the products'),
      kJ('dH', 'ΔH', 'Enthalpy change'),
      kJ('Ea', 'Eₐ', 'Activation energy', 0),
      kJ('Ep', 'Eₚₑₐₖ', 'Energy at the top of the hump'),
    ],
    ...rules(enthalpy, peakRule),
    example: { Hr: 120, Hp: 30, dH: -90, Ea: 60, Ep: 180 },
    startWith: ['Hr', 'Hp', 'Ea'],
    pictureLabels: ['Ep'],
    representation: {
      kind: 'energyProfile',
      reactants: 'Hr',
      products: 'Hp',
      activation: 'Ea',
      deltaH: 'dH',
      keep: ['Hr', 'Hp'],
    },
  },
  {
    id: 'g.s10-thermochemistry-endothermic',
    title: 'An endothermic reaction’s energy',
    use: 'Use this for a reaction that takes in heat, and the barrier back: “Reactants at 40 kJ, products at 100 kJ, Eₐ = 110 kJ.”',
    unitSystems: ['metric'],
    assumptions: PROFILE_ASSUMPTIONS,
    variables: [
      kJ('Hr', 'Hᵣ', 'Energy of the reactants'),
      kJ('Hp', 'Hₚ', 'Energy of the products'),
      kJ('dH', 'ΔH', 'Enthalpy change'),
      kJ('Ea', 'Eₐ', 'Activation energy', 0),
      kJ('Er', 'Eₐ′', 'Activation energy of the reverse reaction', 0),
    ],
    ...rules(enthalpy, reverseRule),
    example: { Hr: 40, Hp: 100, dH: 60, Ea: 110, Er: 50 },
    startWith: ['Hr', 'Hp', 'Ea'],
    representation: {
      kind: 'energyProfile',
      reactants: 'Hr',
      products: 'Hp',
      activation: 'Ea',
      deltaH: 'dH',
      reverse: 'Er',
      keep: ['Hr', 'Hp'],
    },
  },
  {
    id: 'g.s10-rates-equilibrium-catalyst',
    title: 'What a catalyst changes',
    use: 'Use this for a catalyst’s lower path: “2H₂O₂ → 2H₂O + O₂ has Eₐ = 75 kJ, 56 kJ with a catalyst. By how much is it lowered?”',
    unitSystems: ['metric'],
    assumptions: [
      ...PROFILE_ASSUMPTIONS,
      'A catalyst gives the reaction a lower path; it is not used up.',
    ],
    variables: [
      kJ('Hr', 'Hᵣ', 'Energy of the reactants'),
      kJ('Hp', 'Hₚ', 'Energy of the products'),
      kJ('dH', 'ΔH', 'Enthalpy change'),
      kJ('Ea', 'Eₐ', 'Activation energy', 0),
      kJ('Ec', 'Eₐ,cat', 'Activation energy with the catalyst', 0),
      kJ('d', 'd', 'How much the catalyst lowers it', 0),
      kJ('Ep', 'Eₚₑₐₖ', 'Energy at the top of the hump'),
    ],
    ...rules(enthalpy, loweredRule, peakRule),
    example: { Hr: 200, Hp: 4, dH: -196, Ea: 75, Ec: 56, d: 19, Ep: 275 },
    startWith: ['Hr', 'Hp', 'Ea', 'Ec'],
    representation: {
      kind: 'energyProfile',
      reactants: 'Hr',
      products: 'Hp',
      activation: 'Ea',
      deltaH: 'dH',
      catalyst: 'Ec',
      names: { reactants: '2H₂O₂', products: '2H₂O + O₂' },
      keep: ['Hr', 'Hp', 'Ec'],
    },
    pictureLabels: ['d', 'Ep'],
  },
  {
    id: 'g.s10-rates-equilibrium-reverse',
    title: 'A small barrier back',
    use: 'Use this when the products sit just under the peak: “ΔH = +70 kJ and Eₐ = 75 kJ. What is the reverse Eₐ?”',
    unitSystems: ['metric'],
    assumptions: PROFILE_ASSUMPTIONS,
    variables: [
      kJ('Hr', 'Hᵣ', 'Energy of the reactants'),
      kJ('Hp', 'Hₚ', 'Energy of the products'),
      kJ('dH', 'ΔH', 'Enthalpy change'),
      kJ('Ea', 'Eₐ', 'Activation energy', 0),
      kJ('Er', 'Eₐ′', 'Activation energy of the reverse reaction', 0),
    ],
    ...rules(enthalpy, reverseRule),
    example: { Hr: 20, Hp: 90, dH: 70, Ea: 75, Er: 5 },
    startWith: ['Hr', 'Hp', 'Ea'],
    representation: {
      kind: 'energyProfile',
      reactants: 'Hr',
      products: 'Hp',
      activation: 'Ea',
      deltaH: 'dH',
      reverse: 'Er',
      keep: ['Hr', 'Hp'],
    },
  },
  {
    id: 'g.s10-thermochemistry-calorimeter',
    title: 'A coffee-cup calorimeter',
    use: 'Use this for “A reaction in 100 g of water warms it from 22 °C to 30.5 °C. How much heat did it give off?”',
    unitSystems: ['metric'],
    assumptions: CALORIMETER_ASSUMPTIONS,
    variables: [
      waterMass,
      specificHeat('c', 'Specific heat of water'),
      celsius('T1', 'T₁', 'Starting temperature'),
      celsius('T2', 'T₂', 'Final temperature'),
      changeVar,
      heatVar,
    ],
    ...rules(changeRule, heatRule),
    example: { m: 100, c: 4.18, T1: 22, T2: 30.5, dT: 8.5, q: 3553 },
    startWith: ['m', 'c', 'T1', 'T2'],
    representation: {
      kind: 'energyProfile',
      mode: 'calorimeter',
      mass: 'm',
      heat: 'c',
      start: 'T1',
      end: 'T2',
      change: 'dT',
      q: 'q',
    },
  },
  {
    id: 'g.s10-thermochemistry-cold-pack',
    title: 'A calorimeter that cools',
    use: 'Use this for a salt that cools the water as it dissolves: “50 g of water drops from 25 °C to 18.4 °C.”',
    unitSystems: ['metric'],
    assumptions: CALORIMETER_ASSUMPTIONS,
    variables: [
      waterMass,
      specificHeat('c', 'Specific heat of water'),
      celsius('T1', 'T₁', 'Starting temperature'),
      celsius('T2', 'T₂', 'Final temperature'),
      changeVar,
      heatVar,
    ],
    ...rules(changeRule, heatRule),
    example: { m: 50, c: 4.18, T1: 25, T2: 18.4, dT: -6.6, q: -1379.4 },
    startWith: ['m', 'c', 'T1', 'T2'],
    representation: {
      kind: 'energyProfile',
      mode: 'calorimeter',
      mass: 'm',
      heat: 'c',
      start: 'T1',
      end: 'T2',
      change: 'dT',
      q: 'q',
    },
  },
  {
    id: 'g.s11-thermodynamics-specific-heat',
    title: 'A metal’s specific heat',
    use: 'Use this for “50 g of metal at 100 °C goes into 100 g of water at 20 °C, which ends at 24 °C. What is the metal’s c?”',
    unitSystems: ['metric'],
    assumptions: [
      ...CALORIMETER_ASSUMPTIONS,
      'The metal and the water end at the same temperature, T₂.',
    ],
    variables: [
      waterMass,
      specificHeat('c', 'Specific heat of water'),
      celsius('T1', 'T₁', 'Water’s starting temperature'),
      celsius('T2', 'T₂', 'Final temperature'),
      { ...changeVar, min: 0 },
      { ...heatVar, min: 0 },
      { ...waterMass, id: 'mm', symbol: 'mₘ', name: 'Mass of the metal' },
      celsius('Tm', 'Tₘ', 'Metal’s starting temperature'),
      specificHeat('cm', 'Specific heat of the metal'),
    ],
    ...rules(changeRule, heatRule, metalRule),
    example: { m: 100, c: 4.18, T1: 20, T2: 24, dT: 4, q: 1672, mm: 50, Tm: 100, cm: 0.44 },
    startWith: ['m', 'c', 'T1', 'T2', 'mm', 'Tm'],
    representation: {
      kind: 'energyProfile',
      mode: 'calorimeter',
      mass: 'm',
      heat: 'c',
      start: 'T1',
      end: 'T2',
      change: 'dT',
      q: 'q',
      metal: { name: 'metal', mass: 'mm', start: 'Tm', heat: 'cm' },
    },
  },
];

// ─── H54 equilibriumChart ────────────────────────────────────────────────────

const conc = (id: string, symbol: string, name: string, derived = false): VariableDef => ({
  id,
  symbol,
  name,
  unit: 'mol/L',
  min: 0.0001,
  max: 100,
  step: 0.0001,
  ...(derived ? { derived: true } : {}),
});
const constant = (id: string, symbol: string, name: string): VariableDef => ({
  id,
  symbol,
  name,
  min: 0.000001,
  max: 1000000,
  step: 0.0001,
});

/** An ICE table for N₂O₄ ⇌ 2NO₂: x = [NO₂] ÷ 2, [N₂O₄] = start − x, K = [NO₂]² ÷ [N₂O₄]. */
const iceRules = (): Rule[] => [
  {
    relation: {
      id: 'x = [NO₂]/2',
      display: '{x} = {B}/2',
      vars: ['x', 'B'],
      residual: (v) => v.x! - v.B! / 2,
      solve: { x: (v) => v.B! / 2, B: (v) => 2 * v.x! },
    },
    steps: {
      x: { expr: '{B}/2', how: 'Each N₂O₄ that reacts makes two NO₂, so x is half the NO₂.' },
      B: { expr: '2 × {x}', how: 'Two NO₂ form for each N₂O₄ that reacts.' },
    },
  },
  {
    relation: {
      id: '[N₂O₄] = start − x',
      display: '{A} = {A0} − {x}',
      vars: ['A', 'A0', 'x'],
      residual: (v) => v.A! - (v.A0! - v.x!),
      solve: { A: (v) => v.A0! - v.x!, A0: (v) => v.A! + v.x!, x: (v) => v.A0! - v.A! },
    },
    steps: {
      A: { expr: '{A0} − {x}', how: 'The N₂O₄ left is what there was, less what reacted.' },
      A0: { expr: '{A} + {x}', how: 'Add back what reacted.' },
      x: { expr: '{A0} − {A}', how: 'What reacted is the drop in N₂O₄.' },
    },
  },
  {
    relation: {
      id: 'K = [NO₂]²/[N₂O₄]',
      display: '{K} = {B}^2/{A}',
      vars: ['K', 'B', 'A'],
      residual: (v) => v.K! * v.A! - v.B! ** 2,
      solve: {
        K: (v) => div(v.B! ** 2, v.A!),
        B: (v) => Math.sqrt(Math.max(0, v.K! * v.A!)),
        A: (v) => div(v.B! ** 2, v.K!),
      },
    },
    steps: {
      K: {
        expr: '{B}^2/{A}',
        how: 'Products over reactants at equilibrium, each to the power of its coefficient.',
      },
      B: { expr: '√({K} × {A})', how: 'Multiply K by [N₂O₄], then take the square root.' },
      A: { expr: '{B}^2/{K}', how: 'Divide [NO₂]² by K.' },
    },
  },
];

const EQ_ASSUMPTIONS = [
  'The reaction runs in a closed container at one temperature, so K stays the same.',
  'Concentrations are in mol/L; K has no unit here.',
];

const iceDemo = (
  id: string,
  title: string,
  use: string,
  example: Record<string, number>,
): ModuleDef => ({
  id,
  title,
  use,
  unitSystems: ['metric'],
  assumptions: [...EQ_ASSUMPTIONS, 'The flask starts with N₂O₄ only.'],
  variables: [
    conc('A0', '[N₂O₄]₀', 'N₂O₄ at the start'),
    conc('B', '[NO₂]', 'NO₂ at equilibrium'),
    conc('x', 'x', 'N₂O₄ that reacted'),
    conc('A', '[N₂O₄]', 'N₂O₄ at equilibrium'),
    constant('K', 'K', 'Equilibrium constant'),
  ],
  ...rules(...iceRules()),
  example,
  startWith: ['A0', 'B'],
  pictureLabels: ['x'],
  representation: {
    kind: 'equilibriumChart',
    species: [
      { formula: 'N₂O₄', coef: 1, side: 'reactant', start: 'A0', eq: 'A' },
      { formula: 'NO₂', coef: 2, side: 'product', start: 0, eq: 'B' },
    ],
    K: 'K',
  },
});

const EQUILIBRIUM: ModuleDef[] = [
  iceDemo(
    'g.s10-rates-equilibrium-ice',
    'Reaching equilibrium: K from an ICE table',
    'Use this for “0.1 M N₂O₄ comes to equilibrium with 0.04 M NO₂. What is K?”',
    { A0: 0.1, B: 0.04, x: 0.02, A: 0.08, K: 0.02 },
  ),
  iceDemo(
    'g.s10-rates-equilibrium-nearly-complete',
    'A reaction that nearly finishes',
    'Use this for a large K: “0.1 M N₂O₄ leaves 0.19 M NO₂ at equilibrium. What is K?”',
    { A0: 0.1, B: 0.19, x: 0.095, A: 0.005, K: 7.22 },
  ),
  {
    id: 'g.s10-rates-equilibrium-add',
    title: 'Le Châtelier: adding a reactant',
    use: 'Use this for “H₂ is added to H₂ + I₂ ⇌ 2HI at equilibrium. Which way does it shift?”',
    unitSystems: ['metric'],
    assumptions: [...EQ_ASSUMPTIONS, 'The H₂ is added all at once; nothing else changes.'],
    variables: [
      conc('h', '[H₂]', 'H₂ at equilibrium'),
      conc('i', '[I₂]', 'I₂ at equilibrium'),
      conc('p', '[HI]', 'HI at equilibrium'),
      constant('K', 'K', 'Equilibrium constant'),
      conc('a', 'a', 'H₂ added'),
      constant('Q', 'Q', 'Reaction quotient just after'),
    ],
    ...rules(
      {
        relation: {
          id: 'K = [HI]²/([H₂][I₂])',
          display: '{K} = {p}^2/({h} × {i})',
          vars: ['K', 'p', 'h', 'i'],
          residual: (v) => v.K! * v.h! * v.i! - v.p! ** 2,
          solve: {
            K: (v) => div(v.p! ** 2, v.h! * v.i!),
            p: (v) => Math.sqrt(Math.max(0, v.K! * v.h! * v.i!)),
            h: (v) => div(v.p! ** 2, v.K! * v.i!),
            i: (v) => div(v.p! ** 2, v.K! * v.h!),
          },
        },
        steps: {
          K: { expr: '{p}^2/({h} × {i})', how: 'Products over reactants at equilibrium.' },
          p: { expr: '√({K} × {h} × {i})', how: 'Multiply out, then take the square root.' },
          h: { expr: '{p}^2/({K} × {i})', how: 'Divide [HI]² by K[I₂].' },
          i: { expr: '{p}^2/({K} × {h})', how: 'Divide [HI]² by K[H₂].' },
        },
      },
      {
        relation: {
          id: 'Q = [HI]²/(([H₂] + a)[I₂])',
          display: '{Q} = {p}^2/(({h} + {a}) × {i})',
          vars: ['Q', 'p', 'h', 'a', 'i'],
          residual: (v) => v.Q! * (v.h! + v.a!) * v.i! - v.p! ** 2,
          solve: {
            Q: (v) => div(v.p! ** 2, (v.h! + v.a!) * v.i!),
            a: (v) => (v.Q! * v.i! === 0 ? undefined : v.p! ** 2 / (v.Q! * v.i!) - v.h!),
          },
        },
        steps: {
          Q: {
            expr: '{p}^2/(({h} + {a}) × {i})',
            how: 'Just after the H₂ goes in, only [H₂] has changed. Compare Q with K.',
          },
          a: { expr: '{p}^2/({Q} × {i}) − {h}', how: 'Find [H₂] from Q, then take the old [H₂].' },
        },
      },
    ),
    example: { h: 0.02, i: 0.02, p: 0.14, K: 49, a: 0.08, Q: 9.8 },
    startWith: ['h', 'i', 'p', 'a'],
    representation: {
      kind: 'equilibriumChart',
      species: [
        { formula: 'H₂', coef: 1, side: 'reactant', start: 'h' },
        { formula: 'I₂', coef: 1, side: 'reactant', start: 'i' },
        { formula: 'HI', coef: 2, side: 'product', start: 'p' },
      ],
      K: 'K',
      stress: { add: { species: 0, amount: 'a' }, Q: 'Q', label: 'Add H₂' },
    },
  },
  {
    id: 'g.s10-rates-equilibrium-volume',
    title: 'Le Châtelier: squeezing the container',
    use: 'Use this for “N₂ + 3H₂ ⇌ 2NH₃ is squeezed to half its volume. Which way does it shift?”',
    unitSystems: ['metric'],
    assumptions: [...EQ_ASSUMPTIONS, 'Halving the volume doubles every concentration at once.'],
    variables: [
      conc('N', '[N₂]', 'N₂ at equilibrium'),
      conc('H', '[H₂]', 'H₂ at equilibrium'),
      conc('A', '[NH₃]', 'NH₃ at equilibrium'),
      constant('K', 'K', 'Equilibrium constant'),
      { ...constant('f', 'f', 'Times the concentrations grow'), min: 0.01, max: 100 },
      constant('Q', 'Q', 'Reaction quotient just after'),
    ],
    ...rules(
      {
        relation: {
          id: 'K = [NH₃]²/([N₂][H₂]³)',
          display: '{K} = {A}^2/({N} × {H}^3)',
          vars: ['K', 'A', 'N', 'H'],
          residual: (v) => v.K! * v.N! * v.H! ** 3 - v.A! ** 2,
          solve: {
            K: (v) => div(v.A! ** 2, v.N! * v.H! ** 3),
            A: (v) => Math.sqrt(Math.max(0, v.K! * v.N! * v.H! ** 3)),
            N: (v) => div(v.A! ** 2, v.K! * v.H! ** 3),
          },
        },
        steps: {
          K: { expr: '{A}^2/({N} × {H}^3)', how: 'Products over reactants, each to its power.' },
          A: { expr: '√({K} × {N} × {H}^3)', how: 'Multiply out, then take the square root.' },
          N: { expr: '{A}^2/({K} × {H}^3)', how: 'Divide [NH₃]² by K[H₂]³.' },
        },
      },
      {
        relation: {
          id: 'Q = K/f²',
          display: '{Q} = {K}/({f}^2)',
          vars: ['Q', 'K', 'f'],
          residual: (v) => v.Q! * v.f! ** 2 - v.K!,
          solve: {
            Q: (v) => div(v.K!, v.f! ** 2),
            K: (v) => v.Q! * v.f! ** 2,
            f: (v) => (v.Q! > 0 ? Math.sqrt(v.K! / v.Q!) : undefined),
          },
        },
        steps: {
          Q: {
            expr: '{K}/({f}^2)',
            how: 'Every concentration grows f times: the top by f², the bottom by f⁴, so Q = K ÷ f².',
          },
          K: { expr: '{Q} × {f}^2', how: 'Multiply Q by f².' },
          f: { expr: '√({K}/{Q})', how: 'Divide K by Q and take the square root.' },
        },
      },
    ),
    example: { N: 0.5, H: 1, A: 0.5, K: 0.5, f: 2, Q: 0.125 },
    startWith: ['N', 'H', 'A', 'f'],
    representation: {
      kind: 'equilibriumChart',
      species: [
        { formula: 'N₂', coef: 1, side: 'reactant', start: 'N' },
        { formula: 'H₂', coef: 3, side: 'reactant', start: 'H' },
        { formula: 'NH₃', coef: 2, side: 'product', start: 'A' },
      ],
      K: 'K',
      stress: { scale: 'f', Q: 'Q', label: 'Volume halved' },
    },
  },
  {
    id: 'g.s10-rates-equilibrium-heat',
    title: 'Le Châtelier: heating an endothermic reaction',
    use: 'Use this for “N₂O₄ ⇌ 2NO₂ takes in heat. When it is heated, K grows from 0.02 to 0.1. What happens?”',
    unitSystems: ['metric'],
    assumptions: [
      ...EQ_ASSUMPTIONS.slice(1),
      'The forward reaction takes in heat, so heating it raises K.',
    ],
    variables: [
      conc('A', '[N₂O₄]', 'N₂O₄ at equilibrium'),
      conc('B', '[NO₂]', 'NO₂ at equilibrium'),
      constant('K1', 'K₁', 'K before heating'),
      constant('K2', 'K₂', 'K after heating'),
      constant('g', 'g', 'Times K grows'),
    ],
    ...rules(
      {
        relation: {
          id: 'K₁ = [NO₂]²/[N₂O₄]',
          display: '{K1} = {B}^2/{A}',
          vars: ['K1', 'B', 'A'],
          residual: (v) => v.K1! * v.A! - v.B! ** 2,
          solve: {
            K1: (v) => div(v.B! ** 2, v.A!),
            B: (v) => Math.sqrt(Math.max(0, v.K1! * v.A!)),
            A: (v) => div(v.B! ** 2, v.K1!),
          },
        },
        steps: {
          K1: { expr: '{B}^2/{A}', how: 'Products over reactants at the first equilibrium.' },
          B: { expr: '√({K1} × {A})', how: 'Multiply K by [N₂O₄] and take the square root.' },
          A: { expr: '{B}^2/{K1}', how: 'Divide [NO₂]² by K.' },
        },
      },
      {
        relation: {
          id: 'g = K₂/K₁',
          display: '{g} = {K2}/{K1}',
          vars: ['g', 'K2', 'K1'],
          residual: (v) => v.g! * v.K1! - v.K2!,
          solve: {
            g: (v) => div(v.K2!, v.K1!),
            K2: (v) => v.g! * v.K1!,
            K1: (v) => div(v.K2!, v.g!),
          },
        },
        steps: {
          g: { expr: '{K2}/{K1}', how: 'Compare the new K with the old one.' },
          K2: { expr: '{g} × {K1}', how: 'Multiply the old K by how much it grows.' },
          K1: { expr: '{K2}/{g}', how: 'Divide the new K by how much it grew.' },
        },
      },
    ),
    example: { A: 0.08, B: 0.04, K1: 0.02, K2: 0.1, g: 5 },
    startWith: ['A', 'B', 'K2'],
    pictureLabels: ['g'],
    representation: {
      kind: 'equilibriumChart',
      species: [
        { formula: 'N₂O₄', coef: 1, side: 'reactant', start: 'A' },
        { formula: 'NO₂', coef: 2, side: 'product', start: 'B' },
      ],
      K: 'K1',
      stress: { K: 'K2', label: 'Heated' },
    },
  },
];

// ─── H55 phScale ─────────────────────────────────────────────────────────────

const phVar = (id: string, symbol: string, name: string): VariableDef => ({
  id,
  symbol,
  name,
  min: 0,
  max: 14,
  step: 0.01,
});
const ionVar = (id: string, symbol: string, name: string): VariableDef => ({
  id,
  symbol,
  name,
  unit: 'mol/L',
  min: 1e-14,
  max: 1,
  step: 1e-15,
  scientific: true,
});

/** pH = −log₁₀[H⁺] (and back: [H⁺] = 10^−pH). */
const phRule = (p = 'p', h = 'h', ion = 'H⁺'): Rule => ({
  relation: {
    id: `p = −log₁₀[${ion}] (${p})`,
    display: `{${p}} = −log₁₀({${h}})`,
    vars: [p, h],
    residual: (v) => v[p]! + Math.log10(v[h]!),
    solve: {
      [p]: (v) => (v[h]! > 0 ? -Math.log10(v[h]!) : undefined),
      [h]: (v) => 10 ** -v[p]!,
    },
  },
  steps: {
    [p]: {
      expr: `−log₁₀({${h}})`,
      how: `Each step of 1 on the scale is ten times the [${ion}]: the log counts the powers of ten.`,
    },
    [h]: { expr: `1/(10^{${p}})`, how: 'Undo the log: one over 10 to the power of the value.' },
  },
});

/** pH + pOH = 14. */
const pohRule: Rule = {
  relation: {
    id: 'pH + pOH = 14',
    display: '{p} + {q} = 14',
    vars: ['p', 'q'],
    residual: (v) => v.p! + v.q! - 14,
    solve: { p: (v) => 14 - v.q!, q: (v) => 14 - v.p! },
  },
  steps: {
    p: { expr: '14 − {q}', how: 'In water at 25 °C, pH and pOH add to 14.' },
    q: { expr: '14 − {p}', how: 'In water at 25 °C, pH and pOH add to 14.' },
  },
};

const PH_ASSUMPTIONS = [
  'The water is at 25 °C, where [H⁺][OH⁻] = 1 × 10⁻¹⁴ and pH + pOH = 14.',
  'Concentrations are in mol/L.',
];

const titrationVars = (weak: boolean): VariableDef[] => [
  { ...conc('Ca', 'C₁', 'Acid concentration'), max: 10 },
  {
    id: 'Va',
    symbol: 'V₁',
    name: 'Acid volume',
    unit: 'mL',
    units: ['mL'],
    min: 1,
    max: 1000,
    step: 0.1,
  },
  { ...conc('Cb', 'C₂', 'Base concentration'), max: 10 },
  {
    id: 'Vb',
    symbol: 'V₂',
    name: 'Base added',
    unit: 'mL',
    units: ['mL'],
    min: 0,
    max: 2000,
    step: 0.1,
  },
  {
    id: 'Ve',
    symbol: 'Vₑ',
    name: 'Base at the equivalence point',
    unit: 'mL',
    units: ['mL'],
    min: 0.01,
    max: 100000,
    step: 0.01,
  },
  {
    id: 'r',
    symbol: 'r',
    name: 'Share of the way to equivalence',
    min: 0,
    max: 100,
    step: 0.0001,
  },
  ...(weak
    ? [
        {
          ...constant('Ka', 'Kₐ', 'Acid dissociation constant'),
          min: 1e-12,
          max: 1,
          scientific: true,
        },
        { ...phVar('pKa', 'pKₐ', 'pKₐ'), max: 14 },
      ]
    : []),
];
const titrationRules = (weak: boolean): Rule[] => [
  {
    relation: {
      id: 'Vₑ = C₁V₁/C₂',
      display: '{Ve} = ({Ca} × {Va})/{Cb}',
      vars: ['Ve', 'Ca', 'Va', 'Cb'],
      residual: (v) => v.Ve! * v.Cb! - v.Ca! * v.Va!,
      solve: {
        Ve: (v) => div(v.Ca! * v.Va!, v.Cb!),
        Ca: (v) => div(v.Ve! * v.Cb!, v.Va!),
        Va: (v) => div(v.Ve! * v.Cb!, v.Ca!),
        Cb: (v) => div(v.Ca! * v.Va!, v.Ve!),
      },
    },
    steps: {
      Ve: {
        expr: '({Ca} × {Va})/{Cb}',
        how: 'At equivalence the moles of base equal the moles of acid: C₂Vₑ = C₁V₁.',
      },
      Ca: { expr: '({Ve} × {Cb})/{Va}', how: 'The acid’s moles are the base’s at equivalence.' },
      Va: { expr: '({Ve} × {Cb})/{Ca}', how: 'Divide the base’s moles by the acid’s molarity.' },
      Cb: { expr: '({Ca} × {Va})/{Ve}', how: 'Divide the acid’s moles by the volume of base.' },
    },
  },
  {
    relation: {
      id: 'r = V₂/Vₑ',
      display: '{r} = {Vb}/{Ve}',
      vars: ['r', 'Vb', 'Ve'],
      residual: (v) => v.r! * v.Ve! - v.Vb!,
      solve: { r: (v) => div(v.Vb!, v.Ve!), Vb: (v) => v.r! * v.Ve! },
    },
    steps: {
      r: { expr: '{Vb}/{Ve}', how: 'Compare the base added with the base equivalence takes.' },
      Vb: { expr: '{r} × {Ve}', how: 'Take that share of the equivalence volume.' },
    },
  },
  ...(weak ? [phRule('pKa', 'Ka', 'Kₐ')] : []),
];

const ACIDS: ModuleDef[] = [
  {
    id: 'g.s10-acids-bases-ph',
    title: 'pH from [H⁺]',
    use: 'Use this for “A solution has [H⁺] = 0.001 M. What is its pH?”',
    unitSystems: ['metric'],
    assumptions: PH_ASSUMPTIONS,
    variables: [phVar('p', 'pH', 'pH'), ionVar('h', '[H⁺]', 'Hydrogen ion concentration')],
    ...rules(phRule()),
    example: { p: 3, h: 0.001 },
    startWith: ['h'],
    representation: { kind: 'phScale', pH: 'p', hydrogen: 'h', examples: true },
  },
  {
    id: 'g.s10-acids-bases-hydrogen',
    title: '[H⁺] from pH',
    use: 'Use this for “Coffee has a pH of 5.2. What is its [H⁺]?”',
    unitSystems: ['metric'],
    assumptions: PH_ASSUMPTIONS,
    variables: [phVar('p', 'pH', 'pH'), ionVar('h', '[H⁺]', 'Hydrogen ion concentration')],
    ...rules(phRule()),
    example: { p: 5.2, h: 10 ** -5.2 },
    startWith: ['p'],
    representation: { kind: 'phScale', pH: 'p', hydrogen: 'h' },
  },
  {
    id: 'g.s10-acids-bases-base',
    title: 'A strong base: pOH and pH',
    use: 'Use this for “A solution has [OH⁻] = 0.5 M. What are its pOH and pH?”',
    unitSystems: ['metric'],
    assumptions: PH_ASSUMPTIONS,
    variables: [
      phVar('p', 'pH', 'pH'),
      phVar('q', 'pOH', 'pOH'),
      ionVar('o', '[OH⁻]', 'Hydroxide ion concentration'),
    ],
    ...rules(phRule('q', 'o', 'OH⁻'), pohRule),
    example: { p: 14 + Math.log10(0.5), q: -Math.log10(0.5), o: 0.5 },
    startWith: ['o'],
    representation: { kind: 'phScale', pH: 'p', pOH: 'q', hydroxide: 'o' },
  },
  {
    id: 'g.s10-acids-bases-titration',
    title: 'Titrating a strong acid',
    use: 'Use this for “25 mL of 0.1 M HCl is titrated with 0.1 M NaOH. Where is the equivalence point?”',
    unitSystems: ['metric'],
    assumptions: [
      ...PH_ASSUMPTIONS,
      'Each mole of NaOH uses up one mole of HCl; the pH is worked from every ion in the flask.',
    ],
    variables: titrationVars(false),
    ...rules(...titrationRules(false)),
    example: { Ca: 0.1, Va: 25, Cb: 0.1, Vb: 10, Ve: 25, r: 0.4 },
    startWith: ['Ca', 'Va', 'Cb', 'Vb'],
    representation: {
      kind: 'phScale',
      mode: 'titration',
      acid: { concentration: 'Ca', volume: 'Va', name: 'HCl' },
      base: { concentration: 'Cb', name: 'NaOH' },
      added: 'Vb',
      equivalence: 'Ve',
      keep: ['Ca', 'Va', 'Cb'],
    },
    pictureLabels: ['r'],
  },
  {
    id: 'g.s10-acids-bases-weak-titration',
    title: 'Titrating a weak acid',
    use: 'Use this for “25 mL of 0.1 M acetic acid (Kₐ = 1.8 × 10⁻⁵) is titrated with 0.1 M NaOH.”',
    unitSystems: ['metric'],
    assumptions: [
      ...PH_ASSUMPTIONS,
      'Halfway to equivalence, half the acid is turned to its partner base, so pH = pKₐ.',
    ],
    variables: titrationVars(true),
    ...rules(...titrationRules(true)),
    example: {
      Ca: 0.1,
      Va: 25,
      Cb: 0.1,
      Vb: 12.5,
      Ve: 25,
      r: 0.5,
      Ka: 1.8e-5,
      pKa: -Math.log10(1.8e-5),
    },
    startWith: ['Ca', 'Va', 'Cb', 'Vb', 'Ka'],
    representation: {
      kind: 'phScale',
      mode: 'titration',
      acid: { concentration: 'Ca', volume: 'Va', Ka: 'Ka', name: 'acetic acid' },
      base: { concentration: 'Cb', name: 'NaOH' },
      added: 'Vb',
      equivalence: 'Ve',
      keep: ['Ca', 'Va', 'Cb', 'Ka'],
    },
    pictureLabels: ['r', 'pKa'],
    standalone: {
      vars: ['Ka', 'pKa'],
      why: 'The acid’s Kₐ shapes the curve but no volume depends on it: the picture draws it.',
    },
  },
];

export const HSJ_GALLERY_MODULES: ModuleDef[] = [
  ...GAS,
  ...SOLUTIONS,
  ...ENERGY,
  ...EQUILIBRIUM,
  ...ACIDS,
];
// ─── H56 electrochemicalCell (explore) ───────────────────────────────────────

const GALVANIC_LAYOUT: LayoutDef = {
  id: 'g.s10-redox-galvanic-cell',
  title: 'A galvanic cell',
  kind: 'explore',
  assumptions: [
    'Each metal stands in a 1 M solution of its own ion, at 25 °C.',
    'A wire joins the metals; a salt bridge of KNO₃ joins the solutions.',
  ],
  figure: { kind: 'electrochemicalCell' },
  scenes: [
    {
      label: 'Electrons',
      galvanic: { metals: ['Zn', 'Cu'], lit: 'electrons' },
      lines: [
        'Zinc gives up electrons more easily than copper, so zinc is the anode.',
        'The electrons leave the zinc and travel along the wire to the copper.',
      ],
    },
    {
      label: 'Anode',
      galvanic: { metals: ['Zn', 'Cu'], lit: 'anode' },
      lines: [
        'At the anode, each zinc atom loses two electrons and goes into the solution as Zn²⁺.',
        'Losing electrons is oxidation. The zinc strip slowly wears away.',
      ],
    },
    {
      label: 'Cathode',
      galvanic: { metals: ['Zn', 'Cu'], lit: 'cathode' },
      lines: [
        'At the cathode, each Cu²⁺ ion takes two electrons and coats the strip as copper.',
        'Gaining electrons is reduction. The blue solution slowly fades.',
      ],
    },
    {
      label: 'Salt bridge',
      galvanic: { metals: ['Zn', 'Cu'], lit: 'bridge' },
      lines: [
        'NO₃⁻ ions drift toward the anode and K⁺ ions toward the cathode.',
        'That keeps both solutions neutral. Take the bridge away and the current stops.',
      ],
    },
    {
      label: 'Voltage',
      galvanic: { metals: ['Zn', 'Cu'], lit: 'meter' },
      lines: ['E° = E°cathode − E°anode = 0.34 − (−0.76) = 1.10 V.'],
    },
    {
      label: 'Copper as anode',
      galvanic: { metals: ['Ag', 'Cu'], lit: 'anode' },
      lines: [
        'Beside silver, copper is the anode: Ag⁺ takes electrons more easily than Cu²⁺.',
        'E° = 0.80 − 0.34 = 0.46 V.',
      ],
    },
    {
      label: 'A bigger voltage',
      galvanic: { metals: ['Mg', 'Ag'], meter: 'bulb', lit: 'meter' },
      lines: [
        'Magnesium and silver are far apart: E° = 0.80 − (−2.37) = 3.17 V.',
        'That is enough to light a small bulb.',
      ],
    },
  ],
};

export const HSJ_GALLERY_LAYOUTS: LayoutDef[] = [GALVANIC_LAYOUT];
