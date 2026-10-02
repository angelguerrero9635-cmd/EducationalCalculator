import { View } from 'react-native';
import Svg, { ClipPath, Circle, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { ParcelSpec } from '@/data/modules/typesHs2f';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import { HaloText } from '../layouts/earthKit';
import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import {
  cloudBase,
  DEW_LAPSE,
  DRY_LAPSE,
  MOIST_LAPSE,
  parcelDewAt,
  parcelTempAt,
} from './earthModelHs2f';
import { Ball, url, usePaintIds } from './paint';

const BW = 360;
const BH = 316;
const L = 46;
const R = 240;
const TOP = 50;
const BASE = 262;
/** The scene beside the chart: ground, the rising parcel and its cloud. */
const SX0 = 256;
const SX1 = 352;

/** A tick step of 1, 2 or 5 × 10ⁿ giving at most `most` steps over `span`. */
const tickStep = (span: number, most: number) => {
  const raw = span / most;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
};

const round = (x: number, places = 2) => Number(x.toFixed(places));
const deg = (t: number) => `${formatNumber(round(t, 1))} °C`;

/** A parcel rising to its cloud base (ParcelSpec). */
export function AirParcel({ spec, calc }: { spec: ParcelSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('cloud', 'clip', 'bubble');
  const num = (x: number | string | undefined, d: number) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) =>
    x === undefined || typeof x === 'number' || rep.known(x);
  const t = num(spec.temperature, 24);
  const td = Math.min(t, num(spec.dewPoint, 12));
  const on = known(spec.temperature) && known(spec.dewPoint);
  const h = Math.max(0, cloudBase(t, td));
  const nice = [1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 30];
  const zMax = nice.find((n) => n >= Math.max(1, h * 1.35 + 0.3)) ?? Math.ceil(h * 1.35 + 1);
  const tTop = parcelTempAt(zMax, t, td);
  const lo0 = Math.min(td, tTop) - 2;
  const hi0 = t + 2;
  const step = tickStep(hi0 - lo0, 4);
  const lo = Math.floor(lo0 / step) * step;
  const hi = Math.ceil(hi0 / step) * step;
  const X = (x: number) => L + ((x - lo) / (hi - lo)) * (R - L);
  const Y = (z: number) => BASE - (z / zMax) * (BASE - TOP);
  const zStep = tickStep(zMax, 5);
  const line = (f: (z: number) => number) =>
    [0, Math.min(h, zMax), zMax]
      .map((z, i) => `${i ? 'L' : 'M'} ${X(f(z)).toFixed(1)} ${Y(z).toFixed(1)}`)
      .join(' ');
  const tBase = t - DRY_LAPSE * h;
  const tempCol = c.fnSecond;
  const dewCol = c.lineSum;
  const yb = Y(h);
  // The cloud: a flat base at h, billows above it up to about a kilometre or to the chart's top.
  const cloudTop = Math.max(TOP + 4, Y(Math.min(zMax, h + zMax * 0.28)));
  const cx = (SX0 + SX1) / 2;
  const bubbles = [0.12, 0.42, 0.72]
    .map((f) => f * h)
    .filter((z) => Y(z) - yb > 22)
    .map((z, i) => ({ z, r: 7 + i * 1.5 }));

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h: ch }) => {
          const k = w / BW;
          return (
            <Svg width={w} height={ch}>
              <Defs>
                <Ball id={ids.cloud} color={c.rainCloud} />
                <Ball id={ids.bubble} color={c.airBand} />
                <ClipPath id={ids.clip}>
                  <Rect x={SX0} y={0} width={SX1 - SX0} height={yb} />
                </ClipPath>
              </Defs>
              <G transform={`scale(${k})`}>
                {/* The key. */}
                {(
                  [
                    [`parcel’s temperature: −${DRY_LAPSE} °C per km`, tempCol, 16, undefined],
                    [`its dew point: −${DEW_LAPSE} °C per km`, dewCol, 34, chart.dash],
                  ] as const
                ).map(([name, col, y, dash]) => (
                  <G key={name}>
                    <Line
                      x1={10}
                      y1={y - 4}
                      x2={34}
                      y2={y - 4}
                      stroke={col}
                      strokeWidth={chart.strokeHeavy}
                      strokeDasharray={dash}
                    />
                    <ChartText x={40} y={y} fontSize={chart.label}>
                      {name}
                    </ChartText>
                  </G>
                ))}
                {/* The grid: altitude up, temperature across. */}
                {Array.from({ length: Math.round(zMax / zStep) + 1 }, (_, i) => i * zStep).map(
                  (z) => (
                    <G key={`z${z}`}>
                      <Line x1={L} y1={Y(z)} x2={R} y2={Y(z)} stroke={c.chartGrid} />
                      <ChartText
                        x={L - 5}
                        y={Y(z) + 4}
                        fontSize={chart.label}
                        textAnchor="end"
                        fill={c.chartMuted}
                      >
                        {formatNumber(round(z, 2))}
                      </ChartText>
                    </G>
                  ),
                )}
                {Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, i) =>
                  round(lo + i * step, 6),
                ).map((x) => (
                  <G key={`t${x}`}>
                    <Line x1={X(x)} y1={TOP} x2={X(x)} y2={BASE} stroke={c.chartGrid} />
                    <ChartText
                      x={X(x)}
                      y={BASE + 16}
                      fontSize={chart.label}
                      textAnchor="middle"
                      fill={c.chartMuted}
                    >
                      {formatNumber(x)}
                    </ChartText>
                  </G>
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
                  Temperature, °C
                </ChartText>
                <ChartText
                  x={12}
                  y={(TOP + BASE) / 2}
                  fontSize={chart.label}
                  textAnchor="middle"
                  fill={c.chartMuted}
                  transform={`rotate(-90 12 ${(TOP + BASE) / 2})`}
                >
                  Altitude, km
                </ChartText>
                {/* The scene: ground, the parcel rising, the cloud from its flat base. */}
                <Rect x={SX0} y={TOP} width={SX1 - SX0} height={BASE - TOP} fill={c.atmoTropo} />
                <Rect x={SX0} y={BASE} width={SX1 - SX0} height={8} fill={c.landGrass} />
                <G opacity={on ? 1 : 0.4}>
                  {bubbles.map(({ z, r }) => (
                    <G key={z}>
                      <Circle
                        cx={cx}
                        cy={Y(z) - r}
                        r={r}
                        fill={url(ids.bubble)}
                        stroke={c.chartInk}
                        strokeWidth={0.8}
                      />
                      <Path
                        d={`M ${cx + r + 6} ${Y(z) - 4} v -14 m -4 4 l 4 -4 l 4 4`}
                        stroke={c.chartInk}
                        strokeWidth={1.2}
                        fill="none"
                      />
                    </G>
                  ))}
                  {yb - cloudTop > 6 ? (
                    <G clipPath={url(ids.clip)}>
                      {[
                        [cx - 26, 0.35, 22],
                        [cx + 24, 0.4, 20],
                        [cx - 4, 0.62, 26],
                        [cx + 10, 0.9, 18],
                      ].map(([x, f, r]) => (
                        <Ellipse
                          key={`${x}${f}`}
                          cx={x!}
                          cy={yb - (yb - cloudTop) * f!}
                          rx={r!}
                          ry={Math.max(6, Math.min(r!, (yb - cloudTop) * 0.45))}
                          fill={url(ids.cloud)}
                        />
                      ))}
                    </G>
                  ) : null}
                </G>
                {/* The two lines: dry to the cloud base, then saturated together. */}
                <G opacity={on ? 1 : 0.4}>
                  <Path
                    d={line((z) => parcelTempAt(z, t, td))}
                    stroke={tempCol}
                    strokeWidth={chart.strokeHeavy}
                    fill="none"
                    strokeLinejoin="round"
                  />
                  <Path
                    d={line((z) => parcelDewAt(z, t, td))}
                    stroke={dewCol}
                    strokeWidth={chart.strokeHeavy}
                    strokeDasharray={chart.dash}
                    fill="none"
                    strokeLinejoin="round"
                  />
                  <Line
                    x1={L}
                    y1={yb}
                    x2={SX1}
                    y2={yb}
                    stroke={c.chartHighlight}
                    strokeWidth={1.5}
                    strokeDasharray={chart.dashFine}
                  />
                  <Circle
                    cx={X(tBase)}
                    cy={yb}
                    r={5}
                    fill={c.chartHighlight}
                    stroke={c.card}
                    strokeWidth={1.5}
                  />
                  {/* The base named above the line, beside the meeting point. */}
                  {(() => {
                    const right = X(tBase) + 8 + 92 <= R + 12;
                    const x = right ? X(tBase) + 8 : X(tBase) - 8;
                    const anchor = right ? 'start' : 'end';
                    const value =
                      typeof spec.base === 'string'
                        ? rep.named(spec.base)
                        : `${formatNumber(round(h, 2))} km`;
                    return (
                      <>
                        <HaloText
                          x={x}
                          y={yb - 25}
                          text="cloud base"
                          c={c}
                          size={chart.value}
                          bold
                          fill={c.chartHighlight}
                          anchor={anchor}
                        />
                        <HaloText
                          x={x}
                          y={yb - 7}
                          text={value}
                          c={c}
                          size={chart.value}
                          bold
                          fill={c.chartHighlight}
                          anchor={anchor}
                        />
                      </>
                    );
                  })()}
                  <HaloText
                    x={Math.min(R - 4, X(t) + 4)}
                    y={BASE - 6}
                    text={known(spec.temperature) ? deg(t) : '? °C'}
                    c={c}
                    size={chart.label}
                    bold
                    fill={tempCol}
                    anchor={X(t) + 50 > R ? 'end' : 'start'}
                  />
                  <HaloText
                    x={Math.max(L + 4, X(td) - 4)}
                    y={BASE - 6}
                    text={known(spec.dewPoint) ? deg(td) : '? °C'}
                    c={c}
                    size={chart.label}
                    bold
                    fill={dewCol}
                    anchor={X(td) - 50 < L ? 'start' : 'end'}
                  />
                </G>
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {!on
          ? 'Type the temperature and the dew point to raise the parcel.'
          : t === td
            ? `The air is saturated at the ground (T = T_d = ${deg(t)}): fog, a cloud at 0 km.`
            : `The parcel cools ${DRY_LAPSE} °C per km and its dew point falls ${DEW_LAPSE} °C per km, so they close ${DRY_LAPSE - DEW_LAPSE} °C per km: h = (${formatNumber(round(t, 2))} − ${formatNumber(round(td, 2))}) ÷ ${DRY_LAPSE - DEW_LAPSE} = ${formatNumber(round(h, 3))} km. There the air is ${deg(tBase)}, saturated, and a cloud forms; above it the parcel cools about ${MOIST_LAPSE} °C per km.`}
      </Caption>
    </View>
  );
}
