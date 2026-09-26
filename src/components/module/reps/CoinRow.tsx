import { StyleSheet, View } from 'react-native';

import { SegmentedControl } from '@/components/SegmentedControl';
import type { Representation } from '@/data/modules';
import { space } from '@/theme';

import type { Calculator } from '../useCalculator';
import { useRep, Caption } from './common';
import { Coin } from './MoneyArt';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'coinRow' }>;

/** US coins with their values in cents and diameters in mm (drawn to relative size). */
const COINS = [
  { value: '1', label: 'Penny', many: 'pennies', cents: 1, mm: 19.1 },
  { value: '5', label: 'Nickel', many: 'nickels', cents: 5, mm: 21.2 },
  { value: '10', label: 'Dime', many: 'dimes', cents: 10, mm: 17.9 },
  { value: '25', label: 'Quarter', many: 'quarters', cents: 25, mm: 24.3 },
] as const;
type CoinValue = (typeof COINS)[number]['value'];

/** A row of one kind of coin, picked with the buttons; − / + change how many. */
export function CoinRow({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const rep = useRep(calc);
  const cents = rep.known(spec.value) ? Math.round(rep.shown(spec.value)) : undefined;
  const coin = COINS.find((x) => x.cents === cents);
  const n = rep.known(spec.count) ? Math.max(0, Math.round(rep.shown(spec.count))) : 0;

  return (
    <View style={{ gap: space.sm }}>
      <View style={styles.toggle}>
        <SegmentedControl<CoinValue>
          segments={COINS.map(({ value, label }) => ({ value, label }))}
          value={(coin?.value ?? '') as CoinValue}
          onChange={(v) => calc.set({ ...rep.pin([spec.count]), [spec.value]: Number(v) })}
        />
      </View>
      <View style={styles.coins}>
        {coin
          ? Array.from({ length: n }, (_, i) => (
              <Coin key={i} cents={coin.cents} d={coin.mm * 1.6} label={`${coin.cents}¢`} />
            ))
          : null}
      </View>
      <Caption>
        {coin
          ? `${rep.label(spec.count)} ${n === 1 ? coin.label.toLowerCase() : coin.many}: ${rep.label(spec.total)}`
          : 'Pick a coin above.'}
      </Caption>
      <Steppers calc={calc} items={[{ var: spec.count, steps: [1], pin: [spec.value] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { paddingHorizontal: space.md },
  coins: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
    justifyContent: 'center',
    paddingHorizontal: space.md,
    minHeight: 40,
    alignItems: 'center',
  },
});
