/**
 * Step-text phrases for the Grades 9–12 round 2 chemistry demos of group H2D (H101), spread into
 * PHRASES (`evaluate.ts`). By the time they run, × is *, − is - and superscripts are powers.
 * Test-only.
 */
const NUM = String.raw`-?\d+(?:\.\d+)?(?:e[-+]?\d+)?`;

export const HS2D_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  // A hydrocarbon's fuel coefficient: 1 when its hydrogens are a multiple of 4, else 2.
  [
    new RegExp(`1 if (${NUM}) is a multiple of 4, else 2`),
    (y) => (Math.round(y) % 4 === 0 ? 1 : 2),
  ],
];
