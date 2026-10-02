/**
 * Step-text phrases for the college demos of round 2, group B (HC16), spread into PHRASES
 * (`evaluate.ts`): the coordination number a radius ratio predicts, and a metal cell's edge per
 * radius from its atoms per cell. Test-only.
 */
import { coordinationOf, edgePerRadius } from '@/components/module/reps/unitCellMath';

const NUM = String.raw`-?\d+(?:\.\d+)?(?:e[-+]?\d+)?`;

export const HE2B_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  [new RegExp(`the coordination number for a radius ratio of (${NUM})`), (r) => coordinationOf(r)],
  [new RegExp(`the edge per radius for (${NUM}) atoms per cell`), (z) => edgePerRadius(z)],
];
