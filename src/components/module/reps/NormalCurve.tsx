import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { NormalCurveSpec } from '@/data/modules/typesHsb';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { chiStep, normalModel, type Span } from './normalModel';
import { tailWords } from './signBox';
import { tCurveWords } from './tCurve';
import { normalArea, zStar } from './statMath';
import { usePaintIds } from './paint';

/** A probability to 4 decimals ("< 0.0001" for a tail too thin to show). */
export const prob4 = (p: number) =>
  p > 0 && p < 0.00005 ? '< 0.0001' : p < 1 && p > 0.99995 ? '> 0.9999' : p.toFixed(4);

/** A value on the axis: at most 4 decimals, a true minus sign. */
const num = (x: number) => formatNumber(Number(x.toFixed(4)));

/**
 * A normal curve (or a chi-square curve) with its shaded areas written to 4 decimals, an x axis
 * at μ + kσ and a z axis under it, and the 68–95–99.7 bands, a sampling curve, a confidence
 * interval, a stack of simulated intervals or a test's rejection region as the spec asks.
 * Flat and exact: the curve is sampled densely, the shading follows it, and the areas come from
 * the CDF (the harness integrates the drawn regions to check them).
 */
export function NormalCurve({ spec, calc }: { spec: NormalCurveSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('clip');
  const start = useRef(0);
  /** A fixed number or a variable's shown value; `known` false for a "?". */
  const get = (v: number | string | undefined) =>
    v === undefined ? undefined : typeof v === 'number' ? v : rep.shown(v);
  const known = (v: number | string | undefined) => typeof v !== 'string' || rep.known(v);
  const model = normalModel(spec, get);
  const frozen = useFrozen({ window: model.window });
  const [x0, x1] = frozen.value.window;
  const chi = model.df !== undefined;
  const standard = !chi && spec.mean === undefined && spec.sd === undefined;
  const mu = model.pop?.m ?? model.m;
  const sigma = model.pop?.s ?? model.s;
  const curveKnown =
    !model.problem && known(spec.mean) && known(spec.sd) && known(spec.chiSquare?.df);
  const sym = (v: number | string | undefined, fallback: string) =>
    typeof v === 'string' ? rep.variable(v).symbol : fallback;
  const X = spec.sample ? 'X̄' : chi ? 'χ²' : 'X';
  /** H99: the standardized axis's letter, t on a t curve. */
  const Z = model.t !== undefined ? 't' : 'z';

  // ── Caption ──
  const lines: string[] = [];
  if (!model.problem && model.t !== undefined) lines.push(tCurveWords(model.t));
  if (model.problem) lines.push(`${model.problem} The curve can’t be drawn.`);
  else if (chi) {
    lines.push(`Chi-square curve with df = ${model.df}.`);
  } else if (!standard) {
    const spread = sym(spec.sd, 'σ');
    lines.push(
      spread === 'σ'
        ? `${spec.sample ? 'The population is' : 'X is'} normal with ${sym(spec.mean, 'μ')} = ${val(spec.mean, mu)} and σ = ${val(spec.sd, sigma)}.`
        : `The curve is centered at ${sym(spec.mean, 'μ')} = ${val(spec.mean, mu)} with standard error ${spread} = ${val(spec.sd, sigma)}.`,
    );
  }
  if (spec.sample && model.pop) {
    const n = get(spec.sample.n)!;
    lines.push(
      `Means of samples of ${sym(spec.sample.n, 'n')} = ${num(n)}: σ/√n = ${num(sigma)}/√${num(n)} = ${num(model.s)}.`,
    );
  }
  const areaText = (regions: Span[]) =>
    regions
      .map(([a, b]) =>
        a === -Infinity && b === Infinity
          ? `all of ${X}`
          : a === -Infinity
            ? `${X} ≤ ${num(b)}`
            : b === Infinity
              ? `${X} ≥ ${num(a)}`
              : `${num(a)} ≤ ${X} ≤ ${num(b)}`,
      )
      .join(' or ');
  if (!chi && model.area !== undefined && spec.shade && !model.problem) {
    const shownKnown =
      !spec.shade || (known(spec.shade.from) && known(spec.shade.to) && curveKnown);
    lines.push(
      shownKnown
        ? `P(${areaText(model.regions)}) = ${prob4(model.area)}.`
        : 'Type the values to find the shaded area.',
    );
  }
  if (spec.mark && rep.known(spec.mark.x) && curveKnown) {
    const x = rep.shown(spec.mark.x);
    const z = (x - model.m) / model.s;
    lines.push(
      `${rep.variable(spec.mark.x).symbol} = ${num(x)} is ${num(Math.abs(z))} standard deviations ${z >= 0 ? 'above' : 'below'} the mean: z = ${num(z)}.`,
    );
  }
  if (spec.bands && !chi) {
    lines.push(
      `Within 1σ: ${prob4(normalArea(-1, 1, 0, 1))}; within 2σ: ${prob4(normalArea(-2, 2, 0, 1))}; within 3σ: ${prob4(normalArea(-3, 3, 0, 1))}.`,
      'The 68–95–99.7 rule rounds these.',
    );
  }
  if (spec.interval) {
    const ce = get(spec.interval.center);
    const e = get(spec.interval.margin);
    if (
      ce !== undefined &&
      e !== undefined &&
      known(spec.interval.center) &&
      known(spec.interval.margin)
    )
      lines.push(
        `Interval: ${num(ce)} ± ${num(e)}, from ${num(ce - e)} to ${num(ce + e)}${model.area !== undefined && !spec.shade ? `, the middle ${prob4(model.area)} of the curve` : ''}.`,
      );
    else lines.push('Type the estimate and the margin of error to draw the interval.');
  }
  if (spec.intervals && model.intervals) {
    const hits = model.intervals.filter((i) => i.hit).length;
    const n = model.intervals.length;
    const level = get(spec.intervals.level)!;
    const ns = get(spec.intervals.n)!;
    lines.push(
      `Each interval is x̄ ± ${num(zStar(level))} × ${num(sigma)}, with SE = ${num(sigma * Math.sqrt(ns))}/√${num(ns)} = ${num(sigma)}.`,
      `${hits} of ${n} intervals capture μ = ${num(mu)} (${formatNumber(Math.round((1000 * hits) / n) / 10)}%). The red ones miss it.`,
      `At ${formatNumber(Number((level * 100).toFixed(2)))}% confidence, about ${formatNumber(Number((level * n).toFixed(1)))} of ${n} would.`,
    );
  }
  const decision = (p: number, alpha: number | undefined) =>
    alpha === undefined
      ? ''
      : p <= alpha
        ? ` ≤ α = ${num(alpha)}: reject H₀.`
        : ` > α = ${num(alpha)}: fail to reject H₀.`;
  if (spec.test && typeof spec.test.tail === 'object')
    lines.push(tailWords(spec.test.tail, (id) => (rep.known(id) ? rep.shown(id) : undefined)));
  if (spec.test && !model.problem) {
    const z = get(spec.test.stat);
    const alpha = get(spec.test.alpha);
    const zc = model.critical?.map((x) => (x - model.m) / model.s);
    if (zc)
      lines.push(
        `Red: the rejection region, area α = ${num(alpha!)}, past ${Z} = ${zc.map(num).join(` and ${Z} = `)}.`,
      );
    if (z !== undefined && model.pValue !== undefined && known(spec.test.stat))
      lines.push(
        `Test statistic ${Z} = ${num(z)}. Amber: the p-value, ${prob4(model.pValue)}${decision(model.pValue, alpha)}`,
      );
  }
  if (chi && !model.problem) {
    const alpha = get(spec.chiSquare!.alpha);
    if (model.critical)
      lines.push(`Critical value at α = ${num(alpha!)}: χ² = ${num(model.critical[0]!)}.`);
    if (model.stat !== undefined && model.pValue !== undefined && known(spec.chiSquare!.stat))
      lines.push(
        `${sym(spec.chiSquare!.stat, 'χ²')} = ${num(model.stat)}: p = P(χ² ≥ ${num(model.stat)}) = ${prob4(model.pValue)}${decision(model.pValue, alpha)}`,
      );
  }

  function val(v: number | string | undefined, fallback: number) {
    return typeof v === 'string' ? rep.value(v) : num(v ?? fallback);
  }

  // ── Layout ──
  const showX = !standard;
  const showZ = !chi;
  const rows = {
    labels: (showX ? 18 : 0) + (showZ ? 18 : 0),
    name: spec.axis || chi ? 18 : 0,
    key: model.reject?.length || model.pRegions?.length ? 22 : 0,
    bands: spec.bands && !chi ? 3 * 18 + 4 : 0,
    interval: spec.interval ? 30 : 0,
  };
  const stackCount = model.intervals?.length ?? 0;
  const rowH = stackCount ? Math.max(3, Math.min(8, 300 / stackCount)) : 0;
  const stackH = stackCount ? stackCount * rowH + 26 : 0;
  const T = 30;
  const curveH = (w: number) => (stackCount ? 0.34 : 0.46) * w;
  const below = rows.labels + rows.name + rows.key + rows.bands + rows.interval + stackH + 8;

  // Handles: shaded ends, the mark, the statistics (variables only).
  type Handle = { id: string; x: number; toValue: (x: number) => number; label: string };
  const handles: Handle[] = [];
  if (!spec.fixed && !model.problem) {
    const add = (v: number | string | undefined, label: string) => {
      if (typeof v !== 'string' || !rep.known(v) || handles.some((h) => h.id === v)) return;
      handles.push({ id: v, x: rep.shown(v), toValue: (x) => x, label });
    };
    if (spec.shade) {
      add(spec.shade.from, 'where the shading starts');
      add(spec.shade.to, 'where the shading ends');
    }
    if (spec.mark) add(spec.mark.x, 'the value');
    if (spec.test && typeof spec.test.stat === 'string' && rep.known(spec.test.stat)) {
      handles.push({
        id: spec.test.stat,
        x: model.m + rep.shown(spec.test.stat) * model.s,
        toValue: (x) => (x - model.m) / model.s,
        label: 'the test statistic',
      });
    }
    if (chi) add(spec.chiSquare!.stat, 'the chi-square statistic');
  }
  const keep =
    spec.keep ??
    [
      spec.mean,
      spec.sd,
      spec.sample?.n,
      spec.intervals?.n,
      spec.intervals?.level,
      spec.interval?.level,
      spec.test?.alpha,
      spec.chiSquare?.df,
      spec.chiSquare?.alpha,
      spec.shade?.from,
      spec.shade?.to,
    ].filter((v): v is string => typeof v === 'string');

  return (
    <View>
      <Canvas aspect={(w) => (T + curveH(w) + below) / w}>
        {({ w, h }) => {
          const L = 18;
          const R = 18;
          const axisY = T + curveH(w);
          const ux = (w - L - R) / (x1 - x0);
          const sx = (x: number) => L + (x - x0) * ux;
          // Height: the curve's peak (or, for a chi-square curve, its peak past the first sliver).
          let top = 0;
          for (let i = 0; i <= 200; i++) {
            const x = x0 + ((x1 - x0) * i) / 200;
            if (chi && x < (x1 - x0) * 0.03) continue;
            top = Math.max(top, model.pdf(x), model.pop ? normalPdfPop(x) : 0);
          }
          function normalPdfPop(x: number) {
            const p = model.pop!;
            return Math.exp(-0.5 * ((x - p.m) / p.s) ** 2) / (p.s * Math.sqrt(2 * Math.PI));
          }
          const uy = (curveH(w) - 6) / (top || 1);
          const sy = (y: number) => axisY - y * uy;
          const N = 360;
          const pathOf = (f: (x: number) => number, a = x0, b = x1, closed = false) => {
            const lo = Math.max(a, x0);
            const hi = Math.min(b, x1);
            if (!(hi > lo)) return '';
            const k = Math.max(2, Math.ceil((N * (hi - lo)) / (x1 - x0)));
            let d = closed ? `M${sx(lo)},${axisY}L` : 'M';
            for (let i = 0; i <= k; i++) {
              const x = lo + ((hi - lo) * i) / k;
              d += `${i ? 'L' : ''}${sx(x).toFixed(2)},${Math.max(-50, sy(f(x))).toFixed(2)}`;
            }
            return closed ? `${d}L${sx(hi)},${axisY}Z` : d;
          };
          const op = curveKnown ? 1 : 0.35;
          const shadeKnown =
            !spec.shade || (known(spec.shade.from) && known(spec.shade.to) && curveKnown);
          const region = (s: Span, fill: string, opacity: number, key: string) => (
            <Path
              key={key}
              d={pathOf(model.pdf, s[0], s[1], true)}
              fill={fill}
              fillOpacity={opacity}
            />
          );
          // Tick values: μ + kσ (population σ), or the chi-square axis in round steps.
          const ticks: { x: number; k: number; top: string; z?: string }[] = [];
          if (chi) {
            const step = chiStep(x1);
            for (let k = 0; k * step <= x1 + 1e-9; k++)
              ticks.push({ x: k * step, k, top: num(k * step) });
          } else {
            for (let k = Math.ceil((x0 - mu) / sigma); k <= Math.floor((x1 - mu) / sigma); k++) {
              const x = mu + k * sigma;
              ticks.push({ x, k, top: num(x), z: spec.sample ? undefined : num(k) });
            }
          }
          const widest = Math.max(...ticks.map((t) => t.top.length)) * chart.label * 0.6;
          const spacing = ticks.length > 1 ? sx(ticks[1]!.x) - sx(ticks[0]!.x) : w;
          const every = spacing >= widest + 6 ? 1 : spacing * 2 >= widest + 6 ? 2 : 3;
          // Sampling mode: the z axis is the sampling curve's, at μ + k σ/√n where it fits.
          const zTicks: { x: number; z: string }[] = [];
          if (spec.sample && !chi) {
            const zs = model.s * ux;
            const zStep = zs >= 22 ? 1 : zs * 2 >= 22 ? 2 : 3;
            for (let k = -3; k <= 3; k += zStep)
              zTicks.push({ x: model.m + k * model.s, z: num(k) });
          } else ticks.forEach((t) => t.z && zTicks.push({ x: t.x, z: t.z }));
          const labelsY = axisY + 16;
          const zY = labelsY + (showX ? 18 : 0);
          const nameY = axisY + rows.labels + 14;
          const keyY = axisY + rows.labels + rows.name + 16;
          const bandsY = axisY + rows.labels + rows.name + rows.key + 16;
          const intervalY = bandsY + rows.bands + (rows.interval ? 6 : 0);
          const stackY =
            axisY + rows.labels + rows.name + rows.key + rows.bands + rows.interval + 14;
          const bandShade = [0.14, 0.24, 0.36];
          const areaLabel = (() => {
            if (!model.regions.length || model.area === undefined || chi || spec.intervals)
              return null;
            // One label over the widest visible piece.
            const vis = model.regions
              .map(([a, b]) => [Math.max(a, x0), Math.min(b, x1)] as const)
              .filter(([a, b]) => b > a);
            if (!vis.length) return null;
            const [a, b] = vis.reduce((p, q) => (q[1] - q[0] > p[1] - p[0] ? q : p));
            const xc = (a + b) / 2;
            const text = shadeKnown ? prob4(model.area) : '?';
            // Inside a wide, tall region; otherwise above the curve with a leader down to it,
            // clear of the handles (which sit 20 px above the axis).
            const rise = axisY - sy(model.pdf(xc));
            const inside = sx(b) - sx(a) > 64 && rise > 70;
            const y = inside
              ? axisY - Math.max(46, rise * 0.45)
              : Math.max(16, Math.min(sy(model.pdf(xc)) - 10, axisY - 46));
            const leader = inside ? undefined : { x: sx(xc), y1: y + 5, y2: axisY - 2 };
            return { ...fitLabel(sx(xc), text, chart.value, w), y, text, leader };
          })();
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <ClipPath id={ids.clip}>
                    <Rect x={0} y={4} width={w} height={axisY - 4} />
                  </ClipPath>
                </Defs>
                <G clipPath={`url(#${ids.clip})`} opacity={op}>
                  {/* The 68–95–99.7 bands, nested, darker toward the middle. */}
                  {spec.bands && !chi
                    ? [3, 2, 1].map((k, i) =>
                        region(
                          [mu - k * sigma, mu + k * sigma],
                          c.chartHighlight,
                          bandShade[i]!,
                          `b${k}`,
                        ),
                      )
                    : null}
                  {model.regions.map((s, i) =>
                    region(s, c.chartHighlight, shadeKnown ? 0.38 : 0.15, `r${i}`),
                  )}
                  {(model.pRegions ?? []).map((s, i) => region(s, c.chartSecond, 0.6, `p${i}`))}
                  {(model.reject ?? []).map((s, i) => region(s, c.normalReject, 0.35, `x${i}`))}
                  {model.pop ? (
                    <Path
                      d={pathOf(normalPdfPop)}
                      fill="none"
                      stroke={c.chartMuted}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={chart.dash}
                    />
                  ) : null}
                  <Path
                    d={pathOf(model.pdf)}
                    fill="none"
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                  />
                </G>
                {/* Critical values and the statistic: lines from the axis to the curve. */}
                {(model.critical ?? []).map((x, i) => (
                  <Line
                    key={`c${i}`}
                    x1={sx(x)}
                    y1={axisY}
                    x2={sx(x)}
                    y2={Math.max(T, sy(model.pdf(x)) - 14)}
                    stroke={c.normalReject}
                    strokeWidth={chart.strokeLight}
                    strokeDasharray={chart.dashFine}
                  />
                ))}
                {model.stat !== undefined && model.stat >= x0 && model.stat <= x1 ? (
                  <Line
                    x1={sx(model.stat)}
                    y1={axisY}
                    x2={sx(model.stat)}
                    y2={Math.max(T - 8, sy(model.pdf(model.stat)) - 26)}
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                  />
                ) : null}
                {model.stat !== undefined && model.stat >= x0 && model.stat <= x1
                  ? (() => {
                      const text = chi
                        ? `${sym(spec.chiSquare!.stat, 'χ²')} = ${num(model.stat)}`
                        : `${Z} = ${num((model.stat - model.m) / model.s)}`;
                      const y = Math.max(T - 12, sy(model.pdf(model.stat)) - 30);
                      return (
                        <ChartText
                          {...fitLabel(sx(model.stat), text, chart.label, w)}
                          y={y}
                          fontWeight="700"
                        >
                          {text}
                        </ChartText>
                      );
                    })()
                  : null}
                {spec.mark && !model.problem
                  ? (() => {
                      const x = get(spec.mark.x)!;
                      const on = known(spec.mark.x) && curveKnown;
                      return (
                        <G opacity={on ? 1 : 0.35}>
                          <Line
                            x1={sx(x)}
                            y1={axisY}
                            x2={sx(x)}
                            y2={sy(model.pdf(x))}
                            stroke={c.chartInk}
                            strokeWidth={chart.stroke}
                          />
                          <Circle cx={sx(x)} cy={sy(model.pdf(x))} r={4} fill={c.chartInk} />
                        </G>
                      );
                    })()
                  : null}
                {/* The axis, its ticks, the x values and the z values. */}
                <Line
                  x1={L - 6}
                  y1={axisY}
                  x2={w - R + 6}
                  y2={axisY}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                {ticks.map((t, i) => (
                  <G key={`t${i}`}>
                    <Line
                      x1={sx(t.x)}
                      y1={axisY}
                      x2={sx(t.x)}
                      y2={axisY + 5}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    {(showX || chi) && t.k % every === 0 ? (
                      <ChartText
                        {...fitLabel(sx(t.x), t.top, chart.label, w)}
                        y={labelsY}
                        fill={c.chartInk}
                      >
                        {t.top}
                      </ChartText>
                    ) : null}
                  </G>
                ))}
                {showZ
                  ? zTicks.map((t, i) => (
                      <G key={`z${i}`}>
                        {spec.sample ? (
                          <Line
                            x1={sx(t.x)}
                            y1={zY - 16}
                            x2={sx(t.x)}
                            y2={zY - 11}
                            stroke={c.chartMuted}
                            strokeWidth={chart.strokeLight}
                          />
                        ) : null}
                        <ChartText
                          {...fitLabel(sx(t.x), t.z, chart.label, w)}
                          y={zY}
                          fill={c.chartMuted}
                          fontStyle={standard ? undefined : 'italic'}
                        >
                          {t.z}
                        </ChartText>
                      </G>
                    ))
                  : null}
                {showZ && showX ? (
                  <ChartText x={2} y={zY} fill={c.chartMuted} fontStyle="italic" fontWeight="700">
                    {Z}
                  </ChartText>
                ) : null}
                {spec.axis || chi ? (
                  <ChartText
                    {...fitLabel(w / 2, spec.axis ?? 'χ²', chart.label, w)}
                    y={nameY}
                    fontWeight="600"
                  >
                    {spec.axis ?? 'χ²'}
                  </ChartText>
                ) : null}
                {rows.key
                  ? (() => {
                      const items = [
                        ...(model.reject?.length
                          ? [['reject H₀ (area α)', c.normalReject, 0.5]]
                          : []),
                        ...(model.pRegions?.length ? [['p-value', c.chartSecond, 0.8]] : []),
                      ] as [string, string, number][];
                      const widths = items.map(([t]) => 18 + t.length * chart.label * 0.56);
                      let x = (w - widths.reduce((a, b) => a + b, 0) - 16 * (items.length - 1)) / 2;
                      return items.map(([text, color, o], i) => {
                        const at = x;
                        x += widths[i]! + 16;
                        return (
                          <G key={`key${i}`}>
                            <Rect
                              x={at}
                              y={keyY - 10}
                              width={12}
                              height={12}
                              rx={2}
                              fill={color}
                              fillOpacity={o}
                            />
                            <ChartText x={at + 18} y={keyY}>
                              {text}
                            </ChartText>
                          </G>
                        );
                      });
                    })()
                  : null}
                {areaLabel ? (
                  <G>
                    {areaLabel.leader ? (
                      <Line
                        x1={areaLabel.leader.x}
                        y1={areaLabel.leader.y1}
                        x2={areaLabel.leader.x}
                        y2={areaLabel.leader.y2}
                        stroke={c.chartHighlight}
                        strokeWidth={chart.strokeLight}
                      />
                    ) : null}
                    <Rect
                      x={
                        (areaLabel.textAnchor === 'middle'
                          ? areaLabel.x - (areaLabel.text.length * chart.value * 0.6) / 2
                          : areaLabel.x) - 4
                      }
                      y={areaLabel.y - 13}
                      width={areaLabel.text.length * chart.value * 0.6 + 8}
                      height={18}
                      rx={4}
                      fill={c.card}
                      opacity={0.85}
                    />
                    <ChartText
                      x={areaLabel.x}
                      textAnchor={areaLabel.textAnchor}
                      y={areaLabel.y}
                      fontSize={chart.value}
                      fontWeight="700"
                      fill={c.chartHighlight}
                    >
                      {areaLabel.text}
                    </ChartText>
                  </G>
                ) : null}
                {/* Brackets for the 68–95–99.7 rule. */}
                {spec.bands && !chi
                  ? (
                      [
                        [1, '68%'],
                        [2, '95%'],
                        [3, '99.7%'],
                      ] as const
                    ).map(([k, text], i) => {
                      const y = bandsY + i * 18;
                      const a = sx(mu - k * sigma);
                      const b = sx(mu + k * sigma);
                      const tw = text.length * chart.label * 0.62 + 8;
                      return (
                        <G key={`k${k}`}>
                          <Path
                            d={`M${a},${y - 5}V${y}H${(a + b) / 2 - tw / 2}M${(a + b) / 2 + tw / 2},${y}H${b}V${y - 5}`}
                            fill="none"
                            stroke={c.chartHighlight}
                            strokeWidth={chart.strokeLight}
                          />
                          <ChartText
                            x={(a + b) / 2}
                            y={y + 4}
                            textAnchor="middle"
                            fontWeight="700"
                            fill={c.chartHighlight}
                          >
                            {text}
                          </ChartText>
                        </G>
                      );
                    })
                  : null}
                {/* A confidence interval: a bar under the axis with its estimate. */}
                {spec.interval
                  ? (() => {
                      const ce = get(spec.interval.center)!;
                      const e = get(spec.interval.margin)!;
                      const on = known(spec.interval.center) && known(spec.interval.margin);
                      const a = sx(ce - e);
                      const b = sx(ce + e);
                      return (
                        <G opacity={on ? 1 : 0.35}>
                          <Line
                            x1={a}
                            y1={intervalY}
                            x2={b}
                            y2={intervalY}
                            stroke={c.chartHighlight}
                            strokeWidth={chart.strokeHeavy + 1}
                          />
                          <Line
                            x1={a}
                            y1={intervalY - 7}
                            x2={a}
                            y2={intervalY + 7}
                            stroke={c.chartHighlight}
                            strokeWidth={chart.stroke}
                          />
                          <Line
                            x1={b}
                            y1={intervalY - 7}
                            x2={b}
                            y2={intervalY + 7}
                            stroke={c.chartHighlight}
                            strokeWidth={chart.stroke}
                          />
                          <Circle
                            cx={sx(ce)}
                            cy={intervalY}
                            r={5}
                            fill={c.card}
                            stroke={c.chartHighlight}
                            strokeWidth={chart.stroke}
                          />
                          <ChartText
                            {...fitLabel(a - 6, num(ce - e), chart.label, w, 'end', 6)}
                            y={intervalY + 4}
                            fontWeight="700"
                          >
                            {num(ce - e)}
                          </ChartText>
                          <ChartText
                            {...fitLabel(b + 6, num(ce + e), chart.label, w, 'start', 6)}
                            y={intervalY + 4}
                            fontWeight="700"
                          >
                            {num(ce + e)}
                          </ChartText>
                        </G>
                      );
                    })()
                  : null}
                {/* Simulated intervals, stacked, around the true mean. */}
                {model.intervals ? (
                  <G>
                    {model.intervals.map((iv, i) => {
                      const y = stackY + i * rowH + rowH / 2;
                      const color = iv.hit ? c.chartMuted : c.normalReject;
                      return (
                        <Line
                          key={`i${i}`}
                          x1={sx(Math.max(x0, iv.lo))}
                          y1={y}
                          x2={sx(Math.min(x1, iv.hi))}
                          y2={y}
                          stroke={color}
                          strokeWidth={Math.max(1.2, rowH * 0.55)}
                        />
                      );
                    })}
                    <Line
                      x1={sx(mu)}
                      y1={stackY - 6}
                      x2={sx(mu)}
                      y2={stackY + stackCount * rowH + 2}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke}
                      strokeDasharray={chart.dash}
                    />
                    <ChartText
                      {...fitLabel(sx(mu), `μ = ${num(mu)}`, chart.label, w)}
                      y={stackY + stackCount * rowH + 16}
                      fontWeight="700"
                      fill={c.chartHighlight}
                    >
                      {`μ = ${num(mu)}`}
                    </ChartText>
                  </G>
                ) : null}
              </Svg>
              {handles.map((hd) => (
                <DragHandle
                  key={hd.id}
                  testID={`drag-${hd.id}`}
                  x={Math.min(w - R, Math.max(L, sx(hd.x)))}
                  y={axisY - 20}
                  label={hd.label}
                  onStart={() => {
                    frozen.freeze();
                    start.current = hd.x;
                  }}
                  onMove={(dx) => {
                    const x = start.current + dx / ux;
                    calc.set(
                      {
                        ...rep.pin(keep.filter((k) => k !== hd.id)),
                        [hd.id]: rep.snapTo(hd.id, hd.toValue(x) * rep.factor(hd.id)),
                      },
                      rep.slide(hd.id),
                    );
                  }}
                  onEnd={frozen.release}
                />
              ))}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
