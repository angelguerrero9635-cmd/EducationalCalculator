/**
 * An ionic compound's elements from its ions' charges (H108 part 2, `lewisStructure` ionic
 * `charges`): a metal ion of charge 1, 2 or 3 (Na⁺, Mg²⁺, Al³⁺) and a nonmetal ion of charge
 * −1, −2 or −3 (Cl⁻, O²⁻, N³⁻). Shared by the picture and its harness check.
 */
import type { IonicCharges } from '@/data/modules/typesHs3e';

export const METALS_BY_CHARGE: [string, string, string] = ['Na', 'Mg', 'Al'];
export const NONMETALS_BY_CHARGE: [string, string, string] = ['Cl', 'O', 'N'];

/**
 * The metal and nonmetal the charges name, or the fallback pair while a charge is unknown or
 * outside 1–3 (`known` false then).
 */
export function ionsFromCharges(
  charges: IonicCharges | undefined,
  fallback: { metal: string; nonmetal: string },
  read: (x: string | number) => number | undefined,
): { metal: string; nonmetal: string; known: boolean } {
  if (!charges) return { ...fallback, known: true };
  const p = read(charges.metal);
  const n = read(charges.nonmetal);
  const ok = (x: number | undefined): x is number =>
    x !== undefined && Number.isInteger(x) && x >= 1 && x <= 3;
  if (!ok(p) || !ok(n)) return { ...fallback, known: false };
  return {
    metal: (charges.metals ?? METALS_BY_CHARGE)[p - 1]!,
    nonmetal: (charges.nonmetals ?? NONMETALS_BY_CHARGE)[n - 1]!,
    known: true,
  };
}
