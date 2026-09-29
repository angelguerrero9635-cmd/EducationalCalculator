/**
 * Grade 7 science: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 * The layout pages (explore, sort, sequence, observe) are in `../layouts/science.ts`.
 */
import { heatingCorners, heatingTemp } from '@/components/module/reps/chem';
import { formatNumber as fmt } from '@/engine/format';
import type { Relation, Values } from '@/engine/types';

import { atLeast, div, whole } from '../helpers';
import type { ModuleDef, StepText } from '../types';

/** `id = k × other` (atoms of one element in k particles, or molecules), solvable both ways. */
const scaled = (
  id: string,
  k: number,
  other: string,
  how: [string, string],
): { relation: Relation; steps: Record<string, StepText> } => ({
  relation: {
    id: `${id} = ${k} × ${other}`,
    display: k === 1 ? `{${id}} = {${other}}` : `{${id}} = ${k} × {${other}}`,
    vars: [id, other],
    residual: (v: Values) => v[id]! - k * v[other]!,
    solve: { [id]: (v: Values) => k * v[other]!, [other]: (v: Values) => div(v[id]!, k) },
  },
  steps: {
    [id]: { expr: k === 1 ? `{${other}}` : `${k} × {${other}}`, how: how[0] },
    [other]: { expr: k === 1 ? `{${id}}` : `{${id}} ÷ ${k}`, how: how[1] },
  },
});

/** `id = other ÷ k`, solvable both ways. */
const shared = (
  id: string,
  k: number,
  other: string,
  how: [string, string],
): { relation: Relation; steps: Record<string, StepText> } => ({
  relation: {
    id: `${id} = ${other} ÷ ${k}`,
    display: `{${id}} = {${other}} ÷ ${k}`,
    vars: [id, other],
    residual: (v: Values) => v[id]! * k - v[other]!,
    solve: { [id]: (v: Values) => v[other]! / k, [other]: (v: Values) => k * v[id]! },
  },
  steps: {
    [id]: { expr: `{${other}} ÷ ${k}`, how: how[0] },
    [other]: { expr: `${k} × {${id}}`, how: how[1] },
  },
});

const atomCount = (id: string, symbol: string, name: string) => ({
  ...whole(id, symbol, name, 0, 64),
  derived: true,
});

/** Hydrogen burning in oxygen: 2 H₂ + O₂ → 2 H₂O, from the water molecules made. */
const water = [
  scaled('a', 1, 'c', [
    'One hydrogen molecule for every water molecule: each H₂ gives its 2 hydrogen atoms to one H₂O.',
    'One water molecule for every hydrogen molecule.',
  ]),
  shared('b', 2, 'c', [
    'Half as many oxygen molecules as water molecules: each O₂ has 2 atoms and each H₂O needs 1.',
    'Each oxygen molecule makes 2 water molecules.',
  ]),
  scaled('h1', 2, 'a', [
    'Each H₂ molecule has 2 hydrogen atoms.',
    'Share the atoms out, 2 to each H₂.',
  ]),
  scaled('o1', 2, 'b', [
    'Each O₂ molecule has 2 oxygen atoms.',
    'Share the atoms out, 2 to each O₂.',
  ]),
  scaled('h2', 2, 'c', [
    'Each H₂O molecule has 2 hydrogen atoms.',
    'Share the atoms out, 2 to each H₂O.',
  ]),
  scaled('o2', 1, 'c', [
    'Each H₂O molecule has 1 oxygen atom.',
    'One water molecule for each oxygen atom.',
  ]),
];

