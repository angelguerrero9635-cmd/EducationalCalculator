/**
 * Grades 9–12 gallery demos (group HG; see pictureRequestsHs.ts and docs/RENDERINGS_HS.md).
 * Each demo stands in for a planned page: real variables, relations, steps and a use line, so
 * `scripts/promote-demo.mjs` can copy it into a grade file. Spread into gallery.ts.
 */
import type { Relation, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';
import type { DivisionStage } from './typesHsg';

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
const count = (id: string, symbol: string, name: string, min = 0, max = 40): VariableDef => ({
  id,
  symbol,
  name,
  min,
  max,
  step: 1,
  integer: true,
});

/** out = k × a, both ways (k a whole number). */
const times = (out: string, k: number, a: string, how: string, back: string): Rule => ({
  relation: {
    id: `${out} = ${k}${a}`,
    display: `{${out}} = ${k} × {${a}}`,
    vars: [out, a],
    residual: (v) => v[out]! - k * v[a]!,
    solve: { [out]: (v) => k * v[a]!, [a]: (v) => v[out]! / k },
  },
  steps: {
    [out]: { expr: `${k} × {${a}}`, how },
    [a]: { expr: `{${out}}/${k}`, how: back },
  },
});

// ─── H31 macromolecules ──────────────────────────────────────────────────────

const MACRO_LAYOUT: LayoutDef = {
  id: 'g.s9-biomolecules-polymers',
  title: 'Monomers into polymers',
  kind: 'explore',
  assumptions: [
    'Large biological molecules are built from small units joined by covalent bonds.',
    'Each new bond gives off one water molecule: dehydration synthesis. Adding water back splits the bond: hydrolysis.',
  ],
  figure: { kind: 'macromolecules' },
  scenes: [
    {
      label: 'Carbohydrates',
      lines: [
        'Glucose rings join into chains; starch is thousands of glucose units long.',
        'Three glucose molecules join by 2 bonds and give off 2 water molecules.',
      ],
      macro: { kind: 'carbohydrate', count: 3 },
    },
    {
      label: 'Proteins',
      lines: [
        'Amino acids join end to end by peptide bonds: the carboxyl group of one to the amine group of the next.',
        'Each has its own side chain R, and the chain folds into the protein’s shape.',
      ],
      macro: { kind: 'protein', count: 4 },
    },
    {
      label: 'Nucleic acids',
      lines: [
        'Nucleotides join sugar to phosphate, so the bases hang off a sugar–phosphate backbone.',
        'The strand runs from a free phosphate (the 5′ end) to a free OH (the 3′ end).',
      ],
      macro: { kind: 'nucleicAcid', count: 3 },
    },
    {
      label: 'Lipids',
      lines: [
        'Glycerol takes three fatty acids by ester bonds, giving off 3 water molecules.',
        'A fat is not a polymer: it is not a chain of repeating units.',
      ],
      macro: { kind: 'lipid' },
    },
    {
      label: 'Hydrolysis',
      lines: [
        'Digestion runs the reaction backward: 3 water molecules break a starch chain of 4 glucose units.',
      ],
      macro: { kind: 'carbohydrate', count: 4, split: true },
    },
    {
      label: 'Two units',
      lines: ['The smallest chain: two glucose units make maltose, a disaccharide, and 1 water.'],
      macro: { kind: 'carbohydrate', count: 2 },
    },
  ],
};

// ─── H32 membrane ────────────────────────────────────────────────────────────

/** d = o − i: the concentration gradient across the membrane, outside minus inside. */
const gradient: Rule = {
  relation: {
    id: 'd = o − i',
    display: '{d} = {o} − {i}',
    vars: ['d', 'o', 'i'],
    residual: (v) => v.d! - (v.o! - v.i!),
    solve: { d: (v) => v.o! - v.i!, o: (v) => v.d! + v.i!, i: (v) => v.o! - v.d! },
  },
  steps: {
    d: {
      expr: '{o} − {i}',
      how: 'The gradient is the difference across the membrane: outside minus inside.',
    },
    o: { expr: '{d} + {i}', how: 'Add the gradient to the count inside.' },
    i: { expr: '{o} − {d}', how: 'Take the gradient from the count outside.' },
  },
};

/** Outside, inside and the gradient, for one kind of particle. */
const sides = (what: string): VariableDef[] => [
  count('o', 'o', `${what} outside`),
  count('i', 'i', `${what} inside`),
  { ...count('d', 'd', 'Gradient (outside − inside)', -40, 40) },
];

/** A membrane demo: the gradient page for one transport. */
const membraneDemo = (
  id: string,
  title: string,
  use: string,
  assumptions: string[],
  transport: 'diffusion' | 'facilitated' | 'osmosis',
  particle: string,
  what: string,
  o: number,
  i: number,
): ModuleDef => ({
  id,
  title,
  use,
  assumptions,
  variables: sides(what),
  ...rules(gradient),
  example: { o, i, d: o - i },
  startWith: ['o', 'i'],
  representation: {
    kind: 'membrane',
    outside: 'o',
    inside: 'i',
    transport,
    particle,
    gradient: 'd',
  },
});

const MEMBRANE_DEMOS: ModuleDef[] = [
  membraneDemo(
    'g.s9-membrane-transport-diffusion',
    'Diffusion across a membrane',
    'Use this for which way a small molecule diffuses, and the gradient that drives it.',
    [
      'Particles move at random; more cross from the crowded side, so the net flow is from high to low concentration.',
      'Small nonpolar molecules such as O₂ and CO₂ slip between the phospholipids.',
      'Diffusion is passive: it uses no energy from the cell.',
    ],
    'diffusion',
    'O₂',
    'O₂ molecules',
    24,
    8,
  ),
  membraneDemo(
    'g.s9-membrane-transport-facilitated',
    'Facilitated diffusion',
    'Use this for molecules such as glucose that cross only through a channel or carrier protein.',
    [
      'Glucose and ions can’t cross the oily middle of the bilayer.',
      'A channel protein lets them through, still from high to low concentration, with no energy used.',
    ],
    'facilitated',
    'glucose',
    'Glucose molecules',
    18,
    6,
  ),
  membraneDemo(
    'g.s9-membrane-transport-osmosis',
    'Osmosis',
    'Use this for which way water moves when the solute can’t cross the membrane.',
    [
      'Water crosses through aquaporins; the solute particles can’t cross.',
      'Water moves toward the side with more solute (less free water).',
      'The side with less solute is hypotonic, the side with more is hypertonic; equal is isotonic.',
    ],
    'osmosis',
    'solute',
    'Solute particles',
    10,
    30,
  ),
  membraneDemo(
    'g.s9-membrane-transport-equilibrium',
    'Dynamic equilibrium',
    'Use this for a membrane with the same concentration on both sides.',
    [
      'Particles still cross both ways, at the same rate.',
      'With no gradient there is no net movement.',
    ],
    'diffusion',
    'O₂',
    'O₂ molecules',
    15,
    15,
  ),
  membraneDemo(
    'g.s9-membrane-transport-steep',
    'The steepest gradient',
    'Use this for CO₂ leaving a cell into blood that carries it away.',
    [
      'The cell makes CO₂ in respiration; the blood outside carries it away.',
      'All 40 are inside and none outside: the steepest gradient this picture draws.',
    ],
    'diffusion',
    'CO₂',
    'CO₂ molecules',
    0,
    40,
  ),
  {
    id: 'g.s9-membrane-transport-pump',
    title: 'The sodium–potassium pump',
    use: 'Use this for active transport: how many ions a pump moves for the ATP it uses.',
    assumptions: [
      'The pump moves Na⁺ out of the cell, where there is already more: against the gradient.',
      'Each ATP it splits moves 3 Na⁺ out and 2 K⁺ in.',
      'Here 12 Na⁺ are inside and 36 outside.',
    ],
    variables: [
      count('a', 'a', 'ATP used', 1, 4),
      { ...count('p', 'p', 'Na⁺ pumped out', 3, 12), multipleOf: 3 },
      { ...count('k', 'k', 'K⁺ pumped in', 2, 8), multipleOf: 2 },
    ],
    ...rules(
      times(
        'p',
        3,
        'a',
        'Each ATP moves 3 Na⁺ out of the cell.',
        'Each ATP moves 3 Na⁺, so divide by 3.',
      ),
      times(
        'k',
        2,
        'a',
        'Each ATP also brings 2 K⁺ into the cell.',
        'Each ATP moves 2 K⁺, so divide by 2.',
      ),
    ),
    example: { a: 2, p: 6, k: 4 },
    startWith: ['a'],
    representation: {
      kind: 'membrane',
      outside: 36,
      inside: 12,
      transport: 'active',
      particle: 'Na⁺',
      moved: 'p',
      atp: 'a',
    },
  },
];

const TONICITY_SORT: LayoutDef = {
  id: 'g.s9-membrane-transport-tonicity',
  title: 'Cells in three kinds of water',
  kind: 'sort',
  assumptions: [
    'Water moves toward the side with more solute.',
    'A red blood cell has no wall: it swells and can burst, or shrivels. A plant cell’s wall holds it: it goes firm or its membrane pulls away.',
  ],
  question: 'Which way does water move?',
  bins: [
    {
      id: 'in',
      label: 'Into the cell (hypotonic water)',
      why: 'The water has less solute than the cell, so water moves in.',
    },
    {
      id: 'none',
      label: 'No net movement (isotonic water)',
      why: 'The same solute on both sides: water crosses both ways equally.',
    },
    {
      id: 'out',
      label: 'Out of the cell (hypertonic water)',
      why: 'The water has more solute than the cell, so water moves out.',
    },
  ],
  cards: [
    {
      label: 'Red blood cell swollen round',
      bin: 'in',
      figure: { kind: 'icon', icon: 'red blood cell in hypotonic water' },
    },
    {
      label: 'Red blood cell, a dimpled disc',
      bin: 'none',
      figure: { kind: 'icon', icon: 'red blood cell in isotonic water' },
    },
    {
      label: 'Red blood cell shriveled',
      bin: 'out',
      figure: { kind: 'icon', icon: 'red blood cell in hypertonic water' },
    },
    {
      label: 'Plant cell firm (turgid)',
      bin: 'in',
      figure: { kind: 'icon', icon: 'plant cell in hypotonic water' },
    },
    {
      label: 'Plant cell limp (flaccid)',
      bin: 'none',
      figure: { kind: 'icon', icon: 'plant cell in isotonic water' },
    },
    {
      label: 'Plant cell, membrane pulled from the wall',
      bin: 'out',
      figure: { kind: 'icon', icon: 'plant cell in hypertonic water' },
    },
  ],
};

// ─── H33 organelleEnergy ─────────────────────────────────────────────────────

const ENERGY_LAYOUT: LayoutDef = {
  id: 'g.s9-cellular-energy-organelles',
  title: 'Chloroplasts and mitochondria',
  kind: 'explore',
  assumptions: [
    'Plant cells have both chloroplasts and mitochondria; animal cells have only mitochondria.',
    'Photosynthesis stores the sun’s energy in glucose. Cellular respiration releases it as ATP, the cell’s energy currency.',
  ],
  figure: { kind: 'organelleEnergy' },
  scenes: [
    {
      label: 'The cycle',
      lines: [
        'The products of each process are the reactants of the other: matter cycles, while energy flows in as light and out as work and heat.',
      ],
      energy: { process: 'cycle' },
    },
    {
      label: 'Photosynthesis',
      lines: [
        'In the chloroplast, light energy turns carbon dioxide and water into glucose, giving off oxygen.',
      ],
      energy: { process: 'photosynthesis', lit: 'light' },
    },
    {
      label: 'Light reactions',
      lines: [
        'In the thylakoids, light splits water: O₂ is given off and the energy is stored in ATP and NADPH.',
      ],
      energy: { process: 'lightReactions', lit: 'O₂' },
    },
    {
      label: 'Calvin cycle',
      lines: ['In the stroma, ATP and NADPH power the building of glucose from CO₂.'],
      energy: { process: 'calvinCycle', lit: 'CO₂' },
    },
    {
      label: 'Respiration',
      lines: [
        'In the mitochondrion, glucose and oxygen become carbon dioxide and water, and the energy is stored in ATP.',
      ],
      energy: { process: 'respiration', lit: 'ATP' },
    },
    {
      label: 'Glycolysis',
      lines: [
        'In the cytoplasm, glucose splits into 2 pyruvate, a net gain of 2 ATP. It needs no oxygen.',
      ],
      energy: { process: 'glycolysis', lit: 'glucose' },
    },
    {
      label: 'Krebs cycle',
      lines: [
        'In the matrix, pyruvate is broken down to CO₂, making 2 ATP and carriers of electrons.',
      ],
      energy: { process: 'krebsCycle', lit: 'CO₂' },
    },
    {
      label: 'Electron transport',
      lines: [
        'Along the folded inner membrane, electrons pass to oxygen, making water and most of the ATP.',
      ],
      energy: { process: 'electronTransport', lit: 'O₂' },
    },
  ],
};

// ─── H34 cellDivision ────────────────────────────────────────────────────────

const MITOSIS_SEQUENCE: LayoutDef = {
  id: 'g.s9-mitosis-meiosis-mitosis',
  title: 'The cell cycle and mitosis',
  kind: 'sequence',
  assumptions: [
    'This cell has 2n = 4 chromosomes: two pairs, one of each pair from each parent (red and blue).',
    'Mitosis makes two cells with the same 4 chromosomes as the parent cell.',
  ],
  question: 'Put the stages in order, from interphase.',
  stages: [
    { label: 'Interphase', figure: { kind: 'cellDivision', stage: 'interphase', diploid: 4 } },
    { label: 'Prophase', figure: { kind: 'cellDivision', stage: 'prophase', diploid: 4 } },
    { label: 'Metaphase', figure: { kind: 'cellDivision', stage: 'metaphase', diploid: 4 } },
    { label: 'Anaphase', figure: { kind: 'cellDivision', stage: 'anaphase', diploid: 4 } },
    { label: 'Telophase', figure: { kind: 'cellDivision', stage: 'telophase', diploid: 4 } },
    { label: 'Cytokinesis', figure: { kind: 'cellDivision', stage: 'cytokinesis', diploid: 4 } },
  ],
};

const meiosisStage = (label: string, stage: DivisionStage, diploid: number) => ({
  label,
  figure: { kind: 'cellDivision' as const, stage, diploid },
});

const MEIOSIS_SEQUENCE: LayoutDef = {
  id: 'g.s9-mitosis-meiosis-meiosis',
  title: 'Meiosis I and II',
  kind: 'sequence',
  assumptions: [
    'The cell starts with 2n = 4 chromosomes, already copied: each is two sister chromatids.',
    'In prophase I the homologous chromosomes pair up and cross over, swapping pieces.',
    'Meiosis I separates the pairs; meiosis II separates the sister chromatids. Four cells of n = 2 result.',
  ],
  question: 'Put the stages of meiosis in order.',
  stages: [
    meiosisStage('Prophase I', 'prophase I', 4),
    meiosisStage('Metaphase I', 'metaphase I', 4),
    meiosisStage('Anaphase I', 'anaphase I', 4),
    meiosisStage('Telophase I', 'telophase I', 4),
    meiosisStage('Prophase II', 'prophase II', 4),
    meiosisStage('Metaphase II', 'metaphase II', 4),
    meiosisStage('Anaphase II', 'anaphase II', 4),
    meiosisStage('Telophase II', 'telophase II', 4),
  ],
};

const MEIOSIS_SIX: LayoutDef = {
  id: 'g.s9-mitosis-meiosis-six',
  title: 'Meiosis with 2n = 6',
  kind: 'sequence',
  assumptions: [
    'Three pairs of chromosomes: 2n = 6, so each gamete gets n = 3, one of each pair.',
    'Which homolog of each pair goes to which side is random: independent assortment.',
  ],
  question: 'Put the key stages in order.',
  stages: [
    meiosisStage('Pairs cross over', 'prophase I', 6),
    meiosisStage('Pairs line up', 'metaphase I', 6),
    meiosisStage('Pairs separate', 'anaphase I', 6),
    meiosisStage('Sisters separate', 'anaphase II', 6),
    meiosisStage('Four gametes', 'telophase II', 6),
  ],
};

export const HSG_GALLERY_MODULES: ModuleDef[] = [...MEMBRANE_DEMOS];
export const HSG_GALLERY_LAYOUTS: LayoutDef[] = [
  MACRO_LAYOUT,
  TONICITY_SORT,
  ENERGY_LAYOUT,
  MITOSIS_SEQUENCE,
  MEIOSIS_SEQUENCE,
  MEIOSIS_SIX,
];
