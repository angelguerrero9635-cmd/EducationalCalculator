/**
 * The science behind the group HL earth and space pictures, shared with their harness checks
 * (harness/picturesHsl.ts): Earth's layers and seismic ray paths, a seismogram's arrivals, and
 * an epicenter from three distance circles.
 */

/** Earth's mean radius and the depths of its boundaries, km (PREM, rounded). */
export const EARTH = {
  radius: 6371,
  /** Radius of the core–mantle boundary (depth about 2,890 km). */
  core: 3480,
  /** Radius of the inner core (depth about 5,150 km). */
  inner: 1220,
  /** A typical continental crust, km thick (drawn a little thicker to be seen). */
  crust: 35,
};

/** The P-wave shadow zone and the S-wave shadow, degrees from the focus. */
export const SHADOW = { pFrom: 104, pTo: 140, sFrom: 104 };

/**
 * The deepest point (as a fraction of Earth's radius) of a direct wave reaching the surface Δ
 * degrees away. Rays curve back up because speed rises with depth, so they dip below the
 * straight chord (radius cos(Δ/2)); the dip grows with Δ so that the 104° ray just grazes the
 * core, which is what makes the shadow zone start there.
 */
export function bottomOf(delta: number): number {
  const d = (delta * Math.PI) / 180;
  const graze = EARTH.core / EARTH.radius / Math.cos(((SHADOW.pFrom / 2) * Math.PI) / 180);
  const k = 1 - (1 - graze) * (delta / SHADOW.pFrom) ** 1.5;
  return Math.cos(d / 2) * k;
}

/**
 * A direct ray from the focus (top) to Δ degrees round the surface, as points [x, y] in Earth
 * radii with y up and x to the right: a circular arc through the focus, the station and the
 * bottom point, curving up toward the surface. `side` −1 draws it on the left half.
 */
export function mantleRay(delta: number, side: 1 | -1 = 1, n = 40): [number, number][] {
  const h = (delta * Math.PI) / 360;
  const rmin = bottomOf(delta);
  const t = (1 - rmin * rmin) / (2 * (Math.cos(h) - rmin));
  const rho = t - rmin;
  const [cx, cy] = [t * Math.sin(h), t * Math.cos(h)];
  const a0 = Math.atan2(1 - cy, 0 - cx);
  const a1 = Math.atan2(Math.cos(2 * h) - cy, Math.sin(2 * h) - cx);
  // The arc on the side of the bottom point (the short way round from a0 to a1).
  let da = a1 - a0;
  while (da > Math.PI) da -= 2 * Math.PI;
  while (da < -Math.PI) da += 2 * Math.PI;
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + (da * i) / n;
    return [side * (cx + rho * Math.cos(a)), cy + rho * Math.sin(a)];
  });
}

/**
 * A P wave through the core to Δ (140°–180°) degrees: down through the mantle to the core, bent
 * through it, and out: points from the focus to the station in Earth radii, y up, each leg
 * curved, kinked where it crosses the core's edge.
 */
export function coreRay(delta: number, side: 1 | -1 = 1): [number, number][] {
  const rc = EARTH.core / EARTH.radius;
  const rad = (a: number) => (a * Math.PI) / 180;
  const theta = 0.2 * delta;
  const at = (r: number, a: number): [number, number] => [
    side * r * Math.sin(rad(a)),
    r * Math.cos(rad(a)),
  ];
  const [focus, entry, exit, station] = [
    at(1, 0),
    at(rc, theta),
    at(rc, delta - theta),
    at(1, delta),
  ];
  // Each leg curves like the direct rays (speed rises with depth, so a ray bows below its
  // chord, toward the center), and the path kinks at the core's edge both ways: P waves slow in
  // the liquid and bend toward the boundary's normal going in, away from it coming out.
  return [
    ...bowed(focus, entry, 0.12),
    ...bowed(entry, exit, 0.08).slice(1),
    ...bowed(exit, station, 0.12).slice(1),
  ];
}

