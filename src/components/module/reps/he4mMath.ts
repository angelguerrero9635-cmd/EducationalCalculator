/**
 * Sums for college round 4, group M's pictures (docs/RENDERINGS_HE.md), shared by the
 * components and the harness checks.
 */

// ─── HC174: soil phases ──────────────────────────────────────────────────────────

export interface SoilPhaseParts {
  /** Void ratio and degree of saturation used. */
  e: number;
  S: number;
  /** Volumes: air, water, solids, voids, total (V_s = 1 unless scaled to a volume). */
  Va: number;
  Vw: number;
  Vs: number;
  Vv: number;
  V: number;
}

/**
 * The phase volumes from what is known: e from wG_s ÷ S when not given, S from wG_s ÷ e.
 * `w` is a fraction. `V` scales the block (V_s = V ÷ (1 + e)); left out, V_s = 1.
 */
export function soilPhaseParts(k: {
  Gs?: number;
  w?: number;
  S?: number;
  e?: number;
  V?: number;
}): SoilPhaseParts | undefined {
  let { e, S } = k;
  const { Gs, w } = k;
  if (e === undefined && S !== undefined && S > 0 && Gs !== undefined && w !== undefined)
    e = (w * Gs) / S;
  if (e === undefined || !(e >= 0) || !Number.isFinite(e)) return undefined;
  if (S === undefined && Gs !== undefined && w !== undefined) S = e > 0 ? (w * Gs) / e : 0;
  if (S === undefined) return undefined;
  const Vs = k.V !== undefined ? k.V / (1 + e) : 1;
  const Vv = e * Vs;
  const Vw = S * Vv;
  return { e, S, Va: Vv - Vw, Vw, Vs, Vv, V: Vs + Vv };
}

/**
 * Labels kept apart along one axis: each wants `want`, keeps at least `gap` from the next and
 * stays in [lo, hi]. Returns the placed positions in the input's order.
 */
export function spreadApart(want: number[], gap: number, lo: number, hi: number): number[] {
  const order = want.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  const ys = order.map((o) => o.y);
  for (let i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i]!, ys[i - 1]! + gap);
  if (ys.length && ys[ys.length - 1]! > hi) {
    ys[ys.length - 1] = hi;
    for (let i = ys.length - 2; i >= 0; i--) ys[i] = Math.min(ys[i]!, ys[i + 1]! - gap);
  }
  if (ys.length && ys[0]! < lo) {
    ys[0] = lo;
    for (let i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i]!, ys[i - 1]! + gap);
  }
  const out = new Array<number>(want.length);
  order.forEach((o, k) => (out[o.i] = ys[k]!));
  return out;
}

// ─── HC175: level of service ─────────────────────────────────────────────────────

/** HCM 7th edition, basic freeway segments: the upper densities of A–E (pc/mi/ln). */
export const LOS_BOUNDS = [11, 18, 26, 35, 45] as const;
export const LOS_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

/** The level of service for a density: the first band whose bound it does not pass. */
export function losOf(d: number, bounds: readonly number[] = LOS_BOUNDS): number {
  const i = bounds.findIndex((b) => d <= b);
  return i === -1 ? bounds.length : i;
}

// ─── HC181: AM and FM spectra ────────────────────────────────────────────────────

/** Bessel J_n(x) by its integral (1 ÷ π) ∫₀^π cos(nτ − x sin τ) dτ, Simpson's rule. */
export function besselJ(n: number, x: number): number {
  // Enough steps for the integrand's oscillations (about x of them over [0, π]); N even.
  const N = Math.max(400, 2 * Math.ceil(40 * Math.abs(x)));
  const f = (t: number) => Math.cos(n * t - x * Math.sin(t));
  let sum = f(0) + f(Math.PI);
  for (let i = 1; i < N; i++) sum += (i % 2 ? 4 : 2) * f((Math.PI * i) / N);
  return (sum * (Math.PI / N)) / 3 / Math.PI;
}

