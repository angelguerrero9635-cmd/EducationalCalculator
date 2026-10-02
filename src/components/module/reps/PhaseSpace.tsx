/**
 * HC69 `phaseSpace` (PhaseSpaceSpec in typesHe3l.ts): a state as a point in phase space on its
 * energy curve, with the flow (∂H/∂p, −∂H/∂x) as an arrow: the oscillator's ellipses (drag the
 * point), the pendulum's ovals, rotations and separatrix, and a bead on a spinning hoop beside
 * its effective potential. The graphs are flat; the hoop and bead are painted.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, Path } from 'react-native-svg';

import type { PhaseSpaceSpec } from '@/data/modules/typesHe3l';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen } from './common';
import { Arrow } from './he1fKit';
import { fmt, Tag } from './he2fKit';
import { useHe3l } from './he3lKit';
import { hoopOf, hoopU, oscillatorOf, pendulumOf, pendulumOmega, unitSI } from './he3lMath';
import { Ball, Metal, url, usePaintIds } from './paint';

type Osc = Extract<PhaseSpaceSpec, { system: 'oscillator' }>;
type Pend = Extract<PhaseSpaceSpec, { system: 'pendulum' }>;
type Hoop = Extract<PhaseSpaceSpec, { system: 'hoop' }>;

const DEG = Math.PI / 180;
const fixedHeight = (h: number) => (w: number) => h / w;

export function PhaseSpace({ spec, calc }: { spec: PhaseSpaceSpec; calc: Calculator }) {
  if (spec.system === 'oscillator') return <OscillatorView spec={spec} calc={calc} />;
  if (spec.system === 'pendulum') return <PendulumView spec={spec} calc={calc} />;
  return <HoopView spec={spec} calc={calc} />;
}

/** A small arrowhead on a curve at (x, y) pointing along (dx, dy). */
function Chevron({
  x,
  y,
  dx,
  dy,
  color,
}: {
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
}) {
  const l = Math.hypot(dx, dy) || 1;
  const [ux, uy] = [dx / l, dy / l];
  const s = 6;
  return (
    <Path
      d={`M ${x + ux * s} ${y + uy * s} L ${x - ux * s + uy * s * 0.7} ${y - uy * s - ux * s * 0.7} L ${x - ux * s - uy * s * 0.7} ${y - uy * s + ux * s * 0.7} Z`}
      fill={color}
    />
  );
}

// ─── Oscillator ──────────────────────────────────────────────────────────────

const OSC_H = 340;

