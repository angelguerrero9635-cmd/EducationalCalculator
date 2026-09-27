/**
 * Round-3 card icons (group B), 48 × 48 like every card icon, drawn in their materials with the
 * helpers in reps/paint.tsx. The names are listed in data/modules/layouts/icons/r3b.ts.
 *
 * Heating and cooling (ice, crayon, chocolate, water, egg, paper, bread) and everyday things to
 * weigh (a grape, a letter, a bicycle, a sack of potatoes).
 */
import type { ReactNode } from 'react';
import {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { usePalette } from '@/theme';

import {
  Ball,
  FloorShadow,
  Glass,
  Metal,
  Sheen,
  TopLight,
  url,
  usePaintIds,
} from '../../reps/paint';
import type { IconProps } from './types';

/** An ellipse as a path, so it can be filled and then lit with the same `d`. */
const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;

/** A flame standing on (x, y), `h` tall and `w` wide either side. */
const flamePath = (x: number, y: number, h: number, w: number) =>
  `M ${x - w} ${y} C ${x - w} ${y - h * 0.45} ${x - w * 0.3} ${y - h * 0.55} ${x} ${y - h} ` +
  `C ${x + w * 0.4} ${y - h * 0.5} ${x + w} ${y - h * 0.45} ${x + w} ${y} ` +
  `C ${x + w} ${y + w * 0.9} ${x - w} ${y + w * 0.9} ${x - w} ${y} Z`;

/** A falling drop with its point up. */
const drop = (x: number, y: number, s = 1) =>
  `M ${x} ${y - 3.5 * s} Q ${x + 2.6 * s} ${y + 0.5 * s} ${x} ${y + 2 * s} Q ${x - 2.6 * s} ${y + 0.5 * s} ${x} ${y - 3.5 * s} Z`;

export function R3BIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  const ids = usePaintIds(
    'round',
    'light',
    'sheen',
    'sheenV',
    'glass',
    'metal',
    'brass',
    'yolk',
    'grape',
    'potato',
    'glow',
    'hot',
    'beam',
    'beamDown',
  );

  const o = (w = 1.2) => ({
    stroke: ink,
    strokeWidth: w,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  });
  /** A shape in its color, outlined, with light from the top left laid over it. */
  const lit = (d: string, fill: string, w = 1.2) => (
    <>
      <Path d={d} fill={fill} {...o(w)} />
      <Path d={d} fill={url(ids.round)} />
    </>
  );
  /** A shape in its color with a gradient laid over it (sheen, top light). */
  const shaded = (d: string, fill: string, over: string, w = 1.2) => (
    <>
      <Path d={d} fill={fill} {...o(w)} />
      <Path d={d} fill={url(over)} />
    </>
  );
  /** A thick stroke in its color with an outline (a wire, a handle, a frame tube). */
  const limb = (d: string, color: string, w = 2.4) => (
    <>
      <Path d={d} fill="none" {...o(w + 1.6)} />
      <Path d={d} fill="none" {...o(w)} stroke={color} />
    </>
  );
  /** A flame: orange outside, yellow inside. */
  const flame = (x: number, y: number, h: number, w: number) => (
    <>
      <Path d={flamePath(x, y, h, w)} fill={c.orange} {...o(0.8)} />
      <Path d={flamePath(x, y + w * 0.1, h * 0.55, w * 0.5)} fill={c.sunDisk} />
    </>
  );
  /** Wavy lines of rising heat or steam. */
  const rising = (xs: number[], y: number, h: number, color: string, w = 1.3) =>
    xs.map((x) => (
      <Path
        key={x}
        d={`M ${x} ${y} C ${x - 2.5} ${y - h * 0.2} ${x + 2.5} ${y - h * 0.4} ${x} ${y - h * 0.55} C ${x - 2.5} ${y - h * 0.7} ${x + 2.5} ${y - h * 0.85} ${x} ${y - h}`}
        fill="none"
        stroke={color}
        strokeWidth={w}
        strokeLinecap="round"
      />
    ));
  /** A snowflake, for cold. */
  const flake = (x: number, y: number, r = 2.5) => (
    <Path
      d={`M ${x - r} ${y} H ${x + r} M ${x - r / 2} ${y - r * 0.87} L ${x + r / 2} ${y + r * 0.87} M ${x - r / 2} ${y + r * 0.87} L ${x + r / 2} ${y - r * 0.87}`}
      stroke={c.glassEdge}
      strokeWidth={1.1}
      strokeLinecap="round"
    />
  );

  let art: ReactNode = null;
  switch (icon) {
    // ── Heating and cooling (D19) ─────────────────────────────────────────────
    case 'melting ice cube':
      art = (
        <>
          <Path d={ell(24, 38, 19, 5)} fill={c.water} fillOpacity={0.75} {...o(1)} />
          <Ellipse cx={19} cy={36.5} rx={8} ry={1.4} fill={c.waterTop} opacity={0.8} />
          <Path d="M 13 17 L 20 10 H 36 L 29 17 Z" fill={c.snow} {...o(1.1)} />
          <Path
            d="M 29 17 L 36 10 V 27 C 36 30 33 32 29 34 Z"
            fill={c.water}
            fillOpacity={0.85}
            {...o(1.1)}
          />
          <Path
            d="M 13 17 H 29 V 33 C 29 36 27 37 24 37 H 18 C 15 37 13 36 13 33 Z"
            fill={c.waterTop}
            {...o(1.1)}
          />
          <Path
            d="M 13 17 H 29 V 33 C 29 36 27 37 24 37 H 18 C 15 37 13 36 13 33 Z"
            fill={url(ids.glass)}
            opacity={0.55}
          />
          <Line
            x1={16}
            y1={20}
            x2={16}
            y2={31}
            stroke={c.glassShine}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          <Line
            x1={17}
            y1={12.5}
            x2={20}
            y2={12.5}
            stroke={c.glassShine}
            strokeWidth={1.2}
            strokeLinecap="round"
          />
          <Path d={drop(39.5, 31, 1.1)} fill={c.water} {...o(0.8)} />
        </>
      );
      break;
    case 'ice cube tray':
      art = (
        <>
          <FloorShadow cx={25} cy={44} rx={20} ry={2.5} />
          {flake(10, 7)}
          {flake(38, 6, 3)}
          {flake(24, 8, 2)}
          <Rect x={4} y={15} width={40} height={28} rx={3.5} fill={c.blockBlue} {...o(1.2)} />
          <Rect x={4} y={15} width={40} height={28} rx={3.5} fill={url(ids.light)} />
          {[0, 1].flatMap((r) =>
            [0, 1, 2, 3].map((k) => {
              const x = 6.5 + k * 9;
              const y = 17.5 + r * 12.5;
              return (
                <G key={`${r}${k}`}>
                  <Rect
                    x={x}
                    y={y}
                    width={8}
                    height={10.5}
                    rx={1.5}
                    fill={c.waterTop}
                    {...o(0.8)}
                  />
                  <Rect
                    x={x + 1.2}
                    y={y + 1.2}
                    width={5.6}
                    height={8.1}
                    rx={1.2}
                    fill={c.snow}
                    opacity={0.85}
                  />
                  <Line
                    x1={x + 2.2}
                    y1={y + 2.5}
                    x2={x + 2.2}
                    y2={y + 6}
                    stroke={c.glassShine}
                    strokeWidth={1.1}
                    strokeLinecap="round"
                  />
                </G>
              );
            }),
          )}
        </>
      );
      break;
    case 'melted crayon': {
      const body =
        'M 4 20 H 27 C 33 20 36 23 37 29 L 37.5 36 C 37.5 38 32.5 38 32.5 36 L 32 31 C 31.5 29 30 28 27 28 H 4 C 3 28 3 20 4 20 Z';
      art = (
        <>
          <FloorShadow cx={20} cy={40} rx={17} ry={2.2} />
          {rising([12, 20], 16, 12, c.orange, 1.2)}
          <Path d={ell(36, 39, 9, 2.6)} fill={c.blockRed} {...o(1)} />
          {shaded(body, c.blockRed, ids.sheenV)}
          <Rect x={8} y={19.6} width={15} height={8.8} fill={c.snow} {...o(0.9)} />
          <Path
            d="M 9.5 22 L 11.5 24 L 13.5 22 L 15.5 24 L 17.5 22 L 19.5 24 L 21.5 22 M 9.5 26 H 21.5"
            fill="none"
            stroke={c.blockRed}
            strokeWidth={1}
            strokeLinejoin="round"
          />
          <Path d={drop(40, 32, 0.8)} fill={c.blockRed} {...o(0.7)} />
        </>
      );
      break;
    }
    case 'melting chocolate bar': {
      const bar =
        'M 12 6 H 36 V 32 C 36 35 34 35 33 38 C 32 41 29.5 41 29.5 38 C 29 35 26 36 24.5 36 C 22.5 36 21.5 39 19.5 40.5 C 17.5 41.5 16.5 38.5 16.5 36.5 C 16 34 12 35 12 31 Z';
      art = (
        <>
          <Path d={ell(24, 42.5, 15, 2.8)} fill={c.chocolate} {...o(1)} />
          {rising([6, 42], 30, 14, c.orange, 1.2)}
          {lit(bar, c.chocolate)}
          {[0, 1].flatMap((r) =>
            [0, 1].map((k) => (
              <Rect
                key={`${r}${k}`}
                x={14.5 + k * 10}
                y={17 + r * 9}
                width={9}
                height={r ? 6 : 7.5}
                rx={1.2}
                fill="none"
                stroke={c.fur}
                strokeOpacity={0.8}
                strokeWidth={1}
              />
            )),
          )}
          <Rect x={11.5} y={4} width={25} height={11} rx={1} fill={c.blockRed} {...o(1)} />
          <Rect x={11.5} y={4} width={25} height={11} rx={1} fill={url(ids.light)} />
          <Rect x={11.5} y={14} width={25} height={2.2} fill={c.silver} {...o(0.8)} />
        </>
      );
      break;
    }
    case 'pot of boiling water':
      art = (
        <>
          {rising([16, 24, 32], 15, 12, c.chartMuted, 1.5)}
          <Rect x={3} y={22} width={8} height={3.5} rx={1.5} fill={c.rubber} {...o(1)} />
          <Rect x={37} y={22} width={8} height={3.5} rx={1.5} fill={c.rubber} {...o(1)} />
          {shaded(
            'M 9 20 H 39 V 37 C 39 40 37 41 34 41 H 14 C 11 41 9 40 9 37 Z',
            c.silver,
            ids.sheen,
          )}
          <Ellipse cx={24} cy={20} rx={15} ry={3.6} fill={c.water} {...o(1.2)} />
          <Ellipse
            cx={24}
            cy={20}
            rx={13.6}
            ry={2.6}
            fill="none"
            stroke={c.silverDark}
            strokeWidth={0.8}
          />
          <Circle cx={18} cy={20} r={1.3} fill={c.waterTop} {...o(0.5)} />
          <Circle cx={25} cy={19.4} r={1.6} fill={c.waterTop} {...o(0.5)} />
          <Circle cx={30.5} cy={20.6} r={1.1} fill={c.waterTop} {...o(0.5)} />
          {flame(17, 45.5, 4.5, 2)}
          {flame(24, 45.5, 5, 2.2)}
          {flame(31, 45.5, 4.5, 2)}
        </>
      );
      break;
    case 'fried egg in a pan':
      art = (
        <>
          <FloorShadow cx={22} cy={40} rx={19} ry={2.5} />
          {limb('M 36 27 L 46 24', c.rubber, 3.6)}
          {shaded('M 3 27 V 30.5 A 17 8 0 0 0 37 30.5 V 27 Z', c.metalDark, ids.sheen)}
          <Path d={ell(20, 27, 17, 8)} fill={c.metalDark} {...o(1.2)} />
          <Path d={ell(20, 27, 14.6, 6.4)} fill={c.rubber} {...o(0.8)} />
          {lit(
            'M 9.5 26.5 C 9.5 22.5 14.5 21.5 19 22 C 24 21 30.5 22.5 30.5 26.5 C 31 30.5 25 32 20 31.5 C 14 32 9.5 30 9.5 26.5 Z',
            c.snow,
            1,
          )}
          <Path d={ell(20.5, 25.6, 4.4, 3.4)} fill={url(ids.yolk)} {...o(1)} />
          {rising([12, 28], 17, 11, c.chartMuted, 1.2)}
        </>
      );
      break;
    case 'burning paper': {
      const edge =
        'M 16 10 Q 20 16 22 16.5 Q 25 17 27 21 Q 29 25 32 25.5 Q 36 26 37 30 Q 38 34 42 35';
      const sheet = `M 6 43 L 5 11 L 16 10 ${edge.slice(8)} L 43 43 Z`;
      const char = `${edge} L 39 38 Q 35 37 34 33 Q 33 29 29 28.5 Q 26 28 24 24 Q 22 20 19 19.5 Q 17 19 13.5 12.5 Z`;
      art = (
        <>
          <FloorShadow cx={24} cy={45} rx={19} ry={2} />
          {shaded(sheet, c.snow, ids.light)}
          {[22, 27, 32, 37].map((y) => (
            <Line
              key={y}
              x1={9}
              y1={y}
              x2={Math.min(34, y - 6)}
              y2={y}
              stroke={c.chartMuted}
              strokeWidth={1}
              strokeLinecap="round"
            />
          ))}
          <Path d={char} fill={c.rubber} />
          <Path d={edge} fill="none" stroke={c.orange} strokeWidth={1.2} strokeLinecap="round" />
          {flame(20, 15, 9, 3)}
          {flame(29, 23, 13, 4.2)}
          {flame(38, 30, 9, 3)}
          <Path d="M 40 13 L 43 11.5 L 43 14.5 Z" fill={c.rubber} {...o(0.6)} />
          <Path d="M 44 20 L 46.5 19 L 46 22 Z" fill={c.rock2} {...o(0.6)} />
        </>
      );
      break;
    }
    case 'loaf of bread':
      art = (
        <>
          <FloorShadow cx={24} cy={42} rx={20} ry={2.5} />
          {lit(
            'M 5 37 C 4 25 12 15 24 15 C 36 15 44 25 43 37 C 43 39.5 42 40.5 40 40.5 H 8 C 6 40.5 5 39.5 5 37 Z',
            c.fur,
          )}
          {[
            'M 12 23 C 14 25 15.5 27 16 30',
            'M 20 19.5 C 22 22 23.5 25 24 28.5',
            'M 29 19.5 C 31 22 32.5 25 33 28.5',
          ].map((d) => (
            <Path
              key={d}
              d={d}
              fill="none"
              stroke={c.furLight}
              strokeWidth={2.4}
              strokeLinecap="round"
            />
          ))}
          <Path
            d="M 6 36 C 16 38 32 38 42 36"
            fill="none"
            stroke={c.furDark}
            strokeWidth={1.2}
            strokeOpacity={0.7}
          />
        </>
      );
      break;
    case 'slice of toast':
      art = (
        <>
          <FloorShadow cx={24} cy={44} rx={16} ry={2.2} />
          {lit(
            'M 10 42 V 20 C 4.5 18 5 7.5 13 7 C 18 4 30 4 35 7 C 43 7.5 43.5 18 38 20 V 42 Z',
            c.furDark,
          )}
          <Path
            d="M 13 39 V 18.5 C 9 17 9 10 14.5 9.8 C 19 7.8 29 7.8 33.5 9.8 C 39 10 39 17 35 18.5 V 39 Z"
            fill={c.wood}
          />
          <Path
            d="M 13 39 V 18.5 C 9 17 9 10 14.5 9.8 C 19 7.8 29 7.8 33.5 9.8 C 39 10 39 17 35 18.5 V 39 Z"
            fill={url(ids.hot)}
          />
          {[
            [18, 16],
            [28, 14],
            [22, 25],
            [31, 30],
            [17, 33],
          ].map(([x, y]) => (
            <Circle key={`${x}${y}`} cx={x} cy={y} r={1} fill={c.woodDark} opacity={0.7} />
          ))}
        </>
      );
      break;

    // ── Everyday masses (D27) ─────────────────────────────────────────────────
    case 'grape':
      art = (
        <>
          <FloorShadow cx={24} cy={43} rx={9} ry={2} />
          {limb('M 24 15 V 12 C 24 9 26 7 30 6', c.bark, 1.8)}
          <Path d={ell(24, 28, 10, 13)} fill={url(ids.grape)} {...o(1.2)} />
          <Path d={ell(24, 15.4, 2.4, 1.1)} fill={c.bark} {...o(0.7)} />
          <Path
            d="M 18.5 21 C 17.5 25 17.5 30 19 34"
            fill="none"
            stroke={c.shine}
            strokeOpacity={0.55}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <Circle cx={24} cy={40.2} r={0.7} fill={c.bark} />
        </>
      );
      break;
    case 'letter in an envelope':
      art = (
        <>
          <FloorShadow cx={25} cy={41} rx={19} ry={2} />
          <Rect x={4} y={11} width={40} height={27} rx={2} fill={c.snow} {...o(1.2)} />
          <Rect x={4} y={11} width={40} height={27} rx={2} fill={url(ids.light)} />
          <Path
            d="M 4.5 37 L 18.5 24 M 43.5 37 L 29.5 24"
            fill="none"
            stroke={c.chartMuted}
            strokeWidth={0.9}
          />
          <Path d="M 4.5 12 L 24 27.5 L 43.5 12" fill={c.snow} {...o(1.1)} />
          <Rect
            x={34}
            y={14}
            width={7}
            height={8.5}
            fill={c.blockRed}
            stroke={c.snow}
            strokeWidth={0.9}
            strokeDasharray="1 0.8"
          />
          <Circle cx={37.5} cy={18.2} r={1.8} fill={c.snow} opacity={0.6} />
        </>
      );
      break;
    case 'bicycle': {
      const wheel = (cx: number) => (
        <>
          <Circle cx={cx} cy={31} r={9} fill="none" {...o(4)} />
          <Circle cx={cx} cy={31} r={9} fill="none" stroke={c.rubber} strokeWidth={2.6} />
          {[0, 45, 90, 135].map((a) => (
            <Line
              key={a}
              x1={cx + 7.6 * Math.cos((a * Math.PI) / 180)}
              y1={31 + 7.6 * Math.sin((a * Math.PI) / 180)}
              x2={cx - 7.6 * Math.cos((a * Math.PI) / 180)}
              y2={31 - 7.6 * Math.sin((a * Math.PI) / 180)}
              stroke={c.silverDark}
              strokeWidth={0.6}
            />
          ))}
          <Circle cx={cx} cy={31} r={1.4} fill={c.silver} {...o(0.6)} />
        </>
      );
      art = (
        <>
          <FloorShadow cx={24} cy={42} rx={20} ry={2} />
          {wheel(11)}
          {wheel(37)}
          {limb(
            'M 11 31 L 22 31 L 19 17 Z M 19.5 19 L 33.5 18.5 L 22 31 M 33 15 L 37 31',
            c.blockRed,
            2.2,
          )}
          {limb('M 33 15 L 32 11.5 H 35.5', c.silver, 1.6)}
          <Circle cx={22} cy={31} r={2.4} fill={c.silver} {...o(0.8)} />
          <Line
            x1={22}
            y1={31}
            x2={25}
            y2={35}
            stroke={ink}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
          <Path d={ell(18.5, 15.5, 4, 1.4)} fill={c.rubber} {...o(0.8)} />
        </>
      );
      break;
    }
    case 'sack of potatoes': {
      const potato = (cx: number, cy: number, rx: number, ry: number, rot: number) => (
        <G transform={`rotate(${rot} ${cx} ${cy})`}>
          <Path d={ell(cx, cy, rx, ry)} fill={url(ids.potato)} {...o(1)} />
          <Circle cx={cx - rx * 0.3} cy={cy - ry * 0.2} r={0.6} fill={c.furDark} />
          <Circle cx={cx + rx * 0.35} cy={cy + ry * 0.25} r={0.6} fill={c.furDark} />
        </G>
      );
      art = (
        <>
          <FloorShadow cx={25} cy={43} rx={19} ry={2.5} />
          {lit(
            'M 17 12 L 13 4.5 L 18 7.5 L 20.5 3 L 23.5 7 L 26.5 3 L 29 7.5 L 34 5 L 30 12 Z',
            c.rock4,
            1,
          )}
          {lit(
            'M 17.5 12.5 C 9 17 5 29 7 37 C 9 43 27 44 33 42 C 40 40 41 29 37 20 C 35 16 32 14 29.5 12.5 Z',
            c.rock4,
          )}
          {[21, 27, 33].map((y) => (
            <Path
              key={y}
              d={`M ${9 - (y - 21) * 0.1} ${y} Q 23 ${y + 2.5} ${37.5 + (y - 21) * 0.15} ${y}`}
              fill="none"
              stroke={c.rock5}
              strokeWidth={0.8}
              strokeDasharray="1.4 1.2"
            />
          ))}
          {limb('M 17 12.5 Q 23.5 14.5 30 12.5', c.woodDark, 1.8)}
          {potato(32.5, 38.5, 7, 4.8, -12)}
          {potato(41.5, 41, 4.8, 3.6, 20)}
        </>
      );
      break;
    }
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
        <Metal id={ids.brass} light={c.brass} dark={c.brassDark} />
        <Ball id={ids.yolk} color={c.sunDisk} />
        <Ball id={ids.grape} color={c.purple} />
        <Ball id={ids.potato} color={c.fur} />
        <RadialGradient id={ids.glow} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor={c.bulbGlow} stopOpacity={0.95} />
          <Stop offset="0.5" stopColor={c.bulbGlow} stopOpacity={0.45} />
          <Stop offset="1" stopColor={c.bulbGlow} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={ids.hot} cx="0.5" cy="0.5" r="0.6">
          <Stop offset="0" stopColor={c.fur} stopOpacity={0} />
          <Stop offset="0.6" stopColor={c.fur} stopOpacity={0.2} />
          <Stop offset="1" stopColor={c.fur} stopOpacity={0.75} />
        </RadialGradient>
        <LinearGradient id={ids.beam} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={c.bulbGlow} stopOpacity={0.85} />
          <Stop offset="1" stopColor={c.bulbGlow} stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id={ids.beamDown} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={c.bulbGlow} stopOpacity={0.8} />
          <Stop offset="1" stopColor={c.bulbGlow} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {art}
    </G>
  );
}
