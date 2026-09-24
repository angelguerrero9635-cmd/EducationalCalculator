import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'clock' }>;

/**
 * Analog clock. The long hand shows the minutes (drag it; it snaps to `minuteStep`); the short
 * hand moves between hours as the minutes pass. − / + change the hour.
 */
export function Clock({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef({ x: 0, y: 0 });
  const h = rep.known(spec.hour) ? Math.round(rep.shown(spec.hour)) : 12;
  const m = rep.known(spec.minute) ? Math.round(rep.shown(spec.minute)) : 0;
  const minuteAngle = (m / 60) * 2 * Math.PI;
  const hourAngle = (((h % 12) + m / 60) / 12) * 2 * Math.PI;
  const digital = `${h}:${String(m).padStart(2, '0')}`;
  // Time words students hear: o’clock, quarter past, half past, quarter to.
  const words =
    m === 0
      ? `${h} o’clock`
      : m === 15
        ? `quarter past ${h}`
        : m === 30
          ? `half past ${h}`
          : m === 45
            ? `quarter to ${(h % 12) + 1}`
            : '';

  return (
    <View>
      <Canvas aspect={0.9}>
        {({ w, h: ht }) => {
          const cx = w / 2;
          const cy = ht / 2;
          const r = Math.min(w, ht) / 2 - 12;
          const at = (angle: number, len: number) =>
            [cx + len * Math.sin(angle), cy - len * Math.cos(angle)] as const;
          const [mx, my] = at(minuteAngle, r * 0.8);
          const [hx, hy] = at(hourAngle, r * 0.5);
          return (
            <>
              <Svg width={w} height={ht}>
                <Circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={c.background}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeHeavy}
                />
                {Array.from({ length: 60 }, (_, i) => {
                  const [x1, y1] = at((i / 60) * 2 * Math.PI, r - (i % 5 === 0 ? 10 : 5));
                  const [x2, y2] = at((i / 60) * 2 * Math.PI, r);
                  return (
                    <Line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={i % 5 === 0 ? c.chartInk : c.chartGrid}
                      strokeWidth={i % 5 === 0 ? chart.stroke : 1}
                    />
                  );
                })}
                {Array.from({ length: 12 }, (_, i) => {
                  const [x, y] = at(((i + 1) / 12) * 2 * Math.PI, r - 26);
                  return (
                    <ChartText
                      key={`n${i}`}
                      x={x}
                      y={y + 5}
                      fontSize={chart.emphasis}
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {i + 1}
                    </ChartText>
                  );
                })}
                <Line
                  x1={cx}
                  y1={cy}
                  x2={hx}
                  y2={hy}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeHeavy + 3}
                  strokeLinecap="round"
                />
                <Line
                  x1={cx}
                  y1={cy}
                  x2={mx}
                  y2={my}
                  stroke={c.chartMuted}
                  strokeWidth={chart.strokeHeavy}
                  strokeLinecap="round"
                />
                <Circle cx={cx} cy={cy} r={6} fill={c.chartInk} />
              </Svg>
              <DragHandle
                testID="drag-minute"
                x={mx}
                y={my}
                label={rep.variable(spec.minute).name}
                onStart={() => (start.current = { x: mx, y: my })}
                onMove={(dx, dy) => {
                  const x = start.current.x + dx - cx;
                  const y = start.current.y + dy - cy;
                  let minutes = ((Math.atan2(x, -y) / (2 * Math.PI)) * 60 + 60) % 60;
                  minutes = Math.round(minutes / spec.minuteStep) * spec.minuteStep;
                  calc.set({
                    ...rep.pin([spec.hour]),
                    [spec.minute]: rep.snapTo(spec.minute, minutes % 60),
                  });
                }}
              />
            </>
          );
        }}
      </Canvas>
      <Text style={[styles.digital, { color: c.text }]}>
        {words ? `${digital}  (${words})` : digital}
      </Text>
      <Text style={[styles.hands, { color: c.textMuted }]}>
        {`Short hand: ${rep.label(spec.hour)}   ·   Long hand: ${rep.label(spec.minute)} minutes`}
      </Text>
      <Steppers
        calc={calc}
        items={[{ var: spec.hour, steps: [1], pin: [spec.minute], wrap: [1, 12] }]}
      />
      <Text style={[styles.hint, { color: c.textMuted }]}>
        Drag the long hand to change the minutes.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hands: { fontSize: font.caption + 1, textAlign: 'center' },
  digital: {
    fontSize: font.title,
    fontWeight: '700',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  hint: { fontSize: font.caption + 1, textAlign: 'center', marginTop: space.sm },
});
