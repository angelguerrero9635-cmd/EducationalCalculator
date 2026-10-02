/**
 * `freeBody` with `aircraft` (HC25, typesHe2f.ts): an airplane painted in aluminum with the
 * forces of flight on it. `side`: L, W, T and D along a climbing path (T and D on their own
 * magnified scale, named), the relative wind at α and the elevator's δe in an inset; `front`:
 * banked φ in a level turn with L cos φ and L sin φ dashed; `stability`: the aerodynamic
 * center, CG and neutral point on the mean chord, the static margin bracketed.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { FbAircraft, FreeBodyHe2fSpec } from '@/data/modules/typesHe2f';
import type { NumOrVar } from '@/data/modules/typesGraphs';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, useRep } from './common';
import { climbOf, magnify, turnOf } from './he2fMath';
import { fmt, Tag, tipLabel, valueText } from './he2fKit';
import { formulaOnly, RAD, Vec } from './hskKit';
import { TopLight, url, usePaintIds } from './paint';

type Pt = { x: number; y: number };

/** The side view's outline, nose to +x, 200 units long, centerline y = 0 (CG at x = 0). */
const FUSELAGE =
  'M 100 0 C 99 -6 92 -9 80 -9 L -60 -9 L -98 -13 L -101 -10 L -100 -6 L -62 8 L 80 9 C 92 9 99 6 100 0 Z';
const FIN = 'M -66 -9 L -88 -44 L -101 -44 L -99 -12 Z';
const STAB = 'M -74 -11 Q -84 -15 -92 -12 L -92 -10 Q -84 -8 -74 -11 Z';
const WING = 'M 14 4 Q 6 -1 -22 3 Q 2 8 14 4 Z';
const COCKPIT = 'M 87 -7 L 94 -4.5 L 91 -2.5 L 84 -3.5 Z';

