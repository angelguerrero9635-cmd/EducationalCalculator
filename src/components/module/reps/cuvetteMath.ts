/** Numbers for `beaker` with `cuvette` (HC112): the absorbance drawn and the beam's width. */

/** Pixels per cm of path, and the longest path drawn to scale. */
export const CUVETTE_PX = 56;
export const CUVETTE_MAX = 2.5;

/** The absorbance a cuvette draws: A, or −log(%T ÷ 100), or εbc. */
export function cuvetteAbsorbance(
  A: number | undefined,
  T: number | undefined,
  eps: number | undefined,
  b: number | undefined,
  c: number | undefined,
): number | undefined {
  if (A !== undefined) return A;
  if (T !== undefined && T > 0) return -Math.log10(T / 100);
  if (eps !== undefined && b !== undefined && c !== undefined) return eps * b * c;
  return undefined;
}

/** The beam's half-width at fraction t (0 to 1) of the way through the solution. */
export const beamHalf = (w0: number, A: number, t: number) => w0 * 10 ** (-A * t);
