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

// ─── H35 punnettSquare (Grade 9 patterns) and an X-linked pedigree ───────────

/** A parent's count of dominant alleles for one gene (0, 1 or 2; a father's X: 0 or 1). */
const alleles = (id: string, name: string, max = 2): VariableDef => ({
  ...count(id, id, name, 0, max),
  allowed: Array.from({ length: max + 1 }, (_, k) => k),
});

/** out = 4 − (2 − a)(2 − b): the boxes of 4 showing the dominant trait (forward only). */
const showing = (out: string, a: string, b: string, trait: string): Rule => ({
  relation: {
    id: `${out} = 4 − (2 − ${a})(2 − ${b})`,
    display: `{${out}} = 4 − (2 − {${a}}) × (2 − {${b}})`,
    vars: [out, a, b],
    residual: (v) => v[out]! - (4 - (2 - v[a]!) * (2 - v[b]!)),
    solve: {
      [out]: (v) => 4 - (2 - v[a]!) * (2 - v[b]!),
      [a]: () => undefined,
      [b]: () => undefined,
    },
  },
  steps: {
    [out]: {
      expr: `4 − (2 − {${a}}) × (2 − {${b}})`,
      how: `Only boxes with a recessive allele from each parent lack the ${trait} trait; the rest of the 4 show it.`,
    },
  },
});

const DIHYBRID_VARS: VariableDef[] = [
  alleles('a', 'R alleles in the first parent'),
  alleles('b', 'R alleles in the second parent'),
  alleles('c', 'Y alleles in the first parent'),
  alleles('d', 'Y alleles in the second parent'),
  { ...count('x', 'x', 'Boxes of 4 with round seeds', 0, 4), derived: true },
  { ...count('y', 'y', 'Boxes of 4 with yellow seeds', 0, 4), derived: true },
  { ...count('n', 'n', 'Boxes of 16 round and yellow', 0, 16), derived: true },
];

const dihybridDemo = (id: string, title: string, use: string, v: number[]): ModuleDef => {
  const [a, b, c, d] = v as [number, number, number, number];
  const x = 4 - (2 - a) * (2 - b);
  const y = 4 - (2 - c) * (2 - d);
  return {
    id,
    title,
    use,
    assumptions: [
      'Pea seeds: R (round) is dominant to r (wrinkled); Y (yellow) is dominant to y (green).',
      'The two genes are on different chromosomes, so they sort independently.',
      'Each parent makes four kinds of gamete, one allele of each gene; the 16 boxes are equally likely.',
    ],
    variables: DIHYBRID_VARS,
    ...rules(showing('x', 'a', 'b', 'round'), showing('y', 'c', 'd', 'yellow'), {
      relation: {
        id: 'n = xy',
        display: '{n} = {x} × {y}',
        vars: ['n', 'x', 'y'],
        residual: (w) => w.n! - w.x! * w.y!,
        solve: { n: (w) => w.x! * w.y!, x: () => undefined, y: () => undefined },
      },
      steps: {
        n: {
          expr: '{x} × {y}',
          how: 'The genes sort independently, so multiply: round in x of 4 and yellow in y of 4 is x × y of 16.',
        },
      },
    }),
    example: { a, b, c, d, x, y, n: x * y },
    startWith: ['a', 'b', 'c', 'd'],
    representation: {
      kind: 'punnettSquare',
      first: 'a',
      second: 'b',
      dominant: 'n',
      letter: 'R',
      inheritance: {
        pattern: 'dihybrid',
        firstB: 'c',
        secondB: 'd',
        letterB: 'Y',
        names: ['round, yellow', 'round, green', 'wrinkled, yellow', 'wrinkled, green'],
      },
    },
  };
};

