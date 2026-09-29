import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { TermsChartSpec } from '@/data/modules/typesHsb';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { niceStep } from './Plot';
import { termsModel } from './termsModel';

const num = (x: number) => formatNumber(Number(x.toPrecision(10)));
const sub = (n: number) => [...String(n)].map((d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]).join('');
const sup = (n: number) => [...String(n)].map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join('');
/** A negative number in brackets, as it is written inside a product or a power. */
const br = (x: number) => (x < 0 ? `(${num(x)})` : num(x));

/**
 * The terms of an arithmetic or geometric sequence as bars or points over n = 1, 2, …, the last
 * one lit, the partial sums as a stepped line, and an infinite geometric series' sum dashed.
 * Flat and exact: every height is a term or a sum on a nice axis through 0.
 */
export function TermsChart({ spec, calc }: { spec: TermsChartSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const get = (v: number | string | undefined) =>
    v === undefined ? undefined : typeof v === 'number' ? v : rep.shown(v);
  const known = (v: number | string | undefined) => typeof v !== 'string' || rep.known(v);
  const model = termsModel(spec, get);
  const { terms, sums, limit } = model;
  const n = terms.length;
  const a = get(spec.first) ?? 1;
  const d = get(spec.step) ?? 1;
  const arith = spec.type === 'arithmetic';
  const allKnown = known(spec.first) && known(spec.step) && known(spec.count);

  // ── Caption ──
  const lines: string[] = [];
  if (model.problem) lines.push(model.problem);
  if (n) {
    const shown =
      n <= 6
        ? terms.map(num).join(', ')
        : `${terms.slice(0, 4).map(num).join(', ')}, …, ${num(terms[n - 1]!)}`;
    lines.push(
      `Terms: ${shown} (${arith ? `add d = ${num(d)}` : `multiply by r = ${num(d)}`} each time).`,
      arith
        ? `a${sub(n)} = ${num(a)} + ${n - 1} × ${br(d)} = ${num(terms[n - 1]!)}`
        : `a${sub(n)} = ${num(a)} × ${br(d)}${sup(n - 1)} = ${num(terms[n - 1]!)}`,
    );
    if (spec.sums)
      lines.push(
        arith
          ? `S${sub(n)} = ${n} × (${num(a)} + ${num(terms[n - 1]!)}) ÷ 2 = ${num(sums[n - 1]!)}`
          : `S${sub(n)} = ${num(a)} × (1 − ${br(d)}${sup(n)}) ÷ (1 − ${br(d)}) = ${num(sums[n - 1]!)}`,
      );
    if (limit !== undefined)
      lines.push(
        `S = ${num(a)} ÷ (1 − ${br(d)}) = ${num(limit)}`,
        `S${sub(n)} is ${num(Math.abs(limit - sums[n - 1]!))} from S; more terms close the gap.`,
      );
  }

  return (
    <View>
      <Canvas aspect={0.8}>
        {({ w, h }) => {
          const L = 46;
          const R = 16;
          const T = 18;
          const B = 64;
          const values = [
            0,
            ...terms,
            ...(spec.sums ? sums : []),
            ...(limit !== undefined ? [limit] : []),
          ];
          let lo = Math.min(...values);
          let hi = Math.max(...values);
          if (hi - lo < 1e-9) hi = lo + 1;
          const step = niceStep(hi - lo);
          lo = Math.floor(lo / step + 1e-9) * step;
          hi = Math.ceil(hi / step - 1e-9) * step;
          const uy = (h - T - B) / (hi - lo);
          const sy = (y: number) => T + (hi - y) * uy;
          const slot = (w - L - R) / Math.max(1, n);
          const sx = (i: number) => L + (i + 0.5) * slot; // term i (0-based) at n = i + 1
          const op = allKnown ? 1 : 0.35;
          const ticks: number[] = [];
          for (let t = lo; t <= hi + 1e-9; t += step) ticks.push(Number(t.toPrecision(12)));
          const every = [1, 2, 5, 10].find((e) => e * slot >= 20) ?? 10;
          const bottom = h - B;
          const bars = spec.as !== 'points';
          const stepPath = sums
            .map(
              (s, i) => `${i ? 'L' : 'M'}${L + i * slot},${sy(s)}L${L + (i + 1) * slot},${sy(s)}`,
            )
            .join('');
          const last = n - 1;
          const lastText = `a${sub(n)} = ${num(terms[last] ?? 0)}`;
          const legend: [string, 'bar' | 'step' | 'dash'][] = [
            ['terms aₙ', 'bar'],
            ...(spec.sums ? [['sums Sₙ', 'step'] as [string, 'step']] : []),
            ...(limit !== undefined ? [[`S = ${num(limit)}`, 'dash'] as [string, 'dash']] : []),
          ];
          const widths = legend.map(([t]) => 26 + t.length * chart.label * 0.56);
          let lx = (w - widths.reduce((s, x) => s + x, 0) - 14 * (legend.length - 1)) / 2;
          return (
            <Svg width={w} height={h}>
              {ticks.map((t) => (
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
              <Line
                x1={L}
                y1={sy(0)}
                x2={w - R}
                y2={sy(0)}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              <Line
                x1={L}
                y1={T}
                x2={L}
                y2={bottom}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              {terms.map((_, i) =>
                (i + 1) % every === 0 || (i === 0 && every >= 5) ? (
                  <ChartText key={`x${i}`} x={sx(i)} y={bottom + 16} textAnchor="middle">
                    {String(i + 1)}
                  </ChartText>
                ) : null,
              )}
              <ChartText x={(L + w - R) / 2} y={bottom + 34} textAnchor="middle" fontWeight="600">
                term number n
              </ChartText>
              <G opacity={op}>
                {limit !== undefined ? (
                  <Line
                    x1={L}
                    y1={sy(limit)}
                    x2={w - R}
                    y2={sy(limit)}
                    stroke={c.normalReject}
                    strokeWidth={chart.stroke}
                    strokeDasharray={chart.dash}
                  />
                ) : null}
                {terms.map((t, i) =>
                  bars ? (
                    <Rect
                      key={`t${i}`}
                      x={sx(i) - (slot * 0.6) / 2}
                      y={Math.min(sy(t), sy(0))}
                      width={slot * 0.6}
                      height={Math.abs(sy(t) - sy(0))}
                      fill={c.chartHighlight}
                      fillOpacity={i === last ? 0.9 : 0.35}
                      stroke={c.chartHighlight}
                      strokeWidth={1}
                    />
                  ) : (
                    <Circle
                      key={`t${i}`}
                      cx={sx(i)}
                      cy={sy(t)}
                      r={i === last ? 6 : 4.5}
                      fill={c.chartHighlight}
                      fillOpacity={i === last ? 1 : 0.7}
                    />
                  ),
                )}
                {spec.sums ? (
                  <Path
                    d={stepPath}
                    fill="none"
                    stroke={c.chartSecond}
                    strokeWidth={chart.strokeHeavy}
                  />
                ) : null}
                {spec.sums && n && !spec.limit ? (
                  <ChartText
                    {...fitLabel(
                      L + last * slot - 4,
                      `S${sub(n)} = ${num(sums[last]!)}`,
                      chart.label,
                      w,
                      'end',
                      4,
                    )}
                    y={Math.max(T + 10, sy(sums[last]!) - 6)}
                    fontWeight="700"
                    fill={c.chartInk}
                  >
                    {`S${sub(n)} = ${num(sums[last]!)}`}
                  </ChartText>
                ) : null}
                {n ? (
                  <ChartText
                    {...fitLabel(sx(last), lastText, chart.label, w)}
                    y={
                      terms[last]! >= 0
                        ? Math.max(T + 10, sy(terms[last]!) - 8)
                        : Math.min(bottom - 4, sy(terms[last]!) + 16)
                    }
                    fontWeight="700"
                    fill={c.chartHighlight}
                  >
                    {lastText}
                  </ChartText>
                ) : null}
              </G>
              {legend.map(([text, mark], i) => {
                const x0 = lx;
                lx += widths[i]! + 14;
                const y = bottom + 54;
                return (
                  <G key={`k${i}`}>
                    {mark === 'bar' ? (
                      <Rect
                        x={x0}
                        y={y - 10}
                        width={18}
                        height={12}
                        rx={2}
                        fill={c.chartHighlight}
                        fillOpacity={0.6}
                      />
                    ) : (
                      <Line
                        x1={x0}
                        y1={y - 4}
                        x2={x0 + 18}
                        y2={y - 4}
                        stroke={mark === 'step' ? c.chartSecond : c.normalReject}
                        strokeWidth={chart.stroke + (mark === 'step' ? 1 : 0)}
                        strokeDasharray={mark === 'dash' ? chart.dashFine : undefined}
                      />
                    )}
                    <ChartText x={x0 + 24} y={y}>
                      {text}
                    </ChartText>
                  </G>
                );
              })}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
