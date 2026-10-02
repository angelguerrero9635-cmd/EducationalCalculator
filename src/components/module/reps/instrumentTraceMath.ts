/**
 * The sums behind `instrumentTrace` (HC55) and its `ir` card: every trace is computed from a
 * peak list (n + 1 multiplets from Pascal's triangle, Gaussian peaks, rigid-rotor lines with
 * Boltzmann heights, IR bands), never traced from a real spectrum. No drawing, so the harness
 * and the demos use the same numbers.
 */

/** Row n of Pascal's triangle: the n + 1 line intensities of a multiplet. */
export function pascalRow(n: number): number[] {
  const row = [1];
  for (let k = 1; k <= n; k++) row.push((row[k - 1]! * (n - k + 1)) / k);
  return row;
}

export const MULTIPLET = [
  'singlet',
  'doublet',
  'triplet',
  'quartet',
  'quintet',
  'sextet',
  'septet',
  'octet',
  'nonet',
];

/** A multiplet's name from its neighbors: n = 3 → "quartet". */
export const multipletName = (n: number) => MULTIPLET[n] ?? `${n + 1} lines`;

/**
 * The lines of a multiplet centered on `shift` (ppm), `spacing` ppm apart: n + 1 lines whose
 * heights are the Pascal row scaled so they add to `area`.
 */
export function multipletLines(
  shift: number,
  n: number,
  spacing: number,
  area = 1,
): { at: number; height: number }[] {
  const row = pascalRow(n);
  const total = 2 ** n;
  return row.map((r, k) => ({ at: shift + (k - n / 2) * spacing, height: (area * r) / total }));
}

/** The H a signal stands for: H × I ÷ ΣI. */
export const hydrogensOf = (H: number, integral: number, sum: number) => (H * integral) / sum;

// ─── Chromatography ─────────────────────────────────────────────────────────

/** A Gaussian peak of unit area: σ = w ÷ 4 (the base width is 4σ). */
export function gaussian(t: number, center: number, width: number, area = 1): number {
  const s = width / 4;
  return (area / (s * Math.sqrt(2 * Math.PI))) * Math.exp(-((t - center) ** 2) / (2 * s * s));
}

/** Peak height of a unit-area peak of base width w. */
export const peakHeight = (width: number, area = 1) =>
  area / ((width / 4) * Math.sqrt(2 * Math.PI));

/** R = 2(t₂ − t₁) ÷ (w₁ + w₂). */
export const resolution = (t1: number, t2: number, w1: number, w2: number) =>
  (2 * (t2 - t1)) / (w1 + w2);

/** k = (t − t_M) ÷ t_M. */
export const retentionFactor = (t: number, dead: number) => (t - dead) / dead;

/** N = 16(t ÷ w)². */
export const plateCount = (t: number, w: number) => 16 * (t / w) ** 2;

/**
 * The tangent triangle of a Gaussian peak: tangents at the inflection points (t ± σ) meet the
 * baseline at t ± 2σ = t ± w/2 and each other above the peak at 2e^(−½) of its height.
 */
export function tangentTriangle(t: number, w: number, height: number) {
  return { left: t - w / 2, right: t + w / 2, apex: 2 * Math.exp(-0.5) * height };
}

// ─── Rotational spectra ──────────────────────────────────────────────────────

/** hc ÷ k_B in cm·K (the second radiation constant). */
export const HC_OVER_K = 1.4388;

/** A rigid rotor's absorption line from J to J + 1: ν̃ = 2B(J + 1). */
export const rotorLine = (B: number, J: number) => 2 * B * (J + 1);

/** The share of molecules in level J (unnormalized): (2J + 1)e^(−hcBJ(J + 1) ÷ kT). */
export const rotorPopulation = (B: number, J: number, T: number) =>
  (2 * J + 1) * Math.exp((-HC_OVER_K * B * J * (J + 1)) / T);

/** The most populated level: the whole J nearest √(kT ÷ 2hcB) − ½. */
export function rotorPeakJ(B: number, T: number): number {
  let best = 0;
  for (let J = 1; J < 400; J++)
    if (rotorPopulation(B, J, T) > rotorPopulation(B, best, T)) best = J;
  return best;
}

/** The lines drawn: from J = 0 up while a line keeps 3% of the strongest (at most 30). */
export function rotorLines(B: number, T: number): { J: number; at: number; height: number }[] {
  const top = rotorPopulation(B, rotorPeakJ(B, T), T);
  const out: { J: number; at: number; height: number }[] = [];
  for (let J = 0; J < 30; J++) {
    const h = rotorPopulation(B, J, T) / top;
    if (J > rotorPeakJ(B, T) && h < 0.03) break;
    out.push({ J, at: rotorLine(B, J), height: h });
  }
  return out;
}

// ─── IR ──────────────────────────────────────────────────────────────────────

export interface IrBandSpec {
  at: number;
  to?: number;
  strength?: 'strong' | 'medium' | 'weak';
  shape?: 'sharp' | 'broad';
}

const DEPTH = { strong: 0.85, medium: 0.55, weak: 0.3 };

/** A band's center, half-width (cm⁻¹) and depth (0–1 of the transmittance). */
export function irBandShape(b: IrBandSpec): { center: number; half: number; depth: number } {
  const depth = DEPTH[b.strength ?? 'strong'];
  if (b.to !== undefined)
    return { center: (b.at + b.to) / 2, half: Math.abs(b.to - b.at) / 2, depth };
  return { center: b.at, half: b.shape === 'broad' ? 120 : 18, depth };
}

/** Transmittance (0–1) at a wavenumber: each band a Lorentzian dip, the dips multiplied. */
export function irTransmittance(nu: number, bands: IrBandSpec[]): number {
  return bands.reduce((t, b) => {
    const { center, half, depth } = irBandShape(b);
    // A very broad band (a range) has a flat bottom and rounded shoulders.
    const x = (nu - center) / half;
    const shape = b.to !== undefined ? x ** 6 : x * x;
    return t * (1 - depth / (1 + shape));
  }, 1);
}

/** Where a band dips lowest (its center; a range's middle). */
export const irBandAt = (b: IrBandSpec) => irBandShape(b).center;
