/**
 * The college options of `chemDiagram` mode `rate` (HC34; C-P7, ACC-P32), flat like a graph:
 *
 * - `integrated`: [A] against t from (0, [A]₀) with the half-lives dropped to the time axis and
 *   the point at t; under it (orders 1 and 2) the straight-line plot, ln [A] or 1/[A] against t,
 *   with its slope ∓k.
 * - `arrhenius`: ln k against 1/T through the two readings, the run and rise, slope −Eₐ ÷ R.
 * - `consecutive`: A → B → C, the three concentrations against t, B's peak at t_max, the values
 *   at t, and their sum [A]₀ dotted.
 *
 * The math is in `rateHe2kMath.ts` (the harness and the demos use it too).
 */
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { ChemRateHe2kSpec } from '@/data/modules/typesHe2k';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { reader } from './graphKit';
import { fig3, textW } from './he1dText';
import { niceStep } from './hsdGrid';
import { url, usePaintIds } from './paint';
import {
  arrheniusEa,
  consecutive,
  halfLife,
  integratedConc,
  linearForm,
  linearSlope,
  peakConc,
  peakTime,
  runOut,
  timeToFraction,
  type RateOrder,
} from './rateHe2kMath';

type Read = ReturnType<typeof reader>;
type Palette = ReturnType<typeof usePalette>;

/** One plot's box in px and its window in values. */
interface Panel {
  left: number;
  right: number;
  top: number;
  bottom: number;
  xLo: number;
  xHi: number;
  yLo: number;
  yHi: number;
}

const frameOf = (p: Panel) => ({
  X: (x: number) => p.left + ((x - p.xLo) / (p.xHi - p.xLo)) * (p.right - p.left),
  Y: (y: number) => p.bottom - ((y - p.yLo) / (p.yHi - p.yLo)) * (p.bottom - p.top),
});

/** A 1, 2 or 5 × 10ⁿ step at least x (a hair under, so 0.3 ÷ 3 is 0.1, not 0.2). */
const nice = (x: number) => niceStep(x * (1 - 1e-9));

/** The end of a time axis from 0: `hi` rounded up to a whole tick. */
function niceEnd(hi: number): number {
  const step = nice(hi / 5);
  return Math.ceil(hi / step - 1e-9) * step;
}

/** The top of a concentration axis: a little over [A]₀, on a quarter-step of it. */
function topOf(A0: number): number {
  const step = nice(A0 / 4);
  return Math.ceil((1.06 * A0) / step - 1e-9) * step;
}

/** Nice ticks across [lo, hi], about `n` of them. */
function ticksOf(lo: number, hi: number, n = 4): number[] {
  const step = nice((hi - lo) / n);
  const out: number[] = [];
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step)
    out.push(Number(v.toPrecision(10)));
  return out;
}

/** A window [lo, hi] rounded out to its ticks, holding every value with a margin. */
function windowOf(values: number[], pad = 0.08, fromZero = false): [number, number] {
  let lo = Math.min(...values);
  let hi = Math.max(...values);
  if (fromZero) lo = Math.min(0, lo);
  if (hi - lo < 1e-12) [lo, hi] = [lo - 1, hi + 1];
  const span = hi - lo;
  const step = nice((span * (1 + 2 * pad)) / 5);
  const a = fromZero && lo >= 0 ? lo : Math.floor((lo - span * pad) / step) * step;
  return [a, Math.ceil((hi + span * pad) / step - 1e-9) * step];
}

