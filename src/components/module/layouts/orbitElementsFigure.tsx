/**
 * Explore figure `orbitElements` (HC173, `typesHe4m.ts`): the six classical elements in 3-D.
 * Earth (painted) in its equatorial plane, the vernal-equinox direction along it, the orbit
 * tilted through the node line (the half below the plane dashed), periapsis and the satellite
 * marked, and the scene's element lit: Ω in the equatorial plane, i across the node line, ω and ν
 * in the orbit plane, or the major axis with e. Sizes are not to scale; the angles are.
 */
import type { ReactElement } from 'react';
import Svg, { Circle, G, Line, Path, Polygon } from 'react-native-svg';

import type { OrbitScene } from '@/data/modules/typesHe4m';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import { Canvas, ChartText, fitLabel } from '../reps/common';
import { elementArc, orbitFrame, orbitPoint, type Vec3 } from '../reps/he4mMath';
import { Planet } from '../reps/planetArt';

const H = 270;
/** The view: turned 62° about the north axis, looking 30° down on the equatorial plane. */
const AZ = (62 * Math.PI) / 180;
const EL = (30 * Math.PI) / 180;

const deg = (x: number) => `${formatNumber(Number(x.toFixed(1)))}°`;

export function OrbitElementsFigure({ scene }: { scene: OrbitScene }) {
  const c = usePalette();
  const { i, raan, argp, nu, e, lit } = scene;
  const flat = Math.abs(i) < 1e-9 || Math.abs(i - 180) < 1e-9;
  const f = orbitFrame(i, raan, argp);
  const a = 1;
  const ra = a * (1 + e);
  const D = 1.12 * ra;
  return (
    <Canvas aspect={(w) => H / w}>
      {({ w, h }) => {
        const s = Math.min((w / 2 - 22) / D, 128 / D);
        const cx = w / 2;
        const cy = H / 2 - 4;
        const P = (v: Vec3) => ({
          x: cx + s * (-v[0] * Math.sin(AZ) + v[1] * Math.cos(AZ)),
          y:
            cy -
            s * (-(v[0] * Math.cos(AZ) + v[1] * Math.sin(AZ)) * Math.sin(EL) + v[2] * Math.cos(EL)),
        });
        const pts = (vs: Vec3[]) =>
          vs.map((v) => {
            const p = P(v);
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          });
        const scale = (v: Vec3, k: number): Vec3 => [v[0] * k, v[1] * k, v[2] * k];
        // The equatorial plane, a disc of radius D.
        const disc: Vec3[] = Array.from({ length: 73 }, (_, k) => {
          const t = (k / 72) * 2 * Math.PI;
          return [D * Math.cos(t), D * Math.sin(t), 0];
        });
        // The orbit: solid above the plane, dashed below.
        const above: string[] = [];
        const below: string[] = [];
        let run: { up: boolean; d: string } | undefined;
        const flush = () => {
          if (run) (run.up ? above : below).push(run.d);
          run = undefined;
        };
        for (let k = 0; k <= 180; k++) {
          const v = orbitPoint(f, a, e, (k / 180) * 360);
          const up = flat || v[2] >= -1e-9;
          const p = P(v);
          const seg = `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          if (!run || run.up !== up) {
            const prev = run;
            flush();
            run = { up, d: prev ? `M ${prev.d.split(' L ').pop()} L ${seg}` : `M ${seg}` };
          } else run.d += ` L ${seg}`;
        }
        flush();
        const peri = P(orbitPoint(f, a, e, 0));
        const apo = P(orbitPoint(f, a, e, 180));
        const sat = P(orbitPoint(f, a, e, nu));
        const node = P(orbitPoint(f, a, e, -argp));
        const O = P([0, 0, 0]);
        const vernal = P([D * 1.02, 0, 0]);
        const rE = Math.max(9, 0.16 * s);
        // The disc's upper-left rim (its label sits just inside it) and the equinox arrow's direction.
        const rim = disc.map(P).reduce((m, p) => (-p.x - 2 * p.y > -m.x - 2 * m.y ? p : m));
        const vl = Math.hypot(vernal.x - O.x, vernal.y - O.y) || 1;
        const ux = (vernal.x - O.x) / vl;
        const uy = (vernal.y - O.y) / vl;
        /** A point's label set 14 px out from Earth, on the side away from it. */
        // Point labels placed one at a time where they meet no other label, Earth or the edges:
        // first straight out from Earth, then to either side, above and below.
        type Box = { x0: number; x1: number; y0: number; y1: number };
        const taken: Box[] = [];
        const cache = new Map<string, { x: ReturnType<typeof fitLabel>; y: number }>();
        const boxOf = (x: number, y: number, t: string, anchor: 'start' | 'middle' | 'end') => {
          const tw = t.length * chart.label * 0.58;
          const x0 = anchor === 'start' ? x : anchor === 'end' ? x - tw : x - tw / 2;
          return { x0, x1: x0 + tw, y0: y - 11, y1: y + 3 };
        };
        // The plane's own label, inside its upper-left rim, is placed first.
        taken.push(boxOf(rim.x + 6, rim.y + 16, 'Equatorial plane', 'start'));
        const hits = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
        const away = (p: { x: number; y: number }, t: string) => {
          const done = cache.get(t);
          if (done) return done;
          const dx = p.x - O.x;
          const dy = p.y - O.y;
          const len = Math.hypot(dx, dy) || 1;
          const tries: [number, number][] = [
            [dx / len, dy / len],
            [1, 0],
            [-1, 0],
            [0, -1],
            [0, 1],
            [0.7, -0.7],
            [-0.7, -0.7],
            [0.7, 0.7],
            [-0.7, 0.7],
          ];
          const earth: Box = { x0: O.x - rE, x1: O.x + rE, y0: O.y - rE, y1: O.y + rE };
          let pick: { x: number; y: number; anchor: 'start' | 'middle' | 'end' } | undefined;
          for (const [ux, uy, r] of [
            ...tries.map(([x, y]) => [x, y, 11]),
            ...tries.map(([x, y]) => [x, y, 26]),
          ]) {
            const anchor = Math.abs(ux!) < 0.3 ? 'middle' : ux! > 0 ? 'start' : 'end';
            const x = p.x + r! * ux!;
            const y = p.y + r! * uy! + 4 + (anchor === 'middle' ? (uy! > 0 ? 8 : -2) : 0);
            const b = boxOf(x, y, t, anchor);
            if (b.x0 < 2 || b.x1 > w - 2 || b.y0 < 26 || b.y1 > h - 22) continue;
            if (hits(b, earth) || taken.some((o) => hits(o, b))) continue;
            pick = { x, y, anchor };
            break;
          }
          pick ??= { x: p.x + 11 * (dx / len), y: p.y + 11 * (dy / len) + 4, anchor: 'middle' };
          taken.push(boxOf(pick.x, pick.y, t, pick.anchor));
          const out = { x: fitLabel(pick.x, t, chart.label, w, pick.anchor, 11), y: pick.y };
          cache.set(t, out);
          return out;
        };
        const parts: ReactElement[] = [];
        const arcR = 0.55 * a;
        let angleLabel: { at: { x: number; y: number }; t: string } | undefined;
        const arcOf = (which: 'raan' | 'i' | 'argp' | 'nu', r: number, t: string) => {
          const vs = elementArc(which, i, raan, argp, nu).map((v) => scale(v, r));
          parts.push(
            <G key={`arc-${which}`}>
              <Path
                d={`M ${pts(vs).join(' L ')}`}
                fill="none"
                stroke={c.he4mAngle}
                strokeWidth={chart.strokeHeavy}
                strokeLinecap="round"
              />
              <Line
                x1={O.x}
                y1={O.y}
                x2={P(vs[0]!).x}
                y2={P(vs[0]!).y}
                stroke={c.he4mAngle}
                strokeWidth={1.4}
              />
              <Line
                x1={O.x}
                y1={O.y}
                x2={P(vs[vs.length - 1]!).x}
                y2={P(vs[vs.length - 1]!).y}
                stroke={c.he4mAngle}
                strokeWidth={1.4}
              />
            </G>,
          );
          const mid = P(scale(vs[Math.floor(vs.length / 2)]!, 1.32));
          angleLabel = { at: mid, t };
        };
        if (lit === 'raan' && !flat) arcOf('raan', 0.62 * D, `Ω = ${deg(raan)}`);
        if (lit === 'i' && !flat) arcOf('i', arcR, `i = ${deg(i)}`);
        if (lit === 'argp' && !flat) arcOf('argp', arcR, `ω = ${deg(argp)}`);
        if (lit === 'nu') arcOf('nu', arcR, `ν = ${deg(nu)}`);
        // The lit angle's value claims its place first, beside the middle of its arc.
        if (angleLabel) away(angleLabel.at, angleLabel.t);
        const centre = P(
          orbitPoint(f, a, e, 0).map((x, k) => (x + orbitPoint(f, a, e, 180)[k]!) / 2) as Vec3,
        );
        const note = flat
          ? lit === 'raan' || lit === 'argp'
            ? 'i = 0: no node line, so Ω is undefined'
            : 'i = 0: the orbit lies in the equatorial plane'
          : undefined;
        const summary = `i ${deg(i)} · Ω ${flat ? '—' : deg(raan)} · ω ${flat ? '—' : deg(argp)} · ν ${deg(nu)} · e ${formatNumber(e)}`;
        return (
          <Svg width={w} height={h}>
            <Polygon
              points={pts(disc).join(' ')}
              fill={c.he4mEquator}
              fillOpacity={0.35}
              stroke={c.he4mEquatorLine}
              strokeWidth={1.2}
            />
            <ChartText x={rim.x + 6} y={rim.y + 16} fill={c.chartMuted}>
              Equatorial plane
            </ChartText>
            {/* The vernal equinox direction. */}
            <Line
              x1={O.x}
              y1={O.y}
              x2={vernal.x}
              y2={vernal.y}
              stroke={c.chartInk}
              strokeWidth={chart.strokeLight}
            />
            <Path
              d={`M ${vernal.x} ${vernal.y} L ${vernal.x - 9 * ux - 4 * uy} ${vernal.y - 9 * uy + 4 * ux} L ${vernal.x - 9 * ux + 4 * uy} ${vernal.y - 9 * uy - 4 * ux} Z`}
              fill={c.chartInk}
            />
            <ChartText
              {...away(vernal, 'Vernal equinox').x}
              y={away(vernal, 'Vernal equinox').y}
              fill={c.chartInk}
            >
              Vernal equinox
            </ChartText>
            {/* The node line. */}
            {!flat ? (
              <Line
                x1={P(scale(f.n, -D)).x}
                y1={P(scale(f.n, -D)).y}
                x2={P(scale(f.n, D)).x}
                y2={P(scale(f.n, D)).y}
                stroke={c.chartMuted}
                strokeWidth={1.2}
                strokeDasharray={chart.dashFine}
              />
            ) : null}
            <Planet name="earth" x={O.x} y={O.y} r={rE} />
            {below.map((d, k) => (
              <Path
                key={`b${k}`}
                d={d}
                fill="none"
                stroke={c.he4mOrbit}
                strokeWidth={chart.stroke}
                strokeDasharray={chart.dash}
                opacity={0.7}
              />
            ))}
            {above.map((d, k) => (
              <Path
                key={`a${k}`}
                d={d}
                fill="none"
                stroke={c.he4mOrbit}
                strokeWidth={chart.strokeHeavy}
              />
            ))}
            {lit === 'shape' ? (
              <G>
                <Line
                  x1={peri.x}
                  y1={peri.y}
                  x2={apo.x}
                  y2={apo.y}
                  stroke={c.he4mAngle}
                  strokeWidth={chart.strokeHeavy}
                />
                <ChartText
                  {...away(centre, '2a').x}
                  y={away(centre, '2a').y}
                  fontWeight="700"
                  fill={c.he4mAngle}
                  halo
                >
                  2a
                </ChartText>
              </G>
            ) : null}
            {parts}
            {/* Periapsis, the ascending node and the satellite. */}
            <Circle cx={peri.x} cy={peri.y} r={4} fill={c.chartInk} />
            <ChartText {...away(peri, 'Periapsis').x} y={away(peri, 'Periapsis').y} halo>
              Periapsis
            </ChartText>
            {!flat ? (
              <G>
                <Path
                  d={`M ${node.x} ${node.y - 6} L ${node.x + 5} ${node.y} L ${node.x} ${node.y + 6} L ${node.x - 5} ${node.y} Z`}
                  fill={c.background}
                  stroke={c.chartInk}
                  strokeWidth={1.5}
                />
                <ChartText
                  {...away(node, 'Ascending node').x}
                  y={away(node, 'Ascending node').y}
                  halo
                >
                  Ascending node
                </ChartText>
              </G>
            ) : null}
            <Circle
              cx={sat.x}
              cy={sat.y}
              r={6}
              fill={c.he4mSatellite}
              stroke={c.chartInk}
              strokeWidth={1}
            />
            <ChartText
              {...away(sat, 'Satellite').x}
              y={away(sat, 'Satellite').y}
              fontWeight="700"
              halo
            >
              Satellite
            </ChartText>
            {angleLabel ? (
              <ChartText
                {...away(angleLabel.at, angleLabel.t).x}
                y={away(angleLabel.at, angleLabel.t).y}
                fontWeight="700"
                fill={c.he4mAngle}
                halo
              >
                {angleLabel.t}
              </ChartText>
            ) : null}
            {lit === 'shape' ? (
              <ChartText x={8} y={18} fontWeight="700" fill={c.he4mAngle}>
                {`e = ${formatNumber(e)}: r_a ÷ r_p = ${formatNumber(Number(((1 + e) / (1 - e)).toPrecision(3)))}`}
              </ChartText>
            ) : null}
            {note ? (
              <ChartText x={8} y={lit === 'shape' ? 36 : 18} fontWeight="700" fill={c.he4mAngle}>
                {note}
              </ChartText>
            ) : null}
            <ChartText {...fitLabel(w / 2, summary, chart.label, w)} y={h - 8} fill={c.chartMuted}>
              {summary}
            </ChartText>
          </Svg>
        );
      }}
    </Canvas>
  );
}