/** Points along a curve from a to b bowed toward Earth's center by `bow` of its length. */
function bowed(a: [number, number], b: [number, number], bow: number, n = 12): [number, number][] {
  const [mx, my] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  let [nx, ny] = [-(b[1] - a[1]) / (len || 1), (b[0] - a[0]) / (len || 1)];
  // The normal that points toward the center (0, 0).
  if (nx * -mx + ny * -my < 0) [nx, ny] = [-nx, -ny];
  const [qx, qy] = [mx + nx * bow * len, my + ny * bow * len];
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const u = 1 - t;
    return [
      u * u * a[0] + 2 * u * t * qx + t * t * b[0],
      u * u * a[1] + 2 * u * t * qy + t * t * b[1],
    ];
  });
}

/** Which waves reach a station Δ degrees from the focus, directly or through the core. */
export function wavesAt(delta: number): { p: boolean; s: boolean } {
  return {
    p: delta < SHADOW.pFrom || delta >= SHADOW.pTo,
    s: delta < SHADOW.sFrom,
  };
}

/** Kilometres along the surface per degree from the focus. */
export const KM_PER_DEGREE = (2 * Math.PI * EARTH.radius) / 360;

/** Default wave speeds, km/s: P in the crust, S, and surface waves as a share of S. */
export const QUAKE_DEFAULTS = { vp: 6, vs: 3.5, surface: 0.9 };

/** Arrival times, s after the quake: P, S and the surface waves. */
export function arrivals(km: number, vp: number, vs: number) {
  return { p: km / vp, s: km / vs, surface: km / (vs * QUAKE_DEFAULTS.surface) };
}

/**
 * The trace (ground motion, −1 to 1) at time t: small background noise, then each arrival as a
 * burst that rises fast and dies away, each bigger and slower than the one before.
 */
export function traceAt(t: number, a: { p: number; s: number; surface: number }): number {
  const burst = (t0: number, amp: number, period: number, decay: number) => {
    if (t < t0) return 0;
    const u = t - t0;
    return (
      amp *
      Math.min(1, u / (period * 0.6)) *
      Math.exp(-u / decay) *
      Math.sin((2 * Math.PI * u) / period)
    );
  };
  const span = a.surface;
  const noise = 0.03 * Math.sin(t * 7.1) * Math.sin(t * 2.3 + 1);
  return (
    noise +
    burst(a.p, 0.3, span / 45, span / 8) +
    burst(a.s, 0.6, span / 30, span / 7) +
    burst(a.surface, 0.95, span / 16, span / 5)
  );
}

/**
 * Where three distance circles meet: the point solving the two linear equations their
 * differences give, and how far it is (km) from the worst circle.
 */
export function epicenterOf(st: { x: number; y: number; r: number }[]): {
  x: number;
  y: number;
  miss: number;
} | null {
  const [a, b, c] = st;
  if (!a || !b || !c) return null;
  const row = (p: typeof a) => [
    2 * (p.x - a.x),
    2 * (p.y - a.y),
    a.r * a.r - p.r * p.r - a.x * a.x + p.x * p.x - a.y * a.y + p.y * p.y,
  ];
  const [a1, b1, c1] = row(b) as [number, number, number];
  const [a2, b2, c2] = row(c) as [number, number, number];
  const det = a1 * b2 - a2 * b1;
  if (Math.abs(det) < 1e-9) return null;
  const x = (c1 * b2 - c2 * b1) / det;
  const y = (a1 * c2 - a2 * c1) / det;
  const miss = Math.max(...st.map((p) => Math.abs(Math.hypot(x - p.x, y - p.y) - p.r)));
  return { x, y, miss };
}

/** Circles meet at one point when the worst misses by at most this share of the largest radius. */
export const EPICENTER_TOLERANCE = 0.03;

/**
 * The ages that bracket layer `k` (0 is the top) by superposition and cross-cutting: the nearest
 * dated layer above is younger and the nearest below older; an intrusion that cuts the layer is
 * younger than it, and one that stops below it is older.
 */
