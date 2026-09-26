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
  // A fixed whole (a full turn of 360°) has no value of its own.
  const wholeText = typeof spec.whole === 'number' ? `${spec.whole}°` : rep.value(spec.whole);
  const wholeNamed =
    typeof spec.whole === 'number' ? `a full turn, ${spec.whole}°` : rep.named(spec.whole);
  const start = useRef({ a: 0, cx: 0, cy: 0, r: 1 });
  const startW = useRef({ b: 0, cx: 0, cy: 0, r: 1 });
  const toXY = (deg: number, r: number, cx: number, cy: number) => {
    const t = (-deg * Math.PI) / 180;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)] as const;
  };

  // With sliders on other values (parts of a turn) the rays are not dragged.
  const draggable = !spec.sliders;
  // Past a straight angle the second ray goes below the first: the vertex moves to the middle.
  const reflex = whole > 180;

  return (
    <View>
      {/* Just tall enough for the rays (radius = half the width, less the handle's room). */}
      <Canvas aspect={(w) => (reflex ? 0.9 : 0.5 + 14 / w)}>
        {({ w, h }) => {
          const cx = w / 2;
          const cy = reflex ? h / 2 : h - 24;
          const r = Math.min(w / 2 - 30, (reflex ? h / 2 : h) - 44);
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
          const [wx, wy] = toXY(whole, r, cx, cy);
          const angleAt = (
            s: { cx: number; cy: number; r: number },
            from: number,
            dx: number,
            dy: number,
          ) => {
            const [sx, sy] = toXY(from, s.r, s.cx, s.cy);
            const deg = (-Math.atan2(sy + dy - s.cy, sx + dx - s.cx) * 180) / Math.PI;
            return ((Math.round(deg) % 360) + 360) % 360;
          };
          // The whole angle's label sits on its bisector, which is the middle ray when the two
          // angles are equal: then it moves 14° into the bigger part, where nothing is drawn.
          const mid = Math.min(whole, 359.9) / 2;
          const wholeAt = Math.abs(mid - a) < 12 ? (b >= a ? a + 14 : a - 14) : mid;
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
                {whole > 0 ? label(wholeAt, wholeAt, r * 0.86, wholeText, 'lw') : null}
              </Svg>
              {draggable ? (
                <DragHandle
                  testID={`drag-${first}`}
                  x={hx}
                  y={hy}
                  label={rep.variable(first).name}
                  onStart={() => {
                    start.current = { a, cx, cy, r };
                  }}
                  onMove={(dx, dy) => {
                    const next = angleAt(start.current, start.current.a, dx, dy);
                    calc.set({
                      ...rep.pin([second]),
                      [first]: rep.snapTo(first, next * rep.factor(first)),
                    });
                  }}
                />
              ) : null}
              {/* The outer ray moves the second angle; the first stays where it is. */}
              {draggable ? (
                <DragHandle
                  testID={`drag-${second}-end`}
                  x={wx}
                  y={wy}
                  label={rep.variable(second).name}
                  onStart={() => {
                    startW.current = { b, cx, cy, r };
                  }}
                  onMove={(dx, dy) => {
                    const next = angleAt(startW.current, a + startW.current.b, dx, dy);
                    // The whole ray's angle, less the first angle, is the second (never below 0).
                    const deg = (((next - a) % 360) + 360) % 360;
                    calc.set({
                      ...rep.pin([first]),
                      [second]: rep.snapTo(second, deg * rep.factor(second)),
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
          ? `${rep.named(first)} and ${rep.named(second)} make ${wholeNamed}: ${kindOf(whole)}.`
          : `${rep.named(first)}. ${rep.named(second)}.`}
      </Caption>
      <Steppers
        calc={calc}
        items={
          spec.sliders
            ? spec.sliders.map((id, _, all) => ({
                var: id,
                steps: [rep.variable(id).step ?? 1],
                pin: all.filter((x) => x !== id),
              }))
            : spec.parts.map((id) => ({
                var: id,
                steps: [1, 10],
                pin: spec.parts.filter((x) => x !== id),
              }))
        }
      />
    </View>
  );
}
