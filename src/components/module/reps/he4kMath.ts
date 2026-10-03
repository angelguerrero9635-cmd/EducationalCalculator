/**
 * The arithmetic group K's college pictures draw from (round 4: HC160 dialyzer, HC161 attenuation, HC162
 * scaffold, HC163 ligandGrid, HC164 bioreactor), shared by the
 * pictures and their harness checks.
 */

// ─── HC160: dialyzer ───────────────────────────────────────────────────────────

/** Clearance K = Q_b(C_in − C_out) ÷ C_in, in Q_b's unit. */
export const clearance = (qb: number, cin: number, cout: number) => (qb * (cin - cout)) / cin;

/**
 * Urea dots along one fiber of length `len`: the concentration falls from C_in to C_out
 * exponentially along it (C = C_in·r^(x ÷ len), r = C_out ÷ C_in), and a dot sits at every
 * `len ÷ perFiber` of ∫C ÷ C_in dx from `phase` (0 to 1), so the dots crowd where C is high: as
 * many per unit length as C_in would give `perFiber` along the fiber.
 */
export function ureaDots(r: number, len: number, perFiber: number, phase: number): number[] {
  const step = len / perFiber;
  const ln = Math.log(r);
  const flat = Math.abs(ln) < 1e-9;
  /** ∫₀ˣ r^(s ÷ len) ds and its inverse. */
  const total = flat ? len : (len * (r - 1)) / ln;
  const at = (F: number) => (flat ? F : (len * Math.log(1 + (F * ln) / len)) / ln);
  const xs: number[] = [];
  for (let F = phase * step; F < total - 1e-9; F += step) xs.push(at(F));
  return xs;
}

/** The mean of C ÷ C_in along the fiber, (r − 1) ÷ ln r (1 when r = 1). */
export const meanShare = (r: number) => (Math.abs(r - 1) < 1e-9 ? 1 : (r - 1) / Math.log(r));

// ─── HC161: attenuation ────────────────────────────────────────────────────────

/** The photon tracks a beam picture draws. */
export const PHOTONS = 20;

/**
 * Where each of `n` photons stops: the quantiles of the depth e^(−μz) leaves, so the share
 * still going at z is e^(−μz) (to within one photon). Track i (0 the shallowest) stops at
 * z = −ln(1 − (i + ½) ÷ n) ÷ μ.
 */
export const photonDepths = (mu: number, n = PHOTONS) =>
  Array.from({ length: n }, (_, i) => -Math.log(1 - (i + 0.5) / n) / mu);

/** The rows the tracks are drawn in: a fixed shuffle, so short and long tracks mix. */
export const photonRows = (n = PHOTONS) => Array.from({ length: n }, (_, i) => (i * 7 + 3) % n);

/** The echo's depth (cm) from its time (μs) at speed c (m/s): d = ct ÷ 2. */
export const echoDepth = (c: number, t: number) => (c * t * 1e-6 * 100) / 2;

/** The share of the intensity a boundary reflects, ((Z₂ − Z₁) ÷ (Z₂ + Z₁))². */
export const reflected = (z1: number, z2: number) => ((z2 - z1) / (z2 + z1)) ** 2;

// ─── HC162: scaffold ───────────────────────────────────────────────────────────

/** The solid share of a cubic open cell whose square struts are s = t ÷ L thick: 3s² − 2s³. */
export const strutShare = (s: number) => 3 * s * s - 2 * s * s * s;

