/**
 * HC33 `stressElement` (StressElementSpec in typesHe2j.ts): a plane-stress element, the element
 * turned to its principal axes, and Mohr's circle; three circles; the failure loci in the
 * σ_A–σ_B plane with the load and the n-scaled point; a soil's circle under the Mohr–Coulomb line
 * with the sample and its failure plane. Diagrams flat; the soil sample painted.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { FailureCriterion, StressElementSpec } from '@/data/modules/typesHe2j';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Arrow, fmt, HeLabel } from './beamKit';
import { Canvas, Caption, ChartText, useRep } from './common';
import { useValueLabel } from './he1fKit';
import { TopLight, url, usePaintIds } from './paint';
import {
  lineDistance,
  locus,
  mohr,
  safety,
  turned,
  vonMises2,
  vonMises3,
} from './stressElementMath';
import { toBase } from './stressStrainMath';

const BW = 356;
const RAD = Math.PI / 180;

/** Reads fields in MPa (stresses) or degrees, and labels them as the page shows them. */
function useReader(calc: Calculator) {
  const rep = useRep(calc);
  const valueLabel = useValueLabel(calc);
  const get = (x: NumOrVar | undefined): number | undefined => {
    if (x === undefined) return undefined;
    if (typeof x === 'number') return x;
    if (!rep.known(x)) return undefined;
    return rep.val(x) * toBase(rep.variable(x).unit);
  };
  /** The page's label, or `symbol` with the number worked here (in `unit`). */
  const lab = (
    x: NumOrVar | undefined,
    symbol: string,
    value: number | undefined,
    unit: string,
  ) => {
    if (typeof x === 'string') return valueLabel(x);
    const v = typeof x === 'number' ? x : value;
    return v === undefined ? undefined : `${symbol} = ${fmt(v)}${unit ? ` ${unit}` : ''}`;
  };
  /** The unit the page writes stresses in (back from MPa), from the first stress field it has. */
  const unitOf = (...xs: (NumOrVar | undefined)[]) => {
    const id = xs.find((x): x is string => typeof x === 'string');
    const u = id ? (rep.unit(id) ?? rep.variable(id).unit) : undefined;
    return u ?? 'MPa';
  };
  return { rep, get, lab, unitOf };
}

/** A bare symbol (σₓ, τ_xy, θ_p): italic, a subscript lowered. */
function Sym({
  x,
  y,
  text,
  anchor = 'start',
  color,
}: {
  x: number;
  y: number;
  text: string;
  anchor?: 'start' | 'middle' | 'end';
  color?: string;
}) {
  return (
    <ChartText
      x={x}
      y={y}
      fontSize={chart.label}
      fontStyle="italic"
      fontWeight="700"
      textAnchor={anchor}
      {...(color ? { fill: color } : {})}
    >
      {text}
    </ChartText>
  );
}

