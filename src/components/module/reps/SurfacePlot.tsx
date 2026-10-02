/**
 * HC46 `surfacePlot` (college round 3, group B): z = f(x, y) over a window on the `vectorDiagram`
 * `space` camera (drag the turn handle to spin it), with a point's traces and slopes, the tangent
 * plane, the critical point, prisms over a box; or the top view with level curves, ∇f, a
 * direction and a constraint line. Every number from the page; a "?" draws nothing for its part.
 * A diagram, so flat: the surface shaded only by how it faces the light.
 */
import { type ReactElement } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { SurfacePlotSpec } from '@/data/modules/typesHe3b';
import { exprNamesHe3b } from '@/data/modules/typesHe3b';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import { formulaText, surfaceOf } from './exprDiffHe3b';
import { Arrow } from './graphKit';
import { niceStep } from './hsdGrid';
import { short } from './hsdKit';
import { labeler, linePath, polyPath, TurnTrack, useSpaceTurn } from './spaceKitHe3b';
import { criticalOf, levelSegments, levelsOf, prismsOf } from './surfaceMathHe3b';
import { cross3, dot3, len3, sub3, type V3 } from './vectorSpace';

/** A number for a label: 4 figures, minus as −. */
const say = (x: number) =>
  Math.abs(x) < 1e-9 ? '0' : String(Number(x.toPrecision(4))).replace('-', '−');
const par = (x: number) => (x < 0 ? `(${say(x)})` : say(x));
const TYPE_NAME = { min: 'a minimum', max: 'a maximum', saddle: 'a saddle point', flat: 'flat' };

