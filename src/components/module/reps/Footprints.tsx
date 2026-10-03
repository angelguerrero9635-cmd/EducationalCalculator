/**
 * HC156 `footprints` (FootprintsSpec in typesHe4j.ts): gait to scale. Five bare footprints on a
 * sand walkway, left and right in turn, the foot and the steps drawn to one scale; the step
 * bracketed heel to heel under the prints and the stride (two steps, one foot) over them; under
 * them a tick a step at the cadence, each at its time; and with the leg length a bar of the
 * Froude number against the walk–run line at 0.5. Drag the second print to change the step.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Defs, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { FootprintsSpec } from '@/data/modules/typesHe4j';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { PRINTS, froudeOf, inUnit, printHeels, runSpeedOf, walkSpeed } from './he4jMath';
import { TopLight, url, usePaintIds } from './paint';

const n3 = (x: number) => formatNumber(Number(x.toPrecision(3)));
const sig3 = (x: number) =>
  Number.isInteger(x) || Math.abs(x) >= 1000 || Math.abs(x) < 0.01
    ? n3(x)
    : x.toPrecision(3).replace('-', '−');

/** A right sole's outline, heel at x = 0 and toes at x = 1 (y down is the outer side). */
const SOLE: [number, number][] = [
  [0, 0],
  [0.04, -0.12],
  [0.18, -0.15],
  [0.36, -0.1],
  [0.5, -0.09],
  [0.66, -0.17],
  [0.76, -0.16],
  [0.8, -0.02],
  [0.76, 0.12],
  [0.66, 0.18],
  [0.46, 0.15],
  [0.24, 0.14],
  [0.06, 0.11],
];
/** The toes: x, y, rx, ry (the big toe on the inner side). */
const TOES: [number, number, number, number][] = [
  [0.9, -0.11, 0.07, 0.055],
  [0.87, -0.01, 0.045, 0.035],
  [0.85, 0.06, 0.04, 0.032],
  [0.82, 0.12, 0.036, 0.03],
  [0.77, 0.17, 0.032, 0.027],
];

