import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { bracketPath } from './braces';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'fractionFit' }>;

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
/** "9/4" as "2 1/4", "8/4" as "2", "3/4" as itself. */
export function mixed(num: number, den: number): string {
  if (den === 0) return '?';
  const g = gcd(Math.abs(num), den) || 1;
  const [p, q] = [num / g, den / g];
  if (q === 1) return formatNumber(p);
  const whole = Math.floor(p / q);
  return whole ? `${formatNumber(whole)} ${p - whole * q}/${q}` : `${p}/${q}`;
}

/** Estimated width of a chart label. */
const textW = (t: string, size: number) => t.length * size * 0.58;

/**
 * Labels above a bar, each over [x0, x1], put on the lowest row where they don't touch a
 * label already placed (row 0 sits just over the bar); overlapping ones stack higher.
 */
function stackRows(items: { x0: number; x1: number; text: string }[], size: number) {
  const rows: [number, number][][] = [];
  return items.map((it) => {
    const half = Math.max(textW(it.text, size), it.x1 - it.x0) / 2 + 4;
    const mid = (it.x0 + it.x1) / 2;
    const span: [number, number] = [mid - half, mid + half];
    let row = 0;
    while (rows[row]?.some(([a, b]) => span[0] < b && span[1] > a)) row++;
    (rows[row] ??= []).push(span);
    return { ...it, row };
  });
}

/**
 * Dividing fractions as a picture. `groups` (how many groups?): one number line from 0 with
 * the dividend as a bar on it, labelled in the dividend's unit above the numbers and in steps of
 * the group size below; the groups inside the bar numbered ①②③, the first bracketed
 * "1 group = 3/4", and a last part group filled inside a dashed whole group, labelled
 * "8/9 of a group". `share` (how much fills the whole?): the whole cut into the divisor's parts,
 * each labelled with what one part holds, the parts the dividend fills shaded, the whole marked
 * with its work (4 × 2/9 = 8/9).
 */
