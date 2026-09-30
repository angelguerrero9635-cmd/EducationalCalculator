/**
 * Grade 9 science layout pages (explore, sort, sequence, observe), by skill in taxonomy order.
 * The calculators are in `../science/9.ts`. Data only: no UI code.
 */
import type { DivisionStage } from '../typesHsg';
import type { LayoutDef } from './types';

/** A stage card: its name and the cell drawn at that stage, 2n = 4. */
const division = (label: string, stage: DivisionStage) => ({
  label,
  figure: { kind: 'cellDivision' as const, stage, diploid: 4 },
});

const INHERITANCE: LayoutDef[] = [
  // ── Mendelian and non-Mendelian inheritance (HS-LS3-2, HS-LS3-3) ──
  {
    kind: 'sort',
    id: 's.9.inheritance-patterns~blood-types',
    title: 'ABO blood types from genotypes',
    use: 'Use this for “Which two genotypes give the same blood type?”',
    assumptions: [
      'The ABO gene has three alleles: Iᴬ, Iᴮ and i.',
      'Iᴬ and Iᴮ are codominant, so IᴬIᴮ shows both; i is recessive to each of them.',
    ],
    question: 'Which blood type does the genotype give?',
    bins: [
      { id: 'A', label: 'Type A', why: 'At least one Iᴬ and no Iᴮ: i is hidden.' },
      { id: 'B', label: 'Type B', why: 'At least one Iᴮ and no Iᴬ: i is hidden.' },
      { id: 'AB', label: 'Type AB', why: 'Codominance: both A and B markers show on the cells.' },
      { id: 'O', label: 'Type O', why: 'Two recessive i alleles: no A or B marker.' },
    ],
    cards: [
      { label: 'IᴬIᴬ', bin: 'A' },
      { label: 'Iᴬi', bin: 'A' },
      { label: 'IᴮIᴮ', bin: 'B' },
      { label: 'Iᴮi', bin: 'B' },
      { label: 'IᴬIᴮ', bin: 'AB' },
      { label: 'ii', bin: 'O' },
    ],
  },
  {
    kind: 'explore',
    id: 's.9.inheritance-patterns~pedigree',
    title: 'A sex-linked pedigree',
    use: 'Use this for “Can an affected son have a mother who does not show the trait?”',
    assumptions: [
      'Squares are males and circles females; filled shows the trait, half-filled carries it.',
      'Red–green color blindness is X-linked recessive: Xᵇ on the X chromosome.',
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
      {
        label: 'Reading the symbols',
        lines: [
          'Three generations: a horizontal line joins partners, and a vertical line leads down to their children.',
          'Two males show the trait: the grandfather and one grandson.',
        ],
        family: {},
      },
      {
        label: 'Carriers',
        lines: [
          'Only females can be carriers: a male has one X, so he shows whatever allele it carries.',
        ],
        family: { carriers: true },
      },
      {
        label: 'Genotypes',
        lines: [
          'Each son’s X came from his mother; each daughter got her father’s only X.',
          'So every daughter of the affected grandfather carries Xᵇ.',
        ],
        family: { carriers: true, genotypes: true },
      },
      {
        label: 'An affected son',
        lines: [
          'Can an affected son have a mother who does not show the trait? Yes: she can be a carrier, XᴮXᵇ.',
          'Her son got her Xᵇ, and his Y from his father.',
        ],
        family: { lit: ['d1', 'c1'], ask: 'd1' },
      },
    ],
  },
];

