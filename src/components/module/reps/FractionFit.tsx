import { View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
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

/**
 * Dividing fractions as a picture. `groups` (how many groups?): the dividend as a bar on a
 * ruler of wholes, groups the size of the divisor bracketed along it, the last partial group
 * labelled with the fraction of a group it holds. `share` (how much in one group?): one whole
 * group cut into the divisor's parts, the parts the dividend fills shaded, the whole marked.
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

  return (
    <View>
      <Canvas aspect={spec.mode === 'groups' ? 0.42 : 0.36}>
        {({ w, h }) => {
          const pad = 22;
          if (spec.mode === 'share') {
            // One whole group, cut into the divisor's denominator; the given parts shaded.
            const barY = h * 0.38;
            const barH = h * 0.26;
            const part = (w - 2 * pad) / q;
            return (
              <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
                {Array.from({ length: q }, (_, i) => (
                  <Rect
                    key={i}
                    x={pad + i * part}
                    y={barY}
                    width={part}
                    height={barH}
                    fill={i < p ? c.chartHighlight : c.chartSurface}
                    fillOpacity={i < p ? 0.35 : 1}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                ))}
                <Path
                  d={`M ${pad} ${barY - 8} l 0 -8 L ${pad + Math.min(p, q) * part} ${barY - 16} l 0 8`}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.stroke}
                  fill="none"
                />
                <ChartText
                  x={pad + (Math.min(p, q) * part) / 2}
                  y={barY - 22}
                  fontSize={chart.label}
                  fontWeight="700"
                  fill={c.chartHighlight}
                  textAnchor="middle"
                >
                  {`${mixed(a, b)} fills ${p}/${q}`}
                </ChartText>
                <Path
                  d={`M ${pad} ${barY + barH + 8} l 0 8 L ${w - pad} ${barY + barH + 16} l 0 -8`}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                  fill="none"
                />
                <ChartText
                  x={w / 2}
                  y={barY + barH + 32}
                  fontSize={chart.label}
                  fill={c.chartInk}
                  textAnchor="middle"
                >
                  {`one whole group: ${spec.quotient && rep.known(spec.quotient) ? mixed(qn, qd) : '?'}`}
                </ChartText>
              </Svg>
            );
          }
          // How many groups: the dividend along a ruler of wholes.
          const wholes = Math.max(spec.wholes, Math.ceil(dividend + 1e-9), 1);
          const X = (x: number) => pad + (x / wholes) * (w - 2 * pad);
          const barY = h * 0.42;
          const barH = h * 0.2;
          const ticks = Array.from({ length: wholes * b + 1 }, (_, i) => i / b);
          const count = divisor > 0 ? Math.ceil(dividend / divisor - 1e-9) : 0;
          // Groups too narrow to draw one by one (30 ÷ 1/12) are one shaded bar, labelled
          // with how many groups it holds.
          const many = count > 40 || X(divisor) - X(0) < 8;
          const groups = many ? 0 : count;
          // Whole-number labels far enough apart to read: every 1, 2, 5, 10 … wholes.
          const every = [1, 2, 5, 10, 20, 50, 100].find((k) => X(k) - X(0) >= 16) ?? 100;
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              <Rect
                x={X(0)}
                y={barY}
                width={X(dividend) - X(0)}
                height={barH}
                fill={c.chartFill}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              {ticks.map((t) => (
                <Line
                  key={t}
                  x1={X(t)}
                  y1={barY + barH}
                  x2={X(t)}
                  y2={barY + barH + (Math.abs(t - Math.round(t)) < 1e-9 ? 12 : 6)}
                  stroke={c.chartInk}
                  strokeWidth={Math.abs(t - Math.round(t)) < 1e-9 ? chart.stroke : 1}
                />
              ))}
              {Array.from({ length: wholes + 1 }, (_, i) => i)
                .filter((i) => i % every === 0)
                .map((i) => (
                  <ChartText
                    key={`w${i}`}
                    x={X(i)}
                    y={barY + barH + 26}
                    fontSize={chart.tiny}
                    fill={c.chartMuted}
                    textAnchor="middle"
                  >
                    {String(i)}
                  </ChartText>
                ))}
              {many ? (
                <>
                  <Rect
                    x={X(0)}
                    y={barY}
                    width={X(dividend) - X(0)}
                    height={barH}
                    fill={c.chartHighlight}
                    fillOpacity={0.3}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeLight}
                  />
                  <ChartText
                    x={(X(0) + X(dividend)) / 2}
                    y={barY - 10}
                    fontSize={chart.small}
                    fontWeight="700"
                    fill={c.chartHighlight}
                    textAnchor="middle"
                  >
                    {`${mixed(qn, qd)} groups, too small to draw one by one`}
                  </ChartText>
                </>
              ) : null}
              {Array.from({ length: groups }, (_, i) => {
                const from = i * divisor;
                const to = Math.min(dividend, (i + 1) * divisor);
                const partial = to - from < divisor - 1e-9;
                return (
                  <G key={`g${i}`}>
                    {partial ? (
                      // The whole group the last part belongs to, dashed, so "8/9 of a group"
                      // reads against the group's size.
                      <Rect
                        x={X(from)}
                        y={barY}
                        width={X(Math.min(wholes, from + divisor)) - X(from)}
                        height={barH}
                        fill="none"
                        stroke={c.chartMuted}
                        strokeWidth={chart.strokeLight}
                        strokeDasharray={chart.dashFine}
                      />
                    ) : null}
                    <Rect
                      x={X(from)}
                      y={barY}
                      width={X(to) - X(from)}
                      height={barH}
                      fill={c.chartHighlight}
                      fillOpacity={i % 2 ? 0.2 : 0.35}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.strokeLight}
                    />
                    <Path
                      d={`M ${X(from) + 2} ${barY - 6} Q ${(X(from) + X(to)) / 2} ${barY - 26} ${X(to) - 2} ${barY - 6}`}
                      stroke={partial ? c.chartMuted : c.chartHighlight}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={partial ? chart.dashFine : undefined}
                      fill="none"
                    />
                    {groups <= 12 || partial ? (
                      <ChartText
                        x={(X(from) + X(to)) / 2}
                        y={barY - 28}
                        fontSize={chart.tiny}
                        fill={partial ? c.chartMuted : c.chartHighlight}
                        textAnchor="middle"
                      >
                        {partial ? `${mixed(qn - full * qd, qd)} of a group` : String(i + 1)}
                      </ChartText>
                    ) : null}
                  </G>
                );
              })}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {!known
          ? 'Type both fractions.'
          : p === 0
            ? 'A group can’t be 0.'
            : spec.mode === 'share'
              ? `${mixed(a, b)} is ${p}/${q} of a group, so a whole group is ${mixed(qn, qd)}.`
              : full * divisor === dividend || Math.abs(full * divisor - dividend) < 1e-9
                ? `${full} groups of ${mixed(p, q)} fit in ${mixed(a, b)}.`
                : `${full} full groups of ${mixed(p, q)} fit in ${mixed(a, b)}, and ${mixed(qn - full * qd, qd)} of another: ${mixed(qn, qd)} groups.`}
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
