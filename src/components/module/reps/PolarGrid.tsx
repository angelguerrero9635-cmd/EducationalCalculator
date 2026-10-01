import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { PolarGridSpec } from '@/data/modules/typesHsd';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle, useFrozen, useRep } from './common';
import { arrowHead, makeFrame } from './graphKit';
import { HsdGrid, niceStep, niceWindow } from './hsdGrid';
import { angleText, short } from './hsdKit';
import { MathChip, MathText } from './hsdText';
import { CURVE_FIELDS, PATH_FIELDS, pathAt, petals, polarR, polarSpan } from './polar';
import { polarConicText } from './polarConic';

const RAD = Math.PI / 180;

/** The curve's equation as a lesson writes it: "r = 3 cos(2θ)", "r = 2 + 2 cos θ". */
function curveText(spec: NonNullable<PolarGridSpec['curve']>, v: Record<string, number>) {
  const fn = spec.shape !== 'spiral' ? (spec.fn ?? 'cos') : 'cos';
  switch (spec.shape) {
    case 'circle':
      return spec.fn ? `r = ${short(v.a!)} ${fn} θ` : `r = ${short(v.a!)}`;
    case 'rose':
      return `r = ${short(v.a!)} ${fn}(${short(v.n!)}θ)`;
    case 'cardioid': {
      const b = v.b ?? v.a!;
      return `r = ${short(v.a!)} ${b < 0 ? '−' : '+'} ${short(Math.abs(b))} ${fn} θ`;
    }
    case 'spiral':
      return `r = ${short(v.a!)}θ`;
    case 'conic': // H106 (drawn by PolarConic)
      return polarConicText({ k: v.k!, m: v.m ?? 1, n: v.n!, fn: spec.fn ?? 'cos' });
  }
}

/**
 * The polar grid with a point (r, θ) and a polar curve, or (parametric) an x-y grid with a path
 * x(t), y(t), its direction arrows and the point at t. Drag the point.
 */
