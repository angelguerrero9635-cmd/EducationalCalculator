import { useRef, useState } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import type { ObserveFigure, ObserveLayout as Spec } from '@/data/modules/layouts';
import { chart, font, radius, space, usePalette } from '@/theme';

import { RESPONDER, useWebPointerDrag } from '../pointerDrag';
import { Caption } from '../reps/common';
import {
  CupFigure,
  FlashlightFigure,
  PlantHeightFigure,
  RampFigure,
  ThermometerFigure,
} from './observeFigures';
import { ShadowStick } from './ShadowStick';
import {
  isScaled,
  rowScales,
  ScaledBar,
  signed,
  SplitCharts,
  valueAt,
  yOnScale,
} from './observeScaled';

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
  // H100: a second row, counted in the same columns (two species side by side).
  const [seconds, setSeconds] = useState(spec.second?.initial ?? []);
  const two = !!spec.second;
  // The column the figure shows: the one tapped last.
  const [picked, setPicked] = useState(0);
  // H109: rows on ranges of their own (below 0, or a second row's own unit and scale).
  const scaled = isScaled(spec);
  const scales = rowScales(spec);
  const ownUnit = two && spec.second!.unit !== undefined && spec.second!.unit !== spec.unit;
  const split = scaled && ownUnit;
  const dense = split && spec.columns.length > 8;
  // Reference lines (a threshold, a resting level) on a chart with a range below 0.
  const guides = scaled && !split && spec.guides?.length ? spec.guides : undefined;
  const rowName = (r: number) =>
    (r ? spec.second!.rowLabel : spec.rowLabel) + (ownUnit ? ` (${scales[r]!.unit})` : '');
  // The table's first column is as wide as its longest name needs ("Progesterone", "Species A"),
  // in one type size on every page, so a name doesn't wrap into small grey lines.
  const heads = two
    ? [rowName(0), rowName(1), ownUnit ? '' : spec.unit]
    : [spec.rowLabel, spec.unit];
  const longest = Math.max(...heads.map((h) => h.length));
  const headFlex = {
    flex: Math.min(spec.columns.length > 8 ? 1.6 : 2.6, Math.max(1, longest / 6)),
  };
  const setAt = (i: number, y: number, height: number, row = 0) => {
    setPicked(i);
    const raw = ((height - y) / height) * spec.max;
    const next = scaled
      ? valueAt(y, height, scales[row]!)
      : Math.max(0, Math.min(spec.max, Math.round(raw / spec.step) * spec.step));
    (row ? setSeconds : setValues)((vs) => vs.map((x, k) => (k === i ? next : x)));
  };
  return (
    <View style={styles.wrap}>
      {spec.figure ? (
        <ObserveFigureView figure={spec.figure} values={values} picked={picked} spec={spec} />
      ) : null}
      {split ? (
        // H109: a second row on its own unit gets a chart of its own above the first's.
        <SplitCharts
          rows={[values, seconds]}
          names={[rowName(0), rowName(1)]}
          scales={scales}
          columns={spec.columns}
          dense={dense}
          onSet={(i, y, h, r) => setAt(i, y, h, r)}
        />
      ) : (
        <View style={[styles.chart, spec.histogram && styles.touching, guides && styles.guided]}>
          {guides ? <GuideLines guides={guides} scale={scales[0]} /> : null}
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
          {values.map((x, i) =>
            scaled ? (
              <View key={spec.columns[i]} style={[styles.pair, few && styles.fewColumn]}>
                {(two ? [x, seconds[i] ?? 0] : [x]).map((v, r) => (
                  <ScaledBar
                    key={r}
                    i={i}
                    x={v}
                    r={scales[r]!}
                    height={CHART_HEIGHT}
                    label={`${two ? `${rowName(r)}, ` : ''}${spec.columns[i]}`}
                    onSet={(y) => setAt(i, y, CHART_HEIGHT, r)}
                    half
                    second={r === 1}
                  />
                ))}
              </View>
            ) : two ? (
              <View key={spec.columns[i]} style={[styles.pair, few && styles.fewColumn]}>
                <Bar
                  i={i}
                  x={x}
                  spec={spec}
                  few={few}
                  onSet={(y) => setAt(i, y, CHART_HEIGHT)}
                  half
                />
                <Bar
                  i={i}
                  x={seconds[i] ?? 0}
                  spec={spec}
                  few={few}
                  onSet={(y) => setAt(i, y, CHART_HEIGHT, 1)}
                  half
                  second
                />
              </View>
            ) : (
              <Bar
                key={spec.columns[i]}
                i={i}
                x={x}
                spec={spec}
                few={few}
                onSet={(y) => setAt(i, y, CHART_HEIGHT)}
              />
            ),
          )}
        </View>
      )}
      <View
        style={[
          styles.labels,
          spec.histogram && styles.touchingLabels,
          dense && styles.dense,
          guides && styles.guided,
        ]}
      >
        {spec.columns.map((col) => (
          <Text key={col} style={[styles.label, few && styles.fewColumn, { color: c.text }]}>
            {col}
          </Text>
        ))}
      </View>
      {guides ? (
        // The key: what each dashed line marks.
        <View style={styles.key}>
          {guides.map((g) => (
            <View key={g.at} style={styles.keyItem}>
              <View style={[styles.dash, { borderColor: c.chartInk }]} />
              <Text style={[styles.keyText, { color: c.text }]}>
                {`${g.label}, ${signed(g.at)} ${spec.unit}`}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      {/* The table of readings. */}
      <View style={[styles.table, { borderColor: c.border }]}>
        <View style={[styles.row, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
          <Text style={[styles.cellHead, styles.rowHead, headFlex, { color: c.text }]}>
            {two ? (ownUnit ? '' : spec.unit) : spec.rowLabel}
          </Text>
          {spec.columns.map((col) => (
            <Text key={col} style={[styles.cellHead, tight && styles.tight, { color: c.text }]}>
              {col}
            </Text>
          ))}
        </View>
        {(two ? [values, seconds] : [values]).map((row, r) => (
          <View key={r} style={styles.row}>
            <Text style={[styles.cell, styles.rowHead, headFlex, { color: c.text }]}>
              {two ? rowName(r) : spec.unit}
            </Text>
            {row.map((x, i) => (
              <Text
                key={spec.columns[i]}
                style={[styles.cell, tight && styles.tight, { color: c.text }]}
              >
                {scaled ? signed(x, scales[r]!.lo < 0) : x}
              </Text>
            ))}
          </View>
        ))}
      </View>
      {two ? (
        // The key: which colour is which row.
        <View style={styles.key}>
          {[rowName(0), rowName(1)].map((name, r) => (
            <View key={name} style={styles.keyItem}>
              <View
                style={[
                  styles.swatch,
                  {
                    backgroundColor: r ? c.chartSecond : c.chartHighlight,
                    borderColor: c.chartInk,
                  },
                ]}
              />
              <Text style={[styles.keyText, { color: c.text }]}>{name}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <Caption>{two ? spec.pattern(values, seconds) : spec.pattern(values)}</Caption>
      <Text style={[styles.hint, { color: c.textMuted }]}>Tap a bar at the height you want.</Text>
    </View>
  );
}

/**
 * The dashed reference lines across the bars, and the scale beside them: 0 and each line's
 * value, level with it (the bars' own 0 line is drawn by each bar).
 */
function GuideLines({
  guides,
  scale,
}: {
  guides: { at: number; label: string }[];
  scale: { lo: number; hi: number; step: number; unit: string };
}) {
  const c = usePalette();
  const ticks = [...new Set([0, ...guides.map((g) => g.at)])].filter(
    (v) => v >= scale.lo && v <= scale.hi,
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {guides.map((g) => (
        <View
          key={g.at}
          style={[
            styles.guide,
            { top: yOnScale(g.at, CHART_HEIGHT, scale), borderColor: c.chartInk },
          ]}
        />
      ))}
      {ticks.map((v) => (
        <Text
          key={v}
          style={[
            styles.guideText,
            { top: yOnScale(v, CHART_HEIGHT, scale) - 8, color: c.textMuted },
          ]}
        >
          {v === 0 ? `0 ${scale.unit}` : signed(v)}
        </Text>
      ))}
    </View>
  );
}

/** The picture of the column tapped last. */
function ObserveFigureView({
  figure,
  values,
  picked,
  spec,
}: {
  figure: ObserveFigure;
  values: number[];
  picked: number;
  spec: Spec;
}) {
  const common = {
    value: values[picked]!,
    max: spec.max,
    unit: spec.unit,
    column: spec.columns[picked]!,
  };
  switch (figure.kind) {
    case 'shadowStick':
      return (
        <ShadowStick
          stick={figure.stick}
          shadow={common.value}
          max={spec.max}
          unit={spec.unit}
          column={common.column}
          side={figure.sides?.[picked]}
        />
      );
    case 'thermometer':
      return <ThermometerFigure {...common} />;
    case 'plantHeight':
      return <PlantHeightFigure {...common} />;
    case 'ramp':
      return (
        <RampFigure {...common} height={figure.heights[picked] ?? 0} heights={figure.heights} />
      );
    case 'flashlight':
      return (
        <FlashlightFigure
          {...common}
          distance={figure.distances[picked] ?? 0}
          distances={figure.distances}
        />
      );
    case 'cup':
      return <CupFigure {...common} first={values[0]!} firstColumn={spec.columns[0]!} />;
  }
}

/** One column: tap it at the height you want, or drag along it. */
function Bar({
  i,
  x,
  spec,
  few,
  onSet,
  half,
  second,
}: {
  i: number;
  x: number;
  spec: Spec;
  few: boolean;
  onSet: (y: number) => void;
  /** H100: one of two bars sharing a column; `second` is the second row's. */
  half?: boolean;
  second?: boolean;
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
      testID={second ? `bar2-${i}` : `bar-${i}`}
      accessibilityRole="adjustable"
      accessibilityLabel={`${half ? `${second ? spec.second?.rowLabel : spec.rowLabel}, ` : ''}${spec.columns[i]}: ${x} ${spec.unit}`}
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
        half && styles.halfColumn,
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
          half && styles.halfBar,
          {
            height: Math.max(2, (x / spec.max) * (CHART_HEIGHT - 24)),
            backgroundColor: second ? c.chartSecond : c.chartHighlight,
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
  // H100: two bars to a column, and the key under the table.
  pair: { flex: 1, maxWidth: 56, flexDirection: 'row', gap: 2 },
  halfColumn: { maxWidth: undefined },
  halfBar: { width: '80%' },
  key: { flexDirection: 'row', justifyContent: 'center', gap: space.lg },
  keyItem: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  swatch: { width: 14, height: 14, borderRadius: 3, borderWidth: 1 },
  keyText: { fontSize: font.caption + 1 },
  // The table's row names: one size on every page, left-aligned.
  rowHead: { paddingHorizontal: space.xs, fontSize: font.caption + 1, textAlign: 'left' },
  // Reference lines: a scale of 40 px at the left, the dashes across the bars.
  guided: { paddingLeft: 40 },
  guide: { position: 'absolute', left: 36, right: 0, borderTopWidth: 1, borderStyle: 'dashed' },
  guideText: {
    position: 'absolute',
    left: 0,
    width: 34,
    textAlign: 'right',
    fontSize: font.caption,
    lineHeight: 16,
    fontVariant: ['tabular-nums'],
  },
  dash: { width: 18, borderTopWidth: 1, borderStyle: 'dashed' },
  // H109: twelve months under a split chart: less room between columns.
  dense: { gap: space.xs },
  // Six columns and the row label share a phone's width: less padding, smaller type.
  tight: { paddingHorizontal: 1, fontSize: font.caption - 1 },
});
