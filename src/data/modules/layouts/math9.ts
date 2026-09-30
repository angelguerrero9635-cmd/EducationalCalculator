/**
 * Grade 9 math layout pages (explore, sort, sequence, observe), by skill in taxonomy order.
 * The calculators are in `../math/9.ts`. Data only: no UI code.
 */
import type { LayoutDef } from './types';

export const MATH_9_LAYOUTS: LayoutDef[] = [
  // ── Exponential functions (F-LE.1) ──
  {
    kind: 'sort',
    id: 'm.9.exponential-functions~linear-or-exponential',
    title: 'Linear or exponential?',
    use: 'Use this for “Which model fits: does it add the same amount or multiply by the same factor each step?”',
    assumptions: [
      'Over equal steps a linear function adds the same amount; an exponential one multiplies by the same factor.',
      'In a table, look at the differences first, then the ratios.',
      'A percent change each step is a multiplication, so it is exponential.',
    ],
    question: 'Does it add the same amount or multiply by the same factor each step?',
    bins: [
      {
        id: 'linear',
        label: 'Linear: adds the same amount each step',
        why: 'The same amount is added (or taken away) over each equal step.',
      },
      {
        id: 'exponential',
        label: 'Exponential: multiplies by the same factor each step',
        why: 'Each equal step multiplies by the same factor, so the change keeps growing or shrinking.',
      },
    ],
    cards: [
      { label: 'Saves $15 each week', bin: 'linear' },
      { label: 'Grows 3 cm each month', bin: 'linear' },
      { label: 'y: 5, 15, 25, 35', bin: 'linear' },
      { label: 'y = 4 + 3x', bin: 'linear' },
      { label: 'Doubles every 20 minutes', bin: 'exponential' },
      { label: 'Loses 8% of its value each year', bin: 'exponential' },
      { label: 'y: 5, 15, 45, 135', bin: 'exponential' },
      { label: 'y = 4(3)^x', bin: 'exponential' },
      { label: 'Each person passes a note to 4 new people', bin: 'exponential' },
    ],
  },
];
