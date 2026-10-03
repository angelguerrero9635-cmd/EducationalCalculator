/**
 * HC189 `memoryMap` (MemoryMapSpec in typesHe4n.ts). `paging`: the virtual address cut into page
 * number and offset, the virtual pages around its page, the page table with its entry and the
 * physical frames around its frame, all three lit and joined by arrows, the offset ticked at the
 * same place in the page and the frame; under them PA = frame × size + offset. `inode`: the
 * inode's direct pointers and its single, double and triple indirect pointers fanning out
 * through blocks of k pointers, each level's block count written and summed. Flat; a "?" draws
 * nothing for that value.
 */
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { MemoryMapSpec } from '@/data/modules/typesHe4n';
import { formatNumber } from '@/engine/format';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { useReader } from './he3dKit';

type Reader = ReturnType<typeof useReader>;

export function MemoryMap({ spec, calc }: { spec: MemoryMapSpec; calc: Calculator }) {
  const r = useReader(calc);
  const c = usePalette();
  const drawn = spec.mode === 'inode' ? inode(spec, r, c) : paging(spec, r, c);
  return (
    <>
      <Canvas aspect={(w) => drawn.h / w}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            {drawn.body(w)}
          </Svg>
        )}
      </Canvas>
      {drawn.caption ? <Caption>{drawn.caption}</Caption> : null}
    </>
  );
}

const f = (x: number) => formatNumber(x);

function T({
  x,
  y,
  text,
  c,
  anchor = 'middle',
  bold = false,
  muted = false,
  light = false,
}: {
  x: number;
  y: number;
  text: string;
  c: Palette;
  anchor?: 'start' | 'middle' | 'end';
  bold?: boolean;
  muted?: boolean;
  light?: boolean;
}) {
  return (
    <ChartText
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={chart.label}
      fontWeight={bold ? '700' : '400'}
      fill={light ? c.onChartHighlight : muted ? c.chartMuted : c.chartInk}
    >
      {text}
    </ChartText>
  );
}

const arrowHead = (x2: number, y2: number, ux: number, uy: number, s = 7) =>
  `M${x2},${y2} L${x2 - ux * s - uy * s * 0.45},${y2 - uy * s + ux * s * 0.45} L${x2 - ux * s + uy * s * 0.45},${y2 - uy * s - ux * s * 0.45} Z`;

function Arrow({
  x1,
  y1,
  x2,
  y2,
  c,
  lit,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  c: Palette;
  lit?: boolean;
}) {
  const l = Math.hypot(x2 - x1, y2 - y1) || 1;
  const [ux, uy] = [(x2 - x1) / l, (y2 - y1) / l];
  const color = lit ? c.chartHighlight : c.chartInk;
  return (
    <G>
      <Line
        x1={x1}
        y1={y1}
        x2={x2 - ux * 6}
        y2={y2 - uy * 6}
        stroke={color}
        strokeWidth={lit ? chart.stroke : chart.strokeLight}
      />
      <Path d={arrowHead(x2, y2, ux, uy)} fill={color} />
    </G>
  );
}

// ─── paging ──────────────────────────────────────────────────────────────────

const ROW = 24;
const PH = 282;

