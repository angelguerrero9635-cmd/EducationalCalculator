/**
 * Step-text phrases for the Grade 10 math pages, spread into PHRASES (`evaluate.ts`). By the
 * time they run, × is *, − is -, superscripts are powers and a bracket around one number is
 * gone. Test-only.
 */
import { choose } from '@/components/module/reps/statMath';

/** A bare number, as `evaluate` leaves one by the time phrases run. */
const NUM = String.raw`-?\d+(?:\.\d+)?(?:e[-+]?\d+)?`;

export const M10_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  // The rest of a group chosen from the second group: C(b, r − k).
  [new RegExp(`C\\((${NUM}), (${NUM}) - (${NUM})\\)`), (n, r, k) => choose(n, r - k)],
];
