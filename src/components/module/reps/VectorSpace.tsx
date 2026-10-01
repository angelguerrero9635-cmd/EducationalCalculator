import { type ReactElement, useRef, useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { VectorDiagramSpec } from '@/data/modules/typesHsd';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle, useRep } from './common';
import { Arrow, arrowHead } from './graphKit';
import { niceStep } from './hsdGrid';
import { short } from './hsdKit';
import { chipBox, MathChip } from './hsdText';
import { add3, angle3, cross3, dot3, len3, scale3, sub3, type V3, viewOf } from './vectorSpace';

const TILT = 22;

/** "⟨1, 2, −3⟩" */
const bracket3 = (p: V3) => `⟨${p.map(short).join(', ')}⟩`;
/** "(1, 2, −3)" */
const point3 = (p: V3) => `(${p.map(short).join(', ')})`;
/** A number in a sum, bracketed when negative. */
const par = (x: number) => (x < 0 ? `(${short(x)})` : short(x));

/**
 * Vectors in space (H106, `vectorDiagram` with `space`): x, y and z axes seen from above and to
 * one side, each vector an arrow from the origin with its tip dropped dashed to the floor; the
 * parallelogram of u and v, u × v square to it, the angle between them, the box a third vector
 * makes, or two points with the segment between them and its legs. Drag the turn handle to spin
 * the view about z.
 */
