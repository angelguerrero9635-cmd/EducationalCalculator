/**
 * Sums for HC15 `potentialWell` (PotentialWellSpec in typesHe2b.ts), shared by the picture and
 * its harness check: level heights, wavefunctions, node counts, a region's chance, the step's
 * R and T, and the units the checks read SI from.
 */

/** Constants (CODATA 2018, exact where SI defines them). */
export const PLANCK = 6.62607015e-34;
export const HBAR = PLANCK / (2 * Math.PI);
export const LIGHT = 299792458;
export const ELECTRON_VOLT = 1.602176634e-19;
export const AVOGADRO = 6.02214076e23;
export const DALTON = 1.6605390666e-27;

/** Joules per unit of energy (a per-mole unit is per particle here). */
export const ENERGY_J: Record<string, number> = {
  J: 1,
  zJ: 1e-21,
  aJ: 1e-18,
  eV: ELECTRON_VOLT,
  meV: 1e-3 * ELECTRON_VOLT,
  'J/mol': 1 / AVOGADRO,
  'kJ/mol': 1000 / AVOGADRO,
};

/** Metres per unit of length. */
export const LENGTH_M: Record<string, number> = {
  m: 1,
  cm: 1e-2,
  mm: 1e-3,
  μm: 1e-6,
  µm: 1e-6,
  nm: 1e-9,
  Å: 1e-10,
  pm: 1e-12,
};

/** Per metre, per unit of a reciprocal length. */
export const INVERSE_M: Record<string, number> = {
  'm⁻¹': 1,
  'cm⁻¹': 1e2,
  'nm⁻¹': 1e9,
  'Å⁻¹': 1e10,
  'pm⁻¹': 1e12,
  '1/m': 1,
  '1/nm': 1e9,
};

/** Kilograms per unit of mass. */
export const MASS_KG: Record<string, number> = { kg: 1, g: 1e-3, u: DALTON, Da: DALTON };

/** A level's height in units of E₁ (box: n²) or of ħω (oscillator: v + ½). */
export const levelHeight = (model: 'box' | 'harmonic', n: number) =>
  model === 'box' ? n * n : n + 0.5;

/** ψₙ in a box at s = x ÷ L (0 to 1), peak 1. */
export const boxPsi = (n: number, s: number) => Math.sin(n * Math.PI * s);

/** The physicists' Hermite polynomial Hᵥ(ξ). */
export function hermite(v: number, x: number): number {
  let [a, b] = [1, 2 * x];
  if (v === 0) return a;
  for (let k = 1; k < v; k++) [a, b] = [b, 2 * x * b - 2 * k * a];
  return b;
}

/** ψᵥ of the oscillator at ξ = x√(mω/ħ), normalized (∫ψ² dξ = 1). */
export function harmonicPsi(v: number, xi: number): number {
  let fact = 1;
  for (let k = 2; k <= v; k++) fact *= k;
  return (
    (hermite(v, xi) * Math.exp((-xi * xi) / 2)) / Math.sqrt(2 ** v * fact * Math.sqrt(Math.PI))
  );
}

/** The classical turning point ξ = √(2v + 1) of level v. */
export const turningPoint = (v: number) => Math.sqrt(2 * v + 1);

/** Sign changes of f strictly inside (a, b): a wavefunction's nodes. */
export function countNodes(f: (x: number) => number, a: number, b: number, samples = 4000) {
  let count = 0;
  let prev = 0;
  for (let i = 1; i < samples; i++) {
    const y = f(a + ((b - a) * i) / samples);
    if (Math.abs(y) < 1e-9) continue;
    const s = Math.sign(y);
    if (prev !== 0 && s !== prev) count++;
    prev = s;
  }
  return count;
}

/** The chance of finding a box state n between s₁ = x₁/L and s₂ = x₂/L. */
export const boxProbability = (n: number, s1: number, s2: number) =>
  s2 - s1 - (Math.sin(2 * n * Math.PI * s2) - Math.sin(2 * n * Math.PI * s1)) / (2 * n * Math.PI);

/** ⟨x²⟩ ÷ L² of box state n, and Δx ÷ L. */
export const boxMeanSquare = (n: number) => 1 / 3 - 1 / (2 * n * n * Math.PI * Math.PI);
export const boxSpread = (n: number) => Math.sqrt(boxMeanSquare(n) - 0.25);

/** A step of height U under energy E (E > U): k₁/k₂, R and T. */
export function stepScatter(E: number, U: number) {
  const ratio = Math.sqrt(E / (E - U));
  const R = ((ratio - 1) / (ratio + 1)) ** 2;
  return { ratio, R, T: 1 - R };
}

/** A photon's wavelength in metres from its energy in joules. */
export const photonWavelength = (joules: number) => (PLANCK * LIGHT) / joules;

/** A length in metres written in the unit that reads best (nm, μm, mm). */
export function lengthUnit(m: number): { value: number; unit: string } {
  if (m < 1e-6) return { value: m / 1e-9, unit: 'nm' };
  if (m < 1e-3) return { value: m / 1e-6, unit: 'μm' };
  return { value: m / 1e-3, unit: 'mm' };
}

/**
 * Re ψ at a step or barrier at t = 0, for an incident wave of size 1 and wavenumber k₁ (per
 * px): left of x = 0 the incident and reflected waves, right of it the transmitted wave
 * (k₂ = k₁√(1 − U/E) when E > U, else decaying at κ = k₁√(U/E − 1)).
 */
export function stepWave(E: number, U: number, k1: number) {
  const above = E > U;
  const q = k1 * Math.sqrt(Math.abs(1 - U / E));
  // r = (k₁ − k₂)/(k₁ + k₂), with k₂ = iκ below the top.
  const [rRe, rIm] = above
    ? [(k1 - q) / (k1 + q), 0]
    : [(k1 * k1 - q * q) / (k1 * k1 + q * q), (-2 * k1 * q) / (k1 * k1 + q * q)];
  const [tRe, tIm] = [1 + rRe, rIm];
  return (x: number) => {
    if (x < 0) return Math.cos(k1 * x) + rRe * Math.cos(k1 * x) + rIm * Math.sin(k1 * x);
    if (above) return tRe * Math.cos(q * x) - tIm * Math.sin(q * x);
    return Math.exp(-q * x) * tRe;
  };
}

/** The nodes ψ has inside the well, sampled as the picture draws it (n − 1 in a box, v). */
export const wellNodes = (model: 'box' | 'harmonic', n: number) =>
  model === 'box'
    ? countNodes((s) => boxPsi(n, s), 0, 1)
    : countNodes((xi) => harmonicPsi(n, xi), -8, 8);
