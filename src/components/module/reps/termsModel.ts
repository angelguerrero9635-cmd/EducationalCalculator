/**
 * The terms and partial sums a `termsChart` draws, from its values: shared by `TermsChart.tsx`
 * and the harness.
 */
import type { TermsChartSpec } from '@/data/modules/typesHsb';

export interface TermsModel {
  terms: number[];
  sums: number[];
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
  if (n < 1 || n > 30) return { terms: [], sums: [], problem: `${n} terms (1 to 30 are drawn).` };
  const terms = Array.from({ length: n }, (_, i) =>
    spec.type === 'arithmetic' ? a + i * d : a * d ** i,
  );
  const sums: number[] = [];
  terms.forEach((t, i) => sums.push((sums[i - 1] ?? 0) + t));
  const limit =
    spec.type === 'geometric' && spec.limit && Math.abs(d) < 1 ? a / (1 - d) : undefined;
  const problem =
    spec.limit && spec.type === 'geometric' && !(Math.abs(d) < 1)
      ? `The ratio r = ${d} is not between −1 and 1, so the series has no sum.`
      : undefined;
  return { terms, sums, limit, problem };
}
