/**
 * HC79 (round 3, group G): the rules behind `membrane` `potential` and `psi`, shared by the
 * picture and its harness check.
 */

/** Charges a side draws: one per 10 mV of |V|, at most 8. */
export const chargesFor = (mV: number) => Math.min(8, Math.round(Math.abs(mV) / 10));

/** Which face carries + charges: the outside when the inside is negative. */
export const positiveFace = (mV: number): 'outside' | 'inside' | undefined =>
  mV < 0 ? 'outside' : mV > 0 ? 'inside' : undefined;

/** Ion dots: every concentration on one scale, so the busier side draws `max` dots. */
export function ionDots(
  ions: { outside: number; inside: number }[],
  max = 40,
): { per: number; outside: number[]; inside: number[] } {
  const sumOut = ions.reduce((a, i) => a + Math.max(0, i.outside), 0);
  const sumIn = ions.reduce((a, i) => a + Math.max(0, i.inside), 0);
  const per = Math.max(sumOut, sumIn) / max || 1;
  const count = (x: number) => (x > 0 ? Math.max(1, Math.round(x / per)) : 0);
  const outside = ions.map((i) => count(i.outside));
  const inside = ions.map((i) => count(i.inside));
  // Rounding up the small ones can pass the cap: take the excess off the biggest.
  for (const side of [outside, inside])
    while (side.reduce((a, b) => a + b, 0) > max) side[side.indexOf(Math.max(...side))]!--;
  return { per, outside, inside };
}

/** Solute dots for a solute potential Ψₛ (MPa): one per 0.025 MPa, at most 40. */
export const soluteDots = (psiS: number) => Math.min(40, Math.round(Math.abs(psiS) / 0.025));

/** Water moves toward the lower Ψ: into the cell, out of it, or both ways when equal. */
export function waterFlow(outside: number, inside: number): 'in' | 'out' | 'both' {
  if (Math.abs(outside - inside) < 1e-9) return 'both';
  return inside < outside ? 'in' : 'out';
}
