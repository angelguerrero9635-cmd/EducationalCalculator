import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Polygon } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, useRep } from './common';
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
  const c = usePalette();
  const rep = useRep(calc);
  const n = Math.max(3, Math.round(rep.shown(spec.sides)));
  const name = NAMES[n] ?? `${n}-sided shape`;

  return (
    <View>
      <Canvas aspect={0.7}>
        {({ w, h }) => {
          const r = Math.min(w, h) / 2 - 20;
          const cx = w / 2;
          const cy = h / 2 + 6;
          const pts = Array.from({ length: n }, (_, i) => {
            const t = -Math.PI / 2 + (Math.PI * 2 * i) / n + (n % 2 === 0 ? Math.PI / n : 0);
            return [cx + r * Math.cos(t), cy + r * Math.sin(t)] as const;
          });
          return (
            <Svg width={w} height={h} opacity={rep.known(spec.sides) ? 1 : 0.35}>
              <Polygon
                points={pts.map((p) => p.join(',')).join(' ')}
                fill={c.chartFill}
                stroke={c.chartInk}
                strokeWidth={chart.strokeHeavy}
              />
              {pts.map(([x, y], i) => (
                <Circle key={i} cx={x} cy={y} r={6} fill={c.chartHighlight} />
              ))}
            </Svg>
          );
        }}
      </Canvas>
      <Text
        style={[styles.name, { color: c.text }]}
      >{`A ${name}: ${rep.variable(spec.sides).symbol} = ${n} sides, ${n} corners`}</Text>
      <Steppers calc={calc} items={[{ var: spec.sides, steps: [1], pin: [] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: font.body, fontWeight: '600', textAlign: 'center', marginTop: space.sm },
});
