import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { MotionGraphSpec } from '@/data/modules/typesMechanics';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, niceCeil, useFrozen, useRep } from './common';
import { Chip, fitExtent, GridAxes, makeFrame, type Frame } from './graphKit';

/** Height of the strip of positions above the graph. */
const STRIP = 50;

/** A number with its unit: "12 m", "3 m/s", "−2 m/s²". */
const withUnit = (x: number, unit?: string) => `${formatNumber(x)}${unit ? ` ${unit}` : ''}`;

/**
 * A distance-time or speed-time graph: the line, its run and rise marked (the slope is the
 * speed or the acceleration), the area under a speed line shaded as the distance, and a strip
 * of the object's positions each second above. Drag the line's end (the time) and its middle
 * (the slope).
 */
export function MotionGraph({ spec, calc }: { spec: MotionGraphSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef({ t: 0, m: 0, y0: 0 });
  const isDist = spec.graph === 'distance';
  // A number acceleration is drawn by MotionGraphHs (reps/index.tsx routes it there).
  const slopeId = isDist ? spec.speed : (spec.acceleration as string);
  const endId = isDist ? spec.distance : spec.speed;
  // Physics in formula units (m, s, m/s); each axis is drawn in its shown unit.
  const tf = rep.val(spec.time);
  const mf = rep.val(slopeId);
  const y0f = typeof spec.start === 'string' ? rep.val(spec.start) : (spec.start ?? 0);
  const startKnown = typeof spec.start === 'string' ? rep.known(spec.start) : true;
  // The line's end: the value itself when known, else from the start and the slope.
  const endf = rep.known(endId) ? rep.val(endId) : y0f + mf * tf;
  const fT = rep.factor(spec.time);
  const fY = rep.factor(endId);
  const legs = isDist ? (spec.then ?? []) : [];
  // The trip's corners in shown units: the student's leg, then the fixed legs.
  const trip = legs.reduce<[number, number][]>(
    (pts, l) => {
      const [x, y] = pts[pts.length - 1]!;
      return [...pts, [x + l.time / fT, y + (l.speed * l.time) / fY]];
    },
    [[tf / fT, endf / fY]],
  );
  const [t, y0, y1] = [tf / fT, y0f / fY, endf / fY];
  const lastT = trip[trip.length - 1]![0];
  const ext = useFrozen({
    t: fitExtent(spec.extent?.time ?? 10, [lastT]),
    y: fitExtent(spec.extent?.value ?? 10, [y0, ...trip.map((p) => p[1])]),
  });
  const all = rep.known(spec.time) && rep.known(slopeId) && startKnown && rep.known(endId);
  const tUnit = rep.unit(spec.time);
  const yUnit = rep.unit(endId);
  const sym = (id: string) => rep.variable(id).symbol;
  const startSym = typeof spec.start === 'string' ? sym(spec.start) : `${sym(endId)}₀`;
  const axisName = (id: string) => {
    const u = rep.unit(id);
    return `${rep.variable(id).name}${u ? ` (${u})` : ''}`;
  };
  const rise = y1 - y0;
  const riseText = all ? withUnit(rise, yUnit) : '?';
  const runText = rep.value(spec.time);
  const legSpeed = (x: number) =>
    withUnit(
      x / rep.factor(isDist ? spec.speed : slopeId),
      rep.unit(isDist ? spec.speed : slopeId),
    );
  const showStrip = spec.strip !== false && legs.length === 0;

  // The strip: position (formula units) after k shown time units, steady or speeding up.
  const posAt = (k: number) => {
    const s = k * fT;
    return isDist ? y0f + mf * s : y0f * s + (mf * s * s) / 2;
  };
  const posId = spec.distance;
  const fP = posId ? rep.factor(posId) : 1;
  const posUnit = posId ? rep.unit(posId) : undefined;
  const every = t <= 12 ? 1 : Math.ceil(t / 12);
  const ticks = Array.from({ length: Math.floor(t / every + 1e-9) + 1 }, (_, i) => i * every);
  // The strip's end: a round number just past the farthest position (in the shown unit).
  const farthest = Math.max(1e-9, ...ticks.map(posAt), posAt(t)) / fP;
  const posStep = niceCeil(farthest / 5);
  const posMax = Math.ceil(farthest / posStep - 1e-9) * posStep;

  const vars = [spec.time, slopeId, ...(typeof spec.start === 'string' ? [spec.start] : [])];
  const others = (id: string) => rep.pin(vars.filter((v) => v !== id));

  return (
    <View>
      <Canvas aspect={showStrip ? 0.86 : 0.74}>
        {({ w, h }) => {
          const top = showStrip ? STRIP : 0;
          const base = makeFrame(w, h - top, [0, ext.value.t], [0, ext.value.y], false, true);
          const f: Frame = { ...base, sy: (v) => top + base.sy(v), h };
          const [x0p, y0p] = [f.sx(0), f.sy(y0)];
          const [x1p, y1p] = [f.sx(t), f.sy(y1)];
          const midX = f.sx(t / 2);
          const midY = f.sy((y0 + y1) / 2);
          const sl = f.sx(0);
          const sr = f.sx(ext.value.t);
          const px = (p: number) => sl + (Math.max(0, p) / posMax) * (sr - sl);
          const up = rise >= 0;
          const axisY = f.sy(0);
          const chipW = (text: string) => text.length * chart.small * 0.58 + 6;
          // The run under its line, or under the axis numbers when it lies on the axis.
          const runLabel = `run ${runText}`;
          const onAxis = Math.abs(y0p - axisY) < 2;
          const runX = (x0p + x1p) / 2;
          const runY = onAxis ? axisY + 27 : y0p + (up ? 16 : -8);
          // The area under a speed line: in the band under the run when there is room, else
          // inside the triangle when it is big enough (the caption always works it out).
          const areaLabel =
            spec.graph === 'speed' && spec.distance ? `area ${rep.value(spec.distance)}` : '';
          const band = axisY - Math.max(y0p, y1p);
          const area = !areaLabel
            ? undefined
            : band >= 40
              ? { x: runX, y: axisY - band / 2 + (onAxis ? 4 : 12) }
              : Math.abs(y1p - y0p) > 44 && x1p - x0p > chipW(areaLabel) * 1.6
                ? { x: x0p + ((x1p - x0p) * 2) / 3, y: (2 * y0p + y1p) / 3 + 10 }
                : undefined;
          // The slope above the line, clear of the y-axis and the line itself.
          const slopeLabel = `slope ${rep.value(slopeId)}`;
          const sw = chipW(slopeLabel);
          const slopeX = Math.min(w - sw / 2 - 2, Math.max(x0p + sw / 2 + 6, midX - 10));
          const lineY = (x: number) =>
            x1p === x0p ? y0p : y0p + ((y1p - y0p) * (x - x0p)) / (x1p - x0p);
          const slopeY = Math.max(
            f.sy(ext.value.y) + chart.small,
            Math.min(
              midY - 14,
              lineY(Math.max(x0p, Math.min(x1p, slopeX - sw / 2))) - 9,
              lineY(Math.max(x0p, Math.min(x1p, slopeX + sw / 2))) - 9,
            ),
          );
          return (
            <>
              <Svg width={w} height={h}>
                {showStrip ? (
                  <G opacity={all ? 1 : 0.35}>
                    <ChartText x={sl} y={12} fontSize={chart.small} fill={c.chartMuted}>
                      {`Where it is every ${withUnit(every, tUnit)}`}
                    </ChartText>
                    <Line
                      x1={sl}
                      y1={30}
                      x2={sr}
                      y2={30}
                      stroke={c.chartGrid}
                      strokeWidth={chart.stroke}
                    />
                    {[0, posMax].map((p) => (
                      <G key={p}>
                        <Line x1={px(p)} y1={25} x2={px(p)} y2={35} stroke={c.chartMuted} />
                        <ChartText
                          x={px(p)}
                          y={46}
                          fontSize={chart.tiny}
                          fill={c.chartMuted}
                          textAnchor={p === 0 ? 'start' : 'end'}
                        >
                          {withUnit(p, posUnit)}
                        </ChartText>
                      </G>
                    ))}
                    {ticks.map((k) => (
                      <Circle
                        key={k}
                        cx={px(posAt(k) / fP)}
                        cy={30}
                        r={4.5}
                        fill={k === 0 ? c.card : c.chartHighlight}
                        stroke={c.chartHighlight}
                        strokeWidth={chart.strokeLight}
                      />
                    ))}
                  </G>
                ) : null}
                <GridAxes
                  f={f}
                  names={{
                    x: axisName(spec.time),
                    y: isDist ? axisName(endId) : `Speed${yUnit ? ` (${yUnit})` : ''}`,
                  }}
                />
                {!isDist && spec.distance ? (
                  <Path
                    d={`M ${x0p} ${f.sy(0)} L ${x0p} ${y0p} L ${x1p} ${y1p} L ${x1p} ${f.sy(0)} Z`}
                    fill={c.chartHighlight}
                    opacity={all ? 0.16 : 0.07}
                  />
                ) : null}
                {/* The run along the bottom, then the rise up to the line's end. */}
                <Path
                  d={`M ${x0p} ${y0p} L ${x1p} ${y0p} L ${x1p} ${y1p}`}
                  stroke={c.chartSecond}
                  strokeWidth={chart.stroke + 0.5}
                  strokeDasharray={all ? undefined : chart.dash}
                  fill="none"
                />
                {trip.slice(1).map(([x, y], i) => {
                  const [xa, ya] = trip[i]!;
                  const leg = legs[i]!;
                  return (
                    <G key={i}>
                      <Line
                        x1={f.sx(xa)}
                        y1={f.sy(ya)}
                        x2={f.sx(x)}
                        y2={f.sy(y)}
                        stroke={c.chartMuted}
                        strokeWidth={chart.stroke}
                      />
                      <Chip
                        x={f.sx((xa + x) / 2)}
                        y={Math.min(f.sy(ya), f.sy(y)) - 8}
                        text={legSpeed(leg.speed)}
                        w={w}
                        h={h}
                        color={c.chartMuted}
                        size={chart.tiny}
                      />
                    </G>
                  );
                })}
                <Line
                  x1={x0p}
                  y1={y0p}
                  x2={x1p}
                  y2={y1p}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.strokeHeavy}
                  strokeLinecap="round"
                  opacity={all ? 1 : 0.35}
                />
                <Chip x={runX} y={runY} text={runLabel} w={w} h={h} />
                {Math.abs(y1p - y0p) > 4 ? (
                  <Chip
                    x={x1p + 6}
                    y={(y0p + y1p) / 2 + 4}
                    text={`rise ${riseText}`}
                    anchor="start"
                    w={w}
                    h={h}
                  />
                ) : null}
                {area ? (
                  <Chip
                    x={area.x}
                    y={area.y}
                    text={areaLabel}
                    w={w}
                    h={h}
                    color={c.chartHighlight}
                  />
                ) : null}
                <Chip
                  x={slopeX}
                  y={slopeY}
                  text={slopeLabel}
                  w={w}
                  h={h}
                  color={c.chartHighlight}
                />
                <Circle cx={x0p} cy={y0p} r={4} fill={c.chartHighlight} />
              </Svg>
              {rep.known(spec.time) ? (
                <DragHandle
                  testID="drag-time"
                  x={x1p}
                  y={y1p}
                  label={rep.variable(spec.time).name}
                  onStart={() => {
                    start.current.t = tf;
                    ext.freeze();
                  }}
                  onEnd={ext.release}
                  onMove={(dx) =>
                    calc.set(
                      {
                        ...others(spec.time),
                        [spec.time]: rep.snapTo(spec.time, start.current.t + (dx / f.ux) * fT),
                      },
                      rep.slide(spec.time),
                    )
                  }
                />
              ) : null}
              {rep.known(slopeId) && rep.known(spec.time) && tf > 0 ? (
                <DragHandle
                  testID="drag-slope"
                  x={midX}
                  y={midY}
                  label={rep.variable(slopeId).name}
                  onStart={() => {
                    start.current = { ...start.current, m: mf, t: tf };
                    ext.freeze();
                  }}
                  onEnd={ext.release}
                  onMove={(_, dy) => {
                    const s = start.current;
                    // The line turns about its start: the middle moves half the end's rise.
                    const next = s.m - ((dy / f.uy) * fY) / (s.t / 2);
                    calc.set(
                      {
                        ...others(slopeId),
                        [slopeId]: rep.snapTo(slopeId, next),
                      },
                      rep.slide(slopeId),
                    );
                  }}
                />
              ) : null}
              {typeof spec.start === 'string' && startKnown ? (
                <DragHandle
                  testID="drag-start"
                  x={x0p}
                  y={y0p}
                  label={rep.variable(spec.start).name}
                  onStart={() => {
                    start.current.y0 = y0f;
                    ext.freeze();
                  }}
                  onEnd={ext.release}
                  onMove={(_, dy) => {
                    const id = spec.start as string;
                    calc.set(
                      {
                        ...others(id),
                        [id]: rep.snapTo(id, start.current.y0 - (dy / f.uy) * fY),
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
      <Caption>
        {[
          `Slope = rise ÷ run = ${riseText} ÷ ${runText} = ${rep.value(slopeId)}`,
          equation(),
          ...(!isDist && spec.distance ? [distanceLine()] : []),
          isDist
            ? legs.length
              ? 'A flat part stands still · A part that falls goes back toward the start'
              : 'The steeper the line, the faster it goes'
            : rise >= 0
              ? 'Evenly spaced dots mean a steady speed; spreading dots mean speeding up'
              : 'Dots closer and closer together mean slowing down',
        ].join(' · ')}
      </Caption>
    </View>
  );

  /** "d = v × t = 3 m/s × 4 s = 12 m" (with the start added when there is one). */
  function equation() {
    const [ys, ms, ts] = [sym(endId), sym(slopeId), sym(spec.time)];
    const hasStart = spec.start !== undefined && !(typeof spec.start === 'number' && !spec.start);
    const startVal = typeof spec.start === 'string' ? rep.value(spec.start) : withUnit(y0, yUnit);
    const lead = hasStart ? `${startSym} + ` : '';
    const leadVal = hasStart ? `${startVal} + ` : '';
    return `${ys} = ${lead}${ms} × ${ts} = ${leadVal}${rep.value(slopeId)} × ${rep.value(spec.time)} = ${rep.value(endId)}`;
  }

  /** The area under a speed-time line: "d = (v₀ + v) ÷ 2 × t = …". */
  function distanceLine() {
    if (isDist || !spec.distance) return '';
    const [ds, vs, ts] = [sym(spec.distance), sym(spec.speed), sym(spec.time)];
    const hasStart = spec.start !== undefined && !(typeof spec.start === 'number' && !spec.start);
    const startVal = typeof spec.start === 'string' ? rep.value(spec.start) : withUnit(y0, yUnit);
    return hasStart
      ? `${ds} = (${startSym} + ${vs}) ÷ 2 × ${ts} = (${startVal} + ${rep.value(spec.speed)}) ÷ 2 × ${rep.value(spec.time)} = ${rep.value(spec.distance)}`
      : `${ds} = ${vs} ÷ 2 × ${ts} = ${rep.value(spec.speed)} ÷ 2 × ${rep.value(spec.time)} = ${rep.value(spec.distance)}`;
  }
}
