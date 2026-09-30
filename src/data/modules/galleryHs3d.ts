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

// ─── Part 5: the flower and its life cycle; the early embryo (plant-biology, reproduction) ───

const FLOWER: LayoutDef = {
  kind: 'explore',
  id: 'g.s9-plant-biology-flower',
  title: 'The parts of a flower',
  use: 'Use this for “Which part of the flower becomes the fruit?”',
  assumptions: [
    'The flower is cut in half from top to bottom, so the parts inside show.',
    'The stamen (anther and filament) is the male part; the pistil (stigma, style and ovary) is the female part.',
  ],
  figure: {
    kind: 'parts',
    drawing: 'flower',
    parts: [
      { name: 'Petal', job: 'Bright petals attract the insects and birds that carry pollen.' },
      { name: 'Sepal', job: 'Sepals wrap and protect the flower while it is a bud.' },
      { name: 'Anther', job: 'Makes pollen, which carries the sperm.' },
      { name: 'Filament', job: 'The stalk that holds the anther up.' },
      { name: 'Stigma', job: 'The sticky tip that catches pollen.' },
      { name: 'Style', job: 'The stalk a pollen tube grows down to reach the ovary.' },
      { name: 'Ovary', job: 'Holds the ovules; after fertilization it becomes the fruit.' },
      { name: 'Ovule', job: 'Holds an egg; after fertilization it becomes a seed.' },
    ],
  },
  scenes: [
    {
      label: 'Male parts',
      part: 'Anther',
      lines: ['Each stamen is a filament with an anther on top, full of pollen.'],
    },
    {
      label: 'Female parts',
      part: 'Stigma',
      lines: ['The pistil is the stigma, the style and the ovary at the base.'],
    },
    {
      label: 'Egg',
      part: 'Ovule',
      lines: ['Each ovule inside the ovary holds one egg cell.'],
    },
    {
      label: 'Fruit',
      part: 'Ovary',
      lines: ['After fertilization the ovules become seeds and the ovary swells into the fruit.'],
    },
    {
      label: 'Attract',
      part: 'Petal',
      lines: ['Colored petals, and often scent and nectar, bring pollinators to the flower.'],
    },
  ],
};

const LIFE_CYCLE: LayoutDef = {
  kind: 'sequence',
  id: 'g.s9-plant-biology-life-cycle-cards',
  title: 'A flowering plant’s life cycle',
  use: 'Use this for “Put these in order: pollination, fertilization, seed dispersal, germination.”',
  assumptions: [
    'Pollen carries the sperm; the egg is in an ovule inside the flower’s ovary.',
    'A seed holds an embryo and its food; the fruit around it helps spread it.',
  ],
  question: 'Put the stages in order, starting at the flower.',
  stages: [
    {
      label: 'Pollination: pollen lands on a stigma',
      figure: { kind: 'flowerCycle', stage: 'pollination' },
    },
    {
      label: 'A pollen tube grows down to an ovule',
      figure: { kind: 'flowerCycle', stage: 'pollen tube' },
    },
    {
      label: 'Fertilization: a sperm joins the egg',
      figure: { kind: 'flowerCycle', stage: 'fertilization' },
    },
    {
      label: 'The ovule becomes a seed, and the ovary a fruit',
      figure: { kind: 'flowerCycle', stage: 'seed and fruit' },
    },
    {
      label: 'Seed dispersal by wind, water or animals',
      figure: { kind: 'flowerCycle', stage: 'dispersal' },
    },
    {
      label: 'Germination: the root and shoot break out',
      figure: { kind: 'flowerCycle', stage: 'germination' },
    },
    {
      label: 'The seedling grows and flowers',
      figure: { kind: 'flowerCycle', stage: 'seedling' },
    },
  ],
};

