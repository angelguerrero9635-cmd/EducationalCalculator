/**
 * HC61 `connection` (ConnectionSpec in typesHe3j.ts): steel connections in US units. `tension`:
 * a plate with a row of bolt holes across it and the net section through them. `bolts`: a lap
 * splice, n bolts in rows of two, in plan and in edge view with the one shear plane. `weld`: a
 * plate lapped on a gusset, two fillet welds of leg w and length L, the throat in section.
 * `blockShear`: a plate end with a line of holes, the block that tears out along the shear and
 * tension planes, drawn in proportion to the areas. Steel and welds are painted; the section
 * lines and dimensions stay flat.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { ConnectionSpec } from '@/data/modules/typesHe3j';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { Arrow } from './he1fKit';
import { Dim, nf, useHe3j } from './he3jKit';
import { Deepen, Metal, TopLight, url, usePaintIds } from './paint';

const BW = 360;

export function Connection({ spec, calc }: { spec: ConnectionSpec; calc: Calculator }) {
  const c = usePalette();
  const { get, lab } = useHe3j(calc);
  const paint = usePaintIds('steel', 'light', 'bolt', 'bead');

  let BH = 220;
  let body: ReactNode = null;
  let caption = '';

  const defs = (
    <Defs>
      <Deepen id={paint.steel} from={c.metal} to={c.metalDark} />
      <TopLight id={paint.light} />
      <Metal id={paint.bolt} light={c.metal} dark={c.metalDark} />
      <Deepen id={paint.bead} from={c.weldBead} to={c.metalDark} />
    </Defs>
  );
  /** A painted steel rectangle. */
  const plate = (x: number, y: number, w: number, h: number, key?: string) => (
    <G key={key}>
      <Rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={url(paint.steel)}
        stroke={c.metalDark}
        strokeWidth={1}
      />
      <Rect x={x} y={y} width={w} height={h} fill={url(paint.light)} />
    </G>
  );
  /** A hole through the plate. */
  const hole = (x: number, y: number, r: number, key: string) => (
    <Circle key={key} cx={x} cy={y} r={r} fill={c.card} stroke={c.metalDark} strokeWidth={1.2} />
  );
  /** A bolt head seen from above: a hexagon with the shank's circle. */
  const boltHead = (x: number, y: number, r: number, key: string) => {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i + Math.PI / 6;
      return `${x + r * 1.45 * Math.cos(a)},${y + r * 1.45 * Math.sin(a)}`;
    }).join(' ');
    return (
      <G key={key}>
        <Polygon points={pts} fill={url(paint.bolt)} stroke={c.metalDark} strokeWidth={1} />
        <Circle cx={x} cy={y} r={r * 0.75} fill="none" stroke={c.metalDark} strokeWidth={0.8} />
      </G>
    );
  };

  if (spec.mode === 'tension') {
    // ── A plate with holes across it, the net section through them ──
    const w = get(spec.plateWidth);
    const t = get(spec.t);
    const n = get(spec.holes);
    const d = get(spec.holeSize);
    const whole = n !== undefined && n >= 0 && Math.round(n) === n;
    const net = w !== undefined && n !== undefined && d !== undefined ? w - n * d : undefined;
    const on = w !== undefined && w > 0 && whole && net !== undefined && net > 0;
    const ww = w ?? 6;
    const s = Math.min(130 / ww, 40);
    const W = ww * s;
    const [x0, x1] = [40, 320];
    const top = 34;
    const xs = 180;
    const nn = whole ? Math.min(n, 40) : 0;
    const r = ((d ?? 0) * s) / 2;
    const ys = Array.from({ length: nn }, (_, i) => top + (W * (i + 0.5)) / nn);
    const T = Math.max(4, (t ?? 0.5) * s);
    const edgeY = top + W + 30;
    BH = edgeY + T + 44;
    // The net material between the holes, lit along the section line.
    const solid: [number, number][] = [];
    let y = top;
    for (const yc of ys) {
      solid.push([y, yc - r]);
      y = yc + r;
    }
    solid.push([y, top + W]);
    body = (
      <G opacity={on ? 1 : 0.4}>
        {plate(x0, top, x1 - x0, W)}
        {ys.map((yc, i) => hole(xs, yc, r, `h${i}`))}
        {/* The net section: dashed through the holes, solid over the steel left. */}
        <Line
          x1={xs}
          y1={top - 10}
          x2={xs}
          y2={top + W + 10}
          stroke={c.chartHighlight}
          strokeWidth={1.5}
          strokeDasharray={chart.dashFine}
        />
        {solid.map(([a, b], i) =>
          b > a ? (
            <Line
              key={`s${i}`}
              x1={xs}
              y1={a}
              x2={xs}
              y2={b}
              stroke={c.chartHighlight}
              strokeWidth={4}
            />
          ) : null,
        )}
        <Arrow
          x1={x0 + 6}
          y1={top + W / 2}
          x2={8}
          y2={top + W / 2}
          color={c.forceApplied}
          width={3}
        />
        <Arrow
          x1={x1 - 6}
          y1={top + W / 2}
          x2={BW - 8}
          y2={top + W / 2}
          color={c.forceApplied}
          width={3}
        />
        <ChartText x={x0 + 30} y={top - 12} fontSize={chart.label} fontWeight="700">
          {lab(spec.plateWidth, 'w', 'in') ?? ''}
        </ChartText>
        <Dim x1={x0 + 18} y1={top} x2={x0 + 18} y2={top + W} color={c.chartInk} />
        <ChartText
          x={xs + 8}
          y={top - 12}
          fontSize={chart.label}
          fontWeight="700"
          fill={c.chartHighlight}
        >
          {on ? `net width ${nf(net)} in` : ''}
        </ChartText>
        <ChartText x={xs + 14} y={top + W + 18} fontSize={chart.label} fontWeight="700">
          {n !== undefined && d !== undefined
            ? `${nf(n)} hole${n === 1 ? '' : 's'} of ${nf(d)} in`
            : ''}
        </ChartText>
        {/* The plate's edge, its thickness to the same scale. */}
        {plate(x0, edgeY, x1 - x0, T)}
        <ChartText x={x0} y={edgeY + T + 18} fontSize={chart.label} fontWeight="700">
          {lab(spec.t, 't', 'in') ? `Edge: ${lab(spec.t, 't', 'in')}` : ''}
        </ChartText>
      </G>
    );
    const parts: string[] = [];
    if (on && t !== undefined) {
      const Ag = ww * t;
      const An = net! * t;
      const U = get(spec.U) ?? 1;
      const Ae = U * An;
      parts.push(`A_g = wt = ${nf(ww)} × ${nf(t)} = ${nf(Ag)} in².`);
      parts.push(
        `A_n = (w − holes × size)t = (${nf(ww)} − ${nf(n!)} × ${nf(d!)}) × ${nf(t)} = ${nf(An)} in², along the lit net section.`,
      );
      const [Fy, Fu] = [get(spec.Fy), get(spec.Fu)];
      if (Fy !== undefined && Fu !== undefined) {
        const yld = 0.9 * Fy * Ag;
        const rup = 0.75 * Fu * Ae;
        parts.push(
          `φP_n = min(0.90F_yA_g, 0.75F_uA_e) = min(${nf(yld)}, ${nf(rup)}) = ${nf(Math.min(yld, rup))} kips: ${rup < yld ? 'rupture at the holes governs' : 'yielding of the whole plate governs'}.`,
        );
      }
    } else if (net !== undefined && !(net > 0))
      parts.push('The holes take the whole width: no plate is left (drawn faded).');
    else parts.push('Type the plate, the holes and their size to draw the net section.');
    caption = parts.join(' ');
  } else if (spec.mode === 'bolts') {
    // ── A lap splice: n bolts in rows of two, plan and edge view ──
    const d = get(spec.d);
    const n = get(spec.n);
    const whole = n !== undefined && n >= 1 && Math.round(n) === n;
    const on = d !== undefined && d > 0 && whole;
    const nn = whole ? Math.min(n, 24) : 4;
    const cols = Math.ceil(nn / 2);
    // Pitch and gage 3d, edge distance 1.5d: the plates sized from the bolt.
    const dd = d ?? 0.75;
    const lap = (cols - 1) * 3 + 3;
    const s = Math.min(150 / (lap * dd), 110 / (6 * dd), 40);
    const u = dd * s;
    const W = 6 * u;
    const L = lap * u;
    const top = 30;
    const xa = (BW - L) / 2;
    const xb = xa + L;
    const tP = Math.max(6, 0.6 * u);
    const ey = top + W + 44;
    const bolts: [number, number][] = [];
    for (let i = 0; i < nn; i++) {
      const col = Math.floor(i / 2);
      const row = i % 2;
      const single = nn % 2 === 1 && col === cols - 1;
      bolts.push([
        xa + 1.5 * u + col * 3 * u,
        top + (single ? 3 * u : row === 0 ? 1.5 * u : 4.5 * u),
      ]);
    }
    BH = ey + 2 * tP + 40;
    body = (
      <G opacity={on ? 1 : 0.4}>
        {/* Plan: the left plate under, the right plate over the lap. */}
        {plate(14, top, xb - 14, W, 'a')}
        {plate(xa, top, BW - 14 - xa, W, 'b')}
        {bolts.map(([x, y], i) => boltHead(x, y, u / 2, `b${i}`))}
        <Arrow x1={30} y1={top + W / 2} x2={4} y2={top + W / 2} color={c.forceApplied} width={3} />
        <Arrow
          x1={BW - 30}
          y1={top + W / 2}
          x2={BW - 4}
          y2={top + W / 2}
          color={c.forceApplied}
          width={3}
        />
        <ChartText x={14} y={top - 10} fontSize={chart.label} fontWeight="700">
          {n !== undefined ? `${lab(spec.n, 'n')} bolts, ${lab(spec.d, 'd', 'in') ?? ''}` : ''}
        </ChartText>
        <ChartText
          x={BW - 14}
          y={top - 10}
          fontSize={chart.label}
          textAnchor="end"
          fill={c.chartMuted}
        >
          spacing 3d, edges 1.5d
        </ChartText>
        {/* Edge view: two plates, the bolts through both, one shear plane. */}
        {plate(14, ey, xb - 14, tP, 'ea')}
        {plate(xa, ey - tP, BW - 14 - xa, tP, 'eb')}
        {bolts
          .filter((_, i) => i % 2 === 0)
          .map(([x], i) => (
            <G key={`e${i}`}>
              <Rect
                x={x - u / 2}
                y={ey - tP - 5}
                width={u}
                height={2 * tP + 10}
                fill={url(paint.bolt)}
                stroke={c.metalDark}
                strokeWidth={0.8}
              />
              <Rect
                x={x - u * 0.8}
                y={ey - tP - 9}
                width={u * 1.6}
                height={5}
                rx={1}
                fill={c.metalDark}
              />
              <Rect
                x={x - u * 0.8}
                y={ey + tP + 4}
                width={u * 1.6}
                height={5}
                rx={1}
                fill={c.metalDark}
              />
            </G>
          ))}
        <Line
          x1={xa - 14}
          y1={ey}
          x2={xb + 14}
          y2={ey}
          stroke={c.chartHighlight}
          strokeWidth={2}
          strokeDasharray={chart.dash}
        />
        <ChartText
          x={xb + 18}
          y={ey + 22}
          fontSize={chart.label}
          fontWeight="700"
          fill={c.chartHighlight}
        >
          shear plane
        </ChartText>
        <Arrow
          x1={40}
          y1={ey + tP / 2}
          x2={14}
          y2={ey + tP / 2}
          color={c.forceApplied}
          width={2.5}
        />
        <Arrow
          x1={BW - 40}
          y1={ey - tP / 2}
          x2={BW - 14}
          y2={ey - tP / 2}
          color={c.forceApplied}
          width={2.5}
        />
      </G>
    );
    const parts: string[] = [];
    if (on) {
      const Ab = (Math.PI * dd * dd) / 4;
      parts.push(`A_b = πd² ÷ 4 = π × ${nf(dd)}² ÷ 4 = ${nf(Ab)} in².`);
      const F = get(spec.Fnv);
      if (F !== undefined) {
        const one = 0.75 * F * Ab;
        parts.push(`One bolt: φr_n = 0.75F_nvA_b = 0.75 × ${nf(F)} × ${nf(Ab)} = ${nf(one)} kips.`);
        parts.push(
          `φR_n = n × φr_n = ${nf(n!)} × ${nf(one)} = ${nf(n! * one)} kips, every bolt cut once at the shear plane.`,
        );
      }
    } else parts.push('Type the bolt diameter and the number of bolts to draw the splice.');
    caption = parts.join(' ');
  } else if (spec.mode === 'weld') {
    // ── A plate lapped on a gusset, two fillet welds; the throat in section ──
    const w = get(spec.weldLeg);
    const L = get(spec.weldLength);
    const k = spec.welds ?? 2;
    const on = w !== undefined && w > 0 && L !== undefined && L > 0;
    const LL = L ?? 10;
    const s = 150 / LL;
    const Lp = LL * s;
    const Wp = Math.min(90, 0.6 * Lp);
    const top = 34;
    const xg = 14;
    const xp = 190 - Lp;
    const bead = Math.max(5, Math.min(9, (w ?? 0.25) * s * 4));
    BH = top + Wp + 90;
    const ripples = (x: number, y: number, key: string) =>
      Array.from({ length: Math.floor(Lp / 7) }, (_, i) => (
        <Path
          key={`${key}${i}`}
          d={`M ${x + 4 + i * 7} ${y} q 3 ${bead / 2} 0 ${bead}`}
          stroke={c.metalDark}
          strokeWidth={0.7}
          fill="none"
        />
      ));
    // The section: a fillet of legs w, the throat at 45°, large.
    const sx = 262;
    const sy = top + 96;
    const leg = 64;
    body = (
      <G opacity={on ? 1 : 0.4}>
        {/* The gusset on the left, the plate lapped over it. */}
        {plate(xg, top - 18, 190 - xg, Wp + 36, 'g')}
        {plate(xp, top, 200 - xp + 10, Wp, 'p')}
        <Arrow
          x1={200}
          y1={top + Wp / 2}
          x2={234}
          y2={top + Wp / 2}
          color={c.forceApplied}
          width={3}
        />
        {/* The two welds along the plate's edges over the lap. */}
        {[top - bead, top + Wp].slice(0, k).map((y, i) => (
          <G key={`w${i}`}>
            <Rect x={xp} y={y} width={Lp} height={bead} rx={bead / 2} fill={url(paint.bead)} />
            {ripples(xp, y, `r${i}`)}
          </G>
        ))}
        <Dim
          x1={xp}
          y1={top + Wp + bead + 12}
          x2={xp + Lp}
          y2={top + Wp + bead + 12}
          color={c.chartInk}
        />
        <ChartText
          x={xp + Lp / 2}
          y={top + Wp + bead + 30}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="middle"
        >
          {`${lab(spec.weldLength, 'L', 'in') ?? ''} each, ${k} weld${k === 1 ? '' : 's'}`}
        </ChartText>
        {/* Section through a weld. */}
        <ChartText x={sx - 20} y={top - 6} fontSize={chart.label} fontWeight="700">
          Weld section
        </ChartText>
        <Rect x={sx - 20} y={sy} width={leg + 46} height={14} fill={url(paint.steel)} />
        <Rect x={sx - 20} y={sy - leg} width={20} height={leg} fill={url(paint.steel)} />
        <Polygon
          points={`${sx},${sy} ${sx},${sy - leg} ${sx + leg},${sy}`}
          fill={url(paint.bead)}
          stroke={c.metalDark}
          strokeWidth={1}
        />
        <Line
          x1={sx}
          y1={sy}
          x2={sx + leg / 2}
          y2={sy - leg / 2}
          stroke={c.chartHighlight}
          strokeWidth={2.5}
        />
        <ChartText
          x={sx - 20}
          y={sy - leg - 10}
          fontSize={chart.label}
          fontWeight="700"
          fill={c.chartHighlight}
          halo
        >
          {lab(spec.throat, 'throat', 'in') ?? 'throat 0.707w'}
        </ChartText>
        <Dim x1={sx} y1={sy + 22} x2={sx + leg} y2={sy + 22} color={c.chartInk} />
        <ChartText
          x={sx + leg / 2}
          y={sy + 40}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="middle"
        >
          {lab(spec.weldLeg, 'w', 'in') ?? ''}
        </ChartText>
      </G>
    );
    BH = Math.max(BH, sy + 48);
    const parts: string[] = [];
    if (on) {
      const F = get(spec.Fexx);
      parts.push(
        `The throat, the weld’s thinnest part, is 0.707w = 0.707 × ${nf(w)} = ${nf(0.707 * w)} in.`,
      );
      if (F !== undefined) {
        const per = 0.75 * 0.6 * F * 0.707 * w;
        parts.push(
          `Per inch: φR_n = 0.75 × 0.6F_EXX × 0.707w = 0.75 × 0.6 × ${nf(F)} × ${nf(0.707 * w)} = ${nf(per)} kip/in.`,
        );
        parts.push(
          `${k === 2 ? 'Both welds' : `All ${k} welds`}: ${nf(per)} × ${nf(LL)} × ${k} = ${nf(per * LL * k)} kips.`,
        );
      }
      parts.push('The section is enlarged; the plan is to scale along the welds.');
    } else parts.push('Type the leg and the length to draw the welds.');
    caption = parts.join(' ');
  } else {
    // ── Block shear: a line of holes, the block torn out, in proportion to the areas ──
    const Agv = get(spec.Agv);
    const Anv = get(spec.Anv);
    const Ant = get(spec.Ant);
    const nh = Math.max(1, Math.min(8, Math.round(get(spec.holes) ?? 3)));
    const on =
      Agv !== undefined &&
      Anv !== undefined &&
      Ant !== undefined &&
      Agv > 0 &&
      Anv > 0 &&
      Anv <= Agv &&
      Ant > 0;
    const gv = Agv ?? 3;
    const nv = on ? Anv! : 0.75 * gv;
    const nt = Ant ?? 0.25 * gv;
    // One thickness throughout: lengths in the areas' ratio. The shear plane is 200 px.
    const Lv = 200;
    const p = Lv / (nh - 0.5);
    const dh = (Lv * (1 - nv / gv)) / (nh - 0.5);
    const Lt = (nt / gv) * Lv + dh / 2;
    const xEnd = 330;
    const top = 40;
    const yLine = top + Lt;
    const Wpl = Math.max(Lt * 2.2, Lt + 60);
    const holesX = Array.from({ length: nh }, (_, i) => xEnd - p / 2 - i * p);
    const xLast = xEnd - Lv;
    BH = top + Wpl + 64;
    body = (
      <G opacity={on ? 1 : 0.4}>
        {plate(20, top, xEnd - 20, Wpl)}
        {/* The block that tears out: shaded, bounded by the two planes. */}
        <Rect
          x={xLast}
          y={top}
          width={xEnd - xLast}
          height={Lt}
          fill={c.chartHighlight}
          opacity={0.22}
        />
        {holesX.map((x, i) => hole(x, yLine, dh / 2, `h${i}`))}
        {/* Shear plane along the holes, tension plane up to the edge. */}
        <Path
          d={`M ${xEnd} ${yLine} H ${xLast} V ${top}`}
          stroke={c.roadBraking}
          strokeWidth={2.5}
          strokeDasharray={chart.dash}
          fill="none"
        />
        <Arrow
          x1={xLast + 30}
          y1={top + Lt / 2}
          x2={xLast + 70}
          y2={top + Lt / 2}
          color={c.chartHighlight}
          width={2.5}
        />
        <Arrow
          x1={60}
          y1={top + Wpl / 2}
          x2={8}
          y2={top + Wpl / 2}
          color={c.forceApplied}
          width={3}
        />
        <ChartText
          x={xLast - 6}
          y={top + Lt / 2 + 4}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="end"
          fill={c.roadBraking}
          halo
        >
          {lab(spec.Ant, 'A_nt', 'in²') ?? ''}
        </ChartText>
        <ChartText
          x={(xLast + xEnd) / 2}
          y={yLine + dh / 2 + 18}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="middle"
          fill={c.roadBraking}
          halo
        >
          {`${lab(spec.Agv, 'A_gv', 'in²') ?? ''}, ${lab(spec.Anv, 'A_nv', 'in²') ?? ''}`}
        </ChartText>
        <ChartText x={20} y={top - 12} fontSize={chart.label} fontWeight="700">
          {`Plate end, ${nh} holes in line`}
        </ChartText>
        <ChartText x={20} y={top + Wpl + 22} fontSize={chart.label} fill={c.chartMuted}>
          Shaded: the block that tears out
        </ChartText>
      </G>
    );
    const parts: string[] = [];
    if (on) {
      const [Fy, Fu] = [get(spec.Fy), get(spec.Fu)];
      const U = get(spec.Ubs) ?? 1;
      parts.push(
        `Lengths are in the areas’ ratio: the holes take A_gv − A_nv = ${nf(gv - nv)} in² from the shear plane.`,
      );
      if (Fy !== undefined && Fu !== undefined) {
        const rup = 0.6 * Fu * nv + U * Fu * nt;
        const yld = 0.6 * Fy * gv + U * Fu * nt;
        parts.push(
          `φR_n = 0.75 × min(0.6F_uA_nv + U_bsF_uA_nt, 0.6F_yA_gv + U_bsF_uA_nt) = 0.75 × min(${nf(rup, 4)}, ${nf(yld, 4)}) = ${nf(0.75 * Math.min(rup, yld))} kips.`,
        );
      }
    } else if (Agv !== undefined && Anv !== undefined && Anv > Agv)
      parts.push('A_nv cannot be more than A_gv: the holes only take area away (drawn faded).');
    else parts.push('Type the three areas to draw the block.');
    caption = parts.join(' ');
  }

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            {defs}
            <G transform={`scale(${w / BW})`}>{body}</G>
          </Svg>
        )}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}
