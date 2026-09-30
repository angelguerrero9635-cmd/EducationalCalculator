import { useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type {
  AtmosphereLayersSpec,
  AtmosphereProfileSpec,
  PressureMapSpec,
} from '@/data/modules/typesHsl';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import { HaloText } from '../layouts/earthKit';
import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useRep } from './common';
import {
  ATMO_LAYERS,
  atmoProfile,
  atmoTempAt,
  isobarLevels,
  isobarStep,
  PRESSURE_MAP,
  pressureField,
  TROPOPAUSE,
  windAt,
} from './earthModel';

const BW = 360;

/** The atmosphere's layers, or a pressure map (see `AtmosphereLayersSpec` in typesHsl.ts). */
export function AtmosphereLayers({ spec, calc }: { spec: AtmosphereLayersSpec; calc: Calculator }) {
  return spec.mode === 'profile' ? (
    <Profile spec={spec} calc={calc} />
  ) : (
    <PressureMap spec={spec} calc={calc} />
  );
}

/** Values of a spec field: a number, a variable's value (or undefined while "?"), or a default. */
function useField(calc: Calculator) {
  const rep = useRep(calc);
  return {
    rep,
    num: (x: number | string | undefined, d: number) =>
      x === undefined ? d : typeof x === 'number' ? x : rep.val(x),
    known: (x: number | string | undefined) =>
      x === undefined || typeof x === 'number' || rep.known(x),
    text: (x: number | string | undefined, d: number) =>
      x === undefined ? formatNumber(d) : typeof x === 'number' ? formatNumber(x) : rep.value(x),
  };
}

// ── Temperature against altitude ──

const PH = 300;
const L = 46;
const R = 256;
const TOP = 16;
const BASE = 262;
const HMAX = 120;
const TX = (t: number) => L + ((t + 100) / 200) * (R - L);
const HY = (h: number) => BASE - (h / HMAX) * (BASE - TOP);

