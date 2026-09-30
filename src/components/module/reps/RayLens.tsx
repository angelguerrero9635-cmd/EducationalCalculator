import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path } from 'react-native-svg';

import type { RayDiagramSpec } from '@/data/modules/typesHsk';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle, useFrozen, useRep } from './common';
import { thinLensOf } from './hskMath';
import { sig, SubLabel, Vec } from './hskKit';
import { Glass, Metal, url, usePaintIds } from './paint';

type Spec = Extract<RayDiagramSpec, { mode: 'lens' | 'mirror' }>;

/** A signed number in brackets for substituting: (−12). */
const par = (s: string) => (s.startsWith('−') ? `(${s})` : s);

/** Clips the segment a→b to the box; undefined when it misses. */
function clip(
  a: { x: number; y: number },
  b: { x: number; y: number },
  box: { x0: number; y0: number; x1: number; y1: number },
) {
  let [t0, t1] = [0, 1];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  for (const [p, q] of [
    [-dx, a.x - box.x0],
    [dx, box.x1 - a.x],
    [-dy, a.y - box.y0],
    [dy, box.y1 - a.y],
  ] as const) {
    if (Math.abs(p) < 1e-12) {
      if (q < 0) return undefined;
    } else {
      const r = q / p;
      if (p < 0) t0 = Math.max(t0, r);
      else t1 = Math.min(t1, r);
    }
  }
  if (t0 > t1) return undefined;
  return {
    x1: a.x + t0 * dx,
    y1: a.y + t0 * dy,
    x2: a.x + t1 * dx,
    y2: a.y + t1 * dy,
  };
}

/**
 * A lens or a curved mirror (H66): the object, the focal points, the three principal rays
 * and the image where they meet (real, solid) or seem to come from (virtual, dashed), from
 * 1/f = 1/dₒ + 1/dᵢ. Lines stay lines under the drawing's two scales, so the rays meet at the
 * image exactly. Drag the object along the axis.
 */