/** Iron rusting: 4 Fe + 3 O₂ → 2 Fe₂O₃, from the iron oxide units made. */
const rust = [
  scaled('a', 2, 'c', [
    'Each Fe₂O₃ holds 2 iron atoms, so twice as many iron atoms go in.',
    'Share the iron atoms out, 2 to each Fe₂O₃.',
  ]),
  {
    relation: {
      id: 'b = 3 × c ÷ 2',
      display: '{b} = 3 × {c} ÷ 2',
      vars: ['b', 'c'],
      residual: (v: Values) => 2 * v.b! - 3 * v.c!,
      solve: { b: (v: Values) => (3 * v.c!) / 2, c: (v: Values) => (2 * v.b!) / 3 },
    },
    steps: {
      b: {
        expr: '3 × {c} ÷ 2',
        how: 'Each Fe₂O₃ needs 3 oxygen atoms and each O₂ brings 2: three O₂ for every two Fe₂O₃.',
      },
      c: { expr: '2 × {b} ÷ 3', how: 'Two rust units for every three oxygen molecules.' },
    },
  },
  scaled('f1', 1, 'a', ['Each iron atom is one atom.', 'Each iron atom is one atom.']),
  scaled('o1', 2, 'b', [
    'Each O₂ molecule has 2 oxygen atoms.',
    'Share the atoms out, 2 to each O₂.',
  ]),
  scaled('f2', 2, 'c', [
    'Each Fe₂O₃ has 2 iron atoms.',
    'Share the iron atoms out, 2 to each Fe₂O₃.',
  ]),
  scaled('o2', 3, 'c', [
    'Each Fe₂O₃ has 3 oxygen atoms.',
    'Share the oxygen atoms out, 3 to each Fe₂O₃.',
  ]),
];

/** CH₄ + 2 O₂ → CO₂ + 2 H₂O kept balanced: carbon, hydrogen and oxygen each the same both sides. */
const methane: { relation: Relation; steps: Record<string, StepText> }[] = [
  scaled('c', 1, 'a', [
    'Carbon first: one CO₂ for each CH₄.',
    'Carbon first: one CH₄ for each CO₂.',
  ]),
  scaled('d', 2, 'a', [
    'Hydrogen next: each CH₄ has 4 hydrogen atoms and each H₂O takes 2, so two H₂O per CH₄.',
    'Hydrogen next: 2 H₂O for each CH₄.',
  ]),
  {
    relation: {
      id: '2b = 2c + d',
      display: '2 × {b} = 2 × {c} + {d}',
      vars: ['b', 'c', 'd'],
      residual: (v: Values) => 2 * v.b! - (2 * v.c! + v.d!),
      solve: {
        b: (v: Values) => (2 * v.c! + v.d!) / 2,
        c: (v: Values) => (2 * v.b! - v.d!) / 2,
        d: (v: Values) => 2 * v.b! - 2 * v.c!,
      },
    },
    steps: {
      b: {
        expr: '(2 × {c} + {d}) ÷ 2',
        how: 'Oxygen last: count the oxygen atoms after the arrow, 2 in each CO₂ and 1 in each H₂O, then halve for O₂.',
      },
      c: {
        expr: '(2 × {b} − {d}) ÷ 2',
        how: 'Oxygen last: the oxygen atoms left after the water, 2 in each CO₂.',
      },
      d: { expr: '2 × {b} − 2 × {c}', how: 'Oxygen last: the oxygen atoms left after the CO₂.' },
    },
  },
];

/** Ice from −40 °C heated at a steady rate: the spans keep water's heats in proportion. */
const ICE = heatingCorners(-40, 0, 100, [4, 16, 20, 108]);

/** The state of the water at minute t of the heating curve. */
export const stateAt = (t: number): string =>
  t < 4
    ? 'solid ice, warming'
    : t <= 20
      ? 'melting: ice and water at 0 °C'
      : t < 40
        ? 'liquid water, warming'
        : t <= 148
          ? 'boiling: water and steam at 100 °C'
          : 'all steam';

/** Energy at a feeding level, in kilocalories. */
const energy = (id: string, symbol: string, name: string, derived = true) => ({
  id,
  symbol,
  name,
  unit: 'kcal',
  min: 0,
  max: 1000000,
  step: 0.01,
  derived,
});

/** Level `up` keeps p% of level `down`: up = down × p ÷ 100 (and back). */
const passUp = (up: string, down: string): Relation => ({
  id: `${up} = ${down} × p ÷ 100`,
  display: `{${up}} = {${down}} × {p} ÷ 100`,
  vars: [up, down, 'p'],
  residual: (v: Values) => v[up]! - (v[down]! * v.p!) / 100,
  solve: {
    [up]: (v: Values) => (v[down]! * v.p!) / 100,
    [down]: (v: Values) => (v.p! === 0 ? undefined : (v[up]! * 100) / v.p!),
    p: (v: Values) => (v[down]! === 0 ? undefined : (v[up]! * 100) / v[down]!),
  },
});

