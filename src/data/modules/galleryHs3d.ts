/**
 * Grades 9–12 round 3 gallery demos (group H3D: biology (H109); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in. Spread into
 * gallery.ts.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import { div } from './helpers';
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

// ─── Part 3: phase icons on the mitotic index's pie (s.9.mitosis-meiosis~mitotic-index) ───

const MITOTIC_INDEX: ModuleDef = {
  id: 'g.s9-mitosis-meiosis-mitotic-index-stages',
  title: 'Mitotic index, each phase drawn',
  use: 'Use this for “20 of 100 root-tip cells are in mitosis. How long does mitosis last in a 24-hour cycle?”',
  unitSystems: ['metric'],
  assumptions: [
    'The cells are counted in one field of a root tip under a microscope, each in the phase it was in when fixed.',
    'Cells divide at random times, so the share of cells in a phase is the share of the cycle spent in it.',
    'Beside each phase is what its cells look like: chromosomes condensing, lined up, pulled apart, two nuclei.',
  ],
  variables: [
    count('I', 'I', 'Cells in interphase', 0, 1000),
    count('P', 'P', 'Cells in prophase', 0, 500),
    count('M', 'M', 'Cells in metaphase', 0, 500),
    count('A', 'A', 'Cells in anaphase', 0, 500),
    count('T', 'T', 'Cells in telophase', 0, 500),
    count('N', 'N', 'Cells counted', 1, 3000, true),
    count('m', 'm', 'Cells in mitosis', 0, 2000, true),
    {
      id: 'x',
      symbol: 'x',
      name: 'Mitotic index',
      unit: '%',
      min: 0,
      max: 100,
      step: 0.1,
      derived: true,
    },
    {
      id: 'h',
      symbol: 'h',
      name: 'Length of one cycle',
      unit: 'h',
      units: ['h'],
      min: 1,
      max: 100,
      step: 0.5,
    },
    {
      id: 't',
      symbol: 't',
      name: 'Time in mitosis',
      unit: 'h',
      units: ['h'],
      min: 0,
      max: 100,
      step: 0.01,
      derived: true,
    },
  ],
  ...rules(
    forward(
      'N = I + P + M + A + T',
      '{N} = {I} + {P} + {M} + {A} + {T}',
      'N',
      ['I', 'P', 'M', 'A', 'T'],
      (v) => v.I! + v.P! + v.M! + v.A! + v.T!,
      '{I} + {P} + {M} + {A} + {T}',
      'Every cell counted is in interphase or in one phase of mitosis.',
    ),
    forward(
      'm = P + M + A + T',
      '{m} = {P} + {M} + {A} + {T}',
      'm',
      ['P', 'M', 'A', 'T'],
      (v) => v.P! + v.M! + v.A! + v.T!,
      '{P} + {M} + {A} + {T}',
      'The cells in any of the four phases of mitosis.',
    ),
    forward(
      'x = 100 × m ÷ N',
      '{x} = 100 × {m} ÷ {N}',
      'x',
      ['m', 'N'],
      (v) => div(100 * v.m!, v.N!),
      '100 × {m} ÷ {N}',
      'The cells in mitosis as a percent of all the cells counted.',
    ),
    forward(
      't = m × h ÷ N',
      '{t} = {m} × {h} ÷ {N}',
      't',
      ['m', 'h', 'N'],
      (v) => div(v.m! * v.h!, v.N!),
      '{m} × {h} ÷ {N}',
      'The share of cells in mitosis, m ÷ N, is the share of the cycle spent in mitosis.',
    ),
  ),
  example: { I: 80, P: 10, M: 5, A: 3, T: 2, N: 100, m: 20, x: 20, h: 24, t: 4.8 },
  startWith: ['I', 'P', 'M', 'A', 'T', 'h'],
  representation: {
    kind: 'pieChart',
    parts: ['I', 'P', 'M', 'A', 'T'],
    total: 'N',
    group: { id: 'm', parts: ['P', 'M', 'A', 'T'] },
    stages: ['interphase', 'prophase', 'metaphase', 'anaphase', 'telophase'],
  },
};

// ─── Part 4: a neuron timing its impulse (s.9.nervous-system~impulse-speed) ─────────────

const impulseTime: Rule = {
  relation: {
    id: 't = 1,000 × d ÷ v',
    display: '{t} = 1,000 × {d} ÷ {v}',
    vars: ['t', 'd', 'v'],
    residual: (v) => v.t! - (1000 * v.d!) / v.v!,
    solve: {
      t: (v) => div(1000 * v.d!, v.v!),
      d: (v) => (v.v! * v.t!) / 1000,
      v: (v) => div(1000 * v.d!, v.t!),
    },
  },
  steps: {
    t: {
      expr: '1,000 × {d} ÷ {v}',
      how: 'Distance ÷ speed is the time in seconds; 1,000 times that is the time in ms.',
    },
    d: { expr: '{v} × {t} ÷ 1,000', how: 'Speed × time, with the ms turned into seconds.' },
    v: { expr: '1,000 × {d} ÷ {t}', how: 'Distance ÷ time, with the ms turned into seconds.' },
  },
};

const impulseDemo = (id: string, title: string, example: Values): ModuleDef => ({
  id,
  title,
  use: 'Use this for “An impulse travels 1 m from the toe to the spinal cord at 50 m/s. How long does it take?”',
  unitSystems: ['metric'],
  assumptions: [
    'The impulse moves along the axon at a steady speed.',
    'Axons wrapped in myelin carry impulses fastest, up to about 120 m/s; thin axons without it, about 1 m/s.',
    'The time is in milliseconds: 1,000 ms is 1 s.',
  ],
  variables: [
    {
      id: 'd',
      symbol: 'd',
      name: 'Length of the axon',
      unit: 'm',
      units: ['m'],
      min: 0.01,
      max: 3,
      step: 0.01,
    },
    {
      id: 'v',
      symbol: 'v',
      name: 'Impulse speed',
      unit: 'm/s',
      units: ['m/s'],
      min: 0.5,
      max: 120,
      step: 0.5,
    },
    {
      id: 't',
      symbol: 't',
      name: 'Time to travel',
      unit: 'ms',
      units: ['ms'],
      min: 0,
      max: 6000,
      step: 0.1,
    },
  ],
  ...rules(impulseTime),
  example,
  startWith: ['d', 'v'],
  representation: { kind: 'neuron', length: 'd', speed: 'v', time: 't' },
});

const IMPULSE = [
  impulseDemo('g.s9-nervous-system-impulse-speed-neuron', 'How fast a nerve impulse travels', {
    d: 1,
    v: 50,
    t: 20,
  }),
  impulseDemo('g.s9-nervous-system-impulse-speed-bare', 'A slow impulse on a bare axon', {
    d: 0.8,
    v: 1,
    t: 800,
  }),
];

export const HS3D_GALLERY_MODULES: ModuleDef[] = [...DNA, MITOTIC_INDEX, ...IMPULSE];

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

// ─── Part 4: the reflex arc (s.9.nervous-system) ────────────────────────────────

const REFLEX_EXPLORE: LayoutDef = {
  kind: 'explore',
  id: 'g.s9-nervous-system-reflex-arc',
  title: 'A reflex arc',
  use: 'Use this for “Why do you pull your hand off a hot pan before you feel the pain?”',
  assumptions: [
    'A neuron takes in signals on its dendrites and sends an impulse along its axon to the next cell.',
    'In a reflex the spinal cord answers before the brain knows: that saves time.',
  ],
  figure: { kind: 'reflexArc' },
  scenes: [
    {
      label: 'The arc',
      lines: [
        'Touching a hot pan starts an impulse that runs to the spinal cord and straight back to an arm muscle.',
      ],
      reflex: { impulse: true },
    },
    {
      label: 'Receptor',
      lines: ['Heat receptors in the skin of the fingertip turn the heat into nerve impulses.'],
      reflex: { lit: 'receptor', impulse: true },
    },
    {
      label: 'Sensory',
      lines: [
        'The sensory neuron carries the impulse to the spinal cord; its cell body sits in a ganglion just outside it.',
      ],
      reflex: { lit: 'sensory', impulse: true },
    },
    {
      label: 'Interneuron',
      lines: ['In the cord’s gray matter, an interneuron passes the impulse to a motor neuron.'],
      reflex: { lit: 'interneuron', impulse: true },
    },
    {
      label: 'Motor',
      lines: [
        'The motor neuron’s axon, wrapped in myelin, carries the impulse out to the arm muscle.',
      ],
      reflex: { lit: 'motor', impulse: true },
    },
    {
      label: 'Muscle',
      lines: ['The biceps, the effector, contracts and pulls the hand away.'],
      reflex: { lit: 'effector', impulse: true },
    },
    {
      label: 'Brain',
      lines: ['Only now does a message reach the brain up the cord, and you feel the pain.'],
      reflex: { lit: 'brain', impulse: true },
    },
  ],
};

const REFLEX_SEQUENCE: LayoutDef = {
  kind: 'sequence',
  id: 'g.s9-nervous-system-reflex-cards',
  title: 'A reflex, step by step',
  use: 'Use this for “Put the steps of a reflex in order: a hand touches a hot pan.”',
  assumptions: [
    'A neuron takes in signals on its dendrites and sends an impulse along its axon to the next cell.',
    'In a reflex the spinal cord answers before the brain knows: that saves time.',
  ],
  question: 'Put the steps of a reflex in order: a hand touches a hot pan.',
  stages: [
    {
      label: 'Receptors in the skin detect the heat',
      figure: { kind: 'reflexArc', lit: 'receptor' },
    },
    {
      label: 'A sensory neuron carries the impulse to the spinal cord',
      figure: { kind: 'reflexArc', lit: 'sensory' },
    },
    {
      label: 'An interneuron in the spinal cord passes it on',
      figure: { kind: 'reflexArc', lit: 'interneuron' },
    },
    {
      label: 'A motor neuron carries the impulse to an arm muscle',
      figure: { kind: 'reflexArc', lit: 'motor' },
    },
    {
      label: 'The muscle contracts and pulls the hand away',
      figure: { kind: 'reflexArc', lit: 'effector' },
    },
    {
      label: 'The message reaches the brain, and you feel the pain',
      figure: { kind: 'reflexArc', lit: 'brain' },
    },
  ],
};

export const HS3D_GALLERY_LAYOUTS: LayoutDef[] = [FINGERPRINT, REFLEX_EXPLORE, REFLEX_SEQUENCE];
