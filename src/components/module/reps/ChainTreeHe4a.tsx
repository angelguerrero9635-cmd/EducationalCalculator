/**
 * HC98 (M-P19): `treeDiagram` `chain`, the multivariable chain rule as a tree. z at the top,
 * x and y (or three letters) under it, t under each; the upper branches carry the partials
 * (∂z/∂x = 4), the lower ones the rates (dx/dt = 2); each path's product sits under its leaf and
 * their sum under the tree. Flat, like the other trees.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line } from 'react-native-svg';

import type { ChainTreeHe4a as ChainSpec } from '@/data/modules/typesHe4a';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, useRep } from './common';
import { MathText, textWidth } from './hsdText';

const fmt = (x: number) => formatNumber(Number(x.toPrecision(6)));
const par = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x));

const NODE = 15;
const H = 300;

export function ChainTreeHe4a({ spec, calc }: { spec: ChainSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = (x: number | string) =>
    typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  const z = spec.top ?? 'z';
  const mids = spec.middle ?? ['x', 'y'];
  const t = spec.bottom ?? 't';
  const partials = spec.partials.map(read);
  const rates = spec.rates.map(read);
  const products = mids.map((_, i) =>
    partials[i] !== undefined && rates[i] !== undefined ? partials[i]! * rates[i]! : undefined,
  );
  const all = products.every((p) => p !== undefined);
  const sum = all ? products.reduce<number>((s, p) => s + p!, 0) : undefined;
  const total = spec.total && rep.known(spec.total) ? rep.val(spec.total) : sum;
  const partialName = (m: string) => `∂${z}/∂${m}`;
  const rateName = (m: string) => `d${m}/d${t}`;
  const sumLine =
    all && total !== undefined
      ? `d${z}/d${t} = ${products.map((p, i) => (i ? par(p!) : fmt(p!))).join(' + ')} = ${fmt(total)}`
      : `d${z}/d${t} = ${mids.map((m) => `${partialName(m)} × ${rateName(m)}`).join(' + ')}`;

  const caption = [
    `Each path from ${z} down to ${t} multiplies its branches; d${z}/d${t} adds the paths.`,
    ...(all && total !== undefined
      ? [
          `d${z}/d${t} = ${mids.map((m) => `${partialName(m)} × ${rateName(m)}`).join(' + ')} = ${mids
            .map((_, i) => `${par(partials[i]!)} × ${par(rates[i]!)}`)
            .join(' + ')} = ${fmt(total)}.`,
        ]
      : ['Type each partial and each rate to multiply the paths.']),
  ];

  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w }) => {
          const n = mids.length;
          const xs = mids.map((_, i) => (w * (2 * i + 1)) / (2 * n));
          const [yTop, yMid, yLeaf] = [28, 128, 214];
          const label = (
            text: string,
            x: number,
            y: number,
            anchor: 'start' | 'middle' | 'end',
            bold = false,
          ) => {
            const tw = textWidth(text, chart.label);
            const left = anchor === 'start' ? x : anchor === 'end' ? x - tw : x - tw / 2;
            const nudge = Math.max(0, 2 - left) - Math.max(0, left + tw - (w - 2));
            return (
              <MathText
                key={`${text}-${x}-${y}`}
                text={text}
                x={x + nudge}
                y={y}
                textAnchor={anchor}
                fontSize={chart.label}
                fontWeight={bold ? '700' : '400'}
                halo
              />
            );
          };
          const node = (x: number, y: number, name: string, key: string, lit = false) => (
            <G key={key}>
              <Circle
                cx={x}
                cy={y}
                r={NODE}
                fill={lit ? c.chartHighlight : c.card}
                fillOpacity={lit ? 0.15 : 1}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              <MathText
                text={name}
                x={x}
                y={y + 5}
                textAnchor="middle"
                fontSize={chart.emphasis}
                fontWeight="700"
              />
            </G>
          );
          return (
            <Svg width={w} height={H}>
              {xs.map((x, i) => {
                const m = mids[i]!;
                // The upper branch's label sits beside it, outward; a straight-down branch (the
                // middle of three) takes it on the right, low down where the slanted branches
                // have spread apart, and the slanted ones sit higher, so the three don't meet.
                const outward = x < w / 2 - 1 ? -1 : 1;
                const straight = Math.abs(x - w / 2) < 1;
                const along = n === 3 ? (straight ? 0.78 : 0.4) : 0.5;
                // Off a slanted branch along its upward normal, clear of the line.
                const len = Math.hypot(x - w / 2, yMid - yTop) || 1;
                const [nx, ny] = straight
                  ? [1, 0]
                  : [(outward * (yMid - yTop)) / len, -Math.abs(x - w / 2) / len];
                const [mx, my] = [
                  w / 2 + (x - w / 2) * along + nx * 8,
                  yTop + (yMid - yTop) * along + ny * 8 - (straight ? 0 : 2),
                ];
                const pText = `${partialName(m)}${partials[i] !== undefined ? ` = ${fmt(partials[i]!)}` : ''}`;
                const rText = `${rateName(m)}${rates[i] !== undefined ? ` = ${fmt(rates[i]!)}` : ''}`;
                // The lower label goes right of its branch, or left where the right runs out;
                // with three branches it sits on its branch (on a halo), as the gaps are narrow.
                const rRight = x + 8 + textWidth(rText, chart.label) <= w - 2;
                const [rx, rAnchor] =
                  n === 3
                    ? [x, 'middle' as const]
                    : rRight
                      ? [x + 8, 'start' as const]
                      : [x - 8, 'end' as const];
                return (
                  <G key={m}>
                    <Line
                      x1={w / 2}
                      y1={yTop + NODE}
                      x2={x}
                      y2={yMid - NODE}
                      stroke={c.chartMuted}
                      strokeWidth={chart.stroke}
                    />
                    <Line
                      x1={x}
                      y1={yMid + NODE}
                      x2={x}
                      y2={yLeaf - NODE}
                      stroke={c.chartMuted}
                      strokeWidth={chart.stroke}
                    />
                    {label(pText, mx, my + 4, outward < 0 && !straight ? 'end' : 'start')}
                    {label(rText, rx, (yMid + yLeaf) / 2 + 4, rAnchor)}
                    {node(x, yMid, m, `m${i}`)}
                    {node(x, yLeaf, t, `l${i}`)}
                    {products[i] !== undefined
                      ? label(
                          `${par(partials[i]!)} × ${par(rates[i]!)} = ${fmt(products[i]!)}`,
                          x,
                          yLeaf + NODE + 18,
                          'middle',
                          true,
                        )
                      : null}
                  </G>
                );
              })}
              {node(w / 2, yTop, z, 'top', true)}
              {label(sumLine, w / 2, H - 14, 'middle', true)}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{caption.join(' · ')}</Caption>
    </View>
  );
}
