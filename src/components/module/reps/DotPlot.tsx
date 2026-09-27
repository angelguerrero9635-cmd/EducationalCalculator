import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, fitLabel, Caption, ChartText, useFrozen, useRep } from './common';
import { tickStep } from './IntegerLine';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'dotPlot' }>;

/**
 * A dot plot: one dot per data value, stacked where values repeat, on a number line. The mean
 * sits under the line as a balance point (a triangle); the median is a dashed line; the range
 * a bracket from the least to the greatest; `deviations` draws each dot's distance from the
 * mean.
 */
export function DotPlot({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  // With a count, only the first `count` values are data; the rest are hidden boxes.
  const n = spec.count && rep.known(spec.count) ? rep.shown(spec.count) : spec.data.length;
  const ids = spec.data.slice(0, n);
  const known = ids.filter(rep.known);
  const data = known.map((id) => rep.shown(id));
  const extent = useFrozen(
    (() => {
      const lo = Math.min(spec.min, ...data);
      const hi = Math.max(spec.max, ...data);
      const s = tickStep(hi - lo, 12);
      return [Math.floor(lo / s) * s, Math.ceil(hi / s) * s] as [number, number];
    })(),
  );
  const [lo, hi] = extent.value;
  const step = tickStep(hi - lo, 12);
  const mean = spec.mean && rep.known(spec.mean) ? rep.shown(spec.mean) : undefined;
  const median = spec.median && rep.known(spec.median) ? rep.shown(spec.median) : undefined;
  const sorted = [...data].sort((a, b) => a - b);

  return (
    <View>
      <Canvas aspect={0.5}>
        {({ w, h }) => {
          const pad = 24;
          const x = (v: number) => pad + ((v - lo) / (hi - lo || 1)) * (w - 2 * pad);
          const lineY = h - 52;
          const r = Math.min(8, (w - 2 * pad) / ((hi - lo) / step) / 3 + 3);
          // Stacks: repeated values pile up.
          const seen = new Map<number, number>();
          const dots = data.map((v, i) => {
            const key = Number(v.toFixed(4));
            const level = seen.get(key) ?? 0;
            seen.set(key, level + 1);
            return { v, i, y: lineY - r - 2 - level * (2 * r + 2) };
          });
          const ticks = Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, i) =>
            Number((lo + i * step).toFixed(6)),
          );
          return (
            <Svg width={w} height={h}>
              <Line
                x1={pad - 6}
                y1={lineY}
                x2={w - pad + 6}
                y2={lineY}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              {ticks.map((t) => (
                <G key={t}>
                  <Line x1={x(t)} y1={lineY - 4} x2={x(t)} y2={lineY + 4} stroke={c.chartInk} />
                  <ChartText
                    x={x(t)}
                    y={lineY + 17}
                    fontSize={chart.tiny}
                    fill={c.chartMuted}
                    textAnchor="middle"
                  >
                    {formatNumber(t)}
                  </ChartText>
                </G>
              ))}
              {spec.deviations && mean !== undefined
                ? dots.map((d) => (
                    <Line
                      key={`d${d.i}`}
                      x1={x(d.v)}
                      y1={d.y}
                      x2={x(mean)}
                      y2={d.y}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={chart.dashFine}
                    />
                  ))
                : null}
              {dots.map((d) => (
                <Circle key={d.i} cx={x(d.v)} cy={d.y} r={r} fill={c.chartInk} />
              ))}
              {median !== undefined ? (
                <G>
                  <Line
                    x1={x(median)}
                    y1={10}
                    x2={x(median)}
                    y2={lineY}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeLight}
                    strokeDasharray={chart.dash}
                  />
                  <ChartText
                    {...fitLabel(x(median), `median ${formatNumber(median)}`, chart.small, w)}
                    y={10}
                    fontSize={chart.small}
                    fill={c.chartHighlight}
                  >
                    {`median ${formatNumber(median)}`}
                  </ChartText>
                </G>
              ) : null}
              {mean !== undefined ? (
                <G>
                  <Path d={`M ${x(mean)} ${lineY + 22} l -8 12 l 16 0 z`} fill={c.chartHighlight} />
                  <ChartText
                    {...fitLabel(
                      x(mean),
                      `mean ${formatNumber(Number(mean.toFixed(2)))}`,
                      chart.small,
                      w,
                    )}
                    y={lineY + 48}
                    fontSize={chart.small}
                    fontWeight="700"
                    fill={c.chartHighlight}
                  >
                    {`mean ${formatNumber(Number(mean.toFixed(2)))}`}
                  </ChartText>
                </G>
              ) : null}
              {spec.range && sorted.length > 1 ? (
                <G>
                  <Line
                    x1={x(sorted[0]!)}
                    y1={lineY + 30}
                    x2={x(sorted[sorted.length - 1]!)}
                    y2={lineY + 30}
                    stroke={c.chartMuted}
                    strokeWidth={chart.strokeLight}
                  />
                  <ChartText
                    x={(x(sorted[0]!) + x(sorted[sorted.length - 1]!)) / 2}
                    y={lineY + 44}
                    fontSize={chart.tiny}
                    fill={c.chartMuted}
                    textAnchor="middle"
                  >
                    {`range ${formatNumber(Number((sorted[sorted.length - 1]! - sorted[0]!).toFixed(4)))}`}
                  </ChartText>
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {data.length
          ? `${data.length} values: ${sorted.map((v) => formatNumber(v)).join(', ')}.`
          : 'Type the data values.'}
      </Caption>
      <Steppers
        calc={calc}
        items={ids.map((id) => ({
          var: id,
          steps: [1],
          pin: ids.filter((x) => x !== id),
        }))}
      />
    </View>
  );
}
