import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { G, Line } from 'react-native-svg';

import type { VectorDiagramSpec, VectorOf } from '@/data/modules/typesHsd';
import type { Values } from '@/engine/types';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle, useFrozen } from './common';
import { makeFrame } from './graphKit';
import { projectOf } from './he4bMath';
import {
  along,
  around,
  bestView,
  bracket,
  labelPlacer,
  par,
  RightAngle,
  subOf,
  unit2,
  useValues,
} from './he4bKit';
import { HsdGrid, handleBox, niceWindow } from './hsdGrid';
import { short } from './hsdKit';
import { MathChip } from './hsdText';
import { Vec } from './hskKit';
import { len3, sub3, type V3 } from './vectorSpace';

const RAD = Math.PI / 180;

/**
 * HC96: proj_v u = (u·v ÷ v·v)v. On a grid (or on x, y, z axes with `space`): u and v from the
 * origin, v's line dashed through the origin, the projection along it, the part square to v
 * dashed from the projection's tip to u's tip with a right-angle mark; in space that part is
 * also drawn from the origin (Gram–Schmidt's next vector). Drag u's tip on the grid.
 */
export function VectorProject({ spec, calc }: { spec: VectorDiagramSpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, v: val, known } = useValues(calc);
  const p = spec.project!;
  const space = !!spec.space;
  const polar = (x: VectorOf) => x.x === undefined && x.magnitude !== undefined;
  const resolve = (x: VectorOf | undefined) => {
    if (!x) return { p: [0, 0, 0] as V3, known: false, name: '' };
    if (polar(x)) {
      const [m, d] = [val(x.magnitude), val(x.direction)];
      return {
        p: [m * Math.cos(d * RAD), m * Math.sin(d * RAD), 0] as V3,
        known: known(x.magnitude) && known(x.direction),
        name: x.name,
      };
    }
    return {
      p: [val(x.x), val(x.y), space ? val(x.z) : 0] as V3,
      known: known(x.x) && known(x.y) && (!space || known(x.z)),
      name: x.name,
    };
  };
  const u = resolve(spec.vectors[0]);
  const v = resolve(spec.vectors[1]);
  const both = u.known && v.known;
  const pr = both ? projectOf(u.p, v.p) : undefined;
  const projName = p.projName ?? `proj${subOf(v.name)} ${u.name}`;
  const perpName = p.perpName ?? `${u.name} − ${projName}`;
  const unit = spec.unit ? ` ${spec.unit}` : '';
  const dims = space ? 3 : 2;
  const cut = (q: V3) => q.slice(0, dims);

  const perpDot = (q: V3) => {
    const d = q.reduce((t, x, i) => t + x * v.p[i]!, 0);
    return Math.abs(d) < 1e-9 ? 0 : d;
  };
  // The flat window holds the origin and every tip; held still while u's tip is dragged.
  const live = (() => {
    const pts = [u.p, v.p, ...(pr ? [pr.proj] : [])];
    const wx = niceWindow(
      pts.map((q) => q[0]),
      7,
    );
    const wy = niceWindow(
      pts.map((q) => q[1]),
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

  // The caption: the dot products, the factor, the projection and the check.
  const lines: string[] = [];
  lines.push(
    u.known ? `${u.name} = ${bracket(cut(u.p))}` : `${u.name} = ?`,
    v.known ? `${v.name} = ${bracket(cut(v.p))}` : `${v.name} = ?`,
  );
  if (both && !pr) lines.push(`${v.name} is the zero vector: there is no line to project onto.`);
  if (pr) {
    const terms = (a: V3, b: V3) =>
      cut(a)
        .map((x, i) => `${short(x)} × ${par(b[i]!)}`)
        .join(' + ');
    lines.push(
      `${u.name}·${v.name} = ${terms(u.p, v.p)} = ${short(pr.dot)}.`,
      `${v.name}·${v.name} = ${short(pr.vv)}, so ${projName} = (${short(pr.dot)} ÷ ${short(pr.vv)})${v.name} = ${bracket(cut(pr.proj))}${unit}.`,
      `${perpName} = ${bracket(cut(pr.perp))}${unit}; (${perpName})·${v.name} = ${short(perpDot(pr.perp))}: square to ${v.name}.`,
    );
    if (pr.dot < 0)
      lines.push(`${u.name}·${v.name} < 0, so the projection points against ${v.name}.`);
    if (space)
      lines.push(`|${v.name}| = ${short(len3(v.p))} and |${perpName}| = ${short(len3(pr.perp))}.`);
  }

  return space ? inSpace() : flat();

  /** On a grid in the plane. */
  function flat() {
    const ws = win.value;
    const ids = [spec.vectors[0].x, spec.vectors[0].y].filter(
      (x): x is string => typeof x === 'string',
    );
    const canDrag = !spec.fixed && !polar(spec.vectors[0]) && ids.length > 0 && u.known;
    return (
      <View>
        <Canvas aspect={Math.max(0.62, Math.min(1.1, (ws.y.hi - ws.y.lo) / (ws.x.hi - ws.x.lo)))}>
          {({ w, h }) => {
            const f = makeFrame(w, h, [ws.x.lo, ws.x.hi], [ws.y.lo, ws.y.hi], true, true);
            const P = (q: V3) => ({ x: f.sx(q[0]), y: f.sy(q[1]) });
            const o = P([0, 0, 0]);
            const [U, Vt] = [P(u.p), P(v.p)];
            const Pr = pr ? P(pr.proj) : undefined;
            // Labels keep clear of every arrow and the dashed part.
            const L = labelPlacer(w, h, [
              ...(u.known ? along(o, U) : []),
              ...(v.known ? along(o, Vt) : []),
              ...(Pr ? [...along(o, Pr), ...along(Pr, U)] : []),
            ]);
            // v's line through the origin, out to the window's edges both ways.
            const vd = unit2(v.p[0], v.p[1]);
            const edge = (sgn: number) => {
              const ts = [
                vd.x ? (sgn * vd.x > 0 ? ws.x.hi : ws.x.lo) / vd.x : Infinity,
                vd.y ? (sgn * vd.y > 0 ? ws.y.hi : ws.y.lo) / vd.y : Infinity,
              ].map(Math.abs);
              const t = sgn * Math.min(...ts);
              return { x: f.sx(vd.x * t), y: f.sy(vd.y * t) };
            };
            const [a1, a2] = v.known && (vd.x || vd.y) ? [edge(-1), edge(1)] : [o, o];
            const Lab = (text: string, at: { x: number; y: number }, color: string) => {
              const s = L.put(text, around(at.x, at.y, 10));
              return (
                <MathChip x={s.x} y={s.y} text={text} w={w} h={h} color={color} anchor={s.anchor} />
              );
            };
            const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
              x: (a.x + b.x) / 2,
              y: (a.y + b.y) / 2,
            });
            // Placed before the grid, so no axis number sits under a label.
            const labels = [
              u.known ? Lab(u.name, U, c.chartHighlight) : null,
              v.known ? Lab(v.name, Vt, c.hopBack) : null,
              pr && Pr
                ? Lab(`${projName} = ${bracket(cut(pr.proj))}`, mid(o, Pr), c.vectorResultant)
                : null,
              pr && Pr && Math.hypot(U.x - Pr.x, U.y - Pr.y) > 14
                ? Lab(perpName, mid(Pr, U), c.lineUpright)
                : null,
            ].map((x, i) => (x ? <G key={i}>{x}</G> : null));
            return (
              <>
                <Svg width={w} height={h}>
                  <HsdGrid
                    f={f}
                    step={{ x: ws.step, y: ws.step }}
                    names={spec.axes ?? { x: 'x', y: 'y' }}
                    clear={[
                      ...(canDrag ? [handleBox(U.x, U.y)] : []),
                      ...L.boxes.map((b) => ({ l: b.left, t: b.top, r: b.right, b: b.bottom })),
                    ]}
                  />
                  {v.known ? (
                    <Line
                      x1={a1.x}
                      y1={a1.y}
                      x2={a2.x}
                      y2={a2.y}
                      stroke={c.hopBack}
                      strokeWidth={1.5}
                      strokeDasharray={chart.dash}
                      opacity={0.6}
                    />
                  ) : null}
                  {pr && Pr ? (
                    <G>
                      <Vec
                        x1={o.x}
                        y1={o.y}
                        x2={Pr.x}
                        y2={Pr.y}
                        color={c.vectorResultant}
                        width={6}
                        head={13}
                      />
                      <Line
                        x1={Pr.x}
                        y1={Pr.y}
                        x2={U.x}
                        y2={U.y}
                        stroke={c.lineUpright}
                        strokeWidth={2.5}
                        strokeDasharray={chart.dash}
                      />
                      {Math.hypot(U.x - Pr.x, U.y - Pr.y) > 14 &&
                      Math.hypot(Pr.x - o.x, Pr.y - o.y) > 4 ? (
                        <RightAngle
                          x={Pr.x}
                          y={Pr.y}
                          a={unit2(o.x - Pr.x, o.y - Pr.y)}
                          b={unit2(U.x - Pr.x, U.y - Pr.y)}
                          color={c.chartInk}
                        />
                      ) : null}
                    </G>
                  ) : null}
                  {/* v on top of the projection, which lies along it. */}
                  {v.known ? (
                    <Vec x1={o.x} y1={o.y} x2={Vt.x} y2={Vt.y} color={c.hopBack} width={2.5} />
                  ) : null}
                  {u.known ? (
                    <Vec x1={o.x} y1={o.y} x2={U.x} y2={U.y} color={c.chartHighlight} />
                  ) : null}
                  {labels}
                </Svg>
                {canDrag ? (
                  <DragHandle
                    testID="drag-first-tip"
                    x={U.x}
                    y={U.y}
                    label={`the tip of ${u.name}`}
                    onStart={() => {
                      drag.current = { x: u.p[0], y: u.p[1] };
                      win.freeze();
                    }}
                    onMove={(dx, dy) => {
                      const clamp = (x: number, lo: number, hi: number) =>
                        Math.min(hi, Math.max(lo, x));
                      const nx = clamp(drag.current.x + dx / f.ux, ws.x.lo, ws.x.hi);
                      const ny = clamp(drag.current.y - dy / f.uy, ws.y.lo, ws.y.hi);
                      const next: Values = {};
                      const put = (id: number | string | undefined, x: number) => {
                        if (typeof id === 'string') next[id] = rep.snapTo(id, x * rep.factor(id));
                      };
                      put(spec.vectors[0].x, nx);
                      put(spec.vectors[0].y, ny);
                      const others = [spec.vectors[1]?.x, spec.vectors[1]?.y].filter(
                        (x): x is string => typeof x === 'string',
                      );
                      calc.set({ ...rep.pin(spec.keep ?? others), ...next }, rep.slide(ids[0]!));
                    }}
                    onEnd={win.release}
                  />
                ) : null}
              </>
            );
          }}
        </Canvas>
        <Caption>{lines.join(' · ')}</Caption>
      </View>
    );
  }

  /** On x, y, z axes seen from above and to one side. */
  function inSpace() {
    const pts: V3[] = [[0, 0, 0], u.p, v.p, ...(pr ? [pr.proj, pr.perp] : [])];
    const view = bestView([u.p, v.p, ...(pr ? [pr.perp, sub3(u.p, pr.proj)] : [])]);
    const reach = Math.max(1, ...pts.flatMap((q) => q.map(Math.abs)));
    const L = reach * 1.25;
    const axes: [V3, string][] = [
      [[L, 0, 0], 'x'],
      [[0, L, 0], 'y'],
      [[0, 0, L], 'z'],
    ];
    const all = [
      ...pts,
      ...axes.map((a) => a[0]),
      [-reach * 0.3, -reach * 0.3, -reach * 0.3] as V3,
    ];
    return (
      <View>
        <Canvas aspect={0.86}>
          {({ w, h }) => {
            const ps = all.map(view);
            const [x0, x1] = [Math.min(...ps.map((q) => q.x)), Math.max(...ps.map((q) => q.x))];
            const [y0, y1] = [Math.min(...ps.map((q) => q.y)), Math.max(...ps.map((q) => q.y))];
            const m = 28;
            const k = Math.min((w - 2 * m) / (x1 - x0), (h - 2 * m) / (y1 - y0));
            const ox = (w - k * (x1 - x0)) / 2 - k * x0;
            const oy = (h + k * (y1 - y0)) / 2 + k * y0;
            const S = (q: V3) => {
              const s = view(q);
              return { x: ox + k * s.x, y: oy - k * s.y };
            };
            const o = S([0, 0, 0]);
            const [U, Vt] = [S(u.p), S(v.p)];
            const Pr = pr ? S(pr.proj) : undefined;
            const Q = pr ? S(pr.perp) : undefined;
            const Lb = labelPlacer(w, h, [
              ...(u.known ? along(o, U) : []),
              ...(v.known ? along(o, Vt) : []),
              ...(Pr && Q ? [...along(o, Pr), ...along(Pr, U), ...along(o, Q)] : []),
            ]);
            const Lab = (text: string, at: { x: number; y: number }, color: string) => {
              const s = Lb.put(text, around(at.x, at.y, 9));
              return (
                <MathChip x={s.x} y={s.y} text={text} w={w} h={h} color={color} anchor={s.anchor} />
              );
            };
            const floor = (q: V3, color: string) => {
              const [a, b] = [S(q), S([q[0], q[1], 0])];
              return Math.abs(q[2]) > 1e-9 ? (
                <Line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={color}
                  strokeWidth={1}
                  strokeDasharray={chart.dashFine}
                  opacity={0.7}
                />
              ) : null;
            };
            return (
              <Svg width={w} height={h}>
                {axes.map(([e, name]) => {
                  const [a, b] = [S([-e[0] * 0.25, -e[1] * 0.25, -e[2] * 0.25]), S(e)];
                  return (
                    <G key={name}>
                      <Vec
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        color={c.chartMuted}
                        width={1.5}
                        head={8}
                      />
                      {Lab(name, b, c.chartMuted)}
                    </G>
                  );
                })}
                {u.known ? floor(u.p, c.chartHighlight) : null}
                {v.known ? floor(v.p, c.hopBack) : null}
                {v.known ? (
                  <Line
                    x1={S([-v.p[0] * 0.4, -v.p[1] * 0.4, -v.p[2] * 0.4]).x}
                    y1={S([-v.p[0] * 0.4, -v.p[1] * 0.4, -v.p[2] * 0.4]).y}
                    x2={S([v.p[0] * 1.5, v.p[1] * 1.5, v.p[2] * 1.5]).x}
                    y2={S([v.p[0] * 1.5, v.p[1] * 1.5, v.p[2] * 1.5]).y}
                    stroke={c.hopBack}
                    strokeWidth={1.5}
                    strokeDasharray={chart.dash}
                    opacity={0.6}
                  />
                ) : null}
                {pr && Pr && Q ? (
                  <G>
                    <Vec
                      x1={o.x}
                      y1={o.y}
                      x2={Pr.x}
                      y2={Pr.y}
                      color={c.vectorResultant}
                      width={4}
                    />
                    <Line
                      x1={Pr.x}
                      y1={Pr.y}
                      x2={U.x}
                      y2={U.y}
                      stroke={c.lineUpright}
                      strokeWidth={2}
                      strokeDasharray={chart.dash}
                    />
                    <Vec x1={o.x} y1={o.y} x2={Q.x} y2={Q.y} color={c.lineUpright} />
                    {len3(pr.proj) > 1e-9 && len3(pr.perp) > 1e-9 ? (
                      <RightAngle
                        x={Pr.x}
                        y={Pr.y}
                        a={unit2(o.x - Pr.x, o.y - Pr.y)}
                        b={unit2(U.x - Pr.x, U.y - Pr.y)}
                        color={c.chartInk}
                      />
                    ) : null}
                  </G>
                ) : null}
                {v.known ? (
                  <Vec x1={o.x} y1={o.y} x2={Vt.x} y2={Vt.y} color={c.hopBack} width={2.5} />
                ) : null}
                {u.known ? (
                  <Vec x1={o.x} y1={o.y} x2={U.x} y2={U.y} color={c.chartHighlight} />
                ) : null}
                {u.known ? Lab(u.name, U, c.chartHighlight) : null}
                {v.known ? Lab(v.name, Vt, c.hopBack) : null}
                {pr && Pr && len3(pr.proj) > 1e-9 ? Lab(projName, Pr, c.vectorResultant) : null}
                {pr && Q ? Lab(perpName, Q, c.lineUpright) : null}
              </Svg>
            );
          }}
        </Canvas>
        <Caption>{lines.join(' · ')}</Caption>
      </View>
    );
  }
}
