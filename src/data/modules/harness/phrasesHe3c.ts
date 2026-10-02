/**
 * Step-text phrases for the college demos of round 3, group C (HC66), spread into PHRASES
 * (`evaluate.ts`): a factorial, "6!" or "(6)!" once a sum's index is put in. Test-only.
 */
export const HE3C_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  [
    /(?<![\d.])\(?(\d+)\)?!/,
    (n) => {
      let f = 1;
      for (let k = 2; k <= n; k++) f *= k;
      return f;
    },
  ],
];
