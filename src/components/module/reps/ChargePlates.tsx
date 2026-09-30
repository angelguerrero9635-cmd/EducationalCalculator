import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { ChargePlatesSpec } from '@/data/modules/typesHsk';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { num } from './CircularSatellite';
import { arrowHead } from './graphKit';
import { SubLabel, Vec } from './hskKit';
import { Ball, Sheen, url, usePaintIds } from './paint';

/** A signed number in brackets for substituting: (−1.6 × 10⁻¹⁹). */
const par = (s: string) => (s.startsWith('−') ? `(${s})` : s);

const LINES = 7;

/**
 * Two charged plates (H102, `charges` mode `plates`): metal plates d apart at a potential
 * difference V, the + plate on the left; the uniform field E = V/d as evenly spaced lines from
 * + to −, and a charge between them with its force F = qE: along the field for +, against it
 * for −. Not to scale across.
 */
export function ChargePlates({ spec, calc }: { spec: ChargePlatesSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('plate', 'plus', 'minus');
  const si = (x: number | string | undefined, d = 0) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) => typeof x !== 'string' || rep.known(x);
  const shown = (x: number | string, unit: string) =>
    typeof x === 'string' ? rep.value(x) : `${num(x)} ${unit}`;
  const V = si(spec.voltage);
  const d = Math.max(1e-12, si(spec.gap, 1));
  const E = V / d;
  const q = spec.charge === undefined ? undefined : si(spec.charge);
  const F = q === undefined ? undefined : q * E;
  const all = [spec.voltage, spec.gap, spec.charge].every(known);
  // The higher-potential plate on the left, so the field runs left to right.
  const flip = V < 0;

  return (
    <View>
      <Canvas aspect={0.74}>
        {({ w, h }) => {
          const [xl, xr] = [w * 0.2, w * 0.8];
          const [top, bottom] = [44, h - 58];
          const mid = (top + bottom) / 2;
          const ys = Array.from(
            { length: LINES },
            (_, i) => top + 10 + (i * (bottom - top - 20)) / (LINES - 1),
          );
          const dir = F === undefined ? 0 : Math.sign(F) * (flip ? -1 : 1);
          const sign = (left: boolean) => (left !== flip ? '+' : '−');
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Sheen id={ids.plate} />
                <Ball id={ids.plus} color={c.physPlus} />
                <Ball id={ids.minus} color={c.physMinus} />
              </Defs>
              <G opacity={all ? 1 : 0.45}>
                {/* The field: evenly spaced lines from + to −. */}
                {ys.map((y) => (
                  <G key={y}>
                    <Line
                      x1={xl + 6}
                      y1={y}
                      x2={xr - 6}
                      y2={y}
                      stroke={c.physField}
                      strokeWidth={1.4}
                    />
                    {Math.abs(E) > 0 ? (
                      <Path
                        d={arrowHead((xl + xr) / 2 + (flip ? -30 : 30), y, flip ? -1 : 1, 0, 7)}
                        fill={c.physField}
                      />
                    ) : null}
                  </G>
                ))}
                {/* The plates, their signs and potentials. */}
                {[xl, xr].map((x, i) => (
                  <G key={x}>
                    <Rect
                      x={x - 6}
                      y={top - 6}
                      width={12}
                      height={bottom - top + 12}
                      rx={2}
                      fill={c.metal}
                      stroke={c.metalDark}
                    />
                    <Rect
                      x={x - 6}
                      y={top - 6}
                      width={12}
                      height={bottom - top + 12}
                      rx={2}
                      fill={url(ids.plate)}
                    />
                    {ys
                      .filter((_, k) => k % 2 === 0)
                      .map((y) => (
                        <ChartText
                          key={y}
                          x={x + (i === 0 ? -16 : 16)}
                          y={y + 5}
                          textAnchor="middle"
                          fontSize={chart.emphasis}
                          fontWeight="800"
                          fill={sign(i === 0) === '+' ? c.physPlus : c.physMinus}
                        >
                          {sign(i === 0)}
                        </ChartText>
                      ))}
                    <SubLabel
                      x={x}
                      y={top - 14}
                      text={
                        (i === 0) !== flip ? `${shown(spec.voltage, 'V').replace('−', '')}` : '0 V'
                      }
                      w={w}
                    />
                  </G>
                ))}
                <SubLabel
                  x={w / 2}
                  y={top + 2}
                  text={`E = ${num(Math.abs(E))} V/m`}
                  color={c.forceNet}
                  w={w}
                />
                {/* The charge and its force. */}
                {q !== undefined && F !== undefined ? (
                  <G>
                    {dir !== 0 ? (
                      <Vec
                        x1={w / 2 + dir * 14}
                        y1={mid}
                        x2={w / 2 + dir * 74}
                        y2={mid}
                        color={c.forceApplied}
                        width={4}
                      />
                    ) : null}
                    <Circle
                      cx={w / 2}
                      cy={mid}
                      r={12}
                      fill={url(q >= 0 ? ids.plus : ids.minus)}
                      stroke={c.chartInk}
                    />
                    <ChartText
                      x={w / 2}
                      y={mid + 5}
                      textAnchor="middle"
                      fontSize={chart.emphasis}
                      fontWeight="800"
                      fill={c.onAccent}
                    >
                      {q >= 0 ? '+' : '−'}
                    </ChartText>
                    <SubLabel
                      x={w / 2}
                      y={mid + 34}
                      text={`F = ${num(F)} N`}
                      color={c.forceApplied}
                      w={w}
                    />
                  </G>
                ) : null}
                {/* The gap. */}
                <Line x1={xl} y1={bottom + 24} x2={xr} y2={bottom + 24} stroke={c.chartMuted} />
                <Line x1={xl} y1={bottom + 18} x2={xl} y2={bottom + 30} stroke={c.chartMuted} />
                <Line x1={xr} y1={bottom + 18} x2={xr} y2={bottom + 30} stroke={c.chartMuted} />
                <SubLabel
                  x={w / 2}
                  y={bottom + 28}
                  text={`d = ${shown(spec.gap ?? 1, 'm')}`}
                  w={w}
                />
                <ChartText
                  x={w - 6}
                  y={h - 6}
                  textAnchor="end"
                  fontSize={chart.label}
                  fill={c.chartMuted}
                >
                  not to scale
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
    const out = [`Field: E = V/d = ${num(V)}/${num(d)} = ${num(E)} V/m`];
    if (q !== undefined && F !== undefined)
      out.push(
        `Force: F = qE = ${par(num(q))} × ${num(E)} = ${num(F)} N`,
        q >= 0
          ? 'A + charge is pushed along the field, toward the − plate.'
          : 'A − charge is pushed against the field, toward the + plate.',
      );
    out.push(
      'Between the plates the field is the same everywhere, so the force is the same wherever the charge is.',
    );
    return out;
  }
}
