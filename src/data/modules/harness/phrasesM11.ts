/**
 * Step-text phrases for the Grade 11 math pages, spread into PHRASES (`evaluate.ts`). By the
 * time they run, × is *, − is -, superscripts are powers and a bracket around one number is
 * gone. Test-only.
 */
import { choose } from '@/components/module/reps/statMath';

/** The greatest common factor of two whole numbers. */
const gcdOf = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcdOf(b, a % b));

/** A bare number, as `evaluate` leaves one by the time phrases run. */
const NUM = String.raw`-?\d+(?:\.\d+)?(?:e[-+]?\d+)?`;

export const M11_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  // The 68–95–99.7 rule: the percent within 1, 2 or 3 standard deviations of the mean.
  [
    new RegExp(`share within (${NUM}) standard deviations`),
    (k) => ({ 1: 68, 2: 95, 3: 99.7 })[k] ?? NaN,
  ],
  // Pascal's rule: the entries above, C(n − 1, k − 1) and C(n − 1, k).
  [
    new RegExp(`C\\((${NUM}) - (${NUM}), (${NUM}) - (${NUM})\\)`),
    (n, a, k, b) => choose(n - a, k - b),
  ],
  [new RegExp(`C\\((${NUM}) - (${NUM}), (${NUM})\\)`), (n, a, k) => choose(n - a, k)],
  // Powers of i read from the cycle i⁰ = 1, i¹ = i, i² = −1, i³ = −i.
  [new RegExp(`imaginary part of i\\*\\*\\s*\\(?(${NUM})\\)?`), (r) => [0, 1, 0, -1][r] ?? NaN],
  [new RegExp(`real part of i\\*\\*\\s*\\(?(${NUM})\\)?`), (r) => [1, 0, -1, 0][r] ?? NaN],
  // The greatest common factor as a class writes it: GCF(225, 180).
  [new RegExp(`GCF\\((${NUM}),\\s*(${NUM})\\)`), (a, b) => gcdOf(a, b)],
];
