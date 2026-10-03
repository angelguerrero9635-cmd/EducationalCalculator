/**
 * HC191 `datapath` (DatapathSpec in typesHe4n.ts): the five units of a single-cycle datapath in
 * a row, wired left to right (instruction memory, register read, ALU, data memory, write back),
 * each one's delay under it. An instruction class lights the units it uses (filled and heavy;
 * the others dashed), and under the row a bar to scale adds their delays in series; with
 * `classes` every class has its bar, the slowest bracketed as the clock period. With `cpu`, a
 * strip of clock cycles of T shows instructions CPI cycles long. Flat; a "?" delay draws its
 * unit with no number and no bar.
 */
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { DatapathSpec, InstrClass } from '@/data/modules/typesHe4n';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { fmt4, HBracket, useReader } from './he3dKit';
import { CLASS_NAMES, CLASS_UNITS, classTime } from './he4nMath';
import { stageFill } from './PipelineDiagram';

const UNITS = [
  ['Instr.', 'memory'],
  ['Register', 'read'],
  ['ALU', ''],
  ['Data', 'memory'],
  ['Register', 'write'],
];
const CLASSES: InstrClass[] = ['load', 'store', 'rtype', 'branch'];
const BOX_Y = 8;
const BOX_H = 44;
const BAR_H = 20;

