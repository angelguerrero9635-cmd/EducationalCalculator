/**
 * Grades 9–12 round 2 gallery demos (group H2D: chemistry (H101); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in: real variables,
 * relations, steps and a use line, so `scripts/promote-demo.mjs` can copy it into a grade file.
 * Spread into gallery.ts.
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

const whole = (
  id: string,
  symbol: string,
  name: string,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, min, max, step: 1, integer: true, ...more });

/** A value with a unit the unit menu keeps. */
const quantity = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  step = 0.01,
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

/** out = k × of (k a fixed number): a count or a mass that follows another by a fixed ratio. */
const times = (out: string, k: number, of: string, how: [string, string]): Rule => ({
  relation: {
    id: `${out} = ${k} × ${of}`,
    display: `{${out}} = ${k} × {${of}}`,
    vars: [out, of],
    residual: (v) => v[out]! - k * v[of]!,
    solve: { [out]: (v) => k * v[of]!, [of]: (v) => v[out]! / k },
  },
  steps: {
    [out]: { expr: `${k} × {${of}}`, how: how[0] },
    [of]: { expr: `{${out}}/${k}`, how: how[1] },
  },
});

/** out = a × b, two values multiplied. */
const product = (out: string, a: string, b: string, how: [string, string, string]): Rule => ({
  relation: {
    id: `${out} = ${a} × ${b}`,
    display: `{${out}} = {${a}} × {${b}}`,
    vars: [out, a, b],
    residual: (v) => v[out]! - v[a]! * v[b]!,
    solve: {
      [out]: (v) => v[a]! * v[b]!,
      [a]: (v) => (v[b] ? v[out]! / v[b]! : undefined),
      [b]: (v) => (v[a] ? v[out]! / v[a]! : undefined),
    },
  },
  steps: {
    [out]: { expr: `{${a}} × {${b}}`, how: how[0] },
    [a]: { expr: `{${out}}/{${b}}`, how: how[1] },
    [b]: { expr: `{${out}}/{${a}}`, how: how[2] },
  },
});

// ─── Part 1: reaction formulas from values (CₓHᵧ) ────────────────────────────

/**
 * Any hydrocarbon burning: CₓHᵧ + O₂ → CO₂ + H₂O with the fuel's subscripts typed. The fuel
 * coefficient a is 1 when y is a multiple of 4 (whole O₂), else 2; then carbon, hydrogen and
 * oxygen last. The reaction picture draws the fuel from x and y (`C{x}H{y}`).
 */
