/**
 * Step-text phrases for the college demos of round 3, group D, spread into PHRASES
 * (`evaluate.ts`): the Bellman–Ford minimum over three neighbours, "min(2 + 6, 7 + 3, 4 + 5)".
 * By the time they run, × is * and − is -. Test-only.
 */
/** A number as evaluate.ts writes it (its NUM, copied: evaluate.ts imports this file). */
const NUM = String.raw`\(?-?\d+(?:\.\d+…?)?(?:e[-+]?\d+)?(?: × 10⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+| \* 10\*\* ?\(?-?\d+\)?)?\)?`;

export const HE3D_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  [
    new RegExp(String.raw`min\((${NUM}) \+ (${NUM}), (${NUM}) \+ (${NUM}), (${NUM}) \+ (${NUM})\)`),
    (a, b, c, d, e, f) => Math.min(a! + b!, c! + d!, e! + f!),
  ],
];
