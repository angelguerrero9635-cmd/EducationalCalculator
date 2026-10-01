/**
 * The F distribution (H106): its density, right tail and critical value, for the `normalCurve`
 * `f` option and its harness check. Pure.
 */
import { betaI, lnGamma } from './statMath';

/** The F density with d1 and d2 degrees of freedom. */
export function fPdf(x: number, d1: number, d2: number): number {
  if (x <= 0) return d1 === 2 ? 1 : 0;
  const lnB = lnGamma(d1 / 2) + lnGamma(d2 / 2) - lnGamma((d1 + d2) / 2);
  return Math.exp(
    (d1 / 2) * Math.log(d1 / d2) +
      (d1 / 2 - 1) * Math.log(x) -
      ((d1 + d2) / 2) * Math.log(1 + (d1 * x) / d2) -
      lnB,
  );
}

/** P(F ≥ f): a calculator's Fcdf(f, ∞, d1, d2). */
export const fRight = (f: number, d1: number, d2: number) =>
  f <= 0 ? 1 : 1 - betaI((d1 * f) / (d1 * f + d2), d1 / 2, d2 / 2);

/** The f with P(F ≥ f) = tail. */
export function fQuantile(tail: number, d1: number, d2: number): number {
  let hi = 1;
  while (fRight(hi, d1, d2) > tail && hi < 1e6) hi *= 2;
  let lo = 0;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (fRight(mid, d1, d2) > tail) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * The p-value the picture shades: the right tail past F, or (two-sided) twice the smaller tail,
 * with the cuts each tail is shaded from.
 */
export function fTest(F: number, d1: number, d2: number, tails: 'right' | 'two') {
  const right = fRight(F, d1, d2);
  if (tails === 'right')
    return { p: right, cuts: { right: F } as { left?: number; right?: number } };
  const small = Math.min(right, 1 - right);
  const p = 2 * small;
  // The other tail holding the same area.
  const cuts =
    right <= 0.5
      ? { left: fQuantile(1 - right, d1, d2), right: F }
      : { left: F, right: fQuantile(1 - right, d1, d2) };
  return { p, cuts };
}
