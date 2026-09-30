import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { RotorSpec } from '@/data/modules/typesHs3a';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, niceCeil } from './common';
import { num } from './CircularSatellite';
import { CurvedArrow, onCircle, useReader } from './hs3aKit';
import { inertiaOf, spinUpOf, steadyOf } from './hs3aMath';
import { spanWindow, SubLabel, Vec } from './hskKit';
import { Ball, Metal, url, usePaintIds } from './paint';

/** The three shapes the pages name, by their factor c in I = cmr². */
const SHAPES = [
  { c: 1, name: 'hoop', half: 'Hoop' },
  { c: 0.5, name: 'solid disk', half: 'Solid disk' },
  { c: 0.4, name: 'solid ball', half: 'Solid ball' },
] as const;
type Shape = 'hoop' | 'disk' | 'ball' | 'wheel';
const shapeOf = (c: number | undefined): Shape =>
  c === undefined ? 'wheel' : c > 0.75 ? 'hoop' : c > 0.45 ? 'disk' : 'ball';
const nameOf = (c: number) => SHAPES.find((s) => Math.abs(s.c - c) < 1e-9)?.name;
/** c as the pages write it: 1, ½, 0.4. */
const cText = (c: number) => (Math.abs(c - 0.5) < 1e-9 ? '½' : num(c));

/** Turn dials drawn: two rows at most, then each dial counts more turns. */
const MAX_DIALS = 20;

/**
 * A body turning about its center (H107): a hoop, solid disk or solid ball by its shape factor
 * (or a spoked wheel), the radius r, ω as a curved arrow (ω₀ dashed inside it), the torque as a
 * curved arrow at the rim, the rim speed v = rω along the tangent; the three shapes side by side
 * with I = cmr² and α = τ/I; an ω–t line whose area is the angle swept; and the turns
 * n = Δθ/2π as dials, whole turns full and the last part a slice.
 */
