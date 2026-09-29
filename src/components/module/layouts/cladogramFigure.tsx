import { Circle, G, Line, Rect } from 'react-native-svg';

import type { CladeScene, CladeTrait, CladeTree } from '@/data/modules/typesHsh';
import { chart, usePalette } from '@/theme';

import { ChartText } from '../reps/common';
import { cladeNodes, CLADE_MAX, traitNode } from './cladeMath';
import { BOARD_W, Board, textW } from './earthKit';

const ROW = 30;
const TOP = 14;
const NAME = chart.value;

/**
 * A cladogram, flat like every diagram: the taxa down the right, the branches in right angles
 * from the root at the left, each node as far left as its deepest clade needs. Every shared
 * derived trait is a numbered bar across the branch where it appears, keyed under the tree. A
 * scene lights one trait (its bar, and every branch of the clade that inherits it, in the
 * highlight) and can ring taxa (a group to ask about).
 */
export function CladogramFigure({
  figure,
  clade,
}: {
  figure: { tree: CladeTree; traits: CladeTrait[] };
  clade: CladeScene;
}) {
  const c = usePalette();
  const nodes = cladeNodes(figure.tree);
  const taxa = nodes[0]!.taxa.slice(0, CLADE_MAX);
  const nameW = Math.min(132, Math.max(...taxa.map((t) => textW(t, NAME, true))) + 12);
  const xL = BOARD_W - nameW - 6;
  const rootX = 30;
  const dx = (xL - rootX) / Math.max(1, nodes[0]!.height);
  const x = (i: number) => xL - nodes[i]!.height * dx;
  const ys: number[] = [];
  // Children come after their parent: fill in the ys from the last node back.
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i]!;
    ys[i] = n.name
      ? TOP + taxa.indexOf(n.name) * ROW + ROW / 2
      : (ys[n.children[0]!]! + ys[n.children[n.children.length - 1]!]!) / 2;
  }
  const lit = figure.traits.find((t) => t.name === clade.lit);
  const litNode = lit ? traitNode(nodes, lit) : -1;
  const inLit = (i: number) => {
    for (let k = i; k >= 0; k = nodes[k]!.parent) if (k === litNode) return true;
    return false;
  };
  // Traits by the node they sit before, in the order listed.
  const onNode = new Map<number, number[]>();
  figure.traits.forEach((t, i) => {
    const k = traitNode(nodes, t);
    if (k >= 0) onNode.set(k, [...(onNode.get(k) ?? []), i]);
  });
  const treeH = TOP + taxa.length * ROW;
  const twoCols = figure.traits.every((t) => textW(t.name, chart.label) < 140);
  const keyRows = twoCols ? Math.ceil(figure.traits.length / 2) : figure.traits.length;
  const height = treeH + 16 + keyRows * 20 + 6;
  const ringed = new Set(clade.ring ?? []);
  // Contiguous runs of ringed taxa, each ringed as one group.
  const runs: [number, number][] = [];
  taxa.forEach((t, i) => {
    if (!ringed.has(t)) return;
    const last = runs[runs.length - 1];
    if (last && last[1] === i - 1) last[1] = i;
    else runs.push([i, i]);
  });

  const stroke = (on: boolean) => ({
    stroke: on ? c.chartHighlight : c.chartInk,
    strokeWidth: on ? chart.strokeHeavy : chart.stroke,
    strokeLinecap: 'round' as const,
  });

  return (
    <Board height={height}>
      {runs.map(([a, b]) => (
        <Rect
          key={`ring-${a}`}
          x={xL + 2}
          y={TOP + a * ROW + 2}
          width={nameW}
          height={(b - a + 1) * ROW - 4}
          rx={10}
          fill={c.chartSecond}
          fillOpacity={0.18}
          stroke={c.chartSecond}
          strokeWidth={chart.stroke}
          strokeDasharray={chart.dash}
        />
      ))}
      {/* The root's stem, then each branch: across to its node, and the node's upright. */}
      <Line x1={10} y1={ys[0]} x2={x(0)} y2={ys[0]} {...stroke(litNode === 0)} />
      {nodes.map((n, i) => (
        <G key={`n${i}`}>
          {n.parent >= 0 ? (
            <Line x1={x(n.parent)} y1={ys[i]} x2={x(i)} y2={ys[i]} {...stroke(inLit(i))} />
          ) : null}
          {n.children.length ? (
            <Line
              x1={x(i)}
              y1={ys[n.children[0]!]}
              x2={x(i)}
              y2={ys[n.children[n.children.length - 1]!]}
              {...stroke(inLit(i))}
            />
          ) : null}
          {n.name ? (
            <ChartText
              x={xL + 10}
              y={ys[i]! + 5}
              fontSize={NAME}
              fontWeight={inLit(i) ? '700' : '500'}
              fill={inLit(i) ? c.chartHighlight : c.chartInk}
            >
              {n.name}
            </ChartText>
          ) : null}
        </G>
      ))}
      {[...onNode].flatMap(([k, list]) => {
        const xa = nodes[k]!.parent >= 0 ? x(nodes[k]!.parent) : 10;
        const xb = x(k);
        return list.map((t, j) => {
          const mx = xa + ((j + 1) / (list.length + 1)) * (xb - xa);
          const y = ys[k]!;
          const on = figure.traits[t]!.name === clade.lit;
          return (
            <G key={`t${t}`}>
              <Line
                x1={mx}
                y1={y - 7}
                x2={mx}
                y2={y + 7}
                stroke={on ? c.chartHighlight : c.chartInk}
                strokeWidth={4}
              />
              <Circle
                cx={mx}
                cy={y - 17}
                r={8.5}
                fill={on ? c.chartHighlight : c.card}
                stroke={on ? c.chartHighlight : c.chartInk}
                strokeWidth={1.2}
              />
              <ChartText
                x={mx}
                y={y - 13}
                fontSize={chart.label}
                fontWeight="700"
                textAnchor="middle"
                fill={on ? c.onChartHighlight : c.chartInk}
              >
                {String(t + 1)}
              </ChartText>
            </G>
          );
        });
      })}
      {/* The key: each trait's number and name. */}
      {figure.traits.map((t, i) => {
        const col = twoCols ? i % 2 : 0;
        const row = twoCols ? Math.floor(i / 2) : i;
        const kx = 18 + col * (BOARD_W / 2);
        const ky = treeH + 18 + row * 20;
        const on = t.name === clade.lit;
        return (
          <G key={`k${i}`}>
            <Circle
              cx={kx}
              cy={ky - 4}
              r={8.5}
              fill={on ? c.chartHighlight : c.card}
              stroke={on ? c.chartHighlight : c.chartInk}
              strokeWidth={1.2}
            />
            <ChartText
              x={kx}
              y={ky}
              fontSize={chart.label}
              fontWeight="700"
              textAnchor="middle"
              fill={on ? c.onChartHighlight : c.chartInk}
            >
              {String(i + 1)}
            </ChartText>
            <ChartText
              x={kx + 14}
              y={ky}
              fontSize={chart.label}
              fontWeight={on ? '700' : '400'}
              fill={on ? c.chartHighlight : c.chartInk}
            >
              {t.name}
            </ChartText>
          </G>
        );
      })}
    </Board>
  );
}
