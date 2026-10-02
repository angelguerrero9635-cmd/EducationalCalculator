/**
 * HC50 `graph` (GraphSpec in typesHe3d.ts): a graph in a fixed embedding with degrees or edge
 * costs and its cheapest path lit; a planar graph of the page's V and E when they don't match
 * the embedding; a complete binary tree level by level; a prefix code tree with 0/1 edges. The
 * card figure (GraphCard) draws a small fixed graph. Flat; a lit path is heavy as well as in the
 * highlight, so it reads without colour.
 */
import Svg, { Circle, G, Line, Rect } from 'react-native-svg';

import type { GraphCard, GraphSpec, GraphVertex } from '@/data/modules/typesHe3d';
import { graphCardSize } from '@/data/modules/typesHe3d';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import {
  cheapestPath,
  degreesOf,
  leastHeight,
  planarGraph,
  planarMax,
  prefixCode,
  treeLevels,
  type PlainEdge,
} from './graphMath';
import { fmt4, useReader, VBracket } from './he3dKit';

type Reader = ReturnType<typeof useReader>;

export function GraphDiagram({ spec, calc }: { spec: GraphSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useReader(calc);
  const drawn =
    spec.mode === 'tree'
      ? tree(spec, r, c)
      : spec.mode === 'code'
        ? code(spec, r, c)
        : graph(spec, r, c);
  return (
    <>
      <Canvas aspect={(w) => drawn.h / w}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            {drawn.body(w)}
          </Svg>
        )}
      </Canvas>
      <Caption>{drawn.caption}</Caption>
    </>
  );
}

/** A vertex: a circle with its name or degree in it, lit when on the path. */
function Vertex({
  x,
  y,
  r,
  text,
  lit,
  c,
  ink,
}: {
  x: number;
  y: number;
  r: number;
  text: string;
  lit?: boolean;
  c: Palette;
  ink?: string;
}) {
  return (
    <G>
      <Circle
        cx={x}
        cy={y}
        r={r}
        fill={lit ? c.chartHighlight : c.chartSurface}
        stroke={lit ? c.chartHighlight : (ink ?? c.chartInk)}
        strokeWidth={lit ? chart.strokeHeavy : chart.stroke}
      />
      <ChartText
        x={x}
        y={y + 4.5}
        textAnchor="middle"
        fontSize={chart.label}
        fontWeight="700"
        fill={lit ? c.onChartHighlight : (ink ?? c.chartInk)}
      >
        {text}
      </ChartText>
    </G>
  );
}

// ─── graph ────────────────────────────────────────────────────────────────────

/**
 * Where a vertex's degree badge goes: `dist` px from it, in the middle of the widest angle
 * between its edges (toward the inside of the box when it has none).
 */
function badgeAt(
  v: GraphVertex,
  edges: { from: string; to: string }[],
  at: Map<string, GraphVertex>,
  px: (v: GraphVertex) => number,
  py: (v: GraphVertex) => number,
  dist: number,
): [number, number] {
  const angles = edges
    .flatMap((e) => (e.from === v.name ? [e.to] : e.to === v.name ? [e.from] : []))
    .map((o) => Math.atan2(py(at.get(o)!) - py(v), px(at.get(o)!) - px(v)))
    .sort((a, b) => a - b);
  let best = Math.atan2(0.5 - v.y, 0.5 - v.x) + Math.PI;
  if (angles.length) {
    let gap = -1;
    angles.forEach((a, i) => {
      const next = i + 1 < angles.length ? angles[i + 1]! : angles[0]! + 2 * Math.PI;
      if (next - a > gap) {
        gap = next - a;
        best = (a + next) / 2;
      }
    });
  }
  return [px(v) + dist * Math.cos(best), py(v) + dist * Math.sin(best)];
}

const GH = 236;

