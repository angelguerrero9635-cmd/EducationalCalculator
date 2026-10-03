import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { OscillatorSpec } from '@/data/modules/typesHs3a';
import { oscillatorHe } from '@/data/modules/typesHe1h';
import { OscillatorHe } from './OscillatorHe';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { num } from './CircularSatellite';
import { springPath, useReader } from './hs3aKit';
import { springOf } from './hs3aMath';
import { SubLabel, Vec, worked, zeroWindow } from './hskKit';
import { Crate, TopLight, usePaintIds } from './paint';

type Swing = Extract<OscillatorSpec, { mode?: 'swing' }>;
type Hang = Extract<OscillatorSpec, { mode: 'hang' }>;

const BLOCK = 40;

/**
 * A mass on a spring (H107): sliding on a frictionless floor beside its x–t trace, the rest
 * line and ±A marked, the block at x and a faded one through the middle at v_max, and bars for
 * ½kx² and ½mv² that add to E = ½kA²; or hung from a beam, stretched x until kx holds up mg,
 * beside the F–x line whose triangle is U = ½kx².
 */
export function Oscillator({ spec, calc }: { spec: OscillatorSpec; calc: Calculator }) {
  if (spec.mode !== 'hang' && oscillatorHe(spec)) return <OscillatorHe spec={spec} calc={calc} />; // HC11
  return spec.mode === 'hang' ? (
    <Hanging spec={spec} calc={calc} />
  ) : (
    <Sliding spec={spec} calc={calc} />
  );
}