const combustionGeneral: ModuleDef = {
  id: 'g.s10-reaction-types-combustion-general',
  title: 'Balancing any hydrocarbon’s combustion',
  use: 'Use this for “Balance the burning of CₓHᵧ” for any hydrocarbon: ethane, butane, octane.',
  unitSystems: ['metric'],
  assumptions: [
    'A hydrocarbon burns completely in oxygen to carbon dioxide and water.',
    'Balance carbon first, then hydrogen, and oxygen last, since O₂ appears alone.',
    'When y is not a multiple of 4, the oxygen needs a half, so double every coefficient.',
  ],
  variables: [
    whole('x', 'x', 'Carbon atoms in the fuel', 1, 8),
    whole('y', 'y', 'Hydrogen atoms in the fuel', 2, 18, { multipleOf: 2 }),
    { ...whole('a', 'a', 'Fuel molecules', 1, 2), derived: true },
    { ...whole('b', 'b', 'Oxygen molecules', 1, 25), derived: true },
    { ...whole('c', 'c', 'Carbon dioxide molecules', 1, 16), derived: true },
    { ...whole('d', 'd', 'Water molecules', 1, 18), derived: true },
    { ...whole('o', 'O', 'Oxygen atoms on each side', 2, 50), derived: true },
    {
      ...quantity('M', 'M', 'Molar mass of the fuel', 'g/mol', 1, 200, 0.01),
      derived: true,
    },
  ],
  ...rules(
    {
      relation: {
        id: 'y ≤ 2x + 2',
        constraint: true,
        display: '{y} is at most 2 × {x} + 2',
        vars: ['x', 'y'],
        residual: (v) => (v.y! <= 2 * v.x! + 2 ? 0 : 1),
        solve: {},
      },
      steps: {},
    },
    {
      relation: {
        id: 'fuel coefficient',
        display: '{a} = 1 if {y} is a multiple of 4, else 2',
        vars: ['a', 'y'],
        residual: (v) => v.a! - (v.y! % 4 === 0 ? 1 : 2),
        solve: { a: (v) => (v.y! % 4 === 0 ? 1 : 2), y: () => undefined },
      },
      steps: {
        a: {
          expr: '1 if {y} is a multiple of 4, else 2',
          how: 'Each O₂ brings 2 oxygen atoms; the water needs y ÷ 2 of them, a whole number of O₂ only when y is a multiple of 4.',
        },
      },
    },
    product('c', 'a', 'x', [
      'Carbon first: each fuel molecule gives x carbon atoms, one per CO₂.',
      'Divide the CO₂ by the carbon atoms in each fuel molecule.',
      'Divide the CO₂ by the fuel molecules.',
    ]),
    {
      relation: {
        id: 'd = a × y ÷ 2',
        display: '{d} = {a} × {y}/2',
        vars: ['d', 'a', 'y'],
        residual: (v) => 2 * v.d! - v.a! * v.y!,
        solve: {
          d: (v) => (v.a! * v.y!) / 2,
          a: (v) => (v.y ? (2 * v.d!) / v.y! : undefined),
          y: (v) => (v.a ? (2 * v.d!) / v.a! : undefined),
        },
      },
      steps: {
        d: { expr: '{a} × {y}/2', how: 'Hydrogen next: each H₂O takes 2 hydrogen atoms.' },
        a: { expr: '2 × {d}/{y}', how: 'Two hydrogen atoms per water, y per fuel molecule.' },
        y: { expr: '2 × {d}/{a}', how: 'Two hydrogen atoms per water, shared by the fuel.' },
      },
    },
    {
      relation: {
        id: 'O after = 2c + d',
        display: '{o} = 2 × {c} + {d}',
        vars: ['o', 'c', 'd'],
        residual: (v) => v.o! - (2 * v.c! + v.d!),
        solve: {
          o: (v) => 2 * v.c! + v.d!,
          c: (v) => (v.o! - v.d!) / 2,
          d: (v) => v.o! - 2 * v.c!,
        },
      },
      steps: {
        o: { expr: '2 × {c} + {d}', how: 'Oxygen last: 2 in each CO₂ and 1 in each H₂O.' },
        c: { expr: '({o} − {d})/2', how: 'Take the water’s oxygen away, 2 per CO₂.' },
        d: { expr: '{o} − 2 × {c}', how: 'Take the CO₂’s oxygen away.' },
      },
    },
    times('o', 2, 'b', [
      'The oxygen before is 2 atoms in each O₂.',
      'Halve the oxygen atoms: 2 in each O₂.',
    ]),
    {
      relation: {
        id: 'M = 12.01x + 1.008y',
        display: '{M} = 12.01 × {x} + 1.008 × {y}',
        vars: ['M', 'x', 'y'],
        residual: (v) => v.M! - (12.011 * v.x! + 1.008 * v.y!),
        solve: {
          M: (v) => 12.011 * v.x! + 1.008 * v.y!,
          x: (v) => (v.M! - 1.008 * v.y!) / 12.011,
          y: (v) => (v.M! - 12.011 * v.x!) / 1.008,
        },
      },
      steps: {
        M: {
          expr: '12.01 × {x} + 1.008 × {y}',
          how: 'Add the atoms’ masses: 12.01 g for each mole of carbon, 1.008 g for each of hydrogen.',
        },
        x: {
          expr: '({M} − 1.008 × {y})/12.01',
          how: 'Take the hydrogen away, 12.01 g per carbon.',
        },
        y: {
          expr: '({M} − 12.01 × {x})/1.008',
          how: 'Take the carbon away, 1.008 g per hydrogen.',
        },
      },
    },
  ),
  example: { x: 2, y: 6, a: 2, b: 7, c: 4, d: 6, o: 14, M: 12.011 * 2 + 1.008 * 6 },
  startWith: ['x', 'y'],
  representation: {
    kind: 'reaction',
    reactants: [
      { formula: 'C{x}H{y}', count: 'a', molar: 'M' },
      { formula: 'O2', count: 'b' },
    ],
    products: [
      { formula: 'CO2', count: 'c' },
      { formula: 'H2O', count: 'd' },
    ],
    atoms: { O: ['o', 'o'] },
    most: 25,
  },
};

/** Zinc in acid with the ions drawn as ions: ZnCl₂ is a formula unit, not a molecule. */
const replacementIons: ModuleDef = {
  id: 'g.s10-reaction-types-replacement-ions',
  title: 'A single replacement, ions drawn as ions',
  use: 'Use this for “Balance Zn + HCl → ZnCl₂ + H₂” with zinc chloride drawn as ions.',
  unitSystems: ['metric'],
  assumptions: [
    'Zinc takes the place of hydrogen: the hydrogen leaves as a gas.',
    'Zinc chloride is ionic: one Zn²⁺ and two Cl⁻ held together, with no shared bonds.',
  ],
  variables: [
    whole('a', 'a', 'Zinc atoms', 1, 4),
    { ...whole('b', 'b', 'Hydrogen chloride molecules', 0, 8), derived: true },
    { ...whole('c', 'c', 'Zinc chloride units', 0, 4), derived: true },
    { ...whole('d', 'd', 'Hydrogen molecules', 0, 4), derived: true },
  ],
  ...rules(
    times('c', 1, 'a', ['Zinc: one ZnCl₂ for each zinc atom.', 'Zinc: one atom per ZnCl₂.']),
    times('b', 2, 'c', [
      'Chlorine: each ZnCl₂ holds 2, and each HCl brings 1.',
      'Chlorine: one ZnCl₂ for every 2 HCl.',
    ]),
    times('b', 2, 'd', [
      'Hydrogen: each H₂ takes the hydrogen of 2 HCl.',
      'Hydrogen: 2 HCl for each H₂.',
    ]),
  ),
  example: { a: 2, b: 4, c: 2, d: 2 },
  startWith: ['a'],
  representation: {
    kind: 'reaction',
    reactants: [
      { formula: 'Zn', count: 'a' },
      { formula: 'HCl', count: 'b' },
    ],
    products: [
      { formula: 'ZnCl2', count: 'c' },
      { formula: 'H2', count: 'd' },
    ],
    ions: true,
  },
};

