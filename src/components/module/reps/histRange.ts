/**
 * H99: a range of `histogram` bars lit (`range: { from?, to? }`), and their sum: probability
 * bars by their values k ("P(X ≥ 4) = P(4) + P(5)"), or bins of counts by their numbers.
 * Shared by the picture (`Histogram.tsx`) and the harness.
 */
import type { HistogramSpec } from '@/data/modules/typesHsb';
import { formatNumber } from '@/engine/format';

import type { HistModel } from './histModel';

const num = (x: number) => formatNumber(Number(x.toFixed(4)));

/**
 * Decimals for probability bars' labels, and for the caption's terms so the two read the same:
 * 4 (as the steps write them) for up to 6 bars, then 3, then 2 when the bars crowd.
 */
export const probDecimals = (bars: number) => (bars <= 6 ? 4 : bars <= 8 ? 3 : 2);

export interface HistRange {
  /** The bar indices lit. */
  lit: number[];
  sum: number;
  caption: string;
}

export function rangeOf(
  spec: HistogramSpec,
  model: HistModel,
  get: (v: number | string | undefined) => number | undefined,
  prob: boolean,
): HistRange | undefined {
  if (!spec.range) return undefined;
  const from = get(spec.range.from);
  const to = get(spec.range.to);
  const inside = (x: number) =>
    (from === undefined || x >= from - 1e-9) && (to === undefined || x <= to + 1e-9);
  const lit = model.bars.flatMap((b, i) => (inside(prob ? b.lo : i + 1) ? [i] : []));
  const sum = lit.reduce((s, i) => s + model.bars[i]!.h, 0);
  if (prob) {
    const event =
      from !== undefined && to !== undefined
        ? from === to
          ? `X = ${num(from)}`
          : `${num(from)} ≤ X ≤ ${num(to)}`
        : from !== undefined
          ? `X ≥ ${num(from)}`
          : to !== undefined
            ? `X ≤ ${num(to)}`
            : 'any X';
    const terms = lit.map((i) => `P(${num(model.bars[i]!.lo)})`);
    const d = probDecimals(model.bars.length);
    const values = lit.map((i) => model.bars[i]!.h.toFixed(d));
    const caption = !lit.length
      ? `P(${event}) = 0: no bar is in the range.`
      : lit.length <= 6
        ? `P(${event}) = ${terms.join(' + ')} = ${values.join(' + ')} ${d < 4 && lit.length > 1 ? '≈' : '='} ${sum.toFixed(4)}, the lit bars.`
        : `P(${event}) = the sum of the ${lit.length} lit bars = ${sum.toFixed(4)}.`;
    return { lit, sum, caption };
  }
  const n = model.n ?? 0;
  const first = lit[0];
  const last = lit[lit.length - 1];
  const caption =
    first === undefined || last === undefined
      ? 'No bin is in the range.'
      : `Bins ${num(model.bars[first]!.lo)} to ${num(model.bars[last]!.hi)}: ${lit
          .map((i) => num(model.bars[i]!.h))
          .join(' + ')} = ${num(sum)}${n ? ` of ${num(n)}` : ''}.`;
  return { lit, sum, caption };
}
