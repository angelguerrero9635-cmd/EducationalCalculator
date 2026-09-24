import { StyleSheet, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'patternBlocks' }>;

/**
 * A hexagon made of pattern blocks. The hexagon is 6 triangle slices around its center; a
 * trapezoid covers 3 slices in a row, a rhombus 2, a triangle 1. Blocks are placed around the
 * hexagon in that order; slices left empty are dashed.
 */
export function PatternBlocks({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const n = (id: string) => (rep.known(id) ? Math.max(0, Math.round(rep.shown(id))) : 0);
  const blocks = [
    ...Array<number>(n(spec.trapezoids)).fill(3),
    ...Array<number>(n(spec.rhombuses)).fill(2),
    ...Array<number>(n(spec.triangles)).fill(1),
  ];
  const fills: Record<number, string> = { 3: c.chartHighlight, 2: c.chartFill, 1: c.chartSurface };
  const ids = [spec.trapezoids, spec.rhombuses, spec.triangles];

  return (
    <View>
      <Canvas aspect={0.7}>
        {({ w, h }) => {
          const r = Math.min(w, h) / 2 - 12;
          const cx = w / 2;
          const cy = h / 2;
          const v = (i: number) => {
            const t = (Math.PI / 3) * i - Math.PI / 2;
            return `${cx + r * Math.cos(t)},${cy + r * Math.sin(t)}`;
          };
          let at = 0;
          const shapes = blocks.map((k, j) => {
            const pts = [`${cx},${cy}`, ...Array.from({ length: k + 1 }, (_, i) => v(at + i))];
            at += k;
            // Past the whole hexagon: too many blocks (drawn faded, the formulas say why).
            const over = at > 6;
            return (
              <Polygon
                key={j}
                points={pts.join(' ')}
                fill={fills[k]}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
                opacity={over ? 0.3 : 1}
              />
            );
          });
          const empty = Array.from({ length: Math.max(0, 6 - at) }, (_, i) => (
            <Polygon
              key={`e${i}`}
              points={[`${cx},${cy}`, v(at + i), v(at + i + 1)].join(' ')}
              fill="none"
              stroke={c.chartGrid}
              strokeDasharray={chart.dash}
            />
          ));
          return (
            <Svg width={w} height={h}>
              {empty}
              {shapes}
            </Svg>
          );
        }}
      </Canvas>
      <Text style={[styles.caption, { color: c.text }]}>
        {ids.map((id) => `${rep.variable(id).name}: ${rep.label(id)}`).join('   ·   ')}
      </Text>
      <Steppers
        calc={calc}
        items={ids.map((id) => ({ var: id, steps: [1], pin: ids.filter((x) => x !== id) }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  caption: { fontSize: font.body, fontWeight: '600', textAlign: 'center', marginTop: space.sm },
});
