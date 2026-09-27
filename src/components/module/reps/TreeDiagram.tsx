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

/**
 * A tree diagram for two stages, read left to right: a branch for each first outcome, and
 * from each of those a branch for each second outcome, every branch marked with its chance
 * (all outcomes of a stage equally likely). The leaves list every pair; `path` is
 * highlighted, and its chance is the two branches' chances multiplied.
 */
export function TreeDiagram({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const count = (id: string) =>
    rep.known(id) ? Math.max(1, Math.min(TREE_MAX, Math.round(rep.shown(id)))) : undefined;
  const a = count(spec.first);
  const b = count(spec.second);
  const known = a !== undefined && b !== undefined;
  const [na, nb] = [a ?? 2, b ?? 2];
  // Past 24 pairs only the first outcomes' branches are drawn (the caption says so).
  const shownA = Math.max(1, Math.min(na, Math.floor(LEAVES_MAX / nb)));
  const leaves = shownA * nb;
  const name = (stage: 0 | 1, i: number) =>
    spec.names?.[stage]?.[i] ?? (stage === 0 ? String.fromCharCode(65 + i) : `${i + 1}`);
  const [pa, pb] = spec.path ?? [0, 0];
  const onPath = known && pa < na && pb < nb;
  const sym = (id: string) => (rep.words ? rep.variable(id).name : rep.variable(id).symbol);
  const [stageA, stageB] = spec.stages ?? ['First', 'Second'];

  return (
    <View>
      <Canvas aspect={(w) => (34 + leaves * rowOf(leaves) + 8) / w}>
        {({ w, h }) => {
          const top = 30;
          const xRoot = 14;
          const x1 = w * 0.32;
          const x2 = w * 0.68;
          const row = rowOf(leaves);
          const leafY = (k: number) => top + (k + 0.5) * row;
          const midY = (i: number) => (leafY(i * nb) + leafY(i * nb + nb - 1)) / 2;
          const rootY = (midY(0) + midY(shownA - 1)) / 2;
          const branchText = (x: number, y: number, n: number, key: string) => (
            <G key={key}>
              <Rect x={x - 12} y={y - 7} width={24} height={13} rx={4} fill={c.card} />
              <ChartText
                x={x}
                y={y + 3}
                fontSize={chart.tiny}
                fill={c.chartMuted}
                textAnchor="middle"
              >
                {`1/${n}`}
              </ChartText>
            </G>
          );
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              <ChartText x={x1} y={16} fontSize={chart.small} fontWeight="700" textAnchor="middle">
                {stageA}
              </ChartText>
              <ChartText x={x2} y={16} fontSize={chart.small} fontWeight="700" textAnchor="middle">
                {stageB}
              </ChartText>
              {Array.from({ length: shownA }, (_, i) => {
                const lit = onPath && i === pa;
                return (
                  <G key={`a${i}`}>
                    <Line
                      x1={xRoot}
                      y1={rootY}
                      x2={x1}
                      y2={midY(i)}
                      stroke={lit ? c.chartHighlight : c.chartMuted}
                      strokeWidth={lit ? chart.strokeHeavy : chart.strokeLight}
                    />
                    {Array.from({ length: nb }, (_, j) => {
                      const k = i * nb + j;
                      const litB = lit && j === pb;
                      return (
                        <G key={`b${j}`}>
                          <Line
                            x1={x1}
                            y1={midY(i)}
                            x2={x2}
                            y2={leafY(k)}
                            stroke={litB ? c.chartHighlight : c.chartGrid}
                            strokeWidth={litB ? chart.strokeHeavy : chart.strokeLight}
                          />
                          {nb <= 4 || litB
                            ? branchText(
                                x1 + 0.78 * (x2 - x1),
                                midY(i) + 0.78 * (leafY(k) - midY(i)),
                                nb,
                                `t${j}`,
                              )
                            : null}
                          <Circle
                            cx={x2}
                            cy={leafY(k)}
                            r={3}
                            fill={litB ? c.chartHighlight : c.chartInk}
                          />
                          <ChartText
                            {...fitLabel(
                              x2 + 10,
                              `${name(0, i)}, ${name(1, j)}`,
                              chart.label,
                              w,
                              'start',
                              10,
                            )}
                            y={leafY(k) + 4}
                            fontSize={chart.label}
                            fontWeight={litB ? '700' : '400'}
                            fill={litB ? c.chartHighlight : c.chartInk}
                          >
                            {`${name(0, i)}, ${name(1, j)}`}
                          </ChartText>
                        </G>
                      );
                    })}
                    {branchText((xRoot + x1) / 2, (rootY + midY(i)) / 2, na, `ta${i}`)}
                    <Rect
                      x={x1 - 16}
                      y={midY(i) - 11}
                      width={32}
                      height={22}
                      rx={6}
                      fill={lit ? c.chartHighlight : c.chartSurface}
                      stroke={lit ? c.chartHighlight : c.chartGrid}
                    />
                    <ChartText
                      x={x1}
                      y={midY(i) + 4}
                      fontSize={chart.label}
                      fontWeight="700"
                      fill={lit ? c.onChartHighlight : c.chartInk}
                      textAnchor="middle"
                    >
                      {name(0, i)}
                    </ChartText>
                  </G>
                );
              })}
              <Circle cx={xRoot} cy={rootY} r={5} fill={c.chartInk} />
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          spec.total
            ? `${sym(spec.total)} = ${sym(spec.first)} × ${sym(spec.second)} = ${a ?? '?'} × ${b ?? '?'} = ${rep.value(spec.total)} outcomes`
            : `${a ?? '?'} × ${b ?? '?'} = ${known ? na * nb : '?'} outcomes`,
          na * nb > leaves ? `The first ${shownA * nb} are drawn.` : undefined,
          spec.chance && onPath
            ? `${rep.words ? rep.variable(spec.chance).name : `${sym(spec.chance)}(${name(0, pa)}, ${name(1, pb)})`} = 1/${na} × 1/${nb} = ${chanceText(1, na * nb, rep.value(spec.chance), rep.shown(spec.chance))}`
            : undefined,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Caption>
    </View>
  );
}
