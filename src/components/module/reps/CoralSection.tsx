import { View } from 'react-native';
import Svg, { Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { CoralSectionSpec } from '@/data/modules/typesHs3c';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import { HaloText } from '../layouts/earthKit';
import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Sheen, url, usePaintIds } from './paint';
import { lineStride, YEAR_HOURS } from './spaceHs3c';

const BW = 356;
const BH = 318;
/** The coral from its pointed first growth (X0) to the cup (X1). */
const X0 = 20;
const X1 = 318;
const CY = 92;
/** The day-length bars: 0 hours at B0, 25 at B1. */
const B0 = 64;
const B1 = 340;
const BAR_Y = 234;

const round = (x: number, places = 2) => Number(x.toFixed(places));
/** Share of the way along the coral, 0 at the tip. */
const along = (x: number) => (x - X0) / (X1 - X0);
/** The coral's half-width at x, and its centre line (the tip curls down a little). */
const half = (x: number) => 5 + 43 * along(x) ** 0.8;
const mid = (x: number) => CY + 12 * (1 - along(x)) ** 2;
const top = (x: number) => mid(x) - half(x);
const bottom = (x: number) => mid(x) + half(x);
/** A growth line across the wall at x, bowed toward the cup. */
const ridge = (x: number) =>
  `M ${x.toFixed(2)} ${top(x).toFixed(2)} Q ${(x + half(x) * 0.45).toFixed(2)} ${mid(x).toFixed(2)} ${x.toFixed(2)} ${bottom(x).toFixed(2)}`;
/** The wall between two growth lines, as one shape. */
const slab = (xa: number, xb: number) => {
  const xs = Array.from({ length: 13 }, (_, i) => xa + ((xb - xa) * i) / 12);
  const up = xs.map((x) => `L ${x.toFixed(2)} ${top(x).toFixed(2)}`).join(' ');
  const down = [...xs]
    .reverse()
    .map((x) => `L ${x.toFixed(2)} ${bottom(x).toFixed(2)}`)
    .join(' ');
  return `M ${xa.toFixed(2)} ${top(xa).toFixed(2)} ${up} Q ${(xb + half(xb) * 0.45).toFixed(2)} ${mid(xb).toFixed(2)} ${xb.toFixed(2)} ${bottom(xb).toFixed(2)} ${down} Q ${(xa + half(xa) * 0.45).toFixed(2)} ${mid(xa).toFixed(2)} ${xa.toFixed(2)} ${top(xa).toFixed(2)} Z`;
};

