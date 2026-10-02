/**
 * HC14 (college round 2, group A): the complex plane on electrical pages. Three modes, by the
 * fields a page sets (`typesHe2a.ts`):
 *
 * - an impedance (or any phasor) z = R + jX by its parts: the R leg along the real axis, the jX
 *   leg up (jX_L up and −jX_C down when `reactances` is set), |Z| along the arrow and θ from the
 *   real axis; drag the tip;
 * - `phasors`: arrows from 0 (a three-phase star), tip to tail where a phasor has a `tail`, a
 *   second unit (a current) at its own scale, an angle between two of them;
 * - `poles`, `zeros`, `locus`: the s-plane with × poles and ○ zeros, the root-locus branches
 *   traced as K grows, the asymptotes from the centroid, the breakaway points and the
 *   closed-loop poles at the page's gain (drag one along its branch to change K).
 *
 * Flat, as every diagram. A "?" value draws nothing for that value.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { ComplexPlaneSpec } from '@/data/modules/typesHsd';
import type { PlanePointHe2a } from '@/data/modules/typesHe2a';
import type { Values } from '@/engine/types';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle, useFrozen, useRep } from './common';
import { Arrow, makeFrame, type Frame } from './graphKit';
import { HsdGrid, niceWindow } from './hsdGrid';
import {
  asymptoteAngles,
  breakawayPoints,
  centroidOf,
  clipSegment,
  closedLoopPoles,
  phasorAngle,
  phasorLayout,
  traceLocus,
  withConjugates,
  type Branch,
  type Cx,
  type PhasorValue,
} from './complexPlaneHe2aMath';
import { nf, place, polarText, rectText, spotsAround, Tag, tagWidth, type Box } from './he2aKit';

const RAD = Math.PI / 180;
type Rep = ReturnType<typeof useRep>;

/** Which mode a spec draws. */
const modeOf = (spec: ComplexPlaneSpec) =>
  spec.locus ? 'locus' : spec.phasors ? 'phasors' : spec.poles || spec.zeros ? 'poles' : 'z';

export function ComplexPlaneHe2a({ spec, calc }: { spec: ComplexPlaneSpec; calc: Calculator }) {
  const mode = modeOf(spec);
  if (mode === 'phasors') return <PhasorPlane spec={spec} calc={calc} />;
  if (mode === 'z') return <ImpedancePlane spec={spec} calc={calc} />;
  return <SPlane spec={spec} calc={calc} />;
}

/** Readers for NumOrVar fields. */
function readers(rep: Rep) {
  const num = (v: number | string) => (typeof v === 'number' ? v : rep.val(v));
  const known = (v: number | string | undefined) =>
    v === undefined || typeof v === 'number' || rep.known(v);
  const sym = (v: number | string | undefined, fallback: string) =>
    typeof v === 'string' ? rep.variable(v).symbol : fallback;
  return { num, known, sym };
}

/** A window of square units holding `xs` × `ys`, aspect kept within [lo, hi]. */
function squareWindow(xs: number[], ys: number[], lo: number, hi: number, ticks = 7) {
  const wx = niceWindow(xs, ticks);
  const wy = niceWindow(ys, ticks);
  const step = Math.max(wx.step, wy.step);
  const r = (a: { lo: number; hi: number }) => ({
    lo: Math.floor(a.lo / step - 1e-9) * step,
    hi: Math.ceil(a.hi / step + 1e-9) * step,
  });
  const grow = (a: { lo: number; hi: number }, span: number) => {
    const add = Math.ceil((span - (a.hi - a.lo)) / 2 / step - 1e-9) * step;
    return add > 0 ? { lo: a.lo - add, hi: a.hi + add } : a;
  };
  let [x, y] = [r(wx), r(wy)];
  x = grow(x, (y.hi - y.lo) / hi);
  y = grow(y, (x.hi - x.lo) * lo);
  return { x, y, step };
}

/** An arc at the origin of the frame from angle a to b (degrees), radius r px. */
const arcPath = (f: Frame, a: number, b: number, r: number) => {
  const n = Math.max(2, Math.ceil(Math.abs(b - a) / 4));
  const [ox, oy] = [f.sx(0), f.sy(0)];
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = (a + ((b - a) * i) / n) * RAD;
    return `${i ? 'L' : 'M'} ${ox + r * Math.cos(t)} ${oy - r * Math.sin(t)}`;
  }).join(' ');
};

// ─── An impedance by its parts ───────────────────────────────────────────────

