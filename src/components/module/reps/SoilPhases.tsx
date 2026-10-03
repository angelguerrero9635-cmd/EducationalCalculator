/**
 * HC174 `soilPhases` (SoilPhasesSpec in typesHe4m.ts): a soil's phase diagram. One block cut
 * into air, water and solids to scale (V_s = 1, V_w = Se, V_v = e, or the hole's volume V for a
 * sand cone), the solids painted as sand grains and the water as water, lit from above; the
 * volumes on the left and the weights (or masses) on the right, each against its phase. No
 * handles: the values are typed.
 */
import { View } from 'react-native';
import Svg, { Defs, G, Line, Rect } from 'react-native-svg';

import type { SoilPhasesSpec } from '@/data/modules/typesHe4m';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { soilPhaseParts, spreadApart } from './he4mMath';
import { n3, useFields } from './he4mKit';
import { TopLight, url, usePaintIds } from './paint';
import { Patch } from './SoilProfile';

const H = 330;

export function SoilPhases({ spec, calc }: { spec: SoilPhasesSpec; calc: Calculator }) {
  const c = usePalette();
  const paint = usePaintIds('light');
  const { rep, known, get, say } = useFields(calc);
  const Gs = get(spec.Gs);
  const wPct = get(spec.w);
  const w = wPct === undefined ? undefined : wPct / 100;
  const V = get(spec.volume);
  const M = get(spec.mass);
  const massMode = spec.mass !== undefined;
  const gw = get(spec.gammaW);
  const parts = soilPhaseParts({ Gs, w, S: get(spec.S), e: get(spec.e), V });
  const over = parts !== undefined && parts.S > 1 + 1e-9;
  const volUnit =
    spec.volumeUnit ?? (typeof spec.volume === 'string' ? rep.unit(spec.volume) : 'm³') ?? '';
  const massUnit = typeof spec.mass === 'string' ? (rep.unit(spec.mass) ?? '') : '';
  const wtUnit = massMode ? massUnit : gw !== undefined ? (spec.weightUnit ?? 'kN') : '';

  // Weights (γ_w × the phase's G) or masses on the right, by phase: air, water, solids.
  let right: [string, string, string] | undefined;
  let Ws: number | undefined;
  let Ww: number | undefined;
  if (massMode && M !== undefined && w !== undefined) {
    Ws = M / (1 + w);
    Ww = M - Ws;
    right = ['M_a = 0', `M_w = ${n3(Ww)}`, `M_s = ${n3(Ws)}`];
  } else if (!massMode && parts && Gs !== undefined) {
    const wf = w ?? (parts.S * parts.e) / Gs;
    if (gw !== undefined) {
      Ws = Gs * gw * parts.Vs;
      Ww = wf * Ws;
      right = ['W_a = 0', `W_w = ${n3(Ww)}`, `W_s = ${n3(Ws)}`];
    } else
      right = ['W_a = 0', `W_w = ${n3(wf * Gs * parts.Vs)}γ_w`, `W_s = ${n3(Gs * parts.Vs)}γ_w`];
  }

  const lines: string[] = [];
  if (!parts) {
    if (massMode && V !== undefined && M !== undefined)
      lines.push(
        `The hole holds V = ${say(spec.volume, V, true)} of soil weighing M = ${say(spec.mass, M, true)}; type G_s to split it into solids, water and air.`,
      );
    else lines.push('Type G_s, w and S to split the block into solids, water and air.');
  } else {
    const { e, S } = parts;
    if (over)
      lines.push(
        `S = ${n3(S)} is above 1: more water than the voids can hold, so these values cannot be one soil.`,
      );
    else if (!massMode && Gs !== undefined && w !== undefined && known(spec.S))
      lines.push(
        `e = wG_s ÷ S = ${n3(w)} × ${say(spec.Gs, Gs)} ÷ ${say(spec.S, S)} = ${say(spec.e, e)}: voids of ${n3(e)} for every 1 of solids.`,
      );
    else
      lines.push(
        `e = V_v ÷ V_s = ${n3(parts.Vv)} ÷ ${n3(parts.Vs)} = ${say(spec.e, e)}; S = V_w ÷ V_v = ${say(spec.S, S)}.`,
      );
    if (!over && !massMode) {
      const nTxt =
        spec.porosity && known(spec.porosity) ? rep.value(spec.porosity) : n3(e / (1 + e));
      lines.push(`n = e ÷ (1 + e) = ${nTxt} of the volume is voids.`);
      if (Ws !== undefined && Ww !== undefined && gw !== undefined) {
        const u = spec.dryUnitWeight ? (rep.unit(spec.dryUnitWeight) ?? '') : '';
        const gd =
          spec.dryUnitWeight && known(spec.dryUnitWeight)
            ? rep.value(spec.dryUnitWeight)
            : `${n3(Ws / parts.V)} ${u}`.trim();
        const g =
          spec.unitWeight && known(spec.unitWeight)
            ? rep.value(spec.unitWeight)
            : `${n3((Ws + Ww) / parts.V)} ${u}`.trim();
        lines.push(
          `γ_d = W_s ÷ V = ${n3(Ws)} ÷ ${n3(parts.V)} = ${gd}; γ = (W_s + W_w) ÷ V = ${n3(Ws + Ww)} ÷ ${n3(parts.V)} = ${g}.`,
        );
      }
    }
    if (!over && massMode && Ws !== undefined && Ww !== undefined && V !== undefined)
      lines.push(
        `M_s = M ÷ (1 + w) = ${n3(Ws + Ww)} ÷ ${n3(1 + w!)} = ${n3(Ws)} ${massUnit}; M_w = ${n3(Ww)} ${massUnit}. The solids fill ${n3(parts.Vs)} of the ${n3(V)} ${volUnit}.`,
      );
  }
  if (!massMode && !V)
    lines.push('The block holds 1 m³ of solids (V_s = 1); a soil sample scales it.');

  return (
    <View>
      <Canvas aspect={(cw) => H / cw}>
        {({ w: cw, h }) => {
          const bw = Math.min(118, cw * 0.3);
          const bx = (cw - bw) / 2;
          const top = 40;
          const bh = 250;
          const total = parts ? parts.V : 1;
          const k = bh / total;
          const hA = parts ? parts.Va * k : 0;
          const hW = parts ? parts.Vw * k : 0;
          const hS = parts ? parts.Vs * k : bh;
          const yW = top + hA;
          const yS = yW + hW;
          const mids = [top + hA / 2, yW + hW / 2, yS + hS / 2];
          const placed = spreadApart(mids, 17, top + 6, top + bh - 4);
          const vol =
            parts && !over
              ? [`V_a = ${n3(parts.Va)}`, `V_w = ${n3(parts.Vw)}`, `V_s = ${n3(parts.Vs)}`]
              : undefined;
          const names = ['Air', 'Water', 'Solids'];
          const hs = [hA, hW, hS];
          const ys = [top, yW, yS];
          const fade = over ? 0.35 : 1;
          return (
            <Svg width={cw} height={h}>
              <Defs>
                <TopLight id={paint.light} />
              </Defs>
              <ChartText x={bx - 10} y={20} textAnchor="end" fontWeight="700">
                {`Volume${volUnit ? ` (${volUnit})` : ''}`}
              </ChartText>
              <ChartText x={bx + bw + 10} y={20} fontWeight="700">
                {`${massMode ? 'Mass' : 'Weight'}${wtUnit ? ` (${wtUnit})` : ''}`}
              </ChartText>
              <G opacity={fade}>
                {/* Solids, water, air, top down air first. */}
                <Patch x={bx} y={yS} w={bw} h={hS} m="sand" light={paint.light} c={c} seed={11} />
                {hW > 0.5 ? (
                  <G>
                    <Rect x={bx} y={yW} width={bw} height={hW} fill={c.he4mWater} />
                    <Rect x={bx} y={yW} width={bw} height={hW} fill={url(paint.light)} />
                  </G>
                ) : null}
                {hA > 0.5 ? <Rect x={bx} y={top} width={bw} height={hA} fill={c.he4mAir} /> : null}
                {[yW, yS].map((y, i) =>
                  parts ? (
                    <Line
                      key={`cut${i}`}
                      x1={bx}
                      x2={bx + bw}
                      y1={y}
                      y2={y}
                      stroke={c.he4mPhaseLine}
                      strokeWidth={1}
                    />
                  ) : null,
                )}
                <Rect
                  x={bx}
                  y={top}
                  width={bw}
                  height={bh}
                  fill="none"
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                {parts
                  ? names.map((n, i) =>
                      hs[i]! >= 18 ? (
                        <ChartText
                          key={n}
                          x={bx + bw / 2}
                          y={ys[i]! + hs[i]! / 2 + 4}
                          textAnchor="middle"
                          fontWeight="700"
                          halo={i === 2 ? c.landSand : undefined}
                        >
                          {n}
                        </ChartText>
                      ) : null,
                    )
                  : null}
              </G>
              {/* Volumes on the left, weights or masses on the right, each led to its phase. */}
              {[0, 1, 2].map((i) => (
                <G key={`lab${i}`}>
                  {vol ? (
                    <G>
                      <Line
                        x1={bx - 2}
                        x2={bx - 12}
                        y1={mids[i]}
                        y2={placed[i]! - 4}
                        stroke={c.chartMuted}
                        strokeWidth={1}
                      />
                      <ChartText x={bx - 15} y={placed[i]} textAnchor="end">
                        {vol[i]}
                      </ChartText>
                    </G>
                  ) : null}
                  {right && parts && !over ? (
                    <G>
                      <Line
                        x1={bx + bw + 2}
                        x2={bx + bw + 12}
                        y1={mids[i]}
                        y2={placed[i]! - 4}
                        stroke={c.chartMuted}
                        strokeWidth={1}
                      />
                      <ChartText x={bx + bw + 15} y={placed[i]}>
                        {right[i]}
                      </ChartText>
                    </G>
                  ) : null}
                </G>
              ))}
              {/* Totals under the block. */}
              {parts && !over ? (
                <ChartText x={bx - 10} y={top + bh + 22} textAnchor="end" fontWeight="700">
                  {`V = ${n3(parts.V)}`}
                </ChartText>
              ) : V !== undefined ? (
                <ChartText x={bx - 10} y={top + bh + 22} textAnchor="end" fontWeight="700">
                  {`V = ${n3(V)}`}
                </ChartText>
              ) : null}
              {Ws !== undefined && Ww !== undefined && !over ? (
                <ChartText x={bx + bw + 10} y={top + bh + 22} fontWeight="700">
                  {`${massMode ? 'M' : 'W'} = ${n3(Ws + Ww)}`}
                </ChartText>
              ) : massMode && M !== undefined ? (
                <ChartText x={bx + bw + 10} y={top + bh + 22} fontWeight="700">
                  {`M = ${n3(M)}`}
                </ChartText>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
