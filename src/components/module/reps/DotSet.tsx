import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { SegmentedControl } from '@/components/SegmentedControl';
import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'dotSet' }>;
type Layout = 'line' | 'array' | 'circle' | 'scattered';

/** Fixed "scattered" spots (in a unit square), so the dots don't jump around. */
const SCATTER = [
  [0.12, 0.2],
  [0.55, 0.12],
  [0.85, 0.3],
  [0.3, 0.45],
  [0.7, 0.55],
  [0.1, 0.75],
  [0.45, 0.8],
  [0.88, 0.8],
  [0.62, 0.35],
  [0.25, 0.1],
  [0.4, 0.62],
  [0.78, 0.1],
  [0.18, 0.55],
  [0.92, 0.55],
  [0.55, 0.95],
  [0.05, 0.4],
  [0.35, 0.28],
  [0.68, 0.75],
  [0.25, 0.92],
  [0.82, 0.95],
] as const;

/**
 * The same number of dots in a line, an array, a circle or scattered: the count doesn't
 * change with the arrangement. − / + change how many.
 */
export function DotSet({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const [layout, setLayout] = useState<Layout>('scattered');
  const n = rep.known(spec.count) ? Math.max(0, Math.round(rep.shown(spec.count))) : 0;

  return (
    <View>
      <View style={styles.toggle}>
        <SegmentedControl<Layout>
          segments={[
            { value: 'line', label: 'Line' },
            { value: 'array', label: 'Rows' },
            { value: 'circle', label: 'Circle' },
            { value: 'scattered', label: 'Scattered' },
          ]}
          value={layout}
          onChange={setLayout}
        />
      </View>
      <Canvas aspect={0.55}>
        {({ w, h }) => {
          const r = Math.min(12, w / 50);
          const pos = (i: number): [number, number] => {
            if (layout === 'line') {
              const gap = Math.min(3 * r, (w - 4 * r) / Math.max(1, n));
              const x0 = (w - gap * (n - 1)) / 2;
              return [x0 + gap * i, h / 2];
            }
            if (layout === 'array') {
              // Rows of 5, like a ten-frame without the frame.
              const gap = 3 * r;
              const rows = Math.ceil(n / 5);
              return [
                w / 2 - 2 * gap + (i % 5) * gap,
                h / 2 - ((rows - 1) * gap) / 2 + Math.floor(i / 5) * gap,
              ];
            }
            if (layout === 'circle') {
              const t = (2 * Math.PI * i) / Math.max(1, n) - Math.PI / 2;
              const R = Math.min(w, h) / 2 - 2 * r;
              return [w / 2 + R * Math.cos(t), h / 2 + R * Math.sin(t)];
            }
            const [x, y] = SCATTER[i % SCATTER.length]!;
            return [2 * r + x * (w - 4 * r), 2 * r + y * (h - 4 * r)];
          };
          return (
            <Svg width={w} height={h}>
              {Array.from({ length: n }, (_, i) => {
                const [x, y] = pos(i);
                return (
                  <Circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={r}
                    fill={c.chartHighlight}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                );
              })}
            </Svg>
          );
        }}
      </Canvas>
      <Text style={[styles.caption, { color: c.text }]}>
        {`${rep.label(spec.count)} dots, however they are arranged`}
      </Text>
      <Steppers calc={calc} items={[{ var: spec.count, steps: [1], pin: [] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { paddingHorizontal: space.md, marginBottom: space.sm },
  caption: { fontSize: font.body, fontWeight: '600', textAlign: 'center', marginTop: space.sm },
});
