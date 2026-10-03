/**
 * HC188 `venn` with `three` (VennThree in typesHe4n.ts): three overlapping circles, each named
 * with its size and outlined in its own colour and dash (so the sets read without colour), the
 * count in each of the 7 regions worked out from the page's values (inclusion–exclusion), and
 * the union bracketed with its value. With `total`, the universe's box and “neither”. A region
 * whose values include a “?” is blank; a negative region fades the drawing, the caption says
 * why. Flat.
 */
import Svg, { Circle, G, Rect } from 'react-native-svg';

import type { VennThree as Spec } from '@/data/modules/typesHe4n';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { useReader, VBracket } from './he3dKit';
import { vennRegions } from './he4nMath';

const H = 286;
const R = 70;

/** Centres (relative to the middle) and where each region's count sits. */
const CENTERS: [number, number][] = [
  [-40, -23],
  [40, -23],
  [0, 46],
];
const SPOTS = {
  aOnly: [-68, -40],
  bOnly: [68, -40],
  cOnly: [0, 88],
  abOnly: [0, -52],
  acOnly: [-45, 32],
  bcOnly: [45, 32],
  abc: [0, 4],
} as const;

export function VennThree({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const r = useReader(calc);
  const v = {
    a: r.get(spec.a),
    b: r.get(spec.b),
    c: r.get(spec.c),
    ab: r.get(spec.ab),
    ac: r.get(spec.ac),
    bc: r.get(spec.bc),
    abc: r.get(spec.abc),
  };
  const reg = vennRegions(v);
  const names = spec.names ?? ['A', 'B', 'C'];
  const total = r.get(spec.total);
  const union = reg.union;
  const neither = total !== undefined && union !== undefined ? total - union : undefined;
  const parts = Object.entries(reg).filter(([k]) => k !== 'union');
  const negative = parts.some(([, x]) => x !== undefined && x < 0) || (neither ?? 0) < 0;
  const caption: string[] = [];
  const f = (x: number | undefined) => (x === undefined ? '?' : formatNumber(x));
  if (union !== undefined) {
    caption.push(
      `|A ∪ B ∪ C| = ${f(v.a)} + ${f(v.b)} + ${f(v.c)} − ${f(v.ab)} − ${f(v.ac)} − ${f(v.bc)} + ${f(v.abc)} = ${f(union)}.`,
    );
    if (!negative)
      caption.push(
        `The 7 regions: ${[reg.aOnly, reg.bOnly, reg.cOnly, reg.abOnly, reg.acOnly, reg.bcOnly, reg.abc].map(f).join(' + ')} = ${f(union)}.`,
      );
  }
  if (negative)
    caption.push(
      'These counts can’t be: a region comes out below 0 (an overlap is larger than what it lies in).',
    );
  else if (neither !== undefined)
    caption.push(`Neither: ${f(total)} − ${f(union)} = ${f(neither)}.`);
  return (
    <>
      <Canvas aspect={(w) => H / w}>
        {({ w }) => {
          const cx = w / 2 - 14;
          const cy = 128;
          const ink = (k: number) => [c.vennSetA, c.vennSetB, c.vennSetC][k]!;
          const dash = [undefined, '7 3', '2 3'];
          const sizes = [v.a, v.b, v.c];
          const nameAt: [number, number, 'end' | 'start' | 'middle'][] = [
            [cx - 66, cy - 98, 'end'],
            [cx + 66, cy - 98, 'start'],
            [cx, cy + 140, 'middle'],
          ];
          return (
            <Svg width={w} height={H}>
              <G opacity={negative ? 0.4 : 1}>
                {total !== undefined ? (
                  <G>
                    <Rect
                      x={6}
                      y={6}
                      width={w - 12}
                      height={H - 12}
                      rx={6}
                      fill="none"
                      stroke={c.chartGrid}
                      strokeWidth={1.5}
                    />
                    <ChartText x={14} y={H - 16} fontSize={chart.label} fill={c.chartMuted}>
                      {neither !== undefined && neither >= 0
                        ? `neither ${formatNumber(neither)}`
                        : 'neither'}
                    </ChartText>
                  </G>
                ) : null}
                {CENTERS.map(([dx, dy], k) => (
                  <Circle
                    key={`f${k}`}
                    cx={cx + dx}
                    cy={cy + dy}
                    r={R}
                    fill={ink(k)}
                    fillOpacity={0.14}
                  />
                ))}
                {CENTERS.map(([dx, dy], k) => (
                  <Circle
                    key={`s${k}`}
                    cx={cx + dx}
                    cy={cy + dy}
                    r={R}
                    fill="none"
                    stroke={ink(k)}
                    strokeWidth={chart.stroke}
                    strokeDasharray={dash[k]}
                  />
                ))}
                {nameAt.map(([x, y, anchor], k) => (
                  <ChartText
                    key={`n${k}`}
                    x={x}
                    y={y}
                    textAnchor={anchor}
                    fontSize={chart.label}
                    fontWeight="700"
                    fill={c.chartInk}
                  >
                    {`${names[k]}: ${sizes[k] === undefined ? '?' : formatNumber(sizes[k]!)}`}
                  </ChartText>
                ))}
                {(Object.keys(SPOTS) as (keyof typeof SPOTS)[]).map((key) => {
                  const x = reg[key];
                  if (x === undefined) return null;
                  const [dx, dy] = SPOTS[key];
                  return (
                    <ChartText
                      key={key}
                      x={cx + dx}
                      y={cy + dy + 5}
                      textAnchor="middle"
                      fontSize={chart.emphasis}
                      fontWeight="700"
                      fill={c.chartInk}
                    >
                      {formatNumber(x)}
                    </ChartText>
                  );
                })}
                {union !== undefined ? (
                  <VBracket
                    y1={cy - 93}
                    y2={cy + 116}
                    x={cx + 120}
                    side="right"
                    label={`∪ = ${formatNumber(union)}`}
                    color={c.chartInk}
                  />
                ) : null}
              </G>
            </Svg>
          );
        }}
      </Canvas>
      {caption.length ? <Caption>{caption.join(' ')}</Caption> : null}
    </>
  );
}
