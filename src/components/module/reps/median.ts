import { formatNumber } from '@/engine/format';

import { nowrap } from './common';

/**
 * The middle of values sorted from least to greatest: the rank of the middle value (an odd
 * count) or of the two middle values (an even count), and the median.
 */
export function middleOf(sorted: number[]): { ranks: number[]; median: number | undefined } {
  const n = sorted.length;
  if (n === 0) return { ranks: [], median: undefined };
  if (n % 2 === 1) return { ranks: [(n - 1) / 2], median: sorted[(n - 1) / 2]! };
  const [a, b] = [sorted[n / 2 - 1]!, sorted[n / 2]!];
  return { ranks: [n / 2 - 1, n / 2], median: Number(((a + b) / 2).toFixed(6)) };
}

/**
 * The median in a sentence, with every number: "The median is the middle value, 6." or "The
 * median is halfway between 6 and 8: (6 + 8) ÷ 2 = 7." `shown` is the median as the page
 * shows it ("?" while it is unknown).
 */
export function medianSentence(sorted: number[], shown: string): string {
  const { ranks } = middleOf(sorted);
  if (ranks.length === 0) return '';
  const f = (x: number) => formatNumber(x);
  if (ranks.length === 1) return `The median is the middle value, ${shown}.`;
  const [a, b] = ranks.map((r) => sorted[r]!) as [number, number];
  return a === b
    ? `The two middle values are both ${f(a)}, so the median is ${shown}.`
    : `The median is halfway between ${f(a)} and ${f(b)}: ${nowrap(`(${f(a)} + ${f(b)}) ÷ 2 = ${shown}`)}.`;
}
