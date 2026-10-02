import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { LightClockSpec } from '@/data/modules/typesHs2c';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import { sig, SubLabel, Vec } from './hskKit';
import { Sheen, TopLight, url, usePaintIds } from './paint';

/** The tallest the clock is drawn (px): the mirrors' gap, cΔt₀/2. */
const TALL = 112;
/** The shortest: a very fast clock is squeezed rather than run off the canvas. */
const SHORT = 26;

/** γ = 1/√(1 − β²), for 0 ≤ β < 1. */
export const gammaOf = (beta: number) => 1 / Math.sqrt(Math.max(1e-12, 1 - beta * beta));

/**
 * The light clock of special relativity (H102): a pulse of light between two mirrors. At rest
 * it goes straight up and back (one tick, Δt₀). Moving at β = v/c the clock slides along while
 * the light travels, so the light takes a longer, slanted path, and since light's speed is c for
 * every observer the tick takes longer: Δt = γΔt₀. The half-tick triangle has sides cΔt₀/2
 * (up), vΔt/2 (along) and cΔt/2 (the slant), so (cΔt/2)² = (cΔt₀/2)² + (vΔt/2)². With a
 * length, a rod at rest (L₀) and moving (L = L₀/γ). Drag the top of the slant for β.
 */
export function LightClock({ spec, calc }: { spec: LightClockSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('mirror', 'rod');
  const drag = useRef(0);
  const si = (x: number | string) => (typeof x === 'number' ? x : rep.val(x));
  const known = (x: number | string | undefined) =>
    x === undefined || typeof x === 'number' || rep.known(x);
  const beta = Math.min(0.9999, Math.max(0, si(spec.speed)));
  const g = gammaOf(beta);
  const t0 = spec.proper === undefined ? undefined : si(spec.proper);
  const L0 = spec.length === undefined ? undefined : si(spec.length);
  const all = [spec.speed, spec.proper, spec.length].every(known);
  // A "?" box reads "?" on the picture, not the example's number behind it.
  const q = (ok: boolean, text: string) => (ok ? text : '?');
  const tOk = known(spec.proper) && known(spec.speed);
  const lOk = known(spec.length) && known(spec.speed);
  const rod = L0 !== undefined;
  // The clock's height, frozen while the slant is dragged so the drawing doesn't jump.
  const live = { bg: beta * g };
  const frozen = useFrozen(live);

  return (
    <View>
      <Canvas aspect={(w) => (rod ? 330 : 250) / w}>
        {({ w, h }) => {
          const base = 58 + TALL;
          // The moving panel's room across; the half tick is βγ as wide as it is tall.
          const x0 = w * 0.36;
          const avail = w - x0 - 16;
          const bg = frozen.value.bg;
          const tall = Math.max(SHORT, Math.min(TALL, avail / Math.max(1e-9, 2 * bg)));
          const full = 2 * bg * tall <= avail + 0.5;
          const half = beta * g * tall;
          const topY = base - tall;
          const rest = w * 0.14;
          // One mirror pair at x (centered), in metal.
          const mirrors = (x: number, faded: boolean) => (
            <G opacity={faded ? 0.35 : 1}>
              {[topY - 7, base].map((y) => (
                <G key={y}>
                  <Rect x={x - 22} y={y} width={44} height={7} rx={2} fill={c.metal} />
                  <Rect x={x - 22} y={y} width={44} height={7} rx={2} fill={url(ids.mirror)} />
                </G>
              ))}
            </G>
          );
          const apex = { x: x0 + half, y: topY };
          const rodY = base + 74;
          const rodW = w - 60;
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Sheen id={ids.mirror} vertical />
                  <TopLight id={ids.rod} />
                </Defs>
                <G opacity={all ? 1 : 0.45}>
                  <ChartText
                    x={rest}
                    y={16}
                    textAnchor="middle"
                    fontSize={chart.label}
                    fontWeight="700"
                  >
                    At rest
                  </ChartText>
                  <ChartText
                    x={(x0 + w) / 2}
                    y={16}
                    textAnchor="middle"
                    fontSize={chart.label}
                    fontWeight="700"
                  >
                    {`Moving at ${sig(beta)}c`}
                  </ChartText>
                  {/* At rest: straight up and back. */}
                  {mirrors(rest, false)}
                  <Vec
                    x1={rest - 5}
                    y1={base}
                    x2={rest - 5}
                    y2={topY + 2}
                    color={c.physRay}
                    width={2.5}
                    head={8}
                  />
                  <Vec
                    x1={rest + 5}
                    y1={topY}
                    x2={rest + 5}
                    y2={base - 2}
                    color={c.physRay}
                    width={2.5}
                    head={8}
                  />
                  <SubLabel
                    x={rest}
                    y={base + 28}
                    text={
                      t0 !== undefined
                        ? `Δt_0 = ${q(known(spec.proper), sig(t0))} s`
                        : 'one tick: Δt_0'
                    }
                    w={w}
                  />
                  {/* Moving: the clock at the start, at the bounce and at the end. */}
                  {mirrors(x0, true)}
                  {mirrors(apex.x, false)}
                  {full ? mirrors(x0 + 2 * half, true) : null}
                  <Vec
                    x1={x0}
                    y1={base}
                    x2={apex.x}
                    y2={apex.y + 2}
                    color={c.physRay}
                    width={2.5}
                    head={8}
                  />
                  {full ? (
                    <Vec
                      x1={apex.x}
                      y1={apex.y}
                      x2={x0 + 2 * half}
                      y2={base - 2}
                      color={c.physRay}
                      width={2.5}
                      head={8}
                    />
                  ) : null}
                  {/* The half-tick triangle's other two sides. */}
                  <Line
                    x1={x0}
                    y1={base + 12}
                    x2={apex.x}
                    y2={base + 12}
                    stroke={c.forceApplied}
                    strokeWidth={2}
                  />
                  <Line
                    x1={apex.x}
                    y1={base}
                    x2={apex.x}
                    y2={topY}
                    stroke={c.chartMuted}
                    strokeWidth={1.2}
                    strokeDasharray={chart.dashFine}
                  />
                  <Path
                    d={`M ${apex.x - 8} ${base} L ${apex.x - 8} ${base - 8} L ${apex.x} ${base - 8}`}
                    stroke={c.chartMuted}
                    fill="none"
                  />
                  <SubLabel
                    x={(x0 + apex.x) / 2}
                    y={base + 30}
                    text="vΔt/2"
                    color={c.forceApplied}
                    w={w}
                  />
                  <SubLabel
                    x={apex.x + 6}
                    y={(base + topY) / 2 + 20}
                    text="cΔt_0/2"
                    anchor="start"
                    color={c.chartMuted}
                    w={w}
                  />
                  <SubLabel
                    x={(x0 + apex.x) / 2 - 8}
                    y={(base + topY) / 2 - 4}
                    text="cΔt/2"
                    anchor="end"
                    color={c.physRay}
                    w={w}
                  />
                  <SubLabel x={w - 8} y={40} text={`γ = ${sig(g, 4)}`} anchor="end" w={w} />
                  {t0 !== undefined ? (
                    <SubLabel
                      x={w - 8}
                      y={58}
                      text={`Δt = ${q(tOk, sig(g * t0, 4))} s`}
                      anchor="end"
                      w={w}
                    />
                  ) : null}
                  {!full ? (
                    <ChartText
                      x={w - 8}
                      y={base + 50}
                      textAnchor="end"
                      fontSize={chart.label}
                      fill={c.chartMuted}
                    >
                      half a tick shown
                    </ChartText>
                  ) : null}
                  {/* A rod at rest and moving: shorter along the motion. */}
                  {rod && L0 !== undefined ? (
                    <G>
                      {[
                        {
                          y: rodY,
                          len: rodW,
                          text: `L_0 = ${q(known(spec.length), sig(L0))} m, at rest`,
                        },
                        {
                          y: rodY + 40,
                          len: rodW / g,
                          text: `L = ${q(lOk, sig(L0 / g, 4))} m, moving`,
                        },
                      ].map((r) => (
                        <G key={r.y}>
                          <Rect
                            x={16}
                            y={r.y}
                            width={r.len}
                            height={12}
                            rx={3}
                            fill={c.physCartA}
                          />
                          <Rect
                            x={16}
                            y={r.y}
                            width={r.len}
                            height={12}
                            rx={3}
                            fill={url(ids.rod)}
                          />
                          <SubLabel x={16} y={r.y - 5} text={r.text} anchor="start" w={w} />
                        </G>
                      ))}
                      {beta > 0 ? (
                        <Vec
                          x1={16 + rodW / g + 8}
                          y1={rodY + 46}
                          x2={16 + rodW / g + 36}
                          y2={rodY + 46}
                          color={c.chartInk}
                          width={2}
                          head={7}
                        />
                      ) : null}
                    </G>
                  ) : null}
                  <Circle cx={x0} cy={base} r={3} fill={c.physRay} />
                </G>
              </Svg>
              {!spec.fixed && typeof spec.speed === 'string' && rep.known(spec.speed) ? (
                <DragHandle
                  testID="drag-speed"
                  x={apex.x}
                  y={apex.y}
                  label={rep.variable(spec.speed).name}
                  onStart={() => {
                    drag.current = half;
                    frozen.freeze();
                  }}
                  onEnd={frozen.release}
                  onMove={(dx) => {
                    const id = spec.speed as string;
                    // The slant's width over its height is βγ: back to β.
                    const s = Math.max(0, (drag.current + dx) / tall);
                    const pins = [spec.proper, spec.length].filter(
                      (x): x is string => typeof x === 'string',
                    );
                    calc.set(
                      { ...rep.pin(pins), [id]: rep.snapTo(id, s / Math.sqrt(1 + s * s)) },
                      rep.slide(id),
                    );
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{captionLines().join(' · ')}</Caption>
    </View>
  );

  function captionLines(): string[] {
    const out = [`Lorentz factor: γ = 1/√(1 − β²) = 1/√(1 − ${sig(beta)}²) = ${sig(g, 4)}`];
    if (t0 !== undefined && tOk)
      out.push(`Moving clock: Δt = γΔt₀ = ${sig(g, 4)} × ${sig(t0)} = ${sig(g * t0, 4)} s`);
    if (L0 !== undefined && lOk)
      out.push(`Moving length: L = L₀/γ = ${sig(L0)}/${sig(g, 4)} = ${sig(L0 / g, 4)} m`);
    out.push(
      'Light moves at c for every observer, so the longer slanted path takes longer: a moving clock ticks slowly.',
    );
    return out;
  }
}
