/**
 * HC94 (M-P11): `matrixGrid` `rowReduce` with `inverse` ([A | I] reduced to [I | A⁻¹], 3 × 6 or
 * 4 × 8) or `tally` (det A by row reduction, the running factor beside each matrix and the
 * diagonal's product under the last). Flat. Each column is as wide as its widest entry so a
 * 4 × 8 fits a phone; stages fold to the first and last behind a button, as `rowReduce` does.
 */
import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { MatrixGridSpec, RowOp } from '@/data/modules/typesHsd';
import { Text } from '@/components/Text';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, useRep } from './common';
import { MathText, textWidth } from './hsdText';
import { entryText, opText, reduceSteps, type Matrix } from './matrices';
import { opsFor, tallyOf, withIdentity } from './matrixHe4a';

type Spec = Extract<MatrixGridSpec, { mode: 'rowReduce' }>;

const ROW_H = 24;
const GAP = 30;
const tiny = (x: number) => Math.abs(x) < 1e-9;
/** An entry in a product: (−2) in parentheses. */
const par = (x: number) => (x < 0 ? `(${entryText(x)})` : entryText(x));

export function MatrixReduceHe4a({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const [every, setEvery] = useState(false);
  const n = spec.system.length;
  const inverse = !!spec.inverse;
  const tally = !inverse && !!spec.tally;
  const read = (x: number | string) =>
    typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  const raw = spec.system.map((r) => r.map(read));
  const known = raw.every((r) => r.every((x) => x !== undefined));
  const A = raw.map((r) => r.map((x) => x ?? 0));
  const start: Matrix = inverse ? withIdentity(A) : A;
  const cols = start[0]!.length;
  // The bar: after A in [A | I]; none for a determinant.
  const bar = inverse ? n : undefined;
  const ops: RowOp[] = known
    ? opsFor(start, spec.steps, inverse || tally ? n : cols - 1, tally)
    : [];
  const stages = known ? reduceSteps(start, ops) : [start];
  const ks = tallyOf(ops);
  const last = stages[stages.length - 1]!;
  const folds = stages.length > 3;
  const shown = folds && !every ? [0, stages.length - 1] : stages.map((_, k) => k);
  const text = (m: Matrix, i: number, j: number, k: number) =>
    k === 0 && j < spec.system[0]!.length && raw[i]![j] === undefined ? '?' : entryText(m[i]![j]!);
  const cellsOf = (k: number) =>
    stages[k]!.map((r, i) => r.map((_, j) => text(stages[k]!, i, j, k)));
  const allCells = stages.map((_, k) => cellsOf(k));

  // The left block became I (inverse), or the last matrix is triangular (tally).
  const identity =
    inverse &&
    known &&
    last.every((r, i) => r.slice(0, n).every((x, j) => tiny(x - (i === j ? 1 : 0))));
  const triangular = last.every((r, i) => r.every((x, j) => j >= i || tiny(x)));
  const diagonal = last.map((r, i) => r[i]!);
  const product = diagonal.reduce((p, x) => p * x, 1);
  const k = ks[ks.length - 1]!;
  const det = k * product;
  const tallyLine = (kk: number) => `det A = ${entryText(kk)} × det of this`;
  const opEffect = (op: RowOp) =>
    !tally
      ? ''
      : 'swap' in op
        ? ': sign flips'
        : 'scale' in op
          ? `: det × ${entryText(op.by)}`
          : ': det kept';
  const endLines =
    tally && known && triangular
      ? [
          `Triangular: det = ${diagonal.map(par).join(' × ')} = ${entryText(product)}`,
          `det A = ${par(k)} × ${par(product)} = ${entryText(det)}`,
        ]
      : [];

  const caption: string[] = [];
  if (!known) caption.push('Type every entry of A to reduce it.');
  else if (inverse) {
    caption.push(
      `[A | I] → [I | A⁻¹]: the ${ops.length} row operations that turn A into I turn I into A⁻¹.`,
    );
    caption.push(
      identity
        ? 'The left block is I, so the right block is A⁻¹; check: A × A⁻¹ = I.'
        : 'A row of A’s block became all zeros: A has no inverse (det A = 0).',
    );
  } else if (tally) {
    caption.push(
      'A swap flips the sign, scaling a row by c scales det by c, and adding a multiple of a row keeps det.',
    );
    if (triangular)
      caption.push(
        `A triangle’s det is its diagonal’s product, so det A = ${par(k)} × ${par(product)} = ${entryText(det)}.`,
      );
    if (triangular && tiny(det)) caption.push('det A = 0: A has no inverse.');
  }

  return (
    <View>
      <Canvas aspect={(w) => layout(w).height / w}>
        {({ w, h }) => {
          const L = layout(w);
          return (
            <Svg width={w} height={h}>
              <G transform={L.scale < 1 ? `scale(${L.scale})` : undefined}>
                {inverse ? (
                  <>
                    <MathText
                      text="A"
                      x={L.x + 8 + L.blockMid(0, n)}
                      y={14}
                      textAnchor="middle"
                      fontSize={chart.value}
                      fontWeight="700"
                    />
                    <MathText
                      text="I"
                      x={L.x + 8 + L.blockMid(n, cols)}
                      y={14}
                      textAnchor="middle"
                      fontSize={chart.value}
                      fontWeight="700"
                    />
                  </>
                ) : null}
                {shown.map((s, row) => {
                  const y = L.top + row * (L.mh + GAP);
                  const next = shown[row + 1];
                  const op = s > 0 && shown[row - 1] === s - 1 ? ops[s - 1] : undefined;
                  const lit = !op
                    ? []
                    : 'swap' in op
                      ? op.swap.map((r) => r - 1)
                      : 'scale' in op
                        ? [op.scale - 1]
                        : [op.add - 1];
                  const isLast = s === stages.length - 1;
                  return (
                    <G key={s}>
                      {lit.map((r) => (
                        <Rect
                          key={r}
                          x={L.x + 6}
                          y={y + 4 + r * ROW_H}
                          width={L.mw - 12}
                          height={ROW_H}
                          rx={4}
                          fill={c.chartHighlight}
                          opacity={0.16}
                        />
                      ))}
                      {inverse && isLast && identity ? (
                        <Rect
                          x={L.x + 8 + L.colX[n]!}
                          y={y + 4}
                          width={L.colX[cols]! - L.colX[n]!}
                          height={n * ROW_H}
                          rx={4}
                          fill={c.vectorResultant}
                          opacity={0.14}
                        />
                      ) : null}
                      {bracketed(L, y, allCells[s]!, c, L.font, bar)}
                      {tally && known
                        ? // Two lines when one would run past the edge.
                          (textWidth(tallyLine(ks[s]!), chart.value) + L.mw + 18 <= w
                            ? [tallyLine(ks[s]!)]
                            : [`det A = ${entryText(ks[s]!)} ×`, 'det of this']
                          ).map((t, i, all) => (
                            <MathText
                              key={t}
                              text={t}
                              x={L.x + L.mw + 10}
                              y={y + L.mh / 2 + 5 + (i - (all.length - 1) / 2) * 17}
                              fontSize={chart.value}
                              fontWeight={isLast ? '700' : '400'}
                              fill={c.chartInk}
                            />
                          ))
                        : null}
                      {next !== undefined ? (
                        <G>
                          <Path
                            d={`M ${L.x + L.mw / 2} ${y + L.mh + 4} L ${L.x + L.mw / 2} ${y + L.mh + GAP - 6}`}
                            stroke={c.chartMuted}
                            strokeWidth={chart.strokeLight}
                          />
                          <Path
                            d={`M ${L.x + L.mw / 2 - 5} ${y + L.mh + GAP - 11} L ${L.x + L.mw / 2} ${y + L.mh + GAP - 4} L ${L.x + L.mw / 2 + 5} ${y + L.mh + GAP - 11}`}
                            stroke={c.chartMuted}
                            strokeWidth={chart.strokeLight}
                            fill="none"
                          />
                          <MathText
                            text={
                              next === s + 1
                                ? `${opText(ops[s]!)}${opEffect(ops[s]!)}`
                                : `${next - s} row operations`
                            }
                            x={L.x + L.mw / 2 + 12}
                            y={y + L.mh + GAP / 2 + 5}
                            fontSize={chart.value}
                            fontWeight="700"
                            fill={c.chartHighlight}
                          />
                        </G>
                      ) : null}
                    </G>
                  );
                })}
                {inverse && identity ? (
                  <>
                    <MathText
                      text="I"
                      x={L.x + 8 + L.blockMid(0, n)}
                      y={L.stackBottom + 16}
                      textAnchor="middle"
                      fontSize={chart.value}
                      fontWeight="700"
                    />
                    <MathText
                      text="A⁻¹"
                      x={L.x + 8 + L.blockMid(n, cols)}
                      y={L.stackBottom + 16}
                      textAnchor="middle"
                      fontSize={chart.value}
                      fontWeight="700"
                      fill={c.vectorResultant}
                    />
                  </>
                ) : null}
                {endLines.map((t, i) => (
                  <MathText
                    key={t}
                    text={t}
                    x={L.x + 4}
                    y={L.stackBottom + 18 + i * 20}
                    fontSize={chart.value}
                    fontWeight={i === endLines.length - 1 ? '700' : '400'}
                    fill={i === endLines.length - 1 ? c.vectorResultant : c.chartInk}
                  />
                ))}
              </G>
            </Svg>
          );
        }}
      </Canvas>
      {folds ? (
        <Pressable
          testID="row-operations"
          accessibilityRole="button"
          onPress={() => setEvery((v) => !v)}
          style={{
            alignSelf: 'center',
            minHeight: 44,
            justifyContent: 'center',
            paddingHorizontal: 12,
          }}
        >
          <Text style={{ color: c.accent, fontWeight: '600' }}>
            {every ? 'Show only the first and last' : `Show the ${ops.length} row operations`}
          </Text>
        </Pressable>
      ) : null}
      <Caption>{caption.join(' · ')}</Caption>
    </View>
  );

  /** Column widths, the matrix's place and the picture's height at width w. */
  function layout(w: number) {
    // Each column as wide as its widest entry in any stage; 12 px type when 13 px won't fit.
    const widths = (font: number) =>
      Array.from({ length: cols }, (_, j) =>
        Math.max(
          font * 2 + 2,
          ...allCells.flatMap((m) => m.map((r) => r[j]!.length * font * 0.6 + 12)),
        ),
      );
    let font: number = chart.value;
    let cw = widths(font);
    const total = (ws: number[]) => ws.reduce((s, x) => s + x, 0) + 16;
    if (total(cw) > w - 16) {
      font = chart.label;
      cw = widths(font);
    }
    const mw = total(cw);
    const scale = Math.min(1, (w - 8) / mw);
    const colX = cw.reduce<number[]>((xs, x) => [...xs, xs[xs.length - 1]! + x], [0]);
    const mh = n * ROW_H + 8;
    const top = inverse ? 22 : 6;
    const stackBottom = top + shown.length * mh + (shown.length - 1) * GAP;
    const below = inverse && identity ? 24 : endLines.length ? endLines.length * 20 + 8 : 6;
    // A tally sits right of the matrix; otherwise the matrix is centered (left of center when
    // the operation text needs the room beside the arrow).
    const x = tally ? 8 : Math.max(4, (w / scale - mw) / 2 - (mw < w / 2 ? 40 : 0));
    return {
      x,
      mw,
      mh,
      top,
      font,
      colX,
      scale,
      stackBottom,
      height: (stackBottom + below) * scale,
      blockMid: (from: number, to: number) => (colX[from]! + colX[to]!) / 2,
    };
  }
}

/** A matrix in square brackets with per-column widths, the bar before column `bar`. */
function bracketed(
  L: { x: number; mw: number; mh: number; colX: number[] },
  y: number,
  cells: string[][],
  c: ReturnType<typeof usePalette>,
  font: number,
  bar?: number,
): ReactNode {
  const { x, mw, mh, colX } = L;
  const side = (s: 1 | -1) => {
    const bx = s === 1 ? x + 2 : x + mw - 2;
    return `M ${bx + 6 * s} ${y} L ${bx} ${y} L ${bx} ${y + mh} L ${bx + 6 * s} ${y + mh}`;
  };
  return (
    <G>
      <Path d={side(1)} stroke={c.chartInk} strokeWidth={chart.strokeLight} fill="none" />
      <Path d={side(-1)} stroke={c.chartInk} strokeWidth={chart.strokeLight} fill="none" />
      {bar !== undefined ? (
        <Line
          x1={x + 8 + colX[bar]!}
          y1={y + 4}
          x2={x + 8 + colX[bar]!}
          y2={y + mh - 4}
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
            x={x + 8 + (colX[j]! + colX[j + 1]!) / 2}
            y={y + 4 + i * ROW_H + ROW_H / 2 + 5}
            textAnchor="middle"
            fontSize={font}
            fill={t === '?' ? c.chartMuted : c.chartInk}
          />
        )),
      )}
    </G>
  );
}
