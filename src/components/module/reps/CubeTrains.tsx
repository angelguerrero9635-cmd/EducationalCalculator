import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, radius, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'cubeTrains' }>;

/**
 * Cube trains built from the same parts in different orders and groupings. Each part keeps its
 * shade, a group added first is outlined, and the trains come out the same length: order and
 * grouping don't change a sum.
 */
export function CubeTrains({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const [width, setWidth] = useState(0);
  const parts = [...new Set(spec.rows.flat(2))];
  const shades = [c.chartHighlight, c.chartFill, c.chartSurface];
  const count = (id: string) => (rep.known(id) ? Math.max(0, Math.round(rep.shown(id))) : 0);
  const shade = (id: string) => shades[parts.indexOf(id) % shades.length]!;
  const symbol = (id: string) => rep.variable(id).symbol;
  const label = (row: Spec['rows'][number]) =>
    row.map((p) => (Array.isArray(p) ? `(${p.map(symbol).join(' + ')})` : symbol(p))).join(' + ');

  // One cube size for every train, so equal sums look equally long on one line.
  const longest = Math.max(
    1,
    ...spec.rows.map((row) => row.flat().reduce((n, id) => n + count(id), 0)),
  );
  const gaps = Math.max(...spec.rows.map((row) => row.length)) * 8;
  const cube = width ? Math.max(8, Math.min(22, (width - gaps) / longest)) : 22;

  const cubes = (id: string, key: string) =>
    Array.from({ length: count(id) }, (_, i) => (
      <View
        key={`${key}${id}${i}`}
        style={[
          styles.cube,
          { width: cube, height: cube, backgroundColor: shade(id), borderColor: c.chartInk },
        ]}
      />
    ));

  return (
    <View style={{ gap: space.md }}>
      <View
        style={{ gap: space.md, paddingHorizontal: space.md }}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width - 2 * space.md)}
      >
        {spec.rows.map((row, r) => (
          <View key={r} style={{ gap: space.xs }}>
            <Text style={[styles.order, { color: c.textMuted }]}>{label(row)}</Text>
            <View style={styles.train}>
              {row.map((p, g) =>
                Array.isArray(p) ? (
                  <View key={g} style={[styles.group, { borderColor: c.chartInk }]}>
                    {p.flatMap((id) => cubes(id, `${r}-${g}`))}
                  </View>
                ) : (
                  <View key={g} style={styles.part}>
                    {cubes(p, `${r}-${g}`)}
                  </View>
                ),
              )}
            </View>
          </View>
        ))}
      </View>
      <Text style={[styles.total, { color: c.text }]}>
        {`Every train: ${rep.label(spec.total)} cubes`}
      </Text>
      <Steppers
        calc={calc}
        items={parts.map((id) => ({ var: id, steps: [1], pin: parts.filter((x) => x !== id) }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  order: { fontSize: font.caption + 1 },
  train: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  part: { flexDirection: 'row' },
  group: {
    flexDirection: 'row',
    borderWidth: chart.stroke,
    borderRadius: radius.sm,
    padding: 1,
  },
  cube: { borderWidth: chart.strokeLight, marginRight: -1 },
  total: { fontSize: font.body, fontWeight: '600', textAlign: 'center' },
});
