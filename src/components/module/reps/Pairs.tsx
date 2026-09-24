import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'pairs' }>;

/** Objects put into pairs (two rows). An odd number leaves one without a partner. */
export function Pairs({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const n = Math.max(0, Math.round(rep.shown(spec.value)));
  const pairs = Math.floor(n / 2);
  const odd = n % 2 === 1;
  const dot = (key: string, lonely = false) => (
    <View
      key={key}
      style={[
        styles.dot,
        {
          borderColor: c.chartInk,
          backgroundColor: lonely ? c.chartHighlight : c.chartFill,
        },
      ]}
    />
  );

  return (
    <View style={{ gap: space.sm }}>
      <View style={[styles.pairs, { opacity: rep.known(spec.value) ? 1 : 0.35 }]}>
        {Array.from({ length: pairs }, (_, i) => (
          <View key={i} style={[styles.pair, { borderColor: c.chartGrid }]}>
            {dot(`a${i}`)}
            {dot(`b${i}`)}
          </View>
        ))}
        {odd ? <View style={styles.pair}>{dot('odd', true)}</View> : null}
      </View>
      <Text style={[styles.caption, { color: c.text }]}>
        {`${n} is ${odd ? 'odd' : 'even'}: ${pairs} pairs${odd ? ' and 1 left over' : ', none left over'}`}
      </Text>
      <Steppers calc={calc} items={[{ var: spec.value, steps: [1], pin: [] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  pairs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    minHeight: 70,
  },
  pair: {
    gap: space.xs,
    padding: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    borderColor: 'transparent',
  },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: chart.strokeLight },
  caption: { fontSize: font.body, fontWeight: '600', textAlign: 'center' },
});
