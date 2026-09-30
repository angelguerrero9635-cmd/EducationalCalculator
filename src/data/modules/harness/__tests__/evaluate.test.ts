import { evaluate } from '../evaluate';

it('reads floor, gcd, mod, remainders and radians', () => {
  expect(evaluate('⌊23 ÷ 4⌋')).toBe(5);
  expect(evaluate('gcd(12, 18)')).toBe(6);
  expect(evaluate('23 mod 4')).toBe(3);
  expect(evaluate('the remainder of 23 ÷ 4')).toBe(3);
  expect(evaluate('sin(π/2)')).toBeCloseTo(1, 9);
  expect(evaluate('cos(3π/4)')).toBeCloseTo(-Math.SQRT1_2, 9);
});