const EMBRYO: LayoutDef = {
  kind: 'sequence',
  id: 'g.s9-reproduction-development-embryo',
  title: 'Animal development',
  use: 'Use this for “Which comes first, the blastula or the gastrula?”',
  assumptions: [
    'An egg and a sperm are haploid; together they make a diploid zygote, which divides by mitosis.',
    'Every cell has the same DNA, but different cells turn on different genes: they differentiate.',
  ],
  question: 'Put the stages of animal development in order, from fertilization.',
  stages: [
    {
      label: 'Fertilization: a sperm joins an egg, making a zygote',
      figure: { kind: 'icon', icon: 'zygote' },
    },
    {
      label: 'Cleavage: the zygote divides into a solid ball of cells',
      figure: { kind: 'icon', icon: 'morula' },
    },
    {
      label: 'Blastula: a hollow ball of cells forms',
      figure: { kind: 'icon', icon: 'blastula' },
    },
    {
      label: 'Gastrulation: the cells fold in to form three germ layers',
      figure: { kind: 'icon', icon: 'gastrula' },
    },
    { label: 'Organogenesis: the germ layers form tissues and organs' },
    { label: 'The fetus grows until birth or hatching' },
  ],
};

// ─── Part 6: biome icons (s.9.biomes~land) ─────────────────────────────────────────

const BIOMES: LayoutDef = {
  kind: 'sort',
  id: 'g.s9-biomes-land-icons',
  title: 'Which biome is it?',
  use: 'Use this for “Which biome has permafrost and no trees?”',
  assumptions: [
    'Each card describes a biome’s climate, its plants or its animals.',
    'Plants and animals have adaptations that suit their biome’s temperature and rainfall.',
  ],
  question: 'Which biome does it describe?',
  bins: [
    {
      id: 'rainforest',
      label: 'Tropical rainforest',
      why: 'Warm and wet all year.',
      figure: { kind: 'icon', icon: 'tropical rainforest' },
    },
    {
      id: 'desert',
      label: 'Desert',
      why: 'Under 25 cm of rain a year, hot or cold.',
      figure: { kind: 'icon', icon: 'desert' },
    },
    {
      id: 'grassland',
      label: 'Grassland',
      why: 'Too dry for many trees; grasses and fires.',
      figure: { kind: 'icon', icon: 'grassland' },
    },
    {
      id: 'deciduous',
      label: 'Temperate deciduous forest',
      why: 'Four seasons and steady rain; broad leaves fall in autumn.',
      figure: { kind: 'icon', icon: 'temperate deciduous forest' },
    },
    {
      id: 'taiga',
      label: 'Taiga',
      why: 'Long, cold winters; conifer forest.',
      figure: { kind: 'icon', icon: 'taiga' },
    },
    {
      id: 'tundra',
      label: 'Tundra',
      why: 'Very cold, no trees, permafrost below.',
      figure: { kind: 'icon', icon: 'tundra' },
    },
  ],
  cards: [
    { label: 'Layers of canopy trees, vines and orchids', bin: 'rainforest' },
    { label: 'A cactus stores water in its thick stem', bin: 'desert' },
    { label: 'Bison graze on the prairie', bin: 'grassland' },
    { label: 'Oaks and maples drop their leaves in fall', bin: 'deciduous' },
    { label: 'Spruce and fir forest with deep snow', bin: 'taiga' },
    { label: 'Caribou graze lichens where no trees grow', bin: 'tundra' },
  ],
};

// ─── Part 7: observe pages below 0 and with a second row on its own scale ──────────

const ACTION_POTENTIAL: LayoutDef = {
  kind: 'observe',
  id: 'g.s9-nervous-system-action-potential-trace',
  title: 'A nerve impulse, millisecond by millisecond',
  use: 'Use this to record a neuron’s membrane potential through one impulse.',
  assumptions: [
    'At rest the inside of a neuron is about −70 mV, more negative than the outside.',
    'Past the threshold, about −55 mV, Na⁺ rushes in; then K⁺ flows out and the inside turns negative again.',
  ],
  columns: ['0 ms', '1 ms', '2 ms', '3 ms', '4 ms', '5 ms', '6 ms'],
  rowLabel: 'Membrane potential',
  unit: 'mV',
  min: -90,
  max: 40,
  step: 5,
  initial: [-70, -55, 30, -40, -80, -75, -70],
  pattern: (v) => {
    const peak = Math.max(...v);
    const low = Math.min(...v);
    const sign = (x: number) => (x > 0 ? `+${x}` : x < 0 ? `−${-x}` : '0');
    if (peak < -55)
      return `It never passes the threshold of −55 mV, so no impulse fires: the neuron stays near rest.`;
    const dip =
      low < -70 ? ` It dips to ${sign(low)} mV, below rest, before the pump restores it.` : '';
    return `It passes the threshold and peaks at ${sign(peak)} mV as Na⁺ rushes in; then K⁺ flows out.${dip}`;
  },
};

