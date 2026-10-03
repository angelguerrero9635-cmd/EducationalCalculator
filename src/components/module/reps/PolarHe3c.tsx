/**
 * HC53 (college round 3, group C): the `polarGrid` options for calculus pages. Polar mode: the
 * area a curve sweeps (shaded from the pole, A = ½∫ r² dθ), an annular sector r₁ ≤ r ≤ r₂, and
 * the tangent at the point. Parametric mode: the cycloid's rolling circle, t in radians and the
 * traced length. PolarGrid.tsx calls these in a line each; everything is off unless set.
 */
import type { ReactNode } from 'react';
import { Circle, G, Line, Path } from 'react-native-svg';

import type { PolarCurve, PolarGridSpec } from '@/data/modules/typesHsd';
import { chart, usePalette } from '@/theme';

import type { Frame } from './graphKit';
import { angleText, piText, short } from './hsdKit';
import { PATH_FIELDS, pathAt, polarR } from './polar';
import { pathLength, polarArea, polarTangent, regionArea } from './polarHe3cMath';

const RAD = Math.PI / 180;
type Num = (x: number | string) => number;
type Known = (x: number | string | undefined) => boolean;
type Pt = (x: number, y: number) => { x: number; y: number };

/** t in radians as a lesson writes it: 2π, 3π/2, else its decimal. */
export const radText = (t: number) => piText(t / Math.PI) ?? short(t);

/** The worked options for a polar grid: radii to fit, caption lines, and the layers. */
export function usePolarHe3c(
  spec: PolarGridSpec,
  num: Num,
  isKnown: Known,
  cv: Record<string, number>,
  cvKnown: boolean,
  show: 'degrees' | 'radians',
) {
  const c = usePalette();
  const lines: string[] = [];
  const curve = spec.curve;

  // The swept area: drawn only when the curve and both ends are known.
  const ar = spec.area;
  const area =
    ar && curve && cvKnown && isKnown(ar.from) && isKnown(ar.to)
      ? { from: num(ar.from), to: num(ar.to) }
      : undefined;
  if (ar && curve) {
    const ends = area
      ? `from ${angleText(area.from, show)} to ${angleText(area.to, show)}`
      : 'from ? to ?';
    lines.push(
      area
        ? `Shaded: A = ½∫ r² dθ ${ends} = ${short(polarArea(curve, cv, area.from, area.to))}`
        : `Shaded: A = ½∫ r² dθ ${ends}`,
    );
  }

  // The annular sector.
  const rg = spec.region;
  const region =
    rg && [rg.r1, rg.r2, rg.from, rg.to].every(isKnown)
      ? { r1: num(rg.r1), r2: num(rg.r2), from: num(rg.from), to: num(rg.to) }
      : undefined;
  if (rg)
    lines.push(
      region
        ? `Region: ${short(region.r1)} ≤ r ≤ ${short(region.r2)}, ${angleText(region.from, show)} ≤ θ ≤ ${angleText(region.to, show)}; dA = r dr dθ; area ½(β − α)(r₂² − r₁²) = ${short(regionArea(region.r1, region.r2, region.from, region.to))}`
        : 'Region: r and θ between ?',
    );

  // The tangent at the point.
  const th = spec.point ? num(spec.point.theta) : 0;
  const tangent =
    spec.tangent && curve && cvKnown && spec.point && isKnown(spec.point.theta)
      ? polarTangent(curve, cv, th)
      : undefined;
  if (spec.tangent && curve)
    lines.push(
      tangent
        ? `Tangent at θ = ${angleText(th, show)}: r′ = ${short(tangent.dr)}, dy/dx = (r′ sin θ + r cos θ) ÷ (r′ cos θ − r sin θ) = ${tangent.slope === undefined ? 'undefined (vertical)' : short(tangent.slope)}`
        : 'Tangent: θ = ?',
    );

  const radii = region ? [Math.abs(region.r1), Math.abs(region.r2)] : [];

  /** The shading, under the curve. */
  const under = (P: Pt, k: number, cx: number, cy: number): ReactNode => (
    <G>
      {region ? <RegionShade {...region} k={k} cx={cx} cy={cy} /> : null}
      {area && curve ? <SweepShade curve={curve} cv={cv} {...area} P={P} cx={cx} cy={cy} /> : null}
    </G>
  );

  /** The tangent line through the point, kept inside the grid's outer ring. */
  const over = (P: Pt, R: number, cx: number, cy: number): ReactNode => {
    if (!tangent) return null;
    const p = P(tangent.r * Math.cos(th * RAD), tangent.r * Math.sin(th * RAD));
    const len = Math.hypot(tangent.dx, tangent.dy);
    if (len < 1e-12) return null;
    const u = { x: tangent.dx / len, y: -tangent.dy / len };
    // p + s·u meets the ring of radius R where s² + 2s(u·d) + |d|² − R² = 0.
    const d = { x: p.x - cx, y: p.y - cy };
    const b = u.x * d.x + u.y * d.y;
    const disc = b * b - (d.x * d.x + d.y * d.y - R * R);
    if (disc <= 0) return null;
    const [s1, s2] = [-b - Math.sqrt(disc), -b + Math.sqrt(disc)];
    return (
      <Line
        x1={p.x + s1 * u.x}
        y1={p.y + s1 * u.y}
        x2={p.x + s2 * u.x}
        y2={p.y + s2 * u.y}
        stroke={c.chartSecond}
        strokeWidth={chart.stroke}
      />
    );
  };

  return { lines, radii, under, over };
}

