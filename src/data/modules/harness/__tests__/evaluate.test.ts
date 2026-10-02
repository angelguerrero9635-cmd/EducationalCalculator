import { evaluate, expandSums, shownClose } from '../evaluate';

it('reads floor, gcd, mod, remainders and radians', () => {
  expect(evaluate('⌊23 ÷ 4⌋')).toBe(5);
  expect(evaluate('gcd(12, 18)')).toBe(6);
  expect(evaluate('23 mod 4')).toBe(3);
  expect(evaluate('the remainder of 23 ÷ 4')).toBe(3);
  expect(evaluate('sin(π/2)')).toBeCloseTo(1, 9);
  expect(evaluate('cos(3π/4)')).toBeCloseTo(-Math.SQRT1_2, 9);
});

it('raises a fraction’s bottom before dividing', () => {
  expect(evaluate('12/2²')).toBe(3);
  expect(evaluate('3/4^2')).toBe(0.1875);
  expect(evaluate('3/4')).toBe(0.75);
  expect(evaluate('100 × e^(−0.5 × 6)')).toBeCloseTo(4.9787, 3);
});

it('reads a fourth root of a number or a bracket', () => {
  expect(evaluate('278 × ∜0.25 ÷ √0.5')).toBeCloseTo(278, 9);
  expect(evaluate('5772 × ∜(16 ÷ 4)')).toBeCloseTo(5772 * Math.SQRT2, 6);
});

it('reads a root written exactly (E22)', () => {
  expect(evaluate('√3/2')).toBeCloseTo(Math.sqrt(3) / 2, 12);
  expect(evaluate('−√911/24')).toBeCloseTo(-Math.sqrt(911) / 24, 12);
  expect(evaluate('3√2')).toBeCloseTo(3 * Math.SQRT2, 12);
  expect(evaluate('−(√6 + √2)/4')).toBeCloseTo(-(Math.sqrt(6) + Math.SQRT2) / 4, 12);
  expect(evaluate('(√6 − √2)/4 ÷ ((√6 + √2)/4)')).toBeCloseTo(2 - Math.sqrt(3), 12);
});

it('adds a sum with its limits term by term, so a wrong sum fails (E5)', () => {
  expect(evaluate('Σ from k = 1 to 8 of (3k − 1)')).toBe(100);
  expect(evaluate('Σ from k = 1 to 8 of (3k + (-1))')).toBe(100);
  expect(evaluate('Σ from k = 0 to 4 of 2^k')).toBe(31);
  expect(evaluate('Σ from i = 1 to 3 of (i − 2)²')).toBe(2);
  expect(evaluate('2 × Σ from k = -1 to 1 of k² + 1')).toBe(5);
  expect(expandSums('Σ from k = 1 to 8 of (3k − 1) = 100')).toBe('(100) = 100');
  expect(expandSums('Σ from k = 1 to 8 of (3k − 1) = 99')).toBe('(100) = 99');
  // Limits that are not whole numbers in order leave the sum unread.
  expect(evaluate('Σ from k = 1.5 to 8 of k')).toBeUndefined();
  expect(evaluate('Σ from k = 8 to 1 of k')).toBeUndefined();
});

it('compares tiny values relative to their size, down to 10⁻³⁵ (HE-E10)', () => {
  expect(shownClose(1.616e-35, 1.6162e-35)).toBe(true);
  expect(shownClose(1.6e-35, 3.2e-35)).toBe(false);
  expect(shownClose(6.626e-34, 6.63e-34)).toBe(true);
  expect(shownClose(1.8e-5, 1.9e-5)).toBe(false);
  // Zero against rounding dust, and values from 10⁻⁴ up, keep the old tolerance.
  expect(shownClose(0, 1e-17)).toBe(true);
  expect(shownClose(0.0005, 0.0006)).toBe(true);
  expect(shownClose(1.5e37, 1.5004e37)).toBe(true);
  expect(shownClose(1.5e37, 1.6e37)).toBe(false);
  expect(evaluate('6.626 × 10⁻³⁴ × 3 × 10⁸ ÷ (5 × 10⁻⁷)')).toBeCloseTo(3.9756e-19, 30);
  expect(evaluate('1.5 × 10³⁷ ÷ 10³⁰')).toBeCloseTo(1.5e7, 0);
});
