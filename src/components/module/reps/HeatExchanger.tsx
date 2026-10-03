/**
 * A double-pipe heat exchanger and its temperature profiles (HC40, `heatExchanger`; ME-P15,
 * ACC-P35). The exchanger is painted (steel shell, the hot fluid in the inner tube, the cold in
 * the shell, flow arrows by the arrangement); the chart under it is flat: both lines along the
 * length computed from the values (heatExchangerMath.ts), ΔT₁ and ΔT₂ bracketed at the ends, ΔT_lm
 * dashed where the local difference equals it, C_min named. A "?" draws nothing of its own.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { HeatExchangerSpec } from '@/data/modules/typesHe3h';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { arrowHead } from './graphKit';
import { makePlacer, poly } from './he2cKit';
import { Bracket, useHe3hReader } from './he3hKit';
import { sigText } from './he3hUnits';
import {
  endDiffs,
  lmtd as lmtdOf,
  lmtdPosition,
  profiles,
  tempsProblem,
  type Temps,
} from './heatExchangerMath';
import { Frame, ticks } from './phaseEnvelopeKit';
import { TopLight, url, usePaintIds } from './paint';

type Spec = HeatExchangerSpec;

export function HeatExchanger({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('shell', 'light');
  const R = useHe3hReader(calc);
  const { num, sym } = R;
  const arr = spec.arrangement;
  const counter = arr === 'counter';
  const hotName = spec.hotName ?? 'hot stream';
  const coldName = spec.coldName ?? 'cold stream';

  // The four temperatures; an `ntu` page's outlets are worked out from q, C_min and C_r.
  const Thi = num(spec.Thi);
  const Tci = num(spec.Tci);
  let Tho = num(spec.Tho);
  let Tco = num(spec.Tco);
  const q = num(spec.q, 'power');
  const Cmin = num(spec.Cmin, 'capacity');
  const Cr = num(spec.Cr);
  const worked: string[] = [];
  if (q !== undefined && Cmin !== undefined && Cr !== undefined && Cr > 0 && spec.minSide) {
    const dMin = q / Cmin;
    const dMax = dMin * Cr;
    const [dh, dc] = spec.minSide === 'hot' ? [dMin, dMax] : [dMax, dMin];
    if (Tho === undefined && spec.Tho === undefined && Thi !== undefined) {
      Tho = Thi - dh;
      worked.push(`T_ho = ${sigText(Tho, 3)}`);
    }
    if (Tco === undefined && spec.Tco === undefined && Tci !== undefined) {
      Tco = Tci + dc;
      worked.push(`T_co = ${sigText(Tco, 3)}`);
    }
  }
  const tUnit = R.unit(spec.Thi, '°C');
  const all = [Thi, Tho, Tci, Tco].every((x) => x !== undefined);
  const t: Temps | undefined = all ? { Thi: Thi!, Tho: Tho!, Tci: Tci!, Tco: Tco! } : undefined;
  const problem = t ? tempsProblem(arr, t) : undefined;
  const [d1, d2] = t ? endDiffs(arr, t) : [NaN, NaN];
  const lm = t && !problem ? lmtdOf(d1, d2) : NaN;
  const dropH = t ? t.Thi - t.Tho : NaN;
  const riseC = t ? t.Tco - t.Tci : NaN;
  // The stream whose temperature changes more carries the smaller capacity rate (q is shared).
  const minSide: 'hot' | 'cold' | undefined =
    spec.minSide ??
    (t && !problem && Math.abs(dropH - riseC) > 1e-9
      ? dropH > riseC
        ? 'hot'
        : 'cold'
      : undefined);

  const hotPaint =
    spec.hotFluid === 'water' ? c.water : spec.hotFluid === 'gas' ? c.fluidAir : c.fluidOil;
  const coldPaint =
    spec.coldFluid === 'air' ? c.fluidAir : spec.coldFluid === 'oil' ? c.fluidOil : c.water;

  const dLabel = (x: typeof spec.dT1, fallback: string, v: number) =>
    R.label(x, fallback, v, 'K') ?? `${fallback} = ?`;

  const art = (w: number, h: number) => {
    // ── The exchanger ──
    const xL = 44;
    const xR = w - 44;
    const sTop = 30;
    const sBot = 74;
    const tTop = 44;
    const tBot = 60;
    const nozL = xL + 22;
    const nozR = xR - 22;
    const nozBot = 92;
    const [coldInX, coldOutX] = counter ? [nozR, nozL] : [nozL, nozR];
    const hotLabelL = R.label(spec.Thi, 'T_hi') ?? `${sym(spec.Thi, 'T_hi')} = ?`;
    const hotLabelR =
      spec.Tho !== undefined
        ? (R.label(spec.Tho, 'T_ho') ?? `${sym(spec.Tho, 'T_ho')} = ?`)
        : Tho !== undefined
          ? `T_ho = ${sigText(Tho, 3)} ${tUnit}`
          : 'T_ho = ?';
    const coldIn = R.label(spec.Tci, 'T_ci') ?? `${sym(spec.Tci, 'T_ci')} = ?`;
    const coldOut =
      spec.Tco !== undefined
        ? (R.label(spec.Tco, 'T_co') ?? `${sym(spec.Tco, 'T_co')} = ?`)
        : Tco !== undefined
          ? `T_co = ${sigText(Tco, 3)} ${tUnit}`
          : 'T_co = ?';
    const [coldLeft, coldRight] = counter ? [coldOut, coldIn] : [coldIn, coldOut];

    const chevrons = (y: number, dir: 1 | -1, x0: number, x1: number, color: string) => {
      const out: ReactNode[] = [];
      for (let x = x0 + 26; x < x1 - 20; x += 46)
        out.push(
          <Path
            key={`${y}-${x}`}
            d={arrowHead(x + dir * 6, y, dir, 0, 7)}
            fill={color}
            opacity={0.9}
          />,
        );
      return out;
    };

    // ── The chart ──
    const l = 46;
    const r = w - 14;
    const top = 152;
    const b = h - 42;
    const lo = t ? Math.min(t.Tci, t.Tco, t.Tho) : 0;
    const hi = t ? Math.max(t.Thi, t.Tco) : 100;
    const pad = Math.max(1, (hi - lo) * 0.08);
    const ty = ticks(lo - pad, hi + pad, 5);
    const yMin = Math.floor((lo - pad) / ty.step) * ty.step;
    const yMax = Math.ceil((hi + pad) / ty.step) * ty.step;
    const sx = (x: number) => l + x * (r - l);
    const sy = (y: number) => b - ((y - yMin) / (yMax - yMin || 1)) * (b - top);
    const prof = t ? profiles(arr, t) : [];
    const fade = problem ? 0.35 : 1;
    const place = makePlacer(w, h);

    const parts: ReactNode[] = [];
    if (t) {
      const hot = prof.map((p) => [sx(p.x), sy(p.Th)] as [number, number]);
      const cold = prof.map((p) => [sx(p.x), sy(p.Tc)] as [number, number]);
      // The two lines block the labels placed below, so none sits across a line.
      for (const [x, y] of [...hot, ...cold]) place.dot(x, y, 3);
      parts.push(
        <G key="lines" opacity={fade}>
          <Path d={poly(hot)} stroke={c.physHot} strokeWidth={2.6} fill="none" />
          <Path
            d={poly(cold)}
            stroke={c.physCold}
            strokeWidth={2.6}
            fill="none"
            strokeDasharray="8 4"
          />
          {/* Flow direction on each line, a third of the way along. */}
          {[0.3, 0.7].map((f) => {
            const i = Math.round(f * (prof.length - 1));
            const [hx, hy] = hot[i]!;
            const [px, py] = hot[i - 1]!;
            const [cx, cy] = cold[i]!;
            const [qx, qy] = cold[i - 1]!;
            const cdir = counter ? -1 : 1;
            return (
              <G key={f}>
                <Path d={arrowHead(hx, hy, hx - px, hy - py, 9)} fill={c.physHot} />
                <Path
                  d={arrowHead(cx, cy, (cx - qx) * cdir, (cy - qy) * cdir, 9)}
                  fill={c.physCold}
                />
              </G>
            );
          })}
        </G>,
      );
      // ΔT₁ and ΔT₂ at the ends, ΔT_lm where the local difference equals it.
      const x1 = sx(0) + 12;
      const x2 = sx(1) - 12;
      const yH1 = sy(prof[0]!.Th);
      const yC1 = sy(prof[0]!.Tc);
      const yH2 = sy(prof[prof.length - 1]!.Th);
      const yC2 = sy(prof[prof.length - 1]!.Tc);
      parts.push(
        <G key="br" opacity={fade}>
          <Bracket x1={x1} y1={yH1 + 3} x2={x1} y2={yC1 - 3} color={c.chartInk} />
          <Bracket x1={x2} y1={yH2 + 3} x2={x2} y2={yC2 - 3} color={c.chartInk} />
        </G>,
      );
      const t1 = dLabel(spec.dT1, 'ΔT₁', d1);
      const t2 = dLabel(spec.dT2, 'ΔT₂', d2);
      const p1 = place.place(x1, (yH1 + yC1) / 2 + 4, t1, chart.label, [
        [6, 0, 'start'],
        [6, -10, 'start'],
        [6, 12, 'start'],
      ]);
      const p2 = place.place(x2, (yH2 + yC2) / 2 + 4, t2, chart.label, [
        [-6, 0, 'end'],
        [-6, -10, 'end'],
        [-6, 12, 'end'],
      ]);
      parts.push(
        <ChartText key="t1" {...p1} fontSize={chart.label} fontWeight="700" halo opacity={fade}>
          {t1}
        </ChartText>,
        <ChartText key="t2" {...p2} fontSize={chart.label} fontWeight="700" halo opacity={fade}>
          {t2}
        </ChartText>,
      );
      if (!problem && Number.isFinite(lm)) {
        const xs = lmtdPosition(d1, d2);
        const i = xs * (prof.length - 1);
        const k = Math.min(prof.length - 2, Math.floor(i));
        const f = i - k;
        const lerp = (a: number, b2: number) => a + (b2 - a) * f;
        const Th = lerp(prof[k]!.Th, prof[k + 1]!.Th);
        const Tc = lerp(prof[k]!.Tc, prof[k + 1]!.Tc);
        const xm = sx(xs);
        const tl = R.label(spec.lmtd, 'ΔT_lm', lm, 'K') ?? 'ΔT_lm = ?';
        const pm = place.place(xm, (sy(Th) + sy(Tc)) / 2 + 4, tl, chart.label, [
          [6, 0, 'start'],
          [-6, 0, 'end'],
          [6, -12, 'start'],
          [-6, -12, 'end'],
          [6, 14, 'start'],
          [-6, 14, 'end'],
        ]);
        parts.push(
          <G key="lm">
            <Bracket
              x1={xm}
              y1={sy(Th) + 3}
              x2={xm}
              y2={sy(Tc) - 3}
              color={c.chartHighlight}
              dashed
            />
            <ChartText {...pm} fontSize={chart.label} fontWeight="700" fill={c.chartHighlight} halo>
              {tl}
            </ChartText>
          </G>,
        );
      }
      // The lines' names, above the hot line and under the cold, a little in from the ends.
      const iName = Math.round(0.5 * (prof.length - 1));
      const nh = `${cap(hotName)}${minSide === 'hot' ? ' (C_min)' : ''}`;
      const nc = `${cap(coldName)}${minSide === 'cold' ? ' (C_min)' : ''}`;
      const ph = place.place(sx(prof[iName]!.x), sy(prof[iName]!.Th) - 8, nh, chart.label, [
        [0, -2, 'middle'],
        [0, -14, 'middle'],
        [30, -4, 'middle'],
        [-30, -4, 'middle'],
      ]);
      const pc = place.place(sx(prof[iName]!.x), sy(prof[iName]!.Tc) + 18, nc, chart.label, [
        [0, 0, 'middle'],
        [0, 12, 'middle'],
        [30, 2, 'middle'],
        [-30, 2, 'middle'],
      ]);
      parts.push(
        <ChartText key="nh" {...ph} fontSize={chart.label} fill={c.physHot} fontWeight="700" halo>
          {nh}
        </ChartText>,
        <ChartText key="nc" {...pc} fontSize={chart.label} fill={c.physCold} fontWeight="700" halo>
          {nc}
        </ChartText>,
      );
    }

    return (
      <Svg width={w} height={h}>
        <Defs>
          <LinearGradient id={ids.shell} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={c.shine} stopOpacity={0.55 * c.sheen} />
            <Stop offset="0.3" stopColor={c.metal} stopOpacity={1} />
            <Stop offset="0.8" stopColor={c.metal} stopOpacity={1} />
            <Stop offset="1" stopColor={c.metalDark} stopOpacity={1} />
          </LinearGradient>
          <TopLight id={ids.light} />
        </Defs>
        {/* Cold nozzles, then the shell (steel wall, the cold fluid inside), then the inner tube. */}
        {[nozL, nozR].map((x) => (
          <G key={x}>
            <Rect
              x={x - 8}
              y={sBot - 2}
              width={16}
              height={nozBot - sBot + 2}
              fill={url(ids.shell)}
            />
            <Rect x={x - 5} y={sBot - 2} width={10} height={nozBot - sBot + 2} fill={coldPaint} />
          </G>
        ))}
        <Rect x={xL} y={sTop} width={xR - xL} height={sBot - sTop} rx={5} fill={url(ids.shell)} />
        <Rect
          x={xL + 3}
          y={sTop + 4}
          width={xR - xL - 6}
          height={sBot - sTop - 8}
          rx={3}
          fill={coldPaint}
        />
        <Rect
          x={xL + 3}
          y={sTop + 4}
          width={xR - xL - 6}
          height={sBot - sTop - 8}
          fill={url(ids.light)}
        />
        <Rect x={6} y={tTop - 3} width={w - 12} height={tBot - tTop + 6} fill={url(ids.shell)} />
        <Rect x={6} y={tTop} width={w - 12} height={tBot - tTop} fill={hotPaint} />
        <Rect x={6} y={tTop} width={w - 12} height={tBot - tTop} fill={url(ids.light)} />
        {chevrons((tTop + tBot) / 2, 1, 6, w - 6, c.fluidMark)}
        {chevrons((sTop + 4 + tTop - 3) / 2, counter ? -1 : 1, xL, xR, c.fluidMark)}
        {chevrons((tBot + 3 + sBot - 4) / 2, counter ? -1 : 1, xL, xR, c.fluidMark)}
        {/* Cold in (an arrow up into the shell) and out (down). */}
        <Path d={arrowHead(coldInX, sBot + 4, 0, -1, 9)} fill={c.physCold} />
        <Path d={arrowHead(coldOutX, nozBot + 10, 0, 1, 9)} fill={c.physCold} />
        <Path d={arrowHead(w - 2, (tTop + tBot) / 2, 1, 0, 8)} fill={c.physHot} />
        <ChartText x={4} y={20} fontSize={chart.label} fontWeight="700" fill={c.physHot}>
          {hotLabelL}
        </ChartText>
        <ChartText
          x={w - 4}
          y={20}
          textAnchor="end"
          fontSize={chart.label}
          fontWeight="700"
          fill={c.physHot}
        >
          {hotLabelR}
        </ChartText>
        <ChartText x={4} y={nozBot + 26} fontSize={chart.label} fontWeight="700" fill={c.physCold}>
          {coldLeft}
        </ChartText>
        <ChartText
          x={w - 4}
          y={nozBot + 26}
          textAnchor="end"
          fontSize={chart.label}
          fontWeight="700"
          fill={c.physCold}
        >
          {coldRight}
        </ChartText>
        <Frame
          c={c}
          l={l}
          r={r}
          t={top}
          b={b}
          xs={[0, 0.25, 0.5, 0.75, 1]}
          ys={ticks(yMin, yMax, 5).out}
          sx={sx}
          sy={sy}
          xName="Position along the exchanger, x ÷ L"
          yName={`T (${tUnit})`}
        />
        {parts}
      </Svg>
    );
  };

  // ── The caption ──
  const lines: string[] = [];
  const name = counter ? 'Counterflow' : 'Parallel flow';
  if (!t) lines.push(`${name}: type the four temperatures to draw the two lines.`);
  else if (problem) lines.push(`${name}: these temperatures can’t work, since ${problem}.`);
  else {
    const s1 = counter ? 'T_hi − T_co' : 'T_hi − T_ci';
    const s2 = counter ? 'T_ho − T_ci' : 'T_ho − T_co';
    lines.push(`${name}: ΔT₁ = ${s1} = ${sigText(d1, 3)} K and ΔT₂ = ${s2} = ${sigText(d2, 3)} K.`);
    lines.push(`ΔT_lm = (ΔT₁ − ΔT₂) ÷ ln(ΔT₁ ÷ ΔT₂) = ${sigText(lm, 4)} K, at the dashed bracket.`);
    if (minSide) {
      const [n1, d] = minSide === 'hot' ? [hotName, dropH] : [coldName, riseC];
      const [n2, e] = minSide === 'hot' ? [coldName, riseC] : [hotName, dropH];
      lines.push(
        `C_min is the ${n1}’s: it changes ${sigText(d, 3)} K for the ${n2}’s ${sigText(e, 3)} K on the same heat.`,
      );
    }
    if (!counter && t.Tco <= t.Tho)
      lines.push('In parallel flow the cold outlet stays below the hot outlet.');
    if (counter && t.Tco > t.Tho)
      lines.push('In counterflow the cold outlet can pass the hot outlet, as here.');
  }
  if (worked.length) lines.push(`Outlets from q ÷ C_min and C_r: ${worked.join(', ')} ${tUnit}.`);
  const eff = num(spec.eff);
  if (eff !== undefined && t && !problem)
    lines.push(
      `ε = q ÷ q_max = ${sigText(eff, 3)}: the C_min stream changes ${sigText(eff, 3)} × (T_hi − T_ci) = ${sigText(eff * (t.Thi - t.Tci), 3)} K of the ${sigText(t.Thi - t.Tci, 3)} K it could.`,
    );
  for (const x of [spec.q, spec.U, spec.A, spec.ntu]) {
    const lab = typeof x === 'string' ? R.label(x, '') : undefined;
    if (lab) lines.push(lab);
  }
  for (const id of spec.more ?? []) {
    const lab = R.label(id, '');
    if (lab) lines.push(lab);
  }

  return (
    <View>
      <Canvas aspect={(w) => 360 / w}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
