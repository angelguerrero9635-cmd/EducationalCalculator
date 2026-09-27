import Svg, { G, Path } from 'react-native-svg';

import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import { Canvas, ChartText } from './common';
import { tickStep } from './IntegerLine';

/**
 * A box too big for unit cubes (40 × 60 × 80 cm), drawn to scale in the same oblique view as
 * the cubes: faint lines every few units on its faces so the layers can still be counted, each
 * edge labelled, and one unit cube at the same scale under it for size.
 */
export function ScaledBox({
  length,
  width,
  height,
  labels,
  unitName,
  faded,
}: {
  length: number;
  width: number;
  height: number;
  /** Edge labels: across, back, up ("40 cm"). */
  labels: [string, string, string];
  /** What one unit cube is called: "1 cm cube". */
  unitName: string;
  faded: boolean;
}) {
  const c = usePalette();
  const dx = 0.5;
  const dy = 0.28;
  const L = Math.max(length, 1);
  const W = Math.max(width, 1);
  const H = Math.max(height, 1);
  // Room left for the height label and right for the width label (estimated from their
  // length); 58 px under the box for the length label and the unit cube.
  const left = labels[2].length * chart.label * 0.6 + 12;
  const right = labels[1].length * chart.label * 0.6 + 16;
  const scale = (w: number) =>
    Math.min((w - left - right) / (L + W * dx), (w * 0.7) / (H + W * dy));
  return (
    <Canvas aspect={(w) => ((H + W * dy) * scale(w) + 58) / w}>
      {({ w, h }) => {
        const u = scale(w);
        const x0 = left;
        const yBase = h - 44;
        // A point on the box: i across, j back, k up.
        const p = (i: number, j: number, k: number) =>
          `${x0 + i * u + j * u * dx} ${yBase - k * u - j * u * dy}`;
        const front = `M ${p(0, 0, 0)} L ${p(L, 0, 0)} L ${p(L, 0, H)} L ${p(0, 0, H)} Z`;
        const top = `M ${p(0, 0, H)} L ${p(L, 0, H)} L ${p(L, W, H)} L ${p(0, W, H)} Z`;
        const side = `M ${p(L, 0, 0)} L ${p(L, W, 0)} L ${p(L, W, H)} L ${p(L, 0, H)} Z`;
        // Lines every `g` units (at most about 8 a side) so the size can be counted in tens.
        const g = tickStep(Math.max(L, W, H), 8);
        const at = (n: number) =>
          Array.from({ length: Math.ceil(n / g) - 1 }, (_, i) => (i + 1) * g);
        const grid = [
          ...at(L).flatMap((i) => [
            [p(i, 0, 0), p(i, 0, H)],
            [p(i, 0, H), p(i, W, H)],
          ]),
          ...at(H).flatMap((k) => [
            [p(0, 0, k), p(L, 0, k)],
            [p(L, 0, k), p(L, W, k)],
          ]),
          ...at(W).flatMap((j) => [
            [p(0, j, H), p(L, j, H)],
            [p(L, j, 0), p(L, j, H)],
          ]),
        ];
        const edge = { stroke: c.chartInk, strokeWidth: chart.strokeLight };
        // The unit cube under the box, at the same scale (at least 3 px so it shows).
        const cu = Math.max(u, 3);
        const cx = x0;
        const cy = h - 6;
        return (
          <Svg width={w} height={h} opacity={faded ? 0.4 : 1}>
            <Path d={front} fill={c.chartSecond} />
            <Path d={top} fill={c.chartSecond} />
            <Path d={top} fill={c.shine} fillOpacity={0.45} />
            <Path d={side} fill={c.chartSecond} />
            <Path d={side} fill={c.shade} fillOpacity={0.3} />
            {grid.map(([a, b], n) => (
              <Path
                key={n}
                d={`M ${a} L ${b}`}
                stroke={c.chartInk}
                strokeOpacity={0.25}
                strokeWidth={1}
              />
            ))}
            <Path d={front} fill="none" {...edge} />
            <Path d={top} fill="none" {...edge} />
            <Path d={side} fill="none" {...edge} />
            <ChartText
              x={x0 + (L * u) / 2}
              y={yBase + 16}
              fontSize={chart.label}
              fontWeight="700"
              textAnchor="middle"
            >
              {labels[0]}
            </ChartText>
            <ChartText
              x={x0 + L * u + (W * u * dx) / 2 + 8}
              y={yBase - (W * u * dy) / 2 + 4}
              fontSize={chart.label}
              fontWeight="700"
            >
              {labels[1]}
            </ChartText>
            <ChartText
              x={x0 - 6}
              y={yBase - (H * u) / 2 + 4}
              fontSize={chart.label}
              fontWeight="700"
              textAnchor="end"
            >
              {labels[2]}
            </ChartText>
            <G>
              <Path
                d={`M ${cx} ${cy} h ${cu} v ${-cu} h ${-cu} Z`}
                fill={c.chartHighlight}
                stroke={c.chartInk}
                strokeWidth={0.75}
              />
              <ChartText x={cx + cu + 6} y={cy} fontSize={chart.small} fill={c.chartMuted}>
                {`= ${unitName} (lines every ${formatNumber(g)})`}
              </ChartText>
            </G>
          </Svg>
        );
      }}
    </Canvas>
  );
}
