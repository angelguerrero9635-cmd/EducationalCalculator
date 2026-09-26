import { useState, useRef, type ReactNode } from 'react';
import {
  Platform,
  View,
  type GestureResponderEvent,
  type ViewStyle,
  StyleSheet,
} from 'react-native';
import { Text as SvgText, type TextProps as SvgTextProps } from 'react-native-svg';

import { isEarlyGrade, isElementary } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import type { Values } from '@/engine/types';
import { chart, font, space, usePalette } from '@/theme';

import { Text } from '@/components/Text';
import type { Calculator } from '../useCalculator';

// Web only: stop the browser from scrolling the page while a handle is dragged.
const WEB_DRAG_STYLE =
  Platform.OS === 'web' ? ({ touchAction: 'none', cursor: 'grab' } as unknown as ViewStyle) : null;

/** Measures the available width and renders children at width × aspect. */
/** Width a picture is drawn at in pre-rendered web HTML (a phone screen minus margins). */
const WEB_START_WIDTH = 358;

export function Canvas({
  aspect,
  children,
}: {
  /** Height ÷ width, or a function of the width for pictures whose height depends on it. */
  aspect: number | ((w: number) => number);
  children: (size: { w: number; h: number }) => ReactNode;
}) {
  // Web pages are pre-rendered to HTML before any layout is measured: start at a phone width so
  // the picture (and its labels) is in the HTML, then resize once the page is live.
  const [w, setW] = useState(Platform.OS === 'web' ? WEB_START_WIDTH : 0);
  const h = w * (typeof aspect === 'function' ? aspect(w) : aspect);
  return (
    <View
      style={{ width: '100%', alignItems: 'center' }}
      onLayout={(e) => setW(Math.min(Math.floor(e.nativeEvent.layout.width), chart.maxWidth))}
    >
      {w > 0 ? <View style={{ width: w, height: h }}>{children({ w, h })}</View> : null}
    </View>
  );
}

/**
 * A touch target (chart.handleTouch square) centered on (x, y) inside a Canvas. Reports drag offsets from where
 * the drag started, so callers convert them with the scale captured in `onStart`.
 */
