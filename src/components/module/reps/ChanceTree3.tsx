/**
 * H97: a chance tree with three stages (`treeDiagram` `chances` with `third`), flat, left to
 * right: each branch with its chance (the last of a node's branches 1 − the others when left
 * out), each leaf the third-stage outcome with the product of the three chances along its path.
 * `path` with `path3` lights one path; the caption multiplies along it.
 */
import type { ReactElement } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Rect } from 'react-native-svg';

import type { TreeChances } from '@/data/modules/typesHse';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { branchChances, probText } from './ChanceTree';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';

const ROW = 40;
/** A chance as written: a decimal to 4 places (0.504), else a fraction or ≈ (ChanceTree). */
const chanceText = (x: number) =>
  Math.abs(x * 1e4 - Math.round(x * 1e4)) < 1e-7 ? formatNumber(Number(x.toFixed(4))) : probText(x);
const boxW = (name: string) => Math.max(30, name.length * chart.label * 0.6 + 12);

export function ChanceTree3({ spec, calc }: { spec: TreeChances; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const [namesA, namesB] = spec.names;
  const namesC = spec.thirdNames ?? ['Yes', 'No'];
  const [A, B, C] = [namesA.length, namesB.length, namesC.length];
  const firstRead = spec.first.map(read);
  const secondRead = spec.second.map((r) => r.map(read));
  const thirdRead = (spec.third ?? []).map((r) => r.map((xs) => xs.map(read)));
  const known = [...firstRead, ...secondRead.flat(), ...thirdRead.flat(2)].every((x) => x.known);
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
  const pC = Array.from({ length: A }, (_, i) =>
    Array.from({ length: B }, (_, j) =>
      branchChances(
        (thirdRead[i]?.[j] ?? []).map((x) => x.value),
        C,
      ),
    ),
  );
  const leafP = (i: number, j: number, k: number) => pA[i]! * pB[i]![j]! * pC[i]![j]![k]!;
  const path = spec.path && spec.path3 !== undefined ? [...spec.path, spec.path3] : undefined;
  const on = (...ix: number[]) => !!path && ix.every((x, d) => path[d] === x);
  const [stageA, stageB] = spec.stages ?? ['First', 'Second'];
  const stageC = spec.thirdStage ?? 'Third';
  const sumsTo1 = (xs: number[]) => Math.abs(xs.reduce((p, q) => p + q, 0) - 1) < 1e-9;
  const all = [pA, ...pB, ...pC.flat()];
  const bad = all.some((r) => !sumsTo1(r) || r.some((p) => p < -1e-12 || p > 1 + 1e-12));
  const same = (rs: number[][]) =>
    rs.every((r) => r.every((p, k) => Math.abs(p - rs[0]![k]!) < 1e-9));
  const independent = same(pB) && same(pC.flat());

  const caption = (() => {
    if (!known) return 'Type the probabilities to fill the tree.';
    if (bad)
      return 'Each node’s branches must add to 1, each between 0 and 1: check the probabilities.';
    const parts = [`${A * B * C} paths; the chances on them add to 1`];
    if (path) {
      const [i, j, k] = path as [number, number, number];
      parts.push(
        `P(${namesA[i]}, ${namesB[j]}, ${namesC[k]}) = ${chanceText(pA[i]!)} × ${chanceText(pB[i]![j]!)} × ${chanceText(pC[i]![j]![k]!)} = ${chanceText(leafP(i, j, k))}`,
      );
    }
    if (independent)
      parts.push(
        'Each stage has the same chances on every branch: the stages are independent, so multiply.',
      );
    return parts.join(' · ');
  })();

  const leaves = A * B * C;
  return (
    <View>
      <Canvas aspect={(w) => (30 + leaves * ROW + 6) / w}>
        {({ w, h }) => {
          const top = 30;
          const xRoot = 10;
          const wC = Math.max(...namesC.map(boxW));
          const [wA, wB] = [Math.max(...namesA.map(boxW)), Math.max(...namesB.map(boxW))];
          const xC = w - 58 - wC / 2;
          const xA = xRoot + (xC - xRoot) * 0.3;
          const xB = xRoot + (xC - xRoot) * 0.63;
          const leafY = (i: number, j: number, k: number) =>
            top + ((i * B + j) * C + k + 0.5) * ROW;
          const nodeB = (i: number, j: number) => (leafY(i, j, 0) + leafY(i, j, C - 1)) / 2;
          const nodeA = (i: number) => (nodeB(i, 0) + nodeB(i, B - 1)) / 2;
          const rootY = (nodeA(0) + nodeA(A - 1)) / 2;
          const stroke = (lit: boolean) => (lit ? c.chartHighlight : c.chartMuted);
          const width = (lit: boolean) => (lit ? chart.strokeHeavy : chart.strokeLight);
          const chip = (x: number, y: number, p: number, lit: boolean, key: string) => {
            const t = chanceText(p);
            const tw = t.length * chart.small * 0.6 + 8;
            return (
              <G key={key}>
                <Rect x={x - tw / 2} y={y - 8} width={tw} height={16} rx={4} fill={c.card} />
                <ChartText
                  x={x}
                  y={y + 4}
                  fontSize={chart.label}
                  fontWeight={lit ? '700' : '400'}
                  fill={lit ? c.chartHighlight : c.chartInk}
                  textAnchor="middle"
                >
                  {t}
                </ChartText>
              </G>
            );
          };
          const box = (x: number, y: number, name: string, lit: boolean, key: string) => {
            const bw = boxW(name);
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
          /** A branch's chip, halfway between the boxes at its two ends (half widths h0, h1). */
          const mid = (x0: number, y0: number, x1: number, y1: number, h0: number, h1: number) => {
            const x = (x0 + h0 + x1 - h1) / 2;
            return [x, y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)] as const;
          };
          const lines: ReactElement[] = [];
          const chips: ReactElement[] = [];
          const boxes: ReactElement[] = [];
          pA.forEach((p, i) => {
            lines.push(
              <Line
                key={`a${i}`}
                x1={xRoot}
                y1={rootY}
                x2={xA}
                y2={nodeA(i)}
                stroke={stroke(on(i))}
                strokeWidth={width(on(i))}
              />,
            );
            chips.push(chip(...mid(xRoot, rootY, xA, nodeA(i), 0, wA / 2), p, on(i), `ca${i}`));
            boxes.push(box(xA, nodeA(i), namesA[i]!, on(i), `ba${i}`));
            pB[i]!.forEach((q, j) => {
              lines.push(
                <Line
                  key={`b${i}${j}`}
                  x1={xA}
                  y1={nodeA(i)}
                  x2={xB}
                  y2={nodeB(i, j)}
                  stroke={stroke(on(i, j))}
                  strokeWidth={width(on(i, j))}
                />,
              );
              chips.push(
                chip(
                  ...mid(xA, nodeA(i), xB, nodeB(i, j), wA / 2, wB / 2),
                  q,
                  on(i, j),
                  `cb${i}${j}`,
                ),
              );
              boxes.push(box(xB, nodeB(i, j), namesB[j]!, on(i, j), `bb${i}${j}`));
              pC[i]![j]!.forEach((r, k) => {
                const y = leafY(i, j, k);
                const lit = on(i, j, k);
                lines.push(
                  <Line
                    key={`c${i}${j}${k}`}
                    x1={xB}
                    y1={nodeB(i, j)}
                    x2={xC}
                    y2={y}
                    stroke={stroke(lit)}
                    strokeWidth={width(lit)}
                  />,
                );
                chips.push(
                  chip(...mid(xB, nodeB(i, j), xC, y, wB / 2, wC / 2), r, lit, `cc${i}${j}${k}`),
                );
                boxes.push(box(xC, y, namesC[k]!, lit, `bc${i}${j}${k}`));
                boxes.push(
                  <ChartText
                    key={`p${i}${j}${k}`}
                    x={xC + wC / 2 + 6}
                    y={y + 4}
                    fontSize={chart.label}
                    fontWeight={lit ? '700' : '400'}
                    fill={lit ? c.chartHighlight : c.chartMuted}
                  >
                    {chanceText(leafP(i, j, k))}
                  </ChartText>,
                );
              });
            });
          });
          return (
            <Svg width={w} height={h} opacity={known && !bad ? 1 : 0.45}>
              {(
                [
                  [xA, stageA],
                  [xB, stageB],
                  [xC, stageC],
                ] as const
              ).map(([x, s]) => (
                <ChartText
                  key={`h${s}`}
                  x={x}
                  y={16}
                  fontSize={chart.small}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {s}
                </ChartText>
              ))}
              <ChartText
                x={w - 4}
                y={16}
                fontSize={chart.small}
                fontWeight="700"
                textAnchor="end"
                fill={c.chartMuted}
              >
                path
              </ChartText>
              {lines}
              {chips}
              {boxes}
              <Circle cx={xRoot} cy={rootY} r={5} fill={c.chartInk} />
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}
