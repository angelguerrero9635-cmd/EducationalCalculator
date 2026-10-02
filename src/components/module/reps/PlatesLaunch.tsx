import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { ChargePlatesSpec } from '@/data/modules/typesHsk';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { num } from './CircularSatellite';
import { useReader } from './hs3aKit';
import { C_LIGHT, E_CHARGE, launchOf, M_ELECTRON, M_PROTON } from './hs3aMath';
import { sci, SubLabel, Vec, worked } from './hskKit';
import { Ball, Sheen, url, usePaintIds } from './paint';

/** Places drawn at equal times, from rest. */
const STROBE = 6;
const LINES = 5;

/**
 * `charges` plates option `launch` (H107): a charge let go at rest beside one plate (an
 * electron at the − plate, a + ion at the + plate) speeds across the potential difference ΔV:
 * its place at equal times (∝ t², it speeds up) with its velocity growing, K = qΔV in eV and
 * joules, and its speed on a bar up to a tenth of light's, where K = ½mv² stops being exact.
 */
export function PlatesLaunch({ spec, calc }: { spec: ChargePlatesSpec; calc: Calculator }) {
  const c = usePalette();
  const { v, all, text } = useReader(calc);
  const ids = usePaintIds('plate', 'plus', 'minus');
  const o = spec.launch!;
  const n = Math.max(0, v(o.charge, 1));
  const V = Math.max(0, v(spec.voltage, 1));
  const m = Math.max(1e-40, v(o.mass, M_ELECTRON));
  const { K, v: speed } = launchOf(n, V, m);
  const near = (a: number, b: number) => Math.abs(a - b) <= 1e-3 * b;
  const electron = near(m, M_ELECTRON);
  const name = electron ? 'electron' : near(m, M_PROTON) ? (n === 1 ? 'proton' : 'ion') : 'ion';
  // An electron is negative: it starts at the − plate and runs to the +; a + ion the other way.
  const leftSign = electron ? '−' : '+';
  const cap = C_LIGHT / 10;
  // A "?" box reads "?" on the picture too, not the example's number drawn faded behind it.
  const kOk = all(o.charge, spec.voltage);
  const vOk = kOk && all(o.mass);

  return (
    <View>
      <Canvas aspect={0.84}>
        {({ w, h }) => {
          const [xl, xr] = [w * 0.12, w * 0.88];
          const [top, bottom] = [40, 186];
          const mid = (top + bottom) / 2 + 8;
          const gap = xr - xl - 84;
          const ys = Array.from(
            { length: LINES },
            (_, i) => top + 12 + (i * (bottom - top - 24)) / (LINES - 1),
          );
          const bar = { x: 16, y: h - 50, w: w - 32, h: 14 };
          const frac = Math.min(1, speed / cap);
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Sheen id={ids.plate} />
                <Ball id={ids.plus} color={c.physPlus} />
                <Ball id={ids.minus} color={c.physMinus} />
              </Defs>
              <G opacity={all(o.charge, spec.voltage, o.mass) ? 1 : 0.45}>
                {/* The field, from + to −. */}
                {ys.map((y) => (
                  <G key={y}>
                    <Line
                      x1={xl + 8}
                      y1={y}
                      x2={xr - 8}
                      y2={y}
                      stroke={c.physField}
                      strokeWidth={1.2}
                      strokeOpacity={0.6}
                    />
                    <Path
                      d={`M ${(xl + xr) / 2 + (electron ? -4 : 4)} ${y} l ${electron ? 8 : -8} -4 l 0 8 Z`}
                      fill={c.physField}
                      fillOpacity={0.8}
                    />
                  </G>
                ))}
                {[xl, xr].map((x, i) => {
                  const sign = i === 0 ? leftSign : leftSign === '+' ? '−' : '+';
                  return (
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
                      <ChartText
                        x={x}
                        y={top - 12}
                        textAnchor="middle"
                        fontSize={chart.emphasis + 2}
                        fontWeight="800"
                        fill={sign === '+' ? c.physPlus : c.physMinus}
                      >
                        {sign}
                      </ChartText>
                    </G>
                  );
                })}
                <SubLabel
                  x={w / 2}
                  y={top - 12}
                  text={`ΔV = ${text(spec.voltage, V, 'V')}`}
                  w={w}
                />
                {/* Its place at equal times, from rest: ∝ t², so the gaps grow. */}
                {Array.from({ length: STROBE }, (_, i) => {
                  const s = i / (STROBE - 1);
                  const x = xl + 20 + gap * s * s;
                  const last = i === STROBE - 1;
                  return (
                    <G key={i} opacity={last ? 1 : 0.25 + 0.5 * s}>
                      {i > 0 ? (
                        <Vec
                          x1={x}
                          y1={mid - 22}
                          x2={x + 44 * s}
                          y2={mid - 22}
                          color={c.forceNet}
                          width={last ? 3 : 2}
                          head={last ? 10 : 7}
                        />
                      ) : null}
                      <Circle
                        cx={x}
                        cy={mid}
                        r={last ? 11 : 9}
                        fill={url(electron ? ids.minus : ids.plus)}
                        stroke={c.chartInk}
                      />
                      <ChartText
                        x={x}
                        y={mid + 5}
                        textAnchor="middle"
                        fontSize={chart.label}
                        fontWeight="800"
                        fill={c.onAccent}
                      >
                        {electron ? '−' : '+'}
                      </ChartText>
                    </G>
                  );
                })}
                <SubLabel
                  x={xl + 16}
                  y={mid + 32}
                  text={`at rest: ${name}`}
                  anchor="start"
                  size={chart.label}
                  w={w}
                />
                <SubLabel
                  x={xr - 14}
                  y={mid - 40}
                  text={`v = ${text(o.speed, speed, 'm/s')}`}
                  anchor="end"
                  color={c.forceNet}
                  w={w}
                />
                <SubLabel
                  x={w / 2}
                  y={bottom + 30}
                  text={`K = qΔV = ${text(o.energy, K, 'eV')} = ${kOk ? sci(K * E_CHARGE) : '?'} J`}
                  color={c.physWork}
                  w={w}
                />
                <SubLabel
                  x={w / 2}
                  y={bottom + 52}
                  text={`q = ${text(o.charge, n, 'e')}, m = ${text(o.mass, m, 'kg')}`}
                  size={chart.label}
                  bold={false}
                  w={w}
                />
                {/* Its speed against a tenth of light's. */}
                <Rect
                  x={bar.x}
                  y={bar.y}
                  width={bar.w}
                  height={bar.h}
                  fill="none"
                  stroke={c.chartMuted}
                />
                <Rect
                  x={bar.x}
                  y={bar.y}
                  width={bar.w * frac}
                  height={bar.h}
                  fill={c.forceNet}
                  fillOpacity={0.5}
                />
                <ChartText
                  x={bar.x}
                  y={bar.y + bar.h + 16}
                  fontSize={chart.label}
                  fill={c.chartMuted}
                >
                  0
                </ChartText>
                <ChartText
                  x={bar.x + bar.w}
                  y={bar.y + bar.h + 16}
                  textAnchor="end"
                  fontSize={chart.label}
                  fill={c.chartMuted}
                >
                  a tenth of light’s speed, 3 × 10⁷ m/s
                </ChartText>
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          ...worked(kOk, `K = qΔV = ${num(n)} × ${num(V)} = ${num(K)} eV = ${sci(K * E_CHARGE)} J`),
          ...worked(vOk, `v = √(2K/m) = √(2 × ${sci(K * E_CHARGE)}/${sci(m)}) = ${sci(speed)} m/s`),
          electron
            ? 'The electron is pulled from the − plate toward the +, speeding up all the way.'
            : 'The + charge is pushed from the + plate toward the −, speeding up all the way.',
        ].join(' · ')}
      </Caption>
    </View>
  );
}
