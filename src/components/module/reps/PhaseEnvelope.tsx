/**
 * A binary's phase diagram (HC8, `phaseEnvelope`; ACC-P30, C-P8), flat like a graph: `Pxy` and
 * `Txy` here, `xy` (equilibrium curve, operating lines, McCabe–Thiele stairs) in
 * PhaseEnvelopeXy.tsx. Every curve is computed from the page's values (Raoult's law, Margules,
 * Antoine); a value still "?" draws nothing of its own.
 */
import { useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { PhaseEnvelopeSpec } from '@/data/modules/typesHe1i';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle } from './common';
import { Frame, KeyItem, poly, sig, ticks, useReadSpec } from './phaseEnvelopeKit';
import { PhaseEnvelopeXy } from './PhaseEnvelopeXy';
import {
  antoineP,
  bisect,
  boilingT,
  bubbleP,
  bubbleT,
  dewP,
  dewT,
  margules,
  tieAt,
} from './phaseEnvelopeMath';

type Pt = [number, number];
type PxySpec = Extract<PhaseEnvelopeSpec, { mode: 'Pxy' }>;
type TxySpec = Extract<PhaseEnvelopeSpec, { mode: 'Txy' }>;

export function PhaseEnvelope({ spec, calc }: { spec: PhaseEnvelopeSpec; calc: Calculator }) {
  switch (spec.mode) {
    case 'Pxy':
      return <Pxy spec={spec} calc={calc} />;
    case 'Txy':
      return <Txy spec={spec} calc={calc} />;
    case 'xy':
      return <PhaseEnvelopeXy spec={spec} calc={calc} />;
  }
}

/** The names of the two components, the more volatile first. */
const namesOf = (names?: [string, string]) => names ?? ['A', 'B'];

/** The curves of a binary as (x₁ or y₁, level) lists, from the bubble level at each x₁. */
function envelope(at: (x1: number) => { level: number; y1: number }, n = 60) {
  const bubble: Pt[] = [];
  const dew: Pt[] = [];
  for (let k = 0; k <= n; k++) {
    const x1 = k / n;
    const { level, y1 } = at(x1);
    bubble.push([x1, level]);
    dew.push([y1, level]);
  }
  return { bubble, dew };
}

/**
 * The tie line and its labels, shared by Pxy and Txy: the liquid dot on the bubble curve, the
 * vapor dot on the dew curve, each dropped to the axis, and the level written at the left.
 */
