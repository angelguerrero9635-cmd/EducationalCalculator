/**
 * HC187 (`typesHe4n.ts`): the `dataStructure` explore figure. A scene's operations are replayed
 * (reps/he4nMath.ts) and the structure drawn as it stands: a stack upright with its top marked,
 * a queue left to right with front and rear, a circular buffer as a ring of numbered slots with
 * front and rear and the wrap, a linked list of nodes and arrows from head to ∅, or a sorted
 * array with binary search's low, mid and high. What was added last is lit (and heavy, not by
 * colour alone); what came out last stands outside, dashed, with “out”. Flat.
 */
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { DataStructureScene } from '@/data/modules/typesHe4n';
import { chart, usePalette, type Palette } from '@/theme';

import { Canvas, ChartText } from '../reps/common';
import { binarySteps, dsReplay } from '../reps/he4nMath';

/** The figure's height for a scene. */
export function dataStructureHeight(s: DataStructureScene): number {
  const st = dsReplay(s);
  switch (s.structure) {
    case 'stack':
      return 44 + 34 * Math.max(4, st.items.length + 1);
    case 'ring':
      return 284;
    case 'queue':
      return 130;
    case 'list':
      return 120;
    case 'array':
      return 150;
  }
}

export function DataStructureFigureView({ scene }: { scene: DataStructureScene }) {
  return (
    <Canvas aspect={(w) => dataStructureHeight(scene) / w}>
      {({ w, h }) => (
        <Svg width={w} height={h}>
          <Drawing s={scene} w={w} h={h} />
        </Svg>
      )}
    </Canvas>
  );
}

/** A box with a value in it: lit, plain, faded or empty (dashed). */
function Box({
  x,
  y,
  bw,
  bh,
  text,
  look,
  c,
}: {
  x: number;
  y: number;
  bw: number;
  bh: number;
  text?: string;
  look: 'lit' | 'plain' | 'faded' | 'empty' | 'out';
  c: Palette;
}) {
  const fill =
    look === 'lit'
      ? c.chartHighlight
      : look === 'faded' || look === 'empty'
        ? c.chartSurface
        : c.chartFill;
  const stroke = look === 'lit' ? c.chartHighlight : look === 'faded' ? c.chartGrid : c.chartInk;
  return (
    <G>
      <Rect
        x={x}
        y={y}
        width={bw}
        height={bh}
        rx={4}
        fill={look === 'out' ? 'none' : fill}
        stroke={stroke}
        strokeWidth={look === 'lit' ? chart.strokeHeavy : look === 'faded' ? 1 : chart.strokeLight}
        strokeDasharray={look === 'empty' || look === 'out' ? chart.dashFine : undefined}
      />
      {text !== undefined ? (
        <ChartText
          x={x + bw / 2}
          y={y + bh / 2 + 5}
          textAnchor="middle"
          fontSize={chart.value}
          fontWeight="700"
          fill={look === 'lit' ? c.onChartHighlight : look === 'faded' ? c.chartMuted : c.chartInk}
        >
          {text}
        </ChartText>
      ) : null}
    </G>
  );
}

