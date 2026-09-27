/**
 * Gallery demos for the Grade 7 life science pictures: an energy pyramid, a beetle population
 * over generations, and (explore figures) a leaf and a cell with their inputs and outputs, the
 * carbon cycle and a pedigree chart. Spread into gallery.ts; kept apart so that file's other
 * demos merge easily.
 */
import type { Values } from '@/engine/types';

import { whole } from './helpers';
import type { LayoutDef } from './layouts';
import type { ModuleDef } from './types';

/** Energy at a feeding level, in kilocalories. */
const energy = (id: string, symbol: string, name: string) => ({
  id,
  symbol,
  name,
  unit: 'kcal',
  min: 0,
  max: 1000000,
  step: 0.01,
});

/** Level `up` keeps p% of level `down`: up = down × p ÷ 100 (and back). */
const passUp = (up: string, down: string) => ({
  id: `${up} = ${down} × p ÷ 100`,
  display: `{${down}} × {p} ÷ 100 = {${up}}`,
  vars: [up, down, 'p'],
  residual: (v: Values) => v[up]! - (v[down]! * v.p!) / 100,
  solve: {
    [up]: (v: Values) => (v[down]! * v.p!) / 100,
    [down]: (v: Values) => (v.p! === 0 ? undefined : (v[up]! * 100) / v.p!),
    p: (v: Values) => (v[down]! === 0 ? undefined : (v[up]! * 100) / v[down]!),
  },
});

const passUpSteps = (up: string, down: string, what: string) => ({
  [up]: { expr: `{${down}} × {p} ÷ 100`, how: `Take the percent passed up of the energy ${what}.` },
  [down]: {
    expr: `{${up}} × 100 ÷ {p}`,
    how: 'Undo taking the percent: times 100, then divide by the percent.',
  },
  p: {
    expr: `{${up}} ÷ {${down}} × 100`,
    how: 'The level above out of the level below, as a percent.',
  },
});

/** Brown beetles in generation i + 1: the generation before, plus the gain each generation. */
const gain = (next: string, prev: string) => ({
  id: `${next} = ${prev} + d`,
  display: `{${prev}} + {d} = {${next}}`,
  vars: [next, prev, 'd'],
  residual: (v: Values) => v[next]! - v[prev]! - v.d!,
  solve: {
    [next]: (v: Values) => v[prev]! + v.d!,
    [prev]: (v: Values) => v[next]! - v.d!,
    d: (v: Values) => v[next]! - v[prev]!,
  },
});

/** Green beetles are the rest of the population: g = N − b. */
const rest = (g: string, b: string) => ({
  id: `${g} = N − ${b}`,
  display: `{N} − {${b}} = {${g}}`,
  vars: [g, 'N', b],
  residual: (v: Values) => v[g]! - v.N! + v[b]!,
  solve: {
    [g]: (v: Values) => v.N! - v[b]!,
    N: (v: Values) => v[g]! + v[b]!,
    [b]: (v: Values) => v.N! - v[g]!,
  },
});

