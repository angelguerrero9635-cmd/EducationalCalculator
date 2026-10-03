/**
 * HC104 `spacetime` (SpacetimeSpec in typesHe4c.ts): a Minkowski diagram, flat, x across and ct
 * up on one scale with the light lines at 45°. `lorentz`: the moving frame's axes tilted by
 * tan⁻¹β, an event read on both sets of axes, the invariant hyperbola through it (drag the
 * event). `addition`: the world lines of S′, of an object moving in S′, and the Galilean sum
 * dashed beside the true one (drag the object's world line for u′).
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, TSpan } from 'react-native-svg';

import type { SpacetimeSpec } from '@/data/modules/typesHe4c';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen } from './common';
import { Arrow } from './he1fKit';
import { fmt, tagW } from './he2fKit';
import { fmtP, useHe4c } from './he4cKit';
import { addVelocities, fromPrimed, lorentzOf } from './he4cMath';

type Lorentz = Extract<SpacetimeSpec, { mode: 'lorentz' }>;
type Addition = Extract<SpacetimeSpec, { mode: 'addition' }>;

const DEG = Math.PI / 180;
const ROW = 18;

export function Spacetime({ spec, calc }: { spec: SpacetimeSpec; calc: Calculator }) {
  if (spec.mode === 'addition') return <AdditionView spec={spec} calc={calc} />;
  return <LorentzView spec={spec} calc={calc} />;
}

/**
 * A label in college notation on a chip: every letter of the symbol (before " = ") italic, so
 * "ct′ = 75 m" reads as c·t; the value and unit upright.
 */
function MathTag({
  x,
  y,
  text,
  color,
  anchor = 'start',
  w,
}: {
  x: number;
  y: number;
  text: string;
  color?: string;
  anchor?: 'start' | 'middle' | 'end';
  /** The canvas width, to keep the label inside it. */
  w?: number;
}) {
  const c = usePalette();
  const size = chart.label;
  const width = tagW(text, size);
  let left = anchor === 'start' ? x : anchor === 'end' ? x - width : x - width / 2;
  if (w !== undefined) left = Math.min(w - width - 4, Math.max(4, left));
  const i = text.indexOf(' = ');
  const [sym, rest] = i < 0 ? [text, ''] : [text.slice(0, i), text.slice(i)];
  const parts = sym.split(/([A-Za-zα-ωΑ-Ω]+)/).filter((p) => p !== '');
  return (
    <G>
      <Rect
        x={left - 3}
        y={y - size + 1}
        width={width + 6}
        height={size + 6}
        rx={3}
        fill={c.card}
        opacity={0.9}
      />
      <ChartText x={left} y={y} fontSize={size} fontWeight="700" fill={color ?? c.chartInk}>
        {parts.map((p, k) => (
          <TSpan
            key={k}
            fontStyle={
              /^[A-Za-zα-ωΑ-Ω]{1,2}$/.test(p) && !/^(in|of)$/.test(p) ? 'italic' : 'normal'
            }
          >
            {p}
          </TSpan>
        ))}
        {rest ? <TSpan>{rest}</TSpan> : null}
      </ChartText>
    </G>
  );
}

/** A row of labels left to right from x = 6, 14 px apart. */
function Row({ y, items }: { y: number; items: { text: string; color?: string }[] }) {
  const at = items.map((_, k) =>
    items.slice(0, k).reduce((sum, it) => sum + tagW(it.text) + 14, 6),
  );
  return (
    <G>
      {items.map((it, k) => (
        <MathTag key={it.text} x={at[k]!} y={y} text={it.text} color={it.color} />
      ))}
    </G>
  );
}

/** The parameter range [lo, hi] of the line k·(dx, dct) inside the box (k from −∞ to ∞). */
function clip(
  dx: number,
  dct: number,
  box: { x0: number; x1: number; c0: number; c1: number },
): [number, number] {
  let [lo, hi] = [-Infinity, Infinity];
  const cut = (d: number, a: number, b: number) => {
    if (Math.abs(d) < 1e-12) {
      if (a > 0 || b < 0) [lo, hi] = [1, 0];
      return;
    }
    const [p, q] = [a / d, b / d].sort((m, n) => m - n) as [number, number];
    lo = Math.max(lo, p);
    hi = Math.min(hi, q);
  };
  cut(dx, box.x0, box.x1);
  cut(dct, box.c0, box.c1);
  return [lo, hi];
}