/** RR = ab, WW = (2 − a)(2 − b), RW = the rest: a blend or both colors. */
const blendDemo = (
  id: string,
  title: string,
  use: string,
  pattern: 'incomplete' | 'codominant',
  assumptions: string[],
  names: [string, string, string],
): ModuleDef => ({
  id,
  title,
  use,
  assumptions,
  variables: [
    alleles('a', 'Cᴿ alleles in the first parent'),
    alleles('b', 'Cᴿ alleles in the second parent'),
    { ...count('r', 'r', `Boxes of 4 ${names[0]}`, 0, 4), derived: true },
    { ...count('w', 'w', `Boxes of 4 ${names[2]}`, 0, 4), derived: true },
    { ...count('m', 'm', `Boxes of 4 ${names[1]}`, 0, 4), derived: true },
  ],
  ...rules(
    {
      relation: {
        id: 'r = ab',
        display: '{r} = {a} × {b}',
        vars: ['r', 'a', 'b'],
        residual: (v) => v.r! - v.a! * v.b!,
        solve: { r: (v) => v.a! * v.b!, a: () => undefined, b: () => undefined },
      },
      steps: {
        r: {
          expr: '{a} × {b}',
          how: `A box is ${names[0]} with a Cᴿ from each parent: the first parent’s Cᴿ times the second’s.`,
        },
      },
    },
    {
      relation: {
        id: 'w = (2 − a)(2 − b)',
        display: '{w} = (2 − {a}) × (2 − {b})',
        vars: ['w', 'a', 'b'],
        residual: (v) => v.w! - (2 - v.a!) * (2 - v.b!),
        solve: { w: (v) => (2 - v.a!) * (2 - v.b!), a: () => undefined, b: () => undefined },
      },
      steps: {
        w: {
          expr: '(2 − {a}) × (2 − {b})',
          how: `A box is ${names[2]} with a Cᵂ from each parent.`,
        },
      },
    },
    {
      relation: {
        id: 'm = 4 − r − w',
        display: '{m} = 4 − {r} − {w}',
        vars: ['m', 'r', 'w'],
        residual: (v) => v.m! - (4 - v.r! - v.w!),
        solve: {
          m: (v) => 4 - v.r! - v.w!,
          r: (v) => 4 - v.m! - v.w!,
          w: (v) => 4 - v.m! - v.r!,
        },
      },
      steps: {
        m: { expr: '4 − {r} − {w}', how: `The other boxes have one of each allele: ${names[1]}.` },
        r: { expr: '4 − {m} − {w}', how: 'The rest of the 4 boxes.' },
        w: { expr: '4 − {m} − {r}', how: 'The rest of the 4 boxes.' },
      },
    },
  ),
  example: { a: 1, b: 1, r: 1, w: 1, m: 2 },
  startWith: ['a', 'b'],
  representation: {
    kind: 'punnettSquare',
    first: 'a',
    second: 'b',
    dominant: 'r',
    recessive: 'w',
    letter: 'C',
    inheritance: { pattern, middle: 'm', alleles: ['R', 'W'], names },
  },
});

