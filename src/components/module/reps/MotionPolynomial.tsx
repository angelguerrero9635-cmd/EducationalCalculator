/**
 * HC99 `motionGraph` `polynomial` (typesHe4c.ts): position as a cubic in time with its velocity
 * and acceleration by the power rule, x–t, v–t and a–t stacked on one time axis. The point at t
 * is on each graph, the tangent on x–t has slope v, and each turnaround (v = 0) is ringed on
 * x–t and v–t. Flat, as every graph is. Drag the point for t.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, TSpan } from 'react-native-svg';

import type { MotionGraphHe4cSpec } from '@/data/modules/typesHe4c';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen } from './common';
import { fmt, Tag } from './he2fKit';
import { useHe4c } from './he4cKit';
import { cubicAt, cubicSpan, ticksOf, turnarounds, type Cubic } from './he4cMath';

const H = 362;
const LEFT = 52;
const RIGHT = 14;
const HEAD = 20;
const PLOT = 80;
const GAP = 10;
const TOP = 4;

const SUP = ['', '', '²', '³'];

/** "4 + 12 × 3 − 9 × 3² + 2 × 3³": the polynomial's terms at t, zero terms left out. */
function termsAt(coefs: number[], t: number, powers: number[], scale: number[] = []) {
  const parts: string[] = [];
  coefs.forEach((c0, i) => {
    const c = c0 * (scale[i] ?? 1);
    if (c === 0) return;
    const p = powers[i]!;
    const body =
      p === 0
        ? fmt(Math.abs(c))
        : `${scale[i] && scale[i] !== 1 ? `${scale[i]} × ${fmt(Math.abs(c0))}` : fmt(Math.abs(c))} × ${fmt(t)}${SUP[p]}`;
    const neg = c < 0;
    parts.push(parts.length === 0 ? `${neg ? '−' : ''}${body}` : `${neg ? '−' : '+'} ${body}`);
  });
  return parts.length ? parts.join(' ') : '0';
}

/** An axis name: the symbol italic, its unit upright in brackets ("x (m)"). */
function AxisName({
  x,
  y,
  symbol,
  unit,
  anchor,
}: {
  x: number;
  y: number;
  symbol: string;
  unit: string;
  anchor: 'start' | 'end';
}) {
  return (
    <ChartText x={x} y={y} textAnchor={anchor} fontSize={chart.label} fontWeight="700">
      <TSpan fontStyle="italic">{symbol}</TSpan>
      <TSpan>{` (${unit})`}</TSpan>
    </ChartText>
  );
}

