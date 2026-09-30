/**
 * Step-text phrases for the Grades 9–12 chemistry pages of group HJ, spread into PHRASES
 * (`evaluate.ts`): a salt's solubility read off its curve ("the solubility of KNO₃ at 40 °C").
 * By the time they run, × is *, − is - and a bracket around one number is gone. Test-only.
 */
import { SOLUBILITY, saltText, solubilityAt } from '@/components/module/reps/solubility';
import type { SaltName } from '../typesHsj';

/** A bare number, as `evaluate` leaves one by the time phrases run. */
const NUM = String.raw`-?\d+(?:\.\d+)?(?:e[-+]?\d+)?`;

export const HSJ_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  // pH from a concentration written in scientific notation: log₁₀(1.1 × 10⁻¹⁴) (H55).
  [
    new RegExp(`log₁₀ ?\\(?(${NUM}) \\* 10\\*\\* ?\\(?(-?\\d+)\\)?\\)?`),
    (a, e) => Math.log10(a) + e,
  ],
  // Solubility curves (H52): grams per 100 g of water at a temperature, one phrase per salt.
  ...(Object.keys(SOLUBILITY) as SaltName[]).map(
    (salt) =>
      [
        new RegExp(`solubility of ${saltText(salt)} at (${NUM})(?: °C)?`),
        (t: number) => solubilityAt(salt, t),
      ] as [RegExp, (...xs: number[]) => number],
  ),
];
