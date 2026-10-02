import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { MatrixGridSpec } from '@/data/modules/typesHsd';
import { Text } from '@/components/Text';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, useRep } from './common';
import { MathText } from './hsdText';
import { entryText, multiply, opText, reduceSteps, type Matrix } from './matrices';
import { autoRowOps } from './hs2h';

export const ROW_H = 24;
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sub = (n: number) => String(n).replace(/\d/g, (d) => SUB[Number(d)]!);

/** A cell's width for the widest entry of a matrix. */
export const cellWidth = (m: string[][]) =>
  Math.max(28, ...m.flat().map((t) => t.length * chart.value * 0.6 + 12));

interface Lit {
  row?: number;
  col?: number;
  cell?: [number, number];
  color?: string;
}

/**
 * A matrix in square brackets at (x, y) (top left), `bar` a dashed line before that column
 * (augmented), lit rows, columns or a cell; returns its drawing and size.
 */
export function matrixAt(
  x: number,
  y: number,
  cells: string[][],
  c: ReturnType<typeof usePalette>,
  lit: Lit = {},
  bar?: number,
  faded = false,
): { el: ReactNode; w: number; h: number; cw: number } {
  const cw = cellWidth(cells);
  const rows = cells.length;
  const cols = cells[0]?.length ?? 0;
  const w = cols * cw + 16;
  const h = rows * ROW_H + 8;
  const left = x + 8;
  const top = y + 4;
  const bracket = (side: 1 | -1) => {
    const bx = side === 1 ? x + 2 : x + w - 2;
    const t = 6 * side;
    return `M ${bx + t} ${y} L ${bx} ${y} L ${bx} ${y + h} L ${bx + t} ${y + h}`;
  };
  const el = (
    <G opacity={faded ? 0.4 : 1}>
      {lit.row !== undefined ? (
        <Rect
          x={left}
          y={top + lit.row * ROW_H}
          width={cols * cw}
          height={ROW_H}
          rx={4}
          fill={lit.color ?? c.chartHighlight}
          opacity={0.18}
        />
      ) : null}
      {lit.col !== undefined ? (
        <Rect
          x={left + lit.col * cw}
          y={top}
          width={cw}
          height={rows * ROW_H}
          rx={4}
          fill={lit.color ?? c.chartHighlight}
          opacity={0.18}
        />
      ) : null}
      {lit.cell ? (
        <Rect
          x={left + lit.cell[1] * cw}
          y={top + lit.cell[0] * ROW_H}
          width={cw}
          height={ROW_H}
          rx={4}
          fill={lit.color ?? c.chartHighlight}
          opacity={0.3}
        />
      ) : null}
      <Path d={bracket(1)} stroke={c.chartInk} strokeWidth={chart.strokeLight} fill="none" />
      <Path d={bracket(-1)} stroke={c.chartInk} strokeWidth={chart.strokeLight} fill="none" />
      {bar !== undefined ? (
        <Line
          x1={left + bar * cw}
          y1={top}
          x2={left + bar * cw}
          y2={top + rows * ROW_H}
          stroke={c.chartMuted}
          strokeWidth={1}
          strokeDasharray={chart.dashFine}
        />
      ) : null}
      {cells.map((row, i) =>
        row.map((t, j) => (
          <MathText
            key={`${i}-${j}`}
            text={t}
            x={left + (j + 0.5) * cw}
            y={top + i * ROW_H + ROW_H / 2 + 5}
            textAnchor="middle"
            fontSize={chart.value}
            fontWeight={lit.cell && lit.cell[0] === i && lit.cell[1] === j ? '700' : '400'}
          />
        )),
      )}
    </G>
  );
  return { el, w, h, cw };
}

/**
 * Matrices in brackets: A × B = C with a row and a column lit and their products summed into
 * the entry (tap an entry of C), or an augmented matrix reduced one row operation at a time.
 */
