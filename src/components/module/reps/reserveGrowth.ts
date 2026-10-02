/**
 * The reserve's arithmetic when use grows steadily by g% a year (`reserve` with `growth`, H115):
 * use after t years is r × eᵏᵗ with k = g ÷ 100, so the use up to year t adds to
 * r × (eᵏᵗ − 1) ÷ k, and a reserve Q runs out after T = ln(1 + kQ ÷ r) ÷ k years.
 */

/** The use up to year t (in the reserve's unit). */
export function usedBy(r: number, g: number, t: number): number {
  const k = g / 100;
  return k === 0 ? r * t : (r * Math.expm1(k * t)) / k;
}

/** The years a reserve q lasts when use starts at r and grows by g% a year. */
export function growthLifetime(q: number, r: number, g: number): number {
  const k = g / 100;
  return k === 0 ? q / r : Math.log1p((k * q) / r) / k;
}
