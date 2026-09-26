import { useRef } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, niceCeil, useFrozen, useRep, Caption } from './common';

type Spec = Extract<Representation, { kind: 'waterfall' }>;
type Step = Spec['items'][number] & { from: number; to: number };

/**
 * Waterfall: each item moves a running total up (+) or down (−) from where the last one
 * ended; the final bar is the total. Drag the moving end of an editable item.
 */
export function Waterfall({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const editable = spec.items.filter((i) => i.editable).map((i) => i.var);

  // Running total before and after each item.
  const steps = spec.items.reduce<Step[]>((acc, item) => {
    const from = acc.length ? acc[acc.length - 1]!.to : 0;
    return [...acc, { ...item, from, to: from + item.sign * rep.shown(item.var) }];
  }, []);
  const total = rep.shown(spec.total);
  const levels = [0, total, ...steps.flatMap((s) => [s.from, s.to])];
  const lo = Math.min(...levels);
  const hi = Math.max(...levels);
  const range = useFrozen({ min: lo < 0 ? -niceCeil(-lo) : 0, max: hi > 0 ? niceCeil(hi) : 1 });

  return (
    <>
      <Canvas aspect={0.65}>
        {({ w, h }) => {
          const top = 24;
          // K–5 pages name each bar under it (two short lines); later ones use the symbol.
          const bottom = rep.words ? 40 : 28;
          const { min, max } = range.value;
          const scale = (h - top - bottom) / (max - min);
          const sy = (v: number) => top + (max - v) * scale;
          const slot = (w - 16) / (steps.length + 1);
          const barW = Math.min(52, slot * 0.62);
          const cx = (i: number) => 8 + slot * (i + 0.5);
          const bar = (
            key: string,
            i: number,
            from: number,
            to: number,
            fill: string,
            dashed: boolean,
            faded: boolean,
          ) => (
            <Rect
              key={key}
              x={cx(i) - barW / 2}
              y={Math.min(sy(from), sy(to))}
              width={barW}
              height={Math.max(1, Math.abs(sy(to) - sy(from)))}
              fill={fill}
              stroke={c.chartInk}
              strokeDasharray={dashed ? chart.dash : undefined}
              opacity={faded ? 0.35 : 1}
            />
          );
          // Under each bar: its symbol, or on K–5 pages its name on at most two lines.
          const barName = (id: string, x: number, y: number, key: string) =>
            (rep.words ? twoLines(rep.variable(id).name) : [rep.variable(id).symbol]).map(
              (line, k) => (
                <ChartText
                  key={`${key}-${k}`}
                  x={x}
                  y={y + k * 13}
                  fontSize={chart.small}
                  fill={c.chartMuted}
                  textAnchor="middle"
                >
                  {line}
                </ChartText>
              ),
            );
          return (
            <>
              <Svg width={w} height={h}>
                <Line
                  x1={4}
                  y1={sy(0)}
                  x2={w - 4}
                  y2={sy(0)}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                {steps.map((s, i) => [
                  bar(
                    `b${i}`,
                    i,
                    s.from,
                    s.to,
                    s.sign > 0 ? c.chartFill : c.chartSurface,
                    s.sign < 0,
                    !rep.known(s.var),
                  ),
                  // Connector to the next bar (the last one leads into the total).
                  <Line
                    key={`k${i}`}
                    x1={cx(i) + barW / 2}
                    y1={sy(s.to)}
                    x2={cx(i + 1) - barW / 2}
                    y2={sy(s.to)}
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dashFine}
                  />,
                  <ChartText
                    key={`v${i}`}
                    x={cx(i)}
                    y={Math.min(sy(s.from), sy(s.to)) - (s.editable ? 20 : 6)}
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {rep.known(s.var)
                      ? `${s.sign > 0 ? '+' : '−'}${formatNumber(rep.shown(s.var))}`
                      : '?'}
                  </ChartText>,
                  ...barName(s.var, cx(i), h - bottom + 18, `s${i}`),
                ])}
                {bar(
                  'total',
                  steps.length,
                  0,
                  total,
                  c.chartHighlight,
                  false,
                  !rep.known(spec.total),
                )}
                <ChartText
                  x={cx(steps.length)}
                  y={Math.min(sy(0), sy(total)) - 6}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {rep.known(spec.total) ? formatNumber(total) : '?'}
                </ChartText>
                {barName(spec.total, cx(steps.length), h - bottom + 18, 'total')}
              </Svg>
              {steps.map((s, i) =>
                s.editable ? (
                  <DragHandle
                    key={s.var}
                    testID={`drag-${s.var}`}
                    x={cx(i)}
                    y={sy(s.to)}
                    label={rep.variable(s.var).name}
                    onStart={() => {
                      start.current = rep.shown(s.var);
                      range.freeze();
                    }}
                    onEnd={range.release}
                    onMove={(_, dy) =>
                      calc.set({
                        ...rep.pin(editable.filter((id) => id !== s.var)),
                        [s.var]: rep.snapTo(
                          s.var,
                          (start.current - (s.sign * dy) / scale) * rep.factor(s.var),
                        ),
                      })
                    }
                  />
                ) : null,
              )}
            </>
          );
        }}
      </Canvas>
      {/* Symbol key (K–5 bars carry their names), then the subtotals the lesson is about. */}
      {rep.words ? null : (
        <Text style={[styles.caption, { color: c.textMuted }]}>
          {[...spec.items.map((i) => i.var), spec.total]
            .map((id) => `${rep.variable(id).symbol} ${rep.variable(id).name}`)
            .join(' · ')}
        </Text>
      )}
      {spec.caption ? (
        <Caption>
          {spec.caption.map((id) => `${rep.variable(id).name}: ${rep.label(id)}`).join('\n')}
        </Caption>
      ) : null}
    </>
  );
}

/** A name on one line if short, else split at the space nearest its middle. */
function twoLines(name: string): string[] {
  if (name.length <= 9 || !name.includes(' ')) return [name];
  const spaces = [...name.matchAll(/ /g)].map((m) => m.index);
  const cut = spaces.reduce((a, b) =>
    Math.abs(b - name.length / 2) < Math.abs(a - name.length / 2) ? b : a,
  );
  return [name.slice(0, cut), name.slice(cut + 1)];
}

const styles = StyleSheet.create({
  caption: {
    fontSize: font.body,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: space.sm,
    paddingHorizontal: space.lg,
  },
});
