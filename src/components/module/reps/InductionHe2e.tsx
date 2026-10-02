/**
 * HC19 (college round 2, group E): `induction` field sources (`mode: 'field'`: a long wire, a
 * loop on its axis or in a uniform field, a solenoid, a toroid, charging plates) and the
 * sliding rod on rails (`rails`). B lines are traced from Biot–Savart (he2eMath.ts) or are the
 * circles Ampère's law gives; a "?" box draws nothing for its value. Flat diagrams with copper
 * wire and steel rails painted.
 */
import { useMemo, useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { InductionField, InductionRails } from '@/data/modules/typesHe2e';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen } from './common';
import { arrowAt, pathOf } from './fieldLines';
import { arrowHead } from './graphKit';
import { CurvedArrow } from './hs3aKit';
import { inside, Lab, labW, n3, PageMark, useHe2e } from './he2eKit';
import {
  loopAxial,
  loopsField,
  loopTorque,
  MU0,
  platesOf,
  railsOf,
  solenoidOf,
  solenoidStarts,
  toroidField,
  traceMeridian,
  wireField,
  wireForce,
} from './he2eMath';
import { RAD, Vec, worked } from './hskKit';
import { Metal, Sheen, url, usePaintIds } from './paint';

type Spec = (InductionField | InductionRails) & { kind: 'induction'; fixed?: boolean };
type Field<S extends InductionField['source']> = Extract<InductionField, { source: S }> & {
  kind: 'induction';
  fixed?: boolean;
};
type Reader = ReturnType<typeof useHe2e>;

export function InductionHe2e({ spec, calc }: { spec: Spec; calc: Calculator }) {
  if ('rails' in spec) return <RailsView spec={spec} calc={calc} />;
  switch (spec.source) {
    case 'wire':
      return <WireView spec={spec} calc={calc} />;
    case 'loop':
      return spec.uniform ? (
        <TorqueView spec={spec} calc={calc} />
      ) : (
        <LoopView spec={spec} calc={calc} />
      );
    case 'solenoid':
      return <SolenoidView spec={spec} calc={calc} />;
    case 'toroid':
      return <ToroidView spec={spec} calc={calc} />;
    case 'plates':
      return <PlatesView spec={spec} calc={calc} />;
  }
}

/** A tangent arrowhead on a circle round (cx, cy) at angle a (radians, y up), ccw or cw. */
function CircleHead({
  cx,
  cy,
  r,
  a,
  ccw,
  color,
  size = 7,
}: {
  cx: number;
  cy: number;
  r: number;
  a: number;
  ccw: boolean;
  color: string;
  size?: number;
}) {
  const x = cx + r * Math.cos(a);
  const y = cy - r * Math.sin(a);
  const s = ccw ? 1 : -1;
  return <Path d={arrowHead(x, y, -Math.sin(a) * s, -Math.cos(a) * s, size)} fill={color} />;
}

/** A copper wire end-on: a lit copper disc with the current's • or ×. */
function WireEnd({
  x,
  y,
  r,
  out,
  paint,
  mark = true,
}: {
  x: number;
  y: number;
  r: number;
  out: boolean;
  paint: string;
  mark?: boolean;
}) {
  const c = usePalette();
  return (
    <G>
      <Circle cx={x} cy={y} r={r} fill={url(paint)} stroke={c.copperDark} strokeWidth={1.2} />
      {mark ? (
        <PageMark x={x} y={y} r={Math.min(r * 0.8, 7)} out={out} color={c.chartInk} ring={false} />
      ) : null}
    </G>
  );
}

/** A drag along a line from an origin: the value scales with the handle's distance. */
function useScaleDrag(
  r: Reader,
  calc: Calculator,
  id: string | number | undefined,
  pins: string[],
) {
  const start = useRef({ value: 0, px: 1 });
  return (px: number) =>
    typeof id !== 'string'
      ? undefined
      : {
          onStart: () => {
            start.current = { value: r.rep.val(id), px: Math.max(8, px) };
          },
          onMove: (d: number) => {
            const k = Math.max(0.05, (start.current.px + d) / start.current.px);
            calc.set(
              { ...r.rep.pin(pins), [id]: r.rep.snapTo(id, start.current.value * k) },
              r.rep.slide(id),
            );
          },
        };
}

