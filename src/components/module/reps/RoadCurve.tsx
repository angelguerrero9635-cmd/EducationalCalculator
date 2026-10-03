/**
 * HC60 `roadCurve` (RoadCurveSpec in typesHe3j.ts): geometric design of a road. `stopping`: the
 * road from above, a car, the reaction strip and the braking strip to a box on the road, to one
 * scale. `plan`: a circular curve between two tangents (PC, PI, PT, R, Δ, T, L, E) to scale,
 * and with `e` and `f` the banked road in section. `profile`: a crest vertical curve, the sight
 * line of length S at its worst place, heights exaggerated. The road, car and ground are
 * painted; the geometry lines stay flat.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { RoadCurveSpec } from '@/data/modules/typesHe3j';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle } from './common';
import { Arrow } from './he1fKit';
import {
  brakingDistance,
  crestConstant,
  crestProfile,
  curveElements,
  reactionDistance,
  worstSight,
} from './he3jMath';
import { Dim, nf, pathOf, useHe3j, useValueDrag } from './he3jKit';
import { Crate, Deepen, TopLight, url, usePaintIds } from './paint';

const BW = 360;

/** A drag on one value: where its handle sits (picture units) and the value a move gives. */
interface DragSpec {
  id: string;
  x: number;
  y: number;
  to: (dx: number, dy: number, start: number) => number;
}

/** Nice tick values from 0 to max, about n of them. */
function ticks(max: number, n = 5) {
  const raw = max / n;
  const p = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? 10 * p;
  const out: number[] = [];
  for (let x = 0; x <= max + 1e-9; x += step) out.push(Number(x.toFixed(10)));
  return out;
}

/** A car seen from above, its nose at (x, y) heading right, `len` long. */
function CarTop({ x, y, len, lightId }: { x: number; y: number; len: number; lightId: string }) {
  const c = usePalette();
  const w = len * 0.48;
  const x0 = x - len;
  return (
    <G>
      {[0.2, 0.75].map((f) => (
        <G key={f}>
          <Rect
            x={x0 + f * len - 3}
            y={y - w / 2 - 2}
            width={7}
            height={3}
            rx={1}
            fill={c.rubber}
          />
          <Rect
            x={x0 + f * len - 3}
            y={y + w / 2 - 1}
            width={7}
            height={3}
            rx={1}
            fill={c.rubber}
          />
        </G>
      ))}
      <Rect x={x0} y={y - w / 2} width={len} height={w} rx={w * 0.35} fill={c.carBody} />
      <Rect x={x0} y={y - w / 2} width={len} height={w} rx={w * 0.35} fill={url(lightId)} />
      <Rect
        x={x0 + len * 0.55}
        y={y - w * 0.36}
        width={len * 0.16}
        height={w * 0.72}
        rx={2}
        fill={c.carGlass}
      />
      <Rect
        x={x0 + len * 0.16}
        y={y - w * 0.34}
        width={len * 0.12}
        height={w * 0.68}
        rx={2}
        fill={c.carGlass}
      />
    </G>
  );
}

