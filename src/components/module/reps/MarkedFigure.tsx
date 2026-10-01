import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon } from 'react-native-svg';

import type { MarkedFigureSpec } from '@/data/modules/typesHsc';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { Arcs, ParallelArrows, RightMark, Ticks, between, inside, type Pt } from './geoMarks';
import { buildFigure, splitNames } from './markedFigureGeo';

/** The relation between two numbered angles of a transversal figure. */
function pairName(x: number, y: number): string | undefined {
  const [a, b] = [Math.min(x, y), Math.max(x, y)];
  const key = `${a},${b}`;
  const same = a <= 4 === b <= 4;
  if (same) {
    const [p, q] = [(a - 1) % 4, (b - 1) % 4];
    return p + q === 3 ? 'Vertical angles' : 'A linear pair';
  }
  if (b - a === 4) return 'Corresponding angles';
  const names: Record<string, string> = {
    '3,6': 'Alternate interior angles',
    '4,5': 'Alternate interior angles',
    '1,8': 'Alternate exterior angles',
    '2,7': 'Alternate exterior angles',
    '3,5': 'Same-side interior angles',
    '4,6': 'Same-side interior angles',
    '1,7': 'Same-side exterior angles',
    '2,8': 'Same-side exterior angles',
  };
  return names[key];
}

/**
 * A geometry figure with its marks (spec in `typesHsc.ts`): named points, or the transversal,
 * triangle-center and quadrilateral presets. Every tick, arc, square and arrow is placed from
 * the figure, so it means what it says; a proof step lights what it uses and what it proves.
 */
