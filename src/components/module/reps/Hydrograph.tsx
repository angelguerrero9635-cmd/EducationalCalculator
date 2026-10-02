/**
 * HC89 `hydrograph` (HydrographSpec in typesHe3j.ts): rainfall and runoff. `split`: the storm's
 * depth P as a column hanging from the top, cut into the initial abstraction I_a, infiltration F
 * and runoff Q, beside the curve-number curve Q(P) with the storm on it. `rational`: rain on a
 * watershed, the share C running off to the outlet as Q = CiA ÷ 360; with t_c, the rain bar
 * hanging from the top of a time chart and the runoff rising to its peak at t_c below.
 * `detention`: inflow and outflow triangles over t_b, the storage between them shaded. The
 * watershed is painted; the columns and charts stay flat.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { HydrographSpec } from '@/data/modules/typesHe3j';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle } from './common';
import { Arrow } from './he1fKit';
import { cnRunoff, detentionStorage, outflowPeakAt, rationalPeak } from './he3jMath';
import { nf, pathOf, useHe3j, useValueDrag } from './he3jKit';
import { Deepen, TopLight, url, usePaintIds } from './paint';

const BW = 360;

/** A drag on one value: where its handle sits (picture units) and the value a move gives. */
interface DragSpec {
  id: string;
  x: number;
  y: number;
  to: (dx: number, dy: number, start: number) => number;
}

/** Nice tick values from 0 to max, about n of them. */
function ticks(max: number, n = 4) {
  const raw = max / n;
  const p = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? 10 * p;
  const out: number[] = [];
  for (let x = 0; x <= max + 1e-9; x += step) out.push(Number(x.toFixed(10)));
  return out;
}

/** Labels down one side, each at its wanted y but pushed apart to `gap`. */
function spread(ys: number[], gap: number, lo: number, hi: number) {
  const out = [...ys];
  for (let i = 1; i < out.length; i++) out[i] = Math.max(out[i]!, out[i - 1]! + gap);
  const over = out[out.length - 1]! - hi;
  if (over > 0) for (let i = 0; i < out.length; i++) out[i] = out[i]! - over;
  for (let i = 0; i < out.length; i++) out[i] = Math.max(out[i]!, lo + i * gap);
  return out;
}

