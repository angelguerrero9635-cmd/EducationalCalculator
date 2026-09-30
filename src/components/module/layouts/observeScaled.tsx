/**
 * H109: an observe page's bars on a range of their own: below 0 (a membrane potential in mV,
 * a winter temperature) and, for a `second` row with its own unit, on that row's scale (a
 * climograph: rainfall in mm beside temperature in °C). Each bar grows up or down from its
 * row's 0 line (or from the bottom when the range starts above 0); its value sits past its end.
 * Tap or drag along the column to set it.
 */
import { useRef } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import type { ObserveLayout as Spec } from '@/data/modules/layouts';
import { chart, font, usePalette } from '@/theme';

import { RESPONDER, useWebPointerDrag } from '../pointerDrag';

/** One row's range. */
export interface RowScale {
  lo: number;
  hi: number;
  step: number;
  unit: string;
}

/** The first row's range and the second's (its own fields, else the page's). */
export function rowScales(spec: Spec): [RowScale, RowScale] {
  const first = { lo: spec.min ?? 0, hi: spec.max, step: spec.step, unit: spec.unit };
  const s = spec.second;
  return [
    first,
    {
      lo: s?.min ?? first.lo,
      hi: s?.max ?? first.hi,
      step: s?.step ?? first.step,
      unit: s?.unit ?? first.unit,
    },
  ];
}

/** Whether the page needs these bars: a range below 0, or a second row on its own scale. */
export const isScaled = (spec: Spec) =>
  spec.min !== undefined ||
  (!!spec.second &&
    (spec.second.unit !== undefined ||
      spec.second.max !== undefined ||
      spec.second.min !== undefined ||
      spec.second.step !== undefined));

/** A reading with a true minus sign (−70). */
export const signed = (x: number) => (x < 0 ? `−${-x}` : String(x));

/** Room above and below the bars for their values. */
const PAD = 18;

/** The value a tap `y` px down a column of height `h` means on the row's range. */
export function valueAt(y: number, h: number, r: RowScale): number {
  const a = h - 2 * PAD;
  const raw = r.hi - ((y - PAD) / a) * (r.hi - r.lo);
  const snapped = Math.round(raw / r.step) * r.step;
  // Keep the step's decimals clean (0.1 steps).
  const clean = Math.round(snapped * 1e6) / 1e6;
  return Math.max(r.lo, Math.min(r.hi, clean));
}

const WEB_BAR_STYLE =
  Platform.OS === 'web'
    ? ({ touchAction: 'none', userSelect: 'none' } as unknown as ViewStyle)
    : null;

export function ScaledBar({
  i,
  x,
  r,
  height,
  label,
  onSet,
  half,
  second,
  wide,
}: {
  i: number;
  x: number;
  r: RowScale;
  height: number;
  label: string;
  onSet: (y: number) => void;
  half?: boolean;
  second?: boolean;
  wide?: boolean;
}) {
  const c = usePalette();
  const ref = useRef<View>(null);
  const top = useRef(0);
  useWebPointerDrag(ref, {
    start: (_x, y, el) => {
      top.current = el.getBoundingClientRect().top;
      onSet(y - top.current);
    },
    move: (_x, y) => onSet(y - top.current),
  });
  const a = height - 2 * PAD;
  const yOf = (v: number) => PAD + ((r.hi - v) / (r.hi - r.lo)) * a;
  const base = yOf(Math.max(r.lo, Math.min(r.hi, 0)));
  const end = yOf(x);
  const down = end > base;
  const barTop = Math.min(end, base);
  const barH = Math.max(2, Math.abs(end - base));
  const color = second ? c.chartSecond : c.chartHighlight;
  return (
    <View
      testID={second ? `bar2-${i}` : `bar-${i}`}
      accessibilityRole="adjustable"
      accessibilityLabel={`${label}: ${x} ${r.unit}`}
      accessibilityValue={{ min: r.lo, max: r.hi, now: x }}
      ref={ref}
      onStartShouldSetResponder={RESPONDER ? () => true : undefined}
      onMoveShouldSetResponder={RESPONDER ? () => true : undefined}
      onResponderTerminationRequest={RESPONDER ? () => false : undefined}
      onResponderGrant={RESPONDER ? (e) => onSet(e.nativeEvent.locationY) : undefined}
      onResponderMove={RESPONDER ? (e) => onSet(e.nativeEvent.locationY) : undefined}
      style={[styles.column, wide && styles.wide, half && styles.half, { height }, WEB_BAR_STYLE]}
    >
      {/* The row's 0 line (the bottom when its range starts at or above 0). */}
      <View
        pointerEvents="none"
        style={[
          styles.zero,
          {
            top: base - chart.stroke / 2,
            backgroundColor: c.chartInk,
            height: r.lo < 0 ? chart.strokeLight : chart.stroke,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.bar,
          { top: barTop, height: barH, backgroundColor: color, borderColor: c.chartInk },
        ]}
      />
      <Text
        pointerEvents="none"
        style={[styles.value, { color: c.text, top: down ? end + 1 : end - 17 }]}
      >
        {signed(x)}
      </Text>
    </View>
  );
}

/** The height of each chart when the two rows are drawn apart. */
const SPLIT_H = 132;

/**
 * Two rows on different units (a climograph), drawn apart: the second row's chart above the
 * first's, each named with its unit, both lined up with the column labels under them.
 */
export function SplitCharts({
  rows,
  names,
  scales,
  columns,
  dense,
  onSet,
}: {
  rows: [number[], number[]];
  names: [string, string];
  scales: [RowScale, RowScale];
  columns: string[];
  dense: boolean;
  onSet: (i: number, y: number, height: number, row: number) => void;
}) {
  const c = usePalette();
  return (
    <View style={styles.split}>
      {([1, 0] as const).map((r) => (
        <View key={r}>
          <Text style={[styles.rowName, { color: c.text }]}>{names[r]}</Text>
          <View style={[styles.splitRow, dense && styles.dense, { height: SPLIT_H }]}>
            {rows[r].map((v, i) => (
              <ScaledBar
                key={columns[i]}
                i={i}
                x={v}
                r={scales[r]}
                height={SPLIT_H}
                label={`${names[r]}, ${columns[i]}`}
                onSet={(y) => onSet(i, y, SPLIT_H, r)}
                second={r === 1}
                wide={columns.length <= 4}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  split: { gap: 4 },
  rowName: { fontSize: font.caption + 1, fontWeight: '700' },
  splitRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  dense: { gap: 4 },
  column: { flex: 1, maxWidth: 56, position: 'relative', userSelect: 'none' },
  wide: { maxWidth: 84 },
  half: { maxWidth: undefined },
  zero: { position: 'absolute', left: -2, right: -2 },
  bar: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    borderWidth: chart.strokeLight,
    borderRadius: 3,
  },
  value: {
    position: 'absolute',
    left: -6,
    right: -6,
    textAlign: 'center',
    fontSize: font.caption + 1,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
