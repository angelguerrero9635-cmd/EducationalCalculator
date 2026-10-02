/**
 * HC88 `streamChannel` with a `mode` (StreamChannelHeSpec in typesHe3j.ts): open-channel flow in
 * a concrete-lined rectangular channel. `manning`: the section to scale with the wetted
 * perimeter lit, beside a side view with S, n, V and Fr. `specificEnergy`: the E–y curve with its
 * least E at y_c, the depth and its alternate depth. `jump`: y₁, the roller, y₂ and the energy
 * line falling by h_L. The concrete and water are painted; the E–y chart stays flat.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { StreamChannelHeSpec } from '@/data/modules/typesHe3j';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle } from './common';
import { makePlacer } from './he2cKit';
import { Arrow } from './he1fKit';
import {
  alternateDepth,
  criticalDepth,
  froude,
  jumpDepth,
  jumpLoss,
  specificEnergy,
} from './he3jMath';
import { Dim, nf, pathOf, useHe3j, useValueDrag } from './he3jKit';
import { Deepen, TopLight, url, usePaintIds } from './paint';

const BW = 360;

/** A drag on one value: where its handle sits (picture units) and the value a move gives. */
interface DragSpec {
  id: string;
  x: number;
  y: number;
  to: (dx: number, dy: number, start: number) => number;
}

/** Tick values for 0…max at a nice step, about `n` of them. */
function ticks(max: number, n = 4) {
  const raw = max / n;
  const p = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? 10 * p;
  const out: number[] = [];
  for (let x = 0; x <= max + 1e-9; x += step) out.push(Number(x.toFixed(10)));
  return out;
}

