/**
 * The sums of the `machining` picture (HC83), shared by the picture and its harness check, all
 * in SI (m, s, rev/s): cutting speed, removal rate, cutting time, table feed and the ideal
 * surface left by a round-nosed tool.
 */

/** Cutting speed v = πDN (m/s from m and rev/s). */
export const cuttingSpeed = (D: number, N: number) => Math.PI * D * N;

/** The ideal turned surface: cusp height h = f² ÷ (8r) and R_a ≈ f² ÷ (32r). */
export function idealSurface(f: number, r: number) {
  return { cusp: (f * f) / (8 * r), roughness: (f * f) / (32 * r) };
}

/**
 * The profile a tool nose of radius r leaves with feed f: the height above the groove bottoms
 * at x (exact circles), its mean over one feed, and the mean departure from it (R_a, worked
 * numerically: it is close to f² ÷ (32r)).
 */
export function profile(f: number, r: number) {
  const height = (x: number) => {
    const u = ((((x / f) % 1) + 1) % 1) * f; // 0 … f from a groove bottom
    const dx = Math.min(u, f - u);
    return r - Math.sqrt(Math.max(0, r * r - dx * dx));
  };
  const n = 400;
  const ys = Array.from({ length: n }, (_, i) => height(((i + 0.5) / n) * f));
  const mean = ys.reduce((a, b) => a + b, 0) / n;
  const ra = ys.reduce((a, y) => a + Math.abs(y - mean), 0) / n;
  return { height, mean, ra };
}
