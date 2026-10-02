/**
 * HC190 (EC-P29): `matrixGrid` `mode: 'routh'`, the Routh array of a characteristic polynomial.
 * Rows sⁿ down to s⁰, the first column lit, each first-column sign beside it with the changes
 * bracketed and counted. Tap a worked-out cell for its 2 × 2 cross product, the four cells it
 * uses outlined. Flat, like the other matrix pictures.
 */
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { MatrixRouthHe4a as RouthSpec } from '@/data/modules/typesHe4a';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, useRep } from './common';
import { MathText } from './hsdText';
import { routhArray, signChanges, type RouthRow } from './matrixHe4a';

const ROW = 28;
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (n: number) => String(n).replace(/\d/g, (d) => SUP[Number(d)]!);
/** s³, s², s, (none). */
const power = (p: number) => (p === 0 ? '' : p === 1 ? 's' : `s${sup(p)}`);
/** A cell: four significant figures. */
const fmt = (x: number) => formatNumber(Number(x.toPrecision(4)));
const par = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x));

/** s³ + 6s² + 8s + 20. */
export function polyText(co: (number | undefined)[]): string {
  const n = co.length - 1;
  return co
    .map((a, i) => {
      const p = n - i;
      if (a === 0) return '';
      const mag = a === undefined ? '?' : Math.abs(a) === 1 && p > 0 ? '' : fmt(Math.abs(a));
      const sign = a !== undefined && a < 0 ? '−' : '+';
      return `${sign} ${mag}${power(p)}`;
    })
    .filter(Boolean)
    .join(' ')
    .replace(/^\+ /, '')
    .replace(/^− /, '−');
}