export function Hydrograph({ spec, calc }: { spec: HydrographSpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, get, lab, draggable } = useHe3j(calc);
  const paint = usePaintIds('land', 'light', 'water');
  const du = spec.depthUnit ?? 'in';

  const P = get(spec.P);
  const CN = get(spec.CN);
  const S = get(spec.S) ?? (CN !== undefined && CN > 0 ? 1000 / CN - 10 : undefined);
  const Qi = get(spec.Qin);
  const live = { P: P ?? 1, Qi: Qi ?? 1 };
  const drag = useValueDrag(calc, live, spec.keep);
  const frozen = drag.scale;

  let BH = 230;
  let body: ReactNode = null;
  let caption = '';
  let handle: DragSpec | null = null;

  const defs = (
    <Defs>
      <Deepen id={paint.land} from={c.landGrass} to={c.soil} />
      <TopLight id={paint.light} />
      <Deepen id={paint.water} from={c.water} to={c.waterDeep} />
    </Defs>
  );

  if (spec.mode === 'split') {
    // ── P hanging from the top, cut into I_a, F and Q; the Q(P) curve beside it ──
    const on = P !== undefined && P > 0 && S !== undefined && S >= 0;
    const PP = P ?? 4;
    const SS = S ?? 2.5;
    const Ia = Math.min(PP, 0.2 * SS);
    const Q = get(spec.Q) ?? cnRunoff(PP, SS);
    const F = PP - Ia - Q;
    const top = 34;
    const colH = 170;
    const sc = colH / Math.max(PP, frozen.P);
    const [cx0, cw] = [44, 40];
    const segs: [string, number, string, string][] = [
      ['I_a', Ia, c.hydroAbstract, lab(spec.Ia, 'I_a', du) ?? `I_a = ${nf(Ia)} ${du}`],
      ['F', F, c.hydroInfil, lab(spec.F, 'F', du) ?? `F = ${nf(F)} ${du}`],
      ['Q', Q, c.hydroRunoff, lab(spec.Q, 'Q', du) ?? `Q = ${nf(Q)} ${du}`],
    ];
    let y = top;
    const rects = segs.map(([k, v, col, text]) => {
      const r = { k, y0: y, h: Math.max(0, v) * sc, col, text };
      y += r.h;
      return r;
    });
    const ly = spread(
      rects.map((r) => r.y0 + r.h / 2 + 4),
      18,
      top + 8,
      top + PP * sc + 4,
    );
    // The curve: Q against P on one scale, from I_a.
    const [gx0, gx1] = [196, 348];
    const gy1 = top + colH;
    const pmax = Math.max(PP, frozen.P) * 1.15;
    const gs = Math.min((gx1 - gx0) / pmax, colH / pmax);
    const GX = (p: number) => gx0 + p * gs;
    const GY = (q: number) => gy1 - q * gs;
    const curve: [number, number][] = [];
    for (let i = 0; i <= 80; i++) {
      const p = (pmax * i) / 80;
      curve.push([GX(p), GY(cnRunoff(p, SS))]);
    }
    const tk = ticks(pmax);
    BH = gy1 + 44;
    body = (
      <G opacity={on ? 1 : 0.4}>
        <ChartText x={8} y={18} fontSize={chart.label} fontWeight="700">
          The storm, split
        </ChartText>
        <Line
          x1={cx0 - 10}
          y1={top}
          x2={cx0 + cw + 10}
          y2={top}
          stroke={c.chartInk}
          strokeWidth={1.5}
        />
        {rects.map((r) =>
          r.h > 0 ? (
            <Rect
              key={r.k}
              x={cx0}
              y={r.y0}
              width={cw}
              height={r.h}
              fill={r.col}
              stroke={c.card}
              strokeWidth={1}
            />
          ) : null,
        )}
        {rects.map((r, i) => (
          <G key={`l${r.k}`}>
            <Line
              x1={cx0 + cw}
              y1={r.y0 + r.h / 2}
              x2={cx0 + cw + 8}
              y2={ly[i]! - 4}
              stroke={c.chartMuted}
              strokeWidth={1}
            />
            <ChartText x={cx0 + cw + 11} y={ly[i]!} fontSize={chart.label} fontWeight="700">
              {r.text}
            </ChartText>
          </G>
        ))}
        {/* P down the left side. */}
        <Path
          d={`M ${cx0 - 8} ${top} V ${top + PP * sc} M ${cx0 - 12} ${top + PP * sc} h 8`}
          stroke={c.hydroRain}
          strokeWidth={2}
        />
        <ChartText
          x={cx0 - 14}
          y={top + (PP * sc) / 2 + 4}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="end"
          fill={c.hydroRain}
        >
          P
        </ChartText>
        <ChartText
          x={8}
          y={top + PP * sc + 20}
          fontSize={chart.label}
          fontWeight="700"
          fill={c.hydroRain}
        >
          {lab(spec.P, 'P', du) ?? ''}
        </ChartText>
        {/* Q against P. */}
        <ChartText x={gx0 - 26} y={18} fontSize={chart.label} fontWeight="700">
          {`Runoff Q against rain P (${du})`}
        </ChartText>
        {tk.map((t) => (
          <G key={t}>
            <Line
              x1={GX(t)}
              y1={gy1}
              x2={GX(t)}
              y2={GY(pmax)}
              stroke={c.chartGrid}
              strokeWidth={1}
            />
            <Line
              x1={gx0}
              y1={GY(t)}
              x2={GX(pmax)}
              y2={GY(t)}
              stroke={c.chartGrid}
              strokeWidth={1}
            />
            <ChartText
              x={GX(t)}
              y={gy1 + 16}
              fontSize={chart.label}
              textAnchor="middle"
              fill={c.chartMuted}
            >
              {nf(t)}
            </ChartText>
            <ChartText
              x={gx0 - 6}
              y={GY(t) + 4}
              fontSize={chart.label}
              textAnchor="end"
              fill={c.chartMuted}
            >
              {nf(t)}
            </ChartText>
          </G>
        ))}
        <Path
          d={`M ${gx0} ${GY(pmax)} V ${gy1} H ${GX(pmax)}`}
          stroke={c.chartInk}
          strokeWidth={chart.strokeLight}
          fill="none"
        />
        <Line
          x1={GX(0)}
          y1={GY(0)}
          x2={GX(pmax)}
          y2={GY(pmax)}
          stroke={c.chartMuted}
          strokeWidth={1.2}
          strokeDasharray={chart.dash}
        />
        <Path
          d={pathOf(curve)}
          stroke={c.hydroRunoff}
          strokeWidth={chart.strokeHeavy}
          fill="none"
        />
        <Line
          x1={GX(PP)}
          y1={gy1}
          x2={GX(PP)}
          y2={GY(Q)}
          stroke={c.hydroRain}
          strokeWidth={1.2}
          strokeDasharray={chart.dashFine}
        />
        <Circle cx={GX(PP)} cy={GY(Q)} r={5} fill={c.hydroRunoff} />
        <ChartText
          x={GX(PP) - 8}
          y={GY(Q) - 8}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="end"
          halo
        >
          {lab(spec.CN, 'CN') ?? ''}
        </ChartText>
        <ChartText
          x={GX(pmax)}
          y={gy1 + 32}
          fontSize={chart.label}
          textAnchor="end"
          fill={c.chartMuted}
        >
          dashed: all of it runs off
        </ChartText>
      </G>
    );
    if (on && draggable(spec.P)) {
      handle = {
        id: spec.P,
        x: cx0 + cw / 2,
        y: top + PP * sc,
        to: (_dx, dy, p0) => Math.max(0.01, p0 + dy / sc),
      };
    }
    const parts: string[] = [];
    if (on) {
      if (CN !== undefined)
        parts.push(
          `S = 1000 ÷ CN − 10 = 1000 ÷ ${nf(CN)} − 10 = ${nf(SS)} ${du}; I_a = 0.2S = ${nf(0.2 * SS)} ${du}.`,
        );
      parts.push(
        PP > 0.2 * SS
          ? `Q = (P − I_a)² ÷ (P + 0.8S) = (${nf(PP)} − ${nf(Ia)})² ÷ (${nf(PP)} + 0.8 × ${nf(SS)}) = ${nf(Q)} ${du}.`
          : `P is no more than I_a: the ground holds it all and Q = 0.`,
      );
      parts.push(
        `The rest soaks in: F = P − I_a − Q = ${nf(PP)} − ${nf(Ia)} − ${nf(Q)} = ${nf(F)} ${du}, so I_a + F + Q = P.`,
      );
    } else parts.push('Type the curve number and the rain to split the storm.');
    caption = parts.join(' ');
  } else if (spec.mode === 'rational') {
    // ── Rain on a watershed; the share C runs off to the outlet ──
    const C = get(spec.C);
    const i = get(spec.i);
    const A = get(spec.A);
    const tc = get(spec.tc);
    const on = C !== undefined && i !== undefined && A !== undefined && C >= 0 && C <= 1;
    const Qp = get(spec.Qp) ?? (on ? rationalPeak(C, i, A) : undefined);
    const CC = C ?? 0.5;
    // The watershed: a lobed outline, its stream to the outlet at the bottom.
    const wx = 92;
    const wy = 112;
    const lobe = (k: number) => 62 + 10 * Math.sin(3 * k) + 6 * Math.cos(5 * k + 1);
    const outline: [number, number][] = Array.from({ length: 73 }, (_, j) => {
      const k = (j / 72) * 2 * Math.PI;
      return [wx + lobe(k) * Math.cos(k) * 1.1, wy + lobe(k) * Math.sin(k) * 0.72];
    });
    const outlet: [number, number] = [wx, wy + 0.72 * lobe(Math.PI / 2)];
    const stream = `M ${wx - 38} ${wy - 30} Q ${wx - 10} ${wy - 10} ${wx - 4} ${wy + 10} T ${outlet[0]} ${outlet[1]} M ${wx + 44} ${wy - 22} Q ${wx + 16} ${wy - 6} ${wx - 4} ${wy + 10}`;
    const drops = Array.from({ length: 14 }, (_, j): [number, number] => [
      24 + j * 11,
      18 + ((j * 7) % 3) * 6,
    ]);
    const [bx, bw, btop, bh] = [190, 34, 40, 150];
    const timeChart = tc !== undefined && tc > 0;
    const ty0 = 230;
    BH = timeChart ? ty0 + 170 : 214;
    body = (
      <G opacity={on ? 1 : 0.4}>
        {drops.map(([x, y], j) => (
          <Line
            key={j}
            x1={x}
            y1={y}
            x2={x - 3}
            y2={y + 9}
            stroke={c.hydroRain}
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}
        <Path
          d={pathOf(outline, true)}
          fill={url(paint.land)}
          stroke={c.chartInk}
          strokeWidth={1.5}
        />
        <Path d={pathOf(outline, true)} fill={url(paint.light)} />
        <Path d={stream} stroke={c.waterDeep} strokeWidth={3} fill="none" strokeLinecap="round" />
        <Arrow
          x1={outlet[0]}
          y1={outlet[1]}
          x2={outlet[0] + 36}
          y2={outlet[1] + 24}
          color={c.hydroRunoff}
          width={3}
        />
        <ChartText
          x={outlet[0] + 40}
          y={outlet[1] + 30}
          fontSize={chart.label}
          fontWeight="700"
          fill={c.hydroRunoff}
          halo
        >
          {lab(spec.Qp, 'Q', 'm³/s') ?? (Qp !== undefined ? `Q = ${nf(Qp)} m³/s` : '')}
        </ChartText>
        <ChartText
          x={wx}
          y={wy - 8}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="middle"
          halo
        >
          {lab(spec.A, 'A', 'ha') ?? ''}
        </ChartText>
        <ChartText
          x={wx}
          y={wy + 26}
          fontSize={chart.label}
          textAnchor="middle"
          fill={c.chartMuted}
          halo
        >
          outline not to scale
        </ChartText>
        <ChartText x={186} y={24} fontSize={chart.label} fontWeight="700" fill={c.hydroRain}>
          {lab(spec.i, 'i', 'mm/h') ?? ''}
        </ChartText>
        {/* Of the rain falling: the share C that runs off. */}
        <Rect x={bx} y={btop} width={bw} height={bh * CC} fill={c.hydroRunoff} />
        <Rect x={bx} y={btop + bh * CC} width={bw} height={bh * (1 - CC)} fill={c.hydroInfil} />
        <Rect
          x={bx}
          y={btop}
          width={bw}
          height={bh}
          fill="none"
          stroke={c.chartInk}
          strokeWidth={1}
        />
        <ChartText
          x={bx + bw + 8}
          y={btop + (bh * CC) / 2 + 4}
          fontSize={chart.label}
          fontWeight="700"
        >
          {`runs off: ${lab(spec.C, 'C') ?? ''}`}
        </ChartText>
        <ChartText
          x={bx + bw + 8}
          y={btop + bh * CC + (bh * (1 - CC)) / 2 + 4}
          fontSize={chart.label}
          fill={c.chartMuted}
        >
          {`soaks in: ${nf(1 - CC)}`}
        </ChartText>
        {timeChart &&
          Qp !== undefined &&
          i !== undefined &&
          (() => {
            // Rain hangs from the top for t_c; the runoff rises to Q_p at t_c, then falls.
            const tmax = 2.2 * tc;
            const [x0, x1] = [56, 340];
            const X = (t: number) => x0 + ((x1 - x0) * t) / tmax;
            const rainH = 40;
            const qTop = ty0 + 66;
            const qBot = ty0 + 140;
            const QY = (q: number) => qBot - ((qBot - qTop) * q) / (Qp * 1.15);
            return (
              <G>
                <Line x1={x0} y1={ty0} x2={x1} y2={ty0} stroke={c.chartInk} strokeWidth={1.5} />
                <Rect
                  x={X(0)}
                  y={ty0}
                  width={X(tc) - X(0)}
                  height={rainH}
                  fill={c.hydroRain}
                  opacity={0.85}
                />
                <ChartText
                  x={X(tc) + 6}
                  y={ty0 + 24}
                  fontSize={chart.label}
                  fill={c.hydroRain}
                  fontWeight="700"
                >
                  rain at i
                </ChartText>
                <Path
                  d={`M ${x0} ${qTop - 10} V ${qBot} H ${x1}`}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                  fill="none"
                />
                <Path
                  d={`M ${X(0)} ${QY(0)} L ${X(tc)} ${QY(Qp)} L ${X(2 * tc)} ${QY(0)}`}
                  stroke={c.hydroRunoff}
                  strokeWidth={chart.strokeHeavy}
                  fill="none"
                />
                <Line
                  x1={X(tc)}
                  y1={ty0 + rainH}
                  x2={X(tc)}
                  y2={qBot}
                  stroke={c.chartMuted}
                  strokeWidth={1}
                  strokeDasharray={chart.dashFine}
                />
                <ChartText
                  x={X(tc) + 6}
                  y={QY(Qp) + 4}
                  fontSize={chart.label}
                  fontWeight="700"
                  fill={c.hydroRunoff}
                  halo
                >
                  peak at t_c
                </ChartText>
                <ChartText
                  x={X(tc)}
                  y={qBot + 16}
                  fontSize={chart.label}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {lab(spec.tc, 't_c', 'min') ?? ''}
                </ChartText>
                <ChartText
                  x={x0 - 6}
                  y={qBot - 30}
                  fontSize={chart.label}
                  textAnchor="end"
                  fill={c.chartMuted}
                >
                  Q
                </ChartText>
                <ChartText
                  x={x1}
                  y={qBot + 16}
                  fontSize={chart.label}
                  textAnchor="end"
                  fill={c.chartMuted}
                >
                  t
                </ChartText>
              </G>
            );
          })()}
      </G>
    );
    const parts: string[] = [];
    if (on && Qp !== undefined)
      parts.push(
        `Q = CiA ÷ 360 = ${nf(CC)} × ${nf(i)} × ${nf(A)} ÷ 360 = ${nf(Qp, 4)} m³/s: of all the rain, the share C runs off (360 turns mm/h on hectares into m³/s).`,
      );
    else parts.push('Type C, the intensity and the area to find the peak.');
    if (timeChart)
      parts.push(
        'Once rain has fallen for t_c, the whole watershed sends water to the outlet: the peak.',
      );
    caption = parts.join(' ');
  } else {
    // ── Inflow and outflow triangles; the storage between them ──
    const Qo = get(spec.Qout);
    const tb = get(spec.tb);
    const sec = spec.tbSeconds ?? 3600;
    const pk = spec.peakAt ?? 0.375;
    const on =
      Qi !== undefined &&
      Qo !== undefined &&
      tb !== undefined &&
      Qi > 0 &&
      Qo > 0 &&
      Qo < Qi &&
      tb > 0;
    const QI = Qi ?? 3;
    const QO = Qo ?? 1;
    const TB = tb ?? 2;
    const V = get(spec.V) ?? detentionStorage(QI, Math.min(QO, QI), TB, sec);
    const to = outflowPeakAt(QI, Math.min(QO, QI), pk);
    const [x0, x1] = [52, 340];
    const [yTop, yBot] = [34, 190];
    const qmax = Math.max(QI, frozen.Qi) * 1.18;
    const X = (f: number) => x0 + (x1 - x0) * f;
    const Y = (q: number) => yBot - ((yBot - yTop) * q) / qmax;
    const pI: [number, number] = [X(pk), Y(QI)];
    const pO: [number, number] = [X(to), Y(QO)];
    const tk = ticks(qmax);
    const tu = sec === 3600 ? 'h' : sec === 60 ? 'min' : 's';
    BH = yBot + 64;
    body = (
      <G opacity={on ? 1 : 0.4}>
        {tk.map((t) => (
          <G key={t}>
            <Line x1={x0} y1={Y(t)} x2={x1} y2={Y(t)} stroke={c.chartGrid} strokeWidth={1} />
            <ChartText
              x={x0 - 6}
              y={Y(t) + 4}
              fontSize={chart.label}
              textAnchor="end"
              fill={c.chartMuted}
            >
              {nf(t)}
            </ChartText>
          </G>
        ))}
        <Path
          d={`M ${x0} ${yTop - 8} V ${yBot} H ${x1 + 10}`}
          stroke={c.chartInk}
          strokeWidth={chart.strokeLight}
          fill="none"
        />
        <ChartText x={8} y={16} fontSize={chart.label} fontWeight="700">
          Q (m³/s)
        </ChartText>
        {/* The storage: inflow above outflow until they meet on the falling limb. */}
        <Path
          d={`M ${X(0)} ${Y(0)} L ${pI[0]} ${pI[1]} L ${pO[0]} ${pO[1]} Z`}
          fill={c.hydroStorage}
          opacity={0.75}
        />
        <Path
          d={`M ${X(0)} ${Y(0)} L ${pI[0]} ${pI[1]} L ${X(1)} ${Y(0)}`}
          stroke={c.hydroRunoff}
          strokeWidth={chart.strokeHeavy}
          fill="none"
          strokeLinejoin="round"
        />
        <Path
          d={`M ${X(0)} ${Y(0)} L ${pO[0]} ${pO[1]} L ${X(1)} ${Y(0)}`}
          stroke={c.chartInk}
          strokeWidth={chart.stroke}
          strokeDasharray={chart.dash}
          fill="none"
        />
        <Circle cx={pI[0]} cy={pI[1]} r={4.5} fill={c.hydroRunoff} />
        <Circle cx={pO[0]} cy={pO[1]} r={4.5} fill={c.chartInk} />
        <ChartText
          x={pI[0] - 8}
          y={pI[1] - 8}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="end"
          fill={c.hydroRunoff}
          halo
        >
          {lab(spec.Qin, 'Q_i', 'm³/s') ?? ''}
        </ChartText>
        <ChartText x={8} y={yBot + 54} fontSize={chart.label} fontWeight="700">
          {`Dashed: outflow, ${lab(spec.Qout, 'Q_o', 'm³/s') ?? ''}`}
        </ChartText>
        <ChartText
          x={(X(0) + pI[0] + pO[0]) / 3 + 4}
          y={(Y(0) + pI[1] + pO[1]) / 3 + 14}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="middle"
          halo
        >
          {lab(spec.V, 'V', 'm³') ?? `V = ${nf(V)} m³`}
        </ChartText>
        <ChartText
          x={X(0)}
          y={yBot + 16}
          fontSize={chart.label}
          textAnchor="middle"
          fill={c.chartMuted}
        >
          0
        </ChartText>
        <ChartText
          x={x1 + 10}
          y={yBot + 16}
          fontSize={chart.label}
          textAnchor="end"
          fontWeight="700"
        >
          {`${lab(spec.tb, 't_b', tu) ?? ''}`}
        </ChartText>
        <ChartText x={8} y={yBot + 36} fontSize={chart.label} fontWeight="700" fill={c.hydroRunoff}>
          {`Solid: inflow, ${lab(spec.Qin, 'Q_i', 'm³/s') ?? ''}`}
        </ChartText>
        <ChartText
          x={x1 + 10}
          y={yBot + 54}
          fontSize={chart.label}
          textAnchor="end"
          fill={c.chartMuted}
        >
          shaded: stored
        </ChartText>
      </G>
    );
    if (on && draggable(spec.Qout)) {
      const k = (yBot - yTop) / qmax;
      handle = {
        id: spec.Qout,
        x: pO[0],
        y: pO[1],
        to: (_dx, dy, q0) => Math.max(0.001, Math.min(QI * 0.99, q0 - dy / k)),
      };
    }
    const parts: string[] = [];
    if (on)
      parts.push(
        `The inflow triangle holds ½t_bQ_i and the outflow ½t_bQ_o; the shaded difference is stored: V = ½t_b(Q_i − Q_o) = ½ × ${nf(TB)} × ${sec} × (${nf(QI)} − ${nf(QO)}) = ${nf(V, 4)} m³.`,
      );
    else if (Qi !== undefined && Qo !== undefined && !(Qo < Qi))
      parts.push(
        'The outflow peak must be below the inflow peak, or nothing is stored (drawn faded).',
      );
    else parts.push('Type the two peaks and the base time to draw the hydrographs.');
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
