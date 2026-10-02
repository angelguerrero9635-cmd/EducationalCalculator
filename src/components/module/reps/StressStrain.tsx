/**
 * HC28 `stressStrain` (StressStrainSpec in typesHe2j.ts): the engineering σ–ε curve built from
 * the page's E, σ_Y, UTS and ε_f (the 0.2% offset, necking, fracture), the true curve dashed, the
 * resilience or toughness shaded, an elastic–perfectly plastic or tissue curve, the page's point;
 * the test piece in grips beside it; or, as pictures of their own, a tube's section in bending
 * and two members sharing one load. Charts flat; the steel, bone and tendon painted.
 */
import { useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { StressStrainSpec } from '@/data/modules/typesHe2j';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Arrow, Dimension, fmt, Hatch, HeLabel } from './beamKit';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import { useValueLabel } from './he1fKit';
import { Sheen, TopLight, url, usePaintIds } from './paint';
import {
  areaUnder,
  engineeringCurve,
  OFFSET,
  resilience,
  shareOf,
  stretchFactor,
  tickStep,
  toBase,
  trueCurve,
  tubeI,
  type Curve,
  type Pt,
} from './stressStrainMath';

const BW = 356;

/** The smallest of 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10 × 10ⁿ at or above x. */
function niceUp(x: number): number {
  if (!(x > 0)) return 1;
  const pow = 10 ** Math.floor(Math.log10(x));
  const m = x / pow;
  const f = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => s >= m - 1e-9) ?? 10;
  return f * pow;
}

/** Ticks 0 … max at a step that gives 3–6 of them. */
function ticks(max: number): number[] {
  let step = tickStep(max);
  while (max / step > 6) step *= 2;
  const out: number[] = [];
  for (let k = 0; k * step <= max * (1 + 1e-9); k++) out.push(Number((k * step).toPrecision(6)));
  return out;
}

/** Reads fields in the drawing's units (MPa, mm, N), and their labels as the page shows them. */
function useReader(calc: Calculator) {
  const rep = useRep(calc);
  const valueLabel = useValueLabel(calc);
  /** A field in drawing units; undefined when absent or "?". */
  const get = (x: NumOrVar | undefined): number | undefined => {
    if (x === undefined) return undefined;
    if (typeof x === 'number') return x;
    if (!rep.known(x)) return undefined;
    return rep.val(x) * toBase(rep.variable(x).unit);
  };
  /** "σ_Y = 250 MPa": the page's label, or `symbol` with the number worked here. */
  const lab = (x: NumOrVar | undefined, symbol: string, value?: number, unit = '') => {
    if (typeof x === 'string') return valueLabel(x);
    const v = typeof x === 'number' ? x : value;
    return v === undefined ? undefined : `${symbol} = ${fmt(v)}${unit ? ` ${unit}` : ''}`;
  };
  return { rep, get, lab };
}

/** A bare symbol in a drawing (σ_Y, r_o): italic, its subscript lowered. */
function Sym({
  x,
  y,
  text,
  anchor = 'start',
}: {
  x: number;
  y: number;
  text: string;
  anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <ChartText
      x={x}
      y={y}
      fontSize={chart.label}
      fontStyle="italic"
      fontWeight="700"
      textAnchor={anchor}
    >
      {text}
    </ChartText>
  );
}

/** Strain as a tick label: plain, or in thousandths when the axis says × 10⁻³. */
const strainTick = (e: number, milli: boolean) => fmt(milli ? e * 1000 : e);

/** HC28: the σ–ε curve (with a specimen), a tube's section, or two members side by side. */
export function StressStrain({ spec, calc }: { spec: StressStrainSpec; calc: Calculator }) {
  if (spec.section) return <TubeSection spec={spec} calc={calc} />;
  if (spec.parallel) return <Parallel spec={spec} calc={calc} />;
  return <CurveChart spec={spec} calc={calc} />;
}

// ─── The σ–ε chart ───────────────────────────────────────────────────────────

