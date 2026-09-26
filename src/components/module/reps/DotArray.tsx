import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, useRep, Caption } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'array' }>;

/** A rectangular array of dots: equal rows and equal columns. Drag the corner to resize. */
export function DotArray({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef({ r: 0, c: 0 });
  const rows = Math.max(0, Math.round(rep.shown(spec.rows)));
  const cols = Math.max(0, Math.round(rep.shown(spec.columns)));
  // A factor past `max` (1 × 97) is drawn cut off at `max` dots; the caption says so.
  const dr = Math.min(spec.max, rows);
  const dc = Math.min(spec.max, cols);
  const cut = rows > spec.max || cols > spec.max;
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

  // A "?" factor draws one row or column, but the caption says "?" rather than counting it.
  const known = rep.known(spec.rows) && rep.known(spec.columns);
  const rv = rep.value(spec.rows, false);
  const cv = rep.value(spec.columns, false);
  const caption = !known
    ? rep.early
      ? `${rv} rows of ${cv}: ${rep.value(spec.total, false)}`
      : rep.words
        ? `${rv} rows of ${cv}: ${rv} × ${cv} = ${rep.value(spec.total, false)}`
        : `${sym(spec.rows)} = ${rv} rows of ${sym(spec.columns)} = ${cv}: ${rv} × ${cv} = ${rep.label(spec.total, false)}`
    : rep.early
      ? `${rows} rows of ${cols}: ${sums || '0'} = ${rep.value(spec.total, false)}`
      : split
        ? `${rows} × ${cols} = ${rows} × ${firstCols} + ${rows} × ${cols - firstCols} = ${rows * firstCols} + ${rows * (cols - firstCols)} = ${rows * cols}`
        : spec.turned
          ? `${rows} rows of ${cols} = ${cols} rows of ${rows}: ${rows} × ${cols} = ${cols} × ${rows} = ${rows * cols}`
          : rep.words
            ? `${rows} rows of ${cols}: ${rows} × ${cols} = ${rep.value(spec.total, false)}`
            : `${sym(spec.rows)} = ${rows} rows of ${sym(spec.columns)} = ${cols}: ${sums || '0'} = ${rep.label(spec.total, false)}`;

  /**
   * Cell size from the width; the height fits the rows drawn (at least 6, and one spare row to
   * drag into), so a small array doesn't sit in a big empty square. The two split labels go
   * on one line unless they would touch.
   */
  const layout = (w: number) => {
    const room = spec.turned ? (w - 60) / 2 : w - 40;
    const cell = Math.min(room / spec.max, 40);
    const shownRows = Math.min(spec.max, Math.max(6, dr + 1, spec.turned ? dc + 1 : 0));
    const labelWidth = (text: string) => text.length * chart.small * 0.6;
    const left = `${rows} × ${firstCols} = ${rows * firstCols}`;
    const right = `${rows} × ${cols - firstCols} = ${rows * (cols - firstCols)}`;
    const gap = (cols * cell) / 2 - (labelWidth(left) + labelWidth(right)) / 2;
    const stagger = !!split && gap < 8;
    const below = split ? (stagger ? 48 : 30) : 0;
    return { cell, below, stagger, height: 20 + shownRows * cell + below };
  };

  return (
    <View>
      <Canvas aspect={(w) => layout(w).height / w}>
        {({ w, h }) => {
          const { cell, stagger } = layout(w);
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
                  width={dc * cell}
                  height={dr * cell}
                  fill={c.chartSurface}
                  stroke={c.chartGrid}
                />
                {grid('a', dr, dc, x0, y0, cell)}
                {spec.turned ? grid('t', dc, dr, x1, y0, cell) : null}
                {split && firstCols > 0 && firstCols < cols ? (
                  <Line
                    x1={divider}
                    y1={y0 - 4}
                    x2={divider}
                    y2={y0 + dr * cell + 4}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeHeavy}
                  />
                ) : null}
                {split ? (
                  <>
                    <ChartText
                      x={x0 + (firstCols * cell) / 2}
                      y={y0 + dr * cell + 22}
                      fontSize={chart.small}
                      textAnchor="middle"
                    >
                      {`${rows} × ${firstCols} = ${rows * firstCols}`}
                    </ChartText>
                    {cols > firstCols ? (
                      <ChartText
                        x={divider + ((cols - firstCols) * cell) / 2}
                        y={y0 + dr * cell + (stagger ? 40 : 22)}
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
                x={x0 + dc * cell}
                y={y0 + dr * cell}
                label={`${rep.variable(spec.rows).name} and ${rep.variable(spec.columns).name}`}
                onStart={() => (start.current = { r: dr, c: dc })}
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
      <Caption>{cut ? `${caption} (the first ${spec.max} shown)` : caption}</Caption>
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
