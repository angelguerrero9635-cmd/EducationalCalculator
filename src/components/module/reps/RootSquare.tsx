import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';

type Spec = Extract<Representation, { kind: 'rootSquare' }>;

const sq = (n: number) => `${formatNumber(n)}²`;

/**
 * A square root as a side: a square on a unit grid whose area is the number and whose side is
 * its root, the whole-number squares just under and over it outlined, and a number line drawn
 * to the same scale under the grid, so the side drops straight onto the line between two whole
 * numbers. Fixed marks (√2, π) can sit on the line beside it. Drag the corner to change the area.
 */
export function RootSquare({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const known = rep.known(spec.area) || rep.known(spec.side);
  const area = rep.known(spec.area)
    ? Math.max(0, rep.shown(spec.area))
    : rep.known(spec.side)
      ? rep.shown(spec.side) ** 2
      : Math.max(0, rep.shown(spec.area));
  const side = Math.sqrt(area);
  // Exact when the side is a whole number or a short decimal (√2.25 = 1.5).
  const exact = Math.abs((Math.round(side * 100) / 100) ** 2 - area) < 1e-9;
  const k = Math.floor(side + 1e-9);
  const marks = spec.marks ?? [];
  // The grid is one square past the side (4 × 4 for √10); the line reaches the biggest mark.
  const grid = useFrozen(Math.max(2, Math.ceil(side - 1e-9)));
  const n = grid.value;
  const span = Math.max(n, ...marks.map((m) => Math.ceil(m.at)));
  const rootText = `√${formatNumber(area)}`;

  const left = 34;
  const right = 78;
  const top = 18;
  const unitFor = (w: number) => Math.min((w - left - right) / span, 230 / n);
  const lineRoom = 112;

  return (
    <View>
      <Canvas aspect={(w) => (top + n * unitFor(w) + 30 + lineRoom) / w}>
        {({ w, h }) => {
          const u = unitFor(w);
          const x0 = left;
          const yBase = top + n * u;
          const s = side * u;
          const lineY = h - 52;
          const lx = (x: number) => x0 + x * u;
          // Labels above the number line, raised a row when they would run into the last one.
          // The fixed marks are labelled above the line, raised a row when they would run into
          // the last one; the root is labelled under the numbers, in its own row.
          const ends: number[] = [];
          const placed = [...marks]
            .sort((a, b) => a.at - b.at)
            .map((m) => {
              const half = (m.label.length * chart.label * 0.58) / 2 + 4;
              let row = 0;
              while ((ends[row] ?? -Infinity) > lx(m.at) - half) row++;
              ends[row] = lx(m.at) + half;
              return { ...m, row };
            });
          // No area or side typed: the label reads "?" (never the example's numbers behind a "?").
          const rootLabel = !known
            ? '√? = ?'
            : exact
              ? `${rootText} = ${formatNumber(side)}`
              : `${rootText} ≈ ${formatNumber(Math.round(side * 100) / 100)}`;
          const cellLines = Array.from({ length: n + 1 }, (_, i) => i);
          return (
            <>
              <Svg width={w} height={h}>
                {/* The unit grid. */}
                {cellLines.map((i) => (
                  <G key={`g${i}`}>
                    <Line
                      x1={x0 + i * u}
                      y1={top}
                      x2={x0 + i * u}
                      y2={yBase}
                      stroke={c.chartGrid}
                      strokeWidth={1}
                    />
                    <Line
                      x1={x0}
                      y1={yBase - i * u}
                      x2={x0 + n * u}
                      y2={yBase - i * u}
                      stroke={c.chartGrid}
                      strokeWidth={1}
                    />
                  </G>
                ))}
                {/* The square whose area is the number. */}
                <Rect
                  x={x0}
                  y={yBase - s}
                  width={s}
                  height={s}
                  fill={c.chartHighlight}
                  fillOpacity={0.2}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.strokeHeavy}
                  opacity={known ? 1 : 0.35}
                />
                {/* The whole-number squares just under and over it. */}
                {!exact
                  ? [k, k + 1]
                      .filter((j) => j > 0)
                      .map((j) => (
                        <G key={`sq${j}`}>
                          <Rect
                            x={x0}
                            y={yBase - j * u}
                            width={j * u}
                            height={j * u}
                            fill="none"
                            stroke={c.chartMuted}
                            strokeWidth={chart.strokeLight}
                            strokeDasharray={chart.dash}
                          />
                          <ChartText
                            x={x0 + n * u + 8}
                            y={yBase - j * u + 4}
                            fontSize={chart.small}
                            fill={c.chartMuted}
                          >
                            {`${sq(j)} = ${formatNumber(j * j)}`}
                          </ChartText>
                          <Line
                            x1={x0 + j * u}
                            y1={yBase - j * u}
                            x2={x0 + n * u + 5}
                            y2={yBase - j * u}
                            stroke={c.chartMuted}
                            strokeWidth={1}
                            strokeDasharray={chart.dashFine}
                          />
                        </G>
                      ))
                  : null}
                <ChartText
                  x={x0 + s / 2}
                  y={yBase - s / 2 + 5}
                  fontSize={s > 70 ? chart.emphasis : chart.small}
                  fontWeight="700"
                  textAnchor="middle"
                  opacity={known ? 1 : 0.5}
                >
                  {rep.label(spec.area, false)}
                </ChartText>
                {/* The side, labelled on the left, where the grid's edge is. */}
                <ChartText
                  x={x0 - 6}
                  y={yBase - s / 2 + 4}
                  fontSize={chart.small}
                  fontWeight="700"
                  fill={c.chartHighlight}
                  textAnchor="end"
                >
                  {rep.variable(spec.side).symbol}
                </ChartText>
                {/* The side dropped onto the number line: same scale, so it lands on the root. */}
                <Line
                  x1={x0 + s}
                  y1={yBase}
                  x2={x0 + s}
                  y2={lineY}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dash}
                  opacity={known ? 1 : 0.35}
                />
                <Line
                  x1={x0}
                  y1={yBase + 10}
                  x2={x0 + s}
                  y2={yBase + 10}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.stroke}
                  opacity={known ? 1 : 0.35}
                />
                <ChartText
                  {...fitLabel(x0 + s / 2, rep.label(spec.side, false), chart.small, w)}
                  y={yBase + 24}
                  fontSize={chart.small}
                  fontWeight="700"
                  fill={c.chartHighlight}
                >
                  {rep.label(spec.side, false)}
                </ChartText>
                {/* The number line, 0 to the end of the grid (or the biggest mark). */}
                {!exact && known ? (
                  <Line
                    x1={lx(k)}
                    y1={lineY}
                    x2={lx(k + 1)}
                    y2={lineY}
                    stroke={c.chartSecond}
                    strokeWidth={chart.strokeHeavy + 3}
                    strokeLinecap="round"
                  />
                ) : null}
                <Line
                  x1={lx(0)}
                  y1={lineY}
                  x2={lx(span) + 10}
                  y2={lineY}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                {Array.from({ length: span * 10 + 1 }, (_, i) => i / 10).map((t) => {
                  const whole = Math.abs(t - Math.round(t)) < 1e-9;
                  if (!whole && u < 40) return null;
                  return (
                    <Line
                      key={`t${i10(t)}`}
                      x1={lx(t)}
                      y1={lineY - (whole ? 6 : 3)}
                      x2={lx(t)}
                      y2={lineY + (whole ? 6 : 3)}
                      stroke={c.chartInk}
                      strokeWidth={whole ? chart.strokeLight : 1}
                    />
                  );
                })}
                {Array.from({ length: span + 1 }, (_, i) => (
                  <ChartText
                    key={`n${i}`}
                    x={lx(i)}
                    y={lineY + 20}
                    fontSize={chart.label}
                    textAnchor="middle"
                  >
                    {formatNumber(i)}
                  </ChartText>
                ))}
                {placed.map((p) => {
                  const y = lineY - 12 - p.row * 16;
                  return (
                    <G key={`p${p.label}`}>
                      {p.row > 0 ? (
                        <Line
                          x1={lx(p.at)}
                          y1={lineY - 6}
                          x2={lx(p.at)}
                          y2={y + 3}
                          stroke={c.chartMuted}
                          strokeWidth={1}
                        />
                      ) : null}
                      <Circle
                        cx={lx(p.at)}
                        cy={lineY}
                        r={4.5}
                        fill={c.chartInk}
                        stroke={c.background}
                        strokeWidth={1.5}
                      />
                      <ChartText
                        {...fitLabel(lx(p.at), p.label, chart.label, w)}
                        y={y}
                        fontSize={chart.label}
                        fontWeight="700"
                      >
                        {p.label}
                      </ChartText>
                    </G>
                  );
                })}
                <G opacity={known ? 1 : 0.35}>
                  <Circle
                    cx={lx(side)}
                    cy={lineY}
                    r={6}
                    fill={c.chartHighlight}
                    stroke={c.background}
                    strokeWidth={1.5}
                  />
                  <ChartText
                    {...fitLabel(lx(side), rootLabel, chart.value, w)}
                    y={lineY + 40}
                    fontSize={chart.value}
                    fontWeight="700"
                    fill={c.chartHighlight}
                  >
                    {rootLabel}
                  </ChartText>
                </G>
              </Svg>
              <DragHandle
                testID="drag-corner"
                x={x0 + s}
                y={yBase - s}
                label={rep.variable(spec.area).name}
                onStart={() => {
                  start.current = side;
                  grid.freeze();
                }}
                onEnd={grid.release}
                onMove={(dx, dy) => {
                  // Along the diagonal: the side grows by the average of across and up.
                  const next = Math.max(0, start.current + (dx - dy) / 2 / u);
                  calc.set(
                    { [spec.area]: rep.snapTo(spec.area, next * next * rep.factor(spec.area)) },
                    rep.slide(spec.area),
                  );
                }}
              />
            </>
          );
        }}
      </Canvas>
      <Caption>
        {!known
          ? 'Type the area or the side to draw the square.'
          : exact
            ? `A square of area ${formatNumber(area)} has side ${rootText} = ${formatNumber(side)} · ${sq(side)} = ${formatNumber(area)}`
            : `A square of area ${formatNumber(area)} has side ${rootText} ≈ ${rep.value(spec.side, false)} · ${k > 0 ? `${sq(k)} = ${formatNumber(k * k)} · ${sq(k + 1)} = ${formatNumber((k + 1) ** 2)} · ${formatNumber(k * k)} < ${formatNumber(area)} < ${formatNumber((k + 1) ** 2)}` : `0 < ${formatNumber(area)} < 1`}, so ${rootText} is between ${k} and ${k + 1}.`}
      </Caption>
    </View>
  );
}

/** A tick's key: tenths as whole numbers, so 0.1 × 3 and 0.3 share one. */
const i10 = (t: number) => Math.round(t * 10);
