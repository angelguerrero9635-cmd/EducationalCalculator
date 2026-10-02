import { createContext, useContext, useState, useRef, type ReactNode } from 'react';
import {
  Platform,
  View,
  type GestureResponderEvent,
  type ViewStyle,
  StyleSheet,
} from 'react-native';
import { G, Text as SvgText, TSpan, type TextProps as SvgTextProps } from 'react-native-svg';

import { isEarlyGrade, isElementary } from '@/data/modules';
import { dollarsOf, formatNumber, unitFor } from '@/engine/format';
import { subscriptRuns } from '@/engine/subscripts';
import type { Values } from '@/engine/types';
import { chart, font, space, usePalette } from '@/theme';

import { Text } from '@/components/Text';
import { RESPONDER, useWebPointerDrag } from '../pointerDrag';
import type { Calculator } from '../useCalculator';

// Web only: stop the browser from scrolling the page while a handle is dragged.
const WEB_DRAG_STYLE =
  Platform.OS === 'web' ? ({ touchAction: 'none', cursor: 'grab' } as unknown as ViewStyle) : null;

/** Measures the available width and renders children at width × aspect. */
/** Width a picture is drawn at in pre-rendered web HTML (a phone screen minus margins). */
const WEB_START_WIDTH = 358;

/** The size of the Canvas being drawn, for the handles inside it (a handle stays on the picture). */
const CanvasSize = createContext<{ w: number; h: number } | null>(null);

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
      {w > 0 ? (
        <CanvasSize.Provider value={{ w, h }}>
          <View style={{ width: w, height: h }}>{children({ w, h })}</View>
        </CanvasSize.Provider>
      ) : null}
    </View>
  );
}

/**
 * A touch target (chart.handleTouch square) centered on (x, y) inside a Canvas. Reports drag offsets from where
 * the drag started, so callers convert them with the scale captured in `onStart`. A handle whose
 * value has left the picture's window (the window is frozen while it is dragged) is drawn at the
 * picture's edge, never off the picture: the drag goes on from the pointer, not from the knob.
 */
