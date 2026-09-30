import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { PowerLiftSpec } from '@/data/modules/typesHs2c';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { longTime, num } from './CircularSatellite';
import { niceStep } from './hsdGrid';
import { sig, SubLabel, Vec } from './hskKit';
import { Crate, Metal, TopLight, url, usePaintIds } from './paint';

/** The most one-second pieces the energy bar draws before it counts in bigger pieces. */
const MAX_PIECES = 20;
const CRATE = 40;

/**
 * Power (H102): a crate of mass m hauled up h on a rope over a pulley in time t, its start
 * faded on the floor; a stopwatch sweeps t; the work W = mgh as a bar cut into pieces of one
 * second, each P = W/t joules (the J/s), or into bigger equal pieces when t is long.
 */
export function PowerLift({ spec, calc }: { spec: PowerLiftSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('light', 'wheel', 'rim');
  const val = (x: number | string) => (typeof x === 'number' ? x : rep.val(x));
  const known = (x: number | string) => typeof x === 'number' || rep.known(x);
  const g = spec.g ?? 9.8;
  const m = Math.max(0, val(spec.mass));
  const hgt = Math.max(0, val(spec.height));
  const t = Math.max(1e-9, val(spec.time));
  const W = m * g * hgt;
  const P = W / t;
  const all = [spec.mass, spec.height, spec.time].every(known);
  // Pieces of one second, or of a nice bigger step when there are too many.
  const step = t <= MAX_PIECES ? 1 : niceStep(t / 10);
  const whole = Math.floor(t / step + 1e-9);
  const part = t / step - whole;

  return (
    <View>
      <Canvas aspect={0.86}>
        {({ w, h }) => {
          const floorY = h * 0.62;
          const sx = w * 0.3;
          const topY = 50;
          const cy = floorY - CRATE;
          const liftY = topY + 26;
          const bar = { x: 16, y: floorY + 58, w: w - 32, h: 26 };
          const per = bar.w / (t / step);
          const watch = { x: w * 0.76, y: h * 0.3, r: Math.min(46, w * 0.13) };
          const frac = Math.min(1, t / 60);
          const a = frac * 2 * Math.PI;
          const hand = {
            x: watch.x + (watch.r - 8) * Math.sin(a),
            y: watch.y - (watch.r - 8) * Math.cos(a),
          };
          const sweep =
            frac >= 1
              ? ''
              : `M ${watch.x} ${watch.y} L ${watch.x} ${watch.y - watch.r + 5} A ${watch.r - 5} ${watch.r - 5} 0 ${frac > 0.5 ? 1 : 0} 1 ${watch.x + (watch.r - 5) * Math.sin(a)} ${watch.y - (watch.r - 5) * Math.cos(a)} Z`;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <TopLight id={ids.light} />
                <Metal id={ids.wheel} light={c.metal} dark={c.metalDark} />
                <Metal id={ids.rim} light={c.metal} dark={c.metalDark} />
              </Defs>
              {/* Floor, beam and pulley. */}
              <Rect x={0} y={floorY} width={w * 0.56} height={10} fill={c.chartSurface} />
              <Line x1={0} y1={floorY} x2={w * 0.56} y2={floorY} stroke={c.chartInk} />
              <Rect
                x={8}
                y={14}
                width={w * 0.5}
                height={10}
                rx={2}
                fill={c.wood}
                stroke={c.woodDark}
              />
              <Line x1={sx} y1={24} x2={sx} y2={topY - 14} stroke={c.metalDark} strokeWidth={3} />
              <Circle cx={sx} cy={topY} r={14} fill={url(ids.wheel)} stroke={c.metalDark} />
              <Circle cx={sx} cy={topY} r={3} fill={c.metalDark} />
              {/* The rope: up over the pulley and down to the crate; the other end pulled. */}
              <Line
                x1={sx - 14}
                y1={topY}
                x2={sx - 14}
                y2={liftY}
                stroke={c.woodDark}
                strokeWidth={2.5}
              />
              <Line
                x1={sx + 14}
                y1={topY}
                x2={sx + 14}
                y2={floorY - 8}
                stroke={c.woodDark}
                strokeWidth={2.5}
              />
              <G opacity={all ? 1 : 0.45}>
                {/* Where it started, faded, and where it is now. */}
                <G opacity={0.3}>
                  <Crate x={sx - 14 - CRATE / 2} y={cy} size={CRATE} lightId={ids.light} />
                </G>
                <Crate x={sx - 14 - CRATE / 2} y={liftY} size={CRATE} lightId={ids.light} />
                <Vec
                  x1={sx - 14 - CRATE / 2 - 14}
                  y1={floorY - 4}
                  x2={sx - 14 - CRATE / 2 - 14}
                  y2={liftY + 4}
                  color={c.chartInk}
                  width={2}
                  head={8}
                />
                <SubLabel
                  x={sx - 14 - CRATE / 2 - 20}
                  y={(floorY + liftY) / 2 + 5}
                  text={`h = ${sig(hgt)} m`}
                  anchor="end"
                  w={w}
                />
                <SubLabel
                  x={sx + 22}
                  y={(floorY + liftY) / 2 + 22}
                  text={`pull = mg = ${sig(m * g, 4)} N`}
                  anchor="start"
                  color={c.forceWeight}
                  w={w}
                />
                <SubLabel x={sx - 14} y={floorY + 20} text={`m = ${sig(m)} kg`} w={w} />
                {/* The stopwatch. */}
                <Rect
                  x={watch.x - 6}
                  y={watch.y - watch.r - 12}
                  width={12}
                  height={10}
                  rx={2}
                  fill={url(ids.rim)}
                  stroke={c.metalDark}
                />
                <Circle
                  cx={watch.x}
                  cy={watch.y}
                  r={watch.r}
                  fill={url(ids.rim)}
                  stroke={c.metalDark}
                  strokeWidth={1.5}
                />
                <Circle cx={watch.x} cy={watch.y} r={watch.r - 5} fill={c.card} />
                {frac >= 1 ? (
                  <Circle
                    cx={watch.x}
                    cy={watch.y}
                    r={watch.r - 5}
                    fill={c.physWork}
                    fillOpacity={0.22}
                  />
                ) : (
                  <Path d={sweep} fill={c.physWork} fillOpacity={0.22} />
                )}
                {Array.from({ length: 12 }, (_, i) => {
                  const b = (i * Math.PI) / 6;
                  return (
                    <Line
                      key={i}
                      x1={watch.x + (watch.r - 6) * Math.sin(b)}
                      y1={watch.y - (watch.r - 6) * Math.cos(b)}
                      x2={watch.x + (watch.r - (i % 3 ? 10 : 13)) * Math.sin(b)}
                      y2={watch.y - (watch.r - (i % 3 ? 10 : 13)) * Math.cos(b)}
                      stroke={c.chartInk}
                      strokeWidth={i % 3 ? 1 : 1.8}
                    />
                  );
                })}
                {frac < 1 ? (
                  <Line
                    x1={watch.x}
                    y1={watch.y}
                    x2={hand.x}
                    y2={hand.y}
                    stroke={c.forceWeight}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                ) : null}
                <Circle cx={watch.x} cy={watch.y} r={2.5} fill={c.chartInk} />
                <SubLabel
                  x={watch.x}
                  y={watch.y + watch.r + 20}
                  text={`t = ${longTime(t)}`}
                  w={w}
                />
                {frac >= 1 ? (
                  <ChartText
                    x={watch.x}
                    y={watch.y + watch.r + 36}
                    textAnchor="middle"
                    fontSize={chart.label}
                    fill={c.chartMuted}
                  >
                    (the dial is one minute)
                  </ChartText>
                ) : null}
                {/* The work as a bar of equal pieces, one for each second (or step). */}
                <SubLabel
                  x={bar.x}
                  y={bar.y - 10}
                  text={`W = mgh = ${num(W, 4)} J`}
                  anchor="start"
                  color={c.physWork}
                  w={w}
                />
                <Rect
                  x={bar.x}
                  y={bar.y}
                  width={bar.w}
                  height={bar.h}
                  fill={c.physWork}
                  fillOpacity={0.3}
                  stroke={c.physWork}
                  strokeWidth={1.5}
                />
                {Array.from({ length: whole + (part > 1e-6 ? 1 : 0) - 1 }, (_, i) => (
                  <Line
                    key={i}
                    x1={bar.x + (i + 1) * per}
                    y1={bar.y}
                    x2={bar.x + (i + 1) * per}
                    y2={bar.y + bar.h}
                    stroke={c.physWork}
                    strokeWidth={1.2}
                  />
                ))}
                {per > 44 ? (
                  <ChartText
                    x={bar.x + per / 2}
                    y={bar.y + bar.h / 2 + 5}
                    textAnchor="middle"
                    fontSize={chart.label}
                    fontWeight="700"
                  >
                    {num(P * step, 4)}
                  </ChartText>
                ) : null}
                <SubLabel
                  x={bar.x}
                  y={bar.y + bar.h + 20}
                  text={
                    step === 1
                      ? `each piece is 1 s: P = ${num(P, 4)} J/s = ${num(P, 4)} W`
                      : `each piece is ${num(step)} s: ${num(P * step, 4)} J; P = ${num(P, 4)} W`
                  }
                  anchor="start"
                  w={w}
                />
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{captionLines().join(' · ')}</Caption>
    </View>
  );

  function captionLines(): string[] {
    return [
      `Work done: W = mgh = ${sig(m)} × ${sig(g)} × ${sig(hgt)} = ${num(W, 4)} J`,
      `Power: P = W/t = ${num(W, 4)}/${num(t)} = ${num(P, 4)} W`,
      'A watt is a joule every second: the same work done faster needs more power.',
    ];
  }
}
