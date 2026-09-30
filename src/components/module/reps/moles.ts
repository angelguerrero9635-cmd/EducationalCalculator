/**
 * Mole arithmetic for the `moleMap` picture (H50): the constants a high-school course uses and
 * a molar mass from a formula. No drawing, so the harness checks the same numbers.
 */
import { element, parseFormula } from './chem';

/** Particles in one mole. */
export const AVOGADRO = 6.022e23;
/** Liters of an ideal gas per mole at STP (0 °C, 1 atm). */
export const MOLAR_VOLUME = 22.4;

/**
 * Molar mass in g/mol from the periodic table's atomic masses, to 2 decimals as a class writes
 * it (H₂O → 18.02); undefined when an element has no stable mass.
 */
export function molarMassOf(formula: string): number | undefined {
  let sum = 0;
  for (const { el, n } of parseFormula(formula)) {
    const e = element(el);
    if (!e || e.mass.startsWith('[')) return undefined;
    sum += Number(e.mass) * n;
  }
  return Math.round(sum * 100) / 100;
}
