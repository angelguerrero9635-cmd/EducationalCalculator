import { useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { HrDiagramSpec } from '@/data/modules/typesHsl';
import { formatNumber } from '@/engine/format';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useRep } from './common';
import {
  classifyStar,
  HR_WINDOW,
  luminosityOf,
  MAIN_SEQUENCE,
  radiusOf,
  SUN_T,
} from './earthModel';
import { url, usePaintIds } from './paint';

const BW = 360;
const BH = 318;
const L = 52;
const R = 352;
const TOP = 12;
const BASE = 272;
const lt = (t: number) => Math.log10(t);
const LT_HOT = lt(HR_WINDOW.tHot);
const LT_COOL = lt(HR_WINDOW.tCool);
export const X = (t: number) => L + ((LT_HOT - lt(t)) / (LT_HOT - LT_COOL)) * (R - L);
export const Y = (l: number) => BASE - ((Math.log10(l) + 4) / 10) * (BASE - TOP);
const tOf = (x: number) => 10 ** (LT_HOT - ((x - L) / (R - L)) * (LT_HOT - LT_COOL));
const lOf = (y: number) => 10 ** (((BASE - y) / (BASE - TOP)) * 10 - 4);

/** A star's color by its surface temperature: blue-white when hot, red when cool. */
export function starColor(c: Palette, t: number) {
  return t >= 10000
    ? c.starBlue
    : t >= 7500
      ? c.starWhite
      : t >= 5000
        ? c.starYellow
        : t >= 3700
          ? c.starOrange
          : c.starRed;
}

const POW = ['⁻⁴', '⁻²', '', '²', '⁴', '⁶'];

/** "10⁴" and friends; 1 for 10⁰. */
const tenTo = (i: number) => (i === 2 ? '1' : `10${POW[i]}`);

/**
 * The H–R diagram (see `HrDiagramSpec`): a dark sky-like plot, temperature falling to the right
 * and luminosity up on log scales, the regions where stars gather, lines of equal radius, the Sun,
 * and the star from the values in its own color.
 */