export const S4B_GALLERY_MODULES: ModuleDef[] = [
  {
    id: 'g.energy-pyramid',
    title: 'Energy pyramid',
    assumptions: [
      'Each level keeps about 10% of the energy of the level below it.',
      'The rest is used for living or lost as heat.',
      'The tiers are drawn to scale, so the top ones are thin.',
    ],
    variables: [
      energy('E1', 'E₁', 'Energy in the producers'),
      { id: 'p', symbol: 'p', name: 'Percent passed up', unit: '%', min: 1, max: 100, step: 1 },
      energy('E2', 'E₂', 'Energy in the first consumers'),
      energy('E3', 'E₃', 'Energy in the second consumers'),
      energy('E4', 'E₄', 'Energy in the third consumers'),
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
      names: ['grass', 'grasshoppers', 'frogs', 'snakes'],
    },
  },
  {
    id: 'g.beetle-generations',
    title: 'Beetles over generations',
    assumptions: [
      'Birds see green beetles on brown bark more easily than brown ones.',
      'The population stays the same size each generation.',
      'Each generation has the same number more brown beetles.',
    ],
    variables: [
      whole('N', 'N', 'Beetles in each generation', 1, 100),
      whole('b1', 'b₁', 'Brown beetles, generation 1', 0, 100),
      whole('d', 'd', 'More brown beetles each generation', 0, 30),
      { ...whole('b2', 'b₂', 'Brown beetles, generation 2', 0, 100), derived: true },
      { ...whole('b3', 'b₃', 'Brown beetles, generation 3', 0, 100), derived: true },
      { ...whole('b4', 'b₄', 'Brown beetles, generation 4', 0, 100), derived: true },
      { ...whole('b5', 'b₅', 'Brown beetles, generation 5', 0, 100), derived: true },
      { ...whole('g1', 'g₁', 'Green beetles, generation 1', 0, 100), derived: true },
      { ...whole('g2', 'g₂', 'Green beetles, generation 2', 0, 100), derived: true },
      { ...whole('g3', 'g₃', 'Green beetles, generation 3', 0, 100), derived: true },
      { ...whole('g4', 'g₄', 'Green beetles, generation 4', 0, 100), derived: true },
      { ...whole('g5', 'g₅', 'Green beetles, generation 5', 0, 100), derived: true },
    ],
    relations: [
      gain('b2', 'b1'),
      gain('b3', 'b2'),
      gain('b4', 'b3'),
      gain('b5', 'b4'),
      rest('g1', 'b1'),
      rest('g2', 'b2'),
      rest('g3', 'b3'),
      rest('g4', 'b4'),
      rest('g5', 'b5'),
    ],
    steps: {
      ...Object.fromEntries(
        [2, 3, 4, 5].map((i) => [
          `b${i} = b${i - 1} + d`,
          {
            [`b${i}`]: {
              expr: `{b${i - 1}} + {d}`,
              how: 'The generation before, plus the brown beetles gained.',
            },
            [`b${i - 1}`]: { expr: `{b${i}} − {d}`, how: 'Take away the brown beetles gained.' },
            d: {
              expr: `{b${i}} − {b${i - 1}}`,
              how: 'The change from one generation to the next.',
            },
          },
        ]),
      ),
      ...Object.fromEntries(
        [1, 2, 3, 4, 5].map((i) => [
          `g${i} = N − b${i}`,
          {
            [`g${i}`]: { expr: `{N} − {b${i}}`, how: 'The beetles that are not brown are green.' },
            N: { expr: `{g${i}} + {b${i}}`, how: 'Add the green and brown beetles.' },
            [`b${i}`]: { expr: `{N} − {g${i}}`, how: 'The beetles that are not green are brown.' },
          },
        ]),
      ),
    },
    example: {
      N: 20,
      b1: 2,
      d: 4,
      b2: 6,
      b3: 10,
      b4: 14,
      b5: 18,
      g1: 18,
      g2: 14,
      g3: 10,
      g4: 6,
      g5: 2,
    },
    startWith: ['N', 'b1', 'd'],
    representation: {
      kind: 'generations',
      counts: [1, 2, 3, 4, 5].map((i) => [`b${i}`, `g${i}`]),
      colors: ['brown', 'green'],
      names: ['brown beetles', 'green beetles'],
    },
  },
];