function CurveChart({ spec, calc }: { spec: StressStrainSpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, get, lab } = useReader(calc);
  const paint = usePaintIds('steel', 'light', 'clip');
  const model = spec.curve ?? 'metal';
  const E = get(spec.E);
  const sy = model === 'linear' || model === 'tissue' ? undefined : get(spec.yield);
  const su = get(spec.uts);
  const eu = get(spec.uniform);
  const ef = get(spec.fracture);
  const sf = get(spec.fractureStress);
  const toe = model === 'tissue' ? (get(spec.toe) ?? 0.02) : undefined;
  const pe = get(spec.strain);
  const ps = get(spec.stress);
  const havePoint = pe !== undefined && ps !== undefined;
  /** A metal page with a UTS but no yield field: the knee is a shape only, unlabelled. */
  const shapeOnly = model === 'metal' && spec.yield === undefined && su !== undefined;
  const Eshape = E ?? (shapeOnly ? 200000 : undefined);
  const syShape = shapeOnly ? 0.7 * su : sy;

  let curve: Curve | undefined;
  if (Eshape !== undefined && Eshape > 0) {
    const reachE = havePoint ? 1.25 * Math.max(pe, ps / Eshape) : undefined;
    curve = engineeringCurve({
      model: model === 'tissue' ? 'tissue' : syShape === undefined ? 'linear' : model,
      E: Eshape,
      ...(syShape !== undefined ? { sy: syShape } : {}),
      ...(su !== undefined ? { su } : {}),
      ...(eu !== undefined ? { eu } : {}),
      ...(ef !== undefined ? { ef } : {}),
      ...(sf !== undefined ? { sf } : {}),
      ...(toe !== undefined ? { toe } : {}),
      reach:
        reachE ??
        (syShape !== undefined ? 2 * (syShape / Eshape) : su !== undefined ? su / Eshape : 0.002),
    });
  }
  const full = !!curve && (!!curve.utsAt || !!curve.fracAt || model === 'epp');
  const tissue = model === 'tissue';
  const truePts = spec.true && curve?.utsAt && model === 'metal' ? trueCurve(curve) : [];
  const shift = curve?.shift ?? 0;

  // ── Extents: the curve's reach, the point, the yield's offset (frozen while dragging) ──
  let xNeed = 0;
  let yNeed = 0;
  if (curve) {
    const last = curve.pts[curve.pts.length - 1]!;
    xNeed = full || tissue ? last[0] : 0;
    yNeed = full || tissue ? Math.max(...curve.pts.map((p) => p[1])) : 0;
    if (!full && curve.yieldAt) {
      xNeed = Math.max(xNeed, 1.7 * curve.yieldAt[0]);
      yNeed = Math.max(yNeed, curve.yieldAt[1]);
    }
    if (!full && !tissue && !curve.yieldAt) {
      xNeed = Math.max(xNeed, last[0]);
      // The line's end too, so the top-left corner stays clear for the point's values.
      yNeed = Math.max(yNeed, last[1]);
    }
  }
  for (const [e, s] of truePts) {
    xNeed = Math.max(xNeed, e);
    yNeed = Math.max(yNeed, s);
  }
  if (havePoint) {
    xNeed = Math.max(xNeed, (pe + shift) * 1.2);
    yNeed = Math.max(yNeed, ps * 1.1);
  }
  if (!xNeed) xNeed = 0.002;
  if (!yNeed) yNeed = Eshape ? Eshape * xNeed : 100;
  const frozen = useFrozen({ xMax: niceUp(xNeed * 1.06), yMax: niceUp(yNeed * 1.1) });
  const { xMax, yMax } = frozen.value;

  // ── Layout ──
  const sideW = spec.specimen ? 132 : 0;
  const x0 = sideW + 48;
  const x1 = BW - 18;
  const yTop = 22;
  const yBot = spec.specimen ? 236 : 216;
  let BH = yBot + 46;
  const px = (e: number) => x0 + (e / xMax) * (x1 - x0);
  const py = (s: number) => yBot - (s / yMax) * (yBot - yTop);
  const inPlot = (p: Pt) => p[0] <= xMax * 1.0001 && p[1] <= yMax * 1.0001;
  const path = (pts: Pt[]) =>
    pts.map(([e, s], k) => `${k ? 'L' : 'M'} ${px(e).toFixed(2)} ${py(s).toFixed(2)}`).join(' ');
  const milli = xMax < 0.0101;

  // The point on the curve, and its drag.
  const ptX = havePoint ? px(pe + shift) : 0;
  const ptY = havePoint ? py(ps) : 0;
  const dragId =
    spec.drag && havePoint && rep.known(spec.drag) && rep.typed(spec.drag) ? spec.drag : undefined;
  const dragStart = useRef({ value: 0, strain: 0 });

  // Labels.
  const yieldLabel = !shapeOnly && curve?.yieldAt ? lab(spec.yield, 'σ_Y', sy, 'MPa') : undefined;
  const utsLabel = curve?.utsAt && !tissue ? lab(spec.uts, 'UTS', su, 'MPa') : undefined;
  const fracLabel = curve?.fracAt && !tissue ? lab(spec.fracture, 'ε_f', ef) : undefined;
  const eLabel =
    E === undefined
      ? undefined
      : E >= 1000
        ? lab(spec.E, 'E', E / 1000, 'GPa')
        : lab(spec.E, 'E', E, 'MPa');
  const sLabel = havePoint ? lab(spec.stress, 'σ', ps, 'MPa') : undefined;
  const epsLabel = havePoint ? lab(spec.strain, 'ε', pe) : undefined;

  // Energy shading.
  let shade: Pt[] = [];
  let energy: number | undefined;
  if (spec.area === 'resilience' && curve?.yieldAt && E !== undefined && sy !== undefined) {
    const ey = sy / E;
    shade = [
      [0, 0],
      [ey, sy],
      [ey, 0],
    ];
    energy = resilience(sy, E);
  } else if (spec.area === 'toughness' && curve?.fracAt) {
    shade = [...curve.pts, [curve.fracAt[0], 0]];
    energy = areaUnder(curve.pts);
  }
  const energyLabel =
    shade.length > 0
      ? lab(spec.energy, spec.area === 'resilience' ? 'U_r' : 'U_T', energy, 'MJ/m³')
      : undefined;

  // The inset near yield, on a full curve with a labelled 0.2% offset.
  const inset = full && model === 'metal' && !!yieldLabel;
  const offsetLine = !full && model === 'metal' && !!curve?.yieldAt && !shapeOnly;

  let specimen: ReactNode = null;
  let stretchNote = '';
  if (spec.specimen) {
    const sp = spec.specimen;
    const F = get(sp.F);
    const L = get(sp.L);
    const dL = get(sp.dL);
    const cx = 62;
    const gauge = 70;
    const raw = L && dL !== undefined ? (gauge * dL) / L : 0;
    const k = stretchFactor(raw);
    const dpx = Math.min(30, raw * k);
    if (k > 1 && dL !== undefined) stretchNote = ` ΔL is drawn ${fmt(k)} times larger to be seen.`;
    const waist = 22;
    const shoulder = 40;
    const g1 = 80;
    const g2 = g1 + gauge + dpx;
    const top = 34;
    const gripH = 24;
    const bodyTop = top + gripH;
    const bodyBot = g2 + 12;
    const gripB = bodyBot + 12;
    const fill = sp.tissue ? c.stressTissue : c.metal;
    const edge = sp.tissue ? c.profileBlood : c.metalDark;
    const outline = `M ${cx - shoulder / 2} ${bodyTop} L ${cx - shoulder / 2} ${bodyTop + 6} Q ${cx - waist / 2} ${bodyTop + 8} ${cx - waist / 2} ${bodyTop + 16} L ${cx - waist / 2} ${bodyBot - 8} Q ${cx - waist / 2} ${bodyBot} ${cx - shoulder / 2} ${bodyBot + 2} L ${cx - shoulder / 2} ${gripB} L ${cx + shoulder / 2} ${gripB} L ${cx + shoulder / 2} ${bodyBot + 2} Q ${cx + waist / 2} ${bodyBot} ${cx + waist / 2} ${bodyBot - 8} L ${cx + waist / 2} ${bodyTop + 16} Q ${cx + waist / 2} ${bodyTop + 8} ${cx + shoulder / 2} ${bodyTop + 6} L ${cx + shoulder / 2} ${bodyTop} Z`;
    const grip = (y: number) => (
      <G>
        <Rect
          x={cx - 32}
          y={y}
          width={64}
          height={gripH}
          rx={3}
          fill={c.metalDark}
          stroke={c.chartInk}
          strokeWidth={1}
        />
        <Rect x={cx - 32} y={y} width={64} height={gripH} rx={3} fill={url(paint.light)} />
        {[-24, -16, 16, 24].map((dx) => (
          <Line
            key={dx}
            x1={cx + dx}
            x2={cx + dx}
            y1={y + 4}
            y2={y + gripH - 4}
            stroke={c.metal}
            strokeWidth={1.2}
            opacity={0.7}
          />
        ))}
      </G>
    );
    const lines = [
      lab(sp.L, 'L', L, 'mm'),
      dL !== undefined ? lab(sp.dL, 'ΔL', dL, 'mm') : undefined,
      sp.A !== undefined ? lab(sp.A, 'A', get(sp.A), 'mm²') : undefined,
      sp.d !== undefined ? lab(sp.d, 'd', get(sp.d), 'mm') : undefined,
    ].filter((t): t is string => !!t);
    const fText = lab(sp.F, 'F', F, 'N');
    BH = Math.max(BH, gripB + gripH + 40 + (lines.length - 1) * 17 + 10);
    specimen = (
      <G>
        {/* The bar between the grips: steel lit from the left, or a tendon. */}
        <Path d={outline} fill={fill} stroke={edge} strokeWidth={1} />
        <Path d={outline} fill={url(paint.steel)} />
        {grip(top - 0)}
        {grip(gripB - 2)}
        {/* F pulling at both grips. */}
        {F !== undefined ? (
          <G>
            <Arrow x1={cx} y1={top - 2} x2={cx} y2={top - 20} color={c.forceApplied} />
            <Arrow
              x1={cx}
              y1={gripB + gripH}
              x2={cx}
              y2={gripB + gripH + 18}
              color={c.forceApplied}
            />
            {fText ? (
              <HeLabel x={cx + 8} y={top - 10} text={fText} anchor="start" w={x0 - 8} />
            ) : null}
          </G>
        ) : null}
        {/* Gauge marks: L as drawn, and the stretched mark ΔL further on. */}
        <Line
          x1={cx - waist / 2 - 4}
          x2={cx + waist / 2 + 4}
          y1={g1}
          y2={g1}
          stroke={c.chartInk}
          strokeWidth={1.5}
        />
        {dL !== undefined && dpx > 0 ? (
          <Line
            x1={cx - waist / 2 - 4}
            x2={cx + waist / 2 + 4}
            y1={g1 + gauge}
            y2={g1 + gauge}
            stroke={c.chartMuted}
            strokeWidth={1}
            strokeDasharray={chart.dashFine}
          />
        ) : null}
        <Line
          x1={cx - waist / 2 - 4}
          x2={cx + waist / 2 + 4}
          y1={g2}
          y2={g2}
          stroke={c.chartInk}
          strokeWidth={1.5}
        />
        {L !== undefined ? (
          <G>
            <Line x1={cx - 24} x2={cx - 24} y1={g1} y2={g1 + gauge} stroke={c.chartMuted} />
            <Line x1={cx - 28} x2={cx - 20} y1={g1} y2={g1} stroke={c.chartMuted} />
            <Line x1={cx - 28} x2={cx - 20} y1={g1 + gauge} y2={g1 + gauge} stroke={c.chartMuted} />
            <HeLabel x={cx - 30} y={g1 + gauge / 2 + 4} text="L" anchor="end" chip={false} />
          </G>
        ) : null}
        {dL !== undefined && dpx > 0 ? (
          <G>
            <Line x1={cx + 24} x2={cx + 24} y1={g1 + gauge} y2={g2} stroke={c.chartMuted} />
            <Line x1={cx + 20} x2={cx + 28} y1={g2} y2={g2} stroke={c.chartMuted} />
            <HeLabel
              x={cx + 30}
              y={(g1 + gauge + g2) / 2 + 4}
              text="ΔL"
              anchor="start"
              chip={false}
            />
          </G>
        ) : null}
        {lines.map((t, k) => (
          <HeLabel
            key={t}
            x={6}
            y={gripB + gripH + 40 + k * 17}
            text={t}
            anchor="start"
            w={x0 - 20}
          />
        ))}
      </G>
    );
  }

  /** A label's left edge moved right of the point's vertical guide when it would cross it. */
  const clearOfPoint = (x: number) => (havePoint && x < ptX + 8 ? ptX + 8 : x);
  const xTicks = ticks(xMax);
  const yTicks = ticks(yMax);

  // Captions.
  const parts: string[] = [];
  if (!curve) parts.push('The curve waits for E.');
  else if (tissue)
    parts.push(
      'Tissue: a toe region while the fibres straighten, then a straight part of slope E. Here ε counts from where the straight part meets the axis.',
    );
  else if (model === 'epp') parts.push('Elastic–perfectly plastic: σ = Eε up to σ_Y, then flat.');
  else if (shapeOnly)
    parts.push(
      'The engineering curve: elastic, yielding, hardening to the UTS, necking, fracture (the knee is a sketch: the page gives no σ_Y).',
    );
  else if (full)
    parts.push(
      'The engineering curve: elastic line, the 0.2% offset meeting it at σ_Y, hardening to the UTS, necking, fracture (×).',
    );
  else if (curve.yieldAt)
    parts.push('The elastic line σ = Eε; the 0.2% offset line meets the curve at σ_Y.');
  else parts.push('The elastic line σ = Eε.');
  if (havePoint && E !== undefined) {
    parts.push(
      `The point: σ = Eε = ${fmt(E)} MPa × ${fmt(pe)} = ${fmt(E * pe)} MPa${sy !== undefined && ps <= sy ? ', below σ_Y' : ''}.`,
    );
  }
  if (spec.specimen) {
    const F = get(spec.specimen.F);
    const A = get(spec.specimen.A);
    const L = get(spec.specimen.L);
    const dL = get(spec.specimen.dL);
    if (F !== undefined && A)
      parts.push(`σ = F ÷ A = ${fmt(F)} N ÷ ${fmt(A)} mm² = ${fmt(F / A)} MPa.`);
    if (L && dL !== undefined)
      parts.push(`ε = ΔL ÷ L = ${fmt(dL)} mm ÷ ${fmt(L)} mm = ${fmt(dL / L)}.`);
  }
  if (spec.area === 'resilience' && energy !== undefined && sy !== undefined && E !== undefined)
    parts.push(
      `U_r = σ_Y² ÷ 2E = ${fmt(sy)}² ÷ (2 × ${fmt(E)}) = ${fmt(energy)} MJ/m³, the shaded triangle.`,
    );
  if (spec.area === 'toughness' && energy !== undefined)
    parts.push(
      typeof spec.energy === 'string' && energyLabel
        ? `The shaded area under the curve is the toughness (${energyLabel}).`
        : `The shaded area under the curve, about ${fmt(energy)} MJ/m³, is the toughness.`,
    );
  if (truePts.length)
    parts.push('Dashed: the true curve, σ_T = σ(1 + ε) at ε_T = ln(1 + ε), to the UTS.');
  if (stretchNote) parts.push(stretchNote.trim());

  // Inset geometry (near yield).
  const iw = 124;
  const ih = 84;
  const ix0 = x1 - iw - 2;
  const iy0 = yBot - ih - 8;
  const insetBody = (() => {
    if (!inset || !curve?.yieldAt || Eshape === undefined) return null;
    const [ey2, syv] = curve.yieldAt;
    const ixMax = ey2 * 1.6;
    const iyMax = syv * 1.3;
    const ax0 = ix0 + 6;
    const ax1 = ix0 + iw - 6;
    const ay0 = iy0 + 8;
    const ay1 = iy0 + ih - 18;
    const ipx = (e: number) => ax0 + (e / ixMax) * (ax1 - ax0);
    const ipy = (s: number) => ay1 - (s / iyMax) * (ay1 - ay0);
    const near = curve.pts.filter(([e, s]) => e <= ixMax && s <= iyMax);
    const offTop = Math.min(iyMax, Eshape * (ixMax - OFFSET));
    return (
      <G>
        <Rect x={ix0} y={iy0} width={iw} height={ih} rx={4} fill={c.card} stroke={c.chartGrid} />
        <Line x1={ax0} x2={ax1} y1={ay1} y2={ay1} stroke={c.chartMuted} />
        <Line x1={ax0} x2={ax0} y1={ay0} y2={ay1} stroke={c.chartMuted} />
        <Path
          d={near
            .map(([e, s], k) => `${k ? 'L' : 'M'} ${ipx(e).toFixed(2)} ${ipy(s).toFixed(2)}`)
            .join(' ')}
          stroke={c.stressCurve}
          strokeWidth={2}
          fill="none"
        />
        <Line
          x1={ipx(OFFSET)}
          y1={ipy(0)}
          x2={ipx(OFFSET + offTop / Eshape)}
          y2={ipy(offTop)}
          stroke={c.chartMuted}
          strokeDasharray={chart.dashFine}
        />
        <Circle cx={ipx(ey2)} cy={ipy(syv)} r={3} fill={c.stressCurve} />
        <ChartText x={ipx(OFFSET)} y={ay1 + 13} fontSize={chart.label} textAnchor="middle">
          0.2%
        </ChartText>
        <Sym x={ipx(ey2) + 6} y={ipy(syv) + 16} text="σ_Y" />
      </G>
    );
  })();

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <View style={{ width: w, height: h }}>
            <Svg width={w} height={h}>
              <Defs>
                <Sheen id={paint.steel} />
                <TopLight id={paint.light} />
                <ClipPath id={paint.clip}>
                  <Rect x={x0} y={yTop - 2} width={x1 - x0 + 2} height={yBot - yTop + 2} />
                </ClipPath>
              </Defs>
              <G transform={`scale(${w / BW})`}>
                {specimen}
                {/* Grid and axes. */}
                {yTicks.map((t) => (
                  <G key={`y${t}`}>
                    {t > 0 ? (
                      <Line
                        x1={x0}
                        x2={x1}
                        y1={py(t)}
                        y2={py(t)}
                        stroke={c.chartGrid}
                        strokeWidth={0.6}
                      />
                    ) : null}
                    <ChartText
                      x={x0 - 5}
                      y={py(t) + 4}
                      fontSize={chart.label}
                      textAnchor="end"
                      fill={c.chartMuted}
                    >
                      {fmt(t)}
                    </ChartText>
                  </G>
                ))}
                {xTicks.map((t) => (
                  <G key={`x${t}`}>
                    {t > 0 ? (
                      <Line
                        x1={px(t)}
                        x2={px(t)}
                        y1={yTop}
                        y2={yBot}
                        stroke={c.chartGrid}
                        strokeWidth={0.6}
                      />
                    ) : null}
                    <ChartText
                      x={px(t)}
                      y={yBot + 15}
                      fontSize={chart.label}
                      textAnchor="middle"
                      fill={c.chartMuted}
                    >
                      {strainTick(t, milli)}
                    </ChartText>
                  </G>
                ))}
                <Line x1={x0} x2={x1} y1={yBot} y2={yBot} stroke={c.chartInk} strokeWidth={1.2} />
                <Line
                  x1={x0}
                  x2={x0}
                  y1={yTop - 6}
                  y2={yBot}
                  stroke={c.chartInk}
                  strokeWidth={1.2}
                />
                <ChartText
                  x={x0 - 5}
                  y={yTop - 10}
                  fontSize={chart.label}
                  textAnchor="start"
                  fontStyle="italic"
                >
                  σ (MPa)
                </ChartText>
                <ChartText
                  x={(x0 + x1) / 2}
                  y={yBot + 32}
                  fontSize={chart.label}
                  textAnchor="middle"
                >
                  {milli ? 'ε (× 10⁻³)' : 'ε'}
                </ChartText>
                {/* The energy shaded under the curve. */}
                {shade.length ? (
                  <Polygon
                    clipPath={url(paint.clip)}
                    points={shade.map(([e, s]) => `${px(e)},${py(s)}`).join(' ')}
                    fill={c.stressArea}
                    stroke="none"
                  />
                ) : null}
                {/* The resilience triangle's top: the elastic line carried on to σ_Y. */}
                {spec.area === 'resilience' && shade.length === 3 ? (
                  <Line
                    x1={px(0)}
                    y1={py(0)}
                    x2={px(shade[1]![0])}
                    y2={py(shade[1]![1])}
                    stroke={c.stressCurve}
                    strokeWidth={1.2}
                    strokeDasharray={chart.dashFine}
                  />
                ) : null}
                {/* The 0.2% offset line (zoomed in near yield). */}
                {offsetLine && curve?.yieldAt && E !== undefined ? (
                  <G>
                    <Line
                      x1={px(OFFSET)}
                      y1={py(0)}
                      x2={px(Math.min(xMax, OFFSET + yMax / E))}
                      y2={py(Math.min(yMax, E * (xMax - OFFSET)))}
                      stroke={c.chartMuted}
                      strokeWidth={1.2}
                      strokeDasharray={chart.dash}
                    />
                    <ChartText
                      x={px(OFFSET) + 6}
                      y={yBot - 6}
                      fontSize={chart.label}
                      textAnchor="start"
                      fill={c.chartMuted}
                    >
                      0.2% offset
                    </ChartText>
                  </G>
                ) : null}
                {/* The curves. */}
                {curve ? (
                  <Path
                    clipPath={url(paint.clip)}
                    d={path(curve.pts)}
                    stroke={c.stressCurve}
                    strokeWidth={2.4}
                    fill="none"
                    strokeLinejoin="round"
                  />
                ) : null}
                {truePts.length ? (
                  <Path
                    clipPath={url(paint.clip)}
                    d={path(truePts)}
                    stroke={c.stressTrue}
                    strokeWidth={2}
                    fill="none"
                    strokeDasharray={chart.dash}
                  />
                ) : null}
                {/* Yield, UTS, fracture. */}
                {curve?.yieldAt && yieldLabel && inPlot(curve.yieldAt) ? (
                  <G>
                    <Circle
                      cx={px(curve.yieldAt[0])}
                      cy={py(curve.yieldAt[1])}
                      r={3.5}
                      fill={c.stressCurve}
                    />
                    <HeLabel
                      x={px(curve.yieldAt[0]) + 8}
                      y={py(curve.yieldAt[1]) + (full ? 18 : -8)}
                      text={yieldLabel}
                      anchor={full ? 'start' : 'start'}
                      w={BW}
                    />
                  </G>
                ) : null}
                {curve?.utsAt && utsLabel ? (
                  <G>
                    <Circle
                      cx={px(curve.utsAt[0])}
                      cy={py(curve.utsAt[1])}
                      r={3.5}
                      fill={c.stressCurve}
                    />
                    <HeLabel
                      x={px(curve.utsAt[0])}
                      y={py(curve.utsAt[1]) + 20}
                      text={utsLabel}
                      w={BW}
                    />
                  </G>
                ) : null}
                {curve?.fracAt && inPlot(curve.fracAt) ? (
                  <G>
                    <Path
                      d={`M ${px(curve.fracAt[0]) - 5} ${py(curve.fracAt[1]) - 5} l 10 10 m 0 -10 l -10 10`}
                      stroke={c.chartInk}
                      strokeWidth={2}
                    />
                    {fracLabel ? (
                      <HeLabel
                        x={px(curve.fracAt[0]) - 4}
                        y={py(curve.fracAt[1]) + 22}
                        text={fracLabel}
                        anchor="end"
                        w={BW}
                      />
                    ) : null}
                  </G>
                ) : null}
                {/* E along the elastic line, when it has room. */}
                {eLabel &&
                curve &&
                (!full || model === 'epp') &&
                !tissue &&
                spec.area !== 'resilience'
                  ? (() => {
                      const s = yMax * 0.32;
                      const e = s / (E ?? 1);
                      return e <= xMax ? (
                        <HeLabel
                          x={clearOfPoint(px(e) + 10)}
                          y={py(s) + 6}
                          text={eLabel}
                          anchor="start"
                          w={BW}
                        />
                      ) : null;
                    })()
                  : null}
                {eLabel && tissue && curve ? (
                  <HeLabel
                    x={clearOfPoint(px(shift + (yMax * 0.3) / (E ?? 1)) + 10)}
                    y={py(yMax * 0.3) + 6}
                    text={eLabel}
                    anchor="start"
                    w={BW}
                  />
                ) : null}
                {energyLabel && shade.length ? (
                  spec.area === 'resilience' && curve?.yieldAt ? (
                    <HeLabel
                      x={px(curve.yieldAt[0]) + 10}
                      y={py(curve.yieldAt[1] * 0.4)}
                      text={energyLabel}
                      anchor="start"
                      w={BW}
                    />
                  ) : (
                    <HeLabel
                      x={inset ? (x0 + ix0) / 2 + 10 : (x0 + x1) / 2}
                      y={py(yMax * 0.3)}
                      text={energyLabel}
                      w={BW}
                    />
                  )
                ) : null}
                {insetBody}
                {/* The page's point, with its guides. */}
                {havePoint && inPlot([pe + shift, ps]) ? (
                  <G>
                    <Line
                      x1={x0}
                      x2={ptX}
                      y1={ptY}
                      y2={ptY}
                      stroke={c.chartHighlight}
                      strokeDasharray={chart.dashFine}
                    />
                    <Line
                      x1={ptX}
                      x2={ptX}
                      y1={ptY}
                      y2={yBot}
                      stroke={c.chartHighlight}
                      strokeDasharray={chart.dashFine}
                    />
                    {tissue && shift > 0 ? (
                      <Dimension
                        x1={px(shift)}
                        x2={ptX}
                        y={yBot - 10}
                        text="ε"
                        w={BW}
                        color={c.chartHighlight}
                      />
                    ) : null}
                    <Circle
                      cx={ptX}
                      cy={ptY}
                      r={5}
                      fill={c.chartHighlight}
                      stroke={c.card}
                      strokeWidth={1.5}
                    />
                    {(() => {
                      // Off a full curve, the values sit in the plot's empty top-left corner
                      // (above the elastic line); on a full curve, beside the point.
                      if (!full) {
                        return (
                          <G>
                            {sLabel ? (
                              <HeLabel
                                x={x0 + 8}
                                y={yTop + 14}
                                text={sLabel}
                                anchor="start"
                                w={BW}
                              />
                            ) : null}
                            {epsLabel ? (
                              <HeLabel
                                x={x0 + 8}
                                y={yTop + 32}
                                text={epsLabel}
                                anchor="start"
                                w={BW}
                              />
                            ) : null}
                          </G>
                        );
                      }
                      const right = ptX < x1 - 110;
                      const ax = right ? ptX + 10 : ptX - 10;
                      const anchor = right ? 'start' : 'end';
                      return (
                        <G>
                          {sLabel ? (
                            <HeLabel
                              x={ax}
                              y={ptY + (right ? 16 : -22)}
                              text={sLabel}
                              anchor={anchor}
                              w={BW}
                            />
                          ) : null}
                          {epsLabel ? (
                            <HeLabel
                              x={ax}
                              y={ptY + (right ? 32 : -6)}
                              text={epsLabel}
                              anchor={anchor}
                              w={BW}
                            />
                          ) : null}
                        </G>
                      );
                    })()}
                  </G>
                ) : null}
              </G>
            </Svg>
            {dragId && havePoint && inPlot([pe + shift, ps]) ? (
              <DragHandle
                testID="drag-strain"
                x={(ptX * w) / BW}
                y={(ptY * w) / BW}
                label={rep.variable(dragId).name}
                onStart={() => {
                  dragStart.current = { value: rep.val(dragId), strain: pe };
                  frozen.freeze();
                }}
                onEnd={() => frozen.release()}
                onMove={(dx) => {
                  const d = dragStart.current;
                  if (!(d.strain > 0)) return;
                  const de = ((dx * BW) / w / (x1 - x0)) * xMax;
                  const next = Math.max(d.strain * 0.02, d.strain + de);
                  calc.set(
                    { [dragId]: rep.snapTo(dragId, d.value * (next / d.strain)) },
                    rep.slide(dragId),
                  );
                }}
              />
            ) : null}
          </View>
        )}
      </Canvas>
      <Caption>{parts.join(' ')}</Caption>
    </View>
  );
}

