import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Rect } from 'react-native-svg';

import type { ImpulseSpec } from '@/data/modules/typesHs2c';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle, useFrozen, useRep } from './common';
import { sig, SubLabel, Vec } from './hskKit';
import { axisOf, makePlot, PlotFrame } from './hsjPlot';

/** A signed number in brackets for substituting: (−2). */
const par = (s: string) => (s.startsWith('−') ? `(${s})` : s);

/** Height of the momentum band above the graph. */
const TOP = 118;

/**
 * Impulse (H102): the momentum before and after as arrows on one scale and the change Δp from
 * the first tip to the second; under them the force–time graph, a rectangle F high and Δt wide
 * whose area is Δp. A second time (`compare`) spreads the same Δp wider and lower, dashed: a
 * slower stop needs less force. Drag the rectangle's right edge for Δt.
 */
export function Impulse({ spec, calc }: { spec: ImpulseSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const drag = useRef(0);
  // Formula (SI) units: the picture works in kg, m/s, s and N whatever the boxes show.
  const numOrVar = (x: number | string | undefined, fallback = 0) =>
    x === undefined
      ? { value: fallback, known: true, id: undefined }
      : typeof x === 'number'
        ? { value: x, known: true, id: undefined }
        : { value: rep.val(x), known: rep.known(x), id: x };
  const m = numOrVar(spec.mass, 1);
  const v0 = numOrVar(spec.before);
  const v = numOrVar(spec.after);
  const t = numOrVar(spec.time, 1);
  const t2 = spec.compare === undefined ? undefined : numOrVar(spec.compare, 1);
  const all = [m, v0, v, t, ...(t2 ? [t2] : [])].every((x) => x.known);
  const dt = Math.max(1e-9, t.value);
  const p0 = m.value * v0.value;
  const p1 = m.value * v.value;
  const dp = p1 - p0;
  const F = dp / dt;
  const dt2 = t2 ? Math.max(1e-9, t2.value) : undefined;
  const F2 = dt2 ? dp / dt2 : undefined;
  // The graph's window stays put while Δt is dragged.
  const win = useFrozen({
    t: axisOf(0, Math.max(dt, dt2 ?? 0) * 1.25, 5),
    f: axisOf(Math.min(0, F, F2 ?? 0) * 1.15, Math.max(0, F, F2 ?? 0) * 1.15, 4),
  });

  return (
    <View>
      <Canvas aspect={(w) => Math.max(0.9, 330 / w)}>
        {({ w, h }) => {
          // Momentum arrows on one scale, the tails at 0.
          const lo = Math.min(0, p0, p1);
          const hi = Math.max(0, p0, p1);
          const pad = 30;
          const k = (w - 2 * pad) / Math.max(1e-12, hi - lo);
          const x0 = pad - lo * k;
          const rows = [
            {
              y: 32,
              x1: x0,
              x2: x0 + p0 * k,
              color: c.physCartA,
              text: `p_0 = mv_0 = ${sig(p0)} kg·m/s`,
            },
            {
              y: 66,
              x1: x0,
              x2: x0 + p1 * k,
              color: c.physCartB,
              text: `p = mv = ${sig(p1)} kg·m/s`,
            },
            {
              y: 100,
              x1: x0 + p0 * k,
              x2: x0 + p1 * k,
              color: c.forceNet,
              text: `Δp = ${sig(dp)} kg·m/s`,
            },
          ];
          const gh = h - TOP;
          const plot = makePlot(w, gh, win.value.t, win.value.f, { L: 52, R: 16, T: 10, B: 40 });
          const [X0, X1] = [plot.sx(0), plot.sx(dt)];
          const [Y0, Y1] = [plot.sy(0), plot.sy(F)];
          const box = (a: number, b: number) => ({ y: Math.min(a, b), h: Math.abs(a - b) });
          const main = box(Y0, Y1);
          const other = F2 !== undefined && dt2 ? box(Y0, plot.sy(F2)) : undefined;
          const inside = X1 - X0 > 110 && main.h > 22;
          // The other Δt's label: in its dashed box when it fits there, else right of both
          // boxes, else under its box (it ran over the F axis when the box was narrow).
          const t2Text = F2 !== undefined && dt2 ? `same Δp over ${sig(dt2)} s: ${sig(F2)} N` : '';
          const t2W = t2Text.length * chart.label * 0.6;
          const t2End = dt2 ? plot.sx(dt2) : X0;
          const t2In = t2End - 4 - t2W >= X0;
          const t2Right = Math.max(t2End, X1) + 6;
          const t2Out = !t2In && t2Right + t2W <= w - 4;
          return (
            <>
              <Svg width={w} height={h}>
                <G opacity={all ? 1 : 0.45}>
                  <Line x1={x0} y1={18} x2={x0} y2={78} stroke={c.chartMuted} strokeWidth={1} />
                  {rows.map((r) => (
                    <G key={r.y}>
                      <Vec x1={r.x1} y1={r.y} x2={r.x2} y2={r.y} color={r.color} head={9} />
                      {Math.abs(r.x2 - r.x1) < 2 ? (
                        <Rect x={r.x1 - 3} y={r.y - 3} width={6} height={6} fill={r.color} />
                      ) : null}
                      <SubLabel
                        x={(r.x1 + r.x2) / 2}
                        y={r.y - 9}
                        text={r.text}
                        color={r.color}
                        w={w}
                      />
                    </G>
                  ))}
                </G>
                <G transform={`translate(0 ${TOP})`} opacity={all ? 1 : 0.45}>
                  <PlotFrame p={plot} xName="Time t (s)" yName="Force F (N)" />
                  {other && dt2 ? (
                    <Rect
                      x={X0}
                      y={other.y}
                      width={plot.sx(dt2) - X0}
                      height={other.h}
                      fill="none"
                      stroke={c.physCartA}
                      strokeWidth={2}
                      strokeDasharray="6 4"
                    />
                  ) : null}
                  <Rect
                    x={X0}
                    y={main.y}
                    width={X1 - X0}
                    height={main.h}
                    fill={c.forceNet}
                    fillOpacity={0.25}
                    stroke={c.forceNet}
                    strokeWidth={2}
                  />
                  <SubLabel
                    x={inside ? (X0 + X1) / 2 : X1 + 6}
                    y={
                      inside
                        ? main.y + main.h / 2 + 5
                        : F >= 0
                          ? Math.max(main.y + 14, 24)
                          : Math.min(main.y + main.h - 4, gh - plot.B - 6)
                    }
                    anchor={inside ? 'middle' : 'start'}
                    text={`F = ${sig(F)} N, area Δp`}
                    color={c.forceNet}
                    w={w}
                  />
                  {other && F2 !== undefined && dt2 ? (
                    <SubLabel
                      x={t2In ? t2End - 4 : t2Out ? t2Right : X0 + 4}
                      y={
                        other.h > 20 && (t2In || t2Out)
                          ? other.y + other.h / 2 + 5
                          : F2 >= 0
                            ? other.y - 6
                            : other.y + other.h + 16
                      }
                      anchor={t2In ? 'end' : 'start'}
                      text={t2Text}
                      color={c.physCartA}
                      w={w}
                    />
                  ) : null}
                </G>
              </Svg>
              {!spec.fixed && t.id && rep.known(t.id) ? (
                <DragHandle
                  testID="drag-time"
                  x={X1}
                  y={TOP + (main.h > 30 ? main.y + main.h / 2 : Y0)}
                  label={rep.variable(t.id).name}
                  onStart={() => {
                    drag.current = rep.val(t.id!);
                    win.freeze();
                  }}
                  onEnd={win.release}
                  onMove={(dx) => {
                    const id = t.id!;
                    const per = (plot.sx(win.value.t.hi) - X0) / (win.value.t.hi || 1);
                    const keep = [m.id, v0.id, v.id].filter((x): x is string => !!x);
                    calc.set(
                      { ...rep.pin(keep), [id]: rep.snapTo(id, drag.current + dx / per) },
                      rep.slide(id),
                    );
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{captionLines().join(' · ')}</Caption>
    </View>
  );

  function captionLines(): string[] {
    const out = [
      `Change in momentum: Δp = m(v − v₀) = ${sig(m.value)} × (${sig(v.value)} − ${par(sig(v0.value))}) = ${sig(dp)} kg·m/s`,
      `Average force: F = Δp/Δt = ${sig(dp)}/${sig(dt)} = ${sig(F)} N`,
    ];
    if (F2 !== undefined && dt2)
      out.push(
        dt2 > dt
          ? `Spread over ${sig(dt2)} s, the same Δp needs only ${sig(F2)} N: a slower stop, a smaller force.`
          : `Squeezed into ${sig(dt2)} s, the same Δp needs ${sig(F2)} N: a quicker stop, a bigger force.`,
      );
    out.push('The area under the force–time graph, FΔt, is the impulse: the change in momentum.');
    return out;
  }
}
