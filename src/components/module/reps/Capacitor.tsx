import { View } from 'react-native';
import Svg, { Defs, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { CapacitorSpec } from '@/data/modules/typesHs3a';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { num } from './CircularSatellite';
import { useReader } from './hs3aKit';
import { capacitorOf, plateCapacitance } from './hs3aMath';
import { SubLabel, zeroWindow } from './hskKit';
import { Glass, Sheen, url, usePaintIds } from './paint';

const SIGNS = 7;
const LINES = 6;

/**
 * A parallel-plate capacitor on a battery (H107): +Q on the plate joined to the battery's +
 * side and −Q on the other, the even field between them, an insulating slab of κ filling the
 * gap when κ > 1 (its faces charged the other way), and below it the Q–V line Q = CV, the
 * triangle under it the stored energy U = ½QV = ½CV². Not to scale.
 */
export function Capacitor({ spec, calc }: { spec: CapacitorSpec; calc: Calculator }) {
  const c = usePalette();
  const { v, all, text, unit } = useReader(calc);
  const ids = usePaintIds('plate', 'slab');
  const farads = spec.farads ?? 1;
  const V = Math.max(0, v(spec.voltage, 1));
  const kappa = Math.max(1, v(spec.dielectric, 1));
  const A = spec.area === undefined ? undefined : v(spec.area);
  const d = spec.gap === undefined ? undefined : v(spec.gap);
  const fromPlates =
    A !== undefined && d !== undefined
      ? plateCapacitance(kappa, A, d * (spec.meters ?? 1), farads)
      : undefined;
  const C = Math.max(0, spec.capacitance !== undefined ? v(spec.capacitance) : (fromPlates ?? 1));
  const { Q, U } = capacitorOf(C, V, farads);
  const [uC, uQ] = [unit(spec.capacitance, 'F'), unit(spec.charge, 'C')];
  const uU = unit(spec.energy, 'J');

  return (
    <View>
      <Canvas aspect={(W) => 330 / W}>
        {({ w, h }) => {
          const [xl, xr] = [w * 0.44, w * 0.78];
          const [top, bottom] = [40, 160];
          const skew = 14;
          const ys = Array.from(
            { length: LINES },
            (_, i) => top + 16 + (i * (bottom - top - 32)) / (LINES - 1),
          );
          const signY = (i: number) => top + 12 + (i * (bottom - top - 24)) / (SIGNS - 1);
          const plate = (x: number) =>
            `${x - 4},${top + skew} ${x + 4},${top} ${x + 4},${bottom - skew} ${x - 4},${bottom}`;
          const bat = { x: w * 0.12, y: (top + bottom) / 2 };
          const g = { x0: 52, x1: w - 20, y0: 222, y1: h - 36 };
          const wv = zeroWindow(V, 4);
          const wq = zeroWindow(Q, 4);
          const GX = (x: number) => g.x0 + ((g.x1 - g.x0) * x) / wv.hi;
          const GY = (q: number) => g.y1 - ((g.y1 - g.y0) * q) / wq.hi;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Sheen id={ids.plate} />
                <Glass id={ids.slab} />
              </Defs>
              <G
                opacity={
                  all(spec.voltage, spec.capacitance, spec.dielectric, spec.area, spec.gap)
                    ? 1
                    : 0.45
                }
              >
                {/* The battery and its wires to the plates. */}
                <Path
                  d={`M ${bat.x} ${bat.y - 12} L ${bat.x} ${16} L ${xl} ${16} L ${xl} ${top + 4}`}
                  stroke={c.copper}
                  strokeWidth={2.5}
                  fill="none"
                />
                <Path
                  d={`M ${bat.x} ${bat.y + 12} L ${bat.x} ${bottom + 24} L ${xr} ${bottom + 24} L ${xr} ${bottom - 4}`}
                  stroke={c.copper}
                  strokeWidth={2.5}
                  fill="none"
                />
                <Line
                  x1={bat.x - 18}
                  y1={bat.y - 12}
                  x2={bat.x + 18}
                  y2={bat.y - 12}
                  stroke={c.chartInk}
                  strokeWidth={3}
                />
                <Line
                  x1={bat.x - 9}
                  y1={bat.y + 12}
                  x2={bat.x + 9}
                  y2={bat.y + 12}
                  stroke={c.chartInk}
                  strokeWidth={5}
                />
                <ChartText
                  x={bat.x + 22}
                  y={bat.y - 14}
                  fontSize={chart.emphasis}
                  fontWeight="800"
                  fill={c.physPlus}
                >
                  +
                </ChartText>
                <SubLabel
                  x={bat.x - 22}
                  y={bat.y + 5}
                  text={`V = ${text(spec.voltage, V, 'V')}`}
                  anchor="start"
                  w={w}
                />
                {/* The slab of insulator, when there is one, its faces charged the other way. */}
                {kappa > 1 + 1e-9 ? (
                  <G>
                    <Rect
                      x={xl + 6}
                      y={top + 6}
                      width={xr - xl - 12}
                      height={bottom - top - 12}
                      fill={c.plastic}
                    />
                    <Rect
                      x={xl + 6}
                      y={top + 6}
                      width={xr - xl - 12}
                      height={bottom - top - 12}
                      fill={url(ids.slab)}
                      stroke={c.glassEdge}
                    />
                    {[0, 2, 4, 6].map((i) => (
                      <G key={i}>
                        <ChartText
                          x={xl + 14}
                          y={signY(i) + 4}
                          textAnchor="middle"
                          fontSize={chart.label}
                          fontWeight="700"
                          fill={c.physMinus}
                        >
                          −
                        </ChartText>
                        <ChartText
                          x={xr - 14}
                          y={signY(i) + 4}
                          textAnchor="middle"
                          fontSize={chart.label}
                          fontWeight="700"
                          fill={c.physPlus}
                        >
                          +
                        </ChartText>
                      </G>
                    ))}
                  </G>
                ) : null}
                {/* The field: even lines from + to −. */}
                {ys.map((y) => (
                  <G key={y}>
                    <Line
                      x1={xl + 22}
                      y1={y}
                      x2={xr - 22}
                      y2={y}
                      stroke={c.physField}
                      strokeWidth={1.4}
                    />
                    <Path d={`M ${(xl + xr) / 2 + 6} ${y} l -8 -4 l 0 8 Z`} fill={c.physField} />
                  </G>
                ))}
                {/* The plates and their charge. */}
                {[xl, xr].map((x) => (
                  <G key={x}>
                    <Polygon points={plate(x)} fill={c.metal} stroke={c.metalDark} />
                    <Polygon points={plate(x)} fill={url(ids.plate)} />
                  </G>
                ))}
                {Array.from({ length: SIGNS }, (_, i) => (
                  <G key={i}>
                    <ChartText
                      x={xl - 12}
                      y={signY(i) + 5}
                      textAnchor="middle"
                      fontSize={chart.emphasis}
                      fontWeight="800"
                      fill={c.physPlus}
                    >
                      +
                    </ChartText>
                    <ChartText
                      x={xr + 12}
                      y={signY(i) + 5}
                      textAnchor="middle"
                      fontSize={chart.emphasis}
                      fontWeight="800"
                      fill={c.physMinus}
                    >
                      −
                    </ChartText>
                  </G>
                ))}
                <SubLabel
                  x={(xl + xr) / 2}
                  y={top - 8}
                  text={
                    A !== undefined
                      ? `A = ${text(spec.area, A, 'm²')}`
                      : `C = ${text(spec.capacitance, C, uC)}`
                  }
                  w={w}
                />
                {kappa > 1 + 1e-9 ? (
                  <SubLabel
                    x={(xl + xr) / 2}
                    y={bottom - 10}
                    text={`κ = ${text(spec.dielectric, kappa)}`}
                    size={chart.label}
                    w={w}
                  />
                ) : null}
                {d !== undefined ? (
                  <G>
                    <Line x1={xl} y1={bottom + 10} x2={xr} y2={bottom + 10} stroke={c.chartMuted} />
                    <SubLabel
                      x={(xl + xr) / 2}
                      y={bottom + 14}
                      text={`d = ${text(spec.gap, d, 'm')}`}
                      size={chart.label}
                      w={w}
                    />
                  </G>
                ) : null}
                <SubLabel
                  x={xl - 14}
                  y={bottom + 44}
                  text={`+Q, −Q: Q = ${text(spec.charge, Q, uQ)}`}
                  anchor="start"
                  w={w}
                />
                {/* The Q–V line; the triangle under it is the energy stored. */}
                <Path
                  d={`M ${GX(0)} ${GY(0)} L ${GX(V)} ${GY(Q)} L ${GX(V)} ${GY(0)} Z`}
                  fill={c.physWork}
                  fillOpacity={0.3}
                />
                <Line x1={g.x0} y1={g.y1} x2={g.x1} y2={g.y1} stroke={c.chartInk} />
                <Line x1={g.x0} y1={g.y0} x2={g.x0} y2={g.y1} stroke={c.chartInk} />
                <Line
                  x1={GX(0)}
                  y1={GY(0)}
                  x2={GX(V)}
                  y2={GY(Q)}
                  stroke={c.chartHighlight}
                  strokeWidth={2.5}
                />
                <ChartText x={4} y={g.y0 - 6} fontSize={chart.label}>
                  {`Q (${uQ})`}
                </ChartText>
                <ChartText x={g.x0 + 4} y={g.y1 + 18} fontSize={chart.label} fill={c.chartMuted}>
                  V (V)
                </ChartText>
                <ChartText
                  x={g.x0 - 4}
                  y={GY(Q) + 4}
                  textAnchor="end"
                  fontSize={chart.value}
                  fill={c.chartMuted}
                >
                  {num(Q)}
                </ChartText>
                <Line
                  x1={g.x0}
                  y1={GY(Q)}
                  x2={GX(V)}
                  y2={GY(Q)}
                  stroke={c.chartGrid}
                  strokeDasharray="3 3"
                />
                <ChartText
                  x={GX(V)}
                  y={g.y1 + 18}
                  textAnchor="middle"
                  fontSize={chart.value}
                  fill={c.chartMuted}
                >
                  {num(V)}
                </ChartText>
                <SubLabel
                  x={GX(V * 0.62)}
                  y={GY(Q * 0.18)}
                  text={`U = ½CV² = ${text(spec.energy, U, uU)}`}
                  color={c.physWork}
                  w={w}
                />
                <SubLabel
                  x={GX(V * 0.4) - 8}
                  y={GY(Q * 0.4) - 8}
                  text={`slope C = ${text(spec.capacitance, C, uC)}`}
                  anchor="end"
                  color={c.chartHighlight}
                  size={chart.label}
                  w={w}
                />
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{captionLines().join(' · ')}</Caption>
    </View>
  );

  function captionLines(): string[] {
    const out: string[] = [];
    if (fromPlates !== undefined)
      out.push(
        `C = κε₀A/d = ${num(kappa)} × 8.85 × 10⁻¹² × ${num(A!)}/${num(d! * (spec.meters ?? 1))} = ${num(fromPlates)} ${uC}`,
      );
    out.push(`Q = CV = ${num(C)} × ${num(V)} = ${num(Q)} ${uQ}`);
    out.push(`U = ½CV² = ½ × ${num(C * farads)} F × ${num(V)}² = ${num(U)} J`);
    out.push(
      kappa > 1 + 1e-9
        ? 'The slab’s faces take charge the other way: κ times the charge at the same V.'
        : 'Twice the voltage: twice the charge and four times the energy.',
    );
    return out;
  }
}