/** Aluminum burning, aluminum oxide drawn as ions: 2 Al³⁺ and 3 O²⁻ in each formula unit. */
const synthesisIons: ModuleDef = {
  id: 'g.s10-reaction-types-synthesis-ions',
  title: 'A synthesis, the oxide drawn as ions',
  use: 'Use this for “Balance Al + O₂ → Al₂O₃” with aluminum oxide drawn as ions.',
  unitSystems: ['metric'],
  assumptions: [
    'Aluminum burns in oxygen to make aluminum oxide, one product from two reactants.',
    'Aluminum oxide is ionic: each formula unit is two Al³⁺ and three O²⁻.',
    'Oxygen comes in pairs and Al₂O₃ holds 3, so aluminum comes 4 atoms at a time.',
  ],
  variables: [
    whole('a', 'a', 'Aluminum atoms', 4, 8, { multipleOf: 4 }),
    { ...whole('b', 'b', 'Oxygen molecules', 0, 6), derived: true },
    { ...whole('c', 'c', 'Aluminum oxide units', 0, 4), derived: true },
  ],
  ...rules(
    times('a', 2, 'c', [
      'Aluminum: 2 atoms in each Al₂O₃.',
      'Aluminum: half as many units as atoms.',
    ]),
    {
      relation: {
        id: '2b = 3c',
        display: '2 × {b} = 3 × {c}',
        vars: ['b', 'c'],
        residual: (v) => 2 * v.b! - 3 * v.c!,
        solve: { b: (v) => (3 * v.c!) / 2, c: (v) => (2 * v.b!) / 3 },
      },
      steps: {
        b: { expr: '3 × {c}/2', how: 'Oxygen: 3 in each Al₂O₃, 2 in each O₂.' },
        c: { expr: '2 × {b}/3', how: 'Oxygen: 2 in each O₂, 3 in each Al₂O₃.' },
      },
    },
  ),
  example: { a: 4, b: 3, c: 2 },
  startWith: ['a'],
  representation: {
    kind: 'reaction',
    reactants: [
      { formula: 'Al', count: 'a' },
      { formula: 'O2', count: 'b' },
    ],
    products: [{ formula: 'Al2O3', count: 'c' }],
    ions: true,
  },
};

// ─── Part 4: the limiting reactant from grams (moleMap limiting) ─────────────

/** out = x ÷ k or x × k with a fixed factor k: grams to moles, moles to grams, a mole ratio. */
const scaleBy = (
  out: string,
  x: string,
  k: number,
  kText: string,
  how: [string, string],
): Rule => ({
  relation: {
    id: `${out} = ${x} × ${kText}`,
    display: `{${out}} = {${x}} × ${kText}`,
    vars: [out, x],
    residual: (v) => v[out]! - v[x]! * k,
    solve: { [out]: (v) => v[x]! * k, [x]: (v) => v[out]! / k },
  },
  steps: {
    [out]: { expr: `{${x}} × ${kText}`, how: how[0] },
    [x]: { expr: `{${out}}/(${kText})`, how: how[1] },
  },
});

/** Molar masses from the table, to 2 decimals (molarMassOf): N₂ 28.01, H₂ 2.02, NH₃ 17.03. */
const M_N2 = 28.01;
const M_H2 = 2.02;
const M_NH3 = 17.03;

