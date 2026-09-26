import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, niceCeil, useFrozen, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'boxPlot' }>;

/**
 * A box plot over a number line: whiskers from the least to the greatest value, a box from
 * the first to the third quartile, a line at the median. Drag any of the five marks.
 */
export function BoxPlot({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const ids = [spec.min, spec.q1, spec.median, spec.q3, spec.max];
  const names = ['least', 'first quartile', 'median', 'third quartile', 'greatest'];
  const vals = ids.map((id) => rep.shown(id));
  const known = ids.every(rep.known);
  const [lo0, hi0] = spec.range;
  const hiRaw = Math.max(hi0, ...vals);
  const range = useFrozen<[number, number]>([
    Math.min(lo0, ...vals),
    hiRaw > hi0 ? niceCeil(hiRaw) : hi0,
  ]);
  const [lo, hi] = range.value;
  const iqr = known ? vals[3]! - vals[1]! : 0;

  return (
    <View>
      <Canvas aspect={0.42}>
        {({ w, h }) => {
          const pad = 24;
          const unit = (w - 2 * pad) / (hi - lo || 1);
          const sx = (x: number) => pad + (x - lo) * unit;
          const yLine = h - 30;
          const yMid = h * 0.42;
          const boxH = h * 0.36;
          const step = niceCeil((hi - lo) / 8);
          const ticks: number[] = [];
          for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) ticks.push(t);
          const [mn, q1, md, q3, mx] = vals as [number, number, number, number, number];
          return (
            <>
              <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
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
                {ids.map((id, i) => (
                  <ChartText
                    key={`v${id}`}
                    x={sx(vals[i]!)}
                    y={i % 2 === 0 ? yMid - boxH / 2 - 8 : yMid + boxH / 2 + 16}
                    fontSize={chart.small}
                    fontWeight={i === 2 ? '700' : undefined}
                    textAnchor="middle"
                  >
                    {rep.value(id, false)}
                  </ChartText>
                ))}
              </Svg>
              {known
                ? ids.map((id, i) => (
                    <DragHandle
                      key={id}
                      testID={`drag-${id}`}
                      x={sx(vals[i]!)}
                      y={yMid}
                      label={rep.variable(id).name}
                      onStart={() => {
                        start.current = vals[i]!;
                        range.freeze();
                      }}
                      onMove={(dx) =>
                        calc.set({
                          ...rep.pin(ids.filter((x) => x !== id)),
                          [id]: rep.snapTo(id, (start.current + dx / unit) * rep.factor(id)),
                        })
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
        {known
          ? `The middle half of the data runs from ${formatNumber(vals[1]!)} to ${formatNumber(vals[3]!)}: ${formatNumber(iqr)} wide. Half the values are at or below the median, ${formatNumber(vals[2]!)}.`
          : `Type the five numbers: ${names.join(', ')}.`}
      </Caption>
      <Steppers
        calc={calc}
        items={ids.map((id) => ({ var: id, steps: [1], pin: ids.filter((x) => x !== id) }))}
      />
    </View>
  );
}
