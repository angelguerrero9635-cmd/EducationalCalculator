import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { VectorDiagramSpec } from '@/data/modules/typesHsd';
import type { Values } from '@/engine/types';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen } from './common';
import { makeFrame } from './graphKit';
import { centerOf } from './he4bMath';
import { around, labelPlacer, par, useValues } from './he4bKit';
import { HsdGrid, handleBox, niceStep, niceWindow } from './hsdGrid';
import { short } from './hsdKit';
import { MathChip } from './hsdText';
import { SubLabel } from './hskKit';
import { Ball, FloorShadow, TopLight, url, usePaintIds } from './paint';

/** Ball radii (px) for the lightest and heaviest mass drawn: area grows with mass. */
const R_MIN = 9;
const R_MAX = 24;

/**
 * HC100: point masses on a ruler, balls sized by mass on a light rod with the balance point
 * x_cm = Σmx ÷ Σm marked by a fulcrum under it; on a plane (any mass with y) the masses on a
 * grid and the center of mass marked ⊕. Drag a mass along the ruler (or over the plane).
 */
export function VectorMasses({ spec, calc }: { spec: VectorDiagramSpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, v, known, text } = useValues(calc);
  const ids = usePaintIds('ball', 'rod', 'stand');
  const list = spec.masses!;
  const plane = list.some((q) => q.y !== undefined);
  const ms = list.map((q, i) => ({
    name: q.name ?? `m${'₁₂₃₄₅₆₇₈₉'[i] ?? ''}`,
    m: v(q.m),
    x: v(q.x),
    y: v(q.y),
    known: known(q.m) && known(q.x) && known(q.y),
    spec: q,
  }));
  const ready = ms.every((q) => q.known) && ms.every((q) => q.m > 0);
  const cm = ready ? centerOf(ms) : undefined;
  // The balance point's name, typeset with SubLabel ("x_cm" draws cm lowered).
  const nameCm = spec.vectors[0]?.name || 'x_cm';
  const unitX = typeof list[0]?.x === 'string' ? (rep.unit(list[0].x) ?? 'm') : 'm';
  const unitM = typeof list[0]?.m === 'string' ? (rep.unit(list[0].m) ?? 'kg') : 'kg';
  const big = Math.max(1e-9, ...ms.map((q) => q.m));
  const radius = (m: number) =>
    (plane ? 0.55 : 1) * (R_MIN + (R_MAX - R_MIN) * Math.sqrt(Math.max(0, m) / big));

  // The window: every mass and the origin, held still while a mass is dragged.
  const live = (() => {
    const wx = niceWindow(
      ms.map((q) => q.x),
      plane ? 6 : 8,
      0.08,
      1,
      plane ? 0.6 : 1.5,
    );
    if (!plane) return { x: wx, y: wx, step: wx.step };
    const wy = niceWindow(
      ms.map((q) => q.y),
      6,
      0.12,
      1,
      0.6,
    );
    const step = Math.max(wx.step, wy.step);
    const r = (w: { lo: number; hi: number }) => ({
      lo: Math.floor(w.lo / step) * step,
      hi: Math.ceil(w.hi / step) * step,
      step,
    });
    return { x: r(wx), y: r(wy), step };
  })();
  const win = useFrozen(live);
  const drag = useRef({ x: 0, y: 0 });

  // Caption: the weighted sum over the total.
  const sumText = (k: 'x' | 'y') => ms.map((q) => `${short(q.m)} × ${par(q[k])}`).join(' + ');
  const total = ms.reduce((s, q) => s + q.m, 0);
  const lines: string[] = [];
  if (!ready) lines.push('The balance point is Σmx ÷ Σm: ? until every mass and place is known.');
  else if (cm) {
    lines.push(
      `M = ${ms.map((q) => short(q.m)).join(' + ')} = ${short(total)} ${unitM}.`,
      `The balance point is at x = (${sumText('x')}) ÷ ${short(total)} = ${short(cm.x)} ${unitX}${plane ? '' : '.'}`,
    );
    if (plane) lines[1] += `, y = (${sumText('y')}) ÷ ${short(total)} = ${short(cm.y)} ${unitX}.`;
    lines.push(
      plane
        ? 'Held up at that point, the plate of masses balances.'
        : 'On the fulcrum, the turning effects of the masses on each side cancel.',
    );
  }

  const dragging = (i: number, f: { ux: number; uy: number }) => ({
    onStart: () => {
      drag.current = { x: ms[i]!.x, y: ms[i]!.y };
      win.freeze();
    },
    onMove: (dx: number, dy: number) => {
      const q = list[i]!;
      const next: Values = {};
      const put = (id: number | string | undefined, x: number) => {
        if (typeof id === 'string') next[id] = rep.snapTo(id, x * rep.factor(id));
      };
      const ws = win.value;
      put(q.x, Math.min(ws.x.hi, Math.max(ws.x.lo, drag.current.x + dx / f.ux)));
      if (plane) put(q.y, Math.min(ws.y.hi, Math.max(ws.y.lo, drag.current.y - dy / f.uy)));
      const others = list
        .flatMap((o, j) => (j === i ? [o.m] : [o.m, o.x, o.y]))
        .filter((x): x is string => typeof x === 'string');
      calc.set({ ...rep.pin(spec.keep ?? others), ...next }, rep.slide(q.x as string));
    },
    onEnd: win.release,
  });
  const draggable = (i: number) => !spec.fixed && ms[i]!.known && typeof list[i]!.x === 'string';

  return (
    <View>
      <Canvas aspect={plane ? 0.82 : (w) => 210 / w}>
        {({ w, h }) => (plane ? planeView(w, h) : lineView(w, h))}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );

  /** The masses on a light rod over a ruler, the fulcrum under x_cm. */
  function lineView(w: number, h: number) {
    const ws = win.value.x;
    const left = 30;
    const right = w - 30;
    const X = (x: number) => left + ((x - ws.lo) / (ws.hi - ws.lo)) * (right - left);
    const rodY = 96;
    const rulerY = 164;
    const L = labelPlacer(w, h);
    const fx = cm ? X(cm.x) : undefined;
    const xs = ms.filter((q) => q.known).map((q) => X(q.x));
    const [r0, r1] = xs.length ? [Math.min(...xs), Math.max(...xs)] : [0, 0];
    const step = ws.step ?? niceStep((ws.hi - ws.lo) / 8);
    const ticks: number[] = [];
    for (let t = Math.ceil(ws.lo / step - 1e-9) * step; t <= ws.hi + 1e-9; t += step)
      ticks.push(Number(t.toFixed(9)));
    const every = step * ((right - left) / (ws.hi - ws.lo)) < 34 ? 2 : 1;
    // Mass labels above the balls first, then the balance point's.
    const massLabels = ms.map((q, i) => {
      if (!q.known) return null;
      const t = `${text(list[i]!.m, q.m, unitM)}`;
      const s = L.put(t, [
        { x: X(q.x), y: rodY - radius(q.m) - 8 },
        { x: X(q.x), y: rodY - radius(q.m) - 26 },
      ]);
      return <MathChip key={`m${i}`} x={s.x} y={s.y} text={t} w={w} h={h} anchor={s.anchor} />;
    });
    const cmLabel =
      cm && fx !== undefined
        ? (() => {
            const t = `${nameCm} = ${short(cm.x)} ${unitX}`;
            const shown = t.replace(/_(\w+)/g, '$1');
            const s = L.put(shown, [
              { x: fx + 22, y: rodY + 30, anchor: 'start' },
              { x: fx - 22, y: rodY + 30, anchor: 'end' },
              { x: fx, y: h - 6 },
            ]);
            return <SubLabel x={s.x} y={s.y} text={t} anchor={s.anchor} color={c.forceNet} w={w} />;
          })()
        : null;
    return (
      <>
        <Svg width={w} height={h}>
          <Defs>
            <Ball id={ids.ball} color={c.metal} />
            <TopLight id={ids.rod} />
            <TopLight id={ids.stand} />
          </Defs>
          {/* The ruler: metres along the line. */}
          <Line
            x1={left}
            y1={rulerY}
            x2={right}
            y2={rulerY}
            stroke={c.chartInk}
            strokeWidth={1.5}
          />
          {ticks.map((t, k) => (
            <G key={`t${t}`}>
              <Line
                x1={X(t)}
                y1={rulerY}
                x2={X(t)}
                y2={rulerY + (k % every ? 4 : 7)}
                stroke={c.chartInk}
                strokeWidth={1}
              />
              {k % every === 0 ? (
                <ChartText
                  x={X(t)}
                  y={rulerY + 20}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fill={c.chartMuted}
                >
                  {short(t)}
                </ChartText>
              ) : null}
            </G>
          ))}
          <MathChip
            x={right}
            y={rulerY - 6}
            text={`x (${unitX})`}
            w={w}
            h={h}
            anchor="end"
            bold={false}
          />
          {/* Where each mass sits, dropped to the ruler. */}
          {ms.map((q, i) =>
            q.known ? (
              <Line
                key={`d${i}`}
                x1={X(q.x)}
                y1={rodY}
                x2={X(q.x)}
                y2={rulerY}
                stroke={c.chartMuted}
                strokeWidth={1}
                strokeDasharray={chart.dashFine}
              />
            ) : null,
          )}
          {/* The light rod joining the masses. */}
          {xs.length > 1 ? (
            <G>
              <Rect x={r0 - 6} y={rodY - 3} width={r1 - r0 + 12} height={6} rx={3} fill={c.wood} />
              <Rect
                x={r0 - 6}
                y={rodY - 3}
                width={r1 - r0 + 12}
                height={6}
                rx={3}
                fill={url(ids.rod)}
              />
            </G>
          ) : null}
          {ms.map((q, i) =>
            q.known ? (
              <G key={`b${i}`}>
                <Circle
                  cx={X(q.x)}
                  cy={rodY}
                  r={radius(q.m)}
                  fill={url(ids.ball)}
                  stroke={c.metalDark}
                  strokeWidth={1}
                />
              </G>
            ) : null,
          )}
          {/* The fulcrum under the balance point, on the floor of the ruler. */}
          {cm && fx !== undefined ? (
            <G>
              <Line
                x1={fx}
                y1={rodY}
                x2={fx}
                y2={rulerY}
                stroke={c.forceNet}
                strokeWidth={1.5}
                strokeDasharray={chart.dash}
              />
              <FloorShadow cx={fx} cy={rodY + 37} rx={18} ry={3} />
              <Path
                d={`M ${fx} ${rodY + 4} L ${fx - 16} ${rodY + 36} L ${fx + 16} ${rodY + 36} Z`}
                fill={c.metalDark}
              />
              <Path
                d={`M ${fx} ${rodY + 4} L ${fx - 16} ${rodY + 36} L ${fx + 16} ${rodY + 36} Z`}
                fill={url(ids.stand)}
              />
            </G>
          ) : null}
          {massLabels}
          {cmLabel}
        </Svg>
        {ms.map((q, i) =>
          draggable(i) ? (
            <DragHandle
              key={`h${i}`}
              testID={`drag-mass-${i + 1}`}
              x={X(q.x)}
              y={rodY}
              label={`mass ${i + 1}`}
              {...dragging(i, { ux: (right - left) / (ws.hi - ws.lo), uy: 1 })}
            />
          ) : null,
        )}
      </>
    );
  }

  /** The masses on a grid, the center of mass marked ⊕. */
  function planeView(w: number, h: number) {
    const ws = win.value;
    const f = makeFrame(w, h, [ws.x.lo, ws.x.hi], [ws.y.lo, ws.y.hi], true, true);
    const P = (x: number, y: number) => ({ x: f.sx(x), y: f.sy(y) });
    const pts = ms.filter((q) => q.known).map((q) => P(q.x, q.y));
    const L = labelPlacer(w, h, pts);
    // The axis names' corners stay clear.
    const [ax, ay] = [f.sx(Math.max(ws.x.lo, 0)), f.sy(Math.max(ws.y.lo, 0))];
    L.take({ left: f.sx(ws.x.hi) - 52, right: f.sx(ws.x.hi) + 4, top: ay - 18, bottom: ay + 6 });
    L.take({ left: ax - 4, right: ax + 56, top: f.sy(ws.y.hi) - 4, bottom: f.sy(ws.y.hi) + 22 });
    const C = cm ? P(cm.x, cm.y) : undefined;
    const labels = ms.map((q, i) => {
      if (!q.known) return null;
      const p = P(q.x, q.y);
      const t = `${q.name} = ${text(list[i]!.m, q.m, unitM)}`;
      const s = L.put(t, around(p.x, p.y, radius(q.m) + 4));
      return <MathChip key={`m${i}`} x={s.x} y={s.y} text={t} w={w} h={h} anchor={s.anchor} />;
    });
    const cmLabel =
      C && cm
        ? (() => {
            const t = `(${short(cm.x)}, ${short(cm.y)}) ${unitX}`;
            const s = L.put(t, around(C.x, C.y, 14));
            return (
              <MathChip x={s.x} y={s.y} text={t} w={w} h={h} anchor={s.anchor} color={c.forceNet} />
            );
          })()
        : null;
    return (
      <>
        <Svg width={w} height={h}>
          <Defs>
            <Ball id={ids.ball} color={c.metal} />
          </Defs>
          <HsdGrid
            f={f}
            step={{ x: ws.step, y: ws.step }}
            names={{ x: `x (${unitX})`, y: `y (${unitX})` }}
            clear={[
              ...pts.map((p) => handleBox(p.x, p.y)),
              ...L.boxes.map((b) => ({ l: b.left, t: b.top, r: b.right, b: b.bottom })),
            ]}
          />
          {ms.map((q, i) => {
            if (!q.known) return null;
            const p = P(q.x, q.y);
            return (
              <Circle
                key={`b${i}`}
                cx={p.x}
                cy={p.y}
                r={radius(q.m)}
                fill={url(ids.ball)}
                stroke={c.metalDark}
                strokeWidth={1}
              />
            );
          })}
          {C ? (
            <G>
              <Circle cx={C.x} cy={C.y} r={9} fill={c.card} stroke={c.forceNet} strokeWidth={2.5} />
              <Line
                x1={C.x - 9}
                y1={C.y}
                x2={C.x + 9}
                y2={C.y}
                stroke={c.forceNet}
                strokeWidth={2}
              />
              <Line
                x1={C.x}
                y1={C.y - 9}
                x2={C.x}
                y2={C.y + 9}
                stroke={c.forceNet}
                strokeWidth={2}
              />
            </G>
          ) : null}
          {labels}
          {cmLabel}
        </Svg>
        {ms.map((q, i) =>
          draggable(i) ? (
            <DragHandle
              key={`h${i}`}
              testID={`drag-mass-${i + 1}`}
              x={P(q.x, q.y).x}
              y={P(q.x, q.y).y}
              label={`mass ${i + 1}`}
              {...dragging(i, f)}
            />
          ) : null,
        )}
      </>
    );
  }
}
