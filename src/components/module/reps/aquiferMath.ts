/**
 * The math of the `aquifer` picture (HC75, EG-P17): Darcy's law, total head and the Thiem
 * equation. The picture, the harness and the gallery demos all use these, so what is drawn and
 * what is checked are the same numbers.
 */

/** Hydraulic gradient i = Δh ÷ L. */
export const gradient = (drop: number, length: number) => drop / length;

/** Darcy's law Q = K A i. */
export const discharge = (K: number, area: number, i: number) => K * area * i;

/** Seepage velocity v = q ÷ n (q = Q ÷ A, the Darcy flux). */
export const seepage = (flux: number, porosity: number) => flux / porosity;

/** Pressure head ψ = p ÷ γ (p in kPa, γ = ρg in kN/m³: metres). */
export const pressureHead = (p: number, gamma: number) => p / gamma;

/** Thiem (confined, steady): Q = 2πKb(h₂ − h₁) ÷ ln(r₂ ÷ r₁). */
export const thiemRate = (K: number, b: number, h1: number, h2: number, r1: number, r2: number) =>
  (2 * Math.PI * K * b * (h2 - h1)) / Math.log(r2 / r1);

/** The Thiem head at r through (r₁, h₁) and (r₂, h₂): h₁ + (h₂ − h₁) ln(r ÷ r₁) ÷ ln(r₂ ÷ r₁). */
export const thiemHead = (r: number, h1: number, h2: number, r1: number, r2: number) =>
  h1 + ((h2 - h1) * Math.log(r / r1)) / Math.log(r2 / r1);

/**
 * How much heights are stretched in the `section` picture so a gentle water table shows: the
 * largest of 1, 2, 5 × 10ⁿ that keeps the drawn slope i × X at most 0.25 (a steep gradient,
 * a permeameter's, is squeezed instead: X below 1).
 */
export function exaggeration(i: number): number {
  const a = Math.abs(i);
  if (!(a > 0) || !Number.isFinite(a)) return 1;
  const steps = [1, 2, 5];
  let best = 1e-6;
  for (let e = -6; e <= 8; e++)
    for (const s of steps) {
      const X = s * 10 ** e;
      if (a * X <= 0.25 + 1e-12) best = Math.max(best, X);
    }
  return Number(best.toPrecision(3));
}

/** Default unit weight of water γ = ρg, kN/m³ (ρ = 1,000 kg/m³, g = 9.81 m/s²). */
export const WATER_GAMMA = 9.81;
