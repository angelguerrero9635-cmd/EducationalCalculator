import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { HistogramSpec } from '@/data/modules/typesHsb';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { formulaOnly } from './hskKit';
import { histDataIds, histModel } from './histModel';
import { probDecimals, rangeOf } from './histRange';
import { prob4 } from './NormalCurve';
import { niceStep } from './Plot';

const num = (x: number) => formatNumber(Number(x.toFixed(4)));

/**
 * A histogram of data or counts in bins, with the mean and median marked and the shape named,
 * or a probability distribution (typed, or binomial from n and p) with E(X) marked. Flat and
 * exact: bar heights are the counts (or relative frequencies, or probabilities) on a nice axis.
 */
export function Histogram({ spec, calc }: { spec: HistogramSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const get = (v: number | string | undefined) =>
    v === undefined ? undefined : typeof v === 'number' ? v : rep.shown(v);
  const known = (v: number | string | undefined | true) => typeof v !== 'string' || rep.known(v);
  const model = histModel(spec, get);
  const prob = model.mode === 'probability';
  const rel = !!spec.relative && !prob && (model.n ?? 0) > 0;
  const height = (h: number) => (rel ? h / model.n! : h);
  const allKnown = [
    spec.count,
    ...histDataIds(spec, get),
    ...(spec.counts ?? []),
    spec.width,
    spec.start,
    spec.end,
    ...(spec.probability?.probs ?? []),
    ...(spec.probability?.values ?? []),
    spec.binomial?.n,
    spec.binomial?.p,
  ].every(known);
  // Binomial bars wait for n and p: a "?" box draws no bars from the example's numbers.
  const waiting = !!spec.binomial && !allKnown;
  const frozen = useFrozen({ top: Math.max(0, ...model.bars.map((b) => height(b.h))) });
  // H99: a range of bars lit, and their sum in the caption.
  const range = waiting ? undefined : rangeOf(spec, model, get, prob);
  const litIndex = (() => {
    const l = get(spec.lit);
    if (l === undefined) return -1;
    return prob ? model.bars.findIndex((b) => Math.abs(b.lo - l) < 1e-9) : Math.round(l) - 1;
  })();

  // ── Caption ──
  const lines: string[] = [];
  const meanSym = prob ? 'E(X)' : 'x̄';
  if (model.problem) lines.push(`${model.problem} The bars can’t be drawn.`);
  else if (waiting) lines.push('Type n and p to draw the bars.');
  else if (prob) {
    if (spec.binomial) {
      const n = get(spec.binomial.n)!;
      const p = get(spec.binomial.p)!;
      lines.push(
        `Binomial bars: n = ${num(n)} trials, each a success with chance p = ${num(p)}.`,
        `E(X) = n × p = ${num(n)} × ${num(p)} = ${num(model.mean!)}`,
        `σ = √(n × p × (1 − p)) = ${num(model.sd!)}`,
      );
    } else {
      lines.push(`The bars add to ${num(model.total)}.`);
      const terms = model.bars.map((b) => `${num(b.lo)} × ${num(b.h)}`);
      lines.push(
        terms.length <= 6
          ? `E(X) = ${terms.join(' + ')} = ${num(model.mean!)}`
          : `E(X) = the sum of k × P(X = k) = ${num(model.mean!)}`,
      );
    }
    const bar = model.bars[litIndex];
    if (bar) lines.push(`The chance of exactly ${num(bar.lo)}: ${prob4(bar.h)}.`);
  } else {
    const k = model.bars.length;
    const first = model.bars[0];
    // While a data value or bin setting is "?", the bins read "?" too, not the example's.
    const nText = known(spec.count) && (spec.counts || allKnown) ? num(model.n!) : '?';
    const binsKnown = allKnown || (!!spec.counts && [spec.width, spec.start].every(known));
    if (first)
      lines.push(
        binsKnown
          ? `${spec.counts ? `n = ${nText}` : `${nText} values`} in ${k} bins of width ${num(first.hi - first.lo)}, from ${num(first.lo)} to ${num(model.bars[k - 1]!.hi)}.`
          : `${spec.counts ? `n = ${nText}` : `${nText} values`} in bins of width ${known(spec.width) ? num(first.hi - first.lo) : '?'}, from ${known(spec.start) ? num(first.lo) : '?'}.`,
      );
    if (model.outside)
      lines.push(
        `${model.outside} ${model.outside === 1 ? 'value is' : 'values are'} outside the bins.`,
      );
    if (rel) lines.push('Heights are relative frequencies: count ÷ n.');
    const bar = model.bars[litIndex];
    if (bar)
      lines.push(
        `Bin ${num(bar.lo)} to ${num(bar.hi)}: ${num(bar.h)} of ${num(model.n!)} = ${num(bar.h / model.n!)}.`,
      );
  }
  const meanValue =
    spec.mean === true || (prob && spec.mean === undefined) ? model.mean : get(spec.mean);
  const medianValue = spec.median === true ? model.median : get(spec.median);
  const showMean = !model.problem && !waiting && (!!spec.mean || prob) && meanValue !== undefined;
  const showMedian = !model.problem && !!spec.median && medianValue !== undefined && !prob;
  // A mean or median worked from a "?" box reads "?", in the caption and at its marker.
  const meanKnown = allKnown && known(spec.mean);
  const medianKnown = allKnown && known(spec.median);
  if (!prob && showMean)
    lines.push(
      !meanKnown
        ? 'Mean x̄ = ?.'
        : model.estimated
          ? `Mean x̄ ≈ ${num(meanValue!)}, from the bin midpoints.`
          : `Mean x̄ = ${num(meanValue!)}.`,
    );
  if (showMedian) lines.push(`Median = ${medianKnown ? num(medianValue!) : '?'}.`);
  if (range && !model.problem) lines.push(range.caption);
  if (spec.shape && !model.problem)
    lines.push(`Shape: ${spec.shape === true ? model.shape : spec.shape}.`);

  // A "?" value or chance reads "?" on the picture, not the example's number behind it.
  const valueIds = spec.probability?.values;
  const xText = (x: number, i: number) => (prob && valueIds && !known(valueIds[i]) ? '?' : num(x));
  const markers = [
    ...(showMean
      ? [
          {
            x: meanValue!,
            text: `${meanSym} = ${meanKnown || prob ? num(meanValue!) : '?'}`,
            color: c.chartHighlight,
            dash: undefined,
          },
        ]
      : []),
    ...(showMedian
      ? [
          {
            x: medianValue!,
            text: `median = ${medianKnown ? num(medianValue!) : '?'}`,
            color: c.hopBack,
            dash: chart.dash,
          },
        ]
      : []),
  ];
  const T = 30 + markers.length * 18;
  const handleIds = spec.fixed
    ? []
    : model.bars.flatMap((b, i) =>
        b.id && rep.known(b.id) && !rep.variable(b.id).derived ? [i] : [],
      );
  const keep = spec.keep ?? model.bars.flatMap((b) => (b.id ? [b.id] : []));

  return (
    <View>
      <Canvas aspect={(w) => (T + 0.5 * w + 44) / w}>
        {({ w, h }) => {
          const L = 46;
          const R = 14;
          const axisY = T + 0.5 * w;
          // The value axis: bins edge to edge, or a slot per probability bar.
          const bars = model.bars;
          const lo = prob ? (bars[0]?.lo ?? 0) - 0.5 : (bars[0]?.lo ?? 0);
          const hi = prob
            ? (bars[bars.length - 1]?.lo ?? 1) + 0.5
            : (bars[bars.length - 1]?.hi ?? 1);
          const ux = (w - L - R) / (hi - lo || 1);
          const sx = (x: number) => L + (x - lo) * ux;
          const top = Math.max(frozen.value.top, 1e-9);
          const step = rel || prob ? niceStep(top) : Math.max(1, Math.round(niceStep(top)));
          const yMax = Math.ceil(top / step - 1e-9) * step || step;
          // Room above the tallest bar for its label.
          const uy = (axisY - T - 18) / yMax;
          const sy = (y: number) => axisY - y * uy;
          const op = allKnown ? 1 : 0.35;
          const yTicks: number[] = [];
          for (let t = 0; t <= yMax + 1e-9; t += step) yTicks.push(Number(t.toFixed(10)));
          const gap = prob
            ? Math.min(1, ...bars.slice(1).map((b, i) => b.lo - bars[i]!.lo))
            : bars[0]
              ? bars[0].hi - bars[0].lo
              : 1;
          const slotPx = gap * ux;
          const barW = prob ? slotPx * 0.8 : slotPx;
          // x labels: bin edges, or each value k; every other one when crowded.
          const xs = prob
            ? bars.map((b) => b.lo)
            : [...bars.map((b) => b.lo), bars[bars.length - 1]?.hi ?? 0];
          const widest = Math.max(...xs.map((x) => num(x).length)) * chart.label * 0.6 + 6;
          // Every 1, 2, 5, 10 or 20 labels, whichever first leaves room.
          const every = [1, 2, 5, 10, 20].find((e) => e * slotPx >= widest) ?? 40;
          const barLabels = !waiting && bars.length <= 16 && barW >= (prob ? 36 : 22);
          // A marker's triangle sits on the axis: an x label it would cover is left out.
          const underMarker = (x: number) =>
            markers.some(
              (m) =>
                Math.abs(sx(m.x) - sx(x)) < Math.max(8, 0.6 * num(x).length * chart.label * 0.6),
            );
          // Probability labels to the caption's decimals; 4 decimals a size smaller to fit.
          const decimals = probDecimals(bars.length);
          const labelSize = prob && decimals === 4 ? chart.label - 1 : chart.label;
          return (
            <>
              <Svg width={w} height={h}>
                {yTicks.map((t) => (
                  <G key={`y${t}`}>
                    <Line
                      x1={L}
                      y1={sy(t)}
                      x2={w - R}
                      y2={sy(t)}
                      stroke={c.chartGrid}
                      strokeWidth={1}
                    />
                    <ChartText x={L - 6} y={sy(t) + 4} textAnchor="end" fill={c.chartMuted}>
                      {num(t)}
                    </ChartText>
                  </G>
                ))}
                <ChartText x={4} y={14} fontWeight="600">
                  {prob ? 'P(X = k)' : rel ? 'Relative frequency' : 'Frequency'}
                </ChartText>
                {waiting ? (
                  <ChartText
                    x={(L + w - R) / 2}
                    y={(T + axisY) / 2 + 8}
                    textAnchor="middle"
                    fontSize={chart.value + 8}
                    fontWeight="700"
                    fill={c.chartMuted}
                  >
                    ?
                  </ChartText>
                ) : null}
                <G opacity={op}>
                  {(waiting ? [] : bars).map((b, i) => {
                    const x = prob ? sx(b.lo) - barW / 2 : sx(b.lo);
                    const hh = height(b.h) * uy;
                    const lit = i === litIndex || !!range?.lit.includes(i);
                    return (
                      <Rect
                        key={`b${i}`}
                        x={x}
                        y={axisY - hh}
                        width={barW}
                        height={Math.max(0, hh)}
                        fill={c.chartHighlight}
                        fillOpacity={lit ? 0.85 : 0.3}
                        stroke={c.chartHighlight}
                        strokeWidth={chart.strokeLight}
                      />
                    );
                  })}
                  {barLabels
                    ? bars.map((b, i) => {
                        const text = prob
                          ? b.id && !known(b.id)
                            ? '?'
                            : b.h.toFixed(decimals)
                          : rel
                            ? num(height(b.h))
                            : num(b.h);
                        const cx = prob ? sx(b.lo) : sx(b.lo) + slotPx / 2;
                        const ly = sy(height(b.h)) - (handleIds.includes(i) ? 16 : 5);
                        const tw = text.length * labelSize * 0.6 + 4;
                        return (
                          <G key={`l${i}`}>
                            <Rect
                              x={cx - tw / 2}
                              y={ly - 11}
                              width={tw}
                              height={14}
                              rx={3}
                              fill={c.background}
                              opacity={0.85}
                            />
                            <ChartText
                              x={cx}
                              y={ly}
                              textAnchor="middle"
                              fontWeight="600"
                              fontSize={labelSize}
                            >
                              {text}
                            </ChartText>
                          </G>
                        );
                      })
                    : null}
                </G>
                <Line
                  x1={L}
                  y1={axisY}
                  x2={w - R}
                  y2={axisY}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <Line
                  x1={L}
                  y1={T}
                  x2={L}
                  y2={axisY}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                {xs.map((x, i) =>
                  i % every === 0 && !underMarker(x) ? (
                    <ChartText
                      key={`x${i}`}
                      {...fitLabel(sx(x), num(x), chart.label, w)}
                      y={axisY + 16}
                    >
                      {xText(x, i)}
                    </ChartText>
                  ) : null,
                )}
                <ChartText
                  {...fitLabel(
                    (L + w - R) / 2,
                    spec.axis ?? (prob ? 'k' : 'Value'),
                    chart.label,
                    w,
                  )}
                  y={axisY + 36}
                  fontWeight="600"
                >
                  {spec.axis ?? (prob ? 'k' : 'Value')}
                </ChartText>
                {markers.map((m, i) => {
                  const y = 30 + i * 18;
                  const x = sx(m.x);
                  return (
                    <G key={`m${i}`}>
                      <Line
                        x1={x}
                        y1={axisY}
                        x2={x}
                        y2={y + 4}
                        stroke={m.color}
                        strokeWidth={chart.stroke}
                        strokeDasharray={m.dash}
                      />
                      <Path
                        d={`M${x - 6},${axisY + 7}L${x + 6},${axisY + 7}L${x},${axisY}Z`}
                        fill={m.color}
                      />
                      <ChartText
                        {...fitLabel(x + 5, m.text, chart.label, w, 'start', 5)}
                        y={y + 2}
                        fontWeight="700"
                        fill={m.color}
                      >
                        {m.text}
                      </ChartText>
                    </G>
                  );
                })}
              </Svg>
              {handleIds.map((i) => {
                const b = bars[i]!;
                const id = b.id!;
                return (
                  <DragHandle
                    key={id}
                    testID={`drag-${id}`}
                    x={prob ? sx(b.lo) : sx(b.lo) + slotPx / 2}
                    y={Math.max(T, sy(height(b.h)))}
                    label={rep.variable(id).name.toLowerCase()}
                    onStart={() => {
                      frozen.freeze();
                      start.current = b.h;
                    }}
                    onMove={(_, dy) => {
                      const scale = rel ? model.n! : 1;
                      const next = Math.max(0, start.current - (dy / uy) * scale);
                      calc.set(
                        {
                          ...rep.pin(keep.filter((k) => k !== id)),
                          [id]: rep.snapTo(id, next * rep.factor(id)),
                        },
                        rep.slide(id),
                      );
                    }}
                    onEnd={frozen.release}
                  />
                );
              })}
            </>
          );
        }}
      </Canvas>
      <Caption>{(prob && !allKnown && !waiting ? formulaOnly(lines) : lines).join(' · ')}</Caption>
    </View>
  );
}
