/**
 * HC93 `wave` options `em` and `line` (WaveHe3lSpec in typesHe3l.ts): a plane wave's E and B (or
 * H) in step along the travel direction with E₀, B₀, λ and S, and the standing-wave envelope on a
 * lossless line from a source to a resistive load with V_max, V_min and the VSWR. Diagrams:
 * flat. A "?" draws nothing for that value.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { WaveEm, WaveHe3lSpec, WaveLine } from '@/data/modules/typesHe3l';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { Arrow } from './he1fKit';
import { fmt, Tag } from './he2fKit';
import { useHe3l } from './he3lKit';
import { emWaveOf, ETA_0, gammaOf, LIGHT_SPEED, lineEnvelope, standingOf } from './he3lMath';

const fixedHeight = (h: number) => (w: number) => h / w;

export function WaveHe3l({ spec, calc }: { spec: WaveHe3lSpec; calc: Calculator }) {
  if ('em' in spec) return <EmView em={spec.em} calc={calc} />;
  return <LineView line={spec.line} calc={calc} />;
}

/** A value in SI with its unit, "3.38 × 10⁻⁶ T". */
const siText = (x: number, unit: string) => `${fmt(x)} ${unit}`;

// ─── E and B ─────────────────────────────────────────────────────────────────

const EM_H = 264;

