import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { ConicGraphSpec } from '@/data/modules/typesHsd';
import type { Values } from '@/engine/types';
import { Text } from '@/components/Text';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle, useFrozen, useRep } from './common';
import { makeFrame } from './graphKit';
import { conicEquation, focalDistance, type ConicOf } from './conics';
import { useConicCircleHe3c } from './ConicCircleHe3c';
import { HsdGrid, handleBox, niceWindow } from './hsdGrid';
import { short, sqrtText } from './hsdKit';
import { MathChip } from './hsdText';

type Pt = { x: number; y: number };

/**
 * A circle, parabola, ellipse or hyperbola from its equation, with its center or vertex, radius,
 * axes, foci, directrix and asymptotes. Drag the center and the radius, the axes' ends or the
 * focus.
 */
export function ConicGraph({
  spec,
  calc,
}: {
  spec: Exclude<ConicGraphSpec, { conic: 'turned' }>; // H106: 'turned' is ConicTurned
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (x: number | string | undefined, d = 0) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const isKnown = (x: number | string | undefined) =>
    x === undefined || typeof x === 'number' || rep.known(x);
  const q: ConicOf = {
    conic: spec.conic,
    h: num(spec.h),
    k: num(spec.k),
    ...(spec.conic === 'circle' ? { r: Math.abs(num(spec.r)) } : {}),
    ...(spec.conic === 'parabola' ? { p: num(spec.p), axis: spec.axis ?? 'vertical' } : {}),
    ...(spec.conic === 'ellipse' ? { a: Math.abs(num(spec.a)), b: Math.abs(num(spec.b)) } : {}),
    ...(spec.conic === 'hyperbola'
      ? { a: Math.abs(num(spec.a)), b: Math.abs(num(spec.b)), axis: spec.axis ?? 'horizontal' }
      : {}),
  };
  const sizeIds =
    spec.conic === 'circle' ? [spec.r] : spec.conic === 'parabola' ? [spec.p] : [spec.a, spec.b];
  const known = [spec.h, spec.k, ...sizeIds].every(isKnown);
  const he3c = useConicCircleHe3c(spec, num, isKnown, known); // HC67: under the arc, tangent
  const cF = focalDistance(q);
  const vertical = q.axis === 'vertical';
  // The shape's reach from its center, for the window.
  const reach = (() => {
    switch (q.conic) {
      case 'circle':
        return { x: q.r!, y: q.r! };
      case 'parabola': {
        const s = Math.max(1, Math.abs(q.p!) * 4);
        return q.axis === 'horizontal' ? { x: s, y: s } : { x: s, y: s };
      }
      case 'ellipse':
        return { x: q.a!, y: q.b! };
      case 'hyperbola': {
        const s = Math.max(q.a!, q.b!, cF) * 1.6;
        return { x: s, y: s };
      }
    }
  })();
  // The point is drawn only when both its coordinates are known (never at the example's spot).
  const pt =
    spec.point && rep.known(spec.point.x) && rep.known(spec.point.y)
      ? { x: rep.val(spec.point.x), y: rep.val(spec.point.y) }
      : undefined;
  const live = (() => {
    const xs = [q.h - reach.x, q.h + reach.x, ...(pt ? [pt.x] : [])];
    const ys = [q.k - reach.y, q.k + reach.y, ...(pt ? [pt.y] : [])];
    // A parabola reaches 4|p| the way it opens, and past the directrix only a little the other.
    if (q.conic === 'parabola') {
      const s = Math.max(1, 4 * Math.abs(q.p!));
      const back = -Math.sign(q.p!) * Math.max(0.5, 1.5 * Math.abs(q.p!));
      const along = [back, Math.sign(q.p!) * s];
      if (vertical) ys.splice(0, 2, q.k + along[0]!, q.k + along[1]!);
      else xs.splice(0, 2, q.h + along[0]!, q.h + along[1]!);
    }
    const wx = niceWindow(xs, 8, 0.08);
    const wy = niceWindow(ys, 8, 0.08);
    const step = Math.max(wx.step, wy.step);
    const r = (w: { lo: number; hi: number }) => ({
      lo: Math.floor(w.lo / step) * step,
      hi: Math.ceil(w.hi / step) * step,
    });
    return { x: r(wx), y: r(wy), step };
  })();
  const win = useFrozen(live);
  const drag = useRef({ x: 0, y: 0 });

  // Caption.
  const lines: string[] = [known ? conicEquation(q) + '.' : 'The equation needs every value.'];
  const at = (x: number, y: number) => `(${short(x)}, ${short(y)})`;
  // c exact when c² is whole (2√3 ≈ 3.46), else to 2 decimals.
  const exactC = sqrtText(cF * cF);
  const cText = exactC && exactC.includes('√') ? `${exactC} ≈ ${short(cF)}` : short(cF);
  if (known) {
    switch (q.conic) {
      case 'circle':
        lines.push(`Center ${at(q.h, q.k)} · radius ${short(q.r!)}.`);
        break;
      case 'parabola': {
        const f = vertical ? at(q.h, q.k + q.p!) : at(q.h + q.p!, q.k);
        const d = vertical ? `y = ${short(q.k - q.p!)}` : `x = ${short(q.h - q.p!)}`;
        lines.push(
          `Vertex ${at(q.h, q.k)} · focus ${f}, p = ${short(q.p!)} away · directrix ${d}.`,
        );
        lines.push('Every point is as far from the focus as from the directrix.');
        break;
      }
      case 'ellipse': {
        const major = q.a! >= q.b! ? 'across' : 'up and down';
        lines.push(
          // c² from the squares themselves (16 − 12), not from a rounded b (3.46²).
          `Center ${at(q.h, q.k)} · c = √(${short(Math.max(q.a!, q.b!) ** 2)} − ${short(Math.min(q.a!, q.b!) ** 2)}) = ${cText}: the foci are ${short(cF)} from the center, ${major}.`,
        );
        lines.push('From any point, the distances to the two foci add to the long axis.');
        break;
      }
      case 'hyperbola': {
        const slope = vertical ? `${short(q.a!)}/${short(q.b!)}` : `${short(q.b!)}/${short(q.a!)}`;
        lines.push(
          `Center ${at(q.h, q.k)} · c = √(${short(q.a!)}² + ${short(q.b!)}²) = ${cText} · asymptotes of slope ±${slope}.`,
        );
        break;
      }
    }
    if (pt) lines.push(`The point ${at(pt.x, pt.y)} is on the curve.`);
  }
  lines.push(...he3c.lines);

  return (
    <View>
      {/* The equation as the plot's key, above it (inside, it covered the corner). */}
      <Text style={[styles.key, { color: c.chartHighlight }]}>
        {known ? conicEquation(q) : '?'}
      </Text>
      <Canvas
        aspect={Math.max(
          0.65,
          Math.min(1.15, (win.value.y.hi - win.value.y.lo) / (win.value.x.hi - win.value.x.lo)),
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
          const inside = (p: Pt) =>
            p.x >= f.x[0] - 1e-9 &&
            p.x <= f.x[1] + 1e-9 &&
            p.y >= f.y[0] - 1e-9 &&
            p.y <= f.y[1] + 1e-9;
          /** A polyline through world points, broken where it leaves the window. */
          const curve = (pts: Pt[]) => {
            let d = '';
            let pen = false;
            for (const p of pts) {
              if (!inside(p) || !Number.isFinite(p.x + p.y)) {
                pen = false;
                continue;
              }
              d += `${pen ? 'L' : 'M'} ${f.sx(p.x)} ${f.sy(p.y)} `;
              pen = true;
            }
            return d;
          };
          const N = 360;
          const shapes: Pt[][] = [];
          switch (q.conic) {
            case 'circle':
            case 'ellipse': {
              const [rx, ry] = q.conic === 'circle' ? [q.r!, q.r!] : [q.a!, q.b!];
              shapes.push(
                Array.from({ length: N + 1 }, (_, i) => ({
                  x: q.h + rx * Math.cos((2 * Math.PI * i) / N),
                  y: q.k + ry * Math.sin((2 * Math.PI * i) / N),
                })),
              );
              break;
            }
            case 'parabola': {
              const [lo, hi] = vertical ? f.x : f.y;
              shapes.push(
                Array.from({ length: N + 1 }, (_, i) => {
                  const u = lo + ((hi - lo) * i) / N;
                  return vertical
                    ? { x: u, y: q.k + (u - q.h) ** 2 / (4 * q.p!) }
                    : { x: q.h + (u - q.k) ** 2 / (4 * q.p!), y: u };
                }),
              );
              break;
            }
            case 'hyperbola': {
              const T = Math.acosh(
                Math.max(
                  2,
                  (4 * Math.max(f.x[1] - f.x[0], f.y[1] - f.y[0])) / Math.min(q.a!, q.b!) + 1,
                ),
              );
              for (const s of [1, -1]) {
                shapes.push(
                  Array.from({ length: N + 1 }, (_, i) => {
                    const t = -T + (2 * T * i) / N;
                    const [u, v] = [s * q.a! * Math.cosh(t), q.b! * Math.sinh(t)];
                    return vertical ? { x: q.h + v, y: q.k + u } : { x: q.h + u, y: q.k + v };
                  }),
                );
              }
              break;
            }
          }
          const foci: Pt[] =
            q.conic === 'circle'
              ? []
              : q.conic === 'parabola'
                ? [vertical ? { x: q.h, y: q.k + q.p! } : { x: q.h + q.p!, y: q.k }]
                : (q.conic === 'ellipse' ? q.a! >= q.b! : !vertical)
                  ? [
                      { x: q.h - cF, y: q.k },
                      { x: q.h + cF, y: q.k },
                    ]
                  : [
                      { x: q.h, y: q.k - cF },
                      { x: q.h, y: q.k + cF },
                    ];
          const C = P(q.h, q.k);
          const fade = known ? 1 : 0.35;
          const dashed = {
            stroke: c.chartMuted,
            strokeWidth: chart.strokeLight,
            strokeDasharray: chart.dash,
          };
          // The handles: the center (or vertex) and the size.
          const sizeHandles: { at: Pt; id: string; set: (p: Pt) => number; label: string }[] = [];
          const addSize = (
            id: number | string | undefined,
            at: Pt,
            set: (p: Pt) => number,
            label: string,
          ) => {
            // Mid-drag (the window held) a handle past the window stays mounted: DragHandle keeps
            // it on the picture's edge.
            if (typeof id === 'string' && (inside(at) || win.frozen))
              sizeHandles.push({ id, at, set, label });
          };
          if (spec.conic === 'circle')
            addSize(
              spec.r,
              { x: q.h + q.r! * Math.SQRT1_2, y: q.k + q.r! * Math.SQRT1_2 },
              (p) => Math.hypot(p.x - q.h, p.y - q.k),
              'the radius r',
            );
          if (spec.conic === 'parabola') {
            // A focus closer to the vertex than a handle: its handle moves out to the end of
            // the latus rectum (2p across from the focus), still at height p, so both grab.
            const near = Math.abs(q.p!) * (vertical ? f.uy : f.ux) < chart.handleTouch;
            const focus = foci[0]!;
            // The end away from the traced point (whose handle may sit on the other end).
            const away = pt && (vertical ? pt.x > focus.x : pt.y > focus.y) ? -1 : 1;
            const at = !near
              ? focus
              : vertical
                ? { x: focus.x + away * 2 * Math.abs(q.p!), y: focus.y }
                : { x: focus.x, y: focus.y + away * 2 * Math.abs(q.p!) };
            addSize(spec.p, at, (p) => (vertical ? p.y - q.k : p.x - q.h), 'the focus, p');
          }
          if (spec.conic === 'ellipse' || spec.conic === 'hyperbola') {
            const along = vertical && spec.conic === 'hyperbola';
            addSize(
              spec.a,
              along ? { x: q.h, y: q.k + q.a! } : { x: q.h + q.a!, y: q.k },
              (p) => Math.abs(along ? p.y - q.k : p.x - q.h),
              'a',
            );
            addSize(
              spec.b,
              along ? { x: q.h + q.b!, y: q.k } : { x: q.h, y: q.k + q.b! },
              (p) => Math.abs(along ? p.x - q.h : p.y - q.k),
              'b',
            );
          }
          const move = (ids: Values) => {
            const others = [spec.h, spec.k, ...sizeIds].filter(
              (x): x is string => typeof x === 'string',
            );
            return { ...rep.pin(spec.keep ?? others), ...ids };
          };
          return (
            <>
              <Svg width={w} height={h}>
                <HsdGrid
                  f={f}
                  step={{ x: win.value.step, y: win.value.step }}
                  // No tick number half hidden under a handle.
                  clear={
                    spec.fixed || !known
                      ? []
                      : [C, ...sizeHandles.map((s) => P(s.at.x, s.at.y))].map((p) =>
                          handleBox(p.x, p.y),
                        )
                  }
                />
                <G opacity={fade}>
                  {/* Guides: the box and asymptotes, the axes, the directrix, the radius. */}
                  {q.conic === 'hyperbola'
                    ? (() => {
                        const [ax, by] = vertical ? [q.b!, q.a!] : [q.a!, q.b!];
                        const m = by / ax;
                        const L = Math.max(f.x[1] - f.x[0], f.y[1] - f.y[0]) * 2;
                        const seg = (s: number) =>
                          curve(
                            Array.from({ length: 101 }, (_, i) => {
                              const x = q.h - L + (2 * L * i) / 100;
                              return { x, y: q.k + s * m * (x - q.h) };
                            }),
                          );
                        return (
                          <G>
                            <Rect
                              x={f.sx(q.h - ax)}
                              y={f.sy(q.k + by)}
                              width={2 * ax * f.ux}
                              height={2 * by * f.uy}
                              fill="none"
                              {...dashed}
                              strokeDasharray={chart.dashFine}
                            />
                            <Path d={seg(1)} fill="none" {...dashed} />
                            <Path d={seg(-1)} fill="none" {...dashed} />
                          </G>
                        );
                      })()
                    : null}
                  {q.conic === 'ellipse' ? (
                    <G>
                      <Line
                        x1={f.sx(q.h - q.a!)}
                        y1={C.y}
                        x2={f.sx(q.h + q.a!)}
                        y2={C.y}
                        stroke={c.chartMuted}
                        strokeWidth={chart.strokeLight}
                      />
                      <Line
                        x1={C.x}
                        y1={f.sy(q.k - q.b!)}
                        x2={C.x}
                        y2={f.sy(q.k + q.b!)}
                        stroke={c.chartMuted}
                        strokeWidth={chart.strokeLight}
                      />
                      <MathChip
                        // Below the axis and clear of the focus (its F tag is above it).
                        x={f.sx(q.h + (q.a! >= q.b! ? (cF + q.a!) / 2 : q.a! / 2))}
                        y={C.y + 16}
                        text={`a = ${known ? short(q.a!) : '?'}`}
                        w={w}
                        h={h}
                        bold={false}
                      />
                      <MathChip
                        x={C.x + 6}
                        y={f.sy(q.k + q.b! / 2) + 4}
                        text={`b = ${known ? short(q.b!) : '?'}`}
                        anchor="start"
                        w={w}
                        h={h}
                        bold={false}
                      />
                    </G>
                  ) : null}
                  {q.conic === 'parabola'
                    ? (() => {
                        const d = vertical ? q.k - q.p! : q.h - q.p!;
                        const [a, b] = vertical
                          ? [P(f.x[0], d), P(f.x[1], d)]
                          : [P(d, f.y[0]), P(d, f.y[1])];
                        const onScreen = vertical
                          ? d >= f.y[0] && d <= f.y[1]
                          : d >= f.x[0] && d <= f.x[1];
                        return onScreen ? (
                          <G>
                            <Line
                              x1={a.x}
                              y1={a.y}
                              x2={b.x}
                              y2={b.y}
                              stroke={c.hopBack}
                              strokeWidth={chart.stroke}
                              strokeDasharray={chart.dash}
                            />
                            <MathChip
                              x={vertical ? a.x + 6 : a.x + 6}
                              y={vertical ? a.y - 6 : f.sy(f.y[1]) + 26}
                              text={`${vertical ? 'y' : 'x'} = ${known ? short(d) : '?'}`}
                              anchor="start"
                              w={w}
                              h={h}
                              color={c.hopBack}
                              bold={false}
                            />
                          </G>
                        ) : null;
                      })()
                    : null}
                  {q.conic === 'circle' && !he3c.on ? (
                    <G>
                      {/* The radius at 45°, off the axes and their numbers. */}
                      <Line
                        x1={C.x}
                        y1={C.y}
                        x2={f.sx(q.h + q.r! * Math.SQRT1_2)}
                        y2={f.sy(q.k + q.r! * Math.SQRT1_2)}
                        stroke={c.chartMuted}
                        strokeWidth={chart.stroke}
                      />
                      <MathChip
                        // Above the radius (up and left of its middle), off the axes' numbers.
                        x={f.sx(q.h + (q.r! * Math.SQRT1_2) / 2) - 6}
                        y={f.sy(q.k + (q.r! * Math.SQRT1_2) / 2) - 6}
                        anchor="end"
                        text={`r = ${known ? short(q.r!) : '?'}`}
                        w={w}
                        h={h}
                        bold={false}
                      />
                    </G>
                  ) : null}
                  {he3c.under(f, w, h)}
                  {/* The curve. */}
                  {shapes.map((s, i) => (
                    <Path
                      key={i}
                      d={curve(s)}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.strokeHeavy}
                      fill="none"
                      strokeLinejoin="round"
                    />
                  ))}
                  {/* The center or vertex, and the foci. */}
                  <Circle cx={C.x} cy={C.y} r={4.5} fill={c.chartInk} />
                  {foci.filter(inside).map((p, i) => (
                    <G key={`f${i}`}>
                      <Circle
                        cx={f.sx(p.x)}
                        cy={f.sy(p.y)}
                        r={5}
                        fill={c.hopBack}
                        stroke={c.card}
                        strokeWidth={1.5}
                      />
                      {/* F off the axis: above foci that lie across, beside foci up and down. */}
                      <MathChip
                        x={f.sx(p.x) + (Math.abs(p.x - q.h) < 1e-9 ? 10 : 0)}
                        y={f.sy(p.y) + (Math.abs(p.x - q.h) < 1e-9 ? 4 : -10)}
                        anchor={Math.abs(p.x - q.h) < 1e-9 ? 'start' : 'middle'}
                        text={foci.length > 1 ? `F${i ? '₂' : '₁'}` : 'F'}
                        w={w}
                        h={h}
                        color={c.hopBack}
                      />
                    </G>
                  ))}
                  {he3c.over(f)}
                  {pt && inside(pt) ? (
                    <G>
                      <Circle cx={f.sx(pt.x)} cy={f.sy(pt.y)} r={5} fill={c.vectorResultant} />
                      <MathChip
                        x={f.sx(pt.x) + (pt.x < q.h ? -9 : 9)}
                        y={f.sy(pt.y) - 9}
                        text={at(pt.x, pt.y)}
                        anchor={pt.x < q.h ? 'end' : 'start'}
                        w={w}
                        h={h}
                        color={c.vectorResultant}
                        bold={false}
                      />
                    </G>
                  ) : null}
                </G>
              </Svg>
              {!spec.fixed &&
              known &&
              (typeof spec.h === 'string' || typeof spec.k === 'string') ? (
                <DragHandle
                  testID="drag-center"
                  x={C.x}
                  y={C.y}
                  label={q.conic === 'parabola' ? 'the vertex' : 'the center'}
                  onStart={() => {
                    drag.current = { x: q.h, y: q.k };
                    win.freeze();
                  }}
                  onMove={(dx, dy) => {
                    const next: Values = {};
                    if (typeof spec.h === 'string')
                      next[spec.h] = rep.snapTo(spec.h, drag.current.x + dx / f.ux);
                    if (typeof spec.k === 'string')
                      next[spec.k] = rep.snapTo(spec.k, drag.current.y - dy / f.uy);
                    const first = typeof spec.h === 'string' ? spec.h : (spec.k as string);
                    calc.set(move(next), rep.slide(first));
                  }}
                  onEnd={win.release}
                />
              ) : null}
              {!spec.fixed && known
                ? sizeHandles.map((s) => (
                    <DragHandle
                      key={s.id}
                      testID={`drag-${s.id}`}
                      x={f.sx(s.at.x)}
                      y={f.sy(s.at.y)}
                      label={s.label}
                      onStart={() => {
                        drag.current = { ...s.at };
                        win.freeze();
                      }}
                      onMove={(dx, dy) => {
                        const p = { x: drag.current.x + dx / f.ux, y: drag.current.y - dy / f.uy };
                        calc.set(move({ [s.id]: rep.snapTo(s.id, s.set(p)) }), rep.slide(s.id));
                      }}
                      onEnd={win.release}
                    />
                  ))
                : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

const styles = StyleSheet.create({
  key: { textAlign: 'center', fontSize: chart.value, fontWeight: '700', marginBottom: 4 },
});
