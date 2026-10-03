/**
 * HC129 `catchment` (CatchmentSpec in typesHe4h.ts): the rational method. A small basin from
 * above, painted as land, to scale by its km bar (the outline holds A); its streams run to the
 * outlet at the bottom, where the arrow carries Qₚ. Rain at i falls from a cloud band; of the 40
 * drops on the basin, round(40C) run to the streams and the rest soak in. No handles.
 */
import { View } from 'react-native';
import Svg, { Defs, Ellipse, G, Line, Path, Polygon } from 'react-native-svg';

import type { CatchmentSpec } from '@/data/modules/typesHe4h';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import {
  BASIN,
  BASIN_AREA,
  CATCHMENT_DROP_AT,
  CATCHMENT_DROPS,
  OUTLET,
  RUNOFF_ORDER,
  STREAMS,
  nearestOn,
  niceBelow,
  rainStreaks,
  rationalPeak,
  runoffDrops,
  smoothPath,
  type Pt,
} from './he4hMath';
import { Deepen, TopLight, url, usePaintIds } from './paint';

const n3 = (x: number) => formatNumber(Number(x.toPrecision(3)));

/** A water drop (pointed at the top) centred on (x, y), `s` tall. */
const dropPath = (x: number, y: number, s: number) => {
  const h = s / 2;
  return `M${x},${y - h}C${x + h * 0.95},${y - h * 0.05} ${x + h * 0.75},${y + h} ${x},${y + h}C${x - h * 0.75},${y + h} ${x - h * 0.95},${y - h * 0.05} ${x},${y - h}Z`;
};

const minX = Math.min(...BASIN.map((p) => p.x));
const maxX = Math.max(...BASIN.map((p) => p.x));
const minY = Math.min(...BASIN.map((p) => p.y));
const maxY = Math.max(...BASIN.map((p) => p.y));

