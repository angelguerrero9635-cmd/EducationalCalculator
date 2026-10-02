/**
 * `equilibriumChart` mode `gibbs` (HC58, C-P23; `typesHe3f.ts`): G against the extent ξ of a
 * model A ⇌ B with the page's ΔG° and ideal mixing, from pure reactants to pure products; the
 * minimum at ξ = K ÷ (1 + K) where Q = K, and the page's Q placed at Q ÷ (1 + Q) with its
 * tangent, whose slope is ΔG. Under it the slope itself, ΔG = ΔG° + RT ln Q, against log₁₀ Q: a
 * straight line through zero at log₁₀ K, so a minimum pressed against an edge still shows.
 * Flat charts. A "?" value draws nothing for itself.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Polyline, Rect } from 'react-native-svg';

import type { EquilibriumGibbsSpec } from '@/data/modules/typesHe3f';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, fitLabel, useRep } from './common';
import { fig3 } from './he1dText';
import { minus, numReader } from './he3fKit';
import { extentOfQ, gibbsAt, gibbsSlope, kOfGibbs, perJoule, R_GAS } from './he3fMath';
import { MathText } from './hsdText';
import { axisOf, makePlot, PlotFrame } from './hsjPlot';

/** ξ as text: near 1 written 1 − a small number, so 0.9999983 never reads "1". */
export const extentText = (xi: number) =>
  xi > 0.999
    ? `1 − ${fig3(1 - xi)}`
    : xi < 0.001
      ? fig3(xi)
      : formatNumber(Number(xi.toPrecision(3)));

const kj = (j: number) => `${minus(fig3(j / 1000))} kJ/mol`;
const signed = (j: number) => (j > 0 ? `+${kj(j)}` : kj(j));

