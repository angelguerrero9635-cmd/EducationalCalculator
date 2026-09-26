import { useRef } from 'react';
import {
  Platform,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type ViewStyle,
} from 'react-native';

import { Text } from '@/components/Text';
import { chart, font, radius, space, usePalette } from '@/theme';

import { RESPONDER, useWebPointerDrag } from './pointerDrag';
import { useRep } from './reps/common';
import type { StepperItem } from './stepperContext';
import type { Calculator } from './useCalculator';

const TRACK = 150;
/** With at most four sliders the row is the page's tallest block: a shorter track. */
const SHORT_TRACK = 120;
/** The browser must not pan the page while a finger moves along the track. */
const WEB_TRACK_STYLE =
  Platform.OS === 'web'
    ? ({ touchAction: 'none', userSelect: 'none' } as unknown as ViewStyle)
    : null;
const HANDLE = 26;

/** The range a slider covers, in the shown unit. */
function rangeOf(rep: ReturnType<typeof useRep>, item: StepperItem): [number, number] {
  if (item.wrap) return item.wrap;
  const v = rep.variable(item.var);
  const f = rep.factor(item.var);
  const lo = (v.min ?? 0) / f;
  const shown = rep.known(item.var) ? rep.shown(item.var) : 0;
  // No top limit: room for double the current value, and at least 10.
  const hi = v.max === undefined ? Math.max(10, 2 * shown) : v.max / f;
  return [Math.min(lo, hi), Math.max(lo, hi)];
}

/**
 * The part of a slider's range the other values allow, in the shown unit: with 20 to add
 * and 100 the most in all, a start of 95 fits and 96 doesn't. Found by halving from the
 * current value toward each end (the values that fit sit in one run around it).
 */
function reachable(
  rep: ReturnType<typeof useRep>,
  calc: Calculator,
  item: StepperItem,
  [lo, hi]: [number, number],
  step: number,
): [number, number] {
  if (!rep.known(item.var)) return [lo, hi];
  const now = rep.shown(item.var);
  const pins = rep.pin(item.pin);
  const f = rep.factor(item.var);
  // Values are probed as the slider would send them: on the variable's own steps (tens for
  // a count of tens), or the nearest value it allows.
  const v = rep.variable(item.var);
  const snap = (x: number) =>
    v.allowed ? rep.snapTo(item.var, x * f) / f : Math.round(x / step) * step;
  const fits = (x: number) => calc.fits({ ...pins, [item.var]: rep.snapTo(item.var, x * f) });
  const edge = (end: number) => {
    if (fits(end)) return end;
    // The values that fit usually sit in one run around `now`: halve toward `end` for its
    // last one. A count of parts fits only at divisors (4 and 8, not 5 to 7), so after
    // the halving, look a few steps past the run for another fit and go on from there.
    let good = now;
    for (let round = 0; round < 4; round++) {
      let bad = end;
      for (let i = 0; i < 14 && Math.abs(bad - good) > step; i++) {
        const mid = snap(good + (bad - good) / 2);
        if (mid === good || mid === bad || (mid - good) * (bad - good) <= 0) break;
        if (fits(mid)) good = mid;
        else bad = mid;
      }
      const dir = end > good ? 1 : -1;
      let further: number | undefined;
      for (let k = 1; k <= 24; k++) {
        const x = good + dir * k * step;
        if ((end - x) * dir < 0) break;
        if (fits(x)) {
          further = x;
          break;
        }
      }
      if (further === undefined) break;
      good = further;
    }
    return good;
  };
  return [Math.min(now, edge(lo)), Math.max(now, edge(hi))];
}

