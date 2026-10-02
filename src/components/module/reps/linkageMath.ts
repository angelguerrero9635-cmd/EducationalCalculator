/**
 * The sums of the `linkage` picture (HC84), shared by the picture and its harness check: a
 * sliding ladder's instantaneous centre, a rolling wheel's, and Gruebler's mobility.
 */

const RAD = Math.PI / 180;

/**
 * A ladder of length L at θ (degrees) to the floor, its foot sliding at v_A: the IC sits above
 * the foot and level with the top, r_A = L sin θ and r_B = L cos θ, ω = v_A ÷ r_A, v_B = ωr_B.
 */
export function ladderOf(L: number, thetaDeg: number, vA: number) {
  const rA = L * Math.sin(thetaDeg * RAD);
  const rB = L * Math.cos(thetaDeg * RAD);
  const omega = rA > 0 ? vA / rA : NaN;
  return { rA, rB, omega, vB: omega * rB, rG: L / 2, vG: (omega * L) / 2 };
}

/** Rolling without slipping: the speed of a rim point at angle φ from the contact (radians,
 * measured at the centre) is ω × its distance from the contact, 2r sin(φ/2). */
export const rimDistance = (r: number, phi: number) => 2 * r * Math.sin(phi / 2);

/** The acceleration down a slope of a body with I = cmr²: a = g sin θ ÷ (1 + c). */
export const rollingAcceleration = (g: number, thetaDeg: number, c: number) =>
  (g * Math.sin(thetaDeg * RAD)) / (1 + c);

/** Gruebler's mobility of a planar linkage: M = 3(n − 1) − 2j₁ − j₂. */
export const mobility = (n: number, j1: number, j2: number) => 3 * (n - 1) - 2 * j1 - j2;

/** The name of a rolling shape by c = I ÷ mr². */
export function shapeName(c: number): string | undefined {
  const names: [number, string][] = [
    [1, 'hoop'],
    [2 / 3, 'hollow ball'],
    [0.5, 'solid disk'],
    [0.4, 'solid ball'],
  ];
  return names.find(([k]) => Math.abs(k - c) < 1e-6)?.[1];
}
