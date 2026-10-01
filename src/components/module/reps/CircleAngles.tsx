import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon } from 'react-native-svg';

import type { CircleTheoremsSpec } from '@/data/modules/typesHsc';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { Arcs, inside, type Pt } from './geoMarks';
import { buildAngles } from './circleAnglesGeo';

const n2 = (x: number) => formatNumber(Number(x.toFixed(2)));

/**
 * `circleTheorems` `cyclic` and `arcAngle` (H96, group H2B; spec in `typesHs2b.ts`): an
 * inscribed quadrilateral whose opposite angles stand on arcs that make the whole circle, and
 * an angle made by two chords inside the circle or two secants outside it, with its two arcs.
 * Drawn from the values; a figure the values can't make draws faded with the reason.
 */
export function CircleAngles({ spec, calc }: { spec: CircleTheoremsSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (x: string | number | undefined) =>
    x === undefined
      ? undefined
      : typeof x === 'number'
        ? x
        : rep.known(x)
          ? rep.shown(x)
          : undefined;
  const fig = buildAngles(spec, num);
  const ok = !fig.reason;
  const pts = Object.values(fig.pts);
  const box = {
    minX: Math.min(-1, ...pts.map((q) => q[0])),
    maxX: Math.max(1, ...pts.map((q) => q[0])),
    minY: Math.min(-1, ...pts.map((q) => q[1])),
    maxY: Math.max(1, ...pts.map((q) => q[1])),
  };
  const bw = box.maxX - box.minX;
  const bh = box.maxY - box.minY;
  const pad = 40;
  const scaleOf = (w: number) => Math.min((w - 2 * pad) / bw, (w * 0.8 - 2 * pad) / bh);
  /** A part's label: "a = 84°" for a value, "84°" for a fixed number. */
  const text = (x: string | number | undefined, drawn: number) =>
    typeof x === 'string' ? rep.label(x) : `${n2(typeof x === 'number' ? x : drawn)}°`;

  return (
    <View>
      <Canvas aspect={(w) => (bh * scaleOf(w) + 2 * pad) / w}>
        {({ w, h }) => {
          const s = scaleOf(w);
          const left = (w - bw * s) / 2;
          const X = (x: number) => left + (x - box.minX) * s;
          const Y = (y: number) => pad + (box.maxY - y) * s;
          const at = (k: string): Pt => [X(fig.pts[k]![0]), Y(fig.pts[k]![1])];
          const O = at('O');
          /** Degrees of point k round the center (math angle, counterclockwise). */
          const deg = (k: string) => (Math.atan2(fig.pts[k]![1], fig.pts[k]![0]) * 180) / Math.PI;
          /** The arc from point a counterclockwise to point b, heavy in `color`. */
          const arc = (a: string, b: string, color: string) => {
            let d0 = deg(a);
            let d1 = deg(b);
            while (d1 <= d0) d1 += 360;
            const pts = Array.from({ length: 49 }, (_, k) => {
              const t = ((d0 + ((d1 - d0) * k) / 48) * Math.PI) / 180;
              return `${k ? 'L' : 'M'} ${X(Math.cos(t))} ${Y(Math.sin(t))}`;
            }).join(' ');
            d0 = (d0 + d1) / 2;
            return {
              el: (
                <Path
                  key={`arc${a}${b}`}
                  d={pts}
                  stroke={color}
                  strokeWidth={chart.strokeHeavy + 2}
                  fill="none"
                  strokeLinecap="round"
                />
              ),
              mid: d0,
            };
          };
          /** A label out from the center at `deg`, `r` radii away. */
          const radial = (d: number, r: number, label: string, color: string, key: string) => {
            const t = (d * Math.PI) / 180;
            const x = X(r * Math.cos(t));
            const y = Y(r * Math.sin(t)) + 4 + Math.sin(-t) * 4;
            return (
              <ChartText
                key={key}
                {...fitLabel(x, label, chart.label, w)}
                y={Math.max(12, Math.min(h - 4, y))}
                fontWeight="700"
                fill={color}
              >
                {label}
              </ChartText>
            );
          };
          const seg = (a: string, b: string, color = c.chartInk) => (
            <Line
              key={`s${a}${b}`}
              x1={at(a)[0]}
              y1={at(a)[1]}
              x2={at(b)[0]}
              y2={at(b)[1]}
              stroke={color}
              strokeWidth={chart.stroke}
              strokeLinecap="round"
            />
          );
          const name = (k: string, from: Pt = O) => {
            const q = at(k);
            const d = Math.hypot(q[0] - from[0], q[1] - from[1]) || 1;
            const x = q[0] + ((q[0] - from[0]) / d) * 14;
            const y = q[1] + ((q[1] - from[1]) / d) * 14 + 4;
            return (
              <G key={`n${k}`}>
                <Circle cx={q[0]} cy={q[1]} r={3} fill={c.chartInk} />
                <ChartText {...fitLabel(x, k, chart.label, w)} y={y} fontWeight="700">
                  {k}
                </ChartText>
              </G>
            );
          };
          const angleText = (v: Pt, p: Pt, q: Pt, r: number, label: string, key: string) => {
            const [x, y] = inside(v, p, q, r);
            return (
              <ChartText
                key={key}
                {...fitLabel(x, label, chart.label, w)}
                y={y + 4}
                fontWeight="700"
              >
                {label}
              </ChartText>
            );
          };
          const circle = (
            <Circle
              cx={O[0]}
              cy={O[1]}
              r={s}
              fill={c.chartSurface}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
          );
          if (spec.theorem === 'cyclic') {
            const q = spec.cyclic ?? {};
            const g = fig.angles!;
            // ∠A stands on arc BCD, ∠C on arc DAB: together the whole circle.
            const onA = arc('B', 'D', c.chartHighlight);
            const onC = arc('D', 'B', c.chartSecond);
            const quad = ['A', 'B', 'C', 'D'].map(at);
            const mid: Pt = [
              quad.reduce((t, p) => t + p[0], 0) / 4,
              quad.reduce((t, p) => t + p[1], 0) / 4,
            ];
            // Angle labels: in the angle along its bisector, further in, or else out past the
            // corner's name; never on a name, a side or another label.
            type Box = [number, number, number, number];
            const hit = (a: Box, b: Box) =>
              a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
            const sides = [0, 1, 2, 3].map((i) => [quad[i]!, quad[(i + 1) % 4]!] as const);
            const off = (x: number, y: number) =>
              Math.min(
                ...sides.map(([p, r]) => {
                  const dx = r[0] - p[0];
                  const dy = r[1] - p[1];
                  const t = Math.max(
                    0,
                    Math.min(1, ((x - p[0]) * dx + (y - p[1]) * dy) / (dx * dx + dy * dy || 1)),
                  );
                  return Math.hypot(x - p[0] - dx * t, y - p[1] - dy * t);
                }),
              );
            const taken: Box[] = (['A', 'B', 'C', 'D'] as const).map((k) => {
              const p = at(k);
              const d = Math.hypot(p[0] - mid[0], p[1] - mid[1]) || 1;
              const x = p[0] + ((p[0] - mid[0]) / d) * 14;
              const y = p[1] + ((p[1] - mid[1]) / d) * 14;
              return [x - 7, y - 9, x + 7, y + 7];
            });
            const spot = (k: 'A' | 'B' | 'C' | 'D', p: string, r: string, label: string): Pt => {
              const tw = label.length * chart.label * 0.58;
              const v = at(k);
              const d = Math.hypot(v[0] - O[0], v[1] - O[1]) || 1;
              const u: Pt = [(v[0] - O[0]) / d, (v[1] - O[1]) / d];
              const cands: Pt[] = [
                ...[42, 58, 76].map((rr) => inside(v, at(p), at(r), rr)),
                ...[30, 44].map(
                  (rr) => [v[0] + u[0] * (rr + tw / 2), v[1] + u[1] * (rr + 6)] as Pt,
                ),
              ];
              const box = ([x, y]: Pt): Box => [x - tw / 2 - 2, y - 9, x + tw / 2 + 2, y + 5];
              const fits = (pt: Pt) =>
                !taken.some((b) => hit(b, box(pt))) &&
                box(pt)[0] >= 0 &&
                box(pt)[2] <= w &&
                box(pt)[1] >= 0 &&
                box(pt)[3] <= h &&
                [-tw / 2, 0, tw / 2].every((dx) => off(pt[0] + dx, pt[1] - 2) > 6);
              const pt = cands.find(fits) ?? cands[0]!;
              taken.push(box(pt));
              return pt;
            };
            const corner = (k: 'A' | 'B' | 'C' | 'D', p: string, r: string) => {
              const lit = k === 'A' ? c.chartHighlight : k === 'C' ? c.chartSecond : c.chartMuted;
              const shown = q[k] !== undefined || k === 'A' || k === 'C';
              const label = text(q[k], g[k]);
              const pt = shown ? spot(k, p, r, label) : undefined;
              return (
                <G key={`c${k}`}>
                  <Arcs v={at(k)} p={at(p)} q={at(r)} count={1} r={18} color={lit} fill={lit} />
                  {pt ? (
                    <ChartText
                      {...fitLabel(pt[0], label, chart.label, w)}
                      y={pt[1] + 4}
                      fontWeight="700"
                    >
                      {label}
                    </ChartText>
                  ) : null}
                </G>
              );
            };
            return (
              <Svg width={w} height={h} opacity={ok ? 1 : 0.35}>
                {circle}
                {onA.el}
                {onC.el}
                <Polygon
                  points={quad.map((p) => p.join(',')).join(' ')}
                  fill={c.chartFill}
                  opacity={0.6}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                  strokeLinejoin="round"
                />
                {corner('A', 'D', 'B')}
                {corner('B', 'A', 'C')}
                {corner('C', 'B', 'D')}
                {corner('D', 'C', 'A')}
                {['A', 'B', 'C', 'D'].map((k) => name(k, mid))}
              </Svg>
            );
          }
          // arcAngle
          const a = spec.arcAngle!;
          const inside1 = fig.where === 1;
          const [a1, a2] = fig.arcs ?? [0, 0];
          const V = inside1 ? 'E' : 'P';
          const first = inside1 ? arc('C', 'A', c.chartHighlight) : arc('D', 'B', c.chartHighlight);
          const second = inside1 ? arc('D', 'B', c.chartSecond) : arc('A', 'C', c.chartSecond);
          const angleLabel = a.angle ? rep.label(a.angle) : `${n2(fig.angle ?? 0)}°`;
          return (
            <Svg width={w} height={h} opacity={ok ? 1 : 0.35}>
              {circle}
              {first.el}
              {second.el}
              {inside1 ? (
                <>
                  {seg('A', 'B')}
                  {seg('C', 'D')}
                  <Arcs
                    v={at('E')}
                    p={at('A')}
                    q={at('C')}
                    count={1}
                    r={20}
                    color={c.chartInk}
                    fill={c.chartHighlight}
                  />
                  <Arcs
                    v={at('E')}
                    p={at('B')}
                    q={at('D')}
                    count={1}
                    r={20}
                    color={c.chartInk}
                    fill={c.chartSecond}
                  />
                  {angleText(at('E'), at('A'), at('C'), 42, angleLabel, 'angle')}
                  {radial(first.mid, 1.2, text(a.arcs[0], a1), c.chartInk, 'arc1')}
                  {radial(second.mid, 1.2, text(a.arcs[1], a2), c.chartInk, 'arc2')}
                </>
              ) : (
                <>
                  {seg('P', 'B')}
                  {seg('P', 'D')}
                  <Arcs
                    v={at('P')}
                    p={at('B')}
                    q={at('D')}
                    count={1}
                    r={26}
                    color={c.chartInk}
                    fill={c.chartInk}
                  />
                  {radial(first.mid, 1.22, text(a.arcs[0], a1), c.chartInk, 'arc1')}
                  {radial(second.mid, 0.62, text(a.arcs[1], a2), c.chartInk, 'arc2')}
                  {/* The angle's value under P, clear of the two secants. */}
                  <ChartText
                    {...fitLabel(at('P')[0], angleLabel, chart.label, w)}
                    y={at('P')[1] + 34}
                    fontWeight="700"
                  >
                    {angleLabel}
                  </ChartText>
                </>
              )}
              {['A', 'B', 'C', 'D'].map((k) => name(k))}
              {/* E's name to its right, between the sides of the angle beside ∠AEC. */}
              {name(V, inside1 ? [at('E')[0] - 1, at('E')[1]] : [at('P')[0] + 1, at('P')[1]])}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{captionOf()}</Caption>
    </View>
  );

  function captionOf(): string {
    if (fig.reason) return `Can't draw it: ${fig.reason}`;
    const sym = (x: string | number | undefined, word: string) =>
      typeof x === 'string' ? rep.variable(x).symbol : word;
    if (spec.theorem === 'cyclic') {
      const q = spec.cyclic ?? {};
      const g = fig.angles!;
      const lines = [
        'Opposite angles of an inscribed quadrilateral add to 180°: each is half the arc across from it, and those two arcs make the whole circle.',
        '∠A stands on the blue arc BCD, ∠C on the yellow arc DAB.',
        `m∠A + m∠C = ${n2(g.A)}° + ${n2(g.C)}° = 180°.`,
      ];
      if (q.B !== undefined || q.D !== undefined)
        lines.push(`m∠B + m∠D = ${n2(g.B)}° + ${n2(g.D)}° = 180°.`);
      return lines.join(' · ');
    }
    const a = spec.arcAngle!;
    const [a1, a2] = fig.arcs!;
    const x = sym(a.angle, 'Angle');
    const [s1, s2] = [sym(a.arcs[0], 'arc 1'), sym(a.arcs[1], 'arc 2')];
    return fig.where === 1
      ? [
          'Two chords crossing inside a circle: the angle is half the sum of the arcs it and its vertical angle stand on (blue and yellow).',
          `${x} = (${s1} + ${s2}) ÷ 2 = (${n2(a1)}° + ${n2(a2)}°) ÷ 2 = ${n2(fig.angle!)}°.`,
        ].join(' · ')
      : [
          'Two secants from a point outside: the angle is half the far arc (blue) minus the near arc (yellow).',
          `${x} = (${s1} − ${s2}) ÷ 2 = (${n2(a1)}° − ${n2(a2)}°) ÷ 2 = ${n2(fig.angle!)}°.`,
        ].join(' · ');
  }
}