// ─── A tube's section in bending ─────────────────────────────────────────────

function TubeSection({ spec, calc }: { spec: StressStrainSpec; calc: Calculator }) {
  const c = usePalette();
  const { get, lab } = useReader(calc);
  const paint = usePaintIds('light');
  const se = spec.section!;
  const ro = get(se.ro);
  const ri = get(se.ri);
  const I = get(se.I) ?? (ro !== undefined && ri !== undefined ? tubeI(ro, ri) : undefined);
  const M = get(se.M);
  const sEdge =
    get(se.stress) ?? (M !== undefined && ro !== undefined && I ? (M * ro) / I : undefined);
  const solid = get(se.solidI) ?? (ro !== undefined ? tubeI(ro, 0) : undefined);
  const bad = ro !== undefined && ri !== undefined && ri >= ro;
  const BH = 300;
  const cx = 96;
  const cy = 124;
  const R = 86;
  const r = ro && ri !== undefined && !bad ? (R * ri) / ro : 0;
  const steel = se.material === 'steel';
  const ax = 286;
  const S = 44;
  const lines = [
    lab(se.ro, 'r_o', ro, 'mm'),
    lab(se.ri, 'r_i', ri, 'mm'),
    lab(se.I, 'I', I, 'mm⁴'),
    lab(se.M, 'M', M !== undefined ? M / 1000 : undefined, 'N·m'),
  ].filter((t): t is string => !!t);
  const parts: string[] = [];
  if (bad) parts.push('The canal can’t be as wide as the bone: r_i must be less than r_o.');
  else if (ro !== undefined && ri !== undefined) {
    parts.push(
      `I = π(r_o⁴ − r_i⁴) ÷ 4 = π(${fmt(ro)}⁴ − ${fmt(ri)}⁴) ÷ 4 = ${fmt(tubeI(ro, ri))} mm⁴.`,
    );
    if (solid)
      parts.push(
        `A solid rod as wide has I = ${fmt(solid)} mm⁴: the tube keeps ${fmt((100 * tubeI(ro, ri)) / solid)}% of its stiffness with ${fmt((100 * (ro * ro - ri * ri)) / (ro * ro))}% of its bone.`,
      );
  }
  if (sEdge !== undefined && M !== undefined && ro !== undefined && I)
    parts.push(
      `σ = Mr_o ÷ I = ${fmt(M)} N·mm × ${fmt(ro)} mm ÷ ${fmt(I)} mm⁴ = ${fmt(sEdge)} MPa at the outer edge, zero on the neutral axis.`,
    );
  const sText = sEdge !== undefined ? lab(se.stress, 'σ', sEdge, 'MPa') : undefined;
  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <TopLight id={paint.light} />
            </Defs>
            <G transform={`scale(${w / BW})`} opacity={bad ? 0.4 : 1}>
              {ro !== undefined ? (
                <G>
                  {/* The wall (cortical bone or steel) and the canal, to scale. */}
                  <Circle
                    cx={cx}
                    cy={cy}
                    r={R}
                    fill={steel ? c.metal : c.bone}
                    stroke={steel ? c.metalDark : c.chartMuted}
                    strokeWidth={1.5}
                  />
                  <Circle cx={cx} cy={cy} r={R} fill={url(paint.light)} />
                  {r > 0 ? (
                    <Circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={steel ? c.card : c.stressMarrow}
                      stroke={steel ? c.metalDark : c.chartMuted}
                      strokeWidth={1}
                    />
                  ) : null}
                  {/* Radii. */}
                  <Line
                    x1={cx}
                    y1={cy}
                    x2={cx + R * 0.707}
                    y2={cy - R * 0.707}
                    stroke={c.chartInk}
                    strokeWidth={1.2}
                  />
                  <Sym x={cx + R * 0.53 - 8} y={cy - R * 0.53 - 4} text="r_o" anchor="end" />
                  {r > 0 ? (
                    <G>
                      <Line
                        x1={cx}
                        y1={cy}
                        x2={cx - r * 0.707}
                        y2={cy + r * 0.707}
                        stroke={c.chartInk}
                        strokeWidth={1.2}
                      />
                      <Sym x={cx - r * 0.4 + 6} y={cy + r * 0.4 + 14} text="r_i" />
                    </G>
                  ) : null}
                </G>
              ) : null}
              {/* The neutral axis, through the centre and on to the stress block. */}
              <Line
                x1={cx - R - 6}
                x2={ax + S + 8}
                y1={cy}
                y2={cy}
                stroke={c.chartInk}
                strokeDasharray={chart.dash}
                strokeWidth={1}
              />
              <ChartText x={cx + R + 6} y={cy - 6} fontSize={chart.label} fill={c.chartMuted}>
                neutral axis
              </ChartText>
              {/* σ = My ÷ I across the depth: compression above, tension below. */}
              <Line x1={ax} x2={ax} y1={cy - R} y2={cy + R} stroke={c.chartInk} strokeWidth={1.2} />
              {sEdge !== undefined ? (
                <G>
                  <Polygon
                    points={`${ax},${cy} ${ax - S},${cy - R} ${ax},${cy - R}`}
                    fill={c.sectionCompression}
                    opacity={0.3}
                  />
                  <Polygon
                    points={`${ax},${cy} ${ax + S},${cy + R} ${ax},${cy + R}`}
                    fill={c.sectionTension}
                    opacity={0.3}
                  />
                  {[0.35, 0.7, 1].map((f) => (
                    <G key={f}>
                      <Arrow
                        x1={ax}
                        y1={cy - R * f}
                        x2={ax - S * f}
                        y2={cy - R * f}
                        color={c.sectionCompression}
                        width={1.5}
                        head={6}
                      />
                      <Arrow
                        x1={ax}
                        y1={cy + R * f}
                        x2={ax + S * f}
                        y2={cy + R * f}
                        color={c.sectionTension}
                        width={1.5}
                        head={6}
                      />
                    </G>
                  ))}
                  <ChartText
                    x={ax + 8}
                    y={cy - R * 0.55}
                    fontSize={chart.value}
                    fontWeight="bold"
                    fill={c.sectionCompression}
                  >
                    C
                  </ChartText>
                  <ChartText
                    x={ax - 8}
                    y={cy + R * 0.6}
                    fontSize={chart.value}
                    fontWeight="bold"
                    textAnchor="end"
                    fill={c.sectionTension}
                  >
                    T
                  </ChartText>
                  {sText ? <HeLabel x={ax} y={cy + R + 20} text={sText} w={BW} /> : null}
                </G>
              ) : null}
              {/* The values, two to a row under the drawing. */}
              {lines.map((t, k) => (
                <HeLabel
                  key={t}
                  x={k % 2 ? 186 : 8}
                  y={cy + R + 44 + Math.floor(k / 2) * 18}
                  text={t}
                  anchor="start"
                  w={BW}
                />
              ))}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{parts.join(' ')}</Caption>
    </View>
  );
}

