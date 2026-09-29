import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';

type Spec = Extract<Representation, { kind: 'rootSquare' }>;

const cube = (n: number) => `${formatNumber(n)}³`;

/**
 * A cube root as an edge: a cube of the volume drawn with its edge along a number line to the
 * same scale, so the edge lands on ∛V between two whole numbers (the cubes of which bracket
 * the volume, named in the caption).
 */
export function CubeRoot({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const known = rep.known(spec.area) || rep.known(spec.side);
  const volume = rep.known(spec.area)
    ? Math.max(0, rep.shown(spec.area))
    : rep.known(spec.side)
      ? rep.shown(spec.side) ** 3
      : Math.max(0, rep.shown(spec.area));
  const edge = Math.cbrt(volume);
  const exact = Math.abs((Math.round(edge * 100) / 100) ** 3 - volume) < 1e-9;
  const k = Math.floor(edge + 1e-9);
  const span = Math.max(2, Math.ceil(edge - 1e-9) + 1);
  const rootText = `∛${formatNumber(volume)}`;
  const rootLabel = exact
    ? `${rootText} = ${formatNumber(edge)}`
    : `${rootText} ≈ ${formatNumber(Math.round(edge * 100) / 100)}`;

  return (
    <View>
      <Canvas aspect={0.8}>
        {({ w, h }) => {
          const left = 24;
          const lineY = h - 52;
          // One scale for the line and the cube: the cube's depth takes 40% more room up.
          const u = Math.min((w - left - 40) / span, (lineY - 40) / (edge * 1.4 || 1));
          const s = edge * u;
          const d = s * 0.4;
          const x0 = left;
          const yb = lineY - 24;
          const lx = (x: number) => x0 + x * u;
          const front = `M ${x0} ${yb} h ${s} v ${-s} h ${-s} Z`;
          const topFace = `M ${x0} ${yb - s} l ${d} ${-d} h ${s} l ${-d} ${d} Z`;
          const side = `M ${x0 + s} ${yb} l ${d} ${-d} v ${-s} l ${-d} ${d} Z`;
          return (
            <Svg width={w} height={h}>
              <G opacity={known ? 1 : 0.35}>
                <Path d={side} fill={c.chartFill} stroke={c.chartInk} strokeWidth={chart.stroke} />
                <Path
                  d={topFace}
                  fill={c.chartHighlight}
                  fillOpacity={0.12}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                <Path
                  d={front}
                  fill={c.chartHighlight}
                  fillOpacity={0.25}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.strokeHeavy}
                />
                {s > 40 ? (
                  <ChartText
                    x={x0 + s / 2}
                    y={yb - s / 2 + 5}
                    fontSize={chart.label}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {rep.label(spec.area, false)}
                  </ChartText>
                ) : null}
                {/* The edge dropped onto the line. */}
                <Line
                  x1={x0 + s}
                  y1={yb}
                  x2={x0 + s}
                  y2={lineY}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dash}
                />
              </G>
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
                x2={lx(span) + 8}
                y2={lineY}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              {Array.from({ length: span + 1 }, (_, i) => i)
                .filter((i) => u >= 18 || i % 5 === 0 || i === k || (!exact && i === k + 1))
                .map((i) => (
                  <G key={`n${i}`}>
                    <Line
                      x1={lx(i)}
                      y1={lineY - 6}
                      x2={lx(i)}
                      y2={lineY + 6}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    <ChartText x={lx(i)} y={lineY + 20} fontSize={chart.label} textAnchor="middle">
                      {formatNumber(i)}
                    </ChartText>
                  </G>
                ))}
              <G opacity={known ? 1 : 0.35}>
                <Circle
                  cx={lx(edge)}
                  cy={lineY}
                  r={6}
                  fill={c.chartHighlight}
                  stroke={c.background}
                  strokeWidth={1.5}
                />
                <ChartText
                  {...fitLabel(lx(edge), rootLabel, chart.value, w)}
                  y={lineY + 40}
                  fontSize={chart.value}
                  fontWeight="700"
                  fill={c.chartHighlight}
                >
                  {rootLabel}
                </ChartText>
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {!known
          ? 'Type the volume or the edge to draw the cube.'
          : exact
            ? `A cube of volume ${formatNumber(volume)} has edge ${rootText} = ${formatNumber(edge)} · ${cube(edge)} = ${formatNumber(volume)}`
            : `A cube of volume ${formatNumber(volume)} has edge ${rootText} ≈ ${rep.value(spec.side, false)} · ${cube(k)} = ${formatNumber(k ** 3)} · ${cube(k + 1)} = ${formatNumber((k + 1) ** 3)}, so ${rootText} is between ${k} and ${k + 1}.`}
      </Caption>
    </View>
  );
}
