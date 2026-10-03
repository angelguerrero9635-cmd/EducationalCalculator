/**
 * The sums behind group H's college pictures of round 4 (typesHe4h.ts), kept apart from the
 * drawings so the harness checks the same numbers the pictures draw.
 */
export type Pt = { x: number; y: number };

/** A random number source in [0, 1) that depends only on the seed (mulberry32). */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 0 … n − 1 in an order that depends only on the seed. */
export function shuffled(n: number, seed: number): number[] {
  const r = seeded(seed);
  const out = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Shoelace area of a closed polygon. */
export const polygonArea = (p: Pt[]) =>
  Math.abs(
    p.reduce((s, a, i) => {
      const b = p[(i + 1) % p.length]!;
      return s + a.x * b.y - b.x * a.y;
    }, 0),
  ) / 2;

/** Whether a point lies inside a closed polygon (even–odd rule). */
export function inside(p: Pt, poly: Pt[]) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!;
    const b = poly[j]!;
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x)
      hit = !hit;
  }
  return hit;
}

/** The nearest point on a polyline, and its distance. */
export function nearestOn(p: Pt, line: Pt[]): { at: Pt; d: number } {
  let best = { at: line[0]!, d: Infinity };
  for (let i = 0; i + 1 < line.length; i++) {
    const a = line[i]!;
    const b = line[i + 1]!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
    const at = { x: a.x + t * dx, y: a.y + t * dy };
    const d = Math.hypot(p.x - at.x, p.y - at.y);
    if (d < best.d) best = { at, d };
  }
  return best;
}

