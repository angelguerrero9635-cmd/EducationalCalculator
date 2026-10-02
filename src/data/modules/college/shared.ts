/**
 * Relation helpers the college field files share (`college/<field>.ts`). K–12 helpers
 * (`div`, `whole`, …) are in `../helpers.ts`.
 */

/**
 * √x for a quantity computed as a sum of terms of size `scale`: a tiny negative from rounding
 * (a double root, e.g. an object that just stops) counts as 0 instead of no answer.
 */
export const rootOf = (x: number, scale: number) => (x < 0 && x > -1e-5 * scale ? 0 : Math.sqrt(x));

/** Both signs of a square root (one value when it is 0). */
export const plusMinus = (x: number) => (x === 0 ? [0] : [x, -x]);

/**
 * Real k-th roots of v (k a positive whole number). Even k: ±root, or NaN when v < 0 so the
 * solver reports the impossibility instead of leaving the value blank.
 */
export const realRoots = (v: number, k: number): number[] | undefined => {
  if (!Number.isInteger(k) || k < 1 || !Number.isFinite(v)) return undefined;
  if (k % 2 === 1) return [Math.sign(v) * Math.abs(v) ** (1 / k)];
  return v < 0 ? [NaN] : plusMinus(v ** (1 / k));
};

/** d/dx of c·xⁿ = n·c·xⁿ⁻¹ (0 when n = 0, avoiding 0⁻¹). */
export const powerRule = (c: number, n: number, x: number) => (n === 0 ? 0 : n * c * x ** (n - 1));
