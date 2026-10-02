/**
 * HC66 (college round 3, group C): what a `termsChart` on a series page adds — the caption's
 * lines, the series' sum, aₙ₊₁ as the second lit term, and the band low ≤ S ≤ high shaded
 * across the chart. TermsChart.tsx calls this in a line or two; off unless a page sets an option.
 */
import type { ReactNode } from 'react';
import { G, Line, Rect } from 'react-native-svg';

import type { TermsChartSpec } from '@/data/modules/typesHsb';
import { chart, usePalette } from '@/theme';

import type { TermsModel } from './termsModel';
import { extraHe3c, isSeriesHe3c, seriesLinesHe3c, sumHe3c } from './termsSeriesHe3c';

export function useSeriesHe3c(
  spec: TermsChartSpec,
  get: (v: number | string | undefined) => number | undefined,
  known: (v: number | string | undefined) => boolean,
  a: number,
  d: number,
  model: TermsModel,
) {
  const c = usePalette();
  const on = isSeriesHe3c(spec);
  const n = model.count;
  const limit = on && spec.limit ? sumHe3c(spec, a, d) : undefined;
  const second = on && extraHe3c(spec) && n && model.terms.length > n ? n : -1;
  // A "?" end draws no band.
  const [low, high] = [get(spec.bounds?.low), get(spec.bounds?.high)];
  const bandKnown =
    !!spec.bounds &&
    known(spec.bounds.low) &&
    known(spec.bounds.high) &&
    low !== undefined &&
    high !== undefined;
  const lines =
    on && n
      ? seriesLinesHe3c(
          spec,
          a,
          d,
          n,
          model.terms,
          model.sums,
          bandKnown ? { low: low!, high: high! } : undefined,
          limit,
        )
      : [];
  const values = bandKnown ? [low!, high!] : [];

  /** The band across the chart, at least 3 px tall so a tight one still shows. */
  const band = (x1: number, x2: number, sy: (y: number) => number): ReactNode => {
    if (!bandKnown) return null;
    const [top, bottom] = [sy(Math.max(low!, high!)), sy(Math.min(low!, high!))];
    const mid = (top + bottom) / 2;
    const [y1, y2] = bottom - top < 3 ? [mid - 1.5, mid + 1.5] : [top, bottom];
    return (
      <G>
        <Rect
          x={x1}
          y={y1}
          width={x2 - x1}
          height={y2 - y1}
          fill={c.chartHighlight}
          fillOpacity={0.18}
        />
        {[y1, y2].map((y, i) => (
          <Line
            key={i}
            x1={x1}
            y1={y}
            x2={x2}
            y2={y}
            stroke={c.chartHighlight}
            strokeWidth={1}
            strokeDasharray={chart.dashFine}
          />
        ))}
      </G>
    );
  };
  return { on, lines, limit, second, values, band };
}
