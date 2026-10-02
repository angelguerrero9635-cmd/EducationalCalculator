import { useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import type {
  EarthLayersSpec,
  EarthSectionSpec,
  EpicenterSpec,
  SeismogramSpec,
} from '@/data/modules/typesHsl';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useRep } from './common';
import {
  arrivals,
  coreRay,
  EARTH,
  epicenterOf,
  EPICENTER_TOLERANCE,
  KM_PER_DEGREE,
  mantleRay,
  QUAKE_DEFAULTS,
  SHADOW,
  traceAt,
  wavesAt,
} from './earthModel';
import { EarthMagnitude } from './EarthMagnitude';
import { usePaintIds } from './paint';

/** A tick step of 1, 2 or 5 × 10ⁿ giving at most `most` steps over `span`. */
const tickStep = (span: number, most: number) => {
  const raw = span / most;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
};

const round = (x: number, places = 2) => Number(x.toFixed(places));

/** A five-pointed star centred on (x, y). */
const star = (x: number, y: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    return `${i ? 'L' : 'M'} ${(x + rr * Math.cos(a)).toFixed(1)} ${(y + rr * Math.sin(a)).toFixed(1)}`;
  }).join(' ') + ' Z';

/** Values of a spec field: a number, a variable's value, or a default. */
function useVals(calc: Calculator) {
  const rep = useRep(calc);
  return {
    rep,
    num: (x: number | string | undefined, d: number) =>
      x === undefined ? d : typeof x === 'number' ? x : rep.val(x),
    known: (x: number | string | undefined) =>
      x === undefined || typeof x === 'number' || rep.known(x),
    text: (x: number | string | undefined, d: number) =>
      x === undefined
        ? formatNumber(d)
        : typeof x === 'number'
          ? formatNumber(x)
          : rep.value(x, false),
  };
}

/** Earth's interior and earthquakes (see `EarthLayersSpec` in typesHsl.ts). */
export function EarthLayers({ spec, calc }: { spec: EarthLayersSpec; calc: Calculator }) {
  switch (spec.mode) {
    case 'section':
      return <Section spec={spec} calc={calc} />;
    case 'seismogram':
      return <Seismogram spec={spec} calc={calc} />;
    case 'epicenter':
      return <Epicenter spec={spec} calc={calc} />;
    case 'magnitude':
      return <EarthMagnitude spec={spec} calc={calc} />;
  }
}

// ── The cross-section ──

const BW = 360;
const BH = 396;
const CX = 180;
const CY = 180;
const R = 136;

/**
 * Earth cut through the focus, layers to scale, in their colors; P-wave paths on the left, S on
 * the right, the shadow zones as bands outside the surface, and a station at `distance` on both
 * halves (filled where that wave arrives, hollow where it doesn't).
 */
function Section({ spec, calc }: { spec: EarthSectionSpec; calc: Calculator }) {
  const { rep, num, known } = useVals(calc);
  const start = useRef(0);
  const id = typeof spec.distance === 'string' ? spec.distance : undefined;
  const has = spec.distance !== undefined;
  const delta = Math.max(0, Math.min(180, num(spec.distance, 60)));
  const on = has && known(spec.distance);
  const km = Math.round(delta * KM_PER_DEGREE);
  return (
    <View>
      <SectionDrawing
        delta={delta}
        has={has}
        on={on}
        overlay={(k, sx, sy) =>
          id && !spec.fixed ? (
            <DragHandle
              x={sx * k}
              y={sy * k}
              label="the station's distance"
              onStart={() => {
                start.current = delta;
              }}
              onMove={(dx, dy) => {
                const bx = sx + dx / k;
                const by = sy + dy / k;
                let deg = (Math.atan2(CX - bx, CY - by) * 180) / Math.PI;
                if (deg < 0) deg = bx > CX ? 0 : 180;
                calc.set({ [id]: rep.snapTo(id, Math.min(180, deg)) }, rep.slide(id));
              }}
            />
          ) : null
        }
      />
      <Caption>
        {!has
          ? `P waves pass through solids and liquids; S waves only through solids, so they stop at the liquid outer core.`
          : !on
            ? 'Type the station’s distance to place it.'
            : `A station ${formatNumber(round(delta, 1))}° from the focus is about ${formatNumber(km)} km away along the surface. ${
                delta < SHADOW.pFrom
                  ? 'P and S waves both reach it directly through the mantle.'
                  : delta < SHADOW.pTo
                    ? 'No direct P or S waves reach it: it is in the P-wave shadow zone, and S waves cannot cross the liquid outer core.'
                    : 'P waves reach it after bending through the core; S waves cannot cross the liquid outer core.'
              }`}
      </Caption>
    </View>
  );
}

