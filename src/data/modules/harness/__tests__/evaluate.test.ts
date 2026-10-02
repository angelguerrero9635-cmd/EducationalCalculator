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

describe('college phrases (HE-E8)', () => {
  it('reads logs: log alone is base 10, log₂, and a log of one number without its bracket', () => {
    expect(evaluate('20 log(1000)')).toBeCloseTo(60, 9);
    expect(evaluate('10 × log₁₀(2)')).toBeCloseTo(3.0103, 4);
    expect(evaluate('log₂(256)')).toBeCloseTo(8, 12);
    expect(evaluate('log₂ 16 + 1')).toBeCloseTo(5, 12);
    // A log of a number in scientific notation takes the whole number (HE-E18).
    expect(evaluate('log₁₀ 6.1394 × 10⁸ ÷ log₁₀ 2.5')).toBeCloseTo(
      Math.log10(6.1394e8) / Math.log10(2.5),
      9,
    );
    expect(evaluate('ln 2 × 10³')).toBeCloseTo(Math.log(2) * 1000, 9);
    expect(evaluate('ln 2 ÷ 0.05')).toBeCloseTo(13.8629, 4);
    expect(evaluate('log 1000')).toBeCloseTo(3, 12);
    expect(evaluate('2 sin(30°)')).toBeCloseTo(1, 12);
  });

  it('reads decibels and dBm', () => {
    expect(evaluate('26.0 dB + 34.0 dB')).toBeCloseTo(60, 9);
    expect(evaluate('20 dB as a voltage ratio')).toBeCloseTo(10, 9);
    expect(evaluate('3.0103 dB as a power ratio')).toBeCloseTo(2, 4);
    expect(evaluate('30 dBm in W')).toBeCloseTo(1, 9);
    expect(evaluate('30 dBm + 3 dBi + 3 dBi − 100.0 dB')).toBeCloseTo(-64, 9);
    expect(evaluate('100 mW in dBm')).toBeCloseTo(20, 9);
  });

  it('reads phasors (∠ and j), floor, ceiling and mod', () => {
    expect(evaluate('10∠36.87°')).toBe(10);
    expect(evaluate('the real part of 10∠36.87°')).toBeCloseTo(8, 3);
    expect(evaluate('the imaginary part of 10∠36.87°')).toBeCloseTo(6, 3);
    expect(evaluate('|8 + j6|')).toBeCloseTo(10, 12);
    expect(evaluate('|40 − j30|')).toBeCloseTo(50, 12);
    expect(evaluate('the angle of (8 + j6)')).toBeCloseTo(36.8699, 4);
    expect(evaluate('the angle of (8 − j6)')).toBeCloseTo(-36.8699, 4);
    expect(evaluate('⌈1000 ÷ 64⌉')).toBe(16);
    expect(evaluate('⌊log₂(1000)⌋')).toBe(9);
    expect(evaluate('(17 + 9) mod 12')).toBe(2);
    expect(evaluate('max(3 − 1, 4) + min(2, 5)')).toBe(6);
  });

  it('reads double factorials, fractional powers and powers of ten', () => {
    expect(evaluate('(2 × 4 − 3)!!')).toBe(15);
    expect(evaluate('7!!')).toBe(105);
    expect(evaluate('6!!')).toBe(48);
    expect(evaluate('5!')).toBe(120);
    expect(evaluate('64^0.75')).toBeCloseTo(22.6274, 4);
    expect(evaluate('10^(−6 ÷ 2)')).toBeCloseTo(0.001, 12);
    expect(evaluate('300 × (800 ÷ 100)^((1.4 − 1)/1.4)')).toBeCloseTo(543.4, 1);
  });

  it('works out an integral with its limits at the page’s values (∫ results as values)', () => {
    expect(evaluate('∫ from 1 to 3 of (x² + 1) dx')).toBeCloseTo(32 / 3, 9);
    expect(evaluate('∫ from 1 to 4 of 3x dx')).toBeCloseTo(22.5, 9);
    expect(evaluate('∫ from 0.001 to 0.002 of (8.314 × 300 ÷ V) dV')).toBeCloseTo(
      8.314 * 300 * Math.log(2),
      6,
    );
    // The d and its variable over a bracket, and a root at an end.
    expect(evaluate('∫ from 0 to 0.5 of dX ÷ (0.2 × (1 − X))')).toBeCloseTo(
      -Math.log(0.5) / 0.2,
      6,
    );
    expect(evaluate('∫ from 0 to 1 of √x dx')).toBeCloseTo(2 / 3, 3);
    expect(evaluate('2 × ∫ from 0 to π of sin(t) dt')).toBeCloseTo(4, 9);
    // An integral said equal to a wrong number is caught; one with a letter left is unread.
    expect(evaluate('∫ from 0 to 2 of (x² + 1) dx')).not.toBeCloseTo(10, 3);
    expect(evaluate('∫ from a to 2 of x dx')).toBeUndefined();
  });

  it('reads sign conventions and label words', () => {
    expect(evaluate('12.5 kN tension')).toBe(12.5);
    expect(evaluate('12.5 kN compression')).toBe(-12.5);
    expect(evaluate('(3 × 4) in compression')).toBe(-12);
    expect(evaluate('40 kN·m sagging')).toBe(40);
    expect(evaluate('40 kN·m hogging')).toBe(-40);
    // (the net heat adds them: a heat out is negative)
    expect(evaluate('500 kJ heat in + 200 kJ heat out')).toBe(300);
    expect(evaluate('0.0215 (found numerically)')).toBe(0.0215);
    expect(evaluate('0.0215, by trial')).toBe(0.0215);
    expect(evaluate('(300 + 350) ÷ 2 (film temperature)')).toBe(325);
    expect(evaluate('LMTD(60, 20)')).toBeCloseTo(40 / Math.log(3), 12);
    expect(evaluate('the LMTD of 30 and 30')).toBe(30);
    expect(evaluate('ln 2 ÷ 0.1, for a first-order reaction')).toBeCloseTo(6.9315, 4);
  });

  it('keeps a name’s e with a prime or a bar a name, never Euler’s number', () => {
    expect(evaluate('e′ + 1')).toBeUndefined();
    expect(evaluate('e + 1')).toBeCloseTo(Math.E + 1, 12);
    // An ordered pair is not a number.
    expect(evaluate('(3, 4)')).toBeUndefined();
  });
});