const PUNNETT_DEMOS: ModuleDef[] = [
  dihybridDemo(
    'g.s9-inheritance-patterns-dihybrid',
    'A dihybrid cross',
    'Use this for two genes at once: the 9:3:3:1 of two double heterozygotes, or any other pair.',
    [1, 1, 1, 1],
  ),
  dihybridDemo(
    'g.s9-inheritance-patterns-dihybrid-pure',
    'Two pure-breeding parents',
    'Use this for RRYY × rryy: every offspring RrYy, round and yellow.',
    [2, 0, 2, 0],
  ),
  blendDemo(
    'g.s9-inheritance-patterns-incomplete',
    'Incomplete dominance',
    'Use this for a heterozygote in between its parents, such as pink snapdragons.',
    'incomplete',
    [
      'Snapdragon color: neither allele is dominant. CᴿCᴿ is red, CᵂCᵂ white, and CᴿCᵂ pink, a blend.',
      'A parent is written by its count of Cᴿ alleles: 2, 1 or 0.',
    ],
    ['red', 'pink', 'white'],
  ),
  blendDemo(
    'g.s9-inheritance-patterns-codominant',
    'Codominance',
    'Use this for a heterozygote that shows both alleles, such as roan cattle.',
    'codominant',
    [
      'Cattle coat: CᴿCᴿ is red, CᵂCᵂ white, and CᴿCᵂ roan, with red and white hairs side by side.',
      'Both alleles show in full: codominance, not a blend.',
    ],
    ['red', 'roan', 'white'],
  ),
  {
    id: 'g.s9-inheritance-patterns-x-linked',
    title: 'A sex-linked trait',
    use: 'Use this for a recessive allele on the X chromosome, such as red–green color blindness.',
    assumptions: [
      'Xᴮ is normal color vision and Xᵇ color blindness, on the X chromosome; the Y carries no copy.',
      'A mother has two X: 2, 1 or 0 Xᴮ. A father has one X: 1 or 0 Xᴮ.',
      'Sons get their X from their mother, so one Xᵇ makes a son color-blind.',
    ],
    variables: [
      alleles('m', 'Xᴮ alleles in the mother'),
      alleles('f', 'Xᴮ alleles in the father', 1),
      { ...count('r', 'r', 'Boxes of 4 color-blind', 0, 4), derived: true },
      { ...count('t', 't', 'Boxes of 4 with normal vision', 0, 4), derived: true },
      { ...count('k', 'k', 'Carrier daughters (of 4 boxes)', 0, 4), derived: true },
    ],
    ...rules(
      {
        relation: {
          id: 'r = (2 − m)(2 − f)',
          display: '{r} = (2 − {m}) × (2 − {f})',
          vars: ['r', 'm', 'f'],
          residual: (v) => v.r! - (2 - v.m!) * (2 - v.f!),
          solve: { r: (v) => (2 - v.m!) * (2 - v.f!), m: () => undefined, f: () => undefined },
        },
        steps: {
          r: {
            expr: '(2 − {m}) × (2 − {f})',
            how: 'Each Xᵇ from the mother makes one color-blind son, and one more color-blind daughter when the father’s X is Xᵇ too.',
          },
        },
      },
      {
        relation: {
          id: 't = 4 − r',
          display: '{t} = 4 − {r}',
          vars: ['t', 'r'],
          residual: (v) => v.t! + v.r! - 4,
          solve: { t: (v) => 4 - v.r!, r: (v) => 4 - v.t! },
        },
        steps: {
          t: { expr: '4 − {r}', how: 'The other boxes have normal vision.' },
          r: { expr: '4 − {t}', how: 'The boxes without normal vision are the rest of the 4.' },
        },
      },
      {
        relation: {
          id: 'k = f(2 − m) + (1 − f)m',
          display: '{k} = {f} × (2 − {m}) + (1 − {f}) × {m}',
          vars: ['k', 'f', 'm'],
          residual: (v) => v.k! - (v.f! * (2 - v.m!) + (1 - v.f!) * v.m!),
          solve: {
            k: (v) => v.f! * (2 - v.m!) + (1 - v.f!) * v.m!,
            f: () => undefined,
            m: () => undefined,
          },
        },
        steps: {
          k: {
            expr: '{f} × (2 − {m}) + (1 − {f}) × {m}',
            how: 'A daughter is a carrier with one Xᴮ and one Xᵇ: the father’s X paired with the mother’s other allele.',
          },
        },
      },
    ),
    example: { m: 1, f: 1, r: 1, t: 3, k: 1 },
    startWith: ['m', 'f'],
    representation: {
      kind: 'punnettSquare',
      first: 'm',
      second: 'f',
      dominant: 't',
      recessive: 'r',
      letter: 'B',
      inheritance: { pattern: 'xLinked', carriers: 'k' },
    },
  },
];

/** A family with red–green color blindness, an X-linked recessive trait. */
const X_PEDIGREE: LayoutDef = {
  id: 'g.s9-inheritance-patterns-x-pedigree',
  title: 'A sex-linked pedigree',
  kind: 'explore',
  assumptions: [
    'Squares are males, circles females; filled shows the trait, half-filled carries it.',
    'Color blindness here is X-linked recessive: Xᵇ on the X chromosome.',
  ],
  figure: {
    kind: 'pedigree',
    people: [
      { id: 'g1', sex: 'male', generation: 1, trait: true, genotype: 'XᵇY' },
      { id: 'g2', sex: 'female', generation: 1, genotype: 'XᴮXᴮ' },
      { id: 's1', sex: 'male', generation: 2, genotype: 'XᴮY', parents: ['g1', 'g2'] },
      {
        id: 'd1',
        sex: 'female',
        generation: 2,
        carrier: true,
        genotype: 'XᴮXᵇ',
        parents: ['g1', 'g2'],
      },
      { id: 'h1', sex: 'male', generation: 2, genotype: 'XᴮY', partner: 'd1' },
      {
        id: 'c1',
        sex: 'male',
        generation: 3,
        trait: true,
        genotype: 'XᵇY',
        parents: ['d1', 'h1'],
      },
      {
        id: 'c2',
        sex: 'female',
        generation: 3,
        carrier: true,
        genotype: 'XᴮXᵇ',
        parents: ['d1', 'h1'],
      },
      { id: 'c3', sex: 'male', generation: 3, genotype: 'XᴮY', parents: ['d1', 'h1'] },
    ],
  },
  scenes: [
    { label: 'The family', lines: ['Three generations; two males show the trait.'], family: {} },
    {
      label: 'Skipping',
      lines: [
        'The grandfather’s daughter shows nothing, but her son does: the trait skipped a generation through her.',
      ],
      family: { lit: ['g1', 'd1', 'c1'] },
    },
    {
      label: 'Carriers',
      lines: ['Only females are carriers: a male has one X, so he shows whatever it carries.'],
      family: { carriers: true },
    },
    {
      label: 'Genotypes',
      lines: ['Each son’s X came from his mother; each daughter got her father’s only X.'],
      family: { carriers: true, genotypes: true },
    },
  ],
};

