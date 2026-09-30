import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { PendulumSpec } from '@/data/modules/typesHs3a';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen } from './common';
import { num } from './CircularSatellite';
import { useReader } from './hs3aKit';
import { pendulumOf } from './hs3aMath';
import { RAD, SubLabel, zeroWindow } from './hskKit';
import { Ball, url, usePaintIds } from './paint';

/** Where g is what the page types (m/s²). */
const PLACES = [
  { g: 9.8, name: 'Earth' },
  { g: 1.62, name: 'the Moon' },
  { g: 3.71, name: 'Mars' },
  { g: 24.8, name: 'Jupiter' },
];
const BOB = 12;

/**
 * A simple pendulum (H107): a bob on a string of length L drawn to the scale of the meter rule
 * beside it, swinging a small angle each way (the far side and the bottom faded) along its
 * arc; g named for where it swings; the period T = 2π√(L/g) as a bar on a strip of seconds.
 * Drag the bob for L.
 */
export function Pendulum({ spec, calc }: { spec: PendulumSpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, v, known, all, text, unit } = useReader(calc);
  const ids = usePaintIds('bob');
  const drag = useRef({ L: 0, px: 0 });
  const L = Math.max(1e-9, v(spec.length, 1));
  const g = Math.max(1e-9, v(spec.gravity, 9.8));
  const { T, f } = pendulumOf(L, g);
  const swing = Math.min(20, Math.max(2, spec.swing ?? 10));
  const place = PLACES.find((p) => Math.abs(p.g - g) < 0.005);
  const uL = unit(spec.length, 'm');
  const win = useFrozen(zeroWindow(L, 5));
  const lengthId = typeof spec.length === 'string' ? spec.length : undefined;

  return (
    <View>
      <Canvas aspect={0.98}>
        {({ w, h }) => {
          const P = { x: w * 0.36, y: 26 };
          const ruleX = w * 0.74;
          const bottom = h - 118;
          const scale = (bottom - P.y) / win.value.hi;
          const Lpx = Math.min(bottom - P.y + 30, L * scale);
          const at = (deg: number) => ({
            x: P.x + Lpx * Math.sin(deg * RAD),
            y: P.y + Lpx * Math.cos(deg * RAD),
          });
          const [bob, far, low] = [at(swing), at(-swing), at(0)];
          const ticks = Array.from(
            { length: Math.round(win.value.hi / win.value.step) + 1 },
            (_, i) => i * win.value.step,
          );
          const strip = { x: 20, y: h - 44, w: w - 40 };
          const tw = zeroWindow(T, 5);
          const SX = (t: number) => strip.x + (strip.w * t) / tw.hi;
          const secs = Array.from(
            { length: Math.round(tw.hi / tw.step) + 1 },
            (_, i) => i * tw.step,
          );
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Ball id={ids.bob} color={c.metal} />
                </Defs>
                <G opacity={all(spec.length, spec.gravity) ? 1 : 0.45}>
                  <Rect x={P.x - 50} y={8} width={100} height={12} rx={2} fill={c.wood} />
                  <Rect x={P.x - 3} y={18} width={6} height={P.y - 18 + 3} fill={c.metalDark} />
                  {/* The swing: its arc, the far end and the bottom faded. */}
                  <Path
                    d={`M ${far.x} ${far.y} A ${Lpx} ${Lpx} 0 0 0 ${bob.x} ${bob.y}`}
                    stroke={c.chartMuted}
                    strokeDasharray="4 4"
                    fill="none"
                  />
                  <Line
                    x1={P.x}
                    y1={P.y}
                    x2={low.x}
                    y2={low.y}
                    stroke={c.chartGrid}
                    strokeDasharray="3 4"
                  />
                  <G opacity={0.25}>
                    <Line x1={P.x} y1={P.y} x2={far.x} y2={far.y} stroke={c.chartInk} />
                    <Circle cx={far.x} cy={far.y} r={BOB} fill={url(ids.bob)} />
                  </G>
                  <Path
                    d={`M ${P.x} ${P.y + 30} A 30 30 0 0 0 ${P.x + 30 * Math.sin(swing * RAD)} ${P.y + 30 * Math.cos(swing * RAD)}`}
                    stroke={c.chartInk}
                    fill="none"
                  />
                  <ChartText x={P.x + 10} y={P.y + 50} fontSize={chart.label} fill={c.chartMuted}>
                    {`${num(swing)}°`}
                  </ChartText>
                  <Line
                    x1={P.x}
                    y1={P.y}
                    x2={bob.x}
                    y2={bob.y}
                    stroke={c.chartInk}
                    strokeWidth={1.5}
                  />
                  <Circle cx={bob.x} cy={bob.y} r={BOB} fill={url(ids.bob)} stroke={c.metalDark} />
                  <SubLabel
                    x={(P.x + bob.x) / 2 + 10}
                    y={(P.y + bob.y) / 2}
                    text={`L = ${text(spec.length, L, uL)}`}
                    anchor="start"
                    w={w}
                  />
                  {/* The meter rule, to the same scale as the string. */}
                  <Rect
                    x={ruleX - 8}
                    y={P.y - 4}
                    width={16}
                    height={win.value.hi * scale + 8}
                    rx={2}
                    fill={c.wood}
                    opacity={0.7}
                  />
                  {ticks.map((t) => (
                    <G key={t}>
                      <Line
                        x1={ruleX - 8}
                        y1={P.y + t * scale}
                        x2={ruleX + 2}
                        y2={P.y + t * scale}
                        stroke={c.chartInk}
                      />
                      <ChartText
                        x={ruleX + 12}
                        y={P.y + t * scale + 4}
                        fontSize={chart.value}
                        fill={c.chartMuted}
                      >
                        {num(t)}
                      </ChartText>
                    </G>
                  ))}
                  <Line
                    x1={P.x}
                    y1={P.y + Lpx}
                    x2={ruleX - 8}
                    y2={P.y + Lpx}
                    stroke={c.chartGrid}
                    strokeDasharray="2 3"
                    opacity={Math.cos(swing * RAD) > 0 ? 1 : 0}
                  />
                  <ChartText
                    x={ruleX - 12}
                    y={P.y + 8}
                    textAnchor="end"
                    fontSize={chart.label}
                    fill={c.chartMuted}
                  >
                    m
                  </ChartText>
                  <SubLabel
                    x={8}
                    y={h - 74}
                    text={`g = ${text(spec.gravity, g, 'm/s²')}${place ? ` (${place.name})` : ''}`}
                    anchor="start"
                    w={w}
                  />
                  {/* The period on a strip of seconds. */}
                  <Rect
                    x={strip.x}
                    y={strip.y}
                    width={SX(T) - strip.x}
                    height={14}
                    fill={c.chartHighlight}
                    fillOpacity={0.45}
                    stroke={c.chartHighlight}
                  />
                  <Line
                    x1={strip.x}
                    y1={strip.y + 14}
                    x2={strip.x + strip.w}
                    y2={strip.y + 14}
                    stroke={c.chartInk}
                  />
                  {secs.map((t) => (
                    <G key={t}>
                      <Line
                        x1={SX(t)}
                        y1={strip.y + 14}
                        x2={SX(t)}
                        y2={strip.y + 20}
                        stroke={c.chartInk}
                      />
                      <ChartText
                        x={SX(t)}
                        y={strip.y + 34}
                        textAnchor="middle"
                        fontSize={chart.value}
                        fill={c.chartMuted}
                      >
                        {num(t)}
                      </ChartText>
                    </G>
                  ))}
                  <SubLabel
                    x={strip.x}
                    y={strip.y - 10}
                    text={`T = ${text(spec.period, T, 's')}: there and back once`}
                    anchor="start"
                    color={c.chartHighlight}
                    w={w}
                  />
                </G>
              </Svg>
              {!spec.fixed && lengthId && known(lengthId) ? (
                <DragHandle
                  testID="drag-length"
                  x={bob.x}
                  y={bob.y}
                  label={rep.variable(lengthId).name}
                  onStart={() => {
                    drag.current = { L, px: Lpx };
                    win.freeze();
                  }}
                  onEnd={win.release}
                  onMove={(_, dy) => {
                    const px = Math.max(8, drag.current.px + dy / Math.cos(swing * RAD));
                    calc.set(
                      {
                        ...rep.pin(typeof spec.gravity === 'string' ? [spec.gravity] : []),
                        [lengthId]: rep.snapTo(lengthId, (drag.current.L * px) / drag.current.px),
                      },
                      rep.slide(lengthId),
                    );
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {[
          `T = 2π√(L/g) = 2π × √(${num(L)}/${num(g)}) = ${num(T)} s`,
          `f = 1/T = ${num(f)} Hz`,
          'For small swings T depends only on L and g: not on the bob’s mass or how far it swings.',
        ].join(' · ')}
      </Caption>
    </View>
  );
}
