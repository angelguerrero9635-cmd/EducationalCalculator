/**
 * Grade 9 math layout pages (explore, sort, sequence, observe), by skill in taxonomy order.
 * The calculators are in `../math/9.ts`. Data only: no UI code.
 */
import type { LayoutDef } from './types';

export const MATH_9_LAYOUTS: LayoutDef[] = [
  // ── Solving linear equations (A-REI.3) ──
  {
    kind: 'sort',
    id: 'm.9.solving-equations~how-many-solutions',
    title: 'How many solutions?',
    use: 'Use this for “Which equation has exactly one solution, no solution, or infinitely many?”',
    assumptions: [
      'Collect the x terms. If they cancel, the numbers left decide: a false statement has no solution, a true one every number.',
      'If the x terms don’t cancel, there is exactly one solution.',
      'Distribute first, so both sides are in the form ax + b.',
    ],
    question: 'How many solutions does the equation have?',
    bins: [
      {
        id: 'one',
        label: 'Exactly one solution',
        why: 'The x terms differ, so one value of x balances the two sides.',
      },
      {
        id: 'none',
        label: 'No solution',
        why: 'The x terms cancel and leave a false statement, such as 1 = 6.',
      },
      {
        id: 'every',
        label: 'Every number is a solution',
        why: 'The two sides are the same expression, so any x makes it true.',
      },
    ],
    cards: [
      { label: '5x − 2 = 3x + 8', bin: 'one' },
      { label: '6x + 4 = 2x', bin: 'one' },
      { label: '2n + 1 = 9', bin: 'one' },
      { label: '4x + 1 = 4x + 6', bin: 'none' },
      { label: '3x = 3x + 0.5', bin: 'none' },
      { label: '2n + 1 = 2n', bin: 'none' },
      { label: '2(x + 3) = 2x + 6', bin: 'every' },
      { label: '7 − x = −x + 7', bin: 'every' },
    ],
  },

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