/**
 * The cross-section itself, for a station `delta` degrees from the focus: the calculator picture
 * above and the `earthLayers` explore figure (H110) draw it. `has` draws the stations (faded
 * unless `on`); `overlay` puts a drag handle over the station on the P side at (sx, sy).
 */
export function SectionDrawing({
  delta,
  has,
  on,
  overlay,
}: {
  delta: number;
  has: boolean;
  on: boolean;
  overlay?: (k: number, sx: number, sy: number) => ReactNode;
}) {
  const c = usePalette();
  const ids = usePaintIds('mantle', 'outer', 'inner');
  const rc = EARTH.core / EARTH.radius;
  const ri = EARTH.inner / EARTH.radius;
  const P = ([x, y]: [number, number]) => [CX + x * R, CY - y * R] as const;
  const polyline = (pts: [number, number][]) =>
    pts.map((p, i) => `${i ? 'L' : 'M'} ${P(p)[0].toFixed(1)} ${P(p)[1].toFixed(1)}`).join(' ');
  const onSurface = (deg: number, side: 1 | -1, r = R) => {
    const a = (deg * Math.PI) / 180;
    return [CX + side * r * Math.sin(a), CY - r * Math.cos(a)] as const;
  };
  const band = (from: number, to: number, side: 1 | -1) => {
    const [x0, y0] = onSurface(from, side, R + 7);
    const [x1, y1] = onSurface(to, side, R + 7);
    return `M ${x0} ${y0} A ${R + 7} ${R + 7} 0 0 ${side === 1 ? 1 : 0} ${x1} ${y1}`;
  };
  const DIRECT = [20, 40, 60, 80, 94, 104];
  const waves = wavesAt(delta);
  const station = (side: 1 | -1, arrives: boolean, color: string) => {
    const [x, y] = onSurface(delta, side, R + 2);
    const a = (delta * Math.PI) / 180;
    // A small triangle standing on the surface, pointing out.
    const out = [side * Math.sin(a), -Math.cos(a)];
    const tan = [-out[1]!, out[0]!];
    const tip = [x + out[0]! * 12, y + out[1]! * 12];
    const d = `M ${x + tan[0]! * 6} ${y + tan[1]! * 6} L ${tip[0]} ${tip[1]} L ${x - tan[0]! * 6} ${y - tan[1]! * 6} Z`;
    return (
      <Path
        d={d}
        fill={arrives ? color : c.card}
        stroke={color}
        strokeWidth={chart.stroke}
        strokeLinejoin="round"
        opacity={on ? 1 : 0.4}
      />
    );
  };
  const degLabel = (deg: number, side: 1 | -1) => {
    const [x, y] = onSurface(deg, side, R + 24);
    const [x0, y0] = onSurface(deg, side, R + 2);
    const [x1, y1] = onSurface(deg, side, R + 14);
    return (
      <G key={`${deg}${side}`}>
        <Line x1={x0} y1={y0} x2={x1} y2={y1} stroke={c.chartInk} strokeWidth={1} />
        <ChartText
          // Inset from the drawing's edges (the left 104° started at x = 0).
          x={
            side === 1
              ? Math.min(x, BW - 4 - `${deg}°`.length * chart.label * 0.58)
              : Math.max(x, 4 + `${deg}°`.length * chart.label * 0.58)
          }
          y={y + 4}
          fontSize={chart.label}
          textAnchor={side === 1 ? 'start' : 'end'}
          fill={c.chartInk}
        >
          {`${deg}°`}
        </ChartText>
      </G>
    );
  };
  const key: [string, string][] = [
    ['crust', c.earthCrust],
    ['mantle', c.earthMantle],
    ['outer core (liquid)', c.earthOuterCore],
    ['inner core (solid)', c.earthInnerCore],
  ];
  return (
    <Canvas aspect={BH / BW}>
      {({ w, h }) => {
        const k = w / BW;
        const [sx, sy] = onSurface(delta, -1, R + 2);
        return (
          <>
            <Svg width={w} height={h}>
              <Defs>
                {(
                  [
                    [ids.mantle, c.earthMantle],
                    [ids.outer, c.earthOuterCore],
                    [ids.inner, c.earthInnerCore],
                  ] as const
                ).map(([gid, col]) => (
                  <RadialGradient key={gid} id={gid} cx="0.5" cy="0.5" r="0.5">
                    <Stop offset="0" stopColor={c.shine} stopOpacity={0.25 * c.sheen} />
                    <Stop offset="0.6" stopColor={col} stopOpacity={0} />
                    <Stop offset="1" stopColor={c.shade} stopOpacity={0.12} />
                  </RadialGradient>
                ))}
              </Defs>
              <G transform={`scale(${k})`}>
                {/* Layers: crust (drawn thicker than its 35 km to be seen), mantle, cores. */}
                <Circle cx={CX} cy={CY} r={R} fill={c.earthCrust} />
                <Circle cx={CX} cy={CY} r={R - 3} fill={c.earthMantle} />
                <Circle cx={CX} cy={CY} r={R - 3} fill={`url(#${ids.mantle})`} />
                <Circle cx={CX} cy={CY} r={rc * R} fill={c.earthOuterCore} />
                <Circle cx={CX} cy={CY} r={rc * R} fill={`url(#${ids.outer})`} />
                <Circle cx={CX} cy={CY} r={ri * R} fill={c.earthInnerCore} />
                <Circle cx={CX} cy={CY} r={R} fill="none" stroke={c.chartInk} strokeWidth={1.2} />
                {[rc, ri].map((r) => (
                  <Circle
                    key={r}
                    cx={CX}
                    cy={CY}
                    r={r * R}
                    fill="none"
                    stroke={c.chartInk}
                    strokeWidth={0.8}
                    strokeOpacity={0.6}
                  />
                ))}
                {/* P waves, left: direct paths to 104°, through the core to 140°–180°. */}
                {DIRECT.map((d) => (
                  <Path
                    key={`p${d}`}
                    d={polyline(mantleRay(d, -1))}
                    stroke={c.quakeP}
                    strokeWidth={1.6}
                    fill="none"
                  />
                ))}
                {[SHADOW.pTo, 158, 180].map((d) => (
                  <Path
                    key={`pk${d}`}
                    d={polyline(coreRay(d, -1))}
                    stroke={c.quakeP}
                    strokeWidth={1.6}
                    fill="none"
                    strokeLinejoin="round"
                  />
                ))}
                {/* S waves, right: direct paths to 104°; the ones sent deeper stop at the core. */}
                {DIRECT.map((d) => (
                  <Path
                    key={`s${d}`}
                    d={polyline(mantleRay(d, 1))}
                    stroke={c.quakeS}
                    strokeWidth={1.6}
                    strokeDasharray="6 3"
                    fill="none"
                  />
                ))}
                {[12, 26, 40].map((a) => {
                  const r = (a * Math.PI) / 180;
                  const [ex, ey] = P([rc * Math.sin(r), rc * Math.cos(r)]);
                  const [nx, ny] = [Math.sin(r), -Math.cos(r)];
                  return (
                    <G key={`sc${a}`}>
                      <Path
                        d={`M ${CX} ${CY - R} L ${ex} ${ey}`}
                        stroke={c.quakeS}
                        strokeWidth={1.6}
                        strokeDasharray="6 3"
                      />
                      <Path
                        d={`M ${ex - ny * 5} ${ey + nx * 5} L ${ex + ny * 5} ${ey - nx * 5}`}
                        stroke={c.quakeS}
                        strokeWidth={2.4}
                      />
                    </G>
                  );
                })}
                {/* The shadow zones, as bands outside the surface. */}
                <Path
                  d={band(SHADOW.pFrom, SHADOW.pTo, -1)}
                  stroke={c.quakeP}
                  strokeWidth={6}
                  strokeOpacity={0.55}
                  fill="none"
                />
                <Path
                  d={band(SHADOW.sFrom, 180, 1)}
                  stroke={c.quakeS}
                  strokeWidth={6}
                  strokeOpacity={0.55}
                  fill="none"
                />
                {degLabel(SHADOW.pFrom, -1)}
                {degLabel(SHADOW.pTo, -1)}
                {degLabel(SHADOW.sFrom, 1)}
                {/* The focus, at the top. */}
                <Path
                  d={star(CX, CY - R, 9)}
                  fill={c.chartSecond}
                  stroke={c.chartInk}
                  strokeWidth={1}
                />
                <ChartText x={CX} y={CY - R - 14} fontSize={chart.label} textAnchor="middle">
                  focus
                </ChartText>
                <ChartText x={8} y={20} fontSize={chart.value} fontWeight="700" fill={c.quakeP}>
                  P waves
                </ChartText>
                <ChartText
                  x={BW - 8}
                  y={20}
                  fontSize={chart.value}
                  fontWeight="700"
                  textAnchor="end"
                  fill={c.quakeS}
                >
                  S waves
                </ChartText>
                <ChartText x={8} y={CY + R + 26} fontSize={chart.label} fill={c.quakeP}>
                  {`P shadow zone ${SHADOW.pFrom}°–${SHADOW.pTo}°`}
                </ChartText>
                <ChartText
                  x={BW - 8}
                  y={CY + R + 26}
                  fontSize={chart.label}
                  textAnchor="end"
                  fill={c.quakeS}
                >
                  {`no S waves past ${SHADOW.sFrom}°`}
                </ChartText>
                {has ? station(-1, waves.p, c.quakeP) : null}
                {has ? station(1, waves.s, c.quakeS) : null}
                {/* The key to the layers. */}
                {key.map(([name, col], i) => {
                  const x = i % 2 ? 190 : 12;
                  const y = CY + R + 48 + Math.floor(i / 2) * 20;
                  return (
                    <G key={name}>
                      <Rect
                        x={x}
                        y={y - 10}
                        width={12}
                        height={12}
                        rx={3}
                        fill={col}
                        stroke={c.chartInk}
                        strokeWidth={0.8}
                      />
                      <ChartText x={x + 18} y={y} fontSize={chart.label}>
                        {name}
                      </ChartText>
                    </G>
                  );
                })}
              </G>
            </Svg>
            {overlay?.(k, sx, sy)}
          </>
        );
      }}
    </Canvas>
  );
}