export function PolarGrid({ spec, calc }: { spec: PolarGridSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (x: number | string) => (typeof x === 'string' ? rep.val(x) : x);
  const isKnown = (x: number | string | undefined) =>
    x === undefined || typeof x === 'number' || rep.known(x);
  const show = spec.show ?? 'degrees';
  const read = (o: object, fields: string[]) =>
    Object.fromEntries(
      fields
        .filter((k) => (o as Record<string, unknown>)[k] !== undefined)
        .map((k) => [k, num((o as Record<string, number | string>)[k]!)]),
    );
  const drag = useRef({ x: 0, y: 0 });

  // ── Parametric: an x-y grid. ──
  const par = spec.parametric;
  const pv = par ? read(par, PATH_FIELDS[par.family]) : {};
  const t = par ? num(par.t) : 0;
  // The ellipse's t is an angle, in degrees.
  const tText = par?.family === 'ellipse' ? `${short(t)}°` : short(t);
  // The path over its range, stretched to reach a t typed past either end.
  const [t0, t1] = par ? [Math.min(par.range[0], t), Math.max(par.range[1], t)] : [0, 0];
  const samples = par
    ? Array.from({ length: 201 }, (_, i) => {
        const s = t0 + ((t1 - t0) * i) / 200;
        return { t: s, ...pathAt(par, pv, s) };
      })
    : [];

  // ── Polar: rings and rays. ──
  const cv = spec.curve ? read(spec.curve, CURVE_FIELDS[spec.curve.shape]) : {};
  const span: [number, number] = spec.curve ? polarSpan(spec.curve, cv) : [0, 0];
  const curvePts = spec.curve
    ? Array.from({ length: 361 }, (_, i) => {
        const d = span[0] + ((span[1] - span[0]) * i) / 360;
        const r = polarR(spec.curve!, cv, d);
        return { x: r * Math.cos(d * RAD), y: r * Math.sin(d * RAD) };
      })
    : [];
  const pt = spec.point
    ? {
        r: num(spec.point.r),
        th: num(spec.point.theta),
        known: isKnown(spec.point.r) && isKnown(spec.point.theta),
      }
    : undefined;
  const maxR = Math.max(
    1,
    ...curvePts.map((p) => Math.hypot(p.x, p.y)),
    ...(pt ? [Math.abs(pt.r)] : []),
  );
  const ringStep = niceStep(maxR / 4);
  const outer = Math.ceil((maxR * 1.02) / ringStep - 1e-9) * ringStep;
  const live = par
    ? (() => {
        const wx = niceWindow(
          samples.map((p) => p.x),
          9,
          0.04,
          1,
          0.5,
        );
        const wy = niceWindow(
          samples.map((p) => p.y),
          9,
          0.04,
          1,
          0.5,
        );
        const step = Math.max(wx.step, wy.step);
        const r = (w: { lo: number; hi: number }) => ({
          lo: Math.floor(w.lo / step) * step,
          hi: Math.ceil(w.hi / step) * step,
        });
        return { x: r(wx), y: r(wy), step, outer };
      })()
    : { x: { lo: 0, hi: 0 }, y: { lo: 0, hi: 0 }, step: 1, outer };
  const win = useFrozen(live);

  // Caption.
  const lines: string[] = [];
  if (spec.curve) {
    const text = curveText(spec.curve, cv);
    const extra =
      spec.curve.shape === 'rose' && Number.isInteger(cv.n)
        ? `: ${petals(cv.n!)} petals`
        : spec.curve.shape === 'cardioid'
          ? Math.abs((cv.b ?? cv.a!) - cv.a!) < 1e-9
            ? ': a cardioid'
            : Math.abs(cv.b ?? cv.a!) > Math.abs(cv.a!)
              ? ': a limaçon with an inner loop'
              : ': a limaçon'
          : spec.curve.shape === 'circle' && spec.curve.fn
            ? `: a circle of diameter ${short(Math.abs(cv.a!))} through the pole`
            : '';
    lines.push(
      `${text}${extra}, θ from ${angleText(span[0]!, show)} to ${angleText(span[1]!, show)}.`,
    );
  }
  if (pt) {
    if (!pt.known) lines.push('(r, θ) = ?');
    else {
      const x = pt.r * Math.cos(pt.th * RAD);
      const y = pt.r * Math.sin(pt.th * RAD);
      lines.push(
        `(r, θ) = (${short(pt.r)}, ${angleText(pt.th, show)}) · x = r cos θ ≈ ${short(x)} · y = r sin θ ≈ ${short(y)}.`,
      );
      if (pt.r < 0)
        lines.push(`r is negative, so the point is on the ray opposite ${angleText(pt.th, show)}.`);
    }
  }
  if (par) {
    const p = pathAt(par, pv, t);
    lines.push(
      isKnown(par.t)
        ? `At t = ${tText} the point is (${short(p.x)}, ${short(p.y)}). The arrows show the way t runs.`
        : 't = ?',
    );
  }

  return (
    <View>
      <Canvas
        aspect={
          par
            ? Math.max(
                0.6,
                Math.min(
                  1.15,
                  (win.value.y.hi - win.value.y.lo) / (win.value.x.hi - win.value.x.lo),
                ),
              )
            : 1
        }
      >
        {({ w, h }) => {
          if (par) {
            const f = makeFrame(
              w,
              h,
              [win.value.x.lo, win.value.x.hi],
              [win.value.y.lo, win.value.y.hi],
              true,
              true,
            );
            const done = samples.filter((s) => s.t <= t + 1e-9);
            const d = (pts: { x: number; y: number }[]) =>
              pts.map((p, i) => `${i ? 'L' : 'M'} ${f.sx(p.x)} ${f.sy(p.y)}`).join(' ');
            const at = pathAt(par, pv, t);
            const arrows = [0.2, 0.4, 0.6, 0.8].map((q) => {
              const i = Math.round(q * 200);
              const a = samples[i]!;
              const b = samples[Math.min(200, i + 1)]!;
              return {
                x: f.sx(a.x),
                y: f.sy(a.y),
                dx: f.sx(b.x) - f.sx(a.x),
                dy: f.sy(b.y) - f.sy(a.y),
              };
            });
            const known = isKnown(par.t);
            return (
              <>
                <Svg width={w} height={h}>
                  <HsdGrid f={f} step={{ x: win.value.step, y: win.value.step }} />
                  <Path
                    d={d(samples)}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                    strokeDasharray={chart.dash}
                    strokeOpacity={0.5}
                    fill="none"
                  />
                  <Path
                    d={d(done)}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                    fill="none"
                    opacity={known ? 1 : 0.35}
                  />
                  {arrows.map((a, i) =>
                    Math.hypot(a.dx, a.dy) > 1e-6 ? (
                      <Path
                        key={i}
                        d={arrowHead(a.x + a.dx * 3, a.y + a.dy * 3, a.dx, a.dy, 10)}
                        fill={c.chartHighlight}
                      />
                    ) : null,
                  )}
                  <G opacity={known ? 1 : 0.35}>
                    <Circle
                      cx={f.sx(at.x)}
                      cy={f.sy(at.y)}
                      r={6}
                      fill={c.hopBack}
                      stroke={c.card}
                      strokeWidth={1.5}
                    />
                    {/* Below the point, away from the y-axis numbers (the edge clamps it). */}
                    <MathChip
                      x={f.sx(at.x) + (at.x < 0 ? -10 : 10)}
                      y={f.sy(at.y) + 24}
                      text={`t = ${tText}: (${short(at.x)}, ${short(at.y)})`}
                      anchor={at.x < 0 ? 'end' : 'start'}
                      w={w}
                      h={h}
                      color={c.hopBack}
                    />
                  </G>
                </Svg>
                {!spec.fixed && typeof par.t === 'string' && known ? (
                  <DragHandle
                    testID="drag-t"
                    x={f.sx(at.x)}
                    y={f.sy(at.y)}
                    label="the point at t"
                    onStart={() => {
                      drag.current = { x: f.sx(at.x), y: f.sy(at.y) };
                      win.freeze();
                    }}
                    onMove={(dx, dy) => {
                      const gx = drag.current.x + dx;
                      const gy = drag.current.y + dy;
                      const near = samples.reduce((best, s) =>
                        Math.hypot(f.sx(s.x) - gx, f.sy(s.y) - gy) <
                        Math.hypot(f.sx(best.x) - gx, f.sy(best.y) - gy)
                          ? s
                          : best,
                      );
                      const id = par.t as string;
                      calc.set(
                        { ...rep.pin(spec.keep ?? []), [id]: rep.snapTo(id, near.t) },
                        rep.slide(id),
                      );
                    }}
                    onEnd={win.release}
                  />
                ) : null}
              </>
            );
          }
          const R = w / 2 - 44;
          const cx = w / 2;
          const cy = h / 2;
          const k = R / win.value.outer;
          const P = (x: number, y: number) => ({ x: cx + x * k, y: cy - y * k });
          const rings: number[] = [];
          for (let r = ringStep; r <= win.value.outer + 1e-9; r += ringStep)
            rings.push(Number(r.toFixed(9)));
          const rays = Array.from({ length: 12 }, (_, i) => i * 30);
          const ringEvery = ringStep * k < 26 ? 2 : 1;
          const p = pt ? P(pt.r * Math.cos(pt.th * RAD), pt.r * Math.sin(pt.th * RAD)) : undefined;
          return (
            <>
              <Svg width={w} height={h}>
                {rings.map((r, i) => (
                  <Circle
                    key={`r${r}`}
                    cx={cx}
                    cy={cy}
                    r={r * k}
                    fill="none"
                    stroke={i === rings.length - 1 ? c.chartMuted : c.chartGrid}
                    strokeWidth={1}
                  />
                ))}
                {rays.map((d) => (
                  <Line
                    key={`a${d}`}
                    x1={cx}
                    y1={cy}
                    x2={cx + R * Math.cos(d * RAD)}
                    y2={cy - R * Math.sin(d * RAD)}
                    stroke={d % 90 === 0 ? c.chartInk : c.chartGrid}
                    strokeWidth={d % 90 === 0 ? chart.strokeLight : 1}
                  />
                ))}
                {rays.map((d) => {
                  const text = angleText(d, show);
                  const rr = R + 10 + Math.abs(Math.cos(d * RAD)) * (text.length * 3.6);
                  return (
                    <MathText
                      key={`t${d}`}
                      text={text}
                      x={cx + rr * Math.cos(d * RAD)}
                      y={cy - rr * Math.sin(d * RAD) + 4}
                      textAnchor="middle"
                      fontSize={chart.label}
                      fill={c.chartMuted}
                    />
                  );
                })}
                {rings
                  .filter((_, i) => (i + 1) % ringEvery === 0)
                  .map((r) => (
                    <MathText
                      key={`n${r}`}
                      text={formatNumber(r)}
                      x={cx + r * k - 3}
                      y={cy + 14}
                      textAnchor="end"
                      fontSize={chart.label}
                      fill={c.chartMuted}
                    />
                  ))}
                {spec.curve ? (
                  <Path
                    d={curvePts
                      .map((q, i) => `${i ? 'L' : 'M'} ${P(q.x, q.y).x} ${P(q.x, q.y).y}`)
                      .join(' ')}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                    fill="none"
                    opacity={
                      Object.keys(cv).every((key) =>
                        isKnown((spec.curve as unknown as Record<string, number | string>)[key]),
                      )
                        ? 1
                        : 0.35
                    }
                  />
                ) : null}
                {spec.curve ? (
                  <MathChip
                    x={8}
                    y={20}
                    text={curveText(spec.curve, cv)}
                    anchor="start"
                    w={w}
                    h={h}
                    color={c.chartHighlight}
                    size={chart.value}
                  />
                ) : null}
                {pt && p ? (
                  <G opacity={pt.known ? 1 : 0.35}>
                    {/* The ray at θ, and the opposite ray a negative r lands on. */}
                    <Line
                      x1={cx}
                      y1={cy}
                      x2={cx + R * Math.cos(pt.th * RAD)}
                      y2={cy - R * Math.sin(pt.th * RAD)}
                      stroke={c.hopBack}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={chart.dashFine}
                    />
                    <Line
                      x1={cx}
                      y1={cy}
                      x2={p.x}
                      y2={p.y}
                      stroke={c.hopBack}
                      strokeWidth={chart.stroke + 0.5}
                    />
                    {Math.abs(pt.th) > 1 ? (
                      <Path
                        d={Array.from({ length: 41 }, (_, i) => {
                          const a = ((pt.th * i) / 40) * RAD;
                          return `${i ? 'L' : 'M'} ${cx + 22 * Math.cos(a)} ${cy - 22 * Math.sin(a)}`;
                        }).join(' ')}
                        stroke={c.chartInk}
                        strokeWidth={chart.strokeLight}
                        fill="none"
                      />
                    ) : null}
                    <MathText
                      text="θ"
                      x={cx + 34 * Math.cos((pt.th / 2) * RAD)}
                      y={cy - 34 * Math.sin((pt.th / 2) * RAD) + 4}
                      textAnchor="middle"
                      fontSize={chart.value}
                      fontWeight="700"
                    />
                    <Circle
                      cx={p.x}
                      cy={p.y}
                      r={6}
                      fill={c.hopBack}
                      stroke={c.card}
                      strokeWidth={1.5}
                    />
                    {(() => {
                      // Near the rim the tag goes inward, toward the pole, off the rim's
                      // angle labels ("(4, 150°)" covered 150°).
                      const rim = Math.hypot(p.x - cx, p.y - cy) > 0.7 * R;
                      const right = rim ? p.x < cx : p.x >= cx;
                      const up = rim ? p.y > cy : p.y <= cy;
                      return (
                        <MathChip
                          x={p.x + (right ? 12 : -12)}
                          y={p.y + (up ? -12 : 22)}
                          text={`(${short(pt.r)}, ${angleText(pt.th, show)})`}
                          anchor={right ? 'start' : 'end'}
                          w={w}
                          h={h}
                          color={c.hopBack}
                        />
                      );
                    })()}
                  </G>
                ) : null}
              </Svg>
              {!spec.fixed &&
              spec.point &&
              pt?.known &&
              p &&
              [spec.point.r, spec.point.theta].some((x) => typeof x === 'string') ? (
                <DragHandle
                  testID="drag-point"
                  x={p.x}
                  y={p.y}
                  label="the point (r, θ)"
                  onStart={() => {
                    drag.current = { x: p.x, y: p.y };
                    win.freeze();
                  }}
                  onMove={(dx, dy) => {
                    const x = (drag.current.x + dx - cx) / k;
                    const y = -(drag.current.y + dy - cy) / k;
                    let th = Math.atan2(y, x) / RAD;
                    if (th < 0) th += 360;
                    const next: Record<string, number> = {};
                    const { r: rId, theta: tId } = spec.point!;
                    if (typeof tId === 'string') next[tId] = rep.snapTo(tId, th);
                    // On a curve, r follows θ; alone, the point takes the finger's distance too.
                    if (!spec.curve && typeof rId === 'string')
                      next[rId] = rep.snapTo(rId, Math.hypot(x, y));
                    const first = typeof tId === 'string' ? tId : (rId as string);
                    calc.set({ ...rep.pin(spec.keep ?? []), ...next }, rep.slide(first));
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
