/**
 * HC133 `contourMap` (ContourMapSpec in typesHe4h.ts): a made-up hill of contours at CI, every
 * fifth from A's bold with its elevation; the transect A–B straight up it across n intervals;
 * a scale bar for 1:scale; and under the map the profile lined up with the transect, rise and run
 * bracketed, the gradient and angle written. Flat; no handles.
 */
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { ContourMapSpec } from '@/data/modules/typesHe4h';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import {
  HILL_SQUASH,
  contourCount,
  contourShare,
  hillR,
  niceBelow,
  transectEnds,
} from './he4hMath';
import { usePaintIds } from './paint';

const n3 = (x: number) => formatNumber(Number(x.toPrecision(3)));

const MAP_H = 210;
/** Space under the map for the scale row, then the profile and its run row. */
const SCALE_ROW = 8;
/** The legend box on the map's corner (scale and bar). */
const LEGEND_W = 150;
const LEGEND_H = 50;
const PROFILE_H = 100;
const RUN_ROW = 44;
/** A's distance from the left edge (room for the profile's elevations). */
const A_X = 58;

export function ContourMap({ spec, calc }: { spec: ContourMapSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('frame');
  type V = number | string | undefined;
  const known = (v: V) => v !== undefined && (typeof v === 'number' || rep.known(v));
  const get = (v: V): number | undefined =>
    !known(v) ? undefined : typeof v === 'number' ? v : rep.shown(v as string);
  // A typed value reads as typed; a worked-out one to 3 figures.
  const say = (v: V, x: number, unit = '') =>
    typeof v === 'string' && rep.typed(v)
      ? rep.value(v, unit !== '')
      : `${n3(x)}${unit ? (unit === '%' || unit === '°' ? unit : ` ${unit}`) : ''}`;
  const CI = get(spec.interval);
  const nRaw = get(spec.crossed);
  const n = nRaw !== undefined && nRaw >= 0 ? Math.round(nRaw) : undefined;
  const map = get(spec.mapDistance);
  const denom = get(spec.scale);
  const base = spec.base !== undefined ? get(spec.base) : CI !== undefined ? 10 * CI : undefined;
  const rise = n !== undefined && CI !== undefined ? n * CI : undefined;
  const ground = map !== undefined && denom !== undefined ? (map * denom) / 100 : undefined;
  const gradient = rise !== undefined && ground ? (100 * rise) / ground : undefined;
  const angle =
    rise !== undefined && ground ? (Math.atan(rise / ground) * 180) / Math.PI : undefined;
  const elev = (k: number) => (base !== undefined && CI !== undefined ? base + k * CI : undefined);
  const m = (x: number) => `${formatNumber(Number(x.toPrecision(6)))} m`;
  const K = contourCount(n ?? 3);
  const ends = n !== undefined ? transectEnds(n) : undefined;

  const lines: string[] = [];
  if (rise !== undefined)
    lines.push(
      `Rise = n × CI = ${say(spec.crossed, n!)} × ${say(spec.interval, CI!, 'm')} = ${say(spec.rise, rise, 'm')}.`,
    );
  if (ground !== undefined)
    lines.push(
      `Run = ${say(spec.mapDistance, map!, 'cm')} × ${formatNumber(denom!)} ÷ 100 = ${say(spec.ground, ground, 'm')}.`,
    );
  if (gradient !== undefined && angle !== undefined)
    lines.push(
      `Gradient = 100 × rise ÷ run = ${say(spec.gradient, gradient, '%')}; angle = tan⁻¹(rise ÷ run) = ${say(spec.angle, angle, '°')}.`,
    );
  if (n === undefined) lines.push('Type n to draw the line A–B across the contours.');

  return (
    <View>
      <Canvas aspect={(w) => (MAP_H + SCALE_ROW + PROFILE_H + RUN_ROW) / w}>
        {({ w }) => {
          const mw = w - 8;
          const step = 0.9 / K;
          const reach = ends ? ends.a : 1;
          // The hill's size: A near the left edge, the summit about 70% across, the outer
          // contours running off the map frame like a real sheet.
          const Rpx = Math.min(
            (0.72 * w - A_X) / (hillR(Math.PI) * reach),
            (MAP_H * 1.15) / 2 / HILL_SQUASH,
          );
          const sx = A_X + hillR(Math.PI) * Rpx * reach;
          const sy = MAP_H * 0.5;
          const at = (share: number, t: number) => ({
            x: sx + share * hillR(t) * Rpx * Math.cos(t),
            y: sy + share * hillR(t) * Rpx * HILL_SQUASH * Math.sin(t),
          });
          const ring = (share: number) => {
            let d = '';
            for (let j = 0; j <= 96; j++) {
              const p = at(share, (j / 96) * 2 * Math.PI);
              d += `${j ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            }
            return `${d}Z`;
          };
          const xA = ends ? at(ends.a, Math.PI).x : 0;
          const xB = ends ? at(ends.b, Math.PI).x : 0;
          // Index contours labelled up and to the right, never closer than 16 px apart.
          const tL = -1.15;
          const gapPx = 5 * step * hillR(tL) * Rpx * 0.8;
          const every = Math.max(1, Math.ceil(16 / Math.max(1, gapPx)));
          // The scale bar: px per map cm from AB, a round ground length near 110 px.
          const pxPerCm = ends && map && n !== undefined && n > 0 ? (xB - xA) / map : undefined;
          const mPerPx = pxPerCm && denom ? denom / 100 / pxPerCm : undefined;
          const barM = mPerPx ? niceBelow((LEGEND_W - 50) * mPerPx) : undefined;
          const barPx = barM && mPerPx ? barM / mPerPx : 0;
          const lx = w - 8 - LEGEND_W / 2 - barPx / 2;
          // The profile: lined up with the transect.
          const pTop = MAP_H + SCALE_ROW + 14;
          const pBot = pTop + PROFILE_H - 14;
          const yOf = (k: number) =>
            n === undefined || n === 0 ? (pTop + pBot) / 2 : pBot - (k / n) * (pBot - pTop);
          const xOf = (k: number) => (n === undefined || n === 0 ? xA : xA + (k / n) * (xB - xA));
          const ve = rise && ground && n ? (pBot - pTop) / rise / ((xB - xA) / ground) : undefined;
          const gradText =
            gradient !== undefined && angle !== undefined
              ? `slope ${say(spec.gradient, gradient, '%')} (${say(spec.angle, angle, '°')})`
              : '';
          return (
            <Svg width={w} height={MAP_H + SCALE_ROW + PROFILE_H + RUN_ROW}>
              <Defs>
                <ClipPath id={ids.frame}>
                  <Rect x={4} y={2} width={mw} height={MAP_H - 4} />
                </ClipPath>
              </Defs>
              {/* The map sheet and its contours. */}
              <Rect
                x={4}
                y={2}
                width={mw}
                height={MAP_H - 4}
                fill={c.he4hMapPaper}
                stroke={c.chartGrid}
              />
              <G clipPath={`url(#${ids.frame})`}>
                {Array.from({ length: K }, (_, k) => (
                  <Path
                    key={`c${k}`}
                    d={ring(contourShare(k, K))}
                    fill="none"
                    stroke={c.he4hContour}
                    strokeWidth={k % 5 === 0 ? 2.2 : 1}
                  />
                ))}
                {CI !== undefined
                  ? Array.from({ length: K }, (_, k) => k)
                      .filter((k) => k % 5 === 0 && (k / 5) % every === 0)
                      .map((k) => {
                        const p = at(contourShare(k, K), tL);
                        const t = m(elev(k)!);
                        if (p.y < 14 || p.y > MAP_H - 6 || p.x > w - 30) return null;
                        return (
                          <ChartText
                            key={`e${k}`}
                            x={p.x}
                            y={p.y + 4}
                            textAnchor="middle"
                            fill={c.he4hContour}
                            fontWeight="700"
                            halo={c.he4hMapPaper}
                          >
                            {t}
                          </ChartText>
                        );
                      })
                  : null}
                <Path
                  d={`M${sx - 5},${sy + 4}L${sx},${sy - 5}L${sx + 5},${sy + 4}Z`}
                  fill={c.chartInk}
                />
              </G>
              {/* The transect A–B. */}
              {ends ? (
                <G>
                  <Line
                    x1={xA}
                    y1={sy}
                    x2={xB}
                    y2={sy}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                  />
                  {[
                    [xA, 'A', 0],
                    [xB, 'B', n!],
                  ].map(([x, name, k]) => (
                    <G key={name as string}>
                      <Circle cx={x as number} cy={sy} r={4.5} fill={c.chartHighlight} />
                      <ChartText
                        x={x as number}
                        y={sy - 9}
                        textAnchor="middle"
                        fontWeight="700"
                        fontSize={chart.value}
                        halo={c.he4hMapPaper}
                      >
                        {name as string}
                      </ChartText>
                      {elev(k as number) !== undefined && n! > 0 ? (
                        <ChartText
                          x={x as number}
                          y={sy + 20}
                          textAnchor="middle"
                          halo={c.he4hMapPaper}
                        >
                          {m(elev(k as number)!)}
                        </ChartText>
                      ) : null}
                    </G>
                  ))}
                </G>
              ) : null}
              {/* The legend: a scale bar for 1:S in a box on the sheet's corner. */}
              {barM !== undefined ? (
                <G>
                  <Rect
                    x={w - 8 - LEGEND_W}
                    y={MAP_H - 8 - LEGEND_H}
                    width={LEGEND_W}
                    height={LEGEND_H}
                    fill={c.he4hMapPaper}
                    stroke={c.chartGrid}
                  />
                  <ChartText
                    x={w - 8 - LEGEND_W / 2}
                    y={MAP_H - 8 - LEGEND_H + 16}
                    textAnchor="middle"
                    fontWeight="700"
                  >
                    {`1:${formatNumber(denom!)}`}
                  </ChartText>
                  <Rect x={lx} y={MAP_H - 36} width={barPx / 2} height={5} fill={c.chartInk} />
                  <Rect
                    x={lx + barPx / 2}
                    y={MAP_H - 36}
                    width={barPx / 2}
                    height={5}
                    fill={c.he4hMapPaper}
                    stroke={c.chartInk}
                  />
                  <ChartText x={lx} y={MAP_H - 15} textAnchor="middle">
                    0
                  </ChartText>
                  <ChartText x={lx + barPx} y={MAP_H - 15} textAnchor="middle">
                    {barM >= 1000 ? `${formatNumber(barM / 1000)} km` : `${formatNumber(barM)} m`}
                  </ChartText>
                </G>
              ) : null}
              {/* The profile under the transect. */}
              {ends ? (
                <G>
                  <Line
                    x1={xA - 6}
                    y1={pBot + 6}
                    x2={Math.max(xB, xA + 20) + 6}
                    y2={pBot + 6}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                  {Array.from({ length: n! + 1 }, (_, k) => k)
                    .filter((k) => n! <= 15 || k % 5 === 0 || k === n)
                    .map((k) => (
                      <Line
                        key={`v${k}`}
                        x1={xOf(k)}
                        y1={k === 0 || k === n ? sy + 26 : sy + 6}
                        x2={xOf(k)}
                        y2={yOf(k)}
                        stroke={c.chartMuted}
                        strokeWidth={1}
                        strokeDasharray={chart.dashFine}
                        strokeOpacity={0.6}
                      />
                    ))}
                  <Path
                    d={`M${xA},${yOf(0)}L${xB},${yOf(n!)}`}
                    stroke={c.he4hContour}
                    strokeWidth={chart.strokeHeavy}
                    fill="none"
                  />
                  {n! <= 40
                    ? Array.from({ length: n! + 1 }, (_, k) => (
                        <Circle
                          key={`p${k}`}
                          cx={xOf(k)}
                          cy={yOf(k)}
                          r={k % 5 === 0 ? 3.5 : 2.5}
                          fill={c.he4hContour}
                        />
                      ))
                    : null}
                  {elev(0) !== undefined ? (
                    <G>
                      <ChartText x={xA - 8} y={yOf(0) + 4} textAnchor="end">
                        {m(elev(0)!)}
                      </ChartText>
                      {n! > 0 ? (
                        <ChartText x={xA - 8} y={yOf(n!) + 4} textAnchor="end">
                          {m(elev(n!)!)}
                        </ChartText>
                      ) : null}
                    </G>
                  ) : null}
                  {/* Rise, right of B. */}
                  {rise !== undefined && n! > 0 ? (
                    <G>
                      <Line
                        x1={xB + 10}
                        y1={pTop}
                        x2={xB + 10}
                        y2={pBot}
                        stroke={c.chartInk}
                        strokeWidth={1}
                      />
                      {[pTop, pBot].map((y) => (
                        <Line
                          key={`r${y}`}
                          x1={xB + 6}
                          y1={y}
                          x2={xB + 14}
                          y2={y}
                          stroke={c.chartInk}
                          strokeWidth={1}
                        />
                      ))}
                      <ChartText
                        {...fitLabel(xB + 18, `rise ${m(rise)}`, chart.label, w, 'start')}
                        y={(pTop + pBot) / 2 + 4}
                        fontWeight="700"
                      >
                        {`rise ${m(rise)}`}
                      </ChartText>
                    </G>
                  ) : null}
                  {/* Gradient, under the rise, right of B. */}
                  {gradText ? (
                    <ChartText
                      {...fitLabel(xB + 18, gradText, chart.label, w, 'start')}
                      y={(pTop + pBot) / 2 + 24}
                      fill={c.he4hContour}
                      fontWeight="700"
                    >
                      {gradText}
                    </ChartText>
                  ) : null}
                  {/* Run, under the profile. */}
                  {ground !== undefined ? (
                    <G>
                      <Line
                        x1={xA}
                        y1={pBot + 18}
                        x2={xB}
                        y2={pBot + 18}
                        stroke={c.chartInk}
                        strokeWidth={1}
                      />
                      {[xA, xB].map((x) => (
                        <Line
                          key={`u${x}`}
                          x1={x}
                          y1={pBot + 14}
                          x2={x}
                          y2={pBot + 22}
                          stroke={c.chartInk}
                          strokeWidth={1}
                        />
                      ))}
                      <ChartText
                        {...fitLabel((xA + xB) / 2, `run ${m(ground)}`, chart.label, w)}
                        y={pBot + 36}
                        fontWeight="700"
                      >
                        {`run ${m(ground)}`}
                      </ChartText>
                    </G>
                  ) : null}
                  {ve !== undefined && ve > 1.5 ? (
                    <ChartText x={w - 6} y={pTop - 2} textAnchor="end" fill={c.chartMuted}>
                      {`height × ${formatNumber(Math.round(ve))}`}
                    </ChartText>
                  ) : null}
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
