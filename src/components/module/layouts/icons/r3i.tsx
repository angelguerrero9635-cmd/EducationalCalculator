/**
 * Round-3 card icons (group I), 48 × 48 like every card icon, drawn in their materials with the
 * helpers in reps/paint.tsx. The names are listed in data/modules/layouts/icons/r3i.ts. The
 * fruit also stand in a picture graph's columns (reps/PictureGraph.tsx), so each reads at a
 * glance down to about 30 pt.
 */
import type { ReactNode } from 'react';
import { Circle, Defs, Ellipse, G, Path, RadialGradient, Stop } from 'react-native-svg';

import { usePalette } from '@/theme';

import { url, usePaintIds } from '../../reps/paint';
import type { IconProps } from './types';

export function R3IIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  const ids = usePaintIds('round');
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

  let art: ReactNode = null;
  switch (icon) {
    case 'apple':
      art = (
        <>
          {/* Two round lobes meeting in a dip at the top and a smaller one at the bottom. */}
          {lit(
            'M 24 14 C 19 9 7 10 7 23 C 7 34 14 43 19 43 C 21 43 22.5 42 24 42 C 25.5 42 27 43 29 43 C 34 43 41 34 41 23 C 41 10 29 9 24 14 Z',
            c.blockRed,
          )}
          <Path d="M 24 15 C 24 11 25 7 27 4.5" fill="none" {...o(2.4)} stroke={c.woodDark} />
          <Path d="M 26 9 C 29 4 36 3 39 5 C 37 10 30 12 26 9 Z" fill={c.life} {...o(1.1)} />
          <Path d="M 27 8.5 C 31 7 34 6 38 5.2" fill="none" stroke={c.lifeDeep} strokeWidth={0.8} />
          <Ellipse cx={14.5} cy={21} rx={2.4} ry={4.2} fill={c.shine} fillOpacity={0.55} />
        </>
      );
      break;
    case 'banana':
      art = (
        <>
          {/* A curved fruit lying on its back, the stem up at the right, a brown tip at the left. */}
          {lit(
            'M 6 20 C 9 33 22 40 34 36 C 39 34 42 29 42 22 L 44 14 C 41 15 39 17 38.5 20 C 36 29 28 32 20 30 C 14 28.5 10 25 8 19 Z',
            c.spectrumYellow,
          )}
          <Path
            d="M 8.5 22 C 12 30 22 35 32 33 C 36 32 39 28 39.5 23"
            fill="none"
            stroke={c.copperDark}
            strokeOpacity={0.45}
            strokeWidth={1}
          />
          <Path d="M 42 22 L 44 14 L 46 14.8 L 43.8 22.6 Z" fill={c.woodDark} {...o(1)} />
          <Circle cx={6.8} cy={19.6} r={1.6} fill={c.woodDark} />
        </>
      );
      break;
    case 'grapes': {
      // A bunch: rows of round grapes narrowing to a point, a stem and a leaf on top.
      const rows: [number, number[]][] = [
        [16, [13, 21, 29, 37]],
        [23, [17, 25, 33]],
        [30, [13.5, 21, 29]],
        [37, [18, 26]],
        [43, [22]],
      ];
      art = (
        <>
          <Path d="M 25 12 C 25 8 24 5 22 3" fill="none" {...o(2.2)} stroke={c.woodDark} />
          <Path d="M 26 9 C 30 3 39 3 43 6 C 40 12 31 13 26 9 Z" fill={c.life} {...o(1.1)} />
          {rows.flatMap(([y, xs]) =>
            xs.map((x) => (
              <G key={`${x},${y}`}>
                <Circle cx={x} cy={y} r={4.6} fill={c.purple} {...o(1)} />
                <Circle cx={x} cy={y} r={4.6} fill={url(ids.round)} />
                <Circle cx={x - 1.6} cy={y - 1.7} r={1} fill={c.shine} fillOpacity={0.7} />
              </G>
            )),
          )}
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
      </Defs>
      {art}
    </G>
  );
}
