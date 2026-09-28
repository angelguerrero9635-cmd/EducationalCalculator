import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, useRep, Caption } from './common';
import { Ball, TopLight, url, usePaintIds } from './paint';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'rockLayers' }>;

/** A repeatable "random" number in [0, 1) for grains and joints, so the rock never flickers. */
const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Rock kinds in order down the cliff; each has its color and texture. */
const KINDS = ['sandstone', 'shale', 'limestone', 'clay', 'siltstone', 'mudstone'] as const;
/** How far each kind sticks out of the cliff face: hard rock juts, soft rock wears back. */
const JUT: Record<(typeof KINDS)[number], number> = {
  sandstone: 6,
  shale: -5,
  limestone: 9,
  clay: -8,
  siltstone: 2,
  mudstone: -3,
};

const NUMBERS = 26;
const RIGHT = 128;

/**
 * A cliff cut open to show its rock layers, numbered from the top, holding two fossils. Each
 * fossil sits in the layer below the number of layers above it, so the deeper one is the older
 * one; a bracket counts the layers between them.
 */
export function RockLayers({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const [first, second] = spec.fossils;
  const above = (id: string) =>
    rep.known(id) ? Math.max(0, Math.min(12, Math.round(rep.shown(id)))) : undefined;
  const a = above(first);
  const b = above(second);
  const n = Math.max(a ?? 0, b ?? 0) + 1;
  const fills = [c.rock1, c.rock2, c.rock3, c.rock4, c.rock5, c.rock6];
  const paint = usePaintIds('light', 'bone', 'shell');
  // Layers as thick as fit: a few thick ones, or many thinner ones on a taller cliff.
  const layerH = Math.max(22, Math.min(36, 250 / n));
  const top = 30;
  const height = top + n * layerH + 10;
  const short = (id: string) => rep.variable(id).name.replace(/^Layers above the /, '');

  return (
    <View>
      <Canvas aspect={(w) => height / w}>
        {({ w, h }) => {
          const left = NUMBERS + 4;
          const right = w - RIGHT;
          const width = right - left;
          const layerY = (i: number) => top + i * layerH;
          const tags: ReactNode[] = [];

          // ── Layers ──
          const layers = Array.from({ length: n }, (_, i) => {
            const kind = KINDS[i % KINDS.length]!;
            const y0 = layerY(i);
            const y1 = y0 + layerH;
            // A rough cliff face on the right: the layer's own jut, with small breaks.
            const jut = JUT[kind];
            const xr = (t: number) => right - 8 + jut + (rnd(i, t) - 0.5) * 4;
            const d = `M ${left} ${y0} H ${xr(1)} L ${xr(2)} ${y0 + layerH * 0.35} L ${xr(3)} ${y0 + layerH * 0.7} L ${xr(4)} ${y1} H ${left} Z`;
            const marks: ReactNode[] = [];
            const ink = c.chartInk;
            if (kind === 'sandstone' || kind === 'siltstone') {
              // Sand grains, and in sandstone the slanting cross-beds of old dunes.
              const grains = Math.floor((width * layerH) / (kind === 'sandstone' ? 110 : 70));
              for (let k = 0; k < grains; k++)
                marks.push(
                  <Circle
                    key={`g${k}`}
                    cx={left + 3 + rnd(i, k) * (width - 14)}
                    cy={y0 + 3 + rnd(k, i + 7) * (layerH - 6)}
                    r={kind === 'sandstone' ? 1.1 : 0.7}
                    fill={ink}
                    opacity={0.35}
                  />,
                );
              if (kind === 'sandstone')
                for (let x = left + 12; x < right - 24; x += 34)
                  for (let k = 0; k < 3; k++)
                    marks.push(
                      <Line
                        key={`x${x}-${k}`}
                        x1={x + k * 6}
                        y1={y1 - 3}
                        x2={x + k * 6 + layerH * 0.7}
                        y2={y0 + 4}
                        stroke={ink}
                        strokeOpacity={0.18}
                      />,
                    );
            } else if (kind === 'shale' || kind === 'mudstone') {
              // Thin laminae: shale splits in sheets.
              const sheets = Math.max(2, Math.floor(layerH / (kind === 'shale' ? 5 : 9)));
              for (let k = 1; k < sheets; k++) {
                const y = y0 + (k * layerH) / sheets;
                marks.push(
                  <Line
                    key={`s${k}`}
                    x1={left + 2 + rnd(i, k) * 14}
                    y1={y}
                    x2={right - 12 - rnd(k, i) * 18}
                    y2={y}
                    stroke={ink}
                    strokeOpacity={0.22}
                    strokeDasharray={kind === 'shale' ? '18 4' : '6 5'}
                  />,
                );
              }
            } else if (kind === 'limestone') {
              // Blocky joints: limestone breaks into blocks like a brick wall.
              const mid = y0 + layerH / 2;
              marks.push(
                <Line
                  key="bed"
                  x1={left}
                  y1={mid}
                  x2={right - 6}
                  y2={mid}
                  stroke={ink}
                  strokeOpacity={0.22}
                />,
              );
              for (let x = left + 18, k = 0; x < right - 12; x += 30, k++) {
                const upper = k % 2 === 0;
                marks.push(
                  <Line
                    key={`j${k}`}
                    x1={x + (upper ? 0 : 15)}
                    y1={upper ? y0 + 1 : mid}
                    x2={x + (upper ? 0 : 15)}
                    y2={upper ? mid : y1 - 1}
                    stroke={ink}
                    strokeOpacity={0.25}
                  />,
                );
              }
            } else {
              // Clay: smooth, with a few soft wavy bands.
              for (let k = 1; k < 3; k++) {
                const y = y0 + (k * layerH) / 3;
                let p = `M ${left} ${y}`;
                for (let x = left; x < right - 10; x += 16) p += ` q 4 ${k % 2 ? -2 : 2} 8 0 t 8 0`;
                marks.push(
                  <Path key={`w${k}`} d={p} fill="none" stroke={ink} strokeOpacity={0.16} />,
                );
              }
            }
            return (
              <G key={`l${i}`}>
                <Path d={d} fill={fills[i % fills.length]} />
                {marks}
                <Path d={d} fill={url(paint.light)} />
                <Path d={d} fill="none" stroke={c.chartInk} strokeWidth={1.2} strokeOpacity={0.8} />
                <ChartText
                  x={NUMBERS / 2}
                  y={y0 + layerH / 2 + chart.label * 0.36}
                  fontSize={chart.label}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {i + 1}
                </ChartText>
              </G>
            );
          });

          // ── Soil and grass on top ──
          let ground = `M ${left} ${top}`;
          for (let x = left; x <= right + 6; x += 12)
            ground += ` L ${Math.min(x, right + 6)} ${top - 8 - rnd(x, 3) * 5}`;
          ground += ` L ${right + 6} ${top} Z`;
          const tufts = Array.from({ length: Math.floor(width / 14) }, (_, k) => {
            const x = left + 6 + k * 14 + rnd(k, 5) * 5;
            const y = top - 9;
            return (
              <Path
                key={`t${k}`}
                d={`M ${x - 4} ${y - 2} L ${x - 1} ${y + 3} M ${x} ${y - 6} L ${x} ${y + 3} M ${x + 4} ${y - 3} L ${x + 1} ${y + 3}`}
                stroke={k % 2 ? c.lifeDeep : c.life}
                strokeWidth={1.6}
                strokeLinecap="round"
              />
            );
          });

          // ── Fossils ──
          const fossil = (id: string, layers: number | undefined, shell: boolean) => {
            if (layers === undefined) return null;
            // Both fossils sit to the right, near their names; side by side when in one layer.
            const cx = left + width * (shell ? 0.76 : a === b ? 0.42 : 0.6);
            const cy = layerY(layers) + layerH / 2;
            const room = layerH - 5;
            const nameY = cy + chart.label * 0.36 + (a === b ? (shell ? 8 : -8) : 0);
            let reach: number;
            let art: ReactNode;
            if (shell) {
              // A scallop: a ribbed fan from its hinge, with the two little ears.
              const H = Math.min(32, room);
              const W = H * 1.15;
              const hy = cy + H / 2;
              const ty = cy - H / 2;
              const outline = `M ${cx - W * 0.12} ${hy} L ${cx - W / 2} ${cy - H * 0.02} Q ${cx - W / 2} ${ty} ${cx} ${ty} Q ${cx + W / 2} ${ty} ${cx + W / 2} ${cy - H * 0.02} L ${cx + W * 0.12} ${hy} Z`;
              reach = cx + W / 2;
              art = (
                <G>
                  <Path
                    d={`M ${cx - W * 0.28} ${hy} L ${cx - W * 0.12} ${hy - H * 0.2} L ${cx + W * 0.12} ${hy - H * 0.2} L ${cx + W * 0.28} ${hy} Z`}
                    fill={url(paint.shell)}
                    stroke={c.soilDark}
                  />
                  <Path d={outline} fill={url(paint.shell)} stroke={c.soilDark} strokeWidth={1.4} />
                  {[-0.4, -0.27, -0.14, 0, 0.14, 0.27, 0.4].map((t) => (
                    <Line
                      key={t}
                      x1={cx + t * W * 0.12}
                      y1={hy - 1}
                      x2={cx + t * W * 1.1}
                      y2={ty + H * (0.06 + Math.abs(t) * 0.35)}
                      stroke={c.soilDark}
                      strokeOpacity={0.6}
                    />
                  ))}
                </G>
              );
            } else {
              // A fish skeleton pressed in stone: skull, backbone, ribs and a fanned tail.
              const L = Math.min(50, room * 2.2);
              const H = L * 0.42;
              const x0 = cx - L / 2;
              const body = `M ${x0} ${cy} Q ${x0 + L * 0.12} ${cy - H / 2} ${x0 + L * 0.45} ${cy - H / 2} Q ${x0 + L * 0.72} ${cy - H * 0.42} ${x0 + L * 0.82} ${cy} Q ${x0 + L * 0.72} ${cy + H * 0.42} ${x0 + L * 0.45} ${cy + H / 2} Q ${x0 + L * 0.12} ${cy + H / 2} ${x0} ${cy} Z`;
              const tail = `M ${x0 + L * 0.8} ${cy} L ${x0 + L} ${cy - H * 0.55} Q ${x0 + L * 0.94} ${cy} ${x0 + L} ${cy + H * 0.55} Z`;
              reach = x0 + L;
              art = (
                <G>
                  <Path d={body} fill={c.shade} fillOpacity={0.16} />
                  <Path d={tail} fill={url(paint.bone)} stroke={c.soilDark} strokeWidth={1.1} />
                  <Path
                    d={`M ${x0 + L * 0.22} ${cy} L ${x0 + L * 0.84} ${cy}`}
                    stroke={c.bone}
                    strokeWidth={2.4}
                    strokeLinecap="round"
                  />
                  <Path
                    d={`M ${x0 + L * 0.22} ${cy} L ${x0 + L * 0.84} ${cy}`}
                    stroke={c.soilDark}
                    strokeWidth={0.8}
                    strokeDasharray="2 1.5"
                  />
                  {[0.3, 0.39, 0.48, 0.57, 0.66, 0.74].map((t) => {
                    const x = x0 + L * t;
                    const r = H * (0.46 - Math.abs(t - 0.45) * 0.55);
                    return (
                      <Path
                        key={t}
                        d={`M ${x + 3} ${cy - r} Q ${x - 1} ${cy} ${x + 3} ${cy + r}`}
                        fill="none"
                        stroke={c.bone}
                        strokeWidth={1.6}
                        strokeLinecap="round"
                      />
                    );
                  })}
                  {/* The skull and its eye socket. */}
                  <Path
                    d={`M ${x0 + 1} ${cy} Q ${x0 + L * 0.06} ${cy - H * 0.42} ${x0 + L * 0.22} ${cy - H * 0.36} L ${x0 + L * 0.22} ${cy + H * 0.36} Q ${x0 + L * 0.06} ${cy + H * 0.42} ${x0 + 1} ${cy} Z`}
                    fill={url(paint.bone)}
                    stroke={c.soilDark}
                    strokeWidth={1.1}
                  />
                  <Circle
                    cx={x0 + L * 0.12}
                    cy={cy - H * 0.1}
                    r={Math.max(1.4, H * 0.1)}
                    fill={c.soilDark}
                  />
                </G>
              );
            }
            tags.push(
              <G key={id}>
                <Line
                  x1={reach + 2}
                  y1={cy}
                  x2={right + 10}
                  y2={nameY - chart.label * 0.36}
                  stroke={c.chartInk}
                  strokeWidth={1}
                />
                <ChartText x={right + 13} y={nameY} fontSize={chart.label} fontWeight="700">
                  {short(id)}
                </ChartText>
              </G>,
            );
            return <G key={`f${id}`}>{art}</G>;
          };

          // ── The bracket between the fossils ──
          let bracket: ReactNode = null;
          if (a !== undefined && b !== undefined && a !== b) {
            const x = right + 60;
            const ya = layerY(Math.min(a, b)) + layerH / 2;
            const yb = layerY(Math.max(a, b)) + layerH / 2;
            const apart = Math.abs(a - b);
            const value = rep.known(spec.difference) ? rep.value(spec.difference, false) : '?';
            bracket = (
              <G>
                <Path
                  d={`M ${x - 6} ${ya} H ${x} V ${yb} H ${x - 6}`}
                  fill="none"
                  stroke={c.chartHighlight}
                  strokeWidth={chart.stroke}
                />
                {/* One tick per layer boundary crossed, so the layers can be counted. */}
                {Array.from({ length: apart }, (_, k) => (
                  <Line
                    key={k}
                    x1={x - 3}
                    y1={layerY(Math.min(a, b) + k + 1)}
                    x2={x + 3}
                    y2={layerY(Math.min(a, b) + k + 1)}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeLight}
                  />
                ))}
                <ChartText
                  x={x + 7}
                  y={(ya + yb) / 2 - 2}
                  fontSize={chart.value}
                  fontWeight="700"
                  fill={c.chartHighlight}
                >
                  {`${value} layer${value === '1' ? '' : 's'}`}
                </ChartText>
                <ChartText
                  x={x + 7}
                  y={(ya + yb) / 2 + chart.value}
                  fontSize={chart.value}
                  fontWeight="700"
                  fill={c.chartHighlight}
                >
                  apart
                </ChartText>
              </G>
            );
          }

          return (
            <Svg width={w} height={h}>
              <Defs>
                <TopLight id={paint.light} strength={0.7} />
                <Ball id={paint.bone} color={c.bone} />
                <Ball id={paint.shell} color={c.fat} />
              </Defs>
              {layers}
              <Path d={ground} fill={c.soil} stroke={c.soilDark} strokeWidth={1} />
              {tufts}
              {fossil(first, a, false)}
              {fossil(second, b, true)}
              {tags}
              {bracket}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {(() => {
          const names = `${rep.named(first)}. ${rep.named(second)}.`;
          if (a === undefined || b === undefined) return names;
          if (a === b) return `${names} Same layer: about the same age.`;
          const [deep, high] = a > b ? [first, second] : [second, first];
          return `${names} The ${short(deep)} is ${rep.value(spec.difference)} layers deeper than the ${short(high)}, so it is older.`;
        })()}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          { var: first, steps: [1], pin: [second] },
          { var: second, steps: [1], pin: [first] },
        ]}
      />
    </View>
  );
}
