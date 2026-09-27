/**
 * Gallery demos for the Grade 7–8 chemistry pictures (molecules, reactions, heating curves,
 * the periodic table) and their explore figures. Spread into GALLERY_MODULES and
 * GALLERY_LAYOUTS in gallery.ts; kept apart so that file's other demos merge easily.
 */
import { formatNumber } from '@/engine/format';
import type { Relation, Values } from '@/engine/types';

import { heatingCorners, heatingTemp } from '@/components/module/reps/chem';

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

export const S4A_GALLERY_LAYOUTS: LayoutDef[] = [];
