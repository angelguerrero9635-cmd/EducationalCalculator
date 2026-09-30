import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { DatedRock, IndexFossil, RockDatingSpec } from '@/data/modules/typesHsl';
import { formatNumber } from '@/engine/format';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { bracketOf } from './earthModel';
import { Ball, TopLight, url, usePaintIds } from './paint';

const BW = 360;
const TOP = 30;
const LH = 30;
const X0 = 20;
const X1 = 222;
const RIGHT = 232;
const GRID = 13;

/** A repeatable "random" number in [0, 1) for grains, pebbles and vesicles. */
const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const NAMES: Record<DatedRock, string> = {
  sandstone: 'sandstone',
  shale: 'shale',
  limestone: 'limestone',
  siltstone: 'siltstone',
  conglomerate: 'conglomerate',
  ash: 'volcanic ash',
  lava: 'lava flow',
};

const fill = (c: Palette, r: DatedRock) =>
  ({
    sandstone: c.rock1,
    shale: c.rock2,
    limestone: c.rock3,
    siltstone: c.rock4,
    conglomerate: c.rock6,
    ash: c.landAsh,
    lava: c.landBasalt,
  })[r];

/** A layer's texture: grains, sheets, blocks, pebbles, ash specks or gas holes. */
function texture(c: Palette, r: DatedRock, y0: number, y1: number, i: number): ReactNode[] {
  const out: ReactNode[] = [];
  const h = y1 - y0;
  const n = Math.floor(((X1 - X0) * h) / 90);
  for (let k = 0; k < n; k++) {
    const x = X0 + 3 + rnd(i, k) * (X1 - X0 - 6);
    const y = y0 + 3 + rnd(k, i + 5) * (h - 6);
    if (r === 'sandstone' || r === 'siltstone' || r === 'ash')
      out.push(
        <Circle
          key={k}
          cx={x}
          cy={y}
          r={r === 'siltstone' ? 0.7 : 1}
          fill={r === 'ash' ? c.card : c.chartInk}
          opacity={0.4}
        />,
      );
    else if (r === 'conglomerate' && k % 3 === 0)
      out.push(
        <Circle
          key={k}
          cx={x}
          cy={y}
          r={2 + rnd(k, 9) * 3}
          fill={c.rock5}
          stroke={c.chartInk}
          strokeWidth={0.5}
          opacity={0.8}
        />,
      );
    else if (r === 'lava' && k % 2 === 0)
      out.push(<Circle key={k} cx={x} cy={y} r={1.4} fill={c.shade} opacity={0.5} />);
  }
  if (r === 'shale')
    for (let k = 1; k < 5; k++)
      out.push(
        <Line
          key={`s${k}`}
          x1={X0 + 4}
          y1={y0 + (k * h) / 5}
          x2={X1 - 6}
          y2={y0 + (k * h) / 5}
          stroke={c.chartInk}
          strokeOpacity={0.2}
          strokeDasharray="18 4"
        />,
      );
  if (r === 'limestone')
    for (let x = X0 + 16, k = 0; x < X1 - 8; x += 28, k++)
      out.push(
        <Line
          key={`j${k}`}
          x1={x + (k % 2) * 14}
          y1={y0 + 1}
          x2={x + (k % 2) * 14}
          y2={y1 - 1}
          stroke={c.chartInk}
          strokeOpacity={0.22}
        />,
      );
  return out;
}

