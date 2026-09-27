import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { LitRect, TopLight, usePaintIds } from './paint';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'percentBar' }>;

const ROW = 50;
const AXIS = 30;

/**
 * Tax, tip, markup and discount as bars on one percent scale: the original (100%), the change
 * (p%) where it joins or leaves the original, and the new amount (100% ± p%). With `bars: 2`,
 * percent change: before and after, the change marked on the after bar. Drag the end of the
 * change to set the percent.
 */
export function PercentChange({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const paint = usePaintIds('light');
  const rep = useRep(calc);
  const start = useRef(0);
  const change = spec.change!;
  const three = (change.bars ?? 3) === 3;
  const signed = rep.shown(spec.percent);
  const whole = Math.max(0, rep.shown(spec.whole));
  // Which way the amount moves: given, or from the values (a negative percent, a smaller total).
  const up =
    change.direction !== undefined
      ? change.direction === 'up'
      : rep.known(spec.percent) && signed !== 0
        ? signed > 0
        : rep.known(change.total) && rep.known(spec.whole)
          ? rep.shown(change.total) >= whole
          : signed >= 0;
  const p = Math.abs(signed);
  // Down, the change can't take more than the whole.
  const pct = up ? p : Math.min(100, p);
  const ticks = spec.ticks ?? 10;
  const tick = 100 / ticks;
  const top = useFrozen(up ? Math.max(100, Math.ceil((100 + pct) / tick - 1e-9) * tick) : 100);
  const newPct = up ? 100 + pct : 100 - pct;
  const known = {
    whole: rep.known(spec.whole),
    part: rep.known(spec.part),
    total: rep.known(change.total),
    percent: rep.known(spec.percent),
  };
  const pctText = known.percent ? `${formatNumber(p)}%` : '?%';
  const named = (id: string, percent: string) => `${rep.tag(id)}: ${rep.value(id)} (${percent})`;
  const rows = three ? 3 : 2;

  return (
    <View>
      <Canvas aspect={(w) => (AXIS + rows * ROW + 8) / w}>
        {({ w, h }) => {
          const pad = 16;
          const x = (q: number) => pad + (q / top.value) * (w - 2 * pad);
          const rowTop = (i: number) => AXIS + i * ROW;
          const barY = (i: number) => rowTop(i) + 18;
          const barH = 20;
          const marks = Array.from(
            { length: Math.round(top.value / tick) + 1 },
            (_, i) => i * tick,
          );
          const every = Math.max(1, Math.ceil(34 / Math.max(1, x(tick) - x(0))));
          const labelled = marks.filter(
            (m, i) => m === 100 || (i % every === 0 && Math.abs(m - 100) / tick >= every),
          );
          // The change: joined on past 100% (up), or cut off below it (down).
          const [c0, c1] = up ? [100, 100 + pct] : [100 - pct, 100];
          const last = rows - 1;
          const bar = (
            i: number,
            from: number,
            to: number,
            fill: string,
            fade: boolean,
            key: string,
          ) => (
            <LitRect
              key={key}
              lightId={paint.light}
              x={x(from)}
              y={barY(i)}
              width={Math.max(0, x(to) - x(from))}
              height={barH}
              fill={fill}
              stroke={c.chartInk}
              strokeWidth={chart.strokeLight}
              opacity={fade ? 0.4 : 1}
            />
          );
          const gap = (i: number, key: string) => (
            <Rect
              key={key}
              x={x(c0)}
              y={barY(i)}
              width={Math.max(0, x(c1) - x(c0))}
              height={barH}
              fill="none"
              stroke={c.chartMuted}
              strokeWidth={chart.strokeLight}
              strokeDasharray={chart.dashFine}
            />
          );
          const label = (i: number, text: string, fill: string = c.chartInk) => (
            <ChartText
              key={`label${i}`}
              x={pad}
              y={rowTop(i) + 12}
              fontSize={chart.small}
              fontWeight="700"
              fill={fill}
            >
              {text}
            </ChartText>
          );
          const changeText = `${up ? '+' : '−'}${pctText}`;
          // Percent change: the change carries its sign (a decrease is negative).
          const bracketText = `${changeText} = ${up ? '' : '−'}${rep.value(spec.part).replace('−', '')}`;
          const handleX = x(up ? c1 : c0);
          const handleRow = three ? 1 : last;
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <TopLight id={paint.light} />
                </Defs>
                {/* The percent scale, shared by every bar. */}
                <Line
                  x1={x(0)}
                  y1={AXIS - 6}
                  x2={x(top.value)}
                  y2={AXIS - 6}
                  stroke={c.chartGrid}
                />
                {marks.map((m) => (
                  <Line
                    key={`t${m}`}
                    x1={x(m)}
                    y1={AXIS - 10}
                    x2={x(m)}
                    y2={AXIS - 2}
                    stroke={c.chartMuted}
                    strokeWidth={m === 100 ? chart.stroke : 1}
                  />
                ))}
                {labelled.map((m) => (
                  <ChartText
                    key={`p${m}`}
                    {...fitLabel(x(m), `${formatNumber(m)}%`, chart.tiny, w)}
                    y={AXIS - 14}
                    fontSize={chart.tiny}
                    fontWeight={m === 100 ? '700' : '400'}
                    fill={m === 100 ? c.chartInk : c.chartMuted}
                  >
                    {`${formatNumber(m)}%`}
                  </ChartText>
                ))}
                {/* Guides down through the bars at 100% and where the change ends. */}
                {[100, up ? c1 : c0].map((m, i) => (
                  <Line
                    key={`g${i}`}
                    x1={x(m)}
                    y1={AXIS - 2}
                    x2={x(m)}
                    y2={barY(last) + barH + 4}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                    strokeDasharray={chart.dashFine}
                  />
                ))}
                {/* The original: 100%. */}
                {label(0, named(spec.whole, '100%'))}
                {bar(0, 0, 100, c.chartFill, !known.whole, 'b0')}
                {three ? (
                  <G>
                    {label(1, named(spec.part, changeText), c.chartInk)}
                    {bar(1, c0, c1, c.chartSecond, !known.part || !known.percent, 'b1')}
                  </G>
                ) : null}
                {/* The new amount: the original with the change on or off. */}
                {label(
                  last,
                  named(change.total, known.percent ? `${formatNumber(newPct)}%` : '?%'),
                )}
                {bar(
                  last,
                  0,
                  up ? 100 : c0,
                  c.chartHighlight,
                  !known.total || !known.percent,
                  'n0',
                )}
                {up
                  ? bar(last, c0, c1, c.chartSecond, !known.total || !known.percent, 'n1')
                  : gap(last, 'n1')}
                {/* Before and after: the change bracketed over its part of the after bar. */}
                {!three && pct > 0 ? (
                  <G>
                    <Path
                      d={`M ${x(c0)} ${barY(last) + barH + 4} v 5 H ${x(c1)} v -5`}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                      fill="none"
                    />
                    <ChartText
                      {...fitLabel((x(c0) + x(c1)) / 2, bracketText, chart.small, w)}
                      y={barY(last) + barH + 20}
                      fontSize={chart.small}
                      fontWeight="700"
                    >
                      {bracketText}
                    </ChartText>
                  </G>
                ) : null}
              </Svg>
              <DragHandle
                testID={`drag-${spec.percent}`}
                x={handleX}
                y={barY(handleRow) + barH / 2}
                label={rep.variable(spec.percent).name}
                onStart={() => {
                  start.current = pct;
                  top.freeze();
                }}
                onEnd={top.release}
                onMove={(dx) => {
                  const moved = (dx / (w - 2 * pad)) * top.value;
                  const next = Math.max(0, start.current + (up ? moved : -moved));
                  // A signed percent keeps its sign; a percent that is always positive stays so.
                  const value = signed < 0 ? -next : next;
                  calc.set(
                    {
                      ...rep.pin([spec.whole]),
                      [spec.percent]: rep.snapTo(spec.percent, value * rep.factor(spec.percent)),
                    },
                    rep.slide(spec.percent),
                  );
                }}
              />
            </>
          );
        }}
      </Canvas>
      <Caption>{caption()}</Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.percent, steps: [1, 10], pin: [spec.whole] },
          { var: spec.whole, steps: [1, 10], pin: [spec.percent] },
        ]}
      />
    </View>
  );

  function caption() {
    // Amounts without their sign: the words and the + or − say which way.
    const [w0, part, total] = [spec.whole, spec.part, change.total].map((id) =>
      rep.value(id).replace('−', ''),
    );
    if (!known.whole || (!known.part && !known.total && !known.percent))
      return 'The original is 100%. Type the numbers you know.';
    const sign = up ? '+' : '−';
    if (three) return `${pctText} of ${w0} = ${part} · ${w0} ${sign} ${part} = ${total}`;
    return `${total} − ${w0} = ${up ? '' : '−'}${part} · ${part} ÷ ${w0} = ${pctText} · ${up ? 'An increase' : 'A decrease'} of ${pctText}`;
  }
}