function OscillatorView({ spec, calc }: { spec: Osc; calc: Calculator }) {
  const c = usePalette();
  const { rep, si, label } = useHe3l(calc);
  const [m, k, x, p] = [si(spec.mass), si(spec.spring), si(spec.position), si(spec.momentum)];
  const ok = m !== undefined && k !== undefined && m > 0 && k > 0;
  const o = ok && x !== undefined && p !== undefined ? oscillatorOf(m, k, x, p) : undefined;
  const H = o?.H ?? (ok ? si(spec.energy) : undefined);
  const xHalf = ok && H !== undefined ? Math.sqrt((2 * H) / k) : undefined;
  const pHalf = ok && H !== undefined ? Math.sqrt(2 * m * H) : undefined;
  // The window: the drawn ellipse and one at twice its energy, from the values (frozen in a drag).
  const live = {
    X: xHalf && xHalf > 0 ? xHalf * Math.SQRT2 * 1.18 : 1,
    P: pHalf && pHalf > 0 ? pHalf * Math.SQRT2 * 1.18 : 1,
  };
  const win = useFrozen(live);
  const drag = useRef({ x: 0, p: 0 });
  const canDrag =
    !spec.fixed && typeof spec.position === 'string' && typeof spec.momentum === 'string' && !!o;

  const lines: string[] = [];
  if (o)
    lines.push(
      `H = p² ÷ 2m + ½kx² = ${fmt(p!)}² ÷ (2 × ${fmt(m!)}) + ½ × ${fmt(k!)} × ${fmt(x!)}² = ${fmt(o.H)} J`,
      `Hamilton: ẋ = ∂H/∂p = p ÷ m = ${fmt(o.xdot)} m/s, ṗ = −∂H/∂x = −kx = ${fmt(o.pdot)} N`,
      `ω = √(k ÷ m) = ${fmt(o.omega)} rad/s; area 𝒜 = 2πH ÷ ω = ${fmt(o.area)} J·s`,
    );
  else lines.push('H = p² ÷ 2m + ½kx²; Hamilton’s equations: ẋ = ∂H/∂p = p ÷ m, ṗ = −∂H/∂x = −kx.');
  lines.push('H is conserved, so the point runs clockwise round one ellipse.');

  const corner = [
    label(spec.energy, 'H', o?.H, 'J'),
    label(spec.velocity, 'ẋ', o?.xdot, 'm/s'),
    label(spec.force, 'ṗ', o?.pdot, 'N'),
    label(spec.area, '𝒜', o?.area, 'J·s'),
  ].filter((t): t is string => !!t);

  return (
    <View>
      <Canvas aspect={fixedHeight(OSC_H)}>
        {({ w, h }) => {
          const cx = w / 2;
          const cy = h / 2 + 6;
          const rx = Math.min(w / 2 - 20, 170);
          const ry = h / 2 - 34;
          const { X, P } = win.value;
          const sx = rx / X;
          const sy = ry / P;
          const ell = (f: number) =>
            xHalf !== undefined && pHalf !== undefined
              ? { rx: xHalf * Math.sqrt(f) * sx, ry: pHalf * Math.sqrt(f) * sy }
              : undefined;
          const main = ell(1);
          const pt = o ? { x: cx + x! * sx, y: cy - p! * sy } : undefined;
          // The flow arrow: (ẋ, ṗ) on the axes' scales, 48 px long.
          let tip: { x: number; y: number } | undefined;
          if (o && pt && (o.xdot !== 0 || o.pdot !== 0)) {
            const vx = o.xdot * sx;
            const vy = -o.pdot * sy;
            const l = Math.hypot(vx, vy);
            tip = { x: pt.x + (vx / l) * 48, y: pt.y + (vy / l) * 48 };
          }
          return (
            <>
              <Svg width={w} height={h}>
                {/* Axes. */}
                <Line x1={cx - rx - 8} y1={cy} x2={cx + rx + 8} y2={cy} stroke={c.chartMuted} />
                <Line x1={cx} y1={cy - ry - 8} x2={cx} y2={cy + ry + 8} stroke={c.chartMuted} />
                <Tag x={cx + rx + 8} y={cy + 16} text="x" anchor="end" chip={false} />
                <Tag x={cx + 6} y={cy - ry - 2} text="p" anchor="start" chip={false} />
                {/* Fainter ellipses for scale, half and twice the energy. */}
                {[0.25, 2].map((f) => {
                  const e = ell(f);
                  return e ? (
                    <Ellipse
                      key={f}
                      cx={cx}
                      cy={cy}
                      rx={e.rx}
                      ry={e.ry}
                      stroke={c.chartGrid}
                      strokeWidth={1}
                      strokeDasharray={chart.dashFine}
                      fill="none"
                    />
                  ) : null;
                })}
                {main ? (
                  <G>
                    <Ellipse
                      cx={cx}
                      cy={cy}
                      rx={main.rx}
                      ry={main.ry}
                      stroke={c.he3lCurve}
                      strokeWidth={2.5}
                      fill={c.he3lCurve}
                      fillOpacity={0.1}
                    />
                    <Chevron x={cx} y={cy - main.ry} dx={1} dy={0} color={c.he3lCurve} />
                    <Chevron x={cx} y={cy + main.ry} dx={-1} dy={0} color={c.he3lCurve} />
                    {/* The half-widths on the axes. */}
                    <Circle cx={cx + main.rx} cy={cy} r={3} fill={c.chartInk} />
                    <Circle cx={cx} cy={cy - main.ry} r={3} fill={c.chartInk} />
                    {/* Named at the axes; their values at the bottom left. */}
                    <Tag x={cx + main.rx - 6} y={cy + 18} text="√(2H/k)" anchor="end" w={w} />
                    <Tag x={cx + 6} y={cy - main.ry - 8} text="√(2mH)" anchor="start" w={w} />
                    <Tag
                      x={6}
                      y={h - 26}
                      text={`√(2H/k) = ${fmt(xHalf!)} m`}
                      anchor="start"
                      w={w}
                    />
                    <Tag
                      x={6}
                      y={h - 8}
                      text={`√(2mH) = ${fmt(pHalf!)} kg·m/s`}
                      anchor="start"
                      w={w}
                    />
                  </G>
                ) : null}
                {pt && tip ? (
                  <G>
                    <Arrow x1={pt.x} y1={pt.y} x2={tip.x} y2={tip.y} color={c.chartInk} width={2} />
                  </G>
                ) : null}
                {pt ? <Circle cx={pt.x} cy={pt.y} r={5} fill={c.chartHighlight} /> : null}
                {corner.map((t, i) => (
                  <Tag key={t} x={6} y={18 + i * 17} text={t} anchor="start" w={w} />
                ))}
              </Svg>
              {canDrag && pt ? (
                <DragHandle
                  testID="drag-phase-point"
                  x={pt.x}
                  y={pt.y}
                  label={rep.variable(spec.position as string).name}
                  onStart={() => {
                    win.freeze();
                    drag.current = {
                      x: rep.val(spec.position as string),
                      p: rep.val(spec.momentum as string),
                    };
                  }}
                  onEnd={() => win.release()}
                  onMove={(dx, dy) => {
                    const [xi, pi] = [spec.position as string, spec.momentum as string];
                    // SI per formula unit of each.
                    const kx = unitSI(rep.unit(xi)) / rep.factor(xi);
                    const kp = unitSI(rep.unit(pi)) / rep.factor(pi);
                    calc.set(
                      {
                        ...rep.pin(
                          [spec.mass, spec.spring].filter(
                            (v): v is string => typeof v === 'string',
                          ),
                        ),
                        [xi]: rep.snapTo(xi, drag.current.x + dx / sx / kx),
                        [pi]: rep.snapTo(pi, drag.current.p - dy / sy / kp),
                      },
                      rep.slide(xi),
                    );
                  }}
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

// ─── Pendulum ────────────────────────────────────────────────────────────────

const PEND_H = 320;

function PendulumView({ spec, calc }: { spec: Pend; calc: Calculator }) {
  const c = usePalette();
  const { si, label } = useHe3l(calc);
  const [m, L, w0, g] = [si(spec.mass), si(spec.length), si(spec.speed), si(spec.g)];
  const ok = m !== undefined && L !== undefined && g !== undefined && m > 0 && L > 0 && g > 0;
  const pd = ok && w0 !== undefined ? pendulumOf(m, L, w0, g) : undefined;
  const Es = ok ? 2 * m * g * L : undefined;
  const wSep = ok ? Math.sqrt((4 * g) / L) : undefined;
  const over = pd !== undefined && pd.thetaMax === undefined;

  const lines: string[] = [];
  if (pd && Es !== undefined) {
    lines.push(
      `E = ½mL²ω₀² = ½ × ${fmt(m!)} × ${fmt(L!)}² × ${fmt(w0!)}² = ${fmt(pd.E)} J; E_s = 2mgL = 2 × ${fmt(m!)} × ${fmt(g!)} × ${fmt(L!)} = ${fmt(Es)} J`,
    );
    lines.push(
      pd.thetaMax !== undefined
        ? `E < E_s: it swings (libration). cos θ_max = 1 − E ÷ mgL = ${fmt(1 - pd.E / (m! * g! * L!))}, θ_max = ${fmt(pd.thetaMax)}°`
        : `E > E_s: it goes over the top and keeps turning (rotation), since ω₀ > √(4g/L) = ${fmt(wSep!)} rad/s.`,
    );
  } else
    lines.push('E = ½mL²ω₀²; the separatrix E_s = 2mgL parts swinging from going over the top.');
  lines.push('The flow is (θ̇, ω̇) = (ω, −(g/L) sin θ): clockwise round each oval.');

  return (
    <View>
      <Canvas aspect={fixedHeight(PEND_H)}>
        {({ w, h }) => {
          const x0 = 30;
          const x1 = w - 24;
          const cy = h / 2 - 4;
          const ry = h / 2 - 44;
          const wTop = ok ? Math.max(wSep!, w0 ?? 0) * 1.2 : 1;
          const X = (th: number) => x0 + ((th + 180) / 360) * (x1 - x0);
          const Y = (om: number) => cy - (om / wTop) * ry;
          const curve = (E: number) => {
            if (!ok) return '';
            // A libration oval closes through its turning points on the axis.
            if (E < Es!) return libration(E, Math.acos(1 - E / (m! * g! * L!)) / DEG);
            const segs: string[] = [];
            for (const s of [1, -1]) {
              let d = '';
              for (let i = 0; i <= 180; i++) {
                const th = -180 + i * 2;
                const om = pendulumOmega(m!, L!, g!, E, th);
                if (om === undefined) {
                  if (d) segs.push(d);
                  d = '';
                  continue;
                }
                d += `${d ? 'L' : 'M'} ${X(th)} ${Y(s * om)} `;
              }
              if (d) segs.push(d);
            }
            return segs.join(' ');
          };
          const libration = (E: number, tm: number) => {
            const pts: string[] = [];
            const n = 90;
            for (let i = 0; i <= n; i++) {
              const th = -tm + (2 * tm * i) / n;
              pts.push(`${i ? 'L' : 'M'} ${X(th)} ${Y(pendulumOmega(m!, L!, g!, E, th) ?? 0)}`);
            }
            for (let i = n; i >= 0; i--) {
              const th = -tm + (2 * tm * i) / n;
              pts.push(`L ${X(th)} ${Y(-(pendulumOmega(m!, L!, g!, E, th) ?? 0))}`);
            }
            return `${pts.join(' ')} Z`;
          };
          const bottom = pd ? { x: X(0), y: Y(w0!) } : undefined;
          return (
            <Svg width={w} height={h}>
              <Line x1={x0} y1={cy} x2={x1} y2={cy} stroke={c.chartMuted} />
              <Line x1={X(0)} y1={cy - ry - 8} x2={X(0)} y2={cy + ry + 8} stroke={c.chartMuted} />
              {[-180, -90, 90, 180].map((t) => (
                <G key={t}>
                  <Line x1={X(t)} y1={cy - 3} x2={X(t)} y2={cy + 3} stroke={c.chartMuted} />
                  <ChartText
                    x={X(t)}
                    y={h - 22}
                    fontSize={chart.label}
                    textAnchor="middle"
                    fill={c.chartMuted}
                  >
                    {`${t < 0 ? '−' : ''}${Math.abs(t)}°`}
                  </ChartText>
                </G>
              ))}
              <Tag x={x1} y={h - 6} text="θ" anchor="end" chip={false} />
              <Tag x={X(0) + 6} y={14} text="ω (rad/s)" anchor="start" chip={false} />
              {ok
                ? [0.3, 0.65, 1.6].map((f) => (
                    <Path
                      key={f}
                      d={curve(f * Es!)}
                      stroke={c.chartGrid}
                      strokeWidth={1.2}
                      fill="none"
                    />
                  ))
                : null}
              {ok ? (
                <Path
                  d={curve(Es! * (1 - 1e-9))}
                  stroke={c.chartInk}
                  strokeWidth={1.5}
                  strokeDasharray={chart.dash}
                  fill="none"
                />
              ) : null}
              {ok ? (
                <Tag
                  x={6}
                  y={18}
                  text={`${label(spec.separatrix, 'E_s', Es, 'J') ?? 'E_s'} (dashed)`}
                  anchor="start"
                  w={w}
                />
              ) : null}
              {pd ? (
                <Path
                  d={curve(pd.E)}
                  stroke={c.he3lCurve}
                  strokeWidth={2.5}
                  fill={over ? 'none' : c.he3lCurve}
                  fillOpacity={0.1}
                />
              ) : null}
              {pd && pd.thetaMax !== undefined
                ? [-1, 1].map((s) => (
                    <Circle
                      key={s}
                      cx={X(s * pd.thetaMax!)}
                      cy={cy}
                      r={6}
                      stroke={c.chartInk}
                      strokeWidth={1.5}
                      fill="none"
                    />
                  ))
                : null}
              {pd && pd.thetaMax !== undefined ? (
                <Tag
                  x={X(pd.thetaMax)}
                  y={cy + 20}
                  text={label(spec.amplitude, 'θ_max', pd.thetaMax, '°') ?? ''}
                  w={w}
                />
              ) : null}
              {over ? (
                <Tag
                  x={X(150)}
                  y={Y(pendulumOmega(m!, L!, g!, pd!.E, 180)!) - 10}
                  text="goes over the top"
                  w={w}
                />
              ) : null}
              {bottom ? (
                <G>
                  <Arrow
                    x1={bottom.x}
                    y1={bottom.y}
                    x2={bottom.x + 44}
                    y2={bottom.y}
                    color={c.chartInk}
                  />
                  <Circle cx={bottom.x} cy={bottom.y} r={5} fill={c.chartHighlight} />
                  <Tag
                    x={bottom.x - 8}
                    y={bottom.y - 9}
                    text={label(spec.speed, 'ω₀', w0, 'rad/s') ?? ''}
                    anchor="end"
                    w={w}
                  />
                </G>
              ) : null}
              {pd ? (
                <Tag
                  x={w - 6}
                  y={18}
                  text={label(spec.energy, 'E', pd.E, 'J') ?? ''}
                  anchor="end"
                  w={w}
                />
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

// ─── Bead on a hoop ──────────────────────────────────────────────────────────

const HOOP_H = 300;

function HoopView({ spec, calc }: { spec: Hoop; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('hoop', 'bead');
  const { si, label } = useHe3l(calc);
  const [R, om, g] = [si(spec.radius), si(spec.spin), si(spec.g)];
  const ok = R !== undefined && g !== undefined && R > 0 && g > 0;
  const hp = ok && om !== undefined ? hoopOf(R, om, g) : undefined;
  const wc = ok ? Math.sqrt(g / R) : undefined;
  const ratio = hp && om !== undefined ? om / hp.wc : undefined;

  const lines: string[] = [];
  if (hp && om !== undefined) {
    lines.push(`ω_c = √(g ÷ R) = √(${fmt(g!)} ÷ ${fmt(R!)}) = ${fmt(hp.wc)} rad/s`);
    lines.push(
      om > hp.wc
        ? `ω > ω_c: cos θ₀ = g ÷ (ω²R) = ${fmt(g!)} ÷ (${fmt(om)}² × ${fmt(R!)}) = ${fmt(g! / (om * om * R!))}, θ₀ = ${fmt(hp.theta0)}°; Ω = ω sin θ₀ = ${fmt(hp.Omega)} rad/s`
        : `ω ≤ ω_c: the bottom is the minimum, θ₀ = 0°; Ω = √(ω_c² − ω²) = ${fmt(hp.Omega)} rad/s`,
    );
  } else lines.push('ω_c = √(g ÷ R); above it cos θ₀ = g ÷ (ω²R), below it θ₀ = 0.');
  lines.push('U_eff ÷ mgR = 1 − cos θ − ½(ω ÷ ω_c)² sin² θ: the bead rests at its minimum.');

  return (
    <View>
      <Canvas aspect={fixedHeight(HOOP_H)}>
        {({ w, h }) => {
          // The hoop on the left.
          const r = Math.min(w * 0.19, 78);
          const hx = r + 22;
          const hy = h / 2 + 4;
          const th0 = hp?.theta0 ?? 0;
          const bead = {
            x: hx + r * Math.sin(th0 * DEG),
            y: hy + r * Math.cos(th0 * DEG),
          };
          // The graph on the right.
          const gx0 = hx + r + 34;
          const gx1 = w - 24;
          const gy0 = 30;
          const gy1 = h - 40;
          const us =
            ratio !== undefined
              ? Array.from({ length: 181 }, (_, i) => hoopU(ratio, -180 + i * 2))
              : [];
          const uMin = Math.min(0, ...us);
          const uMax = Math.max(2, ...us);
          const GX = (t: number) => gx0 + ((t + 180) / 360) * (gx1 - gx0);
          const GY = (u: number) => gy1 - ((u - uMin) / (uMax - uMin)) * (gy1 - gy0);
          const path = us.map((u, i) => `${i ? 'L' : 'M'} ${GX(-180 + i * 2)} ${GY(u)}`).join(' ');
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Metal id={ids.hoop} light={c.metal} dark={c.metalDark} />
                <Ball id={ids.bead} color={c.he3lBead} />
              </Defs>
              {/* The spin axis and the spin arrow over the hoop. */}
              <Line
                x1={hx}
                y1={hy - r - 26}
                x2={hx}
                y2={hy + r + 16}
                stroke={c.chartMuted}
                strokeDasharray={chart.dashFine}
              />
              <Ellipse
                cx={hx}
                cy={hy - r - 16}
                rx={18}
                ry={5}
                stroke={c.chartInk}
                strokeWidth={1.5}
                fill="none"
              />
              <Chevron x={hx + 4} y={hy - r - 11} dx={1} dy={0} color={c.chartInk} />
              <Tag
                x={hx + 22}
                y={hy - r - 18}
                text={label(spec.spin, 'ω', om, 'rad/s') ?? 'ω'}
                anchor="start"
                w={gx0 - 4}
              />
              <Circle cx={hx} cy={hy} r={r} stroke={url(ids.hoop)} strokeWidth={6} fill="none" />
              <Circle cx={hx} cy={hy} r={r} stroke={c.metalDark} strokeWidth={0.8} fill="none" />
              {hp ? (
                <G>
                  <Line
                    x1={hx}
                    y1={hy}
                    x2={bead.x}
                    y2={bead.y}
                    stroke={c.chartInk}
                    strokeDasharray={chart.dashFine}
                  />
                  {th0 > 0.5 ? (
                    <Path
                      d={`M ${hx} ${hy + r * 0.42} A ${r * 0.42} ${r * 0.42} 0 0 0 ${hx + r * 0.42 * Math.sin(th0 * DEG)} ${hy + r * 0.42 * Math.cos(th0 * DEG)}`}
                      stroke={c.chartInk}
                      fill="none"
                    />
                  ) : null}
                  <Circle
                    cx={bead.x}
                    cy={bead.y}
                    r={8}
                    fill={url(ids.bead)}
                    stroke={c.metalDark}
                    strokeWidth={0.8}
                  />
                </G>
              ) : null}
              <Tag
                x={hx - 6}
                y={hy - 6}
                text={label(spec.radius, 'R', R, 'm') ?? 'R'}
                anchor="end"
                chip
                w={gx0 - 4}
              />
              {/* U_eff against θ. */}
              <Line x1={gx0} y1={GY(0)} x2={gx1} y2={GY(0)} stroke={c.chartMuted} />
              <Line x1={GX(0)} y1={gy0} x2={GX(0)} y2={gy1} stroke={c.chartGrid} />
              {[-180, 0, 180].map((t) => (
                <ChartText
                  key={t}
                  x={GX(t)}
                  y={h - 20}
                  fontSize={chart.label}
                  textAnchor="middle"
                  fill={c.chartMuted}
                >
                  {`${t < 0 ? '−' : ''}${Math.abs(t)}°`}
                </ChartText>
              ))}
              <Tag x={gx1} y={h - 4} text="θ" anchor="end" chip={false} />
              <Tag x={gx0} y={16} text="U_eff ÷ mgR" anchor="start" chip={false} />
              {path ? <Path d={path} stroke={c.he3lCurve} strokeWidth={2.5} fill="none" /> : null}
              {ratio !== undefined
                ? (th0 > 0 ? [-th0, th0] : [0]).map((t) => (
                    <Circle
                      key={t}
                      cx={GX(t)}
                      cy={GY(hoopU(ratio, t))}
                      r={6}
                      stroke={c.chartInk}
                      strokeWidth={1.5}
                      fill="none"
                    />
                  ))
                : null}
              {ratio !== undefined ? (
                <G>
                  {/* A guide from the minimum up to its label, clear of the curve. */}
                  <Line
                    x1={GX(th0)}
                    y1={GY(hoopU(ratio, th0)) - 7}
                    x2={GX(th0)}
                    y2={gy0 + 14}
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dashFine}
                  />
                  <Tag
                    x={GX(th0)}
                    y={gy0 + 10}
                    text={label(spec.angle, 'θ₀', th0, '°') ?? ''}
                    w={w}
                  />
                </G>
              ) : null}
              {wc !== undefined ? (
                <Tag
                  x={6}
                  y={h - 8}
                  text={label(spec.critical, 'ω_c', wc, 'rad/s') ?? ''}
                  anchor="start"
                  w={gx0 - 4}
                />
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
