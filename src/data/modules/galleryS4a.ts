/**
 * Gallery demos for the Grade 7–8 chemistry pictures (molecules, reactions, heating curves,
 * the periodic table) and their explore figures. Spread into GALLERY_MODULES and
 * GALLERY_LAYOUTS in gallery.ts; kept apart so that file's other demos merge easily.
 */
import { formatNumber } from '@/engine/format';
import type { Relation, Values } from '@/engine/types';

import { groupOf, heatingCorners, heatingTemp, periodOf } from '@/components/module/reps/chem';

import { div, whole } from './helpers';
import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

/** total = each × n, solvable for the total and for n. */
const perParticle = (
  total: string,
  each: number,
  n: string,
  what: string,
): { relation: Relation; steps: Record<string, StepText> } => {
  const id = `${total} = ${each} × ${n}`;
  return {
    relation: {
      id,
      display: `{${total}} = ${each} × {${n}}`,
      vars: [total, n],
      residual: (v: Values) => v[total]! - each * v[n]!,
      solve: { [total]: (v: Values) => each * v[n]!, [n]: (v: Values) => div(v[total]!, each) },
    },
    steps: {
      [total]: {
        expr: `${each} × {${n}}`,
        how: `Each molecule has ${each} ${what} atom${each === 1 ? '' : 's'}: multiply by the molecules.`,
      },
      [n]: {
        expr: `{${total}} ÷ ${each}`,
        how: `Share the ${what} atoms out, ${each} to each molecule.`,
      },
    },
  };
};

/** A demo counting the atoms in n molecules of one formula. */
const moleculeCount = (
  id: string,
  title: string,
  formula: string,
  name: string,
  atoms: [string, string, string, number][],
  n: number,
): ModuleDef => {
  const rels = atoms.map(([el, v, what, each]) => ({ el, v, ...perParticle(v, each, 'n', what) }));
  return {
    id,
    title,
    notation: 'letters',
    assumptions: [
      'A molecule is atoms joined together; each ball is one atom.',
      'The colors are the classroom ones: hydrogen white, carbon black, oxygen red, nitrogen blue.',
    ],
    variables: [
      whole('n', 'n', 'Molecules', 1, 24),
      ...atoms.map(([el, v, what, each]) => ({
        ...whole(v, el, `${what[0]!.toUpperCase()}${what.slice(1)} atoms`, 0, 24 * each),
        derived: true,
      })),
    ],
    relations: rels.map((r) => r.relation),
    steps: Object.fromEntries(rels.map((r) => [r.relation.id, r.steps])),
    example: { n, ...Object.fromEntries(atoms.map(([, v, , each]) => [v, each * n])) },
    startWith: ['n'],
    sliders: true,
    representation: {
      kind: 'molecules',
      formula,
      count: 'n',
      name,
      atoms: Object.fromEntries(atoms.map(([el, v]) => [el, v])),
    },
  };
};

export const S4A_GALLERY_MODULES: ModuleDef[] = [
  moleculeCount(
    'g.water-molecules',
    'Water molecules',
    'H2O',
    'water',
    [
      ['H', 'h', 'hydrogen', 2],
      ['O', 'o', 'oxygen', 1],
    ],
    3,
  ),
  moleculeCount(
    'g.carbon-dioxide-molecules',
    'Carbon dioxide molecules',
    'CO2',
    'carbon dioxide',
    [
      ['C', 'c', 'carbon', 1],
      ['O', 'o', 'oxygen', 2],
    ],
    4,
  ),
  moleculeCount(
    'g.oxygen-molecules',
    'Oxygen molecules',
    'O2',
    'oxygen gas',
    [['O', 'o', 'oxygen', 2]],
    5,
  ),
];

/** id = k × other (atoms of one element in k particles), solvable both ways. */
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

const coefficient = (id: string, name: string) => whole(id, id, name, 0, 8);
const atomCount = (id: string, symbol: string, name: string) => ({
  ...whole(id, symbol, name, 0, 64),
  derived: true,
});

