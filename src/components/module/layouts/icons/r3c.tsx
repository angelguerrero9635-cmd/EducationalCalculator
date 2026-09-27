/**
 * Round-3 card icons (group C), 48 × 48 like every card icon, drawn in their materials with the
 * helpers in reps/paint.tsx. The names are listed in data/modules/layouts/icons/r3c.ts.
 *
 * Animals in their fur, feathers and scales like the ones in cardIcons.tsx: facing left, lit
 * from the top left, a bold outline in the card's ink and few details.
 */
import type { ReactNode } from 'react';
import {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { usePalette } from '@/theme';

import { FloorShadow, url, usePaintIds } from '../../reps/paint';
import type { IconProps } from './types';

/** An ellipse as a path, so it can be filled and then lit with the same `d`. */
const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;

/** A cubic curve: start, two control points, end. */
type Curve = [number, number, number, number, number, number, number, number];

/** A point on a cubic curve, and the curve's direction there in degrees. */
const bez = ([x0, y0, x1, y1, x2, y2, x3, y3]: Curve, t: number) => {
  const u = 1 - t;
  const at = (a: number, b: number, c: number, d: number) =>
    u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
  const slope = (a: number, b: number, c: number, d: number) =>
    3 * u * u * (b - a) + 6 * u * t * (c - b) + 3 * t * t * (d - c);
  const dx = slope(x0, x1, x2, x3);
  const dy = slope(y0, y1, y2, y3);
  return { x: at(x0, x1, x2, x3), y: at(y0, y1, y2, y3), a: (Math.atan2(dy, dx) * 180) / Math.PI };
};
const curve = ([x0, y0, x1, y1, x2, y2, x3, y3]: Curve) =>
  `M ${x0} ${y0} C ${x1} ${y1} ${x2} ${y2} ${x3} ${y3}`;

/** A zebra's body and its neck and head, the outline its stripes are clipped to. */
const ZEBRA_BODY =
  'M 11 21 C 11 16.5 14 15 18 15 H 34 C 38 15 40 17.5 39.5 22 C 39 26 36.5 28 33 28 H 16 C 12.5 28 11 25.5 11 21 Z';
const ZEBRA_HEAD =
  'M 19 18 L 12 6.5 C 11 5 9 4.5 7.5 5.5 C 6 6.5 4.5 9 3 12 C 2 14 3 15.5 5 15 L 8 13.5 L 13.5 23 Z';
/** Stripes across the body, down the neck and across the face. */
const ZEBRA_STRIPES = [
  ...[15, 18.2, 21.4, 24.6, 27.8, 31, 34.2, 37.4].map((x) => `M ${x} 13 Q ${x + 2.5} 21.5 ${x} 30`),
  ...[0.15, 0.32, 0.49, 0.66, 0.83].map((t) => {
    // Across the neck, from its back edge to its throat.
    const x = 18.5 - 7 * t;
    const y = 19 - 12.5 * t;
    return `M ${x - 6} ${y + 3} L ${x + 6} ${y - 3}`;
  }),
  'M 5 9.5 L 9.5 11 M 4 12 L 8.5 13',
];

export function R3CIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  const ids = usePaintIds('round', 'zebra');

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
  /** Water across the bottom, from `y` down, with a wavy top. */
  const water = (y: number) => (
    <>
      <Path
        d={`M 0 ${y} Q 6 ${y - 3} 12 ${y} T 24 ${y} T 36 ${y} T 48 ${y} V 48 H 0 Z`}
        fill={c.water}
        fillOpacity={0.55}
      />
      <Path
        d={`M 0 ${y} Q 6 ${y - 3} 12 ${y} T 24 ${y} T 36 ${y} T 48 ${y}`}
        fill="none"
        stroke={c.waterDeep}
        strokeWidth={1.2}
      />
    </>
  );
  /** Snow or ice across the bottom, from `y` down. */
  const snow = (y: number) => (
    <Path
      d={`M 0 ${y + 1} Q 12 ${y - 2} 24 ${y} T 48 ${y - 1} V 48 H 0 Z`}
      fill={c.snow}
      {...o(1)}
    />
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
  /** A slab of rock with a fossil in it. */
  const slab = (fill: string) => (
    <>
      <FloorShadow cx={24} cy={41.5} rx={21} ry={3} />
      {lit(
        'M 4 14 C 5 9 12 7 22 7.5 C 33 8 42 9 44.5 15 C 46.5 22 45 33 42 38 C 38 42 26 42.5 15 41.5 C 7 40.5 3 36 3 28 C 3 22 3 18 4 14 Z',
        fill,
      )}
      <Path
        d="M 3.4 32 C 5.5 37 10 39.2 18 39.7 C 28 40.2 38 39.2 43 34.8"
        fill="none"
        stroke={c.shade}
        strokeOpacity={0.15}
        strokeWidth={1.4}
      />
    </>
  );
  /** A grey wolf running, facing left (full size; the pack scales it down). */
  const wolf = (k: number) => (
    <>
      {limb('M 34 26 L 36 34 L 40 36', c.furGrey, 2.4)}
      {limb('M 18 26 L 14 34 L 10 35.5', c.furGrey, 2.4)}
      {lit('M 39 18 C 43 17 47 18.5 48 21.5 C 46 24.5 42.5 24 39.5 22.5 Z', c.furGrey, 1.25 / k)}
      {lit(
        'M 12 20 C 13 16 18 15 24 15.5 C 31 16 36 16 39 18 C 42 20 42 25 38 27 C 33 29 20 29 16 27 C 13 25.5 11.5 23 12 20 Z',
        c.furGrey,
        1.25 / k,
      )}
      <Path d="M 16 26 C 22 28.5 32 28.5 37 26.5 C 30 25.5 22 25.5 16 26 Z" fill={c.snow} />
      <Path
        d="M 18 16.2 C 26 14.6 34 15.5 39 18 C 32 19.8 24 19.3 18 16.2 Z"
        fill={c.rock5}
        fillOpacity={0.8}
      />
      {limb('M 36.5 24 L 41 31 L 45.5 32', c.furGrey, 2.4)}
      {limb('M 16 24.5 L 10 31 L 5 32', c.furGrey, 2.4)}
      {lit('M 9.5 14 L 10.5 7.5 L 14 13 Z', c.furGrey, 1 / k)}
      {lit(
        'M 15.5 17 C 13 13 9 12.5 6 13.5 L 1.5 15.5 C 0.5 16.5 1 18 2.5 18.2 L 7 19 C 10 20.5 14 21 16 20 Z',
        c.furGrey,
        1.25 / k,
      )}
      <Path d="M 2.2 17.6 L 8 18.6 L 9.5 19.6 C 6 20 3.5 19.3 2.2 17.6 Z" fill={c.snow} />
      <Circle cx={1.7} cy={16.3} r={1.1} fill={c.rubber} />
      {eye(7.2, 15.2, 0.9)}
    </>
  );
  /** A zebra standing, facing left, its stripes clipped to its outline. */
  const zebra = (k: number) => (
    <>
      {limb('M 39 18 C 42 22 42 27 41.5 31', c.snow, 0.8)}
      <Ellipse cx={41.5} cy={32} rx={1.1} ry={1.8} fill={c.rubber} />
      {[12.5, 16.5, 30.5, 34.5].map((x) => (
        <G key={x}>
          <Rect x={x} y={25} width={3} height={17} rx={1} fill={c.snow} {...o(1 / k)} />
          <Path
            d={`M ${x} 31 h 3 M ${x} 35 h 3 M ${x} 39 h 3`}
            stroke={c.rubber}
            strokeWidth={1.3}
          />
          <Rect x={x} y={40.5} width={3} height={1.8} fill={c.rubber} />
        </G>
      ))}
      <Path d={ZEBRA_BODY} fill={c.snow} {...o(1.25 / k)} />
      <Path d={ZEBRA_HEAD} fill={c.snow} {...o(1.25 / k)} />
      <G clipPath={url(ids.zebra)}>
        <Path d={ZEBRA_STRIPES.join(' ')} fill="none" stroke={c.rubber} strokeWidth={1.5} />
      </G>
      <Path d={ZEBRA_BODY} fill={url(ids.round)} />
      <Path d={ZEBRA_HEAD} fill={url(ids.round)} />
      {limb('M 19.5 16.5 L 12.5 5', c.rubber, 1.6)}
      <G transform="rotate(20 11.5 4)">
        <Path d={ell(11.5, 4, 1, 2.4)} fill={c.snow} {...o(1 / k)} />
      </G>
      <Path d={ell(4.3, 13.4, 2.2, 1.8)} fill={c.rubber} />
      {eye(8.6, 8.8, 0.8)}
    </>
  );
  /** An emperor penguin from the front, its head's top at (x, y). */
  const penguin = (x: number, y: number) => (
    <G key={`${x}${y}`}>
      {lit(ell(x, y + 13, 6, 9), c.rubber)}
      <Path d={ell(x, y + 15, 4.2, 7.2)} fill={c.snow} />
      {lit(ell(x, y + 3.6, 3.8, 3.6), c.rubber)}
      <Path d={ell(x - 3.1, y + 5.5, 1, 1.7)} fill={c.chartSecond} />
      <Path d={ell(x + 3.1, y + 5.5, 1, 1.7)} fill={c.chartSecond} />
      <Path
        d={`M ${x - 0.9} ${y + 4.6} L ${x} ${y + 8} L ${x + 0.9} ${y + 4.6} Z`}
        fill={c.orange}
      />
      <Circle cx={x - 1.4} cy={y + 2.8} r={0.55} fill={c.shine} />
      <Circle cx={x + 1.4} cy={y + 2.8} r={0.55} fill={c.shine} />
    </G>
  );
  /** A honeybee seen from above, head toward `a` degrees. */
  const bee = (x: number, y: number, a: number) => (
    <G key={`${x}${y}`} transform={`translate(${x} ${y}) rotate(${a}) scale(0.88)`}>
      <Path d={ell(0.8, -1.9, 2, 1.1)} fill={c.glass} fillOpacity={0.85} {...o(0.5)} />
      <Path d={ell(0.8, 1.9, 2, 1.1)} fill={c.glass} fillOpacity={0.85} {...o(0.5)} />
      {lit(ell(0.6, 0, 3.1, 2), c.chartSecond, 0.7)}
      <Path d="M 0.6 -1.9 V 1.9 M 2.2 -1.6 V 1.6" stroke={c.rubber} strokeWidth={0.8} />
      <Circle cx={-3} cy={0} r={1.3} fill={c.rubber} {...o(0.5)} />
    </G>
  );
  /** A small silver fish like the 'fish' icon, facing left, its box's corner at (x, y). */
  const smallFish = (x: number, y: number) => (
    <G key={`${x}${y}`} transform={`translate(${x} ${y}) scale(0.3)`}>
      {lit('M 33 24 L 45 13 C 42 19 42 29 45 35 Z', c.silver, 3)}
      {lit('M 3 24 C 8 12 28 10 36 24 C 28 38 8 36 3 24 Z', c.silver, 3)}
      <Path d="M 5 21 C 12 14 26 13 34 21 C 25 18 13 18 5 21 Z" fill={c.water} />
      {eye(9, 22, 2.4)}
    </G>
  );
  /** A red-brown ant walking left, its jaws up (full size at (x, y), then scaled). */
  const ant = (x: number, y: number) => (
    <G key={x} transform={`translate(${x} ${y})`}>
      <Path
        d="M -3 0 L -6.5 5.5 M -2.2 0 L -1.5 6 M -1.5 0 L 3 5.5 M -8 -2.6 L -10.5 -6.5 L -12 -6"
        fill="none"
        {...o(1)}
      />
      {lit(ell(3.8, 0.3, 3.8, 2.8), c.copperDark, 1)}
      {lit(ell(-2, 0, 2.6, 1.5), c.copperDark, 1)}
      {lit(ell(-6.8, -1, 2.2, 2), c.copperDark, 1)}
      <Circle cx={-7.6} cy={-1.6} r={0.45} fill={c.shine} />
    </G>
  );

  let art: ReactNode;
  switch (icon) {
    // ── Where animals live ──────────────────────────────────────────────────
    case 'duck':
      art = (
        <>
          {lit(
            'M 9 30 C 9 25 14 22.5 21 23 C 28 23.5 34 24 39 22 L 45 19 C 45 26 42 33 34 36 H 17 C 12 36 9 34 9 30 Z',
            c.furGrey,
          )}
          <Path
            d="M 9.5 29 C 10 25 13 23 17 23 C 17 28 16 33 15 35.8 C 11.5 35 9.2 32.5 9.5 29 Z"
            fill={c.fur}
            {...o(0.8)}
          />
          {lit(
            'M 20 26 C 26 23.5 35 23.5 41 22 C 38 28 31 31 23 30.5 C 20 30 19 28 20 26 Z',
            c.feather,
            1,
          )}
          <Path d="M 27 29.6 L 33 28.8 L 32.4 30.7 L 27.5 31 Z" fill={c.blockBlue} />
          <Path d="M 41 21 Q 42.5 16.5 39.5 17.5" fill="none" {...o(1.6)} />
          {lit(
            'M 8.5 14.5 C 8.5 10 12 8 15 8.5 C 19 9 20.5 13 19 17 C 18 19.5 18.5 22 19.5 24.5 L 12 25 C 11 22.5 11 20.5 10.5 19.5 C 9 18 8.5 16.5 8.5 14.5 Z',
            c.lifeDeep,
          )}
          <Path
            d="M 11 21.3 Q 15 22.6 18.6 21.3"
            fill="none"
            stroke={c.snow}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <Path
            d="M 9.5 14 C 7 14 4 14.5 2.5 16 C 2 17.3 3.5 17.8 5 17.6 L 9.8 17 Z"
            fill={c.chartSecond}
            {...o(0.9)}
          />
          {eye(13.6, 13, 1.1)}
          {water(34.5)}
        </>
      );
      break;
    case 'owl':
      art = (
        <>
          <Path
            d="M 2 41.5 L 46 39.5"
            stroke={c.woodDark}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          {lit(
            'M 13 15 L 11.5 5 L 18 10.5 C 22 9.5 26 9.5 30 10.5 L 36.5 5 L 35 15 C 38.5 21 38 33 33.5 38.5 C 29 42 19 42 14.5 38.5 C 10 33 9.5 21 13 15 Z',
            c.feather,
          )}
          <Path
            d="M 13 20 C 9.5 26 10.5 35 15 39 C 15.5 32 15.5 25 13 20 Z"
            fill={c.furDark}
            {...o(0.8)}
          />
          <Path
            d="M 35 20 C 38.5 26 37.5 35 33 39 C 32.5 32 32.5 25 35 20 Z"
            fill={c.furDark}
            {...o(0.8)}
          />
          <Path
            d="M 17 26 C 17 34 20 39.5 24 39.5 C 28 39.5 31 34 31 26 C 28 24 20 24 17 26 Z"
            fill={c.featherLight}
          />
          <Path
            d="M 20 29.5 L 21 30.5 L 22 29.5 M 26 29.5 L 27 30.5 L 28 29.5 M 23 32.5 L 24 33.5 L 25 32.5 M 20 35.5 L 21 36.5 L 22 35.5 M 26 35.5 L 27 36.5 L 28 35.5"
            fill="none"
            stroke={c.feather}
            strokeWidth={0.9}
            strokeLinecap="round"
          />
          <Circle cx={19.3} cy={17.5} r={6} fill={c.featherLight} {...o(0.8)} />
          <Circle cx={28.7} cy={17.5} r={6} fill={c.featherLight} {...o(0.8)} />
          <Circle cx={19.3} cy={17.5} r={3.6} fill={c.chartSecond} {...o(0.6)} />
          <Circle cx={28.7} cy={17.5} r={3.6} fill={c.chartSecond} {...o(0.6)} />
          {eye(19.3, 17.5, 2)}
          {eye(28.7, 17.5, 2)}
          <Path d="M 22.6 21 L 25.4 21 L 24 25 Z" fill={c.rubber} {...o(0.6)} />
          <Path
            d="M 20 39.5 V 42 M 22 39.5 V 42 M 26 39.5 V 42 M 28 39.5 V 42"
            stroke={c.chartSecond}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        </>
      );
      break;
    case 'squirrel':
      art = (
        <>
          {ground(26, 42.5, 17)}
          {lit(
            'M 27 41 C 38 43 46 35 44 25 C 43 19 46 14 43 8 C 39 3 31 4 30 11 C 29 17 35 21 34 28 C 33.5 33 29 36 27 41 Z',
            c.fur,
          )}
          <Path
            d="M 33.5 9.5 C 32.5 15 38.5 20 38.5 27 C 38.5 33 35 37 30.5 40"
            fill="none"
            stroke={c.furLight}
            strokeWidth={1.5}
            strokeOpacity={0.8}
            strokeLinecap="round"
          />
          {lit(
            'M 14 41 C 11 34 13 25 19.5 23 C 26 21 31 27 31 34 C 31 39 28 41.5 24 41.5 H 16 Z',
            c.fur,
          )}
          <Path d="M 16 39.5 C 14.5 34 15.5 28 19 26 C 21 29 21.5 35 20.5 40 Z" fill={c.furLight} />
          {lit(ell(26, 36.5, 5.5, 4.5), c.fur)}
          {lit(ell(21.5, 41.2, 5, 1.6), c.fur, 1)}
          {lit('M 16.5 11.5 L 18 5.5 L 20.8 12 Z', c.fur, 1)}
          {lit(
            'M 8.5 17.5 C 8.5 13.5 12 11 16 11 C 20.5 11 22.5 14.5 22 18 C 21.5 21.5 18 23 14 23 C 11 23 9 21 8.5 17.5 Z',
            c.fur,
          )}
          <Ellipse cx={12.5} cy={19.8} rx={2.8} ry={1.9} fill={c.furLight} />
          <Circle cx={8.8} cy={17.6} r={1} fill={c.rubber} />
          <Circle cx={13.8} cy={15.4} r={1.8} fill={c.furLight} />
          {eye(13.8, 15.4, 1.2)}
          {lit(ell(12.5, 29, 2.5, 3), c.wood, 1)}
          <Path d="M 9.8 27.6 C 9.8 25 15.2 25 15.2 27.6 Z" fill={c.woodDark} {...o(0.8)} />
          <Path d="M 12.5 25.3 V 24" {...o(0.9)} />
          {lit(ell(15.2, 28.5, 1.8, 1.5), c.fur, 0.8)}
          {lit(ell(15.2, 31.2, 1.8, 1.5), c.fur, 0.8)}
        </>
      );
      break;
    case 'lizard':
      art = (
        <>
          <FloorShadow cx={25} cy={27} rx={21} ry={5} />
          {limb('M 14 21.5 L 11 16 L 7.5 15', c.scales, 2)}
          {limb('M 14 26.5 L 11 32 L 7.5 33', c.scales, 2)}
          {limb('M 29 21 L 33 15.5 L 36.5 15', c.scales, 2)}
          {limb('M 29 27 L 32.5 32.5 L 36 33.5', c.scales, 2)}
          <Path
            d="M 7.5 15 L 6 13.5 M 7.5 15 L 5.5 15.5 M 7.5 33 L 6 34.5 M 7.5 33 L 5.5 32.5 M 36.5 15 L 38 13.2 M 36.5 15 L 38.5 15.8 M 36 33.5 L 37.5 35.2 M 36 33.5 L 38 32.8"
            {...o(0.9)}
          />
          {lit(
            'M 2.5 24 C 2.5 21.8 5.5 20.6 9 21 C 11.5 21.3 13 21 15 20.3 C 21 18.8 28 19.4 32 21.8 C 36 24.2 41 24.6 46.5 21 C 44 27 38 29.2 32 26.4 C 28 28.6 21 29.2 15 27.6 C 13 27 11.5 27 9 27.1 C 5.5 27.4 2.5 26.2 2.5 24 Z',
            c.scales,
          )}
          {[
            [17, 24],
            [20.5, 22.2],
            [20.5, 25.8],
            [24, 24],
            [27.5, 22.4],
            [27.5, 25.6],
            [31, 24],
            [35, 25],
            [39, 25.2],
          ].map(([x, y]) => (
            <Circle key={`${x}${y}`} cx={x} cy={y} r={0.9} fill={c.rock1} />
          ))}
          {eye(6.8, 21.7, 0.8)}
          {eye(6.8, 26.3, 0.8)}
        </>
      );
      break;
    case 'roadrunner':
      art = (
        <>
          {ground(24, 43, 15)}
          {lit('M 28 22 L 45 5.5 C 47 6.5 47.8 8.5 46.8 10.2 L 31 27.5 Z', c.furDark)}
          <Path
            d="M 42.5 9.5 L 44 10 M 39.5 12.5 L 41 13 M 36.5 15.5 L 38 16"
            stroke={c.snow}
            strokeWidth={1.2}
            strokeLinecap="round"
          />
          {limb('M 25 29 L 30 35 L 35 36.5', c.furGrey, 1.3)}
          {limb('M 20 29.5 L 16 36.5 L 19.5 41.5', c.furGrey, 1.3)}
          <Path d="M 19.5 41.5 L 23 42 M 19.5 41.5 L 16.5 42.5 M 35 36.5 L 37 34.5" {...o(1)} />
          <G transform="rotate(-15 22 25)">{lit(ell(22, 25, 10.5, 6.2), c.feather)}</G>
          <Path
            d="M 12.5 25.5 C 13.5 30 19 32 25.5 30.5 C 20 29.5 16 28 12.5 25.5 Z"
            fill={c.featherLight}
          />
          <Path
            d="M 16.5 22 C 23 18.5 30 19 33.5 21.5 C 28 25 22 26 16.5 22 Z"
            fill={c.furDark}
            {...o(0.8)}
          />
          <Path
            d="M 20 21.5 L 22.5 20.8 M 25 20.5 L 27.5 20.4 M 22.5 23.6 L 25 23.2 M 27.5 23 L 30 22.3"
            stroke={c.featherLight}
            strokeWidth={0.9}
            strokeLinecap="round"
          />
          {limb('M 16 22 L 12 15', c.feather, 4)}
          {lit(
            'M 9.5 10 L 10.5 3.5 L 12.5 8.5 L 15 4 L 15.5 9.5 L 17.5 7 L 16 11.5 Z',
            c.furDark,
            1,
          )}
          {lit(ell(11.5, 13, 4.6, 4), c.feather)}
          <Path d="M 8 11.8 L 0.8 13.6 L 8 15 Z" fill={c.rubber} {...o(0.8)} />
          <Ellipse cx={14.3} cy={13.4} rx={1.3} ry={0.9} fill={c.blockBlue} />
          <Ellipse cx={15.6} cy={13.8} rx={0.8} ry={0.7} fill={c.blockRed} />
          {eye(11.2, 12.2, 1)}
        </>
      );
      break;

    // ── How parents help their young ────────────────────────────────────────
    case 'bird feeding chicks':
      art = (
        <>
          <Ellipse cx={19.5} cy={32.5} rx={14.5} ry={3.2} fill={c.woodDark} {...o(1)} />
          {[
            [12, 30, 3.3],
            [20, 28, 3.6],
            [28, 30.2, 3.2],
          ].map(([x, y, r]) => (
            <G key={x}>
              {lit(ell(x!, y!, r!, r!), c.furGrey, 1)}
              <Path
                d={`M ${x! - 2.6} ${y! - 1.8} L ${x} ${y! - 8.5} L ${x! + 2.6} ${y! - 1.8} Z`}
                fill={c.chartSecond}
                {...o(0.8)}
              />
              <Path
                d={`M ${x! - 1.2} ${y! - 2.4} L ${x} ${y! - 6.3} L ${x! + 1.2} ${y! - 2.4} Z`}
                fill={c.blockRed}
              />
              <Path d={`M ${x! - 2.2} ${y! + 0.4} q 0.8 0.7 1.6 0`} fill="none" {...o(0.6)} />
            </G>
          ))}
          {lit('M 5 32.5 C 5 43 34 43.5 34 32.5 C 29 36.5 10 36.5 5 32.5 Z', c.wood)}
          <Path
            d="M 7 35 L 13 37.5 M 11 38.5 L 19 37 M 17 39.5 L 26 38 M 24 37 L 31 35.5 M 28 38.5 L 32 36"
            stroke={c.woodDark}
            strokeWidth={0.9}
            strokeLinecap="round"
          />
          {limb('M 37 22 L 36 32', c.woodDark, 1)}
          {lit('M 42 18 L 47.5 25 L 45 27 L 40 21 Z', c.furDark)}
          <G transform="rotate(25 37 17)">{lit(ell(37, 17, 7.5, 5.5), c.furDark)}</G>
          <Path d="M 31 15 C 30 21 34 24 39 23 C 35 21 32.5 18 33 14 Z" fill={c.orange} />
          {lit(ell(29.5, 11, 4.8, 4.5), c.furDark)}
          <Path d="M 26 12 L 21.5 16.5 L 27 14.8 Z" fill={c.chartSecond} {...o(0.7)} />
          {limb('M 22.5 15.5 C 19 16.5 22 18.5 20 20.5', c.skin, 1.1)}
          <Circle cx={28.2} cy={10} r={1.7} fill={c.snow} />
          {eye(28.2, 10, 1)}
        </>
      );
      break;
    case 'calf drinking milk':
      art = (
        <>
          {ground(24, 43.5, 21)}
          {[9, 14, 34, 39].map((x) => (
            <G key={x}>
              <Rect x={x} y={23} width={3.6} height={19} rx={1.2} fill={c.snow} {...o(0.9)} />
              <Rect x={x} y={40.5} width={3.6} height={2} fill={c.rubber} />
            </G>
          ))}
          {limb('M 43 13 C 46 16 46.5 22 45.5 27', c.snow, 1)}
          <Ellipse cx={45.5} cy={28} rx={1.3} ry={1.8} fill={c.rubber} />
          {lit(
            'M 8 15 C 8 11 11 10 15 10 H 38 C 42 10 44 13 43.5 18 C 43 23 41 26 37 26 H 12 C 9 26 8 22 8 15 Z',
            c.snow,
          )}
          <Path
            d="M 18 10.4 C 20 13.5 25 14 27 10.4 Z M 30 16 C 33 13 38 14 38 18 C 38 22 33 22.5 30 20 Z M 12 18.5 C 14 17 16.5 19 15.5 22.5 C 14.5 25 11.5 24.5 11 22.5 Z"
            fill={c.rubber}
            fillOpacity={0.85}
          />
          <Path
            d="M 33.5 27 V 29.8 M 35.5 27.5 V 30.3 M 37.5 27 V 29.8"
            {...o(1.3)}
            stroke={c.skin}
          />
          {lit(ell(35.5, 26.5, 3.4, 2.2), c.skin, 1)}
          <Path d="M 7 10.5 Q 6 7.5 3.5 7.5 M 11 10.5 Q 11.5 7.5 13.5 7" fill="none" {...o(1.4)} />
          {lit('M 11 11 C 6 10 3 12 2.5 16 L 2 21.5 C 2 25.5 8 25.8 9 22.5 L 11.5 16 Z', c.snow)}
          <Path
            d="M 4 11.5 C 6 13 7 16 6.5 19 C 5 18 3.5 15 4 11.5 Z"
            fill={c.rubber}
            fillOpacity={0.85}
          />
          {lit(ell(5, 22.5, 3.2, 2.3), c.skin, 1)}
          {eye(8, 15, 0.9)}
          {/* The calf, facing the cow's udder. */}
          {[15.5, 19, 24, 27.5].map((x) => (
            <G key={x}>
              <Rect x={x} y={32} width={2.4} height={10.5} rx={0.9} fill={c.fur} {...o(0.8)} />
              <Rect x={x} y={41} width={2.4} height={1.5} fill={c.rubber} />
            </G>
          ))}
          <Path d="M 14.5 29.5 Q 12 31 12.5 35" fill="none" {...o(1)} />
          {lit(
            'M 14 30.5 C 14 28 16 27.5 19 27.5 H 26.5 C 29 27.5 30.5 29 30 31.5 C 29.5 33.5 28 34.5 26 34.5 H 17 C 15 34.5 14 33 14 30.5 Z',
            c.fur,
          )}
          <G transform="rotate(-38 31.5 31)">{lit(ell(31.5, 31, 4.2, 2.6), c.fur)}</G>
          {lit(ell(28.8, 29, 1, 1.8), c.fur, 0.8)}
          <Circle cx={34.2} cy={28.6} r={0.7} fill={c.rubber} />
          {eye(30.9, 30.2, 0.7)}
        </>
      );
      break;
    case 'joey in pouch':
      art = (
        <>
          {ground(26, 43.5, 20)}
          {lit('M 29 36 C 36 38 42 40 47 43 C 42 44 35 43.5 28 41.5 Z', c.fur)}
          {lit(
            'M 17 14 C 20 12 26 14 29 20 C 33 27 34 36 30 41 C 27 43.5 20 43.5 18 40 C 15 35 14 27 15 20 Z',
            c.fur,
          )}
          {lit(ell(27, 34.5, 6, 6.5), c.fur)}
          {lit('M 27 40 H 14 C 11.5 40 11 43.5 13.5 43.5 H 29 Z', c.fur, 1)}
          {lit(ell(19.5, 25.3, 3.4, 3), c.furLight)}
          <G transform="rotate(20 21.5 21.5)">{lit(ell(21.5, 21.5, 1.1, 2.4), c.furLight, 0.8)}</G>
          <Circle cx={16.4} cy={25.9} r={0.7} fill={c.rubber} />
          {eye(18.9, 24.7, 0.7)}
          {lit(
            'M 15 27.5 C 15.5 35 18 38.5 22 38.5 C 26 38.5 27.5 34 26.5 27.5 C 23 28.8 18.5 28.8 15 27.5 Z',
            c.furLight,
          )}
          {limb('M 17 19 L 12.5 23.5 L 12 26', c.fur, 1.8)}
          {limb('M 15.5 11 L 18.5 16', c.fur, 4.5)}
          <G transform="rotate(15 17 4.5)">{lit(ell(17, 4.5, 1.6, 3.6), c.fur, 1)}</G>
          <G transform="rotate(30 14.5 5)">{lit(ell(14.5, 5, 1.6, 3.6), c.fur, 1)}</G>
          {lit(
            'M 18 10 C 18 7 15 5.5 12 6.5 C 9 7.5 6.5 9.5 5 11 C 4 12.5 5 13.5 6.5 13.5 C 10 14 16 14.5 18 12.5 Z',
            c.fur,
          )}
          <Circle cx={5.3} cy={11.8} r={0.9} fill={c.rubber} />
          {eye(12.5, 9.2, 0.9)}
        </>
      );
      break;
    case 'lioness carrying cub':
      art = (
        <>
          {ground(26, 43.5, 19)}
          {limb('M 41.5 20 C 46 24 45.5 32 44 35.5', c.furLight, 1.5)}
          <Ellipse cx={43.8} cy={36.5} rx={1.4} ry={2} fill={c.furDark} />
          {[16, 21, 33, 38].map((x) => (
            <G key={x}>
              {lit(
                `M ${x} 24 H ${x + 3.6} V 41.5 H ${x + 4.6} C ${x + 5} 43 ${x} 43 ${x} 42 Z`,
                c.furLight,
                1,
              )}
            </G>
          ))}
          {lit(
            'M 13 20 C 13 16 16 14.5 21 15 H 35 C 40 15 43 18 42 23 C 41 27.5 38 28.5 35 28.5 H 18 C 15 28.5 13 25 13 20 Z',
            c.furLight,
          )}
          {lit('M 11 12 C 14 12 18 13 21 16 L 18 25 C 15 23 12.5 20 11 17 Z', c.furLight)}
          {lit(ell(13, 9.8, 1.8, 1.9), c.furLight, 1)}
          {lit(
            'M 16 13 C 15 9 11 8 8 9 C 5 10 4 12.5 3.5 15 C 3 17 3.5 19 5.5 19.5 C 9 20 14 19 16 17 Z',
            c.furLight,
          )}
          <Ellipse cx={6} cy={17} rx={2.6} ry={2} fill={c.fat} />
          <Path d="M 3.2 14.5 L 5 14.4 L 4.2 15.8 Z" fill={c.rock5} {...o(0.5)} />
          {eye(9.5, 12.6, 0.9)}
          {/* The cub, held by the scruff and hanging from her mouth. */}
          <G transform="translate(5.5 19.5) scale(0.78) translate(-6 -21)">
            {limb('M 6 34 L 5.5 39.5', c.rock1, 1.5)}
            {limb('M 10 33.5 L 11 38.5', c.rock1, 1.5)}
            {limb('M 11.5 31 Q 14 34 13 37', c.rock1, 1)}
            {lit(
              'M 5 21.5 C 9 20.5 12.5 23.5 12.5 28.5 C 12.5 33 10 35.5 7.5 35.5 C 5 35.5 4 33 4.2 30 Z',
              c.rock1,
            )}
            {[
              [8, 27],
              [10, 30.5],
              [7.3, 31.5],
            ].map(([x, y]) => (
              <Circle key={x} cx={x} cy={y} r={0.7} fill={c.rock4} />
            ))}
            {lit(ell(7.2, 21, 1.1, 1.3), c.rock1, 0.8)}
            {lit(ell(4.5, 24.5, 3.5, 3.2), c.rock1)}
            <Circle cx={1.6} cy={25.3} r={0.6} fill={c.rock5} />
            {eye(3.6, 24, 0.6)}
          </G>
        </>
      );
      break;
    case 'hen on nest':
      art = (
        <>
          {lit('M 36 21 L 40 7.5 L 44 11 L 46 22 Z', c.furDark)}
          {lit(
            'M 10.5 30 C 10 23 14 17.5 20 17.5 C 28 17.5 35 20 41 14 C 44 19 44.5 27 40.5 31 C 34 36 16 36 10.5 30 Z',
            c.fur,
          )}
          <Path
            d="M 19 24 C 25 20 34 21 38.5 25 C 33 30 24 31 19 24 Z"
            fill={c.furDark}
            fillOpacity={0.55}
            {...o(0.8)}
          />
          <Path d="M 24 25.5 C 28 25 32 26 35 27.5" fill="none" {...o(0.6)} />
          {lit(
            'M 9.5 10.5 C 9 8 11 7 12 8.5 C 12.5 6.5 15 6.5 15 8.5 C 16 7.5 18 8.5 17 10.5 Z',
            c.blockRed,
            0.8,
          )}
          {lit('M 9 16 C 10 22 13 25.5 18.5 25 L 20.5 18 C 17 13.5 12 12.5 9 16 Z', c.fur)}
          {lit(ell(13, 14.5, 5.2, 4.8), c.fur)}
          {lit(ell(8.8, 19, 1.3, 2), c.blockRed, 0.8)}
          <Path d="M 8.2 13.2 L 4 15 L 8.2 16.4 Z" fill={c.chartSecond} {...o(0.8)} />
          {eye(11.8, 13.4, 1)}
          {lit(ell(11, 33, 2.6, 3.2), c.featherLight, 1)}
          {lit(ell(38.5, 33.5, 2.4, 3), c.featherLight, 1)}
          {lit('M 3 33 C 3 43 45 43 45 33 C 37 37 11 37 3 33 Z', c.wood)}
          <Path
            d="M 5 35 L 12 38 M 9 39 L 18 37.5 M 15 40.5 L 25 38.5 M 22 38 L 31 40 M 29 38.5 L 38 39.5 M 35 37.5 L 43 35"
            stroke={c.woodDark}
            strokeWidth={0.9}
            strokeLinecap="round"
          />
        </>
      );
      break;
    case 'penguin chick on feet':
      art = (
        <>
          {snow(42)}
          {lit(
            'M 24 3.5 C 18 3.5 16 8 16.5 12 C 14.5 17 12.5 26 14 34 C 15 39 19 42 25 42 C 31 42 35 38 35 31 C 35 22 32 14 30 9 C 29 5.5 27 3.5 24 3.5 Z',
            c.rubber,
          )}
          <Path
            d="M 17 13 C 15 20 14.5 29 16 35 C 18 37.5 22 38 26 37 C 28 29 25.5 19 21 13 Z"
            fill={c.snow}
          />
          <Path
            d="M 22 8.5 C 25 10 25.5 13.5 23.5 16 C 21 14.5 20.5 11 22 8.5 Z"
            fill={c.chartSecond}
          />
          {lit('M 29 17 C 33 21 34.5 28 32.5 33.5 C 30.5 29.5 28.5 24 27.5 19 Z', c.rubber, 1)}
          <Path d="M 17 8 L 9.5 11 L 17 10.5 Z" fill={c.rubber} {...o(0.8)} />
          <Path d="M 16.5 10 L 12 10.8" stroke={c.orange} strokeWidth={0.8} />
          <Circle cx={19.6} cy={7.4} r={0.8} fill={c.shine} />
          {lit(ell(19, 41.5, 6.5, 1.6), c.rubber, 1)}
          {lit(ell(18, 36, 5.5, 5), c.furGrey)}
          {lit(ell(14.5, 30.5, 4.2, 3.8), c.rubber)}
          <Path d="M 11 30.5 C 11 28.5 14 28 16 29.5 C 16 32 13.5 33.5 11.5 32.5 Z" fill={c.snow} />
          <Path d="M 10.6 30.4 L 8 31.2 L 10.6 31.8 Z" fill={c.rubber} {...o(0.6)} />
          <Circle cx={13} cy={30.3} r={0.7} fill={c.rubber} />
        </>
      );
      break;
    // ── Which habitat? ──────────────────────────────────────────────────────
    case 'whale':
      art = (
        <>
          <Path
            d="M 14 15 C 13 11 10 8.5 7 7.5 M 14 15 C 14 10.5 15 7.5 17 5.5 M 14 15 C 15.5 11.5 19 9.5 22 9.5"
            fill="none"
            stroke={c.water}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          {lit(
            'M 42.5 20.5 C 40 16.5 37.5 14.5 34.5 15 C 36.5 18 39.5 20.5 42.5 22 Z',
            c.furGrey,
            1,
          )}
          {lit('M 42.5 22 C 43.5 18 45.5 14.5 47.8 13.5 C 47 17 45.5 20.5 42.5 22 Z', c.furGrey, 1)}
          {lit(
            'M 2.5 30 C 2.5 22 9 17 18 17 C 26 17 31 21 35 23 C 38 24.5 40 23 41.5 19.5 L 43.5 21 C 43 26 40 31 34 33 C 26 36 12 36 6 34 C 3.5 33 2.5 32 2.5 30 Z',
            c.furGrey,
          )}
          <Path
            d="M 3.5 31 C 10 34.5 22 35.2 31 33 C 22 32 12 32 3.5 31 Z"
            fill={c.snow}
            fillOpacity={0.85}
          />
          <Path d="M 8 32.4 L 20 33.6 M 9 33.6 L 19 34.5" fill="none" {...o(0.5)} />
          <Path d="M 2.8 29.5 C 7 30 11 29 14.5 27.5" fill="none" {...o(0.8)} />
          {lit('M 16 31.5 C 17 35 20 38.5 26 40.5 C 23 37 21.5 34 21.5 31.5 Z', c.furGrey, 1)}
          {eye(9, 27, 0.9)}
          <Rect x={0} y={24} width={48} height={24} fill={c.water} fillOpacity={0.35} />
          <Path
            d="M 0 24 Q 6 22 12 24 T 24 24 T 36 24 T 48 24"
            fill="none"
            stroke={c.waterDeep}
            strokeWidth={1.2}
          />
        </>
      );
      break;
    case 'octopus': {
      const arms = [
        'M 16 24 C 10 26 6 30 4 35 C 3 38.5 5 40.5 7.5 38.5',
        'M 18 26.5 C 14 30.5 11 35 12 40.5 C 12.5 43.5 15 43.5 15.5 41.5',
        'M 21.5 27.5 C 19.5 32.5 19.5 38 21 42.5 C 22 44.5 24 44 23.5 42',
        'M 26.5 27.5 C 28.5 32.5 28.5 38 27 42.5 C 26 44.5 24 44 24.5 42',
        'M 30 26.5 C 34 30.5 37 35 36 40.5 C 35.5 43.5 33 43.5 32.5 41.5',
        'M 32 24 C 38 26 42 30 44 35 C 45 38.5 43 40.5 40.5 38.5',
      ];
      art = (
        <>
          {ground(24, 44, 19)}
          {limb('M 24 27 C 24 32 23 36 24.5 40', c.copper, 2.6)}
          {arms.map((d) => (
            <G key={d}>{limb(d, c.copper, 2.8)}</G>
          ))}
          {[
            [6.2, 33.5],
            [9, 30],
            [13.6, 34.5],
            [13.2, 39],
            [34.4, 34.5],
            [34.8, 39],
            [41.8, 33.5],
            [39, 30],
          ].map(([x, y]) => (
            <Circle key={`${x}${y}`} cx={x} cy={y} r={0.75} fill={c.rock6} />
          ))}
          {lit(
            'M 24 3.5 C 32 3.5 36 9.5 35 16.5 C 34.5 21.5 31 25 28 26.5 H 20 C 17 25 13.5 21.5 13 16.5 C 12 9.5 16 3.5 24 3.5 Z',
            c.copper,
          )}
          {[
            [20, 9],
            [27.5, 7.5],
            [30.5, 13],
            [18, 15],
            [24, 13],
          ].map(([x, y]) => (
            <Circle key={`${x}${y}`} cx={x} cy={y} r={0.9} fill={c.copperDark} fillOpacity={0.6} />
          ))}
          <Circle cx={19.5} cy={21} r={2.4} fill={c.fat} {...o(0.7)} />
          <Circle cx={28.5} cy={21} r={2.4} fill={c.fat} {...o(0.7)} />
          <Rect x={18} y={20.4} width={3} height={1.2} rx={0.6} fill={c.rubber} />
          <Rect x={27} y={20.4} width={3} height={1.2} rx={0.6} fill={c.rubber} />
        </>
      );
      break;
    }
    case 'monkey':
      art = (
        <>
          {limb('M 0 6 C 16 4 32 7.5 48 5', c.bark, 3.4)}
          <Path d={ell(40, 3.5, 3, 1.5)} fill={c.life} {...o(0.7)} />
          <Path d={ell(8, 3, 3, 1.4)} fill={c.life} {...o(0.7)} />
          {limb('M 27.5 33 C 36 36 41 31 39.5 24.5 C 38.5 20 34 20.5 34.5 24', c.fur, 1.8)}
          {limb('M 22.5 23 L 26 7', c.fur, 2.8)}
          {lit(ell(26.3, 6.5, 2.2, 1.8), c.skin, 1)}
          {limb('M 21 35 L 17 41 L 14 41', c.fur, 2.8)}
          {limb('M 27 35.5 L 30 41.5 L 33 41.5', c.fur, 2.8)}
          <G transform="rotate(-8 24 29)">{lit(ell(24, 29, 7, 8.5), c.fur)}</G>
          <Path d={ell(23, 31, 3.8, 5)} fill={c.furLight} fillOpacity={0.8} />
          {limb('M 19 25 L 13.5 30.5 L 13.5 34', c.fur, 2.6)}
          {lit(ell(13.2, 18.5, 2.2, 2.6), c.skin, 1)}
          {lit(ell(25.8, 18.5, 2.2, 2.6), c.skin, 1)}
          {lit(ell(19.5, 17.5, 6.3, 6), c.furDark)}
          {lit(
            'M 15.5 17 C 15.5 14 18.5 13.8 19.5 15.5 C 20.5 13.8 23.5 14 23.5 17 C 24 20.5 22 23 19.5 23 C 17 23 15 20.5 15.5 17 Z',
            c.skin,
            0.9,
          )}
          {eye(17.7, 17.2, 0.9)}
          {eye(21.3, 17.2, 0.9)}
          <Path d="M 18.8 19.8 H 20.2 M 18 21.4 Q 19.5 22.3 21 21.4" fill="none" {...o(0.6)} />
        </>
      );
      break;
    case 'parrot':
      art = (
        <>
          <Path d="M 3 31 L 45 33" stroke={c.woodDark} strokeWidth={3.2} strokeLinecap="round" />
          {lit('M 25 30 L 33 47 L 28.5 47.5 L 21.5 32 Z', c.blockRed, 1)}
          <Path d="M 26.5 33.5 L 32.5 46.8 L 30.5 47.2 Z" fill={c.blockBlue} />
          {lit(
            'M 17 11.5 C 23 11 29 17 30 25 C 31 30 28 34 23 34 C 18 34 15 29 15 23 C 15 18 15 14 17 11.5 Z',
            c.blockRed,
          )}
          {lit(
            'M 21 17 C 27 17 31.5 23 31.5 30 C 31 34 28 37 25.5 38.5 C 23 32 20 25 21 17 Z',
            c.blockBlue,
          )}
          <Path
            d="M 21 17 C 25 17 28.5 19.5 30 23.5 C 26 24 22.5 22 21 17 Z"
            fill={c.chartSecond}
            {...o(0.8)}
          />
          <Path d="M 22.5 26 L 29 29 M 23.5 30 L 28.5 33" fill="none" {...o(0.6)} />
          <Path
            d="M 19.5 33.5 L 18.5 31.5 M 22.5 34 L 23.5 32"
            stroke={c.furGrey}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
          {lit(ell(15.5, 11, 6, 5.5), c.blockRed)}
          <Path d={ell(12.8, 11.6, 3.1, 2.7)} fill={c.snow} />
          <Circle cx={13.2} cy={10.8} r={1.4} fill={c.chartSecond} />
          {eye(13.2, 10.8, 0.8)}
          {lit(
            'M 10 8.5 C 5 8 3 11 3.5 15 C 4 17 5 18 6 17.5 C 5.5 15 6.5 13 10.2 13.5 Z',
            c.featherLight,
            1,
          )}
          <Path
            d="M 10.2 13.5 C 7.5 14 7 16 8 17.5 C 9.5 17.5 11 16 11 14 Z"
            fill={c.rubber}
            {...o(0.8)}
          />
        </>
      );
      break;
    case 'hanging vines': {
      const vines: Curve[] = [
        [14, 10, 11, 20, 17, 30, 14, 40],
        [21, 9.5, 24, 17, 18, 24, 21, 31],
        [28, 9.5, 25, 20, 31, 32, 28, 44],
        [35, 9.5, 38, 16, 32, 22, 35, 28],
        [42, 9, 39, 18, 45, 28, 42, 38],
      ];
      art = (
        <>
          {lit('M 2 48 L 3.5 6 H 10 L 11.5 48 Z', c.bark)}
          <Path
            d="M 5.5 14 V 24 M 8 30 V 42"
            stroke={c.woodDark}
            strokeWidth={0.8}
            strokeLinecap="round"
          />
          {limb('M 8 10 C 20 8.5 34 10.5 47 8', c.bark, 3)}
          {vines.map((v) => (
            <G key={v[0]}>
              <Path d={curve(v)} fill="none" {...o(2.4)} />
              <Path
                d={curve(v)}
                fill="none"
                stroke={c.lifeDeep}
                strokeWidth={1.2}
                strokeLinecap="round"
              />
              {[0.3, 0.5, 0.7, 0.9, 1].map((t, i) => {
                const p = bez(v, t);
                const turn = i % 2 ? 55 : -55;
                return (
                  <G key={t} transform={`translate(${p.x} ${p.y}) rotate(${p.a + turn})`}>
                    <Path
                      d="M 0 0 C 1.5 -1.9 4 -1.9 5.2 0 C 4 1.9 1.5 1.9 0 0 Z"
                      fill={c.life}
                      {...o(0.6)}
                    />
                  </G>
                );
              })}
            </G>
          ))}
          {lit(ell(10, 4.5, 10, 5), c.lifeDeep)}
          {lit(ell(27, 3.5, 11, 4.5), c.lifeDeep)}
          {lit(ell(43, 5, 7, 4), c.lifeDeep)}
        </>
      );
      break;
    }
    case 'polar bear':
      art = (
        <>
          {snow(41)}
          {[12, 18, 30, 35].map((x) => (
            <G key={x}>
              {lit(
                `M ${x} 28 H ${x + 5.2} V 40.5 C ${x + 5.2} 41.5 ${x + 4.2} 42 ${x + 2.6} 42 C ${x + 1} 42 ${x} 41.5 ${x} 40.5 Z`,
                c.snow,
                1,
              )}
            </G>
          ))}
          {lit(
            'M 12 25 C 12 18 17 14.5 23 14.5 C 28 14 32 15.5 37 17 C 42.5 19 43.5 26 41.5 31 C 40.5 33 38.5 34 35.5 34 H 16 C 13 34 12 30 12 25 Z',
            c.snow,
          )}
          {lit(ell(40.8, 22, 1.8, 1.8), c.snow, 1)}
          {lit(
            'M 16 18 C 12 17 8 18 5 20.5 C 3 22 1 23.5 1.5 25.5 C 2 27 5 27.5 8 27 C 11 26.5 14 25 17 25 Z',
            c.snow,
          )}
          {lit(ell(9.8, 19.2, 1.7, 1.7), c.snow, 1)}
          <Circle cx={2} cy={24.4} r={1.1} fill={c.rubber} />
          {eye(6.6, 21.8, 0.8)}
          {flake(38, 7)}
          {flake(29, 4, 1.8)}
          {flake(44, 12, 1.8)}
        </>
      );
      break;
    case 'walrus':
      art = (
        <>
          {snow(40)}
          {lit('M 42 36 L 47.5 32 L 46.5 40 Z', c.rock4, 1)}
          {lit(
            'M 13 20 C 20 16 32 18 38 24 C 42 28 44 33 45.5 38 C 41 40 36 40.5 30 40.5 H 16 C 11 40.5 9 36 10 31 Z',
            c.rock4,
          )}
          <Path
            d="M 22 22.5 C 24 25 24 29 22.5 31 M 30 24.5 C 32 27 32 31 30.5 33.5"
            fill="none"
            stroke={c.rock5}
            strokeWidth={0.9}
            strokeLinecap="round"
          />
          {lit(ell(12.5, 21, 7, 6.5), c.rock4)}
          {lit('M 6.3 28 L 5.8 38.5 L 7.9 38.3 L 8.8 28.6 Z', c.snow, 0.9)}
          {lit('M 10.4 28.6 L 11 38.8 L 13 38.5 L 12.6 28.4 Z', c.snow, 0.9)}
          {lit(ell(7, 26.5, 3.2, 2.8), c.rock6, 1)}
          {lit(ell(11.2, 26.8, 3.2, 2.8), c.rock6, 1)}
          {[
            [6, 26],
            [8, 27.5],
            [10.5, 26.2],
            [12.3, 27.6],
            [6.5, 28],
          ].map(([x, y]) => (
            <Circle key={`${x}${y}`} cx={x} cy={y} r={0.4} fill={c.rock5} />
          ))}
          {lit('M 19 33 C 17 37 14.5 39.5 11 40.5 L 21 40.5 C 22 38 22 35.5 21 33 Z', c.rock4, 1)}
          {eye(11.5, 18.5, 0.8)}
        </>
      );
      break;

    // ── Fossils ─────────────────────────────────────────────────────────────
    case 'clam fossil': {
      const ribs = [25, 45, 65, 90, 115, 135, 155]
        .map((deg) => {
          const r = (deg * Math.PI) / 180;
          return `M 24 32 L ${24 + 10.3 * Math.cos(r)} ${23 - 9.6 * Math.sin(r)}`;
        })
        .join(' ');
      art = (
        <>
          {slab(c.rock3)}
          {lit(
            'M 20 33.5 C 14 32 11.5 26.5 12.5 21 C 13.5 15.5 18.5 12 24 12 C 29.5 12 34.5 15.5 35.5 21 C 36.5 26.5 34 32 28 33.5 C 26 34 22 34 20 33.5 Z',
            c.rock4,
          )}
          <Path d={ribs} fill="none" stroke={c.rock5} strokeWidth={0.9} strokeLinecap="round" />
          <Path
            d="M 15.5 28 C 14 21 19 16 24 16 C 29 16 34 21 32.5 28 M 18.5 30 C 17.5 25 20.5 20.5 24 20.5 C 27.5 20.5 30.5 25 29.5 30"
            fill="none"
            stroke={c.rock5}
            strokeOpacity={0.7}
            strokeWidth={0.8}
          />
          {lit('M 20.5 33.2 C 21 36.3 27 36.3 27.5 33.2 Z', c.rock4, 1)}
        </>
      );
      break;
    }
    case 'coral fossil':
      art = (
        <>
          {slab(c.rock3)}
          {limb(
            'M 24 37 L 24 28 M 24 31.5 L 17.5 25 L 15.5 17 M 17.5 25 L 11.5 22.5 M 24 28 L 28.5 20 L 27.5 12.5 M 28.5 20 L 34.5 15 M 24 32.5 L 31 28.5 L 37 23',
            c.rock6,
            3.2,
          )}
          {[
            [24, 34.5],
            [24, 29.5],
            [20.5, 28],
            [16.5, 21],
            [13.5, 23.5],
            [26.5, 23.5],
            [28, 16],
            [31.5, 17.5],
            [28, 30.5],
            [34.5, 25.5],
          ].map(([x, y]) => (
            <Circle key={`${x}${y}`} cx={x} cy={y} r={0.65} fill={c.rock5} />
          ))}
        </>
      );
      break;
    case 'shark tooth fossil': {
      // Small teeth along both cutting edges.
      const edge = (x0: number, y0: number, x1: number, y1: number, out: number) =>
        Array.from({ length: 13 }, (_, i) => {
          const t = (i + 0.5) / 13;
          const x = x0 + (x1 - x0) * t;
          const y = y0 + (y1 - y0) * t;
          return `${i ? 'L' : 'M'} ${x + (i % 2 ? out : 0)} ${y}`;
        }).join(' ');
      art = (
        <>
          {slab(c.rock3)}
          {lit(
            'M 24 6 C 25.5 13 29.5 22 35.5 30 C 28 28.5 20 28.5 12.5 30 C 18.5 22 22.5 13 24 6 Z',
            c.furGrey,
          )}
          <Path d={edge(24, 6, 12.5, 30, -0.7)} fill="none" {...o(0.5)} />
          <Path d={edge(24, 6, 35.5, 30, 0.7)} fill="none" {...o(0.5)} />
          <Path
            d="M 22.8 11 C 21.5 17 19 22 16.8 26"
            fill="none"
            stroke={c.shine}
            strokeOpacity={0.6}
            strokeWidth={1.2}
            strokeLinecap="round"
          />
          <Path
            d="M 12.5 30 C 20 28.5 28 28.5 35.5 30 L 34 32 C 27 30.5 21 30.5 14 32 Z"
            fill={c.rock5}
            {...o(0.8)}
          />
          {lit(
            'M 14 32 C 21 30.5 27 30.5 34 32 C 37 33 37.5 36 35 37 C 32 37.5 29 36 27 37.5 C 25 39 23 39 21 37.5 C 19 36 16 37.5 13 37 C 10.5 36 11 33 14 32 Z',
            c.rock4,
            1,
          )}
        </>
      );
      break;
    }
    case 'fern fossil': {
      const rachis: Curve = [13, 39, 17, 29, 25, 18, 35, 9];
      art = (
        <>
          {slab(c.rock2)}
          <Path
            d={curve(rachis)}
            fill="none"
            stroke={c.rubber}
            strokeOpacity={0.75}
            strokeWidth={1.3}
            strokeLinecap="round"
          />
          {Array.from({ length: 11 }, (_, i) => {
            const t = 0.06 + i * 0.085;
            const p = bez(rachis, t);
            const len = 8.5 * (1 - t * 0.75);
            return [-62, 62].map((turn) => (
              <G key={`${i}${turn}`} transform={`translate(${p.x} ${p.y}) rotate(${p.a + turn})`}>
                <Path
                  d={`M 0 0 C ${len * 0.3} -1.4 ${len * 0.8} -1.1 ${len} 0 C ${len * 0.8} 1.1 ${len * 0.3} 1.4 0 0 Z`}
                  fill={c.rubber}
                  fillOpacity={0.6}
                />
              </G>
            ));
          })}
        </>
      );
      break;
    }
    case 'dragonfly fossil':
      art = (
        <>
          {slab(c.rock1)}
          {(
            [
              [15, 14, -6],
              [33, 14, 6],
              [15.5, 19.5, 10],
              [32.5, 19.5, -10],
            ] as const
          ).map(([x, y, a]) => (
            <G key={`${x}${y}`} transform={`rotate(${a} ${x} ${y})`}>
              <Path
                d={ell(x, y, 8.5, 2.4)}
                fill={c.rock5}
                fillOpacity={0.35}
                stroke={c.rock5}
                strokeWidth={0.8}
              />
              <Path
                d={`M ${x - 7.5} ${y} H ${x + 7.5} M ${x - 5} ${y - 2.2} L ${x - 3} ${y} M ${x} ${y - 2.5} L ${x + 2} ${y} M ${x + 5} ${y + 2.1} L ${x + 3} ${y}`}
                stroke={c.rock5}
                strokeOpacity={0.7}
                strokeWidth={0.5}
              />
            </G>
          ))}
          <Path
            d="M 24 19 L 24 39"
            stroke={c.rock5}
            strokeOpacity={0.95}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
          <Path
            d="M 23 23 H 25 M 23 27 H 25 M 23 31 H 25 M 23 35 H 25"
            stroke={c.rock1}
            strokeWidth={0.6}
          />
          <Path d={ell(24, 16, 2.2, 3.4)} fill={c.rock5} fillOpacity={0.8} />
          <Circle cx={24} cy={11} r={2.4} fill={c.rock5} fillOpacity={0.8} />
        </>
      );
      break;
    case 'woolly mammoth':
      art = (
        <>
          {snow(42)}
          {[13, 19, 30, 35.5].map((x) => (
            <G key={x}>
              {lit(
                `M ${x} 28 H ${x + 5} V 41.5 C ${x + 5} 42.5 ${x} 42.5 ${x} 41.5 Z`,
                c.furDark,
                1,
              )}
            </G>
          ))}
          {limb('M 41.5 22 C 43.5 24 44 27 43.5 29', c.fur, 1.2)}
          {lit(
            'M 12 20 C 13 11 20 7 27 9 C 34 11 40 15 42 22 C 43.5 28 41 33 36 33 H 16 C 13 33 11.5 27 12 20 Z',
            c.fur,
          )}
          <Path
            d="M 14 31.5 L 15 36 L 17 32.5 L 19 36.5 L 21 33 L 23 36 L 25 33 L 27 36.5 L 29 33 L 31 36 L 33 33 L 35 36 L 37 32.5 L 39 35 L 40 31"
            fill={c.fur}
            {...o(0.8)}
          />
          <Path
            d="M 22 13 q 1 3 0 6 M 27 12 q 1 3 0 6 M 32 14 q 1 3 0 6 M 37 17 q 1 3 0 6 M 25 21 q 1 3 0 6 M 30 21 q 1 3 0 6 M 35 24 q 1 3 0 5"
            fill="none"
            stroke={c.furDark}
            strokeWidth={0.9}
            strokeLinecap="round"
          />
          {lit(
            'M 18 12.5 C 16 5.5 8 5 5.5 10 C 4 14 5 19 7 23 L 14.5 25 C 17.5 21 19 16.5 18 12.5 Z',
            c.fur,
          )}
          {limb('M 7 20 C 4 25 3 31 4.5 36 C 5 38.5 7 39 7.8 37.5', c.fur, 3.2)}
          {limb('M 10 23.5 C 7 30 11.5 36.5 18.5 34.5 C 20.5 33.5 21.5 31.5 21 29.5', c.fat, 1.8)}
          <Path d={ell(14.5, 15.5, 2, 2.8)} fill={c.furDark} {...o(0.8)} />
          {eye(10, 14.5, 0.8)}
        </>
      );
      break;
    case 'musk ox':
      art = (
        <>
          {snow(42)}
          {[13, 18, 31, 36].map((x) => (
            <G key={x}>
              <Rect x={x} y={33} width={3} height={9} rx={1} fill={c.furLight} {...o(0.9)} />
              <Rect x={x} y={40.5} width={3} height={1.8} fill={c.rubber} />
            </G>
          ))}
          {lit(
            'M 10 22 C 10 14 16 10 24 10 C 33 10 40 13 42 20 C 43.5 26 43 32 42 37 L 40 34.5 L 38 37.5 L 36 34.5 L 33.5 37.5 L 31 35 L 28 37.5 L 26 35 L 23 37.5 L 21 35 L 18.5 37.5 L 16 35 L 13.5 37.5 L 11.5 35 C 10 31 10 26 10 22 Z',
            c.furDark,
          )}
          <Path
            d="M 24 12 C 28 10.5 33 11.5 36 14 C 32 16.5 27 16 24 12 Z"
            fill={c.furLight}
            fillOpacity={0.85}
          />
          <Path
            d="M 20 18 q -1 6 0 14 M 25 18 q -1 7 0 15 M 30 18 q -1 7 0 15 M 35 18 q -1 7 0 14 M 39.5 21 q -1 6 0 12"
            fill="none"
            stroke={c.fur}
            strokeWidth={1}
            strokeLinecap="round"
          />
          {lit(
            'M 15.5 16 C 11 15 6 17 4.5 21 C 3.5 24 3.5 28 5 30 C 7 31.5 10 31 12 29 C 14.5 26 16.5 21 15.5 16 Z',
            c.furDark,
          )}
          <Path d={ell(5.6, 28.4, 2.3, 2)} fill={c.furLight} />
          <Circle cx={4.2} cy={28.3} r={0.6} fill={c.rubber} />
          {limb('M 16 15.5 C 11 13 7.5 15 7.8 19 C 8 22.5 10 24 12 22.5', c.fat, 2.2)}
          {eye(8.4, 22.8, 0.7)}
        </>
      );
      break;

    // ── How a group helps ───────────────────────────────────────────────────
    case 'wolf pack':
      art = (
        <>
          <FloorShadow cx={25} cy={44} rx={20} ry={2} />
          {(
            [
              [19, 2],
              [0, 13],
              [17, 24],
            ] as const
          ).map(([x, y]) => (
            <G key={`${x}${y}`} transform={`translate(${x} ${y}) scale(0.58)`}>
              {wolf(0.58)}
            </G>
          ))}
        </>
      );
      break;
    case 'ants carrying leaf':
      art = (
        <>
          <Path d="M 0 40 H 48" stroke={c.soil} strokeWidth={2} strokeLinecap="round" />
          {[13, 35].map((x) => (
            <Path
              key={x}
              d={`M ${x - 8} 32 L ${x - 8.5} 20`}
              fill="none"
              stroke={c.copperDark}
              strokeWidth={1.1}
              strokeLinecap="round"
            />
          ))}
          {lit('M 1 19 C 8 7 30 2 47 12 C 40 24 20 29 1 19 Z', c.life)}
          <Path
            d="M 3 18.5 C 16 16 32 14 45 12.5 M 12 17 L 16 10.5 M 20 16 L 25 8 M 28 15 L 33 8.5 M 36 14 L 40 10 M 14 17 L 19 22.5 M 23 16 L 28 23 M 31 15 L 36 20.5"
            fill="none"
            stroke={c.lifeDeep}
            strokeWidth={0.8}
            strokeLinecap="round"
          />
          {[13, 35].map((x) => ant(x, 34))}
        </>
      );
      break;
    case 'zebra herd':
      art = (
        <>
          <FloorShadow cx={25} cy={44.5} rx={20} ry={2} />
          {(
            [
              [20, 0],
              [1, 9],
              [14, 19],
            ] as const
          ).map(([x, y]) => (
            <G key={`${x}${y}`} transform={`translate(${x} ${y}) scale(0.6)`}>
              {zebra(0.6)}
            </G>
          ))}
        </>
      );
      break;
    case 'school of fish':
      art = (
        <>
          <Rect x={1} y={1} width={46} height={46} rx={6} fill={c.water} fillOpacity={0.22} />
          {(
            [
              [3, 7],
              [17, 3],
              [31, 7],
              [9, 16],
              [23, 13],
              [35, 18],
              [2, 25],
              [16, 24],
              [29, 27],
              [10, 34],
              [24, 36],
            ] as const
          ).map(([x, y]) => smallFish(x, y))}
        </>
      );
      break;
    case 'meerkat lookout':
      art = (
        <>
          {lit('M 2 45 C 9 37 32 35 46 45 Z', c.rock1)}
          {limb('M 27 38 C 32 39.5 36 41.5 41 42', c.furLight, 2)}
          <Path d="M 39 41.8 L 41.5 42" stroke={c.rubber} strokeWidth={2} strokeLinecap="round" />
          {lit(
            'M 20 15.5 C 25 14.5 29.5 20 30.5 28 C 31.5 35 29 40.5 24 40.5 C 19 40.5 16.5 35 17 28 C 17.5 22 17.5 17 20 15.5 Z',
            c.furLight,
          )}
          <Path
            d="M 26 21 q 2 0.5 3 2 M 26.5 25 q 2 0.5 3.2 2 M 27 29 q 2 0.5 3 2"
            fill="none"
            stroke={c.furDark}
            strokeWidth={0.9}
            strokeLinecap="round"
          />
          <Path d="M 19 22 C 18.5 30 19.5 37 22.5 39 C 22 32 22 26 21.5 22 Z" fill={c.fat} />
          {lit(ell(25, 38, 5, 3.4), c.furLight, 1)}
          {lit(ell(19.5, 41, 3.6, 1.3), c.furLight, 1)}
          {limb('M 20 21 L 16.5 24.5 L 16.8 27', c.furLight, 1.8)}
          {lit(
            'M 22 12 C 22 8 19 6.5 16 7 C 13.5 7.5 11 9 9.5 11 C 8.5 12.5 9.5 13.5 11 13.5 C 14 14.5 18 16 21 15.5 Z',
            c.furLight,
          )}
          <Circle cx={19.6} cy={9.6} r={1.1} fill={c.furDark} {...o(0.6)} />
          <Path d={ell(15.2, 10, 1.9, 1.4)} fill={c.rubber} />
          <Circle cx={14.8} cy={9.6} r={0.5} fill={c.shine} />
          <Circle cx={9.6} cy={11.8} r={0.9} fill={c.rubber} />
        </>
      );
      break;
    case 'penguin huddle':
      art = (
        <>
          {snow(41)}
          {flake(4, 5, 1.8)}
          {flake(44, 4, 1.8)}
          {[9, 19, 29, 39].map((x) => penguin(x, 6))}
          {[14, 24, 34].map((x) => penguin(x, 17))}
        </>
      );
      break;
    case 'bee ball': {
      // The cluster: one bee in the middle, six around it, twelve around those, heads in.
      const bees: [number, number, number][] = [[24, 25, 0]];
      for (let i = 0; i < 6; i++) {
        const a = (i * 60 + 30) * (Math.PI / 180);
        bees.push([
          24 + 6.2 * Math.cos(a),
          25 + 6.2 * Math.sin(a),
          (a * 180) / Math.PI + 150 + i * 23,
        ]);
      }
      for (let i = 0; i < 12; i++) {
        const a = i * 30 * (Math.PI / 180);
        bees.push([
          24 + 11.5 * Math.cos(a),
          25 + 11.5 * Math.sin(a),
          (a * 180) / Math.PI + 120 + ((i * 37) % 120),
        ]);
      }
      art = (
        <>
          {flake(5, 5)}
          {flake(43, 6)}
          {flake(5, 43, 1.8)}
          {flake(43, 42, 1.8)}
          <Circle cx={24} cy={25} r={14} fill={c.furDark} {...o(1)} />
          {bees.map(([x, y, a]) => bee(x, y, a))}
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
        <ClipPath id={ids.zebra}>
          <Path d={ZEBRA_BODY} />
          <Path d={ZEBRA_HEAD} />
        </ClipPath>
      </Defs>
      {art}
    </G>
  );
}
