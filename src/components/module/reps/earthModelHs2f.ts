/**
 * The science behind the group F round 2 earth and space pictures (H103), shared by the
 * pictures and their harness checks so both use the same numbers.
 */

// ── Earthquake magnitude ──

/** Each whole step of magnitude is 10 times the ground motion (amplitude). */
export const amplitudeRatio = (m1: number, m2: number) => 10 ** (m2 - m1);

/** … and about 10^1.5 ≈ 32 times the energy. */
export const energyRatio = (m1: number, m2: number) => 10 ** (1.5 * (m2 - m1));

/** The magnitudes the scale draws. */
export const MAGNITUDE_RANGE = { min: 0, max: 10 };

/**
 * The window of the magnitude scale: whole magnitudes from one below the smaller to one above
 * the larger, at least 4 steps wide, within 0–10.
 */
export function magnitudeWindow(a: number, b: number): [number, number] {
  let lo = Math.max(MAGNITUDE_RANGE.min, Math.floor(Math.min(a, b)) - 1);
  let hi = Math.min(MAGNITUDE_RANGE.max, Math.ceil(Math.max(a, b)) + 1);
  while (hi - lo < 4) {
    if (lo > MAGNITUDE_RANGE.min) lo -= 1;
    else if (hi < MAGNITUDE_RANGE.max) hi += 1;
    else break;
  }
  return [lo, hi];
}