export function VectorSpace({ spec, calc }: { spec: VectorDiagramSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const s = spec.space!;
  const [turn, setTurn] = useState(32);
  const start = useRef(32);
  // The scale and center while the view is turned (set when a drag starts).
  const [held, setHeld] = useState<{ k: number; ox: number; oy: number } | null>(null);
  const heldNext = useRef<{ k: number; ox: number; oy: number } | null>(null);
  const num = (v: number | string | undefined) =>
    v === undefined ? 0 : typeof v === 'number' ? v : rep.val(v);
  const known = (v: number | string | undefined) =>
    v === undefined || typeof v === 'number' || rep.known(v);
  const vecs = [...spec.vectors, ...(s.w ? [s.w] : [])].map((v) => ({
    name: v.name,
    p: [num(v.x), num(v.y), num(v.z)] as V3,
    known: known(v.x) && known(v.y) && known(v.z),
  }));
  const [u, v, w] = vecs;
  const both = !!(u && v && u.known && v.known);
  const colors = [c.chartHighlight, c.hopBack, c.lineUpright];
  const cross = u && v && s.cross ? cross3(u.p, v.p) : undefined;
  const crossName = s.cross?.name ?? `${u?.name} × ${v?.name}`;
  const points = !!s.points;

  // Every point the drawing holds: the window fits them at any turn, so it never jumps.
  const pts: V3[] = [[0, 0, 0], ...vecs.map((x) => x.p)];
  if (u && v && !points && (s.area || s.triangle || s.cross || w)) pts.push(add3(u.p, v.p));
  if (cross) pts.push(cross);
  if (u && v && w) pts.push(add3(u.p, w.p), add3(v.p, w.p), add3(add3(u.p, v.p), w.p));
  const reach = Math.max(1, ...pts.flatMap((p) => p.map(Math.abs)));
  const step = niceStep(reach / 5);
  // Each axis just past the points on its positive side (two ticks at least).
  const Ls = [0, 1, 2].map((i) =>
    Math.max(2 * step, Math.ceil((Math.max(0, ...pts.map((p) => p[i]!)) * 1.12) / step) * step),
  );
  const L = Math.max(...Ls);
  const axisEnds: V3[] = [
    [Ls[0]!, 0, 0],
    [0, Ls[1]!, 0],
    [0, 0, Ls[2]!],
  ];
  const lows = [0, 1, 2].map((i) => Math.min(0, ...pts.map((p) => p[i]!)));
  const floorLo = lows.map((x) => Math.floor(x / step) * step);
  const all = [...pts, ...axisEnds, [floorLo[0], floorLo[1], floorLo[2]] as V3];

  // Caption.
  const lines: string[] = [];
  if (points && u && v) {
    if (!both) lines.push(`${u.name}${point3(u.p)} and ${v.name}${point3(v.p)}: ?`);
    else {
      const d = sub3(v.p, u.p);
      const m = scale3(add3(u.p, v.p), 0.5);
      lines.push(
        `Going from ${u.name}${point3(u.p)} to ${v.name}${point3(v.p)}, the legs are Δx = ${short(d[0])}, Δy = ${short(d[1])} and Δz = ${short(d[2])}.`,
        `${u.name}${v.name} = √(${par(d[0])}² + ${par(d[1])}² + ${par(d[2])}²) = ${short(len3(d))}.`,
        `The midpoint M${point3(m)} averages each coordinate.`,
      );
    }
  } else {
    for (const x of vecs)
      lines.push(
        x.known
          ? `${x.name} = ${bracket3(x.p)}, with length |${x.name}| = ${short(len3(x.p))}.`
          : `${x.name} = ?`,
      );
    if (both && u && v && (s.dot || s.angle)) {
      const d = dot3(u.p, v.p);
      const th = angle3(u.p, v.p);
      lines.push(
        `${u.name}·${v.name} = ${u.p.map((a, i) => `${short(a)} × ${par(v.p[i]!)}`).join(' + ')} = ${short(d)}.`,
      );
      if (th !== undefined)
        lines.push(
          `cos θ = ${short(d)} ÷ (${short(len3(u.p))} × ${short(len3(v.p))}), so θ = ${short(th)}°: ${Math.abs(d) < 1e-9 ? 'a right angle, the vectors are perpendicular' : d > 0 ? 'acute' : 'obtuse'}.`,
        );
    }
    if (both && u && v && cross) {
      lines.push(
        `${crossName} = ${bracket3(cross)}, square to both: (${crossName})·${u.name} = ${short(dot3(cross, u.p))} and (${crossName})·${v.name} = ${short(dot3(cross, v.p))}.`,
      );
    }
    if (both && u && v && (s.area || s.triangle)) {
      const A = len3(cross3(u.p, v.p));
      lines.push(
        `The parallelogram’s area is |${u.name} × ${v.name}| = ${short(A)}${s.triangle ? `; the triangle is half: ${short(A / 2)}` : ''}.`,
      );
    }
    if (both && u && v && w?.known) {
      const T = dot3(u.p, cross3(v.p, w.p));
      lines.push(
        `${u.name}·(${v.name} × ${w.name}) = ${short(T)}, so the box’s volume is |${short(T)}| = ${short(Math.abs(T))}${Math.abs(T) < 1e-9 ? ': the three vectors lie in one plane' : ''}.`,
      );
    }
  }

  return (
    <View>
      <Canvas aspect={0.9}>
        {({ w: W, h: H }) => {
          // Fitted to the points as seen now; held while the view is turned, so it never jumps.
          const fit = (t: number) => {
            const ps = all.map(viewOf(t, TILT));
            const [x0, x1] = [Math.min(...ps.map((p) => p.x)), Math.max(...ps.map((p) => p.x))];
            const [y0, y1] = [Math.min(...ps.map((p) => p.y)), Math.max(...ps.map((p) => p.y))];
            const margin = 26;
            const k = Math.min((W - 2 * margin) / (x1 - x0), (H - 2 * margin - 18) / (y1 - y0));
            return {
              k,
              ox: W / 2 - ((x0 + x1) / 2) * k,
              oy: margin + y1 * k + (H - 2 * margin - 18 - (y1 - y0) * k) / 2,
            };
          };
          const { k, ox, oy } = held ?? fit(turn);
          heldNext.current = { k, ox, oy };
          const view = viewOf(turn, TILT);
          const P = (p: V3) => {
            const q = view(p);
            return { x: ox + q.x * k, y: oy - q.y * k };
          };
          const seg = (a: V3, b: V3, color: string, width: number, dash?: string, key?: string) => {
            const [p, q] = [P(a), P(b)];
            return (
              <Line
                key={key}
                x1={p.x}
                y1={p.y}
                x2={q.x}
                y2={q.y}
                stroke={color}
                strokeWidth={width}
                strokeDasharray={dash}
              />
            );
          };
          const poly = (ps: V3[], fill: string, opacity: number, key?: string) => (
            <Path
              key={key}
              d={`${ps.map((p, i) => `${i ? 'L' : 'M'} ${P(p).x} ${P(p).y}`).join(' ')} Z`}
              fill={fill}
              fillOpacity={opacity}
              stroke="none"
            />
          );
          // Labels placed so far, kept apart; each tries a few spots round its anchor.
          const placed: ReturnType<typeof chipBox>[] = [];
          const label = (
            at: { x: number; y: number },
            out: { x: number; y: number },
            text: string,
            color: string,
            key: string,
          ) => {
            const len = Math.hypot(out.x, out.y) || 1;
            const [ux, uy] = [out.x / len, out.y / len];
            const tries = [0, 50, -50, 100, -100, 160].map((deg) => {
              const a = (deg * Math.PI) / 180;
              const dx = ux * Math.cos(a) - uy * Math.sin(a);
              const dy = ux * Math.sin(a) + uy * Math.cos(a);
              const anchor: 'start' | 'middle' | 'end' =
                dx > 0.35 ? 'start' : dx < -0.35 ? 'end' : 'middle';
              const x = at.x + dx * 12;
              const y = at.y + dy * 14 + 4;
              const box = chipBox(x, y, text, anchor);
              const clash = placed.reduce(
                (n, b) =>
                  n +
                  Math.max(0, Math.min(b.right, box.right) - Math.max(b.left, box.left)) *
                    Math.max(0, Math.min(b.bottom, box.bottom) - Math.max(b.top, box.top)),
                0,
              );
              const outside =
                Math.max(0, -box.left) +
                Math.max(0, box.right - W) +
                Math.max(0, -box.top) +
                Math.max(0, box.bottom - H);
              return { x, y, anchor, box, score: clash + outside * 40 + Math.abs(deg) * 0.5 };
            });
            const best = tries.reduce((a, b) => (b.score < a.score ? b : a));
            placed.push(best.box);
            return (
              <MathChip
                key={key}
                x={best.x}
                y={best.y}
                text={text}
                w={W}
                h={H}
                anchor={best.anchor}
                color={color}
              />
            );
          };
          const O = P([0, 0, 0]);
          const awayFromO = (p: V3) => ({ x: P(p).x - O.x, y: P(p).y - O.y });

          // The floor: a light grid on z = 0 from the lowest x and y to the axes' ends.
          const floor: ReactElement[] = [];
          const [Lx, Ly] = [Ls[0]! - step, Ls[1]! - step];
          for (let x = floorLo[0]!; x <= Lx + 1e-9; x += step)
            floor.push(seg([x, floorLo[1]!, 0], [x, Ly, 0], c.chartGrid, 1, undefined, `fx${x}`));
          for (let y = floorLo[1]!; y <= Ly + 1e-9; y += step)
            floor.push(seg([floorLo[0]!, y, 0], [Lx, y, 0], c.chartGrid, 1, undefined, `fy${y}`));

          const axes = (['x', 'y', 'z'] as const).map((name, i) => {
            const end = axisEnds[i]!;
            const back: V3 = [0, 0, 0];
            back[i] = floorLo[i]! < 0 ? floorLo[i]! : -step * 0.6;
            const [p, q] = [P(back), P(end)];
            const ticks: ReactElement[] = [];
            const end1 = Ls[i]!;
            for (let t = step; t < end1 - 1e-9; t += step) {
              const at: V3 = [0, 0, 0];
              at[i] = t;
              const m = P(at);
              ticks.push(<Circle key={`t${name}${t}`} cx={m.x} cy={m.y} r={2} fill={c.chartInk} />);
            }
            const tip = awayFromO(end);
            const last: V3 = [0, 0, 0];
            last[i] = end1 - step;
            return (
              <G key={name}>
                <Line
                  x1={p.x}
                  y1={p.y}
                  x2={O.x}
                  y2={O.y}
                  stroke={c.chartMuted}
                  strokeWidth={1}
                  strokeDasharray={chart.dashFine}
                />
                <Line
                  x1={O.x}
                  y1={O.y}
                  x2={q.x}
                  y2={q.y}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <Path d={arrowHead(q.x, q.y, q.x - O.x, q.y - O.y, 9)} fill={c.chartInk} />
                {ticks}
                {label(q, tip, name, c.chartInk, `n${name}`)}
                {end1 - step > 0
                  ? label(
                      P(last),
                      { x: tip.y, y: -tip.x },
                      short(end1 - step),
                      c.chartMuted,
                      `v${name}`,
                    )
                  : null}
              </G>
            );
          });

          const faded = (ok: boolean) => (ok ? 1 : 0.35);
          const shapes: ReactElement[] = [];
          if (u && v && !points && (s.area || s.triangle || s.cross || w)) {
            const uv = add3(u.p, v.p);
            shapes.push(
              <G key="para" opacity={faded(both)}>
                {poly([[0, 0, 0], u.p, uv, v.p], c.chartHighlight, s.triangle ? 0.08 : 0.16)}
                {s.triangle ? poly([[0, 0, 0], u.p, v.p], c.chartHighlight, 0.22) : null}
                {seg(u.p, uv, c.chartMuted, 1, chart.dash)}
                {seg(v.p, uv, c.chartMuted, 1, chart.dash)}
                {s.triangle ? seg(u.p, v.p, c.chartHighlight, chart.strokeLight) : null}
              </G>,
            );
          }
          if (u && v && w && !points) {
            const corners = {
              u: u.p,
              v: v.p,
              w: w.p,
              uv: add3(u.p, v.p),
              uw: add3(u.p, w.p),
              vw: add3(v.p, w.p),
              uvw: add3(add3(u.p, v.p), w.p),
            };
            const edges: [V3, V3][] = [
              [corners.u, corners.uv],
              [corners.v, corners.uv],
              [corners.u, corners.uw],
              [corners.w, corners.uw],
              [corners.v, corners.vw],
              [corners.w, corners.vw],
              [corners.uv, corners.uvw],
              [corners.uw, corners.uvw],
              [corners.vw, corners.uvw],
            ];
            shapes.push(
              <G key="box" opacity={faded(both && w.known)}>
                {poly([corners.w, corners.uw, corners.uvw, corners.vw], c.lineUpright, 0.1)}
                {poly([[0, 0, 0], corners.v, corners.vw, corners.w], c.lineUpright, 0.06)}
                {edges.map(([a, b], i) => seg(a, b, c.chartMuted, 1, chart.dash, `e${i}`))}
              </G>,
            );
          }

          // Each tip dropped to the floor, and its shadow from the origin (or the legs of PQ).
          const drops = vecs.map((x, i) =>
            Math.abs(x.p[2]) > 1e-9 ? (
              <G key={`d${i}`} opacity={faded(x.known)}>
                {seg(x.p, [x.p[0], x.p[1], 0], colors[i]!, 1, chart.dashFine)}
                {points ? null : seg([0, 0, 0], [x.p[0], x.p[1], 0], colors[i]!, 1, chart.dashFine)}
                <Circle
                  cx={P([x.p[0], x.p[1], 0]).x}
                  cy={P([x.p[0], x.p[1], 0]).y}
                  r={2.5}
                  fill={colors[i]}
                />
              </G>
            ) : null,
          );

          const arrows = points
            ? []
            : vecs.map((x, i) =>
                len3(x.p) > 1e-9 ? (
                  <G key={`a${i}`} opacity={faded(x.known)}>
                    <Arrow
                      x1={O.x}
                      y1={O.y}
                      x2={P(x.p).x}
                      y2={P(x.p).y}
                      color={colors[i]!}
                      width={chart.strokeHeavy}
                    />
                  </G>
                ) : null,
              );

          // The angle between u and v: an arc through the directions between them.
          let arc: ReactElement | null = null;
          if (u && v && both && !points && s.angle && len3(u.p) > 0 && len3(v.p) > 0) {
            const th = angle3(u.p, v.p)!;
            if (th > 2 && th < 178) {
              const [a, b] = [scale3(u.p, 1 / len3(u.p)), scale3(v.p, 1 / len3(v.p))];
              const r = 0.45 * Math.min(len3(u.p), len3(v.p));
              const T = (th * Math.PI) / 180;
              const along = (t: number) =>
                scale3(
                  add3(scale3(a, Math.sin((1 - t) * T)), scale3(b, Math.sin(t * T))),
                  r / Math.sin(T),
                );
              const d = Array.from({ length: 25 }, (_, i) => {
                const q = P(along(i / 24));
                return `${i ? 'L' : 'M'} ${q.x} ${q.y}`;
              }).join(' ');
              const mid = P(along(0.5));
              arc = (
                <G key="arc">
                  <Path d={d} stroke={c.chartInk} strokeWidth={chart.strokeLight} fill="none" />
                  {label(
                    mid,
                    { x: mid.x - O.x, y: mid.y - O.y },
                    `θ = ${short(th)}°`,
                    c.chartInk,
                    'th',
                  )}
                </G>
              );
            }
          }

          // u × v, with a right-angle mark against u.
          let crossArrow: ReactElement | null = null;
          if (u && v && cross && len3(cross) > 1e-9) {
            const n = scale3(cross, 1 / len3(cross));
            const uh = len3(u.p) > 0 ? scale3(u.p, 1 / len3(u.p)) : undefined;
            const sq = L * 0.08;
            crossArrow = (
              <G key="cross" opacity={faded(both)}>
                {uh
                  ? (() => {
                      const [p1, p2, p3] = [
                        P(scale3(uh, sq)),
                        P(add3(scale3(uh, sq), scale3(n, sq))),
                        P(scale3(n, sq)),
                      ];
                      return (
                        <Path
                          d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y}`}
                          stroke={c.chartInk}
                          strokeWidth={1}
                          fill="none"
                        />
                      );
                    })()
                  : null}
                <Arrow
                  x1={O.x}
                  y1={O.y}
                  x2={P(cross).x}
                  y2={P(cross).y}
                  color={c.vectorResultant}
                  width={chart.strokeHeavy}
                />
              </G>
            );
          }

          // Two points: the segment, its legs along x, then y, then z, and the midpoint.
          const placedLabels: ReactElement[] = [];
          let segment: ReactElement | null = null;
          if (points && u && v) {
            const [a, b] = [u.p, v.p];
            const k1: V3 = [b[0], a[1], a[2]];
            const k2: V3 = [b[0], b[1], a[2]];
            const m = scale3(add3(a, b), 0.5);
            const d = sub3(b, a);
            const legs: [V3, V3, string, string][] = [
              [a, k1, `Δx = ${short(d[0])}`, c.chartHighlight],
              [k1, k2, `Δy = ${short(d[1])}`, c.hopBack],
              [k2, b, `Δz = ${short(d[2])}`, c.lineUpright],
            ];
            const PM = P(m);
            segment = (
              <G key="pq" opacity={faded(both)}>
                {legs.map(([p, q, , col], i) =>
                  len3(sub3(q, p)) > 1e-9
                    ? seg(p, q, col, chart.stroke, chart.dash, `l${i}`)
                    : null,
                )}
                {seg(a, b, c.vectorResultant, chart.strokeHeavy)}
                {[a, b].map((p, i) => (
                  <Circle
                    key={`p${i}`}
                    cx={P(p).x}
                    cy={P(p).y}
                    r={5.5}
                    fill={colors[i]}
                    stroke={c.card}
                    strokeWidth={1.5}
                  />
                ))}
                <Circle
                  cx={PM.x}
                  cy={PM.y}
                  r={4.5}
                  fill={c.card}
                  stroke={c.vectorResultant}
                  strokeWidth={2}
                />
              </G>
            );
            // Labels after the shapes, so they sit on top.
            legs.forEach(([p, q, text, col], i) => {
              if (len3(sub3(q, p)) < 1e-9) return;
              const mid = P(scale3(add3(p, q), 0.5));
              const dir = { x: P(q).x - P(p).x, y: P(q).y - P(p).y };
              placedLabels.push(label(mid, { x: dir.y, y: -dir.x }, text, col, `lg${i}`));
            });
            placedLabels.push(
              label(
                P(a),
                { x: P(a).x - PM.x, y: P(a).y - PM.y },
                `${u.name}${point3(a)}`,
                colors[0]!,
                'P',
              ),
              label(
                P(b),
                { x: P(b).x - PM.x, y: P(b).y - PM.y },
                `${v.name}${point3(b)}`,
                colors[1]!,
                'Q',
              ),
              label(
                PM,
                { x: P(b).y - P(a).y, y: P(a).x - P(b).x },
                `M${point3(m)}`,
                c.vectorResultant,
                'M',
              ),
            );
          }

          const names = points
            ? []
            : vecs.map((x, i) =>
                len3(x.p) > 1e-9
                  ? label(P(x.p), awayFromO(x.p), x.name, colors[i]!, `nm${i}`)
                  : null,
              );
          const crossLabel =
            cross && len3(cross) > 1e-9
              ? label(P(cross), awayFromO(cross), crossName, c.vectorResultant, 'cx')
              : null;

          return (
            <>
              <Svg width={W} height={H}>
                {floor}
                {shapes}
                {axes}
                {drops}
                {arrows}
                {crossArrow}
                {segment}
                {arc}
                {names}
                {crossLabel}
                {placedLabels}
                {/* The turn handle's track: an arc with arrows both ways round it. */}
                <Path
                  d={`M ${W - 52} ${H - 14} A 28 10 0 0 0 ${W - 8} ${H - 14}`}
                  stroke={c.chartMuted}
                  strokeWidth={1.5}
                  fill="none"
                />
                <Path d={arrowHead(W - 52, H - 14, -1, 1.2, 7)} fill={c.chartMuted} />
                <Path d={arrowHead(W - 8, H - 14, 1, 1.2, 7)} fill={c.chartMuted} />
              </Svg>
              <DragHandle
                testID="drag-turn"
                x={W - 30}
                y={H - 22}
                label="the view (turn it about z)"
                onStart={() => {
                  start.current = turn;
                  setHeld(heldNext.current);
                }}
                onMove={(dx) => setTurn(start.current - dx * 0.6)}
                onEnd={() => setHeld(null)}
              />
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
