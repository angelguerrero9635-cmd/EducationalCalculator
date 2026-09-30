import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { MagnitudeSpec } from '@/data/modules/typesHs2f';
import { formatNumber, scientific, superscript } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import { traceAt } from './earthModel';
import { amplitudeRatio, energyRatio, MAGNITUDE_RANGE, magnitudeWindow } from './earthModelHs2f';

const BW = 360;
const BH = 350;
/** The traces and bars start here (the quake names sit to the left). */
const X0 = 72;
const X1 = 350;
/** The rows of the two traces, and the largest swing drawn. */
const ROWS = [58, 140];
const SWING = 34;
/** The bars on the magnitude scale, and its axis. */
const BARS = [236, 264];
const BAR_H = 18;
const AXIS = 290;

/** A shared quake trace (P, S, then surface waves), scaled so its biggest swing is 1. */
const ARRIVALS = { p: 8, s: 15, surface: 24 };
const T_END = 60;
const SAMPLES = 360;
const TRACE = Array.from({ length: SAMPLES + 1 }, (_, i) =>
  traceAt((i / SAMPLES) * T_END, ARRIVALS),
);
const PEAK = Math.max(...TRACE.map(Math.abs));

const round = (x: number, places = 2) => Number(x.toFixed(places));

/** A ratio to read: 3 significant figures, or scientific past a million. */
export const ratioText = (x: number) =>
  x >= 1e6 ? scientific(Number(x.toPrecision(3))) : formatNumber(Number(x.toPrecision(3)));

/** 10 to a power in superscript: 10², 10⁰·⁵, 10⁻¹. */
const SUP: Record<string, string> = { '−': '⁻', '.': '·' };
const tenTo = (p: number) =>
  `10${[...formatNumber(round(p, 2))].map((ch) => SUP[ch] ?? superscript(`^${ch}`)).join('')}`;

