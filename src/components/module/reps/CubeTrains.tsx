import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'cubeTrains' }>;

/**
 * Cube trains built from the same parts in different orders. Each part keeps its shade, and
 * the trains come out the same length: order and grouping don't change a sum.
 */
export function CubeTrains({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const parts = [...new Set(spec.rows.flat())];
  const shades = [c.chartHighlight, c.chartFill, c.chartSurface];
  const count = (id: string) => (rep.known(id) ? Math.max(0, Math.round(rep.shown(id))) : 0);
  const shade = (id: string) => shades[parts.indexOf(id) % shades.length]!;

  return (
    <View style={{ gap: space.md }}>
      {spec.rows.map((row, r) => (
        <View key={r} style={{ gap: space.xs, paddingHorizontal: space.md }}>
          <Text style={[styles.order, { color: c.textMuted }]}>
            {row.map((id) => rep.variable(id).symbol).join(' + ')}
          </Text>
          <View style={styles.train}>
            {row.flatMap((id) =>
              Array.from({ length: count(id) }, (_, i) => (
                <View
                  key={`${r}${id}${i}`}
                  style={[styles.cube, { backgroundColor: shade(id), borderColor: c.chartInk }]}
                />
              )),
            )}
          </View>
        </View>
      ))}
      <Text style={[styles.total, { color: c.text }]}>
        {`Both trains: ${rep.label(spec.total)} cubes`}
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
  train: { flexDirection: 'row', flexWrap: 'wrap' },
  cube: { width: 22, height: 22, borderWidth: chart.strokeLight, marginRight: -1 },
  total: { fontSize: font.body, fontWeight: '600', textAlign: 'center' },
});
