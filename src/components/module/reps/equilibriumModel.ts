/**
 * The numbers behind the equilibrium chart (H54), shared by the picture and its harness check.
 * Concentrations move together by the reaction's extent ξ (each by its coefficient, reactants
 * down and products up), so the stoichiometry holds at every moment; the extent at equilibrium
 * is the one where the reaction quotient Q equals K, found by bisection.
 */

export interface Species {
  coef: number;
  /** +1 for a product, −1 for a reactant. */
  sign: 1 | -1;
}

/** The reaction quotient: products over reactants, each to the power of its coefficient. */
export function quotient(species: Species[], c: number[]): number {
  let q = 1;
  species.forEach((s, i) => {
    q *= Math.max(0, c[i]!) ** (s.sign * s.coef);
  });
  return q;
}

/** Concentrations after an extent ξ. */
export const advance = (species: Species[], c0: number[], xi: number) =>
  species.map((s, i) => c0[i]! + s.sign * s.coef * xi);

/**
 * The extent from `c0` at which Q = K (every concentration kept at or above 0). Q only grows as
 * the reaction runs forward, so a bisection on ln Q − ln K finds it.
 */
export function extentTo(species: Species[], c0: number[], K: number): number {
  let lo = -Infinity;
  let hi = Infinity;
  species.forEach((s, i) => {
    const room = c0[i]! / s.coef;
    if (s.sign < 0) hi = Math.min(hi, room);
    else lo = Math.max(lo, -room);
  });
  if (!Number.isFinite(lo)) lo = -1e6;
  if (!Number.isFinite(hi)) hi = 1e6;
  const f = (xi: number) => Math.log(quotient(species, advance(species, c0, xi))) - Math.log(K);
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    const v = f(mid);
    if (Number.isNaN(v) || v > 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

/** The share of the way to equilibrium at time t (0 to 1) after a start or a stress. */
export const approach = (t: number, tau = 0.16) => (t <= 0 ? 0 : 1 - Math.exp(-t / tau));

/** The two stages of the chart: to equilibrium, then (after a stress) to the new one. */
export function stages(
  species: Species[],
  c0: number[],
  K: number,
  stress?: { add?: { index: number; amount: number }; scale?: number; K?: number },
) {
  const xi1 = extentTo(species, c0, K);
  const eq1 = advance(species, c0, xi1);
  if (!stress) return { eq1, xi1 };
  const jumped = eq1.map((x, i) => {
    let y = x * (stress.scale ?? 1);
    if (stress.add && stress.add.index === i) y += stress.add.amount;
    return Math.max(0, y);
  });
  const K2 = stress.K ?? K;
  const Q2 = quotient(species, jumped);
  const xi2 = extentTo(species, jumped, K2);
  const eq2 = advance(species, jumped, xi2);
  return { eq1, xi1, jumped, K2, Q2, xi2, eq2 };
}
