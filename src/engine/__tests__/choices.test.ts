import { codeLabel, nextCode } from '../choices';
import type { VariableDef } from '../types';

describe('coded values in words', () => {
  const side: Pick<VariableDef, 'labels' | 'allowed'> = {
    allowed: [0, 1, -1],
    labels: { 0: 'β ≠ 0', 1: 'β > 0', [-1]: 'β < 0' },
  };

  it('names what a code means', () => {
    expect(codeLabel(side, 0)).toBe('β ≠ 0');
    expect(codeLabel(side, -1)).toBe('β < 0');
    expect(codeLabel(side, 2)).toBeUndefined();
    expect(codeLabel(side, undefined)).toBeUndefined();
    expect(codeLabel({}, 0)).toBeUndefined();
  });

  it('taps through the codes in their order, round', () => {
    expect(nextCode(side, undefined)).toBe(0);
    expect(nextCode(side, 0)).toBe(1);
    expect(nextCode(side, 1)).toBe(-1);
    expect(nextCode(side, -1)).toBe(0);
    expect(nextCode({ labels: { 0: 'σ₁² ≠ σ₂²', 1: 'σ₁² > σ₂²' } }, 1)).toBe(0);
  });
});
