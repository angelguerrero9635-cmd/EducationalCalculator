import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, radius, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, useRep } from './common';

type Spec = Extract<Representation, { kind: 'tenFrame' }>;

/**
 * Ten-frame (2 rows of 5) with dark counters for the first group and light counters for the
 * second. Tapping cell k inside the dark counters sets the first group to k; tapping beyond
 * them sets the total to k. Tapping a group's last counter removes it.
 */
export function TenFrame({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const a = Math.round(rep.val(spec.first));
  const b = Math.round(rep.val(spec.second));
  const faded = ![spec.first, spec.second].every(rep.known);
  const value = (id: string) => (rep.known(id) ? String(Math.round(rep.val(id))) : '?');

  // Tapping the last counter of a group removes it, so either group can go down to 0.
  const tap = (k: number) => {
    if (k <= a) {
      calc.set({ ...rep.pin([spec.second]), [spec.first]: k === a ? k - 1 : k });
    } else {
      calc.set({ ...rep.pin([spec.first]), [spec.total]: k === a + b ? k - 1 : k });
    }
  };

  return (
    <View style={{ gap: space.md }}>
      <Canvas aspect={0.42}>
        {({ w }) => {
          const cell = Math.min(64, (w - 24) / 5);
          // The border sits on a wrapper so the inner grid is exactly 5 cells wide.
          return (
            <View style={[styles.frame, { borderColor: c.chartInk, opacity: faded ? 0.35 : 1 }]}>
              <View style={{ width: cell * 5, flexDirection: 'row', flexWrap: 'wrap' }}>
                {Array.from({ length: 10 }, (_, i) => {
                  const kind = i < a ? 'first' : i < a + b ? 'second' : 'empty';
                  return (
                    <Pressable
                      key={i}
                      testID={`frame-${i + 1}`}
                      accessibilityLabel={`${i + 1}`}
                      onPress={() => tap(i + 1)}
                      style={[styles.cell, { width: cell, height: cell, borderColor: c.chartGrid }]}
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
          );
        }}
      </Canvas>
      <Text style={[styles.sum, { color: c.text }]}>
        {`${value(spec.first)} + ${value(spec.second)} = ${value(spec.total)}`}
      </Text>
      <Text style={[styles.legend, { color: c.textMuted }]}>
        {`● ${rep.variable(spec.first).name}   ○ ${rep.variable(spec.second).name}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignSelf: 'center',
    borderWidth: chart.stroke,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  sum: { fontSize: font.title, fontWeight: '700', textAlign: 'center' },
  legend: { fontSize: font.caption + 1, textAlign: 'center' },
});
