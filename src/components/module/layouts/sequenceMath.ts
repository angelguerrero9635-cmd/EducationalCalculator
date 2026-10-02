import { formatNumber } from '@/engine/format';

/** A signed span as written (HE-E25): +2, −1, 0. */
export const signedSpan = (x: number) => formatNumber(x, { signed: true });

/**
 * The spans so far as a sum: "2 + 3 = 5", or signed (HE-E25) "−1 + 0 − 1 + 2 = 0", a
 * negative after the first written as a subtraction.
 */
export function spanSum(spans: number[], signed?: boolean): string {
  const total = spans.reduce((sum, x) => sum + x, 0);
  if (!signed) return `${spans.join(' + ')} = ${total}`;
  const terms = spans
    .map((x, k) =>
      k === 0 ? signedSpan(x) : x < 0 ? `− ${formatNumber(-x)}` : `+ ${formatNumber(x)}`,
    )
    .join(' ');
  return `${terms} = ${signedSpan(total)}`;
}
