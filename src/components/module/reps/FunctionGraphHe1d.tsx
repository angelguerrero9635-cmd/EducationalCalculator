/**
 * College pictures, round 1, group D: `functionGraph` drawn on its own axes.
 * - HC4 (`family: 'response'`): a first-order response or ramp (`transient`) and a second-order
 *   step response or free decay (`stepResponse`) against time, the input step above on its own
 *   axis, the marks the pages read (τ to 5τ, 63.2%, the peak, the ±2% band, T_s, the decay
 *   ratio, t½) and the page's time as a point dragged along the curve.
 * - HC9 (`scale`, `invertY`, `swap`, `family: 'gradation'`): see `FunctionGraphScaledHe1d`.
 * Flat, every colour a theme token; a value still "?" draws nothing for itself.
 */
import { useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { FunctionGraphSpec, NumOrVar } from '@/data/modules/typesFunctionGraph';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import {
  firstOrder,
  fitTimes,
  freeDecay,
  envelope,
  linearTicks,
  niceEnd,
  secondOrder,
  stepFor,
} from './functionGraphHe1dMath';
import { FunctionGraphScaledHe1d } from './FunctionGraphScaledHe1d';
import { fig3, Ital, textW } from './he1dText';

const MINUS = '−';

/** Draws a time response (HC4), or a graph on log or flipped axes (HC9). */
export function FunctionGraphHe1d({ spec, calc }: { spec: FunctionGraphSpec; calc: Calculator }) {
  return spec.family === 'response' ? (
    <TimeResponse spec={spec} calc={calc} />
  ) : (
    <FunctionGraphScaledHe1d spec={spec} calc={calc} />
  );
}

/** A coefficient as a formula writes it: none for 1. */
const coef = (k: number) => (fig3(k) === '1' ? '' : fig3(k));

interface Mark {
  t: number;
  label: string;
}
interface Pt {
  t: number;
  y: number;
  label?: string;
  ring?: boolean;
  /** Where the label goes from the point. */
  side?: 'above' | 'below' | 'right' | 'left';
}

/** What a response draws, in formula units (converted to the shown units when drawn). */
interface Model {
  curve?: (t: number) => number;
  second?: { f: (t: number) => number; label: string };
  /** The window's right end, at least. */
  tEnd: number;
  /** Values the y range must hold. */
  ys: number[];
  final?: { y: number; label: string };
  band?: [number, number];
  envelope?: [(t: number) => number, (t: number) => number];
  guides: number[];
  marks: Mark[];
  points: Pt[];
  bracket?: { t0: number; t1: number; y: number; label: string };
  error?: { t: number; y0: number; y1: number; label: string };
  dot?: { t: number; y: number; label: string };
  captions: string[];
}

function TimeResponse({ spec, calc }: { spec: FunctionGraphSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const frozen = useFrozen<{ tEnd: number; y: [number, number] } | undefined>(undefined);
  const drawn = useRef<{ tEnd: number; y: [number, number] } | undefined>(undefined);
  const start = useRef(0);

  /** A field's value in formula units, or undefined while it is "?". */
  const num = (v: NumOrVar | undefined): number | undefined =>
    v === undefined ? undefined : typeof v === 'number' ? v : rep.known(v) ? rep.val(v) : undefined;
  const firstId = (...xs: (NumOrVar | string | undefined)[]) =>
    xs.find((x): x is string => typeof x === 'string');
  const tr = spec.transient;
  const sr = spec.stepResponse;
  // The time axis takes the shown unit of the first time value the page names.
  const tId = tr
    ? firstId(tr.time, tr.tau, tr.deadTime, tr.second?.tau)
    : firstId(sr?.time, sr?.peak, sr?.settling, sr?.period, sr?.halfLife);
  let tf = tId ? rep.factor(tId) : 1;
  const wnUnit = typeof sr?.wn === 'string' ? rep.unit(sr.wn) : undefined;
  let tUnit = tId ? rep.unit(tId) : wnUnit?.match(/\/\s*([a-z]+)$/)?.[1];
  // A fast circuit with no time value of its own reads its axis in ms, not 0.0002 s.
  const wn0 = sr ? num(sr.wn) : undefined;
  if (!tId && tUnit === 's' && wn0 !== undefined && wn0 > 0 && 10 / wn0 < 0.05) {
    tf = 0.001;
    tUnit = 'ms';
  }
  const yId = tr ? firstId(tr.value, tr.final, tr.initial) : firstId(sr?.value, sr?.gain);
  const yf = yId ? rep.factor(yId) : 1;
  const yUnit = yId ? rep.unit(yId) : undefined;
  const name = spec.name ?? (yId ? rep.variable(yId).symbol : tr ? 'x' : 'y');
  const tName = spec.input ?? 't';
  /** A value as the page shows it (its box's text) or, worked out here, to 3 figures. */
  const tText = (t: number, id?: NumOrVar) =>
    typeof id === 'string' && rep.known(id)
      ? rep.value(id)
      : `${fig3(t / tf)}${tUnit ? ` ${tUnit}` : ''}`;
  const yText = (y: number, id?: NumOrVar) =>
    typeof id === 'string' && rep.known(id)
      ? rep.value(id)
      : `${fig3(y / yf)}${yUnit ? `${yUnit === '%' ? '' : ' '}${yUnit}` : ''}`;

  const inp = spec.stepInput;
  const inSize = inp ? (num(inp.size) ?? (inp.size === undefined ? 1 : undefined)) : undefined;
  const model = tr ? transientModel() : sr ? stepModel() : undefined;

  // The time point's id when it can be dragged along the curve.
  const timeId =
    typeof (tr?.time ?? sr?.time) === 'string' ? ((tr?.time ?? sr?.time) as string) : undefined;
  const draggable =
    !!timeId && !spec.fixed && rep.known(timeId) && calc.status(timeId) !== 'derived';

  if (!model) return null;
  const live = (): { tEnd: number; y: [number, number] } => {
    const tEnd = niceEnd(model.tEnd / tf) * tf;
    const ys = [...model.ys, ...(inSize !== undefined ? [inSize] : [])];
    if (model.curve) for (let i = 0; i <= 200; i++) ys.push(model.curve((tEnd * i) / 200));
    if (model.second) for (let i = 0; i <= 100; i++) ys.push(model.second.f((tEnd * i) / 100));
    if (model.envelope) ys.push(model.envelope[0](0), model.envelope[1](0));
    const fin = ys.filter(Number.isFinite).map((y) => y / yf);
    let lo = Math.min(0, ...fin);
    let hi = Math.max(0, ...fin);
    if (hi - lo < 1e-12) hi = lo + 1;
    const st = stepFor(hi - lo, 5);
    lo = Math.floor(lo / st - 1e-9) * st;
    hi = Math.ceil(hi / st + 0.12 - 1e-9) * st;
    return { tEnd, y: [lo, hi] };
  };

  const yName = spec.axes?.y ?? `${name}${yUnit ? ` (${yUnit})` : ''}`;
  const tAxis = spec.axes?.x ?? `Time ${tName}${tUnit ? ` (${tUnit})` : ''}`;
  const inH = inp ? 58 : 0;
  const rowH = model.marks.length ? 16 : 0;

  return (
    <View>
      <Canvas aspect={(w) => (inH + 22 + w * 0.58 + 18 + rowH + 22) / w}>
        {({ w, h }) => {
          const win = frozen.value ?? live();
          drawn.current = win;
          const yTicks = linearTicks(win.y[0], win.y[1], stepFor(win.y[1] - win.y[0], 5));
          const tStep = stepFor(win.tEnd / tf, 6);
          const tTicks = linearTicks(0, win.tEnd / tf, tStep);
          const yLab = yTicks.map((v) => formatNumber(Number(v.toPrecision(10))));
          const L = Math.max(30, Math.max(...yLab.map((s) => textW(s, chart.label))) + 12);
          const R = 16;
          const pw = w - L - R;
          const top = inH + 22;
          const bottom = h - 22 - rowH - 18;
          const ph = bottom - top;
          const sx = (t: number) => L + (t / tf / (win.tEnd / tf)) * pw;
          const sy = (y: number) => top + ((win.y[1] - y / yf) / (win.y[1] - win.y[0])) * ph;
          const clampY = (p: number) => Math.max(top - 2, Math.min(bottom + 2, p));
          const path = (f: (t: number) => number, n = Math.max(240, Math.round(pw * 1.5))) => {
            let d = '';
            for (let i = 0; i <= n; i++) {
              const t = (win.tEnd * i) / n;
              const y = f(t);
              if (!Number.isFinite(y)) continue;
              d += `${d ? 'L' : 'M'} ${sx(t).toFixed(2)} ${clampY(sy(y)).toFixed(2)} `;
            }
            return d;
          };
          const inWin = (t: number) => t >= -1e-9 && t <= win.tEnd * (1 + 1e-9);
          const nodes: ReactNode[] = [];

          // The input step on its own axis above.
          if (inp) {
            const iy0 = 40;
            const iy1 = 14;
            nodes.push(
              <G key="input">
                <Line x1={L} x2={L + pw} y1={iy0} y2={iy0} stroke={c.chartGrid} strokeWidth={1} />
                {inSize !== undefined ? (
                  <Path
                    d={`M ${L - 8} ${iy0} L ${L} ${iy0} L ${L} ${iy1} L ${L + pw} ${iy1}`}
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                    fill="none"
                  />
                ) : null}
                <ChartText x={L + 6} y={iy1 - 3} fontSize={chart.label} fill={c.chartMuted}>
                  <Ital
                    text={`Input ${inp.name ?? 'u'}${
                      inSize !== undefined
                        ? ` = ${typeof inp.size === 'string' ? rep.value(inp.size) : fig3(inSize)}`
                        : ' = ?'
                    }, a step at ${tName} = 0`}
                  />
                </ChartText>
              </G>,
            );
          }

          // Grid, frame and numbers.
          nodes.push(
            <G key="grid">
              {tTicks.map((v) => (
                <Line
                  key={`gx${v}`}
                  x1={sx(v * tf)}
                  x2={sx(v * tf)}
                  y1={top}
                  y2={bottom}
                  stroke={c.chartGrid}
                  strokeWidth={1}
                />
              ))}
              {yTicks.map((v) => (
                <Line
                  key={`gy${v}`}
                  x1={L}
                  x2={L + pw}
                  y1={sy(v * yf)}
                  y2={sy(v * yf)}
                  stroke={c.chartGrid}
                  strokeWidth={1}
                />
              ))}
              <Rect
                x={L}
                y={top}
                width={pw}
                height={ph}
                fill="none"
                stroke={c.chartGrid}
                strokeWidth={1}
              />
              {win.y[0] <= 0 && win.y[1] >= 0 ? (
                <Line
                  x1={L}
                  x2={L + pw}
                  y1={sy(0)}
                  y2={sy(0)}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
              ) : null}
              <Line
                x1={L}
                x2={L}
                y1={top}
                y2={bottom}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              {tTicks.map((v) => (
                <ChartText
                  key={`nx${v}`}
                  x={sx(v * tf)}
                  y={bottom + 14}
                  fontSize={chart.label}
                  fill={c.chartMuted}
                  textAnchor="middle"
                >
                  {formatNumber(v)}
                </ChartText>
              ))}
              {yTicks.map((v, i) => (
                <ChartText
                  key={`ny${v}`}
                  x={L - 5}
                  y={sy(v * yf) + 4}
                  fontSize={chart.label}
                  fill={c.chartMuted}
                  textAnchor="end"
                >
                  {yLab[i]}
                </ChartText>
              ))}
              <ChartText x={L} y={top - 8} fontSize={chart.label} fill={c.chartInk}>
                <Ital text={yName} size={chart.label} />
              </ChartText>
              <ChartText
                x={L + pw / 2}
                y={h - 6}
                fontSize={chart.label}
                fill={c.chartInk}
                textAnchor="middle"
              >
                <Ital text={tAxis} size={chart.label} />
              </ChartText>
            </G>,
          );

          // The ±2% band, the envelope and the guides.
          if (model.band) {
            const [a, b] = [sy(model.band[1]), sy(model.band[0])];
            nodes.push(
              <G key="band">
                <Rect x={L} y={a} width={pw} height={Math.max(1, b - a)} fill={c.chartFill} />
                <Line
                  x1={L}
                  x2={L + pw}
                  y1={a}
                  y2={a}
                  stroke={c.chartMuted}
                  strokeWidth={1}
                  strokeDasharray={chart.dashFine}
                />
                <Line
                  x1={L}
                  x2={L + pw}
                  y1={b}
                  y2={b}
                  stroke={c.chartMuted}
                  strokeWidth={1}
                  strokeDasharray={chart.dashFine}
                />
                <ChartText
                  x={L + pw - 3}
                  y={b + 12}
                  fontSize={chart.label}
                  fill={c.chartMuted}
                  textAnchor="end"
                  halo
                >
                  ±2% band
                </ChartText>
              </G>,
            );
          }
          if (model.envelope)
            model.envelope.forEach((f, i) =>
              nodes.push(
                <Path
                  key={`env${i}`}
                  d={path(f)}
                  stroke={c.chartMuted}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dash}
                  fill="none"
                />,
              ),
            );
          model.guides
            .filter(inWin)
            .forEach((t, i) =>
              nodes.push(
                <Line
                  key={`gd${i}`}
                  x1={sx(t)}
                  x2={sx(t)}
                  y1={top}
                  y2={bottom}
                  stroke={c.chartMuted}
                  strokeWidth={1}
                  strokeDasharray={chart.dashFine}
                />,
              ),
            );
          if (model.final) {
            const fy = sy(model.final.y);
            nodes.push(
              <G key="final">
                <Line
                  x1={L}
                  x2={L + pw}
                  y1={fy}
                  y2={fy}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dash}
                />
                {/* Under the line where the e_ss bracket stands over it (its label is there). */}
                <ChartText
                  x={L + pw - 3}
                  y={
                    model.error && sy(model.error.y1) < fy - 1 && sy(model.error.y0) <= fy + 1
                      ? fy + 14
                      : fy - 5
                  }
                  fontSize={chart.label}
                  fill={c.chartInk}
                  textAnchor="end"
                  halo
                >
                  <Ital text={model.final.label} />
                </ChartText>
              </G>,
            );
          }
          if (model.second)
            nodes.push(
              <G key="second">
                <Path
                  d={path(model.second.f)}
                  stroke={c.fnSecond}
                  strokeWidth={chart.stroke}
                  strokeDasharray={chart.dash}
                  fill="none"
                />
                <ChartText
                  x={L + pw * 0.62}
                  y={
                    clampY(sy(model.second.f(win.tEnd * 0.62))) +
                    (model.second.f(win.tEnd * 0.62) > (model.curve?.(win.tEnd * 0.62) ?? 0)
                      ? -7
                      : 15)
                  }
                  fontSize={chart.label}
                  fill={c.fnSecond}
                  halo
                >
                  {model.second.label}
                </ChartText>
              </G>,
            );
          if (model.curve)
            nodes.push(
              <Path
                key="curve"
                d={path(model.curve)}
                stroke={c.chartHighlight}
                strokeWidth={chart.strokeHeavy - 0.5}
                fill="none"
              />,
            );
          if (model.error) {
            const e = model.error;
            const [a, b] = [sy(e.y0), sy(e.y1)];
            const x = sx(e.t);
            nodes.push(
              <G key="err">
                <Line
                  x1={x}
                  x2={x}
                  y1={a}
                  y2={b}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <Line
                  x1={x - 4}
                  x2={x + 4}
                  y1={a}
                  y2={a}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <Line
                  x1={x - 4}
                  x2={x + 4}
                  y1={b}
                  y2={b}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <ChartText
                  x={x - 6}
                  y={(a + b) / 2 + 4}
                  fontSize={chart.label}
                  fill={c.chartInk}
                  textAnchor="end"
                  halo
                >
                  <Ital text={e.label} />
                </ChartText>
              </G>,
            );
          }
          if (model.bracket) {
            const b = model.bracket;
            const [x0, x1, y] = [sx(b.t0), sx(b.t1), clampY(sy(b.y)) - 8];
            nodes.push(
              <G key="bracket">
                <Line x1={x0} x2={x1} y1={y} y2={y} stroke={c.chartInk} strokeWidth={1} />
                <Line x1={x0} x2={x0} y1={y - 4} y2={y + 4} stroke={c.chartInk} strokeWidth={1} />
                <Line x1={x1} x2={x1} y1={y - 4} y2={y + 4} stroke={c.chartInk} strokeWidth={1} />
                <ChartText
                  x={(x0 + x1) / 2}
                  y={y - 4}
                  fontSize={chart.label}
                  fill={c.chartInk}
                  textAnchor="middle"
                  halo
                >
                  <Ital text={b.label} />
                </ChartText>
              </G>,
            );
          }
          model.points
            .filter((p) => inWin(p.t))
            .forEach((p, i) => {
              const [px, py] = [sx(p.t), sy(p.y)];
              const side = p.side ?? 'below';
              const lx = side === 'right' ? px + 8 : side === 'left' ? px - 8 : px;
              const anchor = side === 'right' ? 'start' : side === 'left' ? 'end' : 'middle';
              const ly = side === 'above' ? py - 9 : side === 'below' ? py + 17 : py + 4;
              const fit = Math.min(
                L + pw - 2 - (anchor === 'middle' ? textW(p.label ?? '', chart.label) / 2 : 0),
                Math.max(
                  L + 2 + (anchor === 'middle' ? textW(p.label ?? '', chart.label) / 2 : 0),
                  lx,
                ),
              );
              nodes.push(
                <G key={`pt${i}`}>
                  <Circle
                    cx={px}
                    cy={py}
                    r={p.ring ? 5 : 4}
                    fill={p.ring ? c.background : c.chartInk}
                    stroke={c.chartInk}
                    strokeWidth={p.ring ? chart.strokeLight : 0}
                  />
                  {p.label ? (
                    <ChartText
                      x={fit}
                      y={ly}
                      fontSize={chart.label}
                      fill={c.chartInk}
                      textAnchor={anchor}
                      halo
                    >
                      <Ital text={p.label} />
                    </ChartText>
                  ) : null}
                </G>,
              );
            });
          // The marks row under the time numbers (τ, 2τ … or Tₚ, Tₛ).
          if (model.marks.length) {
            const placed: [number, number][] = [];
            model.marks
              .filter((m) => inWin(m.t))
              .forEach((m, i) => {
                const x = sx(m.t);
                const half = textW(m.label, chart.label) / 2 + 2;
                if (placed.some(([a, b]) => x + half > a && x - half < b)) return;
                placed.push([x - half, x + half]);
                nodes.push(
                  <ChartText
                    key={`mk${i}`}
                    x={x}
                    y={bottom + 30}
                    fontSize={chart.label}
                    fill={c.chartHighlight}
                    textAnchor="middle"
                  >
                    <Ital text={m.label} />
                  </ChartText>,
                );
              });
          }
          const dot = model.dot && inWin(model.dot.t) ? model.dot : undefined;
          if (dot) {
            const [px, py] = [sx(dot.t), sy(dot.y)];
            const wide = textW(dot.label, chart.value);
            // The label goes where the curve isn't: below-right of a rising curve, above-right
            // of a falling one (else the opposite corner), inside the plot.
            const dt = win.tEnd * 0.01;
            const f = model.curve;
            const slope = f
              ? sy(f(Math.min(win.tEnd, dot.t + dt))) - sy(f(Math.max(0, dot.t - dt)))
              : 0;
            const corners: [boolean, boolean][] =
              slope < -0.5
                ? [
                    [true, false],
                    [false, true],
                  ]
                : [
                    [true, true],
                    [false, false],
                  ];
            const fits = ([r, up]: [boolean, boolean]) =>
              (r ? px + 12 + wide < L + pw : px - 12 - wide > L) &&
              (up ? py - 24 > top : py + 24 < bottom);
            const pick = corners.find(fits);
            const right = pick ? pick[0] : px + 12 + wide < L + pw;
            const labelY = pick ? (pick[1] ? py - 10 : py + 22) : py > top + 30 ? py - 10 : py + 22;
            nodes.push(
              <G key="dot">
                <Line
                  x1={px}
                  x2={px}
                  y1={py}
                  y2={bottom}
                  stroke={c.chartHighlight}
                  strokeWidth={1}
                  strokeDasharray={chart.dashFine}
                />
                <Circle cx={px} cy={py} r={5.5} fill={c.chartHighlight} />
                <ChartText
                  x={right ? px + 12 : px - 12}
                  y={labelY}
                  fontSize={chart.value}
                  fill={c.chartHighlight}
                  fontWeight="600"
                  textAnchor={right ? 'start' : 'end'}
                  halo
                >
                  <Ital text={dot.label} size={chart.value} />
                </ChartText>
              </G>,
            );
          }
          const unitPx = pw / win.tEnd;
          return (
            <>
              <Svg width={w} height={h}>
                {nodes}
              </Svg>
              {dot && draggable ? (
                <DragHandle
                  testID="drag-time"
                  x={sx(dot.t)}
                  y={sy(dot.y)}
                  label="the time on the curve"
                  onStart={() => {
                    start.current = dot.t;
                    frozen.freezeAt(drawn.current);
                  }}
                  onMove={(dx) => {
                    const id = timeId!;
                    const t = Math.max(0, Math.min(win.tEnd, start.current + dx / unitPx));
                    const keep = spec.keep ?? holdIds().filter((x) => x !== id);
                    calc.set({ ...rep.pinTyped(keep), [id]: rep.snapTo(id, t) }, rep.slide(id));
                  }}
                  onEnd={frozen.release}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{model.captions.join(' · ')}</Caption>
    </View>
  );

  /** The values held while the time point is dragged: every other typed value the spec names. */
  function holdIds(): string[] {
    const xs: (NumOrVar | undefined)[] = tr
      ? [tr.initial, tr.final, tr.tau, tr.rate, tr.deadTime, tr.second?.final, tr.second?.tau]
      : [sr?.wn, sr?.zeta, sr?.alpha, sr?.gain];
    return xs.filter((x): x is string => typeof x === 'string');
  }

  function transientModel(): Model {
    const t = tr!;
    const x0 = num(t.initial);
    const xf = num(t.final);
    const tau = num(t.tau);
    const theta = num(t.deadTime) ?? 0;
    const time = num(t.time);
    const ramp = t.tau === undefined;
    const m: Model = { tEnd: 1, ys: [], guides: [], marks: [], points: [], captions: [] };
    const say = (v: NumOrVar | undefined, x: number | undefined, isTime = false) =>
      x === undefined ? '?' : isTime ? tText(x, v) : yText(x, v);
    if (ramp) {
      // An integrator: x₀ then a straight line, by its rate or through the page's point.
      const val = num(t.value);
      const rate =
        num(t.rate) ??
        (x0 !== undefined && val !== undefined && time !== undefined && time > 0
          ? (val - x0) / time
          : undefined);
      m.tEnd = time !== undefined && time > 0 ? time * 1.5 : 1;
      if (x0 !== undefined) m.ys.push(x0);
      if (x0 !== undefined && rate !== undefined) {
        m.curve = (s) => x0 + rate * s;
        m.captions.push(
          `${name}(${tName}) = ${say(t.initial, x0)} ${rate < 0 ? MINUS : '+'} ${fig3(Math.abs(rate) * (tf / yf))}${yUnit ? ` ${yUnit}` : ''} per ${tUnit ?? 'unit of time'} × ${tName}: a ramp while the input is constant`,
        );
      } else m.captions.push(`Type ${name}₀ and the rate to draw the ramp.`);
      if (m.curve && time !== undefined) {
        const y = m.curve(time);
        m.dot = { t: time, y, label: `${name} = ${say(t.value, y)}` };
        m.captions.push(`At ${tName} = ${say(t.time, time, true)}: ${name} = ${say(t.value, y)}.`);
      }
      return m;
    }
    m.tEnd = Math.max(theta + 5 * (tau ?? 1), time !== undefined ? time * 1.15 : 0);
    if (x0 !== undefined) m.ys.push(x0);
    if (xf !== undefined) {
      m.ys.push(xf);
      m.final = { y: xf, label: `final ${say(t.final, xf)}` };
    }
    if (tau !== undefined && tau > 0) {
      for (let k = 1; k <= 5; k++) {
        m.guides.push(theta + k * tau);
        m.marks.push({ t: theta + k * tau, label: k === 1 ? 'τ' : `${k}τ` });
      }
      if (theta > 0) m.marks.unshift({ t: theta, label: 'θ' });
    }
    if (x0 === undefined || xf === undefined || tau === undefined || !(tau > 0)) {
      m.captions.push(`Type ${name}₀, the final value and τ to draw the response.`);
      return m;
    }
    m.curve = firstOrder(x0, xf, tau, theta);
    const tauText = say(t.tau, tau, true);
    const inner = theta > 0 ? `(${tName} ${MINUS} θ)` : tName;
    m.captions.push(
      x0 === 0
        ? `${name}(${tName}) = ${coef(xf / yf)}(1 ${MINUS} exp(${MINUS}${inner}/τ)), τ = ${tauText}`
        : xf === 0
          ? `${name}(${tName}) = ${coef(x0 / yf)}exp(${MINUS}${inner}/τ), τ = ${tauText}`
          : `${name}(${tName}) = ${fig3(xf / yf)} + (${fig3(x0 / yf)} ${MINUS} ${fig3(xf / yf)})exp(${MINUS}${inner}/τ), τ = ${tauText}`,
    );
    if (theta > 0)
      m.captions.push(`Dead time θ = ${say(t.deadTime, theta, true)}: nothing moves until then.`);
    const at63 = m.curve(theta + tau);
    const fit = t.points ? fitTimes(tau, theta) : undefined;
    const pts = typeof t.points === 'object' ? t.points : undefined;
    m.points.push({
      t: theta + tau,
      y: at63,
      ring: true,
      label: fit ? `63.2% at ${say(pts?.t63, fit.t63, true)}` : '63.2%',
      side: xf > x0 ? 'right' : 'right',
    });
    if (fit) {
      m.points.push({
        t: fit.t28,
        y: m.curve(fit.t28),
        ring: true,
        label: `28.3% at ${say(pts?.t28, fit.t28, true)}`,
        side: 'right',
      });
      m.captions.push(`τ = 1.5(t₆₃ ${MINUS} t₂₈) and θ = t₆₃ ${MINUS} τ.`);
    }
    m.captions.push(
      `After ${theta > 0 ? 'θ + ' : ''}τ the response has made 63.2% of its change; after 5τ, 99.3%.`,
    );
    if (t.second) {
      const s0 = num(t.second.initial) ?? x0;
      const sf = num(t.second.final);
      const st = num(t.second.tau);
      if (sf !== undefined && st !== undefined && st > 0) {
        m.second = { f: firstOrder(s0, sf, st, theta), label: t.second.label ?? 'second' };
        m.ys.push(sf);
      }
    }
    if (time !== undefined) {
      const y = m.curve(time);
      m.dot = { t: time, y, label: `${name} = ${say(t.value, y)}` };
      m.captions.push(`At ${tName} = ${say(t.time, time, true)}: ${name} = ${say(t.value, y)}.`);
    }
    errorMark(m, xf);
    return m;
  }

  /** The steady-state error bracket between the input's size and the final value. */
  function errorMark(m: Model, final: number | undefined) {
    if (!spec.error || inSize === undefined || final === undefined) return;
    const e = num(spec.error);
    m.ys.push(inSize);
    m.error = {
      t: m.tEnd * 0.9,
      y0: final,
      y1: inSize,
      label: `eₛₛ = ${e !== undefined ? rep.value(spec.error) : fig3((inSize - final) / yf)}`,
    };
  }

  function stepModel(): Model {
    const s = sr!;
    const wn = num(s.wn);
    const alpha = num(s.alpha);
    const zeta = num(s.zeta) ?? (alpha !== undefined && wn ? alpha / wn : undefined);
    const k = s.gain === undefined ? 1 : num(s.gain);
    const time = num(s.time);
    const m: Model = { tEnd: 1, ys: [], guides: [], marks: [], points: [], captions: [] };
    if (wn === undefined || !(wn > 0) || zeta === undefined || !(zeta >= 0) || k === undefined) {
      m.captions.push('Type ωₙ and ζ to draw the response.');
      return m;
    }
    const so = secondOrder(zeta, wn);
    const ts = num(s.settling) ?? so.ts;
    const oscillation = s.mode === 'oscillation';
    const zText = typeof s.zeta === 'string' ? rep.value(s.zeta) : fig3(zeta);
    const wText = typeof s.wn === 'string' ? rep.value(s.wn) : fig3(wn);
    if (oscillation) {
      const f = freeDecay(so, k);
      const env = envelope(so, k);
      const half = num(s.halfLife) ?? so.halfLife;
      m.curve = f;
      m.envelope = [env, (t) => -env(t)];
      m.tEnd = Math.max(
        zeta > 0 ? Math.min(3 * so.halfLife, 40 / wn) : 0,
        (so.period ?? 0) * 2.5,
        time !== undefined ? time * 1.15 : 0,
      );
      m.ys.push(k, -k);
      if (zeta > 0) {
        m.points.push({
          t: half,
          y: env(half),
          ring: true,
          label: `half: t½ = ${tText(half, s.halfLife)}`,
          side: 'above',
        });
        m.guides.push(half);
        m.marks.push({ t: half, label: 't½' });
      }
      if (so.period !== undefined) {
        const per = num(s.period) ?? so.period;
        m.bracket = { t0: 0, t1: per, y: k, label: `period ${tText(per, s.period)}` };
      }
      m.captions.push(
        `A free decay inside the envelope ±${coef(k / yf)}exp(${MINUS}ζωₙ${tName}): ζ = ${zText}, ωₙ = ${wText}`,
      );
      if (zeta > 0)
        m.captions.push(
          `The envelope halves every t½ = ln 2 ÷ (ζωₙ) = ${tText(half, s.halfLife)}.`,
        );
    } else {
      const f = (t: number) => k * so.step(t);
      m.curve = f;
      m.band = [k * 0.98, k * 1.02];
      m.final = {
        y: k,
        label: `final ${typeof s.gain === 'string' ? rep.value(s.gain) : fig3(k / yf)}`,
      };
      if (zeta < 1)
        m.envelope = [
          (t) => k * (1 + Math.exp(-so.sigma * t) / Math.sqrt(1 - zeta * zeta)),
          (t) => k * (1 - Math.exp(-so.sigma * t) / Math.sqrt(1 - zeta * zeta)),
        ];
      const slow = zeta > 1 ? 4 / (wn * (zeta - Math.sqrt(zeta * zeta - 1))) : ts;
      m.tEnd = Math.max(
        zeta > 0 ? Math.min(slow * 1.3, 60 / wn) : 0,
        so.period !== undefined ? so.period * (s.decay || s.period ? 2.2 : 1.6) : 0,
        time !== undefined ? time * 1.15 : 0,
      );
      m.envelope = zeta > 0 && zeta < 1 ? m.envelope : undefined;
      m.ys.push(k * (1 + so.os) * 1.04);
      if (zeta < 1 && so.tp !== undefined) {
        const tp = num(s.peak) ?? so.tp;
        const os = so.os;
        const osText =
          typeof s.overshoot === 'string' && rep.known(s.overshoot)
            ? rep.value(s.overshoot)
            : `${fig3(os * 100)}%`;
        m.points.push({ t: tp, y: f(so.tp), label: `peak: OS = ${osText}`, side: 'above' });
        m.guides.push(tp);
        m.marks.push({ t: tp, label: 'Tₚ' });
        if (s.decay || s.period) {
          const t2 = so.tp + so.period!;
          m.points.push({
            t: t2,
            y: f(t2),
            ring: true,
            label: s.decay
              ? `decay ratio ${typeof s.decay === 'string' && rep.known(s.decay) ? rep.value(s.decay) : fig3(so.decay!)}`
              : undefined,
            side: 'above',
          });
        }
        if (s.period) {
          const per = num(s.period) ?? so.period!;
          m.bracket = {
            t0: so.tp,
            t1: so.tp + per,
            y: f(so.tp) + k * so.os * 0.35 + k * 0.06,
            label: `P = ${tText(per, s.period)}`,
          };
        }
        m.captions.push(
          `Peak ${fig3(((1 + os) * k) / yf)} at Tₚ = π ÷ ω_d = ${tText(tp, s.peak)}: OS = exp(${MINUS}ζπ/√(1 ${MINUS} ζ²)) = ${osText}`,
        );
      }
      if (zeta > 0) {
        m.guides.push(ts);
        m.marks.push({ t: ts, label: 'Tₛ' });
        m.captions.push(
          `Tₛ = 4 ÷ (ζωₙ) = ${tText(ts, s.settling)}: the envelope enters the ±2% band.`,
        );
      }
      m.captions.unshift(
        `${zeta < 1 ? (zeta === 0 ? 'Undamped' : 'Underdamped') : zeta === 1 ? 'Critically damped' : 'Overdamped'} step response: ζ = ${zText}, ωₙ = ${wText}`,
      );
      errorMark(m, k);
    }
    if (time !== undefined && m.curve) {
      const y = m.curve(time);
      const nm = spec.name ?? (typeof s.value === 'string' ? rep.variable(s.value).symbol : 'y');
      m.dot = {
        t: time,
        y,
        label: `${nm} = ${typeof s.value === 'string' && rep.known(s.value) ? rep.value(s.value) : fig3(y / yf)}`,
      };
    }
    return m;
  }
}
