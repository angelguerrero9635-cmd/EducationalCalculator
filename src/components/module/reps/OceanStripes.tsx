import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { StripesSpec } from '@/data/modules/typesHs2f';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import { HaloText } from '../layouts/earthKit';
import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { CHRON_RECORD, NORMAL_CHRONS, STRIPE_RECORD, stripeWindow } from './earthModelHs2f';

const BW = 360;
const BH = 300;
const CX = 180;
/** Half the map's width, px. */
const HALF = 168;
const TOP = 48;
const BOTTOM = 178;

/** A tick step of 1, 2 or 5 × 10ⁿ giving at most `most` steps over `span`. */
const tickStep = (span: number, most: number) => {
  const raw = span / most;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
};

const round = (x: number, places = 2) => Number(x.toFixed(places));

/** A mid-ocean ridge from above with its magnetic stripes (see `StripesSpec`). */
export function OceanStripes({ spec, calc }: { spec: StripesSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (x: number | string | undefined, d: number) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) =>
    x === undefined || typeof x === 'number' || rep.known(x);
  const text = (x: number | string, unit = true) =>
    typeof x === 'number' ? formatNumber(x) : rep.value(x, unit);
  const km = Math.max(0, num(spec.distance, 100));
  const age = Math.max(0, Math.min(STRIPE_RECORD, num(spec.age, 4)));
  const on = known(spec.distance) && known(spec.age) && age > 0;
  // The half rate: the page's, or the rock's distance over its age.
  const v =
    spec.rate !== undefined && known(spec.rate)
      ? num(spec.rate, 25)
      : age > 0
        ? km / age
        : num(spec.rate, 25);
  const span = stripeWindow(age);
  // Past the chron record the seafloor is hatched: striped too, but not drawn here.
  const hatched = span > CHRON_RECORD;
  const A = (a: number, side: 1 | -1) => CX + side * (a / span) * HALF;
  const kmSpan = v * span;
  const ageStep = tickStep(span, 3);
  const ageTicks = Array.from({ length: Math.floor(span / ageStep + 1e-9) + 1 }, (_, i) =>
    round(i * ageStep, 4),
  );
  const kmStep = kmSpan > 0 ? tickStep(kmSpan, 3) : 1;
  const kmTicks =
    kmSpan > 0
      ? Array.from({ length: Math.floor(kmSpan / kmStep + 1e-9) + 1 }, (_, i) => i * kmStep)
      : [0];
  const rx = A(age, 1);
  const lx = A(age, -1);
  const midY = (TOP + BOTTOM) / 2;
  const rateText = formatNumber(round(v, 2));
  const fullText = formatNumber(round(2 * v, 2));
  // The rift: a narrow zigzag down the ridge's crest.
  const rift = Array.from({ length: 14 }, (_, i) => {
    const y = TOP + (i * (BOTTOM - TOP)) / 13;
    return `${i ? 'L' : 'M'} ${CX + (i % 2 ? 2 : -2)} ${y.toFixed(1)}`;
  }).join(' ');

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => {
          const k = w / BW;
          return (
            <Svg width={w} height={h}>
              <G transform={`scale(${k})`}>
                <ChartText
                  x={CX}
                  y={16}
                  fontSize={chart.label}
                  textAnchor="middle"
                  fill={c.chartMuted}
                >
                  Age of the seafloor, million years
                </ChartText>
                {/* The seafloor from above: reversed rock, then the normal stripes both sides. */}
                <Rect
                  x={CX - HALF}
                  y={TOP}
                  width={2 * HALF}
                  height={BOTTOM - TOP}
                  fill={c.magReversed}
                />
                {NORMAL_CHRONS.filter(([a]) => a < span).map(([a, b]) =>
                  ([1, -1] as const).map((side) => {
                    const x0 = A(a, side);
                    const x1 = A(Math.min(b, span), side);
                    return (
                      <Rect
                        key={`${a}${side}`}
                        x={Math.min(x0, x1)}
                        y={TOP}
                        width={Math.abs(x1 - x0)}
                        height={BOTTOM - TOP}
                        fill={c.magNormal}
                      />
                    );
                  }),
                )}
                {hatched &&
                  ([1, -1] as const).map((side) => {
                    const x0 = A(CHRON_RECORD, side);
                    const x1 = A(span, side);
                    const lo = Math.min(x0, x1);
                    const wide = Math.abs(x1 - x0);
                    const n = Math.ceil((wide + (BOTTOM - TOP)) / 8);
                    return (
                      <G key={`h${side}`}>
                        <Rect x={lo} y={TOP} width={wide} height={BOTTOM - TOP} fill={c.card} />
                        {Array.from({ length: n }, (_, i) => {
                          // Diagonals from the bottom edge up and right, clipped to the band.
                          const bx = lo - (BOTTOM - TOP) + i * 8;
                          const [sx, sy] = bx < lo ? [lo, BOTTOM - (lo - bx)] : [bx, BOTTOM];
                          const ex = Math.min(lo + wide, bx + (BOTTOM - TOP));
                          const ey = BOTTOM - (ex - bx);
                          return ex > sx ? (
                            <Line
                              key={i}
                              x1={sx}
                              y1={sy}
                              x2={ex}
                              y2={ey}
                              stroke={c.chartGrid}
                              strokeWidth={1}
                            />
                          ) : null;
                        })}
                      </G>
                    );
                  })}
                <Rect
                  x={CX - HALF}
                  y={TOP}
                  width={2 * HALF}
                  height={BOTTOM - TOP}
                  fill="none"
                  stroke={c.chartInk}
                  strokeWidth={1}
                />
                <Path d={rift} stroke={c.landLava} strokeWidth={3} fill="none" />
                {/* Ages along the top, mirrored. */}
                {ageTicks.flatMap((a) =>
                  ([1, -1] as const)
                    .filter((side) => side === 1 || a > 0)
                    .map((side) => (
                      <G key={`a${a}${side}`}>
                        <Line
                          x1={A(a, side)}
                          y1={TOP - 5}
                          x2={A(a, side)}
                          y2={TOP}
                          stroke={c.chartInk}
                        />
                        <ChartText
                          x={A(a, side)}
                          y={TOP - 9}
                          fontSize={chart.label}
                          textAnchor="middle"
                          fill={c.chartMuted}
                        >
                          {formatNumber(a)}
                        </ChartText>
                      </G>
                    )),
                )}
                {/* Kilometres from the ridge along the bottom. */}
                {kmTicks.flatMap((d) =>
                  ([1, -1] as const)
                    .filter((side) => side === 1 || d > 0)
                    .map((side) => {
                      const x = CX + side * (kmSpan > 0 ? (d / kmSpan) * HALF : 0);
                      return (
                        <G key={`k${d}${side}`}>
                          <Line x1={x} y1={BOTTOM} x2={x} y2={BOTTOM + 5} stroke={c.chartInk} />
                          <ChartText
                            x={x}
                            y={BOTTOM + 18}
                            fontSize={chart.label}
                            textAnchor="middle"
                            fill={c.chartMuted}
                          >
                            {formatNumber(d)}
                          </ChartText>
                        </G>
                      );
                    }),
                )}
                <ChartText
                  x={CX}
                  y={BOTTOM + 34}
                  fontSize={chart.label}
                  textAnchor="middle"
                  fill={c.chartMuted}
                >
                  Distance from the ridge, km
                </ChartText>
                {/* The rock: its distance bracketed from the ridge, its twin across it. */}
                <G opacity={on ? 1 : 0.4}>
                  <Path
                    d={`M ${CX} ${midY - 20} H ${rx} M ${CX} ${midY - 26} V ${midY - 14} M ${rx} ${midY - 26} V ${midY - 14}`}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                    fill="none"
                  />
                  <HaloText
                    x={Math.max(CX + 50, Math.min(CX + HALF - 50, (CX + rx) / 2))}
                    y={midY - 32}
                    text={
                      typeof spec.distance === 'string'
                        ? rep.named(spec.distance)
                        : `${formatNumber(km)} km`
                    }
                    c={c}
                    size={chart.value}
                    bold
                    fill={c.chartHighlight}
                  />
                  <Line
                    x1={lx}
                    y1={midY + 8}
                    x2={rx}
                    y2={midY + 8}
                    stroke={c.chartHighlight}
                    strokeWidth={1}
                    strokeDasharray={chart.dash}
                  />
                  <Circle
                    cx={rx}
                    cy={midY + 8}
                    r={7}
                    fill={c.chartHighlight}
                    stroke={c.card}
                    strokeWidth={2}
                  />
                  <Circle
                    cx={lx}
                    cy={midY + 8}
                    r={7}
                    fill={c.card}
                    stroke={c.chartHighlight}
                    strokeWidth={2.5}
                  />
                  <HaloText
                    x={Math.min(CX + HALF - 50, Math.max(CX + 50, rx))}
                    y={midY + 34}
                    text={
                      typeof spec.age === 'string'
                        ? `${rep.variable(spec.age).symbol} = ${text(spec.age, false)} million years`
                        : `${formatNumber(age)} million years`
                    }
                    c={c}
                    size={chart.label}
                    bold
                    fill={c.chartHighlight}
                  />
                  <HaloText
                    x={Math.max(CX - HALF + 40, Math.min(CX - 40, lx))}
                    y={midY + 34}
                    text="same age"
                    c={c}
                    size={chart.label}
                    fill={c.chartHighlight}
                  />
                </G>
                {/* The plates move apart, each at the half rate. */}
                {([-1, 1] as const).map((side) => (
                  <G key={`p${side}`} opacity={on ? 1 : 0.4}>
                    <Path
                      d={`M ${CX + side * 12} 236 H ${CX + side * 60} M ${CX + side * 52} 230 L ${CX + side * 60} 236 L ${CX + side * 52} 242`}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                      fill="none"
                    />
                    <ChartText
                      x={CX + side * 66}
                      y={241}
                      fontSize={chart.label}
                      textAnchor={side === 1 ? 'start' : 'end'}
                    >
                      {`${rateText} mm/yr`}
                    </ChartText>
                  </G>
                ))}
                {/* The key. */}
                {(
                  [
                    ['normal polarity (as today)', c.magNormal, 12],
                    ['reversed', c.magReversed, 230],
                  ] as const
                ).map(([name, col, x]) => (
                  <G key={name}>
                    <Rect
                      x={x}
                      y={266}
                      width={14}
                      height={14}
                      rx={2}
                      fill={col}
                      stroke={c.chartInk}
                      strokeWidth={0.8}
                    />
                    <ChartText x={x + 20} y={278} fontSize={chart.label}>
                      {name}
                    </ChartText>
                  </G>
                ))}
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {on
          ? `The rock ${formatNumber(round(km, 2))} km from the ridge is ${formatNumber(round(age, 2))} million years old: the plate moved ${formatNumber(round(km, 2))} ÷ ${formatNumber(round(age, 2))} = ${rateText} km per million years, ${rateText} mm a year. The two plates part at 2 × ${rateText} = ${fullText} mm a year. The stripes match on both sides: rock cooling at the ridge records the field of its time.${hatched ? ` Stripes are drawn for the last ${CHRON_RECORD} million years; the hatched, older seafloor is striped too.` : ''}`
          : 'Type the rock’s distance and age to place it.'}
      </Caption>
    </View>
  );
}
