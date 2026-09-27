/**
 * Round-3 card icons (group A), 48 × 48 like every card icon, drawn in their materials with the
 * helpers in reps/paint.tsx. The names are listed in data/modules/layouts/icons/r3a.ts.
 *
 * Everyday materials and objects: glass is clear with a bright streak, metal has a sheen, wood
 * has grain, rubber and plastic are matte or softly glossy. Light comes from the top left.
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

import { usePalette } from '@/theme';

import { FloorShadow, Glass, Metal, Sheen, TopLight, url, usePaintIds } from '../../reps/paint';
import type { IconProps } from './types';

/** An ellipse as a path, so it can be filled and then lit with the same `d`. */
const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;

/** Points scattered over a box, the same every time (grains, specks). */
const scatter = (n: number, x: number, y: number, w: number, h: number, seed = 1) =>
  Array.from({ length: n }, (_, i) => {
    const t = (i * 7919 + seed * 104729) % 997;
    return [x + ((t * 13) % 97) * (w / 97), y + ((t * 31) % 89) * (h / 89)] as const;
  });

/** A nail lying on a slant, head at the lower left; `rust` adds rust patches and flakes. */
const NAIL_SHANK = 'M 8.5 21.8 H 38 L 45 24 L 38 26.2 H 8.5 Z';

/** A spoon standing up, bowl at the top (turned when drawn). */
const SPOON_BOWL = ell(24, 12.5, 7.5, 10);
const SPOON_HANDLE =
  'M 22.4 21.5 C 22.6 27 22 34 21.4 40 C 21.1 43.8 26.9 43.8 26.6 40 C 26 34 25.4 27 25.6 21.5 Z';

