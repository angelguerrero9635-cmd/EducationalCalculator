/**
 * Group H2B's card figures (H96, `typesHs2b.ts`) for sort cards and sequence stages: two marked
 * triangles, construction stages and cross sections. Flat, in the card's ink, with the lit or
 * shaded parts in `shade`. The geometry is in cardHs2bMath.ts.
 */
import { G, Polygon, Text as SvgText } from 'react-native-svg';

import type { CardFigure } from '@/data/modules/layouts';
import { formatNumber } from '@/engine/format';
import { chart } from '@/theme';

import { Arcs, RightMark, Ticks, type Pt } from '../reps/geoMarks';
import { TRI_H, TRI_W, layTriangles, type Q } from './cardHs2bMath';

/** [width, height] of a group H2B card figure, or undefined for any other. */
export function hs2bFigureSize(f: CardFigure): [number, number] | undefined {
  if (f.kind === 'markedTriangles') return [TRI_W, TRI_H];
  return undefined;
}

const SIDES = [
  ['a', 1, 2],
  ['b', 2, 0],
  ['c', 0, 1],
] as const;
const CORNERS = [
  ['A', 0, 2, 1],
  ['B', 1, 0, 2],
  ['C', 2, 1, 0],
] as const;

export function Hs2bCardView({ f, ink, shade }: { f: CardFigure; ink: string; shade: string }) {
  if (f.kind === 'markedTriangles') return <MarkedTriangles f={f} ink={ink} shade={shade} />;
  return null;
}

function MarkedTriangles({
  f,
  ink,
  shade,
}: {
  f: Extract<CardFigure, { kind: 'markedTriangles' }>;
  ink: string;
  shade: string;
}) {
  const tris = layTriangles(f);
  if (!tris) return null;
  return (
    <G>
      {tris.map((t, k) => {
        const mid: Q = [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3];
        /** A point `gap` px out from the triangle's middle past p. */
        const out = (p: Q, gap: number): Q => {
          const d = Math.hypot(p[0] - mid[0], p[1] - mid[1]) || 1;
          return [p[0] + ((p[0] - mid[0]) / d) * gap, p[1] + ((p[1] - mid[1]) / d) * gap];
        };
        return (
          <G key={k}>
            <Polygon
              points={t.map((p) => p.join(',')).join(' ')}
              fill={shade}
              fillOpacity={0.14}
              stroke={ink}
              strokeWidth={chart.strokeLight}
              strokeLinejoin="round"
            />
            {SIDES.map(([s, i, j]) =>
              f.ticks?.[s] ? (
                <Ticks key={s} p={t[i] as Pt} q={t[j] as Pt} count={f.ticks[s]!} color={ink} />
              ) : null,
            )}
            {CORNERS.map(([n, v, p, q]) =>
              f.right?.includes(n) ? (
                <RightMark key={n} v={t[v]} p={t[p]} q={t[q]} size={6} color={ink} />
              ) : f.arcs?.[n] ? (
                <Arcs
                  key={n}
                  v={t[v]}
                  p={t[p]}
                  q={t[q]}
                  count={f.arcs[n]!}
                  r={8}
                  color={ink}
                  fill={shade}
                />
              ) : null,
            )}
            {f.lengths
              ? SIDES.map(([s, i, j], m) => {
                  if (Array.isArray(f.lengths) && !f.lengths.includes(s)) return null;
                  const text = formatNumber(f.triangles[k]![m]!);
                  const tw = text.length * chart.label * 0.58;
                  const [p, q] = [t[i], t[j]];
                  const mx = (p[0] + q[0]) / 2;
                  const my = (p[1] + q[1]) / 2;
                  const d = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
                  let [nx, ny] = [-(q[1] - p[1]) / d, (q[0] - p[0]) / d];
                  if ((mid[0] - mx) * nx + (mid[1] - my) * ny > 0) [nx, ny] = [-nx, -ny];
                  const gap = 3 + Math.abs(nx) * (tw / 2) + Math.abs(ny) * 6;
                  const at: Q = [mx + nx * gap, my + ny * gap];
                  return (
                    <SvgText
                      key={`l${s}`}
                      x={at[0]}
                      y={at[1] + 4}
                      fontSize={chart.label}
                      fontWeight="600"
                      fill={ink}
                      textAnchor="middle"
                    >
                      {text}
                    </SvgText>
                  );
                })
              : null}
            {f.names
              ? CORNERS.map(([n, v]) => {
                  const at = out(t[v], 8);
                  const name = k ? String.fromCharCode(n.charCodeAt(0) + 3) : n;
                  return (
                    <SvgText
                      key={`n${n}`}
                      x={at[0]}
                      y={at[1] + 4}
                      fontSize={chart.label}
                      fontWeight="700"
                      fill={ink}
                      textAnchor="middle"
                    >
                      {name}
                    </SvgText>
                  );
                })
              : null}
          </G>
        );
      })}
    </G>
  );
}