function graph(spec: GraphSpec, r: Reader, c: Palette) {
  const V = r.get(spec.V);
  const E = r.get(spec.E);
  const fixed =
    spec.vertices && spec.edges ? { vertices: spec.vertices, edges: spec.edges } : undefined;
  const fits =
    fixed &&
    (V === undefined || V === fixed.vertices.length) &&
    (E === undefined || E === fixed.edges.length);
  let vertices: GraphVertex[] = [];
  let edges: { from: string; to: string; cost?: number; dashed?: boolean; costText?: string }[] =
    [];
  let why: string | undefined;
  if (fits && fixed) {
    vertices = fixed.vertices;
    edges = fixed.edges.map((e) => {
      const cost = r.get(e.cost);
      return { ...e, cost, costText: cost === undefined ? undefined : fmt4(cost) };
    });
  } else if (V !== undefined && E !== undefined) {
    const g = planarGraph(V, E);
    if (g) {
      vertices = g.pos.map((p, i) => ({ name: String.fromCharCode(65 + i), ...p }));
      edges = g.edges.map(([a, b]) => ({ from: vertices[a]!.name, to: vertices[b]!.name }));
    } else if (V > 16) why = `More than 16 vertices are too many to draw here.`;
    else if (E > planarMax(V)) {
      why = `No simple planar graph has ${fmt4(V)} vertices and ${fmt4(E)} edges: at most ${V >= 3 ? `3V − 6 = ${fmt4(planarMax(V))}` : fmt4(planarMax(V))}.`;
    } else why = `With fewer than V − 1 = ${fmt4(V - 1)} edges the graph can’t be connected.`;
  }
  const names = vertices.map((v) => v.name);
  const deg = degreesOf(names, edges);
  const generated = !(fits && fixed);
  const best =
    spec.best && edges.every((e) => e.cost !== undefined)
      ? cheapestPath(names, edges as PlainEdge[], spec.best.from, spec.best.to)
      : undefined;
  const onPath = (a: string, b: string) => {
    if (!best) return false;
    const i = best.path.indexOf(a);
    return i >= 0 && (best.path[i + 1] === b || best.path[i - 1] === b);
  };
  const body = (w: number) => {
    const R = 13;
    const px = (v: GraphVertex) => 24 + v.x * (w - 48);
    const py = (v: GraphVertex) => 32 + v.y * (GH - 64);
    const at = new Map(vertices.map((v) => [v.name, v]));
    return (
      <G>
        {edges.map((e, i) => {
          const a = at.get(e.from)!;
          const b = at.get(e.to)!;
          const lit = onPath(e.from, e.to);
          return (
            <Line
              key={i}
              x1={px(a)}
              y1={py(a)}
              x2={px(b)}
              y2={py(b)}
              stroke={lit ? c.chartHighlight : e.dashed ? c.chartMuted : c.chartInk}
              strokeWidth={lit ? chart.strokeHeavy + 1 : chart.stroke}
              strokeDasharray={e.dashed ? chart.dash : undefined}
            />
          );
        })}
        {edges.map((e, i) => {
          if (!e.costText) return null;
          const a = at.get(e.from)!;
          const b = at.get(e.to)!;
          return (
            <ChartText
              key={`c${i}`}
              x={(px(a) + px(b)) / 2}
              y={(py(a) + py(b)) / 2 + 4}
              textAnchor="middle"
              fontSize={chart.value}
              fontWeight="700"
              fill={onPath(e.from, e.to) ? c.chartHighlight : c.chartInk}
              halo
            >
              {e.costText}
            </ChartText>
          );
        })}
        {vertices.map((v) => {
          const d = String(deg.get(v.name) ?? 0);
          const lit = best?.path.includes(v.name);
          return (
            <G key={v.name}>
              <Vertex
                x={px(v)}
                y={py(v)}
                r={R}
                text={generated && spec.degrees ? d : v.name}
                lit={lit}
                c={c}
              />
              {spec.degrees && !generated
                ? (() => {
                    // In the widest gap between the vertex's edges, so it sits on no line.
                    const [ax, ay] = badgeAt(v, edges, at, px, py, R + 10);
                    const bx = Math.min(w - 10, Math.max(10, ax));
                    const by = Math.min(GH - 10, Math.max(10, ay));
                    return (
                      <G>
                        <Circle cx={bx} cy={by} r={8} fill={c.chartSecond} />
                        <ChartText
                          x={bx}
                          y={by + 4}
                          textAnchor="middle"
                          fontSize={chart.label}
                          fontWeight="700"
                          fill={c.chartInk}
                        >
                          {d}
                        </ChartText>
                      </G>
                    );
                  })()
                : null}
            </G>
          );
        })}
      </G>
    );
  };
  const parts: string[] = [];
  if (why) parts.push(why);
  if (vertices.length) {
    const sum = [...deg.values()].reduce((s, x) => s + x, 0);
    if (spec.degrees) {
      parts.push(
        `${generated ? 'Each vertex shows its degree' : 'Each degree is written beside its vertex'}; they add to ${sum} = 2 × ${edges.length}, since every edge has two ends.`,
      );
    }
    if (r.get(spec.F) !== undefined) {
      const F = r.get(spec.F)!;
      parts.push(
        `V − E + F = 2: ${vertices.length} − ${edges.length} + ${fmt4(F)} = 2, counting the outer face.`,
      );
    }
    if (best) {
      const costs = best.path.slice(1).map((b, i) => {
        const a = best.path[i]!;
        return edges.find((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a))!
          .cost!;
      });
      parts.push(
        `The cheapest path ${best.path.join('–')} costs ${costs.map(fmt4).join(' + ')} = ${fmt4(best.cost)}.`,
      );
    }
  }
  return { h: GH, body, caption: parts.join(' ') || 'Type V and E to draw a graph.' };
}

