import { useRef, useState } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'baseHeight' }>;

/**
 * A parallelogram, triangle, trapezoid or house shape with its base drawn thick and its height
 * dashed with a square-corner mark (outside the shape when it leans past the base). Drag the
 * top corner to lean the shape: the base and height, and so the area, stay the same.
 * `rearrange` shows the parallelogram's cut triangle moved to make a rectangle; `double` adds
 * the triangle's turned copy that makes a parallelogram; a trapezoid is cut by a diagonal into
 * two triangles, each labelled with its area.
 */
export function BaseHeight({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const [lean, setLean] = useState(spec.shape === 'triangle' ? 0.35 : 0.3);
  const startLean = useRef(0);
  const b = Math.max(0.1, rep.shown(spec.base));
  const hgt = Math.max(0.1, rep.shown(spec.height));
  const top = spec.top ? Math.max(0.1, rep.shown(spec.top)) : undefined;
  const known = rep.known(spec.base) && rep.known(spec.height);
  const unit = rep.unit(spec.base) ?? '';
  const areaUnit = rep.unit(spec.area) ?? '';
  const n = (x: number) => formatNumber(Number(x.toFixed(3)));

  return (
    <View>
      <Canvas aspect={0.62}>
        {({ w, h }) => {
          const pad = 30;
          // One scale for both directions, so a square looks square.
          const spanX = b * (1 + Math.abs(lean)) + (spec.show === 'double' ? b * 0.2 : 0);
          const s = Math.min((w - 2 * pad) / spanX, (h - 2 * pad - 20) / (hgt * 1.4));
          const x0 = pad + (lean < 0 ? -lean * b * s : 0);
          const y0 = h - pad - 14;
          const X = (u: number) => x0 + u * s;
          const Y = (v: number) => y0 - v * s;
          const shift = lean * b; // how far the top leans along the base
          let outline: [number, number][] = [];
          let footX = 0;
          let apexX = 0;
          if (spec.shape === 'parallelogram') {
            outline = [
              [0, 0],
              [b, 0],
              [b + shift, hgt],
              [shift, hgt],
            ];
            footX = shift;
            apexX = shift;
          } else if (spec.shape === 'triangle') {
            apexX = b / 2 + shift;
            outline = [
              [0, 0],
              [b, 0],
              [apexX, hgt],
            ];
            footX = apexX;
          } else if (spec.shape === 'trapezoid') {
            const t = top ?? b / 2;
            const left = (b - t) / 2 + shift;
            outline = [
              [0, 0],
              [b, 0],
              [left + t, hgt],
              [left, hgt],
            ];
            footX = left;
            apexX = left;
          } else {
            // A house: a rectangle with a triangle roof of the given height on top.
            const roof = top ?? hgt / 2;
            outline = [
              [0, 0],
              [b, 0],
              [b, hgt],
              [b / 2, hgt + roof],
              [0, hgt],
            ];
            footX = b / 2;
            apexX = b / 2;
          }
          const pts = outline.map(([u, v]) => `${X(u)},${Y(v)}`).join(' ');
          const outside = footX < 0 || footX > b;
          const roofTop = spec.shape === 'house' ? hgt + (top ?? hgt / 2) : hgt;
          return (
            <>
              <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
                {spec.show === 'rearrange' && spec.shape === 'parallelogram' && shift > 0 ? (
                  // The triangle cut off the left, moved to the right: a rectangle b × h.
                  <Polygon
                    points={`${X(b)},${Y(0)} ${X(b + shift)},${Y(0)} ${X(b + shift)},${Y(hgt)}`}
                    fill={c.chartHighlight}
                    fillOpacity={0.12}
                    stroke={c.chartHighlight}
                    strokeDasharray={chart.dash}
                  />
                ) : null}
                {spec.show === 'double' && spec.shape === 'triangle' ? (
                  // The same triangle turned round: together they make a parallelogram.
                  <Polygon
                    points={`${X(b)},${Y(0)} ${X(apexX + b)},${Y(hgt)} ${X(apexX)},${Y(hgt)}`}
                    fill={c.chartSurface}
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dash}
                  />
                ) : null}
                <Polygon
                  points={pts}
                  fill={c.chartHighlight}
                  fillOpacity={0.18}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                {spec.shape === 'trapezoid' ? (
                  <Line
                    x1={X(0)}
                    y1={Y(0)}
                    x2={X(outline[2]![0])}
                    y2={Y(hgt)}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                    strokeDasharray={chart.dashFine}
                  />
                ) : null}
                {spec.shape === 'house' ? (
                  <Line
                    x1={X(0)}
                    y1={Y(hgt)}
                    x2={X(b)}
                    y2={Y(hgt)}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                    strokeDasharray={chart.dashFine}
                  />
                ) : null}
                {/* The base, thick; extended dotted when the height falls outside it. */}
                <Line
                  x1={X(0)}
                  y1={Y(0)}
                  x2={X(b)}
                  y2={Y(0)}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.strokeHeavy * 1.5}
                />
                {outside ? (
                  <Line
                    x1={X(Math.min(0, footX))}
                    y1={Y(0)}
                    x2={X(Math.max(b, footX))}
                    y2={Y(0)}
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dashFine}
                  />
                ) : null}
                {/* The height, dashed, with its square corner at the foot. */}
                <Line
                  x1={X(footX)}
                  y1={Y(0)}
                  x2={X(footX)}
                  y2={Y(spec.shape === 'house' ? roofTop : hgt)}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dash}
                />
                <Path
                  d={`M ${X(footX) + (footX > b / 2 ? -10 : 10)} ${Y(0)} l 0 -10 l ${footX > b / 2 ? 10 : -10} 0`}
                  stroke={c.chartInk}
                  fill="none"
                />
                <ChartText
                  x={(X(0) + X(b)) / 2}
                  y={Y(0) + 20}
                  fontSize={chart.label}
                  fontWeight="700"
                  fill={c.chartHighlight}
                  textAnchor="middle"
                >
                  {`${rep.words ? 'base' : rep.variable(spec.base).symbol} ${n(b)}${unit ? ` ${unit}` : ''}`}
                </ChartText>
                <ChartText
                  x={X(footX) + 6}
                  y={(Y(0) + Y(hgt)) / 2}
                  fontSize={chart.label}
                  fill={c.chartInk}
                >
                  {`${rep.words ? 'height' : rep.variable(spec.height).symbol} ${n(hgt)}${unit ? ` ${unit}` : ''}`}
                </ChartText>
                {spec.shape === 'trapezoid' && top !== undefined ? (
                  <G>
                    <ChartText
                      x={(X(outline[3]![0]) + X(outline[2]![0])) / 2}
                      y={Y(hgt) - 8}
                      fontSize={chart.label}
                      fill={c.chartInk}
                      textAnchor="middle"
                    >
                      {`${rep.words ? 'top' : rep.variable(spec.top!).symbol} ${n(top)}`}
                    </ChartText>
                    {/* Each triangle's area inside it: ½ × base × height. */}
                    <ChartText
                      x={X(b * 0.62)}
                      y={Y(hgt * 0.3)}
                      fontSize={chart.small}
                      fill={c.chartMuted}
                      textAnchor="middle"
                    >
                      {n(0.5 * b * hgt)}
                    </ChartText>
                    <ChartText
                      x={X(outline[3]![0] + top * 0.3)}
                      y={Y(hgt * 0.75)}
                      fontSize={chart.small}
                      fill={c.chartMuted}
                      textAnchor="middle"
                    >
                      {n(0.5 * top * hgt)}
                    </ChartText>
                  </G>
                ) : null}
                {spec.show === 'rearrange' && spec.shape === 'parallelogram' ? (
                  <Rect
                    x={X(shift)}
                    y={Y(hgt)}
                    width={b * s}
                    height={hgt * s}
                    fill="none"
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dashFine}
                  />
                ) : null}
              </Svg>
              {spec.shape !== 'house' ? (
                <DragHandle
                  testID="drag-lean"
                  x={X(apexX)}
                  y={Y(hgt)}
                  label="Lean"
                  onStart={() => {
                    startLean.current = lean;
                  }}
                  onMove={(dx) =>
                    setLean(Math.max(-0.8, Math.min(1.2, startLean.current + dx / (b * s))))
                  }
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {known && rep.known(spec.area)
          ? `Area: ${rep.value(spec.area, false)}${areaUnit ? ` ${areaUnit}` : ''}. Leaning the shape keeps the base, the height and the area.`
          : 'Type the base and the height.'}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.base, steps: [1], pin: [spec.height, ...(spec.top ? [spec.top] : [])] },
          { var: spec.height, steps: [1], pin: [spec.base, ...(spec.top ? [spec.top] : [])] },
        ]}
      />
    </View>
  );
}
