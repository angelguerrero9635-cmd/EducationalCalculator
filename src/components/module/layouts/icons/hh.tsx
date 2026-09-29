/**
 * Grades 9–12 card icons (group HH), 48 × 48 like every card icon, drawn in their materials with
 * the helpers in reps/paint.tsx. The names are listed in data/modules/layouts/icons/hh.ts.
 *
 * Homologous limbs (H38): a human arm, a bat's wing, a whale's flipper and a cat's foreleg, the
 * same bones in each colored alike (upper arm, the two forearm bones, the wrist, the hand and
 * fingers), inside the limb's skin, fur or membrane; and an insect's wing, which has no bones.
 */
import type { ReactNode } from 'react';
import { Circle, G, Path } from 'react-native-svg';

import { usePalette } from '@/theme';

import type { IconProps } from './types';

type Pt = [number, number];

export function HHIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  /** A bone: a thick round-ended stroke in its color with a thin ink edge. */
  const bone = (a: Pt, b: Pt, color: string, w: number, dash?: string) => (
    <G key={`${a}-${b}`}>
      <Path
        d={`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`}
        stroke={ink}
        strokeWidth={w + 1.2}
        strokeLinecap="round"
        strokeDasharray={dash}
      />
      <Path
        d={`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`}
        stroke={color}
        strokeWidth={w}
        strokeLinecap="round"
        strokeDasharray={dash}
      />
    </G>
  );
  const wrist = (pts: Pt[], r = 1.4) =>
    pts.map(([x, y]) => (
      <Circle
        key={`w${x}-${y}`}
        cx={x}
        cy={y}
        r={r}
        fill={c.limbWrist}
        stroke={ink}
        strokeWidth={0.6}
      />
    ));
  /** The limb's outline: skin, fur, membrane or blubber, faint so the bones read. */
  const flesh = (d: string, fill: string, opacity = 0.4) => (
    <Path
      d={d}
      fill={fill}
      fillOpacity={opacity}
      stroke={ink}
      strokeWidth={0.9}
      strokeLinejoin="round"
    />
  );
  switch (icon) {
    case 'human arm bones':
      return (
        <G>
          {flesh(
            'M 19 2 L 29 2 L 29.5 18 L 29 31 C 31 32 32.5 34 32 36 L 33 44 L 30 45 L 28.5 47 L 24 47.5 L 20 47 L 18.5 41 L 13.5 40 L 15 37 L 19 33 L 19 18 Z',
            c.skin,
          )}
          {bone([24, 4], [24, 16.5], c.limbUpper, 3.2)}
          {bone([22, 19.5], [21.3, 30], c.limbForearm, 1.9)}
          {bone([26, 19.5], [26.8, 30], c.limbForearm, 1.9)}
          {wrist([
            [21, 32.2],
            [24, 32],
            [27, 32.2],
            [22.5, 34.6],
            [25.5, 34.6],
          ])}
          {bone([20.2, 35], [15.5, 39.5], c.limbHand, 1.3)}
          {bone([22, 36.8], [20.3, 46], c.limbHand, 1.3)}
          {bone([24, 37], [24, 46.8], c.limbHand, 1.3)}
          {bone([26, 36.8], [27.8, 46], c.limbHand, 1.3)}
          {bone([27.8, 36], [31.2, 43.5], c.limbHand, 1.3)}
        </G>
      );
    case 'bat wing bones':
      return (
        <G>
          {flesh(
            'M 5 19 L 16 13 L 28 7.5 L 46.5 3.5 C 44 9 44 14 45 20.5 C 42 25 41 29 41 35 C 36 36 31 38 28 43 C 25 37 20 32 14 29 L 5 26 Z',
            c.furDark,
            0.35,
          )}
          {bone([6, 22], [16.5, 14.5], c.limbUpper, 2.6)}
          {bone([17, 14], [28.5, 8.8], c.limbForearm, 1.8)}
          {bone([17.8, 16], [28.8, 11], c.limbForearm, 1.1)}
          {wrist([[30, 10]], 1.8)}
          {bone([30.5, 8.5], [31.5, 4.5], c.limbHand, 1.1)}
          {bone([31.5, 9.6], [46, 4], c.limbHand, 1.2)}
          {bone([31.5, 10.6], [44.5, 20.5], c.limbHand, 1.2)}
          {bone([31, 11.5], [40.8, 34.5], c.limbHand, 1.2)}
          {bone([30.2, 11.8], [28, 42.5], c.limbHand, 1.2)}
        </G>
      );
    case 'whale flipper bones':
      return (
        <G>
          {flesh(
            'M 20 2 C 29 1.5 34 6 34.5 15 C 35 26 31 38 24.5 46.5 C 18 38 13.5 27 13.5 15 C 13.5 7 16 2.5 20 2 Z',
            c.furGrey,
            0.5,
          )}
          {bone([24, 4.5], [24, 11], c.limbUpper, 3.6)}
          {bone([22, 13.5], [21.6, 19], c.limbForearm, 2.5)}
          {bone([26, 13.5], [26.4, 19], c.limbForearm, 2.5)}
          {wrist([
            [20.6, 21.6],
            [23.6, 21.4],
            [26.6, 21.6],
          ])}
          {bone([19.5, 24.5], [18.2, 36], c.limbHand, 1.6, '3 1.2')}
          {bone([22.5, 24.8], [22, 43.5], c.limbHand, 1.6, '3 1.2')}
          {bone([25.5, 24.8], [26, 42], c.limbHand, 1.6, '3 1.2')}
          {bone([28.5, 24.5], [30.2, 34], c.limbHand, 1.6, '3 1.2')}
        </G>
      );
    case 'cat leg bones':
      return (
        <G>
          {flesh(
            'M 19 2 L 32 2 C 33 10 31 20 30.5 30 L 30.5 39 C 32 40.5 33 43 32.5 46 L 13 46 C 12 43 15 41.5 20 40.5 L 21.5 29 C 19.5 20 17.5 10 19 2 Z',
            c.fur,
            0.4,
          )}
          {bone([26.5, 3.5], [23.5, 17], c.limbUpper, 3)}
          {bone([23.2, 19.5], [24, 36], c.limbForearm, 1.8)}
          {bone([26.2, 19.5], [27.2, 36], c.limbForearm, 1.8)}
          {wrist([
            [24, 38.2],
            [27.2, 38.2],
          ])}
          {bone([23.5, 40.5], [16.5, 44.5], c.limbHand, 1.3)}
          {bone([25, 41], [19.8, 45], c.limbHand, 1.3)}
          {bone([26.6, 41], [23, 45.2], c.limbHand, 1.3)}
          {bone([28.2, 40.6], [26.5, 45], c.limbHand, 1.3)}
        </G>
      );
    case 'insect wing':
      return (
        <G>
          <Path
            d="M 4 31 C 9 16 28 6 44.5 7.5 C 46.5 14 39 26 23 32.5 C 15 35.5 8 35 4 31 Z"
            fill={c.glass}
            fillOpacity={0.85}
            stroke={ink}
            strokeWidth={1}
            strokeLinejoin="round"
          />
          {[
            'M 4 31 C 16 20 30 12 44 8',
            'M 4 31 C 16 27 28 22 40 16',
            'M 5 31 C 16 30 24 29 33 25',
            'M 14 23 L 21 31',
            'M 24 16 L 29 26',
            'M 33 11 L 36 20',
          ].map((d) => (
            <Path key={d} d={d} stroke={ink} strokeWidth={0.7} fill="none" opacity={0.8} />
          ))}
        </G>
      );
    default:
      return null;
  }
}
