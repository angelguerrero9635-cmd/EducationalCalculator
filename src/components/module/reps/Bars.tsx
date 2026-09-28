import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import Svg, { G, Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, font, space, usePalette } from '@/theme';

import { Icon as CardIconArt } from '../layouts/CardFigure';
import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, niceCeil, useFrozen, useRep } from './common';

type Spec = Extract<Representation, { kind: 'bars' }>;

/** Label sizes: category names and scale numbers, their line height, and a category icon. */
const LABEL = chart.label;
const LINE = 15;
const ICON = 30;
/** The value pill on a draggable bar's top. */
const PILL_H = 26;

/** Splits a name into at most three lines about `width` px wide at the label size. */
function wrap(text: string, width: number) {
  const per = Math.max(5, Math.floor(width / (LABEL * 0.58)));
  const lines: string[] = [];
  for (const word of text.split(' ')) {
    const last = lines[lines.length - 1];
    if (last !== undefined && `${last} ${word}`.length <= per)
      lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines.length > 3 ? [...lines.slice(0, 2), lines.slice(2).join(' ')] : lines;
}

/**
 * A flat bar chart: bars with a 1 px edge in a darker tone, a light grip lip on each bar you can
 * drag, and the value in a pill on the bar's top (the pill is the handle). Category names (and a
 * small card icon each, when the page gives one) sit under the bars; the scale is on the left.
 */
export function Bars({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const editable = spec.bars.filter((b) => b.editable).map((b) => b.var);
  // Bars are drawn and labeled in the shown unit.
  const shown = spec.bars.map((b) => rep.shown(b.var));
  const step =
    typeof spec.scale === 'string'
      ? rep.known(spec.scale)
        ? Math.max(1, rep.shown(spec.scale))
        : 1
      : spec.scale;
  const lowest = Math.min(0, ...shown);
  const highest = Math.max(0, ...shown);
  // Range grows (to a round number) to fit the values; frozen while a bar is dragged.
  const range = useFrozen({
    min: lowest < spec.min ? -niceCeil(-lowest) : spec.min,
    max: highest > spec.max ? niceCeil(highest) : spec.max,
  });
  const icons = spec.bars.some((b) => b.icon);
  // Room on the left for the numbered scale, when there is one.
  const axis = step ? 34 : 0;
  const names = (w: number) => {
    const slot = (w - 12 - axis) / spec.bars.length;
    return spec.bars.map((b) => {
      const v = rep.variable(b.var);
      const lines = wrap(v.name, slot - 6);
      return rep.words ? lines : spec.bars.length <= 5 ? [v.symbol, ...lines] : [v.symbol];
    });
  };
  // Names start below a pill resting at 0.
  const drop = editable.length ? 30 : 20;
  const bottomOf = (w: number) =>
    drop - 10 + Math.max(...names(w).map((l) => l.length)) * LINE + (icons ? ICON + 6 : 0);

  return (
    <>
      <Canvas aspect={(w) => (Math.min(250, w * 0.56) + 24 + bottomOf(w)) / w}>
        {({ w, h }) => {
          const top = 24;
          const bottom = bottomOf(w);
          const plotH = h - top - bottom;
          // A line every `scale` step; numbers every 1, 2, 5 or 10 steps, whichever gives at
          // most 10 numbers. The top is rounded up to the next number, so the tallest bar (50
          // with steps of 2) always sits on the scale.
          const k = step
            ? ([1, 2, 5, 10, 20, 50].find(
                (n) => (range.value.max - range.value.min) / (step * n) <= 10,
              ) ?? 100)
            : 0;
          const every = (step ?? 0) * k;
          const min = range.value.min;
          const max = every
            ? Math.ceil((range.value.max - min) / every) * every + min
            : range.value.max;
          const scale = plotH / (max - min);
          const sy = (v: number) => top + (max - Math.min(max, Math.max(min, v))) * scale;
          const slot = (w - 12 - axis) / spec.bars.length;
          const barW = Math.min(100, slot * 0.68);
          const cx = (i: number) => 6 + axis + slot * (i + 0.5);
          const lines =
            step && (max - min) / step <= 60
              ? Array.from({ length: Math.round((max - min) / step) + 1 }, (_, i) => min + i * step)
              : [];
          const marks = every
            ? Array.from({ length: Math.round((max - min) / every) + 1 }, (_, i) => min + i * every)
            : [];
          const labels = names(w);
          // The number a bar shows: none when the student reads the scale (it's the question).
          const valueText = (b: Spec['bars'][number]) =>
            !rep.known(b.var)
              ? '?'
              : spec.readScale
                ? ''
                : formatNumber(rep.shown(b.var), rep.variable(b.var));
          const pillW = (text: string) => Math.max(40, text.length * chart.emphasis * 0.62 + 20);
          return (
            <>
              <Svg width={w} height={h}>
                {lines.map((m) => (
                  <Line
                    key={`g${m}`}
                    x1={axis}
                    y1={sy(m)}
                    x2={w - 4}
                    y2={sy(m)}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                    strokeOpacity={marks.includes(m) ? 1 : 0.5}
                  />
                ))}
                {marks.map((m) => (
                  <ChartText
                    key={`s${m}`}
                    x={axis - 6}
                    y={sy(m) + 4}
                    fontSize={LABEL}
                    fill={c.chartMuted}
                    textAnchor="end"
                  >
                    {formatNumber(m)}
                  </ChartText>
                ))}
                {spec.bars.map((b, i) => {
                  const v = rep.shown(b.var);
                  const y0 = sy(0);
                  const y1 = sy(v);
                  const known = rep.known(b.var);
                  const x = cx(i) - barW / 2;
                  const bh = Math.max(1, Math.abs(y1 - y0));
                  return (
                    <G key={b.var} opacity={known ? 1 : 0.35}>
                      <Rect
                        x={x}
                        y={Math.min(y0, y1)}
                        width={barW}
                        height={bh}
                        rx={2}
                        fill={b.editable ? c.chartHighlight : c.chartFill}
                        fillOpacity={b.editable ? 0.78 : 1}
                        stroke={b.editable ? c.chartHighlight : c.chartMuted}
                        strokeWidth={1}
                        strokeDasharray={b.editable ? undefined : chart.dashFine}
                      />
                      {/* A lighter lip on the top of a bar you can drag. */}
                      {b.editable && v > 0 && bh > 6 ? (
                        <Rect
                          x={x + 1}
                          y={y1 + 0.5}
                          width={barW - 2}
                          height={4}
                          fill={c.shine}
                          fillOpacity={0.4}
                        />
                      ) : null}
                    </G>
                  );
                })}
                <Line
                  // Starts at the scale so the 0 label isn't struck through.
                  x1={axis || 4}
                  y1={sy(0)}
                  x2={w - 4}
                  y2={sy(0)}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                {spec.bars.map((b, i) => {
                  // A bar you can't drag has its value above it (no pill).
                  const v = rep.shown(b.var);
                  const t = valueText(b);
                  if (b.editable || !t) return null;
                  return (
                    <ChartText
                      key={`v${b.var}`}
                      x={cx(i)}
                      y={v >= 0 ? sy(v) - 7 : sy(v) + 17}
                      fontSize={chart.value}
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {t}
                    </ChartText>
                  );
                })}
                {spec.bars.map((b, i) => (
                  <G key={`l${b.var}`}>
                    {labels[i]!.map((line, k) => (
                      <ChartText
                        key={k}
                        x={cx(i)}
                        y={sy(Math.min(0, min)) + drop + k * LINE}
                        fontSize={LABEL}
                        fontWeight={k === 0 || rep.words ? '600' : '400'}
                        textAnchor="middle"
                      >
                        {line}
                      </ChartText>
                    ))}
                    {b.icon ? (
                      <G
                        transform={`translate(${cx(i) - ICON / 2} ${h - ICON - 4}) scale(${ICON / 48})`}
                      >
                        <CardIconArt icon={b.icon} ink={c.chartInk} shade={c.chartFill} />
                      </G>
                    ) : null}
                  </G>
                ))}
              </Svg>
              {spec.bars.map((b, i) =>
                b.editable ? (
                  <DragHandle
                    key={b.var}
                    testID={`drag-${b.var}`}
                    x={cx(i)}
                    y={sy(rep.shown(b.var))}
                    label={rep.variable(b.var).name}
                    onStart={() => {
                      start.current = rep.shown(b.var);
                      range.freeze();
                    }}
                    onEnd={range.release}
                    onMove={(_, dy) =>
                      calc.set(
                        {
                          ...rep.pin(editable.filter((id) => id !== b.var)),
                          [b.var]: rep.snapTo(
                            b.var,
                            (start.current - dy / scale) * rep.factor(b.var),
                          ),
                        },
                        rep.slide(b.var),
                      )
                    }
                  />
                ) : null,
              )}
              {/* The pill over each handle: the bar's value (or a grip when the scale is read). */}
              {spec.bars.map((b, i) => {
                if (!b.editable) return null;
                const t = valueText(b);
                const pw = pillW(t);
                const y = sy(rep.shown(b.var));
                return (
                  <View
                    key={`p${b.var}`}
                    pointerEvents="none"
                    style={[
                      styles.pill,
                      {
                        left: cx(i) - pw / 2,
                        top: y - PILL_H / 2,
                        width: pw,
                        borderColor: c.chartHighlight,
                        backgroundColor: c.card,
                        boxShadow: `0 1px 3px ${c.shadow}`,
                      },
                    ]}
                  >
                    {t ? (
                      <Text style={[styles.pillText, { color: c.chartInk }]}>{t}</Text>
                    ) : (
                      <View style={styles.grip}>
                        {[0, 1, 2].map((k) => (
                          <View
                            key={k}
                            style={[styles.gripLine, { backgroundColor: c.chartHighlight }]}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </>
          );
        }}
      </Canvas>
      {spec.total ? (
        <Text style={[styles.caption, { color: c.chartInk }]}>
          {`${rep.variable(spec.total).name}: ${rep.label(spec.total)}`}
        </Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  caption: { fontSize: font.body, textAlign: 'center', marginTop: space.sm, fontWeight: '600' },
  pill: {
    position: 'absolute',
    height: PILL_H,
    borderRadius: PILL_H / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: { fontSize: chart.emphasis, fontWeight: '700', fontVariant: ['tabular-nums'] },
  grip: { gap: 3 },
  gripLine: { width: 14, height: 2, borderRadius: 1 },
});
