/**
 * HC184 `karnaugh` (KarnaughSpec in typesHe4n.ts): a 2-, 3- or 4-variable K-map in Gray order
 * with its truth table beside it. The function's 1s and don't-cares (X) fill the cells, each
 * cell's minterm number under its value; the groups of the minimal sum of products are ringed,
 * each in its own outline style (solid, dashed, dotted, dash-dot) and inset, so they read
 * without colour, a group that wraps drawn open at the map's edges; the product terms are
 * listed under the map with their outline styles. A lit minterm is lit in the map and the
 * table. Flat. The explore figure (`layouts/karnaughFigure.tsx`) draws the same map.
 */
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { KarnaughSpec } from '@/data/modules/typesHe4n';
import { formatNumber } from '@/engine/format';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { fmt4, textW, useReader } from './he3dKit';
import {
  bin,
  cubeCells,
  kmapShape,
  minimalCover,
  mintermTerm,
  sopOf,
  termOf,
  type Cube,
} from './karnaughMath';

const PAD = 4;
const CELL_H = 48;
/** The map's row-header column and its two header rows. */
const SIDE = 44;
const TOP = 36;
const GAP = 16;
const LEGEND_ROW = 20;
/** Ring insets: each group sits a little further in than the one before. */
const INSETS = [2.5, 5, 7.5, 10];
export const RING_DASH = [undefined, '6 3', '1.5 3', '8 3 2 3'];

export const ringColor = (c: Palette, g: number) =>
  [c.kmapGroup1, c.kmapGroup2, c.kmapGroup3, c.kmapGroup4][g % 4]!;

/** Where everything sits for n variables in a canvas `w` wide. */
export function kmapLayout(n: number, w: number, groups: number) {
  const shape = kmapShape(n);
  const R = shape.rows.length;
  const C = shape.cols.length;
  const rowH = n === 4 ? 16 : 20;
  const tColW = 20;
  const tableW = 26 + (n + 1) * tColW;
  const cellW = Math.max(36, Math.min(48, (w - 2 * PAD - SIDE - GAP - tableW) / C));
  const mapW = SIDE + C * cellW;
  const used = mapW + GAP + tableW;
  const x0 = Math.max(PAD, (w - used) / 2);
  const mapX = x0 + SIDE;
  const mapY = TOP;
  const legendY = mapY + R * CELL_H + 10;
  const mapBottom = legendY + groups * LEGEND_ROW;
  const tableX = x0 + mapW + GAP;
  const tableY = 4;
  const tableBottom = tableY + (1 + (1 << n)) * rowH + 4;
  return {
    ...shape,
    R,
    C,
    cellW,
    mapX,
    mapY,
    legendY,
    tableX,
    tableY,
    rowH,
    tColW,
    h: Math.max(mapBottom, tableBottom) + 6,
  };
}

/** One side of a ring's outline per run of cells, open where the group wraps past an edge. */
function axisRuns(ix: number[]): { a: number; b: number; openLo: boolean; openHi: boolean }[] {
  const s = [...ix].sort((p, q) => p - q);
  const contiguous = s.every((v, i) => i === 0 || v === s[i - 1]! + 1);
  if (contiguous) return [{ a: s[0]!, b: s[s.length - 1]!, openLo: false, openHi: false }];
  // A wrap: a run that starts at 0 and one that ends at the last index.
  let k = 0;
  while (k + 1 < s.length && s[k + 1] === s[k]! + 1) k++;
  return [
    { a: s[0]!, b: s[k]!, openLo: true, openHi: false },
    { a: s[k + 1]!, b: s[s.length - 1]!, openLo: false, openHi: true },
  ];
}