/** Two seismograms by magnitude on one scale, and the magnitudes on a log scale (MagnitudeSpec). */
export function EarthMagnitude({ spec, calc }: { spec: MagnitudeSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (x: number | string | undefined, d: number) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) =>
    x === undefined || typeof x === 'number' || rep.known(x);
  const clamp = (m: number) => Math.max(MAGNITUDE_RANGE.min, Math.min(MAGNITUDE_RANGE.max, m));
  const m = [clamp(num(spec.m1, 4)), clamp(num(spec.m2, 6))] as const;
  const on = [known(spec.m1), known(spec.m2)] as const;
  const both = on[0] && on[1];
  const dm = m[1] - m[0];
  const amp = spec.amplitude !== undefined ? num(spec.amplitude, 1) : amplitudeRatio(m[0], m[1]);
  const energy = spec.energy !== undefined ? num(spec.energy, 1) : energyRatio(m[0], m[1]);
  const win = useFrozen(magnitudeWindow(m[0], m[1]));
  const [lo, hi] = win.value;
  const start = useRef(0);
  const colors = [c.quakeP, c.quakeS];
  const name = (i: 0 | 1) => (on[i] ? `M ${formatNumber(round(m[i], 1))}` : 'M ?');
  const big = Math.max(m[0], m[1]);
  const X = (mag: number) => X0 + ((mag - lo) / (hi - lo)) * (X1 - X0);
  const ids = [spec.m1, spec.m2].map((x) => (typeof x === 'string' ? x : undefined));

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => {
          const k = w / BW;
          return (
            <>
              <Svg width={w} height={h}>
                <G transform={`scale(${k})`}>
                  <ChartText x={X0} y={16} fontSize={chart.label} fill={c.chartMuted}>
                    Both seismograms to one scale
                  </ChartText>
                  {([0, 1] as const).map((i) => {
                    // The same trace, its swing 10 times larger for each step of magnitude.
                    const size = SWING * 10 ** (m[i] - big);
                    const mid = ROWS[i]!;
                    const d = TRACE.map(
                      (y, j) =>
                        `${j ? 'L' : 'M'} ${(X0 + (j / SAMPLES) * (X1 - X0)).toFixed(1)} ${(mid - (y / PEAK) * size).toFixed(2)}`,
                    ).join(' ');
                    const tiny = size < 1.5;
                    return (
                      <G key={i} opacity={on[i] ? 1 : 0.4}>
                        <Line x1={X0} y1={mid} x2={X1} y2={mid} stroke={c.chartGrid} />
                        <Path d={d} stroke={colors[i]} strokeWidth={1.4} fill="none" />
                        <ChartText
                          x={8}
                          y={mid + 5}
                          fontSize={chart.value}
                          fontWeight="700"
                          fill={colors[i]}
                        >
                          {name(i)}
                        </ChartText>
                        {tiny ? (
                          <ChartText
                            x={X1}
                            y={mid - 8}
                            fontSize={chart.label}
                            textAnchor="end"
                            fill={c.chartMuted}
                          >
                            too small to see at this scale
                          </ChartText>
                        ) : null}
                      </G>
                    );
                  })}
                  {/* The magnitude scale: a bar to each quake, each whole step 10 times more. */}
                  <ChartText x={X0} y={192} fontSize={chart.label} fill={c.chartMuted}>
                    Each step of magnitude: 10 × the shaking
                  </ChartText>
                  {both && Math.abs(dm) > 1e-9 ? (
                    <G>
                      <Path
                        d={`M ${X(m[0])} 222 H ${X(m[1])} M ${X(m[0])} 216 V 228 M ${X(m[1])} 216 V 228`}
                        stroke={c.chartHighlight}
                        strokeWidth={chart.stroke}
                        fill="none"
                      />
                      <ChartText
                        x={Math.min(X1 - 92, Math.max(X0 + 92, (X(m[0]) + X(m[1])) / 2))}
                        y={212}
                        fontSize={chart.value}
                        fontWeight="700"
                        textAnchor="middle"
                        fill={c.chartHighlight}
                      >
                        {`${tenTo(dm)} = ${ratioText(amp)} × the shaking`}
                      </ChartText>
                    </G>
                  ) : null}
                  {([0, 1] as const).map((i) => (
                    <G key={`b${i}`} opacity={on[i] ? 1 : 0.4}>
                      <Rect
                        x={X0}
                        y={BARS[i]! - BAR_H / 2}
                        width={Math.max(0, X(m[i]) - X0)}
                        height={BAR_H}
                        rx={3}
                        fill={colors[i]}
                        fillOpacity={0.85}
                      />
                      <ChartText
                        x={8}
                        y={BARS[i]! + 5}
                        fontSize={chart.value}
                        fontWeight="700"
                        fill={colors[i]}
                      >
                        {name(i)}
                      </ChartText>
                    </G>
                  ))}
                  <Line x1={X0} y1={AXIS} x2={X1} y2={AXIS} stroke={c.chartInk} strokeWidth={1.5} />
                  {Array.from({ length: hi - lo + 1 }, (_, j) => lo + j).map((t) => (
                    <G key={`t${t}`}>
                      <Line
                        x1={X(t)}
                        y1={AXIS - 72}
                        x2={X(t)}
                        y2={AXIS}
                        stroke={c.chartGrid}
                        strokeDasharray={chart.dashFine}
                      />
                      <Line x1={X(t)} y1={AXIS} x2={X(t)} y2={AXIS + 5} stroke={c.chartInk} />
                      <ChartText
                        x={X(t)}
                        y={AXIS + 19}
                        fontSize={chart.label}
                        textAnchor="middle"
                        fill={c.chartMuted}
                      >
                        {formatNumber(t)}
                      </ChartText>
                    </G>
                  ))}
                  <ChartText
                    x={(X0 + X1) / 2}
                    y={AXIS + 42}
                    fontSize={chart.label}
                    textAnchor="middle"
                    fill={c.chartMuted}
                  >
                    Magnitude
                  </ChartText>
                </G>
              </Svg>
              {spec.fixed
                ? null
                : ([0, 1] as const).map((i) => {
                    const id = ids[i];
                    if (!id) return null;
                    return (
                      <DragHandle
                        key={id}
                        x={X(m[i]) * k}
                        y={BARS[i]! * k}
                        label={`magnitude ${i + 1}`}
                        onStart={() => {
                          start.current = m[i];
                          win.freeze();
                        }}
                        onEnd={win.release}
                        onMove={(dx) => {
                          const next = start.current + ((dx / k) * (hi - lo)) / (X1 - X0);
                          calc.set({ [id]: rep.snapTo(id, clamp(next)) }, rep.slide(id));
                        }}
                      />
                    );
                  })}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {both
          ? `M₂ − M₁ = ${formatNumber(round(m[1], 2))} − ${formatNumber(round(m[0], 2))} = ${formatNumber(round(dm, 2))}. The ground moves ${tenTo(dm)} = ${ratioText(amp)} times as far, and the quake releases ${tenTo(1.5 * dm)} = ${ratioText(energy)} times the energy.`
          : 'Type both magnitudes to compare the seismograms.'}
      </Caption>
    </View>
  );
}
