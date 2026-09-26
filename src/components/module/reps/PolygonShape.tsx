import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Polygon } from 'react-native-svg';

import { SegmentedControl } from '@/components/SegmentedControl';
import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'polygon' }>;

const NAMES: Record<number, string> = {
  3: 'triangle',
  4: 'square',
  5: 'pentagon',
  6: 'hexagon',
  7: 'heptagon',
  8: 'octagon',
};

/** A regular polygon with its corners marked; − / + change the number of sides. */
export function PolygonShape({ spec, calc }: { spec: Spec; calc: Calculator }) {
  if (spec.sideValues) return <LabeledSides spec={spec} ids={spec.sideValues} calc={calc} />;
  return <Stepped spec={spec} sides={spec.sides!} calc={calc} />;
}

/** Corners of a lopsided shape with 3–6 sides, in a 0–1 box (y down), so no two sides look equal. */
const SHAPES: Record<number, [number, number][]> = {
  3: [
    [0.1, 0.9],
    [0.95, 0.9],
    [0.35, 0.08],
  ],
  4: [
    [0.08, 0.88],
    [0.92, 0.92],
    [0.8, 0.12],
    [0.22, 0.28],
  ],
  5: [
    [0.12, 0.9],
    [0.85, 0.92],
    [0.95, 0.4],
    [0.55, 0.06],
    [0.05, 0.35],
  ],
  6: [
    [0.2, 0.92],
    [0.78, 0.9],
    [0.97, 0.5],
    [0.72, 0.08],
    [0.25, 0.12],
    [0.03, 0.52],
  ],
};

/**
 * A shape with a length on each side (not drawn to scale: the lengths are the labels). An
 * unknown side reads “?” until it is found; the perimeter is under the shape.
 */
function LabeledSides({ spec, ids, calc }: { spec: Spec; ids: string[]; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const corners = SHAPES[Math.min(6, Math.max(3, ids.length))]!;
  return (
    <View>
      <Canvas aspect={0.62}>
        {({ w, h }) => {
          const pad = 44;
          const pts = corners.map(
            ([x, y]) => [pad + x * (w - 2 * pad), 16 + y * (h - 48)] as [number, number],
          );
          const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
          const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
          return (
            <Svg width={w} height={h}>
              <Polygon
                points={pts.map((p) => p.join(',')).join(' ')}
                fill={c.chartFill}
                stroke={c.chartInk}
                strokeWidth={chart.strokeHeavy}
                strokeLinejoin="round"
              />
              {ids.map((id, i) => {
                const p = pts[i]!;
                const q = pts[(i + 1) % pts.length]!;
                const mx = (p[0] + q[0]) / 2;
                const my = (p[1] + q[1]) / 2;
                // The label sits outside the side, away from the middle of the shape.
                const ox = mx - cx;
                const oy = my - cy;
                const ol = Math.hypot(ox, oy) || 1;
                const known = rep.known(id);
                return (
                  <ChartText
                    key={id}
                    x={mx + (ox / ol) * 22}
                    y={my + (oy / ol) * 18 + 5}
                    fontSize={chart.value}
                    fontWeight={known ? '400' : '700'}
                    fill={known ? c.chartInk : c.chartHighlight}
                    textAnchor="middle"
                  >
                    {known ? rep.label(id, false) : '?'}
                  </ChartText>
                );
              })}
            </Svg>
          );
        }}
      </Canvas>
      {spec.around ? (
        <Text style={[styles.name, { color: c.text }]}>
          {`${rep.tag(spec.around)}: ${rep.known(spec.around) ? rep.value(spec.around) : '?'} all the way around`}
        </Text>
      ) : null}
    </View>
  );
}

function Stepped({ spec, sides, calc }: { spec: Spec; sides: string; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  // 0 sides is a circle (when the module allows it); otherwise at least 3.
  const raw = Math.round(rep.shown(sides));
  const n = raw === 0 && (rep.variable(sides).min ?? 3) === 0 ? 0 : Math.max(3, raw);
  const angles = spec.words === 'angle';
  // 'toggle': the student switches between an even shape and a stretched one (same name).
  const [look, setLook] = useState<'even' | 'any'>('even');
  const irregular = spec.irregular === 'toggle' ? look === 'any' : !!spec.irregular;
  const name =
    n === 0
      ? 'circle'
      : n === 4
        ? angles
          ? 'quadrilateral'
          : irregular
            ? '4-sided shape'
            : 'square or rectangle'
        : (NAMES[n] ?? `${n}-sided shape`);
  const cornerSym = spec.corners && !rep.words ? `${rep.variable(spec.corners).symbol} = ` : '';
  const sidesSym = rep.words ? '' : `${rep.variable(sides).symbol} = `;

  return (
    <View>
      {spec.irregular === 'toggle' ? (
        <View style={styles.toggle}>
          <SegmentedControl
            segments={[
              { value: 'even', label: 'Even sides' },
              { value: 'any', label: 'Stretched' },
            ]}
            value={look}
            onChange={setLook}
          />
        </View>
      ) : null}
      <Canvas aspect={0.7}>
        {({ w, h }) => {
          const r = Math.min(w, h) / 2 - 20;
          const cx = w / 2;
          const cy = h / 2 + 6;
          // Irregular shapes: each corner at its own distance and a little off its even spacing
          // (fixed offsets, so the shape doesn't jump around), still convex.
          const wobble = [0, 0.22, -0.12, 0.18, -0.2, 0.1, -0.08, 0.15];
          const reach = [1, 0.78, 0.95, 0.7, 0.9, 0.82, 1, 0.75];
          const pts = Array.from({ length: n }, (_, i) => {
            const even = -Math.PI / 2 + (Math.PI * 2 * i) / n + (n % 2 === 0 ? Math.PI / n : 0);
            const t = irregular ? even + (wobble[i % 8]! * Math.PI) / n : even;
            const rr = irregular ? r * reach[i % 8]! : r;
            return [cx + rr * Math.cos(t), cy + rr * Math.sin(t)] as const;
          });
          return (
            <Svg width={w} height={h} opacity={rep.known(sides) ? 1 : 0.35}>
              {n === 0 ? (
                // A circle has no sides and no corners (stretching it would make an oval).
                <Circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={c.chartFill}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeHeavy}
                />
              ) : (
                <Polygon
                  points={pts.map((p) => p.join(',')).join(' ')}
                  fill={c.chartFill}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeHeavy}
                />
              )}
              {pts.map(([x, y], i) => (
                <Circle key={i} cx={x} cy={y} r={6} fill={c.chartHighlight} />
              ))}
            </Svg>
          );
        }}
      </Canvas>
      <Text
        style={[styles.name, { color: c.text }]}
      >{`A ${name}: ${sidesSym}${n} sides, ${cornerSym}${n} ${angles ? 'angles' : 'corners'}${n === 0 ? '. It is round.' : ''}`}</Text>
      <Steppers calc={calc} items={[{ var: sides, steps: [1], pin: [], skip: [1, 2] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { paddingHorizontal: space.lg, marginBottom: space.sm },
  name: { fontSize: font.body, fontWeight: '600', textAlign: 'center', marginTop: space.sm },
});