const EVOLUTION: LayoutDef[] = [
  // ── Evidence for evolution, population genetics and speciation (HS-LS4-1 to 4-5) ──
  {
    kind: 'sort',
    id: 's.9.evolution-evidence~homologous',
    title: 'Homologous, analogous or vestigial?',
    use: 'Use this for “Which forelimb is not homologous to the others?”',
    assumptions: [
      'Homologous structures have the same bones in the same order, inherited from a common ancestor, even when they do different jobs.',
      'Analogous structures do the same job but are built differently: they show no shared ancestry.',
      'Vestigial structures are small leftovers of parts an ancestor used.',
    ],
    question: 'What does the structure show about ancestry?',
    bins: [
      {
        id: 'homologous',
        label: 'Homologous',
        why: 'Upper arm, two forearm bones, wrist and fingers, in the same order.',
      },
      {
        id: 'analogous',
        label: 'Analogous',
        why: 'The same job reached by a different build, not by shared ancestry.',
      },
      {
        id: 'vestigial',
        label: 'Vestigial',
        why: 'A reduced part that an ancestor used, such as legs on a whale’s land-walking ancestor.',
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
      { label: 'A shark’s fin beside a dolphin’s flipper', bin: 'analogous' },
      { label: 'A whale’s small hip bones', bin: 'vestigial' },
      { label: 'The human tailbone', bin: 'vestigial' },
    ],
  },
  {
    kind: 'explore',
    id: 's.9.evolution-evidence~common-ancestry',
    title: 'Common ancestry on a cladogram',
    use: 'Use this for “Which two animals are most closely related?”',
    assumptions: [
      'Each mark is where a shared derived trait first appeared; every taxon above that branch inherited it.',
      'Taxa that split later share a more recent common ancestor, so they are more closely related.',
      'A clade is an ancestor and all of its descendants.',
    ],
    figure: {
      kind: 'cladogram',
      tree: ['Lamprey', ['Shark', ['Bony fish', ['Frog', ['Mouse', ['Lizard', 'Bird']]]]]],
      traits: [
        { name: 'Jaws', taxa: ['Shark', 'Bony fish', 'Frog', 'Mouse', 'Lizard', 'Bird'] },
        { name: 'Bony skeleton', taxa: ['Bony fish', 'Frog', 'Mouse', 'Lizard', 'Bird'] },
        { name: 'Four limbs', taxa: ['Frog', 'Mouse', 'Lizard', 'Bird'] },
        { name: 'Amniotic egg', taxa: ['Mouse', 'Lizard', 'Bird'] },
        { name: 'Feathers', taxa: ['Bird'] },
      ],
    },
    scenes: [
      {
        label: 'Jaws',
        lines: [
          'Jaws appeared after the lamprey split off, so every taxon but the lamprey has them.',
        ],
        clade: { lit: 'Jaws' },
      },
      {
        label: 'Bony skeleton',
        lines: [
          'The shark’s skeleton is cartilage; bone appeared on the branch after it split off.',
        ],
        clade: { lit: 'Bony skeleton' },
      },
      {
        label: 'Four limbs',
        lines: ['The frog, mouse, lizard and bird are tetrapods: all four inherited four limbs.'],
        clade: { lit: 'Four limbs' },
      },
      {
        label: 'Amniotic egg',
        lines: [
          'An egg with its own water supply let the ancestor of mammals, reptiles and birds lay eggs on land.',
        ],
        clade: { lit: 'Amniotic egg' },
      },
      {
        label: 'Feathers',
        lines: [
          'Only the bird has feathers: a trait of its own branch, so it groups nothing else.',
        ],
        clade: { lit: 'Feathers' },
      },
      {
        label: 'Closest relatives',
        lines: [
          'The lizard and the bird split last, so they share the most recent common ancestor.',
          'A lizard is more closely related to a bird than to a mouse.',
        ],
        clade: { ring: ['Lizard', 'Bird'] },
      },
      {
        label: 'Reptiles',
        lines: [
          'The smallest clade holding the lizard also holds the bird.',
          'So a group of reptiles that leaves out birds is not a clade.',
        ],
        clade: { ring: ['Lizard'] },
      },
      {
        label: 'Trees from DNA',
        lines: [
          'Counting the differences in one gene’s DNA sequence places the branches in the same order.',
          'Species with fewer differences split more recently.',
        ],
        clade: {},
      },
    ],
  },
  {
    kind: 'sequence',
    id: 's.9.evolution-evidence~resistance',
    title: 'How bacteria become resistant to an antibiotic',
    use: 'Use this for “Why does overusing antibiotics lead to resistant bacteria?”',
    assumptions: [
      'Darwin’s points: individuals vary, the variation is inherited, more are born than survive, and survival depends on the variation.',
      'Mutations are random: the antibiotic does not cause them, it only selects the ones already there.',
    ],
    question: 'Put the steps of natural selection for resistance in order.',
    stages: [
      { label: 'Bacteria vary, and a few carry a mutation for resistance' },
      { label: 'An antibiotic kills most of the susceptible bacteria' },
      { label: 'The resistant survivors divide and pass on the mutation' },
      { label: 'The next population is mostly resistant' },
    ],
  },
  {
    kind: 'sequence',
    id: 's.9.evolution-evidence~speciation',
    title: 'How one species becomes two',
    use: 'Use this for “Put the steps of speciation after a population is split in order.”',
    assumptions: [
      'A species is a group whose members can interbreed and have fertile offspring.',
      'A barrier stops gene flow, so the two groups change separately over many generations.',
    ],
    question: 'Put the steps of speciation in order.',
    stages: [
      { label: 'One interbreeding population' },
      { label: 'A barrier splits it, such as a river or a mountain range' },
      { label: 'Mutations, selection and drift differ on each side' },
      { label: 'The groups can no longer interbreed: two species' },
    ],
  },
  {
    kind: 'sort',
    id: 's.9.evolution-evidence~mechanisms',
    title: 'What changes allele frequencies?',
    use: 'Use this for “Which condition would change the allele frequencies in a population?”',
    assumptions: [
      'Hardy–Weinberg equilibrium needs all five conditions; break any one and the population can evolve.',
      'Evolution here means a change in allele frequencies from one generation to the next.',
    ],
    question: 'Does it keep allele frequencies steady or change them?',
    bins: [
      {
        id: 'steady',
        label: 'Keeps allele frequencies steady',
        why: 'The five Hardy–Weinberg conditions: nothing favors or adds any allele.',
      },
      {
        id: 'changes',
        label: 'Changes allele frequencies',
        why: 'Each of these is a way a population evolves.',
      },
    ],
    cards: [
      { label: 'A very large population', bin: 'steady' },
      { label: 'Random mating', bin: 'steady' },
      { label: 'No mutation', bin: 'steady' },
      { label: 'No one moves in or out', bin: 'steady' },
      { label: 'Every genotype survives equally', bin: 'steady' },
      { label: 'Genetic drift in a small population', bin: 'changes' },
      { label: 'Gene flow from migrants', bin: 'changes' },
      { label: 'Natural selection', bin: 'changes' },
      { label: 'A new mutation', bin: 'changes' },
      { label: 'Mates chosen by a trait', bin: 'changes' },
    ],
  },
];

const POPULATION: LayoutDef[] = [
  // ── Population growth and carrying capacity (HS-LS2-1, HS-LS2-2) ──
  {
    kind: 'sort',
    id: 's.9.population-ecology~limiting-factors',
    title: 'Density-dependent or density-independent?',
    use: 'Use this for “Habitat loss crowds a population. Which limiting factor grows stronger?”',
    assumptions: [
      'A limiting factor keeps a population from growing without end.',
      'Density-dependent factors hit harder as the population gets more crowded; density-independent ones hit the same share whatever the crowding.',
    ],
    question: 'Does its effect depend on how crowded the population is?',
    bins: [
      {
        id: 'dependent',
        label: 'Density-dependent',
        why: 'The more individuals share the space, the stronger it acts.',
      },
      {
        id: 'independent',
        label: 'Density-independent',
        why: 'Weather and disasters strike a sparse population as hard as a crowded one.',
      },
    ],
    cards: [
      { label: 'Competition for food', bin: 'dependent' },
      { label: 'Disease spreading in a crowded herd', bin: 'dependent' },
      { label: 'Predators catching more prey when prey are many', bin: 'dependent' },
      { label: 'Parasites', bin: 'dependent' },
      { label: 'Less nesting space after habitat loss', bin: 'dependent' },
      { label: 'A wildfire', bin: 'independent' },
      { label: 'A flood', bin: 'independent' },
      { label: 'A late frost', bin: 'independent' },
      { label: 'A hurricane', bin: 'independent' },
      { label: 'A drought', bin: 'independent' },
    ],
  },
  {
    kind: 'sequence',
    id: 's.9.population-ecology~growth-phases',
    title: 'Bacteria growing in a flask',
    use: 'Use this for “Why does the number of bacteria level off and then fall?”',
    assumptions: [
      'A flask holds a fixed amount of food and never has its wastes removed.',
      'Growth is fastest in the exponential phase; it stops when births equal deaths.',
    ],
    question: 'Put the growth phases in order.',
    stages: [
      { label: 'Lag: the cells adjust and divide little' },
      { label: 'Exponential: doubling at a steady rate' },
      { label: 'Stationary: births equal deaths as food runs low' },
      { label: 'Death: wastes build up and deaths exceed births' },
    ],
  },
];

const MEMBRANE: LayoutDef[] = [
  // ── Cell membranes and transport (HS-LS1-2, HS-LS1-3) ──
  {
    kind: 'sort',
    id: 's.9.membrane-transport~transport-types',
    title: 'Which kind of transport is it?',
    use: 'Use this for “Is it passive or active transport, and does it need a protein?”',
    assumptions: [
      'Passive transport runs from more to fewer and uses no ATP; active transport runs the other way and spends ATP.',
      'Facilitated diffusion and osmosis are passive but go through a channel or carrier protein.',
    ],
    question: 'How does it cross the membrane?',
    bins: [
      {
        id: 'simple',
        label: 'Simple diffusion',
        why: 'Small nonpolar molecules slip between the phospholipids, from more to fewer.',
      },
      {
        id: 'facilitated',
        label: 'Facilitated diffusion',
        why: 'A channel or carrier protein lets it through, still from more to fewer, with no ATP.',
      },
      {
        id: 'osmosis',
        label: 'Osmosis',
        why: 'Water crosses, through aquaporins, toward the side with more solute.',
      },
      {
        id: 'active',
        label: 'Active transport',
        why: 'A pump moves it from fewer to more, against the gradient, spending ATP.',
      },
      {
        id: 'bulk',
        label: 'Bulk transport',
        why: 'Large particles or many molecules move inside vesicles made from membrane.',
      },
    ],
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
  {
    kind: 'sort',
    id: 's.9.membrane-transport~tonicity',
    title: 'Cells in hypotonic, isotonic and hypertonic water',
    use: 'Use this for “Onion cells in salt water shrink from their walls. Why?”',
    assumptions: [
      'Water moves by osmosis toward the side with more solute.',
      'A red blood cell has no wall: it swells and can burst, or shrivels. A plant cell’s wall holds it firm, or its membrane pulls away.',
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
      { label: 'Wilted lettuce in fresh water turns crisp', bin: 'in' },
      { label: 'Red blood cells in 0.9% saline', bin: 'none' },
      { label: 'Celery in salty water goes limp', bin: 'out' },
      { label: 'Red onion skin in salt water shrinks from its wall', bin: 'out' },
    ],
  },
];

const DIVISION: LayoutDef[] = [
  // ── The cell cycle, mitosis and meiosis (HS-LS1-4, HS-LS3-2) ──
  {
    kind: 'sequence',
    id: 's.9.mitosis-meiosis',
    assumptions: [
      'DNA is copied in interphase, so each chromosome enters mitosis as two sister chromatids.',
      'This cell has 2n = 4 chromosomes: two pairs, one of each pair from each parent (red and blue).',
      'The two daughter cells match the parent cell: 4 chromosomes each.',
    ],
    question: 'Put the stages of mitosis in order, from interphase.',
    stages: [
      division('Interphase', 'interphase'),
      division('Prophase', 'prophase'),
      division('Metaphase', 'metaphase'),
      division('Anaphase', 'anaphase'),
      division('Telophase', 'telophase'),
      division('Cytokinesis', 'cytokinesis'),
    ],
  },
  {
    kind: 'sequence',
    id: 's.9.mitosis-meiosis~cell-cycle',
    title: 'The cell cycle and how long each phase takes',
    use: 'Use this for “In which phase of the cell cycle is DNA replicated?”',
    assumptions: [
      'Interphase is G1, S and G2: the cell spends most of its life there, growing and copying its DNA.',
      'The times are typical for a human cell dividing in a dish, and they vary from cell to cell.',
    ],
    question: 'Put the phases of the cell cycle in order.',
    stages: [
      { label: 'G1: the cell grows', span: 11 },
      { label: 'S: the DNA is replicated', span: 8 },
      { label: 'G2: the copies are checked', span: 4 },
      { label: 'M: mitosis and cytokinesis', span: 1 },
    ],
    unit: 'hours',
    totalLabel: 'One cycle of a dividing human cell',
  },
  {
    kind: 'sequence',
    id: 's.9.mitosis-meiosis~meiosis',
    title: 'Meiosis I and II',
    use: 'Use this for “What are the final products of meiosis?”',
    assumptions: [
      'Homologous chromosomes pair up and cross over in prophase I, swapping pieces.',
      'Anaphase I separates the homologs; anaphase II separates the sister chromatids.',
      'The result is four haploid cells, n = 2, and no two alike.',
    ],
    question: 'Put the stages of meiosis in order, from interphase.',
    stages: [
      division('Interphase', 'interphase'),
      division('Prophase I', 'prophase I'),
      division('Metaphase I', 'metaphase I'),
      division('Anaphase I', 'anaphase I'),
      division('Telophase I', 'telophase I'),
      division('Prophase II', 'prophase II'),
      division('Metaphase II', 'metaphase II'),
      division('Anaphase II', 'anaphase II'),
      division('Telophase II', 'telophase II'),
    ],
  },
  {
    kind: 'sort',
    id: 's.9.mitosis-meiosis~compare',
    title: 'Mitosis, meiosis or both?',
    use: 'Use this for “Why do offspring from sexual reproduction vary more than those from mitosis?”',
    assumptions: [
      'Mitosis copies a body cell; meiosis makes gametes with half the chromosomes.',
      'Crossing over and the random sorting of homologs make every gamete different, so sexual reproduction adds variation.',
    ],
    question: 'Does it happen in mitosis, meiosis or both?',
    bins: [
      { id: 'mitosis', label: 'Mitosis', why: 'One division: two cells identical to the parent.' },
      {
        id: 'meiosis',
        label: 'Meiosis',
        why: 'Two divisions: four haploid gametes, each different.',
      },
      {
        id: 'both',
        label: 'Both',
        why: 'Each starts from copied chromosomes and pulls sisters apart.',
      },
    ],
    cards: [
      { label: 'Makes 2 identical cells', bin: 'mitosis' },
      { label: 'Body growth and wound repair', bin: 'mitosis' },
      { label: 'Daughter cells are diploid', bin: 'mitosis' },
      { label: 'Makes 4 cells with half the chromosomes', bin: 'meiosis' },
      {
        label: 'Homologous chromosomes pair and cross over',
        bin: 'meiosis',
        figure: { kind: 'cellDivision', stage: 'prophase I', diploid: 4 },
      },
      { label: 'Makes eggs and sperm', bin: 'meiosis' },
      { label: 'Two divisions in a row', bin: 'meiosis' },
      { label: 'Gametes differ from one another', bin: 'meiosis' },
      { label: 'DNA is copied beforehand', bin: 'both' },
      {
        label: 'Sister chromatids separate',
        bin: 'both',
        figure: { kind: 'cellDivision', stage: 'anaphase', diploid: 4 },
      },
    ],
  },
];

const ECOSYSTEMS: LayoutDef[] = [
  // ── Ecosystems: energy pyramids, matter cycles, succession, biodiversity (HS-LS2-2 to 2-7) ──
  {
    kind: 'sequence',
    id: 's.9.ecosystem-dynamics~succession',
    title: 'Primary succession',
    use: 'Use this for “Put these communities in the order they grow on new volcanic rock.”',
    assumptions: [
      'Primary succession starts with no soil: new lava rock, or rock left bare by a glacier.',
      'Pioneer lichens break down rock; each community changes the soil and shade so the next can grow.',
      'Secondary succession, after a fire or on a plowed field, starts at grasses because the soil remains.',
    ],
    question: 'Put the stages of primary succession in order.',
    stages: [
      { label: 'Bare rock', figure: { kind: 'icon', icon: 'bare rock' } },
      { label: 'Lichens', figure: { kind: 'icon', icon: 'lichens on rock' } },
      { label: 'Mosses and thin soil', figure: { kind: 'icon', icon: 'mosses and thin soil' } },
      { label: 'Grasses and flowers', figure: { kind: 'icon', icon: 'grasses and flowers' } },
      { label: 'Shrubs', figure: { kind: 'icon', icon: 'shrubs' } },
      { label: 'Young trees', figure: { kind: 'icon', icon: 'young trees' } },
      { label: 'Mature forest', figure: { kind: 'icon', icon: 'mature forest' } },
    ],
  },
  {
    kind: 'explore',
    id: 's.9.ecosystem-dynamics~nitrogen',
    title: 'The nitrogen cycle',
    use: 'Use this for “How do plants such as beans add nitrogen to the soil?”',
    assumptions: [
      'Air is mostly nitrogen gas, N₂, but plants and animals cannot use it in that form.',
      'Living things need nitrogen to build amino acids, so proteins, and the bases of DNA.',
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
          'Bacteria in the root nodules of beans and clover turn N₂ into ammonia, which becomes ammonium in the soil.',
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
        lines: [
          'Plant roots take in nitrate and ammonium and build them into amino acids and DNA.',
        ],
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
        lines: ['Bacteria in wet, airless soil turn nitrate back into N₂ gas, closing the cycle.'],
        nitrogen: { process: 'denitrification' },
      },
    ],
  },
];

const HOMEOSTASIS: LayoutDef[] = [
  // ── Body systems, homeostasis and feedback loops (HS-LS1-2, HS-LS1-3) ──
  {
    kind: 'explore',
    id: 's.9.homeostasis',
    assumptions: [
      'Homeostasis keeps conditions inside the body near a set point, such as about 37 °C.',
      'Negative feedback undoes the change and switches off once the set point returns.',
      'Positive feedback makes the change grow until an event ends it.',
    ],
    figure: { kind: 'feedbackLoop' },
    scenes: [
      {
        label: 'Too hot',
        lines: [
          'During exercise the rise in temperature is the stimulus, and sweating is the response.',
          'The response undoes the stimulus, so this is negative feedback.',
        ],
        loop: {
          sign: 'negative',
          back: 'negative feedback',
          lit: 2,
          steps: [
            {
              role: 'Stimulus',
              text: 'Body temperature rises above its set point during exercise.',
            },
            { role: 'Sensor', text: 'Nerve endings in the skin and brain detect the rise.' },
            { role: 'Control center', text: 'The hypothalamus compares it with the set point.' },
            { role: 'Effector', text: 'Sweat glands release sweat; skin blood vessels widen.' },
            {
              role: 'Response',
              text: 'Sweat evaporates and blood sheds heat, so temperature falls.',
            },
          ],
        },
      },
      {
        label: 'Too cold',
        lines: ['The same control center answers a drop: now the effectors make and keep heat.'],
        loop: {
          sign: 'negative',
          back: 'negative feedback',
          lit: 3,
          steps: [
            { role: 'Stimulus', text: 'Body temperature falls below its set point.' },
            { role: 'Sensor', text: 'Nerve endings in the skin and brain detect the drop.' },
            { role: 'Control center', text: 'The hypothalamus signals the body to save heat.' },
            { role: 'Effector', text: 'Muscles shiver; skin blood vessels narrow.' },
            { role: 'Response', text: 'More heat is made and less is lost, so temperature rises.' },
          ],
        },
      },
      {
        label: 'Blood sugar high',
        lines: [
          'After a meal the pancreas releases insulin, and glucose leaves the blood.',
          'Once glucose is back near normal, insulin release slows: negative feedback.',
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
        lines: ['Between meals, glucagon tells the liver to release the glucose it stored.'],
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
        label: 'Water balance',
        lines: [
          'When blood is too concentrated, ADH tells the kidneys to return more water to the blood.',
          'The urine becomes darker and smaller in amount until the balance returns.',
        ],
        loop: {
          sign: 'negative',
          back: 'negative feedback',
          lit: 3,
          steps: [
            { role: 'Stimulus', text: 'The blood becomes too concentrated, as after sweating.' },
            { role: 'Sensor', text: 'Cells in the hypothalamus detect the change.' },
            { role: 'Control center', text: 'The pituitary gland releases ADH.' },
            { role: 'Effector', text: 'The kidneys return more water to the blood.' },
            { role: 'Response', text: 'The blood is diluted back toward normal.' },
          ],
        },
      },
      {
        label: 'Childbirth',
        lines: [
          'Each contraction brings a stronger one: the response adds to the stimulus.',
          'This positive feedback grows until the baby is born, which ends it.',
        ],
        loop: {
          sign: 'positive',
          back: 'positive feedback',
          steps: [
            { role: 'Stimulus', text: 'The baby’s head stretches the cervix.' },
            { role: 'Sensor', text: 'Stretch receptors send signals to the brain.' },
            { role: 'Control center', text: 'The pituitary gland releases oxytocin.' },
            { role: 'Effector', text: 'The muscles of the uterus contract harder.' },
            { role: 'Response', text: 'The head stretches the cervix more.' },
          ],
        },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.9.homeostasis~systems',
    title: 'Which body system does it?',
    use: 'Use this for “Which organ system filters the blood and controls the water in it?”',
    assumptions: [
      'The nervous and endocrine systems coordinate the rest: nerves by fast signals, glands by hormones in the blood.',
      'Body systems work together to keep homeostasis.',
    ],
    question: 'Which system does the job?',
    bins: [
      { id: 'nervous', label: 'Nervous', why: 'Neurons carry fast electrical signals.' },
      { id: 'endocrine', label: 'Endocrine', why: 'Glands release hormones into the blood.' },
      { id: 'circulatory', label: 'Circulatory', why: 'Blood carries gases, food and heat.' },
      { id: 'respiratory', label: 'Respiratory', why: 'The lungs trade O₂ and CO₂ with the air.' },
      {
        id: 'excretory',
        label: 'Excretory',
        why: 'The kidneys remove wastes and set the blood’s water.',
      },
      { id: 'digestive', label: 'Digestive', why: 'Food is broken down and absorbed.' },
    ],
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
  {
    kind: 'sort',
    id: 's.9.homeostasis~feedback-types',
    title: 'Negative or positive feedback?',
    use: 'Use this for “Once blood sodium is normal, the hormone stops. What kind of feedback is it?”',
    assumptions: [
      'Negative feedback works against a change and stops when the set point returns.',
      'Positive feedback adds to a change until an event, such as a birth, ends it.',
    ],
    question: 'Does the response undo the change or add to it?',
    bins: [
      {
        id: 'negative',
        label: 'Negative feedback',
        why: 'The response undoes the change, keeping a value near its set point.',
      },
      {
        id: 'positive',
        label: 'Positive feedback',
        why: 'The response makes the change bigger, until something ends it.',
      },
    ],
    cards: [
      { label: 'Sweating when hot', bin: 'negative' },
      { label: 'Shivering when cold', bin: 'negative' },
      { label: 'Insulin after a meal', bin: 'negative' },
      { label: 'Glucagon between meals', bin: 'negative' },
      { label: 'ADH when dehydrated', bin: 'negative' },
      { label: 'Aldosterone stops once blood sodium is normal', bin: 'negative' },
      { label: 'Contractions during childbirth', bin: 'positive' },
      { label: 'Platelets calling more platelets to a cut', bin: 'positive' },
      { label: 'Ripe fruit releasing ethylene that ripens nearby fruit', bin: 'positive' },
    ],
  },
  {
    kind: 'observe',
    id: 's.9.homeostasis~blood-glucose',
    title: 'Blood glucose after a meal',
    use: 'Use this to record or read blood glucose after a meal and see insulin bring it back.',
    assumptions: [
      'A healthy fasting level is about 70–99 mg/dL; these values are typical, not a diagnosis.',
      'Insulin from the pancreas lets cells take in glucose, so the level falls back.',
    ],
    columns: ['0 min', '30 min', '60 min', '90 min', '120 min', '150 min'],
    rowLabel: 'Blood glucose',
    unit: 'mg/dL',
    max: 200,
    step: 5,
    initial: [85, 135, 120, 100, 90, 85],
    pattern: (v) => {
      const peak = Math.max(...v);
      const at = v.indexOf(peak);
      const last = v[v.length - 1]!;
      if (at > 0 && at < v.length - 1 && last < peak)
        return `Glucose peaks at ${peak} mg/dL ${at * 30} minutes after the meal, then insulin brings it back near ${last}.`;
      if (v.every((x) => x === v[0]))
        return 'The level stayed flat; after a real meal it rises first, then falls back.';
      return 'A healthy curve rises after the meal, peaks, then falls back as insulin acts.';
    },
  },
];

export const SCIENCE_9_LAYOUTS: LayoutDef[] = [
  ...INHERITANCE,
  ...EVOLUTION,
  ...POPULATION,
  ...MEMBRANE,
  ...DIVISION,
  ...ECOSYSTEMS,
  ...HOMEOSTASIS,
];
