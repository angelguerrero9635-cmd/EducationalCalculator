import { View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { ReserveSpec } from '@/data/modules/typesHs2f';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import { HaloText } from '../layouts/earthKit';
import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';

const BW = 360;
const BH = 172;
const X0 = 16;
const X1 = 344;
const BAR_TOP = 56;
const BAR_H = 40;
const AXIS = 110;

/** A tick step of 1, 2 or 5 × 10ⁿ giving at most `most` steps over `span`. */
const tickStep = (span: number, most: number) => {
  const raw = span / most;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
};

const round = (x: number, places = 2) => Number(x.toFixed(places));

/** A reserve cut into the slices used each year (ReserveSpec). */
export function Reserve({ spec, calc }: { spec: ReserveSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (x: number | string | undefined, d: number) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) =>
    x === undefined || typeof x === 'number' || rep.known(x);
  const named = (x: number | string) => (typeof x === 'string' ? rep.named(x) : formatNumber(x));
  const q = Math.max(0, num(spec.reserve, 400));
  const r = Math.max(0, num(spec.rate, 12.5));
  const on = known(spec.reserve) && known(spec.rate) && q > 0 && r > 0;
  const y = r > 0 ? q / r : 0;
  const X = (years: number) => X0 + (y > 0 ? (years / y) * (X1 - X0) : 0);
  const slice = y > 0 ? (X1 - X0) / y : 0;
  // Every year's cut, while they stay at least 3 px apart; the axis ticks at nice years.
  const cuts =
    slice >= 3 ? Array.from({ length: Math.max(0, Math.ceil(y - 1e-9) - 1) }, (_, i) => i + 1) : [];
  const step = y > 0 ? Math.max(1, tickStep(y, 6)) : 1;
  const ticks = Array.from({ length: Math.floor(y / step + 1e-9) + 1 }, (_, i) => i * step).filter(
    (t) => X(y) - X(t) > 40 || t === 0,
  );
  const first = Math.min(X1, X0 + slice);
  const endText = `empty after ${typeof spec.years === 'string' ? `${rep.variable(spec.years).symbol} = ` : ''}${formatNumber(round(y))} years`;
  // The reserve's unit, for one year's slice ("12.5 billion barrels").
  const unit = typeof spec.reserve === 'string' ? rep.unit(spec.reserve) : undefined;

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => {
          const k = w / BW;
          return (
            <Svg width={w} height={h}>
              <G transform={`scale(${k})`} opacity={on ? 1 : 0.4}>
                {/* The whole reserve, bracketed. */}
                <Path
                  d={`M ${X0} 44 v -8 H ${X1} v 8`}
                  stroke={c.chartInk}
                  strokeWidth={1.5}
                  fill="none"
                />
                <HaloText
                  x={(X0 + X1) / 2}
                  y={30}
                  text={`reserve ${named(spec.reserve)}`}
                  c={c}
                  size={chart.value}
                  bold
                />
                <Rect
                  x={X0}
                  y={BAR_TOP}
                  width={X1 - X0}
                  height={BAR_H}
                  fill={c.chartSecond}
                  rx={3}
                />
                {/* The first year's use, lit. */}
                <Rect
                  x={X0}
                  y={BAR_TOP}
                  width={first - X0}
                  height={BAR_H}
                  fill={c.chartHighlight}
                  rx={2}
                />
                {cuts.map((i) => (
                  <Line
                    key={i}
                    x1={X(i)}
                    y1={BAR_TOP}
                    x2={X(i)}
                    y2={BAR_TOP + BAR_H}
                    stroke={c.card}
                    strokeWidth={slice >= 8 ? 1.5 : 0.8}
                  />
                ))}
                <Rect
                  x={X0}
                  y={BAR_TOP}
                  width={X1 - X0}
                  height={BAR_H}
                  fill="none"
                  stroke={c.chartInk}
                  strokeWidth={1.2}
                  rx={3}
                />
                <HaloText
                  x={Math.min(first + 6, X1 - 120)}
                  y={BAR_TOP + BAR_H / 2 + 5}
                  text={named(spec.rate)}
                  c={c}
                  size={chart.label}
                  bold
                  anchor="start"
                />
                {/* Years from now. */}
                <Line x1={X0} y1={AXIS} x2={X1} y2={AXIS} stroke={c.chartInk} strokeWidth={1.5} />
                {ticks.map((t) => (
                  <G key={t}>
                    <Line x1={X(t)} y1={AXIS} x2={X(t)} y2={AXIS + 5} stroke={c.chartInk} />
                    <ChartText
                      x={X(t)}
                      y={AXIS + 18}
                      fontSize={chart.label}
                      textAnchor="middle"
                      fill={c.chartMuted}
                    >
                      {formatNumber(t)}
                    </ChartText>
                  </G>
                ))}
                <Line
                  x1={X1}
                  y1={BAR_TOP - 4}
                  x2={X1}
                  y2={AXIS + 6}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.stroke}
                />
                <HaloText
                  x={X1}
                  y={AXIS + 20}
                  text={formatNumber(round(y))}
                  c={c}
                  size={chart.label}
                  bold
                  fill={c.chartHighlight}
                  anchor="end"
                />
                <ChartText x={X0} y={AXIS + 40} fontSize={chart.label} fill={c.chartMuted}>
                  Years from now
                </ChartText>
                <HaloText
                  x={X1}
                  y={AXIS + 40}
                  text={endText}
                  c={c}
                  size={chart.value}
                  bold
                  fill={c.chartHighlight}
                  anchor="end"
                />
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {on
          ? `Each slice of the bar is one year’s use, ${formatNumber(round(r, 4))}${unit ? ` ${unit}` : ''}. ${formatNumber(round(q, 4))} ÷ ${formatNumber(round(r, 4))} = ${formatNumber(round(y))}: the reserve lasts ${formatNumber(round(y))} years if use stays the same.`
          : 'Type the reserve and the use each year to cut the bar.'}
      </Caption>
    </View>
  );
}
