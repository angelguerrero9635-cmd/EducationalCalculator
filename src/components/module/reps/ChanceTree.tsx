import { View } from 'react-native';
import Svg, { Circle, G, Line, Rect } from 'react-native-svg';

import type { TreeChances } from '@/data/modules/typesHse';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { toFraction } from './exact';
import { reader } from './graphKit';

/** A probability as written: 0.3, 3/8, 2/7; else ≈ to three places. */
export function probText(x: number) {
  if (!Number.isFinite(x)) return '?';
  if (Math.abs(x * 100 - Math.round(x * 100)) < 1e-9) return formatNumber(Number(x.toFixed(2)));
  const f = toFraction(x, 60);
  return f ? `${f[0]}/${f[1]}` : `≈ ${formatNumber(Number(x.toFixed(3)))}`;
}

/** A fraction with its decimal after ≈ (12/19 ≈ 0.63); a decimal as it is. */
const withDecimal = (x: number) => {
  const t = probText(x);
  return t.includes('/') ? `${t} ≈ ${formatNumber(Number(x.toFixed(2)))}` : t;
};

/** Each stage's branch chances: the values given, and the last as 1 − the others when left out. */
export function branchChances(given: number[], outcomes: number) {
  return given.length === outcomes - 1
    ? [...given, 1 - given.reduce((a, b) => a + b, 0)]
    : given.slice(0, outcomes);
}

const ROW = 58;

/**
 * A probability tree (H21), flat, left to right: each first-stage branch with its own
 * probability P(A), each second-stage branch with its conditional probability P(B | A), and
 * at each leaf the path's probability, the product along it. A branch left out is the
 * complement (1 − the others). `path` is lit; `total` adds one second outcome over every path.
 */
