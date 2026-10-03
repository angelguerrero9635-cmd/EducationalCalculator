/**
 * Step-text phrases for the college demos of round 3, group K (HC63), spread into PHRASES
 * (`evaluate.ts`): the nearest whole number, round(1.6), as the alias rule writes it. By the time
 * they run, × is * and − is -. Test-only.
 */
const NUM = String.raw`-?\d+(?:\.\d+)?(?:e[-+]?\d+)?`;

export const HE3K_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  // "round(0.625)", or "round 0.625" once its bracket is unwrapped.
  [
    new RegExp(String.raw`round\s*(?:\(\s*(${NUM})\s*\)|(${NUM}))`),
    (a, b) => Math.round(Number.isNaN(a!) ? b! : a!),
  ],
];
