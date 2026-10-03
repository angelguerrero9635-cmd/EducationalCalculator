/**
 * The arithmetic a `fatigueDiagram` picture draws (HC52), shared with its harness check.
 * Stresses in MPa; lives in cycles (N) or reversals (2N).
 */

/** The Goodman factor of safety: σ_a ÷ S_e + σ_m ÷ S_ut = 1 ÷ n. */
export const goodmanN = (sa: number, sm: number, Se: number, Sut: number) =>
  1 / (sa / Se + sm / Sut);

/** The S–N line S_f = aN^b through (10³, fS_ut) and (10⁶, S_e). */
export function snLine(Sut: number, Se: number, f: number) {
  const a = (f * Sut) ** 2 / Se;
  const b = -Math.log10((f * Sut) / Se) / 3;
  return { a, b };
}

/** The life at a stress on the line S = aN^b (N = (S ÷ a)^(1 ÷ b)). */
export const lifeAt = (S: number, a: number, b: number) => (S / a) ** (1 / b);

/** The stress at a life on the line, flat at S_e past 10⁶ when `Se` is given. */
export const strengthAt = (N: number, a: number, b: number, Se?: number) =>
  Se !== undefined && N >= 1e6 ? Se : a * N ** b;

/** Reversals to failure by Basquin: σ_a = σ′_f(2N)^b. */
export const basquinReversals = (sa: number, sf: number, b: number) => (sa / sf) ** (1 / b);

/** Miner's damage: the sum of each block's cycles over its life. */
export const minerDamage = (blocks: { n: number; N: number }[]) =>
  blocks.reduce((s, x) => s + x.n / x.N, 0);
