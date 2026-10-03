/**
 * The college `refraction` picture (HC76, EG-P20): a seismic or radar survey in section with
 * its travel-time graph. `refraction`: layer 1 over a faster layer 2, the direct, head-wave
 * and reflected rays, and the two time lines crossing at x_c. `reflection`: a reflector's ray
 * at offset x and the hyperbola t(x) with t₀ and the moveout. `gpr`: an antenna, a buried
 * pipe, and the depth scale beside the two-way-time scale. Depths and offsets share one scale,
 * so the angles are true. The rock is painted; the graph is flat. Math in `refractionMath.ts`.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { RefractionSpec } from '@/data/modules/typesHe3m';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, niceCeil } from './common';
import { Arrow, Dimension, HeLabel } from './beamKit';
import { n3, useReader, VDim } from './he3mKit';
import {
  LIGHT_M_PER_NS,
  RAD,
  criticalAngle,
  criticalDistance,
  crossoverOf,
  depthFromCrossover,
  interceptTime,
  radarDepth,
  radarSpeed,
  reflectionTime,
} from './refractionMath';

type Palette = ReturnType<typeof usePalette>;
type Spec<M extends RefractionSpec['mode']> = Extract<RefractionSpec, { mode: M }>;

export function Refraction({ spec, calc }: { spec: RefractionSpec; calc: Calculator }) {
  switch (spec.mode) {
    case 'refraction':
      return <RefractionView spec={spec} calc={calc} />;
    case 'reflection':
      return <ReflectionView spec={spec} calc={calc} />;
    case 'gpr':
      return <GprView spec={spec} calc={calc} />;
  }
}

/** A seeded scatter (the same every render) for rock grains. */
function speckles(x: number, y: number, w: number, h: number, every: number): [number, number][] {
  const out: [number, number][] = [];
  let s = 4242;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  const n = Math.max(0, Math.round((w * h) / every));
  for (let i = 0; i < n; i++) out.push([x + rnd() * w, y + rnd() * h]);
  return out;
}

/** A rock layer: its colour and grains. */
function Layer({
  x,
  y,
  w,
  h,
  fill,
  c,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  c: Palette;
}) {
  if (h <= 0) return null;
  return (
    <G>
      <Rect x={x} y={y} width={w} height={h} fill={fill} />
      {speckles(x, y, w, h, 90).map(([sx, sy], i) => (
        <Circle key={i} cx={sx} cy={sy} r={1} fill={c.soilDark} opacity={0.3} />
      ))}
    </G>
  );
}

/** A geophone (a receiver) on the surface: a small spike under a triangle. */
function Geophone({ x, y, c, lit }: { x: number; y: number; c: Palette; lit?: boolean }) {
  return (
    <Polygon
      points={`${x - 5},${y - 9} ${x + 5},${y - 9} ${x},${y}`}
      fill={lit ? c.chartHighlight : c.chartInk}
    />
  );
}

