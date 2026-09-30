/**
 * Grade 9 science layout pages (explore, sort, sequence, observe), by skill in taxonomy order.
 * The calculators are in `../science/9.ts`. Data only: no UI code.
 */
import type { LayoutDef } from './types';

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

export const SCIENCE_9_LAYOUTS: LayoutDef[] = [...INHERITANCE, ...EVOLUTION];
