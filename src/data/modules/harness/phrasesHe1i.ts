/**
 * Step-text phrases for the college demos of round 1, group I (HC8), spread into PHRASES
 * (`evaluate.ts`): a McCabe–Thiele count read back as the stairs the picture steps. By the time
 * they run, × is * and − is -. Test-only.
 */
import { distillationStairs } from '@/components/module/reps/phaseEnvelopeMath';

const NUM = String.raw`-?\d+(?:\.\d+)?(?:e[-+]?\d+)?`;
const STAIRS = String.raw`stairs from x_D = (${NUM}) to x_B = (${NUM}) \(α = (${NUM}), x_F = (${NUM}), q = (${NUM}), R = (${NUM})\)`;

const stairs = (xD: number, xB: number, alpha: number, xF: number, q: number, R: number) =>
  distillationStairs(alpha, xD, xB, { R, xF, q });

export const HE1I_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  // The feed stage first: its text holds the stage count's.
  [
    new RegExp(`the feed stair of the ${STAIRS}`),
    (...xs) => stairs(...(xs as [number, number, number, number, number, number])).feed ?? NaN,
  ],
  [
    new RegExp(`the ${STAIRS}`),
    (...xs) => {
      const s = stairs(...(xs as [number, number, number, number, number, number]));
      return s.pinched ? NaN : s.stairs.length;
    },
  ],
];