export function FractionFit({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const int = (id: string) => Math.max(0, Math.round(rep.shown(id)));
  const [a, b] = [int(spec.dividend.num), Math.max(1, int(spec.dividend.den))];
  const [p, q] = [int(spec.divisor.num), Math.max(1, int(spec.divisor.den))];
  const known = [spec.dividend.num, spec.dividend.den, spec.divisor.num, spec.divisor.den].every(
    rep.known,
  );
  const dividend = a / b;
  const divisor = p / q;
  // The quotient as a fraction: (a/b) ÷ (p/q) = (a × q) / (b × p).
  const [qn, qd] = [a * q, b * p];
  const full = divisor > 0 ? Math.floor(dividend / divisor + 1e-9) : 0;
  // `share`: one part holds the amount ÷ p (a/(b × p), as the steps write it); the whole is q
  // of those parts.
  const frac = (num: number, den: number) => (den === 1 ? String(num) : `${num}/${den}`);
  const onePart = frac(a, b * p);
  const product = frac(a * q, b * p);
  const simplest = mixed(qn, qd);
  const wholeWork = `${q} × ${onePart} = ${product}${simplest === product ? '' : ` = ${simplest}`}`;
  const s = (k: number) => (k === 1 ? '' : 's');
  // Math in the caption never breaks across lines ("2/3 ÷ 3" stays together).
  const keep = (t: string) => t.replace(/ ([÷×=]) /g, ' $1 ');

  // ─── How many groups ───────────────────────────────────────────────────────
  const count = divisor > 0 ? Math.ceil(dividend / divisor - 1e-9) : 0;
  const partialPart = mixed(qn - full * qd, qd);
  const hasPartial = count > full;
  // The line runs to the last whole the bar or the last (dashed) group reaches.
  const wholes = Math.max(
    spec.wholes,
    Math.ceil(dividend - 1e-9),
    hasPartial && count <= 40 ? Math.ceil(count * divisor - 1e-9) : 0,
    1,
  );
  const groupLayout = (w: number) => {
    const pad = 20;
    const X = (x: number) => pad + (x / wholes) * (w - 2 * pad);
    // Groups too narrow to draw one by one (30 ÷ 1/12) are one shaded bar, labelled with how
    // many groups it holds.
    const many = count > 40 || X(divisor) - X(0) < 8;
    const groups = many ? 0 : count;
    const groupLabel = `1 group = ${mixed(p, q)}`;
    const partLabel = `${partialPart} of a group`;
    const barH = 36;
    // The part group's label goes inside its piece of the bar when it fits.
    const partInside =
      hasPartial && !many && X(dividend) - X(full * divisor) >= textW(partLabel, chart.value) + 12;
    const above = many
      ? stackRows(
          [{ x0: X(0), x1: X(dividend), text: `${simplest} groups, too small to draw one by one` }],
          chart.value,
        )
      : stackRows(
          [
            ...(groups > 0
              ? [{ x0: X(0), x1: X(Math.min(divisor, wholes)), text: groupLabel }]
              : []),
            ...(hasPartial && !partInside
              ? [{ x0: X(full * divisor), x1: X(dividend), text: partLabel }]
              : []),
          ],
          chart.value,
        );
    const rowH = 24;
    const rowsAbove = above.reduce((m, l) => Math.max(m, l.row + 1), 0);
    const barY = 6 + rowsAbove * rowH + (rowsAbove ? 4 : 0);
    const axisY = barY + barH;
    const h = axisY + 12 + 18 + (groups > 0 ? 26 : 0) + 8;
    return {
      pad,
      X,
      many,
      groups,
      groupLabel,
      partLabel,
      partInside,
      above,
      rowH,
      barY,
      barH,
      axisY,
      h,
    };
  };

  // ─── How much fills the whole ──────────────────────────────────────────────
  const shareH = 130;

  const drawGroups = (w: number, h: number) => {
    const L = groupLayout(w);
    const { X, barY, barH, axisY } = L;
    const out: ReactNode[] = [];
    // Minor ticks every 1/b (skipped when they would crowd), long ticks at the wholes.
    const step = X(1 / b) - X(0);
    const ticks = Array.from({ length: wholes * b + 1 }, (_, i) => i);
    const isWhole = (i: number) => i % b === 0;
    // Labels in the dividend's unit above the numbers: every 1/b when they fit, else the
    // wholes (every 1, 2, 5 … wholes); the dividend itself always, in bold.
    const widest = Math.max(...ticks.map((i) => textW(mixed(i, b), chart.value)));
    const allFit = step >= widest + 8;
    const every = [1, 2, 5, 10, 20, 50, 100].find((k) => X(k) - X(0) >= 24) ?? 100;
    const labelY = axisY + 12 + 14;
    const endX = X(dividend);
    const endText = mixed(a, b);
    const clash = (x: number, t: string) =>
      Math.abs(x - endX) < (textW(t, chart.value) + textW(endText, chart.emphasis)) / 2 + 6;
    // The bar: the dividend, sitting on the line.
    out.push(
      <Rect
        key="bar"
        x={X(0)}
        y={barY}
        width={endX - X(0)}
        height={barH}
        fill={c.chartFill}
        stroke={c.chartInk}
        strokeWidth={chart.stroke}
      />,
    );
    if (L.many) {
      out.push(
        <Rect
          key="many"
          x={X(0)}
          y={barY}
          width={endX - X(0)}
          height={barH}
          fill={c.chartHighlight}
          fillOpacity={0.3}
          stroke={c.chartHighlight}
          strokeWidth={chart.stroke}
        />,
      );
    }
    for (let i = 0; i < L.groups; i++) {
      const from = i * divisor;
      const to = Math.min(dividend, (i + 1) * divisor);
      const partial = to - from < divisor - 1e-9;
      const x0 = X(from);
      const x1 = X(to);
      out.push(
        <G key={`g${i}`}>
          {partial ? (
            // The whole group the last part belongs to, dashed, so "8/9 of a group" reads
            // against the group's size.
            <Rect
              x={x0}
              y={barY}
              width={X(from + divisor) - x0}
              height={barH}
              fill="none"
              stroke={c.chartHighlight}
              strokeWidth={chart.stroke}
              strokeDasharray={chart.dash}
            />
          ) : null}
          <Rect
            x={x0}
            y={barY}
            width={x1 - x0}
            height={barH}
            fill={c.chartHighlight}
            fillOpacity={i % 2 ? 0.2 : 0.38}
            stroke={c.chartHighlight}
            strokeWidth={chart.stroke}
          />
          {/* Each whole group numbered inside the bar. */}
          {!partial && x1 - x0 >= 22 ? (
            <>
              <Circle
                cx={(x0 + x1) / 2}
                cy={barY + barH / 2}
                r={10}
                fill={c.card}
                stroke={c.chartHighlight}
                strokeWidth={chart.strokeLight}
              />
              <ChartText
                x={(x0 + x1) / 2}
                y={barY + barH / 2 + 4.5}
                fontSize={chart.label}
                fontWeight="700"
                fill={c.chartHighlight}
                textAnchor="middle"
              >
                {String(i + 1)}
              </ChartText>
            </>
          ) : null}
          {partial && L.partInside ? (
            <ChartText
              x={(x0 + x1) / 2}
              y={barY + barH / 2 + 4.5}
              fontSize={chart.value}
              fontWeight="700"
              textAnchor="middle"
            >
              {L.partLabel}
            </ChartText>
          ) : null}
        </G>,
      );
    }
    // Labels over the bar with square brackets: the first group, the part group (or the
    // "too small" note).
    for (const [k, l] of L.above.entries()) {
      const by = barY - 6 - l.row * L.rowH;
      const t = fitLabel((l.x0 + l.x1) / 2, l.text, chart.value, w);
      out.push(
        <G key={`above${k}`}>
          <Path
            d={bracketPath(l.x0 + 1, by, l.x1 - 1, by, 5)}
            fill="none"
            stroke={c.chartHighlight}
            strokeWidth={chart.strokeLight}
          />
          <ChartText
            {...t}
            y={by - 6}
            fontSize={chart.value}
            fontWeight="700"
            fill={c.chartHighlight}
          >
            {l.text}
          </ChartText>
        </G>,
      );
    }
    // The number line.
    out.push(
      <Line
        key="axis"
        x1={X(0)}
        y1={axisY}
        x2={X(wholes)}
        y2={axisY}
        stroke={c.chartInk}
        strokeWidth={chart.stroke}
      />,
    );
    for (const i of ticks) {
      if (!isWhole(i) && step < 4) continue;
      out.push(
        <Line
          key={`t${i}`}
          x1={X(i / b)}
          y1={axisY}
          x2={X(i / b)}
          y2={axisY + (isWhole(i) ? 11 : 6)}
          stroke={c.chartInk}
          strokeWidth={isWhole(i) ? chart.stroke : 1}
        />,
      );
      const show = allFit ? true : isWhole(i) && (i / b) % every === 0;
      if (!show || i === a || clash(X(i / b), mixed(i, b))) continue;
      out.push(
        <ChartText
          key={`l${i}`}
          x={X(i / b)}
          y={labelY}
          fontSize={chart.value}
          fill={c.chartMuted}
          textAnchor="middle"
        >
          {mixed(i, b)}
        </ChartText>,
      );
    }
    out.push(
      <ChartText
        key="end"
        {...fitLabel(endX, endText, chart.emphasis, w)}
        y={labelY}
        fontSize={chart.emphasis}
        fontWeight="700"
      >
        {endText}
      </ChartText>,
    );
    // Below: where each group ends (the part group's dashed one too), in steps of the group
    // size, thinned from the right so the last one stays.
    if (L.groups > 0) {
      const y2 = labelY + 24;
      let lastLeft = Infinity;
      for (let k = L.groups; k >= 1; k--) {
        const x = X(k * divisor);
        const t = mixed(k * p, q);
        const half = textW(t, chart.value) / 2;
        out.push(
          <Line
            key={`gt${k}`}
            x1={x}
            y1={axisY}
            x2={x}
            y2={axisY + 11}
            stroke={c.chartHighlight}
            strokeWidth={chart.stroke}
          />,
        );
        if (x + half + 6 > lastLeft) continue;
        lastLeft = x - half;
        out.push(
          <ChartText
            key={`gl${k}`}
            {...fitLabel(x, t, chart.value, w)}
            y={y2}
            fontSize={chart.value}
            fontWeight="600"
            fill={c.chartHighlight}
          >
            {t}
          </ChartText>,
        );
      }
    }
    return (
      <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
        {out}
      </Svg>
    );
  };

  const drawShare = (w: number, h: number) => {
    const pad = 20;
    // The whole cut into the divisor's denominator, each part labelled with what it holds; the
    // parts the amount fills shaded. An amount past the whole (fills 5 of 4 parts) draws the
    // extra parts too, with the whole bracketed under the first q.
    const n = Math.max(p, q);
    const barY = 44;
    const barH = 44;
    const part = (w - 2 * pad) / n;
    const filled = Math.min(p, n);
    const whole = spec.quotient && rep.known(spec.quotient);
    const topText =
      p > q
        ? `${mixed(a, b)} fills ${p} parts`
        : `${mixed(a, b)} fills ${p} of ${q} part${q === 1 ? '' : 's'}`;
    const bottomText = `the whole: ${whole ? wholeWork : '?'}`;
    return (
      <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
        {Array.from({ length: n }, (_, i) => (
          <G key={i}>
            <Rect
              x={pad + i * part}
              y={barY}
              width={part}
              height={barH}
              fill={i < p ? c.chartHighlight : c.chartSurface}
              fillOpacity={i < p ? 0.35 : 1}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            {known && p > 0 && (part >= textW(onePart, chart.value) + 8 || i === 0) ? (
              <ChartText
                x={pad + (i + 0.5) * part}
                y={barY + barH / 2 + 5}
                fontSize={chart.value}
                fontWeight={i < p ? '700' : '400'}
                fill={i < p ? c.chartInk : c.chartMuted}
                textAnchor="middle"
              >
                {onePart}
              </ChartText>
            ) : null}
          </G>
        ))}
        <Path
          d={bracketPath(pad + 1, barY - 8, pad + filled * part - 1, barY - 8, 6)}
          stroke={c.chartHighlight}
          strokeWidth={chart.stroke}
          fill="none"
        />
        <ChartText
          {...fitLabel(pad + (filled * part) / 2, topText, chart.value, w)}
          y={barY - 16}
          fontSize={chart.value}
          fontWeight="700"
          fill={c.chartHighlight}
        >
          {topText}
        </ChartText>
        <Path
          d={bracketPath(pad + q * part - 1, barY + barH + 8, pad + 1, barY + barH + 8, 6)}
          stroke={c.chartInk}
          strokeWidth={chart.stroke}
          fill="none"
        />
        <ChartText
          {...fitLabel(pad + (q * part) / 2, bottomText, chart.value, w)}
          y={barY + barH + 30}
          fontSize={chart.value}
          fontWeight="600"
        >
          {bottomText}
        </ChartText>
      </Svg>
    );
  };

  return (
    <View>
      <Canvas aspect={(w) => (spec.mode === 'groups' ? groupLayout(w).h : shareH) / w}>
        {({ w, h }) => (spec.mode === 'share' ? drawShare(w, h) : drawGroups(w, h))}
      </Canvas>
      <Caption>
        {!known
          ? 'Type both fractions.'
          : p === 0
            ? 'A group can’t be 0.'
            : spec.mode === 'share'
              ? keep(
                  `${
                    p > q
                      ? `${mixed(a, b)} fills ${p} parts, and ${q} part${s(q)} make${q === 1 ? 's' : ''} the whole`
                      : `${mixed(a, b)} fills ${p} of the ${q} part${s(q)}`
                  }, so one part holds ${mixed(a, b)} ÷ ${p} = ${onePart}. The whole holds ${wholeWork}.`,
                )
              : full === 0
                ? `Not one whole group of ${mixed(p, q)} fits in ${mixed(a, b)}; it holds ${simplest} of a group.`
                : Math.abs(full * divisor - dividend) < 1e-9
                  ? `${full} group${s(full)} of ${mixed(p, q)} fit${full === 1 ? 's' : ''} in ${mixed(a, b)}.`
                  : `${full} full group${s(full)} of ${mixed(p, q)} fit${full === 1 ? 's' : ''} in ${mixed(a, b)}, and ${partialPart} of another, so ${simplest} groups in all.`}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          {
            var: spec.dividend.num,
            steps: [1],
            pin: [spec.dividend.den, spec.divisor.num, spec.divisor.den],
          },
          {
            var: spec.divisor.num,
            steps: [1],
            pin: [spec.dividend.num, spec.dividend.den, spec.divisor.den],
          },
        ]}
      />
    </View>
  );
}
