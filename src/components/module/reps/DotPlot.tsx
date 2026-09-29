import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, fitLabel, Caption, ChartText, useFrozen, useRep } from './common';
import { tickStep } from './IntegerLine';
import { medianSentence, middleOf } from './median';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'dotPlot' }>;

/** "σ = 2.1: 6 of 9 values are within one standard deviation of the mean, 3.9 to 8.1." */
function sdSentence(m: number, s: number, data: number[], sym: string) {
  const two = (v: number) => formatNumber(Number(v.toFixed(2)));
  const inside = data.filter((v) => v >= m - s - 1e-9 && v <= m + s + 1e-9).length;
  return `Standard deviation ${sym} = ${two(s)}: ${inside} of ${data.length} values are within one standard deviation of the mean, from ${two(m - s)} to ${two(m + s)}.`;
}

/**
 * A dot plot: one dot per data value, stacked where values repeat, on a number line. The mean
 * sits under the line as a balance point (a triangle); the median is a dashed line; the range
 * a bracket from the least to the greatest; `deviations` draws each dot's distance from the
 * mean. With `count`, only the first n values are drawn and the middle one (or two) is ringed
 * at the median.
 */
export function DotPlot({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  // With `count`, only the first n values are data; a "?" count draws every typed value, faded.
  const n =
    spec.count && rep.known(spec.count)
      ? Math.max(0, Math.min(spec.data.length, Math.round(rep.shown(spec.count))))
      : undefined;
  const used = spec.count && n !== undefined ? spec.data.slice(0, n) : spec.data;
  const faded = spec.count !== undefined && n === undefined;
  const known = used.filter(rep.known);
  const data = known.map((id) => rep.shown(id));
  const complete = known.length === used.length;
  // Grades 9–12: the band from mean − SD to mean + SD (in view too).
  const sd =
    spec.sd && rep.known(spec.sd.id) && spec.mean && rep.known(spec.mean)
      ? { m: rep.shown(spec.mean), s: rep.shown(spec.sd.id) }
      : undefined;
  const band = sd ? [sd.m - sd.s, sd.m + sd.s] : [];
  const extent = useFrozen(
    (() => {
      const lo = Math.min(spec.min, ...data, ...band);
      const hi = Math.max(spec.max, ...data, ...band);
      const s = tickStep(hi - lo, 12);
      return [Math.floor(lo / s) * s, Math.ceil(hi / s) * s] as [number, number];
    })(),
  );
  const [lo, hi] = extent.value;
  const step = tickStep(hi - lo, 12);
  const mean = spec.mean && rep.known(spec.mean) ? rep.shown(spec.mean) : undefined;
  const sorted = [...data].sort((a, b) => a - b);
  // Count mode marks the middle of the first n values: ring the middle dot(s). The median is
  // the module's value when it has one (not drawn while it is "?"), else the typed values'.
  const middle = spec.count && !faded && complete ? middleOf(sorted) : undefined;
  const median = spec.median
    ? rep.known(spec.median)
      ? rep.shown(spec.median)
      : undefined
    : middle?.median;
  // Each dot's place in order (ties by position), so the middle ones can be ringed.
  const rank = new Map(
    data
      .map((v, i) => ({ v, i }))
      .sort((a, b) => a.v - b.v || a.i - b.i)
      .map((d, k) => [d.i, k]),
  );

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
            // Count mode rings the middle dots: leave room for the ring between stacked dots.
            return { v, i, y: lineY - r - 2 - level * (2 * r + (spec.count ? 6 : 2)) };
          });
          const ticks = Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, i) =>
            Number((lo + i * step).toFixed(6)),
          );
          return (
            <Svg width={w} height={h} opacity={faded ? 0.4 : 1}>
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
              {sd ? (
                <G>
                  <Rect
                    x={x(sd.m - sd.s)}
                    y={28}
                    width={Math.max(0, x(sd.m + sd.s) - x(sd.m - sd.s))}
                    height={lineY - 28}
                    fill={c.chartHighlight}
                    opacity={0.12}
                  />
                  {[sd.m - sd.s, sd.m + sd.s].map((v, i) => (
                    <G key={`sd${i}`}>
                      <Line
                        x1={x(v)}
                        y1={28}
                        x2={x(v)}
                        y2={lineY}
                        stroke={c.chartHighlight}
                        strokeWidth={1}
                        strokeDasharray={chart.dashFine}
                      />
                      <ChartText
                        {...fitLabel(x(v), formatNumber(Number(v.toFixed(2))), chart.label, w)}
                        y={24}
                        fontSize={chart.label}
                        fill={c.chartHighlight}
                      >
                        {formatNumber(Number(v.toFixed(2)))}
                      </ChartText>
                    </G>
                  ))}
                  <Line
                    x1={x(sd.m)}
                    y1={28}
                    x2={x(sd.m)}
                    y2={lineY}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                  />
                </G>
              ) : null}
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
              {dots.map((d) => {
                const mid = middle?.ranks.includes(rank.get(d.i)!);
                return (
                  <G key={d.i}>
                    <Circle cx={x(d.v)} cy={d.y} r={r} fill={mid ? c.chartHighlight : c.chartInk} />
                    {mid ? (
                      <Circle
                        cx={x(d.v)}
                        cy={d.y}
                        r={r + 3}
                        fill="none"
                        stroke={c.chartHighlight}
                        strokeWidth={chart.strokeLight}
                      />
                    ) : null}
                  </G>
                );
              })}
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
        {middle
          ? `${data.length} values in order: ${sorted.map((v) => formatNumber(v)).join(', ')}. ${medianSentence(
              sorted,
              median === undefined ? '?' : formatNumber(median),
            )}`
          : spec.count && !faded && !complete
            ? `Type the first ${n} values.`
            : data.length
              ? `${data.length} values: ${sorted.map((v) => formatNumber(v)).join(', ')}.${
                  sd && complete
                    ? ` ${sdSentence(sd.m, sd.s, data, rep.variable(spec.sd!.id).symbol)}`
                    : ''
                }`
              : 'Type the data values.'}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          ...used.map((id) => ({
            var: id,
            steps: [1],
            pin: [...used, ...(spec.count ? [spec.count] : [])].filter((x) => x !== id),
          })),
          ...(spec.count ? [{ var: spec.count, steps: [1], pin: used }] : []),
        ]}
      />
    </View>
  );
}
