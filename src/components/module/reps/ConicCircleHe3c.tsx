/**
 * HC67 (college round 3, group C): `conicGraph` circle options. `under`: the region under the
 * upper arc from the center's x to b across, split into the triangle and the sector (trig
 * substitution's picture of ∫ √(r² − x²) dx), θ marked. `tangent`: the tangent at the point,
 * square to the radius. ConicGraph.tsx calls this in a line each; off unless a page sets them.
 */
import type { ReactNode } from 'react';
import { G, Line, Path } from 'react-native-svg';

import type { ConicGraphSpec } from '@/data/modules/typesHsd';
import { chart, usePalette } from '@/theme';

import type { Frame } from './graphKit';
import { circleTangent, underArc } from './growCircleHe3cMath';
import { short } from './hsdKit';
import { sig4 } from './ratesHe3cMath';
import { MathChip } from './hsdText';

const DEG = 180 / Math.PI;

export function useConicCircleHe3c(
  spec: ConicGraphSpec,
  num: (x: number | string | undefined, d?: number) => number,
  isKnown: (x: number | string | undefined) => boolean,
  circleKnown: boolean,
) {
  const c = usePalette();
  const lines: string[] = [];
  const none = { on: false, lines, under: () => null, over: () => null };
  if (spec.conic !== 'circle' || (!spec.under && !spec.tangent)) return none;
  const [h, k, r] = [num(spec.h), num(spec.k), Math.abs(num(spec.r))];

  // Under the arc ("?" for b draws nothing).
  const bKnown = !!spec.under && circleKnown && isKnown(spec.under.to);
  const b = spec.under ? num(spec.under.to) : 0;
  const fits = bKnown && b >= 0 && b <= r;
  const U = fits ? underArc(r, b) : undefined;
  if (spec.under)
    lines.push(
      ...(U
        ? [
            `θ = sin⁻¹(${short(b)} ÷ ${short(r)}) = ${sig4(U.theta * DEG)}° = ${sig4(U.theta)} rad`,
            `triangle ½ × ${short(b)} × √(${short(r)}² − ${short(b)}²) = ${sig4(U.triangle)}`,
            `sector ½ × ${short(r)}² × ${sig4(U.theta)} = ${sig4(U.sector)}`,
            `∫ from ${short(h)} to ${short(h + b)} of √(r² − x²) dx = ${sig4(U.triangle)} + ${sig4(U.sector)} = ${sig4(U.integral)}`,
          ]
        : [
            bKnown
              ? `b = ${short(b)} must lie from 0 to r = ${short(r)}.`
              : 'Under the arc: type b.',
          ]),
    );

  // The tangent at the point.
  const p = spec.point;
  const pKnown = !!p && circleKnown && isKnown(p.x) && isKnown(p.y);
  const [x0, y0] = p ? [num(p.x), num(p.y)] : [0, 0];
  const T = spec.tangent && pKnown ? circleTangent(h, k, x0, y0) : undefined;
  if (spec.tangent)
    lines.push(
      T
        ? T.slope === undefined
          ? `Tangent at (${short(x0)}, ${short(y0)}): vertical, x = ${short(x0)}.`
          : `Tangent at (${short(x0)}, ${short(y0)}), square to the radius: slope −(x₀ − h) ÷ (y₀ − k) = ${short(T.slope)}; y = ${short(T.slope)}x ${T.intercept! < 0 ? '−' : '+'} ${short(Math.abs(T.intercept!))}`
        : 'Tangent: type the point.',
    );

  const under = (f: Frame, w: number, hh: number): ReactNode => {
    if (!U) return null;
    const P = (x: number, y: number) => `${f.sx(x)} ${f.sy(y)}`;
    const arc = Array.from({ length: 41 }, (_, i) => {
      const a = Math.PI / 2 - (U.theta * i) / 40;
      return `L ${P(h + r * Math.cos(a), k + r * Math.sin(a))}`;
    }).join(' ');
    const rr = Math.min(22, (r * f.ux) / 3);
    const mark = Array.from({ length: 21 }, (_, i) => {
      const a = Math.PI / 2 - (U.theta * i) / 20;
      return `${i ? 'L' : 'M'} ${f.sx(h) + rr * Math.cos(a)} ${f.sy(k) - rr * Math.sin(a)}`;
    }).join(' ');
    const mid = Math.PI / 2 - U.theta / 2;
    // The sector's value just outside the arc, along its middle radius; the triangle's beside
    // its upright side (inside, it met the θ mark on a thin triangle).
    const sAt = { x: f.sx(h + r * Math.cos(mid)) + 8, y: f.sy(k + r * Math.sin(mid)) - 6 };
    const tAt = { x: f.sx(h + b) + 6, y: f.sy(k + U.y / 3) + 4 };
    return (
      <G>
        <Path
          d={`M ${P(h, k)} ${arc} Z`}
          fill={c.chartHighlight}
          fillOpacity={0.22}
          stroke={c.chartHighlight}
          strokeWidth={chart.strokeLight}
        />
        <Path
          d={`M ${P(h, k)} L ${P(h + b, k)} L ${P(h + b, k + U.y)} Z`}
          fill={c.chartSecond}
          fillOpacity={0.4}
          stroke={c.chartSecond}
          strokeWidth={chart.strokeLight}
        />
        {U.theta > 0.05 ? (
          <G>
            <Path d={mark} stroke={c.chartInk} strokeWidth={chart.strokeLight} fill="none" />
            <MathChip
              x={f.sx(h) + (rr + 9) * Math.cos(mid)}
              y={f.sy(k) - (rr + 9) * Math.sin(mid) + 4}
              text="θ"
              w={w}
              h={hh}
              size={chart.label}
            />
          </G>
        ) : null}
        <MathChip
          x={sAt.x}
          y={sAt.y}
          text={sig4(U.sector)}
          anchor="start"
          w={w}
          h={hh}
          color={c.chartHighlight}
        />
        {U.y * f.uy > 14 ? (
          <MathChip
            x={tAt.x}
            y={tAt.y}
            anchor="start"
            text={sig4(U.triangle)}
            w={w}
            h={hh}
            size={chart.small}
          />
        ) : null}
      </G>
    );
  };

  const over = (f: Frame): ReactNode => {
    if (!T) return null;
    // The line through the point, cut to the window (Liang–Barsky on the plot's box).
    const [dx, dy] = T.slope === undefined ? [0, 1] : [1, T.slope];
    let [t0, t1] = [-Infinity, Infinity];
    for (const [p0, d, lo, hi] of [
      [x0, dx, f.x[0], f.x[1]],
      [y0, dy, f.y[0], f.y[1]],
    ] as const) {
      if (Math.abs(d) < 1e-12) {
        if (p0 < lo || p0 > hi) return null;
        continue;
      }
      const [a, bb] = [(lo - p0) / d, (hi - p0) / d];
      t0 = Math.max(t0, Math.min(a, bb));
      t1 = Math.min(t1, Math.max(a, bb));
    }
    if (!(t1 > t0)) return null;
    // A right-angle mark between the radius and the tangent.
    const len = Math.hypot(x0 - h, y0 - k) || 1;
    const [ux, uy] = [(h - x0) / len, (k - y0) / len];
    const s = 9;
    const tl = Math.hypot(dx, dy);
    const [vx, vy] = [dx / tl, dy / tl];
    const corner = (a: number, b2: number) =>
      `${f.sx(x0) + (ux * a + vx * b2) * s} ${f.sy(y0) - (uy * a + vy * b2) * s}`;
    return (
      <G>
        <Line
          x1={f.sx(h)}
          y1={f.sy(k)}
          x2={f.sx(x0)}
          y2={f.sy(y0)}
          stroke={c.chartMuted}
          strokeWidth={chart.strokeLight}
          strokeDasharray={chart.dashFine}
        />
        <Line
          x1={f.sx(x0 + dx * t0)}
          y1={f.sy(y0 + dy * t0)}
          x2={f.sx(x0 + dx * t1)}
          y2={f.sy(y0 + dy * t1)}
          stroke={c.hopBack}
          strokeWidth={chart.stroke}
        />
        <Path
          d={`M ${corner(1, 0)} L ${corner(1, 1)} L ${corner(0, 1)}`}
          stroke={c.chartInk}
          strokeWidth={1}
          fill="none"
        />
      </G>
    );
  };
  // The page's own radii (to the point, the sector's sides) stand in for the 45° one.
  return { on: true, lines, under, over };
}
