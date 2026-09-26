import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { ObserveLayout as Spec } from '@/data/modules/layouts';
import { chart, font, radius, space, usePalette } from '@/theme';

import { Caption } from '../reps/common';

const CHART_HEIGHT = 180;

/**
 * A quantity recorded over time: a bar per column (tap a bar at the height you want), the
 * table of readings under it, and the pattern in a sentence.
 */
export function ObserveLayout({ spec }: { spec: Spec }) {
  const tight = spec.columns.length > 5;
  const c = usePalette();
  const [values, setValues] = useState(spec.initial);
  const setAt = (i: number, y: number, height: number) => {
    const raw = ((height - y) / height) * spec.max;
    const next = Math.max(0, Math.min(spec.max, Math.round(raw / spec.step) * spec.step));
    setValues(values.map((x, k) => (k === i ? next : x)));
  };
  return (
    <View style={styles.wrap}>
      <View style={styles.chart}>
        {values.map((x, i) => (
          <View
            key={spec.columns[i]}
            testID={`bar-${i}`}
            accessibilityRole="adjustable"
            accessibilityLabel={`${spec.columns[i]}: ${x} ${spec.unit}`}
            accessibilityValue={{ min: 0, max: spec.max, now: x }}
            // The column takes the touch itself, so the tap's height is measured in it.
            onStartShouldSetResponder={() => true}
            onResponderGrant={(e) => setAt(i, e.nativeEvent.locationY, CHART_HEIGHT)}
            style={[styles.column, { borderBottomColor: c.chartInk }]}
          >
            <Text pointerEvents="none" style={[styles.value, { color: c.text }]}>
              {x}
            </Text>
            <View
              pointerEvents="none"
              style={[
                styles.bar,
                {
                  height: Math.max(2, (x / spec.max) * (CHART_HEIGHT - 24)),
                  backgroundColor: c.chartHighlight,
                  borderColor: c.chartInk,
                },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={styles.labels}>
        {spec.columns.map((col) => (
          <Text key={col} style={[styles.label, { color: c.text }]}>
            {col}
          </Text>
        ))}
      </View>
      {/* The table of readings. */}
      <View style={[styles.table, { borderColor: c.border }]}>
        <View style={[styles.row, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
          <Text style={[styles.cellHead, tight && styles.tight, { color: c.text }]}>
            {spec.rowLabel}
          </Text>
          {spec.columns.map((col) => (
            <Text key={col} style={[styles.cellHead, tight && styles.tight, { color: c.text }]}>
              {col}
            </Text>
          ))}
        </View>
        <View style={styles.row}>
          <Text style={[styles.cell, tight && styles.tight, { color: c.textMuted }]}>
            {spec.unit}
          </Text>
          {values.map((x, i) => (
            <Text
              key={spec.columns[i]}
              style={[styles.cell, tight && styles.tight, { color: c.text }]}
            >
              {x}
            </Text>
          ))}
        </View>
      </View>
      <Caption>{spec.pattern(values)}</Caption>
      <Text style={[styles.hint, { color: c.textMuted }]}>Tap a bar at the height you want.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm, paddingHorizontal: space.lg },
  chart: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: space.md,
    height: CHART_HEIGHT,
  },
  // Columns share the row (at most 56 wide), so 6 or more still fit a phone and line up
  // with their labels.
  column: {
    flex: 1,
    maxWidth: 56,
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderBottomWidth: chart.stroke,
    gap: 2,
  },
  value: { fontSize: font.caption + 1, fontWeight: '700', fontVariant: ['tabular-nums'] },
  bar: { width: 36, borderWidth: chart.strokeLight, borderRadius: 3 },
  labels: { flexDirection: 'row', justifyContent: 'center', gap: space.md },
  label: { flex: 1, maxWidth: 56, textAlign: 'center', fontSize: font.caption + 1 },
  table: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.sm, overflow: 'hidden' },
  row: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
  cellHead: {
    flex: 1,
    padding: space.sm,
    fontSize: font.caption + 1,
    fontWeight: '700',
    textAlign: 'center',
  },
  cell: {
    flex: 1,
    padding: space.sm,
    fontSize: font.body,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  hint: { fontSize: font.caption + 1, textAlign: 'center' },
  // Six columns and the row label share a phone's width: less padding, smaller type.
  tight: { paddingHorizontal: 1, fontSize: font.caption - 1 },
});
