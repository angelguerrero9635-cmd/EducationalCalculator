import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { InductionSpec } from '@/data/modules/typesHsk';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, niceCeil, useFrozen, useRep } from './common';
import { arrowAt, pathOf, traceLine, type Pole } from './fieldLines';
import { arrowHead } from './graphKit';
import { RAD, sig, SubLabel, Vec, worked } from './hskKit';
import { MovingCharge } from './MovingCharge';
import { Sheen, TopLight, url, usePaintIds } from './paint';

const MAX_LOOPS = 20;

/**
 * Electromagnetism (H69): a magnet moving into a coil with a center-zero galvanometer
 * (emf = N ΔΦ/Δt), the force on a current in a magnetic field (F = BIL sin θ, right-hand
 * rule), or a transformer on an iron core (Vₛ/Vₚ = Nₛ/Nₚ).
 */
export function Induction({ spec, calc }: { spec: InductionSpec; calc: Calculator }) {
  switch (spec.mode) {
    case 'coil':
      return <CoilView spec={spec} calc={calc} />;
    case 'force':
      return <ForceView spec={spec} calc={calc} />;
    case 'transformer':
      return <TransformerView spec={spec} calc={calc} />;
    case 'charge':
      return <MovingCharge spec={spec} calc={calc} />;
  }
}

type Rep = ReturnType<typeof useRep>;
const num = (rep: Rep, x: number | string | undefined, d = 0) =>
  x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
const isKnown = (rep: Rep, x: number | string | undefined) => typeof x !== 'string' || rep.known(x);
/** A value's text, or "?" while a box it comes from is "?" (not the example's number). */
const say = (rep: Rep, xs: (number | string | undefined)[], value: number) =>
  xs.every((x) => isKnown(rep, x)) ? sig(value) : '?';

/** Loops of copper wire around a horizontal axis at y, spread from x0 to x1: one per turn. */
function Coil({
  x0,
  x1,
  y,
  r,
  n,
  color,
  back,
}: {
  x0: number;
  x1: number;
  y: number;
  r: number;
  n: number;
  color: string;
  back: string;
}) {
  const k = Math.min(MAX_LOOPS, Math.max(1, Math.round(n)));
  const xs = Array.from({ length: k }, (_, i) =>
    k === 1 ? (x0 + x1) / 2 : x0 + ((x1 - x0) * i) / (k - 1),
  );
  const rx = Math.max(2.5, Math.min(6, (x1 - x0) / Math.max(1, k) / 1.6));
  return (
    <G>
      {xs.map((x) => (
        <Path
          key={`b${x}`}
          d={`M ${x} ${y - r} A ${rx} ${r} 0 0 0 ${x} ${y + r}`}
          stroke={back}
          strokeWidth={2.5}
          fill="none"
        />
      ))}
      {xs.map((x) => (
        <Path
          key={`f${x}`}
          d={`M ${x} ${y - r} A ${rx} ${r} 0 0 1 ${x} ${y + r}`}
          stroke={color}
          strokeWidth={3}
          fill="none"
        />
      ))}
    </G>
  );
}

/** Loops around a vertical leg at x, from y0 to y1 (a transformer winding). */
function Winding({
  x,
  y0,
  y1,
  r,
  n,
  color,
  back,
}: {
  x: number;
  y0: number;
  y1: number;
  r: number;
  n: number;
  color: string;
  back: string;
}) {
  const k = Math.min(MAX_LOOPS, Math.max(1, Math.round(n)));
  const ys = Array.from({ length: k }, (_, i) =>
    k === 1 ? (y0 + y1) / 2 : y0 + ((y1 - y0) * i) / (k - 1),
  );
  const ry = Math.max(2.5, Math.min(5, (y1 - y0) / Math.max(1, k) / 1.6));
  return (
    <G>
      {ys.map((y) => (
        <Path
          key={`b${y}`}
          d={`M ${x - r} ${y} A ${r} ${ry} 0 0 0 ${x + r} ${y}`}
          stroke={back}
          strokeWidth={2.5}
          fill="none"
        />
      ))}
      {ys.map((y) => (
        <Path
          key={`f${y}`}
          d={`M ${x - r} ${y} A ${r} ${ry} 0 0 1 ${x + r} ${y}`}
          stroke={color}
          strokeWidth={3}
          fill="none"
        />
      ))}
    </G>
  );
}