/** Axes, grid, tick numbers and the y name of one panel. */
function Axes({
  p,
  c,
  yName,
  numbers = true,
  xFormat = formatNumber,
}: {
  p: Panel;
  c: Palette;
  yName: string;
  numbers?: boolean;
  xFormat?: (x: number) => string;
}) {
  const { X, Y } = frameOf(p);
  const xs = numbers ? ticksOf(p.xLo, p.xHi, 5) : [];
  const ys = numbers ? ticksOf(p.yLo, p.yHi, 3) : [];
  return (
    <G>
      {ys.map((y) => (
        <G key={`y${y}`}>
          <Line x1={p.left} y1={Y(y)} x2={p.right} y2={Y(y)} stroke={c.chartGrid} strokeWidth={1} />
          <ChartText
            x={p.left - 5}
            y={Y(y) + 4}
            textAnchor="end"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            {formatNumber(y)}
          </ChartText>
        </G>
      ))}
      {xs.map((x) => (
        <G key={`x${x}`}>
          <Line x1={X(x)} y1={p.bottom} x2={X(x)} y2={p.bottom + 4} stroke={c.chartInk} />
          <ChartText
            x={X(x)}
            y={p.bottom + 17}
            textAnchor="middle"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            {xFormat(x)}
          </ChartText>
        </G>
      ))}
      <Line
        x1={p.left}
        y1={p.top}
        x2={p.left}
        y2={p.bottom}
        stroke={c.chartInk}
        strokeWidth={1.2}
      />
      <Line
        x1={p.left}
        y1={p.bottom}
        x2={p.right}
        y2={p.bottom}
        stroke={c.chartInk}
        strokeWidth={1.2}
      />
      <ChartText x={4} y={p.top - 9} fontSize={chart.label} fill={c.chartMuted}>
        {yName}
      </ChartText>
    </G>
  );
}

/** A curve y(x) across the panel, as a path (points outside the window are dropped). */
function curvePath(p: Panel, f: (x: number) => number, from = p.xLo, to = p.xHi, n = 120) {
  const { X, Y } = frameOf(p);
  const d: string[] = [];
  for (let i = 0; i <= n; i++) {
    const x = from + ((to - from) * i) / n;
    const y = f(x);
    if (!Number.isFinite(y)) continue;
    d.push(`${d.length ? 'L' : 'M'} ${X(x).toFixed(2)} ${Y(y).toFixed(2)}`);
  }
  return d.join(' ');
}

/** The concentration names and units a page's notation writes. */
function naming(notation: ChemRateHe2kSpec['notation'], unit: string) {
  const c = notation === 'C';
  return {
    of: (s: string) => (c ? `C_${s}` : `[${s}]`),
    start: (s: string) => (c ? `C_${s}0` : `[${s}]₀`),
    inverse: unit === 'M' ? 'M⁻¹' : unit === 'mol/L' ? 'L/mol' : `1/${unit}`,
    unit,
  };
}

/** The unit a value is in: its variable's, or a fallback for a fixed number. */
const unitOf = (rep: ReturnType<typeof useRep>, v: string | number | undefined, or: string) =>
  (typeof v === 'string' && rep.unit(v)) || or;

export function ChemRateHe2k({ spec, calc }: { spec: ChemRateHe2kSpec; calc: Calculator }) {
  if (spec.integrated) return <Integrated spec={spec} calc={calc} />;
  if (spec.arrhenius) return <Arrhenius spec={spec} calc={calc} />;
  return <Consecutive spec={spec} calc={calc} />;
}

// ─── integrated ──────────────────────────────────────────────────────────────