function SweepShade({
  curve,
  cv,
  from,
  to,
  P,
  cx,
  cy,
}: {
  curve: PolarCurve;
  cv: Record<string, number>;
  from: number;
  to: number;
  P: Pt;
  cx: number;
  cy: number;
}) {
  const c = usePalette();
  const n = Math.max(24, Math.min(720, Math.ceil(Math.abs(to - from))));
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const d = from + ((to - from) * i) / n;
    const r = polarR(curve, cv, d);
    return P(r * Math.cos(d * RAD), r * Math.sin(d * RAD));
  });
  const d = `M ${cx} ${cy} ${pts.map((q) => `L ${q.x} ${q.y}`).join(' ')} Z`;
  const full = Math.abs(to - from) >= 360 - 1e-9;
  const ray = (deg: number) => {
    const r = polarR(curve, cv, deg);
    const q = P(r * Math.cos(deg * RAD), r * Math.sin(deg * RAD));
    return (
      <Line
        key={deg}
        x1={cx}
        y1={cy}
        x2={q.x}
        y2={q.y}
        stroke={c.chartHighlight}
        strokeWidth={chart.strokeLight}
        strokeDasharray={chart.dash}
      />
    );
  };
  return (
    <G>
      <Path d={d} fill={c.chartHighlight} fillOpacity={0.2} stroke="none" />
      {full ? null : [ray(from), ray(to)]}
    </G>
  );
}

function RegionShade({
  r1,
  r2,
  from,
  to,
  k,
  cx,
  cy,
}: {
  r1: number;
  r2: number;
  from: number;
  to: number;
  k: number;
  cx: number;
  cy: number;
}) {
  const c = usePalette();
  const [a, b] = [Math.abs(r1) * k, Math.abs(r2) * k];
  const full = Math.abs(to - from) >= 360 - 1e-9;
  const arc = (rr: number, d0: number, d1: number) =>
    Array.from({ length: 73 }, (_, i) => {
      const d = (d0 + ((d1 - d0) * i) / 72) * RAD;
      return `${i ? 'L' : 'M'} ${cx + rr * Math.cos(d)} ${cy - rr * Math.sin(d)}`;
    }).join(' ');
  const d = full
    ? `${arc(b, 0, 360)} Z ${arc(a, 360, 0)} Z`
    : `${arc(b, from, to)} ${arc(a, to, from).replace(/^M/, 'L')} Z`;
  return (
    <G>
      <Path d={d} fill={c.chartSecond} fillOpacity={0.3} fillRule="evenodd" stroke="none" />
      {[a, b].map((rr) =>
        rr > 0 ? (
          <Path
            key={rr}
            d={full ? arc(rr, 0, 360) : arc(rr, from, to)}
            stroke={c.chartSecond}
            strokeWidth={chart.stroke}
            fill="none"
          />
        ) : null,
      )}
    </G>
  );
}

/** The parametric options: the cycloid's rolling circle and the traced length. */
export function useParametricHe3c(
  par: NonNullable<PolarGridSpec['parametric']> | undefined,
  pv: Record<string, number>,
  t: number,
  isKnown: Known,
) {
  const c = usePalette();
  const lines: string[] = [];
  if (!par) return { lines, draw: () => null };
  const known = isKnown((par as { t?: number | string }).t);
  const pvKnown = PATH_FIELDS[par.family].every((k) =>
    isKnown((par as unknown as Record<string, number | string | undefined>)[k]),
  );
  const tText = par.radians || par.family === 'cycloid' ? radText(t) : short(t);
  if (par.length !== undefined)
    lines.push(
      known && pvKnown
        ? `Length from t = ${radText(par.range[0])} to ${tText}: L = ∫ √(x′² + y′²) dt = ${short(pathLength(par, pv, par.range[0], t))}`
        : 'Length: L = ?',
    );
  const draw = (f: Frame): ReactNode => {
    if (par.family !== 'cycloid' || !known || !pvKnown) return null;
    const r = pv.r!;
    const at = pathAt(par, pv, t);
    const [ox, oy] = [f.sx(r * t), f.sy(r)];
    return (
      <G>
        <Line
          x1={f.sx(f.x[0])}
          y1={f.sy(0)}
          x2={f.sx(f.x[1])}
          y2={f.sy(0)}
          stroke={c.chartInk}
          strokeWidth={chart.stroke}
        />
        <Circle
          cx={ox}
          cy={oy}
          r={Math.abs(r) * f.ux}
          fill="none"
          stroke={c.chartMuted}
          strokeWidth={chart.strokeLight}
          strokeDasharray={chart.dash}
        />
        <Line
          x1={ox}
          y1={oy}
          x2={f.sx(at.x)}
          y2={f.sy(at.y)}
          stroke={c.chartMuted}
          strokeWidth={chart.strokeLight}
        />
        <Circle cx={ox} cy={oy} r={2.5} fill={c.chartMuted} />
      </G>
    );
  };
  return { lines, draw, tText };
}
