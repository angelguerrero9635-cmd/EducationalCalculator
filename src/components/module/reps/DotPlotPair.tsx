import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useFrozen, useRep } from './common';
import { tickStep } from './IntegerLine';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'dotPlot' }>;
type Second = NonNullable<Spec['second']>;

const fmt = (x: number) => formatNumber(Number(x.toFixed(2)));

/**
 * Two samples' dot plots, one above the other on the same scale, so their centers and spreads
 * can be compared by eye: each sample's mean as a balance point under its line (or its median
 * dashed), and the gap between the two centers marked when the module has it (`difference`).
 */
export function DotPlotPair({ spec, calc }: { spec: Spec & { second: Second }; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const sets = [
    { data: spec.data, mean: spec.mean, median: spec.median },
    { data: spec.second.data, mean: spec.second.mean, median: spec.second.median },
  ];
  const [nameA, nameB] = spec.labels ?? ['Sample A', 'Sample B'];
  const values = sets.map((s) => s.data.filter(rep.known).map((id) => rep.shown(id)));
  const all = values.flat();
  const extent = useFrozen(
    (() => {
      const lo = Math.min(spec.min, ...all);
      const hi = Math.max(spec.max, ...all);
      const s = tickStep(hi - lo, 12);
      return [Math.floor(lo / s) * s, Math.ceil(hi / s) * s] as [number, number];
    })(),
  );
  const [lo, hi] = extent.value;
  const step = tickStep(hi - lo, 12);
  // Each sample's center: its mean (or median) when the module has one and it is known.
  const centers = sets.map((s) => {
    const id = s.mean ?? s.median;
    return id && rep.known(id) ? { x: rep.shown(id), mean: !!s.mean, id } : undefined;
  });
  const complete = sets.every((s) => s.data.every(rep.known));

  return (
    <View>
      <Canvas aspect={0.86}>
        {({ w, h }) => {
          const pad = 24;
          const x = (v: number) => pad + ((v - lo) / (hi - lo || 1)) * (w - 2 * pad);
          const gapH = spec.difference ? 34 : 8;
          const panel = (h - gapH) / 2;
          const r = Math.min(7, (w - 2 * pad) / ((hi - lo) / step) / 3 + 3);
          const ticks = Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, i) =>
            Number((lo + i * step).toFixed(6)),
          );
          const lines = [panel - 40, 2 * panel + gapH - 40];
          return (
            <Svg width={w} height={h} opacity={complete ? 1 : 0.5}>
              {sets.map((s, k) => {
                const lineY = lines[k]!;
                const seen = new Map<number, number>();
                const center = centers[k];
                return (
                  <G key={k}>
                    <ChartText
                      x={pad - 6}
                      y={lineY - panel + 56}
                      fontSize={chart.label}
                      fontWeight="700"
                    >
                      {k === 0 ? nameA : nameB}
                    </ChartText>
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
                        <Line
                          x1={x(t)}
                          y1={lineY - 4}
                          x2={x(t)}
                          y2={lineY + 4}
                          stroke={c.chartInk}
                        />
                        <ChartText
                          x={x(t)}
                          y={lineY + 16}
                          fontSize={chart.tiny}
                          fill={c.chartMuted}
                          textAnchor="middle"
                        >
                          {formatNumber(t)}
                        </ChartText>
                      </G>
                    ))}
                    {values[k]!.map((v, i) => {
                      const key = Number(v.toFixed(4));
                      const level = seen.get(key) ?? 0;
                      seen.set(key, level + 1);
                      return (
                        <Circle
                          key={i}
                          cx={x(v)}
                          cy={lineY - r - 2 - level * (2 * r + 2)}
                          r={r}
                          fill={k === 0 ? c.chartHighlight : c.chartSecond}
                          stroke={c.chartInk}
                          strokeWidth={0.75}
                        />
                      );
                    })}
                    {center ? (
                      <G>
                        {center.mean ? (
                          <Path
                            d={`M ${x(center.x)} ${lineY + 20} l -7 11 l 14 0 z`}
                            fill={c.chartInk}
                          />
                        ) : (
                          <Line
                            x1={x(center.x)}
                            y1={lineY - panel + 44}
                            x2={x(center.x)}
                            y2={lineY}
                            stroke={c.chartInk}
                            strokeDasharray={chart.dash}
                          />
                        )}
                        <ChartText
                          {...fitLabel(
                            x(center.x) + 12,
                            `${center.mean ? 'mean' : 'median'} ${rep.label(center.id)}`,
                            chart.small,
                            w,
                            'start',
                            12,
                          )}
                          y={lineY + 31}
                          fontSize={chart.small}
                          fontWeight="700"
                        >
                          {`${center.mean ? 'mean' : 'median'} ${rep.label(center.id)}`}
                        </ChartText>
                      </G>
                    ) : null}
                  </G>
                );
              })}
              {spec.difference && centers[0] && centers[1] ? (
                // The gap between the two centers, between the plots.
                <G>
                  {(() => {
                    const [a, b] = [x(centers[0].x), x(centers[1].x)];
                    const y = panel + gapH / 2 - 2;
                    const text = rep.label(spec.difference);
                    return (
                      <>
                        <Line x1={a} y1={y - 8} x2={a} y2={y + 8} stroke={c.chartMuted} />
                        <Line x1={b} y1={y - 8} x2={b} y2={y + 8} stroke={c.chartMuted} />
                        <Line
                          x1={a}
                          y1={y}
                          x2={b}
                          y2={y}
                          stroke={c.chartMuted}
                          strokeWidth={chart.strokeLight}
                        />
                        <ChartText
                          {...fitLabel(Math.max(a, b) + 6, text, chart.small, w, 'start', 6)}
                          y={y + 4}
                          fontSize={chart.small}
                          fontWeight="700"
                        >
                          {text}
                        </ChartText>
                      </>
                    );
                  })()}
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          ...sets.map((s, k) => {
            const name = k === 0 ? nameA : nameB;
            const center = centers[k];
            return center
              ? `${name}: ${values[k]!.length} values, ${rep.named(center.id)}`
              : `${name}: ${values[k]!.length} values`;
          }),
          spec.difference && centers[0] && centers[1]
            ? `${rep.words ? rep.variable(spec.difference).name : rep.variable(spec.difference).symbol} = ${fmt(Math.max(centers[0].x, centers[1].x))} − ${fmt(Math.min(centers[0].x, centers[1].x))} = ${rep.value(spec.difference)}`
            : undefined,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Caption>
      <Steppers
        calc={calc}
        items={[...spec.data, ...spec.second.data].map((id, _, ids) => ({
          var: id,
          steps: [1],
          pin: ids.filter((x) => x !== id),
        }))}
      />
    </View>
  );
}
