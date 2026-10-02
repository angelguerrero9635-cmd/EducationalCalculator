import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Path, Polygon } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { outline } from './scaleOutline';
import { ScaleDilation, SideSplitter } from './ScaleCopyHsf';

type Spec = Extract<Representation, { kind: 'scaleCopy' }>;

const TOP = 40;
const BOTTOM = 40;

/**
 * A figure and its scaled copy on one grid: every length of the copy is the scale factor times
 * the original's, so the copy has the same shape. An arrow from the original to the copy
 * carries the factor; the widths are labelled under each figure and the heights inside them.
 * Drag the copy's bottom right corner to change the factor.
 */
export function ScaleCopy({ spec, calc }: { spec: Spec; calc: Calculator }) {
  // Grades 9–12: a dilation from a center, or the side-splitter (ScaleCopyHsf.tsx).
  if (spec.splitter) return <SideSplitter spec={spec} calc={calc} />;
  if (spec.center) return <ScaleDilation spec={spec} calc={calc} />;
  return <ScaleCopyGrid spec={spec} calc={calc} />;
}

function ScaleCopyGrid({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const num = (v: string | number) => (typeof v === 'number' ? v : rep.shown(v));
  const known = (v: string | number) => typeof v === 'number' || rep.known(v);
  const text = (v: string | number) => (typeof v === 'number' ? formatNumber(v) : rep.value(v));
  const W = Math.max(1, num(spec.width));
  const H = Math.max(1, num(spec.height));
  const kKnown = rep.known(spec.factor);
  const k = Math.max(0.1, rep.shown(spec.factor));
  // Grid extent in squares, held while the corner is dragged.
  const fit = useFrozen({
    cols: Math.ceil(W + W * k + 4),
    rows: Math.ceil(Math.max(H, H * k)) + 1,
  });
  const { cols, rows } = fit.value;
  const pts = outline(spec.shape, W, H);
  const K = formatNumber(k);
  // The copy's lengths read "?" until they are known (never worked from a "?" factor or side).
  const copyW = spec.copyWidth
    ? rep.value(spec.copyWidth)
    : kKnown && known(spec.width)
      ? formatNumber(W * k)
      : '?';
  const copyH = spec.copyHeight
    ? rep.value(spec.copyHeight)
    : kKnown && known(spec.height)
      ? formatNumber(H * k)
      : '?';
  const plain = (id: string | undefined, x: number) =>
    id && rep.known(id) ? formatNumber(rep.shown(id)) : formatNumber(x);

  const lines: string[] = [];
  if (!kKnown) lines.push('Scale factor: ?');
  else {
    lines.push(`Scale factor ${K}: every length times ${K}`);
    if (known(spec.width))
      lines.push(
        `Width: ${formatNumber(W)} × ${K} = ${spec.copyWidth ? plain(spec.copyWidth, W * k) : formatNumber(W * k)}`,
      );
    if (known(spec.height))
      lines.push(
        `Height: ${formatNumber(H)} × ${K} = ${spec.copyHeight ? plain(spec.copyHeight, H * k) : formatNumber(H * k)}`,
      );
    if (spec.area && rep.known(spec.area[0]))
      lines.push(
        `Area: ${formatNumber(rep.shown(spec.area[0]))} × ${K} × ${K} = ${plain(spec.area[1], rep.shown(spec.area[0]) * k * k)}`,
      );
  }

  return (
    <View>
      <Canvas
        aspect={(w) => {
          const s = Math.min(30, (w - 8) / cols, 280 / rows);
          return (TOP + rows * s + BOTTOM) / w;
        }}
      >
        {({ w, h }) => {
          const s = Math.min(30, (w - 8) / cols, 280 / rows);
          const gx = (w - cols * s) / 2;
          const base = TOP + rows * s;
          // Grid squares to pixels: the original starts 1 square in, the copy 2 squares past it.
          const X0 = gx + s;
          const X1 = X0 + (W + 2) * s;
          const P = (ox: number, x: number, y: number) => [ox + x * s, base - y * s] as const;
          const poly = (ox: number, f: number) =>
            pts.map(([x, y]) => P(ox, x * f, y * f).join(',')).join(' ');
          const cx = P(X1, W * k, 0)[0];
          // The factor's arrow, over the gap from the original's top to the copy's.
          const a0 = P(X0, W * 0.6, H);
          const a1 = P(X1, W * k * 0.35, H * k);
          const peak = TOP - 20;
          const mid = (a0[0] + a1[0]) / 2;
          const ctrl = [mid, peak - 10] as const;
          const tip = [a1[0], a1[1] - 5] as const;
          // The arrowhead points along the curve's end (from the control point to the tip).
          const len = Math.hypot(tip[0] - ctrl[0], tip[1] - ctrl[1]) || 1;
          const [ux, uy] = [(tip[0] - ctrl[0]) / len, (tip[1] - ctrl[1]) / len];
          const head = [
            tip,
            [tip[0] - ux * 9 - uy * 5, tip[1] - uy * 9 + ux * 5],
            [tip[0] - ux * 9 + uy * 5, tip[1] - uy * 9 - ux * 5],
          ]
            .map((q) => q.join(','))
            .join(' ');
          // The curve's highest point, where the factor is written just above.
          const apex = Array.from({ length: 21 }, (_, i) => {
            const t = i / 20;
            const u = 1 - t;
            return [
              u * u * a0[0] + 2 * u * t * ctrl[0] + t * t * tip[0],
              u * u * (a0[1] - 4) + 2 * u * t * ctrl[1] + t * t * tip[1],
            ] as const;
          }).reduce((best, q) => (q[1] < best[1] ? q : best));
          const label = kKnown ? `× ${K}` : '× ?';
          const heightLabel = (ox: number, f: number, t: string) => (
            <ChartText
              x={ox + 5}
              y={base - (H * f * s) / 2 + 4}
              fontSize={chart.small}
              fontWeight="700"
            >
              {t}
            </ChartText>
          );
          return (
            <>
              <Svg width={w} height={h}>
                {/* The grid. */}
                {Array.from({ length: cols + 1 }, (_, i) => (
                  <Line
                    key={`c${i}`}
                    x1={gx + i * s}
                    y1={TOP}
                    x2={gx + i * s}
                    y2={base}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                  />
                ))}
                {Array.from({ length: rows + 1 }, (_, i) => (
                  <Line
                    key={`r${i}`}
                    x1={gx}
                    y1={TOP + i * s}
                    x2={gx + cols * s}
                    y2={TOP + i * s}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                  />
                ))}
                <Polygon
                  opacity={known(spec.width) && known(spec.height) ? 1 : 0.35}
                  points={poly(X0, 1)}
                  fill={c.chartSecond}
                  fillOpacity={0.55}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                  strokeLinejoin="round"
                />
                <G opacity={kKnown ? 1 : 0.35}>
                  <Polygon
                    points={poly(X1, k)}
                    fill={c.chartHighlight}
                    fillOpacity={0.3}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                    strokeLinejoin="round"
                  />
                </G>
                <Path
                  d={`M ${a0[0]} ${a0[1] - 4} Q ${ctrl[0]} ${ctrl[1]} ${tip[0] - ux * 6} ${tip[1] - uy * 6}`}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                  fill="none"
                />
                <Polygon points={head} fill={c.chartInk} />
                <ChartText
                  {...fitLabel(apex[0], label, chart.emphasis, w)}
                  y={Math.max(14, apex[1] - 8)}
                  fontSize={chart.emphasis}
                  fontWeight="700"
                >
                  {label}
                </ChartText>
                {/* Lengths: widths under each figure, heights inside by the left edge. */}
                <ChartText
                  {...fitLabel(X0 + (W * s) / 2, text(spec.width), chart.label, w)}
                  y={base + 15}
                  fontWeight="700"
                >
                  {text(spec.width)}
                </ChartText>
                <ChartText
                  {...fitLabel(X1 + (W * k * s) / 2, copyW, chart.label, w)}
                  y={base + 15}
                  fontWeight="700"
                  fill={c.chartHighlight}
                >
                  {copyW}
                </ChartText>
                {H * s >= 18 ? heightLabel(X0, 1, text(spec.height)) : null}
                {H * k * s >= 18 ? heightLabel(X1, k, copyH) : null}
                <ChartText
                  {...fitLabel(X0 + (W * s) / 2, 'Original', chart.small, w)}
                  y={base + 31}
                  fontSize={chart.small}
                  fill={c.chartMuted}
                >
                  Original
                </ChartText>
                <ChartText
                  {...fitLabel(X1 + (W * k * s) / 2, 'Scaled copy', chart.small, w)}
                  y={base + 31}
                  fontSize={chart.small}
                  fill={c.chartMuted}
                >
                  Scaled copy
                </ChartText>
              </Svg>
              {kKnown ? (
                <DragHandle
                  testID={`drag-${spec.factor}`}
                  // The copy's bottom right corner (every outline has one).
                  x={cx}
                  y={base}
                  label={rep.variable(spec.factor).name}
                  onStart={() => {
                    start.current = k;
                    fit.freeze();
                  }}
                  onEnd={fit.release}
                  onMove={(dx) =>
                    calc.set(
                      {
                        ...rep.pin(
                          [spec.width, spec.height].filter(
                            (v): v is string => typeof v === 'string',
                          ),
                        ),
                        [spec.factor]: rep.snapTo(spec.factor, start.current + dx / (W * s)),
                      },
                      rep.slide(spec.factor),
                    )
                  }
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
