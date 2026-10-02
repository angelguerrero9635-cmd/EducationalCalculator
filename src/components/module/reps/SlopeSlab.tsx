/**
 * HC118 `freeBody` `slab` (typesHe4c.ts): an infinite slope in section. A slab of soil over a
 * dashed slip surface, or a glacier's ice on bedrock, painted in its material; on its base the
 * stresses as arrows to one scale (σ pressing, τ driving downslope, the strength s against it),
 * and FS = s ÷ τ with "slides" exactly when FS < 1. The angle is true; the depth is not to scale
 * (the slab is long next to it). Drag the slope's foot for the angle.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Polygon } from 'react-native-svg';

import type { FreeBodySlabSpec } from '@/data/modules/typesHe4c';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle } from './common';
import { Arrow } from './he1fKit';
import { fmt, Tag, tagW } from './he2fKit';
import { fmtP, useHe4c } from './he4cKit';
import { basalShear, soilSlabOf } from './he4cMath';
import { TopLight, url, usePaintIds } from './paint';

const H = 330;
const DEG = Math.PI / 180;
const DEPTH = 52;
const ARROW = 66;

/** A fixed scatter of points in [0, 1)², the same on every render (soil grains, ice marks). */
const SCATTER = Array.from({ length: 70 }, (_, i) => [
  (i * 0.618034) % 1,
  (i * 0.754877 + 0.31) % 1,
]);

