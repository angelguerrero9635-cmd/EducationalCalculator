/**
 * HC49 `timingDiagram` (TimingDiagramSpec in typesHe3d.ts): stacked digital waveforms on one
 * time axis with interval brackets. A register path (CLK, Q, D: t_cq, t_logic, t_setup, the
 * period; the hold window), a timer's count ramping to its compare value with the interrupt at
 * each match, PWM (the count, the compare level and the output high below it, the duty and the
 * average voltage), a UART frame (start, data LSB first, parity, stop, each bit written in), and
 * a packet's space–time diagram (the band as wide as d_t, its drop the propagation d_p). Flat; a
 * value left "?" draws nothing of its own.
 */
import type { ReactNode } from 'react';
import Svg, { G, Line, Polygon, Polyline, Rect } from 'react-native-svg';

import type { TimingDiagramSpec } from '@/data/modules/typesHe3d';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { fmt4, fmtTime, HBracket, useReader, VBracket } from './he3dKit';
import { TIME_UNITS } from './he3dTime';
import { HERTZ, METRES, uartFrame } from './timingMath';

type Reader = ReturnType<typeof useReader>;
type Drawn = { h: number; body: (w: number) => ReactNode; caption: string };

export function TimingDiagram({ spec, calc }: { spec: TimingDiagramSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useReader(calc);
  const drawn =
    spec.mode === 'register'
      ? register(spec, r, c)
      : spec.mode === 'timer'
        ? timer(spec, r, c)
        : spec.mode === 'pwm'
          ? pwm(spec, r, c)
          : spec.mode === 'uart'
            ? uart(spec, r, c)
            : link(spec, r, c);
  return (
    <>
      <Canvas aspect={(w) => drawn.h / w}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            {drawn.body(w)}
          </Svg>
        )}
      </Canvas>
      <Caption>{drawn.caption}</Caption>
    </>
  );
}

/** A row's name at the left. */
const RowName = ({ y, text }: { y: number; text: string }) => (
  <ChartText x={4} y={y + 4} fontSize={chart.label} fontWeight="700">
    {text}
  </ChartText>
);

/** A data bus from x0 to x1 between y0 and y1, changing value at `at` (the new value shaded). */
function Bus({
  x0,
  x1,
  y0,
  y1,
  at,
  c,
}: {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  at?: number;
  c: Palette;
}) {
  const s = { stroke: c.chartInk, strokeWidth: chart.stroke, fill: 'none' };
  if (at === undefined) {
    return (
      <G>
        <Line x1={x0} y1={y0} x2={x1} y2={y0} {...s} />
        <Line x1={x0} y1={y1} x2={x1} y2={y1} {...s} />
      </G>
    );
  }
  const d = 4;
  const ym = (y0 + y1) / 2;
  return (
    <G>
      <Polygon
        points={`${at},${ym} ${at + d},${y0} ${x1},${y0} ${x1},${y1} ${at + d},${y1}`}
        fill={c.chartFill}
      />
      <Polyline points={`${x0},${y0} ${at - d},${y0} ${at + d},${y1} ${x1},${y1}`} {...s} />
      <Polyline points={`${x0},${y1} ${at - d},${y1} ${at + d},${y0} ${x1},${y0}`} {...s} />
    </G>
  );
}

const LX = 40;

// ─── register: CLK, Q, D ──────────────────────────────────────────────────────

