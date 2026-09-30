import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { MotionGraphSpec } from '@/data/modules/typesMechanics';
import type { MotionKinematics } from '@/data/modules/typesHsk';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import { Chip, makeFrame, type Frame } from './graphKit';
import { HsdGrid, niceStep } from './hsdGrid';
import { numOrVar, sig, spanWindow, Vec, withUnit, zeroWindow } from './hskKit';

type SpeedSpec = Extract<MotionGraphSpec, { graph: 'speed' }>;

/** Height of the strobe diagram above the graph: one row, or two when the object turns round. */
const strobeHeight = (rows: number) => (rows === 2 ? 84 : 66);
/** Width of a vertical strobe column left of the graph (H102). */
const SIDE = 66;

/** A signed number in brackets when negative, for substituting into a formula: (−9.8). */
const par = (text: string) => (text.startsWith('−') ? `(${text})` : text);

/**
 * High-school kinematics (H58): a velocity–time graph with the signed displacement shaded
 * (above the axis +, below −), or a position–time curve with its tangent at t₁ (slope = the
 * velocity then), under a strobe motion diagram: the position at equal times with a velocity
 * arrow on each dot. Drag the end time, the start velocity and the slope, or the tangent point.
 */
export function MotionGraphHs({
  spec,
  k,
  calc,
}: {
  spec: SpeedSpec;
  k: MotionKinematics;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const drag = useRef({ t: 0, a: 0, v0: 0, t1: 0 });
  const sym = (id: string) => rep.variable(id).symbol;
  // Physics in formula units (m, s, m/s), labelled in them, whatever units the boxes show.
  const unitOf = (id: string) => rep.variable(id).unit;

  const si = (x: number | string | undefined, d = 0) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const t = Math.max(0, rep.val(spec.time));
  // H105: a number acceleration (free fall's −9.8 m/s²) is drawn but never a value.
  const aId = typeof spec.acceleration === 'string' ? spec.acceleration : undefined;
  const a = aId ? rep.val(aId) : (spec.acceleration as number);
  const v0r = numOrVar(rep, spec.start, 0);
  const v0 = si(spec.start);
  const v = rep.known(spec.speed) ? rep.val(spec.speed) : v0 + a * t;
  const x0 = si(k.position);
  const xAt = (s: number) => x0 + v0 * s + (a * s * s) / 2;
  const vAt = (s: number) => v0 + a * s;
  const all =
    rep.known(spec.time) && (!aId || rep.known(aId)) && v0r.known && rep.known(spec.speed);
  // Where the velocity passes through 0 inside the trip: the object turns round.
  const tc = a !== 0 ? -v0 / a : NaN;
  const turns = tc > 1e-9 && tc < t - 1e-9;
  const position = k.view === 'position';
  const t1 = position && k.at ? Math.max(0, rep.val(k.at)) : t;
  const v1 = position && k.slope && rep.known(k.slope) ? rep.val(k.slope) : vAt(t1);
  // The curve runs to the later of the trip's end and the tangent's time.
  const tEnd = Math.max(t, t1);

  // Units and names.
  const tU = unitOf(spec.time);
  const vU = unitOf(spec.speed);
  const xU = spec.distance ? unitOf(spec.distance) : vU?.split('/')[0];
  const xName = spec.distance ? 'x' : 'x';

  // The strobe: positions at equal times (at most 12 steps), a second row after the turn.
  const dt = t > 0 ? niceStep(t / 10) : 1;
  const steps = t > 0 ? Math.floor(t / dt + 1e-9) : 0;
  const shots = Array.from({ length: steps + 1 }, (_, i) => i * dt);
  const rows = turns && shots.some((s) => s > tc + 1e-9) ? 2 : 1;
  // A vertical strobe (H102) stands in a column left of the graph instead of above it.
  const vertical = k.strobe === 'vertical';
  const showStrobe = k.strobe !== false && !vertical;
  const top = showStrobe ? strobeHeight(rows) : 0;
  const side = vertical ? SIDE + (rows - 1) * 18 : 0;

  // Windows (frozen during a drag so the grid does not rescale under the finger).
  const live = (() => {
    if (!position) return { x: zeroWindow(t), y: spanWindow([v0, v]) };
    const tx = zeroWindow(Math.max(t, t1));
    const ys = [x0, xAt(tEnd)];
    if (tc > 0 && tc < tEnd) ys.push(xAt(tc));
    return { x: tx, y: spanWindow(ys) };
  })();
  const win = useFrozen(live);

  // Displacement as signed areas.
  const areas = turns ? [(v0 * tc) / 2, (v * (t - tc)) / 2] : [((v0 + v) / 2) * t];
  const dx = areas.reduce((s, x) => s + x, 0);
  const travelled = areas.reduce((s, x) => s + Math.abs(x), 0);

  const others = (id: string) =>
    rep.pin(
      [
        spec.time,
        ...(aId ? [aId] : []),
        ...(typeof spec.start === 'string' ? [spec.start] : []),
      ].filter((x) => x !== id),
    );

  return (
    <View>
      <Canvas aspect={(w) => (top + Math.min((vertical ? 0.8 : 0.66) * w, 300)) / w}>
        {({ w, h }) => {
          const base = makeFrame(
            w - side,
            h - top,
            [win.value.x.lo, win.value.x.hi],
            [win.value.y.lo, win.value.y.hi],
            false,
            true,
          );
          const f: Frame = {
            ...base,
            sx: (x) => side + base.sx(x),
            sy: (y) => top + base.sy(y),
            w,
            h,
          };
          const names = {
            x: withUnit(sym(spec.time), tU ? `(${tU})` : undefined),
            y: position
              ? withUnit(xName, xU ? `(${xU})` : undefined)
              : withUnit(sym(spec.speed), vU ? `(${vU})` : undefined),
          };
          return (
            <>
              <Svg width={w} height={h}>
                {showStrobe ? strobe(w) : null}
                {vertical ? strobeColumn(h) : null}
                <HsdGrid f={f} step={{ x: win.value.x.step, y: win.value.y.step }} names={names} />
                {position ? positionView(f, w, h) : velocityView(f, w, h)}
              </Svg>
              {k.fixed ? null : handles(f)}
            </>
          );
        }}
      </Canvas>
      <Caption>{captionLines().join(' · ')}</Caption>
    </View>
  );

  /** The strobe diagram: a track with the position at each step and a velocity arrow per dot. */
  function strobe(w: number) {
    const xs = shots.map(xAt);
    let lo = Math.min(...xs, x0);
    let hi = Math.max(...xs, x0);
    if (hi - lo < 1e-9) [lo, hi] = [lo - 1, hi + 1];
    const [sl, sr] = [26, w - 26];
    const px = (x: number) => sl + ((x - lo) / (hi - lo)) * (sr - sl);
    const vmax = Math.max(1e-9, ...shots.map((s) => Math.abs(vAt(s))));
    const rowY = (r: number) => 34 + r * 18;
    const trackY = rowY(rows - 1) + 10;
    const marks = [lo, hi, ...(lo < -1e-9 && hi > 1e-9 ? [0] : [])];
    return (
      <G opacity={all ? 1 : 0.4}>
        <ChartText x={sl} y={14} fontSize={chart.label} fill={c.chartMuted}>
          {`Every ${withUnit(sig(dt), tU)}: where it is, and its velocity`}
        </ChartText>
        <Line x1={sl} y1={trackY} x2={sr} y2={trackY} stroke={c.chartGrid} strokeWidth={2} />
        {marks.map((m, i) => (
          <G key={i}>
            <Line x1={px(m)} y1={trackY - 4} x2={px(m)} y2={trackY + 4} stroke={c.chartMuted} />
            <ChartText
              x={px(m)}
              y={trackY + 16}
              fontSize={chart.label}
              fill={c.chartMuted}
              textAnchor={i === 0 ? 'start' : i === 1 ? 'end' : 'middle'}
            >
              {withUnit(sig(m), xU)}
            </ChartText>
          </G>
        ))}
        {shots.map((s, i) => {
          const r = turns && s > tc + 1e-9 ? rows - 1 : 0;
          const cx = px(xAt(s));
          const cy = rowY(r);
          const len = (22 * vAt(s)) / vmax;
          return (
            <G key={i}>
              <Vec
                x1={cx}
                y1={cy - 9}
                x2={cx + len}
                y2={cy - 9}
                color={c.chartInk}
                width={1.75}
                head={6}
              />
              <Circle
                cx={cx}
                cy={cy}
                r={4.5}
                fill={i === 0 ? c.card : c.chartHighlight}
                stroke={c.chartHighlight}
                strokeWidth={1.5}
              />
            </G>
          );
        })}
      </G>
    );
  }

  /**
   * The strobe stood up (H102): a column left of the graph, + up, the position at each step
   * and a velocity arrow beside each dot; after a turn, a second column.
   */
  function strobeColumn(h: number) {
    const xs = shots.map(xAt);
    let lo = Math.min(...xs, x0);
    let hi = Math.max(...xs, x0);
    if (hi - lo < 1e-9) [lo, hi] = [lo - 1, hi + 1];
    const [st, sb] = [56, h - 44];
    const py = (x: number) => st + ((hi - x) / (hi - lo)) * (sb - st);
    const vmax = Math.max(1e-9, ...shots.map((s) => Math.abs(vAt(s))));
    const colX = (r: number) => 22 + r * 18;
    const trackX = colX(rows - 1) + 12;
    const marks = [hi, lo, ...(lo < -1e-9 && hi > 1e-9 ? [0] : [])];
    return (
      <G opacity={all ? 1 : 0.4}>
        <ChartText x={4} y={14} fontSize={chart.label} fill={c.chartMuted}>
          Every
        </ChartText>
        <ChartText x={4} y={29} fontSize={chart.label} fill={c.chartMuted}>
          {withUnit(sig(dt), tU)}
        </ChartText>
        <Line x1={trackX} y1={st} x2={trackX} y2={sb} stroke={c.chartGrid} strokeWidth={2} />
        {marks.map((m, i) => (
          <G key={i}>
            <Line x1={trackX - 4} y1={py(m)} x2={trackX + 4} y2={py(m)} stroke={c.chartMuted} />
            {i < 2 ? (
              <ChartText
                x={4}
                y={i === 0 ? py(m) - 7 : h - 8}
                fontSize={chart.label}
                fill={c.chartMuted}
              >
                {withUnit(sig(m), xU)}
              </ChartText>
            ) : null}
          </G>
        ))}
        {shots.map((s, i) => {
          const r = turns && s > tc + 1e-9 ? rows - 1 : 0;
          const cx = colX(r);
          const cy = py(xAt(s));
          const len = (18 * vAt(s)) / vmax;
          return (
            <G key={i}>
              <Vec
                x1={cx - 11}
                y1={cy}
                x2={cx - 11}
                y2={cy - len}
                color={c.chartInk}
                width={1.75}
                head={6}
              />
              <Circle
                cx={cx}
                cy={cy}
                r={4.5}
                fill={i === 0 ? c.card : c.chartHighlight}
                stroke={c.chartHighlight}
                strokeWidth={1.5}
              />
            </G>
          );
        })}
      </G>
    );
  }

  /** v against t: the line, the areas above (+) and below (−) the axis, their sizes. */
  function velocityView(f: Frame, w: number, h: number) {
    const y0 = f.sy(0);
    const parts: [number, number, number, number][] = turns
      ? [
          [0, v0, tc, 0],
          [tc, 0, t, v],
        ]
      : [[0, v0, t, v]];
    const aText = aId ? rep.value(aId) : withUnit(sig(a), vU ? `${vU}²` : undefined);
    // Beside a vertical strobe (H102) a falling line leaves the bottom left empty.
    const low = vertical && a < 0 && v0 <= 0;
    return (
      <G>
        {parts.map(([ta, va, tb, vb], i) => {
          const sign = (va + vb) / 2 >= 0;
          const d = `M ${f.sx(ta)} ${y0} L ${f.sx(ta)} ${f.sy(va)} L ${f.sx(tb)} ${f.sy(vb)} L ${f.sx(tb)} ${y0} Z`;
          const area = areas[i]!;
          const text = `${area >= 0 ? '+' : ''}${withUnit(sig(area), xU)}`;
          // The label in the middle of the part, when it has room.
          const cx = f.sx((ta + tb) / 2);
          const hPx = Math.abs(f.sy((va + vb) / 2) - y0);
          const room = hPx > (sign ? 30 : 44) && f.sx(tb) - f.sx(ta) > text.length * 7.5;
          return (
            <G key={i}>
              <Path d={d} fill={sign ? c.chartHighlight : c.hopBack} opacity={all ? 0.2 : 0.08} />
              {room ? (
                <Chip
                  x={cx}
                  y={y0 + (sign ? -hPx / 3 : Math.max(hPx / 2 + 6, 34))}
                  text={text}
                  w={w}
                  h={h}
                  size={chart.label}
                  color={sign ? c.chartHighlight : c.hopBack}
                />
              ) : null}
            </G>
          );
        })}
        <Line
          x1={f.sx(0)}
          y1={f.sy(v0)}
          x2={f.sx(t)}
          y2={f.sy(v)}
          stroke={c.chartHighlight}
          strokeWidth={chart.strokeHeavy}
          strokeLinecap="round"
          opacity={all ? 1 : 0.4}
        />
        {turns ? <Circle cx={f.sx(tc)} cy={y0} r={4} fill={c.card} stroke={c.chartInk} /> : null}
        <Circle cx={f.sx(0)} cy={f.sy(v0)} r={4} fill={c.chartHighlight} />
        {/* In the empty top corner: top left over a rising line, top right over a falling one. */}
        <Chip
          x={a >= 0 || low ? f.sx(0) + 8 : f.sx(win.value.x.hi) - 4}
          y={low ? f.sy(win.value.y.lo) - 10 : f.sy(win.value.y.hi) + (a >= 0 ? 34 : 16)}
          text={`slope = ${aId ? sym(aId) : 'a'} = ${aText}`}
          anchor={a >= 0 || low ? 'start' : 'end'}
          w={w}
          h={h}
          size={chart.label}
        />
      </G>
    );
  }

  /** x against t: the curve, the tangent at t₁ and its rise over run. */
  function positionView(f: Frame, w: number, h: number) {
    const n = 90;
    const curve = Array.from({ length: n + 1 }, (_, i) => (i * tEnd) / n)
      .map((s, i) => `${i ? 'L' : 'M'} ${f.sx(s).toFixed(1)} ${f.sy(xAt(s)).toFixed(1)}`)
      .join(' ');
    const x1 = xAt(t1);
    // The tangent over a stretch either side of t₁, cut to the window.
    const reach = (win.value.x.hi - win.value.x.lo) * 0.3;
    let [sa, sb] = [Math.max(0, t1 - reach), Math.min(win.value.x.hi, t1 + reach)];
    const [ylo, yhi] = [win.value.y.lo, win.value.y.hi];
    if (Math.abs(v1) > 1e-12) {
      const at = (y: number) => t1 + (y - x1) / v1;
      const [ea, eb] = [at(ylo), at(yhi)].sort((p, q) => p - q) as [number, number];
      sa = Math.max(sa, ea);
      sb = Math.min(sb, eb);
    }
    const run0 = win.value.x.step;
    const run = t1 + run0 <= win.value.x.hi ? run0 : -run0;
    const rise = v1 * run;
    const P = { x: f.sx(t1), y: f.sy(x1) };
    const Q = { x: f.sx(t1 + run), y: f.sy(x1) };
    const R = { x: f.sx(t1 + run), y: f.sy(x1 + rise) };
    const riseOk = x1 + rise >= ylo - 1e-9 && x1 + rise <= yhi + 1e-9;
    const slopeText = `slope = ${withUnit(sig(v1), vU)}`;
    return (
      <G>
        <Path
          d={curve}
          stroke={c.chartHighlight}
          strokeWidth={chart.strokeHeavy}
          fill="none"
          strokeLinecap="round"
          opacity={all ? 1 : 0.4}
        />
        <Line
          x1={f.sx(sa)}
          y1={f.sy(x1 + v1 * (sa - t1))}
          x2={f.sx(sb)}
          y2={f.sy(x1 + v1 * (sb - t1))}
          stroke={c.fnSecond}
          strokeWidth={chart.stroke}
        />
        {riseOk ? (
          <G>
            <Path
              d={`M ${P.x} ${P.y} L ${Q.x} ${Q.y} L ${R.x} ${R.y}`}
              stroke={c.chartSecond}
              strokeWidth={chart.stroke}
              fill="none"
            />
            <Chip
              x={(P.x + Q.x) / 2}
              y={P.y + (rise >= 0 ? 17 : -8)}
              text={`run ${withUnit(sig(Math.abs(run)), tU)}`}
              w={w}
              h={h}
              size={chart.label}
            />
            {Math.abs(R.y - Q.y) > 14 ? (
              <Chip
                x={Q.x + (run > 0 ? 6 : -6)}
                y={(Q.y + R.y) / 2 + 5}
                text={`rise ${withUnit(sig(Math.abs(rise)), xU)}`}
                anchor={run > 0 ? 'start' : 'end'}
                w={w}
                h={h}
                size={chart.label}
              />
            ) : null}
          </G>
        ) : null}
        <Chip
          x={f.sx(sa)}
          y={Math.max(f.sy(yhi) + 28, Math.min(f.sy(x1 + v1 * (sa - t1)), P.y) - 12)}
          text={slopeText}
          anchor="start"
          w={w}
          h={h}
          size={chart.label}
          color={c.fnSecond}
        />
        <Circle cx={f.sx(0)} cy={f.sy(x0)} r={4} fill={c.chartHighlight} />
        <Circle cx={P.x} cy={P.y} r={5} fill={c.fnSecond} stroke={c.card} strokeWidth={1.5} />
      </G>
    );
  }

  /** Drag the end time, the start velocity, the slope (velocity view) or the tangent point. */
  function handles(f: Frame) {
    const set = (id: string, x: number) =>
      calc.set({ ...others(id), [id]: rep.snapTo(id, x) }, rep.slide(id));
    const startId = typeof spec.start === 'string' ? spec.start : undefined;
    if (position) {
      const at = k.at;
      if (!at || !rep.known(at)) return null;
      return (
        <DragHandle
          testID="drag-tangent"
          x={f.sx(t1)}
          y={f.sy(xAt(t1))}
          label={rep.variable(at).name}
          onStart={() => {
            drag.current.t1 = rep.val(at);
            win.freeze();
          }}
          onEnd={win.release}
          onMove={(dxp) =>
            calc.set(
              {
                ...rep.pin([spec.time, ...(aId ? [aId] : [])]),
                [at]: rep.snapTo(at, drag.current.t1 + dxp / f.ux),
              },
              rep.slide(at),
            )
          }
        />
      );
    }
    return (
      <>
        {rep.known(spec.time) ? (
          <DragHandle
            testID="drag-time"
            x={f.sx(t)}
            y={f.sy(v)}
            label={rep.variable(spec.time).name}
            onStart={() => {
              drag.current.t = rep.val(spec.time);
              win.freeze();
            }}
            onEnd={win.release}
            onMove={(dxp) => set(spec.time, drag.current.t + dxp / f.ux)}
          />
        ) : null}
        {startId && rep.known(startId) ? (
          <DragHandle
            testID="drag-start"
            x={f.sx(0)}
            y={f.sy(v0)}
            label={rep.variable(startId).name}
            onStart={() => {
              drag.current.v0 = rep.val(startId);
              win.freeze();
            }}
            onEnd={win.release}
            onMove={(_, dyp) => set(startId, drag.current.v0 - dyp / f.uy)}
          />
        ) : null}
      </>
    );
  }

  function captionLines(): string[] {
    const [ts, as, vs] = [sym(spec.time), aId ? sym(aId) : 'a', sym(spec.speed)];
    const v0s = typeof spec.start === 'string' ? sym(spec.start) : `${vs}₀`;
    // Substituted values without units, the result with its unit.
    const bare = (id: string | undefined, x: number) =>
      id ? (rep.known(id) ? par(rep.value(id, false)) : '?') : par(sig(x));
    const v0t = bare(typeof spec.start === 'string' ? spec.start : undefined, v0);
    const lines = [
      `${vs} = ${v0s} + ${as}${ts} = ${v0t} + ${bare(aId, a)} × ${bare(spec.time, t)} = ${rep.value(spec.speed)}`,
    ];
    if (position) {
      const x0s = typeof k.position === 'string' ? sym(k.position) : `${xName}₀`;
      const t1s = k.at ? sym(k.at) : `${ts}₁`;
      const x0t = bare(typeof k.position === 'string' ? k.position : undefined, x0);
      const t1t = bare(k.at, t1);
      lines.push(
        `${xName}(${t1s}) = ${x0s} + ${v0s}${t1s} + ½${as}${t1s}² = ${x0t} + ${v0t} × ${t1t} + ½ × ${bare(aId, a)} × ${t1t}² = ${withUnit(sig(xAt(t1)), xU)}`,
        `The tangent’s slope is the velocity at ${t1s}.`,
        `${k.slope ? sym(k.slope) : 'slope'} = ${v0s} + ${as}${t1s} = ${v0t} + ${bare(aId, a)} × ${t1t} = ${withUnit(sig(v1), vU)}`,
        v1 > 1e-9
          ? 'The tangent slopes up: moving forward (+).'
          : v1 < -1e-9
            ? 'The tangent slopes down: moving backward (−).'
            : 'The tangent is flat: at rest for an instant, turning round.',
      );
      return lines;
    }
    const dName = spec.distance ? sym(spec.distance) : 'Δx';
    lines.push(
      `${dName} = (${v0s} + ${vs})/2 × ${ts} = (${v0t} + ${bare(spec.speed, v)})/2 × ${bare(spec.time, t)} = ${spec.distance ? rep.value(spec.distance) : withUnit(sig(dx), xU)}`,
    );
    if (turns)
      lines.push(
        `It turns round at ${withUnit(sig(tc), tU)}, where the velocity is 0.`,
        `Area above the axis ${withUnit(sig(areas[0]!), xU)}, below ${withUnit(sig(areas[1]!), xU)}: displacement ${withUnit(sig(dx), xU)}, distance travelled ${withUnit(sig(travelled), xU)}.`,
      );
    else
      lines.push(
        dx >= 0
          ? 'The shaded area above the axis is the displacement (+).'
          : 'The shaded area below the axis is a displacement backward (−).',
      );
    return lines;
  }
}
