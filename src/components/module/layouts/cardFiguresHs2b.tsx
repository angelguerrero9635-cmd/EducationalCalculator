/**
 * Group H2B's card figures (H96, `typesHs2b.ts`) for sort cards and sequence stages: two marked
 * triangles, construction stages and cross sections. Flat, in the card's ink, with the lit or
 * shaded parts in `shade`. The geometry is in cardHs2bMath.ts.
 */
import { Circle, G, Line, Path, Polygon, Text as SvgText } from 'react-native-svg';

import type { CardFigure } from '@/data/modules/layouts';
import { formatNumber } from '@/engine/format';
import { chart } from '@/theme';

import { Arcs, RightMark, Ticks, inside, type Pt } from '../reps/geoMarks';
import { BOX, TRI_H, TRI_W, arcPath, layTriangles, partPoints, type Q } from './cardHs2bMath';

/** [width, height] of a group H2B card figure, or undefined for any other. */
export function hs2bFigureSize(f: CardFigure): [number, number] | undefined {
  if (f.kind === 'markedTriangles') return [TRI_W, TRI_H];
  if (f.kind === 'construction') return [BOX, BOX];
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
  if (f.kind === 'construction') return <Construction f={f} ink={ink} shade={shade} />;
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

function Construction({
  f,
  ink,
  shade,
}: {
  f: Extract<CardFigure, { kind: 'construction' }>;
  ink: string;
  shade: string;
}) {
  const P = (n: string): Q => {
    const p = f.points[n] ?? [50, 50];
    return [p[0] + 2, p[1] + 2];
  };
  const names = Object.keys(f.points);
  const mid: Q = [
    names.reduce((t, n) => t + P(n)[0], 0) / (names.length || 1),
    names.reduce((t, n) => t + P(n)[1], 0) / (names.length || 1),
  ];
  const lit = (id: string | undefined) => !!id && !!f.lit?.includes(id);
  const col = (id: string | undefined) => (lit(id) ? shade : ink);
  const width = (id: string | undefined, base: number) => (lit(id) ? base + 1 : base);
  /** A segment's ends, run on past them for a ray or a line. */
  const ends = (ab: string, kind: 'segment' | 'ray' | 'line'): [Q, Q] => {
    const [p, q] = [P(ab[0]!), P(ab[1]!)];
    if (kind === 'segment') return [p, q];
    const d = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
    const u: Q = [(q[0] - p[0]) / d, (q[1] - p[1]) / d];
    const run = 12;
    return [
      kind === 'line' ? [p[0] - u[0] * run, p[1] - u[1] * run] : p,
      [q[0] + u[0] * run, q[1] + u[1] * run],
    ];
  };
  const shown = f.named ?? names;
  // Every straight line drawn, so a letter can sit clear of them.
  const drawn: [Q, Q][] = f.parts.flatMap((part) =>
    'segment' in part
      ? [ends(part.segment, 'segment')]
      : 'ray' in part
        ? [ends(part.ray, 'ray')]
        : 'line' in part
          ? [ends(part.line, 'line')]
          : [],
  );
  const clear = (x: number, y: number) =>
    Math.min(
      ...drawn.map(([p, q]) => {
        const dx = q[0] - p[0];
        const dy = q[1] - p[1];
        const t = Math.max(
          0,
          Math.min(1, ((x - p[0]) * dx + (y - p[1]) * dy) / (dx * dx + dy * dy || 1)),
        );
        return Math.hypot(x - p[0] - dx * t, y - p[1] - dy * t);
      }),
      99,
    );
  /** A letter's place: out from the middle, or turned up to 90° either way for more room. */
  const nameAt = (p: Q): Q => {
    const away = Math.atan2(p[1] - mid[1], p[0] - mid[0]);
    const spots = [0, 0.8, -0.8, 1.6, -1.6].map((k): Q => {
      const a = away + k;
      return [p[0] + Math.cos(a) * 9, p[1] + Math.sin(a) * 9];
    });
    return spots.reduce((b, q, i) => (clear(...q) - i * 0.3 > clear(...b) + 0.5 ? q : b));
  };
  return (
    <G>
      {f.parts.map((part, i) => {
        const id = part.id;
        if ('fill' in part)
          return (
            <Polygon
              key={i}
              points={partPoints(part.fill)
                .map((n) => P(n).join(','))
                .join(' ')}
              fill={lit(id) ? shade : ink}
              fillOpacity={lit(id) ? 0.3 : 0.08}
            />
          );
        if ('segment' in part || 'ray' in part || 'line' in part) {
          const kind = 'segment' in part ? 'segment' : 'ray' in part ? 'ray' : 'line';
          const ab = 'segment' in part ? part.segment : 'ray' in part ? part.ray : part.line;
          const dashed = 'dashed' in part && part.dashed;
          const [p, q] = ends(ab, kind);
          return (
            <Line
              key={i}
              x1={p[0]}
              y1={p[1]}
              x2={q[0]}
              y2={q[1]}
              stroke={col(id)}
              strokeWidth={width(id, chart.strokeLight)}
              strokeDasharray={dashed ? '4 3' : undefined}
              strokeLinecap="round"
            />
          );
        }
        if ('circle' in part) {
          const c = P(part.circle);
          const t = P(part.through);
          return (
            <Circle
              key={i}
              cx={c[0]}
              cy={c[1]}
              r={Math.hypot(t[0] - c[0], t[1] - c[1])}
              fill="none"
              stroke={col(id)}
              strokeWidth={width(id, chart.strokeLight)}
            />
          );
        }
        if ('compass' in part) {
          const c = P(part.compass);
          const d =
            'from' in part
              ? arcPath(c, P(part.from), P(part.to), 8)
              : arcPath(c, P(part.through), P(part.through), (part.span ?? 50) / 2);
          return (
            <Path
              key={i}
              d={d}
              fill="none"
              stroke={col(id)}
              strokeWidth={width(id, 1.2)}
              strokeLinecap="round"
            />
          );
        }
        if ('dot' in part) {
          const p = P(part.dot);
          return <Circle key={i} cx={p[0]} cy={p[1]} r={lit(id) ? 3.5 : 2.5} fill={col(id)} />;
        }
        if ('ticks' in part) {
          const [a, b] = partPoints(part.ticks);
          return <Ticks key={i} p={P(a!)} q={P(b!)} count={part.count} color={col(id)} />;
        }
        if ('arcs' in part || 'right' in part) {
          const [p, v, q] = partPoints('arcs' in part ? part.arcs : part.right).map(P) as [Q, Q, Q];
          return 'right' in part ? (
            <RightMark key={i} v={v} p={p} q={q} size={6} color={col(id)} />
          ) : (
            <Arcs
              key={i}
              v={v}
              p={p}
              q={q}
              count={part.count}
              r={9}
              color={col(id)}
              fill={lit(id) ? shade : undefined}
            />
          );
        }
        // A text: in the angle, or beside the point (away from the figure's middle).
        const at = partPoints(part.at).map(P);
        let x: number;
        let y: number;
        if (at.length === 3) {
          const [p, v, q] = at as [Q, Q, Q];
          [x, y] = inside(v, p, q, 16);
        } else {
          const p = at[0]!;
          const d = Math.hypot(p[0] - mid[0], p[1] - mid[1]) || 1;
          [x, y] = [p[0] + ((p[0] - mid[0]) / d) * 9, p[1] + ((p[1] - mid[1]) / d) * 9];
        }
        return (
          <SvgText
            key={i}
            x={Math.max(5, Math.min(BOX - 5, x))}
            y={y + 4}
            fontSize={chart.label}
            fontWeight="700"
            fill={col(id)}
            textAnchor="middle"
          >
            {part.text}
          </SvgText>
        );
      })}
      {shown.map((n) => {
        const p = P(n);
        const [x, y] = nameAt(p);
        return (
          <G key={`n${n}`}>
            <Circle cx={p[0]} cy={p[1]} r={2} fill={ink} />
            <SvgText
              x={Math.max(5, Math.min(BOX - 5, x))}
              y={Math.max(11, Math.min(BOX - 1, y + 4))}
              fontSize={chart.label}
              fontWeight="700"
              fill={ink}
              textAnchor="middle"
            >
              {n}
            </SvgText>
          </G>
        );
      })}
    </G>
  );
}
