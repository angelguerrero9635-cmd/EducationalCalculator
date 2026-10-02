import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { CircularMotionSpec } from '@/data/modules/typesHsk';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle, nowrap, useFrozen, useRep } from './common';
import { G_EARTH, G_NEWTON, keplerPoint } from './hskMath';
import { RAD, sig, SubLabel, unknownOr, Vec, withUnit, worked, formulaOnly } from './hskKit';
import { Ball, url, usePaintIds } from './paint';

/**
 * Circular motion and gravitation (H61): a ball on a string or a car on a curve with the
 * velocity tangent and the centripetal acceleration toward the center; two masses and their
 * equal and opposite pulls; a Kepler orbit with equal areas in equal times.
 */
export function CircularMotion({ spec, calc }: { spec: CircularMotionSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('ball', 'm1', 'm2', 'sun', 'planet');
  const drag = useRef({ v: 0, r: 0 });
  const si = (x: number | string | undefined, d = 0) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) => typeof x !== 'string' || rep.known(x);

  const r = Math.max(1e-9, si(spec.radius, 1));
  const v = Math.max(0, si(spec.speed));
  const m = si(spec.mass, 1);
  const ac = (v * v) / r;
  const [m1, m2] = (spec.masses ?? [1, 1]).map((x) => Math.max(0, si(x)));
  const d = Math.max(1e-9, si(spec.distance, 1));
  const Fg = (G_NEWTON * m1! * m2!) / (d * d);
  const a = Math.max(1e-9, si(spec.semiMajor, 1));
  const e = Math.min(0.97, Math.max(0, si(spec.eccentricity)));
  // Round another star (H110): a³ = M × T², with M in Suns.
  const star = spec.mode === 'kepler' && spec.starMass !== undefined;
  const M = Math.max(1e-9, si(spec.starMass, 1));
  // Arrow scales stay put during a drag, so a longer arrow means a bigger value.
  const ref = useFrozen({ v: Math.max(1e-9, v), ac: Math.max(1e-9, ac), F: Math.max(1e-300, Fg) });

  const all =
    spec.mode === 'gravity'
      ? [...(spec.masses ?? []), spec.distance].every(known)
      : spec.mode === 'kepler'
        ? [spec.semiMajor, spec.eccentricity, spec.starMass].every(known)
        : [spec.radius, spec.speed].every(known);
  // A "?" box reads "?" on the picture too, not the example's number drawn faded behind it.
  const rOk = known(spec.radius);
  const vOk = known(spec.speed);
  const mOk = known(spec.mass);
  const [m1Ok, m2Ok] = (spec.masses ?? [1, 1]).map(known);
  const dOk = known(spec.distance);
  const q = unknownOr;
  const lines = spec.mode === 'kepler' && !all ? formulaOnly(captionLines()) : captionLines();

  return (
    <View>
      <Canvas aspect={spec.mode === 'gravity' ? 0.55 : spec.mode === 'kepler' ? 0.72 : 0.85}>
        {({ w, h }) => (
          <>
            <Svg width={w} height={h}>
              <Defs>
                <Ball id={ids.ball} color={c.ballRed} />
                <Ball id={ids.m1} color={c.planetNeptune} />
                <Ball id={ids.m2} color={c.planetMars} />
                <Ball id={ids.sun} color={c.sunDisk} />
                <Ball id={ids.planet} color={c.planetNeptune} />
              </Defs>
              <G opacity={all ? 1 : 0.45}>
                {spec.mode === 'gravity'
                  ? gravity(w, h)
                  : spec.mode === 'kepler'
                    ? kepler(w, h)
                    : circle(w, h)}
              </G>
            </Svg>
            {handles(w, h)}
          </>
        )}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );

  /** The geometry of the string or car scene. */
  function circleGeo(w: number, h: number) {
    const O = { x: w * 0.44, y: h * 0.5 };
    const R = Math.min(w * 0.34, h * 0.36);
    const phi = 35 * RAD;
    const P = { x: O.x + R * Math.cos(phi), y: O.y - R * Math.sin(phi) };
    // Counterclockwise: the velocity points along (−sin φ, −cos φ) on screen.
    const t = { x: -Math.sin(phi), y: -Math.cos(phi) };
    const Lv = Math.min(110, (70 * v) / ref.value.v);
    const La = Math.min(R - 18, (R * 0.6 * ac) / ref.value.ac);
    return { O, R, P, t, Lv, La };
  }

  function circle(w: number, h: number) {
    const { O, R, P, t, Lv, La } = circleGeo(w, h);
    const inward = { x: (O.x - P.x) / R, y: (O.y - P.y) / R };
    const car = spec.mode === 'car';
    const angle = (Math.atan2(t.y, t.x) * 180) / Math.PI;
    return (
      <G>
        {car ? (
          <Path
            d={`M ${O.x + R * Math.cos(-15 * RAD)} ${O.y - R * Math.sin(-15 * RAD)} A ${R} ${R} 0 0 0 ${O.x + R * Math.cos(125 * RAD)} ${O.y - R * Math.sin(125 * RAD)}`}
            stroke={c.rubber}
            strokeWidth={34}
            fill="none"
          />
        ) : null}
        <Circle
          cx={O.x}
          cy={O.y}
          r={R}
          stroke={car ? c.paper : c.chartMuted}
          strokeDasharray={chart.dash}
          fill="none"
        />
        <Circle cx={O.x} cy={O.y} r={4} fill={c.chartInk} />
        {/* The straight path it would take with no centripetal force. */}
        <Line
          x1={P.x}
          y1={P.y}
          x2={P.x + t.x * 200}
          y2={P.y + t.y * 200}
          stroke={c.chartMuted}
          strokeDasharray={chart.dashFine}
        />
        {car ? (
          <Line
            x1={O.x}
            y1={O.y}
            x2={P.x}
            y2={P.y}
            stroke={c.chartMuted}
            strokeDasharray={chart.dashFine}
          />
        ) : (
          <Line x1={O.x} y1={O.y} x2={P.x} y2={P.y} stroke={c.woodDark} strokeWidth={2.5} />
        )}
        <SubLabel
          x={O.x - 6}
          y={O.y + 22}
          text={`r = ${withUnit(q(rOk, sig(r)), unit(spec.radius, 'm'))}`}
          w={w}
        />
        {car ? (
          <G rotation={angle} origin={`${P.x}, ${P.y}`}>
            {[-1, 1].map((sx) =>
              [-1, 1].map((sy) => (
                <Rect
                  key={`${sx}${sy}`}
                  x={P.x + sx * 11 - 4}
                  y={P.y + sy * 9 - 2.5}
                  width={8}
                  height={5}
                  rx={1.5}
                  fill={c.rubber}
                />
              )),
            )}
            <Rect x={P.x - 17} y={P.y - 9} width={34} height={18} rx={5} fill={c.physCartA} />
            <Rect x={P.x + 1} y={P.y - 7} width={8} height={14} rx={2} fill={c.glass} />
          </G>
        ) : (
          <Circle cx={P.x} cy={P.y} r={9} fill={url(ids.ball)} stroke={c.chartInk} />
        )}
        <Vec
          x1={P.x}
          y1={P.y}
          x2={P.x + inward.x * La}
          y2={P.y + inward.y * La}
          color={car ? c.forceFriction : c.forceNet}
        />
        <Vec x1={P.x} y1={P.y} x2={P.x + t.x * Lv} y2={P.y + t.y * Lv} color={c.chartHighlight} />
        <SubLabel
          x={P.x + t.x * Lv - 8}
          y={P.y + t.y * Lv - 8}
          text={`v = ${withUnit(q(vOk, sig(v)), unit(spec.speed, 'm/s'))}`}
          anchor="end"
          color={c.chartHighlight}
          w={w}
        />
        <SubLabel
          x={P.x + 8}
          y={P.y + 34}
          anchor="start"
          text={car ? `f = ${q(all && mOk, sig(m * ac))} N` : `a_c = ${q(all, sig(ac))} m/s²`}
          color={car ? c.forceFriction : c.forceNet}
          w={w}
        />
      </G>
    );
  }

  function gravity(w: number, h: number) {
    const big = Math.max(m1!, m2!, 1e-300);
    const rad = (x: number) => 12 + 24 * Math.cbrt(x / big);
    const [r1, r2] = [rad(m1!), rad(m2!)];
    const y = h * 0.45;
    const x1 = w * 0.2;
    const x2 = w * 0.8;
    const room = (x2 - x1) / 2 - Math.max(r1, r2) - 6;
    const L = Math.max(0, Math.min(room, (room * 0.7 * Fg) / ref.value.F));
    return (
      <G>
        <Circle cx={x1} cy={y} r={r1} fill={url(ids.m1)} stroke={c.chartInk} />
        <Circle cx={x2} cy={y} r={r2} fill={url(ids.m2)} stroke={c.chartInk} />
        <Vec x1={x1 + r1} y1={y} x2={x1 + r1 + L} y2={y} color={c.forceNet} />
        <Vec x1={x2 - r2} y1={y} x2={x2 - r2 - L} y2={y} color={c.forceNet} />
        <SubLabel
          x={w / 2}
          y={y - 34}
          text={`F = ${q(all, sig(Fg))} N on each, toward the other`}
          color={c.forceNet}
          w={w}
        />
        <SubLabel x={x1} y={y + r1 + 20} text={`m_1 = ${q(m1Ok!, sig(m1!))} kg`} w={w} />
        <SubLabel x={x2} y={y + r2 + 20} text={`m_2 = ${q(m2Ok!, sig(m2!))} kg`} w={w} />
        <Line x1={x1} y1={h - 26} x2={x2} y2={h - 26} stroke={c.chartMuted} />
        <Line x1={x1} y1={h - 32} x2={x1} y2={h - 20} stroke={c.chartMuted} />
        <Line x1={x2} y1={h - 32} x2={x2} y2={h - 20} stroke={c.chartMuted} />
        <SubLabel
          x={w / 2}
          y={h - 30}
          text={`r = ${withUnit(q(dOk, sig(d)), unit(spec.distance, 'm'))} (not to scale)`}
          w={w}
        />
      </G>
    );
  }

  function kepler(w: number, h: number) {
    const s = Math.min((w * 0.84) / (2 * a), (h * 0.62) / (2 * a * Math.sqrt(1 - e * e)));
    const O = { x: w / 2, y: h * 0.46 };
    const X = (x: number) => O.x + x * s;
    const Y = (y: number) => O.y - y * s;
    const b = a * Math.sqrt(1 - e * e);
    const sector = (M1: number, M2: number) => {
      const pts = Array.from({ length: 41 }, (_, i) =>
        keplerPoint(a, e, M1 + ((M2 - M1) * i) / 40),
      );
      return `M ${X(a * e)} ${Y(0)} ${pts.map((p) => `L ${X(p.x).toFixed(1)} ${Y(p.y).toFixed(1)}`).join(' ')} Z`;
    };
    const step = Math.PI / 4;
    const planet = keplerPoint(a, e, step / 2);
    return (
      <G>
        <Path
          d={sector(-step / 2, step / 2)}
          fill={c.chartHighlight}
          opacity={0.22}
          stroke={c.chartHighlight}
        />
        <Path
          d={sector(Math.PI - step / 2, Math.PI + step / 2)}
          fill={c.chartHighlight}
          opacity={0.22}
          stroke={c.chartHighlight}
        />
        <Ellipse
          cx={O.x}
          cy={O.y}
          rx={a * s}
          ry={b * s}
          stroke={c.chartInk}
          strokeWidth={1.5}
          fill="none"
        />
        <Line
          x1={X(-a)}
          y1={O.y}
          x2={X(a)}
          y2={O.y}
          stroke={c.chartMuted}
          strokeDasharray={chart.dashFine}
        />
        <Circle cx={X(a * e)} cy={O.y} r={e > 0.9 ? 7 : 10} fill={url(ids.sun)} stroke={c.sunRay} />
        <Circle cx={X(-a * e)} cy={O.y} r={4} fill={c.card} stroke={c.chartInk} />
        <Circle
          cx={X(planet.x)}
          cy={Y(planet.y)}
          r={6}
          fill={url(ids.planet)}
          stroke={c.chartInk}
        />
        <SubLabel
          x={X(a * e)}
          y={O.y + 26}
          text={star ? 'star (focus)' : 'sun (focus)'}
          w={w}
          size={chart.label}
        />
        {e > 0.05 ? (
          <SubLabel
            x={X(-a * e)}
            y={O.y - 12}
            text="empty focus"
            w={w}
            size={chart.label}
            bold={false}
          />
        ) : null}
        {star && e === 0 ? (
          // A circle: a is its radius, drawn straight up from the star (clear of the sectors
          // and the planet) and labelled at its middle.
          <>
            <Line
              x1={O.x}
              y1={O.y - 12}
              x2={O.x}
              y2={Y(b)}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            <SubLabel
              x={O.x + 6}
              y={(O.y + Y(b)) / 2 + 4}
              text={`a = ${q(all, sig(a))} AU`}
              anchor="start"
              w={w}
            />
          </>
        ) : (
          <>
            <SubLabel
              x={X(a) - 2}
              y={Y(-b) + 22}
              text={`${star ? 'closest' : 'perihelion'} ${q(all, sig(a * (1 - e)))} AU`}
              anchor="end"
              w={w}
            />
            <SubLabel
              x={X(-a) + 2}
              y={Y(b) - 10}
              text={`${star ? 'farthest' : 'aphelion'} ${q(all, sig(a * (1 + e)))} AU`}
              anchor="start"
              w={w}
            />
          </>
        )}
      </G>
    );
  }

  function handles(w: number, h: number) {
    if (spec.fixed) return null;
    if ((spec.mode === 'string' || spec.mode === 'car') && typeof spec.speed === 'string') {
      const id = spec.speed;
      if (!rep.known(id)) return null;
      const { P, t, Lv } = circleGeo(w, h);
      return (
        <DragHandle
          testID="drag-speed"
          x={P.x + t.x * Lv}
          y={P.y + t.y * Lv}
          label={rep.variable(id).name}
          onStart={() => {
            drag.current.v = rep.val(id);
            ref.freeze();
          }}
          onEnd={ref.release}
          onMove={(dx, dy) => {
            const along = dx * t.x + dy * t.y;
            const perPx = ref.value.v / 70;
            calc.set(
              {
                ...rep.pin(
                  [spec.radius, spec.mass].filter((x): x is string => typeof x === 'string'),
                ),
                [id]: rep.snapTo(id, drag.current.v + along * perPx),
              },
              rep.slide(id),
            );
          }}
        />
      );
    }
    if (spec.mode === 'gravity' && typeof spec.distance === 'string' && rep.known(spec.distance)) {
      const id = spec.distance;
      const span = w * 0.6;
      return (
        <DragHandle
          testID="drag-distance"
          x={w * 0.8}
          y={h * 0.45}
          label={rep.variable(id).name}
          onStart={() => {
            drag.current.r = rep.val(id);
            ref.freeze();
          }}
          onEnd={ref.release}
          onMove={(dx) =>
            calc.set(
              {
                ...rep.pin((spec.masses ?? []).flatMap((x) => (typeof x === 'string' ? [x] : []))),
                [id]: rep.snapTo(id, drag.current.r * Math.max(0.2, (span + dx) / span)),
              },
              rep.slide(id),
            )
          }
        />
      );
    }
    return null;
  }

  function unit(x: number | string | undefined, d: string) {
    return typeof x === 'string' ? (rep.variable(x).unit ?? d) : d;
  }

  function captionLines(): string[] {
    if (spec.mode === 'gravity')
      return [
        ...worked(
          all,
          `F = Gm₁m₂/r² = ${sig(G_NEWTON)} × ${sig(m1!)} × ${sig(m2!)}/${sig(d)}² = ${sig(Fg)} N`,
        ),
        'Each mass pulls the other just as hard (Newton’s third law). Twice the distance, a quarter of the pull.',
      ];
    if (spec.mode === 'kepler' && star) {
      const T = Math.sqrt(a ** 3 / M);
      return [
        ...(e > 0
          ? [
              `Closest a(1 − e) = ${sig(a)} × (1 − ${sig(e)}) = ${sig(a * (1 - e))} AU; farthest a(1 + e) = ${sig(a * (1 + e))} AU.`,
            ]
          : []),
        `Each shaded sector is swept in 1/8 of the period: equal areas in equal times.`,
        // The way the page solves it: a from a typed period, or T from a typed orbit. The days
        // whole (1,461, as typed), not to 3 figures (1,460).
        typeof spec.semiMajor === 'string' && calc.status(spec.semiMajor) === 'derived'
          ? `a³ = M × T² for a star of M = ${sig(M)} Suns: a = ${nowrap('∛(M × T²)')} = ${nowrap(`∛(${sig(M)} × ${sig(T)}²)`)} = ${sig(a)} AU`
          : `a³ = M × T² for a star of M = ${sig(M)} Suns: T = √(${sig(a)}³ ÷ ${sig(M)}) = ${sig(T)} years (${formatNumber(Math.round(T * 365.25))} days)`,
      ];
    }
    if (spec.mode === 'kepler') {
      const T = Math.pow(a, 1.5);
      return [
        `Perihelion a(1 − e) = ${sig(a)} × (1 − ${sig(e)}) = ${sig(a * (1 - e))} AU; aphelion a(1 + e) = ${sig(a * (1 + e))} AU.`,
        `Each shaded sector is swept in 1/8 of the period: equal areas in equal times, so the planet moves fastest near the sun.`,
        `T² = a³: T = √(${sig(a)}³) = ${sig(T)} years`,
      ];
    }
    const vT = sig(v);
    const out = [
      ...worked(all, `Centripetal acceleration: v²/r = ${vT}²/${sig(r)} = ${sig(ac)} m/s²`),
      ...worked(all && mOk, `Centripetal force: mv²/r = ${sig(m)} × ${sig(ac)} = ${sig(m * ac)} N`),
    ];
    if (spec.period)
      out.push(
        ...worked(
          all,
          `T = 2πr/v = 2π × ${sig(r)}/${vT} = ${v ? sig((2 * Math.PI * r) / v) : '?'} s`,
        ),
      );
    out.push(
      ...worked(
        all,
        spec.mode === 'car'
          ? `Friction toward the center supplies it: the tires need μ ≥ v²/(rg) = ${sig(ac / G_EARTH)}.`
          : 'The string’s pull toward the center supplies it; let go and the ball flies off along the tangent.',
      ),
    );
    return out;
  }
}
