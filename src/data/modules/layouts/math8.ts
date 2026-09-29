/**
 * Grade 8 math layout pages (sort, sequence, observe), by skill in taxonomy order.
 * The calculators are in `../math/8.ts`. Data only: no UI code.
 */
import type { LayoutDef } from './types';

export const MATH_8_LAYOUTS: LayoutDef[] = [
  // ── Roots and irrational numbers (8.NS.1) ──
  {
    kind: 'sort',
    id: 'm.8.roots-irrationals~rational-or-not',
    title: 'Rational or irrational?',
    use: 'Use this for “Which of these numbers are irrational: −13/3, 0.1234, √37, −√100?”',
    assumptions: [
      'A rational number is a fraction of whole numbers (or its opposite). Its decimal ends or repeats.',
      'The square root of a perfect square is whole, so it is rational: √100 = 10.',
      'The square root of any other whole number is irrational, and so is π.',
    ],
    question: 'Is the number rational or irrational?',
    bins: [
      {
        id: 'rational',
        label: 'Rational',
        why: 'It can be written as a fraction of whole numbers; its decimal ends or repeats.',
      },
      {
        id: 'irrational',
        label: 'Irrational',
        why: 'Its decimal never ends or repeats: a root that is not whole, or π.',
      },
    ],
    cards: [
      { label: '−13/3', bin: 'rational' },
      { label: '0.1234', bin: 'rational' },
      { label: '−77', bin: 'rational' },
      { label: '−√100', bin: 'rational' },
      { label: '0.333…', bin: 'rational' },
      { label: '∛27', bin: 'rational' },
      { label: '19/2', bin: 'rational' },
      { label: '√37', bin: 'irrational' },
      { label: '−√12', bin: 'irrational' },
      { label: 'π', bin: 'irrational' },
      { label: '√2', bin: 'irrational' },
      { label: '∛530', bin: 'irrational' },
    ],
  },

  // ── Exponent rules (8.EE.1) ──
  {
    kind: 'sort',
    id: 'm.8.exponent-rules~true-or-false',
    title: 'True or false?',
    use: 'Use this for “Is 2⁸ · 2⁹ = 2¹⁷ true?” or “Which equations are true?”',
    assumptions: [
      'Same base, multiplied: add the exponents. Divided: subtract them.',
      'A power of a power multiplies the exponents.',
      'Same exponent, different bases: multiply the bases (8² · 9² = 72²).',
      'b⁰ = 1, and b⁻ⁿ = 1 ÷ bⁿ.',
    ],
    question: 'Is the equation true?',
    bins: [
      { id: 'true', label: 'True', why: 'An exponent rule makes both sides equal.' },
      { id: 'false', label: 'False', why: 'The two sides are different numbers.' },
    ],
    cards: [
      { label: '2⁸ · 2⁹ = 2¹⁷', bin: 'true' },
      { label: '8² · 9² = 72²', bin: 'true' },
      { label: '(3²)⁵ = 3¹⁰', bin: 'true' },
      { label: '3⁻² = 1/9', bin: 'true' },
      { label: '10 · 10⁴ = 10⁵', bin: 'true' },
      { label: '8² · 9² = 72⁴', bin: 'false' },
      { label: '2⁸ · 2⁹ = 4¹⁷', bin: 'false' },
      { label: '2⁴ · 3² = 6⁶', bin: 'false' },
      { label: '10⁶ ÷ 10² = 10³', bin: 'false' },
      { label: '5⁰ = 0', bin: 'false' },
    ],
  },

  // ── Scientific notation (8.EE.3) ──
  {
    kind: 'sort',
    id: 'm.8.scientific-notation~names',
    title: 'Powers of ten by name',
    use: 'Use this for “Match 1,000,000 to one million and to a power of ten.”',
    assumptions: [
      'Each power of ten is ten times the one before: 10⁶ is 1 followed by 6 zeros.',
      'A negative power is one over the power: 10⁻³ = 1/1,000 = 0.001.',
    ],
    question: 'Which power of ten is it?',
    bins: [
      { id: '6', label: '10⁶', why: 'One million.' },
      { id: '9', label: '10⁹', why: 'One billion.' },
      { id: '-2', label: '10⁻²', why: 'One hundredth.' },
      { id: '-3', label: '10⁻³', why: 'One thousandth.' },
      { id: '-6', label: '10⁻⁶', why: 'One millionth.' },
    ],
    cards: [
      { label: '1,000,000', bin: '6' },
      { label: 'one million', bin: '6' },
      { label: '1,000,000,000', bin: '9' },
      { label: 'one billion', bin: '9' },
      { label: '0.01', bin: '-2' },
      { label: 'one hundredth', bin: '-2' },
      { label: '0.001', bin: '-3' },
      { label: 'one thousandth', bin: '-3' },
      { label: '0.000001', bin: '-6' },
      { label: 'one millionth', bin: '-6' },
    ],
  },
];
