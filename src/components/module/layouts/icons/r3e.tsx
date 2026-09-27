/**
 * Round-3 card icons (group E), 48 × 48 like every card icon, drawn in their materials with the
 * helpers in reps/paint.tsx. The names are listed in data/modules/layouts/icons/r3e.ts.
 *
 * Landforms, water and rock layers as small scenes seen from the side, lit from the top left:
 * rock in the rock-layer colors, grass, sand, ice and water. Water is always blue, so "Blue on a
 * map is water" holds on the land-and-water sort too. The two sequences are one scene changing:
 * the rock layers as a cut-away (sand, then mud, then shells, then raised, then cut by a river),
 * and the path of water from the ocean to the air, a mountain, the soil and back by a river.
 */
import type { ReactNode } from 'react';
import {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { usePalette } from '@/theme';

import { FloorShadow, TopLight, url, usePaintIds } from '../../reps/paint';
import type { IconProps } from './types';

/** An ellipse as a path, so it can be filled and then lit with the same `d`. */
const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;

/** A water drop, point up, `s` tall above its center. */
const drop = (x: number, y: number, s: number) =>
  `M ${x} ${y - s} C ${x + 0.75 * s} ${y - 0.1 * s} ${x + 0.75 * s} ${y + 0.65 * s} ${x} ${y + 0.65 * s} C ${x - 0.75 * s} ${y + 0.65 * s} ${x - 0.75 * s} ${y - 0.1 * s} ${x} ${y - s} Z`;

/** A patch of land seen from above at a slant, for rivers, lakes and ponds. */
const LAND =
  'M 3 16 C 12 12 36 12 45 16 C 47 24 47 33 44.5 39.5 C 35 44.5 13 44.5 3.5 39.5 C 1 33 1 24 3 16 Z';

/** A rocky mountain with a second, lower peak on its right. */
const MOUNTAIN = 'M 3 42 L 18 7 L 23.5 17 L 30 12 L 45 42 Z';
/** The mountain's faces turned away from the light. */
const MOUNTAIN_SHADE = 'M 18 7 L 23.5 17 L 30 12 L 45 42 H 25 L 21.5 30 L 22.5 19 Z';

/** The cut-away of rock layers (s.4.weathering~layers-order), frame and sea level. */
const CUT = { x0: 4, x1: 44, y0: 4, y1: 44, sea: 22 };
/** How far a layer is raised at x once the land is pushed up: most in the middle. */
const bulge = (x: number) => Math.exp(-(((x - 24) / 14) ** 2));
/** The river's canyon through the raised layers: [top left, top right, floor right, floor left]. */
const CANYON: [number, number][] = [
  [17, 0],
  [31, 0],
  [26.3, 16.5],
  [21.7, 16.5],
];

export function R3EIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  const ids = usePaintIds('round', 'light', 'sea', 'land', 'frame', 'cut', 'above', 'dome');

  const o = (w = 1.1) => ({
    stroke: ink,
    strokeWidth: w,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  });
  /** A shape in its color, outlined, with light from the top left laid over it. */
  const lit = (d: string, fill: string, w = 1.1) => (
    <>
      <Path d={d} fill={fill} {...o(w)} />
      <Path d={d} fill={url(ids.round)} />
    </>
  );
  /** The side of a shape turned away from the light. */
  const shaded = (d: string, k = 0.18) => <Path d={d} fill={c.shade} fillOpacity={k} />;
  /** A thick stroke in its color with an outline (a trunk, a stream, a leg). */
  const limb = (d: string, color: string, w = 2) => (
    <>
      <Path d={d} fill="none" {...o(w + 1.6)} />
      <Path d={d} fill="none" {...o(w)} stroke={color} />
    </>
  );
  /** A thin line in a color (ripples, cracks, grass). */
  const line = (d: string, color: string, w = 0.9, opacity = 1) => (
    <Path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={w}
      strokeOpacity={opacity}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
  /** A filled arrowhead at (x, y) pointing along `deg` (0 = right, 90 = down). */
  const head = (x: number, y: number, deg: number, color: string, s = 2.4) => (
    <Path
      d={`M ${x + s} ${y} L ${x - s * 0.7} ${y - s * 0.75} L ${x - s * 0.7} ${y + s * 0.75} Z`}
      fill={color}
      transform={`rotate(${deg} ${x} ${y})`}
    />
  );
  /** A straight arrow from (x1, y1) to (x2, y2). */
  const arrow = (x1: number, y1: number, x2: number, y2: number, color: string, w = 1.3) => {
    const deg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    const k = 1.8 / Math.hypot(x2 - x1, y2 - y1);
    return (
      <G key={`${x1},${y1}`}>
        {line(`M ${x1} ${y1} L ${x2 - (x2 - x1) * k} ${y2 - (y2 - y1) * k}`, color, w)}
        {head(x2 - (x2 - x1) * k * 0.4, y2 - (y2 - y1) * k * 0.4, deg, color, 2.1)}
      </G>
    );
  };
  const ground = (cx = 24, cy = 43, rx = 18) => <FloorShadow cx={cx} cy={cy} rx={rx} ry={2.5} />;
  /** Grains of sand: small lit dots in the sand color. */
  const grains = (pts: [number, number][], r = 0.75, color = c.rock1) =>
    pts.map(([x, y]) => (
      <Circle key={`${x},${y}`} cx={x} cy={y} r={r} fill={color} stroke={ink} strokeWidth={0.3} />
    ));
  /** A white wave crest `s` wide. */
  const crest = (x: number, y: number, s: number) => (
    <G key={`${x},${y}`}>
      {line(
        `M ${x} ${y + 0.9} Q ${x + s / 2} ${y - s * 0.45 + 0.9} ${x + s} ${y + 0.9}`,
        c.waterDeep,
        s * 0.18,
      )}
      {line(`M ${x} ${y} Q ${x + s / 2} ${y - s * 0.45} ${x + s} ${y}`, c.snow, s * 0.2)}
    </G>
  );
  /** A round leafy crown on a trunk; `r` is the crown's radius. */
  const bush = (x: number, y: number, r: number, color = c.lifeDeep) => (
    <G key={`${x},${y}`}>
      {limb(`M ${x} ${y + r * 0.6} V ${y + r * 1.5}`, c.bark, r * 0.35)}
      {lit(ell(x, y, r, r * 0.9), color, 0.8)}
    </G>
  );
  /** A pine tree standing on (x, y), `h` tall. */
  const pine = (x: number, y: number, h: number, color = c.lifeDeep) => (
    <G key={`${x},${y}`}>
      {lit(`M ${x} ${y - h} L ${x + h * 0.32} ${y - h * 0.12} H ${x - h * 0.32} Z`, color, 0.8)}
      <Path d={`M ${x - 0.5} ${y - h * 0.12} h 1 V ${y} h -1 Z`} fill={c.bark} />
    </G>
  );
  /** A snowflake. */
  const flake = (x: number, y: number, r = 2.2) =>
    line(
      `M ${x - r} ${y} H ${x + r} M ${x - r / 2} ${y - r * 0.87} L ${x + r / 2} ${y + r * 0.87} M ${x - r / 2} ${y + r * 0.87} L ${x + r / 2} ${y - r * 0.87}`,
      c.glassEdge,
      0.9,
    );

  /** The rocky mountain; with `snow`, a thick snow cap and snow at its foot. */
  const mountain = (snow: boolean) => (
    <>
      {ground(24, 43, 21)}
      {lit(MOUNTAIN, c.rock2)}
      {shaded(MOUNTAIN_SHADE)}
      {snow ? (
        <>
          {lit(
            'M 18 7 L 23.5 17 L 30 12 L 36.5 26 L 33 23.5 L 30 27.5 L 27 23 L 23.5 27 L 20.5 22.5 L 17 26.5 L 13.8 22.5 L 10.8 25 Z',
            c.snow,
            0.9,
          )}
          {shaded(
            'M 18 7 L 23.5 17 L 30 12 L 36.5 26 L 33 23.5 L 30 27.5 L 27 23 L 21.2 21 Z',
            0.1,
          )}
          {lit(
            'M 2 42 C 8 37 14 40 20 38 C 28 36 36 40 46 38 V 42.5 C 32 45 14 45 2 42.5 Z',
            c.snow,
            1,
          )}
          {flake(7, 9)}
          {flake(39, 6)}
          {flake(43, 17, 1.6)}
        </>
      ) : (
        <>
          {line(
            'M 11 26 l 3.5 2.5 M 8 34 l 4 1.5 M 33.5 25 l -2 4 M 27.5 19 l 1.5 3.2 M 36 33 l 3 1',
            ink,
            0.7,
            0.55,
          )}
          {lit(
            'M 2 42 C 8 37 14 40 20 38 C 28 36 36 40 46 38 V 42.5 C 32 45 14 45 2 42.5 Z',
            c.life,
            1,
          )}
        </>
      )}
    </>
  );

  /** The slanted patch of land, lit, with `water` drawn inside it. */
  const landWith = (fill: string, water: ReactNode) => (
    <>
      {ground(24, 42, 21)}
      {lit(LAND, fill)}
      <G clipPath={url(ids.land)}>{water}</G>
      <Path d={LAND} fill="none" {...o()} />
    </>
  );

  /** A sand dune: a long gentle slope on the windward left, a steep face on the right. */
  const dune = (
    <>
      {lit('M 2 31 C 6 29 10 25 15 22.5 C 17.5 24.5 21 28.5 25 31 Z', c.rock1, 0.9)}
      {lit('M 2 40 C 9 36 17 26 29 18 C 33 22 38 32 46 37 V 41.5 Q 24 45 2 41.5 Z', c.rock1)}
      {shaded('M 29 18 C 33 22 38 32 46 37 V 41.5 Q 38 43 31 43 C 31.5 33 30.5 24 29 18 Z')}
      {line(
        'M 7 38.5 C 11 36 14 33.5 16 31 M 12 39.5 C 16 36.5 19 33 21 29.5 M 18 40.5 C 21 37 23.5 32.5 25.5 27',
        c.rock4,
        0.9,
      )}
    </>
  );

  /**
   * One stage of the rock layers forming (1 sand, 2 mud, 3 shells, 4 raised, 5 cut by a river),
   * as a cut-away with the sea level fixed. Once raised, the layers bow up in the middle, above
   * the sea; the sea stays at the sides. The river's canyon floor stays above the sea.
   */
  const strata = (stage: 1 | 2 | 3 | 4 | 5) => {
    const lift = stage >= 4 ? 22 : 0;
    const top = (y: number, x: number) => y - lift * bulge(x);
    const xs = Array.from({ length: 41 }, (_, i) => CUT.x0 + i);
    const edge = (y: number, back = false) =>
      (back ? [...xs].reverse() : xs).map((x) => `${x} ${top(y, x).toFixed(2)}`).join(' L ');
    /** A layer from depth `y0` to `y1` before it is raised (the base rock keeps a flat bottom). */
    const band = (y0: number, y1: number, flat = false) =>
      `M ${edge(y0)} L ${flat ? `${CUT.x1} ${y1} L ${CUT.x0} ${y1}` : edge(y1, true)} Z`;
    const layers: [number, number, string, boolean][] = [
      [40, CUT.y1, c.rock2, true],
      [36, 40, c.rock1, false],
      ...(stage >= 2 ? ([[32, 36, c.rock5, false]] as [number, number, string, boolean][]) : []),
      ...(stage >= 3 ? ([[28, 32, c.rock3, false]] as [number, number, string, boolean][]) : []),
    ];
    const surface = stage >= 3 ? 28 : stage === 2 ? 32 : 36;
    const sandDots: [number, number][] = [7, 12, 17, 22, 27, 32, 37, 41].map((x, i) => [
      x,
      top(i % 2 ? 37.2 : 38.8, x),
    ]);
    const shells = [8, 15, 22, 29, 36, 41].map((x, i) => {
      const y = top(i % 2 ? 29.6 : 30.4, x);
      return (
        <G key={x}>
          <Path
            d={`M ${x - 1.5} ${y + 0.9} Q ${x} ${y - 2.1} ${x + 1.5} ${y + 0.9} Z`}
            fill={c.paper}
            {...o(0.5)}
          />
          {line(`M ${x} ${y + 0.9} V ${y - 0.8}`, ink, 0.4)}
        </G>
      );
    });
    const land = band(surface, CUT.y1, true);
    const walls = CANYON.map(([x, y]) => `${x} ${y}`).join(' L ');
    const rock = (
      <>
        {layers.map(([y0, y1, fill, flat]) => (
          <G key={y0}>
            <Path d={band(y0, y1, flat)} fill={fill} stroke={ink} strokeWidth={0.6} />
          </G>
        ))}
        <Path d={land} fill={url(ids.light)} />
        {grains(sandDots, 0.6, c.rock4)}
        {stage >= 3 ? shells : null}
        {stage >= 4 ? (
          <G clipPath={url(ids.above)}>{line(`M ${edge(surface)}`, c.lifeDeep, 1.6)}</G>
        ) : null}
      </>
    );
    return (
      <>
        <Defs>
          <ClipPath id={ids.frame}>
            <Rect x={CUT.x0} y={CUT.y0} width={CUT.x1 - CUT.x0} height={CUT.y1 - CUT.y0} rx={2} />
          </ClipPath>
          <ClipPath id={ids.cut}>
            <Path d={`M 0 0 H 48 V 48 H 0 Z M ${walls} Z`} clipRule="evenodd" />
          </ClipPath>
          <ClipPath id={ids.above}>
            <Rect x={0} y={0} width={48} height={CUT.sea} />
          </ClipPath>
          <ClipPath id={ids.dome}>
            <Path d={land} />
          </ClipPath>
        </Defs>
        <G clipPath={url(ids.frame)}>
          <Rect
            x={CUT.x0}
            y={CUT.sea}
            width={CUT.x1 - CUT.x0}
            height={CUT.y1 - CUT.sea}
            fill={url(ids.sea)}
          />
          {line(`M ${CUT.x0} ${CUT.sea} H ${CUT.x1}`, c.waterDeep, 1)}
          {stage === 5 ? <G clipPath={url(ids.cut)}>{rock}</G> : rock}
          {stage === 5 ? (
            <>
              <G clipPath={url(ids.dome)}>
                <Path d={`M ${walls}`} fill="none" {...o(0.9)} />
              </G>
              <Path d="M 21.2 14.4 H 26.8 L 26.3 16.5 H 21.7 Z" fill={c.water} {...o(0.6)} />
            </>
          ) : null}
          {stage === 1
            ? grains(
                [
                  [10, 27],
                  [17, 31],
                  [24, 25.5],
                  [31, 30],
                  [38, 27],
                  [14, 24],
                  [34, 24],
                ],
                0.8,
              )
            : null}
          {stage === 2
            ? [11, 19, 27, 35, 15, 31].map((x, i) => (
                <Ellipse key={x} cx={x} cy={i < 4 ? 28 : 25} rx={1.1} ry={0.7} fill={c.rock5} />
              ))
            : null}
          {stage === 3
            ? [
                [12, 25],
                [26, 24],
                [36, 25.5],
              ].map(([x, y]) => (
                <Path
                  key={x}
                  d={`M ${x! - 1.6} ${y! + 0.9} Q ${x} ${y! - 2.2} ${x! + 1.6} ${y! + 0.9} Z`}
                  fill={c.paper}
                  {...o(0.5)}
                />
              ))
            : null}
          {stage === 4 ? (
            <>
              {arrow(16, 43, 16, 36, ink)}
              {arrow(24, 43, 24, 30, ink)}
              {arrow(32, 43, 32, 36, ink)}
            </>
          ) : null}
        </G>
        <Rect
          x={CUT.x0}
          y={CUT.y0}
          width={CUT.x1 - CUT.x0}
          height={CUT.y1 - CUT.y0}
          rx={2}
          fill="none"
          {...o(1)}
        />
      </>
    );
  };

  /**
   * One step of water moving through the spheres (1 evaporates, 2 rains on the mountain, 3 soaks
   * into the soil, 4 runs back to the sea), in one cut-away scene: the sea on the left, the land
   * with a tree and a mountain on the right.
   */
  const spheres = (step: 1 | 2 | 3 | 4) => (
    <>
      {lit('M 2 44 V 40 C 8 40 12 38 15.5 33.5 L 17.5 31 H 46 V 44 Z', c.soil, 1)}
      {line('M 5 42 l 1.5 0 M 30 40 l 1.5 0.5 M 40 37 l 1 0.8 M 35 42 l 1.4 0', c.soilDark, 1.2)}
      {lit('M 2 31 H 17.5 L 15.5 33.5 C 12 38 8 40 2 40 Z', c.water, 1)}
      {line('M 3 33.5 q 2 -1.2 4 0 t 4 0', c.waterTop, 0.8)}
      {lit('M 27 31 L 38 12 L 46 24.5 V 31 Z', c.rock2, 1)}
      {shaded('M 38 12 L 46 24.5 V 31 H 37 L 38.5 22 Z')}
      {line('M 17.5 31 H 46', c.lifeDeep, 1.6)}
      {line(
        'M 22 31 V 35.5 M 22 33 L 19 36.5 M 22 33.5 L 25 37 M 19.8 34.8 l -1.4 0.6',
        c.bark,
        0.8,
      )}
      {limb('M 22 31 V 25', c.bark, 1.3)}
      {lit(ell(22, 22, 4.2, 3.8), c.life, 0.9)}
      {step === 1 ? (
        <>
          <Circle cx={8} cy={8} r={4.2} fill={c.sunDisk} {...o(0.9)} />
          {line(
            'M 8 1.5 V 2.5 M 14.5 8 H 13.5 M 1.5 8 H 2.5 M 8 14.5 V 13.5 M 12.6 3.4 l -0.7 0.7 M 3.4 12.6 l 0.7 -0.7 M 3.4 3.4 l 0.7 0.7 M 12.6 12.6 l -0.7 -0.7',
            c.sunRay,
            1.2,
          )}
          {[5, 10.5, 15].map((x) => (
            <G key={x}>
              {line(
                `M ${x} 29.5 C ${x - 2} 27 ${x + 2} 24.5 ${x} 22 C ${x - 1.5} 20.5 ${x + 1} 19.5 ${x} 18.5`,
                c.water,
                1.2,
              )}
              {head(x, 17.6, -90, c.water, 2)}
            </G>
          ))}
        </>
      ) : null}
      {step === 2 ? (
        <>
          {line(
            'M 32.5 11 l -1.2 4 M 36 11 l -1.2 4 M 39.5 11 l -1.2 4 M 43 11 l -1.2 4 M 34.3 15 l -0.8 2.6 M 41.2 15.3 l -0.8 2.6',
            c.water,
            1.2,
          )}
          {lit(
            'M 30 10.5 C 28 10.5 27.5 7 30.5 6.5 C 31 3.5 35 2.5 37 4.5 C 39 1.5 44 3 43.5 6.5 C 46.5 7 46 10.5 43.5 10.5 Z',
            c.furGrey,
            0.9,
          )}
        </>
      ) : null}
      {step === 3 ? (
        <>
          <Path d={drop(17.5, 27, 2.2)} fill={c.water} />
          <Path d={drop(27.5, 26, 2.2)} fill={c.water} />
          {[
            [18.5, 34],
            [25.5, 35.5],
            [21.5, 39.5],
          ].map(([x, y]) => (
            <Path key={x} d={drop(x!, y!, 1.8)} fill={c.water} stroke={ink} strokeWidth={0.4} />
          ))}
        </>
      ) : null}
      {step === 4 ? (
        <>
          {limb('M 35.5 17 C 34 21 33 25 30.5 28.5 C 29 30.5 26 31 20 31', c.water, 1.8)}
          {head(15.8, 31.6, 175, c.waterDeep, 2.6)}
        </>
      ) : null}
    </>
  );

  /** The granite mountain and the slope below it (s.6.rock-cycle~sandstone, steps 1 and 2). */
  const granite = (
    <>
      {lit('M 2 35 C 16 35 28 36 34 38.5 C 38 40 42 41.5 46 42 V 45 H 2 Z', c.life, 1)}
      {lit('M 3 36 L 13 7 L 17 12 L 21 10 L 31 36.5 Z', c.rock6)}
      {shaded('M 13 7 L 17 12 L 21 10 L 31 36.5 H 20 L 17 24 L 16 13 Z')}
      {[
        [9, 27],
        [12, 19],
        [15, 30],
        [18, 20],
        [22, 27],
        [25, 32],
        [14, 13],
        [19, 14],
        [8, 32],
      ].map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={0.75} fill={i % 3 ? c.rubber : c.snow} />
      ))}
      {line('M 11 22 l 2.5 2 l -0.5 3 M 21 18 l 2 3 M 17 30 l 2.5 1.5', ink, 0.7, 0.7)}
    </>
  );

  /** The lake's cut-away (steps 3 and 4): water above, layers on its floor. */
  const lakeCut = (layers: [number, number, string][], art: ReactNode) => (
    <>
      <Defs>
        <ClipPath id={ids.frame}>
          <Rect x={4} y={4} width={40} height={40} rx={2} />
        </ClipPath>
      </Defs>
      <G clipPath={url(ids.frame)}>
        <Rect x={4} y={10} width={40} height={34} fill={url(ids.sea)} />
        {line('M 4 10 H 44', c.waterDeep, 1)}
        {layers.map(([y0, y1, fill]) => (
          <Rect
            key={y0}
            x={4}
            y={y0}
            width={40}
            height={y1 - y0}
            fill={fill}
            stroke={ink}
            strokeWidth={0.6}
          />
        ))}
        <Rect
          x={4}
          y={layers[layers.length - 1]![0]}
          width={40}
          height={34}
          fill={url(ids.light)}
        />
        {art}
      </G>
      <Rect x={4} y={4} width={40} height={40} rx={2} fill="none" {...o(1)} />
    </>
  );

  let art: ReactNode = null;
  switch (icon) {
    // ── Shared landforms and water ────────────────────────────────────────────
    case 'leafy tree':
      art = (
        <>
          {ground(24, 43.5, 12)}
          {lit('M 21 43.5 C 22.5 38 22.5 32 22 25 H 26 C 25.5 32 25.5 38 27 43.5 Z', c.bark)}
          {limb('M 24 31 L 17.5 25.5', c.bark, 1.5)}
          {limb('M 24.5 29.5 L 31 24', c.bark, 1.5)}
          {lit(ell(14, 21, 8, 7.5), c.lifeDeep)}
          {lit(ell(34, 21, 8, 7.5), c.lifeDeep)}
          {lit(ell(24, 13, 11, 9.5), c.life)}
          {lit(ell(19, 24, 7, 5.5), c.life)}
          {lit(ell(29.5, 24, 7, 5.5), c.life)}
        </>
      );
      break;
    case 'mountain':
      art = mountain(false);
      break;
    case 'snowy mountain':
      art = mountain(true);
      break;
    case 'ocean':
      art = (
        <>
          <Path d="M 2 14 H 46 V 39.5 Q 24 44.5 2 39.5 Z" fill={url(ids.sea)} {...o()} />
          {[6, 14, 22, 30, 38].map((x) => crest(x, 19, 4))}
          {[3, 14, 25, 36].map((x) => crest(x + 1, 26, 7))}
          {[2, 17, 31].map((x) => crest(x + 1, 34.5, 11))}
          <Path d="M 2 14 H 46 V 39.5 Q 24 44.5 2 39.5 Z" fill={url(ids.round)} />
        </>
      );
      break;
    case 'river':
      art = landWith(
        c.life,
        <>
          {lit(
            'M 26.5 12 C 22 18 33 22 25 28 C 18 33 9 36 9 46 H 25 C 25 38 33 35 37 29 C 41 22 31 18 30.5 12 Z',
            c.water,
            1,
          )}
          {line('M 29 17 q 1 2 0 4 M 31 25 q -2 3 -5 4.5 M 20 35 q -3 2 -4 5', c.waterTop, 0.9)}
          {bush(10, 20, 2.6)}
          {bush(15.5, 17.5, 2.2)}
          {bush(40, 23, 2.6)}
          {bush(39.5, 35, 2.8)}
          {bush(7, 31, 2.4)}
        </>,
      );
      break;
    case 'lake':
      art = landWith(
        c.life,
        <>
          {pine(9, 20, 8)}
          {pine(13.5, 18.5, 9)}
          {pine(34.5, 18.5, 9)}
          {pine(39, 20, 7.5)}
          <Path d={ell(24, 29.5, 18.5, 9.8)} fill={c.rock1} {...o(0.8)} />
          <Path d={ell(24, 30, 17, 8.6)} fill={url(ids.sea)} {...o(0.9)} />
          {line('M 13 28 h 6 M 26 26 h 8 M 17 33 h 9 M 30 32 h 5', c.waterTop, 1)}
        </>,
      );
      break;
    case 'pond':
      art = landWith(
        c.life,
        <>
          <Path d={ell(24, 30, 12.5, 7)} fill={c.soil} {...o(0.8)} />
          <Path d={ell(24, 30.3, 11.3, 6)} fill={url(ids.sea)} {...o(0.9)} />
          {[
            [19, 29.5, 2.3],
            [27.5, 32.5, 2.1],
            [29, 27.5, 1.7],
          ].map(([x, y, r]) => (
            <Path
              key={x}
              d={`M ${x} ${y} L ${x! + r!} ${y! - r! * 0.25} A ${r} ${r! * 0.6} 0 1 1 ${x! + r! * 0.8} ${y! + r! * 0.35} Z`}
              fill={c.lifeDeep}
              {...o(0.5)}
            />
          ))}
          <Circle cx={19} cy={29.3} r={1} fill={c.petal} />
          {[10, 12, 36.5, 38.5].map((x, i) => (
            <G key={x}>
              {line(`M ${x} 32 V ${i % 2 ? 22 : 20}`, c.lifeDeep, 0.9)}
              <Rect
                x={x - 0.9}
                y={i % 2 ? 22.5 : 20.5}
                width={1.8}
                height={4.2}
                rx={0.9}
                fill={c.furDark}
                stroke={ink}
                strokeWidth={0.4}
              />
            </G>
          ))}
        </>,
      );
      break;
    case 'glacier':
      art = (
        <>
          {ground(24, 43, 21)}
          {lit('M 12 20 L 24 7 L 36 20 Z', c.rock2, 0.9)}
          {lit('M 20 11.5 L 24 7 L 28 11.5 L 26 12.5 L 24 11 L 22 12.5 Z', c.snow, 0.7)}
          {lit('M 1 42 L 11 6 L 23 32 L 17 42 Z', c.rock2)}
          {lit('M 47 42 L 37 8 L 25 32 L 31 42 Z', c.rock2)}
          {shaded('M 47 42 L 37 8 L 36 20 L 40 42 Z')}
          {lit('M 11 6 L 14.5 13.5 L 12.5 12.5 L 10.5 14.5 L 8.8 14 Z', c.snow, 0.7)}
          {lit('M 37 8 L 40 15.5 L 38 14.5 L 36 16 L 34.3 13.8 Z', c.snow, 0.7)}
          {lit(
            'M 17.5 17 C 21 14.5 27 14.5 30.5 17 C 31.5 25 34.5 33 39 40.5 C 30 44 18 44 9 40.5 C 13.5 33 16.5 25 17.5 17 Z',
            c.snow,
          )}
          <Path
            d="M 17.5 17 C 21 14.5 27 14.5 30.5 17 C 31.5 25 34.5 33 39 40.5 C 30 44 18 44 9 40.5 C 13.5 33 16.5 25 17.5 17 Z"
            fill={c.waterTop}
            fillOpacity={0.35}
          />
          {line(
            'M 18.5 23 Q 21 24.5 23 23 M 25.5 22.5 Q 27.5 24 30 22.5 M 16 30 Q 19 32 22 30 M 26 30.5 Q 29 32 32.5 30 M 13.5 37 Q 17 39 21 37 M 27 37.5 Q 31 39 35.5 36.5',
            c.glassEdge,
            0.9,
          )}
          {line('M 24 17 C 24 26 24 34 24 42', c.rock5, 0.9, 0.7)}
        </>
      );
      break;

    // ── Land and water on a map ───────────────────────────────────────────────
    case 'hill':
      art = (
        <>
          {ground(24, 43, 21)}
          {lit('M 3 42 C 9 25 16 18 25 18 C 34 18 41 26 45 42 Z', c.life)}
          {line(
            'M 12 32 l 1 -2 l 1 2 M 30 27 l 1 -2 l 1 2 M 20 36 l 1 -2 l 1 2 M 36 35 l 1 -2 l 1 2',
            c.lifeDeep,
            0.9,
          )}
          {bush(27, 12.5, 4.2)}
        </>
      );
      break;
    case 'valley':
      art = (
        <>
          {ground(24, 43, 21)}
          {lit(
            'M 2 8 C 9 10 14 22 19 33 C 21 37 27 37 29 33 C 34 22 39 10 46 8 V 42.5 Q 24 45 2 42.5 Z',
            c.life,
          )}
          {shaded('M 2 8 C 9 10 14 22 19 33 C 20 35.5 22 36.5 24 36.8 V 42 H 2 Z', 0.14)}
          {line('M 17 42.5 C 20 39 22 38 24 37 C 27 36 30 37 33 42.5', c.rock1, 1.6)}
          {pine(10, 22, 6)}
          {pine(37, 20, 6)}
          {pine(40.5, 24, 5.5)}
          {bush(28, 37.5, 1.8)}
        </>
      );
      break;
    case 'island':
      art = (
        <>
          <Path d="M 2 30 H 46 V 40 Q 24 44.5 2 40 Z" fill={url(ids.sea)} {...o()} />
          {lit('M 8 31.5 C 12 23 20 21 26 21 C 32 21 37 24 41 31.5 Z', c.rock1)}
          {lit('M 13 25.5 C 18 21 30 20 35.5 25.5 C 28 23.5 20 23.5 13 25.5 Z', c.life, 0.7)}
          {limb('M 24 23 C 24 17 26 12 30 8.5', c.bark, 1.5)}
          {[
            'M 30 8.5 C 26 5 20.5 6 18 10.5 C 22 8.5 26 8.5 30 8.5 Z',
            'M 30 8.5 C 33 4 39 4 42 8 C 38 7 34 7.5 30 8.5 Z',
            'M 30 8.5 C 34 9 38 12 39 16 C 36 13 33 11 30 8.5 Z',
            'M 30 8.5 C 27 10 24 13 23.5 17 C 26 13.5 28 11 30 8.5 Z',
          ].map((d) => (
            <G key={d}>{lit(d, c.lifeDeep, 0.8)}</G>
          ))}
          {line('M 5 34 h 5 M 38 34 h 5 M 16 37.5 h 7 M 28 38 h 6', c.waterTop, 1)}
        </>
      );
      break;

    // ── Fast and slow changes to the land ─────────────────────────────────────
    case 'earthquake crack':
      art = (
        <>
          {ground(24, 44, 21)}
          {lit('M 5 19 H 23 L 26 25 L 22 30.5 L 25 36.5 L 23 42.5 H 5 Z', c.soil)}
          {lit('M 26 22.5 H 43 V 45 H 26 L 28 39 L 25 33.5 L 29 28 Z', c.soil)}
          <Path
            d="M 23 19 L 26 25 L 22 30.5 L 25 36.5 L 23 42.5 H 26 L 28 39 L 25 33.5 L 29 28 L 26 22.5 Z"
            fill={c.rubber}
            fillOpacity={0.7}
          />
          {lit('M 5 19 H 23 L 24.3 21.8 H 5 Z', c.life, 0.8)}
          {lit('M 26 22.5 H 43 V 25.3 H 27.4 Z', c.life, 0.8)}
          {line(
            'M 9 29 l 1.2 0 M 15 35 l 1.4 0.3 M 33 32 l 1.2 0 M 38 39 l 1.3 0.3 M 11 39.5 l 1 0',
            c.soilDark,
            1.3,
          )}
          {line('M 3.5 22 Q 1.5 26 3.5 30 M 1.5 20 Q -0.5 26 1.5 32', ink, 0.9)}
          {line('M 44.5 26 Q 46.5 30 44.5 34 M 46.5 24 Q 48.5 30 46.5 36', ink, 0.9)}
          {line('M 20 14 l -1.5 -2.5 M 25 12.5 V 9.5 M 30 14.5 l 1.5 -2.5', ink, 0.9)}
        </>
      );
      break;
    case 'erupting volcano':
      art = (
        <>
          {ground(24, 43.5, 21)}
          {lit('M 3 43 L 17 20 C 20 19 28 19 31 20 L 45 43 Z', c.rock5)}
          {shaded('M 27.5 20 L 31 20 L 45 43 H 30 Z')}
          <Ellipse cx={24} cy={20} rx={7} ry={1.6} fill={c.orange} {...o(0.8)} />
          {limb('M 20 20.5 C 19 25 21 28 18.5 32 C 17 35 18 37.5 16 41', c.orange, 1.8)}
          {limb('M 28.5 20.5 C 29.5 25 27.5 29 30 33.5', c.orange, 1.6)}
          {line('M 20 21.5 C 19.3 25 20.7 28 18.5 31.5', c.chartSecond, 0.7)}
          {lit('M 20.5 20 C 21 16 22.5 13.5 24 12 C 25.5 13.5 27 16 27.5 20 Z', c.orange, 0.8)}
          <Path
            d="M 22.5 19.5 C 22.8 17 23.3 15.5 24 14.5 C 24.7 15.5 25.2 17 25.5 19.5 Z"
            fill={c.chartSecond}
          />
          {[
            [19, 13, 1.3],
            [29, 12, 1.4],
            [16.5, 16, 1],
            [31.5, 16, 1],
          ].map(([x, y, r]) => (
            <Circle key={x} cx={x} cy={y} r={r} fill={c.orange} {...o(0.5)} />
          ))}
          {lit(
            'M 14 10 C 11 10 11 6 14 5.5 C 14.5 2.5 18.5 1.5 20.5 3.5 C 22.5 1 27 1 28.5 3.5 C 31 1.5 35 3 34.5 6 C 37.5 6.5 37 10 34 10 C 31 11 28 9 26 10 C 24 11 22 11 20 10 C 18 11 16 11 14 10 Z',
            c.furGrey,
            0.9,
          )}
        </>
      );
      break;
    case 'landslide':
      art = (
        <>
          {lit('M 2 9 C 8 9 14 11 20 19 C 26 27 34 33 46 35.5 V 42.5 Q 24 45 2 42.5 Z', c.life)}
          <Path
            d="M 11 11.5 C 16 12.5 20 17 23 22 C 25.5 26 28.5 29.5 32 31.5 C 27 32.5 22 30 19 26 C 15.5 21.5 12.5 16.5 11 11.5 Z"
            fill={c.soil}
            {...o(0.8)}
          />
          {line('M 26 17.5 l -4 -3 M 33 22.5 l -4 -3 M 38.5 27 l -3.5 -2.5', ink, 0.9)}
          {[
            [26, 20.5, 2.3],
            [32.5, 25.5, 2.8],
            [38.5, 30, 2.3],
            [41, 33.3, 2],
            [44.5, 34, 1.8],
            [42.8, 30.8, 1.6],
          ].map(([x, y, r]) => (
            <G key={x}>{lit(ell(x!, y!, r!, r! * 0.8), c.rock2, 0.8)}</G>
          ))}
        </>
      );
      break;
    case 'flooded road':
      art = (
        <>
          {lit('M 5 21 H 19 V 38 H 5 Z', c.paper)}
          {lit('M 2.5 22 L 12 12 L 21.5 22 Z', c.blockRed)}
          <Rect x={7.5} y={24} width={4.5} height={4} fill={c.waterTop} {...o(0.7)} />
          {limb('M 38 36 V 22', c.bark, 1.8)}
          {lit(ell(38, 16, 6.5, 6), c.lifeDeep)}
          {limb('M 28 38 V 24', c.metalDark, 0.8)}
          <Path d="M 28 17 L 32 21 L 28 25 L 24 21 Z" fill={c.chartSecond} {...o(0.8)} />
          <Path
            d="M 2 30 Q 8 28 14 30 T 26 30 T 38 30 T 46 30 V 41.5 Q 24 45.5 2 41.5 Z"
            fill={c.water}
            fillOpacity={0.88}
            {...o()}
          />
          {line(
            'M 4 34 q 3 -1.5 6 0 M 20 33 q 3 -1.5 6 0 M 33 35 q 3 -1.5 6 0 M 12 38.5 q 3 -1.5 6 0 M 28 39 q 3 -1.5 6 0',
            c.waterTop,
            0.9,
          )}
        </>
      );
      break;
    case 'river canyon': {
      const bands: [number, number, string][] = [
        [9, 15, c.rock4],
        [15, 21, c.rock1],
        [21, 28, c.rock6],
        [28, 35, c.rock5],
        [35, 43, c.rock2],
      ];
      const left = '13 9 L 14.5 15 L 17 15.5 L 18 21 L 19.5 28 L 21.5 28.5 L 21.8 35 L 21 40';
      const right = '27 40 L 26.2 35 L 26.5 28.5 L 28.5 28 L 30 21 L 31 15.5 L 33.5 15 L 35 9';
      art = (
        <>
          {ground(24, 43, 21)}
          {bands.map(([y0, y1, fill]) => (
            <Rect key={y0} x={2} y={y0} width={44} height={y1 - y0} fill={fill} />
          ))}
          <Rect x={2} y={9} width={44} height={34} fill={url(ids.light)} />
          <Path d={`M ${left} L ${right} Z`} fill={c.shade} fillOpacity={0.3} />
          <Path d="M 21.2 37.5 H 26.8 L 27 40 H 21 Z" fill={c.water} {...o(0.6)} />
          {line('M 2 9 H 13 M 35 9 H 46', c.lifeDeep, 1.8)}
          <Path d={`M 2 9 H ${left} H ${right} H 46 V 43 H 2 Z`} fill="none" {...o()} />
        </>
      );
      break;
    }
    case 'wind shaping dune':
      art = (
        <>
          {dune}
          {line('M 3 13 C 9 11 14 13.5 21 11.5', ink, 1)}
          {head(21.5, 11.3, -12, ink, 2)}
          {line('M 7 20 C 12 18 16 19.5 22 17.5', ink, 1)}
          {head(22.5, 17.3, -15, ink, 2)}
          {grains(
            [
              [31.5, 16.5],
              [34, 15.5],
              [36.5, 16.8],
              [38.5, 15],
              [41, 16.3],
            ],
            0.7,
          )}
        </>
      );
      break;
    case 'ice cracking rock':
      art = (
        <>
          {ground(24, 41, 20)}
          {lit('M 6 40 C 3 30 6 18 16 14 L 22 13 L 23.5 22 L 22 30 L 24 40 Z', c.rock2)}
          {lit(
            'M 26 13 C 36 12 44 20 43 30 C 42.5 36 38 40 30 40 H 27 L 25 30 L 26.5 22 Z',
            c.rock2,
          )}
          {shaded(
            'M 26 13 C 36 12 44 20 43 30 C 42.5 36 38 40 30 40 H 34 C 38 34 39 22 26 13 Z',
            0.12,
          )}
          <Path d="M 22 30 L 24 40 H 27 L 25 30 Z" fill={c.rubber} fillOpacity={0.75} />
          {lit('M 21.5 12 L 26.5 12 L 26.5 22 L 25 30 H 22 L 23.5 22 Z', c.waterTop, 0.8)}
          {line('M 23.8 14 L 24.8 21', c.snow, 0.9)}
          {flake(10, 7)}
          {flake(38, 6)}
          {flake(44, 11, 1.5)}
        </>
      );
      break;
    case 'waves at cliff':
      art = (
        <>
          {lit('M 22 8 H 46 V 44 H 26 L 25 35 C 29 34 30 30 28 28 L 24 27 Z', c.rock4)}
          {line('M 22.7 14 H 46 M 23.4 20 H 46 M 29 30 H 46 M 26 38 H 46', c.rock5, 0.8)}
          {lit('M 22 8 H 46 V 10.5 H 22.3 Z', c.life, 0.8)}
          {lit(ell(21.5, 39.5, 2.6, 2), c.rock5, 0.8)}
          <Path d="M 2 31 H 30 V 42 Q 16 45.5 2 42 Z" fill={url(ids.sea)} {...o()} />
          {lit(
            'M 8 31.5 C 13 30 17 28 20 25 C 23.5 22 28 23.5 28 28 C 26 26 23 26.5 22.5 30 C 20 31 14 32 8 31.5 Z',
            c.water,
            0.9,
          )}
          {line('M 21 25.5 C 23.5 23.3 27 24 27.8 27.5', c.snow, 1.2)}
          {[
            [26, 20.5],
            [29.5, 22],
            [23.5, 19.5],
            [28, 18.5],
          ].map(([x, y]) => (
            <Circle
              key={x}
              cx={x}
              cy={y}
              r={0.9}
              fill={c.snow}
              stroke={c.waterDeep}
              strokeWidth={0.4}
            />
          ))}
          {line('M 4 36 q 3 -1.5 6 0 M 13 39 q 3 -1.5 6 0', c.waterTop, 0.9)}
        </>
      );
      break;

    // ── Solid and liquid water ────────────────────────────────────────────────
    case 'iceberg':
      art = (
        <>
          <Path
            d="M 9 22 H 39 L 43 30 L 37 40 L 20 42 L 8 33 Z"
            fill={c.snow}
            stroke={c.glassEdge}
            strokeWidth={0.8}
          />
          <Path d="M 2 22 H 46 V 40 Q 24 45 2 40 Z" fill={c.water} fillOpacity={0.62} {...o()} />
          {lit('M 12 22 L 16 13 L 20.5 15 L 25 6 L 31 14 L 34.5 12 L 38 22 Z', c.snow)}
          <Path
            d="M 25 6 L 31 14 L 34.5 12 L 38 22 H 28 L 26 13 Z"
            fill={c.waterTop}
            fillOpacity={0.5}
          />
          {line('M 2 22 H 12 M 38 22 H 46', c.waterDeep, 1)}
          {line('M 4 26 h 4 M 40 27 h 4 M 5 36 h 3', c.waterTop, 1)}
        </>
      );
      break;
    case 'frozen pond':
      art = landWith(
        c.snow,
        <>
          {pine(8, 22, 8, c.lifeDeep)}
          {pine(40, 21, 7, c.lifeDeep)}
          <Path d={ell(24, 30.5, 17, 8.5)} fill={c.waterTop} {...o(0.9)} />
          <Path d={ell(24, 30.5, 17, 8.5)} fill={url(ids.round)} />
          {line('M 13 27 l 4 -2 M 16 30 l 6 -3 M 30 34 l 5 -2.5', c.snow, 1)}
          {line('M 10 33 C 15 37 23 36.5 25.5 31.5', c.glassEdge, 0.7)}
          {limb('M 28.5 20.5 L 26.5 28', c.furDark, 1.3)}
          {limb('M 31 20.5 L 35 26.5', c.furDark, 1.3)}
          {line('M 24.5 28.7 H 29 M 33.5 27.6 L 37.2 27.9', c.metalDark, 1)}
          {limb('M 28.3 15 L 23 18', c.blockRed, 1.3)}
          {limb('M 31.5 15 L 36.5 17', c.blockRed, 1.3)}
          {lit('M 27.5 13.5 C 28 12.5 31.5 12.5 32 13.5 L 32.5 21.5 H 27 Z', c.blockRed, 0.8)}
          {lit(ell(29.8, 10.3, 2.3, 2.3), c.skin, 0.7)}
          <Path d="M 27.5 9.8 C 27.5 6.5 32 6.5 32 9.8 Z" fill={c.blockBlue} {...o(0.6)} />
        </>,
      );
      break;
    case 'puddle':
      art = (
        <>
          {lit('M 2 25 C 14 22 34 22 46 25 V 41.5 Q 24 45 2 41.5 Z', c.soil)}
          {lit(
            'M 8 33 C 8 29 15 28 21.5 29 C 28 27 38.5 28 39.5 32 C 40.5 36 33 38 26 37 C 20 39 8 38 8 33 Z',
            c.water,
            0.9,
          )}
          <Path d={ell(22, 33, 3.5, 1.1)} fill="none" stroke={c.waterTop} strokeWidth={0.8} />
          <Path d={ell(22, 33, 7.5, 2.4)} fill="none" stroke={c.waterTop} strokeWidth={0.7} />
          {line('M 31 30.5 h 4', c.snow, 0.9)}
          {[
            [16, 11, 2],
            [29, 7, 2],
            [36, 16, 1.8],
            [22, 18, 2.1],
            [9, 19, 1.7],
          ].map(([x, y, s]) => (
            <Path key={x} d={drop(x!, y!, s!)} fill={c.water} stroke={ink} strokeWidth={0.4} />
          ))}
          {[
            [6, 29, 1.3],
            [42, 36, 1.4],
            [14, 40, 1],
          ].map(([x, y, r]) => (
            <G key={x}>{lit(ell(x!, y!, r!, r! * 0.7), c.rock2, 0.6)}</G>
          ))}
        </>
      );
      break;

    // ── How the rock layers formed ────────────────────────────────────────────
    case 'sand layer under water':
      art = strata(1);
      break;
    case 'mud on sand':
      art = strata(2);
      break;
    case 'shell layer on mud':
      art = strata(3);
      break;
    case 'layers pushed up':
      art = strata(4);
      break;
    case 'river cutting layers':
      art = strata(5);
      break;

    // ── Earth's spheres ───────────────────────────────────────────────────────
    case 'soil clump':
      art = (
        <>
          {ground(24, 40.5, 18)}
          {lit(
            'M 6 19 C 14 16 34 16 42 19 C 44 26 43 33 40 37 C 32 42 16 42 8 37 C 5 33 4 26 6 19 Z',
            c.soil,
          )}
          {line(
            'M 18 21 C 17 26 19 29 17 33 M 18 25 l -3 3 M 30 21 C 31 26 29 30 31 34 M 30.5 27 l 3 2',
            c.bark,
            0.9,
          )}
          {line('M 22 30 c 2 -2 4 2 6 0 c 1 -1 2 -1 2.5 0', c.petal, 1.5)}
          {[
            [12, 30, 1.8],
            [36, 25, 1.5],
            [26, 36, 1.6],
          ].map(([x, y, r]) => (
            <G key={x}>{lit(ell(x!, y!, r!, r! * 0.7), c.rock2, 0.6)}</G>
          ))}
          {line(
            'M 10 24 h 0.5 M 24 24 h 0.5 M 34 32 h 0.5 M 15 35 h 0.5 M 38 29 h 0.5 M 20 33 h 0.5',
            c.soilDark,
            1.4,
          )}
          {lit('M 6 19 C 14 16 34 16 42 19 C 34 22.5 14 22.5 6 19 Z', c.lifeDeep, 0.9)}
          {line(
            'M 10 19 l -1 -5 M 13 18.5 l 1 -6 M 17 18 l -0.5 -4.5 M 21 18 l 1.5 -5 M 26 18 l -1 -6 M 30 18 l 1 -4.5 M 34 18.5 l -1 -5 M 38 19 l 1 -4',
            c.lifeDeep,
            1.2,
          )}
        </>
      );
      break;
    case 'sand dune':
      art = dune;
      break;

    // ── Water moving through the spheres ──────────────────────────────────────
    case 'ocean water evaporating':
      art = spheres(1);
      break;
    case 'rain on mountain':
      art = spheres(2);
      break;
    case 'rain soaking into soil':
      art = spheres(3);
      break;
    case 'river to the sea':
      art = spheres(4);
      break;

    // ── From mountain to sandstone ────────────────────────────────────────────
    case 'granite crumbling':
      art = (
        <>
          {granite}
          {[
            [28.5, 25],
            [31, 29.5],
          ].map(([x, y]) => (
            <Path
              key={x}
              d={`M ${x} ${y} l 2 -0.5 l 0.8 1.6 l -1.8 1 Z`}
              fill={c.rock6}
              {...o(0.5)}
            />
          ))}
          {grains([
            [30, 34],
            [32, 35],
            [34, 35.5],
            [31, 36.3],
            [33, 36.8],
            [35.5, 37],
            [29, 32],
            [33.5, 31.5],
          ])}
        </>
      );
      break;
    case 'river carrying sand':
      art = (
        <>
          {granite}
          {limb('M 24 37 C 30 37.5 35 40 39 42 C 42 43.3 44 43.7 47 44', c.water, 2.4)}
          {grains(
            [
              [28, 37.5],
              [32, 38.6],
              [36, 40.6],
              [40, 42.6],
              [43.5, 43.6],
            ],
            0.6,
          )}
          {[
            [8, 3, 1.7],
            [16, 2.5, 1.7],
            [24, 4, 1.7],
          ].map(([x, y, s]) => (
            <Path
              key={x}
              d={drop(x!, y! + 1.5, s!)}
              fill={c.water}
              stroke={ink}
              strokeWidth={0.4}
            />
          ))}
        </>
      );
      break;
    case 'sand settling in lake':
      art = lakeCut(
        [
          [40, 44, c.rock2],
          [38, 40, c.rock1],
          [35, 38, c.rock1],
        ],
        <>
          {grains(
            [
              [8, 36.5],
              [14, 39],
              [20, 36.8],
              [27, 39.2],
              [33, 36.4],
              [39, 38.8],
            ],
            0.6,
            c.rock4,
          )}
          {grains([
            [9, 15],
            [16, 21],
            [23, 14],
            [30, 19],
            [37, 13],
            [12, 28],
            [26, 27],
            [36, 25],
            [20, 32],
            [40, 31],
          ])}
        </>,
      );
      break;
    case 'layers squeezing sand':
      art = lakeCut(
        [
          [40, 44, c.rock2],
          [37, 40, c.rock1],
          [33, 37, c.rock5],
          [29, 33, c.rock1],
          [25, 29, c.rock4],
          [21, 25, c.rock6],
        ],
        <>
          {grains(
            [6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42].map(
              (x, i) => [x, i % 2 ? 38 : 39] as [number, number],
            ),
            0.65,
            c.rock4,
          )}
          {arrow(12, 11, 12, 20, ink)}
          {arrow(24, 11, 24, 20, ink)}
          {arrow(36, 11, 36, 20, ink)}
        </>,
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
        <LinearGradient id={ids.sea} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={c.water} />
          <Stop offset="1" stopColor={c.waterDeep} />
        </LinearGradient>
        <ClipPath id={ids.land}>
          <Path d={LAND} />
        </ClipPath>
      </Defs>
      {art}
    </G>
  );
}
