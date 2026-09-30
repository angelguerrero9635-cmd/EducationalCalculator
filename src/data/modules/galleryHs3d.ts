/**
 * Grades 9–12 round 3 gallery demos (group H3D: biology (H109); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in. Spread into
 * gallery.ts.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

/** A relation and its step text, built together. */
interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}

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

/** `out` from `ins`, one way only. */
function forward(
  id: string,
  display: string,
  out: string,
  ins: string[],
  f: (v: Values) => number | undefined,
  expr: string,
  how: string,
): Rule {
  return {
    relation: {
      id,
      display,
      vars: [out, ...ins],
      residual: (v: Values) => v[out]! - (f(v) ?? NaN),
      solve: Object.fromEntries([
        [out, f],
        ...ins.map((x) => [x, () => undefined]),
      ]) as Relation['solve'],
    },
    steps: { [out]: { expr, how } },
  };
}

const codonOf = (k: string, p: string): Rule =>
  forward(
    `${k} = ⌈${p} ÷ 3⌉`,
    `{${k}} = ⌈{${p}} ÷ 3⌉`,
    k,
    [p],
    (v) => Math.ceil(v[p]! / 3 - 1e-9),
    `⌈{${p}} ÷ 3⌉`,
    'Bases 1 to 3 are codon 1, bases 4 to 6 codon 2, and so on: divide by 3 and round up.',
  );

const GENE = 'TACCGGTTCATT';

// ─── Part 1: dnaMath start-lost and stop-lost (s.9.biotechnology, ~frameshift) ───────────

const DNA: ModuleDef[] = [
  {
    id: 'g.s9-biotechnology-start-stop',
    title: 'A point mutation, start to stop',
    use: 'Use this for “Base 11 of TACCGGTTCATT changes. What happens to the protein?”',
    assumptions: [
      `The template strand is ${GENE}; its mRNA AUG GCC AAG UAA codes Met–Ala–Lys, then stop.`,
      'Bases 1–3 are the start codon and 10–12 the stop; the base changed swaps A with G or C with T.',
      'A change to AUG loses the start: no protein is made from here. A stop turned into an amino acid loses the stop: the ribosome reads on.',
    ],
    variables: [
      count('p', 'p', 'Base changed', 1, 12),
      count('k', 'k', 'Codon holding it', 1, 4, true),
      count('j', 'j', 'Its place in the codon', 1, 3, true),
    ],
    ...rules(
      codonOf('k', 'p'),
      forward(
        'j = p − 3(k − 1)',
        '{j} = {p} − 3 × ({k} − 1)',
        'j',
        ['p', 'k'],
        (v) => v.p! - 3 * (v.k! - 1),
        '{p} − 3 × ({k} − 1)',
        'The codons before it hold 3 × (k − 1) bases; the rest is its place in its own codon.',
      ),
    ),
    example: { p: 10, k: 4, j: 1 },
    startWith: ['p'],
    representation: {
      kind: 'dnaStrand',
      sequence: GENE,
      mutation: { type: 'substitution', at: 'p' },
    },
  },
  {
    id: 'g.s9-biotechnology-frameshift-start',
    title: 'An insertion at the start codon',
    use: 'Use this for “An A is inserted before base 2. Why is no protein made?”',
    assumptions: [
      `The template strand is ${GENE}; an A is inserted before base p.`,
      'Before base 1 the start codon is untouched; inside it, AUG is broken and no protein starts there.',
      'Past the start, every codon from the one holding the insertion is read in a shifted frame.',
    ],
    variables: [
      count('p', 'p', 'Base the insertion goes before', 1, 12),
      count('k', 'k', 'Codon holding it', 1, 4, true),
    ],
    ...rules(codonOf('k', 'p')),
    example: { p: 2, k: 1 },
    startWith: ['p'],
    representation: {
      kind: 'dnaStrand',
      sequence: GENE,
      mutation: { type: 'insertion', at: 'p', base: 'A' },
    },
  },
];

export const HS3D_GALLERY_MODULES: ModuleDef[] = [...DNA];

// ─── Part 2: `gel` as an explore figure (s.9.biotechnology~fingerprint) ───────────────

const FINGERPRINT: LayoutDef = {
  kind: 'explore',
  id: 'g.s9-biotechnology-fingerprint',
  title: 'DNA fingerprinting',
  use: 'Use this for “Which suspect’s DNA matches the evidence?” or “Could this man be the father?”',
  assumptions: [
    'Restriction enzymes cut DNA at set sequences; the lengths of the pieces differ from person to person.',
    'Only identical twins share every band; a child gets each band from the mother or the father.',
    'The pieces run through a gel toward +, the shorter ones farther.',
  ],
  figure: {
    kind: 'gel',
    ladder: [10000, 5000, 2000, 1000, 500, 250],
    lanes: [
      { label: 'Evidence', bands: [8200, 4100, 2300, 900] },
      { label: 'Suspect 1', bands: [7000, 4100, 1600, 600] },
      { label: 'Suspect 2', bands: [8200, 4100, 2300, 900] },
      { label: 'Suspect 3', bands: [9000, 3000, 2300, 450] },
      { label: 'Mother', bands: [6500, 3600, 1800, 700] },
      { label: 'Child', bands: [6500, 2800, 1800, 400] },
      { label: 'Man A', bands: [5200, 2800, 1200, 400] },
      { label: 'Man B', bands: [5200, 3200, 1100, 550] },
    ],
  },
  scenes: [
    {
      label: 'The gel',
      lines: [
        'DNA from blood at the scene and from three suspects is cut by the same enzyme and run side by side.',
        'The ladder’s pieces of known length give the scale.',
      ],
      gel: { lanes: ['Evidence', 'Suspect 1', 'Suspect 2', 'Suspect 3'] },
    },
    {
      label: 'Compare',
      lines: [
        'Dashed lines carry the evidence’s bands across the gel.',
        'Suspects 1 and 3 share one band each with it: many people share a band or two, so that is not a match.',
      ],
      gel: {
        lanes: ['Evidence', 'Suspect 1', 'Suspect 2', 'Suspect 3'],
        lit: ['Suspect 1', 'Suspect 2', 'Suspect 3'],
        compare: 'Evidence',
      },
    },
    {
      label: 'A match',
      lines: [
        'Suspect 2 matches the evidence in every band.',
        'Real tests compare 20 or so places in the DNA, so a full match is very unlikely by chance.',
      ],
      gel: {
        lanes: ['Evidence', 'Suspect 1', 'Suspect 2', 'Suspect 3'],
        lit: ['Suspect 2'],
        compare: 'Evidence',
      },
    },
    {
      label: 'A family',
      lines: [
        'The child’s bands that match the mother are red; the rest must come from the father.',
        'Man A has both of the others, in blue, so he could be the father.',
      ],
      gel: {
        lanes: ['Mother', 'Child', 'Man A', 'Man B'],
        lit: ['Child'],
        compare: 'Child',
        parents: ['Mother', 'Man A'],
      },
    },
    {
      label: 'Ruled out',
      lines: [
        'Two of the child’s bands are in neither the mother nor Man B.',
        'So Man B is ruled out as the father, whatever bands he shares with Man A.',
      ],
      gel: {
        lanes: ['Mother', 'Child', 'Man A', 'Man B'],
        lit: ['Child'],
        compare: 'Child',
        parents: ['Mother', 'Man B'],
      },
    },
  ],
};

export const HS3D_GALLERY_LAYOUTS: LayoutDef[] = [FINGERPRINT];