function register(spec: TimingDiagramSpec, r: Reader, c: Palette): Drawn {
  const t = (x: TimingDiagramSpec['tcq']) => r.base(x, TIME_UNITS);
  const [tcq, tl, ts, hold, tcd] = [spec.tcq, spec.tlogic, spec.tsetup, spec.hold, spec.tcd].map(t);
  const sum = tcq !== undefined && tl !== undefined && ts !== undefined ? tcq + tl + ts : undefined;
  const T = t(spec.period) ?? sum ?? 1;
  const t0 = -0.12 * T;
  const t1 = 1.22 * T;
  const holdBad = hold !== undefined && tcq !== undefined && tcd !== undefined && tcq + tcd < hold;
  const body = (w: number) => {
    const k = (w - LX - 8) / (t1 - t0);
    const x = (tt: number) => LX + (tt - t0) * k;
    const [xa, xb] = [x(t0), x(t1)];
    const clk = [
      [xa, 58],
      [x(0), 58],
      [x(0), 34],
      [x(T / 2), 34],
      [x(T / 2), 58],
      [x(T), 58],
      [x(T), 34],
      [xb, 34],
    ]
      .map((p) => p.join(','))
      .join(' ');
    const qAt = tcq !== undefined ? x(tcq) : undefined;
    const dAt = tcq !== undefined && tl !== undefined ? x(tcq + tl) : undefined;
    const lab = (f: TimingDiagramSpec['tcq'], s: string) => r.lab(f, s, 'ns');
    return (
      <G>
        {[0, T].map((tt) => (
          <Line
            key={tt}
            x1={x(tt)}
            y1={30}
            x2={x(tt)}
            y2={176}
            stroke={c.chartMuted}
            strokeWidth={1}
            strokeDasharray={chart.dashFine}
          />
        ))}
        {ts !== undefined ? (
          <Rect x={x(T - ts)} y={148} width={x(T) - x(T - ts)} height={24} fill={c.codeLit} />
        ) : null}
        {hold !== undefined ? (
          <Rect
            x={x(0)}
            y={148}
            width={x(hold) - x(0)}
            height={24}
            fill={holdBad ? c.schedMiss : c.codeLit}
            opacity={holdBad ? 0.35 : 1}
          />
        ) : null}
        <RowName y={46} text="CLK" />
        <Polyline points={clk} stroke={c.chartInk} strokeWidth={chart.stroke} fill="none" />
        <RowName y={102} text="Q" />
        <Bus x0={xa} x1={xb} y0={92} y1={112} at={qAt} c={c} />
        <RowName y={160} text="D" />
        <Bus x0={xa} x1={xb} y0={150} y1={170} at={dAt} c={c} />
        {tcq !== undefined && tcd !== undefined ? (
          <Line
            x1={x(tcq + tcd)}
            y1={146}
            x2={x(tcq + tcd)}
            y2={174}
            stroke={holdBad ? c.schedMiss : c.chartMuted}
            strokeWidth={chart.strokeLight}
            strokeDasharray={chart.dash}
          />
        ) : null}
        <HBracket
          x1={x(0)}
          x2={x(T)}
          y={20}
          w={w}
          label={
            r.lab(spec.period, 'T', 'ns') ?? (sum !== undefined ? `T = ${fmtTime(sum)}` : undefined)
          }
          color={c.chartInk}
        />
        {qAt !== undefined ? (
          <HBracket x1={x(0)} x2={qAt} y={80} w={w} label={lab(spec.tcq, 't_cq')} />
        ) : null}
        {qAt !== undefined && dAt !== undefined ? (
          <HBracket x1={qAt} x2={dAt} y={142} w={w} label={lab(spec.tlogic, 't_logic')} />
        ) : null}
        {ts !== undefined ? (
          <HBracket
            x1={x(T - ts)}
            x2={x(T)}
            y={182}
            w={w}
            side="up"
            label={lab(spec.tsetup, 't_setup')}
          />
        ) : null}
        {hold !== undefined ? (
          <HBracket
            x1={x(0)}
            x2={x(hold)}
            y={200}
            w={w}
            side="up"
            label={lab(spec.hold, 't_hold')}
            color={holdBad ? c.schedMiss : undefined}
          />
        ) : null}
      </G>
    );
  };
  const parts: string[] = [];
  if (sum !== undefined && tcq !== undefined && tl !== undefined && ts !== undefined) {
    parts.push(
      `T_min = t_cq + t_logic + t_setup = ${fmtTime(tcq)} + ${fmtTime(tl)} + ${fmtTime(ts)} = ${fmtTime(sum)}.`,
    );
    parts.push(`f_max = 1 ÷ T_min = ${fmt4(1 / sum / 1e6)} MHz.`);
    parts.push('D settles just as the setup window (shaded) opens before the next edge.');
  } else {
    parts.push(
      'Q changes t_cq after the clock edge, D t_logic later, and D must be steady t_setup before the next edge.',
    );
  }
  if (holdBad) parts.push('A path this short changes D before the hold time ends.');
  else if (hold !== undefined && tcd !== undefined) {
    parts.push('D’s earliest change (dashed) comes after the hold window: the hold check passes.');
  }
  return { h: 222, body, caption: parts.join(' ') };
}

// ─── timer and PWM: a count ramp ──────────────────────────────────────────────