// ─── H36 dnaStrand ───────────────────────────────────────────────────────────

/** A short gene's template strand: mRNA AUG GCC AAG UAA, Met–Ala–Lys–Stop. */
const GENE = 'TACCGGTTCATT';

/** y = x, both ways. */
const equal = (y: string, x: string, how: string): Rule => ({
  relation: {
    id: `${y} = ${x}`,
    display: `{${y}} = {${x}}`,
    vars: [y, x],
    residual: (v) => v[y]! - v[x]!,
    solve: { [y]: (v) => v[x]!, [x]: (v) => v[y]! },
  },
  steps: { [y]: { expr: `{${x}}`, how }, [x]: { expr: `{${y}}`, how } },
});

/** c = ⌈p ÷ 3⌉: the codon a base falls in (forward only). */
const codonOf: Rule = {
  relation: {
    id: 'c = ⌈p ÷ 3⌉',
    display: '{c} = ⌈{p}/3⌉',
    vars: ['c', 'p'],
    residual: (v) => v.c! - Math.ceil(v.p! / 3),
    solve: { c: (v) => Math.ceil(v.p! / 3), p: () => undefined },
  },
  steps: {
    c: {
      expr: 'the codon holding base {p}',
      how: 'Bases 1 to 3 are codon 1, bases 4 to 6 codon 2, and so on: divide by 3 and round up.',
    },
  },
};

const mutationDemo = (
  id: string,
  title: string,
  use: string,
  type: 'substitution' | 'insertion' | 'deletion',
  p: number,
  extra: string,
  base?: 'A' | 'T' | 'G' | 'C',
  allowed?: number[],
): ModuleDef => ({
  id,
  title,
  use,
  assumptions: [
    `The template strand is ${GENE}; its mRNA AUG GCC AAG UAA codes Met–Ala–Lys, then stop.`,
    'Bases are numbered from 1 along the template strand.',
    extra,
  ],
  variables: [
    {
      ...count('p', 'p', 'Base changed', 1, type === 'insertion' ? 13 : 12),
      ...(allowed ? { allowed } : {}),
    },
    { ...count('c', 'c', 'Codon changed', 1, 5), derived: true },
  ],
  ...rules(codonOf),
  example: { p, c: Math.ceil(p / 3) },
  startWith: ['p'],
  representation: {
    kind: 'dnaStrand',
    sequence: GENE,
    mutation: { type, at: 'p', ...(base ? { base } : {}) },
  },
});