const limitingGrams: ModuleDef = {
  id: 'g.s10-stoichiometry-limiting-grams',
  title: 'The limiting reactant from grams',
  use: 'Use this for “28.01 g of N₂ and 5.05 g of H₂ react. How many grams of NH₃ form?”',
  unitSystems: ['metric'],
  assumptions: [
    'The equation is balanced: N₂ + 3 H₂ → 2 NH₃.',
    'Grams can’t be compared directly: change each to moles, then to the product’s moles.',
    'The reactant that makes less product runs out first: it is the limiting reactant.',
  ],
  variables: [
    quantity('m1', 'm₁', 'Mass of N₂', 'g', 0.01, 10000),
    quantity('m2', 'm₂', 'Mass of H₂', 'g', 0.01, 10000),
    { ...quantity('n1', 'n₁', 'Moles of N₂', 'mol', 0.0001, 1000, 0.0001), derived: true },
    { ...quantity('n2', 'n₂', 'Moles of H₂', 'mol', 0.0001, 1000, 0.0001), derived: true },
    {
      ...quantity('y1', 'y₁', 'NH₃ the N₂ could make', 'mol', 0.0001, 2000, 0.0001),
      derived: true,
    },
    {
      ...quantity('y2', 'y₂', 'NH₃ the H₂ could make', 'mol', 0.0001, 2000, 0.0001),
      derived: true,
    },
    { ...quantity('n', 'n', 'Moles of NH₃ made', 'mol', 0.0001, 2000, 0.0001), derived: true },
    { ...quantity('m', 'm', 'Mass of NH₃ made', 'g', 0.001, 40000, 0.01), derived: true },
  ],
  ...rules(
    scaleBy('n1', 'm1', 1 / M_N2, `1/${M_N2}`, [
      `Divide the grams of N₂ by its molar mass, ${M_N2} g/mol.`,
      `Multiply the moles by ${M_N2} g/mol.`,
    ]),
    scaleBy('n2', 'm2', 1 / M_H2, `1/${M_H2}`, [
      `Divide the grams of H₂ by its molar mass, ${M_H2} g/mol.`,
      `Multiply the moles by ${M_H2} g/mol.`,
    ]),
    scaleBy('y1', 'n1', 2, '2', [
      'Mole ratio: 1 N₂ makes 2 NH₃.',
      'Mole ratio: 2 NH₃ come from 1 N₂.',
    ]),
    scaleBy('y2', 'n2', 2 / 3, '2/3', [
      'Mole ratio: 3 H₂ make 2 NH₃.',
      'Mole ratio: 2 NH₃ come from 3 H₂.',
    ]),
    {
      relation: {
        id: 'n = smaller yield',
        display: '{n} = the smaller of {y1} and {y2}',
        vars: ['n', 'y1', 'y2'],
        residual: (v) => v.n! - Math.min(v.y1!, v.y2!),
        solve: { n: (v) => Math.min(v.y1!, v.y2!), y1: () => undefined, y2: () => undefined },
      },
      steps: {
        n: {
          expr: 'the smaller of {y1} and {y2}',
          how: 'The reaction stops when the limiting reactant runs out, so only the smaller amount forms.',
        },
      },
    },
    scaleBy('m', 'n', M_NH3, String(M_NH3), [
      `Multiply the moles of NH₃ by its molar mass, ${M_NH3} g/mol.`,
      `Divide the grams by ${M_NH3} g/mol.`,
    ]),
  ),
  example: {
    m1: 28.01,
    m2: 5.05,
    n1: 1,
    n2: 2.5,
    y1: 2,
    y2: 5 / 3,
    n: 5 / 3,
    m: (5 / 3) * M_NH3,
  },
  startWith: ['m1', 'm2'],
  representation: {
    kind: 'moleMap',
    formula: 'NH3',
    moles: 'n',
    mass: 'm',
    limiting: {
      coef: 2,
      reactants: [
        { formula: 'N2', coef: 1, mass: 'm1', moles: 'n1', yields: 'y1' },
        { formula: 'H2', coef: 3, mass: 'm2', moles: 'n2', yields: 'y2' },
      ],
    },
  },
};

// ─── Part 5: an enthalpy ladder (energyProfile ladder) ───────────────────────

const kJ = (id: string, symbol: string, name: string): VariableDef =>
  quantity(id, symbol, name, 'kJ', -100000, 100000, 0.1);

/** out = a + b, or out = a − b. */
const sum = (
  out: string,
  a: string,
  b: string,
  op: '+' | '−',
  how: [string, string, string],
): Rule => {
  const s = op === '+' ? 1 : -1;
  return {
    relation: {
      id: `${out} = ${a} ${op} ${b}`,
      display: `{${out}} = {${a}} ${op} {${b}}`,
      vars: [out, a, b],
      residual: (v) => v[out]! - (v[a]! + s * v[b]!),
      solve: {
        [out]: (v) => v[a]! + s * v[b]!,
        [a]: (v) => v[out]! - s * v[b]!,
        [b]: (v) => s * (v[out]! - v[a]!),
      },
    },
    steps: {
      [out]: { expr: `{${a}} ${op} {${b}}`, how: how[0] },
      [a]: { expr: op === '+' ? `{${out}} − {${b}}` : `{${out}} + {${b}}`, how: how[1] },
      [b]: { expr: op === '+' ? `{${out}} − {${a}}` : `{${a}} − {${out}}`, how: how[2] },
    },
  };
};

/**
 * ΔH from heats of formation: CH₄ + 2 O₂ → CO₂ + 2 H₂O(l). Each side is measured down from its
 * elements at 0 (an element's ΔH_f is 0), and ΔH is products − reactants.
 */
