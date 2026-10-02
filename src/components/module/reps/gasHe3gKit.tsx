/**
 * HC43 (round 3, group G): the painted cylinder and gauge the `gasPiston` `pv` and `real`
 * pictures share. A glass cylinder with a metal piston and rod, the gas as particles (their
 * speed trails ∝ √T), an earlier piston dashed, and a pressure gauge with a metal rim.
 */
import { Circle, G, Line, Path, Rect } from 'react-native-svg';

import { chart, usePalette } from '@/theme';

import { gasSpots, trailLength } from './gasModel';
import { url } from './paint';

/** Paint ids a cylinder needs (from `usePaintIds('glass', 'sheen', 'rod', 'ball', 'dial')`). */
export interface CylinderPaint {
  glass: string;
  sheen: string;
  rod: string;
  ball: string;
}

/**
 * A cylinder `left`…`left + cw` wide from `top` to `bottom`, the piston's face at `py`. `ghost`
 * dashes an earlier piston face; `band` shades the bottom `band` px (the molecules' own volume);
 * `radius` sizes the particles; `pairs` joins that many neighbouring pairs with short
 * attraction lines.
 */
export function Cylinder({
  left,
  cw,
  top,
  bottom,
  py,
  count,
  kelvins,
  paint,
  ghost,
  band,
  radius = 3.6,
  pairs = 0,
}: {
  left: number;
  cw: number;
  top: number;
  bottom: number;
  py: number;
  count: number;
  kelvins: number | undefined;
  paint: CylinderPaint;
  ghost?: number;
  band?: number;
  radius?: number;
  pairs?: number;
}) {
  const c = usePalette();
  const right = left + cw;
  const cx = left + cw / 2;
  const trail = kelvins === undefined ? 0 : trailLength(kelvins);
  const spots = gasSpots(count);
  const floor = bottom - (band ?? 0);
  const at = spots.map((p) => ({
    x: left + radius + 3 + p.x * (cw - 2 * radius - 6),
    y: py + radius + 3 + p.y * Math.max(1, floor - py - 2 * radius - 6),
    dir: p.dir,
  }));
  // The nearest pairs, closest first, each particle used once.
  const links: [number, number][] = [];
  if (pairs > 0) {
    const all: [number, number, number][] = [];
    for (let i = 0; i < at.length; i++)
      for (let j = i + 1; j < at.length; j++)
        all.push([Math.hypot(at[i]!.x - at[j]!.x, at[i]!.y - at[j]!.y), i, j]);
    all.sort((a, b) => a[0] - b[0]);
    const used = new Set<number>();
    for (const [, i, j] of all) {
      if (links.length >= pairs) break;
      if (used.has(i) || used.has(j)) continue;
      used.add(i);
      used.add(j);
      links.push([i, j]);
    }
  }
  return (
    <G>
      <Rect x={left} y={top - 14} width={cw} height={bottom - top + 14} fill={url(paint.glass)} />
      {band ? (
        <G>
          <Rect
            x={left + 1}
            y={bottom - band}
            width={cw - 2}
            height={band}
            fill={c.gasPiston3gBand}
          />
          <Line
            x1={left + 1}
            y1={bottom - band}
            x2={right - 1}
            y2={bottom - band}
            stroke={c.gasPiston3gHatch}
            strokeWidth={1.5}
            strokeDasharray={chart.dashFine}
          />
        </G>
      ) : null}
      {links.map(([i, j]) => (
        <Line
          key={`l${i}-${j}`}
          x1={at[i]!.x}
          y1={at[i]!.y}
          x2={at[j]!.x}
          y2={at[j]!.y}
          stroke={c.gasPiston3gPull}
          strokeWidth={1.6}
          strokeDasharray="2 2"
        />
      ))}
      {at.map((p, i) => {
        const [dx, dy] = [Math.cos(p.dir), Math.sin(p.dir)];
        const tx = Math.min(right - 3, Math.max(left + 3, p.x - dx * (trail + radius)));
        const ty = Math.min(floor - 3, Math.max(py + 2, p.y - dy * (trail + radius)));
        return (
          <G key={i}>
            {trail > 0 ? (
              <Line
                x1={tx}
                y1={ty}
                x2={p.x}
                y2={p.y}
                stroke={c.gasParticle}
                strokeOpacity={0.45}
                strokeWidth={2}
                strokeLinecap="round"
              />
            ) : null}
            <Circle cx={p.x} cy={p.y} r={radius} fill={url(paint.ball)} />
          </G>
        );
      })}
      <Rect x={left} y={top - 14} width={cw} height={bottom - top + 14} fill={url(paint.sheen)} />
      {ghost !== undefined && Math.abs(ghost - py) > 3 ? (
        <Line
          x1={left - 6}
          y1={ghost}
          x2={right + 6}
          y2={ghost}
          stroke={c.chartMuted}
          strokeWidth={chart.strokeLight}
          strokeDasharray={chart.dash}
        />
      ) : null}
      {/* The rod, its cap, and the piston with its rubber seal. */}
      <Rect
        x={cx - 3.5}
        y={top - 24}
        width={7}
        height={Math.max(4, py - top + 12)}
        fill={url(paint.rod)}
        stroke={c.metalDark}
        strokeWidth={0.8}
      />
      <Rect
        x={cx - 11}
        y={top - 28}
        width={22}
        height={6}
        rx={3}
        fill={c.metal}
        stroke={c.metalDark}
      />
      <Rect
        x={left + 1.5}
        y={py - 11}
        width={cw - 3}
        height={11}
        rx={2}
        fill={c.metal}
        stroke={c.metalDark}
        strokeWidth={1.2}
      />
      <Rect x={left + 1.5} y={py - 11} width={cw - 3} height={11} fill={url(paint.rod)} />
      <Line
        x1={left + 2}
        y1={py - 3}
        x2={right - 2}
        y2={py - 3}
        stroke={c.rubber}
        strokeWidth={2}
      />
      <Path
        d={`M ${left} ${top - 14} L ${left} ${bottom} L ${right} ${bottom} L ${right} ${top - 14}`}
        stroke={c.glassEdge}
        strokeWidth={chart.strokeHeavy}
        fill="none"
        strokeLinejoin="round"
      />
    </G>
  );
}

