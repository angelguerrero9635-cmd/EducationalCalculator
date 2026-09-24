import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, radius, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, useRep } from './common';

type Spec = Extract<Representation, { kind: 'tenFrame' }>;

/**
 * Ten-frames (2 rows of 5 each) with dark counters for the first group and light counters for
 * the second. Tapping cell k inside the dark counters sets the first group to k; tapping
 * beyond them sets the total (or the second group, when the total is fixed). Tapping a group's
 * last counter removes it, so a group can go down to 0.
 */
export function TenFrame({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (x: string | number) => (typeof x === 'number' ? x : Math.round(rep.shown(x)));
  const known = (x: string | number) => typeof x === 'number' || rep.known(x);
  const a = num(spec.first);
  const b = num(spec.second);
  const frames = spec.frames ?? 1;
  const faded = !known(spec.first) || !known(spec.second);
  const text = (x: string | number) => (known(x) ? String(num(x)) : '?');
  const secondIsVar = typeof spec.second === 'string';

  const tap = (k: number) => {
    const firstPin = typeof spec.first === 'string' ? [spec.first] : [];
    if (k <= a) {
      if (typeof spec.first !== 'string') return; // a fixed group can't change
      const pin = secondIsVar ? [spec.second as string] : [];
      calc.set({ ...rep.pin(pin), [spec.first]: k === a ? k - 1 : k });
    } else if (typeof spec.total === 'string') {
      calc.set({ ...rep.pin(firstPin), [spec.total]: k === a + b ? k - 1 : k });
    } else if (secondIsVar) {
      calc.set({
        ...rep.pin(firstPin),
        [spec.second as string]: k === a + b ? k - a - 1 : k - a,
      });
    }
  };

  return (
    <View style={{ gap: space.md }}>
      <Canvas aspect={frames === 2 ? 0.8 : 0.42}>
        {({ w }) => {
          const cell = Math.min(64, (w - 24) / 5);
          return (
            <View style={{ alignSelf: 'center', gap: space.md, opacity: faded ? 0.35 : 1 }}>
              {Array.from({ length: frames }, (_, f) => (
                <View key={f} style={[styles.frame, { borderColor: c.chartInk }]}>
                  <View style={{ width: cell * 5, flexDirection: 'row', flexWrap: 'wrap' }}>
                    {Array.from({ length: 10 }, (_, j) => {
                      const i = f * 10 + j;
                      const kind = i < a ? 'first' : i < a + b ? 'second' : 'empty';
                      return (
                        <Pressable
                          key={i}
                          testID={`frame-${i + 1}`}
                          accessibilityLabel={`${i + 1}`}
                          onPress={() => tap(i + 1)}
                          style={[
                            styles.cell,
                            { width: cell, height: cell, borderColor: c.chartGrid },
                          ]}
                        >
                          {kind !== 'empty' ? (
                            <View
                              style={{
                                width: cell * 0.62,
                                height: cell * 0.62,
                                borderRadius: cell,
                                borderWidth: chart.stroke,
                                borderColor: c.chartInk,
                                backgroundColor: kind === 'first' ? c.chartHighlight : c.chartFill,
                              }}
                            />
                          ) : null}
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
      <Text style={[styles.sum, { color: c.text }]}>
        {`${text(spec.first)} + ${text(spec.second)} = ${text(spec.total)}`}
      </Text>
      <Text style={[styles.legend, { color: c.textMuted }]}>
        {`● ${typeof spec.first === 'string' ? rep.tag(spec.first) : `A ten (${spec.first} ones)`}   ○ ${
          typeof spec.second === 'string' ? rep.tag(spec.second) : `${spec.second} more`
        }`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderWidth: chart.stroke, borderRadius: radius.sm, overflow: 'hidden' },
  cell: { alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth },
  sum: { fontSize: font.title, fontWeight: '700', textAlign: 'center' },
  legend: { fontSize: font.caption + 1, textAlign: 'center' },
});
