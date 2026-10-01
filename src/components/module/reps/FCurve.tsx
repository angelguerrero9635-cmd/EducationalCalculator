import { View } from 'react-native';
import Svg, { G, Line, Path } from 'react-native-svg';

import type { NormalCurveSpec } from '@/data/modules/typesHsb';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { fPdf, fQuantile, fTailsOf, fTest } from './fCurve';
import { niceStep } from './hsdGrid';
import { MathChip } from './hsdText';

const p4 = (p: number) => (p < 0.0001 ? '< 0.0001' : `= ${p.toFixed(4)}`);
const n3 = (x: number) => formatNumber(Number(x.toPrecision(4)));

/**
 * The F curve (H106, `normalCurve` with `f`): the F distribution for df₁ and df₂, the statistic
 * marked with the p-value shaded past it (or both tails), and the critical value for α dashed
 * with its rejection region tinted.
 */
export function FCurve({ spec, calc }: { spec: NormalCurveSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const s = spec.f!;
  const num = (x: number | string | undefined, d: number) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) =>
    x === undefined || typeof x === 'number' || rep.known(x);
  const [d1, d2] = [
    Math.max(1, Math.round(num(s.df1, 2))),
    Math.max(1, Math.round(num(s.df2, 10))),
  ];
  const F = s.stat === undefined ? undefined : num(s.stat, 1);
  const alpha = s.alpha === undefined ? undefined : num(s.alpha, 0.05);
  // H112: one tail or two, as the page's Hₐ value says; none shaded while it is "?".
  const chosen = fTailsOf(s, (id) => (rep.known(id) ? rep.val(id) : undefined));
  const tails = chosen ?? 'right';
  const crit =
    alpha === undefined || chosen === undefined
      ? undefined
      : tails === 'two'
        ? { left: fQuantile(1 - alpha / 2, d1, d2), right: fQuantile(alpha / 2, d1, d2) }
        : { right: fQuantile(alpha, d1, d2) };
  const test = F === undefined || chosen === undefined ? undefined : fTest(F, d1, d2, tails);
  const statKnown = known(s.stat) && known(s.df1) && known(s.df2);
  // The axis: past the statistic and the critical value, and far enough for the tail to fade.
  const xMax = (() => {
    const want = Math.max(fQuantile(0.005, d1, d2), (F ?? 0) * 1.15, (crit?.right ?? 0) * 1.15);
    const step = niceStep(want / 5);
    return { max: Math.ceil(want / step) * step, step };
  })();

  // Caption.
  const lines: string[] = [`The F curve with df₁ = ${d1} on top and df₂ = ${d2} underneath.`];
  if (chosen === undefined) lines.push('Choose Hₐ to shade one tail or both.');
  if (F !== undefined && test) {
    if (!statKnown) lines.push('F = ?');
    else if (tails === 'two')
      lines.push(
        `The test statistic is F = ${n3(F)}; the smaller tail past it is ${(test.p / 2).toFixed(4)}, doubled for both tails: P ${p4(test.p)}.`,
      );
    else lines.push(`The test statistic is F = ${n3(F)}, and the area past it is P ${p4(test.p)}.`);
  }
  if (alpha !== undefined && crit && F !== undefined && test && statKnown) {
    const reject = test.p < alpha;
    lines.push(
      `${tails === 'two' ? `The critical values for α = ${alpha} are ${n3(crit.left!)} and ${n3(crit.right)}` : `The critical value for α = ${alpha} is ${n3(crit.right)}`}: ${reject ? `F is in the rejection region, so P < α and we reject H₀.` : `F is not in the rejection region, so P ≥ α and we fail to reject H₀.`}`,
    );
  }

  return (
    <View>
      <Canvas aspect={0.62}>
        {({ w, h }) => {
          const [L, R, T, B] = [14, w - 14, 34, h - 34];
          const sx = (x: number) => L + (x / xMax.max) * (R - L);
          // The height: the curve's top past the first sliver (df₁ = 1 runs off at 0).
          const xs = Array.from({ length: 301 }, (_, i) => (xMax.max * i) / 300);
          const peak = Math.max(
            ...xs.filter((x) => d1 > 1 || x >= xMax.max * 0.03).map((x) => fPdf(x, d1, d2)),
          );
          // df₁ ≤ 2 rises without a hump toward 0, so the tails past F and the critical value
          // were 1–2 px tall: the scale is set by the tail (six times its height there), the
          // curve clipped at the top.
          const tailAt = Math.min(F ?? Infinity, crit?.right ?? Infinity);
          const top =
            d1 <= 2 && Number.isFinite(tailAt)
              ? Math.min(peak, Math.max(peak * 0.25, 6 * fPdf(tailAt, d1, d2)))
              : peak;
          const sy = (y: number) => B - Math.min(1.08, y / top) * (B - T) * 0.92;
          // Where the scale clips the curve, it isn't drawn (a flat top read as a constant
          // density): it enters at the top edge, and a dashed stub says it goes on up.
          const shown = xs.filter((x) => !(fPdf(x, d1, d2) > top * 1.08));
          const curve = shown
            .map((x, i) => `${i ? 'L' : 'M'} ${sx(x)} ${sy(fPdf(x, d1, d2))}`)
            .join(' ');
          const cut = shown.length < xs.length && shown.length ? shown[0]! : undefined;
          const area = (a: number, b: number) => {
            if (!(b > a)) return '';
            const pts = Array.from({ length: 81 }, (_, i) => a + ((b - a) * i) / 80);
            return `M ${sx(a)} ${B} ${pts.map((x) => `L ${sx(x)} ${sy(fPdf(x, d1, d2))}`).join(' ')} L ${sx(b)} ${B} Z`;
          };
          const ticks: number[] = [];
          for (let x = 0; x <= xMax.max + 1e-9; x += xMax.step) ticks.push(Number(x.toFixed(9)));
          const pTails =
            test && F !== undefined
              ? [
                  ...(test.cuts.left !== undefined ? [area(0, test.cuts.left)] : []),
                  ...(test.cuts.right !== undefined ? [area(test.cuts.right, xMax.max)] : []),
                ]
              : [];
          const reject = crit
            ? [...(crit.left !== undefined ? [area(0, crit.left)] : []), area(crit.right, xMax.max)]
            : [];
          return (
            <Svg width={w} height={h}>
              {reject.map((d, i) => (
                <Path key={`r${i}`} d={d} fill={c.hopBack} opacity={0.14} />
              ))}
              <G opacity={statKnown ? 1 : 0.35}>
                {pTails.map((d, i) => (
                  <Path key={`p${i}`} d={d} fill={c.chartHighlight} opacity={0.4} />
                ))}
              </G>
              <Line
                x1={L}
                y1={B}
                x2={R}
                y2={B}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              {ticks.map((x) => (
                <G key={`t${x}`}>
                  <Line
                    x1={sx(x)}
                    y1={B}
                    x2={sx(x)}
                    y2={B + 5}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                  <ChartText
                    x={sx(x)}
                    y={B + 18}
                    textAnchor="middle"
                    fontSize={chart.label}
                    fill={c.chartMuted}
                  >
                    {formatNumber(x)}
                  </ChartText>
                </G>
              ))}
              <Path d={curve} stroke={c.chartInk} strokeWidth={chart.strokeHeavy} fill="none" />
              {cut !== undefined ? (
                <Line
                  x1={sx(cut)}
                  y1={sy(fPdf(cut, d1, d2))}
                  x2={sx(cut) - 3}
                  y2={T - 14}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dashFine}
                />
              ) : null}
              {crit
                ? [crit.left, crit.right]
                    .filter((x): x is number => x !== undefined)
                    .map((x, i) => (
                      <G key={`c${i}`}>
                        <Line
                          x1={sx(x)}
                          y1={T - 4}
                          x2={sx(x)}
                          y2={B}
                          stroke={c.hopBack}
                          strokeWidth={chart.stroke}
                          strokeDasharray={chart.dash}
                        />
                        <MathChip
                          x={sx(x)}
                          y={T - 8}
                          text={`${n3(x)}`}
                          w={w}
                          h={h}
                          color={c.hopBack}
                          bold={false}
                        />
                      </G>
                    ))
                : null}
              {F !== undefined && statKnown ? (
                <G>
                  <Line
                    x1={sx(F)}
                    y1={sy(fPdf(F, d1, d2)) - 26}
                    x2={sx(F)}
                    y2={B}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                  />
                  <MathChip
                    x={sx(F)}
                    y={sy(fPdf(F, d1, d2)) - 30}
                    text={`F = ${n3(F)}`}
                    w={w}
                    h={h}
                    color={c.chartHighlight}
                  />
                  {test ? (
                    // The p-value beside its right tail.
                    // Above the shaded tail, off the axis line.
                    <MathChip
                      x={Math.min(R, sx(test.cuts.right ?? F) + 8)}
                      y={Math.min(B - 16, sy(fPdf(test.cuts.right ?? F, d1, d2)) - 8)}
                      text={`P ${p4(test.p)}`}
                      anchor="start"
                      w={w}
                      h={h}
                      color={c.chartHighlight}
                      bold={false}
                    />
                  ) : null}
                </G>
              ) : null}
              <MathChip
                x={R}
                y={T + 18}
                text={`F(${d1}, ${d2})`}
                anchor="end"
                w={w}
                h={h}
                size={chart.value}
              />
              {alpha !== undefined ? (
                <MathChip
                  x={R}
                  y={T + 38}
                  text={`α = ${alpha}`}
                  anchor="end"
                  w={w}
                  h={h}
                  color={c.hopBack}
                  bold={false}
                />
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
