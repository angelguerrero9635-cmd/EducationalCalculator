/**
 * HC181 `rfSpectrum` (RfSpectrumSpec in typesHe4m.ts): a tone-modulated carrier. Above, the
 * signal in time with its envelope dashed (the carrier drawn far slower than it is); below, its
 * spectrum to scale: AM's carrier and two sidebands of height μ ÷ 2, or FM's lines every f_m of
 * height |J_n(β)| with Carson's band bracketed. Flat, as a chart is; no handles.
 */
import type { ReactElement } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Path } from 'react-native-svg';

import type { RfSpectrumSpec } from '@/data/modules/typesHe4m';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel } from './common';
import { besselJ, spectrumLines } from './he4mMath';
import { n3, useFields } from './he4mKit';

const H = 296;
/** Carrier cycles drawn in one message cycle (the real ratio is f_c ÷ f_m). */
const CYCLES = 11;

export function RfSpectrum({ spec, calc }: { spec: RfSpectrumSpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, get, say } = useFields(calc);
  const am = spec.mode === 'am';
  const fm = get(spec.fm);
  const fc = get(spec.fc);
  const mu = get(spec.mu);
  const dev = get(spec.deviation);
  const beta = get(spec.beta) ?? (dev !== undefined && fm ? dev / fm : undefined);
  const index = am ? mu : beta;
  const over = am && mu !== undefined && mu > 1 + 1e-9;
  const unit = spec.unit ?? (typeof spec.fm === 'string' ? rep.unit(spec.fm) : undefined) ?? 'kHz';
  const B =
    get(spec.bandwidth) ??
    (fm === undefined ? undefined : am ? 2 * fm : dev !== undefined ? 2 * (dev + fm) : undefined);
  const lines = index === undefined ? [] : spectrumLines(spec.mode, index);
  const edge = am ? 1 : beta === undefined ? 1 : beta + 1;

  const text: string[] = [];
  if (index === undefined || fm === undefined)
    text.push(
      am
        ? 'Type μ and f_m to draw the carrier and its sidebands.'
        : 'Type Δf and f_m to draw the lines.',
    );
  else if (am) {
    if (over)
      text.push(
        `μ = ${say(spec.mu, mu!)} is above 1: the envelope crosses zero (overmodulation), and the sidebands are no longer just two lines.`,
      );
    const Pc = get(spec.carrierPower);
    if (Pc !== undefined && !over) {
      const Pt = Pc * (1 + mu! ** 2 / 2);
      text.push(
        `P_t = P_c(1 + μ²/2) = ${say(spec.carrierPower, Pc)} × (1 + ${say(spec.mu, mu!)}² ÷ 2) = ${say(spec.totalPower, Pt, true)}, so the sidebands carry P_sb = ${say(spec.sidebandPower, Pt - Pc, true)} and η = μ² ÷ (2 + μ²) = ${say(spec.efficiency, (100 * mu! ** 2) / (2 + mu! ** 2), true)}.`,
      );
    }
    if (!over)
      text.push(
        `Each sideband is μ/2 = ${n3(mu! / 2)} of the carrier’s height, so the two hold μ²/2 = ${n3(mu! ** 2 / 2)} of its power.`,
      );
    text.push(
      `B = 2 × f_m = ${say(spec.bandwidth, B!)} ${unit}${fc !== undefined ? `: the sidebands sit at ${formatNumber(fc - fm)} and ${formatNumber(fc + fm)} ${unit}` : ''}.`,
    );
  } else {
    text.push(
      dev !== undefined
        ? `β = Δf ÷ f_m = ${say(spec.deviation, dev)} ÷ ${say(spec.fm, fm)} = ${say(spec.beta, beta!)}.`
        : `β = ${say(spec.beta, beta!)}.`,
    );
    if (B !== undefined && dev !== undefined)
      text.push(
        `Carson’s rule: B = 2(Δf + f_m) = 2 × (${say(spec.deviation, dev)} + ${say(spec.fm, fm)}) = ${say(spec.bandwidth, B)} ${unit}, the lines out to ±(β + 1)f_m.`,
      );
    text.push(
      `The carrier’s line is |J₀(${n3(beta!)})| = ${n3(Math.abs(besselJ(0, beta!)))} of the unmodulated carrier; the rest of the power moved into the sidebands.`,
    );
  }
  text.push(`The carrier is drawn ${CYCLES} cycles to each message cycle, far slower than it is.`);

  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w, h }) => {
          const L = 16;
          const R = 16;
          // ── The signal in time.
          const mid = 62;
          const unitA = 21;
          const N = 700;
          let sig = '';
          let envT = '';
          let envB = '';
          const dIdx = index ?? 0;
          for (let i = 0; i <= N; i++) {
            const t = i / N; // two message cycles across the width
            const x = L + t * (w - L - R);
            const tm = 2 * Math.PI * 2 * t;
            let y: number;
            let env: number;
            if (am) {
              env = 1 + dIdx * Math.cos(tm);
              y = env * Math.cos(2 * Math.PI * 2 * CYCLES * t);
            } else {
              env = 1;
              // The crests bunch where the message is high: a frequency swing drawn ±40% at most.
              const d = Math.min(0.4, 0.08 * dIdx);
              y = Math.cos(2 * Math.PI * 2 * CYCLES * t + (d * CYCLES * Math.sin(tm)) / 1);
            }
            sig += `${i ? 'L' : 'M'}${x.toFixed(1)},${(mid - unitA * y).toFixed(1)}`;
            envT += `${i ? 'L' : 'M'}${x.toFixed(1)},${(mid - unitA * env).toFixed(1)}`;
            envB += `${i ? 'L' : 'M'}${x.toFixed(1)},${(mid + unitA * env).toFixed(1)}`;
          }
          // ── The spectrum.
          const base = 252;
          const hA = 78;
          const span = am ? 2.2 : Math.max(2, edge + 2.5);
          const cx = w / 2;
          const du = (w - L - R) / (2 * span);
          const xOf = (n: number) => cx + n * du;
          const marks: ReactElement[] = [];
          for (const ln of lines) {
            const a = Math.abs(ln.a);
            if (a < 0.01) continue;
            const x = xOf(ln.n);
            const carrier = ln.n === 0;
            marks.push(
              <Line
                key={`l${ln.n}`}
                x1={x}
                x2={x}
                y1={base}
                y2={base - a * hA}
                stroke={carrier ? c.he4mCarrierLine : c.he4mSideband}
                strokeWidth={am ? 4 : 3}
              />,
            );
          }
          const amLabel = (n: number, t: string) => (
            <ChartText
              key={`a${n}`}
              x={xOf(n) + (n === 0 ? 7 : 0)}
              y={base - (n === 0 ? 1 : dIdx / 2) * hA - (n === 0 ? -12 : 6)}
              textAnchor={n === 0 ? 'start' : 'middle'}
              fill={n === 0 ? c.he4mCarrierLine : c.he4mSideband}
              fontWeight="700"
            >
              {t}
            </ChartText>
          );
          const ticks: { n: number; t: string }[] = am
            ? fc !== undefined && fm !== undefined
              ? [
                  { n: -1, t: formatNumber(fc - fm) },
                  { n: 0, t: formatNumber(fc) },
                  { n: 1, t: formatNumber(fc + fm) },
                ]
              : [
                  { n: -1, t: '−f_m' },
                  { n: 0, t: '0' },
                  { n: 1, t: 'f_m' },
                ]
            : fm !== undefined && beta !== undefined
              ? [
                  { n: -edge, t: formatNumber((fc ?? 0) - edge * fm) },
                  { n: 0, t: formatNumber(fc ?? 0) },
                  { n: edge, t: formatNumber((fc ?? 0) + edge * fm) },
                ]
              : [];
          const bracketY = base - hA - 20;
          const bText = B === undefined ? '' : `B = ${say(spec.bandwidth, B)} ${unit}`;
          return (
            <Svg width={w} height={h}>
              <G opacity={over ? 0.4 : 1}>
                <ChartText x={L} y={14} fill={c.chartMuted}>
                  Signal in time (two message cycles)
                </ChartText>
                <Line x1={L} x2={w - R} y1={mid} y2={mid} stroke={c.chartGrid} strokeWidth={1} />
                {index !== undefined ? (
                  <G>
                    <Path d={sig} fill="none" stroke={c.chartInk} strokeWidth={1.1} />
                    <Path
                      d={envT}
                      fill="none"
                      stroke={c.he4mEnvelope}
                      strokeWidth={chart.stroke}
                      strokeDasharray={chart.dash}
                    />
                    <Path
                      d={envB}
                      fill="none"
                      stroke={c.he4mEnvelope}
                      strokeWidth={chart.stroke}
                      strokeDasharray={chart.dash}
                    />
                  </G>
                ) : null}
                <ChartText x={L} y={132} fill={c.chartMuted}>
                  Spectrum (line heights to scale)
                </ChartText>
                <Line
                  x1={L}
                  x2={w - R}
                  y1={base}
                  y2={base}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                {marks}
                {am && index !== undefined ? (
                  <G>
                    {amLabel(0, '1')}
                    {amLabel(-1, `${n3(dIdx / 2)}`)}
                    {amLabel(1, `${n3(dIdx / 2)}`)}
                  </G>
                ) : null}
                {!am && beta !== undefined ? (
                  <ChartText
                    {...fitLabel(
                      xOf(0),
                      `|J₀| = ${n3(Math.abs(besselJ(0, beta)))}`,
                      chart.label,
                      w,
                    )}
                    y={bracketY + 18}
                    fill={c.he4mCarrierLine}
                    fontWeight="700"
                    halo
                  >
                    {`|J₀| = ${n3(Math.abs(besselJ(0, beta)))}`}
                  </ChartText>
                ) : null}
                {ticks.map((tk) => (
                  <G key={`t${tk.n}`}>
                    <Line
                      x1={xOf(tk.n)}
                      x2={xOf(tk.n)}
                      y1={base}
                      y2={base + 5}
                      stroke={c.chartInk}
                      strokeWidth={1}
                    />
                    <ChartText
                      {...fitLabel(xOf(tk.n), tk.t, chart.label, w)}
                      y={base + 18}
                      fill={c.chartMuted}
                    >
                      {tk.t}
                    </ChartText>
                  </G>
                ))}
                <ChartText
                  {...fitLabel(
                    cx,
                    fc !== undefined ? `f (${unit})` : `f − f_c (${unit})`,
                    chart.label,
                    w,
                  )}
                  y={base + 36}
                  fill={c.chartMuted}
                >
                  {fc !== undefined ? `f (${unit})` : `f − f_c (${unit})`}
                </ChartText>
                {B !== undefined && index !== undefined ? (
                  <G>
                    <Path
                      d={`M ${xOf(-edge)} ${bracketY + 6} L ${xOf(-edge)} ${bracketY} L ${xOf(edge)} ${bracketY} L ${xOf(edge)} ${bracketY + 6}`}
                      fill="none"
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    <ChartText
                      {...fitLabel(cx, bText, chart.label, w)}
                      y={bracketY - 6}
                      fontWeight="700"
                    >
                      {bText}
                    </ChartText>
                  </G>
                ) : null}
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{text.join(' ')}</Caption>
    </View>
  );
}
