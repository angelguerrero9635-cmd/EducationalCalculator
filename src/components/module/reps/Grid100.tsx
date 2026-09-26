import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import type { Representation } from '@/data/modules';
import { font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, useRep } from './common';

type Spec = Extract<Representation, { kind: 'grid100' }>;

/** One 10 × 10 grid, `shaded` squares filled; tapping square n calls `onTap(n)`. */
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
            backgroundColor: i < shaded ? c.chartHighlight : c.chartSurface,
          }}
        />
      ))}
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
  const shaded = Math.round(rep.val(spec.percent));
  const faded = !rep.known(spec.percent);
  const whole =
    spec.wholes && rep.known(spec.wholes) ? Math.max(0, Math.round(rep.val(spec.wholes))) : 0;
  const second = spec.second ? Math.round(rep.val(spec.second)) : undefined;
  const count = whole + 1 + (spec.second ? 1 : 0);
  const pin = [
    ...(spec.caption ? [spec.caption.whole] : []),
    ...(spec.second ? [spec.second] : []),
    ...(spec.wholes ? [spec.wholes] : []),
  ];
  const sizeFor = (w: number) => Math.min(320, (w - (count - 1) * space.sm) / count);

  return (
    <View style={{ gap: space.sm }}>
      {/* A grid is at most 320 px square: no blank strip under it on a wider phone. */}
      <Canvas aspect={(w) => (sizeFor(w) + (count > 1 ? 20 : 0)) / w}>
        {({ w }) => {
          const size = sizeFor(w);
          const tag = (text: string) => (
            <Text style={[styles.tag, { color: c.textMuted }]}>{text}</Text>
          );
          return (
            <View style={styles.row}>
              {Array.from({ length: whole }, (_, i) => (
                <View key={`w${i}`}>
                  <Grid shaded={100} size={size} faded={false} testPrefix={`whole${i}-`} />
                  {tag('1 whole')}
                </View>
              ))}
              <View>
                <Grid
                  shaded={shaded}
                  size={size}
                  faded={faded}
                  testPrefix="cell-"
                  onTap={(n) => calc.set({ ...rep.pin(pin), [spec.percent]: n })}
                />
                {count > 1 ? tag(rep.tag(spec.percent)) : null}
              </View>
              {spec.second ? (
                <View>
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
            ? `${whole} whole ${whole === 1 ? 'grid' : 'grids'} and ${shaded} of 100 squares shaded`
            : `${rep.named(spec.percent)}: ${shaded} of 100 squares shaded`}
      </Text>
      {spec.caption ? (
        <Text style={[styles.caption, { color: c.chartMuted }]}>
          {`${rep.label(spec.caption.part)} out of ${rep.label(spec.caption.whole)}`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: space.sm },
  tag: { fontSize: font.caption, textAlign: 'center', marginTop: 2 },
  caption: { fontSize: font.body - 1, textAlign: 'center' },
});