/** The count ramping 0 → top over top + 1 ticks, `periods` times, from x0 to x1. */
function ramp(top: number, periods: number, x: (tick: number) => number, y: (n: number) => number) {
  const pts: string[] = [];
  const stairs = top + 1 <= 20;
  for (let p = 0; p < periods; p++) {
    const s = p * (top + 1);
    if (stairs) {
      for (let n = 0; n <= top; n++) pts.push(`${x(s + n)},${y(n)}`, `${x(s + n + 1)},${y(n)}`);
    } else {
      pts.push(`${x(s)},${y(0)}`, `${x(s + top)},${y(top)}`, `${x(s + top + 1)},${y(top)}`);
    }
    pts.push(`${x(s + top + 1)},${y(0)}`);
  }
  return pts.join(' ');
}

function timer(spec: TimingDiagramSpec, r: Reader, c: Palette): Drawn {
  const compare = r.get(spec.compare);
  const ticks = r.get(spec.ticks);
  const top = compare ?? (ticks !== undefined ? ticks - 1 : undefined);
  const fclk = r.base(spec.fclk, HERTZ);
  const N = r.get(spec.prescaler);
  const ft = r.base(spec.ftimer, HERTZ) ?? (fclk && N ? fclk / N : undefined);
  const body = (w: number) => {
    if (top === undefined) return <RowName y={90} text="count" />;
    const span = 2.15 * (top + 1);
    const x = (tick: number) => LX + 4 + (tick / span) * (w - LX - 12);
    const y = (n: number) => 150 - (n / top) * 110;
    return (
      <G>
        <ChartText x={4} y={34} fontSize={chart.label} fontWeight="700">
          count
        </ChartText>
        <ChartText x={LX - 4} y={154} fontSize={chart.label} textAnchor="end" fill={c.chartMuted}>
          0
        </ChartText>
        <Line x1={LX} y1={150} x2={w - 6} y2={150} stroke={c.chartGrid} strokeWidth={1} />
        {compare !== undefined ? (
          <G>
            <Line
              x1={LX}
              y1={y(compare)}
              x2={w - 6}
              y2={y(compare)}
              stroke={c.chartSecond}
              strokeWidth={chart.stroke}
              strokeDasharray={chart.dash}
            />
            <ChartText
              x={w - 8}
              y={y(compare) - 6}
              textAnchor="end"
              fontSize={chart.label}
              fontWeight="700"
              halo
            >
              {r.lab(spec.compare, 'compare') ?? ''}
            </ChartText>
          </G>
        ) : null}
        <Polyline
          points={ramp(top, 2, x, y)}
          stroke={c.chartHighlight}
          strokeWidth={chart.stroke}
          fill="none"
        />
        <RowName y={186} text="IRQ" />
        <Polyline
          points={[
            `${x(0)},196`,
            ...[1, 2].flatMap((p) => {
              const at = x(p * (top + 1));
              return [`${at},196`, `${at},176`, `${at + 4},176`, `${at + 4},196`];
            }),
            `${w - 6},196`,
          ].join(' ')}
          stroke={c.chartInk}
          strokeWidth={chart.stroke}
          fill="none"
        />
        <HBracket
          x1={x(0)}
          x2={x(top + 1)}
          y={210}
          side="up"
          w={w}
          label={r.lab(spec.ticks, 'ticks') ?? `${fmt4(top + 1)} ticks`}
        />
      </G>
    );
  };
  const parts = [
    'The timer counts up at f_t and resets after it matches the compare value, raising the interrupt (IRQ).',
  ];
  if (ft !== undefined && fclk !== undefined && N !== undefined) {
    parts.push(`f_t = f_clk ÷ N = ${fmt4(fclk / 1e6)} MHz ÷ ${fmt4(N)} = ${fmt4(ft / 1e3)} kHz.`);
  }
  if (top !== undefined && ft !== undefined) {
    parts.push(
      `${fmt4(top + 1)} ticks of ${fmtTime(1 / ft)} make P = ${fmtTime((top + 1) / ft)}; compare = ${fmt4(top + 1)} − 1 = ${fmt4(top)}.`,
    );
  }
  const bits = r.get(spec.bits);
  if (bits !== undefined && top !== undefined) {
    parts.push(
      top < 2 ** bits
        ? `It fits a ${fmt4(bits)}-bit timer (below ${fmt4(2 ** bits)}).`
        : `It is too big for a ${fmt4(bits)}-bit timer (2ⁿ = ${fmt4(2 ** bits)}).`,
    );
  }
  return { h: 228, body, caption: parts.join(' ') };
}