// ─── tree ─────────────────────────────────────────────────────────────────────

function tree(spec: GraphSpec, r: Reader, c: Palette) {
  const n = r.get(spec.n);
  const h = r.get(spec.h);
  const hmin = n !== undefined && n >= 1 ? leastHeight(n) : undefined;
  const top = Math.min(10, Math.max(hmin ?? 0, h !== undefined && h >= 0 ? h : 0));
  const levels = top + 1;
  const counts = treeLevels(n ?? 0, levels);
  const RH = Math.min(34, 220 / levels);
  const H = 24 + levels * RH + 26;
  const body = (w: number) => {
    const L = 52;
    const Rw = 70;
    const W = w - L - Rw;
    const y = (k: number) => 22 + k * RH + RH / 2;
    const xs = (k: number, i: number) => L + ((i + 0.5) * W) / 2 ** k;
    return (
      <G>
        <ChartText x={L - 26} y={14} textAnchor="middle" fontSize={chart.label} fill={c.chartMuted}>
          level
        </ChartText>
        <ChartText
          x={w - Rw / 2}
          y={14}
          textAnchor="middle"
          fontSize={chart.label}
          fill={c.chartMuted}
        >
          nodes
        </ChartText>
        {counts.map((cnt, k) => {
          const slots = 2 ** k;
          const rr = Math.min(8, W / slots / 2 - 1);
          const dots = slots <= 32;
          return (
            <G key={k}>
              <ChartText x={L - 26} y={y(k) + 4} textAnchor="middle" fontSize={chart.label}>
                {String(k)}
              </ChartText>
              {dots && k > 0
                ? Array.from({ length: slots }, (_, i) => (
                    <Line
                      key={`e${i}`}
                      x1={xs(k - 1, i >> 1)}
                      y1={y(k - 1)}
                      x2={xs(k, i)}
                      y2={y(k)}
                      stroke={i < cnt ? c.chartInk : c.chartGrid}
                      strokeWidth={i < cnt ? chart.strokeLight : 1}
                      strokeDasharray={i < cnt ? undefined : chart.dashFine}
                    />
                  ))
                : null}
              {dots ? (
                Array.from({ length: slots }, (_, i) => (
                  <Circle
                    key={i}
                    cx={xs(k, i)}
                    cy={y(k)}
                    r={rr}
                    fill={i < cnt ? c.chartHighlight : c.chartSurface}
                    stroke={i < cnt ? c.chartHighlight : c.chartGrid}
                    strokeWidth={1}
                    strokeDasharray={i < cnt ? undefined : '2 2'}
                  />
                ))
              ) : (
                <G>
                  <Rect
                    x={L}
                    y={y(k) - 7}
                    width={W}
                    height={14}
                    fill={c.chartSurface}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                    strokeDasharray="2 2"
                  />
                  <Rect
                    x={L}
                    y={y(k) - 7}
                    width={(W * cnt) / slots}
                    height={14}
                    fill={c.chartHighlight}
                  />
                </G>
              )}
              <ChartText x={w - Rw / 2} y={y(k) + 4} textAnchor="middle" fontSize={chart.label}>
                {cnt === slots ? String(cnt) : `${cnt} of ${slots}`}
              </ChartText>
            </G>
          );
        })}
        {hmin !== undefined && hmin > 0 ? (
          <G>
            <VBracket x={8} y1={y(0)} y2={y(hmin)} side="left" />
            <ChartText
              x={4}
              y={y(hmin) + RH / 2 + 12}
              fontSize={chart.label}
              fontWeight="700"
              fill={c.chartHighlight}
            >
              {`h_min = ${hmin}`}
            </ChartText>
          </G>
        ) : null}
      </G>
    );
  };
  const parts: string[] = [];
  if (n !== undefined && hmin !== undefined) {
    parts.push(
      `Filled level by level, ${fmt4(n)} nodes reach level ${hmin}: h_min = ⌈log₂(${fmt4(n)} + 1)⌉ − 1 = ${hmin}.`,
    );
  }
  if (h !== undefined && h >= 0 && h <= 62) {
    parts.push(
      `A tree of height ${fmt4(h)} holds at most 2^${fmt4(h + 1)} − 1 = ${fmt4(2 ** (h + 1) - 1)} nodes, ${fmt4(2 ** h)} of them leaves.`,
    );
  }
  if (h !== undefined && h > 10) parts.push('Levels past 10 are left out.');
  return { h: H, body, caption: parts.join(' ') || 'Type n to fill the tree.' };
}