export function bracketOf(
  ages: (number | undefined)[],
  k: number,
  intrusion?: { through: number; age?: number },
): { younger?: number; older?: number } {
  let younger: number | undefined;
  let older: number | undefined;
  for (let i = k - 1; i >= 0 && younger === undefined; i--) younger = ages[i];
  for (let i = k + 1; i < ages.length && older === undefined; i++) older = ages[i];
  const a = intrusion?.age;
  if (a !== undefined && intrusion) {
    if (k >= intrusion.through) younger = younger === undefined ? a : Math.max(younger, a);
    else older = older === undefined ? a : Math.min(older, a);
  }
  return { younger, older };
}

/** Percent of parent atoms left after n half-lives. */
export const parentLeft = (n: number) => 100 * 0.5 ** n;

// ── The ocean (H75) ──

/**
 * A seafloor profile across an ocean, from a continent to an island arc: [share of the way
 * across, depth in m] (negative is above sea level). Depths follow the usual figures: the shelf
 * to about 200 m, the slope down to about 3,000 m, the rise to 4,000 m, abyssal plains near
 * 4,500–5,000 m, a mid-ocean ridge crest near 2,500 m with its rift valley, and a trench past
 * 8,000 m (the deepest, the Mariana Trench, is about 11,000 m).
 */
export const SEAFLOOR: [number, number][] = [
  [0, -600],
  [0.05, 0],
  [0.15, 200],
  [0.2, 3000],
  [0.27, 4000],
  [0.33, 4600],
  [0.37, 4550],
  [0.41, 4700],
  [0.465, 2500],
  [0.475, 2900],
  [0.485, 2900],
  [0.495, 2500],
  [0.55, 4700],
  [0.62, 4750],
  [0.7, 4900],
  [0.76, 5100],
  [0.82, 8500],
  [0.85, 10900],
  [0.875, 6000],
  [0.92, 1500],
  [0.95, -400],
  [1, -500],
];

/** The labeled features of the profile: where each lies across it. */
export const SEAFLOOR_FEATURES = {
  shelf: [0.05, 0.15],
  slope: [0.15, 0.2],
  rise: [0.2, 0.27],
  plain: [0.27, 0.41],
  ridge: [0.41, 0.55],
  trench: [0.76, 0.875],
} as const;

export type SeafloorFeature = keyof typeof SEAFLOOR_FEATURES;

/** Depth (m) of the seafloor at share `x` across the profile. */
export function depthAt(x: number): number {
  const i = SEAFLOOR.findIndex(([px]) => px >= x);
  if (i <= 0) return SEAFLOOR[0]![1];
  const [x0, d0] = SEAFLOOR[i - 1]!;
  const [x1, d1] = SEAFLOOR[i]!;
  return d0 + ((d1 - d0) * (x - x0)) / (x1 - x0);
}

/**
 * Where a ship finds the seafloor at depth `d`: the first place across the profile (within
 * `over`, when given) where the depth equals d, found exactly on the segment that crosses it;
 * undefined when no part of the profile (or of that feature) is that deep.
 */
export function shipAt(d: number, over?: SeafloorFeature): number | undefined {
  const [lo, hi] = over ? SEAFLOOR_FEATURES[over] : [0.05, 0.95];
  for (let i = 1; i < SEAFLOOR.length; i++) {
    const [x0, d0] = SEAFLOOR[i - 1]!;
    const [x1, d1] = SEAFLOOR[i]!;
    if (x1 < lo || x0 > hi) continue;
    if ((d0 - d) * (d1 - d) <= 0 && d0 !== d1) {
      const x = x0 + ((d - d0) * (x1 - x0)) / (d1 - d0);
      if (x >= lo - 1e-9 && x <= hi + 1e-9) return x;
    }
  }
  return undefined;
}

/** Speed of sound in seawater used by echo sounding, m/s. */
export const SOUND_IN_SEAWATER = 1500;

/** The Sun's tide-raising pull as a share of the Moon's (about 0.46). */
export const SUN_TIDE = 0.46;

/**
 * The tidal range (as a multiple of the Moon's own) with the Moon `deg` degrees from the Sun as
 * seen from Earth: the two bulges add at new and full moon (spring, 1.46) and partly cancel at
 * the quarters (neap, 0.54).
 */
