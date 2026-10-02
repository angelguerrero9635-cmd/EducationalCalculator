import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useRep, pinHeld } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'doubleNumberLine' }>;

const textW = (t: string, size: number) => t.length * size * 0.6;

/**
 * Two heavy number lines one above the other, lined up: each tick on the top line (one bigger
 * unit) sits over its worth on the bottom line (`per` smaller units), and a faint dashed guide
 * joins each pair. The current pair is a highlighted rule with both numbers bold in pills.
 * Numbers thin to every 2nd or 5th tick when they would touch. Drag the knob on the rule.
 */
export function DoubleNumberLine({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const top = Math.max(0, rep.shown(spec.top));
  // Bottom units for each top unit, in the units shown: read from the two readings when both
  // are known, so kilometers over hours still line up when the speed is shown in mph.
  const per =
    rep.known(spec.top) && rep.known(spec.bottom) && top > 0
      ? rep.shown(spec.bottom) / top
      : rep.known(spec.per)
        ? rep.shown(spec.per)
        : 0;
  const known = rep.known(spec.top) && rep.known(spec.per);
  // Marks every 1, 2, 5, 10, 20, 50, … top units, whichever keeps the line to about a dozen
  // marks (10,000 years is not 10,000 ticks): the spec's count, or enough for the value.
  const tickStep =
    [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000].find(
      (s) => Math.ceil(top / s) <= Math.max(spec.ticks, 12),
    ) ?? 100000;
  const N = Math.max(spec.ticks, Math.ceil(top / tickStep));
  const bottomAt = (x: number) => Number((x * per).toFixed(4));
  const current = rep.known(spec.bottom) ? rep.shown(spec.bottom) : bottomAt(top);
  // Dollars to the cent, or whole dollars when every number shown is whole.
  const wholeDollars = [
    ...Array.from({ length: N + 1 }, (_, i) => bottomAt(i * tickStep)),
    current,
  ].every((x) => Math.abs(x - Math.round(x)) < 1e-9);
  const money = (x: number) => (wholeDollars ? `$${formatNumber(x)}` : `$${x.toFixed(2)}`);
  // Fractions where the inputs are fractions (2/3 cup, not 0.6667); the tick values are
  // rounded to 4 places, so snap to the nearest fraction first.
  const asTyped = (x: number, id: string) => {
    const most = rep.variable(id).fraction;
    const d = most
      ? [...Array(most - 1).keys()]
          .map((i) => i + 2)
          .find((k) => Math.abs(x * k - Math.round(x * k)) < 1e-3)
      : undefined;
    return d ? formatNumber(Math.round(x * d) / d, { fraction: most }) : formatNumber(x);
  };
  const bottomText = (x: number) =>
    !per && !rep.known(spec.bottom)
      ? '?'
      : spec.prefix === '$'
        ? money(x)
        : asTyped(Number(x.toFixed(4)), spec.bottom);
  const title = (id: string) => {
    const unit = rep.unit(id);
    return `${rep.variable(id).name}${unit && unit !== '$' ? ` (${unit})` : ''}`;
  };

  // Rows, top to bottom: title, numbers, line; the gap with the rule and knob; line, numbers,
  // title.
  const yTop = 50;
  const yBottom = yTop + 78;
  const height = yBottom + 58;

  return (
    <View>
      <Canvas aspect={(w) => height / w}>
        {({ w, h }) => {
          const pad = 28;
          // Width of one mark's step; `px` takes a value in top units.
          const unit = (w - 2 * pad) / N;
          const px = (x: number) => pad + (x / tickStep) * unit;
          const topLabels = Array.from({ length: N + 1 }, (_, i) => formatNumber(i * tickStep));
          const bottomLabels = Array.from({ length: N + 1 }, (_, i) =>
            bottomText(bottomAt(i * tickStep)),
          );
          const widest = Math.max(
            ...[...topLabels, ...bottomLabels].map((t) => textW(t, chart.value)),
          );
          // Every 1st, 2nd or 5th tick numbered, whichever leaves room; the last always.
          const labelEvery = [1, 2, 5, 10].find((k) => k * unit >= widest + 8) ?? 10;
          const topPill = formatNumber(top);
          const bottomPill = bottomText(current);
          const pillW = (t: string) => textW(t, chart.emphasis) + 14;
          const pillX = (t: string) =>
            Math.min(w - pillW(t) / 2 - 2, Math.max(pillW(t) / 2 + 2, px(top)));
          // A tick number hidden under the current pair's pill, or next to it, is left out.
          const underPill = (x: number, t: string, pill: string) =>
            known && Math.abs(x - pillX(pill)) < (textW(t, chart.value) + pillW(pill)) / 2 + 4;
          const shownLabel = (i: number) =>
            i % labelEvery === 0 ||
            (i === N && px(N * tickStep) - px((N - (N % labelEvery)) * tickStep) >= widest + 8);
          const line = (y: number, key: string) => (
            <Line
              key={key}
              x1={pad - 10}
              y1={y}
              x2={w - pad + 10}
              y2={y}
              stroke={c.chartInk}
              strokeWidth={chart.strokeHeavy}
              strokeLinecap="round"
            />
          );
          const pill = (x: number, y: number, t: string, key: string) => (
            <G key={key}>
              <Rect
                x={x - pillW(t) / 2}
                y={y - 11}
                width={pillW(t)}
                height={22}
                rx={11}
                fill={c.chartHighlight}
              />
              <ChartText
                x={x}
                y={y + 5}
                fontSize={chart.emphasis}
                fontWeight="700"
                fill={c.onChartHighlight}
                textAnchor="middle"
              >
                {t}
              </ChartText>
            </G>
          );
          return (
            <>
              <Svg width={w} height={h}>
                <ChartText
                  x={pad - 10}
                  y={14}
                  fontSize={chart.value}
                  fontWeight="600"
                  fill={c.chartMuted}
                >
                  {title(spec.top)}
                </ChartText>
                <ChartText
                  x={pad - 10}
                  y={h - 6}
                  fontSize={chart.value}
                  fontWeight="600"
                  fill={c.chartMuted}
                >
                  {title(spec.bottom)}
                </ChartText>
                {/* Faint guides joining each pair of ticks. */}
                {Array.from({ length: N + 1 }, (_, i) => (
                  <Line
                    key={`g${i}`}
                    x1={px(i * tickStep)}
                    y1={yTop + 8}
                    x2={px(i * tickStep)}
                    y2={yBottom - 8}
                    stroke={c.chartGrid}
                    strokeWidth={chart.strokeLight}
                    strokeDasharray={chart.dashFine}
                  />
                ))}
                {line(yTop, 'lt')}
                {line(yBottom, 'lb')}
                {Array.from({ length: N + 1 }, (_, i) => {
                  const x = px(i * tickStep);
                  return (
                    <G key={`t${i}`}>
                      <Line
                        x1={x}
                        y1={yTop - 7}
                        x2={x}
                        y2={yTop + 7}
                        stroke={c.chartInk}
                        strokeWidth={chart.stroke}
                      />
                      <Line
                        x1={x}
                        y1={yBottom - 7}
                        x2={x}
                        y2={yBottom + 7}
                        stroke={c.chartInk}
                        strokeWidth={chart.stroke}
                      />
                      {shownLabel(i) && !underPill(x, topLabels[i]!, topPill) ? (
                        <ChartText x={x} y={yTop - 14} fontSize={chart.value} textAnchor="middle">
                          {topLabels[i]}
                        </ChartText>
                      ) : null}
                      {shownLabel(i) && !underPill(x, bottomLabels[i]!, bottomPill) ? (
                        <ChartText
                          x={x}
                          y={yBottom + 25}
                          fontSize={chart.value}
                          textAnchor="middle"
                        >
                          {bottomLabels[i]}
                        </ChartText>
                      ) : null}
                    </G>
                  );
                })}
                {known ? (
                  <>
                    <Line
                      x1={px(top)}
                      y1={yTop - 7}
                      x2={px(top)}
                      y2={yBottom + 7}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.strokeHeavy}
                      strokeLinecap="round"
                    />
                    {pill(pillX(topPill), yTop - 19, topPill, 'pt')}
                    {pill(pillX(bottomPill), yBottom + 20, bottomPill, 'pb')}
                  </>
                ) : null}
              </Svg>
              {known ? (
                <DragHandle
                  testID={`drag-${spec.top}`}
                  x={px(top)}
                  y={(yTop + yBottom) / 2}
                  label={rep.variable(spec.top).name}
                  onStart={() => (start.current = top)}
                  onMove={(dx) => {
                    // The drag lands on a tenth of a mark (2.5, 3, 3.1: never 3.003); the box
                    // takes anything typed.
                    const top = rep.snapTo(
                      spec.top,
                      Math.max(
                        0,
                        Math.round((start.current + (dx / unit) * tickStep) / (tickStep / 10)) *
                          (tickStep / 10),
                      ) * rep.factor(spec.top),
                    );
                    // A typed rate holds still; one worked out from typed totals gives way.
                    calc.set(
                      { ...pinHeld(calc, rep, [spec.per], { [spec.top]: top }), [spec.top]: top },
                      rep.slide(spec.top),
                    );
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? `${rep.named(spec.top)} on the top line sits over ${rep.value(spec.bottom)} on the bottom line: each 1 above is ${asTyped(per, spec.per)} below.`
          : 'Type the bigger units and how many smaller units make one.'}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.top, steps: [1], pin: [spec.per] },
          { var: spec.per, steps: [1], pin: [spec.top] },
        ]}
      />
    </View>
  );
}
