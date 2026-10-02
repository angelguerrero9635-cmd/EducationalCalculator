/**
 * HC65 `solidOfRevolution` (college round 3, group B): the region under f (and over g) on
 * [a, b] turned about the x-axis (disks, washers) or the y-axis (shells), seen a little from the
 * side so each circle is an ellipse. The solid is see-through, the region lit on its half-plane,
 * one slice at x = `at` drawn solid with its radii and thickness labelled; drag it along. To
 * scale (one unit is as long across as up). A diagram, so flat.
 */
import { type ReactElement, useRef } from 'react';
import { View } from 'react-native';
import Svg, { Ellipse, G, Line, Path } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import { exprNamesHe3b, type SolidOfRevolutionSpec } from '@/data/modules/typesHe3b';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle, useFrozen, useRep } from './common';
import { curveOfHe3b, formulaText } from './exprDiffHe3b';
import { arrowHead } from './graphKit';
import { solidProblem, solidVolume } from './solidMathHe3b';
import { labeler, linePath } from './spaceKitHe3b';

const say = (x: number) =>
  Math.abs(x) < 1e-9 ? '0' : String(Number(x.toPrecision(4))).replace('-', '−');
/** How round a circle looks seen from a little to the side (its narrow axis ÷ its radius). */
const SIDE = 0.3;

