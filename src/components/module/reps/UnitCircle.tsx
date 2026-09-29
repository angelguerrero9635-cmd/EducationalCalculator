import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { UnitCircleSpec } from '@/data/modules/typesHsd';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle, useFrozen, useRep } from './common';
import { arrowHead } from './graphKit';
import {
  angleText,
  exactTrig,
  fromDegrees,
  principalOf,
  referenceAngle,
  solutionsOf,
  toDegrees,
  trig,
  trigText,
  turn360,
} from './hsdKit';
import { MathChip, MathText, textWidth } from './hsdText';

const RAD = Math.PI / 180;
/** The special angles: multiples of 30° and 45° on one turn. */
const SPECIAL = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];

/** Points along a circle (or a spiral growing `grow` px a turn) from a to b degrees. */
const arcPath = (cx: number, cy: number, r: number, a: number, b: number, grow = 0) => {
  const n = Math.max(2, Math.ceil(Math.abs(b - a) / 3));
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const t = a + ((b - a) * i) / n;
    const rr = r + (grow * Math.abs(t - a)) / 360;
    return `${i ? 'L' : 'M'} ${cx + rr * Math.cos(t * RAD)} ${cy - rr * Math.sin(t * RAD)}`;
  });
  return pts.join(' ');
};

/**
 * The unit circle: the angle θ, its point (cos θ, sin θ) and the reference triangle, the special
 * angles with exact values, and optionally the sine or cosine graph unrolled beside it, the
 * solutions of a trig equation on one turn, or the arc whose length is θ in radians. Drag the
 * point around the circle.
 */
