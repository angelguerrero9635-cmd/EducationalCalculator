import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Path } from 'react-native-svg';

import type { PolarGridSpec } from '@/data/modules/typesHsd';
import type { PolarConicHs3b } from '@/data/modules/typesHs3b';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle, useFrozen, useRep } from './common';
import { niceStep } from './hsdGrid';
import { angleText, short } from './hsdKit';
import { chipBox, MathChip, MathText } from './hsdText';
import { usePaintIds } from './paint';
import { polarConicParts, polarConicText } from './polarConic';

const RAD = Math.PI / 180;

/**
 * A conic on the polar grid (H106, `polarGrid` with `curve.shape: 'conic'`): r = k ÷ (m − n cos θ)
 * with its focus at the pole and its directrix dashed; a point P on it with PF and PD drawn, so
 * PF ÷ PD = e can be read off. Drag P along the curve.
 */
export function PolarConic({ spec, calc }: { spec: PolarGridSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('clip');
  const curve = spec.curve as PolarConicHs3b;
  const num = (x: number | string | undefined, d: number) =>
    x === undefined ? d : typeof x === 'string' ? rep.val(x) : x;
  const known = (x: number | string | undefined) =>
    x === undefined || typeof x === 'number' || rep.known(x);
  const parts = polarConicParts(curve, {
    k: num(curve.k, 1),
    m: num(curve.m, 1),
    n: num(curve.n, 1),
  });
  const { k, m, n, fn, e, d, at } = parts;
  const trig = (deg: number) => (fn === 'sin' ? Math.sin(deg * RAD) : Math.cos(deg * RAD));
  const rOf = (deg: number) => k / (m - n * trig(deg));
  const curveKnown = known(curve.k) && known(curve.m) && known(curve.n);
  const pt = spec.point
    ? {
        th: num(spec.point.theta, 0),
        known: known(spec.point.theta) && curveKnown,
      }
    : undefined;
  const pr = pt ? rOf(pt.th) : undefined;
  // The vertices: along the axis (θ = 0° and 180°, or 90° and 270°).
  const axis = fn === 'sin' ? 90 : 0;
  const vertices = [axis, axis + 180]
    .map((deg) => ({ deg, r: rOf(deg) }))
    .filter((v) => Number.isFinite(v.r) && Math.abs(v.r) < 1e9);
  const near = Math.min(...vertices.map((v) => Math.abs(v.r)), Infinity);
  const far = Math.max(...vertices.map((v) => Math.abs(v.r)), 0);
  const base = Math.max(d ?? 0, Number.isFinite(near) ? near : 0, e < 1 || n === 0 ? far : 0, 0.5);
  const reach = e < 1 || n === 0 ? base : Math.max(2 * base, e > 1 ? far * 1.3 : 0);
  const pointReach = pr !== undefined && Number.isFinite(pr) ? Math.abs(pr) : 0;
  const live = (() => {
    let outer = Math.max(reach, pointReach <= 3 * reach ? pointReach : 0) * 1.06;
    const ringStep = niceStep(outer / 4);
    outer = Math.ceil(outer / ringStep - 1e-9) * ringStep;
    return { outer, ringStep };
  })();
  const win = useFrozen(live);
  const drag = useRef({ x: 0, y: 0 });

  // Caption.
  const letter = (x: number | string | undefined) =>
    typeof x === 'string' && !rep.known(x) ? rep.variable(x).symbol : undefined;
  const letters = { k: letter(curve.k), m: letter(curve.m), n: letter(curve.n) };
  const eq = polarConicText(parts, letters);
  const lines: string[] = [];
  if (!curveKnown) lines.push(`${eq} with a value still to type.`);
  else if (n === 0)
    lines.push(`${eq} is r = ${short(k / m)} for every θ: a circle round the pole, e = 0.`);
  else {
    lines.push(
      `${m === 1 ? `The equation ${eq} gives` : `Dividing by ${short(m)}, ${eq} is ${polarConicText({ k: k / m, m: 1, n: n / m, fn })}, with`} e = ${short(e)} and ed = ${short(k / m)}, so d = ${short(d!)}.`,
      `With e ${Math.abs(e - 1) < 1e-9 ? '= 1' : e < 1 ? '< 1' : '> 1'} the curve is ${parts.name}: its focus is the pole and its directrix is ${fn === 'sin' ? 'y' : 'x'} = ${short(at!)}.`,
    );
  }
  if (pt && pr !== undefined) {
    if (!pt.known) lines.push('P = ?');
    else if (!Number.isFinite(pr) || Math.abs(pr) > 1e9)
      lines.push(
        `At θ = ${angleText(pt.th, 'degrees')} the bottom is 0: the curve runs off parallel to that direction.`,
      );
    else {
      const x = pr * Math.cos(pt.th * RAD);
      const y = pr * Math.sin(pt.th * RAD);
      const PD = at === undefined ? undefined : Math.abs((fn === 'sin' ? y : x) - at);
      lines.push(
        `The point at θ = ${angleText(pt.th, 'degrees')} has r = ${short(pr)}${pr < 0 ? ', so P is on the ray opposite θ' : ''}.`,
      );
      if (PD !== undefined && PD > 1e-9)
        lines.push(
          `The point’s distance to the focus is PF = ${short(Math.abs(pr))} and to the directrix PD = ${short(PD)}, and PF ÷ PD = ${short(Math.abs(pr) / PD)}, which is e.`,
        );
      if (Math.abs(pr) > win.value.outer)
        lines.push('P is past the edge of the grid; the arrow points to it.');
    }
  }

  return (
    <View>
      <Canvas aspect={1}>
        {({ w, h }) => {
          const R = w / 2 - 44;
          const [cx, cy] = [w / 2, h / 2];
          const s = R / win.value.outer;
          const P = (x: number, y: number) => ({ x: cx + x * s, y: cy - y * s });
          const rings: number[] = [];
          for (let r = win.value.ringStep; r <= win.value.outer + 1e-9; r += win.value.ringStep)
            rings.push(Number(r.toFixed(9)));
          const ringEvery = win.value.ringStep * s < 26 ? 2 : 1;
          const rays = Array.from({ length: 12 }, (_, i) => i * 30);
          // The curve, broken where the bottom changes sign or the curve leaves the grid far.
          const runs: string[] = [];
          let run: string[] = [];
          let prevDen = 0;
          for (let i = 0; i <= 1440; i++) {
            const deg = i / 4;
            const den = m - n * trig(deg);
            const r = k / den;
            const ok = Number.isFinite(r) && Math.abs(r) < win.value.outer * 4;
            if (!ok || (i > 0 && Math.sign(den) !== Math.sign(prevDen))) {
              if (run.length > 1) runs.push(run.join(' '));
              run = [];
            }
            prevDen = den;
            if (!ok) continue;
            const q = P(r * Math.cos(deg * RAD), r * Math.sin(deg * RAD));
            run.push(`${run.length ? 'L' : 'M'} ${q.x} ${q.y}`);
          }
          if (run.length > 1) runs.push(run.join(' '));
          const pPos =
            pt && pr !== undefined && Number.isFinite(pr) && Math.abs(pr) < 1e9
              ? { x: pr * Math.cos(pt.th * RAD), y: pr * Math.sin(pt.th * RAD) }
              : undefined;
          const inside = pPos && Math.hypot(pPos.x, pPos.y) <= win.value.outer * 1.001;
          const pp = pPos && inside ? P(pPos.x, pPos.y) : undefined;
          // The handle stays on the picture while P runs off it (r grows without end as the
          // bottom nears 0): on the rim, toward P.
          const rimAt = (x: number, y: number) => {
            const l = Math.hypot(x, y) || 1;
            const o = win.value.outer;
            return P((x / l) * o, (y / l) * o);
          };
          const handleAt =
            pp ??
            (pt
              ? pPos
                ? rimAt(pPos.x, pPos.y)
                : rimAt(Math.cos(pt.th * RAD), Math.sin(pt.th * RAD))
              : undefined);
          const dirOn = at !== undefined && Math.abs(at) < win.value.outer;
          const foot =
            pPos && at !== undefined ? (fn === 'sin' ? P(pPos.x, at) : P(at, pPos.y)) : undefined;
          const outward = (x: number, y: number, by: number) => {
            const l = Math.hypot(x - cx, y - cy) || 1;
            return { x: x + ((x - cx) / l) * by, y: y + ((y - cy) / l) * by };
          };
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <ClipPath id={ids.clip}>
                    <Circle cx={cx} cy={cy} r={R} />
                  </ClipPath>
                </Defs>
                {rings.map((r, i) => (
                  <Circle
                    key={`r${r}`}
                    cx={cx}
                    cy={cy}
                    r={r * s}
                    fill="none"
                    stroke={i === rings.length - 1 ? c.chartMuted : c.chartGrid}
                    strokeWidth={1}
                  />
                ))}
                {rays.map((deg) => (
                  <Line
                    key={`a${deg}`}
                    x1={cx}
                    y1={cy}
                    x2={cx + R * Math.cos(deg * RAD)}
                    y2={cy - R * Math.sin(deg * RAD)}
                    stroke={deg % 90 === 0 ? c.chartMuted : c.chartGrid}
                    strokeWidth={1}
                  />
                ))}
                {rays.map((deg) => {
                  const text = angleText(deg, 'degrees');
                  const rr = R + 10 + Math.abs(Math.cos(deg * RAD)) * (text.length * 3.6);
                  return (
                    <MathText
                      key={`t${deg}`}
                      text={text}
                      x={cx + rr * Math.cos(deg * RAD)}
                      y={cy - rr * Math.sin(deg * RAD) + 4}
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
                      x={cx + r * s - 3}
                      y={cy + 14}
                      textAnchor="end"
                      fontSize={chart.label}
                      fill={c.chartMuted}
                    />
                  ))}
                <G clipPath={`url(#${ids.clip})`}>
                  {/* The directrix, dashed across the grid. */}
                  {dirOn ? (
                    <Line
                      x1={fn === 'sin' ? cx - R : P(at!, 0).x}
                      y1={fn === 'sin' ? P(0, at!).y : cy - R}
                      x2={fn === 'sin' ? cx + R : P(at!, 0).x}
                      y2={fn === 'sin' ? P(0, at!).y : cy + R}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                      strokeDasharray={chart.dash}
                    />
                  ) : null}
                  <G opacity={curveKnown ? 1 : 0.35}>
                    {runs.map((dd, i) => (
                      <Path
                        key={`c${i}`}
                        d={dd}
                        stroke={c.chartHighlight}
                        strokeWidth={chart.strokeHeavy}
                        fill="none"
                      />
                    ))}
                  </G>
                  {/* PF from the focus, PD square to the directrix. */}
                  {pp && pt?.known ? (
                    <G>
                      <Line
                        x1={cx}
                        y1={cy}
                        x2={pp.x}
                        y2={pp.y}
                        stroke={c.hopBack}
                        strokeWidth={chart.stroke + 0.5}
                      />
                      {foot ? (
                        <Line
                          x1={pp.x}
                          y1={pp.y}
                          x2={foot.x}
                          y2={foot.y}
                          stroke={c.lineSum}
                          strokeWidth={chart.stroke + 0.5}
                          strokeDasharray={chart.dashFine}
                        />
                      ) : null}
                    </G>
                  ) : null}
                </G>
                {dirOn ? (
                  <MathChip
                    x={fn === 'sin' ? cx - R * 0.55 : P(at!, 0).x + (at! < 0 ? 6 : -6)}
                    y={fn === 'sin' ? P(0, at!).y + (at! < 0 ? 18 : -8) : cy - R * 0.62}
                    text={`${fn === 'sin' ? 'y' : 'x'} = ${curveKnown ? short(at!) : '?'}`}
                    anchor={fn === 'sin' ? 'middle' : at! < 0 ? 'start' : 'end'}
                    w={w}
                    h={h}
                  />
                ) : null}
                {vertices
                  .filter((v) => Math.abs(v.r) <= win.value.outer)
                  .map((v) => {
                    const q = P(v.r * Math.cos(v.deg * RAD), v.r * Math.sin(v.deg * RAD));
                    return (
                      <Circle
                        key={`v${v.deg}`}
                        cx={q.x}
                        cy={q.y}
                        r={3.5}
                        fill={c.chartHighlight}
                        opacity={curveKnown ? 1 : 0.35}
                      />
                    );
                  })}
                {/* The focus at the pole. */}
                <Circle cx={cx} cy={cy} r={5} fill={c.chartInk} stroke={c.card} strokeWidth={1.5} />
                <MathChip
                  x={cx + (fn === 'sin' ? 10 : -8)}
                  y={cy + (fn === 'sin' ? 5 : 20)}
                  text="F"
                  anchor={fn === 'sin' ? 'start' : 'end'}
                  w={w}
                  h={h}
                />
                {pp && pt?.known && pr !== undefined
                  ? (() => {
                      // P's label outward, PF's beside its middle, then PD's at the first
                      // spot along its segment that is clear of both.
                      type Spot = { x: number; y: number; anchor: 'start' | 'middle' | 'end' };
                      const q = outward(pp.x, pp.y, 16);
                      const pText = `P(${short(pr)}, ${angleText(pt.th, 'degrees')})`;
                      const pSpot: Spot = {
                        x: q.x,
                        y: q.y + 4,
                        anchor: q.x >= cx ? 'start' : 'end',
                      };
                      const fText = `PF = ${short(Math.abs(pr))}`;
                      const fSpot: Spot = {
                        x: (cx + pp.x) / 2 + (pp.y < cy ? -6 : 6),
                        y: (cy + pp.y) / 2 + (pp.x > cx ? -6 : 14),
                        anchor: pp.y < cy ? 'end' : 'start',
                      };
                      const box = (t: string, o: Spot) => chipBox(o.x, o.y, t, o.anchor);
                      type Box = ReturnType<typeof chipBox>;
                      const overlap = (a: Box, b: Box) =>
                        Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
                        Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
                      const taken = [box(pText, pSpot), box(fText, fSpot)];
                      const clash = (t: string, o: Spot) =>
                        taken.reduce((n, b) => n + overlap(b, box(t, o)), 0);
                      let dText = '';
                      let dSpot: Spot | undefined;
                      if (foot && at !== undefined) {
                        dText = `PD = ${short(Math.abs((fn === 'sin' ? pPos!.y : pPos!.x) - at))}`;
                        const spots: Spot[] = [];
                        for (const t of [0.5, 0.25, 0.75]) {
                          const mx = foot.x + (pp.x - foot.x) * t;
                          const my = foot.y + (pp.y - foot.y) * t;
                          if (fn === 'sin')
                            spots.push(
                              { x: mx - 6, y: my + 4, anchor: 'end' },
                              { x: mx + 6, y: my + 4, anchor: 'start' },
                            );
                          else
                            spots.push(
                              { x: mx, y: my - 7, anchor: 'middle' },
                              { x: mx, y: my + 18, anchor: 'middle' },
                            );
                        }
                        dSpot = spots.reduce((best, o) =>
                          clash(dText, o) < clash(dText, best) ? o : best,
                        );
                      }
                      return (
                        <G>
                          <MathChip {...fSpot} text={fText} w={w} h={h} color={c.hopBack} />
                          {dSpot ? (
                            <MathChip {...dSpot} text={dText} w={w} h={h} color={c.lineSum} />
                          ) : null}
                          <Circle
                            cx={pp.x}
                            cy={pp.y}
                            r={6}
                            fill={c.hopBack}
                            stroke={c.card}
                            strokeWidth={1.5}
                          />
                          <MathChip {...pSpot} text={pText} w={w} h={h} color={c.hopBack} />
                        </G>
                      );
                    })()
                  : null}
                {pPos && !inside && pt?.known ? (
                  // P past the grid: an arrow on the rim toward it.
                  <Path
                    d={(() => {
                      const a = Math.atan2(pPos.y, pPos.x);
                      const [ux, uy] = [Math.cos(a), -Math.sin(a)];
                      const tip = { x: cx + ux * (R - 4), y: cy + uy * (R - 4) };
                      const b = { x: tip.x - ux * 12, y: tip.y - uy * 12 };
                      return `M ${tip.x} ${tip.y} L ${b.x - uy * 6} ${b.y + ux * 6} L ${b.x + uy * 6} ${b.y - ux * 6} Z`;
                    })()}
                    fill={c.hopBack}
                  />
                ) : null}
                <MathChip
                  x={8}
                  y={20}
                  text={eq}
                  anchor="start"
                  w={w}
                  h={h}
                  color={c.chartHighlight}
                  size={chart.value}
                />
              </Svg>
              {!spec.fixed &&
              spec.point &&
              typeof spec.point.theta === 'string' &&
              handleAt &&
              (pp || win.frozen) ? (
                <DragHandle
                  testID="drag-point"
                  x={handleAt.x}
                  y={handleAt.y}
                  label="the point P along the conic"
                  onStart={() => {
                    drag.current = { x: handleAt.x, y: handleAt.y };
                    win.freeze();
                  }}
                  onMove={(dx, dy) => {
                    const x = drag.current.x + dx - cx;
                    const y = -(drag.current.y + dy - cy);
                    let th = Math.atan2(y, x) / RAD;
                    // A negative r lands opposite θ: the finger's direction is θ + 180° there.
                    if (pr !== undefined && pr < 0) th += 180;
                    th = ((th % 360) + 360) % 360;
                    const id = spec.point!.theta as string;
                    const keep =
                      spec.keep ??
                      [curve.k, curve.m, curve.n].filter((x): x is string => typeof x === 'string');
                    calc.set({ ...rep.pin(keep), [id]: rep.snapTo(id, th) }, rep.slide(id));
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
