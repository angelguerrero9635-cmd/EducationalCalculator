import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { ComplexPlaneSpec } from '@/data/modules/typesHsd';
import type { Values } from '@/engine/types';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle, useFrozen, useRep } from './common';
import { Arrow, makeFrame } from './graphKit';
import { HsdGrid, niceWindow } from './hsdGrid';
import { magnitudeText, short } from './hsdKit';
import { MathChip } from './hsdText';

const RAD = Math.PI / 180;

/** "3 + 2i", "3 − 2i", "−i", "4", "0". */
export function complexText(a: number, b: number): string {
  const re = Number(a.toFixed(2));
  const im = Number(b.toFixed(2));
  const imPart = (x: number) => (Math.abs(x) === 1 ? 'i' : `${short(Math.abs(x))}i`);
  if (im === 0) return short(re);
  if (re === 0) return `${im < 0 ? '−' : ''}${imPart(im)}`;
  return `${short(re)} ${im < 0 ? '−' : '+'} ${imPart(im)}`;
}

/** The argument in degrees, from 0° up to 360°. */
const argOf = (a: number, b: number) => {
  const d = Math.atan2(b, a) / RAD;
  return d < 0 ? d + 360 : d;
};

/**
 * The complex plane: z = a + bi as a point and an arrow, its conjugate reflected across the
 * real axis, a second number added (parallelogram), subtracted or multiplied (arguments add),
 * and the modulus and argument; the polar form r(cos θ + i sin θ). Drag z.
 */