/** A ring's outline, rounded where two closed sides meet, drawn past the map's edge where open. */
function ringPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  open: { l: boolean; r: boolean; t: boolean; b: boolean },
  rad: number,
  ext: number,
): string {
  const parts: string[] = [];
  const L = open.l ? x1 - ext : x1;
  const Rr = open.r ? x2 + ext : x2;
  const T = open.t ? y1 - ext : y1;
  const B = open.b ? y2 + ext : y2;
  const tl = !open.t && !open.l ? rad : 0;
  const tr = !open.t && !open.r ? rad : 0;
  const bl = !open.b && !open.l ? rad : 0;
  const br = !open.b && !open.r ? rad : 0;
  if (!open.t) parts.push(`M${L + tl},${y1} L${Rr - tr},${y1}`);
  if (!open.b) parts.push(`M${L + bl},${y2} L${Rr - br},${y2}`);
  if (!open.l) parts.push(`M${x1},${T + tl} L${x1},${B - bl}`);
  if (!open.r) parts.push(`M${x2},${T + tr} L${x2},${B - br}`);
  if (tl) parts.push(`M${x1},${y1 + tl} A${tl},${tl} 0 0 1 ${x1 + tl},${y1}`);
  if (tr) parts.push(`M${x2 - tr},${y1} A${tr},${tr} 0 0 1 ${x2},${y1 + tr}`);
  if (br) parts.push(`M${x2},${y2 - br} A${br},${br} 0 0 1 ${x2 - br},${y2}`);
  if (bl) parts.push(`M${x1 + bl},${y2} A${bl},${bl} 0 0 1 ${x1},${y2 - bl}`);
  return parts.join(' ');
}

/**
 * The map and its truth table. `groups` are ringed in order; `lit` is a minterm lit; `faded`
 * draws the function's cells muted (it doesn't fit the map).
 */
export function KMapDrawing({
  n,
  names,
  ones,
  dcs,
  groups,
  lit,
  w,
  showF = true,
}: {
  n: number;
  names: string[];
  ones: number[];
  dcs: number[];
  groups: Cube[];
  lit?: number;
  w: number;
  /** Write the f column and the map's values (off for an empty map: cells and numbers only). */
  showF?: boolean;
}) {
  const c = usePalette();
  const L = kmapLayout(n, w, groups.length);
  const on = new Set(ones);
  const dc = new Set(dcs);
  const val = (m: number) => (on.has(m) ? '1' : dc.has(m) ? 'X' : '0');
  const rowNames = names.slice(0, L.rowBits).join('');
  const colNames = names.slice(L.rowBits).join('');
  const cx = (j: number) => L.mapX + j * L.cellW;
  const cy = (i: number) => L.mapY + i * CELL_H;
  return (
    <G>
      {/* Header names: the row variables beside the row codes, the column ones over theirs. */}
      <ChartText
        x={L.mapX - SIDE}
        y={L.mapY - 22}
        fontSize={chart.label}
        fontWeight="700"
        fill={c.chartInk}
      >
        {`${rowNames} \\ ${colNames}`}
      </ChartText>
      {L.cols.map((code, j) => (
        <ChartText
          key={`c${j}`}
          x={cx(j) + L.cellW / 2}
          y={L.mapY - 6}
          textAnchor="middle"
          fontSize={chart.label}
          fill={c.chartMuted}
        >
          {bin(code, L.colBits)}
        </ChartText>
      ))}
      {L.rows.map((code, i) => (
        <ChartText
          key={`r${i}`}
          x={L.mapX - 6}
          y={cy(i) + CELL_H / 2 + 4}
          textAnchor="end"
          fontSize={chart.label}
          fill={c.chartMuted}
        >
          {bin(code, L.rowBits)}
        </ChartText>
      ))}
      {L.rows.map((_, i) =>
        L.cols.map((__, j) => {
          const m = L.at(i, j);
          const isLit = lit === m;
          const v = val(m);
          return (
            <G key={`${i}-${j}`}>
              <Rect
                x={cx(j)}
                y={cy(i)}
                width={L.cellW}
                height={CELL_H}
                fill={isLit ? c.chartHighlight : c.chartSurface}
                stroke={c.chartGrid}
                strokeWidth={1}
              />
              {showF ? (
                <ChartText
                  x={cx(j) + L.cellW / 2}
                  y={cy(i) + 22}
                  textAnchor="middle"
                  fontSize={chart.emphasis}
                  fontWeight={v === '0' ? '400' : '700'}
                  fill={isLit ? c.onChartHighlight : v === '0' ? c.chartMuted : c.chartInk}
                >
                  {v}
                </ChartText>
              ) : null}
              <ChartText
                x={cx(j) + L.cellW / 2}
                y={cy(i) + (showF ? 36 : 29)}
                textAnchor="middle"
                fontSize={chart.label}
                fill={isLit ? c.onChartHighlight : c.chartMuted}
              >
                {String(m)}
              </ChartText>
            </G>
          );
        }),
      )}
      <Rect
        x={L.mapX}
        y={L.mapY}
        width={L.C * L.cellW}
        height={L.R * CELL_H}
        fill="none"
        stroke={c.chartInk}
        strokeWidth={chart.strokeLight}
      />
      {/* The groups' rings. */}
      {groups.map((q, g) => {
        const cells = cubeCells(q, n).map((m) => L.where(m));
        const rowsIx = [...new Set(cells.map(([i]) => i))];
        const colsIx = [...new Set(cells.map(([, j]) => j))];
        const ins = INSETS[g % INSETS.length]!;
        const color = ringColor(c, g);
        return (
          <G key={`g${g}`}>
            {axisRuns(rowsIx).flatMap((rr, a) =>
              axisRuns(colsIx).map((cc, b) => (
                <Path
                  key={`${a}-${b}`}
                  d={ringPath(
                    cx(cc.a) + ins,
                    cy(rr.a) + ins,
                    cx(cc.b + 1) - ins,
                    cy(rr.b + 1) - ins,
                    { l: cc.openLo, r: cc.openHi, t: rr.openLo, b: rr.openHi },
                    9,
                    ins + 5,
                  )}
                  fill="none"
                  stroke={color}
                  strokeWidth={2.25}
                  strokeDasharray={RING_DASH[g % RING_DASH.length]}
                  strokeLinecap="round"
                />
              )),
            )}
          </G>
        );
      })}
      {/* The product terms, each beside a sample of its ring's outline. */}
      {groups.map((q, g) => {
        const y = L.legendY + g * LEGEND_ROW + 12;
        const x = L.mapX - SIDE + 4;
        return (
          <G key={`l${g}`}>
            <Line
              x1={x}
              y1={y - 4}
              x2={x + 26}
              y2={y - 4}
              stroke={ringColor(c, g)}
              strokeWidth={2.25}
              strokeDasharray={RING_DASH[g % RING_DASH.length]}
              strokeLinecap="round"
            />
            <ChartText x={x + 32} y={y} fontSize={chart.label} fontWeight="700" fill={c.chartInk}>
              {legendText(q, n, names, SIDE + L.C * L.cellW - 36)}
            </ChartText>
          </G>
        );
      })}
      <TruthTable n={n} names={names} L={L} val={val} lit={lit} showF={showF} c={c} />
    </G>
  );
}

