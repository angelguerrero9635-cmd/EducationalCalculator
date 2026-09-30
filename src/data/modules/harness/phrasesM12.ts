/**
 * Step-text phrases for the Grade 12 math pages, spread into PHRASES (`evaluate.ts`). By the
 * time they run, × is *, − is -, superscripts are powers and a bracket around one number is
 * gone. Test-only.
 */
import { invT, tCdf } from '@/components/module/reps/statMath';

import { fTail } from '../math/12';

/** A number in scientific notation as `evaluate` leaves it (5.9 × 10⁸ reads 5.9 * 10**(8)). */
const SCI = String.raw`-?\d+(?:\.\d+)?(?:e[-+]?\d+)?(?: \* 10\*\* ?\(?-?\d+\)?)?`;

/** A bare number, as `evaluate` leaves one by the time phrases run. */
const NUM = String.raw`-?\d+(?:\.\d+)?(?:e[-+]?\d+)?`;

export const M12_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  // The t distribution, as a calculator writes it: tcdf(t, df) is P(T ≤ t) (a two-sided test
  // reads tcdf(|t|, df)), and invT(area, df) the t with that area to its left.
  // A t near 0 is shown in scientific notation (4.03 × 10⁻⁶ when SE_b dwarfs b).
  [new RegExp(`tcdf\\(abs\\((${SCI}) ?\\), (${NUM})\\)`), (t, df) => tCdf(Math.abs(t), df)],
  [new RegExp(`tcdf\\((${SCI}) ?, (${NUM})\\)`), (t, df) => tCdf(t, df)],
  [new RegExp(`invT\\((${NUM}), (${NUM})\\)`), (p, df) => invT(p, df)],
  // The F distribution's right tail, Fcdf(F, ∞, df₁, df₂) (ANOVA and two variances).
  [
    new RegExp(`Fcdf\\( ?(${SCI}) ?, ∞, (${NUM}) ?, (${NUM}) ?\\)`),
    (f, d1, d2) => fTail(f, d1, d2),
  ],
];