/** An arc of radius r round (cx, cy) from angle a0 to a1 (screen degrees, y down). */
const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => [cx + r * Math.cos(a * RAD), cy + r * Math.sin(a * RAD)] as const;
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}`;
};

/**
 * A square element at (cx, cy), `half` from its center to a face, turned `deg` counterclockwise:
 * a normal stress on each pair of faces (arrows out for tension, in for compression, as long as
 * the stress) and the shear along them.
 */
function Element({
  cx,
  cy,
  half,
  deg,
  sa,
  sb,
  t,
  big,
  c,
  fill,
  names,
}: {
  cx: number;
  cy: number;
  half: number;
  deg: number;
  /** Normal stress on the faces normal to the turned x′ axis, and on the others. */
  sa?: number;
  sb?: number;
  t?: number;
  /** The largest stress drawn, for arrow lengths. */
  big: number;
  c: Palette;
  fill: string;
  names: [string, string, string?];
}): ReactNode {
  const a = deg * RAD;
  // Screen directions of x′ and y′ (y up on the page is −y on screen).
  const ux = [Math.cos(a), -Math.sin(a)] as const;
  const uy = [-Math.sin(a), -Math.cos(a)] as const;
  const at = (p: number, q: number) =>
    [cx + p * ux[0] + q * uy[0], cy + p * ux[1] + q * uy[1]] as const;
  const corners = [at(half, half), at(-half, half), at(-half, -half), at(half, -half)];
  const len = (s: number) => 10 + (26 * Math.abs(s)) / (big || 1);
  const normal = (s: number | undefined, dir: 1 | -1, onX: boolean, key: string) => {
    if (s === undefined || Math.abs(s) < 1e-9) return null;
    const L = len(s);
    const p0 = onX ? at(dir * half, 0) : at(0, dir * half);
    const p1 = onX ? at(dir * (half + L), 0) : at(0, dir * (half + L));
    const [from, to] = s > 0 ? [p0, p1] : [p1, p0];
    const col = s > 0 ? c.sectionTension : c.sectionCompression;
    return (
      <Arrow key={key} x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} color={col} width={2} />
    );
  };
  const shear = (dir: 1 | -1, onX: boolean, key: string) => {
    if (t === undefined || Math.abs(t) < 1e-9) return null;
    const g = half + 7;
    const s = 0.62 * half * Math.sign(t) * dir;
    // On the +x′ face τ points along +y′; on the +y′ face along +x′; the opposite faces reverse.
    const [p0, p1] = onX ? [at(dir * g, -s), at(dir * g, s)] : [at(-s, dir * g), at(s, dir * g)];
    return (
      <Arrow
        key={key}
        x1={p0[0]}
        y1={p0[1]}
        x2={p1[0]}
        y2={p1[1]}
        color={c.sectionShear}
        width={1.6}
        head={7}
      />
    );
  };
  const tipX = sa === undefined ? half + 6 : half + len(sa) + 6;
  const tipY = sb === undefined ? half + 6 : half + len(sb) + 6;
  const lx = at(tipX + 2, 0);
  const ly = at(0, tipY + 6);
  const lt = at(half + 12, half + 12);
  return (
    <G>
      <Polygon
        points={corners.map((p) => p.join(',')).join(' ')}
        fill={fill}
        stroke={c.chartInk}
        strokeWidth={1.5}
      />
      {normal(sa, 1, true, 'a1')}
      {normal(sa, -1, true, 'a2')}
      {normal(sb, 1, false, 'b1')}
      {normal(sb, -1, false, 'b2')}
      {shear(1, true, 's1')}
      {shear(-1, true, 's2')}
      {shear(1, false, 's3')}
      {shear(-1, false, 's4')}
      {sa !== undefined && Math.abs(sa) > 1e-9 ? (
        <Sym x={lx[0]} y={lx[1] + 4} text={names[0]} anchor={lx[0] >= cx ? 'start' : 'end'} />
      ) : null}
      {sb !== undefined && Math.abs(sb) > 1e-9 ? (
        <Sym x={ly[0] + 4} y={ly[1] + 2} text={names[1]} />
      ) : null}
      {names[2] && t !== undefined && Math.abs(t) > 1e-9 ? (
        <Sym x={lt[0] + 2} y={lt[1]} text={names[2]} color={c.sectionShear} />
      ) : null}
    </G>
  );
}

/** HC33: the element, its principal turn and Mohr's circle; or three circles, loci, or a soil. */
export function StressElement({ spec, calc }: { spec: StressElementSpec; calc: Calculator }) {
  if (spec.mohrCoulomb) return <SoilCircle spec={spec} calc={calc} />;
  if (spec.envelope) return <Envelope spec={spec} calc={calc} />;
  if (spec.three) return <ThreeCircles spec={spec} calc={calc} />;
  return <Transformation spec={spec} calc={calc} />;
}

// ─── The element, its turn to θ_p and Mohr's circle ──────────────────────────

function Transformation({ spec, calc }: { spec: StressElementSpec; calc: Calculator }) {
  const c = usePalette();
  const { get, lab, unitOf } = useReader(calc);
  const u = unitOf(spec.sx, spec.sy, spec.txy, spec.s1);
  const k0 = toBase(u);
  const sx = get(spec.sx);
  const sy = get(spec.sy);
  const txy = get(spec.txy);
  const all = sx !== undefined && sy !== undefined && txy !== undefined;
  const m = all ? mohr(sx, sy, txy) : undefined;
  const s1 = get(spec.s1) ?? m?.s1;
  const s2 = get(spec.s2) ?? m?.s2;
  const C = m?.C ?? (s1 !== undefined && s2 !== undefined ? (s1 + s2) / 2 : undefined);
  const R = m?.R ?? (s1 !== undefined && s2 !== undefined ? (s1 - s2) / 2 : undefined);
  // θ_p as the page has it (tan 2θ_p = 2τ ÷ (σₓ − σ_y)), and which principal its x′ face carries.
  const thp =
    get(spec.angle) ??
    (all
      ? sx === sy
        ? 45 * Math.sign(txy)
        : Math.atan((2 * txy) / (sx - sy)) / 2 / RAD
      : undefined);
  const onX = all && thp !== undefined ? turned(sx, sy, txy, thp).s : undefined;
  const xIs1 =
    onX !== undefined &&
    s1 !== undefined &&
    s2 !== undefined &&
    Math.abs(onX - s1) <= Math.abs(onX - s2);
  const big = Math.max(
    Math.abs(sx ?? 0),
    Math.abs(sy ?? 0),
    Math.abs(txy ?? 0),
    Math.abs(s1 ?? 0),
    Math.abs(s2 ?? 0),
    1e-9,
  );
  const shown = (x: number) => fmt(x / k0);

  // Mohr's circle below the elements.
  const top = 170;
  const lo = Math.min(C !== undefined && R !== undefined ? C - R : 0, 0);
  const hi = Math.max(C !== undefined && R !== undefined ? C + R : 0, 0);
  const span = Math.max(hi - lo, 1e-9);
  const k = R ? Math.min((BW - 70) / span, 200 / (2 * R)) : (BW - 70) / span;
  const sxPx = (s: number) => BW / 2 + (s - (lo + hi) / 2) * k;
  const cy = top + 28 + (R ?? 0) * k;
  const tauPx = (t: number) => cy + t * k; // τ positive down
  const rowY = cy + (R ?? 0) * k + 30;
  const BH = rowY + 10;
  const cx = C !== undefined ? sxPx(C) : BW / 2;

  const X = all ? ([sxPx(sx), tauPx(txy)] as const) : undefined;
  const Y = all ? ([sxPx(sy), tauPx(-txy)] as const) : undefined;
  const twoTh = X ? Math.atan2(X[1] - cy, X[0] - cx) / RAD : undefined;
  // 2θ_p runs from X to the end of the axis that the turned face carries (σ₁ right, σ₂ left).
  const twoFrom = xIs1 ? 0 : twoTh !== undefined && twoTh < 0 ? -180 : 180;

  const parts: string[] = [];
  if (all && m) {
    parts.push(
      `σ_avg = (σₓ + σ_y) ÷ 2 = (${shown(sx)} + ${shown(sy)}) ÷ 2 = ${shown(m.C)} ${u}.`,
      `R = √(((σₓ − σ_y) ÷ 2)² + τₓ_y²) = ${shown(m.R)} ${u}.`,
      `σ₁ = σ_avg + R = ${shown(m.s1)} ${u}; σ₂ = σ_avg − R = ${shown(m.s2)} ${u}; τ_max = R.`,
    );
    if (thp !== undefined)
      parts.push(
        `tan 2θₚ = 2τₓᵧ ÷ (σₓ − σ_y), so θ_p = ${fmt(thp)}°: the turned element carries ${xIs1 ? 'σ₁' : 'σ₂'} on the faces turned θ_p and no shear.`,
      );
    parts.push('τ is plotted positive down, so X turns to σ₁ by 2θₚ the way the element turns.');
  } else parts.push('The element and the circle wait for σₓ, σ_y and τₓ_y.');

  const s1Label = s1 !== undefined ? lab(spec.s1, 'σ₁', s1 / k0, u) : undefined;
  const s2Label = s2 !== undefined ? lab(spec.s2, 'σ₂', s2 / k0, u) : undefined;
  const tLabel =
    R !== undefined ? lab(spec.tmax ?? spec.R, spec.tmax ? 'τ_max' : 'R', R / k0, u) : undefined;
  const rad = R !== undefined ? R * k : 0;
  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <G transform={`scale(${w / BW})`}>
              {/* The element as given, and turned to θ_p. */}
              <Element
                cx={88}
                cy={84}
                half={24}
                deg={0}
                {...(sx !== undefined ? { sa: sx } : {})}
                {...(sy !== undefined ? { sb: sy } : {})}
                {...(txy !== undefined ? { t: txy } : {})}
                big={big}
                c={c}
                fill={c.chartSurface}
                names={['σₓ', 'σ_y', 'τₓ_y']}
              />
              <ChartText
                x={88}
                y={158}
                fontSize={chart.label}
                textAnchor="middle"
                fill={c.chartMuted}
              >
                as given
              </ChartText>
              {all && thp !== undefined && s1 !== undefined && s2 !== undefined ? (
                <G>
                  <Line
                    x1={232}
                    x2={312}
                    y1={84}
                    y2={84}
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dashFine}
                  />
                  <Path
                    d={arc(268, 84, 40, 0, -thp)}
                    stroke={c.mohrPlane}
                    strokeWidth={1.4}
                    fill="none"
                  />
                  <Element
                    cx={268}
                    cy={84}
                    half={24}
                    deg={thp}
                    sa={xIs1 ? s1 : s2}
                    sb={xIs1 ? s2 : s1}
                    big={big}
                    c={c}
                    fill={c.chartSurface}
                    names={xIs1 ? ['σ₁', 'σ₂'] : ['σ₂', 'σ₁']}
                  />
                  <ChartText
                    x={268}
                    y={158}
                    fontSize={chart.label}
                    textAnchor="middle"
                    fill={c.chartMuted}
                  >
                    {`turned θ_p = ${fmt(thp)}°`}
                  </ChartText>
                </G>
              ) : null}
              {/* Mohr's circle: σ across, τ down. */}
              <Line x1={10} x2={BW - 10} y1={cy} y2={cy} stroke={c.chartInk} strokeWidth={1.2} />
              <Path d={`M ${BW - 10} ${cy} l -7 -4 l 0 8 z`} fill={c.chartInk} />
              <ChartText
                x={BW - 12}
                y={cy - 6}
                fontSize={chart.label}
                textAnchor="end"
                fontStyle="italic"
              >
                σ
              </ChartText>
              {lo <= 0 && hi >= 0 ? (
                <G>
                  <Line
                    x1={sxPx(0)}
                    x2={sxPx(0)}
                    y1={top + 6}
                    y2={rowY - 14}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                  />
                  <Path d={`M ${sxPx(0)} ${rowY - 14} l -4 -7 l 8 0 z`} fill={c.chartMuted} />
                  <ChartText
                    x={sxPx(0) - 5}
                    y={rowY - 16}
                    fontSize={chart.label}
                    textAnchor="end"
                    fontStyle="italic"
                    fill={c.chartMuted}
                  >
                    τ
                  </ChartText>
                </G>
              ) : null}
              {C !== undefined && R !== undefined ? (
                <G>
                  <Circle
                    cx={cx}
                    cy={cy}
                    r={rad}
                    fill="none"
                    stroke={c.mohrCircle}
                    strokeWidth={2}
                  />
                  <Circle cx={cx} cy={cy} r={3} fill={c.mohrCircle} />
                  {/* τ_max at the top of the circle. */}
                  <Circle cx={cx} cy={cy - rad} r={3.5} fill={c.mohrCircle} />
                  {tLabel ? <HeLabel x={cx} y={cy - rad - 9} text={tLabel} w={BW} /> : null}
                  {/* σ₁ and σ₂ on the axis, named just outside the circle; values under it. */}
                  {s1 !== undefined ? (
                    <G>
                      <Circle cx={sxPx(s1)} cy={cy} r={4} fill={c.chartInk} />
                      <Sym x={sxPx(s1) + 5} y={cy + 16} text="σ₁" />
                    </G>
                  ) : null}
                  {s2 !== undefined ? (
                    <G>
                      <Circle cx={sxPx(s2)} cy={cy} r={4} fill={c.chartInk} />
                      <Sym x={sxPx(s2) - 5} y={cy + 16} text="σ₂" anchor="end" />
                    </G>
                  ) : null}
                  {s2Label ? (
                    <HeLabel x={10} y={rowY} text={s2Label} anchor="start" w={BW} />
                  ) : null}
                  {s1Label ? (
                    <HeLabel x={BW - 10} y={rowY} text={s1Label} anchor="end" w={BW} />
                  ) : null}
                </G>
              ) : null}
              {X && Y ? (
                <G>
                  <Line
                    x1={X[0]}
                    y1={X[1]}
                    x2={Y[0]}
                    y2={Y[1]}
                    stroke={c.chartInk}
                    strokeWidth={1.2}
                  />
                  <Circle cx={X[0]} cy={X[1]} r={4.5} fill={c.chartHighlight} />
                  <Circle cx={Y[0]} cy={Y[1]} r={4.5} fill={c.chartHighlight} />
                  <Sym
                    x={X[0] + (X[0] >= cx ? 8 : -8)}
                    y={X[1] + (X[1] >= cy ? 14 : -6)}
                    text="X"
                    anchor={X[0] >= cx ? 'start' : 'end'}
                    color={c.chartHighlight}
                  />
                  <Sym
                    x={Y[0] + (Y[0] >= cx ? 8 : -8)}
                    y={Y[1] + (Y[1] >= cy ? 14 : -6)}
                    text="Y"
                    anchor={Y[0] >= cx ? 'start' : 'end'}
                    color={c.chartHighlight}
                  />
                  {twoTh !== undefined && Math.abs(twoTh) > 2 && rad > 30 ? (
                    <G>
                      <Path
                        d={arc(cx, cy, Math.min(26, rad * 0.4), twoFrom, twoTh)}
                        stroke={c.mohrPlane}
                        strokeWidth={1.4}
                        fill="none"
                      />
                      <Sym
                        x={
                          cx +
                          (Math.min(26, rad * 0.4) + 10) * Math.cos(((twoFrom + twoTh) / 2) * RAD)
                        }
                        y={
                          cy +
                          (Math.min(26, rad * 0.4) + 10) * Math.sin(((twoFrom + twoTh) / 2) * RAD) +
                          4
                        }
                        anchor={Math.cos(((twoFrom + twoTh) / 2) * RAD) >= 0 ? 'start' : 'end'}
                        text="2θₚ"
                        color={c.mohrPlane}
                      />
                    </G>
                  ) : null}
                </G>
              ) : null}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{parts.join(' ')}</Caption>
    </View>
  );
}

// ─── Three circles ───────────────────────────────────────────────────────────

function ThreeCircles({ spec, calc }: { spec: StressElementSpec; calc: Calculator }) {
  const c = usePalette();
  const { get, lab, unitOf } = useReader(calc);
  const u = unitOf(spec.s1, spec.s2, spec.s3, spec.sx);
  const k0 = toBase(u);
  const given = [get(spec.s1), get(spec.s2), get(spec.s3)];
  const known = given.every((x) => x !== undefined);
  const [p1, p2, p3] = known ? (given as number[]).slice().sort((a, b) => b - a) : [0, 0, 0];
  const S = get(spec.strength);
  const tm = (p1! - p3!) / 2;
  const lo = Math.min(p3!, 0);
  const hi = Math.max(p1!, 0);
  const span = Math.max(hi - lo, 1e-9);
  const roof = Math.max(tm, S !== undefined ? S / 2 : 0);
  const k = Math.min((BW - 70) / span, 200 / Math.max(roof * 1.15, 1e-9));
  const px = (s: number) => BW / 2 + (s - (lo + hi) / 2) * k;
  const axisY = 28 + roof * k * 1.08;
  const BH = axisY + tm * k + 46;
  const circle = (a: number, b: number) => ({ cx: px((a + b) / 2), r: ((a - b) / 2) * k });
  const big = circle(p1!, p3!);
  const sm1 = circle(p1!, p2!);
  const sm2 = circle(p2!, p3!);
  const names = ['σ₁', 'σ₂', 'σ₃'];
  const ids = [spec.s1, spec.s2, spec.s3];
  // Each principal's label, as the page has it.
  const labels = [p1!, p2!, p3!].map((p, i) => {
    const id = ids[given.findIndex((g) => g === p)];
    return {
      x: px(p),
      text: lab(typeof id === 'string' ? id : undefined, names[i]!, p / k0, u) ?? '',
    };
  });
  const parts: string[] = [];
  if (known) {
    parts.push(
      `Sorted: σ₁ = ${fmt(p1! / k0)}, σ₂ = ${fmt(p2! / k0)}, σ₃ = ${fmt(p3! / k0)} ${u}.`,
      `The biggest circle, from σ₃ to σ₁, gives τ_max = (σ₁ − σ₃) ÷ 2 = ${fmt(tm / k0)} ${u}.`,
    );
    if (S !== undefined) {
      const vm = vonMises3(p1!, p2!, p3!);
      parts.push(
        `Tresca: yield when τ_max reaches σ_Y ÷ 2 = ${fmt(S / 2 / k0)} ${u} (the dashed line), n = ${fmt(S / (2 * tm))}. Von Mises: σ_vm = ${fmt(vm / k0)} ${u}, n = ${fmt(S / vm)}.`,
      );
    }
  } else parts.push('The circles wait for the three principal stresses.');
  const tText = lab(spec.tmax, 'τ_max', tm / k0, u);
  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <G transform={`scale(${w / BW})`}>
              {known ? (
                <G>
                  <Circle
                    cx={big.cx}
                    cy={axisY}
                    r={big.r}
                    fill={c.mohrCircle}
                    fillOpacity={0.14}
                    stroke={c.mohrCircle}
                    strokeWidth={2}
                  />
                  <Circle
                    cx={sm1.cx}
                    cy={axisY}
                    r={sm1.r}
                    fill={c.card}
                    stroke={c.mohrCircle}
                    strokeWidth={1.5}
                  />
                  <Circle
                    cx={sm2.cx}
                    cy={axisY}
                    r={sm2.r}
                    fill={c.card}
                    stroke={c.mohrCircle}
                    strokeWidth={1.5}
                  />
                  <Line
                    x1={big.cx}
                    x2={big.cx}
                    y1={axisY}
                    y2={axisY - big.r}
                    stroke={c.mohrCircle}
                    strokeDasharray={chart.dashFine}
                  />
                  <Circle cx={big.cx} cy={axisY - big.r} r={3.5} fill={c.mohrCircle} />
                  {tText ? <HeLabel x={big.cx} y={axisY - big.r - 9} text={tText} w={BW} /> : null}
                </G>
              ) : null}
              {S !== undefined && known ? (
                <G>
                  <Line
                    x1={14}
                    x2={BW - 14}
                    y1={axisY - (S / 2) * k}
                    y2={axisY - (S / 2) * k}
                    stroke={c.mohrEnvelope}
                    strokeWidth={1.6}
                    strokeDasharray={chart.dash}
                  />
                  <HeLabel
                    x={BW - 14}
                    y={axisY - (S / 2) * k - 6}
                    text={`σ_Y ÷ 2 = ${fmt(S / 2 / k0)} ${u}`}
                    anchor="end"
                    color={c.mohrEnvelope}
                    w={BW}
                  />
                </G>
              ) : null}
              <Line
                x1={10}
                x2={BW - 10}
                y1={axisY}
                y2={axisY}
                stroke={c.chartInk}
                strokeWidth={1.2}
              />
              <Path d={`M ${BW - 10} ${axisY} l -7 -4 l 0 8 z`} fill={c.chartInk} />
              <ChartText
                x={BW - 12}
                y={axisY - 6}
                fontSize={chart.label}
                textAnchor="end"
                fontStyle="italic"
              >
                σ
              </ChartText>
              {lo <= 0 && hi >= 0 ? (
                <Line
                  x1={px(0)}
                  x2={px(0)}
                  y1={axisY - roof * k * 1.05}
                  y2={axisY + tm * k}
                  stroke={c.chartMuted}
                />
              ) : null}
              {known ? (
                <G>
                  {labels.map((l) => (
                    <Circle key={l.text} cx={l.x} cy={axisY} r={4} fill={c.chartInk} />
                  ))}
                  {/* σ₁ and σ₃ named outside the big circle; the three values in a row under it. */}
                  <Sym x={labels[0]!.x + 5} y={axisY + 16} text="σ₁" />
                  <Sym x={labels[2]!.x - 5} y={axisY + 16} text="σ₃" anchor="end" />
                  <ChartText
                    x={BW / 2}
                    y={axisY + tm * k + 22}
                    fontSize={chart.label}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {labels.map((l) => l.text).join(' · ')}
                  </ChartText>
                </G>
              ) : null}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{parts.join(' ')}</Caption>
    </View>
  );
}

// ─── Failure loci in the σ_A–σ_B plane ───────────────────────────────────────

const CRITERION_NAME: Record<FailureCriterion, string> = {
  vonMises: 'von Mises',
  tresca: 'Tresca',
  coulombMohr: 'Coulomb–Mohr',
};

function Envelope({ spec, calc }: { spec: StressElementSpec; calc: Calculator }) {
  const c = usePalette();
  const { get, unitOf } = useReader(calc);
  const u = unitOf(spec.strength, spec.sx, spec.s1);
  const k0 = toBase(u);
  const kinds = Array.isArray(spec.envelope) ? spec.envelope : [spec.envelope!];
  const ns = spec.n === undefined ? [] : Array.isArray(spec.n) ? spec.n : [spec.n];
  const sx = get(spec.sx);
  const sy = get(spec.sy);
  const txy = get(spec.txy);
  const m =
    sx !== undefined && sy !== undefined && txy !== undefined ? mohr(sx, sy, txy) : undefined;
  const A = spec.point ? get(spec.point[0]) : (get(spec.s1) ?? m?.s1);
  const B = spec.point ? get(spec.point[1]) : (get(spec.s2) ?? m?.s2);
  // A Coulomb–Mohr locus needs both strengths; one "?" draws none.
  const St =
    spec.strengthC !== undefined && get(spec.strengthC) === undefined
      ? undefined
      : get(spec.strength);
  const Sc = get(spec.strengthC) ?? St;
  const load = A !== undefined && B !== undefined;
  // The load's name sits away from the σ_B axis.
  const loadLeft =
    load &&
    A >= 0 &&
    (A * 236) /
      2 /
      (1.18 * Math.max(Math.abs(St ?? 0), Math.abs(Sc ?? 0), Math.abs(A), Math.abs(B), 1e-9)) >
      50;
  const M = 1.18 * Math.max(St ?? 0, Sc ?? 0, load ? Math.abs(A) : 0, load ? Math.abs(B) : 0, 1e-9);
  const side = 236;
  const ox = BW / 2;
  const oy = 20 + side / 2;
  const k = side / 2 / M;
  const P = (a: number, b: number) => [ox + a * k, oy - b * k] as const;
  const colors = [c.mohrEnvelope, c.mohrCircle, c.stressTrue];
  const BH = oy + side / 2 + 28 + kinds.length * 18 + 8;
  const rows: { text: string; color: string; dashed: boolean }[] = [];
  const parts: string[] = [];
  const shapes = kinds.map((kind, i) => {
    if (St === undefined) return null;
    const pts = locus(kind, St, Sc);
    const color = colors[i % colors.length]!;
    const dashed = i > 0;
    const nWork = load ? safety(kind, A, B, St, Sc) : undefined;
    const nPage = get(ns[i]);
    const n = nPage ?? nWork;
    rows.push({
      text: `${CRITERION_NAME[kind]}${n !== undefined && Number.isFinite(n) ? `: n = ${fmt(n)}` : ''}`,
      color,
      dashed,
    });
    const reach =
      load && nWork !== undefined && Number.isFinite(nWork) ? P(A * nWork, B * nWork) : undefined;
    return (
      <G key={kind}>
        <Path
          d={
            pts
              .map(
                ([a, b], j) => `${j ? 'L' : 'M'} ${P(a, b)[0].toFixed(2)} ${P(a, b)[1].toFixed(2)}`,
              )
              .join(' ') + ' Z'
          }
          stroke={color}
          strokeWidth={2}
          fill={i === 0 ? c.stressArea : 'none'}
          strokeDasharray={dashed ? chart.dash : undefined}
        />
        {reach ? (
          i === 0 ? (
            <Circle
              cx={reach[0]}
              cy={reach[1]}
              r={5}
              fill={c.card}
              stroke={color}
              strokeWidth={2}
            />
          ) : (
            <Rect
              x={reach[0] - 4.5}
              y={reach[1] - 4.5}
              width={9}
              height={9}
              fill={c.card}
              stroke={color}
              strokeWidth={2}
            />
          )
        ) : null}
      </G>
    );
  });
  if (load) {
    parts.push(`The load: σ_A = ${fmt(A / k0)}, σ_B = ${fmt(B / k0)} ${u} (σ₃ = 0 beside them).`);
    if (
      m &&
      sx !== undefined &&
      sy !== undefined &&
      txy !== undefined &&
      kinds.includes('vonMises')
    )
      parts.push(`σ′ = √(σₓ² − σₓσ_y + σ_y² + 3τₓᵧ²) = ${fmt(vonMises2(m.s1, m.s2) / k0)} ${u}.`);
    parts.push(
      'Grow the load along its ray by n and it reaches each locus (the open marks); n > 1 means the load is inside.',
    );
  } else parts.push('The load point waits for the stresses.');
  const far = load
    ? Math.max(
        ...kinds
          .map((kind) => (St === undefined ? 1 : safety(kind, A, B, St, Sc)))
          .filter(Number.isFinite),
        1,
      )
    : 1;
  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <G transform={`scale(${w / BW})`}>
              <Line
                x1={ox - side / 2}
                x2={ox + side / 2 + 6}
                y1={oy}
                y2={oy}
                stroke={c.chartInk}
                strokeWidth={1.2}
              />
              <Line
                x1={ox}
                x2={ox}
                y1={oy + side / 2}
                y2={oy - side / 2 - 6}
                stroke={c.chartInk}
                strokeWidth={1.2}
              />
              <Sym x={ox + side / 2 + 8} y={oy + 4} text="σ_A" />
              <Sym x={ox + 6} y={oy - side / 2 + 2} text="σ_B" />
              {St !== undefined ? (
                <G>
                  <HeLabel
                    x={P(St, 0)[0] + 4}
                    y={oy + 16}
                    text={fmt(St / k0)}
                    anchor="start"
                    w={BW}
                    chip
                  />
                  <HeLabel
                    x={P(-(Sc ?? St), 0)[0] - 4}
                    y={oy + 16}
                    text={`−${fmt((Sc ?? St) / k0)}`}
                    anchor="end"
                    w={BW}
                    chip
                  />
                </G>
              ) : null}
              {shapes}
              {load ? (
                <G>
                  <Line
                    x1={ox}
                    y1={oy}
                    x2={P(A * far, B * far)[0]}
                    y2={P(A * far, B * far)[1]}
                    stroke={c.mohrLoad}
                    strokeDasharray={chart.dashFine}
                    strokeWidth={1.2}
                  />
                  <Circle cx={P(A, B)[0]} cy={P(A, B)[1]} r={5} fill={c.mohrLoad} />
                  <ChartText
                    x={P(A, B)[0] + (loadLeft ? -8 : 8)}
                    y={P(A, B)[1] + (B >= 0 ? -8 : 16)}
                    fontSize={chart.label}
                    fontWeight="bold"
                    textAnchor={loadLeft ? 'end' : 'start'}
                    fill={c.mohrLoad}
                  >
                    load
                  </ChartText>
                </G>
              ) : null}
              {/* The key: each locus and its n. */}
              {rows.map((r, i) => {
                const y = oy + side / 2 + 26 + i * 18;
                return (
                  <G key={r.text}>
                    <Line
                      x1={70}
                      x2={96}
                      y1={y - 4}
                      y2={y - 4}
                      stroke={r.color}
                      strokeWidth={2}
                      strokeDasharray={r.dashed ? chart.dash : undefined}
                    />
                    <ChartText x={104} y={y} fontSize={chart.label} fontWeight="bold">
                      {r.text}
                    </ChartText>
                  </G>
                );
              })}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{parts.join(' ')}</Caption>
    </View>
  );
}

// ─── A soil's circle under the Mohr–Coulomb line ─────────────────────────────

function SoilCircle({ spec, calc }: { spec: StressElementSpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, get, lab, unitOf } = useReader(calc);
  const paint = usePaintIds('light', 'clip');
  const mc = spec.mohrCoulomb!;
  const u = unitOf(spec.s1, spec.s3, mc.c);
  const k0 = toBase(u);
  const s1 = get(spec.s1);
  const s3 = get(spec.s3);
  const coh = get(mc.c);
  const symOf = (x: NumOrVar | undefined, fallback: string) =>
    typeof x === 'string' ? rep.variable(x).symbol : fallback;
  const sym1 = symOf(spec.s1, 'σ′₁');
  const sym3 = symOf(spec.s3, 'σ′₃');
  const phi = get(mc.phi);
  const theta = get(mc.theta) ?? (phi !== undefined ? 45 + phi / 2 : undefined);
  const known = s1 !== undefined && s3 !== undefined;
  const C = known ? (s1 + s3) / 2 : undefined;
  const R = known ? (s1 - s3) / 2 : undefined;
  // The sample on top: σ′₁ down on it, σ′₃ from the sides, the failure plane at θ.
  const ex = BW / 2;
  const ey = 66;
  const hw = 26;
  const hh = 36;
  // The plot under it.
  const top = 142;
  const x0 = 34;
  const x1 = BW - 14;
  const sMax = known ? s1 * 1.1 : 1;
  const k = known ? Math.min((x1 - x0) / sMax, 150 / Math.max(R! * 1.3, 1e-9)) : 1;
  const axisY = top + (known ? Math.max(R! * 1.3, R! + 24 / k) * k : 150);
  const BH = axisY + 40;
  const px = (s: number) => x0 + s * k;
  const py = (t: number) => axisY - t * k;
  const tanP = phi !== undefined ? Math.tan(phi * RAD) : undefined;
  const lineAt = (s: number) => (coh ?? 0) + s * (tanP ?? 0);
  const touch =
    known && phi !== undefined
      ? ([C! - R! * Math.sin(phi * RAD), R! * Math.cos(phi * RAD)] as const)
      : undefined;
  const twoTh = phi !== undefined ? 90 + phi : undefined;
  const dist =
    known && coh !== undefined && phi !== undefined ? lineDistance(C!, coh, phi) : undefined;
  const fails = dist !== undefined && R !== undefined && Math.abs(dist - R) <= 0.005 * R;
  const parts: string[] = [];
  if (known && coh !== undefined && phi !== undefined) {
    parts.push(
      phi === 0
        ? `Undrained: the line is flat at s_u = (σ₁ − σ₃) ÷ 2 = ${fmt(R! / k0)} ${u}, the top of the circle.`
        : `The line τ = c′ + σ′ tan φ′ touches the circle from σ′₃ = ${fmt(s3 / k0)} to σ′₁ = ${fmt(s1 / k0)} ${u}: the soil fails.`,
    );
    if (!fails)
      parts.push(
        dist! > R!
          ? 'Here the circle stays under the line: no failure yet.'
          : 'Here the circle crosses the line: past failure.',
      );
    if (theta !== undefined)
      parts.push(
        `The failure plane is θ = 45° + φ′ ÷ 2 = ${fmt(theta)}° from the major principal plane; 2θ on the circle.`,
      );
  } else parts.push('The circle waits for σ′₃ and σ′₁.');
  const lText = lab(mc.c, phi === 0 ? 's_u' : 'c′', coh !== undefined ? coh / k0 : undefined, u);
  const s1Label = s1 !== undefined ? lab(spec.s1, 'σ′₁', s1 / k0, u) : undefined;
  const s3Label = s3 !== undefined ? lab(spec.s3, 'σ′₃', s3 / k0, u) : undefined;
  // The plane through the sample: from the major principal (horizontal) plane, turned θ.
  const pl = theta !== undefined ? theta * RAD : undefined;
  const half =
    pl !== undefined
      ? Math.min(hw / Math.abs(Math.cos(pl) || 1e-9), hh / Math.abs(Math.sin(pl) || 1e-9))
      : 0;
  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <TopLight id={paint.light} />
              <ClipPath id={paint.clip}>
                <Rect x={x0} y={top - 10} width={x1 - x0} height={axisY - top + 10} />
              </ClipPath>
            </Defs>
            <G transform={`scale(${w / BW})`}>
              {/* The sample, painted soil, with the failure plane across it. */}
              <Rect
                x={ex - hw}
                y={ey - hh}
                width={2 * hw}
                height={2 * hh}
                rx={3}
                fill={c.mohrSoil}
                stroke={c.soilDark}
              />
              <Rect
                x={ex - hw}
                y={ey - hh}
                width={2 * hw}
                height={2 * hh}
                rx={3}
                fill={url(paint.light)}
              />
              {pl !== undefined ? (
                <G>
                  <Line
                    x1={ex - half * Math.cos(pl)}
                    y1={ey + half * Math.sin(pl)}
                    x2={ex + half * Math.cos(pl)}
                    y2={ey - half * Math.sin(pl)}
                    stroke={c.mohrPlane}
                    strokeWidth={2.4}
                  />
                  <Line
                    x1={ex}
                    x2={ex + hw - 2}
                    y1={ey}
                    y2={ey}
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dashFine}
                  />
                  <Path
                    d={arc(ex, ey, 22, 0, -theta!)}
                    stroke={c.mohrPlane}
                    strokeWidth={1.4}
                    fill="none"
                  />
                  <HeLabel
                    x={ex + hw + 30}
                    y={ey - 22}
                    text={lab(mc.theta, 'θ', theta, '°')?.replace(' °', '°') ?? ''}
                    anchor="start"
                    w={BW}
                  />
                </G>
              ) : null}
              {s1 !== undefined ? (
                <G>
                  <Arrow
                    x1={ex}
                    y1={ey - hh - 26}
                    x2={ex}
                    y2={ey - hh - 2}
                    color={c.sectionCompression}
                  />
                  <Arrow
                    x1={ex}
                    y1={ey + hh + 26}
                    x2={ex}
                    y2={ey + hh + 2}
                    color={c.sectionCompression}
                  />
                  <Sym x={ex + 8} y={ey - hh - 12} text={sym1} color={c.sectionCompression} />
                </G>
              ) : null}
              {s3 !== undefined ? (
                <G>
                  <Arrow
                    x1={ex - hw - 24}
                    y1={ey}
                    x2={ex - hw - 2}
                    y2={ey}
                    color={c.sectionCompression}
                    width={1.6}
                  />
                  <Arrow
                    x1={ex + hw + 24}
                    y1={ey}
                    x2={ex + hw + 2}
                    y2={ey}
                    color={c.sectionCompression}
                    width={1.6}
                  />
                  <Sym
                    x={ex - hw - 28}
                    y={ey + 4}
                    text={sym3}
                    anchor="end"
                    color={c.sectionCompression}
                  />
                </G>
              ) : null}
              {/* The plot: σ′ across, τ up. */}
              <Line x1={x0} x2={x1} y1={axisY} y2={axisY} stroke={c.chartInk} strokeWidth={1.2} />
              <Line x1={x0} x2={x0} y1={axisY} y2={top - 8} stroke={c.chartInk} strokeWidth={1.2} />
              <Sym x={x1} y={axisY - 6} text={sym1.includes('′') ? 'σ′' : 'σ'} anchor="end" />
              <Sym x={x0 - 6} y={top} text="τ" anchor="end" />
              {known ? (
                <G>
                  <Path
                    d={`M ${px(s3)} ${axisY} A ${R! * k} ${R! * k} 0 0 1 ${px(s1)} ${axisY}`}
                    stroke={c.mohrCircle}
                    strokeWidth={2}
                    fill={c.mohrCircle}
                    fillOpacity={0.1}
                  />
                  <Circle cx={px(C!)} cy={axisY} r={3} fill={c.mohrCircle} />
                  <Circle cx={px(s3)} cy={axisY} r={4} fill={c.chartInk} />
                  <Circle cx={px(s1)} cy={axisY} r={4} fill={c.chartInk} />
                  {s3Label ? (
                    <HeLabel x={px(s3)} y={axisY + 16} text={s3Label} anchor="end" w={BW} />
                  ) : null}
                  {s1Label ? (
                    <HeLabel x={px(s1)} y={axisY + 16} text={s1Label} anchor="start" w={BW} />
                  ) : null}
                </G>
              ) : null}
              {coh !== undefined && phi !== undefined ? (
                <G clipPath={url(paint.clip)}>
                  <Line
                    x1={px(0)}
                    y1={py(lineAt(0))}
                    x2={px(sMax)}
                    y2={py(lineAt(sMax))}
                    stroke={c.mohrEnvelope}
                    strokeWidth={2}
                  />
                </G>
              ) : null}
              {lText && coh !== undefined ? (
                <HeLabel
                  x={x0 + 8}
                  y={Math.max(top + 4, py(lineAt(100 / k)) - 8)}
                  text={lText}
                  anchor="start"
                  color={c.mohrEnvelope}
                  w={BW}
                />
              ) : null}
              {touch && twoTh !== undefined ? (
                <G>
                  <Line
                    x1={px(C!)}
                    y1={axisY}
                    x2={px(touch[0])}
                    y2={py(touch[1])}
                    stroke={c.mohrPlane}
                    strokeWidth={1.4}
                  />
                  <Circle cx={px(touch[0])} cy={py(touch[1])} r={4} fill={c.mohrPlane} />
                  <Path
                    d={arc(px(C!), axisY, Math.min(22, R! * k * 0.35), 0, -twoTh)}
                    stroke={c.mohrPlane}
                    strokeWidth={1.4}
                    fill="none"
                  />
                  <Sym
                    x={px(C!) + (Math.min(22, R! * k * 0.35) + 8) * Math.cos((twoTh / 2) * RAD) + 4}
                    y={axisY - (Math.min(22, R! * k * 0.35) + 8) * Math.sin((twoTh / 2) * RAD)}
                    text="2θ"
                    color={c.mohrPlane}
                  />
                </G>
              ) : null}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{parts.join(' ')}</Caption>
    </View>
  );
}
