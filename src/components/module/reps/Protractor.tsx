import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'protractor' }>;

/**
 * A protractor over an angle: one arm along the 0° line to the right, the other turned by
 * the angle. The inner scale counts up from the first arm; the outer scale counts from the
 * other end, so it reads 180° minus the angle. Drag the turned arm. With `arms`, neither arm is
 * on 0: each arm reads its own mark on the inner scale, both drag, and the angle between them
 * is the difference of the two readings.
 */
export function Protractor({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef({ a: 0, cx: 0, cy: 0, r: 1 });
  const known = rep.known(spec.angle);
  const clamp = (x: number) => Math.min(180, Math.max(0, x));
  const arms = spec.arms;
  const armsKnown = !arms || (rep.known(arms.first) && rep.known(arms.second));
  // The two arms' marks on the inner scale: 0 and the angle, or the two readings.
  const fa = arms ? clamp(rep.shown(arms.first)) : 0;
  const sa = arms ? clamp(rep.shown(arms.second)) : clamp(rep.shown(spec.angle));
  const a = Math.abs(sa - fa);
  const [loA, hiA] = [Math.min(fa, sa), Math.max(fa, sa)];

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
              // The end labels (0 and 180) sit above the flat edge, clear of a ray lying on it.
              const lift = d === 0 || d === 180 ? -6 : 3;
              marks.push(
                <ChartText
                  key={`i${d}`}
                  x={ix}
                  y={iy + lift}
                  fontSize={chart.tiny}
                  textAnchor="middle"
                >
                  {String(d)}
                </ChartText>,
                <ChartText
                  key={`o${d}`}
                  x={ox}
                  y={oy + lift}
                  fontSize={chart.tiny}
                  fill={c.chartMuted}
                  textAnchor="middle"
                >
                  {String(180 - d)}
                </ChartText>,
              );
            }
          }
          const [ax, ay] = toXY(sa, R + 24);
          const [wx, wy] = toXY(fa, R + 24);
          const arcStart = toXY(loA, 30);
          const arcEnd = toXY(hiA, 30);
          const [vx, vy] = arms ? toXY((loA + hiA) / 2, 52) : [cx, cy - R * 0.35];
          // Each arm's reading, on the plastic between the scale and the inner arc.
          // Each reading sits just outside the angle, beside its arm, not on it.
          const reading = (deg: number) => {
            const side = deg === loA && loA !== hiA ? -1 : 1;
            const [x, y] = toXY(Math.min(176, Math.max(4, deg + side * 8)), R * 0.66);
            return (
              <ChartText
                key={`r${deg}`}
                x={x}
                y={y + 4}
                fontSize={chart.label}
                fontWeight="700"
                fill={c.chartHighlight}
                textAnchor="middle"
              >
                {`${formatNumber(deg)}`}
              </ChartText>
            );
          };
          return (
            <>
              <Svg width={w} height={h} opacity={known && armsKnown ? 1 : 0.4}>
                <Path
                  d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy} Z`}
                  fill={c.shadow}
                  transform="translate(2 3)"
                />
                {/* Clear blue plastic, with its straight edge a little thicker. */}
                <Path
                  d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy} Z`}
                  fill={c.plastic}
                  fillOpacity={0.9}
                  stroke={c.glassEdge}
                  strokeWidth={chart.stroke}
                />
                <Path
                  d={`M ${cx - R * 0.93} ${cy - R * 0.12} A ${R * 0.94} ${R * 0.94} 0 0 1 ${cx - R * 0.35} ${cy - R * 0.87}`}
                  stroke={c.shine}
                  strokeOpacity={0.5}
                  strokeWidth={3}
                  strokeLinecap="round"
                  fill="none"
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
                    d={`M ${arcStart[0]} ${arcStart[1]} A 30 30 0 0 0 ${arcEnd[0]} ${arcEnd[1]}`}
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
                {arms && armsKnown ? [reading(fa), reading(sa)] : null}
                <ChartText
                  x={vx}
                  y={vy + (arms ? 5 : 0)}
                  fontSize={chart.emphasis}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {rep.value(spec.angle)}
                </ChartText>
              </Svg>
              {(arms
                ? armsKnown
                  ? [
                      { id: arms.first, deg: fa },
                      { id: arms.second, deg: sa },
                    ]
                  : []
                : known
                  ? [{ id: spec.angle, deg: sa }]
                  : []
              ).map(({ id, deg: at }) => {
                const [hx, hy] = toXY(at, R * (arms ? 0.86 : 0.8));
                return (
                  <DragHandle
                    key={id}
                    testID={`drag-${id}`}
                    x={hx}
                    y={hy}
                    label={rep.variable(id).name}
                    onStart={() => {
                      start.current = { a: at, cx, cy, r: R * (arms ? 0.86 : 0.8) };
                    }}
                    onMove={(dx, dy) => {
                      const s = start.current;
                      const [sx, sy] = toXY(s.a, s.r);
                      const deg = (-Math.atan2(sy + dy - s.cy, sx + dx - s.cx) * 180) / Math.PI;
                      const next = Math.min(180, Math.max(0, Math.round(deg)));
                      calc.set(
                        {
                          ...(arms
                            ? rep.pin([arms.first, arms.second].filter((x) => x !== id))
                            : {}),
                          [id]: rep.snapTo(id, next * rep.factor(id)),
                        },
                        rep.slide(id),
                      );
                    }}
                  />
                );
              })}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {arms
          ? armsKnown
            ? `Neither arm is on 0. The arms read ${formatNumber(fa)} and ${formatNumber(sa)} on the inner scale: ${formatNumber(hiA)} − ${formatNumber(loA)} = ${rep.value(spec.angle)}.`
            : 'Type where each arm is on the inner scale.'
          : known
            ? `The inner scale starts at 0 on the flat arm and reads ${rep.value(spec.angle)}.${spec.other ? ` The outer scale reads ${rep.value(spec.other)}: 180° − ${rep.value(spec.angle)}.` : ''}`
            : 'Type the angle to turn the arm.'}
      </Caption>
      <Steppers
        calc={calc}
        items={
          arms
            ? [
                { var: arms.first, steps: [1, 10], pin: [arms.second] },
                { var: arms.second, steps: [1, 10], pin: [arms.first] },
              ]
            : [{ var: spec.angle, steps: [1, 10], pin: [] }]
        }
      />
    </View>
  );
}