export function SlopeSlab({ spec, calc }: { spec: FreeBodySlabSpec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('slab', 'base');
  const { rep, num, label, setOne } = useHe4c(calc);
  const b = spec.slab;
  const ice = b.material === 'ice';
  const [z, th] = [num(b.thickness), num(b.angle)];
  const [gam, coh, phi] = [num(b.unitWeight), num(b.cohesion), num(b.friction)];
  const [rho, g] = [num(b.density), num(b.g)];
  const okSoil = !ice && z !== undefined && th !== undefined && gam !== undefined;
  const soil = okSoil ? soilSlabOf(gam, z, th, coh, phi) : undefined;
  const tb =
    ice && rho !== undefined && g !== undefined && z !== undefined && th !== undefined
      ? basalShear(rho, g, z, th)
      : undefined;
  const start = useRef({ x: 0, y: 0 });
  const angleVar = typeof b.angle === 'string' ? b.angle : undefined;
  const canDrag = !spec.fixed && !!angleVar && th !== undefined;

  const lines: string[] = [];
  if (soil && okSoil) {
    lines.push(
      `σ = γz cos²θ = ${fmt(gam)} × ${fmt(z)} × cos²${fmt(th)}° = ${fmt(soil.sigma)} kPa`,
      `τ = γz sin θ cos θ = ${fmt(gam)} × ${fmt(z)} × sin ${fmt(th)}° × cos ${fmt(th)}° = ${fmt(soil.tau)} kPa`,
    );
    if (soil.s !== undefined && soil.fs !== undefined) {
      lines.push(
        `s = c + σ tan φ = ${fmt(coh!)} + ${fmtP(soil.sigma)} × tan ${fmt(phi!)}° = ${fmt(soil.s)} kPa`,
        `FS = s ÷ τ = ${fmt(soil.s)} ÷ ${fmt(soil.tau)} = ${fmt(soil.fs)}`,
      );
      lines.push(
        soil.slides
          ? 'FS < 1: the strength can’t hold the driving stress, so the slab slides.'
          : 'FS ≥ 1: the strength holds the driving stress, so the slab stays.',
      );
    }
  } else if (tb !== undefined) {
    lines.push(
      `Basal shear = ρgH sin α = ${fmt(rho!)} × ${fmt(g!)} × ${fmt(z!)} × sin ${fmt(th!)}° ÷ 1000 = ${fmt(tb)} kPa`,
    );
    lines.push(
      tb >= 100
        ? 'At or past about 100 kPa: the ice deforms and flows.'
        : 'Under about 100 kPa: the ice flows slowly; it flows freely as the shear nears 100 kPa.',
    );
  } else lines.push('Type the slope, the depth and the material’s values to draw the stresses.');
  lines.push('The slab is long next to its depth; the depth is not drawn to scale.');

  const corner = ice
    ? [
        label(b.density, 'ρ', rho, 'kg/m³'),
        label(b.g, 'g', g, 'm/s²'),
        tb !== undefined ? label(b.shear, 'τ_b', tb, 'kPa') : undefined,
      ]
    : [
        label(b.unitWeight, 'γ', gam, 'kN/m³'),
        label(b.cohesion, 'c', coh, 'kPa'),
        label(b.friction, 'φ', phi, '°'),
        soil?.fs !== undefined
          ? `${label(b.safety, 'FS', soil.fs)}: ${soil.slides ? 'slides' : 'holds'}`
          : undefined,
      ];

  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w }) => {
          const t = (th ?? (ice ? 3 : 30)) * DEG;
          const u = { x: Math.cos(t), y: Math.sin(t) };
          const n = { x: -Math.sin(t), y: Math.cos(t) };
          const O = { x: w * 0.42, y: H * 0.42 };
          const at = (along: number, down = 0) => ({
            x: O.x + u.x * along + n.x * down,
            y: O.y + u.y * along + n.y * down,
          });
          const far = 2 * (w + H);
          const tp = (ice ? DEPTH + 16 : DEPTH) * Math.cos(t);
          const pts = (ps: { x: number; y: number }[]) => ps.map((p) => `${p.x},${p.y}`).join(' ');
          const slab = [at(-far), at(far), at(far, tp), at(-far, tp)];
          const base = [at(-far, tp), at(far, tp), at(far, far), at(-far, far)];
          // The stresses on the base, under O: σ in, τ downslope above it, s upslope below it.
          const M = at(0, tp);
          const vals = soil
            ? [soil.sigma, soil.tau, soil.s ?? 0]
            : tb !== undefined
              ? [0, tb, 0]
              : [0, 0, 0];
          const big = Math.max(...vals);
          const len = (v: number) => (big > 0 ? (ARROW * v) / big : 0);
          const [ls, lt, lr] = vals.map(len) as [number, number, number];
          const zAt = at(-96);
          const qAt = at(-150);
          const foot = at(130);
          const known = th !== undefined;
          // z's label left of its bracket when it fits there, else right of it.
          const zText = label(b.thickness, ice ? 'H' : 'z', z, 'm');
          const zLeft = zText !== undefined && zAt.x - 8 - tagW(zText) >= 4;
          return (
            <>
              <Svg width={w} height={H}>
                <Defs>
                  <TopLight id={ids.slab} />
                  <TopLight id={ids.base} strength={0.6} />
                </Defs>
                {/* The ground under the slip surface (soil) or the bedrock under the ice. */}
                <Polygon points={pts(base)} fill={ice ? c.he4cBedrock : c.he4cSoil} />
                {!ice ? <Polygon points={pts(base)} fill={c.he4cSoilDark} opacity={0.35} /> : null}
                <Polygon points={pts(base)} fill={url(ids.base)} />
                {ice
                  ? SCATTER.slice(0, 26).map(([a, d], i) => {
                      const p = at((a! - 0.5) * 2 * (w + 60), tp + 12 + d! * 120);
                      const q = at((a! - 0.5) * 2 * (w + 60) + 14, tp + 12 + d! * 120 + 6);
                      return (
                        <Line
                          key={i}
                          x1={p.x}
                          y1={p.y}
                          x2={q.x}
                          y2={q.y}
                          stroke={c.he4cBedrockDark}
                          strokeWidth={1.2}
                        />
                      );
                    })
                  : null}
                {/* The slab, in its material. */}
                <Polygon points={pts(slab)} fill={ice ? c.he4cIce : c.he4cSoil} />
                <Polygon points={pts(slab)} fill={url(ids.slab)} />
                {SCATTER.map(([a, d], i) => {
                  const p = at((a! - 0.5) * 2 * (w + 60), 3 + d! * (tp - 6));
                  // Ice marks keep clear of the H and τ_b labels.
                  if (ice && (Math.abs(p.x - zAt.x) < 90 || Math.abs(p.x - M.x - lt - 50) < 60))
                    return null;
                  return ice ? (
                    <Line
                      key={i}
                      x1={p.x}
                      y1={p.y}
                      x2={p.x + n.x * 5}
                      y2={p.y + n.y * 5}
                      stroke={c.he4cIceDark}
                      strokeWidth={1}
                      opacity={0.6}
                    />
                  ) : (
                    <Circle key={i} cx={p.x} cy={p.y} r={1.3} fill={c.he4cSoilDark} />
                  );
                })}
                <Line
                  {...{ x1: at(-far).x, y1: at(-far).y, x2: at(far).x, y2: at(far).y }}
                  stroke={ice ? c.he4cIceDark : c.he4cSoilDark}
                  strokeWidth={2}
                />
                {/* The slip surface (dashed) or the ice's bed. */}
                <Line
                  {...{
                    x1: at(-far, tp).x,
                    y1: at(-far, tp).y,
                    x2: at(far, tp).x,
                    y2: at(far, tp).y,
                  }}
                  stroke={ice ? c.he4cBedrockDark : c.chartInk}
                  strokeWidth={2}
                  strokeDasharray={ice ? undefined : chart.dash}
                />
                {/* θ against the level, at the slope's top. */}
                {known ? (
                  <G>
                    <Line
                      x1={qAt.x}
                      y1={qAt.y}
                      x2={qAt.x + 74}
                      y2={qAt.y}
                      stroke={c.chartInk}
                      strokeDasharray={chart.dashFine}
                    />
                    <Path
                      d={`M ${qAt.x + 52} ${qAt.y} A 52 52 0 0 1 ${qAt.x + 52 * u.x} ${qAt.y + 52 * u.y}`}
                      stroke={c.chartInk}
                      fill="none"
                    />
                    <Tag
                      x={qAt.x + 80}
                      y={qAt.y + 4}
                      text={label(b.angle, ice ? 'α' : 'θ', th, '°')!}
                      anchor="start"
                      w={w}
                    />
                  </G>
                ) : null}
                {/* z (or H) bracketed, straight down from the surface. */}
                {z !== undefined ? (
                  <G>
                    <Line
                      x1={zAt.x}
                      y1={zAt.y}
                      x2={zAt.x}
                      y2={zAt.y + tp / Math.cos(t)}
                      stroke={c.chartInk}
                      strokeWidth={1.5}
                    />
                    <Line x1={zAt.x - 5} y1={zAt.y} x2={zAt.x + 5} y2={zAt.y} stroke={c.chartInk} />
                    <Line
                      x1={zAt.x - 5}
                      y1={zAt.y + tp / Math.cos(t)}
                      x2={zAt.x + 5}
                      y2={zAt.y + tp / Math.cos(t)}
                      stroke={c.chartInk}
                    />
                    <Tag
                      x={zLeft ? zAt.x - 8 : zAt.x + 8}
                      y={zAt.y + tp / Math.cos(t) / 2 + 4}
                      text={zText!}
                      anchor={zLeft ? 'end' : 'start'}
                      w={w}
                    />
                  </G>
                ) : null}
                {/* The stresses on the base. */}
                {soil ? (
                  <G>
                    <Arrow
                      x1={M.x - n.x * ls}
                      y1={M.y - n.y * ls}
                      x2={M.x}
                      y2={M.y}
                      color={c.he4cSigma}
                      width={3}
                    />
                    <Tag
                      x={M.x - n.x * ls + 6}
                      y={M.y - n.y * ls - 4}
                      text={label(b.normal, 'σ', soil.sigma, 'kPa')!}
                      anchor="start"
                      color={c.he4cSigma}
                      w={w}
                    />
                  </G>
                ) : null}
                {soil || tb !== undefined ? (
                  <G>
                    <Arrow
                      x1={M.x - n.x * 8 + u.x * 6}
                      y1={M.y - n.y * 8 + u.y * 6}
                      x2={M.x - n.x * 8 + u.x * (6 + lt)}
                      y2={M.y - n.y * 8 + u.y * (6 + lt)}
                      color={c.he4cTau}
                      width={3}
                    />
                    <Tag
                      x={M.x + u.x * (14 + lt) + 4}
                      y={M.y + u.y * (14 + lt) - 6}
                      text={label(b.shear, ice ? 'τ_b' : 'τ', soil ? soil.tau : tb, 'kPa')!}
                      anchor="start"
                      color={c.he4cTau}
                      w={w}
                    />
                  </G>
                ) : null}
                {soil?.s !== undefined ? (
                  <G>
                    <Arrow
                      x1={M.x + n.x * 9 - u.x * 6}
                      y1={M.y + n.y * 9 - u.y * 6}
                      x2={M.x + n.x * 9 - u.x * (6 + lr)}
                      y2={M.y + n.y * 9 - u.y * (6 + lr)}
                      color={c.he4cStrength}
                      width={3}
                    />
                    <Tag
                      x={M.x + n.x * 30 - 4}
                      y={M.y + n.y * 30 + 10}
                      text={label(b.strength, 's', soil.s, 'kPa')!}
                      anchor="end"
                      color={c.he4cStrength}
                      w={w}
                    />
                  </G>
                ) : null}
                {corner
                  .filter((x): x is string => !!x)
                  .map((text, i) => (
                    <Tag key={text} x={w - 6} y={18 + i * 18} text={text} anchor="end" w={w} />
                  ))}
              </Svg>
              {canDrag ? (
                <DragHandle
                  testID="drag-slab-angle"
                  x={foot.x}
                  y={foot.y}
                  label={rep.variable(angleVar).name}
                  onStart={() => {
                    start.current = { x: foot.x - O.x, y: foot.y - O.y };
                  }}
                  onMove={(dx, dy) => {
                    const a = Math.atan2(start.current.y + dy, start.current.x + dx) / DEG;
                    setOne(angleVar, Math.max(0.1, Math.min(89, a)), [
                      b.thickness,
                      b.unitWeight,
                      b.cohesion,
                      b.friction,
                      b.density,
                    ]);
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
