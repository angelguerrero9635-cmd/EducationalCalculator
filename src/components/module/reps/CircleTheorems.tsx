import { useRef, useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { CircleTheoremsSpec } from '@/data/modules/typesHsc';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { Arcs, RightMark, inside, type Pt } from './geoMarks';
import { buildCircle } from './circleGeo';

const deg = (r: number) => (r * 180) / Math.PI;

/**
 * A circle theorem drawn from the values (spec in `typesHsc.ts`): central and inscribed angles,
 * the angle in a semicircle, a tangent at right angles to its radius, and the chord–chord,
 * secant–secant and secant–tangent products. Points drag along the circle where a value can
 * follow them; a figure the values can't make draws faded with the reason.
 */
export function CircleTheorems({ spec, calc }: { spec: CircleTheoremsSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const [p, setP] = useState(90);
  const start = useRef<Pt>([0, 0]);
  const num = (id: string | undefined) =>
    id === undefined ? undefined : rep.known(id) ? rep.shown(id) : undefined;
  const fig = buildCircle(spec, num, p);
  const ok = !fig.reason;
  const known = (spec.segments ?? []).every(rep.known);

  // Extent: the circle and every point, kept while a handle is dragged.
  const pts = Object.values(fig.pts);
  const live = {
    minX: Math.min(-fig.R, ...pts.map((q) => q[0])),
    maxX: Math.max(fig.R, ...pts.map((q) => q[0])),
    minY: Math.min(-fig.R, ...pts.map((q) => q[1])),
    maxY: Math.max(fig.R, ...pts.map((q) => q[1])),
  };
  const fit = useFrozen(live);
  const box = fit.value;
  const bw = box.maxX - box.minX;
  const bh = box.maxY - box.minY;
  const pad = 34;
  const scaleOf = (w: number) => Math.min((w - 2 * pad) / bw, (w * 0.9 - 2 * pad) / bh);
  const handles = !spec.fixed && ok;

  return (
    <View>
      <Canvas aspect={(w) => (bh * scaleOf(w) + 2 * pad) / w}>
        {({ w, h }) => {
          const s = scaleOf(w);
          const left = (w - bw * s) / 2;
          const X = (x: number) => left + (x - box.minX) * s;
          const Y = (y: number) => pad + (box.maxY - y) * s;
          const at = (n: string): Pt => [X(fig.pts[n]![0]), Y(fig.pts[n]![1])];
          const O = at('O');
          const R = fig.R * s;
          const seg = (
            a: string,
            b: string,
            color = c.chartInk,
            width = chart.stroke,
            dash?: string,
          ) => (
            <Line
              key={`${a}${b}`}
              x1={at(a)[0]}
              y1={at(a)[1]}
              x2={at(b)[0]}
              y2={at(b)[1]}
              stroke={color}
              strokeWidth={width}
              strokeDasharray={dash}
              strokeLinecap="round"
            />
          );
          /** A point's name, outward from O (or from the figure's middle). */
          const name = (n: string, from: Pt = O) => {
            const q = at(n);
            const d = Math.hypot(q[0] - from[0], q[1] - from[1]) || 1;
            const x = q[0] + ((q[0] - from[0]) / d) * 14;
            const y = q[1] + ((q[1] - from[1]) / d) * 14 + 4;
            return (
              <G key={`n${n}`}>
                <Circle cx={q[0]} cy={q[1]} r={3} fill={c.chartInk} />
                <ChartText {...fitLabel(x, n, chart.label, w)} y={y} fontWeight="700">
                  {n}
                </ChartText>
              </G>
            );
          };
          /** A value beside the segment ab, on the side away from `away`. */
          const segLabel = (a: string, b: string, id: string, away: Pt = O) => {
            const [pa, pb] = [at(a), at(b)];
            const m: Pt = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
            const d = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) || 1;
            let nx = -(pb[1] - pa[1]) / d;
            let ny = (pb[0] - pa[0]) / d;
            if ((away[0] - m[0]) * nx + (away[1] - m[1]) * ny > 0) [nx, ny] = [-nx, -ny];
            const text = rep.label(id);
            const tw = text.length * chart.label * 0.58;
            const off = 7 + Math.abs(nx) * (tw / 2) + Math.abs(ny) * 7;
            return (
              <ChartText
                key={`l${a}${b}`}
                {...fitLabel(m[0] + nx * off, text, chart.label, w)}
                y={Math.max(12, Math.min(h - 4, m[1] + ny * off + 4))}
                fontWeight="600"
                fill={c.chartHighlight}
              >
                {text}
              </ChartText>
            );
          };
          const angleLabel = (
            v: string,
            a: string,
            b: string,
            id: string | undefined,
            r: number,
          ) => {
            if (!id) return null;
            const [x, y] = inside(at(v), at(a), at(b), r);
            const text = rep.label(id);
            return (
              <ChartText
                key={`al${v}`}
                {...fitLabel(x, text, chart.label, w)}
                y={y + 4}
                fontWeight="700"
                fill={c.chartHighlight}
              >
                {text}
              </ChartText>
            );
          };
          const th = spec.theorem;
          // The arc AB a central or inscribed angle stands on, drawn heavy.
          const arcAB = () => {
            // From A round the bottom of the circle to B, the arc's degrees, in short steps.
            const cen = fig.arc ?? 0;
            const a0 = -90 - cen / 2;
            const d = Array.from({ length: 61 }, (_, k) => {
              const t = ((a0 + (cen * k) / 60) * Math.PI) / 180;
              return `${k ? 'L' : 'M'} ${O[0] + R * Math.cos(t)} ${O[1] - R * Math.sin(t)}`;
            }).join(' ');
            return (
              <Path
                d={d}
                stroke={c.chartHighlight}
                strokeWidth={chart.strokeHeavy + 1}
                fill="none"
              />
            );
          };
          const angleOf = (q: Pt) => deg(Math.atan2(-(q[1] - O[1]), q[0] - O[0]));
          return (
            <>
              <Svg width={w} height={h} opacity={ok ? 1 : 0.35}>
                <Circle
                  cx={O[0]}
                  cy={O[1]}
                  r={R}
                  fill={c.chartSurface}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                {th === 'inscribed' ? (
                  <>
                    {arcAB()}
                    {seg('O', 'A', c.chartMuted)}
                    {seg('O', 'B', c.chartMuted)}
                    {seg('P', 'A')}
                    {seg('P', 'B')}
                    <Arcs
                      v={O}
                      p={at('A')}
                      q={at('B')}
                      count={1}
                      r={16}
                      color={c.chartMuted}
                      fill={c.chartMuted}
                    />
                    <Arcs
                      v={at('P')}
                      p={at('A')}
                      q={at('B')}
                      count={1}
                      r={20}
                      color={c.chartHighlight}
                      fill={c.chartHighlight}
                    />
                    {angleLabel('O', 'A', 'B', spec.central, 38)}
                    {angleLabel('P', 'A', 'B', spec.inscribed, 50)}
                    {['A', 'B', 'P'].map((q) => name(q))}
                    {name('O', [O[0], O[1] - 1])}
                  </>
                ) : null}
                {th === 'semicircle' ? (
                  <>
                    {seg('A', 'B', c.chartMuted)}
                    {seg('P', 'A')}
                    {seg('P', 'B')}
                    <RightMark v={at('P')} p={at('A')} q={at('B')} color={c.chartHighlight} />
                    <Arcs v={at('A')} p={at('B')} q={at('P')} count={1} r={20} color={c.chartInk} />
                    <Arcs v={at('B')} p={at('P')} q={at('A')} count={2} r={20} color={c.chartInk} />
                    {angleLabel('A', 'B', 'P', spec.angle, 50)}
                    {angleLabel('B', 'P', 'A', spec.other, 50)}
                    {['A', 'B', 'P'].map((q) => name(q))}
                    {name('O', [O[0], O[1] - 1])}
                  </>
                ) : null}
                {th === 'tangent' ? (
                  <>
                    <Line
                      x1={Math.max(4, X(-fig.R * 0.9))}
                      y1={at('T')[1]}
                      x2={Math.min(w - 4, at('P')[0] + 30)}
                      y2={at('T')[1]}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                    />
                    {seg('O', 'T', c.chartHighlight, chart.strokeHeavy)}
                    {seg('O', 'P', c.chartMuted, chart.stroke, chart.dash)}
                    <RightMark v={at('T')} p={O} q={at('P')} color={c.chartHighlight} />
                    {spec.radius ? segLabel('O', 'T', spec.radius, at('P')) : null}
                    {spec.tangent ? segLabel('T', 'P', spec.tangent) : null}
                    {spec.distance ? segLabel('O', 'P', spec.distance, at('T')) : null}
                    {name('T')}
                    {name('P', [at('P')[0] - 1, at('P')[1] + 1])}
                    {name('O', [O[0] + 1, O[1] - 1])}
                  </>
                ) : null}
                {th === 'chords' ? (
                  <>
                    {seg('A', 'E', c.chartHighlight, chart.strokeHeavy)}
                    {seg('E', 'B', c.chartHighlight, chart.strokeHeavy)}
                    {seg('C', 'E', c.chartSecond, chart.strokeHeavy)}
                    {seg('E', 'D', c.chartSecond, chart.strokeHeavy)}
                    {(spec.segments ?? []).map((id, i) => {
                      const [a, b] = (
                        [
                          ['A', 'E'],
                          ['E', 'B'],
                          ['C', 'E'],
                          ['E', 'D'],
                        ] as const
                      )[i]!;
                      // Into the wider of the two angles the other chord makes with this part
                      // at E: away from the end that makes the narrower one.
                      const others = i < 2 ? ['C', 'D'] : ['A', 'B'];
                      const E = at('E');
                      const X = at(a === 'E' ? b : a);
                      const turn = (Y: Pt) =>
                        Math.abs(
                          Math.atan2(
                            (X[0] - E[0]) * (Y[1] - E[1]) - (X[1] - E[1]) * (Y[0] - E[0]),
                            (X[0] - E[0]) * (Y[0] - E[0]) + (X[1] - E[1]) * (Y[1] - E[1]),
                          ),
                        );
                      const near = others.map(at).reduce((x, y) => (turn(x) < turn(y) ? x : y));
                      return segLabel(a, b, id, near);
                    })}
                    {['A', 'B', 'C', 'D'].map((q) => name(q))}
                    {name('E', [at('E')[0] - 1, at('E')[1]])}
                    <Circle cx={O[0]} cy={O[1]} r={2.5} fill={c.chartMuted} />
                  </>
                ) : null}
                {th === 'secants' || th === 'secantTangent' ? (
                  <>
                    {th === 'secants' ? (
                      <>
                        {seg('P', 'A', c.chartHighlight, chart.strokeHeavy)}
                        {seg('A', 'B', c.chartHighlight, chart.stroke)}
                        {seg('P', 'C', c.chartSecond, chart.strokeHeavy)}
                        {seg('C', 'D', c.chartSecond, chart.stroke)}
                      </>
                    ) : (
                      <>
                        {seg('P', 'T', c.chartHighlight, chart.strokeHeavy)}
                        {seg('P', 'A', c.chartSecond, chart.strokeHeavy)}
                        {seg('A', 'B', c.chartSecond, chart.stroke)}
                        {seg('O', 'T', c.chartMuted, chart.strokeLight, chart.dash)}
                        <RightMark v={at('T')} p={O} q={at('P')} color={c.chartMuted} />
                      </>
                    )}
                    {secantLabels()}
                    {(th === 'secants' ? ['A', 'B', 'C', 'D'] : ['T', 'A', 'B']).map((q) =>
                      name(q),
                    )}
                    {name('P', [at('P')[0] + 1, at('P')[1]])}
                    <Circle cx={O[0]} cy={O[1]} r={2.5} fill={c.chartMuted} />
                  </>
                ) : null}
              </Svg>
              {handles && th === 'inscribed' ? (
                <>
                  <DragHandle
                    testID="drag-p"
                    x={at('P')[0]}
                    y={at('P')[1]}
                    label="P along the circle"
                    onStart={() => {
                      start.current = at('P');
                      fit.freeze();
                    }}
                    onEnd={fit.release}
                    onMove={(dx, dy) =>
                      setP(angleOf([start.current[0] + dx, start.current[1] + dy]))
                    }
                  />
                  {spec.central ? (
                    <DragHandle
                      testID="drag-arc"
                      x={at('B')[0]}
                      y={at('B')[1]}
                      label={rep.variable(spec.central).name}
                      onStart={() => {
                        start.current = at('B');
                        fit.freeze();
                      }}
                      onEnd={fit.release}
                      onMove={(dx, dy) => {
                        // B's angle past the bottom of the circle is half the arc.
                        let a = angleOf([start.current[0] + dx, start.current[1] + dy]) + 90;
                        while (a < 0) a += 360;
                        while (a >= 360) a -= 360;
                        const id = spec.central!;
                        calc.set({ [id]: rep.snapTo(id, Math.min(179, a) * 2) }, rep.slide(id));
                      }}
                    />
                  ) : null}
                </>
              ) : null}
              {handles && th === 'semicircle' && spec.angle ? (
                <DragHandle
                  testID="drag-p"
                  x={at('P')[0]}
                  y={at('P')[1]}
                  label={rep.variable(spec.angle).name}
                  onStart={() => {
                    start.current = at('P');
                    fit.freeze();
                  }}
                  onEnd={fit.release}
                  onMove={(dx, dy) => {
                    const a = angleOf([start.current[0] + dx, start.current[1] + dy]);
                    if (a <= 0 || a >= 180) return;
                    const id = spec.angle!;
                    calc.set({ [id]: rep.snapTo(id, a / 2) }, rep.slide(id));
                  }}
                />
              ) : null}
              {handles && th === 'tangent' && spec.tangent ? (
                <DragHandle
                  testID="drag-p"
                  x={at('P')[0]}
                  y={at('P')[1]}
                  label={rep.variable(spec.tangent).name}
                  onStart={() => {
                    start.current = at('P');
                    fit.freeze();
                  }}
                  onEnd={fit.release}
                  onMove={(dx) => {
                    const id = spec.tangent!;
                    const t = (start.current[0] + dx - at('T')[0]) / s;
                    calc.set(
                      {
                        ...rep.pin(spec.radius ? [spec.radius] : []),
                        [id]: rep.snapTo(id, t * rep.factor(id)),
                      },
                      rep.slide(id),
                    );
                  }}
                />
              ) : null}
            </>
          );

          function secantLabels() {
            const ids = spec.segments ?? [];
            // Outside parts beside their segment; whole secants along the far side.
            const pairs: [string, string][] =
              th === 'secants'
                ? [
                    ['P', 'A'],
                    ['P', 'B'],
                    ['P', 'C'],
                    ['P', 'D'],
                  ]
                : [
                    ['P', 'T'],
                    ['P', 'A'],
                    ['P', 'B'],
                  ];
            return pairs.map(([a, b], i) => {
              const id = ids[i];
              if (!id) return null;
              // A whole secant's label sits past the circle, at its far end.
              const whole =
                (th === 'secants' && (i === 1 || i === 3)) || (th === 'secantTangent' && i === 2);
              if (!whole) return segLabel(a, b, id);
              const q = at(b);
              const text = rep.label(id);
              const dir = Math.atan2(q[1] - at(a)[1], q[0] - at(a)[0]);
              return (
                <ChartText
                  key={`w${b}`}
                  {...fitLabel(q[0] + Math.cos(dir) * 22, text, chart.label, w, 'start', 22)}
                  y={q[1] + Math.sin(dir) * 22 + (Math.sin(dir) < 0 ? -4 : 14)}
                  fontWeight="600"
                  fill={c.chartHighlight}
                >
                  {text}
                </ChartText>
              );
            });
          }
        }}
      </Canvas>
      <Caption>{captionOf()}</Caption>
    </View>
  );

  function captionOf(): string {
    if (fig.reason) return `Can't draw it: ${fig.reason}`;
    const v = (id: string | undefined) => (id ? rep.value(id, false) : '?');
    const sym = (id: string | undefined) => (id ? rep.variable(id).symbol : '?');
    const segs = spec.segments ?? [];
    switch (spec.theorem) {
      case 'inscribed':
        return [
          'An inscribed angle is half the central angle on the same arc.',
          `Inscribed angle: ${sym(spec.inscribed)} = ${sym(spec.central)}/2 = ${v(spec.central)}°/2 = ${v(spec.inscribed)}°`,
          'Drag P along the far arc: the angle stays the same.',
        ].join(' · ');
      case 'semicircle':
        return [
          'An angle inscribed in a semicircle is a right angle: it stands on a 180° arc.',
          `${sym(spec.angle)} + ${sym(spec.other)} = 90° · ${v(spec.angle)}° + ${v(spec.other)}° = 90°`,
        ].join(' · ');
      case 'tangent':
        return [
          'A tangent meets the radius at a right angle, so OTP is a right triangle.',
          `${sym(spec.radius)}² + ${sym(spec.tangent)}² = ${sym(spec.distance)}² · ${v(spec.radius)}² + ${v(spec.tangent)}² = ${v(spec.distance)}²`,
        ].join(' · ');
      case 'chords':
        return [
          'Chords crossing inside a circle: the products of their parts are equal.',
          `Products: ${segs.map(sym).slice(0, 2).join(' × ')} = ${segs.map(sym).slice(2).join(' × ')}`,
          known
            ? `${v(segs[0])} × ${v(segs[1])} = ${v(segs[2])} × ${v(segs[3])} = ${formatNumber(Number((rep.shown(segs[0]!) * rep.shown(segs[1]!)).toFixed(4)))}`
            : '',
        ]
          .filter(Boolean)
          .join(' · ');
      case 'secants':
        return [
          'Two secants from P: outside part × whole secant is the same for both.',
          `Products: ${sym(segs[0])} × ${sym(segs[1])} = ${sym(segs[2])} × ${sym(segs[3])}`,
          known
            ? `${v(segs[0])} × ${v(segs[1])} = ${v(segs[2])} × ${v(segs[3])} = ${formatNumber(Number((rep.shown(segs[0]!) * rep.shown(segs[1]!)).toFixed(4)))}`
            : '',
        ]
          .filter(Boolean)
          .join(' · ');
      case 'secantTangent':
        return [
          'A tangent and a secant from P: the tangent squared is outside part × whole secant.',
          `Tangent squared: ${sym(segs[0])}² = ${sym(segs[1])} × ${sym(segs[2])}`,
          known
            ? `${v(segs[0])}² = ${v(segs[1])} × ${v(segs[2])} = ${formatNumber(Number((rep.shown(segs[1]!) * rep.shown(segs[2]!)).toFixed(4)))}`
            : '',
        ]
          .filter(Boolean)
          .join(' · ');
      default:
        // cyclic and arcAngle are drawn by CircleAngles.tsx (group H2B).
        return '';
    }
  }
}
