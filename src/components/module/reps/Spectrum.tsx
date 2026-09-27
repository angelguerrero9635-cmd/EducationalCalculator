import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Defs, G, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useRep } from './common';
import { usePaintIds, url } from './paint';

type Spec = Extract<Representation, { kind: 'spectrum' }>;

/** The band runs from 1 km (log₁₀ λ = 3, left) to 0.1 pm (−13, right), in meters. */
const LEFT = 3;
const RIGHT = -13;

/** The kinds of wave, longest first, by where each starts (log₁₀ of the wavelength in m). */
export const BANDS: { name: string; short: string; from: number; to: number }[] = [
  { name: 'radio waves', short: 'Radio', from: LEFT, to: 0 },
  { name: 'microwaves', short: 'Microwave', from: 0, to: -3 },
  { name: 'infrared', short: 'Infrared', from: -3, to: Math.log10(700e-9) },
  { name: 'visible light', short: '', from: Math.log10(700e-9), to: Math.log10(400e-9) },
  { name: 'ultraviolet', short: 'UV', from: Math.log10(400e-9), to: -8 },
  { name: 'X-rays', short: 'X-ray', from: -8, to: -11 },
  { name: 'gamma rays', short: 'Gamma', from: -11, to: RIGHT },
];

/** The rainbow from red (700 nm) to violet (400 nm), with where each color's middle sits. */
const RAINBOW: { name: string; nm: number; color: (c: Palette) => string }[] = [
  { name: 'red', nm: 680, color: (c) => c.spectrumRed },
  { name: 'orange', nm: 610, color: (c) => c.spectrumOrange },
  { name: 'yellow', nm: 580, color: (c) => c.spectrumYellow },
  { name: 'green', nm: 530, color: (c) => c.spectrumGreen },
  { name: 'blue', nm: 470, color: (c) => c.spectrumBlue },
  { name: 'violet', nm: 415, color: (c) => c.spectrumViolet },
];
/** Color names by wavelength (nm): where each one ends going toward violet. */
const COLOR_EDGES: [number, string][] = [
  [625, 'red'],
  [590, 'orange'],
  [565, 'yellow'],
  [495, 'green'],
  [450, 'blue'],
  [0, 'violet'],
];

/** The kind of wave for a wavelength in meters (and its color, for visible light). */
export function bandOf(meters: number): { name: string; color?: string } {
  const lg = Math.log10(meters);
  const band = BANDS.find((b) => lg <= b.from && lg > b.to) ?? (lg > 0 ? BANDS[0]! : BANDS[6]!);
  if (band.name !== 'visible light') return { name: band.name };
  const nm = meters * 1e9;
  return { name: band.name, color: COLOR_EDGES.find(([edge]) => nm >= edge)![1] };
}

const TICKS: [number, string][] = [
  [3, '1 km'],
  [0, '1 m'],
  [-3, '1 mm'],
  [-6, '1 µm'],
  [-9, '1 nm'],
  [-12, '1 pm'],
];

/**
 * The electromagnetic spectrum (Grade 8): a band from radio to gamma rays on a powers-of-ten
 * scale of wavelength, a wave above it whose crests close up toward the short end, and the thin
 * visible part opened up below in rainbow order. The wavelength is marked, with one wavelength
 * of the wave bracketed over it; drag the mark along the band.
 */