export function FreeBodyAircraft({
  spec,
  a,
  calc,
}: {
  spec: FreeBodyHe2fSpec;
  a: FbAircraft;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('skin', 'nacelle');
  const num = (x: NumOrVar | undefined, d = 0) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const ok = (...xs: (NumOrVar | undefined)[]) =>
    xs.every((x) => typeof x !== 'string' || rep.known(x));
  const text = (x: NumOrVar | undefined, computed: number, unit: string) =>
    valueText(rep, x, computed, unit);
  const g = num(spec.g, 9.81);

  /** The airplane from the side, pitched `pitch`° nose up, `s` px per unit, CG at P. */
  function sideAirplane(P: Pt, s: number, pitch: number, mirror = false, delta = 0) {
    const flip = mirror ? -1 : 1;
    return (
      <G transform={`translate(${P.x} ${P.y}) rotate(${-pitch * flip}) scale(${s * flip} ${s})`}>
        <Ellipse cx={-56} cy={-16} rx={15} ry={5} fill={c.silverDark} />
        <Ellipse cx={-56} cy={-16} rx={15} ry={5} fill={url(ids.nacelle)} />
        <Path d={FIN} fill={c.physCartA} stroke={c.silverDark} strokeWidth={0.6 / s} />
        <Path d={FUSELAGE} fill={c.silver} stroke={c.silverDark} strokeWidth={0.8 / s} />
        <Rect x={-60} y={-1} width={140} height={2.4} fill={c.physCartA} />
        <Path d={FUSELAGE} fill={url(ids.skin)} />
        {Array.from({ length: 11 }, (_, i) => (
          <Circle key={i} cx={64 - i * 11} cy={-4} r={1.3} fill={c.glass} />
        ))}
        <Path d={COCKPIT} fill={c.glass} />
        <Path d={WING} fill={c.silverDark} />
        <Path d={STAB} fill={c.silverDark} />
        {/* The elevator, hinged at the stabilizer's trailing edge. */}
        <G rotation={-delta} origin="-92, -11">
          <Path d="M -92 -12 L -103 -11 L -92 -10 Z" fill={c.physCartA} />
        </G>
      </G>
    );
  }

  const defs = (
    <Defs>
      <TopLight id={ids.skin} strength={0.8} />
      <TopLight id={ids.nacelle} strength={0.6} />
    </Defs>
  );

  if (a.view === 'front') return front();
  if (a.view === 'stability') return stability();
  return side();

  // ─── Side view ──────────────────────────────────────────────────────────────

  function side() {
    const H = 292;
    const hasW = a.weight !== undefined;
    const W = Math.max(0, num(a.weight));
    const gam = num(a.gamma);
    const cl = climbOf(W, gam);
    const L = a.lift !== undefined ? Math.max(0, num(a.lift)) : cl.L;
    const T = Math.max(0, num(a.thrust));
    const D = Math.max(0, num(a.drag));
    const along = a.gamma !== undefined ? cl.along : 0;
    const alpha = num(a.alpha);
    const delta = num(a.elevator);
    const forces = hasW && ok(a.weight, a.lift, a.thrust, a.drag, a.gamma);
    const hasT = a.thrust !== undefined;
    const hasD = a.drag !== undefined;
    const m = hasT || hasD ? magnify(Math.max(W, L), Math.max(T, D + along)) : 1;
    return (
      <View>
        <Canvas aspect={(w) => H / w}>
          {({ w }) => {
            const P = { x: w * 0.5, y: 148 };
            const s = Math.min(w * 0.62, 240) / 200;
            const p = { x: Math.cos(gam * RAD), y: -Math.sin(gam * RAD) };
            const n = { x: -Math.sin(gam * RAD), y: -Math.cos(gam * RAD) };
            const k1 = 100 / Math.max(1e-9, W, L);
            const k2 = k1 * m;
            const dTip = { x: P.x - p.x * k2 * D, y: P.y - p.y * k2 * D };
            return (
              <Svg width={w} height={H}>
                {defs}
                {/* The flight path, and the level line when it climbs. */}
                <Line
                  x1={P.x - p.x * w}
                  y1={P.y - p.y * w}
                  x2={P.x + p.x * w}
                  y2={P.y + p.y * w}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dash}
                />
                {a.gamma !== undefined && gam > 0.05 ? (
                  <G>
                    <Line
                      x1={P.x}
                      y1={P.y}
                      x2={w - 6}
                      y2={P.y}
                      stroke={c.chartMuted}
                      strokeDasharray={chart.dashFine}
                    />
                    <Path
                      d={`M ${w - 26} ${P.y} A ${w - 26 - P.x} ${w - 26 - P.x} 0 0 0 ${P.x + (w - 26 - P.x) * p.x} ${P.y + (w - 26 - P.x) * p.y}`}
                      stroke={c.chartInk}
                      fill="none"
                    />
                    <Tag
                      x={w - 6}
                      y={P.y + 18}
                      text={`γ = ${ok(a.gamma) ? text(a.gamma, gam, '°') : '?'}`}
                      anchor="end"
                      chip={false}
                      w={w}
                    />
                  </G>
                ) : null}
                {a.alpha !== undefined ? wind(P, w, s, alpha + gam) : null}
                {sideAirplane(P, s, gam + alpha, false, delta)}
                {forces ? (
                  <G>
                    {[
                      { u: n, len: k1 * L, color: c.forceNormal, t: `L = ${text(a.lift, L, 'N')}` },
                      {
                        u: { x: 0, y: 1 },
                        len: k1 * W,
                        color: c.forceWeight,
                        t: `W = ${text(a.weight, W, 'N')}`,
                      },
                    ].map((f, i) => {
                      const to = { x: P.x + f.u.x * f.len, y: P.y + f.u.y * f.len };
                      const at = tipLabel(P, to, f.t, w);
                      return (
                        <G key={i}>
                          <Vec x1={P.x} y1={P.y} x2={to.x} y2={to.y} color={f.color} />
                          <Tag
                            x={at.x}
                            y={at.y}
                            text={f.t}
                            anchor={at.anchor}
                            color={f.color}
                            w={w}
                          />
                        </G>
                      );
                    })}
                    {hasT ? (
                      <G>
                        <Vec
                          x1={P.x}
                          y1={P.y}
                          x2={P.x + p.x * k2 * T}
                          y2={P.y + p.y * k2 * T}
                          color={c.forceApplied}
                        />
                        <Tag
                          x={P.x + 10}
                          y={P.y + 30}
                          text={`T = ${text(a.thrust, T, 'N')}`}
                          anchor="start"
                          color={c.forceApplied}
                          w={w}
                        />
                      </G>
                    ) : null}
                    {hasD ? (
                      <G>
                        <Vec x1={P.x} y1={P.y} x2={dTip.x} y2={dTip.y} color={c.forceFriction} />
                        <Tag
                          x={P.x - 10}
                          y={P.y + 30}
                          text={`D = ${text(a.drag, D, 'N')}`}
                          anchor="end"
                          color={c.forceFriction}
                          w={w}
                        />
                      </G>
                    ) : null}
                    {hasD && along > 1e-9 ? (
                      <G>
                        <Vec
                          x1={dTip.x}
                          y1={dTip.y}
                          x2={dTip.x - p.x * k2 * along}
                          y2={dTip.y - p.y * k2 * along}
                          color={c.forceWeight}
                          width={2}
                          dash={chart.dashFine}
                          head={8}
                        />
                        <Tag
                          x={P.x - 10}
                          y={P.y + 48}
                          text={`W sin γ = ${fmt(along)} N`}
                          anchor="end"
                          color={c.forceWeight}
                          w={w}
                        />
                      </G>
                    ) : null}
                    {m > 1 ? (
                      <Tag
                        x={6}
                        y={H - 8}
                        text={`T and D drawn ×${m} (L and W to scale)`}
                        anchor="start"
                        chip={false}
                        bold={false}
                        color={c.chartMuted}
                        w={w}
                      />
                    ) : null}
                  </G>
                ) : null}
                <Circle cx={P.x} cy={P.y} r={3.5} fill={c.chartInk} stroke={c.card} />
                {a.elevator !== undefined ? inset(w, delta) : null}
              </Svg>
            );
          }}
        </Canvas>
        <Caption>{(forces || !hasW ? sideLines() : formulaOnly(sideLines())).join(' · ')}</Caption>
      </View>
    );

    function sideLines(): string[] {
      const out: string[] = [];
      if (!hasW) {
        if (a.alpha !== undefined)
          out.push(`The relative wind meets the fuselage at α = ${fmt(alpha, 3)}°.`);
        if (a.elevator !== undefined)
          out.push(
            `δe = ${fmt(delta, 3)}°: ${delta < 0 ? 'trailing edge up, the tail pushes down and the nose rises' : delta > 0 ? 'trailing edge down, the nose drops' : 'no deflection'}.`,
          );
        return out;
      }
      if (a.gamma === undefined || gam === 0) {
        out.push(`Level flight: L = W = ${fmt(W, 4)} N`);
        if (hasD) out.push(`T = D = ${fmt(D, 4)} N, so L ÷ D = ${fmt(L / Math.max(1e-9, D), 3)}`);
      } else {
        out.push(
          `Square to the path: L = W cos γ = ${fmt(W, 4)} × cos ${fmt(gam, 3)}° = ${fmt(cl.L, 4)} N`,
          `Along the path: T = D + W sin γ = ${fmt(D, 4)} + ${fmt(cl.along, 4)} = ${fmt(D + cl.along, 4)} N`,
        );
      }
      return out;
    }
  }

  /** Relative-wind arrows coming at the nose, level, at α to the fuselage. */
  function wind(P: Pt, w: number, s: number, pitch: number) {
    const nose = {
      x: P.x + 100 * s * Math.cos(pitch * RAD),
      y: P.y - 100 * s * Math.sin(pitch * RAD),
    };
    const x0 = Math.min(w - 10, nose.x + 52);
    return (
      <G>
        {[-26, 0, 26].map((dy) => (
          <Vec
            key={dy}
            x1={x0}
            y1={nose.y + dy}
            x2={x0 - 34}
            y2={nose.y + dy}
            color={c.chartMuted}
            width={1.8}
            head={7}
          />
        ))}
        <Line
          x1={nose.x}
          y1={nose.y}
          x2={nose.x + 40 * Math.cos(pitch * RAD)}
          y2={nose.y - 40 * Math.sin(pitch * RAD)}
          stroke={c.chartMuted}
          strokeDasharray={chart.dashFine}
        />
        <Path
          d={`M ${nose.x + 30} ${nose.y} A 30 30 0 0 0 ${nose.x + 30 * Math.cos(pitch * RAD)} ${nose.y - 30 * Math.sin(pitch * RAD)}`}
          stroke={c.chartInk}
          fill="none"
        />
        <Tag
          x={w - 6}
          y={nose.y - 36}
          text={`α = ${ok(a.alpha) ? text(a.alpha, num(a.alpha), '°') : '?'}`}
          anchor="end"
          chip={false}
          w={w}
        />
        <Tag
          x={w - 6}
          y={nose.y + 44}
          text="relative wind"
          anchor="end"
          chip={false}
          bold={false}
          color={c.chartMuted}
          w={w}
        />
      </G>
    );
  }

  /** The tail magnified, the elevator at δe (its angle drawn ×5 when it is small). */
  function inset(w: number, delta: number) {
    const [bx, by, bw, bh] = [8, 8, 128, 70];
    const shown = Math.abs(delta) < 6 ? delta * 5 : delta;
    const hinge = { x: bx + 78, y: by + 30 };
    return (
      <G>
        <Rect x={bx} y={by} width={bw} height={bh} rx={6} fill={c.card} stroke={c.chartGrid} />
        <Path
          d={`M ${bx + 12} ${hinge.y} Q ${bx + 40} ${hinge.y - 9} ${hinge.x} ${hinge.y - 3} L ${hinge.x} ${hinge.y + 3} Q ${bx + 40} ${hinge.y + 6} ${bx + 12} ${hinge.y} Z`}
          fill={c.silverDark}
        />
        <G rotation={-shown} origin={`${hinge.x}, ${hinge.y}`}>
          <Path
            d={`M ${hinge.x} ${hinge.y - 3} L ${hinge.x + 34} ${hinge.y} L ${hinge.x} ${hinge.y + 3} Z`}
            fill={c.physCartA}
          />
        </G>
        <Line
          x1={hinge.x}
          y1={hinge.y}
          x2={hinge.x + 40}
          y2={hinge.y}
          stroke={c.chartMuted}
          strokeDasharray={chart.dashFine}
        />
        <Tag
          x={bx + 6}
          y={by + bh - 22}
          text={`δe = ${ok(a.elevator) ? text(a.elevator, delta, '°') : '?'}`}
          anchor="start"
          chip={false}
          w={w}
        />
        <Tag
          x={bx + 6}
          y={by + bh - 7}
          text={Math.abs(delta) < 6 ? 'tail, angle drawn ×5' : 'tail'}
          anchor="start"
          chip={false}
          bold={false}
          color={c.chartMuted}
          w={w}
        />
      </G>
    );
  }

  // ─── Front view ─────────────────────────────────────────────────────────────

  function front() {
    const H = 300;
    const phi = Math.min(89, Math.max(0, num(a.phi)));
    const hasW = a.weight !== undefined;
    const W = hasW ? Math.max(0, num(a.weight)) : 1;
    const V = num(a.speed);
    const t = turnOf(phi, V, g);
    const L = W * t.n;
    const all = ok(a.phi, a.weight, a.speed, spec.g);
    const F = (x: number, id?: NumOrVar) => (hasW ? text(id, x, 'N') : `${fmt(x / W)}W`);
    return (
      <View>
        <Canvas aspect={(w) => H / w}>
          {({ w }) => {
            const P = { x: w * 0.34, y: 176 };
            const k = Math.min(
              86 / W,
              (w - P.x - 74) / Math.max(1e-9, L * Math.sin(phi * RAD)),
              (P.y - 34) / Math.max(1e-9, L * Math.cos(phi * RAD)),
            );
            const u = { x: Math.sin(phi * RAD), y: -Math.cos(phi * RAD) };
            const Lt = { x: P.x + u.x * k * L, y: P.y + u.y * k * L };
            const span = w * 0.27;
            const arcR = 64;
            return (
              <Svg width={w} height={H}>
                {defs}
                <Line
                  x1={8}
                  y1={P.y}
                  x2={P.x}
                  y2={P.y}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dashFine}
                />
                <Path
                  d={`M ${P.x - arcR} ${P.y} A ${arcR} ${arcR} 0 0 1 ${P.x - arcR * Math.cos(phi * RAD)} ${P.y - arcR * Math.sin(phi * RAD)}`}
                  stroke={c.chartInk}
                  fill="none"
                />
                <Tag
                  x={P.x - arcR - 4}
                  y={P.y - 8}
                  text={`φ = ${ok(a.phi) ? text(a.phi, phi, '°') : '?'}`}
                  anchor="end"
                  chip={false}
                  w={w}
                />
                {/* The airplane from the front, rolled φ (right wing down). */}
                <G rotation={phi} origin={`${P.x}, ${P.y}`}>
                  <Polygon
                    points={`${P.x - 6} ${P.y - 12} ${P.x - 3} ${P.y - 46} ${P.x + 3} ${P.y - 46} ${P.x + 6} ${P.y - 12}`}
                    fill={c.physCartA}
                  />
                  <Rect
                    x={P.x - span * 0.32}
                    y={P.y - 15}
                    width={span * 0.64}
                    height={3}
                    rx={1.5}
                    fill={c.silverDark}
                  />
                  {[-1, 1].map((sd) => (
                    <G key={sd}>
                      <Polygon
                        points={`${P.x} ${P.y - 1} ${P.x + sd * span} ${P.y - 7} ${P.x + sd * span} ${P.y - 3} ${P.x} ${P.y + 6}`}
                        fill={c.silver}
                        stroke={c.silverDark}
                        strokeWidth={0.8}
                      />
                      <Circle cx={P.x + sd * span * 0.4} cy={P.y + 9} r={7} fill={c.silverDark} />
                      <Circle cx={P.x + sd * span * 0.4} cy={P.y + 9} r={4} fill={c.rubber} />
                    </G>
                  ))}
                  <Circle cx={P.x} cy={P.y} r={14} fill={c.silver} stroke={c.silverDark} />
                  <Circle cx={P.x} cy={P.y} r={14} fill={url(ids.skin)} />
                  <Path
                    d={`M ${P.x - 8} ${P.y - 6} Q ${P.x} ${P.y - 11} ${P.x + 8} ${P.y - 6} L ${P.x + 6} ${P.y - 3} L ${P.x - 6} ${P.y - 3} Z`}
                    fill={c.glass}
                  />
                </G>
                {all ? (
                  <G>
                    <Vec
                      x1={P.x}
                      y1={P.y}
                      x2={P.x}
                      y2={P.y - k * W}
                      color={c.forceNormal}
                      width={2}
                      dash={chart.dashFine}
                      head={8}
                    />
                    <Tag
                      x={P.x + 6}
                      y={P.y - k * W + 6}
                      text={`L cos φ = ${F(W, a.weight)}`}
                      anchor="start"
                      color={c.forceNormal}
                      w={w}
                    />
                    <Vec
                      x1={P.x}
                      y1={P.y}
                      x2={Lt.x}
                      y2={P.y}
                      color={c.forceNormal}
                      width={2}
                      dash={chart.dashFine}
                      head={8}
                    />
                    <Tag
                      x={Lt.x + 6}
                      y={P.y + 4}
                      text="L sin φ"
                      anchor="start"
                      color={c.forceNormal}
                      w={w}
                    />
                    <Tag
                      x={w - 6}
                      y={P.y + 24}
                      text="to the turn’s center"
                      anchor="end"
                      chip={false}
                      bold={false}
                      color={c.chartMuted}
                      w={w}
                    />
                    <Vec x1={P.x} y1={P.y} x2={Lt.x} y2={Lt.y} color={c.forceNormal} />
                    <Tag
                      x={Lt.x}
                      y={Lt.y - 8}
                      text={`L = ${hasW ? text(a.lift, L, 'N') : `${fmt(t.n)}W`}`}
                      color={c.forceNormal}
                      w={w}
                    />
                    <Vec x1={P.x} y1={P.y} x2={P.x} y2={P.y + k * W} color={c.forceWeight} />
                    <Tag
                      x={P.x}
                      y={P.y + k * W + 16}
                      text={`W${hasW ? ` = ${text(a.weight, W, 'N')}` : ''}`}
                      color={c.forceWeight}
                      w={w}
                    />
                  </G>
                ) : null}
                <Circle cx={P.x} cy={P.y} r={3} fill={c.chartInk} stroke={c.card} />
              </Svg>
            );
          }}
        </Canvas>
        <Caption>{(all ? frontLines() : formulaOnly(frontLines())).join(' · ')}</Caption>
      </View>
    );

    function frontLines(): string[] {
      const p = fmt(phi, 4);
      const out = [
        `Up and down: L cos φ = W, so n = L ÷ W = 1 ÷ cos ${p}° = ${fmt(t.n, 4)}`,
        'Level: L sin φ = mV² ÷ R, the centripetal force',
      ];
      if (a.speed !== undefined && phi > 0)
        out.push(
          `R = V² ÷ (g tan φ) = ${fmt(V, 4)}² ÷ (${fmt(g, 4)} × tan ${p}°) = ${fmt(t.R, 4)} m`,
          `ω = V ÷ R = ${fmt(t.omega, 4)} rad/s = ${fmt(t.omega / RAD, 3)}°/s`,
        );
      return out;
    }
  }

  // ─── Static stability ───────────────────────────────────────────────────────

  function stability() {
    const H = 262;
    const hac = num(a.hac);
    const h = num(a.h);
    const hn = num(a.hn);
    const sm = hn - h;
    const all = ok(a.hac, a.h, a.hn);
    const stable = sm > 0;
    return (
      <View>
        <Canvas aspect={(w) => H / w}>
          {({ w }) => {
            const x0 = w * 0.12;
            const x1 = w * 0.88;
            const cy = 168;
            const at = (f: number) => x0 + f * (x1 - x0);
            const s = Math.min(w * 0.6, 220) / 200;
            // Nose left: the wing's leading edge (x = 14) and trailing edge (x = −22), mirrored.
            const P = { x: w * 0.5 - 4 * s, y: 52 };
            const le = { x: P.x - 14 * s, y: P.y + 4 * s };
            const te = { x: P.x + 22 * s, y: P.y + 3 * s };
            const lo = Math.min(h, hn);
            const hi = Math.max(h, hn);
            const mk = (f: number) => Math.min(x1 + 10, Math.max(x0 - 10, at(f)));
            return (
              <Svg width={w} height={H}>
                {defs}
                {sideAirplane(P, s, 0, true)}
                {/* The wing's chord, projected down and enlarged. */}
                <Path
                  d={`M ${le.x} ${le.y} L ${x0} ${cy - 10} M ${te.x} ${te.y} L ${x1} ${cy - 6}`}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dashFine}
                />
                <Path
                  d={`M ${x0} ${cy} C ${x0 + 4} ${cy - 16} ${at(0.2)} ${cy - 20} ${at(0.35)} ${cy - 19} C ${at(0.6)} ${cy - 17} ${at(0.85)} ${cy - 8} ${x1} ${cy} C ${at(0.85)} ${cy + 3} ${at(0.4)} ${cy + 6} ${at(0.2)} ${cy + 6} C ${x0 + 8} ${cy + 6} ${x0} ${cy + 3} ${x0} ${cy} Z`}
                  fill={c.chartSurface}
                  stroke={c.chartInk}
                  strokeWidth={1.2}
                />
                <Line x1={x0} y1={cy} x2={x1} y2={cy} stroke={c.chartMuted} />
                {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                  <G key={f}>
                    <Line x1={at(f)} y1={cy + 40} x2={at(f)} y2={cy + 46} stroke={c.chartMuted} />
                    <Tag
                      x={at(f)}
                      y={cy + 60}
                      text={f === 0 ? '0 (LE)' : f === 1 ? 'c̄ (TE)' : `${f}c̄`}
                      chip={false}
                      bold={false}
                      color={c.chartMuted}
                      size={chart.label}
                      w={w}
                    />
                  </G>
                ))}
                <Line x1={x0} y1={cy + 43} x2={x1} y2={cy + 43} stroke={c.chartMuted} />
                {all ? (
                  <G>
                    {/* The aerodynamic center: a triangle, its label above. */}
                    <Polygon
                      points={`${mk(hac)},${cy - 6} ${mk(hac) - 6},${cy + 5} ${mk(hac) + 6},${cy + 5}`}
                      fill={c.chartInk}
                    />
                    <Tag
                      x={mk(hac)}
                      y={cy - 46}
                      text={`h_ac = ${text(a.hac, hac, '').trim()} (AC)`}
                      w={w}
                    />
                    {/* The neutral point: a diamond. */}
                    <Polygon
                      points={`${mk(hn)},${cy - 7} ${mk(hn) + 6},${cy} ${mk(hn)},${cy + 7} ${mk(hn) - 6},${cy}`}
                      fill={c.forceNormal}
                    />
                    {/* The CG: a circle in quarters. */}
                    <Circle
                      cx={mk(h)}
                      cy={cy}
                      r={7}
                      fill={c.card}
                      stroke={c.chartInk}
                      strokeWidth={1.5}
                    />
                    <Path
                      d={`M ${mk(h)} ${cy} L ${mk(h) + 7} ${cy} A 7 7 0 0 0 ${mk(h)} ${cy - 7} Z M ${mk(h)} ${cy} L ${mk(h) - 7} ${cy} A 7 7 0 0 0 ${mk(h)} ${cy + 7} Z`}
                      fill={c.chartInk}
                    />
                    <Tag
                      x={mk(h) + (stable ? 4 : -4)}
                      y={cy + 28}
                      text={`h = ${text(a.h, h, '').trim()} (CG)`}
                      anchor={stable ? 'end' : 'start'}
                      w={w}
                    />
                    <Tag
                      x={mk(hn) + (stable ? -4 : 4)}
                      y={cy + 28}
                      text={`h_n = ${text(a.hn, hn, '').trim()} (NP)`}
                      anchor={stable ? 'start' : 'end'}
                      color={c.forceNormal}
                      w={w}
                    />
                    {/* The static margin from the CG to the neutral point. */}
                    <Path
                      d={`M ${mk(lo)} ${cy - 16} L ${mk(lo)} ${cy - 22} L ${mk(hi)} ${cy - 22} L ${mk(hi)} ${cy - 16}`}
                      stroke={stable ? c.chartInk : c.forceWeight}
                      strokeWidth={1.5}
                      fill="none"
                    />
                    <Tag
                      x={(mk(lo) + mk(hi)) / 2}
                      y={cy - 27}
                      text={`SM = ${text(a.margin, sm, '')}`.trim()}
                      color={stable ? c.chartInk : c.forceWeight}
                      w={w}
                    />
                    <Tag
                      x={w / 2}
                      y={P.y + 52}
                      text={
                        stable
                          ? 'Stable: the CG is ahead of the neutral point'
                          : 'Unstable: the CG is behind the neutral point'
                      }
                      chip={false}
                      bold={false}
                      color={stable ? c.chartMuted : c.forceWeight}
                      w={w}
                    />
                  </G>
                ) : null}
              </Svg>
            );
          }}
        </Canvas>
        <Caption>{(all ? stabLines() : formulaOnly(stabLines())).join(' · ')}</Caption>
      </View>
    );

    function stabLines(): string[] {
      return [
        `SM = h_n − h = ${fmt(hn, 4)} − ${fmt(h, 4)} = ${fmt(sm, 3)}, ${fmt(Math.abs(sm) * 100, 3)}% of c̄ ${sm >= 0 ? 'behind' : 'ahead of'} the CG`,
        stable
          ? 'A nose-up gust makes a nose-down moment: the airplane returns.'
          : 'A nose-up gust pitches it further up: it diverges unless flown.',
      ];
    }
  }
}
