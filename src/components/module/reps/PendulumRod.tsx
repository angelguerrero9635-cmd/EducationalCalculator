/**
 * HC103 `pendulum` `rod` (typesHe4c.ts): a uniform wooden rod swinging on a steel pin, the
 * center of mass marked at d below the pin and bracketed, and the simple pendulum of the same
 * period (length I ÷ (md)) dashed from the same pin, swung the other way. Drawn to scale; the
 * swing angle is only for the drawing (T holds for small swings). Drag the center of mass for
 * the pin's place on the rod, or the rod's end for its length.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { PendulumRodSpec } from '@/data/modules/typesHe4c';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle, useFrozen } from './common';
import { fmt, Tag } from './he2fKit';
import { fmtP, useHe4c } from './he4cKit';
import { rodPendulum } from './he4cMath';
import { Ball, Metal, TopLight, url, usePaintIds } from './paint';

const H = 340;
const SWING = 12;
const DEG = Math.PI / 180;
const ROD_W = 12;

export function PendulumRod({ spec, calc }: { spec: PendulumRodSpec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('wood', 'pin', 'bob');
  const { rep, num, label, setOne } = useHe4c(calc);
  const [L, p0, m, g] = [
    num(spec.rod.length),
    num(spec.rod.pivot ?? 0),
    num(spec.mass),
    num(spec.g),
  ];
  const Igiven = spec.inertia && rep.known(spec.inertia) ? rep.val(spec.inertia) : undefined;
  const ok = L !== undefined && p0 !== undefined && m !== undefined && g !== undefined && L > 0;
  const r = ok ? rodPendulum(L, p0, m, g, Igiven) : undefined;
  const swings = r?.T !== undefined;

  const live = { up: ok ? p0 : 0, down: ok ? Math.max(L - p0, r?.Leq ?? 0) : 1 };
  const win = useFrozen(live);
  const start = useRef(0);
  const pivotVar = typeof spec.rod.pivot === 'string' ? spec.rod.pivot : undefined;
  const lengthVar = typeof spec.rod.length === 'string' ? spec.rod.length : undefined;
  const dragId = spec.fixed || !ok ? undefined : (pivotVar ?? lengthVar);

  const lines: string[] = [];
  if (r && ok) {
    if (spec.rod.pivot !== undefined && p0 !== 0)
      lines.push(`d = L ÷ 2 − p = ${fmt(L / 2)} − ${fmtP(p0)} = ${fmt(r.d)} m`);
    else lines.push(`Pinned at its end: d = L ÷ 2 = ${fmt(r.d)} m`);
    const uniform = m * ((L * L) / 12 + r.d * r.d);
    if (Igiven === undefined || Math.abs(Igiven - uniform) <= 1e-6 * Math.max(1, uniform))
      lines.push(
        `I = mL² ÷ 12 + md² = ${fmt(m)} × ${fmtP(L)}² ÷ 12 + ${fmt(m)} × ${fmtP(r.d)}² = ${fmt(r.I)} kg·m²`,
      );
    if (swings) {
      lines.push(
        `T = 2π√(I ÷ (mgd)) = 2π√(${fmt(r.I)} ÷ (${fmt(m)} × ${fmt(g)} × ${fmt(r.d)})) = ${fmt(r.T!)} s`,
      );
      lines.push(
        `A simple pendulum of length I ÷ (md) = ${fmt(r.Leq!)} m (dashed) swings in step. Drawn at ${SWING}°; T holds for small swings.`,
      );
    } else
      lines.push(
        'The pin is at the center of mass (d = 0): gravity has no lever arm, so the rod does not swing.',
      );
  } else {
    lines.push('T = 2π√(I ÷ (mgd)), with I = mL² ÷ 12 + md² for a uniform rod.');
    lines.push('Type the mass, the rod’s length and where it is pinned to draw it.');
  }

  const corner = r
    ? [
        label(spec.mass, 'm', m, 'kg'),
        label(spec.inertia, 'I', r.I, 'kg·m²'),
        swings ? label(spec.period, 'T', r.T, 's') : undefined,
      ].filter((t): t is string => !!t)
    : [];

  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w }) => {
          const { up, down } = win.value;
          const s = (H - 40 - 30) / (up + down);
          const px = w / 2 + 12;
          const py = 40 + up * s;
          const th = swings ? SWING * DEG : 0;
          // World position of a point on the rod `along` below the pin (`side` px across).
          const onRod = (along: number, side = 0) => ({
            x: px + along * s * Math.sin(th) + side * Math.cos(th),
            y: py + along * s * Math.cos(th) - side * Math.sin(th),
          });
          const end = r ? onRod(L! - p0!) : undefined;
          const cm = r ? onRod(r.d) : undefined;
          const eq =
            r?.Leq !== undefined
              ? { x: px - r.Leq * s * Math.sin(th), y: py + r.Leq * s * Math.cos(th) }
              : undefined;
          const R = r ? (L! - p0!) * s : 0;
          return (
            <>
              <Svg width={w} height={H}>
                <Defs>
                  <TopLight id={ids.wood} />
                  <Metal id={ids.pin} light={c.metal} dark={c.metalDark} />
                  <Ball id={ids.bob} color={c.metal} />
                </Defs>
                {/* The vertical through the pin and the swing of the rod's end. */}
                <Line
                  x1={px}
                  y1={py}
                  x2={px}
                  y2={Math.min(H - 6, py + Math.max(R, eq ? eq.y - py : 0) + 14)}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dashFine}
                />
                {r && swings ? (
                  <Path
                    d={`M ${px - R * Math.sin(th)} ${py + R * Math.cos(th)} A ${R} ${R} 0 0 0 ${end!.x} ${end!.y}`}
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dash}
                    fill="none"
                  />
                ) : null}
                {/* The simple pendulum of the same period. */}
                {eq ? (
                  <G>
                    <Line
                      x1={px}
                      y1={py}
                      x2={eq.x}
                      y2={eq.y}
                      stroke={c.chartInk}
                      strokeWidth={1.5}
                      strokeDasharray={chart.dash}
                    />
                    <Circle
                      cx={eq.x}
                      cy={eq.y}
                      r={8}
                      fill={url(ids.bob)}
                      stroke={c.metalDark}
                      opacity={0.85}
                    />
                    <Tag
                      x={eq.x - 14}
                      y={eq.y + 4}
                      text={label(spec.equivalent, 'L_eq', r!.Leq, 'm')!}
                      anchor="end"
                      w={w}
                    />
                  </G>
                ) : null}
                {/* The pin's plate, behind the rod. */}
                <Rect x={px - 11} y={py - 8} width={22} height={16} rx={4} fill={url(ids.pin)} />
                {/* The rod, turned about the pin. */}
                {r ? (
                  <G transform={`rotate(${-th / DEG} ${px} ${py})`} opacity={swings ? 1 : 0.45}>
                    <Rect
                      x={px - ROD_W / 2}
                      y={py - p0! * s}
                      width={ROD_W}
                      height={L! * s}
                      rx={3}
                      fill={c.wood}
                      stroke={c.woodDark}
                      strokeWidth={1.5}
                    />
                    <Rect
                      x={px - ROD_W / 2}
                      y={py - p0! * s}
                      width={ROD_W}
                      height={L! * s}
                      rx={3}
                      fill={url(ids.wood)}
                    />
                    {/* d bracketed beside the rod, pin to center of mass. */}
                    {r.d > 0 ? (
                      <G>
                        <Line
                          x1={px + ROD_W / 2 + 9}
                          y1={py}
                          x2={px + ROD_W / 2 + 9}
                          y2={py + r.d * s}
                          stroke={c.chartInk}
                        />
                        <Line
                          x1={px + ROD_W / 2 + 4}
                          y1={py}
                          x2={px + ROD_W / 2 + 14}
                          y2={py}
                          stroke={c.chartInk}
                        />
                        <Line
                          x1={px + ROD_W / 2 + 4}
                          y1={py + r.d * s}
                          x2={px + ROD_W / 2 + 14}
                          y2={py + r.d * s}
                          stroke={c.chartInk}
                        />
                      </G>
                    ) : null}
                  </G>
                ) : null}
                {/* The pin. */}
                <Circle cx={px} cy={py} r={5} fill={url(ids.pin)} stroke={c.metalDark} />
                <Circle cx={px} cy={py} r={1.8} fill={c.metalDark} />
                {/* The center of mass, over the pin when they are close. */}
                {r ? (
                  <G transform={`rotate(${-th / DEG} ${px} ${py})`} opacity={swings ? 1 : 0.45}>
                    <Circle
                      cx={px}
                      cy={py + r.d * s}
                      r={7}
                      fill={c.card}
                      stroke={c.chartInk}
                      strokeWidth={1.5}
                    />
                    <Path
                      d={`M ${px} ${py + r.d * s} L ${px + 7} ${py + r.d * s} A 7 7 0 0 0 ${px} ${py + r.d * s - 7} Z M ${px} ${py + r.d * s} L ${px - 7} ${py + r.d * s} A 7 7 0 0 0 ${px} ${py + r.d * s + 7} Z`}
                      fill={c.chartInk}
                    />
                  </G>
                ) : null}
                {r && cm ? (
                  <G>
                    {r.d > 0 ? (
                      <Tag
                        x={onRod(r.d / 2, ROD_W / 2 + 18).x}
                        y={onRod(r.d / 2, ROD_W / 2 + 18).y + 4}
                        text={label(spec.distance, 'd', r.d, 'm')!}
                        anchor="start"
                        w={w}
                      />
                    ) : null}
                    <Tag
                      x={end!.x + 10}
                      y={end!.y + 4}
                      text={label(spec.rod.length, 'L', L, 'm')!}
                      anchor="start"
                      w={w}
                    />
                  </G>
                ) : null}
                {corner.map((t, i) => (
                  <Tag key={t} x={6} y={16 + i * 18} text={t} anchor="start" w={w} />
                ))}
                {label(spec.g, 'g', g, 'm/s²') ? (
                  <Tag x={w - 6} y={16} text={label(spec.g, 'g', g, 'm/s²')!} anchor="end" w={w} />
                ) : null}
              </Svg>
              {dragId && r && cm && end ? (
                <DragHandle
                  testID={pivotVar ? 'drag-rod-pivot' : 'drag-rod-length'}
                  x={pivotVar ? cm.x : end.x}
                  y={pivotVar ? cm.y : end.y}
                  label={rep.variable(dragId).name}
                  onStart={() => {
                    win.freeze();
                    start.current = pivotVar ? p0! : L!;
                  }}
                  onEnd={() => win.release()}
                  onMove={(dx, dy) => {
                    // Along the rod, down positive, in metres.
                    const along = (dx * Math.sin(th) + dy * Math.cos(th)) / s;
                    if (pivotVar)
                      setOne(pivotVar, Math.max(0, start.current - along), [
                        spec.rod.length,
                        spec.mass,
                      ]);
                    else
                      setOne(lengthVar!, Math.max(1e-3, start.current + along), [
                        spec.rod.pivot,
                        spec.mass,
                      ]);
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