const formation: ModuleDef = {
  id: 'g.s10-thermochemistry-formation',
  title: 'ΔH from heats of formation',
  use: 'Use this for “Find ΔH for CH₄ + 2O₂ → CO₂ + 2H₂O from the heats of formation.”',
  unitSystems: ['metric'],
  assumptions: [
    'An element in its standard state has a heat of formation of 0, so O₂ adds nothing.',
    'Each heat of formation is per mole, so multiply it by the coefficient.',
    'The water is liquid.',
  ],
  variables: [
    kJ('f1', 'ΔHf(CH₄)', 'Heat of formation of CH₄'),
    kJ('f2', 'ΔHf(CO₂)', 'Heat of formation of CO₂'),
    kJ('f3', 'ΔHf(H₂O)', 'Heat of formation of H₂O'),
    { ...kJ('Hr', 'Hᵣ', 'Reactants’ heats of formation, added'), derived: true },
    { ...kJ('Hp', 'Hₚ', 'Products’ heats of formation, added'), derived: true },
    { ...kJ('dH', 'ΔH', 'Enthalpy change of the reaction'), derived: true },
  ],
  ...rules(
    {
      relation: {
        id: 'Hr = f1',
        display: '{Hr} = {f1} + 2 × 0',
        vars: ['Hr', 'f1'],
        residual: (v) => v.Hr! - v.f1!,
        solve: { Hr: (v) => v.f1!, f1: (v) => v.Hr! },
      },
      steps: {
        Hr: { expr: '{f1} + 2 × 0', how: 'One CH₄, and O₂ is an element: 0.' },
        f1: { expr: '{Hr} − 2 × 0', how: 'The O₂ adds nothing, so it is all CH₄.' },
      },
    },
    {
      relation: {
        id: 'Hp = f2 + 2 f3',
        display: '{Hp} = {f2} + 2 × {f3}',
        vars: ['Hp', 'f2', 'f3'],
        residual: (v) => v.Hp! - (v.f2! + 2 * v.f3!),
        solve: {
          Hp: (v) => v.f2! + 2 * v.f3!,
          f2: (v) => v.Hp! - 2 * v.f3!,
          f3: (v) => (v.Hp! - v.f2!) / 2,
        },
      },
      steps: {
        Hp: { expr: '{f2} + 2 × {f3}', how: 'One CO₂ and two H₂O, each times its coefficient.' },
        f2: { expr: '{Hp} − 2 × {f3}', how: 'Take the two waters away.' },
        f3: {
          expr: '({Hp} − {f2})/2',
          how: 'Take the CO₂ away and share the rest between two waters.',
        },
      },
    },
    sum('dH', 'Hp', 'Hr', '−', [
      'Products minus reactants: both are measured from the same elements.',
      'Add the reactants back to ΔH.',
      'The products less ΔH.',
    ]),
  ),
  example: { f1: -74.8, f2: -393.5, f3: -285.8, Hr: -74.8, Hp: -965.1, dH: -890.3 },
  startWith: ['f1', 'f2', 'f3'],
  representation: {
    kind: 'energyProfile',
    mode: 'ladder',
    levels: [
      { name: 'Elements', value: 0 },
      { name: 'CH₄ + 2 O₂', value: 'Hr' },
      { name: 'CO₂ + 2 H₂O', value: 'Hp' },
    ],
    steps: [
      { from: 0, to: 1, value: 'Hr', label: 'Reactants' },
      { from: 0, to: 2, value: 'Hp', label: 'Products' },
    ],
    total: { from: 1, to: 2, value: 'dH' },
  },
};

/**
 * Hess's law: C + ½O₂ → CO (ΔH₁) then CO + ½O₂ → CO₂. The second is given the other way
 * (CO₂ → CO + ½O₂, +283.0 kJ), so reversing it flips its sign.
 */
const hess: ModuleDef = {
  id: 'g.s10-thermochemistry-hess',
  title: 'Hess’s law: adding steps',
  use: 'Use this for “Find ΔH for C + O₂ → CO₂ from C + ½O₂ → CO and CO₂ → CO + ½O₂.”',
  unitSystems: ['metric'],
  assumptions: [
    'ΔH depends only on where a reaction starts and ends, not on the path.',
    'Reversing an equation flips the sign of its ΔH.',
    'The steps add up to the overall equation: the CO made in step 1 is used in step 2.',
  ],
  variables: [
    kJ('d1', 'ΔH₁', 'Step 1: C + ½O₂ → CO'),
    kJ('g2', 'ΔHgiven', 'Given: CO₂ → CO + ½O₂'),
    { ...kJ('d2', 'ΔH₂', 'Step 2 reversed: CO + ½O₂ → CO₂'), derived: true },
    { ...kJ('dH', 'ΔH', 'Overall: C + O₂ → CO₂'), derived: true },
  ],
  ...rules(
    {
      relation: {
        id: 'd2 = −g2',
        display: '{d2} = −{g2}',
        vars: ['d2', 'g2'],
        residual: (v) => v.d2! + v.g2!,
        solve: { d2: (v) => -v.g2!, g2: (v) => -v.d2! },
      },
      steps: {
        d2: { expr: '−{g2}', how: 'The step is used backwards, so its ΔH changes sign.' },
        g2: { expr: '−{d2}', how: 'The given equation runs the other way: flip the sign.' },
      },
    },
    sum('dH', 'd1', 'd2', '+', [
      'Hess’s law: add the steps’ ΔH.',
      'The overall change less step 2.',
      'The overall change less step 1.',
    ]),
  ),
  example: { d1: -110.5, g2: 283, d2: -283, dH: -393.5 },
  startWith: ['d1', 'g2'],
  representation: {
    kind: 'energyProfile',
    mode: 'ladder',
    levels: [{ name: 'C + O₂', value: 0 }, { name: 'CO + ½O₂' }, { name: 'CO₂' }],
    steps: [
      { from: 0, to: 1, value: 'd1' },
      { from: 1, to: 2, value: 'd2', flipped: true },
    ],
    total: { from: 0, to: 2, value: 'dH' },
  },
};

