import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { RayDiagramSpec } from '@/data/modules/typesHsk';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle, useRep } from './common';
import { fringeOf, snellOf } from './hskMath';
import { RAD, sig, SubLabel, Vec, worked } from './hskKit';
import { Glass, Metal, url, usePaintIds } from './paint';

type Refraction = Extract<RayDiagramSpec, { mode: 'refraction' }>;
type Slits = Extract<RayDiagramSpec, { mode: 'doubleSlit' }>;
type Telescope = Extract<RayDiagramSpec, { mode: 'telescope' }>;

const numOf = (rep: ReturnType<typeof useRep>, x: number | string | undefined, d = 0) =>
  x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
const knownOf = (rep: ReturnType<typeof useRep>, x: number | string | undefined) =>
  typeof x !== 'string' || rep.known(x);

/**
 * Refraction (H66): a ray crossing from one medium to another, bent toward the normal into a
 * slower medium and away from it into a faster one (Snell's law), with its faint reflection;
 * past the critical angle it is all reflected. Drag the incoming ray.
 */
export function RayRefraction({ spec, calc }: { spec: Refraction; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const drag = useRef({ x: 0, y: 0 });
  const n1 = Math.max(1, numOf(rep, spec.n1, 1));
  const n2 = Math.max(1, numOf(rep, spec.n2, 1.33));
  const th1 = Math.min(89.9, Math.max(0, numOf(rep, spec.angle, 30)));
  const sn = snellOf(n1, n2, th1);
  const all = [spec.n1, spec.n2, spec.angle].every((x) => knownOf(rep, x));
  const [top, bottom] = spec.media ?? ['air', 'water'];
  // A "?" box reads "?" on the picture too, not the example's number drawn faded behind it.
  const [n1Ok, n2Ok, thOk] = [spec.n1, spec.n2, spec.angle].map((x) => knownOf(rep, x));
  const say = (ok: boolean | undefined, x: number) => (ok ? sig(x) : '?');
  const lines: string[] = [
    all
      ? `Snell’s law: ${sig(n1)} × sin ${sig(th1)}° = ${sig(n2)} × sin θ₂`
      : 'Snell’s law: n₁ sin θ₁ = n₂ sin θ₂',
  ];
  if (sn.refracted !== undefined && all)
    lines.push(
      `θ₂ = ${sig(sn.refracted)}°: ${n2 > n1 ? 'bent toward the normal (into a slower medium)' : n2 < n1 ? 'bent away from the normal (into a faster medium)' : 'not bent'}.`,
    );
  if (sn.critical !== undefined)
    lines.push(
      n1Ok && n2Ok
        ? `Critical angle: sin θc = n₂/n₁ = ${sig(n2)}/${sig(n1)}, θc = ${sig(sn.critical)}°.`
        : 'Critical angle: sin θc = n₂/n₁.',
    );
  if (sn.total && all)
    lines.push('Past the critical angle: total internal reflection, no light gets out.');

  return (
    <View>
      <Canvas aspect={0.8}>
        {({ w, h }) => {
          const O = { x: w / 2, y: h / 2 };
          const R = Math.min(w, h) * 0.42;
          const a1 = th1 * RAD;
          const S = { x: O.x - R * Math.sin(a1), y: O.y - R * Math.cos(a1) };
          const refl = { x: O.x + R * Math.sin(a1), y: O.y - R * Math.cos(a1) };
          const a2 = (sn.refracted ?? 0) * RAD;
          const T = { x: O.x + R * Math.sin(a2), y: O.y + R * Math.cos(a2) };
          const denser = (n: number) => Math.min(0.5, (n - 1) * 0.6);
          return (
            <>
              <Svg width={w} height={h}>
                <Rect x={0} y={0} width={w} height={h / 2} fill={c.water} opacity={denser(n1)} />
                <Rect
                  x={0}
                  y={h / 2}
                  width={w}
                  height={h / 2}
                  fill={c.water}
                  opacity={denser(n2)}
                />
                <Line x1={0} y1={O.y} x2={w} y2={O.y} stroke={c.chartInk} strokeWidth={1.5} />
                <Line
                  x1={O.x}
                  y1={8}
                  x2={O.x}
                  y2={h - 8}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dash}
                />
                <SubLabel
                  x={8}
                  y={20}
                  text={`${top}, n₁ = ${say(n1Ok, n1)}`}
                  anchor="start"
                  w={w}
                />
                <SubLabel
                  x={8}
                  y={h - 10}
                  text={`${bottom}, n₂ = ${say(n2Ok, n2)}`}
                  anchor="start"
                  w={w}
                />
                <SubLabel
                  x={O.x + 6}
                  y={20}
                  text="normal"
                  anchor="start"
                  size={chart.label}
                  bold={false}
                  chip={false}
                  w={w}
                />
                <G opacity={all ? 1 : 0.4}>
                  <Line x1={S.x} y1={S.y} x2={O.x} y2={O.y} stroke={c.physRay} strokeWidth={3} />
                  <Vec
                    x1={S.x}
                    y1={S.y}
                    x2={(S.x + O.x) / 2}
                    y2={(S.y + O.y) / 2}
                    color={c.physRay}
                    width={3}
                  />
                  <Vec
                    x1={O.x}
                    y1={O.y}
                    x2={refl.x}
                    y2={refl.y}
                    color={c.physRay}
                    width={sn.total ? 3 : 1.5}
                    dash={sn.total ? undefined : chart.dashFine}
                    opacity={sn.total ? 1 : 0.6}
                  />
                  {sn.refracted !== undefined ? (
                    <Vec x1={O.x} y1={O.y} x2={T.x} y2={T.y} color={c.physRay} width={3} />
                  ) : null}
                  {th1 > 0.5 ? (
                    <G>
                      <Path
                        d={`M ${O.x} ${O.y - 40} A 40 40 0 0 0 ${O.x - 40 * Math.sin(a1)} ${O.y - 40 * Math.cos(a1)}`}
                        stroke={c.chartInk}
                        fill="none"
                      />
                      <SubLabel
                        x={O.x - 50 * Math.sin(a1 / 2) - 4}
                        y={O.y - 50 * Math.cos(a1 / 2)}
                        text={`θ₁ ${say(thOk, th1)}°`}
                        anchor="end"
                        size={chart.label}
                        w={w}
                      />
                    </G>
                  ) : null}
                  {sn.refracted !== undefined && sn.refracted > 0.5 ? (
                    <G>
                      <Path
                        d={`M ${O.x} ${O.y + 40} A 40 40 0 0 0 ${O.x + 40 * Math.sin(a2)} ${O.y + 40 * Math.cos(a2)}`}
                        stroke={c.chartInk}
                        fill="none"
                      />
                      <SubLabel
                        x={O.x + 50 * Math.sin(a2 / 2) + 4}
                        y={O.y + 50 * Math.cos(a2 / 2) + 10}
                        text={`θ₂ ${say(all, sn.refracted)}°`}
                        anchor="start"
                        size={chart.label}
                        w={w}
                      />
                    </G>
                  ) : null}
                  {sn.critical !== undefined ? (
                    <Line
                      x1={O.x}
                      y1={O.y}
                      x2={O.x - R * 0.7 * Math.sin(sn.critical * RAD)}
                      y2={O.y - R * 0.7 * Math.cos(sn.critical * RAD)}
                      stroke={c.normalReject}
                      strokeDasharray={chart.dashFine}
                    />
                  ) : null}
                </G>
              </Svg>
              {!spec.fixed && typeof spec.angle === 'string' && rep.known(spec.angle) ? (
                <DragHandle
                  testID="drag-angle"
                  x={S.x}
                  y={S.y}
                  label={rep.variable(spec.angle).name}
                  onStart={() => {
                    drag.current = { x: S.x - O.x, y: S.y - O.y };
                  }}
                  onMove={(dx, dy) => {
                    const id = spec.angle as string;
                    const px = drag.current.x + dx;
                    const py = Math.min(-1, drag.current.y + dy);
                    const deg = Math.atan2(-px, -py) / RAD;
                    calc.set(
                      {
                        ...rep.pin(
                          [spec.n1, spec.n2].filter((x): x is string => typeof x === 'string'),
                        ),
                        [id]: rep.snapTo(id, Math.max(0, Math.min(89, deg))),
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
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

/** The color of light of a wavelength in nm (grey outside 380–750 nm). */
function lightColor(c: Palette, nm: number) {
  if (nm < 380 || nm > 750) return c.chartMuted;
  if (nm < 450) return c.spectrumViolet;
  if (nm < 495) return c.spectrumBlue;
  if (nm < 570) return c.spectrumGreen;
  if (nm < 590) return c.spectrumYellow;
  if (nm < 620) return c.spectrumOrange;
  return c.spectrumRed;
}

/**
 * Double-slit interference (H66): light through two slits onto a screen, bright fringes
 * Δy = λL/d apart (the fringes' brightness cos² across them), the paths from each slit to the
 * first bright fringe. Across is not to scale: the slits are far closer than drawn.
 */
export function RaySlits({ spec, calc }: { spec: Slits; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const nm = numOf(rep, spec.wavelength, 550);
  const d = Math.max(1e-9, numOf(rep, spec.spacing, 0.25));
  const L = Math.max(0, numOf(rep, spec.screen, 1));
  const dy = fringeOf(nm, d, L);
  const all = [spec.wavelength, spec.spacing, spec.screen].every((x) => knownOf(rep, x));
  const col = lightColor(c, nm);
  return (
    <View>
      <Canvas aspect={0.78}>
        {({ w, h }) => {
          const mid = h / 2;
          const bx = w * 0.26;
          const sx = w * 0.68;
          const gap = 26;
          const step = Math.min(34, (h / 2 - 22) / 3);
          const strip = { x: sx + 10, w: w - sx - 60 };
          const rows = Array.from({ length: Math.floor(h / 2) }, (_, i) => i * 2);
          return (
            <Svg width={w} height={h}>
              <G opacity={all ? 1 : 0.4}>
                <Rect x={4} y={mid - 22} width={bx - 4} height={44} fill={col} opacity={0.35} />
                <Rect x={bx - 4} y={10} width={8} height={h - 20} fill={c.metalDark} />
                <Rect x={bx - 4} y={mid - gap / 2 - 3} width={8} height={6} fill={c.card} />
                <Rect x={bx - 4} y={mid + gap / 2 - 3} width={8} height={6} fill={c.card} />
                <Rect
                  x={sx - 3}
                  y={10}
                  width={6}
                  height={h - 20}
                  fill={c.paper}
                  stroke={c.chartGrid}
                />
                {/* Brightness across the screen, cos² of the phase difference. */}
                {rows.map((y) => {
                  const k = Math.cos((Math.PI * (y - mid)) / step) ** 2;
                  return (
                    <Rect
                      key={y}
                      x={strip.x}
                      y={y}
                      width={strip.w}
                      height={2}
                      fill={col}
                      opacity={k}
                    />
                  );
                })}
                {[-2, -1, 0, 1, 2].map((m) => (
                  <G key={m}>
                    <Line
                      x1={sx}
                      y1={mid - m * step}
                      x2={strip.x + strip.w + 4}
                      y2={mid - m * step}
                      stroke={c.chartInk}
                      strokeWidth={1}
                    />
                    <SubLabel
                      x={strip.x + strip.w + 8}
                      y={mid - m * step + 4}
                      text={`m = ${m < 0 ? `−${-m}` : m}`}
                      anchor="start"
                      size={chart.label}
                      chip={false}
                      w={w}
                    />
                  </G>
                ))}
                {[mid - gap / 2, mid + gap / 2].map((y) => (
                  <Line
                    key={y}
                    x1={bx}
                    y1={y}
                    x2={sx}
                    y2={mid - step}
                    stroke={col}
                    strokeWidth={1.5}
                    strokeDasharray={chart.dashFine}
                  />
                ))}
                <Line
                  x1={sx - 14}
                  y1={mid}
                  x2={sx - 14}
                  y2={mid - step}
                  stroke={c.chartInk}
                  strokeWidth={1.5}
                />
                <SubLabel
                  x={sx - 18}
                  y={mid - step / 2 + 4}
                  text={`Δy ${all ? sig(dy) : '?'} mm`}
                  anchor="end"
                  w={w}
                />
              </G>
              <SubLabel
                x={bx}
                y={h - 2}
                text={`d ${knownOf(rep, spec.spacing) ? sig(d) : '?'} mm`}
                size={chart.label}
                w={w}
              />
              <SubLabel
                x={(bx + sx) / 2}
                y={16}
                text={`L ${knownOf(rep, spec.screen) ? sig(L) : '?'} m (not to scale)`}
                size={chart.label}
                w={w}
              />
              <SubLabel
                x={10}
                y={mid - 30}
                text={`λ ${knownOf(rep, spec.wavelength) ? sig(nm) : '?'} nm`}
                anchor="start"
                size={chart.label}
                w={w}
              />
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          ...worked(
            all,
            `Δy = λL/d = ${sig(nm)} × 10⁻⁹ m × ${sig(L)} m/(${sig(d)} × 10⁻³ m) = ${sig(dy)} mm`,
          ),
          'Bright where the paths from the two slits differ by a whole number of wavelengths (mλ), dark halfway between.',
          knownOf(rep, spec.wavelength) && (nm < 380 || nm > 750)
            ? 'This wavelength is not visible light.'
            : '',
        ]
          .filter(Boolean)
          .join(' · ')}
      </Caption>
    </View>
  );
}

/**
 * A telescope (H66): refracting (an objective lens and an eyepiece, f_o + f_e apart) or
 * reflecting (a concave mirror and a flat diagonal), parallel rays from a distant star brought
 * to a focus and, through the eyepiece, out at a larger angle: M = f_o/f_e.
 */
export function RayTelescope({ spec, calc }: { spec: Telescope; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('glass', 'metal');
  const fo = Math.max(1e-9, numOf(rep, spec.objective, 900));
  const fe = Math.max(1e-9, numOf(rep, spec.eyepiece, 25));
  const M = fo / fe;
  const all = [spec.objective, spec.eyepiece].every((x) => knownOf(rep, x));
  const unit =
    typeof spec.objective === 'string' ? (rep.variable(spec.objective).unit ?? 'mm') : 'mm';
  const refracting = spec.design === 'refracting';
  return (
    <View>
      <Canvas aspect={refracting ? 0.52 : 0.62}>
        {({ w, h }) => {
          const mid = refracting ? h / 2 : h * 0.62;
          const x0 = 20;
          const x1 = w - 20;
          if (refracting) {
            const k = (x1 - x0 - 100) / (fo + fe);
            const xo = x0 + 30;
            const xf = xo + fo * k;
            const xe = xf + fe * k;
            // A small incoming angle, so the magnified way out stays in view.
            const alpha = Math.min(4, 32 / M) * RAD;
            const yf = mid + fo * k * Math.tan(alpha);
            const exit = { x: xe - xf, y: mid - yf };
            const rays = [-28, 0, 28].map((dyo, i) => {
              const A = { x: x0 - 10, y: mid + dyo - 40 * Math.tan(alpha) };
              const B = { x: xo, y: mid + dyo };
              // Past the focus, on to the eyepiece's plane.
              const t = (xe - B.x) / (xf - B.x);
              const E = { x: xe, y: B.y + (yf - B.y) * t };
              const len = Math.hypot(exit.x, exit.y) || 1;
              const F = { x: E.x + (exit.x / len) * 60, y: E.y + (exit.y / len) * 60 };
              return (
                <G key={i}>
                  <Line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={c.physRay} strokeWidth={2} />
                  <Line x1={B.x} y1={B.y} x2={E.x} y2={E.y} stroke={c.physRay} strokeWidth={2} />
                  <Vec
                    x1={E.x}
                    y1={E.y}
                    x2={Math.min(F.x, x1 + 14)}
                    y2={F.y}
                    color={c.physRay}
                    width={2}
                    head={7}
                  />
                </G>
              );
            });
            return (
              <Svg width={w} height={h}>
                <Defs>
                  <Glass id={ids.glass} />
                </Defs>
                <Rect
                  x={xo - 6}
                  y={mid - 44}
                  width={xe - xo + 12}
                  height={88}
                  rx={4}
                  fill={c.chartSurface}
                  opacity={0.6}
                />
                <Line
                  x1={x0}
                  y1={mid}
                  x2={x1}
                  y2={mid}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dashFine}
                />
                <G opacity={all ? 1 : 0.4}>
                  {rays}
                  <Path
                    d={`M ${xo} ${mid - 48} Q ${xo + 12} ${mid} ${xo} ${mid + 48} Q ${xo - 12} ${mid} ${xo} ${mid - 48} Z`}
                    fill={url(ids.glass)}
                    stroke={c.glassEdge}
                    strokeWidth={1.5}
                  />
                  <Path
                    d={`M ${xe} ${mid - 24} Q ${xe + 8} ${mid} ${xe} ${mid + 24} Q ${xe - 8} ${mid} ${xe} ${mid - 24} Z`}
                    fill={url(ids.glass)}
                    stroke={c.glassEdge}
                    strokeWidth={1.5}
                  />
                  <Circle cx={xf} cy={yf} r={3.5} fill={c.chartInk} />
                </G>
                <SubLabel
                  x={xo}
                  y={mid + 66}
                  text={`objective f_o ${knownOf(rep, spec.objective) ? sig(fo) : '?'} ${unit}`}
                  anchor="start"
                  size={chart.label}
                  w={w}
                />
                <SubLabel
                  x={xe}
                  y={mid - 54}
                  text={`eyepiece f_e ${knownOf(rep, spec.eyepiece) ? sig(fe) : '?'} ${unit}`}
                  anchor="end"
                  size={chart.label}
                  w={w}
                />
                <SubLabel
                  x={xf}
                  y={mid + 30}
                  text="focus"
                  size={chart.label}
                  bold={false}
                  chip={false}
                  w={w}
                />
              </Svg>
            );
          }
          // Reflecting (Newtonian): a concave primary at the right end, a flat at 45°.
          const xp = x1 - 10;
          const k = Math.min((x1 - x0 - 50) / fo, 1e9);
          const xfocus = xp - fo * k;
          const xd = xfocus + 40;
          const tubeTop = mid - 40;
          const rays = [-26, 0, 26].map((dy, i) => {
            const B = { x: xp - (dy * dy) / (4 * fo * k), y: mid + dy };
            // Toward the focus until the flat (the line x − xd = y − mid), then on to the
            // focus reflected in it: straight above the flat, as far up as the focus was on.
            const [u0, v0] = [B.x - xd, B.y - mid];
            const a = xd - xfocus;
            const t = (v0 - u0) / (-a - u0 + v0);
            const D = { x: B.x + t * (xfocus - B.x), y: B.y + t * (mid - B.y) };
            const up = { x: xd, y: mid - a };
            return (
              <G key={i}>
                <Line x1={x0} y1={B.y} x2={B.x} y2={B.y} stroke={c.physRay} strokeWidth={2} />
                <Line x1={B.x} y1={B.y} x2={D.x} y2={D.y} stroke={c.physRay} strokeWidth={2} />
                <Line x1={D.x} y1={D.y} x2={up.x} y2={up.y} stroke={c.physRay} strokeWidth={2} />
              </G>
            );
          });
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Metal id={ids.metal} light={c.metal} dark={c.metalDark} />
              </Defs>
              <Rect
                x={x0}
                y={tubeTop}
                width={xp - x0 + 6}
                height={80}
                rx={3}
                fill={c.chartSurface}
                stroke={c.chartGrid}
              />
              <G opacity={all ? 1 : 0.4}>
                {rays}
                <Path
                  d={`M ${xp + 4} ${mid - 36} Q ${xp - 8} ${mid} ${xp + 4} ${mid + 36}`}
                  stroke={url(ids.metal)}
                  strokeWidth={6}
                  fill="none"
                />
                <Line
                  x1={xd - 14}
                  y1={mid - 14}
                  x2={xd + 14}
                  y2={mid + 14}
                  stroke={c.metalDark}
                  strokeWidth={4}
                />
                <Rect x={xd - 10} y={tubeTop - 30} width={20} height={30} rx={3} fill={c.rubber} />
                <Circle cx={xd} cy={mid - (xd - xfocus)} r={3.5} fill={c.chartInk} />
              </G>
              <SubLabel
                x={xp}
                y={mid + 58}
                text={`mirror f_o ${knownOf(rep, spec.objective) ? sig(fo) : '?'} ${unit}`}
                anchor="end"
                size={chart.label}
                w={w}
              />
              <SubLabel
                x={xd + 16}
                y={tubeTop - 12}
                text={`eyepiece f_e ${knownOf(rep, spec.eyepiece) ? sig(fe) : '?'} ${unit}`}
                anchor="start"
                size={chart.label}
                w={w}
              />
              <SubLabel
                x={x0 + 4}
                y={mid + 58}
                text="starlight"
                anchor="start"
                size={chart.label}
                bold={false}
                w={w}
              />
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          ...worked(all, `M = fₒ/fₑ = ${sig(fo)}/${sig(fe)} = ${sig(M)}`),
          refracting
            ? `The lenses are fₒ + fₑ = ${all ? sig(fo + fe) : '?'} ${unit} apart; the objective’s focus is the eyepiece’s.`
            : 'The curved mirror gathers the light; a flat mirror at 45° turns it up to the eyepiece.',
          'A bigger objective gathers more light; its focal length over the eyepiece’s sets the magnification.',
        ].join(' · ')}
      </Caption>
    </View>
  );
}