function pwm(spec: TimingDiagramSpec, r: Reader, c: Palette): Drawn {
  const top = r.get(spec.top);
  const compare = r.get(spec.compare);
  const f = r.base(spec.freq, HERTZ);
  const vdd = r.get(spec.vdd);
  const vavg = r.get(spec.vavg);
  const body = (w: number) => {
    if (top === undefined) return <RowName y={90} text="count" />;
    const span = 2 * (top + 1);
    const x = (tick: number) => LX + 4 + (tick / span) * (w - LX - 12);
    const y = (n: number) => 130 - (n / top) * 96;
    const hi = 168;
    const lo = 200;
    const out =
      compare === undefined
        ? undefined
        : [
            `${x(0)},${lo}`,
            ...[0, 1].flatMap((p) => {
              const s0 = p * (top + 1);
              const e = Math.min(compare, top + 1);
              return [
                `${x(s0)},${lo}`,
                `${x(s0)},${hi}`,
                `${x(s0 + e)},${hi}`,
                `${x(s0 + e)},${lo}`,
              ];
            }),
            `${x(2 * (top + 1))},${lo}`,
          ].join(' ');
    return (
      <G>
        <ChartText x={4} y={30} fontSize={chart.label} fontWeight="700">
          count
        </ChartText>
        <Line x1={LX} y1={130} x2={w - 6} y2={130} stroke={c.chartGrid} strokeWidth={1} />
        <Line
          x1={LX}
          y1={y(top)}
          x2={w - 6}
          y2={y(top)}
          stroke={c.chartMuted}
          strokeWidth={1}
          strokeDasharray={chart.dashFine}
        />
        <ChartText x={w - 8} y={y(top) - 5} textAnchor="end" fontSize={chart.label} halo>
          {r.lab(spec.top, 'TOP') ?? ''}
        </ChartText>
        {compare !== undefined ? (
          <G>
            <Line
              x1={LX}
              y1={y(compare)}
              x2={w - 6}
              y2={y(compare)}
              stroke={c.chartSecond}
              strokeWidth={chart.stroke}
              strokeDasharray={chart.dash}
            />
            <ChartText
              x={w - 8}
              y={y(compare) + 15}
              textAnchor="end"
              fontSize={chart.label}
              fontWeight="700"
              halo
            >
              {r.lab(spec.compare, 'compare') ?? ''}
            </ChartText>
          </G>
        ) : null}
        <Polyline
          points={ramp(top, 2, x, y)}
          stroke={c.chartHighlight}
          strokeWidth={chart.stroke}
          fill="none"
        />
        <RowName y={(hi + lo) / 2} text="OUT" />
        {out ? (
          <Polyline points={out} stroke={c.chartInk} strokeWidth={chart.stroke} fill="none" />
        ) : null}
        {vdd !== undefined && vavg !== undefined && vdd > 0 ? (
          <G>
            <Line
              x1={LX}
              y1={lo - (vavg / vdd) * (lo - hi)}
              x2={w - 6}
              y2={lo - (vavg / vdd) * (lo - hi)}
              stroke={c.chartSecond}
              strokeWidth={chart.strokeLight}
              strokeDasharray={chart.dash}
            />
          </G>
        ) : null}
        {compare !== undefined ? (
          <HBracket
            x1={x(0)}
            x2={x(Math.min(compare, top + 1))}
            y={hi - 8}
            w={w}
            label={r.lab(spec.duty, 'duty', '%')}
          />
        ) : null}
        <HBracket
          x1={x(0)}
          x2={x(top + 1)}
          y={lo + 10}
          side="up"
          w={w}
          label={f ? `T = 1 ÷ f_PWM = ${fmtTime(1 / f)}` : `${fmt4(top + 1)} ticks`}
          color={c.chartInk}
        />
      </G>
    );
  };
  const parts = [
    'The count runs from 0 to TOP and starts again; the output is high while the count is below the compare value.',
  ];
  if (top !== undefined && compare !== undefined) {
    parts.push(
      `duty = compare ÷ (TOP + 1) = ${fmt4(compare)} ÷ ${fmt4(top + 1)} = ${fmt4((100 * compare) / (top + 1))}%.`,
    );
  }
  if (vdd !== undefined && vavg !== undefined) {
    parts.push(`The dashed line is the average, V_avg = ${fmt4(vavg)} V of ${fmt4(vdd)} V.`);
  }
  return { h: 238, body, caption: parts.join(' ') };
}

// ─── UART frame ───────────────────────────────────────────────────────────────

