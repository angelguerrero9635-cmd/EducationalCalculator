/**
 * HC30 `duct` (DuctSpec in typesHe2h.ts): a stream tube or a converging–diverging nozzle drawn to
 * scale by A ÷ A∗ from the area–Mach relation, the reservoir (or a rocket chamber) at rest, the
 * throat, stations with M, p and T, a normal shock, and p ÷ p₀ and M along the axis; or a
 * turbojet outline with V₀ in and V_e out. Walls and the engine are painted steel; the gas,
 * arrows and the axis chart stay flat.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { DuctSpec } from '@/data/modules/typesHe2h';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, niceCeil, useRep } from './common';
import {
  areaRatio,
  contourAt,
  ductArea,
  ductShape,
  jetThrust,
  machFromArea,
  normalShock,
  nozzleState,
  pRatio,
  propulsiveEfficiency,
  throatHalf,
  tRatio,
  type DuctShape,
} from './aeroMath';
import { Arrow, LH, r4, useValueLabel } from './he1fKit';
import { Deepen, Sheen, url, usePaintIds } from './paint';

const BW = 356;
const WALL = 7;

/** Ducts, nozzles and a turbojet (DuctSpec). */
export function Duct({ spec, calc }: { spec: DuctSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const paint = usePaintIds('steel', 'sheen', 'hot');
  const valueLabel = useValueLabel(calc);
  const get = (x: NumOrVar | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  const lab = (x: NumOrVar | undefined, name: string) =>
    x === undefined ? undefined : typeof x === 'string' ? valueLabel(x) : `${name} = ${r4(x)}`;
  const g = get(spec.gamma) ?? 1.4;
  const okGamma = g > 1;
  const moreLines = (spec.more ?? []).map((id) => valueLabel(id)).filter((t): t is string => !!t);
  const mode = spec.mode ?? 'station';

  let body: ReactNode = null;
  let BH = 200;
  let caption = '';

  if (mode === 'engine') {
    // ── A turbojet: V₀ in, V_e out, to one scale ──
    const [m, V0, Ve] = [get(spec.mdot), get(spec.V0), get(spec.Ve)];
    const cy = 92;
    const [ex0, ex1] = [110, 270];
    const big = Math.max(V0 ?? 0, Ve ?? 0);
    const sc =
      big > 0 ? Math.min(96 / Math.max(V0 ?? 1e-9, 1e-9), 76 / Math.max(Ve ?? 1e-9, 1e-9)) : 0;
    const cowl = `M ${ex0} ${cy - 30} C ${ex0 + 6} ${cy - 37} ${ex0 + 20} ${cy - 38} ${ex0 + 34} ${cy - 38} L ${ex1 - 30} ${cy - 38} L ${ex1} ${cy - 24} L ${ex1} ${cy - 18} L ${ex1 - 32} ${cy - 30} L ${ex0 + 34} ${cy - 30} Z`;
    const mirror = (d: string) =>
      d.replace(
        /(-?[\d.]+) (-?[\d.]+)/g,
        (_m, x: string, y: string) => `${x} ${2 * cy - Number(y)}`,
      );
    const blades = (x0: number, n: number, dx: number, h0: number, h1: number) =>
      Array.from({ length: n }, (_, k) => {
        const h = h0 + ((h1 - h0) * k) / Math.max(1, n - 1);
        return (
          <Line
            key={`${x0}-${k}`}
            x1={x0 + k * dx}
            x2={x0 + k * dx}
            y1={cy - h}
            y2={cy + h}
            stroke={c.metalDark}
            strokeWidth={2.2}
          />
        );
      });
    const fuelLab = lab(spec.fuel, 'ṁ_f');
    body = (
      <G>
        {/* The core: gas, the spinner, compressor, burner, turbine and the exhaust cone. */}
        <Rect x={ex0 + 2} y={cy - 30} width={ex1 - ex0 - 4} height={60} fill={c.aeroGas} />
        <Path
          d={`M ${ex0 + 4} ${cy} Q ${ex0 + 14} ${cy - 13} ${ex0 + 30} ${cy - 13} L ${ex0 + 30} ${cy + 13} Q ${ex0 + 14} ${cy + 13} ${ex0 + 4} ${cy} Z`}
          fill={url(paint.steel)}
          stroke={c.metalDark}
        />
        {blades(ex0 + 36, 7, 7, 27, 17)}
        <Rect x={ex0 + 86} y={cy - 17} width={34} height={34} rx={6} fill={url(paint.hot)} />
        {blades(ex0 + 126, 3, 8, 19, 24)}
        <Path
          d={`M ${ex0 + 146} ${cy - 13} L ${ex1 - 6} ${cy - 3} L ${ex1 - 6} ${cy + 3} L ${ex0 + 146} ${cy + 13} Z`}
          fill={url(paint.steel)}
          stroke={c.metalDark}
        />
        <Rect x={ex0 + 30} y={cy - 4} width={116} height={8} fill={url(paint.steel)} />
        {/* The cowling, top and bottom. */}
        {[cowl, mirror(cowl)].map((d) => (
          <G key={d}>
            <Path d={d} fill={url(paint.steel)} stroke={c.metalDark} strokeWidth={1.1} />
            <Path d={d} fill={url(paint.sheen)} />
          </G>
        ))}
        {/* V₀ in, V_e out, one scale. */}
        {V0 !== undefined && V0 > 0 && (
          <Arrow x1={ex0 - 6 - sc * V0} y1={cy} x2={ex0 - 6} y2={cy} color={c.aeroWind} width={3} />
        )}
        {Ve !== undefined && Ve > 0 && (
          <Arrow x1={ex1 + 6} y1={cy} x2={ex1 + 6 + sc * Ve} y2={cy} color={c.aeroHot} width={3} />
        )}
        <ChartText x={8} y={cy + 52} fontSize={chart.label} fill={c.aeroWind}>
          {lab(spec.V0, 'V₀') ?? ''}
        </ChartText>
        <ChartText x={BW - 4} y={cy + 52} fontSize={chart.label} textAnchor="end" fill={c.aeroHot}>
          {lab(spec.Ve, 'V_e') ?? ''}
        </ChartText>
        {/* Fuel into the burner; thrust forward. */}
        {fuelLab && (
          <G>
            <Arrow
              x1={ex0 + 103}
              y1={cy - 64}
              x2={ex0 + 103}
              y2={cy - 20}
              color={c.aeroHot}
              width={1.8}
            />
            <ChartText x={ex0 + 109} y={cy - 56} fontSize={chart.label} fill={c.aeroHot} halo>
              {fuelLab}
            </ChartText>
          </G>
        )}
        {spec.thrust !== undefined && (
          <G>
            <Arrow
              x1={ex0 + 80}
              y1={cy - 48}
              x2={ex0 + 10}
              y2={cy - 48}
              color={c.aeroLift}
              width={3}
            />
            <ChartText
              x={ex0 + 4}
              y={cy - 44}
              fontSize={chart.label}
              fontWeight="bold"
              textAnchor="end"
              fill={c.aeroLift}
              halo
            >
              {lab(spec.thrust, 'F') ?? 'F'}
            </ChartText>
          </G>
        )}
        {lab(spec.mdot, 'ṁ') && (
          <ChartText x={8} y={cy - 64} fontSize={chart.label}>
            {lab(spec.mdot, 'ṁ')!}
          </ChartText>
        )}
      </G>
    );
    BH = cy + 64;
    const parts: string[] = [];
    if (m !== undefined && V0 !== undefined && Ve !== undefined) {
      parts.push(
        `F = ṁ(Vₑ − V₀) = ${r4(m)} × (${r4(Ve)} − ${r4(V0)}) = ${r4(jetThrust(m, V0, Ve))} N.`,
      );
    }
    if (V0 !== undefined && Ve !== undefined && V0 > 0)
      parts.push(
        `The arrows share one scale. ηₚ = 2 ÷ (1 + ${r4(Ve)} ÷ ${r4(V0)}) = ${r4(100 * propulsiveEfficiency(V0, Ve))}%.`,
      );
    else parts.push('Type V₀ and Vₑ to draw the arrows to one scale.');
    caption = parts.join(' ');
  } else {
    // ── A station or a nozzle, to scale by A ÷ A∗ ──
    const M = get(spec.M);
    const A0 = get(spec.areaRatio);
    const Me = get(spec.Me);
    const pr = get(spec.pressureRatio);
    const shockAt = get(spec.shockAt);
    const parts: string[] = [];
    let shape: DuctShape | undefined;
    let nominal = false;
    let faded = '';
    if (!okGamma) faded = 'γ must be more than 1.';
    else if (mode === 'station') {
      if (spec.choked || M === 1) shape = ductShape(1, 'sonic');
      else if (M !== undefined && M > 0)
        shape = ductShape(areaRatio(M, g), M > 1 ? 'super' : 'sub');
      else if (A0 !== undefined && A0 >= 1) shape = ductShape(A0, spec.branch ?? 'super');
      else if (A0 !== undefined)
        faded = 'A ÷ A∗ below 1: no flow fits a duct narrower than its sonic throat.';
    } else {
      let Ae = A0;
      if (Ae === undefined && Me !== undefined && Me >= 1 && shockAt === undefined)
        Ae = areaRatio(Me, g);
      if (Ae === undefined && pr !== undefined && pr > 0 && pr < 1) {
        const Mx = Math.sqrt((pr ** (-(g - 1) / g) - 1) * (2 / (g - 1)));
        Ae = Mx >= 1 ? areaRatio(Mx, g) : undefined;
      }
      if (Ae === undefined) {
        Ae = 2.5;
        nominal = true;
      }
      if (Ae < 1) faded = 'An exit narrower than the throat: the flow can’t pass M = 1 there.';
      else
        shape = { inlet: spec.chamber ? 2.2 : 3, exit: Ae, throat: 0.38, form: 'cd', station: 1 };
    }
    const fallback: DuctShape = { inlet: 3, exit: 2, throat: 0.38, form: 'cd', station: 1 };
    const sh = shape ?? fallback;
    const side = (s: number): 'sub' | 'super' => (s < sh.throat ? 'sub' : 'super');
    // Labels over the duct: the reservoir's on the left, the station's or the exit's on the right.
    const left = [lab(spec.p0, 'p₀'), lab(spec.T0, 'T₀')].filter((t): t is string => !!t);
    const right = (
      mode === 'station'
        ? [lab(spec.M, 'M'), lab(spec.T, 'T'), lab(spec.p, 'p'), lab(spec.areaRatio, 'A ÷ A∗')]
        : [lab(spec.Me, 'M_e'), lab(spec.pe, 'p_e'), lab(spec.Te, 'T_e'), lab(spec.exhaust, 'v_e')]
    ).filter((t): t is string => !!t);
    const nTop = Math.max(left.length, right.length, 1);
    const maxHalf = 44;
    const top = 8 + nTop * LH + 8;
    const cy = top + WALL + maxHalf + 4;
    const hs = throatHalf(sh, maxHalf);
    const x0 = 70;
    const x1 = 326;
    const X = (s: number) => x0 + s * (x1 - x0);
    const solidEnd = sh.form === 'converging' ? sh.station : 1;
    const N = 60;
    const pts = (from: number, to: number, sign: number, off = 0) =>
      Array.from({ length: N + 1 }, (_, k) => {
        const s = from + ((to - from) * k) / N;
        return [X(s), cy + sign * (hs * Math.sqrt(ductArea(sh, s)) + off)] as const;
      });
    const poly = (a: readonly (readonly [number, number])[]) =>
      a.map(([x, y], k) => `${k ? 'L' : 'M'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
    const wall = (sign: number) => {
      const inner = pts(0, solidEnd, sign);
      const outer = pts(0, solidEnd, sign, WALL).reverse();
      return `${poly(inner)} ${outer.map(([x, y]) => `L ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')} Z`;
    };
    const gas = `${poly(pts(0, solidEnd, -1))} ${pts(0, solidEnd, 1)
      .reverse()
      .map(([x, y]) => `L ${x.toFixed(2)} ${y.toFixed(2)}`)
      .join(' ')} Z`;
    const dashed = sh.form === 'converging' && sh.station < 1;
    const sx = X(sh.station);
    const sHalf = hs * Math.sqrt(ductArea(sh, sh.station));
    const tx = X(sh.throat);
    const shockS =
      mode === 'nozzle' && shape && shockAt !== undefined && shockAt > 1 && shockAt < sh.exit
        ? contourAt(shockAt, sh.inlet, sh.exit, sh.throat, 'super')
        : undefined;
    const bottom = cy + maxHalf + WALL + 4;
    // Rows under the duct: the throat, then the exit, then the shock.
    const throatText =
      spec.throatArea !== undefined
        ? [lab(spec.throatArea, 'A∗'), lab(spec.mdot, 'ṁ')].filter(Boolean).join(' · ')
        : 'throat, M = 1';
    const exitText =
      mode === 'nozzle' && lab(spec.areaRatio, 'A_e ÷ A_t')
        ? lab(spec.areaRatio, 'A_e ÷ A_t')!
        : '';
    const shockText =
      shockS !== undefined
        ? `shock: ${[lab(spec.shockM1, 'M₁'), lab(spec.shockM2, 'M₂')].filter(Boolean).join(' → ')}`
        : '';
    const rowY = (k: number) => bottom + 12 + k * LH;
    const throatAnchor = tx > x1 - 60 ? 'end' : tx < x0 + 60 ? 'start' : 'middle';
    const throatX = throatAnchor === 'end' ? x1 + WALL : tx;
    const nRows =
      1 + (exitText ? 1 : 0) + (shockText ? 1 : 0) + (spec.thrust !== undefined ? 1 : 0);
    let chartTop = rowY(nRows - 1) + 16;
    // p ÷ p₀ and M along the axis (nozzle, choked, shock-free unless shockAt).
    let axisChart: ReactNode = null;
    if (mode === 'nozzle' && spec.axis && shape) {
      const ch = 90;
      const samples = Array.from({ length: 81 }, (_, k) => {
        const s = k / 80;
        const st = nozzleState(
          ductArea(sh, s),
          side(s),
          g,
          shockS !== undefined ? shockAt : undefined,
        );
        return { s, st };
      });
      const Mmax = Math.max(1, ...samples.map((q) => q.st?.M ?? 0));
      const Mtop = niceCeil(Mmax);
      const ty = (f: number) => chartTop + ch - f * ch;
      const line = (f: (q: (typeof samples)[0]) => number | undefined) => {
        let d = '';
        let pen = false;
        for (const q of samples) {
          const y = f(q);
          if (y === undefined) {
            pen = false;
            continue;
          }
          d += `${pen ? 'L' : 'M'} ${X(q.s).toFixed(1)} ${ty(y).toFixed(1)} `;
          pen = true;
        }
        return d;
      };
      axisChart = (
        <G>
          <Line x1={x0} x2={x1} y1={ty(0)} y2={ty(0)} stroke={c.chartInk} />
          <Line x1={x0} x2={x0} y1={ty(0)} y2={ty(1)} stroke={c.chartInk} />
          <Line x1={x1} x2={x1} y1={ty(0)} y2={ty(1)} stroke={c.chartInk} />
          <Line
            x1={tx}
            x2={tx}
            y1={ty(0)}
            y2={ty(1)}
            stroke={c.chartGrid}
            strokeDasharray={chart.dashFine}
          />
          <Line
            x1={x0}
            x2={x1}
            y1={ty(1 / Mtop)}
            y2={ty(1 / Mtop)}
            stroke={c.chartGrid}
            strokeDasharray={chart.dashFine}
          />
          <Path d={line((q) => q.st?.p)} stroke={c.aeroLift} strokeWidth={2} fill="none" />
          <Path
            d={line((q) => (q.st ? q.st.M / Mtop : undefined))}
            stroke={c.aeroDrag}
            strokeWidth={2}
            strokeDasharray={chart.dash}
            fill="none"
          />
          <ChartText
            x={x0 - 4}
            y={ty(1) + 4}
            fontSize={chart.label}
            textAnchor="end"
            fill={c.aeroLift}
          >
            1
          </ChartText>
          <ChartText x={x0 - 4} y={ty(0) + 4} fontSize={chart.label} textAnchor="end">
            0
          </ChartText>
          <ChartText
            x={x0 - 6}
            y={ty(0.5) + 4}
            fontSize={chart.label}
            textAnchor="end"
            fill={c.aeroLift}
          >
            p ÷ p₀
          </ChartText>
          <ChartText x={x1 + 4} y={ty(1) + 4} fontSize={chart.label} fill={c.aeroDrag}>
            {r4(Mtop)}
          </ChartText>
          <ChartText x={x1 + 4} y={ty(1 / Mtop) + 4} fontSize={chart.label} fill={c.aeroDrag}>
            1
          </ChartText>
          <ChartText x={x1 + 4} y={ty(0.5 / Mtop) + 8} fontSize={chart.label} fill={c.aeroDrag}>
            M
          </ChartText>
          <ChartText
            x={(x0 + x1) / 2}
            y={ty(0) + 15}
            fontSize={chart.label}
            textAnchor="middle"
            fill={c.chartMuted}
          >
            along the axis (dashed M, solid p ÷ p₀)
          </ChartText>
        </G>
      );
      chartTop += ch + 28;
    }
    const chamber = mode === 'nozzle' && !!spec.chamber;
    body = (
      <G opacity={shape ? 1 : 0.35}>
        {/* The reservoir (or the chamber), its gas at rest. */}
        <Rect
          x={10}
          y={cy - maxHalf - WALL}
          width={x0 - 10 + 2}
          height={2 * (maxHalf + WALL)}
          rx={chamber ? 14 : 4}
          fill={url(paint.steel)}
          stroke={c.metalDark}
        />
        <Rect
          x={10 + WALL}
          y={cy - maxHalf}
          width={x0 - 10 - WALL + 4}
          height={2 * maxHalf}
          rx={chamber ? 10 : 2}
          fill={chamber ? url(paint.hot) : c.aeroGas}
        />
        {/* The reservoir's name inside it; the chamber's under it (its rounded hot box is
            narrower than the word). */}
        <ChartText
          x={(10 + x0) / 2}
          y={chamber ? cy + maxHalf + WALL + 15 : cy + 4}
          fontSize={chart.label}
          textAnchor="middle"
          halo
        >
          {chamber ? 'chamber' : 'at rest'}
        </ChartText>
        {/* The gas and the steel walls. */}
        <Path d={gas} fill={c.aeroGas} />
        {[-1, 1].map((sg) => (
          <G key={sg}>
            <Path d={wall(sg)} fill={url(paint.steel)} stroke={c.metalDark} strokeWidth={1} />
            <Path d={wall(sg)} fill={url(paint.sheen)} />
          </G>
        ))}
        {/* The throat a subsonic station would need, dashed beyond it. */}
        {dashed &&
          [-1, 1].map((sg) => (
            <Path
              key={sg}
              d={poly(pts(sh.station, 1, sg))}
              stroke={c.chartMuted}
              strokeDasharray={chart.dash}
              fill="none"
            />
          ))}
        {/* The throat: M = 1, lit when choked. */}
        <Line
          x1={tx}
          x2={tx}
          y1={cy - hs}
          y2={cy + hs}
          stroke={spec.choked ? c.chartHighlight : c.chartMuted}
          strokeWidth={spec.choked ? 3 : 1.2}
          strokeDasharray={dashed ? chart.dashFine : undefined}
        />
        {/* The flow. */}
        <Arrow x1={x0 + 6} y1={cy} x2={x0 + 40} y2={cy} color={c.aeroWind} width={2} />
        {/* The station. */}
        {mode === 'station' && (
          <Line
            x1={sx}
            x2={sx}
            y1={cy - sHalf - WALL - 4}
            y2={cy + sHalf + WALL + 4}
            stroke={c.chartHighlight}
            strokeWidth={1.6}
            strokeDasharray={chart.dash}
          />
        )}
        {/* A normal shock. */}
        {shockS !== undefined && (
          <Line
            x1={X(shockS)}
            x2={X(shockS)}
            y1={cy - hs * Math.sqrt(shockAt!)}
            y2={cy + hs * Math.sqrt(shockAt!)}
            stroke={c.aeroShock}
            strokeWidth={3}
          />
        )}
        {/* The exhaust leaving the exit. */}
        {spec.exhaust !== undefined && mode === 'nozzle' && (
          <Arrow x1={x1 + WALL + 2} y1={cy} x2={BW - 4} y2={cy} color={c.aeroHot} width={3} />
        )}
        {/* Labels over the duct. */}
        {left.map((t, k) => (
          <ChartText key={t} x={8} y={8 + (k + 1) * LH} fontSize={chart.label}>
            {t}
          </ChartText>
        ))}
        {right.map((t, k) => (
          <ChartText
            key={t}
            x={BW - 4}
            y={8 + (k + 1) * LH}
            fontSize={chart.label}
            textAnchor="end"
            fill={c.chartHighlight}
            fontWeight={k === 0 ? 'bold' : undefined}
          >
            {t}
          </ChartText>
        ))}
        {/* Rows under it. */}
        <ChartText
          x={throatX}
          y={rowY(0)}
          fontSize={chart.label}
          textAnchor={throatAnchor}
          fill={spec.choked ? c.chartHighlight : c.chartMuted}
        >
          {dashed ? 'A∗ (M = 1) would be here' : throatText}
        </ChartText>
        {exitText && (
          <ChartText x={x1 + WALL} y={rowY(1)} fontSize={chart.label} textAnchor="end">
            {exitText}
          </ChartText>
        )}
        {shockText && (
          <ChartText
            x={Math.min(x1, Math.max(x0 + 60, X(shockS!)))}
            y={rowY(exitText ? 2 : 1)}
            fontSize={chart.label}
            textAnchor="middle"
            fill={c.aeroShock}
          >
            {shockText}
          </ChartText>
        )}
        {spec.thrust !== undefined && (
          <G>
            <Arrow
              x1={60}
              y1={rowY(nRows - 1) - 4}
              x2={10}
              y2={rowY(nRows - 1) - 4}
              color={c.aeroLift}
              width={3}
            />
            <ChartText
              x={66}
              y={rowY(nRows - 1)}
              fontSize={chart.label}
              fontWeight="bold"
              fill={c.aeroLift}
            >
              {lab(spec.thrust, 'F') ?? 'F'}
            </ChartText>
          </G>
        )}
        {axisChart}
      </G>
    );
    BH = chartTop - 4;
    // The caption.
    if (faded) parts.push(faded);
    else if (mode === 'station') {
      if (spec.choked || M === 1) {
        parts.push(
          'The duct ends at its throat, where M = 1: the flow is choked, and lowering the back pressure adds no flow.',
        );
      } else if (M !== undefined && M > 0) {
        const t = tRatio(M, g);
        parts.push(
          `T₀ ÷ T = 1 + ${r4((g - 1) / 2)} × ${r4(M)}² = ${r4(t)}; p₀ ÷ p = ${r4(pRatio(M, g))}.`,
        );
        parts.push(
          M > 1
            ? `Drawn to scale: A ÷ A∗ = ${r4(areaRatio(M, g))}, so the duct has passed a throat and widens again.`
            : `Subsonic: A ÷ A∗ = ${r4(areaRatio(M, g))}; the duct would have to narrow to A∗ to reach M = 1.`,
        );
      } else if (A0 !== undefined && A0 >= 1) {
        const other = machFromArea(A0, g, spec.branch === 'sub' ? 'super' : 'sub');
        parts.push(
          `Drawn to scale for A ÷ A∗ = ${r4(A0)}.${other !== undefined ? ` The other branch has M = ${r4(other)}.` : ''}`,
        );
      } else parts.push('Type M or A ÷ A∗ to draw the duct.');
    } else if (nominal) {
      parts.push('Shape drawn for a nominal exit, not to scale: type Aₑ ÷ Aₜ to draw it to scale.');
    } else {
      parts.push(
        `To scale: exit width ÷ throat width = √${r4(sh.exit)} = ${r4(Math.sqrt(sh.exit))}. Subsonic before the throat, M = 1 at it, supersonic after.`,
      );
      if (shockS !== undefined) {
        const M1 = machFromArea(shockAt!, g, 'super')!;
        const ns = normalShock(M1, g);
        parts.push(
          `A normal shock at A ÷ Aₜ = ${r4(shockAt!)}: M ${r4(M1)} → ${r4(ns.M2)}, p₀ falls to ${r4(ns.p0)} of p₀₁; subsonic from there to the exit.`,
        );
      }
    }
    caption = parts.join(' ');
  }

  const rowTop = BH;
  if (moreLines.length) BH += moreLines.length * LH + 6;

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <Deepen id={paint.steel} from={c.metal} to={c.metalDark} />
              <Sheen id={paint.sheen} vertical />
              <Deepen id={paint.hot} from={c.cvFlameCore} to={c.aeroHot} />
            </Defs>
            <G transform={`scale(${w / BW})`}>
              {body}
              {moreLines.map((t, k) => (
                <ChartText key={t} x={8} y={rowTop + 6 + k * LH} fontSize={chart.label}>
                  {t}
                </ChartText>
              ))}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}
