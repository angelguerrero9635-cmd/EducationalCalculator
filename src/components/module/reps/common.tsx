import { useState, useRef, type ReactNode } from 'react';
import { Platform, View, type GestureResponderEvent, type ViewStyle } from 'react-native';
import { Text as SvgText, type TextProps as SvgTextProps } from 'react-native-svg';

import { formatNumber } from '@/engine/format';
import type { Values } from '@/engine/types';
import { chart, font, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';

// Web only: stop the browser from scrolling the page while a handle is dragged.
const WEB_DRAG_STYLE =
  Platform.OS === 'web' ? ({ touchAction: 'none', cursor: 'grab' } as unknown as ViewStyle) : null;

/** Measures the available width and renders children at width × aspect. */
export function Canvas({
  aspect,
  children,
}: {
  aspect: number;
  children: (size: { w: number; h: number }) => ReactNode;
}) {
  const [w, setW] = useState(0);
  return (
    <View
      style={{ width: '100%', alignItems: 'center' }}
      onLayout={(e) => setW(Math.min(Math.floor(e.nativeEvent.layout.width), chart.maxWidth))}
    >
      {w > 0 ? (
        <View style={{ width: w, height: w * aspect }}>{children({ w, h: w * aspect })}</View>
      ) : null}
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
  return <SvgText fontFamily={font.family} fill={c.chartInk} fontSize={chart.label} {...props} />;
}

/** Rounds to the variable's drag step and keeps it within [min, max]. */
export function snap(x: number, step = 0.1, min = -Infinity, max = Infinity): number {
  const snapped = Math.round(x / step) * step;
  return Math.min(max, Math.max(min, Number(snapped.toFixed(10))));
}

/** Helpers every representation needs. */
export function useRep(calc: Calculator) {
  const { module, values } = calc;
  const byId = new Map(module.variables.map((v) => [v.id, v]));
  return {
    variable: (id: string) => byId.get(id)!,
    known: (id: string) => values[id] !== undefined,
    /** Current value, falling back to the example so shapes still draw (faded). */
    val: (id: string) => values[id] ?? module.example[id]!,
    label: (id: string, withUnit = true) => {
      const v = byId.get(id)!;
      const x = values[id];
      const shown = x === undefined ? '?' : formatNumber(x, v);
      return `${v.symbol} = ${shown}${withUnit && v.unit && x !== undefined ? ` ${v.unit}` : ''}`;
    },
    /** Current values of `ids` that are known, for pinning them during a drag. */
    pin: (ids: string[]): Values =>
      Object.fromEntries(ids.flatMap((id) => (values[id] === undefined ? [] : [[id, values[id]]]))),
    snapTo: (id: string, x: number) => {
      const v = byId.get(id)!;
      return snap(x, v.integer ? 1 : (v.step ?? 0.1), v.min, v.max);
    },
  };
}