function uart(spec: TimingDiagramSpec, r: Reader, c: Palette): Drawn {
  const data = r.get(spec.dataBits);
  const par = r.get(spec.parity);
  const stop = r.get(spec.stopBits);
  const baud = r.base(spec.baud, HERTZ);
  const byte = spec.byte ?? 0x4b;
  const known = data !== undefined && par !== undefined && stop !== undefined;
  const cells = known ? uartFrame(data, par, stop, byte) : [];
  const n = cells.length;
  const body = (w: number) => {
    if (!known) return <RowName y={80} text="TX" />;
    const cw = (w - 16) / (n + 2);
    const x = (i: number) => 8 + (i + 1) * cw;
    const yv = (b: 0 | 1) => (b ? 74 : 104);
    const pts = [`8,${yv(1)}`, `${x(0)},${yv(1)}`];
    cells.forEach((cell, i) => pts.push(`${x(i)},${yv(cell.bit)}`, `${x(i + 1)},${yv(cell.bit)}`));
    pts.push(`${w - 8},${yv(1)}`);
    const span = (g: string) => {
      const is = cells.flatMap((cell, i) => (cell.group === g ? [i] : []));
      return is.length ? ([x(is[0]!), x(is[is.length - 1]! + 1)] as const) : undefined;
    };
    const groups: { g: string; label: string; row: 0 | 1; anchor: 'start' | 'middle' | 'end' }[] = [
      { g: 'start', label: 'start', row: 0, anchor: 'start' },
      { g: 'data', label: 'data, LSB first', row: 1, anchor: 'middle' },
      { g: 'parity', label: 'parity', row: 0, anchor: 'middle' },
      { g: 'stop', label: 'stop', row: 1, anchor: 'end' },
    ];
    return (
      <G>
        {groups.map(({ g, label, row, anchor }) => {
          const s = span(g);
          if (!s) return null;
          const ly = row === 0 ? 18 : 36;
          const lx = anchor === 'start' ? s[0] : anchor === 'end' ? s[1] : (s[0] + s[1]) / 2;
          return (
            <G key={g}>
              <ChartText x={lx} y={ly} textAnchor={anchor} fontSize={chart.label} fontWeight="700">
                {label}
              </ChartText>
              <Line
                x1={s[0] + 1}
                y1={46}
                x2={s[1] - 1}
                y2={46}
                stroke={c.chartMuted}
                strokeWidth={2}
              />
            </G>
          );
        })}
        {cells.map((cell, i) => (
          <G key={i}>
            {cell.group === 'data' ? (
              <Rect x={x(i)} y={56} width={cw} height={62} fill={c.chartSurface} />
            ) : null}
            <Line x1={x(i)} y1={56} x2={x(i)} y2={118} stroke={c.chartGrid} strokeWidth={1} />
            <ChartText
              x={x(i) + cw / 2}
              y={cell.bit ? 96 : 66}
              textAnchor="middle"
              fontSize={chart.value}
              fontWeight="700"
            >
              {String(cell.bit)}
            </ChartText>
            <ChartText
              x={x(i) + cw / 2}
              y={134}
              textAnchor="middle"
              fontSize={chart.label}
              fill={c.chartMuted}
            >
              {cell.group === 'data' ? cell.name.slice(1) : cell.name}
            </ChartText>
          </G>
        ))}
        <Line x1={x(n)} y1={56} x2={x(n)} y2={118} stroke={c.chartGrid} strokeWidth={1} />
        <Polyline
          points={pts.join(' ')}
          stroke={c.chartInk}
          strokeWidth={chart.stroke}
          fill="none"
        />
        {baud ? (
          <HBracket
            x1={x(1)}
            x2={x(2)}
            y={146}
            side="up"
            w={w}
            label={`1 bit = 1 ÷ baud = ${fmtTime(1 / baud)}`}
          />
        ) : null}
        <HBracket
          x1={x(0)}
          x2={x(n)}
          y={176}
          side="up"
          w={w}
          color={c.chartInk}
          label={`${n} bits${baud ? ` = ${fmtTime(n / baud)}` : ''}`}
        />
      </G>
    );
  };
  const sent = known ? byte % 2 ** data! : byte;
  const hex = sent.toString(16).toUpperCase().padStart(2, '0');
  const parts = known
    ? [
        `The line idles high; a start bit pulls it low, then the byte 0x${hex} goes out LSB first${par ? ', an even parity bit' : ''} and ${fmt4(stop!)} stop bit${stop === 1 ? '' : 's'} high.`,
        `frame = 1 + ${fmt4(data!)} + ${fmt4(par!)} + ${fmt4(stop!)} = ${n} bits.`,
      ]
    : ['A frame is a start bit, the data bits, a parity bit if any, and the stop bits.'];
  return { h: 196, body, caption: parts.join(' ') };
}