export function DragHandle({
  x: x0,
  y: y0,
  label,
  onStart,
  onMove,
  onEnd,
  testID,
  drives,
}: {
  x: number;
  y: number;
  label: string;
  onStart: () => void;
  onMove: (dx: number, dy: number) => void;
  onEnd?: () => void;
  testID?: string;
  /**
   * The values a handle moving two ways sends (a wave's crest: its amplitude and wavelength;
   * a point worked out from two typed moves), written as data-drives for the review scripts:
   * a typed value each worked-out one stands for may change with them.
   */
  drives?: string[];
}) {
  const c = usePalette();
  const size = useContext(CanvasSize);
  const edge = chart.handle / 2;
  const x = size ? Math.min(size.w - edge, Math.max(edge, x0)) : x0;
  const y = size ? Math.min(size.h - edge, Math.max(edge, y0)) : y0;
  // Page coordinates where the drag started; offsets are measured from here.
  const origin = useRef({ x: 0, y: 0 });
  // Web: pointer events with capture (see pointerDrag.ts).
  const ref = useRef<View>(null);
  useWebPointerDrag(ref, {
    start: (x0, y0) => {
      origin.current = { x: x0, y: y0 };
      onStart();
    },
    move: (x1, y1) => onMove(x1 - origin.current.x, y1 - origin.current.y),
    end: () => onEnd?.(),
  });
  const offset = (e: GestureResponderEvent) =>
    [e.nativeEvent.pageX - origin.current.x, e.nativeEvent.pageY - origin.current.y] as const;

  return (
    <View
      // Every handle can be found by the review scripts: drag-<id>, or drag-<its label>.
      testID={
        testID ??
        `drag-${label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')}`
      }
      accessibilityLabel={`Drag to change ${label}`}
      {...(drives ? ({ dataSet: { drives: drives.join(' ') } } as object) : {})}
      ref={ref}
      onStartShouldSetResponder={RESPONDER ? () => true : undefined}
      onStartShouldSetResponderCapture={RESPONDER ? () => true : undefined}
      onMoveShouldSetResponder={RESPONDER ? () => true : undefined}
      onResponderTerminationRequest={RESPONDER ? () => false : undefined}
      onResponderGrant={
        RESPONDER
          ? (e) => {
              origin.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
              onStart();
            }
          : undefined
      }
      onResponderMove={RESPONDER ? (e) => onMove(...offset(e)) : undefined}
      onResponderRelease={RESPONDER ? () => onEnd?.() : undefined}
      onResponderTerminate={RESPONDER ? () => onEnd?.() : undefined}
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
      {/* A white knob with an accent ring and dot, lifted by a soft shadow: reads as "grab me". */}
      <View
        style={{
          width: chart.handle,
          height: chart.handle,
          borderRadius: chart.handle / 2,
          borderWidth: chart.handleRing,
          borderColor: c.chartHighlight,
          backgroundColor: c.card,
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 1px 3px ${c.shadow}, 0 0 0 1px ${c.shadow}`,
        }}
      >
        <View
          style={{
            width: chart.handle * 0.3,
            height: chart.handle * 0.3,
            borderRadius: chart.handle,
            backgroundColor: c.chartHighlight,
          }}
        />
      </View>
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
    /** Whether a drag is on (the value is held): a handle must then stay mounted. */
    frozen: frozen !== null,
    freeze: () => setFrozen({ value: live }),
    /** Freeze at a value worked out while drawing (a chart window that needs the width). */
    freezeAt: (value: T) => setFrozen({ value }),
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
export function ChartText({
  halo,
  ...props
}: SvgTextProps & {
  /**
   * A callout over a plot (a point's name, a slope, a radius): drawn on a halo of the page's
   * colour (or this colour), so it wins over the grid, the axis numbers and lines under it.
   */
  halo?: boolean | string;
}) {
  const c = usePalette();
  if (halo) {
    const color = typeof halo === 'string' ? halo : c.background;
    return (
      <G>
        <ChartText
          {...props}
          fill={color}
          stroke={color}
          strokeWidth={4}
          strokeLinejoin="round"
          accessible={false}
        />
        <ChartText {...props} />
      </G>
    );
  }
  const family = font.family ?? (Platform.OS === 'web' ? font.webSystem : undefined);
  const { children } = props;
  if (typeof children === 'string' && children.includes('_')) {
    // "v_y", "T_c": a subscript drawn small and lowered, never a raw underscore.
    const size = Number(props.fontSize ?? chart.label);
    const runs = subscriptRuns(children);
    const drop = size * 0.3;
    return (
      <SvgText fontFamily={family} fill={c.chartInk} fontSize={chart.label} {...props}>
        {runs.length === 1 && !runs[0]!.sub
          ? runs[0]!.s
          : runs.map((r, i) =>
              r.sub ? (
                <TSpan key={i} dy={drop} fontSize={size * 0.72}>
                  {r.s}
                </TSpan>
              ) : (
                <TSpan key={i} dy={i > 0 && runs[i - 1]!.sub ? -drop : 0}>
                  {r.s}
                </TSpan>
              ),
            )}
      </SvgText>
    );
  }
  return <SvgText fontFamily={family} fill={c.chartInk} fontSize={chart.label} {...props} />;
}

/** Joins a short phrase with non-breaking spaces, so a caption never wraps inside "C = 8 corners". */
/**
 * Keeps a label inside a canvas `w` wide: a label that would run past an edge is flipped to
 * the inside of its point (`gap` px away) or, when centered, slid in from the edge. Widths are
 * estimated from the font size.
 */
export function fitLabel(
  x: number,
  text: string,
  fontSize: number,
  w: number,
  anchor: 'start' | 'middle' | 'end' = 'middle',
  gap = 0,
): { x: number; textAnchor: 'start' | 'middle' | 'end' } {
  const tw = text.length * fontSize * 0.58;
  if (anchor === 'middle') {
    const half = tw / 2 + 2;
    return { x: Math.min(w - half, Math.max(half, x)), textAnchor: 'middle' };
  }
  if (anchor === 'end' && x - tw < 2) return { x: x + 2 * gap, textAnchor: 'start' };
  if (anchor === 'start' && x + tw > w - 2) return { x: x - 2 * gap, textAnchor: 'end' };
  return { x, textAnchor: anchor };
}

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
/**
 * A handle that moves two values at once (a rectangle's corner: its length and width). When the
 * pair would change a typed value it does not send (the typed area of a missing-side page),
 * only the pair's typed value moves, the one the pointer went farther along first, and the
 * other follows from the page's rules: a drag never changes a typed value it does not send.
 */
export function setPair(
  calc: Calculator,
  rep: ReturnType<typeof useRep>,
  pins: Values,
  updates: Record<string, number>,
  /** The pair's ids, the one the pointer moved farther along first. */
  order: string[],
) {
  const both = { ...pins, ...updates };
  if (calc.fitsHeld(both)) return calc.set(both);
  for (const id of order.filter((x) => rep.typed(x))) {
    // The value itself, else the nearest that fits on past it, the way the pointer went (a
    // typed area of 24 takes a length of 8 after 6: 7 leaves no whole width).
    const now = calc.values[id];
    const step = rep.slide(id)?.slide.step ?? 0;
    const dir = now === undefined || updates[id]! >= now ? 1 : -1;
    const moved = now === undefined || Math.abs(updates[id]! - now) > 1e-9;
    for (let k = 0; k <= (moved && step > 0 ? 12 : 0); k++) {
      const one = { ...pins, [id]: updates[id]! + dir * k * step };
      if (calc.fitsHeld(one)) return calc.set(one, rep.slide(id));
    }
  }
  const first = order.find((x) => rep.typed(x)) ?? order[0]!;
  calc.set({ ...pins, [first]: updates[first]! }, rep.slide(first));
}

/**
 * The values a drag holds still while it sends `updates`: `ids` as they are, unless holding a
 * worked-out one would change a typed value the drag does not send (a rate worked out from two
 * typed totals); then only the typed ones, and the worked-out one gives way.
 */
export function pinHeld(
  calc: Calculator,
  rep: ReturnType<typeof useRep>,
  ids: string[],
  updates: Record<string, number>,
): Values {
  const all = rep.pin(ids);
  return calc.fitsHeld({ ...all, ...updates }) ? all : rep.pinTyped(ids);
}

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
  const typedOf = (id: string) => {
    const st = calc.status(id);
    return st === 'given' || st === 'example';
  };
  // Grades 9–12 science: a worked-out value in a picture reads to 3 significant figures, as the
  // picture's own working does ("V = 71,900 V", "T = 0.314 s", "3.21 × 10⁹ years"), not at the
  // box's 4 decimals. A typed value reads as typed; a variable with its own figures keeps them.
  const threeFigures = /^s\.(9|1[0-2])\./.test(module.id);
  const pictureNumber = (id: string, x: number) => {
    const v = byId.get(id)!;
    const plain =
      !threeFigures ||
      typedOf(id) ||
      x === 0 ||
      !Number.isFinite(x) ||
      v.integer ||
      v.sigFigs ||
      v.figures ||
      v.pi ||
      v.fraction ||
      v.repeating ||
      v.full ||
      v.allowed;
    if (plain) return formatNumber(x, v);
    const r = Number(x.toPrecision(3));
    const abs = Math.abs(r);
    // Scientific form only where plain digits would be too long (71,900 V, not 7.19 × 10⁴ V).
    return formatNumber(r, { ...v, scientific: v.scientific && (abs >= 1e7 || abs < 1e-4) });
  };
  const valueText = (id: string, withUnit: boolean) => {
    const x = values[id];
    const unit = units.display[id];
    const shown = x === undefined ? '?' : pictureNumber(id, units.toDisplay(id, x));
    if (!withUnit || !unit || x === undefined) return shown;
    // $ goes before the number; ¢, % and ° go right after it; other units after a space.
    if (unit === '$') return dollarsOf(units.toDisplay(id, x), shown);
    return `${shown}${['¢', '%', '°', '′', '″', '×'].includes(unit) ? '' : ' '}${unitFor(units.toDisplay(id, x), unit)}`;
  };
  return {
    variable: (id: string) => byId.get(id)!,
    /**
     * Whether a handle can ever move this value: not when it can take one number only (a fact
     * to read, `allowed: [69]`, or min = max). Such a handle is not drawn.
     */
    movable: (id: string) => {
      const v = byId.get(id)!;
      return !(v.allowed?.length === 1 || (v.min !== undefined && v.min === v.max));
    },
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
    /** Grades 3–5: names and word rules, no letters yet (variables start in Grade 6). */
    elementary: !early && words,
    /** A value as shown, with its unit: "12 cm", "$5", "35¢", or "?". */
    value: (id: string, withUnit = true) => valueText(id, withUnit),
    /**
     * A name with its formula symbol, e.g. "Bigger amount (B)", so pictures match formulas.
     * K–5: the name alone (no letters before Grade 6).
     */
    tag: (id: string) => {
      const v = byId.get(id)!;
      return words ? v.name : `${v.name} (${v.symbol})`;
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
    /** Whether the student typed `id` (or the example gave it), not worked it out. */
    typed: (id: string) => typedOf(id),
    /**
     * Current values of the `ids` the student typed, for pinning them during a drag. A worked-out
     * value is left to follow: pinning it would turn it into a typed one and make the solver work
     * a typed value out from it (a circuit's R worked out from V and I).
     */
    pinTyped: (ids: string[]): Values =>
      Object.fromEntries(
        ids.flatMap((id) => (values[id] === undefined || !typedOf(id) ? [] : [[id, values[id]]])),
      ),
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
    /**
     * The `set` option for a drag: past what the other values allow, the handle stops at the
     * last value that fits instead of the value being refused (steps of the shown unit).
     */
    slide: (id: string) => {
      const v = byId.get(id)!;
      if (v.allowed) return undefined;
      return { slide: { id, step: (v.integer ? 1 : (v.step ?? 0.1)) * units.factor(id) } };
    },
  };
}

/** The most characters of a bold caption line a phone shows on one line. */
const ONE_LINE = 34;

/** A line of a caption: prose, or a number sentence (only numbers, operators and units). */
const isNumberSentence = (line: string) =>
  /[=<>]/.test(line) &&
  // (Whole words: "With" is a word, not "W" and a unit "ith".)
  !/[A-Za-z]{4,}/.test(line.replace(/\b[a-z]+\b/g, (w) => (w.length <= 3 ? '' : w)));

/**
 * The text under a picture, laid out to read: each sentence on its own line, and a chained
 * number sentence too long for one line ("6 × 7 = 6 × 5 + 6 × 2 = 30 + 12 = 42") stacked one
 * "=" per line, the way a textbook shows working. Number sentences are bold; the words stay regular.
 */
export function Caption({ children }: { children: string }) {
  const c = usePalette();
  // Items joined with " · " read as one run-on on a phone: one line each.
  const sentences = children
    .split(/\s+·\s+|(?<=[.!?])\s+(?=[A-Z0-9“(])/)
    .map((x) => x.trim())
    .filter(Boolean);
  // A chain short enough for a phone's line stays on one line (vₓ = 20 × cos 30° = 17.3 m/s);
  // a longer one is stacked, each line as many "= …" steps as fit (d² = 3² + 4² / = 9 + 16 =
  // 25), not one a line. A sentence that only ends in a chain ("With R = 0.0821, PV = nRT: …")
  // is never stacked: its first part has a comma, a colon or a word.
  const chainOf = (sentence: string) => {
    const bare = sentence.replace(/[.]$/, '');
    const parts = bare.split(' = ');
    if (parts.length < 3 || bare.length <= ONE_LINE || !isNumberSentence(bare)) return undefined;
    if (/[,:;]/.test(parts[0]!) || /\b(?!(?:sin|cos|tan|log|lim)\b)[A-Za-z]{3,}/.test(parts[0]!))
      return undefined;
    const lines: string[] = [parts[0]!];
    for (const part of parts.slice(1)) {
      const last = lines[lines.length - 1]!;
      const joined = `${last} = ${part}`;
      if (lines.length > 1 && joined.length + 2 <= ONE_LINE) lines[lines.length - 1] = joined;
      else if (lines.length === 1 && joined.length <= ONE_LINE) lines[0] = joined;
      else lines.push(part);
    }
    return lines;
  };
  // Worked chains side by side in the list share one left edge, so three blocks of work
  // start at the same indent instead of each centred on its own.
  const runs: string[][][] = [];
  const items: (string | number)[] = [];
  sentences.forEach((sentence) => {
    const chain = chainOf(sentence);
    if (!chain) items.push(sentence);
    else if (typeof items[items.length - 1] === 'number') runs[runs.length - 1]!.push(chain);
    else {
      items.push(runs.length);
      runs.push([chain]);
    }
  });
  return (
    <View style={captionStyles.block}>
      {items.map((item, i) => {
        if (typeof item === 'number') {
          return (
            <View key={i} style={captionStyles.chains}>
              {runs[item]!.map((parts, j) => (
                <View key={j} style={captionStyles.chain}>
                  {parts.map((part, k) => (
                    <Text key={k} style={[captionStyles.sentence, { color: c.text }]}>
                      {k === 0 ? part : `= ${part}`}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          );
        }
        const bare = item.replace(/[.]$/, '');
        return (
          <Text
            key={i}
            style={[
              isNumberSentence(bare) ? captionStyles.sentence : captionStyles.prose,
              { color: c.text },
            ]}
          >
            {item}
          </Text>
        );
      })}
    </View>
  );
}

const captionStyles = StyleSheet.create({
  block: { alignItems: 'center', gap: 2, marginTop: space.sm, paddingHorizontal: space.lg },
  chains: { alignItems: 'flex-start', gap: 4 },
  chain: { alignItems: 'flex-start', gap: 1 },
  sentence: {
    fontSize: font.body + 1,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  prose: { fontSize: font.body, textAlign: 'center', lineHeight: 21 },
});
