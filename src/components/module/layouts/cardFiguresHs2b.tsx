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
import { VIEW, planeBasis, planeOf, project, sectionOf, type V3 } from './solidCutMath';
import { BOX, TRI_H, TRI_W, arcPath, layTriangles, partPoints, type Q } from './cardHs2bMath';

/** [width, height] of a group H2B card figure, or undefined for any other. */
export function hs2bFigureSize(f: CardFigure): [number, number] | undefined {
  if (f.kind === 'markedTriangles') return [TRI_W, TRI_H];
  if (f.kind === 'construction') return [BOX, BOX];
  if (f.kind === 'solidCut') return [CUT_W, CUT_H];
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
  if (f.kind === 'solidCut') return <SolidCut f={f} ink={ink} shade={shade} />;
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
          [x, y] = inside(v, p, q, part.r ?? 16);
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

const CUT_W = 96;
const CUT_H = 84;

function SolidCut({
  f,
  ink,
  shade,
}: {
  f: Extract<CardFigure, { kind: 'solidCut' }>;
  ink: string;
  shade: string;
}) {
  const S = 21;
  const at = (p: V3): Q => {
    const [x, y] = project(p);
    return [CUT_W / 2 + x * S, CUT_H / 2 + 2 - y * S];
  };
  const pts = (ps: V3[]) => ps.map((p) => at(p).join(',')).join(' ');
  const { n, d } = planeOf(f);
  const [u, v] = planeBasis(n);
  const c0: V3 = [n[0] * d, n[1] * d, n[2] * d];
  const k = 1.45;
  const quad: V3[] = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([a, b]) => [
    c0[0] + (u[0] * a! + v[0] * b!) * k,
    c0[1] + (u[1] * a! + v[1] * b!) * k,
    c0[2] + (u[2] * a! + v[2] * b!) * k,
  ]);
  const section = sectionOf(f, 180);
  const line = (a: V3, b: V3, key: string, hidden = false) => (
    <Line
      key={key}
      x1={at(a)[0]}
      y1={at(a)[1]}
      x2={at(b)[0]}
      y2={at(b)[1]}
      stroke={ink}
      strokeWidth={hidden ? 1 : chart.strokeLight}
      strokeDasharray={hidden ? '3 2' : undefined}
      opacity={hidden ? 0.55 : 1}
      strokeLinecap="round"
    />
  );
  /** A level circle of radius r at height y: its front part solid, its back dashed (`back`). */
  const ring = (y: number, r: number, key: string, back = true) => {
    const around = Array.from({ length: 73 }, (_, i) => (2 * Math.PI * i) / 72);
    const front = (t: number) => Math.cos(t) * VIEW[0] + Math.sin(t) * VIEW[2] >= 0;
    const run = (keep: (t: number) => boolean) =>
      around
        .map((t, i) => {
          const p = at([r * Math.cos(t), y, r * Math.sin(t)]);
          const prev = i > 0 && keep(around[i - 1]!);
          return keep(t) ? `${prev ? 'L' : 'M'} ${p[0]} ${p[1]}` : '';
        })
        .join(' ');
    return (
      <G key={key}>
        <Path d={run(front)} stroke={ink} strokeWidth={chart.strokeLight} fill="none" />
        {/* The back half dashed (hidden), or solid on a top face seen from above. */}
        <Path
          d={run((t) => !front(t))}
          stroke={ink}
          strokeWidth={back ? 1 : chart.strokeLight}
          strokeDasharray={back ? '3 2' : undefined}
          opacity={back ? 0.55 : 1}
          fill="none"
        />
      </G>
    );
  };
  /** The points of a level circle at the left and right edges of the view. */
  const sides = (y: number, r: number): [V3, V3] => {
    const ps = Array.from({ length: 360 }, (_, i): V3 => {
      const t = (Math.PI * i) / 180;
      return [r * Math.cos(t), y, r * Math.sin(t)];
    });
    const xs = ps.map((p) => project(p)[0]);
    return [ps[xs.indexOf(Math.min(...xs))]!, ps[xs.indexOf(Math.max(...xs))]!];
  };
  const outline = (() => {
    switch (f.solid) {
      case 'cube':
      case 'pyramid': {
        const { verts, faces } = POLYHEDRA[f.solid];
        const front = faces.map((fc) => {
          const [a, b, c] = fc.map((i) => verts[i]!) as [V3, V3, V3];
          const nrm = cross3(sub3(b, a), sub3(c, a));
          return nrm[0] * VIEW[0] + nrm[1] * VIEW[1] + nrm[2] * VIEW[2] > 1e-9;
        });
        const seen = new Map<string, boolean>();
        faces.forEach((fc, i) =>
          fc.forEach((a, j) => {
            const b = fc[(j + 1) % fc.length]!;
            const key = a < b ? `${a}-${b}` : `${b}-${a}`;
            seen.set(key, (seen.get(key) ?? false) || front[i]!);
          }),
        );
        return [...seen].map(([key, visible]) => {
          const [a, b] = key.split('-').map(Number) as [number, number];
          return line(verts[a]!, verts[b]!, key, !visible);
        });
      }
      case 'cylinder': {
        const [l, r] = sides(1, 1);
        return [
          ring(1, 1, 'top', false),
          ring(-1, 1, 'bottom'),
          line([l[0], -1, l[2]], l, 'l'),
          line([r[0], -1, r[2]], r, 'r'),
        ];
      }
      case 'cone': {
        // The sides run from the tip to the base where the view's edge touches it.
        const tip = at([0, 1, 0]);
        const base = Array.from({ length: 360 }, (_, i): V3 => {
          const t = (Math.PI * i) / 180;
          return [Math.cos(t), -1, Math.sin(t)];
        });
        const turn = base.map((p) => {
          const q = at(p);
          return Math.atan2(q[0] - tip[0], q[1] - tip[1]);
        });
        const l = base[turn.indexOf(Math.min(...turn))]!;
        const r = base[turn.indexOf(Math.max(...turn))]!;
        return [ring(-1, 1, 'base'), line([0, 1, 0], l, 'l'), line([0, 1, 0], r, 'r')];
      }
      case 'sphere':
        return [
          <Circle
            key="o"
            cx={at([0, 0, 0])[0]}
            cy={at([0, 0, 0])[1]}
            r={S}
            fill="none"
            stroke={ink}
            strokeWidth={chart.strokeLight}
          />,
          ring(0, 1, 'eq'),
        ];
    }
  })();
  return (
    <G>
      <Polygon points={pts(quad)} fill={shade} fillOpacity={0.12} stroke={shade} strokeWidth={1} />
      {outline}
      {section.length ? (
        <Polygon
          points={pts(section)}
          fill={shade}
          fillOpacity={0.55}
          stroke={shade}
          strokeWidth={chart.strokeLight}
          strokeLinejoin="round"
        />
      ) : null}
    </G>
  );
}

const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross3 = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** Corners and faces (counterclockwise seen from outside) of the flat-faced solids. */
const POLYHEDRA: Record<'cube' | 'pyramid', { verts: V3[]; faces: number[][] }> = {
  cube: {
    verts: [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1],
    ],
    faces: [
      [0, 3, 2, 1],
      [4, 5, 6, 7],
      [0, 1, 5, 4],
      [3, 7, 6, 2],
      [0, 4, 7, 3],
      [1, 2, 6, 5],
    ],
  },
  pyramid: {
    verts: [
      [-1, -1, -1],
      [1, -1, -1],
      [1, -1, 1],
      [-1, -1, 1],
      [0, 1, 0],
    ],
    faces: [
      [0, 1, 2, 3],
      [0, 4, 1],
      [1, 4, 2],
      [2, 4, 3],
      [3, 4, 0],
    ],
  },
};