// ─── link: a packet's space–time diagram ──────────────────────────────────────

function link(spec: TimingDiagramSpec, r: Reader, c: Palette): Drawn {
  const dt = r.base(spec.dt, TIME_UNITS);
  const dp = r.base(spec.dp, TIME_UNITS);
  const dq = r.base(spec.dq, TIME_UNITS) ?? 0;
  const dist = r.base(spec.d, METRES);
  const total = dq + (dt ?? 0) + (dp ?? 0);
  const MIN = 8;
  const Y0 = 58;
  const Y1 = 250;
  const k = total > 0 ? (Y1 - Y0 - 12) / total : 0;
  // Each interval at least MIN px tall, so a short one still shows (said in the caption).
  const px = (t: number) => (t > 0 ? Math.max(MIN, t * k) : 0);
  const widened = [dt, dp].some((t) => t !== undefined && t > 0 && t * k < MIN);
  const body = (w: number) => {
    const A = 108;
    const B = w - 108;
    const yq = Y0 + px(dq);
    const yt = yq + (dt !== undefined ? px(dt) : 0);
    const yp = dp !== undefined ? px(dp) : undefined;
    return (
      <G>
        <ChartText x={A} y={16} textAnchor="middle" fontSize={chart.label} fontWeight="700">
          Sender
        </ChartText>
        <ChartText x={B} y={16} textAnchor="middle" fontSize={chart.label} fontWeight="700">
          Receiver
        </ChartText>
        <Line x1={A} y1={38} x2={B} y2={38} stroke={c.chartMuted} strokeWidth={1} />
        <ChartText x={(A + B) / 2} y={33} textAnchor="middle" fontSize={chart.label} halo>
          {r.lab(spec.d, 'd', 'km') ?? (dist !== undefined ? `d = ${fmt4(dist / 1000)} km` : '')}
        </ChartText>
        {[A, B].map((xx) => (
          <G key={xx}>
            <Line
              x1={xx}
              y1={Y0 - 10}
              x2={xx}
              y2={Y1 + 6}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            <Polygon
              points={`${xx - 5},${Y1 + 2} ${xx + 5},${Y1 + 2} ${xx},${Y1 + 12}`}
              fill={c.chartInk}
            />
          </G>
        ))}
        <ChartText x={A + 8} y={Y1 + 10} fontSize={chart.label} fill={c.chartMuted}>
          time
        </ChartText>
        {yp !== undefined ? (
          <Line
            x1={A}
            y1={yq}
            x2={B}
            y2={yq}
            stroke={c.chartMuted}
            strokeWidth={1}
            strokeDasharray={chart.dashFine}
          />
        ) : null}
        {dt !== undefined && yp !== undefined ? (
          <Polygon
            points={`${A},${yq} ${A},${yt} ${B},${yt + yp} ${B},${yq + yp}`}
            fill={c.chartHighlight}
            fillOpacity={0.25}
            stroke={c.chartHighlight}
            strokeWidth={chart.strokeLight}
          />
        ) : yp !== undefined ? (
          <Line
            x1={A}
            y1={yq}
            x2={B}
            y2={yq + yp}
            stroke={c.chartHighlight}
            strokeWidth={chart.stroke}
          />
        ) : null}
        {dq > 0 ? <VBracket x={A - 8} y1={Y0} y2={yq} label={r.lab(spec.dq, 'd_q', 'ms')} /> : null}
        {dt !== undefined ? (
          <VBracket x={A - 8} y1={yq} y2={yt} label={r.lab(spec.dt, 'd_t', 'μs')} />
        ) : null}
        {yp !== undefined ? (
          <VBracket
            x={B + 8}
            y1={yq}
            y2={yq + yp}
            side="right"
            label={r.lab(spec.dp, 'd_p', 'ms')}
          />
        ) : null}
      </G>
    );
  };
  const parts = ['The packet leaves bit by bit for d_t, and each bit takes d_p to cross the link.'];
  if (dt !== undefined && dp !== undefined) {
    parts.push(
      `total = ${dq > 0 ? `${fmtTime(dq)} + ` : ''}${fmtTime(dt)} + ${fmtTime(dp)} = ${fmtTime(total)}: the last bit arrives d_t + d_p after the first leaves.`,
    );
  }
  if (widened) parts.push(`The shorter time is drawn wider than to scale so it shows.`);
  return { h: 272, body, caption: parts.join(' ') };
}