/**
 * The spectral lines of a tone-modulated carrier, as offsets n from it (in f_m) and amplitudes
 * relative to the unmodulated carrier: AM's carrier 1 and sidebands μ ÷ 2; FM's J_n(β) for
 * |n| up to β + 3 (Carson's band holds 98% of the power within β + 1).
 */
export function spectrumLines(mode: 'am' | 'fm', index: number): { n: number; a: number }[] {
  if (mode === 'am')
    return [
      { n: -1, a: index / 2 },
      { n: 0, a: 1 },
      { n: 1, a: index / 2 },
    ];
  const top = Math.max(1, Math.ceil(index + 3));
  const out: { n: number; a: number }[] = [];
  for (let n = -top; n <= top; n++) {
    // J₋ₙ = (−1)ⁿ Jₙ: the same size on both sides.
    out.push({ n, a: besselJ(Math.abs(n), index) * (n < 0 && Math.abs(n) % 2 ? -1 : 1) });
  }
  return out;
}

// ─── HC182: constellations ───────────────────────────────────────────────────────

/** The Gray code of k: neighbours k and k + 1 differ in one bit. */
export const gray = (k: number) => k ^ (k >> 1);

export interface ConstellationPoint {
  /** In-phase and quadrature parts (PSK on the unit circle; QAM on odd integers). */
  i: number;
  q: number;
  /** The log₂M bits, Gray-coded. */
  bits: string;
}

/** Whether a constellation of M points is drawn as QAM (a square grid) or PSK. */
export function isQam(M: number, kind?: 'psk' | 'qam'): boolean {
  const side = Math.round(Math.sqrt(M));
  const square = side * side === M && M >= 4;
  return (kind ?? (M > 8 ? 'qam' : 'psk')) === 'qam' && square;
}

/**
 * The M points of a constellation with their Gray-coded labels. PSK: point k at angle
 * 2πk ÷ M (plus π ÷ M from M = 4), labelled gray(k). QAM: columns and rows of a √M × √M grid,
 * the label the column's Gray code then the row's.
 */
export function constellation(M: number, kind?: 'psk' | 'qam'): ConstellationPoint[] {
  const n = Math.round(Math.log2(M));
  const bitsOf = (x: number, w: number) => x.toString(2).padStart(w, '0');
  if (isQam(M, kind)) {
    const side = Math.round(Math.sqrt(M));
    const half = n / 2;
    const out: ConstellationPoint[] = [];
    for (let col = 0; col < side; col++)
      for (let row = 0; row < side; row++)
        out.push({
          i: 2 * col - (side - 1),
          q: 2 * row - (side - 1),
          bits: bitsOf(gray(col), half) + bitsOf(gray(row), half),
        });
    return out;
  }
  const off = M >= 4 ? Math.PI / M : 0;
  return Array.from({ length: M }, (_, k) => {
    const a = (2 * Math.PI * k) / M + off;
    return { i: Math.cos(a), q: Math.sin(a), bits: bitsOf(gray(k), n) };
  });
}

// ─── HC183: numbers in base 2, 8 and 16 ──────────────────────────────────────────

/** The digits of a whole number x ≥ 0 in a base, most significant first, `width` of them. */
export function digitsIn(x: number, base: number, width: number): number[] {
  const out: number[] = [];
  let v = Math.round(x);
  for (let i = 0; i < width; i++) {
    out.unshift(v % base);
    v = Math.floor(v / base);
  }
  return out;
}

/** The columns a whole number needs in a base (at least 1). */
export const widthFor = (x: number, base: number) =>
  Math.max(1, Math.floor(Math.log(Math.max(1, Math.round(x))) / Math.log(base) + 1e-9) + 1);

/** A digit as written: 0–9, then A–F. */
export const digitText = (d: number) => '0123456789ABCDEF'[d] ?? '?';