export function RoadCurve({ spec, calc }: { spec: RoadCurveSpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, get, lab, draggable } = useHe3j(calc);
  const paint = usePaintIds('road', 'light', 'soil', 'grass');
  const g = get(spec.g) ?? 9.81;

  const V = get(spec.speed);
  const t = get(spec.reaction);
  const a = get(spec.decel);
  const Gr = get(spec.grade) ?? 0;
  const dr =
    get(spec.reactionDistance) ??
    (V !== undefined && t !== undefined ? reactionDistance(V, t) : undefined);
  const db =
    get(spec.brakingDistance) ??
    (V !== undefined && a !== undefined && a / g + Gr > 0
      ? brakingDistance(V, a, Gr, g)
      : undefined);
  const R = get(spec.radius);
  const D = get(spec.delta);
  const live = {
    ssd: dr !== undefined && db !== undefined ? dr + db : 1,
    R: R ?? 1,
  };
  const drag = useValueDrag(calc, live, spec.keep);
  const frozen = drag.scale;

  let BH = 220;
  let body: ReactNode = null;
  let caption = '';
  let handle: DragSpec | null = null;

  const defs = (
    <Defs>
      <Deepen id={paint.road} from={c.fbRoad} to={c.fbRoadDark} />
      <TopLight id={paint.light} />
      <Deepen id={paint.soil} from={c.soil} to={c.soilDark} />
      <Deepen id={paint.grass} from={c.landGrass} to={c.landGrass} />
    </Defs>
  );

  if (spec.mode === 'stopping') {
    // ── The road from above: reaction strip, braking strip, the box, one scale ──
    const on = dr !== undefined && db !== undefined && db > 0;
    const ssd = on ? dr + db : 0;
    const x0 = 52;
    const span = Math.max(frozen.ssd, ssd, 1);
    const s = (BW - 20 - x0) / (span * 1.04);
    const [rt, rb] = [64, 124];
    const laneY = (rt + rb) / 2;
    const xr = x0 + (dr ?? 0) * s;
    const xb = x0 + ssd * s;
    const tk = ticks(span);
    const rLab =
      lab(spec.reactionDistance, 'd_r', 'm') ?? (dr !== undefined ? `d_r = ${nf(dr)} m` : '');
    const bLab =
      lab(spec.brakingDistance, 'd_b', 'm') ?? (db !== undefined ? `d_b = ${nf(db)} m` : '');
    const sLab = lab(spec.ssd, 'SSD', 'm') ?? `SSD = ${nf(ssd)} m`;
    const centre = (x1: number, x2: number, text: string) =>
      Math.min(BW - 4 - text.length * 3.4, Math.max(4 + text.length * 3.4, (x1 + x2) / 2));
    BH = 214;
    body = (
      <G opacity={on ? 1 : 0.4}>
        {/* Verges, the road, its centre line. */}
        <Rect x={0} y={rt - 12} width={BW} height={12} fill={url(paint.grass)} />
        <Rect x={0} y={rb} width={BW} height={12} fill={url(paint.grass)} />
        <Rect x={0} y={rt} width={BW} height={rb - rt} fill={url(paint.road)} />
        <Line
          x1={0}
          y1={laneY}
          x2={BW}
          y2={laneY}
          stroke={c.roadLine}
          strokeWidth={2}
          strokeDasharray="14 10"
        />
        {/* The strips, in the car's lane. */}
        {on && (
          <G>
            <Rect
              x={x0}
              y={laneY + 4}
              width={xr - x0}
              height={rb - laneY - 8}
              fill={c.roadReaction}
              opacity={0.85}
            />
            <Rect
              x={xr}
              y={laneY + 4}
              width={xb - xr}
              height={rb - laneY - 8}
              fill={c.roadBraking}
              opacity={0.85}
            />
            <ChartText
              x={(x0 + xr) / 2}
              y={laneY + 20}
              fontSize={chart.label}
              fontWeight="700"
              textAnchor="middle"
              fill={c.onChartHighlight}
            >
              {xr - x0 > 64 ? 'reacting' : ''}
            </ChartText>
            <ChartText
              x={(xr + xb) / 2}
              y={laneY + 20}
              fontSize={chart.label}
              fontWeight="700"
              textAnchor="middle"
              fill={c.onChartHighlight}
            >
              {xb - xr > 64 ? 'braking' : ''}
            </ChartText>
          </G>
        )}
        <CarTop x={x0} y={(laneY + rb) / 2} len={34} lightId={paint.light} />
        <Crate x={Math.min(BW - 18, xb + 2)} y={laneY + 8} size={14} lightId={paint.light} />
        {/* The two distances above the road. */}
        <Dim x1={x0} y1={rt - 20} x2={xr} y2={rt - 20} color={c.roadReaction} />
        <Dim x1={xr} y1={rt - 20} x2={xb} y2={rt - 20} color={c.roadBraking} />
        <ChartText
          x={centre(x0, xr, rLab)}
          y={18}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="middle"
          halo
        >
          {rLab}
        </ChartText>
        <ChartText
          x={centre(xr, xb, bLab)}
          y={36}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="middle"
          halo
        >
          {bLab}
        </ChartText>
        <ChartText
          x={8}
          y={laneY - 10}
          fontSize={chart.label}
          fontWeight="700"
          fill={c.onChartHighlight}
        >
          {lab(spec.speed, 'V', 'km/h') ?? ''}
        </ChartText>
        {/* A metre scale, and the whole stopping sight distance. */}
        <Line
          x1={x0}
          y1={rb + 22}
          x2={x0 + span * s}
          y2={rb + 22}
          stroke={c.chartInk}
          strokeWidth={chart.strokeLight}
        />
        {tk.map((v) => (
          <G key={v}>
            <Line
              x1={x0 + v * s}
              y1={rb + 18}
              x2={x0 + v * s}
              y2={rb + 26}
              stroke={c.chartInk}
              strokeWidth={1}
            />
            <ChartText
              x={x0 + v * s}
              y={rb + 40}
              fontSize={chart.label}
              textAnchor="middle"
              fill={c.chartMuted}
            >
              {nf(v)}
            </ChartText>
          </G>
        ))}
        <ChartText x={8} y={rb + 40} fontSize={chart.label} fill={c.chartMuted}>
          m
        </ChartText>
        <Dim x1={x0} y1={rb + 54} x2={xb} y2={rb + 54} color={c.chartInk} />
        <ChartText
          x={centre(x0, xb, sLab)}
          y={rb + 72}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="middle"
        >
          {sLab}
        </ChartText>
      </G>
    );
    if (on && draggable(spec.speed) && t !== undefined && a !== undefined) {
      // Drag the stopping point: the speed whose SSD ends there.
      const speedFor = (d: number) => {
        let [lo, hi] = [0, 400];
        for (let i = 0; i < 60; i++) {
          const m = (lo + hi) / 2;
          if (reactionDistance(m, t) + brakingDistance(m, a, Gr, g) < d) lo = m;
          else hi = m;
        }
        return (lo + hi) / 2;
      };
      handle = {
        id: spec.speed,
        x: xb,
        y: rt - 20,
        to: (dx, _dy, v0) =>
          speedFor(Math.max(1, reactionDistance(v0, t) + brakingDistance(v0, a, Gr, g) + dx / s)),
      };
    }
    const parts: string[] = [];
    if (V !== undefined && t !== undefined && dr !== undefined)
      parts.push(`Reacting: 0.278Vt = 0.278 × ${nf(V)} × ${nf(t)} = ${nf(dr)} m.`);
    if (V !== undefined && a !== undefined && db !== undefined)
      parts.push(
        `Braking: V² ÷ (254(a ÷ g ${Gr < 0 ? '−' : '+'} G)) = ${nf(V)}² ÷ (254 × (${nf(a)} ÷ ${nf(g)} ${Gr < 0 ? '−' : '+'} ${nf(Math.abs(Gr))})) = ${nf(db)} m${Gr > 0 ? ', shorter uphill' : Gr < 0 ? ', longer downhill' : ' on the level'}.`,
      );
    if (on) parts.push(`SSD = ${nf(dr)} + ${nf(db)} = ${nf(ssd)} m, all to one scale.`);
    else if (V !== undefined && a !== undefined && !(a / g + Gr > 0))
      parts.push('On this downgrade the car cannot stop: a ÷ g + G is not above 0.');
    else parts.push('Type the speed, reaction time and deceleration to draw the strips.');
    caption = parts.join(' ');
  } else if (spec.mode === 'plan') {
    // ── A circular curve between tangents, to scale ──
    const e = get(spec.e);
    const f = get(spec.f);
    const banked = spec.e !== undefined;
    const on = R !== undefined && R > 0 && (D === undefined ? banked : D > 0 && D < 180);
    const RR = R ?? frozen.R;
    // Without Δ (a least-radius page) the arc is drawn over 50°, and Δ is not named.
    const dd = D !== undefined && D > 0 && D < 180 ? D : 50;
    const el = curveElements(RR, dd);
    const half = (dd * Math.PI) / 360;
    const top = 30;
    const areaW = banked ? 210 : BW - 40;
    const areaH = banked ? 150 : 190;
    // Fit the chord and tangents across; the centre below when it fits, else cut off.
    const across = 2 * el.T * Math.cos(half) * 1.25 + 1e-9;
    const down = RR + el.E;
    const withCentre = down <= 1.2 * across;
    const s = Math.min(
      areaW / across,
      (areaH - 20) / (withCentre ? down : el.T * Math.sin(half) + el.E + 0.12 * RR),
    );
    const cx = banked ? 20 + areaW / 2 : BW / 2;
    const PI: [number, number] = [cx, top + 18];
    const T = el.T * s;
    const PC: [number, number] = [PI[0] - T * Math.cos(half), PI[1] + T * Math.sin(half)];
    const PT: [number, number] = [PI[0] + T * Math.cos(half), PI[1] + T * Math.sin(half)];
    const O: [number, number] = [PI[0], PI[1] + (RR + el.E) * s];
    const Rs = RR * s;
    const ext = 0.22 * T + 16;
    const back: [number, number] = [PC[0] - ext * Math.cos(half), PC[1] + ext * Math.sin(half)];
    const fwd: [number, number] = [PT[0] + ext * Math.cos(half), PT[1] + ext * Math.sin(half)];
    const arcD = `M ${back[0]} ${back[1]} L ${PC[0]} ${PC[1]} A ${Rs} ${Rs} 0 0 1 ${PT[0]} ${PT[1]} L ${fwd[0]} ${fwd[1]}`;
    const mid: [number, number] = [PI[0], PI[1] + el.E * s];
    const bottom = withCentre ? O[1] + 24 : Math.max(PC[1], mid[1]) + 50;
    const cut = (p: [number, number]) => {
      // A radius toward O, cut where the drawing ends.
      const k = withCentre ? 1 : Math.min(1, (bottom - 12 - p[1]) / (O[1] - p[1]));
      return [p[0] + (O[0] - p[0]) * k, p[1] + (O[1] - p[1]) * k] as [number, number];
    };
    const cPC = cut(PC);
    const cPT = cut(PT);
    // The bank in section (e and f): a lane tilted at the true angle, the car on it.
    const bankAng = Math.atan(e ?? 0);
    const bx0 = 236;
    const by = 120;
    const bw = 108;
    const bank = banked ? (
      <G>
        <ChartText x={bx0} y={by - 74} fontSize={chart.label} fontWeight="700">
          Section, banked
        </ChartText>
        <G transform={`rotate(${(-bankAng * 180) / Math.PI} ${bx0 + bw / 2} ${by})`}>
          <Rect x={bx0} y={by} width={bw} height={8} fill={url(paint.road)} />
          <Rect x={bx0 + bw / 2 - 18} y={by - 22} width={36} height={18} rx={6} fill={c.carBody} />
          <Rect
            x={bx0 + bw / 2 - 18}
            y={by - 22}
            width={36}
            height={18}
            rx={6}
            fill={url(paint.light)}
          />
          <Rect x={bx0 + bw / 2 - 12} y={by - 19} width={24} height={7} rx={2} fill={c.carGlass} />
          <Rect x={bx0 + bw / 2 - 20} y={by - 6} width={8} height={6} rx={1.5} fill={c.rubber} />
          <Rect x={bx0 + bw / 2 + 12} y={by - 6} width={8} height={6} rx={1.5} fill={c.rubber} />
          {f !== undefined && (
            <Arrow
              x1={bx0 + bw / 2 + 18}
              y1={by - 2}
              x2={bx0 + bw / 2 - 30}
              y2={by - 2}
              color={c.forceFriction}
              width={2}
            />
          )}
        </G>
        <Line
          x1={bx0}
          y1={by + 4 + (bw / 2) * Math.tan(bankAng)}
          x2={bx0 + bw}
          y2={by + 4 + (bw / 2) * Math.tan(bankAng)}
          stroke={c.chartMuted}
          strokeWidth={1}
          strokeDasharray={chart.dashFine}
        />
        <ChartText x={bx0} y={by + 36} fontSize={chart.label} fontWeight="700">
          {lab(spec.e, 'e') ?? ''}
        </ChartText>
        <ChartText
          x={bx0}
          y={by + 54}
          fontSize={chart.label}
          fontWeight="700"
          fill={c.forceFriction}
        >
          {lab(spec.f, 'f') ?? ''}
        </ChartText>
        <ChartText x={bx0} y={by + 72} fontSize={chart.label} fontWeight="700">
          {lab(spec.speed, 'V', 'km/h') ?? ''}
        </ChartText>
        <ChartText x={bx0} y={by - 52} fontSize={chart.label} fill={c.chartMuted}>
          ← to the centre
        </ChartText>
      </G>
    ) : null;
    BH = Math.max(bottom + 6, banked ? by + 84 : 0);
    const named = (
      p: [number, number],
      text: string,
      dx: number,
      dy: number,
      anchor: 'start' | 'middle' | 'end',
    ) => (
      <G>
        <Circle cx={p[0]} cy={p[1]} r={4} fill={c.chartInk} />
        <ChartText
          x={p[0] + dx}
          y={p[1] + dy}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor={anchor}
          halo
        >
          {text}
        </ChartText>
      </G>
    );
    const tLab = lab(spec.tangent, 'T', 'm');
    const lLab = lab(spec.length, 'L', 'm');
    const eLab = lab(spec.external, 'E', 'm');
    const rLab = lab(spec.radius, 'R', 'm') ?? '';
    const dLab = D !== undefined ? lab(spec.delta, 'Δ', '°') : undefined;
    body = (
      <G opacity={on ? 1 : 0.4}>
        {/* The road, painted along the alignment, the centre line on it. */}
        <Path d={arcD} stroke={c.fbRoad} strokeWidth={14} fill="none" strokeLinejoin="round" />
        <Path d={arcD} stroke={c.roadLine} strokeWidth={1.5} strokeDasharray="8 6" fill="none" />
        {/* The tangents run on to the PI. */}
        <Path
          d={`M ${PC[0]} ${PC[1]} L ${PI[0]} ${PI[1]} L ${PT[0]} ${PT[1]}`}
          stroke={c.chartInk}
          strokeWidth={chart.strokeLight}
          strokeDasharray={chart.dash}
          fill="none"
        />
        {/* Radii to the centre, and E from the PI to the curve. */}
        <Path
          d={`M ${PC[0]} ${PC[1]} L ${cPC[0]} ${cPC[1]} M ${PT[0]} ${PT[1]} L ${cPT[0]} ${cPT[1]}`}
          stroke={c.chartMuted}
          strokeWidth={1.2}
          fill="none"
        />
        <Line
          x1={PI[0]}
          y1={PI[1]}
          x2={mid[0]}
          y2={mid[1]}
          stroke={c.chartHighlight}
          strokeWidth={chart.stroke}
        />
        {withCentre && named(O, 'O', 0, 18, 'middle')}
        {withCentre && dLab && (
          <G>
            <Path
              d={`M ${O[0] - 18 * Math.sin(half)} ${O[1] - 18 * Math.cos(half)} A 18 18 0 0 1 ${O[0] + 18 * Math.sin(half)} ${O[1] - 18 * Math.cos(half)}`}
              stroke={c.chartInk}
              strokeWidth={1.2}
              fill="none"
            />
            <ChartText x={O[0] + 24} y={O[1] - 8} fontSize={chart.label} fontWeight="700" halo>
              {dLab}
            </ChartText>
          </G>
        )}
        {!withCentre && (
          <ChartText
            x={cx}
            y={bottom - 2}
            fontSize={chart.label}
            textAnchor="middle"
            fill={c.chartMuted}
          >
            the centre O is off the page
          </ChartText>
        )}
        {!withCentre && dLab && (
          <G>
            {/* Δ at the PI: the back tangent run on, and the forward tangent. */}
            <Line
              x1={PI[0]}
              y1={PI[1]}
              x2={PI[0] + 44 * Math.cos(half)}
              y2={PI[1] - 44 * Math.sin(half)}
              stroke={c.chartInk}
              strokeWidth={1.2}
              strokeDasharray={chart.dashFine}
            />
            <Path
              d={`M ${PI[0] + 22 * Math.cos(half)} ${PI[1] - 22 * Math.sin(half)} A 22 22 0 0 1 ${PI[0] + 22 * Math.cos(half)} ${PI[1] + 22 * Math.sin(half)}`}
              stroke={c.chartInk}
              strokeWidth={1.2}
              fill="none"
            />
            <ChartText x={PI[0] + 48} y={PI[1] + 5} fontSize={chart.label} fontWeight="700" halo>
              {dLab}
            </ChartText>
          </G>
        )}
        {D !== undefined && named(PI, 'PI', 0, -10, 'middle')}
        {named(PC, 'PC', -8, -8, 'end')}
        {named(PT, 'PT', 8, -8, 'start')}
        {tLab && (
          <ChartText
            x={PC[0] + 0.42 * (PI[0] - PC[0]) - 16 * Math.sin(half)}
            y={PC[1] + 0.42 * (PI[1] - PC[1]) - 16 * Math.cos(half)}
            fontSize={chart.label}
            fontWeight="700"
            textAnchor="middle"
            halo
          >
            {tLab}
          </ChartText>
        )}
        {eLab && (
          <ChartText
            x={PI[0] - 12}
            y={PI[1] - 10}
            fontSize={chart.label}
            fontWeight="700"
            textAnchor="end"
            fill={c.chartHighlight}
            halo
          >
            {eLab}
          </ChartText>
        )}
        {lLab && (
          <ChartText
            x={mid[0]}
            y={mid[1] + 26}
            fontSize={chart.label}
            fontWeight="700"
            textAnchor="middle"
            halo
          >
            {lLab}
          </ChartText>
        )}
        <ChartText
          x={(PC[0] + cPC[0]) / 2 + 12 * Math.cos(half)}
          y={(PC[1] + cPC[1]) / 2 - 12 * Math.sin(half) + 4}
          fontSize={chart.label}
          fontWeight="700"
          halo
        >
          {rLab}
        </ChartText>
        {bank}
      </G>
    );
    if (on && D !== undefined && draggable(spec.delta)) {
      handle = {
        id: spec.delta,
        x: PT[0],
        y: PT[1],
        to: (dx, _dy, d0) => Math.max(2, Math.min(150, d0 + dx * 0.4)),
      };
    }
    const parts: string[] = [];
    if (banked && V !== undefined && e !== undefined && f !== undefined && R !== undefined)
      parts.push(
        `R_min = V² ÷ (127(e + f)) = ${nf(V)}² ÷ (127 × (${nf(e)} + ${nf(f)})) = ${nf(R)} m. The bank e and the tyres’ side friction f hold the car on the curve.`,
      );
    if (D !== undefined && R !== undefined && on)
      parts.push(
        `T = R tan(Δ ÷ 2) = ${nf(R)} × tan(${nf(D)}° ÷ 2) = ${nf(el.T)} m; L = RΔπ ÷ 180 = ${nf(el.L)} m; E = R(1 ÷ cos(Δ ÷ 2) − 1) = ${nf(el.E)} m. Drawn to scale.`,
      );
    if (!on) parts.push('Type the radius and the deflection angle to draw the curve.');
    else if (D === undefined) parts.push('The arc is drawn to scale over 50° to show the radius.');
    caption = parts.join(' ');
  } else {
    // ── A crest vertical curve and the sight line at its worst place ──
    const g1 = get(spec.g1);
    const g2 = get(spec.g2);
    const L = get(spec.curveLength);
    const S = get(spec.sight);
    const [h1, h2] = [spec.eye ?? 1.08, spec.object ?? 0.6];
    const on =
      g1 !== undefined &&
      g2 !== undefined &&
      L !== undefined &&
      S !== undefined &&
      g1 > g2 &&
      L > 0 &&
      S > 0;
    const G1 = g1 ?? 3;
    const G2 = g2 ?? -2;
    const LL = L ?? 250;
    const SS = S ?? 180;
    const y = crestProfile(G1, G2, LL);
    const w = worstSight(G1, G2, LL, SS, h1, h2);
    const xmin = Math.min(-0.15 * LL, w.xe - 0.08 * LL);
    const xmax = Math.max(1.15 * LL, w.xe + SS + 0.08 * LL);
    const sx = (BW - 24) / (xmax - xmin);
    let ylo = Infinity;
    let yhi = -Infinity;
    for (let i = 0; i <= 100; i++) {
      const x = xmin + ((xmax - xmin) * i) / 100;
      ylo = Math.min(ylo, y(x));
      yhi = Math.max(yhi, y(x));
    }
    yhi += Math.max(h1, h2);
    // Heights exaggerated by a round factor so the crest fills about 100 px.
    const raw = 100 / ((yhi - ylo) * sx);
    const ve = [2, 5, 10, 20, 25, 50, 100, 200].reduce(
      (b, f) => (Math.abs(f - raw) < Math.abs(b - raw) ? f : b),
      10,
    );
    const sy = sx * ve;
    const top = 60;
    const X = (x: number) => 12 + (x - xmin) * sx;
    const Y = (z: number) => top + (yhi - z) * sy;
    const groundB = Y(ylo) + 26;
    const pts: [number, number][] = [];
    for (let i = 0; i <= 160; i++) {
      const x = xmin + ((xmax - xmin) * i) / 160;
      pts.push([X(x), Y(y(x))]);
    }
    const ground = `${pathOf(pts)} L ${X(xmax)} ${groundB} L ${X(xmin)} ${groundB} Z`;
    const pvi: [number, number] = [X(LL / 2), Y((G1 / 100) * (LL / 2))];
    const eye: [number, number] = [X(w.xe), Y(y(w.xe) + h1)];
    const obj: [number, number] = [X(w.xe + SS), Y(y(w.xe + SS) + h2)];
    const K = crestConstant(h1, h2);
    const A = Math.abs(G1 - G2);
    const long = (A * SS * SS) / K;
    const need = long >= SS ? long : 2 * SS - K / A;
    const touches = Math.abs(w.gap) <= 2e-3 * h2;
    const clear = w.gap > 0;
    const lineColor = touches || clear ? c.chartHighlight : c.roadBraking;
    BH = groundB + 50;
    body = (
      <G opacity={on ? 1 : 0.4}>
        <Path d={ground} fill={url(paint.soil)} />
        <Path d={pathOf(pts)} stroke={c.fbRoad} strokeWidth={4} fill="none" />
        {/* The grades run on to the PVI, dashed. */}
        <Path
          d={`M ${X(0)} ${Y(0)} L ${pvi[0]} ${pvi[1]} L ${X(LL)} ${Y(y(LL))}`}
          stroke={c.chartMuted}
          strokeWidth={1.2}
          strokeDasharray={chart.dash}
          fill="none"
        />
        {[
          [X(0), Y(0), 'PVC'],
          [X(LL), Y(y(LL)), 'PVT'],
        ].map(([px, py, n]) => (
          <G key={n as string}>
            <Line
              x1={px as number}
              y1={(py as number) - 6}
              x2={px as number}
              y2={groundB}
              stroke={c.chartInk}
              strokeWidth={1}
              strokeDasharray={chart.dashFine}
            />
            <ChartText
              x={px as number}
              y={groundB + 14}
              fontSize={chart.label}
              textAnchor="middle"
              fontWeight="700"
            >
              {n as string}
            </ChartText>
          </G>
        ))}
        <Circle cx={pvi[0]} cy={pvi[1]} r={3.5} fill={c.chartMuted} />
        <ChartText
          x={X(xmin) + 2}
          y={Y(y(xmin)) + 20}
          fontSize={chart.label}
          fontWeight="700"
          fill={c.onChartHighlight}
        >
          {lab(spec.g1, 'G₁', '%') ?? ''}
        </ChartText>
        <ChartText
          x={X(xmax) - 2}
          y={Y(y(xmax)) + 20}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="end"
          fill={c.onChartHighlight}
        >
          {lab(spec.g2, 'G₂', '%') ?? ''}
        </ChartText>
        {/* L along the bottom. */}
        <Dim x1={X(0)} y1={groundB + 24} x2={X(LL)} y2={groundB + 24} color={c.chartInk} />
        <ChartText
          x={(X(0) + X(LL)) / 2}
          y={groundB + 42}
          fontSize={chart.label}
          textAnchor="middle"
          fontWeight="700"
        >
          {lab(spec.curveLength, 'L', 'm') ?? ''}
        </ChartText>
        {/* The sight line from the eye to the object. */}
        <Line
          x1={eye[0]}
          y1={eye[1]}
          x2={obj[0]}
          y2={obj[1]}
          stroke={lineColor}
          strokeWidth={chart.stroke}
        />
        <Circle cx={eye[0]} cy={eye[1]} r={4} fill={c.carBody} />
        <Line
          x1={eye[0]}
          y1={eye[1]}
          x2={eye[0]}
          y2={Y(y(w.xe))}
          stroke={c.carBody}
          strokeWidth={2}
        />
        <Rect
          x={obj[0] - 3}
          y={obj[1]}
          width={6}
          height={Math.max(2, Y(y(w.xe + SS)) - obj[1])}
          fill={c.boxKraftDark}
        />
        {touches && (
          <Circle
            cx={X(w.at)}
            cy={Y(y(w.at))}
            r={4.5}
            fill="none"
            stroke={c.chartHighlight}
            strokeWidth={2}
          />
        )}
        <ChartText
          x={Math.max(70, Math.min(BW - 70, (eye[0] + obj[0]) / 2))}
          y={Math.min(eye[1], obj[1]) - 22}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="middle"
          fill={lineColor}
          halo
        >
          {`${lab(spec.sight, 'S', 'm') ?? ''}: ${touches ? 'just touches the crest' : clear ? 'clears the crest' : 'blocked by the crest'}`}
        </ChartText>
        <ChartText x={8} y={16} fontSize={chart.label} fill={c.chartMuted}>
          {`Heights × ${ve}; eye ${nf(h1)} m, object ${nf(h2)} m`}
        </ChartText>
      </G>
    );
    const parts: string[] = [];
    if (on) {
      parts.push(
        `The dashed grades meet at the PVI (dot). A = |G₁ − G₂| = |${nf(G1)} − (${nf(G2)})| = ${nf(A)}%.`,
      );
      parts.push(
        long >= SS
          ? `S < L, so L = AS² ÷ ${nf(K)} = ${nf(A)} × ${nf(SS)}² ÷ ${nf(K)} = ${nf(need)} m.`
          : `S > L, so L = 2S − ${nf(K)} ÷ A = 2 × ${nf(SS)} − ${nf(K)} ÷ ${nf(A)} = ${nf(need)} m.`,
      );
      parts.push(
        touches
          ? 'With that L, the sight line at its worst place just touches the road: the curve is exactly long enough.'
          : clear
            ? `This curve is longer than ${nf(need)} m, so the sight line clears the crest everywhere.`
            : `This curve is shorter than ${nf(need)} m, so the crest blocks the view somewhere.`,
      );
    } else if (g1 !== undefined && g2 !== undefined && !(g1 > g2))
      parts.push('A crest curve needs G₁ above G₂ (drawn faded).');
    else parts.push('Type the grades, the sight distance and the length to draw the curve.');
    caption = parts.join(' ');
  }

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => {
          const k = w / BW;
          return (
            <View style={{ width: w, height: h }}>
              <Svg width={w} height={h}>
                {defs}
                <G transform={`scale(${k})`}>{body}</G>
              </Svg>
              {handle && (
                <DragHandle
                  testID={`drag-${handle.id}`}
                  x={handle.x * k}
                  y={handle.y * k}
                  label={rep.variable(handle.id).name}
                  {...drag.handlers(handle.id, (dx, dy, v0) => handle!.to(dx / k, dy / k, v0))}
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
