import { StyleSheet, View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'rectilinear' }>;

/**
 * A shape made of two rectangles standing side by side on the same base (an L or a step),
 * covered in unit squares. Each rectangle's area is written inside it.
 */
export function Rectilinear({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const [lw, lh, rw, rh] = [spec.left.width, spec.left.height, spec.right.width, spec.right.height];
  const size = (id: string) => (rep.known(id) ? Math.max(0, Math.round(rep.shown(id))) : 0);
  const [a, b, cc, d] = [size(lw), size(lh), size(rw), size(rh)];
  const across = Math.max(spec.extent, a + cc);
  const tall = Math.max(spec.extent / 2, b, d);

  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.9, (tall * ((w - 80) / across) + 70) / w)}>
        {({ w, h }) => {
          const left = 44;
          const unit = Math.min((w - left - 36) / across, (h - 60) / tall);
          const base = 16 + tall * unit;
          const part = (x: number, cols: number, rows: number, fill: string, key: string) => [
            <Rect
              key={`${key}r`}
              x={x}
              y={base - rows * unit}
              width={cols * unit}
              height={rows * unit}
              fill={fill}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />,
            ...Array.from({ length: Math.max(0, cols - 1) }, (_, i) => (
              <Line
                key={`${key}x${i}`}
                x1={x + (i + 1) * unit}
                y1={base - rows * unit}
                x2={x + (i + 1) * unit}
                y2={base}
                stroke={c.chartGrid}
              />
            )),
            ...Array.from({ length: Math.max(0, rows - 1) }, (_, i) => (
              <Line
                key={`${key}y${i}`}
                x1={x}
                y1={base - (i + 1) * unit}
                x2={x + cols * unit}
                y2={base - (i + 1) * unit}
                stroke={c.chartGrid}
              />
            )),
          ];
          const x2 = left + a * unit;
          return (
            <Svg width={w} height={h}>
              {part(left, a, b, c.chartFill, 'l')}
              {part(x2, cc, d, c.chartSurface, 'r')}
              {a > 0 && b > 0 ? (
                <ChartText
                  x={left + (a * unit) / 2}
                  y={base - (b * unit) / 2 + 5}
                  fontSize={chart.emphasis}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {rep.value(spec.left.area, false)}
                </ChartText>
              ) : null}
              {cc > 0 && d > 0 ? (
                <ChartText
                  x={x2 + (cc * unit) / 2}
                  y={base - (d * unit) / 2 + 5}
                  fontSize={chart.emphasis}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {rep.value(spec.right.area, false)}
                </ChartText>
              ) : null}
              <ChartText
                x={left + (a * unit) / 2}
                y={base + 20}
                fontSize={chart.value}
                textAnchor="middle"
              >
                {rep.value(lw)}
              </ChartText>
              <ChartText
                x={x2 + (cc * unit) / 2}
                y={base + 20}
                fontSize={chart.value}
                textAnchor="middle"
              >
                {rep.value(rw)}
              </ChartText>
              <ChartText
                x={left - 8}
                y={base - (b * unit) / 2 + 5}
                fontSize={chart.value}
                textAnchor="end"
              >
                {rep.value(lh)}
              </ChartText>
              <ChartText
                x={x2 + cc * unit + 8}
                y={base - (d * unit) / 2 + 5}
                fontSize={chart.value}
              >
                {rep.value(rh)}
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Text style={[styles.caption, { color: c.text }]}>
        {`${rep.value(spec.left.area, false)} + ${rep.value(spec.right.area, false)} = ${rep.value(spec.total)}`}
      </Text>
      <Steppers
        calc={calc}
        items={[lw, lh, rw, rh].map((id) => ({
          var: id,
          steps: [1],
          pin: [lw, lh, rw, rh].filter((x) => x !== id),
        }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  caption: {
    fontSize: font.body,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: space.sm,
    paddingHorizontal: space.lg,
  },
});
