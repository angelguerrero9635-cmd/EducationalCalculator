/**
 * The arithmetic group K's college pictures draw from (round 4: HC160 dialyzer, HC161 attenuation), shared by the
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