export function MarkedFigure({ spec, calc }: { spec: MarkedFigureSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef<Pt>([0, 0]);
  const num = (x: string | number | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  const fig = buildFigure(spec, num);
  const ok = !fig.reason;

  // The drawing's extent (points and circles), kept while the transversal is dragged.
  const pts = Object.values(fig.pts);
  const xs = [
    ...pts.map((p) => p[0]),
    ...fig.circles.flatMap((k) => [fig.pts[k.c]![0] - k.r, fig.pts[k.c]![0] + k.r]),
  ];
  const ys = [
    ...pts.map((p) => p[1]),
    ...fig.circles.flatMap((k) => [fig.pts[k.c]![1] - k.r, fig.pts[k.c]![1] + k.r]),
  ];
  const live = {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
  const fit = useFrozen(live);
  const box = fit.value;
  const bw = Math.max(1e-6, box.maxX - box.minX);
  const bh = Math.max(1e-6, box.maxY - box.minY);
  const pad = 30;
  const scaleOf = (w: number) => Math.min((w - 2 * pad) / bw, (w * 1.0 - 2 * pad) / bh);

  const step = spec.proof
    ? Math.min(
        spec.proof.steps.length,
        Math.max(1, Math.round(rep.known(spec.proof.step) ? rep.val(spec.proof.step) : 1)),
      )
    : 0;
  const proofStep = spec.proof?.steps[step - 1];
  const t = spec.transversal;
  const handleOn = !!t && typeof t.angle === 'string' && !t.fixed && ok;

  return (
    <View>
      <Canvas aspect={(w) => (bh * scaleOf(w) + 2 * pad) / w}>
        {({ w, h }) => {
          const s = scaleOf(w);
          const left = (w - bw * s) / 2;
          const X = (x: number) => left + (x - box.minX) * s;
          const Y = (y: number) => pad + (box.maxY - y) * s;
          const at = (n: string): Pt => {
            const p = fig.pts[n]!;
            return [X(p[0]), Y(p[1])];
          };
          // Names and labels go out from the middle of the main shape (the corners).
          const all = (
            spec.quadrilateral
              ? ['A', 'B', 'C', 'D']
              : spec.triangle
                ? ['A', 'B', 'C']
                : Object.keys(fig.pts)
          ).map(at);
          const center: Pt = [
            all.reduce((q, p) => q + p[0], 0) / all.length,
            all.reduce((q, p) => q + p[1], 0) / all.length,
          ];
          /** A segment's ends in pixels, run on past them for a line or a ray. */
          const ends = (a: string, b: string, kind: 'segment' | 'ray' | 'line'): [Pt, Pt] => {
            const [p, q] = [at(a), at(b)];
            if (kind === 'segment') return [p, q];
            const d = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
            const u: Pt = [(q[0] - p[0]) / d, (q[1] - p[1]) / d];
            const run = 18;
            return [
              kind === 'line' ? [p[0] - u[0] * run, p[1] - u[1] * run] : p,
              [q[0] + u[0] * run, q[1] + u[1] * run],
            ];
          };
          const drawnSegs = fig.segs.map((g) => ends(g.a, g.b, g.kind));
          /** How far a text box centered at (x, y), `tw` wide, keeps from every line. */
          const clearance = (x: number, y: number, tw: number) => {
            let best = Infinity;
            for (const [p, q] of drawnSegs) {
              const dx = q[0] - p[0];
              const dy = q[1] - p[1];
              for (const sx of [-3, -2, -1, 0, 1, 2, 3].map((k) => x + (k * tw) / 6)) {
                const t0 = ((sx - p[0]) * dx + (y - p[1]) * dy) / (dx * dx + dy * dy || 1);
                const t1 = Math.max(0, Math.min(1, t0));
                best = Math.min(best, Math.hypot(sx - p[0] - dx * t1, y - p[1] - dy * t1));
              }
            }
            // Past the canvas edge counts as no room.
            if (x - tw / 2 < 0 || x + tw / 2 > w || y < 8 || y > h - 4) best = Math.min(best, 0);
            return best;
          };
          const tint = (ref: string) =>
            proofStep?.proved.includes(ref)
              ? c.chartHighlight
              : proofStep?.given.includes(ref)
                ? c.chartSecond
                : undefined;
          const refs = proofStep ? [...proofStep.given, ...proofStep.proved] : [];
          const wedge = (v: Pt, p: Pt, q: Pt, r: number) => {
            const [a0, sw] = between(v, p, q);
            const e0: Pt = [v[0] + r * Math.cos(a0), v[1] + r * Math.sin(a0)];
            const e1: Pt = [v[0] + r * Math.cos(a0 + sw), v[1] + r * Math.sin(a0 + sw)];
            return `M ${v[0]} ${v[1]} L ${e0[0]} ${e0[1]} A ${r} ${r} 0 0 ${sw > 0 ? 1 : 0} ${e1[0]} ${e1[1]} Z`;
          };
          const shape = spec.quadrilateral
            ? ['A', 'B', 'C', 'D']
            : spec.triangle
              ? ['A', 'B', 'C']
              : undefined;
          return (
            <>
              <Svg width={w} height={h} opacity={ok ? 1 : 0.35}>
                {shape ? (
                  <Polygon
                    points={shape.map((n) => at(n).join(',')).join(' ')}
                    fill={c.chartFill}
                    opacity={0.45}
                  />
                ) : null}
                {/* Proof step: triangles and angles filled in their tint first. */}
                {refs.map((ref) => {
                  const col = tint(ref)!;
                  if (ref.startsWith('△')) {
                    const names = splitNames(fig, ref.slice(1));
                    return names ? (
                      <Polygon
                        key={ref}
                        points={names.map((n) => at(n).join(',')).join(' ')}
                        fill={col}
                        opacity={0.3}
                      />
                    ) : null;
                  }
                  const names = splitNames(fig, ref);
                  if (names?.length !== 3) return null;
                  const [p, v, q] = names.map(at) as [Pt, Pt, Pt];
                  return <Path key={ref} d={wedge(v, p, q, 24)} fill={col} opacity={0.55} />;
                })}
                {t?.highlight?.map((n) => {
                  const a = fig.numbers[n - 1];
                  if (!a) return null;
                  return (
                    <Path
                      key={`h${n}`}
                      d={wedge(at(a.v), at(a.p), at(a.q), 30)}
                      fill={c.chartHighlight}
                      opacity={0.3}
                    />
                  );
                })}
                {fig.circles.map((k, i) => (
                  <Circle
                    key={`c${i}`}
                    cx={at(k.c)[0]}
                    cy={at(k.c)[1]}
                    r={k.r * s}
                    fill="none"
                    stroke={c.chartMuted}
                    strokeWidth={chart.strokeLight}
                    strokeDasharray={k.dashed ? chart.dashFine : undefined}
                  />
                ))}
                {fig.segs.map((g, i) => {
                  const [p, q] = ends(g.a, g.b, g.kind);
                  const col = tint(`${g.a}${g.b}`) ?? tint(`${g.b}${g.a}`);
                  return (
                    <Line
                      key={`s${i}`}
                      x1={p[0]}
                      y1={p[1]}
                      x2={q[0]}
                      y2={q[1]}
                      stroke={col ?? (g.dashed ? c.chartMuted : c.chartInk)}
                      strokeWidth={col ? chart.strokeHeavy + 1 : chart.stroke}
                      strokeDasharray={g.dashed ? chart.dash : undefined}
                      strokeLinecap="round"
                    />
                  );
                })}
                {fig.ticks.map((k, i) => (
                  <Ticks key={`t${i}`} p={at(k.a)} q={at(k.b)} count={k.count} color={c.chartInk} />
                ))}
                {fig.parallels.map((k, i) => (
                  <ParallelArrows
                    key={`p${i}`}
                    p={at(k.a)}
                    q={at(k.b)}
                    count={k.count}
                    color={c.chartInk}
                    at={t ? 0.8 : 0.5}
                  />
                ))}
                {fig.arcs.map((k, i) => (
                  <Arcs
                    key={`a${i}`}
                    v={at(k.v)}
                    p={at(k.p)}
                    q={at(k.q)}
                    count={k.count}
                    r={t ? 13 : 16}
                    color={c.chartInk}
                  />
                ))}
                {fig.rights.map((k, i) => (
                  <RightMark key={`r${i}`} v={at(k.v)} p={at(k.p)} q={at(k.q)} color={c.chartInk} />
                ))}
                {fig.numbers.map((k) => {
                  const [x, y] = inside(at(k.v), at(k.p), at(k.q), 32);
                  const lit = t?.highlight?.includes(k.n);
                  return (
                    <ChartText
                      key={`n${k.n}`}
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fontWeight="700"
                      fill={lit ? c.chartHighlight : c.chartInk}
                    >
                      {k.n}
                    </ChartText>
                  );
                })}
                {fig.named.map((n) => {
                  const p = at(n);
                  // Of eight places round the point, the one clearest of the lines (ties:
                  // away from the middle of the shape).
                  const away = Math.atan2(p[1] - center[1], p[0] - center[0]);
                  const spots = Array.from({ length: 8 }, (_, i) => {
                    const a = away + (i * Math.PI) / 4;
                    const sx = p[0] + Math.cos(a) * 13;
                    const sy = p[1] + Math.sin(a) * 13;
                    return { sx, sy, room: Math.min(9, clearance(sx, sy, 9)) - i * 0.01 };
                  });
                  const spot = spots.reduce((b, s) => (s.room > b.room ? s : b));
                  const x = spot.sx;
                  const y = spot.sy + 4;
                  return (
                    <G key={`name${n}`}>
                      <Circle cx={p[0]} cy={p[1]} r={2.5} fill={c.chartInk} />
                      <ChartText {...fitLabel(x, n, chart.label, w)} y={y} fontWeight="700">
                        {n}
                      </ChartText>
                    </G>
                  );
                })}
                {ok
                  ? fig.labels.map((l, i) => {
                      if (t || l.inCaption) return null;
                      const names = splitNames(fig, l.at);
                      if (!names) return null;
                      const full = l.value ? rep.label(l.value) : (l.text ?? '');
                      const short = l.value ? rep.variable(l.value).symbol : full;
                      // Places to try, best first: in the angle along its bisector, or beside
                      // the segment (either side, at its middle or a little off it).
                      const spots = (text: string): Pt[] => {
                        const tw = text.length * chart.label * 0.58;
                        if (names.length === 3) {
                          const [p, v, q] = names.map(at) as [Pt, Pt, Pt];
                          return [40, 54, 68].map((r) => inside(v, p, q, r + tw / 3));
                        }
                        const [p, q] = names.map(at) as [Pt, Pt];
                        const d = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
                        const nx = -(q[1] - p[1]) / d;
                        const ny = (q[0] - p[0]) / d;
                        const off = 8 + Math.abs(nx) * (tw / 2) + Math.abs(ny) * 7;
                        return [0.5, 0.38, 0.62].flatMap((k) => {
                          const m: Pt = [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];
                          const out =
                            (center[0] - m[0]) * nx + (center[1] - m[1]) * ny > 0 ? -1 : 1;
                          return [out, -out].map(
                            (sgn) => [m[0] + sgn * nx * off, m[1] + sgn * ny * off] as Pt,
                          );
                        });
                      };
                      const room = (text: string, pt: Pt) =>
                        Math.min(
                          clearance(pt[0], pt[1], text.length * chart.label * 0.58),
                          // From the label's box, not its middle ("d = 13" sat on O).
                          ...fig.named.map(
                            (n) =>
                              Math.hypot(
                                Math.max(
                                  0,
                                  Math.abs(at(n)[0] - pt[0]) -
                                    (text.length * chart.label * 0.58) / 2,
                                ),
                                Math.max(0, Math.abs(at(n)[1] - pt[1]) - 7),
                              ) - 8,
                          ),
                        );
                      const pick = (text: string) =>
                        spots(text).reduce(
                          (b, pt, j) => {
                            const r = Math.min(7, room(text, pt)) - j * 0.01;
                            return r > b.r ? { pt, r } : b;
                          },
                          { pt: [0, 0] as Pt, r: -Infinity },
                        );
                      // The whole label where it fits clear of the lines, else its letter
                      // (the caption gives every labelled value).
                      const whole = pick(full);
                      const [text, place] =
                        whole.r >= 6 ? [full, whole.pt] : [short, pick(short).pt];
                      return (
                        <ChartText
                          key={`l${i}`}
                          {...fitLabel(place[0], text, chart.label, w)}
                          y={Math.max(12, Math.min(h - 4, place[1] + 4))}
                          fontWeight="600"
                          fill={c.chartHighlight}
                        >
                          {text}
                        </ChartText>
                      );
                    })
                  : null}
              </Svg>
              {handleOn ? (
                <DragHandle
                  testID="drag-transversal"
                  x={at('T1')[0]}
                  y={at('T1')[1]}
                  label={rep.variable(t.angle as string).name}
                  onStart={() => {
                    start.current = at('T1');
                    fit.freeze();
                  }}
                  onEnd={fit.release}
                  onMove={(dx, dy) => {
                    const P = at('P');
                    const x = start.current[0] + dx - P[0];
                    const y = -(start.current[1] + dy - P[1]);
                    if (y <= 2) return;
                    // Angle 1 is between the left ray and the transversal.
                    const phi = (Math.atan2(y, x) * 180) / Math.PI;
                    const id = t.angle as string;
                    calc.set(
                      {
                        ...rep.pin(typeof t.second === 'string' ? [t.second] : []),
                        [id]: rep.snapTo(id, 180 - phi),
                      },
                      rep.slide(id),
                    );
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{captionOf()}</Caption>
    </View>
  );

  function captionOf(): string {
    if (fig.reason) return `Can't draw it: ${fig.reason}`;
    const lines: string[] = [];
    const named = (id: string) => rep.label(id);
    if (t) {
      const one = num(t.angle)!;
      const five = t.second === undefined ? one : num(t.second)!;
      const parallel = Math.abs(one - five) < 1e-9;
      const v = (x: number) => `${formatNumber(Number(x.toFixed(2)))}°`;
      const angleOf = (n: number) => {
        const base = n <= 4 ? one : five;
        return [1, 4, 5, 8].includes(n) ? base : 180 - base;
      };
      if (t.highlight?.length === 2) {
        const [a, b] = t.highlight as [number, number];
        const name = pairName(a, b);
        const eq = Math.abs(angleOf(a) - angleOf(b)) < 1e-9;
        const sum = Math.abs(angleOf(a) + angleOf(b) - 180) < 1e-9;
        lines.push(
          `${name ?? 'Angles'} ${a} and ${b}: ∠${a} = ${v(angleOf(a))}, ∠${b} = ${v(angleOf(b))}` +
            (eq ? ', equal.' : sum ? ', adding to 180°.' : '.'),
        );
      }
      lines.push(
        parallel
          ? `The lines are parallel (arrows): angles 1, 4, 5 and 8 are ${v(one)}; 2, 3, 6 and 7 are ${v(180 - one)}.`
          : `∠1 = ${v(one)} but ∠5 = ${v(five)}: corresponding angles differ, so the lines are not parallel.`,
      );
      for (const id of Object.values(t.labels ?? {})) lines.push(named(id));
      return lines.join(' · ');
    }
    if (spec.triangle?.lines) {
      const say: Record<string, string> = {
        median:
          'Each median joins a corner to the middle of the far side (equal ticks). They meet at the centroid G, two thirds of the way along each.',
        bisector:
          'Each angle bisector splits its angle into two equal parts (equal arcs). They meet at the incenter I, the center of the circle that touches all three sides.',
        perpendicular:
          'Each perpendicular bisector crosses its side at the middle, at right angles. They meet at the circumcenter O, the center of the circle through A, B and C.',
        altitude:
          'Each altitude runs from a corner at right angles to the far side (run on when the foot is outside). They meet at the orthocenter H.',
        midsegment:
          'The midsegment DE joins the middles of AB and AC: it is parallel to BC and half as long.',
      };
      lines.push(say[spec.triangle.lines]!);
    }
    if (spec.quadrilateral) {
      const say: Record<string, string> = {
        parallelogram:
          'A parallelogram: opposite sides parallel and equal, opposite angles equal; the diagonals cut each other in half.',
        rectangle:
          'A rectangle: four right angles, opposite sides equal; the diagonals are equal and cut each other in half.',
        rhombus:
          'A rhombus: four equal sides, opposite angles equal; the diagonals cut each other in half at right angles.',
        square:
          'A square: four equal sides and four right angles; the diagonals are equal and meet at right angles.',
        trapezoid: 'A trapezoid: one pair of parallel sides, AB and DC.',
        kite: 'A kite: two pairs of equal sides next to each other; the diagonals meet at right angles.',
      };
      lines.push(say[spec.quadrilateral.family]!);
    }
    for (const l of fig.labels) if (l.value && !t) lines.push(named(l.value));
    if (proofStep && spec.proof) {
      lines.push(`Step ${step} of ${spec.proof.steps.length}: ${proofStep.text}`);
      lines.push('Yellow: what the step uses. Blue: what it proves.');
    }
    return lines.join(' · ');
  }
}
