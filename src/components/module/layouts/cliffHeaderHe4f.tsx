/**
 * HC120 (b): a sequence page's header figure, the cliff to read an order of events from
 * (CliffHeader in typesHe4f.ts): beds in rock colours with their textures, the beds under an
 * angular unconformity tilted and planed off by its wavy erosion surface, flat beds over it, a
 * dike cutting up through every bed it reaches, and today's eroded surface. Every bed and the dike
 * are named. Painted (rock); geometry in cliffMath.ts.
 */
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { CliffHeader, CliffRock } from '@/data/modules/typesHe4f';
import { chart, usePalette, type Palette } from '@/theme';

import { Canvas, ChartText } from '../reps/common';
import { TopLight, url, usePaintIds } from '../reps/paint';
import { CLIFF, cliffGeometry, underCount } from './cliffMath';

const fillOf = (c: Palette, r: CliffRock) =>
  ({
    sandstone: c.rock1,
    shale: c.rock2,
    limestone: c.rock3,
    siltstone: c.rock4,
    conglomerate: c.rock6,
  })[r];

/** A repeatable "random" number in [0, 1). */
const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export function CliffHeaderView({ header }: { header: CliffHeader }) {
  const c = usePalette();
  const ids = usePaintIds('light', 'under');
  const { x0, x1, ground, bottom, w: BW } = CLIFF;
  const g = cliffGeometry(header);
  const k = underCount(header);
  const u = g.unconformity;
  const xm = (x0 + x1) / 2;
  const wavy = (y: number) =>
    Array.from({ length: 17 }, (_, i) => {
      const x = x0 + ((x1 - x0) * i) / 16;
      return `${i ? 'L' : 'M'}${x.toFixed(1)},${(y + 3 * Math.sin(i * 1.7)).toFixed(1)}`;
    }).join('');
  // A tilted boundary across the cliff: y at x.
  const at = (y: number, x: number) => y - g.slope * (x - xm);
  const tiltedBed = (i: number) => {
    // Bed i lies between boundary i (below) and i + 1 (above); the ends run past the box.
    const lowY = i === 0 ? bottom + 400 : g.boundaries.find((b) => b.between === i)!.y;
    const highY = i === k - 1 ? ground - 400 : g.boundaries.find((b) => b.between === i + 1)!.y;
    const xa = x0 - 10;
    const xb = x1 + 10;
    return `M${xa},${at(highY, xa)} L${xb},${at(highY, xb)} L${xb},${at(lowY, xb)} L${xa},${at(lowY, xa)} Z`;
  };
  const texture = (r: CliffRock, key: string, box: [number, number, number, number]) => {
    const [bx, by, bw, bh] = box;
    if (r === 'shale')
      return [1, 2, 3].map((j) => (
        <Line
          key={`${key}s${j}`}
          x1={bx}
          y1={by + (bh * j) / 4}
          x2={bx + bw}
          y2={by + (bh * j) / 4}
          stroke={c.chartInk}
          strokeOpacity={0.2}
          strokeDasharray="16 4"
        />
      ));
    const count = r === 'conglomerate' ? 14 : r === 'limestone' ? 0 : 40;
    return Array.from({ length: count }, (_, j) => (
      <Circle
        key={`${key}g${j}`}
        cx={bx + rnd(j, key.length) * bw}
        cy={by + rnd(key.length + 3, j) * bh}
        r={r === 'conglomerate' ? 2.5 + rnd(j, 7) * 2 : 0.9}
        fill={r === 'conglomerate' ? c.rock5 : c.chartInk}
        opacity={r === 'conglomerate' ? 0.8 : 0.35}
      />
    ));
  };
  const name = (r: CliffRock) => r;
  const height = bottom + 8;
  const surface = header.surface
    ? `M${x0},${ground} Q${x0 + 60},${ground - 14} ${x0 + 120},${ground - 4} T${x0 + 240},${ground - 2} T${x1},${ground - 10}`
    : `M${x0},${ground} H${x1}`;

  return (
    <View>
      <Canvas aspect={height / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <TopLight id={ids.light} strength={0.6} />
              {u !== undefined ? (
                <ClipPath id={ids.under}>
                  <Path d={`${wavy(u)} L${x1},${bottom} L${x0},${bottom} Z`} />
                </ClipPath>
              ) : null}
            </Defs>
            <G transform={`scale(${w / BW})`}>
              {/* Flat beds (the first one runs down under the wavy surface). */}
              {g.flat.map((f, j) => {
                const r = header.beds[f.bed]!;
                const y1 = j === g.flat.length - 1 && u !== undefined ? f.y1 + 8 : f.y1;
                return (
                  <G key={`f${f.bed}`}>
                    <Rect x={x0} y={f.y0} width={x1 - x0} height={y1 - f.y0} fill={fillOf(c, r)} />
                    {texture(r, `f${f.bed}`, [x0, f.y0, x1 - x0, y1 - f.y0])}
                  </G>
                );
              })}
              {/* Tilted beds under the unconformity. */}
              {u !== undefined ? (
                <G clipPath={url(ids.under)}>
                  {Array.from({ length: k }, (_, i) => (
                    <G key={`t${i}`}>
                      <Path d={tiltedBed(i)} fill={fillOf(c, header.beds[i]!)} />
                    </G>
                  ))}
                  {g.boundaries.map((b) => (
                    <Line
                      key={`b${b.between}`}
                      x1={x0 - 10}
                      y1={at(b.y, x0 - 10)}
                      x2={x1 + 10}
                      y2={at(b.y, x1 + 10)}
                      stroke={c.chartInk}
                      strokeWidth={0.8}
                    />
                  ))}
                </G>
              ) : null}
              {g.flat.map((f) => (
                <Line
                  key={`l${f.bed}`}
                  x1={x0}
                  y1={f.y1}
                  x2={x1}
                  y2={f.y1}
                  stroke={c.chartInk}
                  strokeWidth={0.8}
                  opacity={u !== undefined && f.y1 >= u - 1e-9 ? 0 : 1}
                />
              ))}
              <Rect
                x={x0}
                y={ground}
                width={x1 - x0}
                height={bottom - ground}
                fill={url(ids.light)}
              />
              {u !== undefined ? (
                <Path d={wavy(u)} fill="none" stroke={c.chartInk} strokeWidth={chart.stroke} />
              ) : null}
              {/* The dike. */}
              {g.dike ? (
                <G>
                  <Path
                    d={`M${g.dike.x - 11},${bottom} L${g.dike.x - 7},${g.dike.top} L${g.dike.x + 7},${g.dike.top} L${g.dike.x + 12},${bottom} Z`}
                    fill={header.intrusion?.rock === 'granite' ? c.rock6 : c.landCinder}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                </G>
              ) : null}
              {/* Today's surface and the frame. */}
              <Path
                d={`${surface} L${x1},${ground - 30} L${x0},${ground - 30} Z`}
                fill={c.background}
              />
              <Path d={surface} fill="none" stroke={c.landGrass} strokeWidth={3} />
              <Rect
                x={x0}
                y={ground - 30}
                width={x1 - x0}
                height={bottom - ground + 30}
                fill="none"
                stroke={c.chartInk}
                strokeWidth={0}
              />
              {/* Names. */}
              {g.flat.map((f) => (
                <ChartText
                  key={`n${f.bed}`}
                  x={x0 + 8}
                  y={(f.y0 + f.y1) / 2 + 5}
                  fontWeight="600"
                  halo={c.card}
                >
                  {name(header.beds[f.bed]!)}
                </ChartText>
              ))}
              {u !== undefined
                ? Array.from({ length: k }, (_, i) => {
                    // The bed's strip at x: from its upper edge (or the unconformity) down to its
                    // lower edge (or the bottom). Named where the strip is widest, clear of the dike.
                    const span = (x: number) => {
                      const top =
                        i === k - 1 ? u : at(g.boundaries.find((b) => b.between === i + 1)!.y, x);
                      const low =
                        i === 0 ? bottom : at(g.boundaries.find((b) => b.between === i)!.y, x);
                      return [Math.max(u, top), Math.min(bottom, low)] as const;
                    };
                    const xs = Array.from({ length: 21 }, (_, j) => x0 + 50 + j * 12).filter(
                      (x) => !g.dike || Math.abs(x - g.dike.x) > 48,
                    );
                    const x = xs.reduce((best, x) => {
                      const [t, l] = span(x);
                      const [bt, bl] = span(best);
                      return l - t > bl - bt ? x : best;
                    }, xs[0]!);
                    const [yHi, yLo] = span(x);
                    return (
                      <ChartText
                        key={`m${i}`}
                        x={x}
                        y={(yLo + yHi) / 2 + 5}
                        textAnchor="middle"
                        fontWeight="600"
                        halo={c.card}
                      >
                        {name(header.beds[i]!)}
                      </ChartText>
                    );
                  })
                : null}
              {u !== undefined ? (
                <ChartText x={x1 - 6} y={u - 6} textAnchor="end" fontWeight="700" halo={c.card}>
                  unconformity
                </ChartText>
              ) : null}
              {g.dike ? (
                <ChartText x={g.dike.x + 16} y={bottom - 10} fontWeight="700" halo={c.card}>
                  {`${header.intrusion?.rock ?? 'basalt'} dike`}
                </ChartText>
              ) : null}
            </G>
          </Svg>
        )}
      </Canvas>
    </View>
  );
}
