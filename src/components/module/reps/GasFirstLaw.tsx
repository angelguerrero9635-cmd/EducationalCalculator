import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { GasPistonSpec } from '@/data/modules/typesHsj';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { gasSpots, trailLength } from './gasModel';
import { sig, SubLabel } from './hskKit';
import { Ball, Glass, Metal, Sheen, url, usePaintIds } from './paint';

/** A signed number in brackets for substituting: (−200). */
const par = (s: string) => (s.startsWith('−') ? `(${s})` : s);

/** How far the piston is drawn up (or down) when the gas does work (or has work done on it). */
const SHIFT = 22;

/**
 * The first law of thermodynamics on the gas piston (H102, `gasPiston` with `energy`): heat Q
 * flows into the gas (out when negative) as a band as wide as its size, the gas pushes the
 * piston up doing work W (pushed down when negative), and the change in internal energy
 * ΔU = Q − W shows in a small waterfall chart: Q up, W taken off, ΔU what is left. The
 * particles' trails grow when ΔU > 0 (the gas warms) and shrink when ΔU < 0.
 */
export function GasFirstLaw({ spec, calc }: { spec: GasPistonSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('glass', 'sheen', 'metal', 'ball');
  const e = spec.energy!;
  // In formula units (J), whatever units the boxes show.
  const read = (x: number | string) =>
    typeof x === 'number'
      ? { value: x, known: true, unit: 'J' }
      : { value: rep.val(x), known: rep.known(x), unit: rep.variable(x).unit ?? 'J' };
  const Q = read(e.heat);
  const W = read(e.work);
  const dU = Q.value - W.value;
  const unit = Q.unit;
  const all = Q.known && W.known;
  const big = Math.max(1e-12, Math.abs(Q.value), Math.abs(W.value), Math.abs(dU));
  const band = (x: number) => (Math.abs(x) < 1e-12 ? 0 : 5 + (26 * Math.abs(x)) / big);
  const spots = gasSpots(16, 29);
  const trail = trailLength(300 * (dU > 1e-12 ? 1.6 : dU < -1e-12 ? 0.45 : 1));

  return (
    <View>
      <Canvas aspect={0.86}>
        {({ w, h }) => {
          // The cylinder, left.
          const cw = Math.min(84, w * 0.24);
          const cx = w * 0.3;
          const [left, right] = [cx - cw / 2, cx + cw / 2];
          const bottom = h - 58;
          const top = 70;
          const rest = bottom - (bottom - top) * 0.5;
          const shift = W.value > 1e-12 ? -SHIFT : W.value < -1e-12 ? SHIFT : 0;
          const py = rest + shift;
          // Heat: a band from the left into the gas near the bottom (out to the left if Q < 0).
          const qb = band(Q.value);
          const qy = bottom - 26;
          const qIn = Q.value >= 0;
          const heatPath = qIn
            ? `M 6 ${qy - qb / 2} L ${left - 14} ${qy - qb / 2} L ${left - 14} ${qy - qb / 2 - 6} L ${left - 1} ${qy} L ${left - 14} ${qy + qb / 2 + 6} L ${left - 14} ${qy + qb / 2} L 6 ${qy + qb / 2} Z`
            : `M ${left - 2} ${qy - qb / 2} L 20 ${qy - qb / 2} L 20 ${qy - qb / 2 - 6} L 6 ${qy} L 20 ${qy + qb / 2 + 6} L 20 ${qy + qb / 2} L ${left - 2} ${qy + qb / 2} Z`;
          // Work: a band up from the piston rod (down onto it if W < 0).
          const wb = band(W.value);
          const wTop = 12;
          const wOut = W.value >= 0;
          const workPath = wOut
            ? `M ${cx - wb / 2} ${py - 30} L ${cx - wb / 2} ${wTop + 14} L ${cx - wb / 2 - 6} ${wTop + 14} L ${cx} ${wTop} L ${cx + wb / 2 + 6} ${wTop + 14} L ${cx + wb / 2} ${wTop + 14} L ${cx + wb / 2} ${py - 30} Z`
            : `M ${cx - wb / 2} ${wTop} L ${cx - wb / 2} ${py - 44} L ${cx - wb / 2 - 6} ${py - 44} L ${cx} ${py - 30} L ${cx + wb / 2 + 6} ${py - 44} L ${cx + wb / 2} ${py - 44} L ${cx + wb / 2} ${wTop} Z`;
          // The waterfall, right: Q, then W taken off, leaving ΔU.
          const chartL = w * 0.6;
          const colW = Math.min(30, (w - chartL - 16) / 4);
          const gap = colW * 0.45;
          const cols = [chartL + 8, chartL + 8 + colW + gap, chartL + 8 + 2 * (colW + gap)];
          const lo = Math.min(0, Q.value, dU);
          const hi = Math.max(0, Q.value, dU);
          const [yTop, yBot] = [36, h - 58];
          const sy = (v: number) => yTop + ((hi - v) / (hi - lo || 1)) * (yBot - yTop);
          const bars = [
            { a: 0, b: Q.value, color: qIn ? c.physHot : c.physCold, name: 'Q', v: Q.value },
            { a: Q.value, b: dU, color: c.physWork, name: '−W', v: -W.value },
            { a: 0, b: dU, color: c.chartHighlight, name: 'ΔU', v: dU },
          ];
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Glass id={ids.glass} />
                <Sheen id={ids.sheen} />
                <Metal id={ids.metal} light={c.metal} dark={c.metalDark} />
                <Ball id={ids.ball} color={c.gasParticle} />
              </Defs>
              <G opacity={all ? 1 : 0.45}>
                {/* Heat and work as bands as wide as their sizes. */}
                {qb > 0 ? (
                  <Path d={heatPath} fill={qIn ? c.physHot : c.physCold} opacity={0.8} />
                ) : null}
                <SubLabel
                  x={8}
                  y={qy - qb / 2 - 16}
                  text={`Q = ${sig(Q.value)} ${unit} ${qIn ? 'in' : 'out'}`}
                  anchor="start"
                  color={qIn ? c.physHot : c.physCold}
                  w={w}
                />
                {wb > 0 ? <Path d={workPath} fill={c.physWork} opacity={0.8} /> : null}
                <SubLabel
                  x={cx + Math.max(wb, 8) / 2 + 10}
                  y={wTop + 22}
                  text={
                    wOut
                      ? `W = ${sig(W.value)} ${unit} by the gas`
                      : `W = ${sig(W.value)} ${unit}: done on it`
                  }
                  anchor="start"
                  color={c.physWork}
                  w={chartL - 4}
                />
                {/* The cylinder and the gas. */}
                <Rect
                  x={left}
                  y={top - 16}
                  width={cw}
                  height={bottom - top + 16}
                  fill={url(ids.glass)}
                />
                {spots.map((p, i) => {
                  const x = left + 7 + p.x * (cw - 14);
                  const y = py + 7 + p.y * (bottom - py - 14);
                  const [dx, dy] = [Math.cos(p.dir), Math.sin(p.dir)];
                  return (
                    <G key={i}>
                      <Line
                        x1={Math.min(right - 3, Math.max(left + 3, x - dx * (trail + 4)))}
                        y1={Math.min(bottom - 3, Math.max(py + 2, y - dy * (trail + 4)))}
                        x2={x}
                        y2={y}
                        stroke={c.gasParticle}
                        strokeOpacity={0.45}
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                      <Circle cx={x} cy={y} r={3.6} fill={url(ids.ball)} />
                    </G>
                  );
                })}
                <Rect
                  x={left}
                  y={top - 16}
                  width={cw}
                  height={bottom - top + 16}
                  fill={url(ids.sheen)}
                />
                {shift !== 0 ? (
                  <Line
                    x1={left - 6}
                    y1={rest}
                    x2={right + 6}
                    y2={rest}
                    stroke={c.chartMuted}
                    strokeWidth={1.2}
                    strokeDasharray={chart.dashFine}
                  />
                ) : null}
                {/* The piston and its rod. */}
                <Rect x={cx - 4} y={py - 30} width={8} height={18} fill={url(ids.metal)} />
                <Rect
                  x={left + 1.5}
                  y={py - 13}
                  width={cw - 3}
                  height={13}
                  rx={2}
                  fill={url(ids.metal)}
                  stroke={c.metalDark}
                />
                <Rect
                  x={left - 2}
                  y={top - 16}
                  width={cw + 4}
                  height={bottom - top + 16}
                  fill="none"
                  stroke={c.glassEdge}
                  strokeWidth={1.5}
                />
                <Line x1={left - 10} y1={bottom} x2={right + 10} y2={bottom} stroke={c.chartInk} />
                <ChartText
                  x={cx}
                  y={bottom + 18}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fill={c.chartMuted}
                >
                  {dU > 1e-12
                    ? 'warmer: faster'
                    : dU < -1e-12
                      ? 'cooler: slower'
                      : 'same temperature'}
                </ChartText>
                {/* ΔU = Q − W as a waterfall. */}
                <Line
                  x1={chartL}
                  y1={sy(0)}
                  x2={w - 4}
                  y2={sy(0)}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                {bars.map((b, i) => {
                  const [y1, y2] = [sy(Math.max(b.a, b.b)), sy(Math.min(b.a, b.b))];
                  const up = b.b >= b.a;
                  return (
                    <G key={b.name}>
                      <Rect
                        x={cols[i]}
                        y={y1}
                        width={colW}
                        height={Math.max(1, y2 - y1)}
                        fill={b.color}
                        opacity={i === 2 ? 0.9 : 0.75}
                      />
                      {i < 2 ? (
                        <Line
                          x1={cols[i]! + colW}
                          y1={sy(b.b)}
                          x2={cols[i + 1]!}
                          y2={sy(b.b)}
                          stroke={c.chartMuted}
                          strokeDasharray={chart.dashFine}
                        />
                      ) : null}
                      <ChartText
                        x={cols[i]! + colW / 2}
                        y={up ? y1 - 5 : y2 + 15}
                        textAnchor="middle"
                        fontSize={chart.label}
                        fontWeight="700"
                        fill={b.color}
                      >
                        {sig(b.v)}
                      </ChartText>
                      <ChartText
                        x={cols[i]! + colW / 2}
                        y={h - 36}
                        textAnchor="middle"
                        fontSize={chart.label}
                        fontWeight="700"
                      >
                        {b.name}
                      </ChartText>
                    </G>
                  );
                })}
                <ChartText
                  x={(chartL + w) / 2}
                  y={h - 16}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fill={c.chartMuted}
                >
                  {`energy (${unit})`}
                </ChartText>
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{captionLines().join(' · ')}</Caption>
    </View>
  );

  function captionLines(): string[] {
    return [
      `First law: ΔU = Q − W = ${sig(Q.value)} − ${par(sig(W.value))} = ${sig(dU)} ${unit}`,
      'Q is + when heat flows into the gas; W is + when the gas does work by pushing the piston out.',
      dU > 1e-12
        ? 'More energy came in than went out as work: the internal energy rises and the gas warms.'
        : dU < -1e-12
          ? 'More energy left as work than came in as heat: the internal energy falls and the gas cools.'
          : 'The energy in equals the work out: the internal energy, and the temperature, stay the same.',
    ];
  }
}
