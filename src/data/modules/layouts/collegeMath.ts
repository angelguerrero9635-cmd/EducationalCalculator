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
];
