/**
 * The reaction energy profile's curve (H53), shared by the picture and its harness check: flat
 * at the reactants' level, a smooth hump to the peak at the middle of the reaction, flat again
 * at the products' level. Progress runs 0 to 1.
 */

const S = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : (1 - Math.cos(Math.PI * u)) / 2);

/** Where the hump starts and ends, and its top. */
export const RISE = 0.12;
export const FALL = 0.88;
export const PEAK = 0.5;

/** The energy at progress x for reactants at r, products at p and the peak at r + ea. */
export function profileAt(x: number, r: number, p: number, ea: number): number {
  const top = r + ea;
  return x <= PEAK
    ? r + ea * S((x - RISE) / (PEAK - RISE))
    : p + (top - p) * S((FALL - x) / (FALL - PEAK));
}

/** Why a profile can't be drawn (the peak under a level), or undefined when it can. */
export function profileProblem(r: number, p: number, ea: number): string | undefined {
  if (ea < 0) return 'An activation energy is never negative.';
  if (r + ea < p) return 'The peak must be at least as high as the products.';
  return undefined;
}
