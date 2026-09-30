import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { GeologicClockSpec } from '@/data/modules/typesHs3c';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import { HaloText } from '../layouts/earthKit';
import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useRep } from './common';
import { clockText, clockTime, EARTH_AGE_MY, minutesLeft } from './spaceHs3c';

const BW = 356;
const BH = 326;
const CX = 96;
const CY = 110;
const R = 74;
/** The last hour's strip: 23:00 at S0, midnight at S1. */
const S0 = 26;
const S1 = 330;
const STRIP_Y = 284;
const COL = 204;

const round = (x: number, places = 2) => Number(x.toFixed(places));

/** A point on the dial at clock time `t` (hours), `r` from the centre; midnight at the top. */
const at = (t: number, r: number) => {
  const a = (t / 24) * 2 * Math.PI;
  return [CX + r * Math.sin(a), CY - r * Math.cos(a)] as const;
};

/** The dial's sector from clock time t0 to t1 (hours, t0 < t1), out to radius r. */
const sector = (t0: number, t1: number, r: number) => {
  const [x0, y0] = at(t0, r);
  const [x1, y1] = at(t1, r);
  const large = t1 - t0 > 12 ? 1 : 0;
  return `M ${CX} ${CY} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
};

/** An arc along the dial from t0 to t1 at radius r. */
const arc = (t0: number, t1: number, r: number) => {
  const [x0, y0] = at(t0, r);
  const [x1, y1] = at(t1, r);
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${t1 - t0 > 12 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};

/** Earth's history as one day (GeologicClockSpec). */
export function GeologicClock({ spec, calc }: { spec: GeologicClockSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const last = useRef(12);
  const span = spec.span ?? EARTH_AGE_MY;
  const known = (x: number | string | undefined) =>
    x !== undefined && (typeof x === 'number' || rep.known(x));
  const num = (x: number | string | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.val(x);
  // The event's age: typed, or from the clock time or the minutes left when those are typed.
  const from = known(spec.ago)
    ? num(spec.ago)!
    : known(spec.time)
      ? ((24 - num(spec.time)!) / 24) * span
      : known(spec.minutes)
        ? (num(spec.minutes)! / 1440) * span
        : (num(spec.ago) ??
          (num(spec.time) !== undefined ? ((24 - num(spec.time)!) / 24) * span : span / 2));
  const A = Math.max(0, Math.min(span, from));
  const on = [spec.ago, spec.time, spec.minutes].some(known);
  const t = clockTime(A, span);
  const m = minutesLeft(A, span);
  const events = [...(spec.events ?? [])].sort((a, b) => b.age - a.age);
  const late = (age: number) => clockTime(age, span) >= 23;
  const S = (tt: number) => S0 + (tt - 23) * (S1 - S0);
  const timeId = typeof spec.time === 'string' ? spec.time : undefined;
  const agoId = typeof spec.ago === 'string' ? spec.ago : undefined;
  const dragId = spec.fixed ? undefined : (timeId ?? agoId);
  const mText =
    typeof spec.minutes === 'string' && rep.known(spec.minutes)
      ? rep.named(spec.minutes)
      : `${formatNumber(round(m, m < 10 ? 2 : 1))} minutes`;

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => {
          const k = w / BW;
          const [hx, hy] = at(t, R - 2);
          return (
            <>
              <Svg width={w} height={h}>
                <G transform={`scale(${k})`}>
                  {/* The dial: a flat 24-hour face, midnight at the top. */}
                  <Circle
                    cx={CX}
                    cy={CY}
                    r={R}
                    fill={c.card}
                    stroke={c.chartInk}
                    strokeWidth={1.5}
                  />
                  {/* Everything since the event: the last m minutes, shaded. */}
                  {t < 24 ? (
                    <Path
                      d={sector(t, 24, R - 1)}
                      fill={c.chartHighlight}
                      opacity={on ? 0.22 : 0.1}
                    />
                  ) : null}
                  {Array.from({ length: 24 }, (_, i) => {
                    const long = i % 6 === 0;
                    const [x0, y0] = at(i, R);
                    const [x1, y1] = at(i, R - (long ? 10 : 5));
                    return (
                      <Line
                        key={i}
                        x1={x0}
                        y1={y0}
                        x2={x1}
                        y2={y1}
                        stroke={c.chartInk}
                        strokeWidth={long ? 1.6 : 1}
                      />
                    );
                  })}
                  {[0, 3, 6, 9, 12, 15, 18, 21].map((i) => {
                    const [x, y] = at(i, R - 21);
                    return (
                      <ChartText
                        key={i}
                        x={x}
                        y={y + 4.5}
                        fontSize={chart.label}
                        textAnchor="middle"
                        fill={c.chartMuted}
                      >
                        {String(i)}
                      </ChartText>
                    );
                  })}
                  {/* The last hour, marked thick: it is stretched out below. */}
                  <Path
                    d={arc(23, 24, R + 3)}
                    stroke={c.chartSecond}
                    strokeWidth={5}
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Reference events before 23:00, numbered round the rim. */}
                  {events.map((e, i) =>
                    late(e.age) ? null : (
                      <Badge key={e.name} x={at(clockTime(e.age, span), R + 12)} n={i + 1} />
                    ),
                  )}
                  {/* The hand to the event. */}
                  <G opacity={on ? 1 : 0.35}>
                    <Line
                      x1={CX}
                      y1={CY}
                      x2={hx}
                      y2={hy}
                      stroke={c.chartHighlight}
                      strokeWidth={3}
                      strokeLinecap="round"
                    />
                    <Circle cx={CX} cy={CY} r={4.5} fill={c.chartHighlight} />
                  </G>
                  {/* The reading and the key. */}
                  <ChartText x={COL} y={22} fontSize={chart.label} fill={c.chartMuted}>
                    The event’s clock time
                  </ChartText>
                  <ChartText
                    x={COL}
                    y={44}
                    fontSize={chart.emphasis + 4}
                    fontWeight="700"
                    fill={c.chartHighlight}
                  >
                    {on ? clockText(t) : '?'}
                  </ChartText>
                  <Rect
                    x={COL}
                    y={58}
                    width={14}
                    height={14}
                    rx={3}
                    fill={c.chartHighlight}
                    opacity={0.3}
                  />
                  <ChartText x={COL + 20} y={70} fontSize={chart.label}>
                    {on ? `last ${mText}` : 'the time since, shaded'}
                  </ChartText>
                  {events.map((e, i) => (
                    <G key={e.name}>
                      <Badge x={[COL + 7, 98 + i * 21]} n={i + 1} />
                      <ChartText x={COL + 20} y={102 + i * 21} fontSize={chart.label}>
                        {e.name}
                      </ChartText>
                    </G>
                  ))}
                  {/* The last hour, stretched out. */}
                  <ChartText x={S0 - 8} y={226} fontSize={chart.label} fill={c.chartMuted}>
                    The last hour (thick arc), stretched out
                  </ChartText>
                  <Rect
                    x={S0}
                    y={STRIP_Y}
                    width={S1 - S0}
                    height={14}
                    fill={c.chartSurface}
                    stroke={c.chartSecond}
                    strokeWidth={2}
                    rx={2}
                  />
                  {t < 24 ? (
                    <Rect
                      x={S(Math.max(23, t))}
                      y={STRIP_Y}
                      width={S1 - S(Math.max(23, t))}
                      height={14}
                      fill={c.chartHighlight}
                      opacity={on ? 0.22 : 0.1}
                    />
                  ) : null}
                  {[0, 10, 20, 30, 40, 50, 60].map((min) => {
                    const x = S(23 + min / 60);
                    return (
                      <G key={min}>
                        <Line
                          x1={x}
                          y1={STRIP_Y + 14}
                          x2={x}
                          y2={STRIP_Y + 19}
                          stroke={c.chartInk}
                        />
                        <ChartText
                          x={x}
                          y={STRIP_Y + 32}
                          fontSize={chart.label}
                          textAnchor="middle"
                          fill={c.chartMuted}
                        >
                          {min === 60 ? '24:00' : `23:${String(min).padStart(2, '0')}`}
                        </ChartText>
                      </G>
                    );
                  })}
                  {t >= 23 ? (
                    <G opacity={on ? 1 : 0.35}>
                      <Line
                        x1={S(t)}
                        y1={STRIP_Y - 26}
                        x2={S(t)}
                        y2={STRIP_Y + 14}
                        stroke={c.chartHighlight}
                        strokeWidth={3}
                      />
                      <HaloText
                        x={Math.min(S1, Math.max(S0 + 20, S(t)))}
                        y={STRIP_Y - 30}
                        text={on ? clockText(t) : '?'}
                        c={c}
                        size={chart.label}
                        bold
                        fill={c.chartHighlight}
                        anchor={S(t) > S1 - 30 ? 'end' : 'middle'}
                      />
                    </G>
                  ) : null}
                  {events.map((e, i) => {
                    if (!late(e.age)) return null;
                    const x = S(clockTime(e.age, span));
                    return (
                      <G key={e.name}>
                        <Line
                          x1={x}
                          y1={STRIP_Y - 8}
                          x2={x}
                          y2={STRIP_Y + 14}
                          stroke={c.chartInk}
                        />
                        <Badge x={[x, STRIP_Y - 16]} n={i + 1} />
                      </G>
                    );
                  })}
                </G>
              </Svg>
              {dragId ? (
                <DragHandle
                  testID="drag-clock"
                  x={hx * k}
                  y={hy * k}
                  label="the event's clock time"
                  onStart={() => {
                    last.current = t;
                  }}
                  onMove={(dx, dy) => {
                    const px = hx + dx / k - CX;
                    const py = hy + dy / k - CY;
                    let tt = ((Math.atan2(px, -py) / (2 * Math.PI)) * 24 + 24) % 24;
                    // Past midnight the hand stops at the day's start or end.
                    if (last.current > 18 && tt < 6) tt = 24;
                    if (last.current < 6 && tt > 18) tt = 0;
                    last.current = tt;
                    if (dragId === timeId)
                      calc.set({ [dragId]: rep.snapTo(dragId, tt) }, rep.slide(dragId));
                    else
                      calc.set(
                        { [dragId]: rep.snapTo(dragId, ((24 - tt) / 24) * span) },
                        rep.slide(dragId),
                      );
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {on
          ? `${formatNumber(round(A, 1))} million years ago is ${formatNumber(round(A, 1))} ÷ ${formatNumber(span)} = ${formatNumber(round((A / span) * 100, 2))}% of Earth’s history. The same share of the day’s 1,440 minutes is ${formatNumber(round(m, 2))} minutes, so the event falls at ${clockText(t)}; the shaded part of the day is everything since.`
          : `Earth forms at midnight and today is the next midnight, so each hour stands for ${formatNumber(round(span / 24, 1))} million years. Type how long ago to place the event.`}
      </Caption>
    </View>
  );
}

/** A numbered marker for a reference event. */
function Badge({ x: [x, y], n }: { x: readonly [number, number]; n: number }) {
  const c = usePalette();
  return (
    <G>
      <Circle cx={x} cy={y} r={8} fill={c.chartSurface} stroke={c.chartInk} strokeWidth={1} />
      <ChartText x={x} y={y + 4.2} fontSize={chart.label} fontWeight="700" textAnchor="middle">
        {String(n)}
      </ChartText>
    </G>
  );
}