export function Catchment({ spec, calc }: { spec: CatchmentSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('land', 'light');
  type V = number | string | undefined;
  const known = (v: V) => v !== undefined && (typeof v === 'number' || rep.known(v));
  const get = (v: V): number | undefined =>
    !known(v) ? undefined : typeof v === 'number' ? v : rep.shown(v as string);
  // A typed value reads as typed; a worked-out one to 3 figures.
  const say = (v: V, x: number, unit = '') =>
    typeof v === 'string' && rep.typed(v)
      ? rep.value(v, unit !== '')
      : `${n3(x)}${unit ? ` ${unit}` : ''}`;
  const C = get(spec.coefficient);
  const i = get(spec.intensity);
  const A = get(spec.area);
  const Cok = C !== undefined && C >= 0 && C <= 1;
  const iOk = i !== undefined && i > 0;
  const aOk = A !== undefined && A > 0;
  const Qcalc = Cok && iOk && aOk ? rationalPeak(C, i, A) : undefined;
  const Qtext =
    spec.peak && rep.known(spec.peak) && rep.typed(spec.peak)
      ? rep.value(spec.peak)
      : Qcalc !== undefined
        ? `${n3(Qcalc)} m³/s`
        : undefined;
  const k = Cok ? runoffDrops(C) : 0;
  const runs = new Set(RUNOFF_ORDER.slice(0, k));

  const lines: string[] = [];
  if (Qtext !== undefined && Qcalc !== undefined)
    lines.push(
      `Qₚ = CiA ÷ 3.6 = ${say(spec.coefficient, C!)} × ${say(spec.intensity, i!)} × ${say(spec.area, A!)} ÷ 3.6 = ${Qtext}.`,
    );
  if (Cok)
    lines.push(
      `${k} of ${CATCHMENT_DROPS} drops run off to the outlet (C = ${say(spec.coefficient, C)}); ${CATCHMENT_DROPS - k} soak in.`,
    );
  else lines.push('Type C to split the rain into runoff and what soaks in.');
  if (aOk)
    lines.push(`The basin is drawn to scale: its outline holds ${say(spec.area, A, 'km²')}.`);

  return (
    <View>
      <Canvas aspect={(w) => layout(w).h / w}>
        {({ w, h }) => {
          const L = layout(w);
          const P = (p: Pt) => ({ x: L.cx + p.x * L.U, y: L.top + (p.y - minY) * L.U });
          const poly = BASIN.map(P);
          const out = P(OUTLET);
          const kmPerPx = aOk ? Math.sqrt(A / BASIN_AREA) / L.U : undefined;
          const barKm = kmPerPx ? niceBelow(90 * kmPerPx) : undefined;
          const barPx = barKm && kmPerPx ? barKm / kmPerPx : 0;
          const barText =
            barKm === undefined
              ? ''
              : barKm < 1
                ? `${formatNumber(Number((barKm * 1000).toPrecision(3)))} m`
                : `${formatNumber(barKm)} km`;
          const streaks = iOk ? rainStreaks(i) : 0;
          const cloudL = L.cx - (maxX - minX) * 0.5 * L.U;
          const cloudR = L.cx + (maxX - minX) * 0.5 * L.U;
          const iText = iOk ? `i = ${say(spec.intensity, i, 'mm/h')}` : '';
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Deepen id={ids.land} from={c.he4hLand} to={c.he4hLandDeep} />
                <TopLight id={ids.light} />
              </Defs>
              {/* The cloud band and the rain. */}
              {[0.08, 0.3, 0.52, 0.74, 0.92].map((f, j) => (
                <Ellipse
                  key={`c${j}`}
                  cx={cloudL + f * (cloudR - cloudL)}
                  cy={18 + (j % 2) * 3}
                  rx={(cloudR - cloudL) * 0.14}
                  ry={12}
                  fill={c.rainCloud}
                />
              ))}
              {Array.from({ length: streaks }, (_, j) => {
                const x = cloudL + 8 + ((j + 0.5) / streaks) * (cloudR - cloudL - 16);
                const y = 32 + ((j * 7) % 3) * 4;
                return (
                  <Line
                    key={`r${j}`}
                    x1={x}
                    y1={y}
                    x2={x - 3}
                    y2={y + 10}
                    stroke={c.water}
                    strokeWidth={chart.strokeLight}
                    strokeLinecap="round"
                  />
                );
              })}
              {iOk ? (
                <ChartText
                  x={cloudL + (cloudR - cloudL) / 2}
                  y={23}
                  textAnchor="middle"
                  fontWeight="700"
                  halo={c.rainCloud}
                >
                  {iText}
                </ChartText>
              ) : null}
              {/* The basin: land within its divide, the streams to the outlet. */}
              <Polygon
                points={poly.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
                fill={url(ids.land)}
              />
              <Polygon
                points={poly.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
                fill={url(ids.light)}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              {STREAMS.map((s, j) => (
                <Path
                  key={`s${j}`}
                  d={smoothPath(s, false, P)}
                  fill="none"
                  stroke={c.waterDeep}
                  strokeWidth={j === 0 ? 3.5 : 2}
                  strokeLinecap="round"
                />
              ))}
              {/* The drops: run off (filled, arrow to the stream) or soak in (hollow, a tick). */}
              {Cok
                ? CATCHMENT_DROP_AT.map((u, j) => {
                    const p = P(u);
                    if (runs.has(j)) {
                      const near = STREAMS.map((s) => nearestOn(u, s)).sort(
                        (a, b) => a.d - b.d,
                      )[0]!;
                      const to = P(near.at);
                      const d = Math.hypot(to.x - p.x, to.y - p.y);
                      const len = Math.min(11, Math.max(0, d - 3));
                      const ux = (to.x - p.x) / (d || 1);
                      const uy = (to.y - p.y) / (d || 1);
                      const ex = p.x + ux * (4 + len);
                      const ey = p.y + uy * (4 + len);
                      return (
                        <G key={`d${j}`}>
                          <Line
                            x1={p.x + ux * 4}
                            y1={p.y + uy * 4}
                            x2={ex}
                            y2={ey}
                            stroke={c.waterDeep}
                            strokeWidth={1.2}
                          />
                          <Path
                            d={`M${ex - ux * 3.5 - uy * 2.2},${ey - uy * 3.5 + ux * 2.2}L${ex},${ey}L${ex - ux * 3.5 + uy * 2.2},${ey - uy * 3.5 - ux * 2.2}`}
                            fill="none"
                            stroke={c.waterDeep}
                            strokeWidth={1.2}
                          />
                          <Path d={dropPath(p.x, p.y, 8)} fill={c.waterDeep} />
                        </G>
                      );
                    }
                    return (
                      <G key={`d${j}`}>
                        <Path
                          d={dropPath(p.x, p.y, 8)}
                          fill={c.he4hLand}
                          stroke={c.soilDark}
                          strokeWidth={1.2}
                        />
                        <Path
                          d={`M${p.x - 3},${p.y + 6}L${p.x},${p.y + 9}L${p.x + 3},${p.y + 6}`}
                          fill="none"
                          stroke={c.soilDark}
                          strokeWidth={1.2}
                        />
                      </G>
                    );
                  })
                : null}
              {/* The outlet arrow and Qₚ. */}
              <Line
                x1={out.x}
                y1={out.y}
                x2={out.x}
                y2={L.bottom + 18}
                stroke={c.waterDeep}
                strokeWidth={3.5}
              />
              <Path
                d={`M${out.x - 7},${L.bottom + 14}L${out.x},${L.bottom + 24}L${out.x + 7},${L.bottom + 14}Z`}
                fill={c.waterDeep}
              />
              {Qtext !== undefined ? (
                <ChartText
                  {...fitLabel(out.x + 12, `Qₚ = ${Qtext}`, chart.value, w, 'start')}
                  y={L.bottom + 20}
                  fontSize={chart.value}
                  fontWeight="700"
                  fill={c.waterDeep}
                >
                  {`Qₚ = ${Qtext}`}
                </ChartText>
              ) : null}
              <ChartText
                {...fitLabel(out.x - 12, 'outlet', chart.label, w, 'end')}
                y={L.bottom + 20}
                fill={c.chartMuted}
              >
                outlet
              </ChartText>
              {/* The scale bar. */}
              {barKm !== undefined ? (
                <G>
                  <Line
                    x1={8}
                    y1={L.barY}
                    x2={8 + barPx}
                    y2={L.barY}
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                  />
                  {[0, barPx].map((x) => (
                    <Line
                      key={`b${x}`}
                      x1={8 + x}
                      y1={L.barY - 5}
                      x2={8 + x}
                      y2={L.barY + 5}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                    />
                  ))}
                  <ChartText x={8} y={L.barY + 18}>
                    0
                  </ChartText>
                  <ChartText x={8 + barPx} y={L.barY + 18} textAnchor="middle">
                    {barText}
                  </ChartText>
                </G>
              ) : null}
              {/* The key. */}
              {Cok ? (
                <G>
                  <Path d={dropPath(w * 0.55, L.keyY - 4, 9)} fill={c.waterDeep} />
                  <ChartText x={w * 0.55 + 10} y={L.keyY}>{`runs off: ${k}`}</ChartText>
                  <Path
                    d={dropPath(w * 0.55, L.keyY + 16, 9)}
                    fill={c.he4hLand}
                    stroke={c.soilDark}
                    strokeWidth={1.2}
                  />
                  <ChartText
                    x={w * 0.55 + 10}
                    y={L.keyY + 20}
                  >{`soaks in: ${CATCHMENT_DROPS - k}`}</ChartText>
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

/** Where everything sits at width w: the basin's scale, its top, the bar and key rows. */
function layout(w: number) {
  const U = Math.min((w - 24) / (maxX - minX), 260 / (maxY - minY));
  const top = 50;
  const bottom = top + (maxY - minY) * U;
  return {
    U,
    top,
    cx: w / 2 - ((maxX + minX) / 2) * U,
    bottom,
    barY: bottom + 40,
    keyY: bottom + 44,
    h: bottom + 72,
  };
}
