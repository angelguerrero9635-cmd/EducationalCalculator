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
  // Factoring: the number of the pair that multiplies to c (or a × c) and adds to b, the larger
  // one unless it is 0 (pairFor in math/9.ts).
  [
    new RegExp(`the number in the pair of (${NUM})(?: \\* (${NUM}))? that adds to (${NUM})`),
    (c1, c2, b) => {
      const c = Number.isNaN(c2) ? c1 : c1 * c2;
      const r = Math.sqrt(b * b - 4 * c);
      return (b + r) / 2 === 0 ? (b - r) / 2 : (b + r) / 2;
    },
  ],
  // Same base: the smallest base two numbers are powers of, and the power that makes one.
  [
    new RegExp(`the common base of (${NUM}) and (${NUM})`),
    (p, q) => {
      const power = (b: number, n: number) => {
        const k = Math.round(Math.log(n) / Math.log(b));
        return b ** k === n;
      };
      for (let b = 2; b <= Math.max(p, q); b++) if (power(b, p) && power(b, q)) return b;
      return NaN;
    },
  ],
  [
    new RegExp(`the power of (${NUM}) that makes (${NUM})`),
    (b, n) => Math.round(Math.log(n) / Math.log(b)),
  ],
  // Rational exponents: the fourth root and the fifth root of the base.
  [new RegExp(`∜(${NUM})`), (b) => b ** (1 / 4)],
  [new RegExp(`the fifth root of (${NUM})`), (b) => b ** (1 / 5)],
  // Whole-number answers to an inequality: at most rounds down, at least rounds up.
  [new RegExp(`(${NUM}) rounded down to a whole number`), (n) => Math.floor(n + 1e-9)],
  [new RegExp(`(${NUM}) rounded up to a whole number`), (n) => Math.ceil(n - 1e-9)],
  // Significant figures: a calculated product rounded to the fewer figures of its factors.
  [
    new RegExp(`(${NUM}) rounded to (${NUM}) significant figures?`),
    (x, n) => Number(x.toPrecision(Math.min(21, Math.max(1, Math.round(n))))),
  ],
];
