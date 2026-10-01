import { evaluate } from '../evaluate';

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
