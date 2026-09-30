/**
 * H106 (round 3, group B): a `table` sweep with its graph (`graph`). The table as `ValueTable`
 * draws it, and under it the output against the swept value: the curve worked out by the
 * module's own relations with the parameters held (every point solved, not joined dots), each
 * row a dot, the current row lit, and with `best` the least (or greatest) point ringed with its
 * values and a dashed line down to the axis. With `rowsFrom: 'shown'` the `rows` function gets
 * the values in the units on the menu, so its steps are round there (the Units rule).
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import type { Values } from '@/engine/types';
import { formatNumber } from '@/engine/format';
import { solve } from '@/engine/solve';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { niceStep, ticks } from './functionGraphMath';
import { ValueTable } from './ValueTable';

type Spec = Extract<Representation, { kind: 'table'; sweep: string }>;

/** 12 significant figures: rows converted from formula units read as typed (4.3, not 4.2999…). */
const tidy = (x: number) => Number(x.toPrecision(12));

/** The least (or greatest) of a unimodal f on [lo, hi]: a scan, then a golden-section search. */
export function bestOf(
  f: (x: number) => number | undefined,
  lo: number,
  hi: number,
  kind: 'min' | 'max',
): { x: number; y: number } | undefined {
  const sign = kind === 'min' ? 1 : -1;
  const g = (x: number) => {
    const y = f(x);
    return y === undefined || !Number.isFinite(y) ? Infinity : sign * y;
  };
  const n = 60;
  let at = -1;
  let low = Infinity;
  for (let i = 0; i <= n; i++) {
    const v = g(lo + ((hi - lo) * i) / n);
    if (v < low) [low, at] = [v, i];
  }
  if (at < 0) return undefined;
  let [a, b] = [
    lo + ((hi - lo) * Math.max(0, at - 1)) / n,
    lo + ((hi - lo) * Math.min(n, at + 1)) / n,
  ];
  const r = (Math.sqrt(5) - 1) / 2;
  for (let k = 0; k < 80; k++) {
    const [c, d] = [b - r * (b - a), a + r * (b - a)];
    if (g(c) < g(d)) b = d;
    else a = c;
  }
  const x = (a + b) / 2;
  const y = f(x);
  return y === undefined ? undefined : { x, y };
}

