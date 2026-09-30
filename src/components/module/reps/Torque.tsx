import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { TorqueSpec } from '@/data/modules/typesHs3a';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle } from './common';
import { num } from './CircularSatellite';
import { CurvedArrow, onCircle, useReader } from './hs3aKit';
import { RAD, SubLabel, Vec } from './hskKit';
import { Metal, TopLight, url, usePaintIds } from './paint';

/** The force arrow's length in px (F is the only force, so its size is its label). */
const FORCE = 96;

/**
 * Torque (H107): a wrench on a bolt, or a door on its hinge seen from above; the lever arm r
 * from the pivot to where F pushes at θ to the arm; F's part along the arm (no turn) and across
 * it, F⊥ = F sin θ, dashed; τ = rF⊥ as a curved arrow round the pivot, its sweep ∝ sin θ.
 * Drag the tip of F for θ.
 */
export function Torque({ spec, calc }: { spec: TorqueSpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, v, known, all, text, unit } = useReader(calc);
  const ids = usePaintIds('metal', 'nut', 'light');
  const start = useRef({ x: 0, y: 0 });
  const r = Math.max(0, v(spec.arm));
  const F = Math.max(0, v(spec.force));
  const th = Math.max(0, Math.min(180, v(spec.angle, 90)));
  const across = F * Math.sin(th * RAD);
  const along = F * Math.cos(th * RAD);
  const tau = r * across;
  const [uF, uR] = [unit(spec.force, 'N'), unit(spec.arm, 'm')];
  const uT = unit(spec.torque, 'N·m');
  const door = spec.body === 'door';
  const angleId = typeof spec.angle === 'string' ? spec.angle : undefined;

  return (
    <View>
      <Canvas aspect={0.8}>
        {({ w, h }) => {
          const P = { x: w * 0.2, y: h * 0.58 };
          const A = { x: w * 0.72, y: P.y };
          const tip = { x: A.x + FORCE * Math.cos(th * RAD), y: A.y - FORCE * Math.sin(th * RAD) };
          const perpY = A.y - FORCE * Math.sin(th * RAD);
          const alongX = A.x + FORCE * Math.cos(th * RAD);
          // The turn: counterclockwise for F⊥ up (always, θ from 0° to 180°), sweep ∝ sin θ.
          const sweep = 1.5 * Math.PI * Math.sin(th * RAD);
          const tauLabel = onCircle(P.x, P.y, 44, Math.PI / 2 + 0.2);
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Metal id={ids.metal} light={c.metal} dark={c.metalDark} />
                  <Metal id={ids.nut} light={c.metal} dark={c.metalDark} />
                  <TopLight id={ids.light} />
                </Defs>
                <G opacity={all(spec.arm, spec.force, spec.angle) ? 1 : 0.45}>
                  {door ? doorBody(P, A, w) : wrenchBody(P, A, w)}
                  {/* The lever arm, pivot to where F pushes. */}
                  <Line x1={P.x} y1={P.y + 40} x2={A.x} y2={A.y + 40} stroke={c.chartMuted} />
                  <Line x1={P.x} y1={P.y + 34} x2={P.x} y2={P.y + 46} stroke={c.chartMuted} />
                  <Line x1={A.x} y1={A.y + 34} x2={A.x} y2={A.y + 46} stroke={c.chartMuted} />
                  <SubLabel
                    x={(P.x + A.x) / 2}
                    y={P.y + 60}
                    text={`r = ${text(spec.arm, r, uR)}`}
                    w={w}
                  />
                  {/* F's parts: along the arm, and across it (the part that turns). */}
                  {Math.abs(along) > 1e-9 && th > 0.5 && th < 179.5 ? (
                    <Line
                      x1={A.x}
                      y1={A.y}
                      x2={alongX}
                      y2={A.y}
                      stroke={c.chartMuted}
                      strokeWidth={2}
                      strokeDasharray="5 4"
                    />
                  ) : null}
                  {th > 0.5 && th < 179.5 ? (
                    <Line
                      x1={alongX}
                      y1={A.y}
                      x2={tip.x}
                      y2={tip.y}
                      stroke={c.chartGrid}
                      strokeDasharray="2 3"
                    />
                  ) : null}
                  <Vec
                    x1={A.x}
                    y1={A.y}
                    x2={A.x}
                    y2={perpY}
                    color={c.forceApplied}
                    dash="6 4"
                    width={2.5}
                  />
                  {across > 1e-9 ? (
                    <SubLabel
                      x={A.x + (th > 90 ? 8 : -8)}
                      y={(A.y + perpY) / 2 + 4}
                      text={`F⊥ = ${text(spec.across, across, uF)}`}
                      anchor={th > 90 ? 'start' : 'end'}
                      color={c.forceApplied}
                      w={w}
                    />
                  ) : null}
                  {/* The angle between the arm and F. */}
                  {th > 1 ? (
                    <Path
                      d={`M ${A.x + 24} ${A.y} A 24 24 0 0 0 ${A.x + 24 * Math.cos(th * RAD)} ${A.y - 24 * Math.sin(th * RAD)}`}
                      stroke={c.chartInk}
                      fill="none"
                    />
                  ) : null}
                  <SubLabel
                    x={A.x + 34 * Math.cos((th / 2) * RAD) + 4}
                    y={A.y - 34 * Math.sin((th / 2) * RAD) + (th < 30 ? 14 : 4)}
                    text={`θ = ${text(spec.angle, th, '°')}`}
                    anchor="start"
                    size={chart.label}
                    w={w}
                  />
                  <Vec x1={A.x} y1={A.y} x2={tip.x} y2={tip.y} color={c.forceNet} width={4} />
                  <SubLabel
                    x={tip.x + (th > 100 ? -6 : 6)}
                    y={tip.y - 8}
                    text={`F = ${text(spec.force, F, uF)}`}
                    anchor={th > 100 ? 'end' : 'start'}
                    color={c.forceNet}
                    w={w}
                  />
                  {/* The turn it gives about the pivot. */}
                  <CurvedArrow
                    cx={P.x}
                    cy={P.y}
                    r={34}
                    from={-0.55 * Math.PI}
                    to={-0.55 * Math.PI + sweep}
                    color={c.physWork}
                  />
                  <SubLabel
                    x={Math.max(8, tauLabel.x - 4)}
                    y={tauLabel.y - 10}
                    text={`τ = ${text(spec.torque, tau, uT)}`}
                    anchor="start"
                    color={c.physWork}
                    w={w}
                  />
                </G>
              </Svg>
              {!spec.fixed && angleId && known(angleId) ? (
                <DragHandle
                  testID="drag-angle"
                  x={tip.x}
                  y={tip.y}
                  label={rep.variable(angleId).name}
                  onStart={() => {
                    start.current = { x: tip.x, y: tip.y };
                  }}
                  onMove={(dx, dy) => {
                    const x = start.current.x + dx - A.x;
                    const y = A.y - (start.current.y + dy);
                    const deg = Math.max(0, Math.min(180, Math.atan2(Math.max(0, y), x) / RAD));
                    calc.set(
                      {
                        ...rep.pin(
                          [spec.arm, spec.force].filter((s): s is string => typeof s === 'string'),
                        ),
                        [angleId]: rep.snapTo(angleId, deg),
                      },
                      rep.slide(angleId),
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
          `F⊥ = F sin θ = ${num(F)} × sin ${num(th)}° = ${num(across)} ${uF}`,
          `τ = rF⊥ = ${num(r)} × ${num(across)} = ${num(tau)} ${uT}`,
          th < 0.5 || th > 179.5
            ? 'Pushed straight along the arm, the force only pulls on the pivot: no turn.'
            : 'Only the part of F across the arm turns it; the part along the arm pulls on the pivot.',
        ].join(' · ')}
      </Caption>
    </View>
  );

  function wrenchBody(P: { x: number; y: number }, A: { x: number; y: number }, w: number) {
    const end = Math.min(w - 10, A.x + 26);
    const hex = Array.from({ length: 6 }, (_, i) => {
      const a = (i * Math.PI) / 3 + Math.PI / 6;
      return `${P.x + 13 * Math.cos(a)},${P.y + 13 * Math.sin(a)}`;
    }).join(' ');
    return (
      <G>
        {/* The handle, then the open jaw round the nut. */}
        <Rect
          x={P.x + 14}
          y={P.y - 8}
          width={end - P.x - 14}
          height={16}
          rx={8}
          fill={url(ids.metal)}
          stroke={c.metalDark}
        />
        <Circle cx={P.x} cy={P.y} r={24} fill={url(ids.metal)} stroke={c.metalDark} />
        <Path
          d={`M ${P.x - 26} ${P.y - 10} L ${P.x - 8} ${P.y - 10} L ${P.x - 8} ${P.y + 10} L ${P.x - 26} ${P.y + 10} Z`}
          fill={c.card}
        />
        <Polygon points={hex} fill={url(ids.nut)} stroke={c.metalDark} strokeWidth={1.5} />
        <Circle cx={P.x} cy={P.y} r={5} fill={c.metalDark} />
        {/* A grip where the hand pushes. */}
        <Rect
          x={A.x - 18}
          y={A.y - 10}
          width={Math.min(36, end - A.x + 18)}
          height={20}
          rx={9}
          fill={c.rubber}
        />
        <Rect
          x={A.x - 18}
          y={A.y - 10}
          width={Math.min(36, end - A.x + 18)}
          height={20}
          rx={9}
          fill={url(ids.light)}
        />
      </G>
    );
  }

  function doorBody(P: { x: number; y: number }, A: { x: number; y: number }, w: number) {
    const end = Math.min(w - 10, A.x + 30);
    return (
      <G>
        {/* The wall the door hangs on, the door from above, and its hinge. */}
        <Rect x={4} y={P.y - 9} width={P.x - 14} height={18} fill={c.chartSurface} />
        <Line x1={4} y1={P.y - 9} x2={P.x - 10} y2={P.y - 9} stroke={c.chartInk} />
        <Line x1={4} y1={P.y + 9} x2={P.x - 10} y2={P.y + 9} stroke={c.chartInk} />
        <Rect
          x={P.x}
          y={P.y - 7}
          width={end - P.x}
          height={14}
          rx={2}
          fill={c.wood}
          stroke={c.woodDark}
        />
        <Rect x={P.x} y={P.y - 7} width={end - P.x} height={14} rx={2} fill={url(ids.light)} />
        <Circle cx={P.x} cy={P.y} r={9} fill={url(ids.nut)} stroke={c.metalDark} />
        <Circle cx={P.x} cy={P.y} r={3} fill={c.metalDark} />
        <Circle cx={A.x} cy={A.y - 12} r={5} fill={url(ids.nut)} stroke={c.metalDark} />
      </G>
    );
  }
}
