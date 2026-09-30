import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { PhotoelectricSpec } from '@/data/modules/typesHs2c';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useRep } from './common';
import { sig, SubLabel, Vec } from './hskKit';
import { Ball, Metal, url, usePaintIds } from './paint';

/** hc in eV·nm: a photon of λ nm carries 1240/λ eV. */
export const HC_EV_NM = 1240;

/** The wavelength strip: 100 nm to 1000 nm, on a log scale. */
const [LO, HI] = [100, 1000];

/** The color of light of λ nm (a spectrum token), or undefined outside the visible. */
function lightColor(c: Palette, nm: number): string | undefined {
  if (nm < 380 || nm > 750) return undefined;
  if (nm >= 625) return c.spectrumRed;
  if (nm >= 590) return c.spectrumOrange;
  if (nm >= 565) return c.spectrumYellow;
  if (nm >= 495) return c.spectrumGreen;
  if (nm >= 450) return c.spectrumBlue;
  return c.spectrumViolet;
}

/**
 * The photoelectric effect (H102): light of wavelength λ falls on a metal plate. Each photon
 * brings E = 1240/λ eV; φ of it frees an electron and the rest is its kinetic energy
 * K_max = E − φ, the electron's arrow as long as its speed (√K). Below the threshold, E < φ,
 * no electron leaves however bright the light. An energy bar splits E into φ and K_max, and a
 * wavelength strip (log scale) marks λ and the threshold λ₀ = 1240/φ. Drag λ along the strip.
 */
