/**
 * HC120 (a) `rockLayers` `ranges` (RockRangesSpec in typesHe4f.ts): index fossils' ranges as
 * bars on an age axis (Ma, younger up) beside a rock column, their overlap shaded across the
 * column and bracketed: a bed holding every fossil formed in that window. Ranges that never
 * overlap draw no window and say so. The column is painted; the bars flat. No handles.
 */
import { View } from 'react-native';
import Svg, { Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { RockRangesSpec } from '@/data/modules/typesHe4f';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { fossilWindow } from './he4fMath';
import { TopLight, url, usePaintIds } from './paint';

const BW = 360;
const TOP = 40;
const PH = 240;
const BASE = TOP + PH;
const AX = 70;
const COL0 = 76;
const COL1 = 126;
const BAR0 = 160;
const BAR_STEP = 46;

const nf = (x: number) => formatNumber(Number(x.toPrecision(4)));

/** A round tick step for a span: 1, 2 or 5 × 10ⁿ, about `count` ticks. */
function niceStep(span: number, count: number) {
  const raw = span / count;
  const e = 10 ** Math.floor(Math.log10(raw));
  const m = raw / e;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * e;
}

export function RockRanges({ spec, calc }: { spec: RockRangesSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('light');
  type V = number | string | undefined;
  const known = (v: V) => v !== undefined && (typeof v === 'number' || rep.known(v));
  const get = (v: V): number | undefined =>
    !known(v) ? undefined : typeof v === 'number' ? v : rep.val(v as string);
  const ranges = spec.ranges.map((r) => ({ name: r.name, first: get(r.first), last: get(r.last) }));
  const all = ranges.every((r) => r.first !== undefined && r.last !== undefined);
  const win = all
    ? fossilWindow(ranges.map((r) => [r.first!, r.last!] as [number, number]))
    : undefined;
  const ages = ranges.flatMap((r) => [r.first, r.last]).filter((x): x is number => x !== undefined);
  const lo0 = ages.length ? Math.min(...ages) : 0;
  const hi0 = ages.length ? Math.max(...ages) : 100;
  const pad = Math.max(1, (hi0 - lo0) * 0.12);
  const step = niceStep(hi0 - lo0 + 2 * pad, 6);
  const lo = Math.max(0, Math.floor((lo0 - pad) / step) * step);
  const hi = Math.ceil((hi0 + pad) / step) * step;
  const Y = (age: number) => TOP + (PH * (age - lo)) / (hi - lo);
  const ticks: number[] = [];
  for (let a = lo; a <= hi + 1e-9; a += step) ticks.push(Number(a.toPrecision(10)));
  const right = BAR0 + BAR_STEP * (ranges.length - 1) + 22;
  const height = BASE + 46;
  // The column's beds: alternating rocks, about 6 to the column.
  const beds = Array.from({ length: 7 }, (_, i) => i);
  const bedFill = [c.rock1, c.rock2, c.rock3, c.rock4, c.rock2, c.rock1, c.rock3];

  const lines: string[] = [];
  if (!all) lines.push('Type each fossil’s first and last appearance to find the window.');
  else if (ranges.some((r) => r.first! < r.last!))
    lines.push('A fossil’s first appearance must be older (more Ma) than its last.');
  else if (!win) lines.push('These fossils never lived at the same time: no bed holds them all.');
  else {
    const sayOr = (v: V, x: number) =>
      typeof v === 'string' && known(v) ? rep.value(v, false) : nf(x);
    lines.push(
      `Oldest = the youngest first appearance = ${sayOr(spec.oldest, win.oldest)} Ma. Youngest = the oldest last appearance = ${sayOr(spec.youngest, win.youngest)} Ma.`,
      `The bed formed in a ${sayOr(spec.window, win.oldest - win.youngest)}-Myr window.`,
    );
  }

  return (
    <View>
      <Canvas aspect={height / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <TopLight id={ids.light} strength={0.7} />
            </Defs>
            <G transform={`scale(${w / BW})`}>
              {/* The rock column. */}
              {beds.map((i) => (
                <Rect
                  key={i}
                  x={COL0}
                  y={TOP + (PH * i) / beds.length}
                  width={COL1 - COL0}
                  height={PH / beds.length}
                  fill={bedFill[i]}
                  stroke={c.chartInk}
                  strokeWidth={0.6}
                />
              ))}
              <Rect x={COL0} y={TOP} width={COL1 - COL0} height={PH} fill={url(ids.light)} />
              <ChartText x={(COL0 + COL1) / 2} y={TOP - 10} textAnchor="middle" fill={c.chartMuted}>
                rocks
              </ChartText>
              {/* The window, shaded across the column and the bars. */}
              {win ? (
                <G>
                  <Rect
                    x={COL0}
                    y={Y(win.youngest)}
                    width={right - COL0}
                    height={Math.max(1.5, Y(win.oldest) - Y(win.youngest))}
                    fill={c.chartHighlight}
                    fillOpacity={0.2}
                    stroke={c.chartHighlight}
                    strokeWidth={1}
                    strokeDasharray={chart.dashFine}
                  />
                  <Path
                    d={`M${right + 4},${Y(win.youngest)} h6 V${Y(win.oldest)} h-6`}
                    fill="none"
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                  />
                  <ChartText
                    x={right + 14}
                    y={(Y(win.youngest) + Y(win.oldest)) / 2 + 4}
                    fontWeight="700"
                    fill={c.chartHighlight}
                  >
                    {`${nf(win.oldest - win.youngest)} Myr`}
                  </ChartText>
                </G>
              ) : null}
              {/* The age axis. */}
              <Line x1={AX} y1={TOP} x2={AX} y2={BASE} stroke={c.chartInk} strokeWidth={1.2} />
              {ticks.map((a) => (
                <G key={a}>
                  <Line x1={AX - 4} y1={Y(a)} x2={AX} y2={Y(a)} stroke={c.chartInk} />
                  <ChartText x={AX - 7} y={Y(a) + 4} textAnchor="end" fill={c.chartMuted}>
                    {nf(a)}
                  </ChartText>
                </G>
              ))}
              <ChartText x={AX - 7} y={TOP - 10} textAnchor="end" fontWeight="700">
                Ma
              </ChartText>
              <ChartText x={AX - 7} y={BASE + 18} textAnchor="end" fill={c.chartMuted}>
                older ↓
              </ChartText>
              {/* The ranges. */}
              {ranges.map((r, i) => {
                const x = BAR0 + BAR_STEP * i;
                const has = r.first !== undefined && r.last !== undefined && r.first >= r.last;
                return (
                  <G key={r.name}>
                    {has ? (
                      <G>
                        <Rect
                          x={x - 7}
                          y={Y(r.last!)}
                          width={14}
                          height={Math.max(2, Y(r.first!) - Y(r.last!))}
                          rx={7}
                          fill={c.he4fRange}
                          stroke={c.chartInk}
                          strokeWidth={1}
                        />
                        <ChartText x={x} y={Y(r.last!) - 6} textAnchor="middle" fill={c.chartInk}>
                          {nf(r.last!)}
                        </ChartText>
                        <ChartText x={x} y={Y(r.first!) + 15} textAnchor="middle" fill={c.chartInk}>
                          {nf(r.first!)}
                        </ChartText>
                      </G>
                    ) : null}
                    <ChartText
                      {...fitLabel(x, r.name, chart.label, BW)}
                      y={i % 2 ? TOP - 10 : TOP - 24}
                      fontWeight="700"
                    >
                      {r.name}
                    </ChartText>
                  </G>
                );
              })}
              {win ? (
                <ChartText x={COL0} y={BASE + 36} fontWeight="700" fill={c.chartHighlight}>
                  {`Window: ${nf(win.oldest)} to ${nf(win.youngest)} Ma`}
                </ChartText>
              ) : null}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
