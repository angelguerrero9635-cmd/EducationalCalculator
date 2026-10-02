/**
 * The sun’s planets and Earth’s moon in their own colors, lit from the top left, with their
 * real sizes: radii in km from NASA’s planetary fact sheet (reference only).
 */
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

import type { PlanetName } from '@/data/modules/typesPhysics8';
import { usePalette, type Palette } from '@/theme';

import { usePaintIds, url } from './paint';

/** Mean radius in km. */
export const RADIUS_KM: Record<PlanetName | 'sun', number> = {
  sun: 695700,
  mercury: 2439.7,
  venus: 6051.8,
  earth: 6371,
  moon: 1737.4,
  mars: 3389.5,
  jupiter: 69911,
  saturn: 58232,
  uranus: 25362,
  neptune: 24622,
};
/** The outer edge of Saturn’s bright rings (the A ring), km from its center. */
export const SATURN_RING_KM = 136775;

export const PLANET_LABEL: Record<PlanetName, string> = {
  mercury: 'Mercury',
  venus: 'Venus',
  earth: 'Earth',
  moon: 'Moon',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  uranus: 'Uranus',
  neptune: 'Neptune',
};

const colorOf = (c: Palette, name: PlanetName) =>
  ({
    mercury: c.planetMercury,
    venus: c.planetVenus,
    earth: c.water,
    moon: c.moonLit,
    mars: c.planetMars,
    jupiter: c.planetJupiter,
    saturn: c.planetSaturn,
    uranus: c.planetUranus,
    neptune: c.planetNeptune,
  })[name];

/**
 * One planet (or the moon) centered on (x, y), radius `r` px: a lit ball in its color, Earth
 * with land, Jupiter with bands and Saturn with its rings (tilted, the back half behind).
 */
export function Planet({
  name,
  x,
  y,
  r,
  faded,
}: {
  name: PlanetName;
  x: number;
  y: number;
  r: number;
  faded?: boolean;
}) {
  const c = usePalette();
  const ids = usePaintIds('ball', 'clip');
  const ringRx = (r * SATURN_RING_KM) / RADIUS_KM.saturn;
  const ring = (half: 'back' | 'front') => (
    <Path
      d={`M ${x - ringRx} ${y} A ${ringRx} ${ringRx * 0.28} 0 0 ${half === 'back' ? 1 : 0} ${x + ringRx} ${y}`}
      stroke={c.planetSaturn}
      strokeWidth={Math.max(1.5, r * 0.28)}
      strokeOpacity={0.85}
      fill="none"
    />
  );
  const inner = (half: 'back' | 'front') => (
    <Path
      d={`M ${x - ringRx * 0.78} ${y} A ${ringRx * 0.78} ${ringRx * 0.22} 0 0 ${half === 'back' ? 1 : 0} ${x + ringRx * 0.78} ${y}`}
      stroke={c.planetJupiterBand}
      strokeWidth={Math.max(1, r * 0.16)}
      strokeOpacity={0.6}
      fill="none"
    />
  );
  return (
    <G opacity={faded ? 0.45 : 1}>
      <Defs>
        {/* Shine at the top left, shade toward the far side: laid over the surface marks. */}
        <RadialGradient id={ids.ball} cx="0.38" cy="0.34" r="0.75" fx="0.3" fy="0.26">
          <Stop offset="0" stopColor={c.shine} stopOpacity={0.55 * c.sheen} />
          <Stop offset="0.45" stopColor={c.shine} stopOpacity={0} />
          <Stop offset="0.8" stopColor={c.shade} stopOpacity={0.18} />
          <Stop offset="1" stopColor={c.shade} stopOpacity={0.4} />
        </RadialGradient>
        <ClipPath id={ids.clip}>
          <Circle cx={x} cy={y} r={r} />
        </ClipPath>
      </Defs>
      {name === 'saturn' ? (
        <>
          {ring('back')}
          {inner('back')}
        </>
      ) : null}
      <Circle cx={x} cy={y} r={r} fill={colorOf(c, name)} />
      {/* Surface marks, clipped to the ball. */}
      <G clipPath={url(ids.clip)}>
        {name === 'earth' ? (
          <>
            <Ellipse
              cx={x - r * 0.3}
              cy={y - r * 0.2}
              rx={r * 0.35}
              ry={r * 0.5}
              fill={c.lifeDeep}
            />
            <Ellipse
              cx={x + r * 0.45}
              cy={y + r * 0.3}
              rx={r * 0.3}
              ry={r * 0.22}
              fill={c.lifeDeep}
            />
            <Rect x={x - r} y={y - r} width={2 * r} height={r * 0.22} fill={c.snow} />
          </>
        ) : null}
        {name === 'jupiter' || name === 'saturn'
          ? [-0.5, -0.15, 0.25, 0.55].map((t, i) => (
              <Rect
                key={t}
                x={x - r}
                y={y + t * r}
                width={2 * r}
                height={r * (i % 2 ? 0.12 : 0.18)}
                fill={c.planetJupiterBand}
                opacity={name === 'saturn' ? 0.35 : 0.7}
              />
            ))
          : null}
        {name === 'jupiter' ? (
          <Ellipse
            cx={x + r * 0.35}
            cy={y + r * 0.34}
            rx={r * 0.16}
            ry={r * 0.09}
            fill={c.planetMars}
          />
        ) : null}
        {name === 'mars' ? (
          <Rect x={x - r} y={y - r} width={2 * r} height={r * 0.2} fill={c.snow} opacity={0.8} />
        ) : null}
      </G>
      {/* Light from the top left. */}
      <Circle cx={x} cy={y} r={r} fill={url(ids.ball)} />
      {name === 'earth' ? (
        // A rim, so the white polar cap doesn't melt into a light page and read as cut off.
        <Circle
          cx={x}
          cy={y}
          r={r}
          fill="none"
          stroke={c.waterDeep}
          strokeOpacity={0.7}
          strokeWidth={1}
        />
      ) : null}
      {name === 'saturn' ? (
        <>
          {inner('front')}
          {ring('front')}
        </>
      ) : null}
    </G>
  );
}
