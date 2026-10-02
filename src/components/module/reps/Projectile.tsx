import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { ProjectileSpec } from '@/data/modules/typesHsk';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import { niceStep } from './hsdGrid';
import { G_EARTH, projectileOf } from './hskMath';
import { RAD, sig, SubLabel, Vec, withUnit } from './hskKit';
import { Ball, TopLight, url, usePaintIds } from './paint';

const [L, R, T, B] = [34, 14, 24, 58];

/** A signed number in brackets for substituting: (−9.8). */
const par = (s: string) => (s.startsWith('−') ? `(${s})` : s);

/**
 * A projectile (H59) drawn to scale from its launch speed, angle and height: the path, the
 * ball at launch, at the top and on landing (or at time t) with its velocity and components,
 * the maximum height and the range. Drag the launch velocity's tip to change the angle.
 */
export function Projectile({ spec, calc }: { spec: ProjectileSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('ball', 'at', 'rock', 'soil');
  const drag = useRef({ x: 0, y: 0 });
  const g = spec.g ?? G_EARTH;
  // Physics in SI (m, m/s, s, degrees), whatever units the boxes show.
  const si = (x: number | string | undefined) =>
    x === undefined ? 0 : typeof x === 'number' ? x : rep.val(x);
  const v = Math.max(0, rep.val(spec.speed));
  // H105: the angle may be a number (a level launch, 0°): no handle then.
  const angleId = typeof spec.angle === 'string' ? spec.angle : undefined;
  const th = angleId ? rep.val(angleId) : (spec.angle as number);
  const h = Math.max(0, si(spec.height));
  const p = projectileOf(v, th, h, g);
  const known =
    rep.known(spec.speed) &&
    (!angleId || rep.known(angleId)) &&
    (typeof spec.height !== 'string' || rep.known(spec.height));
  // A "?" box reads "?" on the picture too, not the example's number drawn faded behind it.
  const q = (ok: boolean, text: string) => (ok ? text : '?');
  const compOk = rep.known(spec.speed) && (!angleId || rep.known(angleId));
  const atOk = known && (!spec.at || rep.known(spec.at));
  const tAt = spec.at ? Math.max(0, rep.val(spec.at)) : undefined;
  const pos = (t: number) => ({ x: p.vx * t, y: h + p.vy * t - (g * t * t) / 2 });
  const vel = (t: number) => ({ x: p.vx, y: p.vy - g * t });
  const tTop = p.vy > 0 ? p.vy / g : undefined;
  const lenU = rep.variable(spec.speed).unit?.split('/')[0] ?? 'm';
  const spU = rep.variable(spec.speed).unit ?? 'm/s';

  // A window holding the path (and the point at t, even past the landing), one scale both ways.
  const live = (() => {
    const tEnd = Math.max(p.T, tAt ?? 0);
    const far = Math.max(p.R, tAt !== undefined ? pos(tAt).x : 0, 1);
    const high = Math.max(p.H, h, 1);
    const low = Math.min(0, tAt !== undefined ? pos(tEnd).y : 0);
    const step = niceStep(Math.max(far, high - low) / 6);
    return {
      x0: h > 0 ? -Math.max(step, far * 0.1) : 0,
      x1: Math.ceil((far * 1.06) / step) * step,
      y0: Math.floor(low / step) * step,
      y1: Math.ceil((high * 1.12) / step) * step,
      step,
    };
  })();
  const win = useFrozen(live);
  const W = win.value;
  const ratio = (W.y1 - W.y0) / (W.x1 - W.x0);

  const sym = (id: string) => rep.variable(id).symbol;
  const lines = captionLines();

  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.9, Math.max(0.5, ((w - L - R) * ratio + T + B) / w))}>
        {({ w, h: ch }) => {
          const u = Math.min((w - L - R) / (W.x1 - W.x0), (ch - T - B) / (W.y1 - W.y0));
          const left = L + (w - L - R - u * (W.x1 - W.x0)) / 2;
          const sx = (x: number) => left + (x - W.x0) * u;
          const sy = (y: number) => T + (W.y1 - y) * u;
          const ground = sy(0);
          const n = 90;
          const tEnd = tAt !== undefined ? Math.max(p.T, tAt) : p.T;
          const path = Array.from({ length: n + 1 }, (_, i) => pos((i * p.T) / n))
            .map((q, i) => `${i ? 'L' : 'M'} ${sx(q.x).toFixed(1)} ${sy(q.y).toFixed(1)}`)
            .join(' ');
          // Arrows: the launch speed is 72 px; every velocity on the same scale.
          const k = 72 / Math.max(1e-9, v, Math.hypot(vel(tEnd).x, vel(tEnd).y) * 0.8);
          const shots = [
            { t: 0, name: 'launch' },
            ...(tTop !== undefined && tTop < p.T && tAt === undefined
              ? [{ t: tTop, name: 'top' }]
              : []),
            ...(tAt !== undefined ? [{ t: tAt, name: 't' }] : [{ t: p.T, name: 'land' }]),
          ];
          const launch = { x: sx(0), y: sy(h) };
          const tip = { x: launch.x + p.vx * k, y: launch.y - p.vy * k };
          const ticks = (a: number, b: number) =>
            Array.from(
              { length: Math.floor((b - a) / W.step + 1e-9) + 1 },
              (_, i) => Math.ceil(a / W.step - 1e-9) * W.step + i * W.step,
            ).filter((x) => x <= b + 1e-9);
          const thText = angleId ? rep.value(angleId) : `${formatNumber(th)}°`;
          return (
            <>
              <Svg width={w} height={ch}>
                <Defs>
                  <Ball id={ids.ball} color={c.ballRed} />
                  <Ball id={ids.at} color={c.chartHighlight} />
                  <TopLight id={ids.rock} />
                </Defs>
                {/* Grid, one scale both ways. */}
                {ticks(W.x0, W.x1).map((x) => (
                  <Line
                    key={`gx${x}`}
                    x1={sx(x)}
                    y1={sy(W.y1)}
                    x2={sx(x)}
                    y2={Math.min(ground, sy(W.y0))}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                  />
                ))}
                {ticks(Math.max(0, W.y0), W.y1).map((y) => (
                  <G key={`gy${y}`}>
                    <Line
                      x1={sx(W.x0)}
                      y1={sy(y)}
                      x2={sx(W.x1)}
                      y2={sy(y)}
                      stroke={c.chartGrid}
                      strokeWidth={1}
                    />
                    {y > 0 ? (
                      <ChartText
                        x={sx(W.x0) - 5}
                        y={sy(y) + 4}
                        fontSize={chart.label}
                        fill={c.chartMuted}
                        textAnchor="end"
                      >
                        {formatNumber(y)}
                      </ChartText>
                    ) : null}
                  </G>
                ))}
                {/* The ground: soil with a grass edge, and a rock cliff under a raised launch. */}
                <Rect
                  x={sx(W.x0)}
                  y={ground}
                  width={sx(W.x1) - sx(W.x0)}
                  height={14}
                  fill={c.soil}
                />
                <Rect
                  x={sx(W.x0)}
                  y={ground}
                  width={sx(W.x1) - sx(W.x0)}
                  height={3}
                  fill={c.lifeDeep}
                />
                {h > 0 ? (
                  <G>
                    <Rect
                      x={sx(W.x0)}
                      y={sy(h)}
                      width={sx(0) - sx(W.x0)}
                      height={ground - sy(h) + 14}
                      fill={c.rock2}
                      stroke={c.rock5}
                    />
                    <Rect
                      x={sx(W.x0)}
                      y={sy(h)}
                      width={sx(0) - sx(W.x0)}
                      height={ground - sy(h) + 14}
                      fill={url(ids.rock)}
                    />
                    <Rect
                      x={sx(W.x0)}
                      y={sy(h) - 2}
                      width={sx(0) - sx(W.x0)}
                      height={3}
                      fill={c.lifeDeep}
                    />
                  </G>
                ) : null}
                {/* Maximum height and range. */}
                {tTop !== undefined && tTop < p.T ? (
                  <G opacity={known ? 1 : 0.4}>
                    <Line
                      x1={sx(0)}
                      y1={sy(p.H)}
                      x2={sx(pos(tTop).x)}
                      y2={sy(p.H)}
                      stroke={c.chartMuted}
                      strokeDasharray={chart.dash}
                    />
                    <Line
                      x1={sx(pos(tTop).x)}
                      y1={sy(p.H)}
                      x2={sx(pos(tTop).x)}
                      y2={ground}
                      stroke={c.chartMuted}
                      strokeDasharray={chart.dashFine}
                    />
                    {/* H over the top of the arc, right of the apex (the angle's handle near the
                        top hid it centred), R at the landing: they no longer meet. */}
                    <SubLabel
                      x={sx(pos(tTop).x) + 14}
                      y={sy(p.H) - 9}
                      text={`H = ${withUnit(q(known, sig(p.H)), lenU)}`}
                      anchor="start"
                      w={w}
                    />
                  </G>
                ) : null}
                <G opacity={known ? 1 : 0.4}>
                  <Line
                    x1={sx(0)}
                    y1={ground + 7}
                    x2={sx(p.R)}
                    y2={ground + 7}
                    stroke={c.onAccent}
                    strokeWidth={1.5}
                  />
                  <Line
                    x1={sx(p.R)}
                    y1={ground + 2}
                    x2={sx(p.R)}
                    y2={ground + 12}
                    stroke={c.onAccent}
                    strokeWidth={1.5}
                  />
                </G>
                <Path
                  d={path}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.stroke}
                  strokeDasharray={known ? chart.dashFine : chart.dash}
                  fill="none"
                  opacity={known ? 1 : 0.4}
                />
                {tAt !== undefined && tAt > p.T ? (
                  <Path
                    d={Array.from({ length: 31 }, (_, i) => pos(p.T + ((tAt - p.T) * i) / 30))
                      .map((q, i) => `${i ? 'L' : 'M'} ${sx(q.x).toFixed(1)} ${sy(q.y).toFixed(1)}`)
                      .join(' ')}
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dashFine}
                    fill="none"
                  />
                ) : null}
                {/* The launch angle. */}
                {Math.abs(th) > 0.5 ? (
                  <G>
                    <Line
                      x1={launch.x}
                      y1={launch.y}
                      x2={launch.x + 44}
                      y2={launch.y}
                      stroke={c.chartMuted}
                      strokeDasharray={chart.dashFine}
                    />
                    <Path
                      d={`M ${launch.x + 30} ${launch.y} A 30 30 0 0 ${th > 0 ? 0 : 1} ${launch.x + 30 * Math.cos(th * RAD)} ${launch.y - 30 * Math.sin(th * RAD)}`}
                      stroke={c.chartInk}
                      fill="none"
                    />
                  </G>
                ) : null}
                {shots.map((s, i) => {
                  const q = pos(s.t);
                  const vv = vel(s.t);
                  const [bx, by] = [sx(q.x), sy(q.y)];
                  const first = i === 0;
                  return (
                    <G key={s.name} opacity={known ? 1 : 0.4}>
                      <Vec
                        x1={bx}
                        y1={by}
                        x2={bx + vv.x * k}
                        y2={by}
                        color={c.unitCircleCosine}
                        width={2}
                        head={8}
                        dash={first ? undefined : chart.dashFine}
                      />
                      <Vec
                        x1={bx}
                        y1={by}
                        x2={bx}
                        y2={by - vv.y * k}
                        color={c.unitCircleSine}
                        width={2}
                        head={8}
                        dash={first ? undefined : chart.dashFine}
                      />
                      <Vec
                        x1={bx}
                        y1={by}
                        x2={bx + vv.x * k}
                        y2={by - vv.y * k}
                        color={c.chartInk}
                        width={2.5}
                        head={10}
                      />
                      <Circle
                        cx={bx}
                        cy={by}
                        r={7}
                        fill={url(s.name === 't' ? ids.at : ids.ball)}
                        stroke={c.chartInk}
                        strokeWidth={1}
                      />
                    </G>
                  );
                })}
                {/* Distances along the ground, on chips over any arrow that passes them. */}
                {ticks(Math.max(0, W.x0), W.x1)
                  .filter((x) => x > 0)
                  .map((x) => (
                    <SubLabel
                      key={`nx${x}`}
                      x={sx(x)}
                      y={ground + 30}
                      text={formatNumber(x)}
                      size={chart.label}
                      bold={false}
                      color={c.chartMuted}
                      w={w}
                    />
                  ))}
                {/* The axis's name on a row under its numbers, at the left end: at the right the
                    landing's velocity arrow ran through it. */}
                <SubLabel
                  x={sx(W.x0)}
                  y={ground + 48}
                  text={spec.parametric ? `x (${lenU})` : `distance (${lenU})`}
                  anchor="start"
                  size={chart.label}
                  bold={false}
                  color={c.chartMuted}
                  w={w}
                />
                {/* Labels at the launch. */}
                <SubLabel
                  x={launch.x + p.vx * k + 4}
                  y={launch.y + 16}
                  text={`v_x ${q(compOk, sig(p.vx))}`}
                  anchor="start"
                  color={c.unitCircleCosine}
                  w={w}
                />
                {Math.abs(p.vy * k) > 16 ? (
                  <SubLabel
                    x={launch.x - 4}
                    y={launch.y - p.vy * k * 0.55}
                    text={`v_y ${q(compOk, sig(p.vy))}`}
                    anchor="end"
                    color={c.unitCircleSine}
                    w={w}
                  />
                ) : null}
                {Math.abs(th) > 0.5 ? (
                  <SubLabel
                    x={launch.x + 36 * Math.cos((th / 2) * RAD) + 4}
                    y={launch.y - 36 * Math.sin((th / 2) * RAD) + 4}
                    text={thText}
                    anchor="start"
                    chip={false}
                    w={w}
                  />
                ) : null}
                <SubLabel
                  x={sx(p.R) - 6}
                  y={ground - 7}
                  text={`R = ${withUnit(q(known, sig(p.R)), lenU)}`}
                  anchor="end"
                  w={w}
                />
                {tAt !== undefined ? (
                  <SubLabel
                    x={sx(pos(tAt).x) + 12}
                    // Near the top, H's tag is above: the point's goes under it.
                    y={
                      sy(pos(tAt).y) +
                      (tTop !== undefined &&
                      Math.abs(sx(pos(tAt).x) - sx(pos(tTop).x)) < 90 &&
                      Math.abs(sy(pos(tAt).y) - sy(p.H)) < 20
                        ? 24
                        : -10)
                    }
                    text={atOk ? `(${sig(pos(tAt).x)}, ${sig(pos(tAt).y)})` : '(?, ?)'}
                    anchor="start"
                    color={c.chartHighlight}
                    w={w}
                  />
                ) : null}
              </Svg>
              {!spec.fixed && angleId && rep.known(angleId) && v > 0 ? (
                <DragHandle
                  testID="drag-angle"
                  x={tip.x}
                  y={tip.y}
                  label={rep.variable(angleId).name}
                  onStart={() => {
                    drag.current = { x: tip.x - launch.x, y: tip.y - launch.y };
                    win.freeze();
                  }}
                  onEnd={win.release}
                  onMove={(dx, dy) => {
                    const ax = drag.current.x + dx;
                    const ay = drag.current.y + dy;
                    const deg = Math.atan2(-ay, Math.max(1, ax)) / RAD;
                    const others = [spec.speed, spec.height].filter(
                      (x): x is string => typeof x === 'string',
                    );
                    calc.set(
                      { ...rep.pin(others), [angleId]: rep.snapTo(angleId, deg) },
                      rep.slide(angleId),
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
    const vs = sym(spec.speed);
    const ts = angleId ? sym(angleId) : 'θ';
    const vt = rep.value(spec.speed, false);
    const tt = angleId ? rep.value(angleId, false) : formatNumber(th);
    const vxs = spec.vx ? sym(spec.vx) : 'vₓ';
    const vys = spec.vy ? sym(spec.vy) : 'vᵧ';
    const out = [
      `${vxs} = ${vs} cos ${ts} = ${vt} × cos ${tt}° = ${withUnit(q(compOk, sig(p.vx)), spU)}`,
      `${vys} = ${vs} sin ${ts} = ${vt} × sin ${tt}° = ${withUnit(q(compOk, sig(p.vy)), spU)}`,
    ];
    // Until every box the path needs is known, no worked numbers: the rest are "?".
    if (!known) {
      if (!spec.parametric) out.push(`In the air until h + ${vys}t − ½gt² = 0.`, `R = ${vxs}T`);
      return out;
    }
    if (spec.parametric && tAt !== undefined) {
      const q = pos(tAt);
      const tv = spec.at ? rep.value(spec.at, false) : sig(tAt);
      out.push(
        `x(t) = ${par(sig(p.vx))}t = ${sig(p.vx)} × ${tv} = ${withUnit(sig(q.x), lenU)}`,
        `y(t) = ${sig(h)} + ${par(sig(p.vy))}t − ${formatNumber(g / 2)}t² = ${withUnit(sig(q.y), lenU)}`,
      );
      if (q.y < 0)
        out.push(
          'Past the landing the formula goes below the ground: the ball has already landed.',
        );
      return out;
    }
    if (tTop !== undefined)
      out.push(
        `H = h + ${vys}²/(2g) = ${sig(h)} + ${par(sig(p.vy))}²/(2 × ${formatNumber(g)}) = ${withUnit(sig(p.H), lenU)}`,
      );
    out.push(
      `In the air ${withUnit(sig(p.T), 's')}, until h + ${vys}t − ½gt² = 0.`,
      `R = ${vxs}T = ${sig(p.vx)} × ${sig(p.T)} = ${withUnit(sig(p.R), lenU)}`,
    );
    return out;
  }
}
