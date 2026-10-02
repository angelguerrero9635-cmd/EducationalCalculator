/**
 * HC44 (round 3, group G): the sums behind the `energyProfile` options `steps` and `bomb`,
 * shared by the pictures and their harness check.
 */
import { profileAt } from './energyModel';

/**
 * A mechanism's profile: `levels` (reactants, the intermediates, products) and each step's
 * barrier from the level before it. Progress runs 0 to 1, one equal share per step, each step
 * the one-hump profile (`profileAt`).
 */
export function stepsAt(x: number, levels: number[], barriers: number[]): number {
  const k = barriers.length;
  const i = Math.min(k - 1, Math.max(0, Math.floor(x * k)));
  return profileAt(x * k - i, levels[i]!, levels[i + 1]!, barriers[i]!);
}

/** Each transition state's energy: the level before it plus its barrier. */
export const stepTops = (levels: number[], barriers: number[]) =>
  barriers.map((e, i) => levels[i]! + e);

/** The rate-determining step: the one with the highest transition state (index). */
export function rateStep(levels: number[], barriers: number[]): number {
  const tops = stepTops(levels, barriers);
  return tops.indexOf(Math.max(...tops));
}

/** Why a mechanism can't be drawn (a top under a level next to it), or undefined. */
export function stepsProblem(levels: number[], barriers: number[]): string | undefined {
  for (let i = 0; i < barriers.length; i++) {
    if (barriers[i]! < 0) return 'An activation energy is never negative.';
    if (levels[i]! + barriers[i]! < levels[i + 1]!)
      return `Step ${i + 1}'s peak must be at least as high as the level after it.`;
  }
  return undefined;
}

/** A bomb calorimeter: q = C_cal ΔT, ΔU = −q ÷ n, ΔH = ΔU + Δn_g RT (R in kJ/(mol·K)). */
export function bombSums(
  C: number,
  dT: number,
  n?: number,
  dng?: number,
  T?: number,
  R = 0.008314,
) {
  const q = C * dT;
  const dU = n !== undefined && n > 0 ? -q / n : undefined;
  const dH =
    dU !== undefined && dng !== undefined && T !== undefined ? dU + dng * R * T : undefined;
  return { q, dU, dH };
}