const passUpSteps = (up: string, down: string, what: string): Record<string, StepText> => ({
  [up]: {
    expr: `{${down}} × {p} ÷ 100`,
    how: `Only p percent of the energy ${what} is stored in the level above; the rest is used for living or lost as heat.`,
  },
  [down]: {
    expr: `{${up}} × 100 ÷ {p}`,
    how: 'Undo taking the percent: times 100, then divide by p.',
  },
  p: {
    expr: `{${up}} ÷ {${down}} × 100`,
    how: 'The level above out of the level below, as a percent.',
  },
});

/** Brown beetles in the next generation: the generation before, plus the gain. */
const gainRel = (next: string, prev: string): Relation => ({
  id: `${next} = ${prev} + d`,
  display: `{${next}} = {${prev}} + {d}`,
  vars: [next, prev, 'd'],
  residual: (v: Values) => v[next]! - v[prev]! - v.d!,
  solve: {
    [next]: (v: Values) => v[prev]! + v.d!,
    [prev]: (v: Values) => v[next]! - v.d!,
    d: (v: Values) => v[next]! - v[prev]!,
  },
});

const gainSteps = (next: string, prev: string): Record<string, StepText> => ({
  [next]: {
    expr: `{${prev}} + {d}`,
    how: 'The generation before, plus the brown beetles gained: more brown beetles survive to breed, so their share grows.',
  },
  [prev]: { expr: `{${next}} − {d}`, how: 'Take away the brown beetles gained.' },
  d: { expr: `{${next}} − {${prev}}`, how: 'The change from one generation to the next.' },
});

/** The Punnett-square relations: boxes without and with the trait, and the chance. */
const punnett = {
  recessive: {
    id: 'r = (2 − a) × (2 − b)',
    display: '{r} = (2 − {a}) × (2 − {b})',
    vars: ['r', 'a', 'b'],
    residual: (v: Values) => v.r! - (2 - v.a!) * (2 - v.b!),
    solve: {
      r: (v: Values) => (2 - v.a!) * (2 - v.b!),
      a: () => undefined,
      b: () => undefined,
    },
  } satisfies Relation,
  dominant: {
    id: 't = 4 − r',
    display: '{t} = 4 − {r}',
    vars: ['t', 'r'],
    residual: (v: Values) => v.t! + v.r! - 4,
    solve: { t: (v: Values) => 4 - v.r!, r: (v: Values) => 4 - v.t! },
  } satisfies Relation,
  steps: {
    'r = (2 − a) × (2 − b)': {
      r: {
        expr: '(2 − {a}) × (2 − {b})',
        how: 'A child shows the recessive trait only with a small letter from each parent: the small letters of one times the small letters of the other.',
      },
    },
    't = 4 − r': {
      t: {
        expr: '4 − {r}',
        how: 'The other boxes have at least one capital letter, so they show the dominant trait.',
        note: (v: Values) => `(${fmt(v.t!)} tall to ${fmt(v.r!)} short)`,
      },
      r: { expr: '4 − {t}', how: 'The boxes that do not show the trait are the rest of the 4.' },
    },
  } satisfies Record<string, Record<string, StepText>>,
  variables: [
    { ...whole('a', 'a', 'Dominant alleles in the first parent', 0, 2), allowed: [0, 1, 2] },
    { ...whole('b', 'b', 'Dominant alleles in the second parent', 0, 2), allowed: [0, 1, 2] },
    { ...whole('r', 'r', 'Boxes with tt (short)', 0, 4), derived: true },
    { ...whole('t', 't', 'Boxes with a T (tall)', 0, 4), derived: true },
  ],
};