function paging(spec: MemoryMapSpec, r: Reader, c: Palette) {
  const size = r.get(spec.size);
  const va = r.get(spec.va);
  const okSize = size !== undefined && size >= 1;
  const page = okSize && va !== undefined ? Math.floor(va / size) : undefined;
  const offset = okSize && va !== undefined ? va - page! * size : undefined;
  const frame = r.get(spec.frame);
  const pa =
    frame !== undefined && offset !== undefined && okSize ? frame * size + offset : undefined;
  const bits = okSize ? Math.log2(size) : undefined;
  const wholeBits = bits !== undefined && Number.isInteger(bits);
  const parts: string[] = [];
  if (page !== undefined && offset !== undefined)
    parts.push(
      `Page = ⌊${f(va!)} ÷ ${f(size!)}⌋ = ${f(page)}; offset = ${f(va!)} − ${f(page)} × ${f(size!)} = ${f(offset)}.`,
    );
  if (pa !== undefined) parts.push(`PA = ${f(frame!)} × ${f(size!)} + ${f(offset!)} = ${f(pa)}.`);
  const rows = (lit: number | undefined) =>
    lit === undefined
      ? [0, 1, 2, 3, 4]
      : [-2, -1, 0, 1, 2]
          .map((d) => lit + d)
          .filter((x) => x >= 0)
          .slice(0, 5);
  const body = (w: number) => {
    const colW = Math.min(92, (w - 40) / 3);
    const gap = (w - 3 * colW) / 4;
    const xs = [gap, 2 * gap + colW, 3 * gap + 2 * colW];
    const top = 68;
    const vRows = rows(page);
    const fRows = rows(frame);
    const yOf = (list: number[], x: number | undefined) =>
      x === undefined ? undefined : top + 22 + list.indexOf(x) * ROW;
    const entry = (p: number) =>
      p === page
        ? frame === undefined
          ? '?'
          : f(frame)
        : spec.table?.[p] !== undefined
          ? f(spec.table[p]!)
          : '…';
    // The address bar: page number | offset.
    const bar = (y: number, left: string, right: string, label: string) => (
      <G>
        <T x={w / 2} y={y - 6} text={label} c={c} bold />
        <Rect
          x={20}
          y={y}
          width={(w - 40) * 0.45}
          height={22}
          fill={c.chartHighlight}
          stroke={c.chartHighlight}
          strokeWidth={1}
        />
        <Rect
          x={20 + (w - 40) * 0.45}
          y={y}
          width={(w - 40) * 0.55}
          height={22}
          fill={c.chartFill}
          stroke={c.chartInk}
          strokeWidth={1}
        />
        <T x={20 + (w - 40) * 0.225} y={y + 15} text={left} c={c} bold light />
        <T x={20 + (w - 40) * 0.725} y={y + 15} text={right} c={c} bold />
      </G>
    );
    const offText = (x: number | undefined) =>
      x === undefined ? 'offset ?' : `offset ${f(x)}${wholeBits ? ` (${bits} bits)` : ''}`;
    const vy = yOf(vRows, page);
    const fy = yOf(fRows, frame);
    const tick = (x0: number, y: number) =>
      offset !== undefined && okSize ? (
        <Rect
          x={x0 + 4}
          y={y + ROW - 6}
          width={Math.max(2, (colW - 8) * (offset / size!))}
          height={2.5}
          fill={c.onChartHighlight}
        />
      ) : null;
    return (
      <G>
        {bar(
          24,
          page === undefined ? 'page ?' : `page ${f(page)}`,
          offText(offset),
          va === undefined ? 'VA = ?' : `VA = ${f(va)}`,
        )}
        {['virtual pages', 'page table', 'physical frames'].map((t, k) => (
          <T key={t} x={xs[k]! + colW / 2} y={top + 12} text={t} c={c} bold muted />
        ))}
        {vRows.map((p, i) => {
          const y = top + 22 + i * ROW;
          const lit = p === page;
          return (
            <G key={`v${p}`}>
              <Rect
                x={xs[0]!}
                y={y}
                width={colW}
                height={ROW - 2}
                fill={lit ? c.chartHighlight : c.chartSurface}
                stroke={lit ? c.chartHighlight : c.chartGrid}
                strokeWidth={lit ? chart.stroke : 1}
              />
              <T
                x={xs[0]! + colW / 2}
                y={y + 15}
                text={`page ${f(p)}`}
                c={c}
                bold={lit}
                light={lit}
              />
              {lit ? tick(xs[0]!, y) : null}
            </G>
          );
        })}
        {vRows.map((p, i) => {
          const y = top + 22 + i * ROW;
          const lit = p === page;
          return (
            <G key={`t${p}`}>
              <Rect
                x={xs[1]!}
                y={y}
                width={colW}
                height={ROW - 2}
                fill={lit ? c.chartHighlight : c.chartSurface}
                stroke={lit ? c.chartHighlight : c.chartGrid}
                strokeWidth={lit ? chart.stroke : 1}
              />
              <T
                x={xs[1]! + colW / 2}
                y={y + 15}
                text={`${f(p)} → ${entry(p)}`}
                c={c}
                bold={lit}
                light={lit}
              />
            </G>
          );
        })}
        {fRows.map((fr, i) => {
          const y = top + 22 + i * ROW;
          const lit = fr === frame;
          return (
            <G key={`f${fr}`}>
              <Rect
                x={xs[2]!}
                y={y}
                width={colW}
                height={ROW - 2}
                fill={lit ? c.chartHighlight : c.chartSurface}
                stroke={lit ? c.chartHighlight : c.chartGrid}
                strokeWidth={lit ? chart.stroke : 1}
              />
              <T
                x={xs[2]! + colW / 2}
                y={y + 15}
                text={`frame ${f(fr)}`}
                c={c}
                bold={lit}
                light={lit}
              />
              {lit ? tick(xs[2]!, y) : null}
            </G>
          );
        })}
        {vy !== undefined ? (
          <Arrow x1={xs[0]! + colW + 2} y1={vy + 11} x2={xs[1]! - 2} y2={vy + 11} c={c} lit />
        ) : null}
        {vy !== undefined && fy !== undefined ? (
          <Arrow x1={xs[1]! + colW + 2} y1={vy + 11} x2={xs[2]! - 2} y2={fy + 11} c={c} lit />
        ) : null}
        {bar(
          PH - 34,
          frame === undefined ? 'frame ?' : `frame ${f(frame)}`,
          offText(offset),
          pa === undefined ? 'PA = ?' : `PA = ${f(pa)}`,
        )}
      </G>
    );
  };
  return { h: PH, body, caption: parts.join(' ') };
}

// ─── inode ───────────────────────────────────────────────────────────────────

const IH = 270;

