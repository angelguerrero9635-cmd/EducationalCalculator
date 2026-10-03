/**
 * HC31 `supersonicFlow` (SupersonicFlowSpec in typesHe2h.ts): a normal shock with its ratio
 * bars (or a pitot probe behind its bow shock), an oblique shock off a wedge, an expansion fan
 * round a corner, a flat plate's shocks and fans, and the sound fronts of a moving point with
 * its Mach cone. Every wave angle comes from the relations in aeroMath.ts. The wedge, walls and
 * probe are painted steel; streamlines, waves and bars stay flat.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { SupersonicFlowSpec } from '@/data/modules/typesHe2h';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, niceCeil, useRep } from './common';
import {
  deflection,
  expansionFan,
  machAngle,
  machCone,
  normalShock,
  plateWaves,
  prandtlMeyer,
  toDeg,
  toRad,
  type FanRay,
} from './aeroMath';
import { Arrow, LH, r4, useValueLabel } from './he1fKit';
import { Deepen, Sheen, url, usePaintIds } from './paint';

const BW = 356;

type Pt = { x: number; y: number };

/** The point where a ray from p at screen angle a (math angle, y up) leaves the box. */
function toEdge(p: Pt, a: number, box: { x0: number; x1: number; y0: number; y1: number }): Pt {
  const dx = Math.cos(a);
  const dy = -Math.sin(a);
  let t = Infinity;
  if (dx > 1e-9) t = Math.min(t, (box.x1 - p.x) / dx);
  if (dx < -1e-9) t = Math.min(t, (box.x0 - p.x) / dx);
  if (dy > 1e-9) t = Math.min(t, (box.y1 - p.y) / dy);
  if (dy < -1e-9) t = Math.min(t, (box.y0 - p.y) / dy);
  return { x: p.x + dx * t, y: p.y + dy * t };
}

/** Where the line p + s(cos a, −sin a) meets the ray from c at angle b. */
function meet(p: Pt, a: number, c: Pt, b: number): Pt | undefined {
  const [d1x, d1y, d2x, d2y] = [Math.cos(a), -Math.sin(a), Math.cos(b), -Math.sin(b)];
  const den = d1x * d2y - d1y * d2x;
  if (Math.abs(den) < 1e-12) return undefined;
  const s = ((c.x - p.x) * d2y - (c.y - p.y) * d2x) / den;
  return { x: p.x + d1x * s, y: p.y + d1y * s };
}

