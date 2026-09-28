import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SegmentedControl } from '@/components/SegmentedControl';
import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { ClockDial, clockGeometry } from './ClockDial';
import { Canvas, Caption, DragHandle, useRep } from './common';
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
  // a.m. or p.m. doesn't change the hands, only what the time means (morning or afternoon).
  const [half, setHalf] = useState<'am' | 'pm'>('am');
  const h = rep.known(spec.hour) ? Math.round(rep.shown(spec.hour)) : 12;
  const m = rep.known(spec.minute) ? Math.round(rep.shown(spec.minute)) : 0;
  const minuteAngle = (m / 60) * 2 * Math.PI;
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
      {/* A smaller face, so the face, a.m./p.m., caption and Hour slider fit one phone screen. */}
      <View style={styles.face}>
        <Canvas aspect={1}>
          {({ w, h: ht }) => {
            const { cx, cy, at, minuteTip } = clockGeometry(w, ht, true);
            const [mx, my] = at(minuteAngle, minuteTip);
            return (
              <>
                <ClockDial w={w} h={ht} hour={h} minute={m} minuteLabels />
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
                    calc.set(
                      {
                        ...rep.pin([spec.hour]),
                        [spec.minute]: rep.snapTo(spec.minute, minutes % 60),
                      },
                      rep.slide(spec.minute),
                    );
                  }}
                />
              </>
            );
          }}
        </Canvas>
      </View>
      <Text style={[styles.digital, { color: c.text }]}>
        {`${digital}${spec.ampm ? (half === 'am' ? ' a.m.' : ' p.m.') : ''}${words ? `  (${words})` : ''}`}
      </Text>
      {spec.ampm ? (
        <View style={styles.toggle}>
          <SegmentedControl
            segments={[
              { value: 'am', label: 'a.m. (midnight to noon)' },
              { value: 'pm', label: 'p.m. (noon to midnight)' },
            ]}
            value={half}
            onChange={setHalf}
          />
        </View>
      ) : null}
      <Caption>
        {`Short hand: ${rep.label(spec.hour)}. Long hand: ${rep.label(spec.minute)} minutes.`}
      </Caption>
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
  face: { width: '100%', maxWidth: 310, alignSelf: 'center' },
  toggle: { paddingHorizontal: space.lg, marginVertical: space.sm },
  digital: {
    fontSize: font.title,
    fontWeight: '700',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  hint: { fontSize: font.caption + 1, textAlign: 'center', marginTop: space.sm },
});
