/**
 * Step-text phrases for the Grade 9 math pages, spread into PHRASES (`evaluate.ts`). By the
 * time they run, × is *, − is -, superscripts are powers and a bracket around one number is
 * gone. Test-only.
 */

/** A bare number, as `evaluate` leaves one by the time phrases run. */
const NUM = String.raw`-?\d+(?:\.\d+)?(?:e[-+]?\d+)?`;

export const M9_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  // Domain and range of a line: the least and greatest output are at the ends.
  [new RegExp(`the smaller of (${NUM}) and (${NUM})`), (a, b) => Math.min(a, b)],
  [new RegExp(`the larger of (${NUM}) and (${NUM})`), (a, b) => Math.max(a, b)],
  // Elimination: the least common multiple of the y coefficients' sizes.
  [
    new RegExp(`least common multiple of (${NUM}) and (${NUM})`),
    (a, b) => {
      const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
      const [x, y] = [Math.abs(a), Math.abs(b)];
      return (x * y) / gcd(x, y);
    },
  ],
  // Rational exponents: the fourth root and the fifth root of the base.
  [new RegExp(`∜(${NUM})`), (b) => b ** (1 / 4)],
  [new RegExp(`the fifth root of (${NUM})`), (b) => b ** (1 / 5)],
  // Whole-number answers to an inequality: at most rounds down, at least rounds up.
  [new RegExp(`(${NUM}) rounded down to a whole number`), (n) => Math.floor(n + 1e-9)],
  [new RegExp(`(${NUM}) rounded up to a whole number`), (n) => Math.ceil(n - 1e-9)],
];
