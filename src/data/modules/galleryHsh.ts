/**
 * Grades 9–12 gallery demos (group HH; see pictureRequestsHs.ts and docs/RENDERINGS_HS.md).
 * Each demo stands in for a planned page: real variables, relations, steps and a use line, so
 * `scripts/promote-demo.mjs` can copy it into a grade file. Spread into gallery.ts.
 *
 * Biology H37–H42: gel electrophoresis and PCR, allele frequencies, cladograms, energy
 * pyramids, succession and the nitrogen cycle, feedback loops, and the immune response.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import { div } from './helpers';
import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

type Rel = { relation: Relation; steps: Record<string, StepText> };

const V = (
  id: string,
  symbol: string,
  name: string,
  extra: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...extra });

const rels = (...rs: Rel[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

/** total = the parts added; `what` names the parts ("fragments"). */
function total(t: string, parts: string[], symbols: Record<string, string>, what: string): Rel {
  const rest = (p: string) => parts.filter((x) => x !== p);
  const sym = (id: string) => symbols[id] ?? id;
  return {
    relation: {
      id: `${sym(t)} = ${parts.map(sym).join(' + ')}`,
      display: `{${t}} = ${parts.map((p) => `{${p}}`).join(' + ')}`,
      vars: [t, ...parts],
      residual: (v: Values) => v[t]! - parts.reduce((s, p) => s + v[p]!, 0),
      solve: Object.fromEntries([
        [t, (v: Values) => parts.reduce((s, p) => s + v[p]!, 0)],
        ...parts.map((p) => [p, (v: Values) => v[t]! - rest(p).reduce((s, q) => s + v[q]!, 0)]),
      ]),
    },
    steps: Object.fromEntries([
      [
        t,
        {
          expr: parts.map((p) => `{${p}}`).join(' + '),
          how: `The ${what} add back up to the whole piece.`,
        },
      ],
      ...parts.map((p) => [
        p,
        {
          expr: `{${t}} − ${rest(p)
            .map((q) => `{${q}}`)
            .join(' − ')}`,
          how: `Take the other ${what} away from the whole.`,
        },
      ]),
    ]),
  };
}

// ── H37 gel: gel electrophoresis and PCR ──

const bp = (id: string, symbol: string, name: string, derived = false) =>
  V(id, symbol, name, { unit: 'bp', min: 10, max: 20000, step: 10, integer: true, derived });

const GEL_WHY = [
  'DNA is negatively charged, so in the gel it moves away from the − end toward +.',
  'Short pieces slip through the gel faster, so they run farther; the ladder’s known sizes are the ruler.',
  'Distance run falls with the log of the size: each 10 times longer runs the same step less far.',
];

const gelCut: ModuleDef = {
  id: 'g.s9-biotechnology-gel',
  title: 'Gel electrophoresis: a piece of DNA cut once',
  use: 'Use this for the fragments a restriction enzyme makes and where they run on a gel.',
  assumptions: [
    'A restriction enzyme cuts the linear DNA at its one recognition site, making two fragments.',
    ...GEL_WHY,
  ],
  variables: [
    bp('L', 'L', 'Length of the uncut DNA'),
    bp('a', 'a', 'Longer fragment'),
    bp('b', 'b', 'Shorter fragment'),
  ],
  ...rels(total('L', ['a', 'b'], {}, 'fragments')),
  example: { L: 4000, a: 2500, b: 1500 },
  startWith: ['L', 'a'],
  representation: {
    kind: 'gel',
    lanes: [
      { label: 'Uncut', bands: ['L'] },
      { label: 'Cut', bands: ['a', 'b'] },
    ],
    keep: ['L'],
  },
};

