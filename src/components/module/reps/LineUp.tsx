import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, nowrap, useRep } from './common';
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
      {/* Head and body, then three lines of labels: number, "next to", and the picked place. */}
      <Canvas
        aspect={(w) => {
          const { cell, rows } = layout(w, max);
          return (rows * (cell * 1.3 + 3 * LINE)) / w;
        }}
      >
        {({ w }) => {
          const { cell } = layout(w, max);
          return (
            <View style={styles.row}>
              {Array.from({ length: n }, (_, i) => {
                const me = i + 1 === p;
                // The picked child is solid, children in front are shaded, children behind open.
                const fill = me ? c.chartHighlight : i + 1 < p ? c.chartFill : 'transparent';
                const next = Math.abs(i + 1 - p) === 1;
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
                    {/* One line lower than "next to", so the labels of neighbors never touch. */}
                    {me ? (
                      <Text style={[styles.next, { color: c.text, marginTop: LINE }]}>
                        {nowrap(`${rep.variable(spec.position).symbol} = ${p}`)}
                      </Text>
                    ) : null}
                    {next ? <Text style={[styles.next, { color: c.text }]}>next to</Text> : null}
                  </Pressable>
                );
              })}
            </View>
          );
        }}
      </Canvas>
      <Text style={[styles.caption, { color: c.text }]}>
        {`${nowrap(rep.label(spec.before))} in front of the picked child   ·   ${nowrap(`${rep.label(spec.after)} behind`)}`}
      </Text>
      <Steppers calc={calc} items={[{ var: spec.count, steps: [1], pin: [spec.position] }]} />
      <Text style={[styles.hint, { color: c.textMuted }]}>Tap a child to pick them.</Text>
    </View>
  );
}

/** Height of one line of labels under the children. */
const LINE = font.caption + space.xs;

/**
 * Child width at canvas width w: at least 44 px so each child is easy to tap. A line longer
 * than fits wraps to a second row.
 */
const layout = (w: number, max: number) => {
  const cell = Math.max(44, Math.min(56, (w - 16) / max));
  const perRow = Math.max(1, Math.floor((w - 16) / cell));
  return { cell, rows: Math.ceil(max / perRow) };
};

const styles = StyleSheet.create({
  front: { fontSize: font.caption + 1, paddingHorizontal: space.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: space.sm },
  num: { fontSize: font.caption, lineHeight: LINE },
  next: { fontSize: font.caption - 1, lineHeight: LINE, textAlign: 'center' },
  caption: { fontSize: font.body, fontWeight: '600', textAlign: 'center' },
  hint: { fontSize: font.caption + 1, textAlign: 'center' },
});