export const tideFactor = (deg: number) =>
  Math.sqrt(1 + SUN_TIDE ** 2 + 2 * SUN_TIDE * Math.cos((2 * deg * Math.PI) / 180));

/** The ocean's height at direction `phi` (radians) round Earth: the Moon's and Sun's bulges. */
export const tideAt = (phi: number, moon: number, sun: number) =>
  Math.cos(2 * (phi - moon)) + SUN_TIDE * Math.cos(2 * (phi - sun));

// ── The atmosphere (H76) ──

/** The troposphere's cooling, °C per km, and the tropopause's height, km. */
export const LAPSE_RATE = 6.5;
export const TROPOPAUSE = 11;

/**
 * The standard atmosphere above the tropopause [km, °C]: steady to 20 km, warming through the
 * ozone of the stratosphere to −2.5 °C at 47–51 km, cooling through the mesosphere to about
 * −86 °C near 86–91 km, and heating fast in the thermosphere.
 */
const UPPER: [number, number][] = [
  [20, -56.5],
  [32, -44.5],
  [47, -2.5],
  [51, -2.5],
  [71, -58.5],
  [86, -86.3],
  [91, -86.3],
  [100, -78],
  [110, -33],
  [120, 87],
];

export const ATMO_LAYERS: { name: string; from: number; to: number }[] = [
  { name: 'troposphere', from: 0, to: 11 },
  { name: 'stratosphere', from: 11, to: 50 },
  { name: 'mesosphere', from: 50, to: 85 },
  { name: 'thermosphere', from: 85, to: 120 },
];

/**
 * The profile's corners [km, °C] for a ground temperature: the troposphere cools 6.5 °C per km
 * from the ground to the tropopause, then the standard values.
 */
export function atmoProfile(ground = 15): [number, number][] {
  return [[0, ground], [TROPOPAUSE, ground - LAPSE_RATE * TROPOPAUSE], ...UPPER];
}

/** Temperature (°C) at altitude h (km). */
export function atmoTempAt(h: number, ground = 15): number {
  const pts = atmoProfile(ground);
  const i = pts.findIndex(([k]) => k >= h);
  if (i < 0) return pts[pts.length - 1]![1];
  if (i === 0) return pts[0]![1];
  const [h0, t0] = pts[i - 1]!;
  const [h1, t1] = pts[i]!;
  return t0 + ((t1 - t0) * (h - h0)) / (h1 - h0);
}

/**
 * A pressure field (hPa) with a high and a low centred at `hi` and `lo` (map units), each a
 * bell of width `s`, sized so the centres are exactly `high` and `low`.
 */
export function pressureField(
  high: number,
  low: number,
  hi: [number, number],
  lo: [number, number],
  s: number,
) {
  const base = (high + low) / 2;
  const e = Math.exp(-((hi[0] - lo[0]) ** 2 + (hi[1] - lo[1]) ** 2) / (s * s));
  // a + b·e = high − base and a·e + b = low − base.
  const det = 1 - e * e;
  const a = (high - base - e * (low - base)) / det;
  const b = (low - base - e * (high - base)) / det;
  return (x: number, y: number) =>
    base +
    a * Math.exp(-((x - hi[0]) ** 2 + (y - hi[1]) ** 2) / (s * s)) +
    b * Math.exp(-((x - lo[0]) ** 2 + (y - lo[1]) ** 2) / (s * s));
}

/**
 * The surface wind at (x, y) of a field (y north, up): along the isobars with low pressure on
 * its left in the north (right in the south), the Coriolis effect's turn, then turned 30° in
 * toward the low by friction with the ground. Returns [east, north], proportional to the
 * pressure gradient.
 */
export function windAt(
  p: (x: number, y: number) => number,
  x: number,
  y: number,
  north: boolean,
): [number, number] {
  const d = 0.5;
  const gx = (p(x + d, y) - p(x - d, y)) / (2 * d);
  const gy = (p(x, y + d) - p(x, y - d)) / (2 * d);
  // Geostrophic: k × ∇p in the north, the other way in the south.
  const [ux, uy] = north ? [-gy, gx] : [gy, -gx];
  // Friction turns it 30° toward the low: left in the north, right in the south.
  const t = ((north ? 1 : -1) * 30 * Math.PI) / 180;
  return [ux * Math.cos(t) - uy * Math.sin(t), ux * Math.sin(t) + uy * Math.cos(t)];
}

