/**
 * HC90 `blockDiagram` (BlockDiagramSpec in typesHe3j.ts): a process-control loop as blocks,
 * flat. `feedback`: setpoint R, the comparator (+ in, − from the sensor), the controller K_c,
 * the process K_p ÷ (τs + 1), the output Y and the sensor back to the minus. `lags`: the same
 * loop around K_p ÷ (τs + 1)ⁿ. `feedforward`: a measured disturbance D through K_d to the output
 * and through K_ff to the process input, cancelling it (inside the loop when K_c is given).
 * Every gain a block shows is a value; a "?" shows the symbol.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { BlockDiagramSpec } from '@/data/modules/typesHe3j';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { Arrow } from './he1fKit';
import { equalLags, proportionalLoop } from './he3jMath';
import { nf, useHe3j } from './he3jKit';

const BW = 360;
const BHT = 34;
const SR = 11;

const SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

export function BlockDiagram({ spec, calc }: { spec: BlockDiagramSpec; calc: Calculator }) {
  const c = usePalette();
  const { get, sym, lab } = useHe3j(calc);
  const tu = spec.timeUnit ?? 'min';

  /** A value as a block shows it: the number, or the symbol while it is "?". */
  const show = (x: NumOrVar | undefined, fallback: string) => {
    const v = get(x);
    return v === undefined ? sym(x, fallback) : nf(v, 4);
  };
  const Kc = get(spec.Kc);
  const Kp = get(spec.Kp);
  const tau = get(spec.tau);
  const r = get(spec.setpoint);

  /** A block: its name above, its gain or transfer function inside. */
  const block = (
    cx: number,
    cy: number,
    w: number,
    name: string,
    body: ReactNode,
    nameBelow = false,
  ) => (
    <G key={`${name}${cx}`}>
      <Rect
        x={cx - w / 2}
        y={cy - BHT / 2}
        width={w}
        height={BHT}
        rx={6}
        fill={c.card}
        stroke={c.chartInk}
        strokeWidth={1.5}
      />
      {body}
      <ChartText
        x={cx}
        y={nameBelow ? cy + BHT / 2 + 15 : cy - BHT / 2 - 6}
        fontSize={chart.label}
        textAnchor="middle"
        fill={c.chartMuted}
      >
        {name}
      </ChartText>
    </G>
  );
  /** A gain written in the block. */
  const gain = (cx: number, cy: number, text: string, color = c.chartInk) => (
    <ChartText
      x={cx}
      y={cy + 5}
      fontSize={chart.value}
      fontWeight="700"
      textAnchor="middle"
      fill={color}
    >
      {text}
    </ChartText>
  );
  /** A transfer function: numerator over a bar over denominator. */
  const frac = (cx: number, cy: number, num: string, den: string) => {
    const w = Math.max(num.length, den.length) * 7.2 + 4;
    return (
      <G>
        <ChartText x={cx} y={cy - 4} fontSize={chart.label} fontWeight="700" textAnchor="middle">
          {num}
        </ChartText>
        <Line
          x1={cx - w / 2}
          y1={cy}
          x2={cx + w / 2}
          y2={cy}
          stroke={c.chartInk}
          strokeWidth={1.2}
        />
        <ChartText x={cx} y={cy + 13} fontSize={chart.label} fontWeight="700" textAnchor="middle">
          {den}
        </ChartText>
      </G>
    );
  };
  /** A summing junction with its signs: `signs` maps a side to + or −. */
  const sum = (
    cx: number,
    cy: number,
    signs: Partial<Record<'left' | 'top' | 'bottom', '+' | '−'>>,
  ) => (
    <G key={`sum${cx}`}>
      <Circle cx={cx} cy={cy} r={SR} fill={c.card} stroke={c.chartInk} strokeWidth={1.5} />
      <Path
        d={`M ${cx - SR * 0.7} ${cy - SR * 0.7} L ${cx + SR * 0.7} ${cy + SR * 0.7} M ${cx - SR * 0.7} ${cy + SR * 0.7} L ${cx + SR * 0.7} ${cy - SR * 0.7}`}
        stroke={c.chartInk}
        strokeWidth={1}
      />
      {signs.left && (
        <ChartText
          x={cx - SR - 4}
          y={cy - 6}
          fontSize={chart.emphasis}
          fontWeight="700"
          textAnchor="end"
        >
          {signs.left}
        </ChartText>
      )}
      {signs.top && (
        <ChartText x={cx + SR + 3} y={cy - SR - 2} fontSize={chart.emphasis} fontWeight="700">
          {signs.top}
        </ChartText>
      )}
      {signs.bottom && (
        <ChartText
          x={cx - SR - 4}
          y={cy + SR + 12}
          fontSize={chart.emphasis}
          fontWeight="700"
          textAnchor="end"
          fill={signs.bottom === '−' ? c.roadBraking : c.chartInk}
        >
          {signs.bottom}
        </ChartText>
      )}
    </G>
  );
  const arrow = (x1: number, y1: number, x2: number, y2: number, color = c.chartInk) => (
    <Arrow
      key={`${x1},${y1},${x2},${y2}`}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      color={color}
      width={1.6}
    />
  );
  const wire = (d: string, color = c.chartInk) => (
    <Path key={d} d={d} stroke={color} strokeWidth={1.6} fill="none" />
  );

  const nRaw = spec.mode === 'lags' ? Math.round(get(spec.lags) ?? 3) : 1;
  const n = Math.max(1, Math.min(9, nRaw));
  const processDen =
    tau !== undefined || typeof spec.tau === 'string'
      ? `(${show(spec.tau, 'τ')}s + 1)${n > 1 ? (SUP[n] ?? `^${n}`) : ''}`
      : '';
  const processBody = (cx: number, cy: number) =>
    processDen
      ? frac(
          cx,
          cy,
          show(spec.Kp, 'K_p'),
          n > 1 ? processDen : processDen.replace(/^\((.*)\)$/, '$1'),
        )
      : gain(cx, cy, show(spec.Kp, 'K_p'));

  let BH = 200;
  let body: ReactNode = null;
  const withLoop = spec.mode !== 'feedforward' || spec.Kc !== undefined;
  const main = spec.mode === 'feedforward' ? 120 : 70;
  const back = main + 78;
  const sensorText = show(spec.sensor ?? 1, 'H');

  if (spec.mode !== 'feedforward') {
    // R → Σ → K_c → (valve) → process → Y, the sensor back to the minus.
    const sx = 56;
    const hasValve = spec.valve !== undefined;
    const kcx = 112;
    const vx = 176;
    const px = hasValve ? 246 : 216;
    const pw = hasValve ? 84 : 104;
    const yx = BW - 10;
    const tap = px + pw / 2 + 22;
    body = (
      <G>
        <ChartText x={6} y={main - 24} fontSize={chart.label} fontWeight="700">
          {lab(spec.setpoint, 'R') ?? 'R'}
        </ChartText>
        {arrow(6, main, sx - SR, main)}
        {sum(sx, main, { left: '+', bottom: '−' })}
        {arrow(sx + SR, main, kcx - 30, main)}
        {block(kcx, main, 56, 'Controller', gain(kcx, main, show(spec.Kc, 'K_c')))}
        {hasValve && arrow(kcx + 28, main, vx - 22, main)}
        {hasValve && block(vx, main, 44, 'Valve', gain(vx, main, show(spec.valve, 'K_v')))}
        {arrow(hasValve ? vx + 22 : kcx + 28, main, px - pw / 2, main)}
        {block(px, main, pw, n > 1 ? `Process, ${n} lags` : 'Process', processBody(px, main))}
        {arrow(px + pw / 2, main, yx, main)}
        <ChartText x={yx} y={main - 10} fontSize={chart.label} fontWeight="700" textAnchor="end">
          Y
        </ChartText>
        <Circle cx={tap} cy={main} r={3} fill={c.chartInk} />
        {wire(`M ${tap} ${main} V ${back} H ${190 + 28}`)}
        {block(190, back, 56, 'Sensor', gain(190, back, sensorText), true)}
        {wire(`M ${190 - 28} ${back} H ${sx} V ${main + SR + 8}`)}
        {arrow(sx, main + SR + 8, sx, main + SR)}
      </G>
    );
    BH = back + 36;
  } else {
    // D measured: through K_d to the output, through K_ff into the process input.
    const s1 = 44;
    const kcx = 96;
    const s2 = 146;
    const px = 216;
    const pw = 84;
    const s3 = 290;
    const yx = BW - 8;
    const dy = 26;
    const bY = 70;
    const dx = 216;
    body = (
      <G>
        {/* The disturbance and its two paths. */}
        <ChartText
          x={dx}
          y={dy - 8}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="middle"
          fill={c.blockDist}
        >
          D (measured)
        </ChartText>
        <Circle cx={dx} cy={dy} r={3} fill={c.blockDist} />
        {wire(`M ${dx} ${dy} H ${s3} V ${bY - BHT / 2}`, c.blockDist)}
        {block(s3, bY, 50, '', gain(s3, bY, show(spec.Kd, 'K_d'), c.blockDist))}
        <ChartText x={s3 + 30} y={bY + 5} fontSize={chart.label} fill={c.blockDist}>
          K_d
        </ChartText>
        {arrow(s3, bY + BHT / 2, s3, main - SR, c.blockDist)}
        {wire(`M ${dx} ${dy} H ${s2} V ${bY - BHT / 2}`, c.blockFf)}
        {block(s2, bY, 56, '', gain(s2, bY, show(spec.Kff, 'K_ff'), c.blockFf))}
        <ChartText x={s2 - 32} y={bY + 5} fontSize={chart.label} textAnchor="end" fill={c.blockFf}>
          K_ff
        </ChartText>
        {arrow(s2, bY + BHT / 2, s2, main - SR, c.blockFf)}
        {/* The main line. */}
        {withLoop ? (
          <G>
            <ChartText x={4} y={main - 10} fontSize={chart.label} fontWeight="700">
              {lab(spec.setpoint, 'R') ?? 'R'}
            </ChartText>
            {arrow(4, main, s1 - SR, main)}
            {sum(s1, main, { left: '+', bottom: '−' })}
            {arrow(s1 + SR, main, kcx - 24, main)}
            {block(kcx, main, 48, '', gain(kcx, main, show(spec.Kc, 'K_c')))}
            <ChartText
              x={kcx}
              y={main + BHT / 2 + 15}
              fontSize={chart.label}
              textAnchor="middle"
              fill={c.chartMuted}
            >
              K_c
            </ChartText>
            {arrow(kcx + 24, main, s2 - SR, main)}
          </G>
        ) : (
          <G>
            <ChartText x={8} y={main - 10} fontSize={chart.label} fill={c.chartMuted}>
              controller output
            </ChartText>
            {arrow(8, main, s2 - SR, main)}
          </G>
        )}
        {sum(s2, main, { left: '+', top: '+' })}
        {arrow(s2 + SR, main, px - pw / 2, main)}
        {block(px, main, pw, '', processBody(px, main))}
        <ChartText
          x={px}
          y={main + BHT / 2 + 15}
          fontSize={chart.label}
          textAnchor="middle"
          fill={c.chartMuted}
        >
          Process
        </ChartText>
        {arrow(px + pw / 2, main, s3 - SR, main)}
        {sum(s3, main, { left: '+', top: '+' })}
        {arrow(s3 + SR, main, yx, main)}
        <ChartText x={yx} y={main - 10} fontSize={chart.label} fontWeight="700" textAnchor="end">
          Y
        </ChartText>
        {withLoop && (
          <G>
            <Circle cx={s3 + 30} cy={main} r={3} fill={c.chartInk} />
            {wire(`M ${s3 + 30} ${main} V ${back} H ${s1} V ${main + SR + 8}`)}
            {arrow(s1, main + SR + 8, s1, main + SR)}
            <ChartText
              x={(s1 + s3) / 2}
              y={back + 16}
              fontSize={chart.label}
              textAnchor="middle"
              fill={c.chartMuted}
            >
              {`sensor ${sensorText}`}
            </ChartText>
          </G>
        )}
      </G>
    );
    BH = withLoop ? back + 26 : main + 40;
  }

  const parts: string[] = [];
  if (spec.mode === 'feedback') {
    if (Kc !== undefined && Kp !== undefined && tau !== undefined && r !== undefined) {
      const L = proportionalLoop(Kc, Kp, tau, r);
      parts.push(
        `Loop gain K_cK_p = ${nf(Kc)} × ${nf(Kp)} = ${nf(L.K)}. The output settles at R × K_cK_p ÷ (1 + K_cK_p) = ${nf(r)} × ${nf(L.K)} ÷ ${nf(1 + L.K)} = ${nf(L.final)}, an offset of ${nf(L.offset)}.`,
      );
      parts.push(
        `τ_cl = τ ÷ (1 + K_cK_p) = ${nf(tau)} ÷ ${nf(1 + L.K)} = ${nf(L.tauCl)} ${tu}: the loop is faster than the process.`,
      );
    } else parts.push('Type K_c, K_p, τ and the setpoint change to work the loop.');
    parts.push('The sensor’s signal enters the comparator with a minus: negative feedback.');
  } else if (spec.mode === 'lags') {
    if (tau !== undefined) {
      const L = equalLags(n, tau);
      parts.push(
        `${n} equal lags under P control go unstable when K_cK_p = ${nf(L.loop)}${Kp !== undefined ? `, so K_c,u = ${nf(L.loop)} ÷ ${nf(Kp)} = ${nf(L.loop / Kp)}` : ''}.`,
      );
      parts.push(
        `There ω_u = tan(180° ÷ ${n}) ÷ τ = ${nf(L.wu)} rad/${tu} and P_u = 2π ÷ ω_u = ${nf(L.Pu)} ${tu}.`,
      );
    } else parts.push('Type τ and K_p to find the ultimate gain.');
  } else {
    const Kd = get(spec.Kd);
    const Kff = get(spec.Kff);
    if (Kd !== undefined && Kp !== undefined) {
      const ff = Kff ?? -Kd / Kp;
      parts.push(
        `K_ff = −K_d ÷ K_p = −${nf(Kd)} ÷ ${nf(Kp)} = ${nf(ff)}. Through the process the feedforward adds K_ffK_p = ${nf(ff * Kp)} to Y, cancelling the disturbance’s K_d = ${nf(Kd)}.`,
      );
    } else parts.push('Type K_d and K_p to find the feedforward gain.');
  }

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <G transform={`scale(${w / BW})`}>{body}</G>
          </Svg>
        )}
      </Canvas>
      <Caption>{parts.join(' ')}</Caption>
    </View>
  );
}