export function SurfacePlot({ spec, calc }: { spec: SurfacePlotSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const turn = useSpaceTurn(32);
  const num = (v: number | string) => (typeof v === 'number' ? v : rep.val(v));
  const known = (v: number | string | undefined) =>
    v === undefined || typeof v === 'number' || rep.known(v);
  const name = spec.name ?? 'f';
  const names = exprNamesHe3b(spec.f, ['x', 'y']);
  const fKnown = names.every((n) => rep.known(n));
  const S = surfaceOf(spec.f, (n) => rep.val(n));
  const env = Object.fromEntries(names.map((n) => [n, rep.val(n)]));
  const contour = spec.view === 'contour';

  const pt =
    spec.point && known(spec.point.x) && known(spec.point.y)
      ? { x: num(spec.point.x), y: num(spec.point.y) }
      : undefined;
  const crit = spec.critical && S ? criticalOf(S, 0, 0) : undefined;
  const R = spec.region;
  const reg =
    R && [R.a, R.b, R.c, R.d].every(known)
      ? {
          a: num(R.a),
          b: num(R.b),
          c: num(R.c),
          d: num(R.d),
          n:
            R.boxes === undefined
              ? 4
              : known(R.boxes)
                ? Math.max(1, Math.min(12, Math.round(num(R.boxes))))
                : 0,
        }
      : undefined;

  // The window: as the page sets it, the region, or round the point or the critical point.
  const center = spec.point
    ? [num(spec.point.x), num(spec.point.y)]
    : crit
      ? [crit.x, crit.y]
      : [0, 0];
  const half = Math.max(2, 0.6 * Math.max(Math.abs(center[0]!), Math.abs(center[1]!)));
  const live = {
    x: (spec.x
      ? [num(spec.x[0]), num(spec.x[1])]
      : R
        ? [num(R.a), num(R.b)]
        : [center[0]! - half, center[0]! + half]) as [number, number],
    y: (spec.y
      ? [num(spec.y[0]), num(spec.y[1])]
      : R
        ? [num(R.c), num(R.d)]
        : [center[1]! - half, center[1]! + half]) as [number, number],
  };
  const frozen = useFrozen<typeof live | undefined>(undefined);
  const win = frozen.value ?? live;
  const [[x0, x1], [y0, y1]] = [win.x, win.y];
  const okWin = x1 > x0 && y1 > y0 && [x0, x1, y0, y1].every(Number.isFinite);

  const at =
    pt && S && fKnown
      ? { ...pt, z: S.f(pt.x, pt.y), fx: S.fx(pt.x, pt.y), fy: S.fy(pt.x, pt.y) }
      : undefined;
  const prisms =
    reg && reg.n && S && fKnown ? prismsOf(S.f, reg.a, reg.b, reg.c, reg.d, reg.n) : undefined;

  // Caption.
  const lines: string[] = [];
  lines.push(`${name}(x, y) = ${fKnown ? formulaText(spec.f, env, ['x', 'y']) : '?'}.`);
  if (spec.point) {
    if (!at) lines.push('The point: ?');
    else {
      lines.push(
        `At (${say(at.x)}, ${say(at.y)}): ${name} = ${say(at.z)}, ∂${name}/∂x = ${say(at.fx)} and ∂${name}/∂y = ${say(at.fy)}.`,
        `|∇${name}| = √(${par(at.fx)}² + ${par(at.fy)}²) = ${say(Math.hypot(at.fx, at.fy))}.`,
      );
      if (spec.tangentPlane && !contour)
        lines.push(
          `The tangent plane is z = ${say(at.z)} ${at.fx < 0 ? '−' : '+'} ${say(Math.abs(at.fx))}(x − ${par(at.x)}) ${at.fy < 0 ? '−' : '+'} ${say(Math.abs(at.fy))}(y − ${par(at.y)}).`,
        );
    }
  }
  if (spec.critical) {
    if (!crit || !fKnown)
      lines.push(fKnown ? `∇${name} is never 0 here.` : 'The critical point: ?');
    else {
      const fxx = S!.fxx(crit.x, crit.y);
      lines.push(
        `∇${name} = 0 at (${say(crit.x)}, ${say(crit.y)}), where D = ${say(fxx)} × ${par(S!.fyy(crit.x, crit.y))} − ${par(S!.fxy(crit.x, crit.y))}² = ${say(crit.D)}${crit.type === 'saddle' ? ' < 0: a saddle point' : crit.type === 'flat' ? ': the test says nothing' : ` > 0 and ∂²${name}/∂x² = ${say(fxx)}: ${TYPE_NAME[crit.type]}`}, ${name} = ${say(crit.z)}.`,
      );
    }
  }
  if (R) {
    if (!prisms || !reg) lines.push('The prisms: ?');
    else {
      const neg = prisms.cells.some((p) => p.h < 0);
      lines.push(
        `${reg.n * reg.n} prisms on bases ${say((reg.b - reg.a) / reg.n)} × ${say((reg.d - reg.c) / reg.n)}, each as tall as ${name} at its base’s middle: they add to ${say(prisms.sum)}${neg ? ' (a prism below the floor counts minus)' : ''}.`,
      );
      if (R.value && rep.known(R.value)) lines.push(`∬ ${name} dA = ${rep.value(R.value, false)}.`);
    }
  }
  const dir =
    spec.direction && known(spec.direction.x) && known(spec.direction.y)
      ? { p: num(spec.direction.x), q: num(spec.direction.y) }
      : undefined;
  const u =
    dir && Math.hypot(dir.p, dir.q) > 0
      ? [dir.p / Math.hypot(dir.p, dir.q), dir.q / Math.hypot(dir.p, dir.q)]
      : undefined;
  if (spec.direction) {
    if (!u || !at) lines.push('The direction: ?');
    else
      lines.push(
        `u = ⟨${say(dir!.p)}, ${say(dir!.q)}⟩ ÷ ${say(Math.hypot(dir!.p, dir!.q))} = ⟨${say(u[0]!)}, ${say(u[1]!)}⟩, so Dᵤ${name} = ∇${name} · u = ${say(at.fx)} × ${par(u[0]!)} + ${say(at.fy)} × ${par(u[1]!)} = ${say(at.fx * u[0]! + at.fy * u[1]!)}, at most |∇${name}| = ${say(Math.hypot(at.fx, at.fy))}.`,
      );
  }
  const K = spec.constraint;
  const con =
    K && known(K.p) && known(K.q) && known(K.k)
      ? { p: num(K.p), q: num(K.q), k: num(K.k) }
      : undefined;
  if (K) {
    if (!con) lines.push('The constraint: ?');
    else if (at) {
      const lam = Math.abs(con.p) > 1e-12 ? at.fx / con.p : at.fy / con.q;
      const along =
        Math.abs(at.fx * con.q - at.fy * con.p) < 1e-6 * Math.max(1, Math.hypot(at.fx, at.fy));
      lines.push(
        along
          ? `∇${name} = ⟨${say(at.fx)}, ${say(at.fy)}⟩ = ${say(lam)} × ⟨${say(con.p)}, ${say(con.q)}⟩, so λ = ${say(lam)}: the level curve ${name} = ${say(at.z)} touches the line.`
          : `∇${name} = ⟨${say(at.fx)}, ${say(at.fy)}⟩ is not along ⟨${say(con.p)}, ${say(con.q)}⟩: the level curve crosses the line here.`,
      );
    }
  }

  // Heights: z squeezed when the surface rises much more than the window is wide.
  const zs: number[] = [0];
  if (S && fKnown && okWin)
    for (let i = 0; i <= 16; i++)
      for (let j = 0; j <= 16; j++) {
        const z = S.f(x0 + ((x1 - x0) * i) / 16, y0 + ((y1 - y0) * j) / 16);
        if (Number.isFinite(z)) zs.push(z);
      }
  if (prisms) zs.push(...prisms.cells.map((p) => p.h));
  const [zlo, zhi] = [Math.min(...zs), Math.max(...zs)];
  const span = Math.max(x1 - x0, y1 - y0);
  const squeeze = zhi - zlo > 1.2 * span ? span / (zhi - zlo) : 1;
  if (!contour && squeeze < 1)
    lines.push(
      `Heights are squeezed to fit: one unit of z is drawn ${String(Number(squeeze.toPrecision(2)))} as long as one of x or y.`,
    );

  const keep = [...names, ...(spec.keep ?? [])];
  const dragId = (v: number | string | undefined) => (typeof v === 'string' ? v : undefined);
  const [dxId, dyId] = [dragId(spec.point?.x), dragId(spec.point?.y)];
  const canDrag = contour && !spec.fixed && !!at && !!dxId && !!dyId;

  return (
    <View>
      <Canvas aspect={contour ? Math.min(1.1, Math.max(0.6, (y1 - y0) / (x1 - x0 || 1))) : 0.9}>
        {({ w: W, h: H }) => (contour ? drawContour(W, H) : drawSurface(W, H))}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );

  function drawSurface(W: number, H: number) {
    const s = (x: number, y: number, z: number): V3 => [x, y, z * squeeze];
    const corners: V3[] = [
      s(x0, y0, zlo),
      s(x1, y0, zlo),
      s(x0, y1, zlo),
      s(x1, y1, zlo),
      s(x0, y0, zhi),
      s(x1, y1, zhi),
      s(x1, y0, zhi),
      s(x0, y1, zhi),
    ];
    const cam = turn.camera(W, H, corners);
    const { P } = cam;
    const lab = labeler(W, H);
    lab.block({ left: W - 56, right: W, top: H - 40, bottom: H });
    const a = (cam.turn * Math.PI) / 180;
    const e = (22 * Math.PI) / 180;
    const toward: V3 = [Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e)];
    const seg = (p: V3, q: V3, color: string, width: number, dash?: string, key?: string) => {
      const [m, n] = [P(p), P(q)];
      return (
        <Line
          key={key}
          x1={m.x}
          y1={m.y}
          x2={n.x}
          y2={n.y}
          stroke={color}
          strokeWidth={width}
          strokeDasharray={dash}
        />
      );
    };

    // The floor: the window at z = 0 with a light grid, and the axes along its edges.
    const floor: ReactElement[] = [];
    const st = niceStep(span / 4);
    for (let x = Math.ceil(x0 / st) * st; x <= x1 + 1e-9; x += st)
      floor.push(seg(s(x, y0, 0), s(x, y1, 0), c.chartGrid, 1, undefined, `gx${x}`));
    for (let y = Math.ceil(y0 / st) * st; y <= y1 + 1e-9; y += st)
      floor.push(seg(s(x0, y, 0), s(x1, y, 0), c.chartGrid, 1, undefined, `gy${y}`));
    const ax = Math.min(x1, Math.max(x0, 0));
    const ay = Math.min(y1, Math.max(y0, 0));
    const axes: ReactElement[] = [];
    const arrow = (p: V3, q: V3, key: string) => (
      <Arrow
        key={key}
        x1={P(p).x}
        y1={P(p).y}
        x2={P(q).x}
        y2={P(q).y}
        color={c.chartInk}
        width={chart.strokeLight}
      />
    );
    const over = 0.12 * span;
    axes.push(arrow(s(x0, ay, 0), s(x1 + over, ay, 0), 'ax'));
    axes.push(arrow(s(ax, y0, 0), s(ax, y1 + over, 0), 'ay'));
    axes.push(arrow(s(ax, ay, Math.min(0, zlo)), [ax, ay, zhi * squeeze + over], 'az'));

    // Prisms over the region, far first, the faces that face the reader.
    const boxes: ReactElement[] = [];
    if (prisms) {
      const order = [...prisms.cells].sort(
        (p, q) =>
          cam.depth(s((p.x0 + p.x1) / 2, (p.y0 + p.y1) / 2, 0)) -
          cam.depth(s((q.x0 + q.x1) / 2, (q.y0 + q.y1) / 2, 0)),
      );
      order.forEach((b, i) => {
        const [lo, hi] = b.h < 0 ? [b.h, 0] : [0, b.h];
        const color = b.h < 0 ? c.regionMinus : c.regionPlus;
        const faces: [V3[], number][] = [];
        const top = b.h < 0 ? lo : hi;
        faces.push([
          [s(b.x0, b.y0, top), s(b.x1, b.y0, top), s(b.x1, b.y1, top), s(b.x0, b.y1, top)],
          0.55,
        ]);
        const fx = toward[0] > 0 ? b.x1 : b.x0;
        faces.push([[s(fx, b.y0, lo), s(fx, b.y1, lo), s(fx, b.y1, hi), s(fx, b.y0, hi)], 0.4]);
        const fy = toward[1] > 0 ? b.y1 : b.y0;
        faces.push([[s(b.x0, fy, lo), s(b.x1, fy, lo), s(b.x1, fy, hi), s(b.x0, fy, hi)], 0.3]);
        boxes.push(
          <G key={`b${i}`}>
            {faces.map(([f, o], k) => (
              <Path
                key={k}
                d={polyPath(f.map(P))}
                fill={color}
                fillOpacity={o}
                stroke={color}
                strokeWidth={0.8}
              />
            ))}
          </G>,
        );
      });
    }

    // The surface: quads far first, each shaded by how squarely it faces the light.
    const quads: ReactElement[] = [];
    if (S && fKnown && okWin) {
      const n = 18;
      const list: { pts: V3[]; depth: number; shade: number }[] = [];
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const xs = [x0 + ((x1 - x0) * i) / n, x0 + ((x1 - x0) * (i + 1)) / n];
          const ys = [y0 + ((y1 - y0) * j) / n, y0 + ((y1 - y0) * (j + 1)) / n];
          const pts = [
            s(xs[0]!, ys[0]!, S.f(xs[0]!, ys[0]!)),
            s(xs[1]!, ys[0]!, S.f(xs[1]!, ys[0]!)),
            s(xs[1]!, ys[1]!, S.f(xs[1]!, ys[1]!)),
            s(xs[0]!, ys[1]!, S.f(xs[0]!, ys[1]!)),
          ];
          if (pts.some((p) => !Number.isFinite(p[2]))) continue;
          const nrm = cross3(sub3(pts[1]!, pts[0]!), sub3(pts[3]!, pts[0]!));
          const ln = len3(nrm) || 1;
          const shade = 0.5 * Math.abs(nrm[2] / ln) + 0.5 * Math.abs(dot3(nrm, toward) / ln);
          list.push({
            pts,
            depth:
              cam.depth(s((xs[0]! + xs[1]!) / 2, (ys[0]! + ys[1]!) / 2, 0)) + pts[0]![2] * 0.001,
            shade,
          });
        }
      list.sort((p, q) => p.depth - q.depth);
      const base = prisms ? 0.12 : 0.3;
      list.forEach((q, i) =>
        quads.push(
          <Path
            key={`q${i}`}
            d={polyPath(q.pts.map(P))}
            fill={c.surfaceFill}
            fillOpacity={base + (prisms ? 0.15 : 0.45) * q.shade}
            stroke={c.surfaceMesh}
            strokeOpacity={prisms ? 0.25 : 0.4}
            strokeWidth={0.6}
          />,
        ),
      );
    }

    // The point, its traces and slopes, and the tangent plane.
    const marks: ReactElement[] = [];
    const labels: ReactElement[] = [];
    if (at && S) {
      const z = at.z;
      const h = 0.28 * span;
      if (spec.tangentPlane) {
        const pc = [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
        ].map(([i, j]) => s(at.x + i! * h, at.y + j! * h, z + at.fx * i! * h + at.fy * j! * h));
        marks.push(
          <Path
            key="tp"
            d={polyPath(pc.map(P))}
            fill={c.planeFill}
            fillOpacity={0.28}
            stroke={c.planeFill}
            strokeWidth={1.2}
          />,
        );
      }
      if (spec.point?.traces !== false) {
        const tr = (f: (t: number) => V3, t0: number, t1: number) =>
          Array.from({ length: 41 }, (_, i) => f(t0 + ((t1 - t0) * i) / 40)).filter((p) =>
            Number.isFinite(p[2]),
          );
        const xt = tr((x) => s(x, at.y, S.f(x, at.y)), x0, x1);
        const yt = tr((y) => s(at.x, y, S.f(at.x, y)), y0, y1);
        marks.push(
          <Path
            key="xt"
            d={linePath(xt.map(P))}
            stroke={c.chartHighlight}
            strokeWidth={2.5}
            fill="none"
          />,
          <Path
            key="yt"
            d={linePath(yt.map(P))}
            stroke={c.hopBack}
            strokeWidth={2.5}
            fill="none"
          />,
          seg(
            s(at.x - h, at.y, z - at.fx * h),
            s(at.x + h, at.y, z + at.fx * h),
            c.chartHighlight,
            2,
            chart.dash,
            'tx',
          ),
          seg(
            s(at.x, at.y - h, z - at.fy * h),
            s(at.x, at.y + h, z + at.fy * h),
            c.hopBack,
            2,
            chart.dash,
            'ty',
          ),
        );
        const ex = P(s(at.x + h, at.y, z + at.fx * h));
        const ey = P(s(at.x, at.y + h, z + at.fy * h));
        const O = P(s(at.x, at.y, z));
        labels.push(
          lab.label(
            ex,
            { x: ex.x - O.x, y: ex.y - O.y },
            `${name}_x = ${say(at.fx)}`,
            c.chartHighlight,
            'lfx',
          ),
          lab.label(
            ey,
            { x: ey.x - O.x, y: ey.y - O.y },
            `${name}_y = ${say(at.fy)}`,
            c.hopBack,
            'lfy',
          ),
        );
      }
      const p = P(s(at.x, at.y, z));
      const f = P(s(at.x, at.y, 0));
      marks.push(
        seg(s(at.x, at.y, z), s(at.x, at.y, 0), c.chartInk, 1, chart.dashFine, 'drop'),
        <Circle key="fp" cx={f.x} cy={f.y} r={3} fill={c.chartInk} />,
        <Circle
          key="pp"
          cx={p.x}
          cy={p.y}
          r={5.5}
          fill={c.vectorResultant}
          stroke={c.card}
          strokeWidth={1.5}
        />,
      );
      lab.block({ left: p.x - 6, right: p.x + 6, top: p.y - 6, bottom: p.y + 6 });
      labels.push(
        lab.label(
          p,
          { x: 0, y: -1 },
          `(${say(at.x)}, ${say(at.y)}, ${say(z)})`,
          c.vectorResultant,
          'lp',
        ),
      );
    }
    if (crit && fKnown && spec.critical) {
      const p = P(s(crit.x, crit.y, crit.z));
      marks.push(
        seg(
          s(crit.x, crit.y, crit.z),
          s(crit.x, crit.y, 0),
          c.chartInk,
          1,
          chart.dashFine,
          'cdrop',
        ),
        <Circle
          key="cp"
          cx={p.x}
          cy={p.y}
          r={5.5}
          fill={c.vectorResultant}
          stroke={c.card}
          strokeWidth={1.5}
        />,
      );
      lab.block({ left: p.x - 6, right: p.x + 6, top: p.y - 6, bottom: p.y + 6 });
      labels.push(
        lab.label(
          p,
          { x: 0, y: crit.type === 'min' ? 1 : -1 },
          `${crit.type} (${say(crit.x)}, ${say(crit.y)}, ${say(crit.z)})`,
          c.vectorResultant,
          'lc',
        ),
      );
    }

    // Axis names and the window's ends.
    const tipX = P(s(x1 + over, ay, 0));
    const tipY = P(s(ax, y1 + over, 0));
    const tipZ = P([ax, ay, zhi * squeeze + over]);
    const O = P(s(ax, ay, 0));
    const axisLabels = [
      lab.label(tipX, { x: tipX.x - O.x, y: tipX.y - O.y }, 'x', c.chartInk, 'nx', 9),
      lab.label(tipY, { x: tipY.x - O.x, y: tipY.y - O.y }, 'y', c.chartInk, 'ny', 9),
      lab.label(tipZ, { x: 0, y: -1 }, 'z', c.chartInk, 'nz', 9),
      lab.label(P(s(x1, ay, 0)), { x: 0, y: 1 }, say(x1), c.chartMuted, 'vx'),
      lab.label(P(s(ax, y1, 0)), { x: 0, y: 1 }, say(y1), c.chartMuted, 'vy'),
      ...(zhi > 0
        ? [
            lab.label(
              P([ax, ay, zhi * squeeze]),
              { x: -1, y: 0 },
              `z = ${say(zhi)}`,
              c.chartMuted,
              'vz',
            ),
          ]
        : []),
    ];

    return (
      <>
        <Svg width={W} height={H}>
          {floor}
          {boxes}
          {axes}
          {quads}
          {marks}
          {axisLabels}
          {labels}
          <TurnTrack W={W} H={H} />
        </Svg>
        {turn.handle(W, H)}
      </>
    );
  }

  function drawContour(W: number, H: number) {
    const m = { l: 34, r: 12, t: 12, b: 26 };
    const k = Math.min((W - m.l - m.r) / (x1 - x0), (H - m.t - m.b) / (y1 - y0));
    const ox = m.l + (W - m.l - m.r - (x1 - x0) * k) / 2;
    const oy = m.t + (H - m.t - m.b - (y1 - y0) * k) / 2;
    const X = (x: number) => ox + (x - x0) * k;
    const Y = (y: number) => oy + (y1 - y) * k;
    const lab = labeler(W, H);
    const els: ReactElement[] = [];
    const st = niceStep((x1 - x0) / 4);
    const sty = niceStep((y1 - y0) / 4);
    for (let x = Math.ceil(x0 / st) * st; x <= x1 + 1e-9; x += st) {
      els.push(
        <Line
          key={`gx${x}`}
          x1={X(x)}
          y1={Y(y0)}
          x2={X(x)}
          y2={Y(y1)}
          stroke={c.chartGrid}
          strokeWidth={1}
        />,
      );
      lab.block({ left: X(x) - 14, right: X(x) + 14, top: Y(y0) + 4, bottom: Y(y0) + 18 });
    }
    for (let y = Math.ceil(y0 / sty) * sty; y <= y1 + 1e-9; y += sty)
      els.push(
        <Line
          key={`gy${y}`}
          x1={X(x0)}
          y1={Y(y)}
          x2={X(x1)}
          y2={Y(y)}
          stroke={c.chartGrid}
          strokeWidth={1}
        />,
      );
    const ticks: ReactElement[] = [];
    for (let x = Math.ceil(x0 / st) * st; x <= x1 + 1e-9; x += st)
      ticks.push(
        <SmallText key={`tx${x}`} x={X(x)} y={Y(y0) + 15} text={short(x)} anchor="middle" />,
      );
    for (let y = Math.ceil(y0 / sty) * sty; y <= y1 + 1e-9; y += sty)
      ticks.push(
        <SmallText key={`ty${y}`} x={X(x0) - 4} y={Y(y) + 4} text={short(y)} anchor="end" />,
      );
    if (x0 <= 0 && x1 >= 0)
      els.push(
        <Line
          key="ay"
          x1={X(0)}
          y1={Y(y0)}
          x2={X(0)}
          y2={Y(y1)}
          stroke={c.chartInk}
          strokeWidth={chart.strokeLight}
        />,
      );
    if (y0 <= 0 && y1 >= 0)
      els.push(
        <Line
          key="ax"
          x1={X(x0)}
          y1={Y(0)}
          x2={X(x1)}
          y2={Y(0)}
          stroke={c.chartInk}
          strokeWidth={chart.strokeLight}
        />,
      );

    const levels: ReactElement[] = [];
    if (S && fKnown && okWin) {
      const segPath = (segs: [number, number, number, number][]) =>
        segs
          .map(
            ([a, b, cc, d]) =>
              `M ${X(a).toFixed(1)} ${Y(b).toFixed(1)} L ${X(cc).toFixed(1)} ${Y(d).toFixed(1)}`,
          )
          .join(' ');
      levelsOf(S.f, [x0, x1], [y0, y1]).forEach((lv, i) =>
        levels.push(
          <Path
            key={`lv${i}`}
            d={segPath(levelSegments(S.f, [x0, x1], [y0, y1], lv))}
            stroke={c.surfaceFill}
            strokeWidth={1.2}
            fill="none"
          />,
        ),
      );
      if (at)
        levels.push(
          <Path
            key="lvp"
            d={segPath(levelSegments(S.f, [x0, x1], [y0, y1], at.z, 60))}
            stroke={c.chartHighlight}
            strokeWidth={2.5}
            fill="none"
          />,
        );
    }
    if (con) {
      // p·x + q·y = k across the window.
      const ends: [number, number][] = [];
      if (Math.abs(con.q) > 1e-12)
        for (const x of [x0, x1]) {
          const y = (con.k - con.p * x) / con.q;
          if (y >= y0 - 1e-9 && y <= y1 + 1e-9) ends.push([x, y]);
        }
      if (Math.abs(con.p) > 1e-12)
        for (const y of [y0, y1]) {
          const x = (con.k - con.q * y) / con.p;
          if (x >= x0 - 1e-9 && x <= x1 + 1e-9) ends.push([x, y]);
        }
      if (ends.length >= 2) {
        const [a, b] = [ends[0]!, ends[ends.length - 1]!];
        levels.push(
          <Line
            key="con"
            x1={X(a[0])}
            y1={Y(a[1])}
            x2={X(b[0])}
            y2={Y(b[1])}
            stroke={c.lineUpright}
            strokeWidth={2}
            strokeDasharray={chart.dash}
          />,
        );
        const mid = { x: X((a[0] + b[0]) / 2), y: Y((a[1] + b[1]) / 2) };
        const text =
          formulaText('p*x + q*y', { p: con.p, q: con.q }, ['x', 'y']) + ` = ${say(con.k)}`;
        levels.push(
          lab.label(mid, { x: con.p, y: -con.q }, text.replace('·', ''), c.lineUpright, 'lcon'),
        );
      }
    }
    const marks: ReactElement[] = [];
    if (at) {
      const p = { x: X(at.x), y: Y(at.y) };
      const g = Math.hypot(at.fx, at.fy);
      const L = 0.24 * Math.min(W - m.l - m.r, H - m.t - m.b);
      lab.block({ left: p.x - 7, right: p.x + 7, top: p.y - 7, bottom: p.y + 7 });
      if (g > 1e-12) {
        const [gx, gy] = [at.fx / g, -at.fy / g];
        const tip = { x: p.x + gx * L, y: p.y + gy * L };
        // The right angle between ∇f and the level curve's tangent (−f_y, f_x).
        const sq = 8;
        const [tx, ty] = [-gy, gx];
        marks.push(
          <Path
            key="sq"
            d={`M ${p.x + gx * sq} ${p.y + gy * sq} L ${p.x + (gx + tx) * sq} ${p.y + (gy + ty) * sq} L ${p.x + tx * sq} ${p.y + ty * sq}`}
            stroke={c.chartInk}
            strokeWidth={1}
            fill="none"
          />,
          <Arrow
            key="grad"
            x1={p.x}
            y1={p.y}
            x2={tip.x}
            y2={tip.y}
            color={c.vectorResultant}
            width={chart.strokeHeavy}
          />,
        );
        marks.push(
          lab.label(
            tip,
            { x: gx, y: gy },
            `∇${name} = ⟨${say(at.fx)}, ${say(at.fy)}⟩`,
            c.vectorResultant,
            'lg',
          ),
        );
      }
      if (u) {
        const tip = { x: p.x + u[0]! * L * 0.75, y: p.y - u[1]! * L * 0.75 };
        marks.push(
          <Arrow
            key="u"
            x1={p.x}
            y1={p.y}
            x2={tip.x}
            y2={tip.y}
            color={c.hopBack}
            width={chart.stroke}
          />,
          lab.label(
            tip,
            { x: u[0]!, y: -u[1]! },
            `u = ⟨${say(u[0]!)}, ${say(u[1]!)}⟩`,
            c.hopBack,
            'lu',
          ),
        );
      }
      marks.push(
        <Circle
          key="pt"
          cx={p.x}
          cy={p.y}
          r={5}
          fill={c.chartHighlight}
          stroke={c.card}
          strokeWidth={1.5}
        />,
        lab.label(p, { x: -1, y: 1 }, `${name} = ${say(at.z)}`, c.chartHighlight, 'lv'),
      );
    }
    if (crit && fKnown && spec.critical) {
      const p = { x: X(crit.x), y: Y(crit.y) };
      marks.push(
        <Circle
          key="cp"
          cx={p.x}
          cy={p.y}
          r={5}
          fill={c.vectorResultant}
          stroke={c.card}
          strokeWidth={1.5}
        />,
        lab.label(p, { x: 1, y: -1 }, crit.type, c.vectorResultant, 'lc'),
      );
    }
    return (
      <>
        <Svg width={W} height={H}>
          {els}
          {ticks}
          {levels}
          {marks}
          <SmallText x={X(x1) - 2} y={Y(y0) - 4} text="x" anchor="end" italic />
          <SmallText x={X(x0) + 4} y={Y(y1) + 12} text="y" anchor="start" italic />
        </Svg>
        {canDrag ? (
          <DragHandle
            testID="drag-point"
            x={X(at!.x)}
            y={Y(at!.y)}
            label="the point"
            onStart={() => frozen.freezeAt(win)}
            onMove={(ddx, ddy) => {
              const nx = at!.x + ddx / k;
              const ny = at!.y - ddy / k;
              if (!(nx >= x0 && nx <= x1 && ny >= y0 && ny <= y1)) return;
              calc.set(
                {
                  ...rep.pinTyped(keep),
                  [dxId!]: rep.snapTo(dxId!, nx),
                  [dyId!]: rep.snapTo(dyId!, ny),
                },
                rep.slide(dxId!),
              );
            }}
            onEnd={frozen.release}
          />
        ) : null}
      </>
    );
  }
}

/** A tick number or an axis letter. */
function SmallText({
  x,
  y,
  text,
  anchor,
  italic,
}: {
  x: number;
  y: number;
  text: string;
  anchor: 'start' | 'middle' | 'end';
  italic?: boolean;
}) {
  const c = usePalette();
  return (
    <ChartText
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={chart.label}
      fontStyle={italic ? 'italic' : 'normal'}
      fill={italic ? c.chartInk : c.chartMuted}
    >
      {text}
    </ChartText>
  );
}
