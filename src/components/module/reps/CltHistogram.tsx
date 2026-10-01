/**
 * H99: the central limit theorem, simulated (`histogram` with `clt`), flat. On top, the
 * population: right-skewed wait times (exponential, mean and standard deviation μ). Under it, on
 * the same axis, the means of `samples` random samples of size n as a histogram, with the normal
 * curve of mean μ and spread σ/√n over them: the bigger n, the narrower and more bell-shaped.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { HistogramSpec } from '@/data/modules/typesHsb';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { cltModel } from './cltModel';
import { Canvas, Caption, ChartText, useRep } from './common';
import { niceStep } from './hsdGrid';
import { normalPdf } from './statMath';

const num = (x: number) => formatNumber(Number(x.toFixed(2)));
const TOP = 78;

export function CltHistogram({ spec, calc }: { spec: HistogramSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const clt = spec.clt!;
  const get = (v: number | string) => (typeof v === 'number' ? v : rep.shown(v));
  const known = [clt.mean, clt.n, clt.samples].every((v) => typeof v === 'number' || rep.known(v));
  const [mu, n, m] = [get(clt.mean), Math.round(get(clt.n)), Math.round(get(clt.samples))];
  const model = useMemo(() => cltModel(mu, n, m, clt.seed), [mu, n, m, clt.seed]);
  const lines: string[] = [];
  if (model.problem) lines.push(model.problem);
  else
    lines.push(
      `Population: wait times skewed right, mean μ = ${num(mu)}, σ = ${num(mu)}`,
      `${formatNumber(m)} samples of n = ${n}: their means pile up around μ, spread σ/√n = ${num(mu)} ÷ √${n} = ${num(model.se)}`,
      `The simulated means average ${num(model.meanOfMeans)}, spread ${num(model.sdOfMeans)}; ${n >= 30 ? 'n ≥ 30, so close to the normal curve' : 'n < 30: still a little skewed, like the population'}`,
    );
  return (
    <View>
      <Canvas aspect={(w) => (TOP + w * 0.62 + 58) / w}>
        {({ w, h }) => {
          const L = 44;
          const R = 14;
          const xMax = model.xMax;
          const sx = (x: number) => L + (x / xMax) * (w - L - R);
          // The population on top: its density, shaded.
          const popH = TOP - 30;
          const popY = TOP - 8;
          const pop = Array.from({ length: 81 }, (_, i) => {
            const x = (xMax * i) / 80;
            const y = mu > 0 ? Math.exp(-x / mu) : 0;
            return `${i ? 'L' : 'M'} ${sx(x)} ${popY - y * popH}`;
          }).join(' ');
          // The sample means below.
          const T = TOP + 18;
          const B = h - 52;
          const peakCurve = m * model.width * normalPdf(mu, mu, model.se || 1);
          const top = Math.max(1, ...model.counts, peakCurve);
          const step = niceStep(top / 4);
          const yMax = Math.ceil(top / step) * step;
          const sy = (v: number) => B - (v / yMax) * (B - T);
          const curve = Array.from({ length: 161 }, (_, i) => {
            const x = (xMax * i) / 160;
            const y = m * model.width * normalPdf(x, mu, model.se || 1);
            return `${i ? 'L' : 'M'} ${sx(x)} ${sy(Math.min(y, yMax * 1.02))}`;
          }).join(' ');
          const xStep = niceStep(xMax / 6);
          const xTicks = Array.from({ length: Math.floor(xMax / xStep) + 1 }, (_, i) => i * xStep);
          const yTicks = Array.from({ length: Math.round(yMax / step) + 1 }, (_, i) => i * step);
          return (
            <Svg width={w} height={h}>
              <G opacity={known && !model.problem ? 1 : 0.35}>
                <Path
                  d={`${pop} L ${sx(xMax)} ${popY} L ${sx(0)} ${popY} Z`}
                  fill={c.chartSurface}
                  stroke={c.chartMuted}
                  strokeWidth={chart.strokeLight}
                />
                <Line
                  x1={sx(0)}
                  y1={popY}
                  x2={sx(xMax)}
                  y2={popY}
                  stroke={c.chartInk}
                  strokeWidth={1}
                />
                <ChartText x={w - R} y={16} textAnchor="end" fontWeight="600">
                  {`population: skewed right, μ = σ = ${num(mu)}`}
                </ChartText>
                {yTicks.map((t) => (
                  <G key={`y${t}`}>
                    <Line
                      x1={L}
                      y1={sy(t)}
                      x2={w - R}
                      y2={sy(t)}
                      stroke={c.chartGrid}
                      strokeWidth={1}
                    />
                    <ChartText x={L - 6} y={sy(t) + 4} textAnchor="end" fill={c.chartMuted}>
                      {formatNumber(t)}
                    </ChartText>
                  </G>
                ))}
                {model.counts.map((k, i) =>
                  k ? (
                    <Rect
                      key={`b${i}`}
                      x={sx(i * model.width)}
                      y={sy(k)}
                      width={Math.max(1, sx((i + 1) * model.width) - sx(i * model.width))}
                      height={B - sy(k)}
                      fill={c.chartHighlight}
                      fillOpacity={0.35}
                      stroke={c.chartHighlight}
                      strokeWidth={0.8}
                    />
                  ) : null,
                )}
                <Path d={curve} fill="none" stroke={c.normalReject} strokeWidth={chart.stroke} />
                <Line
                  x1={sx(mu)}
                  y1={popY - popH}
                  x2={sx(mu)}
                  y2={B}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dash}
                />
                <ChartText x={sx(mu) + 4} y={T + 2} fontWeight="700">
                  {`μ = ${num(mu)}`}
                </ChartText>
              </G>
              <Line
                x1={L}
                y1={B}
                x2={w - R}
                y2={B}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              {xTicks.map((t) => (
                <ChartText
                  key={`x${t}`}
                  x={sx(t)}
                  y={B + 15}
                  textAnchor="middle"
                  fill={c.chartMuted}
                >
                  {formatNumber(Number(t.toFixed(6)))}
                </ChartText>
              ))}
              <ChartText x={(L + w - R) / 2} y={B + 31} textAnchor="middle" fontWeight="600">
                {`sample mean x̄ (samples of n = ${n})`}
              </ChartText>
              <G>
                <Rect
                  x={L}
                  y={h - 12}
                  width={14}
                  height={10}
                  fill={c.chartHighlight}
                  fillOpacity={0.35}
                />
                <ChartText x={L + 19} y={h - 3}>
                  {`${formatNumber(m)} sample means`}
                </ChartText>
                <Line
                  x1={w / 2 + 20}
                  y1={h - 7}
                  x2={w / 2 + 38}
                  y2={h - 7}
                  stroke={c.normalReject}
                  strokeWidth={chart.stroke}
                />
                <ChartText x={w / 2 + 43} y={h - 3}>
                  normal, spread σ/√n
                </ChartText>
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
