import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, useRep } from './common';

type Spec = Extract<Representation, { kind: 'compareRows' }>;

/**
 * Two rows lined up one-to-one from the same starting edge. Objects without a partner are the
 * difference (`spec.difference`, found by the formulas). Tap a spot in a row to set that row's count (tap the last one to remove it).
 */
export function CompareRows({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const rows = [spec.a, spec.b];
  const counts = rows.map((id) => (rep.known(id) ? Math.round(rep.shown(id)) : 0));
  const max = Math.max(10, ...rows.map((id) => rep.variable(id).max ?? 10));
  const [a, b] = counts as [number, number];
  const more = a > b ? spec.a : spec.b;
  const less = a > b ? spec.b : spec.a;
  const n = Math.abs(a - b);
  const amount = spec.icon === 'cube' ? `${n} ${n === 1 ? 'cube' : 'cubes'} ` : `${n} `;
  const name = (id: string) => rep.variable(id).name;
  // "A has 3 more than B." / "Pencil A is 3 cubes longer than pencil B."
  const verdict =
    !rep.known(spec.a) || !rep.known(spec.b)
      ? ''
      : a === b
        ? spec.icon === 'cube'
          ? 'They are the same length.'
          : 'They are equal.'
        : spec.icon === 'cube'
          ? `${name(more)} is ${amount}${spec.words[0]} than ${name(less)}. ${name(less)} is ${amount}${spec.words[1]}.`
          : `${name(more)} has ${amount}${spec.words[0]}. ${name(less)} has ${amount}${spec.words[1]}.`;
  // Cubes touch (a length); counters have space between them.
  const inner = spec.icon === 'cube' ? 1 : 0.78;

  return (
    <View style={{ gap: space.sm }}>
      <Canvas aspect={(w) => (2 * Math.min(34, (w - 110) / max) + space.md) / w}>
        {({ w }) => {
          const cell = Math.min(34, (w - 110) / max);
          return (
            <View style={{ gap: space.md, paddingHorizontal: space.sm }}>
              {rows.map((id, r) => (
                <View key={id} style={styles.row}>
                  <Text style={[styles.name, { color: c.text }]} numberOfLines={2}>
                    {rep.variable(id).name}
                  </Text>
                  <View style={{ flexDirection: 'row' }}>
                    {Array.from({ length: max }, (_, i) => {
                      const filled = i < counts[r]!;
                      const extra = filled && i >= Math.min(a, b);
                      return (
                        <Pressable
                          key={i}
                          testID={`row-${id}-${i + 1}`}
                          accessibilityLabel={`${rep.variable(id).name}: ${i + 1}`}
                          onPress={() =>
                            calc.set({
                              ...rep.pin(rows.filter((x) => x !== id)),
                              [id]: i + 1 === counts[r] ? i : i + 1,
                            })
                          }
                          style={{
                            width: cell,
                            height: cell,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <View
                            style={{
                              width: cell * inner,
                              height: cell * inner,
                              borderRadius: spec.icon === 'dot' ? cell : 0,
                              borderWidth: filled ? chart.strokeLight : StyleSheet.hairlineWidth,
                              borderColor: filled ? c.chartInk : c.chartGrid,
                              backgroundColor: filled
                                ? extra
                                  ? c.chartHighlight
                                  : c.chartFill
                                : 'transparent',
                            }}
                          />
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          );
        }}
      </Canvas>
      {verdict ? <Text style={[styles.verdict, { color: c.text }]}>{verdict}</Text> : null}
      <Text style={[styles.legend, { color: c.textMuted }]}>
        {`Dark ${spec.icon === 'dot' ? 'counters' : 'cubes'} have no partner in the other row.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  name: { width: 84, fontSize: font.caption + 1 },
  verdict: { fontSize: font.body, fontWeight: '600', textAlign: 'center' },
  legend: { fontSize: font.caption + 1, textAlign: 'center' },
});