// ─── Lorentz ─────────────────────────────────────────────────────────────────

const L_H = 320;

function LorentzView({ spec, calc }: { spec: Lorentz; calc: Calculator }) {
  const c = usePalette();
  const { rep, num, label } = useHe4c(calc);
  const [b, x, ct] = [num(spec.speed), num(spec.x), num(spec.ct)];
  const okB = b !== undefined && Math.abs(b) < 1;
  const ev = x !== undefined && ct !== undefined ? { x, ct } : undefined;
  const lz = okB && ev ? lorentzOf(b, ev.x, ev.ct) : undefined;
  const gamma = okB ? 1 / Math.sqrt(1 - b * b) : undefined;
  const xu = typeof spec.x === 'string' ? (rep.variable(spec.x).unit ?? 'm') : 'm';

  // The window in S: the origin, the event and the four points it is read at.
  const live = (() => {
    const pts: { x: number; ct: number }[] = [{ x: 0, ct: 0 }];
    if (ev) pts.push(ev, { x: ev.x, ct: 0 }, { x: 0, ct: ev.ct });
    if (lz && okB) pts.push(fromPrimed(b, lz.xp, 0), fromPrimed(b, 0, lz.ctp));
    let x0 = Math.min(...pts.map((p) => p.x));
    let x1 = Math.max(...pts.map((p) => p.x));
    let c0 = Math.min(...pts.map((p) => p.ct));
    let c1 = Math.max(...pts.map((p) => p.ct));
    const size = Math.max(x1 - x0, c1 - c0, 1);
    const pad = size * 0.14;
    [x0, x1, c0, c1] = [x0 - pad, x1 + pad, c0 - pad, c1 + pad];
    return { x0, x1, c0, c1 };
  })();
  const win = useFrozen(live);
  const start = useRef({ x: 0, ct: 0 });
  const canDrag =
    !spec.fixed && typeof spec.x === 'string' && typeof spec.ct === 'string' && !!ev && okB;

  const lines: string[] = [];
  if (okB && gamma !== undefined)
    lines.push(`γ = 1 ÷ √(1 − β²) = 1 ÷ √(1 − ${fmtP(b)}²) = ${fmt(gamma)}`);
  if (lz && okB && ev) {
    lines.push(
      `x′ = γ(x − βct) = ${fmt(lz.gamma)} × (${fmt(ev.x)} − ${fmtP(b)} × ${fmtP(ev.ct)}) = ${fmt(lz.xp)} ${xu}`,
      `ct′ = γ(ct − βx) = ${fmt(lz.gamma)} × (${fmt(ev.ct)} − ${fmtP(b)} × ${fmtP(ev.x)}) = ${fmt(lz.ctp)} ${xu}`,
      `s² = (ct)² − x² = ${fmtP(ev.ct)}² − ${fmtP(ev.x)}² = ${fmt(lz.s2)} ${xu}²`,
      `(ct′)² − (x′)² = ${fmtP(lz.ctp)}² − ${fmtP(lz.xp)}² = ${fmt(lz.ctp ** 2 - lz.xp ** 2)} ${xu}²: the same in both frames.`,
    );
    lines.push(
      lz.s2 > 0
        ? 's² > 0: timelike, so all frames agree on order.'
        : lz.s2 < 0
          ? 's² < 0: spacelike, so no signal links the event to the origin.'
          : 's² = 0: on the light line.',
    );
  } else if (!okB) lines.push('Type a speed β between −1 and 1 to tilt the moving frame.');
  else lines.push('Type the event’s x and ct to read it in both frames.');
  if (okB) lines.push(`The S′ axes tilt by tan⁻¹β = ${fmt(Math.atan(b) / DEG)}°.`);

  return (
    <View>
      <Canvas aspect={(w) => L_H / w}>
        {({ w }) => {
          const groups: { text: string; color?: string }[][] = [
            [
              { text: label(spec.speed, 'β', b) ?? 'β = ?' },
              ...(gamma !== undefined ? [{ text: label(spec.gamma, 'γ', gamma)! }] : []),
            ],
            ev
              ? [
                  { text: label(spec.x, 'x', ev.x, xu)! },
                  { text: label(spec.ct, 'ct', ev.ct, xu)! },
                ]
              : [],
            lz
              ? [
                  { text: label(spec.xPrime, 'x′', lz.xp, xu)!, color: c.he4cPrime },
                  { text: label(spec.ctPrime, 'ct′', lz.ctp, xu)!, color: c.he4cPrime },
                ]
              : [],
            lz ? [{ text: label(spec.interval, 's²', lz.s2, `${xu}²`)!, color: c.he4cEvent }] : [],
          ];
          // The pairs (β γ, x ct, x′ ct′, s²) share a row while they fit across, so the
          // readout takes two rows on a phone, not four, and the plot keeps its size.
          const rows: (typeof groups)[number][] = [];
          for (const g of groups.filter((items) => items.length)) {
            const last = rows[rows.length - 1];
            const joined = last ? [...last, ...g] : g;
            if (last && joined.reduce((sum, it) => sum + tagW(it.text) + 14, 6) <= w - 8)
              rows[rows.length - 1] = joined;
            else rows.push(g);
          }
          const top = rows.length * ROW + 14;
          const box = win.value;
          const availW = w - 16;
          const availH = L_H - top - 10;
          const s = Math.min(availW / (box.x1 - box.x0), availH / (box.c1 - box.c0));
          const ox = (w - (box.x1 - box.x0) * s) / 2;
          const X = (xx: number) => ox + (xx - box.x0) * s;
          const Y = (cc: number) => top + availH - (cc - box.c0) * s;
          const seg = (dx: number, dct: number) => {
            const [lo, hi] = clip(dx, dct, box);
            return lo < hi
              ? { x1: X(lo * dx), y1: Y(lo * dct), x2: X(hi * dx), y2: Y(hi * dct) }
              : undefined;
          };
          const light = [seg(1, 1), seg(-1, 1)];
          const ctAxisP = okB ? seg(b, 1) : undefined;
          const xAxisP = okB ? seg(1, b) : undefined;
          // The invariant hyperbola through the event, inside the window.
          let hyper = '';
          if (lz && Math.abs(lz.s2) > 1e-9 * (ev!.x ** 2 + ev!.ct ** 2)) {
            const a = Math.sqrt(Math.abs(lz.s2));
            let pen = false;
            for (let i = 0; i <= 240; i++) {
              const eta = -4 + (8 * i) / 240;
              const p =
                lz.s2 > 0
                  ? { x: a * Math.sinh(eta), ct: Math.sign(ev!.ct) * a * Math.cosh(eta) }
                  : { x: Math.sign(ev!.x) * a * Math.cosh(eta), ct: a * Math.sinh(eta) };
              const inside = p.x >= box.x0 && p.x <= box.x1 && p.ct >= box.c0 && p.ct <= box.c1;
              if (inside) {
                hyper += `${pen ? 'L' : 'M'} ${X(p.x).toFixed(1)} ${Y(p.ct).toFixed(1)} `;
                pen = true;
              } else pen = false;
            }
          }
          const P = lz && okB ? fromPrimed(b, lz.xp, 0) : undefined;
          const Q = lz && okB ? fromPrimed(b, 0, lz.ctp) : undefined;
          const arcR = 34;
          const tilt = okB ? Math.atan(b) : 0;
          return (
            <>
              <Svg width={w} height={L_H}>
                {rows.map((items, k) => (
                  <Row key={k} y={16 + k * ROW} items={items} />
                ))}
                {/* S's axes. */}
                <Arrow
                  x1={X(box.x0)}
                  y1={Y(0)}
                  x2={X(box.x1)}
                  y2={Y(0)}
                  color={c.chartInk}
                  width={1.5}
                />
                <Arrow
                  x1={X(0)}
                  y1={Y(box.c0)}
                  x2={X(0)}
                  y2={Y(box.c1)}
                  color={c.chartInk}
                  width={1.5}
                />
                <MathTag x={X(box.x1) - 4} y={Y(0) + 18} text="x" anchor="end" />
                <MathTag x={X(0) - 8} y={Y(box.c1) + 12} text="ct" anchor="end" />
                {/* The light lines. */}
                {light.map((l, k) =>
                  l ? (
                    <Line
                      key={k}
                      {...l}
                      stroke={c.he4cLight}
                      strokeWidth={2}
                      strokeDasharray={chart.dash}
                    />
                  ) : null,
                )}
                {/* S′'s axes, tilted by tan⁻¹β toward the light line. */}
                {ctAxisP && xAxisP ? (
                  <G>
                    <Arrow
                      x1={ctAxisP.x1}
                      y1={ctAxisP.y1}
                      x2={ctAxisP.x2}
                      y2={ctAxisP.y2}
                      color={c.he4cPrime}
                      width={2}
                    />
                    <Arrow
                      x1={xAxisP.x1}
                      y1={xAxisP.y1}
                      x2={xAxisP.x2}
                      y2={xAxisP.y2}
                      color={c.he4cPrime}
                      width={2}
                    />
                    <MathTag
                      x={ctAxisP.x2 - 10}
                      y={ctAxisP.y2 + 10}
                      text="ct′"
                      anchor="end"
                      color={c.he4cPrime}
                      w={w}
                    />
                    <MathTag
                      x={xAxisP.x2 - 6}
                      y={xAxisP.y2 + 20}
                      text="x′"
                      anchor="end"
                      color={c.he4cPrime}
                      w={w}
                    />
                    {Math.abs(tilt) > 0.02 ? (
                      <G>
                        <Path
                          d={`M ${X(0) + arcR} ${Y(0)} A ${arcR} ${arcR} 0 0 ${tilt > 0 ? 0 : 1} ${X(0) + arcR * Math.cos(tilt)} ${Y(0) - arcR * Math.sin(tilt)}`}
                          stroke={c.he4cPrime}
                          fill="none"
                        />
                        <Path
                          d={`M ${X(0)} ${Y(0) - arcR} A ${arcR} ${arcR} 0 0 ${tilt > 0 ? 1 : 0} ${X(0) + arcR * Math.sin(tilt)} ${Y(0) - arcR * Math.cos(tilt)}`}
                          stroke={c.he4cPrime}
                          fill="none"
                        />
                      </G>
                    ) : null}
                  </G>
                ) : null}
                {hyper ? (
                  <Path
                    d={hyper}
                    stroke={c.he4cEvent}
                    strokeOpacity={0.55}
                    strokeWidth={1.5}
                    strokeDasharray={chart.dashFine}
                    fill="none"
                  />
                ) : null}
                {/* The event read on both sets of axes. */}
                {ev ? (
                  <G>
                    <Line
                      x1={X(ev.x)}
                      y1={Y(ev.ct)}
                      x2={X(ev.x)}
                      y2={Y(0)}
                      stroke={c.chartMuted}
                      strokeDasharray={chart.dashFine}
                    />
                    <Line
                      x1={X(ev.x)}
                      y1={Y(ev.ct)}
                      x2={X(0)}
                      y2={Y(ev.ct)}
                      stroke={c.chartMuted}
                      strokeDasharray={chart.dashFine}
                    />
                    <Circle cx={X(ev.x)} cy={Y(0)} r={3.5} fill={c.chartInk} />
                    <Circle cx={X(0)} cy={Y(ev.ct)} r={3.5} fill={c.chartInk} />
                  </G>
                ) : null}
                {ev && P && Q ? (
                  <G>
                    <Line
                      x1={X(ev.x)}
                      y1={Y(ev.ct)}
                      x2={X(P.x)}
                      y2={Y(P.ct)}
                      stroke={c.he4cPrime}
                      strokeDasharray={chart.dash}
                    />
                    <Line
                      x1={X(ev.x)}
                      y1={Y(ev.ct)}
                      x2={X(Q.x)}
                      y2={Y(Q.ct)}
                      stroke={c.he4cPrime}
                      strokeDasharray={chart.dash}
                    />
                    <Circle cx={X(P.x)} cy={Y(P.ct)} r={3.5} fill={c.he4cPrime} />
                    <Circle cx={X(Q.x)} cy={Y(Q.ct)} r={3.5} fill={c.he4cPrime} />
                  </G>
                ) : null}
                {ev ? (
                  <G>
                    <Circle
                      cx={X(ev.x)}
                      cy={Y(ev.ct)}
                      r={6}
                      fill={c.he4cEvent}
                      stroke={c.card}
                      strokeWidth={1.5}
                    />
                    <MathTag x={X(ev.x) + 10} y={Y(ev.ct) - 8} text="E" color={c.he4cEvent} w={w} />
                  </G>
                ) : null}
              </Svg>
              {canDrag && ev ? (
                <DragHandle
                  testID="drag-spacetime-event"
                  x={X(ev.x)}
                  y={Y(ev.ct)}
                  label={rep.variable(spec.x as string).name}
                  onStart={() => {
                    win.freeze();
                    start.current = { ...ev };
                  }}
                  onEnd={() => win.release()}
                  onMove={(dx, dy) => {
                    const [ix, ic] = [spec.x as string, spec.ct as string];
                    calc.set(
                      {
                        ...rep.pinTyped(typeof spec.speed === 'string' ? [spec.speed] : []),
                        [ix]: rep.snapTo(ix, start.current.x + dx / s),
                        [ic]: rep.snapTo(ic, start.current.ct - dy / s),
                      },
                      rep.slide(ix),
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
}

// ─── Velocity addition ───────────────────────────────────────────────────────

const A_TOP = 4 * ROW + 14;
const A_H = 356;

function AdditionView({ spec, calc }: { spec: Addition; calc: Calculator }) {
  const c = usePalette();
  const { rep, num, label, setOne } = useHe4c(calc);
  const [v, up] = [num(spec.speed), num(spec.other)];
  const ok = v !== undefined && up !== undefined && Math.abs(v) < 1 && Math.abs(up) < 1;
  const u = ok ? addVelocities(v, up) : undefined;
  const naive = ok ? v + up : undefined;
  const start = useRef(0);
  const canDrag = !spec.fixed && typeof spec.other === 'string' && ok;

  const lines: string[] = [];
  if (ok && u !== undefined) {
    lines.push(
      `u = (v + u′) ÷ (1 + vu′) = (${fmt(v)} + ${fmtP(up)}) ÷ (1 + ${fmt(v)} × ${fmtP(up)}) = ${fmt(v + up)} ÷ ${fmt(1 + v * up)} = ${fmt(u)}c`,
    );
    lines.push(
      Math.abs(naive!) >= 1
        ? `Adding the speeds, v + u′ = ${fmt(naive!)}c, would beat light (dashed); the true world line stays inside the light line.`
        : `Adding the speeds would give ${fmt(naive!)}c (dashed); the true u is less, and always below c.`,
    );
  } else lines.push('Type two speeds between −1 and 1 (in c): S′’s v and the object’s u′ in S′.');

  return (
    <View>
      <Canvas aspect={(w) => A_H / w}>
        {({ w }) => {
          const x0 = -0.2;
          const x1 = Math.max(1.12, Math.min(1.6, (naive ?? 0) + 0.08));
          const availW = w - 24;
          const availH = A_H - A_TOP - 34;
          const s = Math.min(availW / (x1 - x0), availH / 1);
          const ox = (w - (x1 - x0) * s) / 2;
          const X = (xx: number) => ox + (xx - x0) * s;
          const Y = (cc: number) => A_H - 30 - cc * s;
          const box = { x0, x1, c0: 0, c1: 1 };
          const line = (k: number) => {
            const [lo, hi] = clip(k, 1, box);
            return { x1: X(lo * k), y1: Y(lo), x2: X(hi * k), y2: Y(hi) };
          };
          const legend: { text: string; color: string; dash?: string; width: number }[] = [
            { text: 'light: x = ct', color: c.he4cLight, dash: chart.dash, width: 2 },
            ...(v !== undefined
              ? [{ text: `S′: ${label(spec.speed, 'v', v, 'c')}`, color: c.he4cPrime, width: 2.5 }]
              : []),
            ...(u !== undefined
              ? [
                  {
                    text: `object: ${label(spec.other, 'u′', up, 'c')} in S′, ${label(spec.result, 'u', u, 'c')} in S`,
                    color: c.he4cEvent,
                    width: 3,
                  },
                  {
                    text: `adding them: v + u′ = ${fmt(naive!)} c`,
                    color: c.chartMuted,
                    dash: chart.dashFine,
                    width: 2,
                  },
                ]
              : []),
          ];
          const end = u !== undefined ? line(u) : undefined;
          return (
            <>
              <Svg width={w} height={A_H}>
                {legend.map((l, k) => (
                  <G key={l.text}>
                    <Line
                      x1={6}
                      y1={11 + k * ROW}
                      x2={30}
                      y2={11 + k * ROW}
                      stroke={l.color}
                      strokeWidth={l.width}
                      strokeDasharray={l.dash}
                    />
                    <MathTag x={38} y={16 + k * ROW} text={l.text} />
                  </G>
                ))}
                <Arrow x1={X(x0)} y1={Y(0)} x2={X(x1)} y2={Y(0)} color={c.chartInk} width={1.5} />
                <Arrow x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(1) - 4} color={c.chartInk} width={1.5} />
                <MathTag x={X(x1) - 4} y={Y(0) + 18} text="x" anchor="end" />
                <MathTag x={X(0) - 8} y={Y(1) + 12} text="ct" anchor="end" />
                <Line
                  {...line(1)}
                  stroke={c.he4cLight}
                  strokeWidth={2}
                  strokeDasharray={chart.dash}
                />
                <Line
                  {...line(-1)}
                  stroke={c.he4cLight}
                  strokeWidth={2}
                  strokeDasharray={chart.dash}
                />
                {v !== undefined && Math.abs(v) < 1 ? (
                  <G>
                    {/* S′: its world line (the ct′ axis) and, faint, its x′ axis. */}
                    <Line {...line(v)} stroke={c.he4cPrime} strokeWidth={2.5} />
                    <MathTag
                      x={line(v).x2 - 10}
                      y={line(v).y2 + 10}
                      text="ct′"
                      anchor="end"
                      color={c.he4cPrime}
                      w={w}
                    />
                    {(() => {
                      const [lo, hi] = clip(1, v, box);
                      return lo < hi ? (
                        <G>
                          <Line
                            x1={X(lo)}
                            y1={Y(lo * v)}
                            x2={X(hi)}
                            y2={Y(hi * v)}
                            stroke={c.he4cPrime}
                            strokeOpacity={0.45}
                            strokeWidth={1.5}
                          />
                          <MathTag
                            x={X(hi) - 6}
                            y={Y(hi * v) + 18}
                            text="x′"
                            anchor="end"
                            color={c.he4cPrime}
                            w={w}
                          />
                        </G>
                      ) : null;
                    })()}
                  </G>
                ) : null}
                {naive !== undefined ? (
                  <Line
                    {...line(naive)}
                    stroke={c.chartMuted}
                    strokeWidth={2}
                    strokeDasharray={chart.dashFine}
                  />
                ) : null}
                {end ? <Line {...end} stroke={c.he4cEvent} strokeWidth={3} /> : null}
                {end ? <Circle cx={end.x2} cy={end.y2} r={5} fill={c.he4cEvent} /> : null}
              </Svg>
              {canDrag && end && u !== undefined ? (
                <DragHandle
                  testID="drag-spacetime-object"
                  x={end.x2}
                  y={end.y2}
                  label={rep.variable(spec.other as string).name}
                  onStart={() => {
                    start.current = u;
                  }}
                  onMove={(dx) => {
                    const uu = Math.max(-0.999, Math.min(0.999, start.current + dx / s));
                    setOne(spec.other as string, (uu - v!) / (1 - uu * v!), [spec.speed]);
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
}