export function ComplexPlane({ spec, calc }: { spec: ComplexPlaneSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (v: number | string) => (typeof v === 'number' ? v : rep.val(v));
  const isKnown = (v: number | string) => typeof v === 'number' || rep.known(v);
  const zPolar = 'modulus' in spec.z;
  const z = (() => {
    if ('modulus' in spec.z) {
      const r = num(spec.z.modulus);
      const t = num(spec.z.argument);
      return {
        a: r * Math.cos(t * RAD),
        b: r * Math.sin(t * RAD),
        known: isKnown(spec.z.modulus) && isKnown(spec.z.argument),
      };
    }
    return {
      a: num(spec.z.re),
      b: num(spec.z.im),
      known: isKnown(spec.z.re) && isKnown(spec.z.im),
    };
  })();
  const w = spec.w
    ? { a: num(spec.w.re), b: num(spec.w.im), known: isKnown(spec.w.re) && isKnown(spec.w.im) }
    : undefined;
  const op = w ? (spec.op ?? 'sum') : undefined;
  const res =
    w && op === 'sum'
      ? { a: z.a + w.a, b: z.b + w.b }
      : w && op === 'difference'
        ? { a: z.a - w.a, b: z.b - w.b }
        : w && op === 'product'
          ? { a: z.a * w.a - z.b * w.b, b: z.a * w.b + z.b * w.a }
          : undefined;
  const pts = [
    { a: z.a, b: z.b },
    ...(spec.conjugate ? [{ a: z.a, b: -z.b }] : []),
    ...(w ? [w] : []),
    ...(w && op === 'difference' ? [{ a: -w.a, b: -w.b }] : []),
    ...(res ? [res] : []),
  ];
  const live = (() => {
    const wx = niceWindow(
      pts.map((p) => p.a),
      7,
    );
    const wy = niceWindow(
      pts.map((p) => p.b),
      7,
    );
    const step = Math.max(wx.step, wy.step);
    const r = (x: { lo: number; hi: number }) => ({
      lo: Math.floor(x.lo / step) * step,
      hi: Math.ceil(x.hi / step) * step,
    });
    return { x: r(wx), y: r(wy), step };
  })();
  const win = useFrozen(live);
  const drag = useRef({ a: 0, b: 0 });
  const allKnown = z.known && (!w || w.known);

  // Caption.
  const lines: string[] = [];
  const zText = z.known ? complexText(z.a, z.b) : '?';
  if (zPolar && 'modulus' in spec.z) {
    const r = num(spec.z.modulus);
    const t = num(spec.z.argument);
    lines.push(`z = ${short(r)}(cos ${short(t)}° + i sin ${short(t)}°) ≈ ${zText}.`);
  } else lines.push(`z = ${zText}.`);
  if (z.known && (spec.modulus || spec.argument || spec.polar) && !zPolar) {
    const r = Math.hypot(z.a, z.b);
    const sq = (x: number) => (x < 0 ? `(${short(x)})²` : `${short(x)}²`);
    lines.push(
      `|z| = √(${sq(z.a)} + ${sq(z.b)}) = ${magnitudeText(z.a, z.b)}${r > 0 ? ` · arg z = ${short(argOf(z.a, z.b))}°` : ''}.`,
    );
    if (spec.polar && r > 0)
      lines.push(
        `z = ${short(r)}(cos ${short(argOf(z.a, z.b))}° + i sin ${short(argOf(z.a, z.b))}°).`,
      );
  }
  if (spec.conjugate && z.known)
    lines.push(`The conjugate z̄ = ${complexText(z.a, -z.b)}: z reflected across the real axis.`);
  if (w && res && allKnown) {
    const wt = complexText(w.a, w.b);
    if (op === 'sum') lines.push(`z + w = (${zText}) + (${wt}) = ${complexText(res.a, res.b)}.`);
    if (op === 'difference')
      lines.push(`z − w = (${zText}) − (${wt}) = ${complexText(res.a, res.b)}: z plus −w.`);
    if (op === 'product') {
      const mz = Math.hypot(z.a, z.b);
      const mw = Math.hypot(w.a, w.b);
      lines.push(`z × w = (${zText})(${wt}) = ${complexText(res.a, res.b)}.`);
      if (mz > 0 && mw > 0)
        lines.push(
          `The moduli multiply, ${magnitudeText(z.a, z.b).split(' ≈')[0]} × ${magnitudeText(w.a, w.b).split(' ≈')[0]} = ${short(mz * mw)}, and the arguments add, ${short(argOf(z.a, z.b))}° + ${short(argOf(w.a, w.b))}° = ${short(argOf(z.a, z.b) + argOf(w.a, w.b))}°.`,
        );
    }
  }

  return (
    <View>
      <Canvas
        aspect={Math.max(
          0.6,
          Math.min(1.15, (win.value.y.hi - win.value.y.lo) / (win.value.x.hi - win.value.x.lo)),
        )}
      >
        {({ w: cw, h }) => {
          const f = makeFrame(
            cw,
            h,
            [win.value.x.lo, win.value.x.hi],
            [win.value.y.lo, win.value.y.hi],
            true,
            true,
          );
          const P = (a: number, b: number) => ({ x: f.sx(a), y: f.sy(b) });
          const arrow = (
            p: { a: number; b: number },
            color: string,
            from = { a: 0, b: 0 },
            dash?: string,
            width: number = chart.strokeHeavy,
          ) =>
            Math.hypot(p.a - from.a, p.b - from.b) > 1e-9 ? (
              <Arrow
                x1={f.sx(from.a)}
                y1={f.sy(from.b)}
                x2={f.sx(p.a)}
                y2={f.sy(p.b)}
                color={color}
                width={width}
                dash={dash}
              />
            ) : null;
          /** A point's label: outside the arrow's tip, in its direction. */
          const tipLabel = (p: { a: number; b: number }, text: string, color: string) => {
            const q = P(p.a, p.b);
            const o = P(0, 0);
            const len = Math.hypot(q.x - o.x, q.y - o.y) || 1;
            const ux = (q.x - o.x) / len;
            const uy = (q.y - o.y) / len;
            return (
              <MathChip
                x={q.x + ux * 12}
                y={q.y + uy * 14 + 4}
                text={text}
                anchor={ux > 0.3 ? 'start' : ux < -0.3 ? 'end' : 'middle'}
                w={cw}
                h={h}
                color={color}
              />
            );
          };
          const arc = (from: number, to: number, r: number, text: string, color: string) => {
            if (Math.abs(to - from) < 1) return null;
            const o = P(0, 0);
            const n = Math.max(2, Math.ceil(Math.abs(to - from) / 4));
            const d = Array.from({ length: n + 1 }, (_, i) => {
              const t = (from + ((to - from) * i) / n) * RAD;
              return `${i ? 'L' : 'M'} ${o.x + r * Math.cos(t)} ${o.y - r * Math.sin(t)}`;
            }).join(' ');
            // The label at the arc's middle, moved off an axis (its numbers sit there).
            let m = (from + to) / 2;
            const axis = [0, 90, 180, 270, 360].find((k) => Math.abs(m - k) < 22);
            if (axis !== undefined && Math.abs(to - from) > 60) m = axis + (m >= axis ? 26 : -26);
            const mid = m * RAD;
            // A wide arc sweeps past the axis numbers: its value stays in the caption.
            if (Math.abs(to - from) > 150 && text.startsWith('θ')) text = 'θ';
            return (
              <G>
                <Path d={d} stroke={color} strokeWidth={chart.strokeLight} fill="none" />
                <MathChip
                  x={o.x + (r + 14) * Math.cos(mid)}
                  y={o.y - (r + 14) * Math.sin(mid) + 4}
                  text={text}
                  w={cw}
                  h={h}
                  bold={false}
                  color={color}
                />
              </G>
            );
          };
          const za = argOf(z.a, z.b);
          const zr = Math.hypot(z.a, z.b);
          return (
            <>
              <Svg width={cw} height={h}>
                <HsdGrid
                  f={f}
                  step={{ x: win.value.step, y: win.value.step }}
                  names={{ x: 'Re', y: 'Im' }}
                  yText={(v) => complexText(0, v)}
                />
                {/* The conjugate: z reflected across the real axis. */}
                {spec.conjugate && z.known && Math.abs(z.b) > 1e-9 ? (
                  <G>
                    <Line
                      x1={f.sx(z.a)}
                      y1={f.sy(z.b)}
                      x2={f.sx(z.a)}
                      y2={f.sy(-z.b)}
                      stroke={c.chartMuted}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={chart.dashFine}
                    />
                    {arrow({ a: z.a, b: -z.b }, c.hopBack, undefined, undefined, chart.stroke)}
                    <Circle cx={f.sx(z.a)} cy={f.sy(-z.b)} r={5} fill={c.hopBack} />
                    {tipLabel({ a: z.a, b: -z.b }, `z̄ = ${complexText(z.a, -z.b)}`, c.hopBack)}
                  </G>
                ) : null}
                {/* The second number, and the parallelogram of a sum. */}
                {w && res ? (
                  <G opacity={allKnown ? 1 : 0.35}>
                    {op === 'sum' ? (
                      <G>
                        {arrow(res, c.chartHighlight, w, chart.dash, chart.strokeLight)}
                        {arrow(res, c.hopBack, { a: z.a, b: z.b }, chart.dash, chart.strokeLight)}
                      </G>
                    ) : null}
                    {op === 'difference' ? (
                      <G>
                        {arrow(
                          { a: -w.a, b: -w.b },
                          c.hopBack,
                          undefined,
                          chart.dash,
                          chart.stroke,
                        )}
                        {arrow(res, c.hopBack, { a: z.a, b: z.b }, chart.dash, chart.strokeLight)}
                        {tipLabel({ a: -w.a, b: -w.b }, '−w', c.hopBack)}
                      </G>
                    ) : null}
                    {op === 'product' ? (
                      <G>
                        {arc(0, argOf(w.a, w.b), 22, `${short(argOf(w.a, w.b))}°`, c.hopBack)}
                        {arc(
                          0,
                          argOf(res.a, res.b) < argOf(z.a, z.b)
                            ? argOf(res.a, res.b) + 360
                            : argOf(res.a, res.b),
                          70,
                          `${short(argOf(res.a, res.b))}°`,
                          c.vectorResultant,
                        )}
                      </G>
                    ) : null}
                    {arrow(w, c.hopBack)}
                    {tipLabel(w, `w = ${complexText(w.a, w.b)}`, c.hopBack)}
                    {arrow(res, c.vectorResultant)}
                    <Circle cx={f.sx(res.a)} cy={f.sy(res.b)} r={5} fill={c.vectorResultant} />
                    {tipLabel(
                      res,
                      `${op === 'sum' ? 'z + w' : op === 'difference' ? 'z − w' : 'zw'} = ${complexText(res.a, res.b)}`,
                      c.vectorResultant,
                    )}
                  </G>
                ) : null}
                {/* z, with its modulus and argument. */}
                <G opacity={z.known ? 1 : 0.35}>
                  {(spec.argument || spec.polar || zPolar || op === 'product') && zr > 1e-9
                    ? arc(
                        0,
                        za,
                        op === 'product' ? 46 : 24,
                        spec.argument || spec.polar || zPolar
                          ? `θ = ${short(za)}°`
                          : `${short(za)}°`,
                        c.chartInk,
                      )
                    : null}
                  {spec.modulus && zr > 1e-9 ? (
                    <Line
                      x1={f.sx(z.a)}
                      y1={f.sy(z.b)}
                      x2={f.sx(z.a)}
                      y2={f.sy(0)}
                      stroke={c.chartMuted}
                      strokeWidth={1}
                      strokeDasharray={chart.dashFine}
                    />
                  ) : null}
                  {arrow({ a: z.a, b: z.b }, c.chartHighlight)}
                  <Circle cx={f.sx(z.a)} cy={f.sy(z.b)} r={5.5} fill={c.chartHighlight} />
                  {tipLabel({ a: z.a, b: z.b }, `z = ${zText}`, c.chartHighlight)}
                  {spec.modulus && zr * f.ux > 50
                    ? (() => {
                        // |z| along the arrow, on its clockwise side.
                        const q = P(z.a / 2, z.b / 2);
                        const len = zr * f.ux;
                        const nx = (f.sy(z.b) - f.sy(0)) / len;
                        const ny = -(f.sx(z.a) - f.sx(0)) / len;
                        return (
                          <MathChip
                            x={q.x - nx * 16}
                            y={q.y - ny * 16 + 4}
                            text={`|z| = ${magnitudeText(z.a, z.b).split(' ≈')[0]}`}
                            w={cw}
                            h={h}
                            bold={false}
                          />
                        );
                      })()
                    : null}
                </G>
              </Svg>
              {!spec.fixed && z.known
                ? (() => {
                    const ids = (
                      'modulus' in spec.z
                        ? [spec.z.modulus, spec.z.argument]
                        : [spec.z.re, spec.z.im]
                    ).filter((x): x is string => typeof x === 'string');
                    if (!ids.length) return null;
                    return (
                      <DragHandle
                        testID="drag-z"
                        x={f.sx(z.a)}
                        y={f.sy(z.b)}
                        label="z"
                        onStart={() => {
                          drag.current = { a: z.a, b: z.b };
                          win.freeze();
                        }}
                        onMove={(dx, dy) => {
                          const a = drag.current.a + dx / f.ux;
                          const b = drag.current.b - dy / f.uy;
                          const next: Values = {};
                          const put = (id: number | string, x: number) => {
                            if (typeof id === 'string')
                              next[id] = rep.snapTo(id, x * rep.factor(id));
                          };
                          if ('modulus' in spec.z) {
                            put(spec.z.modulus, Math.hypot(a, b));
                            put(spec.z.argument, argOf(a, b));
                          } else {
                            put(spec.z.re, a);
                            put(spec.z.im, b);
                          }
                          const others = spec.w
                            ? [spec.w.re, spec.w.im].filter(
                                (x): x is string => typeof x === 'string',
                              )
                            : [];
                          calc.set(
                            { ...rep.pin(spec.keep ?? others), ...next },
                            rep.slide(ids[0]!),
                          );
                        }}
                        onEnd={win.release}
                      />
                    );
                  })()
                : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