export function MatrixGrid({ spec, calc }: { spec: MatrixGridSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (v: number | string) => (typeof v === 'number' ? v : rep.val(v));
  const isKnown = (v: number | string) => typeof v === 'number' || rep.known(v);
  const [entry, setEntry] = useState<[number, number]>(
    spec.mode === 'multiply' && spec.entry ? [spec.entry[0] - 1, spec.entry[1] - 1] : [0, 0],
  );
  // Row reduction: the first and last matrices, with every stage a tap away (five stages ran
  // 681 px, the first box at 880).
  const [everyStage, setEveryStage] = useState(false);

  if (spec.mode === 'multiply') {
    const A = spec.a.map((r) => r.map(num));
    const B = spec.b.map((r) => r.map(num));
    const known = [...spec.a.flat(), ...spec.b.flat()].every(isKnown);
    const C = multiply(A, B);
    const [i, j] = C
      ? [Math.min(entry[0], C.length - 1), Math.min(entry[1], C[0]!.length - 1)]
      : entry;
    const terms = C ? A[i]!.map((x, k) => [x, B[k]![j]!] as const) : [];
    const par = (x: number) => (x < 0 ? `(${entryText(x)})` : entryText(x));
    const sum = `c${sub(i + 1)}${sub(j + 1)} = ${terms.map(([x, y]) => `${par(x)} × ${par(y)}`).join(' + ')} = ${C ? entryText(C[i]![j]!) : '?'}`;
    const lines = C
      ? [
          `A is ${A.length} × ${A[0]!.length} and B is ${B.length} × ${B[0]!.length}, so AB is ${C.length} × ${C[0]!.length}.`,
          `Row ${i + 1} of A times column ${j + 1} of B gives entry (${i + 1}, ${j + 1}): ${sum}.`,
          'Tap an entry of AB to see its row and column.',
        ]
      : ['A’s columns must match B’s rows: these can’t be multiplied.'];
    const cells = (m: Matrix) => m.map((r) => r.map(entryText));
    const aCells = cells(A);
    const bCells = cells(B);
    const cCells = C ? cells(C) : [];
    const wA = cellWidth(aCells) * (A[0]?.length ?? 0) + 16;
    const wB = cellWidth(bCells) * (B[0]?.length ?? 0) + 16;
    const wC = C ? cellWidth(cCells) * C[0]!.length + 16 : 0;
    const hMax = Math.max(A.length, B.length) * ROW_H + 8;
    const oneLine = (w: number) => wA + wB + wC + 2 * 34 + 12 <= w;
    const heightFor = (w: number) =>
      (oneLine(w) ? hMax : hMax + (C ? C.length * ROW_H + 8 : 0) + 20) + 66;
    return (
      <View>
        <Canvas aspect={(w) => heightFor(w) / w}>
          {({ w, h }) => {
            const single = oneLine(w);
            const row1 = single ? wA + wB + wC + 68 : wA + wB + 34;
            let x = (w - row1) / 2;
            const y0 = 26;
            const mid = (mh: number) => y0 + (hMax - mh) / 2;
            const a = matrixAt(
              x,
              mid(A.length * ROW_H + 8),
              aCells,
              c,
              { row: i },
              undefined,
              !known,
            );
            x += a.w;
            const times = x + 17;
            x += 34;
            const b = matrixAt(
              x,
              mid(B.length * ROW_H + 8),
              bCells,
              c,
              { col: j, color: c.hopBack },
              undefined,
              !known,
            );
            x += b.w;
            let cx = x + 34;
            let cy = mid((C?.length ?? 0) * ROW_H + 8);
            let eqX = x + 17;
            let eqY = y0 + hMax / 2 + 6;
            if (!single) {
              cx = (w - wC) / 2 + 17;
              cy = y0 + hMax + 20;
              eqX = cx - 17;
              eqY = cy + ((C?.length ?? 0) * ROW_H + 8) / 2 + 6;
            }
            const cm = C
              ? matrixAt(
                  cx,
                  cy,
                  cCells,
                  c,
                  { cell: [i, j], color: c.vectorResultant },
                  undefined,
                  !known,
                )
              : undefined;
            return (
              <>
                <Svg width={w} height={h}>
                  <MathText
                    text="A"
                    x={(w - row1) / 2 + a.w / 2}
                    y={18}
                    textAnchor="middle"
                    fontSize={chart.value}
                    fontWeight="700"
                  />
                  <MathText
                    text="B"
                    x={times + 17 + b.w / 2}
                    y={18}
                    textAnchor="middle"
                    fontSize={chart.value}
                    fontWeight="700"
                  />
                  {a.el}
                  <MathText
                    text="×"
                    x={times}
                    y={y0 + hMax / 2 + 6}
                    textAnchor="middle"
                    fontSize={18}
                  />
                  {b.el}
                  {cm ? (
                    <>
                      <MathText text="=" x={eqX} y={eqY} textAnchor="middle" fontSize={18} />
                      {cm.el}
                      <MathText
                        text="AB"
                        x={cx + cm.w / 2}
                        y={single ? 18 : cy + cm.h + 16}
                        textAnchor="middle"
                        fontSize={chart.value}
                        fontWeight="700"
                      />
                    </>
                  ) : null}
                  {C ? (
                    <MathText
                      text={sum}
                      x={w / 2}
                      y={h - 12}
                      textAnchor="middle"
                      fontSize={chart.value}
                      fontWeight="700"
                      fill={c.vectorResultant}
                    />
                  ) : null}
                </Svg>
                {cm
                  ? cCells.flatMap((r, ri) =>
                      r.map((_, cj) => (
                        <Pressable
                          key={`p${ri}-${cj}`}
                          testID={`entry-${ri + 1}-${cj + 1}`}
                          accessibilityRole="button"
                          accessibilityLabel={`Entry row ${ri + 1}, column ${cj + 1}`}
                          onPress={() => setEntry([ri, cj])}
                          style={{
                            position: 'absolute',
                            left: cx + 8 + cj * cm.cw,
                            top: cy + 4 + ri * ROW_H,
                            width: cm.cw,
                            height: ROW_H,
                          }}
                        />
                      )),
                    )
                  : null}
              </>
            );
          }}
        </Canvas>
        <Caption>{lines.join(' · ')}</Caption>
      </View>
    );
  }

  // H99: the determinant mode is MatrixDeterminant's (reps/index.tsx routes it there).
  if (spec.mode === 'determinant' || spec.mode === 'routh') return null; // HC190: MatrixRouthHe4a
  // Row reduction: each matrix under the last, the operation beside the arrow between.
  const M = spec.system.map((r) => r.map(num));
  const known = spec.system.flat().every(isKnown);
  // H105: the operations worked out from the values, or as the spec lists them.
  const ops = typeof spec.steps === 'string' ? autoRowOps(M, spec.steps) : spec.steps;
  const all = reduceSteps(M, ops);
  const width = Math.max(
    ...all.map((m) => cellWidth(m.map((r) => r.map(entryText))) * m[0]!.length + 16),
  );
  const mh = M.length * ROW_H + 8;
  const gap = 28;
  const folds = all.length > 3;
  const shown = folds && !everyStage ? [0, all.length - 1] : all.map((_, k) => k);
  const height = shown.length * mh + (shown.length - 1) * gap + 12;
  const lines: string[] = [
    `${M.length} equations in ${M[0]!.length - 1} unknowns, the right-hand sides after the bar.`,
  ];
  // H105: worked out from the values, a row of zeros says how many solutions there are.
  const last = all[all.length - 1]!;
  const zeroRow = last.find((r) => r.slice(0, -1).every((x) => Math.abs(x) < 1e-9));
  if (typeof spec.steps === 'string' && known && zeroRow)
    lines.push(
      Math.abs(zeroRow[zeroRow.length - 1]!) < 1e-9
        ? 'A row reads 0 = 0: it says nothing new, so there are infinitely many solutions.'
        : `A row reads 0 = ${entryText(zeroRow[zeroRow.length - 1]!)}: no values make it true, so there is no solution.`,
    );
  if (spec.solution && spec.solution.every((id) => rep.known(id)))
    lines.push(
      `The solution: ${spec.solution.map((id) => `${rep.variable(id).symbol} = ${entryText(rep.val(id))}`).join(', ')}.`,
    );
  const target = (k: number) => {
    const op = ops[k]!;
    return 'swap' in op ? op.swap.map((r) => r - 1) : 'scale' in op ? [op.scale - 1] : [op.add - 1];
  };
  return (
    <View>
      <Canvas aspect={(w) => height / w}>
        {({ w, h }) => {
          const x = Math.max(8, (w - width) / 2 - 40);
          return (
            <Svg width={w} height={h}>
              {shown.map((k, row) => {
                const m = all[k]!;
                const y = 6 + row * (mh + gap);
                const next = shown[row + 1];
                // Lit: the rows the operation just before changed (none past a fold).
                const lit = k > 0 && shown[row - 1] === k - 1 ? target(k - 1) : [];
                const drawn = matrixAt(
                  x,
                  y,
                  m.map((r) => r.map(entryText)),
                  c,
                  {},
                  m[0]!.length - 1,
                  !known,
                );
                return (
                  <G key={k}>
                    {lit.map((r) => (
                      <Rect
                        key={r}
                        x={x + 6}
                        y={y + 4 + r * ROW_H}
                        width={drawn.w - 12}
                        height={ROW_H}
                        rx={4}
                        fill={c.chartHighlight}
                        opacity={0.16}
                      />
                    ))}
                    {drawn.el}
                    {next !== undefined ? (
                      <G>
                        <Path
                          d={`M ${x + drawn.w / 2} ${y + mh + 4} L ${x + drawn.w / 2} ${y + mh + gap - 6}`}
                          stroke={c.chartMuted}
                          strokeWidth={chart.strokeLight}
                        />
                        <Path
                          d={`M ${x + drawn.w / 2 - 5} ${y + mh + gap - 11} L ${x + drawn.w / 2} ${y + mh + gap - 4} L ${x + drawn.w / 2 + 5} ${y + mh + gap - 11}`}
                          stroke={c.chartMuted}
                          strokeWidth={chart.strokeLight}
                          fill="none"
                        />
                        <MathText
                          text={next === k + 1 ? opText(ops[k]!) : `${next - k} row operations`}
                          x={x + drawn.w / 2 + 14}
                          y={y + mh + gap / 2 + 5}
                          fontSize={chart.value}
                          fontWeight="700"
                          fill={c.chartHighlight}
                        />
                      </G>
                    ) : null}
                  </G>
                );
              })}
            </Svg>
          );
        }}
      </Canvas>
      {folds ? (
        <Pressable
          testID="row-operations"
          accessibilityRole="button"
          onPress={() => setEveryStage((v) => !v)}
          style={{
            alignSelf: 'center',
            minHeight: 44,
            justifyContent: 'center',
            paddingHorizontal: 12,
          }}
        >
          <Text style={{ color: c.accent, fontWeight: '600' }}>
            {everyStage
              ? 'Show only the first and last'
              : `Show the ${all.length - 1} row operations`}
          </Text>
        </Pressable>
      ) : null}
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