export function R3AIcon({ icon, ink }: IconProps): ReactNode {
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
  /** A shape in its color with a gradient laid over it, then outlined. */
  const over = (d: string, fill: string, light: string, w = 1.1) => (
    <>
      <Path d={d} fill={fill} />
      <Path d={d} fill={url(light)} {...o(w)} />
    </>
  );
  /** A glare streak on glass or a mirror. */
  const glare = (d: string, w = 1.6) => (
    <Path
      d={d}
      fill="none"
      stroke={c.glassShine}
      strokeWidth={w}
      strokeLinecap="round"
      strokeOpacity={0.95}
    />
  );
  const ground = (cx = 24, cy = 43, rx = 17) => <FloorShadow cx={cx} cy={cy} rx={rx} ry={2.5} />;
  /** Thin wavy lines of wood grain. */
  const grain = (d: string, w = 0.7) => (
    <Path
      d={d}
      fill="none"
      stroke={c.woodDark}
      strokeWidth={w}
      strokeOpacity={0.7}
      strokeLinecap="round"
    />
  );

  const nail = (rust: boolean) => (
    <>
      <G transform="rotate(-35 24 24) translate(1.2 2.4)">
        <Path d={NAIL_SHANK} fill={c.shadow} />
      </G>
      <G transform="rotate(-35 24 24)">
        {over(NAIL_SHANK, rust ? c.metalDark : c.silver, ids.sheenV)}
        <Path
          d="M 11 22.2 V 25.8 M 12.8 22.2 V 25.8 M 14.6 22.2 V 25.8"
          stroke={c.metalDark}
          strokeWidth={0.6}
        />
        {over('M 4.5 16.5 H 9 V 31.5 H 4.5 Z', rust ? c.metalDark : c.silver, ids.sheen, 1.1)}
        {rust ? (
          <>
            <Path
              d="M 16 22 C 19 21.6 22 22.8 21 24.6 C 20 26.4 17 26.4 15.6 25.4 C 14.6 24.4 14.8 22.4 16 22 Z M 26 22.2 C 30 21.5 33 23 32 25 C 31 26.4 27 26.3 25.6 25.2 C 24.8 24.2 25 22.6 26 22.2 Z M 36 23 C 38 22.4 40 23.6 38.6 24.9 C 37.4 25.8 35.6 25.2 35.4 24.3 Z M 5 20 C 7 19 8.6 21 8.3 23.5 C 8 25 5.4 25 5 23.5 Z M 5.2 27 C 7 26.4 8.6 27.6 8.2 29.4 C 7.6 30.6 5.6 30.4 5.2 29.4 Z"
              fill={c.copperDark}
            />
            {scatter(14, 9.5, 22.3, 29, 3.6, 3).map(([x, y], i) => (
              <Circle key={i} cx={x} cy={y} r={0.55} fill={c.orange} />
            ))}
          </>
        ) : (
          <Path d="M 10 23 H 37" stroke={c.shine} strokeOpacity={0.7 * c.sheen} strokeWidth={0.7} />
        )}
      </G>
      {rust
        ? scatter(6, 20, 38, 16, 5, 5).map(([x, y], i) => (
            <Circle key={i} cx={x} cy={y} r={0.7} fill={i % 2 ? c.copperDark : c.orange} />
          ))
        : null}
    </>
  );

  const spoon = (metal: boolean) => (
    <>
      <G transform="rotate(-40 24 24) translate(1.2 2.4)">
        <Path d={SPOON_BOWL} fill={c.shadow} />
        <Path d={SPOON_HANDLE} fill={c.shadow} />
      </G>
      <G transform="rotate(-40 24 24)">
        {metal ? (
          <>
            {over(SPOON_HANDLE, c.silver, ids.sheen)}
            <Path d={SPOON_BOWL} fill={url(ids.metal)} {...o(1.2)} />
            <Path d={ell(24.4, 13.4, 5.4, 7.6)} fill={c.silverDark} fillOpacity={0.45} />
            <Path d={ell(22.6, 10.5, 1.6, 4.2)} fill={c.shine} fillOpacity={0.85} />
            <Path
              d="M 23.4 25 C 23.2 31 22.8 36 22.6 40"
              stroke={c.shine}
              strokeWidth={0.8}
              strokeOpacity={0.8}
              fill="none"
            />
          </>
        ) : (
          <>
            {lit(SPOON_HANDLE, c.blockBlue, 1.1)}
            {lit(SPOON_BOWL, c.blockBlue, 1.2)}
            <Path d={ell(24.4, 13.4, 5.4, 7.6)} fill={c.shade} fillOpacity={0.14} />
            <Path d={ell(22.4, 9.8, 1.4, 3)} fill={c.shine} fillOpacity={0.35 * c.sheen} />
          </>
        )}
      </G>
      {metal ? (
        <Path
          d="M 10 5 L 11.2 9.3 L 15.5 10.5 L 11.2 11.7 L 10 16 L 8.8 11.7 L 4.5 10.5 L 8.8 9.3 Z"
          fill={c.shine}
          {...o(0.8)}
        />
      ) : null}
    </>
  );

  let art: ReactNode;
  switch (icon) {
    // ── Shared everyday things ────────────────────────────────────────────────
    case 'steel nail':
      art = nail(false);
      break;
    case 'rusty nail':
      art = nail(true);
      break;
    case 'rubber band': {
      const d =
        'M 7 27 C 6 19 16 13 27 13.5 C 37 14 44 18.5 41 25 C 38.5 30 33 28.5 28 31.5 C 22 35 17 37.5 12 35.5 C 8.5 34 7.3 30.5 7 27 Z';
      art = (
        <>
          <Path d={d} fill="none" stroke={c.shadow} strokeWidth={4} transform="translate(1 2)" />
          <Path d={d} fill="none" stroke={ink} strokeWidth={4.2} strokeLinejoin="round" />
          <Path d={d} fill="none" stroke={c.orange} strokeWidth={2.4} strokeLinejoin="round" />
          <Path
            d="M 10.5 22 C 13 16 21 13.4 29 13.8"
            fill="none"
            stroke={c.shine}
            strokeOpacity={0.35 * c.sheen}
            strokeWidth={1}
            strokeLinecap="round"
          />
        </>
      );
      break;
    }
    case 'plastic spoon':
      art = spoon(false);
      break;
    case 'metal spoon':
      art = spoon(true);
      break;
    case 'wooden block':
      art = (
        <>
          {ground(25, 42, 18)}
          <Polygon points="8,20 30,20 30,42 8,42" fill={c.wood} {...o(1.2)} />
          {grain(
            'M 8 25 C 14 23.8 19 27 30 25.2 M 8 31 C 12 29.8 16 30.4 17 32.5 C 18 35 22 31.5 30 31.5 M 8 37.5 C 15 36 22 39 30 37.2',
          )}
          <Ellipse
            cx={19.5}
            cy={33}
            rx={2.2}
            ry={1.3}
            fill="none"
            stroke={c.woodDark}
            strokeWidth={0.8}
          />
          <Polygon points="8,20 30,20 30,42 8,42" fill={url(ids.light)} />
          <Polygon points="8,20 16,13 38,13 30,20" fill={c.wood} {...o(1.2)} />
          <Polygon points="8,20 16,13 38,13 30,20" fill={c.shine} fillOpacity={0.3 * c.sheen} />
          {grain('M 12 17 C 18 16.4 24 17.2 34 16 M 14.5 15 C 20 14.4 27 15.2 36 14.3', 0.6)}
          <Polygon points="30,20 38,13 38,35 30,42" fill={c.wood} {...o(1.2)} />
          <Polygon points="30,20 38,13 38,35 30,42" fill={c.shade} fillOpacity={0.2} />
          {grain(
            'M 31.5 30 C 33 26.5 35.5 25.5 37 26.5 M 31.5 35 C 33.5 30 36 29 37 30.5 M 31.5 25 C 32.5 22 34.5 20 36.5 20.5',
            0.6,
          )}
        </>
      );
      break;
    case 'soda can': {
      const body = 'M 15.5 8 L 14 11.5 V 40 Q 14 43 24 43 Q 34 43 34 40 V 11.5 L 32.5 8 Z';
      art = (
        <>
          {ground(24, 43, 13)}
          <Path d={body} fill={c.blockRed} />
          <Path d="M 15.5 8 L 14 11.5 H 34 L 32.5 8 Z" fill={c.silver} />
          <Path
            d="M 14 39 V 40 Q 14 43 24 43 Q 34 43 34 40 V 39 Q 24 41.5 14 39 Z"
            fill={c.silver}
          />
          <Path d="M 14 24 C 20 19 27 29 34 22 V 27 C 27 34 20 24 14 29 Z" fill={c.snow} />
          <Path d={body} fill={url(ids.sheen)} {...o(1.2)} />
          <Ellipse cx={24} cy={8} rx={8.5} ry={2.2} fill={c.silver} {...o(1)} />
          <Ellipse cx={24} cy={8.2} rx={6.8} ry={1.4} fill={c.silverDark} fillOpacity={0.4} />
          <Path
            d="M 23 8.4 L 27.5 7.2"
            stroke={c.metalDark}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        </>
      );
      break;
    }
    case 'copper coin':
      art = (
        <>
          {ground(25, 42, 15)}
          <Ellipse cx={24} cy={26.5} rx={16} ry={13} fill={c.copperDark} {...o(1.1)} />
          <Ellipse cx={24} cy={24} rx={16} ry={13} fill={url(ids.copper)} {...o(1.2)} />
          <Ellipse
            cx={24}
            cy={24}
            rx={13}
            ry={10.4}
            fill="none"
            stroke={c.copperDark}
            strokeOpacity={0.6}
            strokeWidth={0.9}
          />
          <Path
            d="M 20 32 C 20.5 29 19 27 19.5 23.5 C 20 19 24 16.5 27.5 18.5 C 30 20 29.6 23 29 25 L 30.2 27.2 L 28.6 27.6 C 28.8 29.5 27.8 30.4 26 30.2 L 26.2 32 Z"
            fill={c.copperDark}
            fillOpacity={0.4}
          />
          <Path
            d="M 12 20 C 14 15 18.5 12.5 23 12.3"
            fill="none"
            stroke={c.shine}
            strokeOpacity={0.7 * c.sheen}
            strokeWidth={1.3}
            strokeLinecap="round"
          />
        </>
      );
      break;
    case 'window':
      art = (
        <>
          <Rect x={6} y={4} width={36} height={35} rx={1.5} fill={c.snow} {...o(1.2)} />
          <Rect x={6} y={4} width={36} height={35} rx={1.5} fill={url(ids.light)} />
          {[
            [9.5, 7.5],
            [25.5, 7.5],
            [9.5, 23],
            [25.5, 23],
          ].map(([x, y], i) => (
            <G key={i}>
              <Rect x={x} y={y} width={13} height={12.5} fill={c.waterTop} fillOpacity={0.55} />
              <Rect
                x={x}
                y={y}
                width={13}
                height={12.5}
                fill={url(ids.glass)}
                fillOpacity={0.55}
                {...o(0.9)}
              />
            </G>
          ))}
          <Circle cx={33} cy={13} r={3.2} fill={c.sunDisk} />
          <Path
            d="M 12 29 C 12 27 14.5 26.4 15.6 27.6 C 16.6 25.8 20 26.4 20 28.6 C 21.5 28.6 21.5 31 20 31 H 12.6 C 11.2 31 11 29.2 12 29 Z"
            fill={c.snow}
            {...o(0.6)}
          />
          {glare('M 11.5 17 L 17 9.5')}
          {glare('M 14 18.5 L 19 11.5', 0.9)}
          {glare('M 27.5 33 L 33 25.5')}
          {glare('M 30 34.5 L 35 27.5', 0.9)}
          <Rect x={3.5} y={38.5} width={41} height={4} rx={1} fill={c.snow} {...o(1.1)} />
          <Rect x={3.5} y={41} width={41} height={1.5} fill={c.shade} fillOpacity={0.15} />
        </>
      );
      break;
    case 'clear plastic cup': {
      const cup = 'M 10.5 9 L 15 42 H 33 L 37.5 9 Z';
      art = (
        <>
          {ground(24, 43, 13)}
          <Path d={cup} fill={url(ids.glass)} fillOpacity={0.8} />
          <Path d="M 11 13 H 37 M 11.4 15.5 H 36.6" stroke={c.glassEdge} strokeWidth={0.8} />
          <Path
            d="M 17 42 L 16.4 36 M 20.5 42 L 20.2 36 M 24 42 V 36 M 27.5 42 L 27.8 36 M 31 42 L 31.6 36"
            stroke={c.glassEdge}
            strokeWidth={0.8}
          />
          <Ellipse
            cx={24}
            cy={41.6}
            rx={9}
            ry={1.2}
            fill="none"
            stroke={c.glassEdge}
            strokeWidth={0.8}
          />
          {glare('M 14.5 18 L 17.8 38', 2)}
          {glare('M 33.6 18 L 31.8 32', 0.9)}
          <Path d={cup} fill="none" {...o(1.1)} />
          <Ellipse cx={24} cy={9} rx={13.5} ry={2.6} fill={c.glass} fillOpacity={0.5} {...o(1.1)} />
        </>
      );
      break;
    }
    case 'drinking glass': {
      const glass = 'M 12.5 6 L 14.8 41 C 15 43 16 44 18 44 H 30 C 32 44 33 43 33.2 41 L 35.5 6 Z';
      art = (
        <>
          {ground(24, 44, 13)}
          <Path d={glass} fill={url(ids.glass)} />
          <Path d="M 13.9 26 L 15.1 38.5 H 32.9 L 34.1 26 Z" fill={c.water} fillOpacity={0.55} />
          <Ellipse cx={24} cy={26} rx={10.1} ry={1.6} fill={c.waterTop} {...o(0.6)} />
          <Path
            d="M 15.1 38.5 H 32.9 L 33.2 41 C 33 43 32 44 30 44 H 18 C 16 44 15 43 14.8 41 Z"
            fill={c.glassEdge}
            fillOpacity={0.45}
          />
          {glare('M 16 10 L 17.8 36', 2.2)}
          {glare('M 19 12 L 19.8 22', 0.9)}
          <Path d={glass} fill="none" {...o(1.2)} />
          <Ellipse cx={24} cy={6} rx={11.5} ry={2.2} fill={c.glass} fillOpacity={0.4} {...o(1.1)} />
        </>
      );
      break;
    }

    // ── What makes shade (D05) ────────────────────────────────────────────────
    case 'open umbrella': {
      const canopy =
        'M 4.5 23 C 4.5 11.5 13.5 5 24 5 C 34.5 5 43.5 11.5 43.5 23 C 41.5 20.8 37.5 20.8 35.5 23 C 33 20.6 27 20.6 24 23 C 21 20.6 15 20.6 12.5 23 C 10.5 20.8 6.5 20.8 4.5 23 Z';
      art = (
        <>
          <Ellipse cx={24} cy={42.5} rx={19} ry={4} fill={c.shade} fillOpacity={0.3} />
          <Path d="M 24 22 V 39 C 24 43 18.5 43 18.5 39.5" fill="none" {...o(3.4)} />
          <Path
            d="M 24 22 V 39 C 24 43 18.5 43 18.5 39.5"
            fill="none"
            stroke={c.woodDark}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          {lit(canopy, c.blockRed)}
          <Path
            d="M 24 5 C 16 9 13 15 12.5 23 M 24 5 C 32 9 35 15 35.5 23 M 24 5 V 23"
            fill="none"
            stroke={c.shade}
            strokeOpacity={0.35}
            strokeWidth={1}
          />
          <Path d="M 24 5 V 2" {...o(1.6)} />
        </>
      );
      break;
    }
    case 'tent':
      art = (
        <>
          {ground(24, 42, 20)}
          <Path d="M 12 29 L 3 42 M 36 29 L 45 42" {...o(0.7)} />
          {lit('M 5 41 L 24 8 L 43 41 Z', c.blockGreen)}
          <Path d="M 24 8 L 38 41 H 43 Z" fill={c.shade} fillOpacity={0.18} />
          <Path d="M 24 15 L 16.5 41 H 31.5 Z" fill={c.rubber} fillOpacity={0.85} {...o(1)} />
          <Path d="M 24 15 L 18 41 H 22 Z" fill={c.blockGreen} {...o(0.9)} />
          <Path d="M 24 8 V 4" {...o(1.6)} />
        </>
      );
      break;
    case 'sun hat':
      art = (
        <>
          {ground(24, 43, 18)}
          {lit(ell(24, 31, 21.5, 7.5), c.fat)}
          <Path
            d={ell(24, 31, 17, 5.5)}
            fill="none"
            stroke={c.woodDark}
            strokeOpacity={0.55}
            strokeWidth={0.8}
            strokeDasharray="1.6 1.4"
          />
          {lit('M 13 31 C 13 18 17 13 24 13 C 31 13 35 18 35 31 C 28 33.4 20 33.4 13 31 Z', c.fat)}
          <Path
            d="M 17 20 C 21 18.6 27 18.6 31 20 M 15.4 24 C 20 22.6 28 22.6 32.6 24"
            fill="none"
            stroke={c.woodDark}
            strokeOpacity={0.5}
            strokeWidth={0.8}
            strokeDasharray="1.6 1.4"
          />
          <Path
            d="M 13.4 26.5 C 20 28.6 28 28.6 34.6 26.5 L 35 31 C 28 33.4 20 33.4 13 31 Z"
            fill={c.blockRed}
            {...o(0.9)}
          />
        </>
      );
      break;
    case 'house roof':
      art = (
        <>
          {ground(24, 43, 19)}
          <Rect x={31} y={8} width={4.5} height={10} fill={c.copper} {...o(1)} />
          <Rect x={10.5} y={24} width={27} height={19} fill={c.fat} {...o(1.2)} />
          <Rect x={10.5} y={24} width={27} height={19} fill={url(ids.light)} />
          <Rect x={10.5} y={24} width={27} height={3} fill={c.shade} fillOpacity={0.25} />
          <Rect x={20} y={32} width={8} height={11} fill={c.woodDark} {...o(1)} />
          <Rect x={30} y={29} width={5} height={5} fill={c.waterTop} {...o(0.9)} />
          <Rect x={13} y={29} width={5} height={5} fill={c.waterTop} {...o(0.9)} />
          {lit('M 4 26 L 24 7 L 44 26 Z', c.blockRed)}
          <Path
            d="M 17.7 13 H 30.3 M 12.4 18 H 35.6 M 7.2 23 H 40.8"
            stroke={c.shade}
            strokeOpacity={0.3}
            strokeWidth={0.9}
          />
        </>
      );
      break;
    case 'glass door':
      art = (
        <>
          <Line x1={3} y1={44} x2={45} y2={44} {...o(1)} />
          <Rect x={11} y={3} width={26} height={41} rx={1} fill={c.metal} />
          <Rect x={11} y={3} width={26} height={41} rx={1} fill={url(ids.sheen)} {...o(1.2)} />
          <Rect x={14} y={6} width={20} height={35} fill={c.waterTop} fillOpacity={0.5} />
          <Rect
            x={14}
            y={6}
            width={20}
            height={35}
            fill={url(ids.glass)}
            fillOpacity={0.55}
            {...o(0.9)}
          />
          {glare('M 16.5 20 L 24 9', 2)}
          {glare('M 19 22 L 25.5 12.5', 0.9)}
          {glare('M 22 38 L 31 25', 1.4)}
          <Rect x={29.5} y={18} width={2.4} height={12} rx={1.2} fill={c.silver} {...o(0.8)} />
        </>
      );
      break;

    // ── What light does (D17) ─────────────────────────────────────────────────
    case 'wax paper':
      art = (
        <>
          <Circle cx={37} cy={22} r={7.5} fill={c.blockRed} {...o(1.1)} />
          <Circle cx={37} cy={22} r={7.5} fill={url(ids.round)} />
          <Path
            d="M 6 10 L 38 5.5 L 41 31 L 34 41 L 10 42 Z"
            fill={c.snow}
            fillOpacity={0.78}
            {...o(1)}
          />
          <Path
            d="M 12 15 L 20 19 L 16 27 M 26 12 L 30 22 L 24 30 L 28 37 M 14 33 L 20 38"
            fill="none"
            stroke={c.glassEdge}
            strokeWidth={0.6}
            strokeOpacity={0.8}
          />
          <Path d="M 41 31 L 34 41 L 33.5 32.5 Z" fill={c.snow} {...o(0.9)} />
          <Path d="M 41 31 L 34 41 L 33.5 32.5 Z" fill={c.shade} fillOpacity={0.12} />
          {glare('M 9 20 L 17 9', 1.4)}
        </>
      );
      break;
    case 'tissue paper': {
      const sheet =
        'M 7 11 C 13 8 18 12 24 9.5 C 30 7 35 11 41 8.5 C 40 18 42 28 40 38.5 C 34 41 29 37 23 40 C 17 43 12 39 8 41 C 9 31 6 21 7 11 Z';
      art = (
        <>
          <Circle cx={10} cy={25} r={7.5} fill={c.blockBlue} {...o(1.1)} />
          <Circle cx={10} cy={25} r={7.5} fill={url(ids.round)} />
          <Path d={sheet} fill={c.snow} fillOpacity={0.72} />
          <Path d={sheet} fill={c.blockRed} fillOpacity={0.3} {...o(1)} />
          <Path
            d="M 17 11 C 18 20 16 30 17.5 40 M 29 9 C 27 18 30 28 28.5 38.5"
            fill="none"
            stroke={c.shade}
            strokeOpacity={0.18}
            strokeWidth={1.4}
          />
          <Path
            d="M 18.5 11 C 19.5 20 17.5 30 19 40 M 30.5 9 C 28.5 18 31.5 28 30 38.5"
            fill="none"
            stroke={c.shine}
            strokeOpacity={0.5 * c.sheen}
            strokeWidth={1}
          />
        </>
      );
      break;
    }
    case 'closed book':
      art = (
        <>
          {ground(25, 44, 15)}
          <Path d="M 33 6 L 38 8.5 V 43.5 L 33 42 Z" fill={c.snow} {...o(1)} />
          <Path
            d="M 34.2 10 V 42.3 M 35.4 10.6 V 42.7 M 36.6 11.2 V 43"
            stroke={c.glassEdge}
            strokeWidth={0.5}
          />
          <Rect x={10} y={5} width={24} height={37.5} rx={1.5} fill={c.blockGreen} {...o(1.2)} />
          <Rect x={10} y={5} width={4.5} height={37.5} fill={c.shade} fillOpacity={0.22} />
          <Path
            d="M 14.5 5 V 42.5"
            stroke={c.shine}
            strokeOpacity={0.35 * c.sheen}
            strokeWidth={0.8}
          />
          <Rect x={10} y={5} width={24} height={37.5} rx={1.5} fill={url(ids.light)} />
          <Rect x={17.5} y={11} width={12.5} height={7} rx={0.8} fill={c.sunDisk} {...o(0.7)} />
          <Path d="M 17.5 34 H 30 M 17.5 36.5 H 30" stroke={c.sunDisk} strokeWidth={0.9} />
        </>
      );
      break;
    case 'hand mirror':
      art = (
        <G transform="rotate(-18 24 24)">
          {lit('M 21.6 29 H 26.4 L 26.8 44 C 26.8 46 21.2 46 21.2 44 Z', c.purple, 1.1)}
          {lit(ell(24, 16.5, 13, 14), c.purple)}
          <Path d={ell(24, 16.5, 10.2, 11.2)} fill={url(ids.metal)} {...o(0.9)} />
          <Path d={ell(24, 19, 5.6, 6.2)} fill={c.skin} {...o(0.8)} />
          <Path
            d="M 18.4 18.5 C 17.6 12 22 10.8 24 10.8 C 27 10.8 30.6 12.4 29.6 18.5 C 28 15 24 14 20.5 15.2 Z"
            fill={c.furDark}
            {...o(0.8)}
          />
          <Circle cx={22} cy={19} r={0.8} fill={c.rubber} />
          <Circle cx={26} cy={19} r={0.8} fill={c.rubber} />
          <Path d="M 21.8 21.8 Q 24 23.8 26.2 21.8" fill="none" {...o(0.8)} />
          <Path d="M 15.6 17 L 19.6 9.6" stroke={c.shine} strokeWidth={2} strokeLinecap="round" />
          <Path
            d="M 28.8 25 L 31.4 20.6"
            stroke={c.shine}
            strokeWidth={1.2}
            strokeLinecap="round"
          />
        </G>
      );
      break;

    // ── Does it bend? (D18) ───────────────────────────────────────────────────
    case 'piece of string': {
      const d = 'M 5 37 C 12 26 18 43 24 33 C 29 24 17 16 25 11.5 C 32 8 36 21 43.5 13';
      art = (
        <>
          <Path d={d} fill="none" stroke={c.shadow} strokeWidth={3} transform="translate(1 2)" />
          <Path d={d} fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
          <Path d={d} fill="none" stroke={c.fat} strokeWidth={2.4} strokeLinecap="round" />
          <Path
            d={d}
            fill="none"
            stroke={c.woodDark}
            strokeWidth={2.4}
            strokeDasharray="0.8 1.4"
            strokeOpacity={0.6}
          />
          <Path
            d="M 5 37 L 2.8 38.2 M 5 37 L 3.6 39.6 M 43.5 13 L 45.6 12.6 M 43.5 13 L 45 11"
            {...o(0.7)}
          />
        </>
      );
      break;
    }
    case 'folded cloth':
      art = (
        <>
          <Path d="M 12 11 H 36 V 40 H 12 Z" fill={c.blockBlue} {...o(1.1)} />
          <Path d="M 12 11 H 36 V 40 H 12 Z" fill={c.shade} fillOpacity={0.3} />
          <Path
            d={Array.from({ length: 12 }, (_, i) => `M ${13 + i * 2} 40 V 43.5`).join(' ')}
            stroke={c.blockBlue}
            strokeWidth={1}
            strokeLinecap="round"
          />
          <Path d="M 3 10 H 45" {...o(3.4)} />
          <Path d="M 3 10 H 45" stroke={c.silver} strokeWidth={1.8} strokeLinecap="round" />
          {lit(
            'M 11.5 11 C 11.5 7.5 13 6.5 15 6.5 H 33 C 35 6.5 36.5 7.5 36.5 11 V 32.5 C 32 34.5 28 32 24 34 C 20 36 16 33.5 11.5 35 Z',
            c.blockBlue,
          )}
          <Path
            d="M 11.5 26 C 16 25 20 27 24 26 C 28 25 32 27 36.5 26 M 11.5 29 C 16 28 20 30 24 29 C 28 28 32 30 36.5 29"
            fill="none"
            stroke={c.snow}
            strokeWidth={1.3}
          />
          <Path
            d="M 18 12 C 17 18 19 26 18 33.5 M 29 12 C 30 18 28 26 29.5 33"
            fill="none"
            stroke={c.shade}
            strokeOpacity={0.25}
            strokeWidth={1.2}
          />
        </>
      );
      break;
    case 'craft stick': {
      const d = 'M 7.5 20.5 H 40.5 C 45 20.5 45 27.5 40.5 27.5 H 7.5 C 3 27.5 3 20.5 7.5 20.5 Z';
      art = (
        <>
          <G transform="rotate(-30 24 24) translate(1.2 2.4)">
            <Path d={d} fill={c.shadow} />
          </G>
          <G transform="rotate(-30 24 24)">
            <Path d={d} fill={c.wood} />
            {grain('M 7 23 C 16 22.2 26 23.8 41 22.8 M 6.5 25.5 C 18 26.2 28 24.8 41.5 25.8', 0.6)}
            <Path d={d} fill={url(ids.sheenV)} {...o(1.1)} />
          </G>
        </>
      );
      break;
    }
    case 'plastic ruler': {
      const ticks = Array.from({ length: 13 }, (_, i) => 6 + i * 3)
        .map((x, i) => `M ${x} 18.5 V ${i % 2 ? 21.5 : 23.5}`)
        .join(' ');
      art = (
        <>
          <G transform="rotate(-20 24 24) translate(1.2 2.4)">
            <Rect x={3} y={18} width={42} height={12} rx={1.2} fill={c.shadow} />
          </G>
          <G transform="rotate(-20 24 24)">
            <Rect
              x={3}
              y={18}
              width={42}
              height={12}
              rx={1.2}
              fill={c.blockBlue}
              fillOpacity={0.4}
              {...o(1.1)}
            />
            <Path d={ticks} stroke={ink} strokeWidth={0.8} />
            <Path
              d="M 4.5 28 H 43.5"
              stroke={c.shine}
              strokeOpacity={0.7 * c.sheen}
              strokeWidth={1.2}
              strokeLinecap="round"
            />
            <Circle cx={40} cy={26} r={1.4} fill="none" {...o(0.8)} />
          </G>
        </>
      );
      break;
    }
    case 'cardboard piece': {
      const waves = Array.from({ length: 16 }, (_, i) => {
        const x = 10 + i * 2;
        const y = 38 - i * 0.25;
        return `M ${x} ${y + 1.5} Q ${x + 1} ${y - 0.6} ${x + 2} ${y + 1.5}`;
      }).join(' ');
      art = (
        <>
          {ground(26, 42, 17)}
          <Path d="M 6 14 L 38 9 L 42 33 L 10 38 Z" fill={c.furLight} {...o(1.2)} />
          <Path d="M 6 14 L 38 9 L 42 33 L 10 38 Z" fill={url(ids.light)} />
          <Path d="M 21.5 11.6 L 25.8 35.5" stroke={c.fur} strokeWidth={0.9} strokeOpacity={0.7} />
          <Path d="M 10 38 L 42 33 V 36.5 L 10 41.5 Z" fill={c.fur} {...o(1)} />
          <Path d={waves} fill="none" stroke={c.furDark} strokeWidth={0.6} />
        </>
      );
      break;
    }
    case 'gray rock':
      art = (
        <>
          {ground(24, 41, 18)}
          {lit(
            'M 7 34 C 5 26 10 18 18 15 C 25 12 33 13 38 19 C 43 25 43 33 39 37 C 34 41 14 41 7 34 Z',
            c.rock2,
          )}
          <Path
            d="M 18 15 L 22 24 L 38 19 M 22 24 L 20 39"
            fill="none"
            stroke={c.shade}
            strokeOpacity={0.2}
            strokeWidth={0.9}
          />
          {scatter(12, 11, 20, 26, 16, 7).map(([x, y], i) => (
            <Circle key={i} cx={x} cy={y} r={0.6} fill={i % 3 ? c.rock5 : c.snow} />
          ))}
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
