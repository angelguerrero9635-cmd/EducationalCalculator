import { View } from 'react-native';
import Svg, { Circle, G, Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { chanceText } from './chance';

type Spec = Extract<Representation, { kind: 'treeDiagram' }>;

/** The most outcomes a stage can have, and the most leaves drawn. */
export const TREE_MAX = 6;
export const LEAVES_MAX = 24;
/** Row height of a leaf: roomier when there are few. */
const rowOf = (leaves: number) => Math.max(22, Math.min(38, 240 / leaves));

/** Default outcome names by stage: A, B, …; 1, 2, …; X, Y, …. */
const DEFAULT_NAMES = [
  ['A', 'B', 'C', 'D', 'E', 'F'],
  ['1', '2', '3', '4', '5', '6'],
  ['X', 'Y', 'Z', 'W', 'V', 'U'],
];

/**
 * A tree diagram for two or three stages, read left to right: a branch for each first
 * outcome, from each of those a branch for each second outcome, and so on, every branch
 * marked with its chance (all outcomes of a stage equally likely). The leaves list every pair
 * or triple; `path` is highlighted, and its chance is its branches' chances multiplied.
 */
export function TreeDiagram({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const count = (id: string) =>
    rep.known(id) ? Math.max(1, Math.min(TREE_MAX, Math.round(rep.shown(id)))) : undefined;
  const ids = [spec.first, spec.second, ...(spec.third ? [spec.third] : [])];
  const counts = ids.map(count);
  const known = counts.every((x) => x !== undefined);
  const n = counts.map((x) => x ?? 2);
  const S = n.length;
  // Leaves under one node of each stage (stage s's node covers `under[s]` leaves).
  const under = n.map((_, s) => n.slice(s + 1).reduce((p, x) => p * x, 1));
  // Past 24 leaves only the first outcomes' branches are drawn (the caption says so).
  const shownA = Math.max(1, Math.min(n[0]!, Math.floor(LEAVES_MAX / under[0]!)));
  const leaves = shownA * under[0]!;
  const all = n.reduce((p, x) => p * x, 1);
  const name = (stage: number, i: number) =>
    spec.names?.[stage]?.[i] ?? DEFAULT_NAMES[stage]?.[i] ?? `${i + 1}`;
  const path = spec.path ?? n.map(() => 0);
  const onPath = known && path.every((i, s) => i < n[s]!);
  const sym = (id: string) => (rep.words ? rep.variable(id).name : rep.variable(id).symbol);
  const stages = spec.stages ?? ['First', 'Second', 'Third'].slice(0, S);
  // The outcomes of leaf k, stage by stage.
  const outcomes = (k: number) => n.map((x, s) => Math.floor(k / under[s]!) % x);
  const pathText = (o: number[]) => o.map((i, s) => name(s, i)).join(', ');

  return (
    <View>
      <Canvas aspect={(w) => (34 + leaves * rowOf(leaves) + 8) / w}>
        {({ w, h }) => {
          const top = 30;
          const xRoot = 14;
          // The stages' columns, leaving room for the leaves' names on the right.
          const xs = n.map((_, s) => w * (S === 2 ? [0.32, 0.68][s]! : [0.24, 0.46, 0.68][s]!));
          const row = rowOf(leaves);
          const leafY = (k: number) => top + (k + 0.5) * row;
          // Node j of stage s (counted across the whole stage) sits mid-way along its leaves.
          const nodeY = (s: number, j: number) =>
            (leafY(j * under[s]!) + leafY(j * under[s]! + under[s]! - 1)) / 2;
          const rootY = (nodeY(0, 0) + nodeY(0, shownA - 1)) / 2;
          // Is node j of stage s on the highlighted path?
          const lit = (s: number, j: number) => {
            if (!onPath) return false;
            const o = outcomes(j * under[s]!);
            return o.slice(0, s + 1).every((i, t) => i === path[t]);
          };
          const branchText = (x: number, y: number, k: number, key: string) => (
            <G key={key}>
              <Rect x={x - 12} y={y - 7} width={24} height={13} rx={4} fill={c.card} />
              <ChartText
                x={x}
                y={y + 3}
                fontSize={chart.tiny}
                fill={c.chartMuted}
                textAnchor="middle"
              >
                {`1/${k}`}
              </ChartText>
            </G>
          );
          const nodes = (s: number) => leaves / under[s]!;
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              {xs.map((x, s) => (
                <ChartText
                  key={`h${s}`}
                  x={x}
                  y={16}
                  fontSize={chart.small}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {stages[s] ?? ''}
                </ChartText>
              ))}
              {/* Branches, stage by stage: from the root, then from each node before. */}
              {xs.map((x, s) =>
                Array.from({ length: nodes(s) }, (_, j) => {
                  const on = lit(s, j);
                  const [px, py] =
                    s === 0 ? [xRoot, rootY] : [xs[s - 1]!, nodeY(s - 1, Math.floor(j / n[s]!))];
                  const y = nodeY(s, j);
                  // Branch chances where there is room (all on the first stage, the path's).
                  const label = s === 0 || n[s]! <= 4 || on;
                  return (
                    <G key={`s${s}-${j}`}>
                      <Line
                        x1={px}
                        y1={py}
                        x2={x}
                        y2={y}
                        stroke={on ? c.chartHighlight : s === 0 ? c.chartMuted : c.chartGrid}
                        strokeWidth={on ? chart.strokeHeavy : chart.strokeLight}
                      />
                      {label
                        ? branchText(
                            // Mid-branch, clear of the boxes; near the leaf on the last stage.
                            px + (s === S - 1 && s > 0 ? 0.78 : 0.5) * (x - px),
                            py + (s === S - 1 && s > 0 ? 0.78 : 0.5) * (y - py),
                            n[s]!,
                            't',
                          )
                        : null}
                    </G>
                  );
                }),
              )}
              {/* Nodes: a named box for each inner stage, a dot and the full outcome at a leaf. */}
              {xs.map((x, s) =>
                Array.from({ length: nodes(s) }, (_, j) => {
                  const on = lit(s, j);
                  const y = nodeY(s, j);
                  if (s === S - 1) {
                    const text = pathText(outcomes(j));
                    return (
                      <G key={`n${s}-${j}`}>
                        <Circle cx={x} cy={y} r={3} fill={on ? c.chartHighlight : c.chartInk} />
                        <ChartText
                          {...fitLabel(x + 10, text, chart.label, w, 'start', 10)}
                          y={y + 4}
                          fontSize={chart.label}
                          fontWeight={on ? '700' : '400'}
                          fill={on ? c.chartHighlight : c.chartInk}
                        >
                          {text}
                        </ChartText>
                      </G>
                    );
                  }
                  return (
                    <G key={`n${s}-${j}`}>
                      <Rect
                        x={x - 16}
                        y={y - 11}
                        width={32}
                        height={22}
                        rx={6}
                        fill={on ? c.chartHighlight : c.chartSurface}
                        stroke={on ? c.chartHighlight : c.chartGrid}
                      />
                      <ChartText
                        x={x}
                        y={y + 4}
                        fontSize={chart.label}
                        fontWeight="700"
                        fill={on ? c.onChartHighlight : c.chartInk}
                        textAnchor="middle"
                      >
                        {name(s, j % n[s]!)}
                      </ChartText>
                    </G>
                  );
                }),
              )}
              <Circle cx={xRoot} cy={rootY} r={5} fill={c.chartInk} />
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          spec.total
            ? `${sym(spec.total)} = ${ids.map(sym).join(' × ')} = ${counts.map((x) => x ?? '?').join(' × ')} = ${rep.value(spec.total)} outcomes`
            : `${counts.map((x) => x ?? '?').join(' × ')} = ${known ? all : '?'} outcomes`,
          all > leaves ? `The first ${leaves} are drawn.` : undefined,
          spec.chance && onPath
            ? `${rep.words ? rep.variable(spec.chance).name : `${sym(spec.chance)}(${pathText(path)})`} = ${n.map((x) => `1/${x}`).join(' × ')} = ${chanceText(1, all, rep.value(spec.chance), rep.shown(spec.chance))}`
            : undefined,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Caption>
    </View>
  );
}
