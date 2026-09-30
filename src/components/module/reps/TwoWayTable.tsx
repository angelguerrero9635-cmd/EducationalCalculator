import { View } from 'react-native';
import Svg, { G, Line, Rect } from 'react-native-svg';

import type { TwoWaySpec } from '@/data/modules/typesHse';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { reader } from './graphKit';
import { chiSquare, expectedCounts, twoPlaces } from './stats';

const ROW = 34;
const HEAD = 32;
const BAR = 22;

/** A number to two places at most. */
const fmt = (x: number) => formatNumber(Number(x.toFixed(2)));
/** "= 0.6" or "≈ 0.33". */
const approx = (x: number) => {
  const t = twoPlaces(x);
  return `${t.exact ? '=' : '≈'} ${formatNumber(t.value)}`;
};

/**
 * A two-way frequency table (H20), flat: the counts by row and column category with the row,
 * column and grand totals. A lit cell, row or column shows its relative frequency, of the
 * grand total or (conditional) of its row or column, the whole outlined. A segmented bar per
 * row (or column) splits it by the other categories in percents, with a key. For chi-square,
 * each cell's expected count sits under its observed count, and the caption works χ².
 */
export function TwoWayTable({ spec, calc }: { spec: TwoWaySpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const R = spec.rows.length;
  const C = spec.cols.length;
  const cells = spec.cells.map((r) => r.map(read));
  const known = cells.flat().every((x) => x.known);
  const n = cells.map((r) => r.map((x) => x.value));
  const rowT = n.map((r) => r.reduce((a, b) => a + b, 0));
  const colT = Array.from({ length: C }, (_, j) => n.reduce((a, r) => a + (r[j] ?? 0), 0));
  const all = rowT.reduce((a, b) => a + b, 0);
  const totals = spec.totals !== false;
  // One row (goodness of fit): its row total is the grand total, so no totals row.
  const totalsRow = totals && R > 1;
  const lit = spec.lit;
  const of = spec.of ?? 'total';
  const litCell = lit?.row !== undefined && lit.col !== undefined;
  const expected =
    spec.expected === 'independence'
      ? expectedCounts(n)
      : spec.expected
        ? spec.expected.map((r) => r.map((x) => read(x).value))
        : undefined;
  const expectedKnown =
    !!spec.expected &&
    (spec.expected === 'independence' || spec.expected.flat().every((x) => read(x).known));
  const segColors = [c.chartHighlight, c.chartSecond, c.lineSum, c.hopBack, c.chartMuted];
  const barOf = spec.bar;
  const bars = barOf === 'cols' ? C : barOf === 'rows' ? R : 0;
  const parts = barOf === 'cols' ? R : C;
  const partNames = barOf === 'cols' ? spec.rows : spec.cols;

  // The lit part and its whole: "P(Sport | Grade 9) = 36/60 = 0.6".
  const litText = (() => {
    if (!lit || !known) return undefined;
    const { row, col } = lit;
    const part = litCell ? n[row!]![col!]! : row !== undefined ? rowT[row]! : colT[col!]!;
    const whole = of === 'row' ? rowT[row!]! : of === 'col' ? colT[col!]! : all;
    const rName = row !== undefined ? spec.rows[row] : undefined;
    const cName = col !== undefined ? spec.cols[col] : undefined;
    const event =
      of === 'row'
        ? `${cName} | ${rName}`
        : of === 'col'
          ? `${rName} | ${cName}`
          : [rName, cName].filter(Boolean).join(' and ');
    const kind = of === 'total' ? (litCell ? 'Joint' : 'Marginal') : 'Conditional';
    const value = whole ? part / whole : NaN;
    return `${kind} relative frequency: P(${event}) = ${fmt(part)}/${fmt(whole)} ${approx(value)}${
      of !== 'total' ? `, out of the ${of === 'row' ? rName : cName} total only` : ''
    }`;
  })();

  const chiText = (() => {
    if (!expected || !known || !expectedKnown) return [];
    if (expected.flat().some((e) => !(e > 0))) return ['Every expected count must be more than 0.'];
    const x = chiSquare(n, expected);
    const e0 = expected[0]![0]!;
    const first =
      spec.expected === 'independence'
        ? `Expected = row total × column total ÷ grand total: ${fmt(rowT[0]!)} × ${fmt(colT[0]!)} ÷ ${fmt(all)} ${approx(e0)}`
        : 'Expected counts come from the claimed proportions';
    return [
      first,
      `χ² = Σ (observed − expected)² ÷ expected = (${fmt(n[0]![0]!)} − ${fmt(e0)})² ÷ ${fmt(e0)} + … ${approx(x)}`,
      `${R > 1 && C > 1 ? `Degrees of freedom (${R} − 1) × (${C} − 1) = ${(R - 1) * (C - 1)}` : `Degrees of freedom ${Math.max(R, C)} − 1 = ${Math.max(R, C) - 1}`}`,
    ];
  })();

  const tableH = HEAD + (R + (totalsRow ? 1 : 0)) * ROW;
  const barH = bars ? 26 + bars * (BAR + 22) + 24 : 0;

  return (
    <View>
      <Canvas aspect={(w) => (tableH + barH + 8) / w}>
        {({ w, h }) => {
          const nameW = Math.min(w * 0.3, 118);
          const cols = C + (totals ? 1 : 0);
          const colW = (w - nameW - 4) / cols;
          const x0 = 2;
          const cx = (j: number) => x0 + nameW + j * colW;
          const ry = (i: number) => HEAD + i * ROW;
          const inLitRow = (i: number) => lit?.row === i && (!litCell || of === 'row');
          const inLitCol = (j: number) => lit?.col === j && (!litCell || of === 'col');
          const cellFill = (i: number, j: number) =>
            litCell && lit!.row === i && lit!.col === j
              ? c.chartHighlight
              : inLitRow(i) || inLitCol(j)
                ? c.accentSoft
                : 'none';
          const nameSize = (s: string, room: number) =>
            s.length * chart.label * 0.58 > room ? chart.small : chart.label;
          const barTop = tableH + 26;
          const segW = w - 8;
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.45}>
              {/* The header: the column categories, then Total. */}
              <Rect x={x0} y={0} width={w - 4} height={HEAD} fill={c.chartSurface} />
              {[...spec.cols, ...(totals ? ['Total'] : [])].map((name, j) => (
                <ChartText
                  key={`h${j}`}
                  x={cx(j) + colW / 2}
                  y={HEAD / 2 + 5}
                  fontSize={nameSize(name, colW - 6)}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {name}
                </ChartText>
              ))}
              {/* Rows: the category, its counts, its total; then the totals row. */}
              {[...spec.rows, ...(totalsRow ? ['Total'] : [])].map((name, i) => {
                const totalRow = i === R;
                return (
                  <G key={`r${i}`}>
                    {totalRow ? (
                      <Rect x={x0} y={ry(i)} width={w - 4} height={ROW} fill={c.chartSurface} />
                    ) : null}
                    <ChartText
                      x={x0 + 6}
                      y={ry(i) + ROW / 2 + 5}
                      fontSize={nameSize(name, nameW - 10)}
                      fontWeight="700"
                    >
                      {name}
                    </ChartText>
                    {Array.from({ length: cols }, (_, j) => {
                      const totalCol = j === C;
                      const v = totalRow
                        ? totalCol
                          ? all
                          : colT[j]!
                        : totalCol
                          ? rowT[i]!
                          : n[i]![j]!;
                      const hot = !totalRow && !totalCol && cellFill(i, j) === c.chartHighlight;
                      const soft =
                        (!totalRow && inLitRow(i)) ||
                        (!totalCol && inLitCol(j) && (!totalRow || !litCell));
                      const e = !totalRow && !totalCol && expected ? expected[i]![j]! : undefined;
                      const cellKnown = totalRow || totalCol || cells[i]![j]!.known;
                      return (
                        <G key={`c${i}-${j}`}>
                          {hot || soft ? (
                            <Rect
                              x={cx(j) + 1}
                              y={ry(i) + 1}
                              width={colW - 2}
                              height={ROW - 2}
                              fill={hot ? c.chartHighlight : c.accentSoft}
                            />
                          ) : null}
                          <ChartText
                            x={cx(j) + colW / 2}
                            y={ry(i) + (e !== undefined ? ROW / 2 : ROW / 2 + 5)}
                            fontSize={chart.value}
                            fontWeight={totalRow || totalCol || hot ? '700' : '400'}
                            fill={hot ? c.onChartHighlight : c.chartInk}
                            textAnchor="middle"
                          >
                            {cellKnown ? fmt(v) : '?'}
                          </ChartText>
                          {e !== undefined && expectedKnown ? (
                            <ChartText
                              x={cx(j) + colW / 2}
                              y={ry(i) + ROW - 5}
                              fontSize={chart.label}
                              fill={hot ? c.onChartHighlight : c.chartMuted}
                              textAnchor="middle"
                            >
                              {`(${fmt(e)})`}
                            </ChartText>
                          ) : null}
                        </G>
                      );
                    })}
                  </G>
                );
              })}
              {/* Grid lines, the totals set off by a heavier rule. */}
              {Array.from({ length: R + (totalsRow ? 1 : 0) + 2 }, (_, i) => {
                const y = i === 0 ? 0 : ry(i - 1);
                return (
                  <Line
                    key={`gy${i}`}
                    x1={x0}
                    y1={y}
                    x2={w - 2}
                    y2={y}
                    stroke={totalsRow && i === R + 1 ? c.chartInk : c.chartGrid}
                    strokeWidth={totalsRow && i === R + 1 ? chart.strokeLight : 1}
                  />
                );
              })}
              {[x0, ...Array.from({ length: cols + 1 }, (_, j) => cx(j))].map((x, j) => (
                <Line
                  key={`gx${j}`}
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={tableH}
                  stroke={totals && j === C + 1 ? c.chartInk : c.chartGrid}
                  strokeWidth={totals && j === C + 1 ? chart.strokeLight : 1}
                />
              ))}
              {/* The whole the lit frequency is out of, outlined. */}
              {lit && known ? (
                <Rect
                  x={of === 'row' ? x0 : of === 'col' ? cx(lit.col!) : totals ? cx(C) : x0}
                  y={
                    of === 'row'
                      ? ry(lit.row!)
                      : of === 'col'
                        ? HEAD
                        : totals
                          ? ry(totalsRow ? R : 0)
                          : HEAD
                  }
                  width={of === 'row' ? w - 4 : of === 'col' || totals ? colW : w - 4}
                  height={of === 'row' || (of === 'total' && totals) ? ROW : tableH - HEAD}
                  fill="none"
                  stroke={c.chartHighlight}
                  strokeWidth={chart.stroke}
                />
              ) : null}
              {/* Segmented bars: each row (or column) as 100 %, split by the other categories. */}
              {bars ? (
                <G>
                  <ChartText x={4} y={tableH + 18} fontSize={chart.label} fontWeight="700">
                    {`Each ${barOf === 'cols' ? 'column' : 'row'} as 100%`}
                  </ChartText>
                  {Array.from({ length: bars }, (_, k) => {
                    const counts = Array.from({ length: parts }, (_, p) =>
                      barOf === 'cols' ? n[p]![k]! : n[k]![p]!,
                    );
                    const whole = counts.reduce((a, b) => a + b, 0);
                    const top = barTop + k * (BAR + 22);
                    let at = 4;
                    return (
                      <G key={`b${k}`}>
                        <ChartText x={4} y={top + 12} fontSize={chart.label}>
                          {barOf === 'cols' ? spec.cols[k] : spec.rows[k]}
                        </ChartText>
                        {counts.map((v, p) => {
                          const width = whole ? (v / whole) * segW : 0;
                          const left = at;
                          at += width;
                          const pct = whole ? (100 * v) / whole : 0;
                          const text = `${formatNumber(Math.round(pct))}%`;
                          return (
                            <G key={`s${p}`}>
                              <Rect
                                x={left}
                                y={top + 16}
                                width={Math.max(0, width)}
                                height={BAR}
                                fill={segColors[p % segColors.length]}
                                opacity={p === 1 ? 0.85 : 1}
                              />
                              {width > text.length * chart.label * 0.6 + 6 ? (
                                <ChartText
                                  x={left + width / 2}
                                  y={top + 16 + BAR / 2 + 4}
                                  fontSize={chart.label}
                                  fontWeight="700"
                                  fill={p === 1 ? c.chartInk : c.onChartHighlight}
                                  textAnchor="middle"
                                >
                                  {text}
                                </ChartText>
                              ) : null}
                            </G>
                          );
                        })}
                      </G>
                    );
                  })}
                  {/* The key: one swatch per part. */}
                  {(() => {
                    let at = 4;
                    const y = barTop + bars * (BAR + 22) + 8;
                    return partNames.map((name, p) => {
                      const left = at;
                      at += 16 + name.length * chart.label * 0.58 + 14;
                      return (
                        <G key={`k${p}`}>
                          <Rect
                            x={left}
                            y={y - 10}
                            width={12}
                            height={12}
                            rx={2}
                            fill={segColors[p % segColors.length]}
                          />
                          <ChartText
                            {...fitLabel(left + 16, name, chart.label, w, 'start')}
                            y={y}
                            fontSize={chart.label}
                          >
                            {name}
                          </ChartText>
                        </G>
                      );
                    });
                  })()}
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          known
            ? `${fmt(all)} in all${R > 1 && C > 1 ? `: ${spec.rows.map((r, i) => `${r} ${fmt(rowT[i]!)}`).join(', ')}` : ''}`
            : 'Type every count to fill the table.',
          ...(litText ? [litText] : []),
          ...(expected && expectedKnown
            ? ['Expected counts are in brackets under the observed']
            : []),
          ...chiText,
        ].join(' · ')}
      </Caption>
    </View>
  );
}
