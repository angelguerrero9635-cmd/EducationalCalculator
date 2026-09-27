import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import {
  CHANCE_COLORS,
  PictureButton,
  chanceColor,
  chanceText,
  shuffled,
  type ChanceColor,
} from './chance';
import { Ball, FloorShadow, Glass, url, usePaintIds } from './paint';

type Spec = Extract<Representation, { kind: 'marbles' }>;

/** The most marbles the bag holds. */
export const MARBLES_MAX = 40;

/**
 * A clear bag of glass marbles tied at the neck, as many of each color as its value, mixed
 * up; the event's color is `pick`. "Draw a marble" takes one out at random and shows it
 * above the bag.
 */
export function Marbles({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const colors = spec.colors ?? CHANCE_COLORS;
  const ids = usePaintIds('bag', ...colors.map((_, i) => `m${i}`));
  const counts = spec.parts.map((id) =>
    rep.known(id) ? Math.max(0, Math.min(MARBLES_MAX, Math.round(rep.shown(id)))) : 0,
  );
  const total = counts.reduce((s, x) => s + x, 0);
  const known = spec.parts.every(rep.known);
  const pick = spec.pick ?? 0;
  const names = spec.names ?? colors.map((x) => x);
  const [drawn, setDrawn] = useState<number | undefined>(undefined);
  // One entry per marble (its outcome), mixed in a fixed random order.
  const marbles = counts
    .flatMap((k, i) => Array.from({ length: k }, () => i))
    .slice(0, MARBLES_MAX);
  const order = shuffled(marbles.length, 17 + marbles.length);
  const mixed = order.map((k) => marbles[k]!);
  const drawnIndex = drawn !== undefined && drawn < mixed.length ? drawn : undefined;
  const color = (i: number) => chanceColor(c, (colors[i] ?? 'red') as ChanceColor);
  const pickName = names[pick] ?? `outcome ${pick + 1}`;
  const sym = (id: string) => (rep.words ? rep.variable(id).name : rep.variable(id).symbol);

  return (
    <View>
      <Canvas aspect={0.64}>
        {({ w, h }) => {
          const legendH = 26;
          const cx = w / 2;
          const bagW = Math.min(w * 0.56, 220);
          const bottom = h - legendH - 12;
          const inner = bagW - 24;
          // The biggest marble that packs every one into the bag's body.
          let r = 16;
          const rowsFor = (rr: number) =>
            Math.ceil(mixed.length / Math.max(1, Math.floor(inner / (2 * rr))));
          while (r > 5 && rowsFor(r) * 2 * r * 0.88 > h * 0.5) r -= 0.5;
          // The bag is as tall as its marbles need (and never squat), tied above them.
          const bodyTop = bottom - Math.max(rowsFor(r) * 2 * r * 0.88 + 30, bagW * 0.55);
          const neckY = bodyTop - 30;
          const perRow = Math.max(1, Math.floor(inner / (2 * r)));
          const spots = mixed.map((_, k) => {
            const row = Math.floor(k / perRow);
            const col = k % perRow;
            const inRow = Math.min(perRow, mixed.length - row * perRow);
            const shift = row % 2 ? r * 0.5 : 0;
            return {
              x: cx - (inRow * 2 * r) / 2 + r + col * 2 * r + shift - (row % 2 ? r * 0.25 : 0),
              y: bottom - 10 - r - row * 2 * r * 0.88,
            };
          });
          // The bag: a gathered neck, then a rounded body.
          const L = cx - bagW / 2;
          const R = cx + bagW / 2;
          const bag = `M ${cx - 16} ${neckY + 8} C ${cx - 30} ${bodyTop - 6}, ${L} ${bodyTop}, ${L + 4} ${bodyTop + 40} L ${L} ${bottom - 30} Q ${L} ${bottom} ${L + 30} ${bottom} L ${R - 30} ${bottom} Q ${R} ${bottom} ${R} ${bottom - 30} L ${R - 4} ${bodyTop + 40} C ${R} ${bodyTop}, ${cx + 30} ${bodyTop - 6}, ${cx + 16} ${neckY + 8} Z`;
          const legend = counts.map((k, i) => ({ k, i })).filter((x) => x.k > 0 || x.i === pick);
          const slot = w / Math.max(1, legend.length);
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              <Defs>
                <Glass id={ids.bag!} />
                {colors.map((name, i) => (
                  <Ball key={name} id={ids[`m${i}`]!} color={color(i).fill} />
                ))}
              </Defs>
              <FloorShadow cx={cx + 4} cy={bottom + 3} rx={bagW * 0.5} ry={6} />
              {mixed.map((m, k) => (
                <Circle
                  key={k}
                  cx={spots[k]!.x}
                  cy={spots[k]!.y}
                  r={r - 0.5}
                  fill={url(ids[`m${m}`]!)}
                  stroke={c.chartInk}
                  strokeOpacity={0.35}
                  strokeWidth={0.75}
                  opacity={k === drawnIndex ? 0.15 : 1}
                />
              ))}
              {/* The clear bag over the marbles, with its tie. */}
              <Path
                d={bag}
                fill={url(ids.bag!)}
                fillOpacity={0.35}
                stroke={c.glassEdge}
                strokeWidth={chart.strokeLight}
              />
              <Path
                d={`M ${cx - 16} ${neckY + 8} Q ${cx} ${neckY - 16} ${cx + 16} ${neckY + 8}`}
                fill={url(ids.bag!)}
                fillOpacity={0.35}
                stroke={c.glassEdge}
                strokeWidth={chart.strokeLight}
              />
              {/* Folds gathered under the tie. */}
              {[-10, 0, 10].map((dx) => (
                <Path
                  key={`f${dx}`}
                  d={`M ${cx + dx * 0.6} ${neckY + 12} Q ${cx + dx * 1.6} ${bodyTop - 4} ${cx + dx * 2.8} ${bodyTop + 14}`}
                  fill="none"
                  stroke={c.glassEdge}
                  strokeOpacity={0.6}
                  strokeWidth={1}
                />
              ))}
              <Ellipse cx={cx} cy={neckY + 10} rx={19} ry={4} fill={c.woodDark} />
              {drawnIndex !== undefined ? (
                <G>
                  <Circle
                    cx={cx + bagW / 2 + 4}
                    cy={neckY - 6}
                    r={Math.max(r, 11)}
                    fill={url(ids[`m${mixed[drawnIndex]}`]!)}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                  <ChartText
                    x={cx + bagW / 2 - Math.max(r, 11) - 4}
                    y={neckY - 2}
                    fontSize={chart.small}
                    fontWeight="700"
                    textAnchor="end"
                  >
                    {`drew ${names[mixed[drawnIndex]!] ?? ''}`}
                  </ChartText>
                </G>
              ) : null}
              {legend.map(({ k, i }, n) => (
                <G key={`l${i}`}>
                  <Circle
                    cx={slot * n + slot / 2 - 26}
                    cy={h - legendH / 2}
                    r={6}
                    fill={color(i).fill}
                    stroke={i === pick ? c.chartInk : 'none'}
                    strokeWidth={chart.strokeLight}
                  />
                  <ChartText
                    x={slot * n + slot / 2 - 16}
                    y={h - legendH / 2 + 4}
                    fontSize={chart.small}
                    fontWeight={i === pick ? '700' : '400'}
                  >
                    {`${names[i] ?? ''} ${k}`}
                  </ChartText>
                </G>
              ))}
            </Svg>
          );
        }}
      </Canvas>
      <PictureButton
        testID="marbles-draw"
        label="Draw a marble"
        onPress={() =>
          setDrawn(mixed.length ? Math.floor(Math.random() * mixed.length) : undefined)
        }
      />
      <Caption>
        {[
          spec.total
            ? `${sym(spec.total)} = ${counts.join(' + ')} = ${rep.value(spec.total)} marbles`
            : `${counts.join(' + ')} = ${total} marbles`,
          spec.chance && total > 0
            ? `${rep.words ? rep.variable(spec.chance).name : `${sym(spec.chance)}(${pickName})`} = ${chanceText(counts[pick]!, total, rep.value(spec.chance), rep.shown(spec.chance))}`
            : undefined,
          drawnIndex !== undefined
            ? `The marble drawn is ${names[mixed[drawnIndex]!] ?? ''}.`
            : undefined,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Caption>
    </View>
  );
}
