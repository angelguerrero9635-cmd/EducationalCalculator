/**
 * Step-text phrases for the college demos of round 2, group A (HC14, HC22), spread into PHRASES
 * (`evaluate.ts`): atan2(b, a), the angle of a + jb in degrees from −180° to 180° (a phasor in
 * any quadrant). By the time they run, − is -. Test-only.
 */
// As `NUM` in evaluate.ts (copied: evaluate imports this file): a number, × 10ⁿ as written or
// as * 10**(n) once worked on.
const NUM = String.raw`\(?-?\d+(?:\.\d+)?(?:e[-+]?\d+)?(?: × 10⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+| \* 10\*\* ?\(?-?\d+\)?)?\)?`;

export const HE2A_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  [
    new RegExp(String.raw`atan2\(\s*(${NUM})\s*,\s*(${NUM})\s*\)`),
    (b, a) => (Math.atan2(b, a) * 180) / Math.PI,
  ],
];
