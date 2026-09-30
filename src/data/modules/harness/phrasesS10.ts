/**
 * Step-text phrases for the Grade 10 science pages, spread into PHRASES (`evaluate.ts`). By the
 * time they run, × is *, − is -, superscripts are powers and a bracket around one number is
 * gone. Test-only.
 */
import { LEWIS, lewisCounts, lewisKey } from '@/components/module/reps/lewis';

const NUM = String.raw`-?\d+(?:\.\d+)?(?:e[-+]?\d+)?`;

export const S10_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  // The shared pairs in the drawn Lewis structure of h H, c C, n N and o O atoms.
  [
    new RegExp(
      `shared pairs in the structure of (${NUM}) H, (${NUM}) C, (${NUM}) N and (${NUM}) O`,
    ),
    (h, c, n, o) => {
      const key = lewisKey({ H: h, C: c, N: n, O: o });
      return key ? lewisCounts(LEWIS[key]!).bonding : NaN;
    },
  ],
  // The smallest of three amounts (an empirical formula's moles).
  [new RegExp(`smallest of (${NUM}), (${NUM}) and (${NUM})`), (a, b, c) => Math.min(a, b, c)],
];
