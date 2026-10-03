/**
 * HC127 `tsDiagram` (TsDiagramSpec in typesHe4f.ts): temperature up, salinity across, the
 * isopycnals of the page's equation of state every 0.5 kg/m³ (labelled where they leave the
 * chart), the freezing line with the ice below it shaded, and the water's point with its density.
 * Flat; no handles.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { TsDiagramSpec } from '@/data/modules/typesHe4f';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { isopycnal, seawaterDensity, tsWindow, TS_STATE, type SeawaterState } from './he4fMath';

const BW = 360;
const L = 40;
const R = 50;
const TOP = 26;
const PH = 250;
const BASE = TOP + PH;

const n3 = (x: number) => formatNumber(Number(x.toPrecision(3)));
const d1 = (x: number) => formatNumber(Number(x.toFixed(1)));

export function TsDiagram({ spec, calc }: { spec: TsDiagramSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  type V = number | string | undefined;
  const known = (v: V) => v !== undefined && (typeof v === 'number' || rep.known(v));
  const get = (v: V): number | undefined =>
    !known(v) ? undefined : typeof v === 'number' ? v : rep.val(v as string);
  const state: SeawaterState = { ...TS_STATE, ...spec.state };
  const slope = spec.freezeSlope ?? 0.054;
  const T = get(spec.temperature);
  const S = get(spec.salinity);
  const win = tsWindow(T, S);
  const pw = BW - L - R;
  const X = (s: number) => L + (pw * (s - win.s0)) / (win.s1 - win.s0);
  const Y = (t: number) => BASE - (PH * (t - win.t0)) / (win.t1 - win.t0);
  const height = BASE + 44;
  const rho = T !== undefined && S !== undefined ? seawaterDensity(T, S, state) : undefined;
  const tf = S !== undefined ? -slope * S : undefined;
  const frozen = T !== undefined && tf !== undefined && T < tf;
  const lines = isopycnal(win, state);
  // Label every k-th line, so labels on an edge sit at least 30 px apart.
  // Lines 0.5 kg/m³ apart lie this far apart (px) along the top edge and along the right edge.
  const alongTop = (0.5 / (state.rho0 * state.beta)) * (pw / (win.s1 - win.s0));
  const alongRight = (0.5 / (state.rho0 * state.alpha)) * (PH / (win.t1 - win.t0));
  const along = Math.min(alongTop, alongRight);
  const every = Math.max(1, Math.ceil(34 / along));
  const sTicks: number[] = [];
  const sStep = win.s1 - win.s0 > 20 ? 5 : 2;
  for (let s = Math.ceil(win.s0 / sStep) * sStep; s <= win.s1 + 1e-9; s += sStep) sTicks.push(s);
  const tTicks: number[] = [];
  for (let t = Math.ceil(win.t0 / 5) * 5; t <= win.t1 + 1e-9; t += 5) tTicks.push(t);
  const ice = `M${X(win.s0)},${Y(Math.max(win.t0, -slope * win.s0))} L${X(win.s1)},${Y(Math.max(win.t0, -slope * win.s1))} L${X(win.s1)},${BASE} L${X(win.s0)},${BASE} Z`;

  const cap: string[] = [];
  if (rho === undefined) cap.push('Type the temperature and the salinity to place the water.');
  else {
    cap.push(
      `ρ = ${formatNumber(state.rho0)} × (1 − ${n3(state.alpha * 1e4)} × 10⁻⁴ × (${d1(T!)} − ${formatNumber(state.t0)}) + ${n3(state.beta * 1e4)} × 10⁻⁴ × (${d1(S!)} − ${formatNumber(state.s0)})) = ${d1(get(spec.density) ?? rho)} kg/m³.`,
    );
    cap.push(
      `Freezing point = −${formatNumber(slope)} × ${d1(S!)} = ${formatNumber(Number((get(spec.freezing) ?? tf!).toFixed(2)))} °C.`,
    );
    if (frozen) cap.push('Below its freezing point seawater is ice: the point is drawn faded.');
  }

  const px = T !== undefined && S !== undefined ? X(S) : 0;
  const py = T !== undefined ? Y(T) : 0;
  const label = rho === undefined ? '' : `ρ = ${d1(rho)}`;
  const left = px > L + pw * 0.6;
  return (
    <View>
      <Canvas aspect={height / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <G transform={`scale(${w / BW})`}>
              <Rect x={L} y={TOP} width={pw} height={PH} fill={c.chartSurface} />
              {/* Ice below the freezing line. */}
              <Path d={ice} fill={c.he4fIce} />
              <Line
                x1={X(win.s0)}
                y1={Y(-slope * win.s0)}
                x2={X(win.s1)}
                y2={Y(-slope * win.s1)}
                stroke={c.he4fIceLine}
                strokeWidth={chart.stroke}
              />
              <ChartText
                x={L + 6}
                y={Math.min(Y(-slope * win.s0), BASE) - 6}
                fill={c.he4fIceLine}
                fontWeight="700"
                halo
              >
                freezing line
              </ChartText>
              {/* Isopycnals, every 0.5 kg/m³. */}
              {lines.map((ln, i) => {
                const labelled =
                  Math.round(ln.rho * 2) % (2 * every) === 0 &&
                  (!ln.exitTop || X(ln.b[0]) > L + 18);
                return (
                  <G key={ln.rho}>
                    <Line
                      x1={X(ln.a[0])}
                      y1={Y(ln.a[1])}
                      x2={X(ln.b[0])}
                      y2={Y(ln.b[1])}
                      stroke={c.he4fIsopycnal}
                      strokeWidth={labelled ? 1.4 : 0.8}
                      strokeOpacity={labelled ? 0.9 : 0.55}
                    />
                    {labelled ? (
                      <ChartText
                        key={`l${i}`}
                        x={ln.exitTop ? X(ln.b[0]) : X(ln.b[0]) + 4}
                        y={ln.exitTop ? TOP - 6 : Y(ln.b[1]) + 4}
                        textAnchor={ln.exitTop ? 'middle' : 'start'}
                        fill={c.he4fIsopycnal}
                      >
                        {formatNumber(ln.rho)}
                      </ChartText>
                    ) : null}
                  </G>
                );
              })}
              {/* The water. */}
              {rho !== undefined ? (
                <G opacity={frozen ? 0.4 : 1}>
                  <Circle
                    cx={px}
                    cy={py}
                    r={6}
                    fill={c.chartHighlight}
                    stroke={c.background}
                    strokeWidth={1.5}
                  />
                  <ChartText
                    x={left ? px - 10 : px + 10}
                    y={py - 8}
                    textAnchor={left ? 'end' : 'start'}
                    fontWeight="700"
                    fill={c.chartHighlight}
                    halo
                  >
                    {`${label} kg/m³`}
                  </ChartText>
                </G>
              ) : null}
              {/* Axes. */}
              <Rect
                x={L}
                y={TOP}
                width={pw}
                height={PH}
                fill="none"
                stroke={c.chartInk}
                strokeWidth={1}
              />
              {sTicks.map((s) => (
                <G key={s}>
                  <Line x1={X(s)} y1={BASE} x2={X(s)} y2={BASE + 4} stroke={c.chartInk} />
                  <ChartText x={X(s)} y={BASE + 17} textAnchor="middle" fill={c.chartMuted}>
                    {formatNumber(s)}
                  </ChartText>
                </G>
              ))}
              <ChartText x={L + pw / 2} y={BASE + 36} textAnchor="middle">
                Salinity S (g/kg)
              </ChartText>
              {tTicks.map((t) => (
                <G key={t}>
                  <Line x1={L - 4} y1={Y(t)} x2={L} y2={Y(t)} stroke={c.chartInk} />
                  <ChartText x={L - 7} y={Y(t) + 4} textAnchor="end" fill={c.chartMuted}>
                    {formatNumber(t)}
                  </ChartText>
                </G>
              ))}
              <ChartText
                x={12}
                y={TOP + PH / 2}
                textAnchor="middle"
                transform={`rotate(-90 12 ${TOP + PH / 2})`}
              >
                Temperature T (°C)
              </ChartText>
              <ChartText x={BW - 4} y={TOP - 6} textAnchor="end" fill={c.he4fIsopycnal}>
                ρ (kg/m³)
              </ChartText>
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{cap.join(' ')}</Caption>
    </View>
  );
}
