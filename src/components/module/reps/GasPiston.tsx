/**
 * The gas piston (H51, Grades 9–12 chemistry): a glass cylinder closed by a metal piston, the gas
 * under it drawn as particles. The piston's height is the volume on the scale up the glass; the
 * gauge on the pipe reads the pressure; the thermometer reads kelvins, and each particle's speed
 * trail grows as √T. Two-state laws draw the gas before beside the gas now, the held value named.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { GasPistonSpec, GasState } from '@/data/modules/typesHsj';
import type { NumOrVar } from '@/data/modules/typesGraphs';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, niceCeil, useFrozen, useRep } from './common';
import {
  HELD_PARTICLES,
  R_LATM,
  gasSpots,
  molesPerParticle,
  particleCount,
  trailLength,
} from './gasModel';
import { niceStep } from './hsdGrid';
import { MathText } from './hsdText';
import { Ball, Glass, Metal, Sheen, url, usePaintIds } from './paint';

type Rep = ReturnType<typeof useRep>;
type Read = { value: number; known: boolean; text: string; id?: string } | undefined;

const read = (rep: Rep, x: NumOrVar | undefined): Read =>
  x === undefined
    ? undefined
    : typeof x === 'number'
      ? { value: x, known: true, text: formatNumber(x) }
      : { value: rep.shown(x), known: rep.known(x), text: rep.value(x, false), id: x };

const SUB = ['₁', '₂'];

/** What each law holds still, and which value moves when the piston is dragged. */
const HELD: Record<GasPistonSpec['law'], ('p' | 'v' | 't')[]> = {
  boyle: ['t'],
  charles: ['p'],
  gayLussac: ['v'],
  combined: [],
  ideal: [],
};