/** A streamline from (x0, y) through a fan centred at c: it bends at each Mach line. */
function fanStreamline(x0: number, y: number, c: Pt, rays: FanRay[], xEnd: number): string {
  let p: Pt = { x: x0, y };
  let d = `M ${x0.toFixed(1)} ${y.toFixed(1)}`;
  let dir = rays[0]!.dir;
  for (let k = 0; k < rays.length; k++) {
    const q = meet(p, dir, c, rays[k]!.angle);
    if (!q || q.x < p.x - 0.5 || q.x > xEnd) break;
    d += ` L ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
    p = q;
    dir = k + 1 < rays.length ? (rays[k]!.dir + rays[k + 1]!.dir) / 2 : rays[k]!.dir;
    if (k === rays.length - 1) dir = rays[k]!.dir;
  }
  const t = (xEnd - p.x) / Math.cos(dir);
  d += ` L ${xEnd.toFixed(1)} ${(p.y - Math.sin(dir) * t).toFixed(1)}`;
  return d;
}

/** An arc of radius r round c from math angle a0 to a1, and where its label goes. */
function arc(c: Pt, r: number, a0: number, a1: number) {
  const p0 = { x: c.x + r * Math.cos(a0), y: c.y - r * Math.sin(a0) };
  const p1 = { x: c.x + r * Math.cos(a1), y: c.y - r * Math.sin(a1) };
  const sweep = a1 > a0 ? 0 : 1;
  const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
  const m = (a0 + a1) / 2;
  return {
    d: `M ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} A ${r} ${r} 0 ${large} ${sweep} ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`,
    at: { x: c.x + (r + 8) * Math.cos(m), y: c.y - (r + 8) * Math.sin(m) },
  };
}

/** Shocks, fans and Mach waves (SupersonicFlowSpec). */
export function SupersonicFlow({ spec, calc }: { spec: SupersonicFlowSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const paint = usePaintIds('steel', 'sheen');
  const valueLabel = useValueLabel(calc);
  const get = (x: NumOrVar | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  const lab = (x: NumOrVar | undefined, name: string) =>
    x === undefined ? undefined : typeof x === 'string' ? valueLabel(x) : `${name} = ${r4(x)}`;
  const g = get(spec.gamma) ?? 1.4;
  const M1 = get(spec.M1);
  const moreLines = (spec.more ?? []).map((id) => valueLabel(id)).filter((t): t is string => !!t);

  let body: ReactNode = null;
  let BH = 220;
  const parts: string[] = [];
  /** Values set out under the picture where the waves leave no room. */
  const rows: string[] = [];
  let faded = false;

  /** Streamline style. */
  const stream = { stroke: c.aeroWind, strokeWidth: 1.3, fill: 'none' } as const;

  if (spec.mode === 'normal') {
    const ok = M1 !== undefined && M1 > 1 && g > 1;
    faded = !ok && M1 !== undefined;
    const ns = ok ? normalShock(M1!, g) : undefined;
    const [top, bot] = [30, 134];
    const ys = [44, 68, 96, 120];
    const xs = spec.probe ? 222 : 160;
    const L1 = 60;
    const L2 = ns ? L1 / ns.rho : 0;
    const ratios = spec.ratios ?? {};
    const rows = (
      [
        ['p', ratios.p, 'p₂/p₁', ns?.p],
        ['rho', ratios.rho, 'ρ₂/ρ₁', ns?.rho],
        ['T', ratios.T, 'T₂/T₁', ns?.T],
        ['p0', ratios.p0, 'p₀₂/p₀₁', ns?.p0],
      ] as const
    ).filter((r) => r[1] !== undefined);
    const vals = rows.map((r) => get(r[1]));
    const big = niceCeil(Math.max(1, ...vals.map((v) => v ?? 0)));
    const barX = 150;
    const barW = BW - 12 - barX;
    const rowTop = bot + 30;
    const probe = spec.probe;
    const bow = (y: number) => xs - 14 + 0.012 * (y - 82) ** 2;
    body = (
      <G opacity={faded ? 0.35 : 1}>
        {/* Streamlines, the arrows before and after (shorter by ρ₁ ÷ ρ₂). */}
        {ys.map((y) => (
          <Line key={y} x1={14} x2={BW - 14} y1={y} y2={y} {...stream} />
        ))}
        {ys
          .filter((_, k) => k % 2 === 0)
          .map((y) => (
            <G key={y}>
              <Arrow x1={28} y1={y + 12} x2={28 + L1} y2={y + 12} color={c.aeroWind} width={2.4} />
              {L2 > 0 && !probe && (
                <Arrow
                  x1={xs + 30}
                  y1={y + 12}
                  x2={xs + 30 + L2}
                  y2={y + 12}
                  color={c.aeroWind}
                  width={2.4}
                />
              )}
            </G>
          ))}
        {/* The shock: straight across, or bowed in front of the probe. */}
        {!probe && (
          <Line x1={xs} x2={xs} y1={top} y2={bot} stroke={c.aeroShock} strokeWidth={3.5} />
        )}
        {probe && (
          <G>
            <Path
              d={Array.from({ length: 27 }, (_, k) => {
                const y = top + ((bot - top) * k) / 26;
                return `${k ? 'L' : 'M'} ${bow(y).toFixed(1)} ${y.toFixed(1)}`;
              }).join(' ')}
              stroke={c.aeroShock}
              strokeWidth={3}
              fill="none"
            />
            <Path
              d={`M ${xs} 82 Q ${xs} 76 ${xs + 8} 76 L ${BW - 10} 76 L ${BW - 10} 88 L ${xs + 8} 88 Q ${xs} 88 ${xs} 82 Z`}
              fill={url(paint.steel)}
              stroke={c.metalDark}
            />
            <Path
              d={`M ${xs} 82 Q ${xs} 76 ${xs + 8} 76 L ${BW - 10} 76 L ${BW - 10} 88 L ${xs + 8} 88 Q ${xs} 88 ${xs} 82 Z`}
              fill={url(paint.sheen)}
            />
            <Circle cx={xs} cy={82} r={2.5} fill={c.chartInk} />
            <ChartText
              x={BW - 10}
              y={bot + 16}
              fontSize={chart.label}
              fontWeight="bold"
              textAnchor="end"
            >
              {lab(probe.p02, 'p₀₂') ?? 'p₀₂'}
            </ChartText>
          </G>
        )}
        <ChartText x={14} y={20} fontSize={chart.label} fontWeight="bold" fill={c.aeroWind}>
          {lab(spec.M1, 'M₁') ?? 'M₁'}
        </ChartText>
        {!probe && (
          <ChartText x={xs + 30} y={20} fontSize={chart.label} fontWeight="bold" fill={c.aeroWind}>
            {lab(spec.M2, 'M₂') ?? ''}
          </ChartText>
        )}
        <ChartText
          x={probe ? bow(top) - 4 : xs}
          y={bot + 16}
          fontSize={chart.label}
          textAnchor={probe ? 'end' : 'middle'}
          fill={c.aeroShock}
        >
          {probe ? 'bow shock' : 'normal shock'}
        </ChartText>
        {/* The ratios as bars on one scale, 1 dashed. */}
        {rows.length > 0 && (
          <Line
            x1={barX + barW / big}
            x2={barX + barW / big}
            y1={rowTop - 12}
            y2={rowTop + rows.length * 20 - 6}
            stroke={c.chartMuted}
            strokeDasharray={chart.dash}
          />
        )}
        {rows.map((r, k) => {
          const v = vals[k];
          const y = rowTop + k * 20;
          return (
            <G key={r[0]}>
              <ChartText x={8} y={y + 4} fontSize={chart.label}>
                {lab(r[1], r[2]) ?? `${r[2]} = ?`}
              </ChartText>
              {v !== undefined && v > 0 && (
                <Rect
                  x={barX}
                  y={y - 6}
                  width={(v / big) * barW}
                  height={12}
                  rx={2}
                  fill={v >= 1 ? c.aeroShock : c.aeroLift}
                  opacity={0.75}
                />
              )}
            </G>
          );
        })}
        {rows.length > 0 && (
          <ChartText
            x={barX + barW / big}
            y={rowTop + rows.length * 20 + 8}
            fontSize={chart.label}
            textAnchor="middle"
            fill={c.chartMuted}
          >
            1
          </ChartText>
        )}
      </G>
    );
    BH = rows.length ? rowTop + rows.length * 20 + 14 : bot + 24;
    if (faded) parts.push('A normal shock needs M₁ > 1: below it there is no shock.');
    else if (ns && probe)
      parts.push(
        `The probe's bow shock is normal on the axis: the flow reaches the tip subsonic at M ${r4(ns.M2)}, then stops isentropically, so the probe reads p₀₂, not p₀₁.`,
      );
    else if (ns)
      parts.push(
        `Supersonic in, subsonic out: M ${r4(M1!)} → ${r4(ns.M2)}. The gas slows by ${r4(ns.rho)} times, so the arrows shorten; p₀ falls to ${r4(ns.p0)} of its value.`,
      );
  } else if (spec.mode === 'wedge') {
    const beta = get(spec.beta);
    const theta0 = get(spec.theta);
    const mu = M1 !== undefined && M1 > 1 ? machAngle(M1) : undefined;
    const th =
      theta0 ??
      (M1 !== undefined && beta !== undefined ? toDeg(deflection(M1, toRad(beta), g)) : undefined);
    const okAngles =
      M1 !== undefined &&
      M1 > 1 &&
      beta !== undefined &&
      th !== undefined &&
      th > 0 &&
      beta > th &&
      mu !== undefined &&
      toRad(beta) >= mu - 1e-9;
    faded = !okAngles && beta !== undefined && th !== undefined;
    const C = { x: 120, y: 178 };
    const box = { x0: 14, x1: BW - 12, y0: 34, y1: C.y };
    const thR = toRad(th ?? 10);
    const bR = toRad(beta ?? 40);
    const ramp = toEdge(C, thR, { ...box, y1: 400 });
    const shockEnd = toEdge(C, bR, box);
    const muEnd = mu !== undefined ? toEdge(C, mu, box) : undefined;
    const wedge = `M 14 ${C.y} L ${C.x} ${C.y} L ${ramp.x.toFixed(1)} ${ramp.y.toFixed(1)} L ${BW - 12} ${C.y + 20} L 14 ${C.y + 20} Z`;
    const hs = [26, 62, 98, 134];
    const aTh = arc(C, 52, 0, thR);
    const aB = arc(C, 92, 0, bR);
    body = (
      <G opacity={faded ? 0.35 : 1}>
        {hs.map((h) => {
          const y = C.y - h;
          const xs = C.x + h / Math.tan(bR);
          const x1 = Math.min(xs, BW - 12);
          const after = x1 < BW - 12;
          return (
            <Path
              key={h}
              d={`M 14 ${y} L ${x1.toFixed(1)} ${y}${after ? ` L ${BW - 12} ${(y - (BW - 12 - x1) * Math.tan(thR)).toFixed(1)}` : ''}`}
              {...stream}
            />
          );
        })}
        <Path d={wedge} fill={url(paint.steel)} stroke={c.metalDark} />
        <Path d={wedge} fill={url(paint.sheen)} />
        {muEnd && (
          <Line
            x1={C.x}
            y1={C.y}
            x2={muEnd.x}
            y2={muEnd.y}
            stroke={c.chartMuted}
            strokeDasharray={chart.dash}
          />
        )}
        {beta !== undefined && (
          <Line
            x1={C.x}
            y1={C.y}
            x2={shockEnd.x}
            y2={shockEnd.y}
            stroke={c.aeroShock}
            strokeWidth={3}
          />
        )}
        <Line
          x1={C.x}
          x2={C.x + 104}
          y1={C.y}
          y2={C.y}
          stroke={c.chartInk}
          strokeDasharray={chart.dashFine}
        />
        {th !== undefined && <Path d={aTh.d} stroke={c.chartInk} fill="none" />}
        {beta !== undefined && <Path d={aB.d} stroke={c.aeroShock} fill="none" />}
        {th !== undefined && (
          <ChartText x={aTh.at.x + 2} y={aTh.at.y + 4} fontSize={chart.label} halo>
            {lab(spec.theta, 'θ') ?? `θ = ${r4(th)}°`}
          </ChartText>
        )}
        {beta !== undefined && (
          <ChartText x={aB.at.x + 2} y={aB.at.y + 4} fontSize={chart.label} fill={c.aeroShock} halo>
            {lab(spec.beta, 'β') ?? ''}
          </ChartText>
        )}
        <ChartText x={14} y={20} fontSize={chart.label} fontWeight="bold" fill={c.aeroWind}>
          {lab(spec.M1, 'M₁') ?? 'M₁'}
        </ChartText>
        <ChartText
          x={BW - 12}
          y={20}
          fontSize={chart.label}
          fontWeight="bold"
          textAnchor="end"
          fill={c.aeroWind}
        >
          {lab(spec.M2, 'M₂') ?? ''}
        </ChartText>
      </G>
    );
    BH = C.y + 24;
    if (mu !== undefined) rows.push(`Mach angle μ₁ = ${r4(toDeg(mu))}° (dashed)`);
    if (faded)
      parts.push(
        mu !== undefined && beta !== undefined && toRad(beta) < mu
          ? `β must be at least the Mach angle μ₁ = ${r4(toDeg(mu))}°: a weaker wave is no shock.`
          : 'β must be more than θ, and θ more than 0, for an attached shock.',
      );
    else if (beta !== undefined && th !== undefined)
      parts.push(
        `The shock stands at β = ${r4(beta)}°, steeper than the Mach angle ${r4(toDeg(mu!))}° and than the wedge's θ = ${r4(th)}°; the streamlines turn by θ as they cross it.`,
      );
  } else if (spec.mode === 'corner') {
    const theta = get(spec.theta);
    const ok = M1 !== undefined && M1 >= 1 && theta !== undefined && theta >= 0;
    const rays = ok ? expansionFan(M1!, 0, toRad(theta!), g, 6) : undefined;
    faded = !rays && theta !== undefined && M1 !== undefined;
    const C = { x: 128, y: 160 };
    const thR = toRad(theta ?? 10);
    const wallEnd = toEdge(C, -thR, { x0: 14, x1: BW - 12, y0: 0, y1: 400 });
    const wall = `M 14 ${C.y} L ${C.x} ${C.y} L ${wallEnd.x.toFixed(1)} ${wallEnd.y.toFixed(1)} L ${BW - 12} ${Math.max(C.y + 20, wallEnd.y + 14)} L 14 ${Math.max(C.y + 20, wallEnd.y + 14)} Z`;
    const box = { x0: 14, x1: BW - 12, y0: 34, y1: C.y };
    const hs = [24, 56, 88, 120];
    const aTh = arc(C, 54, -thR, 0);
    const bottom = Math.max(C.y + 20, wallEnd.y + 14);
    body = (
      <G opacity={faded ? 0.35 : 1}>
        {rays &&
          hs.map((h) => (
            <Path key={h} d={fanStreamline(14, C.y - h, C, rays, BW - 12)} {...stream} />
          ))}
        {!rays &&
          hs.map((h) => (
            <Line key={h} x1={14} x2={BW - 12} y1={C.y - h} y2={C.y - h} {...stream} />
          ))}
        <Path d={wall} fill={url(paint.steel)} stroke={c.metalDark} />
        <Path d={wall} fill={url(paint.sheen)} />
        {rays?.map((r, k) => {
          const e = toEdge(C, r.angle, box);
          const edge = k === 0 || k === rays.length - 1;
          return (
            <Line
              key={k}
              x1={C.x}
              y1={C.y}
              x2={e.x}
              y2={e.y}
              stroke={c.aeroFan}
              strokeWidth={edge ? 2 : 1}
              strokeDasharray={edge ? undefined : chart.dashFine}
            />
          );
        })}
        <Line
          x1={C.x}
          x2={C.x + 96}
          y1={C.y}
          y2={C.y}
          stroke={c.chartInk}
          strokeDasharray={chart.dashFine}
        />
        {theta !== undefined && <Path d={aTh.d} stroke={c.chartInk} fill="none" />}
        {theta !== undefined && (
          <ChartText x={aTh.at.x + 4} y={aTh.at.y + 8} fontSize={chart.label} halo>
            {lab(spec.theta, 'θ') ?? ''}
          </ChartText>
        )}
        <ChartText
          x={14}
          y={bottom + 16}
          fontSize={chart.label}
          fontWeight="bold"
          fill={c.aeroWind}
        >
          {lab(spec.M1, 'M₁') ?? 'M₁'}
        </ChartText>
        <ChartText
          x={BW - 12}
          y={bottom + 16}
          fontSize={chart.label}
          fontWeight="bold"
          textAnchor="end"
          fill={c.aeroWind}
        >
          {lab(spec.M2, 'M₂') ?? ''}
        </ChartText>
      </G>
    );
    BH = bottom + 24;
    if (rays)
      rows.push(
        `Fan from μ₁ = ${r4(toDeg(rays[0]!.angle))}° to μ₂ = ${r4(toDeg(rays[rays.length - 1]!.angle - rays[rays.length - 1]!.dir))}°`,
      );
    if (faded) parts.push('The flow can’t turn that far: ν would pass its largest value.');
    else if (rays && theta !== undefined)
      parts.push(
        `ν rises by exactly θ: ${r4(toDeg(prandtlMeyer(M1!, g)))}° + ${r4(theta)}° = ${r4(toDeg(prandtlMeyer(M1!, g)) + theta)}°. The fan runs from μ₁ off the flow before to μ₂ off the flow after.`,
      );
  } else if (spec.mode === 'flatPlate') {
    const alpha = get(spec.alpha);
    const M = M1;
    const waves =
      M !== undefined && M > 1 && alpha !== undefined && alpha > 0
        ? plateWaves(M, toRad(alpha), g)
        : undefined;
    faded = !waves && M !== undefined && alpha !== undefined;
    const P = { x: 178, y: 118 };
    const a = toRad(alpha ?? 4);
    const half = 78;
    const LE = { x: P.x - half * Math.cos(a), y: P.y - half * Math.sin(a) };
    const TE = { x: P.x + half * Math.cos(a), y: P.y + half * Math.sin(a) };
    const box = { x0: 8, x1: BW - 8, y0: 30, y1: 210 };
    const ray = (p: Pt, ang: number, k: number, color: string, w = 1.6, dashed = false) => {
      const e = toEdge(p, ang, box);
      return (
        <Line
          key={k}
          x1={p.x}
          y1={p.y}
          x2={e.x}
          y2={e.y}
          stroke={color}
          strokeWidth={w}
          strokeDasharray={dashed ? chart.dashFine : undefined}
        />
      );
    };
    const cl = get(spec.cl);
    const cd = get(spec.cd);
    const liftLen = cl !== undefined && cl > 0 ? 64 : 0;
    const dragLen = cl !== undefined && cd !== undefined && cl > 0 ? (64 * cd) / cl : 0;
    body = (
      <G opacity={faded ? 0.35 : 1}>
        {[46, 76, 160, 190].map((y) => (
          <Line key={y} x1={8} x2={52} y1={y} y2={y} {...stream} />
        ))}
        <Arrow x1={10} y1={P.y} x2={58} y2={P.y} color={c.aeroWind} width={2.4} />
        {waves && (
          <G>
            {waves.leFan.map((r, k) =>
              ray(
                LE,
                r.angle,
                k,
                c.aeroFan,
                k === 0 || k === waves.leFan.length - 1 ? 1.8 : 1,
                k > 0 && k < waves.leFan.length - 1,
              ),
            )}
            {ray(LE, -waves.leShock.angle, 20, c.aeroShock, 2.6)}
            {ray(TE, waves.teShock.angle, 21, c.aeroShock, 2.6)}
            {waves.teFan.map((r, k) =>
              ray(
                TE,
                -r.angle,
                30 + k,
                c.aeroFan,
                k === 0 || k === waves.teFan.length - 1 ? 1.8 : 1,
                k > 0 && k < waves.teFan.length - 1,
              ),
            )}
          </G>
        )}
        {/* The plate. */}
        <Path
          d={`M ${LE.x} ${LE.y - 2} L ${TE.x} ${TE.y - 2} L ${TE.x} ${TE.y + 2} L ${LE.x} ${LE.y + 2} Z`}
          fill={url(paint.steel)}
          stroke={c.metalDark}
        />
        <Line
          x1={LE.x - 50}
          x2={LE.x}
          y1={LE.y}
          y2={LE.y}
          stroke={c.chartInk}
          strokeDasharray={chart.dashFine}
        />
        <ChartText x={LE.x - 52} y={LE.y - 6} fontSize={chart.label} textAnchor="end" halo>
          {lab(spec.alpha, 'α') ?? 'α'}
        </ChartText>
        {liftLen > 0 && (
          <G>
            <Arrow x1={P.x} y1={P.y} x2={P.x} y2={P.y - liftLen} color={c.aeroLift} width={3} />
          </G>
        )}
        {dragLen > 0 && (
          <G>
            <Line
              x1={P.x}
              x2={P.x + dragLen}
              y1={P.y}
              y2={P.y}
              stroke={c.aeroDrag}
              strokeWidth={3}
            />
          </G>
        )}
        <ChartText x={8} y={20} fontSize={chart.label} fontWeight="bold" fill={c.aeroWind}>
          {lab(spec.M1, 'M∞') ?? 'M∞'}
        </ChartText>
        <ChartText x={BW - 8} y={20} fontSize={chart.label} textAnchor="end" fill={c.chartMuted}>
          shocks solid, fans in fine lines
        </ChartText>
      </G>
    );
    BH = box.y1 + 8;
    {
      const coeffs = [lab(spec.cl, 'c_l'), lab(spec.cd, 'c_d')].filter((t): t is string => !!t);
      if (coeffs.length) rows.push(`${coeffs.join(' (lift, up) · ')} (drag, back)`);
    }
    if (faded) parts.push('Shock-expansion needs M∞ > 1 and an attached shock at this α.');
    else if (waves)
      parts.push(
        `Above, the flow speeds up to M ${r4(waves.upper)} through the fan; below, it slows to M ${r4(waves.lower)} behind the shock. The pressure difference lifts the plate ⟂ the stream and drags it back.`,
      );
  } else {
    // ── A moving point and its sound fronts ──
    const M = M1;
    const cone = M !== undefined ? machCone(M) : undefined;
    const n = 5;
    const cy = 112;
    const s = M !== undefined ? Math.min(18, 320 / (n * (M + 1))) : 18;
    const rightReach = M !== undefined ? Math.max(0, n * s * (1 - M)) : 0;
    const xp = BW - 14 - rightReach;
    const fronts =
      M !== undefined
        ? Array.from({ length: n }, (_, k) => {
            const t = k + 1;
            return { cx: xp - M * t * s, r: t * s };
          })
        : [];
    const box = { x0: 8, x1: BW - 8, y0: 20, y1: 204 };
    body = (
      <G>
        {fronts.map((f, k) => (
          <Circle
            key={k}
            cx={f.cx}
            cy={cy}
            r={f.r}
            stroke={c.aeroFan}
            strokeWidth={1.3}
            fill="none"
          />
        ))}
        {fronts.map((f, k) => (
          <Circle key={`d${k}`} cx={f.cx} cy={cy} r={1.8} fill={c.chartMuted} />
        ))}
        {cone !== undefined &&
          [1, -1].map((sg) => {
            const e = toEdge({ x: xp, y: cy }, Math.PI - sg * cone, box);
            return (
              <Line
                key={sg}
                x1={xp}
                y1={cy}
                x2={e.x}
                y2={e.y}
                stroke={c.aeroShock}
                strokeWidth={2.4}
              />
            );
          })}
        {cone !== undefined && (
          <G>
            <Path
              d={arc({ x: xp, y: cy }, 60, Math.PI, Math.PI - cone).d}
              stroke={c.aeroShock}
              fill="none"
            />
          </G>
        )}
        <Circle cx={xp} cy={cy} r={4.5} fill={c.chartInk} />
        <Arrow x1={xp - 34} y1={cy + 98} x2={xp} y2={cy + 98} color={c.chartInk} width={2} />
        <ChartText
          x={xp - 38}
          y={cy + 102}
          fontSize={chart.label}
          textAnchor="end"
          fontWeight="bold"
        >
          {lab(spec.M1, 'M') ?? 'M'}
        </ChartText>
      </G>
    );
    BH = cy + 112;
    if (cone !== undefined)
      rows.push(`${lab(spec.mu, 'μ') ?? `μ = ${r4(toDeg(cone))}°`} (the arc at the point)`);
    if (M === undefined) parts.push('Type M to draw the fronts.');
    else if (cone !== undefined)
      parts.push(
        `The point outruns its sound: the fronts pile up on a cone at μ = sin⁻¹(1 ÷ ${r4(M)}) = ${r4(toDeg(cone))}°. Ahead of it, nothing is heard yet.`,
      );
    else if (M === 1)
      parts.push('At M = 1 every front touches the point: a flat front, no cone yet.');
    else
      parts.push(
        `M = ${r4(M)} < 1: each front runs ahead of the point, so no cone forms and the air ahead hears it coming.`,
      );
  }

  const rowTop = BH;
  const lines = [...rows, ...moreLines];
  if (lines.length) BH += lines.length * LH + 6;

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <Deepen id={paint.steel} from={c.metal} to={c.metalDark} />
              <Sheen id={paint.sheen} vertical />
            </Defs>
            <G transform={`scale(${w / BW})`}>
              {body}
              {lines.map((t, k) => (
                <ChartText key={t} x={8} y={rowTop + 6 + k * LH} fontSize={chart.label}>
                  {t}
                </ChartText>
              ))}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{parts.join(' ')}</Caption>
    </View>
  );
}
