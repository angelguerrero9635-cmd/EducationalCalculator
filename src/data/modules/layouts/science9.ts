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

export const SCIENCE_9_LAYOUTS: LayoutDef[] = [...INHERITANCE];
