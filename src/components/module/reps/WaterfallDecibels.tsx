/**
 * `waterfall` option `decibels` (HC91; EC-P12): a budget in dB, drawn as a sideways waterfall
 * on a level axis in dB or dBm. Each row is one item (its symbol and signed value over its
 * name, then its bar floating from the running level to the next); the last row is the end
 * level. A level item (a transmit power, kTB) rises from the axis's foot. A reference level
 * (`floor`) is a dashed line down the rows, the `margin` to it bracketed under the end bar.
 * Flat: a chart. A "?" draws nothing for its value (and nothing that rests on it).
 */
import { useRef } from 'react';
import Svg, { G, Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import type { WaterfallDecibels as Db } from '@/data/modules/typesHe3k';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { db1, dbLevels, niceStep } from './he3kMath';

type Spec = Extract<Representation, { kind: 'waterfall' }>;

const LABEL = chart.label;
const LINE = 15;
const HEAD_H = 22;
const AXIS_H = 34;
const KEY_H = 24;
const BRACKET_H = 34;

/** Splits a name into lines at most `chars` long. */
function wrap(text: string, chars: number) {
  const lines: string[] = [];
  for (const word of text.split(' ')) {
    const last = lines[lines.length - 1];
    if (last !== undefined && `${last} ${word}`.length <= chars)
      lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}

export function WaterfallDecibels({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const opts: Db = spec.decibels && spec.decibels !== true ? spec.decibels : {};
  const editable = spec.items.filter((i) => i.editable).map((i) => i.var);

  // The running level, item by item, until a "?" (nothing past it rests on a known level).
  const known = spec.items.map((i) => rep.known(i.var));
  const firstUnknown = known.indexOf(false);
  const placed = firstUnknown < 0 ? spec.items.length : firstUnknown;
  const levels = dbLevels(spec.items.map((i) => ({ sign: i.sign, value: rep.shown(i.var) })));
  const totalKnown = rep.known(spec.total);
  const total = rep.shown(spec.total);
  const floorKnown = !!opts.floor && rep.known(opts.floor);
  const floor = opts.floor ? rep.shown(opts.floor) : 0;

  // The axis: every level drawn, with room; from 0 dB for a cascade of gains.
  const drawn = [
    ...levels.slice(0, placed).flatMap((l, i) => (opts.level && i === 0 ? [l.to] : [l.from, l.to])),
    ...(totalKnown ? [total] : []),
    ...(floorKnown ? [floor] : []),
    ...(opts.level ? [] : [0]),
  ];
  const lo0 = drawn.length ? Math.min(...drawn) : 0;
  const hi0 = drawn.length ? Math.max(...drawn) : 10;
  const step = niceStep(Math.max(hi0 - lo0, 6), 4);
  const live = {
    min: Math.floor((lo0 - (opts.level ? step * 0.6 : 0)) / step) * step,
    max: Math.ceil((hi0 + step * 0.15) / step) * step,
    step,
  };
  const range = useFrozen(live);

  const unitOf = (id: string) => rep.unit(id) ?? 'dB';
  const rows = [
    ...spec.items.map((item, i) => ({
      id: item.var,
      value: !known[i]
        ? '?'
        : opts.level && i === 0
          ? `${db1(rep.shown(item.var))} ${unitOf(item.var)}`
          : `${db1(item.sign * rep.shown(item.var), true)} ${unitOf(item.var)}`,
    })),
    {
      id: spec.total,
      value: totalKnown ? `${db1(total)} ${unitOf(spec.total)}` : '?',
    },
  ];
  const labelW = (w: number) => Math.min(150, Math.round(w * 0.4));
  const nameLines = (w: number) =>
    rows.map((r) => wrap(rep.variable(r.id).name, Math.floor((labelW(w) - 4) / (LABEL * 0.56))));
  const rowH = (w: number) => nameLines(w).map((l) => 18 + l.length * LINE + 4);
  const bracket = !!opts.margin;
  const height = (w: number) =>
    HEAD_H + rowH(w).reduce((a, b) => a + b, 0) + (bracket ? BRACKET_H : 6) + AXIS_H + KEY_H;

  return (
    <>
      <Canvas aspect={(w) => height(w) / w}>
        {({ w, h }) => {
          const { min, max } = range.value;
          const x0 = labelW(w) + 10;
          const x1 = w - 12;
          const scale = (x1 - x0) / (max - min);
          const sx = (v: number) => x0 + (Math.min(max, Math.max(min, v)) - min) * scale;
          const heights = rowH(w);
          const tops = heights.map(
            (_, i) => HEAD_H + heights.slice(0, i).reduce((a, b) => a + b, 0),
          );
          const rowsBottom = tops[tops.length - 1]! + heights[heights.length - 1]!;
          const barY = (i: number) => tops[i]! + 6;
          const barH = (i: number) => heights[i]! - 12;
          const axisY = rowsBottom + (bracket ? BRACKET_H : 6);
          const lines = nameLines(w);
          const ticks: number[] = [];
          for (let t = min; t <= max + 1e-9; t += range.value.step)
            ticks.push(Math.round(t * 1e6) / 1e6);
          const levelColor = c.chartHighlight;
          const bar = (key: string, i: number, from: number, to: number, fill: string) => (
            <Rect
              key={key}
              rx={2}
              x={Math.min(sx(from), sx(to))}
              y={barY(i)}
              width={Math.max(1.5, Math.abs(sx(to) - sx(from)))}
              height={barH(i)}
              fill={fill}
              fillOpacity={0.85}
              stroke={fill}
              strokeWidth={1}
            />
          );
          const key = [
            { fill: c.blockGreen, text: 'Gain' },
            { fill: c.blockRed, text: 'Loss' },
            { fill: levelColor, text: 'Level' },
          ];
          const floorSym = opts.floor ? rep.variable(opts.floor).symbol : '';
          const keyW = [
            ...key.map((k) => 18 + k.text.length * LABEL * 0.58),
            ...(opts.floor ? [26 + floorSym.length * LABEL * 0.5] : []),
          ];
          const keyX0 = (w - keyW.reduce((a, b) => a + b + 14, -14)) / 2;
          const keyX = (i: number) => keyX0 + keyW.slice(0, i).reduce((a, b) => a + b + 14, 0);
          const keyY = h - KEY_H + 14;
          const endI = rows.length - 1;
          const unit = unitOf(spec.total);
          return (
            <>
              <Svg width={w} height={h}>
                {/* Grid lines at the ticks, then the axis under the rows. */}
                {ticks.map((t) => (
                  <Line
                    key={`g${t}`}
                    x1={sx(t)}
                    x2={sx(t)}
                    y1={HEAD_H}
                    y2={bracket ? rowsBottom : axisY}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                  />
                ))}
                <Line x1={x0} x2={x1} y1={axisY} y2={axisY} stroke={c.chartInk} strokeWidth={1.5} />
                {ticks.map((t, k) => (
                  <ChartText
                    key={`t${t}`}
                    {...fitLabel(sx(t), db1(t).replace('.0', ''), LABEL, w)}
                    y={axisY + 15}
                    fontSize={LABEL}
                    fill={c.chartMuted}
                  >
                    {k === ticks.length - 1 ? '' : db1(t).replace('.0', '')}
                  </ChartText>
                ))}
                <ChartText x={x1} y={axisY + 15} textAnchor="end" fontSize={LABEL} fontWeight="700">
                  {unit}
                </ChartText>
                {/* Each row: the symbol and its signed value, the name under them. */}
                {rows.map((r, i) => (
                  <G key={`r${i}`}>
                    <ChartText x={4} y={tops[i]! + 15} fontSize={chart.value} fontWeight="700">
                      {rep.variable(r.id).symbol}
                    </ChartText>
                    <ChartText
                      x={labelW(w)}
                      y={tops[i]! + 15}
                      fontSize={chart.value}
                      fontWeight="700"
                      textAnchor="end"
                    >
                      {r.value}
                    </ChartText>
                    {lines[i]!.map((line, k) => (
                      <ChartText
                        key={k}
                        x={4}
                        y={tops[i]! + 15 + (k + 1) * LINE}
                        fontSize={LABEL}
                        fill={c.chartMuted}
                      >
                        {line}
                      </ChartText>
                    ))}
                    {i < endI ? (
                      <Line
                        x1={0}
                        x2={w}
                        y1={tops[i]! + heights[i]!}
                        y2={tops[i]! + heights[i]!}
                        stroke={c.chartGrid}
                        strokeWidth={0.75}
                      />
                    ) : null}
                  </G>
                ))}
                {/* The bars: each from the running level to the next, joined by dashed steps. */}
                {levels.slice(0, placed).map((l, i) => {
                  const isLevel = !!opts.level && i === 0;
                  const from = isLevel ? min : l.from;
                  const fill = isLevel ? levelColor : l.to >= l.from ? c.blockGreen : c.blockRed;
                  return (
                    <G key={`b${i}`}>
                      {bar(`bar${i}`, i, from, l.to, fill)}
                      {i + 1 < placed || (i + 1 === spec.items.length && totalKnown) ? (
                        <Line
                          x1={sx(l.to)}
                          x2={sx(l.to)}
                          y1={barY(i) + barH(i)}
                          y2={barY(i + 1)}
                          stroke={c.chartMuted}
                          strokeWidth={1}
                          strokeDasharray={chart.dashFine}
                        />
                      ) : null}
                    </G>
                  );
                })}
                {totalKnown ? bar('total', endI, opts.level ? min : 0, total, levelColor) : null}
                {/* The reference level down the rows, and the margin to it under the end bar. */}
                {floorKnown ? (
                  <Line
                    x1={sx(floor)}
                    x2={sx(floor)}
                    y1={HEAD_H - 4}
                    y2={bracket ? rowsBottom + 10 : axisY}
                    stroke={c.chartInk}
                    strokeWidth={1.5}
                    strokeDasharray={chart.dash}
                  />
                ) : null}
                {floorKnown ? (
                  <ChartText
                    {...fitLabel(sx(floor), floorSym, chart.value, w)}
                    y={HEAD_H - 8}
                    fontSize={chart.value}
                    fontWeight="700"
                  >
                    {floorSym}
                  </ChartText>
                ) : null}
                {bracket && floorKnown && totalKnown
                  ? (() => {
                      const y = rowsBottom + 10;
                      const a = sx(total);
                      const b = sx(floor);
                      const text = `${rep.variable(opts.margin!).symbol} = ${
                        rep.known(opts.margin!) ? db1(rep.shown(opts.margin!)) : '?'
                      } ${unitOf(opts.margin!)}`;
                      return (
                        <G>
                          <Line
                            x1={a}
                            x2={a}
                            y1={rowsBottom - 4}
                            y2={y + 4}
                            stroke={c.chartInk}
                            strokeWidth={1}
                          />
                          <Line x1={a} x2={b} y1={y} y2={y} stroke={c.chartInk} strokeWidth={1.5} />
                          <Line
                            x1={b}
                            x2={b}
                            y1={y - 5}
                            y2={y + 5}
                            stroke={c.chartInk}
                            strokeWidth={1.5}
                          />
                          <ChartText
                            {...fitLabel((a + b) / 2, text, chart.value, w)}
                            y={y + 18}
                            fontSize={chart.value}
                            fontWeight="700"
                          >
                            {text}
                          </ChartText>
                        </G>
                      );
                    })()
                  : null}
                {/* What the colours and the dashed line mean. */}
                {key.map((k, i) => (
                  <G key={k.text}>
                    <Rect x={keyX(i)} y={keyY - 10} width={12} height={12} rx={2} fill={k.fill} />
                    <ChartText x={keyX(i) + 17} y={keyY} fontSize={LABEL} fill={c.chartMuted}>
                      {k.text}
                    </ChartText>
                  </G>
                ))}
                {opts.floor ? (
                  <G>
                    <Line
                      x1={keyX(3)}
                      x2={keyX(3) + 20}
                      y1={keyY - 4}
                      y2={keyY - 4}
                      stroke={c.chartInk}
                      strokeWidth={1.5}
                      strokeDasharray={chart.dash}
                    />
                    <ChartText x={keyX(3) + 25} y={keyY} fontSize={LABEL} fill={c.chartMuted}>
                      {floorSym}
                    </ChartText>
                  </G>
                ) : null}
              </Svg>
              {levels.slice(0, placed).map((l, i) =>
                spec.items[i]!.editable ? (
                  <DragHandle
                    key={spec.items[i]!.var}
                    testID={`drag-${spec.items[i]!.var}`}
                    x={sx(l.to)}
                    y={barY(i) + barH(i) / 2}
                    label={rep.variable(spec.items[i]!.var).name}
                    onStart={() => {
                      start.current = rep.shown(spec.items[i]!.var);
                      range.freeze();
                    }}
                    onEnd={range.release}
                    onMove={(dx) => {
                      const id = spec.items[i]!.var;
                      calc.set(
                        {
                          ...rep.pin(editable.filter((e) => e !== id)),
                          [id]: rep.snapTo(
                            id,
                            (start.current + (spec.items[i]!.sign * dx) / scale) * rep.factor(id),
                          ),
                        },
                        rep.slide(id),
                      );
                    }}
                  />
                ) : null,
              )}
            </>
          );
        }}
      </Canvas>
      <Caption>{captionOf()}</Caption>
    </>
  );

  /** The sum with every number in it, then the reference level and the margin. */
  function captionOf() {
    const parts = spec.items.map((item, i) => {
      if (!known[i]) return '?';
      const v = item.sign * rep.shown(item.var);
      if (i === 0) return db1(v);
      return v < 0 ? `− ${db1(-v)}` : `+ ${db1(v)}`;
    });
    const sum = `${parts.join(' ')} = ${totalKnown ? db1(total) : '?'} ${unitOf(spec.total)}`;
    const dbText = (id: string) =>
      `${rep.variable(id).name}: ${rep.known(id) ? `${db1(rep.shown(id))} ${unitOf(id)}` : '?'}`;
    const more = [
      ...(opts.floor ? [dbText(opts.floor)] : []),
      ...(opts.margin ? [dbText(opts.margin)] : []),
      ...(spec.caption ?? []).map((id) => `${rep.variable(id).name}: ${rep.value(id)}`),
    ];
    return [`${rep.variable(spec.total).name}: ${sum}`, ...more].join(' · ');
  }
}
