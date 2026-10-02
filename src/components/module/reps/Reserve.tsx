import { View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { ReserveSpec } from '@/data/modules/typesHs2f';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import { HaloText } from '../layouts/earthKit';
import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { growthLifetime, usedBy } from './reserveGrowth';

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
  if (spec.growth !== undefined) return <ReserveGrowth spec={spec} calc={calc} />;
  return <ReserveSteady spec={spec} calc={calc} />;
}

function ReserveSteady({ spec, calc }: { spec: ReserveSpec; calc: Calculator }) {
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

const GW = 360;
const GH = 246;
const GROW_TOP = 64;
const GROW_H = 34;
const STEADY_TOP = 146;
const STEADY_H = 22;
const TIME = 206;

/**
 * The reserve when use grows by g% a year (ReserveSpec `growth`, H115): the bar cut into each
 * year's use, every slice larger than the last, empty after T years; under it the same reserve
 * at steady use, empty after Q ÷ r years; and a years line marking both.
 */
function ReserveGrowth({ spec, calc }: { spec: ReserveSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (x: number | string | undefined, d: number) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) =>
    x === undefined || typeof x === 'number' || rep.known(x);
  const named = (x: number | string) => (typeof x === 'string' ? rep.named(x) : formatNumber(x));
  const sym = (x: number | string | undefined) =>
    typeof x === 'string' ? `${rep.variable(x).symbol} = ` : '';
  const q = Math.max(0, num(spec.reserve, 600));
  const r = Math.max(0, num(spec.rate, 15));
  const g = Math.max(0, num(spec.growth, 2));
  const on = known(spec.reserve) && known(spec.rate) && known(spec.growth) && q > 0 && r > 0;
  const y = r > 0 ? q / r : 0;
  const T = r > 0 ? growthLifetime(q, r, g) : 0;
  // Bars are amounts (the reserve's length); the years line runs to the longer lifetime, y.
  const A = (amount: number) => X0 + (q > 0 ? (amount / q) * (X1 - X0) : 0);
  const Y = (years: number) => X0 + (y > 0 ? (years / y) * (X1 - X0) : 0);
  // Each year's cut while its slice is at least 3 px wide (later, larger slices show first).
  const growCuts: number[] = [];
  for (let i = 1; i < Math.min(Math.ceil(T - 1e-9), 20000); i++) {
    if (A(usedBy(r, g, i)) - A(usedBy(r, g, i - 1)) >= 3) growCuts.push(A(usedBy(r, g, i)));
  }
  const slice = y > 0 ? (X1 - X0) / y : 0;
  const steadyCuts =
    slice >= 3
      ? Array.from({ length: Math.max(0, Math.ceil(y - 1e-9) - 1) }, (_, i) => X0 + (i + 1) * slice)
      : [];
  const first = Math.min(X1, A(usedBy(r, g, 1)));
  const step = y > 0 ? Math.max(1, tickStep(y, 6)) : 1;
  const ticks = Array.from({ length: Math.floor(y / step + 1e-9) + 1 }, (_, i) => i * step).filter(
    (t) => Math.abs(Y(t) - Y(T)) > 30 && Y(y) - Y(t) > 30,
  );
  const unit = typeof spec.reserve === 'string' ? rep.unit(spec.reserve) : undefined;
  const gText = `${formatNumber(round(g, 4))}%`;

  const bar = (top: number, h: number, cuts: number[], lit: boolean) => (
    <G>
      <Rect x={X0} y={top} width={X1 - X0} height={h} fill={c.chartSecond} rx={3} />
      {lit && <Rect x={X0} y={top} width={first - X0} height={h} fill={c.chartHighlight} rx={2} />}
      {cuts.map((x, i) => (
        <Line key={i} x1={x} y1={top} x2={x} y2={top + h} stroke={c.card} strokeWidth={1.2} />
      ))}
      <Rect
        x={X0}
        y={top}
        width={X1 - X0}
        height={h}
        fill="none"
        stroke={c.chartInk}
        strokeWidth={1.2}
        rx={3}
      />
    </G>
  );

  return (
    <View>
      <Canvas aspect={GH / GW}>
        {({ w, h }) => {
          const k = w / GW;
          return (
            <Svg width={w} height={h}>
              <G transform={`scale(${k})`} opacity={on ? 1 : 0.4}>
                <Path
                  d={`M ${X0} 36 v -8 H ${X1} v 8`}
                  stroke={c.chartInk}
                  strokeWidth={1.5}
                  fill="none"
                />
                <HaloText
                  x={(X0 + X1) / 2}
                  y={22}
                  text={`reserve ${named(spec.reserve)}`}
                  c={c}
                  size={chart.value}
                  bold
                />
                {/* Use that grows: each year's slice larger than the last. */}
                {bar(GROW_TOP, GROW_H, growCuts, true)}
                <HaloText
                  x={Math.min(first + 6, X1 - 120)}
                  y={GROW_TOP + GROW_H / 2 + 5}
                  text={named(spec.rate)}
                  c={c}
                  size={chart.label}
                  bold
                  anchor="start"
                />
                <ChartText x={X0} y={GROW_TOP - 7} fontSize={chart.label} fill={c.chartMuted}>
                  {`use grows ${gText} a year`}
                </ChartText>
                <HaloText
                  x={X1}
                  y={GROW_TOP + GROW_H + 18}
                  text={`empty after ${sym(spec.lasts)}${formatNumber(round(T))} years`}
                  c={c}
                  size={chart.value}
                  bold
                  fill={c.chartHighlight}
                  anchor="end"
                />
                {/* The same reserve if use stays at r, for comparison. */}
                {bar(STEADY_TOP, STEADY_H, steadyCuts, false)}
                <ChartText x={X0} y={STEADY_TOP - 7} fontSize={chart.label} fill={c.chartMuted}>
                  if use stays the same
                </ChartText>
                <ChartText
                  x={X1}
                  y={STEADY_TOP + STEADY_H + 16}
                  fontSize={chart.label}
                  textAnchor="end"
                  fill={c.chartInk}
                >
                  {`empty after ${sym(spec.years)}${formatNumber(round(y))} years`}
                </ChartText>
                {/* Years from now: T, the growing use's end, beside Q ÷ r. */}
                <Line x1={X0} y1={TIME} x2={X1} y2={TIME} stroke={c.chartMuted} strokeWidth={1.5} />
                <Line
                  x1={X0}
                  y1={TIME}
                  x2={Y(T)}
                  y2={TIME}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.strokeHeavy}
                />
                {ticks.map((t) => (
                  <G key={t}>
                    <Line x1={Y(t)} y1={TIME} x2={Y(t)} y2={TIME + 5} stroke={c.chartInk} />
                    <ChartText
                      x={Y(t)}
                      y={TIME + 18}
                      fontSize={chart.label}
                      textAnchor="middle"
                      fill={c.chartMuted}
                    >
                      {formatNumber(t)}
                    </ChartText>
                  </G>
                ))}
                <Line
                  x1={Y(T)}
                  y1={TIME - 8}
                  x2={Y(T)}
                  y2={TIME + 6}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.stroke}
                />
                <HaloText
                  x={Math.max(X0 + 14, Y(T))}
                  y={TIME + 19}
                  text={formatNumber(round(T))}
                  c={c}
                  size={chart.label}
                  bold
                  fill={c.chartHighlight}
                />
                <Line
                  x1={X1}
                  y1={TIME - 8}
                  x2={X1}
                  y2={TIME + 6}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                <HaloText
                  x={X1}
                  y={TIME + 19}
                  text={formatNumber(round(y))}
                  c={c}
                  size={chart.label}
                  bold
                  anchor="end"
                />
                <ChartText x={X0} y={TIME + 38} fontSize={chart.label} fill={c.chartMuted}>
                  Years from now
                </ChartText>
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {on
          ? `Each slice is one year’s use, starting at ${formatNumber(round(r, 4))}${unit ? ` ${unit}` : ''} and growing ${gText} a year, so each is larger than the last. The reserve runs out after ${formatNumber(round(T))} years, against ${formatNumber(round(y))} if use stays the same.`
          : 'Type the reserve, the use this year and its growth to cut the bar.'}
      </Caption>
    </View>
  );
}