function TruthTable({
  n,
  names,
  L,
  val,
  lit,
  showF,
  c,
}: {
  n: number;
  names: string[];
  L: ReturnType<typeof kmapLayout>;
  val: (m: number) => string;
  lit?: number;
  showF: boolean;
  c: Palette;
}) {
  const heads = ['m', ...names.slice(0, n), ...(showF ? ['f'] : [])];
  const colX = (k: number) => (k === 0 ? L.tableX + 13 : L.tableX + 26 + (k - 1) * L.tColW + 10);
  const right = L.tableX + 26 + (showF ? n + 1 : n) * L.tColW;
  return (
    <G>
      {heads.map((hd, k) => (
        <ChartText
          key={hd}
          x={colX(k)}
          y={L.tableY + L.rowH - 5}
          textAnchor="middle"
          fontSize={chart.label}
          fontWeight="700"
          fill={c.chartInk}
        >
          {hd}
        </ChartText>
      ))}
      <Line
        x1={L.tableX}
        y1={L.tableY + L.rowH}
        x2={right}
        y2={L.tableY + L.rowH}
        stroke={c.chartInk}
        strokeWidth={1}
      />
      {showF ? (
        <Line
          x1={L.tableX + 26 + n * L.tColW}
          y1={L.tableY + 2}
          x2={L.tableX + 26 + n * L.tColW}
          y2={L.tableY + (1 + (1 << n)) * L.rowH}
          stroke={c.chartGrid}
          strokeWidth={1}
        />
      ) : null}
      {Array.from({ length: 1 << n }, (_, m) => {
        const y = L.tableY + (m + 1) * L.rowH;
        const isLit = lit === m;
        const bits = bin(m, n);
        const v = val(m);
        const ink = isLit ? c.onChartHighlight : c.chartInk;
        return (
          <G key={m}>
            {isLit ? (
              <Rect
                x={L.tableX}
                y={y + 1}
                width={right - L.tableX}
                height={L.rowH - 1}
                fill={c.chartHighlight}
              />
            ) : null}
            <ChartText
              x={colX(0)}
              y={y + L.rowH - 4}
              textAnchor="middle"
              fontSize={chart.label}
              fill={isLit ? ink : c.chartMuted}
            >
              {String(m)}
            </ChartText>
            {[...bits].map((b, k) => (
              <ChartText
                key={k}
                x={colX(k + 1)}
                y={y + L.rowH - 4}
                textAnchor="middle"
                fontSize={chart.label}
                fill={ink}
              >
                {b}
              </ChartText>
            ))}
            {showF ? (
              <ChartText
                x={colX(n + 1)}
                y={y + L.rowH - 4}
                textAnchor="middle"
                fontSize={chart.label}
                fontWeight={v === '0' ? '400' : '700'}
                fill={isLit ? ink : v === '0' ? c.chartMuted : c.chartInk}
              >
                {v}
              </ChartText>
            ) : null}
          </G>
        );
      })}
    </G>
  );
}

