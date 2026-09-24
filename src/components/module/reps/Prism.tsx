import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'prism' }>;

const NAMES: Record<number, string> = {
  3: 'triangular prism',
  4: 'cube',
  5: 'pentagonal prism',
  6: 'hexagonal prism',
};

/**
 * A prism seen from slightly above: two copies of the base joined by straight edges. Corners
 * are dotted; hidden edges are dashed. − / + change the sides of the base.
 */
export function Prism({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const n = Math.max(3, Math.round(rep.shown(spec.sides)));

  return (
    <View>
      <Canvas aspect={0.7}>
        {({ w, h }) => {
          const rx = Math.min(w * 0.3, 120);
          const ry = rx * 0.4;
          const height = n === 4 ? rx * 1.25 : h * 0.45;
          const cx = w / 2;
          const topY = (h - height) / 2;
          const base = (y: number) =>
            Array.from({ length: n }, (_, i) => {
              // Turned a little, so no edge points straight at the viewer (looks solid).
              const t = (2 * Math.PI * i) / n + Math.PI / 2 + 0.45;
              return {
                x: cx + rx * Math.cos(t),
                y: y + ry * Math.sin(t),
                back: Math.sin(t) < -1e-9,
              };
            });
          const top = base(topY);
          const bottom = base(topY + height);
          const ink = { stroke: c.chartInk, strokeWidth: chart.stroke };
          return (
            <Svg width={w} height={h} opacity={rep.known(spec.sides) ? 1 : 0.35}>
              <Polygon
                points={top.map((p) => `${p.x},${p.y}`).join(' ')}
                fill={c.chartFill}
                {...ink}
              />
              {bottom.map((p, i) => {
                const q = bottom[(i + 1) % n]!;
                return (
                  <Line
                    key={`b${i}`}
                    x1={p.x}
                    y1={p.y}
                    x2={q.x}
                    y2={q.y}
                    {...ink}
                    strokeDasharray={p.back || q.back ? chart.dash : undefined}
                  />
                );
              })}
              {top.map((p, i) => (
                <Line
                  key={`s${i}`}
                  x1={p.x}
                  y1={p.y}
                  x2={bottom[i]!.x}
                  y2={bottom[i]!.y}
                  {...ink}
                  strokeDasharray={p.back ? chart.dash : undefined}
                />
              ))}
              {[...top, ...bottom].map((p, i) => (
                <Circle key={`v${i}`} cx={p.x} cy={p.y} r={4.5} fill={c.chartHighlight} />
              ))}
            </Svg>
          );
        }}
      </Canvas>
      <Text style={[styles.caption, { color: c.text }]}>
        {`A ${NAMES[n] ?? `prism with a ${n}-sided base`}: ${rep.label(spec.faces)} faces, ${rep.label(spec.edges)} edges, ${rep.label(spec.corners)} corners`}
      </Text>
      <Steppers calc={calc} items={[{ var: spec.sides, steps: [1], pin: [] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  caption: { fontSize: font.body, fontWeight: '600', textAlign: 'center', marginTop: space.sm },
});
