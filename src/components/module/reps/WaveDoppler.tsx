import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line } from 'react-native-svg';

import type { DopplerWave } from '@/data/modules/typesHsk';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, useRep } from './common';
import { dopplerOf } from './hskMath';
import { sig, SubLabel, Vec } from './hskKit';
import { Ball, url, usePaintIds } from './paint';

const FRONTS = 6;

/**
 * The Doppler effect (H65): wavefronts sent out once a period by a moving source, each a
 * circle centered where the source was when it left: bunched ahead, spread behind; at or past
 * the wave speed they pile into a shock cone. The frequencies heard ahead and behind.
 */
export function WaveDoppler({ d, calc }: { d: DopplerWave; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('src');
  const si = (x: number | string | undefined, dflt = 0) =>
    x === undefined ? dflt : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) => typeof x !== 'string' || rep.known(x);
  const vs = Math.max(0, si(d.sourceSpeed));
  const v = Math.max(1e-9, si(d.waveSpeed, 343));
  const f = Math.max(0, si(d.frequency));
  const M = vs / v;
  const heard = dopplerOf(f, v, vs);
  const all = [d.sourceSpeed, d.waveSpeed, d.frequency].every(known);
  // A "?" box reads "?" on the picture too, not the example's number drawn faded behind it.
  const q = (ok: boolean, text: string) => (ok ? text : '?');
  const sOk = known(d.sourceSpeed);
  const lamOk = sOk && known(d.waveSpeed) && known(d.frequency);
  const lines = captionLines();

  return (
    <View>
      <Canvas aspect={0.72}>
        {({ w, h }) => {
          const mid = h * 0.5;
          const sx = M < 1 ? 10 + (w - 20) * ((1 + M) / 2) : w - 70;
          // Pixels per wavelength-at-rest (v × one period), so every front fits.
          const u = Math.min(
            (sx - 10) / (FRONTS * (1 + M)),
            M < 1 ? (w - 10 - sx) / (FRONTS * (1 - M)) : Infinity,
            (mid - 26) / FRONTS,
          );
          const fronts = Array.from({ length: FRONTS }, (_, i) => i + 1).map((k) => ({
            k,
            cx: sx - k * u * M,
            r: k * u,
          }));
          // The shock cone: lines from the source tangent to every front (Mach ≥ 1).
          const cone = M > 1 ? Math.asin(1 / M) : undefined;
          const coneLen = FRONTS * u * M * Math.cos(cone ?? 0);
          const ahead1 = sx + u * (1 - M);
          const behind1 = sx - u * (1 + M);
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Ball id={ids.src} color={c.physCartB} />
              </Defs>
              <G opacity={all ? 1 : 0.4}>
                <Line
                  x1={0}
                  y1={mid}
                  x2={w}
                  y2={mid}
                  stroke={c.chartGrid}
                  strokeDasharray={chart.dashFine}
                />
                {fronts.map((q) => (
                  <Circle
                    key={q.k}
                    cx={q.cx}
                    cy={mid}
                    r={q.r}
                    stroke={c.chartHighlight}
                    strokeWidth={2}
                    fill="none"
                    opacity={1 - (q.k - 1) * 0.1}
                  />
                ))}
                {fronts.map((q) => (
                  <Circle key={`c${q.k}`} cx={q.cx} cy={mid} r={2} fill={c.chartMuted} />
                ))}
                {cone !== undefined
                  ? [1, -1].map((sgn) => (
                      <Line
                        key={sgn}
                        x1={sx}
                        y1={mid}
                        x2={sx - coneLen * Math.cos(cone)}
                        y2={mid - sgn * coneLen * Math.sin(cone)}
                        stroke={c.normalReject}
                        strokeWidth={2}
                      />
                    ))
                  : null}
                <Circle cx={sx} cy={mid} r={9} fill={url(ids.src)} stroke={c.chartInk} />
                <Vec
                  x1={sx + 11}
                  y1={mid + 22}
                  x2={sx + 11 + 36}
                  y2={mid + 22}
                  color={c.chartInk}
                  width={2}
                  head={8}
                />
                <SubLabel
                  x={sx + 8}
                  y={mid + 42}
                  text={`v_s ${q(sOk, sig(vs))} m/s`}
                  anchor="start"
                  size={chart.label}
                  w={w}
                />
                {M < 1 ? (
                  <G>
                    <Line
                      x1={sx}
                      y1={mid - 30}
                      x2={ahead1}
                      y2={mid - 30}
                      stroke={c.chartInk}
                      strokeWidth={1.5}
                    />
                    <SubLabel
                      x={w - 6}
                      y={16}
                      text={`ahead: f′ ${q(all, sig(heard.ahead))} Hz`}
                      anchor="end"
                      color={c.chartHighlight}
                      w={w}
                    />
                    <SubLabel
                      x={6}
                      y={16}
                      text={`behind: f′ ${q(all, sig(heard.behind))} Hz`}
                      anchor="start"
                      color={c.chartHighlight}
                      w={w}
                    />
                    <SubLabel
                      x={Math.min(w - 40, (sx + ahead1) / 2 + 20)}
                      y={mid - 36}
                      text={`λ ahead ${q(lamOk, sig((v - vs) / Math.max(f, 1e-9)))} m`}
                      size={chart.label}
                      w={w}
                    />
                    <Line
                      x1={behind1}
                      y1={mid + 64}
                      x2={sx}
                      y2={mid + 64}
                      stroke={c.chartInk}
                      strokeWidth={1.5}
                    />
                    <SubLabel
                      x={(behind1 + sx) / 2}
                      y={mid + 82}
                      text={`λ behind ${q(lamOk, sig((v + vs) / Math.max(f, 1e-9)))} m`}
                      size={chart.label}
                      w={w}
                    />
                  </G>
                ) : (
                  <SubLabel
                    x={6}
                    y={16}
                    text={
                      M > 1
                        ? 'faster than the waves: a shock cone'
                        : 'at the wave speed: fronts pile up'
                    }
                    anchor="start"
                    color={c.normalReject}
                    w={w}
                  />
                )}
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );

  function captionLines(): string[] {
    const out: string[] = [];
    if (!all)
      out.push(
        'Ahead: f′ = f v/(v − vₛ)',
        'Behind: f′ = f v/(v + vₛ)',
        'Fronts bunch up ahead (shorter wavelength, higher pitch) and spread out behind (lower pitch).',
      );
    else if (M < 1)
      out.push(
        `Ahead: f′ = f v/(v − vₛ) = ${sig(f)} × ${sig(v)}/(${sig(v)} − ${sig(vs)}) = ${sig(heard.ahead)} Hz`,
        `Behind: f′ = f v/(v + vₛ) = ${sig(f)} × ${sig(v)}/(${sig(v)} + ${sig(vs)}) = ${sig(heard.behind)} Hz`,
        'Fronts bunch up ahead (shorter wavelength, higher pitch) and spread out behind (lower pitch).',
      );
    else
      out.push(
        `vₛ/v = ${sig(vs)}/${sig(v)} = ${sig(M)}: the source keeps up with ${M > 1 ? 'and passes ' : ''}its own waves, and they pile into a shock wave (a sonic boom).`,
      );
    return out;
  }
}
