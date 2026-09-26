import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'hundredChart' }>;

/**
 * Numbers 1–100 (or 1–120) in rows of ten. Every number up to `value` is shaded, so full rows
 * show the tens; `marks` (e.g. one more, ten more) are outlined. Tap a number to set `value`.
 */
export function HundredChart({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  /** "One more p = 31"; K–2: "One more: 31". */
  const named = (id: string) =>
    rep.early ? rep.named(id) : `${rep.variable(id).name} ${rep.label(id)}`;
  const n = rep.known(spec.value) ? Math.round(rep.shown(spec.value)) : 0;
  const step =
    spec.multiplesOf && rep.known(spec.multiplesOf) ? Math.round(rep.shown(spec.multiplesOf)) : 0;
  // A puzzle piece: the number and its neighbors before, after, above and below.
  const piece = spec.piece
    ? [n, n - 1, n + 1, n - 10, n + 10].filter(
        (k) =>
          k >= 1 &&
          k <= spec.max &&
          (Math.abs(k - n) !== 1 || Math.ceil(k / 10) === Math.ceil(n / 10)),
      )
    : undefined;
  const marks = (spec.marks ?? []).filter(rep.known).map((id) => Math.round(rep.shown(id)));
  // Counting by tens from n: a dot on each number passed (n + 10, n + 20, …).
  const tens =
    spec.tens && rep.known(spec.tens.count) && n > 0
      ? Array.from(
          { length: Math.max(0, Math.round(rep.shown(spec.tens.count))) },
          (_, i) => n + 10 * (i + 1),
        )
      : [];

  return (
    <View style={{ gap: space.sm }}>
      <Canvas aspect={spec.max / 100}>
        {({ w }) => {
          const cell = Math.floor((w - 2 * chart.stroke) / 10);
          return (
            <View
              style={[
                styles.grid,
                { width: cell * 10 + 2 * chart.stroke, borderColor: c.chartInk },
              ]}
            >
              {Array.from({ length: spec.max }, (_, i) => {
                const k = i + 1;
                const on = spec.multiplesOf ? step > 0 && k % step === 0 : k <= n;
                const blank = piece !== undefined && !piece.includes(k);
                const marked = marks.includes(k);
                const passed = tens.includes(k);
                return (
                  <Pressable
                    key={k}
                    testID={`num-${k}`}
                    accessibilityLabel={`${k}`}
                    onPress={() => calc.set({ [spec.value]: k })}
                    style={[
                      styles.cell,
                      {
                        width: cell,
                        height: cell,
                        borderColor:
                          marked || (spec.multiplesOf && k === n) ? c.chartInk : c.chartGrid,
                        borderWidth:
                          marked || (spec.multiplesOf && k === n)
                            ? chart.stroke
                            : StyleSheet.hairlineWidth,
                        backgroundColor: blank
                          ? c.chartSurface
                          : spec.multiplesOf
                            ? on
                              ? c.chartHighlight
                              : c.background
                            : k === n
                              ? c.chartHighlight
                              : on && !piece
                                ? c.chartFill
                                : c.background,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.num,
                        {
                          color: blank
                            ? 'transparent'
                            : (spec.multiplesOf ? on : k === n)
                              ? c.onChartHighlight
                              : c.chartInk,
                          fontSize: Math.min(font.caption + 1, cell / 2.6),
                        },
                      ]}
                    >
                      {k}
                    </Text>
                    {passed ? <View style={[styles.dot, { backgroundColor: c.chartInk }]} /> : null}
                  </Pressable>
                );
              })}
            </View>
          );
        }}
      </Canvas>
      <Caption>
        {[
          spec.multiplesOf
            ? `${rep.tag(spec.value)} ${rep.value(spec.value)} (in a box). Multiples of ${rep.value(spec.multiplesOf)} (shaded)`
            : `${rep.tag(spec.value)} ${rep.value(spec.value)} (shaded)`,
        ]
          .concat(
            (spec.marks ?? [])
              .filter(rep.known)
              .map((id) =>
                Math.round(rep.shown(id)) > spec.max
                  ? `${named(id)} (past the chart)`
                  : `${named(id)} (in a box)`,
              ),
            spec.tens && rep.known(spec.tens.count) ? [`${named(spec.tens.count)} (dots)`] : [],
          )
          .map((line) => `${line}.`)
          .join(' ')}
      </Caption>
      {spec.tens ? (
        <Steppers
          calc={calc}
          items={[
            {
              var: spec.tens.count,
              steps: [1],
              pin: [spec.value],
              marker: '•',
              // Only as many tens as fit on the chart from the start number, so the slider
              // never asks for a number past the chart (which would drop the start number).
              ...(n > 0 ? { wrap: [1, Math.max(1, Math.floor((spec.max - n) / 10))] } : {}),
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: { position: 'absolute', top: 3, right: 3, width: 6, height: 6, borderRadius: 3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'center', borderWidth: chart.stroke },
  cell: { alignItems: 'center', justifyContent: 'center' },
  num: { fontVariant: ['tabular-nums'] },
});
