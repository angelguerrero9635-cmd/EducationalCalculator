/**
 * HC183 `placeValueChart` `base` (PlaceValueBaseHe4m in typesHe4m.ts): a whole number's place
 * values in base 2, 8 or 16. Columns weighted bᵏ, the digits in them (the 1s shaded in base 2),
 * the hex digit under each group of four bits, the weights of the digits added; in base 2 with
 * `twos`, the two's complement under it: the bits inverted, then 1 added. Flat, as a chart is.
 */
import type { ReactElement } from 'react';
import { View } from 'react-native';
import Svg, { G, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { digitsIn, digitText, twosSteps, valueOf, widthFor } from './he4mMath';
import { useFields } from './he4mKit';

type Spec = Extract<Representation, { kind: 'placeValueChart' }>;

/** A whole number as a superscript: 15 → ¹⁵. */
const sup = (n: number) => [...String(n)].map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)] ?? d).join('');
/** A base as a subscript: 16 → ₁₆. */
const sub = (n: number) => [...String(n)].map((d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)] ?? d).join('');
/** Bits in groups of four from the right: 101101 → 10 1101. */
const fours = (bits: number[]) => {
  const s = bits.join('');
  const out: string[] = [];
  for (let end = s.length; end > 0; end -= 4) out.unshift(s.slice(Math.max(0, end - 4), end));
  return out.join(' ');
};