export function Rotor({ spec, calc }: { spec: RotorSpec; calc: Calculator }) {
  const c = usePalette();
  const { v, all, text, unit } = useReader(calc);
  const ids = usePaintIds('metal', 'hub', 'ball');
  const has = (x: unknown) => x !== undefined;
  const cf = has(spec.shape) ? v(spec.shape, 0.5) : undefined;
  const shape = shapeOf(cf);
  const [m, r] = [v(spec.mass, 1), Math.max(0, v(spec.radius, 1))];
  const I = cf !== undefined && has(spec.mass) ? inertiaOf(cf, m, r) : v(spec.inertia, NaN);
  const tau = has(spec.torque) ? v(spec.torque) : undefined;
  const alpha = has(spec.acceleration)
    ? v(spec.acceleration)
    : tau !== undefined && I > 0
      ? tau / I
      : undefined;
  const spin = has(spec.start) && has(spec.time);
  const w0 = v(spec.start);
  const t = Math.max(0, v(spec.time));
  const up = spinUpOf(w0, alpha ?? 0, t);
  const steady = has(spec.rpm) ? steadyOf(v(spec.rpm), r) : undefined;
  const w = spin ? up.speed : has(spec.speed) ? v(spec.speed) : (steady?.w ?? 0);
  const turns = spin ? up.turns : undefined;
  const compare = !!spec.compare && tau !== undefined && has(spec.mass) && has(spec.radius);
  const [uI, uT, uW] = [
    unit(spec.inertia, 'kg·m²'),
    unit(spec.torque, 'N·m'),
    unit(spec.speed, 'rad/s'),
  ];
  const uA = unit(spec.acceleration, 'rad/s²');
  const ready = all(
    spec.shape,
    spec.mass,
    spec.radius,
    spec.torque,
    spec.start,
    spec.time,
    spec.rpm,
    typeof spec.acceleration === 'string' && !has(spec.torque) ? spec.acceleration : undefined,
  );
  const top = 250;
  const extra = (compare ? 128 : 0) + (spin ? 196 : 0);

  return (
    <View>
      <Canvas aspect={(W) => (top + extra) / W}>
        {({ w: W, h }) => {
          const R = Math.min(64, W * 0.17);
          const cx = Math.max(W * 0.26, R + 46);
          const cy = 128;
          const wBig = Math.max(1e-9, Math.abs(w0), Math.abs(w));
          const sweep = (x: number) => (1.35 * Math.PI * x) / wBig;
          const rimAt = onCircle(cx, cy, R, Math.PI / 2);
          const rLabel = onCircle(cx, cy, R * 0.55, -Math.PI / 5);
          const sideX = cx + R + 46;
          return (
            <Svg width={W} height={h}>
              <Defs>
                <Metal id={ids.metal} light={c.metal} dark={c.metalDark} />
                <Metal id={ids.hub} light={c.metal} dark={c.metalDark} />
                <Ball id={ids.ball} color={c.metal} />
              </Defs>
              <G opacity={ready ? 1 : 0.45}>
                {drawBody(cx, cy, R, shape)}
                {/* The radius, and a mark on the rim. */}
                <Line
                  x1={cx}
                  y1={cy}
                  x2={cx + R * Math.cos(-Math.PI / 5)}
                  y2={cy - R * Math.sin(-Math.PI / 5)}
                  stroke={c.chartInk}
                  strokeWidth={2}
                />
                <Circle cx={cx} cy={cy} r={4} fill={c.chartInk} />
                <SubLabel
                  x={rLabel.x + 6}
                  y={rLabel.y + 18}
                  text={`r = ${text(spec.radius, r, 'm')}`}
                  anchor="start"
                  size={chart.label}
                  w={W}
                />
                <Circle cx={rimAt.x} cy={rimAt.y} r={5} fill={c.forceNet} />
                {/* ω (and ω₀ dashed inside it), as long as how fast it turns. */}
                {spin ? (
                  <CurvedArrow
                    cx={cx}
                    cy={cy}
                    r={R + 12}
                    from={Math.PI * 1.1}
                    to={Math.PI * 1.1 + sweep(w0)}
                    color={c.chartHighlight}
                    width={2}
                    dash="5 4"
                  />
                ) : null}
                <CurvedArrow
                  cx={cx}
                  cy={cy}
                  r={R + (spin ? 24 : 14)}
                  from={Math.PI * 1.1}
                  to={Math.PI * 1.1 + sweep(w)}
                  color={c.chartHighlight}
                />
                {/* The torque at the rim. */}
                {tau !== undefined ? (
                  <CurvedArrow
                    cx={cx}
                    cy={cy}
                    r={R + (spin ? 36 : 28)}
                    from={-Math.PI * 0.35}
                    to={-Math.PI * 0.35 + Math.sign(tau || 1) * 0.55 * Math.PI}
                    color={c.forceApplied}
                    width={3}
                  />
                ) : null}
                {/* The rim speed along the tangent (turning counterclockwise: to the left). */}
                {spec.rim ? (
                  <G>
                    <Vec
                      x1={rimAt.x}
                      y1={rimAt.y}
                      x2={rimAt.x - Math.sign(w || 1) * 64}
                      y2={rimAt.y}
                      color={c.forceNet}
                    />
                    <SubLabel
                      x={rimAt.x - Math.sign(w || 1) * 40}
                      y={rimAt.y - 10}
                      text={`v = ${text(spec.rim, r * w, 'm/s')}`}
                      color={c.forceNet}
                      w={W}
                    />
                  </G>
                ) : null}
                {/* The values beside it. */}
                {sideLines().map(([label, color], i) => (
                  <SubLabel
                    key={label}
                    x={Math.min(sideX, W - 8)}
                    y={50 + i * 26}
                    text={label}
                    anchor="start"
                    color={color}
                    w={W}
                  />
                ))}
                {compare ? drawCompare(W, top) : null}
                {spin ? drawSpin(W, top + (compare ? 128 : 0)) : null}
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{captionLines().join(' · ')}</Caption>
    </View>
  );

  /** The labels beside the body, each [text, color]. */
  function sideLines(): [string, string][] {
    const out: [string, string][] = [];
    if (cf !== undefined)
      out.push([`c = ${text(spec.shape, cf)}${nameOf(cf) ? ` (${nameOf(cf)})` : ''}`, c.chartInk]);
    if (has(spec.mass)) out.push([`m = ${text(spec.mass, m, 'kg')}`, c.chartInk]);
    if (Number.isFinite(I) && (has(spec.inertia) || cf !== undefined))
      out.push([`I = ${text(spec.inertia, I, uI)}`, c.chartInk]);
    if (tau !== undefined) out.push([`τ = ${text(spec.torque, tau, uT)}`, c.forceApplied]);
    if (alpha !== undefined && !spin)
      out.push([`α = ${text(spec.acceleration, alpha, uA)}`, c.forceApplied]);
    if (has(spec.rpm)) out.push([`N = ${text(spec.rpm, v(spec.rpm), 'rpm')}`, c.chartInk]);
    if (spin) {
      out.push([`ω_0 = ${text(spec.start, w0, uW)}`, c.chartHighlight]);
      out.push([`α = ${text(spec.acceleration, alpha ?? 0, uA)}`, c.forceApplied]);
    }
    if (has(spec.speed) || steady) out.push([`ω = ${text(spec.speed, w, uW)}`, c.chartHighlight]);
    if (spec.period && w > 0)
      out.push([`T = ${text(spec.period, (2 * Math.PI) / w, 's')}`, c.chartInk]);
    return out;
  }

  function drawBody(cx: number, cy: number, R: number, s: Shape, small = false) {
    switch (s) {
      case 'hoop':
        return (
          <G>
            <Circle
              cx={cx}
              cy={cy}
              r={R - (small ? 3 : 6)}
              stroke={url(ids.metal)}
              strokeWidth={small ? 6 : 12}
              fill="none"
            />
            <Circle
              cx={cx}
              cy={cy}
              r={R - (small ? 3 : 6)}
              stroke={c.metalDark}
              strokeWidth={0.8}
              fill="none"
            />
            {/* Thin spokes carry it round the axle; the mass is all at the rim. */}
            {[0, 1, 2].map((k) => {
              const a = (k * 2 * Math.PI) / 3 + Math.PI / 2;
              const p = onCircle(cx, cy, R - (small ? 6 : 12), a);
              return (
                <Line
                  key={k}
                  x1={cx}
                  y1={cy}
                  x2={p.x}
                  y2={p.y}
                  stroke={c.metalDark}
                  strokeWidth={1}
                />
              );
            })}
          </G>
        );
      case 'disk':
        return (
          <G>
            <Circle cx={cx} cy={cy} r={R} fill={url(ids.metal)} stroke={c.metalDark} />
            <Circle
              cx={cx}
              cy={cy}
              r={R * 0.7}
              fill="none"
              stroke={c.metalDark}
              strokeOpacity={0.35}
            />
          </G>
        );
      case 'ball':
        return (
          <G>
            <Circle cx={cx} cy={cy} r={R} fill={url(ids.ball)} stroke={c.metalDark} />
            <Path
              d={`M ${cx - R} ${cy} A ${R} ${R * 0.3} 0 0 0 ${cx + R} ${cy}`}
              fill="none"
              stroke={c.metalDark}
              strokeOpacity={0.4}
            />
          </G>
        );
      case 'wheel':
        return (
          <G>
            <Circle cx={cx} cy={cy} r={R - 5} stroke={c.rubber} strokeWidth={10} fill="none" />
            {Array.from({ length: 8 }, (_, k) => {
              const p = onCircle(cx, cy, R - 10, (k * Math.PI) / 4);
              return (
                <Line
                  key={k}
                  x1={cx}
                  y1={cy}
                  x2={p.x}
                  y2={p.y}
                  stroke={c.metalDark}
                  strokeWidth={2}
                />
              );
            })}
            <Circle cx={cx} cy={cy} r={R * 0.18} fill={url(ids.hub)} stroke={c.metalDark} />
          </G>
        );
    }
  }

  /** The three shapes with the same m, r and τ: I = cmr² and α = τ/I for each. */
  function drawCompare(W: number, y0: number) {
    const col = W / 3;
    return (
      <G>
        <Line x1={8} y1={y0 - 6} x2={W - 8} y2={y0 - 6} stroke={c.chartGrid} />
        {SHAPES.map((s, i) => {
          const x = col * (i + 0.5);
          const chosen = cf !== undefined && Math.abs(cf - s.c) < 1e-9;
          const Ii = inertiaOf(s.c, m, r);
          return (
            <G key={s.name}>
              {chosen ? (
                <Rect
                  x={x - col / 2 + 4}
                  y={y0}
                  width={col - 8}
                  height={118}
                  rx={8}
                  fill={c.chartHighlight}
                  fillOpacity={0.1}
                  stroke={c.chartHighlight}
                />
              ) : null}
              {drawBody(x, y0 + 30, 22, shapeOf(s.c), true)}
              <ChartText
                x={x}
                y={y0 + 72}
                textAnchor="middle"
                fontSize={chart.label}
                fontWeight="700"
              >
                {`${s.half}, c = ${cText(s.c)}`}
              </ChartText>
              <ChartText x={x} y={y0 + 90} textAnchor="middle" fontSize={chart.label}>
                {`I = ${num(Ii)}`}
              </ChartText>
              <ChartText
                x={x}
                y={y0 + 108}
                textAnchor="middle"
                fontSize={chart.label}
                fill={c.forceApplied}
              >
                {`α = ${num((tau ?? 0) / Ii)}`}
              </ChartText>
            </G>
          );
        })}
      </G>
    );
  }

  /** The ω–t line with the angle swept as its area, and the turns as dials. */
  function drawSpin(W: number, y0: number) {
    const g = { x0: 44, x1: W - 16, y0: y0 + 14, y1: y0 + 112 };
    const win = spanWindow([w0, w], 4);
    const X = (s: number) => g.x0 + ((g.x1 - g.x0) * s) / Math.max(1e-9, t);
    const Y = (x: number) => g.y1 - ((g.y1 - g.y0) * (x - win.lo)) / (win.hi - win.lo);
    const ticks = Array.from(
      { length: Math.round((win.hi - win.lo) / win.step) + 1 },
      (_, i) => win.lo + i * win.step,
    );
    const n = turns ?? 0;
    const per = Math.abs(n) <= MAX_DIALS ? 1 : niceCeil(Math.abs(n) / MAX_DIALS);
    const dials = Math.abs(n) / per;
    const perRow = Math.max(1, Math.floor((W - 16) / 32));
    const dy = g.y1 + 44;
    return (
      <G>
        <Line x1={8} y1={y0 - 6} x2={W - 8} y2={y0 - 6} stroke={c.chartGrid} />
        {ticks.map((k) => (
          <G key={k}>
            <Line x1={g.x0} y1={Y(k)} x2={g.x1} y2={Y(k)} stroke={c.chartGrid} />
            <ChartText
              x={g.x0 - 4}
              y={Y(k) + 4}
              textAnchor="end"
              fontSize={chart.value}
              fill={c.chartMuted}
            >
              {num(k)}
            </ChartText>
          </G>
        ))}
        <Path
          d={`M ${X(0)} ${Y(0)} L ${X(0)} ${Y(w0)} L ${X(t)} ${Y(w)} L ${X(t)} ${Y(0)} Z`}
          fill={c.physWork}
          fillOpacity={0.25}
        />
        <Line x1={g.x0} y1={Y(0)} x2={g.x1} y2={Y(0)} stroke={c.chartInk} />
        <Line x1={g.x0} y1={g.y0} x2={g.x0} y2={g.y1} stroke={c.chartInk} />
        <Line
          x1={X(0)}
          y1={Y(w0)}
          x2={X(t)}
          y2={Y(w)}
          stroke={c.chartHighlight}
          strokeWidth={2.5}
        />
        <SubLabel
          x={(X(0) + X(t)) / 2}
          y={(Y(0) + Y((w0 + w) / 2)) / 2 + 5}
          text={`Δθ = ${text(spec.angle, up.angle, 'rad')}`}
          color={c.physWork}
          w={W}
        />
        <ChartText
          x={g.x1}
          y={g.y1 + 16}
          textAnchor="end"
          fontSize={chart.label}
          fill={c.chartMuted}
        >
          {`t = ${text(spec.time, t, 's')}`}
        </ChartText>
        <ChartText x={g.x0} y={g.y0 - 2} fontSize={chart.label} fill={c.chartMuted}>
          {`ω (${uW})`}
        </ChartText>
        {/* The turns: a dial for each, the last part a slice. */}
        {Array.from({ length: Math.min(2 * perRow, Math.ceil(dials - 1e-9)) }, (_, i) => {
          const x = 8 + 16 + (i % perRow) * 32;
          const y = dy + 16 + Math.floor(i / perRow) * 32;
          const part = Math.min(1, dials - i);
          const a = 2 * Math.PI * part;
          const end = onCircle(x, y, 12, Math.PI / 2 - a);
          return (
            <G key={i}>
              <Circle cx={x} cy={y} r={12} fill="none" stroke={c.physWork} />
              {part >= 1 - 1e-9 ? (
                <Circle cx={x} cy={y} r={12} fill={c.physWork} fillOpacity={0.55} />
              ) : (
                <Path
                  d={`M ${x} ${y} L ${x} ${y - 12} A 12 12 0 ${part > 0.5 ? 1 : 0} 1 ${end.x} ${end.y} Z`}
                  fill={c.physWork}
                  fillOpacity={0.55}
                />
              )}
            </G>
          );
        })}
        <SubLabel
          x={8}
          y={dy - 4}
          text={`n = ${text(spec.turns, n, 'turns')}${per > 1 ? ` (each dial ${num(per)} turns)` : ''}`}
          anchor="start"
          color={c.physWork}
          w={W}
        />
      </G>
    );
  }

  function captionLines(): string[] {
    const out: string[] = [];
    if (cf !== undefined && has(spec.mass))
      out.push(`I = cmr² = ${cText(cf)} × ${num(m)} × ${num(r)}² = ${num(I)} ${uI}`);
    if (tau !== undefined && alpha !== undefined && Number.isFinite(I))
      out.push(`α = τ/I = ${num(tau)}/${num(I)} = ${num(alpha)} ${uA}`);
    if (spin) {
      out.push(`ω = ω₀ + αt = ${num(w0)} + ${num(alpha ?? 0)} × ${num(t)} = ${num(w)} ${uW}`);
      out.push(
        `Δθ = ω₀t + ½αt² = ${num(up.angle)} rad, the area under the ω–t line`,
        `n = Δθ/2π = ${num(up.angle)}/2π = ${num(up.turns)} turns`,
      );
    }
    if (steady) {
      out.push(`ω = 2πN/60 = 2π × ${num(v(spec.rpm))}/60 = ${num(steady.w)} ${uW}`);
      if (spec.period && w > 0) out.push(`T = 2π/ω = ${num((2 * Math.PI) / w)} s`);
    }
    if (spec.rim) out.push(`v = rω = ${num(r)} × ${num(w)} = ${num(r * w)} m/s`);
    if (compare)
      out.push('The same torque spins the hoop up most slowly: its mass is all at the rim.');
    else if (steady) out.push('Every point turns at the same ω, but the rim moves fastest.');
    return out;
  }
}