/** A straight arrow with a head at (x2, y2). */
function Arrow({
  x1,
  y1,
  x2,
  y2,
  color,
  heavy,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  heavy?: boolean;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l = Math.hypot(dx, dy) || 1;
  const [ux, uy] = [dx / l, dy / l];
  const s = 8;
  return (
    <G>
      <Line
        x1={x1}
        y1={y1}
        x2={x2 - ux * s}
        y2={y2 - uy * s}
        stroke={color}
        strokeWidth={heavy ? chart.strokeHeavy : chart.strokeLight}
      />
      <Path
        d={`M${x2},${y2} L${x2 - ux * s - uy * s * 0.45},${y2 - uy * s + ux * s * 0.45} L${x2 - ux * s + uy * s * 0.45},${y2 - uy * s - ux * s * 0.45} Z`}
        fill={color}
      />
    </G>
  );
}

function Label({
  x,
  y,
  text,
  c,
  anchor = 'middle',
  bold = true,
  muted = false,
}: {
  x: number;
  y: number;
  text: string;
  c: Palette;
  anchor?: 'start' | 'middle' | 'end';
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <ChartText
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={chart.label}
      fontWeight={bold ? '700' : '400'}
      fill={muted ? c.chartMuted : c.chartInk}
    >
      {text}
    </ChartText>
  );
}

function Drawing({ s, w, h }: { s: DataStructureScene; w: number; h: number }) {
  const c = usePalette();
  const st = dsReplay(s);
  const lastOp = (s.ops ?? [])[(s.ops ?? []).length - 1] ?? '';
  const removed = st.out !== undefined && /^(pop|dequeue|delete)/.test(lastOp);
  switch (s.structure) {
    case 'stack': {
      const bw = 64;
      const bh = 30;
      const x = w / 2 - bw / 2;
      const base = h - 16;
      const n = st.items.length;
      const topY = base - n * (bh + 4);
      return (
        <G>
          <Line
            x1={x - 14}
            y1={base + 2}
            x2={x + bw + 14}
            y2={base + 2}
            stroke={c.chartInk}
            strokeWidth={chart.stroke}
          />
          {st.items.map((v, i) => (
            <Box
              key={i}
              x={x}
              y={base - (i + 1) * (bh + 4) + 2}
              bw={bw}
              bh={bh}
              text={String(v)}
              look={i === st.added ? 'lit' : 'plain'}
              c={c}
            />
          ))}
          {n ? (
            <G>
              <Arrow
                x1={x + bw + 58}
                y1={topY + bh / 2 + 2}
                x2={x + bw + 6}
                y2={topY + bh / 2 + 2}
                color={c.chartInk}
              />
              <Label x={x + bw + 62} y={topY + bh / 2 + 6} text="top" c={c} anchor="start" />
            </G>
          ) : (
            <Label x={w / 2} y={base - 12} text="empty" c={c} muted bold={false} />
          )}
          {removed ? (
            <G>
              <Box
                x={x - bw - 44}
                y={topY - bh - 2}
                bw={bw}
                bh={bh}
                text={String(st.out)}
                look="out"
                c={c}
              />
              <Label x={x - 44 - bw / 2} y={topY - bh - 8} text="out" c={c} />
              <Arrow
                x1={x + 4}
                y1={topY - 4}
                x2={x - 40}
                y2={topY - bh / 2 - 2}
                color={c.chartMuted}
              />
            </G>
          ) : null}
        </G>
      );
    }
    case 'queue': {
      const bw = 44;
      const bh = 36;
      const n = st.items.length;
      const outW = removed ? bw + 30 : 0;
      const total = outW + Math.max(n, 1) * (bw + 4);
      const x0 = Math.max(8, (w - total) / 2) + outW;
      const y = 34;
      return (
        <G>
          {st.items.map((v, i) => (
            <Box
              key={i}
              x={x0 + i * (bw + 4)}
              y={y}
              bw={bw}
              bh={bh}
              text={String(v)}
              look={i === st.added ? 'lit' : 'plain'}
              c={c}
            />
          ))}
          {n ? (
            <G>
              <Label x={x0 + bw / 2} y={y + bh + 22} text="front" c={c} />
              <Label
                x={x0 + (n - 1) * (bw + 4) + bw / 2}
                y={y + bh + (n === 1 ? 38 : 22)}
                text="rear"
                c={c}
              />
              <Label
                x={x0 + n * (bw + 4) + 2}
                y={y + bh / 2 + 4}
                text="← in"
                c={c}
                anchor="start"
                muted
                bold={false}
              />
            </G>
          ) : (
            <Label x={w / 2} y={y + bh / 2 + 4} text="empty" c={c} muted bold={false} />
          )}
          {removed ? (
            <G>
              <Box x={x0 - outW} y={y} bw={bw} bh={bh} text={String(st.out)} look="out" c={c} />
              <Label x={x0 - outW + bw / 2} y={y - 8} text="out" c={c} />
              <Arrow
                x1={x0 - 4}
                y1={y + bh / 2}
                x2={x0 - outW + bw + 4}
                y2={y + bh / 2}
                color={c.chartMuted}
              />
            </G>
          ) : null}
        </G>
      );
    }
    case 'ring': {
      const N = st.slots?.length ?? 8;
      const cx = w / 2;
      const cy = 134;
      const R = 84;
      const bw = 38;
      const bh = 28;
      const at = (i: number): [number, number] => {
        const a = -Math.PI / 2 + (2 * Math.PI * i) / N;
        return [cx + R * Math.cos(a), cy + R * Math.sin(a)];
      };
      const front = st.front ?? 0;
      const count = st.items.length;
      const rear = (front + count - 1 + N) % N;
      return (
        <G>
          <Circle cx={cx} cy={cy} r={R} fill="none" stroke={c.chartGrid} strokeWidth={1} />
          {Array.from({ length: N }, (_, i) => {
            const [x, y] = at(i);
            const v = st.slots?.[i];
            const a = -Math.PI / 2 + (2 * Math.PI * i) / N;
            return (
              <G key={i}>
                <Box
                  x={x - bw / 2}
                  y={y - bh / 2}
                  bw={bw}
                  bh={bh}
                  text={v === undefined ? undefined : String(v)}
                  look={i === st.added ? 'lit' : v === undefined ? 'empty' : 'plain'}
                  c={c}
                />
                <Label
                  x={cx + (R + 32) * Math.cos(a)}
                  y={cy + (R + 30) * Math.sin(a) + 4}
                  text={`[${i}]`}
                  c={c}
                  muted
                  bold={false}
                />
              </G>
            );
          })}
          {count ? (
            <G>
              <PointerIn at={at(front)} cx={cx} cy={cy} label="front" c={c} />
              {rear !== front ? (
                <PointerIn at={at(rear)} cx={cx} cy={cy} label="rear" c={c} />
              ) : null}
            </G>
          ) : (
            <Label x={cx} y={cy + 4} text="empty" c={c} muted bold={false} />
          )}
          {removed ? <Label x={8} y={18} text={`out: ${st.out}`} c={c} anchor="start" /> : null}
          <Label x={cx} y={h - 6} text={`slot ${N - 1} wraps to slot 0`} c={c} muted bold={false} />
        </G>
      );
    }
    case 'list': {
      const nw = 52;
      const bh = 32;
      const gap = 22;
      const n = st.items.length;
      const total = 46 + n * (nw + gap) + 18;
      const x0 = Math.max(6, (w - total) / 2);
      const y = 44;
      const headLit = st.added === 0 || (removed && lastOp === 'delete head');
      return (
        <G>
          <Label x={x0 + 12} y={y - 2} text="head" c={c} />
          <Rect
            x={x0 + 2}
            y={y + 6}
            width={20}
            height={20}
            rx={3}
            fill={c.chartSurface}
            stroke={headLit ? c.chartHighlight : c.chartInk}
            strokeWidth={headLit ? chart.strokeHeavy : chart.strokeLight}
          />
          <Circle cx={x0 + 12} cy={y + 16} r={3} fill={c.chartInk} />
          <Arrow
            x1={x0 + 15}
            y1={y + 16}
            x2={x0 + 45}
            y2={y + bh / 2}
            color={headLit ? c.chartHighlight : c.chartInk}
            heavy={headLit}
          />
          {st.items.map((v, i) => {
            const x = x0 + 46 + i * (nw + gap);
            const lit = i === st.added;
            return (
              <G key={i}>
                <Box x={x} y={y} bw={nw} bh={bh} look={lit ? 'lit' : 'plain'} c={c} />
                <Line
                  x1={x + nw * 0.62}
                  y1={y}
                  x2={x + nw * 0.62}
                  y2={y + bh}
                  stroke={lit ? c.onChartHighlight : c.chartInk}
                  strokeWidth={1}
                />
                <ChartText
                  x={x + nw * 0.31}
                  y={y + bh / 2 + 5}
                  textAnchor="middle"
                  fontSize={chart.value}
                  fontWeight="700"
                  fill={lit ? c.onChartHighlight : c.chartInk}
                >
                  {String(v)}
                </ChartText>
                <Circle
                  cx={x + nw * 0.81}
                  cy={y + bh / 2}
                  r={3}
                  fill={lit ? c.onChartHighlight : c.chartInk}
                />
                {i < n - 1 ? (
                  <Arrow
                    x1={x + nw * 0.81}
                    y1={y + bh / 2}
                    x2={x + nw + gap}
                    y2={y + bh / 2}
                    color={lit ? c.chartHighlight : c.chartInk}
                    heavy={lit}
                  />
                ) : (
                  <G>
                    <Line
                      x1={x + nw * 0.81}
                      y1={y + bh / 2}
                      x2={x + nw + 8}
                      y2={y + bh / 2}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    <Label x={x + nw + 14} y={y + bh / 2 + 5} text="∅" c={c} />
                  </G>
                )}
              </G>
            );
          })}
          {removed ? <Label x={w / 2} y={y + bh + 40} text={`out: ${st.out}`} c={c} /> : null}
        </G>
      );
    }
    case 'array': {
      const vals = s.values ?? [];
      const steps = binarySteps(vals, s.target ?? 0);
      const k = Math.max(1, Math.min(s.step ?? 1, steps.length));
      const cur = steps[k - 1];
      const bw = Math.min(34, (w - 16) / Math.max(vals.length, 1));
      const x0 = (w - bw * vals.length) / 2;
      const y = 38;
      const bh = 30;
      // Pointers on one index share one arrow, their names stacked under it.
      const at = cur
        ? [
            { i: cur.low, t: 'low' },
            { i: cur.mid, t: 'mid' },
            { i: cur.high, t: 'high' },
          ].reduce<Map<number, string[]>>(
            (m, p) => m.set(p.i, [...(m.get(p.i) ?? []), p.t]),
            new Map(),
          )
        : new Map<number, string[]>();
      const pointers = [...at.entries()].map(([i, names]) => {
        const px = x0 + (i + 0.5) * bw;
        const isMid = names.includes('mid');
        return (
          <G key={i}>
            <Arrow
              x1={px}
              y1={y + bh + 18}
              x2={px}
              y2={y + bh + 3}
              color={isMid ? c.chartHighlight : c.chartInk}
              heavy={isMid}
            />
            {names.map((t, r) => (
              <Label key={t} x={px} y={y + bh + 31 + r * 15} text={t} c={c} />
            ))}
          </G>
        );
      });
      return (
        <G>
          <Label x={w / 2} y={16} text={`target ${s.target ?? ''} · comparison ${k}`} c={c} />
          {vals.map((v, i) => {
            const inRange = cur && i >= cur.low && i <= cur.high;
            return (
              <G key={i}>
                <Box
                  x={x0 + i * bw}
                  y={y}
                  bw={bw}
                  bh={bh}
                  text={String(v)}
                  look={cur && i === cur.mid ? 'lit' : inRange ? 'plain' : 'faded'}
                  c={c}
                />
                <ChartText
                  x={x0 + (i + 0.5) * bw}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fill={c.chartMuted}
                >
                  {String(i)}
                </ChartText>
              </G>
            );
          })}
          {pointers}
        </G>
      );
    }
  }
}

/** A pointer from inside the ring to a slot, named. */
function PointerIn({
  at,
  cx,
  cy,
  label,
  c,
}: {
  at: [number, number];
  cx: number;
  cy: number;
  label: string;
  c: Palette;
}) {
  const dx = at[0] - cx;
  const dy = at[1] - cy;
  const l = Math.hypot(dx, dy) || 1;
  const [ux, uy] = [dx / l, dy / l];
  return (
    <G>
      <Arrow
        x1={cx + ux * 44}
        y1={cy + uy * 44}
        x2={at[0] - ux * 17}
        y2={at[1] - uy * 15}
        color={c.chartInk}
      />
      <ChartText
        x={cx + ux * 24}
        y={cy + uy * 24 + 4}
        textAnchor="middle"
        fontSize={chart.label}
        fontWeight="700"
        fill={c.chartInk}
        halo
      >
        {label}
      </ChartText>
    </G>
  );
}
