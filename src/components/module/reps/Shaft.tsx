/**
 * A round shaft in torsion, with bending when the page has a moment (HC59, `shaft`; ME-P6). The
 * shaft is painted steel (its diameter and length not to one scale: a long thin shaft would be a
 * line), with T at both ends as curved arrows and a scribed line twisting by φ. Under it, flat:
 * the end face with τ growing from the centre (from d_i ÷ 2 when hollow, the ring to scale), and
 * either the end view with φ to scale, the speed (a power page), or the stress element at the
 * surface with σ and τ (`moment`). Values are read through shaftMath.ts; a "?" draws nothing.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Line,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import type { ShaftSpec } from '@/data/modules/typesHe3h';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { arrowHead } from './graphKit';
import { useHe3hReader } from './he3hKit';
import { sigText } from './he3hUnits';
import { polarJ, sigmaBend, tauMax, torqueOf, twist, twistScale, vonMises } from './shaftMath';
import { Dimension } from './beamKit';
import { usePaintIds } from './paint';

type Spec = ShaftSpec;
type Pt = [number, number];

const deg = (r: number) => (r * 180) / Math.PI;

/** An elliptical arc's points from angle a0 to a1 (radians, 0 = top, clockwise on screen). */
const arcPts = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 24) =>
  [...Array(n + 1).keys()].map((i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + rx * Math.sin(a), cy - ry * Math.cos(a)] as Pt;
  });
const path = (ps: Pt[]) =>
  ps.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');

/** A curved arrow along an arc, its head at a1. */
function ArcArrow({
  cx,
  cy,
  rx,
  ry,
  a0,
  a1,
  color,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  a0: number;
  a1: number;
  color: string;
}) {
  const ps = arcPts(cx, cy, rx, ry, a0, a1);
  const [x, y] = ps[ps.length - 1]!;
  const [px, py] = ps[ps.length - 3]!;
  return (
    <G>
      <Path d={path(ps.slice(0, -1))} stroke={color} strokeWidth={2.4} fill="none" />
      <Path d={arrowHead(x, y, x - px, y - py, 10)} fill={color} />
    </G>
  );
}