// ─── Part 6: effusion (chemDiagram effusion) ─────────────────────────────────

const molar = (id: string, symbol: string, name: string): VariableDef =>
  quantity(id, symbol, name, 'g/mol', 0.1, 1000, 0.001);

/** Graham's law: which gas leaks out faster, and how many times as fast. */
const effusion: ModuleDef = {
  id: 'g.s10-gas-laws-effusion',
  title: 'Effusion: Graham’s law',
  use: 'Use this for “Hydrogen and oxygen leak from one balloon. Which escapes faster, and how many times as fast?”',
  unitSystems: ['metric'],
  assumptions: [
    'Both gases are at the same temperature, so their molecules have the same average kinetic energy.',
    'Lighter molecules move faster, so they find the pinhole more often.',
    'rate₁ ÷ rate₂ = √(M₂ ÷ M₁).',
  ],
  variables: [
    molar('M1', 'M₁', 'Molar mass of H₂'),
    molar('M2', 'M₂', 'Molar mass of O₂'),
    {
      ...quantity('r', 'r', 'How many times as fast H₂ escapes', undefined, 0.01, 100, 0.01),
      derived: true,
    },
  ],
  ...rules({
    relation: {
      id: 'r = √(M2/M1)',
      display: '{r} = √({M2}/{M1})',
      vars: ['r', 'M1', 'M2'],
      residual: (v) => v.r! * v.r! * v.M1! - v.M2!,
      solve: {
        r: (v) => (v.M1! > 0 && v.M2! > 0 ? Math.sqrt(v.M2! / v.M1!) : undefined),
        M1: (v) => (v.r! > 0 ? v.M2! / (v.r! * v.r!) : undefined),
        M2: (v) => v.r! * v.r! * v.M1!,
      },
    },
    steps: {
      r: {
        expr: '√({M2}/{M1})',
        how: 'Graham’s law: the rate goes as 1 over the square root of the molar mass.',
      },
      M1: { expr: '{M2}/{r}²', how: 'Square the ratio and divide it into M₂.' },
      M2: { expr: '{r}² × {M1}', how: 'Square the ratio and multiply by M₁.' },
    },
  }),
  example: { M1: 2.016, M2: 32, r: Math.sqrt(32 / 2.016) },
  startWith: ['M1', 'M2'],
  representation: {
    kind: 'chemDiagram',
    mode: 'effusion',
    gases: [
      { formula: 'H2', molarMass: 'M1' },
      { formula: 'O2', molarMass: 'M2' },
    ],
    ratio: 'r',
  },
};

// ─── Part 7: isotope abundance (chemDiagram isotopes) ────────────────────────