/** H₂ + O₂ → H₂O with the three numbers typed freely: the atoms counted on each side. */
const waterAtoms = [
  scaled('hb', 2, 'a', [
    'Each H₂ molecule has 2 hydrogen atoms.',
    'Share the hydrogen atoms out, 2 to each H₂.',
  ]),
  scaled('ob', 2, 'b', [
    'Each O₂ molecule has 2 oxygen atoms.',
    'Share the oxygen atoms out, 2 to each O₂.',
  ]),
  scaled('ha', 2, 'c', [
    'Each H₂O molecule has 2 hydrogen atoms.',
    'Share the hydrogen atoms out, 2 to each H₂O.',
  ]),
  scaled('oa', 1, 'c', [
    'Each H₂O molecule has 1 oxygen atom.',
    'One water molecule for each oxygen atom.',
  ]),
];

/** CH₄ + O₂ → CO₂ + H₂O kept balanced: carbon, hydrogen and oxygen each the same both sides. */
const methane: { relation: Relation; steps: Record<string, StepText> }[] = [
  scaled('c', 1, 'a', [
    'Carbon balances: one CO₂ for each CH₄.',
    'Carbon balances: one CH₄ for each CO₂.',
  ]),
  scaled('d', 2, 'a', [
    'Hydrogen balances: each CH₄ has 4 hydrogen atoms, each H₂O 2.',
    'Hydrogen balances: 2 H₂O for each CH₄.',
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
        how: 'Oxygen balances: count the oxygen atoms after, 2 in each O₂.',
      },
      c: {
        expr: '(2 × {b} − {d}) ÷ 2',
        how: 'Oxygen balances: the oxygen left after the water, 2 in each CO₂.',
      },
      d: { expr: '2 × {b} − 2 × {c}', how: 'Oxygen balances: the oxygen left after the CO₂.' },
    },
  },
];