function EmView({ em, calc }: { em: WaveEm; calc: Calculator }) {
  const c = usePalette();
  const { si, label } = useHe3l(calc);
  const H = em.field === 'H';
  const E0 = si(em.amplitude);
  const v = si(em.speed) ?? (em.speed === undefined ? LIGHT_SPEED : undefined);
  const eta = si(em.impedance) ?? (em.speed === undefined ? ETA_0 : undefined);
  // A named impedance still "?" leaves H₀ and S unknown.
  const etaKnown = em.impedance === undefined || eta !== undefined;
  const wave = E0 !== undefined && v !== undefined && etaKnown ? emWaveOf(E0, v, eta) : undefined;
  const mag = H ? wave?.H0 : wave?.B0;
  const lam = si(em.wavelength);
  const E0Text = label(em.amplitude, 'E₀', E0, 'V/m');
  const BText = label(em.magnetic, H ? 'H₀' : 'B₀', mag, '');
  const BShown =
    BText ??
    (mag === undefined ? undefined : `${H ? 'H₀' : 'B₀'} = ${siText(mag, H ? 'A/m' : 'T')}`);
  const lamText = label(em.wavelength, 'λ', lam, 'm');
  const IText = label(em.intensity, H ? 'S' : 'I', wave?.intensity, 'W/m²');
  const lines: string[] = [];
  if (wave && E0 !== undefined)
    lines.push(
      H
        ? `H₀ = E₀ ÷ η = ${fmt(E0)} V/m ÷ ${fmt(wave.eta)} Ω = ${siText(wave.H0, 'A/m')}`
        : `B₀ = E₀ ÷ ${em.speed === undefined ? 'c' : 'v'} = ${fmt(E0)} V/m ÷ ${fmt(v!)} m/s = ${siText(wave.B0, 'T')}`,
      `${H ? 'S' : 'I'} = E₀² ÷ 2η = ${fmt(E0)}² ÷ (2 × ${fmt(wave.eta)} Ω) = ${fmt(wave.intensity)} W/m²`,
    );
  else lines.push(H ? 'H₀ = E₀ ÷ η; S = E₀² ÷ 2η.' : 'B₀ = E₀ ÷ c; I = ½cε₀E₀².');
  lines.push(
    `E ⟂ ${H ? 'H' : 'B'} ⟂ the direction of travel, in step; the Poynting vector S = E × ${H ? 'H' : 'B ÷ μ₀'} points along it.`,
  );
  return (
    <View>
      <Canvas aspect={fixedHeight(EM_H)}>
        {({ w, h }) => {
          const x0 = 34;
          const x1 = w - 46;
          const cy = h / 2 + 6;
          const A = 74;
          const B = 62;
          // The level transverse direction in perspective: down and to the left.
          const [ox, oy] = [-0.55, 0.42];
          const n = 96;
          const k = (2 * 2 * Math.PI) / (x1 - x0);
          const pts = Array.from({ length: n + 1 }, (_, i) => x0 + ((x1 - x0) * i) / n);
          const ePath = pts
            .map((x, i) => `${i ? 'L' : 'M'} ${x} ${cy - A * Math.sin(k * (x - x0))}`)
            .join(' ');
          const bPath = pts
            .map((x, i) => {
              const s = B * Math.sin(k * (x - x0));
              return `${i ? 'L' : 'M'} ${x + ox * s} ${cy + oy * s}`;
            })
            .join(' ');
          const crest = x0 + Math.PI / 2 / k;
          const hairs = pts.filter((_, i) => i % 4 === 0);
          const known = E0 !== undefined;
          return (
            <Svg width={w} height={h}>
              {/* The travel axis and S. */}
              <Line x1={x0 - 6} y1={cy} x2={x1} y2={cy} stroke={c.chartMuted} />
              <Arrow x1={x1} y1={cy} x2={w - 8} y2={cy} color={c.chartInk} width={2.5} />
              <Tag x={w - 6} y={cy - 10} text="S" anchor="end" chip={false} />
              {known ? (
                <G>
                  {hairs.map((x) => (
                    <Line
                      key={`e${x}`}
                      x1={x}
                      y1={cy}
                      x2={x}
                      y2={cy - A * Math.sin(k * (x - x0))}
                      stroke={c.he3lE}
                      strokeWidth={1}
                      opacity={0.5}
                    />
                  ))}
                  {hairs.map((x) => {
                    const s = B * Math.sin(k * (x - x0));
                    return (
                      <Line
                        key={`b${x}`}
                        x1={x}
                        y1={cy}
                        x2={x + ox * s}
                        y2={cy + oy * s}
                        stroke={c.he3lB}
                        strokeWidth={1}
                        opacity={0.5}
                      />
                    );
                  })}
                  <Path d={bPath} stroke={c.he3lB} strokeWidth={2.2} fill="none" />
                  <Path d={ePath} stroke={c.he3lE} strokeWidth={2.5} fill="none" />
                  {/* E₀ and B₀ at the first crest. */}
                  <Arrow x1={crest} y1={cy} x2={crest} y2={cy - A} color={c.he3lE} width={2.5} />
                  <Arrow
                    x1={crest}
                    y1={cy}
                    x2={crest + ox * B}
                    y2={cy + oy * B}
                    color={c.he3lB}
                    width={2.5}
                  />
                  {E0Text ? (
                    <Tag
                      x={crest - 6}
                      y={cy - A - 8}
                      text={E0Text}
                      anchor="start"
                      color={c.he3lE}
                      w={w}
                    />
                  ) : null}
                  {BShown ? (
                    <Tag
                      x={4}
                      y={cy + oy * B + 20}
                      text={BShown}
                      anchor="start"
                      color={c.he3lB}
                      w={w}
                    />
                  ) : null}
                </G>
              ) : null}
              {/* λ from crest to crest. */}
              <Line
                x1={crest}
                y1={h - 26}
                x2={crest + (2 * Math.PI) / k}
                y2={h - 26}
                stroke={c.chartInk}
              />
              {[crest, crest + (2 * Math.PI) / k].map((x) => (
                <Line key={x} x1={x} y1={h - 31} x2={x} y2={h - 21} stroke={c.chartInk} />
              ))}
              <Tag x={crest + Math.PI / k} y={h - 8} text={lamText ?? 'λ'} w={w} />
              {IText ? <Tag x={w - 6} y={18} text={IText} anchor="end" w={w} /> : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

// ─── A standing wave on a line ───────────────────────────────────────────────

const LINE_H = 300;
/** Wavelengths of line drawn back from the load. */
const SPAN = 1.25;

function LineView({ line, calc }: { line: WaveLine; calc: Calculator }) {
  const c = usePalette();
  const { si, label } = useHe3l(calc);
  const z0 = si(line.impedance);
  const rl = si(line.load);
  const given = si(line.gamma);
  const G0 = given ?? (z0 !== undefined && rl !== undefined ? gammaOf(z0, rl) : undefined);
  const Gm = G0 === undefined ? undefined : Math.max(-1, Math.min(1, G0));
  const sw = Gm === undefined ? undefined : standingOf(Gm);
  const gText = label(line.gamma, 'Γ', Gm);
  const vText =
    sw === undefined
      ? undefined
      : Number.isFinite(sw.vswr)
        ? (label(line.vswr, 'VSWR', sw.vswr) ?? `VSWR = ${fmt(sw.vswr)}`)
        : 'VSWR → ∞';
  const lines: string[] = [];
  if (z0 !== undefined && rl !== undefined && Gm !== undefined)
    lines.push(
      `Γ = (R_L − Z₀) ÷ (R_L + Z₀) = (${fmt(rl)} − ${fmt(z0)}) ÷ (${fmt(rl)} + ${fmt(z0)}) = ${fmt(Gm)}`,
    );
  if (sw && Gm !== undefined)
    lines.push(
      Number.isFinite(sw.vswr)
        ? `V_max ÷ V_min = (1 + |Γ|) ÷ (1 − |Γ|) = ${fmt(sw.vmax)} ÷ ${fmt(sw.vmin)} = ${fmt(sw.vswr)}, the VSWR`
        : 'All the wave is reflected (|Γ| = 1): V_min = 0 and the VSWR has no end.',
    );
  else lines.push('VSWR = V_max ÷ V_min = (1 + |Γ|) ÷ (1 − |Γ|).');
  if (Gm !== undefined)
    lines.push(
      Math.abs(Gm) < 1e-9
        ? 'Matched: nothing comes back, so the voltage is the same all along the line.'
        : Gm > 0
          ? 'R_L > Z₀ (Γ > 0): a maximum at the load; maxima repeat every λ/2.'
          : 'R_L < Z₀ (Γ < 0): a minimum at the load; minima repeat every λ/2.',
    );
  const extra = [
    label(line.returnLoss, 'RL', undefined),
    label(line.share, 'share', undefined),
  ].filter((t): t is string => !!t);
  return (
    <View>
      <Canvas aspect={fixedHeight(LINE_H)}>
        {({ w, h }) => {
          const xs = 46;
          const xl = w - 58;
          const top = 44;
          const base = 176;
          const sy = (base - top) / 2.15;
          const Y = (v: number) => base - v * sy;
          // x along the line: d (wavelengths from the load) at xl − d × px.
          const px = (xl - xs) / SPAN;
          const X = (d: number) => xl - d * px;
          const env =
            Gm === undefined
              ? undefined
              : Array.from({ length: 151 }, (_, i) => {
                  const d = (SPAN * i) / 150;
                  return `${i ? 'L' : 'M'} ${X(d)} ${Y(lineEnvelope(Gm, d))}`;
                }).join(' ');
          const yl = 236;
          const max0 = Gm !== undefined && Gm < 0 ? 0.25 : 0;
          return (
            <Svg width={w} height={h}>
              {/* The axis of |V| and its scale. */}
              <Line x1={xs} y1={base} x2={xl} y2={base} stroke={c.chartMuted} />
              <Line x1={xs} y1={top - 6} x2={xs} y2={base} stroke={c.chartMuted} />
              <ChartText
                x={xs - 4}
                y={Y(1) + 4}
                fontSize={chart.label}
                textAnchor="end"
                fill={c.chartMuted}
              >
                1
              </ChartText>
              <Line
                x1={xs - 3}
                y1={Y(1)}
                x2={xl}
                y2={Y(1)}
                stroke={c.chartGrid}
                strokeDasharray={chart.dashFine}
              />
              <Tag x={xs + 4} y={top - 14} text="|V| ÷ |V⁺|" anchor="start" chip={false} />
              {sw && Gm !== undefined ? (
                <G>
                  {[sw.vmax, sw.vmin].map((v, i) => (
                    <G key={i}>
                      <Line
                        x1={xs}
                        y1={Y(v)}
                        x2={xl}
                        y2={Y(v)}
                        stroke={c.chartInk}
                        strokeWidth={1}
                        strokeDasharray={chart.dash}
                      />
                      <Tag
                        x={xl + 4}
                        y={Y(v) + (i === 0 ? -2 : 12)}
                        text={i === 0 ? 'V_max' : 'V_min'}
                        anchor="start"
                        chip={false}
                        w={w}
                      />
                    </G>
                  ))}
                  <Path d={env!} stroke={c.he3lCurve} strokeWidth={2.5} fill="none" />
                  {Math.abs(Gm) > 1e-9 ? (
                    <G>
                      {/* λ/2 between two maxima. */}
                      <Line
                        x1={X(max0)}
                        y1={top - 2}
                        x2={X(max0 + 0.5)}
                        y2={top - 2}
                        stroke={c.chartInk}
                      />
                      {[max0, max0 + 0.5].map((d) => (
                        <Line
                          key={d}
                          x1={X(d)}
                          y1={top - 7}
                          x2={X(d)}
                          y2={top + 3}
                          stroke={c.chartInk}
                        />
                      ))}
                      <Tag x={X(max0 + 0.25)} y={top - 7} text="λ/2" w={w} />
                    </G>
                  ) : null}
                </G>
              ) : null}
              {/* Distance back from the load. */}
              {[0.25, 0.5, 0.75, 1].map((d) => (
                <G key={d}>
                  <Line x1={X(d)} y1={base} x2={X(d)} y2={base + 4} stroke={c.chartMuted} />
                  <ChartText
                    x={X(d)}
                    y={base + 16}
                    fontSize={chart.label}
                    textAnchor="middle"
                    fill={c.chartMuted}
                  >
                    {d === 1 ? 'λ' : d === 0.5 ? 'λ/2' : d === 0.25 ? 'λ/4' : '3λ/4'}
                  </ChartText>
                </G>
              ))}
              {/* The line: source, two conductors, load. */}
              <Circle
                cx={xs - 18}
                cy={yl}
                r={14}
                stroke={c.chartInk}
                strokeWidth={1.5}
                fill={c.chartSurface}
              />
              <Path
                d={`M ${xs - 26} ${yl} q 4 -7 8 0 q 4 7 8 0`}
                stroke={c.chartInk}
                strokeWidth={1.5}
                fill="none"
              />
              <Line
                x1={xs - 18}
                y1={yl - 14}
                x2={xs - 18}
                y2={yl - 20}
                stroke={c.chartInk}
                strokeWidth={1.5}
              />
              <Line
                x1={xs - 18}
                y1={yl + 14}
                x2={xs - 18}
                y2={yl + 20}
                stroke={c.chartInk}
                strokeWidth={1.5}
              />
              {[yl - 20, yl + 20].map((y) => (
                <Line
                  key={y}
                  x1={xs - 18}
                  y1={y}
                  x2={xl}
                  y2={y}
                  stroke={c.chartInk}
                  strokeWidth={2}
                />
              ))}
              <Rect
                x={xl - 8}
                y={yl - 14}
                width={16}
                height={28}
                rx={2}
                fill={c.physResistor}
                stroke={c.chartInk}
              />
              <Line
                x1={xl}
                y1={yl - 20}
                x2={xl}
                y2={yl - 14}
                stroke={c.chartInk}
                strokeWidth={1.5}
              />
              <Line
                x1={xl}
                y1={yl + 14}
                x2={xl}
                y2={yl + 20}
                stroke={c.chartInk}
                strokeWidth={1.5}
              />
              <Tag
                x={(xs + xl) / 2 - 30}
                y={yl + 5}
                text={label(line.impedance, 'Z₀', z0, 'Ω') ?? 'Z₀'}
                chip={false}
                w={w}
              />
              <Tag
                x={xl - 14}
                y={yl + 5}
                text={label(line.load, 'R_L', rl, 'Ω') ?? 'R_L'}
                anchor="end"
                chip={false}
                w={w}
              />
              {gText ? <Tag x={xs + 2} y={h - 10} text={gText} anchor="start" w={w} /> : null}
              {vText ? <Tag x={w / 2 + 10} y={h - 10} text={vText} anchor="start" w={w} /> : null}
              {extra.length ? (
                <Tag x={w - 6} y={18} text={extra.join('   ')} anchor="end" w={w} />
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