// ─── Two members sharing one load ────────────────────────────────────────────

function Parallel({ spec, calc }: { spec: StressStrainSpec; calc: Calculator }) {
  const c = usePalette();
  const { get, lab } = useReader(calc);
  const paint = usePaintIds('steel', 'light');
  const pa = spec.parallel!;
  const E1 = get(pa.E1);
  const A1 = get(pa.A1);
  const E2 = get(pa.E2);
  const A2 = get(pa.A2);
  const F = get(pa.F);
  const worked =
    E1 !== undefined && A1 !== undefined && E2 !== undefined && A2 !== undefined
      ? shareOf(E1, A1, E2, A2)
      : undefined;
  const share = get(pa.share) ?? worked;
  const [n1, n2] = pa.names ?? ['Implant', 'Bone'];
  const BH = 262;
  const left = 56;
  const right = BW - 56;
  const width = right - left;
  const plateY = 52;
  const plateH = 14;
  const groundY = 196;
  const w1 = share !== undefined ? width * share : width / 2;
  const s2 =
    get(pa.stress2) ??
    (F !== undefined && share !== undefined && A2 ? (F * (1 - share)) / A2 : undefined);
  const pct = (x: number) => `${fmt(100 * x)}%`;
  const fText = F !== undefined ? lab(pa.F, 'F', F, 'N') : undefined;
  const parts: string[] = [];
  if (
    E1 !== undefined &&
    A1 !== undefined &&
    E2 !== undefined &&
    A2 !== undefined &&
    worked !== undefined
  )
    parts.push(
      `Bonded, both strain the same, so each carries load in proportion to EA: share = E₁A₁ ÷ (E₁A₁ + E₂A₂) = ${fmt(E1 * A1)} ÷ (${fmt(E1 * A1)} + ${fmt(E2 * A2)}) = ${pct(worked)}.`,
    );
  if (share !== undefined)
    parts.push(`The two shares add to 1: ${pct(share)} + ${pct(1 - share)} = 100%.`);
  if (F !== undefined && share !== undefined && s2 !== undefined && A2)
    parts.push(
      `${n2} carries ${fmt(F * (1 - share))} N, so σ = ${fmt(F * (1 - share))} N ÷ ${fmt(A2)} mm² = ${fmt(s2)} MPa.`,
    );
  const bar = (x: number, bw: number, which: 1 | 2) => (
    <G>
      <Rect
        x={x}
        y={plateY + plateH}
        width={bw}
        height={groundY - plateY - plateH}
        fill={which === 1 ? c.metal : c.bone}
        stroke={which === 1 ? c.metalDark : c.chartMuted}
        strokeWidth={1}
        opacity={share === undefined ? 0.4 : 1}
      />
      <Rect
        x={x}
        y={plateY + plateH}
        width={bw}
        height={groundY - plateY - plateH}
        fill={url(which === 1 ? paint.steel : paint.light)}
        opacity={share === undefined ? 0.4 : 1}
      />
    </G>
  );
  const rows = [share !== undefined ? pct(share) : '', share !== undefined ? pct(1 - share) : ''];
  /** Names that don't fit on their bars go in a key under the shares. */
  const hidden =
    share === undefined
      ? []
      : [w1 <= 64 ? `left: ${n1}` : '', width - w1 <= 64 ? `right: ${n2}` : ''].filter(Boolean);
  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <Sheen id={paint.steel} />
              <TopLight id={paint.light} />
            </Defs>
            <G transform={`scale(${w / BW})`}>
              {bar(left, Math.max(1, w1), 1)}
              {bar(left + w1, Math.max(1, width - w1), 2)}
              {/* The rigid plate the load comes through, and the ground below. */}
              <Rect
                x={left - 8}
                y={plateY}
                width={width + 16}
                height={plateH}
                rx={2}
                fill={c.metalDark}
              />
              <Rect
                x={left - 8}
                y={plateY}
                width={width + 16}
                height={plateH}
                rx={2}
                fill={url(paint.light)}
              />
              <Hatch x1={left - 8} x2={right + 8} y={groundY} />
              {F !== undefined ? (
                <G>
                  <Arrow
                    x1={BW / 2}
                    y1={8}
                    x2={BW / 2}
                    y2={plateY - 2}
                    color={c.forceApplied}
                    width={2.5}
                  />
                  {fText ? (
                    <HeLabel x={BW / 2 + 10} y={30} text={fText} anchor="start" w={BW} />
                  ) : null}
                </G>
              ) : null}
              {/* Names on the bars when they fit; the shares in the key below. */}
              {share !== undefined && w1 > 64 ? (
                <ChartText
                  x={left + w1 / 2}
                  y={(plateY + groundY) / 2 + 6}
                  fontSize={chart.label}
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {n1}
                </ChartText>
              ) : null}
              {share !== undefined && width - w1 > 64 ? (
                <ChartText
                  x={left + w1 + (width - w1) / 2}
                  y={(plateY + groundY) / 2 + 6}
                  fontSize={chart.label}
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {n2}
                </ChartText>
              ) : null}
              {share !== undefined ? (
                <G>
                  <Dimension x1={left} x2={left + w1} y={groundY + 28} text={rows[0]!} w={BW} />
                  <Dimension x1={left + w1} x2={right} y={groundY + 28} text={rows[1]!} w={BW} />
                </G>
              ) : null}
              {hidden.length ? (
                <ChartText
                  x={BW / 2}
                  y={groundY + 52}
                  fontSize={chart.label}
                  textAnchor="middle"
                  fill={c.chartMuted}
                >
                  {hidden.join(' · ')}
                </ChartText>
              ) : null}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{parts.join(' ')}</Caption>
    </View>
  );
}
