import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { EnergyTrackSpec } from '@/data/modules/typesMechanics';
import type { EnergySpring as Spring } from '@/data/modules/typesHsk';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, niceCeil, useFrozen, useRep } from './common';
import { sig, SubLabel } from './hskKit';
import { TopLight, url, usePaintIds } from './paint';

const SCENE = 0.5;

/**
 * An energy track with a spring launcher and friction (H63): a steel spring pressed against a
 * wall launches a block across a rough patch (friction turns some energy to heat) and up a
 * smooth ramp to the track's height. Two stacked bars: the spring's energy at the start, and
 * now heat + potential + kinetic, the same total. Drag the block up or down the ramp.
 */
export function EnergySpring({
  spec,
  s,
  calc,
}: {
  spec: EnergyTrackSpec;
  s: Spring;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('light');
  const drag = useRef(0);
  const g = spec.g ?? 9.8;
  const si = (x: number | string | undefined, d = 0) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) => typeof x !== 'string' || rep.known(x);
  const k = Math.max(0, si(s.k));
  const x = Math.max(0, si(s.compression));
  const m = Math.max(1e-9, si(spec.mass, 1));
  const f = Math.max(0, si(s.friction));
  const d = Math.max(0, si(s.rough));
  const h = Math.max(0, rep.val(spec.height));
  const E0 = 0.5 * k * x * x;
  const heat = f * d;
  const pe = m * g * h;
  const ke = E0 - heat - pe;
  const reach = Math.max(0, (E0 - heat) / (m * g));
  const all = [s.k, s.compression, spec.mass, s.friction, s.rough, spec.height].every(known);
  const scale = useFrozen({ top: Math.max(reach, h, 1e-9) * 1.1, E: niceCeil(Math.max(E0, 1e-9)) });
  const lines = captionLines();

  return (
    <View>
      <Canvas aspect={0.9}>
        {({ w, h: ch }) => {
          const sceneH = ch * SCENE;
          const ground = sceneH - 12;
          const wallX = 10;
          const springEnd = 70;
          const patch = { x0: 96, x1: w * 0.52 };
          const rampX0 = w * 0.56;
          const rampX1 = w - 10;
          const rampTop = 22;
          const hToY = (hh: number) => ground - ((ground - rampTop) * hh) / scale.value.top;
          const yB = hToY(h);
          const xB = rampX0 + ((rampX1 - rampX0) * (ground - yB)) / (ground - rampTop);
          const ang = Math.atan2(ground - rampTop, rampX1 - rampX0);
          const bs = 22;
          const onRamp = h > 1e-9;
          const block = onRamp
            ? { x: xB - Math.sin(ang) * (bs / 2), y: yB - Math.cos(ang) * (bs / 2) }
            : { x: (patch.x1 + rampX0) / 2, y: ground - bs / 2 };
          // The spring: coils from the wall to its end, pressed in.
          const coils = 8;
          const zig = Array.from({ length: coils * 2 + 1 }, (_, i) => {
            const t = i / (coils * 2);
            const px = wallX + 4 + t * (springEnd - wallX - 4);
            const py = ground - 11 + (i === 0 || i === coils * 2 ? 0 : i % 2 ? -8 : 8);
            return `${i ? 'L' : 'M'} ${px} ${py}`;
          }).join(' ');
          // Bars.
          const barTop = sceneH + 26;
          const barBot = ch - 24;
          const bh = (E: number) => ((barBot - barTop) * Math.max(0, E)) / scale.value.E;
          const cols = [
            {
              x: w * 0.2,
              parts: [{ E: E0, color: c.chartSecond, name: 'spring' }],
              title: 'Start',
            },
            {
              x: w * 0.48,
              parts: [
                { E: heat, color: c.forceFriction, name: 'heat' },
                { E: pe, color: c.lineSum, name: 'potential' },
                { E: ke, color: c.chartHighlight, name: 'kinetic' },
              ],
              title: 'Now',
            },
          ];
          return (
            <>
              <Svg width={w} height={ch}>
                <Defs>
                  <TopLight id={ids.light} />
                </Defs>
                <G opacity={all ? 1 : 0.45}>
                  <Rect x={0} y={ground} width={w} height={6} fill={c.soil} />
                  <Rect x={wallX - 6} y={ground - 40} width={6} height={40} fill={c.metalDark} />
                  <Path d={zig} stroke={c.physSpring} strokeWidth={2.5} fill="none" />
                  <SubLabel
                    x={(wallX + springEnd) / 2}
                    y={ground - 26}
                    text={`k ${sig(k)} N/m`}
                    size={chart.label}
                    w={w}
                  />
                  {/* The rough patch, grit on the floor. */}
                  <Rect
                    x={patch.x0}
                    y={ground - 3}
                    width={patch.x1 - patch.x0}
                    height={5}
                    fill={c.rock5}
                  />
                  {Array.from({ length: Math.floor((patch.x1 - patch.x0) / 6) }, (_, i) => (
                    <Circle
                      key={i}
                      cx={patch.x0 + 3 + i * 6}
                      cy={ground - 3 - (i % 2)}
                      r={1.2}
                      fill={c.chartInk}
                      opacity={0.5}
                    />
                  ))}
                  <SubLabel
                    x={(patch.x0 + patch.x1) / 2}
                    y={ground + 20}
                    text={`rough ${sig(d)} m, f = ${sig(f)} N`}
                    size={chart.label}
                    w={w}
                  />
                  <Polygon
                    points={`${rampX0},${ground} ${rampX1},${ground} ${rampX1},${rampTop}`}
                    fill={c.wood}
                    stroke={c.woodDark}
                  />
                  <Polygon
                    points={`${rampX0},${ground} ${rampX1},${ground} ${rampX1},${rampTop}`}
                    fill={url(ids.light)}
                  />
                  {reach < scale.value.top ? (
                    <G>
                      <Line
                        x1={rampX0 - 10}
                        y1={hToY(reach)}
                        x2={rampX1}
                        y2={hToY(reach)}
                        stroke={c.chartMuted}
                        strokeDasharray={chart.dashFine}
                      />
                      <SubLabel
                        x={rampX0 - 12}
                        y={hToY(reach) + 4}
                        text={`highest ${sig(reach)} m`}
                        anchor="end"
                        size={chart.label}
                        bold={false}
                        w={w}
                      />
                    </G>
                  ) : null}
                  <G
                    rotation={onRamp ? (-ang * 180) / Math.PI : 0}
                    origin={`${block.x}, ${block.y}`}
                  >
                    <Rect
                      x={block.x - bs / 2}
                      y={block.y - bs / 2}
                      width={bs}
                      height={bs}
                      rx={2}
                      fill={c.physCartA}
                      stroke={c.chartInk}
                    />
                    <Rect
                      x={block.x - bs / 2}
                      y={block.y - bs / 2}
                      width={bs}
                      height={bs}
                      rx={2}
                      fill={url(ids.light)}
                    />
                  </G>
                  {onRamp ? (
                    <SubLabel
                      x={xB + 10}
                      y={yB + 24}
                      text={`h ${sig(h)} m`}
                      anchor="start"
                      size={chart.label}
                      w={w}
                    />
                  ) : null}
                </G>
                {/* Energy bars: the start and now, one scale. */}
                <Line x1={w * 0.08} y1={barBot} x2={w * 0.62} y2={barBot} stroke={c.chartInk} />
                <Line
                  x1={w * 0.08}
                  y1={barBot - bh(E0)}
                  x2={w * 0.62}
                  y2={barBot - bh(E0)}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dashFine}
                />
                {cols.map((col) => {
                  let y = barBot;
                  return (
                    <G key={col.title}>
                      {col.parts.map((p) => {
                        const hh = bh(p.E);
                        y -= hh;
                        return (
                          <Rect
                            key={p.name}
                            x={col.x}
                            y={y}
                            width={w * 0.14}
                            height={hh}
                            fill={p.color}
                            opacity={all ? 1 : 0.45}
                          />
                        );
                      })}
                      <ChartText
                        x={col.x + w * 0.07}
                        y={barBot + 16}
                        textAnchor="middle"
                        fontSize={chart.label}
                        fontWeight="700"
                      >
                        {col.title}
                      </ChartText>
                    </G>
                  );
                })}
                {/* A key beside the bars, each energy with its value. */}
                {[
                  { E: E0, color: c.chartSecond, name: 'spring ½kx²' },
                  { E: ke, color: c.chartHighlight, name: 'kinetic' },
                  { E: pe, color: c.lineSum, name: 'potential mgh' },
                  { E: heat, color: c.forceFriction, name: 'heat fd' },
                ].map((p, i) => (
                  <G key={p.name}>
                    <Rect x={w * 0.66} y={barTop + i * 24} width={12} height={12} fill={p.color} />
                    <ChartText x={w * 0.66 + 17} y={barTop + i * 24 + 11} fontSize={chart.label}>
                      {`${p.name} ${sig(Math.max(0, p.E))} J`}
                    </ChartText>
                  </G>
                ))}
              </Svg>
              {!s.fixed && rep.known(spec.height) ? (
                <DragHandle
                  testID="drag-height"
                  x={onRamp ? xB : rampX0 + 6}
                  y={onRamp ? yB : ground}
                  label={rep.variable(spec.height).name}
                  onStart={() => {
                    drag.current = h;
                    scale.freeze();
                  }}
                  onEnd={scale.release}
                  onMove={(_, dy) => {
                    const dh = (-dy * scale.value.top) / (ground - rampTop);
                    const pins = [spec.mass, s.k, s.compression, s.friction, s.rough].filter(
                      (q): q is string => typeof q === 'string',
                    );
                    calc.set(
                      {
                        ...rep.pin(pins),
                        [spec.height]: rep.snapTo(spec.height, Math.max(0, drag.current + dh)),
                      },
                      rep.slide(spec.height),
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

  function captionLines() {
    const out = [
      `Spring: ½kx² = ½ × ${sig(k)} × ${sig(x)}² = ${sig(E0)} J`,
      `Heat on the rough patch: fd = ${sig(f)} × ${sig(d)} = ${sig(heat)} J`,
      `Potential: mgh = ${sig(m)} × ${formatNumber(g)} × ${sig(h)} = ${sig(pe)} J`,
    ];
    out.push(
      ke >= -1e-9
        ? `Kinetic: ${sig(E0)} − ${sig(heat)} − ${sig(pe)} = ${sig(Math.max(0, ke))} J`
        : `The block can’t get this high: it stops at ${sig(reach)} m, where kinetic energy runs out.`,
    );
    return out;
  }
}
