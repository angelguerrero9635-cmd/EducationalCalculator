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

// ── H40 energyPyramid: biomass and numbers ──

/** b = a × k (÷ d): one level from the one below. */
function scaled(
  b: string,
  a: string,
  k: string,
  div100: boolean,
  how: [string, string, string],
): Rel {
  const f = div100 ? 100 : 1;
  const tail = div100 ? ' ÷ 100' : '';
  return {
    relation: {
      id: `${b} = ${a} × ${k}${tail}`,
      display: `{${b}} = {${a}} × {${k}}${tail}`,
      vars: [b, a, k],
      residual: (v: Values) => v[b]! * f - v[a]! * v[k]!,
      solve: {
        [b]: (v: Values) => (v[a]! * v[k]!) / f,
        [a]: (v: Values) => div(v[b]! * f, v[k]!),
        [k]: (v: Values) => div(v[b]! * f, v[a]!),
      },
    },
    steps: {
      [b]: { expr: `{${a}} × {${k}}${tail}`, how: how[0] },
      [a]: { expr: `{${b}}${div100 ? ' × 100' : ''} ÷ {${k}}`, how: how[1] },
      [k]: { expr: `{${b}}${div100 ? ' × 100' : ''} ÷ {${a}}`, how: how[2] },
    },
  };
}

const PASS_HOW: [string, string, string] = [
  'Only that percent of the level below becomes this level.',
  'Undo taking the percent: multiply by 100 and divide by it.',
  'This level as a percent of the level below.',
];

const mass = (id: string, symbol: string, name: string, derived = false) =>
  V(id, symbol, name, { unit: 'g/m²', min: 0.01, max: 100000, step: 1, derived });

const biomassPyramid: ModuleDef = {
  id: 'g.s9-ecosystem-dynamics-biomass',
  title: 'Pyramid of biomass',
  use: 'Use this for the dry mass of living things at each feeding level of a meadow.',
  assumptions: [
    'Biomass is the dry mass of living things in one square meter at one time.',
    'Only about 10% of a level’s biomass is built into the level that eats it; the rest is burned for energy or never eaten.',
    'So on land each level holds much less biomass than the one below.',
  ],
  variables: [
    mass('B1', 'B₁', 'Biomass of the grass'),
    V('p', 'p', 'Percent passed up', { unit: '%', min: 1, max: 30, step: 1 }),
    mass('B2', 'B₂', 'Biomass of the grasshoppers'),
    mass('B3', 'B₃', 'Biomass of the mice'),
  ],
  ...rels(scaled('B2', 'B1', 'p', true, PASS_HOW), scaled('B3', 'B2', 'p', true, PASS_HOW)),
  example: { B1: 800, p: 10, B2: 80, B3: 8 },
  startWith: ['B1', 'p'],
  representation: {
    kind: 'energyPyramid',
    measure: 'biomass',
    levels: ['B1', 'B2', 'B3'],
    percent: 'p',
    names: ['grass', 'grasshoppers', 'mice'],
  },
};

