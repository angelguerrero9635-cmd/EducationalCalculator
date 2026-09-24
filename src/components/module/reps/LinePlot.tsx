import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { getUnit } from '@/engine/units';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'linePlot' }>;

/** Most X's drawn in one column. */
const MAX = 10;

/**
 * Line plot: a number line with one X above a value for each object measured at that value.
 * Tap the k-th spot above a value to make its count k (tap the top X to take one away).
 */
export function LinePlot({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = spec.points.map((p) => p.var);
  // With a start value, the lengths are start, start + 1, …; otherwise the points' own values.
  const first = spec.points[0]?.at ?? 0;
  const at = (x: number) =>
    spec.start && rep.known(spec.start) ? Math.round(rep.shown(spec.start)) + x - first : x;

  return (
    <View style={{ gap: space.sm, paddingHorizontal: space.md }}>
      <View style={styles.plot}>
        {spec.points.map((p) => {
          const n = rep.known(p.var) ? Math.max(0, Math.round(rep.shown(p.var))) : 0;
          return (
            <View key={p.var} style={styles.column}>
              {Array.from({ length: MAX }, (_, k) => MAX - 1 - k).map((i) => (
                <Pressable
                  key={i}
                  testID={`x-${p.var}-${i + 1}`}
                  accessibilityLabel={`${at(p.at)}${spec.unit ? ` ${spec.unit}` : ''}: ${i + 1}`}
                  onPress={() =>
                    calc.set({
                      ...rep.pin(ids.filter((id) => id !== p.var)),
                      [p.var]: i + 1 === n ? n - 1 : i + 1,
                    })
                  }
                  style={styles.cell}
                >
                  <Text
                    style={[
                      styles.x,
                      { color: i < n ? c.chartInk : c.chartGrid, opacity: i < n ? 1 : 0.5 },
                    ]}
                  >
                    {i < n ? '×' : '·'}
                  </Text>
                </Pressable>
              ))}
            </View>
          );
        })}
      </View>
      <View style={[styles.axis, { borderTopColor: c.chartInk }]}>
        {spec.points.map((p) => (
          <View key={p.var} style={styles.tick}>
            <View style={[styles.tickMark, { backgroundColor: c.chartInk }]} />
            <Text style={[styles.label, { color: c.text }]}>{at(p.at)}</Text>
            <Text style={[styles.count, { color: c.textMuted }]}>{rep.label(p.var)}</Text>
          </View>
        ))}
      </View>
      {spec.start ? (
        <Steppers calc={calc} items={[{ var: spec.start, steps: [1], pin: ids }]} />
      ) : null}
      {spec.unit ? (
        <Text
          style={[styles.unit, { color: c.textMuted }]}
        >{`Length in ${getUnit(spec.unit)?.name ?? spec.unit}`}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  plot: { flexDirection: 'row' },
  column: { flex: 1, alignItems: 'center' },
  cell: { height: 20, width: 36, alignItems: 'center', justifyContent: 'center' },
  x: { fontSize: font.body + 2, fontWeight: '700', lineHeight: 20 },
  axis: { flexDirection: 'row', borderTopWidth: chart.stroke },
  tick: { flex: 1, alignItems: 'center' },
  tickMark: { width: 1.5, height: 8 },
  label: { fontSize: font.caption + 1, fontVariant: ['tabular-nums'] },
  unit: { fontSize: font.caption + 1, textAlign: 'center' },
  count: { fontSize: font.caption, fontVariant: ['tabular-nums'] },
});