/** The shot: a star at the surface. */
function Shot({ x, y, c }: { x: number; y: number; c: Palette }) {
  const pts = Array.from({ length: 10 }, (_, k) => {
    const r = k % 2 ? 3.2 : 8;
    const a = (k * 36 - 90) * RAD;
    return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return <Polygon points={pts} fill={c.chartSecond} stroke={c.chartInk} strokeWidth={1} />;
}

/** A ray from a to b with an arrow at its middle. */
function Ray({
  a,
  b,
  color,
  dash,
  arrow = true,
}: {
  a: [number, number];
  b: [number, number];
  color: string;
  dash?: string;
  arrow?: boolean;
}) {
  const [mx, my] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const [ux, uy] = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  return (
    <G>
      <Line
        x1={a[0]}
        y1={a[1]}
        x2={b[0]}
        y2={b[1]}
        stroke={color}
        strokeWidth={2}
        strokeDasharray={dash}
      />
      {arrow && len > 24 ? (
        <Arrow x1={mx - ux * 6} y1={my - uy * 6} x2={mx + ux * 6} y2={my + uy * 6} color={color} />
      ) : null}
    </G>
  );
}

/** Ticks for an axis from 0 to `max`: about four, at round steps. */
function ticks(max: number): number[] {
  const step = niceCeil(max / 4);
  const out: number[] = [];
  for (let v = step; v <= max * 1.0001; v += step) out.push(Number(v.toPrecision(6)));
  return out;
}

/** A t–x graph's frame: axes, ticks, names. Returns its mappers. */
function frameOf(
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  xMax: number,
  tMax: number,
): { X: (x: number) => number; T: (t: number) => number } {
  return {
    X: (x: number) => x0 + (x / xMax) * (x1 - x0),
    T: (t: number) => y1 - (t / tMax) * (y1 - y0),
  };
}

function Frame({
  x0,
  x1,
  y0,
  y1,
  xMax,
  tMax,
  xName,
  tName,
  c,
}: {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  xMax: number;
  tMax: number;
  xName: string;
  tName: string;
  c: Palette;
}) {
  const { X, T } = frameOf(x0, x1, y0, y1, xMax, tMax);
  return (
    <G>
      {ticks(tMax).map((t) => (
        <G key={`t${t}`}>
          <Line x1={x0} y1={T(t)} x2={x1} y2={T(t)} stroke={c.chartGrid} strokeWidth={1} />
          <ChartText
            x={x0 - 4}
            y={T(t) + 3}
            textAnchor="end"
            fontSize={chart.tiny}
            fill={c.chartMuted}
          >
            {n3(t)}
          </ChartText>
        </G>
      ))}
      {ticks(xMax).map((x) => (
        <G key={`x${x}`}>
          <Line x1={X(x)} y1={y0} x2={X(x)} y2={y1} stroke={c.chartGrid} strokeWidth={1} />
          <ChartText
            x={X(x)}
            y={y1 + 12}
            textAnchor="middle"
            fontSize={chart.tiny}
            fill={c.chartMuted}
          >
            {n3(x)}
          </ChartText>
        </G>
      ))}
      <Line x1={x0} y1={y1} x2={x1} y2={y1} stroke={c.chartInk} strokeWidth={1.4} />
      <Line x1={x0} y1={y0} x2={x0} y2={y1} stroke={c.chartInk} strokeWidth={1.4} />
      <ChartText x={x1} y={y1 + 24} textAnchor="end" fontSize={chart.small} fill={c.chartInk}>
        {xName}
      </ChartText>
      <ChartText x={x0 + 4} y={y0 - 6} fontSize={chart.small} fill={c.chartInk}>
        {tName}
      </ChartText>
    </G>
  );
}

// ─── refraction: two layers, the crossover ──────────────────────────────────

function RefractionView({ spec, calc }: { spec: Spec<'refraction'>; calc: Calculator }) {
  const c = usePalette();
  const r = useReader(calc);
  const v1 = r.get(spec.v1);
  const v2 = r.get(spec.v2);
  const xcGiven = r.get(spec.crossover);
  const hGiven = r.get(spec.depth);
  const speeds = v1 !== undefined && v2 !== undefined && v1 > 0 && v2 > 0;
  const faster = speeds && v2! > v1!;
  const h =
    hGiven ?? (faster && xcGiven !== undefined ? depthFromCrossover(xcGiven, v1!, v2!) : undefined);
  const ready = faster && h !== undefined && h > 0;
  const ic = faster ? criticalAngle(v1!, v2!) : NaN;
  const xc = ready ? (xcGiven ?? crossoverOf(h!, v1!, v2!)) : undefined;
  const ti = ready ? interceptTime(h!, v1!, v2!) : undefined;
  const xcrit = ready ? criticalDistance(h!, v1!, v2!) : undefined;
  const H = 400;

  const art = (w: number) => {
    const x0 = 34;
    const x1 = w - 14;
    const ys = 30;
    const xMax = ready ? 1.6 * Math.max(xc!, xcrit!) : 1;
    const sx = (x1 - x0) / xMax;
    const yi = ready ? ys + h! * sx : ys + 60;
    const secBot = Math.max(yi + 56, 130);
    const SX = (x: number) => x0 + x * sx;
    // Geophones every tenth of the line; the head wave lands on the one nearest 1.6 x_c.
    const phones = Array.from({ length: 10 }, (_, k) => ((k + 1) * xMax) / 10);
    const xg = ready
      ? phones.reduce((b, p) => (Math.abs(p - 1.3 * xc!) < Math.abs(b - 1.3 * xc!) ? p : b))
      : 0;
    const xr = ready ? Math.min(0.55 * xcrit!, xMax / 2) : 0;
    const off = ready ? h! * Math.tan(ic * RAD) : 0;
    const g0 = secBot + 34;
    const g1 = H - 36;
    const tMax = ready ? (xMax / v1!) * 1000 : 1;
    const { X, T } = frameOf(x0, x1, g0, g1, xMax, tMax);
    const ms = (s: number) => s * 1000;
    const arcR = 22;
    const ip: [number, number] = [SX(off), yi];
    return (
      <Svg width={w} height={H}>
        <Layer x={0} y={ys} w={w} h={yi - ys} fill={c.rock1} c={c} />
        <Layer x={0} y={yi} w={w} h={secBot - yi} fill={c.rock2} c={c} />
        <Line x1={0} y1={ys} x2={w} y2={ys} stroke={c.chartInk} strokeWidth={1.6} />
        <Line x1={0} y1={yi} x2={w} y2={yi} stroke={c.chartInk} strokeWidth={1.4} />
        <G opacity={speeds && !faster ? 0.4 : 1}>
          {ready ? (
            <G>
              {/* The reflected ray (before the critical distance), dashed. */}
              <Ray a={[SX(0), ys]} b={[SX(xr / 2), yi]} color={c.chartMuted} dash={chart.dash} />
              <Ray a={[SX(xr / 2), yi]} b={[SX(xr), ys]} color={c.chartMuted} dash={chart.dash} />
              {/* The direct ray along the top of layer 1. */}
              <Ray a={[SX(0), ys + 5]} b={[SX(xg), ys + 5]} color={c.chartSecond} />
              {/* The head wave: down at i_c, along the top of layer 2, up at i_c. */}
              <Ray a={[SX(0), ys]} b={ip} color={c.chartHighlight} />
              <Ray a={ip} b={[SX(xg - off), yi]} color={c.chartHighlight} />
              <Ray a={[SX(xg - off), yi]} b={[SX(xg), ys]} color={c.chartHighlight} />
              {/* i_c between the ray and the normal at the interface. */}
              <Line
                x1={ip[0]}
                y1={yi - 30}
                x2={ip[0]}
                y2={yi + 6}
                stroke={c.chartInk}
                strokeWidth={1}
                strokeDasharray={chart.dashFine}
              />
              <Path
                d={`M ${ip[0]} ${yi - arcR} A ${arcR} ${arcR} 0 0 0 ${ip[0] - arcR * Math.sin(ic * RAD)} ${yi - arcR * Math.cos(ic * RAD)}`}
                stroke={c.chartHighlight}
                strokeWidth={1.6}
                fill="none"
              />
            </G>
          ) : null}
        </G>
        <Shot x={SX(0)} y={ys} c={c} />
        {(ready ? phones : []).map((p) => (
          <Geophone key={p} x={SX(p)} y={ys} c={c} lit={p === xg} />
        ))}
        {v1 !== undefined ? (
          <HeLabel
            x={x1}
            y={secBot - 28}
            anchor="end"
            text={`layer 1: ${r.named(spec.v1, 'v₁', v1, 'm/s')}`}
            w={w}
          />
        ) : null}
        {v2 !== undefined ? (
          <HeLabel
            x={x1}
            y={secBot - 10}
            anchor="end"
            text={`layer 2: ${r.named(spec.v2, 'v₂', v2, 'm/s')}`}
            w={w}
          />
        ) : null}
        {ready ? (
          <G>
            <VDim x={12} y1={ys} y2={yi} text={r.sym(spec.depth, 'h')} w={w} side={1} />
            <HeLabel
              x={ip[0] + 8}
              y={yi + 17}
              anchor="start"
              text={`${r.sym(spec.critical, 'i_c')} = ${n3(ic)}°`}
              color={c.chartHighlight}
              w={w}
            />
          </G>
        ) : null}
        {ready ? (
          <G>
            <Frame
              x0={x0}
              x1={x1}
              y0={g0}
              y1={g1}
              xMax={xMax}
              tMax={tMax}
              xName="x (m)"
              tName="t (ms)"
              c={c}
            />
            <Line
              x1={X(0)}
              y1={T(0)}
              x2={X(xMax)}
              y2={T(ms(xMax / v1!))}
              stroke={c.chartSecond}
              strokeWidth={2.4}
            />
            <Line
              x1={X(0)}
              y1={T(ms(ti!))}
              x2={X(xcrit!)}
              y2={T(ms(ti! + xcrit! / v2!))}
              stroke={c.chartHighlight}
              strokeWidth={1.6}
              strokeDasharray={chart.dash}
            />
            <Line
              x1={X(xcrit!)}
              y1={T(ms(ti! + xcrit! / v2!))}
              x2={X(xMax)}
              y2={T(ms(ti! + xMax / v2!))}
              stroke={c.chartHighlight}
              strokeWidth={2.4}
            />
            <Line
              x1={X(xc!)}
              y1={T(ms(xc! / v1!))}
              x2={X(xc!)}
              y2={g1}
              stroke={c.chartMuted}
              strokeWidth={1}
              strokeDasharray={chart.dashFine}
            />
            <Circle
              cx={X(xc!)}
              cy={T(ms(xc! / v1!))}
              r={6}
              fill="none"
              stroke={c.chartInk}
              strokeWidth={1.8}
            />
            <HeLabel
              x={X(xc!) + 8}
              y={T(ms(xc! / v1!)) + 18}
              anchor="start"
              text={r.named(spec.crossover, 'x_c', xc!, 'm')}
              w={w}
            />
            <HeLabel
              x={X(0) + 6}
              y={T(ms(ti!)) + 18}
              anchor="start"
              text={`${r.sym(spec.intercept, 'tᵢ')} = ${r.text(spec.intercept, ms(ti!), 'ms')}`}
              color={c.chartHighlight}
              w={w}
            />
            <HeLabel
              x={X(xMax * 0.72)}
              y={T(ms((xMax * 0.72) / v1!)) - 8}
              anchor="end"
              text="direct"
              w={w}
            />
            <HeLabel
              x={X(xMax * 0.97)}
              y={T(ms(ti! + (xMax * 0.97) / v2!)) + 18}
              anchor="end"
              text="head wave"
              color={c.chartHighlight}
              w={w}
            />
          </G>
        ) : null}
      </Svg>
    );
  };

  const lines: string[] = [];
  if (speeds && !faster)
    lines.push('The lower layer must be faster (v₂ > v₁): otherwise no head wave comes back up.');
  if (ready) {
    lines.push(
      `sin ${r.sym(spec.critical, 'i_c')} = ${r.sym(spec.v1, 'v₁')} ÷ ${r.sym(spec.v2, 'v₂')} = ${r.bare(spec.v1, v1!)} ÷ ${r.bare(spec.v2, v2!)}, so ${r.sym(spec.critical, 'i_c')} = ${n3(ic)}°.`,
    );
    lines.push(
      `${r.sym(spec.depth, 'h')} = (${r.sym(spec.crossover, 'x_c')} ÷ 2)√((${r.sym(spec.v2, 'v₂')} − ${r.sym(spec.v1, 'v₁')}) ÷ (${r.sym(spec.v2, 'v₂')} + ${r.sym(spec.v1, 'v₁')})) = ${r.text(spec.depth, h!, 'm')}.`,
    );
    lines.push(
      `Past ${r.sym(spec.crossover, 'x_c')} the head wave arrives first; it reaches the surface only from 2h tan i_c = ${n3(xcrit!)} m.`,
    );
  }
  return (
    <View>
      <Canvas aspect={(w) => H / w}>{({ w }) => art(w)}</Canvas>
      <Caption>{lines.join(' ') || 'Type both speeds and the crossover distance.'}</Caption>
    </View>
  );
}

// ─── reflection: the hyperbola ──────────────────────────────────────────────

function ReflectionView({ spec, calc }: { spec: Spec<'reflection'>; calc: Calculator }) {
  const c = usePalette();
  const r = useReader(calc);
  const h = r.get(spec.depth);
  const v = r.get(spec.speed);
  const x = r.get(spec.offset);
  const ready = h !== undefined && v !== undefined && h > 0 && v > 0;
  const t0 = ready ? (2 * h) / v : undefined;
  const t = ready && x !== undefined ? reflectionTime(x, h, v) : undefined;
  const H = 400;

  const art = (w: number) => {
    const x0 = 40;
    const x1 = w - 14;
    const ys = 34;
    const xMax = ready ? Math.max(1.3 * Math.abs(x ?? 0), (h! * (x1 - x0)) / 130, 1) : 1;
    const sx = (x1 - x0) / xMax;
    const SX = (xx: number) => x0 + xx * sx;
    const yr = ready ? ys + h! * sx : ys + 100;
    const secBot = yr + 22;
    const g0 = secBot + 36;
    const g1 = H - 36;
    const tMax = ready ? reflectionTime(xMax, h!, v!) * 1.08 : 1;
    const { X, T } = frameOf(x0, x1, g0, g1, xMax, tMax);
    const curve = ready
      ? Array.from({ length: 61 }, (_, k) => {
          const xx = (k / 60) * xMax;
          return `${k ? 'L' : 'M'} ${X(xx).toFixed(1)} ${T(reflectionTime(xx, h!, v!)).toFixed(1)}`;
        }).join(' ')
      : '';
    const xa = x !== undefined ? Math.abs(x) : undefined;
    return (
      <Svg width={w} height={H}>
        <Layer x={0} y={ys} w={w} h={yr - ys} fill={c.rock1} c={c} />
        <Layer x={0} y={yr} w={w} h={secBot - yr} fill={c.rock3} c={c} />
        <Line x1={0} y1={ys} x2={w} y2={ys} stroke={c.chartInk} strokeWidth={1.6} />
        <Line x1={0} y1={yr} x2={w} y2={yr} stroke={c.chartInk} strokeWidth={2} />
        {ready ? (
          <G>
            <Ray a={[SX(0) + 4, ys]} b={[SX(0) + 4, yr]} color={c.chartMuted} dash={chart.dash} />
            {xa !== undefined && xa > 0 ? (
              <G>
                <Ray a={[SX(0), ys]} b={[SX(xa / 2), yr]} color={c.chartHighlight} />
                <Ray a={[SX(xa / 2), yr]} b={[SX(xa), ys]} color={c.chartHighlight} />
                <Geophone x={SX(xa)} y={ys} c={c} lit />
                <Dimension
                  x1={SX(0)}
                  x2={SX(xa)}
                  y={14}
                  text={r.named(spec.offset, 'x', xa, 'm')}
                  w={w}
                />
              </G>
            ) : null}
            <VDim
              x={x1 - 4}
              y1={ys}
              y2={yr}
              text={r.named(spec.depth, 'h', h!, 'm')}
              w={w}
              side={-1}
            />
          </G>
        ) : null}
        <Shot x={SX(0)} y={ys} c={c} />
        {v !== undefined ? (
          <HeLabel
            x={x1}
            y={ready ? yr + 36 + 12 : ys + 20}
            anchor="end"
            text={r.named(spec.speed, 'v', v, 'm/s')}
            w={w}
          />
        ) : null}
        {ready ? (
          <G>
            <Frame
              x0={x0}
              x1={x1}
              y0={g0}
              y1={g1}
              xMax={xMax}
              tMax={tMax}
              xName="x (m)"
              tName="t (s)"
              c={c}
            />
            <Path d={curve} stroke={c.chartHighlight} strokeWidth={2.4} fill="none" />
            <Circle cx={X(0)} cy={T(t0!)} r={4.5} fill={c.chartInk} />
            <HeLabel
              x={X(0) + 8}
              y={T(t0!) - 8}
              anchor="start"
              text={r.named(spec.t0, 't₀', t0!, 's')}
              w={w}
            />
            {t !== undefined && xa !== undefined ? (
              <G>
                <Line
                  x1={X(0)}
                  y1={T(t0!)}
                  x2={X(xa) + 4}
                  y2={T(t0!)}
                  stroke={c.chartMuted}
                  strokeWidth={1}
                  strokeDasharray={chart.dashFine}
                />
                <Circle
                  cx={X(xa)}
                  cy={T(t)}
                  r={5}
                  fill={c.chartHighlight}
                  stroke={c.paper}
                  strokeWidth={1.2}
                />
                <VDim
                  x={X(xa) + 12}
                  y1={T(t0!)}
                  y2={T(t)}
                  text={`${r.sym(spec.moveout, 'Δt')} = ${r.text(spec.moveout, t - t0!, 's')}`}
                  w={w}
                  side={X(xa) > (x0 + x1) / 2 ? -1 : 1}
                />
                <HeLabel
                  x={X(xa) - 8}
                  y={T(t) - 10}
                  anchor="end"
                  text={r.named(spec.time, 't', t, 's')}
                  color={c.chartHighlight}
                  w={w}
                />
              </G>
            ) : null}
          </G>
        ) : null}
      </Svg>
    );
  };

  const lines: string[] = [];
  if (ready) {
    lines.push(
      `${r.sym(spec.t0, 't₀')} = 2${r.sym(spec.depth, 'h')} ÷ ${r.sym(spec.speed, 'v')} = ${r.text(spec.t0, t0!, 's')}.`,
    );
    if (t !== undefined)
      lines.push(
        `${r.sym(spec.time, 't')} = √(${r.sym(spec.offset, 'x')}² + 4${r.sym(spec.depth, 'h')}²) ÷ ${r.sym(spec.speed, 'v')} = ${r.text(spec.time, t, 's')}, so the moveout is ${r.text(spec.moveout, t - t0!, 's')}.`,
      );
    lines.push('Farther receivers hear the echo later: the times lie on a hyperbola.');
  }
  return (
    <View>
      <Canvas aspect={(w) => H / w}>{({ w }) => art(w)}</Canvas>
      <Caption>{lines.join(' ') || 'Type the depth and the speed.'}</Caption>
    </View>
  );
}

// ─── gpr: radar depth from two-way time ─────────────────────────────────────

function GprView({ spec, calc }: { spec: Spec<'gpr'>; calc: Calculator }) {
  const c = usePalette();
  const r = useReader(calc);
  const eps = r.get(spec.permittivity);
  const t = r.get(spec.time);
  const light = r.get(spec.light) ?? LIGHT_M_PER_NS;
  const v = eps !== undefined && eps >= 1 ? radarSpeed(eps, light) : undefined;
  const d = v !== undefined && t !== undefined && t > 0 ? radarDepth(v, t) : undefined;
  const H = 300;

  const art = (w: number) => {
    const ys = 56;
    const yb = H - 20;
    const dMax = d !== undefined ? niceCeil(d * 1.25) : 1;
    const Y = (dd: number) => ys + (dd / dMax) * (yb - ys);
    const xl = 40;
    const xr = w - 44;
    const xa = w * 0.46;
    const yd = d !== undefined ? Y(d) : undefined;
    const tMax = v !== undefined ? (2 * dMax) / v : undefined;
    return (
      <Svg width={w} height={H}>
        <Layer x={xl} y={ys} w={xr - xl} h={yb - ys} fill={c.landSand} c={c} />
        <Line x1={xl} y1={ys} x2={xr} y2={ys} stroke={c.landGrass} strokeWidth={2.5} />
        {/* The antenna on its sled. */}
        <Rect
          x={xa - 26}
          y={ys - 20}
          width={52}
          height={18}
          rx={3}
          fill={c.chartSecond}
          stroke={c.chartInk}
          strokeWidth={1.2}
        />
        <ChartText
          x={xa}
          y={ys - 7}
          textAnchor="middle"
          fontSize={chart.tiny}
          fontWeight="700"
          fill={c.chartInk}
        >
          antenna
        </ChartText>
        {/* Depth scale (m) on the left, two-way time (ns) on the right: d = vt ÷ 2. */}
        <Line x1={xl} y1={ys} x2={xl} y2={yb} stroke={c.chartInk} strokeWidth={1.4} />
        <Line x1={xr} y1={ys} x2={xr} y2={yb} stroke={c.chartInk} strokeWidth={1.4} />
        <ChartText x={xl - 4} y={ys - 26} textAnchor="end" fontSize={chart.small}>
          d (m)
        </ChartText>
        <ChartText x={xr + 4} y={ys - 26} fontSize={chart.small}>
          t (ns)
        </ChartText>
        {ticks(dMax).map((dd) => (
          <G key={`d${dd}`}>
            <Line x1={xl - 4} y1={Y(dd)} x2={xl} y2={Y(dd)} stroke={c.chartInk} />
            <ChartText
              x={xl - 6}
              y={Y(dd) + 3}
              textAnchor="end"
              fontSize={chart.tiny}
              fill={c.chartMuted}
            >
              {n3(dd)}
            </ChartText>
          </G>
        ))}
        {v !== undefined && tMax !== undefined
          ? ticks(tMax).map((tt) => (
              <G key={`t${tt}`}>
                <Line
                  x1={xr}
                  y1={Y(radarDepth(v, tt))}
                  x2={xr + 4}
                  y2={Y(radarDepth(v, tt))}
                  stroke={c.chartInk}
                />
                <ChartText
                  x={xr + 6}
                  y={Y(radarDepth(v, tt)) + 3}
                  fontSize={chart.tiny}
                  fill={c.chartMuted}
                >
                  {n3(tt)}
                </ChartText>
              </G>
            ))
          : null}
        {yd !== undefined ? (
          <G>
            <Line
              x1={xl}
              y1={yd}
              x2={xr}
              y2={yd}
              stroke={c.chartMuted}
              strokeWidth={1}
              strokeDasharray={chart.dashFine}
            />
            <Circle
              cx={xa}
              cy={yd + 7}
              r={7}
              fill={c.metal}
              stroke={c.metalDark}
              strokeWidth={1.4}
            />
            <Ray a={[xa - 8, ys]} b={[xa - 3, yd]} color={c.chartHighlight} />
            <Ray a={[xa + 3, yd]} b={[xa + 8, ys]} color={c.chartHighlight} />
            <HeLabel
              x={xa + 18}
              y={yd + 18}
              anchor="start"
              text={r.named(spec.depth, 'd', d!, 'm')}
              w={w}
            />
            <HeLabel
              x={xr - 6}
              y={yd - 8}
              anchor="end"
              text={r.named(spec.time, 't', t!, 'ns')}
              color={c.chartHighlight}
              w={w}
            />
          </G>
        ) : null}
        {eps !== undefined ? (
          <HeLabel
            x={xl + 8}
            y={ys + 20}
            anchor="start"
            text={`${r.sym(spec.permittivity, 'εᵣ')} = ${r.text(spec.permittivity, eps)}`}
            w={w}
          />
        ) : null}
        {v !== undefined ? (
          <HeLabel
            x={xl + 8}
            y={ys + 40}
            anchor="start"
            text={r.named(spec.speed, 'v', v, 'm/ns')}
            w={w}
          />
        ) : null}
      </Svg>
    );
  };

  const lines: string[] = [];
  if (eps !== undefined && eps < 1)
    lines.push('εᵣ is at least 1 (air): radar never travels faster than light.');
  if (v !== undefined)
    lines.push(
      `${r.sym(spec.speed, 'v')} = ${n3(light)} ÷ √${r.bare(spec.permittivity, eps!)} = ${r.text(spec.speed, v, 'm/ns')}.`,
    );
  if (d !== undefined)
    lines.push(
      `${r.sym(spec.depth, 'd')} = ${r.sym(spec.speed, 'v')}${r.sym(spec.time, 't')} ÷ 2 = ${r.text(spec.depth, d, 'm')}: the pulse goes down and back, so half the time is the trip down.`,
    );
  return (
    <View>
      <Canvas aspect={(w) => H / w}>{({ w }) => art(w)}</Canvas>
      <Caption>{lines.join(' ') || 'Type εᵣ and the two-way time.'}</Caption>
    </View>
  );
}
