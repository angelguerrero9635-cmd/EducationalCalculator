/**
 * HC105 `photoelectric` `mode: 'compton'` (typesHe4c.ts): a photon hits a free electron and
 * leaves at θ with a longer wave; the electron recoils at φ. Every arrow is on one momentum
 * scale (p ∝ 1 ÷ λ), the incoming p continued dashed past the electron and pₑ copied dashed from
 * the tip of p′ to close p = p′ + pₑ. Under it λ and λ′ as wave strips to one scale. Photons are
 * flat diagram waves; the electron is a lit ball. Drag the scattered photon round for θ.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path } from 'react-native-svg';

import type { PhotoelectricComptonSpec } from '@/data/modules/typesHe4c';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle } from './common';
import { Arrow } from './he1fKit';
import { fmt, Tag } from './he2fKit';
import { fmtP, useHe4c } from './he4cKit';
import { COMPTON_PM, comptonOf, HC_KEV_PM } from './he4cMath';
import { Ball, url, usePaintIds } from './paint';

const DEG = Math.PI / 180;
const WAVES = 6;

/** A wavy arrow from (x1, y1) to (x2, y2): a sine of `wave` px, amplitude `amp`, and a head. */
function WaveArrow({
  x1,
  y1,
  x2,
  y2,
  wave,
  color,
  amp = 5,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  wave: number;
  color: string;
  amp?: number;
}) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 12) return null;
  const [ux, uy] = [(x2 - x1) / len, (y2 - y1) / len];
  const body = len - 10;
  let d = '';
  const n = Math.max(24, Math.ceil(body / 2));
  for (let i = 0; i <= n; i++) {
    const s = (body * i) / n;
    // Taper the ends so the wave starts and ends on the line.
    const k = Math.min(1, s / 8, (body - s) / 8);
    const off = amp * k * Math.sin((2 * Math.PI * s) / wave);
    d += `${i ? 'L' : 'M'} ${(x1 + ux * s - uy * off).toFixed(1)} ${(y1 + uy * s + ux * off).toFixed(1)} `;
  }
  return (
    <G>
      <Path d={d} stroke={color} strokeWidth={2} fill="none" />
      <Arrow
        x1={x1 + ux * (body - 2)}
        y1={y1 + uy * (body - 2)}
        x2={x2}
        y2={y2}
        color={color}
        width={2}
      />
    </G>
  );
}

