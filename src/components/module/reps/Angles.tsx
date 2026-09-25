import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'angles' }>;

/** What a whole angle is called, by its measure in degrees. */
const kindOf = (deg: number) =>
  deg === 90
    ? 'a right angle'
    : deg === 180
      ? 'a straight angle'
      : deg < 90
        ? 'an acute angle'
        : deg < 180
          ? 'an obtuse angle'
          : deg === 360
            ? 'a full turn'
            : 'a reflex angle';

/**
 * Two angles side by side with the same vertex: the first from the flat ray, the second on
 * top of it, and the whole angle they make. Drag the middle ray to change the first angle.
 */
export function Angles({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const [first, second] = spec.parts;
  const a = rep.known(first) ? Math.max(0, rep.shown(first)) : 0;
  const b = rep.known(second) ? Math.max(0, rep.shown(second)) : 0;
  const whole = a + b;
  const known = rep.known(first) && rep.known(second);
  const start = useRef({ a: 0, cx: 0, cy: 0, r: 1 });
  const toXY = (deg: number, r: number, cx: number, cy: number) => {
    const t = (-deg * Math.PI) / 180;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)] as const;
  };

  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.62, 200 / w + 0.1)}>
        {({ w, h }) => {
          const cx = w / 2;
          const cy = h - 24;
          const r = Math.min(w / 2 - 30, h - 44);
          const arc = (from: number, to: number, rad: number) => {
            const [x1, y1] = toXY(from, rad, cx, cy);
            const [x2, y2] = toXY(to, rad, cx, cy);
            const large = to - from > 180 ? 1 : 0;
            return `M ${x1} ${y1} A ${rad} ${rad} 0 ${large} 0 ${x2} ${y2}`;
          };
          const ray = (deg: number, key: string, heavy = false) => {
            const [x, y] = toXY(deg, r, cx, cy);
            return (
              <Line
                key={key}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke={c.chartInk}
                strokeWidth={heavy ? chart.strokeHeavy : chart.stroke}
              />
            );
          };
          const label = (from: number, to: number, rad: number, text: string, key: string) => {
            const [x, y] = toXY((from + to) / 2, rad, cx, cy);
            return (
              <ChartText
                key={key}
                x={x}
                y={y + 4}
                fontSize={chart.value}
                fontWeight="700"
                textAnchor="middle"
              >
                {text}
              </ChartText>
            );
          };
          const [hx, hy] = toXY(a, r, cx, cy);
          return (
            <>
              <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
                {/* The first angle's wedge, then the second's, on the same vertex. */}
                <Path
                  d={`${arc(0, a, r * 0.55)} L ${cx} ${cy} Z`}
                  fill={c.chartHighlight}
                  opacity={0.25}
                />
                <Path d={`${arc(a, whole, r * 0.55)} L ${cx} ${cy} Z`} fill={c.chartFill} />
                <Path
                  d={arc(0, Math.min(whole, 359.9), r * 0.72)}
                  stroke={c.chartMuted}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dash}
                  fill="none"
                />
                {ray(0, 'r0', true)}
                {ray(a, 'r1')}
                {ray(whole, 'r2', true)}
                <Circle cx={cx} cy={cy} r={4} fill={c.chartInk} />
                {a > 8 ? label(0, a, r * 0.38, `${rep.value(first)}`, 'la') : null}
                {b > 8 ? label(a, whole, r * 0.38, `${rep.value(second)}`, 'lb') : null}
                {whole > 0
                  ? label(0, Math.min(whole, 359.9), r * 0.86, `${rep.value(spec.whole)}`, 'lw')
                  : null}
              </Svg>
              <DragHandle
                testID={`drag-${first}`}
                x={hx}
                y={hy}
                label={rep.variable(first).name}
                onStart={() => {
                  start.current = { a, cx, cy, r };
                }}
                onMove={(dx, dy) => {
                  const [sx, sy] = toXY(
                    start.current.a,
                    start.current.r,
                    start.current.cx,
                    start.current.cy,
                  );
                  const deg =
                    (-Math.atan2(sy + dy - start.current.cy, sx + dx - start.current.cx) * 180) /
                    Math.PI;
                  const next = ((Math.round(deg) % 360) + 360) % 360;
                  calc.set({
                    ...rep.pin([second]),
                    [first]: rep.snapTo(first, next * rep.factor(first)),
                  });
                }}
              />
            </>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? `${rep.named(first)} and ${rep.named(second)} make ${rep.named(spec.whole)}: ${kindOf(whole)}.`
          : `${rep.named(first)}. ${rep.named(second)}.`}
      </Caption>
      <Steppers
        calc={calc}
        items={spec.parts.map((id) => ({
          var: id,
          steps: [1, 10],
          pin: spec.parts.filter((x) => x !== id),
        }))}
      />
    </View>
  );
}
