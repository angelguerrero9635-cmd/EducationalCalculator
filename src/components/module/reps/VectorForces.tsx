import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { VectorDiagramSpec } from '@/data/modules/typesHsd';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption } from './common';
import { forceDirection, fromLevel, headingOf, partsOf } from './he4bMath';
import { along, around, labelPlacer, useValues } from './he4bKit';
import { short } from './hsdKit';
import { MathChip } from './hsdText';
import { Vec } from './hskKit';

const RAD = Math.PI / 180;
const BOTTOM = 206;

/**
 * HC171: two to four forces from one point, each with its angle from the horizontal marked,
 * and under them the same forces tip to tail: the polygon closes when they balance, else the
 * resultant R runs from the first tail to the last tip.
 */
export function VectorForces({ spec, calc }: { spec: VectorDiagramSpec; calc: Calculator }) {
  const c = usePalette();
  const { v, known, text } = useValues(calc);
  const fs = spec.forces!;
  const unit = spec.unit ?? 'N';
  const colors = [c.chartHighlight, c.hopBack, c.lineUpright, c.fnSecond];
  const list = fs.list.slice(0, 4).map((f, i) => {
    const size = v(f.magnitude);
    const dir = forceDirection(
      f,
      f.direction === undefined ? undefined : v(f.direction),
      v(f.level),
    );
    return {
      f,
      size,
      dir,
      ...partsOf(size, dir),
      known: known(f.magnitude) && known(f.direction) && known(f.level),
      color: colors[i]!,
    };
  });
  const shown = list.filter((q) => q.known);
  const all = shown.length === list.length;
  const sx = shown.reduce((s, q) => s + q.x, 0);
  const sy = shown.reduce((s, q) => s + q.y, 0);
  const big = Math.max(1e-9, ...shown.map((q) => q.size));
  const closes = all && Math.hypot(sx, sy) <= 1e-3 * big;
  const r = spec.vectors[0];
  const rName = r?.name || 'R';

  /** The top view's scale and height: as tall as the forces reach up and down, no more. */
  const top = (w: number) => {
    const up = Math.max(0, ...shown.map((q) => q.y));
    const down = Math.max(0, ...shown.map((q) => -q.y));
    const wide = Math.max(1e-9, ...shown.map((q) => Math.abs(q.x)));
    const k = Math.min((w / 2 - 70) / wide, 100 / Math.max(1e-9, up, down), (w / 2 - 70) / big);
    return { k, up, height: Math.max(130, (up + down) * k + 70) };
  };

  const lines: string[] = [];
  for (const q of list)
    lines.push(
      q.known
        ? `${q.f.name} = ${text(q.f.magnitude, q.size, unit)} at ${short(fromLevel(q.dir))}° from the horizontal: (${short(q.x)}, ${short(q.y)}) ${unit}.`
        : `${q.f.name} = ?`,
    );
  if (all) {
    lines.push(`ΣFₓ = ${short(sx)} ${unit} and ΣF_y = ${short(sy)} ${unit}.`);
    if (fs.equilibrium)
      lines.push(
        closes
          ? 'The forces balance: tip to tail, the polygon closes.'
          : 'These forces do not balance: the polygon leaves a gap.',
      );
    else if (Math.hypot(sx, sy) > 1e-9)
      lines.push(
        `${rName} = √(${short(sx)}² + ${short(sy)}²) = ${short(Math.hypot(sx, sy))} ${unit} at ${short(headingOf(sx, sy))}° from +x.`,
      );
  }

  return (
    <View>
      <Canvas aspect={(w) => (top(w).height + BOTTOM) / w}>
        {({ w, h }) => {
          // The forces from the point.
          const { k, up, height: TOP } = top(w);
          const o = { x: w / 2, y: 34 + up * k };
          const tip = (q: (typeof list)[number]) => ({ x: o.x + q.x * k, y: o.y - q.y * k });
          // Tip to tail, fitted under them.
          const pts = [{ x: 0, y: 0 }];
          for (const q of shown) pts.push({ x: pts.at(-1)!.x + q.x, y: pts.at(-1)!.y + q.y });
          const [x0, x1] = [Math.min(...pts.map((p) => p.x)), Math.max(...pts.map((p) => p.x))];
          const [y0, y1] = [Math.min(...pts.map((p) => p.y)), Math.max(...pts.map((p) => p.y))];
          const kp = Math.min(
            (w - 110) / Math.max(1e-9, x1 - x0),
            (BOTTOM - 56) / Math.max(1e-9, y1 - y0),
            k * 1.2,
          );
          const px = (x: number) => w / 2 + (x - (x0 + x1) / 2) * kp;
          const py = (y: number) => TOP + 18 + (BOTTOM - 36) / 2 - (y - (y0 + y1) / 2) * kp;
          const P = pts.map((p) => ({ x: px(p.x), y: py(p.y) }));
          const L = labelPlacer(w, h, [
            ...shown.flatMap((q) => along(o, tip(q))),
            ...shown.flatMap((_, i) => along(P[i]!, P[i + 1]!)),
            ...(all ? along(P[0]!, P.at(-1)!) : []),
            { x: o.x, y: o.y },
          ]);
          const labels = shown.map((q) => {
            const t = `${q.f.name} = ${text(q.f.magnitude, q.size, unit)}`;
            const e = tip(q);
            const s = L.put(t, around(e.x, e.y, 8));
            return (
              <MathChip
                key={q.f.name}
                x={s.x}
                y={s.y}
                text={t}
                w={w}
                h={h}
                color={q.color}
                anchor={s.anchor}
              />
            );
          });
          // Each angle from the nearer side of the horizontal.
          const arcs = shown.map((q, i) => {
            const a = fromLevel(q.dir);
            if (a < 0.5 || a > 89.5) return null;
            const left = Math.cos(q.dir * RAD) < 0;
            const from = left ? 180 : 0;
            const to = q.dir;
            const d = ((((to - from + 540) % 360) + 360) % 360) - 180;
            const rr = 30 + 10 * i;
            const p0 = { x: o.x + rr * Math.cos(from * RAD), y: o.y - rr * Math.sin(from * RAD) };
            const p1 = { x: o.x + rr * Math.cos(to * RAD), y: o.y - rr * Math.sin(to * RAD) };
            const ccw = d > 0;
            const mid = (from + d / 2) * RAD;
            const t = `${short(a)}°`;
            const s = L.put(
              t,
              around(o.x + (rr + 14) * Math.cos(mid), o.y - (rr + 14) * Math.sin(mid), 5),
            );
            return (
              <G key={`a${i}`}>
                <Path
                  d={`M ${p0.x} ${p0.y} A ${rr} ${rr} 0 0 ${ccw ? 0 : 1} ${p1.x} ${p1.y}`}
                  stroke={q.color}
                  strokeWidth={1.5}
                  fill="none"
                />
                <MathChip
                  x={s.x}
                  y={s.y}
                  text={t}
                  w={w}
                  h={h}
                  color={q.color}
                  anchor={s.anchor}
                  bold={false}
                />
              </G>
            );
          });
          const end = P.at(-1)!;
          const start = P[0]!;
          const resultant = all && !fs.equilibrium && Math.hypot(sx, sy) * kp > 6;
          const rLabel = resultant
            ? (() => {
                const t = `${rName} = ${short(Math.hypot(sx, sy))} ${unit}`;
                const s = L.put(t, around((start.x + end.x) / 2, (start.y + end.y) / 2, 8));
                return (
                  <MathChip
                    x={s.x}
                    y={s.y}
                    text={t}
                    w={w}
                    h={h}
                    color={c.vectorResultant}
                    anchor={s.anchor}
                  />
                );
              })()
            : null;
          const closeLabel =
            all && fs.equilibrium
              ? (() => {
                  const t = closes ? 'closed: ΣF = 0' : 'gap: ΣF ≠ 0';
                  const s = L.put(t, [
                    { x: 8, y: h - 8, anchor: 'start' },
                    { x: w - 8, y: h - 8, anchor: 'end' },
                  ]);
                  return <MathChip x={s.x} y={s.y} text={t} w={w} h={h} anchor={s.anchor} />;
                })()
              : null;
          return (
            <Svg width={w} height={h}>
              {/* The horizontal through the point, and a rule between the two views. */}
              <Line
                x1={o.x - w * 0.42}
                y1={o.y}
                x2={o.x + w * 0.42}
                y2={o.y}
                stroke={c.chartMuted}
                strokeWidth={1}
                strokeDasharray={chart.dash}
              />
              <Line x1={8} y1={TOP} x2={w - 8} y2={TOP} stroke={c.chartGrid} strokeWidth={1} />
              <MathChip
                x={8}
                y={18}
                text="Forces on the point"
                w={w}
                h={h}
                anchor="start"
                bold={false}
              />
              <MathChip
                x={8}
                y={TOP + 18}
                text="Tip to tail"
                w={w}
                h={h}
                anchor="start"
                bold={false}
              />
              {arcs}
              {shown.map((q) => {
                const e = tip(q);
                return <Vec key={q.f.name} x1={o.x} y1={o.y} x2={e.x} y2={e.y} color={q.color} />;
              })}
              <Circle cx={o.x} cy={o.y} r={5} fill={c.chartInk} />
              {/* The polygon. */}
              {resultant ? (
                <Vec
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  color={c.vectorResultant}
                  width={4}
                  dash="8 5"
                />
              ) : null}
              {shown.map((q, i) => (
                <Vec
                  key={`p${q.f.name}`}
                  x1={P[i]!.x}
                  y1={P[i]!.y}
                  x2={P[i + 1]!.x}
                  y2={P[i + 1]!.y}
                  color={q.color}
                  width={2.5}
                />
              ))}
              <Circle cx={start.x} cy={start.y} r={3.5} fill={c.chartInk} />
              {labels}
              {rLabel}
              {closeLabel}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
