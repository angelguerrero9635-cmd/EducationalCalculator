/**
 * Solubility of common salts in water (H52): grams that dissolve in 100 g of water every 10 °C
 * from 0 °C to 100 °C, from the standard physical-data tables (the values chemistry references
 * agree on to about 1 g). Read between the table's points in a straight line.
 */
import type { SaltName } from '@/data/modules/typesHsj';

export const SOLUBILITY: Record<SaltName, number[]> = {
  KNO3: [13.3, 20.9, 31.6, 45.8, 63.9, 85.5, 110, 138, 169, 202, 246],
  NaNO3: [73, 80, 88, 96, 104, 114, 124, 134, 148, 161, 180],
  NaCl: [35.7, 35.8, 36, 36.3, 36.6, 37, 37.3, 37.8, 38.4, 39, 39.8],
  KCl: [27.6, 31, 34, 37, 40, 42.6, 45.5, 48.3, 51.1, 54, 56.7],
  NH4Cl: [29.4, 33.3, 37.2, 41.4, 45.8, 50.4, 55.2, 60.2, 65.6, 71.3, 77.3],
  KClO3: [3.3, 5.2, 7.3, 10.1, 13.9, 18.5, 23.8, 30.5, 37.5, 46, 56.3],
};

/** The formula with subscripts: KNO₃. */
export const saltText = (salt: SaltName) => salt.replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]!);

/** Grams per 100 g of water at `celsius` (0–100 °C, held at the ends). */
export function solubilityAt(salt: SaltName, celsius: number): number {
  const table = SOLUBILITY[salt];
  const t = Math.min(100, Math.max(0, celsius)) / 10;
  const i = Math.min(9, Math.floor(t));
  const f = t - i;
  return Number((table[i]! + (table[i + 1]! - table[i]!) * f).toFixed(6));
}

/** The salt named by its formula, plain or with subscripts (KNO₃ or KNO3). */
export function saltOf(text: string): SaltName | undefined {
  const plain = text.replace(/[₀-₉]/g, (d) => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(d)));
  return plain in SOLUBILITY ? (plain as SaltName) : undefined;
}
