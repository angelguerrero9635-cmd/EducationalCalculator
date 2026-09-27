import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Caption, useRep } from './common';
import { Bill, Coin } from './MoneyArt';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'coins' }>;

/** Coins drawn to relative size with their values; − / + change how many of each. */
export function Coins({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = spec.coins.map((k) => k.var);
  // In dollars (bills) or in cents (coins), with the other form after it.
  // K–2 write cents (68¢); a dollar sign only once a dollar is made ($1.68).
  // Bills and coins together read as dollars and cents ($15.75), whatever unit the total is in.
  const mixed = spec.coins.some((k) => k.cents >= 100) && spec.coins.some((k) => k.cents < 100);
  const asMoney = (cents: number) =>
    cents >= 100 || mixed
      ? `$${Number.isInteger(cents / 100) ? cents / 100 : (cents / 100).toFixed(2)}`
      : `${cents}¢`;
  const totalText = (t: number) =>
    mixed
      ? asMoney(spec.dollars ? Math.round(t * 100) : t)
      : spec.dollars
        ? `$${Math.round(t)}`
        : rep.early && t < 100
          ? `${Math.round(t)}¢`
          : `${Math.round(t)}¢ = $${(t / 100).toFixed(2)}`;
  // Mixed: the number sentence adding each kind's worth, $10 + $5 + 75¢ + 20¢ = $15.95.
  const groups = spec.coins.flatMap((k) => {
    if (!rep.known(k.var)) return ['?'];
    const n = Math.round(rep.shown(k.var));
    if (n === 0) return [];
    return [k.cents >= 100 ? asMoney(n * k.cents) : `${n * k.cents}¢`];
  });
  const total = rep.known(spec.total) ? rep.shown(spec.total) : undefined;
  // US coin diameters (mm), so the drawings keep true relative sizes.
  const sizes: Record<number, number> = { 25: 24.3, 10: 17.9, 5: 21.2, 1: 19.1 };

  return (
    <View style={{ gap: space.sm }}>
      <View style={[styles.rows, mixed && styles.beside]}>
        {spec.coins.map((coin) => {
          const n = rep.known(coin.var) ? Math.round(rep.shown(coin.var)) : 0;
          const d = (sizes[coin.cents] ?? 20) * 1.7;
          const bill = coin.cents >= 100;
          const money = bill ? `$${coin.cents / 100}` : `${coin.cents}¢`;
          return (
            <View key={coin.var} style={styles.row}>
              <Text
                style={[styles.name, { color: c.text }]}
              >{`${coin.name}${coin.name.startsWith('$') ? '' : ` (${money} each)`}: ${rep.label(coin.var)}`}</Text>
              <View style={styles.coins}>
                {Array.from({ length: n }, (_, i) =>
                  bill ? (
                    <Bill key={i} label={money} />
                  ) : (
                    <Coin key={i} cents={coin.cents} d={d} label={String(coin.cents)} />
                  ),
                )}
              </View>
            </View>
          );
        })}
      </View>
      <Text style={[styles.total, { color: c.text }]}>
        {total === undefined
          ? `Total: ${rep.words ? '' : `${rep.variable(spec.total).symbol} = `}?`
          : `Total: ${rep.words ? '' : `${rep.variable(spec.total).symbol} = `}${totalText(total)}`}
      </Text>
      {mixed ? (
        <Caption>{`${groups.join(' + ') || '0¢'} = ${total === undefined ? '?' : totalText(total)}`}</Caption>
      ) : null}
      <Steppers
        calc={calc}
        items={ids.map((id) => ({ var: id, steps: [1], pin: ids.filter((x) => x !== id) }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rows: { gap: space.sm, paddingHorizontal: space.md },
  // Bills and coins together: each kind beside the next, wrapping, so the wallet stays short.
  beside: { flexDirection: 'row', flexWrap: 'wrap', columnGap: space.lg },
  row: { gap: space.xs, maxWidth: '100%' },
  name: { fontSize: font.caption + 1 },
  coins: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
    minHeight: 30,
    alignItems: 'center',
  },
  total: { fontSize: font.title, fontWeight: '700', textAlign: 'center' },
});