const ids = (...xs: (string | number | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── A long straight wire ─────────────────────────────────────────────────────

function WireView({ spec, calc }: { spec: Field<'wire'>; calc: Calculator }) {
  const c = usePalette();
  const R = useHe2e(calc);
  const paint = usePaintIds('wire', 'wire2');
  const mu0 = spec.mu0 ?? MU0;
  const I = R.v(spec.current, 1);
  const r = Math.max(1e-12, R.v(spec.r, 0.02));
  const thick = spec.radius !== undefined;
  const a = thick ? Math.max(0, R.v(spec.radius, 0.002)) : 0;
  const okI = R.known(spec.current);
  const okR = R.known(spec.r);
  const okA = R.known(spec.radius);
  const okB = okI && okR && okA;
  const inner = spec.region === 'inside' || (!spec.region && thick && r < a);
  const B = inner ? (mu0 * I * r) / (2 * Math.PI * a * a) : wireField(mu0, I, r);
  // A page for one side of the surface with r on the other: faded, and the reason said.
  const wrongSide =
    thick &&
    okR &&
    okA &&
    ((spec.region === 'inside' && r > a) || (spec.region === 'outside' && r < a));
  const second = spec.second !== undefined;
  const I2 = R.v(spec.second, 0);
  const ok2 = R.known(spec.second);
  const FL = wireForce(mu0, I, I2, r);
  const out = I >= 0;
  const reach = Math.max(r, a * 1.15);
  const frozen = useFrozen(reach);
  const drag = useScaleDrag(
    R,
    calc,
    spec.fixed ? undefined : spec.r,
    ids(spec.current, spec.radius, spec.second),
  );
  const aspect = thick ? 1.12 : 0.8;
  const Bsay = R.out(spec.field, B, 'T', okB);
  const lines = [
    ...worked(
      okB,
      inner
        ? `B = μ₀Ir ÷ (2πa²) = ${n3(mu0)} × ${n3(I)} × ${n3(r)} ÷ (2π × ${n3(a)}²) = ${n3(B)} T`
        : `B = μ₀I ÷ (2πr) = ${n3(mu0)} × ${n3(I)} ÷ (2π × ${n3(r)}) = ${n3(B)} T`,
    ),
    ...(spec.H
      ? worked(okI && okR, `H = I ÷ (2πr) = ${n3(Math.abs(I / (2 * Math.PI * r)))} A/m`)
      : []),
    ...(wrongSide
      ? [
          spec.region === 'inside'
            ? 'r is past the surface (r > a): this rule is for inside the wire.'
            : 'r is inside the wire (r < a): this rule is for outside it.',
        ]
      : []),
    ...(thick
      ? [`Inside the wire B grows with r; outside it falls as 1/r. The peak is at r = a.`]
      : []),
    ...(second
      ? worked(
          okI && okR && ok2,
          `F/L = μ₀I₁I₂ ÷ (2πr) = ${n3(Math.abs(FL))} N/m, ${FL >= 0 ? 'pulling the wires together' : 'pushing them apart'}`,
        )
      : []),
  ];
  return (
    <View>
      <Canvas aspect={aspect}>
        {({ w, h }) => {
          const topH = thick ? h * 0.64 : h;
          const O = { x: w * (second ? 0.3 : 0.36), y: topH * 0.5 };
          const Rpx = Math.min(w * (second ? 0.36 : 0.27), topH * 0.36);
          const s = Rpx / frozen.value;
          const rp = r * s;
          const ap = thick ? a * s : 9;
          const P = { x: O.x + rp, y: O.y };
          const rings = [0.45, 1, 1.6, 2.2].map((k) => k * Rpx);
          const Bat = (px: number) => wireField(mu0, Math.abs(I), px / s, a);
          const Bref = Math.max(1e-30, Bat(rp));
          const vecLen = (px: number) => Math.min(64, (38 * Bat(px)) / Bref);
          const dragAt = drag(rp);
          return (
            <View>
              <Svg width={w} height={h} opacity={wrongSide ? 0.45 : 1}>
                <Defs>
                  <Metal id={paint.wire} light={c.copper} dark={c.copperDark} />
                  <Metal id={paint.wire2} light={c.copper} dark={c.copperDark} />
                </Defs>
                {/* B lines: circles round the wire, ccw for current out of the page. */}
                {okI
                  ? rings.map((rad, i) => (
                      <G key={i}>
                        <Circle
                          cx={O.x}
                          cy={O.y}
                          r={rad}
                          stroke={c.he2eField}
                          strokeWidth={1.3}
                          fill="none"
                          opacity={0.75}
                        />
                        {[0.75, 1.75].map((t) => (
                          <CircleHead
                            key={t}
                            cx={O.x}
                            cy={O.y}
                            r={rad}
                            a={t * Math.PI + i * 0.25}
                            ccw={out}
                            color={c.he2eField}
                          />
                        ))}
                        {/* B here, to the same scale as at r: it falls off away from the wire. */}
                        {I !== 0 && Math.abs(rad - rp) > 6 && O.x - rad > 4 ? (
                          <Vec
                            x1={O.x - rad}
                            y1={O.y}
                            x2={O.x - rad}
                            y2={O.y + (out ? 1 : -1) * vecLen(rad)}
                            color={c.he2eField}
                            width={2}
                            head={7}
                          />
                        ) : null}
                      </G>
                    ))
                  : null}
                {thick ? (
                  <G>
                    <Circle
                      cx={O.x}
                      cy={O.y}
                      r={Math.max(3, ap)}
                      fill={url(paint.wire)}
                      stroke={c.copperDark}
                      strokeWidth={1.2}
                    />
                    {okI
                      ? gridIn(Math.max(3, ap), 13).map(([dx, dy], i) => (
                          <PageMark
                            key={i}
                            x={O.x + dx}
                            y={O.y + dy}
                            r={3}
                            out={out}
                            color={c.chartInk}
                            ring={false}
                            width={1.1}
                          />
                        ))
                      : null}
                  </G>
                ) : (
                  <WireEnd x={O.x} y={O.y} r={9} out={out} paint={paint.wire} mark={okI} />
                )}
                {/* The Amperian circle at r and B there. */}
                {okR ? (
                  <G>
                    <Circle
                      cx={O.x}
                      cy={O.y}
                      r={rp}
                      stroke={c.he2eSurface}
                      strokeWidth={1.8}
                      strokeDasharray={chart.dash}
                      fill="none"
                    />
                    <Line
                      x1={O.x}
                      y1={O.y}
                      x2={P.x}
                      y2={P.y}
                      stroke={c.chartMuted}
                      strokeWidth={1.2}
                    />
                    {second ? (
                      <WireEnd x={P.x} y={P.y} r={8} out={I2 >= 0} paint={paint.wire2} mark={ok2} />
                    ) : (
                      <Circle cx={P.x} cy={P.y} r={3.5} fill={c.chartInk} />
                    )}
                    {okB && I !== 0 ? (
                      <Vec
                        x1={P.x}
                        y1={P.y - (second ? 9 : 0)}
                        x2={P.x}
                        y2={P.y - (out ? 1 : -1) * 38 - (second ? 9 : 0)}
                        color={c.he2eField}
                        width={2.6}
                      />
                    ) : null}
                  </G>
                ) : null}
                {second && okR && okI && ok2 && FL !== 0 ? (
                  <G>
                    {/* Each wire is pulled toward the other (same way) or pushed off. */}
                    <Vec
                      x1={P.x + (FL > 0 ? -10 : 10)}
                      y1={P.y + 16}
                      x2={P.x + (FL > 0 ? -40 : 40)}
                      y2={P.y + 16}
                      color={c.forceApplied}
                      width={2.6}
                    />
                    <Vec
                      x1={O.x + (FL > 0 ? 10 : -10)}
                      y1={O.y + 16}
                      x2={O.x + (FL > 0 ? 40 : -40)}
                      y2={O.y + 16}
                      color={c.forceApplied}
                      width={2.6}
                    />
                  </G>
                ) : null}
                {/* Labels. */}
                <Lab
                  x={O.x}
                  y={O.y - Math.max(ap, 9) - 8}
                  sym={second ? 'I₁' : 'I'}
                  value={R.say(spec.current, I, 'A')}
                  anchor="middle"
                />
                {thick ? (
                  <Lab
                    x={O.x - Math.max(ap, 9) - 6}
                    y={O.y + Math.max(ap, 9) + 14}
                    sym="a"
                    value={R.say(spec.radius, a, 'm')}
                    anchor="end"
                  />
                ) : null}
                {okR ? (
                  <Lab
                    x={(O.x + P.x) / 2 + (thick ? 10 : 0)}
                    y={O.y + (second ? 34 : 15)}
                    sym="r"
                    value={R.say(spec.r, r, 'm')}
                    anchor="middle"
                  />
                ) : null}
                {okR ? (
                  <Lab
                    x={inside(P.x + 8, labW('B', Bsay), w)}
                    y={P.y - 26 - (second ? 9 : 0)}
                    sym="B"
                    value={Bsay}
                    bold
                    color={c.he2eField}
                  />
                ) : null}
                {second && okR ? (
                  <Lab
                    x={P.x}
                    y={P.y + 36}
                    sym="I₂"
                    value={R.say(spec.second, I2, 'A')}
                    anchor="middle"
                  />
                ) : null}
                {thick ? (
                  <WireGraph
                    x0={34}
                    y0={topH + 10}
                    x1={w - 14}
                    y1={h - 22}
                    a={a}
                    r={okR ? r : undefined}
                    shape={(x) => wireField(mu0, 1, x, a)}
                  />
                ) : null}
              </Svg>
              {dragAt && okR ? (
                <DragHandle
                  testID="drag-r"
                  x={P.x + (second ? 0 : 0)}
                  y={P.y}
                  label="distance r"
                  onStart={() => {
                    frozen.freeze();
                    dragAt.onStart();
                  }}
                  onEnd={frozen.release}
                  onMove={(dx) => dragAt.onMove(dx)}
                />
              ) : null}
            </View>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

/** Points on a square grid inside a disc of radius rad (for the current's marks). */
function gridIn(rad: number, step: number): [number, number][] {
  const out: [number, number][] = [];
  const n = Math.floor(rad / step);
  for (let i = -n; i <= n; i++)
    for (let j = -n; j <= n; j++)
      if (Math.hypot(i * step, j * step) <= rad - 5) out.push([i * step, j * step]);
  return out.length ? out : [[0, 0]];
}

/** B against r for a thick wire: a straight rise to the surface, then 1/r; the point at r. */
function WireGraph({
  x0,
  y0,
  x1,
  y1,
  a,
  r,
  shape,
}: {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  a: number;
  r?: number;
  shape: (x: number) => number;
}) {
  const c = usePalette();
  const xmax = Math.max(a, r ?? 0) * 2.6 || 1;
  const peak = shape(a) || 1;
  const X = (x: number) => x0 + ((x1 - x0) * x) / xmax;
  const Y = (b: number) => y1 - ((y1 - y0) * b) / (peak * 1.12);
  const pts: [number, number][] = Array.from({ length: 81 }, (_, i) => {
    const x = (xmax * i) / 80;
    return [X(x), Y(shape(x))];
  });
  return (
    <G>
      <Line x1={x0} y1={y1} x2={x1} y2={y1} stroke={c.chartInk} strokeWidth={1.2} />
      <Line x1={x0} y1={y1} x2={x0} y2={y0} stroke={c.chartInk} strokeWidth={1.2} />
      <Path d={pathOf(pts)} stroke={c.he2eField} strokeWidth={2.2} fill="none" />
      <Line
        x1={X(a)}
        y1={y1}
        x2={X(a)}
        y2={Y(peak)}
        stroke={c.chartMuted}
        strokeDasharray={chart.dashFine}
      />
      <Lab x={X(a)} y={y1 + 14} sym="a" anchor="middle" />
      {r !== undefined ? (
        <G>
          <Circle cx={X(r)} cy={Y(shape(r))} r={4} fill={c.he2eSurface} />
          {Math.abs(X(r) - X(a)) > 14 ? <Lab x={X(r)} y={y1 + 14} sym="r" anchor="middle" /> : null}
        </G>
      ) : null}
      <Lab x={x1} y={y1 - 6} sym="r" anchor="end" />
      <Lab x={x0 - 6} y={y0 + 10} sym="B" anchor="end" />
    </G>
  );
}

// ─── A loop on its axis ───────────────────────────────────────────────────────

/** A loop's B lines in the plane through its axis, in units of R (fixed: traced once). */
let loopLines: [number, number][][] | undefined;
function loopLinesOf() {
  if (loopLines) return loopLines;
  const f = (rho: number, z: number) => loopsField(1, [0], rho, z, 40);
  const box = { r0: -2.2, r1: 2.2, z0: -3.6, z1: 4.4 };
  const starts = [0.25, 0.55, 0.8].flatMap((k) => [k, -k]);
  loopLines = [
    [
      [0, -3.6],
      [0, 4.4],
    ],
    ...starts.map((rho) =>
      traceMeridian(
        f,
        [rho, 0],
        box,
        [
          [1, 0],
          [-1, 0],
        ],
        0.05,
        0.05,
        500,
      ),
    ),
  ];
  return loopLines;
}

function LoopView({ spec, calc }: { spec: Field<'loop'>; calc: Calculator }) {
  const c = usePalette();
  const R = useHe2e(calc);
  const mu0 = spec.mu0 ?? MU0;
  const I = R.v(spec.current, 1);
  const Rr = Math.max(1e-12, R.v(spec.radius, 0.1));
  const N = Math.max(1, R.v(spec.turns, 1));
  const z = R.v(spec.z, 0);
  const okI = R.known(spec.current) && R.known(spec.turns);
  const okR = R.known(spec.radius);
  const okZ = spec.z !== undefined && R.known(spec.z);
  const B0 = loopAxial(mu0, N, I, Rr, 0);
  const Bz = loopAxial(mu0, N, I, Rr, z);
  const lines = loopLinesOf();
  const right = I >= 0;
  const drag = useScaleDrag(
    R,
    calc,
    spec.fixed ? undefined : spec.z,
    ids(spec.current, spec.radius, spec.turns),
  );
  const B0say = R.out(spec.center, B0, 'T', okI && okR);
  const Bsay = R.out(spec.field, Bz, 'T', okI && okR && okZ);
  const capLines = [
    ...worked(
      okI && okR,
      `B₀ = μ₀NI ÷ (2R) = ${n3(mu0)} × ${n3(N)} × ${n3(I)} ÷ (2 × ${n3(Rr)}) = ${n3(B0)} T`,
    ),
    ...(spec.z !== undefined
      ? worked(
          okI && okR && okZ,
          `B = μ₀NIR² ÷ (2(z² + R²)^(3/2)) = ${n3(Bz)} T, B ÷ B₀ = ${n3(Bz / B0)}`,
        )
      : []),
    'On the axis the sideways parts of dB from opposite pieces cancel.',
  ];
  return (
    <View>
      <Canvas aspect={0.78}>
        {({ w, h }) => {
          const C = { x: w * 0.36, y: h * 0.48 };
          const Rpx = Math.min(h * 0.3, w * 0.2);
          const X = (zz: number) => C.x + zz * Rpx;
          const Y = (rho: number) => C.y - rho * Rpx;
          const zMax = (w - 18 - C.x) / Rpx;
          const zDraw = Math.max(-C.x / Rpx + 0.3, Math.min(zMax, z / Rr));
          const P = { x: X(zDraw), y: C.y };
          const far = Math.abs(z / Rr) > zMax;
          const dragAt = drag(Math.abs(P.x - C.x));
          const len = (b: number) => Math.max(0, Math.min(70, (46 * Math.abs(b)) / Math.abs(B0)));
          return (
            <View>
              <Svg width={w} height={h}>
                {/* The back half of the loop, behind the lines. */}
                <Path
                  d={`M ${C.x} ${Y(1)} A ${Rpx * 0.2} ${Rpx} 0 0 0 ${C.x} ${Y(-1)}`}
                  stroke={c.copperDark}
                  strokeWidth={3}
                  fill="none"
                />
                {okI && I !== 0
                  ? lines.map((pts, i) => {
                      const scr = pts.map(([rho, zz]) => [X(zz), Y(rho)] as [number, number]);
                      const at = arrowAt(scr, i === 0 ? 0.82 : 0.3);
                      return (
                        <G key={i}>
                          <Path
                            d={pathOf(scr)}
                            stroke={c.he2eField}
                            strokeWidth={1.3}
                            fill="none"
                            opacity={0.75}
                          />
                          {at ? (
                            <Path
                              d={arrowHead(
                                at.x,
                                at.y,
                                Math.cos(at.angle * RAD) * (right ? 1 : -1),
                                Math.sin(at.angle * RAD) * (right ? 1 : -1),
                                7,
                              )}
                              fill={c.he2eField}
                            />
                          ) : null}
                        </G>
                      );
                    })
                  : null}
                {/* The front half, and where the loop crosses the page: • out, × in. */}
                <Path
                  d={`M ${C.x} ${Y(1)} A ${Rpx * 0.2} ${Rpx} 0 0 1 ${C.x} ${Y(-1)}`}
                  stroke={c.copper}
                  strokeWidth={4}
                  fill="none"
                />
                {okI ? (
                  <G>
                    <PageMark x={C.x} y={Y(1)} r={6} out={right} color={c.chartInk} />
                    <PageMark x={C.x} y={Y(-1)} r={6} out={!right} color={c.chartInk} />
                  </G>
                ) : null}
                {okR ? (
                  <G>
                    <Line
                      x1={C.x - 14}
                      y1={C.y}
                      x2={C.x - 14}
                      y2={Y(1)}
                      stroke={c.chartMuted}
                      strokeDasharray={chart.dashFine}
                    />
                    <Lab
                      x={C.x - 18}
                      y={(C.y + Y(1)) / 2 + 4}
                      sym="R"
                      value={R.say(spec.radius, Rr, 'm')}
                      anchor="end"
                    />
                  </G>
                ) : null}
                <Lab
                  x={C.x + 10}
                  y={Y(1) - 6}
                  sym={N > 1 ? 'NI' : 'I'}
                  value={
                    N > 1
                      ? `${R.say(spec.turns, N, '')} × ${R.say(spec.current, I, 'A')}`
                      : R.say(spec.current, I, 'A')
                  }
                />
                {okI && okR && I !== 0 ? (
                  <G>
                    <Vec
                      x1={C.x}
                      y1={C.y}
                      x2={C.x + (right ? 1 : -1) * len(B0)}
                      y2={C.y}
                      color={c.chartInk}
                      width={2.6}
                    />
                    <Lab x={C.x + 6} y={C.y + 18} sym="B₀" value={B0say} bold />
                  </G>
                ) : null}
                {okZ ? (
                  <G>
                    <Circle cx={P.x} cy={P.y} r={3.5} fill={c.he2eSurface} />
                    {okI && okR && I !== 0 ? (
                      <Vec
                        x1={P.x}
                        y1={P.y}
                        x2={P.x + (right ? 1 : -1) * len(Bz)}
                        y2={P.y}
                        color={c.he2eSurface}
                        width={2.6}
                      />
                    ) : null}
                    <Lab
                      x={inside(P.x - labW('B', Bsay) / 2, labW('B', Bsay), w)}
                      y={P.y - 12}
                      sym="B"
                      value={Bsay}
                      bold
                      color={c.he2eSurface}
                    />
                    <Line
                      x1={C.x}
                      y1={Y(-1) + 18}
                      x2={P.x}
                      y2={Y(-1) + 18}
                      stroke={c.chartMuted}
                      strokeWidth={1.2}
                    />
                    <Lab
                      x={(C.x + P.x) / 2}
                      y={Y(-1) + 34}
                      sym="z"
                      value={`${R.say(spec.z, z, 'm')}${far ? ' (drawn closer)' : ''}`}
                      anchor="middle"
                    />
                  </G>
                ) : null}
              </Svg>
              {dragAt && okZ ? (
                <DragHandle
                  testID="drag-z"
                  x={P.x}
                  y={P.y}
                  label="axial distance z"
                  onStart={dragAt.onStart}
                  onMove={(dx) => dragAt.onMove(z >= 0 ? dx : -dx)}
                />
              ) : null}
            </View>
          );
        }}
      </Canvas>
      <Caption>{capLines.join(' · ')}</Caption>
    </View>
  );
}

// ─── A coil in a uniform field ────────────────────────────────────────────────

function TorqueView({ spec, calc }: { spec: Field<'loop'>; calc: Calculator }) {
  const c = usePalette();
  const R = useHe2e(calc);
  const u = spec.uniform!;
  const I = R.v(spec.current, 1);
  const N = Math.max(1, R.v(spec.turns, 1));
  const B = R.v(u.field, 0.1);
  const th = R.v(u.angle, 30);
  const A = R.v(u.area, 0.01);
  const okMu = R.all(spec.current, spec.turns, u.area);
  const okB = R.known(u.field);
  const okTh = R.known(u.angle);
  const t = loopTorque(N, I, A, B, th);
  const muSay = R.out(u.moment, t.mu, 'A·m²', okMu);
  const tauSay = R.out(u.torque, t.torque, 'N·m', okMu && okB && okTh);
  const capLines = [
    ...worked(okMu, `μ = NIA = ${n3(N)} × ${n3(I)} × ${n3(A)} = ${n3(t.mu)} A·m²`),
    ...worked(
      okMu && okB && okTh,
      `τ = μB sin θ = ${n3(t.mu)} × ${n3(B)} × sin ${n3(th)}° = ${n3(t.torque)} N·m`,
    ),
    ...(u.energy ? worked(okMu && okB && okTh, `U = −μB cos θ = ${n3(t.energy)} J`) : []),
    'The torque turns μ toward B.',
  ];
  return (
    <View>
      <Canvas aspect={0.74}>
        {({ w, h }) => {
          const C = { x: w * 0.45, y: h * 0.52 };
          const Rpx = Math.min(h * 0.33, w * 0.26);
          const a = (okTh ? th : 0) * RAD;
          const ex = Math.cos(a);
          const ey = -Math.sin(a);
          const turns = Math.min(5, Math.round(N));
          const ys = [0.12, 0.3, 0.7, 0.88].map((k) => k * h);
          return (
            <Svg width={w} height={h}>
              {/* The uniform field: straight, evenly spaced lines, left to right. */}
              {okB && B !== 0
                ? ys.map((y) => (
                    <G key={y}>
                      <Line
                        x1={8}
                        y1={y}
                        x2={w - 8}
                        y2={y}
                        stroke={c.he2eField}
                        strokeWidth={1.3}
                      />
                      <Path d={arrowHead(w - 8, y, B > 0 ? 1 : -1, 0, 8)} fill={c.he2eField} />
                    </G>
                  ))
                : null}
              {okB ? (
                <Lab
                  x={w - 10}
                  y={ys[0]! - 6}
                  sym="B"
                  value={R.say(u.field, B, 'T')}
                  anchor="end"
                  bold
                  color={c.he2eField}
                />
              ) : null}
              {/* The coil edge-on-ish: its plane square to μ; • and × where it crosses the page. */}
              <G transform={`rotate(${-(okTh ? th : 0)} ${C.x} ${C.y})`}>
                {Array.from({ length: turns }, (_, i) => (
                  <Ellipse
                    key={i}
                    cx={C.x + (i - (turns - 1) / 2) * 3}
                    cy={C.y}
                    rx={Rpx * 0.22}
                    ry={Rpx}
                    stroke={i === turns - 1 ? c.copper : c.copperDark}
                    strokeWidth={2.4}
                    fill="none"
                  />
                ))}
              </G>
              {okMu && I !== 0 ? (
                <G>
                  <PageMark
                    x={C.x + ey * Rpx}
                    y={C.y - ex * Rpx}
                    r={6}
                    out={I > 0}
                    color={c.chartInk}
                  />
                  <PageMark
                    x={C.x - ey * Rpx}
                    y={C.y + ex * Rpx}
                    r={6}
                    out={I < 0}
                    color={c.chartInk}
                  />
                </G>
              ) : null}
              {okMu && okTh ? (
                <G>
                  <Vec
                    x1={C.x}
                    y1={C.y}
                    x2={C.x + ex * Rpx * 0.95}
                    y2={C.y + ey * Rpx * 0.95}
                    color={c.chartHighlight}
                    width={3}
                  />
                  <Lab
                    x={inside(C.x + ex * Rpx + 6, labW('μ', muSay), w)}
                    y={C.y + ey * Rpx - 6}
                    sym="μ"
                    value={muSay}
                    bold
                    color={c.chartHighlight}
                  />
                  <Line
                    x1={C.x}
                    y1={C.y}
                    x2={C.x + Rpx * 0.95}
                    y2={C.y}
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dashFine}
                  />
                  {th !== 0 ? (
                    <Path
                      d={`M ${C.x + 30} ${C.y} A 30 30 0 0 ${th > 0 ? 0 : 1} ${C.x + 30 * ex} ${C.y + 30 * ey}`}
                      stroke={c.chartInk}
                      strokeWidth={1.2}
                      fill="none"
                    />
                  ) : null}
                  <Lab
                    x={C.x + 36 * Math.cos(a / 2)}
                    y={C.y - 36 * Math.sin(a / 2) + 4}
                    sym="θ"
                    value={R.say(u.angle, th, '°').replace(' °', '°')}
                  />
                </G>
              ) : null}
              {okMu && okB && okTh && t.torque !== 0 ? (
                <G>
                  <CurvedArrow
                    cx={C.x}
                    cy={C.y}
                    r={Rpx * 0.55}
                    from={a + Math.PI * 0.55}
                    to={a + Math.PI * 0.55 + (t.torque > 0 ? -0.9 : 0.9)}
                    color={c.forceApplied}
                    width={2.4}
                  />
                  <Lab x={8} y={h - 10} sym="τ" value={tauSay} bold color={c.forceApplied} />
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{capLines.join(' · ')}</Caption>
    </View>
  );
}

// ─── A solenoid ───────────────────────────────────────────────────────────────

function SolenoidView({ spec, calc }: { spec: Field<'solenoid'>; calc: Calculator }) {
  const c = usePalette();
  const R = useHe2e(calc);
  const paint = usePaintIds('turn', 'body');
  const mu0 = spec.mu0 ?? MU0;
  const I = R.v(spec.current, 1);
  const N = Math.max(1, R.v(spec.turns, 100));
  const len = Math.max(1e-9, R.v(spec.length, 0.1));
  const A = spec.area === undefined ? undefined : Math.max(0, R.v(spec.area, 1e-4));
  const okI = R.known(spec.current);
  const okN = R.known(spec.turns);
  const okL = R.known(spec.length);
  const okA = R.known(spec.area);
  const s = solenoidOf(mu0, N, len, I, A);
  const D = A !== undefined && okA ? 2 * Math.sqrt(A / Math.PI) : len / 4;
  const k = Math.min(20, Math.max(2, Math.round(N)));
  const Bsay = R.out(spec.field, s.B, 'T', okI && okN && okL);
  const capLines = [
    ...worked(okN && okL, `n = N ÷ ℓ = ${n3(N)} ÷ ${n3(len)} = ${n3(s.n)} turns/m`),
    ...worked(okI && okN && okL, `B = μ₀nI = ${n3(mu0)} × ${n3(s.n)} × ${n3(I)} = ${n3(s.B)} T`),
    ...(spec.inductance && A !== undefined
      ? worked(okN && okL && okA, `L = μ₀N²A ÷ ℓ = ${n3(s.L)} H`)
      : []),
    ...(spec.energy && A !== undefined
      ? worked(okI && okN && okL && okA, `U = ½LI² = ${n3(s.U)} J`)
      : []),
  ];
  return (
    <View>
      <Canvas aspect={0.72}>
        {({ w, h }) => {
          let Lp = w * 0.66;
          let Dp = (Lp * D) / len;
          let wide = false;
          if (Dp < 54) {
            Dp = 54;
            wide = true;
          }
          if (Dp > h * 0.5) {
            Lp *= (h * 0.5) / Dp;
            Dp = h * 0.5;
          }
          const C = { x: w * 0.5, y: h * 0.46 };
          const a = Dp / 2;
          return (
            <SolenoidDrawing
              w={w}
              h={h}
              C={C}
              a={a}
              Lp={Lp}
              k={k}
              out={I >= 0}
              showB={okI && I !== 0}
              paint={paint}
              labels={
                <G>
                  <Lab
                    x={C.x}
                    y={C.y + 4}
                    sym="B"
                    value={Bsay}
                    anchor="middle"
                    bold
                    color={c.he2eField}
                  />
                  <Line
                    x1={C.x - Lp / 2}
                    y1={C.y + a + 26}
                    x2={C.x + Lp / 2}
                    y2={C.y + a + 26}
                    stroke={c.chartMuted}
                  />
                  {[-1, 1].map((sg) => (
                    <Line
                      key={sg}
                      x1={C.x + (sg * Lp) / 2}
                      y1={C.y + a + 20}
                      x2={C.x + (sg * Lp) / 2}
                      y2={C.y + a + 32}
                      stroke={c.chartMuted}
                    />
                  ))}
                  {okL ? (
                    <Lab
                      x={C.x}
                      y={C.y + a + 44}
                      sym="ℓ"
                      value={R.say(spec.length, len, 'm')}
                      anchor="middle"
                    />
                  ) : null}
                  <Lab x={8} y={h - 8} sym="N" value={R.say(spec.turns, N, '').trim()} />
                  <Lab
                    x={w - 8}
                    y={h - 8}
                    sym="I"
                    value={R.say(spec.current, I, 'A')}
                    anchor="end"
                  />
                  {wide ? (
                    <ChartText
                      x={C.x}
                      y={h - 8}
                      fontSize={chart.tiny}
                      textAnchor="middle"
                      fill={c.chartMuted}
                    >
                      diameter drawn wider
                    </ChartText>
                  ) : null}
                </G>
              }
            />
          );
        }}
      </Canvas>
      <Caption>
        {[
          ...capLines,
          'Inside, the lines run straight and evenly spaced: B is the same everywhere.',
        ].join(' · ')}
      </Caption>
    </View>
  );
}

function SolenoidDrawing({
  w,
  h,
  C,
  a,
  Lp,
  k,
  out,
  showB,
  paint,
  labels,
}: {
  w: number;
  h: number;
  C: { x: number; y: number };
  a: number;
  Lp: number;
  k: number;
  out: boolean;
  showB: boolean;
  paint: { turn: string; body: string };
  labels: ReactNode;
}) {
  const c = usePalette();
  // Turns at zs (units of the radius a), the field traced from them.
  const zs = useMemo(
    () => Array.from({ length: k }, (_, i) => (-Lp / 2 + (Lp * (i + 0.5)) / k) / a),
    [k, Lp, a],
  );
  const traced = useMemo(() => {
    const f = (rho: number, z: number) => loopsField(1, zs, rho, z, 24);
    const box = { r0: -C.y / a, r1: (h - C.y) / a, z0: -C.x / a, z1: (w - C.x) / a };
    const wires = zs.flatMap((z) => [[1, z] as [number, number], [-1, z] as [number, number]]);
    const starts = solenoidStarts(1, 3).flatMap((r) => [r, -r]);
    return [
      [
        [0, box.z0],
        [0, box.z1],
      ] as [number, number][],
      ...starts.map((r0) => traceMeridian(f, [r0, 0], box, wires, 0.08, 0.12, 700)),
    ];
  }, [zs, C.x, C.y, a, w, h]);
  const X = (z: number) => C.x + z * a;
  const Y = (rho: number) => C.y - rho * a;
  const tr = Math.min(6, (Lp / k) * 0.42);
  return (
    <Svg width={w} height={h}>
      <Defs>
        <Metal id={paint.turn} light={c.copper} dark={c.copperDark} />
        <Sheen id={paint.body} vertical />
      </Defs>
      {/* A faint former the turns are wound on. */}
      <Rect
        x={C.x - Lp / 2}
        y={C.y - a}
        width={Lp}
        height={2 * a}
        fill={c.chartSurface}
        opacity={0.6}
      />
      {showB
        ? traced.map((pts, i) => {
            const scr = pts.map(([rho, z]) => [X(z), Y(rho)] as [number, number]);
            const at = arrowAt(scr, i === 0 ? 0.8 : 0.5);
            return (
              <G key={i}>
                <Path
                  d={pathOf(scr)}
                  stroke={c.he2eField}
                  strokeWidth={1.3}
                  fill="none"
                  opacity={0.8}
                />
                {at ? (
                  <Path
                    d={arrowHead(
                      at.x,
                      at.y,
                      Math.cos(at.angle * RAD) * (out ? 1 : -1),
                      Math.sin(at.angle * RAD) * (out ? 1 : -1),
                      7,
                    )}
                    fill={c.he2eField}
                  />
                ) : null}
              </G>
            );
          })
        : null}
      {/* The turns cut through: • on top (out of the page), × below. */}
      {zs.map((z) => (
        <G key={z}>
          {[1, -1].map((side) => (
            <G key={side}>
              <Circle
                cx={X(z)}
                cy={Y(side)}
                r={tr}
                fill={url(paint.turn)}
                stroke={c.copperDark}
                strokeWidth={0.8}
              />
              {showB && tr >= 3.5 ? (
                <PageMark
                  x={X(z)}
                  y={Y(side)}
                  r={tr * 0.75}
                  out={side > 0 === out}
                  color={c.chartInk}
                  ring={false}
                  width={1}
                />
              ) : null}
            </G>
          ))}
        </G>
      ))}
      {labels}
    </Svg>
  );
}

// ─── A toroid ─────────────────────────────────────────────────────────────────

function ToroidView({ spec, calc }: { spec: Field<'toroid'>; calc: Calculator }) {
  const c = usePalette();
  const R = useHe2e(calc);
  const mu0 = spec.mu0 ?? MU0;
  const I = R.v(spec.current, 1);
  const N = Math.max(1, R.v(spec.turns, 100));
  const r = Math.max(1e-12, R.v(spec.r, 0.1));
  const okI = R.known(spec.current) && R.known(spec.turns);
  const okR = R.known(spec.r);
  const B = toroidField(mu0, N, I, r);
  const Bsay = R.out(spec.field, B, 'T', okI && okR);
  const ccw = I >= 0;
  const capLines = [
    ...worked(
      okI && okR,
      `B = μ₀NI ÷ (2πr) = ${n3(mu0)} × ${n3(N)} × ${n3(I)} ÷ (2π × ${n3(r)}) = ${n3(B)} T`,
    ),
    'The Amperian circle outside the ring encloses no net current, so B = 0 there.',
  ];
  return (
    <View>
      <Canvas aspect={0.8}>
        {({ w, h }) => {
          const C = { x: w * 0.42, y: h * 0.5 };
          const ro = Math.min(h * 0.42, w * 0.36);
          const ri = ro * 0.56;
          const rm = (ro + ri) / 2;
          const k = Math.min(36, Math.round(N));
          return (
            <Svg width={w} height={h}>
              {/* The core, a ring. */}
              <Circle
                cx={C.x}
                cy={C.y}
                r={rm}
                stroke={c.chartSurface}
                strokeWidth={ro - ri}
                fill="none"
              />
              <Circle cx={C.x} cy={C.y} r={ro} stroke={c.chartGrid} fill="none" />
              <Circle cx={C.x} cy={C.y} r={ri} stroke={c.chartGrid} fill="none" />
              {okI && I !== 0
                ? [ri + (ro - ri) * 0.22, ri + (ro - ri) * 0.78].map((rad) => (
                    <G key={rad}>
                      <Circle
                        cx={C.x}
                        cy={C.y}
                        r={rad}
                        stroke={c.he2eField}
                        strokeWidth={1.3}
                        fill="none"
                      />
                      {[0.15, 0.65, 1.15, 1.65].map((t) => (
                        <CircleHead
                          key={t}
                          cx={C.x}
                          cy={C.y}
                          r={rad}
                          a={t * Math.PI}
                          ccw={ccw}
                          color={c.he2eField}
                          size={6}
                        />
                      ))}
                    </G>
                  ))
                : null}
              {/* The windings: copper across the ring, current • up on the inside, × outside. */}
              {Array.from({ length: k }, (_, i) => {
                const t = (i / k) * 2 * Math.PI;
                const [cx, sy] = [Math.cos(t), Math.sin(t)];
                return (
                  <G key={i}>
                    <Line
                      x1={C.x + cx * (ri - 3)}
                      y1={C.y - sy * (ri - 3)}
                      x2={C.x + cx * (ro + 3)}
                      y2={C.y - sy * (ro + 3)}
                      stroke={c.copper}
                      strokeWidth={2.4}
                      strokeLinecap="round"
                    />
                    {okI && I !== 0 && k <= 24 ? (
                      <G>
                        <PageMark
                          x={C.x + cx * (ri - 7)}
                          y={C.y - sy * (ri - 7)}
                          r={3}
                          out={ccw}
                          color={c.chartInk}
                          ring={false}
                          width={1}
                        />
                      </G>
                    ) : null}
                  </G>
                );
              })}
              {/* The Amperian circle at r, in the core. */}
              {okR ? (
                <G>
                  <Circle
                    cx={C.x}
                    cy={C.y}
                    r={rm}
                    stroke={c.he2eSurface}
                    strokeWidth={1.8}
                    strokeDasharray={chart.dash}
                    fill="none"
                  />
                  <Line
                    x1={C.x}
                    y1={C.y}
                    x2={C.x + rm * Math.cos(-0.5)}
                    y2={C.y - rm * Math.sin(-0.5)}
                    stroke={c.chartMuted}
                    strokeWidth={1.2}
                  />
                  <Lab x={C.x + 8} y={C.y + 26} sym="r" value={R.say(spec.r, r, 'm')} />
                </G>
              ) : null}
              <Lab
                x={C.x}
                y={C.y - ro - 10 < 12 ? 12 : C.y - ro - 10}
                sym="B"
                value={Bsay}
                anchor="middle"
                bold
                color={c.he2eField}
              />
              <Lab x={inside(C.x + ro + 10, 50, w)} y={C.y + 4} sym="B" value="0" />
              <Lab
                x={C.x}
                y={C.y - 4}
                sym="N"
                value={R.say(spec.turns, N, '').trim()}
                anchor="middle"
              />
              <Lab x={w - 8} y={h - 8} sym="I" value={R.say(spec.current, I, 'A')} anchor="end" />
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{capLines.join(' · ')}</Caption>
    </View>
  );
}

// ─── Charging plates ──────────────────────────────────────────────────────────

function PlatesView({ spec, calc }: { spec: Field<'plates'>; calc: Calculator }) {
  const c = usePalette();
  const R = useHe2e(calc);
  const paint = usePaintIds('plate', 'wire');
  const mu0 = spec.mu0 ?? MU0;
  const eps0 = spec.eps0 ?? 8.85e-12;
  const I = R.v(spec.current, 1);
  const Rr = Math.max(1e-12, R.v(spec.radius, 0.05));
  const r = Math.max(0, R.v(spec.r, 0.03));
  const okI = R.known(spec.current);
  const okR = R.known(spec.radius);
  const okr = R.known(spec.r);
  const p = platesOf(mu0, eps0, I, Rr, r, true);
  // The rule I(r/R)² is for a circle between the plates: past the rim, faded with the reason.
  const past = okR && okr && r > Rr;
  const Bsay = R.out(spec.field, p.B, 'T', okI && okR && okr);
  const capLines = [
    ...worked(okI && okR, `dE/dt = I ÷ (ε₀πR²) = ${n3(p.rate)} V/(m·s)`),
    ...worked(
      okI && okR && okr,
      `Displacement current inside r: I(r ÷ R)² = ${n3(I)} × (${n3(r)} ÷ ${n3(Rr)})² = ${n3(p.Id)} A`,
    ),
    ...worked(
      okI && okR && okr,
      `Round the circle, B = μ₀(current inside) ÷ (2πr) = ${n3(mu0)} × ${n3(p.Id)} ÷ (2π × ${n3(r)}) = ${n3(p.B)} T`,
    ),
    ...(past ? ['r is past the plates’ rim (r > R): this rule is for a circle between them.'] : []),
  ];
  return (
    <View>
      <Canvas aspect={0.74}>
        {({ w, h }) => {
          const C = { x: w * 0.5, y: h * 0.48 };
          const big = Math.max(Rr, r);
          const Rp = Math.min(h * 0.36, w * 0.3);
          const s = Rp / big;
          const Rpx = Rr * s;
          const rpx = r * s;
          const gap = w * 0.3;
          const [xl, xr] = [C.x - gap / 2, C.x + gap / 2];
          const slant = 0.32;
          const dir = I >= 0 ? 1 : -1;
          return (
            <Svg width={w} height={h} opacity={past ? 0.45 : 1}>
              <Defs>
                <Sheen id={paint.plate} />
                <Sheen id={paint.wire} vertical />
              </Defs>
              {/* Wires in and out along the axis. */}
              {[
                [8, xl],
                [xr, w - 8],
              ].map(([x1, x2]) => (
                <Rect key={x1} x={x1} y={C.y - 2.5} width={x2! - x1!} height={5} fill={c.copper} />
              ))}
              {okI && I !== 0
                ? [w * 0.1, w * 0.88].map((x) => (
                    <Path
                      key={x}
                      d={arrowHead(x + dir * 8, C.y - 9, dir, 0, 9)}
                      fill={c.chartInk}
                    />
                  ))
                : null}
              {/* The plates, round, at a slant. */}
              {okR
                ? [xl, xr].map((x) => (
                    <G key={x}>
                      <Ellipse
                        cx={x}
                        cy={C.y}
                        rx={Rpx * slant}
                        ry={Rpx}
                        fill={c.metal}
                        stroke={c.metalDark}
                      />
                      <Ellipse cx={x} cy={C.y} rx={Rpx * slant} ry={Rpx} fill={url(paint.plate)} />
                    </G>
                  ))
                : null}
              {/* E between them, growing; the disc inside r it crosses, shaded. */}
              {okR
                ? [-0.6, 0, 0.6].map((k) => (
                    <Line
                      key={k}
                      x1={xl + 6}
                      y1={C.y + k * Rpx}
                      x2={xr - 6}
                      y2={C.y + k * Rpx}
                      stroke={c.physField}
                      strokeWidth={1.2}
                      strokeDasharray={chart.dashFine}
                    />
                  ))
                : null}
              {okr && rpx > 0 ? (
                <G>
                  <Ellipse
                    cx={C.x}
                    cy={C.y}
                    rx={rpx * slant}
                    ry={rpx}
                    fill={c.he2eEnclosed}
                    opacity={0.55}
                  />
                  <Ellipse
                    cx={C.x}
                    cy={C.y}
                    rx={rpx * slant}
                    ry={rpx}
                    stroke={c.he2eSurface}
                    strokeWidth={1.8}
                    strokeDasharray={chart.dash}
                    fill="none"
                  />
                  {okI && I !== 0 ? (
                    <G>
                      {/* B round the axis: out of the page above it, into it below (I to the right). */}
                      <Path
                        d={arrowHead(C.x - rpx * slant, C.y + 2, 0, dir, 8)}
                        fill={c.he2eField}
                      />
                      <Path
                        d={arrowHead(C.x + rpx * slant, C.y - 2, 0, -dir, 8)}
                        fill={c.he2eField}
                      />
                    </G>
                  ) : null}
                  <Line
                    x1={C.x}
                    y1={C.y}
                    x2={C.x}
                    y2={C.y - rpx}
                    stroke={c.chartMuted}
                    strokeWidth={1.2}
                  />
                  <Lab x={C.x + 6} y={C.y - rpx / 2 + 4} sym="r" value={R.say(spec.r, r, 'm')} />
                </G>
              ) : null}
              <Lab
                x={C.x}
                y={Math.max(14, C.y - Math.max(rpx, Rpx) - 10)}
                sym="B"
                value={Bsay}
                anchor="middle"
                bold
                color={c.he2eField}
              />
              {okR ? (
                <Lab
                  x={xl - Rpx * slant - 6}
                  y={C.y - Rpx * 0.55}
                  sym="R"
                  value={R.say(spec.radius, Rr, 'm')}
                  anchor="end"
                />
              ) : null}
              <Lab x={10} y={C.y + 22} sym="I" value={R.say(spec.current, I, 'A')} />
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{capLines.join(' · ')}</Caption>
    </View>
  );
}

// ─── A rod sliding on rails ───────────────────────────────────────────────────

function RailsView({
  spec,
  calc,
}: {
  spec: InductionRails & { fixed?: boolean };
  calc: Calculator;
}) {
  const c = usePalette();
  const R = useHe2e(calc);
  const paint = usePaintIds('rail', 'rod');
  const x = spec.rails;
  const B = R.v(x.B, 0.5);
  const L = R.v(x.L, 0.4);
  const v = R.v(x.v, 1);
  const Rr = x.R === undefined ? undefined : R.v(x.R, 1);
  const okB = R.known(x.B);
  const okL = R.known(x.L);
  const okV = R.known(x.v);
  const okR = R.known(x.R) && x.R !== undefined;
  const okE = okB && okL && okV;
  const okI = okE && okR;
  const q = railsOf(B, L, v, Rr);
  const into = !x.out;
  // Into the page with v to the right, the current runs up the rod (counterclockwise).
  const ccw = (into ? 1 : -1) * Math.sign(v) * Math.sign(B || 1) > 0;
  const drag = useScaleDrag(R, calc, spec.fixed ? undefined : x.v, ids(x.B, x.L, x.R));
  const emfSay = R.out(x.emf, Math.abs(q.emf), 'V', okE);
  const Isay = R.out(x.I, Math.abs(q.I), 'A', okI);
  const Fsay = R.out(x.F, q.F, 'N', okI);
  const capLines = [
    ...worked(okE, `ε = BLv = ${n3(B)} × ${n3(L)} × ${n3(v)} = ${n3(q.emf)} V`),
    ...(x.R !== undefined ? worked(okI, `I = ε ÷ R = ${n3(q.I)} A`) : []),
    ...(x.R !== undefined ? worked(okI, `F = BIL = ${n3(q.F)} N, against v (Lenz)`) : []),
    ...(x.P ? worked(okI, `P = Fv = ${n3(q.P)} W, the I²R heating in R`) : []),
  ];
  return (
    <View>
      <Canvas aspect={0.7}>
        {({ w, h }) => {
          const [y1, y2] = [h * 0.2, h * 0.7];
          const xR = 34;
          const xRod = w * 0.6;
          const xs = Array.from({ length: Math.floor((w - 20) / 30) }, (_, i) => 22 + i * 30);
          const ys = Array.from({ length: Math.floor((h - 16) / 30) }, (_, i) => 14 + i * 30);
          const vDir = v >= 0 ? 1 : -1;
          const vLen = 54;
          const dragAt = drag(vLen);
          const head = c.chartHighlight;
          return (
            <View>
              <Svg width={w} height={h}>
                <Defs>
                  <Sheen id={paint.rail} vertical />
                  <Sheen id={paint.rod} />
                </Defs>
                {/* The field: × into the page (• out of it) everywhere. */}
                {okB && B !== 0
                  ? xs.flatMap((px) =>
                      ys.map((py) => (
                        <PageMark
                          key={`${px},${py}`}
                          x={px}
                          y={py}
                          r={4}
                          out={!into === B > 0}
                          color={c.he2eField}
                          ring={false}
                          width={1.2}
                        />
                      )),
                    )
                  : null}
                {/* The loop's area, growing as the rod slides. */}
                <Rect
                  x={xR}
                  y={y1}
                  width={xRod - xR}
                  height={y2 - y1}
                  fill={c.he2eEnclosed}
                  opacity={0.3}
                />
                {/* Steel rails and the resistor across the left end. */}
                {[y1, y2].map((y) => (
                  <G key={y}>
                    <Rect
                      x={xR - 4}
                      y={y - 4}
                      width={w - xR - 2}
                      height={8}
                      rx={2}
                      fill={c.metal}
                      stroke={c.metalDark}
                      strokeWidth={0.8}
                    />
                    <Rect
                      x={xR - 4}
                      y={y - 4}
                      width={w - xR - 2}
                      height={8}
                      rx={2}
                      fill={url(paint.rail)}
                    />
                  </G>
                ))}
                <Path
                  d={zigzag(xR, y1 + 4, y2 - 4)}
                  stroke={c.chartInk}
                  strokeWidth={2}
                  fill="none"
                  strokeLinejoin="round"
                />
                {x.R !== undefined && okR ? (
                  <Lab x={xR + 14} y={(y1 + y2) / 2 + 4} sym="R" value={R.say(x.R, Rr ?? 0, 'Ω')} />
                ) : null}
                {/* The copper rod. */}
                <Rect
                  x={xRod - 5}
                  y={y1 - 12}
                  width={10}
                  height={y2 - y1 + 24}
                  rx={3}
                  fill={c.copper}
                  stroke={c.copperDark}
                />
                <Rect
                  x={xRod - 5}
                  y={y1 - 12}
                  width={10}
                  height={y2 - y1 + 24}
                  rx={3}
                  fill={url(paint.rod)}
                />
                {okL ? (
                  <G>
                    <Line x1={xRod - 16} y1={y1} x2={xRod - 16} y2={y2} stroke={c.chartMuted} />
                    <Lab
                      x={xRod - 20}
                      y={y1 + (y2 - y1) * 0.3}
                      sym="L"
                      value={R.say(x.L, L, 'm')}
                      anchor="end"
                    />
                  </G>
                ) : null}
                {okV && v !== 0 ? (
                  <G>
                    <Vec
                      x1={xRod + 8 * vDir}
                      y1={y1 + (y2 - y1) * 0.3}
                      x2={xRod + (vLen + 8) * vDir}
                      y2={y1 + (y2 - y1) * 0.3}
                      color={c.chartInk}
                      width={3}
                    />
                    <Lab
                      x={xRod + (vLen + 14) * vDir}
                      y={y1 + (y2 - y1) * 0.3 + 4}
                      sym="v"
                      value={R.say(x.v, v, 'm/s')}
                      anchor={vDir > 0 ? 'start' : 'end'}
                    />
                  </G>
                ) : null}
                {/* The induced current round the loop, and the force on the rod against v. */}
                {okE && q.emf !== 0 ? (
                  <G>
                    <Path
                      d={arrowHead(xRod, (y1 + y2) / 2 + (ccw ? -8 : 8), 0, ccw ? -1 : 1, 10)}
                      fill={head}
                    />
                    <Path d={arrowHead((xR + xRod) / 2, y1, ccw ? -1 : 1, 0, 10)} fill={head} />
                    <Path d={arrowHead((xR + xRod) / 2, y2, ccw ? 1 : -1, 0, 10)} fill={head} />
                    <Lab
                      x={(xR + xRod) / 2}
                      y={y1 - 12}
                      sym="I"
                      value={Isay}
                      anchor="middle"
                      bold
                      color={head}
                    />
                    <Lab x={(xR + xRod) / 2} y={y2 + 22} sym="ε" value={emfSay} anchor="middle" />
                  </G>
                ) : null}
                {okI && q.F !== 0 ? (
                  <G>
                    <Vec
                      x1={xRod - 8 * vDir}
                      y1={y1 + (y2 - y1) * 0.72}
                      x2={xRod - 62 * vDir}
                      y2={y1 + (y2 - y1) * 0.72}
                      color={c.forceApplied}
                      width={3}
                    />
                    <Lab
                      x={xRod - 30 * vDir}
                      y={y1 + (y2 - y1) * 0.72 - 9}
                      sym="F"
                      value={Fsay}
                      anchor="middle"
                      bold
                      color={c.forceApplied}
                    />
                  </G>
                ) : null}
                {okB ? (
                  <Lab
                    x={w - 8}
                    y={h - 6}
                    sym="B"
                    value={R.say(x.B, B, 'T')}
                    anchor="end"
                    color={c.he2eField}
                  />
                ) : null}
              </Svg>
              {dragAt && okV ? (
                <DragHandle
                  testID="drag-v"
                  x={xRod + (vLen + 8) * vDir}
                  y={y1 + (y2 - y1) * 0.3}
                  label="speed v"
                  onStart={dragAt.onStart}
                  onMove={(dx) => dragAt.onMove(dx * vDir)}
                />
              ) : null}
            </View>
          );
        }}
      </Canvas>
      <Caption>{capLines.join(' · ')}</Caption>
    </View>
  );
}

/** A resistor's zigzag down a vertical wire at x, from y0 to y1. */
function zigzag(x: number, y0: number, y1: number) {
  const m = (y0 + y1) / 2;
  const half = Math.min(28, (y1 - y0) / 3);
  const pts = [`M ${x} ${y0}`, `L ${x} ${m - half}`];
  for (let i = 0; i < 6; i++)
    pts.push(`L ${x + (i % 2 ? -7 : 7)} ${m - half + ((i + 0.5) * 2 * half) / 6}`);
  pts.push(`L ${x} ${m + half}`, `L ${x} ${y1}`);
  return pts.join(' ');
}