export function RayLens({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('glass', 'mirror');
  const drag = useRef(0);
  const si = (x: number | string | undefined, d = 0) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) => typeof x !== 'string' || rep.known(x);
  const mirror = spec.mode === 'mirror';
  // A page may give f signed (− for a diverging lens or convex mirror): the shape sets the sign.
  const focal = Math.max(1e-9, Math.abs(si(spec.focal, 10)));
  const dO = Math.max(1e-9, si(spec.objectDistance, 20));
  const hO = si(spec.objectHeight, 1) || 1;
  const L = thinLensOf(spec.shape, focal, dO, hO);
  const f = L.f;
  const all = [spec.focal, spec.objectDistance, spec.objectHeight].every(known);
  const unit =
    typeof spec.objectDistance === 'string'
      ? (rep.variable(spec.objectDistance).unit ?? 'cm')
      : 'cm';
  const far = Math.max(dO, 2 * focal);
  const imgFar = !Number.isFinite(L.dI) || Math.abs(L.dI) > 3.2 * far;
  // Where the image is drawn (x along the axis; the element at 0, the object on the left).
  const xI = mirror ? -L.dI : L.dI;
  const win = useFrozen({
    x0: -Math.max(far, !imgFar && xI < 0 ? -xI : 0) * 1.15,
    x1:
      Math.max(
        mirror ? 0.35 * far : far,
        !imgFar && xI > 0 ? xI : 0,
        mirror && f < 0 ? -f * 1.2 : 0,
      ) * 1.15,
    h: Math.max(Math.abs(hO), imgFar ? 0 : Math.min(Math.abs(L.hI), 3 * Math.abs(hO))) * 1.6,
  });
  const lines = captionLines();

  return (
    <View>
      <Canvas aspect={0.64}>
        {({ w, h }) => {
          const W = win.value;
          const box = { x0: 6, y0: 6, x1: w - 6, y1: h - 30 };
          const mid = (box.y0 + box.y1) / 2;
          const X = (x: number) => box.x0 + ((x - W.x0) / (W.x1 - W.x0)) * (box.x1 - box.x0);
          const Y = (y: number) => mid - (y / W.h) * ((box.y1 - box.y0) / 2);
          const O = { x: X(0), y: Y(0) };
          const P = { x: X(-dO), y: Y(hO) };
          const I = Number.isFinite(L.dI) ? { x: X(xI), y: Y(L.hI) } : undefined;
          // The three principal rays hit the element at these heights.
          const hits = [hO, 0, Math.abs(dO - f) > 1e-9 ? (-hO * f) / (dO - f) : NaN];
          const colors = [c.physRay, c.chartHighlight, c.forceApplied];
          const aperture = Math.max(
            ((box.y1 - box.y0) / 2) * 0.8,
            ...hits.filter(Number.isFinite).map((y) => Math.abs(Y(y) - mid) + 12),
          );
          const out = mirror ? -1 : 1;
          // Ray 2's way out when the image is at infinity: every ray leaves parallel to it.
          const parallel = mirror ? { x: -dO, y: -hO } : { x: dO, y: -hO };
          const rays = hits.map((y, i) => {
            if (!Number.isFinite(y)) return null;
            const H = { x: O.x, y: Y(y) };
            let dir: { x: number; y: number };
            let back: { x: number; y: number } | undefined;
            if (!I) dir = { x: X(parallel.x) - X(0), y: Y(parallel.y) - Y(0) };
            else if ((I.x - O.x) * out > 0) dir = { x: I.x - H.x, y: I.y - H.y };
            else {
              dir = { x: H.x - I.x, y: H.y - I.y };
              back = I;
            }
            const len = Math.hypot(dir.x, dir.y) || 1;
            const endPt = { x: H.x + (dir.x / len) * 2000, y: H.y + (dir.y / len) * 2000 };
            const seg = clip(H, endPt, box);
            const inSeg = clip(P, H, box);
            const backSeg = back ? clip(H, back, box) : undefined;
            return (
              <G key={i}>
                {inSeg ? <Line {...inSeg} stroke={colors[i]} strokeWidth={2} /> : null}
                {seg ? <Line {...seg} stroke={colors[i]} strokeWidth={2} /> : null}
                {seg ? (
                  <Vec
                    x1={seg.x1}
                    y1={seg.y1}
                    x2={seg.x1 + (seg.x2 - seg.x1) * 0.45}
                    y2={seg.y1 + (seg.y2 - seg.y1) * 0.45}
                    color={colors[i]!}
                    width={2}
                    head={8}
                  />
                ) : null}
                {backSeg ? (
                  <Line
                    {...backSeg}
                    stroke={colors[i]}
                    strokeWidth={1.5}
                    strokeDasharray={chart.dashFine}
                  />
                ) : null}
              </G>
            );
          });
          const marks = [
            { x: -Math.abs(focal), t: mirror ? 'F' : 'F' },
            { x: -2 * Math.abs(focal), t: mirror ? 'C' : '2F' },
            ...(mirror
              ? []
              : [
                  { x: Math.abs(focal), t: 'F′' },
                  { x: 2 * Math.abs(focal), t: '2F′' },
                ]),
          ].map((m) => (mirror && f < 0 ? { ...m, x: -m.x } : m));
          const concave = spec.shape === 'concave';
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Glass id={ids.glass} />
                  <Metal id={ids.mirror} light={c.metal} dark={c.metalDark} />
                </Defs>
                <Line x1={box.x0} y1={mid} x2={box.x1} y2={mid} stroke={c.chartMuted} />
                {/* The element: a glass lens, or a silvered mirror curving toward (concave) or away from the object. */}
                {mirror ? (
                  <Path
                    d={`M ${O.x + (concave ? 10 : -10)} ${mid - aperture} Q ${O.x + (concave ? -10 : 10)} ${mid} ${O.x + (concave ? 10 : -10)} ${mid + aperture}`}
                    stroke={c.metalDark}
                    strokeWidth={5}
                    fill="none"
                  />
                ) : spec.shape === 'converging' ? (
                  <Path
                    d={`M ${O.x} ${mid - aperture} Q ${O.x + 16} ${mid} ${O.x} ${mid + aperture} Q ${O.x - 16} ${mid} ${O.x} ${mid - aperture} Z`}
                    fill={url(ids.glass)}
                    stroke={c.glassEdge}
                    strokeWidth={1.5}
                  />
                ) : (
                  <Path
                    d={`M ${O.x - 10} ${mid - aperture} L ${O.x + 10} ${mid - aperture} Q ${O.x + 2} ${mid} ${O.x + 10} ${mid + aperture} L ${O.x - 10} ${mid + aperture} Q ${O.x - 2} ${mid} ${O.x - 10} ${mid - aperture} Z`}
                    fill={url(ids.glass)}
                    stroke={c.glassEdge}
                    strokeWidth={1.5}
                  />
                )}
                {marks.map((m) =>
                  m.x > W.x0 && m.x < W.x1 ? (
                    <G key={m.t}>
                      <Circle cx={X(m.x)} cy={mid} r={3.5} fill={c.chartInk} />
                      <SubLabel
                        x={X(m.x)}
                        y={mid + 18}
                        text={m.t}
                        size={chart.label}
                        chip={false}
                        w={w}
                      />
                    </G>
                  ) : null,
                )}
                <G opacity={all ? 1 : 0.4}>
                  {rays}
                  <Vec x1={P.x} y1={mid} x2={P.x} y2={P.y} color={c.chartInk} width={4} head={11} />
                  {I && !imgFar ? (
                    <Vec
                      x1={I.x}
                      y1={mid}
                      x2={I.x}
                      y2={I.y}
                      color={c.forceNet}
                      width={4}
                      head={11}
                      dash={(I.x - O.x) * out > 0 ? undefined : chart.dash}
                    />
                  ) : null}
                </G>
                <SubLabel
                  x={P.x}
                  y={h - 12}
                  text={`dₒ ${sig(dO)} ${unit}`}
                  size={chart.label}
                  w={w}
                />
                {I && !imgFar ? (
                  <SubLabel
                    x={I.x}
                    y={h - 12}
                    text={`dᵢ ${sig(L.dI)} ${unit}`}
                    size={chart.label}
                    color={c.forceNet}
                    w={w}
                  />
                ) : null}
              </Svg>
              {!spec.fixed &&
              typeof spec.objectDistance === 'string' &&
              rep.known(spec.objectDistance) ? (
                <DragHandle
                  testID="drag-object"
                  x={P.x}
                  y={P.y}
                  label={rep.variable(spec.objectDistance).name}
                  onStart={() => {
                    drag.current = dO;
                    win.freeze();
                  }}
                  onEnd={win.release}
                  onMove={(dx) => {
                    const id = spec.objectDistance as string;
                    const per = (W.x1 - W.x0) / (box.x1 - box.x0);
                    calc.set(
                      {
                        ...rep.pin(
                          [spec.focal, spec.objectHeight].filter(
                            (x): x is string => typeof x === 'string',
                          ),
                        ),
                        [id]: rep.snapTo(id, Math.max(1e-6, drag.current - dx * per)),
                      },
                      rep.slide(id),
                    );
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );

  function captionLines(): string[] {
    const fT = par(sig(f));
    const out = [`1/dᵢ = 1/f − 1/dₒ = 1/${fT} − 1/${sig(dO)}`];
    if (!Number.isFinite(L.dI)) {
      out.push('The object is at the focal point: the rays leave parallel and no image forms.');
      return out;
    }
    const real = L.dI > 0;
    out.push(
      `dᵢ = ${sig(L.dI)} ${unit}`,
      `m = −dᵢ/dₒ = −${par(sig(L.dI))}/${sig(dO)} = ${sig(L.m)}`,
      `${real ? 'Real' : 'Virtual'}, ${L.m < 0 ? 'inverted' : 'upright'} and ${Math.abs(L.m) > 1 + 1e-9 ? 'enlarged' : Math.abs(L.m) < 1 - 1e-9 ? 'smaller' : 'the same size'}: ${
        real
          ? `the rays really meet ${mirror ? 'in front of the mirror' : 'behind the lens'}.`
          : `the rays only seem to come from ${mirror ? 'behind the mirror' : 'in front of the lens'} (dashed).`
      }`,
    );
    if (imgFar) out.push('The image is too far away to draw at this scale.');
    return out;
  }
}
