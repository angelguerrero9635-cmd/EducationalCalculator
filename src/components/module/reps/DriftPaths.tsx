/**
 * HC153 `driftPaths` (DriftPathsSpec in typesHe4e.ts): genetic drift. Twelve Wright–Fisher
 * populations' allele frequency p traced over the generations from one start (fixed seeds, so
 * the same Nₑ always draws the same paths), and on a second axis the expected heterozygosity
 * H₀(1 − 1 ÷ 2Nₑ)ᵗ dashed, H at generation t ringed. Flat; no handles.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { DriftPathsSpec } from '@/data/modules/typesHe4e';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { DRIFT_MAX_GENERATIONS, driftPaths, heterozygosity, pForH } from './he4eMath';

const n3 = (x: number) => formatNumber(Number(x.toPrecision(3)));
/** A whole number as a superscript: 100 → ¹⁰⁰. */
const sup = (n: number) =>
  [...String(Math.round(n))].map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)] ?? d).join('');

/** A round tick step for a span: 1, 2 or 5 × 10ⁿ, about `count` ticks. */
function niceStep(span: number, count: number) {
  const raw = span / count;
  const e = 10 ** Math.floor(Math.log10(raw));
  const m = raw / e;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * e;
}

export function DriftPaths({ spec, calc }: { spec: DriftPathsSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  type V = number | string | undefined;
  const known = (v: V) => v !== undefined && (typeof v === 'number' || rep.known(v));
  const get = (v: V): number | undefined =>
    !known(v) ? undefined : typeof v === 'number' ? v : rep.shown(v as string);
  const say = (v: V, x: number) => (typeof v === 'string' ? rep.value(v, false) : n3(x));
  const ne = get(spec.ne);
  const gens = get(spec.generations);
  const h0Given = get(spec.h0);
  const p0 = get(spec.p0) ?? (h0Given !== undefined ? pForH(h0Given) : 0.5);
  const h0 = h0Given ?? 2 * p0 * (1 - p0);
  const T = gens === undefined ? undefined : Math.min(DRIFT_MAX_GENERATIONS, Math.round(gens));
  const tMark = spec.t !== undefined ? get(spec.t) : T;
  const count = spec.populations ?? 12;
  const ok = ne !== undefined && ne >= 1 && T !== undefined && T >= 1;
  // Recomputed per render (the React compiler memoizes it): at most 12 × 1000 generations.
  const paths = ok ? driftPaths(ne, T, p0, count, spec.seed) : [];
  const ht = ok && tMark !== undefined ? heterozygosity(h0, ne!, tMark) : undefined;
  const tAt = tMark === undefined || T === undefined ? undefined : Math.min(T, Math.round(tMark));
  const ends = tAt === undefined ? [] : paths.map((p) => p[tAt]!);
  const fixed = ends.filter((p) => p >= 1).length;
  const lost = ends.filter((p) => p <= 0).length;

  const lines: string[] = [];
  if (!ok) lines.push('Type Nₑ and the generations to draw the populations.');
  else {
    lines.push(
      `${count} populations of Nₑ = ${say(spec.ne, ne!)}, each starting at p = ${n3(p0)}: by generation ${formatNumber(tAt!)}, ${fixed} fixed (p = 1), ${lost} lost (p = 0), ${count - fixed - lost} still varying.`,
    );
    if (ht !== undefined)
      lines.push(
        `Expected H (dashed): ${say(spec.h0, h0)} × (1 − 1 ÷ (2 × ${say(spec.ne, ne!)}))${sup(tMark!)} = ${spec.ht && known(spec.ht) ? rep.value(spec.ht, false) : n3(ht)}${spec.kept && known(spec.kept) ? `, ${rep.value(spec.kept)} of H₀ kept` : ''}.`,
      );
  }

  return (
    <View>
      <Canvas aspect={(w) => (Math.min(260, 0.6 * w) + 74) / w}>
        {({ w, h }) => {
          const L = 34;
          const R = 40;
          const top = 30;
          const ph = Math.min(260, 0.6 * w);
          const base = top + ph;
          const span = T ?? 100;
          const sx = (t: number) => L + (t / span) * (w - L - R);
          const sy = (p: number) => base - p * ph;
          const shy = (hh: number) => base - (hh / 0.5) * ph;
          const step = niceStep(span, Math.max(3, Math.floor((w - L - R) / 60)));
          const ticks: number[] = [];
          for (let t = 0; t <= span + 1e-9; t += step) ticks.push(t);
          const thin = Math.max(1, Math.ceil(span / 300));
          const pathOf = (p: number[]) => {
            let d = '';
            for (let i = 0; i < p.length; i += thin)
              d += `${d ? 'L' : 'M'}${sx(i).toFixed(1)},${sy(p[i]!).toFixed(1)}`;
            const last = p.length - 1;
            if (last % thin) d += `L${sx(last).toFixed(1)},${sy(p[last]!).toFixed(1)}`;
            return d;
          };
          const hPath = (() => {
            if (!ok) return '';
            let d = '';
            for (let i = 0; i <= 200; i++) {
              const t = (span * i) / 200;
              d += `${i ? 'L' : 'M'}${sx(t).toFixed(1)},${shy(heterozygosity(h0, ne!, t)).toFixed(1)}`;
            }
            return d;
          })();
          const htLabel =
            ht === undefined
              ? ''
              : `H = ${spec.ht && known(spec.ht) ? rep.value(spec.ht, false) : n3(ht)}`;
          return (
            <Svg width={w} height={h}>
              {/* Frame and grid: p on the left, H on the right (H = 0.5 at the top). */}
              {[0, 0.5, 1].map((p) => (
                <G key={`p${p}`}>
                  <Line
                    x1={L}
                    y1={sy(p)}
                    x2={w - R}
                    y2={sy(p)}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                  />
                  <ChartText x={L - 6} y={sy(p) + 4} textAnchor="end" fill={c.chartMuted}>
                    {formatNumber(p)}
                  </ChartText>
                  <ChartText x={w - R + 9} y={sy(p) + 4} fill={c.he4eDrift}>
                    {formatNumber(p / 2)}
                  </ChartText>
                </G>
              ))}
              <ChartText
                x={L - 6}
                y={top - 12}
                textAnchor="end"
                fontStyle="italic"
                fontWeight="700"
              >
                p
              </ChartText>
              <ChartText
                x={w - R + 6}
                y={top - 12}
                fontStyle="italic"
                fontWeight="700"
                fill={c.he4eDrift}
              >
                H
              </ChartText>
              <Line
                x1={L}
                y1={base}
                x2={w - R}
                y2={base}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              <Line
                x1={L}
                y1={top}
                x2={L}
                y2={base}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              {ticks.map((t) => (
                <G key={`t${t}`}>
                  <Line
                    x1={sx(t)}
                    y1={base}
                    x2={sx(t)}
                    y2={base + 5}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                  <ChartText
                    {...fitLabel(sx(t), formatNumber(t), chart.label, w)}
                    y={base + 18}
                    fill={c.chartMuted}
                  >
                    {formatNumber(t)}
                  </ChartText>
                </G>
              ))}
              <ChartText
                {...fitLabel((L + w - R) / 2, 'Generation t', chart.label, w)}
                y={base + 36}
                fill={c.chartMuted}
              >
                Generation t
              </ChartText>
              {/* The populations. */}
              {paths.map((p, i) => (
                <Path
                  key={`d${i}`}
                  d={pathOf(p)}
                  fill="none"
                  stroke={c.chartHighlight}
                  strokeOpacity={0.6}
                  strokeWidth={chart.strokeLight}
                  strokeLinejoin="round"
                />
              ))}
              {/* Expected H, dashed, and H at t ringed. */}
              {ok ? (
                <Path
                  d={hPath}
                  fill="none"
                  stroke={c.he4eDrift}
                  strokeWidth={chart.strokeHeavy}
                  strokeDasharray={chart.dash}
                />
              ) : null}
              {ht !== undefined && tAt !== undefined ? (
                <G>
                  <Line
                    x1={sx(tAt)}
                    y1={top}
                    x2={sx(tAt)}
                    y2={base}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                    strokeDasharray={chart.dashFine}
                  />
                  <Circle
                    cx={sx(tAt)}
                    cy={shy(ht)}
                    r={5}
                    fill={c.background}
                    stroke={c.he4eDrift}
                    strokeWidth={chart.stroke}
                  />
                  <ChartText
                    {...fitLabel(sx(tAt) - 8, htLabel, chart.label, w, 'end', 8)}
                    y={shy(ht) - 9}
                    fontWeight="700"
                    fill={c.he4eDrift}
                    halo
                  >
                    {htLabel}
                  </ChartText>
                </G>
              ) : null}
              {/* Key. */}
              <Line
                x1={L}
                y1={10}
                x2={L + 18}
                y2={10}
                stroke={c.chartHighlight}
                strokeWidth={chart.strokeLight}
              />
              <ChartText x={L + 22} y={14}>{`p in ${count} populations`}</ChartText>
              <Line
                x1={w - R - 104}
                y1={10}
                x2={w - R - 86}
                y2={10}
                stroke={c.he4eDrift}
                strokeWidth={chart.strokeHeavy}
                strokeDasharray={chart.dashFine}
              />
              <ChartText x={w - R - 82} y={14} fill={c.he4eDrift}>
                expected H
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
