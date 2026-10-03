/**
 * HC123 `atmosphereLayers` mode `adiabat` (typesHe4g.ts): potential temperature on a
 * temperature against log-pressure chart. The dry adiabats T = θ(p ÷ 1,000)^κ every 10 K,
 * labelled by θ; the parcel at (T, p) and its own adiabat brought down to 1,000 hPa, where the
 * temperature it reaches is θ. Drag the parcel.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { ClipPath, Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { AtmosphereAdiabatSpec } from '@/data/modules/typesHe4g';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle } from './common';
import { Arrow } from './he1fKit';
import { fmt, Tag, tagW } from './he2fKit';
import { useHe4g } from './he4gKit';
import { adiabatAt, KAPPA, logTicks, thetaOf } from './he4gMath';
import { url, usePaintIds } from './paint';

const BW = 360;
const BH = 300;
const L = 50;
const R = 344;
const TOP = 30;
const BASE = 256;
/** The chart's top: the largest of these at most the parcel's p ÷ 1.6. */
const TOPS = [10, 20, 30, 50, 70, 100, 150, 200, 300, 400, 500, 600];

export function AtmosphereAdiabat({
  spec,
  calc,
}: {
  spec: AtmosphereAdiabatSpec;
  calc: Calculator;
}) {
  const c = usePalette();
  const ids = usePaintIds('plot');
  const { rep, num, label, say } = useHe4g(calc);
  const start = useRef({ t: 0, p: 0 });
  const t = num(spec.temperature);
  const p = num(spec.pressure);
  const kappa = spec.kappa === undefined ? KAPPA : num(spec.kappa);
  const ok = t !== undefined && p !== undefined && p > 0 && kappa !== undefined;
  const th = ok ? thetaOf(t, p, kappa) : undefined;
  const k = kappa ?? KAPPA;
  // Pressure down the chart (log), 1,000 hPa (or the parcel's, when lower) at the bottom.
  const pBot = Math.max(1000, ok ? p * 1.03 : 1000);
  const pTop = [...TOPS].reverse().find((x) => x <= (ok ? p : 700) / 1.6) ?? 10;
  const Y = (x: number) =>
    TOP + ((Math.log(x) - Math.log(pTop)) / (Math.log(pBot) - Math.log(pTop))) * (BASE - TOP);
  // Temperature across: the parcel, θ and the adiabat's top end, in 10 K steps.
  const tLo0 = ok ? Math.min(t, adiabatAt(th!, pTop, k)) - 12 : 220;
  const tHi0 = ok ? Math.max(t + 14, th! + 32) : 320;
  const tLo = Math.floor(tLo0 / 10) * 10;
  const tHi = Math.max(tLo + 60, Math.ceil(tHi0 / 10) * 10);
  const X = (x: number) => L + ((x - tLo) / (tHi - tLo)) * (R - L);
  const tStep = tHi - tLo > 120 ? 40 : 20;
  const tTicks: number[] = [];
  for (let x = Math.ceil(tLo / tStep) * tStep; x <= tHi; x += tStep) tTicks.push(x);
  const pTicks: number[] = [];
  for (const x of logTicks(pTop, pBot).reverse())
    if (!pTicks.length || Y(pTicks[pTicks.length - 1]!) - Y(x) >= 18) pTicks.push(x);
  if (!pTicks.includes(1000)) pTicks.unshift(1000);
  // The dry adiabats every 10 K that cross the chart, labelled near the top where they are apart.
  const thStep = tHi - tLo > 100 ? 20 : 10;
  const thetas: number[] = [];
  for (let x = tLo; x <= tHi / (pTop / pBot) ** k + thStep; x += thStep) thetas.push(x);
  const curve = (theta: number, from: number, to: number) => {
    const n = 24;
    return Array.from({ length: n + 1 }, (_, i) => {
      const pp = from * (to / from) ** (i / n);
      return `${i ? 'L' : 'M'} ${X(adiabatAt(theta, pp, k)).toFixed(1)} ${Y(pp).toFixed(1)}`;
    }).join(' ');
  };
  const pLab = pTop * (pBot / pTop) ** 0.12;
  const labels: { x: number; v: number }[] = [];
  for (const v of thetas) {
    const x = X(adiabatAt(v, pLab, k));
    if (x < L + 12 || x > R - 12) continue;
    if (labels.length && x - labels[labels.length - 1]!.x < 26) continue;
    labels.push({ x, v });
  }

  const tVar = typeof spec.temperature === 'string' ? spec.temperature : undefined;
  const pVar = typeof spec.pressure === 'string' ? spec.pressure : undefined;
  const canDrag = !spec.fixed && ok && tVar !== undefined && pVar !== undefined;
  const tText = label(spec.temperature, 'T', t, 'K');
  const pText = label(spec.pressure, 'p', p, 'hPa');
  const thText = label(spec.theta, 'θ', th, 'K');
  const parcelLeft = ok && X(t) > (L + R) / 2;

  const lines = ok
    ? [
        `θ = T(1,000 ÷ p)^κ = ${say(spec.temperature, t)} × (1,000 ÷ ${say(spec.pressure, p)})^${say(spec.kappa, k)} = ${say(spec.theta, th!)} K.`,
        `Brought down dry to 1,000 hPa, the parcel ${th! >= t ? 'warms' : 'cools'} along its adiabat to θ; every parcel on one adiabat has the same θ.`,
      ]
    : ['Type the temperature and the pressure to place the parcel.'];

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h: ch }) => {
          const s = w / BW;
          return (
            <>
              <Svg width={w} height={ch}>
                <Defs>
                  <ClipPath id={ids.plot}>
                    <Rect x={L} y={TOP} width={R - L} height={BASE - TOP} />
                  </ClipPath>
                </Defs>
                <G transform={`scale(${s})`}>
                  {/* The key. */}
                  <Line
                    x1={10}
                    y1={12}
                    x2={30}
                    y2={12}
                    stroke={c.chartMuted}
                    strokeWidth={1.2}
                    strokeDasharray={chart.dash}
                  />
                  <ChartText x={35} y={16} fontSize={chart.label} fill={c.chartMuted}>
                    {`dry adiabats every ${thStep} K, labelled θ (K)`}
                  </ChartText>
                  {pTicks.map((x) => (
                    <G key={`p${x}`}>
                      <Line x1={L} y1={Y(x)} x2={R} y2={Y(x)} stroke={c.chartGrid} />
                      <ChartText
                        x={L - 5}
                        y={Y(x) + 4}
                        fontSize={chart.label}
                        textAnchor="end"
                        fill={c.chartMuted}
                      >
                        {fmt(x)}
                      </ChartText>
                    </G>
                  ))}
                  {tTicks.map((x) => (
                    <G key={`t${x}`}>
                      <Line x1={X(x)} y1={BASE} x2={X(x)} y2={BASE + 4} stroke={c.chartInk} />
                      <ChartText
                        x={X(x)}
                        y={BASE + 16}
                        fontSize={chart.label}
                        textAnchor="middle"
                        fill={c.chartMuted}
                      >
                        {fmt(x)}
                      </ChartText>
                    </G>
                  ))}
                  <G clipPath={url(ids.plot)}>
                    {thetas.map((v) => (
                      <Path
                        key={v}
                        d={curve(v, pTop, pBot)}
                        stroke={c.chartMuted}
                        strokeWidth={1.1}
                        strokeDasharray={chart.dash}
                        fill="none"
                      />
                    ))}
                  </G>
                  {labels.map(({ x, v }) => (
                    <ChartText
                      key={v}
                      x={x}
                      y={Y(pLab) + 4}
                      fontSize={chart.label}
                      textAnchor="middle"
                      fill={c.chartMuted}
                      halo={c.card}
                    >
                      {fmt(v)}
                    </ChartText>
                  ))}
                  <Path
                    d={`M ${L} ${TOP} V ${BASE} H ${R}`}
                    stroke={c.chartInk}
                    strokeWidth={1.5}
                    fill="none"
                  />
                  <ChartText
                    x={(L + R) / 2}
                    y={BASE + 34}
                    fontSize={chart.label}
                    textAnchor="middle"
                    fill={c.chartMuted}
                  >
                    Temperature, K
                  </ChartText>
                  <ChartText
                    x={12}
                    y={(TOP + BASE) / 2}
                    fontSize={chart.label}
                    textAnchor="middle"
                    fill={c.chartMuted}
                    transform={`rotate(-90 12 ${(TOP + BASE) / 2})`}
                  >
                    Pressure, hPa (log scale)
                  </ChartText>
                  {ok ? (
                    <G>
                      {/* The parcel's own adiabat: above it faint, down to 1,000 hPa bold. */}
                      <G clipPath={url(ids.plot)}>
                        <Path
                          d={curve(th!, pTop, p)}
                          stroke={c.fnSecond}
                          strokeWidth={1.5}
                          strokeDasharray={chart.dashFine}
                          fill="none"
                        />
                      </G>
                      <Path
                        d={curve(th!, p, 1000)}
                        stroke={c.fnSecond}
                        strokeWidth={chart.strokeHeavy}
                        fill="none"
                      />
                      {Y(1000) - Y(p) > 40 ? (
                        <Arrow
                          x1={X(adiabatAt(th!, p * (1000 / p) ** 0.45, k))}
                          y1={Y(p * (1000 / p) ** 0.45)}
                          x2={X(adiabatAt(th!, p * (1000 / p) ** 0.6, k))}
                          y2={Y(p * (1000 / p) ** 0.6)}
                          color={c.fnSecond}
                          width={2}
                        />
                      ) : null}
                      <Line
                        x1={L}
                        y1={Y(1000)}
                        x2={R}
                        y2={Y(1000)}
                        stroke={c.chartInk}
                        strokeWidth={1}
                      />
                      <Circle
                        cx={X(th!)}
                        cy={Y(1000)}
                        r={5}
                        fill={c.fnSecond}
                        stroke={c.card}
                        strokeWidth={1.5}
                      />
                      {thText ? (
                        <Tag
                          x={X(th!) + (X(th!) > R - tagW(thText) - 12 ? -8 : 8)}
                          y={Y(1000) - 8}
                          text={thText}
                          anchor={X(th!) > R - tagW(thText) - 12 ? 'end' : 'start'}
                          color={c.fnSecond}
                          w={BW}
                        />
                      ) : null}
                      <Circle
                        cx={X(t)}
                        cy={Y(p)}
                        r={6}
                        fill={c.chartHighlight}
                        stroke={c.card}
                        strokeWidth={1.5}
                      />
                      {tText ? (
                        <Tag
                          x={X(t) + (parcelLeft ? -10 : 10)}
                          y={Y(p) - 4}
                          text={tText}
                          anchor={parcelLeft ? 'end' : 'start'}
                          color={c.chartHighlight}
                          w={BW}
                        />
                      ) : null}
                      {pText ? (
                        <Tag
                          x={X(t) + (parcelLeft ? -10 : 10)}
                          y={Y(p) + 14}
                          text={pText}
                          anchor={parcelLeft ? 'end' : 'start'}
                          color={c.chartHighlight}
                          w={BW}
                        />
                      ) : null}
                    </G>
                  ) : null}
                </G>
              </Svg>
              {canDrag ? (
                <DragHandle
                  x={X(t) * s}
                  y={Y(p) * s}
                  label="the parcel"
                  onStart={() => {
                    start.current = { t, p };
                  }}
                  onMove={(dx, dy) => {
                    const nt = start.current.t + ((dx / s) * (tHi - tLo)) / (R - L);
                    const lp =
                      Math.log(start.current.p) +
                      ((dy / s) * (Math.log(pBot) - Math.log(pTop))) / (BASE - TOP);
                    calc.set({
                      ...rep.pinTyped(typeof spec.kappa === 'string' ? [spec.kappa] : []),
                      [tVar]: rep.snapTo(tVar, nt),
                      [pVar]: rep.snapTo(pVar, Math.exp(lp)),
                    });
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
