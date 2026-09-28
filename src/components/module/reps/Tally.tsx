import { StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, radius, space, usePalette } from '@/theme';

import { Icon as CardIconArt } from '../layouts/CardFigure';
import type { Calculator } from '../useCalculator';
import { useRep, Caption } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'tally' }>;

/** A bundle of five: four strokes 6 px apart and the slash past them; bundles 12 px apart. */
const GAP = 6;
const BUNDLE = 3 * GAP + 8;
const BUNDLE_GAP = 12;
const MARK_H = 28;
/** A little hand-drawn wobble per stroke (top x offset, bottom x offset), repeating. */
const WOBBLE: [number, number][] = [
  [0.8, -0.4],
  [-0.5, 0.6],
  [0.4, -0.7],
  [-0.7, 0.3],
];

/**
 * Tally marks for n, drawn as by hand: groups of four strokes with a slight tilt, and a fifth
 * that clearly crosses all four from low left to high right.
 */
function Marks({ n, color }: { n: number; color: string }) {
  const groups = Math.ceil(n / 5);
  const width = Math.max(1, groups * (BUNDLE + BUNDLE_GAP));
  return (
    <Svg width={width} height={MARK_H}>
      {Array.from({ length: n }, (_, i) => {
        const g = Math.floor(i / 5);
        const k = i % 5;
        const x0 = g * (BUNDLE + BUNDLE_GAP) + 4;
        if (k < 4) {
          const [t, b] = WOBBLE[(k + g) % WOBBLE.length]!;
          return (
            <Line
              key={i}
              x1={x0 + k * GAP + t}
              y1={3}
              x2={x0 + k * GAP + b}
              y2={MARK_H - 3}
              stroke={color}
              strokeWidth={chart.stroke}
              strokeLinecap="round"
            />
          );
        }
        return (
          <Line
            key={i}
            x1={x0 - 4}
            y1={MARK_H - 6}
            x2={x0 + 3 * GAP + 4}
            y2={6}
            stroke={color}
            strokeWidth={chart.stroke}
            strokeLinecap="round"
          />
        );
      })}
    </Svg>
  );
}

/**
 * A tally chart: a soft table with one row per category, its card icon (when the page gives
 * one) and name, the tally marks in bundles of five, and the count in a pill; − / + add or take
 * away a mark.
 */
export function Tally({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = spec.rows;

  return (
    <View style={{ gap: space.sm }}>
      <View style={[styles.table, { borderColor: c.chartGrid, backgroundColor: c.card }]}>
        {ids.map((id, i) => {
          const n = rep.known(id) ? Math.max(0, Math.round(rep.shown(id))) : 0;
          const icon = spec.icons?.[i];
          return (
            <View
              key={id}
              style={[
                styles.row,
                i < ids.length - 1
                  ? { borderBottomWidth: chart.strokeLight, borderColor: c.chartGrid }
                  : null,
              ]}
            >
              <View style={styles.label}>
                {icon ? (
                  <Svg width={30} height={30} viewBox="0 0 48 48">
                    <CardIconArt icon={icon} ink={c.chartInk} shade={c.chartFill} />
                  </Svg>
                ) : null}
                <Text style={[styles.name, { color: c.text }]}>{rep.tag(id)}</Text>
              </View>
              <View style={styles.marks}>
                <Marks n={n} color={c.chartInk} />
              </View>
              <View style={[styles.pill, { backgroundColor: c.chartSurface }]}>
                <Text style={[styles.count, { color: c.text }]}>{rep.known(id) ? n : '?'}</Text>
              </View>
            </View>
          );
        })}
      </View>
      {spec.total ? <Caption>{`Total: ${rep.label(spec.total)}`}</Caption> : null}
      {(() => {
        // The row with the most marks, when one stands out (a class chart's first question).
        const counts = ids.map((id) => (rep.known(id) ? Math.round(rep.shown(id)) : -1));
        const top = Math.max(...counts);
        const leaders = ids.filter((_, i) => counts[i] === top);
        // Only when every row is known: a "?" row could be the biggest.
        return top > 0 && leaders.length === 1 && ids.every(rep.known) ? (
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
  caption: {
    fontSize: font.body,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: space.sm,
    paddingHorizontal: space.lg,
  },
  table: {
    marginHorizontal: space.md,
    borderWidth: chart.strokeLight,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    gap: space.sm,
  },
  label: { width: 118, flexDirection: 'row', alignItems: 'center', gap: space.xs },
  name: { flex: 1, fontSize: font.body, fontWeight: '600' },
  marks: { flex: 1 },
  pill: {
    minWidth: 40,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  count: { fontSize: font.body, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