export function TableGraph({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const fx = rep.factor(spec.sweep);
  const fy = rep.factor(spec.output);
  // The rows worked out from the values in the units on the menu.
  const rowsFn = spec.rows;
  const shownSpec: Spec =
    spec.rowsFrom === 'shown' && typeof rowsFn === 'function'
      ? {
          ...spec,
          rows: (v: Values) =>
            rowsFn(
              Object.fromEntries(
                Object.entries(v).map(([id, x]) => [
                  id,
                  x === undefined ? x : tidy(x / rep.factor(id)),
                ]),
              ),
            ),
        }
      : spec;
  if (!spec.graph) return <ValueTable spec={shownSpec} calc={calc} />;
  const graph = spec.graph;
  const pinned = rep.pin(spec.params);
  const paramsKnown = spec.params.every(rep.known);
  const givens = Object.entries(pinned).map(([id, value]) => ({ id, value }));
  // The output (shown unit) at a swept value (shown unit), by the module's relations.
  const out = (x: number) => {
    const y = solve(calc.module, [...givens, { id: spec.sweep, value: x * fx }]).values[
      spec.output
    ];
    return y === undefined ? undefined : y / fy;
  };
  const rows = (typeof shownSpec.rows === 'function' ? shownSpec.rows(calc.values) : shownSpec.rows)
    .slice()
    .sort((p, q) => p - q);
  const [lo, hi] = [rows[0] ?? 0, rows[rows.length - 1] ?? 1];
  const n = 72;
  const curve = paramsKnown
    ? Array.from({ length: n + 1 }, (_, i) => {
        const x = lo + ((hi - lo) * i) / n;
        return { x, y: out(x) };
      }).filter((p): p is { x: number; y: number } => p.y !== undefined && Number.isFinite(p.y))
    : [];
  const dots = paramsKnown
    ? rows.flatMap((x) => {
        const y = out(x);
        return y === undefined ? [] : [{ x, y }];
      })
    : [];
  const best = paramsKnown && graph.best && hi > lo ? bestOf(out, lo, hi, graph.best) : undefined;
  const cur = calc.values[spec.sweep];
  const curX = cur === undefined ? undefined : cur / fx;
  const curY = curX === undefined || !paramsKnown ? undefined : out(curX);
  const xv = rep.variable(spec.sweep);
  const yv = rep.variable(spec.output);
  const unitOf = (id: string) => (rep.unit(id) ? ` (${rep.unit(id)})` : '');
  const num = (x: number, id: string) => formatNumber(Number(x.toPrecision(4)), rep.variable(id));
  const word = graph.best === 'max' ? 'most' : 'least';
  const caption = !paramsKnown
    ? `Enter ${spec.params.map((id) => rep.variable(id).symbol).join(' and ')} to draw the graph.`
    : [
        `${yv.symbol} against ${xv.symbol}, worked out for every ${xv.symbol} from ${num(lo, spec.sweep)} to ${num(hi, spec.sweep)}${unitOf(spec.sweep).replace(/[()]/g, '')}`,
        ...(best
          ? [
              `The ${word} ${yv.symbol} ≈ ${num(best.y, spec.output)}${unitOf(spec.output).replace(/[()]/g, '')} comes at ${xv.symbol} ≈ ${num(best.x, spec.sweep)}${unitOf(spec.sweep).replace(/[()]/g, '')}`,
            ]
          : []),
      ].join(' · ');

  return (
    <View>
      <ValueTable spec={shownSpec} calc={calc} />
      <Canvas aspect={0.62}>
        {({ w, h }) => {
          const L = 50;
          const R = 16;
          const T = 26;
          const B = 40;
          const ys = [...curve.map((p) => p.y), ...dots.map((p) => p.y)];
          const yMin0 = ys.length ? Math.min(...ys) : 0;
          const yMax0 = ys.length ? Math.max(...ys) : 1;
          const pad = (yMax0 - yMin0) * 0.08 || Math.abs(yMax0) * 0.1 || 1;
          const yStep = niceStep(yMax0 - yMin0 + 2 * pad, 5);
          const y0 = Math.floor((yMin0 - pad) / yStep) * yStep;
          const y1 = Math.ceil((yMax0 + pad) / yStep) * yStep;
          const xStep = niceStep(hi - lo || 1, 6);
          const x0 = Math.floor(lo / xStep) * xStep;
          const x1 = Math.max(Math.ceil(hi / xStep) * xStep, x0 + xStep);
          const sx = (x: number) => L + ((x - x0) / (x1 - x0)) * (w - L - R);
          const sy = (y: number) => T + ((y1 - y) / (y1 - y0 || 1)) * (h - T - B);
          const d = curve
            .map((p, i) => `${i ? 'L' : 'M'} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`)
            .join(' ');
          const bestText = best
            ? `${word} ${yv.symbol} ≈ ${num(best.y, spec.output)} at ${xv.symbol} ≈ ${num(best.x, spec.sweep)}`
            : '';
          const bx = best ? sx(best.x) : 0;
          const bFit = fitLabel(bx, bestText, chart.label, w, 'middle');
          return (
            <Svg width={w} height={h}>
              {ticks(y0, y1, yStep).map((t) => (
                <G key={`y${t}`}>
                  <Line
                    x1={L}
                    x2={w - R}
                    y1={sy(t)}
                    y2={sy(t)}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                  />
                  <ChartText x={L - 6} y={sy(t) + 4} fontSize={chart.label} textAnchor="end">
                    {formatNumber(Number(t.toPrecision(10)))}
                  </ChartText>
                </G>
              ))}
              {ticks(x0, x1, xStep).map((t) => (
                <G key={`x${t}`}>
                  <Line
                    x1={sx(t)}
                    x2={sx(t)}
                    y1={T}
                    y2={h - B}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                  />
                  <ChartText x={sx(t)} y={h - B + 16} fontSize={chart.label} textAnchor="middle">
                    {formatNumber(Number(t.toPrecision(10)))}
                  </ChartText>
                </G>
              ))}
              <Line
                x1={L}
                x2={L}
                y1={T}
                y2={h - B}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              <Line
                x1={L}
                x2={w - R}
                y1={h - B}
                y2={h - B}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              <ChartText
                x={w - R}
                y={h - 6}
                fontSize={chart.label}
                fontWeight="700"
                textAnchor="end"
              >
                {`${xv.name} ${xv.symbol}${unitOf(spec.sweep)}`}
              </ChartText>
              <ChartText x={6} y={16} fontSize={chart.label} fontWeight="700">
                {`${yv.name} ${yv.symbol}${unitOf(spec.output)}`}
              </ChartText>
              {d ? (
                <Path d={d} stroke={c.chartHighlight} strokeWidth={chart.strokeHeavy} fill="none" />
              ) : null}
              {dots.map((p) => (
                <Circle key={`d${p.x}`} cx={sx(p.x)} cy={sy(p.y)} r={3.5} fill={c.chartInk} />
              ))}
              {best ? (
                <>
                  <Line
                    x1={bx}
                    x2={bx}
                    y1={sy(best.y)}
                    y2={h - B}
                    stroke={c.fnSecond}
                    strokeWidth={chart.stroke}
                    strokeDasharray={chart.dashFine}
                  />
                  <Circle
                    cx={bx}
                    cy={sy(best.y)}
                    r={8}
                    fill="none"
                    stroke={c.fnSecond}
                    strokeWidth={chart.stroke}
                  />
                  <ChartText
                    x={bFit.x}
                    y={graph.best === 'max' ? sy(best.y) + 26 : sy(best.y) - 14}
                    fontSize={chart.label}
                    fontWeight="700"
                    textAnchor={bFit.textAnchor}
                    fill={c.fnSecond}
                  >
                    {bestText}
                  </ChartText>
                </>
              ) : null}
              {curX !== undefined && curY !== undefined && curX >= x0 && curX <= x1 ? (
                <Circle
                  cx={sx(curX)}
                  cy={sy(curY)}
                  r={6}
                  fill={c.chartHighlight}
                  stroke={c.card}
                  strokeWidth={2}
                />
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}