const gelDouble: ModuleDef = {
  id: 'g.s9-biotechnology-gel-map',
  title: 'Mapping cut sites from a double digest',
  use: 'Use this for placing two enzymes’ cut sites from the fragments each one makes.',
  assumptions: [
    'Enzyme A cuts the linear DNA once, and enzyme B cuts it once at another site.',
    'Cut with both, the DNA falls into three pieces in order: a, then b, then c.',
    'Enzyme A alone leaves a and the piece b + c; enzyme B alone leaves a + b and c.',
    GEL_WHY[1]!,
  ],
  variables: [
    bp('L', 'L', 'Length of the DNA'),
    bp('a', 'a', 'Left piece'),
    bp('b', 'b', 'Middle piece'),
    bp('c', 'c', 'Right piece'),
    bp('x', 'x', 'Enzyme A’s second piece (b + c)', true),
    bp('y', 'y', 'Enzyme B’s first piece (a + b)', true),
  ],
  ...rels(
    total('L', ['a', 'b', 'c'], {}, 'three pieces'),
    total('x', ['b', 'c'], {}, 'pieces right of site A'),
    total('y', ['a', 'b'], {}, 'pieces left of site B'),
  ),
  example: { L: 5000, a: 3000, b: 1200, c: 800, x: 2000, y: 4200 },
  startWith: ['L', 'a', 'b'],
  representation: {
    kind: 'gel',
    lanes: [
      { label: 'Uncut', bands: ['L'] },
      { label: 'A', bands: ['a', 'x'] },
      { label: 'B', bands: ['y', 'c'] },
      { label: 'A and B', bands: ['a', 'b', 'c'] },
    ],
    // Three typed pieces share one lane: no handles, the boxes set the sizes.
    fixed: true,
  },
};

const gelSmall: ModuleDef = {
  ...gelCut,
  id: 'g.s9-biotechnology-gel-small',
  title: 'Gel electrophoresis: a cut near one end',
  use: 'Use this for a cut near the end of the DNA: one long fragment and one very short one.',
  example: { L: 9000, a: 8850, b: 150 },
};

const pcr: ModuleDef = {
  id: 'g.s9-biotechnology-pcr',
  title: 'PCR: copies double each cycle',
  use: 'Use this for the copies of a DNA piece after n cycles of PCR, N = N₀ × 2ⁿ.',
  assumptions: [
    'Each cycle heats the DNA to separate the strands, cools it so primers bind, and copies each strand.',
    'Every strand is copied each cycle, so the number of copies doubles.',
    'Real reactions slow down after about 30 cycles, when the primers and nucleotides run low.',
  ],
  variables: [
    V('n0', 'N₀', 'Starting copies', { min: 1, max: 1000, step: 1, integer: true }),
    V('n', 'n', 'Cycles', { min: 0, max: 40, step: 1, integer: true }),
    V('N', 'N', 'Copies after n cycles', { min: 1, max: 1e15 }),
  ],
  ...rels({
    relation: {
      id: 'N = N₀ × 2^n',
      display: '{N} = {n0} × 2^{n}',
      vars: ['N', 'n0', 'n'],
      residual: (v: Values) => v.N! - v.n0! * 2 ** v.n!,
      solve: {
        N: (v: Values) => v.n0! * 2 ** v.n!,
        n0: (v: Values) => div(v.N!, 2 ** v.n!),
        n: (v: Values) => (v.N! > 0 && v.n0! > 0 ? Math.log2(v.N! / v.n0!) : undefined),
      },
    },
    steps: {
      N: { expr: '{n0} × 2^{n}', how: 'Each cycle doubles the copies: n doublings of N₀.' },
      n0: { expr: '{N} ÷ 2^{n}', how: 'Undo the n doublings: halve N, n times.' },
      n: { expr: 'log_2({N} ÷ {n0})', how: 'How many doublings turn N₀ into N.' },
    },
  }),
  example: { n0: 1, n: 5, N: 32 },
  startWith: ['n0', 'n'],
  representation: { kind: 'gel', pcr: { cycles: 'n', start: 'n0', copies: 'N' } },
};