export function StreamChannelHe({ spec, calc }: { spec: StreamChannelHeSpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, get, lab, sym, unit, draggable } = useHe3j(calc);
  const paint = usePaintIds('water', 'concrete', 'light');
  const g = get(spec.g) ?? 9.81;
  const lu = unit(spec.depth ?? spec.y1, 'm');

  let BH = 220;
  let body: ReactNode = null;
  let caption = '';
  let handle: DragSpec | null = null;

  // ── The values each mode reads ──
  const b = get(spec.width);
  const y = get(spec.depth);
  const n = get(spec.n);
  const S = get(spec.slope);
  const k = spec.manningK ?? 1;
  const live = { b: b ?? 1, y: y ?? 1, q: 1, y1: 1, E1: 1 };
  const qv =
    get(spec.q) ??
    (get(spec.discharge) !== undefined && b !== undefined ? get(spec.discharge)! / b : undefined);
  if (spec.mode === 'manning') live.y = y ?? 1;
  if (spec.mode === 'specificEnergy') live.q = qv ?? 1;
  const drag = useValueDrag(calc, live, spec.keep);
  const frozen = drag.scale;

  const defs = (
    <Defs>
      <Deepen id={paint.water} from={c.water} to={c.waterDeep} />
      <Deepen id={paint.concrete} from={c.fluidConcrete} to={c.fluidConcreteDark} />
      <TopLight id={paint.light} />
    </Defs>
  );

  if (spec.mode === 'manning') {
    // ── The section to scale (left) and a side view (right) ──
    const on = b !== undefined && y !== undefined && b > 0 && y > 0;
    const bb = b ?? 1;
    const yy = y ?? 0.4;
    // One scale for the section; the walls stand 1.3 × the depth (frozen while dragging).
    const sy = Math.max(frozen.y, yy);
    const s = Math.min(124 / bb, 74 / (1.3 * sy));
    const W = bb * s;
    const D = yy * s;
    const H = 1.3 * sy * s;
    const wall = 8;
    const top = 40;
    const bed = top + H;
    const x0 = 8 + wall + (156 - 2 * wall - W) / 2;
    const P = bb + 2 * yy;
    const A = bb * yy;
    const R = A / P;
    const Q = get(spec.discharge) ?? (n && S !== undefined ? (k / n) * A * R ** (2 / 3) * Math.sqrt(S) : undefined);
    const V = get(spec.speed) ?? (Q !== undefined ? Q / A : undefined);
    const Fr = get(spec.froude) ?? (V !== undefined ? froude(V, yy, g) : undefined);
    // Side view: the bed falls (exaggerated), the water parallel to it.
    const [sx0, sx1] = [190, 352];
    const drop = 26;
    const Dp = Math.min(D, 46);
    const bedAt = (x: number) => top + 30 + (drop * (x - sx0)) / (sx1 - sx0);
    const flowLab = lab(spec.speed, 'V', `${lu}/s`);
    const frLab = spec.froude !== undefined && Fr !== undefined ? `${lab(spec.froude, 'Fr')}` : undefined;
    const regime = Fr === undefined ? '' : Fr < 1 ? 'subcritical' : Fr > 1 ? 'supercritical' : 'critical';
    BH = bed + 64;
    body = (
      <G opacity={on ? 1 : 0.4}>
        <ChartText x={8} y={18} fontSize={chart.label} fontWeight="700">
          Section, to scale
        </ChartText>
        <ChartText x={sx0} y={18} fontSize={chart.label} fontWeight="700">
          Side view, slope steepened
        </ChartText>
        {/* The lined channel: walls and floor in concrete, the water to scale. */}
        <Path
          d={`M ${x0 - wall} ${top} H ${x0} V ${bed} H ${x0 + W} V ${top} H ${x0 + W + wall} V ${bed + wall} H ${x0 - wall} Z`}
          fill={url(paint.concrete)}
          stroke={c.fluidConcreteDark}
          strokeWidth={1}
        />
        {y !== undefined && (
          <G>
            <Rect x={x0} y={bed - D} width={W} height={D} fill={url(paint.water)} />
            <Rect x={x0} y={bed - D} width={W} height={D} fill={url(paint.light)} />
            {/* The wetted perimeter b + 2y, lit. */}
            <Path
              d={`M ${x0 + 1.5} ${bed - D} V ${bed - 1.5} H ${x0 + W - 1.5} V ${bed - D}`}
              fill="none"
              stroke={c.chartHighlight}
              strokeWidth={chart.strokeHeavy}
              strokeDasharray={chart.dash}
            />
            <Dim x1={x0 + 12} y1={bed - D} x2={x0 + 12} y2={bed} color={c.chartInk} />
            <ChartText x={x0 + 20} y={bed - D / 2 + 5} fontSize={chart.label} fontWeight="700" halo>
              {lab(spec.depth, 'y', lu) ?? ''}
            </ChartText>
          </G>
        )}
        <Dim x1={x0} y1={bed + wall + 9} x2={x0 + W} y2={bed + wall + 9} color={c.chartInk} />
        <ChartText x={x0 + W / 2} y={bed + wall + 26} fontSize={chart.label} fontWeight="700" textAnchor="middle">
          {lab(spec.width, 'b', lu) ?? ''}
        </ChartText>
        <ChartText x={8} y={bed + wall + 46} fontSize={chart.label} fill={c.chartHighlight} fontWeight="700">
          {`Dashed: wetted perimeter P = ${nf(P)} ${lu}`}
        </ChartText>
        {/* The side view. */}
        <Path
          d={`M ${sx0} ${bedAt(sx0)} L ${sx1} ${bedAt(sx1)} L ${sx1} ${bedAt(sx1) + 9} L ${sx0} ${bedAt(sx0) + 9} Z`}
          fill={url(paint.concrete)}
        />
        {y !== undefined && (
          <Path
            d={`M ${sx0} ${bedAt(sx0)} L ${sx1} ${bedAt(sx1)} L ${sx1} ${bedAt(sx1) - Dp} L ${sx0} ${bedAt(sx0) - Dp} Z`}
            fill={url(paint.water)}
          />
        )}
        {/* Roughness: little teeth on the bed for n. */}
        {Array.from({ length: 14 }, (_, i) => {
          const x = sx0 + 6 + i * 11.5;
          return (
            <Path
              key={i}
              d={`M ${x} ${bedAt(x)} l 3 -3 l 3 3`}
              stroke={c.fluidConcreteDark}
              strokeWidth={1}
              fill="none"
            />
          );
        })}
        {V !== undefined && y !== undefined && (
          <Arrow
            x1={sx0 + 30}
            y1={bedAt(sx0 + 30) - Dp / 2}
            x2={sx0 + 100}
            y2={bedAt(sx0 + 100) - Dp / 2}
            color={c.waterDeep}
            width={2.5}
          />
        )}
        {flowLab && (
          <ChartText x={sx0 + 4} y={bedAt(sx0) - Dp - 8} fontSize={chart.label} fontWeight="700" halo>
            {flowLab}
          </ChartText>
        )}
        {/* The slope as a little triangle under the bed. */}
        <Path
          d={`M ${sx1 - 70} ${bedAt(sx1 - 70) + 14} H ${sx1 - 6} V ${bedAt(sx1 - 6) + 14}`}
          stroke={c.chartInk}
          strokeWidth={chart.strokeLight}
          fill="none"
        />
        <ChartText x={sx1} y={bedAt(sx1) + 32} fontSize={chart.label} fontWeight="700" textAnchor="end">
          {lab(spec.slope, 'S') ?? ''}
        </ChartText>
        <ChartText x={sx0} y={bedAt(sx0) + 26} fontSize={chart.label} fontWeight="700">
          {lab(spec.n, 'n') ?? ''}
        </ChartText>
        {frLab && (
          <ChartText x={sx0} y={bed + wall + 26} fontSize={chart.label} fontWeight="700" fill={Fr! > 1 ? c.chartHighlight : c.chartInk}>
            {`${frLab}: ${regime}`}
          </ChartText>
        )}
      </G>
    );
    if (draggable(spec.depth) && on) {
      handle = {
        id: spec.depth,
        x: x0 + W / 2,
        y: bed - D,
        to: (_dx, dy, y0) => Math.max(0.01, y0 - dy / s),
      };
    }
    const parts: string[] = [];
    if (on) {
      parts.push(
        `A = by = ${nf(bb)} × ${nf(yy)} = ${nf(A)} ${lu}². R = A ÷ (b + 2y) = ${nf(A)} ÷ ${nf(P)} = ${nf(R)} ${lu}.`,
      );
      if (n !== undefined && S !== undefined && Q !== undefined)
        parts.push(
          `Q = (${k === 1 ? '1' : nf(k)} ÷ n)AR^(2/3)S^(1/2) = (${k === 1 ? '1' : nf(k)} ÷ ${nf(n)}) × ${nf(A)} × ${nf(R)}^(2/3) × ${nf(S)}^(1/2) = ${nf(Q)} ${lu}³/s.`,
        );
      if (V !== undefined && Fr !== undefined && spec.froude !== undefined)
        parts.push(
          `Fr = V ÷ √(gy) = ${nf(V)} ÷ √(${nf(g)} × ${nf(yy)}) = ${nf(Fr, 2)}, ${Fr < 1 ? 'less than 1: subcritical, slow and deep' : Fr > 1 ? 'more than 1: supercritical, fast and shallow' : 'exactly 1: critical'}.`,
        );
      parts.push('The side view steepens the slope to show it.');
    } else parts.push('Type the width and depth to draw the section.');
    caption = parts.join(' ');
  } else if (spec.mode === 'specificEnergy') {
    // ── E against y for one unit discharge, one scale on both axes ──
    const q = qv;
    const on = q !== undefined && q > 0;
    const qq = on ? q : frozen.q;
    const yc = criticalDepth(qq, g);
    const Emin = 1.5 * yc;
    const yy = y;
    const ymax = Math.max(2.6 * criticalDepth(frozen.q, g), (yy ?? 0) * 1.3);
    const Emax = ymax * 1.08;
    const [px0, py0] = [52, 196];
    const s = Math.min((BW - 16 - px0) / Emax, 172 / ymax);
    const X = (E: number) => px0 + E * s;
    const Y = (d: number) => py0 - d * s;
    // The curve, from where its lower limb leaves the plot to the top.
    let ylo = yc;
    while (specificEnergy(ylo, qq, g) < Emax && ylo > 1e-4 * yc) ylo *= 0.97;
    const pts: [number, number][] = [];
    for (let i = 0; i <= 120; i++) {
      const d = ylo * (ymax / ylo) ** (i / 120);
      pts.push([X(Math.min(Emax, specificEnergy(d, qq, g))), Y(d)]);
    }
    const tE = ticks(Emax);
    const tY = ticks(ymax);
    const place = makePlacer(BW, py0 + 40);
    place.block({ x0: px0, y0: Y(ymax) - 4, x1: X(Emax), y1: Y(ymax) + 4 });
    const E = yy !== undefined ? specificEnergy(yy, qq, g) : undefined;
    const alt = yy !== undefined ? alternateDepth(yy, qq, g) : undefined;
    place.dot(X(Emin), Y(yc));
    if (E !== undefined && yy !== undefined) place.dot(X(E), Y(yy), 12);
    if (E !== undefined && alt !== undefined) place.dot(X(E), Y(alt));
    const ycL = place.place(X(Emin), Y(yc), lab(spec.yc, 'y_c', lu) ?? `y_c = ${nf(yc)} ${lu}`, chart.label, [
      [-10, 4, 'end'],
      [10, 16, 'start'],
      [10, -8, 'start'],
    ]);
    const yL =
      E !== undefined && yy !== undefined
        ? place.place(X(E), Y(yy), lab(spec.depth, 'y', lu) ?? '', chart.label, [
            [12, 4, 'start'],
            [-12, -8, 'end'],
            [-12, 16, 'end'],
          ])
        : undefined;
    const subL = place.place(X(Emin) + 0.35 * ymax * s, Y(yc + 0.62 * (ymax - yc)), 'subcritical', chart.label, [
      [-14, 0, 'end'],
      [14, 0, 'start'],
    ]);
    const supL = place.place(X(Emin) + 0.5 * (Emax - Emin) * s, Y(0.2 * yc), 'supercritical', chart.label, [
      [0, -10, 'middle'],
      [0, 20, 'middle'],
    ]);
    BH = py0 + 40;
    body = (
      <G opacity={on ? 1 : 0.4}>
        {/* Axes, grid and ticks. */}
        {tE.map((t) => (
          <G key={`e${t}`}>
            <Line x1={X(t)} y1={py0} x2={X(t)} y2={Y(ymax)} stroke={c.chartGrid} strokeWidth={1} />
            <ChartText x={X(t)} y={py0 + 16} fontSize={chart.label} textAnchor="middle" fill={c.chartMuted}>
              {nf(t)}
            </ChartText>
          </G>
        ))}
        {tY.map((t) => (
          <G key={`y${t}`}>
            <Line x1={px0} y1={Y(t)} x2={X(Emax)} y2={Y(t)} stroke={c.chartGrid} strokeWidth={1} />
            <ChartText x={px0 - 6} y={Y(t) + 4} fontSize={chart.label} textAnchor="end" fill={c.chartMuted}>
              {nf(t)}
            </ChartText>
          </G>
        ))}
        <Path d={`M ${px0} ${Y(ymax)} V ${py0} H ${X(Emax)}`} stroke={c.chartInk} strokeWidth={chart.strokeLight} fill="none" />
        <ChartText x={X(Emax)} y={py0 + 32} fontSize={chart.label} textAnchor="end" fontWeight="700">
          {`Specific energy E (${lu})`}
        </ChartText>
        <ChartText x={8} y={Y(ymax) - 8} fontSize={chart.label} fontWeight="700">
          {`Depth y (${lu})`}
        </ChartText>
        {/* E = y, the line the curve leans on. */}
        <Line
          x1={X(0)}
          y1={Y(0)}
          x2={X(Math.min(Emax, ymax))}
          y2={Y(Math.min(Emax, ymax))}
          stroke={c.chartMuted}
          strokeWidth={chart.strokeLight}
          strokeDasharray={chart.dash}
        />
        <Path d={pathOf(pts)} stroke={c.waterDeep} strokeWidth={chart.strokeHeavy} fill="none" />
        {/* The least energy at y_c. */}
        <Path
          d={`M ${px0} ${Y(yc)} H ${X(Emin)} V ${py0}`}
          stroke={c.chartHighlight}
          strokeWidth={chart.strokeLight}
          strokeDasharray={chart.dash}
          fill="none"
        />
        <Circle cx={X(Emin)} cy={Y(yc)} r={5} fill={c.chartHighlight} />
        <ChartText x={ycL.x} y={ycL.y} textAnchor={ycL.textAnchor} fontSize={chart.label} fontWeight="700" fill={c.chartHighlight} halo>
          {lab(spec.yc, 'y_c', lu) ?? `y_c = ${nf(yc)} ${lu}`}
        </ChartText>
        <ChartText x={subL.x} y={subL.y} textAnchor={subL.textAnchor} fontSize={chart.label} fill={c.chartMuted} halo>
          subcritical
        </ChartText>
        <ChartText x={supL.x} y={supL.y} textAnchor={supL.textAnchor} fontSize={chart.label} fill={c.chartMuted} halo>
          supercritical
        </ChartText>
        {E !== undefined && yy !== undefined && alt !== undefined && E <= Emax && (
          <G>
            <Line x1={X(E)} y1={Y(Math.max(yy, alt))} x2={X(E)} y2={py0} stroke={c.chartInk} strokeWidth={1} strokeDasharray={chart.dashFine} />
            <Circle cx={X(E)} cy={Y(alt)} r={4.5} fill={c.card} stroke={c.waterDeep} strokeWidth={2} />
            <Circle cx={X(E)} cy={Y(yy)} r={5.5} fill={c.waterDeep} />
            {yL && (
              <ChartText x={yL.x} y={yL.y} textAnchor={yL.textAnchor} fontSize={chart.label} fontWeight="700" halo>
                {lab(spec.depth, 'y', lu) ?? ''}
              </ChartText>
            )}
          </G>
        )}
      </G>
    );
    if (draggable(spec.depth) && on && yy !== undefined && E !== undefined && E <= Emax) {
      handle = {
        id: spec.depth,
        x: X(E),
        y: Y(yy),
        to: (_dx, dy, y0) => Math.max(0.02 * yc, y0 - dy / s),
      };
    }
    const Q = get(spec.discharge);
    const parts: string[] = [];
    if (on) {
      if (Q !== undefined && b !== undefined)
        parts.push(`q = Q ÷ b = ${nf(Q)} ÷ ${nf(b)} = ${nf(qq)} ${lu}²/s.`);
      parts.push(
        `y_c = (q² ÷ g)^(1/3) = (${nf(qq)}² ÷ ${nf(g)})^(1/3) = ${nf(yc)} ${lu}, where E is least: E_min = 1.5y_c = ${nf(Emin)} ${lu}.`,
      );
      if (yy !== undefined && E !== undefined && alt !== undefined)
        parts.push(
          `At y = ${nf(yy)} ${lu}, E = y + q² ÷ (2gy²) = ${nf(E)} ${lu}, ${yy > yc ? 'subcritical' : yy < yc ? 'supercritical' : 'critical'}; the open dot is the alternate depth ${nf(alt)} ${lu} with the same E.`,
        );
    } else parts.push('Type the discharge and width to draw the curve.');
    caption = parts.join(' ');
  } else {
    // ── A hydraulic jump: depths and the energy line to scale, the length shortened ──
    const y1 = get(spec.y1);
    const V1 = get(spec.V1);
    const Fr1 = get(spec.Fr1) ?? (y1 !== undefined && V1 !== undefined ? froude(V1, y1, g) : undefined);
    const y2 = get(spec.y2) ?? (y1 !== undefined && Fr1 !== undefined ? jumpDepth(y1, Fr1) : undefined);
    const known = y1 !== undefined && V1 !== undefined && y2 !== undefined && Fr1 !== undefined;
    const jumps = known && Fr1 > 1 && y2 > y1;
    const yy1 = y1 ?? 0.3;
    const VV1 = V1 ?? 6;
    const yy2 = y2 ?? jumpDepth(yy1, froude(VV1, yy1, g));
    const V2 = (VV1 * yy1) / yy2;
    const E1 = yy1 + (VV1 * VV1) / (2 * g);
    const E2 = yy2 + (V2 * V2) / (2 * g);
    const hL = get(spec.hL) ?? jumpLoss(yy1, yy2);
    const bedY = 186;
    const s = 134 / Math.max(E1, E2, yy2);
    const Yv = (d: number) => bedY - d * s;
    const [toe, end] = [128, 218];
    const surf = `M 8 ${Yv(yy1)} H ${toe} C ${toe + 30} ${Yv(yy1)} ${toe + 40} ${Yv(yy2) - 6} ${end} ${Yv(yy2)} H ${BW - 8}`;
    const vs = Math.min(84 / VV1, 14);
    const vLab = lab(spec.V1, 'V₁', `${lu}/s`);
    const frLab = lab(spec.Fr1, 'Fr₁');
    BH = bedY + 22;
    body = (
      <G opacity={jumps ? 1 : 0.4}>
        <Path d={`${surf} V ${bedY} H 8 Z`} fill={url(paint.water)} />
        <Path d={`${surf} V ${bedY} H 8 Z`} fill={url(paint.light)} />
        {/* The roller: foam turning back over the rising surface. */}
        {[0, 1, 2, 3].map((i) => {
          const cx = toe + 14 + i * 20;
          const cy = Yv(yy1 + ((yy2 - yy1) * (i + 0.6)) / 4.4) + 8;
          const r = 6 + i * 1.5;
          return (
            <Path
              key={i}
              d={`M ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx} ${cy + r}`}
              stroke={c.jumpFoam}
              strokeWidth={2.2}
              fill="none"
              strokeLinecap="round"
            />
          );
        })}
        <Rect x={8} y={bedY} width={BW - 16} height={10} fill={url(paint.concrete)} />
        {/* The energy line: E₁ before, E₂ after, the drop h_L across the jump. */}
        <Path
          d={`M 8 ${Yv(E1)} H ${toe} L ${end} ${Yv(E2)} H ${BW - 8}`}
          stroke={c.fluidEgl}
          strokeWidth={chart.stroke}
          strokeDasharray={chart.dash}
          fill="none"
        />
        <Line x1={end} y1={Yv(E1)} x2={end + 64} y2={Yv(E1)} stroke={c.fluidEgl} strokeWidth={1} strokeDasharray={chart.dashFine} />
        <Dim x1={end + 54} y1={Yv(E1)} x2={end + 54} y2={Yv(E2)} color={c.fluidEgl} />
        <ChartText x={end + 62} y={(Yv(E1) + Yv(E2)) / 2 + 5} fontSize={chart.label} fontWeight="700" fill={c.fluidEgl} halo>
          {lab(spec.hL, 'h_L', lu) ?? `h_L = ${nf(hL)} ${lu}`}
        </ChartText>
        <ChartText x={8} y={Yv(E1) - 8} fontSize={chart.label} fontWeight="700" fill={c.fluidEgl}>
          Energy line
        </ChartText>
        {/* Depths, speeds to one scale. */}
        <Dim x1={22} y1={Yv(yy1)} x2={22} y2={bedY} color={c.chartInk} tick={4} />
        <ChartText x={30} y={Yv(yy1) - 8} fontSize={chart.label} fontWeight="700" halo>
          {lab(spec.y1, 'y₁', lu) ?? ''}
        </ChartText>
        <Arrow x1={40} y1={Yv(yy1 / 2)} x2={40 + VV1 * vs} y2={Yv(yy1 / 2)} color={c.waterDeep} width={2.5} />
        {vLab && (
          <ChartText x={30} y={Yv(yy1) - 26} fontSize={chart.label} fontWeight="700" halo>
            {vLab}
          </ChartText>
        )}
        {frLab && (
          <ChartText x={30} y={Yv(yy1) - 44} fontSize={chart.label} fontWeight="700" fill={c.chartHighlight} halo>
            {`${frLab}: supercritical`}
          </ChartText>
        )}
        <Dim x1={BW - 22} y1={Yv(yy2)} x2={BW - 22} y2={bedY} color={c.chartInk} tick={4} />
        <ChartText x={BW - 30} y={Yv(yy2 / 2) + 5} fontSize={chart.label} fontWeight="700" textAnchor="end" halo>
          {lab(spec.y2, 'y₂', lu) ?? `y₂ = ${nf(yy2)} ${lu}`}
        </ChartText>
        <Arrow x1={end + 20} y1={Yv(yy2 / 2) + 18} x2={end + 20 + V2 * vs} y2={Yv(yy2 / 2) + 18} color={c.waterDeep} width={2.5} />
      </G>
    );
    const parts: string[] = [];
    if (!known) parts.push('Type y₁ and V₁ to draw the jump.');
    else if (!jumps)
      parts.push(
        `Fr₁ = ${nf(Fr1)} is not above 1: the flow is already subcritical, so no jump forms (drawn faded).`,
      );
    else {
      parts.push(
        `Fr₁ = V₁ ÷ √(gy₁) = ${nf(VV1)} ÷ √(${nf(g)} × ${nf(yy1)}) = ${nf(Fr1)}: supercritical, so the flow jumps.`,
      );
      parts.push(
        `y₂ = (y₁ ÷ 2)(√(1 + 8Fr₁²) − 1) = (${nf(yy1)} ÷ 2)(√(1 + 8 × ${nf(Fr1)}²) − 1) = ${nf(yy2)} ${lu}.`,
      );
      parts.push(
        `h_L = (y₂ − y₁)³ ÷ (4y₁y₂) = (${nf(yy2)} − ${nf(yy1)})³ ÷ (4 × ${nf(yy1)} × ${nf(yy2)}) = ${nf(hL)} ${lu}, the energy line's drop.`,
      );
      parts.push('Depths, speeds and the energy line are to scale; the length is shortened.');
    }
    caption = parts.join(' ');
  }

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => {
          const kk = w / BW;
          return (
            <View style={{ width: w, height: h }}>
              <Svg width={w} height={h}>
                {defs}
                <G transform={`scale(${kk})`}>{body}</G>
              </Svg>
              {handle && (
                <DragHandle
                  testID="drag-depth"
                  x={handle.x * kk}
                  y={handle.y * kk}
                  label={rep.variable(handle.id).name}
                  {...drag.handlers(handle.id, (dx, dy, v0) => handle!.to(dx / kk, dy / kk, v0))}
                />
              )}
            </View>
          );
        }}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}