export function MatrixRouthHe4a({
  spec,
  calc,
}: {
  spec: RouthSpec & { kind: 'matrixGrid' };
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const raw = spec.coefficients.map((x) =>
    typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined,
  );
  const known = raw.every((x) => x !== undefined);
  const n = raw.length - 1;
  const width = Math.floor(n / 2) + 1;
  const rows: RouthRow[] = known
    ? routhArray(raw as number[])
    : [
        // The given rows only, "?" where a coefficient is not typed.
        { power: n, cells: [], how: 'given' },
        { power: n - 1, cells: [], how: 'given' },
      ];
  const given = (r: number, j: number) => raw[2 * j + r];
  const cellText = (r: number, j: number) => {
    if (!known) {
      const x = given(r, j);
      return 2 * j + r > n ? '0' : x === undefined ? '?' : fmt(x);
    }
    const row = rows[r]!;
    if (j === 0 && row.epsilon) return 'ε';
    return fmt(row.cells[j]!);
  };
  const [pick, setPick] = useState<[number, number]>([2, 0]);
  const [pr, pc] = pick[0] < rows.length && pick[1] < width - 1 ? pick : [2, 0];
  const changes = known ? signChanges(rows) : 0;
  const first = rows.map((r) => r.cells[0] ?? 0);

  // The picked cell's working.
  let working = '';
  if (known && pr >= 2 && pr < rows.length) {
    const a = rows[pr - 2]!.cells;
    const b = rows[pr - 1]!.cells;
    const row = rows[pr]!;
    const label = `s${sup(row.power)}`;
    if (row.how === 'aux') {
      const p = row.power + 1;
      working = `${label} row was all 0: d/ds of ${polyAux(b, p)} gives ${b
        .map((x, j) => (p - 2 * j > 0 ? fmt(x * (p - 2 * j)) : ''))
        .filter(Boolean)
        .join(', ')}`;
    } else if (pc === 0 && row.epsilon)
      working = `${label}: 0 in the first column, so ε > 0 stands in`;
    else
      working = `${label}: (${par(b[0]!)} × ${par(a[pc + 1]!)} − ${par(a[0]!)} × ${par(b[pc + 1]!)}) ÷ ${par(b[0]!)} = ${fmt(row.cells[pc]!)}`;
  }
  const verdict = !known
    ? ''
    : changes === 0
      ? 'No sign changes: every pole in the left half-plane'
      : `${changes} sign ${changes === 1 ? 'change' : 'changes'}: ${changes} ${changes === 1 ? 'pole' : 'poles'} in the right half-plane`;

  const caption: string[] = [];
  if (!known) caption.push('Type every coefficient to build the array.');
  else {
    caption.push(
      `First column ${first.map((x, i) => (rows[i]!.epsilon ? 'ε' : fmt(x))).join(', ')}: each sign change is a pole in the right half-plane.`,
    );
    caption.push('Tap a worked-out cell to see its cross product.');
    if (spec.limit && n === 3) {
      const [a3, a2, a1] = raw as number[];
      const kMax = (a2! * a1!) / a3!;
      caption.push(
        `The s¹ row is (${fmt(a2!)} × ${fmt(a1!)} − ${a3 === 1 ? '' : fmt(a3!)}K) ÷ ${fmt(a2!)}, so stable for 0 < K < ${fmt(kMax)}.`,
      );
      if (a1! / a3! > 0)
        caption.push(
          `At K = ${fmt(kMax)} the s¹ row is 0; ${fmt(a2!)}s² + ${fmt(kMax)} = 0 gives ω = √(${fmt(a1! / a3!)}) = ${fmt(Math.sqrt(a1! / a3!))} rad/s.`,
        );
    }
    if (rows.some((r) => r.how === 'aux'))
      caption.push(
        'A row of zeros is replaced (in teal) by the derivative of the auxiliary polynomial above it: poles sit in mirrored pairs, here on the jω axis when no sign changes follow.',
      );
  }

  const top = 30;
  const tableH = (n + 1) * ROW;
  const height = top + tableH + (known ? 50 : 10);
  return (
    <View>
      <Canvas aspect={(w) => height / w}>
        {({ w, h }) => {
          const labelW = 34;
          const signW = 74;
          const cw = Math.min(84, (w - labelW - signW - 16) / width);
          const x0 = Math.max(8, (w - labelW - cw * width - signW) / 2);
          const cx = (j: number) => x0 + labelW + j * cw;
          const ry = (i: number) => top + i * ROW;
          const signX = cx(width) + 16;
          const sources: [number, number][] =
            known && pr >= 2 && rows[pr]!.how === 'cross' && !(pc === 0 && rows[pr]!.epsilon)
              ? [
                  [pr - 2, 0],
                  [pr - 2, pc + 1],
                  [pr - 1, 0],
                  [pr - 1, pc + 1],
                ]
              : [];
          return (
            <>
              <Svg width={w} height={h}>
                <MathText
                  text={`${polyText(raw)} = 0`}
                  x={w / 2}
                  y={18}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fontWeight="700"
                />
                {/* The first column, lit. */}
                <Rect
                  x={cx(0) + 2}
                  y={ry(0) + 1}
                  width={cw - 4}
                  height={tableH - 2}
                  rx={4}
                  fill={c.chartHighlight}
                  opacity={0.14}
                />
                <Line
                  x1={cx(0)}
                  y1={ry(0)}
                  x2={cx(0)}
                  y2={ry(0) + tableH}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                {Array.from({ length: n + 1 }, (_, i) => (
                  <G key={i}>
                    {i > 0 ? (
                      <Line
                        x1={x0}
                        y1={ry(i)}
                        x2={cx(width)}
                        y2={ry(i)}
                        stroke={c.chartGrid}
                        strokeWidth={1}
                      />
                    ) : null}
                    <MathText
                      text={`s${sup(n - i)}`}
                      x={x0 + labelW - 8}
                      y={ry(i) + ROW / 2 + 5}
                      textAnchor="end"
                      fontSize={chart.value}
                      fill={c.chartMuted}
                    />
                    {i < rows.length
                      ? Array.from({ length: width }, (_, j) => {
                          const target = known && i === pr && j === pc && pr >= 2;
                          const source = sources.some(([r, q]) => r === i && q === j);
                          return (
                            <G key={j}>
                              {target || source ? (
                                <Rect
                                  x={cx(j) + 4}
                                  y={ry(i) + 3}
                                  width={cw - 8}
                                  height={ROW - 6}
                                  rx={4}
                                  fill={target ? c.vectorResultant : 'none'}
                                  fillOpacity={target ? 0.18 : 0}
                                  stroke={target ? c.vectorResultant : c.chartSecond}
                                  strokeWidth={chart.strokeLight}
                                />
                              ) : null}
                              <MathText
                                text={cellText(i, j)}
                                x={cx(j) + cw / 2}
                                y={ry(i) + ROW / 2 + 5}
                                textAnchor="middle"
                                fontSize={chart.value}
                                fontWeight={j === 0 ? '700' : '400'}
                                fill={
                                  cellText(i, j) === '?'
                                    ? c.chartMuted
                                    : known && rows[i]!.how === 'aux'
                                      ? c.tangentLine
                                      : c.chartInk
                                }
                              />
                            </G>
                          );
                        })
                      : null}
                    {/* The first column's sign beside each row. */}
                    {known ? (
                      <MathText
                        text={first[i]! < 0 ? '−' : '+'}
                        x={signX}
                        y={ry(i) + ROW / 2 + 5}
                        textAnchor="middle"
                        fontSize={chart.emphasis}
                        fontWeight="700"
                        fill={first[i]! < 0 ? c.regionMinus : c.chartInk}
                      />
                    ) : null}
                    {known && i > 0 && Math.sign(first[i]!) !== Math.sign(first[i - 1]!) ? (
                      <G>
                        <Path
                          d={`M ${signX + 8} ${ry(i) - ROW / 2 + 4} Q ${signX + 20} ${ry(i)} ${signX + 8} ${ry(i) + ROW / 2 - 4}`}
                          stroke={c.regionMinus}
                          strokeWidth={chart.strokeLight}
                          fill="none"
                        />
                        <MathText
                          text="change"
                          x={signX + 22}
                          y={ry(i) + 4}
                          fontSize={chart.label}
                          fill={c.regionMinus}
                        />
                      </G>
                    ) : null}
                  </G>
                ))}
                {known ? (
                  <>
                    <MathText
                      text={working}
                      x={w / 2}
                      y={top + tableH + 20}
                      textAnchor="middle"
                      fontSize={chart.label}
                      fontWeight="700"
                      fill={c.vectorResultant}
                    />
                    <MathText
                      text={verdict}
                      x={w / 2}
                      y={top + tableH + 40}
                      textAnchor="middle"
                      fontSize={chart.label}
                      fontWeight="700"
                    />
                  </>
                ) : null}
              </Svg>
              {known
                ? rows.flatMap((row, i) =>
                    i < 2
                      ? []
                      : Array.from({ length: width - 1 }, (_, j) => (
                          <Pressable
                            key={`p${i}-${j}`}
                            testID={`routh-${i + 1}-${j + 1}`}
                            accessibilityRole="button"
                            accessibilityLabel={`Row s${sup(row.power)}, column ${j + 1}`}
                            onPress={() => setPick([i, j])}
                            style={{
                              position: 'absolute',
                              left: cx(j),
                              top: ry(i),
                              width: cw,
                              height: ROW,
                            }}
                          />
                        )),
                  )
                : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{caption.join(' · ')}</Caption>
    </View>
  );
}

/** The auxiliary polynomial from a row: 6s² + 48. */
function polyAux(cells: number[], p: number): string {
  const terms = cells.map((x, j) => [x, p - 2 * j] as const).filter(([x, q]) => q >= 0 && x !== 0);
  return polyText(
    Array.from({ length: p + 1 }, (_, i) => terms.find(([, q]) => q === p - i)?.[0] ?? 0),
  );
}
