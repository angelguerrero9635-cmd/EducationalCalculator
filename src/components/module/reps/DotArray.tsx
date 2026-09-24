import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, DragHandle, useRep } from './common';

type Spec = Extract<Representation, { kind: 'array' }>;

/** A rectangular array of dots: equal rows and equal columns. Drag the corner to resize. */
export function DotArray({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef({ r: 0, c: 0 });
  const rows = Math.max(0, Math.round(rep.shown(spec.rows)));
  const cols = Math.max(0, Math.round(rep.shown(spec.columns)));
  const sums = Array.from({ length: rows }, () => cols).join(' + ');

  return (
    <View>
      <Canvas aspect={0.8}>
        {({ w, h }) => {
          const cell = Math.min((w - 40) / spec.max, (h - 20) / spec.max);
          const x0 = (w - cell * spec.max) / 2;
          const y0 = 10;
          return (
            <>
              <Svg width={w} height={h}>
                <Rect
                  x={x0}
                  y={y0}
                  width={cols * cell}
                  height={rows * cell}
                  fill={c.chartSurface}
                  stroke={c.chartGrid}
                />
                {Array.from({ length: rows * cols }, (_, i) =>
                  spec.cell === 'square' ? (
                    <Rect
                      key={i}
                      x={x0 + (i % cols) * cell}
                      y={y0 + Math.floor(i / cols) * cell}
                      width={cell}
                      height={cell}
                      fill={c.chartFill}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                  ) : (
                    <Circle
                      key={i}
                      cx={x0 + (i % cols) * cell + cell / 2}
                      cy={y0 + Math.floor(i / cols) * cell + cell / 2}
                      r={cell * 0.3}
                      fill={c.chartHighlight}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                  ),
                )}
              </Svg>
              <DragHandle
                testID="drag-corner"
                x={x0 + cols * cell}
                y={y0 + rows * cell}
                label={`${rep.variable(spec.rows).name} and ${rep.variable(spec.columns).name}`}
                onStart={() => (start.current = { r: rows, c: cols })}
                onMove={(dx, dy) =>
                  calc.set({
                    [spec.rows]: rep.snapTo(spec.rows, start.current.r + dy / cell),
                    [spec.columns]: rep.snapTo(spec.columns, start.current.c + dx / cell),
                  })
                }
              />
            </>
          );
        }}
      </Canvas>
      <Text style={[styles.caption, { color: c.text }]}>
        {`${rep.variable(spec.rows).symbol} = ${rows} rows of ${rep.variable(spec.columns).symbol} = ${cols}: ${sums || '0'} = ${rep.label(spec.total, false)}`}
      </Text>
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
