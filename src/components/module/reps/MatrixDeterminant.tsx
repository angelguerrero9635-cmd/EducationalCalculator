/**
 * H99: a determinant (`matrixGrid` `mode: 'determinant'`), flat. A 2 × 2 with its two diagonals
 * drawn, ad − bc; a 3 × 3 expanded along the first row, one small copy per entry with that
 * entry's row and column struck, its minor and sign beside it; or Cramer's rule, D and each Dᵢ
 * side by side with the replaced column lit, and each unknown Dᵢ ÷ D.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { MatrixGridSpec } from '@/data/modules/typesHsd';
import type { MatrixDeterminant as Spec } from '@/data/modules/typesHs2g';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, useRep } from './common';
import { cramerOf, det, minorOf, withColumn, type Square } from './determinant';
import { MathText, textWidth } from './hsdText';
import { cellWidth, ROW_H } from './MatrixGrid';
import { entryText } from './matrices';

const SUB = ['ₓ', 'ᵧ', 'z'];
const NAMES = ['x', 'y', 'z'];
const par = (x: number) => (x < 0 ? `(${entryText(x)})` : entryText(x));

type Palette = ReturnType<typeof usePalette>;

/**
 * A matrix in bars (a determinant) at (x, y): `dim` cells faded and struck, `lit` cells or a
 * `col` lit. Returns the drawing and its size.
 */
function bars(
  x: number,
  y: number,
  cells: string[][],
  c: Palette,
  opts: {
    dim?: (i: number, j: number) => boolean;
    lit?: [number, number];
    col?: number;
    strike?: [number, number];
  } = {},
): { el: ReactNode; w: number; h: number } {
  const cw = cellWidth(cells);
  const rows = cells.length;
  const cols = cells[0]?.length ?? 0;
  const w = cols * cw + 12;
  const h = rows * ROW_H + 8;
  const left = x + 6;
  const top = y + 4;
  const el = (
    <G>
      {opts.col !== undefined ? (
        <Rect
          x={left + opts.col * cw}
          y={top}
          width={cw}
          height={rows * ROW_H}
          rx={4}
          fill={c.chartSecond}
          opacity={0.3}
        />
      ) : null}
      {opts.lit ? (
        <Rect
          x={left + opts.lit[1] * cw}
          y={top + opts.lit[0] * ROW_H}
          width={cw}
          height={ROW_H}
          rx={4}
          fill={c.chartHighlight}
          opacity={0.3}
        />
      ) : null}
      <Line
        x1={x + 2}
        y1={y}
        x2={x + 2}
        y2={y + h}
        stroke={c.chartInk}
        strokeWidth={chart.strokeLight}
      />
      <Line
        x1={x + w - 2}
        y1={y}
        x2={x + w - 2}
        y2={y + h}
        stroke={c.chartInk}
        strokeWidth={chart.strokeLight}
      />
      {cells.map((row, i) =>
        row.map((t, j) => (
          <MathText
            key={`${i}-${j}`}
            text={t}
            x={left + (j + 0.5) * cw}
            y={top + i * ROW_H + ROW_H / 2 + 5}
            textAnchor="middle"
            fontSize={chart.value}
            fontWeight={opts.lit && opts.lit[0] === i && opts.lit[1] === j ? '700' : '400'}
            opacity={opts.dim?.(i, j) ? 0.3 : 1}
          />
        )),
      )}
      {opts.strike ? (
        <G>
          <Line
            x1={left + 2}
            y1={top + (opts.strike[0] + 0.5) * ROW_H}
            x2={left + cols * cw - 2}
            y2={top + (opts.strike[0] + 0.5) * ROW_H}
            stroke={c.chartMuted}
            strokeWidth={1}
          />
          <Line
            x1={left + (opts.strike[1] + 0.5) * cw}
            y1={top + 2}
            x2={left + (opts.strike[1] + 0.5) * cw}
            y2={top + rows * ROW_H - 2}
            stroke={c.chartMuted}
            strokeWidth={1}
          />
        </G>
      ) : null}
    </G>
  );
  return { el, w, h };
}