/** An index fossil centred on (x, y), about `s` across. */
function fossilArt(c: Palette, kind: IndexFossil, x: number, y: number, s: number, shell: string) {
  switch (kind) {
    case 'trilobite':
      // Head shield, a body of segments in three lobes, a tail shield.
      return (
        <G>
          <Path
            d={`M ${x - s / 2} ${y} Q ${x - s / 2} ${y - s * 0.34} ${x} ${y - s * 0.36} Q ${x + s / 2} ${y - s * 0.34} ${x + s / 2} ${y} Q ${x + s / 2} ${y + s * 0.34} ${x} ${y + s * 0.36} Q ${x - s / 2} ${y + s * 0.34} ${x - s / 2} ${y} Z`}
            fill={shell}
            stroke={c.soilDark}
            strokeWidth={1}
          />
          <Path
            d={`M ${x - s * 0.5} ${y} A ${s * 0.28} ${s * 0.32} 0 0 1 ${x - s * 0.18} ${y - s * 0.3} L ${x - s * 0.18} ${y + s * 0.3} A ${s * 0.28} ${s * 0.32} 0 0 1 ${x - s * 0.5} ${y}`}
            fill={c.soilDark}
            fillOpacity={0.25}
          />
          {[-0.06, 0.06, 0.18, 0.3].map((t) => (
            <Line
              key={t}
              x1={x + t * s}
              y1={y - s * 0.32}
              x2={x + t * s}
              y2={y + s * 0.32}
              stroke={c.soilDark}
              strokeWidth={0.7}
            />
          ))}
          <Line
            x1={x - s * 0.18}
            y1={y - s * 0.09}
            x2={x + s * 0.44}
            y2={y - s * 0.09}
            stroke={c.soilDark}
            strokeWidth={0.8}
          />
          <Line
            x1={x - s * 0.18}
            y1={y + s * 0.09}
            x2={x + s * 0.44}
            y2={y + s * 0.09}
            stroke={c.soilDark}
            strokeWidth={0.8}
          />
        </G>
      );
    case 'ammonite': {
      // A coiled shell: a spiral with ribs across the whorls.
      const r = s / 2;
      let d = '';
      for (let i = 0; i <= 80; i++) {
        const a = (i / 80) * Math.PI * 5;
        const rr = r * Math.exp(-0.18 * (Math.PI * 5 - a)) * 0.98;
        d += `${i ? 'L' : 'M'} ${(x + rr * Math.cos(a)).toFixed(1)} ${(y + rr * Math.sin(a)).toFixed(1)} `;
      }
      return (
        <G>
          <Circle cx={x} cy={y} r={r} fill={shell} stroke={c.soilDark} strokeWidth={1} />
          <Path d={d} stroke={c.soilDark} strokeWidth={1} fill="none" />
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2;
            return (
              <Line
                key={i}
                x1={x + r * 0.62 * Math.cos(a)}
                y1={y + r * 0.62 * Math.sin(a)}
                x2={x + r * 0.97 * Math.cos(a)}
                y2={y + r * 0.97 * Math.sin(a)}
                stroke={c.soilDark}
                strokeWidth={0.6}
              />
            );
          })}
        </G>
      );
    }
    case 'fern':
      // A frond pressed flat: a stem and paired leaflets.
      return (
        <G>
          <Path
            d={`M ${x - s / 2} ${y + 3} Q ${x} ${y - 2} ${x + s / 2} ${y - 4}`}
            stroke={c.soilDark}
            strokeWidth={1.2}
            fill="none"
          />
          {[-0.35, -0.2, -0.05, 0.1, 0.25, 0.4].map((t) => {
            const px = x + t * s;
            const py = y - t * 6;
            const l = s * 0.18 * (1 - Math.abs(t));
            return (
              <G key={t}>
                <Path
                  d={`M ${px} ${py} q ${l * 0.3} ${-l} ${l} ${-l}`}
                  stroke={c.soilDark}
                  fill={shell}
                  strokeWidth={0.8}
                />
                <Path
                  d={`M ${px} ${py} q ${l * 0.3} ${l} ${l} ${l}`}
                  stroke={c.soilDark}
                  fill={shell}
                  strokeWidth={0.8}
                />
              </G>
            );
          })}
        </G>
      );
  }
}

/**
 * A cliff of layered rock dated in years (see `RockDatingSpec`): each rock in its color and
 * texture, dated layers with their ages to the right, index fossils in their layers, a dike cutting
 * up through the lower layers, a layer's age bracketed from its neighbors, and 100 atoms of a
 * sample, parent and daughter counted from the values.
 */