function TieLine({
  c,
  sx,
  sy,
  b,
  l,
  x1,
  y1,
  level,
  levelText,
  xText,
  yText,
  r,
  flip = false,
  avoid,
}: {
  c: Palette;
  sx: (x: number) => number;
  sy: (y: number) => number;
  b: number;
  l: number;
  /** The plot's right edge: the y₁ label turns back inside it. */
  r: number;
  /** Txy: x₁ below the line, y₁ above it. */
  flip?: boolean;
  /** A centred label on the line (z₁) the x₁ label keeps clear of. */
  avoid?: { x: number; y: number; w: number };
  x1: number;
  y1: number;
  level: number;
  levelText: string;
  xText: string;
  yText: string;
}) {
  const yy = sy(level);
  const [ax, bx] = [sx(x1), sx(y1)];
  // Labels go on the far side of each dot from the other one, so they never meet; `flip`
  // (Txy, where the curves fall to the right) puts x₁ under the line and y₁ over it, in the
  // open liquid and vapor regions.
  const xLeft = x1 <= y1;
  const wide = (s: string, size: number) => [...s].length * size * 0.6;
  const level0 = { x0: l + 4, x1: l + 4 + wide(levelText, chart.label), y: yy - 6 };
  // The y₁ label turns back toward the liquid dot where it would run past the plot's edge.
  const wy = wide(yText, chart.value);
  const yOut = xLeft ? bx + 8 + wy > r - 2 : bx - 8 - wy < l + 2;
  const yToLeft = xLeft === yOut;
  const yAt = { x: bx + (yToLeft ? -8 : 8), y: flip ? yy - 9 : yy + 18 };
  // The x₁ label: beside its dot, lifted a row where it would meet the level text or z₁.
  const wx = wide(xText, chart.value);
  const xx = ax + (xLeft ? -8 : 8);
  const [xa0, xa1] = xLeft ? [xx - wx, xx] : [xx, xx + wx];
  const hits = (y: number, box: { x0: number; x1: number; y: number }, size: number) =>
    xa0 < box.x1 + 4 && xa1 > box.x0 - 4 && Math.abs(y - box.y) < size + 2;
  const zBox =
    avoid === undefined
      ? undefined
      : { x0: avoid.x - avoid.w / 2, x1: avoid.x + avoid.w / 2, y: avoid.y };
  let xy = flip ? yy + 18 : yy - 9;
  if (!flip && (hits(xy, level0, chart.value) || (zBox && hits(xy, zBox, chart.value))))
    xy = yy - 27;
  return (
    <G>
      <Line
        x1={ax}
        y1={yy}
        x2={ax}
        y2={b}
        stroke={c.chartHighlight}
        strokeDasharray={chart.dashFine}
      />
      <Line x1={bx} y1={yy} x2={bx} y2={b} stroke={c.fnSecond} strokeDasharray={chart.dashFine} />
      <Line
        x1={l}
        y1={yy}
        x2={Math.min(ax, bx)}
        y2={yy}
        stroke={c.chartMuted}
        strokeDasharray={chart.dashFine}
      />
      <Line x1={ax} y1={yy} x2={bx} y2={yy} stroke={c.chartInk} strokeWidth={chart.stroke} />
      <Circle cx={ax} cy={yy} r={5} fill={c.chartHighlight} />
      <Circle cx={bx} cy={yy} r={5} fill={c.fnSecond} />
      <ChartText
        x={xx}
        y={xy}
        textAnchor={xLeft ? 'end' : 'start'}
        fontSize={chart.value}
        fontWeight="700"
        fill={c.chartHighlight}
        halo
      >
        {xText}
      </ChartText>
      <ChartText
        x={yAt.x}
        y={yAt.y}
        textAnchor={yToLeft ? 'end' : 'start'}
        fontSize={chart.value}
        fontWeight="700"
        fill={c.fnSecond}
        halo
      >
        {yText}
      </ChartText>
      <ChartText x={l + 4} y={yy - 6} fontSize={chart.label} fontWeight="700" halo>
        {levelText}
      </ChartText>
    </G>
  );
}

/** Where TieLine draws the y₁ label (its box), so other labels can keep clear of it. */
function yLabelBox(
  sx: (x: number) => number,
  sy: (y: number) => number,
  l: number,
  r: number,
  x1: number,
  y1: number,
  level: number,
  yText: string,
  flip = false,
) {
  const bx = sx(y1);
  const wy = [...yText].length * chart.value * 0.6;
  const xLeft = x1 <= y1;
  const yOut = xLeft ? bx + 8 + wy > r - 2 : bx - 8 - wy < l + 2;
  const toLeft = xLeft === yOut;
  const x0 = toLeft ? bx - 8 - wy : bx + 8;
  return { x0, x1: x0 + wy, y: flip ? sy(level) - 9 : sy(level) + 18 };
}

/** The plot rectangle inside a canvas w × h, room left for the key, the ticks and the names. */
const plotBox = (w: number, h: number) => ({ l: 52, r: w - 14, t: 58, b: h - 42 });