export const S4B_GALLERY_LAYOUTS: LayoutDef[] = [
  {
    id: 'g.leaf-cell',
    title: 'Photosynthesis and respiration',
    kind: 'explore',
    assumptions: [
      'Arrows going in are what the process uses; arrows going out are what it makes.',
      'Plant cells do both; animal cells only respire.',
    ],
    figure: { kind: 'leafCell' },
    scenes: [
      {
        label: 'Leaf',
        lines: ['A leaf uses light to make sugar from carbon dioxide and water.'],
        leafCell: { process: 'photosynthesis' },
      },
      ...(['light', 'carbon dioxide', 'water', 'sugar', 'oxygen'] as const).map((lit) => ({
        label: `Leaf: ${lit}`,
        lines: [`The ${lit} arrow is lit.`],
        leafCell: { process: 'photosynthesis' as const, lit },
      })),
      {
        label: 'Cell',
        lines: ['A cell breaks down sugar with oxygen to get energy.'],
        leafCell: { process: 'respiration' },
      },
      {
        label: 'Cell: energy',
        lines: ['The energy is what the cell uses to live and grow.'],
        leafCell: { process: 'respiration', lit: 'energy' },
      },
      {
        label: 'Both',
        lines: ['What the leaf makes, the cell uses; what the cell makes, the leaf uses.'],
        leafCell: { process: 'both' },
      },
      {
        label: 'Both: oxygen',
        lines: ['Oxygen from the leaf goes into the cell.'],
        leafCell: { process: 'both', lit: 'oxygen' },
      },
    ],
  },
  {
    id: 'g.carbon-cycle',
    title: 'Carbon cycle',
    kind: 'explore',
    assumptions: [
      'Each arrow is carbon moving from one place to another.',
      'The dashed arrow takes millions of years.',
    ],
    figure: { kind: 'carbonCycle' },
    scenes: [
      { label: 'Whole cycle', lines: ['Carbon moves around and around.'], carbon: {} },
      ...(
        [
          ['photosynthesis', 'Plants take carbon dioxide out of the air.'],
          ['respiration', 'Plants and animals breathe carbon dioxide back out.'],
          ['eating', 'Animals get carbon by eating plants.'],
          ['death', 'Dead plants, animals and waste hold carbon.'],
          ['decomposition', 'Decomposers break down dead matter and give off carbon dioxide.'],
          ['burning', 'Burning coal and oil puts old carbon into the air.'],
          ['dissolving', 'The ocean takes in carbon dioxide and gives some back.'],
          ['burial', 'Buried dead matter slowly becomes coal and oil.'],
        ] as const
      ).map(([process, line]) => ({ label: process, lines: [line], carbon: { process } })),
    ],
  },
  {
    id: 'g.pedigree',
    title: 'Pedigree chart',
    kind: 'explore',
    assumptions: [
      'The trait comes from a recessive allele a: only aa shows it.',
      'Squares are males and circles are females.',
    ],
    figure: {
      kind: 'pedigree',
      people: [
        { id: 'gp', sex: 'male', generation: 1, carrier: true, genotype: 'Aa' },
        { id: 'gm', sex: 'female', generation: 1, trait: true, genotype: 'aa' },
        { id: 'wife', sex: 'female', generation: 2, carrier: true, genotype: 'Aa' },
        {
          id: 'son',
          sex: 'male',
          generation: 2,
          carrier: true,
          genotype: 'Aa',
          parents: ['gp', 'gm'],
        },
        {
          id: 'daughter',
          sex: 'female',
          generation: 2,
          carrier: true,
          genotype: 'Aa',
          parents: ['gp', 'gm'],
        },
        { id: 'husband', sex: 'male', generation: 2, genotype: 'AA', partner: 'daughter' },
        {
          id: 'k1',
          sex: 'male',
          generation: 3,
          trait: true,
          genotype: 'aa',
          parents: ['son', 'wife'],
        },
        { id: 'k2', sex: 'female', generation: 3, genotype: 'AA', parents: ['son', 'wife'] },
        {
          id: 'k3',
          sex: 'male',
          generation: 3,
          carrier: true,
          genotype: 'Aa',
          parents: ['son', 'wife'],
        },
        {
          id: 'k4',
          sex: 'female',
          generation: 3,
          carrier: true,
          genotype: 'Aa',
          parents: ['daughter', 'husband'],
        },
        { id: 'k5', sex: 'male', generation: 3, genotype: 'AA', parents: ['daughter', 'husband'] },
      ],
    },
    scenes: [
      { label: 'Family', lines: ['Three generations of one family.'], family: {} },
      {
        label: 'Who has it',
        lines: ['The filled symbols show the trait.'],
        family: { lit: ['gm', 'k1'] },
      },
      {
        label: 'Parents of III-1',
        lines: ['Neither parent shows the trait. What must their genotypes be?'],
        family: { lit: ['son', 'wife'], ask: 'son' },
      },
      {
        label: 'Carriers',
        lines: ['Half-filled symbols carry one a without showing the trait.'],
        family: { carriers: true },
      },
      {
        label: 'Genotypes',
        lines: ['Every genotype, written under its symbol.'],
        family: { carriers: true, genotypes: true },
      },
    ],
  },
];