export function RockLayersDated({ spec, calc }: { spec: RockDatingSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('light', 'parent', 'daughter', 'dike', 'shell');
  const d = spec.dating;
  const known = (x: number | string | undefined) =>
    x !== undefined && (typeof x === 'number' || rep.known(x));
  const val = (x: number | string | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  const text = (x: number | string | undefined) =>
    x === undefined ? '' : typeof x === 'number' ? formatNumber(x) : rep.value(x, false);
  const heights = d.layers.map((l) => (l.rock === 'ash' || l.rock === 'lava' ? 20 : LH));
  const ys = heights.reduce<number[]>((a, h) => [...a, a[a.length - 1]! + h], [TOP]);
  const bottom = ys[ys.length - 1]!;
  const ages = d.layers.map((l) => val(l.age));
  const intrusion = d.intrusion
    ? { through: d.intrusion.through, age: val(d.intrusion.age) }
    : undefined;
  const br = d.bracket === undefined ? undefined : bracketOf(ages, d.bracket, intrusion);
  const parent = d.sample ? val(d.sample.parent) : undefined;
  const nParent = parent === undefined ? undefined : Math.max(0, Math.min(100, Math.round(parent)));
  const gridTop = bottom + 26;
  const height = d.sample ? gridTop + GRID * 10 + 10 : bottom + 12;
  const sampleY = (k: number) =>
    k < 0 && d.intrusion ? ys[d.intrusion.through]! + 12 : (ys[k]! + ys[k + 1]!) / 2;
  const dikeX = 150;

  return (
    <View>
      <Canvas aspect={height / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <TopLight id={ids.light} strength={0.7} />
              <Ball id={ids.parent} color={c.chartHighlight} />
              <Ball id={ids.daughter} color={c.chartSecond} />
              <Ball id={ids.shell} color={c.fat} />
            </Defs>
            <G transform={`scale(${w / BW})`}>
              {d.layers.map((l, i) => {
                const y0 = ys[i]!;
                const y1 = ys[i + 1]!;
                const lit = d.bracket === i;
                return (
                  <G key={i}>
                    <Rect x={X0} y={y0} width={X1 - X0} height={y1 - y0} fill={fill(c, l.rock)} />
                    {texture(c, l.rock, y0, y1, i)}
                    <Rect x={X0} y={y0} width={X1 - X0} height={y1 - y0} fill={url(ids.light)} />
                    <Rect
                      x={X0}
                      y={y0}
                      width={X1 - X0}
                      height={y1 - y0}
                      fill="none"
                      stroke={lit ? c.chartHighlight : c.chartInk}
                      strokeWidth={lit ? chart.strokeHeavy : 0.8}
                    />
                    <ChartText
                      x={X0 + 6}
                      y={(y0 + y1) / 2 + 4}
                      fontSize={chart.label}
                      fontWeight="600"
                      fill={l.rock === 'lava' ? c.card : c.chartInk}
                    >
                      {NAMES[l.rock]}
                    </ChartText>
                    {l.fossil ? (
                      <G>
                        {fossilArt(
                          c,
                          l.fossil,
                          X1 - 40,
                          (y0 + y1) / 2,
                          Math.min(24, y1 - y0 - 4),
                          url(ids.shell),
                        )}
                      </G>
                    ) : null}
                    {l.age !== undefined ? (
                      <G opacity={known(l.age) ? 1 : 0.4}>
                        <Line
                          x1={X1}
                          y1={(y0 + y1) / 2}
                          x2={RIGHT - 3}
                          y2={(y0 + y1) / 2}
                          stroke={c.chartInk}
                        />
                        <ChartText
                          x={RIGHT}
                          y={(y0 + y1) / 2 + 4}
                          fontSize={chart.value}
                          fontWeight="700"
                        >
                          {`${known(l.age) ? text(l.age) : '?'} million years`}
                        </ChartText>
                      </G>
                    ) : null}
                  </G>
                );
              })}
              {/* Soil and grass on top. */}
              <Rect x={X0} y={TOP - 7} width={X1 - X0} height={7} fill={c.soil} />
              <Path d={`M ${X0} ${TOP - 7} H ${X1}`} stroke={c.landGrass} strokeWidth={3} />
              {/* The dike: magma that forced its way up and cooled, cutting the layers. */}
              {d.intrusion ? (
                <G>
                  <Path
                    d={`M ${dikeX - 12} ${bottom} L ${dikeX - 8} ${ys[d.intrusion.through]! + 18} Q ${dikeX} ${ys[d.intrusion.through]! + 2} ${dikeX + 9} ${ys[d.intrusion.through]! + 16} L ${dikeX + 14} ${bottom} Z`}
                    fill={c.landCinder}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                  {Array.from({ length: 18 }, (_, k) => (
                    <Circle
                      key={k}
                      cx={dikeX - 7 + rnd(k, 3) * 16}
                      cy={
                        ys[d.intrusion!.through]! +
                        18 +
                        rnd(k, 4) * (bottom - ys[d.intrusion!.through]! - 22)
                      }
                      r={1.2}
                      fill={c.card}
                      opacity={0.5}
                    />
                  ))}
                  <G opacity={d.intrusion.age === undefined || known(d.intrusion.age) ? 1 : 0.4}>
                    <Line
                      x1={dikeX + 8}
                      y1={bottom - 12}
                      x2={RIGHT - 3}
                      y2={bottom - 12}
                      stroke={c.landCinder}
                      strokeWidth={1.5}
                    />
                    <ChartText
                      x={RIGHT}
                      y={bottom - 16}
                      fontSize={chart.label}
                      fontWeight="700"
                      fill={c.chartInk}
                    >
                      intrusion (dike)
                    </ChartText>
                    {d.intrusion.age !== undefined ? (
                      <ChartText x={RIGHT} y={bottom - 1} fontSize={chart.value} fontWeight="700">
                        {`${known(d.intrusion.age) ? text(d.intrusion.age) : '?'} million years`}
                      </ChartText>
                    ) : null}
                  </G>
                </G>
              ) : null}
              {/* The bracketed layer's range. */}
              {d.bracket !== undefined && br ? (
                <G>
                  <Path
                    d={`M ${X1 + 2} ${ys[d.bracket]!} h 6 v ${ys[d.bracket + 1]! - ys[d.bracket]!} h -6`}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                    fill="none"
                  />
                  <ChartText
                    x={RIGHT}
                    y={(ys[d.bracket]! + ys[d.bracket + 1]!) / 2 - 2}
                    fontSize={chart.value}
                    fontWeight="700"
                    fill={c.chartHighlight}
                  >
                    {br.younger !== undefined && br.older !== undefined
                      ? `${formatNumber(br.younger)} to ${formatNumber(br.older)}`
                      : br.younger !== undefined
                        ? `over ${formatNumber(br.younger)}`
                        : br.older !== undefined
                          ? `under ${formatNumber(br.older)}`
                          : '?'}
                  </ChartText>
                  <ChartText
                    x={RIGHT}
                    y={(ys[d.bracket]! + ys[d.bracket + 1]!) / 2 + 12}
                    fontSize={chart.label}
                    fill={c.chartHighlight}
                  >
                    million years
                  </ChartText>
                </G>
              ) : null}
              {/* 100 atoms of the sample: parent first, then daughter. */}
              {d.sample ? (
                <G opacity={nParent === undefined ? 0.4 : 1}>
                  <Path
                    d={`M ${X0 + GRID * 5} ${gridTop - 8} L ${d.sample.layer < 0 ? dikeX : X0 + 120} ${sampleY(d.sample.layer)}`}
                    stroke={c.chartInk}
                    strokeWidth={1}
                    strokeDasharray={chart.dashFine}
                  />
                  <Circle
                    cx={d.sample.layer < 0 ? dikeX : X0 + 120}
                    cy={sampleY(d.sample.layer)}
                    r={4}
                    fill="none"
                    stroke={c.chartInk}
                    strokeWidth={1.5}
                  />
                  {Array.from({ length: 100 }, (_, k) => (
                    <Circle
                      key={k}
                      cx={X0 + 6 + (k % 10) * GRID}
                      cy={gridTop + 6 + Math.floor(k / 10) * GRID}
                      r={5}
                      fill={url(k < (nParent ?? 100) ? ids.parent : ids.daughter)}
                      stroke={c.chartInk}
                      strokeWidth={0.4}
                    />
                  ))}
                  <Circle cx={X0 + GRID * 10 + 20} cy={gridTop + 20} r={6} fill={url(ids.parent)} />
                  <ChartText
                    x={X0 + GRID * 10 + 32}
                    y={gridTop + 25}
                    fontSize={chart.value}
                    fontWeight="700"
                  >
                    {`${nParent ?? '?'} ${d.sample.parentName}`}
                  </ChartText>
                  <ChartText
                    x={X0 + GRID * 10 + 32}
                    y={gridTop + 41}
                    fontSize={chart.label}
                    fill={c.chartMuted}
                  >
                    parent atoms left
                  </ChartText>
                  <Circle
                    cx={X0 + GRID * 10 + 20}
                    cy={gridTop + 66}
                    r={6}
                    fill={url(ids.daughter)}
                  />
                  <ChartText
                    x={X0 + GRID * 10 + 32}
                    y={gridTop + 71}
                    fontSize={chart.value}
                    fontWeight="700"
                  >
                    {`${nParent === undefined ? '?' : 100 - nParent} ${d.sample.daughterName}`}
                  </ChartText>
                  <ChartText
                    x={X0 + GRID * 10 + 32}
                    y={gridTop + 87}
                    fontSize={chart.label}
                    fill={c.chartMuted}
                  >
                    daughter atoms made
                  </ChartText>
                  {d.sample.halfLives !== undefined ? (
                    <ChartText
                      x={X0 + GRID * 10 + 20}
                      y={gridTop + 116}
                      fontSize={chart.label}
                      fill={c.chartInk}
                    >
                      {`after ${known(d.sample.halfLives) ? text(d.sample.halfLives) : '?'} half-lives`}
                    </ChartText>
                  ) : null}
                </G>
              ) : null}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>
        {(() => {
          const parts: string[] = [];
          if (d.sample && nParent !== undefined && parent !== undefined)
            parts.push(
              `${formatNumber(Number(parent.toFixed(2)))}% of the ${d.sample.parentName} is left, drawn as ${nParent} of 100 atoms.`,
            );
          if (br && d.bracket !== undefined) {
            const name = NAMES[d.layers[d.bracket]!.rock];
            if (br.younger !== undefined && br.older !== undefined)
              parts.push(
                `The ${name} is older than ${formatNumber(br.younger)} and younger than ${formatNumber(br.older)} million years.`,
              );
          }
          return (
            parts.join(' ') ||
            'Older layers lie below younger ones; a rock that cuts across layers is younger than they are.'
          );
        })()}
      </Caption>
    </View>
  );
}
