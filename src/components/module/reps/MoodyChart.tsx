/**
 * HC165 `moodyChart` (MoodyChartSpec in typesHe4l.ts): the Moody chart computed in code, never
 * digitized. Log–log f against Re; the laminar line 64 ÷ Re; the transition band shaded; one
 * turbulent curve per relative roughness from Colebrook; the page's ε ÷ D curve lit and its
 * point ringed with guides to both axes. Flat; no handles.
 */
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { MoodyChartSpec } from '@/data/modules/typesHe4l';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { HeLabel } from './beamKit';
import { Canvas, Caption, ChartText } from './common';
import { useHe3iReader } from './he3iKit';
import {
  colebrookF,
  MOODY_CURVES,
  MOODY_F,
  MOODY_LAMINAR,
  MOODY_RE,
  MOODY_TURBULENT,
  moodyRegime,
} from './he4lMath';
import { usePaintIds } from './paint';

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (n: number) =>
  (n < 0 ? '⁻' : '') + [...String(Math.abs(n))].map((d) => SUP[Number(d)]).join('');
/** A relative roughness as the chart labels it: smooth, 10⁻⁵, 0.005, 0.00045. */
const ratioText = (r: number) => {
  if (r <= 0) return 'smooth';
  const e = Math.round(Math.log10(r));
  if (Math.abs(r / 10 ** e - 1) < 1e-9 && e <= -4) return `10${sup(e)}`;
  return formatNumber(Number(r.toPrecision(2)));
};

