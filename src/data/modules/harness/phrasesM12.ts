/**
 * Step-text phrases for the Grade 12 math pages, spread into PHRASES (`evaluate.ts`). By the
 * time they run, × is *, − is -, superscripts are powers and a bracket around one number is
 * gone. Test-only.
 */
import { invT, tCdf } from '@/components/module/reps/statMath';

/** A bare number, as `evaluate` leaves one by the time phrases run. */
const NUM = String.raw`-?\d+(?:\.\d+)?(?:e[-+]?\d+)?`;

export const M12_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  // The t distribution, as a calculator writes it: tcdf(t, df) is P(T ≤ t) (a two-sided test
  // reads tcdf(|t|, df)), and invT(area, df) the t with that area to its left.
  [new RegExp(`tcdf\\(abs\\((${NUM})\\), (${NUM})\\)`), (t, df) => tCdf(Math.abs(t), df)],
  [new RegExp(`tcdf\\((${NUM}), (${NUM})\\)`), (t, df) => tCdf(t, df)],
  [new RegExp(`invT\\((${NUM}), (${NUM})\\)`), (p, df) => invT(p, df)],
];