/** A pressure gauge: metal rim, paper face, ticks round 270° and a needle at `share` of full. */
export function Gauge({
  x,
  y,
  r,
  share,
  dial,
  needle,
}: {
  x: number;
  y: number;
  r: number;
  share: number | undefined;
  dial: string;
  needle?: string;
}) {
  const c = usePalette();
  const angle = (t: number) => ((135 + 270 * Math.min(1, Math.max(0, t))) * Math.PI) / 180;
  const at = (t: number, rr: number) => [x + rr * Math.cos(angle(t)), y + rr * Math.sin(angle(t))];
  return (
    <G>
      <Circle cx={x + 1.5} cy={y + 2.5} r={r} fill={c.shadow} />
      <Circle cx={x} cy={y} r={r} fill={url(dial)} stroke={c.metalDark} />
      <Circle cx={x} cy={y} r={r - 4} fill={c.paper} stroke={c.metalDark} strokeWidth={0.8} />
      {Array.from({ length: 11 }, (_, i) => {
        const [x1, y1] = at(i / 10, r - 5);
        const [x2, y2] = at(i / 10, i % 5 === 0 ? r - 10 : r - 8);
        return (
          <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c.coinInk} strokeWidth={0.9} />
        );
      })}
      {share !== undefined ? (
        <Line
          x1={x}
          y1={y}
          x2={at(share, r - 7)[0]}
          y2={at(share, r - 7)[1]}
          stroke={needle ?? c.mercury}
          strokeWidth={2}
          strokeLinecap="round"
        />
      ) : null}
      <Circle cx={x} cy={y} r={2.4} fill={c.coinInk} />
    </G>
  );
}
