/**
 * A rocket (HC87, `rocket`; ACC-P11), painted: a white body lit from the left, red nose and fins,
 * a bell nozzle and its flame, and a cut-away tank filled to the propellant's share of the mass.
 * Beside it, flat: a bar of m₀ split into propellant and dry mass (the propellant part is
 * 1 − m_f ÷ m₀ of it), and Δv = v_e ln(m₀ ÷ m_f) as a curve against the mass ratio with the
 * rocket's point on it (Δv grows with the ratio). `thrust` marks the exit plane (p_e out, p_a
 * in) and splits F into ṁv_e and (p_e − p_a)A_e. `stages` stacks two stages: the masses as one
 * bar (the first stage's structure dropped) and Δv₁ + Δv₂ = Δv. A "?" draws nothing for its value.
 */
import Svg, { Defs, G, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { RocketSpec } from '@/data/modules/typesHe3k';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { massBar, niceStep, thrustParts } from './he3kMath';
import { url, usePaintIds } from './paint';

const LABEL = chart.label;
const H = 292;

/** An upward or downward arrow from y1 to y2 at x. */
function Arrow({ x, y1, y2, color }: { x: number; y1: number; y2: number; color: string }) {
  const dir = y2 > y1 ? 1 : -1;
  return (
    <G>
      <Line x1={x} x2={x} y1={y1} y2={y2 - dir * 8} stroke={color} strokeWidth={2.2} />
      <Path d={`M ${x} ${y2} l -5 ${-dir * 9} l 10 0 z`} fill={color} />
    </G>
  );
}

/** Four figures at most: 3543 m/s, 0.7, 693.7 kN. */
const fig = (x: number) => formatNumber(Number(x.toPrecision(4)));

export function Rocket({ spec, calc }: { spec: RocketSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('body', 'nozzle', 'fuel');
  const num = (x: string | number | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  const text = (x: string | number | undefined) =>
    x === undefined
      ? '?'
      : typeof x === 'number'
        ? fig(x)
        : rep.known(x)
          ? `${fig(rep.shown(x))}${rep.unit(x) ? ` ${rep.unit(x)}` : ''}`
          : '?';
  const sym = (x: string | number | undefined, fallback: string) =>
    typeof x === 'string' ? rep.variable(x).symbol : fallback;
  const g = num(spec.g) ?? 9.81;
  const mode = spec.stages ? 'stages' : spec.thrust ? 'thrust' : 'mass';

  // Mass mode values.
  const m0 = num(spec.m0);
  const mf = num(spec.mf);
  const Isp = num(spec.Isp);
  const massOk = m0 !== undefined && mf !== undefined && m0 > 0 && mf > 0 && mf < m0;
  const ve = Isp === undefined ? undefined : Isp * g;
  // Stages.
  const st = spec.stages?.map((s) => ({
    Isp: num(s.Isp),
    m0: num(s.m0),
    mf: num(s.mf),
    dv: num(s.dv),
  }));
  const dropped =
    st && st[0]!.mf !== undefined && st[1]!.m0 !== undefined ? st[0]!.mf - st[1]!.m0 : undefined;
  const stagesOk = !!st && dropped !== undefined && dropped >= 0;
  const share = (s?: { m0?: number; mf?: number }) =>
    s?.m0 !== undefined && s.mf !== undefined && s.m0 > 0 ? 1 - s.mf / s.m0 : undefined;
  const fills =
    mode === 'stages'
      ? [
          st![0]!.m0 !== undefined && st![0]!.mf !== undefined && dropped !== undefined
            ? (st![0]!.m0 - st![0]!.mf) / (st![0]!.m0 - st![1]!.m0!)
            : undefined,
          share(st![1]),
        ]
      : [massOk ? 1 - mf! / m0! : undefined];

  return (
    <>
      <Canvas aspect={(w) => H / w}>
        {({ w, h }) => {
          const cx = 52;
          const RW = 36;
          const top = 26;
          const exitY = 212;
          const colX = Math.min(170, Math.round(w * 0.46));
          const colR = w - 8;
          const colW = colR - colX;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <LinearGradient id={ids.body} x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={c.rocketBodyDark} />
                  <Stop offset="0.3" stopColor={c.rocketBody} />
                  <Stop offset="0.55" stopColor={c.rocketBody} />
                  <Stop offset="1" stopColor={c.rocketBodyDark} />
                </LinearGradient>
                <LinearGradient id={ids.nozzle} x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={c.metalDark} />
                  <Stop offset="0.35" stopColor={c.metal} />
                  <Stop offset="1" stopColor={c.metalDark} />
                </LinearGradient>
                <LinearGradient id={ids.fuel} x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={c.rocketFuel} stopOpacity={0.75} />
                  <Stop offset="0.35" stopColor={c.rocketFuel} />
                  <Stop offset="1" stopColor={c.rocketFuel} stopOpacity={0.75} />
                </LinearGradient>
              </Defs>
              {drawRocket(cx, RW, top, exitY)}
              {mode === 'mass' ? massColumn(colX, colW, cx) : null}
              {mode === 'thrust' ? thrustColumn(colX, colW, cx, RW, exitY) : null}
              {mode === 'stages' ? stagesColumn(colX, colW) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{captionOf()}</Caption>
    </>
  );

  /** The painted rocket, nose at `top`, nozzle exit at `exitY`; one tank per stage. */
  function drawRocket(cx: number, RW: number, top: number, exitY: number) {
    const noseH = 40;
    const nozH = 22;
    const bodyTop = top + noseH;
    const bodyBot = exitY - nozH;
    const two = mode === 'stages';
    const split = two ? bodyTop + (bodyBot - bodyTop) * 0.36 : undefined;
    const tanks = two
      ? [
          { y0: split! + 10, y1: bodyBot - 14, fill: fills[0] },
          { y0: bodyTop + 8, y1: split! - 8, fill: fills[1] },
        ]
      : mode === 'thrust'
        ? [] // No masses on a thrust page: the body stays closed.
        : [{ y0: bodyTop + 10, y1: bodyBot - 14, fill: fills[0] }];
    const x0 = cx - RW / 2;
    const bad = mode === 'mass' ? !massOk && m0 !== undefined && mf !== undefined : false;
    return (
      <G opacity={bad || (two && dropped !== undefined && dropped < 0) ? 0.4 : 1}>
        {/* The flame, then the nozzle bell. */}
        <Path
          d={`M ${cx - 14} ${exitY} Q ${cx} ${exitY + 70} ${cx + 14} ${exitY} Z`}
          fill={c.cvFlame}
          opacity={0.9}
        />
        <Path
          d={`M ${cx - 7} ${exitY} Q ${cx} ${exitY + 40} ${cx + 7} ${exitY} Z`}
          fill={c.cvFlameCore}
        />
        <Path
          d={`M ${cx - 8} ${bodyBot} L ${cx + 8} ${bodyBot} L ${cx + 15} ${exitY} L ${cx - 15} ${exitY} Z`}
          fill={url(ids.nozzle)}
          stroke={c.chartInk}
          strokeOpacity={0.5}
          strokeWidth={0.8}
        />
        {/* Fins. */}
        <Path
          d={`M ${x0} ${bodyBot - 42} L ${x0 - 15} ${bodyBot + 6} L ${x0} ${bodyBot} Z`}
          fill={c.rocketTrim}
        />
        <Path
          d={`M ${x0 + RW} ${bodyBot - 42} L ${x0 + RW + 15} ${bodyBot + 6} L ${x0 + RW} ${bodyBot} Z`}
          fill={c.rocketTrim}
        />
        {/* Body and nose. */}
        <Rect
          x={x0}
          y={bodyTop}
          width={RW}
          height={bodyBot - bodyTop}
          fill={url(ids.body)}
          stroke={c.chartInk}
          strokeOpacity={0.45}
          strokeWidth={0.8}
        />
        <Path
          d={`M ${x0} ${bodyTop} Q ${x0 + 2} ${top + 10} ${cx} ${top} Q ${x0 + RW - 2} ${top + 10} ${x0 + RW} ${bodyTop} Z`}
          fill={c.rocketTrim}
          stroke={c.chartInk}
          strokeOpacity={0.45}
          strokeWidth={0.8}
        />
        {split !== undefined ? (
          <Line
            x1={x0 - 3}
            x2={x0 + RW + 3}
            y1={split}
            y2={split}
            stroke={c.chartInk}
            strokeWidth={1.5}
            strokeDasharray="4 2"
          />
        ) : null}
        {/* Cut-away tanks: dark when empty, propellant from the bottom up to its share. */}
        {tanks.map((t, i) => {
          const tw = RW - 14;
          const fillH = t.fill === undefined ? 0 : Math.max(0, Math.min(1, t.fill)) * (t.y1 - t.y0);
          return (
            <G key={i}>
              <Rect
                x={cx - tw / 2}
                y={t.y0}
                width={tw}
                height={t.y1 - t.y0}
                rx={3}
                fill={c.rocketTank}
              />
              {t.fill !== undefined ? (
                <Rect
                  x={cx - tw / 2}
                  y={t.y1 - fillH}
                  width={tw}
                  height={fillH}
                  rx={3}
                  fill={url(ids.fuel)}
                />
              ) : null}
              <Rect
                x={cx - tw / 2}
                y={t.y0}
                width={tw}
                height={t.y1 - t.y0}
                rx={3}
                fill="none"
                stroke={c.chartInk}
                strokeOpacity={0.6}
                strokeWidth={0.8}
              />
            </G>
          );
        })}
        {two ? (
          <>
            <ChartText
              x={x0 + RW + 6}
              y={(split! + bodyBot) / 2 + 4}
              fontSize={LABEL}
              fontWeight="700"
            >
              1
            </ChartText>
            <ChartText
              x={x0 + RW + 6}
              y={(bodyTop + split!) / 2 + 4}
              fontSize={LABEL}
              fontWeight="700"
            >
              2
            </ChartText>
          </>
        ) : null}
        {/* v_e out of the nozzle. */}
        {mode !== 'thrust' ? (
          <G>
            <Arrow x={cx + 26} y1={exitY + 6} y2={exitY + 46} color={c.chartInk} />
            <ChartText x={cx + 8} y={exitY + 66} fontSize={LABEL} textAnchor="middle">
              {ve === undefined && mode === 'mass'
                ? 'v_e = ?'
                : mode === 'mass'
                  ? `v_e = ${fig(ve!)} m/s`
                  : 'Exhaust v_e'}
            </ChartText>
          </G>
        ) : null}
      </G>
    );
  }

  /** m₀ split into propellant and dry mass, then Δv against the mass ratio. */
  function massColumn(x0: number, cw: number, cx: number) {
    const dv = num(spec.dv);
    const parts = massOk ? massBar(m0!, mf!, cw) : undefined;
    const barY = 30;
    const prop = massOk ? m0! - mf! : undefined;
    const unitM = typeof spec.m0 === 'string' ? (rep.unit(spec.m0) ?? '') : '';
    const pct = massOk ? `${fig((1 - mf! / m0!) * 100)}%` : '?';
    // The Δv curve.
    const R = massOk ? m0! / mf! : undefined;
    const Rmax = Math.max(4, Math.ceil((R ?? 3) * 1.35));
    const yTop = 118;
    const yBot = 252;
    const px0 = x0 + 34;
    const px1 = x0 + cw - 6;
    const vmax = ve === undefined ? 1 : ve * Math.log(Rmax);
    const step = niceStep(vmax, 3);
    const vTop = Math.ceil(vmax / step) * step;
    const X = (r: number) => px0 + ((r - 1) / (Rmax - 1)) * (px1 - px0);
    const Y = (v: number) => yBot - (v / vTop) * (yBot - yTop);
    const curve =
      ve === undefined
        ? ''
        : Array.from({ length: 61 }, (_, k) => {
            const r = 1 + ((Rmax - 1) * k) / 60;
            return `${k ? 'L' : 'M'} ${X(r).toFixed(1)} ${Y(ve * Math.log(r)).toFixed(1)}`;
          }).join(' ');
    const ticks: number[] = [];
    for (let v = 0; v <= vTop + 1e-9; v += step) ticks.push(v);
    const rStep = Rmax <= 6 ? 1 : Rmax <= 12 ? 2 : 5;
    const rTicks: number[] = [];
    for (let r = 1; r <= Rmax + 1e-9; r += rStep) rTicks.push(r);
    return (
      <G>
        <ChartText x={x0} y={18} fontSize={chart.value} fontWeight="700">
          {`${sym(spec.m0, 'm_0')} = ${text(spec.m0)}`}
        </ChartText>
        {parts ? (
          <>
            <Rect x={x0} y={barY} width={parts.prop} height={22} fill={url(ids.fuel)} />
            <Rect
              x={x0 + parts.prop}
              y={barY}
              width={parts.dry}
              height={22}
              fill={c.rocketBodyDark}
            />
          </>
        ) : null}
        <Rect
          x={x0}
          y={barY}
          width={cw}
          height={22}
          fill="none"
          stroke={c.chartInk}
          strokeWidth={1}
          strokeDasharray={parts ? undefined : chart.dash}
        />
        <ChartText x={x0} y={barY + 38} fontSize={LABEL}>
          {`Propellant ${prop === undefined ? '?' : `${fig(prop)} ${unitM}`}`}
        </ChartText>
        <ChartText x={x0} y={barY + 54} fontSize={LABEL} fill={c.chartMuted}>
          {`${pct} of the mass`}
        </ChartText>
        <ChartText x={x0 + cw} y={barY + 38} fontSize={LABEL} textAnchor="end">
          {`Dry ${text(spec.mf)}`}
        </ChartText>
        {/* Δv against m₀ ÷ m_f. */}
        <ChartText x={x0} y={yTop - 12} fontSize={LABEL} fontWeight="700">
          Δv (m/s)
        </ChartText>
        {ticks.map((v) => (
          <G key={`t${v}`}>
            <Line x1={px0} x2={px1} y1={Y(v)} y2={Y(v)} stroke={c.chartGrid} strokeWidth={1} />
            <ChartText
              x={px0 - 4}
              y={Y(v) + 4}
              fontSize={LABEL}
              textAnchor="end"
              fill={c.chartMuted}
            >
              {v >= 1000 ? `${formatNumber(v / 1000)}k` : formatNumber(v)}
            </ChartText>
          </G>
        ))}
        <Line x1={px0} x2={px1} y1={yBot} y2={yBot} stroke={c.chartInk} strokeWidth={1.5} />
        <Line x1={px0} x2={px0} y1={yTop} y2={yBot} stroke={c.chartInk} strokeWidth={1.5} />
        {rTicks.map((r) => (
          <ChartText
            key={`r${r}`}
            x={X(r)}
            y={yBot + 15}
            fontSize={LABEL}
            textAnchor="middle"
            fill={c.chartMuted}
          >
            {formatNumber(r)}
          </ChartText>
        ))}
        <ChartText x={px1} y={yBot + 31} fontSize={LABEL} textAnchor="end">
          Mass ratio m₀ ÷ m_f
        </ChartText>
        {curve ? <Path d={curve} fill="none" stroke={c.chartHighlight} strokeWidth={2.5} /> : null}
        {R !== undefined && ve !== undefined && dv !== undefined ? (
          <G>
            <Line
              x1={X(R)}
              x2={X(R)}
              y1={Y(dv)}
              y2={yBot}
              stroke={c.chartMuted}
              strokeWidth={1}
              strokeDasharray={chart.dashFine}
            />
            <Line
              x1={px0}
              x2={X(R)}
              y1={Y(dv)}
              y2={Y(dv)}
              stroke={c.chartMuted}
              strokeWidth={1}
              strokeDasharray={chart.dashFine}
            />
            <Path
              d={`M ${X(R)} ${Y(dv) - 5} a 5 5 0 1 0 0.01 0`}
              fill={c.chartHighlight}
              stroke={c.background}
              strokeWidth={1.5}
            />
          </G>
        ) : null}
        {/* Δv beside the rocket, pointing up. */}
        <Arrow x={cx + 56} y1={170} y2={70} color={c.chartHighlight} />
        <ChartText x={cx + 56} y={58} fontSize={chart.value} fontWeight="700" textAnchor="middle">
          Δv
        </ChartText>
        <ChartText x={cx + 56} y={190} fontSize={LABEL} textAnchor="middle">
          {dv === undefined ? '?' : `${fig(dv)}`}
        </ChartText>
        <ChartText x={cx + 56} y={205} fontSize={LABEL} textAnchor="middle" fill={c.chartMuted}>
          m/s
        </ChartText>
      </G>
    );
  }

  /** The exit plane on the rocket and F split into its two terms. */
  function thrustColumn(x0: number, cw: number, cx: number, RW: number, exitY: number) {
    const t = spec.thrust!;
    const [mdot, vE, pe, pa, Ae, F] = [
      num(t.mdot),
      num(t.ve),
      num(t.pe),
      num(t.pa),
      num(t.Ae),
      num(t.F),
    ];
    const all = [mdot, vE, pe, pa, Ae].every((v) => v !== undefined);
    const parts = all ? thrustParts(mdot!, vE!, pe!, pa!, Ae!, t.mv, t.pA) : undefined;
    const fUnit = typeof t.F === 'string' ? (rep.unit(t.F) ?? '') : '';
    const rows = [
      { label: 'ṁv_e', value: parts?.momentum, fill: c.chartHighlight },
      {
        label: '(p_e − p_a)A_e',
        value: parts?.pressure,
        fill: (parts?.pressure ?? 0) >= 0 ? c.blockGreen : c.blockRed,
      },
      { label: 'F', value: F, fill: c.chartInk },
    ];
    const vals = rows.map((r) => r.value ?? 0);
    const lo = Math.min(0, ...vals);
    const hi = Math.max(1e-9, ...vals);
    const sx = (v: number) => x0 + 4 + ((v - lo) / (hi - lo)) * (cw - 8);
    const rowY = (i: number) => 112 + i * 46;
    return (
      <G>
        {/* On the rocket: the exit plane, p_e pushing out, p_a pushing in. */}
        <Line
          x1={cx - 24}
          x2={cx + 24}
          y1={exitY}
          y2={exitY}
          stroke={c.chartInk}
          strokeWidth={1.5}
          strokeDasharray={chart.dash}
        />
        <Arrow x={cx - 6} y1={exitY + 2} y2={exitY + 22} color={c.chartInk} />
        <ChartText x={cx - 12} y={exitY + 38} fontSize={LABEL} textAnchor="end">
          p_e
        </ChartText>
        <Arrow x={cx + 34} y1={exitY + 24} y2={exitY + 4} color={c.chartMuted} />
        <ChartText x={cx + 42} y={exitY + 22} fontSize={LABEL}>
          p_a
        </ChartText>
        <ChartText x={cx} y={exitY + 58} fontSize={LABEL} textAnchor="middle">
          Exit plane A_e
        </ChartText>
        {/* F up, beside the rocket. */}
        <Arrow x={cx + 56} y1={170} y2={70} color={c.chartHighlight} />
        <ChartText
          x={cx + 56}
          y={58}
          fontSize={chart.value}
          fontWeight="700"
          textAnchor="middle"
          fontStyle="italic"
        >
          F
        </ChartText>
        {/* The values at the exit plane. */}
        <ChartText x={x0} y={18} fontSize={LABEL}>
          {`${sym(t.mdot, 'ṁ')} = ${text(t.mdot)}`}
        </ChartText>
        <ChartText x={x0} y={36} fontSize={LABEL}>
          {`${sym(t.ve, 'v_e')} = ${text(t.ve)}`}
        </ChartText>
        <ChartText x={x0} y={54} fontSize={LABEL}>
          {`${sym(t.pe, 'p_e')} = ${text(t.pe)}`}
        </ChartText>
        <ChartText x={x0} y={72} fontSize={LABEL}>
          {`${sym(t.pa, 'p_a')} = ${text(t.pa)}`}
        </ChartText>
        <ChartText x={x0} y={90} fontSize={LABEL}>
          {`${sym(t.Ae, 'A_e')} = ${text(t.Ae)}`}
        </ChartText>
        {/* F = ṁv_e + (p_e − p_a)A_e as signed bars from zero. */}
        {rows.map((r, i) => (
          <G key={r.label}>
            <ChartText x={x0} y={rowY(i) + 8} fontSize={LABEL} fontWeight="700">
              {r.label}
            </ChartText>
            <ChartText x={x0 + cw} y={rowY(i) + 8} fontSize={LABEL} textAnchor="end">
              {r.value === undefined
                ? '?'
                : `${r.value > 0 && i === 1 ? '+' : ''}${fig(r.value).replace('-', '−')} ${fUnit}`}
            </ChartText>
            <Line
              x1={sx(0)}
              x2={sx(0)}
              y1={rowY(i) + 11}
              y2={rowY(i) + 29}
              stroke={c.chartInk}
              strokeWidth={1.2}
            />
            {r.value !== undefined ? (
              <Rect
                x={Math.min(sx(0), sx(r.value))}
                y={rowY(i) + 13}
                width={Math.max(1.5, Math.abs(sx(r.value) - sx(0)))}
                height={14}
                rx={2}
                fill={r.fill}
                opacity={0.85}
              />
            ) : null}
          </G>
        ))}
      </G>
    );
  }

  /** The stack's masses as one bar and Δv₁ + Δv₂ = Δv. */
  function stagesColumn(x0: number, cw: number) {
    const [s1, s2] = st!;
    const unitM =
      typeof spec.stages![0].m0 === 'string' ? (rep.unit(spec.stages![0].m0) ?? '') : '';
    const segs =
      stagesOk && s1!.m0 !== undefined && s2!.mf !== undefined
        ? [
            {
              m: s1!.m0 - s1!.mf!,
              fill: url(ids.fuel),
              text: `1: propellant ${fig(s1!.m0 - s1!.mf!)} ${unitM}`,
              dash: false,
            },
            {
              m: dropped!,
              fill: c.rocketBodyDark,
              text: `1: tanks ${fig(dropped!)} ${unitM} (dropped)`,
              dash: true,
            },
            {
              m: s2!.m0! - s2!.mf,
              fill: url(ids.fuel),
              text: `2: propellant ${fig(s2!.m0! - s2!.mf)} ${unitM}`,
              dash: false,
            },
            {
              m: s2!.mf,
              fill: c.rocketBodyDark,
              text: `2: dry ${fig(s2!.mf)} ${unitM}`,
              dash: false,
            },
          ]
        : [];
    const total = s1?.m0 ?? 1;
    let at = x0;
    const dvTotal = num(spec.dv);
    const dvs = [s1!.dv, s2!.dv];
    const dvSum = (dvs[0] ?? 0) + (dvs[1] ?? 0);
    const dvY = 186;
    return (
      <G>
        <ChartText x={x0} y={18} fontSize={chart.value} fontWeight="700">
          {`${sym(spec.stages![0].m0, 'm_01')} = ${text(spec.stages![0].m0)}`}
        </ChartText>
        {segs.map((s, i) => {
          const wSeg = (s.m / total) * cw;
          const x = at;
          at += wSeg;
          return (
            <G key={i}>
              <Rect
                x={x}
                y={28}
                width={Math.max(0, wSeg)}
                height={22}
                fill={s.fill}
                opacity={i >= 2 ? 0.8 : 1}
              />
              <Line
                x1={x}
                x2={x}
                y1={28}
                y2={50}
                stroke={c.chartInk}
                strokeWidth={i === 2 ? 2 : 0.8}
              />
            </G>
          );
        })}
        <Rect
          x={x0}
          y={28}
          width={cw}
          height={22}
          fill="none"
          stroke={c.chartInk}
          strokeWidth={1}
          strokeDasharray={segs.length ? undefined : chart.dash}
        />
        {segs.map((s, i) => (
          <G key={`k${i}`}>
            <Rect
              x={x0}
              y={62 + i * 18}
              width={11}
              height={11}
              rx={2}
              fill={s.fill}
              stroke={c.chartInk}
              strokeOpacity={0.4}
            />
            <ChartText x={x0 + 16} y={72 + i * 18} fontSize={LABEL}>
              {s.text}
            </ChartText>
          </G>
        ))}
        {!stagesOk && dropped !== undefined ? (
          <ChartText x={x0} y={72} fontSize={LABEL}>
            Stage 2 outweighs stage 1 at burnout
          </ChartText>
        ) : null}
        {/* Δv₁ then Δv₂, one bar. */}
        <ChartText x={x0} y={dvY - 10} fontSize={chart.value} fontWeight="700">
          {`Δv = ${dvTotal === undefined ? '?' : `${fig(dvTotal)} m/s`}`}
        </ChartText>
        {dvs[0] !== undefined && dvs[1] !== undefined && dvSum > 0 ? (
          <>
            <Rect
              x={x0}
              y={dvY}
              width={(dvs[0] / dvSum) * cw}
              height={22}
              fill={c.chartHighlight}
              opacity={0.85}
            />
            <Rect
              x={x0 + (dvs[0] / dvSum) * cw}
              y={dvY}
              width={(dvs[1] / dvSum) * cw}
              height={22}
              fill={c.chartSecond}
              opacity={0.85}
            />
          </>
        ) : null}
        <Rect
          x={x0}
          y={dvY}
          width={cw}
          height={22}
          fill="none"
          stroke={c.chartInk}
          strokeWidth={1}
        />
        <ChartText x={x0} y={dvY + 38} fontSize={LABEL}>
          {`Δv₁ ${dvs[0] === undefined ? '?' : fig(dvs[0])}`}
        </ChartText>
        <ChartText x={x0 + cw} y={dvY + 38} fontSize={LABEL} textAnchor="end">
          {`Δv₂ ${dvs[1] === undefined ? '?' : fig(dvs[1])}`}
        </ChartText>
        <ChartText x={x0 + cw} y={dvY + 54} fontSize={LABEL} textAnchor="end" fill={c.chartMuted}>
          m/s
        </ChartText>
      </G>
    );
  }

  function captionOf() {
    if (mode === 'thrust') {
      const t = spec.thrust!;
      const lines = [
        `F = ${text(t.mdot).split(' ')[0]} × ${text(t.ve).split(' ')[0]}${(t.mv ?? 0.001) === 0.001 ? ' ÷ 1000' : ''} + (${text(t.pe).split(' ')[0]} − ${text(t.pa).split(' ')[0]}) × ${text(t.Ae).split(' ')[0]} = ${text(t.F)}`,
      ];
      if (t.Isp !== undefined) lines.push(`Specific impulse: ${text(t.Isp)}`);
      return lines.join(' · ');
    }
    if (mode === 'stages') {
      const s = spec.stages!;
      const lines = [`Δv = ${text(s[0].dv)} + ${text(s[1].dv)} = ${text(spec.dv)}`];
      if (dropped !== undefined && dropped < 0)
        lines.push('Stage 2 can’t weigh more than stage 1 at its burnout.');
      return lines.join(' · ');
    }
    const lines: string[] = [];
    if (m0 !== undefined && mf !== undefined && !massOk)
      lines.push('The final mass must be less than the initial mass: no propellant is burned.');
    lines.push(
      `Δv = ${text(spec.Isp).split(' ')[0]} × ${fig(g)} × ln(${text(spec.m0).split(' ')[0]} ÷ ${text(spec.mf).split(' ')[0]}) = ${text(spec.dv)}`,
    );
    if (spec.fraction !== undefined)
      lines.push(
        `Propellant fraction: 1 − ${text(spec.mf).split(' ')[0]} ÷ ${text(spec.m0).split(' ')[0]} = ${text(spec.fraction)}`,
      );
    return lines.join(' · ');
  }
}