export function MoodyChart({ spec, calc }: { spec: MoodyChartSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useHe3iReader(calc);
  const ids = usePaintIds('clip');
  const k = (x: MoodyChartSpec['re'] | undefined) => x !== undefined && r.known(x);
  const re = k(spec.re) ? r.v(spec.re) : undefined;
  const rough = (() => {
    if (spec.roughness !== undefined) return k(spec.roughness) ? r.v(spec.roughness) : undefined;
    if (spec.epsilon === undefined || spec.diameter === undefined) return undefined;
    if (!k(spec.epsilon) || !k(spec.diameter)) return undefined;
    const D = r.si(spec.diameter, 'm');
    return D > 0 ? r.si(spec.epsilon, 'm') / D : undefined;
  })();
  const f = spec.f !== undefined && k(spec.f) ? r.v(spec.f) : undefined;
  const regime = re === undefined ? undefined : moodyRegime(re);
  // The f the lit curve (or the laminar line) gives at the page's Re.
  const fCurve =
    re === undefined
      ? undefined
      : regime === 'laminar'
        ? 64 / re
        : rough === undefined
          ? undefined
          : colebrookF(re, rough);
  const family = (spec.curves ?? MOODY_CURVES).filter(
    // A family curve within 15% of the lit one gives way to it.
    (x) =>
      rough === undefined ||
      (x === 0 ? rough > 2e-6 : Math.abs(Math.log(x / Math.max(rough, 1e-12))) > 0.14),
  );

  const lines: string[] = [];
  if (re === undefined) lines.push('Type the flow’s values to place its Re on the chart.');
  else {
    const reTag = `${r.symbol(spec.re, 'Re')} = ${r.text(spec.re, re)}`;
    if (regime === 'laminar')
      lines.push(
        `${reTag} is below 2300: laminar, so f = 64 ÷ Re${fCurve !== undefined ? ` = ${formatNumber(Number(fCurve.toPrecision(3)))}` : ''}, whatever the roughness.`,
      );
    else {
      lines.push(
        regime === 'transition'
          ? `${reTag} is in the transition band (2300 to 4000): the flow may be laminar or turbulent; Colebrook is the turbulent guess.`
          : `${reTag}: turbulent.`,
      );
      if (rough !== undefined)
        lines.push(
          spec.roughness !== undefined
            ? `ε ÷ D = ${r.text(spec.roughness, rough)}.`
            : `ε ÷ D = ${r.text(spec.epsilon, r.v(spec.epsilon))} ÷ ${r.text(spec.diameter, r.v(spec.diameter))} = ${ratioText(rough)}.`,
        );
      if (fCurve !== undefined)
        lines.push(
          `On that curve, Colebrook gives f = ${formatNumber(Number(fCurve.toPrecision(3)))} at this Re${f !== undefined ? ': the ringed point' : ''}.`,
        );
    }
  }
  lines.push('Every curve is computed from Colebrook, not read off a printed chart.');

  return (
    <View>
      <Canvas aspect={(w) => (Math.min(300, 0.8 * w) + 70) / w}>
        {({ w, h }) => {
          const L = 42;
          const R = 58;
          const top = 26;
          const ph = Math.min(300, 0.8 * w);
          const base = top + ph;
          const [x0, x1] = MOODY_RE.map(Math.log10) as [number, number];
          const [y0, y1] = MOODY_F.map(Math.log10) as [number, number];
          const sx = (x: number) => L + ((Math.log10(x) - x0) / (x1 - x0)) * (w - L - R);
          const sy = (y: number) => base - ((Math.log10(y) - y0) / (y1 - y0)) * ph;
          const curve = (rr: number) => {
            let d = '';
            for (let i = 0; i <= 120; i++) {
              const x =
                10 ** (Math.log10(MOODY_LAMINAR) + (i / 120) * (x1 - Math.log10(MOODY_LAMINAR)));
              d += `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(colebrookF(x, rr)).toFixed(1)}`;
            }
            return d;
          };
          const lamEnd = MOODY_LAMINAR;
          // Right-hand labels: each curve's ε ÷ D at its end, nudged apart (14 px at least).
          const ends = [
            ...family.map((x) => ({ r: x, lit: false })),
            ...(rough !== undefined ? [{ r: rough, lit: true }] : []),
          ]
            .map((e) => ({ ...e, y: sy(Math.max(MOODY_F[0], colebrookF(MOODY_RE[1], e.r))) }))
            .sort((a, b) => a.y - b.y);
          for (let i = 1; i < ends.length; i++)
            ends[i]!.y = Math.max(ends[i]!.y, ends[i - 1]!.y + 14);
          const over = ends.length ? ends[ends.length - 1]!.y - (base + 4) : 0;
          if (over > 0) for (const e of ends) e.y -= over;
          const xTicks = [3, 4, 5, 6, 7, 8];
          const yTicks = [0.006, 0.008, 0.01, 0.015, 0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.1];
          const yGrid = [0.007, 0.009, 0.025, 0.07, 0.09];
          const px =
            re !== undefined && re >= MOODY_RE[0] && re <= MOODY_RE[1] ? sx(re) : undefined;
          const fy = f !== undefined && f >= MOODY_F[0] && f <= MOODY_F[1] ? sy(f) : undefined;
          const cy =
            fCurve !== undefined && fCurve >= MOODY_F[0] && fCurve <= MOODY_F[1]
              ? sy(fCurve)
              : undefined;
          const fLabel = f !== undefined ? `${r.symbol(spec.f, 'f')} = ${r.text(spec.f, f)}` : '';
          return (
            <Svg width={w} height={h}>
              <Defs>
                <ClipPath id={ids.clip}>
                  <Rect x={L} y={top} width={w - L - R} height={ph} />
                </ClipPath>
              </Defs>
              {/* Grid: decades and their 2–9 marks across; f's round values up. */}
              {xTicks.flatMap((e) =>
                [1, 2, 3, 4, 5, 6, 7, 8, 9]
                  .filter((m) => e < 8 || m === 1)
                  .map((m) => (
                    <Line
                      key={`x${e}-${m}`}
                      x1={sx(m * 10 ** e)}
                      y1={top}
                      x2={sx(m * 10 ** e)}
                      y2={base}
                      stroke={c.chartGrid}
                      strokeWidth={m === 1 ? 1 : 0.5}
                    />
                  )),
              )}
              {[...yTicks, ...yGrid].map((y) => (
                <Line
                  key={`y${y}`}
                  x1={L}
                  y1={sy(y)}
                  x2={w - R}
                  y2={sy(y)}
                  stroke={c.chartGrid}
                  strokeWidth={yTicks.includes(y) ? 1 : 0.5}
                />
              ))}
              {/* The transition band, over the grid. */}
              <Rect
                x={sx(MOODY_LAMINAR)}
                y={top}
                width={sx(MOODY_TURBULENT) - sx(MOODY_LAMINAR)}
                height={ph}
                fill={c.he4lMoodyBand}
              />
              <Rect
                x={L}
                y={top}
                width={w - L - R}
                height={ph}
                fill="none"
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              {xTicks.map((e) => (
                <ChartText
                  key={`xl${e}`}
                  x={sx(10 ** e)}
                  y={base + 17}
                  textAnchor="middle"
                  fill={c.chartMuted}
                >
                  {`10${sup(e)}`}
                </ChartText>
              ))}
              <ChartText x={(L + w - R) / 2} y={base + 36} textAnchor="middle" fill={c.chartMuted}>
                Reynolds number Re
              </ChartText>
              {yTicks
                .filter((y) => y !== 0.006)
                .map((y) => (
                  <ChartText
                    key={`yl${y}`}
                    x={L - 5}
                    y={sy(y) + 4}
                    textAnchor="end"
                    fill={c.chartMuted}
                  >
                    {formatNumber(y)}
                  </ChartText>
                ))}
              <ChartText
                x={L - 5}
                y={top - 10}
                textAnchor="end"
                fontStyle="italic"
                fontWeight="700"
              >
                f
              </ChartText>
              <ChartText x={w - R + 6} y={top - 10} fontWeight="700" fill={c.chartMuted}>
                ε ÷ D
              </ChartText>
              <G clipPath={`url(#${ids.clip})`}>
                {/* Laminar: 64 ÷ Re up to 2300, faint on into the band. */}
                <Line
                  x1={sx(MOODY_RE[0])}
                  y1={sy(64 / MOODY_RE[0])}
                  x2={sx(lamEnd)}
                  y2={sy(64 / lamEnd)}
                  stroke={regime === 'laminar' ? c.chartHighlight : c.chartInk}
                  strokeWidth={regime === 'laminar' ? chart.strokeHeavy : chart.stroke}
                />
                <Line
                  x1={sx(lamEnd)}
                  y1={sy(64 / lamEnd)}
                  x2={sx(MOODY_TURBULENT)}
                  y2={sy(64 / MOODY_TURBULENT)}
                  stroke={c.chartMuted}
                  strokeWidth={1}
                  strokeDasharray={chart.dashFine}
                />
                {family.map((x) => (
                  <Path
                    key={`c${x}`}
                    d={curve(x)}
                    fill="none"
                    stroke={c.chartInk}
                    strokeOpacity={0.7}
                    strokeWidth={x === 0 ? chart.stroke : chart.strokeLight}
                    strokeDasharray={x === 0 ? chart.dash : undefined}
                  />
                ))}
                {rough !== undefined ? (
                  <Path
                    d={curve(rough)}
                    fill="none"
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                    opacity={regime === 'laminar' ? 0.45 : 1}
                  />
                ) : null}
                {/* The page's Re: a guide up to the point (or to the lit curve). */}
                {px !== undefined && (fy ?? cy) !== undefined ? (
                  <G>
                    <Line
                      x1={px}
                      y1={base}
                      x2={px}
                      y2={(fy ?? cy)!}
                      stroke={c.he4lMoodyPoint}
                      strokeWidth={1.2}
                      strokeDasharray={chart.dashFine}
                    />
                    {fy !== undefined ? (
                      <Line
                        x1={L}
                        y1={fy}
                        x2={px}
                        y2={fy}
                        stroke={c.he4lMoodyPoint}
                        strokeWidth={1.2}
                        strokeDasharray={chart.dashFine}
                      />
                    ) : null}
                  </G>
                ) : null}
              </G>
              {/* The laminar line's name, under it in the empty corner, with a leader. */}
              <Line
                x1={L + 22}
                y1={sy(0.012) - 13}
                x2={sx(1700)}
                y2={sy(64 / 1700) + 4}
                stroke={c.chartMuted}
                strokeWidth={1}
              />
              <ChartText x={L + 3} y={sy(0.012)} fill={c.chartMuted} halo>
                64 ÷ Re
              </ChartText>
              <ChartText
                x={(sx(MOODY_LAMINAR) + sx(MOODY_TURBULENT)) / 2 + 4}
                y={base - 8}
                fill={c.chartMuted}
                transform={`rotate(-90 ${(sx(MOODY_LAMINAR) + sx(MOODY_TURBULENT)) / 2 + 4} ${base - 8})`}
              >
                transition
              </ChartText>
              {ends.map((e) => (
                <ChartText
                  key={`e${e.r}`}
                  x={w - R + 5}
                  y={e.y + 4}
                  fontWeight={e.lit ? '700' : '400'}
                  fill={e.lit ? c.chartHighlight : c.chartMuted}
                >
                  {ratioText(e.r)}
                </ChartText>
              ))}
              {px !== undefined && fy !== undefined ? (
                <G>
                  <Circle
                    cx={px}
                    cy={fy}
                    r={5.5}
                    fill={c.background}
                    stroke={c.he4lMoodyPoint}
                    strokeWidth={chart.stroke}
                  />
                  <HeLabel
                    x={px + (px > (L + w - R) / 2 ? -10 : 10)}
                    y={fy - 10}
                    anchor={px > (L + w - R) / 2 ? 'end' : 'start'}
                    text={fLabel}
                    color={c.he4lMoodyPoint}
                    w={w - R}
                  />
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