function CoilView({
  spec,
  calc,
}: {
  spec: Extract<InductionSpec, { mode: 'coil' }>;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('light', 'dial');
  const N = Math.max(0, num(rep, spec.turns, 10));
  const dF = num(rep, spec.flux, 0.01);
  const dt = Math.max(1e-9, num(rep, spec.time, 0.1));
  const emf = (N * dF) / dt;
  const all = [spec.turns, spec.flux, spec.time].every((x) => isKnown(rep, x));
  const into = (spec.direction ?? 'in') === 'in';
  const scale = useFrozen(niceCeil(Math.max(Math.abs(emf), 1e-9) * 1.5));
  return (
    <View>
      <Canvas aspect={0.66}>
        {({ w, h }) => {
          const y = h * 0.36;
          const cx0 = w * 0.46;
          const cx1 = w - 24;
          const mx0 = 10;
          const mw = w * 0.3;
          const mh = 26;
          const poles: Pole[] = [
            { x: mx0 + mw - 4, y, q: 1 },
            { x: mx0 + 4, y, q: -1 },
          ];
          const box = { x0: 2, y0: 2, x1: w - 2, y1: h * 0.7 };
          const solid = { x0: mx0, y0: y - mh / 2, x1: mx0 + mw, y1: y + mh / 2 };
          const lines = [-50, -25, 25, 50].map((a) =>
            traceLine(
              poles,
              poles[0]!.x + 6 * Math.cos(a * RAD),
              poles[0]!.y + 6 * Math.sin(a * RAD),
              box,
              [solid],
              2,
              6,
            ),
          );
          const gx = w * 0.62;
          const gy = h * 0.86;
          const needle = Math.max(-1, Math.min(1, emf / scale.value)) * 60 * (into ? 1 : -1);
          return (
            <Svg width={w} height={h}>
              <Defs>
                <TopLight id={ids.light} />
                <Sheen id={ids.dial} />
              </Defs>
              <G opacity={all ? 1 : 0.4}>
                {lines.map((pts, i) => {
                  const at = arrowAt(pts, 0.5);
                  return (
                    <G key={i}>
                      <Path d={pathOf(pts)} stroke={c.physField} strokeWidth={1.3} fill="none" />
                      {at ? (
                        <Path
                          d={arrowHead(
                            at.x,
                            at.y,
                            Math.cos(at.angle * RAD),
                            Math.sin(at.angle * RAD),
                            6,
                          )}
                          fill={c.physField}
                        />
                      ) : null}
                    </G>
                  );
                })}
                {/* The magnet: S (blue) behind, N (red) leading toward the coil. */}
                <Rect x={mx0} y={y - mh / 2} width={mw / 2} height={mh} fill={c.poleSouth} />
                <Rect
                  x={mx0 + mw / 2}
                  y={y - mh / 2}
                  width={mw / 2}
                  height={mh}
                  fill={c.poleNorth}
                />
                <Rect
                  x={mx0}
                  y={y - mh / 2}
                  width={mw}
                  height={mh}
                  fill={url(ids.light)}
                  stroke={c.chartInk}
                />
                <ChartText
                  x={mx0 + mw * 0.25}
                  y={y + 5}
                  textAnchor="middle"
                  fontSize={chart.value}
                  fontWeight="800"
                  fill={c.onAccent}
                >
                  S
                </ChartText>
                <ChartText
                  x={mx0 + mw * 0.75}
                  y={y + 5}
                  textAnchor="middle"
                  fontSize={chart.value}
                  fontWeight="800"
                  fill={c.onAccent}
                >
                  N
                </ChartText>
                <Vec
                  x1={mx0 + mw / 2 - (into ? 20 : -20)}
                  y1={y - mh / 2 - 12}
                  x2={mx0 + mw / 2 + (into ? 20 : -20)}
                  y2={y - mh / 2 - 12}
                  color={c.chartInk}
                  width={2.5}
                  head={8}
                />
                <SubLabel
                  x={mx0 + mw / 2}
                  y={y - mh / 2 - 22}
                  text={into ? 'pushed in' : 'pulled out'}
                  size={chart.label}
                  w={w}
                />
                <Coil x0={cx0} x1={cx1} y={y} r={34} n={N} color={c.copper} back={c.copperDark} />
                <SubLabel
                  x={(cx0 + cx1) / 2}
                  y={y - 44}
                  text={`N = ${say(rep, [spec.turns], N)} turns${N > MAX_LOOPS ? ` (${MAX_LOOPS} drawn)` : ''}`}
                  size={chart.label}
                  w={w}
                />
                {/* Leads down to the galvanometer. */}
                <Path
                  d={`M ${cx0} ${y + 34} L ${cx0} ${gy} L ${gx - 30} ${gy}`}
                  stroke={c.copper}
                  strokeWidth={2.5}
                  fill="none"
                />
                <Path
                  d={`M ${cx1} ${y + 34} L ${cx1} ${gy} L ${gx + 30} ${gy}`}
                  stroke={c.copper}
                  strokeWidth={2.5}
                  fill="none"
                />
                <Circle
                  cx={gx}
                  cy={gy}
                  r={30}
                  fill={c.paper}
                  stroke={c.metalDark}
                  strokeWidth={3}
                />
                {[-60, -30, 0, 30, 60].map((a) => (
                  <Line
                    key={a}
                    x1={gx + 22 * Math.sin(a * RAD)}
                    y1={gy - 22 * Math.cos(a * RAD)}
                    x2={gx + 27 * Math.sin(a * RAD)}
                    y2={gy - 27 * Math.cos(a * RAD)}
                    stroke={c.coinInk}
                  />
                ))}
                <Line
                  x1={gx}
                  y1={gy}
                  x2={gx + 24 * Math.sin(needle * RAD)}
                  y2={gy - 24 * Math.cos(needle * RAD)}
                  stroke={c.mercury}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <Circle cx={gx} cy={gy} r={2.5} fill={c.coinInk} />
                <ChartText
                  x={gx}
                  y={gy + 16}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fontWeight="700"
                  fill={c.coinInk}
                >
                  G
                </ChartText>
                <SubLabel
                  x={gx - 38}
                  y={gy + 4}
                  text={`emf ${all ? sig(Math.abs(emf)) : '?'} V`}
                  anchor="end"
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
          ...worked(all, `emf = NΔΦ/Δt = ${sig(N)} × ${sig(dF)}/${sig(dt)} = ${sig(emf)} V`),
          into
            ? 'Pushing the N pole in, the coil’s current makes its near end an N pole that pushes back (Lenz’s law).'
            : 'Pulling it out, the current reverses: the coil’s near end becomes an S pole that pulls back.',
          'Faster motion or more turns: a bigger emf. No motion: no current.',
        ].join(' · ')}
      </Caption>
    </View>
  );
}

function ForceView({
  spec,
  calc,
}: {
  spec: Extract<InductionSpec, { mode: 'force' }>;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const B = num(rep, spec.field, 0.5);
  const I = num(rep, spec.current, 2);
  const L = num(rep, spec.length, 0.3);
  const inPlane = spec.angle !== undefined;
  const th = inPlane ? num(rep, spec.angle, 90) : 90;
  const F = B * I * L * Math.sin(th * RAD);
  const all = [spec.field, spec.current, spec.length, spec.angle].every((x) => isKnown(rep, x));
  const right = (spec.currentDir ?? 'right') === 'right';
  const intoPage = (spec.fieldDir ?? 'in') === 'in';
  const scale = useFrozen(Math.max(1e-9, Math.abs(F)));
  // F = IL × B. Field out of the page: current right pushes down; into the page: up.
  const up = inPlane ? false : right === intoPage;
  // In-plane field to the right, wire at θ: the force is into the page for a current along +θ.
  const forceInto = right;
  return (
    <View>
      <Canvas aspect={0.7}>
        {({ w, h }) => {
          const mid = h * 0.52;
          const len = Math.min(90, (70 * Math.abs(F)) / scale.value);
          const xs = Array.from({ length: Math.floor((w - 20) / 34) }, (_, i) => 20 + i * 34);
          const ys = Array.from({ length: Math.floor((h - 30) / 34) }, (_, i) => 26 + i * 34);
          const dir = {
            x: (inPlane ? Math.cos(th * RAD) : 1) * (right ? 1 : -1),
            y: (inPlane ? -Math.sin(th * RAD) : 0) * (right ? 1 : -1),
          };
          const half = w * 0.36;
          return (
            <Svg width={w} height={h}>
              <G opacity={all ? 1 : 0.4}>
                {inPlane
                  ? ys.map((y) => (
                      <Vec
                        key={y}
                        x1={12}
                        y1={y}
                        x2={w - 12}
                        y2={y}
                        color={c.physField}
                        width={1.4}
                        head={7}
                      />
                    ))
                  : xs.flatMap((x) =>
                      ys.map((y) =>
                        intoPage ? (
                          <G key={`${x},${y}`}>
                            <Line
                              x1={x - 4}
                              y1={y - 4}
                              x2={x + 4}
                              y2={y + 4}
                              stroke={c.physField}
                              strokeWidth={1.6}
                            />
                            <Line
                              x1={x - 4}
                              y1={y + 4}
                              x2={x + 4}
                              y2={y - 4}
                              stroke={c.physField}
                              strokeWidth={1.6}
                            />
                          </G>
                        ) : (
                          <Circle key={`${x},${y}`} cx={x} cy={y} r={2.5} fill={c.physField} />
                        ),
                      ),
                    )}
                {/* The wire, its current, and the force. */}
                <Line
                  x1={w / 2 - dir.x * half}
                  y1={mid - dir.y * half}
                  x2={w / 2 + dir.x * half}
                  y2={mid + dir.y * half}
                  stroke={c.copper}
                  strokeWidth={6}
                  strokeLinecap="round"
                />
                <Vec
                  x1={w / 2 - dir.x * half * 0.9}
                  y1={mid - dir.y * half * 0.9 - 14}
                  x2={w / 2 - dir.x * half * 0.4}
                  y2={mid - dir.y * half * 0.4 - 14}
                  color={c.chartHighlight}
                  width={2.5}
                  head={8}
                />
                <SubLabel
                  x={w / 2 - dir.x * half * 0.65}
                  y={mid - dir.y * half * 0.65 - 26}
                  text={`I ${say(rep, [spec.current], I)} A`}
                  color={c.chartHighlight}
                  w={w}
                />
                {inPlane ? (
                  <G>
                    <Circle
                      cx={w / 2}
                      cy={mid}
                      r={13}
                      fill={c.card}
                      stroke={c.forceNet}
                      strokeWidth={2.5}
                    />
                    {forceInto ? (
                      <G>
                        <Line
                          x1={w / 2 - 7}
                          y1={mid - 7}
                          x2={w / 2 + 7}
                          y2={mid + 7}
                          stroke={c.forceNet}
                          strokeWidth={2.5}
                        />
                        <Line
                          x1={w / 2 - 7}
                          y1={mid + 7}
                          x2={w / 2 + 7}
                          y2={mid - 7}
                          stroke={c.forceNet}
                          strokeWidth={2.5}
                        />
                      </G>
                    ) : (
                      <Circle cx={w / 2} cy={mid} r={4} fill={c.forceNet} />
                    )}
                    <SubLabel
                      x={w / 2 + 18}
                      y={mid + 30}
                      text={`F ${all ? sig(F) : '?'} N ${forceInto ? 'into' : 'out of'} the page`}
                      anchor="start"
                      color={c.forceNet}
                      w={w}
                    />
                  </G>
                ) : (
                  <G>
                    <Vec
                      x1={w / 2}
                      y1={mid}
                      x2={w / 2}
                      y2={mid + (up ? -1 : 1) * Math.max(12, len)}
                      color={c.forceNet}
                      width={4}
                    />
                    <SubLabel
                      x={w / 2 + 10}
                      y={mid + (up ? -1 : 1) * Math.max(12, len) * 0.6 + 4}
                      text={`F ${all ? sig(F) : '?'} N`}
                      anchor="start"
                      color={c.forceNet}
                      w={w}
                    />
                  </G>
                )}
              </G>
              <SubLabel
                x={10}
                y={h - 8}
                text={
                  inPlane
                    ? `B ${say(rep, [spec.field], B)} T →, θ = ${say(rep, [spec.angle], th)}°`
                    : `B ${say(rep, [spec.field], B)} T ${intoPage ? 'into' : 'out of'} the page`
                }
                anchor="start"
                size={chart.label}
                w={w}
              />
              <SubLabel
                x={w - 10}
                y={h - 8}
                text={`L ${say(rep, [spec.length], L)} m`}
                anchor="end"
                size={chart.label}
                w={w}
              />
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          ...worked(
            all,
            `F = BIL sin θ = ${sig(B)} × ${sig(I)} × ${sig(L)} × sin ${sig(th)}° = ${sig(F)} N`,
          ),
          'Right-hand rule: fingers along the current, curl them toward B; the thumb points along the force.',
          inPlane
            ? 'With B along the paper the force comes straight out of it or into it.'
            : `Current ${right ? 'to the right' : 'to the left'} with B ${intoPage ? 'into' : 'out of'} the page: the force is ${up ? 'up' : 'down'}.`,
        ].join(' · ')}
      </Caption>
    </View>
  );
}

function TransformerView({
  spec,
  calc,
}: {
  spec: Extract<InductionSpec, { mode: 'transformer' }>;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('light');
  const Np = Math.max(1, num(rep, spec.primary, 100));
  const Ns = Math.max(1, num(rep, spec.secondary, 10));
  const Vp = num(rep, spec.voltage, 120);
  const Vs = (Vp * Ns) / Np;
  const Ip = spec.current !== undefined ? num(rep, spec.current) : undefined;
  const Is = Ip !== undefined ? (Ip * Np) / Ns : undefined;
  const all = [spec.primary, spec.secondary, spec.voltage, spec.current].every((x) =>
    isKnown(rep, x),
  );
  const up = Ns > Np;
  return (
    <View>
      <Canvas aspect={0.66}>
        {({ w, h }) => {
          const cx0 = w * 0.3;
          const cx1 = w * 0.7;
          const y0 = h * 0.14;
          const y1 = h * 0.8;
          const t = 18;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <TopLight id={ids.light} />
              </Defs>
              <G opacity={all ? 1 : 0.4}>
                {/* The laminated iron core: a square ring. */}
                <Path
                  d={`M ${cx0 - t} ${y0} H ${cx1 + t} V ${y1} H ${cx0 - t} Z M ${cx0 + t} ${y0 + 2 * t} V ${y1 - 2 * t} H ${cx1 - t} V ${y0 + 2 * t} Z`}
                  fill={c.physIron}
                  fillRule="evenodd"
                  stroke={c.metalDark}
                />
                <Path
                  d={`M ${cx0 - t} ${y0} H ${cx1 + t} V ${y1} H ${cx0 - t} Z M ${cx0 + t} ${y0 + 2 * t} V ${y1 - 2 * t} H ${cx1 - t} V ${y0 + 2 * t} Z`}
                  fill={url(ids.light)}
                  fillRule="evenodd"
                />
                <Winding
                  x={cx0}
                  y0={y0 + 2 * t + 6}
                  y1={y1 - 2 * t - 6}
                  r={t + 8}
                  n={Np}
                  color={c.copper}
                  back={c.copperDark}
                />
                <Winding
                  x={cx1}
                  y0={y0 + 2 * t + 6}
                  y1={y1 - 2 * t - 6}
                  r={t + 8}
                  n={Ns}
                  color={c.copper}
                  back={c.copperDark}
                />
                {/* AC in, a lamp out. */}
                <Path
                  d={`M ${cx0 - t - 8} ${y0 + 2 * t + 6} H 22 V ${(y0 + y1) / 2 - 14} M 22 ${(y0 + y1) / 2 + 14} V ${y1 - 2 * t - 6} H ${cx0 - t - 8}`}
                  stroke={c.copper}
                  strokeWidth={2.5}
                  fill="none"
                />
                <Circle
                  cx={22}
                  cy={(y0 + y1) / 2}
                  r={14}
                  fill={c.card}
                  stroke={c.chartInk}
                  strokeWidth={1.5}
                />
                <Path
                  d={`M 13 ${(y0 + y1) / 2} q 4.5 -8 9 0 t 9 0`}
                  stroke={c.chartInk}
                  strokeWidth={1.5}
                  fill="none"
                />
                <Path
                  d={`M ${cx1 + t + 8} ${y0 + 2 * t + 6} H ${w - 22} V ${(y0 + y1) / 2 - 12} M ${w - 22} ${(y0 + y1) / 2 + 12} V ${y1 - 2 * t - 6} H ${cx1 + t + 8}`}
                  stroke={c.copper}
                  strokeWidth={2.5}
                  fill="none"
                />
                <Circle
                  cx={w - 22}
                  cy={(y0 + y1) / 2}
                  r={12}
                  fill={c.bulbGlow}
                  stroke={c.chartInk}
                />
              </G>
              <SubLabel
                x={cx0}
                y={y1 + 18}
                text={`N_p ${say(rep, [spec.primary], Np)}${Np > MAX_LOOPS ? ` (${MAX_LOOPS} drawn)` : ''}`}
                w={w}
              />
              <SubLabel
                x={cx1}
                y={y1 + 18}
                text={`N_s ${say(rep, [spec.secondary], Ns)}${Ns > MAX_LOOPS ? ` (${MAX_LOOPS} drawn)` : ''}`}
                w={w}
              />
              <SubLabel
                x={cx0}
                y={y0 - 6}
                text={`V_p ${say(rep, [spec.voltage], Vp)} V${Ip !== undefined ? `, I_p ${say(rep, [spec.current], Ip)} A` : ''}`}
                w={w}
              />
              <SubLabel
                x={cx1}
                y={y0 - 6}
                text={`V_s ${say(rep, [spec.primary, spec.secondary, spec.voltage], Vs)} V${Is !== undefined ? `, I_s ${all ? sig(Is) : '?'} A` : ''}`}
                color={c.chartHighlight}
                w={w}
              />
              <SubLabel
                x={w / 2}
                y={h - 6}
                text={up ? 'step-up' : Ns < Np ? 'step-down' : 'one to one'}
                size={chart.label}
                bold={false}
                w={w}
              />
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          ...worked(
            [spec.primary, spec.secondary, spec.voltage].every((x) => isKnown(rep, x)),
            `Vₛ = Vₚ × Nₛ/Nₚ = ${sig(Vp)} × ${sig(Ns)}/${sig(Np)} = ${sig(Vs)} V`,
          ),
          ...(Ip !== undefined && Is !== undefined
            ? worked(
                all,
                `Iₛ = Iₚ × Nₚ/Nₛ = ${sig(Ip)} × ${sig(Np)}/${sig(Ns)} = ${sig(Is)} A: VₚIₚ = VₛIₛ = ${sig(Vp * Ip)} W, the power kept.`,
              )
            : []),
          'The alternating current in the primary makes a changing field in the iron, which induces the voltage in the secondary.',
        ].join(' · ')}
      </Caption>
    </View>
  );
}
