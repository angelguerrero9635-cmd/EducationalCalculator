import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { CircularMotionSpec } from '@/data/modules/typesHsk';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useRep } from './common';
import { arrowHead } from './graphKit';
import { G_NEWTON } from './hskMath';
import { sci, sig, SubLabel, Vec } from './hskKit';
import { Ball, Metal, TopLight, url, usePaintIds } from './paint';
import { Planet } from './planetArt';

/** Big and small numbers in powers of ten (5.97 × 10²⁴), the rest plainly. */
export const num = (x: number, digits = 3) =>
  Math.abs(x) >= 1e6 || (x !== 0 && Math.abs(x) < 1e-3) ? sci(x, digits) : sig(x, digits);

/** A time in seconds, with minutes, hours or days beside it when it is long. */
export function longTime(s: number): string {
  if (!Number.isFinite(s)) return '?';
  const day = 86400;
  if (s >= 2 * day) return `${num(s)} s (${sig(s / day)} days)`;
  if (s >= 7200) return `${num(s)} s (${sig(s / 3600)} h)`;
  if (s >= 120) return `${num(s)} s (${sig(s / 60)} min)`;
  return `${num(s)} s`;
}

/** The orbit's circle as a share of the canvas. */
const ORBIT = 0.36;
/** Where the satellite sits: 40° above the right-hand side. */
const PHI = 40 * (Math.PI / 180);

/**
 * A satellite in a circular orbit (H102, `circularMotion` mode `satellite`): the central body
 * (to scale when `bodyRadius` is given), the orbit of radius r, the satellite with its velocity
 * v = √(GM/r) along the orbit and its acceleration GM/r² toward the center, and the period
 * T = 2πr/v. Drag the satellite in or out for r.
 */
