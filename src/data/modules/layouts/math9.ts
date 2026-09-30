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

  // ── Regression: the direction of a correlation (S-ID.8) ──
  {
    kind: 'sort',
    id: 'm.9.regression~correlation',
    title: 'Positive, negative or none?',
    use: 'Use this for “Which scatter plot shows a negative correlation?” or “What does r = −0.78 say?”',
    assumptions: [
      'The sign of r says which way the points go; how close r is to 1 or −1 says how tight they are.',
      'Positive: as one variable goes up, the other tends to go up.',
      'Negative: as one goes up, the other tends to go down. None: no trend either way.',
    ],
    question: 'What kind of correlation is it?',
    bins: [
      {
        id: 'positive',
        label: 'Positive correlation',
        why: 'The points rise from left to right, and r is above 0.',
      },
      {
        id: 'negative',
        label: 'Negative correlation',
        why: 'The points fall from left to right, and r is below 0.',
      },
      {
        id: 'none',
        label: 'No correlation',
        why: 'The points show no trend up or down, and r is close to 0.',
      },
    ],
    cards: [
      { label: 'Rising points', bin: 'positive', figure: { kind: 'scatter', trend: 'up' } },
      { label: 'r = 0.91', bin: 'positive' },
      { label: 'Height and arm span', bin: 'positive' },
      { label: 'Falling points', bin: 'negative', figure: { kind: 'scatter', trend: 'down' } },
      { label: 'r = −0.78', bin: 'negative' },
      { label: 'Age of a bike and its resale price', bin: 'negative' },
      { label: 'Scattered points', bin: 'none', figure: { kind: 'scatter', trend: 'none' } },
      { label: 'r = 0.04', bin: 'none' },
      { label: 'Shoe size and quiz score', bin: 'none' },
    ],
  },

  // ── Radicals: rational and irrational numbers (N-RN.3) ──
  {
    kind: 'sort',
    id: 'm.9.radicals~rational-or-irrational',
    title: 'Rational or irrational?',
    use: 'Use this for “Which of these are irrational: √49, 5√2, √8 × √2, π ÷ 2?”',
    assumptions: [
      'A sum or product of two rational numbers is rational; a rational number (not 0) times an irrational one is irrational.',
      'Simplify first: √8 × √2 = √16 = 4 is rational.',
      'A rational number plus an irrational one is irrational.',
    ],
    question: 'Is the number rational or irrational?',
    bins: [
      {
        id: 'rational',
        label: 'Rational',
        why: 'It simplifies to a fraction of whole numbers: its decimal ends or repeats.',
      },
      {
        id: 'irrational',
        label: 'Irrational',
        why: 'An irrational part is left after simplifying: its decimal never ends or repeats.',
      },
    ],
    cards: [
      { label: '√49', bin: 'rational' },
      { label: '−7/4', bin: 'rational' },
      { label: '0.3̅', bin: 'rational' },
      { label: '√8 × √2', bin: 'rational' },
      { label: '√12 ÷ √3', bin: 'rational' },
      { label: '√12', bin: 'irrational' },
      { label: '5√2', bin: 'irrational' },
      { label: '3 + √5', bin: 'irrational' },
      { label: 'π ÷ 2', bin: 'irrational' },
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