const numbersPyramid: ModuleDef = {
  id: 'g.s9-ecosystem-dynamics-numbers',
  title: 'Pyramid of numbers',
  use: 'Use this for how many organisms are at each feeding level, even when the pyramid is upside down.',
  assumptions: [
    'A pyramid of numbers counts the organisms at each level, whatever their size.',
    'One big oak tree can feed thousands of caterpillars, so the bottom tier can be the narrowest.',
    'Each songbird eats many caterpillars over the season, so there are far fewer birds.',
  ],
  variables: [
    V('N1', 'N₁', 'Oak trees', { min: 1, max: 100, step: 1, integer: true }),
    V('a', 'a', 'Caterpillars on each tree', { min: 1, max: 20000, step: 1, integer: true }),
    V('N2', 'N₂', 'Caterpillars', { min: 1, max: 2000000, step: 1, integer: true }),
    V('b', 'b', 'Caterpillars one bird eats', { min: 1, max: 5000, step: 1, integer: true }),
    V('N3', 'N₃', 'Songbirds', { min: 0, max: 2000000, step: 1 }),
  ],
  ...rels(
    scaled('N2', 'N1', 'a', false, [
      'Every tree carries a caterpillars.',
      'Split the caterpillars among the trees.',
      'Share the caterpillars out per tree.',
    ]),
    {
      relation: {
        id: 'N3 = N2 ÷ b',
        display: '{N3} = {N2} ÷ {b}',
        vars: ['N3', 'N2', 'b'],
        residual: (v: Values) => v.N3! * v.b! - v.N2!,
        solve: {
          N3: (v: Values) => div(v.N2!, v.b!),
          N2: (v: Values) => v.N3! * v.b!,
          b: (v: Values) => div(v.N2!, v.N3!),
        },
      },
      steps: {
        N3: {
          expr: '{N2} ÷ {b}',
          how: 'Each bird needs b caterpillars: how many birds they feed.',
        },
        N2: { expr: '{N3} × {b}', how: 'Every bird eats b caterpillars.' },
        b: { expr: '{N2} ÷ {N3}', how: 'Share the caterpillars among the birds.' },
      },
    },
  ),
  example: { N1: 1, a: 4000, N2: 4000, b: 200, N3: 20 },
  startWith: ['N1', 'a', 'b'],
  representation: {
    kind: 'energyPyramid',
    measure: 'numbers',
    levels: ['N1', 'N2', 'N3'],
    names: ['oak tree', 'caterpillars', 'songbirds'],
  },
};

const invertedBiomass: ModuleDef = {
  id: 'g.s9-ecosystem-dynamics-ocean',
  title: 'An upside-down pyramid of biomass',
  use: 'Use this for an ocean food chain where the consumers outweigh the producers at one time.',
  assumptions: [
    'Phytoplankton divide so fast that they are eaten almost as soon as they grow.',
    'At any one moment the zooplankton can outweigh them, though far more phytoplankton grow over a year.',
    'So an ocean’s pyramid of biomass can stand upside down, while its pyramid of energy cannot.',
  ],
  variables: [
    mass('P', 'P', 'Biomass of the phytoplankton'),
    V('k', 'k', 'Zooplankton per gram of phytoplankton', { min: 0.01, max: 20, step: 0.1 }),
    mass('Z', 'Z', 'Biomass of the zooplankton'),
  ],
  ...rels(
    scaled('Z', 'P', 'k', false, [
      'k grams of zooplankton for every gram of phytoplankton.',
      'Divide the zooplankton by k.',
      'Compare the two biomasses.',
    ]),
  ),
  example: { P: 5, k: 4, Z: 20 },
  startWith: ['P', 'k'],
  representation: {
    kind: 'energyPyramid',
    measure: 'biomass',
    levels: ['P', 'Z'],
    names: ['phytoplankton', 'zooplankton'],
  },
};

// ── H42 immuneResponse: antibody levels after two exposures ──

/** a = b ÷ c with its two rearrangements. */
function quotient(a: string, b: string, c: string, how: [string, string, string]): Rel {
  return {
    relation: {
      id: `${a} = ${b} ÷ ${c}`,
      display: `{${a}} = {${b}} ÷ {${c}}`,
      vars: [a, b, c],
      residual: (v: Values) => v[a]! * v[c]! - v[b]!,
      solve: {
        [a]: (v: Values) => div(v[b]!, v[c]!),
        [b]: (v: Values) => v[a]! * v[c]!,
        [c]: (v: Values) => div(v[b]!, v[a]!),
      },
    },
    steps: {
      [a]: { expr: `{${b}} ÷ {${c}}`, how: how[0] },
      [b]: { expr: `{${a}} × {${c}}`, how: how[1] },
      [c]: { expr: `{${b}} ÷ {${a}}`, how: how[2] },
    },
  };
}

const level = (id: string, symbol: string, name: string) =>
  V(id, symbol, name, { unit: 'units', min: 0.1, max: 100000, step: 1 });
