/**
 * The kinetics the college `chemDiagram` rate options draw (HC34): integrated rate laws of
 * order 0, 1 and 2, their half-lives, the straight-line forms, A → B → C with first-order
 * steps, and Arrhenius from two readings. Shared by the picture, its harness check and the
 * gallery demos, so all three agree.
 */

export type RateOrder = 0 | 1 | 2;

/** [A] at t for an order-n reaction from [A]₀ (order 0 can go below zero: the caller limits t). */
export function integratedConc(order: RateOrder, k: number, A0: number, t: number): number {
  if (order === 0) return A0 - k * t;
  if (order === 1) return A0 * Math.exp(-k * t);
  return 1 / (1 / A0 + k * t);
}

/** The first half-life: [A]₀ ÷ (2k), ln 2 ÷ k, 1 ÷ (k[A]₀). */
export function halfLife(order: RateOrder, k: number, A0: number): number {
  if (order === 0) return A0 / (2 * k);
  if (order === 1) return Math.LN2 / k;
  return 1 / (k * A0);
}

/** The time [A] reaches [A]₀ ÷ 2ⁿ (order 0 only reaches it for n = 1: [A]₀ ÷ (2k), then zero). */
export function timeToFraction(order: RateOrder, k: number, A0: number, n: number): number {
  const A = A0 / 2 ** n;
  if (order === 0) return (A0 - A) / k;
  if (order === 1) return Math.log(A0 / A) / k;
  return (1 / A - 1 / A0) / k;
}

/** The time an order-0 reaction runs out: [A]₀ ÷ k. */
export const runOut = (k: number, A0: number) => A0 / k;

/** The straight-line form: [A] (order 0), ln [A] (order 1), 1/[A] (order 2). */
export function linearForm(order: RateOrder, A: number): number {
  if (order === 0) return A;
  if (order === 1) return Math.log(A);
  return 1 / A;
}

/** Its slope against t: −k, −k, +k. */
export const linearSlope = (order: RateOrder, k: number) => (order === 2 ? k : -k);

/** A → B → C, first-order steps, no B or C at the start: the three concentrations at t. */
export function consecutive(
  k1: number,
  k2: number,
  A0: number,
  t: number,
): { A: number; B: number; C: number } {
  const A = A0 * Math.exp(-k1 * t);
  const B =
    Math.abs(k2 - k1) < 1e-12 * Math.max(k1, k2)
      ? A0 * k1 * t * Math.exp(-k1 * t)
      : ((A0 * k1) / (k2 - k1)) * (Math.exp(-k1 * t) - Math.exp(-k2 * t));
  return { A, B, C: A0 - A - B };
}

/** When B peaks: ln(k₁ ÷ k₂) ÷ (k₁ − k₂) (1 ÷ k when they are equal). */
export function peakTime(k1: number, k2: number): number {
  if (Math.abs(k2 - k1) < 1e-12 * Math.max(k1, k2)) return 1 / k1;
  return Math.log(k1 / k2) / (k1 - k2);
}

/** B's peak: [A]₀(k₁ ÷ k₂)^(k₂ ÷ (k₂ − k₁)) (the same as B at t_max). */
export function peakConc(k1: number, k2: number, A0: number): number {
  return consecutive(k1, k2, A0, peakTime(k1, k2)).B;
}

/** Eₐ (J/mol) from k at two temperatures (K): R ln(k₂ ÷ k₁) ÷ (1/T₁ − 1/T₂). */
export function arrheniusEa(k1: number, T1: number, k2: number, T2: number, R: number): number {
  return (R * Math.log(k2 / k1)) / (1 / T1 - 1 / T2);
}