/** A fossil coral's daily lines and yearly bands, and the day's length then (CoralSectionSpec). */
export function CoralSection({ spec, calc }: { spec: CoralSectionSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('wall');
  const known = (x: number | string | undefined) =>
    x !== undefined && (typeof x === 'number' || rep.known(x));
  const num = (x: number | string) => (typeof x === 'number' ? x : rep.val(x));
  const year = spec.yearHours ?? YEAR_HOURS;
  // Counts are usually whole, but a page may work one out: a part band is drawn as a part.
  const n = Math.max(1, num(spec.lines));
  const b = Math.max(0.1, Math.min(10, num(spec.bands)));
  const whole = Math.ceil(b - 1e-9);
  const on = known(spec.lines) && known(spec.bands);
  const N = n / b;
  const D = year / N;
  const k = lineStride(n, X1 - X0);
  const X = (i: number) => X0 + (i / n) * (X1 - X0);
  const bandW = (X1 - X0) / b;
  const H = (hours: number) => B0 + (hours / 25) * (B1 - B0);
  const nText =
    typeof spec.lines === 'string' ? rep.named(spec.lines) : `n = ${formatNumber(round(n))}`;
  const bText =
    typeof spec.bands === 'string' ? rep.named(spec.bands) : `b = ${formatNumber(round(b))}`;
  const NText =
    typeof spec.days === 'string' && rep.known(spec.days)
      ? rep.named(spec.days)
      : `N = ${formatNumber(round(N))} days`;
  const DText =
    typeof spec.day === 'string' && rep.known(spec.day)
      ? rep.named(spec.day)
      : `D = ${formatNumber(round(D, 3))} hours`;
  const outline = `M ${X0} ${top(X0)} ${Array.from({ length: 41 }, (_, i) => {
    const x = X0 + ((X1 - X0) * i) / 40;
    return `L ${x.toFixed(2)} ${top(x).toFixed(2)}`;
  }).join(' ')} L ${X1} ${bottom(X1)} ${Array.from({ length: 41 }, (_, i) => {
    const x = X1 - ((X1 - X0) * i) / 40;
    return `L ${x.toFixed(2)} ${bottom(x).toFixed(2)}`;
  }).join(' ')} Q ${X0 - 6} ${mid(X0)} ${X0} ${top(X0)} Z`;

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <Sheen id={ids.wall} vertical />
            </Defs>
            <G transform={`scale(${w / BW})`}>
              <G opacity={on ? 1 : 0.4}>
                {/* The coral's wall, lit from above, every other yearly band a shade darker. */}
                <Path d={outline} fill={c.coralFossil} />
                {Array.from({ length: whole }, (_, j) =>
                  j % 2 ? (
                    <Path
                      key={j}
                      d={slab(X0 + j * bandW, Math.min(X1, X0 + (j + 1) * bandW))}
                      fill={c.coralGroove}
                      opacity={0.16}
                    />
                  ) : null,
                )}
                <Path d={outline} fill={url(ids.wall)} />
                {/* The daily growth lines (every k-th when they would crowd). */}
                {Array.from({ length: Math.floor((n - 1e-9) / k) }, (_, i) => (i + 1) * k).map(
                  (i) => (
                    <Path
                      key={i}
                      d={ridge(X(i))}
                      stroke={c.coralRidge}
                      strokeWidth={0.8}
                      fill="none"
                    />
                  ),
                )}
                {/* The yearly grooves between bands. */}
                {Array.from({ length: whole - 1 }, (_, j) => (
                  <Path
                    key={j}
                    d={ridge(X0 + (j + 1) * bandW)}
                    stroke={c.coralGroove}
                    strokeWidth={2.4}
                    fill="none"
                  />
                ))}
                <Path d={outline} fill="none" stroke={c.coralGroove} strokeWidth={1.2} />
                {/* The cup at the growing end, with its radial walls (septa). */}
                <Ellipse
                  cx={X1}
                  cy={mid(X1)}
                  rx={11}
                  ry={half(X1)}
                  fill={c.coralFossil}
                  stroke={c.coralGroove}
                  strokeWidth={1.2}
                />
                <Ellipse
                  cx={X1}
                  cy={mid(X1)}
                  rx={7}
                  ry={half(X1) - 5}
                  fill={c.coralGroove}
                  opacity={0.35}
                />
                {Array.from({ length: 12 }, (_, i) => {
                  const a = (i / 12) * 2 * Math.PI;
                  return (
                    <Line
                      key={i}
                      x1={X1}
                      y1={mid(X1)}
                      x2={X1 + 7 * Math.cos(a)}
                      y2={mid(X1) + (half(X1) - 5) * Math.sin(a)}
                      stroke={c.coralGroove}
                      strokeWidth={0.8}
                    />
                  );
                })}
                {/* Each band is a year. */}
                {bandW >= 22
                  ? Array.from({ length: whole }, (_, j) => {
                      const x = X0 + (j + 0.5) * bandW;
                      if (X0 + (j + 1) * bandW > X1 + 1e-6) return null;
                      return (
                        <ChartText
                          key={j}
                          x={x}
                          y={Math.min(top(X0 + j * bandW), top(x)) - 8}
                          fontSize={chart.label}
                          textAnchor="middle"
                          fill={c.chartMuted}
                        >
                          {bandW >= 56 ? `year ${j + 1}` : String(j + 1)}
                        </ChartText>
                      );
                    })
                  : null}
              </G>
              {/* The count, bracketed under the coral. */}
              <Path
                d={`M ${X0} 150 v 7 H ${X1} v -7`}
                stroke={c.chartInk}
                strokeWidth={1.5}
                fill="none"
              />
              <ChartText
                x={(X0 + X1) / 2}
                y={176}
                fontSize={chart.value}
                textAnchor="middle"
                fontWeight="700"
              >
                {`${nText} across ${bText}`}
              </ChartText>
              <ChartText x={(X0 + X1) / 2} y={194} fontSize={chart.label} textAnchor="middle">
                {`Each band is one year of ${NText}`}
              </ChartText>
              {k > 1 ? (
                <ChartText
                  x={(X0 + X1) / 2}
                  y={211}
                  fontSize={chart.label}
                  textAnchor="middle"
                  fill={c.chartMuted}
                >
                  {`Too fine to draw each: every ${k}th line is shown.`}
                </ChartText>
              ) : null}
              {/* The day's length then, beside today's 24 hours. */}
              {(
                [
                  ['Today', 24, '24 hours', c.chartFill, c.chartInk, BAR_Y],
                  ['Then', D, DText, c.chartHighlight, c.onChartHighlight, BAR_Y + 28],
                ] as const
              ).map(([name, hours, text, fill, ink, y]) => (
                <G key={name} opacity={name === 'Then' && !on ? 0.4 : 1}>
                  <ChartText x={12} y={y + 13} fontSize={chart.label} fontWeight="700">
                    {name}
                  </ChartText>
                  <Rect
                    x={B0}
                    y={y}
                    width={H(Math.min(25, hours)) - B0}
                    height={18}
                    rx={3}
                    fill={fill}
                    stroke={c.chartInk}
                    strokeWidth={0.8}
                  />
                  <HaloText
                    x={H(Math.min(25, hours)) - 6}
                    y={y + 13.5}
                    text={text}
                    c={c}
                    size={chart.label}
                    bold
                    anchor="end"
                    fill={ink}
                    halo={fill}
                  />
                </G>
              ))}
              <Line x1={B0} y1={BAR_Y + 54} x2={B1} y2={BAR_Y + 54} stroke={c.chartInk} />
              {[0, 4, 8, 12, 16, 20, 24].map((t) => (
                <G key={t}>
                  <Line x1={H(t)} y1={BAR_Y + 54} x2={H(t)} y2={BAR_Y + 59} stroke={c.chartInk} />
                  <ChartText
                    x={H(t)}
                    y={BAR_Y + 72}
                    fontSize={chart.label}
                    textAnchor="middle"
                    fill={c.chartMuted}
                  >
                    {String(t)}
                  </ChartText>
                </G>
              ))}
              <ChartText x={12} y={BAR_Y + 72} fontSize={chart.label} fill={c.chartMuted}>
                hours
              </ChartText>
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>
        {on
          ? `${formatNumber(round(n))} daily lines across ${formatNumber(round(b))} yearly bands: ${formatNumber(round(n))} ÷ ${formatNumber(round(b))} = ${formatNumber(round(N))} days in a year. A year is still ${formatNumber(year)} hours, so each day lasted ${formatNumber(year)} ÷ ${formatNumber(round(N))} = ${formatNumber(round(D, 3))} hours.`
          : 'Type the daily lines counted and the yearly bands they cross.'}
      </Caption>
    </View>
  );
}