export function MotionPolynomial({ spec, calc }: { spec: MotionGraphHe4cSpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, num, label, unitOf, setOne } = useHe4c(calc);
  const p = spec.polynomial;
  const coefs = [num(p.c0), num(p.c1), num(p.c2), num(p.c3)];
  const cubic = coefs.every((x) => x !== undefined) ? (coefs as unknown as Cubic) : undefined;
  const t = num(p.at);
  const xu = unitOf(p.position ?? p.c0, 'm');
  const tu = unitOf(p.at, 's');
  const units = [xu, `${xu}/${tu}`, `${xu}/${tu}²`];
  const now = cubic && t !== undefined ? cubicAt(cubic, t) : undefined;
  const turns = cubic ? turnarounds(cubic) : [];

  // The window: time from 0 past t and the turnarounds; each graph's range from its curve.
  const live = (() => {
    if (!cubic) return { span: Math.max(1, (t ?? 0) * 1.2), ranges: undefined };
    const span = cubicSpan(cubic, t);
    const ranges = [0, 1, 2].map((k) => {
      let lo = 0;
      let hi = 0;
      for (let i = 0; i <= 120; i++) {
        const s = cubicAt(cubic, (span * i) / 120);
        const y = [s.x, s.v, s.a][k]!;
        lo = Math.min(lo, y);
        hi = Math.max(hi, y);
      }
      if (hi - lo < 1e-9) [lo, hi] = [lo - 1, hi + 1];
      const pad = (hi - lo) * 0.08;
      return [lo - pad, hi + pad] as const;
    });
    return { span, ranges };
  })();
  const win = useFrozen(live);
  const start = useRef(0);
  const canDrag = !spec.fixed && typeof p.at === 'string' && !!cubic && t !== undefined;

  const shownTurns = turns.filter((r) => r <= win.value.span);
  const lines: string[] = [];
  if (cubic && now && t !== undefined) {
    const [c0, c1, c2, c3] = cubic;
    lines.push(
      `x = c₀ + c₁t + c₂t² + c₃t³ = ${termsAt([c0, c1, c2, c3], t, [0, 1, 2, 3])} = ${fmt(now.x)} ${units[0]}`,
      `v = dx/dt = c₁ + 2c₂t + 3c₃t² = ${termsAt([c1, c2, c3], t, [0, 1, 2], [1, 2, 3])} = ${fmt(now.v)} ${units[1]}`,
      `a = dv/dt = 2c₂ + 6c₃t = ${termsAt([c2, c3], t, [0, 1], [2, 6])} = ${fmt(now.a)} ${units[2]}`,
    );
  } else {
    lines.push(
      'x = c₀ + c₁t + c₂t² + c₃t³; by the power rule v = c₁ + 2c₂t + 3c₃t² and a = 2c₂ + 6c₃t.',
    );
    if (!cubic) lines.push('Type the four coefficients to draw the motion.');
    else lines.push('Type the time t to mark it on the three graphs.');
  }
  if (cubic)
    lines.push(
      shownTurns.length
        ? `It turns round (v = 0, ringed) at t = ${shownTurns.map((r) => `${fmt(r)} ${tu}`).join(' and ')}.`
        : 'v never changes sign here: no turnaround.',
    );
  if (now) lines.push('The tangent to x–t at t has slope v.');

  const names = ['x', 'v', 'a'];
  const fields = [p.position, p.velocity, p.acceleration];

  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w }) => {
          const { span, ranges } = win.value;
          const x0 = LEFT;
          const x1 = w - RIGHT;
          const sx = (x1 - x0) / span;
          const px = (tt: number) => x0 + tt * sx;
          const panel = (k: number) => {
            const top = TOP + k * (HEAD + PLOT + GAP) + HEAD;
            const [lo, hi] = ranges ? ranges[k]! : [-1, 1];
            const sy = PLOT / (hi - lo);
            return { top, bottom: top + PLOT, lo, hi, py: (y: number) => top + (hi - y) * sy };
          };
          const bottom = panel(2).bottom;
          const tTicks = ticksOf(0, span, Math.max(3, Math.floor((x1 - x0) / 60)));
          const valueAt = (k: number, tt: number) => {
            const s = cubicAt(cubic!, tt);
            return [s.x, s.v, s.a][k]!;
          };
          return (
            <>
              <Svg width={w} height={H}>
                {/* Time grid across the three graphs, and the time axis. */}
                {tTicks.map((tt) => (
                  <G key={tt}>
                    {[0, 1, 2].map((k) => (
                      <Line
                        key={k}
                        x1={px(tt)}
                        y1={panel(k).top}
                        x2={px(tt)}
                        y2={panel(k).bottom}
                        stroke={c.chartGrid}
                        strokeWidth={1}
                      />
                    ))}
                    <ChartText
                      x={px(tt)}
                      y={bottom + 15}
                      textAnchor="middle"
                      fontSize={chart.label}
                    >
                      {fmt(tt)}
                    </ChartText>
                  </G>
                ))}
                <AxisName x={x1} y={bottom + 30} symbol="t" unit={tu} anchor="end" />
                {[0, 1, 2].map((k) => {
                  const pn = panel(k);
                  const yTicks = ticksOf(pn.lo, pn.hi, 3);
                  const head = pn.top - 6;
                  const valueLabel = now
                    ? label(fields[k], names[k]!, [now.x, now.v, now.a][k], units[k])
                    : undefined;
                  let d = '';
                  if (cubic)
                    for (let i = 0; i <= 160; i++) {
                      const tt = (span * i) / 160;
                      d += `${i ? 'L' : 'M'} ${px(tt).toFixed(1)} ${pn.py(valueAt(k, tt)).toFixed(1)} `;
                    }
                  return (
                    <G key={k}>
                      <Line x1={x0} y1={pn.top} x2={x0} y2={pn.bottom} stroke={c.chartMuted} />
                      {yTicks.map((y) => (
                        <G key={y}>
                          <Line
                            x1={x0}
                            y1={pn.py(y)}
                            x2={x1}
                            y2={pn.py(y)}
                            stroke={y === 0 ? c.chartMuted : c.chartGrid}
                            strokeWidth={y === 0 ? 1.5 : 1}
                          />
                          <ChartText
                            x={x0 - 5}
                            y={pn.py(y) + 4}
                            textAnchor="end"
                            fontSize={chart.label}
                          >
                            {fmt(y, 3)}
                          </ChartText>
                        </G>
                      ))}
                      <AxisName x={4} y={head} symbol={names[k]!} unit={units[k]!} anchor="start" />
                      {valueLabel ? (
                        <Tag x={x1} y={head} text={valueLabel} anchor="end" chip={false} w={w} />
                      ) : null}
                      {cubic ? (
                        <Path d={d} stroke={c.chartInk} strokeWidth={2.5} fill="none" />
                      ) : null}
                      {/* The turnarounds: on x–t where it stops, on v–t where it crosses 0. */}
                      {cubic && k < 2
                        ? shownTurns.map((r) => (
                            <Circle
                              key={r}
                              cx={px(r)}
                              cy={pn.py(k === 0 ? valueAt(0, r) : 0)}
                              r={7}
                              stroke={c.he4cTurn}
                              strokeWidth={2.5}
                              fill="none"
                            />
                          ))
                        : null}
                    </G>
                  );
                })}
                {now && cubic && t !== undefined ? (
                  <G>
                    {[0, 1, 2].map((k) => (
                      <Line
                        key={k}
                        x1={px(t)}
                        y1={panel(k).top}
                        x2={px(t)}
                        y2={panel(k).bottom}
                        stroke={c.chartMuted}
                        strokeDasharray={chart.dashFine}
                      />
                    ))}
                    {(() => {
                      // The tangent on x–t through (t, x), kept inside its graph.
                      const pn = panel(0);
                      const half = span * 0.22;
                      let [ta, tb] = [Math.max(0, t - half), Math.min(span, t + half)];
                      if (Math.abs(now.v) > 1e-12) {
                        const [ya, yb] = [(pn.lo - now.x) / now.v + t, (pn.hi - now.x) / now.v + t];
                        ta = Math.max(ta, Math.min(ya, yb));
                        tb = Math.min(tb, Math.max(ya, yb));
                      }
                      const y = (tt: number) => pn.py(now.x + now.v * (tt - t));
                      return (
                        <Line
                          x1={px(ta)}
                          y1={y(ta)}
                          x2={px(tb)}
                          y2={y(tb)}
                          stroke={c.tangentLine}
                          strokeWidth={2.5}
                        />
                      );
                    })()}
                    {[now.x, now.v, now.a].map((y, k) => (
                      <Circle
                        key={k}
                        cx={px(t)}
                        cy={panel(k).py(y)}
                        r={5}
                        fill={c.chartHighlight}
                        stroke={c.card}
                        strokeWidth={1.5}
                      />
                    ))}
                  </G>
                ) : null}
              </Svg>
              {canDrag && now ? (
                <DragHandle
                  testID="drag-polynomial-t"
                  x={px(t!)}
                  y={panel(0).py(now.x)}
                  label={rep.variable(p.at as string).name}
                  onStart={() => {
                    win.freeze();
                    start.current = t!;
                  }}
                  onEnd={() => win.release()}
                  onMove={(dx) =>
                    setOne(p.at as string, Math.max(0, start.current + dx / sx), [
                      p.c0,
                      p.c1,
                      p.c2,
                      p.c3,
                    ])
                  }
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
