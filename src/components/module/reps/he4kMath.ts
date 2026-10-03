/**
 * The arithmetic group K's college pictures draw from (round 4: HC160 dialyzer), shared by the
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
