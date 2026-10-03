/**
 * HC186 `pipelineDiagram` (PipelineSpec in typesHe4n.ts): instructions down the side, clock
 * cycles across, each cell the stage the instruction is in that cycle, each stage its own fill
 * and its name written in (or a one-letter code with a key when the cells are narrow). Up to 8
 * rows; past 8, the first rows, “…”, and the last instruction after a gap in the cycles, so its
 * last cell sits at cycle k + n − 1 (plus stalls), bracketed under the grid. Stall bubbles are
 * dashed cells; forwarding arrows run from the end of one stage into the start of another.
 * Flat.
 */
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { PipelineSpec } from '@/data/modules/typesHe4n';
import { formatNumber } from '@/engine/format';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { fmt4, HBracket, textW, useReader } from './he3dKit';
import { pipelineCycles, pipelineRow, stageIndex, stageNames, type PipeCell } from './he4nMath';

const PAD = 4;
const HEAD = 20;
const CELL_H = 24;
const ROW_GAP = 4;

export const stageFill = (c: Palette, p: number) =>
  p < 0 ? c.pipeBubble : [c.pipeIF, c.pipeID, c.pipeEX, c.pipeMEM, c.pipeWB][p % 5]!;

/** A stage's short code: the first letter of the classic five (X for EX), or its number. */
const codeOf = (name: string, p: number) =>
  ({ IF: 'F', ID: 'D', EX: 'X', MEM: 'M', WB: 'W' })[name] ?? String(p + 1);

type Row = { kind: 'instr'; i: number; cells: PipeCell[] } | { kind: 'more' };

/** The rows and columns drawn for k stages and n instructions in a canvas `w` wide. */
export function pipelineLayout(
  k: number,
  n: number,
  stalls: { instr: number; before?: string; count: number }[],
  w: number,
  names: string[],
  labels: string[],
  forward = false,
) {
  const stages = stageNames(k, names);
  const row = (i: number) => pipelineRow(i, k, stages, stalls);
  const labelOf = (i: number) => labels[i - 1] ?? `i${i}`;
  const lastOf = (cells: PipeCell[]) => cells[cells.length - 1]!.cycle;
  const labelW = (shown: number[]) =>
    Math.min(120, Math.max(30, ...shown.map((i) => textW(labelOf(i)) + 10)));
  // Every row when n ≤ 8; else as many first rows (3 to 7) as leave cells 22 px wide.
  let first = n;
  if (n > 8) {
    first = 3;
    for (let f = 7; f >= 3; f--) {
      const end = lastOf(row(f));
      const tail = row(n);
      const cols = end + 1 + (lastOf(tail) - tail[0]!.cycle + 1);
      if ((w - 2 * PAD - labelW([1, n])) / cols >= 22) {
        first = f;
        break;
      }
    }
  }
  const shown =
    n > 8
      ? [...Array.from({ length: first }, (_, j) => j + 1), n]
      : [...Array(n).keys()].map((j) => j + 1);
  const rows: Row[] = shown.flatMap((i): Row[] =>
    n > 8 && i === n
      ? [{ kind: 'more' }, { kind: 'instr', i, cells: row(i) }]
      : [{ kind: 'instr', i, cells: row(i) }],
  );
  const endFirst = lastOf(row(first));
  const tail = row(n);
  const gap = n > 8 && tail[0]!.cycle > endFirst + 1;
  const columns: (number | 'gap')[] = [
    ...Array.from({ length: gap ? endFirst : lastOf(tail) }, (_, j) => j + 1),
    ...(gap ? (['gap'] as const) : []),
    ...(gap
      ? Array.from({ length: lastOf(tail) - tail[0]!.cycle + 1 }, (_, j) => tail[0]!.cycle + j)
      : []),
  ];
  const lw = labelW(shown);
  const cellW = Math.min(44, (w - 2 * PAD - lw) / columns.length);
  const gridW = cellW * columns.length;
  const x0 = Math.max(PAD, (w - lw - gridW) / 2) + lw;
  const colX = (cycle: number) => {
    const j = columns.indexOf(cycle);
    return j < 0 ? undefined : x0 + j * cellW;
  };
  const fits = (s: string) => textW(s) <= cellW - 4;
  const mode: 'name' | 'code' | 'none' = stages.every(fits)
    ? 'name'
    : stages.every((s, p) => fits(codeOf(s, p)))
      ? 'code'
      : 'none';
  // Rows sit further apart when forwarding arrows run between them.
  const rowGap = forward ? 12 : ROW_GAP;
  const gridBottom = HEAD + rows.length * (CELL_H + rowGap);
  const keyH = mode === 'name' && !stalls.length ? 0 : 20;
  return {
    stages,
    rows,
    columns,
    cellW,
    x0,
    lw,
    gridW,
    colX,
    mode,
    labelOf,
    rowY: (r: number) => HEAD + r * (CELL_H + rowGap),
    keyY: gridBottom + 14,
    bracketY: gridBottom + keyH + 12,
    h: gridBottom + keyH + 34,
  };
}