const pcrMany: ModuleDef = {
  ...pcr,
  id: 'g.s9-biotechnology-pcr-cycles',
  title: 'PCR: a billion copies',
  use: 'Use this for how many PCR cycles make a given number of copies.',
  example: { n0: 10, n: 30, N: 10 * 2 ** 30 },
};

// ── H38 alleleFrequencies: Hardy–Weinberg ──

const freq = (id: string, symbol: string, name: string) =>
  V(id, symbol, name, { min: 0, max: 1, step: 0.0001 });

/** a = f(b) with its inverse, one line each way. */
function oneWay(
  id: string,
  display: string,
  [a, b]: [string, string],
  there: (x: number) => number | undefined,
  back: (x: number) => number | undefined,
  steps: Record<string, StepText>,
): Rel {
  return {
    relation: {
      id,
      display,
      vars: [a, b],
      residual: (v: Values) => v[a]! - (there(v[b]!) ?? NaN),
      solve: { [a]: (v: Values) => there(v[b]!), [b]: (v: Values) => back(v[a]!) },
    },
    steps,
  };
}

const HW_WHY = [
  'In a large population with random mating, no selection, no migration and no mutation, allele frequencies stay the same.',
  'p is the dominant allele’s share of all alleles and q the recessive one’s, so p + q = 1.',
  'Then the genotypes are p² AA, 2pq Aa and q² aa, and p² + 2pq + q² = 1.',
];

const hwRels = [
  oneWay(
    'q² = q^2',
    '{q2} = {q}^2',
    ['q2', 'q'],
    (q) => q * q,
    (q2) => (q2 >= 0 ? Math.sqrt(q2) : undefined),
    {
      q2: { expr: '{q}^2', how: 'Two recessive alleles meet with chance q × q.' },
      q: {
        expr: '√{q2}',
        how: 'Only aa shows the recessive trait, so q is the root of its share.',
      },
    },
  ),
  oneWay(
    'p = 1 − q',
    '{p} = 1 − {q}',
    ['p', 'q'],
    (q) => 1 - q,
    (p) => 1 - p,
    {
      p: { expr: '1 − {q}', how: 'The two alleles’ shares add to 1.' },
      q: { expr: '1 − {p}', how: 'The two alleles’ shares add to 1.' },
    },
  ),
  oneWay(
    'p² = p^2',
    '{P2} = {p}^2',
    ['P2', 'p'],
    (p) => p * p,
    (P2) => (P2 >= 0 ? Math.sqrt(P2) : undefined),
    {
      P2: { expr: '{p}^2', how: 'Two dominant alleles meet with chance p × p.' },
      p: { expr: '√{P2}', how: 'p is the root of the AA share.' },
    },
  ),
  {
    relation: {
      id: 'H = 2pq',
      display: '{H} = 2 × {p} × {q}',
      vars: ['H', 'p', 'q'],
      residual: (v: Values) => v.H! - 2 * v.p! * v.q!,
      solve: {
        H: (v: Values) => 2 * v.p! * v.q!,
        p: (v: Values) => div(v.H!, 2 * v.q!),
        q: (v: Values) => div(v.H!, 2 * v.p!),
      },
    },
    steps: {
      H: {
        expr: '2 × {p} × {q}',
        how: 'A from one parent and a from the other, or the other way round: twice p × q.',
      },
      p: { expr: '{H} ÷ (2 × {q})', how: 'Undo the 2 and the q.' },
      q: { expr: '{H} ÷ (2 × {p})', how: 'Undo the 2 and the p.' },
    },
  } as Rel,
];

