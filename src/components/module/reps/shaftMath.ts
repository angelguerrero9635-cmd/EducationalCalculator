/**
 * The arithmetic a `shaft` picture draws (HC59), shared with its harness check. Units: T and M
 * in N·m, d, d_i and L in mm, G in GPa, stresses in MPa, J in mm⁴, φ in rad.
 */

/** Polar moment of a solid (d_i = 0) or hollow round section, mm⁴. */
export const polarJ = (d: number, di = 0) => (Math.PI * (d ** 4 - di ** 4)) / 32;

/** The largest shear stress (at the surface), MPa: τ = T(d ÷ 2) ÷ J (16T ÷ πd³ when solid). */
export const tauMax = (T: number, d: number, di = 0) => (T * 1000 * (d / 2)) / polarJ(d, di);

/** The angle of twist, rad: φ = TL ÷ GJ. */
export const twist = (T: number, L: number, G: number, d: number, di = 0) =>
  (T * 1000 * L) / (G * 1000 * polarJ(d, di));

/** The bending stress at the surface, MPa: σ = M(d ÷ 2) ÷ I, I = J ÷ 2 (32M ÷ πd³ when solid). */
export const sigmaBend = (M: number, d: number, di = 0) =>
  (M * 1000 * (d / 2)) / (polarJ(d, di) / 2);

/** The von Mises stress of σ with τ, MPa. */
export const vonMises = (s: number, t: number) => Math.sqrt(s * s + 3 * t * t);

/** Torque (N·m) from power (W) and speed (rpm). */
export const torqueOf = (P: number, rpm: number) => P / ((2 * Math.PI * rpm) / 60);

/**
 * How much the twist is drawn larger on the shaft's side so it shows (1, 2, 5, 10 … times): the
 * scribed line turns at least about 20°. The end view shows φ to scale.
 */
export function twistScale(phi: number): number {
  const target = (20 * Math.PI) / 180;
  if (!(phi > 0) || phi >= target) return 1;
  for (const k of [2, 5, 10, 20, 50, 100, 200, 500, 1000]) if (phi * k >= target) return k;
  return 1000;
}
