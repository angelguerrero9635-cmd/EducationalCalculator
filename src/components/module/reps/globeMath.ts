/**
 * The geometry the college `globe` draws (HC36): sun angles and day length, great-circle
 * distance, the rhumb line, plate speed about an Euler pole, dipole inclination and the
 * angular-momentum wind. Vectors are unit 3-vectors; an orthographic view keeps x right, y up
 * and z toward the viewer. Shared by the picture, its harness check and the gallery demos.
 */

export type V3 = [number, number, number];

export const RAD = Math.PI / 180;
export const EARTH_KM = 6371;
export const RIM_MS = 464.6;

export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const scale = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const norm = (a: V3): V3 => scale(a, 1 / Math.hypot(...a));

/** A place (degrees) as a unit vector: x toward (0°, 0°), z toward the north pole. */
export const toVec = (lat: number, lon: number): V3 => [
  Math.cos(lat * RAD) * Math.cos(lon * RAD),
  Math.cos(lat * RAD) * Math.sin(lon * RAD),
  Math.sin(lat * RAD),
];

// ─── sun ─────────────────────────────────────────────────────────────────────

/** The noon sun's height: 90 − |φ − δ| (degrees). */
export const noonAngle = (lat: number, dec: number) => 90 - Math.abs(lat - dec);

/**
 * The sunrise hour angle H (degrees): cos H = −tan φ tan δ, 180 past the polar circle in
 * summer (midnight sun) and 0 in winter (polar night).
 */
export function sunriseHour(lat: number, dec: number): number {
  const c = -Math.tan(lat * RAD) * Math.tan(dec * RAD);
  if (c <= -1) return 180;
  if (c >= 1) return 0;
  return Math.acos(c) / RAD;
}

/** Day length (h): 2H ÷ 15. */
export const dayLength = (lat: number, dec: number) => (2 * sunriseHour(lat, dec)) / 15;

/** The share of the place's parallel in sunlight: H ÷ 180. */
export const litShare = (lat: number, dec: number) => sunriseHour(lat, dec) / 180;

// ─── route ───────────────────────────────────────────────────────────────────

/** The central angle (degrees) by the spherical law of cosines. */
export function centralAngle(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const c =
    Math.sin(lat1 * RAD) * Math.sin(lat2 * RAD) +
    Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.cos((lon2 - lon1) * RAD);
  return Math.acos(Math.max(-1, Math.min(1, c))) / RAD;
}

/** The same angle between the two places' vectors, as the picture draws it. */
export const drawnAngle = (a: V3, b: V3) => Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) / RAD;

/** Points along the great circle from a to b (slerp). */
export function greatCircle(a: V3, b: V3, n = 48): V3[] {
  const w = drawnAngle(a, b) * RAD;
  if (w < 1e-9) return [a, b];
  const out: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const ka = Math.sin((1 - t) * w) / Math.sin(w);
    const kb = Math.sin(t * w) / Math.sin(w);
    out.push(add(scale(a, ka), scale(b, kb)));
  }
  return out;
}

/** The longitude difference λ₂ − λ₁ taken the short way round (−180 to 180). */
export const lonGap = (lon1: number, lon2: number) => ((((lon2 - lon1) % 360) + 540) % 360) - 180;

/** Points along the rhumb line (constant bearing: straight on a Mercator map). */
export function rhumbLine(lat1: number, lon1: number, lat2: number, lon2: number, n = 48): V3[] {
  const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * RAD) / 2));
  const [y1, y2] = [merc(lat1), merc(lat2)];
  const dl = lonGap(lon1, lon2);
  const out: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const y = y1 + (y2 - y1) * t;
    const lat = (2 * Math.atan(Math.exp(y)) - Math.PI / 2) / RAD;
    out.push(toVec(lat, lon1 + dl * t));
  }
  return out;
}

// ─── euler, dipole, momentum ─────────────────────────────────────────────────

/** Plate speed (mm/yr = km/Myr): ω (°/Myr) in rad × R (km) × sin Δ. */
export const plateSpeed = (omegaDeg: number, deltaDeg: number, R = EARTH_KM) =>
  omegaDeg * RAD * R * Math.sin(deltaDeg * RAD);

/** The dip of a dipole field at latitude φ: tan I = 2 tan φ (degrees). */
export const inclination = (lat: number) => Math.atan(2 * Math.tan(lat * RAD)) / RAD;

/** The latitude a dip I gives: tan φ = tan I ÷ 2. */
export const paleolatitude = (inc: number) => Math.atan(Math.tan(inc * RAD) / 2) / RAD;

/** The wind of air carried from the equator to φ keeping its angular momentum: ΩR sin²φ ÷ cos φ. */
export const momentumWind = (lat: number, rim = RIM_MS) =>
  (rim * Math.sin(lat * RAD) ** 2) / Math.cos(lat * RAD);