export function Spectrum({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('rainbow', 'sliver');
  const start = useRef(0);
  const perUnit = spec.meters ?? 1;
  const known = rep.known(spec.wavelength);
  const meters = Math.max(1e-16, rep.val(spec.wavelength) * perUnit);
  const lg = Math.min(LEFT, Math.max(RIGHT, Math.log10(meters)));
  const band = bandOf(meters);
  const v = rep.variable(spec.wavelength);

  const rainbowStops = RAINBOW.map((r) => (
    <Stop key={r.name} offset={(700 - r.nm) / 300} stopColor={r.color(c)} />
  ));

  return (
    <View>
      <Canvas aspect={(w) => 236 / w}>
        {({ w, h }) => {
          const pad = 14;
          const L = w - 2 * pad;
          const x = (log: number) => pad + ((LEFT - log) / (LEFT - RIGHT)) * L;
          const waveY = 50;
          const bandY = 80;
          const bandH = 38;
          const zoomY = 176;
          const zoomW = Math.min(240, L * 0.72);
          const zoomX = (w - zoomW) / 2;
          // The rainbow strip: 700 nm at the left (red), 400 nm at the right (violet).
          const zx = (nm: number) => zoomX + ((700 - nm) / 300) * zoomW;
          // The wave above the band: its wavelength shrinks from 64 px at the left to 3 px at
          // the right, by the same factor per step across (a picture of the log scale).
          const p0 = 64;
          const p1 = 3;
          const k = Math.log(p0 / p1) / L;
          const period = (px: number) => p0 * Math.exp(-k * (px - pad));
          let d = '';
          for (let s = 0; s <= L; s += 0.5) {
            const phase = ((Math.exp(k * s) - 1) / (k * p0)) * 2 * Math.PI;
            d += `${s === 0 ? 'M' : 'L'} ${(pad + s).toFixed(2)} ${(waveY - 13 * Math.sin(phase)).toFixed(2)} `;
          }
          const mx = x(lg);
          const lam = period(mx);
          const visible = band.name === 'visible light';
          const nm = meters * 1e9;
          const label = rep.label(spec.wavelength);
          const vLeft = x(BANDS[3]!.from);
          const vRight = x(BANDS[3]!.to);
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <LinearGradient id={ids.rainbow} x1="0" y1="0" x2="1" y2="0">
                    {rainbowStops}
                  </LinearGradient>
                  <LinearGradient id={ids.sliver} x1="0" y1="0" x2="1" y2="0">
                    {rainbowStops}
                  </LinearGradient>
                </Defs>
                {/* Which way the waves get longer and shorter. */}
                <ChartText x={pad} y={14} fontSize={chart.small} fill={c.chartMuted}>
                  ← longer wavelength
                </ChartText>
                <ChartText
                  x={w - pad}
                  y={14}
                  fontSize={chart.small}
                  fill={c.chartMuted}
                  textAnchor="end"
                >
                  shorter wavelength →
                </ChartText>
                <Path d={d} stroke={c.chartInk} strokeWidth={1.4} fill="none" />
                {/* One wavelength of the wave, bracketed over the mark. */}
                {lam >= 6 ? (
                  <G opacity={known ? 1 : 0.35}>
                    <Path
                      d={`M ${mx - lam / 2} ${waveY - 22} v -5 H ${mx + lam / 2} v 5`}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke}
                      fill="none"
                    />
                  </G>
                ) : null}

                {/* The band: each kind of wave, the visible sliver in rainbow order. */}
                {BANDS.map((b, i) => {
                  const x0 = x(b.from);
                  const x1 = x(b.to);
                  const vis = b.name === 'visible light';
                  return (
                    <G key={b.name}>
                      <Rect
                        x={x0}
                        y={bandY}
                        width={x1 - x0}
                        height={bandH}
                        fill={vis ? url(ids.sliver) : i % 2 ? c.chartSurface : c.chartFill}
                      />
                      {b.short ? (
                        <ChartText
                          x={(x0 + x1) / 2}
                          y={bandY + bandH / 2 + 4}
                          fontSize={chart.tiny}
                          fontWeight={band.name === b.name ? '700' : '400'}
                          textAnchor="middle"
                        >
                          {b.short}
                        </ChartText>
                      ) : null}
                    </G>
                  );
                })}
                <Rect
                  x={pad}
                  y={bandY}
                  width={L}
                  height={bandH}
                  fill="none"
                  stroke={c.chartGrid}
                  strokeWidth={chart.strokeLight}
                />
                {TICKS.map(([t, text]) => (
                  <G key={t}>
                    <Line
                      x1={x(t)}
                      y1={bandY + bandH}
                      x2={x(t)}
                      y2={bandY + bandH + 5}
                      stroke={c.chartMuted}
                    />
                    <ChartText
                      {...fitLabel(x(t), text, chart.tiny, w)}
                      y={bandY + bandH + 16}
                      fontSize={chart.tiny}
                      fill={c.chartMuted}
                    >
                      {text}
                    </ChartText>
                  </G>
                ))}

                {/* The visible sliver opened up: red 700 nm to violet 400 nm. */}
                <Path
                  d={`M ${vLeft} ${bandY + bandH} L ${zoomX} ${zoomY} M ${vRight} ${bandY + bandH} L ${zoomX + zoomW} ${zoomY}`}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dashFine}
                />
                <Rect
                  x={zoomX}
                  y={zoomY}
                  width={zoomW}
                  height={20}
                  rx={3}
                  fill={url(ids.rainbow)}
                />
                <ChartText
                  x={zoomX - 4}
                  y={zoomY + 14}
                  fontSize={chart.tiny}
                  fill={c.chartMuted}
                  textAnchor="end"
                >
                  700 nm
                </ChartText>
                <ChartText
                  x={zoomX + zoomW + 4}
                  y={zoomY + 14}
                  fontSize={chart.tiny}
                  fill={c.chartMuted}
                >
                  400 nm
                </ChartText>
                <ChartText
                  x={w / 2}
                  y={zoomY + 36}
                  fontSize={chart.small}
                  fill={c.chartMuted}
                  textAnchor="middle"
                >
                  visible light
                </ChartText>

                {/* The mark: on the band, and on the rainbow when it is visible light. */}
                <G opacity={known ? 1 : 0.35}>
                  <Line
                    x1={mx}
                    y1={bandY - 6}
                    x2={mx}
                    y2={bandY + bandH + 2}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                  />
                  <ChartText
                    {...fitLabel(mx, label, chart.value, w)}
                    y={bandY + bandH + 34}
                    fontSize={chart.value}
                    fontWeight="700"
                    fill={c.chartHighlight}
                  >
                    {label}
                  </ChartText>
                  {visible ? (
                    <Path
                      d={`M ${zx(nm)} ${zoomY - 2} l -5 -8 h 10 Z M ${zx(nm)} ${zoomY} V ${zoomY + 20}`}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                      fill={c.chartInk}
                    />
                  ) : null}
                </G>
              </Svg>
              <DragHandle
                testID="drag-wavelength"
                x={mx}
                y={bandY + bandH / 2}
                label={v.name}
                onStart={() => {
                  start.current = mx;
                }}
                onMove={(dx) => {
                  const px = Math.min(pad + L, Math.max(pad, start.current + dx));
                  const log = LEFT - ((px - pad) / L) * (LEFT - RIGHT);
                  setMeters(Number((10 ** log).toPrecision(2)));
                }}
              />
              {visible ? (
                <DragHandle
                  testID="drag-color"
                  x={zx(nm)}
                  y={zoomY + 10}
                  label={`${v.name} (color)`}
                  onStart={() => {
                    start.current = zx(nm);
                  }}
                  onMove={(dx) => {
                    const px = Math.min(zoomX + zoomW, Math.max(zoomX, start.current + dx));
                    const at = 700 - ((px - zoomX) / zoomW) * 300;
                    setMeters(Math.round(at) * 1e-9, 3);
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{caption()}</Caption>
    </View>
  );

  /** Sets the wavelength from meters: `digits` significant figures in its own unit, within its limits. */
  function setMeters(m: number, digits = 2) {
    let next = Number((m / perUnit).toPrecision(digits));
    if (v.min !== undefined) next = Math.max(v.min, next);
    if (v.max !== undefined) next = Math.min(v.max, next);
    calc.set(
      {
        ...rep.pin(typeof spec.speed === 'string' ? [spec.speed] : []),
        [spec.wavelength]: next,
      },
      rep.slide(spec.wavelength),
    );
  }

  function caption() {
    const what = known
      ? `${rep.named(spec.wavelength)}: ${band.name}${band.color ? ` (${band.color})` : ''}.`
      : `${rep.named(spec.wavelength)}.`;
    if (spec.speed === undefined || !spec.frequency) return what;
    const [s, l, f] = [spec.speed, spec.wavelength, spec.frequency];
    const name = (id: string) => (rep.words ? rep.variable(id).name : rep.variable(id).symbol);
    const [sName, sValue] =
      typeof s === 'number'
        ? [rep.words ? 'Speed' : 'c', `${formatNumber(s)} m/s`]
        : [name(s), rep.value(s)];
    return `${what} · ${sName} = ${name(l)} × ${name(f)} · ${sValue} = ${rep.value(l)} × ${rep.value(f)}`;
  }
}