function inode(spec: MemoryMapSpec, r: Reader, c: Palette) {
  const B = r.get(spec.B);
  const p = r.get(spec.p);
  const d = r.get(spec.d);
  const k = B !== undefined && p !== undefined && p > 0 ? Math.floor(B / p) : r.get(spec.k);
  const counts = [d, k, k === undefined ? undefined : k ** 2, k === undefined ? undefined : k ** 3];
  const total = counts.every((x) => x !== undefined)
    ? counts.reduce((a, x) => a! + x!, 0)!
    : undefined;
  const bytes = total !== undefined && B !== undefined ? total * B : undefined;
  const parts: string[] = [];
  if (k !== undefined && B !== undefined && p !== undefined)
    parts.push(`k = ${f(B)} ÷ ${f(p)} = ${f(k)} pointers a block.`);
  if (total !== undefined)
    parts.push(`Largest file: ${counts.map((x) => f(x!)).join(' + ')} = ${f(total)} blocks.`);
  if (bytes !== undefined) parts.push(`${f(total!)} × ${f(B!)} B = ${f(bytes)} B.`);
  const body = (w: number) => {
    const x0 = 6;
    const iw = 80;
    const rows = ['direct', 'single', 'double', 'triple'];
    const rowY = [40, 104, 150, 200];
    const blk = (x: number, y: number, lit = false) => (
      <Rect
        x={x}
        y={y}
        width={22}
        height={16}
        rx={2}
        fill={lit ? c.chartFill : c.chartSurface}
        stroke={c.chartInk}
        strokeWidth={1}
      />
    );
    const stack = (x: number, y: number) => (
      <G>
        {blk(x + 6, y - 6)}
        {blk(x + 3, y - 3)}
        {blk(x, y)}
      </G>
    );
    const textX = x0 + iw + 8 + 3 * 28 + 36;
    const label = [
      d === undefined ? 'd = ?' : `d = ${f(d)}`,
      k === undefined ? 'k = ?' : `k = ${f(k)}`,
      k === undefined ? 'k² = ?' : `k² = ${f(k ** 2)}`,
      k === undefined ? 'k³ = ?' : `k³ = ${f(k ** 3)}`,
    ];
    const nDirect = d === undefined ? 0 : Math.min(Math.round(d), 16);
    return (
      <G>
        <Rect
          x={x0}
          y={8}
          width={iw}
          height={IH - 50}
          rx={5}
          fill={c.chartSurface}
          stroke={c.chartInk}
          strokeWidth={chart.stroke}
        />
        <T x={x0 + iw / 2} y={24} text="inode" c={c} bold />
        {/* The direct pointers, in rows of 6. */}
        {Array.from({ length: nDirect }, (_, i) => (
          <Rect
            key={i}
            x={x0 + 7 + (i % 6) * 11}
            y={rowY[0]! - 6 + Math.floor(i / 6) * 12}
            width={9}
            height={9}
            rx={1.5}
            fill={c.chartFill}
            stroke={c.chartInk}
            strokeWidth={1}
          />
        ))}
        {d !== undefined && d > 16 ? (
          <T x={x0 + iw / 2} y={rowY[0]! + 46} text="…" c={c} muted />
        ) : null}
        {rows.slice(1).map((name, j) => (
          <G key={name}>
            <Rect
              x={x0 + 8}
              y={rowY[j + 1]! - 10}
              width={iw - 16}
              height={22}
              rx={3}
              fill={c.chartFill}
              stroke={c.chartInk}
              strokeWidth={1}
            />
            <T x={x0 + iw / 2} y={rowY[j + 1]! + 5} text={name} c={c} />
          </G>
        ))}
        {/* direct → data blocks */}
        <Arrow x1={x0 + iw} y1={rowY[0]!} x2={textX - 30} y2={rowY[0]!} c={c} />
        {stack(textX - 26, rowY[0]! - 8)}
        {/* single: one block of pointers → k data blocks */}
        {[1, 2, 3].map((level) => {
          const y = rowY[level]!;
          const xs = Array.from({ length: level }, (_, i) => x0 + iw + 8 + i * 28);
          return (
            <G key={level}>
              <Arrow x1={x0 + iw - 8} y1={y + 1} x2={xs[0]!} y2={y + 1} c={c} />
              {xs.map((x, i) => (
                <G key={i}>
                  {i === 0 ? blk(x, y - 7, true) : stack(x, y - 7)}
                  <Arrow
                    x1={x + 22 + (i === 0 ? 0 : 6)}
                    y1={y + 1}
                    x2={i + 1 < level ? xs[i + 1]! : textX - 30}
                    y2={y + 1}
                    c={c}
                  />
                </G>
              ))}
              {stack(textX - 26, y - 7)}
            </G>
          );
        })}
        {label.map((t, j) => (
          <T key={t} x={textX + 8} y={rowY[j]! + 5} text={t} c={c} anchor="start" bold />
        ))}
        <T x={x0 + iw + 14} y={IH - 26} text="pointer blocks" c={c} anchor="start" muted />
        <T x={textX + 8} y={IH - 26} text="data blocks" c={c} anchor="start" muted />
        <T
          x={w / 2}
          y={IH - 6}
          text={total === undefined ? 'blocks = ?' : `${f(total)} blocks in all`}
          c={c}
          bold
        />
      </G>
    );
  };
  return { h: IH, body, caption: parts.join(' ') };
}