const averageMass: ModuleDef = {
  id: 'g.s10-atomic-structure-average-mass',
  title: 'Average atomic mass from isotopes',
  use: 'Use this for “Boron is 19.9% boron-10 (10.01 u) and 80.1% boron-11 (11.01 u). Find its atomic mass.”',
  unitSystems: ['metric'],
  assumptions: [
    'The element has two isotopes; their percents add to 100%.',
    'The atomic mass on the periodic table is the average over the atoms, weighted by how common each isotope is.',
  ],
  variables: [
    quantity('m1', 'm₁', 'Mass of the first isotope', 'u', 0.1, 300, 0.01),
    quantity('m2', 'm₂', 'Mass of the second isotope', 'u', 0.1, 300, 0.01),
    quantity('f1', 'f₁', 'Abundance of the first isotope', '%', 0, 100, 0.1),
    { ...quantity('f2', 'f₂', 'Abundance of the second isotope', '%', 0, 100, 0.1), derived: true },
    { ...quantity('A', 'A', 'Average atomic mass', 'u', 0.1, 300, 0.01), derived: true },
  ],
  ...rules(
    {
      relation: {
        id: 'f2 = 100 − f1',
        display: '{f2} = 100 − {f1}',
        vars: ['f2', 'f1'],
        residual: (v) => v.f2! - (100 - v.f1!),
        solve: { f2: (v) => 100 - v.f1!, f1: (v) => 100 - v.f2! },
      },
      steps: {
        f2: { expr: '100 − {f1}', how: 'The two isotopes make up all the atoms: 100%.' },
        f1: { expr: '100 − {f2}', how: 'The rest of the 100% is the first isotope.' },
      },
    },
    {
      relation: {
        id: 'A = m1 f1 + m2 f2',
        display: '{A} = {m1} × {f1}/100 + {m2} × {f2}/100',
        vars: ['A', 'm1', 'f1', 'm2', 'f2'],
        residual: (v) => 100 * v.A! - (v.m1! * v.f1! + v.m2! * v.f2!),
        solve: {
          A: (v) => (v.m1! * v.f1! + v.m2! * v.f2!) / 100,
          m1: (v) => (v.f1! > 0 ? (100 * v.A! - v.m2! * v.f2!) / v.f1! : undefined),
          m2: (v) => (v.f2! > 0 ? (100 * v.A! - v.m1! * v.f1!) / v.f2! : undefined),
        },
      },
      steps: {
        A: {
          expr: '{m1} × {f1}/100 + {m2} × {f2}/100',
          how: 'Each isotope counts as much as its share of the atoms.',
        },
        m1: {
          expr: '(100 × {A} − {m2} × {f2})/{f1}',
          how: 'Take the second isotope’s share away and divide by the first one’s percent.',
        },
        m2: {
          expr: '(100 × {A} − {m1} × {f1})/{f2}',
          how: 'Take the first isotope’s share away and divide by the second one’s percent.',
        },
      },
    },
  ),
  example: { m1: 10.01, m2: 11.01, f1: 19.9, f2: 80.1, A: (10.01 * 19.9 + 11.01 * 80.1) / 100 },
  startWith: ['m1', 'm2', 'f1'],
  representation: {
    kind: 'chemDiagram',
    mode: 'isotopes',
    element: 'B',
    masses: ['m1', 'm2'],
    percents: ['f1', 'f2'],
    average: 'A',
  },
};

// ─── Part 8: oxidation numbers (chemDiagram oxidation) ───────────────────────

/** x + h(+1) + o(−2) = q: the sulfur in H₂SO₄, HSO₄⁻, SO₄²⁻, SO₃²⁻, H₂S … */
const oxidationSulfur: ModuleDef = {
  id: 'g.s10-redox-oxidation-numbers',
  title: 'Oxidation numbers: the atom to find',
  use: 'Use this for “What is the oxidation number of S in H₂SO₄?” or in SO₄²⁻.',
  unitSystems: ['metric'],
  assumptions: [
    'Hydrogen is +1 and oxygen −2 in most compounds.',
    'The oxidation numbers of all the atoms add up to the charge: 0 for a neutral compound.',
  ],
  variables: [
    whole('x', 'x', 'Oxidation number of the sulfur', -4, 8),
    whole('h', 'h', 'Hydrogen atoms', 0, 4),
    whole('o', 'o', 'Oxygen atoms', 0, 4),
    whole('q', 'q', 'Charge of the particle', -3, 3),
  ],
  ...rules({
    relation: {
      id: 'x + h − 2o = q',
      display: '{x} + {h} × (+1) + {o} × (−2) = {q}',
      vars: ['x', 'h', 'o', 'q'],
      residual: (v) => v.x! + v.h! - 2 * v.o! - v.q!,
      solve: {
        x: (v) => v.q! - v.h! + 2 * v.o!,
        h: (v) => v.q! - v.x! + 2 * v.o!,
        o: (v) => (v.x! + v.h! - v.q!) / 2,
        q: (v) => v.x! + v.h! - 2 * v.o!,
      },
    },
    steps: {
      x: {
        expr: '{q} − {h} + 2 × {o}',
        how: 'Take the hydrogens’ +1 each away from the charge and add back the oxygens’ −2 each.',
      },
      h: { expr: '{q} − {x} + 2 × {o}', how: 'What the charge still needs, +1 per hydrogen.' },
      o: {
        expr: '({x} + {h} − {q})/2',
        how: 'What the other atoms have too much of, −2 per oxygen.',
      },
      q: { expr: '{x} + {h} − 2 × {o}', how: 'Add every atom’s oxidation number.' },
    },
  }),
  example: { x: 6, h: 2, o: 4, q: 0 },
  startWith: ['h', 'o', 'q'],
  representation: {
    kind: 'chemDiagram',
    mode: 'oxidation',
    formula: 'H{h}SO{o}',
    numbers: { H: 1, S: 'x', O: -2 },
    charge: 'q',
  },
};

