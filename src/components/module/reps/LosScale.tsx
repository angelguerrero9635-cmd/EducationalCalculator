/**
 * HC175 `losScale` (LosScaleSpec in typesHe4m.ts): level of service by density. One mile of one
 * lane with the density's cars spaced evenly along it, painted; under it the density bar cut
 * into bands A–F (flat, each letter printed, the bounds under the cuts) with the segment's
 * density marked and its band outlined. No handles: the density is worked out.
 */
import type { ReactElement } from 'react';
import { View } from 'react-native';
import Svg, { Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { LosScaleSpec } from '@/data/modules/typesHe4m';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel } from './common';
import { LOS_BOUNDS, LOS_LETTERS, losOf } from './he4mMath';
import { n3, useFields } from './he4mKit';
import { TopLight, url, usePaintIds } from './paint';

/** The most cars drawn on the mile (past this the lane is drawn full and the caption says so). */
const MAX_CARS = 90;

export function LosScale({ spec, calc }: { spec: LosScaleSpec; calc: Calculator }) {
  const c = usePalette();
  const paint = usePaintIds('light');
  const { rep, get, say } = useFields(calc);
  const D = get(spec.density);
  const vp = get(spec.flow);
  const S = get(spec.speed);
  const bounds = spec.bounds ?? LOS_BOUNDS;
  const unit =
    spec.unit ?? (typeof spec.density === 'string' ? rep.unit(spec.density) : undefined) ?? '';
  const len = spec.length ?? '1 mi';
  const band = D === undefined ? undefined : losOf(D, bounds);
  const bands = [c.he4mLosA, c.he4mLosB, c.he4mLosC, c.he4mLosD, c.he4mLosE, c.he4mLosF];
  const last = bounds[bounds.length - 1]!;
  const top = Math.max(last + 10, D === undefined ? 0 : Math.ceil((D * 1.08) / 5) * 5);

  const lines: string[] = [];
  if (D === undefined) lines.push('Type the flow and the speed to place the segment on the bar.');
  else {
    const letter = LOS_LETTERS[band!]!;
    const lo = band! === 0 ? 0 : bounds[band! - 1]!;
    const range =
      band! === bounds.length
        ? `D > ${formatNumber(last)}`
        : `${formatNumber(lo)} < D ≤ ${formatNumber(bounds[band!]!)}`;
    const head =
      vp !== undefined && S !== undefined
        ? `D = v_p ÷ S = ${say(spec.flow, vp)} ÷ ${say(spec.speed, S)} = ${say(spec.density, D, true)}`
        : `D = ${say(spec.density, D, true)}`;
    lines.push(`${head}: LOS ${letter} (${range}).`);
    lines.push(
      Math.round(D) > MAX_CARS
        ? `More than ${MAX_CARS} cars in ${len} of lane: the lane is drawn full.`
        : len !== '1 mi'
          ? `That is about ${formatNumber(Math.round(D))} cars in ${len} of one lane.`
          : `That is about ${formatNumber(Math.round(D))} cars in ${len} of one lane, one every ${n3(5280 / Math.max(D, 1e-9))} ft if the mile is 5280 ft.`,
    );
    if (band! === bounds.length)
      lines.push('Past E the flow breaks down: demand is over capacity.');
  }

  return (
    <View>
      <Canvas aspect={(w) => 196 / w}>
        {({ w, h }) => {
          const L = 14;
          const R = 14;
          const sx = (d: number) => L + (Math.min(d, top) / top) * (w - L - R);
          // The lane: one mile of road, cars evenly spaced.
          const roadY = 26;
          const roadH = 30;
          const cars: ReactElement[] = [];
          if (D !== undefined && D > 0) {
            const n = Math.min(MAX_CARS, Math.max(1, Math.round(D)));
            const gap = (w - L - R) / n;
            const carL = Math.min(18, Math.max(3, gap * 0.62));
            for (let i = 0; i < n; i++) {
              const x = L + gap * (i + 0.5) - carL / 2;
              cars.push(
                <G key={`car${i}`}>
                  <Rect
                    x={x}
                    y={roadY + 9}
                    width={carL}
                    height={12}
                    rx={Math.min(3, carL / 3)}
                    fill={c.he4mCar}
                  />
                  {carL >= 8 ? (
                    <Rect
                      x={x + carL * 0.55}
                      y={roadY + 11}
                      width={carL * 0.22}
                      height={8}
                      rx={1}
                      fill={c.he4mCarGlass}
                    />
                  ) : null}
                  <Rect
                    x={x}
                    y={roadY + 9}
                    width={carL}
                    height={12}
                    rx={Math.min(3, carL / 3)}
                    fill={url(paint.light)}
                  />
                </G>,
              );
            }
          }
          const barY = 108;
          const barH = 34;
          const edges = [0, ...bounds, top];
          return (
            <Svg width={w} height={h}>
              <Defs>
                <TopLight id={paint.light} />
              </Defs>
              <ChartText x={L} y={16} fill={c.chartMuted}>
                {`${len} of one lane, traffic to the right`}
              </ChartText>
              <Rect x={L} y={roadY} width={w - L - R} height={roadH} fill={c.soilAsphalt} />
              <Line
                x1={L}
                x2={w - R}
                y1={roadY + 2}
                y2={roadY + 2}
                stroke={c.he4mLaneLine}
                strokeWidth={1.5}
              />
              <Line
                x1={L}
                x2={w - R}
                y1={roadY + roadH - 2}
                y2={roadY + roadH - 2}
                stroke={c.he4mLaneLine}
                strokeWidth={1.5}
                strokeDasharray="10 8"
              />
              {cars}
              <Path
                d={`M ${w - R - 12} ${roadY + roadH + 8} L ${w - R} ${roadY + roadH + 12} L ${w - R - 12} ${roadY + roadH + 16}`}
                fill="none"
                stroke={c.chartMuted}
                strokeWidth={1.5}
              />
              <Line
                x1={w - R - 40}
                x2={w - R}
                y1={roadY + roadH + 12}
                y2={roadY + roadH + 12}
                stroke={c.chartMuted}
                strokeWidth={1.5}
              />
              {/* The bar: bands A–F with their letters, the bounds under the cuts. */}
              {LOS_LETTERS.map((letter, i) => {
                const x0 = sx(edges[i]!);
                const x1 = sx(edges[i + 1]!);
                return (
                  <G key={letter}>
                    <Rect
                      x={x0}
                      y={barY}
                      width={Math.max(0, x1 - x0)}
                      height={barH}
                      fill={bands[i]}
                      opacity={band === undefined || band === i ? 1 : 0.55}
                    />
                    <ChartText
                      x={(x0 + x1) / 2}
                      y={barY + barH / 2 + 6}
                      textAnchor="middle"
                      fontWeight="700"
                      fontSize={chart.emphasis + 2}
                    >
                      {letter}
                    </ChartText>
                  </G>
                );
              })}
              <Rect
                x={L}
                y={barY}
                width={w - L - R}
                height={barH}
                fill="none"
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              {[0, ...bounds].map((b) => (
                <G key={`b${b}`}>
                  <Line
                    x1={sx(b)}
                    x2={sx(b)}
                    y1={barY}
                    y2={barY + barH + 5}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                  <ChartText
                    {...fitLabel(sx(b), formatNumber(b), chart.label, w)}
                    y={barY + barH + 18}
                    fill={c.chartMuted}
                  >
                    {formatNumber(b)}
                  </ChartText>
                </G>
              ))}
              <ChartText
                {...fitLabel((L + w - R) / 2, `Density D (${unit})`, chart.label, w)}
                y={barY + barH + 36}
                fill={c.chartMuted}
              >
                {`Density D (${unit})`}
              </ChartText>
              {/* The segment: its band outlined, its density marked. */}
              {D !== undefined && band !== undefined ? (
                <G>
                  <Rect
                    x={sx(edges[band]!)}
                    y={barY}
                    width={sx(edges[band + 1]!) - sx(edges[band]!)}
                    height={barH}
                    fill="none"
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeHeavy}
                  />
                  {/* Ticks into the bar's edges, clear of the letter in the middle. */}
                  <Line
                    x1={sx(D)}
                    x2={sx(D)}
                    y1={barY - 6}
                    y2={barY + 7}
                    stroke={c.he4mLosMark}
                    strokeWidth={chart.strokeHeavy}
                  />
                  <Line
                    x1={sx(D)}
                    x2={sx(D)}
                    y1={barY + barH - 7}
                    y2={barY + barH}
                    stroke={c.he4mLosMark}
                    strokeWidth={chart.strokeHeavy}
                  />
                  <Path
                    d={`M ${sx(D) - 6} ${barY - 14} L ${sx(D) + 6} ${barY - 14} L ${sx(D)} ${barY - 5} Z`}
                    fill={c.he4mLosMark}
                  />
                  <ChartText
                    {...fitLabel(sx(D), `D = ${say(spec.density, D)}`, chart.label, w)}
                    y={barY - 19}
                    fontWeight="700"
                    fill={c.he4mLosMark}
                  >
                    {`D = ${say(spec.density, D)}`}
                  </ChartText>
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
