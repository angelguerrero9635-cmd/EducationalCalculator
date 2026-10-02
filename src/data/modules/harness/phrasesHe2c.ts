/**
 * Step-text phrases for the college demos of round 2, group C (HC23), spread into PHRASES
 * (`evaluate.ts`): a fin's tanh(mL). By the time they run, × is * and − is -. Test-only.
 */
const NUM = String.raw`-?\d+(?:\.\d+)?(?:e[-+]?\d+)?`;

export const HE2C_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  // "tanh(0.447)", or "tanh 0.447" once its bracket is unwrapped (never an outer bracket's ")").
  [
    new RegExp(String.raw`tanh\s*(?:\(\s*(${NUM})\s*\)|(${NUM}))`),
    (a, b) => Math.tanh(Number.isNaN(a!) ? b! : a!),
  ],
];