export function PipelineDiagram({ spec, calc }: { spec: PipelineSpec; calc: Calculator }) {
  const r = useReader(calc);
  const kRaw = r.get(spec.k);
  const nRaw = r.get(spec.n);
  const k = kRaw === undefined ? undefined : Math.round(kRaw);
  const n = nRaw === undefined ? undefined : Math.round(nRaw);
  const ok = k !== undefined && n !== undefined && k >= 1 && n >= 1 && k <= 40;
  const stalls = (spec.stalls ?? []).flatMap((s) => {
    const count = r.get(s.count);
    return count !== undefined && count > 0 && n !== undefined && s.instr <= n
      ? [{ ...s, count: Math.round(count) }]
      : [];
  });
  const total = ok ? pipelineCycles(k, n, stalls) : undefined;
  const parts: string[] = [];
  const v = (x: PipelineSpec['ts']) => r.get(x);
  const u = (x: PipelineSpec['ts']) => (r.unit(x) ? ` ${r.unit(x)}` : '');
  if (ok && total !== undefined) {
    const s = stalls.reduce((a, x) => a + x.count, 0);
    parts.push(
      `k + n − 1${s ? ' + stalls' : ''} = ${k} + ${formatNumber(n)} − 1${s ? ` + ${s}` : ''} = ${formatNumber(total)} cycles.`,
    );
    const ts = v(spec.ts);
    const time = v(spec.time);
    if (ts !== undefined && time !== undefined)
      parts.push(
        `Time = ${formatNumber(total)} × ${fmt4(ts)}${u(spec.ts)} = ${fmt4(time)}${u(spec.time)}.`,
      );
    const t1 = v(spec.t1);
    const sp = v(spec.speedup);
    if (t1 !== undefined && sp !== undefined && time !== undefined)
      parts.push(
        `Speedup = ${formatNumber(n)} × ${fmt4(t1)}${u(spec.t1)} ÷ ${fmt4(time)}${u(spec.time)} = ${fmt4(sp)}.`,
      );
  } else if (k !== undefined && n !== undefined)
    parts.push('A pipeline needs at least one stage and one instruction.');
  // A grid wider than 60 cycles can't be read on a phone: the caption alone then.
  const drawable =
    ok &&
    pipelineLayout(k, n, stalls, 358, spec.stages ?? [], spec.names ?? []).columns.length <= 60;
  if (ok && !drawable) parts.push('The grid is too many cycles wide to draw.');
  return (
    <>
      {ok && drawable ? (
        <Canvas
          aspect={(w) =>
            pipelineLayout(
              k,
              n,
              stalls,
              w,
              spec.stages ?? [],
              spec.names ?? [],
              !!spec.forward?.length,
            ).h / w
          }
        >
          {({ w, h }) => (
            <Svg width={w} height={h}>
              <Grid spec={spec} k={k} n={n} stalls={stalls} total={total!} w={w} />
            </Svg>
          )}
        </Canvas>
      ) : null}
      {parts.length ? <Caption>{parts.join(' ')}</Caption> : null}
    </>
  );
}

