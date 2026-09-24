import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'coins' }>;

/** Coins drawn to relative size with their values; − / + change how many of each. */
export function Coins({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = spec.coins.map((k) => k.var);
  const total = rep.known(spec.total) ? Math.round(rep.shown(spec.total)) : undefined;
  // US coin diameters (mm), so the drawings keep true relative sizes.
  const sizes: Record<number, number> = { 25: 24.3, 10: 17.9, 5: 21.2, 1: 19.1 };

  return (
    <View style={{ gap: space.sm }}>
      <View style={styles.rows}>
        {spec.coins.map((coin) => {
          const n = rep.known(coin.var) ? Math.round(rep.shown(coin.var)) : 0;
          const d = (sizes[coin.cents] ?? 20) * 1.5;
          return (
            <View key={coin.var} style={styles.row}>
              <Text
                style={[styles.name, { color: c.text }]}
              >{`${coin.name} (${coin.cents}¢)`}</Text>
              <View style={styles.coins}>
                {Array.from({ length: n }, (_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.coin,
                      {
                        width: d,
                        height: d,
                        borderRadius: d,
                        borderColor: c.chartInk,
                        backgroundColor: coin.cents === 1 ? c.chartHighlight : c.chartFill,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: font.caption,
                        color: coin.cents === 1 ? c.onChartHighlight : c.chartInk,
                      }}
                    >
                      {coin.cents}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
      <Text style={[styles.total, { color: c.text }]}>
        {total === undefined ? 'Total: ?' : `Total: ${total}¢ = $${(total / 100).toFixed(2)}`}
      </Text>
      <Steppers
        calc={calc}
        items={ids.map((id) => ({ var: id, steps: [1], pin: ids.filter((x) => x !== id) }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rows: { gap: space.sm, paddingHorizontal: space.md },
  row: { gap: space.xs },
  name: { fontSize: font.caption + 1 },
  coins: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, minHeight: 30 },
  coin: { borderWidth: chart.strokeLight, alignItems: 'center', justifyContent: 'center' },
  total: { fontSize: font.title, fontWeight: '700', textAlign: 'center' },
});
