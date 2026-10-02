/**
 * The arithmetic a `stressElement` picture draws (HC33), shared with its harness check: plane
 * stress turned to its principal axes, Mohr's circle, the failure loci in the σ_A–σ_B plane and
 * the Mohr–Coulomb line. Angles in degrees.
 */
import type { FailureCriterion } from '@/data/modules/typesHe2j';

const RAD = Math.PI / 180;

/** Mohr's circle of a plane stress: center, radius, principals and θ_p (to σ₁, degrees). */
export function mohr(sx: number, sy: number, txy: number) {
  const C = (sx + sy) / 2;
  const R = Math.hypot((sx - sy) / 2, txy);
  // θ_p turns the x face to σ₁ (counterclockwise positive): tan 2θ_p = 2τ ÷ (σₓ − σ_y).
  const theta1 = Math.atan2(2 * txy, sx - sy) / 2 / RAD;
  return { C, R, s1: C + R, s2: C - R, theta1 };
}

/** The normal and shear stress on a face turned θ degrees from x. */
export function turned(sx: number, sy: number, txy: number, theta: number) {
  const t = 2 * theta * RAD;
  return {
    s: (sx + sy) / 2 + ((sx - sy) / 2) * Math.cos(t) + txy * Math.sin(t),
    t: -((sx - sy) / 2) * Math.sin(t) + txy * Math.cos(t),
  };
}

/** Von Mises' equivalent stress for plane stress σ_A, σ_B. */
export const vonMises2 = (a: number, b: number) => Math.sqrt(a * a - a * b + b * b);

/** Von Mises' equivalent stress for three principals. */
export const vonMises3 = (a: number, b: number, c: number) =>
  Math.sqrt(((a - b) ** 2 + (b - c) ** 2 + (c - a) ** 2) / 2);

/**
 * How many times the load (a, b) can grow along its ray before it reaches the locus: the
 * factor of safety n by the criterion (St the yield or tensile strength, Sc the compressive).
 */
export function safety(kind: FailureCriterion, a: number, b: number, St: number, Sc = St): number {
  if (a === 0 && b === 0) return Infinity;
  if (kind === 'vonMises') return St / vonMises2(a, b);
  // Tresca and Coulomb–Mohr, with σ₃ = 0 beside the plane stress.
  const hi = Math.max(a, b, 0);
  const lo = Math.min(a, b, 0);
  if (kind === 'tresca') return St / (hi - lo);
  return 1 / (hi / St - lo / Sc);
}

/** The locus as a closed list of (σ_A, σ_B) points. */
export function locus(kind: FailureCriterion, St: number, Sc = St): [number, number][] {
  if (kind === 'vonMises') {
    return Array.from({ length: 73 }, (_, k) => {
      const t = (k * 5 * Math.PI) / 180;
      const [c, s] = [Math.cos(t), Math.sin(t)];
      const r = St / Math.sqrt(c * c - c * s + s * s);
      return [r * c, r * s];
    });
  }
  const C = kind === 'tresca' ? St : Sc;
  return [
    [St, 0],
    [St, St],
    [0, St],
    [-C, 0],
    [-C, -C],
    [0, -C],
    [St, 0],
  ];
}

/** Mohr–Coulomb: σ₁ at failure from σ₃, c and φ (degrees), and the plane's angle θ = 45° + φ ÷ 2. */
export function mohrCoulombS1(s3: number, c: number, phi: number) {
  const t = Math.tan((45 + phi / 2) * RAD);
  return s3 * t * t + 2 * c * t;
}

/** How far the line τ = c + σ tan φ lies from a circle's center (σ = C): equals R at failure. */
export const lineDistance = (C: number, c: number, phi: number) =>
  C * Math.sin(phi * RAD) + c * Math.cos(phi * RAD);
