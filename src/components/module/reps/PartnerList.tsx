import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { useRep, Caption } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'partnerList' }>;

/**
 * Every way to split a number into two parts, one row each: 0 + 5, 1 + 4, … 5 + 0. Solid
 * counters are the first part, open counters the second. − / + change the number.
 */
export function PartnerList({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const n = rep.known(spec.total) ? Math.max(0, Math.round(rep.shown(spec.total))) : 0;

  return (
    <View style={{ gap: space.xs }}>
      {Array.from({ length: n + 1 }, (_, k) => (
        <View key={k} style={styles.row}>
          <Text style={[styles.sum, { color: c.text }]}>{`${k} + ${n - k}`}</Text>
          <View style={styles.dots}>
            {Array.from({ length: n }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    borderColor: c.chartInk,
                    backgroundColor: i < k ? c.chartHighlight : 'transparent',
                  },
                ]}
              />
            ))}
          </View>
        </View>
      ))}
      <Caption>{`${rep.label(spec.total)}: ${rep.label(spec.ways)} ways`}</Caption>
      <Steppers calc={calc} items={[{ var: spec.total, steps: [1], pin: [] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg },
  sum: { width: 64, fontSize: font.body, fontVariant: ['tabular-nums'] },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: chart.strokeLight },
});
