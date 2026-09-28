import type { ReactNode } from 'react';
import { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { Scene } from '@/data/modules/layouts';
import { chart, type Palette } from '@/theme';

import { Deepen, TopLight, url, usePaintIds } from '../reps/paint';
import { BOARD_W, Board, CurveArrow, HaloText } from './earthKit';

/**
 * Plate boundaries as a layered cross-section (Grade 6): sky, seawater, the plates (grey basalt
 * ocean floor under a thin skin of sediment, or thick tan granite continents), glowing magma
 * and the deep orange-brown mantle with its slow convection. An ocean ridge can show the rock's
 * age in bands, youngest (warm) at the ridge to oldest (cool) at the edges, the same on both
 * sides; "What moves the plates" lights the convection. Plates sliding past are seen from
 * above, as a fault that offsets a river.
 */

const H = 240;
const MID = BOARD_W / 2;
/** Where the mantle starts under ocean plates. */
const BASE = 118;

type Pt = [number, number];
const poly = (pts: Pt[]) =>
  'M ' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ') + ' Z';
const range = (a: number, b: number, n = 16) =>
  Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);

/** The top and bottom of an ocean plate at distance `d` from the ridge (0 at the ridge). */
const topAt = (d: number) => 64 + 22 * Math.min(1, d / 168) ** 0.6;
const botAt = (d: number) => 94 + 24 * Math.min(1, d / 168) ** 0.7;

/** Tan speckles of a granite continent (fixed positions, so they never jump). */
function Speckles({
  x0,
  x1,
  y0,
  y1,
  c,
}: {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  c: Palette;
}) {
  const dots: ReactNode[] = [];
  let k = 0;
  for (let y = y0 + 6; y < y1 - 3; y += 9) {
    for (let x = x0 + ((k * 7) % 11) + 4; x < x1 - 3; x += 17) {
      dots.push(
        <Circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={1.3}
          fill={k % 3 === 0 ? c.rock5 : c.snow}
          opacity={0.7}
        />,
      );
      k++;
    }
    k++;
  }
  return <G>{dots}</G>;
}

