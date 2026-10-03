/**
 * Step-text phrases for the college demos of round 4, group D (HC110), spread into PHRASES
 * (`evaluate.ts`): the d electrons in a crystal field's lower set and those left unpaired, read
 * off the filled boxes, and the pairs a free ion already has. By the time they run, × is * and
 * − is -. Test-only.
 */
import { fieldFill, type FieldGeometry } from '@/components/module/reps/orbitalHe4dMath';

const NUM = String.raw`-?\d+(?:\.\d+)?(?:e[-+]?\d+)?`;

const at = String.raw`of d(${NUM}) at Δ (${NUM}), P (${NUM})`;
const fill = (geometry: FieldGeometry) => (d: number, split: number, P: number) =>
  fieldFill(d, split, P, geometry);

export const HE4D_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  [new RegExp(`the t₂g electrons ${at}`), (d, s, P) => fill('octahedral')(d, s, P).counts[0]!],
  [
    new RegExp(`the tetrahedral lower-set electrons ${at}`),
    (d, s, P) => fill('tetrahedral')(d, s, P).counts[0]!,
  ],
  [
    new RegExp(`the unpaired electrons ${at} in a tetrahedral field`),
    (d, s, P) => fill('tetrahedral')(d, s, P).unpaired,
  ],
  [new RegExp(`the unpaired electrons ${at}`), (d, s, P) => fill('octahedral')(d, s, P).unpaired],
  [new RegExp(`the free ion’s pairs of d(${NUM})`), (d) => Math.max(0, d - 5)],
];
