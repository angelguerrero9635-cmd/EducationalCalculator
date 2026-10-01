import { View } from 'react-native';
import Svg, { Defs, G, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import type { PhotonEnergy, SpectrumLines as Lines } from '@/data/modules/typesHsk';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { photonOf, SPECTRAL_LINES } from './hskMath';
import { labLineIndex } from './hs2h';
import { sci, sig, SubLabel } from './hskKit';
import { url, usePaintIds } from './paint';

type Spec = Extract<Representation, { kind: 'spectrum' }>;

const [LO, HI] = [380, 750];
const NAMES = { H: 'Hydrogen', He: 'Helium', Na: 'Sodium' } as const;

/** A lab wavelength as the tables give it, to a tenth of a nm: 434.0, never 434. */
const nm1 = (nm: number) => nm.toFixed(1);

/** The color of light of a wavelength (nm), from the theme's rainbow; grey outside it. */
export function nmColor(c: Palette, nm: number) {
  if (nm < LO || nm > HI) return c.chartMuted;
  if (nm < 450) return c.spectrumViolet;
  if (nm < 495) return c.spectrumBlue;
  if (nm < 570) return c.spectrumGreen;
  if (nm < 590) return c.spectrumYellow;
  if (nm < 620) return c.spectrumOrange;
  return c.spectrumRed;
}

/** The rainbow as gradient stops at their wavelengths across 380–750 nm. */
function Rainbow({ id, c }: { id: string; c: Palette }) {
  const at = (nm: number) => (nm - LO) / (HI - LO);
  return (
    <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
      <Stop offset={at(380)} stopColor={c.spectrumViolet} />
      <Stop offset={at(460)} stopColor={c.spectrumBlue} />
      <Stop offset={at(520)} stopColor={c.spectrumGreen} />
      <Stop offset={at(575)} stopColor={c.spectrumYellow} />
      <Stop offset={at(605)} stopColor={c.spectrumOrange} />
      <Stop offset={at(650)} stopColor={c.spectrumRed} />
      <Stop offset={1} stopColor={c.spectrumRed} />
    </LinearGradient>
  );
}

/** A strip of the visible spectrum from x0 to x1: emission (bright lines on dark) or absorption. */
function Strip({
  c,
  x0,
  x1,
  y,
  h,
  lines,
  mode,
  rainbow,
}: {
  c: Palette;
  x0: number;
  x1: number;
  y: number;
  h: number;
  lines: number[];
  mode: 'emission' | 'absorption';
  rainbow: string;
}) {
  const X = (nm: number) => x0 + ((nm - LO) / (HI - LO)) * (x1 - x0);
  return (
    <G>
      <Rect
        x={x0}
        y={y}
        width={x1 - x0}
        height={h}
        rx={2}
        fill={mode === 'emission' ? c.shade : url(rainbow)}
      />
      {lines
        .filter((nm) => nm >= LO && nm <= HI)
        .map((nm, i) => (
          <Rect
            key={i}
            x={X(nm) - 1.5}
            y={y}
            width={3}
            height={h}
            fill={mode === 'emission' ? nmColor(c, nm) : c.shade}
          />
        ))}
      {[400, 500, 600, 700].map((nm) => (
        <G key={nm}>
          <Line x1={X(nm)} y1={y + h} x2={X(nm)} y2={y + h + 4} stroke={c.chartMuted} />
          <ChartText
            x={X(nm)}
            y={y + h + 16}
            textAnchor="middle"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            {`${nm}`}
          </ChartText>
        </G>
      ))}
    </G>
  );
}

/**
 * Spectral lines (H70): an element's visible lines as an emission or an absorption spectrum
 * and, with a redshift, the same lines moved to λ(1 + z) in a second strip, each joined to its
 * lab line.
 */
export function SpectrumLinesView({ spec, l, calc }: { spec: Spec; l: Lines; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('rainbow');
  const z =
    l.redshift === undefined
      ? undefined
      : typeof l.redshift === 'number'
        ? l.redshift
        : rep.val(l.redshift);
  const zKnown = typeof l.redshift !== 'string' || rep.known(l.redshift);
  const lab = SPECTRAL_LINES[l.element];
  // H105: `line: 'rest'` follows the lab wavelength typed (the nearest of the element's lines).
  const restNm =
    l.rest && rep.known(l.rest) ? (rep.val(l.rest) * (spec.meters ?? 1)) / 1e-9 : undefined;
  const observedNm = rep.known(spec.wavelength)
    ? (rep.val(spec.wavelength) * (spec.meters ?? 1)) / 1e-9
    : undefined;
  const ref =
    lab[labLineIndex(lab, l.line, restNm, { nm: observedNm, z: zKnown ? z : undefined })]!;
  // Without a redshift the page's wavelength picks one line: marked under the strip.
  const picked =
    z === undefined && rep.known(spec.wavelength)
      ? (rep.val(spec.wavelength) * (spec.meters ?? 1)) / 1e-9
      : undefined;
  const shifted = z === undefined ? undefined : lab.map((q) => q.nm * (1 + z));
  const lines: string[] = [
    `${NAMES[l.element]} ${l.mode === 'emission' ? 'glows at' : 'absorbs at'} ${lab.map((q) => nm1(q.nm)).join(', ')} nm: its fingerprint.`,
  ];
  if (z !== undefined)
    lines.push(
      `λ = λ₀(1 + z) = ${nm1(ref.nm)} × (1 + ${sig(z)}) = ${sig(ref.nm * (1 + z), 4)} nm`,
      `v ≈ cz = 300,000 km/s × ${sig(z)} = ${sig(300000 * z)} km/s ${z >= 0 ? 'away from us (redshift)' : 'toward us (blueshift)'}`,
    );
  return (
    <View>
      <Canvas aspect={z === undefined ? 0.36 : 0.62}>
        {({ w, h }) => {
          const x0 = 16;
          const x1 = w - 16;
          const X = (nm: number) => x0 + ((nm - LO) / (HI - LO)) * (x1 - x0);
          const sh = 34;
          const y1 = 46;
          const y2 = h - sh - 26;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Rainbow id={ids.rainbow} c={c} />
              </Defs>
              <SubLabel
                x={x0}
                y={16}
                text={`${NAMES[l.element]}, ${l.mode}${z !== undefined ? ' (lab)' : ''} · nm`}
                anchor="start"
                size={chart.label}
                w={w}
              />
              <Strip
                c={c}
                x0={x0}
                x1={x1}
                y={y1}
                h={sh}
                lines={lab.map((q) => q.nm)}
                mode={l.mode}
                rainbow={ids.rainbow}
              />
              {lab
                .filter((q) => q.name.startsWith('H') || q.name.startsWith('D'))
                .map((q) => (
                  <ChartText
                    key={q.name}
                    x={X(q.nm)}
                    y={y1 - 2}
                    textAnchor="middle"
                    fontSize={chart.label}
                    fill={c.chartInk}
                  >
                    {q.name === 'D₁' ? '' : q.name === 'D₂' ? 'D' : q.name}
                  </ChartText>
                ))}
              {picked !== undefined && picked >= LO && picked <= HI ? (
                <Path d={`M ${X(picked)} ${y1 + sh + 1} l -6 10 h 12 Z`} fill={c.chartHighlight} />
              ) : null}
              {shifted ? (
                <G opacity={zKnown ? 1 : 0.4}>
                  {lab.map((q, i) => {
                    const s = shifted[i]!;
                    const inView = s >= LO && s <= HI;
                    return (
                      <Line
                        key={i}
                        x1={X(q.nm)}
                        y1={y1 + sh + 18}
                        x2={inView ? X(s) : s > HI ? x1 : x0}
                        y2={y2 - 4}
                        stroke={c.chartMuted}
                        strokeDasharray={chart.dashFine}
                      />
                    );
                  })}
                  <Strip
                    c={c}
                    x0={x0}
                    x1={x1}
                    y={y2}
                    h={sh}
                    lines={shifted}
                    mode={l.mode}
                    rainbow={ids.rainbow}
                  />
                  <SubLabel
                    x={x0}
                    y={y2 - 8}
                    text={`observed, z = ${sig(z!)}`}
                    anchor="start"
                    size={chart.label}
                    w={w}
                  />
                  {shifted.some((s) => s > HI) ? (
                    <SubLabel
                      x={x1}
                      y={y2 - 8}
                      text="some lines shifted past red"
                      anchor="end"
                      size={chart.label}
                      bold={false}
                      w={w}
                    />
                  ) : null}
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

/**
 * A photon (H70): its wave drawn in its color, more cycles for a higher frequency, where it
 * falls on the visible spectrum, and its energy E = hf.
 */
export function PhotonView({ p, calc }: { spec: Spec; p: PhotonEnergy; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('rainbow');
  const f =
    Math.max(0, typeof p.frequency === 'number' ? p.frequency : rep.val(p.frequency)) *
    (p.hertz ?? 1);
  const known = typeof p.frequency !== 'string' || rep.known(p.frequency);
  const ph = photonOf(f);
  const col = nmColor(c, ph.nm);
  const band =
    ph.nm < 10
      ? 'X-ray or gamma'
      : ph.nm < LO
        ? 'ultraviolet'
        : ph.nm > 1e6
          ? 'radio or microwave'
          : ph.nm > HI
            ? 'infrared'
            : 'visible';
  return (
    <View>
      <Canvas aspect={0.5}>
        {({ w, h }) => {
          const x0 = 16;
          const x1 = w - 16;
          // Cycles across: 2 at 380 THz (red end) growing with the frequency, at most 14.
          const cycles = Math.max(1.5, Math.min(14, (f / 4e14) * 3));
          const mid = h * 0.3;
          const amp = 22;
          const d = Array.from({ length: 241 }, (_, i) => i / 240)
            .map(
              (t, i) =>
                `${i ? 'L' : 'M'} ${(x0 + t * (x1 - x0)).toFixed(1)} ${(mid - amp * Math.sin(2 * Math.PI * cycles * t)).toFixed(1)}`,
            )
            .join(' ');
          const X = (nm: number) => x0 + ((nm - LO) / (HI - LO)) * (x1 - x0);
          const sy = h * 0.66;
          const mark = ph.nm < LO ? x0 : ph.nm > HI ? x1 : X(ph.nm);
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Rainbow id={ids.rainbow} c={c} />
              </Defs>
              <G opacity={known ? 1 : 0.4}>
                <Path d={d} stroke={col} strokeWidth={3} fill="none" />
                <Rect x={x0} y={sy} width={x1 - x0} height={22} rx={2} fill={url(ids.rainbow)} />
                <Path d={`M ${mark} ${sy - 2} l -7 -12 h 14 Z`} fill={c.chartInk} />
                <SubLabel
                  x={mark}
                  y={sy - 18}
                  text={`${sig(ph.nm)} nm (${band})`}
                  anchor={mark > w * 0.6 ? 'end' : mark < w * 0.4 ? 'start' : 'middle'}
                  w={w}
                />
                {[400, 500, 600, 700].map((nm) => (
                  <ChartText
                    key={nm}
                    x={X(nm)}
                    y={sy + 36}
                    textAnchor="middle"
                    fontSize={chart.label}
                    fill={c.chartMuted}
                  >
                    {`${nm} nm`.replace(' nm', nm === 400 ? ' nm' : '')}
                  </ChartText>
                ))}
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          `λ = c/f = 3 × 10⁸/(${sci(f)}) = ${sig(ph.nm)} nm`,
          `E = hf = 6.626 × 10⁻³⁴ × ${sci(f)} = ${sci(ph.J)} J`,
          `In electronvolts: ${sci(ph.J)}/(1.602 × 10⁻¹⁹) = ${sig(ph.eV)} eV`,
          'Higher frequency, shorter wavelength, more energy per photon: blue photons carry more than red.',
        ].join(' · ')}
      </Caption>
    </View>
  );
}
