/**
 * Gallery demos for the Grade 7–8 chemistry pictures (molecules, reactions, heating curves,
 * the periodic table) and their explore figures. Spread into GALLERY_MODULES and
 * GALLERY_LAYOUTS in gallery.ts; kept apart so that file's other demos merge easily.
 */
import type { Relation, Values } from '@/engine/types';

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

export const S4A_GALLERY_LAYOUTS: LayoutDef[] = [];