const hardyWeinberg: ModuleDef = {
  id: 'g.s9-evolution-evidence-hardy-weinberg',
  title: 'Hardy–Weinberg: carriers from the recessive trait',
  use: 'Use this for allele and genotype frequencies from the share showing a recessive trait.',
  assumptions: HW_WHY,
  variables: [
    freq('q2', 'q²', 'Share with the recessive trait (aa)'),
    freq('q', 'q', 'Frequency of allele a'),
    freq('p', 'p', 'Frequency of allele A'),
    freq('P2', 'p²', 'Share that is AA'),
    freq('H', '2pq', 'Share of carriers (Aa)'),
  ],
  ...rels(...hwRels),
  example: { q2: 0.09, q: 0.3, p: 0.7, P2: 0.49, H: 0.42 },
  startWith: ['q2'],
  representation: { kind: 'alleleFrequencies', p: 'p', q: 'q', genotypes: ['P2', 'H', 'q2'] },
};

const hardyWeinbergRare: ModuleDef = {
  ...hardyWeinberg,
  id: 'g.s9-evolution-evidence-rare-allele',
  title: 'Hardy–Weinberg: a rare recessive allele',
  use: 'Use this for how many people carry a rare recessive allele without showing it.',
  example: { q2: 0.0001, q: 0.01, p: 0.99, P2: 0.9801, H: 0.0198 },
};

const count = (id: string, symbol: string, name: string) =>
  V(id, symbol, name, { min: 0, max: 10000, step: 1, integer: true });

const alleleCounts: ModuleDef = {
  id: 'g.s9-evolution-evidence-allele-counts',
  title: 'Allele frequencies from genotype counts',
  use: 'Use this for p and q from counts of AA, Aa and aa individuals.',
  assumptions: [
    'Each individual has two alleles: AA has two A, Aa one A and one a, aa two a.',
    'So N individuals carry 2N alleles, and p is the share of them that are A.',
  ],
  variables: [
    count('nAA', 'n_AA', 'Individuals AA'),
    count('nAa', 'n_Aa', 'Individuals Aa'),
    count('naa', 'n_aa', 'Individuals aa'),
    V('N', 'N', 'Individuals in all', { min: 1, max: 30000, step: 1, integer: true }),
    // Worked out from the counts only: a frequency can't say how many individuals there are.
    { ...freq('p', 'p', 'Frequency of allele A'), derived: true },
    { ...freq('q', 'q', 'Frequency of allele a'), derived: true },
  ],
  ...rels(
    total('N', ['nAA', 'nAa', 'naa'], { nAA: 'n_AA', nAa: 'n_Aa', naa: 'n_aa' }, 'counts'),
    {
      relation: {
        id: 'p = (2n_AA + n_Aa) ÷ 2N',
        display: '{p} = (2 × {nAA} + {nAa}) ÷ (2 × {N})',
        vars: ['p', 'nAA', 'nAa', 'N'],
        residual: (v: Values) => 2 * v.N! * v.p! - (2 * v.nAA! + v.nAa!),
        solve: { p: (v: Values) => div(2 * v.nAA! + v.nAa!, 2 * v.N!) },
      },
      steps: {
        p: {
          expr: '(2 × {nAA} + {nAa}) ÷ (2 × {N})',
          how: 'Count the A alleles (two per AA, one per Aa) out of 2N alleles.',
        },
      },
    },
    hwRels[1]!,
  ),
  example: { nAA: 36, nAa: 48, naa: 16, N: 100, p: 0.6, q: 0.4 },
  startWith: ['nAA', 'nAa', 'naa'],
  representation: { kind: 'alleleFrequencies', p: 'p', q: 'q', fixed: true },
};