const days = (id: string, symbol: string, name: string) =>
  V(id, symbol, name, { unit: 'days', min: 1, max: 30, step: 1 });

const antibodies: ModuleDef = {
  id: 'g.s9-immune-disease-antibodies',
  title: 'Antibody levels: first and second exposure',
  use: 'Use this for comparing the primary and secondary immune responses to one antigen.',
  assumptions: [
    'The first time an antigen enters, B cells take days to be chosen and multiply, so antibodies rise slowly and stay low.',
    'Memory cells left from the first response answer a second exposure faster and make far more antibody.',
    'Levels are in relative units: only their ratio matters here.',
  ],
  variables: [
    level('P1', 'P₁', 'Peak level, first exposure'),
    days('d1', 'd₁', 'Days to the first peak'),
    V('r1', 'r₁', 'Average rise per day, first', {
      unit: 'units/day',
      min: 0.01,
      max: 100000,
      step: 0.1,
    }),
    level('P2', 'P₂', 'Peak level, second exposure'),
    days('d2', 'd₂', 'Days to the second peak'),
    V('r2', 'r₂', 'Average rise per day, second', {
      unit: 'units/day',
      min: 0.01,
      max: 100000,
      step: 0.1,
    }),
    V('k', 'k', 'Times higher, second peak', { min: 0.01, max: 1000, step: 0.1 }),
  ],
  ...rels(
    quotient('k', 'P2', 'P1', [
      'How many times the first peak fits into the second.',
      'The second peak is k times the first.',
      'The first peak is the second divided by k.',
    ]),
    quotient('r1', 'P1', 'd1', [
      'The rise to the peak, spread over the days it took.',
      'Rise per day times the days.',
      'How many days of that rise reach the peak.',
    ]),
    quotient('r2', 'P2', 'd2', [
      'The rise to the peak, spread over the days it took.',
      'Rise per day times the days.',
      'How many days of that rise reach the peak.',
    ]),
  ),
  example: { P1: 100, d1: 12, r1: 100 / 12, P2: 1000, d2: 6, r2: 1000 / 6, k: 10 },
  startWith: ['P1', 'd1', 'P2', 'd2'],
  sliders: true,
  representation: {
    kind: 'immuneResponse',
    first: 'P1',
    second: 'P2',
    firstDays: 'd1',
    secondDays: 'd2',
    secondAt: 40,
  },
};