/** One vertical slider: the name above, the value below, drag the knob or tap the track. */
function Slider({
  calc,
  item,
  narrow,
  wide,
}: {
  calc: Calculator;
  item: StepperItem;
  narrow: boolean;
  wide: boolean;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const v = rep.variable(item.var);
  const full = rangeOf(rep, item);
  // The track covers only what fits with the other values held still, so the knob stays
  // under the finger instead of springing back from a value that can't be taken.
  const [lo, hi] = item.wrap
    ? full
    : reachable(rep, calc, item, full, Math.max(item.steps[0] ?? 1, v.multipleOf ?? 0));
  const known = rep.known(item.var);
  const shown = known ? rep.shown(item.var) : (item.from ?? lo);
  const value = rep.value(item.var);
  const ratio = hi > lo ? Math.min(1, Math.max(0, (shown - lo) / (hi - lo))) : 0;
  // Only one value fits with the others held still: the slider is shown held, not movable.
  const held = known && !(hi > lo);
  const track = wide ? SHORT_TRACK : TRACK;
  const knobY = (1 - ratio) * (track - HANDLE);
  const trackTop = useRef(0);

  const setFromY = (y: number) => {
    // The knob's center follows the finger; the value snaps to the slider's step.
    const r = 1 - Math.min(1, Math.max(0, (y - HANDLE / 2) / (track - HANDLE)));
    let next = lo + r * (hi - lo);
    const step = item.steps[0] ?? 1;
    next = Math.round(next / step) * step;
    while (item.skip?.includes(next)) next += step;
    calc.set(
      {
        ...rep.pin(item.pin),
        [item.var]: rep.snapTo(item.var, next * rep.factor(item.var)),
      },
      // Past what the other values allow, the slider stops at the last value that fits.
      { slide: { id: item.var, step: step * rep.factor(item.var) } },
    );
  };
  const at = (e: GestureResponderEvent) => e.nativeEvent.pageY - trackTop.current;
  // Web: pointer events with capture (see pointerDrag.ts). The track's top is measured
  // once, at the press: the finger's travel is what counts, not where the page has moved.
  const trackRef = useRef<View>(null);
  useWebPointerDrag(trackRef, {
    start: (_x, y, el) => {
      trackTop.current = el.getBoundingClientRect().top;
      setFromY(y - trackTop.current);
    },
    move: (_x, y) => setFromY(y - trackTop.current),
  });

  return (
    <View style={[styles.slider, narrow && styles.narrow]}>
      <Text style={[styles.name, { color: c.text }]} numberOfLines={3}>
        {`${item.marker ? `${item.marker} ` : ''}${v.name}`}
      </Text>
      <View
        testID={`slider-${item.var}`}
        accessibilityRole="adjustable"
        accessibilityLabel={v.name}
        accessibilityValue={{ min: lo, max: hi, now: shown, text: value }}
        // React Native Web doesn't write accessibilityValue to the DOM: screen readers (and
        // scripts/test-sliders.mjs) read these.
        aria-valuemin={lo}
        aria-valuemax={hi}
        aria-valuenow={known ? shown : undefined}
        aria-valuetext={value}
        aria-disabled={held || undefined}
        accessibilityState={{ disabled: held }}
        ref={trackRef}
        onStartShouldSetResponder={RESPONDER ? () => true : undefined}
        onMoveShouldSetResponder={RESPONDER ? () => true : undefined}
        onResponderTerminationRequest={RESPONDER ? () => false : undefined}
        onResponderGrant={
          RESPONDER
            ? (e) => {
                trackTop.current = e.nativeEvent.pageY - e.nativeEvent.locationY;
                setFromY(e.nativeEvent.locationY);
              }
            : undefined
        }
        onResponderMove={RESPONDER ? (e) => setFromY(at(e)) : undefined}
        style={[
          styles.track,
          { height: track, backgroundColor: c.chartSurface, borderColor: c.border },
          held && { opacity: 0.45 },
          WEB_TRACK_STYLE,
        ]}
      >
        {/* Children don't take touches, so the track's own coordinates are always used. */}
        <View pointerEvents="none" style={styles.fillWrap}>
          <View
            style={[
              styles.fill,
              { height: ratio * (track - HANDLE) + HANDLE / 2, backgroundColor: c.chartHighlight },
            ]}
          />
        </View>
        <View
          pointerEvents="none"
          style={[
            styles.knob,
            {
              top: knobY,
              backgroundColor: known ? c.chartHighlight : c.surface,
              borderColor: c.chartInk,
            },
          ]}
        />
      </View>
      {/* Long values with unit words ("100 thousand years") go smaller on up to three lines. */}
      <Text
        style={[
          styles.value,
          { color: c.text, fontSize: value.length > 7 ? font.caption : font.body },
        ]}
        numberOfLines={3}
      >
        {value}
      </Text>
    </View>
  );
}

/**
 * Vertical sliders for the values a picture lets the student change: beside the picture on
 * a wide screen, in a row under it on a phone.
 */
export function Sliders({ calc, items }: { calc: Calculator; items: StepperItem[] }) {
  if (items.length === 0) return null;
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <Slider
          key={item.var}
          calc={calc}
          item={item}
          narrow={items.length >= 5}
          wide={items.length <= 4}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // Bottoms align so the tracks line up whatever length each name takes (up to three lines).
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: space.sm,
    flexWrap: 'wrap',
  },
  // Wide enough for names like "Thousand years for each layer" on two lines; four fit a phone.
  slider: { width: 86, alignItems: 'center', gap: space.xs },
  // Five (the coins) still fit a 358 px row: 5 × 64 + 4 × 8.
  narrow: { width: 64 },
  name: { fontSize: font.caption, fontWeight: '600', textAlign: 'center' },
  track: {
    width: 44,
    height: TRACK,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  fillWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  fill: { width: 8, borderRadius: 4 },
  knob: {
    position: 'absolute',
    width: HANDLE,
    height: HANDLE,
    borderRadius: HANDLE / 2,
    borderWidth: chart.stroke,
  },
  value: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    minHeight: 22,
  },
});
