import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'hundredChart' }>;

/**
 * Numbers 1–100 (or 1–120) in rows of ten. With `max: 1000` it draws one hundred of the
 * thousand, the one holding `value` (601–700 for 652); a piece draws three rows around it. Every number up to `value` is shaded, so full rows
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
  // The part drawn: all of a 100 or 120 chart; one hundred (or three rows) of a 1,000 chart.
  const [from, to] = (() => {
    if (spec.max !== 1000) return [1, spec.max];
    const at = Math.max(1, n);
    if (spec.piece) {
      const row = Math.floor((at - 1) / 10) * 10 + 1;
      const start = Math.min(971, Math.max(1, row - 10));
      return [start, start + 29];
    }
    const start = Math.floor((at - 1) / 100) * 100 + 1;
    return [start, start + 99];
  })();
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
      <Canvas aspect={(to - from + 1) / 100}>
        {({ w }) => {
          const cell = Math.floor((w - 2 * chart.stroke) / 10);
          return (
            <View
              style={[
                styles.grid,
                { width: cell * 10 + 2 * chart.stroke, borderColor: c.chartInk },
              ]}
            >
              {Array.from({ length: to - from + 1 }, (_, i) => {
                const k = from + i;
                const on = spec.multiplesOf ? step > 0 && k % step === 0 : k <= n;
                const blank = piece !== undefined && !piece.includes(k);
                const marked = marks.includes(k) && !blank;
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
                          fontSize: Math.min(font.caption + 1, cell / (k >= 1000 ? 3.4 : 2.6)),
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
        {(spec.max === 1000 ? [`Numbers ${from} to ${to.toLocaleString('en-US')}`] : [])
          .concat(
            spec.multiplesOf
              ? `${rep.tag(spec.value)} ${rep.value(spec.value)} (in a box). Multiples of ${rep.value(spec.multiplesOf)} (shaded)`
              : `${rep.tag(spec.value)} ${rep.value(spec.value)} (shaded)`,
          )
          .concat(
            (spec.marks ?? []).filter(rep.known).map((id) => {
              const x = Math.round(rep.shown(id));
              if (x > spec.max) return `${named(id)} (past the chart)`;
              // Off the part drawn, or a blank square of a piece (after 990 is on the next row).
              if (x < from || x > to || (piece && !piece.includes(x)))
                return `${named(id)} (not on this part)`;
              return `${named(id)} (in a box)`;
            }),
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
              ...(n > 0 ? { wrap: [1, Math.max(1, Math.floor((to - n) / 10))] } : {}),
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
