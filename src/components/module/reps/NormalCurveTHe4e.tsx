/**
 * HC114 (`normalCurve` `family: 't'`, NormalCurveHe4e in typesHe4e.ts): the t curve for n − 1
 * degrees of freedom over the dashed normal, the middle level between ±t⋆ shaded with its area,
 * an observed t, and under the t axis a value axis lined up with it: the confidence interval
 * x̄ ± t⋆s ÷ √n bracketed (and μ for a t-test). Flat; no handles (the values have their boxes).
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { NormalCurveSpec } from '@/data/modules/typesHsb';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { halfWidth, tCritical, tMiddle, tWindow } from './he4eMath';
import { phi, tPdf } from './statMath';

/** A number to 4 significant figures, a true minus sign. */
const n4 = (x: number) => formatNumber(Number(x.toPrecision(4)));
/** A t value to 3 decimals. */
const t3 = (x: number) => formatNumber(Number(x.toFixed(3)));

export function NormalCurveTHe4e({ spec, calc }: { spec: NormalCurveSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  type V = number | string | undefined;
  const known = (v: V) => v !== undefined && (typeof v === 'number' || rep.known(v));
  /** A value in its shown unit, or nothing for a "?" or a field left out. */
  const get = (v: V): number | undefined =>
    !known(v) ? undefined : typeof v === 'number' ? v : rep.shown(v as string);
  /** A value as the page shows it (its own figures), or the number to 4 figures. */
  const say = (v: V, x: number) => (typeof v === 'string' ? rep.value(v, false) : n4(x));
  const level = spec.level ?? 0.95;
  const pct = `${formatNumber(Number((level * 100).toFixed(2)))}%`;
  const b = spec.bracket;
  const n = get(b?.n);
  const df = spec.df !== undefined ? get(spec.df) : n !== undefined ? n - 1 : undefined;
  const dfOk = df !== undefined && df >= 1;
  const tS = spec.tStar !== undefined ? get(spec.tStar) : dfOk ? tCritical(level, df) : undefined;
  const area = tS !== undefined && dfOk ? tMiddle(tS, df) : undefined;
  const mean = get(b?.mean);
  const s = get(b?.s);
  const mu = b?.mu !== undefined ? get(b.mu) : undefined;
  const test = b?.mu !== undefined;
  const se = s !== undefined && n !== undefined && n > 0 && s > 0 ? s / Math.sqrt(n) : undefined;
  const half = tS !== undefined && se !== undefined ? halfWidth(tS, s!, n!) : undefined;
  // The observed t, on x̄'s side of μ when both are known.
  const obsAbs = get(spec.observed);
  const side = mean !== undefined && mu !== undefined && mean < mu ? -1 : 1;
  const tObs = obsAbs !== undefined ? side * Math.abs(obsAbs) : undefined;
  // The value axis is centered at x̄ (an interval) or μ (a test), one t unit = s ÷ √n.
  const center = test ? mu : mean;
  const valueAxis = !!b && center !== undefined && se !== undefined;
  // A test's bracket (around x̄, at the observed t) must fit too.
  const H = Math.max(
    tWindow(tS, tObs),
    test && tObs !== undefined && tS !== undefined ? Math.min(14, (Math.abs(tObs) + tS) * 1.06) : 0,
  );

  // ── Caption ──
  const lines: string[] = [];
  if (dfOk)
    lines.push(
      `t curve with df = ${formatNumber(df)} (solid) over the normal (dashed): ${
        df >= 30 ? 'nearly the same' : 'lower in the middle, heavier in the tails'
      }.`,
    );
  else lines.push(b ? 'Type n to draw the t curve (df = n − 1).' : 'Type df to draw the t curve.');
  if (tS !== undefined && area !== undefined)
    lines.push(
      `The middle ${area.toFixed(4)} lies between t = −${t3(tS)} and ${t3(tS)}${
        Math.abs(area - level) <= 0.001 ? `: t⋆ = ${t3(tS)} for ${pct}` : `, not ${pct}`
      }.`,
    );
  if (b && half !== undefined && mean !== undefined)
    lines.push(
      `x̄ ± t⋆s ÷ √n = ${say(b.mean, mean)} ± ${t3(tS!)} × ${say(b.s, s!)} ÷ √${formatNumber(n!)} = ${say(b.mean, mean)} ± ${b.half && known(b.half) ? rep.value(b.half, false) : n4(half)}.`,
      `The interval runs from ${b.lower && known(b.lower) ? rep.value(b.lower, false) : n4(mean - half)} to ${b.upper && known(b.upper) ? rep.value(b.upper, false) : n4(mean + half)}.`,
    );
  else if (b) lines.push('Type x̄, s, n and t⋆ to draw the interval.');
  if (test && tObs !== undefined && tS !== undefined && mu !== undefined && b) {
    const inside = Math.abs(tObs) < tS;
    lines.push(
      `t = ${say(spec.observed, Math.abs(tObs))} ${inside ? '<' : '>'} t⋆ = ${t3(tS)}: μ = ${say(b.mu, mu)} is ${inside ? 'inside' : 'outside'} the interval, ${inside ? 'no significant difference' : 'a significant difference'} at ${pct}.`,
    );
  }

  // ── Layout ──
  const T = 30;
  const curveH = (w: number) => Math.min(190, 0.4 * w);
  const below = valueAxis || b ? 112 : 34;

  return (
    <View>
      <Canvas aspect={(w) => (T + curveH(w) + below) / w}>
        {({ w, h }) => {
          const L = 20;
          const R = 20;
          const axisY = T + curveH(w);
          const ux = (w - L - R) / (2 * H);
          const sx = (t: number) => L + (t + H) * ux;
          const top = Math.max(phi(0), dfOk ? tPdf(0, df) : 0);
          const uy = (curveH(w) - 6) / top;
          const sy = (y: number) => axisY - y * uy;
          const f = (t: number) => (dfOk ? tPdf(t, df) : 0);
          const pathOf = (g: (t: number) => number, a = -H, z = H, closed = false) => {
            const k = Math.max(2, Math.ceil((300 * (z - a)) / (2 * H)));
            let d = closed ? `M${sx(a).toFixed(2)},${axisY}L` : 'M';
            for (let i = 0; i <= k; i++) {
              const t = a + ((z - a) * i) / k;
              d += `${i ? 'L' : ''}${sx(t).toFixed(2)},${sy(g(t)).toFixed(2)}`;
            }
            return closed ? `${d}L${sx(z).toFixed(2)},${axisY}Z` : d;
          };
          // t ticks: whole numbers, every 1, 2 or 5 as they fit.
          const step = ux >= 24 ? 1 : ux * 2 >= 24 ? 2 : 5;
          const ticks: number[] = [];
          for (let k = -Math.floor(H / step) * step; k <= H + 1e-9; k += step) ticks.push(k);
          const vY = axisY + 62;
          const sv = (x: number) => sx((x - center!) / se!);
          const lo = mean !== undefined && half !== undefined ? mean - half : undefined;
          const hi = mean !== undefined && half !== undefined ? mean + half : undefined;
          const loText =
            lo === undefined ? '' : b?.lower && known(b.lower) ? rep.value(b.lower, false) : n4(lo);
          const hiText =
            hi === undefined ? '' : b?.upper && known(b.upper) ? rep.value(b.upper, false) : n4(hi);
          const meanText = mean === undefined ? '' : `x̄ = ${say(b!.mean, mean)}`;
          const muText = mu === undefined ? '' : `μ = ${say(b!.mu, mu)}`;
          // μ's label above x̄'s when the two would touch.
          const wOf = (t: string) => t.length * chart.label * 0.58;
          const muRaised =
            test &&
            valueAxis &&
            mean !== undefined &&
            Math.abs(sv(mean) - sv(mu!)) < (wOf(meanText) + wOf(muText)) / 2 + 8;
          const starText = tS === undefined ? '' : `t⋆ = ${t3(tS)}`;
          return (
            <Svg width={w} height={h}>
              {/* The middle level shaded, the tails left plain; the curves over it. */}
              {dfOk && tS !== undefined ? (
                <Path
                  d={pathOf(f, -Math.min(tS, H), Math.min(tS, H), true)}
                  fill={c.chartHighlight}
                  fillOpacity={0.28}
                />
              ) : null}
              <Path
                d={pathOf(phi)}
                fill="none"
                stroke={c.chartMuted}
                strokeWidth={chart.strokeLight}
                strokeDasharray={chart.dash}
              />
              {dfOk ? (
                <Path d={pathOf(f)} fill="none" stroke={c.chartInk} strokeWidth={chart.stroke} />
              ) : null}
              {/* ±t⋆: lines from the axis to above the curve, the value over the right one. */}
              {dfOk && tS !== undefined && tS <= H
                ? [-tS, tS].map((t) => (
                    <Line
                      key={`s${t}`}
                      x1={sx(t)}
                      y1={axisY}
                      x2={sx(t)}
                      y2={T - 6}
                      stroke={c.normalReject}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={chart.dashFine}
                    />
                  ))
                : null}
              {dfOk && tS !== undefined && tS <= H ? (
                <G>
                  <ChartText
                    {...fitLabel(sx(tS) + 4, starText, chart.label, w, 'start')}
                    y={T - 12}
                    fontWeight="700"
                  >
                    {starText}
                  </ChartText>
                  <ChartText
                    {...fitLabel(sx(-tS) - 4, `−${t3(tS)}`, chart.label, w, 'end')}
                    y={T - 12}
                    fontWeight="700"
                  >
                    {`−${t3(tS)}`}
                  </ChartText>
                </G>
              ) : null}
              {area !== undefined && dfOk ? (
                <ChartText
                  x={sx(0)}
                  y={axisY - Math.max(28, (axisY - sy(f(0))) * 0.35)}
                  fontSize={chart.value}
                  fontWeight="700"
                  textAnchor="middle"
                  halo
                >
                  {area.toFixed(4)}
                </ChartText>
              ) : null}
              {/* The observed t: a line up past the curve, its value at the top. */}
              {tObs !== undefined && Math.abs(tObs) <= H && dfOk ? (
                <G>
                  <Line
                    x1={sx(tObs)}
                    y1={axisY}
                    x2={sx(tObs)}
                    y2={sy(f(tObs)) - 12}
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                  />
                  <Circle cx={sx(tObs)} cy={sy(f(tObs))} r={3.5} fill={c.chartInk} />
                  <ChartText
                    {...fitLabel(sx(tObs), `t = ${t3(tObs)}`, chart.label, w)}
                    y={sy(f(tObs)) - 17}
                    fontWeight="700"
                    halo
                  >
                    {`t = ${t3(tObs)}`}
                  </ChartText>
                </G>
              ) : null}
              {/* The t axis. */}
              <Line
                x1={L - 8}
                y1={axisY}
                x2={w - R + 8}
                y2={axisY}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              {ticks.map((t) => (
                <G key={`t${t}`}>
                  <Line
                    x1={sx(t)}
                    y1={axisY}
                    x2={sx(t)}
                    y2={axisY + 5}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                  <ChartText x={sx(t)} y={axisY + 18} textAnchor="middle" fill={c.chartMuted}>
                    {formatNumber(t)}
                  </ChartText>
                </G>
              ))}
              <ChartText
                x={2}
                y={axisY + 18}
                fill={c.chartMuted}
                fontStyle="italic"
                fontWeight="700"
              >
                t
              </ChartText>
              {/* The value axis, lined up with t: the interval bracketed, x̄ and μ. */}
              {valueAxis ? (
                <G>
                  <Line
                    x1={L - 8}
                    y1={vY}
                    x2={w - R + 8}
                    y2={vY}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                  {/* Guides: ±t⋆ down to the ends (an interval), or the observed t down to x̄. */}
                  {(test
                    ? tObs !== undefined && mean !== undefined
                      ? [tObs]
                      : []
                    : tS !== undefined && tS <= H
                      ? [-tS, tS]
                      : []
                  ).map((t) => (
                    <Line
                      key={`g${t}`}
                      x1={sx(t)}
                      y1={axisY + 24}
                      x2={sx(t)}
                      y2={vY - (test ? 22 : 0)}
                      stroke={c.chartMuted}
                      strokeWidth={1}
                      strokeDasharray={chart.dashFine}
                    />
                  ))}
                  {lo !== undefined && hi !== undefined ? (
                    <G>
                      <Path
                        d={`M${sv(lo)},${vY + 4}V${vY + 12}H${sv(hi)}V${vY + 4}`}
                        fill="none"
                        stroke={c.chartHighlight}
                        strokeWidth={chart.strokeHeavy}
                        strokeLinejoin="round"
                      />
                      <ChartText
                        {...fitLabel(sv(lo), loText, chart.label, w)}
                        y={vY + 28}
                        fontWeight="700"
                      >
                        {loText}
                      </ChartText>
                      <ChartText
                        {...fitLabel(sv(hi), hiText, chart.label, w)}
                        y={vY + 28}
                        fontWeight="700"
                      >
                        {hiText}
                      </ChartText>
                    </G>
                  ) : null}
                  {mean !== undefined ? (
                    <G>
                      <Circle cx={sv(mean)} cy={vY} r={4} fill={c.chartInk} />
                      <ChartText
                        {...fitLabel(sv(mean), meanText, chart.label, w)}
                        y={vY - 8}
                        fontWeight="700"
                        halo
                      >
                        {meanText}
                      </ChartText>
                    </G>
                  ) : null}
                  {test && mu !== undefined ? (
                    <G>
                      <Path
                        d={`M${sv(mu)},${vY - 5}L${sv(mu) + 5},${vY}L${sv(mu)},${vY + 5}L${sv(mu) - 5},${vY}Z`}
                        fill={c.normalReject}
                      />
                      <ChartText
                        {...fitLabel(sv(mu), muText, chart.label, w)}
                        y={muRaised ? vY - 24 : vY - 8}
                        fill={c.normalReject}
                        fontWeight="700"
                        halo
                      >
                        {muText}
                      </ChartText>
                    </G>
                  ) : null}
                  {b?.axis ? (
                    <ChartText
                      {...fitLabel(w / 2, b.axis, chart.label, w)}
                      y={vY + 46}
                      fill={c.chartMuted}
                    >
                      {b.axis}
                    </ChartText>
                  ) : null}
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
