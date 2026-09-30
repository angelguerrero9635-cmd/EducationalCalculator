/**
 * An organic molecule's condensed structural formula on a sort card (H101 part 9): its groups
 * in a row joined by bond dashes (CH₃–CH₂–OH), a carbonyl carbon's O drawn above it on a double
 * bond, and the functional group lit on a tinted rounded box. Flat, in the text color.
 */
import { G, Line, Rect } from 'react-native-svg';

import { condensedUnits, groupUnits, type CondensedCard } from '@/data/modules/typesHs2d';
import { chart } from '@/theme';

import { ChartText } from '../reps/common';

const SUB = '₀₁₂₃₄₅₆₇₈₉';
const BOND = 10;
const FONT = chart.label;
/** Text of a unit as drawn: digits as subscripts, a carbonyl as its C. */
const unitText = (u: string) => (u === 'C(=O)' ? 'C' : u.replace(/\d/g, (d) => SUB[Number(d)]!));
/** Estimated width of a unit's text: letters about 0.66 em, subscripts 0.5 em. */
const unitWidth = (u: string) =>
  [...unitText(u)].reduce((s, ch) => s + (SUB.includes(ch) ? 0.5 : 0.66) * FONT, 0);

/** The card's width: every unit, the bonds between them and a margin. */
export function condensedWidth(f: CondensedCard): number {
  const us = condensedUnits(f.formula);
  return Math.ceil(us.reduce((s, u) => s + unitWidth(u), 0) + (us.length - 1) * BOND + 12);
}

export function CondensedCardView({
  f,
  ink,
  shade,
}: {
  f: CondensedCard;
  ink: string;
  shade: string;
}) {
  const us = condensedUnits(f.formula);
  const lit = new Set(groupUnits(f.formula, f.group));
  const base = 38;
  const xs: number[] = [];
  let x = 6;
  for (const u of us) {
    xs.push(x);
    x += unitWidth(u) + BOND;
  }
  const litIdx = [...lit].sort((a, b) => a - b);
  const box =
    litIdx.length > 0
      ? {
          x: xs[litIdx[0]!]! - 3,
          w:
            xs[litIdx[litIdx.length - 1]!]! +
            unitWidth(us[litIdx[litIdx.length - 1]!]!) -
            xs[litIdx[0]!]! +
            6,
          top: litIdx.some((i) => us[i] === 'C(=O)') ? 2 : base - 15,
        }
      : undefined;
  return (
    <G>
      {box ? (
        <Rect
          x={box.x}
          y={box.top}
          width={box.w}
          height={base + 6 - box.top}
          rx={5}
          fill={shade}
          fillOpacity={0.18}
          stroke={shade}
          strokeWidth={1.5}
        />
      ) : null}
      {us.map((u, i) => {
        const cx = xs[i]! + unitWidth(u) / 2;
        return (
          <G key={i}>
            {i > 0 ? (
              <Line
                x1={xs[i]! - BOND + 2}
                y1={base - 4}
                x2={xs[i]! - 2}
                y2={base - 4}
                stroke={ink}
                strokeWidth={1.3}
              />
            ) : null}
            {u === 'C(=O)' ? (
              <G>
                <Line
                  x1={cx - 2}
                  y1={base - 12}
                  x2={cx - 2}
                  y2={base - 22}
                  stroke={ink}
                  strokeWidth={1.2}
                />
                <Line
                  x1={cx + 2}
                  y1={base - 12}
                  x2={cx + 2}
                  y2={base - 22}
                  stroke={ink}
                  strokeWidth={1.2}
                />
                <ChartText
                  x={cx}
                  y={base - 25}
                  fontSize={FONT}
                  fontWeight="700"
                  textAnchor="middle"
                  fill={ink}
                >
                  O
                </ChartText>
              </G>
            ) : null}
            <ChartText
              x={xs[i]!}
              y={base}
              fontSize={FONT}
              fontWeight={lit.has(i) ? '700' : '400'}
              fill={ink}
            >
              {unitText(u)}
            </ChartText>
          </G>
        );
      })}
    </G>
  );
}
