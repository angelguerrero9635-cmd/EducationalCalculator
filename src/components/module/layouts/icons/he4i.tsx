/**
 * College card icons, round 4, group I, 48 × 48 like every card icon. The names are listed in
 * data/modules/layouts/icons/he4i.ts.
 *
 * Evidence for evolution (HC143), drawn like group HH's limbs (each bone group in its own
 * color inside a faint outline of the body): a whale with the small vestigial pelvis ringed in
 * its belly; the large intestine with the appendix ringed below the cecum; a bird's wing (with
 * its arm bones) beside a butterfly's wing (veins, no bones); a shark's fin (fin rays, no arm
 * bones) beside a dolphin's flipper (arm bones). The analogous pairs share a job, not a build.
 */
import type { ReactNode } from 'react';
import { Circle, G, Line, Path } from 'react-native-svg';

import { usePalette } from '@/theme';

import type { IconProps } from './types';

type Pt = [number, number];

export function He4iIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  /** A bone: a thick round-ended stroke in its color with a thin ink edge. */
  const bone = (a: Pt, b: Pt, color: string, w: number) => (
    <G key={`${a}-${b}`}>
      <Path
        d={`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`}
        stroke={ink}
        strokeWidth={w + 1}
        strokeLinecap="round"
      />
      <Path
        d={`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`}
        stroke={color}
        strokeWidth={w}
        strokeLinecap="round"
      />
    </G>
  );
  /** A body's or a limb's outline, faint so the bones read. */
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
  /** The ring round the part a card is about. */
  const ring = (x: number, y: number, r: number) => (
    <Circle
      cx={x}
      cy={y}
      r={r}
      fill="none"
      stroke={c.chartHighlight}
      strokeWidth={1.4}
      strokeDasharray="2.5 1.5"
    />
  );
  /** The thin line between the two halves of a pair. */
  const divider = <Line x1={24} y1={4} x2={24} y2={44} stroke={ink} strokeWidth={0.5} />;

  switch (icon) {
    case 'whale pelvis':
      return (
        <G>
          {flesh(
            'M 2 23 C 3 15 13 11 25 12 C 33 13 39 17 42 20 L 46.5 15.5 C 47 19 46 22 44.5 23.5 C 46 25 47 28 46.5 31 L 42 26.5 C 37 31 30 34 22 34 C 11 34 2.5 30 2 23 Z',
            c.furGrey,
            0.5,
          )}
          <Path d="M 3 26 L 13 26.5" stroke={ink} strokeWidth={0.7} />
          <Circle cx={8} cy={21.5} r={0.9} fill={ink} />
          {/* The pectoral flipper. */}
          {flesh('M 14 30 C 16 33 17 37 15 40 C 13 37 12 34 12.5 31 Z', c.furGrey, 0.6)}
          {/* The vestigial pelvis and a nub of thigh bone, loose in the belly near the tail. */}
          {bone([31.5, 27], [35.5, 25.5], c.limbUpper, 1.6)}
          {bone([33.5, 26.5], [34.5, 29.5], c.limbForearm, 1.2)}
          {ring(33.5, 27.3, 5.5)}
        </G>
      );
    case 'human appendix':
      return (
        <G transform="translate(2 -3)">
          {/* The large intestine: up the right side of the body, across, and down. */}
          <Path
            d="M 13 36 L 13 13 Q 13 8 18 8 L 31 8 Q 36 8 36 13 L 36 41"
            stroke={ink}
            strokeWidth={8.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path
            d="M 13 36 L 13 13 Q 13 8 18 8 L 31 8 Q 36 8 36 13 L 36 41"
            stroke={c.organ}
            strokeWidth={6.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Its pouches. */}
          {[
            'M 10 18 L 16 18',
            'M 10 26 L 16 26',
            'M 21 5 L 21 11',
            'M 28 5 L 28 11',
            'M 33 20 L 39 20',
            'M 33 30 L 39 30',
          ].map((d) => (
            <Path key={d} d={d} stroke={ink} strokeWidth={0.6} opacity={0.6} />
          ))}
          {/* The small intestine joining the cecum. */}
          <Path
            d="M 27 34 C 22 37 19 36 16 35"
            stroke={ink}
            strokeWidth={4.2}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 27 34 C 22 37 19 36 16 35"
            stroke={c.organ}
            strokeWidth={2.8}
            strokeLinecap="round"
            fill="none"
            opacity={0.8}
          />
          {/* The cecum and the appendix hanging from it. */}
          <Circle cx={13} cy={37.5} r={4.6} fill={c.organ} stroke={ink} strokeWidth={0.9} />
          <Path
            d="M 12 42 C 11.5 45 9 46.5 6.5 45.5"
            stroke={ink}
            strokeWidth={2.9}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 12 42 C 11.5 45 9 46.5 6.5 45.5"
            stroke={c.organDeep}
            strokeWidth={1.8}
            strokeLinecap="round"
            fill="none"
          />
          {ring(9.5, 44, 4)}
        </G>
      );
    case 'bird wing and butterfly wing':
      return (
        <G>
          {/* A bird's wing: feathers round the arm bones. */}
          {flesh(
            'M 2 22 L 8 17 L 15 12.5 L 22.5 5 C 23.5 16 21.5 28 17 39 L 14 34.5 L 11 39.5 L 8.5 33.5 L 5.5 36 L 4.5 28.5 L 2 27.5 Z',
            c.featherLight,
            0.85,
          )}
          {['M 22 8 L 17 37', 'M 18.5 11 L 14 33', 'M 15 13.5 L 11 37', 'M 11 16 L 7.5 32'].map(
            (d) => (
              <Path key={d} d={d} stroke={ink} strokeWidth={0.5} opacity={0.55} />
            ),
          )}
          {bone([3, 24], [9, 18.5], c.limbUpper, 2.2)}
          {bone([9.5, 18], [15.5, 13], c.limbForearm, 1.4)}
          {bone([10.2, 19.8], [16.2, 15], c.limbForearm, 1)}
          {bone([16.8, 13.5], [22, 7], c.limbHand, 1.2)}
          {divider}
          {/* A butterfly's wings: veins in a membrane, no bones. */}
          <Path d="M 27 14 L 27 34" stroke={ink} strokeWidth={2.2} strokeLinecap="round" />
          <Path
            d="M 27.5 16 C 33 8 41 5 46 6 C 46 13 41 20 28 23 Z"
            fill={c.petal}
            fillOpacity={0.75}
            stroke={ink}
            strokeWidth={0.9}
            strokeLinejoin="round"
          />
          <Path
            d="M 28 24 C 37 22 43 26 42 33 C 40 39 33 39 28 31 Z"
            fill={c.petal}
            fillOpacity={0.55}
            stroke={ink}
            strokeWidth={0.9}
            strokeLinejoin="round"
          />
          {[
            'M 28 18 L 43 8',
            'M 28 20 L 44 13',
            'M 28 21.5 L 39 19',
            'M 28.5 26 L 40 28',
            'M 28.5 28 L 37 35',
          ].map((d) => (
            <Path key={d} d={d} stroke={ink} strokeWidth={0.5} opacity={0.7} />
          ))}
        </G>
      );
    case 'shark fin and dolphin flipper':
      return (
        <G>
          {/* A shark's pectoral fin: cartilage rays fanning out, no arm bones. */}
          {flesh('M 4 5 L 15 5 C 18 14 21 26 22 38 C 15 33 8 23 4 5 Z', c.furGrey, 0.55)}
          {[
            'M 6 6 L 9 18',
            'M 8 6 L 13 22',
            'M 10 6 L 16 27',
            'M 12 6 L 19 32',
            'M 14 6 L 21 36',
          ].map((d) => (
            <Path key={d} d={d} stroke={ink} strokeWidth={0.6} opacity={0.6} />
          ))}
          {divider}
          {/* A dolphin's flipper: the arm bones of a mammal inside it. */}
          {flesh(
            'M 31 4 C 38 3.5 42 7 42.5 14 C 43 23 40 33 35 44 C 30 36 27 25 27 14 C 27 8 28.5 4.5 31 4 Z',
            c.furGrey,
            0.5,
          )}
          {bone([34.5, 6], [34.5, 11.5], c.limbUpper, 2.6)}
          {bone([33, 13.5], [32.7, 18], c.limbForearm, 1.7)}
          {bone([36, 13.5], [36.3, 18], c.limbForearm, 1.7)}
          {[
            [32, 20],
            [34.5, 19.8],
            [37, 20],
          ].map(([x, y]) => (
            <Circle
              key={x}
              cx={x}
              cy={y}
              r={1.2}
              fill={c.limbWrist}
              stroke={ink}
              strokeWidth={0.5}
            />
          ))}
          {bone([31.2, 22.5], [30.3, 32], c.limbHand, 1.1)}
          {bone([33.6, 22.8], [33.4, 40], c.limbHand, 1.1)}
          {bone([36, 22.8], [36.4, 37], c.limbHand, 1.1)}
          {bone([38.2, 22.5], [39.4, 30], c.limbHand, 1.1)}
        </G>
      );
    default:
      return null;
  }
}
