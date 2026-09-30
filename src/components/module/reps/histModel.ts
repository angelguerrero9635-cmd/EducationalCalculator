/**
 * What a `histogram` picture draws, worked out from its values: the bars (bins of data or
 * counts, or the bars of a probability distribution), their total, the mean, the median and the
 * shape word. Shared by the picture (`Histogram.tsx`) and the harness.
 */
import type { HistogramSpec } from '@/data/modules/typesHsb';

import { binomialPmf } from './statMath';

export interface Bar {
  /** A bin's ends, or a probability bar's value (lo = hi = k). */
  lo: number;
  hi: number;
  h: number;
  /** The variable the bar's height is (it drags), for counts and probabilities. */
  id?: string;
}

export interface HistModel {
  mode: 'count' | 'probability';
  bars: Bar[];
  /** The data count (count mode) or the total probability. */
  total: number;
  /** Data values outside the bins (left out of the bars). */
  outside: number;
  n?: number;
  mean?: number;
  /** The mean is estimated from bin midpoints (counts only). */
  estimated?: boolean;
  median?: number;
  sd?: number;
  shape?: string;
  problem?: string;
}

type Val = (v: number | string | undefined) => number | undefined;

const medianOf = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2]! : (s[n / 2 - 1]! + s[n / 2]!) / 2;
};

/** The shape of a set of bar heights, in the words a textbook uses. */
export function shapeOf(bars: Bar[], mean?: number, median?: number, sd?: number): string {
  const hs = bars.map((b) => b.h);
  const top = Math.max(...hs);
  if (!(top > 0) || hs.length < 3) return 'too few bars to name a shape';
  if (hs.every((h) => h >= top * 0.75)) return 'uniform (roughly flat)';
  // Two peaks, each at least 60% of the tallest, with a dip under 60% of the lower between.
  const peaks = hs
    .map((h, i) => ({ h, i }))
    .filter(({ h, i }) => h >= top * 0.6 && h >= (hs[i - 1] ?? -1) && h > (hs[i + 1] ?? -1));
  for (let a = 0; a < peaks.length; a++)
    for (let b = a + 1; b < peaks.length; b++) {
      const [p, q] = [peaks[a]!, peaks[b]!];
      const dip = Math.min(...hs.slice(p.i + 1, q.i));
      if (q.i - p.i >= 2 && dip < Math.min(p.h, q.h) * 0.6) return 'bimodal (two peaks)';
    }
  if (mean !== undefined && sd !== undefined && sd > 0) {
    // Pearson's second skewness, 3 (mean − median) ÷ SD, or the lean of the bars.
    const skew =
      median !== undefined
        ? (3 * (mean - median)) / sd
        : bars.reduce((t, b) => t + b.h * ((b.lo + b.hi) / 2 - mean) ** 3, 0) /
          (bars.reduce((t, b) => t + b.h, 0) * sd ** 3);
    if (skew > 0.4) return 'skewed right (a long tail to the right)';
    if (skew < -0.4) return 'skewed left (a long tail to the left)';
  }
  return 'roughly symmetric';
}