export const HSH_GALLERY_MODULES: ModuleDef[] = [
  gelCut,
  gelDouble,
  gelSmall,
  pcr,
  pcrMany,
  hardyWeinberg,
  hardyWeinbergRare,
  alleleCounts,
];
export const HSH_GALLERY_LAYOUTS: LayoutDef[] = [
  // ── H38: homologous limbs ──
  {
    id: 'g.s9-evolution-evidence-limbs',
    title: 'Homologous structures: the same bones',
    kind: 'sort',
    use: 'Use this for telling homologous structures from analogous ones.',
    assumptions: [
      'Homologous structures have the same bones in the same order, inherited from a common ancestor.',
      'They can do different jobs: grasping, flying, swimming or walking.',
      'Analogous structures do the same job but are built differently, so they show no shared ancestry.',
    ],
    question: 'Is it built from the same bones as a human arm?',
    bins: [
      {
        id: 'homologous',
        label: 'Same bones (homologous)',
        why: 'Upper arm, two forearm bones, wrist and fingers, in the same order.',
      },
      {
        id: 'analogous',
        label: 'Different build (analogous)',
        why: 'It flies like a bat wing, but it has no bones at all.',
      },
    ],
    cards: [
      { label: 'Human arm', bin: 'homologous', figure: { kind: 'icon', icon: 'human arm bones' } },
      { label: 'Bat wing', bin: 'homologous', figure: { kind: 'icon', icon: 'bat wing bones' } },
      {
        label: 'Whale flipper',
        bin: 'homologous',
        figure: { kind: 'icon', icon: 'whale flipper bones' },
      },
      { label: 'Cat foreleg', bin: 'homologous', figure: { kind: 'icon', icon: 'cat leg bones' } },
      { label: 'Insect wing', bin: 'analogous', figure: { kind: 'icon', icon: 'insect wing' } },
    ],
  },
  // ── H39 cladogram ──
  {
    id: 'g.s9-classification-cladogram',
    title: 'Reading a cladogram',
    kind: 'explore',
    use: 'Use this for reading which groups share which traits, and which taxa are most closely related.',
    assumptions: [
      'A cladogram groups organisms by shared derived traits: new features passed on to every descendant.',
      'Each branch point is a common ancestor; taxa that split later are more closely related.',
      'A clade is an ancestor and all of its descendants.',
    ],
    figure: {
      kind: 'cladogram',
      tree: ['Lancelet', ['Lamprey', ['Shark', ['Frog', ['Lizard', 'Mouse']]]]],
      traits: [
        { name: 'Backbone', taxa: ['Lamprey', 'Shark', 'Frog', 'Lizard', 'Mouse'] },
        { name: 'Jaws', taxa: ['Shark', 'Frog', 'Lizard', 'Mouse'] },
        { name: 'Four limbs', taxa: ['Frog', 'Lizard', 'Mouse'] },
        { name: 'Amniotic egg', taxa: ['Lizard', 'Mouse'] },
        { name: 'Hair', taxa: ['Mouse'] },
      ],
    },
    scenes: [
      {
        label: 'The whole tree',
        lines: [
          'Each numbered mark is where a trait first appeared; every taxon above that branch has it.',
          'The lancelet splits off first, so it has none of the five traits.',
        ],
        clade: {},
      },
      {
        label: 'Jaws',
        lines: [
          'Jaws appeared on the branch after the lamprey split off.',
          'The shark, frog, lizard and mouse all inherited jaws: together they are one clade.',
        ],
        clade: { lit: 'Jaws' },
      },
      {
        label: 'Amniotic egg',
        lines: [
          'The lizard and the mouse share an egg with its own water supply.',
          'They share an ancestor more recent than the one they share with the frog.',
        ],
        clade: { lit: 'Amniotic egg' },
      },
      {
        label: 'Not a clade',
        lines: [
          'The lamprey and the shark share an ancestor, but so do the frog, lizard and mouse.',
          'A group that leaves out some of its ancestor’s descendants is not a clade.',
        ],
        clade: { ring: ['Lamprey', 'Shark'] },
      },
    ],
  },
  {
    id: 'g.s9-evolution-evidence-cladogram',
    title: 'A cladogram with two branches at a node',
    kind: 'explore',
    use: 'Use this for a cladogram whose branches split into two groups, each with its own traits.',
    assumptions: [
      'A branch point can split into two clades that each go on branching.',
      'Birds and crocodiles share traits no lizard has, so they are each other’s closest relatives.',
    ],
    figure: {
      kind: 'cladogram',
      tree: [
        'Lancelet',
        [
          ['Shark', 'Ray'],
          ['Frog', ['Lizard', ['Crocodile', 'Bird']]],
        ],
      ],
      traits: [
        { name: 'Jaws', taxa: ['Shark', 'Ray', 'Frog', 'Lizard', 'Crocodile', 'Bird'] },
        { name: 'Cartilage skeleton', taxa: ['Shark', 'Ray'] },
        { name: 'Four limbs', taxa: ['Frog', 'Lizard', 'Crocodile', 'Bird'] },
        { name: 'Amniotic egg', taxa: ['Lizard', 'Crocodile', 'Bird'] },
        { name: 'Gizzard', taxa: ['Crocodile', 'Bird'] },
        { name: 'Feathers', taxa: ['Bird'] },
      ],
    },
    scenes: [
      {
        label: 'Two clades',
        lines: [
          'After jaws appeared, the tree split into two clades.',
          'Sharks and rays kept a skeleton of cartilage; the other clade grew four limbs.',
        ],
        clade: { lit: 'Four limbs' },
      },
      {
        label: 'Birds and crocodiles',
        lines: [
          'Crocodiles and birds share a gizzard, a trait lizards lack.',
          'So a crocodile is more closely related to a bird than to a lizard.',
        ],
        clade: { lit: 'Gizzard' },
      },
      {
        label: 'Reptiles',
        lines: [
          'The lizard and the crocodile are called reptiles, but their clade also holds the bird.',
          'Without the bird, the group is not a clade.',
        ],
        clade: { ring: ['Lizard', 'Crocodile'] },
      },
    ],
  },
  {
    id: 'g.s9-classification-domains',
    title: 'The three domains',
    kind: 'sort',
    use: 'Use this for placing organisms in the domains Bacteria, Archaea and Eukarya.',
    assumptions: [
      'Bacteria and archaea are single cells with no nucleus: prokaryotes.',
      'Archaea differ from bacteria in their cell walls, membranes and genes, and many live in extreme places.',
      'Eukarya have cells with a nucleus: protists, fungi, plants and animals.',
    ],
    question: 'Which domain does it belong to?',
    bins: [
      {
        id: 'bacteria',
        label: 'Bacteria',
        why: 'Prokaryotes with cell walls made of peptidoglycan.',
      },
      {
        id: 'archaea',
        label: 'Archaea',
        why: 'Prokaryotes whose walls and membranes are built differently; many live in hot springs or salt lakes.',
      },
      { id: 'eukarya', label: 'Eukarya', why: 'Every cell has a nucleus, inside a membrane.' },
    ],
    cards: [
      {
        label: 'Rod-shaped bacteria',
        bin: 'bacteria',
        figure: { kind: 'icon', icon: 'domain Bacteria' },
      },
      {
        label: 'Hot-spring archaea',
        bin: 'archaea',
        figure: { kind: 'icon', icon: 'domain Archaea' },
      },
      {
        label: 'A cell with a nucleus',
        bin: 'eukarya',
        figure: { kind: 'icon', icon: 'domain Eukarya' },
      },
      {
        label: 'Paramecium (protist)',
        bin: 'eukarya',
        figure: { kind: 'icon', icon: 'kingdom Protista' },
      },
      {
        label: 'Mushrooms (fungi)',
        bin: 'eukarya',
        figure: { kind: 'icon', icon: 'kingdom Fungi' },
      },
      { label: 'A leafy plant', bin: 'eukarya', figure: { kind: 'icon', icon: 'kingdom Plantae' } },
      {
        label: 'A fish (animal)',
        bin: 'eukarya',
        figure: { kind: 'icon', icon: 'kingdom Animalia' },
      },
    ],
  },
];