function Integrated({ spec, calc }: { spec: ChemRateHe2kSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read: Read = reader(rep);
  const ids = usePaintIds('top', 'low');
  const s = spec.integrated!;
  const order: RateOrder = s.order;
  const kR = read(s.k);
  const aR = read(s.start);
  const tR = s.t === undefined ? undefined : read(s.t);
  const tUnit = unitOf(rep, s.t, 's');
  const cUnit = unitOf(rep, s.start, 'M');
  const kUnit = unitOf(rep, s.k, order === 0 ? `${cUnit}/${tUnit}` : `${tUnit}⁻¹`);
  const n = naming(spec.notation, cUnit);
  const sp = spec.species ?? 'A';
  const name = n.of(sp);
  const ready = kR.known && aR.known && kR.value > 0 && aR.value > 0;
  const k = kR.value;
  const A0 = aR.value;
  const hasT = !!tR?.known && tR.value >= 0;
  const t = hasT ? tR!.value : 0;
  const tEnd = order === 0 ? runOut(k, A0) : Infinity;
  const ranOut = order === 0 && hasT && t > tEnd * (1 + 1e-9);
  const conc = (x: number) => {
    const a = integratedConc(order, k, A0, x);
    return order === 0 ? Math.max(0, a) : a;
  };
  const half = ready ? halfLife(order, k, A0) : NaN;
  // The window: three half-lives (order 0: past the time it runs out) and the page's t.
  const reach = order === 0 ? 1.15 * tEnd : 1.1 * timeToFraction(order, k, A0, order === 1 ? 3 : 2);
  const xHi = ready ? niceEnd(Math.max(reach, hasT ? 1.08 * t : 0)) : 10;
  const two = order !== 0;
  const H = two ? 400 : 246;

  const art = (w: number) => {
    const left = 52;
    const right = w - 22;
    const top: Panel = {
      left,
      right,
      top: 26,
      bottom: two ? 196 : 206,
      xLo: 0,
      xHi,
      yLo: 0,
      yHi: ready ? topOf(A0) : 1,
    };
    const F = frameOf(top);
    const lit = c.chartHighlight;
    // Half-lives dropped to the axis: the times [A] reaches [A]₀ ÷ 2, ÷ 4, ÷ 8 (order 0: ÷ 2).
    const marks = ready
      ? [1, 2, 3]
          .filter((i) => order !== 0 || i === 1)
          .map((i) => ({ i, at: timeToFraction(order, k, A0, i), a: A0 / 2 ** i }))
          .filter((m) => m.at <= xHi * 0.96)
      : [];
    const markName = (i: number) =>
      order === 1
        ? i === 1
          ? 't½'
          : `${i}t½`
        : order === 2
          ? `${2 ** i - 1}t½`.replace(/^1t/, 't')
          : 't½';
    // The label sits right of its drop line, just above the axis, when there is room.
    const room = (j: number) =>
      (j + 1 < marks.length ? F.X(marks[j + 1]!.at) : right) - F.X(marks[j]!.at) >
      textW(markName(marks[j]!.i), chart.label) + 8;
    const chip =
      hasT && ready ? `t = ${tR!.text} ${tUnit}: ${name} = ${fig3(conc(t))} ${cUnit}` : '';
    const chipAt = fitLabel(right, chip, chart.label, w, 'end');

    const low: Panel | undefined =
      two && ready
        ? (() => {
            const ends = [linearForm(order, A0), linearForm(order, conc(xHi))];
            const [yLo, yHi] = windowOf(ends, 0.1);
            return { left, right, top: 236, bottom: 360, xLo: 0, xHi, yLo, yHi };
          })()
        : undefined;
    const slope = linearSlope(order, k);
    const slopeText = `slope = ${order === 2 ? '+' : '−'}k = ${fig3(slope)} ${kUnit}`;
    return (
      <Svg width={w} height={H}>
        <Defs>
          <ClipPath id={ids.top}>
            <Rect x={left} y={top.top} width={right - left} height={top.bottom - top.top} />
          </ClipPath>
          {low ? (
            <ClipPath id={ids.low}>
              <Rect x={left} y={low.top} width={right - left} height={low.bottom - low.top} />
            </ClipPath>
          ) : null}
        </Defs>
        <Axes p={top} c={c} yName={`${name} (${cUnit})`} numbers={ready} />
        {ready ? (
          <G>
            <G clipPath={url(ids.top)}>
              {marks.map((m) => (
                <Path
                  key={m.i}
                  d={`M ${left} ${F.Y(m.a)} H ${F.X(m.at)} V ${top.bottom}`}
                  stroke={c.chartMuted}
                  strokeWidth={1.2}
                  strokeDasharray={chart.dashFine}
                  fill="none"
                />
              ))}
              {order === 0 ? (
                <Path
                  d={`M ${F.X(tEnd)} ${top.bottom} V ${top.top}`}
                  stroke={c.chartSecond}
                  strokeWidth={1.4}
                  strokeDasharray={chart.dash}
                />
              ) : null}
              <Path
                d={curvePath(top, conc)}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
                fill="none"
              />
            </G>
            {marks.map((m, j) =>
              room(j) ? (
                <ChartText
                  key={m.i}
                  x={F.X(m.at) + 4}
                  y={top.bottom - 5}
                  fontSize={chart.label}
                  fontWeight="700"
                  fill={c.chartMuted}
                >
                  {markName(m.i)}
                </ChartText>
              ) : null,
            )}
            {order === 0
              ? (() => {
                  // Right of the dashed line when it fits, else left of it.
                  const fits = F.X(tEnd) + 4 + textW('runs out', chart.label) < right;
                  return (
                    <ChartText
                      x={F.X(tEnd) + (fits ? 4 : -4)}
                      y={top.top + 30}
                      textAnchor={fits ? 'start' : 'end'}
                      fontSize={chart.label}
                      fontWeight="700"
                      fill={c.chartMuted}
                    >
                      runs out
                    </ChartText>
                  );
                })()
              : null}
            <Circle cx={F.X(0)} cy={F.Y(A0)} r={4} fill={c.chartInk} />
            {hasT ? (
              <Circle
                cx={F.X(t)}
                cy={F.Y(conc(t))}
                r={5}
                fill={lit}
                stroke={c.paper}
                strokeWidth={1.2}
                opacity={ranOut ? 0.4 : 1}
              />
            ) : null}
            {chip ? (
              <ChartText
                x={chipAt.x}
                y={top.top - 9}
                textAnchor={chipAt.textAnchor}
                fontSize={chart.label}
                fontWeight="700"
                fill={lit}
                halo
              >
                {chip}
              </ChartText>
            ) : null}
          </G>
        ) : null}
        {low ? (
          <G>
            <Axes p={low} c={c} yName={order === 1 ? `ln ${name}` : `1/${name} (${n.inverse})`} />
            <G clipPath={url(ids.low)}>
              <Path
                d={curvePath(low, (x) => linearForm(order, conc(x)), 0, xHi, 2)}
                stroke={lit}
                strokeWidth={chart.stroke}
                fill="none"
              />
            </G>
            <Circle cx={left} cy={frameOf(low).Y(linearForm(order, A0))} r={4} fill={c.chartInk} />
            {hasT ? (
              <Circle
                cx={frameOf(low).X(t)}
                cy={frameOf(low).Y(linearForm(order, conc(t)))}
                r={5}
                fill={lit}
                stroke={c.paper}
                strokeWidth={1.2}
              />
            ) : null}
            {(() => {
              // The slope's name in the corner the line leaves empty.
              const at = fitLabel(right, slopeText, chart.label, w, 'end');
              return (
                <ChartText
                  x={at.x}
                  y={low.top - 9}
                  textAnchor={at.textAnchor}
                  fontSize={chart.label}
                  fontWeight="700"
                  fill={lit}
                  halo
                >
                  {slopeText}
                </ChartText>
              );
            })()}
          </G>
        ) : null}
        <ChartText
          x={(left + right) / 2}
          y={H - 8}
          textAnchor="middle"
          fontSize={chart.label}
          fill={c.chartMuted}
        >
          {`Time t (${tUnit})`}
        </ChartText>
      </Svg>
    );
  };

  const k3 = `${fig3(k)} ${kUnit}`;
  const law =
    order === 0
      ? `${name} = ${n.start(sp)} − kt`
      : order === 1
        ? `ln ${name} = ln ${n.start(sp)} − kt`
        : `1/${name} = 1/${n.start(sp)} + kt`;
  const halfText =
    order === 0
      ? `t½ = ${n.start(sp)} ÷ (2k) = ${fig3(half)} ${tUnit}; it runs out at ${n.start(sp)} ÷ k = ${fig3(tEnd)} ${tUnit}`
      : order === 1
        ? `t½ = ln 2 ÷ k = ${fig3(half)} ${tUnit}, the same each time (first order)`
        : `t½ = 1 ÷ (k${n.start(sp)}) = ${fig3(half)} ${tUnit}, and each half-life is twice the last`;
  const caption = !ready
    ? kR.known && aR.known
      ? `k and ${n.start(sp)} must both be more than 0 to draw the curve.`
      : `Type k and ${n.start(sp)} to draw ${name} against t.`
    : [
        `Order ${order}: ${law}, with k = ${k3} and ${n.start(sp)} = ${aR.text} ${cUnit}.`,
        `${halfText}.`,
        ranOut
          ? `At t = ${tR!.text} ${tUnit}, kt is more than ${n.start(sp)}: the reactant ran out at ${fig3(tEnd)} ${tUnit}, so ${name} = 0.`
          : hasT
            ? `At t = ${tR!.text} ${tUnit}, ${name} = ${fig3(conc(t))} ${cUnit}.`
            : '',
        order === 0
          ? `${name} against t is itself the straight line, slope −k.`
          : `The ${order === 1 ? `ln ${name}` : `1/${name}`} plot is straight with slope ${order === 1 ? '−k' : '+k'}: the test for order ${order}.`,
      ]
        .filter(Boolean)
        .join(' · ');
  return (
    <View>
      <Canvas aspect={(w) => H / w}>{({ w }) => art(w)}</Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}

// ─── arrhenius ───────────────────────────────────────────────────────────────

function Arrhenius({ spec, calc }: { spec: ChemRateHe2kSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read: Read = reader(rep);
  const ids = usePaintIds('plot');
  const s = spec.arrhenius!;
  const [k1, T1, k2, T2] = [read(s.k1), read(s.T1), read(s.k2), read(s.T2)];
  const R = s.R === undefined ? 8.314 : read(s.R).value;
  const kUnit = unitOf(rep, s.k1, 's⁻¹');
  const tUnitName = unitOf(rep, s.T1, 'K');
  const kelvin = (x: number) => (tUnitName === '°C' ? x + 273.15 : x);
  const eUnit = unitOf(rep, s.Ea, 'kJ/mol');
  const typed = [k1, T1, k2, T2].every((r) => r.known);
  const ok =
    typed &&
    k1.value > 0 &&
    k2.value > 0 &&
    kelvin(T1.value) > 0 &&
    kelvin(T2.value) > 0 &&
    Math.abs(kelvin(T1.value) - kelvin(T2.value)) > 1e-9;
  const pts = ok
    ? [
        { x: 1000 / kelvin(T1.value), y: Math.log(k1.value), name: '1', T: T1.text },
        { x: 1000 / kelvin(T2.value), y: Math.log(k2.value), name: '2', T: T2.text },
      ]
    : [];
  const Ea = ok ? arrheniusEa(k1.value, kelvin(T1.value), k2.value, kelvin(T2.value), R) : NaN;
  const slope = ok ? (pts[1]!.y - pts[0]!.y) / (pts[1]!.x - pts[0]!.x) : NaN;
  const H = 286;

  const art = (w: number) => {
    const left = 52;
    const right = w - 22;
    const xw = ok
      ? windowOf(
          pts.map((p) => p.x),
          0.3,
        )
      : [3, 4];
    const yw = ok
      ? windowOf(
          pts.map((p) => p.y),
          0.3,
        )
      : [0, 1];
    const p: Panel = {
      left,
      right,
      top: 26,
      bottom: 236,
      xLo: xw[0]!,
      xHi: xw[1]!,
      yLo: yw[0]!,
      yHi: yw[1]!,
    };
    const F = frameOf(p);
    const lit = c.chartHighlight;
    const [hi, lo] = ok ? [...pts].sort((a, b) => a.x - b.x) : [];
    const line = (x: number) => pts[0]!.y + slope * (x - pts[0]!.x);
    const chip = ok ? `slope = −Eₐ/R = ${fig3(slope * 1000)} K` : '';
    return (
      <Svg width={w} height={H}>
        <Defs>
          <ClipPath id={ids.plot}>
            <Rect x={left} y={p.top} width={right - left} height={p.bottom - p.top} />
          </ClipPath>
        </Defs>
        <Axes p={p} c={c} yName={`ln k (k in ${kUnit})`} numbers={ok} />
        {ok ? (
          <G>
            <Path
              d={curvePath(p, line, p.xLo, p.xHi, 2)}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
              fill="none"
              clipPath={url(ids.plot)}
            />
            {/* Run and rise between the readings. */}
            <Path
              d={`M ${F.X(hi!.x)} ${F.Y(hi!.y)} H ${F.X(lo!.x)} V ${F.Y(lo!.y)}`}
              stroke={c.chartSecond}
              strokeWidth={1.6}
              strokeDasharray={chart.dash}
              fill="none"
            />
            {pts.map((q) => (
              <Circle
                key={q.name}
                cx={F.X(q.x)}
                cy={F.Y(q.y)}
                r={5}
                fill={lit}
                stroke={c.paper}
                strokeWidth={1.2}
              />
            ))}
            {/* The hotter reading (left, high) named above-right, the cooler below-left. */}
            {[hi!, lo!].map((q, i) => {
              const text = `T_${q.name} = ${q.T} ${tUnitName}`;
              const at = fitLabel(
                F.X(q.x) + (i ? -8 : 8),
                text,
                chart.label,
                w,
                i ? 'end' : 'start',
                8,
              );
              return (
                <ChartText
                  key={q.name}
                  x={at.x}
                  y={F.Y(q.y) + (i ? 20 : -10)}
                  textAnchor={at.textAnchor}
                  fontSize={chart.label}
                  fontWeight="700"
                  halo
                >
                  {text}
                </ChartText>
              );
            })}
            <ChartText
              x={left + 6}
              y={p.bottom - 8}
              fontSize={chart.label}
              fontWeight="700"
              fill={lit}
              halo
            >
              {chip}
            </ChartText>
          </G>
        ) : null}
        <ChartText
          x={(left + right) / 2}
          y={H - 8}
          textAnchor="middle"
          fontSize={chart.label}
          fill={c.chartMuted}
        >
          1000 ÷ T (K⁻¹)
        </ChartText>
      </Svg>
    );
  };

  const EaShown = ok ? `${fig3(eUnit === 'J/mol' ? Ea : Ea / 1000)} ${eUnit}` : '?';
  const caption = ok
    ? [
        `ln k against 1/T is straight: ln k = ln A − Eₐ/(RT).`,
        `Its slope through the two readings is ln(k₂ ÷ k₁) ÷ (1/T₂ − 1/T₁) = ${fig3(slope * 1000)} K${tUnitName === '°C' ? ' (T in K: °C + 273.15)' : ''}.`,
        `Eₐ = −R × slope = ${formatNumber(R)} J/(mol·K) × ${fig3(-slope * 1000)} K = ${EaShown}.`,
      ].join(' · ')
    : typed
      ? 'The two readings need rate constants above 0 and two different temperatures.'
      : 'Type both readings (k and T) to draw the line through them.';
  return (
    <View>
      <Canvas aspect={(w) => H / w}>{({ w }) => art(w)}</Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}

// ─── consecutive ─────────────────────────────────────────────────────────────

function Consecutive({ spec, calc }: { spec: ChemRateHe2kSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read: Read = reader(rep);
  const ids = usePaintIds('plot');
  const s = spec.consecutive!;
  const [r1, r2, ra] = [read(s.k1), read(s.k2), read(s.start)];
  const tR = s.t === undefined ? undefined : read(s.t);
  const tUnit = unitOf(rep, s.t ?? s.tmax, 's');
  const cUnit = unitOf(rep, s.start, 'M');
  const kUnit = unitOf(rep, s.k1, `${tUnit}⁻¹`);
  const n = naming(spec.notation, cUnit);
  const [sa, sb, sc] = s.species ?? ['A', 'B', 'C'];
  const ready = r1.known && r2.known && ra.known && r1.value > 0 && r2.value > 0 && ra.value > 0;
  const [k1, k2, A0] = [r1.value, r2.value, ra.value];
  const hasT = !!tR?.known && tR.value >= 0;
  const t = hasT ? tR!.value : 0;
  const tm = ready ? peakTime(k1, k2) : NaN;
  const Bm = ready ? peakConc(k1, k2, A0) : NaN;
  const same = ready && Math.abs(k1 - k2) < 1e-9 * Math.max(k1, k2);
  // The window: until A → C is mostly done (C past 90 %) and the page's t.
  let reach = 3 * tm;
  if (ready)
    for (let x = tm; x < 200 * tm; x *= 1.15)
      if (consecutive(k1, k2, A0, x).C > 0.9 * A0) {
        reach = x;
        break;
      }
  const xHi = ready ? niceEnd(Math.max(reach, hasT ? 1.08 * t : 0)) : 10;
  const H = 300;
  const at = (x: number) => consecutive(k1, k2, A0, x);

  const art = (w: number) => {
    const left = 52;
    const right = w - 22;
    const p: Panel = {
      left,
      right,
      top: 26,
      bottom: 252,
      xLo: 0,
      xHi,
      yLo: 0,
      yHi: ready ? topOf(A0) : 1,
    };
    const F = frameOf(p);
    const lit = c.chartHighlight;
    const v = hasT ? at(t) : undefined;
    // Labels: A where it has fallen a sixth, B over its peak, C near the right end, below it.
    const tA = Math.log(1.2) / k1;
    const endC = at(xHi * 0.97).C;
    // B's label over its peak names the time of the peak too.
    const labelB = `${n.of(sb!)} peaks, tₘₐₓ = ${fig3(tm)} ${tUnit}`;
    const half = textW(labelB, chart.label) / 2 + 4;
    let px = F.X(tm);
    // Off the dashed t line: beside it, on the peak's side.
    if (hasT && Math.abs(F.X(t) - px) < half)
      px = F.X(t) < px ? F.X(t) + 4 + half : F.X(t) - 4 - half;
    const peakLabel = { x: Math.min(right - half, Math.max(left + half, px)) };
    const tLabel = hasT ? `t = ${tR!.text} ${tUnit}` : '';
    const tAt = fitLabel(F.X(t), tLabel, chart.label, w, 'middle');
    return (
      <Svg width={w} height={H}>
        <Defs>
          <ClipPath id={ids.plot}>
            <Rect x={left} y={p.top - 2} width={right - left} height={p.bottom - p.top + 2} />
          </ClipPath>
        </Defs>
        <Axes
          p={p}
          c={c}
          yName={`${spec.notation === 'C' ? 'C' : 'Concentration'} (${cUnit})`}
          numbers={ready}
        />
        {ready ? (
          <G>
            <G clipPath={url(ids.plot)}>
              {/* The sum, [A]₀ at every t. */}
              <Line
                x1={left}
                y1={F.Y(A0)}
                x2={right}
                y2={F.Y(A0)}
                stroke={c.chartMuted}
                strokeWidth={1.2}
                strokeDasharray="1.5 3.5"
              />
              <Path
                d={`M ${F.X(tm)} ${p.bottom} V ${F.Y(Bm)}`}
                stroke={c.chartMuted}
                strokeWidth={1.2}
                strokeDasharray={chart.dashFine}
              />
              <Path
                d={curvePath(p, (x) => at(x).A)}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
                fill="none"
              />
              <Path
                d={curvePath(p, (x) => at(x).C)}
                stroke={c.chartSecond}
                strokeWidth={chart.stroke}
                strokeDasharray={chart.dash}
                fill="none"
              />
              <Path
                d={curvePath(p, (x) => at(x).B)}
                stroke={lit}
                strokeWidth={chart.strokeHeavy}
                fill="none"
              />
              {hasT ? (
                <Line
                  x1={F.X(t)}
                  y1={p.top + 18}
                  x2={F.X(t)}
                  y2={p.bottom}
                  stroke={c.chartInk}
                  strokeWidth={1}
                  strokeDasharray={chart.dash}
                />
              ) : null}
            </G>
            <Circle cx={F.X(tm)} cy={F.Y(Bm)} r={5} fill={lit} stroke={c.paper} strokeWidth={1.2} />
            {v
              ? [v.A, v.B, v.C].map((y, i) => (
                  <Circle
                    key={i}
                    cx={F.X(t)}
                    cy={F.Y(y)}
                    r={4}
                    fill={[c.chartInk, lit, c.chartSecond][i]}
                    stroke={c.paper}
                    strokeWidth={1.2}
                  />
                ))
              : null}
            <ChartText
              x={Math.min(F.X(tA) + 7, right - 30)}
              y={F.Y(at(tA).A) - 7}
              fontSize={chart.label}
              fontWeight="700"
              halo
            >
              {n.of(sa!)}
            </ChartText>
            <ChartText
              x={peakLabel.x}
              y={F.Y(Bm) - 10}
              textAnchor="middle"
              fontSize={chart.label}
              fontWeight="700"
              fill={lit}
              halo
            >
              {labelB}
            </ChartText>
            <ChartText
              x={right - 4}
              y={F.Y(endC) + 17}
              textAnchor="end"
              fontSize={chart.label}
              fontWeight="700"
              fill={c.chartInk}
              halo
            >
              {`${n.of(sc!)} (dashed)`}
            </ChartText>
            {hasT ? (
              <ChartText
                x={tAt.x}
                y={p.top + 12}
                textAnchor="middle"
                fontSize={chart.label}
                fontWeight="700"
                halo
              >
                {tLabel}
              </ChartText>
            ) : null}
          </G>
        ) : null}
        <ChartText
          x={(left + right) / 2}
          y={H - 8}
          textAnchor="middle"
          fontSize={chart.label}
          fill={c.chartMuted}
        >
          {`Time t (${tUnit})`}
        </ChartText>
      </Svg>
    );
  };

  const v = ready && hasT ? at(t) : undefined;
  const [A, B, C] = [n.of(sa!), n.of(sb!), n.of(sc!)];
  const caption = !ready
    ? r1.known && r2.known && ra.known
      ? 'Both rate constants and the starting concentration must be more than 0.'
      : `Type k₁, k₂ and ${n.start(sa!)} to draw ${sa} → ${sb} → ${sc}.`
    : [
        `${sa} → ${sb} → ${sc} with k₁ = ${r1.text} ${kUnit} and k₂ = ${r2.text} ${kUnit}, from ${n.start(sa!)} = ${ra.text} ${cUnit}.`,
        v
          ? `At t = ${tR!.text} ${tUnit}: ${A} = ${fig3(v.A)}, ${B} = ${fig3(v.B)}, ${C} = ${fig3(v.C)} ${cUnit}, which add to ${fig3(A0)}.`
          : `${A} + ${B} + ${C} = ${n.start(sa!)} at every t (the dotted line).`,
        same
          ? `With k₁ = k₂, ${sb} peaks at t = 1/k = ${fig3(tm)} ${tUnit}, ${B} = ${fig3(Bm)} ${cUnit}.`
          : `${sb} peaks at tₘₐₓ = ln(k₁ ÷ k₂) ÷ (k₁ − k₂) = ${fig3(tm)} ${tUnit}, ${B} = ${fig3(Bm)} ${cUnit}.`,
      ].join(' · ');
  return (
    <View>
      <Canvas aspect={(w) => H / w}>{({ w }) => art(w)}</Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}
