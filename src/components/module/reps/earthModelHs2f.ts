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

// ── Magnetic stripes on the seafloor ──

/**
 * The times Earth's field pointed as it does today (normal polarity), million years ago, to
 * 12 Ma, from the published geomagnetic polarity time scale (GTS2012, rounded to 0.01 Ma): the
 * Brunhes chron, the Jaramillo and Olduvai subchrons, the Gauss chron with its two reversed
 * breaks, the four Gilbert subchrons, then chrons 3A to 5r. Between them the field was reversed.
 */
export const NORMAL_CHRONS: [number, number][] = [
  [0, 0.78],
  [0.99, 1.07],
  [1.78, 1.95],
  [2.58, 3.03],
  [3.12, 3.21],
  [3.33, 3.6],
  [4.19, 4.3],
  [4.49, 4.63],
  [4.8, 4.9],
  [5.0, 5.24],
  [6.03, 6.25],
  [6.44, 6.73],
  [7.14, 7.21],
  [7.25, 7.29],
  [7.45, 7.49],
  [7.53, 7.64],
  [7.7, 8.11],
  [8.25, 8.3],
  [8.77, 9.11],
  [9.31, 9.43],
  [9.65, 9.72],
  [9.79, 9.94],
  [9.98, 11.06],
  [11.15, 11.19],
  [11.59, 11.66],
];

/** How far back the stripes are drawn, million years. */
export const STRIPE_RECORD = 12;

/** The field's polarity when rock of this age cooled at the ridge. */
export const polarityAt = (age: number): 'normal' | 'reversed' =>
  NORMAL_CHRONS.some(([a, b]) => age >= a && age < b) ? 'normal' : 'reversed';

/** The ages the stripe map spans either side of the ridge: at least 1.25 times the rock's. */
export function stripeWindow(age: number): number {
  const want = Math.max(1, age * 1.25);
  const nice = [1, 1.5, 2, 3, 4, 5, 6, 8, 10, STRIPE_RECORD];
  return nice.find((n) => n >= want) ?? STRIPE_RECORD;
}