/** The four layers as bands, the temperature line through them, and a point at an altitude. */
function Profile({ spec, calc }: { spec: AtmosphereProfileSpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, num, known, text } = useField(calc);
  const start = useRef(0);
  const ground = num(spec.ground, 15);
  const pts = atmoProfile(ground);
  const curve = pts
    .map(([h, t], i) => `${i ? 'L' : 'M'} ${TX(t).toFixed(1)} ${HY(h).toFixed(1)}`)
    .join(' ');
  const has = spec.altitude !== undefined;
  const h = Math.max(0, Math.min(HMAX, num(spec.altitude, 5)));
  const t = spec.temperature !== undefined ? num(spec.temperature, 0) : atmoTempAt(h, ground);
  const on = has && known(spec.altitude) && known(spec.temperature) && known(spec.ground);
  const bands = [c.atmoTropo, c.atmoStrato, c.atmoMeso, c.atmoThermo];
  const id = typeof spec.altitude === 'string' ? spec.altitude : undefined;
  return (
    <View>
      <Canvas aspect={PH / BW}>
        {({ w, h: ch }) => {
          const k = w / BW;
          return (
            <>
              <Svg width={w} height={ch}>
                <G transform={`scale(${k})`}>
                  {ATMO_LAYERS.map((l, i) => (
                    <G key={l.name}>
                      <Rect
                        x={L}
                        y={HY(l.to)}
                        width={BW - L - 2}
                        height={HY(l.from) - HY(l.to)}
                        fill={bands[i]}
                      />
                      <Line
                        x1={L}
                        y1={HY(l.to)}
                        x2={BW - 2}
                        y2={HY(l.to)}
                        stroke={c.chartMuted}
                        strokeWidth={0.8}
                        strokeDasharray={chart.dashFine}
                      />
                      <ChartText
                        x={R + 6}
                        y={(HY(l.from) + HY(l.to)) / 2 + 4}
                        fontSize={chart.label}
                        fontWeight="700"
                      >
                        {l.name}
                      </ChartText>
                    </G>
                  ))}
                  {/* The ozone layer, 15–35 km, in the stratosphere. */}
                  <Rect
                    x={L + 4}
                    y={HY(35)}
                    width={60}
                    height={HY(15) - HY(35)}
                    rx={8}
                    fill={c.atmoOzone}
                    opacity={0.55}
                  />
                  <ChartText
                    x={L + 34}
                    y={(HY(15) + HY(35)) / 2 + 4}
                    fontSize={chart.label}
                    textAnchor="middle"
                  >
                    ozone
                  </ChartText>
                  {/* Axes. */}
                  {[-100, -50, 0, 50, 100].map((v) => (
                    <G key={v}>
                      <Line x1={TX(v)} y1={BASE} x2={TX(v)} y2={BASE + 4} stroke={c.chartInk} />
                      <ChartText
                        x={TX(v)}
                        y={BASE + 16}
                        fontSize={chart.label}
                        textAnchor="middle"
                        fill={c.chartMuted}
                      >
                        {v < 0 ? `−${-v}` : String(v)}
                      </ChartText>
                    </G>
                  ))}
                  {[0, 20, 40, 60, 80, 100, 120].map((v) => (
                    <ChartText
                      key={v}
                      x={L - 5}
                      y={HY(v) + 4}
                      fontSize={chart.label}
                      textAnchor="end"
                      fill={c.chartMuted}
                    >
                      {String(v)}
                    </ChartText>
                  ))}
                  <Line x1={L} y1={BASE} x2={R} y2={BASE} stroke={c.chartInk} strokeWidth={1.5} />
                  <Line x1={L} y1={TOP} x2={L} y2={BASE} stroke={c.chartInk} strokeWidth={1.5} />
                  <ChartText
                    x={(L + R) / 2}
                    y={PH - 4}
                    fontSize={chart.label}
                    textAnchor="middle"
                    fill={c.chartMuted}
                  >
                    Temperature (°C)
                  </ChartText>
                  <ChartText
                    x={10}
                    y={(TOP + BASE) / 2}
                    fontSize={chart.label}
                    textAnchor="middle"
                    fill={c.chartMuted}
                    transform={`rotate(-90 10 ${(TOP + BASE) / 2})`}
                  >
                    Altitude (km)
                  </ChartText>
                  <Path
                    d={curve}
                    stroke={c.mercury}
                    strokeWidth={chart.strokeHeavy}
                    fill="none"
                    strokeLinejoin="round"
                  />
                  {has ? (
                    <G opacity={on ? 1 : 0.4}>
                      <Line
                        x1={L}
                        y1={HY(h)}
                        x2={TX(t)}
                        y2={HY(h)}
                        stroke={c.chartHighlight}
                        strokeDasharray={chart.dash}
                      />
                      <Line
                        x1={TX(t)}
                        y1={HY(h)}
                        x2={TX(t)}
                        y2={BASE}
                        stroke={c.chartHighlight}
                        strokeDasharray={chart.dash}
                      />
                      <Circle
                        cx={TX(t)}
                        cy={HY(h)}
                        r={5}
                        fill={c.chartHighlight}
                        stroke={c.card}
                        strokeWidth={1.5}
                      />
                      <HaloText
                        x={TX(t) + (t > 20 ? -10 : 10)}
                        y={HY(h) - 8}
                        text={`${text(spec.altitude, h)}, ${spec.temperature !== undefined ? text(spec.temperature, t) : `${formatNumber(Number(t.toFixed(1)))} °C`}`}
                        c={c}
                        size={chart.value}
                        bold
                        anchor={t > 20 ? 'end' : 'start'}
                        fill={c.chartHighlight}
                      />
                    </G>
                  ) : null}
                </G>
              </Svg>
              {id && has ? (
                <DragHandle
                  x={TX(t) * k}
                  y={HY(h) * k}
                  label="the altitude"
                  onStart={() => {
                    start.current = h;
                  }}
                  onMove={(_, dy) => {
                    const nh = start.current - (dy / k / (BASE - TOP)) * HMAX;
                    calc.set({ [id]: rep.snapTo(id, nh) }, rep.slide(id));
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {has && on
          ? h <= TROPOPAUSE
            ? `In the troposphere the air cools about 6.5 °C for each km up: ${formatNumber(Number(t.toFixed(2)))} °C at ${formatNumber(Number(h.toFixed(2)))} km.`
            : `Above the tropopause the temperature no longer falls steadily: ${formatNumber(Number(t.toFixed(1)))} °C at ${formatNumber(Number(h.toFixed(1)))} km.`
          : 'Temperature falls through the troposphere, rises through the stratosphere’s ozone, falls again in the mesosphere and soars in the thermosphere.'}
      </Caption>
    </View>
  );
}

// ── The pressure map ──

const MH = 250;
const MAP_TOP = 26;
const MAP_B = 222;
/** Board point of a map point (y north, up). */
const MX = (x: number) => 8 + x;
const MY = (y: number) => MAP_B - y;

/** Isobar segments at `level` by marching squares over the map. */
function contour(
  p: (x: number, y: number) => number,
  level: number,
  w: number,
  h: number,
  step: number,
) {
  const segs: string[] = [];
  for (let x = 0; x < w; x += step)
    for (let y = 0; y < h; y += step) {
      const v = [p(x, y), p(x + step, y), p(x + step, y + step), p(x, y + step)];
      const corners: [number, number][] = [
        [x, y],
        [x + step, y],
        [x + step, y + step],
        [x, y + step],
      ];
      const cross: [number, number][] = [];
      for (let i = 0; i < 4; i++) {
        const a = v[i]! - level;
        const b = v[(i + 1) % 4]! - level;
        if (a * b < 0) {
          const t = a / (a - b);
          const [x0, y0] = corners[i]!;
          const [x1, y1] = corners[(i + 1) % 4]!;
          cross.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]);
        }
      }
      for (let i = 0; i + 1 < cross.length; i += 2)
        segs.push(
          `M ${MX(cross[i]![0]).toFixed(1)} ${MY(cross[i]![1]).toFixed(1)} L ${MX(cross[i + 1]![0]).toFixed(1)} ${MY(cross[i + 1]![1]).toFixed(1)}`,
        );
    }
  return segs.join(' ');
}

/** A weather map: the high and the low, isobars every 4 hPa, winds turned by the Coriolis effect. */
function PressureMap({ spec, calc }: { spec: PressureMapSpec; calc: Calculator }) {
  const c = usePalette();
  const { num, known, text } = useField(calc);
  const high = num(spec.high, 1024);
  const low = Math.min(num(spec.low, 996), high - 0.5);
  const all = [spec.high, spec.low, spec.distance].every(known);
  const north = spec.hemisphere !== 'south';
  const { hi, lo, s } = PRESSURE_MAP;
  const p = pressureField(high, low, hi, lo, s);
  const W = 344;
  const Hh = MAP_B - MAP_TOP;
  const levels = isobarLevels(high, low);
  // Label isobars where they cross the line between the centres, skipping any too close.
  const labels: { x: number; y: number; v: number }[] = [];
  for (const v of levels) {
    let a = 0;
    let b = 1;
    for (let i = 0; i < 40; i++) {
      const m = (a + b) / 2;
      const pm = p(hi[0] + (lo[0] - hi[0]) * m, hi[1] + (lo[1] - hi[1]) * m);
      if (pm > v) a = m;
      else b = m;
    }
    const x = hi[0] + (lo[0] - hi[0]) * a;
    const y = hi[1] + (lo[1] - hi[1]) * a;
    if (!labels.length || Math.abs(x - labels[labels.length - 1]!.x) >= 30)
      labels.push({ x, y, v });
  }
  const arrows: ReactNode[] = [];
  let big = 0;
  const grid: [number, number, [number, number]][] = [];
  for (let x = 20; x < W; x += 36)
    for (let y = 16; y < Hh; y += 34) {
      if (Math.hypot(x - hi[0], y - hi[1]) < 24 || Math.hypot(x - lo[0], y - lo[1]) < 24) continue;
      const wv = windAt(p, x, y, north);
      big = Math.max(big, Math.hypot(...wv));
      grid.push([x, y, wv]);
    }
  grid.forEach(([x, y, [wx, wy]], i) => {
    const m = Math.hypot(wx, wy);
    if (m < big * 0.06) return;
    const len = 8 + 14 * (m / big);
    const [ux, uy] = [wx / m, -wy / m];
    const [x0, y0] = [MX(x) - (ux * len) / 2, MY(y) - (uy * len) / 2];
    const [x1, y1] = [x0 + ux * len, y0 + uy * len];
    const t = Math.atan2(uy, ux);
    arrows.push(
      <G key={i}>
        <Line x1={x0} y1={y0} x2={x1} y2={y1} stroke={c.chartHighlight} strokeWidth={1.8} />
        <Path
          d={`M ${x1 - 5 * Math.cos(t - 0.5)} ${y1 - 5 * Math.sin(t - 0.5)} L ${x1} ${y1} L ${x1 - 5 * Math.cos(t + 0.5)} ${y1 - 5 * Math.sin(t + 0.5)}`}
          stroke={c.chartHighlight}
          strokeWidth={1.8}
          fill="none"
        />
      </G>,
    );
  });
  return (
    <View>
      <Canvas aspect={MH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <G transform={`scale(${w / BW})`}>
              <Rect
                x={8}
                y={MAP_TOP}
                width={W}
                height={Hh}
                fill={c.chartSurface}
                stroke={c.chartGrid}
              />
              <G opacity={all ? 1 : 0.4}>
                {levels.map((v) => (
                  <Path
                    key={v}
                    d={contour(p, v, W, Hh, 6)}
                    stroke={c.chartInk}
                    strokeWidth={1.1}
                    fill="none"
                  />
                ))}
                {arrows}
                {labels.map((l) => (
                  <HaloText
                    key={l.v}
                    x={MX(l.x)}
                    y={MY(l.y) - 4}
                    text={formatNumber(l.v)}
                    c={c}
                    size={chart.label}
                  />
                ))}
              </G>
              {(
                [
                  [hi, 'H', c.pressureHigh, spec.high, high],
                  [lo, 'L', c.pressureLow, spec.low, low],
                ] as const
              ).map(([pt, letter, color, field, value]) => (
                <G key={letter}>
                  <ChartText
                    x={MX(pt[0])}
                    y={MY(pt[1]) + 8}
                    fontSize={24}
                    fontWeight="800"
                    textAnchor="middle"
                    fill={color}
                  >
                    {letter}
                  </ChartText>
                  <HaloText
                    x={MX(pt[0])}
                    y={MY(pt[1]) + 26}
                    text={known(field) ? text(field, value) : '?'}
                    c={c}
                    size={chart.label}
                    bold
                    fill={color}
                  />
                </G>
              ))}
              <ChartText x={10} y={16} fontSize={chart.label} fontWeight="700">
                {north ? 'Northern Hemisphere' : 'Southern Hemisphere'}
              </ChartText>
              <ChartText
                x={BW - 6}
                y={16}
                fontSize={chart.label}
                textAnchor="end"
                fill={c.chartMuted}
              >
                {`isobars every ${isobarStep(high, low)} hPa`}
              </ChartText>
              {spec.distance !== undefined ? (
                <G>
                  <Path
                    d={`M ${MX(hi[0])} ${MAP_B + 12} V ${MAP_B + 20} H ${MX(lo[0])} V ${MAP_B + 12}`}
                    stroke={c.chartInk}
                    strokeWidth={1.2}
                    fill="none"
                  />
                  <HaloText
                    x={(MX(hi[0]) + MX(lo[0])) / 2}
                    y={MAP_B + 25}
                    text={known(spec.distance) ? text(spec.distance, 0) : '?'}
                    c={c}
                    size={chart.label}
                  />
                </G>
              ) : null}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>
        {all
          ? `Winds blow from high to low pressure, turned ${north ? 'right' : 'left'} by the Coriolis effect: ${north ? 'clockwise' : 'counterclockwise'} out of the high, ${north ? 'counterclockwise' : 'clockwise'} into the low. ${levels.length} isobars lie between them.`
          : 'Type both pressures to draw the map.'}
      </Caption>
    </View>
  );
}