function Pxy({ spec, calc }: { spec: PxySpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, read } = useReadSpec(calc);
  const [n1, n2] = namesOf(spec.names);
  const unit = spec.unit ?? 'mmHg';
  const [P1, P2] = [read(spec.p1), read(spec.p2)];
  const A = spec.margules === undefined ? undefined : read(spec.margules);
  const T = spec.T === undefined ? undefined : read(spec.T);
  const curves = P1.known && P2.known && P1.value > 0 && P2.value > 0 && (!A || A.known);
  const a = A?.known ? A.value : 0;
  const ideal = a === 0;
  const tie =
    spec.tie ?? (spec.z !== undefined ? 'flash' : spec.x !== undefined ? 'bubble' : 'dew');
  const X = read(spec.x);
  const Y = read(spec.y);
  const PP = read(spec.P);
  const Z = read(spec.z);
  const VF = read(spec.vf, 3);
  // The tie line, from the value that sets it.
  let tieLine: { x1: number; y1: number; P: number } | undefined;
  let why: string | undefined;
  if (curves) {
    const [p1, p2] = [P1.value, P2.value];
    if (tie === 'bubble' && X.known) {
      if (X.value < 0 || X.value > 1) why = `x₁ = ${X.text} is not a mole fraction (0 to 1).`;
      else {
        const r = bubbleP(X.value, p1, p2, a);
        tieLine = { x1: X.value, y1: r.y1, P: r.P };
      }
    } else if (tie === 'dew' && Y.known) {
      if (Y.value < 0 || Y.value > 1) why = `y₁ = ${Y.text} is not a mole fraction (0 to 1).`;
      else {
        const r = dewP(Y.value, p1, p2);
        tieLine = { x1: r.x1, y1: Y.value, P: r.P };
      }
    } else if (tie === 'flash' && PP.known) {
      const r = tieAt(PP.value, p1, p2);
      if (r.x1 < 0 || r.x1 > 1)
        why = `At ${PP.text} ${unit} the mixture is all ${PP.value > Math.max(p1, p2) ? 'liquid' : 'vapor'}: P lies outside P₂ˢᵃᵗ to P₁ˢᵃᵗ, so there is no tie line.`;
      else tieLine = { x1: r.x1, y1: r.y1, P: PP.value };
    }
  }
  const env = curves
    ? envelope((x1) => {
        const r = bubbleP(x1, P1.value, P2.value, a);
        return { level: r.P, y1: r.y1 };
      })
    : undefined;
  const levels = env ? env.bubble.map(([, p]) => p) : [0, 1];
  const [lo0, hi0] = [Math.min(...levels), Math.max(...levels)];
  const { step } = ticks(lo0, hi0, 5);
  const lo = Math.max(0, Math.floor((lo0 - 0.4 * step) / step) * step);
  const hi = Math.ceil((hi0 + 0.6 * step) / step) * step;
  const xTyped = typeof spec.x === 'string' && tie === 'bubble' && rep.typed(spec.x);
  const start = useRef(0);
  const z = tie === 'flash' && Z.known && tieLine ? Z.value : undefined;
  const zInside =
    z !== undefined && tieLine
      ? z >= Math.min(tieLine.x1, tieLine.y1) && z <= Math.max(tieLine.x1, tieLine.y1)
      : false;

  // P₁ˢᵃᵗ is written over the curves' right end, or under it where the y₁ label is there.
  const p1Y = (sx: (x: number) => number, sy: (p: number) => number, l: number, r: number) => {
    const above = sy(P1.value) - 8;
    if (!tieLine) return above;
    const yb = yLabelBox(
      sx,
      sy,
      l,
      r,
      tieLine.x1,
      tieLine.y1,
      tieLine.P,
      `y₁ = ${Y.known ? Y.text : sig(tieLine.y1)}`,
    );
    const w1 = [...`P₁ˢᵃᵗ = ${P1.text}`].length * chart.label * 0.6;
    const meets = yb.x1 > sx(1) - 4 - w1 - 4 && Math.abs(yb.y - above) < chart.value + 2;
    return meets ? sy(P1.value) + 16 : above;
  };
  const art = (w: number, h: number) => {
    const { l, r, t, b } = plotBox(w, h);
    const sx = (x: number) => l + x * (r - l);
    const sy = (p: number) => b - ((p - lo) / (hi - lo)) * (b - t);
    const toPx = (ps: Pt[]) => ps.map(([x, p]): Pt => [sx(x), sy(p)]);
    const bubble = env ? toPx(env.bubble) : [];
    const dew = env ? toPx(env.dew) : [];
    const ys = ticks(lo, hi, 5).out.filter((v) => v >= lo && v <= hi);
    return (
      <>
        <Svg width={w} height={h}>
          {env ? (
            <G>
              {/* Vapor below the dew curve, liquid above the bubble curve, both between. */}
              <Rect x={l} y={t} width={r - l} height={b - t} fill={c.phaseGas} />
              <Path d={`${poly(bubble)} L ${r} ${t} L ${l} ${t} Z`} fill={c.phaseLiquid} />
              <Path
                d={`${poly(bubble)} ${poly([...dew].reverse()).replace('M', 'L')} Z`}
                fill={c.chartSurface}
              />
            </G>
          ) : null}
          <Frame
            c={c}
            l={l}
            r={r}
            t={t}
            b={b}
            xs={[0, 0.2, 0.4, 0.6, 0.8, 1]}
            ys={ys}
            sx={sx}
            sy={sy}
            xName={`x₁ or y₁ (mole fraction of ${n1})`}
            yName={`P (${unit})`}
          />
          {env ? (
            <G>
              {!ideal ? (
                <Line
                  x1={sx(0)}
                  y1={sy(P2.value)}
                  x2={sx(1)}
                  y2={sy(P1.value)}
                  stroke={c.chartMuted}
                  strokeWidth={1.5}
                  strokeDasharray={chart.dash}
                />
              ) : null}
              <Path
                d={poly(bubble)}
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
                fill="none"
              />
              <Path d={poly(dew)} stroke={c.fnSecond} strokeWidth={chart.stroke} fill="none" />
              <ChartText x={l + 8} y={t + 16} fontSize={chart.value} fontWeight="700">
                Liquid
              </ChartText>
              <ChartText
                x={r - 8}
                y={b - 10}
                textAnchor="end"
                fontSize={chart.value}
                fontWeight="700"
              >
                Vapor
              </ChartText>
              <ChartText
                x={sx(1) - 4}
                y={p1Y(sx, sy, l, r)}
                textAnchor="end"
                fontSize={chart.label}
                halo
              >
                {`P₁ˢᵃᵗ = ${P1.text}`}
              </ChartText>
              <ChartText x={sx(0) + 4} y={sy(P2.value) + 16} fontSize={chart.label} halo>
                {`P₂ˢᵃᵗ = ${P2.text}`}
              </ChartText>
            </G>
          ) : null}
          {tieLine ? (
            <TieLine
              c={c}
              sx={sx}
              sy={sy}
              b={b}
              l={l}
              x1={tieLine.x1}
              y1={tieLine.y1}
              level={tieLine.P}
              levelText={`P = ${PP.known ? PP.text : sig(tieLine.P, 4)} ${unit}`}
              xText={`x₁ = ${X.known ? X.text : sig(tieLine.x1)}`}
              yText={`y₁ = ${Y.known ? Y.text : sig(tieLine.y1)}`}
              r={r}
              avoid={
                z !== undefined
                  ? {
                      x: sx(z),
                      y: sy(tieLine.P) - 10,
                      w: [...`z₁ = ${Z.text}`].length * chart.value * 0.6,
                    }
                  : undefined
              }
            />
          ) : null}
          {tieLine && z !== undefined ? (
            <G opacity={zInside ? 1 : 0.4}>
              <Circle
                cx={sx(z)}
                cy={sy(tieLine.P)}
                r={5.5}
                fill={c.card}
                stroke={c.chartInk}
                strokeWidth={2}
              />
              <ChartText
                x={sx(z)}
                y={sy(tieLine.P) - 10}
                textAnchor="middle"
                fontSize={chart.value}
                fontWeight="700"
                halo
              >
                {`z₁ = ${Z.text}`}
              </ChartText>
            </G>
          ) : null}
          <KeyItem x={8} y={16} color={c.chartHighlight} text="Bubble (liquid)" />
          <KeyItem x={Math.max(170, w / 2)} y={16} color={c.fnSecond} text="Dew (vapor)" />
          {!ideal ? (
            <KeyItem x={8} y={34} color={c.chartMuted} dash={chart.dash} text="Raoult’s law" />
          ) : null}
        </Svg>
        {xTyped && tieLine && typeof spec.x === 'string' ? (
          <DragHandle
            x={sx(tieLine.x1)}
            y={sy(tieLine.P)}
            label="the liquid mole fraction"
            onStart={() => {
              start.current = tieLine!.x1;
            }}
            onMove={(dx) => {
              const nx = Math.min(0.999, Math.max(0.001, start.current + dx / (r - l)));
              calc.set(
                { [spec.x as string]: rep.snapTo(spec.x as string, nx) },
                rep.slide(spec.x as string),
              );
            }}
          />
        ) : null}
      </>
    );
  };

  const at = T?.known ? ` at ${T.text} °C` : '';
  const lines: string[] = [];
  if (!curves)
    lines.push(
      A && !A.known
        ? 'Type A to draw the curves.'
        : `Type P₁ˢᵃᵗ and P₂ˢᵃᵗ to draw the bubble and dew curves${at}.`,
    );
  else {
    lines.push(
      `Pxy diagram of ${n1}–${n2}${at}: the bubble curve runs from P₂ˢᵃᵗ = ${P2.text} to P₁ˢᵃᵗ = ${P1.text} ${unit}, the dew curve under it; between them liquid and vapor coexist.`,
    );
    if (!ideal) {
      const g = tieLine ? margules(a, tieLine.x1) : undefined;
      lines.push(
        `Margules A = ${A!.text}: ln γ₁ = A x₂², ln γ₂ = A x₁²${g ? `, so γ₁ = ${sig(g[0])} and γ₂ = ${sig(g[1])} at x₁ = ${X.text}` : ''}. ${a > 0 ? 'The curves bulge above Raoult’s straight line (positive deviation).' : 'The curves sag below Raoult’s straight line (negative deviation).'}`,
      );
      // An azeotrope: inside 0 < x₁ < 1 the vapor matches the liquid (y₁ = x₁) and the curves touch.
      const gap = (x1: number) => bubbleP(x1, P1.value, P2.value, a).y1 - x1;
      const azeo = env!.bubble
        .slice(1, -2)
        .map(([x1]) => x1)
        .find((x1) => gap(x1) * gap(x1 + 1 / 60) < 0);
      if (azeo !== undefined) {
        const xa = bisect(gap, azeo, azeo + 1 / 60) ?? azeo;
        lines.push(
          `The curves touch at an azeotrope, x₁ = y₁ = ${sig(xa)} and P = ${sig(bubbleP(xa, P1.value, P2.value, a).P, 4)} ${unit}: there the vapor matches the liquid, so distilling can’t pass it.`,
        );
      }
    }
    if (why) lines.push(why);
    else if (tieLine) {
      const [x, y, p] = [tieLine.x1, tieLine.y1, tieLine.P];
      const pText = PP.known ? PP.text : sig(p, 4);
      if (tie === 'bubble' && ideal)
        lines.push(
          `P = x₁P₁ˢᵃᵗ + (1 − x₁)P₂ˢᵃᵗ = ${X.text} × ${P1.text} + ${sig(1 - x, 4)} × ${P2.text} = ${pText} ${unit}.`,
          `y₁ = x₁P₁ˢᵃᵗ ÷ P = ${Y.known ? Y.text : sig(y)}: the vapor is richer in ${n1}, the more volatile.`,
        );
      else if (tie === 'bubble')
        lines.push(
          `P = x₁γ₁P₁ˢᵃᵗ + x₂γ₂P₂ˢᵃᵗ = ${sig(p, 4)} ${unit}, y₁ = ${sig(y)} at x₁ = ${X.text}.`,
        );
      else if (tie === 'dew')
        lines.push(
          `1 ÷ P = y₁ ÷ P₁ˢᵃᵗ + (1 − y₁) ÷ P₂ˢᵃᵗ, so P = ${pText} ${unit}: the dew point of vapor y₁ = ${Y.text}, its first drop of liquid x₁ = ${sig(x)}.`,
        );
      else {
        lines.push(
          `At P = ${pText} ${unit}: x₁ = (P − P₂ˢᵃᵗ) ÷ (P₁ˢᵃᵗ − P₂ˢᵃᵗ) = ${sig(x)}, y₁ = ${sig(y)}.`,
        );
        if (z !== undefined)
          lines.push(
            zInside
              ? `Lever rule: V ÷ F = (z₁ − x₁) ÷ (y₁ − x₁) = ${VF.known ? VF.text : sig((z - x) / (y - x))}, the feed’s distance from the liquid end over the tie line’s length.`
              : `z₁ = ${Z.text} lies off the tie line: at this P the feed is all ${z < Math.min(x, y) ? 'liquid' : 'vapor'}, so no flash.`,
          );
      }
    } else lines.push('Type a mole fraction to draw the tie line.');
  }

  return (
    <View>
      <Canvas aspect={(w) => Math.min(1.1, 350 / w)}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

function Txy({ spec, calc }: { spec: TxySpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, read } = useReadSpec(calc);
  const [n1, n2] = namesOf(spec.names);
  const [a1, a2] = spec.antoine;
  const PP = read(spec.P);
  const X = read(spec.x);
  const Y = read(spec.y);
  const TT = read(spec.T);
  const tie = spec.tie ?? (spec.x !== undefined ? 'bubble' : 'dew');
  const curves = PP.known && PP.value > 0;
  const P = PP.value;
  const env = curves
    ? envelope((x1) => {
        const r = bubbleT(x1, P, a1, a2);
        return { level: r?.T ?? NaN, y1: r?.y1 ?? NaN };
      })
    : undefined;
  let tieLine: { x1: number; y1: number; T: number } | undefined;
  let why: string | undefined;
  if (curves && tie === 'bubble' && X.known) {
    const r = X.value >= 0 && X.value <= 1 ? bubbleT(X.value, P, a1, a2) : undefined;
    if (r) tieLine = { x1: X.value, y1: r.y1, T: r.T };
    else why = `x₁ = ${X.text} is not a mole fraction (0 to 1).`;
  } else if (curves && tie === 'dew' && Y.known) {
    const r = Y.value >= 0 && Y.value <= 1 ? dewT(Y.value, P, a1, a2) : undefined;
    if (r) tieLine = { x1: r.x1, y1: Y.value, T: r.T };
    else why = `y₁ = ${Y.text} is not a mole fraction (0 to 1).`;
  }
  const [t1, t2] = curves ? [boilingT(a1, P), boilingT(a2, P)] : [0, 100];
  const { step } = ticks(Math.min(t1, t2), Math.max(t1, t2), 5);
  const lo = Math.floor((Math.min(t1, t2) - 0.5 * step) / step) * step;
  const hi = Math.ceil((Math.max(t1, t2) + 0.5 * step) / step) * step;
  const xTyped = typeof spec.x === 'string' && tie === 'bubble' && rep.typed(spec.x);
  const start = useRef(0);

  const art = (w: number, h: number): ReactNode => {
    const { l, r, t, b } = plotBox(w, h);
    const sx = (x: number) => l + x * (r - l);
    const sy = (T: number) => b - ((T - lo) / (hi - lo)) * (b - t);
    const toPx = (ps: Pt[]) =>
      ps
        .filter(([x, T]) => Number.isFinite(x) && Number.isFinite(T))
        .map(([x, T]): Pt => [sx(x), sy(T)]);
    const bubble = env ? toPx(env.bubble) : [];
    const dew = env ? toPx(env.dew) : [];
    const ys = ticks(lo, hi, 5).out.filter((v) => v >= lo && v <= hi);
    return (
      <>
        <Svg width={w} height={h}>
          {env ? (
            <G>
              {/* Liquid under the bubble curve, vapor over the dew curve, both between. */}
              <Rect x={l} y={t} width={r - l} height={b - t} fill={c.phaseGas} />
              <Path d={`${poly(bubble)} L ${r} ${b} L ${l} ${b} Z`} fill={c.phaseLiquid} />
              <Path
                d={`${poly(bubble)} ${poly([...dew].reverse()).replace('M', 'L')} Z`}
                fill={c.chartSurface}
              />
            </G>
          ) : null}
          <Frame
            c={c}
            l={l}
            r={r}
            t={t}
            b={b}
            xs={[0, 0.2, 0.4, 0.6, 0.8, 1]}
            ys={ys}
            sx={sx}
            sy={sy}
            xName={`x₁ or y₁ (mole fraction of ${n1})`}
            yName="T (°C)"
          />
          {env ? (
            <G>
              <Path
                d={poly(bubble)}
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
                fill="none"
              />
              <Path d={poly(dew)} stroke={c.fnSecond} strokeWidth={chart.stroke} fill="none" />
              <ChartText
                x={r - 8}
                y={t + 16}
                textAnchor="end"
                fontSize={chart.value}
                fontWeight="700"
              >
                Vapor
              </ChartText>
              <ChartText x={l + 8} y={b - 10} fontSize={chart.value} fontWeight="700">
                Liquid
              </ChartText>
            </G>
          ) : null}
          {tieLine ? (
            <TieLine
              c={c}
              sx={sx}
              sy={sy}
              b={b}
              l={l}
              x1={tieLine.x1}
              y1={tieLine.y1}
              level={tieLine.T}
              levelText={`T = ${TT.known ? TT.text : sig(tieLine.T, 4)} °C`}
              xText={`x₁ = ${X.known ? X.text : sig(tieLine.x1)}`}
              yText={`y₁ = ${Y.known ? Y.text : sig(tieLine.y1)}`}
              r={r}
              flip
            />
          ) : null}
          <KeyItem x={8} y={16} color={c.chartHighlight} text="Bubble (liquid)" />
          <KeyItem x={Math.max(170, w / 2)} y={16} color={c.fnSecond} text="Dew (vapor)" />
        </Svg>
        {xTyped && tieLine && typeof spec.x === 'string' ? (
          <DragHandle
            x={sx(tieLine.x1)}
            y={sy(tieLine.T)}
            label="the liquid mole fraction"
            onStart={() => {
              start.current = tieLine!.x1;
            }}
            onMove={(dx) => {
              const nx = Math.min(0.999, Math.max(0.001, start.current + dx / (r - l)));
              calc.set(
                { [spec.x as string]: rep.snapTo(spec.x as string, nx) },
                rep.slide(spec.x as string),
              );
            }}
          />
        ) : null}
      </>
    );
  };

  const lines: string[] = [];
  if (!curves) lines.push('Type the pressure to draw the bubble and dew curves.');
  else {
    lines.push(
      `Txy diagram of ${n1}–${n2} at ${PP.text} mmHg: pure ${n1} boils at ${sig(t1, 4)} °C and pure ${n2} at ${sig(t2, 4)} °C (Antoine); the dew curve lies over the bubble curve.`,
    );
    if (why) lines.push(why);
    else if (tieLine) {
      const p1 = antoineP(a1, tieLine.T);
      lines.push(
        tie === 'bubble'
          ? `Liquid x₁ = ${X.text} starts to boil at T = ${TT.known ? TT.text : sig(tieLine.T, 4)} °C, where x₁P₁ˢᵃᵗ + (1 − x₁)P₂ˢᵃᵗ = P; its first vapor has y₁ = x₁P₁ˢᵃᵗ ÷ P = ${sig(tieLine.y1)} (P₁ˢᵃᵗ = ${sig(p1, 4)} mmHg).`
          : `Vapor y₁ = ${Y.text} starts to condense at T = ${TT.known ? TT.text : sig(tieLine.T, 4)} °C; its first drop has x₁ = ${sig(tieLine.x1)}.`,
      );
    } else lines.push('Type a mole fraction to draw the tie line.');
  }

  return (
    <View>
      <Canvas aspect={(w) => Math.min(1.1, 350 / w)}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