const booster: ModuleDef = {
  ...antibodies,
  id: 'g.s9-immune-disease-booster',
  title: 'A vaccine booster',
  use: 'Use this for why a booster dose raises antibodies so much more than the first dose.',
  assumptions: [
    'A vaccine is a first exposure to a harmless form of the antigen: it leaves memory cells.',
    'A booster is the second exposure: the memory cells make antibodies fast and in large amounts.',
    'Levels are in relative units: only their ratio matters here.',
  ],
  example: { P1: 20, d1: 14, r1: 20 / 14, P2: 2000, d2: 5, r2: 400, k: 100 },
  representation: { ...antibodies.representation, secondAt: 28 } as ModuleDef['representation'],
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
  biomassPyramid,
  numbersPyramid,
  invertedBiomass,
  antibodies,
  booster,
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
  // ── H40: succession and the nitrogen cycle ──
  {
    id: 'g.s9-ecosystem-dynamics-succession',
    title: 'Primary succession',
    kind: 'sequence',
    use: 'Use this for the order of communities that build up on new bare rock.',
    assumptions: [
      'Primary succession starts where there is no soil: new lava rock or rock left by a glacier.',
      'Pioneer species such as lichens break down rock; their remains start a thin soil.',
      'Each community changes the soil and shade so the next one can grow, until a stable mature forest.',
    ],
    question: 'Put the stages of primary succession in order.',
    stages: [
      { label: 'Bare rock', figure: { kind: 'icon', icon: 'bare rock' } },
      { label: 'Lichens', figure: { kind: 'icon', icon: 'lichens on rock' } },
      { label: 'Mosses', figure: { kind: 'icon', icon: 'mosses and thin soil' } },
      { label: 'Grasses and flowers', figure: { kind: 'icon', icon: 'grasses and flowers' } },
      { label: 'Shrubs', figure: { kind: 'icon', icon: 'shrubs' } },
      { label: 'Young trees', figure: { kind: 'icon', icon: 'young trees' } },
      { label: 'Mature forest', figure: { kind: 'icon', icon: 'mature forest' } },
    ],
  },
  {
    id: 'g.s9-ecosystem-dynamics-nitrogen',
    title: 'The nitrogen cycle',
    kind: 'explore',
    use: 'Use this for how nitrogen moves between the air, the soil and living things.',
    assumptions: [
      'Air is mostly nitrogen gas, but plants and animals cannot use it in that form.',
      'Bacteria and lightning turn it into forms plants take in; decomposers and other bacteria return it.',
    ],
    figure: { kind: 'nitrogenCycle' },
    scenes: [
      {
        label: 'The whole cycle',
        lines: [
          'Nitrogen goes from the air into the soil, through living things and back to the air.',
        ],
        nitrogen: {},
      },
      {
        label: 'Fixation',
        lines: [
          'Bacteria in the root nodules of beans and clover turn nitrogen gas into ammonium.',
          'This is nitrogen fixation, the main way nitrogen enters living things.',
        ],
        nitrogen: { process: 'fixation' },
      },
      {
        label: 'Lightning',
        lines: [
          'A lightning bolt’s energy joins nitrogen and oxygen; rain carries the nitrate into the soil.',
        ],
        nitrogen: { process: 'lightning' },
      },
      {
        label: 'Nitrification',
        lines: ['Soil bacteria turn ammonium into nitrite, then into nitrate.'],
        nitrogen: { process: 'nitrification' },
      },
      {
        label: 'Assimilation',
        lines: ['Plant roots take in nitrate and build it into proteins and DNA.'],
        nitrogen: { process: 'assimilation' },
      },
      {
        label: 'Eating',
        lines: ['Animals get their nitrogen by eating plants or other animals.'],
        nitrogen: { process: 'eating' },
      },
      {
        label: 'Ammonification',
        lines: ['Decomposers break down wastes and dead matter, releasing ammonium into the soil.'],
        nitrogen: { process: 'ammonification' },
      },
      {
        label: 'Denitrification',
        lines: [
          'Bacteria in wet, airless soil turn nitrate back into nitrogen gas, closing the cycle.',
        ],
        nitrogen: { process: 'denitrification' },
      },
    ],
  },
  // ── H41 feedbackLoop ──
  {
    id: 'g.s9-homeostasis-feedback',
    title: 'Feedback loops in the body',
    kind: 'explore',
    use: 'Use this for tracing a feedback loop from stimulus to response.',
    assumptions: [
      'Homeostasis keeps conditions inside the body near a set point, such as about 37 °C.',
      'In negative feedback the response works against the change, so the loop settles back.',
      'In positive feedback the response adds to the change, so it grows until something ends it.',
    ],
    figure: { kind: 'feedbackLoop' },
    scenes: [
      {
        label: 'Too hot',
        lines: [
          'The rise in temperature is the stimulus; sweating is the response.',
          'The response undoes the stimulus, so this is negative feedback.',
        ],
        loop: {
          sign: 'negative',
          back: 'negative feedback',
          lit: 2,
          steps: [
            { role: 'Stimulus', text: 'Body temperature rises above its set point.' },
            {
              role: 'Sensor',
              text: 'Temperature receptors in the skin and brain detect the rise.',
            },
            { role: 'Control center', text: 'The hypothalamus compares it with the set point.' },
            { role: 'Effector', text: 'Sweat glands release sweat; skin blood vessels widen.' },
            { role: 'Response', text: 'Heat is lost, and body temperature falls back.' },
          ],
        },
      },
      {
        label: 'Too cold',
        lines: ['The same control center answers a drop: the effectors now make and keep heat.'],
        loop: {
          sign: 'negative',
          back: 'negative feedback',
          lit: 3,
          steps: [
            { role: 'Stimulus', text: 'Body temperature falls below its set point.' },
            { role: 'Sensor', text: 'Receptors in the skin and brain detect the drop.' },
            { role: 'Control center', text: 'The hypothalamus signals the body to save heat.' },
            { role: 'Effector', text: 'Muscles shiver; skin blood vessels narrow.' },
            { role: 'Response', text: 'More heat is made and less is lost, so temperature rises.' },
          ],
        },
      },
      {
        label: 'Blood sugar high',
        lines: [
          'After a meal, the pancreas senses the high glucose and releases insulin.',
          'Insulin lets cells take in glucose, so the level falls back.',
        ],
        loop: {
          sign: 'negative',
          back: 'negative feedback',
          lit: 2,
          steps: [
            { role: 'Stimulus', text: 'Blood glucose rises after a meal.' },
            { role: 'Sensor', text: 'Beta cells in the pancreas detect the high glucose.' },
            { role: 'Control center', text: 'The pancreas releases insulin into the blood.' },
            {
              role: 'Effector',
              text: 'Body cells take in glucose; the liver stores it as glycogen.',
            },
            { role: 'Response', text: 'Blood glucose falls back toward normal.' },
          ],
        },
      },
      {
        label: 'Blood sugar low',
        lines: ['Between meals, glucagon tells the liver to release stored glucose.'],
        loop: {
          sign: 'negative',
          back: 'negative feedback',
          lit: 3,
          steps: [
            { role: 'Stimulus', text: 'Blood glucose falls between meals.' },
            { role: 'Sensor', text: 'Alpha cells in the pancreas detect the low glucose.' },
            { role: 'Control center', text: 'The pancreas releases glucagon into the blood.' },
            { role: 'Effector', text: 'The liver breaks down glycogen and releases glucose.' },
            { role: 'Response', text: 'Blood glucose rises back toward normal.' },
          ],
        },
      },
      {
        label: 'Positive feedback',
        lines: [
          'During birth, each contraction brings a stronger one.',
          'The loop grows until the baby is born, which ends it.',
        ],
        loop: {
          sign: 'positive',
          back: 'positive feedback',
          steps: [
            { role: 'Stimulus', text: 'The baby’s head presses on the cervix.' },
            { role: 'Sensor', text: 'Stretch receptors send signals to the brain.' },
            { role: 'Control center', text: 'The pituitary gland releases oxytocin.' },
            { role: 'Effector', text: 'The muscles of the uterus contract harder.' },
            { role: 'Response', text: 'The head presses harder still.' },
          ],
        },
      },
    ],
  },
  {
    id: 'g.s12-climate-systems-feedback',
    title: 'Climate feedbacks',
    kind: 'explore',
    use: 'Use this for climate feedbacks that strengthen or weaken a warming.',
    assumptions: [
      'A climate feedback is a change caused by warming that in turn changes the warming.',
      'A positive feedback makes the warming larger; a negative feedback makes it smaller.',
    ],
    figure: { kind: 'feedbackLoop' },
    scenes: [
      {
        label: 'Ice and albedo',
        lines: [
          'Ice reflects most sunlight; open ocean absorbs most of it.',
          'Melting ice lets in more sunlight, which melts more ice: a positive feedback.',
        ],
        loop: {
          sign: 'positive',
          back: 'positive feedback',
          steps: [
            { text: 'Earth’s surface warms.' },
            { text: 'Sea ice and snow melt.' },
            { text: 'Darker ocean and land show through: the albedo drops.' },
            { text: 'More sunlight is absorbed.' },
          ],
        },
      },
      {
        label: 'Water vapor',
        lines: [
          'Warmer air can hold more water vapor, and water vapor is a greenhouse gas.',
          'So warming adds vapor, and the vapor adds warming.',
        ],
        loop: {
          sign: 'positive',
          back: 'positive feedback',
          lit: 1,
          steps: [
            { text: 'The air warms.' },
            { text: 'More water evaporates, and warm air holds more vapor.' },
            { text: 'Water vapor traps more of the heat Earth gives off.' },
          ],
        },
      },
      {
        label: 'Radiating heat',
        lines: [
          'A warmer Earth gives off more infrared radiation to space.',
          'That works against the warming: a negative feedback that steadies the climate.',
        ],
        loop: {
          sign: 'negative',
          back: 'negative feedback',
          steps: [
            { text: 'Earth’s surface warms.' },
            { text: 'A warmer surface gives off more infrared radiation.' },
            { text: 'More heat escapes to space.' },
            { text: 'The warming slows.' },
          ],
        },
      },
    ],
  },
  // ── H42: pathogens and the immune response ──
  {
    id: 'g.s9-immune-disease-stages',
    title: 'The immune response in stages',
    kind: 'explore',
    use: 'Use this for the order of the immune response and what each cell does.',
    assumptions: [
      'An antigen is a molecule on a pathogen that the immune system recognizes as foreign.',
      'The response is specific: only the B and T cells whose receptors fit that antigen are chosen.',
    ],
    figure: { kind: 'immuneStages' },
    scenes: [
      {
        label: 'The whole response',
        lines: [
          'The response runs from the antigen to antibodies and killer T cells, and leaves memory cells.',
        ],
        immune: {},
      },
      {
        label: 'Antigen',
        lines: [
          'A macrophage swallows a virus and breaks it down.',
          'It shows a piece of the virus, the antigen, on its surface.',
        ],
        immune: { stage: 'antigen' },
      },
      {
        label: 'Helper T cells',
        lines: [
          'A helper T cell whose receptor fits the antigen is switched on and signals B cells and killer T cells.',
        ],
        immune: { stage: 'helperT' },
      },
      {
        label: 'B cells',
        lines: ['A B cell that fits the antigen divides many times into plasma cells.'],
        immune: { stage: 'bCells' },
      },
      {
        label: 'Antibodies',
        lines: [
          'Plasma cells release antibodies that bind the antigen.',
          'Bound viruses clump together and cannot enter cells, and macrophages eat them.',
        ],
        immune: { stage: 'antibodies' },
      },
      {
        label: 'Killer T cells',
        lines: ['Killer T cells find body cells infected with the virus and destroy them.'],
        immune: { stage: 'killerT' },
      },
      {
        label: 'Memory cells',
        lines: [
          'Some B and T cells stay as memory cells for years.',
          'They make a second response faster and stronger.',
        ],
        immune: { stage: 'memory' },
      },
    ],
  },
  {
    id: 'g.s9-immune-disease-pathogens',
    title: 'Kinds of pathogens',
    kind: 'sort',
    use: 'Use this for telling living pathogens from viruses.',
    assumptions: [
      'A pathogen is anything that causes disease: a virus, a bacterium, a fungus or a parasite.',
      'Bacteria, fungi and parasites are cells; a virus is not, and copies itself only inside a host cell.',
      'Antibiotics kill bacteria but do nothing to viruses.',
    ],
    question: 'Is it a living cell?',
    bins: [
      {
        id: 'cell',
        label: 'A living cell',
        why: 'It grows and divides on its own, using its own food.',
      },
      {
        id: 'virus',
        label: 'Not a cell',
        why: 'Genes in a protein coat; it can only be copied inside a host’s cells.',
      },
    ],
    cards: [
      { label: 'Virus', bin: 'virus', figure: { kind: 'icon', icon: 'virus' } },
      { label: 'Bacterium', bin: 'cell', figure: { kind: 'icon', icon: 'bacterium' } },
      { label: 'Fungus (yeast)', bin: 'cell', figure: { kind: 'icon', icon: 'fungus' } },
      { label: 'Parasite (protozoan)', bin: 'cell', figure: { kind: 'icon', icon: 'parasite' } },
    ],
  },
];
