/**
 * Round-3 card icons (group F), 48 × 48 like every card icon, drawn in their materials with the
 * helpers in reps/paint.tsx. The names are listed in data/modules/layouts/icons/r3f.ts.
 *
 * Weather, storms and the things people build against them. Clouds are puffy and outlined,
 * houses have a red roof and cream walls, water is blue with a wavy top; light from the top left.
 */
import type { ReactNode } from 'react';
import { Circle, Defs, G, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { usePalette } from '@/theme';

import { FloorShadow, Glass, Metal, Sheen, TopLight, url, usePaintIds } from '../../reps/paint';
import type { IconProps } from './types';

/** An ellipse as a path, so it can be filled and then lit with the same `d`. */
const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;

/** A puffy cloud around (0, 0), about 39 wide and 18 tall (flat bottom at y = 5). */
const CLOUD =
  'M -15 5 C -19.5 5 -20 -1.5 -15.5 -2.5 C -15.5 -8.5 -8.5 -10.5 -5.5 -6.5 C -3.5 -12.5 5.5 -13 7.5 -6.5 C 12 -9 17.5 -5 15.5 -0.5 C 19.5 0.5 18.5 5 14.5 5 Z';

/** A falling drop with its point up. */
const drop = (x: number, y: number, s = 1) =>
  `M ${x} ${y - 3.5 * s} Q ${x + 2.6 * s} ${y + 0.5 * s} ${x} ${y + 2 * s} Q ${x - 2.6 * s} ${y + 0.5 * s} ${x} ${y - 3.5 * s} Z`;

/** A zigzag lightning bolt from (x, y), about 9 wide and 20 tall at scale 1. */
const bolt = (x: number, y: number, s = 1) =>
  `M ${x} ${y} L ${x + 7 * s} ${y} L ${x + 3.5 * s} ${y + 8 * s} L ${x + 7.5 * s} ${y + 8 * s} L ${x - 1 * s} ${y + 20 * s} L ${x + 1.5 * s} ${y + 11 * s} L ${x - 2.5 * s} ${y + 11 * s} Z`;

/** A pillow-shaped sandbag in the box x, y, w, h. */
const bag = (x: number, y: number, w: number, h: number) =>
  `M ${x + 1} ${y + 0.6} Q ${x + w / 2} ${y - 0.9} ${x + w - 1} ${y + 0.6} Q ${x + w + 0.7} ${y + h / 2} ${x + w - 1} ${y + h - 0.4} Q ${x + w / 2} ${y + h + 0.9} ${x + 1} ${y + h - 0.4} Q ${x - 0.7} ${y + h / 2} ${x + 1} ${y + 0.6} Z`;

/** A water surface with small waves from x0 to x1 at height y, filled down to `bottom`. */
const waves = (x0: number, x1: number, y: number, bottom: number, n = 6) => {
  const step = (x1 - x0) / n;
  let d = `M ${x0} ${y}`;
  for (let i = 0; i < n; i++)
    d += ` Q ${x0 + step * (i + 0.5)} ${y + (i % 2 ? 1.4 : -1.4)} ${x0 + step * (i + 1)} ${y}`;
  return `${d} V ${bottom} H ${x0} Z`;
};

export function R3FIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  const ids = usePaintIds('round', 'light', 'sheen', 'sheenV', 'glass', 'metal', 'ball');

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
  /** A flat face in its color, a little brighter at the top, outlined. */
  const face = (d: string, fill: string, w = 1.2) => (
    <>
      <Path d={d} fill={fill} />
      <Path d={d} fill={url(ids.light)} {...o(w)} />
    </>
  );
  /** A metal part: silver with a sheen, outlined. */
  const steel = (d: string, w = 0.9, vertical = false) => (
    <>
      <Path d={d} fill={c.silver} />
      <Path d={d} fill={url(vertical ? ids.sheenV : ids.sheen)} {...o(w)} />
    </>
  );
  /** A thin stroke in a color (wind lines, rain, wires). */
  const line = (d: string, stroke: string, w = 1.3, opacity = 1) => (
    <Path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={w}
      strokeOpacity={opacity}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
  /** A cloud centered at (x, y), `s` times the base size. */
  const cloud = (x: number, y: number, s: number, fill: string) => (
    <G transform={`translate(${x} ${y}) scale(${s})`}>{lit(CLOUD, fill, 1.25 / s)}</G>
  );
  const flash = (x: number, y: number, s = 1) => (
    <Path d={bolt(x, y, s)} fill={c.bulbGlow} {...o(1)} />
  );
  /** Rain streaks falling to the lower left, from the points given. */
  const rain = (pts: [number, number][], len = 6) =>
    pts.map(([x, y], i) => (
      <G key={i}>{line(`M ${x} ${y} L ${x - len * 0.35} ${y + len}`, c.water, 1.4)}</G>
    ));
  /** Grass on the ground from x0 to x1, its top at y. */
  const grass = (y: number, x0 = 0, x1 = 48) => (
    <>
      <Rect x={x0} y={y} width={x1 - x0} height={48 - y} fill={c.life} />
      {line(`M ${x0 + 0.5} ${y} H ${x1 - 0.5}`, c.lifeDeep, 1.4)}
    </>
  );
  /** Short wind lines with a curl at the end. */
  const wind = (x: number, y: number, len: number, curl = true) =>
    line(
      curl
        ? `M ${x} ${y} H ${x + len} C ${x + len + 3.2} ${y} ${x + len + 3.2} ${y - 4} ${x + len + 0.6} ${y - 4}`
        : `M ${x} ${y} H ${x + len}`,
      ink,
      1.2,
      0.75,
    );
  /** A glass pane: blue-gray with a glare streak. */
  const pane = (x: number, y: number, w: number, h: number) => (
    <>
      <Rect x={x} y={y} width={w} height={h} fill={c.waterTop} {...o(0.9)} />
      {line(`M ${x + 1.3} ${y + h - 1.5} L ${x + w * 0.55} ${y + 1.3}`, c.glassShine, 1, 0.9)}
    </>
  );

  /**
   * The storm-sequence scene (D08): one house on the right, the child and the sky change.
   * `win`: the window open (in the forecast), shut, or shut with the child looking out.
   */
  const home = (win: 'open' | 'shut' | 'face') => (
    <>
      {face('M 26 25 H 44 V 42.5 H 26 Z', c.fat)}
      {lit('M 23.5 26 L 35 13.5 L 46.5 26 Z', c.blockRed)}
      {face('M 37.5 33 H 42 V 42.5 H 37.5 Z', c.wood, 1)}
      <Circle cx={41} cy={38} r={0.55} fill={ink} />
      {win === 'open' ? (
        <>
          <Rect x={28.5} y={29} width={6.5} height={6} fill={c.cupDark} {...o(0.9)} />
          {pane(28.5, 29, 6.5, 2.6)}
          <Path d="M 29 31.8 C 30.5 33 29.5 34.2 30.8 35 H 29 Z" fill={c.paper} {...o(0.5)} />
        </>
      ) : (
        <>
          {pane(28.5, 29, 6.5, 6)}
          {win === 'face' ? (
            <>
              {lit(ell(31.75, 33, 2.1, 2.1), c.skin, 0.7)}
              <Path
                d="M 29.7 32.7 C 29.5 30 34 30 33.8 32.7 C 33 31.6 30.5 31.6 29.7 32.7 Z"
                fill={c.furDark}
              />
              <Rect x={28.5} y={29} width={6.5} height={6} fill={c.glass} fillOpacity={0.25} />
            </>
          ) : null}
          {line('M 31.75 29 V 35 M 28.5 32 H 35', ink, 0.7)}
        </>
      )}
    </>
  );
  /** The child standing with feet at (x, 42.5); `ball` held in both arms. */
  const child = (x: number, ball = false) => (
    <G transform={`translate(${x} 42.5)`}>
      <FloorShadow cx={0} cy={0.3} rx={4.5} ry={1} />
      {face('M -2.3 -7 H -0.3 V -0.6 H -2.3 Z', c.blockBlue, 0.7)}
      {face('M 0.3 -7 H 2.3 V -0.6 H 0.3 Z', c.blockBlue, 0.7)}
      <Path d={ell(-1.4, -0.4, 1.6, 0.8)} fill={c.rubber} {...o(0.6)} />
      <Path d={ell(1.4, -0.4, 1.6, 0.8)} fill={c.rubber} {...o(0.6)} />
      {lit(
        'M -3.4 -13.2 Q -3.4 -14.6 -2 -14.6 H 2 Q 3.4 -14.6 3.4 -13.2 V -6.6 H -3.4 Z',
        c.chartSecond,
        0.8,
      )}
      {ball ? (
        <>
          {line('M -2.8 -13 L -1.5 -9.5 L 1.5 -9.8', c.chartSecond, 1.8)}
          <Circle cx={3.2} cy={-10} r={2.9} fill={c.blockGreen} {...o(0.7)} />
          <Circle cx={3.2} cy={-10} r={2.9} fill={url(ids.ball)} />
          {line('M 2.9 -13.2 L 4.4 -9.5', c.chartSecond, 1.8)}
        </>
      ) : (
        <>
          {line('M -3 -13 L -4.6 -8.2', c.chartSecond, 1.8)}
          {line('M 3 -13 L 4.6 -8.2', c.chartSecond, 1.8)}
          <Circle cx={-4.7} cy={-7.8} r={0.9} fill={c.skin} />
          <Circle cx={4.7} cy={-7.8} r={0.9} fill={c.skin} />
        </>
      )}
      {lit(ell(0, -17.6, 3.1, 3.1), c.skin, 0.8)}
      <Path
        d="M -3.2 -17.6 C -3.5 -22.4 3.5 -22.4 3.2 -17.6 C 2.4 -19.4 -1.5 -19.6 -3.2 -17.6 Z"
        fill={c.furDark}
        {...o(0.5)}
      />
      <Circle cx={-1.1} cy={-17.2} r={0.45} fill={c.rubber} />
      <Circle cx={1.1} cy={-17.2} r={0.45} fill={c.rubber} />
    </G>
  );
  const sun = (x: number, y: number, r: number) => (
    <>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <G key={i}>
            {line(
              `M ${x + (r + 1.3) * Math.cos(a)} ${y + (r + 1.3) * Math.sin(a)} L ${x + (r + 3.3) * Math.cos(a)} ${y + (r + 3.3) * Math.sin(a)}`,
              c.sunRay,
              1.2,
            )}
          </G>
        );
      })}
      <Circle cx={x} cy={y} r={r} fill={c.sunDisk} {...o(0.9)} />
      <Circle cx={x} cy={y} r={r} fill={url(ids.round)} />
    </>
  );
  /** A house front: cream walls from x0 to x1 (top y, bottom at `base`), a red roof, a window. */
  const house = (x0: number, x1: number, y: number, base: number, door = true) => {
    const w = x1 - x0;
    const peak = y - w * 0.5;
    return (
      <>
        {face(`M ${x0} ${y} H ${x1} V ${base} H ${x0} Z`, c.fat)}
        {lit(`M ${x0 - 2.5} ${y + 1} L ${x0 + w / 2} ${peak} L ${x1 + 2.5} ${y + 1} Z`, c.blockRed)}
        {pane(x0 + w * 0.14, y + (base - y) * 0.25, w * 0.3, (base - y) * 0.32)}
        {door
          ? face(
              `M ${x0 + w * 0.6} ${y + (base - y) * 0.4} H ${x0 + w * 0.84} V ${base} H ${x0 + w * 0.6} Z`,
              c.wood,
              1,
            )
          : null}
      </>
    );
  };
  const sandbags = (rows: [number, number, number][], w: number, h: number) =>
    rows.map(([x0, y, n], r) =>
      Array.from({ length: n }, (_, i) => {
        const x = x0 + i * w;
        return (
          <G key={`${r}-${i}`}>
            {lit(bag(x, y, w, h), c.sandbag, 0.9)}
            {line(
              `M ${x + w - 2.3} ${y + 1} Q ${x + w - 1.5} ${y + h / 2} ${x + w - 2.3} ${y + h - 0.8}`,
              ink,
              0.6,
              0.7,
            )}
          </G>
        );
      }),
    );

  /** A pine tree standing at (x, base), `h` tall. */
  const pine = (x: number, base: number, h: number, key?: string) => (
    <G key={key}>
      <Rect x={x - h * 0.05} y={base - h * 0.2} width={h * 0.1} height={h * 0.2} fill={c.bark} />
      {lit(
        `M ${x} ${base - h} L ${x + h * 0.3} ${base - h * 0.18} H ${x - h * 0.3} Z`,
        c.lifeDeep,
        Math.min(1, h / 14),
      )}
    </G>
  );
  /** A round bush or tree top at (x, y), radius r. */
  const bush = (x: number, y: number, r: number, key?: string) => (
    <G key={key}>{lit(ell(x, y, r, r * 0.85), c.lifeDeep, 0.9)}</G>
  );
  /** An irregular rock around (x, y), radius r. */
  const rock = (x: number, y: number, r: number, fill: string, key?: string) => {
    const pts = [0, 55, 115, 175, 235, 300].map((a, i) => {
      const k = r * [1, 0.85, 1.05, 0.9, 1, 0.8][i]!;
      return `${x + k * Math.cos((a * Math.PI) / 180)},${y + k * 0.85 * Math.sin((a * Math.PI) / 180)}`;
    });
    return <G key={key}>{lit(`M ${pts.join(' L ')} Z`, fill, 0.9)}</G>;
  };

  let art: ReactNode;
  switch (icon) {
    // ── Precipitation and other weather (D09) ─────────────────────────────────
    case 'storm cloud':
      art = (
        <>
          {rain([
            [14, 27],
            [21, 29],
            [35, 27],
            [30, 33],
            [12, 36],
            [37, 37],
          ])}
          {cloud(24, 16, 1.15, c.stormCloud)}
          {flash(22, 20, 1.15)}
        </>
      );
      break;
    case 'rain cloud':
      art = (
        <>
          {cloud(24, 15, 1.1, c.rainCloud)}
          {(
            [
              [12, 28],
              [21, 27],
              [30, 28],
              [38, 27],
              [16, 37],
              [25, 39],
              [34, 37],
            ] as const
          ).map(([x, y], i) => (
            <Path key={i} d={drop(x, y, 1.1)} fill={c.water} {...o(0.7)} />
          ))}
        </>
      );
      break;
    case 'snow cloud':
      art = (
        <>
          {cloud(24, 15, 1.1, c.rainCloud)}
          {(
            [
              [13, 28, 3],
              [24, 29, 3.4],
              [35, 27, 3],
              [18, 38.5, 3.2],
              [30, 39, 3],
              [40, 36.5, 2.4],
            ] as const
          ).map(([x, y, r], i) => {
            const d = [0, 60, 120]
              .map((a) => {
                const dx = r * Math.cos((a * Math.PI) / 180);
                const dy = r * Math.sin((a * Math.PI) / 180);
                return `M ${x - dx} ${y - dy} L ${x + dx} ${y + dy}`;
              })
              .join(' ');
            return (
              <G key={i}>
                {line(d, ink, 2.4)}
                {line(d, c.snow, 1.1)}
              </G>
            );
          })}
        </>
      );
      break;
    case 'hail cloud':
      art = (
        <>
          {cloud(24, 14, 1.1, c.stormCloud)}
          {(
            [
              [13, 27, 2.3],
              [23, 29, 2.6],
              [33, 26.5, 2.2],
              [39, 34, 2.3],
              [18, 36, 2.5],
              [29, 37.5, 2.3],
            ] as const
          ).map(([x, y, r], i) => (
            <G key={i}>
              <Circle cx={x} cy={y} r={r} fill={c.snow} {...o(0.8)} />
              <Circle cx={x} cy={y} r={r} fill={url(ids.round)} />
            </G>
          ))}
          <Path d="M 6 45 H 42" {...o(1)} />
          <Circle cx={10} cy={43.6} r={1.4} fill={c.snow} {...o(0.6)} />
          <Circle cx={35} cy={43.6} r={1.4} fill={c.snow} {...o(0.6)} />
        </>
      );
      break;
    case 'tree in wind':
      art = (
        <>
          {grass(42.5)}
          {lit(
            'M 21.5 42.5 C 22.5 34 24 28 29 22 L 31.5 23.5 C 28 29 26.5 35 27 42.5 Z',
            c.bark,
            1.1,
          )}
          {lit(
            'M 15 20 C 14 12.5 22 7 30 8 C 37 5.5 46.5 9.5 45.5 16.5 C 46.5 23 40 27 33.5 26 C 27 29 18.5 27 15 20 Z',
            c.lifeDeep,
          )}
          {line('M 22 18 C 26 15 31 15 35 17 M 30 22 C 34 21 38 20 41 17', c.life, 1.1)}
          {(
            [
              [44, 29, 30],
              [40, 34, -20],
              [46, 38, 50],
            ] as const
          ).map(([x, y, a], i) => (
            <Path
              key={i}
              d={ell(x, y, 1.8, 0.9)}
              fill={c.life}
              transform={`rotate(${a} ${x} ${y})`}
              {...o(0.5)}
            />
          ))}
          {wind(1.5, 13, 9)}
          {wind(3, 24, 8)}
          {wind(1.5, 33, 11)}
        </>
      );
      break;
    case 'fog over houses':
      art = (
        <>
          {grass(42.5)}
          {house(5, 19, 27, 42.5, false)}
          {house(25, 43, 25, 42.5)}
          <Path
            d="M 0 28 C 8 25.5 14 29.5 24 27 C 33 24.5 40 28.5 48 26.5 V 41 C 40 43 30 39.5 22 41.5 C 12 43.5 6 40 0 41.5 Z"
            fill={c.mist}
            fillOpacity={0.93}
          />
          <Path
            d="M 2 20.5 C 10 18.5 16 21.5 24 20 C 32 18.5 38 21 46 19.5 V 24.5 C 38 26 32 23.5 24 25 C 16 26.5 10 23.5 2 25.5 Z"
            fill={c.mist}
            fillOpacity={0.7}
          />
          {line('M 4 33.5 C 12 31 20 35 30 32.5 M 18 38 C 26 36 34 38.5 44 36', ink, 0.8, 0.3)}
        </>
      );
      break;

    // ── Designs against floods, wind and lightning (D36, D47) ─────────────────
    case 'sandbag wall':
      art = (
        <>
          <Path d={waves(0, 17, 30.5, 44, 3)} fill={c.water} />
          {line('M 0 44 H 48', ink, 1.1)}
          {sandbags(
            [
              [7, 37, 4],
              [11.5, 31, 3],
              [16, 25, 2],
            ],
            9,
            6,
          )}
          {line('M 2 34 C 4 33 6 35 8 34', c.waterTop, 1)}
        </>
      );
      break;
    case 'house on stilts':
      art = (
        <>
          {[11, 18.8, 26.6, 34.4].map((x) => (
            <G key={x}>{face(`M ${x} 27 H ${x + 2.6} V 46 H ${x} Z`, c.wood, 0.8)}</G>
          ))}
          <Path d={waves(0, 48, 35, 48, 8)} fill={c.water} fillOpacity={0.88} />
          {line(
            'M 0 35 Q 3 33.6 6 35 T 12 35 T 18 35 T 24 35 T 30 35 T 36 35 T 42 35 T 48 35',
            c.waterDeep,
            1,
          )}
          {face('M 8 25.5 H 40 V 28 H 8 Z', c.woodDark, 0.9)}
          {face('M 10 15 H 38 V 25.5 H 10 Z', c.fat)}
          {lit('M 6.5 16 L 24 4.5 L 41.5 16 Z', c.blockRed)}
          {pane(13.5, 18, 6, 5)}
          {face('M 29 17.5 H 34 V 25.5 H 29 Z', c.wood, 1)}
        </>
      );
      break;
    case 'levee':
      art = (
        <>
          <Path d={waves(0, 18, 31, 44, 3)} fill={c.water} />
          {grass(40, 30, 48)}
          {house(37, 45, 33, 40, false)}
          {lit('M 3 44.5 L 16 27.5 H 26 L 40 44.5 Z', c.life, 1.1)}
          {line('M 16.5 27.5 H 25.5', c.lifeDeep, 1.6)}
          {line(
            'M 20 33 L 21 31 M 26 36 L 27 34 M 31 39 L 32 37 M 12 40 L 13 38 M 17 37 L 18 35',
            c.lifeDeep,
            0.9,
          )}
          {line('M 0 44.5 H 48', ink, 1.1)}
          {line('M 2 33 C 4 32 6 34 8 33', c.waterTop, 1)}
        </>
      );
      break;
    case 'storm shutters':
      art = (
        <>
          {face('M 3 3 H 45 V 45 H 3 Z', c.fat, 1.1)}
          {line(
            'M 3 9 H 45 M 3 15 H 45 M 3 21 H 45 M 3 27 H 45 M 3 33 H 45 M 3 39 H 45',
            c.woodDark,
            0.7,
            0.45,
          )}
          {face('M 10.5 8.5 H 37.5 V 38 H 10.5 Z', c.paper, 1.1)}
          {face('M 12.5 10.5 H 24 V 36 H 12.5 Z', c.blockBlue, 1)}
          {face('M 24 10.5 H 35.5 V 36 H 24 Z', c.blockBlue, 1)}
          {line(
            Array.from(
              { length: 7 },
              (_, i) => `M 14 ${13.5 + i * 3.1} H 22.5 M 25.5 ${13.5 + i * 3.1} H 34`,
            ).join(' '),
            ink,
            0.7,
            0.55,
          )}
          {steel('M 18.5 22 H 29.5 V 24.6 H 18.5 Z', 0.8, true)}
          {steel(
            'M 10 13 H 13.5 V 15.4 H 10 Z M 10 31 H 13.5 V 33.4 H 10 Z M 34.5 13 H 38 V 15.4 H 34.5 Z M 34.5 31 H 38 V 33.4 H 34.5 Z',
            0.6,
            true,
          )}
          {face('M 8.5 38 H 39.5 V 40.8 H 8.5 Z', c.paper, 1)}
        </>
      );
      break;
    case 'roof straps':
      art = (
        <>
          {wind(2, 5, 9)}
          {wind(30, 3, 8, false)}
          {face('M 8 22 H 40 V 44 H 8 Z', c.fat)}
          {pane(12.5, 31, 5.5, 5.5)}
          {pane(30, 31, 5.5, 5.5)}
          {lit('M 3.5 23 L 12 9 H 36 L 44.5 23 Z', c.blockRed)}
          {line('M 9.3 13.5 H 38.7 M 6.6 18 H 41.4', c.organDeep, 0.8, 0.8)}
          {[13, 22.8, 32.6].map((x) => (
            <G key={x}>
              {steel(`M ${x} 11 H ${x + 2.6} V 30 H ${x} Z`, 0.8)}
              <Circle cx={x + 1.3} cy={25.5} r={0.6} fill={ink} />
              <Circle cx={x + 1.3} cy={28.3} r={0.6} fill={ink} />
              <Circle cx={x + 1.3} cy={14} r={0.6} fill={ink} />
            </G>
          ))}
          {line('M 2 44 H 46', ink, 1.1)}
        </>
      );
      break;
    case 'storm shelter door':
      art = (
        <>
          {lit('M 1 44 C 5 29 15 22.5 24 22.5 C 33 22.5 43 29 47 44 Z', c.life, 1.1)}
          {face('M 10.5 42 L 15.5 26 H 32.5 L 37.5 42 Z', c.rock3, 1)}
          {steel('M 13.3 40.5 L 17.3 27.8 H 23.8 V 40.5 Z', 0.9)}
          {steel('M 24.2 27.8 H 30.7 L 34.7 40.5 H 24.2 Z', 0.9)}
          {steel('M 20 32.5 H 23 V 34 H 20 Z M 25 32.5 H 28 V 34 H 25 Z', 0.6)}
          {[
            [17.6, 30],
            [16.2, 37.5],
            [30.4, 30],
            [31.8, 37.5],
          ].map(([x, y]) => (
            <Circle key={`${x}-${y}`} cx={x} cy={y} r={0.55} fill={ink} />
          ))}
          {line('M 0 44 H 48', ink, 1.1)}
        </>
      );
      break;
    case 'lightning rod':
      art = (
        <>
          <Rect x={0} y={42.5} width={48} height={5.5} fill={c.soil} />
          {line('M 0 42.5 H 48', c.lifeDeep, 1.6)}
          {house(12, 34, 28, 42.5)}
          {line('M 24 16.5 L 36.4 28.6 V 46', c.copperDark, 2.2)}
          {line('M 24 16.5 L 36.4 28.6 V 46', c.copper, 1.1)}
          {steel('M 23.2 6 H 24.8 V 17 H 23.2 Z', 0.6)}
          <Circle cx={24} cy={5.4} r={1.1} fill={c.silver} {...o(0.6)} />
          {flash(9, 0, 0.9)}
          {line('M 10 18 L 22 6.5', c.bulbGlow, 1.4, 0.8)}
        </>
      );
      break;

    // ── Getting ready for a storm, in order (D08); the second also for D36 ────
    case 'hearing a storm forecast':
      art = (
        <>
          {grass(42.5)}
          {sun(26, 6.5, 3)}
          {home('open')}
          {child(10)}
          <Circle cx={17.5} cy={40.5} r={1.9} fill={c.blockBlue} {...o(0.6)} />
          {face('M 13.5 36 H 22 V 41.5 H 13.5 Z', c.blockRed, 0.9)}
          <Circle cx={16} cy={38.8} r={1.6} fill={c.rubber} />
          {line('M 19 37.5 H 21 M 19 39 H 21 M 19 40.5 H 21', ink, 0.5)}
          {line('M 18 36 L 20.5 32', ink, 0.7)}
          <Path
            d="M 3 3.5 H 19 Q 21 3.5 21 5.5 V 14.5 Q 21 16.5 19 16.5 H 17 L 17 21 L 13 16.5 H 3 Q 1 16.5 1 14.5 V 5.5 Q 1 3.5 3 3.5 Z"
            fill={c.paper}
            {...o(0.9)}
          />
          {line('M 7 13.5 L 5.5 16', c.water, 1)}
          {line('M 14 13.5 L 12.5 16', c.water, 1)}
          {cloud(11, 9.5, 0.4, c.stormCloud)}
          {flash(10, 10.5, 0.33)}
        </>
      );
      break;
    case 'getting ready for a storm':
      art = (
        <>
          {grass(42.5)}
          {cloud(10, 7, 0.5, c.stormCloud)}
          {cloud(20, 4.5, 0.4, c.stormCloud)}
          {home('shut')}
          {child(19, true)}
          {line('M 8 39 H 12 M 9 36 H 13', ink, 0.8, 0.5)}
        </>
      );
      break;
    case 'staying inside in a storm':
      art = (
        <>
          {grass(42.5)}
          {rain([
            [8, 18],
            [14, 21],
            [20, 18],
            [6, 30],
            [13, 33],
            [20, 29],
            [26, 20],
            [44, 13],
          ])}
          {home('face')}
          {cloud(19, 8, 0.75, c.stormCloud)}
          {flash(10.5, 12, 0.9)}
        </>
      );
      break;
    case 'going out after a storm':
      art = (
        <>
          {grass(42.5)}
          {sun(8, 8, 4)}
          {home('shut')}
          <Path d={ell(6.5, 44.5, 5, 1.4)} fill={c.water} {...o(0.6)} />
          <Path d={ell(21, 45, 4, 1.2)} fill={c.water} {...o(0.6)} />
          <Path d={ell(5.5, 44.1, 2.2, 0.5)} fill={c.waterTop} />
          {child(14)}
          <Circle cx={20.5} cy={40} r={2.4} fill={c.blockGreen} {...o(0.7)} />
          <Circle cx={20.5} cy={40} r={2.4} fill={url(ids.ball)} />
        </>
      );
      break;

    // ── Slowing wind and water (D25) ──────────────────────────────────────────
    case 'row of trees':
      art = (
        <>
          <Rect x={0} y={38} width={48} height={10} fill={c.soil} />
          {line('M 0 42 H 48 M 0 46 H 48', c.soilDark, 0.9, 0.8)}
          {line('M 0 38 H 48', c.lifeDeep, 1.6)}
          {[8, 18.5, 29, 39.5].map((x, i) => (
            <G key={x}>
              {face(`M ${x - 1.2} 26 H ${x + 1.2} V 38.5 H ${x - 1.2} Z`, c.bark, 0.8)}
              {lit(ell(x, 20 + (i % 2) * 1.5, 5.6, 9), i % 2 ? c.life : c.lifeDeep, 1.1)}
            </G>
          ))}
        </>
      );
      break;
    case 'snow fence':
      art = (
        <>
          {wind(1.5, 8, 9)}
          {wind(12, 4, 7, false)}
          {Array.from({ length: 14 }, (_, i) => {
            const x = 7.2 + i * 2.5;
            return <G key={i}>{face(`M ${x} 19 H ${x + 1.4} V 38 H ${x} Z`, c.orange, 0.6)}</G>;
          })}
          {line('M 5 22 H 43 M 5 34 H 43', c.metalDark, 0.9)}
          {face('M 4.5 16 H 7 V 40 H 4.5 Z', c.wood, 0.9)}
          {face('M 41 16 H 43.5 V 40 H 41 Z', c.wood, 0.9)}
          <Path
            d="M 0 40 C 10 39 20 38.5 26 37.5 C 34 36 38 30 44 29 C 46 29 47.5 30.5 48 31 V 48 H 0 Z"
            fill={c.snow}
            {...o(1)}
          />
          <Path
            d="M 30 37 C 35 35 38 31 43 30.5"
            fill="none"
            stroke={c.rainCloud}
            strokeWidth={1}
          />
        </>
      );
      break;
    case 'sandbags on riverbank':
      art = (
        <>
          {grass(16)}
          {bush(40, 10, 5)}
          <Rect x={39.2} y={13} width={1.6} height={4} fill={c.bark} />
          <Path d={waves(0, 48, 34.5, 48, 8)} fill={c.water} />
          {line('M 6 40 H 14 M 22 43 H 32 M 36 39.5 H 44', c.waterTop, 1)}
          {sandbags(
            [
              [0.5, 29.5, 5],
              [5.2, 24, 4],
            ],
            9.4,
            5.6,
          )}
        </>
      );
      break;
    case 'rock wall at shore':
      art = (
        <>
          <Path d="M 22 44 V 33 C 26 30 32 29 48 29 V 44 Z" fill={c.rock1} {...o(1)} />
          {grass(29, 34, 48)}
          <Path d={waves(0, 22, 29, 44, 4)} fill={c.water} />
          <Path
            d="M 2 29 C 4 23 10 21 13 24 C 11 23.5 9 25 10 27"
            fill="none"
            stroke={c.waterTop}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          {rock(17, 40.5, 4.6, c.rock2, 'a')}
          {rock(26, 40.8, 4.8, c.rock5, 'b')}
          {rock(34.5, 40.5, 4.3, c.rock2, 'c')}
          {rock(21.3, 33.8, 4.4, c.rock5, 'd')}
          {rock(30, 33.6, 4.5, c.rock2, 'e')}
          {rock(25.5, 26.8, 4.1, c.rock2, 'f')}
          {line('M 0 44 H 48', ink, 1.1)}
          {(
            [
              [12, 20],
              [15, 17],
              [9.5, 16.5],
            ] as const
          ).map(([x, y], i) => (
            <Path key={i} d={drop(x, y, 0.55)} fill={c.waterTop} {...o(0.5)} />
          ))}
        </>
      );
      break;
    case 'dam':
      art = (
        <>
          <Rect x={10} y={10.5} width={28} height={5} fill={c.water} />
          {lit('M 0 12 L 14 9 L 17.5 44 H 0 Z', c.life, 1)}
          {lit('M 48 12 L 34 9 L 30.5 44 H 48 Z', c.life, 1)}
          {face('M 12.5 13 Q 24 16 35.5 13 L 32 41 H 16 Z', c.rock3)}
          {line('M 19.5 14.8 L 19 32 M 24 15.5 V 32 M 28.5 14.8 L 29 32', ink, 0.6, 0.4)}
          {line('M 12.5 13 Q 24 16 35.5 13', c.metalDark, 1.2)}
          <Rect x={19.2} y={32} width={3.6} height={4} fill={c.cupDark} {...o(0.7)} />
          <Rect x={25.2} y={32} width={3.6} height={4} fill={c.cupDark} {...o(0.7)} />
          <Path d="M 13 48 L 16 41 H 32 L 35 48 Z" fill={c.water} {...o(1)} />
          <Path
            d="M 19.4 35 C 19 39 17.5 41 16.5 44 H 23.5 C 23 41 22.8 39 22.6 35 Z M 25.4 35 C 25.2 39 25 41 24.5 44 H 31.5 C 30.5 41 29 39 28.6 35 Z"
            fill={c.waterTop}
            {...o(0.7)}
          />
          {line('M 18 46 C 20 45 22 47 24 46 C 26 45 28 47 30 46', c.snow, 1)}
        </>
      );
      break;

    // ── Energy resources (D46) ────────────────────────────────────────────────
    case 'wind turbine': {
      const blade = (a: number, s = 1) => (
        <Path
          key={a}
          d={`M 0 -1.2 C ${4 * s} -1.8 ${12 * s} -0.8 ${15 * s} 0 C ${12 * s} 0.9 ${4 * s} 1.4 0 1.2 Z`}
          fill={c.snow}
          transform={`rotate(${a})`}
          {...o(0.8 * Math.min(1, s + 0.3))}
        />
      );
      const turbine = (x: number, top: number, s: number) => (
        <G transform={`translate(${x} ${top}) scale(${s})`}>
          <Path d="M -0.9 1 H 0.9 L 1.7 30 H -1.7 Z" fill={c.snow} {...o(0.9 / s)} />
          <Path d="M -0.9 1 H 0.9 L 1.7 30 H -1.7 Z" fill={url(ids.sheen)} />
          {face('M -1.5 -1.8 H 4.5 V 1.8 H -1.5 Z', c.snow, 0.8 / s)}
          <G transform="translate(-1.8 0)">
            {[-90, 30, 150].map((a) => blade(a))}
            <Circle cx={0} cy={0} r={1.5} fill={c.silver} {...o(0.8 / s)} />
          </G>
        </G>
      );
      art = (
        <>
          {lit('M 0 48 V 42 C 12 38 34 37 48 41 V 48 Z', c.life, 1)}
          {turbine(39, 24, 0.55)}
          {turbine(20, 14, 1)}
        </>
      );
      break;
    }
    case 'stack of logs': {
      const logs: [number, number][] = [
        [19.5, 21],
        [29.5, 21],
        [14.5, 29.6],
        [24.5, 29.6],
        [34.5, 29.6],
        [9.5, 38.2],
        [19.5, 38.2],
        [29.5, 38.2],
        [39.5, 38.2],
      ];
      const r = 5;
      art = (
        <>
          <FloorShadow cx={27} cy={43.4} rx={21} ry={2.2} />
          {logs.map(([x, y], i) => (
            <G key={`b${i}`}>
              {lit(
                `M ${x + 0.55 * r} ${y + 0.83 * r} L ${x - 0.55 * r} ${y - 0.83 * r} L ${x + 5 - 0.55 * r} ${y - 3.5 - 0.83 * r} A ${r} ${r} 0 0 1 ${x + 5 + 0.55 * r} ${y - 3.5 + 0.83 * r} Z`,
                c.bark,
                0.9,
              )}
            </G>
          ))}
          {logs.map(([x, y], i) => (
            <G key={`f${i}`}>
              <Circle cx={x} cy={y} r={r} fill={c.wood} stroke={c.bark} strokeWidth={1.4} />
              <Circle cx={x} cy={y} r={r + 0.6} fill="none" {...o(0.8)} />
              <Circle cx={x} cy={y} r={2.8} fill="none" stroke={c.woodDark} strokeWidth={0.6} />
              <Circle cx={x} cy={y} r={1.1} fill="none" stroke={c.woodDark} strokeWidth={0.6} />
              <Circle cx={x} cy={y} r={r} fill={url(ids.round)} />
            </G>
          ))}
        </>
      );
      break;
    }
    case 'geyser':
      art = (
        <>
          {lit('M 1 45 C 8 38 16 36.5 24 36.5 C 32 36.5 40 38 47 45 Z', c.rock3, 1)}
          {line('M 9 42 C 12 40.5 15 41 17 40 M 31 40 C 34 41 37 40.5 40 42', c.rock4, 0.9)}
          <Path d={ell(24, 37.5, 6, 1.6)} fill={c.water} {...o(0.7)} />
          <Path
            d="M 21.6 37.5 L 19.5 14 C 19.5 10 28.5 10 28.5 14 L 26.4 37.5 Z"
            fill={c.water}
            {...o(1)}
          />
          {line('M 22.5 34 L 21 16 M 25.5 34 L 26.8 17', c.waterTop, 1)}
          {(
            [
              [16.5, 11, 3.6],
              [22, 7, 4.2],
              [29, 7.5, 3.8],
              [33.5, 11.5, 3.2],
              [13, 16, 2.6],
              [36, 17, 2.4],
            ] as const
          ).map(([x, y, r], i) => (
            <G key={i}>
              <Circle cx={x} cy={y} r={r} fill={c.snow} {...o(0.8)} />
              <Circle cx={x} cy={y} r={r} fill={url(ids.round)} />
            </G>
          ))}
          {(
            [
              [15, 24],
              [33, 25],
              [12.5, 31],
              [35.5, 31.5],
            ] as const
          ).map(([x, y], i) => (
            <Path key={i} d={drop(x, y, 0.7)} fill={c.water} {...o(0.5)} />
          ))}
        </>
      );
      break;
    case 'lumps of coal': {
      const lumps = [
        ['M 12 33 L 15 24 L 22 21 L 27 27 L 22 33 Z', 'M 15 24 L 22 21 L 19 27 Z'],
        ['M 24 29 L 28 20 L 35 19 L 38 26 L 33 31 Z', 'M 28 20 L 35 19 L 31 24 Z'],
        ['M 5 43 L 8 35 L 15 31 L 21 36 L 20 43 Z', 'M 8 35 L 15 31 L 13 37 Z'],
        ['M 18 43 L 20 33 L 27 28 L 34 31 L 35 43 Z', 'M 20 33 L 27 28 L 25 35 Z'],
        ['M 31 43 L 33 35 L 39 32 L 44 36 L 44 43 Z', 'M 33 35 L 39 32 L 37 37 Z'],
      ];
      art = (
        <>
          <FloorShadow cx={24} cy={43.5} rx={21} ry={2.2} />
          {lumps.map(([d, top], i) => (
            <G key={i}>
              <Path d={d} fill={c.rubber} {...o(1)} />
              <Path d={top} fill={c.shine} fillOpacity={0.32 * c.sheen + 0.08} />
              <Path d={d} fill={url(ids.round)} />
            </G>
          ))}
          {(
            [
              [17, 25],
              [31, 22],
              [11, 36],
            ] as const
          ).map(([x, y], i) => (
            <Circle key={i} cx={x} cy={y} r={0.7} fill={c.shine} />
          ))}
        </>
      );
      break;
    }
    case 'oil pump':
      art = (
        <>
          {face('M 2 41 H 46 V 44.5 H 2 Z', c.rock3, 1)}
          {steel('M 4.5 35.5 H 9 V 41 H 4.5 Z', 0.8)}
          {line('M 6.8 24 V 35.5', ink, 0.9)}
          {line('M 21 41 L 26 16 L 31 41 M 22.4 34 H 29.6', c.metalDark, 2.2)}
          {face('M 34 35 H 44 V 41 H 34 Z', c.metalDark, 0.9)}
          {line('M 39.5 13.5 L 37.5 32.5', c.metalDark, 1.8)}
          {lit(ell(37.5, 32.5, 4.6, 4.6), c.blockRed, 1)}
          <Circle cx={37.5} cy={32.5} r={1.1} fill={ink} />
          {lit('M 8.5 14.5 L 41 11 L 41.4 15 L 9 18.5 Z', c.chartSecond, 1)}
          {lit(
            'M 3 10.5 C 7 9.5 10 11.5 10 14.5 L 10.6 20.5 C 10 23.5 7.5 25 4 25 C 6 20 5.5 15 3 10.5 Z',
            c.chartSecond,
            1,
          )}
          <Circle cx={26} cy={15.8} r={1.4} fill={c.silver} {...o(0.7)} />
        </>
      );
      break;
    case 'gas stove flame': {
      const flames = Array.from({ length: 12 }, (_, i) => {
        const a = (i * 2 * Math.PI) / 12;
        return { x: 24 + 10.5 * Math.cos(a), y: 30 + 3 * Math.sin(a), back: Math.sin(a) < 0 };
      });
      const flame = (x: number, y: number, k: number) => (
        <G key={k}>
          <Path
            d={`M ${x} ${y - 7} C ${x + 2.2} ${y - 3.5} ${x + 1.8} ${y} ${x} ${y} C ${x - 1.8} ${y} ${x - 2.2} ${y - 3.5} ${x} ${y - 7} Z`}
            fill={c.spectrumBlue}
          />
          <Path
            d={`M ${x} ${y - 3.5} C ${x + 1} ${y - 2} ${x + 0.9} ${y} ${x} ${y} C ${x - 0.9} ${y} ${x - 1} ${y - 2} ${x} ${y - 3.5} Z`}
            fill={c.waterTop}
          />
        </G>
      );
      art = (
        <>
          {face('M 2 30 H 46 L 47 46 H 1 Z', c.metal, 1)}
          {flames.filter((f) => f.back).map((f, i) => flame(f.x, f.y, i))}
          <Path d={ell(24, 31, 11, 3.4)} fill={c.metalDark} {...o(1)} />
          <Path d={ell(24, 30.3, 7, 2)} fill={c.rubber} {...o(0.7)} />
          {flames.filter((f) => !f.back).map((f, i) => flame(f.x, f.y, 100 + i))}
          {line('M 4 38 L 13 33.5 M 44 38 L 35 33.5 M 24 43 V 35', c.rubber, 2)}
          <Path d={ell(24, 36, 20, 6.5)} fill="none" stroke={c.rubber} strokeWidth={2} />
        </>
      );
      break;
    }
    case 'nuclear power plant':
      art = (
        <>
          {grass(43)}
          {face('M 31 34 H 45 V 43 H 31 Z', c.rock3, 1)}
          {lit('M 31 34 C 31 26.5 45 26.5 45 34 Z', c.silver, 1)}
          {lit('M 7 43 C 10 33 11.5 25 9.5 16 H 26.5 C 24.5 25 26 33 29 43 Z', c.rock3, 1.1)}
          <Path d={ell(18, 16, 8.5, 1.6)} fill={c.cupDark} {...o(0.9)} />
          {line('M 10.8 22 C 15 23 21 23 25.2 22', c.blockRed, 1.4, 0.8)}
          {(
            [
              [14, 10, 3.6],
              [19.5, 7, 4.2],
              [26, 6.5, 3.8],
              [31, 9, 3],
              [36, 7.5, 2.4],
            ] as const
          ).map(([x, y, r], i) => (
            <G key={i}>
              <Circle cx={x} cy={y} r={r} fill={c.snow} {...o(0.8)} />
              <Circle cx={x} cy={y} r={r} fill={url(ids.round)} />
            </G>
          ))}
        </>
      );
      break;

    // ── Protecting against natural hazards (D47) ──────────────────────────────
    case 'braced walls': {
      const studs = [4, 14, 24, 34, 41.5];
      art = (
        <>
          {studs.map((x) => (
            <G key={x}>{face(`M ${x} 10 H ${x + 2.5} V 40 H ${x} Z`, c.wood, 0.8)}</G>
          ))}
          {face('M 5.5 11.5 L 8.5 10 L 42.5 38.5 L 39.5 40 Z', c.woodDark, 0.9)}
          {face('M 39.5 10 L 42.5 11.5 L 8.5 40 L 5.5 38.5 Z', c.woodDark, 0.9)}
          {face('M 3 5 H 45 V 10 H 3 Z', c.wood, 1)}
          {line('M 3 7.5 H 45', ink, 0.6, 0.6)}
          {face('M 3 40 H 45 V 43 H 3 Z', c.wood, 1)}
          {line('M 1 43 H 47', ink, 1.1)}
          {(
            [
              [15.2, 17.6],
              [15.2, 32.4],
              [25.2, 25],
              [35.2, 17.6],
              [35.2, 32.4],
            ] as const
          ).map(([x, y], i) => (
            <Circle key={i} cx={x} cy={y} r={0.6} fill={ink} />
          ))}
        </>
      );
      break;
    }
    case 'bolted shelves': {
      const books: [number, number, number, string][] = [];
      const colors = [c.blockRed, c.blockBlue, c.chartSecond, c.blockGreen, c.purple];
      [
        [13.5, 20.5],
        [13.5, 29.5],
        [13.5, 38.5],
      ].forEach(([x0, base], row) => {
        let x = x0!;
        for (let i = 0; i < 5; i++) {
          const w = 3 + ((i + row) % 3) * 0.6;
          books.push([x, base!, w, colors[(i + row * 2) % 5]!]);
          x += w + 0.3;
        }
      });
      art = (
        <>
          <Rect x={0} y={0} width={48} height={44} fill={c.fabric} />
          {face('M 0 42 H 48 V 44 H 0 Z', c.paper, 0.8)}
          {line('M 0 44 H 48', ink, 1.1)}
          {face('M 12 12 H 36 V 44 H 12 Z', c.wood, 1.1)}
          {face('M 13.5 13.5 H 34.5 V 42.5 H 13.5 Z', c.woodDark, 0.8)}
          {books.map(([x, base, w, fill], i) => (
            <G key={i}>
              {face(`M ${x} ${base - 5.5 - (i % 2)} H ${x + w} V ${base} H ${x} Z`, fill, 0.6)}
            </G>
          ))}
          {[20.5, 29.5, 38.5].map((y) => (
            <G key={y}>{face(`M 13.5 ${y} H 34.5 V ${y + 1.6} H 13.5 Z`, c.wood, 0.7)}</G>
          ))}
          {[14, 30].map((x) => (
            <G key={x}>
              {steel(`M ${x} 4 H ${x + 3.4} V 11 H ${x + 4} V 13.5 H ${x} Z`, 0.8)}
              <Circle cx={x + 1.7} cy={6.5} r={0.7} fill={ink} />
              <Circle cx={x + 1.7} cy={9.5} r={0.7} fill={ink} />
            </G>
          ))}
        </>
      );
      break;
    }
    case 'cleared brush around house':
      art = (
        <>
          <Path d={ell(24, 31, 23.5, 14)} fill={c.life} {...o(1)} />
          <Path d={ell(24, 32, 15, 8)} fill={c.rock1} {...o(0.8)} />
          {(
            [
              [5, 26, 3.6],
              [10.5, 21, 4],
              [18, 18.5, 4],
              [26.5, 18, 4],
              [34.5, 19.5, 4],
              [41.5, 23.5, 3.8],
            ] as const
          ).map(([x, y, r], i) => bush(x, y, r, `b${i}`))}
          {house(19, 30, 29, 36)}
          {(
            [
              [4.5, 36, 3.4],
              [9.5, 41, 3.6],
              [38, 41.5, 3.6],
              [43.5, 35.5, 3.4],
            ] as const
          ).map(([x, y, r], i) => bush(x, y, r, `f${i}`))}
        </>
      );
      break;
    case 'fire break': {
      const rows: [number, number][] = [
        [13, 4],
        [19, 5.5],
        [26, 7.5],
        [35, 10],
        [46, 12.5],
      ];
      art = (
        <>
          <Path d="M 0 48 V 12 C 12 8 36 8 48 12 V 48 Z" fill={c.life} {...o(1)} />
          <Path d="M 22.5 9.3 H 25.5 L 33 48 H 15 Z" fill={c.rock1} {...o(0.9)} />
          {line('M 24 12 L 24 48', c.rock4, 0.7, 0.7)}
          {rows.map(([base, h], r) => {
            const half = 1.5 + ((base - 9) / 39) * 7.5;
            const xs: number[] = [];
            for (let x = 24 - half - h * 0.45; x > -h * 0.3; x -= h * 0.62) xs.push(x);
            for (let x = 24 + half + h * 0.45; x < 48 + h * 0.3; x += h * 0.62) xs.push(x);
            return xs.map((x, i) => pine(x, base, h, `${r}-${i}`));
          })}
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
        <RadialGradient id={ids.ball} cx="0.4" cy="0.35" r="0.7" fx="0.32" fy="0.28">
          <Stop offset="0" stopColor={c.shine} stopOpacity={0.6 * c.sheen} />
          <Stop offset="0.4" stopColor={c.shine} stopOpacity={0} />
          <Stop offset="1" stopColor={c.shade} stopOpacity={0.15} />
        </RadialGradient>
        <TopLight id={ids.light} />
        <Sheen id={ids.sheen} />
        <Sheen id={ids.sheenV} vertical />
        <Glass id={ids.glass} />
        <Metal id={ids.metal} light={c.silver} dark={c.silverDark} />
      </Defs>
      {art}
    </G>
  );
}
