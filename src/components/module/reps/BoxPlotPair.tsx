import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import {
  Canvas,
  Caption,
  ChartText,
  DragHandle,
  fitLabel,
  niceCeil,
  useFrozen,
  useRep,
} from './common';
import { fences as fencesOf } from './stats';

type Spec = Extract<Representation, { kind: 'boxPlot' }>;

const ROW = 70;
const NAMES = ['least', 'first quartile', 'median', 'third quartile', 'greatest'];

/**
 * Grades 9–12 box plots (H19): the 1.5 × IQR fences dashed, values past them drawn as outliers
 * with the whiskers stopping at the last values inside; or two box plots on one scale, each
 * named, to compare their centers and spreads. The data (when given) are dots above. Marks drag
 * where the five numbers are typed; with data they are read from it.
 */
export function BoxPlotPair({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const plots = [
    [spec.min, spec.q1, spec.median, spec.q3, spec.max],
    ...(spec.second
      ? [[spec.second.min, spec.second.q1, spec.second.median, spec.second.q3, spec.second.max]]
      : []),
  ];
  const vals = plots.map((ids) => ids.map((id) => rep.shown(id)));
  const known = plots.map((ids) => ids.every(rep.known));
  const n =
    spec.data && spec.count && rep.known(spec.count)
      ? Math.max(0, Math.min(spec.data.length, Math.round(rep.shown(spec.count))))
      : undefined;
  const used = spec.data ? (n !== undefined ? spec.data.slice(0, n) : spec.data) : [];
  const data = used.filter(rep.known).map((id) => rep.shown(id));
  const allData = spec.data !== undefined && data.length === used.length && data.length > 0;
  const [q1, q3] = [vals[0]![1]!, vals[0]![3]!];
  const f = spec.fences && known[0] ? fencesOf(q1, q3) : undefined;
  const past = (v: number) => !!f && (v < f.lower - 1e-9 || v > f.upper + 1e-9);
  // The first plot's outliers and whisker ends: from the data, or its least and greatest.
  const outliers = f
    ? allData
      ? data.filter(past)
      : [vals[0]![0]!, vals[0]![4]!].filter(past)
    : [];
  const inside = allData ? data.filter((v) => !past(v)) : [];
  const ends = plots.map((_, i) =>
    i === 0 && f && allData && inside.length
      ? [Math.min(...inside), Math.max(...inside)]
      : [vals[i]![0]!, vals[i]![4]!],
  );
  // Stacks of dots where values repeat.
  const levels = new Map<number, number>();
  const dots = data.map((v) => {
    const level = levels.get(v) ?? 0;
    levels.set(v, level + 1);
    return { v, level };
  });
  const band = spec.data ? 14 + Math.max(1, ...levels.values()) * 14 : 0;
  const fenceRow = f ? 22 : 0;
  const named = !!spec.labels;
  const H = 8 + band + fenceRow + plots.length * (ROW + (named ? 14 : 0)) + 36;
  const [lo0, hi0] = spec.range;
  const every = [...vals.flat(), ...data];
  const hiRaw = Math.max(hi0, ...every);
  const range = useFrozen<[number, number]>([
    Math.min(lo0, ...every),
    hiRaw > hi0 ? niceCeil(hiRaw) : hi0,
  ]);
  const [lo, hi] = range.value;
  const fmt = (v: number) => formatNumber(Number(v.toFixed(4)));
  const names = spec.labels ?? ['', ''];

  const caption = (() => {
    if (!known.every(Boolean)) return `Type the five numbers: ${NAMES.join(', ')}.`;
    const parts: string[] = [];
    if (f) {
      const iqr = q3 - q1;
      parts.push(
        `Interquartile range: ${fmt(q3)} − ${fmt(q1)} = ${fmt(iqr)}`,
        `1.5 × ${fmt(iqr)} = ${fmt(1.5 * iqr)}`,
        `Lower fence ${fmt(q1)} − ${fmt(1.5 * iqr)} = ${fmt(f.lower)}`,
        `Upper fence ${fmt(q3)} + ${fmt(1.5 * iqr)} = ${fmt(f.upper)}`,
        outliers.length
          ? `${outliers.map(fmt).join(' and ')} ${outliers.length === 1 ? 'is' : 'are'} past a fence: ${outliers.length === 1 ? 'an outlier' : 'outliers'}.${
              allData
                ? ` The whiskers stop at ${fmt(ends[0]![0]!)} and ${fmt(ends[0]![1]!)}, the last values inside.`
                : ''
            }`
          : 'No value is past a fence: no outliers.',
      );
    }
    if (spec.second) {
      const [a, b] = vals as [number[], number[]];
      const [ia, ib] = [a[3]! - a[1]!, b[3]! - b[1]!];
      const [na, nb] = [names[0] || 'The first', names[1] || 'the second'];
      parts.push(
        `${na}: median ${fmt(a[2]!)}, IQR ${fmt(ia)}`,
        `${nb}: median ${fmt(b[2]!)}, IQR ${fmt(ib)}`,
        a[2] === b[2]
          ? 'The medians are the same.'
          : `The medians differ by ${fmt(Math.abs(a[2]! - b[2]!))}: ${a[2]! > b[2]! ? na : nb}'s is higher.`,
        ia === ib
          ? 'Their middle halves are as wide: the same spread.'
          : `${ia > ib ? na : nb} has the wider middle half: more spread.`,
      );
    }
    return parts.join(' · ');
  })();

  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w, h }) => {
          const pad = 24;
          const unit = (w - 2 * pad) / (hi - lo || 1);
          const sx = (x: number) => pad + (x - lo) * unit;
          const yLine = h - 30;
          const rowTop = (i: number) =>
            8 + band + fenceRow + i * (ROW + (named ? 14 : 0)) + (named ? 14 : 0);
          const boxH = 28;
          const mid = (i: number) => rowTop(i) + boxH / 2 + 4;
          const step = niceCeil((hi - lo) / 8);
          const ticks: number[] = [];
          for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) ticks.push(t);
          const inView = (v: number) => v >= lo - 1e-9 && v <= hi + 1e-9;
          const width = (t: string) => t.length * chart.small * 0.6 + 6;
          return (
            <>
              <Svg width={w} height={h}>
                <Line
                  x1={pad - 6}
                  y1={yLine}
                  x2={w - pad + 6}
                  y2={yLine}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                {ticks.map((t) => (
                  <G key={`t${t}`}>
                    <Line
                      x1={sx(t)}
                      y1={yLine - 5}
                      x2={sx(t)}
                      y2={yLine + 5}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    <ChartText
                      x={sx(t)}
                      y={yLine + 18}
                      fontSize={chart.small}
                      fill={c.chartMuted}
                      textAnchor="middle"
                    >
                      {formatNumber(t)}
                    </ChartText>
                  </G>
                ))}
                {/* The data as dots, stacked where values repeat. */}
                {dots.map((d, i) => (
                  <Circle
                    key={`d${i}`}
                    cx={sx(d.v)}
                    cy={8 + band - 10 - d.level * 14}
                    r={4.5}
                    fill={c.chartInk}
                    opacity={allData ? 1 : 0.4}
                  />
                ))}
                {/* The fences, dashed through the first plot, their values over them. */}
                {f
                  ? [f.lower, f.upper].filter(inView).map((v) => (
                      <G key={`f${v}`}>
                        <Line
                          x1={sx(v)}
                          y1={8 + band + 16}
                          x2={sx(v)}
                          y2={rowTop(0) + boxH + 8}
                          stroke={c.hopBack}
                          strokeWidth={chart.strokeLight}
                          strokeDasharray={chart.dash}
                        />
                        <ChartText
                          // Left of its line: off the box and off the max handle past the upper fence.
                          {...fitLabel(sx(v) - 4, `fence ${fmt(v)}`, chart.label, w, 'end', 4)}
                          y={8 + band + 12}
                          fontSize={chart.label}
                          fontWeight="700"
                          fill={c.hopBack}
                        >
                          {`fence ${fmt(v)}`}
                        </ChartText>
                      </G>
                    ))
                  : null}
                {plots.map((ids, i) => {
                  const [, a, md, b] = vals[i]!;
                  const [e0, e1] = ends[i]!;
                  const y = mid(i);
                  const fade = known[i] ? 1 : 0.4;
                  const outs = i === 0 ? outliers : [];
                  // The numbers under the box, taking turns between two rows when they crowd.
                  const marks = [
                    { v: e0!, bold: false },
                    { v: a!, bold: false },
                    { v: md!, bold: true },
                    { v: b!, bold: false },
                    { v: e1!, bold: false },
                  ].filter((m, k, all) => k === 0 || m.v !== all[k - 1]!.v);
                  const last: number[] = [-Infinity, -Infinity];
                  const labels = marks.map((m) => {
                    const x = sx(m.v);
                    const lw = width(fmt(m.v));
                    const r = x - lw / 2 > last[0]! + 2 ? 0 : 1;
                    last[r] = x + lw / 2;
                    return { ...m, x, y: y + boxH / 2 + 15 + r * 13 };
                  });
                  return (
                    <G key={`p${i}`} opacity={fade}>
                      {named && names[i] ? (
                        <ChartText
                          x={pad - 6}
                          y={rowTop(i) - 4}
                          fontSize={chart.label}
                          fontWeight="700"
                        >
                          {names[i]}
                        </ChartText>
                      ) : null}
                      <Line
                        x1={sx(e0!)}
                        y1={y}
                        x2={sx(a!)}
                        y2={y}
                        stroke={c.chartInk}
                        strokeWidth={chart.stroke}
                      />
                      <Line
                        x1={sx(b!)}
                        y1={y}
                        x2={sx(e1!)}
                        y2={y}
                        stroke={c.chartInk}
                        strokeWidth={chart.stroke}
                      />
                      {[e0!, e1!].map((x, k) => (
                        <Line
                          key={`w${k}`}
                          x1={sx(x)}
                          y1={y - boxH / 3}
                          x2={sx(x)}
                          y2={y + boxH / 3}
                          stroke={c.chartInk}
                          strokeWidth={chart.stroke}
                        />
                      ))}
                      <Rect
                        x={sx(Math.min(a!, b!))}
                        y={y - boxH / 2}
                        width={Math.max(2, Math.abs(sx(b!) - sx(a!)))}
                        height={boxH}
                        fill={i === 0 ? c.chartFill : c.chartSurface}
                        stroke={c.chartInk}
                        strokeWidth={chart.stroke}
                      />
                      <Line
                        x1={sx(md!)}
                        y1={y - boxH / 2}
                        x2={sx(md!)}
                        y2={y + boxH / 2}
                        stroke={c.chartHighlight}
                        strokeWidth={chart.strokeHeavy}
                      />
                      {outs.map((v, k) => (
                        <G key={`o${k}`}>
                          <Circle
                            cx={sx(v)}
                            cy={y}
                            r={5.5}
                            fill={c.card}
                            stroke={c.hopBack}
                            strokeWidth={chart.stroke}
                          />
                          <ChartText
                            {...fitLabel(sx(v), fmt(v), chart.small, w)}
                            y={y + boxH / 2 + 15}
                            fontSize={chart.small}
                            fontWeight="700"
                            fill={c.hopBack}
                          >
                            {fmt(v)}
                          </ChartText>
                        </G>
                      ))}
                      {labels.map((l, k) => (
                        <ChartText
                          key={`l${k}`}
                          {...fitLabel(l.x, fmt(l.v), chart.small, w)}
                          y={l.y}
                          fontSize={chart.small}
                          fontWeight={l.bold ? '700' : '400'}
                        >
                          {fmt(l.v)}
                        </ChartText>
                      ))}
                    </G>
                  );
                })}
              </Svg>
              {/* Marks drag where the five numbers are typed (not read from data). */}
              {spec.data
                ? null
                : plots.flatMap((ids, i) =>
                    known[i]
                      ? ids.map((id, k) => (
                          <DragHandle
                            key={id}
                            testID={`drag-${id}`}
                            x={sx(vals[i]![k]!)}
                            // An end that is an outlier: its handle above the plot, so the
                            // outlier's ring under it shows.
                            y={
                              i === 0 && (k === 0 || k === 4) && past(vals[i]![k]!)
                                ? mid(i) - boxH / 2 - 14
                                : mid(i) + (k % 2 ? -8 : 8)
                            }
                            label={rep.variable(id).name}
                            onStart={() => {
                              start.current = vals[i]![k]!;
                              range.freeze();
                            }}
                            onMove={(dx) =>
                              calc.set(
                                {
                                  ...rep.pin(ids.filter((x) => x !== id)),
                                  [id]: rep.snapTo(
                                    id,
                                    (start.current + dx / unit) * rep.factor(id),
                                  ),
                                },
                                rep.slide(id),
                              )
                            }
                            onEnd={range.release}
                          />
                        ))
                      : [],
                  )}
            </>
          );
        }}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}