// ─── code tree ────────────────────────────────────────────────────────────────

function code(spec: GraphSpec, r: Reader, c: Palette) {
  const lengths = (spec.lengths ?? []).map((x) => r.get(x));
  const probs = (spec.probs ?? []).map((x) => r.get(x));
  const names = (spec.lengths ?? []).map((_, i) => spec.names?.[i] ?? `s${i + 1}`);
  const known = lengths.every((l): l is number => l !== undefined);
  const { kraft, codes } = known ? prefixCode(lengths) : { kraft: undefined, codes: undefined };
  const depth = known ? Math.max(1, ...lengths) : 1;
  const RH = Math.min(46, 170 / depth);
  const H = 26 + depth * RH + 58;
  // The tree's nodes: every prefix of a codeword; a branch no codeword uses ends "unused".
  const prefixes = new Set<string>(['']);
  for (const cw of codes ?? []) for (let i = 1; i <= cw.length; i++) prefixes.add(cw.slice(0, i));
  const leafOf = new Map((codes ?? []).map((cw, i) => [cw, i]));
  // Leaves left to right (in-order), for x positions: codewords and unused stubs.
  const order: string[] = [];
  const walk = (p: string) => {
    if (leafOf.has(p) || !prefixes.has(p)) return void order.push(p);
    walk(`${p}0`);
    walk(`${p}1`);
  };
  if (codes) walk('');
  const body = (w: number) => {
    if (!codes) return <G />;
    const slot = (w - 24) / Math.max(1, order.length);
    const xOf = new Map<string, number>();
    const place = (p: string): number => {
      if (order.includes(p)) {
        const x = 12 + (order.indexOf(p) + 0.5) * slot;
        xOf.set(p, x);
        return x;
      }
      const x = (place(`${p}0`) + place(`${p}1`)) / 2;
      xOf.set(p, x);
      return x;
    };
    place('');
    const y = (d: number) => 20 + d * RH;
    const nodes = [...xOf.keys()];
    return (
      <G>
        {nodes
          .filter((p) => p !== '')
          .map((p) => {
            const parent = p.slice(0, -1);
            const used = prefixes.has(p);
            const [x1, y1, x2, y2] = [xOf.get(parent)!, y(parent.length), xOf.get(p)!, y(p.length)];
            return (
              <G key={p}>
                <Line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={used ? c.chartInk : c.chartMuted}
                  strokeWidth={used ? chart.stroke : 1}
                  strokeDasharray={used ? undefined : chart.dash}
                />
                <ChartText
                  x={(x1 + x2) / 2 + (p.endsWith('0') ? -9 : 9)}
                  y={(y1 + y2) / 2 + 2}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fontWeight="700"
                  fill={c.chartHighlight}
                  halo
                >
                  {p.slice(-1)}
                </ChartText>
              </G>
            );
          })}
        {nodes.map((p) => {
          const i = leafOf.get(p);
          const x = xOf.get(p)!;
          const yy = y(p.length);
          if (i === undefined) {
            return prefixes.has(p) ? (
              <Circle key={p} cx={x} cy={yy} r={4} fill={c.chartInk} />
            ) : (
              <G key={p}>
                <Circle
                  cx={x}
                  cy={yy}
                  r={6}
                  fill="none"
                  stroke={c.chartMuted}
                  strokeDasharray="2 2"
                />
                <ChartText
                  x={x}
                  y={yy + 20}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fill={c.chartMuted}
                >
                  unused
                </ChartText>
              </G>
            );
          }
          const p_ = probs[i];
          return (
            <G key={p}>
              <Rect x={x - 13} y={yy - 11} width={26} height={22} rx={4} fill={c.chartHighlight} />
              <ChartText
                x={x}
                y={yy + 5}
                textAnchor="middle"
                fontSize={chart.label}
                fontWeight="700"
                fill={c.onChartHighlight}
              >
                {names[i]!}
              </ChartText>
              <ChartText
                x={x}
                y={yy + 26}
                textAnchor="middle"
                fontSize={chart.label}
                fontWeight="700"
              >
                {p}
              </ChartText>
              {p_ !== undefined ? (
                <ChartText
                  x={x}
                  y={yy + 41}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fill={c.chartMuted}
                >
                  {fmt4(p_)}
                </ChartText>
              ) : null}
            </G>
          );
        })}
      </G>
    );
  };
  const parts: string[] = [];
  if (known && kraft !== undefined) {
    const terms = lengths.map((l) => `2^(−${fmt4(l)})`).join(' + ');
    if (!codes) {
      parts.push(
        kraft > 1
          ? `No prefix code has these lengths: the Kraft sum ${terms} = ${fmt4(kraft)} is past 1.`
          : 'Each length must be a whole number of bits from 1 to 8.',
      );
    } else {
      parts.push(
        `Each symbol is a leaf, its codeword the 0s and 1s on the way down; no codeword starts another.`,
      );
      parts.push(
        `Kraft sum: ${terms} = ${fmt4(kraft)}${kraft < 1 - 1e-12 ? ' (below 1: a branch is unused)' : ''}.`,
      );
      if (probs.every((p) => p !== undefined) && probs.length === lengths.length) {
        const L = probs.reduce((s, p, i) => s + p! * lengths[i]!, 0);
        parts.push(
          `L = ${probs.map((p, i) => `${fmt4(p!)} × ${fmt4(lengths[i]!)}`).join(' + ')} = ${fmt4(L)} bits.`,
        );
      }
    }
  }
  return { h: H, body, caption: parts.join(' ') || 'Type the codeword lengths to draw the code.' };
}

