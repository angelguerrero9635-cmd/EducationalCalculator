import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { font, radius, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Caption, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'punnettSquare' }>;

/** A parent's two alleles from its count of dominant ones: 2 → "AA", 1 → "Aa", 0 → "aa". */
export const allelesOf = (dominant: number, letter: string) =>
  dominant >= 2
    ? [letter, letter]
    : dominant === 1
      ? [letter, letter.toLowerCase()]
      : [letter.toLowerCase(), letter.toLowerCase()];

/**
 * A Punnett square: one parent's alleles across the top, the other's down the side, and
 * each box the pair an offspring gets. Boxes with a dominant allele show the trait.
 */
export function PunnettSquare({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const known = rep.known(spec.first) && rep.known(spec.second);
  const top = allelesOf(Math.round(rep.shown(spec.first)), spec.letter);
  const side = allelesOf(Math.round(rep.shown(spec.second)), spec.letter);
  const upper = spec.letter.toUpperCase();
  const boxes = side.map((s) =>
    top.map((t) => {
      const pair = [t, s].sort((a, b) => (a === upper ? -1 : b === upper ? 1 : 0)).join('');
      return { pair, shows: pair.includes(upper) };
    }),
  );
  const showing = boxes.flat().filter((b) => b.shows).length;

  return (
    <View>
      <View style={styles.grid}>
        <View style={styles.row}>
          <View style={styles.corner} />
          {top.map((t, i) => (
            <Text key={i} style={[styles.head, { color: c.chartInk }]}>
              {t}
            </Text>
          ))}
        </View>
        {boxes.map((row, j) => (
          <View key={j} style={styles.row}>
            <Text style={[styles.head, { color: c.chartInk }]}>{side[j]}</Text>
            {row.map((b, i) => (
              <View
                key={i}
                testID={`box-${j}${i}`}
                style={[
                  styles.box,
                  {
                    borderColor: c.chartInk,
                    backgroundColor: b.shows ? c.chartHighlight : c.chartSurface,
                    opacity: known ? 1 : 0.4,
                  },
                ]}
              >
                <Text style={[styles.pair, { color: b.shows ? c.onChartHighlight : c.chartInk }]}>
                  {b.pair}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
      <Caption>
        {known
          ? `${top.join('')} × ${side.join('')}: ${showing} of 4 boxes have a ${upper}, so ${showing} in 4 show the trait.${spec.recessive ? ` ${4 - showing} in 4 do not.` : ''}`
          : 'Set each parent’s alleles to fill the square.'}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.first, steps: [1], pin: [spec.second] },
          { var: spec.second, steps: [1], pin: [spec.first] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { alignItems: 'center', gap: 4, paddingHorizontal: space.md },
  row: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  corner: { width: 36, height: 36 },
  head: { width: 72, textAlign: 'center', fontSize: font.title, fontWeight: '800' },
  box: {
    width: 72,
    height: 72,
    borderWidth: 1.5,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pair: { fontSize: font.title + 2, fontWeight: '800' },
});
