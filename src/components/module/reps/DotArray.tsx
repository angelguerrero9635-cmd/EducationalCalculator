import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'array' }>;

/** A rectangular array of dots: equal rows and equal columns. Drag the corner to resize. */
export function DotArray({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef({ r: 0, c: 0 });
  const rows = Math.max(0, Math.round(rep.shown(spec.rows)));
  const cols = Math.max(0, Math.round(rep.shown(spec.columns)));
  const sums = Array.from({ length: rows }, () => cols).join(' + ');
  // Break apart a factor: the first `first` columns, then the rest.
  const split = spec.split;
  const firstCols = split ? Math.min(cols, Math.max(0, Math.round(rep.shown(split.first)))) : cols;
  const sym = (id: string) => rep.variable(id).symbol;

  /** One array of `r` rows and `k` columns at (x0, y0), shaded by part. */
  const grid = (key: string, r: number, k: number, x0: number, y0: number, cell: number) =>
    Array.from({ length: r * k }, (_, i) => {
      const col = i % k;
      const second = split && col >= firstCols;
      return spec.cell === 'square' ? (
        <Rect
          key={`${key}${i}`}
          x={x0 + col * cell}
          y={y0 + Math.floor(i / k) * cell}
          width={cell}
          height={cell}
          fill={second ? c.chartSurface : c.chartFill}
          stroke={c.chartInk}
          strokeWidth={chart.strokeLight}
        />
      ) : (
        <Circle
          key={`${key}${i}`}
          cx={x0 + col * cell + cell / 2}
          cy={y0 + Math.floor(i / k) * cell + cell / 2}
          r={cell * 0.3}
          fill={second ? c.chartSurface : c.chartHighlight}
          stroke={c.chartInk}
          strokeWidth={chart.strokeLight}
        />
      );
    });

  const caption = rep.early
    ? `${rows} rows of ${cols}: ${sums || '0'} = ${rep.value(spec.total, false)}`
    : split
      ? `${rows} × ${cols} = ${rows} × ${firstCols} + ${rows} × ${cols - firstCols} = ${rows * firstCols} + ${rows * (cols - firstCols)} = ${rows * cols}`
      : spec.turned
        ? `${rows} rows of ${cols} = ${cols} rows of ${rows}: ${rows} × ${cols} = ${cols} × ${rows} = ${rows * cols}`
        : `${sym(spec.rows)} = ${rows} rows of ${sym(spec.columns)} = ${cols}: ${sums || '0'} = ${rep.label(spec.total, false)}`;

  return (
    <View>
      <Canvas aspect={spec.turned ? 0.47 : split ? 0.9 : 0.8}>
        {({ w, h }) => {
          // Turned: the array and its quarter turn side by side.
          const room = spec.turned ? (w - 60) / 2 : w - 40;
          const below = split ? 44 : 0;
          const cell = Math.min(room / spec.max, (h - 20 - below) / spec.max);
          const x0 = spec.turned ? 20 : (w - cell * spec.max) / 2;
          const y0 = 10;
          const x1 = x0 + cell * spec.max + 20;
          const divider = x0 + firstCols * cell;
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
                {grid('a', rows, cols, x0, y0, cell)}
                {spec.turned ? grid('t', cols, rows, x1, y0, cell) : null}
                {split && firstCols > 0 && firstCols < cols ? (
                  <Line
                    x1={divider}
                    y1={y0 - 4}
                    x2={divider}
                    y2={y0 + rows * cell + 4}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeHeavy}
                  />
                ) : null}
                {split ? (
                  <>
                    <ChartText
                      x={x0 + (firstCols * cell) / 2}
                      y={y0 + rows * cell + 22}
                      fontSize={chart.small}
                      textAnchor="middle"
                    >
                      {`${rows} × ${firstCols} = ${rows * firstCols}`}
                    </ChartText>
                    {cols > firstCols ? (
                      <ChartText
                        x={divider + ((cols - firstCols) * cell) / 2}
                        y={y0 + rows * cell + 40}
                        fontSize={chart.small}
                        textAnchor="middle"
                      >
                        {`${rows} × ${cols - firstCols} = ${rows * (cols - firstCols)}`}
                      </ChartText>
                    ) : null}
                  </>
                ) : null}
              </Svg>
              <DragHandle
                testID="drag-corner"
                x={x0 + cols * cell}
                y={y0 + rows * cell}
                label={`${rep.variable(spec.rows).name} and ${rep.variable(spec.columns).name}`}
                onStart={() => (start.current = { r: rows, c: cols })}
                onMove={(dx, dy) =>
                  calc.set({
                    ...(split ? rep.pin([split.first]) : {}),
                    [spec.rows]: rep.snapTo(spec.rows, start.current.r + dy / cell),
                    [spec.columns]: rep.snapTo(spec.columns, start.current.c + dx / cell),
                  })
                }
              />
            </>
          );
        }}
      </Canvas>
      <Text style={[styles.caption, { color: c.text }]}>{caption}</Text>
      {split ? (
        <Steppers
          calc={calc}
          items={[
            { var: split.first, steps: [1], pin: [spec.rows, spec.columns] },
            { var: spec.rows, steps: [1], pin: [spec.columns, split.first] },
          ]}
        />
      ) : null}
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