// ─── card ─────────────────────────────────────────────────────────────────────

/** A small fixed graph on a card, in the card's ink; lit parts in the highlight and heavy. */
export function GraphCardView({ f, ink }: { f: GraphCard; ink: string }) {
  const c = usePalette();
  const [w, h] = graphCardSize(f);
  const R = f.wide ? 10 : 8;
  const m = f.wide ? 16 : 11;
  const px = (v: GraphVertex) => m + v.x * (w - 2 * m);
  const py = (v: GraphVertex) => m + v.y * (h - 2 * m);
  const at = new Map(f.vertices.map((v) => [v.name, v]));
  const deg = degreesOf(
    f.vertices.map((v) => v.name),
    f.edges,
  );
  const lit = new Set(f.lit ?? []);
  return (
    <G>
      {f.edges.map((e, i) => {
        const a = at.get(e.from)!;
        const b = at.get(e.to)!;
        return (
          <Line
            key={i}
            x1={px(a)}
            y1={py(a)}
            x2={px(b)}
            y2={py(b)}
            stroke={e.lit ? c.chartHighlight : ink}
            strokeWidth={e.lit ? chart.strokeHeavy : chart.strokeLight}
          />
        );
      })}
      {f.edges.map((e, i) => {
        if (e.cost === undefined) return null;
        const a = at.get(e.from)!;
        const b = at.get(e.to)!;
        return (
          <ChartText
            key={`c${i}`}
            x={(px(a) + px(b)) / 2}
            y={(py(a) + py(b)) / 2 + 4}
            textAnchor="middle"
            fontSize={chart.label}
            fontWeight="700"
            fill={ink}
            halo={c.card}
          >
            {String(e.cost)}
          </ChartText>
        );
      })}
      {f.vertices.map((v) => (
        <G key={v.name}>
          <Vertex
            x={px(v)}
            y={py(v)}
            r={R}
            text={f.degrees ? String(deg.get(v.name) ?? 0) : v.name}
            lit={lit.has(v.name)}
            c={c}
            ink={ink}
          />
          {f.dist?.[v.name] !== undefined ? (
            <ChartText
              x={px(v) + (v.x > 0.5 ? -R - 2 : R + 2)}
              y={py(v) + (v.y > 0.5 ? R + 12 : -R - 1)}
              textAnchor={v.x > 0.5 ? 'end' : 'start'}
              fontSize={chart.label}
              fill={c.chartMuted}
              halo={c.card}
            >
              {String(f.dist[v.name])}
            </ChartText>
          ) : null}
        </G>
      ))}
    </G>
  );
}