export function GasPiston({ spec, calc }: { spec: GasPistonSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('glass', 'sheen', 'metal', 'rod', 'ball', 'dial');
  const start = useRef(0);
  const stateOf = (s: GasState) => ({
    p: read(rep, s.pressure),
    v: read(rep, s.volume),
    t: read(rep, s.temperature),
  });
  const two = spec.law !== 'ideal' && !!spec.before;
  const states = two ? [stateOf(spec.before!), stateOf(spec)] : [stateOf(spec)];
  const n = read(rep, spec.moles);
  const all = (k: 'p' | 'v' | 't') =>
    states.map((s) => s[k]).filter((x): x is NonNullable<Read> => !!x && x.value > 0);
  // The scale reaches a little past the largest volume, in whole steps of 1, 2 or 5 × 10ⁿ.
  const vTop = Math.max(1e-6, ...all('v').map((x) => x.value)) * 1.18;
  const vMaxLive = Math.ceil(vTop / niceStep(vTop / 5) - 1e-9) * niceStep(vTop / 5);
  const vFrame = useFrozen(vMaxLive);
  const vMax = vFrame.value;
  const pMax = niceCeil(Math.max(1, ...all('p').map((x) => x.value)) * 1.2);
  const tMax = niceCeil(Math.max(300, ...all('t').map((x) => x.value)) * 1.12);
  const count = spec.law === 'ideal' ? particleCount(n?.value ?? 0) : HELD_PARTICLES;
  const per = spec.law === 'ideal' && n ? molesPerParticle(n.value) : undefined;
  const spots = gasSpots(count);
  const unitOf = (x: NumOrVar | undefined, fallback: string) =>
    (typeof x === 'string' ? rep.unit(x) : undefined) ?? fallback;
  const vUnit = unitOf(spec.volume ?? spec.before?.volume, 'L');
  const pUnit = unitOf(spec.pressure ?? spec.before?.pressure, 'atm');
  const tUnit = unitOf(spec.temperature ?? spec.before?.temperature, 'K');
  const held = HELD[spec.law];
  const volumeId = typeof spec.volume === 'string' ? spec.volume : undefined;
  const moving =
    spec.law === 'charles'
      ? spec.temperature
      : spec.law === 'gayLussac'
        ? undefined
        : spec.pressure;
  const specIds = [
    spec.pressure,
    spec.volume,
    spec.temperature,
    spec.moles,
    spec.before?.pressure,
    spec.before?.volume,
    spec.before?.temperature,
  ].filter((x): x is string => typeof x === 'string');
  const pins = () =>
    spec.keep ? rep.pin(spec.keep) : rep.pin(specIds.filter((x) => x !== volumeId && x !== moving));
  const canDrag = !spec.fixed && !!volumeId && spec.law !== 'gayLussac';
  const tRef = Math.max(...all('t').map((x) => x.value), 1);

  return (
    <View>
      <Canvas aspect={(w) => (two ? 1.02 : Math.min(1.02, 380 / w))}>
        {({ w, h }) => {
          const panel = two ? w / 2 : Math.min(w, 260);
          const top = 62;
          const bottom = h - (spec.law === 'ideal' ? 78 : 62);
          const cw = Math.min(78, panel * 0.42);
          const sy = (v: number) => bottom - (v / vMax) * (bottom - top);
          const vStep = niceStep(vMax / 5);
          const ticks = Array.from({ length: Math.floor(vMax / vStep + 1e-9) + 1 }, (_, i) =>
            Number((i * vStep).toFixed(9)),
          );
          const handles: { x: number; y: number }[] = [];
          const panels = states.map((s, k) => {
            const x0 = two ? k * panel : (w - panel) / 2;
            const cx = x0 + panel * 0.44;
            const left = cx - cw / 2;
            const right = cx + cw / 2;
            // A held volume (Gay-Lussac's law): the piston pinned at the same height in both.
            const vHeld = !s.v;
            const v = s.v ? s.v.value : vMax * 0.6;
            const py = Math.max(top + 6, sy(Math.min(v, vMax)));
            const known = (x: Read) => !x || x.known;
            const faded = !(known(s.p) && known(s.v) && known(s.t) && known(n));
            const t = s.t ? s.t.value : tRef;
            const trail = trailLength(t);
            const gauge = { x: right + 26, y: bottom - 30 };
            const thermo = { x: right + 26, top: top + 6, bottom: bottom - 64 };
            const tLevel =
              thermo.bottom - (Math.min(t, tMax) / tMax) * (thermo.bottom - thermo.top - 4);
            if (k === states.length - 1 && canDrag) handles.push({ x: cx, y: py - 7 });
            const sub = two ? SUB[k]! : '';
            const line = (x: Read, symbol: string, unit: string) =>
              !x
                ? `${symbol}${sub} held`
                : x.id
                  ? rep.label(x.id)
                  : `${symbol}${sub} = ${x.text} ${unit}`;
            const lines = [
              line(s.p, 'P', pUnit),
              line(s.v, 'V', vUnit),
              line(s.t, 'T', tUnit),
              ...(!two && n ? [line(n, 'n', 'mol')] : []),
            ];
            return (
              <G key={k} opacity={faded ? 0.4 : 1}>
                {two ? (
                  <ChartText
                    x={x0 + panel / 2}
                    y={16}
                    textAnchor="middle"
                    fontSize={chart.value}
                    fontWeight="700"
                  >
                    {k === 0 ? 'Before' : 'After'}
                  </ChartText>
                ) : null}
                {/* The volume scale up the glass's left side. */}
                {ticks.map((tv) => (
                  <G key={tv}>
                    <Line
                      x1={left - 7}
                      y1={sy(tv)}
                      x2={left}
                      y2={sy(tv)}
                      stroke={c.chartInk}
                      strokeWidth={1}
                    />
                    {!vHeld ? (
                      <ChartText
                        x={left - 10}
                        y={sy(tv) + 4}
                        textAnchor="end"
                        fontSize={chart.label}
                        fill={c.chartMuted}
                      >
                        {formatNumber(tv)}
                      </ChartText>
                    ) : null}
                  </G>
                ))}
                <ChartText
                  x={left - 10}
                  y={top - 12}
                  textAnchor="end"
                  fontSize={chart.label}
                  fill={c.chartMuted}
                >
                  {vUnit}
                </ChartText>
                {/* The glass, the gas under the piston, then the particles. */}
                <Rect
                  x={left}
                  y={top - 16}
                  width={cw}
                  height={bottom - top + 16}
                  fill={url(ids.glass)}
                />
                {spots.map((p, i) => {
                  const px = left + 7 + p.x * (cw - 14);
                  const pyy = py + 7 + p.y * (bottom - py - 14);
                  const [dx, dy] = [Math.cos(p.dir), Math.sin(p.dir)];
                  // The trail behind the particle, kept inside the gas.
                  const tx = Math.min(right - 3, Math.max(left + 3, px - dx * (trail + 4)));
                  const ty = Math.min(bottom - 3, Math.max(py + 2, pyy - dy * (trail + 4)));
                  return (
                    <G key={i}>
                      {trail > 0 ? (
                        <Line
                          x1={tx}
                          y1={ty}
                          x2={px}
                          y2={pyy}
                          stroke={c.gasParticle}
                          strokeOpacity={0.45}
                          strokeWidth={2}
                          strokeLinecap="round"
                        />
                      ) : null}
                      <Circle cx={px} cy={pyy} r={3.6} fill={url(ids.ball)} />
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
                {/* The piston and its rod. */}
                <Rect
                  x={cx - 4}
                  y={top - 26}
                  width={8}
                  height={py - top + 14}
                  fill={url(ids.rod)}
                  stroke={c.metalDark}
                  strokeWidth={0.8}
                />
                <Rect
                  x={cx - 13}
                  y={top - 30}
                  width={26}
                  height={7}
                  rx={3}
                  fill={c.metal}
                  stroke={c.metalDark}
                />
                <Rect
                  x={left + 1.5}
                  y={py - 13}
                  width={cw - 3}
                  height={13}
                  rx={2}
                  fill={c.metal}
                  stroke={c.metalDark}
                  strokeWidth={1.2}
                />
                <Rect x={left + 1.5} y={py - 13} width={cw - 3} height={13} fill={url(ids.rod)} />
                <Line
                  x1={left + 2}
                  y1={py - 4}
                  x2={right - 2}
                  y2={py - 4}
                  stroke={c.rubber}
                  strokeWidth={2}
                />
                {spec.law === 'gayLussac' ? (
                  // Pins through the glass hold the piston: the volume can't change.
                  <G>
                    {[left - 6, right - 6].map((x) => (
                      <Rect
                        key={x}
                        x={x}
                        y={py - 19}
                        width={12}
                        height={5}
                        rx={2}
                        fill={c.metalDark}
                      />
                    ))}
                  </G>
                ) : null}
                {/* The glass walls and base. */}
                <Path
                  d={`M ${left} ${top - 16} L ${left} ${bottom} L ${right} ${bottom} L ${right} ${top - 16}`}
                  stroke={c.glassEdge}
                  strokeWidth={chart.strokeHeavy}
                  fill="none"
                  strokeLinejoin="round"
                />
                <Line
                  x1={left}
                  y1={py}
                  x2={left - 7}
                  y2={py}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.stroke}
                />
                {/* The pipe to the pressure gauge, low on the gas's side. */}
                <Rect
                  x={right}
                  y={bottom - 11}
                  width={gauge.x - right}
                  height={6}
                  fill={c.metal}
                  stroke={c.metalDark}
                  strokeWidth={0.8}
                />
                <Rect
                  x={gauge.x - 3}
                  y={gauge.y + 14}
                  width={6}
                  height={bottom - 11 - gauge.y - 14}
                  fill={c.metal}
                  stroke={c.metalDark}
                  strokeWidth={0.8}
                />
                <Gauge
                  x={gauge.x}
                  y={gauge.y}
                  r={20}
                  share={s.p ? s.p.value / pMax : 0.5}
                  metal={ids.dial}
                />
                {/* A thermometer in kelvins. */}
                <Rect
                  x={thermo.x - 4}
                  y={thermo.top}
                  width={8}
                  height={thermo.bottom - thermo.top}
                  rx={4}
                  fill={c.glass}
                  stroke={c.glassEdge}
                />
                <Rect
                  x={thermo.x - 1.8}
                  y={tLevel}
                  width={3.6}
                  height={thermo.bottom - tLevel + 2}
                  fill={c.mercury}
                />
                <Circle
                  cx={thermo.x}
                  cy={thermo.bottom + 4}
                  r={6}
                  fill={c.mercury}
                  stroke={c.glassEdge}
                />
                <ChartText
                  x={thermo.x}
                  y={thermo.top - 6}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fill={c.chartMuted}
                >
                  {tUnit}
                </ChartText>
                {lines.map((line, i) => (
                  <MathText
                    key={i}
                    text={line}
                    x={x0 + panel / 2}
                    y={bottom + 20 + i * 16}
                    textAnchor="middle"
                    fontSize={chart.label}
                    fontWeight={line.includes('held') ? '400' : '700'}
                    fill={line.includes('held') ? c.chartMuted : c.chartInk}
                  />
                ))}
              </G>
            );
          });
          const handle = handles[0];
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Glass id={ids.glass} />
                  <Sheen id={ids.sheen} strength={0.8} />
                  <Sheen id={ids.rod} strength={1.2} />
                  <Metal id={ids.dial} light={c.metal} dark={c.metalDark} />
                  <Ball id={ids.ball} color={c.gasParticle} />
                </Defs>
                {panels}
                {two ? (
                  <Line
                    x1={w / 2}
                    y1={26}
                    x2={w / 2}
                    y2={bottom}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                    strokeDasharray={chart.dash}
                  />
                ) : null}
              </Svg>
              {handle && volumeId ? (
                <DragHandle
                  testID="drag-piston"
                  x={handle.x}
                  y={handle.y}
                  label="the volume (move the piston)"
                  onStart={() => {
                    start.current = rep.shown(volumeId);
                    vFrame.freeze();
                  }}
                  onMove={(_, dy) => {
                    const v = Math.max(0, start.current - (dy / (bottom - top)) * vMax);
                    calc.set(
                      { ...pins(), [volumeId]: rep.snapTo(volumeId, v * rep.factor(volumeId)) },
                      rep.slide(volumeId),
                    );
                  }}
                  onEnd={vFrame.release}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{captionOf(spec, rep, states, n, per, count, held)}</Caption>
    </View>
  );
}

/** The law with the picture's numbers, the speeds compared and the particle key. */
function captionOf(
  spec: GasPistonSpec,
  rep: Rep,
  states: { p: Read; v: Read; t: Read }[],
  n: Read,
  per: number | undefined,
  count: number,
  held: ('p' | 'v' | 't')[],
): string {
  const q = (x: Read) => (x && x.known ? x.text : '?');
  const num = (x: Read) => (x && x.known ? x.value : undefined);
  const out: string[] = [];
  const [a, b] = [states[0]!, states[states.length - 1]!];
  const both = (f: (s: { p: Read; v: Read; t: Read }) => number | undefined) => {
    const [x, y] = [f(a), f(b)];
    return x !== undefined && y !== undefined ? formatNumber(Number(x.toPrecision(6))) : '?';
  };
  switch (spec.law) {
    case 'boyle':
      out.push(
        `Before and after, P₁V₁ = P₂V₂: ${q(a.p)} × ${q(a.v)} = ${q(b.p)} × ${q(b.v)} = ${both(
          (s) =>
            num(s.p) !== undefined && num(s.v) !== undefined ? num(s.p)! * num(s.v)! : undefined,
        )}`,
      );
      break;
    case 'charles':
      out.push(`Before and after, V₁/T₁ = V₂/T₂: ${q(a.v)}/${q(a.t)} = ${q(b.v)}/${q(b.t)}.`);
      break;
    case 'gayLussac':
      out.push(`Before and after, P₁/T₁ = P₂/T₂: ${q(a.p)}/${q(a.t)} = ${q(b.p)}/${q(b.t)}.`);
      break;
    case 'combined':
      out.push(
        `Before and after, P₁V₁/T₁ = P₂V₂/T₂: ${q(a.p)} × ${q(a.v)}/${q(a.t)} = ${q(b.p)} × ${q(b.v)}/${q(b.t)}.`,
      );
      break;
    case 'ideal': {
      const r = spec.R ?? R_LATM;
      const [p, v, t, m] = [num(b.p), num(b.v), num(b.t), num(n)];
      const pv =
        p !== undefined && v !== undefined ? formatNumber(Number((p * v).toFixed(4))) : '?';
      // Two sentences: the constant with its unit, then the law with the numbers, led by a
      // word so it reads as one line (one sentence mixing them was stacked at each "=").
      out.push(
        `R = ${formatNumber(r)}${r === R_LATM ? ' L·atm/(mol·K)' : ''}.`,
        `With PV = nRT: ${q(b.p)} × ${q(b.v)} = ${q(n)} × ${formatNumber(r)} × ${q(b.t)} = ${pv}.`,
      );
      if (m !== undefined && t !== undefined && per !== undefined) {
        const whole = Math.abs(m / per - Math.round(m / per)) < 1e-9;
        out.push(
          `Each particle drawn stands for ${formatNumber(per)} mol: ${whole ? '' : 'about '}${count} particles.`,
        );
      }
      break;
    }
  }
  const heldWord = { p: 'pressure', v: 'volume', t: 'temperature' } as const;
  if (held.length) out.push(`The ${heldWord[held[0]!]} and the amount of gas are held.`);
  // Faster particles at the higher temperature: the average speed goes as √T.
  const [t1, t2] = [num(a.t), num(b.t)];
  if (states.length === 2 && t1 !== undefined && t2 !== undefined && t1 !== t2 && t1 > 0) {
    const ratio = Math.sqrt(t2 / t1);
    out.push(
      `At ${formatNumber(t2)} K the particles move √(${formatNumber(t2)}/${formatNumber(t1)}) ≈ ${formatNumber(Number(ratio.toFixed(2)))} times as fast.`,
    );
  }
  return out.join(' · ');
}

/**
 * A pressure gauge: a metal rim, a paper face with ticks round 270° and a red needle at `share`
 * of the full scale (the reading itself is written under the picture).
 */
function Gauge({
  x,
  y,
  r,
  share,
  metal,
}: {
  x: number;
  y: number;
  r: number;
  share: number;
  metal: string;
}) {
  const c = usePalette();
  const angle = (t: number) => ((135 + 270 * Math.min(1, Math.max(0, t))) * Math.PI) / 180;
  const at = (t: number, rr: number) => [x + rr * Math.cos(angle(t)), y + rr * Math.sin(angle(t))];
  const [nx, ny] = at(share, r - 6);
  return (
    <G>
      <Circle cx={x + 1.5} cy={y + 2.5} r={r} fill={c.shadow} />
      <Circle cx={x} cy={y} r={r} fill={url(metal)} stroke={c.metalDark} />
      <Circle cx={x} cy={y} r={r - 4} fill={c.paper} stroke={c.metalDark} strokeWidth={0.8} />
      {Array.from({ length: 11 }, (_, i) => {
        const [x1, y1] = at(i / 10, r - 5);
        const [x2, y2] = at(i / 10, i % 5 === 0 ? r - 10 : r - 8);
        return (
          <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c.coinInk} strokeWidth={0.9} />
        );
      })}
      <Line
        x1={x}
        y1={y}
        x2={nx}
        y2={ny}
        stroke={c.mercury}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx={x} cy={y} r={2.4} fill={c.coinInk} />
    </G>
  );
}
