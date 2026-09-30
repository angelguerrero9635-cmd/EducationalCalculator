/**
 * Grades 9–12 round 2 gallery demos (group H2E: biology and sorts (H100, H104); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in. Spread into
 * gallery.ts.
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

/** A whole-number count. */
const count = (
  id: string,
  symbol: string,
  name: string,
  min = 0,
  max = 40,
  derived = false,
): VariableDef => ({
  id,
  symbol,
  name,
  min,
  max,
  step: 1,
  integer: true,
  ...(derived ? { derived: true } : {}),
});

/** out = a − k, both ways. */
const less = (out: string, a: string, k: number, how: string, back: string): Rule => ({
  relation: {
    id: `${out} = ${a} − ${k}`,
    display: `{${out}} = {${a}} − ${k}`,
    vars: [out, a],
    residual: (v) => v[out]! - (v[a]! - k),
    solve: { [out]: (v) => v[a]! - k, [a]: (v) => v[out]! + k },
  },
  steps: {
    [out]: { expr: `{${a}} − ${k}`, how },
    [a]: { expr: `{${out}} + ${k}`, how: back },
  },
});

/** out = a, both ways. */
const same = (out: string, a: string, how: string, back: string): Rule => ({
  relation: {
    id: `${out} = ${a}`,
    display: `{${out}} = {${a}}`,
    vars: [out, a],
    residual: (v) => v[out]! - v[a]!,
    solve: { [out]: (v) => v[a]!, [a]: (v) => v[out]! },
  },
  steps: {
    [out]: { expr: `{${a}}`, how },
    [a]: { expr: `{${out}}`, how: back },
  },
});

// ─── H100 part 1: macromolecules as a calculator picture ─────────────────────

/** M = n × m − 18 × w: the polymer's mass, the monomers' less the water given off. */
const polymerMass: Rule = {
  relation: {
    id: 'M = n × m − 18 × w',
    display: '{M} = {n} × {m} − 18 × {w}',
    vars: ['M', 'n', 'm', 'w'],
    residual: (v) => v.M! - (v.n! * v.m! - 18 * v.w!),
    solve: {
      M: (v) => v.n! * v.m! - 18 * v.w!,
      m: (v) => (v.M! + 18 * v.w!) / v.n!,
    },
  },
  steps: {
    M: {
      expr: '{n} × {m} − 18 × {w}',
      how: 'Add the monomers’ masses, then take away 18 g/mol for each water molecule given off.',
    },
    m: {
      expr: '({M} + 18 × {w}) ÷ {n}',
      how: 'Put the water back on, then share the mass among the monomers.',
    },
  },
};

/** The dehydration page: n monomers of mass m into a chain, b bonds, w water, mass M. */
const dehydrationDemo = (
  id: string,
  title: string,
  macro: 'carbohydrate' | 'protein' | 'nucleicAcid',
  monomer: string,
  n: number,
  m: number,
  extra: string,
): ModuleDef => ({
  id,
  title,
  use: 'Use this for “How many water molecules leave, and what is the polymer’s mass?”',
  unitSystems: ['metric'],
  assumptions: [
    'Each bond joining two monomers gives off one water molecule, 18 g/mol.',
    'The monomers form one chain, not a ring, so a chain of n units has n − 1 bonds.',
    extra,
  ],
  variables: [
    count('n', 'n', `${monomer} joined`, 2, 1000),
    count('b', 'b', 'Bonds formed', 1, 999, true),
    count('w', 'w', 'Water molecules given off', 1, 999, true),
    {
      id: 'm',
      symbol: 'm',
      name: `Mass of one ${monomer.toLowerCase().replace(/s$/, '')}`,
      unit: 'g/mol',
      min: 50,
      max: 1000,
      step: 1,
    },
    {
      id: 'M',
      symbol: 'M',
      name: 'Mass of the polymer',
      unit: 'g/mol',
      min: 0,
      max: 1_000_000,
      step: 1,
      derived: true,
    },
  ],
  ...rules(
    less('b', 'n', 1, 'A chain has one bond fewer than its units.', 'One more unit than bonds.'),
    same('w', 'b', 'Every bond gives off one water molecule.', 'One bond for each water molecule.'),
    polymerMass,
  ),
  example: { n, b: n - 1, w: n - 1, m, M: n * m - 18 * (n - 1) },
  startWith: ['n', 'm'],
  representation: { kind: 'macromolecules', macro, count: 'n', bonds: 'b', water: 'w' },
});

const MACRO_DEMOS: ModuleDef[] = [
  dehydrationDemo(
    'g.s9-biomolecules-dehydration',
    'Dehydration synthesis: water and mass',
    'carbohydrate',
    'Glucose molecules',
    3,
    180,
    'Glucose is 180 g/mol; two glucose make maltose, 342 g/mol.',
  ),
  dehydrationDemo(
    'g.s9-biomolecules-dehydration-long',
    'A long chain: a protein',
    'protein',
    'Amino acids',
    300,
    110,
    'An average amino acid is about 110 g/mol; a protein chain is hundreds long.',
  ),
];

export const HS2E_GALLERY_MODULES: ModuleDef[] = [...MACRO_DEMOS];

export const HS2E_GALLERY_LAYOUTS: LayoutDef[] = [];
