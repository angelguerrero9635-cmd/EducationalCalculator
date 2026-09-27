import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, useRep } from './common';

type Spec = Extract<Representation, { kind: 'grid100' }>;

/**
 * One 10 × 10 grid, `shaded` squares filled (37.5 fills the left half of square 38); tapping
 * square n calls `onTap(n)`.
 */
function Grid({
  shaded,
  size,
  faded,
  onTap,
  testPrefix,
}: {
  shaded: number;
  size: number;
  faded: boolean;
  onTap?: (n: number) => void;
  testPrefix: string;
}) {
  const c = usePalette();
  const cell = size / 10;
  const full = Math.floor(shaded + 1e-9);
  const part = shaded - full;
  return (
    <View style={{ width: size, height: size, opacity: faded ? 0.35 : 1 }}>
      {Array.from({ length: 100 }, (_, i) => (
        <Pressable
          key={i}
          testID={`${testPrefix}${i + 1}`}
          accessibilityLabel={`${i + 1} of 100`}
          disabled={!onTap}
          onPress={() => onTap?.(i + 1)}
          style={{
            position: 'absolute',
            left: (i % 10) * cell,
            top: Math.floor(i / 10) * cell,
            width: cell,
            height: cell,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: c.chartGrid,
            backgroundColor: i < full ? c.chartHighlight : c.chartSurface,
          }}
        >
          {i === full && part > 1e-9 ? (
            <View
              testID={`${testPrefix}part`}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${Math.min(100, part * 100)}%`,
                backgroundColor: c.chartHighlight,
              }}
            />
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

/**
 * Many whole grids as one stack: three grids fanned behind each other with the count on the
 * front one, so 45 ones take the room of one grid.
 */
function Stack({ count, size }: { count: number; size: number }) {
  const c = usePalette();
  const step = Math.max(3, Math.round(size * 0.05));
  const front = size - 2 * step;
  const layer = (k: number) => ({
    position: 'absolute' as const,
    left: k * step,
    top: (2 - k) * step,
    width: front,
    height: front,
    borderWidth: 1,
    borderColor: c.chartGrid,
    backgroundColor: c.chartHighlight,
  });
  return (
    <View style={{ width: size, height: size }} testID="whole-stack">
      <View style={layer(2)} />
      <View style={layer(1)} />
      <View style={{ position: 'absolute', left: 0, top: 2 * step }}>
        <Grid shaded={100} size={front} faded={false} testPrefix="stack-" />
      </View>
      <View style={[styles.badgeWrap, { left: 0, top: 2 * step, width: front, height: front }]}>
        <Text
          numberOfLines={1}
          style={[
            styles.badge,
            { color: c.chartInk, backgroundColor: c.chartSurface, borderColor: c.chartGrid },
          ]}
        >
          {`× ${count}`}
        </Text>
      </View>
    </View>
  );
}

/**
 * 100 squares = the whole. Tapping square n sets the count to n. Whole grids before it show
 * the ones of a decimal; a second grid beside it is a number to compare.
 */
export function Grid100({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  // A "?" shades nothing: the grid never shows a number the student didn't type.
  const faded = !rep.known(spec.percent);
  const raw = faded ? 0 : Math.max(0, rep.val(spec.percent));
  // `past100`: a full grid per 100 before the tapped grid (125% = 1 grid and 25; 200% = 1 and 100).
  const full = spec.past100 && raw > 100 ? Math.ceil(clean(raw / 100)) - 1 : 0;
  const rest = clean(raw - 100 * full);
  // `exact` shades tenths of a square; otherwise a percent like 38.7 shades the nearest square.
  const shaded = spec.exact ? rest : Math.round(rest);
  const whole =
    full +
    (spec.wholes && rep.known(spec.wholes) ? Math.max(0, Math.round(rep.val(spec.wholes))) : 0);
  const second = spec.second ? Math.round(rep.val(spec.second)) : undefined;
  // Past 3 whole grids (with `stack` or `past100`), one stack stands for all of them.
  const stacked = !!(spec.stack || spec.past100) && whole > 3;
  const count = (stacked ? 1 : whole) + 1 + (spec.second ? 1 : 0);
  const pin = [
    ...(spec.caption ? [spec.caption.whole] : []),
    ...(spec.second ? [spec.second] : []),
    ...(spec.wholes ? [spec.wholes] : []),
  ];
  const sizeFor = (w: number) => Math.min(320, (w - (count - 1) * space.sm) / count);

  return (
    <View style={{ gap: space.sm }}>
      {/* A grid is at most 320 px square: no blank strip under it on a wider phone. */}
      {/* Labels under the grids wrap to two lines within a grid's width, so they get room for two. */}
      <Canvas aspect={(w) => (sizeFor(w) + (count > 1 ? 34 : 0)) / w}>
        {({ w }) => {
          const size = sizeFor(w);
          // A label never widens its grid's column: it wraps inside it instead.
          const tag = (text: string) => (
            <Text numberOfLines={2} style={[styles.tag, { color: c.textMuted, width: size }]}>
              {text}
            </Text>
          );
          return (
            <View style={styles.row}>
              {stacked ? (
                <View style={{ width: size }}>
                  <Stack count={whole} size={size} />
                  {tag(`${whole} whole grids`)}
                </View>
              ) : null}
              {Array.from({ length: stacked ? 0 : whole }, (_, i) => (
                <View key={`w${i}`} style={{ width: size }}>
                  <Grid shaded={100} size={size} faded={false} testPrefix={`whole${i}-`} />
                  {tag('1 whole')}
                </View>
              ))}
              <View style={{ width: size }}>
                <Grid
                  shaded={shaded}
                  size={size}
                  faded={faded}
                  testPrefix="cell-"
                  onTap={(n) => calc.set({ ...rep.pin(pin), [spec.percent]: 100 * full + n })}
                />
                {count > 1 ? tag(full > 0 ? `${num(shaded)} of 100` : rep.tag(spec.percent)) : null}
              </View>
              {spec.second ? (
                <View style={{ width: size }}>
                  <Grid
                    shaded={second ?? 0}
                    size={size}
                    faded={!rep.known(spec.second)}
                    testPrefix="second-"
                    onTap={(n) =>
                      calc.set({
                        ...rep.pin([spec.percent, ...pin.filter((x) => x !== spec.second)]),
                        [spec.second!]: n,
                      })
                    }
                  />
                  {tag(rep.tag(spec.second))}
                </View>
              ) : null}
            </View>
          );
        }}
      </Canvas>
      <Text style={[styles.caption, { color: c.chartInk }]}>
        {spec.second
          ? `${shaded} of 100 and ${second ?? '?'} of 100 squares shaded`
          : whole > 0
            ? `${full > 0 ? `${rep.value(spec.percent)} is ` : ''}${whole} whole ${whole === 1 ? 'grid' : 'grids'} and ${num(shaded)} of 100 squares shaded`
            : faded
              ? 'Type a number to shade the grid.'
              : `${rep.value(spec.percent)} is ${num(shaded)} of 100 squares shaded`}
      </Text>
      {spec.caption ? (
        <Text style={[styles.caption, { color: c.chartMuted }]}>
          {`${rep.label(spec.caption.part)} out of ${rep.label(spec.caption.whole)}`}
        </Text>
      ) : null}
    </View>
  );
}

/** Drops float dust (1.25 × 100 = 125.00000000000001) before a percent is split into grids. */
const clean = (x: number) => Math.round(x * 1e6) / 1e6;
const num = (x: number) => formatNumber(x);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: space.sm },
  tag: { fontSize: font.caption, textAlign: 'center', marginTop: 2 },
  caption: { fontSize: font.body - 1, textAlign: 'center' },
  badgeWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  badge: {
    fontSize: font.body,
    fontWeight: '700',
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
});
