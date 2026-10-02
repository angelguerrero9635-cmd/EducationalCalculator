import { lowerFirst } from '@/engine/format';
import { subscriptRuns } from '@/engine/subscripts';

import { signedSpan, spanSum } from '../layouts/sequenceMath';

describe('sequence spans (HE-E25)', () => {
  it('adds plain spans as before', () => {
    expect(spanSum([2, 3, 10])).toBe('2 + 3 + 10 = 15');
  });

  it('writes signed spans with their signs and a signed net', () => {
    // ATP per glycolysis step: −1, 0, −1, 0, 0, 0, +2, 0, 0, +2 → net +2.
    expect(spanSum([-1, 0, -1, 0, 0, 0, 2, 0, 0, 2], true)).toBe(
      '−1 + 0 − 1 + 0 + 0 + 0 + 2 + 0 + 0 + 2 = +2',
    );
    expect(spanSum([2, -3], true)).toBe('+2 − 3 = −1');
    expect(spanSum([0], true)).toBe('0 = 0');
    expect(signedSpan(2)).toBe('+2');
    expect(signedSpan(-1)).toBe('−1');
    expect(signedSpan(0)).toBe('0');
  });
});

describe('chemistry text on cards and stages (HE-E25)', () => {
  it('keeps formulas, charges and stereodescriptors whole', () => {
    // Unicode subscripts and charges are text; an underscore subscript is drawn lowered.
    expect(subscriptRuns('Fe³⁺ + e⁻ ⇌ Fe²⁺')).toEqual([{ s: 'Fe³⁺ + e⁻ ⇌ Fe²⁺' }]);
    expect(subscriptRuns('(2R,3S)-2,3-dibromobutane')).toEqual([
      { s: '(2R,3S)-2,3-dibromobutane' },
    ]);
    expect(subscriptRuns('pK_a of CH₃COOH')).toEqual([{ s: 'pKₐ of CH₃COOH' }]);
  });

  it('a stage named inside a hint keeps the capitals that mean something', () => {
    expect(lowerFirst('Pyruvate enters the mitochondrion and gives off CO₂')).toBe(
      'pyruvate enters the mitochondrion and gives off CO₂',
    );
    expect(lowerFirst('NADH is oxidized')).toBe('NADH is oxidized');
    expect(lowerFirst('Fe³⁺ is reduced')).toBe('Fe³⁺ is reduced');
    expect(lowerFirst('Prophase I')).toBe('prophase I');
  });
});
