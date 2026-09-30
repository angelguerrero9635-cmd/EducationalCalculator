/**
 * Grade 10 math layout pages (explore, sort, sequence, observe), by skill in taxonomy order.
 * The calculators are in `../math/10.ts`. Data only: no UI code.
 */
import type { LayoutDef } from './types';

// ── Similarity (G-SRT.2–5) ──
const SIMILARITY: LayoutDef[] = [
  {
    kind: 'sort',
    id: 'm.10.similarity~similar-or-not',
    title: 'Similar, and by which test?',
    use: 'Use this for “Which pairs of triangles must be similar, and why?”',
    assumptions: [
      'AA: two pairs of equal angles. SSS: all three side ratios equal.',
      'SAS: two side ratios equal and the angles between those sides equal.',
      'Anything less is not enough: the triangles might not match.',
    ],
    question: 'Must the triangles be similar? By which test?',
    bins: [
      {
        id: 'aa',
        label: 'Similar by AA',
        why: 'Two pairs of equal angles fix the third pair too.',
      },
      {
        id: 'sss',
        label: 'Similar by SSS',
        why: 'Every side of one is the same multiple of its match.',
      },
      {
        id: 'sas',
        label: 'Similar by SAS',
        why: 'Two sides in the same ratio with equal angles between them.',
      },
      {
        id: 'not',
        label: 'Not always similar',
        why: 'The facts given fit triangles of different shapes.',
      },
    ],
    cards: [
      { label: 'm∠A = m∠D and m∠B = m∠E', bin: 'aa' },
      { label: 'Two equilateral triangles', bin: 'aa' },
      { label: 'Sides 3, 4, 6 and 4.5, 6, 9', bin: 'sss' },
      { label: 'AB/DE = AC/DF = 2 and m∠A = m∠D', bin: 'sas' },
      { label: 'Two isosceles triangles', bin: 'not' },
      { label: 'Two right triangles', bin: 'not' },
      { label: 'Sides 4, 6, 8 and 6, 9, 13', bin: 'not' },
      { label: 'AB/DE = BC/EF and m∠A = m∠D', bin: 'not' },
    ],
  },
];

export const MATH_10_LAYOUTS: LayoutDef[] = [...SIMILARITY];
