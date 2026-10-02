/**
 * The college globe (HC36, EG-P3): an orthographic globe with a graticule, flat like a
 * diagram, in five modes: `sun` (noon sun angle and day length), `route` (a great circle and
 * its central angle, the rhumb line dashed), `euler` (a plate turning about its Euler pole),
 * `dipole` (the dip of a dipole field) and `momentum` (air carried poleward keeping its angular
 * momentum). The math is in `globeMath.ts` (the harness and the demos use it too).
 */
import { View } from 'react-native';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Line,
  Path,
  Polygon,
  Rect,
} from 'react-native-svg';

import type { GlobeSpec } from '@/data/modules/typesHe2k';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { fig3, textW } from './he1dText';
import {
  EARTH_KM,
  RAD,
  RIM_MS,
  add,
  centralAngle,
  cross,
  dayLength,
  dot,
  drawnAngle,
  greatCircle,
  inclination,
  litShare,
  momentumWind,
  noonAngle,
  norm,
  paleolatitude,
  plateSpeed,
  rhumbLine,
  scale,
  sunriseHour,
  toVec,
  type V3,
} from './globeMath';
import { url, usePaintIds } from './paint';

type Palette = ReturnType<typeof usePalette>;
type Spec<M extends GlobeSpec['mode']> = Extract<GlobeSpec, { mode: M }>;

/** Degrees as a picture shows them: 3 figures, the degree sign. */
const deg = (x: number) => `${fig3(x)}°`;
/** A latitude or longitude with its hemisphere: 40° N, 75° W. */
const ns = (x: number) =>
  `${formatNumber(Number(Math.abs(x).toPrecision(4)))}° ${x < 0 ? 'S' : 'N'}`;
const ew = (x: number) =>
  `${formatNumber(Number(Math.abs(x).toPrecision(4)))}°${x === 0 ? '' : x < 0 ? ' W' : ' E'}`;

/** An arrow from (x1, y1) to (x2, y2) with a filled head. */
function Arrow({
  x1,
  y1,
  x2,
  y2,
  color,
  width = 2.2,
  dash,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width?: number;
  dash?: string;
}) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 1) return null;
  const [ux, uy] = [(x2 - x1) / len, (y2 - y1) / len];
  const head = Math.min(9, len * 0.6);
  const bx = x2 - ux * head;
  const by = y2 - uy * head;
  return (
    <G>
      <Line
        x1={x1}
        y1={y1}
        x2={bx}
        y2={by}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dash}
      />
      <Polygon
        points={`${x2},${y2} ${bx - uy * head * 0.45},${by + ux * head * 0.45} ${bx + uy * head * 0.45},${by - ux * head * 0.45}`}
        fill={color}
      />
    </G>
  );
}

/** An orthographic view: screen x along u, up along v, toward the viewer along n. */
interface ViewBasis {
  u: V3;
  v: V3;
  n: V3;
}

/** A path through the visible (front) runs of a curve of unit vectors. */
function frontPath(pts: V3[], view: ViewBasis, cx: number, cy: number, R: number): string {
  const d: string[] = [];
  let pen = false;
  for (const p of pts) {
    if (dot(p, view.n) < -1e-9) {
      pen = false;
      continue;
    }
    d.push(
      `${pen ? 'L' : 'M'} ${(cx + R * dot(p, view.u)).toFixed(2)} ${(cy - R * dot(p, view.v)).toFixed(2)}`,
    );
    pen = true;
  }
  return d.join(' ');
}

/** Parallels every 30° and meridians every 30°, the front halves. */
function Graticule({
  view,
  cx,
  cy,
  R,
  c,
}: {
  view: ViewBasis;
  cx: number;
  cy: number;
  R: number;
  c: Palette;
}) {
  const lines: { d: string; equator: boolean }[] = [];
  for (const lat of [-60, -30, 0, 30, 60]) {
    const pts: V3[] = [];
    for (let i = 0; i <= 120; i++) pts.push(toVec(lat, -180 + i * 3));
    lines.push({ d: frontPath(pts, view, cx, cy, R), equator: lat === 0 });
  }
  for (let lon = -180; lon < 180; lon += 30) {
    const pts: V3[] = [];
    for (let i = 0; i <= 60; i++) pts.push(toVec(-90 + i * 3, lon));
    lines.push({ d: frontPath(pts, view, cx, cy, R), equator: false });
  }
  return (
    <G>
      {lines.map((l, i) =>
        l.d ? (
          <Path
            key={i}
            d={l.d}
            stroke={l.equator ? c.chartMuted : c.chartGrid}
            strokeWidth={l.equator ? 1.4 : 1}
            fill="none"
          />
        ) : null,
      )}
    </G>
  );
}

export function Globe({ spec, calc }: { spec: GlobeSpec; calc: Calculator }) {
  switch (spec.mode) {
    case 'sun':
      return <SunGlobe spec={spec} calc={calc} />;
    case 'route':
      return <RouteGlobe spec={spec} calc={calc} />;
    case 'euler':
      return <EulerGlobe spec={spec} calc={calc} />;
    case 'dipole':
      return <DipoleGlobe spec={spec} calc={calc} />;
    case 'momentum':
      return <MomentumGlobe spec={spec} calc={calc} />;
  }
}

