/**
 * Step-text phrases for the Grades 9–12 pages of group HF, spread into PHRASES (`evaluate.ts`):
 * the largest perfect square (or cube) factor of a whole number, which the root pages bring out
 * of the radical, and common logs. Test-only.
 */

/** The largest k^index that divides n. */
function largestPower(n: number, index: number): number {
  let k = Math.floor(Math.pow(n, 1 / index) + 1e-9);
  while (k > 1 && n % k ** index !== 0) k--;
  return Math.max(1, k) ** index;
}

export const HSF_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  [/largest perfect square factor of (\d+)/, (n) => largestPower(n, 2)],
  [/largest perfect cube factor of (\d+)/, (n) => largestPower(n, 3)],
  // Common logs (Algebra 2): log₁₀ 470000, with its bracket unwrapped.
  [/log₁₀ ?\(?(\d+(?:\.\d+)?(?:e[-+]?\d+)?)\)?/, (x) => Math.log10(x)],
];
