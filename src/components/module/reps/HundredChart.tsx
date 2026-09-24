import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, useRep } from './common';

type Spec = Extract<Representation, { kind: 'hundredChart' }>;

/**
 * Numbers 1–100 (or 1–120) in rows of ten. Every number up to `value` is shaded, so full rows
 * show the tens; `marks` (e.g. one more, ten more) are outlined. Tap a number to set `value`.
 */
export function HundredChart({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const n = rep.known(spec.value) ? Math.round(rep.shown(spec.value)) : 0;
  const marks = (spec.marks ?? []).filter(rep.known).map((id) => Math.round(rep.shown(id)));

  return (
    <View style={{ gap: space.sm }}>
      <Canvas aspect={spec.max / 100}>
        {({ w }) => {
          const cell = Math.floor((w - 8 - 2 * chart.stroke) / 10);
          return (
            <View
              style={[
                styles.grid,
                { width: cell * 10 + 2 * chart.stroke, borderColor: c.chartInk },
              ]}
            >
              {Array.from({ length: spec.max }, (_, i) => {
                const k = i + 1;
                const on = k <= n;
                const marked = marks.includes(k);
                return (
                  <Pressable
                    key={k}
                    testID={`num-${k}`}
                    accessibilityLabel={`${k}`}
                    onPress={() => calc.set({ [spec.value]: k })}
                    style={[
                      styles.cell,
                      {
                        width: cell,
                        height: cell,
                        borderColor: marked ? c.chartInk : c.chartGrid,
                        borderWidth: marked ? chart.stroke : StyleSheet.hairlineWidth,
                        backgroundColor:
                          k === n ? c.chartHighlight : on ? c.chartFill : c.background,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.num,
                        {
                          color: k === n ? c.onChartHighlight : c.chartInk,
                          fontSize: Math.min(font.caption + 1, cell / 2.6),
                        },
                      ]}
                    >
                      {k}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          );
        }}
      </Canvas>
      {marks.length ? (
        <Text style={[styles.caption, { color: c.textMuted }]}>
          {(spec.marks ?? []).map((id) => rep.label(id)).join('   ·   ')} (outlined)
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'center', borderWidth: chart.stroke },
  cell: { alignItems: 'center', justifyContent: 'center' },
  num: { fontVariant: ['tabular-nums'] },
  caption: { fontSize: font.caption + 1, textAlign: 'center' },
});
