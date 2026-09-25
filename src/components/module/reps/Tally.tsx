import { StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'tally' }>;

/** Tally marks for n: groups of four strokes crossed by a fifth. */
function Marks({ n, color }: { n: number; color: string }) {
  const groups = Math.ceil(n / 5);
  const gw = 34;
  return (
    <Svg width={Math.max(1, groups * gw)} height={26}>
      {Array.from({ length: n }, (_, i) => {
        const g = Math.floor(i / 5);
        const k = i % 5;
        const x0 = g * gw + 4;
        return k < 4 ? (
          <Line
            key={i}
            x1={x0 + k * 6}
            y1={3}
            x2={x0 + k * 6}
            y2={23}
            stroke={color}
            strokeWidth={chart.stroke}
          />
        ) : (
          <Line
            key={i}
            x1={x0 - 3}
            y1={20}
            x2={x0 + 22}
            y2={6}
            stroke={color}
            strokeWidth={chart.stroke}
          />
        );
      })}
    </Svg>
  );
}

/** A tally chart: one row per category with tally marks; − / + add or take away a mark. */
export function Tally({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = spec.rows;

  return (
    <View style={{ gap: space.sm }}>
      <View style={[styles.table, { borderColor: c.chartInk }]}>
        {ids.map((id) => {
          const n = rep.known(id) ? Math.max(0, Math.round(rep.shown(id))) : 0;
          return (
            <View key={id} style={[styles.row, { borderColor: c.chartGrid }]}>
              <Text style={[styles.name, { color: c.text }]}>{rep.tag(id)}</Text>
              <View style={styles.marks}>
                <Marks n={n} color={c.chartInk} />
              </View>
              <Text style={[styles.count, { color: c.text }]}>{rep.known(id) ? n : '?'}</Text>
            </View>
          );
        })}
      </View>
      {spec.total ? (
        <Text style={[styles.caption, { color: c.text }]}>{`Total: ${rep.label(spec.total)}`}</Text>
      ) : null}
      {(() => {
        // The row with the most marks, when one stands out (a class chart's first question).
        const counts = ids.map((id) => (rep.known(id) ? Math.round(rep.shown(id)) : -1));
        const top = Math.max(...counts);
        const leaders = ids.filter((_, i) => counts[i] === top);
        return top > 0 && leaders.length === 1 ? (
          <Text style={[styles.caption, { color: c.textMuted }]}>
            {`Most: ${rep.variable(leaders[0]!).name.toLowerCase()}`}
          </Text>
        ) : null;
      })()}
      <Steppers
        calc={calc}
        items={ids.map((id) => ({ var: id, steps: [1], pin: ids.filter((x) => x !== id) }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  table: { marginHorizontal: space.md, borderWidth: chart.stroke },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    paddingHorizontal: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  name: { width: 110, fontSize: font.caption + 1 },
  marks: { flex: 1 },
  count: { width: 28, textAlign: 'right', fontSize: font.body, fontWeight: '600' },
  caption: { fontSize: font.body, fontWeight: '600', textAlign: 'center' },
});
