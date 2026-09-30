import { View } from 'react-native';
import Svg, { Defs, G, Line, Polygon, Rect } from 'react-native-svg';

import type { SimpleMachineSpec } from '@/data/modules/typesHsk';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { num } from './CircularSatellite';
import { CurvedArrow, useReader } from './hs3aKit';
import { SubLabel, Vec } from './hskKit';
import { Crate, Metal, TopLight, url, usePaintIds } from './paint';

/** The longest force arrow (the pivot's push, the sum of both weights), px. */
const LONGEST = 84;

/**
 * `simpleMachine` lever option `seesaw` (H107): a plank balanced on its pivot with a weight on
 * each side, F₁ at d₁ and F₂ at d₂ to scale; the weights pressing down and the pivot pushing
 * up F_p = F₁ + F₂, all on one scale; the two torques as curved arrows, F₁d₁ one way and F₂d₂
 * the other, equal when it balances.
 */
export function Seesaw({ spec, calc }: { spec: SimpleMachineSpec; calc: Calculator }) {
  const c = usePalette();
  const { v, all, text, unit } = useReader(calc);
  const ids = usePaintIds('light', 'metal');
  const o = spec.seesaw ?? {};
  const F1 = Math.max(0, v(spec.load));
  const d1 = Math.max(0, v(spec.loadArm, 1));
  const d2 = Math.max(0, v(spec.effortArm, 1));
  // F₂ as the page names it, or the weight that balances.
  const F2 = Math.max(0, spec.effort ? v(spec.effort) : d2 > 0 ? (F1 * d1) / d2 : 0);
  const [t1, t2] = [F1 * d1, F2 * d2];
  const Fp = F1 + F2;
  const [uF, uD] = [unit(spec.load, 'N'), unit(spec.loadArm, 'm')];
  const uT = unit(o.torque, 'N·m');
  const px = (F: number) => (LONGEST * F) / Math.max(1e-12, Fp);
  const balanced = Math.abs(t1 - t2) <= 1e-6 * Math.max(1, t1, t2);

  return (
    <View>
      <Canvas aspect={0.86}>
        {({ w, h }) => {
          const cx = w / 2;
          const beamY = h * 0.4;
          const reach = Math.max(1e-9, d1, d2);
          const sx = (w * 0.4) / reach;
          const x1 = cx - d1 * sx;
          const x2 = cx + d2 * sx;
          const half = reach * sx + 22;
          const size = (F: number) => 24 + 22 * Math.sqrt(F / Math.max(1e-12, F1, F2));
          const [s1, s2] = [size(F1), size(F2)];
          const R = Math.max(26, Math.min(64, 0.55 * Math.min(d1, d2) * sx));
          const dimY = beamY + LONGEST + 34;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <TopLight id={ids.light} />
                <Metal id={ids.metal} light={c.metal} dark={c.metalDark} />
              </Defs>
              <G opacity={all(spec.load, spec.loadArm, spec.effortArm, spec.effort) ? 1 : 0.45}>
                {/* The two torques, round the pivot: F₁d₁ turns it one way, F₂d₂ the other. */}
                <CurvedArrow
                  cx={cx}
                  cy={beamY}
                  r={R}
                  from={Math.PI * 0.62}
                  to={Math.PI * 1.08}
                  color={c.physCartA}
                  width={2.5}
                />
                <CurvedArrow
                  cx={cx}
                  cy={beamY}
                  r={R}
                  from={Math.PI * 0.38}
                  to={-Math.PI * 0.08}
                  color={c.physCartB}
                  width={2.5}
                />
                {/* The pivot and the plank. */}
                <Polygon
                  points={`${cx},${beamY + 5} ${cx - 22},${beamY + 46} ${cx + 22},${beamY + 46}`}
                  fill={url(ids.metal)}
                  stroke={c.metalDark}
                />
                <Rect
                  x={cx - 34}
                  y={beamY + 46}
                  width={68}
                  height={8}
                  rx={2}
                  fill={c.chartSurface}
                  stroke={c.chartMuted}
                />
                <Rect
                  x={cx - half}
                  y={beamY - 4}
                  width={2 * half}
                  height={9}
                  rx={2}
                  fill={c.wood}
                  stroke={c.woodDark}
                />
                <Rect
                  x={cx - half}
                  y={beamY - 4}
                  width={2 * half}
                  height={9}
                  rx={2}
                  fill={url(ids.light)}
                />
                {/* The weights, sized by how heavy they are, and their pushes on the plank. */}
                <Crate x={x1 - s1 / 2} y={beamY - 4 - s1} size={s1} lightId={ids.light} />
                <Crate x={x2 - s2 / 2} y={beamY - 4 - s2} size={s2} lightId={ids.light} />
                <SubLabel
                  x={x1}
                  y={beamY - s1 - 14}
                  text={`F_1 = ${text(spec.load, F1, uF)}`}
                  color={c.forceWeight}
                  w={w}
                />
                <SubLabel
                  x={x2}
                  y={beamY - s2 - 14}
                  text={`F_2 = ${text(spec.effort, F2, uF)}`}
                  color={c.forceWeight}
                  w={w}
                />
                <Vec x1={x1} y1={beamY + 6} x2={x1} y2={beamY + 6 + px(F1)} color={c.forceWeight} />
                <Vec x1={x2} y1={beamY + 6} x2={x2} y2={beamY + 6 + px(F2)} color={c.forceWeight} />
                {/* The pivot pushes up as hard as both weights push down. */}
                <Vec
                  x1={cx}
                  y1={beamY + 8 + LONGEST}
                  x2={cx}
                  y2={beamY + 8}
                  color={c.forceNormal}
                  width={4}
                />
                <SubLabel
                  x={cx + 10}
                  y={beamY + LONGEST - 4}
                  text={`F_p = ${text(o.pivot, Fp, uF)}`}
                  anchor="start"
                  color={c.forceNormal}
                  w={w}
                />
                {/* The distances from the pivot. */}
                {[
                  [x1, cx, `d_1 = ${text(spec.loadArm, d1, uD)}`],
                  [cx, x2, `d_2 = ${text(spec.effortArm, d2, uD)}`],
                ].map(([a, b, t]) => (
                  <G key={t as string}>
                    <Line
                      x1={a as number}
                      y1={dimY}
                      x2={b as number}
                      y2={dimY}
                      stroke={c.chartMuted}
                    />
                    <Line
                      x1={a as number}
                      y1={dimY - 6}
                      x2={a as number}
                      y2={dimY + 6}
                      stroke={c.chartMuted}
                    />
                    <Line
                      x1={b as number}
                      y1={dimY - 6}
                      x2={b as number}
                      y2={dimY + 6}
                      stroke={c.chartMuted}
                    />
                    <SubLabel
                      x={((a as number) + (b as number)) / 2}
                      y={dimY + 22}
                      text={t as string}
                      bold={false}
                      w={w}
                    />
                  </G>
                ))}
                {/* The torques, named. */}
                <SubLabel
                  x={8}
                  y={22}
                  text={`F₁d₁ = ${num(t1)} ${uT}`}
                  anchor="start"
                  color={c.physCartA}
                  w={w}
                />
                <SubLabel
                  x={w - 8}
                  y={22}
                  text={`F₂d₂ = ${num(t2)} ${uT}`}
                  anchor="end"
                  color={c.physCartB}
                  w={w}
                />
                <ChartText
                  x={cx}
                  y={h - 8}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fill={c.chartMuted}
                >
                  {balanced ? 'balanced: the two torques are equal' : 'not balanced'}
                </ChartText>
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          `Balanced: F₁d₁ = F₂d₂: ${num(F1)} × ${num(d1)} = ${num(F2)} × ${num(d2)} = ${num(t1)} ${uT}`,
          `Fₚ = F₁ + F₂ = ${num(F1)} + ${num(F2)} = ${num(Fp)} ${uF}`,
          'The heavier weight sits closer to the pivot; the pivot holds up both.',
        ].join(' · ')}
      </Caption>
    </View>
  );
}