export function UnitCircle({ spec, calc }: { spec: UnitCircleSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const measure = spec.measure ?? 'degrees';
  const show = spec.show ?? (measure === 'degrees' ? 'degrees' : 'radians');
  const raw = typeof spec.angle === 'string' ? rep.val(spec.angle) : spec.angle;
  const known = typeof spec.angle === 'number' || rep.known(spec.angle);
  const deg = toDegrees(raw, measure);
  const t = turn360(deg);
  const [cosT, sinT] = [Math.cos(deg * RAD), Math.sin(deg * RAD)];
  const graph = spec.graph;
  // The graph runs over one turn, or the whole turns θ reaches (kept still while dragging).
  const span = useFrozen({
    lo: Math.min(0, Math.floor(deg / 90 - 1e-9) * 90),
    hi: Math.max(360, Math.ceil(deg / 90 + 1e-9) * 90),
  });
  const drag = useRef({ deg: 0, px: 0, py: 0 });

  // The equation's solutions (degrees on one turn, or the principal value).
  const sol = spec.solutions;
  const solValue = sol
    ? typeof sol.value === 'number'
      ? sol.value
      : rep.val(sol.value)
    : undefined;
  const solKnown = sol ? typeof sol.value === 'number' || rep.known(sol.value) : false;
  const solAngles =
    sol && solValue !== undefined
      ? sol.principal
        ? [principalOf(sol.fn, solValue)].filter((x): x is number => x !== undefined)
        : solutionsOf(sol.fn, solValue)
      : [];
  const exactValue =
    solValue === undefined ? '' : (exactTrigValue(solValue) ?? formatNumber(solValue));

  const angleLabel = (d: number) => angleText(d, show);
  const thetaText = known ? angleLabel(deg) : '?';
  const special = SPECIAL.some((s) => Math.abs(turn360(deg) - s) < 1e-6);

  // Caption: the point, the reference angle, and what the options add.
  const lines: string[] = [];
  if (sol) {
    // An equation picture: its solutions are the caption.
  } else if (!known) lines.push('θ = ?: type an angle or drag the point.');
  else {
    const pair = `(${trigText('cos', deg).replace('≈ ', '')}, ${trigText('sin', deg).replace('≈ ', '')})`;
    lines.push(
      `θ = ${thetaText}: the point (cos θ, sin θ) is ${special ? '' : '≈ '}${pair}.`.replace(
        / {2}/g,
        ' ',
      ),
    );
    const ref = referenceAngle(deg);
    if (Math.abs(deg) >= 360) {
      const k = Math.floor(Math.abs(deg) / 360 + 1e-9);
      const rest = Math.abs(deg) - 360 * k;
      lines.push(
        `${k} full ${k === 1 ? 'turn' : 'turns'}${rest > 1e-6 ? ` and ${angleLabel(rest)} more` : ''}${deg < 0 ? ', clockwise' : ''}: the same point as ${angleLabel(turn360(deg))}.`,
      );
    }
    if (Math.abs(ref - turn360(deg)) > 1e-6 && ref > 1e-6 && Math.abs(ref - 90) > 1e-6)
      lines.push(`Reference angle: ${angleLabel(ref)}.`);
    if (spec.tan) {
      const tt = exactTrig('tan', deg) ?? trigText('tan', deg);
      lines.push(
        tt === 'undefined'
          ? 'tan θ has no value here: cos θ = 0.'
          : `tan θ = sin θ ÷ cos θ ${tt.startsWith('≈') ? tt : `= ${tt}`}.`,
      );
    }
    if (spec.arc)
      lines.push(`Arc length s = ${angleText(deg, 'radians')} on a circle of radius 1.`);
  }
  if (sol) {
    const fnName = sol.fn;
    if (!solKnown) lines.push(`${fnName} θ = ?`);
    else if (solAngles.length === 0)
      lines.push(`${fnName} θ = ${exactValue} has no solution: ${fnName} θ stays from −1 to 1.`);
    else if (sol.principal)
      lines.push(
        `arc${fnName}(${exactValue}) = ${angleLabel(solAngles[0]!)}, in ${
          fnName === 'cos'
            ? `${angleLabel(0)} to ${angleLabel(180)}`
            : `${angleLabel(-90)} to ${angleLabel(90)}`
        }.`,
      );
    else
      lines.push(
        `${fnName} θ = ${exactValue} at θ = ${solAngles.map(angleLabel).join(' and ')}, for ${angleLabel(0)} ≤ θ < ${angleLabel(360)}.`,
      );
  }

  const aspect = graph ? (w: number) => (0.34 * w + 70) / w : 1;

  return (
    <View>
      <Canvas aspect={aspect}>
        {({ w, h }) => {
          const R = graph ? 0.17 * w : w / 2 - 42;
          const cx = graph ? R + 16 : w / 2;
          const cy = graph ? R + 28 : h / 2;
          const P = { x: cx + R * cosT, y: cy - R * sinT };
          const F = { x: P.x, y: cy };
          const faded = known ? 1 : 0.35;
          // Special angle labels: all 16, or only the solutions in an equation picture.
          const labelAngles = graph ? [] : sol ? [] : SPECIAL;
          const radial = (d: number, text: string, extra = 8) => {
            const tw = textWidth(text, chart.label);
            const [co, si] = [Math.cos(d * RAD), Math.sin(d * RAD)];
            const r = R + extra + Math.abs(co) * (tw / 2) + Math.abs(si) * 7;
            return { x: cx + r * co, y: cy - r * si + 4 };
          };
          const armR = graph ? 14 : 24;
          const turns = Math.abs(deg) / 360;
          const g = graph
            ? (() => {
                const x0 = cx + R + 34;
                const x1 = w - 12;
                const { lo, hi } = span.value;
                const sx = (d: number) => x0 + ((d - lo) / (hi - lo)) * (x1 - x0);
                const sy = (v: number) => cy - v * R;
                return { x0, x1, lo, hi, sx, sy };
              })()
            : undefined;
          const legColor = { cos: c.unitCircleCosine, sin: c.unitCircleSine };
          // The sine leg's label: outside the triangle when there is room, else inside.
          const sinText = 'sin θ';
          const sinW = textWidth(sinText, chart.label);
          const room = R * Math.sqrt(Math.max(0, 1 - (sinT / 2) ** 2)) - Math.abs(cosT) * R;
          const sinOut = room > sinW + 10;
          const sinSide = (cosT >= 0 ? 1 : -1) * (sinOut ? 1 : -1);
          const refDeg = referenceAngle(deg);
          const showRef =
            !sol &&
            known &&
            !graph &&
            refDeg > 1e-6 &&
            Math.abs(refDeg - 90) > 1e-6 &&
            Math.abs(refDeg - t) > 1e-6;
          // The reference angle runs from the terminal side to the nearer side of the x-axis.
          const refFrom = cosT >= 0 ? (sinT >= 0 ? 0 : 360) : 180;
          const refMid = (refFrom + t) / 2;
          // The coordinates' chip, inside the circle on the free side of the radius.
          const pairText = `(${trigText('cos', deg).replace('≈ ', '')}, ${trigText('sin', deg).replace('≈ ', '')})`;
          const towardY = (sinT >= 0 ? 90 : 270) - t;
          const chipDir = t + Math.sign(((towardY + 540) % 360) - 180 || 1) * 22;
          const chipAt = {
            x: cx + 0.66 * R * Math.cos(chipDir * RAD),
            y: cy - 0.66 * R * Math.sin(chipDir * RAD) + 4,
          };
          const legsShown = Math.abs(sinT) * R > 6 && Math.abs(cosT) * R > 6;
          return (
            <>
              <Svg width={w} height={h}>
                {/* Axes and the circle. */}
                <Line
                  x1={cx - R - 8}
                  y1={cy}
                  x2={cx + R + 8}
                  y2={cy}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <Line
                  x1={cx}
                  y1={cy - R - 8}
                  x2={cx}
                  y2={cy + R + 8}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <Circle
                  cx={cx}
                  cy={cy}
                  r={R}
                  fill="none"
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                {SPECIAL.map((d) => (
                  <Line
                    key={`t${d}`}
                    x1={cx + (R - 4) * Math.cos(d * RAD)}
                    y1={cy - (R - 4) * Math.sin(d * RAD)}
                    x2={cx + (R + 4) * Math.cos(d * RAD)}
                    y2={cy - (R + 4) * Math.sin(d * RAD)}
                    stroke={c.chartMuted}
                    strokeWidth={chart.strokeLight}
                  />
                ))}
                {labelAngles.map((d) => {
                  const text = angleLabel(d);
                  const at = radial(d, text);
                  return (
                    <MathText
                      key={`l${d}`}
                      text={text}
                      x={at.x}
                      y={at.y}
                      textAnchor="middle"
                      fontSize={chart.label}
                      fill={c.chartMuted}
                    />
                  );
                })}
                {!labelAngles.length && !graph ? (
                  <>
                    <MathText
                      text="x"
                      x={cx + R + 12}
                      y={cy + 4}
                      fontSize={chart.label}
                      fontWeight="700"
                    />
                    <MathText
                      text="y"
                      x={cx + 6}
                      y={cy - R - 6}
                      fontSize={chart.label}
                      fontWeight="700"
                    />
                  </>
                ) : null}
                {/* The principal value's range, shaded along the circle. */}
                {sol?.principal && solKnown ? (
                  <Path
                    d={arcPath(cx, cy, R, sol.fn === 'cos' ? 0 : -90, sol.fn === 'cos' ? 180 : 90)}
                    stroke={c.chartHighlight}
                    strokeWidth={9}
                    strokeOpacity={0.22}
                    fill="none"
                  />
                ) : null}
                {/* The arc whose length is θ in radians. */}
                {spec.arc && known ? (
                  <Path
                    d={arcPath(cx, cy, R, 0, Math.max(-720, Math.min(720, deg)))}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy + 2}
                    strokeOpacity={0.55}
                    fill="none"
                  />
                ) : null}
                {/* The equation's line and its solutions. */}
                {sol && solKnown && solValue !== undefined ? (
                  <G>
                    {sol.fn === 'sin' && Math.abs(solValue) <= 1.2 ? (
                      <Line
                        x1={cx - R - 8}
                        y1={cy - solValue * R}
                        x2={cx + R + 8}
                        y2={cy - solValue * R}
                        stroke={c.unitCircleSine}
                        strokeWidth={chart.strokeLight}
                        strokeDasharray={chart.dash}
                      />
                    ) : null}
                    {sol.fn === 'cos' && Math.abs(solValue) <= 1.2 ? (
                      <Line
                        x1={cx + solValue * R}
                        y1={cy - R - 8}
                        x2={cx + solValue * R}
                        y2={cy + R + 8}
                        stroke={c.unitCircleCosine}
                        strokeWidth={chart.strokeLight}
                        strokeDasharray={chart.dash}
                      />
                    ) : null}
                    {sol.fn === 'tan'
                      ? (() => {
                          const a = Math.atan(solValue);
                          const L = R + 8;
                          return (
                            <Line
                              x1={cx - L * Math.cos(a)}
                              y1={cy + L * Math.sin(a)}
                              x2={cx + L * Math.cos(a)}
                              y2={cy - L * Math.sin(a)}
                              stroke={c.chartHighlight}
                              strokeWidth={chart.strokeLight}
                              strokeDasharray={chart.dash}
                            />
                          );
                        })()
                      : null}
                    {solAngles.map((d) => {
                      const q = { x: cx + R * Math.cos(d * RAD), y: cy - R * Math.sin(d * RAD) };
                      const text = angleLabel(d);
                      const at = radial(d, text, 10);
                      return (
                        <G key={`s${d}`}>
                          <Line
                            x1={cx}
                            y1={cy}
                            x2={q.x}
                            y2={q.y}
                            stroke={c.chartMuted}
                            strokeWidth={chart.strokeLight}
                          />
                          <Circle
                            cx={q.x}
                            cy={q.y}
                            r={5.5}
                            fill={c.chartHighlight}
                            stroke={c.card}
                            strokeWidth={1.5}
                          />
                          <MathChip
                            x={at.x}
                            y={at.y}
                            text={text}
                            w={w}
                            h={h}
                            color={c.chartHighlight}
                          />
                        </G>
                      );
                    })}
                    {(() => {
                      const text = `${sol.fn} θ = ${exactValue}`;
                      const y =
                        sol.fn === 'sin'
                          ? cy - solValue * R + (solValue >= 0 ? 16 : -8)
                          : sol.fn === 'cos'
                            ? cy + R * 0.5
                            : cy + R * 0.62;
                      const x =
                        sol.fn === 'cos'
                          ? cx + solValue * R + (solValue >= 0 ? -6 : 6)
                          : sol.fn === 'tan'
                            ? cx + (solValue >= 0 ? 1 : -1) * R * 0.5
                            : cx;
                      return (
                        <MathChip
                          x={x}
                          y={y}
                          text={text}
                          anchor={sol.fn === 'cos' ? (solValue >= 0 ? 'end' : 'start') : 'middle'}
                          w={w}
                          h={h}
                          color={
                            sol.fn === 'sin'
                              ? c.unitCircleSine
                              : sol.fn === 'cos'
                                ? c.unitCircleCosine
                                : c.chartHighlight
                          }
                        />
                      );
                    })()}
                  </G>
                ) : null}
                {/* θ from the positive x-axis: an arc with an arrow (a spiral past one turn). */}
                {Math.abs(deg) > 1e-6 && !sol ? (
                  <G opacity={faded}>
                    <Path
                      d={arcPath(
                        cx,
                        cy,
                        armR,
                        0,
                        Math.max(-1080, Math.min(1080, deg)),
                        turns > 1 ? 10 : 0,
                      )}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                      fill="none"
                    />
                    {(() => {
                      const end = Math.max(-1080, Math.min(1080, deg));
                      const rr = armR + (turns > 1 ? (10 * Math.abs(end)) / 360 : 0);
                      const ex = cx + rr * Math.cos(end * RAD);
                      const ey = cy - rr * Math.sin(end * RAD);
                      const s = Math.sign(end);
                      return (
                        <Path
                          d={arrowHead(
                            ex,
                            ey,
                            -s * Math.sin(end * RAD),
                            -s * Math.cos(end * RAD),
                            7,
                          )}
                          fill={c.chartInk}
                        />
                      );
                    })()}
                    {(() => {
                      const mid = Math.abs(deg) >= 360 ? 45 * Math.sign(deg) : deg / 2;
                      const rr = armR + 11 + (turns > 1 ? 10 : 0);
                      return (
                        <MathText
                          text="θ"
                          x={cx + rr * Math.cos(mid * RAD)}
                          y={cy - rr * Math.sin(mid * RAD) + 4}
                          textAnchor="middle"
                          fontSize={chart.value}
                          fontWeight="700"
                        />
                      );
                    })()}
                  </G>
                ) : null}
                {/* The reference angle, between the terminal side and the x-axis. */}
                {showRef ? (
                  <G>
                    <Path
                      d={arcPath(cx, cy, 42, refFrom, t)}
                      stroke={c.chartMuted}
                      strokeWidth={chart.stroke}
                      fill="none"
                    />
                    <MathChip
                      x={cx + 62 * Math.cos(refMid * RAD)}
                      y={cy - 62 * Math.sin(refMid * RAD) + 4}
                      text={angleLabel(refDeg)}
                      w={w}
                      h={h}
                      size={chart.label}
                      bold={false}
                      color={c.chartMuted}
                    />
                  </G>
                ) : null}
                {/* The reference triangle: cos θ along the x-axis, sin θ up to the point. */}
                {!sol ? (
                  <G opacity={faded}>
                    <Line
                      x1={cx}
                      y1={cy}
                      x2={F.x}
                      y2={F.y}
                      stroke={legColor.cos}
                      strokeWidth={chart.strokeHeavy + 1}
                      strokeLinecap="round"
                    />
                    <Line
                      x1={F.x}
                      y1={F.y}
                      x2={P.x}
                      y2={P.y}
                      stroke={legColor.sin}
                      strokeWidth={chart.strokeHeavy + 1}
                      strokeLinecap="round"
                    />
                    <Line
                      x1={cx}
                      y1={cy}
                      x2={P.x}
                      y2={P.y}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                    />
                    {legsShown && Math.abs(sinT) * R > 14 && Math.abs(cosT) * R > 14 ? (
                      <Path
                        d={(() => {
                          const s = 8;
                          const dx = cosT >= 0 ? -s : s;
                          const dy = sinT >= 0 ? -s : s;
                          return `M ${F.x + dx} ${F.y} L ${F.x + dx} ${F.y + dy} L ${F.x} ${F.y + dy}`;
                        })()}
                        stroke={c.chartMuted}
                        strokeWidth={1.2}
                        fill="none"
                      />
                    ) : null}
                    {Math.abs(cosT) * R > 22 && !graph ? (
                      <MathText
                        text="cos θ"
                        x={(cx + F.x) / 2}
                        y={(() => {
                          const reach = armR + (turns > 1 ? 10 * Math.min(3, turns) : 0) + 4;
                          const clear = Math.abs(cosT) * R * 0.5 > reach + 18;
                          const off = clear ? 0 : reach - 6;
                          return cy + (sinT >= 0 ? 16 + off : -7 - off);
                        })()}
                        textAnchor="middle"
                        fontSize={chart.label}
                        fontWeight="700"
                        fill={legColor.cos}
                      />
                    ) : null}
                    {Math.abs(sinT) * R > 18 && !graph ? (
                      <MathText
                        text={sinText}
                        x={F.x + sinSide * 6}
                        y={(cy + P.y) / 2 + 4}
                        textAnchor={sinSide > 0 ? 'start' : 'end'}
                        fontSize={chart.label}
                        fontWeight="700"
                        fill={legColor.sin}
                      />
                    ) : null}
                  </G>
                ) : null}
                {/* The point and its coordinates. */}
                {!sol ? (
                  <G opacity={faded}>
                    <Circle
                      cx={P.x}
                      cy={P.y}
                      r={6}
                      fill={c.chartHighlight}
                      stroke={c.card}
                      strokeWidth={1.5}
                    />
                    {!graph && known ? (
                      <MathChip
                        x={chipAt.x}
                        y={chipAt.y}
                        text={pairText}
                        w={w}
                        h={h}
                        size={chart.value}
                      />
                    ) : null}
                  </G>
                ) : null}
                {/* The graph, unrolled beside the circle. */}
                {g ? (
                  <UnrolledGraph
                    fn={graph!}
                    g={g}
                    deg={deg}
                    known={known}
                    P={P}
                    R={R}
                    cy={cy}
                    w={w}
                    h={h}
                    show={show}
                  />
                ) : null}
              </Svg>
              {!spec.fixed && typeof spec.angle === 'string' && !sol ? (
                <DragHandle
                  testID="drag-angle"
                  x={P.x}
                  y={P.y}
                  label="the angle θ"
                  onStart={() => {
                    drag.current = { deg, px: P.x, py: P.y };
                    span.freeze();
                  }}
                  onMove={(dx, dy) => {
                    const id = spec.angle as string;
                    const s = drag.current;
                    const a = Math.atan2(-(s.py + dy - cy), s.px + dx - cx) / RAD;
                    // Follow the finger round and round: the turn nearest the last angle.
                    const next = s.deg + ((((a - s.deg) % 360) + 540) % 360) - 180;
                    drag.current = { ...s, deg: next, px: s.px, py: s.py };
                    calc.set(
                      {
                        ...(spec.keep ? rep.pin(spec.keep) : {}),
                        [id]: rep.snapTo(id, fromDegrees(next, measure)),
                      },
                      rep.slide(id),
                    );
                  }}
                  onEnd={span.release}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

/** A number written exactly when it is one of the special values (1/2, −√3/2). */
function exactTrigValue(x: number): string | undefined {
  const table: [number, string][] = [
    [0, '0'],
    [0.5, '1/2'],
    [Math.SQRT2 / 2, '√2/2'],
    [Math.sqrt(3) / 2, '√3/2'],
    [1, '1'],
    [Math.sqrt(3) / 3, '√3/3'],
    [Math.sqrt(3), '√3'],
  ];
  const hit = table.find(([v]) => Math.abs(Math.abs(x) - v) < 1e-4);
  if (!hit) return undefined;
  return x < 0 && hit[1] !== '0' ? `−${hit[1]}` : hit[1];
}

/** y = sin θ or y = cos θ over the turns θ reaches, the point at θ marked. */
function UnrolledGraph({
  fn,
  g,
  deg,
  known,
  P,
  R,
  cy,
  w,
  h,
  show,
}: {
  fn: 'sin' | 'cos';
  g: {
    x0: number;
    x1: number;
    lo: number;
    hi: number;
    sx: (d: number) => number;
    sy: (v: number) => number;
  };
  deg: number;
  known: boolean;
  P: { x: number; y: number };
  R: number;
  cy: number;
  w: number;
  h: number;
  show: 'degrees' | 'radians';
}) {
  const c = usePalette();
  const color = fn === 'sin' ? c.unitCircleSine : c.unitCircleCosine;
  const n = 180;
  const d = Array.from({ length: n + 1 }, (_, i) => {
    const a = g.lo + ((g.hi - g.lo) * i) / n;
    return `${i ? 'L' : 'M'} ${g.sx(a)} ${g.sy(trig(fn, a))}`;
  }).join(' ');
  const v = trig(fn, deg);
  const gx = g.sx(deg);
  const gy = g.sy(v);
  // Ticks every 90° (π/2), numbered every other one when the turns are many.
  const ticks: number[] = [];
  for (let a = g.lo; a <= g.hi + 1e-9; a += 90) ticks.push(a);
  const every = (g.x1 - g.x0) / (ticks.length - 1) < 34 ? 2 : 1;
  const point = `(${angleText(deg, show)}, ${trigText(fn, deg).replace('≈ ', '')})`;
  const pw = textWidth(point, chart.label) + 6;
  const right = gx + 10 + pw < w - 2;
  return (
    <G>
      <Rect x={g.x0} y={g.sy(1)} width={g.x1 - g.x0} height={2 * R} fill={c.chartSurface} />
      {ticks.map((a) => (
        <Line
          key={`g${a}`}
          x1={g.sx(a)}
          y1={g.sy(1)}
          x2={g.sx(a)}
          y2={g.sy(-1)}
          stroke={c.chartGrid}
          strokeWidth={1}
        />
      ))}
      {[1, -1].map((y) => (
        <G key={`y${y}`}>
          <Line
            x1={g.x0}
            y1={g.sy(y)}
            x2={g.x1}
            y2={g.sy(y)}
            stroke={c.chartGrid}
            strokeWidth={1}
          />
          <MathText
            text={y > 0 ? '1' : '−1'}
            x={g.x0 - 5}
            y={g.sy(y) + 4}
            textAnchor="end"
            fontSize={chart.label}
            fill={c.chartMuted}
          />
        </G>
      ))}
      <Line
        x1={g.x0}
        y1={cy}
        x2={g.x1}
        y2={cy}
        stroke={c.chartInk}
        strokeWidth={chart.strokeLight}
      />
      <Line
        x1={g.sx(0)}
        y1={g.sy(1) - 6}
        x2={g.sx(0)}
        y2={g.sy(-1) + 6}
        stroke={c.chartInk}
        strokeWidth={chart.strokeLight}
      />
      {ticks
        .filter((a, i) => a !== 0 && (i % every === 0 || a === g.hi))
        .map((a) => (
          <MathText
            key={`n${a}`}
            text={angleText(a, show)}
            x={g.sx(a)}
            y={g.sy(-1) + 18}
            textAnchor={a === g.hi ? 'end' : 'middle'}
            fontSize={chart.label}
            fill={c.chartMuted}
          />
        ))}
      <MathText
        text={`y = ${fn} θ`}
        x={g.x0 + 4}
        y={g.sy(1) - 8}
        fontSize={chart.label}
        fontWeight="700"
        fill={color}
      />
      <MathText
        text="θ"
        x={g.x1}
        y={cy - 6}
        textAnchor="end"
        fontSize={chart.label}
        fontWeight="700"
      />
      <Path d={d} stroke={color} strokeWidth={chart.stroke + 0.5} fill="none" />
      <G opacity={known ? 1 : 0.35}>
        {fn === 'sin' ? (
          <Line
            x1={P.x}
            y1={P.y}
            x2={gx}
            y2={gy}
            stroke={c.chartMuted}
            strokeWidth={chart.strokeLight}
            strokeDasharray={chart.dashFine}
          />
        ) : null}
        <Line
          x1={gx}
          y1={cy}
          x2={gx}
          y2={gy}
          stroke={color}
          strokeWidth={chart.strokeHeavy + 1}
          strokeLinecap="round"
        />
        <Circle cx={gx} cy={gy} r={6} fill={c.chartHighlight} stroke={c.card} strokeWidth={1.5} />
        {known ? (
          <MathChip
            x={right ? gx + 10 : gx - 10}
            y={Math.max(chart.label + 2, Math.min(h - 26, gy + (v >= 0 ? -10 : 20)))}
            text={point}
            anchor={right ? 'start' : 'end'}
            w={w}
            h={h}
          />
        ) : null}
      </G>
    </G>
  );
}