export const SCIENCE_7_MODULES: ModuleDef[] = [
  // ── Atoms, elements and molecules (MS-PS1-1): the main page is an explore (layouts) ──
  {
    id: 's.7.atoms-molecules~count-atoms',
    title: 'Counting atoms in molecules',
    use: 'Use this for “What atoms make up a molecule of water?” and “How many atoms are in 6 water molecules?”',
    unitSystems: ['metric'],
    assumptions: [
      'H₂O means 2 hydrogen atoms and 1 oxygen atom in each molecule; a small number counts the atom before it.',
      'Every water molecule is the same, so the atoms grow in step with the molecules.',
      'A count of atoms is a whole number.',
    ],
    variables: [
      whole('n', 'n', 'Molecules', 1, 24),
      { ...whole('h', 'h', 'Hydrogen atoms', 0, 48), derived: true },
      { ...whole('o', 'o', 'Oxygen atoms', 0, 24), derived: true },
      { ...whole('A', 'A', 'Atoms in all', 0, 72), derived: true },
    ],
    relations: [
      scaled('h', 2, 'n', [
        'Each water molecule has 2 hydrogen atoms: multiply by the molecules.',
        'Share the hydrogen atoms out, 2 to each molecule.',
      ]).relation,
      scaled('o', 1, 'n', [
        'Each water molecule has 1 oxygen atom.',
        'One molecule for each oxygen atom.',
      ]).relation,
      {
        id: 'A = h + o',
        display: '{A} = {h} + {o}',
        vars: ['A', 'h', 'o'],
        residual: (v: Values) => v.A! - v.h! - v.o!,
        solve: {
          A: (v: Values) => v.h! + v.o!,
          h: (v: Values) => v.A! - v.o!,
          o: (v: Values) => v.A! - v.h!,
        },
      },
    ],
    steps: {
      'h = 2 × n': scaled('h', 2, 'n', [
        'Each water molecule has 2 hydrogen atoms: multiply by the molecules.',
        'Share the hydrogen atoms out, 2 to each molecule.',
      ]).steps,
      'o = 1 × n': scaled('o', 1, 'n', [
        'Each water molecule has 1 oxygen atom.',
        'One molecule for each oxygen atom.',
      ]).steps,
      'A = h + o': {
        A: { expr: '{h} + {o}', how: 'Add the hydrogen atoms and the oxygen atoms.' },
        h: { expr: '{A} − {o}', how: 'The atoms that are not oxygen are hydrogen.' },
        o: { expr: '{A} − {h}', how: 'The atoms that are not hydrogen are oxygen.' },
      },
    },
    example: { n: 3, h: 6, o: 3, A: 9 },
    startWith: ['n'],
    representation: {
      kind: 'molecules',
      formula: 'H2O',
      count: 'n',
      name: 'water',
      atoms: { H: 'h', O: 'o' },
    },
  },

  // ── States of matter and phase changes (MS-PS1-4): the main page is an explore (layouts) ──
  {
    id: 's.7.phase-changes~heating-curve',
    title: 'Heating curve of water',
    use: 'Use this for “What is the temperature 30 minutes into heating the ice, and what state is it in?”',
    unitSystems: ['metric'],
    assumptions: [
      'Ice at −40 °C is heated at a steady rate on a hot plate.',
      'While it melts or boils the temperature stays flat: the heat changes the state instead of warming it.',
      'Melting takes 16 minutes here; boiling all the water away takes 108, because turning liquid into gas takes far more energy.',
      'Drag the point along the curve.',
    ],
    variables: [
      {
        id: 't',
        symbol: 't',
        name: 'Time heating',
        unit: 'min',
        units: ['min'],
        min: 0,
        max: 148,
        step: 0.5,
      },
      {
        id: 'T',
        symbol: 'T',
        name: 'Temperature',
        unit: '°C',
        min: -40,
        max: 100,
        derived: true,
      },
    ],
    relations: [
      {
        id: 'T = curve(t)',
        display: '{T} = the temperature on the curve at {t}',
        vars: ['T', 't'],
        residual: (v: Values) => v.T! - heatingTemp(ICE, v.t!),
        solve: { T: (v: Values) => heatingTemp(ICE, v.t!) },
        check: (v: Values) => {
          const [t, T] = [fmt(v.t!), fmt(v.T!)];
          return v.t! <= 4
            ? `${T} = 10 × ${t} − 40`
            : v.t! <= 20
              ? `${T} = 0`
              : v.t! <= 40
                ? `${T} = 5 × (${t} − 20)`
                : `${T} = 100`;
        },
      },
    ],
    steps: {
      'T = curve(t)': {
        T: {
          expr: (v: Values) =>
            v.t! <= 4 ? '10 × {t} − 40' : v.t! <= 20 ? '0' : v.t! <= 40 ? '5 × ({t} − 20)' : '100',
          how: (v: Values) =>
            v.t! <= 4
              ? 'The ice warms 10 °C a minute from −40 °C: the heat speeds its particles up.'
              : v.t! <= 20
                ? 'The ice is melting, so it stays at 0 °C: the heat breaks the particles out of their rows, not speeding them up.'
                : v.t! <= 40
                  ? 'The water warms 5 °C a minute from 0 °C, starting at 20 minutes.'
                  : 'The water is boiling, so it stays at 100 °C: the heat pulls the particles apart into gas.',
          note: (v: Values) => `(${stateAt(v.t!)})`,
        },
      },
    },
    example: { t: 30, T: 50 },
    startWith: ['t'],
    representation: {
      kind: 'heatingCurve',
      start: -40,
      melt: 0,
      boil: 100,
      spans: [4, 16, 20, 108],
      at: 't',
      temp: 'T',
      names: ['ice', 'water', 'steam'],
      formula: 'H2O',
    },
  },

  // ── Chemical reactions (MS-PS1-2, MS-PS1-5, MS-PS1-6) ──
  {
    id: 's.7.chemical-reactions',
    unitSystems: ['metric'],
    assumptions: [
      'In a chemical reaction atoms are not made or destroyed. They let go of each other and join in new ways.',
      'Balanced means each element has as many atoms after the arrow as before it: 2 H₂ + O₂ → 2 H₂O.',
      'The new substance has its own properties: water is a liquid that puts fires out, made from two gases that burn.',
      'Water molecules come in pairs here, because each O₂ brings two oxygen atoms.',
    ],
    variables: [
      { ...whole('c', 'c', 'Water molecules made', 2, 8), multipleOf: 2 },
      { ...whole('a', 'a', 'Hydrogen molecules used', 0, 8), derived: true },
      { ...whole('b', 'b', 'Oxygen molecules used', 0, 4), derived: true },
      atomCount('h1', 'h₁', 'Hydrogen atoms before'),
      atomCount('o1', 'o₁', 'Oxygen atoms before'),
      atomCount('h2', 'h₂', 'Hydrogen atoms after'),
      atomCount('o2', 'o₂', 'Oxygen atoms after'),
    ],
    relations: water.map((r) => r.relation),
    steps: Object.fromEntries(water.map((r) => [r.relation.id, r.steps])),
    example: { c: 4, a: 4, b: 2, h1: 8, o1: 4, h2: 8, o2: 4 },
    startWith: ['c'],
    representation: {
      kind: 'reaction',
      reactants: [
        { formula: 'H2', count: 'a' },
        { formula: 'O2', count: 'b' },
      ],
      products: [{ formula: 'H2O', count: 'c' }],
      atoms: { H: ['h1', 'h2'], O: ['o1', 'o2'] },
    },
  },
  {
    id: 's.7.chemical-reactions~rust',
    title: 'Iron rusting: iron and oxygen make iron oxide',
    use: 'Use this for “How many oxygen molecules react with 4 iron atoms to make rust?”',
    unitSystems: ['metric'],
    assumptions: [
      'Iron left in damp air slowly turns into rust, iron oxide: 4 Fe + 3 O₂ → 2 Fe₂O₃.',
      'Rust is a new substance: orange, crumbly and not magnetic, unlike grey, strong, magnetic iron.',
      'The rust weighs more than the iron did, by exactly the oxygen it took from the air.',
      'Two rust units at a time, because 3 O₂ carry 6 oxygen atoms.',
    ],
    variables: [
      { ...whole('c', 'c', 'Iron oxide units made', 2, 4), allowed: [2, 4] },
      { ...whole('a', 'a', 'Iron atoms used', 0, 8), derived: true },
      { ...whole('b', 'b', 'Oxygen molecules used', 0, 6), derived: true },
      atomCount('f1', 'i₁', 'Iron atoms before'),
      atomCount('o1', 'o₁', 'Oxygen atoms before'),
      atomCount('f2', 'i₂', 'Iron atoms after'),
      atomCount('o2', 'o₂', 'Oxygen atoms after'),
    ],
    relations: rust.map((r) => r.relation),
    steps: Object.fromEntries(rust.map((r) => [r.relation.id, r.steps])),
    example: { c: 2, a: 4, b: 3, f1: 4, o1: 6, f2: 4, o2: 6 },
    startWith: ['c'],
    representation: {
      kind: 'reaction',
      reactants: [
        { formula: 'Fe', count: 'a' },
        { formula: 'O2', count: 'b' },
      ],
      products: [{ formula: 'Fe2O3', count: 'c' }],
      atoms: { Fe: ['f1', 'f2'], O: ['o1', 'o2'] },
    },
  },
  {
    id: 's.7.chemical-reactions~methane',
    title: 'Burning methane',
    use: 'Use this for “Balance CH₄ + O₂ → CO₂ + H₂O” and “How many oxygen molecules does one methane molecule burn with?”',
    unitSystems: ['metric'],
    assumptions: [
      'Methane (natural gas) burns in oxygen to make carbon dioxide and water: CH₄ + 2 O₂ → CO₂ + 2 H₂O.',
      'Carbon first: one CO₂ per CH₄. Hydrogen next: 4 H make 2 H₂O. Oxygen last: 4 O need 2 O₂.',
      'The energy comes from the atoms forming new bonds, so the flame is hot.',
    ],
    variables: [
      whole('a', 'a', 'Methane molecules', 1, 4),
      { ...whole('b', 'b', 'Oxygen molecules', 0, 8), derived: true },
      { ...whole('c', 'c', 'Carbon dioxide molecules', 0, 4), derived: true },
      { ...whole('d', 'd', 'Water molecules', 0, 8), derived: true },
    ],
    relations: methane.map((r) => r.relation),
    steps: Object.fromEntries(methane.map((r) => [r.relation.id, r.steps])),
    example: { a: 1, b: 2, c: 1, d: 2 },
    startWith: ['a'],
    representation: {
      kind: 'reaction',
      reactants: [
        { formula: 'CH4', count: 'a' },
        { formula: 'O2', count: 'b' },
      ],
      products: [
        { formula: 'CO2', count: 'c' },
        { formula: 'H2O', count: 'd' },
      ],
    },
  },
  {
    id: 's.7.chemical-reactions~mass-conserved',
    title: 'Mass before and after a reaction',
    use: 'Use this for “20 g of A and 10 g of B react completely. How much C forms?” and “The sealed bottle weighed 230 g; opened, 228.5 g. How much gas escaped?”',
    unitSystems: ['metric'],
    assumptions: [
      'In a closed container the mass does not change in a reaction: the atoms are all still there.',
      'If a gas is made and escapes, the scale reads less by exactly the mass of the gas.',
      '20 g and 10 g reacting completely make 30 g of product, no more and no less.',
    ],
    variables: [
      {
        id: 'a',
        symbol: 'a',
        name: 'First substance',
        unit: 'g',
        units: ['g'],
        min: 0.1,
        max: 500,
        step: 0.1,
      },
      {
        id: 'b',
        symbol: 'b',
        name: 'Second substance',
        unit: 'g',
        units: ['g'],
        min: 0.1,
        max: 500,
        step: 0.1,
      },
      {
        id: 's',
        symbol: 's',
        name: 'Mass before, sealed',
        unit: 'g',
        units: ['g'],
        min: 0.2,
        max: 1000,
        step: 0.1,
        derived: true,
      },
      {
        id: 'r',
        symbol: 'r',
        name: 'Mass after opening',
        unit: 'g',
        units: ['g'],
        min: 0,
        max: 1000,
        step: 0.1,
      },
      {
        id: 'e',
        symbol: 'e',
        name: 'Gas that escaped',
        unit: 'g',
        units: ['g'],
        min: 0,
        max: 500,
        step: 0.1,
      },
    ],
    relations: [
      {
        id: 's = a + b',
        display: '{s} = {a} + {b}',
        vars: ['s', 'a', 'b'],
        residual: (v: Values) => v.s! - v.a! - v.b!,
        solve: {
          s: (v: Values) => v.a! + v.b!,
          a: (v: Values) => v.s! - v.b!,
          b: (v: Values) => v.s! - v.a!,
        },
      },
      atLeast('s', 'r'),
      {
        id: 'e = s − r',
        display: '{e} = {s} − {r}',
        vars: ['e', 's', 'r'],
        residual: (v: Values) => v.e! - v.s! + v.r!,
        solve: {
          e: (v: Values) => v.s! - v.r!,
          s: (v: Values) => v.e! + v.r!,
          r: (v: Values) => v.s! - v.e!,
        },
      },
    ],
    steps: {
      's = a + b': {
        s: {
          expr: '{a} + {b}',
          how: 'Sealed, everything that went in is still on the scale: add the two masses.',
        },
        a: { expr: '{s} − {b}', how: 'Take the second substance away from the total.' },
        b: { expr: '{s} − {a}', how: 'Take the first substance away from the total.' },
      },
      's ≥ r': {},
      'e = s − r': {
        e: {
          expr: '{s} − {r}',
          how: 'The scale reads less after opening by exactly the gas that left.',
        },
        s: { expr: '{e} + {r}', how: 'Put the escaped gas back: the reading before opening.' },
        r: { expr: '{s} − {e}', how: 'Take the escaped gas off the sealed reading.' },
      },
    },
    example: { a: 30, b: 200, s: 230, r: 228.5, e: 1.5 },
    startWith: ['a', 'b', 'r'],
    representation: { kind: 'scale', items: ['a', 'b'], total: 'r', before: 's', max: 1000 },
  },

  // ── Energy flow and matter cycling in ecosystems (MS-LS2-3) ──
  {
    id: 's.7.ecosystem-energy',
    unitSystems: ['metric'],
    assumptions: [
      'Producers store the sun’s energy as sugar. Each level above eats the level below.',
      'About 10% of the energy at one level is stored in the next; the rest is used for moving, growing and staying warm, or lost as heat.',
      'That is why a pond has far more algae than fish, and few top predators.',
      'Energy flows one way, up and out as heat. Matter cycles round and round (see the carbon cycle).',
    ],
    variables: [
      { ...energy('E1', 'E₁', 'Energy in the producers', false), step: 100 },
      {
        id: 'p',
        symbol: 'p',
        name: 'Percent passed up',
        unit: '%',
        min: 1,
        max: 100,
        step: 1,
        allowed: [5, 10, 15, 20],
      },
      energy('E2', 'E₂', 'Energy in the first consumers'),
      energy('E3', 'E₃', 'Energy in the second consumers'),
      energy('E4', 'E₄', 'Energy in the top consumers'),
    ],
    relations: [passUp('E2', 'E1'), passUp('E3', 'E2'), passUp('E4', 'E3')],
    steps: {
      'E2 = E1 × p ÷ 100': passUpSteps('E2', 'E1', 'in the producers'),
      'E3 = E2 × p ÷ 100': passUpSteps('E3', 'E2', 'in the first consumers'),
      'E4 = E3 × p ÷ 100': passUpSteps('E4', 'E3', 'in the second consumers'),
    },
    example: { E1: 10000, p: 10, E2: 1000, E3: 100, E4: 10 },
    startWith: ['E1', 'p'],
    representation: {
      kind: 'energyPyramid',
      levels: ['E1', 'E2', 'E3', 'E4'],
      percent: 'p',
      names: ['algae', 'water insects', 'small fish', 'herons'],
    },
  },

  // ── Genes, alleles and Punnett squares (MS-LS3-2) ──
  {
    id: 's.7.punnett-squares',
    unitSystems: ['metric'],
    assumptions: [
      'Each parent has two alleles for a gene and passes one, at random, to each child.',
      'A capital letter is the dominant allele: one is enough to show the trait. The recessive trait shows only with two small letters.',
      'Here T is tall and t is short in pea plants: TT and Tt are tall, tt is short.',
      'The 4 boxes are the 4 equally likely combinations; a percent is a chance, not a promise, for any one child.',
    ],
    variables: [
      ...punnett.variables,
      {
        id: 'P',
        symbol: 'P',
        name: 'Chance of tall',
        unit: '%',
        min: 0,
        max: 100,
        step: 25,
        derived: true,
      },
    ],
    relations: [
      punnett.recessive,
      punnett.dominant,
      {
        id: 'P = t × 25',
        display: '{P} = {t} × 25',
        vars: ['P', 't'],
        residual: (v: Values) => v.P! - 25 * v.t!,
        solve: { P: (v: Values) => 25 * v.t!, t: (v: Values) => v.P! / 25 },
      },
    ],
    steps: {
      ...punnett.steps,
      'P = t × 25': {
        P: { expr: '{t} × 25', how: 'Each of the 4 boxes is equally likely: 25% each.' },
        t: { expr: '{P} ÷ 25', how: 'Each box is 25%, so divide the chance by 25.' },
      },
    },
    example: { a: 1, b: 1, r: 1, t: 3, P: 75 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'punnettSquare',
      first: 'a',
      second: 'b',
      dominant: 't',
      recessive: 'r',
      letter: 'T',
    },
  },
  {
    id: 's.7.punnett-squares~expected',
    title: 'How many offspring to expect',
    use: 'Use this for “Two Tt plants produce 40 seeds. About how many seedlings will be tall?”',
    unitSystems: ['metric'],
    assumptions: [
      'Expected means on average over many offspring. Real counts come out a little off, as coin flips do.',
      'T is tall and t is short: TT and Tt are tall, tt is short.',
      'Offspring come in fours here so the boxes share evenly.',
    ],
    variables: [
      ...punnett.variables,
      { ...whole('N', 'N', 'Offspring', 4, 400), multipleOf: 4 },
      { ...whole('n', 'n', 'Expected to show the trait', 0, 400), derived: true },
    ],
    relations: [
      punnett.recessive,
      punnett.dominant,
      {
        id: 'n = N × t ÷ 4',
        display: '{n} = {N} × {t} ÷ 4',
        vars: ['n', 'N', 't'],
        residual: (v: Values) => 4 * v.n! - v.N! * v.t!,
        solve: {
          n: (v: Values) => (v.N! * v.t!) / 4,
          N: (v: Values) => div(4 * v.n!, v.t!),
          t: (v: Values) => div(4 * v.n!, v.N!),
        },
      },
    ],
    steps: {
      ...punnett.steps,
      'n = N × t ÷ 4': {
        n: {
          expr: '{N} × {t} ÷ 4',
          how: 'Each box is a quarter of the offspring: t quarters of N show the trait.',
        },
        N: {
          expr: '4 × {n} ÷ {t}',
          how: 'Each of the t boxes holds n ÷ t offspring; there are 4 boxes.',
        },
        t: { expr: '4 × {n} ÷ {N}', how: 'The share showing the trait, as boxes out of 4.' },
      },
    },
    example: { a: 1, b: 1, r: 1, t: 3, N: 40, n: 30 },
    startWith: ['a', 'b', 'N'],
    representation: {
      kind: 'punnettSquare',
      first: 'a',
      second: 'b',
      dominant: 't',
      recessive: 'r',
      letter: 'T',
    },
  },

  // ── Natural selection (MS-LS4-4, MS-LS4-6) ──
  {
    id: 's.7.natural-selection',
    unitSystems: ['metric'],
    assumptions: [
      'Beetles vary: some are brown, some green. Birds see green beetles on brown bark more easily and eat more of them.',
      'Brown beetles survive and breed more, so each generation has more brown beetles than the one before.',
      'The population stays the same size, and here it gains the same number of brown beetles each generation: a simple model of an average.',
      'Nobody chooses to turn brown. The environment favors the beetles that already are.',
    ],
    variables: [
      whole('N', 'N', 'Beetles in each generation', 10, 100),
      whole('b1', 'b₁', 'Brown beetles in generation 1', 0, 100),
      whole('d', 'd', 'More brown beetles each generation', 0, 30),
      { ...whole('b2', 'b₂', 'Brown beetles in generation 2', 0, 100), derived: true },
      { ...whole('b3', 'b₃', 'Brown beetles in generation 3', 0, 100), derived: true },
      { ...whole('b4', 'b₄', 'Brown beetles in generation 4', 0, 100), derived: true },
      { ...whole('b5', 'b₅', 'Brown beetles in generation 5', 0, 100), derived: true },
    ],
    relations: [
      gainRel('b2', 'b1'),
      gainRel('b3', 'b2'),
      gainRel('b4', 'b3'),
      gainRel('b5', 'b4'),
      atLeast('N', 'b5'),
    ],
    steps: {
      'b2 = b1 + d': gainSteps('b2', 'b1'),
      'b3 = b2 + d': gainSteps('b3', 'b2'),
      'b4 = b3 + d': gainSteps('b4', 'b3'),
      'b5 = b4 + d': gainSteps('b5', 'b4'),
      'N ≥ b5': {},
    },
    example: { N: 20, b1: 2, d: 4, b2: 6, b3: 10, b4: 14, b5: 18 },
    startWith: ['N', 'b1', 'd'],
    representation: {
      kind: 'generations',
      counts: [['b1'], ['b2'], ['b3'], ['b4'], ['b5']],
      total: 'N',
      colors: ['brown', 'green'],
      names: ['brown beetles', 'green beetles'],
    },
  },
];
