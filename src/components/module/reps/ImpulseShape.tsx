/**
 * HC101 `impulse` `shape` (typesHe4c.ts): a force pulse on the F–t graph, a rectangle, a
 * triangle or half a sine, its area J = ∫F dt shaded and written, and the rectangle of the same
 * area at the average force dashed beside it; with a mass, the ball it sends off at Δv = J ÷ m.
 * The graph is flat; the ball is painted. Drag the peak for Fₘₐₓ and the pulse's end for Δt.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect, TSpan } from 'react-native-svg';

import type { ImpulseShapeSpec } from '@/data/modules/typesHe4c';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen } from './common';
import { Arrow } from './he1fKit';
import { fmt, Tag, tagW } from './he2fKit';
import { fmtP, useHe4c } from './he4cKit';
import { PULSE_SHARE, pulseForce, ticksOf } from './he4cMath';
import { Ball, url, usePaintIds } from './paint';

const LEFT = 58;
const RIGHT = 10;
const PEAK_Y = 66;
const ZERO_Y = 214;
const SPAN = 1.5;

const WORK: Record<ImpulseShapeSpec['shape'], { rule: string; factor: string }> = {
  rectangle: { rule: 'J = ∫F dt = Fₘₐₓ × Δt', factor: '' },
  triangle: { rule: 'J = ∫F dt = ½ × Fₘₐₓ × Δt', factor: '½ × ' },
  halfSine: { rule: 'J = ∫Fₘₐₓ sin(πt ÷ Δt) dt = (2 ÷ π) × Fₘₐₓ × Δt', factor: '(2 ÷ π) × ' },
};

export function ImpulseShape({ spec, calc }: { spec: ImpulseShapeSpec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('ball');
  const { rep, num, label, setOne } = useHe4c(calc);
  const [F, dt, m] = [num(spec.peak), num(spec.time), num(spec.mass)];
  const ok = F !== undefined && dt !== undefined && F > 0 && dt > 0;
  const J = ok ? PULSE_SHARE[spec.shape] * F * dt : undefined;
  const avg = J !== undefined ? J / dt! : undefined;
  const dv = J !== undefined && m !== undefined && m > 0 ? J / m : undefined;
  const H = spec.mass !== undefined ? 306 : 264;

  const win = useFrozen({ F: ok ? F : 1, dt: ok ? dt : 1 });
  const start = useRef(0);
  const canDrag = (x: ImpulseShapeSpec['peak']): x is string =>
    !spec.fixed && typeof x === 'string' && ok;

  const lines: string[] = [];
  const work = WORK[spec.shape];
  if (J !== undefined) {
    lines.push(`${work.rule} = ${work.factor}${fmtP(F!)} × ${fmtP(dt!)} = ${fmt(J)} N·s`);
    lines.push(
      `Average force = J ÷ Δt = ${fmtP(J)} ÷ ${fmtP(dt!)} = ${fmt(avg!)} N: the dashed rectangle has the same area.`,
    );
    if (dv !== undefined) lines.push(`Δv = J ÷ m = ${fmtP(J)} ÷ ${fmtP(m!)} = ${fmt(dv)} m/s`);
  } else {
    lines.push(`${work.rule}: the area under the pulse.`);
    lines.push('Type the peak force and the contact time to draw the pulse.');
  }

  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w }) => {
          const { F: Fw, dt: tw } = win.value;
          const x0 = LEFT;
          const x1 = w - RIGHT;
          const sx = (x1 - x0) / (SPAN * tw);
          const sy = (ZERO_Y - PEAK_Y) / Fw;
          const px = (t: number) => x0 + t * sx;
          const py = (f: number) => ZERO_Y - f * sy;
          const fTicks = ticksOf(0, (ZERO_Y - 24) / sy, 4);
          let d = '';
          if (ok) {
            const n = 96;
            d = `M ${px(0)} ${py(0)} `;
            for (let i = 0; i <= n; i++) {
              const t = (dt! * i) / n;
              const f = spec.shape === 'rectangle' ? F! : pulseForce(spec.shape, F!, dt!, t);
              d += `L ${px(t).toFixed(1)} ${py(f).toFixed(1)} `;
            }
            d += `L ${px(dt!)} ${py(0)} Z`;
          }
          const peak = ok ? { x: px(dt! / 2), y: py(F!) } : undefined;
          const ball = { y: 284, r: 11 };
          const mText = label(spec.mass, 'm', m, 'kg');
          const dvText = label(spec.change, 'Δv', dv, 'm/s');
          const ballX = mText ? 8 + tagW(mText) + 20 : 24;
          return (
            <>
              <Svg width={w} height={H}>
                <Defs>
                  <Ball id={ids.ball} color={c.paper} />
                </Defs>
                {/* Axes: F up, t across, with ticks on F. */}
                <Line x1={x0} y1={24} x2={x0} y2={ZERO_Y} stroke={c.chartMuted} strokeWidth={1.5} />
                <Arrow x1={x0} y1={ZERO_Y} x2={x1} y2={ZERO_Y} color={c.chartMuted} width={1.5} />
                {fTicks.map((f) => (
                  <G key={f}>
                    <Line x1={x0 - 4} y1={py(f)} x2={x0} y2={py(f)} stroke={c.chartMuted} />
                    <ChartText x={x0 - 7} y={py(f) + 4} textAnchor="end" fontSize={chart.label}>
                      {fmt(f, 3)}
                    </ChartText>
                  </G>
                ))}
                <ChartText x={4} y={14} fontSize={chart.label} fontWeight="700">
                  <TSpan fontStyle="italic">F</TSpan>
                  <TSpan> (N)</TSpan>
                </ChartText>
                <ChartText
                  x={x1}
                  y={ZERO_Y + 18}
                  textAnchor="end"
                  fontSize={chart.label}
                  fontWeight="700"
                >
                  <TSpan fontStyle="italic">t</TSpan>
                  <TSpan> (s)</TSpan>
                </ChartText>
                {ok && J !== undefined && avg !== undefined && peak ? (
                  <G>
                    {/* The pulse and its area J. */}
                    <Path
                      d={d}
                      fill={c.he4cPulse}
                      fillOpacity={0.22}
                      stroke={c.he4cPulse}
                      strokeWidth={2.5}
                      strokeLinejoin="round"
                    />
                    {/* The same area as a rectangle at the average force. */}
                    <Rect
                      x={px(0)}
                      y={py(avg)}
                      width={px(dt!) - px(0)}
                      height={py(0) - py(avg)}
                      fill="none"
                      stroke={c.he4cAverage}
                      strokeWidth={2}
                      strokeDasharray={chart.dash}
                    />
                    <Tag
                      x={px(dt! / 2)}
                      y={py(avg / 2) + 5}
                      text={label(spec.impulse, 'J', J, 'N·s')!}
                      w={w}
                    />
                    <Tag
                      x={px(dt!) + 8}
                      y={py(avg) + 4}
                      text={label(spec.average, 'F_avg', avg, 'N')!}
                      color={c.he4cAverage}
                      anchor="start"
                      w={w}
                    />
                    <Circle cx={peak.x} cy={peak.y} r={4} fill={c.he4cPulse} />
                    <Tag
                      x={peak.x}
                      y={peak.y - 28}
                      text={label(spec.peak, 'F_max', F, 'N')!}
                      color={c.he4cPulse}
                      w={w}
                    />
                    {/* Δt bracketed under the axis. */}
                    <Line
                      x1={px(0)}
                      y1={ZERO_Y + 28}
                      x2={px(dt!)}
                      y2={ZERO_Y + 28}
                      stroke={c.chartInk}
                    />
                    <Line
                      x1={px(0)}
                      y1={ZERO_Y + 23}
                      x2={px(0)}
                      y2={ZERO_Y + 33}
                      stroke={c.chartInk}
                    />
                    <Line
                      x1={px(dt!)}
                      y1={ZERO_Y + 23}
                      x2={px(dt!)}
                      y2={ZERO_Y + 33}
                      stroke={c.chartInk}
                    />
                    <Tag
                      x={px(dt! / 2)}
                      y={ZERO_Y + 46}
                      text={label(spec.time, 'Δt', dt, 's')!}
                      w={w}
                    />
                  </G>
                ) : null}
                {/* The ball the pulse sends off. */}
                {spec.mass !== undefined ? (
                  <G>
                    {mText ? <Tag x={8} y={ball.y + 4} text={mText} anchor="start" w={w} /> : null}
                    <Circle
                      cx={ballX}
                      cy={ball.y}
                      r={ball.r}
                      fill={url(ids.ball)}
                      stroke={c.chartInk}
                      strokeWidth={1.5}
                    />
                    {dv !== undefined && dvText ? (
                      <G>
                        <Arrow
                          x1={ballX + ball.r + 4}
                          y1={ball.y}
                          x2={ballX + ball.r + 84}
                          y2={ball.y}
                          color={c.chartInk}
                          width={2.5}
                        />
                        <Tag
                          x={ballX + ball.r + 92}
                          y={ball.y + 4}
                          text={dvText}
                          anchor="start"
                          w={w}
                        />
                      </G>
                    ) : null}
                  </G>
                ) : null}
              </Svg>
              {peak && canDrag(spec.peak) ? (
                <DragHandle
                  testID="drag-impulse-peak"
                  x={peak.x}
                  y={peak.y}
                  label={rep.variable(spec.peak).name}
                  onStart={() => {
                    win.freeze();
                    start.current = F!;
                  }}
                  onEnd={() => win.release()}
                  onMove={(_, dy) =>
                    setOne(spec.peak as string, Math.max(0, start.current - dy / sy), [
                      spec.time,
                      spec.mass,
                    ])
                  }
                />
              ) : null}
              {peak && canDrag(spec.time) ? (
                <DragHandle
                  testID="drag-impulse-time"
                  x={px(dt!)}
                  y={ZERO_Y}
                  label={rep.variable(spec.time).name}
                  onStart={() => {
                    win.freeze();
                    start.current = dt!;
                  }}
                  onEnd={() => win.release()}
                  onMove={(dx) =>
                    setOne(spec.time as string, Math.max(0, start.current + dx / sx), [
                      spec.peak,
                      spec.mass,
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
