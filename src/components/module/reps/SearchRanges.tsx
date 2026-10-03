/**
 * HC187's calculator picture (`dataStructure`, SearchSpec in typesHe4n.ts): searching a sorted
 * array of n. Binary search's worst case is drawn as one bar per comparison, each as long as
 * the range still left before it (n, ⌊n/2⌋, … 1, to scale), up to 12 bars then “…” and the
 * last; the count ⌊log₂n⌋ + 1 is bracketed beside them. Above, linear search's worst case is a
 * bar of n comparisons, with its average (n + 1)/2 marked. Flat.
 */
import Svg, { G, Line, Rect } from 'react-native-svg';

import type { SearchSpec } from '@/data/modules/typesHe4n';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { useReader, VBracket } from './he3dKit';
import { worstRanges } from './he4nMath';

/** A number with its digits written out (500,000,000.5, never 5 × 10⁸). */
const plain = (x: number) => x.toLocaleString('en-US', { maximumFractionDigits: 1 });

const ROW = 18;
const MAX_ROWS = 12;
const TOP = 62;

/** The bars drawn: every range up to 12, else the first 11, a gap and the last. */
export function searchRows(n: number): (number | 'gap')[] {
  const r = worstRanges(n);
  return r.length <= MAX_ROWS ? r : [...r.slice(0, MAX_ROWS - 1), 'gap', r[r.length - 1]!];
}

export function SearchRanges({ spec, calc }: { spec: SearchSpec; calc: Calculator }) {
  const r = useReader(calc);
  const raw = r.get(spec.n);
  const n = raw === undefined ? undefined : Math.floor(raw);
  const ok = n !== undefined && n >= 1;
  const parts: string[] = [];
  if (ok) {
    const b = worstRanges(n).length;
    parts.push(
      `Binary search: ⌊log₂ ${formatNumber(n)}⌋ + 1 = ${formatNumber(b)} comparisons at most, one per halving.`,
    );
    parts.push(`Linear search: up to ${formatNumber(n)}, ${plain((n + 1) / 2)} on average.`);
  }
  const rows = ok ? searchRows(n) : [];
  const h = TOP + rows.length * ROW + 12;
  return (
    <>
      {ok ? (
        <Canvas aspect={(w) => h / w}>
          {({ w }) => (
            <Svg width={w} height={h}>
              <Bars n={n} rows={rows} w={w} />
            </Svg>
          )}
        </Canvas>
      ) : null}
      {parts.length ? <Caption>{parts.join(' ')}</Caption> : null}
    </>
  );
}

function Bars({ n, rows, w }: { n: number; rows: (number | 'gap')[]; w: number }) {
  const c = usePalette();
  const x0 = 70;
  const x1 = w - 12;
  const sx = (m: number) => ((x1 - x0) * m) / n;
  const avg = (n + 1) / 2;
  const count = worstRanges(n).length;
  return (
    <G>
      <ChartText
        x={x0 - 8}
        y={24}
        textAnchor="end"
        fontSize={chart.label}
        fontWeight="700"
        fill={c.chartInk}
      >
        linear
      </ChartText>
      <Rect
        x={x0}
        y={12}
        width={x1 - x0}
        height={16}
        rx={3}
        fill={c.chartFill}
        stroke={c.chartInk}
        strokeWidth={1}
      />
      <Line
        x1={x0 + sx(avg)}
        y1={8}
        x2={x0 + sx(avg)}
        y2={32}
        stroke={c.chartInk}
        strokeWidth={chart.stroke}
        strokeDasharray={chart.dashFine}
      />
      <ChartText
        x={x0 + sx(avg)}
        y={46}
        textAnchor="middle"
        fontSize={chart.label}
        fill={c.chartMuted}
      >
        {`average ${plain(avg)}`}
      </ChartText>
      <ChartText
        x={x1 - 4}
        y={24}
        textAnchor="end"
        fontSize={chart.label}
        fontWeight="700"
        fill={c.chartInk}
      >
        {formatNumber(n)}
      </ChartText>
      {rows.map((m, i) => {
        const y = TOP + i * ROW;
        if (m === 'gap')
          return (
            <ChartText key={i} x={x0 + 4} y={y + 12} fontSize={chart.label} fill={c.chartMuted}>
              …
            </ChartText>
          );
        const bw = Math.max(2, sx(m));
        const last = i === rows.length - 1;
        const label = formatNumber(m);
        const inside = bw > label.length * 7.5 + 8;
        return (
          <G key={i}>
            <Rect
              x={x0}
              y={y}
              width={bw}
              height={ROW - 4}
              rx={2}
              fill={last ? c.chartHighlight : c.chartFill}
              stroke={last ? c.chartHighlight : c.chartInk}
              strokeWidth={1}
            />
            <ChartText
              x={inside ? x0 + 4 : x0 + bw + 4}
              y={y + 11}
              fontSize={chart.label}
              fontWeight={last ? '700' : '400'}
              fill={inside && last ? c.onChartHighlight : c.chartInk}
            >
              {label}
            </ChartText>
          </G>
        );
      })}
      <VBracket
        y1={TOP}
        y2={TOP + rows.length * ROW - 4}
        x={x0 - 8}
        side="left"
        label={formatNumber(count)}
        color={c.chartInk}
      />
      <ChartText
        x={x0 - 8}
        y={TOP - 6}
        textAnchor="end"
        fontSize={chart.label}
        fontWeight="700"
        fill={c.chartInk}
      >
        binary
      </ChartText>
    </G>
  );
}
