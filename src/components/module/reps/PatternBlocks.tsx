import { StyleSheet, View } from 'react-native';
import Svg, { G, Polygon } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, nowrap, useRep } from './common';
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
  // Trapezoids solid, rhombuses shaded, triangles open; after Grade 2 each block also shows its letter.
  const fills: Record<number, string> = { 3: c.chartHighlight, 2: c.chartFill, 1: 'transparent' };
  // K–2 blocks carry no letters: the fill shows the kind of block.
  const letters: Record<number, string> = rep.early
    ? { 3: '', 2: '', 1: '' }
    : {
        3: rep.variable(spec.trapezoids).symbol,
        2: rep.variable(spec.rhombuses).symbol,
        1: rep.variable(spec.triangles).symbol,
      };
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
            // The label sits in the middle of the block's slices, 55% of the way out.
            const mid = (Math.PI / 3) * (at + k / 2) - Math.PI / 2;
            const lx = cx + r * 0.55 * Math.cos(mid);
            const ly = cy + r * 0.55 * Math.sin(mid);
            at += k;
            // Past the whole hexagon: too many blocks (drawn faded, the formulas say why).
            const over = at > 6;
            return (
              <G key={j} opacity={over ? 0.3 : 1}>
                <Polygon
                  points={pts.join(' ')}
                  fill={fills[k]}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                <ChartText
                  x={lx}
                  y={ly + 6}
                  fontSize={chart.value}
                  fontWeight="700"
                  textAnchor="middle"
                  fill={k === 3 ? c.onChartHighlight : c.chartInk}
                >
                  {letters[k]}
                </ChartText>
              </G>
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
        {ids.map((id) => nowrap(`${rep.variable(id).name}: ${rep.label(id)}`)).join('   ·   ')}
      </Text>
      <Steppers
        calc={calc}
        // Changing a block lets the triangles take up the difference (the hexagon stays full);
        // changing the triangles lets the trapezoids stay and the rhombuses change.
        items={[
          { var: spec.trapezoids, steps: [1], pin: [spec.rhombuses] },
          { var: spec.rhombuses, steps: [1], pin: [spec.trapezoids] },
          { var: spec.triangles, steps: [1], pin: [spec.trapezoids] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  caption: { fontSize: font.body, fontWeight: '600', textAlign: 'center', marginTop: space.sm },
});
