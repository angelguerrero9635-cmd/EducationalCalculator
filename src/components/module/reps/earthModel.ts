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
 * through it, and out: [focus, entry, exit, station] in Earth radii, y up.
 */
export function coreRay(delta: number, side: 1 | -1 = 1): [number, number][] {
  const rc = EARTH.core / EARTH.radius;
  const rad = (a: number) => (a * Math.PI) / 180;
  const theta = 0.2 * delta;
  const at = (r: number, a: number): [number, number] => [
    side * r * Math.sin(rad(a)),
    r * Math.cos(rad(a)),
  ];
  return [at(1, 0), at(rc, theta), at(rc, delta - theta), at(1, delta)];
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
