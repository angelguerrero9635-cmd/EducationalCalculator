import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, niceCeil, useFrozen, useRep } from './common';
import { medianSentence, middleOf } from './median';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'boxPlot' }>;

/**
 * A box plot over a number line: whiskers from the least to the greatest value, a box from
 * the first to the third quartile, a line at the median. Drag any of the five marks. With
 * `data`, the values themselves are dots above the plot (the first `count` of them), the middle
 * one or two ringed at the median; the five numbers are then read from them, not dragged.
 */
export function BoxPlot({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const ids = [spec.min, spec.q1, spec.median, spec.q3, spec.max];
  const names = ['least', 'first quartile', 'median', 'third quartile', 'greatest'];
  const vals = ids.map((id) => rep.shown(id));
  const known = ids.every(rep.known);
  // The values behind the plot: only the first n, all of them (faded) while n is "?".
  const n =
    spec.data && spec.count && rep.known(spec.count)
      ? Math.max(0, Math.min(spec.data.length, Math.round(rep.shown(spec.count))))
      : undefined;
  const used = spec.data ? (n !== undefined ? spec.data.slice(0, n) : spec.data) : [];
  const typed = used.filter(rep.known);
  const data = typed.map((id) => rep.shown(id));
  const sorted = [...data].sort((a, b) => a - b);
  const complete = spec.data !== undefined && typed.length === used.length && data.length > 0;
  const fadedData = spec.count !== undefined && n === undefined;
  const middle = complete && !fadedData ? middleOf(sorted) : undefined;
  const rank = new Map(
    data
      .map((v, i) => ({ v, i }))
      .sort((a, b) => a.v - b.v || a.i - b.i)
      .map((d, k) => [d.i, k]),
  );
  // Dots stack where values repeat; the band above the plot is as tall as the tallest stack.
  const levels = new Map<number, number>();
  const dots = data.map((v, i) => {
    const level = levels.get(v) ?? 0;
    levels.set(v, level + 1);
    return { v, i, level };
  });
  const band = spec.data ? 12 + Math.max(1, ...levels.values()) * 16 : 0;
  const [lo0, hi0] = spec.range;
  const hiRaw = Math.max(hi0, ...vals, ...data);
  const range = useFrozen<[number, number]>([
    Math.min(lo0, ...vals, ...data),
    hiRaw > hi0 ? niceCeil(hiRaw) : hi0,
  ]);
  const [lo, hi] = range.value;
  const iqr = known ? vals[3]! - vals[1]! : 0;

  return (
    <View>
      {/* 26 px under the box for two more rows of value labels when values bunch up. */}
      <Canvas aspect={(w) => (spec.brackets ? 0.56 : 0.42) + (26 + band) / w}>
        {({ w, h: full }) => {
          const h = full - 26 - band;
          const pad = 24;
          const unit = (w - 2 * pad) / (hi - lo || 1);
          const sx = (x: number) => pad + (x - lo) * unit;
          const yLine = full - 30;
          // Brackets go above the value labels, so the box sits lower.
          const yMid = band + (spec.brackets ? h * 0.52 : h * 0.42);
          const boxH = spec.brackets ? h * 0.28 : h * 0.36;
          const step = niceCeil((hi - lo) / 8);
          const ticks: number[] = [];
          for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) ticks.push(t);
          const [mn, q1, md, q3, mx] = vals as [number, number, number, number, number];
          // Value labels: equal values share one label. Labels take turns above and below the
          // box; one that would touch the last label in its row goes to the other side, or to a
          // row further down.
          const up = yMid - boxH / 2 - 8;
          const down = yMid + boxH / 2 + 16;
          const width = (t: string) => t.length * chart.small * 0.6 + 6;
          const rows = [up, down, down + 13, down + 26];
          const last: ({ x: number; w: number } | undefined)[] = rows.map(() => undefined);
          const clear = (r: number, x: number, lw: number) => {
            const p = last[r];
            return !p || Math.abs(x - p.x) > (lw + p.w) / 2;
          };
          const labels: { i: number; x: number; y: number }[] = [];
          ids.forEach((id, i) => {
            if (i > 0 && vals[i] === vals[i - 1]) return;
            const x = sx(vals[i]!);
            const lw = width(rep.value(id, false));
            const order = labels.length % 2 === 0 ? [0, 1, 2, 3] : [1, 0, 2, 3];
            const r = order.find((k) => clear(k, x, lw)) ?? 3;
            last[r] = { x, w: lw };
            labels.push({ i, x, y: rows[r]! });
          });
          // Handles closer than a handle's width are spread up and down the box, so each one
          // can be picked up.
          const handleY: number[] = [];
          for (let i = 0; i < ids.length;) {
            let j = i + 1;
            while (j < ids.length && sx(vals[j]!) - sx(vals[j - 1]!) < chart.handle) j++;
            const k = j - i;
            const spread = Math.min(boxH, (k - 1) * chart.handle);
            for (let n = 0; n < k; n++) {
              handleY.push(k === 1 ? yMid : yMid - spread / 2 + (n * spread) / (k - 1));
            }
            i = j;
          }
          return (
            <>
              <Svg width={w} height={full} opacity={known ? 1 : 0.4}>
                <Line
                  x1={pad - 6}
                  y1={yLine}
                  x2={w - pad + 6}
                  y2={yLine}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                {ticks.map((t) => [
                  <Line
                    key={`t${t}`}
                    x1={sx(t)}
                    y1={yLine - 5}
                    x2={sx(t)}
                    y2={yLine + 5}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />,
                  <ChartText
                    key={`l${t}`}
                    x={sx(t)}
                    y={yLine + 18}
                    fontSize={chart.small}
                    fill={c.chartMuted}
                    textAnchor="middle"
                  >
                    {formatNumber(t)}
                  </ChartText>,
                ])}
                {/* Whiskers */}
                <Line
                  x1={sx(mn)}
                  y1={yMid}
                  x2={sx(q1)}
                  y2={yMid}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                <Line
                  x1={sx(q3)}
                  y1={yMid}
                  x2={sx(mx)}
                  y2={yMid}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                {[mn, mx].map((x, i) => (
                  <Line
                    key={`w${i}`}
                    x1={sx(x)}
                    y1={yMid - boxH / 3}
                    x2={sx(x)}
                    y2={yMid + boxH / 3}
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                  />
                ))}
                {/* Box and median */}
                <Rect
                  x={sx(Math.min(q1, q3))}
                  y={yMid - boxH / 2}
                  width={Math.max(2, Math.abs(sx(q3) - sx(q1)))}
                  height={boxH}
                  fill={c.chartFill}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                <Line
                  x1={sx(md)}
                  y1={yMid - boxH / 2}
                  x2={sx(md)}
                  y2={yMid + boxH / 2}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.strokeHeavy}
                />
                {spec.data ? (
                  <G opacity={fadedData ? 0.4 : 1}>
                    {/* The median down from the middle dot(s) to the box's median line. */}
                    {middle && rep.known(spec.median) ? (
                      <Line
                        x1={sx(md)}
                        y1={band - 14}
                        x2={sx(md)}
                        y2={up - chart.small - 2}
                        stroke={c.chartHighlight}
                        strokeWidth={chart.strokeLight}
                        strokeDasharray={chart.dash}
                      />
                    ) : null}
                    {dots.map((d) => {
                      const mid = middle?.ranks.includes(rank.get(d.i)!);
                      const cy = band - 14 - d.level * 16;
                      return (
                        <G key={`d${d.i}`}>
                          <Circle
                            cx={sx(d.v)}
                            cy={cy}
                            r={4.5}
                            fill={mid ? c.chartHighlight : c.chartInk}
                          />
                          {mid ? (
                            <Circle
                              cx={sx(d.v)}
                              cy={cy}
                              r={7}
                              fill="none"
                              stroke={c.chartHighlight}
                              strokeWidth={chart.strokeLight}
                            />
                          ) : null}
                        </G>
                      );
                    })}
                  </G>
                ) : null}
                {labels.map(({ i, x, y }) => (
                  <ChartText
                    key={`v${ids[i]}`}
                    x={x}
                    y={y}
                    fontSize={chart.small}
                    fontWeight={i === 2 ? '700' : undefined}
                    textAnchor="middle"
                  >
                    {rep.value(ids[i]!, false)}
                  </ChartText>
                ))}
                {spec.brackets
                  ? (
                      [
                        [mn, mx, spec.brackets.range, 'range', yMid - boxH / 2 - 44],
                        [q1, q3, spec.brackets.iqr, 'IQR', yMid - boxH / 2 - 24],
                      ] as const
                    )
                      .filter(([, , id]) => id !== undefined)
                      .map(([a, b, id, label, y]) => (
                        <G key={label}>
                          <Path
                            d={`M ${sx(a)} ${y + 5} L ${sx(a)} ${y} L ${sx(b)} ${y} L ${sx(b)} ${y + 5}`}
                            stroke={label === 'IQR' ? c.chartHighlight : c.chartMuted}
                            strokeWidth={chart.strokeLight}
                            fill="none"
                          />
                          <ChartText
                            x={(sx(a) + sx(b)) / 2}
                            y={y - 3}
                            fontSize={chart.tiny}
                            fill={label === 'IQR' ? c.chartHighlight : c.chartMuted}
                            textAnchor="middle"
                          >
                            {`${label} ${rep.value(id!, false)}`}
                          </ChartText>
                        </G>
                      ))
                  : null}
              </Svg>
              {known && !spec.data
                ? ids.map((id, i) => (
                    <DragHandle
                      key={id}
                      testID={`drag-${id}`}
                      x={sx(vals[i]!)}
                      y={handleY[i]!}
                      label={rep.variable(id).name}
                      onStart={() => {
                        start.current = vals[i]!;
                        range.freeze();
                      }}
                      onMove={(dx) =>
                        calc.set(
                          {
                            ...rep.pin(ids.filter((x) => x !== id)),
                            [id]: rep.snapTo(id, (start.current + dx / unit) * rep.factor(id)),
                          },
                          rep.slide(id),
                        )
                      }
                      onEnd={range.release}
                    />
                  ))
                : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {`${
          middle
            ? `${data.length} values in order: ${sorted.map((v) => formatNumber(v)).join(', ')}. ${medianSentence(
                sorted,
                rep.value(spec.median, false),
              )} `
            : spec.data && !fadedData && !complete
              ? `Type the first ${n ?? used.length} values. `
              : ''
        }${
          known
            ? `The middle half of the data runs from ${formatNumber(vals[1]!)} to ${formatNumber(vals[3]!)}, a width of ${formatNumber(iqr)}. Half the values are at or below the median, ${formatNumber(vals[2]!)}.`
            : spec.data
              ? ''
              : `Type the five numbers: ${names.join(', ')}.`
        }`}
      </Caption>
      <Steppers
        calc={calc}
        items={
          spec.data
            ? [
                ...used.map((id) => ({
                  var: id,
                  steps: [1],
                  pin: [...used, ...(spec.count ? [spec.count] : [])].filter((x) => x !== id),
                })),
                ...(spec.count ? [{ var: spec.count, steps: [1], pin: used }] : []),
              ]
            : ids.map((id) => ({ var: id, steps: [1], pin: ids.filter((x) => x !== id) }))
        }
      />
    </View>
  );
}
