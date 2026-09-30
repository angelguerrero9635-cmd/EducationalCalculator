/**
 * Simplifying a root on the factor tree (H28): under the tree's primes, each pair of equal
 * primes (each three, for a cube root) is ringed and brings one of them out of the root; the
 * primes left over stay under the radical: √72 = 2 × 3 × √2 = 6√2.
 */
import type { ReactNode } from 'react';
import { G, Line, Path, Rect } from 'react-native-svg';

import { chart, usePalette } from '@/theme';

import { ChartText } from './common';
import { radical, rootText, type RootSplit } from './rootSplit';

/**
 * The marks under the foot row: a ring around each group of equal primes with an arrow down to
 * the one it brings out, and the primes left over arrowed into the radical, on one line that
 * reads as the answer: 2 × 3 × √2 = 6√2.
 */
export function RootMarks({
  split,
  xs,
  y,
  r,
  cx,
  index,
}: {
  split: RootSplit;
  /** The foot primes' x positions. */
  xs: number[];
  y: number;
  r: number;
  /** The middle of the tree's column. */
  cx: number;
  index: 2 | 3;
}) {
  const c = usePalette();
  const y2 = y + 58;
  const em = chart.emphasis;
  const width = (t: string) => t.length * em * 0.6;
  // The answer line's pieces: the primes out, then the root of what is left, then the result.
  const inside = split.inside;
  const pieces = [
    ...split.out.map((p) => ({ text: String(p), color: c.chartHighlight })),
    ...(inside > 1 ? [{ text: `${radical(index)}${inside}`, color: c.chartInk }] : []),
  ];
  const result = `= ${rootText(split.outside, inside, index)}`;
  const gap = width(' × ');
  const total =
    pieces.reduce((s, p) => s + width(p.text), 0) + gap * (pieces.length - 1) + gap + width(result);
  let x = cx - total / 2;
  const at: number[] = [];
  const line: ReactNode[] = [];
  pieces.forEach((p, i) => {
    if (i > 0) {
      line.push(
        <ChartText
          key={`t${i}`}
          x={x + gap / 2}
          y={y2}
          textAnchor="middle"
          fontSize={em}
          fill={c.chartMuted}
        >
          ×
        </ChartText>,
      );
      x += gap;
    }
    at.push(x + width(p.text) / 2);
    line.push(
      <ChartText
        key={`p${i}`}
        x={x + width(p.text) / 2}
        y={y2}
        textAnchor="middle"
        fontSize={em}
        fontWeight="700"
        fill={p.color}
      >
        {p.text}
      </ChartText>,
    );
    x += width(p.text);
  });
  line.push(
    <ChartText key="res" x={x + gap / 2} y={y2} fontSize={em} fontWeight="700">
      {result}
    </ChartText>,
  );
  const arrow = (x1: number, y1: number, x2: number, y2b: number, color: string, key: string) => {
    const len = Math.hypot(x2 - x1, y2b - y1) || 1;
    const [ux, uy] = [(x2 - x1) / len, (y2b - y1) / len];
    return (
      <G key={key}>
        <Line
          x1={x1}
          y1={y1}
          x2={x2 - ux * 7}
          y2={y2b - uy * 7}
          stroke={color}
          strokeWidth={chart.strokeLight}
        />
        <Path
          d={`M ${x2} ${y2b} L ${x2 - ux * 8 - uy * 4} ${y2b - uy * 8 + ux * 4} L ${x2 - ux * 8 + uy * 4} ${y2b - uy * 8 - ux * 4} Z`}
          fill={color}
        />
      </G>
    );
  };
  const marks: ReactNode[] = [];
  split.groups.forEach(([a, b], g) => {
    const [x0, x1] = [xs[a]!, xs[b - 1]!];
    marks.push(
      <Rect
        key={`ring${g}`}
        x={x0 - r - 4}
        y={y - r - 4}
        width={x1 - x0 + 2 * r + 8}
        height={2 * r + 8}
        rx={r + 4}
        fill="none"
        stroke={c.chartHighlight}
        strokeWidth={2.5}
      />,
      arrow((x0 + x1) / 2, y + r + 5, at[g]!, y2 - em - 2, c.chartHighlight, `a${g}`),
    );
  });
  if (inside > 1)
    split.left.forEach((k) =>
      marks.push(arrow(xs[k]!, y + r + 3, at[at.length - 1]!, y2 - em - 2, c.chartMuted, `l${k}`)),
    );
  return (
    <G>
      {marks}
      {line}
    </G>
  );
}
