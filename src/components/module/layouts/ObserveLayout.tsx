import { useRef, useState } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import type { ObserveLayout as Spec } from '@/data/modules/layouts';
import { chart, font, radius, space, usePalette } from '@/theme';

import { RESPONDER, useWebPointerDrag } from '../pointerDrag';
import { Caption } from '../reps/common';
import { ShadowStick } from './ShadowStick';

const CHART_HEIGHT = 180;
/** The browser must not pan the page while a finger moves along a bar. */
const WEB_BAR_STYLE =
  Platform.OS === 'web'
    ? ({ touchAction: 'none', userSelect: 'none' } as unknown as ViewStyle)
    : null;

/**
 * A quantity recorded over time: a bar per column (tap a bar at the height you want), the
 * table of readings under it, and the pattern in a sentence.
 */
export function ObserveLayout({ spec }: { spec: Spec }) {
  const tight = spec.columns.length > 5;
  const few = spec.columns.length <= 4;
  const c = usePalette();
  const [values, setValues] = useState(spec.initial);
  // The column the figure shows: the one tapped last.
  const [picked, setPicked] = useState(0);
  const setAt = (i: number, y: number, height: number) => {
    setPicked(i);
    const raw = ((height - y) / height) * spec.max;
    const next = Math.max(0, Math.min(spec.max, Math.round(raw / spec.step) * spec.step));
    setValues((vs) => vs.map((x, k) => (k === i ? next : x)));
  };
  return (
    <View style={styles.wrap}>
      {spec.figure?.kind === 'shadowStick' ? (
        <ShadowStick
          stick={spec.figure.stick}
          shadow={values[picked]!}
          max={spec.max}
          unit={spec.unit}
          column={spec.columns[picked]!}
        />
      ) : null}
      <View style={[styles.chart, spec.histogram && styles.touching]}>
        {spec.histogram ? (
          // The count scale: 0, half and the top, level with the bars.
          <View style={styles.scale}>
            {[0, spec.max / 2, spec.max].map((v) => (
              <Text
                key={v}
                style={[
                  styles.scaleText,
                  { color: c.textMuted, bottom: (v / spec.max) * (CHART_HEIGHT - 24) - 6 },
                ]}
              >
                {v}
              </Text>
            ))}
          </View>
        ) : null}
        {values.map((x, i) => (
          <Bar
            key={spec.columns[i]}
            i={i}
            x={x}
            spec={spec}
            few={few}
            onSet={(y) => setAt(i, y, CHART_HEIGHT)}
          />
        ))}
      </View>
      <View style={[styles.labels, spec.histogram && styles.touchingLabels]}>
        {spec.columns.map((col) => (
          <Text key={col} style={[styles.label, few && styles.fewColumn, { color: c.text }]}>
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

/** One column: tap it at the height you want, or drag along it. */
function Bar({
  i,
  x,
  spec,
  few,
  onSet,
}: {
  i: number;
  x: number;
  spec: Spec;
  few: boolean;
  onSet: (y: number) => void;
}) {
  const c = usePalette();
  // Web: pointer events with capture, the column's top measured at the press.
  const ref = useRef<View>(null);
  const top = useRef(0);
  useWebPointerDrag(ref, {
    start: (_x, y, el) => {
      top.current = el.getBoundingClientRect().top;
      onSet(y - top.current);
    },
    move: (_x, y) => onSet(y - top.current),
  });
  return (
    <View
      testID={`bar-${i}`}
      accessibilityRole="adjustable"
      accessibilityLabel={`${spec.columns[i]}: ${x} ${spec.unit}`}
      accessibilityValue={{ min: 0, max: spec.max, now: x }}
      // The column takes the touch itself, so the tap's height is measured in it.
      ref={ref}
      onStartShouldSetResponder={RESPONDER ? () => true : undefined}
      onMoveShouldSetResponder={RESPONDER ? () => true : undefined}
      onResponderTerminationRequest={RESPONDER ? () => false : undefined}
      onResponderGrant={RESPONDER ? (e) => onSet(e.nativeEvent.locationY) : undefined}
      // The bar follows the finger while it moves, not only where it first touched.
      onResponderMove={RESPONDER ? (e) => onSet(e.nativeEvent.locationY) : undefined}
      style={[
        styles.column,
        few && styles.fewColumn,
        spec.histogram && styles.wideColumn,
        { borderBottomColor: c.chartInk },
        WEB_BAR_STYLE,
      ]}
    >
      <Text pointerEvents="none" style={[styles.value, { color: c.text }]}>
        {x}
      </Text>
      <View
        pointerEvents="none"
        style={[
          styles.bar,
          spec.histogram && styles.histogramBar,
          {
            height: Math.max(2, (x / spec.max) * (CHART_HEIGHT - 24)),
            backgroundColor: c.chartHighlight,
            borderColor: c.chartInk,
          },
        ]}
      />
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
    // Dragging a bar doesn't select the page's text (web).
    userSelect: 'none',
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderBottomWidth: chart.stroke,
    gap: 2,
  },
  // Four columns or fewer get room for a whole word ("Afternoon") under each.
  fewColumn: { maxWidth: 84 },
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
  // A histogram's intervals meet: no gaps between the bars.
  touching: { gap: 0, paddingLeft: 28 },
  touchingLabels: { gap: 0, paddingLeft: 28 },
  wideColumn: { maxWidth: 64 },
  histogramBar: { width: '100%', borderRadius: 0 },
  scale: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 24 },
  scaleText: {
    position: 'absolute',
    right: 2,
    fontSize: font.caption,
    fontVariant: ['tabular-nums'],
  },
  // Six columns and the row label share a phone's width: less padding, smaller type.
  tight: { paddingHorizontal: 1, fontSize: font.caption - 1 },
});