/** The manganese in permanganate, MnO₄⁻. */
const oxidationPermanganate: ModuleDef = {
  id: 'g.s10-redox-oxidation-numbers-ion',
  title: 'Oxidation numbers in an ion',
  use: 'Use this for “What is the oxidation number of Mn in MnO₄⁻?”',
  unitSystems: ['metric'],
  assumptions: [
    'Oxygen is −2 in most compounds.',
    'In an ion, the oxidation numbers add up to the ion’s charge.',
  ],
  variables: [
    whole('x', 'x', 'Oxidation number of the manganese', -4, 8),
    whole('q', 'q', 'Charge of the ion', -3, 3),
  ],
  ...rules({
    relation: {
      id: 'x − 8 = q',
      display: '{x} + 4 × (−2) = {q}',
      vars: ['x', 'q'],
      residual: (v) => v.x! - 8 - v.q!,
      solve: { x: (v) => v.q! + 8, q: (v) => v.x! - 8 },
    },
    steps: {
      x: { expr: '{q} + 8', how: 'The four oxygens bring −8; the manganese makes up the rest.' },
      q: { expr: '{x} − 8', how: 'Add the four oxygens’ −2 each to the manganese.' },
    },
  }),
  example: { x: 7, q: -1 },
  startWith: ['q'],
  representation: {
    kind: 'chemDiagram',
    mode: 'oxidation',
    formula: 'MnO4',
    numbers: { Mn: 'x', O: -2 },
    charge: 'q',
  },
};

// ─── Part 14: the mass defect (chemDiagram massDefect) ───────────────────────

const massU = (id: string, symbol: string, name: string): VariableDef =>
  quantity(id, symbol, name, 'u', 0.000001, 300, 0.000001);

const massDefect: ModuleDef = {
  id: 'g.s10-nuclear-chemistry-mass-defect',
  title: 'The mass defect: where the energy comes from',
  use: 'Use this for “U-238 gives off an alpha particle. How much mass is lost, and how much energy is released?”',
  unitSystems: ['metric'],
  assumptions: [
    'The masses are of the nuclei with their electrons (atomic masses), in unified atomic mass units.',
    'The mass lost becomes energy, E = mc²: 931.5 MeV for each unit of mass.',
  ],
  variables: [
    massU('mb', 'm', 'Mass of U-238'),
    massU('m1', 'm₁', 'Mass of Th-234'),
    massU('m2', 'm₂', 'Mass of He-4'),
    { ...massU('dm', 'Δm', 'Mass lost'), min: -300, derived: true },
    {
      ...quantity('E', 'E', 'Energy released', 'MeV', -100000, 100000, 0.01),
      derived: true,
    },
  ],
  ...rules(
    {
      relation: {
        id: 'mass is lost',
        constraint: true,
        display: 'The mass after, {m1} + {m2}, is less than {mb}',
        vars: ['mb', 'm1', 'm2'],
        residual: (v) => (v.m1! + v.m2! < v.mb! ? 0 : 1),
        solve: {},
      },
      steps: {},
    },
    {
      relation: {
        id: 'dm = mb − (m1 + m2)',
        display: '{dm} = {mb} − ({m1} + {m2})',
        vars: ['dm', 'mb', 'm1', 'm2'],
        residual: (v) => v.dm! - (v.mb! - v.m1! - v.m2!),
        solve: {
          dm: (v) => v.mb! - v.m1! - v.m2!,
          mb: (v) => v.dm! + v.m1! + v.m2!,
          m1: (v) => v.mb! - v.dm! - v.m2!,
          m2: (v) => v.mb! - v.dm! - v.m1!,
        },
      },
      steps: {
        dm: { expr: '{mb} − ({m1} + {m2})', how: 'The mass before less the mass after.' },
        mb: { expr: '{dm} + {m1} + {m2}', how: 'The mass after plus what was lost.' },
        m1: { expr: '{mb} − {dm} − {m2}', how: 'What is left of the mass for the thorium.' },
        m2: { expr: '{mb} − {dm} − {m1}', how: 'What is left of the mass for the helium.' },
      },
    },
    scaleBy('E', 'dm', 931.5, '931.5', [
      'Each unit of mass lost becomes 931.5 MeV of energy.',
      'Divide the energy by 931.5 MeV per unit.',
    ]),
  ),
  example: {
    mb: 238.050788,
    m1: 234.043601,
    m2: 4.002603,
    dm: 238.050788 - 234.043601 - 4.002603,
    E: (238.050788 - 234.043601 - 4.002603) * 931.5,
  },
  startWith: ['mb', 'm1', 'm2'],
  representation: {
    kind: 'chemDiagram',
    mode: 'massDefect',
    before: [{ name: 'U-238', mass: 'mb' }],
    after: [
      { name: 'Th-234', mass: 'm1' },
      { name: 'He-4', mass: 'm2' },
    ],
    defect: 'dm',
    energy: 'E',
  },
};

export const HS2D_GALLERY_MODULES: ModuleDef[] = [
  combustionGeneral,
  replacementIons,
  synthesisIons,
  limitingGrams,
  formation,
  hess,
  effusion,
  averageMass,
  oxidationSulfur,
  oxidationPermanganate,
  massDefect,
];

export const HS2D_GALLERY_LAYOUTS: LayoutDef[] = [];