export function Datapath({ spec, calc }: { spec: DatapathSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useReader(calc);
  const delays = (spec.delays ?? []).map((d) => r.get(d));
  const unit = spec.delays?.[0] !== undefined ? (r.unit(spec.delays[0]) ?? 'ps') : 'ps';
  const known = delays.length === 5 && delays.every((d) => d !== undefined && d >= 0);
  const ds = known ? (delays as number[]) : undefined;
  const lit = spec.instr
    ? CLASS_UNITS[spec.instr]
    : spec.cpu
      ? [true, true, true, true, true]
      : undefined;
  const rows: InstrClass[] = spec.classes ? CLASSES : spec.instr ? [spec.instr] : [];
  const times = ds ? rows.map((cl) => classTime(cl, ds)) : [];
  const slowest = times.length ? Math.max(...times) : undefined;
  const cpi = r.get(spec.cpu?.cpi);
  const T = r.get(spec.cpu?.T);
  const hasCpu = !!spec.cpu;
  const barTop = BOX_Y + BOX_H + 30;
  const h = hasCpu ? barTop + 74 : barTop + rows.length * (BAR_H + 8) + 36;
  const parts: string[] = [];
  if (ds && spec.instr && !spec.classes)
    parts.push(
      `${CLASS_NAMES[spec.instr]}: ${ds
        .filter((_, i) => lit![i])
        .map(fmt4)
        .join(' + ')} = ${fmt4(times[0]!)} ${unit}.`,
    );
  if (ds && spec.classes)
    parts.push(
      `${rows.map((cl, i) => `${CLASS_NAMES[cl]} ${fmt4(times[i]!)}`).join(', ')} ${unit}: the slowest, ${fmt4(slowest!)} ${unit}, sets the period.`,
    );
  const f = r.get(spec.freq);
  if (slowest !== undefined && f !== undefined)
    parts.push(
      `f = 1 ÷ ${fmt4(slowest)} ${unit} = ${fmt4(f)}${r.unit(spec.freq) ? ` ${r.unit(spec.freq)}` : ''}.`,
    );
  if (hasCpu) {
    const ic = r.get(spec.cpu?.ic);
    const t = r.get(spec.cpu?.t);
    const u = (x: DatapathSpec['period']) => (r.unit(x) ? ` ${r.unit(x)}` : '');
    if (ic !== undefined && cpi !== undefined && T !== undefined && t !== undefined)
      parts.push(
        `t = IC × CPI × T = ${fmt4(ic)} × ${fmt4(cpi)} × ${fmt4(T)}${u(spec.cpu?.T)} = ${fmt4(t)}${u(spec.cpu?.t)}.`,
      );
  }
  return (
    <>
      <Canvas aspect={(w) => h / w}>
        {({ w }) => (
          <Svg width={w} height={h}>
            <Units w={w} ds={ds ? ds : delays} lit={lit} unit={unit} c={c} />
            {hasCpu ? (
              <Cycles w={w} y={barTop} cpi={cpi} T={T} unitT={r.unit(spec.cpu?.T) ?? ''} c={c} />
            ) : ds ? (
              <Bars
                w={w}
                y={barTop}
                rows={rows}
                ds={ds}
                lit={spec.instr}
                slowest={slowest!}
                unit={unit}
                c={c}
              />
            ) : null}
          </Svg>
        )}
      </Canvas>
      {parts.length ? <Caption>{parts.join(' ')}</Caption> : null}
    </>
  );
}

function Units({
  w,
  ds,
  lit,
  unit,
  c,
}: {
  w: number;
  ds: (number | undefined)[];
  lit?: boolean[];
  unit: string;
  c: Palette;
}) {
  const gap = 10;
  const bw = (w - 8 - 4 * gap) / 5;
  return (
    <G>
      {UNITS.map(([a, b], i) => {
        const x = 4 + i * (bw + gap);
        const on = lit ? lit[i]! : true;
        const d = ds[i];
        return (
          <G key={i}>
            {i > 0 ? (
              <G>
                <Line
                  x1={x - gap}
                  y1={BOX_Y + BOX_H / 2}
                  x2={x - 5}
                  y2={BOX_Y + BOX_H / 2}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <Path
                  d={`M${x},${BOX_Y + BOX_H / 2} L${x - 6},${BOX_Y + BOX_H / 2 - 3.5} L${x - 6},${BOX_Y + BOX_H / 2 + 3.5} Z`}
                  fill={c.chartInk}
                />
              </G>
            ) : null}
            <Rect
              x={x}
              y={BOX_Y}
              width={bw}
              height={BOX_H}
              rx={5}
              fill={on ? stageFill(c, i) : c.chartSurface}
              stroke={on ? c.chartInk : c.chartMuted}
              strokeWidth={on && lit ? chart.strokeHeavy : 1}
              strokeDasharray={on ? undefined : chart.dashFine}
            />
            {[a, b].map((line, j) =>
              line ? (
                <ChartText
                  key={j}
                  x={x + bw / 2}
                  y={BOX_Y + (b ? 19 + j * 14 : 27)}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fontWeight="700"
                  fill={on ? c.chartInk : c.chartMuted}
                >
                  {line}
                </ChartText>
              ) : null,
            )}
            {d !== undefined ? (
              <ChartText
                x={x + bw / 2}
                y={BOX_Y + BOX_H + 16}
                textAnchor="middle"
                fontSize={chart.label}
                fill={on ? c.chartInk : c.chartMuted}
              >
                {`${fmt4(d)} ${unit}`}
              </ChartText>
            ) : null}
          </G>
        );
      })}
    </G>
  );
}

function Bars({
  w,
  y,
  rows,
  ds,
  lit,
  slowest,
  unit,
  c,
}: {
  w: number;
  y: number;
  rows: InstrClass[];
  ds: number[];
  lit?: InstrClass;
  slowest: number;
  unit: string;
  c: Palette;
}) {
  const x0 = 58;
  const x1 = w - 8;
  const sx = (t: number) => (slowest > 0 ? ((x1 - x0) * t) / slowest : 0);
  return (
    <G>
      {rows.map((cl, k) => {
        const yy = y + k * (BAR_H + 8);
        const bold = cl === lit;
        let at = x0;
        return (
          <G key={cl}>
            <ChartText
              x={x0 - 6}
              y={yy + 14}
              textAnchor="end"
              fontSize={chart.label}
              fontWeight={bold ? '700' : '400'}
              fill={c.chartInk}
            >
              {CLASS_NAMES[cl]}
            </ChartText>
            {CLASS_UNITS[cl].map((used, i) => {
              if (!used) return null;
              const x = at;
              const bw = sx(ds[i]!);
              at += bw;
              return (
                <G key={i}>
                  <Rect
                    x={x}
                    y={yy}
                    width={Math.max(0, bw - 1)}
                    height={BAR_H}
                    fill={stageFill(c, i)}
                    stroke={bold ? c.chartInk : c.chartGrid}
                    strokeWidth={bold ? chart.strokeLight : 1}
                  />
                  {bw > 30 ? (
                    <ChartText
                      x={x + bw / 2}
                      y={yy + 14}
                      textAnchor="middle"
                      fontSize={chart.label}
                      fill={c.chartInk}
                    >
                      {fmt4(ds[i]!)}
                    </ChartText>
                  ) : null}
                </G>
              );
            })}
          </G>
        );
      })}
      <HBracket
        x1={x0}
        x2={x0 + sx(slowest)}
        y={y + rows.length * (BAR_H + 8) + 6}
        side="up"
        label={`${rows.length > 1 ? 'period ' : ''}${fmt4(slowest)} ${unit}`}
        color={c.chartInk}
        w={w}
      />
    </G>
  );
}

/** Clock cycles of T with instructions CPI cycles long, alternating fills. */
function Cycles({
  w,
  y,
  cpi,
  T,
  unitT,
  c,
}: {
  w: number;
  y: number;
  cpi?: number;
  T?: number;
  unitT: string;
  c: Palette;
}) {
  const n = 8;
  const x0 = 8;
  const cw = (w - 16) / n;
  const blocks: [number, number][] = [];
  if (cpi !== undefined && cpi > 0) {
    // Instructions laid end to end, each CPI cycles on average, while they fit the strip.
    for (let s = 0; s + cpi <= n + 1e-9 && blocks.length < 40; s += cpi) blocks.push([s, cpi]);
  }
  return (
    <G>
      <ChartText
        x={w - 8}
        y={y - 8}
        textAnchor="end"
        fontSize={chart.label}
        fontWeight="700"
        fill={c.chartInk}
      >
        clock cycles
      </ChartText>
      {Array.from({ length: n }, (_, i) => (
        <Rect
          key={i}
          x={x0 + i * cw}
          y={y}
          width={cw}
          height={16}
          fill={c.chartSurface}
          stroke={c.chartGrid}
          strokeWidth={1}
        />
      ))}
      {T !== undefined ? (
        <G>
          <HBracket x1={x0} x2={x0 + cw} y={y - 3} side="down" color={c.chartInk} w={w} />
          <ChartText x={x0} y={y - 8} fontSize={chart.label} fill={c.chartInk}>
            {`one cycle: T = ${fmt4(T)}${unitT ? ` ${unitT}` : ''}`}
          </ChartText>
        </G>
      ) : null}
      {blocks.map(([s, len], i) => (
        <G key={i}>
          <Rect
            x={x0 + s * cw + 1}
            y={y + 22}
            width={len * cw - 2}
            height={18}
            rx={3}
            fill={i % 2 ? c.pipeEX : c.pipeIF}
            stroke={c.chartInk}
            strokeWidth={1}
          />
          {len * cw > 30 ? (
            <ChartText
              x={x0 + (s + len / 2) * cw}
              y={y + 35}
              textAnchor="middle"
              fontSize={chart.label}
              fill={c.chartInk}
            >
              {`i${i + 1}`}
            </ChartText>
          ) : null}
        </G>
      ))}
      {cpi !== undefined ? (
        <ChartText
          x={w / 2}
          y={y + 58}
          textAnchor="middle"
          fontSize={chart.label}
          fill={c.chartMuted}
        >
          {`each instruction takes CPI = ${fmt4(cpi)} cycles on average`}
        </ChartText>
      ) : null}
    </G>
  );
}
