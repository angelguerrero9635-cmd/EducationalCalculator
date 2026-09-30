import { View } from 'react-native';
import Svg, { Circle, G, Line, Polygon } from 'react-native-svg';

import type { MarkedFigureSpec } from '@/data/modules/typesHsc';
import type { RegularPolygon as Spec } from '@/data/modules/typesHs2b';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { Arcs, inside, type Pt } from './geoMarks';
import { buildRegular, cornerName } from './regularGeo';

/** Polygon names by side count; others are "n-gons". */
const NAMES: Record<number, string> = {
  3: 'triangle',
  4: 'quadrilateral (a square)',
  5: 'pentagon',
  6: 'hexagon',
  7: 'heptagon',
  8: 'octagon',
  9: 'nonagon',
  10: 'decagon',
  12: 'dodecagon',
};

const n2 = (x: number) => formatNumber(Number(x.toFixed(2)));

/**
 * `markedFigure` `regular` (H96, spec in `typesHs2b.ts`): a regular polygon drawn from its
 * number of sides, cut into n − 2 triangles by the diagonals from A (each 180°, so the interior
 * angles add to (n − 2) × 180°), with the interior angle at B and, past B, the exterior angle
 * (360° ÷ n) marked. Flat, like every measured figure.
 */
export function RegularPolygon({ spec, calc }: { spec: MarkedFigureSpec; calc: Calculator }) {
  const r = spec.regular as Spec;
  const c = usePalette();
  const rep = useRep(calc);
  const known = typeof r.sides === 'number' || rep.known(r.sides);
  const n = typeof r.sides === 'number' ? r.sides : known ? rep.val(r.sides) : undefined;
  const fig = buildRegular(n);
  const ok = !fig.reason;
  const all = [...fig.pts, ...(r.exterior ? [fig.E] : [])];
  const box = {
    minX: Math.min(...all.map((p) => p[0])),
    maxX: Math.max(...all.map((p) => p[0])),
    minY: Math.min(...all.map((p) => p[1])),
    maxY: Math.max(...all.map((p) => p[1])),
  };
  const bw = box.maxX - box.minX;
  const bh = box.maxY - box.minY;
  const pad = 26;
  // Room under AB for the row of angle labels.
  const below = r.labels?.interior || r.labels?.exterior ? 34 : 0;
  const scaleOf = (w: number) => Math.min((w - 2 * pad) / bw, (w * 0.74 - 2 * pad - below) / bh);

  return (
    <View>
      <Canvas aspect={(w) => (bh * scaleOf(w) + 2 * pad + below) / w}>
        {({ w, h }) => {
          const s = scaleOf(w);
          const left = (w - bw * s) / 2;
          const P = (p: readonly [number, number]): Pt => [
            left + (p[0] - box.minX) * s,
            pad + (box.maxY - p[1]) * s,
          ];
          const pts = fig.pts.map(P);
          const [A, B, C] = [pts[0]!, pts[1]!, pts[2]!];
          const E = P(fig.E);
          const k = fig.n;
          const middle: Pt = [
            pts.reduce((q, p) => q + p[0], 0) / k,
            pts.reduce((q, p) => q + p[1], 0) / k,
          ];
          const tri = (i: number) => [A, pts[i + 1]!, pts[i + 2]!] as const;
          const interior = r.labels?.interior;
          const exterior = r.labels?.exterior;
          // The angle labels sit in a row under side AB, clear of the fan, each with a
          // leader to its arc: the interior angle's to the left, the exterior angle's right.
          const row = B[1] + 38;
          const intText = interior ? rep.label(interior) : undefined;
          const extText = exterior ? rep.label(exterior) : undefined;
          const wOf = (t: string) => t.length * chart.label * 0.58;
          const intX = intText ? Math.max(wOf(intText) / 2 + 2, B[0] - 14 - wOf(intText) / 2) : 0;
          const extX = extText
            ? Math.min(w - wOf(extText) / 2 - 2, B[0] + 16 + wOf(extText) / 2)
            : 0;
          const intArc = inside(B, A, C, 14);
          const extArc = inside(B, E, C, 20);
          return (
            <Svg width={w} height={h} opacity={ok ? 1 : 0.35}>
              <Polygon
                points={pts.map((p) => p.join(',')).join(' ')}
                fill={c.chartFill}
                opacity={0.5}
              />
              {r.triangles
                ? Array.from({ length: k - 2 }, (_, i) => (
                    <Polygon
                      key={`t${i}`}
                      points={tri(i)
                        .map((p) => p.join(','))
                        .join(' ')}
                      fill={c.chartHighlight}
                      opacity={i % 2 ? 0.08 : 0.2}
                    />
                  ))
                : null}
              {r.triangles
                ? pts
                    .slice(2, k - 1)
                    .map((p, i) => (
                      <Line
                        key={`d${i}`}
                        x1={A[0]}
                        y1={A[1]}
                        x2={p[0]}
                        y2={p[1]}
                        stroke={c.chartHighlight}
                        strokeWidth={chart.strokeLight}
                      />
                    ))
                : null}
              <Polygon
                points={pts.map((p) => p.join(',')).join(' ')}
                fill="none"
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
                strokeLinejoin="round"
              />
              {r.exterior ? (
                <Line
                  x1={B[0]}
                  y1={B[1]}
                  x2={E[0]}
                  y2={E[1]}
                  stroke={c.chartMuted}
                  strokeWidth={chart.stroke}
                  strokeDasharray={chart.dash}
                />
              ) : null}
              {interior || r.exterior ? (
                <Arcs v={B} p={A} q={C} count={1} r={14} color={c.chartInk} fill={c.chartMuted} />
              ) : null}
              {r.exterior ? (
                <Arcs
                  v={B}
                  p={E}
                  q={C}
                  count={1}
                  r={20}
                  color={c.chartSecond}
                  fill={c.chartSecond}
                />
              ) : null}
              {/* Triangle numbers, while each has room for one. */}
              {r.triangles && k <= 12
                ? Array.from({ length: k - 2 }, (_, i) => {
                    const [p, q, t] = tri(i);
                    // Three quarters of the way from A to the far side's middle; a thin
                    // triangle at B gets its number just inside the far side, past B's arcs.
                    const m: Pt = [(q[0] + t[0]) / 2, (q[1] + t[1]) / 2];
                    const d = Math.hypot(m[0] - p[0], m[1] - p[1]) || 1;
                    const f = 0.75;
                    const at: Pt = [p[0] + f * (m[0] - p[0]), p[1] + f * (m[1] - p[1])];
                    const [x, y] =
                      Math.hypot(at[0] - B[0], at[1] - B[1]) > 30
                        ? at
                        : [m[0] + ((p[0] - m[0]) / d) * 12, m[1] + ((p[1] - m[1]) / d) * 12];
                    return (
                      <ChartText
                        key={`n${i}`}
                        x={x}
                        y={y + 4}
                        textAnchor="middle"
                        fontWeight="700"
                        fill={c.chartHighlight}
                      >
                        {i + 1}
                      </ChartText>
                    );
                  })
                : null}
              {(Math.hypot(C[0] - B[0], C[1] - B[1]) > 36 ? [0, 1, 2] : [0, 1]).map((i) => {
                const p = pts[i]!;
                const d = Math.hypot(p[0] - middle[0], p[1] - middle[1]) || 1;
                const x = p[0] + ((p[0] - middle[0]) / d) * 13;
                const y = p[1] + ((p[1] - middle[1]) / d) * 13 + 5;
                return (
                  <G key={`c${i}`}>
                    <Circle cx={p[0]} cy={p[1]} r={2.5} fill={c.chartInk} />
                    <ChartText
                      {...fitLabel(x, cornerName(i), chart.label, w)}
                      y={y}
                      fontWeight="700"
                    >
                      {cornerName(i)}
                    </ChartText>
                  </G>
                );
              })}
              {ok && intText ? (
                <G>
                  <Line
                    x1={intArc[0]}
                    y1={intArc[1]}
                    x2={Math.min(intX + wOf(intText) / 2, B[0] - 6)}
                    y2={row - 12}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                  />
                  <ChartText x={intX} y={row} textAnchor="middle" fontWeight="700">
                    {intText}
                  </ChartText>
                </G>
              ) : null}
              {ok && extText ? (
                <G>
                  <Line
                    x1={extArc[0]}
                    y1={extArc[1]}
                    x2={Math.max(extX - wOf(extText) / 2, B[0] + 8)}
                    y2={row - 12}
                    stroke={c.chartSecond}
                    strokeWidth={1}
                  />
                  <ChartText x={extX} y={row} textAnchor="middle" fontWeight="700">
                    {extText}
                  </ChartText>
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{captionOf()}</Caption>
    </View>
  );

  function captionOf(): string {
    if (fig.reason) return `Can't draw it: ${fig.reason}`;
    const k = fig.n;
    const name = NAMES[k] ?? `${k}-gon`;
    const sym = (id: string | undefined, word: string) => (id ? rep.variable(id).symbol : word);
    const nSym = typeof r.sides === 'string' ? rep.variable(r.sides).symbol : 'n';
    const lines = [`A regular ${name}: ${k} equal sides and ${k} equal angles.`];
    if (r.triangles)
      lines.push(
        `Diagonals from A: ${nSym} − 2 = ${k - 2} triangle${k - 2 === 1 ? '' : 's'}, 180° each.`,
      );
    lines.push(`Interior sum: ${sym(r.labels?.sum, 'S')} = ${k - 2} × 180° = ${n2(fig.sum)}°.`);
    if (r.labels?.interior)
      lines.push(
        `Each angle: ${sym(r.labels.interior, 'e')} = ${n2(fig.sum)}° ÷ ${k} = ${n2(fig.interior)}°.`,
      );
    if (r.exterior)
      lines.push(
        `Each exterior angle: ${sym(r.labels?.exterior, 'x')} = 360° ÷ ${k} = ${n2(fig.exterior)}°, and the ${k} of them add to 360°.`,
      );
    return lines.join(' · ');
  }
}