/** The two's complement of x in n bits, step by step: the bits, inverted, and plus 1. */
export function twosSteps(
  x: number,
  n: number,
): { bits: number[]; inverted: number[]; result: number[] } {
  const bits = digitsIn(x, 2, n);
  const inverted = bits.map((b) => 1 - b);
  const result = [...inverted];
  for (let i = n - 1; i >= 0; i--) {
    if (result[i] === 0) {
      result[i] = 1;
      break;
    }
    result[i] = 0;
  }
  return { bits, inverted, result };
}

/** The value of digits in a base. */
export const valueOf = (digits: number[], base: number) =>
  digits.reduce((acc, d) => acc * base + d, 0);

// ─── HC173: the classical orbital elements ───────────────────────────────────────

export type Vec3 = [number, number, number];
const D2R = Math.PI / 180;

/**
 * An orbit's frame from its elements (degrees): `n` the ascending node's direction (in the
 * equatorial plane), `up` the orbit plane's direction 90° ahead of the node, `P` toward
 * periapsis and `Q` 90° ahead of it in the direction of motion, `h` the orbit's normal. The
 * reference frame: x toward the vernal equinox, z north, the equatorial plane z = 0.
 */
export function orbitFrame(iDeg: number, raanDeg: number, argpDeg: number) {
  const [i, O, w] = [iDeg * D2R, raanDeg * D2R, argpDeg * D2R];
  const n: Vec3 = [Math.cos(O), Math.sin(O), 0];
  const up: Vec3 = [-Math.sin(O) * Math.cos(i), Math.cos(O) * Math.cos(i), Math.sin(i)];
  const along = (t: number): Vec3 => [
    Math.cos(t) * n[0] + Math.sin(t) * up[0],
    Math.cos(t) * n[1] + Math.sin(t) * up[1],
    Math.cos(t) * n[2] + Math.sin(t) * up[2],
  ];
  const P = along(w);
  const Q = along(w + Math.PI / 2);
  const h: Vec3 = [Math.sin(O) * Math.sin(i), -Math.cos(O) * Math.sin(i), Math.cos(i)];
  return { n, up, P, Q, h, along };
}

/** The position at true anomaly ν (degrees) on an orbit of semi-major axis a. */
export function orbitPoint(
  f: ReturnType<typeof orbitFrame>,
  a: number,
  e: number,
  nuDeg: number,
): Vec3 {
  const nu = nuDeg * D2R;
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu));
  return [
    r * (Math.cos(nu) * f.P[0] + Math.sin(nu) * f.Q[0]),
    r * (Math.cos(nu) * f.P[1] + Math.sin(nu) * f.Q[1]),
    r * (Math.cos(nu) * f.P[2] + Math.sin(nu) * f.Q[2]),
  ];
}

export const dot3 = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * The arcs an `orbitElements` figure lights, as unit directions from the centre: Ω from the
 * vernal equinox to the node in the equatorial plane; i from the equatorial plane up to the
 * orbit plane, across the node line; ω from the node to periapsis and ν from periapsis to the
 * satellite, both in the orbit plane.
 */
export function elementArc(
  which: 'raan' | 'i' | 'argp' | 'nu',
  iDeg: number,
  raanDeg: number,
  argpDeg: number,
  nuDeg: number,
  steps = 32,
): Vec3[] {
  const f = orbitFrame(iDeg, raanDeg, argpDeg);
  const O = raanDeg * D2R;
  const out: Vec3[] = [];
  for (let k = 0; k <= steps; k++) {
    const s = k / steps;
    if (which === 'raan') out.push([Math.cos(s * O), Math.sin(s * O), 0]);
    else if (which === 'i') {
      // From the equatorial plane's direction 90° ahead of the node, tilted up by s·i.
      const t = s * iDeg * D2R;
      out.push([-Math.sin(O) * Math.cos(t), Math.cos(O) * Math.cos(t), Math.sin(t)]);
    } else if (which === 'argp') out.push(f.along(s * argpDeg * D2R));
    else out.push(f.along((argpDeg + s * nuDeg) * D2R));
  }
  return out;
}
