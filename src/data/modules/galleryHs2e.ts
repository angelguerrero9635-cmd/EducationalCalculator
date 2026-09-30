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
];

export const HS2E_GALLERY_LAYOUTS: LayoutDef[] = [COMPETITION, REPLICATION];