/** A group's legend: its term, and its cells when they fit the room. */
export function legendText(q: Cube, n: number, names: string[], room: number) {
  const term = termOf(q, names);
  const full = `${term}: m${cubeCells(q, n).join(', m')}`;
  return textW(full, chart.label, true) <= room ? full : term;
}

/** Σm(0, 2, 5, 7) + d(1). */
export const sigmaOf = (ones: number[], dcs: number[]) =>
  `Σm(${[...ones].sort((a, b) => a - b).join(', ')})${dcs.length ? ` + d(${[...dcs].sort((a, b) => a - b).join(', ')})` : ''}`;

const sup = (s: string) => [...s].map((ch) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(ch)] ?? ch).join('');

export function Karnaugh({ spec, calc }: { spec: KarnaughSpec; calc: Calculator }) {
  const r = useReader(calc);
  const nRaw = r.get(spec.n);
  const n = nRaw === undefined ? undefined : Math.round(nRaw);
  const ok = n !== undefined && n >= 2 && n <= 4;
  const names = spec.names ?? ['A', 'B', 'C', 'D'];
  const ones = spec.minterms ?? [];
  const dcs = spec.dontCares ?? [];
  const showF = spec.minterms !== undefined;
  const fits = ok && [...ones, ...dcs].every((m) => m < 1 << n);
  const groups = fits && showF ? minimalCover(n, ones, dcs) : [];
  const litRaw = r.get(spec.lit);
  const lit =
    ok && litRaw !== undefined && Number.isInteger(litRaw) && litRaw >= 0 && litRaw < 1 << n
      ? litRaw
      : undefined;
  const nm = names.slice(0, n ?? 0);
  const parts: string[] = [];
  if (ok) {
    if (showF && fits) parts.push(`f = ${sigmaOf(ones, dcs)} = ${sopOf(groups, nm)}.`);
    if (showF && !fits)
      parts.push(`${sigmaOf(ones, dcs)} needs more than ${n} variables: the map is left empty.`);
    parts.push(
      `${n} inputs: 2${sup(String(n))} = ${formatNumber(1 << n)} rows of the truth table, one cell of the map each.`,
    );
    if (spec.functions !== undefined && r.get(spec.functions) !== undefined)
      parts.push(
        `Each row’s output can be 0 or 1: 2${sup(String(1 << n))} = ${formatNumber(2 ** (1 << n))} functions.`,
      );
    if (lit !== undefined)
      parts.push(`Minterm m${lit} is row ${bin(lit, n)}: ${mintermTerm(lit, nm)}.`);
    else if (spec.lit !== undefined && litRaw !== undefined)
      parts.push(`m${fmt4(litRaw)} is not a row of a ${n}-input table (0 to ${(1 << n) - 1}).`);
  } else if (n !== undefined) parts.push('A K-map is drawn for 2, 3 or 4 inputs.');
  return (
    <>
      {ok ? (
        <Canvas aspect={(w) => kmapLayout(n, w, groups.length).h / w}>
          {({ w, h }) => (
            <Svg width={w} height={h}>
              <KMapDrawing
                n={n}
                names={nm}
                ones={fits ? ones : []}
                dcs={fits ? dcs : []}
                groups={groups}
                lit={lit}
                w={w}
                showF={showF && fits}
              />
            </Svg>
          )}
        </Canvas>
      ) : null}
      {parts.length ? <Caption>{parts.join(' ')}</Caption> : null}
    </>
  );
}
