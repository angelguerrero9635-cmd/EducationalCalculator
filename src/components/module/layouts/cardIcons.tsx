/**
 * Card icons drawn in their materials: animals in their fur and feathers, tools in wood, glass
 * and metal, lit from the top left with the helpers in `reps/paint.tsx`. Each is 48 × 48, the
 * size of a card figure, so shapes are bold and details few.
 */
import type { ReactNode } from 'react';
import {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  Path,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import type { CardIcon } from '@/data/modules/layouts';
import { usePalette } from '@/theme';

import { FloorShadow, Glass, Metal, Sheen, TopLight, url, usePaintIds } from '../reps/paint';

/** The card icons drawn here (the rest are flat outlines in CardFigure.tsx). */
export const MATERIAL_ICONS = [
  'thermometer',
  'rain gauge',
  'wind vane',
  'wind sock',
  'bird',
  'frog',
  'grasshopper',
  'turtle',
  'fish',
  'cat',
  'dog',
  'dolphin',
  'person',
  'tree frog',
  'warbler',
  'white hare',
  'thick fur',
  'blubber',
  'camel hump',
  'cactus stem',
  'rabbit',
  'deer',
  'hawk',
  'snake',
  'heron',
  'raccoon',
  'bear',
  'meter stick',
  'door',
  'bus',
  'pencil',
  'paper clip',
  'workbook',
  'water bottle',
  'milk carton',
  'juice box',
  'eyedropper',
  'pan handle',
  'oven mitt',
  'kettle',
] as const satisfies readonly CardIcon[];

export type MaterialIconName = (typeof MATERIAL_ICONS)[number];

export const inMaterials = (icon: CardIcon): icon is MaterialIconName =>
  (MATERIAL_ICONS as readonly CardIcon[]).includes(icon);

/** An ellipse as a path, so it can be filled and then lit with the same `d`. */
const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;

/** A falling drop with its point up. */
const drop = (x: number, y: number, s = 1) =>
  `M ${x} ${y - 3.5 * s} Q ${x + 2.6 * s} ${y + 0.5 * s} ${x} ${y + 2 * s} Q ${x - 2.6 * s} ${y + 0.5 * s} ${x} ${y - 3.5 * s} Z`;

export function MaterialIcon({ icon, ink }: { icon: MaterialIconName; ink: string }) {
  const c = usePalette();
  const ids = usePaintIds(
    'round',
    'light',
    'sheen',
    'sheenV',
    'glass',
    'metal',
    'chrome',
    'copper',
  );

  const o = (w = 1.25) => ({
    stroke: ink,
    strokeWidth: w,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  });
  /** A shape in its color, outlined, with light from the top left laid over it. */
  const lit = (d: string, fill: string, w = 1.25) => (
    <>
      <Path d={d} fill={fill} {...o(w)} />
      <Path d={d} fill={url(ids.round)} />
    </>
  );
  /** A leg, neck or tail: a thick stroke in its color with an outline. */
  const limb = (d: string, color: string, w = 3) => (
    <>
      <Path d={d} fill="none" {...o(w + 1.8)} />
      <Path d={d} fill="none" {...o(w)} stroke={color} />
    </>
  );
  /** A dark eye with a glint. */
  const eye = (x: number, y: number, r = 1) => (
    <>
      <Circle cx={x} cy={y} r={r} fill={c.rubber} />
      <Circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.4} fill={c.shine} />
    </>
  );
  const ground = (cx = 24, cy = 43, rx = 17) => <FloorShadow cx={cx} cy={cy} rx={rx} ry={2.5} />;

  /** A frog sitting, facing left. */
  const frog = (skin: string, iris: string) => (
    <>
      {lit(
        'M 6 31 C 6 24 12 19 20 19 C 28 19 36 23 38 30 C 39 35 36 39 30 39 H 13 C 8 39 6 36 6 31 Z',
        skin,
      )}
      {limb('M 14 33 L 12 40 L 8 40.5', skin, 2.2)}
      {lit(ell(31, 32, 8, 6), skin)}
      {limb('M 27 38 L 41 39.5 L 44 39', skin, 2.2)}
      <Path d="M 6.5 30 Q 11 32.5 16.5 30" fill="none" {...o(0.8)} />
      {lit(ell(15, 19.5, 4.6, 4.4), skin)}
      <Circle cx={15} cy={19.5} r={2.7} fill={iris} />
      <Ellipse cx={15} cy={19.5} rx={1.7} ry={1} fill={c.rubber} />
    </>
  );

  /** A hare or rabbit sitting, facing left; a hare's ears have black tips. */
  const hare = (fur: string, tips: boolean) => (
    <>
      <G transform="rotate(12 15 9)">
        {lit(ell(15, 9, 2.6, 7.5), fur)}
        {tips ? <Path d="M 12.9 4.5 A 2.6 7.5 0 0 1 17.1 4.5 Z" fill={c.rubber} /> : null}
      </G>
      <G transform="rotate(28 19 10)">
        {lit(ell(19, 10, 2.8, 8), fur)}
        {tips ? <Path d="M 16.8 5.2 A 2.8 8 0 0 1 21.2 5.2 Z" fill={c.rubber} /> : null}
      </G>
      {lit('M 15 23 C 21 18 34 20 38 28 C 41 34 38 40 32 40 H 18 C 14 40 12 36 13 31 Z', fur)}
      {lit(ell(30, 35, 7, 4.8), fur)}
      {lit(ell(22, 40, 6.5, 1.8), fur, 1)}
      {lit(ell(38.5, 29.5, 3, 3), c.snow)}
      {lit(ell(12.5, 21, 7, 6), fur)}
      {eye(11, 19.5, 1.2)}
      <Circle cx={5.8} cy={21.5} r={1} fill={c.rock6} />
    </>
  );

  /** A snowflake, for cold places. */
  const flake = (x: number, y: number, r = 2.5) => (
    <Path
      d={`M ${x - r} ${y} H ${x + r} M ${x - r / 2} ${y - r * 0.87} L ${x + r / 2} ${y + r * 0.87} M ${x - r / 2} ${y + r * 0.87} L ${x + r / 2} ${y - r * 0.87}`}
      stroke={c.glassEdge}
      strokeWidth={1}
      strokeLinecap="round"
    />
  );

  let art: ReactNode;
  switch (icon) {
    // ── Weather tools ─────────────────────────────────────────────────────────
    case 'thermometer':
      art = (
        <>
          <Rect x={14} y={3} width={20} height={42} rx={3} fill={c.wood} {...o()} />
          <Rect x={14} y={3} width={20} height={42} rx={3} fill={url(ids.light)} />
          {Array.from({ length: 7 }, (_, i) => (
            <Line
              key={i}
              x1={27.5}
              y1={8 + i * 4}
              x2={i % 2 ? 30 : 31.5}
              y2={8 + i * 4}
              stroke={c.woodDark}
              strokeWidth={1}
            />
          ))}
          <Rect x={21} y={6} width={5} height={31} rx={2.5} fill={url(ids.glass)} {...o(1)} />
          <Rect x={22.5} y={17} width={2} height={20} fill={c.mercury} />
          {lit(ell(23.5, 38, 4, 4), c.mercury, 1)}
        </>
      );
      break;
    case 'rain gauge':
      art = (
        <>
          <Path d={drop(8, 6)} fill={c.water} />
          <Path d={drop(40, 4, 0.8)} fill={c.water} />
          <Path d={drop(42, 14)} fill={c.water} />
          <Line x1={5} y1={44} x2={43} y2={44} stroke={c.lifeDeep} strokeWidth={2.5} />
          <Rect x={22} y={38} width={4} height={6} fill={c.woodDark} />
          <Rect x={17} y={15} width={14} height={25} rx={2} fill={url(ids.glass)} />
          <Rect x={18} y={29} width={12} height={10} fill={c.water} />
          <Rect x={18} y={29} width={12} height={1.6} fill={c.waterTop} />
          {[19, 23, 27, 31, 35].map((y) => (
            <Line key={y} x1={17} y1={y} x2={20} y2={y} stroke={ink} strokeWidth={0.8} />
          ))}
          <Rect x={17} y={15} width={14} height={25} rx={2} fill={url(ids.sheen)} />
          <Rect x={17} y={15} width={14} height={25} rx={2} fill="none" {...o()} />
          <Path d="M 12 8 H 36 L 31 15 H 17 Z" fill={url(ids.glass)} {...o()} />
        </>
      );
      break;
    case 'wind vane':
      art = (
        <>
          {ground(24, 44, 10)}
          <Rect x={22.8} y={13} width={2.6} height={31} fill={c.metalDark} />
          <Rect x={22.8} y={13} width={2.6} height={31} fill={url(ids.sheen)} />
          <Line x1={12} y1={32} x2={36} y2={32} stroke={c.metalDark} strokeWidth={1.6} />
          <Line x1={17} y1={35.5} x2={31} y2={28.5} stroke={c.metalDark} strokeWidth={1.6} />
          {[
            [12, 32],
            [36, 32],
            [17, 35.5],
            [31, 28.5],
          ].map(([x, y]) => (
            <Circle key={`${x}`} cx={x} cy={y} r={1.5} fill={c.metalDark} />
          ))}
          <Line x1={6} y1={12} x2={38} y2={12} stroke={ink} strokeWidth={3.2} />
          <Line x1={6} y1={12} x2={38} y2={12} stroke={c.copper} strokeWidth={1.8} />
          <Path d="M 3 12 L 11 7 V 17 Z" fill={url(ids.copper)} {...o()} />
          <Path d="M 32 12 L 39 4 H 45 L 40 12 L 45 20 H 39 Z" fill={url(ids.copper)} {...o()} />
          {lit(ell(24, 12, 2.2, 2.2), c.metal, 1)}
        </>
      );
      break;
    case 'wind sock': {
      const band = (i: number) => {
        const x = (t: number) => 9 + t * 35;
        const t0 = i / 5;
        const t1 = (i + 1) / 5;
        return `${x(t0)},${8 + t0 * 6} ${x(t1)},${8 + t1 * 6} ${x(t1)},${23 - t1 * 2} ${x(t0)},${23 - t0 * 2}`;
      };
      art = (
        <>
          {ground(7.5, 44, 6)}
          <Rect x={6} y={4} width={3} height={40} fill={c.metal} />
          <Rect x={6} y={4} width={3} height={40} fill={url(ids.sheen)} />
          <Rect x={6} y={4} width={3} height={40} fill="none" {...o(1)} />
          {[0, 1, 2, 3, 4].map((i) => (
            <Polygon key={i} points={band(i)} fill={i % 2 ? c.snow : c.orange} />
          ))}
          <Polygon points="9,8 44,14 44,21 9,23" fill={url(ids.sheenV)} {...o()} />
          <Ellipse cx={44} cy={17.5} rx={1.4} ry={3.5} fill={c.shade} fillOpacity={0.35} />
        </>
      );
      break;
    }

    // ── Animals (eggs or born alive) ──────────────────────────────────────────
    case 'bird':
      art = (
        <>
          <Path d="M 4 41 L 44 39" stroke={c.woodDark} strokeWidth={3} strokeLinecap="round" />
          {limb('M 22 34 L 21 40', c.woodDark, 1)}
          {limb('M 27 34 L 27 40', c.woodDark, 1)}
          {lit('M 31 29 L 44 35 L 42 39 L 29 34 Z', c.furDark)}
          {lit(ell(24, 28, 11.5, 8), c.furDark)}
          <Path d="M 13.5 26 C 13 34 21 38 30 34.5 C 23 33 17 30 15.5 24 Z" fill={c.orange} />
          <Path
            d="M 19 24.5 C 26 21 34 24 35.5 30 C 29 31.5 23 30 19 24.5 Z"
            fill={c.rubber}
            fillOpacity={0.4}
            {...o(0.8)}
          />
          {lit(ell(15, 18, 6.5, 6.2), c.furDark)}
          <Path d="M 9.2 17 L 3.5 19 L 9.3 20.3 Z" fill={c.chartSecond} {...o(0.8)} />
          <Circle cx={13.6} cy={16.6} r={1.9} fill={c.snow} />
          {eye(13.6, 16.6, 1.1)}
        </>
      );
      break;
    case 'frog':
      art = (
        <>
          {ground(25, 42, 19)}
          {frog(c.life, c.chartSecond)}
        </>
      );
      break;
    case 'grasshopper':
      art = (
        <>
          {ground(24, 40, 19)}
          <Path d="M 8 23 Q 12 8 28 5" fill="none" {...o(1)} />
          <Path d="M 10 23 Q 17 11 33 9" fill="none" {...o(1)} />
          {limb('M 12 31 L 9 38', c.lifeDeep, 1.2)}
          {limb('M 17 32 L 17 39', c.lifeDeep, 1.2)}
          {lit(ell(24, 28, 15, 5.5), c.life)}
          <Path
            d="M 16 25 C 24 21 36 23 40 27 C 32 28.5 22 28.5 16 25 Z"
            fill={c.lifeDeep}
            {...o(0.8)}
          />
          <G transform="rotate(-42 30 21)">{lit(ell(30, 21, 10.5, 3.6), c.lifeDeep)}</G>
          {limb('M 37.5 13.5 L 44 38 L 41 38.5', c.lifeDeep, 1.2)}
          {lit(ell(10, 27, 5.8, 5.2), c.life)}
          {eye(8.6, 25.6, 1.4)}
        </>
      );
      break;
    case 'turtle':
      art = (
        <>
          {ground(25, 40, 18)}
          {lit('M 39 33 L 46 35 L 39 36.5 Z', c.life, 1)}
          <Rect x={13} y={30} width={6} height={9} rx={3} fill={c.life} {...o()} />
          <Rect x={31} y={30} width={6} height={9} rx={3} fill={c.life} {...o()} />
          {lit('M 14 29.5 C 10 25.5 4 24.5 2.5 28.5 C 1.5 32 6 34.5 14 34 Z', c.life)}
          {eye(6, 28.4, 1)}
          {lit('M 9 33 C 10 18 17 12.5 25 12.5 C 33 12.5 40 18 41 33 Z', c.lifeDeep)}
          <Path
            d="M 20 15.5 L 18 24 L 25 27 L 32 24 L 30 15.5 M 18 24 L 11 30 M 25 27 V 33 M 32 24 L 39 30"
            fill="none"
            stroke={c.chartSecond}
            strokeOpacity={0.7}
            strokeWidth={1.1}
          />
          <Rect x={8} y={31.5} width={34} height={3} rx={1.5} fill={c.chartSecond} {...o(1)} />
        </>
      );
      break;
    case 'fish':
      art = (
        <>
          <Circle cx={6} cy={11} r={1.8} fill="none" stroke={c.water} strokeWidth={1} />
          <Circle cx={9} cy={5} r={1.2} fill="none" stroke={c.water} strokeWidth={1} />
          {lit('M 33 24 L 45 13 C 42 19 42 29 45 35 Z', c.orange)}
          {lit('M 15 16 C 18 9 27 9 30 16 Z', c.orange)}
          {lit('M 19 32 L 23 38 L 27 32 Z', c.orange, 1)}
          {lit('M 3 24 C 8 12 28 10 36 24 C 28 38 8 36 3 24 Z', c.orange)}
          <Path d="M 13 17 Q 16.5 24 13 31" fill="none" {...o(0.9)} />
          {[
            [20, 20],
            [25, 20],
            [20, 27],
            [25, 27],
            [30, 23.5],
          ].map(([x, y]) => (
            <Path
              key={`${x}${y}`}
              d={`M ${x! - 1.5} ${y! - 2.2} Q ${x! + 1.5} ${y} ${x! - 1.5} ${y! + 2.2}`}
              fill="none"
              stroke={c.copperDark}
              strokeOpacity={0.6}
              strokeWidth={0.8}
            />
          ))}
          <Circle cx={8.5} cy={21.5} r={2.3} fill={c.snow} {...o(0.7)} />
          {eye(8.5, 21.5, 1.2)}
        </>
      );
      break;
    case 'cat':
      art = (
        <>
          {ground(25, 43, 14)}
          {limb('M 32 42 C 42 42 45 34 40 26', c.furGrey, 3.5)}
          {lit('M 14 43 C 11 34 15 25 24 25 C 33 25 37 34 34 43 Z', c.furGrey)}
          <Path
            d="M 20 27 C 20 34 22 38 24 38 C 26 38 28 34 28 27 Z"
            fill={c.snow}
            fillOpacity={0.85}
          />
          <Path d="M 21 35 V 43 M 27 35 V 43" {...o(0.9)} />
          {lit('M 15 13 L 15.5 2.5 L 23 8 Z', c.furGrey)}
          {lit('M 33 13 L 32.5 2.5 L 25 8 Z', c.furGrey)}
          <Path d="M 16.5 10 L 16.8 5.5 L 20 8 Z M 31.5 10 L 31.2 5.5 L 28 8 Z" fill={c.rock6} />
          {lit(ell(24, 15, 9.5, 8.5), c.furGrey)}
          <Path
            d="M 21.5 7.5 V 10 M 24 7 V 10 M 26.5 7.5 V 10"
            stroke={c.rubber}
            strokeOpacity={0.5}
            strokeWidth={1}
            strokeLinecap="round"
          />
          <Ellipse cx={20.3} cy={14} rx={1.9} ry={2.2} fill={c.life} />
          <Ellipse cx={27.7} cy={14} rx={1.9} ry={2.2} fill={c.life} />
          <Ellipse cx={20.3} cy={14} rx={0.6} ry={1.9} fill={c.rubber} />
          <Ellipse cx={27.7} cy={14} rx={0.6} ry={1.9} fill={c.rubber} />
          <Path d="M 22.8 17.6 H 25.2 L 24 19 Z" fill={c.rock6} {...o(0.5)} />
          <Path d="M 24 19 Q 22.5 21 21 20.2 M 24 19 Q 25.5 21 27 20.2" fill="none" {...o(0.7)} />
          <Path
            d="M 19.5 18.5 L 10 17 M 19.5 19.5 L 10 20.5 M 28.5 18.5 L 38 17 M 28.5 19.5 L 38 20.5"
            {...o(0.5)}
          />
        </>
      );
      break;
    case 'dog':
      art = (
        <>
          {ground(25, 43, 17)}
          {limb('M 38 23 Q 44 20 43 11', c.furLight, 2.6)}
          {[12, 17, 29, 34].map((x) => (
            <G key={x}>{lit(`M ${x} 28 H ${x + 4.2} V 42 H ${x} Z`, c.furLight, 1)}</G>
          ))}
          {lit(
            'M 11 23 C 11 19 14 18 18 18 H 34 C 39 18 41 22 40 27 C 39 31 36 32 33 32 H 15 C 12 32 11 28 11 23 Z',
            c.furLight,
          )}
          {lit('M 9 18 L 12 26 L 18 23 L 15 15 Z', c.furLight, 1)}
          {lit(ell(12, 14, 6.5, 6), c.furLight)}
          {lit('M 8 13 H 3.2 C 1.4 13 1.4 19 3.2 19 H 9.5 Z', c.furLight)}
          <Circle cx={2.8} cy={14.6} r={1.6} fill={c.rubber} />
          {eye(10.2, 12, 1.1)}
          <Path
            d="M 12.5 8.5 C 17 8 19 12 18 18.5 C 15.5 19.5 13.5 16 12.5 12 Z"
            fill={c.fur}
            {...o(0.9)}
          />
          <Path
            d="M 12.5 21.5 L 17.5 19"
            stroke={c.blockRed}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
        </>
      );
      break;
    case 'dolphin':
      art = (
        <>
          <Path
            d="M 0 42 Q 6 39 12 42 T 24 42 T 36 42 T 48 42 V 48 H 0 Z"
            fill={c.water}
            fillOpacity={0.55}
          />
          <Path
            d="M 0 42 Q 6 39 12 42 T 24 42 T 36 42 T 48 42"
            fill="none"
            stroke={c.waterDeep}
            strokeWidth={1.2}
          />
          {lit('M 21 12 L 27 4.5 L 30 13 Z', c.furGrey)}
          {lit('M 40 31 L 46.5 33 L 42.5 35.5 L 44 41.5 L 38.5 36 Z', c.furGrey)}
          {lit(
            'M 3.5 27 C 5.5 25 7 24 9 23 C 13 14 24 9 31 12.5 C 37.5 16 40.5 23 42 31 L 39.5 34 C 37 26 29 20 19 24 C 14 26 10 28 5 28.5 Z',
            c.furGrey,
          )}
          {lit('M 17 25 L 15.5 31.5 L 21.5 25.5 Z', c.furGrey, 1)}
          <Path d="M 4 27.6 Q 7.5 27.2 10 25.6" fill="none" {...o(0.6)} />
          {eye(11.8, 21.8, 1)}
        </>
      );
      break;
    case 'person':
      art = (
        <>
          {ground(24, 44, 10)}
          {limb('M 17.5 19 L 13.5 30', c.blockRed, 3.4)}
          {limb('M 30.5 19 L 34.5 30', c.blockRed, 3.4)}
          {lit(ell(13.2, 31.5, 2, 2), c.skin, 1)}
          {lit(ell(34.8, 31.5, 2, 2), c.skin, 1)}
          {lit('M 18.5 29 H 23.6 V 42 H 18.5 Z', c.blockBlue, 1)}
          {lit('M 24.4 29 H 29.5 V 42 H 24.4 Z', c.blockBlue, 1)}
          {lit(ell(20.5, 42.8, 3.4, 1.6), c.rubber, 1)}
          {lit(ell(27.5, 42.8, 3.4, 1.6), c.rubber, 1)}
          {lit('M 17 19.5 C 17 17 19 16 21 16 H 27 C 29 16 31 17 31 19.5 V 31 H 17 Z', c.blockRed)}
          <Rect x={22.5} y={12.5} width={3} height={4} fill={c.skin} />
          {lit(ell(24, 9, 6, 6), c.skin)}
          <Path
            d="M 17.8 9 C 17.5 2.5 30.5 2.5 30.2 9 C 28 6.2 21 6.2 17.8 9 Z"
            fill={c.furDark}
            {...o(0.8)}
          />
          <Circle cx={21.8} cy={9.6} r={0.85} fill={c.rubber} />
          <Circle cx={26.2} cy={9.6} r={0.85} fill={c.rubber} />
          <Path d="M 22 12 Q 24 13.5 26 12" fill="none" {...o(0.7)} />
        </>
      );
      break;

    // ── Camouflage and survival ───────────────────────────────────────────────
    case 'tree frog':
      art = (
        <>
          {lit('M 2 45 C 3 22 22 5 46 3 C 45 27 28 43 2 45 Z', c.life)}
          <Path d="M 3 44 C 18 32 30 18 45 4" fill="none" stroke={c.lifeDeep} strokeWidth={1.2} />
          <G transform="translate(9 9) scale(0.75)">{frog(c.blockGreen, c.blockRed)}</G>
        </>
      );
      break;
    case 'warbler': {
      const cracks =
        'M 11 0 Q 9 12 12 24 T 10 48 M 21 0 Q 23 10 20 20 T 22 34 M 31 6 Q 29 18 32 30 T 30 48 M 39 0 Q 41 14 38 26';
      art = (
        <>
          <Rect x={4} y={0} width={40} height={48} rx={3} fill={c.bark} />
          <Path
            d={cracks}
            fill="none"
            stroke={c.rubber}
            strokeOpacity={0.55}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
          <Rect x={4} y={0} width={40} height={48} rx={3} fill={url(ids.sheen)} {...o(1)} />
          <G transform="translate(24 24) rotate(62) scale(1.15) translate(-24 -24.5)">
            <Path d="M 33 24 L 42 21.5 L 42 27.5 Z" fill={c.rubber} {...o(0.8)} />
            {lit(ell(24, 24.5, 10.5, 5.8), c.snow)}
            <Path
              d="M 15 22.5 Q 24 19 33 22.5 M 15 26 Q 24 28 33 26 M 20 24.2 H 32"
              fill="none"
              stroke={c.rubber}
              strokeWidth={1.4}
              strokeLinecap="round"
            />
            {lit(ell(12.5, 23.5, 5, 4.6), c.snow)}
            <Path
              d="M 8.5 21.5 Q 12 19 16.5 21.5 M 8.5 24.5 H 15.5"
              fill="none"
              stroke={c.rubber}
              strokeWidth={1.2}
              strokeLinecap="round"
            />
            <Path d="M 7.8 23 L 3 23.6 L 7.8 24.6 Z" fill={c.rubber} />
            <Circle cx={10.5} cy={23} r={0.9} fill={c.rubber} />
          </G>
        </>
      );
      break;
    }
    case 'white hare':
      art = (
        <>
          {flake(40, 7)}
          {flake(32, 3, 1.8)}
          {flake(44, 17, 1.8)}
          {hare(c.snow, true)}
          <Path d="M 0 41 Q 12 37 24 40 T 48 39 V 48 H 0 Z" fill={c.snow} {...o(1)} />
        </>
      );
      break;
    case 'rabbit':
      art = (
        <>
          {hare(c.furLight, false)}
          <Path d="M 2 42 H 46" stroke={c.lifeDeep} strokeWidth={2} strokeLinecap="round" />
          <Path
            d="M 40 42 L 41 36 M 42 42 L 44 37 M 44 42 L 46 38 M 4 42 L 3 37 M 6 42 L 7 36"
            stroke={c.lifeDeep}
            strokeWidth={1.2}
            strokeLinecap="round"
          />
        </>
      );
      break;
    case 'thick fur': {
      const fringe = Array.from(
        { length: 9 },
        (_, i) => `L ${40 - i * 3.5} ${i % 2 ? 36 : 38.5}`,
      ).join(' ');
      art = (
        <>
          {flake(40, 5)}
          {flake(32, 3, 1.8)}
          {ground(25, 43, 18)}
          <Rect x={14} y={33} width={4} height={9} fill={c.rubber} />
          <Rect x={31} y={33} width={4} height={9} fill={c.rubber} />
          {lit(
            `M 9 22 C 11 12 22 9 32 10.5 C 41 12 45 18 44 27 L 42 37 ${fringe} L 10 36 Z`,
            c.furDark,
          )}
          <Path
            d="M 17 15 Q 15 24 17 33 M 23 12 Q 21 23 23 34 M 29 12 Q 27 23 29 34 M 35 13 Q 33 24 35 34 M 40 16 Q 39 26 40 34"
            fill="none"
            stroke={c.rubber}
            strokeOpacity={0.45}
            strokeWidth={1}
            strokeLinecap="round"
          />
          {lit('M 3 24 C 3 18 8 16 12.5 18 L 13.5 30 C 10 32 5 31 3 28 Z', c.furDark)}
          <Path
            d="M 6 19 C 4 14 11 12 14 16.5 C 15 19.5 13.5 22.5 12 23.5 C 12.5 20 10.5 17 7.5 19 Z"
            fill={c.rock3}
            {...o(0.9)}
          />
          <Circle cx={6.5} cy={23} r={1} fill={c.snow} />
        </>
      );
      break;
    }
    case 'blubber':
      art = (
        <>
          <Path d="M 1 38 H 47 L 44 45 H 4 Z" fill={c.snow} {...o(1)} />
          {lit(
            'M 4 28 C 4 21 9 17 15 18 C 24 18 33 23 38 31 L 45 29 L 43 34 L 46 37.5 L 38 37.5 H 10 C 6 37.5 4 33 4 28 Z',
            c.furGrey,
          )}
          {lit('M 15 33 L 20 38 L 12.5 37.5 Z', c.furGrey, 1)}
          {eye(8.5, 23.5, 1.3)}
          <Circle cx={4.5} cy={27} r={0.8} fill={c.rubber} />
          <Path d="M 5 28.5 L 1 27.5 M 5 29.2 L 1 30" {...o(0.5)} />
          <Ellipse cx={25} cy={29} rx={8.5} ry={5.6} fill={c.fat} {...o(1)} />
          <Ellipse cx={25} cy={29.4} rx={4.4} ry={2.6} fill={c.rock6} {...o(0.6)} />
        </>
      );
      break;
    case 'camel hump':
      art = (
        <>
          <Path d="M 0 43 Q 14 39.5 26 42 T 48 41 V 48 H 0 Z" fill={c.rock1} {...o(0.8)} />
          {[17, 21, 33, 37].map((x) => (
            <Rect key={x} x={x} y={29} width={2.6} height={13} fill={c.furLight} {...o(0.8)} />
          ))}
          <Path d="M 41 23 Q 44.5 27 43 31" fill="none" {...o(1)} />
          {lit(
            'M 16 27 C 15 22 18 20 22 20 C 24 9.5 34 9 36 19 C 40 20 42 23 41 28 C 40 31 38 32 36 32 H 19 C 17 32 16 30 16 27 Z',
            c.furLight,
          )}
          {lit(
            'M 19 23.5 C 15 22 13 17 12 12 C 11 9 9 8 6 8.5 C 4 9 3 11 4 12.5 L 8 13.5 C 9 19 12 26 18 29 Z',
            c.furLight,
          )}
          {eye(8, 10.3, 0.8)}
        </>
      );
      break;
    case 'cactus stem':
      art = (
        <>
          <Ellipse cx={24} cy={43} rx={20} ry={3.5} fill={c.rock1} {...o(0.8)} />
          {lit(
            'M 18.5 30 H 12 C 10 30 9 29 9 27 V 16 C 9 13.5 13 13.5 13 16 V 25.5 H 18.5 Z',
            c.lifeDeep,
          )}
          {lit(
            'M 29.5 24 H 36 C 38 24 39 23 39 21 V 10 C 39 7.5 35 7.5 35 10 V 19.5 H 29.5 Z',
            c.lifeDeep,
          )}
          <Path d="M 18 43 V 9 C 18 3.5 30 3.5 30 9 V 43 Z" fill={c.lifeDeep} {...o()} />
          <Path d="M 18 43 V 9 C 18 3.5 30 3.5 30 9 V 43 Z" fill={url(ids.sheen)} />
          <Path
            d="M 21 8 V 43 M 24 5.5 V 43 M 27 8 V 43"
            stroke={c.shade}
            strokeOpacity={0.3}
            strokeWidth={0.8}
          />
          {[12, 18, 24, 30, 36].map((y) => (
            <Path
              key={y}
              d={`M 18 ${y} L 16 ${y - 1.2} M 30 ${y + 2} L 32 ${y + 0.8}`}
              {...o(0.6)}
            />
          ))}
        </>
      );
      break;

    // ── Plant-eaters, meat-eaters and both ────────────────────────────────────
    case 'deer':
      art = (
        <>
          {ground(26, 43, 15)}
          <Path
            d="M 13 7 L 11.5 1 M 12 3.8 L 8.5 2 M 15 7 L 18 1 M 16.8 3 L 20.5 2.5"
            fill="none"
            stroke={c.woodDark}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          {[15, 19, 32, 36].map((x) => (
            <G key={x}>
              <Rect x={x} y={26} width={2.4} height={16} fill={c.fur} {...o(0.8)} />
              <Rect x={x} y={40.5} width={2.4} height={1.8} fill={c.rubber} />
            </G>
          ))}
          {lit(
            'M 14 22 C 14 18 17 16 21 16 H 35 C 39 16 41 19 40 24 C 39 28 36 29 34 29 H 18 C 15 29 14 26 14 22 Z',
            c.fur,
          )}
          {lit(ell(40, 19.5, 2, 3), c.snow, 1)}
          {lit('M 16.5 21 L 12 9.5 L 17.5 8.5 L 22 18 Z', c.fur, 1)}
          <G transform="rotate(40 18 6)">{lit(ell(18, 6, 1.6, 3.2), c.fur, 1)}</G>
          {lit(
            'M 10 7 C 13 5.5 17.5 7 17.5 10 C 17.5 13 13 13 10 14 L 5 15 C 3 15 3 12 5 11 Z',
            c.fur,
          )}
          <Circle cx={4.3} cy={13} r={1} fill={c.rubber} />
          {eye(12, 9.5, 0.9)}
        </>
      );
      break;
    case 'hawk':
      art = (
        <>
          <Path d="M 4 42 L 44 40" stroke={c.woodDark} strokeWidth={3} strokeLinecap="round" />
          {lit('M 27 31 L 36 44.5 L 30 45 L 24 33 Z', c.copper)}
          {lit(
            'M 13.5 18 C 13.5 12 20 11 23 13 C 30 16 32 26 29.5 34 C 26.5 38.5 19 38.5 16 33 C 13 28 13 23 13.5 18 Z',
            c.fur,
          )}
          <Path
            d="M 15 20 C 14 28 17 34 22 35.5 C 20 30 19 24 19 19 Z"
            fill={c.snow}
            fillOpacity={0.9}
          />
          <Path
            d="M 16 24 L 17 25.5 M 17 29 L 18 30.5 M 19 32 L 20 33.5"
            stroke={c.furDark}
            strokeWidth={1}
            strokeLinecap="round"
          />
          <Path
            d="M 20 16 C 28 16 33.5 24 31 37 C 26 32 22 24 20 16 Z"
            fill={c.furDark}
            {...o(0.8)}
          />
          <Path
            d="M 18.5 37 L 17.5 41 M 23 37.5 L 23 41"
            stroke={c.chartSecond}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          {lit(ell(16, 13, 5.5, 5.2), c.fur)}
          <Path
            d="M 11.2 11.2 C 7.5 10.8 6 13.5 7.2 16.5 C 8 14.8 9.5 14.3 11.4 14.8 Z"
            fill={c.rubber}
            {...o(0.6)}
          />
          <Path d="M 11 11.2 L 11.4 14.8" stroke={c.chartSecond} strokeWidth={1.4} />
          <Circle cx={14.6} cy={11.8} r={1.5} fill={c.chartSecond} />
          <Circle cx={14.6} cy={11.8} r={0.75} fill={c.rubber} />
          <Path d="M 12.8 10 L 17 9.8" {...o(0.8)} />
        </>
      );
      break;
    case 'snake': {
      const d = 'M 44 40 C 34 44 16 43 14 37 C 12 31 30 32 34 26 C 38 20 27 14 17 16';
      art = (
        <>
          {ground(28, 42, 18)}
          <Path d={d} fill="none" {...o(7.4)} />
          <Path d={d} fill="none" stroke={c.lifeDeep} strokeWidth={5} strokeLinecap="round" />
          <Path d={d} fill="none" stroke={c.chartSecond} strokeWidth={1.2} strokeLinecap="round" />
          <Path
            d="M 8.5 17 L 4.5 17.5 L 2.5 16.2 M 4.5 17.5 L 2.5 18.8"
            fill="none"
            stroke={c.blockRed}
            strokeWidth={0.9}
            strokeLinecap="round"
          />
          <G transform="rotate(-10 13 16)">{lit(ell(13, 16, 5, 3.6), c.lifeDeep)}</G>
          {eye(11.6, 14.8, 0.9)}
        </>
      );
      break;
    }
    case 'heron':
      art = (
        <>
          <Rect x={0} y={40} width={48} height={8} fill={c.water} fillOpacity={0.55} />
          <Line x1={0} y1={40} x2={48} y2={40} stroke={c.waterDeep} strokeWidth={1} />
          <Path
            d="M 27 27 L 26 43 M 30 27 L 31 43"
            stroke={c.rubber}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
          <Path d="M 22 41 H 34" stroke={c.waterTop} strokeWidth={1} strokeLinecap="round" />
          {limb('M 24 21 C 19 17 25 12 20 8', c.furGrey, 3.4)}
          {lit(
            'M 21.5 19 C 29 15 40 21 41 30 C 37 31.5 30 30.5 26 28.5 C 22 26.5 20 23 21.5 19 Z',
            c.furGrey,
          )}
          <Path d="M 19.5 5.5 L 27 3.5" stroke={c.rubber} strokeWidth={1.3} strokeLinecap="round" />
          <Path d="M 15.5 6 L 4 8.2 L 15.5 9 Z" fill={c.chartSecond} {...o(0.6)} />
          {lit(ell(18.5, 7.2, 3.8, 3), c.snow)}
          <Path d="M 15.5 6.2 L 21.5 5.2" stroke={c.rubber} strokeWidth={1} />
          <Circle cx={17.2} cy={6.8} r={0.8} fill={c.rubber} />
        </>
      );
      break;
    case 'raccoon': {
      // The tail, upright and leaning back, with black rings across it.
      const rings = [-4.5, 0, 4.5].map((dy) => {
        const half = 3.8 * Math.sqrt(1 - (dy / 10) ** 2);
        return `M ${40 - half} ${26 + dy} H ${40 + half}`;
      });
      art = (
        <>
          {ground(25, 42, 17)}
          <G transform="rotate(-35 40 26)">
            {lit(ell(40, 26, 3.8, 10), c.furGrey)}
            <Path d={rings.join(' ')} stroke={c.rubber} strokeWidth={2.2} />
            <Path d="M 37.1 33.5 A 3.8 10 0 0 0 42.9 33.5 Z" fill={c.rubber} />
          </G>
          {[13, 18, 29, 34].map((x) => (
            <Rect
              key={x}
              x={x}
              y={29}
              width={3.6}
              height={12}
              rx={1.2}
              fill={c.rubber}
              {...o(0.8)}
            />
          ))}
          {lit(
            'M 12 26 C 12 20 17 17 23 17 C 31 17 37 21 37 27 C 37 31 34 33 31 33 H 16 C 13 33 12 30 12 26 Z',
            c.furGrey,
          )}
          {lit('M 10 12.5 L 11 7.5 L 14.5 11.5 Z', c.furGrey, 1)}
          {lit(
            'M 17.5 19.5 C 17.5 13.5 13 11 9 12 C 6 13 5 15 3 18 C 2 19.5 3 20.5 5 20.5 C 9 22 14.5 23 17.5 19.5 Z',
            c.furGrey,
          )}
          <Path d="M 4.5 16 C 8 13.5 12.5 14 15 16.8 C 12 18.8 8 18.2 4.5 17.5 Z" fill={c.rubber} />
          <Circle cx={9.8} cy={15.9} r={0.9} fill={c.shine} />
          <Circle cx={3} cy={18.6} r={1} fill={c.rubber} />
        </>
      );
      break;
    }
    case 'bear':
      art = (
        <>
          {ground(25, 43, 19)}
          {[12, 18, 30, 35].map((x) => (
            <G key={x}>
              {lit(
                `M ${x} 28 H ${x + 5.2} V 41 C ${x + 5.2} 42 ${x + 4.2} 42.5 ${x + 2.6} 42.5 C ${x + 1} 42.5 ${x} 42 ${x} 41 Z`,
                c.furDark,
                1,
              )}
            </G>
          ))}
          {lit(
            'M 10 24 C 10 16 15 12.5 21 12.5 C 26 12 30 14 36 16 C 42 18 43.5 26 41.5 31 C 40.5 33 38.5 34 35.5 34 H 15 C 12 34 10 30 10 24 Z',
            c.furDark,
          )}
          {lit(ell(10.5, 13, 2.3, 2.3), c.furDark, 1)}
          {lit(
            'M 13.5 16 C 11.5 13 7 13 5 15 C 3 17 1 19 1.5 21 C 2 23 6 23.5 9 23.5 C 12.5 23.5 14.5 20 13.5 16 Z',
            c.furDark,
          )}
          <Ellipse cx={4} cy={20.6} rx={2.8} ry={2.1} fill={c.fur} />
          <Circle cx={1.9} cy={19.8} r={1.1} fill={c.rubber} />
          <Circle cx={7.8} cy={16.4} r={1.2} fill={c.snow} />
          {eye(7.8, 16.4, 0.8)}
        </>
      );
      break;

    // ── About a meter ─────────────────────────────────────────────────────────
    case 'meter stick':
      art = (
        <G transform="rotate(-22 24 24)">
          <FloorShadow cx={25} cy={30} rx={22} ry={2} />
          <Rect x={1} y={20} width={46} height={7} fill={c.wood} {...o(1)} />
          <Rect x={1} y={20} width={46} height={7} fill={url(ids.light)} />
          {Array.from({ length: 21 }, (_, i) => (
            <Line
              key={i}
              x1={3 + i * 2.1}
              y1={20}
              x2={3 + i * 2.1}
              y2={i % 5 === 0 ? 24.5 : 22}
              stroke={c.woodDark}
              strokeWidth={i % 5 === 0 ? 1 : 0.6}
            />
          ))}
          <Rect x={0} y={19.5} width={2} height={8} fill={url(ids.chrome)} {...o(0.6)} />
          <Rect x={46} y={19.5} width={2} height={8} fill={url(ids.chrome)} {...o(0.6)} />
        </G>
      );
      break;
    case 'door':
      art = (
        <>
          <Rect x={9} y={2} width={30} height={43} fill={c.metal} {...o(1)} />
          <Rect
            x={11.5}
            y={4.5}
            width={25}
            height={40.5}
            fill={c.wood}
            stroke={c.woodDark}
            strokeWidth={1}
          />
          <Path
            d="M 16 5 V 44 M 29 5 V 44"
            stroke={c.woodDark}
            strokeOpacity={0.35}
            strokeWidth={0.8}
          />
          <Rect x={11.5} y={4.5} width={25} height={40.5} fill={url(ids.light)} />
          <Rect x={15} y={8} width={6} height={15} fill={url(ids.glass)} {...o(0.9)} />
          <Rect
            x={31}
            y={22.5}
            width={2.4}
            height={7}
            rx={1.2}
            fill={url(ids.chrome)}
            {...o(0.6)}
          />
          <Rect x={28.5} y={24.6} width={5} height={2} rx={1} fill={url(ids.chrome)} {...o(0.6)} />
          <Line x1={4} y1={45} x2={44} y2={45} {...o(1.5)} />
        </>
      );
      break;
    case 'bus':
      art = (
        <>
          {ground(24, 38, 21)}
          {lit(
            'M 2 32 V 22 C 2 21 3 20.5 4 20.5 H 8 V 13 C 8 11.5 9 11 10.5 11 H 43 C 44.5 11 45.5 12 45.5 13.5 V 32 Z',
            c.chartSecond,
          )}
          {[10, 17, 24, 31, 38].map((x) => (
            <Rect
              key={x}
              x={x}
              y={13.5}
              width={5.5}
              height={6}
              rx={0.8}
              fill={url(ids.glass)}
              {...o(0.7)}
            />
          ))}
          <Line x1={2} y1={26} x2={45.5} y2={26} stroke={c.rubber} strokeWidth={1.4} />
          <Rect x={1} y={29.5} width={5} height={2.8} rx={1} fill={c.rubber} />
          <Circle cx={3.4} cy={23.4} r={1} fill={c.snow} />
          {[12, 37].map((x) => (
            <G key={x}>
              <Circle cx={x} cy={33} r={4.4} fill={c.rubber} {...o(0.8)} />
              <Circle cx={x} cy={33} r={1.9} fill={url(ids.chrome)} />
            </G>
          ))}
        </>
      );
      break;
    case 'pencil':
      art = (
        <G transform="rotate(-40 24 24)">
          <Rect x={10} y={20} width={24} height={8} fill={c.chartSecond} />
          <Path
            d="M 10 22.7 H 34 M 10 25.3 H 34"
            stroke={c.shade}
            strokeOpacity={0.2}
            strokeWidth={0.8}
          />
          <Rect x={10} y={20} width={24} height={8} fill={url(ids.light)} {...o(1)} />
          <Rect x={2} y={20.4} width={5} height={7.2} rx={1.8} fill={c.rock6} {...o(1)} />
          <Rect x={6} y={20} width={4.5} height={8} fill={c.metal} />
          <Rect x={6} y={20} width={4.5} height={8} fill={url(ids.sheenV)} {...o(1)} />
          <Path d="M 7.5 20 V 28 M 9 20 V 28" stroke={c.metalDark} strokeWidth={0.6} />
          <Path d="M 34 20 L 42 24 L 34 28 Z" fill={c.wood} {...o(1)} />
          <Path d="M 39.5 22.8 L 42.5 24 L 39.5 25.2 Z" fill={c.rubber} />
        </G>
      );
      break;
    case 'paper clip': {
      const d = 'M 18 40 V 12 A 6 6 0 0 1 30 12 V 34 A 4 4 0 0 1 22 34 V 16';
      art = (
        <G transform="rotate(-20 24 26)">
          <Path d={d} fill="none" stroke={c.metalDark} strokeWidth={3.4} strokeLinecap="round" />
          <Path d={d} fill="none" stroke={c.silver} strokeWidth={2} strokeLinecap="round" />
          <Path
            d={d}
            fill="none"
            stroke={c.shine}
            strokeOpacity={0.7 * c.sheen}
            strokeWidth={0.6}
            strokeLinecap="round"
            transform="translate(-0.5 -0.3)"
          />
        </G>
      );
      break;
    }
    case 'workbook':
      art = (
        <>
          <Rect x={12.5} y={7.5} width={26.5} height={36} rx={1.5} fill={c.shadow} />
          <Rect x={12} y={6.5} width={26} height={36} rx={1.5} fill={c.snow} {...o(0.9)} />
          <Path d="M 36.8 8 V 41 M 35.6 8 V 41" stroke={c.glassEdge} strokeWidth={0.5} />
          <Rect x={9} y={4.5} width={26} height={36.5} rx={1.5} fill={c.blockBlue} {...o()} />
          <Rect x={9} y={4.5} width={4} height={36.5} fill={c.shade} fillOpacity={0.25} />
          <Rect x={9} y={4.5} width={26} height={36.5} rx={1.5} fill={url(ids.light)} />
          <Rect x={16} y={10} width={15} height={9} rx={1} fill={c.snow} {...o(0.6)} />
          <Path d="M 18 13 H 29 M 18 16 H 26" {...o(0.6)} />
          <Circle cx={19} cy={30} r={3} fill={c.chartSecond} />
          <Path d="M 25 33 L 28.5 26.5 L 32 33 Z" fill={c.blockRed} />
        </>
      );
      break;

    // ── About a liter ─────────────────────────────────────────────────────────
    case 'water bottle': {
      const body =
        'M 20.5 7 H 27.5 V 10 C 27.5 12 34 13 34 17 V 42 C 34 44 32.5 45 31 45 H 17 C 15.5 45 14 44 14 42 V 17 C 14 13 20.5 12 20.5 10 Z';
      art = (
        <>
          {ground(24, 45, 12)}
          <Path d={body} fill={url(ids.glass)} />
          <Path
            d="M 14.8 17 H 33.2 V 42 C 33.2 43.4 32 44.2 31 44.2 H 17 C 16 44.2 14.8 43.4 14.8 42 Z"
            fill={c.water}
            fillOpacity={0.85}
          />
          <Rect x={14.8} y={17} width={18.4} height={1.6} fill={c.waterTop} />
          <Path d="M 14 25 H 34 M 14 35 H 34" stroke={c.glassEdge} strokeWidth={1} />
          <Path d={body} fill={url(ids.sheen)} />
          <Path d={body} fill="none" {...o(1.2)} />
          <Rect x={19.5} y={2} width={9} height={5.5} rx={1.2} fill={c.blockBlue} {...o(1)} />
          <Rect x={19.5} y={2} width={9} height={5.5} rx={1.2} fill={url(ids.sheen)} />
          <Path
            d="M 22 3 V 6.5 M 24 3 V 6.5 M 26 3 V 6.5"
            stroke={c.shade}
            strokeOpacity={0.3}
            strokeWidth={0.6}
          />
        </>
      );
      break;
    }
    case 'milk carton':
      art = (
        <>
          {ground(25, 44, 14)}
          <Polygon points="11,17 29,17 29,43 11,43" fill={c.snow} {...o(1)} />
          <Polygon points="11,24 29,24 29,34 11,34" fill={c.blockBlue} />
          <Path d={drop(20, 29.5, 1.1)} fill={c.snow} />
          <Polygon points="11,17 29,17 29,43 11,43" fill={url(ids.light)} />
          <Polygon points="29,17 37,13 37,39 29,43" fill={c.snow} {...o(1)} />
          <Polygon points="29,24 37,20 37,30 29,34" fill={c.blockBlue} />
          <Polygon points="29,17 37,13 37,39 29,43" fill={c.shade} fillOpacity={0.15} />
          <Polygon points="11,17 29,17 20,8" fill={c.snow} {...o(1)} />
          <Polygon points="29,17 20,8 28,4 37,13" fill={c.snow} {...o(1)} />
          <Polygon points="29,17 20,8 28,4 37,13" fill={c.shade} fillOpacity={0.08} />
          <Polygon points="20,8 28,4 28,2 20,6" fill={c.snow} {...o(1)} />
        </>
      );
      break;
    case 'juice box':
      art = (
        <>
          {ground(25, 43, 14)}
          <Polygon points="12,13 30,13 30,42 12,42" fill={c.orange} {...o(1)} />
          <Polygon points="12,13 30,13 30,42 12,42" fill={url(ids.light)} />
          <Polygon points="30,13 36,9 36,38 30,42" fill={c.orange} {...o(1)} />
          <Polygon points="30,13 36,9 36,38 30,42" fill={c.shade} fillOpacity={0.2} />
          <Polygon points="12,13 30,13 36,9 18,9" fill={c.orange} {...o(1)} />
          <Polygon points="12,13 30,13 36,9 18,9" fill={c.shine} fillOpacity={0.3 * c.sheen} />
          <Rect x={14.5} y={20} width={13} height={16} rx={2} fill={c.snow} {...o(0.6)} />
          {lit(ell(21, 29, 4.5, 4.5), c.orange, 0.9)}
          <Ellipse cx={22.5} cy={23.8} rx={2} ry={1} fill={c.lifeDeep} />
          <Path d="M 25 11 V 5.5 L 29.5 1.5" fill="none" {...o(2.8)} />
          <Path
            d="M 25 11 V 5.5 L 29.5 1.5"
            fill="none"
            stroke={c.snow}
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
      break;
    case 'eyedropper':
      art = (
        <>
          <Path d={drop(8, 44, 1)} fill={c.water} {...o(0.7)} />
          <G transform="rotate(-40 24 24)">
            <Path d="M 3 23.4 L 10 21.8 H 31 V 26.2 H 10 L 3 24.6 Z" fill={url(ids.glass)} />
            <Path d="M 5 23.7 L 10 22.8 H 20 V 25.2 H 10 L 5 24.3 Z" fill={c.water} />
            <Path
              d="M 3 23.4 L 10 21.8 H 31 V 26.2 H 10 L 3 24.6 Z"
              fill={url(ids.sheenV)}
              {...o(0.9)}
            />
            <Rect x={30} y={21} width={3.5} height={6} rx={0.8} fill={c.rubber} {...o(0.8)} />
            {lit(
              'M 33.5 21.2 H 38 C 44 19.5 46.5 21.5 46.5 24 C 46.5 26.5 44 28.5 38 26.8 H 33.5 Z',
              c.blockRed,
            )}
          </G>
        </>
      );
      break;

    // ── Heat ──────────────────────────────────────────────────────────────────
    case 'pan handle':
      art = (
        <>
          {ground(20, 37, 17)}
          {lit('M 25 22.5 L 44 16.5 C 47 15.8 48 20.5 45.8 21.6 L 26.5 29 Z', c.rubber)}
          <Circle
            cx={43.3}
            cy={18.9}
            r={1}
            fill="none"
            stroke={c.shine}
            strokeOpacity={0.6}
            strokeWidth={0.8}
          />
          <Rect
            x={23.5}
            y={22.5}
            width={4}
            height={6.5}
            rx={1}
            fill={url(ids.chrome)}
            {...o(0.7)}
          />
          <Ellipse cx={14} cy={26} rx={12.5} ry={9.5} fill={url(ids.chrome)} {...o(1.2)} />
          <Ellipse cx={14} cy={26.5} rx={10} ry={7.2} fill={c.rubber} fillOpacity={0.85} />
          <Path
            d="M 6.5 24.5 Q 8.5 20.5 14 20.2"
            fill="none"
            stroke={c.shine}
            strokeOpacity={0.35}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        </>
      );
      break;
    case 'oven mitt':
      art = (
        <>
          {lit(
            'M 16 42 V 30 C 11 29 6 23 8.5 18.5 C 10.5 15.5 14 17.5 16 21 V 16 C 16 6 34 6 34 16 V 42 Z',
            c.blockRed,
          )}
          <Path
            d="M 17 20 L 33 34 M 17 29 L 26 37 M 21 13 L 33 24 M 33 21 L 17 35 M 33 30 L 26 36 M 29 12 L 17 23"
            stroke={c.shade}
            strokeOpacity={0.35}
            strokeWidth={0.8}
            strokeDasharray="1.5 1.5"
          />
          <Rect x={14.5} y={36} width={21} height={8.5} rx={1.5} fill={c.snow} {...o(1)} />
          <Rect x={14.5} y={36} width={21} height={8.5} rx={1.5} fill={url(ids.light)} />
          <Path d="M 31 44.5 C 31 47.5 35 47.5 35 44.5" fill="none" {...o(1)} />
        </>
      );
      break;
    case 'kettle':
      art = (
        <>
          {ground(24, 43, 16)}
          <Path
            d="M 5 12 C 3 9 7 7 5 3.5 M 9 11 C 7.5 8.5 10.5 6.5 9 4"
            fill="none"
            stroke={c.chartMuted}
            strokeWidth={1.2}
            strokeLinecap="round"
          />
          <Path
            d="M 16 18 C 16 6 32 6 32 18"
            fill="none"
            stroke={ink}
            strokeWidth={4.6}
            strokeLinecap="round"
          />
          <Path
            d="M 16 18 C 16 6 32 6 32 18"
            fill="none"
            stroke={c.rubber}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <Path d="M 14 31 L 5 17 L 8 15.5 L 18 25 Z" fill={c.silver} {...o(1)} />
          <Path d="M 14 31 L 5 17 L 8 15.5 L 18 25 Z" fill={url(ids.sheen)} />
          <Path
            d="M 12 40 C 10 32 12 22 18 19 H 30 C 36 22 38 32 36 40 Z"
            fill={url(ids.metal)}
            {...o(1.2)}
          />
          <Ellipse cx={24} cy={19} rx={6.5} ry={1.8} fill={c.silver} {...o(0.9)} />
          <Circle cx={24} cy={16.4} r={1.9} fill={c.rubber} />
          <Rect x={11.5} y={39} width={25} height={2.6} rx={1} fill={c.metalDark} {...o(0.8)} />
        </>
      );
      break;
  }

  return (
    <G>
      <Defs>
        <RadialGradient id={ids.round} cx="0.35" cy="0.3" r="0.8" fx="0.3" fy="0.25">
          <Stop offset="0" stopColor={c.shine} stopOpacity={0.45 * c.sheen} />
          <Stop offset="0.5" stopColor={c.shine} stopOpacity={0} />
          <Stop offset="1" stopColor={c.shade} stopOpacity={0.22} />
        </RadialGradient>
        <TopLight id={ids.light} />
        <Sheen id={ids.sheen} />
        <Sheen id={ids.sheenV} vertical />
        <Glass id={ids.glass} />
        <Metal id={ids.metal} light={c.silver} dark={c.silverDark} />
        <Metal id={ids.chrome} light={c.metal} dark={c.metalDark} />
        <Metal id={ids.copper} light={c.copper} dark={c.copperDark} />
      </Defs>
      {art}
    </G>
  );
}