const DNA_DEMOS: ModuleDef[] = [
  {
    id: 'g.s9-dna-protein-synthesis-chargaff',
    title: 'Base pairing: Chargaff’s rule',
    use: 'Use this for the percent of each base in DNA from the percent of one.',
    assumptions: [
      'In DNA, A always pairs with T and G with C, so there is as much A as T and as much G as C.',
      'The four percents add to 100%.',
      'The ladder shows 10 base pairs, 20 bases, so it draws percents in steps of 5%.',
    ],
    variables: [
      { id: 'A', symbol: 'A', name: 'Adenine', unit: '%', min: 0, max: 50, step: 5, multipleOf: 5 },
      { id: 'T', symbol: 'T', name: 'Thymine', unit: '%', min: 0, max: 50, step: 5 },
      { id: 'G', symbol: 'G', name: 'Guanine', unit: '%', min: 0, max: 50, step: 5 },
      { id: 'C', symbol: 'C', name: 'Cytosine', unit: '%', min: 0, max: 50, step: 5 },
    ],
    ...rules(
      equal('T', 'A', 'Every A pairs with a T, so there are as many.'),
      {
        relation: {
          id: 'G = 50 − A',
          display: '{G} = 50 − {A}',
          vars: ['G', 'A'],
          residual: (v) => v.G! - (50 - v.A!),
          solve: { G: (v) => 50 - v.A!, A: (v) => 50 - v.G! },
        },
        steps: {
          G: {
            expr: '50 − {A}',
            how: 'A and T take 2 × A of the 100%; G and C share the rest equally: (100 − 2A)/2 = 50 − A.',
          },
          A: { expr: '50 − {G}', how: 'A and G together are half the bases.' },
        },
      },
      equal('C', 'G', 'Every G pairs with a C, so there are as many.'),
    ),
    example: { A: 30, T: 30, G: 20, C: 20 },
    startWith: ['A'],
    representation: { kind: 'dnaStrand', percentA: 'A', pairs: 10 },
  },
  {
    id: 'g.s9-dna-protein-synthesis-codons',
    title: 'Transcription and translation',
    use: 'Use this for the mRNA and the amino acids a DNA template codes for.',
    assumptions: [
      'Transcription: the mRNA pairs with the template strand, with U in place of T.',
      'Translation: each three mRNA bases, a codon, code for one amino acid. AUG starts; UAA, UAG and UGA stop.',
      `The template here is ${GENE}.`,
    ],
    variables: [
      { ...count('n', 'n', 'Bases read', 3, 12), multipleOf: 3 },
      { ...count('k', 'k', 'Codons', 1, 4), derived: true },
    ],
    ...rules({
      relation: {
        id: 'k = n ÷ 3',
        display: '{k} = {n}/3',
        vars: ['k', 'n'],
        residual: (v) => 3 * v.k! - v.n!,
        solve: { k: (v) => v.n! / 3, n: (v) => 3 * v.k! },
      },
      steps: {
        k: { expr: '{n}/3', how: 'Each codon is three bases.' },
        n: { expr: '3 × {k}', how: 'Three bases for each codon.' },
      },
    }),
    example: { n: 12, k: 4 },
    startWith: ['n'],
    representation: { kind: 'dnaStrand', sequence: GENE, length: 'n', codons: 'k' },
  },
  mutationDemo(
    'g.s9-biotechnology-substitution',
    'A point mutation',
    'Use this for a one-base substitution and whether it changes the protein.',
    'substitution',
    4,
    'Each base changed here swaps A with G or C with T. Try base 6 (silent) and base 4 (missense).',
  ),
  mutationDemo(
    'g.s9-biotechnology-nonsense',
    'A nonsense mutation',
    'Use this for a substitution that turns a codon into a stop.',
    'substitution',
    7,
    'The base changed becomes an A. At base 7 the codon AAG becomes the stop UAG.',
    'A',
    [1, 3, 4, 5, 6, 7, 8, 9, 11, 12],
  ),
  mutationDemo(
    'g.s9-biotechnology-insertion',
    'An insertion',
    'Use this for an extra base and the frameshift it causes.',
    'insertion',
    5,
    'An A is inserted before the base numbered; at 13 it goes on the end.',
    'A',
  ),
  mutationDemo(
    'g.s9-biotechnology-deletion',
    'A deletion',
    'Use this for a missing base and the frameshift it causes.',
    'deletion',
    5,
    'Every codon after a deleted base is read in a new frame.',
  ),
];

export const HSG_GALLERY_MODULES: ModuleDef[] = [...MEMBRANE_DEMOS, ...PUNNETT_DEMOS, ...DNA_DEMOS];
export const HSG_GALLERY_LAYOUTS: LayoutDef[] = [
  MACRO_LAYOUT,
  TONICITY_SORT,
  ENERGY_LAYOUT,
  MITOSIS_SEQUENCE,
  MEIOSIS_SEQUENCE,
  MEIOSIS_SIX,
  X_PEDIGREE,
];
