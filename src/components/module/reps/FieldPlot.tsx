/**
 * HC21 `fieldPlot` (college round 2, group G): a plane field drawn from the values. Slope fields
 * with the solution through (x₀, y₀) and Euler's polyline; vector fields with a path and the
 * work along each side; phase portraits of x′ = Ax (eigenvector lines dashed, six trajectories,
 * the type named) and Lotka–Volterra orbits round their equilibrium; two species' isoclines with
 * the crossing ringed only when both live. Flat: a chart, every number from the page. The start
 * point drags when its values are typed. (FieldPlotSpec in typesHe2g.ts; numbers in
 * fieldPlotMath.ts, shared with the harness.)
 */
import { useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';

import { fieldPlotInputs, type FieldPlotSpec } from '@/data/modules/typesHe2g';
import type { NumOrVar } from '@/data/modules/typesGraphs';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import {
  competitionNumbers,
  eigen2,
  eulerOf,
  fieldFn,
  fieldWindow,
  flowOf,
  lotkaNumbers,
  pathPieces,
  phasePoint,
  pieceWork,
  slopeCurve,
  slopeSolution,
  trajectory,
  type Vec,
} from './fieldPlotMath';
import { parseExpr, writeExpr, type ExprNode } from './exprHe1e';
import { niceStep, tickText, ticks } from './functionGraphMath';
import { usePaintIds, url } from './paint';

const MINUS = '−';
const SUB = '₀₁₂₃₄₅₆₇₈₉';
/** A whole number as subscript digits (y₁₂). */
const sub = (n: number) => [...String(n)].map((d) => SUB[Number(d)] ?? d).join('');
/** A measured number: 4 significant figures, the minus sign. */
const num = (x: number) => formatNumber(Number(x.toPrecision(4)));
/** The type as a heading: "saddle", "stable spiral". */
const typeName = (t: string) => t.replace(/^an? /, '').replace(/ \(.*\)$/, '');
const textW = (s: string, size = chart.label) => [...s].length * size * 0.56;

interface Box {
  l: number;
  t: number;
  r: number;
  b: number;
}
const hit = (a: Box, b: Box) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;

export function FieldPlot({ spec, calc }: { spec: FieldPlotSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('clip');
  const known = (v: NumOrVar | undefined) =>
    v === undefined || typeof v === 'number' || rep.known(v);
  const get = (v: NumOrVar | undefined, d: number) =>
    v === undefined ? d : typeof v === 'number' ? v : rep.known(v) ? rep.val(v) : d;
  /** A worked-out value as a label shows it: 4 figures (the boxes keep more). */
  const say = (_id: string | undefined, x: number) => num(x);
  const allKnown = fieldPlotInputs(spec).every((id) => rep.known(id));
  const startKnown = !!spec.start && known(spec.start.x) && known(spec.start.y);
  const eulerKnown = !!spec.euler && known(spec.euler.h) && known(spec.euler.n);
  const frozen = useFrozen<{ x: [number, number]; y: [number, number] } | undefined>(undefined);
  const live = fieldWindow(spec, get);
  const box = frozen.value ?? live;
  const drag = useRef({ x: 0, y: 0, ux: 1, uy: 1 });
  const [xName, yName] = [
    spec.axes?.x ?? (spec.mode === 'isoclines' ? 'N₁' : 'x'),
    spec.axes?.y ?? (spec.mode === 'isoclines' ? 'N₂' : 'y'),
  ];

  // The numbers each mode shows.
  const g = fieldFn(spec.dy, get);
  const flow = flowOf(spec, get);
  const euler = allKnown && startKnown && eulerKnown ? eulerOf(spec, get) : undefined;
  const P = fieldFn(spec.P, get);
  const Q = fieldFn(spec.Q, get);
  const pieces = spec.mode === 'vector' && spec.path && allKnown ? pathPieces(spec.path, get) : [];
  const works = pieces.map((p) => pieceWork(P, Q, p));
  const eig =
    spec.mode === 'phase' && spec.matrix && allKnown
      ? eigen2(...(spec.matrix.map((m) => get(m, 0)) as [number, number, number, number]))
      : undefined;
  const lv =
    spec.mode === 'phase' && spec.lotka && allKnown
      ? lotkaNumbers(
          get(spec.lotka.alpha, 1),
          get(spec.lotka.beta, 1),
          get(spec.lotka.gamma, 1),
          get(spec.lotka.delta, 1),
        )
      : undefined;
  const comp =
    spec.mode === 'isoclines' && spec.competition && allKnown
      ? (() => {
          const k = spec.competition;
          const [K1, K2, al, be] = [get(k.K1, 1), get(k.K2, 1), get(k.alpha, 1), get(k.beta, 1)];
          return { K1, K2, al, be, ...competitionNumbers(K1, K2, al, be) };
        })()
      : undefined;
  const tPoint =
    spec.mode === 'phase' && allKnown && startKnown && known(spec.time)
      ? phasePoint(spec, get)
      : undefined;
  const start: Vec | undefined =
    spec.start && startKnown ? [get(spec.start.x, 0), get(spec.start.y, 0)] : undefined;

  return (
    <View>
      <Canvas aspect={(w) => (30 + (w - 56) * 0.82 + 42) / w}>
        {({ w, h }) => {
          const [L, R, top] = [44, 12, 24];
          const pw = w - L - R;
          const ph = h - top - 42;
          const bottom = top + ph;
          const [x0, x1] = box.x;
          const [y0, y1] = box.y;
          const ux = pw / (x1 - x0);
          const uy = ph / (y1 - y0);
          drag.current.ux = ux;
          drag.current.uy = uy;
          const sx = (x: number) => L + (x - x0) * ux;
          const sy = (y: number) => top + (y1 - y) * uy;
          const inBox = (p: Vec) => p[0] >= x0 && p[0] <= x1 && p[1] >= y0 && p[1] <= y1;
          const xStep = niceStep(x1 - x0, Math.max(3, Math.floor(pw / 56)));
          const yStep = niceStep(y1 - y0, Math.max(3, Math.floor(ph / 34)));
          const xt = ticks(x0, x1, xStep);
          const yt = ticks(y0, y1, yStep);
          const opacity = allKnown ? 1 : 0.35;
          const line = (pts: Vec[]) =>
            pts
              .filter((p) => p.every(Number.isFinite))
              .map((p, i) => `${i ? 'L' : 'M'} ${sx(p[0]).toFixed(2)} ${sy(p[1]).toFixed(2)}`)
              .join(' ');
          /** An arrowhead at (px, py) pointing along (dx, dy) in pixels. */
          const head = (px: number, py: number, dx: number, dy: number, s = 6) => {
            const m = Math.hypot(dx, dy) || 1;
            const [ex, ey] = [dx / m, dy / m];
            return `M ${px} ${py} L ${px - ex * s - ey * s * 0.6} ${py - ey * s + ex * s * 0.6} L ${px - ex * s + ey * s * 0.6} ${py - ey * s - ex * s * 0.6} Z`;
          };

          // Labels: tried round their point, kept off each other, the dots and the frame's edge.
          const boxes: Box[] = [];
          const labels: { x: number; y: number; text: string; color: string }[] = [];
          const label = (px: number, py: number, text: string, color: string = c.chartInk) => {
            const tw = textW(text);
            const tries: [number, number][] = [
              [8, -8],
              [8, 16],
              [-8 - tw, -8],
              [-8 - tw, 16],
              [-tw / 2, -12],
              [-tw / 2, 22],
              [12, 4],
              [-12 - tw, 4],
              [8, -26],
              [-8 - tw, -26],
              [-tw / 2, -30],
              [-tw / 2, -46],
              [8, 32],
              [-8 - tw, 32],
              [8, -42],
              [-8 - tw, -42],
            ];
            for (const [dx, dy] of tries) {
              const b = { l: px + dx - 2, t: py + dy - 12, r: px + dx + tw + 2, b: py + dy + 3 };
              if (b.l < L + 1 || b.r > L + pw - 1 || b.t < top + 1 || b.b > bottom - 1) continue;
              if (boxes.some((o) => hit(o, b))) continue;
              boxes.push(b);
              labels.push({ x: px + dx, y: py + dy, text, color });
              return;
            }
          };
          if (eig) {
            const t = typeName(eig.type);
            boxes.push({ l: L + 2, t: top + 2, r: L + 10 + textW(t), b: top + 22 });
          }
          const dot = (p: Vec) =>
            boxes.push({ l: sx(p[0]) - 5, t: sy(p[1]) - 5, r: sx(p[0]) + 5, b: sy(p[1]) + 5 });

          // The field's glyphs on a grid: segments (slope), arrows by |F| (vector), directions.
          const cols = Math.max(9, Math.round(pw / 24));
          const rows = Math.max(7, Math.round(ph / 24));
          const sp = Math.min(pw / cols, ph / rows);
          const glyphs: string[] = [];
          const heads: string[] = [];
          if (allKnown) {
            const pts: Vec[] = [];
            for (let i = 0; i < cols; i++)
              for (let j = 0; j < rows; j++)
                pts.push([
                  x0 + ((i + 0.5) * (x1 - x0)) / cols,
                  y0 + ((j + 0.5) * (y1 - y0)) / rows,
                ]);
            const vecs = pts.map((p): Vec => {
              if (spec.mode === 'slope') return [1, g(p[0], p[1])];
              return flow ? flow(p) : [NaN, NaN];
            });
            const big = Math.max(
              1e-12,
              ...vecs.map(([a, b]) => Math.hypot(a * ux, b * uy)).filter(Number.isFinite),
            );
            pts.forEach((p, k) => {
              const [a, b] = vecs[k]!;
              const [dx, dy] = [a * ux, -b * uy];
              const m = Math.hypot(dx, dy);
              if (!(m > 0) || !Number.isFinite(m)) return;
              const len =
                spec.mode === 'vector' ? sp * (0.25 + 0.6 * Math.sqrt(m / big)) : sp * 0.62;
              const [ex, ey] = [(dx / m) * (len / 2), (dy / m) * (len / 2)];
              const [cx, cy] = [sx(p[0]), sy(p[1])];
              glyphs.push(`M ${cx - ex} ${cy - ey} L ${cx + ex} ${cy + ey}`);
              if (spec.mode !== 'slope') heads.push(head(cx + ex, cy + ey, ex, ey, 4));
            });
          }

          const layers: ReactNode[] = [];
          const over: ReactNode[] = [];

          // ── slope: the solution, Euler's polyline ──
          if (spec.mode === 'slope' && allKnown && start) {
            const curve = slopeCurve(g, start[0], start[1], x0, x1, y0 - (y1 - y0), y1 + (y1 - y0));
            layers.push(
              <Path
                key="sol"
                d={line(curve)}
                stroke={c.chartHighlight}
                strokeWidth={chart.strokeHeavy}
                fill="none"
              />,
            );
            if (euler) {
              layers.push(
                <Path
                  key="euler"
                  d={line(euler)}
                  stroke={c.fieldEuler}
                  strokeWidth={chart.stroke}
                  fill="none"
                />,
              );
              euler.forEach((p, i) => {
                if (!inBox(p)) return;
                dot(p);
                over.push(
                  <Circle
                    key={`e${i}`}
                    cx={sx(p[0])}
                    cy={sy(p[1])}
                    r={i === 0 ? 5 : 3.5}
                    fill={i === 0 ? c.chartHighlight : c.fieldEuler}
                  />,
                );
              });
              const n = euler.length - 1;
              const last = euler[n]!;
              const exact = slopeSolution(g, start[0], start[1], last[0]);
              if (n > 0 && inBox(last)) {
                label(
                  sx(last[0]),
                  sy(last[1]),
                  `y${sub(n)} = ${say(spec.euler?.last, last[1])}`,
                  c.fieldEuler,
                );
              }
              if (Number.isFinite(exact) && inBox([last[0], exact]) && n > 0) {
                const e: Vec = [last[0], exact];
                dot(e);
                over.push(
                  <Circle
                    key="exact"
                    cx={sx(e[0])}
                    cy={sy(e[1])}
                    r={4.5}
                    fill={c.card}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                  />,
                );
                label(
                  sx(e[0]),
                  sy(e[1]),
                  `exact ${say(spec.euler?.exact, exact)}`,
                  c.chartHighlight,
                );
              }
            }
            if (inBox(start)) {
              dot(start);
              label(sx(start[0]), sy(start[1]), `(${num(start[0])}, ${num(start[1])})`);
            }
          }

          // ── vector: the path, its direction and each side's work ──
          if (spec.mode === 'vector' && pieces.length) {
            pieces.forEach((p, i) => {
              const pts = Array.from({ length: 81 }, (_, k) => p.r(k / 80));
              layers.push(
                <Path
                  key={`path${i}`}
                  d={line(pts) + (p.circle ? ' Z' : '')}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.strokeHeavy}
                  fill="none"
                />,
              );
              const [mx, my] = p.r(p.circle ? 0.125 : 0.5);
              const [dx, dy] = p.dr(p.circle ? 0.125 : 0.5);
              const [px, py] = [sx(mx), sy(my)];
              const m = Math.hypot(dx * ux, dy * uy) || 1;
              const [ex, ey] = [(dx * ux) / m, (-dy * uy) / m];
              over.push(
                <Path
                  key={`dir${i}`}
                  d={head(px + ex * 7, py + ey * 7, ex, ey, 9)}
                  fill={c.chartHighlight}
                />,
              );
              boxes.push({ l: px - 9, t: py - 9, r: px + 9, b: py + 9 });
            });
            // Side labels outside the path: off each side's middle, away from the path's center.
            const all = pieces.flatMap((p) => [p.from, p.to]);
            const cen: Vec = [
              all.reduce((s, p) => s + p[0], 0) / all.length,
              all.reduce((s, p) => s + p[1], 0) / all.length,
            ];
            if (pieces.length === 1 && !pieces[0]!.circle) {
              const p = pieces[0]!;
              for (const [q, name] of [
                [p.from, 'A'],
                [p.to, 'B'],
              ] as const) {
                dot(q);
                over.push(
                  <Circle key={name} cx={sx(q[0])} cy={sy(q[1])} r={4.5} fill={c.chartInk} />,
                );
                label(sx(q[0]), sy(q[1]), `${name}(${num(q[0])}, ${num(q[1])})`);
              }
              const [mx, my] = p.r(0.5);
              label(sx(mx), sy(my), `W = ${say(spec.work, works[0]!)}`, c.chartHighlight);
            } else if (pieces.length > 1) {
              pieces.forEach((p, i) => {
                const [mx, my] = p.r(0.5);
                const [ox, oy] = [mx - cen[0], my - cen[1]];
                const m = Math.hypot(ox * ux, oy * uy) || 1;
                const text = `C${sub(i + 1)}: ${say(spec.sides?.[i], works[i]!)}`;
                const tw = textW(text);
                // Beside the side, outside the path.
                const px = sx(mx) + ((ox * ux) / m) * (tw / 2 + 10) - tw / 2;
                const py = sy(my) - ((oy * uy) / m) * 14 + 4;
                const b = { l: px - 2, t: py - 12, r: px + tw + 2, b: py + 3 };
                boxes.push(b);
                labels.push({ x: px, y: py, text, color: c.chartHighlight });
              });
            } else {
              const p = pieces[0]!;
              const [mx, my] = p.r(0.375);
              label(sx(mx), sy(my), `∮ = ${say(spec.work, works[0]!)}`, c.chartHighlight);
            }
          }

          // ── phase: eigenvector lines, trajectories, x(0) and x(t) ──
          if (spec.mode === 'phase' && flow && allKnown) {
            const r0 = Math.min(x1 - x0, y1 - y0);
            const starts: Vec[] = [];
            if (eig?.real) {
              const span = Math.hypot(x1 - x0, y1 - y0);
              const pairs = [
                [eig.real.v1, eig.real.l1, 1],
                [eig.real.v2, eig.real.l2, 2],
              ] as const;
              for (const [v, l, k] of pairs) {
                if (k === 2 && Math.abs(eig.real.l1 - eig.real.l2) < 1e-9) break;
                layers.push(
                  <Line
                    key={`ev${k}`}
                    x1={sx(-v[0] * span)}
                    y1={sy(-v[1] * span)}
                    x2={sx(v[0] * span)}
                    y2={sy(v[1] * span)}
                    stroke={c.chartMuted}
                    strokeWidth={chart.stroke}
                    strokeDasharray={chart.dash}
                  />,
                );
                // The label near the frame along the line: λ₁ on one side, λ₂ on the other.
                const d: Vec = k === 1 ? v : [-v[0], -v[1]];
                const reach = (di: number, lo: number, hi: number) =>
                  di > 1e-9 ? (hi * 0.8) / di : di < -1e-9 ? (lo * 0.8) / di : Infinity;
                const t = Math.min(reach(d[0], x0, x1), reach(d[1], y0, y1));
                const q: Vec = [d[0] * t, d[1] * t];
                if (Number.isFinite(t) && inBox(q))
                  label(
                    sx(q[0]),
                    sy(q[1]),
                    `λ${sub(k)} = ${say(k === 1 ? spec.eigen?.l1 : spec.eigen?.l2, l)}`,
                    c.chartMuted,
                  );
              }
            }
            if (eig)
              for (let k = 0; k < 6; k++) {
                const a = ((k * 60 + 15) * Math.PI) / 180;
                starts.push([Math.cos(a) * r0 * 0.38, Math.sin(a) * r0 * 0.38]);
              }
            else if (lv) for (const s of [0.35, 0.6, 0.82]) starts.push([lv.x * s, lv.y]);
            starts.forEach((s, i) => {
              const back = lv ? [] : trajectory(flow, s, -1, box).reverse();
              const fwd = trajectory(flow, s, 1, box, lv ? lv.period * 2.5 : 40);
              const pts = [...back, ...(back.length ? fwd.slice(1) : fwd)];
              layers.push(
                <Path
                  key={`tr${i}`}
                  d={line(pts)}
                  stroke={c.fieldEuler}
                  strokeWidth={chart.stroke}
                  fill="none"
                />,
              );
              // Direction: an arrowhead where the trajectory is well inside the window.
              const mid = fwd.find(
                (p, j) =>
                  j > 4 && inBox(p) && Math.hypot((p[0] - s[0]) * ux, (p[1] - s[1]) * uy) > 22,
              );
              if (mid) {
                const v = flow(mid);
                over.push(
                  <Path
                    key={`th${i}`}
                    d={head(sx(mid[0]), sy(mid[1]), v[0] * ux, -v[1] * uy, 8)}
                    fill={c.fieldEuler}
                  />,
                );
              }
            });
            // The equilibrium.
            const eq: Vec = lv ? [lv.x, lv.y] : [0, 0];
            dot(eq);
            over.push(
              <Circle
                key="eq"
                cx={sx(eq[0])}
                cy={sy(eq[1])}
                r={6}
                fill={c.card}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />,
            );
            if (lv)
              label(
                sx(eq[0]),
                sy(eq[1]),
                `(${say(spec.equilibrium?.x, eq[0])}, ${say(spec.equilibrium?.y, eq[1])})`,
              );
            // x(0) and the trajectory from it to x(t).
            if (start && tPoint && tPoint.every(Number.isFinite)) {
              const tt = get(spec.time, 0);
              const path = Array.from({ length: 61 }, (_, k) =>
                k === 0 ? start : phasePoint({ ...spec, time: (tt * k) / 60 }, get)!,
              );
              layers.push(
                <Path
                  key="xt"
                  d={line(path)}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.strokeHeavy}
                  fill="none"
                />,
              );
              if (inBox(tPoint)) {
                dot(tPoint);
                over.push(
                  <Circle
                    key="pt"
                    cx={sx(tPoint[0])}
                    cy={sy(tPoint[1])}
                    r={5}
                    fill={c.chartHighlight}
                  />,
                );
                label(
                  sx(tPoint[0]),
                  sy(tPoint[1]),
                  `x(${num(tt)}) = (${say(spec.point?.x, tPoint[0])}, ${say(spec.point?.y, tPoint[1])})`,
                  c.chartHighlight,
                );
              }
            }
            if (start && inBox(start)) {
              dot(start);
              label(sx(start[0]), sy(start[1]), `x(0) = (${num(start[0])}, ${num(start[1])})`);
            }
          }

          // ── isoclines ──
          if (comp) {
            const iso = [
              {
                a: [comp.K1, 0] as Vec,
                b: [0, comp.K1 / comp.al] as Vec,
                color: c.chartHighlight,
                dash: undefined,
              },
              {
                a: [comp.K2 / comp.be, 0] as Vec,
                b: [0, comp.K2] as Vec,
                color: c.fnSecond,
                dash: chart.dash,
              },
            ];
            iso.forEach((s, i) => {
              layers.push(
                <Line
                  key={`iso${i}`}
                  x1={sx(s.a[0])}
                  y1={sy(s.a[1])}
                  x2={sx(s.b[0])}
                  y2={sy(s.b[1])}
                  stroke={s.color}
                  strokeWidth={chart.strokeHeavy}
                  strokeDasharray={s.dash}
                />,
              );
            });
            const ends: [Vec, string, string][] = [
              [[comp.K1, 0], `K₁ = ${num(comp.K1)}`, c.chartHighlight],
              [[0, comp.K1 / comp.al], `K₁ ÷ α = ${num(comp.K1 / comp.al)}`, c.chartHighlight],
              [[comp.K2 / comp.be, 0], `K₂ ÷ β = ${num(comp.K2 / comp.be)}`, c.fnSecond],
              [[0, comp.K2], `K₂ = ${num(comp.K2)}`, c.fnSecond],
            ];
            for (const [p, , color] of ends) {
              dot(p);
              over.push(
                <Circle key={`k${p[0]}-${p[1]}`} cx={sx(p[0])} cy={sy(p[1])} r={4} fill={color} />,
              );
            }
            if (comp.coexist) dot([comp.n1, comp.n2]);
            for (const [p, text, color] of ends) label(sx(p[0]), sy(p[1]), text, color);
            if (comp.coexist) {
              const q: Vec = [comp.n1, comp.n2];
              dot(q);
              over.push(
                <Circle
                  key="ring"
                  cx={sx(q[0])}
                  cy={sy(q[1])}
                  r={7}
                  fill={c.card}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />,
              );
              label(
                sx(q[0]),
                sy(q[1]),
                `(${say(spec.equilibrium?.x, q[0])}, ${say(spec.equilibrium?.y, q[1])})`,
              );
            }
          }

          const dragOk =
            !spec.fixed &&
            allKnown &&
            !!start &&
            (spec.mode === 'slope' || (spec.mode === 'phase' && !!spec.matrix)) &&
            typeof spec.start!.x === 'string' &&
            typeof spec.start!.y === 'string' &&
            !rep.variable(spec.start!.x).derived &&
            !rep.variable(spec.start!.y).derived &&
            inBox(start);

          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <ClipPath id={ids.clip}>
                    <Rect x={L} y={top} width={pw} height={ph} />
                  </ClipPath>
                </Defs>
                {xt.map((v) => (
                  <Line
                    key={`gx${v}`}
                    x1={sx(v)}
                    x2={sx(v)}
                    y1={top}
                    y2={bottom}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                  />
                ))}
                {yt.map((v) => (
                  <Line
                    key={`gy${v}`}
                    x1={L}
                    x2={L + pw}
                    y1={sy(v)}
                    y2={sy(v)}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                  />
                ))}
                <Rect
                  x={L}
                  y={top}
                  width={pw}
                  height={ph}
                  fill="none"
                  stroke={c.chartGrid}
                  strokeWidth={1}
                />
                {y0 <= 0 && y1 >= 0 ? (
                  <Line
                    x1={L}
                    x2={L + pw}
                    y1={sy(0)}
                    y2={sy(0)}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                ) : null}
                {x0 <= 0 && x1 >= 0 ? (
                  <Line
                    x1={sx(0)}
                    x2={sx(0)}
                    y1={top}
                    y2={bottom}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                ) : null}
                {xt.map((v, i) =>
                  // Every other number when they would crowd.
                  xt.length * textW(tickText(v, false)) > pw * 0.8 && i % 2 ? null : (
                    <ChartText
                      key={`nx${v}`}
                      x={sx(v)}
                      y={bottom + 15}
                      fill={c.chartMuted}
                      textAnchor="middle"
                    >
                      {tickText(v, false).replace('-', MINUS)}
                    </ChartText>
                  ),
                )}
                {yt.map((v) => (
                  <ChartText
                    key={`ny${v}`}
                    x={L - 5}
                    y={sy(v) + 4}
                    fill={c.chartMuted}
                    textAnchor="end"
                  >
                    {tickText(v, false).replace('-', MINUS)}
                  </ChartText>
                ))}
                <ChartText
                  x={L + pw}
                  y={bottom + 33}
                  fontStyle="italic"
                  fontWeight="700"
                  textAnchor="end"
                >
                  {xName}
                </ChartText>
                <ChartText x={L - 30} y={top - 9} fontStyle="italic" fontWeight="700">
                  {yName}
                </ChartText>
                <G clipPath={url(ids.clip)} opacity={opacity}>
                  <Path
                    d={glyphs.join(' ')}
                    stroke={c.fieldArrow}
                    strokeWidth={1.4}
                    strokeLinecap="round"
                    fill="none"
                  />
                  <Path d={heads.join(' ')} fill={c.fieldArrow} />
                  {layers}
                  {over}
                </G>
                {labels.map((l, i) => (
                  <ChartText key={`lab${i}`} x={l.x} y={l.y} fill={l.color} fontWeight="700" halo>
                    {l.text}
                  </ChartText>
                ))}
                {eig ? (
                  <ChartText x={L + 6} y={top + 16} fontWeight="700" halo>
                    {typeName(eig.type)}
                  </ChartText>
                ) : null}
              </Svg>
              {dragOk ? (
                <DragHandle
                  testID="drag-start"
                  x={sx(start[0])}
                  y={sy(start[1])}
                  label={spec.mode === 'slope' ? 'the starting point' : 'x(0)'}
                  onStart={() => {
                    drag.current.x = start[0];
                    drag.current.y = start[1];
                    frozen.freezeAt(box);
                  }}
                  onMove={(dx, dy) => {
                    const [xi, yi] = [spec.start!.x as string, spec.start!.y as string];
                    const X = drag.current.x + dx / drag.current.ux;
                    const Y = drag.current.y - dy / drag.current.uy;
                    if (!(X >= x0 && X <= x1 && Y >= y0 && Y <= y1)) return;
                    const keep = [
                      ...fieldPlotInputs(spec),
                      ...[spec.euler?.h, spec.euler?.n, spec.time].filter(
                        (v): v is string => typeof v === 'string',
                      ),
                    ];
                    calc.set(
                      { ...rep.pinTyped(keep), [xi]: rep.snapTo(xi, X), [yi]: rep.snapTo(yi, Y) },
                      rep.slide(xi),
                    );
                  }}
                  onEnd={frozen.release}
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
    const lines: string[] = [];
    const w = (src?: string) =>
      src
        ? writeField(src, (id) => (rep.known(id) ? Number(rep.val(id).toPrecision(6)) : undefined))
        : '?';
    if (spec.mode === 'slope') lines.push(`Slope field of y′ = ${w(spec.dy)}`);
    if (spec.mode === 'vector') lines.push(`F = ⟨${w(spec.P)}, ${w(spec.Q)}⟩`);
    if (!allKnown) return [...lines, 'Type every value to draw the field.'].join(' · ');
    if (spec.mode === 'slope' && start) {
      lines.push(`The solid curve is the solution through (${num(start[0])}, ${num(start[1])})`);
      if (euler && euler.length > 1) {
        const n = euler.length - 1;
        lines.push(
          `Euler, h = ${num(get(spec.euler!.h, 0.1))}: ${euler
            .slice(1)
            .map(([x, y], i) => `y${sub(i + 1)} = ${num(y)} at x = ${num(x)}`)
            .join(', ')}`,
        );
        const last = euler[n]!;
        const exact = slopeSolution(g, start[0], start[1], last[0]);
        if (Number.isFinite(exact))
          lines.push(
            `Exact y(${num(last[0])}) = ${num(exact)}: Euler is off by ${num(Math.abs(exact - last[1]))}`,
          );
      }
    }
    if (spec.mode === 'vector' && pieces.length) {
      if (pieces.length > 1)
        lines.push(
          `Counterclockwise, side by side: ${works.map((x, i) => `C${sub(i + 1)} ${num(x)}`).join(', ')}; the total is ${num(works.reduce((s, x) => s + x, 0))}`,
        );
      else lines.push(`Work along the path W = ∫F·dr = ${num(works[0]!)}`);
    }
    if (eig) {
      lines.push(
        `Trace T = ${num(eig.T)}, determinant D = ${num(eig.D)}, T² − 4D = ${num(eig.disc)}`,
      );
      lines.push(
        eig.real
          ? `λ = ${num(eig.real.l1)} along ⟨${num(eig.real.v1[0])}, ${num(eig.real.v1[1])}⟩ and λ = ${num(eig.real.l2)} along ⟨${num(eig.real.v2[0])}, ${num(eig.real.v2[1])}⟩ (dashed)`
          : `λ = ${num(eig.complex!.re)} ± ${num(eig.complex!.im)}i`,
      );
      lines.push(`The origin is ${eig.type}`);
      if (start && tPoint)
        lines.push(
          `From x(0) = (${num(start[0])}, ${num(start[1])}), x(${num(get(spec.time, 0))}) = (${num(tPoint[0])}, ${num(tPoint[1])})`,
        );
    }
    if (lv)
      lines.push(
        `Equilibrium (γ ÷ δ, α ÷ β) = (${num(lv.x)}, ${num(lv.y)}); small cycles round it take 2π ÷ √(αγ) = ${num(lv.period)}`,
      );
    if (comp) {
      lines.push(`Solid: N₁ stops growing on N₁ + αN₂ = K₁; dashed: N₂ stops on N₂ + βN₁ = K₂`);
      lines.push(
        comp.coexist
          ? `They cross at N₁* = ${num(comp.n1)}, N₂* = ${num(comp.n2)}: both species coexist`
          : `No crossing with both N* positive (N₁* = ${num(comp.n1)}, N₂* = ${num(comp.n2)})${comp.winner ? `: species ${comp.winner} wins` : ''}`,
      );
    }
    return lines.join(' · ');
  }
}

const SUPS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '−': '⁻',
  x: 'ˣ',
  y: 'ʸ',
};

/**
 * The tree with the page's values put in and folded: products of numbers multiplied, terms of 0
 * and factors of 1 dropped ("0·x − 1·y" is "−y"). A value not typed stays a name ("?").
 */
function fold(n: ExprNode, value: (name: string) => number | undefined): ExprNode {
  const num = (v: number): ExprNode => ({ t: 'num', v });
  const nv = (m: ExprNode) => (m.t === 'num' ? m.v : undefined);
  const isNum = (m: ExprNode, v?: number) =>
    nv(m) !== undefined && (v === undefined || nv(m) === v);
  switch (n.t) {
    case 'num':
      return n;
    case 'name': {
      const v = n.name === 'x' || n.name === 'y' ? undefined : value(n.name);
      return v === undefined ? n : num(v);
    }
    case 'neg': {
      const a = fold(n.a, value);
      if (nv(a) !== undefined) return num(-nv(a)!);
      if (a.t === 'neg') return a.a;
      return { t: 'neg', a };
    }
    case 'call':
      return { ...n, a: fold(n.a, value) };
    case 'bin': {
      const a = fold(n.a, value);
      const b = fold(n.b, value);
      const [av, bv] = [nv(a), nv(b)];
      if (av !== undefined && bv !== undefined && n.op !== '^' && !(n.op === '/' && bv === 0)) {
        const v =
          n.op === '+' ? av + bv : n.op === '-' ? av - bv : n.op === '*' ? av * bv : av / bv;
        return num(v);
      }
      if (n.op === '*') {
        if (isNum(a, 0) || isNum(b, 0)) return num(0);
        if (isNum(a, 1)) return b;
        if (isNum(b, 1)) return a;
        if (isNum(a, -1)) return fold({ t: 'neg', a: b }, value);
        if (av !== undefined && av < 0)
          return { t: 'neg', a: { t: 'bin', op: '*', a: num(-av), b } };
      }
      if (n.op === '+') {
        if (isNum(a, 0)) return b;
        if (isNum(b, 0)) return a;
        if (b.t === 'neg') return { t: 'bin', op: '-', a, b: b.a };
      }
      if (n.op === '-') {
        if (isNum(b, 0)) return a;
        if (isNum(a, 0)) return fold({ t: 'neg', a: b }, value);
      }
      if (n.op === '/' && isNum(b, 1)) return a;
      return { ...n, a, b };
    }
  }
}

/**
 * An expression in x and y written with the page's values (a "?" for one not typed), the way
 * the page writes it: "x + y", "0.5y(1 − y/10)", "2x + 3y".
 */
export function writeField(src: string, value: (name: string) => number | undefined): string {
  let tree: ExprNode;
  try {
    tree = fold(parseExpr(src), value);
  } catch {
    return '?';
  }
  return writeExpr(tree, 'x', 'x', (n) => (n === 'y' ? 'y' : '?'))
    .map((p) =>
      p.sup
        ? [...p.t].every((ch) => ch in SUPS)
          ? [...p.t].map((ch) => SUPS[ch]).join('')
          : `^(${p.t})`
        : p.t,
    )
    .join('')
    .replace(/·(?=[xy(])/g, '');
}
