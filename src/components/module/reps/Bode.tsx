/**
 * HC22 `bode` (college round 2, group A): a Bode plot, flat. The gain in dB over the phase in
 * degrees on one log-frequency axis (decades labelled), the straight-line asymptotes dashed, each
 * corner ticked and named, a marked frequency read on both curves (drag it along the axis), for
 * a loop the gain crossover with PM and the phase crossover with GM, and for an op-amp its
 * closed-loop gain under the open-loop line. A "?" value draws nothing for that value.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { BodeSpec } from '@/data/modules/typesHe2a';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle, useFrozen, useRep } from './common';
import {
  asymptoteDb,
  asymptotePhase,
  bodeAt,
  bodeTfOf,
  decadeRange,
  gainCrossover,
  phaseCrossover,
} from './bodeMath';
import { decadeText, linearTicks } from './functionGraphHe1dMath';
import { arrowHead } from './graphKit';
import { boxAt, nf, nf3, place, Tag, tagWidth, type Box } from './he2aKit';

/** A nice tick step for a span shown in about `n` ticks, from the given choices. */
const stepOf = (span: number, n: number, choices: number[]) =>
  choices.find((s) => span / s <= n) ?? choices[choices.length - 1]!;

export function Bode({ spec, calc }: { spec: BodeSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (x: number | string) => (typeof x === 'number' ? x : rep.val(x));
  const known = (x: number | string | undefined) =>
    x === undefined || typeof x === 'number' || rep.known(x);
  const drag = useRef(0);
  const tf = bodeTfOf(spec, (x) => (known(x) ? num(x) : undefined));
  const at = spec.at !== undefined && known(spec.at) ? num(spec.at) : undefined;
  const unit = spec.unit ?? (typeof spec.at === 'string' ? rep.unit(spec.at) : undefined) ?? 'Hz';
  const fName =
    typeof spec.at === 'string' ? rep.variable(spec.at).symbol : unit === 'rad/s' ? 'ω' : 'f';
  const gc = tf && spec.crossover ? gainCrossover(tf) : undefined;
  const pc = tf && spec.margin ? phaseCrossover(tf) : undefined;
  const cl =
    tf && spec.closed && known(spec.closed.gain) && num(spec.closed.gain) > 0
      ? { g: num(spec.closed.gain), bw: Math.abs(tf.k) / num(spec.closed.gain) }
      : undefined;
  const showPhase = spec.phase !== false;
  const live = (() => {
    if (!tf) return undefined;
    const marks = [at ?? 0, gc?.w ?? 0, pc?.w ?? 0, cl?.bw ?? 0];
    if (!tf.poles.length && !tf.zeros.length && !tf.pairs.length && tf.k)
      marks.push(Math.abs(tf.k) ** (1 / Math.max(1, tf.n)));
    const [lo, hi] = decadeRange(tf, marks);
    const ws = Array.from({ length: 241 }, (_, i) => 10 ** (lo + ((hi - lo) * i) / 240));
    const dbs = ws.flatMap((w) => [bodeAt(tf, w).db, asymptoteDb(tf, w)]);
    if (cl) dbs.push(20 * Math.log10(cl.g));
    if (gc || pc) dbs.push(0);
    let [dLo, dHi] = [Math.min(...dbs), Math.max(...dbs)];
    // A band 40 dB tall at least; the deep tail cut at 100 dB under the top.
    dLo = Math.max(dLo, dHi - 100);
    if (dHi - dLo < 40) [dLo, dHi] = [(dLo + dHi) / 2 - 20, (dLo + dHi) / 2 + 20];
    const dStep = stepOf(dHi - dLo, 5, [10, 20, 40]);
    const ph = ws.flatMap((w) => [bodeAt(tf, w).phase, asymptotePhase(tf, w)]);
    if (pc || gc) ph.push(-180);
    let [pLo, pHi] = [Math.min(...ph), Math.max(...ph)];
    if (pHi - pLo < 90) [pLo, pHi] = [(pLo + pHi) / 2 - 45, (pLo + pHi) / 2 + 45];
    const pStep = stepOf(pHi - pLo, 4, [45, 90]);
    return {
      lo,
      hi,
      db: [Math.floor(dLo / dStep - 0.05) * dStep, Math.ceil(dHi / dStep + 0.05) * dStep, dStep],
      ph: [Math.floor(pLo / pStep - 1e-9) * pStep, Math.ceil(pHi / pStep + 1e-9) * pStep, pStep],
    };
  })();
  const win = useFrozen(live);

  // Caption.
  const lines: string[] = [];
  const fu = ` ${unit}`;
  const names = spec.cornerNames ?? [];
  if (tf) {
    const corners = [
      ...tf.poles.map((p) => ({ w: p, kind: 'pole' })),
      ...tf.zeros.map((z) => ({ w: z, kind: 'zero' })),
      ...tf.pairs.map((p) => ({ w: p.w0, kind: 'pair' })),
    ];
    const cs = corners.map((k, i) => `${names[i] ? `${names[i]} = ` : ''}${nf(k.w)}${fu}`);
    if (cs.length) lines.push(`Corner${cs.length > 1 ? 's' : ''} at ${cs.join(', ')}.`);
    if (at !== undefined && at > 0) {
      const p = bodeAt(tf, at);
      lines.push(
        `At ${fName} = ${nf(at)}${fu}: |H| = ${nf3(p.ratio)} = ${nf3(p.db)} dB, phase ${nf3(p.phase)}°.`,
      );
      if (spec.read?.asymptote)
        lines.push(`The asymptote reads ${nf3(asymptoteDb(tf, at))} dB there.`);
    }
    if (gc)
      lines.push(
        `Gain crossover at ${nf3(gc.w)}${fu}: PM = 180° ${bodeAt(tf, gc.w).phase < 0 ? '−' : '+'} ${nf3(Math.abs(bodeAt(tf, gc.w).phase))}° = ${nf3(gc.pm)}°.`,
      );
    if (pc)
      lines.push(
        `Phase crossover (−180°) at ${nf3(pc.w)}${fu}: GM = 1 ÷ ${nf3(1 / pc.gm)} = ${nf3(pc.gm)} (${nf3(pc.gmDb)} dB).`,
      );
    if (cl)
      lines.push(
        `The closed-loop gain ${nf(cl.g)} (${nf3(20 * Math.log10(cl.g))} dB) meets the open-loop line at ${nf(Math.abs(tf.k))} ÷ ${nf(cl.g)} = ${nf3(cl.bw)}${fu}.`,
      );
  }

  if (!tf || !win.value) {
    return (
      <View>
        <Caption>The plot draws once every corner and the gain are known.</Caption>
      </View>
    );
  }
  const W = win.value;
  return (
    <View>
      <Canvas aspect={showPhase ? 0.98 : 0.62}>
        {({ w, h }) => {
          const [L, R, T, B, gap] = [44, 14, 22, 34, 30];
          const x0 = L;
          const x1 = w - R;
          const magH = showPhase ? (h - T - B - gap) * 0.55 : h - T - B;
          const m0 = T;
          const m1 = T + magH;
          const p0 = m1 + gap;
          const p1 = h - B;
          const sx = (f: number) => x0 + ((Math.log10(f) - W.lo) / (W.hi - W.lo)) * (x1 - x0);
          const fx = (x: number) => 10 ** (W.lo + ((x - x0) / (x1 - x0)) * (W.hi - W.lo));
          const [dLo, dHi, dStep] = W.db as [number, number, number];
          const [pLo, pHi, pStep] = W.ph as [number, number, number];
          const sy = (d: number) => m1 - ((d - dLo) / (dHi - dLo)) * (m1 - m0);
          const py = (d: number) => p1 - ((d - pLo) / (pHi - pLo)) * (p1 - p0);
          const clampY = (y: number, a: number, b: number) => Math.max(a, Math.min(b, y));
          const ws = Array.from(
            { length: 301 },
            (_, i) => 10 ** (W.lo + ((W.hi - W.lo) * i) / 300),
          );
          /** A curve in a panel, clipped to it (points past the panel's edge are held on it). */
          const curve = (
            f: (w: number) => number,
            y: (v: number) => number,
            a: number,
            b: number,
          ) =>
            ws
              .map((x, i) => {
                const yy = y(f(x));
                const out = yy < a || yy > b;
                // A run past the edge is not drawn along the edge: the curve stops at it.
                const prev = i ? y(f(ws[i - 1]!)) : yy;
                const prevOut = prev < a || prev > b;
                const op = i && !(out && prevOut) ? 'L' : 'M';
                return `${op} ${sx(x).toFixed(2)} ${clampY(yy, a, b).toFixed(2)}`;
              })
              .join(' ');
          // The panel names keep their room from the corner names.
          const taken: Box[] = [
            boxAt(x0 + 4, m0 - 8, tagWidth('', 'dB'), 'start'),
            boxAt(x0 + 4, p0 - 8, tagWidth('', 'phase (°)'), 'start'),
          ];
          const decades = Array.from({ length: W.hi - W.lo + 1 }, (_, i) => 10 ** (W.lo + i));
          const minors = decades
            .slice(0, -1)
            .flatMap((d) => [2, 3, 4, 5, 6, 7, 8, 9].map((k) => k * d));
          const grid = (a: number, b: number, ticks: number[], y: (v: number) => number) => (
            <G>
              {minors.map((f) => (
                <Line
                  key={`mn${f}`}
                  x1={sx(f)}
                  y1={a}
                  x2={sx(f)}
                  y2={b}
                  stroke={c.chartGrid}
                  strokeWidth={0.6}
                />
              ))}
              {decades.map((f) => (
                <Line
                  key={`mj${f}`}
                  x1={sx(f)}
                  y1={a}
                  x2={sx(f)}
                  y2={b}
                  stroke={c.chartGrid}
                  strokeWidth={1.2}
                />
              ))}
              {ticks.map((v) => (
                <Line
                  key={`h${v}`}
                  x1={x0}
                  y1={y(v)}
                  x2={x1}
                  y2={y(v)}
                  stroke={c.chartGrid}
                  strokeWidth={1}
                />
              ))}
              <Path
                d={`M ${x0} ${a} L ${x0} ${b} L ${x1} ${b}`}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
                fill="none"
              />
            </G>
          );
          const dTicks = linearTicks(dLo, dHi, dStep);
          const pTicks = linearTicks(pLo, pHi, pStep);
          // Corners: a light dotted line through both panels, named or valued at the top.
          const corners = [...tf.poles, ...tf.zeros, ...tf.pairs.map((p) => p.w0)].map((f, i) => ({
            f,
            name: names[i],
          }));
          const cornerTags = corners
            .filter((k) => k.f >= 10 ** W.lo && k.f <= 10 ** W.hi)
            .map((k) => {
              const text = k.name ? '' : `${nf(k.f)}`;
              const at0 = place(
                [
                  { x: sx(k.f), y: m0 - 6, anchor: 'middle' },
                  { x: sx(k.f) + 4, y: m0 - 6, anchor: 'start' },
                  { x: sx(k.f) - 4, y: m0 - 6, anchor: 'end' },
                ],
                tagWidth(k.name ?? '', text),
                taken,
                w,
                h,
              );
              return { ...k, text, at: at0 };
            });
          const atP = at !== undefined ? bodeAt(tf, at) : undefined;
          const atX = at !== undefined ? sx(at) : 0;
          const atIn = at !== undefined && at >= 10 ** W.lo && at <= 10 ** W.hi;
          const pick = (
            spots: { x: number; y: number }[],
            text: string,
            color: string,
            name = '',
          ) => {
            const s = spots.flatMap((p) => [
              { x: p.x + 8, y: p.y, anchor: 'start' as const },
              { x: p.x - 8, y: p.y, anchor: 'end' as const },
            ]);
            return { at: place(s, tagWidth(name, text), taken, w, h), text, color, name };
          };
          const tags: {
            at: ReturnType<typeof place>;
            text: string;
            color: string;
            name: string;
          }[] = [];
          if (atP && atIn) {
            const ym = clampY(sy(atP.db), m0, m1);
            tags.push(
              pick(
                [
                  { x: atX, y: ym - 8 },
                  { x: atX, y: ym + 18 },
                ],
                `${nf3(atP.db)} dB`,
                c.bodeGain,
              ),
            );
            if (showPhase) {
              const yp = clampY(py(atP.phase), p0, p1);
              tags.push(
                pick(
                  [
                    { x: atX, y: yp - 8 },
                    { x: atX, y: yp + 18 },
                  ],
                  `${nf3(atP.phase)}°`,
                  c.bodePhase,
                ),
              );
            }
          }
          if (gc && showPhase) {
            const x = sx(gc.w);
            const y = (py(-180) + py(bodeAt(tf, gc.w).phase)) / 2 + 4;
            tags.push(
              pick(
                [
                  { x, y },
                  { x, y: y + 14 },
                ],
                ` = ${nf3(gc.pm)}°`,
                c.bodeMargin,
                'PM',
              ),
            );
          }
          if (pc) {
            const x = sx(pc.w);
            const y = (sy(0) + clampY(sy(-pc.gmDb), m0, m1)) / 2 + 4;
            tags.push(
              pick(
                [
                  { x, y },
                  { x, y: y + 14 },
                ],
                ` = ${nf3(pc.gmDb)} dB`,
                c.bodeMargin,
                'GM',
              ),
            );
          }
          if (cl) {
            const y = sy(20 * Math.log10(cl.g));
            tags.push(
              pick(
                [
                  { x: x0 + 6, y: y - 6 },
                  { x: x0 + 6, y: y + 16 },
                ],
                `closed loop ${nf(cl.g)}`,
                c.bodeClosed,
              ),
            );
          }
          const vline = (x: number, color: string, dash: string) => (
            <G>
              <Line
                x1={x}
                y1={m0}
                x2={x}
                y2={m1}
                stroke={color}
                strokeWidth={1.2}
                strokeDasharray={dash}
              />
              {showPhase ? (
                <Line
                  x1={x}
                  y1={p0}
                  x2={x}
                  y2={p1}
                  stroke={color}
                  strokeWidth={1.2}
                  strokeDasharray={dash}
                />
              ) : null}
            </G>
          );
          const marginArrow = (x: number, ya: number, yb: number) =>
            Math.abs(yb - ya) > 8 ? (
              <G>
                <Line
                  x1={x}
                  y1={ya}
                  x2={x}
                  y2={yb - Math.sign(yb - ya) * 6}
                  stroke={c.bodeMargin}
                  strokeWidth={chart.stroke}
                />
                <Path d={arrowHead(x, yb, 0, yb - ya, 7)} fill={c.bodeMargin} />
              </G>
            ) : null;
          return (
            <>
              <Svg width={w} height={h}>
                {grid(m0, m1, dTicks, sy)}
                {showPhase ? grid(p0, p1, pTicks, py) : null}
                {dTicks.map((v) => (
                  <Tag
                    key={`dl${v}`}
                    x={x0 - 5}
                    y={Math.min(sy(v) + 4, m1 - 2)}
                    anchor="end"
                    text={nf(v)}
                    chip={false}
                    bold={false}
                    color={c.chartMuted}
                  />
                ))}
                {showPhase
                  ? pTicks.map((v) => (
                      <Tag
                        key={`pl${v}`}
                        x={x0 - 5}
                        y={Math.min(py(v) + 4, p1 - 2)}
                        anchor="end"
                        text={`${nf(v)}°`}
                        chip={false}
                        bold={false}
                        color={c.chartMuted}
                      />
                    ))
                  : null}
                {decades.map((f) => (
                  <Tag
                    key={`xl${f}`}
                    x={sx(f)}
                    y={h - B + 16}
                    anchor="middle"
                    text={decadeText(f)}
                    chip={false}
                    bold={false}
                    color={c.chartMuted}
                  />
                ))}
                <Tag
                  x={x1}
                  y={h - 3}
                  anchor="end"
                  name={fName}
                  text={` (${unit})`}
                  chip={false}
                  bold={false}
                />
                <Tag
                  x={x0 + 4}
                  y={m0 - 8}
                  anchor="start"
                  text="dB"
                  chip={false}
                  bold={false}
                  color={c.bodeGain}
                />
                {showPhase ? (
                  <Tag
                    x={x0 + 4}
                    y={p0 - 8}
                    anchor="start"
                    text="phase (°)"
                    chip={false}
                    bold={false}
                    color={c.bodePhase}
                  />
                ) : null}
                {corners.map((k, i) =>
                  k.f >= 10 ** W.lo && k.f <= 10 ** W.hi ? (
                    <G key={`cn${i}`}>{vline(sx(k.f), c.chartMuted, chart.dashFine)}</G>
                  ) : null,
                )}
                {/* 0 dB and −180°, for a loop's margins. */}
                {gc || pc ? (
                  <Line
                    x1={x0}
                    y1={sy(0)}
                    x2={x1}
                    y2={sy(0)}
                    stroke={c.chartInk}
                    strokeWidth={1.2}
                  />
                ) : null}
                {(gc || pc) && showPhase ? (
                  <Line
                    x1={x0}
                    y1={py(-180)}
                    x2={x1}
                    y2={py(-180)}
                    stroke={c.chartInk}
                    strokeWidth={1.2}
                    strokeDasharray={chart.dash}
                  />
                ) : null}
                {/* Asymptotes dashed, then the curves. */}
                <Path
                  d={curve((x) => asymptoteDb(tf, x), sy, m0, m1)}
                  stroke={c.bodeAsymptote}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dash}
                  fill="none"
                />
                <Path
                  d={curve((x) => bodeAt(tf, x).db, sy, m0, m1)}
                  stroke={c.bodeGain}
                  strokeWidth={chart.strokeHeavy - 0.5}
                  fill="none"
                />
                {showPhase ? (
                  <G>
                    <Path
                      d={curve((x) => asymptotePhase(tf, x), py, p0, p1)}
                      stroke={c.bodeAsymptote}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={chart.dash}
                      fill="none"
                    />
                    <Path
                      d={curve((x) => bodeAt(tf, x).phase, py, p0, p1)}
                      stroke={c.bodePhase}
                      strokeWidth={chart.strokeHeavy - 0.5}
                      fill="none"
                    />
                  </G>
                ) : null}
                {/* The op-amp's closed-loop gain: flat, then down the open-loop line. */}
                {cl ? (
                  <Path
                    d={curve((x) => 20 * Math.log10(cl.g / Math.hypot(1, x / cl.bw)), sy, m0, m1)}
                    stroke={c.bodeClosed}
                    strokeWidth={chart.strokeHeavy - 0.5}
                    fill="none"
                  />
                ) : null}
                {cl ? vline(sx(cl.bw), c.bodeClosed, chart.dash) : null}
                {gc ? (
                  <G>
                    {vline(sx(gc.w), c.bodeMargin, chart.dashFine)}
                    <Circle cx={sx(gc.w)} cy={sy(0)} r={4} fill={c.bodeMargin} />
                    {showPhase ? marginArrow(sx(gc.w), py(-180), py(bodeAt(tf, gc.w).phase)) : null}
                  </G>
                ) : null}
                {pc ? (
                  <G>
                    {vline(sx(pc.w), c.bodeMargin, chart.dashFine)}
                    {showPhase ? (
                      <Circle cx={sx(pc.w)} cy={py(-180)} r={4} fill={c.bodeMargin} />
                    ) : null}
                    {marginArrow(sx(pc.w), clampY(sy(-pc.gmDb), m0, m1), sy(0))}
                  </G>
                ) : null}
                {atP && atIn ? (
                  <G>
                    {vline(atX, c.chartHighlight, chart.dash)}
                    <Circle
                      cx={atX}
                      cy={clampY(sy(atP.db), m0, m1)}
                      r={5}
                      fill={c.chartHighlight}
                    />
                    {showPhase ? (
                      <Circle
                        cx={atX}
                        cy={clampY(py(atP.phase), p0, p1)}
                        r={5}
                        fill={c.chartHighlight}
                      />
                    ) : null}
                  </G>
                ) : null}
                {cornerTags.map((k, i) => (
                  <Tag
                    key={`ct${i}`}
                    {...k.at}
                    name={k.name ?? ''}
                    text={k.text}
                    bold={false}
                    color={c.chartMuted}
                    chip={false}
                  />
                ))}
                {tags.map((t, i) => (
                  <Tag key={`tg${i}`} {...t.at} name={t.name} text={t.text} color={t.color} />
                ))}
              </Svg>
              {!spec.fixed && typeof spec.at === 'string' && atP && atIn ? (
                <DragHandle
                  testID="drag-frequency"
                  x={atX}
                  y={clampY(sy(atP.db), m0, m1)}
                  label={fName}
                  onStart={() => {
                    drag.current = atX;
                    win.freeze();
                  }}
                  onMove={(dx) => {
                    const id = spec.at as string;
                    const x = Math.max(x0, Math.min(x1, drag.current + dx));
                    calc.set(
                      { ...rep.pin(spec.keep ?? []), [id]: rep.snapTo(id, fx(x)) },
                      rep.slide(id),
                    );
                  }}
                  onEnd={win.release}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      {lines.length ? <Caption>{lines.join(' · ')}</Caption> : null}
    </View>
  );
}
