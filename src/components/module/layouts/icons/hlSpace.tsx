/**
 * Grades 9–12 card icons (group HL), second file: energy sources (H78), the stages of a star's
 * life (H79), galaxy types and the forming solar system (H80). 48 × 48 like every card icon.
 *
 * Energy sources, beside round 3's (r3f.tsx: wind turbine, dam, lumps of coal, oil pump, gas stove
 * flame, nuclear power plant): a solar panel of blue cells on a stand, and an offshore oil rig.
 */
import type { ReactNode } from 'react';
import { Circle, Defs, G, Path, Rect } from 'react-native-svg';

import { usePalette } from '@/theme';

import { Ball, Deepen, TopLight, url, usePaintIds } from '../../reps/paint';
import { HLStarIcon } from './hlStars';
import type { IconProps } from './types';

export function HLSpaceIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  const ids = usePaintIds('light', 'water', 'sun');
  switch (icon) {
    case 'solar panel':
      return (
        <G>
          <Defs>
            <TopLight id={ids.light} />
            <Ball id={ids.sun} color={c.sunDisk} />
          </Defs>
          <Circle cx={40} cy={8} r={5} fill={url(ids.sun)} />
          <Path d="M 22 30 L 22 44 M 30 30 L 30 44" stroke={c.metalDark} strokeWidth={2.4} />
          <Path d="M 16 44 H 36" stroke={ink} strokeWidth={1.2} />
          {/* The panel, tilted toward the sun: a grid of cells in a metal frame. */}
          <Path
            d="M 4 34 L 14 12 L 44 12 L 36 34 Z"
            fill={c.solarCell}
            stroke={c.metalDark}
            strokeWidth={1.4}
          />
          {[1, 2, 3].map((k) => {
            const t = k / 4;
            return (
              <Path
                key={`r${k}`}
                d={`M ${4 + 10 * t} ${34 - 22 * t} L ${36 + 8 * t} ${34 - 22 * t}`}
                stroke={c.metal}
                strokeWidth={0.7}
              />
            );
          })}
          {[1, 2, 3, 4, 5].map((k) => {
            const t = k / 6;
            return (
              <Path
                key={`c${k}`}
                d={`M ${4 + 32 * t} 34 L ${14 + 30 * t} 12`}
                stroke={c.metal}
                strokeWidth={0.7}
              />
            );
          })}
          <Path d="M 4 34 L 14 12 L 44 12 L 36 34 Z" fill={url(ids.light)} />
        </G>
      );
    case 'oil rig':
      return (
        <G>
          <Defs>
            <Deepen id={ids.water} from={c.water} to={c.waterDeep} />
          </Defs>
          <Rect x={0} y={36} width={48} height={12} fill={url(ids.water)} />
          {/* Legs into the sea, the deck, and the derrick's lattice tower. */}
          <Path
            d="M 10 28 L 8 48 M 38 28 L 40 48 M 24 28 L 24 48"
            stroke={c.metalDark}
            strokeWidth={2.4}
          />
          <Rect x={5} y={25} width={38} height={5} fill={c.orange} stroke={ink} strokeWidth={0.9} />
          <Path
            d="M 18 25 L 23 4 L 27 4 L 32 25 Z"
            fill="none"
            stroke={c.metalDark}
            strokeWidth={1.4}
          />
          <Path
            d="M 19 20 L 31 20 M 20 15 L 30 15 M 21.5 10 L 28.5 10 M 18 25 L 30 15 M 32 25 L 20 15 M 20 15 L 28.5 10 M 30 15 L 21.5 10"
            stroke={c.metalDark}
            strokeWidth={0.8}
          />
          <Rect x={34} y={19} width={8} height={6} fill={c.paper} stroke={ink} strokeWidth={0.8} />
          <Path
            d="M 2 38 Q 8 36 14 38 T 26 38 T 38 38 T 50 38"
            stroke={c.waterTop}
            strokeWidth={1.2}
            fill="none"
          />
        </G>
      );
    default:
      // Stars, galaxies and the forming solar system (H79–H80).
      return <HLStarIcon icon={icon} ink={ink} />;
  }
}
