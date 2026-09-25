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

import { useRep } from './reps/common';
import { useScrollLock } from './scrollLock';
import type { StepperItem } from './stepperContext';
import type { Calculator } from './useCalculator';

const TRACK = 150;
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

/** One vertical slider: the name above, the value below, drag the knob or tap the track. */
function Slider({ calc, item }: { calc: Calculator; item: StepperItem }) {
  const c = usePalette();
  const rep = useRep(calc);
  const v = rep.variable(item.var);
  const [lo, hi] = rangeOf(rep, item);
  const known = rep.known(item.var);
  const shown = known ? rep.shown(item.var) : (item.from ?? lo);
  const ratio = hi > lo ? Math.min(1, Math.max(0, (shown - lo) / (hi - lo))) : 0;
  const knobY = (1 - ratio) * (TRACK - HANDLE);
  const trackTop = useRef(0);
  const { setLocked } = useScrollLock();

  const setFromY = (y: number) => {
    // The knob's center follows the finger; the value snaps to the slider's step.
    const r = 1 - Math.min(1, Math.max(0, (y - HANDLE / 2) / (TRACK - HANDLE)));
    let next = lo + r * (hi - lo);
    const step = item.steps[0] ?? 1;
    next = Math.round(next / step) * step;
    while (item.skip?.includes(next)) next += step;
    calc.set({
      ...rep.pin(item.pin),
      [item.var]: rep.snapTo(item.var, next * rep.factor(item.var)),
    });
  };
  const at = (e: GestureResponderEvent) => e.nativeEvent.pageY - trackTop.current;

  return (
    <View style={styles.slider}>
      <Text style={[styles.name, { color: c.text }]} numberOfLines={2}>
        {`${item.marker ? `${item.marker} ` : ''}${v.name}`}
      </Text>
      <View
        testID={`slider-${item.var}`}
        accessibilityRole="adjustable"
        accessibilityLabel={v.name}
        accessibilityValue={{ min: lo, max: hi, now: shown, text: rep.value(item.var) }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={(e) => {
          // Hold the page still while the finger is on the slider.
          setLocked(true);
          trackTop.current = e.nativeEvent.pageY - e.nativeEvent.locationY;
          setFromY(e.nativeEvent.locationY);
        }}
        onResponderMove={(e) => setFromY(at(e))}
        onResponderRelease={() => setLocked(false)}
        onResponderTerminate={() => setLocked(false)}
        style={[
          styles.track,
          { backgroundColor: c.chartSurface, borderColor: c.border },
          WEB_TRACK_STYLE,
        ]}
      >
        {/* Children don't take touches, so the track's own coordinates are always used. */}
        <View pointerEvents="none" style={styles.fillWrap}>
          <View
            style={[
              styles.fill,
              { height: ratio * (TRACK - HANDLE) + HANDLE / 2, backgroundColor: c.chartHighlight },
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
      <Text style={[styles.value, { color: c.text }]} numberOfLines={1}>
        {rep.value(item.var)}
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
        <Slider key={item.var} calc={calc} item={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: space.md, flexWrap: 'wrap' },
  slider: { width: 72, alignItems: 'center', gap: space.xs },
  name: { fontSize: font.caption, fontWeight: '600', textAlign: 'center', minHeight: 30 },
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
  value: { fontSize: font.body, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