/** The values a mode reads, with "?" as undefined. */
function useValues(calc: Calculator) {
  const rep = useRep(calc);
  // In formula units (degrees, km, m/s), whatever units the boxes show.
  const get = (x: string | number | undefined) => {
    if (x === undefined) return undefined;
    if (typeof x === 'number') return x;
    return rep.known(x) && Number.isFinite(rep.val(x)) ? rep.val(x) : undefined;
  };
  return { rep, get };
}

// ─── sun ─────────────────────────────────────────────────────────────────────

function SunGlobe({ spec, calc }: { spec: Spec<'sun'>; calc: Calculator }) {
  const c = usePalette();
  const { get } = useValues(calc);
  const ids = usePaintIds('disk');
  const lat = get(spec.latitude);
  const dec = get(spec.declination);
  const lit = dec !== undefined;
  const d = dec ?? 0;
  const place = lat !== undefined && Math.abs(lat) <= 90;
  const both = place && lit;
  const noon = both ? noonAngle(lat!, d) : NaN;
  const H = both ? sunriseHour(lat!, d) : NaN;
  const day = both ? dayLength(lat!, d) : NaN;
  const seen = both && noon > 0;
  const H_ = 300;

  const art = (w: number) => {
    const R = Math.min(108, w * 0.3);
    const cx = 58 + R;
    const cy = 30 + R;
    // Up-and-left frame: a = the axis, e = the equator's noon point (toward the Sun).
    const a: [number, number] = [-Math.sin(d * RAD), Math.cos(d * RAD)];
    const e: [number, number] = [-Math.cos(d * RAD), -Math.sin(d * RAD)];
    const S = (x: number, y: number) => [cx + R * x, cy - R * y] as const;
    const at = (phi: number, cosh: number) =>
      S(
        Math.sin(phi * RAD) * a[0] + Math.cos(phi * RAD) * cosh * e[0],
        Math.sin(phi * RAD) * a[1] + Math.cos(phi * RAD) * cosh * e[1],
      );
    const [n0, n1] = [S(a[0] * 1.18, a[1] * 1.18), S(-a[0] * 1.18, -a[1] * 1.18)];
    const [e0, e1] = [at(0, 1), at(0, -1)];
    const hi = c.chartHighlight;
    // The place's parallel: noon end, sunrise point (on the terminator), midnight end.
    const noonEnd = place ? at(lat!, 1) : undefined;
    const nightEnd = place ? at(lat!, -1) : undefined;
    const H0 = both ? H : 0;
    const rise = place ? at(lat!, Math.cos(H0 * RAD)) : undefined;
    // The noon ray to the place and its angle with the horizon.
    const P = noonEnd;
    const rays = [-0.72, 0.72].map((k) => cy + k * R);
    // The rays' name by the ray farther from the place's own.
    const raysLabelY =
      P && Math.abs(P[1] - rays[0]!) < Math.abs(P[1] - rays[1]!) ? rays[1]! + 18 : rays[0]! - 8;
    // North of the subsolar point the noon angle opens below the ray: the name goes above.
    const arcBelow = place && lat! > d;
    const dialR = 26;
    const dx = w - dialR - 16;
    const dy = cy + R - dialR + 4;
    const wedge = (from: number, to: number) => {
      // Angles in degrees clockwise from the top (noon at the top).
      const p = (t: number) => [dx + dialR * Math.sin(t * RAD), dy - dialR * Math.cos(t * RAD)];
      const [x0, y0] = p(from);
      const [x1, y1] = p(to);
      return `M ${dx} ${dy} L ${x0} ${y0} A ${dialR} ${dialR} 0 ${to - from > 180 ? 1 : 0} 1 ${x1} ${y1} Z`;
    };
    return (
      <Svg width={w} height={H_}>
        <Defs>
          <ClipPath id={ids.disk}>
            <Circle cx={cx} cy={cy} r={R} />
          </ClipPath>
        </Defs>
        {lit ? (
          <G>
            {rays.map((y, i) => (
              <Arrow
                key={i}
                x1={6}
                y1={y}
                x2={cx - Math.sqrt(Math.max(0, R * R - (y - cy) ** 2)) - 2}
                y2={y}
                color={c.chartSecond}
                width={1.6}
              />
            ))}
            <ChartText x={6} y={raysLabelY} fontSize={chart.label} fill={c.chartMuted}>
              Sun’s rays
            </ChartText>
          </G>
        ) : null}
        <Circle cx={cx} cy={cy} r={R} fill={lit ? c.globeNight : c.globeSea} />
        {lit ? (
          <Path d={`M ${cx} ${cy - R} A ${R} ${R} 0 0 0 ${cx} ${cy + R} Z`} fill={c.globeDay} />
        ) : null}
        <G clipPath={url(ids.disk)}>
          <Line
            x1={e0[0]}
            y1={e0[1]}
            x2={e1[0]}
            y2={e1[1]}
            stroke={c.chartMuted}
            strokeWidth={1.4}
          />
          {lit ? (
            <Line
              x1={cx}
              y1={cy - R}
              x2={cx}
              y2={cy + R}
              stroke={c.chartInk}
              strokeWidth={1.2}
              strokeDasharray={chart.dash}
            />
          ) : null}
          {place ? (
            <G opacity={lat === 90 || lat === -90 ? 0.4 : 1}>
              <Line
                x1={rise![0]}
                y1={rise![1]}
                x2={nightEnd![0]}
                y2={nightEnd![1]}
                stroke={c.chartInk}
                strokeWidth={2}
                strokeDasharray={chart.dashFine}
              />
              <Line
                x1={noonEnd![0]}
                y1={noonEnd![1]}
                x2={rise![0]}
                y2={rise![1]}
                stroke={lit ? hi : c.chartInk}
                strokeWidth={3.5}
              />
            </G>
          ) : null}
        </G>
        <Circle cx={cx} cy={cy} r={R} fill="none" stroke={c.chartInk} strokeWidth={1.4} />
        <Line x1={n0[0]} y1={n0[1]} x2={n1[0]} y2={n1[1]} stroke={c.chartInk} strokeWidth={1.4} />
        <ChartText
          x={n0[0] + 4}
          y={n0[1] - 2}
          fontSize={chart.label}
          fontWeight="700"
          fill={c.chartInk}
        >
          N
        </ChartText>
        {lit ? <Circle cx={cx - R} cy={cy} r={4} fill={c.chartSecond} /> : null}
        {P && seen ? (
          <G>
            {/* The noon ray to the place, its horizon and the angle between them. */}
            <Arrow x1={6} y1={P[1]} x2={P[0] - 3} y2={P[1]} color={hi} width={2} />
            {(() => {
              const rx = (P[0] - cx) / R;
              const ry = -(P[1] - cy) / R;
              // The horizon toward the Sun: perpendicular to the radius, its x-part negative.
              let [tx, ty] = [-ry, rx];
              if (tx > 0) [tx, ty] = [-tx, -ty];
              const L = 30;
              const h0 = [P[0] - L * tx, P[1] + L * ty];
              const h1 = [P[0] + L * tx, P[1] - L * ty];
              const ar = 20;
              const angH = (Math.atan2(ty, tx) + 2 * Math.PI) % (2 * Math.PI);
              const angS = Math.PI;
              const sweepStart = Math.min(angH, angS);
              const sweepEnd = Math.max(angH, angS);
              const q = (t: number) => [P[0] + ar * Math.cos(t), P[1] - ar * Math.sin(t)];
              const [qa, qb] = [q(sweepStart), q(sweepEnd)];
              const mid = (sweepStart + sweepEnd) / 2;
              const text = deg(noon);
              const lx = P[0] + 44 * Math.cos(mid);
              const ly = P[1] - 44 * Math.sin(mid);
              return (
                <G>
                  <Line
                    x1={h0[0]}
                    y1={h0[1]}
                    x2={h1[0]}
                    y2={h1[1]}
                    stroke={c.chartInk}
                    strokeWidth={1.4}
                  />
                  <Path
                    d={`M ${qa[0]} ${qa[1]} A ${ar} ${ar} 0 0 0 ${qb[0]} ${qb[1]}`}
                    stroke={hi}
                    strokeWidth={1.6}
                    fill="none"
                  />
                  <ChartText
                    x={lx}
                    y={ly + 4}
                    textAnchor="middle"
                    fontSize={chart.label}
                    fontWeight="700"
                    fill={hi}
                    halo
                  >
                    {text}
                  </ChartText>
                </G>
              );
            })()}
          </G>
        ) : null}
        {P ? (
          <G>
            <Circle cx={P[0]} cy={P[1]} r={4.5} fill={hi} stroke={c.paper} strokeWidth={1.2} />
            <ChartText
              x={P[0] - 8}
              y={arcBelow ? P[1] - 10 : P[1] + 18}
              textAnchor="end"
              fontSize={chart.label}
              fontWeight="700"
              halo
            >
              {ns(lat!)}
            </ChartText>
          </G>
        ) : null}
        {both ? (
          <G>
            <Circle
              cx={dx}
              cy={dy}
              r={dialR}
              fill={c.globeNight}
              stroke={c.chartInk}
              strokeWidth={1.2}
            />
            {H >= 180 ? (
              <Circle
                cx={dx}
                cy={dy}
                r={dialR}
                fill={c.globeDay}
                stroke={c.chartInk}
                strokeWidth={1.2}
              />
            ) : H > 0 ? (
              <Path d={wedge(-H, H)} fill={c.globeDay} stroke={c.chartInk} strokeWidth={1} />
            ) : null}
            <ChartText
              x={dx}
              y={dy - dialR - 6}
              textAnchor="middle"
              fontSize={chart.label}
              fill={c.chartMuted}
            >
              noon
            </ChartText>
            <ChartText
              x={fitLabel(dx, `day ${fig3(day)} h`, chart.label, w, 'middle').x}
              y={dy + dialR + 16}
              textAnchor="middle"
              fontSize={chart.label}
              fontWeight="700"
            >
              {`day ${fig3(day)} h`}
            </ChartText>
          </G>
        ) : null}
      </Svg>
    );
  };

  const caption = !lit
    ? 'Type the declination δ to light the globe.'
    : !place
      ? `The Sun is overhead at δ = ${deg(d)}. Type the latitude φ to mark the place.`
      : [
          `The Sun is overhead at δ = ${deg(d)}; the place is at φ = ${deg(lat!)}.`,
          seen
            ? `Noon sun angle = 90° − |φ − δ| = 90° − ${deg(Math.abs(lat! - d))} = ${deg(noon)}.`
            : `|φ − δ| is more than 90°: the noon sun stays below the horizon.`,
          H >= 180
            ? 'The whole parallel is lit: midnight sun, 24 h of day.'
            : H <= 0
              ? 'None of the parallel is lit: polar night, 0 h of day.'
              : `cos H = −tan φ tan δ, so H = ${deg(H)}: ${fig3(litShare(lat!, d) * 100)}% of the parallel is lit, day = 2H ÷ 15 = ${fig3(day)} h.`,
        ].join(' · ');
  return (
    <View>
      <Canvas aspect={(w) => H_ / w}>{({ w }) => art(w)}</Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}

// ─── route ───────────────────────────────────────────────────────────────────

function RouteGlobe({ spec, calc }: { spec: Spec<'route'>; calc: Calculator }) {
  const c = usePalette();
  const { get } = useValues(calc);
  const ids = usePaintIds('disk');
  const [la1, lo1, la2, lo2] = [get(spec.lat1), get(spec.lon1), get(spec.lat2), get(spec.lon2)];
  const R_km = get(spec.radius) ?? EARTH_KM;
  const one = la1 !== undefined && lo1 !== undefined;
  const two = la2 !== undefined && lo2 !== undefined;
  const p1 = one ? toVec(la1!, lo1!) : undefined;
  const p2 = two ? toVec(la2!, lo2!) : undefined;
  const ca = p1 && p2 ? drawnAngle(p1, p2) : NaN;
  const ok = !!(p1 && p2) && ca > 0.05 && ca < 179.95;
  const why =
    p1 && p2 && !ok
      ? ca <= 0.05
        ? 'The two places are the same point: no route to draw.'
        : 'The two places are opposite each other: every great circle through them is as short.'
      : undefined;
  const H_ = 312;
  // The view: square-on to the great circle, its midpoint up, the rhumb line's side in front.
  const view: ViewBasis = (() => {
    if (!ok) {
      const v = norm(toVec(60, -20));
      const n = norm(toVec(20, -20));
      const vv = norm(add(v, scale(n, -dot(v, n))));
      return { u: cross(vv, n), v: vv, n };
    }
    const v = norm(add(p1!, p2!));
    let n = norm(cross(p1!, p2!));
    const mid = rhumbLine(la1!, lo1!, la2!, lo2!, 2)[1]!;
    if (dot(mid, n) < 0) n = scale(n, -1);
    return { u: cross(v, n), v, n };
  })();

  const art = (w: number) => {
    const R = Math.min(118, w * 0.33);
    const cx = w / 2;
    const cy = 50 + R;
    const S = (p: V3) => [cx + R * dot(p, view.u), cy - R * dot(p, view.v)] as const;
    const hi = c.chartHighlight;
    const pole: V3 = [0, 0, 1];
    const poleSeen = dot(pole, view.n) > 0.05;
    // A place's latitude over its longitude, outside the rim on its own side.
    const label = (p: V3, lines: [string, string]) => {
      const [x, y] = S(p);
      const [ox, oy] = [(x - cx) / R, (y - cy) / R];
      const anchor = ox < 0 ? 'end' : 'start';
      const lx = x + ox * 10 + (ox < 0 ? -2 : 2);
      const top = y + oy * 12 - (oy < 0 ? 14 : -4);
      return lines.map((text, i) => {
        const at = fitLabel(lx, text, chart.label, w, anchor);
        return (
          <ChartText
            key={i}
            x={at.x}
            y={top + i * 14}
            textAnchor={at.textAnchor}
            fontSize={chart.label}
            fontWeight="700"
            halo
          >
            {text}
          </ChartText>
        );
      });
    };
    return (
      <Svg width={w} height={H_}>
        <Defs>
          <ClipPath id={ids.disk}>
            <Circle cx={cx} cy={cy} r={R} />
          </ClipPath>
        </Defs>
        <Circle cx={cx} cy={cy} r={R} fill={c.globeSea} />
        <G clipPath={url(ids.disk)}>
          <Graticule view={view} cx={cx} cy={cy} R={R} c={c} />
        </G>
        <Circle cx={cx} cy={cy} r={R} fill="none" stroke={c.chartInk} strokeWidth={1.4} />
        {poleSeen ? (
          <G>
            <Circle cx={S(pole)[0]} cy={S(pole)[1]} r={3} fill={c.chartInk} />
            <ChartText
              x={S(pole)[0] + 6}
              y={S(pole)[1] + 4}
              fontSize={chart.label}
              fontWeight="700"
            >
              N
            </ChartText>
          </G>
        ) : null}
        {ok ? (
          <G>
            {/* The rhumb line, dashed; the great-circle arc on the rim; the central angle. */}
            <Path
              d={frontPath(rhumbLine(la1!, lo1!, la2!, lo2!), view, cx, cy, R)}
              stroke={c.chartSecond}
              strokeWidth={2.2}
              strokeDasharray={chart.dash}
              fill="none"
            />
            <Line
              x1={cx}
              y1={cy}
              x2={S(p1!)[0]}
              y2={S(p1!)[1]}
              stroke={c.chartInk}
              strokeWidth={1.2}
              strokeDasharray={chart.dashFine}
            />
            <Line
              x1={cx}
              y1={cy}
              x2={S(p2!)[0]}
              y2={S(p2!)[1]}
              stroke={c.chartInk}
              strokeWidth={1.2}
              strokeDasharray={chart.dashFine}
            />
            <Path
              d={frontPath(greatCircle(p1!, p2!), { ...view, n: view.n }, cx, cy, R)}
              stroke={hi}
              strokeWidth={4}
              fill="none"
            />
            {(() => {
              const ar = Math.min(34, R * 0.3);
              const a1 = Math.atan2(cy - S(p1!)[1], S(p1!)[0] - cx);
              const a2 = Math.atan2(cy - S(p2!)[1], S(p2!)[0] - cx);
              const q = (t: number) => [cx + ar * Math.cos(t), cy - ar * Math.sin(t)];
              const [qa, qb] = [q(a1), q(a2)];
              // Sweep the short way between the two radii.
              const cw = (a1 - a2 + 2 * Math.PI) % (2 * Math.PI) < Math.PI;
              const midA = Math.atan2(Math.sin(a1) + Math.sin(a2), Math.cos(a1) + Math.cos(a2));
              const text = `c = ${deg(ca)}`;
              // Out along the bisector until the two radii are a label's width apart.
              const labelR = Math.min(
                0.82 * R,
                Math.max(ar + 14, (textW(text, chart.label) / 2 + 6) / Math.sin((ca * RAD) / 2)),
              );
              return (
                <G>
                  <Path
                    d={`M ${qa[0]} ${qa[1]} A ${ar} ${ar} 0 0 ${cw ? 1 : 0} ${qb[0]} ${qb[1]}`}
                    stroke={hi}
                    strokeWidth={1.8}
                    fill="none"
                  />
                  <ChartText
                    x={cx + labelR * Math.cos(midA)}
                    y={cy - labelR * Math.sin(midA) + 4}
                    textAnchor="middle"
                    fontSize={chart.label}
                    fontWeight="700"
                    fill={hi}
                    halo
                  >
                    {text}
                  </ChartText>
                </G>
              );
            })()}
            {[p1!, p2!].map((p, i) => (
              <Circle
                key={i}
                cx={S(p)[0]}
                cy={S(p)[1]}
                r={5}
                fill={hi}
                stroke={c.paper}
                strokeWidth={1.2}
              />
            ))}
            {label(p1!, [ns(la1!), ew(lo1!)])}
            {label(p2!, [ns(la2!), ew(lo2!)])}
          </G>
        ) : null}
      </Svg>
    );
  };

  const caption = ok
    ? [
        `cos c = sin φ₁ sin φ₂ + cos φ₁ cos φ₂ cos(λ₂ − λ₁), so c = ${deg(centralAngle(la1!, lo1!, la2!, lo2!))}, the angle at Earth’s centre.`,
        `The great-circle arc (on the rim) is d = ${formatNumber(R_km)} × ${fig3(ca * RAD)} rad = ${fig3(R_km * ca * RAD)} km.`,
        `The dashed rhumb line keeps one bearing (straight on a Mercator map) and is longer.`,
      ].join(' · ')
    : (why ?? 'Type both places’ latitudes and longitudes to draw the route.');
  return (
    <View>
      <Canvas aspect={(w) => H_ / w}>{({ w }) => art(w)}</Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}

// ─── euler ───────────────────────────────────────────────────────────────────

function EulerGlobe({ spec, calc }: { spec: Spec<'euler'>; calc: Calculator }) {
  const c = usePalette();
  const { get } = useValues(calc);
  const ids = usePaintIds('disk');
  const omega = get(spec.omega);
  const D = get(spec.distance);
  const R_km = get(spec.radius) ?? EARTH_KM;
  const hasD = D !== undefined && D >= 0 && D <= 180;
  const v = omega !== undefined && hasD ? plateSpeed(omega, D, R_km) : undefined;
  const vmax = omega !== undefined ? plateSpeed(omega, 90, R_km) : undefined;
  const H_ = 312;
  // The pole and the point lie symmetric about the centre of view, Δ apart.
  const half = ((hasD ? Math.min(D!, 170) : 60) / 2) * RAD;
  const E: V3 = [0, Math.sin(half), Math.cos(half)];
  const A: V3 = [0, -Math.cos(half), Math.sin(half)];
  const B: V3 = [1, 0, 0];
  const around = (dd: number, t: number): V3 =>
    add(
      scale(E, Math.cos(dd * RAD)),
      add(scale(A, Math.sin(dd * RAD) * Math.cos(t)), scale(B, Math.sin(dd * RAD) * Math.sin(t))),
    );
  const view: ViewBasis = { u: [1, 0, 0], v: [0, 1, 0], n: [0, 0, 1] };

  const art = (w: number) => {
    const R = Math.min(116, w * 0.32);
    const cx = Math.min(w / 2, 20 + R + 4);
    const cy = 34 + R;
    const S = (p: V3) => [cx + R * p[0], cy - R * p[1]] as const;
    const hi = c.chartHighlight;
    const ring = (dd: number) => {
      const pts: V3[] = [];
      for (let i = 0; i <= 96; i++) pts.push(around(dd, (i / 96) * 2 * Math.PI));
      return frontPath(pts, view, cx, cy, R);
    };
    const P = hasD ? S(around(D!, 0)) : undefined;
    const Q = S(around(90, 0));
    const L = R * 0.55;
    const len = v !== undefined && vmax ? (L * v) / Math.abs(vmax || 1) : 0;
    const showGhost = hasD && Math.abs(D! - 90) > 12;
    const [ex, ey] = S(E);
    const vText = v === undefined ? '' : `v = ${fig3(v)} mm/yr`;
    return (
      <Svg width={w} height={H_}>
        <Defs>
          <ClipPath id={ids.disk}>
            <Circle cx={cx} cy={cy} r={R} />
          </ClipPath>
        </Defs>
        <Circle cx={cx} cy={cy} r={R} fill={c.globeSea} />
        <G clipPath={url(ids.disk)}>
          {[30, 60, 90, 120, 150].map((dd) => (
            <Path
              key={dd}
              d={ring(dd)}
              stroke={dd === 90 ? c.chartMuted : c.chartGrid}
              strokeWidth={dd === 90 ? 1.4 : 1.1}
              strokeDasharray={chart.dashFine}
              fill="none"
            />
          ))}
          {hasD ? <Path d={ring(D!)} stroke={hi} strokeWidth={1.6} fill="none" /> : null}
          {P ? (
            <Line x1={ex} y1={ey} x2={P[0]} y2={P[1]} stroke={c.chartInk} strokeWidth={1.2} />
          ) : null}
        </G>
        <Circle cx={cx} cy={cy} r={R} fill="none" stroke={c.chartInk} strokeWidth={1.4} />
        {/* The Euler pole and the turn about it. */}
        <Circle cx={ex} cy={ey} r={4.5} fill={c.chartInk} />
        <Path
          d={`M ${ex - 16} ${ey + 3} A 16 9 0 1 0 ${ex + 14} ${ey - 5}`}
          stroke={c.chartInk}
          strokeWidth={1.4}
          fill="none"
        />
        <Polygon
          points={`${ex + 17},${ey - 9} ${ex + 9},${ey - 7} ${ex + 15},${ey - 1}`}
          fill={c.chartInk}
        />
        {(() => {
          const text = omega === undefined ? 'Euler pole' : `Euler pole, ω = ${fig3(omega)}°/Myr`;
          const at = fitLabel(ex + 22, text, chart.label, w, 'start');
          return (
            <ChartText
              x={at.x}
              y={ey - 14}
              textAnchor={at.textAnchor}
              fontSize={chart.label}
              fontWeight="700"
              halo
            >
              {text}
            </ChartText>
          );
        })()}
        {showGhost && vmax !== undefined ? (
          <G opacity={0.55}>
            <Arrow
              x1={Q[0]}
              y1={Q[1]}
              x2={Q[0] + L}
              y2={Q[1]}
              color={c.chartInk}
              width={1.6}
              dash={chart.dashFine}
            />
            <ChartText x={Q[0] + L + 4} y={Q[1] + 4} fontSize={chart.label} fill={c.chartMuted}>
              90°
            </ChartText>
          </G>
        ) : null}
        {P ? (
          <G>
            {len > 0.5 ? (
              <Arrow x1={P[0]} y1={P[1]} x2={P[0] + len} y2={P[1]} color={hi} width={3} />
            ) : null}
            <Circle cx={P[0]} cy={P[1]} r={5} fill={hi} stroke={c.paper} strokeWidth={1.2} />
            {vText ? (
              <ChartText
                x={fitLabel(P[0] + 4, vText, chart.label, w, 'start').x}
                textAnchor={fitLabel(P[0] + 4, vText, chart.label, w, 'start').textAnchor}
                y={P[1] + 20}
                fontSize={chart.label}
                fontWeight="700"
                fill={hi}
                halo
              >
                {vText}
              </ChartText>
            ) : null}
            <ChartText
              x={(ex + P[0]) / 2 - 6}
              y={(ey + P[1]) / 2 + 4}
              textAnchor="end"
              fontSize={chart.label}
              fontWeight="700"
              halo
            >
              {`Δ = ${deg(D!)}`}
            </ChartText>
          </G>
        ) : null}
      </Svg>
    );
  };

  const caption =
    omega === undefined || !hasD
      ? D !== undefined && !hasD
        ? 'Δ is an angle from the pole: 0° to 180°.'
        : 'Type the rotation rate ω and the distance Δ from the pole.'
      : [
          `The plate turns ${fig3(omega)}° = ${fig3(omega * RAD)} rad per million years about its Euler pole.`,
          `A point Δ = ${deg(D!)} away moves v = ω × ${formatNumber(R_km)} km × sin Δ = ${fig3(v!)} mm/yr (1 km per Myr is 1 mm per year).`,
          `Speed grows with sin Δ: 0 at the pole, ${fig3(vmax!)} mm/yr at 90° (the dotted arrow).`,
        ].join(' · ');
  return (
    <View>
      <Canvas aspect={(w) => H_ / w}>{({ w }) => art(w)}</Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}

// ─── dipole ──────────────────────────────────────────────────────────────────

function DipoleGlobe({ spec, calc }: { spec: Spec<'dipole'>; calc: Calculator }) {
  const c = usePalette();
  const { get } = useValues(calc);
  const ids = usePaintIds('frame');
  const Ival = get(spec.inclination);
  const latVal = get(spec.latitude);
  const lat =
    latVal !== undefined && Math.abs(latVal) < 90
      ? latVal
      : Ival !== undefined && Math.abs(Ival) < 90
        ? paleolatitude(Ival)
        : undefined;
  const I = lat !== undefined ? inclination(lat) : undefined;
  const H_ = 300;

  const art = (w: number) => {
    const R = Math.min(58, w * 0.16);
    const cx = w / 2;
    const cy = H_ / 2 - 6;
    const hi = c.chartHighlight;
    // A field line r = L cos²λ, outside the Earth, as a path on one side (s = ±1).
    const fieldLine = (L: number, s: number) => {
      const lam = Math.acos(Math.min(1, Math.sqrt(1 / L)));
      const d: string[] = [];
      for (let i = 0; i <= 80; i++) {
        const t = -lam + (2 * lam * i) / 80;
        const r = L * Math.cos(t) ** 2;
        d.push(
          `${i ? 'L' : 'M'} ${(cx + s * R * r * Math.cos(t)).toFixed(2)} ${(cy - R * r * Math.sin(t)).toFixed(2)}`,
        );
      }
      return d.join(' ');
    };
    const Ls = [1.5, 2.2, 3.2];
    const P =
      lat !== undefined ? [cx + R * Math.cos(lat * RAD), cy - R * Math.sin(lat * RAD)] : undefined;
    // At the place: up (radial), north (along the meridian), the field I below the horizon.
    const up = lat !== undefined ? [Math.cos(lat * RAD), Math.sin(lat * RAD)] : [1, 0];
    const north = [-up[1]!, up[0]!];
    const b =
      I !== undefined
        ? [
            Math.cos(I * RAD) * north[0]! - Math.sin(I * RAD) * up[0]!,
            Math.cos(I * RAD) * north[1]! - Math.sin(I * RAD) * up[1]!,
          ]
        : [0, 0];
    const bl = 46;
    return (
      <Svg width={w} height={H_}>
        <Defs>
          <ClipPath id={ids.frame}>
            <Rect x={0} y={0} width={w} height={H_} />
          </ClipPath>
        </Defs>
        <G clipPath={url(ids.frame)}>
          {Ls.flatMap((L) =>
            [-1, 1].map((s) => (
              <Path
                key={`${L}${s}`}
                d={fieldLine(L, s)}
                stroke={c.chartSecond}
                strokeWidth={1.4}
                fill="none"
              />
            )),
          )}
          {/* Field direction: northward (up) where each line crosses the equator. */}
          {Ls.flatMap((L) =>
            [-1, 1].map((s) => (
              <Polygon
                key={`a${L}${s}`}
                points={`${cx + s * R * L},${cy - 7} ${cx + s * R * L - 5},${cy + 3} ${cx + s * R * L + 5},${cy + 3}`}
                fill={c.chartSecond}
              />
            )),
          )}
          {lat !== undefined && Math.abs(lat) > 0.5 ? (
            <Path
              d={fieldLine(1 / Math.cos(lat * RAD) ** 2, 1)}
              stroke={hi}
              strokeWidth={2}
              fill="none"
            />
          ) : null}
        </G>
        <Circle cx={cx} cy={cy} r={R} fill={c.globeSea} stroke={c.chartInk} strokeWidth={1.4} />
        <Line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke={c.chartMuted} strokeWidth={1.2} />
        <Line
          x1={cx}
          y1={cy - R - 16}
          x2={cx}
          y2={cy + R + 16}
          stroke={c.chartInk}
          strokeWidth={1.4}
        />
        <ChartText x={cx + 5} y={cy - R - 6} fontSize={chart.label} fontWeight="700">
          N
        </ChartText>
        {P && I !== undefined ? (
          <G>
            <Line
              x1={P[0]! - 34 * north[0]!}
              y1={P[1]! + 34 * north[1]!}
              x2={P[0]! + 34 * north[0]!}
              y2={P[1]! - 34 * north[1]!}
              stroke={c.chartInk}
              strokeWidth={1.4}
            />
            <Arrow
              x1={P[0]!}
              y1={P[1]!}
              x2={P[0]! + bl * b[0]!}
              y2={P[1]! - bl * b[1]!}
              color={hi}
              width={3}
            />
            {(() => {
              const ar = 22;
              const tN = Math.atan2(north[1]!, north[0]!);
              let tB = Math.atan2(b[1]!, b[0]!);
              while (tB - tN > Math.PI) tB -= 2 * Math.PI;
              while (tB - tN < -Math.PI) tB += 2 * Math.PI;
              const q = (t: number) => [P[0]! + ar * Math.cos(t), P[1]! - ar * Math.sin(t)];
              const [qa, qb] = [q(tN), q(tB)];
              const text = `I = ${deg(I)}`;
              // Right of the place, clear of the axis and the arrow (which points north).
              // (Below it when the field points up and out, in the south.)
              const up = b[0]! > 0;
              const at = fitLabel(P[0]! + (up ? 6 : 12), text, chart.label, w, 'start');
              return (
                <G>
                  <Path
                    d={`M ${qa[0]} ${qa[1]} A ${ar} ${ar} 0 0 ${tB < tN ? 1 : 0} ${qb[0]} ${qb[1]}`}
                    stroke={hi}
                    strokeWidth={1.6}
                    fill="none"
                  />
                  <ChartText
                    x={at.x}
                    y={P[1]! + (up ? 26 : 4)}
                    textAnchor={at.textAnchor}
                    fontSize={chart.label}
                    fontWeight="700"
                    fill={hi}
                    halo
                  >
                    {text}
                  </ChartText>
                </G>
              );
            })()}
            <Circle cx={P[0]!} cy={P[1]!} r={4.5} fill={hi} stroke={c.paper} strokeWidth={1.2} />
          </G>
        ) : null}
      </Svg>
    );
  };

  const caption =
    lat === undefined || I === undefined
      ? 'Type the inclination I or the latitude φ.'
      : [
          `A dipole on the spin axis dips the field by I at latitude φ: tan I = 2 tan φ.`,
          `tan ${deg(I)} = ${fig3(Math.tan(I * RAD))} = 2 × tan ${deg(lat)}, so φ = ${deg(lat)} (${lat >= 0 ? 'down in the north' : 'up in the south'}).`,
        ].join(' · ');
  return (
    <View>
      <Canvas aspect={(w) => H_ / w}>{({ w }) => art(w)}</Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}

// ─── momentum ────────────────────────────────────────────────────────────────

function MomentumGlobe({ spec, calc }: { spec: Spec<'momentum'>; calc: Calculator }) {
  const c = usePalette();
  const { get } = useValues(calc);
  const lat = get(spec.latitude);
  const rim = get(spec.rim) ?? RIM_MS;
  const ok = lat !== undefined && Math.abs(lat) <= 75;
  const u = lat !== undefined && Math.abs(lat) < 90 ? momentumWind(lat, rim) : undefined;
  const H_ = 300;
  const tilt = 18 * RAD;

  const art = (w: number) => {
    const R = Math.min(100, w * 0.28);
    const cx = 20 + R;
    const cy = 30 + R;
    const hi = c.chartHighlight;
    const k = (0.6 * R) / rim;
    const ringY = (phi: number) => cy - R * Math.sin(phi * RAD) * Math.cos(tilt);
    const ringRy = (phi: number) => R * Math.cos(phi * RAD) * Math.sin(tilt);
    const phi = ok ? lat! : undefined;
    const front = (p: number) => [cx, ringY(p) + ringRy(p)] as const;
    const eq = front(0);
    const ground = phi !== undefined ? rim * Math.cos(phi * RAD) : 0;
    const F = phi !== undefined ? front(phi) : undefined;
    const meridian = (to: number) => {
      const d: string[] = [];
      for (let i = 0; i <= 30; i++) {
        const t = (to * i) / 30;
        d.push(
          `${i ? 'L' : 'M'} ${(cx + R * Math.cos(t * RAD) + 10).toFixed(2)} ${(cy - R * Math.sin(t * RAD) * Math.cos(tilt)).toFixed(2)}`,
        );
      }
      return d.join(' ');
    };
    const uText = u === undefined ? '' : `u = ${fig3(u)} m/s`;
    return (
      <Svg width={w} height={H_}>
        <Circle cx={cx} cy={cy} r={R} fill={c.globeSea} stroke={c.chartInk} strokeWidth={1.4} />
        <Line
          x1={cx}
          y1={cy - R - 16}
          x2={cx}
          y2={cy + R + 10}
          stroke={c.chartInk}
          strokeWidth={1.4}
        />
        <ChartText x={cx + 5} y={cy - R - 6} fontSize={chart.label} fontWeight="700">
          N
        </ChartText>
        <Ellipse
          cx={cx}
          cy={ringY(0)}
          rx={R}
          ry={ringRy(0)}
          stroke={c.chartMuted}
          strokeWidth={1.4}
          fill="none"
        />
        {phi !== undefined ? (
          <G>
            <Ellipse
              cx={cx}
              cy={ringY(phi)}
              rx={R * Math.cos(phi * RAD)}
              ry={ringRy(phi)}
              stroke={hi}
              strokeWidth={2.4}
              fill="none"
            />
            <Path
              d={meridian(phi)}
              stroke={c.chartInk}
              strokeWidth={1.4}
              strokeDasharray={chart.dash}
              fill="none"
            />
            <Arrow
              x1={cx + R * Math.cos(phi * 0.8 * RAD) + 10}
              y1={cy - R * Math.sin(phi * 0.8 * RAD) * Math.cos(tilt)}
              x2={cx + R * Math.cos(phi * RAD) + 10}
              y2={cy - R * Math.sin(phi * RAD) * Math.cos(tilt)}
              color={c.chartInk}
              width={1.4}
            />
          </G>
        ) : null}
        {/* At the equator the air turns with the ground: ΩR. */}
        <Arrow
          x1={eq[0]}
          y1={eq[1]}
          x2={eq[0] + k * rim}
          y2={eq[1]}
          color={c.chartMuted}
          width={2.4}
        />
        <ChartText x={eq[0] + k * rim + 6} y={eq[1] + 4} fontSize={chart.label} fill={c.chartMuted}>
          {`ΩR = ${fig3(rim)} m/s`}
        </ChartText>
        {F && u !== undefined ? (
          <G>
            <Arrow
              x1={F[0]}
              y1={F[1]}
              x2={F[0] + k * ground}
              y2={F[1]}
              color={c.chartMuted}
              width={2.4}
            />
            <Arrow
              x1={F[0] + k * ground}
              y1={F[1]}
              x2={F[0] + k * (ground + u)}
              y2={F[1]}
              color={hi}
              width={3.2}
            />
            <ChartText
              x={fitLabel(F[0] + k * (ground + u / 2), uText, chart.label, w, 'middle').x}
              y={F[1] - 10}
              textAnchor="middle"
              fontSize={chart.label}
              fontWeight="700"
              fill={hi}
              halo
            >
              {uText}
            </ChartText>
          </G>
        ) : null}
      </Svg>
    );
  };

  const caption =
    lat === undefined
      ? 'Type the latitude φ the air is carried to.'
      : !ok
        ? `At φ = ${deg(lat)} the ring is too near the pole to draw: u grows without limit as cos φ → 0.`
        : [
            `Air leaves the equator turning with the ground at ΩR = ${fig3(rim)} m/s and keeps its angular momentum.`,
            `At φ = ${deg(lat)} the ground moves ΩR cos φ = ${fig3(rim * Math.cos(lat * RAD))} m/s (grey) and the air gains u = ΩR sin²φ ÷ cos φ = ${fig3(u!)} m/s eastward.`,
          ].join(' · ');
  return (
    <View>
      <Canvas aspect={(w) => H_ / w}>{({ w }) => art(w)}</Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}