/** A smooth closed path through points (midpoint quadratics). */
function smooth(pts: [number, number][]): string {
  const mid = (a: [number, number], b: [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const n = pts.length;
  const start = mid(pts[n - 1]!, pts[0]!);
  let d = `M ${start[0]!.toFixed(1)} ${start[1]!.toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i]!;
    const m = mid(p, pts[(i + 1) % n]!);
    d += ` Q ${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0]!.toFixed(1)} ${m[1]!.toFixed(1)}`;
  }
  return `${d} Z`;
}

export function Footprints({ spec, calc }: { spec: FootprintsSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('light');
  const start = useRef(0);
  type V = number | string | undefined;
  const get = (v: V, unit: string): number | undefined => {
    if (v === undefined) return undefined;
    if (typeof v === 'number') return v;
    if (!rep.known(v)) return undefined;
    return inUnit(rep.val(v), rep.variable(v).unit, unit);
  };
  const say = (v: V, x: number, unit: string) => {
    if (typeof v !== 'string' || !rep.known(v)) return `${sig3(x)}${unit ? ` ${unit}` : ''}`;
    if (rep.typed(v)) return rep.value(v);
    const u = rep.unit(v);
    return `${sig3(rep.shown(v))}${u ? ` ${u}` : ''}`;
  };
  /** A number in a working line: as typed, else to 3 figures. */
  const bare = (v: V, x: number) =>
    typeof v === 'string' && rep.known(v) && rep.typed(v) ? rep.value(v, false) : sig3(x);
  const step = get(spec.step, 'm');
  const cadence = get(spec.cadence, 'min⁻¹');
  const g = get(spec.g, 'm/s²') ?? 9.81;
  const leg = get(spec.leg, 'm');
  const speed =
    get(spec.speed, 'm/s') ??
    (step !== undefined && cadence !== undefined ? walkSpeed(step, cadence) : undefined);
  const fr =
    get(spec.froude, '') ??
    (speed !== undefined && leg !== undefined ? froudeOf(speed, g, leg) : undefined);
  const vRun = get(spec.runSpeed, 'm/s') ?? (leg !== undefined ? runSpeedOf(g, leg) : undefined);
  const foot = spec.foot ?? 0.26;
  const ok = step !== undefined && step > 0;
  const period = cadence !== undefined && cadence > 0 ? 60 / cadence : undefined;
  const hasFroude = spec.leg !== undefined;
  const H = hasFroude ? 252 : 190;
  // Metres per pixel, held while the second print is dragged.
  const span = useFrozen(ok ? (PRINTS - 1) * step + foot : 1);

  const lines: string[] = [];
  if (!ok) lines.push('Type the step length to lay the prints down.');
  else {
    lines.push(
      `Stride = 2 × step = 2 × ${say(spec.step, step, 'm')} = ${say(spec.stride, 2 * step, 'm')}.`,
    );
    if (cadence !== undefined && speed !== undefined)
      lines.push(
        `v = step × cadence ÷ 60 = ${bare(spec.step, step)} × ${bare(spec.cadence, cadence)} ÷ 60 = ${say(spec.speed, speed, 'm/s')}.`,
      );
  }
  if (fr !== undefined && speed !== undefined && leg !== undefined)
    lines.push(
      `Fr = v² ÷ (gL) = ${bare(spec.speed, speed)}² ÷ (${bare(spec.g, g)} × ${bare(spec.leg, leg)}) =${say(spec.froude, fr, '')}: ${fr < 0.5 ? 'a walk' : 'past 0.5, a run'}.`,
    );
  if (vRun !== undefined && leg !== undefined)
    lines.push(`Runs above √(0.5gL) = ${say(spec.runSpeed, vRun, 'm/s')}.`);

  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w }) => {
          const L = 16;
          const usable = w - 2 * L;
          const k = usable / span.value;
          const fx = (m: number) => L + m * k;
          const heels = ok ? printHeels(step) : [];
          const matTop = 32;
          const matBot = 112;
          const rowY = { L: 56, R: 88 };
          const len = foot * k;
          const print = (x0: number, side: 'L' | 'R', key: string) => {
            // Left prints mirror the right's outline (the big toe on the inner side).
            const s = side === 'L' ? -1 : 1;
            const pts = SOLE.map(
              ([x, y]) => [x0 + x * len, rowY[side] + s * y * len] as [number, number],
            );
            return (
              <G key={key}>
                <Path d={smooth(pts)} fill={c.he4jPrint} />
                {TOES.map(([x, y, rx, ry], i) => (
                  <Ellipse
                    key={i}
                    cx={x0 + x * len}
                    cy={rowY[side] + s * y * len}
                    rx={Math.max(0.8, rx * len)}
                    ry={Math.max(0.8, ry * len)}
                    fill={c.he4jPrint}
                  />
                ))}
              </G>
            );
          };
          const bracket = (
            x0: number,
            x1: number,
            y: number,
            up: boolean,
            text: string,
            color: string,
          ) => {
            const t = up ? -6 : 6;
            return (
              <G>
                <Path
                  d={`M ${x0} ${y + t} V ${y} H ${x1} V ${y + t}`}
                  stroke={color}
                  strokeWidth={chart.strokeLight}
                  fill="none"
                />
                <ChartText
                  {...fitLabel((x0 + x1) / 2, text, chart.label, w)}
                  y={up ? y - 5 : y + 15}
                  fill={color}
                  fontWeight="700"
                  halo
                >
                  {text}
                </ChartText>
              </G>
            );
          };
          const timeY = 160;
          const fy = 214;
          const frMax = Math.max(1, Math.ceil((fr ?? 0) * 2) / 2);
          const frx = (f: number) => L + (f / frMax) * usable;
          return (
            <>
              <Svg width={w} height={H}>
                <Defs>
                  <TopLight id={ids.light} />
                </Defs>
                {/* The sand walkway, lit from above. */}
                <Rect
                  x={4}
                  y={matTop}
                  width={w - 8}
                  height={matBot - matTop}
                  rx={6}
                  fill={c.landSand}
                />
                <Rect
                  x={4}
                  y={matTop}
                  width={w - 8}
                  height={matBot - matTop}
                  rx={6}
                  fill={url(ids.light)}
                />
                {heels.map((h, i) => print(fx(h.x), h.side, `p${i}`))}
                {/* Heel lines down to the brackets and the ticks. */}
                {heels.map((h, i) => (
                  <Line
                    key={`h${i}`}
                    x1={fx(h.x)}
                    y1={i === 0 || i === 2 ? 24 : rowY[h.side]}
                    x2={fx(h.x)}
                    y2={cadence !== undefined ? timeY : 124}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                    strokeDasharray={chart.dashFine}
                  />
                ))}
                {ok
                  ? bracket(
                      fx(0),
                      fx(2 * step),
                      24,
                      true,
                      `stride = ${say(spec.stride, 2 * step, 'm')}`,
                      c.chartInk,
                    )
                  : null}
                {ok
                  ? bracket(
                      fx(0),
                      fx(step),
                      124,
                      false,
                      `step = ${say(spec.step, step, 'm')}`,
                      c.he4jStance,
                    )
                  : null}
                {/* A tick a step: the metronome. */}
                {ok && period !== undefined ? (
                  <G>
                    <Line
                      x1={L}
                      y1={timeY}
                      x2={w - L}
                      y2={timeY}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    {heels.map((h, i) => (
                      <G key={`t${i}`}>
                        <Polygon
                          points={`${fx(h.x) - 5},${timeY - 9} ${fx(h.x) + 5},${timeY - 9} ${fx(h.x)},${timeY}`}
                          fill={c.he4jStance}
                        />
                        {i % 2 === 0 ? (
                          <ChartText
                            {...fitLabel(fx(h.x), `${sig3(i * period)} s`, chart.label, w)}
                            y={timeY + 16}
                            fill={c.chartMuted}
                          >
                            {`${sig3(i * period)} s`}
                          </ChartText>
                        ) : null}
                      </G>
                    ))}
                    <ChartText
                      {...fitLabel(w - L, `a step every ${sig3(period)} s`, chart.label, w, 'end')}
                      y={timeY + 32}
                      fontWeight="700"
                    >
                      {`a step every ${sig3(period)} s`}
                    </ChartText>
                    {speed !== undefined ? (
                      <ChartText x={L} y={timeY + 32} fontWeight="700" fill={c.he4jStance}>
                        {`v = ${say(spec.speed, speed, 'm/s')}`}
                      </ChartText>
                    ) : null}
                  </G>
                ) : null}
                {/* The Froude number against the walk–run line. */}
                {hasFroude ? (
                  <G>
                    <Rect
                      x={L}
                      y={fy}
                      width={usable}
                      height={12}
                      fill={c.chartFill}
                      stroke={c.chartInk}
                      strokeWidth={1}
                    />
                    {fr !== undefined ? (
                      <Rect
                        x={L}
                        y={fy}
                        width={(Math.min(fr, frMax) / frMax) * usable}
                        height={12}
                        fill={c.he4jFroude}
                      />
                    ) : null}
                    <Line
                      x1={frx(0.5)}
                      y1={fy - 6}
                      x2={frx(0.5)}
                      y2={fy + 18}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                    />
                    <ChartText x={L} y={fy - 6} fontWeight="700" fill={c.he4jFroude}>
                      {fr !== undefined ? `Fr = ${say(spec.froude, fr, '')}` : 'Fr'}
                    </ChartText>
                    <ChartText
                      {...fitLabel(frx(0.5) + 4, 'walk | run at 0.5', chart.label, w, 'start')}
                      y={fy + 30}
                    >
                      walk | run at 0.5
                    </ChartText>
                    <ChartText x={L} y={fy + 30} fill={c.chartMuted}>
                      0
                    </ChartText>
                    <ChartText x={w - L} y={fy + 30} textAnchor="end" fill={c.chartMuted}>
                      {formatNumber(frMax)}
                    </ChartText>
                  </G>
                ) : null}
              </Svg>
              {ok && typeof spec.step === 'string' && !spec.fixed && rep.movable(spec.step) ? (
                <DragHandle
                  testID={`drag-${spec.step}`}
                  x={fx(step)}
                  y={rowY.R}
                  label={rep.variable(spec.step).name}
                  onStart={() => {
                    start.current = rep.val(spec.step as string);
                    span.freeze();
                  }}
                  onEnd={span.release}
                  onMove={(dx) => {
                    const id = spec.step as string;
                    const unit = rep.variable(id).unit;
                    const perM = inUnit(1, 'm', unit ?? 'm');
                    calc.set(
                      {
                        ...rep.pin(spec.keep ?? []),
                        [id]: rep.snapTo(id, start.current + (dx / k) * perM),
                      },
                      rep.slide(id),
                    );
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
