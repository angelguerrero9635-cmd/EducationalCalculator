/**
 * Grades 9–12 round 2 gallery demos (group H2E: biology and sorts (H100, H104); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in. Spread into
 * gallery.ts.
 */
import type { Relation, VariableDef } from '@/engine/types';

import type { CardIcon, LayoutDef } from './layouts';
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

/** out = f(ins), worked forward only. */
const forward = (
  out: string,
  display: string,
  ins: string[],
  f: (v: Record<string, number>) => number,
  expr: string,
  how: string,
): Rule => ({
  relation: {
    id: display.replace(/[{}]/g, ''),
    display,
    vars: [out, ...ins],
    residual: (v) => v[out]! - f(v as Record<string, number>),
    solve: { [out]: (v) => f(v as Record<string, number>) },
  },
  steps: { [out]: { expr, how } },
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

// ─── H100 part 2: dnaStrand long genes ───────────────────────────────────────

/** The codons page for a gene of b bases: its first 12, "…", and its stop codon. */
const longGeneDemo = (id: string, title: string, b: number): ModuleDef => ({
  id,
  title,
  use: 'Use this for “A gene’s coding mRNA is 900 bases long. How many amino acids does it code?”',
  unitSystems: ['metric'],
  assumptions: [
    'Three mRNA bases make a codon; AUG starts the chain and codes Met, and a stop codon adds no amino acid.',
    'So a coding mRNA of b bases, ending in its stop codon, codes b ÷ 3 − 1 amino acids.',
    'The picture draws the gene’s first 12 bases and its stop codon; “…” stands for the rest.',
  ],
  variables: [
    { ...count('b', 'b', 'Bases in the coding mRNA', 6, 3000), multipleOf: 3 },
    count('c', 'c', 'Codons', 2, 1000, true),
    count('a', 'a', 'Amino acids in the chain', 1, 999, true),
    count('p', 'p', 'Peptide bonds', 0, 998, true),
  ],
  ...rules(
    {
      relation: {
        id: 'c = b ÷ 3',
        display: '{c} = {b} ÷ 3',
        vars: ['c', 'b'],
        residual: (v) => v.c! - v.b! / 3,
        solve: { c: (v) => v.b! / 3, b: (v) => 3 * v.c! },
      },
      steps: {
        c: { expr: '{b} ÷ 3', how: 'Every three bases are one codon.' },
        b: { expr: '3 × {c}', how: 'Three bases to each codon.' },
      },
    },
    less(
      'a',
      'c',
      1,
      'Every codon but the last codes an amino acid; the last is the stop codon.',
      'One codon more than amino acids: the stop.',
    ),
    less(
      'p',
      'a',
      1,
      'A peptide bond joins each amino acid to the next: one fewer bond than amino acids.',
      'One amino acid more than bonds.',
    ),
  ),
  example: { b, c: b / 3, a: b / 3 - 1, p: b / 3 - 2 },
  startWith: ['b'],
  representation: {
    kind: 'dnaStrand',
    sequence: 'TACCGGTTCGGA',
    gene: { bases: 'b' },
    codons: 'c',
  },
});

const GENE_DEMOS: ModuleDef[] = [
  longGeneDemo('g.s9-dna-protein-synthesis-long-gene', 'Codons in a long gene', 900),
  longGeneDemo('g.s9-dna-protein-synthesis-short-gene', 'The shortest genes', 9),
];

// ─── H100 part 9: reaction with glucose, up to 18 molecules a formula ────────

/** out = k × a (+ k2 × b), worked forward. */
const sumOf = (out: string, terms: [number, string][], how: string): Rule => {
  const text = terms.map(([k, a]) => (k === 1 ? `{${a}}` : `${k} × {${a}}`)).join(' + ');
  const f = (v: Record<string, number>) => terms.reduce((s, [k, a]) => s + k * v[a]!, 0);
  return forward(
    out,
    `{${out}} = ${text}`,
    terms.map(([, a]) => a),
    f,
    text,
    how,
  );
};

const PHOTOSYNTHESIS: ModuleDef = {
  id: 'g.s9-cellular-energy-equation',
  title: 'The photosynthesis equation',
  use: 'Use this for “How many CO₂ molecules make 2 glucose molecules, and are the atoms conserved?”',
  assumptions: [
    'Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Respiration is the same equation read backward.',
    'Atoms are rearranged, never made or lost: each element has as many atoms after as before.',
  ],
  variables: [
    count('g', 'g', 'Glucose molecules made', 1, 3),
    count('c', 'c', 'CO₂ molecules', 6, 18, true),
    count('w', 'w', 'H₂O molecules', 6, 18, true),
    count('o', 'o', 'O₂ molecules', 6, 18, true),
    count('C1', 'C₁', 'Carbon atoms before', 6, 18, true),
    count('C2', 'C₂', 'Carbon atoms after', 6, 18, true),
    count('H1', 'H₁', 'Hydrogen atoms before', 12, 36, true),
    count('H2', 'H₂', 'Hydrogen atoms after', 12, 36, true),
    count('O1', 'O₁', 'Oxygen atoms before', 18, 54, true),
    count('O2', 'O₂', 'Oxygen atoms after', 18, 54, true),
  ],
  ...rules(
    sumOf('c', [[6, 'g']], 'Each glucose takes 6 CO₂.'),
    sumOf('w', [[6, 'g']], 'Each glucose takes 6 H₂O.'),
    sumOf('o', [[6, 'g']], 'Each glucose gives off 6 O₂.'),
    sumOf('C1', [[1, 'c']], 'One carbon in each CO₂.'),
    sumOf('C2', [[6, 'g']], 'Six carbons in each glucose.'),
    sumOf('H1', [[2, 'w']], 'Two hydrogens in each H₂O.'),
    sumOf('H2', [[12, 'g']], 'Twelve hydrogens in each glucose.'),
    sumOf(
      'O1',
      [
        [2, 'c'],
        [1, 'w'],
      ],
      'Two oxygens in each CO₂ and one in each H₂O.',
    ),
    sumOf(
      'O2',
      [
        [6, 'g'],
        [2, 'o'],
      ],
      'Six oxygens in each glucose and two in each O₂.',
    ),
  ),
  example: { g: 3, c: 18, w: 18, o: 18, C1: 18, C2: 18, H1: 36, H2: 36, O1: 54, O2: 54 },
  startWith: ['g'],
  representation: {
    kind: 'reaction',
    reactants: [
      { formula: 'CO2', count: 'c' },
      { formula: 'H2O', count: 'w' },
    ],
    products: [
      { formula: 'C6H12O6', count: 'g' },
      { formula: 'O2', count: 'o' },
    ],
    atoms: { C: ['C1', 'C2'], H: ['H1', 'H2'], O: ['O1', 'O2'] },
    many: true,
  },
};

// ─── H100 part 8: bars with flows ────────────────────────────────────────────

/** The births, deaths and migration page: N, four flows, N₁ (and ΔN, r). */
const ratesDemo = (
  id: string,
  title: string,
  example: { N: number; B: number; D: number; I: number; E: number },
): ModuleDef => {
  const { N, B, D, I, E } = example;
  return {
    id,
    title,
    use: 'Use this for “A herd of 500 deer has 90 births, 40 deaths, 10 arrivals and 20 departures in a year. What is its new size?”',
    unitSystems: ['metric'],
    assumptions: [
      'Births and immigrants add to a population; deaths and emigrants take away.',
      'The per-capita growth rate counts births minus deaths for each individual, as a percent.',
      'All four counts are over the same time, here one year.',
    ],
    variables: [
      count('N', 'N', 'Population at the start', 1, 1000000),
      count('B', 'B', 'Births', 0, 1000000),
      count('D', 'D', 'Deaths', 0, 1000000),
      count('I', 'I', 'Immigrants', 0, 1000000),
      count('E', 'E', 'Emigrants', 0, 1000000),
      count('dN', 'ΔN', 'Change in population', -2000000, 2000000, true),
      count('N1', 'N₁', 'Population a year later', 0, 3000000, true),
      {
        id: 'r',
        symbol: 'r',
        name: 'Per-capita growth rate',
        unit: '%',
        min: -100,
        max: 100000000,
        step: 0.1,
        derived: true,
      },
    ],
    ...rules(
      forward(
        'dN',
        '{dN} = {B} − {D} + {I} − {E}',
        ['B', 'D', 'I', 'E'],
        (v) => v.B! - v.D! + v.I! - v.E!,
        '{B} − {D} + {I} − {E}',
        'Births and immigrants come in; deaths and emigrants go out.',
      ),
      forward(
        'N1',
        '{N1} = {N} + {dN}',
        ['N', 'dN'],
        (v) => v.N! + v.dN!,
        '{N} + {dN}',
        'Add the change to the starting population.',
      ),
      forward(
        'r',
        '{r} = 100 × ({B} − {D}) ÷ {N}',
        ['B', 'D', 'N'],
        (v) => (100 * (v.B! - v.D!)) / v.N!,
        '100 × ({B} − {D}) ÷ {N}',
        'Births minus deaths for each individual at the start, as a percent.',
      ),
    ),
    example: {
      ...example,
      dN: B - D + I - E,
      N1: N + B - D + I - E,
      r: (100 * (B - D)) / N,
    },
    startWith: ['N', 'B', 'D', 'I', 'E'],
    representation: {
      kind: 'bars',
      bars: [{ var: 'N' }, { var: 'B' }, { var: 'D' }, { var: 'I' }, { var: 'E' }, { var: 'N1' }],
      min: 0,
      max: 600,
      flows: { out: ['D', 'E'] },
    },
  };
};

const RATES_DEMOS: ModuleDef[] = [
  ratesDemo('g.s9-population-ecology-rates-flows', 'Births, deaths and migration', {
    N: 500,
    B: 90,
    D: 40,
    I: 10,
    E: 20,
  }),
  ratesDemo('g.s9-population-ecology-rates-shrinking', 'A shrinking population', {
    N: 20000,
    B: 600,
    D: 900,
    I: 0,
    E: 1500,
  }),
];

// ─── H100 part 4: observe with two rows ──────────────────────────────────────

const COMPETITION_B = [10, 50, 70, 50, 20, 0];

const COMPETITION: LayoutDef = {
  kind: 'observe',
  id: 'g.s9-population-ecology-competition',
  title: 'Two species, one food',
  use: 'Use this for “Two protist species grow together in one dish. Which one wins, and why?”',
  assumptions: [
    'Two species that need the same food compete; the one that gets it faster grows, and the other shrinks.',
    'Grown apart, each species levels off at its own carrying capacity.',
    'When one species dies out in the shared dish, it has been competed out (competitive exclusion).',
  ],
  columns: ['Day 0', 'Day 4', 'Day 8', 'Day 12', 'Day 16', 'Day 20'],
  rowLabel: 'Species A',
  unit: 'per mL',
  max: 200,
  step: 10,
  initial: [10, 60, 130, 170, 180, 190],
  second: { rowLabel: 'Species B', initial: COMPETITION_B },
  pattern: (a, b = COMPETITION_B) => {
    const [la, lb] = [a[a.length - 1]!, b[b.length - 1]!];
    const peakB = Math.max(...b);
    if (lb === 0 && la > 0)
      return `Species B peaks at ${peakB} per mL, then dies out while species A reaches ${la}: A competes B out.`;
    if (la === 0 && lb > 0)
      return `Species A dies out while species B reaches ${lb}: B competes A out.`;
    if (la === 0 && lb === 0) return 'Both species die out: neither holds on to the food.';
    return `By the last day A has ${la} and B has ${lb} per mL: both still share the food.`;
  },
};

// ─── H100 part 6: the replication card ───────────────────────────────────────

const REPLICATION: LayoutDef = {
  kind: 'sequence',
  id: 'g.s9-dna-protein-synthesis-replication',
  title: 'DNA replication',
  use: 'Use this for “How does base pairing let a cell copy its DNA before it divides?”',
  assumptions: [
    'Each old strand is a template: A pairs with T and G with C, so the new strand’s order is fixed.',
    'Replication is semiconservative: each new DNA molecule keeps one old strand.',
    'In the pictures the old strands are dark and the new ones lit.',
  ],
  question: 'Put the steps of DNA replication in order.',
  stages: [
    {
      label: 'Helicase unzips the double helix at an origin',
      figure: { kind: 'replication', stage: 'unzip' },
    },
    {
      label: 'Free nucleotides pair with each old strand, A with T and G with C',
      figure: { kind: 'replication', stage: 'pair' },
    },
    {
      label: 'DNA polymerase joins the new nucleotides into a strand',
      figure: { kind: 'replication', stage: 'join' },
    },
    {
      label: 'Two DNA molecules, each one old strand and one new',
      figure: { kind: 'replication', stage: 'copies' },
    },
  ],
};

// ─── H100 part 5: the gene-expression figure ─────────────────────────────────

const GENE_EXPRESSION: LayoutDef = {
  kind: 'explore',
  id: 'g.s9-biotechnology-gene-expression',
  title: 'Genes switched on and off',
  use: 'Use this for “Why does a bacterium make the enzymes for lactose only when lactose is there?”',
  assumptions: [
    'Every cell has the same genes, but it reads only some of them: those genes are expressed.',
    'RNA polymerase binds the promoter in front of a gene and copies the gene into mRNA.',
    'Proteins on the DNA near the promoter switch the gene off (repressors) or on (activators).',
  ],
  figure: { kind: 'geneExpression' },
  scenes: [
    {
      label: 'Repressor on',
      lines: [
        'With no lactose, the repressor sits on the operator and blocks RNA polymerase.',
        'The gene is off: no mRNA, so no lactose enzymes are wasted.',
      ],
      gene: { control: 'repressor', lit: 'protein' },
    },
    {
      label: 'Lactose arrives',
      lines: [
        'Lactose binds the repressor and changes its shape, so it lets go of the operator.',
        'The gene is on: RNA polymerase reads it into mRNA.',
      ],
      gene: { control: 'repressor', signal: true, lit: 'signal' },
    },
    {
      label: 'The promoter',
      lines: [
        'RNA polymerase always starts at the promoter, the stretch just in front of the gene.',
      ],
      gene: { control: 'repressor', signal: true, lit: 'promoter' },
    },
    {
      label: 'No activator',
      lines: [
        'Some genes need an activator: without its signal the activator stays off the DNA.',
        'The gene is off: the polymerase does not start.',
      ],
      gene: { control: 'activator', lit: 'switch' },
    },
    {
      label: 'Activator bound',
      lines: [
        'With its signal the activator binds in front of the promoter and helps the polymerase on.',
        'The gene is on.',
      ],
      gene: { control: 'activator', signal: true, lit: 'mRNA' },
    },
  ],
};

// ─── H100 part 12: the dichotomous key ───────────────────────────────────────

const KEY: LayoutDef = {
  kind: 'explore',
  id: 'g.s9-classification-key',
  title: 'A dichotomous key',
  use: 'Use this for “Use the key to name the animal: it has no backbone and a segmented body.”',
  assumptions: [
    'A dichotomous key asks one yes-or-no question at a time about a trait you can see.',
    'Each answer leads to the next question or to a name, so every path ends at one organism.',
  ],
  figure: {
    kind: 'dichotomousKey',
    steps: [
      { question: 'Does it have a backbone?', yes: 1, no: 2 },
      { question: 'Does it have hair?', yes: 'Human', no: 'Fish' },
      { question: 'Does it have true tissues?', yes: 3, no: 'Sponge' },
      { question: 'Is its body divided into segments?', yes: 'Earthworm', no: 4 },
      { question: 'Does it have stinging tentacles?', yes: 'Jellyfish', no: 'Sea star' },
    ],
  },
  scenes: [
    {
      label: 'The first question',
      lines: ['Every animal starts at the top: a backbone or not splits the six into two groups.'],
      key: { step: 0 },
    },
    {
      label: 'Earthworm',
      lines: ['No backbone, true tissues, a segmented body: three answers lead to the earthworm.'],
      key: { specimen: 'Earthworm' },
    },
    {
      label: 'Sea star',
      lines: ['No backbone, true tissues, no segments and no stinging tentacles: a sea star.'],
      key: { specimen: 'Sea star' },
    },
    {
      label: 'Human',
      lines: ['A backbone and hair: two questions are enough for a mammal.'],
      key: { specimen: 'Human' },
    },
  ],
};

// ─── H100 part 10 and H104: sorts with a sentence above the cards and icons on the bins ──

/** A sort whose bins wear card icons: [id, label, why, icon] each. */
const iconSort = (
  base: Omit<Extract<LayoutDef, { kind: 'sort' }>, 'kind' | 'bins'>,
  bins: [string, string, string, CardIcon][],
): LayoutDef => ({
  kind: 'sort',
  ...base,
  bins: bins.map(([id, label, why, icon]) => ({
    id,
    label,
    why,
    figure: { kind: 'icon', icon },
  })),
});

const TRANSPORT_SORT = iconSort(
  {
    id: 'g.s9-membrane-transport-transport-types',
    title: 'Which kind of transport is it?',
    use: 'Use this for “Is it passive or active transport, and does it need a protein?”',
    assumptions: [
      'Passive transport runs from more to fewer and uses no ATP; active transport runs the other way and spends ATP.',
      'Facilitated diffusion and osmosis are passive but go through a channel or carrier protein.',
    ],
    question: 'How does it cross the membrane?',
    intro:
      'Each group’s picture shows the membrane, outside above, and how the particles cross it.',
    cards: [
      { label: 'O₂ enters a lung cell', bin: 'simple' },
      { label: 'CO₂ leaves a muscle cell', bin: 'simple' },
      { label: 'Glucose enters a red blood cell through a carrier protein', bin: 'facilitated' },
      { label: 'K⁺ leaves through an open channel, high to low', bin: 'facilitated' },
      { label: 'Water enters a root cell through aquaporins', bin: 'osmosis' },
      { label: 'The Na⁺/K⁺ pump spends ATP', bin: 'active' },
      { label: 'Root cells take in minerals from soil that has fewer of them', bin: 'active' },
      { label: 'A white blood cell engulfs a bacterium', bin: 'bulk' },
      { label: 'A gland cell releases insulin in vesicles', bin: 'bulk' },
    ],
  },
  [
    [
      'simple',
      'Simple diffusion',
      'Small nonpolar molecules slip between the phospholipids, from more to fewer.',
      'simple diffusion',
    ],
    [
      'facilitated',
      'Facilitated diffusion',
      'A channel or carrier protein lets it through, still from more to fewer, with no ATP.',
      'channel protein',
    ],
    [
      'osmosis',
      'Osmosis',
      'Water crosses, through aquaporins, toward the side with more solute.',
      'aquaporin',
    ],
    [
      'active',
      'Active transport',
      'A pump moves it from fewer to more, against the gradient, spending ATP.',
      'protein pump',
    ],
    [
      'bulk',
      'Bulk transport',
      'Large particles or many molecules move inside vesicles made from membrane.',
      'vesicle transport',
    ],
  ],
);

const BLOOD_SORT = iconSort(
  {
    id: 'g.s9-inheritance-patterns-blood-types',
    title: 'ABO blood types from genotypes',
    use: 'Use this for “Which two genotypes give the same blood type?”',
    assumptions: [
      'The ABO gene has three alleles: Iᴬ, Iᴮ and i.',
      'Iᴬ and Iᴮ are codominant, so IᴬIᴮ shows both; i is recessive to each of them.',
    ],
    question: 'Which blood type does the genotype give?',
    intro: 'Three alleles: Iᴬ and Iᴮ are codominant, and i is recessive to both.',
    cards: [
      { label: 'IᴬIᴬ', bin: 'A' },
      { label: 'Iᴬi', bin: 'A' },
      { label: 'IᴮIᴮ', bin: 'B' },
      { label: 'Iᴮi', bin: 'B' },
      { label: 'IᴬIᴮ', bin: 'AB' },
      { label: 'ii', bin: 'O' },
    ],
  },
  [
    ['A', 'Type A', 'At least one Iᴬ and no Iᴮ: i is hidden.', 'blood type A'],
    ['B', 'Type B', 'At least one Iᴮ and no Iᴬ: i is hidden.', 'blood type B'],
    ['AB', 'Type AB', 'Codominance: both A and B markers show on the cells.', 'blood type AB'],
    ['O', 'Type O', 'Two recessive i alleles: no A or B marker.', 'blood type O'],
  ],
);

const SYSTEMS_SORT = iconSort(
  {
    id: 'g.s9-homeostasis-systems',
    title: 'Which body system does it?',
    use: 'Use this for “Which organ system filters the blood and controls the water in it?”',
    assumptions: [
      'The nervous and endocrine systems coordinate the rest: nerves by fast signals, glands by hormones in the blood.',
      'Body systems work together to keep homeostasis.',
    ],
    question: 'Which system does the job?',
    intro: 'The nervous and endocrine systems coordinate the rest.',
    cards: [
      { label: 'Neurons carry signals from sense receptors', bin: 'nervous' },
      { label: 'A reflex pulls a hand away from heat', bin: 'nervous' },
      { label: 'The pancreas releases insulin', bin: 'endocrine' },
      { label: 'Adrenal glands release adrenaline', bin: 'endocrine' },
      { label: 'Red blood cells carry oxygen', bin: 'circulatory' },
      { label: 'Skin blood vessels widen to release heat', bin: 'circulatory' },
      { label: 'Alveoli exchange O₂ and CO₂', bin: 'respiratory' },
      { label: 'Faster breathing removes extra CO₂', bin: 'respiratory' },
      { label: 'Kidneys filter urea from the blood', bin: 'excretory' },
      { label: 'Kidneys adjust the water in urine', bin: 'excretory' },
      { label: 'Enzymes break food into small molecules', bin: 'digestive' },
      { label: 'The small intestine absorbs glucose', bin: 'digestive' },
    ],
  },
  [
    ['nervous', 'Nervous', 'Neurons carry fast electrical signals.', 'nervous system'],
    ['endocrine', 'Endocrine', 'Glands release hormones into the blood.', 'endocrine system'],
    [
      'circulatory',
      'Circulatory',
      'Blood carries gases, food and heat.',
      'heart and blood vessels',
    ],
    [
      'respiratory',
      'Respiratory',
      'The lungs trade O₂ and CO₂ with the air.',
      'respiratory system',
    ],
    [
      'excretory',
      'Excretory',
      'The kidneys remove wastes and set the blood’s water.',
      'excretory system',
    ],
    ['digestive', 'Digestive', 'Food is broken down and absorbed.', 'digestive system'],
  ],
);

const PATHOGEN_SORT = iconSort(
  {
    id: 'g.s9-immune-disease-pathogens-bins',
    title: 'Kinds of pathogens',
    use: 'Use this for “Strep throat or the flu: which one can an antibiotic treat?”',
    assumptions: [
      'A pathogen is anything that causes disease: a virus, a bacterium, a fungus or a parasite.',
      'Bacteria, fungi and parasites are cells; a virus is not, and copies itself only inside a host cell.',
    ],
    question: 'What kind of pathogen causes it?',
    intro: 'Antibiotics work on bacteria only: they do nothing to viruses.',
    cards: [
      { label: 'Influenza', bin: 'virus' },
      { label: 'Measles', bin: 'virus' },
      { label: 'The common cold', bin: 'virus' },
      { label: 'Strep throat', bin: 'bacterium' },
      { label: 'Tuberculosis', bin: 'bacterium' },
      { label: 'Athlete’s foot', bin: 'fungus' },
      { label: 'Ringworm', bin: 'fungus' },
      { label: 'Malaria', bin: 'parasite' },
      { label: 'Tapeworm', bin: 'parasite' },
    ],
  },
  [
    ['virus', 'Virus', 'Genes in a protein coat, copied only inside a host’s cells.', 'virus'],
    ['bacterium', 'Bacterium', 'A single cell with no nucleus.', 'bacterium'],
    ['fungus', 'Fungus', 'Cells with a nucleus and a wall, living on the host.', 'fungus'],
    ['parasite', 'Parasite', 'A protist or an animal that lives on or in the host.', 'parasite'],
  ],
);

const DOMAIN_SORT = iconSort(
  {
    id: 'g.s9-classification-domains-bins',
    title: 'The three domains',
    use: 'Use this for “Methane-making microbes live in a cow’s stomach. Which domain are they in?”',
    assumptions: [
      'Bacteria and archaea are single cells with no nucleus; archaea differ in their walls, membranes and genes, and many live in extreme places.',
      'Eukarya have cells with a nucleus: protists, fungi, plants and animals.',
    ],
    question: 'Which domain does it belong to?',
    intro: 'Viruses are not cells, so they are not placed in any domain.',
    cards: [
      { label: 'E. coli in the gut', bin: 'bacteria' },
      { label: 'Streptococcus that causes strep throat', bin: 'bacteria' },
      { label: 'Cyanobacteria in a pond', bin: 'bacteria' },
      { label: 'Methane-making microbes in a cow’s stomach', bin: 'archaea' },
      { label: 'Halobacterium in a salt pond', bin: 'archaea' },
      { label: 'Paramecium (protist)', bin: 'eukarya' },
      { label: 'Mushrooms (fungi)', bin: 'eukarya' },
      { label: 'A leafy plant', bin: 'eukarya' },
      { label: 'A fish (animal)', bin: 'eukarya' },
    ],
  },
  [
    [
      'bacteria',
      'Bacteria',
      'Prokaryotes with cell walls made of peptidoglycan.',
      'domain Bacteria',
    ],
    [
      'archaea',
      'Archaea',
      'Prokaryotes whose walls and membranes are built differently from bacteria’s.',
      'domain Archaea',
    ],
    ['eukarya', 'Eukarya', 'Every cell has a nucleus inside a membrane.', 'domain Eukarya'],
  ],
);

const SAMPLING_SORT = iconSort(
  {
    id: 'g.m11-study-design-sampling-bins',
    title: 'Which sampling method?',
    use: 'Use this for “A school picks 20 students at random from each grade. Which sampling method is this?”',
    assumptions: [
      'Random picks give every member a known chance of being chosen.',
      'Strata make sure every group is in the sample; clusters save travel.',
      'A convenience sample is easy but usually biased.',
    ],
    question: 'Which sampling method is it?',
    intro:
      'Random picks give every member a known chance; strata make sure every group is in, clusters save travel, and convenience is easy but usually biased.',
    cards: [
      { label: 'Draw 50 student ID numbers at random', bin: 'random' },
      { label: 'Number every apartment and let a random generator pick 20', bin: 'random' },
      { label: 'Pick 20 students at random from each grade', bin: 'stratified' },
      {
        label: 'Split the team into starters and bench and pick at random from each',
        bin: 'stratified',
      },
      { label: 'Choose 5 homerooms at random and ask everyone in them', bin: 'cluster' },
      { label: 'Pick 3 city blocks at random and visit every home', bin: 'cluster' },
      { label: 'Take every 10th name after a random start', bin: 'systematic' },
      { label: 'Test every 4th battery off the line', bin: 'systematic' },
      { label: 'Ask the first 30 people through the door', bin: 'convenience' },
      { label: 'Ask the friends at your lunch table', bin: 'convenience' },
    ],
  },
  [
    [
      'random',
      'Simple random',
      'Every member, and every group of that size, has the same chance.',
      'simple random sample',
    ],
    [
      'stratified',
      'Stratified',
      'The population is split into groups, and some are picked at random from each.',
      'stratified sample',
    ],
    [
      'cluster',
      'Cluster',
      'Whole groups are picked at random, and everyone in them is asked.',
      'cluster sample',
    ],
    [
      'systematic',
      'Systematic',
      'Every kth member of a list, from a random start.',
      'systematic sample',
    ],
    [
      'convenience',
      'Convenience',
      'Whoever is easiest to reach: not random, so it can be biased.',
      'convenience sample',
    ],
  ],
);

// ─── H104 part 3: percentBar with a second mark ──────────────────────────────

const pct = (id: string, symbol: string, name: string, min: number, step: number): VariableDef => ({
  id,
  symbol,
  name,
  unit: '%',
  min,
  max: 100,
  step,
});

/** The herd-immunity page: H and C on one bar, C shaded over the community P. */
const herdDemo = (id: string, title: string, R0: number, e: number, P: number): ModuleDef => {
  const H = 100 * (1 - 1 / R0);
  const C = (100 * H) / e;
  return {
    id,
    title,
    use: 'Use this for “Each case of a disease infects 5 people. What share must be vaccinated to stop it spreading?”',
    unitSystems: ['metric'],
    assumptions: [
      'R₀ is how many people one case infects when no one is immune; it differs by disease, about 12–18 for measles.',
      'Spread stops once each case infects fewer than one more: a share H = 1 − 1 ÷ R₀ must be immune.',
      'A vaccine that works in e% of people means more must be vaccinated; everyone is assumed to mix evenly.',
    ],
    variables: [
      { id: 'R0', symbol: 'R₀', name: 'People one case infects', min: 1.1, max: 20, step: 0.1 },
      { ...pct('H', 'H', 'Share immune to stop spread', 0, 0.1), derived: true },
      pct('e', 'e', 'Vaccine effectiveness', 50, 1),
      { ...pct('C', 'C', 'Share to vaccinate', 0, 0.1), derived: true },
      count('P', 'P', 'People in the community', 100, 10000000),
      {
        id: 'V',
        symbol: 'V',
        name: 'People to vaccinate',
        min: 0,
        max: 10000000,
        step: 1,
        derived: true,
      },
    ],
    ...rules(
      forward(
        'H',
        '{H} = 100 × (1 − 1 ÷ {R0})',
        ['R0'],
        (v) => 100 * (1 - 1 / v.R0!),
        '100 × (1 − 1 ÷ {R0})',
        'Each case must infect fewer than one person, so all but 1 in R₀ must be immune.',
      ),
      forward(
        'C',
        '{C} = 100 × {H} ÷ {e}',
        ['H', 'e'],
        (v) => (100 * v.H!) / v.e!,
        '100 × {H} ÷ {e}',
        'Only e% of those vaccinated become immune, so divide the share needed by e%.',
      ),
      forward(
        'V',
        '{V} = {P} × {C} ÷ 100',
        ['P', 'C'],
        (v) => (v.P! * v.C!) / 100,
        '{P} × {C} ÷ 100',
        'That percent of the people in the community.',
      ),
    ),
    example: { R0, H, e, C, P, V: (P * C) / 100 },
    startWith: ['R0', 'e', 'P'],
    representation: { kind: 'percentBar', percent: 'C', part: 'V', whole: 'P', second: 'H' },
  };
};

const HERD_DEMOS: ModuleDef[] = [
  herdDemo('g.s9-immune-disease-herd-immunity', 'Herd immunity', 5, 95, 19000),
  herdDemo('g.s9-immune-disease-herd-immunity-measles', 'Herd immunity for measles', 15, 97, 30000),
];

// ─── H100 part 3: cellDivision as a calculator picture ───────────────────────

/** The chromosome-count page: 2n in a body cell → n, chromatids, the zygote, 2ⁿ gametes. */
const chromosomeDemo = (id: string, title: string, D: number, extra: string): ModuleDef => ({
  id,
  title,
  use: 'Use this for “A body cell has 46 chromosomes. How many are in a gamete, and in a zygote?”',
  assumptions: [
    'A body cell holds 2n chromosomes: n pairs, one of each pair from each parent.',
    'Meiosis leaves one chromosome of each pair in a gamete; fertilization joins two gametes.',
    extra,
  ],
  variables: [
    { ...count('D', '2n', 'Chromosomes in a body cell', 2, 100), multipleOf: 2 },
    count('n', 'n', 'Chromosomes in a gamete', 1, 50, true),
    count('X', 'X', 'Chromatids at metaphase', 4, 200, true),
    count('Z', 'Z', 'Chromosomes in a zygote', 2, 100, true),
    count('C', 'C', 'Kinds of gamete', 2, 2 ** 50, true),
  ],
  ...rules(
    forward(
      'n',
      '{n} = {D} ÷ 2',
      ['D'],
      (v) => v.D! / 2,
      '{D} ÷ 2',
      'A gamete keeps one of each pair.',
    ),
    forward(
      'X',
      '{X} = 2 × {D}',
      ['D'],
      (v) => 2 * v.D!,
      '2 × {D}',
      'Before division each chromosome is copied: two sister chromatids.',
    ),
    forward(
      'Z',
      '{Z} = {n} + {n}',
      ['n'],
      (v) => 2 * v.n!,
      '{n} + {n}',
      'An egg and a sperm join.',
    ),
    forward(
      'C',
      '{C} = 2^{n}',
      ['n'],
      (v) => 2 ** v.n!,
      '2^{n}',
      'Each pair lines up either way round, so every pair doubles the kinds of gamete.',
    ),
  ),
  example: { D, n: D / 2, X: 2 * D, Z: D, C: 2 ** (D / 2) },
  startWith: ['D'],
  representation: {
    kind: 'cellDivision',
    diploid: 'D',
    haploid: 'n',
    chromatids: 'X',
    zygote: 'Z',
    combinations: 'C',
  },
});

const DIVISION_DEMOS: ModuleDef[] = [
  chromosomeDemo(
    'g.s9-mitosis-meiosis-chromosome-count',
    'Counting chromosomes',
    8,
    'A fruit fly has 2n = 8; crossing over is left out of the count of gametes.',
  ),
  chromosomeDemo(
    'g.s9-mitosis-meiosis-chromosome-count-human',
    'Counting human chromosomes',
    46,
    'A human body cell has 2n = 46: past 8 the picture draws one pair and writes the count.',
  ),
];

export const HS2E_GALLERY_MODULES: ModuleDef[] = [
  ...MACRO_DEMOS,
  ...GENE_DEMOS,
  ...DIVISION_DEMOS,
  PHOTOSYNTHESIS,
  ...RATES_DEMOS,
  ...HERD_DEMOS,
];

export const HS2E_GALLERY_LAYOUTS: LayoutDef[] = [
  COMPETITION,
  REPLICATION,
  GENE_EXPRESSION,
  KEY,
  TRANSPORT_SORT,
  BLOOD_SORT,
  SYSTEMS_SORT,
  PATHOGEN_SORT,
  DOMAIN_SORT,
  SAMPLING_SORT,
];
