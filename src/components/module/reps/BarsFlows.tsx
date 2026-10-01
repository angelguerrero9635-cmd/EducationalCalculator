/**
 * H100 `bars` with `flows`: a start and an end bar with the flows between them as steps, the way
 * a population changes (N, + births, − deaths, + immigrants, − emigrants, N₁). The first bar is
 * the start and the last the end; each bar between is a flow that adds (green, "+90") or, when
 * named in `flows.out`, takes away (red, "−40"), drawn from the running total with a dashed line
 * on to the next step. The scale starts near the smallest total (the start and end bars are cut
 * with a break, and the axis says where it starts), so flows a tenth of N still read. Values are
 * typed: no handles. Without `flows` the bar chart is as it was (`Bars.tsx`).
 */
import { View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { flowSteps } from './barFlowMath';
import { Canvas, Caption, ChartText, niceCeil, useRep } from './common';

type Spec = Extract<Representation, { kind: 'bars' }>;

export function BarsFlows({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = spec.bars.map((b) => b.var);
  const outs = ids.map((id, i) => i > 0 && i < ids.length - 1 && !!spec.flows?.out.includes(id));
  const values = ids.map((id) => rep.shown(id));
  const known = ids.every((id) => rep.known(id));
  const { steps, reached } = flowSteps(values, outs);
  const tops = steps.flatMap((s, i) =>
    i === 0 || i === steps.length - 1 ? [s.to] : [s.from, s.to],
  );
  const lo = Math.min(...tops);
  const hi = Math.max(...tops, 1);
  // Start the scale below the lowest total, at a round number, when that cuts off a lot.
  const pad = Math.max((hi - lo) * 0.35, hi * 0.02);
  const round = niceCeil((hi - lo) / 4 || 1);
  const base = lo - pad > hi * 0.2 ? Math.floor((lo - pad) / round) * round : 0;
  const cut = base > 0;
  const symbol = (id: string) => rep.variable(id).symbol;
  const sum = ids
    .slice(1, -1)
    .map((id, k) => `${outs[k + 1] ? '−' : '+'} ${symbol(id)}`)
    .join(' ');
  const nums = ids
    .slice(1, -1)
    .map((id, k) => `${outs[k + 1] ? '−' : '+'} ${rep.value(id, false)}`)
    .join(' ');
  const last = ids[ids.length - 1]!;
  const caption = known
    ? [
        `${symbol(last)} = ${symbol(ids[0]!)} ${sum}`,
        `${rep.value(ids[0]!, false)} ${nums} = ${formatNumber(reached)}`,
        Math.abs(reached - values[values.length - 1]!) < 1e-9
          ? `The flows in add and the flows out take away: ${symbol(last)} = ${rep.value(last, false)}.`
          : `The flows reach ${formatNumber(reached)}, but ${symbol(last)} is ${rep.value(last, false)}.`,
      ].join(' · ')
    : 'Type the start and every flow to see the change.';
  const H = 250;
  return (
    <View>
      <Canvas aspect={H / 360}>
        {({ w, h }) => {
          const top = 26;
          const bottom = 46;
          const axis = Math.max(30, formatNumber(base).length * chart.label * 0.6 + 14);
          const sy = (v: number) =>
            top + ((hi + pad * 0.5 - v) / (hi + pad * 0.5 - base)) * (h - top - bottom);
          const y0 = h - bottom;
          const slot = (w - axis - 8) / ids.length;
          const barW = Math.min(46, slot * 0.66);
          const cx = (i: number) => axis + slot * (i + 0.5);
          return (
            <Svg width={w} height={h}>
              <G opacity={known ? 1 : 0.35}>
                <Line
                  x1={axis - 4}
                  y1={y0}
                  x2={w - 4}
                  y2={y0}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <ChartText
                  x={axis - 8}
                  y={y0 + 4}
                  fontSize={chart.label}
                  textAnchor="end"
                  fill={c.chartMuted}
                >
                  {formatNumber(base)}
                </ChartText>
                {steps.map((s, i) => {
                  const end = i === 0 || i === steps.length - 1;
                  const x = cx(i) - barW / 2;
                  const [a, b] = end ? [base, s.to] : [s.from, s.to];
                  const ya = end ? y0 : sy(a);
                  const yb = sy(b);
                  const up = b >= a;
                  const fill = end ? c.chartFill : outs[i] ? c.blockRed : c.blockGreen;
                  const text = end
                    ? formatNumber(values[i]!)
                    : `${outs[i] ? '−' : '+'}${formatNumber(values[i]!)}`;
                  return (
                    <G key={ids[i]}>
                      <Rect
                        x={x}
                        y={Math.min(ya, yb)}
                        width={barW}
                        height={Math.max(1.5, Math.abs(ya - yb))}
                        rx={2}
                        fill={fill}
                        stroke={end ? c.chartMuted : fill}
                        strokeWidth={1}
                      />
                      {end && cut ? (
                        // The break: this bar runs on down to 0.
                        <Path
                          d={`M ${x - 3} ${y0 - 10} l ${barW / 4 + 1.5} -5 l ${barW / 4 + 1.5} 5 l ${barW / 4 + 1.5} -5 l ${barW / 4 + 1.5} 5`}
                          stroke={c.card}
                          strokeWidth={4}
                          fill="none"
                        />
                      ) : null}
                      {i < steps.length - 1 ? (
                        <Line
                          x1={x + barW}
                          y1={yb}
                          x2={cx(i + 1) - barW / 2}
                          y2={yb}
                          stroke={c.chartMuted}
                          strokeWidth={1}
                          strokeDasharray={chart.dashFine}
                        />
                      ) : null}
                      <ChartText
                        x={cx(i)}
                        y={end || up ? Math.min(ya, yb) - 6 : Math.max(ya, yb) + 15}
                        fontSize={chart.value}
                        fontWeight="700"
                        textAnchor="middle"
                        fill={end ? c.chartInk : outs[i] ? c.blockRed : c.blockGreen}
                      >
                        {rep.known(ids[i]!) ? text : '?'}
                      </ChartText>
                      <ChartText
                        x={cx(i)}
                        y={y0 + 17}
                        fontSize={chart.label}
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {symbol(ids[i]!)}
                      </ChartText>
                      <ChartText
                        x={cx(i)}
                        y={y0 + 32}
                        fontSize={chart.label}
                        textAnchor="middle"
                        fill={c.chartMuted}
                      >
                        {end ? (i === 0 ? 'start' : 'end') : outs[i] ? 'out' : 'in'}
                      </ChartText>
                    </G>
                  );
                })}
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}