export function DragHandle({
  x,
  y,
  label,
  onStart,
  onMove,
  onEnd,
  testID,
}: {
  x: number;
  y: number;
  label: string;
  onStart: () => void;
  onMove: (dx: number, dy: number) => void;
  onEnd?: () => void;
  testID?: string;
}) {
  const c = usePalette();
  // Page coordinates where the drag started; offsets are measured from here.
  const origin = useRef({ x: 0, y: 0 });
  const offset = (e: GestureResponderEvent) =>
    [e.nativeEvent.pageX - origin.current.x, e.nativeEvent.pageY - origin.current.y] as const;

  return (
    <View
      testID={testID}
      accessibilityLabel={`Drag to change ${label}`}
      onStartShouldSetResponder={() => true}
      onStartShouldSetResponderCapture={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={(e) => {
        origin.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
        onStart();
      }}
      onResponderMove={(e) => onMove(...offset(e))}
      onResponderRelease={() => onEnd?.()}
      onResponderTerminate={() => onEnd?.()}
      style={[
        {
          position: 'absolute',
          left: x - chart.handleTouch / 2,
          top: y - chart.handleTouch / 2,
          width: chart.handleTouch,
          height: chart.handleTouch,
          alignItems: 'center',
          justifyContent: 'center',
        },
        WEB_DRAG_STYLE,
      ]}
    >
      <View
        style={{
          width: chart.handle,
          height: chart.handle,
          borderRadius: chart.handle / 2,
          borderWidth: chart.handleRing,
          borderColor: c.chartInk,
          backgroundColor: c.background,
        }}
      />
    </View>
  );
}

/**
 * A drawing scale (extent, axis range, …) that fits the current values but stays fixed while a
 * handle is dragged, so the drawing doesn't rescale under the finger. Call `freeze()` when a
 * drag starts and `release()` when it ends.
 */
export function useFrozen<T>(live: T) {
  const [frozen, setFrozen] = useState<{ value: T } | null>(null);
  return {
    value: frozen ? frozen.value : live,
    freeze: () => setFrozen({ value: live }),
    release: () => setFrozen(null),
  };
}

/** Smallest "nice" number (1, 2, 2.5, 5 × 10ⁿ) at or above x, for chart extents. */
export function niceCeil(x: number): number {
  if (!(x > 0)) return 1;
  const pow = 10 ** Math.floor(Math.log10(x));
  const n = x / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * pow;
}

/** Text inside charts: theme font family, chart ink color and label size by default. */
export function ChartText(props: SvgTextProps) {
  const c = usePalette();
  const family = font.family ?? (Platform.OS === 'web' ? font.webSystem : undefined);
  return <SvgText fontFamily={family} fill={c.chartInk} fontSize={chart.label} {...props} />;
}

/** Joins a short phrase with non-breaking spaces, so a caption never wraps inside "C = 8 corners". */
export const nowrap = (s: string) => s.replace(/ /g, '\u00a0');

/** Rounds to the variable's drag step and keeps it within [min, max]. */
export function snap(x: number, step = 0.1, min = -Infinity, max = Infinity): number {
  const snapped = Math.round(x / step) * step;
  return Math.min(max, Math.max(min, Number(snapped.toFixed(10))));
}

/**
 * Helpers every representation needs. Geometry uses formula-unit values (`val`), so shapes
 * keep true proportions whatever units are shown; labels and snapping use the shown units.
 */
export function useRep(calc: Calculator) {
  const { module, values, units } = calc;
  const byId = new Map(module.variables.map((v) => [v.id, v]));
  /**
   * A value to draw when the box shows "?". Counts and other whole numbers draw their smallest
   * value (usually nothing), so the picture never shows a number the student didn't type.
   * Measurements keep the example, faded, so shapes like circles and graphs still draw.
   */
  const fallback = (id: string) => {
    const v = byId.get(id)!;
    return v.integer && v.min !== undefined
      ? Math.max(v.min, Math.min(0, v.max ?? 0))
      : module.example[id]!;
  };
  const early = isEarlyGrade(module.id);
  // K–5 captions name values in words ("Rows: 3"), never "r = 3".
  const words = early || isElementary(module.id);
  const valueText = (id: string, withUnit: boolean) => {
    const v = byId.get(id)!;
    const x = values[id];
    const unit = units.display[id];
    const shown = x === undefined ? '?' : formatNumber(units.toDisplay(id, x), v);
    if (!withUnit || !unit || x === undefined) return shown;
    // $ goes before the number; ¢, % and ° go right after it; other units after a space.
    if (unit === '$') return `$${shown}`;
    return `${shown}${['¢', '%', '°'].includes(unit) ? '' : ' '}${unit}`;
  };
  return {
    variable: (id: string) => byId.get(id)!,
    known: (id: string) => values[id] !== undefined,
    /** Current value in formula units (a "?" box draws its fallback, see above). */
    val: (id: string) => values[id] ?? fallback(id),
    /** Current value in the shown unit. */
    shown: (id: string) => units.toDisplay(id, values[id] ?? fallback(id)),
    /** Shown unit (e.g. "in"), or undefined. */
    unit: (id: string) => units.display[id],
    /** Formula units per shown unit (e.g. 2.54 when showing inches for a cm variable). */
    factor: (id: string) => units.factor(id),
    /** Kindergarten–Grade 2: pictures use names and numbers, never letters. */
    early,
    /** Kindergarten–Grade 5: captions say names and numbers, not "letter = number". */
    words,
    /** Grades 3–5: letters appear only as labels, e.g. "Rows (r): 3". */
    elementary: !early && words,
    /** A value as shown, with its unit: "12 cm", "$5", "35¢", or "?". */
    value: (id: string, withUnit = true) => valueText(id, withUnit),
    /**
     * A name with its formula symbol, e.g. "Bigger amount (B)", so pictures match formulas.
     * K–2: the name alone.
     */
    tag: (id: string) => {
      const v = byId.get(id)!;
      return early ? v.name : `${v.name} (${v.symbol})`;
    },
    /** "B = 11 cm" beside a named part of a picture. K–5: just the value, "11 cm". */
    label: (id: string, withUnit = true) =>
      words ? valueText(id, withUnit) : `${byId.get(id)!.symbol} = ${valueText(id, withUnit)}`,
    /** A label that stands alone: "d = 4 cm". K–5: "How much longer: 4 cm". */
    named: (id: string, withUnit = true) => {
      const v = byId.get(id)!;
      return words
        ? `${v.name}: ${valueText(id, withUnit)}`
        : `${v.symbol} = ${valueText(id, withUnit)}`;
    },
    /** Current values of `ids` that are known, for pinning them during a drag. */
    pin: (ids: string[]): Values =>
      Object.fromEntries(ids.flatMap((id) => (values[id] === undefined ? [] : [[id, values[id]]]))),
    /**
     * Snaps a formula-unit value to the variable's step in the shown unit, within its limits
     * (taken from the unit context's system, which is always in formula units).
     */
    snapTo: (id: string, x: number) => {
      const v = byId.get(id)!;
      const limits = units.system.variables.find((sv) => sv.id === id) ?? v;
      const f = units.factor(id);
      if (v.allowed) {
        // The nearest value the lesson allows (count by 5s, 10s or 100s).
        const nearest = v.allowed.reduce((best, a) =>
          Math.abs(a - x / f) < Math.abs(best - x / f) ? a : best,
        );
        return nearest * f;
      }
      const shown = snap(
        x / f,
        v.integer ? 1 : (v.step ?? 0.1),
        limits.min === undefined ? -Infinity : limits.min / f,
        limits.max === undefined ? Infinity : limits.max / f,
      );
      return shown * f;
    },
  };
}

/** A line of a caption: prose, or a number sentence (only numbers, operators and units). */
const isNumberSentence = (line: string) =>
  /[=<>]/.test(line) &&
  !/[A-Za-z]{4,}/.test(line.replace(/[a-z]+\b/g, (w) => (w.length <= 3 ? '' : w)));

/**
 * The text under a picture, laid out to read: each sentence on its own line, and a chained
 * number sentence ("6 × 7 = 6 × 5 + 6 × 2 = 30 + 12 = 42") stacked one "=" per line, the way
 * a textbook shows working. Number sentences are bold; the words stay regular.
 */
export function Caption({ children }: { children: string }) {
  const c = usePalette();
  // Items joined with " · " read as one run-on on a phone: one line each.
  const sentences = children
    .split(/\s+·\s+|(?<=[.!?])\s+(?=[A-Z0-9“(])/)
    .map((x) => x.trim())
    .filter(Boolean);
  return (
    <View style={captionStyles.block}>
      {sentences.map((sentence, i) => {
        const bare = sentence.replace(/[.]$/, '');
        const parts = bare.split(' = ');
        if (parts.length > 2 && isNumberSentence(bare)) {
          return (
            <View key={i} style={captionStyles.chain}>
              {parts.map((part, k) => (
                <Text key={k} style={[captionStyles.sentence, { color: c.text }]}>
                  {k === 0 ? part : `= ${part}`}
                </Text>
              ))}
            </View>
          );
        }
        return (
          <Text
            key={i}
            style={[
              isNumberSentence(bare) ? captionStyles.sentence : captionStyles.prose,
              { color: c.text },
            ]}
          >
            {sentence}
          </Text>
        );
      })}
    </View>
  );
}

const captionStyles = StyleSheet.create({
  block: { alignItems: 'center', gap: 2, marginTop: space.sm, paddingHorizontal: space.lg },
  chain: { alignItems: 'flex-start', gap: 1 },
  sentence: {
    fontSize: font.body + 1,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  prose: { fontSize: font.body, textAlign: 'center', lineHeight: 21 },
});
