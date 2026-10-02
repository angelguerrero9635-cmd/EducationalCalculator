/**
 * HC95 (M-P12): `transformation` `move: 'matrix'`. The figure (the unit square) dashed and its
 * image under A = [[a, b], [c, d]] filled; the unit circle dashed and its image ellipse; with
 * `eigen`, each real eigenvector's line dashed through the origin, a unit vector v on it and
 * Av = λv along it. One scale on both axes, sized from what is drawn. Flat, no handles.
 */
import { View } from 'react-native';
import Svg, { G, Line, Path, Polygon } from 'react-native-svg';

import type { TransformationSpec } from '@/data/modules/typesGraphs';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { MathText, textWidth } from './hsdText';
import { eigen2, niceDirection, polygonArea, type M2 } from './matrixHe4a';
import { niceStep } from './Plot';

type Spec = Extract<TransformationSpec, { move: 'matrix' }>;
type Pt = [number, number];

const fmt = (x: number) => formatNumber(Number(x.toPrecision(4)));
const par = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x));
const pt = ([x, y]: Pt) => `(${fmt(x)}, ${fmt(y)})`;

export function TransformationMatrixHe4a({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = (x: number | string) =>
    typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  const raw = spec.matrix.flat().map(read);
  const known = raw.every((x) => x !== undefined);
  const [a, b, cc, d] = raw.map((x) => x ?? 0) as M2;
  const apply = ([x, y]: Pt): Pt => [a * x + b * y, cc * x + d * y];
  const fig = spec.figure.map(([x, y]) => [read(x) ?? 0, read(y) ?? 0] as Pt);
  const img = fig.map(apply);
  const circle = spec.circle !== false;
  const N = 72;
  const unit = Array.from({ length: N }, (_, k) => {
    const t = (2 * Math.PI * k) / N;
    return [Math.cos(t), Math.sin(t)] as Pt;
  });
  const ellipse = unit.map(apply);
  const eig = eigen2([a, b, cc, d]);
  const showEigen = !!spec.eigen && known;
  const pairs = showEigen ? eig.pairs : [];
  const det = a * d - b * cc;
  const figArea = polygonArea(fig);

  // What is drawn decides the view: one scale on both axes, the origin always in view.
  const drawn: Pt[] = [
    [0, 0],
    ...fig,
    ...(known ? img : []),
    ...(circle ? unit : []),
    ...(circle && known ? ellipse : []),
    ...pairs.flatMap(({ lambda, v }) => {
      const n = Math.hypot(...v) || 1;
      const u: Pt = [v[0] / n, v[1] / n];
      return [u, [lambda * u[0], lambda * u[1]] as Pt];
    }),
  ];
  const pad = 0.6;
  let x0 = Math.min(...drawn.map((p) => p[0])) - pad;
  let x1 = Math.max(...drawn.map((p) => p[0])) + pad;
  let y0 = Math.min(...drawn.map((p) => p[1])) - pad;
  let y1 = Math.max(...drawn.map((p) => p[1])) + pad;
  // Keep the picture between 0.7 and 1.1 of the width tall: widen the short span about its middle.
  const ratio = (y1 - y0) / (x1 - x0);
  if (ratio > 1.1) {
    const grow = ((y1 - y0) / 1.1 - (x1 - x0)) / 2;
    x0 -= grow;
    x1 += grow;
  } else if (ratio < 0.7) {
    const grow = ((x1 - x0) * 0.7 - (y1 - y0)) / 2;
    y0 -= grow;
    y1 += grow;
  }
  const aspect = (y1 - y0) / (x1 - x0);

  const lines: string[] = [];
  if (!known) lines.push('Type the four entries of A to draw its image.');
  else {
    lines.push(
      `A = [[${fmt(a)}, ${fmt(b)}], [${fmt(cc)}, ${fmt(d)}]] sends (1, 0) to ${pt([a, cc])} and (0, 1) to ${pt([b, d])}: its columns.`,
    );
    lines.push(
      `Area of the image = |det A| × area of the figure: |${par(a)} × ${par(d)} − ${par(b)} × ${par(cc)}| × ${fmt(figArea)} = ${fmt(Math.abs(det) * figArea)}.`,
    );
    if (det < 0) lines.push('det A < 0: the image is flipped over.');
    if (Math.abs(det) < 1e-12) lines.push('det A = 0: the plane is flattened onto a line.');
    if (circle) lines.push('The unit circle becomes an ellipse.');
    if (spec.eigen) {
      if (!eig.pairs.length)
        lines.push(
          `No real eigenvalues: tr² − 4 det = ${par(eig.tr)}² − 4 × ${par(eig.det)} = ${fmt(eig.disc)} < 0, so A turns every line off itself.`,
        );
      else if (eig.all)
        lines.push(
          `A = ${fmt(eig.pairs[0]!.lambda)}I: every direction is stretched by ${fmt(eig.pairs[0]!.lambda)}.`,
        );
      else
        for (const { lambda, v } of eig.pairs) {
          const w = niceDirection(v);
          lines.push(
            `A${pt(w)} = ${pt([a * w[0] + b * w[1], cc * w[0] + d * w[1]])} = ${fmt(lambda)}${pt(w)}: the line along ${pt(w)} maps onto itself, stretched by λ = ${fmt(lambda)}.`,
          );
        }
      if (eig.pairs.length === 1 && !eig.all)
        lines.push('One repeated eigenvalue with one line of eigenvectors.');
    }
  }

  const eigenTone = [c.tangentLine, c.lineUpright];
  return (
    <View>
      <Canvas aspect={aspect}>
        {({ w, h }) => {
          const s = w / (x1 - x0);
          const X = (x: number) => (x - x0) * s;
          const Y = (y: number) => h - (y - y0) * s;
          const path = (ps: Pt[], close = true) =>
            ps.map(([x, y], i) => `${i ? 'L' : 'M'} ${X(x)} ${Y(y)}`).join(' ') +
            (close ? ' Z' : '');
          const step = Math.max(1, niceStep(Math.max(x1 - x0, y1 - y0)));
          const ticks = (lo: number, hi: number) => {
            const out: number[] = [];
            for (let t = Math.ceil(lo / step) * step; t <= hi; t += step) out.push(t);
            return out;
          };
          const arrow = (from: Pt, to: Pt, color: string, width: number, key: string) => {
            const [fx, fy] = [X(from[0]), Y(from[1])];
            const [tx, ty] = [X(to[0]), Y(to[1])];
            const len = Math.hypot(tx - fx, ty - fy);
            if (len < 2) return null;
            const [ux, uy] = [(tx - fx) / len, (ty - fy) / len];
            const head = Math.min(10, len / 2);
            return (
              <G key={key}>
                <Line
                  x1={fx}
                  y1={fy}
                  x2={tx - ux * head * 0.6}
                  y2={ty - uy * head * 0.6}
                  stroke={color}
                  strokeWidth={width}
                />
                <Polygon
                  points={`${tx},${ty} ${tx - ux * head - uy * head * 0.45},${ty - uy * head + ux * head * 0.45} ${tx - ux * head + uy * head * 0.45},${ty - uy * head - ux * head * 0.45}`}
                  fill={color}
                />
              </G>
            );
          };
          // λ labels sit past each arrow's tip, nudged in from the edges.
          const labelAt = (p: Pt, text: string) => {
            const n = Math.hypot(p[0], p[1]) || 1;
            const [ux, uy] = [p[0] / n, p[1] / n];
            const tw = textWidth(text, chart.label);
            // Past the tip, and off the line to the side that faces up (the label's half-width
            // clears a steep line, its height a flat one).
            const [nx, ny] = ux >= 0 ? [-uy, ux] : [uy, -ux];
            const side = Math.abs(nx) * (tw / 2 + 4) + Math.abs(ny) * 12;
            const lx = X(p[0]) + ux * 12 + nx * side;
            const ly = Y(p[1]) - uy * 12 - ny * side + 4;
            return {
              x: Math.min(w - tw / 2 - 2, Math.max(tw / 2 + 2, lx)),
              y: Math.min(h - 4, Math.max(14, ly)),
            };
          };
          return (
            <Svg width={w} height={h}>
              {ticks(x0, x1).map((t) => (
                <Line
                  key={`x${t}`}
                  x1={X(t)}
                  y1={0}
                  x2={X(t)}
                  y2={h}
                  stroke={c.chartGrid}
                  strokeWidth={1}
                />
              ))}
              {ticks(y0, y1).map((t) => (
                <Line
                  key={`y${t}`}
                  x1={0}
                  y1={Y(t)}
                  x2={w}
                  y2={Y(t)}
                  stroke={c.chartGrid}
                  strokeWidth={1}
                />
              ))}
              <Line
                x1={X(x0)}
                y1={Y(0)}
                x2={X(x1)}
                y2={Y(0)}
                stroke={c.chartMuted}
                strokeWidth={chart.strokeLight}
              />
              <Line
                x1={X(0)}
                y1={Y(y0)}
                x2={X(0)}
                y2={Y(y1)}
                stroke={c.chartMuted}
                strokeWidth={chart.strokeLight}
              />
              {ticks(x0, x1)
                .filter((t) => t !== 0 && X(t) > 10 && X(t) < w - 10)
                .map((t) => (
                  <ChartText
                    key={`tx${t}`}
                    x={X(t) + 3}
                    y={Math.min(h - 3, Y(0) + 14)}
                    textAnchor="start"
                    fontSize={chart.label}
                    fill={c.chartMuted}
                    halo
                  >
                    {formatNumber(t)}
                  </ChartText>
                ))}
              {ticks(y0, y1)
                .filter((t) => t !== 0 && Y(t) > 12 && Y(t) < h - 8)
                .map((t) => (
                  <ChartText
                    key={`ty${t}`}
                    x={X(0) - 4}
                    y={Y(t) - 3}
                    textAnchor="end"
                    fontSize={chart.label}
                    fill={c.chartMuted}
                    halo
                  >
                    {formatNumber(t)}
                  </ChartText>
                ))}
              {/* The eigen lines, under everything else. */}
              {pairs.map(({ v }, i) => {
                const n = Math.hypot(...v) || 1;
                const L = 2 * Math.max(x1 - x0, y1 - y0);
                return (
                  <Line
                    key={`el${i}`}
                    x1={X((-v[0] / n) * L)}
                    y1={Y((-v[1] / n) * L)}
                    x2={X((v[0] / n) * L)}
                    y2={Y((v[1] / n) * L)}
                    stroke={eigenTone[i]!}
                    strokeWidth={chart.strokeLight}
                    strokeDasharray={chart.dash}
                    opacity={0.8}
                  />
                );
              })}
              {circle ? (
                <Path
                  d={path(unit)}
                  fill="none"
                  stroke={c.chartMuted}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dashFine}
                />
              ) : null}
              <Path
                d={path(fig)}
                fill={c.chartFill}
                fillOpacity={0.6}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
                strokeDasharray={chart.dash}
              />
              {known ? (
                <>
                  {circle ? (
                    <Path
                      d={path(ellipse)}
                      fill="none"
                      stroke={c.fnSecond}
                      strokeWidth={chart.stroke}
                    />
                  ) : null}
                  <Path
                    d={path(img)}
                    fill={c.chartHighlight}
                    fillOpacity={0.16}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                  />
                </>
              ) : null}
              {pairs.map(({ lambda, v }, i) => {
                const n = Math.hypot(...v) || 1;
                const u: Pt = [v[0] / n, v[1] / n];
                const tip: Pt = [lambda * u[0], lambda * u[1]];
                const sub = pairs.length > 1 ? (i ? '₂' : '₁') : '';
                const text = `λ${sub} = ${fmt(lambda)}`;
                const at = labelAt(Math.abs(lambda) >= 1 ? tip : u, text);
                return (
                  <G key={`ev${i}`}>
                    {arrow([0, 0], tip, eigenTone[i]!, chart.strokeHeavy, 'av')}
                    {arrow([0, 0], u, c.chartInk, chart.strokeLight, 'v')}
                    <MathText
                      text={text}
                      x={at.x}
                      y={at.y}
                      textAnchor="middle"
                      fontSize={chart.label}
                      fontWeight="700"
                      fill={eigenTone[i]!}
                      halo
                    />
                  </G>
                );
              })}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
