/**
 * The terms and partial sums a `termsChart` draws, from its values: shared by `TermsChart.tsx`
 * and the harness.
 */
import type { TermsChartSpec } from '@/data/modules/typesHsb';

import { extraHe3c, seriesTermsHe3c } from './termsSeriesHe3c';

export interface TermsModel {
  terms: number[];
  sums: number[];
  /** n, the lit term's number: `terms` runs past it to a second lit term (H93). */
  count: number;
  /** An infinite geometric series' sum, when |r| < 1. */
  limit?: number;
  problem?: string;
}

export function termsModel(
  spec: TermsChartSpec,
  val: (v: number | string | undefined) => number | undefined,
): TermsModel {
  const a = val(spec.first) ?? 1;
  const d = val(spec.step) ?? 1;
  const n = Math.round(val(spec.count) ?? 1);
  // H93: `far` draws past 30 terms (a break, then the nth); `lit` may run the chart past n.
  const most = spec.far ? 10000 : 30;
  if (n < 1 || n > most)
    return { terms: [], sums: [], count: 0, problem: `${n} terms (1 to ${most} are drawn).` };
  const lit = spec.lit === undefined ? 0 : Math.round(val(spec.lit) ?? 0);
  const c = val(spec.plus) ?? 0;
  const terms: number[] = [];
  for (let i = 0; i < Math.max(n + extraHe3c(spec), Math.min(lit, 30)); i++)
    terms.push(
      spec.type === 'power' // H106: a₁ × nᵖ
        ? a * (i + 1) ** d
        : spec.type === 'arithmetic'
          ? a + i * d
          : spec.type === 'recursive'
            ? i
              ? d * terms[i - 1]! + c
              : a
            : a * d ** i,
    );
  seriesTermsHe3c(spec, a, d, terms); // HC66: n·rⁿ, cⁿ ÷ n!, alternating signs
  if (!terms.every(Number.isFinite))
    return { terms: [], sums: [], count: 0, problem: `The terms grow too large to draw.` };
  const sums: number[] = [];
  terms.forEach((t, i) => sums.push((sums[i - 1] ?? 0) + t));
  const limit =
    spec.type === 'geometric' && spec.limit && Math.abs(d) < 1 ? a / (1 - d) : undefined;
  const problem =
    spec.limit && spec.type === 'geometric' && !(Math.abs(d) < 1)
      ? `The ratio r = ${d} is not between −1 and 1, so the series has no sum.`
      : undefined;
  return { terms, sums, count: n, limit, problem };
}
