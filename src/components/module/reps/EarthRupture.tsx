/**
 * HC119 `earthLayers` mode `rupture` (RuptureSpec in typesHe4f.ts): a block of crust cut along
 * a vertical fault, its near half lifted away so the fault plane faces us, the rupture patch L × W
 * drawn on it to scale (the sides in the ratio L : W), slip arrows D on either side of the trace;
 * under it the moment magnitude on a bar against an M 6 reference. The crust is painted; the
 * magnitude bars are flat. No handles.
 */
import { View } from 'react-native';
import Svg, { Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { RuptureSpec } from '@/data/modules/typesHe4f';
import { formatNumber, scientific } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { magnitudeOf, momentOf, ruptureRect } from './he4fMath';
import { TopLight, url, usePaintIds } from './paint';

const BW = 360;
/** The fault plane's face: its left edge, top (the ground) and size. */
const FX = 34;
const FY = 64;
const FW = 250;
const FH = 120;
/** The block's depth drawn back and up (oblique). */
const DX = 46;
const DY = -30;
/** The magnitude scale. */
const MX0 = 40;
const MX1 = 340;
const MY = FY + FH + 34;
const M_MAX = 10;

const n3 = (x: number) =>
  Math.abs(x) >= 1e6 || (x !== 0 && Math.abs(x) < 1e-3)
    ? scientific(Number(x.toPrecision(3)))
    : formatNumber(Number(x.toPrecision(3)));

export function EarthRupture({ spec, calc }: { spec: RuptureSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('light', 'face');
  type V = number | string | undefined;
  const known = (v: V) => v !== undefined && (typeof v === 'number' || rep.known(v));
  const get = (v: V): number | undefined =>
    !known(v) ? undefined : typeof v === 'number' ? v : rep.val(v as string);
  const say = (v: V, x: number) =>
    typeof v === 'string' && known(v) ? rep.value(v, false) : n3(x);
  const L = get(spec.length);
  const W = get(spec.width);
  const D = get(spec.slip);
  const mu = get(spec.rigidity ?? 30);
  const ok = L !== undefined && W !== undefined && L > 0 && W > 0;
  const m0 = ok && D !== undefined && mu !== undefined ? momentOf(mu, L!, W!, D) : undefined;
  const mw = m0 !== undefined && m0 > 0 ? magnitudeOf(m0) : undefined;
  // The patch to scale: the larger of L ÷ FW and W ÷ FH sets km per px.
  const { w: pw, h: ph } = ok ? ruptureRect(L!, W!, FW - 30, FH - 22) : { w: 0, h: 0 };
  const px = FX + (FW - pw) / 2;
  const py = FY + 6;
  const mx = (m: number) => MX0 + ((MX1 - MX0) * Math.max(0, Math.min(M_MAX, m))) / M_MAX;
  const height = MY + 60;

  const lines: string[] = [];
  if (!ok) lines.push('Type the rupture’s length and width to draw it.');
  else {
    lines.push(
      `The patch is ${say(spec.length, L!)} km by ${say(spec.width, W!)} km, drawn to scale (${n3(L! / W!)} : 1).`,
    );
    if (m0 !== undefined && D !== undefined && mu !== undefined) {
      lines.push(
        `M₀ = μLWD = ${n3(mu)} × 10⁹ Pa × ${n3(L! * 1000)} m × ${n3(W! * 1000)} m × ${n3(D)} m = ${spec.moment && known(spec.moment) ? rep.value(spec.moment as string) : `${n3(m0)} N·m`}.`,
      );
      if (mw !== undefined)
        lines.push(
          `Mw = (2 ÷ 3)(log₁₀ M₀ − 9.1) = (2 ÷ 3)(${formatNumber(Number(Math.log10(m0).toFixed(2)))} − 9.1) = ${formatNumber(Number((get(spec.magnitude) ?? mw).toFixed(2)))}, about ${n3(10 ** (1.5 * (mw - 6)))} times the energy of an M 6.`,
        );
    }
  }

  // The block: the far half behind the fault plane, the near half outlined in front.
  const top = `M${FX},${FY} L${FX + FW},${FY} L${FX + FW + DX},${FY + DY} L${FX + DX},${FY + DY} Z`;
  const side = `M${FX + FW},${FY} L${FX + FW + DX},${FY + DY} L${FX + FW + DX},${FY + FH + DY} L${FX + FW},${FY + FH} Z`;
  const arrowY = FY + DY / 2;
  return (
    <View>
      <Canvas aspect={height / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <TopLight id={ids.light} strength={0.8} />
            </Defs>
            <G transform={`scale(${w / BW})`}>
              {/* The far block: its ground, its end, and the fault plane facing us. */}
              <Path d={top} fill={c.landGrass} stroke={c.chartInk} strokeWidth={1} />
              <Path d={side} fill={c.he4fCrustDeep} stroke={c.chartInk} strokeWidth={1} />
              <Rect x={FX} y={FY} width={FW} height={FH} fill={c.earthCrust} />
              {[0.3, 0.55, 0.8].map((f) => (
                <Line
                  key={f}
                  x1={FX}
                  y1={FY + FH * f}
                  x2={FX + FW}
                  y2={FY + FH * f}
                  stroke={c.he4fCrustDeep}
                  strokeWidth={1}
                  strokeDasharray="14 5"
                />
              ))}
              <Rect x={FX} y={FY} width={FW} height={FH} fill={url(ids.light)} />
              <Rect
                x={FX}
                y={FY}
                width={FW}
                height={FH}
                fill="none"
                stroke={c.chartInk}
                strokeWidth={1}
              />
              {/* The rupture patch, L × W to scale, hatched along the slip. */}
              {ok ? (
                <G>
                  <Rect
                    x={px}
                    y={py}
                    width={Math.max(pw, 1.5)}
                    height={Math.max(ph, 1.5)}
                    fill={c.he4fRupture}
                    fillOpacity={0.85}
                    stroke={c.chartInk}
                    strokeWidth={1.5}
                  />
                  {ph > 10
                    ? Array.from({ length: Math.floor(ph / 9) }, (_, i) => (
                        <Line
                          key={i}
                          x1={px + 4}
                          y1={py + 6 + 9 * i}
                          x2={px + pw - 4}
                          y2={py + 6 + 9 * i}
                          stroke={c.background}
                          strokeOpacity={0.45}
                          strokeWidth={1}
                        />
                      ))
                    : null}
                  <ChartText
                    x={px + pw / 2}
                    y={py + ph + 16}
                    textAnchor="middle"
                    fontWeight="700"
                    halo
                  >
                    {`L = ${say(spec.length, L!)} km`}
                  </ChartText>
                  <ChartText
                    x={px + pw - 6}
                    y={py + Math.max(ph, 12) / 2 + 4}
                    textAnchor="end"
                    fontWeight="700"
                    halo
                  >
                    {`W = ${say(spec.width, W!)} km`}
                  </ChartText>
                </G>
              ) : null}
              {/* The fault trace on the ground and the slip either side of it. */}
              <Line
                x1={FX}
                y1={FY}
                x2={FX + FW}
                y2={FY}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              {D !== undefined ? (
                <G>
                  {(
                    [
                      [FX + DX / 2 + 70, arrowY - 7, 1],
                      [FX + DX / 2 + 70 + 70, arrowY + 8, -1],
                    ] as const
                  ).map(([x, y, dir], i) => (
                    <Path
                      key={i}
                      d={`M${x - 30 * dir},${y} L${x + 30 * dir},${y} M${x + 30 * dir - 7 * dir},${y - 5} L${x + 30 * dir},${y} L${x + 30 * dir - 7 * dir},${y + 5}`}
                      fill="none"
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                      strokeLinejoin="round"
                    />
                  ))}
                  <ChartText x={FX + DX / 2 + 236} y={arrowY + 5} fontWeight="700" halo>
                    {`D = ${say(spec.slip, D)} m`}
                  </ChartText>
                </G>
              ) : null}
              <ChartText x={FX} y={FY + DY - 8} fill={c.chartMuted}>
                fault plane, near side lifted away
              </ChartText>
              {/* Moment magnitude against an M 6. */}
              {Array.from({ length: M_MAX + 1 }, (_, m) => (
                <G key={m}>
                  <Line
                    x1={mx(m)}
                    y1={MY + 40}
                    x2={mx(m)}
                    y2={MY + 44}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                  <ChartText x={mx(m)} y={MY + 57} textAnchor="middle" fill={c.chartMuted}>
                    {String(m)}
                  </ChartText>
                </G>
              ))}
              <Line
                x1={MX0}
                y1={MY + 40}
                x2={MX1}
                y2={MY + 40}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              <Rect
                x={MX0}
                y={MY}
                width={mx(6) - MX0}
                height={14}
                fill={c.chartFill}
                stroke={c.chartMuted}
                strokeWidth={1}
              />
              <ChartText x={MX0 + 4} y={MY + 11} fill={c.chartInk}>
                M 6 reference
              </ChartText>
              {mw !== undefined ? (
                <G>
                  <Rect x={MX0} y={MY + 20} width={mx(mw) - MX0} height={14} fill={c.he4fRupture} />
                  <ChartText
                    x={mx(mw) + 74 > BW ? mx(mw) - 4 : mx(mw) + 4}
                    y={MY + 31}
                    textAnchor={mx(mw) + 74 > BW ? 'end' : 'start'}
                    fontWeight="700"
                    fill={mx(mw) + 74 > BW ? c.card : c.chartInk}
                  >
                    {`Mw ${formatNumber(Number(mw.toFixed(2)))}`}
                  </ChartText>
                </G>
              ) : null}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