export function Compton({ spec, calc }: { spec: PhotoelectricComptonSpec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('electron');
  const { rep, num, label, setOne } = useHe4c(calc);
  const [lam, th] = [num(spec.wavelength), num(spec.angle)];
  const C = spec.compton ?? COMPTON_PM;
  const hc = spec.hc ?? HC_KEV_PM;
  const ok = lam !== undefined && th !== undefined && lam > 0 && th >= 0 && th <= 180;
  const k = ok ? comptonOf(lam, th, C, hc) : undefined;
  const start = useRef({ x: 0, y: 0 });
  const canDrag = !spec.fixed && typeof spec.angle === 'string' && !!k;

  const lines: string[] = [];
  if (k && ok) {
    lines.push(
      `Δλ = (h ÷ mₑc)(1 − cos θ) = ${fmt(C)} × (1 − cos ${fmt(th)}°) = ${fmt(k.shift)} pm`,
      `λ′ = λ + Δλ = ${fmt(lam)} + ${fmtP(k.shift)} = ${fmt(k.lamP)} pm`,
      `E = hc ÷ λ = ${fmt(hc)} ÷ ${fmt(lam)} = ${fmt(k.E)} keV`,
      `E′ = hc ÷ λ′ = ${fmt(hc)} ÷ ${fmt(k.lamP)} = ${fmt(k.Ep)} keV`,
      `K = E − E′ = ${fmt(k.E)} − ${fmt(k.Ep)} = ${fmt(k.K)} keV`,
    );
    lines.push(
      `The electron takes K at φ = ${fmt(k.phi)}° below the axis; the dashed pₑ closes p = p′ + pₑ.`,
      `Six waves of each, to one scale: the bar is 6Δλ = ${fmt(WAVES * k.shift)} pm.`,
    );
  } else {
    lines.push('Δλ = (h ÷ mₑc)(1 − cos θ), λ′ = λ + Δλ, E = hc ÷ λ, K = E − E′.');
    lines.push('Type the wavelength and the angle to draw the scattering.');
  }

  return (
    <View>
      <Canvas aspect={(w) => (w < 1 ? 1 : heightOf(w) / w)}>
        {({ w }) => {
          const H = heightOf(w);
          const P = scaleOf(w);
          const cosT = ok ? Math.cos(th! * DEG) : 0;
          const sinT = ok ? Math.sin(th! * DEG) : 1;
          const Pp = k ? (P * k.pp) / k.p : 0;
          const back = Math.max(0, -cosT) * Pp;
          // The collision point: room for the incoming p on the left, pₑ on the right.
          const cx = 14 + Math.max(P, back) + (w - 28 - (Math.max(P, back) + P + back)) / 2;
          const cy = 28 + P;
          const pe = k ? { x: (P * k.pe.x) / k.p, y: (-P * k.pe.y) / k.p } : undefined;
          // Near 180° the scattered photon runs back along the incoming one: drawn 14 px under it.
          const drop = cosT < 0 && Math.abs(sinT) < 0.25 ? 14 : 0;
          const tipP = { x: cx + Pp * cosT, y: cy - Pp * sinT + drop };
          // Waves in the scene: λ draws as 14 px, λ′ in proportion.
          const waveIn = 14;
          const waveOut = k ? (14 * k.lamP) / lam! : 14;
          const sceneBottom = 28 + 2 * P + 16;
          // The strips: six waves of λ′ fill the width, λ on the same scale.
          const Ws = w - 28;
          const kpx = k ? (0.94 * Ws) / (WAVES * k.lamP) : 1;
          const strip = (y: number, L: number, color: string) => {
            let d = '';
            const n = 180;
            for (let i = 0; i <= n; i++) {
              const x = (Ws * i) / n;
              d += `${i ? 'L' : 'M'} ${(14 + x).toFixed(1)} ${(y - 7 * Math.sin((2 * Math.PI * x) / (kpx * L))).toFixed(1)} `;
            }
            return <Path d={d} stroke={color} strokeWidth={2} fill="none" />;
          };
          const s1 = sceneBottom + 14;
          const thetaLabel = label(spec.angle, 'θ', th, '°');
          const arc = 30;
          // θ's label beyond p′, or over the arc's top when p′ runs back.
          const thetaAt = ok ? (th! > 160 ? th! / 2 : th! + 30) : 0;
          return (
            <>
              <Svg width={w} height={H}>
                <Defs>
                  <Ball id={ids.electron} color={c.physMinus} />
                </Defs>
                {k && pe ? (
                  <G>
                    {/* The axis, the incoming photon and its momentum carried on (dashed). */}
                    <WaveArrow
                      x1={cx - P}
                      y1={cy}
                      x2={cx - 9}
                      y2={cy}
                      wave={waveIn}
                      color={c.he4cPhoton}
                    />
                    <Line
                      x1={cx}
                      y1={cy}
                      x2={cx + P}
                      y2={cy}
                      stroke={c.he4cPhoton}
                      strokeWidth={1.5}
                      strokeDasharray={chart.dash}
                    />
                    <Path
                      d={`M ${cx + P} ${cy} l -8 -4 l 0 8 Z`}
                      fill={c.he4cPhoton}
                      opacity={0.8}
                    />
                    {/* The scattered photon at θ, its wave longer. */}
                    <WaveArrow
                      x1={cx}
                      y1={cy + drop}
                      x2={tipP.x}
                      y2={tipP.y}
                      wave={waveOut}
                      color={c.he4cScattered}
                    />
                    {/* The electron's recoil, and pₑ copied to close the triangle. */}
                    <Arrow
                      x1={cx}
                      y1={cy}
                      x2={cx + pe.x}
                      y2={cy + pe.y}
                      color={c.physMinus}
                      width={2.5}
                    />
                    <Arrow
                      x1={tipP.x}
                      y1={tipP.y}
                      x2={cx + P}
                      y2={cy + drop}
                      color={c.physMinus}
                      width={1.5}
                      dashed
                    />
                    {/* θ from the forward axis to p′. */}
                    {th! > 2 ? (
                      <Path
                        d={`M ${cx + arc} ${cy} A ${arc} ${arc} 0 0 0 ${cx + arc * cosT} ${cy - arc * sinT}`}
                        stroke={c.chartInk}
                        fill="none"
                      />
                    ) : null}
                    <Circle cx={cx} cy={cy} r={8} fill={url(ids.electron)} stroke={c.chartInk} />
                    {/* Labels: λ on the incoming wave, λ′ at p′'s tip, θ by its arc. */}
                    <Tag
                      x={cx - P / 2}
                      y={cy - 14}
                      text={label(spec.wavelength, 'λ', lam, 'pm')!}
                      color={c.he4cPhoton}
                      w={w}
                    />
                    {thetaLabel ? (
                      <Tag
                        x={cx + (arc + 16) * Math.cos(thetaAt * DEG)}
                        y={cy - (arc + 16) * Math.sin(thetaAt * DEG) + 4}
                        text={thetaLabel}
                        anchor={th! > 160 ? 'middle' : thetaAt > 90 ? 'end' : 'start'}
                        w={w}
                      />
                    ) : null}
                    <Tag
                      x={tipP.x + (cosT >= 0 ? 6 : -6)}
                      y={drop ? tipP.y + 22 : tipP.y - 8}
                      text={label(spec.scattered, 'λ′', k.lamP, 'pm')!}
                      anchor={cosT >= 0 ? 'start' : 'end'}
                      color={c.he4cScattered}
                      w={w}
                    />
                    <Tag
                      x={cx + pe.x / 2 - 8}
                      y={cy + pe.y / 2 + 18 + drop * 1.5}
                      text={label(spec.kinetic, 'K', k.K, 'keV')!}
                      anchor="end"
                      color={c.physMinus}
                      w={w}
                    />
                  </G>
                ) : null}
                {/* λ and λ′ to one scale: six waves each, the gap 6Δλ bracketed. */}
                {k ? (
                  <G>
                    <Tag
                      x={14}
                      y={s1 - 2}
                      text={`${label(spec.wavelength, 'λ', lam, 'pm')}, ${label(spec.energy, 'E', k.E, 'keV')}`}
                      anchor="start"
                      color={c.he4cPhoton}
                      chip={false}
                    />
                    {strip(s1 + 16, lam!, c.he4cPhoton)}
                    {strip(s1 + 40, k.lamP, c.he4cScattered)}
                    {[lam!, k.lamP].map((L, i) => (
                      <Line
                        key={i}
                        x1={14 + WAVES * kpx * L}
                        y1={i ? s1 + 30 : s1 + 6}
                        x2={14 + WAVES * kpx * L}
                        y2={s1 + 58}
                        stroke={i ? c.he4cScattered : c.he4cPhoton}
                        strokeDasharray={chart.dashFine}
                      />
                    ))}
                    <Line
                      x1={14 + WAVES * kpx * lam!}
                      y1={s1 + 56}
                      x2={14 + WAVES * kpx * k.lamP}
                      y2={s1 + 56}
                      stroke={c.chartInk}
                      strokeWidth={3}
                    />
                    <Tag
                      x={14}
                      y={s1 + 76}
                      text={`${label(spec.scattered, 'λ′', k.lamP, 'pm')}, ${label(spec.scatteredEnergy, 'E′', k.Ep, 'keV')}`}
                      anchor="start"
                      color={c.he4cScattered}
                      chip={false}
                    />
                  </G>
                ) : null}
              </Svg>
              {canDrag && k ? (
                <DragHandle
                  testID="drag-compton-angle"
                  x={tipP.x}
                  y={tipP.y}
                  label={rep.variable(spec.angle as string).name}
                  onStart={() => {
                    start.current = { x: tipP.x - cx, y: cy - tipP.y };
                  }}
                  onMove={(dx, dy) => {
                    // The angle of the finger seen from the electron, 0° to 180° above the axis.
                    const fx = start.current.x + dx;
                    const fy = start.current.y - dy;
                    const a = Math.atan2(Math.max(0, fy), fx) / DEG;
                    setOne(spec.angle as string, Math.min(180, Math.max(0, a)), [spec.wavelength]);
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

/** The momentum scale: the incoming p's length in px, at most a third of the width. */
const scaleOf = (w: number) => Math.min(96, (w - 28) / 3.1);

/** The canvas height: the scene (p up and down from the axis) and the two strips. */
const heightOf = (w: number) => 28 + 2 * scaleOf(w) + 16 + 14 + 84;
