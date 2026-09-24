import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { SegmentedControl } from '@/components/SegmentedControl';
import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'partition' }>;

const NAMES: Record<number, string> = { 1: 'one whole', 2: 'halves', 3: 'thirds', 4: 'fourths' };

/**
 * A whole (circle or rectangle) cut into equal parts; tap a part to shade or unshade it. − / +
 * change the parts. More equal parts make each part smaller.
 */
export function Partition({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  // Tests show both round and rectangular wholes; the student can switch.
  const [shape, setShape] = useState(spec.shape);
  const p = Math.max(1, Math.round(rep.shown(spec.parts)));
  const k = Math.min(p, Math.max(0, Math.round(rep.shown(spec.shaded))));
  const tap = (i: number) =>
    calc.set({ ...rep.pin([spec.parts]), [spec.shaded]: i < k ? i : i + 1 });

  return (
    <View>
      <View style={styles.toggle}>
        <SegmentedControl
          segments={[
            { value: 'circle', label: 'Circle' },
            { value: 'rectangle', label: 'Rectangle' },
          ]}
          value={shape}
          onChange={setShape}
        />
      </View>
      <Canvas aspect={0.62}>
        {({ w, h }) => {
          const size = Math.min(w - 32, h - 16);
          if (shape === 'rectangle') {
            const rw = Math.min(w - 32, size * 1.6);
            const x0 = (w - rw) / 2;
            const y0 = (h - size * 0.7) / 2;
            return (
              <Svg width={w} height={h}>
                {Array.from({ length: p }, (_, i) => (
                  <Rect
                    key={i}
                    testID={`part-${i + 1}`}
                    x={x0 + (rw / p) * i}
                    y={y0}
                    width={rw / p}
                    height={size * 0.7}
                    fill={i < k ? c.chartHighlight : c.chartFill}
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                    onPress={() => tap(i)}
                  />
                ))}
              </Svg>
            );
          }
          const r = size / 2;
          const cx = w / 2;
          const cy = h / 2;
          const slice = (i: number) => {
            if (p === 1)
              return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
            const a0 = -Math.PI / 2 + (2 * Math.PI * i) / p;
            const a1 = a0 + (2 * Math.PI) / p;
            const [x0, y0, x1, y1] = [
              cx + r * Math.cos(a0),
              cy + r * Math.sin(a0),
              cx + r * Math.cos(a1),
              cy + r * Math.sin(a1),
            ];
            return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1} Z`;
          };
          return (
            <Svg width={w} height={h}>
              {Array.from({ length: p }, (_, i) => (
                <Path
                  key={i}
                  testID={`part-${i + 1}`}
                  d={slice(i)}
                  fill={i < k ? c.chartHighlight : c.chartFill}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                  onPress={() => tap(i)}
                />
              ))}
            </Svg>
          );
        }}
      </Canvas>
      <Text style={[styles.caption, { color: c.text }]}>
        {`${p} equal parts (${NAMES[p] ?? `${p} parts`}): ${k} shaded, ${p - k} not shaded`}
      </Text>
      <Steppers calc={calc} items={[{ var: spec.parts, steps: [1], pin: [spec.shaded] }]} />
      <Text style={[styles.hint, { color: c.textMuted }]}>Tap a part to shade it.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { paddingHorizontal: space.lg, marginBottom: space.sm },
  caption: { fontSize: font.body, fontWeight: '600', textAlign: 'center', marginTop: space.sm },
  hint: { fontSize: font.caption + 1, textAlign: 'center', marginTop: space.xs },
});
