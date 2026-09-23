import { useRef } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, niceCeil, useFrozen, useRep } from './common';

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
    return [...acc, { ...item, from, to: from + item.sign * rep.val(item.var) }];
  }, []);
  const total = rep.val(spec.total);
  const levels = [0, total, ...steps.flatMap((s) => [s.from, s.to])];
  const lo = Math.min(...levels);
  const hi = Math.max(...levels);
  const range = useFrozen({ min: lo < 0 ? -niceCeil(-lo) : 0, max: hi > 0 ? niceCeil(hi) : 1 });

  return (
    <>
      <Canvas aspect={0.65}>
        {({ w, h }) => {
          const top = 24;
          const bottom = 28;
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
                      ? `${s.sign > 0 ? '+' : '−'}${formatNumber(rep.val(s.var))}`
                      : '?'}
                  </ChartText>,
                  <ChartText
                    key={`s${i}`}
                    x={cx(i)}
                    y={h - bottom + 18}
                    fontSize={chart.small}
                    fill={c.chartMuted}
                    textAnchor="middle"
                  >
                    {rep.variable(s.var).symbol}
                  </ChartText>,
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
                <ChartText
                  x={cx(steps.length)}
                  y={h - bottom + 18}
                  fontSize={chart.small}
                  fill={c.chartMuted}
                  textAnchor="middle"
                >
                  {rep.variable(spec.total).symbol}
                </ChartText>
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
                      start.current = rep.val(s.var);
                      range.freeze();
                    }}
                    onEnd={range.release}
                    onMove={(_, dy) =>
                      calc.set({
                        ...rep.pin(editable.filter((id) => id !== s.var)),
                        [s.var]: rep.snapTo(s.var, start.current - (s.sign * dy) / scale),
                      })
                    }
                  />
                ) : null,
              )}
            </>
          );
        }}
      </Canvas>
      {/* Symbol key, then the subtotals the lesson is about. */}
      <Text style={[styles.caption, { color: c.textMuted }]}>
        {[...spec.items.map((i) => i.var), spec.total]
          .map((id) => `${rep.variable(id).symbol} ${rep.variable(id).name}`)
          .join(' · ')}
      </Text>
      {spec.caption ? (
        <Text style={[styles.caption, { color: c.text }]}>
          {spec.caption.map((id) => `${rep.variable(id).name}: ${rep.label(id)}`).join('\n')}
        </Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  caption: {
    fontSize: font.caption + 1,
    textAlign: 'center',
    marginTop: space.sm,
    lineHeight: 20,
    paddingHorizontal: space.lg,
  },
});