const HORMONES: LayoutDef = {
  kind: 'observe',
  id: 'g.s9-reproduction-development-hormones',
  title: 'Hormone levels through a cycle',
  use: 'Use this for “Which hormone keeps the uterine lining in the second half of the cycle?”',
  assumptions: [
    'Levels are shown as a share of each hormone’s highest level, 0 to 100.',
    'The days are for a typical 28-day cycle; real cycles vary.',
  ],
  columns: ['Day 1', 'Day 7', 'Day 14', 'Day 21', 'Day 28'],
  rowLabel: 'Estrogen',
  unit: 'Level',
  max: 100,
  step: 5,
  initial: [10, 40, 90, 50, 15],
  second: { rowLabel: 'Progesterone', initial: [5, 5, 10, 80, 10] },
  pattern: (e, p = []) => {
    const ei = e.indexOf(Math.max(...e));
    const pi = p.indexOf(Math.max(...p));
    const days = ['day 1', 'day 7', 'day 14', 'day 21', 'day 28'];
    if (pi > ei)
      return `Estrogen peaks first, by ${days[ei]}, rebuilding the lining; progesterone peaks later, by ${days[pi]}, keeping it.`;
    return `Here progesterone peaks by ${days[pi]}, before estrogen: in a real cycle estrogen leads, before ovulation.`;
  },
};

const CLIMOGRAPH: LayoutDef = {
  kind: 'observe',
  id: 'g.s9-biomes-rainfall-climograph',
  title: 'Rainfall and temperature by month',
  use: 'Use this to record a place’s rainfall and temperature each month and see which biome it suits.',
  assumptions: [
    'Rainfall is in millimeters: 10 mm is 1 cm of water over the ground.',
    'Temperature is the month’s average, in °C; bars below the line are below freezing.',
  ],
  columns: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  rowLabel: 'Rainfall',
  unit: 'mm',
  max: 400,
  step: 10,
  initial: [80, 70, 90, 90, 100, 100, 110, 100, 90, 80, 90, 90],
  second: {
    rowLabel: 'Temperature',
    unit: '°C',
    min: -30,
    max: 40,
    step: 1,
    initial: [-5, -3, 3, 10, 16, 21, 24, 23, 18, 11, 4, -2],
  },
  pattern: (rain, temp = []) => {
    const cm = Math.round(rain.reduce((a, b) => a + b, 0) / 10);
    const warmest = Math.max(...temp);
    const coldest = Math.min(...temp);
    if (warmest < 10)
      return `About ${cm} cm a year, and no month above 10 °C: too cold for trees, tundra.`;
    if (cm < 25) return `About ${cm} cm a year: a desert, whatever the temperature.`;
    if (coldest >= 18 && cm >= 200)
      return `About ${cm} cm a year and warm every month: a tropical rainforest.`;
    if (coldest < -10) return `About ${cm} cm a year with long, freezing winters: taiga.`;
    if (cm < 75) return `About ${cm} cm a year with warm summers: grassland.`;
    return `About ${cm} cm a year, cold winters and warm summers: a temperate deciduous forest.`;
  },
};

export const HS3D_GALLERY_LAYOUTS: LayoutDef[] = [
  FINGERPRINT,
  REFLEX_EXPLORE,
  REFLEX_SEQUENCE,
  FLOWER,
  LIFE_CYCLE,
  EMBRYO,
  BIOMES,
  ACTION_POTENTIAL,
  HORMONES,
  CLIMOGRAPH,
];