export function CircularSatellite({ spec, calc }: { spec: CircularMotionSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('sun', 'body', 'panel', 'light');
  const drag = useRef(0);
  const si = (x: number | string | undefined, d = 0) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) => typeof x !== 'string' || rep.known(x);
  const M = Math.max(0, si(spec.central, 5.97e24));
  const r = Math.max(1e-9, si(spec.radius, 1));
  const v = Math.sqrt((G_NEWTON * M) / r);
  const g = (G_NEWTON * M) / (r * r);
  const T = v > 0 ? (2 * Math.PI * r) / v : NaN;
  const R = spec.bodyRadius === undefined ? undefined : Math.max(0, si(spec.bodyRadius));
  const all = [spec.central, spec.radius, spec.bodyRadius].every(known);
  // A "?" box reads "?" on the picture too, not the example's number drawn faded behind it.
  const mOk = known(spec.central);
  const rOk = known(spec.radius);
  const ok = mOk && rOk;
  const q = (yes: boolean, text: string) => (yes ? text : '?');
  const body = spec.body ?? 'earth';

  return (
    <View>
      <Canvas aspect={0.92}>
        {({ w, h }) => {
          const O = { x: w * 0.44, y: h * 0.47 };
          const Rpx = Math.min(w * ORBIT, h * 0.37);
          const P = { x: O.x + Rpx * Math.cos(PHI), y: O.y - Rpx * Math.sin(PHI) };
          // Counterclockwise: the velocity is along the orbit, up and to the left here.
          const t = { x: -Math.sin(PHI), y: -Math.cos(PHI) };
          const toC = { x: (O.x - P.x) / Rpx, y: (O.y - P.y) / Rpx };
          const scaled = R !== undefined ? (Rpx * R) / r : Rpx * 0.3;
          const Rb = Math.min(Rpx * 0.92, Math.max(7, scaled));
          const toScale = R !== undefined && Math.abs(Rb - scaled) < 0.5;
          const arrowDir = (a: number) => {
            const p = { x: O.x + Rpx * Math.cos(a), y: O.y - Rpx * Math.sin(a) };
            return arrowHead(p.x, p.y, -Math.sin(a), -Math.cos(a), 8);
          };
          // r's label below the radius's middle, unless it would touch GM/r²'s (right-aligned
          // under the satellite): then on the line's other side, ending at it.
          const rText = `r = ${q(rOk, num(r))} m`;
          const gText = `GM/r² = ${q(ok, num(g))} m/s²`;
          const mid = { x: (O.x + P.x) / 2, y: (O.y + P.y) / 2 };
          const charW = chart.label * 0.6;
          const rBelow = { x: mid.x + 12, y: mid.y + 16 };
          const gY = P.y + 32;
          const touch =
            Math.abs(rBelow.y - gY) < 28 &&
            rBelow.x + rText.length * charW + 6 > w - 4 - gText.length * charW;
          const rAt = touch ? { x: mid.x - 10, y: mid.y - 8 } : rBelow;
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Ball id={ids.sun} color={c.sunDisk} />
                  <Metal id={ids.body} light={c.metal} dark={c.chartMuted} />
                  <TopLight id={ids.light} />
                </Defs>
                <G opacity={all ? 1 : 0.45}>
                  <Circle
                    cx={O.x}
                    cy={O.y}
                    r={Rpx}
                    stroke={c.chartMuted}
                    strokeWidth={1.5}
                    strokeDasharray={chart.dash}
                    fill="none"
                  />
                  {[160, 250, 340].map((d) => (
                    <Path key={d} d={arrowDir(d * (Math.PI / 180))} fill={c.chartMuted} />
                  ))}
                  {body === 'sun' ? (
                    <Circle cx={O.x} cy={O.y} r={Rb} fill={url(ids.sun)} />
                  ) : (
                    <Planet name={body} x={O.x} y={O.y} r={Rb} />
                  )}
                  {/* The radius r from the center to the satellite. */}
                  <Line
                    x1={O.x}
                    y1={O.y}
                    x2={P.x}
                    y2={P.y}
                    stroke={c.chartInk}
                    strokeWidth={1.2}
                    strokeDasharray={chart.dashFine}
                  />
                  <SubLabel
                    x={rAt.x}
                    y={rAt.y}
                    text={rText}
                    anchor={touch ? 'end' : 'start'}
                    w={w}
                  />
                  <Vec
                    x1={P.x}
                    y1={P.y}
                    x2={P.x + t.x * 70}
                    y2={P.y + t.y * 70}
                    color={c.forceApplied}
                  />
                  <SubLabel
                    x={P.x + t.x * 70 + 6}
                    y={P.y + t.y * 70 - 6}
                    text={`v = ${q(ok, num(v))} m/s`}
                    anchor="start"
                    color={c.forceApplied}
                    w={w}
                  />
                  <Vec
                    x1={P.x}
                    y1={P.y}
                    x2={P.x + toC.x * 44}
                    y2={P.y + toC.y * 44}
                    color={c.forceWeight}
                  />
                  <SubLabel
                    // Right-aligned below the satellite: placed after it, the label ran past the
                    // edge and slid back under the solar panel.
                    x={w - 4}
                    y={gY}
                    anchor="end"
                    text={gText}
                    color={c.forceWeight}
                    w={w}
                  />
                  {/* The satellite: a metal body between two solar panels. */}
                  <G transform={`rotate(${-90 + (PHI * 180) / Math.PI} ${P.x} ${P.y})`}>
                    <Rect
                      x={P.x - 17}
                      y={P.y - 4}
                      width={34}
                      height={8}
                      fill={c.satellitePanel}
                      stroke={c.chartInk}
                      strokeWidth={0.8}
                    />
                    <Rect x={P.x - 17} y={P.y - 4} width={34} height={8} fill={url(ids.light)} />
                    <Rect
                      x={P.x - 6}
                      y={P.y - 7}
                      width={12}
                      height={14}
                      rx={2}
                      fill={url(ids.body)}
                      stroke={c.chartInk}
                      strokeWidth={0.8}
                    />
                  </G>
                  <SubLabel
                    x={O.x}
                    y={Rb > 40 ? O.y + 5 : O.y + Rb + 18}
                    text={`M = ${q(mOk, num(M))} kg`}
                    w={w}
                  />
                  <SubLabel
                    x={O.x}
                    y={O.y + Rpx + 22}
                    text={`T = ${ok ? longTime(T) : '? s'}`}
                    w={w}
                  />
                  {!toScale ? (
                    <ChartText
                      x={w - 6}
                      y={h - 8}
                      textAnchor="end"
                      fontSize={chart.label}
                      fill={c.chartMuted}
                    >
                      not to scale
                    </ChartText>
                  ) : null}
                </G>
              </Svg>
              {!spec.fixed && typeof spec.radius === 'string' && rep.known(spec.radius) ? (
                <DragHandle
                  testID="drag-radius"
                  x={P.x}
                  y={P.y}
                  label={rep.variable(spec.radius).name}
                  onStart={() => {
                    drag.current = r;
                  }}
                  onMove={(dx, dy) => {
                    const id = spec.radius as string;
                    const out = -(dx * toC.x + dy * toC.y);
                    calc.set(
                      {
                        ...rep.pin(
                          [spec.central, spec.bodyRadius].filter(
                            (x): x is string => typeof x === 'string',
                          ),
                        ),
                        // Never dragged inside the body: an orbit there is not possible.
                        [id]: rep.snapTo(
                          id,
                          Math.max(
                            R !== undefined && R > 0 ? R * 1.01 : 0,
                            drag.current * Math.max(0.2, (Rpx + out) / Rpx),
                          ),
                        ),
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
      <Caption>{captionLines().join(' · ')}</Caption>
    </View>
  );

  function captionLines(): string[] {
    const out = [
      ok
        ? `Orbital speed: v = √(GM/r) = √(${num(G_NEWTON)} × ${num(M)}/${num(r)}) = ${num(v)} m/s`
        : 'Orbital speed: v = √(GM/r)',
      ok ? `Period: T = 2πr/v = 2π × ${num(r)}/${num(v)} = ${longTime(T)}` : 'Period: T = 2πr/v',
      'Gravity is the centripetal force: GMm/r² = mv²/r, so the satellite’s own mass cancels.',
    ];
    if (R !== undefined && rOk && r > R)
      out.push(`It orbits ${num(r - R)} m above the surface (r − R, with R = ${num(R)} m).`);
    if (R !== undefined && rOk && r <= R) out.push('An orbit inside the body is not possible.');
    return out;
  }
}
