/**
 * HC152 (`normalCurve` `shift`, ShiftHe4e in typesHe4e.ts): response to selection. Two panels
 * on one value axis: the parents' curve with the selected tail shaded (its mean μ + S, its
 * cut-off and share) and S arrowed from μ; under it the offspring's curve moved by R = h²S, the
 * parents' curve dashed behind it, R arrowed from μ. Flat; no handles.
 */
import { View } from 'react-native';
import Svg, { G, Line, Path } from 'react-native-svg';

import type { NormalCurveSpec } from '@/data/modules/typesHsb';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { selectedTail } from './he4eMath';
import { normalPdf } from './statMath';

/** A number to 4 significant figures, a true minus sign. */
const n4 = (x: number) => formatNumber(Number(x.toPrecision(4)));

export function NormalCurveShiftHe4e({ spec, calc }: { spec: NormalCurveSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const sh = spec.shift!;
  type V = number | string | undefined;
  const known = (v: V) => v !== undefined && (typeof v === 'number' || rep.known(v));
  const get = (v: V): number | undefined =>
    !known(v) ? undefined : typeof v === 'number' ? v : rep.shown(v as string);
  const say = (v: V, x: number) => (typeof v === 'string' ? rep.value(v, false) : n4(x));
  /** A value inside a sum or product: a negative one bracketed, 0.9 × (−6). */
  const term = (v: V, x: number) => (x < 0 ? `(${say(v, x)})` : say(v, x));
  const unitOf = (v: V) => (typeof v === 'string' ? rep.unit(v) : undefined);
  const unit = unitOf(spec.mean) ?? unitOf(sh.selected) ?? '';
  const u = unit ? ` ${unit}` : '';
  const mu = get(spec.mean);
  const sd = get(spec.sd) ?? 1;
  const S = get(sh.selected);
  const R = get(sh.response);
  const h2 = get(sh.h2);
  const tail = mu !== undefined && S !== undefined ? selectedTail(mu, sd, S) : undefined;
  const after =
    sh.after && known(sh.after)
      ? rep.shown(sh.after)
      : mu !== undefined && R !== undefined
        ? mu + R
        : undefined;
  // The window: μ ± 3.5σ, widened for a selected mean or an offspring mean past it.
  const m0 = mu ?? 0;
  const reach = Math.max(3.5 * sd, Math.abs(S ?? 0) + sd, Math.abs(R ?? 0) + 2.5 * sd);
  const [x0, x1] = [m0 - reach, m0 + reach];

  // ── Caption ──
  const lines: string[] = [];
  if (mu === undefined) lines.push('Type the parents’ mean to draw the curves.');
  else if (S === undefined) lines.push('Type S to shade the parents selected.');
  else if (tail) {
    const pct = formatNumber(Number((tail.share * 100).toPrecision(3)));
    lines.push(
      `Selected: the ${tail.side > 0 ? 'top' : 'bottom'} ${pct}% of parents (${tail.side > 0 ? 'above' : 'below'} ${n4(tail.cut)}${u}), mean ${n4(mu + S)}${u}: S = ${say(sh.selected, S)}${u}.`,
    );
  } else lines.push('S = 0: the parents chosen are no different from the rest.');
  if (R !== undefined && S !== undefined && h2 !== undefined)
    lines.push(
      `R = h²S = ${say(sh.h2, h2)} × ${term(sh.selected, S)} = ${say(sh.response, R)}${u}.`,
    );
  if (after !== undefined && mu !== undefined && R !== undefined)
    lines.push(
      `Offspring mean: ${say(spec.mean, mu)} + ${term(sh.response, R)} = ${sh.after ? rep.value(sh.after, false) : n4(after)}${u}.`,
    );
  else if (R === undefined && mu !== undefined) lines.push('Type R to draw the offspring.');

  const top = 22;
  const ph = (w: number) => Math.min(120, 0.27 * w);
  const height = (w: number) => 2 * (top + ph(w)) + 22 + 18 + (spec.axis ? 18 : 0) + 4;

  return (
    <View>
      <Canvas aspect={(w) => height(w) / w}>
        {({ w, h }) => {
          const L = 16;
          const Rm = 16;
          const ux = (w - L - Rm) / (x1 - x0);
          const sx = (x: number) => L + (x - x0) * ux;
          const a1 = top + ph(w);
          const a2 = a1 + 22 + top + ph(w);
          const peak = normalPdf(0, 0, sd);
          const uy = (ph(w) - 6) / peak;
          const pathOf = (m: number, axis: number, a = x0, b = x1, closed = false) => {
            const lo = Math.max(a, x0);
            const hi = Math.min(b, x1);
            if (!(hi > lo)) return '';
            const k = Math.max(2, Math.ceil((240 * (hi - lo)) / (x1 - x0)));
            let d = closed ? `M${sx(lo).toFixed(2)},${axis}L` : 'M';
            for (let i = 0; i <= k; i++) {
              const x = lo + ((hi - lo) * i) / k;
              d += `${i ? 'L' : ''}${sx(x).toFixed(2)},${(axis - normalPdf(x, m, sd) * uy).toFixed(2)}`;
            }
            return closed ? `${d}L${sx(hi).toFixed(2)},${axis}Z` : d;
          };
          const yAt = (x: number, m: number, axis: number) => axis - normalPdf(x, m, sd) * uy;
          /** A horizontal arrow from a to b at y, its label above (on a halo). */
          const arrow = (
            a: number,
            b: number,
            y: number,
            text: string,
            color: string,
            key: string,
          ) => {
            const [xa, xb] = [sx(a), sx(b)];
            const dir = xb >= xa ? 1 : -1;
            const head = Math.min(6, Math.abs(xb - xa));
            return (
              <G key={key}>
                <Line x1={xa} y1={y} x2={xb} y2={y} stroke={color} strokeWidth={chart.stroke} />
                {head > 1 ? (
                  <Path
                    d={`M${xb},${y}L${xb - dir * head},${y - 4}L${xb - dir * head},${y + 4}Z`}
                    fill={color}
                  />
                ) : null}
                <ChartText
                  {...fitLabel(xb + dir * 6, text, chart.label, w, dir > 0 ? 'start' : 'end', 6)}
                  y={y + 4}
                  fontWeight="700"
                  fill={color}
                  halo
                >
                  {text}
                </ChartText>
              </G>
            );
          };
          // Ticks: μ + kσ under the offspring panel.
          const ticks: number[] = [];
          for (let k = Math.ceil((x0 - m0) / sd); k <= Math.floor((x1 - m0) / sd); k++)
            ticks.push(m0 + k * sd);
          const tw = Math.max(...ticks.map((t) => n4(t).length)) * chart.label * 0.6;
          const every = sd * ux >= tw + 6 ? 1 : 2;
          const axisLine = (y: number, key: string) => (
            <Line
              key={key}
              x1={L - 6}
              y1={y}
              x2={w - Rm + 6}
              y2={y}
              stroke={c.chartInk}
              strokeWidth={chart.strokeLight}
            />
          );
          const sharePct = tail
            ? `${formatNumber(Number((tail.share * 100).toPrecision(3)))}% chosen`
            : '';
          return (
            <Svg width={w} height={h}>
              <ChartText x={4} y={14} fontWeight="700">
                Parents
              </ChartText>
              <ChartText x={4} y={a1 + 22 + 14} fontWeight="700" fill={c.he4eOffspring}>
                Offspring
              </ChartText>
              {mu !== undefined ? (
                <G>
                  {/* Parents: the selected tail shaded, the curve, the cut-off. */}
                  {tail ? (
                    <Path
                      d={
                        tail.side > 0
                          ? pathOf(mu, a1, tail.cut, x1, true)
                          : pathOf(mu, a1, x0, tail.cut, true)
                      }
                      fill={c.chartHighlight}
                      fillOpacity={0.3}
                    />
                  ) : null}
                  <Path
                    d={pathOf(mu, a1)}
                    fill="none"
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                  />
                  {tail && tail.cut > x0 && tail.cut < x1 ? (
                    <G>
                      <Line
                        x1={sx(tail.cut)}
                        y1={a1}
                        x2={sx(tail.cut)}
                        y2={yAt(tail.cut, mu, a1)}
                        stroke={c.chartHighlight}
                        strokeWidth={chart.strokeLight}
                        strokeDasharray={chart.dashFine}
                      />
                      <ChartText
                        {...fitLabel(sx(tail.cut), n4(tail.cut), chart.label, w)}
                        y={a1 + 15}
                        fill={c.chartHighlight}
                      >
                        {n4(tail.cut)}
                      </ChartText>
                    </G>
                  ) : null}
                  {tail ? (
                    <ChartText
                      x={w - 4}
                      y={14}
                      textAnchor="end"
                      fill={c.chartHighlight}
                      fontWeight="700"
                    >
                      {sharePct}
                    </ChartText>
                  ) : null}
                  {/* μ dashed through both panels. */}
                  <Line
                    x1={sx(mu)}
                    y1={top - 4}
                    x2={sx(mu)}
                    y2={a2}
                    stroke={c.chartMuted}
                    strokeWidth={chart.strokeLight}
                    strokeDasharray={chart.dash}
                  />
                  {S !== undefined && tail ? (
                    <G>
                      <Line
                        x1={sx(mu + S)}
                        y1={a1}
                        x2={sx(mu + S)}
                        y2={a1 - ph(w) * 0.55}
                        stroke={c.chartHighlight}
                        strokeWidth={chart.stroke}
                      />
                      {arrow(
                        mu,
                        mu + S,
                        a1 - ph(w) * 0.55,
                        `S = ${say(sh.selected, S)}${u}`,
                        c.chartHighlight,
                        'S',
                      )}
                    </G>
                  ) : null}
                  {/* Offspring: the parents' curve dashed behind, the moved curve, R. */}
                  <Path
                    d={pathOf(mu, a2)}
                    fill="none"
                    stroke={c.chartMuted}
                    strokeWidth={chart.strokeLight}
                    strokeDasharray={chart.dashFine}
                  />
                  {R !== undefined ? (
                    <G>
                      <Path
                        d={pathOf(mu + R, a2, x0, x1, true)}
                        fill={c.he4eOffspring}
                        fillOpacity={0.14}
                      />
                      <Path
                        d={pathOf(mu + R, a2)}
                        fill="none"
                        stroke={c.he4eOffspring}
                        strokeWidth={chart.stroke}
                      />
                      <Line
                        x1={sx(mu + R)}
                        y1={a2}
                        x2={sx(mu + R)}
                        y2={a2 - ph(w) * 0.55}
                        stroke={c.he4eOffspring}
                        strokeWidth={chart.stroke}
                      />
                      {arrow(
                        mu,
                        mu + R,
                        a2 - ph(w) * 0.55,
                        `R = ${say(sh.response, R)}${u}`,
                        c.he4eOffspring,
                        'R',
                      )}
                    </G>
                  ) : null}
                </G>
              ) : null}
              {axisLine(a1, 'a1')}
              {axisLine(a2, 'a2')}
              {mu !== undefined
                ? ticks.map((t, i) => (
                    <G key={`t${i}`}>
                      <Line
                        x1={sx(t)}
                        y1={a2}
                        x2={sx(t)}
                        y2={a2 + 5}
                        stroke={c.chartInk}
                        strokeWidth={chart.strokeLight}
                      />
                      {Math.round((t - m0) / sd) % every === 0 ? (
                        <ChartText
                          {...fitLabel(sx(t), n4(t), chart.label, w)}
                          y={a2 + 18}
                          fill={c.chartMuted}
                        >
                          {n4(t)}
                        </ChartText>
                      ) : null}
                    </G>
                  ))
                : null}
              {spec.axis ? (
                <ChartText
                  {...fitLabel(w / 2, spec.axis, chart.label, w)}
                  y={a2 + 36}
                  fill={c.chartMuted}
                >
                  {spec.axis}
                </ChartText>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
