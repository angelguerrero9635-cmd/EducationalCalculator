/**
 * The science behind the group H3C pictures (earth and space round 3, H110), shared by the
 * drawings and the harness checks (`harness/picturesHs3c.ts`) so both use one model.
 */

/** Earth's age in million years: midnight at the start of the geologic day. */
export const EARTH_AGE_MY = 4600;

/** The clock time (hours, 0 to 24) of an event `ago` million years back on a day of `span`. */
export const clockTime = (ago: number, span = EARTH_AGE_MY) => 24 - (ago / span) * 24;

/** The minutes before midnight for an event `ago` million years back. */
export const minutesLeft = (ago: number, span = EARTH_AGE_MY) => (ago / span) * 1440;

/**
 * A clock time as h:mm, or h:mm:ss in the last ten minutes, where whole minutes would all read
 * 23:59 or 24:00 ("12:00", "21:11", "23:59:54").
 */
export function clockText(t: number): string {
  const secs = Math.round(Math.max(0, Math.min(24, t)) * 3600);
  const late = secs > 24 * 3600 - 600;
  const whole = late ? secs : Math.round(secs / 60) * 60;
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  const s = whole % 60;
  const mm = String(m).padStart(2, '0');
  return late ? `${h}:${mm}:${String(s).padStart(2, '0')}` : `${h}:${mm}`;
}

/** Hours in a year: 365.25 days of 24 hours (the year's length has not changed). */
export const YEAR_HOURS = 8766;

/**
 * Of `n` growth lines over `px` pixels, draw every `k`th line (k = 1, 2, 5, 10, 20, 50 …) so
 * the lines drawn stay at least `gap` px apart.
 */
export function lineStride(n: number, px: number, gap = 2.5): number {
  if (n <= 0) return 1;
  for (let pow = 1; ; pow *= 10)
    for (const f of [1, 2, 5]) if ((px / n) * f * pow >= gap) return f * pow;
}

/** Earth radii in a Sun radius: the Sun is 109 Earths wide. */
export const EARTH_PER_SUN = 109;

/** The transit depth, %: the share of the star's disk the planet covers. */
export const transitDepth = (planetRe: number, starRsun: number) =>
  100 * (planetRe / (EARTH_PER_SUN * starRsun)) ** 2;

/** The area where two disks of radii R and r overlap, their centres d apart. */
export function overlapArea(R: number, r: number, d: number): number {
  if (d >= R + r) return 0;
  if (d <= Math.abs(R - r)) return Math.PI * Math.min(R, r) ** 2;
  const a = Math.acos((d * d + r * r - R * R) / (2 * d * r));
  const b = Math.acos((d * d + R * R - r * r) / (2 * d * R));
  return (
    r * r * a + R * R * b - 0.5 * Math.sqrt((-d + r + R) * (d + r - R) * (d - r + R) * (d + r + R))
  );
}

/** The habitable zone's edges, AU, for a star of luminosity L (in Suns): 0.95 √L to 1.37 √L. */
export const zoneInner = (L: number) => 0.95 * Math.sqrt(L);
export const zoneOuter = (L: number) => 1.37 * Math.sqrt(L);

/** A planet's temperature, K, with no atmosphere: 278 K at 1 AU from the Sun. */
export const planetTemp = (L: number, a: number) => (278 * L ** 0.25) / Math.sqrt(a);

/** Light-years in a parsec, as the pages round it. */
export const LY_PER_PC = 3.26;

/** A star's distance in parsecs from its parallax in arcseconds: d = 1 ÷ p. */
export const parsecsOf = (p: number) => 1 / p;