// ── The seismogram ──

const SH = 236;

/** A station's trace: quiet, then P, the bigger S, the biggest surface waves; S − P bracketed. */
function Seismogram({ spec, calc }: { spec: SeismogramSpec; calc: Calculator }) {
  const c = usePalette();
  const { num, known, text } = useVals(calc);
  const km = Math.max(1, num(spec.km, 100));
  const vp = Math.max(0.1, num(spec.vp, QUAKE_DEFAULTS.vp));
  const vs = Math.max(0.05, Math.min(vp * 0.99, num(spec.vs, QUAKE_DEFAULTS.vs)));
  const a = arrivals(km, vp, vs);
  const all = [spec.km, spec.vp, spec.vs].every(known);
  const step = tickStep(a.surface * 1.35, 6);
  const tMax = Math.ceil((a.surface * 1.35) / step) * step;
  const lag =
    spec.lag !== undefined && known(spec.lag)
      ? text(spec.lag, 0)
      : all
        ? formatNumber(round(a.s - a.p))
        : '?'; // never worked from the example's numbers behind a "?"
  return (
    <View>
      <Canvas aspect={SH / 358}>
        {({ w, h }) => {
          const left = 14;
          const right = w - 14;
          const X = (t: number) => left + (t / tMax) * (right - left);
          const mid = 122;
          const amp = 50;
          const axis = 192;
          let d = '';
          for (let i = 0; i <= 700; i++) {
            const t = (i / 700) * tMax;
            d += `${i ? 'L' : 'M'} ${X(t).toFixed(1)} ${(mid - amp * traceAt(t, a)).toFixed(1)} `;
          }
          const ticks = Array.from({ length: Math.round(tMax / step) + 1 }, (_, i) => i * step);
          const arrival = (t: number, name: string, color: string) => {
            const label = `${name} ${all ? formatNumber(round(t, 1)) : '?'} s`;
            const fit = fitLabel(X(t), label, chart.label, w, 'middle');
            return (
              <G key={name}>
                <Line
                  x1={X(t)}
                  y1={22}
                  x2={X(t)}
                  y2={axis}
                  stroke={color}
                  strokeWidth={1.5}
                  strokeDasharray={chart.dash}
                />
                <ChartText
                  x={fit.x}
                  y={14}
                  fontSize={chart.label}
                  fontWeight="700"
                  textAnchor={fit.textAnchor}
                  fill={color}
                >
                  {label}
                </ChartText>
              </G>
            );
          };
          const lagText = `S − P = ${lag} s`;
          const lagFit = fitLabel((X(a.p) + X(a.s)) / 2, lagText, chart.value, w, 'middle');
          const surf = fitLabel(X(a.surface) + 4, 'surface waves', chart.label, w, 'start');
          return (
            <Svg width={w} height={h} opacity={all ? 1 : 0.4}>
              <Line x1={left} y1={mid} x2={right} y2={mid} stroke={c.chartGrid} strokeWidth={1} />
              <Path d={d} stroke={c.chartInk} strokeWidth={1.3} fill="none" />
              {arrival(a.p, 'P', c.quakeP)}
              {arrival(a.s, 'S', c.quakeS)}
              {/* The lag between the arrivals, bracketed. */}
              <Path
                d={`M ${X(a.p)} 34 H ${X(a.s)} M ${X(a.p) + 6} 30 L ${X(a.p)} 34 L ${X(a.p) + 6} 38 M ${X(a.s) - 6} 30 L ${X(a.s)} 34 L ${X(a.s) - 6} 38`}
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
                fill="none"
              />
              <ChartText
                x={lagFit.x}
                y={54}
                fontSize={chart.value}
                fontWeight="700"
                textAnchor={lagFit.textAnchor}
                fill={c.chartHighlight}
              >
                {lagText}
              </ChartText>
              <ChartText
                x={surf.x}
                y={64}
                fontSize={chart.label}
                textAnchor={surf.textAnchor}
                fill={c.chartMuted}
              >
                surface waves
              </ChartText>
              <Line
                x1={left}
                y1={axis}
                x2={right}
                y2={axis}
                stroke={c.chartInk}
                strokeWidth={1.5}
              />
              {ticks.map((t) => (
                <G key={t}>
                  <Line x1={X(t)} y1={axis} x2={X(t)} y2={axis + 5} stroke={c.chartInk} />
                  <ChartText
                    x={fitLabel(X(t), formatNumber(t), chart.label, w).x}
                    y={axis + 18}
                    fontSize={chart.label}
                    textAnchor="middle"
                    fill={c.chartMuted}
                  >
                    {formatNumber(t)}
                  </ChartText>
                </G>
              ))}
              <ChartText
                x={(left + right) / 2}
                y={h - 4}
                fontSize={chart.label}
                textAnchor="middle"
                fill={c.chartMuted}
              >
                Seconds after the earthquake
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {all
          ? `P arrives after ${text(spec.km, 100)} ÷ ${text(spec.vp, QUAKE_DEFAULTS.vp)} = ${formatNumber(round(a.p, 1))} s; S after ${text(spec.km, 100)} ÷ ${text(spec.vs, QUAKE_DEFAULTS.vs)} = ${formatNumber(round(a.s, 1))} s. The farther the station, the longer the lag.`
          : 'Type the distance and the wave speeds to draw the trace.'}
      </Caption>
    </View>
  );
}

// ── The epicenter ──

/** Three stations and their distance circles on a km grid; the epicenter where they meet. */
function Epicenter({ spec, calc }: { spec: EpicenterSpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, num, known } = useVals(calc);
  const colors = [c.chartHighlight, c.fnSecond, c.lineSum];
  const st = spec.stations.map((s) => ({ ...s, r: Math.max(0, num(s.r, 100)) }));
  const all = spec.stations.every((s) => known(s.r));
  const hit = epicenterOf(st);
  const biggest = Math.max(...st.map((s) => s.r), 1);
  const meets = !!hit && hit.miss <= EPICENTER_TOLERANCE * biggest;
  const xs = st.flatMap((s) => [s.x - s.r, s.x + s.r]);
  const ys = st.flatMap((s) => [s.y - s.r, s.y + s.r]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const step = tickStep(Math.max(x1 - x0, y1 - y0), 6);
  const gx0 = Math.floor(x0 / step) * step;
  const gx1 = Math.ceil(x1 / step) * step;
  const gy0 = Math.floor(y0 / step) * step;
  const gy1 = Math.ceil(y1 / step) * step;
  const aspect = Math.min(1.4, Math.max(0.6, (gy1 - gy0) / (gx1 - gx0)));
  return (
    <View>
      <Canvas aspect={(w) => (aspect * (w - 52) + 40) / w}>
        {({ w, h }) => {
          const left = 50;
          const top = 10;
          const bottom = h - 30;
          const s = Math.min((w - left - 8) / (gx1 - gx0), (bottom - top) / (gy1 - gy0));
          const X = (x: number) => left + (x - gx0) * s;
          const Y = (y: number) => bottom - (y - gy0) * s;
          const lines: ReactNode[] = [];
          for (let x = gx0; x <= gx1 + 1e-9; x += step)
            lines.push(
              <G key={`x${x}`}>
                <Line x1={X(x)} y1={Y(gy0)} x2={X(x)} y2={Y(gy1)} stroke={c.chartGrid} />
                <ChartText
                  x={X(x)}
                  y={bottom + 16}
                  fontSize={chart.label}
                  textAnchor="middle"
                  fill={c.chartMuted}
                >
                  {formatNumber(x)}
                </ChartText>
              </G>,
            );
          for (let y = gy0; y <= gy1 + 1e-9; y += step)
            lines.push(
              <G key={`y${y}`}>
                <Line x1={X(gx0)} y1={Y(y)} x2={X(gx1)} y2={Y(y)} stroke={c.chartGrid} />
                <ChartText
                  x={left - 5}
                  y={Y(y) + 4}
                  fontSize={chart.label}
                  textAnchor="end"
                  fill={c.chartMuted}
                >
                  {formatNumber(y)}
                </ChartText>
              </G>,
            );
          return (
            <Svg width={w} height={h}>
              {lines}
              <ChartText
                x={(X(gx0) + X(gx1)) / 2}
                y={h - 2}
                fontSize={chart.label}
                textAnchor="middle"
                fill={c.chartMuted}
              >
                km east
              </ChartText>
              <ChartText
                x={10}
                y={(top + bottom) / 2}
                fontSize={chart.label}
                textAnchor="middle"
                fill={c.chartMuted}
                transform={`rotate(-90 10 ${(top + bottom) / 2})`}
              >
                km north
              </ChartText>
              <G opacity={all && meets ? 1 : 0.4}>
                {st.map((p, i) => (
                  <Circle
                    key={p.name}
                    cx={X(p.x)}
                    cy={Y(p.y)}
                    r={p.r * s}
                    fill={colors[i]}
                    fillOpacity={0.06}
                    stroke={colors[i]}
                    strokeWidth={chart.stroke}
                  />
                ))}
              </G>
              {st.map((p, i) => {
                const [x, y] = [X(p.x), Y(p.y)];
                const r = spec.stations[i]!.r;
                const label = `${p.name}: ${typeof r === 'string' ? rep.value(r) : `${formatNumber(r)} km`}`;
                const fit = fitLabel(x + 10, label, chart.label, w, 'start', 5);
                return (
                  <G key={`s${p.name}`}>
                    <Path
                      d={`M ${x - 7} ${y + 6} L ${x} ${y - 7} L ${x + 7} ${y + 6} Z`}
                      fill={colors[i]}
                      stroke={c.card}
                      strokeWidth={1.5}
                    />
                    <ChartText
                      x={fit.x}
                      y={y - 8}
                      fontSize={chart.label}
                      fontWeight="700"
                      textAnchor={fit.textAnchor}
                      fill={colors[i]}
                    >
                      {label}
                    </ChartText>
                  </G>
                );
              })}
              {hit && meets && all ? (
                <Path
                  d={star(X(hit.x), Y(hit.y), 10)}
                  fill={c.chartSecond}
                  stroke={c.chartInk}
                  strokeWidth={1.2}
                />
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {!all
          ? 'Type each station’s distance to draw its circle.'
          : meets && hit
            ? `The three circles meet at one point, ${formatNumber(Math.round(hit.x))} km east and ${formatNumber(Math.round(hit.y))} km north: the epicenter.`
            : 'These circles don’t meet at one point: check the distances.'}
      </Caption>
    </View>
  );
}
