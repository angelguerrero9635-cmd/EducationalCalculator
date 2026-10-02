import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Path } from 'react-native-svg';

import type { VectorDiagramSpec, VectorOf } from '@/data/modules/typesHsd';
import type { Values } from '@/engine/types';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { angleDrag, wrap360 } from './angleDrag';
import { Canvas, Caption, DragHandle, useFrozen, useRep } from './common';
import { Arrow, makeFrame } from './graphKit';
import { HsdGrid, handleBox, niceWindow } from './hsdGrid';
import { magnitudeText, short } from './hsdKit';
import { MathChip } from './hsdText';

const RAD = Math.PI / 180;

/** "⟨3, −1⟩" */
const bracket = (x: number, y: number) => `⟨${short(x)}, ${short(y)}⟩`;

/** A direction in degrees from 0° up to 360°. */
const heading = (x: number, y: number) => {
  const d = Math.atan2(y, x) / RAD;
  return d < 0 ? d + 360 : d;
};

/**
 * Vectors as arrows on a grid, by components or by magnitude and direction: a sum tip to tail
 * or as a parallelogram, a scalar multiple, the angle between two vectors with the sign of
 * their dot product. Drag a tip.
 */
export function VectorDiagram({ spec, calc }: { spec: VectorDiagramSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (v: number | string) => (typeof v === 'number' ? v : rep.val(v));
  const isKnown = (v: number | string | undefined) =>
    v === undefined || typeof v === 'number' || rep.known(v);
  const unit = spec.unit ? ` ${spec.unit}` : '';
  const polar = (v: VectorOf) => v.x === undefined && v.magnitude !== undefined;
  const resolve = (v: VectorOf) => {
    if (!polar(v)) {
      return {
        x: num(v.x ?? 0),
        y: num(v.y ?? 0),
        known: isKnown(v.x) && isKnown(v.y),
      };
    }
    const m = num(v.magnitude!);
    const d = num(v.direction ?? 0);
    return {
      x: m * Math.cos(d * RAD),
      y: m * Math.sin(d * RAD),
      known: isKnown(v.magnitude) && isKnown(v.direction),
    };
  };
  const vs = spec.vectors.map(resolve);
  const [a, b] = [vs[0]!, vs[1]];
  const sum = b && spec.sum ? { x: a.x + b.x, y: a.y + b.y } : undefined;
  const k = spec.scalar ? num(spec.scalar.k) : undefined;
  const kv = k === undefined ? undefined : { x: k * a.x, y: k * a.y };
  // The second vector starts at the first's tip in a tip-to-tail sum.
  const tail2 = spec.sum === 'tipToTail' ? { x: a.x, y: a.y } : { x: 0, y: 0 };
  const pts = [
    a,
    ...(b ? [{ x: tail2.x + b.x, y: tail2.y + b.y }, b] : []),
    ...(sum ? [sum] : []),
    ...(kv ? [kv] : []),
  ];
  const live = (() => {
    const wx = niceWindow(
      pts.map((p) => p.x),
      7,
    );
    const wy = niceWindow(
      pts.map((p) => p.y),
      7,
    );
    const step = Math.max(wx.step, wy.step);
    const r = (w: { lo: number; hi: number }) => ({
      lo: Math.floor(w.lo / step) * step,
      hi: Math.ceil(w.hi / step) * step,
    });
    return { x: r(wx), y: r(wy), step };
  })();
  const win = useFrozen(live);
  const drag = useRef({ x: 0, y: 0 });
  const turn = useRef<(dx: number, dy: number) => number>(() => 0);
  const colors = [c.chartHighlight, c.hopBack];
  const resultName =
    spec.result?.name ?? `${spec.vectors[0].name} + ${spec.vectors[1]?.name ?? ''}`;

  // Caption.
  const lines: string[] = spec.vectors.map((v, i) => {
    const r = vs[i]!;
    if (!r.known) return `${v.name} = ?`;
    if (polar(v))
      return `${v.name}: ${short(num(v.magnitude!))}${unit} at ${short(num(v.direction ?? 0))}°, so ${v.name} = ${bracket(r.x, r.y)}.`;
    return `${v.name} = ${bracket(r.x, r.y)} · |${v.name}| = ${magnitudeText(r.x, r.y)}${unit}.`;
  });
  if (sum && b && a.known && b.known) {
    const how = spec.sum === 'tipToTail' ? 'Tip to tail' : 'Parallelogram';
    lines.push(
      `${how}: ${resultName} = ${bracket(sum.x, sum.y)} · |${resultName}| = ${magnitudeText(sum.x, sum.y)}${unit} at ${short(heading(sum.x, sum.y))}°.`,
    );
  }
  // A "?" k reads as its letter ("ku"), never the example's −2.
  const kKnown = spec.scalar ? isKnown(spec.scalar.k) : true;
  const kName =
    spec.scalar && !kKnown && typeof spec.scalar.k === 'string'
      ? rep.variable(spec.scalar.k).symbol
      : short(k ?? 0);
  if (kv && k !== undefined && a.known && kKnown) {
    const name = `${short(k)}${spec.vectors[0].name}`;
    lines.push(
      k === 0
        ? `0${spec.vectors[0].name} is the zero vector.`
        : `${name} = ${bracket(kv.x, kv.y)}: ${short(Math.abs(k))} times as long, ${k > 0 ? 'the same direction' : 'the opposite direction'}.`,
    );
  }
  if (spec.angle && b && a.known && b.known) {
    const dot = a.x * b.x + a.y * b.y;
    const ma = Math.hypot(a.x, a.y);
    const mb = Math.hypot(b.x, b.y);
    const n1 = spec.vectors[0].name;
    const n2 = spec.vectors[1]!.name;
    const par = (x: number) => (x < 0 ? `(${short(x)})` : short(x));
    if (ma > 0 && mb > 0) {
      const th = Math.acos(Math.max(-1, Math.min(1, dot / (ma * mb)))) / RAD;
      const zero = Math.abs(dot) < 1e-9;
      lines.push(
        `${n1}·${n2} = ${short(a.x)} × ${par(b.x)} + ${short(a.y)} × ${par(b.y)} = ${short(dot)}.`,
        `${n1}·${n2} ${zero ? '= 0' : dot > 0 ? '> 0' : '< 0'}, so the angle between them, ${short(th)}°, is ${zero ? 'a right angle' : dot > 0 ? 'acute' : 'obtuse'}.`,
      );
    }
  }

  return (
    <View>
      <Canvas
        aspect={Math.max(
          0.6,
          Math.min(1.2, (win.value.y.hi - win.value.y.lo) / (win.value.x.hi - win.value.x.lo)),
        )}
      >
        {({ w, h }) => {
          const f = makeFrame(
            w,
            h,
            [win.value.x.lo, win.value.x.hi],
            [win.value.y.lo, win.value.y.hi],
            true,
            true,
          );
          const P = (x: number, y: number) => ({ x: f.sx(x), y: f.sy(y) });
          const tails = [{ x: 0, y: 0 }, tail2];
          // Labels placed so far, and every arrow's points, for keeping new labels clear.
          const placed: { x: number; y: number }[] = [];
          const arrowPts: { x: number; y: number }[] = [];
          const along = (x0: number, y0: number, x1: number, y1: number) => {
            for (let i = 1; i < 10; i++)
              arrowPts.push(P(x0 + ((x1 - x0) * i) / 10, y0 + ((y1 - y0) * i) / 10));
          };
          vs.forEach((v, i) =>
            along(tails[i]!.x, tails[i]!.y, tails[i]!.x + v.x, tails[i]!.y + v.y),
          );
          if (sum) along(0, 0, sum.x, sum.y);
          if (kv) along(0, 0, kv.x, kv.y);
          const ax0 = f.sx(Math.min(f.x[1], Math.max(f.x[0], 0)));
          const ay0 = f.sy(Math.min(f.y[1], Math.max(f.y[0], 0)));
          /**
           * The label beside an arrow, 60% along it, on the side farther from the axes' numbers,
           * the other arrows and the labels already placed (`flip` breaks a tie).
           */
          const side = (
            x0: number,
            y0: number,
            x1: number,
            y1: number,
            text: string,
            color: string,
            flip = false,
          ) => {
            const p0 = P(x0, y0);
            const p1 = P(x1, y1);
            const len = Math.hypot(p1.x - p0.x, p1.y - p0.y) || 1;
            const tw = text.length * chart.label * 0.58 + 6;
            const option = (s: number, at = 0.6) => {
              const nx = (-(p1.y - p0.y) / len) * s;
              const ny = ((p1.x - p0.x) / len) * s;
              const bx = p0.x + (p1.x - p0.x) * at - nx * 16;
              const by = p0.y + (p1.y - p0.y) * at - ny * 16 + 4;
              const anchor: 'start' | 'middle' | 'end' =
                Math.abs(nx) < 0.35 ? 'middle' : -nx > 0 ? 'start' : 'end';
              const cx0 = anchor === 'start' ? bx + tw / 2 : anchor === 'end' ? bx - tw / 2 : bx;
              const cy0 = by - 5;
              // Distance from the label's box to a point.
              const gap = (q: { x: number; y: number }) =>
                Math.hypot(
                  Math.max(0, Math.abs(q.x - cx0) - tw / 2),
                  Math.max(0, Math.abs(q.y - cy0) - 9),
                );
              const toAxes = Math.min(
                Math.max(0, Math.abs(cx0 - ax0) - tw / 2),
                Math.max(0, Math.abs(cy0 - ay0) - 9),
              );
              const inside = cx0 - tw / 2 > 0 && cx0 + tw / 2 < w && cy0 > 10 && cy0 < h - 10;
              // The axes' numbers run under the x-axis and left of the y-axis: a tag there
              // covers them (F₁ along the x-axis hid 10 and 20).
              const onNumbers =
                (cy0 > ay0 + 2 && cy0 < ay0 + 24) || (cx0 + tw / 2 > ax0 - 34 && cx0 < ax0);
              const score =
                Math.min(24, toAxes) +
                Math.min(30, ...arrowPts.map(gap), 30) +
                Math.min(40, ...placed.map(gap), 40) +
                (inside ? 20 : 0) -
                (onNumbers ? 25 : 0) +
                (s === (flip ? -1 : 1) ? 3 : 0) +
                (at === 0.6 ? 2 : 0);
              return { bx, by, anchor, score, cx0, cy0 };
            };
            // 60% along by default; nearer the tip or the tail when that side is crowded (an
            // angle's tag by the tail covered F₁'s).
            const best = [0.6, 0.8, 0.42]
              .flatMap((at) => [option(1, at), option(-1, at)])
              .reduce((m, o) => (o.score > m.score ? o : m));
            placed.push({ x: best.cx0, y: best.cy0 });
            return (
              <MathChip
                x={best.bx}
                y={best.by}
                text={text}
                w={w}
                h={h}
                color={color}
                anchor={best.anchor}
              />
            );
          };
          const arrow = (
            x0: number,
            y0: number,
            x1: number,
            y1: number,
            color: string,
            faded: boolean,
            dash?: string,
            width: number = chart.strokeHeavy,
          ) =>
            Math.hypot(x1 - x0, y1 - y0) > 1e-9 ? (
              <G opacity={faded ? 0.35 : 1}>
                <Arrow
                  x1={f.sx(x0)}
                  y1={f.sy(y0)}
                  x2={f.sx(x1)}
                  y2={f.sy(y1)}
                  color={color}
                  width={width}
                  dash={dash}
                />
              </G>
            ) : null;
          const angleArc = (
            x: number,
            y: number,
            from: number,
            to: number,
            r: number,
            text: string,
          ) => {
            const n = Math.max(2, Math.ceil(Math.abs(to - from) / 4));
            const o = P(x, y);
            const d = Array.from({ length: n + 1 }, (_, i) => {
              const t = (from + ((to - from) * i) / n) * RAD;
              return `${i ? 'L' : 'M'} ${o.x + r * Math.cos(t)} ${o.y - r * Math.sin(t)}`;
            }).join(' ');
            const mid = ((from + to) / 2) * RAD;
            // The angle's tag is placed before the vectors' names, which keep off it.
            const tx = o.x + (r + 16) * Math.cos(mid);
            const ty = o.y - (r + 16) * Math.sin(mid);
            const half = text.length * chart.label * 0.29;
            placed.push({ x: tx - half, y: ty }, { x: tx, y: ty }, { x: tx + half, y: ty });
            return (
              <G>
                <Path d={d} stroke={c.chartInk} strokeWidth={chart.strokeLight} fill="none" />
                <MathChip
                  x={o.x + (r + 16) * Math.cos(mid)}
                  y={o.y - (r + 16) * Math.sin(mid) + 4}
                  text={text}
                  w={w}
                  h={h}
                  bold={false}
                />
              </G>
            );
          };
          return (
            <>
              <Svg width={w} height={h}>
                <HsdGrid
                  f={f}
                  step={{ x: win.value.step, y: win.value.step }}
                  names={spec.axes}
                  // No tick number half hidden under a tip's handle.
                  clear={
                    spec.fixed
                      ? []
                      : vs.flatMap((r, i) => {
                          const tip = P(tails[i]!.x + r.x, tails[i]!.y + r.y);
                          return r.known ? [handleBox(tip.x, tip.y)] : [];
                        })
                  }
                />
                {/* Components as dashed legs. */}
                {spec.components
                  ? vs.map((v, i) => {
                      const t = tails[i]!;
                      const p0 = P(t.x, t.y);
                      const p1 = P(t.x + v.x, t.y);
                      const p2 = P(t.x + v.x, t.y + v.y);

                      // The legs’ lengths beside them, inside the triangle.
                      const showX = Math.abs(p1.x - p0.x) > 30;
                      const showY = Math.abs(p2.y - p1.y) > 24;
                      // Their places, so the vectors' tags keep off them (vᵧ was hidden).
                      const half = (t: string) => (t.length * chart.label * 0.58 + 6) / 2;
                      if (showX)
                        placed.push({ x: (p0.x + p1.x) / 2, y: p0.y + (v.y >= 0 ? -13 : 12) });
                      if (showY)
                        placed.push({
                          x: p1.x + (v.x >= 0 ? 1 : -1) * (6 + half(short(v.y))),
                          y: (p1.y + p2.y) / 2 - 1,
                        });
                      return (
                        <G key={`c${i}`} opacity={v.known ? 1 : 0.35}>
                          <Path
                            d={`M ${p0.x} ${p0.y} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
                            stroke={colors[i]}
                            strokeWidth={chart.stroke + 0.5}
                            strokeDasharray={chart.dashFine}
                            fill="none"
                          />
                          {showX ? (
                            <MathChip
                              x={(p0.x + p1.x) / 2}
                              y={p0.y + (v.y >= 0 ? -8 : 17)}
                              text={v.known ? short(v.x) : '?'}
                              w={w}
                              h={h}
                              color={colors[i]}
                              bold={false}
                            />
                          ) : null}
                          {showY ? (
                            <MathChip
                              x={p1.x + (v.x >= 0 ? 6 : -6)}
                              y={(p1.y + p2.y) / 2 + 4}
                              text={v.known ? short(v.y) : '?'}
                              anchor={v.x >= 0 ? 'start' : 'end'}
                              w={w}
                              h={h}
                              color={colors[i]}
                              bold={false}
                            />
                          ) : null}
                        </G>
                      );
                    })
                  : null}
                {/* The parallelogram's other two sides, dashed. */}
                {spec.sum === 'parallelogram' && b && sum ? (
                  <G>
                    {arrow(
                      b.x,
                      b.y,
                      sum.x,
                      sum.y,
                      colors[0]!,
                      !a.known,
                      chart.dash,
                      chart.strokeLight,
                    )}
                    {arrow(
                      a.x,
                      a.y,
                      sum.x,
                      sum.y,
                      colors[1]!,
                      !b.known,
                      chart.dash,
                      chart.strokeLight,
                    )}
                  </G>
                ) : null}
                {/* Direction angles of vectors given by magnitude and direction. */}
                {spec.vectors.map((v, i) => {
                  const r = vs[i]!;
                  if (!polar(v) || !r.known || Math.hypot(r.x, r.y) * f.ux < 40) return null;
                  const d = heading(r.x, r.y);
                  if (d < 1 || d > 359) return null;
                  const t = tails[i]!;
                  const o = P(t.x, t.y);
                  return (
                    <G key={`d${i}`}>
                      {i > 0 && (t.x !== 0 || t.y !== 0) ? (
                        <Line
                          x1={o.x}
                          y1={o.y}
                          x2={o.x + 40}
                          y2={o.y}
                          stroke={c.chartMuted}
                          strokeWidth={1}
                          strokeDasharray={chart.dashFine}
                        />
                      ) : null}
                      {angleArc(
                        t.x,
                        t.y,
                        0,
                        d > 180 ? d - 360 : d,
                        20 + 8 * i,
                        `${short(num(v.direction ?? 0))}°`,
                      )}
                    </G>
                  );
                })}
                {spec.angle &&
                b &&
                a.known &&
                b.known &&
                Math.hypot(a.x, a.y) > 0 &&
                Math.hypot(b.x, b.y) > 0
                  ? (() => {
                      const d1 = heading(a.x, a.y);
                      let d2 = heading(b.x, b.y);
                      if (d2 - d1 > 180) d2 -= 360;
                      if (d1 - d2 > 180) d2 += 360;
                      const dot = a.x * b.x + a.y * b.y;
                      const th =
                        Math.acos(
                          Math.max(
                            -1,
                            Math.min(1, dot / (Math.hypot(a.x, a.y) * Math.hypot(b.x, b.y))),
                          ),
                        ) / RAD;
                      return angleArc(0, 0, d1, d2, 30, `θ = ${short(th)}°`);
                    })()
                  : null}
                {/* The scalar multiple, under the first vector. */}
                {kv
                  ? arrow(
                      0,
                      0,
                      kv.x,
                      kv.y,
                      c.vectorResultant,
                      !a.known,
                      undefined,
                      chart.strokeHeavy + 3,
                    )
                  : null}
                {spec.vectors.map((_, i) => {
                  const v = vs[i]!;
                  const t = tails[i]!;
                  return (
                    <G key={`v${i}`}>
                      {arrow(t.x, t.y, t.x + v.x, t.y + v.y, colors[i]!, !v.known)}
                    </G>
                  );
                })}
                {sum && b
                  ? arrow(0, 0, sum.x, sum.y, c.vectorResultant, !(a.known && b.known))
                  : null}
                {/* Names. */}
                {spec.vectors.map((v, i) => {
                  const r = vs[i]!;
                  const t = tails[i]!;
                  if (Math.hypot(r.x, r.y) < 1e-9) return null;
                  const text = polar(v)
                    ? `${v.name} = ${r.known ? short(num(v.magnitude!)) : '?'}${unit}`
                    : v.name;
                  // The sum's resultant sits on the first vector's left: the others go right.
                  const flip =
                    !!sum && i === 0 && spec.sum === 'tipToTail'
                      ? heading(sum.x, sum.y) > heading(r.x, r.y)
                      : false;
                  return (
                    <G key={`n${i}`}>
                      {side(t.x, t.y, t.x + r.x, t.y + r.y, text, colors[i]!, flip)}
                    </G>
                  );
                })}
                {sum && b && Math.hypot(sum.x, sum.y) > 1e-9
                  ? side(
                      0,
                      0,
                      sum.x,
                      sum.y,
                      spec.result?.name
                        ? `${spec.result.name} = ${a.known && b.known ? short(Math.hypot(sum.x, sum.y)) : '?'}${unit}`
                        : resultName,
                      c.vectorResultant,
                      spec.sum === 'tipToTail' ? heading(sum.x, sum.y) > heading(a.x, a.y) : true,
                    )
                  : null}
                {kv && k !== undefined && Math.hypot(kv.x, kv.y) > 1e-9
                  ? side(
                      0,
                      0,
                      kv.x,
                      kv.y,
                      `${kName}${spec.vectors[0].name}`,
                      c.vectorResultant,
                      true,
                    )
                  : null}
              </Svg>
              {!spec.fixed
                ? spec.vectors.map((v, i) => {
                    const r = vs[i]!;
                    const t = tails[i]!;
                    const ids = [v.x, v.y, v.magnitude, v.direction].filter(
                      (x): x is string => typeof x === 'string',
                    );
                    if (!ids.length || !r.known) return null;
                    const tip = P(t.x + r.x, t.y + r.y);
                    return (
                      <DragHandle
                        key={`h${i}`}
                        testID={`drag-${i === 0 ? 'first' : 'second'}-tip`}
                        x={tip.x}
                        y={tip.y}
                        label={`the tip of ${v.name}`}
                        onStart={() => {
                          drag.current = { x: r.x, y: r.y };
                          const tail = P(t.x, t.y);
                          turn.current = angleDrag(
                            { x: tip.x - tail.x, y: tip.y - tail.y },
                            heading(r.x, r.y),
                          );
                          win.freeze();
                        }}
                        onMove={(dx, dy) => {
                          // The tip stays inside the picture (the window is frozen while
                          // dragging): dragged past an edge it runs along it.
                          const clamp = (x: number, [lo, hi]: readonly number[]) =>
                            Math.min(hi!, Math.max(lo!, x));
                          const nx = clamp(t.x + drag.current.x + dx / f.ux, f.x) - t.x;
                          const ny = clamp(t.y + drag.current.y - dy / f.uy, f.y) - t.y;
                          const next: Values = {};
                          const put = (id: number | string | undefined, x: number) => {
                            if (typeof id === 'string')
                              next[id] = rep.snapTo(id, x * rep.factor(id));
                          };
                          if (!polar(v)) {
                            put(v.x, nx);
                            put(v.y, ny);
                          } else if (typeof v.direction === 'string') {
                            // The direction turns with the finger and on as it passes the
                            // tail, never 180° at once (51° → 203° on the components page) or
                            // fast near it (15.87° → 342° on the vectors page): angleDrag.
                            // The length is the finger's reach along that direction, at least a
                            // handle's width, so the tip never crosses the tail.
                            const d = turn.current(dx, dy);
                            const along = nx * Math.cos(d * RAD) + ny * Math.sin(d * RAD);
                            put(v.magnitude, Math.max(24 / f.ux, along));
                            put(v.direction, wrap360(d));
                          } else {
                            const d = num(v.direction ?? 0) * RAD;
                            put(v.magnitude, Math.max(0, nx * Math.cos(d) + ny * Math.sin(d)));
                          }
                          const others = spec.vectors
                            .filter((_, j) => j !== i)
                            .flatMap((o) => [o.x, o.y, o.magnitude, o.direction])
                            .filter((x): x is string => typeof x === 'string');
                          const [first] = ids;
                          calc.set(
                            {
                              ...rep.pin(
                                spec.keep ?? [
                                  ...others,
                                  ...(typeof spec.scalar?.k === 'string' ? [spec.scalar.k] : []),
                                ],
                              ),
                              ...next,
                            },
                            first ? rep.slide(first) : undefined,
                          );
                        }}
                        onEnd={win.release}
                      />
                    );
                  })
                : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
