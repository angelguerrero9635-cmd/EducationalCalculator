/**
 * Step-text phrases for the Grade 11 math pages, spread into PHRASES (`evaluate.ts`). By the
 * time they run, × is *, − is -, superscripts are powers and a bracket around one number is
 * gone. Test-only.
 */
/** A bare number, as `evaluate` leaves one by the time phrases run. */
const NUM = String.raw`-?\d+(?:\.\d+)?(?:e[-+]?\d+)?`;

export const M11_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  // The 68–95–99.7 rule: the percent within 1, 2 or 3 standard deviations of the mean.
  [
    new RegExp(`share within (${NUM}) standard deviations`),
    (k) => ({ 1: 68, 2: 95, 3: 99.7 })[k] ?? NaN,
  ],
];