export function MatrixDeterminant({
  spec,
  calc,
}: {
  spec: MatrixGridSpec & Spec;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (v: number | string) => (typeof v === 'number' ? v : rep.val(v));
  const isKnown = (v: number | string) => typeof v === 'number' || rep.known(v);
  const M: Square = spec.matrix.map((r) => r.map(num));
  const n = M.length;
  const known = [...spec.matrix.flat(), ...(spec.cramer?.rhs ?? [])].every(isKnown);
  const D = det(M);
  const cells = (m: Square) => m.map((r) => r.map(entryText));
  const lines: string[] = [];

  // ── Cramer's rule ──
  if (spec.cramer) {
    const rhs = spec.cramer.rhs.map(num);
    const cr = cramerOf(M, rhs);
    const mats = [M, ...M[0]!.map((_, j) => withColumn(M, j, rhs))];
    const names = ['D', ...M[0]!.map((_, j) => `D${SUB[j]}`)];
    lines.push(
      `D = ${entryText(cr.D)}${n === 2 ? ` = ${par(M[0]![0]!)} × ${par(M[1]![1]!)} − ${par(M[0]![1]!)} × ${par(M[1]![0]!)}` : ''}`,
    );
    if (cr.solution)
      lines.push(
        M[0]!
          .map(
            (_, j) =>
              `${NAMES[j]} = D${SUB[j]} ÷ D = ${entryText(cr.Ds[j]!)} ÷ ${par(cr.D)} = ${entryText(cr.solution![j]!)}`,
          )
          .join(' · '),
      );
    else lines.push('D = 0: the system has no single solution, so Cramer’s rule stops here.');
    lines.push('Each Dᵢ puts the right sides in that unknown’s column (lit)');
    const boxW = Math.max(...mats.map((m) => cellWidth(cells(m)) * n + 12));
    const boxH = n * ROW_H + 8;
    const place = (w: number) => {
      const per = Math.max(1, Math.min(mats.length, Math.floor((w + 14) / (boxW + 14))));
      return { per, rows: Math.ceil(mats.length / per) };
    };
    return (
      <View>
        <Canvas aspect={(w) => (place(w).rows * (boxH + 50) + 6) / w}>
          {({ w, h }) => {
            const { per } = place(w);
            return (
              <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
                {mats.map((m, k) => {
                  const row = Math.floor(k / per);
                  const inRow = Math.min(per, mats.length - row * per);
                  const x0 = (w - inRow * boxW - (inRow - 1) * 14) / 2 + (k % per) * (boxW + 14);
                  const y0 = 22 + row * (boxH + 50);
                  const b = bars(x0, y0, cells(m), c, k ? { col: k - 1 } : {});
                  const value = k ? cr.Ds[k - 1]! : cr.D;
                  return (
                    <G key={`m${k}`}>
                      <MathText
                        text={names[k]!}
                        x={x0 + boxW / 2}
                        y={y0 - 6}
                        textAnchor="middle"
                        fontSize={chart.value}
                        fontWeight="700"
                        fill={k ? c.chartInk : c.chartHighlight}
                      />
                      {b.el}
                      <MathText
                        text={`= ${entryText(value)}`}
                        x={x0 + boxW / 2}
                        y={y0 + boxH + 18}
                        textAnchor="middle"
                        fontSize={chart.value}
                        fontWeight="700"
                      />
                    </G>
                  );
                })}
              </Svg>
            );
          }}
        </Canvas>
        <Caption>{lines.join(' · ')}</Caption>
      </View>
    );
  }

  // ── A 2 × 2: its diagonals ──
  if (n === 2) {
    const [[a, b], [cc, d]] = M as [[number, number], [number, number]];
    lines.push(
      `D = ad − bc = ${par(a)} × ${par(d)} − ${par(b)} × ${par(cc)} = ${entryText(a * d)} − ${par(b * cc)} = ${entryText(D)}`,
    );
    lines.push('Down the main diagonal, take away the other diagonal');
    return (
      <View>
        <Canvas aspect={(w) => (2 * 52 + 76) / w}>
          {({ w, h }) => {
            // Big cells, so each diagonal runs between the numbers, not through them.
            const t = cells(M);
            const cw = Math.max(88, ...t.flat().map((x) => textWidth(x, 18) + 44));
            const ch = 52;
            const x0 = (w - 2 * cw) / 2;
            const y0 = 10;
            const mid = (i: number, j: number) => ({
              x: x0 + (j + 0.5) * cw,
              y: y0 + (i + 0.5) * ch,
            });
            /** From one entry toward the other, stopping short of both numbers. */
            const diag = (i0: number, j0: number, i1: number, j1: number, color: string) => {
              const [p, q] = [mid(i0, j0), mid(i1, j1)];
              const [dx, dy] = [q.x - p.x, q.y - p.y];
              const len = Math.hypot(dx, dy);
              const cut = Math.min(0.4, 18 / len);
              return (
                <Path
                  d={`M ${p.x + dx * cut} ${p.y + dy * cut} L ${q.x - dx * cut} ${q.y - dy * cut}`}
                  stroke={color}
                  strokeWidth={chart.strokeHeavy}
                  strokeLinecap="round"
                />
              );
            };
            const formula = `${par(a)} × ${par(d)} − ${par(b)} × ${par(cc)} = ${entryText(D)}`;
            return (
              <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
                <Line
                  x1={x0}
                  y1={y0}
                  x2={x0}
                  y2={y0 + 2 * ch}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                <Line
                  x1={x0 + 2 * cw}
                  y1={y0}
                  x2={x0 + 2 * cw}
                  y2={y0 + 2 * ch}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                {diag(0, 0, 1, 1, c.chartHighlight)}
                {diag(0, 1, 1, 0, c.fnSecond)}
                {t.map((row, i) =>
                  row.map((x, j) => (
                    <MathText
                      key={`${i}-${j}`}
                      text={x}
                      x={mid(i, j).x}
                      y={mid(i, j).y + 6}
                      textAnchor="middle"
                      fontSize={18}
                      fontWeight="700"
                      fill={i === j ? c.chartHighlight : c.fnSecond}
                    />
                  )),
                )}
                <MathText
                  text={`D = ${formula}`}
                  x={w / 2}
                  y={y0 + 2 * ch + 40}
                  textAnchor="middle"
                  fontSize={textWidth(`D = ${formula}`, 16) < w - 16 ? 16 : chart.value}
                  fontWeight="700"
                />
              </Svg>
            );
          }}
        </Canvas>
        <Caption>{lines.join(' · ')}</Caption>
      </View>
    );
  }

  // ── A 3 × 3: expanded along the first row ──
  const terms = M[0]!.map((a, j) => {
    const minor = minorOf(M, 0, j);
    const md = det(minor);
    const sign = j % 2 ? '−' : '+';
    const [[p, q], [r, s]] = minor as [[number, number], [number, number]];
    return {
      a,
      md,
      text: `${sign} ${par(a)} × (${par(p)} × ${par(s)} − ${par(q)} × ${par(r)}) = ${sign} ${par(a)} × ${par(md)}`,
      value: (j % 2 ? -1 : 1) * a * md,
    };
  });
  lines.push(
    `D = ${terms.map((t, j) => `${j ? (j % 2 ? ' − ' : ' + ') : ''}${par(t.a)} × ${par(t.md)}`).join('')} = ${entryText(D)}`,
    'Each first-row entry times the 2 × 2 left when its row and column are struck, signs +, −, +',
  );
  const blockH = 3 * ROW_H + 8;
  return (
    <View>
      <Canvas aspect={(w) => (3 * (blockH + 12) + 40) / w}>
        {({ w, h }) => {
          const t = cells(M);
          const bw = cellWidth(t) * 3 + 12;
          const textRoom = w - bw - 24;
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              {terms.map((term, j) => {
                const y0 = 6 + j * (blockH + 12);
                const b = bars(8, y0, t, c, {
                  dim: (i, k) => i === 0 || k === j,
                  lit: [0, j],
                  strike: [0, j],
                });
                const size =
                  textWidth(term.text, chart.value) <= textRoom ? chart.value : chart.label;
                return (
                  <G key={`t${j}`}>
                    {b.el}
                    <MathText
                      text={term.text}
                      x={bw + 18}
                      y={y0 + blockH / 2 + 5}
                      fontSize={size}
                      fill={c.chartInk}
                    />
                  </G>
                );
              })}
              <MathText
                text={`D = ${terms
                  .map((x) =>
                    x.value < 0 ? `− ${entryText(-x.value)}` : `+ ${entryText(x.value)}`,
                  )
                  .join(' ')
                  .replace(/^\+ /, '')} = ${entryText(D)}`}
                x={w / 2}
                y={h - 12}
                textAnchor="middle"
                fontSize={chart.emphasis}
                fontWeight="700"
                fill={c.chartHighlight}
              />
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