export function histModel(spec: HistogramSpec, val: Val): HistModel {
  if (spec.binomial || spec.probability) {
    let bars: Bar[] = [];
    if (spec.binomial) {
      const n = Math.round(val(spec.binomial.n) ?? 0);
      const p = val(spec.binomial.p) ?? 0.5;
      if (n < 1 || n > 40)
        return {
          mode: 'probability',
          bars,
          total: 0,
          outside: 0,
          problem: `n = ${n} is outside 1 to 40.`,
        };
      if (!(p >= 0 && p <= 1))
        return {
          mode: 'probability',
          bars,
          total: 0,
          outside: 0,
          problem: `p = ${p} is not between 0 and 1.`,
        };
      bars = Array.from({ length: n + 1 }, (_, k) => ({ lo: k, hi: k, h: binomialPmf(n, p, k) }));
      const total = bars.reduce((t, b) => t + b.h, 0);
      return {
        mode: 'probability',
        bars,
        total,
        outside: 0,
        mean: n * p,
        sd: Math.sqrt(n * p * (1 - p)),
        shape: shapeOf(bars, n * p, undefined, Math.sqrt(n * p * (1 - p))),
      };
    }
    const pr = spec.probability!;
    bars = pr.values.map((k, i) => {
      const id = pr.probs[i];
      return {
        lo: val(k) ?? i,
        hi: val(k) ?? i,
        h: val(id) ?? 0,
        id: typeof id === 'string' ? id : undefined,
      };
    });
    const total = bars.reduce((t, b) => t + b.h, 0);
    const mean = bars.reduce((t, b) => t + b.lo * b.h, 0);
    const sd = Math.sqrt(
      Math.max(
        0,
        bars.reduce((t, b) => t + (b.lo - mean) ** 2 * b.h, 0),
      ),
    );
    const problem = bars.some((b) => b.h < 0 || b.h > 1)
      ? 'A probability is outside 0 to 1.'
      : Math.abs(total - 1) > 1e-6
        ? `The probabilities add to ${Number(total.toFixed(4))}, not 1.`
        : undefined;
    return {
      mode: 'probability',
      bars,
      total,
      outside: 0,
      mean,
      sd,
      problem,
      shape: shapeOf(bars, mean, undefined, sd),
    };
  }
  const width = val(spec.width) ?? 1;
  const start = val(spec.start) ?? 0;
  if (!(width > 0))
    return {
      mode: 'count',
      bars: [],
      total: 0,
      outside: 0,
      problem: 'The bin width must be more than 0.',
    };
  if (spec.counts) {
    const bars = spec.counts.map((c, i) => ({
      lo: start + i * width,
      hi: start + (i + 1) * width,
      h: val(c) ?? 0,
      id: typeof c === 'string' ? c : undefined,
    }));
    const n = bars.reduce((t, b) => t + b.h, 0);
    const mean = n > 0 ? bars.reduce((t, b) => t + ((b.lo + b.hi) / 2) * b.h, 0) / n : undefined;
    const sd =
      mean !== undefined
        ? Math.sqrt(bars.reduce((t, b) => t + ((b.lo + b.hi) / 2 - mean) ** 2 * b.h, 0) / n)
        : undefined;
    return {
      mode: 'count',
      bars,
      total: n,
      n,
      outside: 0,
      mean,
      estimated: true,
      sd,
      shape: shapeOf(bars, mean, undefined, sd),
    };
  }
  const data = (spec.data ?? []).map((d) => val(d)).filter((x): x is number => x !== undefined);
  const hiData = Math.max(start + width, ...data);
  const end = val(spec.end) ?? start + Math.ceil((hiData - start) / width + 1e-9) * width;
  const k = Math.max(1, Math.round((end - start) / width));
  if (k > 30)
    return {
      mode: 'count',
      bars: [],
      total: 0,
      outside: 0,
      problem: `${k} bins are too many to draw (30 fit).`,
    };
  const bars: Bar[] = Array.from({ length: k }, (_, i) => ({
    lo: start + i * width,
    hi: start + (i + 1) * width,
    h: 0,
  }));
  let outside = 0;
  for (const x of data) {
    const i = Math.floor((x - start) / width + 1e-9);
    if (i < 0 || i >= k) outside++;
    else bars[i]!.h++;
  }
  const n = data.length;
  const mean = n ? data.reduce((t, x) => t + x, 0) / n : undefined;
  const median = n ? medianOf(data) : undefined;
  const sd =
    mean !== undefined ? Math.sqrt(data.reduce((t, x) => t + (x - mean) ** 2, 0) / n) : undefined;
  return {
    mode: 'count',
    bars,
    total: n - outside,
    n,
    outside,
    mean,
    median,
    sd,
    shape: shapeOf(bars, mean, median, sd),
  };
}
