/**
 * The science behind the group F round 2 earth and space pictures (H103), shared by the
 * pictures and their harness checks so both use the same numbers.
 */
import { HR_WINDOW, mainSequenceL } from './earthModel';

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

/** How far back the stripes are drawn, million years (the end of `NORMAL_CHRONS`). */
export const CHRON_RECORD = 12;

/**
 * How far back the map reaches, million years: the oldest seafloor is about 180 million years
 * old. Past `CHRON_RECORD` the seafloor is drawn hatched, its stripes not drawn.
 */
export const STRIPE_RECORD = 200;

/** The field's polarity when rock of this age cooled at the ridge. */
export const polarityAt = (age: number): 'normal' | 'reversed' =>
  NORMAL_CHRONS.some(([a, b]) => age >= a && age < b) ? 'normal' : 'reversed';

/** The ages the stripe map spans either side of the ridge: at least 1.25 times the rock's. */
export function stripeWindow(age: number): number {
  const want = Math.max(1, age * 1.25);
  const nice = [1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 30, 40, 50, 60, 80, 100, 150, 200];
  return nice.find((n) => n >= want) ?? STRIPE_RECORD;
}

// ── A rising parcel of air ──

/** Unsaturated air cools 10 °C per km as it rises; its dew point falls 2 °C per km. */
export const DRY_LAPSE = 10;
export const DEW_LAPSE = 2;
/** Saturated air cools more slowly, about 6 °C per km, as condensing vapor releases heat. */
export const MOIST_LAPSE = 6;

/** The cloud base, km: where the parcel's temperature meets its dew point. */
export const cloudBase = (t: number, td: number) => (t - td) / (DRY_LAPSE - DEW_LAPSE);

/** The parcel's temperature at altitude z km: dry to the cloud base, then saturated. */
export function parcelTempAt(z: number, t: number, td: number): number {
  const h = Math.max(0, cloudBase(t, td));
  return z <= h ? t - DRY_LAPSE * z : t - DRY_LAPSE * h - MOIST_LAPSE * (z - h);
}

/** Its dew point at z: falling 2 °C per km to the base, then equal to the temperature. */
export function parcelDewAt(z: number, t: number, td: number): number {
  const h = Math.max(0, cloudBase(t, td));
  return z <= h ? td - DEW_LAPSE * z : parcelTempAt(z, t, td);
}

// ── Earth's energy balance ──

/** The Stefan–Boltzmann constant, W/m² per K⁴. */
export const SIGMA = 5.67e-8;

/** Sunlight at the top of Earth's atmosphere, W/m² (the solar constant). */
export const SOLAR_CONSTANT = 1361;

/** Sunlight absorbed per square metre of the globe: S(1 − α) ÷ 4 (a sphere has 4 × its disk). */
export const absorbedOf = (s: number, albedo: number) => (s * (1 - albedo)) / 4;

/** The temperature that sends F back out as infrared: σT⁴ = F. */
export const balanceTemp = (f: number) => (Math.max(0, f) / SIGMA) ** 0.25;

// ── A star's mass on the main sequence ──

/** Main-sequence luminosity (L☉) by mass (M☉): L = M^3.5. */
export const massLuminosity = (m: number) => m ** 3.5;

/** Main-sequence lifetime (years) by mass: the Sun's 10¹⁰ years × M^−2.5 (fuel M over rate L). */
export const massLifetime = (m: number) => 1e10 * m ** -2.5;

/** The masses marked along the main sequence, M☉. */
export const MASS_MARKS = [3, 10, 30];

/** The masses whose L = M^3.5 stays on the diagram (1e-4 to 1e6 L☉). */
export const MASS_RANGE = { min: 0.08, max: 50 };

/**
 * The temperature (K) where the drawn main sequence reaches luminosity l, by bisection on
 * `mainSequenceL` (which rises with temperature), within the diagram's window.
 */
export function mainSequenceT(l: number): number {
  let lo = Math.log10(HR_WINDOW.tCool);
  let hi = Math.log10(HR_WINDOW.tHot);
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (mainSequenceL(10 ** mid) < l) lo = mid;
    else hi = mid;
  }
  return 10 ** ((lo + hi) / 2);
}
