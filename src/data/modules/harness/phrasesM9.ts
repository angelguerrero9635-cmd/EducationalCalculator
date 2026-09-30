/**
 * Step-text phrases for the Grade 9 math pages, spread into PHRASES (`evaluate.ts`). By the
 * time they run, × is *, − is -, superscripts are powers and a bracket around one number is
 * gone. Test-only.
 */

/** A bare number, as `evaluate` leaves one by the time phrases run. */
const NUM = String.raw`-?\d+(?:\.\d+)?(?:e[-+]?\d+)?`;

export const M9_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  // Domain and range of a line: the least and greatest output are at the ends.
  [new RegExp(`the smaller of (${NUM}) and (${NUM})`), (a, b) => Math.min(a, b)],
  [new RegExp(`the larger of (${NUM}) and (${NUM})`), (a, b) => Math.max(a, b)],
];