export function Photoelectric({ spec, calc }: { spec: PhotoelectricSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('plate', 'electron');
  const drag = useRef(0);
  const si = (x: number | string) => (typeof x === 'number' ? x : rep.val(x));
  const known = (x: number | string) => typeof x === 'number' || rep.known(x);
  const lam = Math.max(1e-6, si(spec.wavelength));
  const phi = Math.max(0, si(spec.workFunction));
  const E = HC_EV_NM / lam;
  const K = E - phi;
  const freed = K > 1e-9;
  const lam0 = phi > 0 ? HC_EV_NM / phi : Infinity;
  const all = known(spec.wavelength) && known(spec.workFunction);
  const color = lightColor(c, lam);
  const band = lam < 380 ? 'ultraviolet' : lam > 750 ? 'infrared' : undefined;

  return (
    <View>
      <Canvas aspect={0.96}>
        {({ w, h }) => {
          const plateY = h * 0.46;
          const [px0, px1] = [w * 0.34, w - 14];
          // Wavy rays from the top left onto the plate, the wiggle as long as the wavelength.
          const period = Math.min(22, Math.max(5, lam / 30));
          const ray = (x1: number) => {
            const [xa, ya, xb, yb] = [x1 - 110, 10, x1, plateY - 4];
            const L = Math.hypot(xb - xa, yb - ya);
            const [ux, uy] = [(xb - xa) / L, (yb - ya) / L];
            const n = Math.max(8, Math.round(L / 2));
            let d = '';
            for (let i = 0; i <= n; i++) {
              const s = (i / n) * L;
              const off = 4 * Math.sin((2 * Math.PI * s) / period);
              d += `${i ? 'L' : 'M'} ${(xa + ux * s - uy * off).toFixed(1)} ${(ya + uy * s + ux * off).toFixed(1)} `;
            }
            return { d, tip: { x: xb, y: yb }, dir: { x: ux, y: uy } };
          };
          const rays = [0.5, 0.66, 0.82].map((f) => ray(w * f));
          // Electrons fly up and right, the arrow as long as the speed (√K of √E).
          const speed = freed ? 18 + 56 * Math.sqrt(K / E) : 0;
          // The energy bar, in eV.
          const bar = { x: 16, y: plateY + 52, w: w - 32, h: 20 };
          const top = Math.max(E, phi) * 1.08 || 1;
          const bx = (v: number) => bar.x + (v / top) * bar.w;
          // The wavelength strip, log scale.
          const strip = { x: 16, y: h - 44, w: w - 32 };
          const sx = (nm: number) =>
            strip.x +
            ((Math.log10(Math.min(HI, Math.max(LO, nm))) - Math.log10(LO)) /
              (Math.log10(HI) - Math.log10(LO))) *
              strip.w;
          const visible: [number, number, string][] = [
            [380, 450, c.spectrumViolet],
            [450, 495, c.spectrumBlue],
            [495, 565, c.spectrumGreen],
            [565, 590, c.spectrumYellow],
            [590, 625, c.spectrumOrange],
            [625, 750, c.spectrumRed],
          ];
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Metal id={ids.plate} light={c.metal} dark={c.metalDark} />
                  <Ball id={ids.electron} color={c.physMinus} />
                </Defs>
                <G opacity={all ? 1 : 0.45}>
                  {rays.map((r, i) => (
                    <G key={i}>
                      <Path
                        d={r.d}
                        stroke={color ?? c.chartMuted}
                        strokeWidth={2}
                        strokeDasharray={color ? undefined : chart.dashFine}
                        fill="none"
                      />
                    </G>
                  ))}
                  <SubLabel
                    x={8}
                    y={20}
                    text={`λ = ${sig(lam)} nm${band ? ` (${band})` : ''}`}
                    anchor="start"
                    color={color ?? c.chartInk}
                    w={w}
                  />
                  <SubLabel x={8} y={38} text={`E = 1240/λ = ${sig(E)} eV`} anchor="start" w={w} />
                  {/* The plate. */}
                  <Rect
                    x={px0}
                    y={plateY}
                    width={px1 - px0}
                    height={14}
                    rx={2}
                    fill={url(ids.plate)}
                    stroke={c.metalDark}
                  />
                  <SubLabel
                    x={(px0 + px1) / 2}
                    y={plateY + 32}
                    text={`metal, φ = ${sig(phi)} eV`}
                    w={w}
                  />
                  {freed ? (
                    rays.map((r, i) => {
                      const ex = r.tip.x + 10;
                      const ey = r.tip.y - 10;
                      const a = (-60 + i * 22) * (Math.PI / 180);
                      return (
                        <G key={i}>
                          <Vec
                            x1={ex}
                            y1={ey}
                            x2={ex + speed * Math.cos(a)}
                            y2={ey + speed * Math.sin(a)}
                            color={c.physMinus}
                            width={2}
                            head={7}
                          />
                          <Circle cx={ex} cy={ey} r={5} fill={url(ids.electron)} />
                        </G>
                      );
                    })
                  ) : (
                    <SubLabel
                      x={(px0 + px1) / 2}
                      y={plateY - 16}
                      text="no electrons: E < φ"
                      color={c.forceWeight}
                      w={w}
                    />
                  )}
                  {freed ? (
                    <SubLabel
                      x={w - 8}
                      y={plateY - 72}
                      text={`K_max ${sig(K)} eV`}
                      anchor="end"
                      color={c.physMinus}
                      w={w}
                    />
                  ) : null}
                  {/* The photon's energy: φ, then what is left as K_max. */}
                  <Rect
                    x={bar.x}
                    y={bar.y}
                    width={bx(Math.min(E, phi)) - bar.x}
                    height={bar.h}
                    fill={c.chartMuted}
                    opacity={0.55}
                  />
                  {freed ? (
                    <Rect
                      x={bx(phi)}
                      y={bar.y}
                      width={bx(E) - bx(phi)}
                      height={bar.h}
                      fill={c.physMinus}
                      opacity={0.75}
                    />
                  ) : null}
                  <Line
                    x1={bx(phi)}
                    y1={bar.y - 6}
                    x2={bx(phi)}
                    y2={bar.y + bar.h + 6}
                    stroke={c.chartInk}
                    strokeWidth={1.5}
                    strokeDasharray={freed ? undefined : chart.dashFine}
                  />
                  <ChartText x={bar.x} y={bar.y - 8} fontSize={chart.label} fill={c.chartMuted}>
                    {`photon energy ${sig(E)} eV`}
                  </ChartText>
                  <ChartText
                    x={Math.min(bx(phi), bar.x + bar.w) - 4}
                    y={bar.y + bar.h + 16}
                    textAnchor="end"
                    fontSize={chart.label}
                  >
                    {`φ ${sig(phi)}`}
                  </ChartText>
                  {freed ? (
                    <ChartText
                      x={bx(phi) + 4}
                      y={bar.y + bar.h + 16}
                      fontSize={chart.label}
                      fill={c.physMinus}
                      fontWeight="700"
                    >
                      {`Kₘₐₓ ${sig(K)}`}
                    </ChartText>
                  ) : null}
                  {/* The wavelength strip: visible colors, λ₀ dashed, λ marked. */}
                  <Line
                    x1={strip.x}
                    y1={strip.y}
                    x2={strip.x + strip.w}
                    y2={strip.y}
                    stroke={c.chartGrid}
                    strokeWidth={8}
                  />
                  {visible.map(([a, b, col]) => (
                    <Line
                      key={a}
                      x1={sx(a)}
                      y1={strip.y}
                      x2={sx(b)}
                      y2={strip.y}
                      stroke={col}
                      strokeWidth={8}
                    />
                  ))}
                  {Number.isFinite(lam0) && lam0 > LO ? (
                    <G>
                      <Rect
                        x={strip.x}
                        y={strip.y - 12}
                        width={sx(lam0) - strip.x}
                        height={5}
                        fill={c.physMinus}
                        opacity={0.6}
                      />
                      <Line
                        x1={sx(lam0)}
                        y1={strip.y - 16}
                        x2={sx(lam0)}
                        y2={strip.y + 10}
                        stroke={c.chartInk}
                        strokeDasharray={chart.dashFine}
                      />
                    </G>
                  ) : null}
                  {[100, 200, 500, 1000].map((nm) => (
                    <ChartText
                      key={nm}
                      x={sx(nm)}
                      y={strip.y + 22}
                      textAnchor={nm === LO ? 'start' : nm === HI ? 'end' : 'middle'}
                      fontSize={chart.label}
                      fill={c.chartMuted}
                    >
                      {nm === HI ? '1000 nm' : String(nm)}
                    </ChartText>
                  ))}
                  <ChartText x={strip.x} y={strip.y - 20} fontSize={chart.label} fill={c.physMinus}>
                    {Number.isFinite(lam0)
                      ? `electrons freed below λ₀ = ${sig(lam0)} nm`
                      : 'no work function'}
                  </ChartText>
                  <Path d={`M ${sx(lam)} ${strip.y + 5} l -6 9 l 12 0 Z`} fill={c.chartInk} />
                </G>
              </Svg>
              {!spec.fixed && typeof spec.wavelength === 'string' && rep.known(spec.wavelength) ? (
                <DragHandle
                  testID="drag-wavelength"
                  x={sx(lam)}
                  y={strip.y}
                  label={rep.variable(spec.wavelength).name}
                  onStart={() => {
                    drag.current = lam;
                  }}
                  onMove={(dx) => {
                    const id = spec.wavelength as string;
                    const per = strip.w / (Math.log10(HI) - Math.log10(LO));
                    const next = drag.current * Math.pow(10, dx / per);
                    calc.set(
                      {
                        ...rep.pin(
                          typeof spec.workFunction === 'string' ? [spec.workFunction] : [],
                        ),
                        [id]: rep.snapTo(id, next),
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
    const out = [`Photon energy: E = 1240/λ = 1240/${sig(lam)} = ${sig(E)} eV`];
    if (freed)
      out.push(
        `Kinetic energy: K_max = E − φ = ${sig(E)} − ${sig(phi)} = ${sig(K)} eV`,
        'Each photon frees at most one electron; a shorter wavelength gives each electron more energy.',
      );
    else
      out.push(`E is less than φ = ${sig(phi)} eV: no electron leaves, however bright the light.`);
    if (Number.isFinite(lam0))
      out.push(`Threshold: λ₀ = 1240/φ = 1240/${sig(phi)} = ${sig(lam0)} nm`);
    return out.map((l) => l.replace(/K_max/g, 'Kₘₐₓ'));
  }
}