function Grid({
  spec,
  k,
  n,
  stalls,
  total,
  w,
}: {
  spec: PipelineSpec;
  k: number;
  n: number;
  stalls: { instr: number; before?: string; count: number }[];
  total: number;
  w: number;
}) {
  const c = usePalette();
  const L = pipelineLayout(
    k,
    n,
    stalls,
    w,
    spec.stages ?? [],
    spec.names ?? [],
    !!spec.forward?.length,
  );
  const lastCol = L.columns[L.columns.length - 1] as number;
  const headerShown = (j: number, col: number) =>
    textW(String(col)) <= L.cellW - 2 || j === 0 || j === L.columns.length - 1;
  const cellOf = (i: number, p: number) => {
    const row = L.rows.find((x) => x.kind === 'instr' && x.i === i);
    if (!row || row.kind !== 'instr') return undefined;
    const cell = row.cells.find((x) => x.stage === p);
    const x = cell ? L.colX(cell.cycle) : undefined;
    return cell && x !== undefined ? { x, y: L.rowY(L.rows.indexOf(row)) } : undefined;
  };
  return (
    <G>
      {L.columns.map((col, j) =>
        col === 'gap' ? (
          <ChartText
            key={`h${j}`}
            x={L.x0 + (j + 0.5) * L.cellW}
            y={14}
            textAnchor="middle"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            …
          </ChartText>
        ) : headerShown(j, col) ? (
          <ChartText
            key={`h${j}`}
            x={L.x0 + (j + 0.5) * L.cellW}
            y={14}
            textAnchor="middle"
            fontSize={chart.label}
            fontWeight={col === lastCol ? '700' : '400'}
            fill={col === lastCol ? c.chartInk : c.chartMuted}
          >
            {String(col)}
          </ChartText>
        ) : null,
      )}
      {L.rows.map((row, ri) => {
        const y = L.rowY(ri);
        if (row.kind === 'more')
          return (
            <ChartText
              key={`m${ri}`}
              x={L.x0 - 8}
              y={y + 16}
              textAnchor="end"
              fontSize={chart.label}
              fill={c.chartMuted}
            >
              …
            </ChartText>
          );
        return (
          <G key={`r${row.i}`}>
            <ChartText
              x={L.x0 - 8}
              y={y + 16}
              textAnchor="end"
              fontSize={chart.label}
              fontWeight="700"
              fill={c.chartInk}
            >
              {L.labelOf(row.i)}
            </ChartText>
            {row.cells.map((cell) => {
              const x = L.colX(cell.cycle);
              if (x === undefined) return null;
              const name = cell.stage < 0 ? 'stall' : L.stages[cell.stage]!;
              const text =
                cell.stage < 0
                  ? ''
                  : L.mode === 'name'
                    ? name
                    : L.mode === 'code'
                      ? codeOf(name, cell.stage)
                      : '';
              const last = row.i === n && cell.cycle === total;
              return (
                <G key={cell.cycle}>
                  <Rect
                    x={x + 1}
                    y={y}
                    width={L.cellW - 2}
                    height={CELL_H}
                    rx={3}
                    fill={stageFill(c, cell.stage)}
                    stroke={last ? c.chartInk : cell.stage < 0 ? c.chartMuted : c.chartGrid}
                    strokeWidth={last ? chart.stroke : 1}
                    strokeDasharray={cell.stage < 0 ? chart.dashFine : undefined}
                  />
                  {cell.stage < 0 ? (
                    <Circle
                      cx={x + L.cellW / 2}
                      cy={y + CELL_H / 2}
                      r={Math.min(6, L.cellW / 2 - 3)}
                      fill="none"
                      stroke={c.chartMuted}
                      strokeWidth={1.5}
                    />
                  ) : null}
                  {text ? (
                    <ChartText
                      x={x + L.cellW / 2}
                      y={y + 16}
                      textAnchor="middle"
                      fontSize={chart.label}
                      fontWeight={cell.stage < 0 ? '400' : '700'}
                      fill={cell.stage < 0 ? c.chartMuted : c.chartInk}
                    >
                      {text}
                    </ChartText>
                  ) : null}
                </G>
              );
            })}
          </G>
        );
      })}
      {/* Forwarding: from the end of the producer's stage into the start of the consumer's. */}
      {(spec.forward ?? []).map((fw, j) => {
        const a = cellOf(fw.from, stageIndex(L.stages, fw.out ?? 'EX', 2));
        const b = cellOf(fw.to, stageIndex(L.stages, fw.in ?? 'EX', 2));
        if (!a || !b) return null;
        // From the bottom of the producer's cell, through the gap between rows, to the top of
        // the consumer's.
        const x1 = a.x + L.cellW / 2;
        const y1 = a.y + CELL_H + 1;
        const x2 = b.x + L.cellW / 2;
        const y2 = b.y - 1;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy) || 1;
        const [ux, uy] = [dx / len, dy / len];
        const s = 8;
        return (
          <G key={`f${j}`}>
            <Line
              x1={x1}
              y1={y1}
              x2={x2 - ux * s}
              y2={y2 - uy * s}
              stroke={c.chartHighlight}
              strokeWidth={chart.stroke}
            />
            <Path
              d={`M${x2},${y2} L${x2 - ux * s - uy * s * 0.45},${y2 - uy * s + ux * s * 0.45} L${x2 - ux * s + uy * s * 0.45},${y2 - uy * s - ux * s * 0.45} Z`}
              fill={c.chartHighlight}
            />
          </G>
        );
      })}
      {L.mode !== 'name' || stalls.length ? (
        <ChartText
          x={w / 2}
          y={L.keyY}
          textAnchor="middle"
          fontSize={chart.label}
          fill={c.chartMuted}
        >
          {[
            ...(L.mode === 'code'
              ? [L.stages.map((s, p) => `${codeOf(s, p)} = ${s}`).join(' · ')]
              : []),
            ...(L.mode === 'none' ? [`Each row runs stages 1 to ${k} left to right.`] : []),
            ...(stalls.length ? ['○ = a stall (bubble)'] : []),
            ...(spec.forward?.length && L.mode === 'name' ? ['arrow = forwarded result'] : []),
          ].join(' · ')}
        </ChartText>
      ) : null}
      <HBracket
        x1={L.x0 + 1}
        x2={L.x0 + L.gridW - 1}
        y={L.bracketY}
        side="up"
        label={`${formatNumber(total)} cycles`}
        color={c.chartInk}
        w={w}
      />
    </G>
  );
}
