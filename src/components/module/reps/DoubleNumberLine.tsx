import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'doubleNumberLine' }>;

/**
 * Two number lines one above the other, lined up: each tick on the top line (one bigger
 * unit) sits over its worth on the bottom line (`per` smaller units). A mark joins the two
 * readings for the current value. Drag the mark along the lines.
 */
export function DoubleNumberLine({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const per = rep.known(spec.per) ? rep.shown(spec.per) : 0;
  const top = Math.max(0, rep.shown(spec.top));
  const known = rep.known(spec.top) && rep.known(spec.per);
  // Whole top units drawn: the spec's count, or enough for the value.
  const N = Math.max(spec.ticks, Math.ceil(top));

  return (
    <View>
      <Canvas aspect={0.4}>
        {({ w, h }) => {
          const pad = 28;
          const unit = (w - 2 * pad) / N;
          const px = (x: number) => pad + x * unit;
          const yTop = h * 0.34;
          const yBottom = h * 0.7;
          const labelEvery = unit >= 34 ? 1 : unit >= 18 ? 2 : 5;
          const line = (y: number, key: string) => (
            <Line
              key={key}
              x1={pad - 8}
              y1={y}
              x2={w - pad + 8}
              y2={y}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
          );
          return (
            <>
              <Svg width={w} height={h}>
                <ChartText x={pad - 8} y={yTop - 26} fontSize={chart.small} fill={c.chartMuted}>
                  {rep.variable(spec.top).name}
                </ChartText>
                <ChartText x={pad - 8} y={yBottom + 34} fontSize={chart.small} fill={c.chartMuted}>
                  {rep.variable(spec.bottom).name}
                </ChartText>
                {line(yTop, 'lt')}
                {line(yBottom, 'lb')}
                {Array.from({ length: N + 1 }, (_, i) => [
                  <Line
                    key={`tt${i}`}
                    x1={px(i)}
                    y1={yTop - 6}
                    x2={px(i)}
                    y2={yTop + 6}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />,
                  <Line
                    key={`tb${i}`}
                    x1={px(i)}
                    y1={yBottom - 6}
                    x2={px(i)}
                    y2={yBottom + 6}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />,
                  i % labelEvery === 0 || i === N ? (
                    <ChartText
                      key={`lt${i}`}
                      x={px(i)}
                      y={yTop - 10}
                      fontSize={chart.label}
                      textAnchor="middle"
                    >
                      {String(i)}
                    </ChartText>
                  ) : null,
                  i % labelEvery === 0 || i === N ? (
                    <ChartText
                      key={`lb${i}`}
                      x={px(i)}
                      y={yBottom + 18}
                      fontSize={chart.label}
                      textAnchor="middle"
                    >
                      {per ? formatNumber(i * per) : '?'}
                    </ChartText>
                  ) : null,
                ])}
                {known ? (
                  <Line
                    x1={px(top)}
                    y1={yTop}
                    x2={px(top)}
                    y2={yBottom}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                  />
                ) : null}
              </Svg>
              {known ? (
                <DragHandle
                  testID={`drag-${spec.top}`}
                  x={px(top)}
                  y={(yTop + yBottom) / 2}
                  label={rep.variable(spec.top).name}
                  onStart={() => (start.current = top)}
                  onMove={(dx) =>
                    calc.set({
                      ...rep.pin([spec.per]),
                      [spec.top]: rep.snapTo(
                        spec.top,
                        Math.max(0, start.current + dx / unit) * rep.factor(spec.top),
                      ),
                    })
                  }
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? `${rep.named(spec.top)} on the top line sits over ${rep.value(spec.bottom)} on the bottom line: each 1 above is ${formatNumber(per)} below.`
          : 'Type the bigger units and how many smaller units make one.'}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.top, steps: [1], pin: [spec.per] },
          { var: spec.per, steps: [1], pin: [spec.top] },
        ]}
      />
    </View>
  );
}