/** Where a pressure map puts its high and low (map units, y north), and the bells' width. */
export const PRESSURE_MAP = {
  hi: [100, 118] as [number, number],
  lo: [262, 106] as [number, number],
  s: 105,
  /** The isobar spacing, hPa. */
  step: 4,
};

/** The isobar spacing a map uses: 4 hPa, doubled until at most 16 isobars fit between. */
export function isobarStep(high: number, low: number): number {
  let step = PRESSURE_MAP.step;
  while ((high - low) / step > 16) step *= 2;
  return step;
}

/** The isobars a map draws: every multiple of the step strictly between the low and the high. */
export function isobarLevels(high: number, low: number, step = isobarStep(high, low)): number[] {
  const out: number[] = [];
  for (let p = Math.floor(low / step + 1) * step; p < high; p += step) out.push(p);
  return out;
}

// ── Stars (H79) ──

/** The Sun's surface temperature, K (IAU nominal). */
export const SUN_T = 5772;

/** Luminosity (L☉) of a star of radius r (R☉) and surface temperature t (K): L = R²(T ÷ T☉)⁴. */
export const luminosityOf = (r: number, t: number) => r * r * (t / SUN_T) ** 4;

/** Radius (R☉) of a star of luminosity l and temperature t. */
export const radiusOf = (l: number, t: number) => Math.sqrt(l) * (SUN_T / t) ** 2;

/** The H–R diagram's window: temperature (K, hot on the left) and luminosity (L☉), both log. */
export const HR_WINDOW = { tHot: 40000, tCool: 2500, lLow: 1e-4, lHigh: 1e6 };

/**
 * The zero-age main sequence [T (K), L (L☉)] by spectral type, rounded from the usual tables:
 * O5, B0, B5, A0, F0, G2 (the Sun), K0, K5, M0, M5, M8.
 */
export const MAIN_SEQUENCE: [number, number][] = [
  [40000, 4e5],
  [30000, 5e4],
  [15400, 800],
  [9700, 40],
  [7300, 6.5],
  [5772, 1],
  [5250, 0.4],
  [4400, 0.15],
  [3850, 0.07],
  [3050, 0.003],
  [2570, 0.0005],
];

/** The main sequence's luminosity at temperature t, interpolated on log scales. */
export function mainSequenceL(t: number): number {
  const lt = Math.log10(t);
  const pts = MAIN_SEQUENCE.map(([a, b]) => [Math.log10(a), Math.log10(b)] as const);
  for (let i = 1; i < pts.length; i++) {
    const [t0, l0] = pts[i - 1]!;
    const [t1, l1] = pts[i]!;
    if (lt <= t0 && lt >= t1) return 10 ** (l0 + ((l1 - l0) * (lt - t0)) / (t1 - t0));
  }
  const [t0, l0] =
    lt > pts[0]![0] ? [pts[0]!, pts[1]!] : [pts[pts.length - 2]!, pts[pts.length - 1]!];
  const slope = (l0[1] - t0[1]) / (l0[0] - t0[0]);
  return 10 ** (t0[1] + slope * (lt - t0[0]));
}

export type StarClass = 'main sequence' | 'giant' | 'supergiant' | 'white dwarf';

/**
 * Where a star falls: within half a power of ten of the main sequence; well above it a giant, or
 * a supergiant from 10,000 L☉; well below it, and under a twentieth of the Sun's size, a white
 * dwarf. Anything else is left unnamed.
 */
export function classifyStar(t: number, l: number): StarClass | undefined {
  const d = Math.log10(l) - Math.log10(mainSequenceL(t));
  if (Math.abs(d) <= 0.5) return 'main sequence';
  if (d > 0) return l >= 1e4 ? 'supergiant' : 'giant';
  return radiusOf(l, t) < 0.05 ? 'white dwarf' : undefined;
}