/** The strut thickness t ÷ L whose cell is `relative` solid (bisection; 3s² − 2s³ rises on [0, 1]). */
export function strutFor(relative: number) {
  const target = Math.min(1, Math.max(0, relative));
  let [lo, hi] = [0, 1];
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (strutShare(mid) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** A box [x0, x1] × [y0, y1] × [z0, z1] in cell units. */
export type Box = [number, number, number, number, number, number];

/**
 * The struts of an n × n × n lattice of cells, thickness s, as disjoint blocks on one grid: a
 * node block at every node and a segment between neighbouring nodes. A block at grid index
 * (i, j, k) can only hide blocks with every index no larger, so drawing them by i + j + k (far
 * first, for a viewer up the (1, 1, 1) diagonal) paints them in order.
 */
export function latticeStruts(n: number, s: number): Box[] {
  const h = s / 2;
  /** The span of grid index g: even ones are nodes, odd ones the gaps between. */
  const span = (g: number): [number, number] =>
    g % 2 === 0 ? [g / 2 - h, g / 2 + h] : [(g - 1) / 2 + h, (g + 1) / 2 - h];
  const blocks: { box: Box; order: number }[] = [];
  for (let i = 0; i <= 2 * n; i++)
    for (let j = 0; j <= 2 * n; j++)
      for (let k = 0; k <= 2 * n; k++) {
        // A strut block has at most one odd index (a node has none).
        if ((i % 2) + (j % 2) + (k % 2) > 1) continue;
        const [x, y, z] = [span(i), span(j), span(k)];
        if (x[1] - x[0] <= 1e-9 || y[1] - y[0] <= 1e-9 || z[1] - z[0] <= 1e-9) continue;
        blocks.push({ box: [x[0], x[1], y[0], y[1], z[0], z[1]], order: i + j + k });
      }
  return blocks.sort((p, q) => p.order - q.order).map((b) => b.box);
}

// ─── HC163: ligandGrid ─────────────────────────────────────────────────────────

/** The ligand spacing (nm) on a square grid of `density` per μm²: 1000 ÷ √density. */
export const ligandSpacing = (density: number) => 1000 / Math.sqrt(density);

/** The window's height over its width at most (170 px under 320). */
export const LIGAND_ASPECT = 170 / 320;

/**
 * The window of the grid drawn: `cols` × `rows` whole squares of side d (nm), about 300 nm
 * across (8 to 40 squares), its height `aspect` of its width; a dot sits in each square's middle.
 */
export function ligandWindow(d: number, aspect: number) {
  const cols = Math.min(40, Math.max(8, Math.round(300 / d)));
  const rows = Math.max(3, Math.floor(cols * aspect));
  return { cols, rows, width: cols * d, height: rows * d };
}

/**
 * Focal-adhesion plaques under the cell when d ≤ the threshold: each over a run of ligands in
 * every other row of the cell’s part, at the left and right in turn (`cellRows` rows from the top), as [row, first col, last
 * col]. None past the threshold.
 */
export function ligandPlaques(d: number, threshold: number, cols: number, cellRows: number) {
  if (d > threshold) return [];
  const run = Math.max(3, Math.round(cols / 4));
  const out: [number, number, number][] = [];
  for (let r = 0; r < cellRows; r += 2) {
    // Left and right in turn, clear of the ring in the middle column.
    const first = (r / 2) % 2 === 0 ? 0 : cols - run;
    out.push([r, first, Math.min(cols - 1, first + run - 1)]);
  }
  return out;
}

// ─── HC164: bioreactor ─────────────────────────────────────────────────────────

/** The oxygen uptake rate (mM/h) of X cells/mL at q pmol/(cell·h): qX × 10⁻⁶. */
export const uptake = (q: number, x: number) => q * x * 1e-6;

/** The cells/mL one dot stands for: a power of ten, so X needs at most 120 dots. */
export const cellsPerDot = (x: number) => 10 ** Math.max(0, Math.ceil(Math.log10(x / 120)));

/** Fixed, even-looking places in the unit square (a Halton sequence in bases 2 and 3). */
export function halton(n: number): [number, number][] {
  const h = (i: number, b: number) => {
    let f = 1;
    let r = 0;
    for (let k = i; k > 0; k = Math.floor(k / b)) {
      f /= b;
      r += f * (k % b);
    }
    return r;
  };
  return Array.from({ length: n }, (_, i) => [h(i + 1, 2), h(i + 1, 3)]);
}
