/**
 * Grade 12 math layout pages (explore, sort, sequence, observe), by skill in taxonomy order.
 * The calculators are in `../math/12.ts`. Data only: no UI code.
 */
import type { LayoutDef } from './types';

export const MATH_12_LAYOUTS: LayoutDef[] = [
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