export function HrDiagram({
  spec,
  calc,
  extra,
  caption,
}: {
  spec: HrDiagramSpec;
  calc: Calculator;
  /** Drawn over the plot in its coordinates (X, Y), before the star (H103: the mass marks). */
  extra?: ReactNode;
  /** A caption in place of the star's own (H103: the lifetime by mass). */
  caption?: string;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('clip');
  const start = useRef({ x: 0, y: 0 });
  const w = HR_WINDOW;
  const val = (x: number | string, d: number) =>
    typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : d;
  const known = (x: number | string | undefined) =>
    x === undefined || typeof x === 'number' || rep.known(x);
  const t = Math.min(w.tHot, Math.max(w.tCool, val(spec.temperature, SUN_T)));
  const l = Math.min(w.lHigh, Math.max(w.lLow, val(spec.luminosity, 1)));
  const on = known(spec.temperature) && known(spec.luminosity);
  const kind = classifyStar(t, l);
  const ms = MAIN_SEQUENCE.map(
    ([a, b], i) => `${i ? 'L' : 'M'} ${X(a).toFixed(1)} ${Y(b).toFixed(1)}`,
  ).join(' ');
  const radiusLine = (r: number) =>
    `M ${X(w.tHot)} ${Y(luminosityOf(r, w.tHot))} L ${X(w.tCool)} ${Y(luminosityOf(r, w.tCool))}`;
  const ink = c.moonLit;
  const tid = typeof spec.temperature === 'string' ? spec.temperature : undefined;
  const lid = typeof spec.luminosity === 'string' ? spec.luminosity : undefined;
  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w: cw, h }) => {
          const k = cw / BW;
          return (
            <>
              <Svg width={cw} height={h}>
                <Defs>
                  <ClipPath id={ids.clip}>
                    <Rect x={L} y={TOP} width={R - L} height={BASE - TOP} />
                  </ClipPath>
                </Defs>
                <G transform={`scale(${k})`}>
                  <Rect x={L} y={TOP} width={R - L} height={BASE - TOP} fill={c.space} />
                  <G clipPath={url(ids.clip)}>
                    {/* Supergiants across the top, giants to the upper right, white dwarfs below. */}
                    <Rect
                      x={X(30000)}
                      y={Y(1e6)}
                      width={X(3200) - X(30000)}
                      height={Y(1e4) - Y(1e6)}
                      rx={14}
                      fill={ink}
                      opacity={0.12}
                    />
                    <Ellipse cx={X(4600)} cy={Y(150)} rx={40} ry={34} fill={ink} opacity={0.14} />
                    <Ellipse
                      cx={X(12000)}
                      cy={Y(0.004)}
                      rx={52}
                      ry={15}
                      fill={ink}
                      opacity={0.14}
                      transform={`rotate(24 ${X(12000)} ${Y(0.004)})`}
                    />
                    <Path
                      d={ms}
                      stroke={ink}
                      strokeOpacity={0.16}
                      strokeWidth={26}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    {[0.01, 1, 100].map((r) => (
                      <Path
                        key={r}
                        d={radiusLine(r)}
                        stroke={ink}
                        strokeOpacity={0.45}
                        strokeWidth={1}
                        strokeDasharray={chart.dash}
                      />
                    ))}
                  </G>
                  {/* Region names. */}
                  <ChartText
                    x={X(9000)}
                    y={Y(1e5) + 4}
                    fontSize={chart.label}
                    fontWeight="700"
                    textAnchor="middle"
                    fill={ink}
                  >
                    supergiants
                  </ChartText>
                  <ChartText
                    x={X(4600)}
                    y={Y(150) + 4}
                    fontSize={chart.label}
                    fontWeight="700"
                    textAnchor="middle"
                    fill={ink}
                  >
                    giants
                  </ChartText>
                  <ChartText
                    x={X(34000)}
                    y={Y(0.0012) + 16}
                    fontSize={chart.label}
                    fontWeight="700"
                    textAnchor="start"
                    fill={ink}
                  >
                    white dwarfs
                  </ChartText>
                  <ChartText
                    x={X(16000)}
                    y={Y(60) + 16}
                    fontSize={chart.label}
                    fontWeight="700"
                    textAnchor="middle"
                    fill={ink}
                    transform={`rotate(33 ${X(16000)} ${Y(60) + 16})`}
                  >
                    main sequence
                  </ChartText>
                  {[0.01, 1, 100].map((r) => {
                    // Each radius line's label where it leaves the right or bottom edge.
                    const edge = w.tCool * 1.12;
                    const tl =
                      luminosityOf(r, edge) < 2.2e-4 ? SUN_T * (2.2e-4 / (r * r)) ** 0.25 : edge;
                    const ll = luminosityOf(r, tl);
                    if (ll < w.lLow || ll > w.lHigh) return null;
                    return (
                      <ChartText
                        key={r}
                        x={X(tl) - 2}
                        y={Y(ll) - 5}
                        fontSize={chart.label}
                        textAnchor="end"
                        fill={ink}
                        opacity={0.8}
                      >
                        {`${formatNumber(r)} R☉`}
                      </ChartText>
                    );
                  })}
                  {/* The Sun. */}
                  <Circle
                    cx={X(SUN_T)}
                    cy={Y(1)}
                    r={5}
                    fill={c.starYellow}
                    stroke={c.space}
                    strokeWidth={1}
                  />
                  <Circle cx={X(SUN_T)} cy={Y(1)} r={1.5} fill={c.space} />
                  <ChartText x={X(SUN_T) + 8} y={Y(1) + 14} fontSize={chart.label} fill={ink}>
                    Sun
                  </ChartText>
                  {/* Axes. */}
                  {[40000, 20000, 10000, 5000, 2500].map((v) => (
                    <G key={v}>
                      <Line x1={X(v)} y1={BASE} x2={X(v)} y2={BASE + 4} stroke={c.chartInk} />
                      <ChartText
                        x={X(v)}
                        y={BASE + 16}
                        fontSize={chart.label}
                        textAnchor={v === 40000 ? 'start' : v === 2500 ? 'end' : 'middle'}
                        fill={c.chartMuted}
                      >
                        {formatNumber(v)}
                      </ChartText>
                    </G>
                  ))}
                  {POW.map((_, i) => (
                    <ChartText
                      key={i}
                      x={L - 5}
                      y={Y(10 ** (2 * i - 4)) + 4}
                      fontSize={chart.label}
                      textAnchor="end"
                      fill={c.chartMuted}
                    >
                      {tenTo(i)}
                    </ChartText>
                  ))}
                  {/* A band of star colors under the temperature axis. */}
                  {[36000, 14000, 8500, 6200, 4300, 3000].map((v, i, all) => {
                    const x0 = i === 0 ? L : (X(v) + X(all[i - 1]!)) / 2;
                    const x1 = i === all.length - 1 ? R : (X(v) + X(all[i + 1]!)) / 2;
                    return (
                      <Rect
                        key={v}
                        x={x0}
                        y={BASE + 22}
                        width={x1 - x0}
                        height={5}
                        fill={starColor(c, v)}
                      />
                    );
                  })}
                  <ChartText
                    x={(L + R) / 2}
                    y={BH - 6}
                    fontSize={chart.label}
                    textAnchor="middle"
                    fill={c.chartMuted}
                  >
                    Surface temperature (K): hot on the left
                  </ChartText>
                  <ChartText
                    x={10}
                    y={(TOP + BASE) / 2}
                    fontSize={chart.label}
                    textAnchor="middle"
                    fill={c.chartMuted}
                    transform={`rotate(-90 10 ${(TOP + BASE) / 2})`}
                  >
                    Luminosity (Sun = 1)
                  </ChartText>
                  {extra}
                  {/* The star. */}
                  <G opacity={on ? 1 : 0.4}>
                    <Circle cx={X(t)} cy={Y(l)} r={11} fill={starColor(c, t)} opacity={0.3} />
                    <Circle
                      cx={X(t)}
                      cy={Y(l)}
                      r={6.5}
                      fill={starColor(c, t)}
                      stroke={c.chartHighlight}
                      strokeWidth={2}
                    />
                    <ChartText
                      x={X(t) + (X(t) > 250 ? -12 : 12)}
                      y={Y(l) + (Y(l) < 40 ? 18 : -8)}
                      fontSize={chart.value}
                      fontWeight="700"
                      textAnchor={X(t) > 250 ? 'end' : 'start'}
                      fill={ink}
                    >
                      {spec.name ?? 'Star'}
                    </ChartText>
                  </G>
                </G>
              </Svg>
              {tid && lid && !spec.fixed ? (
                <DragHandle
                  x={X(t) * k}
                  y={Y(l) * k}
                  label="the star"
                  onStart={() => {
                    start.current = { x: X(t), y: Y(l) };
                  }}
                  onMove={(dx, dy) => {
                    const nx = Math.min(R, Math.max(L, start.current.x + dx / k));
                    const ny = Math.min(BASE, Math.max(TOP, start.current.y + dy / k));
                    // With the radius typed and the luminosity worked out from it, the star
                    // moves the radius (the two typed values, as a point moves its x and y).
                    const rid = typeof spec.radius === 'string' ? spec.radius : undefined;
                    const typed = (id: string) =>
                      ['given', 'example'].includes(calc.status(id) ?? '');
                    const viaRadius = rid !== undefined && typed(rid) && !typed(lid);
                    calc.set(
                      viaRadius
                        ? {
                            [tid]: rep.snapTo(tid, tOf(nx)),
                            [rid]: rep.snapTo(rid, radiusOf(lOf(ny), tOf(nx))),
                          }
                        : { [tid]: rep.snapTo(tid, tOf(nx)), [lid]: rep.snapTo(lid, lOf(ny)) },
                    );
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {caption !== undefined
          ? caption
          : on
            ? `${spec.name ?? 'The star'}: ${formatNumber(Math.round(t))} K and ${formatNumber(Number(l.toPrecision(3)))} times the Sun’s luminosity, so about ${formatNumber(Number(radiusOf(l, t).toPrecision(3)))} times its radius. ${
                kind
                  ? `It lies ${kind === 'main sequence' ? 'on the main sequence' : `among the ${kind}s`}.`
                  : ''
              }`
            : 'Type the temperature and luminosity to plot the star.'}
      </Caption>
    </View>
  );
}