function ImpedancePlane({ spec, calc }: { spec: ComplexPlaneSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const { num, known, sym } = readers(rep);
  const unit = spec.unit ? ` ${spec.unit}` : '';
  const j = spec.j ? 'j' : 'i';
  const polar = 'modulus' in spec.z;
  const z = (() => {
    if ('modulus' in spec.z) {
      // A "?" part is drawn as 0 and never labelled (aOk and bOk say which parts are known).
      const [r, t] = [num(spec.z.modulus) ?? 0, num(spec.z.argument) ?? 0];
      const ok = known(spec.z.modulus) && known(spec.z.argument);
      return { a: r * Math.cos(t * RAD), b: r * Math.sin(t * RAD), aOk: ok, bOk: ok };
    }
    return {
      a: num(spec.z.re) ?? 0,
      b: num(spec.z.im) ?? 0,
      aOk: known(spec.z.re),
      bOk: known(spec.z.im),
    };
  })();
  const ok = z.aOk && z.bOk;
  const xr = spec.reactances;
  const xl = xr && known(xr.inductive) ? num(xr.inductive) : undefined;
  const xc = xr && known(xr.capacitive) ? num(xr.capacitive) : undefined;
  const mag = Math.hypot(z.a, z.b);
  const ang = Math.atan2(z.b, z.a) / RAD;
  const live = squareWindow([0, z.a], [0, z.b, ...(xl !== undefined ? [xl] : [])], 0.55, 1.1);
  const win = useFrozen(live);
  const drag = useRef({ a: 0, b: 0 });
  const name = spec.name;
  const reName = 're' in spec.z ? sym(spec.z.re, 'R') : 'R';
  const imName = 'im' in spec.z ? sym(spec.z.im, 'X') : 'X';
  const magName = sym(spec.zMag, name ? `|${name}|` : 'r');
  const angName = sym(spec.zAngle, 'θ');
  const zText = rectText(z.a, z.b, j);

  // Caption: the parts, the size and angle, the polar form.
  const lines: string[] = [];
  if (xr && xl !== undefined && xc !== undefined)
    lines.push(
      `${imName} = ${sym(xr.inductive, 'X_L')} − ${sym(xr.capacitive, 'X_C')} = ${nf(xl)} − ${nf(xc)} = ${nf(xl - xc)}${unit}.`,
    );
  if (ok) {
    lines.push(`${name ? `${name} = ` : ''}${zText}${unit}.`);
    if (!polar && mag > 0) {
      const sq = (x: number) => (x < 0 ? `(${nf(x)})²` : `${nf(x)}²`);
      lines.push(`${magName} = √(${sq(z.a)} + ${sq(z.b)}) = ${nf(mag)}${unit}.`);
    }
    if (mag > 0) {
      lines.push(
        `${angName} = ${nf(ang)}°: ${name ? `${name} = ` : ''}${polarText(mag, ang)}${unit}.`,
      );
      if (spec.unit === 'Ω' && Math.abs(ang) > 0.005)
        lines.push(
          ang > 0
            ? `The current lags the voltage by ${nf(ang)}°.`
            : `The current leads the voltage by ${nf(-ang)}°.`,
        );
    }
  }

  return (
    <View>
      <Canvas
        aspect={Math.max(
          0.55,
          Math.min(1.1, (win.value.y.hi - win.value.y.lo) / (win.value.x.hi - win.value.x.lo)),
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
          const taken: Box[] = [];
          const [ox, oy] = [f.sx(0), f.sy(0)];
          const [tx, ty] = [f.sx(z.a), f.sy(z.b)];
          // The handle and the origin keep their room.
          taken.push({ l: tx - 12, t: ty - 12, r: tx + 12, b: ty + 12 });
          // The tip's label, outward along the arrow.
          const tipText = `${name ? ' = ' : ''}${zText}${unit}`;
          const tip = ok
            ? place(
                spotsAround(tx, ty, tx - ox, ty - oy, 14),
                tagWidth(name ?? '', tipText),
                taken,
                w,
                h,
              )
            : undefined;
          // R under its leg, below the axis; X beside its leg.
          const rText = ` = ${nf(z.a)}${unit}`;
          const rTag =
            z.aOk && Math.abs(z.a) * f.ux > 30
              ? place(
                  [
                    { x: (ox + tx) / 2, y: oy + (z.b >= 0 ? 30 : -10), anchor: 'middle' },
                    { x: (ox + tx) / 2, y: oy + (z.b >= 0 ? -8 : 30), anchor: 'middle' },
                  ],
                  tagWidth(reName, rText),
                  taken,
                  w,
                  h,
                )
              : undefined;
          const side = z.a >= 0 ? 'start' : 'end';
          const sx = tx + (z.a >= 0 ? 10 : -10);
          const xTags: {
            at: ReturnType<typeof place>;
            name: string;
            text: string;
            color: string;
          }[] = [];
          if (xr && xl !== undefined && xc !== undefined && z.aOk) {
            const t1 = ` = ${j}${nf(xl)}${unit}`;
            xTags.push({
              at: place(
                [
                  { x: sx, y: (oy + f.sy(xl)) / 2 + 4, anchor: side },
                  { x: sx, y: f.sy(xl * 0.3) + 4, anchor: side },
                ],
                tagWidth(`j${sym(xr.inductive, 'X_L')}`, t1),
                taken,
                w,
                h,
              ),
              name: `j${sym(xr.inductive, 'X_L')}`,
              text: t1,
              color: c.planeImag,
            });
            const t2 = ` = −${j}${nf(xc)}${unit}`;
            xTags.push({
              at: place(
                [
                  {
                    x: sx + (z.a >= 0 ? 8 : -8),
                    y: (f.sy(xl) + f.sy(xl - xc)) / 2 + 4,
                    anchor: side,
                  },
                  { x: sx + (z.a >= 0 ? 8 : -8), y: f.sy(xl) - 6, anchor: side },
                  { x: sx + (z.a >= 0 ? 8 : -8), y: f.sy(xl) + 18, anchor: side },
                ],
                tagWidth(`−j${sym(xr.capacitive, 'X_C')}`, t2),
                taken,
                w,
                h,
              ),
              name: `−j${sym(xr.capacitive, 'X_C')}`,
              text: t2,
              color: c.hopBack,
            });
          } else if (z.aOk && z.bOk && Math.abs(z.b) * f.uy > 26) {
            const t = ` = ${nf(z.b)}${unit}`;
            xTags.push({
              at: place(
                [
                  { x: sx, y: (oy + ty) / 2 + 4, anchor: side },
                  {
                    x: tx + (z.a >= 0 ? -10 : 10),
                    y: (oy + ty) / 2 + 4,
                    anchor: z.a >= 0 ? 'end' : 'start',
                  },
                ],
                tagWidth(imName, t),
                taken,
                w,
                h,
              ),
              name: imName,
              text: t,
              color: c.planeImag,
            });
          }
          // |Z| beside the arrow, on its upper-left side.
          const len = Math.hypot(tx - ox, ty - oy) || 1;
          const [nx, ny] = [(ty - oy) / len, -(tx - ox) / len];
          const magText = ` = ${nf(mag)}${unit}`;
          const flip = ny > 0 ? -1 : 1;
          // The real axis's numbers keep their room from |Z| (a shallow arrow leaves little
          // between it and the axis): then |Z| goes on the arrow's other side.
          const band: Box = { l: 0, t: oy + 2, r: w, b: oy + 18 };
          taken.push(band);
          const magTag =
            ok && len > 70
              ? place(
                  [
                    [flip, 16],
                    [-flip, 16],
                    [-flip, 36],
                  ].flatMap(([fl, off]) =>
                    [0.5, 0.62, 0.38].map((k) => ({
                      x: ox + (tx - ox) * k + nx * fl! * off!,
                      y: oy + (ty - oy) * k + ny * fl! * off! + 4 + (ny * fl! > 0.3 ? 6 : 0),
                      anchor: (nx * fl! > 0.3 ? 'start' : nx * fl! < -0.3 ? 'end' : 'middle') as
                        'start' | 'end' | 'middle',
                    })),
                  ),
                  tagWidth(magName, magText),
                  taken,
                  w,
                  h,
                )
              : undefined;
          taken.splice(taken.indexOf(band), 1);
          // θ by its arc.
          const arcR = Math.min(30, len * 0.45);
          const mid = (ang / 2) * RAD;
          const angText = ` = ${nf(ang)}°`;
          const angTag =
            ok && mag > 0 && Math.abs(ang) > 2 && len > 50
              ? place(
                  [
                    {
                      x: ox + (arcR + 8) * Math.cos(mid),
                      y: oy - (arcR + 8) * Math.sin(mid) + 4,
                      anchor: 'start',
                    },
                    {
                      x: ox + (arcR + 8) * Math.cos(mid),
                      y: oy - (arcR + 8) * Math.sin(mid) + (ang > 0 ? -6 : 14),
                      anchor: 'start',
                    },
                    { x: ox - 6, y: oy + (ang > 0 ? -8 : 20), anchor: 'end' },
                  ],
                  tagWidth(angName, angText),
                  taken,
                  w,
                  h,
                )
              : undefined;
          const ids =
            'modulus' in spec.z ? [spec.z.modulus, spec.z.argument] : [spec.z.re, spec.z.im];
          const varIds = ids.filter((x): x is string => typeof x === 'string');
          return (
            <>
              <Svg width={w} height={h}>
                <HsdGrid
                  f={f}
                  step={{ x: win.value.step, y: win.value.step }}
                  names={{ x: spec.axes?.[0] ?? 'Re', y: spec.axes?.[1] ?? 'Im' }}
                  yText={(v) => (spec.axes || !spec.j ? nf(v) : rectText(0, v, j))}
                  clear={taken}
                />
                {/* The R leg along the real axis. */}
                {z.aOk && Math.abs(z.a) > 1e-12 ? (
                  <Line
                    x1={ox}
                    y1={oy}
                    x2={tx}
                    y2={oy}
                    stroke={c.planeReal}
                    strokeWidth={chart.strokeHeavy + 1}
                  />
                ) : null}
                {/* The jX leg: X_L up then X_C down, or X alone. */}
                {xr && xl !== undefined && xc !== undefined && z.aOk ? (
                  <G>
                    {Math.abs(xl) > 1e-12 ? (
                      <Arrow
                        x1={tx}
                        y1={oy}
                        x2={tx}
                        y2={f.sy(xl)}
                        color={c.planeImag}
                        width={chart.stroke}
                      />
                    ) : null}
                    {Math.abs(xc) > 1e-12 ? (
                      <Arrow
                        x1={tx + (z.a >= 0 ? 7 : -7)}
                        y1={f.sy(xl)}
                        x2={tx + (z.a >= 0 ? 7 : -7)}
                        y2={f.sy(xl - xc)}
                        color={c.hopBack}
                        width={chart.stroke}
                      />
                    ) : null}
                  </G>
                ) : z.aOk && z.bOk && Math.abs(z.b) > 1e-12 ? (
                  <Line
                    x1={tx}
                    y1={oy}
                    x2={tx}
                    y2={ty}
                    stroke={c.planeImag}
                    strokeWidth={chart.stroke}
                    strokeDasharray={chart.dash}
                  />
                ) : null}
                {ok && mag > 0 ? (
                  <G>
                    {Math.abs(ang) > 2 && len > 50 ? (
                      <Path
                        d={arcPath(f, 0, ang, arcR)}
                        stroke={c.chartInk}
                        strokeWidth={chart.strokeLight}
                        fill="none"
                      />
                    ) : null}
                    <Arrow
                      x1={ox}
                      y1={oy}
                      x2={tx}
                      y2={ty}
                      color={c.chartHighlight}
                      width={chart.strokeHeavy}
                    />
                    <Circle cx={tx} cy={ty} r={5} fill={c.chartHighlight} />
                  </G>
                ) : null}
                {rTag ? <Tag {...rTag} name={reName} text={rText} color={c.planeReal} /> : null}
                {xTags.map((t, i) => (
                  <Tag key={i} {...t.at} name={t.name} text={t.text} color={t.color} />
                ))}
                {magTag ? <Tag {...magTag} name={magName} text={magText} bold={false} /> : null}
                {angTag ? <Tag {...angTag} name={angName} text={angText} bold={false} /> : null}
                {tip ? (
                  <Tag {...tip} name={name ?? ''} text={tipText} color={c.chartHighlight} />
                ) : null}
              </Svg>
              {!spec.fixed && ok && varIds.length ? (
                <DragHandle
                  testID="drag-z"
                  x={tx}
                  y={ty}
                  label={name ?? 'z'}
                  onStart={() => {
                    drag.current = { a: z.a, b: z.b };
                    win.freeze();
                  }}
                  onMove={(dx, dy) => {
                    const a = drag.current.a + dx / f.ux;
                    const b = drag.current.b - dy / f.uy;
                    const next: Values = {};
                    const put = (id: number | string | undefined, x: number) => {
                      if (typeof id === 'string') next[id] = rep.snapTo(id, x * rep.factor(id));
                    };
                    // By size and angle when the page typed those, else by the parts.
                    const byPolar =
                      'modulus' in spec.z ||
                      (typeof spec.zMag === 'string' &&
                        typeof spec.zAngle === 'string' &&
                        rep.typed(spec.zMag) &&
                        rep.typed(spec.zAngle));
                    if ('modulus' in spec.z) {
                      put(spec.z.modulus, Math.hypot(a, b));
                      put(spec.z.argument, Math.atan2(b, a) / RAD);
                    } else if (byPolar) {
                      put(spec.zMag, Math.hypot(a, b));
                      put(spec.zAngle, Math.atan2(b, a) / RAD);
                    } else {
                      put(spec.z.re, a);
                      put(spec.z.im, b);
                    }
                    const first = Object.keys(next)[0];
                    if (!first) return;
                    calc.set({ ...rep.pin(spec.keep ?? []), ...next }, rep.slide(first));
                  }}
                  onEnd={win.release}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      {lines.length ? <Caption>{lines.join(' · ')}</Caption> : null}
    </View>
  );
}

// ─── Phasors ─────────────────────────────────────────────────────────────────

function PhasorPlane({ spec, calc }: { spec: ComplexPlaneSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const { num, known } = readers(rep);
  const tones = {
    a: c.phasorA,
    b: c.phasorB,
    c: c.phasorC,
    line: c.phasorLine,
    current: c.phasorCurrent,
    lit: c.chartHighlight,
  };
  // A phasor with a "?" (or tailing on one) is not drawn.
  const shown: PhasorValue[] = [];
  const specs = spec.phasors ?? [];
  for (const p of specs) {
    if (!known(p.mag) || !known(p.angle)) continue;
    if (p.tail && !shown.some((q) => q.name === p.tail)) continue;
    shown.push({
      name: p.name,
      mag: num(p.mag),
      angle: phasorAngle(num(p.angle), p.negate, p.offset),
      unit: p.unit,
      tail: p.tail,
      ends: p.ends,
    });
  }
  const lay = phasorLayout(shown);
  const pts = [...lay.values()].flatMap((l) => [l.from, l.to]);
  const live = (() => {
    const xs = [0, ...pts.map((p) => p.re)];
    const ys = [0, ...pts.map((p) => p.im)];
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const span = Math.max(x1 - x0, y1 - y0, 1e-9);
    const pad = span * 0.2;
    return {
      x: [x0 - pad, x1 + pad] as [number, number],
      y: [y0 - pad, y1 + pad] as [number, number],
    };
  })();
  const win = useFrozen(live);
  const unitOf = (p: PhasorValue) => (p.unit ? ` ${p.unit}` : '');
  const main = shown[0]?.unit;

  // Caption: each phasor in polar form; tip-to-tail sums; a second scale.
  const lines: string[] = [];
  const plain = shown.filter((p) => !p.tail);
  if (plain.length)
    lines.push(
      `${plain.map((p) => `${p.name} = ${polarText(p.mag, p.angle)}${unitOf(p)}`).join(', ')}.`,
    );
  for (const p of shown.filter((q) => q.tail)) {
    const sum = p.name.startsWith('−') ? `${p.tail} − ${p.name.slice(1)}` : `${p.tail} + ${p.name}`;
    lines.push(
      `${p.name} = ${polarText(p.mag, p.angle)}${unitOf(p)}, tip to tail${p.ends ? `: ${p.ends} = ${sum}` : ''}.`,
    );
  }
  const others = [...new Set(shown.filter((p) => p.unit !== main).map((p) => p.unit))];
  if (others.length) lines.push(`Phasors in ${others.join(', ')} are drawn to their own scale.`);
  const between = spec.between;
  const bFrom = between && shown.find((p) => p.name === between.from);
  const bTo = between && shown.find((p) => p.name === between.to);
  if (bFrom && bTo && between?.label)
    lines.push(
      `${between.label} = ${nf(Math.abs(bFrom.angle - bTo.angle))}° between ${bFrom.name} and ${bTo.name}.`,
    );

  return (
    <View>
      <Canvas
        aspect={Math.max(
          0.7,
          Math.min(1.1, (win.value.y[1] - win.value.y[0]) / (win.value.x[1] - win.value.x[0])),
        )}
      >
        {({ w, h }) => {
          const f = makeFrame(w, h, win.value.x, win.value.y, true, false);
          const taken: Box[] = [];
          const [ox, oy] = [f.sx(0), f.sy(0)];
          const P = (p: Cx) => ({ x: f.sx(p.re), y: f.sy(p.im) });
          // Labels: plain phasors at their tips, outward; tip-to-tail ones by their middles.
          const tags = shown.map((p) => {
            const l = lay.get(p.name)!;
            const [a, b] = [P(l.from), P(l.to)];
            const spec0 = specs.find((s) => s.name === p.name)!;
            if (!p.tail) {
              return {
                p,
                spec0,
                at: place(
                  spotsAround(b.x, b.y, b.x - ox, b.y - oy, 10),
                  tagWidth(p.name, ''),
                  taken,
                  w,
                  h,
                ),
              };
            }
            const [mx, my] = [(a.x + b.x) / 2, (a.y + b.y) / 2];
            const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
            let [nx, ny] = [(b.y - a.y) / len, -(b.x - a.x) / len];
            // Away from the origin.
            if ((mx - ox) * nx + (my - oy) * ny < 0) [nx, ny] = [-nx, -ny];
            return {
              p,
              spec0,
              at: place(spotsAround(mx, my, nx, ny, 10), tagWidth(p.name, ''), taken, w, h),
            };
          });
          const ang = (p: PhasorValue) => p.angle;
          return (
            <Svg width={w} height={h}>
              <Line
                x1={f.sx(f.x[0])}
                y1={oy}
                x2={f.sx(f.x[1])}
                y2={oy}
                stroke={c.chartGrid}
                strokeWidth={1.5}
              />
              <Line
                x1={ox}
                y1={f.sy(f.y[0])}
                x2={ox}
                y2={f.sy(f.y[1])}
                stroke={c.chartGrid}
                strokeWidth={1.5}
              />
              <Tag
                x={w - 4}
                y={oy - 6}
                anchor="end"
                name={spec.axes?.[0] ?? 'Re'}
                chip={false}
                color={c.chartMuted}
              />
              <Tag
                x={ox + 6}
                y={14}
                anchor="start"
                name={spec.axes?.[1] ?? 'Im'}
                chip={false}
                color={c.chartMuted}
              />
              {bFrom && bTo ? (
                <Path
                  d={arcPath(f, ang(bFrom), ang(bTo), 30)}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                  fill="none"
                />
              ) : null}
              {bFrom && bTo && between?.label
                ? (() => {
                    const m = ((ang(bFrom) + ang(bTo)) / 2) * RAD;
                    const at = place(
                      spotsAround(
                        ox + 34 * Math.cos(m),
                        oy - 34 * Math.sin(m),
                        Math.cos(m),
                        -Math.sin(m),
                        8,
                      ),
                      tagWidth(between.label, ''),
                      taken,
                      w,
                      h,
                    );
                    return <Tag {...at} name={between.label} bold={false} />;
                  })()
                : null}
              {tags.map(({ p, spec0 }) => {
                const l = lay.get(p.name)!;
                const [a, b] = [P(l.from), P(l.to)];
                if (Math.hypot(b.x - a.x, b.y - a.y) < 1) return null;
                const color = tones[spec0.tone ?? 'a'];
                return (
                  <Arrow
                    key={p.name}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    color={color}
                    width={
                      spec0.tone === 'lit' || spec0.tone === 'line'
                        ? chart.strokeHeavy
                        : chart.stroke + 0.5
                    }
                    dash={spec0.dashed ? chart.dash : undefined}
                  />
                );
              })}
              <Circle cx={ox} cy={oy} r={3} fill={c.chartInk} />
              {tags.map(({ p, spec0, at }) => (
                <Tag key={`t${p.name}`} {...at} name={p.name} color={tones[spec0.tone ?? 'a']} />
              ))}
            </Svg>
          );
        }}
      </Canvas>
      {lines.length ? <Caption>{lines.join(' · ')}</Caption> : null}
    </View>
  );
}

// ─── The s-plane: poles, zeros and the root locus ─────────────────────────────

/** "−0.5 ± j1.66", "−5". */
const rootText = (r: Cx) =>
  Math.abs(r.im) > 1e-9 ? `${nf(r.re)} ± j${nf(Math.abs(r.im))}` : nf(r.re);

/** Distinct roots for a caption: a pair written once. */
const rootsText = (rs: Cx[]) =>
  rs
    .filter((r) => r.im >= -1e-12)
    .map(rootText)
    .join(', ');

function SPlane({ spec, calc }: { spec: ComplexPlaneSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const { num, known, sym } = readers(rep);
  const drag = useRef({ x: 0, y: 0 });
  const read = (ps: PlanePointHe2a[] | undefined) =>
    (ps ?? [])
      .filter((p) => known(p.re) && known(p.im))
      .map((p) => ({ re: (p.neg ? -1 : 1) * num(p.re), im: p.im === undefined ? 0 : num(p.im) }));
  const locus = spec.locus;
  const poles = withConjugates(read(locus ? locus.poles : spec.poles));
  const zeros = withConjugates(read(locus ? locus.zeros : spec.zeros));
  const gains = locus ? (Array.isArray(locus.gain) ? locus.gain : [locus.gain]) : [];
  const gainKnown = gains.every((g) => known(g));
  const K = gains.reduce<number>((k, g) => k * num(g), 1);
  const allKnown = (
    locus
      ? [...locus.poles, ...(locus.zeros ?? [])]
      : [...(spec.poles ?? []), ...(spec.zeros ?? [])]
  ).every((p) => known(p.re) && known(p.im));
  const closed = locus && gainKnown && allKnown ? closedLoopPoles(poles, zeros, K) : [];
  const sigma = locus && allKnown ? centroidOf(poles, zeros) : undefined;
  const angles = locus && allKnown ? asymptoteAngles(poles.length, zeros.length) : [];
  const breaks = locus && allKnown ? breakawayPoints(poles, zeros) : [];
  const xs = [
    0,
    ...poles.map((p) => p.re),
    ...zeros.map((p) => p.re),
    ...closed.map((p) => p.re),
    ...breaks,
  ];
  if (sigma !== undefined && angles.length > 1) xs.push(sigma);
  const ys = [0, ...poles.map((p) => p.im), ...zeros.map((p) => p.im), ...closed.map((p) => p.im)];
  const live = (() => {
    const wx = niceWindow(xs, 7);
    const spanX = wx.hi - wx.lo;
    const big = Math.max(...ys.map(Math.abs), spanX * 0.22);
    return squareWindow(xs, [-big, big], 0.5, 1);
  })();
  const win = useFrozen(live);
  const trace: Branch[] = (() => {
    if (!locus || !allKnown || !poles.length) return [];
    const { x, y } = win.value;
    const R = Math.hypot(x.hi - x.lo, y.hi - y.lo);
    const d = poles.length - zeros.length;
    const kMax =
      d > 0 ? Math.max(K * 4, 2 * (3 * R + Math.abs(sigma ?? 0)) ** d) : Math.max(K * 100, 1e5);
    return traceLocus(poles, zeros, kMax, (x.hi - x.lo) / 50);
  })();
  const gainName = gains.map((g) => sym(g, nf(num(g)))).join('');

  // Caption.
  const lines: string[] = [];
  const list = (rs: Cx[]) => rootsText(rs) || 'none';
  if (allKnown) {
    lines.push(
      `Poles (×) at s = ${list(poles)}${zeros.length ? `; zeros (○) at s = ${list(zeros)}` : ''}.`,
    );
    if (spec.terms) {
      const tagged = (spec.poles ?? []).filter((p) => p.tag && known(p.tag.value));
      if (tagged.length === (spec.poles ?? []).length && tagged.length) {
        const parts = tagged.map((p, i) => {
          const a = num(p.tag!.value);
          const s = (p.neg ? -1 : 1) * num(p.re);
          const e =
            Math.abs(s) < 1e-12
              ? ''
              : `e^(${s < 0 ? '−' : ''}${Math.abs(s) === 1 ? '' : nf(Math.abs(s))}t)`;
          const coef = Math.abs(a) === 1 && e ? '' : nf(Math.abs(a));
          return `${i === 0 ? (a < 0 ? '−' : '') : a < 0 ? ' − ' : ' + '}${coef}${e}`;
        });
        lines.push(`Each pole gives one term: x(t) = ${parts.join('')}.`);
      }
    }
    const tf = spec.transfer;
    if (tf && known(tf.gain)) {
      const k = num(tf.gain);
      const top = zeros.map((z) => -z.re);
      const bottom = poles.map((p) => -p.re);
      if (
        poles.every((p) => Math.abs(p.im) < 1e-12) &&
        zeros.every((p) => Math.abs(p.im) < 1e-12) &&
        bottom.every((b) => b !== 0)
      ) {
        const g0 = (k * top.reduce((a, b) => a * b, 1)) / bottom.reduce((a, b) => a * b, 1);
        lines.push(
          `G(0) = ${[nf(k), ...top.map(nf)].join(' × ')} ÷ ${bottom.length > 1 ? `(${bottom.map(nf).join(' × ')})` : nf(bottom[0]!)} = ${nf(g0)}.`,
        );
      }
    }
    if (sigma !== undefined && angles.length > 1) {
      const sum = poles.reduce((s, p) => s + p.re, 0) - zeros.reduce((s, p) => s + p.re, 0);
      lines.push(
        `σₐ = ${nf(sum)} ÷ ${angles.length} = ${nf(sigma)}; asymptotes at ${angles.map((a) => `${nf(a)}°`).join(', ')}.`,
      );
    }
    if (breaks.length)
      lines.push(`Breakaway at s = ${breaks.map(nf).join(', ')}, where dK/ds = 0.`);
    if (closed.length)
      lines.push(`At ${gainName} = ${nf(K)}, the closed-loop poles are s = ${rootsText(closed)}.`);
  }

  return (
    <View>
      <Canvas
        aspect={Math.max(
          0.5,
          Math.min(1, (win.value.y.hi - win.value.y.lo) / (win.value.x.hi - win.value.x.lo)),
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
          const P = (p: Cx) => ({ x: f.sx(p.re), y: f.sy(p.im) });
          const box = { x0: f.x[0], x1: f.x[1], y0: f.y[0], y1: f.y[1] };
          const taken: Box[] = [];
          // Marks keep their room from labels.
          for (const p of [...poles, ...zeros, ...closed]) {
            const q = P(p);
            taken.push({ l: q.x - 8, t: q.y - 8, r: q.x + 8, b: q.y + 8 });
          }
          const path = (pts: Cx[]) => {
            let d = '';
            let open = false;
            for (let i = 1; i < pts.length; i++) {
              const s = clipSegment(pts[i - 1]!, pts[i]!, box);
              if (!s) {
                open = false;
                continue;
              }
              const [a, b] = [P(s[0]), P(s[1])];
              d += `${open ? '' : `M ${a.x} ${a.y} `}L ${b.x} ${b.y} `;
              open = true;
            }
            return d;
          };
          // A small arrowhead half way along each branch's drawn part: the way K grows.
          const heads = trace.map((b) => {
            const inside = b.pts.filter(
              (p) => p.re >= box.x0 && p.re <= box.x1 && p.im >= box.y0 && p.im <= box.y1,
            );
            if (inside.length < 6) return null;
            const i = Math.floor(inside.length / 2);
            const [a, q] = [P(inside[i - 1]!), P(inside[i + 1]!)];
            const len = Math.hypot(q.x - a.x, q.y - a.y);
            if (len < 0.5) return null;
            const [ux, uy] = [(q.x - a.x) / len, (q.y - a.y) / len];
            const m = P(inside[i]!);
            return `M ${m.x + ux * 5} ${m.y + uy * 5} L ${m.x - ux * 4 - uy * 4.5} ${m.y - uy * 4 + ux * 4.5} L ${m.x - ux * 4 + uy * 4.5} ${m.y - uy * 4 - ux * 4.5} Z`;
          });
          const sig =
            sigma !== undefined && angles.length > 1 ? P({ re: sigma, im: 0 }) : undefined;
          const sigTag = sig
            ? place(
                [
                  { x: sig.x, y: sig.y + 30, anchor: 'middle' },
                  { x: sig.x, y: sig.y - 10, anchor: 'middle' },
                ],
                tagWidth('σ_a', ` = ${nf(sigma!)}`),
                taken,
                w,
                h,
              )
            : undefined;
          const breakTags = breaks.map((b) => {
            const q = P({ re: b, im: 0 });
            return {
              q,
              at: place(
                [
                  { x: q.x, y: q.y - 10, anchor: 'middle' },
                  { x: q.x, y: q.y + 30, anchor: 'middle' },
                ],
                tagWidth('', nf(b)),
                taken,
                w,
                h,
              ),
            };
          });
          const residueTags = (locus ? [] : (spec.poles ?? []))
            .filter((p) => p.tag && known(p.tag.value) && known(p.re))
            .map((p) => {
              const q = P({
                re: (p.neg ? -1 : 1) * num(p.re),
                im: p.im === undefined ? 0 : num(p.im),
              });
              const text = ` = ${nf(num(p.tag!.value))}`;
              return {
                name: p.tag!.name,
                text,
                at: place(
                  [
                    { x: q.x, y: q.y - 14, anchor: 'middle' },
                    { x: q.x, y: q.y - 30, anchor: 'middle' },
                    { x: q.x, y: q.y + 40, anchor: 'middle' },
                  ],
                  tagWidth(p.tag!.name, text),
                  taken,
                  w,
                  h,
                ),
              };
            });
          const kTag =
            closed.length && gainKnown
              ? (() => {
                  const top = closed.reduce((a, b) => (b.im > a.im ? b : a));
                  const q = P(top);
                  return place(
                    spotsAround(q.x, q.y, 1, -1, 12),
                    tagWidth(gainName, ` = ${nf(K)}`),
                    taken,
                    w,
                    h,
                  );
                })()
              : undefined;
          // The handle on the dominant closed-loop pole (the rightmost, upper of a pair).
          const dom = closed.find((r) => r.im >= -1e-12);
          const gainId = gains.find((g): g is string => typeof g === 'string');
          const others = gains.reduce<number>((k, g) => (g === gainId ? k : k * num(g)), 1);
          return (
            <>
              <Svg width={w} height={h}>
                <HsdGrid
                  f={f}
                  step={{ x: win.value.step, y: win.value.step }}
                  names={{ x: spec.axes?.[0] ?? 'σ', y: spec.axes?.[1] ?? 'jω' }}
                  yText={(v) => (spec.j && !spec.axes ? rectText(0, v, 'j') : nf(v))}
                  clear={taken}
                />
                {/* Asymptotes from the centroid. */}
                {sig
                  ? angles.map((a) => {
                      const L = 10 * (f.x[1] - f.x[0] + f.y[1] - f.y[0]);
                      const far = { re: sigma! + L * Math.cos(a * RAD), im: L * Math.sin(a * RAD) };
                      const s = clipSegment({ re: sigma!, im: 0 }, far, box);
                      if (!s) return null;
                      const [p, q] = [P(s[0]), P(s[1])];
                      return (
                        <Line
                          key={`as${a}`}
                          x1={p.x}
                          y1={p.y}
                          x2={q.x}
                          y2={q.y}
                          stroke={c.chartMuted}
                          strokeWidth={chart.strokeLight}
                          strokeDasharray={chart.dash}
                        />
                      );
                    })
                  : null}
                {/* The branches. */}
                {trace.map((b, i) => (
                  <Path
                    key={`br${i}`}
                    d={path(b.pts)}
                    stroke={c.planeLocus}
                    strokeWidth={chart.strokeHeavy - 0.5}
                    strokeLinejoin="round"
                    fill="none"
                  />
                ))}
                {heads.map((d, i) =>
                  d ? <Path key={`hd${i}`} d={d} fill={c.planeLocus} /> : null,
                )}
                {sig ? (
                  <Path
                    d={`M ${sig.x} ${sig.y - 5} L ${sig.x + 5} ${sig.y} L ${sig.x} ${sig.y + 5} L ${sig.x - 5} ${sig.y} Z`}
                    fill={c.chartMuted}
                  />
                ) : null}
                {breakTags.map(({ q }, i) => (
                  <Circle
                    key={`bk${i}`}
                    cx={q.x}
                    cy={q.y}
                    r={4}
                    fill={c.planeLocus}
                    stroke={c.card}
                    strokeWidth={1.5}
                  />
                ))}
                {/* × poles and ○ zeros. */}
                {poles.map((p, i) => {
                  const q = P(p);
                  return (
                    <Path
                      key={`p${i}`}
                      d={`M ${q.x - 6} ${q.y - 6} L ${q.x + 6} ${q.y + 6} M ${q.x - 6} ${q.y + 6} L ${q.x + 6} ${q.y - 6}`}
                      stroke={c.chartInk}
                      strokeWidth={2.5}
                      strokeLinecap="round"
                    />
                  );
                })}
                {zeros.map((p, i) => {
                  const q = P(p);
                  return (
                    <Circle
                      key={`z${i}`}
                      cx={q.x}
                      cy={q.y}
                      r={6}
                      fill={c.card}
                      stroke={c.chartInk}
                      strokeWidth={2.2}
                    />
                  );
                })}
                {/* The closed-loop poles at the gain. */}
                {closed.map((p, i) => {
                  const q = P(p);
                  return (
                    <Rect
                      key={`c${i}`}
                      x={q.x - 5}
                      y={q.y - 5}
                      width={10}
                      height={10}
                      fill={c.planeClosed}
                      stroke={c.card}
                      strokeWidth={1}
                    />
                  );
                })}
                {sigTag ? (
                  <Tag
                    {...sigTag}
                    name="σ_a"
                    text={` = ${nf(sigma!)}`}
                    color={c.chartMuted}
                    bold={false}
                  />
                ) : null}
                {breakTags.map(({ at }, i) => (
                  <Tag
                    key={`bt${i}`}
                    {...at}
                    text={nf(breaks[i]!)}
                    color={c.planeLocus}
                    bold={false}
                  />
                ))}
                {residueTags.map((t, i) => (
                  <Tag
                    key={`rt${i}`}
                    {...t.at}
                    name={t.name}
                    text={t.text}
                    color={c.chartHighlight}
                  />
                ))}
                {kTag ? (
                  <Tag {...kTag} name={gainName} text={` = ${nf(K)}`} color={c.planeClosed} />
                ) : null}
              </Svg>
              {!spec.fixed && dom && gainId && trace.length ? (
                <DragHandle
                  testID="drag-gain"
                  x={f.sx(dom.re)}
                  y={f.sy(dom.im)}
                  label={gainName}
                  onStart={() => {
                    drag.current = { x: f.sx(dom.re), y: f.sy(dom.im) };
                    win.freeze();
                  }}
                  onMove={(dx, dy) => {
                    const [fx, fy] = [drag.current.x + dx, drag.current.y + dy];
                    let best = { d: Infinity, k: K };
                    for (const b of trace)
                      b.pts.forEach((p, i) => {
                        const d = Math.hypot(f.sx(p.re) - fx, f.sy(p.im) - fy);
                        if (d < best.d && b.ks[i]! > 0) best = { d, k: b.ks[i]! };
                      });
                    if (!(others > 0) || !Number.isFinite(best.k)) return;
                    calc.set(
                      {
                        ...rep.pin(spec.keep ?? []),
                        [gainId]: rep.snapTo(gainId, best.k / others),
                      },
                      rep.slide(gainId),
                    );
                  }}
                  onEnd={win.release}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      {lines.length ? <Caption>{lines.join(' · ')}</Caption> : null}
    </View>
  );
}