export function EquilibriumGibbs({ spec, calc }: { spec: EquilibriumGibbsSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = numReader(rep);
  const g = spec.gibbs;
  const R = g.R ?? R_GAS;
  const dG0 = num(g.standard, perJoule);
  const T = num(g.T);
  const Q = num(g.Q);
  const [a, b] = spec.species ?? ['A', 'B'];
  const ready = dG0 !== undefined && T !== undefined && T > 0;
  const K = ready ? kOfGibbs(dG0, T, R) : undefined;
  const xiEq = K === undefined ? undefined : extentOfQ(K);
  const xiQ = Q !== undefined && Q > 0 ? extentOfQ(Q) : undefined;
  const dG = ready && Q !== undefined && Q > 0 ? dG0 + R * T * Math.log(Q) : undefined;
  const logK = K === undefined ? undefined : Math.log10(K);
  const logQ = Q !== undefined && Q > 0 ? Math.log10(Q) : undefined;
  const edge = xiEq !== undefined && (xiEq > 0.995 || xiEq < 0.005);

  // Samples crowd toward both ends, where the curve bends hardest.
  const xis = Array.from({ length: 161 }, (_, k) => 0.5 - 0.5 * Math.cos((Math.PI * k) / 160));
  const Gs = ready ? xis.map((x) => gibbsAt(x, dG0, T, R) / 1000) : [];
  const yG = ready ? axisOf(Math.min(0, ...Gs), Math.max(0, ...Gs), 4) : axisOf(-10, 0, 4);

  return (
    <View>
      <Canvas aspect={0.62}>
        {({ w, h }) => {
          const p = makePlot(w, h, { lo: 0, hi: 1, step: 0.25 }, yG, {
            L: 54,
            R: 14,
            T: 22,
            B: 36,
          });
          const pts = ready ? xis.map((x, k) => `${p.sx(x)},${p.sy(Gs[k]!)}`).join(' ') : '';
          // The tangent at Q, a fixed length on screen along its slope.
          const tangent = (() => {
            if (!ready || xiQ === undefined) return undefined;
            const s = gibbsSlope(xiQ, dG0, T, R) / 1000;
            const [x0, y0] = [p.sx(xiQ), p.sy(gibbsAt(xiQ, dG0, T, R) / 1000)];
            const dx = p.sx(1) - p.sx(0);
            const dy = p.sy(0) - p.sy(s);
            const len = Math.hypot(dx, dy) || 1;
            const k = 34 / len;
            return { x0, y0, ux: dx * k, uy: -dy * k };
          })();
          const minAt =
            ready && xiEq !== undefined
              ? { x: p.sx(xiEq), y: p.sy(gibbsAt(xiEq, dG0, T, R) / 1000) }
              : undefined;
          const minText = 'minimum: Q = K';
          const qText = dG === undefined ? '' : `Q: slope ΔG = ${signed(dG)}`;
          return (
            <Svg width={w} height={h}>
              <PlotFrame
                p={p}
                xName={`Extent ξ: pure ${a} (0) to pure ${b} (1)`}
                yName="G (kJ/mol)"
                xText={(v) => formatNumber(v)}
                yText={(v) => minus(formatNumber(v))}
              />
              {ready ? (
                <Polyline
                  points={pts}
                  fill="none"
                  stroke={c.chartHighlight}
                  strokeWidth={chart.strokeHeavy}
                  strokeLinejoin="round"
                />
              ) : null}
              {minAt ? (
                <G>
                  <Line
                    x1={minAt.x}
                    y1={minAt.y}
                    x2={minAt.x}
                    y2={h - p.B}
                    stroke={c.chartMuted}
                    strokeWidth={1.5}
                    strokeDasharray={chart.dash}
                  />
                  <Circle cx={minAt.x} cy={minAt.y} r={5} fill={c.lineSum} />
                  <MathText
                    text={minText}
                    {...fitLabel(minAt.x - 8, minText, chart.label, w, 'end', 8)}
                    y={Math.min(h - p.B - 6, minAt.y + 18)}
                    fontSize={chart.label}
                    fontWeight="700"
                    fill={c.lineSum}
                    halo
                  />
                </G>
              ) : null}
              {tangent ? (
                <G>
                  <Line
                    x1={tangent.x0 - tangent.ux}
                    y1={tangent.y0 - tangent.uy}
                    x2={tangent.x0 + tangent.ux}
                    y2={tangent.y0 + tangent.uy}
                    stroke={c.fnSecond}
                    strokeWidth={2}
                  />
                  <Circle
                    cx={tangent.x0}
                    cy={tangent.y0}
                    r={5}
                    fill={c.card}
                    stroke={c.fnSecond}
                    strokeWidth={2.5}
                  />
                  <MathText
                    text={qText}
                    {...fitLabel(w / 2, qText, chart.label, w)}
                    y={p.T - 8}
                    fontSize={chart.label}
                    fontWeight="700"
                    fill={c.fnSecond}
                  />
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Canvas aspect={(w) => 150 / w}>
        {({ w, h }) => {
          const centre = logK ?? 0;
          const lo = Math.min(centre - 4, (logQ ?? centre) - 1);
          const hi = Math.max(centre + 4, (logQ ?? centre) + 1);
          const x = axisOf(lo, hi, 5);
          const line = (v: number) => (ready ? (dG0 + R * T * Math.LN10 * v) / 1000 : 0);
          const ends = ready ? [line(x.lo), line(x.hi)] : [-10, 10];
          const y = axisOf(Math.min(0, ...ends), Math.max(0, ...ends), 3);
          const p = makePlot(w, h, x, y, { L: 54, R: 14, T: 12, B: 36 });
          const kText = logK === undefined ? '' : `log K = ${minus(fig3(logK))}`;
          return (
            <Svg width={w} height={h}>
              <PlotFrame
                p={p}
                xName="log₁₀ Q"
                yName="ΔG (kJ/mol)"
                xText={(v) => minus(formatNumber(v))}
                yText={(v) => minus(formatNumber(v))}
              />
              {ready ? (
                <Line
                  x1={p.sx(x.lo)}
                  y1={p.sy(line(x.lo))}
                  x2={p.sx(x.hi)}
                  y2={p.sy(line(x.hi))}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.strokeHeavy}
                />
              ) : null}
              {logK !== undefined ? (
                <G>
                  <Circle cx={p.sx(logK)} cy={p.sy(0)} r={5} fill={c.lineSum} />
                  <MathText
                    text={kText}
                    {...fitLabel(p.sx(logK) + 8, kText, chart.label, w, 'start', 8)}
                    y={p.sy(0) + (line(x.hi) > 0 ? 16 : -8)}
                    fontSize={chart.label}
                    fontWeight="700"
                    fill={c.lineSum}
                    halo
                  />
                </G>
              ) : null}
              {logQ !== undefined && dG !== undefined ? (
                <G>
                  <Rect
                    x={p.sx(logQ) - 1}
                    y={Math.min(p.sy(0), p.sy(dG / 1000))}
                    width={2}
                    height={Math.abs(p.sy(0) - p.sy(dG / 1000))}
                    fill={c.fnSecond}
                  />
                  <Circle
                    cx={p.sx(logQ)}
                    cy={p.sy(dG / 1000)}
                    r={5}
                    fill={c.card}
                    stroke={c.fnSecond}
                    strokeWidth={2.5}
                  />
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          ready && K !== undefined && xiEq !== undefined
            ? `K = exp(−ΔG° ÷ RT) = ${fig3(K)}: the minimum is at ξ = K ÷ (1 + K) = ${extentText(xiEq)}${edge ? ', pressed against the edge; the line below shows it at log K' : ''}.`
            : 'Type ΔG° and T to draw G.',
          ...(dG !== undefined && Q !== undefined && K !== undefined
            ? [
                `ΔG = ΔG° + RT ln Q = ${signed(dG)}: ${Math.abs(dG) < 1e-6 ? 'Q = K, at the minimum, nothing runs' : dG > 0 ? `Q > K, uphill forward, so it runs backward toward more ${a}` : `Q < K, downhill forward, so it runs forward toward more ${b}`}.`,
              ]
            : []),
          `Drawn for a model ${a} ⇌ ${b} with ideal mixing; G of pure ${a} is 0.`,
        ].join(' · ')}
      </Caption>
    </View>
  );
}