export function PlaceValueBaseHe4m({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const { get } = useFields(calc);
  const base = spec.base ?? 2;
  const N = get(spec.value);
  const whole = N !== undefined && N >= 0 && Number.isInteger(Math.round(N * 1e9) / 1e9);
  const x = whole ? Math.round(N!) : undefined;
  const wGiven = get(spec.width);
  const n = Math.max(
    1,
    Math.min(32, Math.round(wGiven ?? (x === undefined ? 8 : widthFor(x, base)))),
  );
  const fits = x !== undefined && x < base ** n;
  const digits = x !== undefined && fits ? digitsIn(x, base, n) : undefined;
  // The two's complement needs the width: none while a width value is "?".
  const twos = base === 2 && spec.twos !== undefined;
  const widthKnown = spec.width === undefined || wGiven !== undefined;
  const signedOk = x !== undefined && x < 2 ** (n - 1);
  const steps = twos && widthKnown && x !== undefined && fits ? twosSteps(x, n) : undefined;
  const grouped = base === 2 && n > 4;
  const hexOf = (bits: number[]) =>
    digitsIn(valueOf(bits, 2), 16, Math.ceil(bits.length / 4))
      .map(digitText)
      .join('');

  const lines: string[] = [];
  if (x === undefined) lines.push('Type a whole number to fill the columns.');
  else if (!fits)
    lines.push(
      `${formatNumber(x)} needs more than ${n} digit${n > 1 ? 's' : ''} in base ${base}: the largest is ${formatNumber(base ** n - 1)}.`,
    );
  else {
    const terms = digits!
      .map((d, i) => ({ d, k: n - 1 - i }))
      .filter((t) => t.d > 0)
      .map((t) =>
        base === 2 ? formatNumber(base ** t.k) : `${t.d} × ${formatNumber(base ** t.k)}`,
      );
    const written = digits!
      .map(digitText)
      .join('')
      .replace(/^0+(?=.)/, '');
    lines.push(
      terms.length > 8
        ? `The weights of its ${terms.length} nonzero digits add to ${formatNumber(x)}: ${written}${sub(base)}, each column ${base} times the one to its right.`
        : `${formatNumber(x)} = ${terms.length ? terms.join(' + ') : '0'}: ${written}${sub(base)}, each column ${base} times the one to its right.`,
    );
    if (base === 2) {
      const rem: string[] = [];
      let v = x;
      while (v > 0 && rem.length < 12) {
        rem.push(`${formatNumber(Math.floor(v / 2))} r ${v % 2}`);
        v = Math.floor(v / 2);
      }
      if (x > 0 && rem.length < 12)
        lines.push(
          `By repeated ÷ 2: ${formatNumber(x)} → ${rem.join(' → ')}; the remainders read from the last are ${written}.`,
        );
      if (n % 4 === 0)
        lines.push(`In hex, the bits in fours: ${fours(digits!)} = ${hexOf(digits!)}₁₆.`);
    }
    if (twos && steps) {
      if (!signedOk)
        lines.push(
          `−${formatNumber(x)} does not fit in ${n} bits: a signed ${n}-bit number runs from −${formatNumber(2 ** (n - 1))} to ${formatNumber(2 ** (n - 1) - 1)}.`,
        );
      else
        lines.push(
          `−${formatNumber(x)} in ${n} bits: invert ${fours(steps.bits)} to ${fours(steps.inverted)}, add 1: ${fours(steps.result)} = ${hexOf(steps.result)}₁₆, which is 2${sup(n)} − ${formatNumber(x)} = ${formatNumber(2 ** n - x)} read unsigned.`,
        );
    }
  }

  const H = twos ? 240 : base === 2 && n % 4 === 0 ? 100 : 80;
  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w, h }) => {
          const labelW = twos ? 54 : 12;
          const gap = grouped ? 5 : 0;
          const groupsTotal = Math.ceil(n / 4);
          const cw = Math.min(
            base === 2 ? 40 : 64,
            (w - labelW - 10 - (grouped ? (groupsTotal - 1) * gap : 0)) / n,
          );
          // Groups of four counted from the right (the ones bit), so hex digits line up.
          const gi = (i: number) => Math.floor((n - 1 - i) / 4);
          const used = n * cw + (grouped ? (groupsTotal - 1) * gap : 0);
          const x0 = labelW + (w - labelW - 10 - used) / 2;
          const colX = (i: number) => x0 + i * cw + (grouped ? (groupsTotal - 1 - gi(i)) * gap : 0);
          const weightText = (k: number) => formatNumber(base ** k);
          const showWeights = Array.from({ length: n }, (_, i) => n - 1 - i).every(
            (k) => weightText(k).length * 7.2 <= cw - 3,
          );
          const parts: ReactElement[] = [];
          // Header: bᵏ over each column (or each group's ones column), the weight under it.
          for (let i = 0; i < n; i++) {
            const k = n - 1 - i;
            const cx = colX(i) + cw / 2;
            const expLabel = `${base}${sup(k)}`;
            const fitsExp = expLabel.length * 7.2 <= cw - 2;
            if (fitsExp || (grouped && k % 4 === 0) || (!grouped && i === n - 1))
              parts.push(
                <ChartText
                  key={`e${i}`}
                  x={fitsExp ? cx : colX(i) + cw}
                  y={showWeights ? 14 : 30}
                  textAnchor={fitsExp ? 'middle' : 'end'}
                  fill={c.chartMuted}
                >
                  {expLabel}
                </ChartText>,
              );
            if (showWeights)
              parts.push(
                <ChartText key={`w${i}`} x={cx} y={30} textAnchor="middle" fontWeight="700">
                  {weightText(k)}
                </ChartText>,
              );
          }
          const row = (y: number, ds: number[] | undefined, key: string, label?: string) => (
            <G key={key}>
              {label ? (
                <ChartText x={labelW - 8} y={y + 19} textAnchor="end" fontWeight="700">
                  {label}
                </ChartText>
              ) : null}
              {Array.from({ length: n }, (_, i) => {
                const d = ds?.[i];
                return (
                  <G key={`${key}${i}`}>
                    <Rect
                      x={colX(i)}
                      y={y}
                      width={cw}
                      height={28}
                      fill={d !== undefined && d > 0 ? c.he4mBitOn : c.background}
                      stroke={c.chartGrid}
                      strokeWidth={1}
                    />
                    {d !== undefined ? (
                      <ChartText
                        x={colX(i) + cw / 2}
                        y={y + 19}
                        textAnchor="middle"
                        fontWeight="700"
                        fontSize={cw < 12 ? chart.label : chart.value}
                      >
                        {digitText(d)}
                      </ChartText>
                    ) : null}
                  </G>
                );
              })}
            </G>
          );
          const hexUnder = (y: number, ds: number[], key: string) =>
            base === 2 && n % 4 === 0
              ? Array.from({ length: groupsTotal }, (_, g) => {
                  const first = g * 4;
                  const xa = colX(first) + 2;
                  const xb = colX(first + 3) + cw - 2;
                  return (
                    <G key={`${key}${g}`}>
                      <Path
                        d={`M ${xa} ${y} L ${xa} ${y + 5} L ${xb} ${y + 5} L ${xb} ${y}`}
                        fill="none"
                        stroke={c.chartMuted}
                        strokeWidth={1}
                      />
                      <ChartText
                        x={(xa + xb) / 2}
                        y={y + 19}
                        textAnchor="middle"
                        fill={c.he4mHex}
                        fontWeight="700"
                      >
                        {digitText(valueOf(ds.slice(first, first + 4), 2))}
                      </ChartText>
                    </G>
                  );
                })
              : null;
          const top = 38;
          // A row's name: the number, or N and −N when it would not fit beside the row.
          const rowName = (t: string) =>
            t.length * 7.2 <= labelW - 10 ? t : t.startsWith('−') ? '−N' : 'N';
          const fade = digits && (!twos || signedOk) ? 1 : 0.4;
          return (
            <Svg width={w} height={h}>
              {parts}
              {row(
                top,
                digits,
                'n',
                twos ? rowName(x === undefined ? 'N' : formatNumber(x)) : undefined,
              )}
              {digits ? hexUnder(top + 32, digits, 'hx') : null}
              {base === 2 && n % 4 === 0 && digits ? (
                <ChartText x={8} y={top + 51} fill={c.he4mHex} fontWeight="700">
                  {twos ? 'hex' : ''}
                </ChartText>
              ) : null}
              {twos ? (
                <G opacity={fade}>
                  {row(top + 76, steps?.inverted, 'inv', 'invert')}
                  {row(
                    top + 120,
                    steps?.result,
                    'res',
                    rowName(x !== undefined ? `−${formatNumber(x)}` : '−N'),
                  )}
                  <ChartText x={labelW - 8} y={top + 115} textAnchor="end" fill={c.chartMuted}>
                    + 1
                  </ChartText>
                  {steps ? hexUnder(top + 152, steps.result, 'hr') : null}
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