S4A_GALLERY_MODULES.push(
  {
    id: 'g.balance-water',
    title: 'Balancing a reaction',
    notation: 'letters',
    assumptions: [
      'Hydrogen and oxygen react to make water. Type the number of each molecule.',
      'Balanced means each element has as many atoms after the arrow as before it.',
    ],
    standalone: {
      vars: ['a', 'b', 'hb', 'ob'],
      why: 'Each number of molecules is typed on its own, to see whether the atoms balance.',
    },
    variables: [
      coefficient('a', 'H₂ molecules'),
      coefficient('b', 'O₂ molecules'),
      coefficient('c', 'H₂O molecules'),
      atomCount('hb', 'h₁', 'Hydrogen atoms before'),
      atomCount('ob', 'o₁', 'Oxygen atoms before'),
      atomCount('ha', 'h₂', 'Hydrogen atoms after'),
      atomCount('oa', 'o₂', 'Oxygen atoms after'),
    ],
    relations: waterAtoms.map((r) => r.relation),
    steps: Object.fromEntries(waterAtoms.map((r) => [r.relation.id, r.steps])),
    example: { a: 2, b: 2, c: 2, hb: 4, ob: 4, ha: 4, oa: 2 },
    startWith: ['a', 'b', 'c'],
    representation: {
      kind: 'reaction',
      reactants: [
        { formula: 'H2', count: 'a' },
        { formula: 'O2', count: 'b' },
      ],
      products: [{ formula: 'H2O', count: 'c' }],
      atoms: { H: ['hb', 'ha'], O: ['ob', 'oa'] },
    },
  },
  {
    id: 'g.burning-methane',
    title: 'Burning methane',
    notation: 'letters',
    assumptions: [
      'Methane burns in oxygen to make carbon dioxide and water.',
      'Every atom before the arrow is still there after it, joined in new ways.',
    ],
    variables: [
      coefficient('a', 'CH₄ molecules'),
      coefficient('b', 'O₂ molecules'),
      coefficient('c', 'CO₂ molecules'),
      coefficient('d', 'H₂O molecules'),
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
);

/** Ice from −40 °C heated at a steady rate: the times match water's heats (21 J/g a minute). */
const ICE = heatingCorners(-40, 0, 100, [4, 16, 20, 108]);

S4A_GALLERY_MODULES.push({
  id: 'g.heating-curve',
  title: 'Heating curve',
  notation: 'letters',
  assumptions: [
    'Ice at −40 °C is heated at a steady rate until all of it has boiled away.',
    'While it melts or boils, the heat goes into changing the state, not into warming.',
    'Drag the point along the curve.',
  ],
  variables: [
    { id: 't', symbol: 't', name: 'Time in minutes', min: 0, max: 148, step: 0.5 },
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
        const [t, T] = [formatNumber(v.t!), formatNumber(v.T!)];
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
            ? 'The ice warms 10 °C a minute from −40 °C.'
            : v.t! <= 20
              ? 'The ice is melting: it stays at 0 °C.'
              : v.t! <= 40
                ? 'The water warms 5 °C a minute from 0 °C, starting at 20 min.'
                : 'The water is boiling: it stays at 100 °C.',
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
});

/** An element's group or period, read off the table: solvable only for the group or period. */
const placeOn = (
  id: string,
  what: 'group' | 'period',
  of: (z: number) => number | undefined,
): { relation: Relation; steps: Record<string, StepText> } => ({
  relation: {
    id: `${id} = ${what} of Z`,
    display: `{${id}} = the ${what} of element {Z}`,
    vars: [id, 'Z'],
    // The lanthanides and actinides have no group here: nothing to check.
    residual: (v: Values) => (of(v.Z!) === undefined ? 0 : v[id]! - of(v.Z!)!),
    solve: { [id]: (v: Values) => of(v.Z!), Z: () => undefined },
    check: (v: Values) => `${formatNumber(v[id]!)} = ${formatNumber(of(v.Z!) ?? NaN)}`,
  },
  steps: {
    [id]: {
      expr: (v: Values) => formatNumber(of(v.Z!) ?? NaN),
      how:
        what === 'group'
          ? 'Find the element on the table and read the number at the top of its column.'
          : 'Find the element on the table and read the number at the start of its row.',
    },
  },
});

const tablePlace = [placeOn('g', 'group', groupOf), placeOn('p', 'period', periodOf)];

S4A_GALLERY_MODULES.push({
  id: 'g.periodic-table',
  title: 'Periodic table',
  notation: 'letters',
  assumptions: [
    'Elements are in order of atomic number: the number of protons in one atom.',
    'A column is a group, a row is a period. Tap an element.',
    'The two rows under the table belong in periods 6 and 7; they have no group number here.',
  ],
  variables: [
    whole('Z', 'Z', 'Atomic number', 1, 118),
    { ...whole('g', 'g', 'Group', 1, 18), derived: true },
    { ...whole('p', 'p', 'Period', 1, 7), derived: true },
  ],
  relations: tablePlace.map((r) => r.relation),
  steps: Object.fromEntries(tablePlace.map((r) => [r.relation.id, r.steps])),
  example: { Z: 8, g: 16, p: 2 },
  startWith: ['Z'],
  representation: { kind: 'periodicTable', element: 'Z', families: true },
});

export const S4A_GALLERY_LAYOUTS: LayoutDef[] = [
  {
    id: 'g.molecule-models',
    title: 'Molecule models',
    kind: 'explore',
    assumptions: [
      'Each ball is an atom; each stick is a bond.',
      'Hydrogen is white, carbon black, oxygen red, nitrogen blue.',
    ],
    figure: { kind: 'molecules' },
    scenes: [
      {
        label: 'Water',
        lines: ['Two hydrogen atoms joined to one oxygen atom.'],
        molecules: { items: [{ formula: 'H2O' }] },
      },
      {
        label: 'Carbon dioxide',
        lines: ['One carbon atom between two oxygen atoms.'],
        molecules: { items: [{ formula: 'CO2' }] },
      },
      {
        label: 'Oxygen',
        lines: ['Two oxygen atoms: an element, one kind of atom.'],
        molecules: { items: [{ formula: 'O2' }] },
      },
      {
        label: 'Methane',
        lines: ['One carbon atom with four hydrogen atoms.'],
        molecules: { items: [{ formula: 'CH4' }] },
      },
      {
        label: 'Ammonia',
        lines: ['One nitrogen atom with three hydrogen atoms.'],
        molecules: { items: [{ formula: 'NH3' }] },
      },
      {
        label: 'Iron',
        lines: ['A solid element: every ball is the same kind of atom.'],
        molecules: { items: [{ formula: 'Fe', count: 24 }], state: 'solid' },
      },
      {
        label: 'Water, liquid',
        lines: ['A compound: every molecule is the same, two kinds of atom in each.'],
        molecules: { items: [{ formula: 'H2O', count: 14 }], state: 'liquid' },
      },
      {
        label: 'Air',
        lines: ['A mixture of gases: nitrogen and oxygen molecules, far apart.'],
        molecules: {
          items: [
            { formula: 'N2', count: 8 },
            { formula: 'O2', count: 2 },
          ],
          state: 'gas',
        },
      },
      {
        label: 'Reaction',
        lines: ['Hydrogen and oxygen become water: the same atoms, joined in new ways.'],
        molecules: {
          items: [
            { formula: 'H2', count: 4 },
            { formula: 'O2', count: 2 },
          ],
          after: [{ formula: 'H2O', count: 4 }],
          state: 'gas',
        },
      },
    ],
  },
  {
    id: 'g.phases',
    title: 'States of matter',
    kind: 'explore',
    assumptions: [
      'The same particles in each box: only how close and how fast they move changes.',
      'The arrows over the boxes take in heat; the arrows under them give heat out.',
    ],
    figure: { kind: 'phases' },
    scenes: [
      {
        label: 'Solid',
        lines: ['Packed in rows; each particle only wiggles in place.'],
        phase: { state: 'solid', formula: 'H2O' },
      },
      {
        label: 'Melting',
        lines: ['Heat loosens the rows: the solid becomes a liquid.'],
        phase: { state: 'liquid', change: 'melting', formula: 'H2O' },
      },
      {
        label: 'Boiling',
        lines: ['The particles break away and fly apart as a gas.'],
        phase: { state: 'gas', change: 'boiling', formula: 'H2O' },
      },
      {
        label: 'Evaporation',
        lines: ['Particles leave the surface of a liquid, below its boiling point too.'],
        phase: { state: 'gas', change: 'evaporation', formula: 'H2O' },
      },
      {
        label: 'Condensation',
        lines: ['A gas cools and its particles gather into a liquid.'],
        phase: { state: 'liquid', change: 'condensation', formula: 'H2O' },
      },
      {
        label: 'Freezing',
        lines: ['A liquid cools and its particles settle into rows.'],
        phase: { state: 'solid', change: 'freezing', formula: 'H2O' },
      },
      {
        label: 'Sublimation',
        lines: ['A solid turns straight into a gas, as dry ice does.'],
        phase: { state: 'gas', change: 'sublimation' },
      },
      {
        label: 'Deposition',
        lines: ['A gas turns straight into a solid, as frost does.'],
        phase: { state: 'solid', change: 'deposition', formula: 'H2O' },
      },
    ],
  },
  {
    id: 'g.periodic-table-figure',
    title: 'Periodic table figure',
    kind: 'explore',
    assumptions: ['A column is a group; a row is a period.', 'Elements in a group behave alike.'],
    figure: { kind: 'periodicTable' },
    scenes: [
      { label: 'Oxygen', lines: ['Oxygen, atomic number 8.'], elements: { element: 'O' } },
      {
        label: 'Group 1',
        lines: ['Group 1: hydrogen and the alkali metals.'],
        elements: { group: 1 },
      },
      { label: 'Period 3', lines: ['Period 3: sodium to argon.'], elements: { period: 3 } },
      {
        label: 'Families',
        lines: ['Metals on the left, nonmetals on the right, metalloids between.'],
        elements: { families: true },
      },
      {
        label: 'Like argon',
        lines: ['Helium, neon and argon: noble gases, in one group.'],
        elements: { element: 'Ar', ring: ['He', 'Ne'], families: true },
      },
    ],
  },
  {
    id: 'g.molecule-cards',
    title: 'Molecule cards',
    kind: 'sort',
    assumptions: ['An element has one kind of atom.', 'A compound has two or more kinds joined.'],
    question: 'Element or compound?',
    bins: [
      { id: 'element', label: 'Element', why: 'Every atom in it is the same kind.' },
      { id: 'compound', label: 'Compound', why: 'It joins atoms of different kinds.' },
    ],
    cards: [
      { label: 'Water', bin: 'compound', figure: { kind: 'molecule', formula: 'H2O' } },
      { label: 'Oxygen', bin: 'element', figure: { kind: 'molecule', formula: 'O2' } },
      { label: 'Carbon dioxide', bin: 'compound', figure: { kind: 'molecule', formula: 'CO2' } },
      { label: 'Iron', bin: 'element', figure: { kind: 'molecule', formula: 'Fe' } },
      { label: 'Table salt', bin: 'compound', figure: { kind: 'molecule', formula: 'NaCl' } },
      { label: 'Nitrogen', bin: 'element', figure: { kind: 'molecule', formula: 'N2' } },
      { label: 'Methane', bin: 'compound', figure: { kind: 'molecule', formula: 'CH4' } },
      { label: 'Ammonia', bin: 'compound', figure: { kind: 'molecule', formula: 'NH3' } },
    ],
  },
];
