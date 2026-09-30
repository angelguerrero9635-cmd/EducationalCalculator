/**
 * Grade 12 math layout pages (explore, sort, sequence, observe), by skill in taxonomy order.
 * The calculators are in `../math/12.ts`. Data only: no UI code.
 */
import type { LayoutDef } from './types';

export const MATH_12_LAYOUTS: LayoutDef[] = [
  // ── Conic sections (G-GPE.3) ──
  {
    kind: 'sort',
    id: 'm.12.conics~identify',
    title: 'Which conic is it?',
    use: 'Use this for “Which conic is 4x² − 9y² = 36?”',
    assumptions: [
      'Compare the x² and y² terms once they are on one side.',
      'Same coefficient and same sign: a circle. Different coefficients, same sign: an ellipse.',
      'Opposite signs: a hyperbola. Only one of x and y squared: a parabola.',
    ],
    question:
      'Compare the x² and y² terms: same coefficient, same sign, opposite signs, or only one squared?',
    bins: [
      {
        id: 'circle',
        label: 'Circle',
        why: 'x² and y² have the same coefficient and the same sign.',
      },
      {
        id: 'ellipse',
        label: 'Ellipse',
        why: 'x² and y² have the same sign but different coefficients.',
      },
      { id: 'parabola', label: 'Parabola', why: 'Only one of x and y is squared.' },
      { id: 'hyperbola', label: 'Hyperbola', why: 'x² and y² have opposite signs.' },
    ],
    cards: [
      { label: 'x² + y² = 16', bin: 'circle' },
      { label: 'x² + y² − 6x = 0', bin: 'circle' },
      { label: '4x² + 9y² = 36', bin: 'ellipse' },
      { label: '(x − 1)² + 4(y + 2)² = 16', bin: 'ellipse' },
      { label: 'y = 2x² − 3', bin: 'parabola' },
      { label: 'y² = 8x', bin: 'parabola' },
      { label: 'x² − y² = 9', bin: 'hyperbola' },
      { label: '9y² − 4x² = 36', bin: 'hyperbola' },
    ],
  },
  {
    kind: 'explore',
    id: 'm.12.conics~cone',
    title: 'Conics as slices of a cone',
    use: 'Use this for “Why are circles, ellipses, parabolas and hyperbolas called conic sections?”',
    assumptions: [
      'Two cones meet tip to tip, and a flat plane cuts through them.',
      'The plane’s tilt against the cone’s side decides which curve the cut makes.',
    ],
    figure: { kind: 'doubleCone' },
    scenes: [
      {
        label: 'Circle',
        cone: 'circle',
        lines: ['A plane square to the cone’s axis cuts a circle.'],
      },
      {
        label: 'Ellipse',
        cone: 'ellipse',
        lines: [
          'Tilt the plane, less steep than the side: it cuts one cone all the way round, an ellipse.',
        ],
      },
      {
        label: 'Parabola',
        cone: 'parabola',
        lines: ['Tilt it exactly as steep as the side: the cut never closes, a parabola.'],
      },
      {
        label: 'Hyperbola',
        cone: 'hyperbola',
        lines: ['Steeper still, the plane cuts both cones: the two branches of a hyperbola.'],
      },
    ],
  },

  // ── Hypothesis tests (S-IC.5) ──
  {
    kind: 'sort',
    id: 'm.12.hypothesis-testing~errors',
    title: 'Type I or Type II error?',
    use: 'Use this for “Name a Type I and a Type II error for this test.”',
    assumptions: [
      'A Type I error rejects a true H₀; a Type II error keeps a false one.',
      'A test only ever rejects H₀ or fails to reject it; the truth about H₀ is unknown.',
      'The chance of a Type I error is α, the significance level chosen before the test.',
    ],
    question: 'Which kind of decision is it?',
    bins: [
      { id: 'one', label: 'Type I error', why: 'H₀ was true, but the test rejected it.' },
      { id: 'two', label: 'Type II error', why: 'H₀ was false, but the test kept it.' },
      {
        id: 'right',
        label: 'Correct decision',
        why: 'The test rejected a false H₀ or kept a true one.',
      },
    ],
    cards: [
      { label: 'Reject H₀ when H₀ is true', bin: 'one' },
      { label: 'Fail to reject H₀ when H₀ is false', bin: 'two' },
      { label: 'Reject H₀ when H₀ is false', bin: 'right' },
      { label: 'Fail to reject H₀ when H₀ is true', bin: 'right' },
      { label: 'H₀: the coin is fair; a fair coin is called unfair', bin: 'one' },
      {
        label: 'H₀: the medicine does nothing; a medicine that works is judged useless',
        bin: 'two',
      },
      { label: 'H₀: the batch is fine; a fine batch is thrown out', bin: 'one' },
      { label: 'H₀: the batch is fine; a bad batch is thrown out', bin: 'right' },
    ],
  },
];