export function PlatesFigure({ plates, c }: { plates: NonNullable<Scene['plates']>; c: Palette }) {
  const ids = usePaintIds('sea', 'mantle', 'magma', 'light', 'sky');
  const kind = plates.boundary;

  const defs = (
    <Defs>
      <Deepen id={ids.sea} from={c.water} to={c.waterDeep} />
      <Deepen id={ids.mantle} from={c.copper} to={c.copperDark} />
      <LinearGradient id={ids.magma} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={c.sunDisk} />
        <Stop offset="0.35" stopColor={c.orange} />
        <Stop offset="1" stopColor={c.mercury} />
      </LinearGradient>
      <TopLight id={ids.light} />
      <Deepen id={ids.sky} from={c.skyMorning} to={c.snow} />
    </Defs>
  );

  const label = (x: number, y: number, text: string, bold = false) => (
    <HaloText key={`${text}${x}`} x={x} y={y} text={text} c={c} bold={bold} />
  );
  const push = (a: Pt, b: Pt, k: string) => (
    <CurveArrow key={k} a={a} b={b} c={c} color={c.chartInk} width={2.5} halo={false} />
  );

  if (kind === 'transform') {
    // Seen from above: two plates grinding past along a fault that has offset a river.
    const fault = 'M 176 0 L 182 30 L 174 62 L 184 96 L 176 132 L 183 170 L 175 206 L 181 240';
    return (
      <Board height={H}>
        {defs}
        <Rect x={0} y={0} width={BOARD_W} height={H} fill={c.life} />
        <Rect x={0} y={0} width={BOARD_W} height={H} fill={url(ids.light)} />
        {/* A row of trees and the river, both cut and shifted where they cross the fault. */}
        {[
          ...[24, 58, 92, 126, 160].map((x) => [x, 40] as Pt),
          ...[204, 238, 272, 306, 340].map((x) => [x, 86] as Pt),
        ].map(([x, y]) => (
          <Circle
            key={`t${x}`}
            cx={x}
            cy={y}
            r={9}
            fill={c.lifeDeep}
            stroke={c.chartInk}
            strokeOpacity={0.3}
          />
        ))}
        {/* The river, cut and shifted where it crosses the fault. */}
        <Path
          d="M 0 96 C 60 86 120 108 178 104"
          stroke={c.water}
          strokeWidth={8}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M 180 150 C 240 146 300 164 360 154"
          stroke={c.water}
          strokeWidth={8}
          strokeLinecap="round"
          fill="none"
        />
        <Path d={fault} stroke={c.soilDark} strokeWidth={5} strokeLinejoin="round" fill="none" />
        <Path d={fault} stroke={c.soil} strokeWidth={2} strokeLinejoin="round" fill="none" />
        {push([96, 196], [96, 128], 'l')}
        {push([264, 60], [264, 128], 'r')}
        {label(178, 226, 'fault', true)}
        {label(64, 70, 'plate')}
        {label(296, 206, 'plate')}
        {label(300, 36, 'seen from above')}
      </Board>
    );
  }

  // Everything else is a cross-section over the mantle.
  const mantleOn = !!plates.mantle;
  const mantle = (top: number) => (
    <G>
      <Rect x={0} y={top} width={BOARD_W} height={H - top} fill={url(ids.mantle)} />
      {label(MID - 95, 184, 'mantle')}
    </G>
  );
  /** Convection: hot rock rising under the ridge, spreading, cooling and sinking at the sides. */
  const convection = (
    <G>
      {([-1, 1] as const).map((s) => {
        const x = (d: number) => MID + s * d;
        const loop: [Pt, Pt, number][] = [
          [[x(40), 214], [x(40), 146], 0],
          [[x(52), 134], [x(140), 136], s * 14],
          [[x(150), 148], [x(150), 206], 0],
          [[x(138), 222], [x(54), 224], s * 14],
        ];
        return loop.map(([a, b, bend], i) => (
          <CurveArrow
            key={`${s}${i}`}
            a={a}
            b={b}
            bend={bend}
            c={c}
            on={mantleOn}
            color={mantleOn ? c.chartHighlight : c.snow}
            width={mantleOn ? chart.strokeHeavy : 2}
            faint={0.45}
          />
        ));
      })}
    </G>
  );

  if (kind === 'divergent') {
    const ages = !!plates.ages;
    // A plate from the ridge (d = 0) outward, on side s.
    const plate = (s: 1 | -1, d0: number, d1: number) => {
      const ds = range(d0, d1);
      return poly([
        ...ds.map((d) => [MID + s * (8 + d), topAt(d)] as Pt),
        ...ds.reverse().map((d) => [MID + s * (8 + d), botAt(d)] as Pt),
      ]);
    };
    const bandFill = [c.orange, c.sunDisk, c.skyMorning, c.poleSouth];
    return (
      <Board height={H}>
        {defs}
        <Rect x={0} y={0} width={BOARD_W} height={36} fill={url(ids.sky)} />
        <Rect x={0} y={36} width={BOARD_W} height={BASE - 36} fill={url(ids.sea)} />
        <Path
          d={range(0, BOARD_W, 24)
            .map((x, i) => `${i ? 'L' : 'M'} ${x} ${36 + (i % 2) * 2}`)
            .join(' ')}
          stroke={c.waterTop}
          strokeWidth={chart.strokeLight}
          fill="none"
        />
        {mantle(BASE - 4)}
        {convection}
        {/* Magma rising into the ridge's rift, glowing. */}
        <Path
          d={`M ${MID - 32} ${H} C ${MID - 22} 190 ${MID - 10} 130 ${MID - 7} 96 L ${MID - 6} 72 L ${MID + 6} 72 L ${MID + 7} 96 C ${MID + 10} 130 ${MID + 22} 190 ${MID + 32} ${H} Z`}
          fill={url(ids.magma)}
        />
        {([-1, 1] as const).map((s) => (
          <G key={s}>
            <Path d={plate(s, 0, 180)} fill={c.rock2} stroke={c.rock5} strokeWidth={1} />
            {ages
              ? [0, 42, 84, 126].map((d0, i) => (
                  <Path key={i} d={plate(s, d0, d0 + 42)} fill={bandFill[i]} opacity={0.6} />
                ))
              : null}
            {/* A thin skin of sediment, thicker on older floor. */}
            <Path
              d={poly([
                ...range(0, 180).map((d) => [MID + s * (8 + d), topAt(d)] as Pt),
                ...range(0, 180)
                  .reverse()
                  .map((d) => [MID + s * (8 + d), topAt(d) + 1 + (3 * d) / 180] as Pt),
              ])}
              fill={c.rock3}
            />
          </G>
        ))}
        {push([MID - 34, 52], [MID - 98, 58], 'l')}
        {push([MID + 34, 52], [MID + 98, 58], 'r')}
        {label(46, 58, 'ocean')}
        {label(MID, 30, 'ridge', true)}
        {ages ? (
          <G>
            {label(MID - 42, 88, 'new', true)}
            {label(MID + 42, 88, 'new', true)}
            {label(30, 108, 'older', true)}
            {label(BOARD_W - 30, 108, 'older', true)}
          </G>
        ) : (
          <G>
            {label(60, 104, 'plate')}
            {label(BOARD_W - 60, 104, 'plate')}
          </G>
        )}
        {label(MID, 178, 'magma', true)}
      </Board>
    );
  }

  if (kind === 'rift') {
    // A continent stretching and cracking: blocks drop along faults into a rift valley.
    const top: Pt[] = [
      [0, 62],
      [128, 62],
      [136, 78],
      [156, 80],
      [164, 98],
      [196, 98],
      [204, 80],
      [224, 78],
      [232, 62],
      [BOARD_W, 62],
    ];
    const bottom: Pt[] = [
      [BOARD_W, 134],
      [250, 132],
      [214, 120],
      [180, 116],
      [146, 120],
      [110, 132],
      [0, 134],
    ];
    return (
      <Board height={H}>
        {defs}
        <Rect x={0} y={0} width={BOARD_W} height={H} fill={url(ids.sky)} />
        {mantle(126)}
        {convection}
        <Path
          d={`M ${MID - 26} ${H} C ${MID - 18} 190 ${MID - 12} 150 ${MID - 14} 118 L ${MID + 14} 118 C ${MID + 12} 150 ${MID + 18} 190 ${MID + 26} ${H} Z`}
          fill={url(ids.magma)}
        />
        <Path d={poly([...top, ...bottom])} fill={c.rock4} stroke={c.rock5} strokeWidth={1} />
        <Speckles x0={0} x1={BOARD_W} y0={66} y1={128} c={c} />
        {/* The faults the blocks slid down. */}
        <Path
          d="M 128 62 L 150 128 M 156 80 L 172 118 M 232 62 L 210 128 M 204 80 L 188 118"
          stroke={c.soilDark}
          strokeWidth={1.3}
        />
        <Path
          d={'M ' + top.map(([x, y]) => `${x} ${y}`).join(' L ')}
          stroke={c.lifeDeep}
          strokeWidth={3}
          fill="none"
        />
        {/* A lake on the valley floor. */}
        <Path d="M 168 97 L 192 97 L 190 100 L 170 100 Z" fill={c.water} />
        {push([110, 44], [40, 44], 'l')}
        {push([250, 44], [320, 44], 'r')}
        {label(MID, 48, 'rift valley', true)}
        {label(60, 100, 'continent')}
        {label(300, 100, 'continent')}
        {label(MID, 190, 'magma', true)}
      </Board>
    );
  }

  if (kind === 'subduction') {
    // The denser ocean plate (left) bends down under the continent (right) at a trench.
    const slabTop: Pt[] = [
      ...range(0, 170, 8).map((x) => [x, 86 + (x / 170) ** 2 * 8] as Pt),
      ...range(0, 1, 10).map((t) => [178 + t * 182, 96 + t * t * 40 + t * 70] as Pt),
    ];
    const slabBot: Pt[] = range(0, 1, 14)
      .map((t) => [t * 330, 116 + (t > 0.5 ? (t - 0.5) ** 1.6 * 300 : 0)] as Pt)
      .reverse();
    const cont: Pt[] = [
      [186, 70],
      [226, 64],
      [262, 60],
      [284, 26],
      [292, 20],
      [300, 26],
      [326, 60],
      [BOARD_W, 62],
      [BOARD_W, 206],
      ...range(1, 0.06, 8).map((t) => [178 + t * 182, 96 + t * t * 40 + t * 70] as Pt),
    ];
    return (
      <Board height={H}>
        {defs}
        <Rect x={0} y={0} width={BOARD_W} height={H} fill={url(ids.sky)} />
        <Path d={`M 0 38 L 194 38 L 190 100 L 0 100 Z`} fill={url(ids.sea)} />
        {mantle(112)}
        {convection}
        <Path d={poly([...slabTop, ...slabBot])} fill={c.rock2} stroke={c.rock5} strokeWidth={1} />
        <Path
          d={'M ' + slabTop.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ')}
          stroke={c.rock3}
          strokeWidth={3}
          fill="none"
        />
        <Path d={poly(cont)} fill={c.rock4} stroke={c.rock5} strokeWidth={1} />
        <Speckles x0={200} x1={BOARD_W} y0={66} y1={120} c={c} />
        {/* Rock melts above the sinking plate; the magma rises to feed a volcano. */}
        <Path
          d="M 272 150 C 268 132 284 116 286 96 C 287 70 289 44 290 22 L 294 22 C 296 44 298 70 300 96 C 304 118 306 134 296 150 C 290 156 278 156 272 150 Z"
          fill={url(ids.magma)}
        />
        <Path
          d="M 280 32 L 288 23 L 296 23 L 304 32 L 299 36 L 294 30 L 290 36 L 285 30 Z"
          fill={c.snow}
          opacity={0.9}
        />
        <Path d="M 288 22 L 296 22 L 294 17 L 290 17 Z" fill={c.orange} />
        {push([60, 74], [130, 74], 'sea')}
        {push([204, 117], [242, 136], 'slab')}
        {push([350, 76], [322, 76], 'land')}
        {label(76, 108, 'ocean plate')}
        {label(178, 58, 'trench')}
        {label(236, 88, 'continent')}
        {label(332, 132, 'magma', true)}
        {label(236, 34, 'volcano')}
      </Board>
    );
  }

  // Collision: two continents crumple and pile up into mountains with a deep root.
  const surface: Pt[] = [
    [0, 72],
    [90, 70],
    [120, 58],
    [138, 34],
    [150, 42],
    [164, 18],
    [178, 32],
    [192, 14],
    [208, 36],
    [222, 26],
    [240, 56],
    [270, 70],
    [BOARD_W, 72],
  ];
  const root: Pt[] = [
    [BOARD_W, 140],
    [260, 142],
    [220, 180],
    [180, 196],
    [140, 180],
    [100, 142],
    [0, 140],
  ];
  return (
    <Board height={H}>
      {defs}
      <Rect x={0} y={0} width={BOARD_W} height={H} fill={url(ids.sky)} />
      {mantle(132)}
      <Path d={poly([...surface, ...root])} fill={c.rock4} stroke={c.rock5} strokeWidth={1} />
      <Speckles x0={0} x1={BOARD_W} y0={76} y1={136} c={c} />
      {/* Layers folded by the squeeze, and the seam where the plates meet. */}
      {[0, 1, 2].map((i) => (
        <Path
          key={i}
          d={`M 0 ${92 + i * 14} C 80 ${92 + i * 14} 110 ${70 + i * 24} 140 ${66 + i * 30} S 160 ${100 + i * 22} 180 ${74 + i * 30} S 210 ${60 + i * 34} 230 ${80 + i * 26} S 290 ${92 + i * 14} ${BOARD_W} ${92 + i * 14}`}
          stroke={c.rock5}
          strokeWidth={1.6}
          fill="none"
        />
      ))}
      <Path
        d="M 180 32 C 176 80 186 140 180 196"
        stroke={c.soilDark}
        strokeWidth={1.5}
        strokeDasharray={chart.dashFine}
        fill="none"
      />
      {[
        [138, 34, 10],
        [164, 18, 11],
        [192, 14, 12],
        [222, 26, 10],
      ].map(([x, y, r]) => (
        <Path
          key={x}
          d={`M ${x! - r!} ${y! + r! * 0.9} L ${x} ${y} L ${x! + r!} ${y! + r! * 0.9} L ${x! + r! * 0.4} ${y! + r! * 0.6} L ${x} ${y! + r!} L ${x! - r! * 0.4} ${y! + r! * 0.6} Z`}
          fill={c.snow}
          stroke={c.rock5}
          strokeWidth={0.8}
        />
      ))}
      <Path
        d={'M ' + surface.map(([x, y]) => `${x} ${y}`).join(' L ')}
        stroke={c.lifeDeep}
        strokeWidth={2}
        fill="none"
      />
      {push([20, 52], [86, 52], 'l')}
      {push([340, 52], [274, 52], 'r')}
      {label(60, 108, 'continent')}
      {label(300, 108, 'continent')}
      {label(290, 20, 'mountains', true)}
      {label(180, 222, 'deep root')}
    </Board>
  );
}
