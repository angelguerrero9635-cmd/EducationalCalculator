import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Defs, Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { LitRect, TopLight, usePaintIds } from './paint';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'percentBar' }>;

/**
 * A percent bar (a double number line in one bar): 0% to 100% along the top, 0 to the whole
 * along the bottom, the part shaded; past 100% the bar runs on beyond the whole. Drag the
 * end of the shading to change the percent.
 */
export function PercentBar({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const paint = usePaintIds('light');
  const rep = useRep(calc);
  const start = useRef(0);
  const pct = Math.max(0, rep.shown(spec.percent));
  const whole = Math.max(0, rep.shown(spec.whole));
  const ticks = spec.ticks ?? 10;
  // The bar ends at 100%, or at the next tick past the percent when it is bigger.
  const top = useFrozen(Math.max(100, Math.ceil(pct / (100 / ticks)) * (100 / ticks)));

  return (
    <View>
      <Canvas aspect={0.42}>
        {({ w, h }) => {
          const pad = 24;
          const x = (p: number) => pad + (p / top.value) * (w - 2 * pad);
          const barY = h * 0.34;
          const barH = h * 0.26;
          const marks = Array.from(
            { length: Math.round(top.value / (100 / ticks)) + 1 },
            (_, i) => (i * 100) / ticks,
          );
          // Labels every `every` ticks (and always at 100%), so the longest never runs into the
          // next one.
          const bottom = (m: number) => formatNumber(Number(((whole * m) / 100).toFixed(4)));
          const longest = Math.max(
            ...marks.map((m) => Math.max(bottom(m).length, `${formatNumber(m)}%`.length)),
          );
          const every = Math.max(
            1,
            Math.ceil((longest * chart.tiny * 0.6 + 8) / Math.max(1, x(marks[1] ?? 1) - x(0))),
          );
          const labelled = marks.filter(
            (m, i) => m === 100 || (i % every === 0 && Math.abs(m - 100) / (100 / ticks) >= every),
          );
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <TopLight id={paint.light} />
                </Defs>
                <Rect
                  x={x(0)}
                  y={barY}
                  width={x(100) - x(0)}
                  height={barH}
                  fill={c.chartFill}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                {top.value > 100 ? (
                  <Rect
                    x={x(100)}
                    y={barY}
                    width={x(top.value) - x(100)}
                    height={barH}
                    fill={c.chartSurface}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                    strokeDasharray={chart.dash}
                  />
                ) : null}
                <LitRect
                  lightId={paint.light}
                  x={x(0)}
                  y={barY}
                  width={Math.max(0, x(pct) - x(0))}
                  height={barH}
                  fill={c.chartHighlight}
                  fillOpacity={0.55}
                />
                {marks.map((m) => (
                  <Line
                    key={`t${m}`}
                    x1={x(m)}
                    y1={barY - 4}
                    x2={x(m)}
                    y2={barY + barH + 4}
                    stroke={c.chartInk}
                    strokeWidth={m === 100 ? chart.stroke : 1}
                  />
                ))}
                {labelled.map((m) => (
                  <ChartText
                    key={`p${m}`}
                    x={x(m)}
                    y={barY - 10}
                    fontSize={chart.tiny}
                    fill={c.chartMuted}
                    textAnchor="middle"
                  >
                    {`${formatNumber(m)}%`}
                  </ChartText>
                ))}
                {/* The bottom scale: the whole at 100%, the same share at every tick. */}
                {labelled.map((m) => (
                  <ChartText
                    key={`v${m}`}
                    x={x(m)}
                    y={barY + barH + 18}
                    fontSize={chart.tiny}
                    fill={m === 100 ? c.chartInk : c.chartMuted}
                    fontWeight={m === 100 ? '700' : '400'}
                    textAnchor="middle"
                  >
                    {bottom(m)}
                  </ChartText>
                ))}
                <ChartText
                  x={x(pct)}
                  y={barY + barH + 38}
                  fontSize={chart.label}
                  fontWeight="700"
                  fill={c.chartHighlight}
                  textAnchor="middle"
                >
                  {rep.known(spec.part) ? rep.value(spec.part) : '?'}
                </ChartText>
              </Svg>
              <DragHandle
                testID={`drag-${spec.percent}`}
                x={x(pct)}
                y={barY + barH / 2}
                label={rep.variable(spec.percent).name}
                onStart={() => {
                  start.current = pct;
                  top.freeze();
                }}
                onEnd={top.release}
                onMove={(dx) =>
                  calc.set(
                    {
                      ...rep.pin([spec.whole]),
                      [spec.percent]: rep.snapTo(
                        spec.percent,
                        start.current + (dx / (w - 2 * pad)) * top.value,
                      ),
                    },
                    rep.slide(spec.percent),
                  )
                }
              />
            </>
          );
        }}
      </Canvas>
      <Caption>
        {rep.known(spec.percent) && rep.known(spec.whole)
          ? `${formatNumber(pct)}% of ${rep.value(spec.whole)} is ${rep.value(spec.part)}.${spec.onePercent ? ` 1% is ${rep.value(spec.onePercent)}.` : ''}`
          : 'The whole is 100%. Type the numbers you know.'}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.percent, steps: [1, 10], pin: [spec.whole] },
          { var: spec.whole, steps: [1, 10], pin: [spec.percent] },
        ]}
      />
    </View>
  );
}
