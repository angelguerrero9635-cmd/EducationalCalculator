import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { TermsChartSpec } from '@/data/modules/typesHsb';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { niceStep } from './Plot';
import { powerLines, powerName } from './termsPowerHs3b';
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
  // H93: n is the lit term; `terms` may run on to a second lit term (`lit`).
  const n = model.count;
  const a = get(spec.first) ?? 1;
  const d = get(spec.step) ?? 1;
  const arith = spec.type === 'arithmetic';
  const recursive = spec.type === 'recursive';
  const c0 = get(spec.plus) ?? 0;
  const allKnown =
    known(spec.first) &&
    known(spec.step) &&
    known(spec.count) &&
    known(spec.plus) &&
    known(spec.lit);
  const second = spec.lit === undefined ? -1 : Math.round(get(spec.lit) ?? 0) - 1;
  const lit2 = second >= 0 && second < terms.length && second !== n - 1 ? second : -1;
  const powers = spec.powers && !arith && !recursive && a === d;
  /** A term's name: aₙ, or as a power of the first term (2³). */
  const termName = (i: number) =>
    spec.type === 'power' // H106
      ? powerName(i + 1, d)
      : powers
        ? `${num(a)}${sup(i + 1)}`
        : `a${sub(i + 1)}`;
  // Past 30 terms: the first six, a break, then the nth.
  const gap = spec.far && n > 30;
  const HEAD = 6;

  // ── Caption ──
  const lines: string[] = [];
  if (model.problem) lines.push(model.problem);
  if (n && spec.type === 'power') lines.push(...powerLines(a, d, n, terms, sums, !!spec.sums));
  else if (n) {
    const shown =
      n <= 6
        ? terms.slice(0, n).map(num).join(', ')
        : `${terms.slice(0, 4).map(num).join(', ')}, …, ${num(terms[n - 1]!)}`;
    const rule = arith
      ? `add d = ${num(d)} each time`
      : recursive
        ? `each term ${num(d)} × the one before ${c0 < 0 ? '−' : '+'} ${num(Math.abs(c0))}`
        : `multiply by r = ${num(d)} each time`;
    lines.push(
      powers ? `Powers of ${num(a)}: ${shown}.` : `Terms: ${shown} (${rule}).`,
      arith
        ? `a${sub(n)} = ${num(a)} + ${n - 1} × ${br(d)} = ${num(terms[n - 1]!)}`
        : recursive
          ? n > 1
            ? `a${sub(n)} = ${num(d)} × ${br(terms[n - 2]!)} ${c0 < 0 ? '−' : '+'} ${num(Math.abs(c0))} = ${num(terms[n - 1]!)}`
            : `a₁ = ${num(a)}`
          : powers
            ? `${termName(n - 1)} = ${num(terms[n - 1]!)}`
            : `a${sub(n)} = ${num(a)} × ${br(d)}${sup(n - 1)} = ${num(terms[n - 1]!)}`,
    );
    // Named by its colour, the way the reader sees it ("lit" meant nothing).
    if (lit2 >= 0) lines.push(`Amber bar: ${termName(lit2)} = ${num(terms[lit2]!)}.`);
    if (gap) lines.push(`The chart skips from n = ${HEAD} to n = ${n}.`);
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
          // Room over the tallest term for the recursive arrows or the lit labels (H93).
          const T = recursive ? 44 : lit2 >= 0 || powers || spec.type === 'power' ? 34 : 18;
          const B = 64;
          // The terms drawn: every one, or past 30 the first six and the nth (H93).
          const drawn = gap
            ? [...Array.from({ length: HEAD }, (_, i) => i), n - 1]
            : terms.map((_, i) => i);
          const showSums = spec.sums && !gap;
          const values = [
            0,
            ...drawn.map((i) => terms[i]!),
            ...(showSums ? sums : []),
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
          const slot = (w - L - R) / Math.max(1, gap ? HEAD + 2.5 : terms.length);
          // Term i (0-based) at n = i + 1; past the break the nth sits two slots on.
          const sx = (i: number) => L + (gap && i >= HEAD ? HEAD + 2 : i + 0.5) * slot;
          const breakX = L + (HEAD + 0.75) * slot;
          const op = allKnown ? 1 : 0.35;
          const ticks: number[] = [];
          for (let t = lo; t <= hi + 1e-9; t += step) ticks.push(Number(t.toPrecision(12)));
          const every = [1, 2, 5, 10].find((e) => e * slot >= 20) ?? 10;
          const bottom = h - B;
          const bars = spec.as !== 'points';
          const stepPath = (showSums ? sums : [])
            .map(
              (s, i) => `${i ? 'L' : 'M'}${L + i * slot},${sy(s)}L${L + (i + 1) * slot},${sy(s)}`,
            )
            .join('');
          const last = n - 1;
          const lastText = `${termName(last)} = ${num(terms[last] ?? 0)}`;
          const secondText = lit2 >= 0 ? `${termName(lit2)} = ${num(terms[lit2]!)}` : '';
          // A recursive rule's arrows, each term to the next (H93), arching over both tops.
          const arcs = recursive && !gap && drawn.length > 1 && drawn.length <= 12;
          const top = (i: number) => (bars ? Math.min(sy(terms[i]!), sy(0)) : sy(terms[i]!));
          /** The arrow into term i: ends, control point and its highest point. */
          const arc = (i: number) => {
            const [x0, x1] = [sx(i - 1) + 2, sx(i) - 2];
            const [y0, y1] = [top(i - 1) - 3, top(i) - 3];
            const peak = Math.min(y0, y1) - 14;
            // The control point that puts the curve's highest point at `peak`.
            const cy = peak - Math.sqrt((y0 - peak) * (y1 - peak));
            return { x0, x1, y0, y1, cy, peak };
          };
          const labelY = (i: number) =>
            arcs && i === last && i > 0
              ? Math.max(14, Math.min(top(i) - 8, arc(i).peak - 8))
              : terms[i]! >= 0
                ? Math.max(T === 18 ? T + 10 : 14, sy(terms[i]!) - 8)
                : Math.min(bottom - 4, sy(terms[i]!) + 16);
          // Two lit labels side by side: the second moves up a line when they would touch.
          const tw = (t: string) => t.length * chart.label * 0.58;
          const clash =
            lit2 >= 0 &&
            Math.abs(sx(lit2) - sx(last)) < (tw(secondText) + tw(lastText)) / 2 + 6 &&
            Math.abs(labelY(lit2) - labelY(last)) < 16;
          const secondY = clash
            ? labelY(last) - 16 >= T + 10
              ? labelY(last) - 16
              : labelY(last) + 16
            : labelY(lit2 < 0 ? 0 : lit2);
          const legend: [string, 'bar' | 'step' | 'dash'][] = [
            [powers ? `powers ${num(a)}ⁿ` : 'terms aₙ', 'bar'],
            ...(showSums ? [['sums Sₙ', 'step'] as [string, 'step']] : []),
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
              {gap ? (
                // The break: the axis cut by two slanted strokes, the terms skipped between.
                <G>
                  <Rect x={breakX - 6} y={sy(0) - 6} width={12} height={12} fill={c.card} />
                  {[-4, 4].map((dx) => (
                    <Line
                      key={dx}
                      x1={breakX + dx - 3}
                      y1={sy(0) + 7}
                      x2={breakX + dx + 3}
                      y2={sy(0) - 7}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                  ))}
                  <ChartText x={breakX} y={bottom + 16} textAnchor="middle" fill={c.chartMuted}>
                    …
                  </ChartText>
                </G>
              ) : null}
              {drawn.map((i) =>
                gap || (i + 1) % every === 0 || (i === 0 && every >= 5) ? (
                  <ChartText key={`x${i}`} x={sx(i)} y={bottom + 16} textAnchor="middle">
                    {String(i + 1)}
                  </ChartText>
                ) : null,
              )}
              <ChartText x={(L + w - R) / 2} y={bottom + 34} textAnchor="middle" fontWeight="600">
                {powers ? 'exponent n' : 'term number n'}
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
                {arcs
                  ? drawn.slice(1).map((i) => {
                      // An arrow from each term to the next: the rule applied once.
                      const { x0, x1, y0, y1, cy } = arc(i);
                      const ang = Math.atan2(y1 - cy, x1 - (x0 + x1) / 2);
                      const hx = (k: number, a: number) => x1 - 7 * Math.cos(ang + k * a);
                      const hy = (k: number, a: number) => y1 - 7 * Math.sin(ang + k * a);
                      return (
                        <G key={`r${i}`}>
                          <Path
                            d={`M${x0},${y0}Q${(x0 + x1) / 2},${cy} ${x1},${y1}`}
                            fill="none"
                            stroke={c.chartMuted}
                            strokeWidth={chart.strokeLight}
                          />
                          <Path
                            d={`M${x1},${y1}L${hx(1, 0.45)},${hy(1, 0.45)}L${hx(-1, 0.45)},${hy(-1, 0.45)}Z`}
                            fill={c.chartMuted}
                          />
                        </G>
                      );
                    })
                  : null}
                {drawn.map((i) => {
                  const t = terms[i]!;
                  const lit = i === last || i === lit2;
                  const fill = i === lit2 ? c.chartSecond : c.chartHighlight;
                  return bars ? (
                    <Rect
                      key={`t${i}`}
                      x={sx(i) - (slot * 0.6) / 2}
                      y={Math.min(sy(t), sy(0))}
                      width={slot * 0.6}
                      height={Math.abs(sy(t) - sy(0))}
                      fill={fill}
                      fillOpacity={lit ? 0.9 : 0.35}
                      stroke={fill}
                      strokeWidth={1}
                    />
                  ) : (
                    <Circle
                      key={`t${i}`}
                      cx={sx(i)}
                      cy={sy(t)}
                      r={lit ? 6 : 4.5}
                      fill={fill}
                      fillOpacity={lit ? 1 : 0.7}
                    />
                  );
                })}
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
                    y={labelY(last)}
                    fontWeight="700"
                    fill={c.chartHighlight}
                  >
                    {lastText}
                  </ChartText>
                ) : null}
                {lit2 >= 0 ? (
                  <ChartText
                    {...fitLabel(sx(lit2), secondText, chart.label, w)}
                    y={secondY}
                    fontWeight="700"
                  >
                    {secondText}
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
