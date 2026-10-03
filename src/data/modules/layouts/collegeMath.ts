/**
 * College Mathematics layout pages (sort, sequence, explore, observe) of every course whose home
 * field is `math`, keyed by course topic (`<courseId>#<i>`, or `<courseId>#<i>~<slug>` for a
 * problem type), in taxonomy order. The calculators are in `../college/math.ts`. Data only.
 */
import type { LayoutDef } from './types';

export const COLLEGE_MATH_LAYOUTS: LayoutDef[] = [
  {
    // Calculus I → Limits and continuity: limits at infinity of a rational function.
    kind: 'sort',
    id: 'he.math.calc-1#0~end-behavior',
    title: 'Limits at infinity of a quotient',
    use: 'Use this for “Find the limit of (5x² − x) ÷ (2x² + 7) as x → ∞.”',
    assumptions: [
      'As x → ∞, only the highest power on top and on the bottom matters.',
      'Divide the top and the bottom by the highest power of x on the bottom; every term with x below then → 0.',
    ],
    question: 'Compare the highest powers on top and bottom.',
    bins: [
      {
        id: 'zero',
        label: 'Limit 0',
        why: 'The bottom’s highest power is larger, so the bottom grows faster and the quotient → 0.',
      },
      {
        id: 'ratio',
        label: 'Ratio of leading coefficients',
        why: 'The highest powers match, so the quotient → (leading coefficient on top) ÷ (leading coefficient below).',
      },
      {
        id: 'none',
        label: 'No finite limit',
        why: 'The top’s highest power is larger, so the quotient grows without bound (→ ∞ or −∞).',
      },
    ],
    cards: [
      { label: '(3x + 1) ÷ (x² − 4)', bin: 'zero' },
      { label: '7 ÷ (x + 1)', bin: 'zero' },
      { label: '(x² + 1) ÷ x⁵', bin: 'zero' },
      { label: '(5x² − x) ÷ (2x² + 7)', bin: 'ratio' },
      { label: '(6 − x) ÷ (3x + 9)', bin: 'ratio' },
      { label: '(4x³ − x) ÷ (8x³ + 1)', bin: 'ratio' },
      { label: '(x³ + 1) ÷ (4x − 2)', bin: 'none' },
      { label: '2x⁴ ÷ (x³ + x)', bin: 'none' },
    ],
  },
  {
    // Calculus I → Limits and continuity: the kinds of discontinuity.
    kind: 'sort',
    id: 'he.math.calc-1#0~discontinuities',
    title: 'Kinds of discontinuity',
    use: 'Use this for “Is the discontinuity of (x² − 4) ÷ (x − 2) at x = 2 removable?”',
    assumptions: [
      'Continuous at a: f(a) exists, the limit at a exists, and the two are equal.',
      'Removable: the limit exists but f(a) is missing or different. Jump: the one-sided limits differ.',
      'Infinite: f grows without bound near a (a vertical asymptote).',
    ],
    question: 'What happens to f near the point named?',
    bins: [
      {
        id: 'removable',
        label: 'Removable',
        why: 'The two one-sided limits agree, but f(a) is missing or different: one point can fix it.',
      },
      {
        id: 'jump',
        label: 'Jump',
        why: 'The limits from the left and from the right are finite but different.',
      },
      {
        id: 'infinite',
        label: 'Infinite',
        why: 'f grows without bound on at least one side: a vertical asymptote.',
      },
      {
        id: 'continuous',
        label: 'Continuous',
        why: 'f(a) exists and equals the limit there.',
      },
    ],
    cards: [
      { label: '(x² − 4) ÷ (x − 2) at x = 2', bin: 'removable' },
      { label: 'sin x ÷ x at x = 0', bin: 'removable' },
      { label: 'x + 1 for x < 1, and 3 for x ≥ 1, at x = 1', bin: 'jump' },
      { label: 'The floor ⌊x⌋ at x = 1', bin: 'jump' },
      { label: '1 ÷ (x − 3) at x = 3', bin: 'infinite' },
      { label: 'tan x at x = π ÷ 2', bin: 'infinite' },
      { label: '|x| at x = 0', bin: 'continuous' },
      { label: 'x² at x = 5', bin: 'continuous' },
    ],
  },
  {
    // Calculus I → Related rates and optimization: the steps of an optimization problem.
    kind: 'sequence',
    id: 'he.math.calc-1#2~steps',
    title: 'The steps of an optimization problem',
    use: 'Use this for “A closed can must hold 1000 cm³. What radius and height use the least metal?”',
    assumptions: [
      'Optimization finds where a quantity is largest or smallest, which is where its derivative is 0 or at an end.',
      'A constraint ties the variables together, so the quantity can be written with one variable.',
      'Check the answer is a maximum or a minimum: compare the ends, or use the sign of the second derivative.',
    ],
    question: 'Put the steps for the can of 1000 cm³ with the least metal in order.',
    stages: [
      {
        label: 'Draw it and name the quantities: radius r, height h, volume V = 1000 cm³, area A',
      },
      { label: 'Write the quantity to make smallest: A = 2πr² + 2πrh' },
      {
        label: 'Use the constraint πr²h = 1000 to leave one variable: A = 2πr² + 2000 ÷ r',
      },
      { label: 'Differentiate and set dA/dr = 4πr − 2000 ÷ r² to 0, so r³ = 500 ÷ π' },
      { label: 'Check the second derivative: 4π + 4000 ÷ r³ > 0, so this is a minimum' },
      { label: 'Answer with units: r ≈ 5.42 cm and h ≈ 10.84 cm, twice the radius' },
    ],
  },
];