export function SolidOfRevolution({
  spec,
  calc,
}: {
  spec: SolidOfRevolutionSpec;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const drag = useRef(0);
  const num = (v: NumOrVar) => (typeof v === 'number' ? v : rep.val(v));
  const known = (v: NumOrVar | undefined) =>
    v === undefined || typeof v === 'number' || rep.known(v);
  const names = [...exprNamesHe3b(spec.f, ['x']), ...exprNamesHe3b(spec.g, ['x'])];
  const curvesKnown = names.every((n) => rep.known(n));
  const ends = known(spec.from) && known(spec.to);
  const [a, b] = [num(spec.from), num(spec.to)];
  const f = curveOfHe3b(spec.f, (n) => rep.val(n));
  const g = spec.g ? curveOfHe3b(spec.g, (n) => rep.val(n)) : undefined;
  const env = Object.fromEntries(names.map((n) => [n, rep.val(n)]));
  const shell = spec.method === 'shell';
  const ok = curvesKnown && ends && !!f && (!spec.g || !!g);
  const problem = ok ? solidProblem(f!, g, spec.axis, spec.method, a, b) : undefined;
  const draws = ok && !problem;
  const at = spec.at !== undefined && known(spec.at) ? num(spec.at) : undefined;
  const sliceAt = draws && at !== undefined && at >= a - 1e-9 && at <= b + 1e-9 ? at : undefined;
  const V = draws ? solidVolume(f!, g, spec.method, a, b) : undefined;

  // Caption.
  const fText = curvesKnown ? formulaText(spec.f, env, ['x']) : '?';
  const gText = spec.g ? (curvesKnown ? formulaText(spec.g, env, ['x']) : '?') : undefined;
  const lines: string[] = [];
  const ab = ends ? `[${say(a)}, ${say(b)}]` : '[?, ?]';
  lines.push(
    gText
      ? `The region between y = ${fText} and y = ${gText} on ${ab}, turned about the ${spec.axis}-axis.`
      : `The region under y = ${fText} on ${ab}, turned about the ${spec.axis}-axis.`,
  );
  if (problem) lines.push(problem);
  if (sliceAt !== undefined && f) {
    const [R, r] = [f(sliceAt), g ? g(sliceAt) : 0];
    if (spec.method === 'disk' && !g)
      lines.push(
        `At x = ${say(sliceAt)} the slice is a disk of radius f(${say(sliceAt)}) = ${say(R)}, area π × ${say(R)}² = ${say(Math.PI * R * R)}.`,
      );
    else if (!shell)
      lines.push(
        `At x = ${say(sliceAt)} the slice is a washer: R = ${say(Math.abs(R))}, r = ${say(Math.abs(r))}, area π(R² − r²) = ${say(Math.PI * (R * R - r * r))}.`,
      );
    else
      lines.push(
        `The shell at x = ${say(sliceAt)} has radius ${say(sliceAt)} and height ${say(R - r)}: unrolled, a sheet 2π × ${say(sliceAt)} × ${say(R - r)} = ${say(2 * Math.PI * sliceAt * (R - r))} by dx.`,
      );
  }
  const integral = shell
    ? `∫ 2πx(${gText ? 'f − g' : 'f'}) dx`
    : gText
      ? '∫ π(f² − g²) dx'
      : '∫ πf² dx';
  if (draws) {
    const shown =
      spec.volume === undefined
        ? V === undefined
          ? '?'
          : say(V)
        : rep.known(spec.volume)
          ? rep.value(spec.volume, false)
          : '?';
    lines.push(`V = ${integral} from ${say(a)} to ${say(b)} = ${shown}.`);
  }

  // The world's extent: x across, y up (the axis of turning and the radii).
  const R0 = draws
    ? Math.max(
        1e-9,
        ...Array.from({ length: 41 }, (_, i) => {
          const x = a + ((b - a) * i) / 40;
          return Math.max(Math.abs(f!(x)), g ? Math.abs(g(x)) : 0);
        }),
      )
    : 1;
  const live = shell
    ? {
        w: 2 * Math.max(Math.abs(a), Math.abs(b), 1e-9),
        h: R0 + 2 * SIDE * Math.max(Math.abs(b), 1e-9),
      }
    : { w: Math.max(b - a, 1e-9) * 1.25 + 2 * SIDE * R0, h: 2 * R0 };
  const frozen = useFrozen<typeof live | undefined>(undefined);
  const box = frozen.value ?? live;
  const aspect = Math.min(1.15, Math.max(0.55, (box.h * 1.15) / box.w + 0.12));
  const keep = [
    ...names,
    ...[spec.from, spec.to].filter((x): x is string => typeof x === 'string'),
  ];
  const canDrag = !spec.fixed && typeof spec.at === 'string' && sliceAt !== undefined;

  return (
    <View>
      <Canvas aspect={aspect}>{({ w: W, h: H }) => draw(W, H)}</Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );

  function draw(W: number, H: number) {
    const m = { l: 18, r: 30, t: 22, b: 30 };
    const k = Math.min((W - m.l - m.r) / box.w, (H - m.t - m.b) / (box.h || 1));
    const lab = labeler(W, H);
    const els: ReactElement[] = [];
    const marks: ReactElement[] = [];
    const labels: ReactElement[] = [];
    const op = draws ? 1 : 0.35;

    if (!shell) {
      // About the x-axis: the axis across the middle.
      const span = Math.max(b - a, 1e-9);
      const left = m.l + (W - m.l - m.r - box.w * k) / 2 + SIDE * R0 * k;
      const X = (x: number) => left + (x - a) * k;
      const cy = m.t + (H - m.t - m.b) / 2;
      const Y = (y: number) => cy - y * k;
      const xEnd = b + 0.2 * span;
      els.push(
        <Line
          key="ax"
          x1={X(a) - 10}
          y1={cy}
          x2={X(xEnd)}
          y2={cy}
          stroke={c.chartInk}
          strokeWidth={1}
          strokeDasharray={chart.dash}
        />,
        <Path key="axh" d={arrowHead(X(xEnd) + 4, cy, 1, 0, 9)} fill={c.chartInk} />,
      );
      // The turning arrow round the axis, past b.
      const tr = Math.max(10, 0.35 * R0 * k);
      const tx = X(b + 0.12 * span);
      els.push(
        <Path
          key="turn"
          d={`M ${tx} ${cy - tr} A ${SIDE * tr} ${tr} 0 1 1 ${tx} ${cy + tr}`}
          stroke={c.chartMuted}
          strokeWidth={1.5}
          fill="none"
        />,
        <Path key="turnh" d={arrowHead(tx, cy + tr, -1, 0.2, 7)} fill={c.chartMuted} />,
      );
      labels.push(lab.label({ x: X(xEnd) + 6, y: cy }, { x: 1, y: 0 }, 'x', c.chartInk, 'nx', 6));
      if (draws) {
        const N = 80;
        const xs = Array.from({ length: N + 1 }, (_, i) => a + (span * i) / N);
        const top = xs.map((x) => ({ x: X(x), y: Y(Math.abs(f!(x))) }));
        const bottom = xs.map((x) => ({ x: X(x), y: Y(-Math.abs(f!(x))) }));
        els.push(
          <Path
            key="body"
            d={`${linePath(top)} ${linePath([...bottom].reverse()).replace(/^M/, 'L')} Z`}
            fill={c.surfaceFill}
            fillOpacity={0.14}
            stroke={c.surfaceFill}
            strokeWidth={1.5}
          />,
        );
        // Rims every so often, the far ends' circles, and the hole of a washer.
        for (let i = 1; i < 6; i++) {
          const x = a + (span * i) / 6;
          const r = Math.abs(f!(x)) * k;
          els.push(
            <Ellipse
              key={`rim${i}`}
              cx={X(x)}
              cy={cy}
              rx={SIDE * r}
              ry={r}
              fill="none"
              stroke={c.surfaceMesh}
              strokeOpacity={0.3}
              strokeWidth={0.8}
            />,
          );
        }
        for (const [x, key] of [
          [a, 'ea'],
          [b, 'eb'],
        ] as const) {
          const r = Math.abs(f!(x)) * k;
          if (r > 0.5)
            els.push(
              <Ellipse
                key={key}
                cx={X(x)}
                cy={cy}
                rx={SIDE * r}
                ry={r}
                fill={c.surfaceFill}
                fillOpacity={0.12}
                stroke={c.surfaceFill}
                strokeWidth={1.2}
              />,
            );
          if (g) {
            const ri = Math.abs(g(x)) * k;
            if (ri > 0.5)
              els.push(
                <Ellipse
                  key={`${key}i`}
                  cx={X(x)}
                  cy={cy}
                  rx={SIDE * ri}
                  ry={ri}
                  fill={c.card}
                  fillOpacity={0.7}
                  stroke={c.surfaceFill}
                  strokeWidth={1}
                  strokeDasharray={chart.dashFine}
                />,
              );
          }
        }
        if (g) {
          const gi = xs.map((x) => ({ x: X(x), y: Y(Math.abs(g(x))) }));
          const go = xs.map((x) => ({ x: X(x), y: Y(-Math.abs(g(x))) }));
          els.push(
            <Path
              key="hole1"
              d={linePath(gi)}
              stroke={c.surfaceFill}
              strokeWidth={1}
              strokeDasharray={chart.dashFine}
              fill="none"
            />,
            <Path
              key="hole2"
              d={linePath(go)}
              stroke={c.surfaceFill}
              strokeWidth={1}
              strokeDasharray={chart.dashFine}
              fill="none"
            />,
          );
        }
        // The region on its half-plane: between g (or the axis) and f.
        const under = xs.map((x) => ({ x: X(x), y: Y(g ? g(x) : 0) }));
        const fTop = xs.map((x) => ({ x: X(x), y: Y(f!(x)) }));
        els.push(
          <Path
            key="region"
            d={`${linePath(fTop)} ${linePath([...under].reverse()).replace(/^M/, 'L')} Z`}
            fill={c.chartHighlight}
            fillOpacity={0.22}
            stroke="none"
          />,
          <Path
            key="fcurve"
            d={linePath(fTop)}
            stroke={c.chartHighlight}
            strokeWidth={chart.strokeHeavy}
            fill="none"
          />,
        );
        if (g)
          els.push(
            <Path
              key="gcurve"
              d={linePath(under)}
              stroke={c.hopBack}
              strokeWidth={chart.stroke}
              fill="none"
            />,
          );
        const fEnd = { x: X(b), y: Y(f!(b)) };
        labels.push(lab.label(fEnd, { x: 0.3, y: -1 }, `y = ${fText}`, c.chartHighlight, 'lf'));
        if (g && gText) {
          const gm = a + span * 0.7;
          labels.push(
            lab.label({ x: X(gm), y: Y(g(gm)) }, { x: 0.4, y: 1 }, `y = ${gText}`, c.hopBack, 'lg'),
          );
        }
        labels.push(
          lab.label({ x: X(a), y: cy }, { x: -0.4, y: 1 }, say(a), c.chartMuted, 'la'),
          lab.label({ x: X(b), y: cy }, { x: 0.4, y: 1 }, say(b), c.chartMuted, 'lb'),
        );
        // The slice.
        if (sliceAt !== undefined) {
          const R = Math.abs(f!(sliceAt)) * k;
          const r = g ? Math.abs(g(sliceAt)) * k : 0;
          const dx = Math.max(4, (span / 24) * k);
          const x0 = X(sliceAt) - dx / 2;
          const x1 = X(sliceAt) + dx / 2;
          marks.push(
            <G key="slice">
              <Path
                d={`M ${x0} ${cy - R} L ${x1} ${cy - R} A ${SIDE * R} ${R} 0 0 1 ${x1} ${cy + R} L ${x0} ${cy + R} A ${SIDE * R} ${R} 0 0 0 ${x0} ${cy - R} Z`}
                fill={c.sliceFill}
                fillOpacity={0.55}
                stroke={c.sliceFill}
                strokeWidth={1}
              />
              <Ellipse
                cx={x1}
                cy={cy}
                rx={SIDE * R}
                ry={R}
                fill={c.sliceFill}
                fillOpacity={0.85}
                stroke={c.sliceFill}
                strokeWidth={1.2}
              />
              {r > 0.5 ? (
                <Ellipse
                  cx={x1}
                  cy={cy}
                  rx={SIDE * r}
                  ry={r}
                  fill={c.card}
                  stroke={c.sliceFill}
                  strokeWidth={1.2}
                />
              ) : null}
              <Line
                x1={x1}
                y1={cy}
                x2={x1}
                y2={cy - R}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              {r > 0.5 ? (
                <Line
                  x1={x1 + 3}
                  y1={cy}
                  x2={x1 + 3}
                  y2={cy - r}
                  stroke={c.hopBack}
                  strokeWidth={chart.stroke}
                />
              ) : null}
            </G>,
          );
          labels.push(
            lab.label(
              { x: x1, y: cy - R / 2 },
              { x: 1, y: 0 },
              g ? `R = ${say(Math.abs(f!(sliceAt)))}` : `r = f(x) = ${say(Math.abs(f!(sliceAt)))}`,
              c.chartInk,
              'lR',
            ),
          );
          if (g && r > 0.5)
            labels.push(
              lab.label(
                { x: x1, y: cy - r / 2 },
                { x: 1, y: 0.6 },
                `r = ${say(Math.abs(g(sliceAt)))}`,
                c.hopBack,
                'lr',
              ),
            );
          labels.push(
            lab.label({ x: X(sliceAt), y: cy + R }, { x: 0, y: 1 }, 'dx', c.sliceFill, 'ldx'),
          );
        }
      }
      return finish(
        W,
        H,
        els,
        marks,
        labels,
        op,
        k,
        sliceAt === undefined ? undefined : { x: X(sliceAt), y: Y(Math.abs(f!(sliceAt))) },
      );
    }

    // Shells about the y-axis: the axis up the middle, the region on the right.
    const xMax = Math.max(Math.abs(a), Math.abs(b), 1e-9);
    const cx = W / 2;
    const base = H - m.b - SIDE * xMax * k;
    const X = (x: number) => cx + x * k;
    const Y = (y: number) => base - y * k;
    const yTop = R0 * 1.12;
    els.push(
      <Line
        key="ay"
        x1={cx}
        y1={base + SIDE * xMax * k + 6}
        x2={cx}
        y2={Y(yTop)}
        stroke={c.chartInk}
        strokeWidth={1}
        strokeDasharray={chart.dash}
      />,
      <Path key="ayh" d={arrowHead(cx, Y(yTop) - 4, 0, -1, 9)} fill={c.chartInk} />,
    );
    const tr = Math.max(12, 0.25 * xMax * k);
    const ty = Y(yTop) + 8;
    els.push(
      <Path
        key="turn"
        d={`M ${cx - tr} ${ty} A ${tr} ${SIDE * tr} 0 1 0 ${cx + tr} ${ty}`}
        stroke={c.chartMuted}
        strokeWidth={1.5}
        fill="none"
      />,
      <Path key="turnh" d={arrowHead(cx + tr, ty, 0.2, -1, 7)} fill={c.chartMuted} />,
    );
    labels.push(lab.label({ x: cx, y: Y(yTop) - 6 }, { x: 1, y: -0.3 }, 'y', c.chartInk, 'ny', 6));
    if (draws) {
      const N = 80;
      const span = b - a;
      const xs = Array.from({ length: N + 1 }, (_, i) => a + (span * i) / N);
      const yB = (x: number) => (g ? g(x) : 0);
      // The body: the outline of the turned region, both sides, with rims at a few radii.
      const right = xs.map((x) => ({ x: X(x), y: Y(f!(x)) }));
      const leftSide = xs.map((x) => ({ x: X(-x), y: Y(f!(x)) }));
      els.push(
        <Ellipse
          key="floor"
          cx={cx}
          cy={Y(yB(b))}
          rx={b * k}
          ry={SIDE * b * k}
          fill={c.surfaceFill}
          fillOpacity={0.1}
          stroke={c.surfaceFill}
          strokeWidth={1.2}
        />,
        <Path
          key="rside"
          d={linePath(right)}
          stroke={c.surfaceFill}
          strokeWidth={1.2}
          fill="none"
        />,
        <Path
          key="lside"
          d={linePath(leftSide)}
          stroke={c.surfaceFill}
          strokeWidth={1.2}
          fill="none"
        />,
      );
      for (let i = 1; i < 6; i++) {
        const x = a + (span * i) / 6;
        els.push(
          <Ellipse
            key={`rim${i}`}
            cx={cx}
            cy={Y(f!(x))}
            rx={x * k}
            ry={SIDE * x * k}
            fill="none"
            stroke={c.surfaceMesh}
            strokeOpacity={0.3}
            strokeWidth={0.8}
          />,
        );
      }
      const under = xs.map((x) => ({ x: X(x), y: Y(yB(x)) }));
      els.push(
        <Path
          key="region"
          d={`${linePath(right)} ${linePath([...under].reverse()).replace(/^M/, 'L')} Z`}
          fill={c.chartHighlight}
          fillOpacity={0.22}
          stroke="none"
        />,
        <Path
          key="fcurve"
          d={linePath(right)}
          stroke={c.chartHighlight}
          strokeWidth={chart.strokeHeavy}
          fill="none"
        />,
        <Line
          key="xaxis"
          x1={X(-xMax) - 6}
          y1={base}
          x2={X(xMax) + 12}
          y2={base}
          stroke={c.chartMuted}
          strokeWidth={1}
        />,
      );
      if (g)
        els.push(
          <Path
            key="gcurve"
            d={linePath(under)}
            stroke={c.hopBack}
            strokeWidth={chart.stroke}
            fill="none"
          />,
        );
      const peak = xs.reduce((p, x) => (f!(x) > f!(p) ? x : p), a);
      labels.push(
        lab.label(
          { x: X(peak), y: Y(f!(peak)) },
          { x: 1, y: -1 },
          `y = ${fText}`,
          c.chartHighlight,
          'lf',
        ),
        lab.label({ x: X(b), y: base }, { x: 0.3, y: 1 }, say(b), c.chartMuted, 'lb'),
        lab.label({ x: X(xMax) + 12, y: base }, { x: 1, y: 0 }, 'x', c.chartInk, 'nx', 6),
      );
      if (sliceAt !== undefined) {
        const r = sliceAt * k;
        const [yTopS, yBot] = [Y(f!(sliceAt)), Y(yB(sliceAt))];
        const ry = SIDE * r;
        marks.push(
          <G key="shell">
            <Path
              d={`M ${cx - r} ${yTopS} L ${cx - r} ${yBot} A ${r} ${ry} 0 0 0 ${cx + r} ${yBot} L ${cx + r} ${yTopS} A ${r} ${ry} 0 0 1 ${cx - r} ${yTopS} Z`}
              fill={c.sliceFill}
              fillOpacity={0.4}
              stroke={c.sliceFill}
              strokeWidth={1.2}
            />
            <Ellipse
              cx={cx}
              cy={yTopS}
              rx={r}
              ry={ry}
              fill={c.sliceFill}
              fillOpacity={0.25}
              stroke={c.sliceFill}
              strokeWidth={1.5}
            />
            <Line
              x1={cx}
              y1={yBot}
              x2={cx + r}
              y2={yBot}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            <Line
              x1={cx + r + 4}
              y1={yTopS}
              x2={cx + r + 4}
              y2={yBot}
              stroke={c.hopBack}
              strokeWidth={chart.stroke}
            />
          </G>,
        );
        labels.push(
          lab.label(
            { x: cx + r / 2, y: yBot },
            { x: 0, y: 1 },
            `r = x = ${say(sliceAt)}`,
            c.chartInk,
            'lr',
          ),
          lab.label(
            { x: cx + r + 4, y: (yTopS + yBot) / 2 },
            { x: 1, y: 0 },
            `h = ${say(f!(sliceAt) - yB(sliceAt))}`,
            c.hopBack,
            'lh',
          ),
        );
      }
    }
    return finish(
      W,
      H,
      els,
      marks,
      labels,
      op,
      k,
      sliceAt === undefined ? undefined : { x: X(sliceAt), y: Y(f!(sliceAt)) },
    );
  }

  function finish(
    W: number,
    H: number,
    els: ReactElement[],
    marks: ReactElement[],
    labels: ReactElement[],
    op: number,
    k: number,
    handle: { x: number; y: number } | undefined,
  ) {
    return (
      <>
        <Svg width={W} height={H}>
          <G opacity={op}>{els}</G>
          {marks}
          {labels}
        </Svg>
        {canDrag && handle ? (
          <DragHandle
            testID="drag-slice"
            x={handle.x}
            y={Math.max(14, handle.y - 16)}
            label="the slice"
            onStart={() => {
              drag.current = sliceAt!;
              frozen.freezeAt(box);
            }}
            onMove={(dx) => {
              const id = spec.at as string;
              const x = Math.min(b, Math.max(a, drag.current + dx / k));
              calc.set({ ...rep.pinTyped(keep), [id]: rep.snapTo(id, x) }, rep.slide(id));
            }}
            onEnd={frozen.release}
          />
        ) : null}
      </>
    );
  }
}
