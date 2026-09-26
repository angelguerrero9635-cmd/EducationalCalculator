import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'protractor' }>;

/**
 * A protractor over an angle: one arm along the 0° line to the right, the other turned by
 * the angle. The inner scale counts up from the first arm; the outer scale counts from the
 * other end, so it reads 180° minus the angle. Drag the turned arm.
 */
export function Protractor({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef({ a: 0, cx: 0, cy: 0, r: 1 });
  const known = rep.known(spec.angle);
  const a = Math.min(180, Math.max(0, rep.shown(spec.angle)));

  return (
    <View>
      <Canvas aspect={0.6}>
        {({ w, h }) => {
          const cx = w / 2;
          const cy = h - 26;
          const R = Math.min(w / 2 - 36, h - 50);
          const toXY = (deg: number, r: number) => {
            const t = (-deg * Math.PI) / 180;
            return [cx + r * Math.cos(t), cy + r * Math.sin(t)] as const;
          };
          const marks: React.ReactNode[] = [];
          for (let d = 0; d <= 180; d += 5) {
            const big = d % 30 === 0;
            const mid = d % 10 === 0;
            const [x1, y1] = toXY(d, R);
            const [x2, y2] = toXY(d, R - (big ? 16 : mid ? 11 : 6));
            marks.push(
              <Line
                key={`m${d}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={c.chartInk}
                strokeWidth={big ? chart.stroke : chart.strokeLight}
              />,
            );
            if (mid) {
              const [ix, iy] = toXY(d, R - 27);
              const [ox, oy] = toXY(d, R + 12);
              marks.push(
                <ChartText
                  key={`i${d}`}
                  x={ix}
                  y={iy + 3}
                  fontSize={chart.tiny}
                  textAnchor="middle"
                >
                  {String(d)}
                </ChartText>,
                <ChartText
                  key={`o${d}`}
                  x={ox}
                  y={oy + 3}
                  fontSize={chart.tiny}
                  fill={c.chartMuted}
                  textAnchor="middle"
                >
                  {String(180 - d)}
                </ChartText>,
              );
            }
          }
          const [ax, ay] = toXY(a, R + 24);
          const [hx, hy] = toXY(a, R * 0.8);
          const [wx, wy] = toXY(0, R + 24);
          const arcEnd = toXY(a, 30);
          return (
            <>
              <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
                <Path
                  d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy} Z`}
                  fill={c.chartSurface}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                <Path
                  d={`M ${cx - R * 0.55} ${cy} A ${R * 0.55} ${R * 0.55} 0 0 1 ${cx + R * 0.55} ${cy}`}
                  fill="none"
                  stroke={c.chartGrid}
                  strokeWidth={chart.strokeLight}
                />
                {marks}
                {a > 0 ? (
                  <Path
                    d={`M ${cx + 30} ${cy} A 30 30 0 ${a > 180 ? 1 : 0} 0 ${arcEnd[0]} ${arcEnd[1]}`}
                    fill="none"
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                  />
                ) : null}
                <Line
                  x1={cx}
                  y1={cy}
                  x2={wx}
                  y2={wy}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeHeavy}
                />
                <Line
                  x1={cx}
                  y1={cy}
                  x2={ax}
                  y2={ay}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.strokeHeavy}
                />
                <Circle cx={cx} cy={cy} r={4} fill={c.chartInk} />
                <ChartText
                  x={cx}
                  y={cy - R * 0.35}
                  fontSize={chart.emphasis}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {rep.value(spec.angle)}
                </ChartText>
              </Svg>
              {known ? (
                <DragHandle
                  testID={`drag-${spec.angle}`}
                  x={hx}
                  y={hy}
                  label={rep.variable(spec.angle).name}
                  onStart={() => {
                    start.current = { a, cx, cy, r: R * 0.8 };
                  }}
                  onMove={(dx, dy) => {
                    const s = start.current;
                    const [sx, sy] = toXY(s.a, s.r);
                    const deg = (-Math.atan2(sy + dy - s.cy, sx + dx - s.cx) * 180) / Math.PI;
                    const next = Math.min(180, Math.max(0, Math.round(deg)));
                    calc.set({
                      [spec.angle]: rep.snapTo(spec.angle, next * rep.factor(spec.angle)),
                    });
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? `The inner scale starts at 0 on the flat arm and reads ${rep.value(spec.angle)}.${spec.other ? ` The outer scale reads ${rep.value(spec.other)}: 180° − ${rep.value(spec.angle)}.` : ''}`
          : 'Type the angle to turn the arm.'}
      </Caption>
      <Steppers calc={calc} items={[{ var: spec.angle, steps: [1, 10], pin: [] }]} />
    </View>
  );
}
