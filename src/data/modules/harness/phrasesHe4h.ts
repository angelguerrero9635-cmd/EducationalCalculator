/**
 * Step-text phrases for the college demos of round 4, group H (HC134), spread into PHRASES
 * (`evaluate.ts`): the compass bearing the ground falls toward, from the east and north
 * gradients (0° to 360°, clockwise from north). By the time they run, − is -. Test-only.
 */
// As `NUM` in evaluate.ts (copied: evaluate imports this file): a number, bracketed or not,
// × 10ⁿ as written or as * 10**(n) once worked on.
const NUM = String.raw`(\(?-?\d+(?:\.\d+)?(?:e[-+]?\d+)?(?: × 10⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+| \* 10\*\* ?\(?-?\d+\)?)?\)?)`;

export const HE4H_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  [
    new RegExp(String.raw`the bearing downhill for east ${NUM} and north ${NUM}`),
    (e, n) => {
      const b = (Math.atan2(-e, -n) * 180) / Math.PI;
      return b < 0 ? b + 360 : b;
    },
  ],
];
