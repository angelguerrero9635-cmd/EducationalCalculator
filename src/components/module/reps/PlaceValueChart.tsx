import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { font, radius, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Caption, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'placeValueChart' }>;

const WHOLE = [
  'ones',
  'tens',
  'hundreds',
  'thousands',
  'ten thousands',
  'hundred thousands',
  'millions',
];
const PARTS = ['tenths', 'hundredths', 'thousandths'];

/**
 * A place-value chart: one column per place, the number's digits in them, the decimal
 * point between ones and tenths. Each column is 10 times the one to its right.
 */
export function PlaceValueChart({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const known = rep.known(spec.value);
  const x = Math.max(0, rep.shown(spec.value));
  const text = x.toFixed(spec.decimals);
  const [wholeText = '0', partText = ''] = text.split('.');
  const wholeDigits = wholeText.split('').reverse();
  const columns = [
    ...WHOLE.slice(0, Math.max(1, wholeDigits.length))
      .map((name, i) => ({ name, digit: wholeDigits[i] ?? '0', place: 10 ** i }))
      .reverse(),
    ...PARTS.slice(0, spec.decimals).map((name, i) => ({
      name,
      digit: partText[i] ?? '0',
      place: 10 ** -(i + 1),
    })),
  ];
  const firstPart = columns.findIndex((col) => col.place < 1);

  return (
    <View>
      <View style={styles.row}>
        {columns.map((col, i) => (
          <View key={col.name} style={styles.cellWrap}>
            <View
              style={[
                styles.cell,
                { borderColor: c.chartGrid, backgroundColor: c.chartSurface },
                col.digit !== '0' && known && { backgroundColor: c.chartFill },
              ]}
            >
              <Text style={[styles.head, { color: c.chartMuted }]} numberOfLines={2}>
                {col.name}
              </Text>
              <Text style={[styles.digit, { color: c.chartInk }]}>{known ? col.digit : '?'}</Text>
            </View>
            {i === firstPart - 1 ? (
              <Text style={[styles.point, { color: c.chartInk }]}>.</Text>
            ) : null}
          </View>
        ))}
      </View>
      <Caption>
        {known
          ? columns
              .filter((col) => col.digit !== '0')
              .map((col) => `${col.digit} ${col.name}`)
              .join(' + ') || '0'
          : 'Type a number to fill the chart.'}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          {
            var: spec.value,
            steps: [10 ** -spec.decimals, 1, 10],
            pin: [],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: space.md,
    flexWrap: 'wrap',
  },
  cellWrap: { flexDirection: 'row', alignItems: 'flex-end' },
  cell: {
    width: 62,
    borderWidth: 1,
    borderRadius: radius.sm,
    margin: 2,
    alignItems: 'center',
    paddingVertical: space.xs,
  },
  head: { fontSize: font.caption - 2, textAlign: 'center', minHeight: 26 },
  digit: { fontSize: font.title + 4, fontWeight: '800', fontVariant: ['tabular-nums'] },
  point: { fontSize: font.title + 8, fontWeight: '800', marginBottom: space.xs },
});
