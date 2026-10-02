import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { angleDrag, wrap360 } from './angleDrag';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useRep } from './common';
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
  // A right or straight angle split in two (complementary, supplementary): the whole is fixed,
  // so only the middle ray turns and the second part follows it.
  const fixed = spec.whole === 90 || spec.whole === 180 ? spec.whole : undefined;
  // Two crossing lines: the second line runs on through the vertex, making vertical angles.
  const cross = fixed === 180 ? spec.cross : undefined;
  const typedA = rep.known(first) ? Math.max(0, rep.shown(first)) : undefined;
  const typedB = rep.known(second) ? Math.max(0, rep.shown(second)) : undefined;
  // With a fixed whole, one part known places the middle ray (its label still says "?").
  const a =
    typedA ??
    (fixed !== undefined ? (typedB !== undefined ? Math.max(0, fixed - typedB) : fixed / 3) : 0);
  const b = typedB ?? (fixed !== undefined ? Math.max(0, fixed - a) : 0);
  const whole = a + b;
  const known = rep.known(first) && rep.known(second);
  // A fixed whole (a full turn of 360°) has no value of its own.
  const wholeText = typeof spec.whole === 'number' ? `${spec.whole}°` : rep.value(spec.whole);
  const wholeNamed =
    typeof spec.whole === 'number' ? `a full turn, ${spec.whole}°` : rep.named(spec.whole);
  const sym = (id: string) => (rep.words ? rep.variable(id).name : rep.variable(id).symbol);
  const start = useRef({ a: 0, cx: 0, cy: 0, r: 1 });
  const startW = useRef({ b: 0, cx: 0, cy: 0, r: 1 });
  // The angle the drag has turned to: continuous as the pointer passes the vertex (angleDrag).
  const turn = useRef<(dx: number, dy: number) => number>(() => 0);
  const toXY = (deg: number, r: number, cx: number, cy: number) => {
    const t = (-deg * Math.PI) / 180;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)] as const;
  };

  // With sliders on other values (parts of a turn) the rays are not dragged.
  const draggable = !spec.sliders;
  // Past a straight angle the second ray goes below the first: the vertex moves to the middle.
  const reflex = whole > 180 || !!cross;

  return (
    <View>
      {/* Just tall enough for the rays (radius = half the width, less the handle's room). */}
      <Canvas aspect={(w) => (cross ? 0.9 : reflex ? 0.9 : fixed === 90 ? 0.7 : 0.5 + 14 / w)}>
        {({ w, h }) => {
          const cy = reflex ? h / 2 : h - 24;
          // A right angle opens up and to the right: its vertex sits left of the middle.
          const r =
            fixed === 90
              ? Math.min(w - 60, h - 44)
              : Math.min(w / 2 - 30, (reflex ? h / 2 : h) - (cross ? 26 : 44));
          const cx = fixed === 90 ? (w - r) / 2 : w / 2;
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
                strokeWidth={heavy && !cross ? chart.strokeHeavy : chart.stroke}
              />
            );
          };
          const label = (from: number, to: number, rad: number, text: string, key: string) => {
            const [x, y] = toXY((from + to) / 2, rad, cx, cy);
            return (
              <ChartText
                key={key}
                {...fitLabel(x, text, chart.value, w)}
                y={y + 4}
                fontSize={chart.value}
                fontWeight="700"
              >
                {text}
              </ChartText>
            );
          };
          // Grade 7 angle pairs name each part ("a = 50°"); a narrow part's name sits past its
          // wedge, where there is room.
          const tagged = (id: string) => (fixed === undefined ? rep.value(id) : rep.label(id));
          const at = (span: number) =>
            fixed === undefined || span >= 100 ? r * 0.38 : span >= 40 ? r * 0.56 : r * 0.84;
          // The first ray's handle sits inside the ray, so it never hides under the outer ray's
          // handle when the second angle is small.
          const [hx, hy] = toXY(a, r * 0.62, cx, cy);
          const [wx, wy] = toXY(whole, r, cx, cy);
          const [ox, oy] = toXY(a + 180, r * 0.62, cx, cy);
          /** Turns the middle ray to `deg`: inside a fixed whole the second part follows it. */
          const moveFirst = (deg: number) => {
            const next =
              fixed === undefined || deg <= fixed ? deg : deg > (fixed + 360) / 2 ? 0 : fixed;
            calc.set(
              {
                ...(fixed === undefined ? rep.pin([second]) : {}),
                [first]: rep.snapTo(first, next * rep.factor(first)),
              },
              rep.slide(first),
            );
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
                  d={`${arc(0, Math.min(a, 359.9), r * 0.55)} L ${cx} ${cy} Z`}
                  fill={c.chartHighlight}
                  opacity={0.25}
                />
                <Path d={`${arc(a, whole, r * 0.55)} L ${cx} ${cy} Z`} fill={c.chartFill} />
                {cross ? null : (
                  <Path
                    d={arc(0, Math.min(whole, 359.9), r * 0.72)}
                    stroke={c.chartMuted}
                    strokeWidth={chart.strokeLight}
                    strokeDasharray={chart.dash}
                    fill="none"
                  />
                )}
                {cross ? (
                  <>
                    {/* The vertical angles: across the vertex from each part, the same size. */}
                    <Path
                      d={`${arc(180, 180 + a, r * 0.55)} L ${cx} ${cy} Z`}
                      fill={c.chartHighlight}
                      opacity={0.25}
                    />
                    <Path d={`${arc(180 + a, 360, r * 0.55)} L ${cx} ${cy} Z`} fill={c.chartFill} />
                    {ray(180 + a, 'r3')}
                    {a > 8
                      ? label(
                          180,
                          180 + a,
                          at(a),
                          cross.first ? rep.label(cross.first) : rep.value(first),
                          'lc',
                        )
                      : null}
                    {b > 8
                      ? label(
                          180 + a,
                          360,
                          at(b),
                          cross.second ? rep.label(cross.second) : rep.value(second),
                          'ld',
                        )
                      : null}
                  </>
                ) : null}
                {fixed === 90 && known ? (
                  // The right-angle mark in the corner of the whole angle.
                  <Polyline
                    points={`${cx + 14},${cy} ${cx + 14},${cy - 14} ${cx},${cy - 14}`}
                    fill="none"
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                ) : null}
                {ray(0, 'r0', true)}
                {ray(a, 'r1')}
                {ray(whole, 'r2', true)}
                <Circle cx={cx} cy={cy} r={4} fill={c.chartInk} />
                {a > 8 ? label(0, a, at(a), tagged(first), 'la') : null}
                {b > 8 ? label(a, whole, at(b), tagged(second), 'lb') : null}
                {whole > 0 && b > 0 && !cross
                  ? label(wholeAt, wholeAt, r * 0.86, wholeText, 'lw')
                  : null}
              </Svg>
              {draggable ? (
                <DragHandle
                  testID={`drag-${first}`}
                  x={hx}
                  y={hy}
                  label={rep.variable(first).name}
                  onStart={() => {
                    start.current = { a, cx, cy, r };
                    turn.current = angleDrag(
                      { x: hx - cx, y: hy - cy },
                      a,
                      fixed === undefined ? {} : { min: 0, max: fixed },
                    );
                  }}
                  onMove={(dx, dy) => {
                    const deg = Math.round(turn.current(dx, dy));
                    moveFirst(fixed === undefined ? wrap360(deg) : deg);
                  }}
                />
              ) : null}
              {cross && draggable ? (
                // The same line's other end, across the vertex.
                <DragHandle
                  testID={`drag-${first}-across`}
                  x={ox}
                  y={oy}
                  label={rep.variable(first).name}
                  onStart={() => {
                    start.current = { a, cx, cy, r };
                    turn.current = angleDrag(
                      { x: ox - cx, y: oy - cy },
                      a + 180,
                      fixed === undefined ? {} : { min: 180, max: 180 + fixed },
                    );
                  }}
                  onMove={(dx, dy) => {
                    const deg = Math.round(turn.current(dx, dy)) - 180;
                    moveFirst(fixed === undefined ? wrap360(deg) : deg);
                  }}
                />
              ) : null}
              {/* The outer ray moves the second angle; the first stays where it is. A fixed whole
                  (a right or straight angle) has no outer ray to move. */}
              {draggable && fixed === undefined ? (
                <DragHandle
                  testID={`drag-${second}-end`}
                  x={wx}
                  y={wy}
                  label={rep.variable(second).name}
                  onStart={() => {
                    startW.current = { b, cx, cy, r };
                    turn.current = angleDrag({ x: wx - cx, y: wy - cy }, a + b, {
                      min: a,
                      max: a + 359,
                    });
                  }}
                  onMove={(dx, dy) => {
                    // The whole ray's angle, less the first angle, is the second (never below 0).
                    const deg = Math.round(turn.current(dx, dy)) - a;
                    calc.set(
                      {
                        ...rep.pin([first]),
                        [second]: rep.snapTo(second, deg * rep.factor(second)),
                      },
                      rep.slide(second),
                    );
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {fixed !== undefined
          ? [
              `${sym(first)} + ${sym(second)} = ${fixed}°`,
              `${rep.value(first)} + ${rep.value(second)} = ${fixed}°`,
              cross && !cross.first && !cross.second
                ? 'Vertical angles (across the vertex) are equal.'
                : cross
                  ? `Vertical angles are equal: ${[
                      [cross.first, first],
                      [cross.second, second],
                    ]
                      .filter((p): p is [string, string] => !!p[0])
                      .map(([v, p]) => `${sym(v)} = ${sym(p)} = ${rep.value(v)}`)
                      .join(', ')}.`
                  : fixed === 90
                    ? 'Complementary angles: together they make a right angle.'
                    : 'Supplementary angles: together they make a straight line.',
            ].join(' · ')
          : known
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
                pin: fixed === undefined ? spec.parts.filter((x) => x !== id) : [],
              }))
        }
      />
    </View>
  );
}