export function ChanceTree({ spec, calc }: { spec: TreeChances; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const [namesA, namesB] = spec.names;
  const A = namesA.length;
  const B = namesB.length;
  const firstRead = spec.first.map(read);
  const secondRead = spec.second.map((r) => r.map(read));
  const known = [...firstRead, ...secondRead.flat()].every((x) => x.known);
  const pA = branchChances(
    firstRead.map((x) => x.value),
    A,
  );
  const pB = Array.from({ length: A }, (_, i) =>
    branchChances(
      (secondRead[i] ?? []).map((x) => x.value),
      B,
    ),
  );
  const leaves = A * B;
  const path = spec.path;
  const onPath = (i: number, j?: number) =>
    !!path && path[0] === i && (j === undefined || path[1] === j);
  const [stageA, stageB] = spec.stages ?? ['First', 'Second'];
  const sumsTo1 = (xs: number[]) => Math.abs(xs.reduce((a, b) => a + b, 0) - 1) < 1e-9;
  const bad =
    !sumsTo1(pA) ||
    pB.some((r) => !sumsTo1(r)) ||
    [...pA, ...pB.flat()].some((p) => p < -1e-12 || p > 1 + 1e-12);
  const leafP = (i: number, j: number) => pA[i]! * pB[i]![j]!;
  const independent = A > 1 && pB.every((r) => r.every((p, j) => Math.abs(p - pB[0]![j]!) < 1e-9));

  const caption = (() => {
    if (!known) return 'Type the probabilities to fill the tree.';
    if (bad)
      return 'Each node’s branches must add to 1, each between 0 and 1: check the probabilities.';
    const parts = [`Each node’s branches add to 1: ${pA.map(probText).join(' + ')} = 1`];
    if (path) {
      const [i, j] = path;
      parts.push(
        `P(${namesA[i]} and ${namesB[j]}) = P(${namesA[i]}) × P(${namesB[j]} | ${namesA[i]}) = ${probText(pA[i]!)} × ${probText(pB[i]![j]!)} = ${probText(leafP(i, j))}`,
      );
    }
    if (spec.totalOf !== undefined) {
      const j = spec.totalOf;
      const t = pA.reduce((s, _, i) => s + leafP(i, j), 0);
      parts.push(
        `P(${namesB[j]}) = ${pA.map((_, i) => `P(${namesA[i]} and ${namesB[j]})`).join(' + ')} = ${pA.map((_, i) => probText(leafP(i, j))).join(' + ')} = ${probText(t)}`,
      );
      if (path && path[1] === j && t > 0)
        parts.push(
          `So P(${namesA[path[0]]} | ${namesB[j]}) = ${probText(leafP(path[0], j))} ÷ ${probText(t)} = ${withDecimal(leafP(path[0], j) / t)}`,
        );
    }
    if (independent)
      parts.push(
        `P(${namesB[0]} | ${namesA[0]}) = P(${namesB[0]} | ${namesA[1]}): the second stage does not depend on the first, so they are independent.`,
      );
    return parts.join(' · ');
  })();

  return (
    <View>
      <Canvas aspect={(w) => (30 + leaves * ROW + 6) / w}>
        {({ w, h }) => {
          const top = 30;
          const xRoot = 12;
          const xA = w * 0.27;
          const xB = w * 0.64;
          const leafY = (k: number) => top + (k + 0.5) * ROW;
          const nodeY = (i: number) => (leafY(i * B) + leafY(i * B + B - 1)) / 2;
          const rootY = (nodeY(0) + nodeY(A - 1)) / 2;
          // A branch's label: the full "P(B | A) = 0.8" where it fits, else the number.
          // A branch's label: "P(B | A) = 0.8" on one line where it fits, else the name over
          // "= 0.8", else the number alone.
          const chip = (
            x: number,
            y: number,
            name: string,
            p: number,
            lit: boolean,
            room: number,
            key: string,
          ) => {
            const size = chart.small;
            const wide = (t: string) => t.length * size * 0.6 + 8;
            const full = `${name} = ${probText(p)}`;
            const lines =
              wide(full) <= room
                ? [full]
                : wide(name) <= room
                  ? [name, `= ${probText(p)}`]
                  : [probText(p)];
            const tw = Math.max(...lines.map(wide));
            const th = lines.length * (size + 3) + 3;
            return (
              <G key={key}>
                <Rect x={x - tw / 2} y={y - th / 2} width={tw} height={th} rx={4} fill={c.card} />
                {lines.map((t, k) => (
                  <ChartText
                    key={k}
                    x={x}
                    y={y - th / 2 + (k + 1) * (size + 3) - 1}
                    fontSize={size}
                    fontWeight={lit ? '700' : '400'}
                    fill={lit ? c.chartHighlight : c.chartInk}
                    textAnchor="middle"
                  >
                    {t}
                  </ChartText>
                ))}
              </G>
            );
          };
          const box = (x: number, y: number, name: string, lit: boolean, key: string) => {
            const bw = Math.max(34, name.length * chart.label * 0.6 + 12);
            return (
              <G key={key}>
                <Rect
                  x={x - bw / 2}
                  y={y - 11}
                  width={bw}
                  height={22}
                  rx={6}
                  fill={lit ? c.chartHighlight : c.chartSurface}
                  stroke={lit ? c.chartHighlight : c.chartGrid}
                />
                <ChartText
                  x={x}
                  y={y + 4}
                  fontSize={chart.label}
                  fontWeight="700"
                  fill={lit ? c.onChartHighlight : c.chartInk}
                  textAnchor="middle"
                >
                  {name}
                </ChartText>
              </G>
            );
          };
          return (
            <Svg width={w} height={h} opacity={known && !bad ? 1 : 0.45}>
              {[
                [xA, stageA],
                [xB, stageB],
              ].map(([x, s]) => (
                <ChartText
                  key={`h${s}`}
                  x={x as number}
                  y={16}
                  fontSize={chart.small}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {s as string}
                </ChartText>
              ))}
              {/* Branches: root to the first stage, then each first outcome to the second. */}
              {pA.map((p, i) => (
                <Line
                  key={`a${i}`}
                  x1={xRoot}
                  y1={rootY}
                  x2={xA}
                  y2={nodeY(i)}
                  stroke={onPath(i) ? c.chartHighlight : c.chartMuted}
                  strokeWidth={onPath(i) ? chart.strokeHeavy : chart.strokeLight}
                />
              ))}
              {pB.map((row, i) =>
                row.map((_, j) => (
                  <Line
                    key={`b${i}-${j}`}
                    x1={xA}
                    y1={nodeY(i)}
                    x2={xB}
                    y2={leafY(i * B + j)}
                    stroke={onPath(i, j) ? c.chartHighlight : c.chartMuted}
                    strokeWidth={onPath(i, j) ? chart.strokeHeavy : chart.strokeLight}
                  />
                )),
              )}
              {pA.map((p, i) =>
                chip(
                  xRoot + (xA - xRoot) * 0.45,
                  rootY + (nodeY(i) - rootY) * 0.45,
                  `P(${namesA[i]})`,
                  p,
                  onPath(i),
                  xA - xRoot - 8,
                  `pa${i}`,
                ),
              )}
              {pB.map((row, i) =>
                row.map((p, j) =>
                  chip(
                    xA + (xB - xA) * 0.58,
                    nodeY(i) + (leafY(i * B + j) - nodeY(i)) * 0.58,
                    `P(${namesB[j]} | ${namesA[i]})`,
                    p,
                    onPath(i, j),
                    // The lit path's branch is named P(B | A) in full; the rest keep to numbers
                    // so the branches stay in view (with no path, the first node's are named).
                    onPath(i, j) || (!path && i === 0) ? xB - xA - 12 : 0,
                    `pb${i}-${j}`,
                  ),
                ),
              )}
              {pA.map((_, i) => box(xA, nodeY(i), namesA[i]!, onPath(i), `na${i}`))}
              {/* Leaves: the outcome pair and its path's probability, the product. */}
              {pB.flatMap((row, i) =>
                row.map((_, j) => {
                  const y = leafY(i * B + j);
                  const lit = onPath(i, j);
                  const pair = `${namesA[i]}, ${namesB[j]}`;
                  const prod = `${probText(pA[i]!)} × ${probText(pB[i]![j]!)} = ${probText(leafP(i, j))}`;
                  return (
                    <G key={`l${i}-${j}`}>
                      <Circle cx={xB} cy={y} r={3.5} fill={lit ? c.chartHighlight : c.chartInk} />
                      <ChartText
                        {...fitLabel(xB + 9, pair, chart.label, w, 'start', 9)}
                        y={y - 3}
                        fontSize={chart.label}
                        fontWeight={lit ? '700' : '400'}
                        fill={lit ? c.chartHighlight : c.chartInk}
                      >
                        {pair}
                      </ChartText>
                      <ChartText
                        {...fitLabel(xB + 9, prod, chart.label, w, 'start', 9)}
                        y={y + 12}
                        fontSize={chart.label}
                        fontWeight={lit ? '700' : '400'}
                        fill={lit ? c.chartHighlight : c.chartMuted}
                      >
                        {prod}
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
      <Caption>{caption}</Caption>
    </View>
  );
}
