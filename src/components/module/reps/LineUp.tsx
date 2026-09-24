import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'lineUp' }>;

/**
 * Children standing in a line, the front on the left. One child (at `position`) is
 * highlighted; tap a child to pick them. − / + change how many are in line.
 */
export function LineUp({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const n = rep.known(spec.count) ? Math.max(0, Math.round(rep.shown(spec.count))) : 0;
  const p = rep.known(spec.position) ? Math.round(rep.shown(spec.position)) : 0;
  const max = rep.variable(spec.count).max ?? 10;

  return (
    <View style={{ gap: space.sm }}>
      <Text style={[styles.front, { color: c.textMuted }]}>Front of the line ←</Text>
      <Canvas aspect={(w) => (Math.min(56, (w - 16) / max) * 1.9) / w}>
        {({ w }) => {
          const cell = Math.min(56, (w - 16) / max);
          return (
            <View style={styles.row}>
              {Array.from({ length: n }, (_, i) => {
                const me = i + 1 === p;
                const fill = me ? c.chartHighlight : i + 1 < p ? c.chartFill : c.chartSurface;
                return (
                  <Pressable
                    key={i}
                    testID={`child-${i + 1}`}
                    accessibilityLabel={`Child ${i + 1}`}
                    onPress={() => calc.set({ ...rep.pin([spec.count]), [spec.position]: i + 1 })}
                    style={{ width: cell, alignItems: 'center' }}
                  >
                    <View
                      style={{
                        width: cell * 0.42,
                        height: cell * 0.42,
                        borderRadius: cell,
                        borderWidth: chart.stroke,
                        borderColor: c.chartInk,
                        backgroundColor: fill,
                      }}
                    />
                    <View
                      style={{
                        width: cell * 0.62,
                        height: cell * 0.8,
                        marginTop: 2,
                        borderTopLeftRadius: cell * 0.3,
                        borderTopRightRadius: cell * 0.3,
                        borderWidth: chart.stroke,
                        borderColor: c.chartInk,
                        backgroundColor: fill,
                      }}
                    />
                    <Text style={[styles.num, { color: c.textMuted }]}>{i + 1}</Text>
                  </Pressable>
                );
              })}
            </View>
          );
        }}
      </Canvas>
      <Text style={[styles.caption, { color: c.text }]}>
        {`${rep.label(spec.before)} in front of the dark child   ·   ${rep.label(spec.after)} behind`}
      </Text>
      <Steppers calc={calc} items={[{ var: spec.count, steps: [1], pin: [spec.position] }]} />
      <Text style={[styles.hint, { color: c.textMuted }]}>Tap a child to pick them.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  front: { fontSize: font.caption + 1, paddingHorizontal: space.md },
  row: { flexDirection: 'row', paddingHorizontal: space.sm },
  num: { fontSize: font.caption },
  caption: { fontSize: font.body, fontWeight: '600', textAlign: 'center' },
  hint: { fontSize: font.caption + 1, textAlign: 'center' },
});
