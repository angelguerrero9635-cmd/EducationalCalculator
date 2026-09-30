/**
 * Step-text phrases for the Grades 9–12 statistics and counting pages of group HB, spread into
 * PHRASES (`evaluate.ts`). By the time they run, × is *, − is -, superscripts are powers and a
 * bracket around one number is gone: "Φ(1.75)" reads "Φ 1.75". Test-only.
 */
import { chiCdf, chiCritical, choose, invPhi, Phi } from '@/components/module/reps/statMath';

/**
 * A bare number, as `evaluate` leaves one by the time phrases run (brackets round one number are
 * gone). Unlike its NUM, it never takes a closing bracket with it.
 */
const NUM = String.raw`-?\d+(?:\.\d+)?(?:e[-+]?\d+)?(?: \* 10\*\* ?\(?-?\d+\)?)?`;

const fact = (n: number) => {
  let out = 1;
  for (let i = 2; i <= n; i++) out *= i;
  return out;
};

export const HSB_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  // The standard normal CDF, Φ(z); a two-sided tail uses Φ(|z|); its inverse is invNorm(p).
  [new RegExp(`Φ\\(abs\\((${NUM})\\)\\)`), (z) => Phi(Math.abs(z))],
  [new RegExp(`Φ ?(${NUM})`), (z) => Phi(z)],
  [new RegExp(`invNorm ?(${NUM})`), (p) => invPhi(p)],
  // A chi-square right tail, χ²cdf(x, ∞, df), and its inverse, the χ² with that tail.
  [new RegExp(`χ\\*\\* ?\\(?2\\)? ?cdf\\((${NUM}), ∞, (${NUM})\\)`), (x, k) => 1 - chiCdf(x, k)],
  [
    new RegExp(`the χ\\*\\* ?\\(?2\\)? with right tail (${NUM}) at (${NUM}) df`),
    (p, k) => chiCritical(p, k),
  ],
  // Counting: C(n, k), P(n, k) and n!.
  [new RegExp(`C\\((${NUM}), (${NUM})\\)`), (n, k) => choose(n, k)],
  [new RegExp(`P\\((${NUM}), (${NUM})\\)`), (n, k) => fact(n) / fact(n - k)],
  [new RegExp(`(\\d+) ?!`), (n) => fact(n)],
];