/** A smooth path through points (Catmull–Rom as cubic Béziers), open or closed. */
export function smoothPath(p: Pt[], closed = false, f = (q: Pt) => q): string {
  const n = p.length;
  const at = (i: number) => f(closed ? p[((i % n) + n) % n]! : p[Math.max(0, Math.min(n - 1, i))]!);
  const r = (x: number) => x.toFixed(1);
  let d = `M${r(at(0).x)},${r(at(0).y)}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const [a, b, c, e] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = { x: b.x + (c.x - a.x) / 6, y: b.y + (c.y - a.y) / 6 };
    const c2 = { x: c.x - (e.x - b.x) / 6, y: c.y - (e.y - b.y) / 6 };
    d += `C${r(c1.x)},${r(c1.y)} ${r(c2.x)},${r(c2.y)} ${r(c.x)},${r(c.y)}`;
  }
  return closed ? `${d}Z` : d;
}

// ─── HC129: catchment ──────────────────────────────────────────────────────────

/** Drops drawn on the basin: round(40C) of them run off, so the drawn share is C to 1/80. */
export const CATCHMENT_DROPS = 40;

/**
 * The made-up basin in unit coordinates (y down, about 2 wide): a pear narrowing to its outlet
 * at the bottom, 72 points round.
 */
export const BASIN: Pt[] = Array.from({ length: 72 }, (_, i) => {
  const t = (i / 72) * 2 * Math.PI;
  let dt = Math.abs(t - Math.PI / 2);
  dt = Math.min(dt, 2 * Math.PI - dt);
  const r =
    (1 + 0.12 * Math.sin(2 * t + 0.8) + 0.08 * Math.cos(3 * t + 0.3) + 0.05 * Math.sin(5 * t)) *
    (1 - 0.42 * Math.exp(-((dt / 0.45) ** 2)));
  return { x: r * Math.cos(t), y: 0.78 * r * Math.sin(t) };
});

/** The outlet: the basin's lowest point (the outline at 90°). */
export const OUTLET: Pt = BASIN[18]!;

/** The streams, each ending on the one it joins; the first is the main channel to the outlet. */
export const STREAMS: Pt[][] = [
  [
    { x: 0.08, y: -0.62 },
    { x: -0.05, y: -0.38 },
    { x: 0.04, y: -0.12 },
    { x: -0.03, y: 0.14 },
    { x: 0.02, y: 0.36 },
    OUTLET,
  ],
  [
    { x: -0.78, y: -0.28 },
    { x: -0.5, y: -0.3 },
    { x: -0.24, y: -0.16 },
    { x: 0.04, y: -0.12 },
  ],
  [
    { x: 0.82, y: -0.12 },
    { x: 0.55, y: 0.0 },
    { x: 0.28, y: 0.04 },
    { x: -0.03, y: 0.14 },
  ],
  [
    { x: -0.62, y: 0.3 },
    { x: -0.34, y: 0.3 },
    { x: 0.02, y: 0.36 },
  ],
  [
    { x: 0.5, y: -0.58 },
    { x: 0.28, y: -0.42 },
    { x: -0.05, y: -0.38 },
  ],
];

/** The basin's area in unit coordinates (squared units). */
export const BASIN_AREA = polygonArea(BASIN);

/**
 * Where the 40 drops fall (unit coordinates): spread over the basin, clear of its edge and the
 * streams, the same every time.
 */
export const CATCHMENT_DROP_AT: Pt[] = (() => {
  const shrunk = BASIN.map((p) => ({ x: p.x * 0.88, y: p.y * 0.88 }));
  for (let gap = 0.2; gap > 0.02; gap *= 0.92) {
    const r = seeded(129);
    const out: Pt[] = [];
    for (let k = 0; k < 6000 && out.length < CATCHMENT_DROPS; k++) {
      const p = { x: -1.2 + 2.4 * r(), y: -1 + 2 * r() };
      if (!inside(p, shrunk)) continue;
      if (STREAMS.some((s) => nearestOn(p, s).d < 0.07)) continue;
      if (out.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < gap)) continue;
      out.push(p);
    }
    if (out.length === CATCHMENT_DROPS) return out;
  }
  return [];
})();

/** How many of the 40 drops run off for a runoff coefficient C (0 to 1). */
export const runoffDrops = (C: number) =>
  Math.max(0, Math.min(CATCHMENT_DROPS, Math.round(C * CATCHMENT_DROPS)));

/** Which drops run off: the first round(40C) of a fixed order, so they are spread out. */
export const RUNOFF_ORDER = shuffled(CATCHMENT_DROPS, 31);

/** The rational method's peak flow (m³/s) from C, i (mm/h) and A (km²). */
export const rationalPeak = (C: number, i: number, A: number) => (C * i * A) / 3.6;

/** Rain streaks drawn for an intensity i (mm/h): more for harder rain, 3 to 40. */
export const rainStreaks = (i: number) => Math.max(3, Math.min(40, Math.round(3 * Math.sqrt(i))));

/** A round length (1, 2 or 5 × 10ⁿ) near `x`, not above it. */
export function niceBelow(x: number) {
  const e = 10 ** Math.floor(Math.log10(x));
  const m = x / e;
  return (m >= 5 ? 5 : m >= 2 ? 2 : 1) * e;
}

// ─── HC133: contourMap ─────────────────────────────────────────────────────────

/** The made-up hill's outline by direction (screen angle, y down): about 1, never round. */
export const hillR = (t: number) => 1 + 0.14 * Math.sin(2 * t + 1) + 0.08 * Math.cos(3 * t - 0.4);

/** How flat the hill's contours are drawn (their height over their width). */
export const HILL_SQUASH = 0.72;

/** Contours drawn (0, A's, to K − 1) for n intervals crossed: two past B's, at least 6. */
export const contourCount = (n: number) => Math.max(6, Math.round(n) + 3);

/** Contour k's size as a share of A's: 1 at A's, shrinking evenly toward the summit. */
export const contourShare = (k: number, K: number) => 1 - (0.9 * k) / K;

/**
 * Where A and B sit on the transect (it runs left from the summit), as shares of A's contour:
 * A on contour 0, B on contour n; with n = 0 both on the flat below the hill.
 */
export function transectEnds(n: number): { a: number; b: number } {
  const K = contourCount(n);
  const step = 0.9 / K;
  if (n <= 0) return { a: 1 + 1.6 * step, b: 1 + 0.4 * step };
  return { a: 1, b: contourShare(n, K) };
}

/** The contours the line A–B meets after A (A's own left out), A to B: n of them. */
export function transectCrossings(n: number): number[] {
  const K = contourCount(n);
  const { a, b } = transectEnds(n);
  const out: number[] = [];
  for (let k = 0; k < K; k++) {
    const s = contourShare(k, K);
    if (s < a - 1e-12 && s >= b - 1e-12) out.push(k);
  }
  return out;
}

// ─── HC134: rasterGrid ─────────────────────────────────────────────────────────

/** The lake on the extent, in shares of its width and height (y down). */
export const LAKE: Pt[] = Array.from({ length: 48 }, (_, i) => {
  const t = (i / 48) * 2 * Math.PI;
  const r = 1 + 0.16 * Math.sin(2 * t + 0.5) + 0.1 * Math.cos(3 * t);
  return { x: 0.46 + 0.3 * r * Math.cos(t), y: 0.52 + 0.26 * r * Math.sin(t) };
});

/** Columns (or rows) for an extent side in km and a cell in m: 1,000 × side ÷ c. */
export const rasterCount = (km: number, cellM: number) => (1000 * km) / cellM;

/** The most squares drawn along a side; past it each square is b × b cells. */
export const RASTER_MAX_DRAWN = 40;

/** Cells per drawn square side: 1, or the least 1, 2 or 5 × 10ⁿ that keeps ≤ 40 a side. */
export function rasterBlock(cols: number, rows: number) {
  const most = Math.max(Math.ceil(cols - 1e-9), Math.ceil(rows - 1e-9));
  if (most <= RASTER_MAX_DRAWN) return 1;
  for (let e = 1; ; e *= 10)
    for (const m of [1, 2, 5])
      if (Math.ceil(most / (m * e) - 1e-9) <= RASTER_MAX_DRAWN) return m * e;
}

/** Slope from the east and north gradients (rise per metre): degrees and percent. */
export const slopeOf = (ex: number, ny: number) => {
  const g = Math.hypot(ex, ny);
  return { deg: (Math.atan(g) * 180) / Math.PI, percent: 100 * g };
};

/** The compass bearing (0–360°, clockwise from north) the ground falls toward; none if flat. */
export function downhillBearing(ex: number, ny: number): number | undefined {
  if (Math.hypot(ex, ny) < 1e-12) return undefined;
  const b = (Math.atan2(-ex, -ny) * 180) / Math.PI;
  return b < 0 ? b + 360 : b;
}

/** The 8-point name of a bearing: N, NE, E … */
export const aspectName = (b: number) =>
  ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(b / 45) % 8]!;

// ─── HC135: sample pattern ─────────────────────────────────────────────────────

/** The most points drawn; more are drawn as this many in the same pattern. */
export const PATTERN_MAX = 300;

/** The largest nearest-neighbour index (a perfect triangular lattice). */
export const NNI_MAX = 2.15;

/** Each point's nearest other point (its index). */
export function nearestNeighbours(p: Pt[]): number[] {
  return p.map((a, i) => {
    let best = -1;
    let bd = Infinity;
    for (let j = 0; j < p.length; j++) {
      if (j === i) continue;
      const d = (a.x - p[j]!.x) ** 2 + (a.y - p[j]!.y) ** 2;
      if (d < bd) {
        bd = d;
        best = j;
      }
    }
    return best;
  });
}

/** The nearest-neighbour index of points in the unit square: d̄ over 0.5 ÷ √(n ÷ 1). */
export function nniOf(p: Pt[]) {
  if (p.length < 2) return NaN;
  const near = nearestNeighbours(p);
  const mean =
    p.reduce((s, a, i) => s + Math.hypot(a.x - p[near[i]!]!.x, a.y - p[near[i]!]!.y), 0) / p.length;
  return mean / (0.5 / Math.sqrt(p.length));
}

/** A coordinate folded back into the square (mirrored at its edges), so nothing piles on a side. */
const clamp01 = (x: number) => {
  let y = Math.abs(x) % 2;
  if (y > 1) y = 2 - y;
  return Math.min(0.995, Math.max(0.005, y));
};

/** n points on a triangular lattice filling the square, each moved up to `jitter` spacings. */
function latticePoints(n: number, jitter: number, seed: number): Pt[] {
  // The largest equilateral spacing whose sites in the square number at least n.
  const sites = (a: number) => {
    const out: Pt[] = [];
    const h = (a * Math.sqrt(3)) / 2;
    for (let j = 0; (j + 0.5) * h <= 1; j++)
      for (let i = 0; (i + 0.5 + (j % 2) / 2) * a <= 1; i++)
        out.push({ x: (i + 0.5 + (j % 2) / 2) * a, y: (j + 0.5) * h });
    return out;
  };
  let a = Math.sqrt(2 / (Math.sqrt(3) * n));
  let grid = sites(a);
  while (grid.length < n) {
    a *= 0.99;
    grid = sites(a);
  }
  const r = seeded(seed);
  return grid.slice(0, n).map((p) => {
    const t = 2 * Math.PI * r();
    const d = jitter * a * Math.sqrt(r());
    return { x: clamp01(p.x + d * Math.cos(t)), y: clamp01(p.y + d * Math.sin(t)) };
  });
}

/** n points in clusters (about one parent per 10 points), spread σ around their parents. */
function clusterPoints(n: number, sigma: number, seed: number): Pt[] {
  const r = seeded(seed);
  const parents = Array.from({ length: Math.max(1, Math.round(n / 10)) }, () => ({
    x: 0.1 + 0.8 * r(),
    y: 0.1 + 0.8 * r(),
  }));
  return Array.from({ length: n }, (_, k) => {
    const p = parents[k % parents.length]!;
    // Box–Muller: a normal step each way.
    const u = Math.max(1e-12, r());
    const v = r();
    const g = Math.sqrt(-2 * Math.log(u));
    return {
      x: clamp01(p.x + sigma * g * Math.cos(2 * Math.PI * v)),
      y: clamp01(p.y + sigma * g * Math.sin(2 * Math.PI * v)),
    };
  });
}

const PATTERN_CACHE = new Map<string, { points: Pt[]; R: number }>();

/**
 * n points in the unit square whose nearest-neighbour index is as near R as the search finds:
 * a jittered lattice for dispersed R, clusters for clustered R, scattered points near 1, from
 * fixed seeds, so the same n and R always draw the same points.
 */
export function patternPoints(n: number, R: number, seed = 135): { points: Pt[]; R: number } {
  const key = `${n} ${R} ${seed}`;
  const hit = PATTERN_CACHE.get(key);
  if (hit) return hit;
  let best = { points: [] as Pt[], R: NaN };
  const tryOne = (p: Pt[]) => {
    const r = nniOf(p);
    if (!(Math.abs(r - R) >= Math.abs(best.R - R))) best = { points: p, R: r };
  };
  for (let s = 0; s < 3; s++) {
    const sd = seed + 101 * s;
    for (let k = 0; k <= 24; k++) tryOne(latticePoints(n, (k / 24) * 1.6, sd));
    for (let k = 0; k <= 28; k++) tryOne(clusterPoints(n, 0.002 * 1.25 ** k, sd));
    const r = seeded(sd + 7);
    tryOne(Array.from({ length: n }, () => ({ x: clamp01(r()), y: clamp01(r()) })));
    if (Math.abs(best.R - R) <= 0.02) break;
  }
  // Scaling about the centre scales every nearest distance alike: close the last gap that way
  // when the scaled points still fit the square.
  if (Number.isFinite(best.R) && best.R > 0 && Math.abs(best.R - R) > 0.01) {
    const k = R / best.R;
    const cx = best.points.reduce((t, q) => t + q.x, 0) / best.points.length;
    const cy = best.points.reduce((t, q) => t + q.y, 0) / best.points.length;
    const moved = best.points.map((q) => ({ x: cx + k * (q.x - cx), y: cy + k * (q.y - cy) }));
    if (moved.every((q) => q.x >= 0.005 && q.x <= 0.995 && q.y >= 0.005 && q.y <= 0.995))
      best = { points: moved, R: nniOf(moved) };
  }
  if (PATTERN_CACHE.size > 50) PATTERN_CACHE.clear();
  PATTERN_CACHE.set(key, best);
  return best;
}

// ─── HC150: sample herd ────────────────────────────────────────────────────────

/** People drawn: a 10 × 10 crowd. */
export const HERD_PEOPLE = 100;

/** The most contacts drawn (R₀ up to 20). */
export const HERD_MAX_CONTACTS = 20;

/**
 * Who is who for R₀ and an immune share p (0 to 1): the case (person 44, never immune);
 * round(R₀) contacts (at most 20) from a fixed order; round(100p) immune (at most 99), of whom
 * round(p × contacts) are contacts, so the stopped arrows are R₀ × p to rounding.
 */
export function herdPlan(r0: number, p: number) {
  const index = 44;
  const others = shuffled(HERD_PEOPLE, 150).filter((k) => k !== index);
  const k = Math.max(0, Math.min(HERD_MAX_CONTACTS, Math.round(r0)));
  const contacts = others.slice(0, k);
  const rest = others.slice(k);
  const M = Math.max(0, Math.min(HERD_PEOPLE - 1, Math.round(p * HERD_PEOPLE)));
  const s = Math.max(Math.max(0, k - (HERD_PEOPLE - 1 - M)), Math.min(k, M, Math.round(p * k)));
  const immune = [...contacts.slice(0, s), ...rest.slice(0, M - s)];
  return { index, contacts, immune, stopped: s };
}
