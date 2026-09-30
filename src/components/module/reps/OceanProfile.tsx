import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { OceanProfileSpec, OceanSonarSpec, TidesSpec } from '@/data/modules/typesHsl';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import { HaloText } from '../layouts/earthKit';
import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useRep } from './common';
import { depthAt, SEAFLOOR, shipAt, SUN_TIDE, tideAt, tideFactor } from './earthModel';
import { Ball, Deepen, url, usePaintIds } from './paint';

const BW = 360;

/** The seafloor, or the tides (see `OceanProfileSpec` in typesHsl.ts). */
export function OceanProfile({ spec, calc }: { spec: OceanProfileSpec; calc: Calculator }) {
  return spec.mode === 'profile' ? (
    <Sonar spec={spec} calc={calc} />
  ) : (
    <Tides spec={spec} calc={calc} />
  );
}

// ── The seafloor profile ──

const PH = 272;
const PX0 = 58;
const PX1 = 354;
const SEA = 66;
const DMAX = 11000;
const X = (s: number) => PX0 + s * (PX1 - PX0);
const Y = (d: number) => SEA + (d / DMAX) * (PH - 36 - SEA);

/** The seafloor across an ocean, depths to scale on a stretched vertical axis, and a sonar ship. */
function Sonar({ spec, calc }: { spec: OceanSonarSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('sea', 'hull');
  const has = spec.depth !== undefined;
  const d =
    spec.depth === undefined
      ? 0
      : typeof spec.depth === 'number'
        ? spec.depth
        : rep.val(spec.depth);
  const known =
    typeof spec.depth === 'number' || (typeof spec.depth === 'string' && rep.known(spec.depth));
  const at = has ? shipAt(d, spec.over) : undefined;
  const floor = SEAFLOOR.map(([s, dd]) => `${X(s).toFixed(1)} ${Y(dd).toFixed(1)}`);
  const ground = `M ${floor.join(' L ')} L ${PX1} ${PH - 18} L ${PX0} ${PH - 18} Z`;
  const water = `M ${X(0.05)} ${SEA} L ${X(0.95)} ${SEA} ${SEAFLOOR.filter(
    ([s]) => s >= 0.05 && s <= 0.95,
  )
    .reverse()
    .map(([s, dd]) => `L ${X(s).toFixed(1)} ${Y(Math.max(0, dd)).toFixed(1)}`)
    .join(' ')} Z`;
  const tag = (s: number, dd: number, text: string, row: number) => {
    const y = row === 0 ? 20 : 38;
    return (
      <G key={text}>
        <Line
          x1={X(s)}
          y1={y + 4}
          x2={X(s)}
          y2={Y(dd) - 2}
          stroke={c.chartInk}
          strokeWidth={1}
          strokeDasharray={chart.dashFine}
        />
        <HaloText x={X(s)} y={y} text={text} c={c} size={chart.label} />
      </G>
    );
  };
  const shipX = at === undefined ? undefined : X(at);
  return (
    <View>
      <Canvas aspect={PH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <Deepen id={ids.sea} from={c.water} to={c.waterDeep} />
              <Ball id={ids.hull} color={c.blockRed} />
            </Defs>
            <G transform={`scale(${w / BW})`}>
              {/* Depth scale. */}
              {[0, 2000, 4000, 6000, 8000, 10000].map((m) => (
                <G key={m}>
                  <Line
                    x1={PX0 - 4}
                    y1={Y(m)}
                    x2={PX1}
                    y2={Y(m)}
                    stroke={c.chartGrid}
                    strokeWidth={0.8}
                  />
                  <ChartText
                    x={PX0 - 6}
                    y={Y(m) + 4}
                    fontSize={chart.label}
                    textAnchor="end"
                    fill={c.chartMuted}
                  >
                    {formatNumber(m)}
                  </ChartText>
                </G>
              ))}
              <ChartText
                x={10}
                y={(SEA + PH) / 2}
                fontSize={chart.label}
                textAnchor="middle"
                fill={c.chartMuted}
                transform={`rotate(-90 10 ${(SEA + PH) / 2})`}
              >
                Depth (m)
              </ChartText>
              <Path d={water} fill={url(ids.sea)} opacity={0.85} />
              <Path d={ground} fill={c.seafloor} stroke={c.chartInk} strokeWidth={1} />
              {/* Land above sea level. */}
              <Path
                d={`M ${X(0)} ${Y(-600)} L ${X(0.05)} ${SEA}`}
                stroke={c.landGrass}
                strokeWidth={3}
              />
              <Path
                d={`M ${X(0.95)} ${Y(-400)} L ${X(1)} ${Y(-500)}`}
                stroke={c.landGrass}
                strokeWidth={3}
              />
              <Path d={`M ${X(0.05)} ${SEA} H ${X(0.95)}`} stroke={c.waterDeep} strokeWidth={1.5} />
              {tag(0.1, 200, 'shelf', 0)}
              {tag(0.175, 1600, 'slope', 1)}
              {tag(0.235, 3500, 'rise', 0)}
              <HaloText
                x={X(0.34)}
                y={Y(4600) - 10}
                text="abyssal plain"
                c={c}
                size={chart.label}
              />
              <HaloText
                x={X(0.48)}
                y={Y(5600)}
                text="mid-ocean ridge"
                c={c}
                size={chart.label}
                bold
              />
              <HaloText
                x={X(0.8) - 10}
                y={Y(8500) + 4}
                text="trench"
                c={c}
                size={chart.label}
                bold
                anchor="end"
              />
              {/* The ship and its sonar ping. */}
              {shipX !== undefined ? (
                <G opacity={known ? 1 : 0.4}>
                  <Line
                    x1={shipX}
                    y1={SEA + 4}
                    x2={shipX}
                    y2={Y(d)}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                    strokeDasharray={chart.dash}
                  />
                  {[8, 14, 20].map((r) => (
                    <Path
                      key={r}
                      d={`M ${shipX - r * 0.8} ${SEA + 4 + r} Q ${shipX} ${SEA + 8 + r * 1.3} ${shipX + r * 0.8} ${SEA + 4 + r}`}
                      stroke={c.chartHighlight}
                      strokeWidth={1.2}
                      fill="none"
                    />
                  ))}
                  <Circle cx={shipX} cy={Y(d)} r={3.5} fill={c.chartHighlight} />
                  <Path
                    d={`M ${shipX - 14} ${SEA - 6} L ${shipX + 14} ${SEA - 6} L ${shipX + 9} ${SEA + 2} L ${shipX - 9} ${SEA + 2} Z`}
                    fill={url(ids.hull)}
                    stroke={c.chartInk}
                    strokeWidth={0.8}
                  />
                  <Rect
                    x={shipX - 6}
                    y={SEA - 13}
                    width={10}
                    height={7}
                    fill={c.paper}
                    stroke={c.chartInk}
                    strokeWidth={0.8}
                  />
                  <HaloText
                    x={shipX + (at! > 0.7 ? -8 : 8)}
                    y={(SEA + Y(d)) / 2 + 12}
                    text={`${known ? rep.value(spec.depth as string) : '?'}`}
                    c={c}
                    size={chart.value}
                    bold
                    anchor={at! > 0.7 ? 'end' : 'start'}
                    fill={c.chartHighlight}
                  />
                </G>
              ) : null}
              <ChartText
                x={PX1}
                y={PH - 4}
                fontSize={chart.label}
                textAnchor="end"
                fill={c.chartMuted}
              >
                depths stretched, not to scale across
              </ChartText>
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>
        {!has
          ? 'From the coast: the shelf, the slope and rise, the abyssal plain, the ridge and the trench.'
          : !known
            ? 'Type the depth to place the ship.'
            : at === undefined
              ? `No part of this profile${spec.over ? ` over the ${spec.over}` : ''} is ${formatNumber(d)} m deep.`
              : `The seafloor is ${formatNumber(Math.round(depthAt(at)))} m under the ship.`}
      </Caption>
    </View>
  );
}

// ── The tides ──

const TH = 262;
const EX = 206;
const EY = 128;
const ORBIT = 100;
const RE = 30;

/** Earth from above the North Pole, its two tidal bulges, the Sun to the left and the Moon. */
function Tides({ spec, calc }: { spec: TidesSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('sea', 'earth', 'sun');
  const start = useRef(0);
  const id = typeof spec.angle === 'string' ? spec.angle : undefined;
  const deg = Math.max(
    0,
    Math.min(180, typeof spec.angle === 'number' ? spec.angle : rep.val(spec.angle)),
  );
  const known = typeof spec.angle === 'number' || rep.known(spec.angle);
  const t = (deg * Math.PI) / 180;
  const [mx, my] = [EX - ORBIT * Math.cos(t), EY + ORBIT * Math.sin(t)];
  const moonDir = Math.atan2(my - EY, mx - EX);
  const sunDir = Math.PI;
  const bulge = Array.from({ length: 121 }, (_, i) => {
    const phi = (i / 120) * Math.PI * 2;
    const r = RE + 13 + 6.5 * tideAt(phi, moonDir, sunDir);
    return `${i ? 'L' : 'M'} ${(EX + r * Math.cos(phi)).toFixed(1)} ${(EY + r * Math.sin(phi)).toFixed(1)}`;
  }).join(' ');
  // The high-tide axis: where the combined bulge peaks.
  let best = 0;
  for (let i = 0; i < 360; i++) {
    const phi = (i * Math.PI) / 180;
    if (tideAt(phi, moonDir, sunDir) > tideAt(best, moonDir, sunDir)) best = phi;
  }
  const f = tideFactor(deg);
  const kind =
    Math.abs(Math.cos(t)) > 0.97
      ? 'Spring tide'
      : Math.abs(Math.cos(t)) < 0.17
        ? 'Neap tide'
        : 'Between spring and neap';
  return (
    <View>
      <Canvas aspect={TH / BW}>
        {({ w, h }) => {
          const k = w / BW;
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Deepen id={ids.sea} from={c.waterTop} to={c.water} />
                  <Ball id={ids.earth} color={c.landGrass} />
                  <Ball id={ids.sun} color={c.sunDisk} />
                </Defs>
                <G transform={`scale(${k})`}>
                  {/* The Sun, far off to the left, and its light. */}
                  <Circle cx={-40} cy={EY} r={64} fill={url(ids.sun)} />
                  {[-40, -14, 14, 40].map((dy) => (
                    <Line
                      key={dy}
                      x1={32}
                      y1={EY + dy}
                      x2={64}
                      y2={EY + dy}
                      stroke={c.sunRay}
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  ))}
                  <HaloText
                    x={6}
                    y={EY + 84}
                    text="Sun (far away)"
                    c={c}
                    size={chart.label}
                    anchor="start"
                  />
                  {/* The Moon's orbit. */}
                  <Circle
                    cx={EX}
                    cy={EY}
                    r={ORBIT}
                    fill="none"
                    stroke={c.chartMuted}
                    strokeWidth={1}
                    strokeDasharray={chart.dash}
                  />
                  {/* The oceans, bulged, then Earth. */}
                  <Path d={bulge} fill={url(ids.sea)} stroke={c.waterDeep} strokeWidth={1.2} />
                  <Circle
                    cx={EX}
                    cy={EY}
                    r={RE}
                    fill={url(ids.earth)}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                  <Circle cx={EX} cy={EY} r={3} fill={c.chartInk} />
                  {/* High tide on both sides along the bulge. */}
                  {[best, best + Math.PI].map((phi, i) => (
                    <Line
                      key={i}
                      x1={EX + (RE + 2) * Math.cos(phi)}
                      y1={EY + (RE + 2) * Math.sin(phi)}
                      x2={EX + (RE + 24) * Math.cos(phi)}
                      y2={EY + (RE + 24) * Math.sin(phi)}
                      stroke={c.waterDeep}
                      strokeWidth={2}
                      strokeDasharray="3 2"
                    />
                  ))}
                  {/* The angle from the Sun's direction to the Moon. */}
                  {deg > 3 ? (
                    <Path
                      d={`M ${EX - 56} ${EY} A 56 56 0 ${deg > 180 ? 1 : 0} 0 ${EX - 56 * Math.cos(t)} ${EY + 56 * Math.sin(t)}`}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke}
                      fill="none"
                    />
                  ) : null}
                  <Line
                    x1={EX - RE}
                    y1={EY}
                    x2={EX - ORBIT - 10}
                    y2={EY}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                  />
                  {/* The Moon, lit on the Sun's side. */}
                  <G opacity={known ? 1 : 0.4}>
                    <Circle
                      cx={mx}
                      cy={my}
                      r={11}
                      fill={c.moonDark}
                      stroke={c.chartInk}
                      strokeWidth={1}
                    />
                    <Path
                      d={`M ${mx} ${my - 11} A 11 11 0 0 0 ${mx} ${my + 11} Z`}
                      fill={c.moonLit}
                    />
                    <HaloText
                      x={mx + (my > EY + 60 ? 0 : 18)}
                      y={my + (my > EY + 60 ? 26 : 4)}
                      text="Moon"
                      c={c}
                      size={chart.label}
                      anchor={my > EY + 60 ? 'middle' : 'start'}
                    />
                  </G>
                  <HaloText
                    x={BW - 6}
                    y={20}
                    text={kind}
                    c={c}
                    size={chart.value}
                    bold
                    anchor="end"
                    fill={c.chartHighlight}
                  />
                  <HaloText
                    x={BW - 6}
                    y={40}
                    text={`${known ? formatNumber(Math.round(deg)) : '?'}° from the Sun`}
                    c={c}
                    size={chart.label}
                    anchor="end"
                  />
                  <HaloText
                    x={BW - 6}
                    y={TH - 8}
                    text="seen from above the North Pole"
                    c={c}
                    size={chart.label}
                    anchor="end"
                  />
                </G>
              </Svg>
              {id && !spec.fixed ? (
                <DragHandle
                  x={mx * k}
                  y={my * k}
                  label="the Moon's angle"
                  onStart={() => {
                    start.current = deg;
                  }}
                  onMove={(dx, dy) => {
                    const px = mx + dx / k - EX;
                    const py = my + dy / k - EY;
                    let a = (Math.atan2(py, -px) * 180) / Math.PI;
                    if (a < 0) a = px < 0 ? 0 : 180;
                    calc.set({ [id]: rep.snapTo(id, a) }, rep.slide(id));
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? `${kind}: the Sun’s pull is about ${formatNumber(SUN_TIDE)} of the Moon’s, so the tidal range is ${formatNumber(Number(f.toFixed(2)))} times the Moon’s alone.${
              spec.range !== undefined && (typeof spec.range === 'number' || rep.known(spec.range))
                ? ` Range: ${typeof spec.range === 'number' ? `${formatNumber(spec.range)} m` : rep.value(spec.range)}.`
                : ''
            }`
          : 'Type the Moon’s angle from the Sun to place it.'}
      </Caption>
    </View>
  );
}
