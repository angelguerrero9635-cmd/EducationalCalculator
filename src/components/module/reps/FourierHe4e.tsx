/**
 * HC179 (`functionGraph` `family: 'fourier'`, FamilyHe4e in typesHe4e.ts): a Fourier series.
 * Above, two periods of the wave (dashed) and its partial sum through harmonic N (solid), the
 * Gibbs overshoot at each jump; below, the stems bₖ (those in the sum in the highlight, the rest
 * muted) with harmonic k lit and its value written. Flat; no handles.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { FunctionGraphSpec } from '@/data/modules/typesFunctionGraph';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { fourierB, fourierSum, wavePower, waveAt } from './he4eMath';

const n3 = (x: number) => formatNumber(Number(x.toPrecision(3)));
const sub = (n: number) => [...String(n)].map((d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)] ?? d).join('');
const WAVE_NAME = { square: 'square wave', saw: 'sawtooth', triangle: 'triangle wave' };

export function FourierHe4e({ spec, calc }: { spec: FunctionGraphSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  if (spec.family !== 'fourier') return null;
  type V = number | string | undefined;
  const known = (v: V) => v !== undefined && (typeof v === 'number' || rep.known(v));
  const get = (v: V): number | undefined =>
    !known(v) ? undefined : typeof v === 'number' ? v : rep.shown(v as string);
  const say = (v: V, x: number) => (typeof v === 'string' ? rep.value(v, false) : n3(x));
  const s = spec.fourier;
  const A = get(s.amplitude) ?? (s.amplitude === undefined ? 1 : undefined);
  const Nraw = get(s.terms);
  const N = Nraw === undefined ? undefined : Math.max(1, Math.min(99, Math.round(Nraw)));
  const k = s.k === undefined ? undefined : get(s.k);
  const kk = k === undefined ? undefined : Math.round(k);
  const K = Math.min(99, Math.max(9, N ?? 0, kk ?? 0));
  const bk = A !== undefined && kk !== undefined ? fourierB(s.wave, kk, A) : undefined;
  const Ashow = A ?? 1;
  const bs = Array.from({ length: K }, (_, i) => fourierB(s.wave, i + 1, Ashow));
  const bMax = Math.max(...bs.map(Math.abs), 1e-9);
  const signed = bs.some((b) => b < -1e-12);
  // The partial sum, sampled densely enough for N harmonics.
  const M = Math.max(400, 16 * (N ?? 1) * 2);
  const sum =
    N === undefined || A === undefined
      ? undefined
      : Array.from({ length: M + 1 }, (_, i) => fourierSum(s.wave, N, A, (2 * i) / M));
  const peak = sum ? Math.max(...sum) : undefined;

  // ── Caption ──
  const lines: string[] = [];
  if (A === undefined || N === undefined)
    lines.push(`Type ${A === undefined ? 'A' : 'the harmonics'} to draw the partial sum.`);
  else
    lines.push(
      `${WAVE_NAME[s.wave][0]!.toUpperCase()}${WAVE_NAME[s.wave].slice(1)} of amplitude ${say(s.amplitude, A)} (dashed) and its sum through harmonic ${N} (solid): the peak ${n3(peak!)}${
        s.wave === 'triangle' || peak! <= A * 1.001
          ? ''
          : `, ${n3(((peak! - A) / (2 * A)) * 100)}% of the jump past it (Gibbs)`
      }.`,
    );
  if (kk !== undefined && bk !== undefined && A !== undefined) {
    const formula =
      s.wave === 'square'
        ? `4A ÷ (kπ) = 4 × ${say(s.amplitude, A)} ÷ (${kk}π)`
        : s.wave === 'saw'
          ? `2A(−1)^(k+1) ÷ (kπ)`
          : `8A(−1)^((k−1)/2) ÷ (kπ)²`;
    lines.push(
      `b${sub(kk)} = ${bk === 0 ? '0 (this wave has no even harmonics)' : `${formula} = ${s.coefficient && known(s.coefficient) ? rep.value(s.coefficient) : n3(bk)}`}.`,
    );
    const f0 = get(s.f0);
    if (f0 !== undefined && typeof s.f0 === 'string')
      lines.push(
        `f${sub(kk)} = ${kk} × ${rep.value(s.f0)} = ${s.fk && known(s.fk) ? rep.value(s.fk) : n3(kk * f0)}.`,
      );
    if (bk !== 0)
      lines.push(
        `Its share of the power: (b${sub(kk)}² ÷ 2) ÷ ${s.wave === 'square' ? 'A²' : '(A² ÷ 3)'} = ${s.share && known(s.share) ? rep.value(s.share) : n3((bk * bk) / 2 / wavePower(s.wave, A))}.`,
      );
  }

  const ph1 = (w: number) => Math.min(170, 0.36 * w);
  const ph2 = (w: number) => Math.min(130, 0.27 * w);
  return (
    <View>
      <Canvas aspect={(w) => (22 + ph1(w) + 30 + ph2(w) + 40) / w}>
        {({ w, h }) => {
          const L = 30;
          const R = 12;
          const top = 22;
          const base1 = top + ph1(w) / 2;
          const yMax = 1.3 * Ashow;
          const tx = (x: number) => L + (x / 2) * (w - L - R);
          const ty = (y: number) => base1 - (y / yMax) * (ph1(w) / 2);
          const top2 = top + ph1(w) + 30;
          const zero2 = signed ? top2 + ph2(w) / 2 : top2 + ph2(w);
          const span2 = signed ? ph2(w) / 2 - 6 : ph2(w) - 8;
          const kx = (n: number) => L + 6 + ((n - 0.5) / K) * (w - L - R - 12);
          const by = (b: number) => zero2 - (b / bMax) * span2;
          let wave = '';
          for (let i = 0; i <= 800; i++) {
            const x = (2 * i) / 800;
            const y = waveAt(s.wave, Ashow, x);
            wave += `${i ? 'L' : 'M'}${tx(x).toFixed(1)},${ty(y).toFixed(1)}`;
          }
          const sumPath = sum
            ? sum
                .map((y, i) => `${i ? 'L' : 'M'}${tx((2 * i) / M).toFixed(1)},${ty(y).toFixed(1)}`)
                .join('')
            : '';
          const kEvery = K <= 15 ? 2 : K <= 40 ? 5 : 10;
          const kTicks = [
            1,
            ...Array.from({ length: Math.floor(K / kEvery) }, (_, i) => (i + 1) * kEvery),
          ];
          const bLabel =
            bk === undefined || kk === undefined
              ? ''
              : `b${sub(kk)} = ${s.coefficient && known(s.coefficient) ? rep.value(s.coefficient, false) : n3(bk)}`;
          return (
            <Svg width={w} height={h}>
              {/* Key. */}
              <Line
                x1={L}
                y1={9}
                x2={L + 16}
                y2={9}
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
              />
              <ChartText x={L + 20} y={13}>{`sum through k = ${N ?? '?'}`}</ChartText>
              <Line
                x1={w - R - 110}
                y1={9}
                x2={w - R - 94}
                y2={9}
                stroke={c.chartMuted}
                strokeWidth={chart.strokeLight}
                strokeDasharray={chart.dash}
              />
              <ChartText x={w - R} y={13} textAnchor="end" fill={c.chartMuted}>
                {WAVE_NAME[s.wave]}
              </ChartText>
              {/* Two periods: the wave dashed, the partial sum over it. */}
              <Line x1={L} y1={base1} x2={w - R} y2={base1} stroke={c.chartGrid} strokeWidth={1} />
              {[1, -1].map((sgn) => (
                <G key={`a${sgn}`}>
                  <Line
                    x1={L - 4}
                    y1={ty(sgn * Ashow)}
                    x2={L}
                    y2={ty(sgn * Ashow)}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                  <ChartText x={L - 6} y={ty(sgn * Ashow) + 4} textAnchor="end" fill={c.chartMuted}>
                    {A === undefined
                      ? sgn > 0
                        ? 'A'
                        : '−A'
                      : formatNumber(Number((sgn * A).toPrecision(3)))}
                  </ChartText>
                </G>
              ))}
              <ChartText x={L - 6} y={base1 + 4} textAnchor="end" fill={c.chartMuted}>
                0
              </ChartText>
              <Line
                x1={L}
                y1={top + 4}
                x2={L}
                y2={top + ph1(w) - 4}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              {[0.5, 1, 1.5, 2].map((x) => (
                <G key={`t${x}`}>
                  <Line
                    x1={tx(x)}
                    y1={base1 - 3}
                    x2={tx(x)}
                    y2={base1 + 3}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                  <ChartText
                    x={tx(x)}
                    y={top + ph1(w) + 12}
                    textAnchor="middle"
                    fill={c.chartMuted}
                  >
                    {x === 1 ? 'T' : x === 2 ? '2T' : x === 0.5 ? 'T/2' : '3T/2'}
                  </ChartText>
                </G>
              ))}
              <Path
                d={wave}
                fill="none"
                stroke={c.chartMuted}
                strokeWidth={chart.strokeLight}
                strokeDasharray={chart.dash}
              />
              {sum ? (
                <Path
                  d={sumPath}
                  fill="none"
                  stroke={c.chartHighlight}
                  strokeWidth={chart.stroke}
                />
              ) : null}
              {/* The stems bₖ. */}
              <Line
                x1={L}
                y1={zero2}
                x2={w - R}
                y2={zero2}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              <ChartText
                x={L - 6}
                y={top2 + 4}
                textAnchor="end"
                fontStyle="italic"
                fontWeight="700"
              >
                bₖ
              </ChartText>
              {bs.map((b, i) => {
                const n = i + 1;
                if (Math.abs(b) < 1e-12) return null;
                const lit = n === kk;
                const inSum = N !== undefined && n <= N;
                const col = lit ? c.fnSecond : inSum ? c.chartHighlight : c.chartMuted;
                return (
                  <G key={`s${n}`} opacity={A === undefined ? 0.35 : 1}>
                    <Line
                      x1={kx(n)}
                      y1={zero2}
                      x2={kx(n)}
                      y2={by(b)}
                      stroke={col}
                      strokeWidth={lit ? chart.strokeHeavy : chart.strokeLight}
                    />
                    <Circle cx={kx(n)} cy={by(b)} r={lit ? 4.5 : K > 40 ? 1.5 : 3} fill={col} />
                  </G>
                );
              })}
              {kTicks.map((n) => (
                <ChartText
                  key={`k${n}`}
                  x={kx(n)}
                  y={top2 + ph2(w) + (signed ? 14 : 16)}
                  textAnchor="middle"
                  fill={c.chartMuted}
                >
                  {String(n)}
                </ChartText>
              ))}
              <ChartText
                x={(L + w - R) / 2}
                y={top2 + ph2(w) + 34}
                textAnchor="middle"
                fill={c.chartMuted}
              >
                Harmonic k
              </ChartText>
              {bk !== undefined && kk !== undefined && kk <= K && A !== undefined ? (
                <ChartText
                  {...fitLabel(kx(kk) + 8, bLabel, chart.label, w, 'start', 8)}
                  y={
                    bk >= 0
                      ? Math.max(top2 + 10, Math.min(by(bk), zero2 - 4) - 6)
                      : Math.min(top2 + ph2(w) - 2, Math.max(by(bk), zero2 + 4) + 14)
                  }
                  fontWeight="700"
                  fill={c.fnSecond}
                  halo
                >
                  {bLabel}
                </ChartText>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