function Sliding({ spec, calc }: { spec: Swing; calc: Calculator }) {
  const c = usePalette();
  const { v, all, text, unit } = useReader(calc);
  const ids = usePaintIds('light');
  const m = Math.max(1e-12, v(spec.mass, 1));
  const k = Math.max(1e-12, v(spec.spring, 1));
  const A = Math.max(1e-12, v(spec.amplitude, 1));
  const x = Math.max(-A, Math.min(A, v(spec.position, A / 2)));
  const s = springOf(m, k, A, x);
  const [uX, uE] = [unit(spec.amplitude, 'm'), unit(spec.energy, 'J')];
  const uT = unit(spec.period, 's');
  // The first moment the block is at x, on its way back in from +A.
  const t1 = Math.acos(x / A) / s.w;

  return (
    <View>
      <Canvas aspect={(W) => 356 / W}>
        {({ w, h }) => {
          const floor = 100;
          const x0 = w * 0.52;
          const Apx = w * 0.3;
          const X = (p: number) => x0 + (Apx * p) / A;
          const g = { x0: 48, x1: w - 14, mid: 188, amp: 38 };
          const tMax = 2 * s.T;
          const TX = (t: number) => g.x0 + ((g.x1 - g.x0) * t) / tMax;
          const TY = (p: number) => g.mid - (g.amp * p) / A;
          const trace = Array.from({ length: 121 }, (_, i) => {
            const t = (tMax * i) / 120;
            return `${i ? 'L' : 'M'} ${TX(t)} ${TY(A * Math.cos(s.w * t))}`;
          }).join(' ');
          const bar = { x: 16, y: 286, w: w - 32, h: 20 };
          const split = bar.w * (s.E > 0 ? s.U / s.E : 0);
          return (
            <Svg width={w} height={h}>
              <Defs>
                <TopLight id={ids.light} />
              </Defs>
              <G opacity={all(spec.mass, spec.spring, spec.amplitude, spec.position) ? 1 : 0.45}>
                {/* Wall, floor, the rest line and ±A. */}
                <Rect x={4} y={floor - 70} width={10} height={70} fill={c.chartSurface} />
                <Line x1={14} y1={floor - 70} x2={14} y2={floor} stroke={c.chartInk} />
                <Line x1={4} y1={floor} x2={w - 4} y2={floor} stroke={c.chartInk} />
                {[
                  [-A, `−A`],
                  [0, 'x = 0'],
                  [A, `A = ${text(spec.amplitude, A, uX)}`],
                ].map(([p, label]) => (
                  <G key={label as string}>
                    <Line
                      x1={X(p as number)}
                      y1={floor - 64}
                      x2={X(p as number)}
                      y2={floor + 6}
                      stroke={c.chartMuted}
                      strokeDasharray="4 4"
                    />
                    <ChartText
                      x={X(p as number)}
                      y={floor + 20}
                      textAnchor="middle"
                      fontSize={chart.label}
                      fill={c.chartMuted}
                    >
                      {label as string}
                    </ChartText>
                  </G>
                ))}
                {/* Through the middle, fastest (faded), and now at x. */}
                <G opacity={0.3}>
                  <Crate x={x0 - BLOCK / 2} y={floor - BLOCK} size={BLOCK} lightId={ids.light} />
                </G>
                <Vec
                  x1={x0 - 34}
                  y1={floor - BLOCK - 12}
                  x2={x0 + 34}
                  y2={floor - BLOCK - 12}
                  color={c.chartSecond}
                  width={2.5}
                />
                <SubLabel
                  x={x0}
                  y={floor - BLOCK - 22}
                  text={`v_max = ${text(spec.top, s.top, 'm/s')}`}
                  color={c.chartSecond}
                  w={w}
                />
                <Path
                  d={springPath(14, floor - BLOCK / 2, X(x) - BLOCK / 2, floor - BLOCK / 2, 10, 7)}
                  stroke={c.physSpring}
                  strokeWidth={2.2}
                  fill="none"
                />
                <Crate x={X(x) - BLOCK / 2} y={floor - BLOCK} size={BLOCK} lightId={ids.light} />
                <SubLabel
                  x={X(x)}
                  y={floor - BLOCK / 2 + 5}
                  text={`${text(spec.mass, m, 'kg')}`}
                  size={chart.label}
                  w={w}
                />
                <SubLabel
                  x={16}
                  y={20}
                  text={`k = ${text(spec.spring, k, 'N/m')}`}
                  anchor="start"
                  w={w}
                />
                {/* The x–t trace over two periods. */}
                {[-A, 0, A].map((p) => (
                  <G key={p}>
                    <Line
                      x1={g.x0}
                      y1={TY(p)}
                      x2={g.x1}
                      y2={TY(p)}
                      stroke={p === 0 ? c.chartInk : c.chartGrid}
                      strokeDasharray={p === 0 ? undefined : '4 4'}
                    />
                    <ChartText
                      x={g.x0 - 4}
                      y={TY(p) + 4}
                      textAnchor="end"
                      fontSize={chart.value}
                      fill={c.chartMuted}
                    >
                      {p === 0 ? '0' : `${p > 0 ? '' : '−'}A`}
                    </ChartText>
                  </G>
                ))}
                <Line
                  x1={g.x0}
                  y1={g.mid - g.amp - 12}
                  x2={g.x0}
                  y2={g.mid + g.amp + 8}
                  stroke={c.chartInk}
                />
                <ChartText x={6} y={g.mid - g.amp - 16} fontSize={chart.label}>
                  {`x (${uX})`}
                </ChartText>
                <ChartText
                  x={g.x1}
                  y={g.mid + g.amp + 22}
                  textAnchor="end"
                  fontSize={chart.label}
                  fill={c.chartMuted}
                >
                  t (s)
                </ChartText>
                <Path d={trace} stroke={c.chartHighlight} strokeWidth={2.5} fill="none" />
                {/* One period, peak to peak. */}
                <Line x1={TX(0)} y1={TY(A) - 10} x2={TX(s.T)} y2={TY(A) - 10} stroke={c.chartInk} />
                <Line
                  x1={TX(s.T)}
                  y1={TY(A) - 16}
                  x2={TX(s.T)}
                  y2={TY(A) - 4}
                  stroke={c.chartInk}
                />
                <SubLabel
                  x={TX(s.T / 2)}
                  y={TY(A) - 16}
                  text={`T = ${text(spec.period, s.T, uT)}`}
                  w={w}
                />
                <Circle cx={TX(t1)} cy={TY(x)} r={5} fill={c.forceNet} />
                <Line
                  x1={TX(t1)}
                  y1={TY(x)}
                  x2={TX(t1)}
                  y2={g.mid}
                  stroke={c.forceNet}
                  strokeDasharray="3 3"
                />
                {/* Energy now: spring and motion, adding to E. */}
                <SubLabel
                  x={bar.x}
                  y={bar.y - 10}
                  text={`E = ½kA² = ${text(spec.energy, s.E, uE)}`}
                  anchor="start"
                  w={w}
                />
                <Rect
                  x={bar.x}
                  y={bar.y}
                  width={split}
                  height={bar.h}
                  fill={c.chartHighlight}
                  fillOpacity={0.55}
                />
                <Rect
                  x={bar.x + split}
                  y={bar.y}
                  width={bar.w - split}
                  height={bar.h}
                  fill={c.chartSecond}
                  fillOpacity={0.65}
                />
                <Rect
                  x={bar.x}
                  y={bar.y}
                  width={bar.w}
                  height={bar.h}
                  fill="none"
                  stroke={c.chartInk}
                />
                <SubLabel
                  x={bar.x}
                  y={bar.y + bar.h + 18}
                  text={`½kx² = ${all(spec.spring, spec.position) ? num(s.U) : '?'} ${uE}`}
                  anchor="start"
                  color={c.chartHighlight}
                  w={w}
                />
                <SubLabel
                  x={bar.x + bar.w}
                  y={bar.y + bar.h + 18}
                  text={`½mv² = ${all(spec.spring, spec.amplitude, spec.position) ? num(s.K) : '?'} ${uE}`}
                  anchor="end"
                  color={c.chartInk}
                  w={w}
                />
                <ChartText
                  x={bar.x}
                  y={bar.y + bar.h + 38}
                  fontSize={chart.label}
                  fill={c.chartMuted}
                >
                  {`at x = ${all(spec.position) ? num(x) : '?'} ${uX} (the dot on the trace)`}
                </ChartText>
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          // A "?" box is not worked with the example's numbers: the formula only.
          ...worked(
            all(spec.mass, spec.spring),
            `T = 2π√(m/k) = 2π × √(${num(m)}/${num(k)}) = ${num(s.T)} s`,
          ),
          ...worked(
            all(spec.mass, spec.spring, spec.amplitude),
            `v_max = Aω = ${num(A)} × ${num(s.w)} = ${num(s.top)} m/s`,
          ),
          'It stops at ±A and moves fastest through x = 0; a bigger A leaves T the same.',
        ].join(' · ')}
      </Caption>
    </View>
  );
}

function Hanging({ spec, calc }: { spec: Hang; calc: Calculator }) {
  const c = usePalette();
  const { v, all, text, unit } = useReader(calc);
  const ids = usePaintIds('light');
  const g = spec.g ?? 9.8;
  const m = Math.max(0, v(spec.mass, 1));
  const x = Math.max(1e-12, v(spec.stretch, 0.1));
  const F = m * g;
  const k = F / x;
  const U = 0.5 * k * x * x;
  const [uX, uF] = [unit(spec.stretch, 'm'), unit(spec.force, 'N')];
  const uU = unit(spec.energy, 'J');

  return (
    <View>
      <Canvas aspect={0.98}>
        {({ w, h }) => {
          const sx = w * 0.22;
          const top = 22;
          const rest = 70;
          const gr = { x0: w * 0.5, x1: w - 16, y0: 40, y1: h - 56 };
          const wx = zeroWindow(x, 4);
          const wf = zeroWindow(F, 4);
          const GX = (p: number) => gr.x0 + ((gr.x1 - gr.x0) * p) / wx.hi;
          const GY = (f: number) => gr.y1 - ((gr.y1 - gr.y0) * f) / wf.hi;
          // The stretch to the graph's x scale.
          const stretch = Math.max(8, GX(x) - gr.x0);
          const end = top + rest + stretch;
          const arrow = 48;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <TopLight id={ids.light} />
              </Defs>
              <G opacity={all(spec.mass, spec.stretch) ? 1 : 0.45}>
                <Rect x={sx - 60} y={8} width={120} height={top - 8} rx={2} fill={c.wood} />
                <Path
                  d={springPath(sx, top, sx, end, 12, 9)}
                  stroke={c.physSpring}
                  strokeWidth={2.2}
                  fill="none"
                />
                {/* Where the end hung before the mass went on, and the stretch x. */}
                <Line
                  x1={sx - 28}
                  y1={top + rest}
                  x2={sx + 40}
                  y2={top + rest}
                  stroke={c.chartMuted}
                  strokeDasharray="4 4"
                />
                <Line x1={sx + 34} y1={top + rest} x2={sx + 34} y2={end} stroke={c.chartInk} />
                <Line x1={sx + 28} y1={end} x2={sx + 40} y2={end} stroke={c.chartInk} />
                <SubLabel
                  x={sx + 40}
                  y={(top + rest + end) / 2 + 5}
                  text={`x = ${text(spec.stretch, x, uX)}`}
                  anchor="start"
                  w={w}
                />
                <Crate x={sx - BLOCK / 2} y={end} size={BLOCK} lightId={ids.light} />
                <SubLabel
                  x={sx}
                  y={end + BLOCK / 2 + 5}
                  text={text(spec.mass, m, 'kg')}
                  size={chart.label}
                  w={w}
                />
                {/* Balanced: the spring's pull kx up, the weight mg down, the same length
                    from the block's edges (kx started inside the block and read shorter). */}
                <Vec x1={sx - 30} y1={end} x2={sx - 30} y2={end - arrow} color={c.forceTension} />
                <SubLabel
                  // Over the arrow's tip: left of it there is no room for the value.
                  x={sx - 34}
                  y={end - arrow - 6}
                  text={`kx = ${text(spec.force, F, uF)}`}
                  anchor="middle"
                  color={c.forceTension}
                  w={w}
                />
                <Vec
                  x1={sx}
                  y1={end + BLOCK}
                  x2={sx}
                  y2={end + BLOCK + arrow}
                  color={c.forceWeight}
                />
                <SubLabel
                  x={sx + 8}
                  y={end + BLOCK + arrow - 4}
                  text={`mg = ${text(spec.force, F, uF)}`}
                  anchor="start"
                  color={c.forceWeight}
                  w={w}
                />
                {/* The F–x line, and the stored energy under it. */}
                <Path
                  d={`M ${GX(0)} ${GY(0)} L ${GX(x)} ${GY(F)} L ${GX(x)} ${GY(0)} Z`}
                  fill={c.physWork}
                  fillOpacity={0.3}
                />
                <Line x1={gr.x0} y1={gr.y1} x2={gr.x1} y2={gr.y1} stroke={c.chartInk} />
                <Line x1={gr.x0} y1={gr.y0} x2={gr.x0} y2={gr.y1} stroke={c.chartInk} />
                <Line
                  x1={GX(0)}
                  y1={GY(0)}
                  x2={GX(Math.min(wx.hi, (wf.hi / F) * x))}
                  y2={GY(Math.min(wf.hi, (wx.hi / x) * F))}
                  stroke={c.chartHighlight}
                  strokeWidth={2.5}
                />
                <Circle cx={GX(x)} cy={GY(F)} r={5} fill={c.forceNet} />
                <SubLabel
                  x={GX(x) - 6}
                  y={GY(F) - 10}
                  text={`(${all(spec.stretch) ? num(x) : '?'}, ${all(spec.mass) ? num(F) : '?'})`}
                  anchor="end"
                  size={chart.label}
                  w={w}
                />
                <SubLabel
                  x={GX(x * 0.66)}
                  y={GY(F * 0.16)}
                  text={`U = ${text(spec.energy, U, uU)}`}
                  color={c.physWork}
                  w={w}
                />
                <ChartText x={gr.x0} y={gr.y0 - 8} fontSize={chart.label}>
                  {`F (${uF})`}
                </ChartText>
                <ChartText
                  x={gr.x1}
                  y={gr.y1 + 18}
                  textAnchor="end"
                  fontSize={chart.label}
                  fill={c.chartMuted}
                >
                  {`x (${uX})`}
                </ChartText>
                {/* Inside the plot, in its empty top-left corner above the rising line. */}
                <SubLabel
                  x={gr.x0 + 6}
                  y={gr.y0 + 14}
                  text={`slope k = ${text(spec.spring, k, 'N/m')}`}
                  anchor="start"
                  color={c.chartHighlight}
                  w={w}
                />
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          ...worked(all(spec.mass), `F = mg = ${num(m)} × ${num(g)} = ${num(F)} N`),
          ...worked(all(spec.mass, spec.stretch), `k = F/x = ${num(F)}/${num(x)} = ${num(k)} N/m`),
          ...worked(
            all(spec.mass, spec.stretch),
            `U = ½kx² = ½ × ${num(k)} × ${num(x)}² = ${num(U)} J, the triangle under the line`,
          ),
        ].join(' · ')}
      </Caption>
    </View>
  );
}