export function Shaft({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('steel', 'face');
  const R = useHe3hReader(calc);
  const { num } = R;
  const d = num(spec.d, 'length');
  const diRaw = num(spec.di, 'length');
  const di = diRaw !== undefined && diRaw > 0 ? diRaw : 0;
  const hollow = spec.di !== undefined;
  const L = num(spec.length, 'length');
  const G_ = num(spec.G, 'modulus');
  const P = num(spec.power, 'power');
  const rpm = num(spec.speed);
  let T = num(spec.torque, 'torque');
  if (T === undefined && spec.torque === undefined && P !== undefined && rpm) T = torqueOf(P, rpm);
  const M = num(spec.moment, 'torque');
  const bending = spec.moment !== undefined;
  const ok = d !== undefined && d > 0 && di < d;
  const tau = num(spec.tau, 'stress') ?? (ok && T !== undefined ? tauMax(T, d, di) : undefined);
  const phi =
    num(spec.angle, 'angle') ??
    (ok && T !== undefined && L !== undefined && G_ !== undefined
      ? twist(T, L, G_, d, di)
      : undefined);
  const sigma =
    num(spec.sigma, 'stress') ?? (ok && M !== undefined ? sigmaBend(M, d, di) : undefined);
  const k = phi !== undefined ? twistScale(Math.abs(phi)) : 1;
  const tUnit = R.unit(spec.torque, 'N·m');
  const sUnit = R.unit(spec.tau ?? spec.sigma, 'MPa');

  const art = (w: number, h: number) => {
    const parts: ReactNode[] = [];
    // ── The shaft ──
    const cy = 74;
    const Rs = 26;
    const ex = Rs * 0.32;
    const xA = 50;
    const xB = w - 62;
    const sense = T !== undefined && T < 0 ? -1 : 1;
    parts.push(
      <G key="shaft">
        <Ellipse cx={xA} cy={cy} rx={ex} ry={Rs} fill={c.metalDark} />
        <Rect x={xA} y={cy - Rs} width={xB - xA} height={2 * Rs} fill={`url(#${ids.steel})`} />
        <Line x1={xA} y1={cy - Rs} x2={xB} y2={cy - Rs} stroke={c.metalDark} strokeWidth={1} />
        <Line x1={xA} y1={cy + Rs} x2={xB} y2={cy + Rs} stroke={c.metalDark} strokeWidth={1} />
        <Ellipse
          cx={xB}
          cy={cy}
          rx={ex}
          ry={Rs}
          fill={`url(#${ids.face})`}
          stroke={c.metalDark}
          strokeWidth={1}
        />
        {hollow && ok && di > 0 ? (
          <Ellipse
            cx={xB}
            cy={cy}
            rx={(ex * di) / d}
            ry={(Rs * di) / d}
            fill={c.shade}
            opacity={0.55}
          />
        ) : null}
      </G>,
    );
    // The scribed line: dashed where it was, solid where the twist has taken it.
    const th0 = (55 * Math.PI) / 180;
    const along = (th: number, x: number): Pt => [x, cy - Rs * Math.cos(th)];
    parts.push(
      <Line
        key="scribe0"
        x1={xA}
        y1={along(th0, xA)[1]}
        x2={xB}
        y2={along(th0, xB)[1]}
        stroke={c.chartInk}
        strokeWidth={1}
        strokeDasharray={chart.dashFine}
        opacity={0.7}
      />,
    );
    if (phi !== undefined) {
      const drawn = Math.max(-1.6, Math.min(1.6, sense * Math.abs(phi) * k));
      const ps = [...Array(31).keys()].map((i) => {
        const f = i / 30;
        return along(th0 + drawn * f, xA + (xB - xA) * f);
      });
      parts.push(
        <Path key="scribe" d={path(ps)} stroke={c.chartHighlight} strokeWidth={2.2} fill="none" />,
      );
    }
    // Torque at both ends, opposite senses, in front of the ends.
    if (T !== undefined || spec.torque !== undefined) {
      const tr = ex + 9;
      const ty = Rs + 9;
      const [r0, r1] = sense > 0 ? [-0.2, Math.PI - 0.25] : [Math.PI - 0.2, -0.25];
      parts.push(
        <G key="T">
          <ArcArrow cx={xB} cy={cy} rx={tr} ry={ty} a0={r0} a1={r1} color={c.beamLoad} />
          <ArcArrow cx={xA} cy={cy} rx={tr} ry={ty} a0={r1} a1={r0} color={c.beamLoad} />
        </G>,
      );
      const tl = R.label(spec.torque, 'T', T, tUnit) ?? `${R.sym(spec.torque, 'T')} = ?`;
      parts.push(
        <ChartText
          key="tl"
          x={w - 4}
          y={cy - Rs - 16}
          textAnchor="end"
          fontSize={chart.label}
          fontWeight="700"
          fill={c.beamLoad}
        >
          {tl}
        </ChartText>,
        <ChartText
          key="tl0"
          x={xA - 6}
          y={cy - Rs - 16}
          textAnchor="middle"
          fontSize={chart.label}
          fontWeight="700"
          fill={c.beamLoad}
        >
          {R.sym(spec.torque, 'T')}
        </ChartText>,
      );
    }
    // Bending: M as curved arrows in the page's plane at both ends (the shaft sags).
    if (bending) {
      const ml = R.label(spec.moment, 'M', M, tUnit) ?? `${R.sym(spec.moment, 'M')} = ?`;
      parts.push(
        <G key="M">
          <ArcArrow
            cx={xA + 34}
            cy={cy + Rs + 20}
            rx={22}
            ry={12}
            a0={-1.4}
            a1={-3.6}
            color={c.beamMoment}
          />
          <ArcArrow
            cx={xB - 34}
            cy={cy + Rs + 20}
            rx={22}
            ry={12}
            a0={1.4}
            a1={3.6}
            color={c.beamMoment}
          />
          <ChartText
            x={w / 2}
            y={cy + Rs + 34}
            textAnchor="middle"
            fontSize={chart.label}
            fontWeight="700"
            fill={c.beamMoment}
          >
            {ml}
          </ChartText>
          {/* The element at the surface, on the stretched (lower) side. */}
          <Rect
            x={(xA + xB) / 2 - 7}
            y={cy + Rs - 15}
            width={14}
            height={12}
            fill="none"
            stroke={c.chartInk}
            strokeWidth={1.5}
          />
        </G>,
      );
    } else if (L !== undefined || spec.length !== undefined) {
      const ll = R.label(spec.length, 'L', L, 'mm') ?? `${R.sym(spec.length, 'L')} = ?`;
      parts.push(<Dimension key="L" x1={xA} x2={xB} y={cy + Rs + 24} text={ll} w={w} />);
    }
    if (k > 1 && phi !== undefined)
      parts.push(
        <ChartText
          key="k"
          x={(xA + xB) / 2}
          y={cy - Rs - 6}
          textAnchor="middle"
          fontSize={chart.label}
          fill={c.chartHighlight}
        >
          {`twist drawn ×${k}`}
        </ChartText>,
      );

    // ── The end face with τ (left) ──
    const yc = 150 + (h - 150) / 2 - 4;
    const Rf = Math.min(50, (h - 150) / 2 - 22);
    const x1c = w * 0.25;
    const ri = ok ? (Rf * di) / d : 0;
    parts.push(
      <G key="face">
        <Circle cx={x1c} cy={yc} r={Rf} fill={c.metal} stroke={c.metalDark} strokeWidth={1.2} />
        {ri > 0 ? (
          <Circle cx={x1c} cy={yc} r={ri} fill={c.background} stroke={c.metalDark} />
        ) : null}
        <Line x1={x1c + ri} y1={yc} x2={x1c + Rf} y2={yc} stroke={c.chartInk} strokeWidth={1} />
        <Circle cx={x1c} cy={yc} r={1.8} fill={c.chartInk} />
      </G>,
    );
    if (tau !== undefined && ok) {
      const top = 34;
      const n = ri > Rf * 0.5 ? 3 : 5;
      const pts: Pt[] = [];
      for (let i = 0; i <= n; i++) {
        const r = ri + ((Rf - ri) * i) / n;
        const len = (top * r) / Rf;
        pts.push([x1c + r, yc - len]);
        if (len > 4)
          parts.push(
            <G key={`ta${i}`}>
              <Line
                x1={x1c + r}
                y1={yc}
                x2={x1c + r}
                y2={yc - len + 5}
                stroke={c.sectionShear}
                strokeWidth={1.6}
              />
              <Path d={arrowHead(x1c + r, yc - len, 0, -1, 6)} fill={c.sectionShear} />
            </G>,
          );
      }
      parts.push(
        <Path
          key="tline"
          d={path([[x1c + ri, yc], ...pts])}
          stroke={c.sectionShear}
          strokeWidth={1}
          fill="none"
          strokeDasharray={chart.dashFine}
        />,
      );
      const tl = R.label(spec.tau, 'τ_max', tau, sUnit) ?? '';
      parts.push(
        <ChartText
          key="tau"
          x={x1c}
          y={yc - Rf - 9}
          textAnchor="middle"
          fontSize={chart.label}
          fontWeight="700"
          fill={c.sectionShear}
        >
          {tl}
        </ChartText>,
      );
      if (ri > 0)
        parts.push(
          <ChartText
            key="taui"
            x={x1c - Rf - 2}
            y={yc + Rf + 32}
            fontSize={chart.label}
            fill={c.sectionShear}
          >
            {`τ at d_i ÷ 2 = ${sigText((tau * di) / d, 3)} ${sUnit}`}
          </ChartText>,
        );
    }
    const dl = R.label(spec.d, 'd', d, 'mm') ?? `${R.sym(spec.d, 'd')} = ?`;
    const dil = hollow
      ? (R.label(spec.di, 'd_i', di, 'mm') ?? `${R.sym(spec.di, 'd_i')} = ?`)
      : undefined;
    parts.push(
      <ChartText
        key="d"
        x={x1c}
        y={yc + Rf + 17}
        textAnchor="middle"
        fontSize={chart.label}
        fontWeight="700"
      >
        {dil ? `${dl}, ${dil}` : dl}
      </ChartText>,
    );

    // ── The right inset ──
    const x2c = w * 0.75;
    if (bending) {
      const s = 30;
      const sl = R.label(spec.sigma, 'σ', sigma, sUnit) ?? `${R.sym(spec.sigma, 'σ')} = ?`;
      const tl2 = R.label(spec.tau, 'τ', tau, sUnit) ?? `${R.sym(spec.tau, 'τ')} = ?`;
      parts.push(
        <G key="el">
          <Rect
            x={x2c - s}
            y={yc - s}
            width={2 * s}
            height={2 * s}
            fill={c.chartSurface}
            stroke={c.chartInk}
            strokeWidth={1.5}
          />
          {sigma !== undefined ? (
            <>
              <Path
                d={`M ${x2c + s + 2} ${yc} L ${x2c + s + 22} ${yc}`}
                stroke={c.sectionTension}
                strokeWidth={2.4}
              />
              <Path d={arrowHead(x2c + s + 26, yc, 1, 0, 9)} fill={c.sectionTension} />
              <Path
                d={`M ${x2c - s - 2} ${yc} L ${x2c - s - 22} ${yc}`}
                stroke={c.sectionTension}
                strokeWidth={2.4}
              />
              <Path d={arrowHead(x2c - s - 26, yc, -1, 0, 9)} fill={c.sectionTension} />
            </>
          ) : null}
          {tau !== undefined ? (
            <>
              <Line
                x1={x2c - s + 4}
                y1={yc - s - 6}
                x2={x2c + s - 8}
                y2={yc - s - 6}
                stroke={c.sectionShear}
                strokeWidth={1.5}
              />
              <Path d={arrowHead(x2c + s - 4, yc - s - 6, 1, 0, 8)} fill={c.sectionShear} />
              <Line
                x1={x2c - s + 8}
                y1={yc + s + 6}
                x2={x2c + s - 4}
                y2={yc + s + 6}
                stroke={c.sectionShear}
                strokeWidth={1.5}
              />
              <Path d={arrowHead(x2c - s + 4, yc + s + 6, -1, 0, 8)} fill={c.sectionShear} />
              <Line
                x1={x2c + s + 6}
                y1={yc + s - 4}
                x2={x2c + s + 6}
                y2={yc - s + 6}
                stroke={c.sectionShear}
                strokeWidth={1.5}
              />
              <Path d={arrowHead(x2c + s + 6, yc - s + 4, 0, -1, 8)} fill={c.sectionShear} />
              <Line
                x1={x2c - s - 6}
                y1={yc - s + 4}
                x2={x2c - s - 6}
                y2={yc + s - 6}
                stroke={c.sectionShear}
                strokeWidth={1.5}
              />
              <Path d={arrowHead(x2c - s - 6, yc + s - 4, 0, 1, 8)} fill={c.sectionShear} />
            </>
          ) : null}
          <ChartText
            x={x2c}
            y={yc - s - 16}
            textAnchor="middle"
            fontSize={chart.label}
            fontWeight="700"
            fill={c.sectionShear}
          >
            {tl2}
          </ChartText>
          <ChartText
            x={x2c}
            y={yc + s + 24}
            textAnchor="middle"
            fontSize={chart.label}
            fontWeight="700"
            fill={c.sectionTension}
          >
            {sl}
          </ChartText>
        </G>,
      );
    } else if (spec.power !== undefined || spec.speed !== undefined) {
      const rr = Math.min(36, Rf - 8);
      const pl = R.label(spec.power, 'P', P, 'W') ?? `${R.sym(spec.power, 'P')} = ?`;
      const nl = R.label(spec.speed, 'n', rpm, 'rpm') ?? `${R.sym(spec.speed, 'n')} = ?`;
      parts.push(
        <G key="spin">
          <Circle cx={x2c} cy={yc} r={rr} fill={c.metal} stroke={c.metalDark} strokeWidth={1.2} />
          {ok && di > 0 ? (
            <Circle cx={x2c} cy={yc} r={(rr * di) / d} fill={c.background} stroke={c.metalDark} />
          ) : null}
          <ArcArrow
            cx={x2c}
            cy={yc}
            rx={rr + 9}
            ry={rr + 9}
            a0={-2.2}
            a1={1.9}
            color={c.chartHighlight}
          />
          <ChartText
            x={x2c}
            y={yc - rr - 18}
            textAnchor="middle"
            fontSize={chart.label}
            fontWeight="700"
            fill={c.chartHighlight}
          >
            {nl}
          </ChartText>
          <ChartText
            x={x2c}
            y={yc + rr + 26}
            textAnchor="middle"
            fontSize={chart.label}
            fontWeight="700"
          >
            {pl}
          </ChartText>
        </G>,
      );
    } else {
      // The end view, φ to scale: the scribed line's end turned from where it was.
      const rr = Rf;
      const a = phi !== undefined ? sense * Math.abs(phi) : 0;
      const pl = R.label(spec.angle, 'φ', phi, 'rad');
      const phiText = !pl
        ? `${R.sym(spec.angle, 'φ')} = ?`
        : R.unit(spec.angle, 'rad') === 'rad'
          ? `${pl} = ${sigText(deg(phi!), 3)}°`
          : pl;
      parts.push(
        <G key="phi">
          <Circle
            cx={x2c}
            cy={yc}
            r={rr}
            fill={c.chartSurface}
            stroke={c.chartInk}
            strokeWidth={1.2}
          />
          {ok && di > 0 ? (
            <Circle cx={x2c} cy={yc} r={(rr * di) / d} fill={c.background} stroke={c.chartInk} />
          ) : null}
          <Line
            x1={x2c}
            y1={yc}
            x2={x2c}
            y2={yc - rr}
            stroke={c.chartInk}
            strokeWidth={1}
            strokeDasharray={chart.dashFine}
          />
          {phi !== undefined ? (
            <>
              <Line
                x1={x2c}
                y1={yc}
                x2={x2c + rr * Math.sin(a)}
                y2={yc - rr * Math.cos(a)}
                stroke={c.chartHighlight}
                strokeWidth={2.2}
              />
              <Path
                d={path(arcPts(x2c, yc, rr * 0.6, rr * 0.6, 0, a))}
                stroke={c.chartHighlight}
                strokeWidth={1.4}
                fill="none"
              />
            </>
          ) : null}
          <ChartText
            x={x2c}
            y={yc + rr + 17}
            textAnchor="middle"
            fontSize={chart.label}
            fontWeight="700"
            fill={c.chartHighlight}
          >
            {phiText}
          </ChartText>
        </G>,
      );
    }

    return (
      <Svg width={w} height={h}>
        <Defs>
          <LinearGradient id={ids.steel} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={c.metalDark} stopOpacity={1} />
            <Stop offset="0.3" stopColor={c.shine} stopOpacity={0.9 * c.sheen} />
            <Stop offset="0.45" stopColor={c.metal} stopOpacity={1} />
            <Stop offset="1" stopColor={c.metalDark} stopOpacity={1} />
          </LinearGradient>
          <LinearGradient id={ids.face} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={c.shine} stopOpacity={0.8 * c.sheen} />
            <Stop offset="1" stopColor={c.metal} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        {parts}
      </Svg>
    );
  };

  // ── The caption ──
  const lines: string[] = [];
  if (!ok)
    lines.push(
      d !== undefined && di >= d
        ? 'The bore can’t be as wide as the shaft: d_i must be under d.'
        : 'Type the diameter to draw the stresses.',
    );
  else {
    const J = polarJ(d, di);
    if (T !== undefined) {
      lines.push(
        hollow
          ? `J = π(d⁴ − d_i⁴) ÷ 32 = ${sigText(J, 4)} mm⁴; τ = Tr ÷ J grows from ${sigText((tauMax(T, d, di) * di) / d, 3)} at the bore to τ_max = ${sigText(tauMax(T, d, di), 4)} MPa.`
          : `J = πd⁴ ÷ 32 = ${sigText(J, 4)} mm⁴; τ = Tr ÷ J grows from 0 at the centre to τ_max = 16T ÷ πd³ = ${sigText(tauMax(T, d), 4)} MPa.`,
      );
    }
    if (spec.power !== undefined && P !== undefined && rpm !== undefined)
      lines.push(`T = P ÷ ω, ω = 2πn ÷ 60 = ${sigText((2 * Math.PI * rpm) / 60, 4)} rad/s.`);
    if (phi !== undefined && !bending && spec.power === undefined)
      lines.push(
        `φ = TL ÷ GJ = ${sigText(phi, 3)} rad = ${sigText(deg(phi), 3)}°: the end view shows it to scale${k > 1 ? `, the shaft’s side ×${k} so it shows` : ''}.`,
      );
    if (bending && sigma !== undefined && tau !== undefined)
      lines.push(
        `At the surface σ = 32M ÷ πd³ = ${sigText(sigma, 4)} MPa and τ = 16T ÷ πd³; σ′ = √(σ² + 3τ²) = ${sigText(vonMises(sigma, tau), 4)} MPa.`,
      );
  }
  lines.push('The shaft’s diameter and length are not to one scale.');
  for (const id of [spec.vonMises, spec.n, spec.J, spec.G, spec.tauAllow, ...(spec.more ?? [])]) {
    const lab = typeof id === 'string' ? R.label(id, '') : undefined;
    if (lab) lines.push(lab);
  }

  return (
    <View>
      <Canvas aspect={(w) => 330 / w}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
