import { useRef } from 'react';
import Svg, { G, Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, useFrozen, useRep, Caption } from './common';

type Spec = Extract<Representation, { kind: 'waterfall' }>;
type Step = Spec['items'][number] & { from: number; to: number };

/** Label sizes and heights: the value row over the bars, a name line, and the key. */
const LABEL = chart.label;
const LINE = 15;
const VALUES_H = 26;
const KEY_H = 22;

/** Splits a name into lines about `width` px wide (at most two; the rest joins the second). */
function wrap(text: string, width: number) {
  const per = Math.max(5, Math.floor(width / (LABEL * 0.58)));
  const lines: string[] = [];
  for (const word of text.split(' ')) {
    const last = lines[lines.length - 1];
    if (last !== undefined && `${last} ${word}`.length <= per)
      lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines.length > 2 ? [lines[0]!, lines.slice(1).join(' ')] : lines;
}

/**
 * Waterfall, flat: each item moves a running total up (green, +) or down (red, −) from where the
 * last one ended, joined by dashed connectors; the final bar is the total. Each change's value
 * is in a row over its bar, clear of the handles; the names (and symbols) are under the bars and
 * a key says what the colors mean. Drag the moving end of an editable item.
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
  // There is no scale to read, so the bars fill the height (a little room over the tallest).
  const range = useFrozen({ min: lo < 0 ? lo * 1.06 : 0, max: hi > 0 ? hi * 1.06 : 1 });
  const ids = [...spec.items.map((i) => i.var), spec.total];
  const names = (w: number) => {
    const slot = (w - 12) / ids.length;
    return ids.map((id) => {
      const v = rep.variable(id);
      const lines = wrap(v.name, slot - 4);
      return rep.words ? lines : [v.symbol, ...lines];
    });
  };
  const namesH = (w: number) => Math.max(...names(w).map((l) => l.length)) * LINE + 10;
  const plotH = (w: number) => Math.min(240, w * 0.5);

  return (
    <>
      <Canvas aspect={(w) => (VALUES_H + 14 + plotH(w) + namesH(w) + KEY_H) / w}>
        {({ w, h }) => {
          const top = VALUES_H + 14;
          const bottom = namesH(w) + KEY_H;
          const { min, max } = range.value;
          const scale = (h - top - bottom) / (max - min);
          // Kept inside the plot while a drag runs past the frozen range.
          const sy = (v: number) => top + (max - Math.min(max, Math.max(min, v))) * scale;
          const slot = (w - 12) / ids.length;
          const barW = Math.min(64, slot * 0.64);
          const cx = (i: number) => 6 + slot * (i + 0.5);
          const labels = names(w);
          const bar = (
            key: string,
            i: number,
            from: number,
            to: number,
            fill: string,
            faded: boolean,
          ) => (
            <Rect
              key={key}
              rx={2}
              x={cx(i) - barW / 2}
              y={Math.min(sy(from), sy(to))}
              width={barW}
              height={Math.max(1, Math.abs(sy(to) - sy(from)))}
              fill={fill}
              fillOpacity={0.85}
              stroke={fill}
              strokeWidth={1}
              opacity={faded ? 0.35 : 1}
            />
          );
          // No sign on 0 ("0", not "−0"); a true minus sign.
          const change = (s: Step) =>
            rep.known(s.var)
              ? `${rep.shown(s.var) === 0 ? '' : s.sign > 0 ? '+' : '−'}${formatNumber(rep.shown(s.var))}`
              : '?';
          const keyY = h - KEY_H + 12;
          const key = [
            { fill: c.blockGreen, text: 'Increase' },
            { fill: c.blockRed, text: 'Decrease' },
            { fill: c.chartHighlight, text: 'Total' },
          ];
          const keyW = key.map((k) => 18 + k.text.length * LABEL * 0.6);
          const keyX0 = (w - keyW.reduce((a, b) => a + b + 12, -12)) / 2;
          return (
            <>
              <Svg width={w} height={h}>
                {/* Each change's value, in a row over its bar. */}
                {steps.map((s, i) => (
                  <ChartText
                    key={`v${i}`}
                    x={cx(i)}
                    y={VALUES_H - 6}
                    fontSize={chart.value}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {change(s)}
                  </ChartText>
                ))}
                <ChartText
                  x={cx(steps.length)}
                  y={VALUES_H - 6}
                  fontSize={chart.value}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {rep.known(spec.total) ? formatNumber(total) : '?'}
                </ChartText>
                <Line
                  x1={6}
                  y1={VALUES_H + 2}
                  x2={w - 6}
                  y2={VALUES_H + 2}
                  stroke={c.chartGrid}
                  strokeWidth={1}
                />
                {steps.map((s, i) => [
                  // Connector from this bar's end to the next bar (the last one to the total).
                  <Line
                    key={`k${i}`}
                    x1={cx(i) + barW / 2}
                    y1={sy(s.to)}
                    x2={cx(i + 1) - barW / 2}
                    y2={sy(s.to)}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                    strokeDasharray={chart.dashFine}
                  />,
                  bar(
                    `b${i}`,
                    i,
                    s.from,
                    s.to,
                    s.sign > 0 ? c.blockGreen : c.blockRed,
                    !rep.known(s.var),
                  ),
                ])}
                {bar('total', steps.length, 0, total, c.chartHighlight, !rep.known(spec.total))}
                <Line
                  x1={4}
                  y1={sy(0)}
                  x2={w - 4}
                  y2={sy(0)}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                {/* Names under the bars: the symbol first on later grades. */}
                {labels.map((lines, i) =>
                  lines.map((line, k) => (
                    <ChartText
                      key={`n${i}-${k}`}
                      x={cx(i)}
                      y={h - bottom + 16 + k * LINE}
                      fontSize={LABEL}
                      fontWeight={k === 0 ? '700' : '400'}
                      textAnchor="middle"
                    >
                      {line}
                    </ChartText>
                  )),
                )}
                {/* What the colors mean. */}
                {key.map((k, i) => {
                  const x = keyX0 + keyW.slice(0, i).reduce((a, b) => a + b + 12, 0);
                  return (
                    <G key={k.text}>
                      <Rect x={x} y={keyY - 10} width={12} height={12} rx={2} fill={k.fill} />
                      <ChartText x={x + 17} y={keyY} fontSize={LABEL} fill={c.chartMuted}>
                        {k.text}
                      </ChartText>
                    </G>
                  );
                })}
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
                      calc.set(
                        {
                          ...rep.pin(editable.filter((id) => id !== s.var)),
                          [s.var]: rep.snapTo(
                            s.var,
                            (start.current - (s.sign * dy) / scale) * rep.factor(s.var),
                          ),
                        },
                        rep.slide(s.var),
                      )
                    }
                  />
                ) : null,
              )}
            </>
          );
        }}
      </Canvas>
      {spec.caption ? (
        <Caption>
          {spec.caption.map((id) => `${rep.variable(id).name}: ${rep.label(id)}`).join('\n')}
        </Caption>
      ) : null}
    </>
  );
}
