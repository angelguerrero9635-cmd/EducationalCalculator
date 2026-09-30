/**
 * Grades 9–12 card icons (group HL), third file: the stages of a star's life (H79), galaxy types
 * and the forming solar system (H80). 48 × 48 like every card icon, each on a square of night sky
 * so the glow of a star reads in either theme.
 *
 * A star's life: a stellar nebula (glowing gas and dust); a protostar in its dusty disk; a
 * Sun-like star; a red giant, swollen and cool; a planetary nebula, a glowing shell round a
 * white dot; a white dwarf; a massive blue star; a red supergiant, filling the square; a
 * supernova's burst; a neutron star, tiny, beaming as a pulsar; a black hole, a dark disk in its
 * glowing ring. Sizes grow and shrink in order, not to scale (a red supergiant is some 100,000
 * times as wide as a white dwarf).
 */
import type { ReactNode } from 'react';
import { Circle, Defs, Ellipse, G, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { usePalette } from '@/theme';

import { url, usePaintIds } from '../../reps/paint';
import type { IconProps } from './types';

export function HLStarIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  const ids = usePaintIds('glow', 'glow2', 'body');
  /** A glowing ball: bright core fading out to the edge. */
  const glow = (id: string, color: string, core = c.starWhite) => (
    <RadialGradient id={id} cx="0.5" cy="0.5" r="0.5">
      <Stop offset="0" stopColor={core} stopOpacity={1} />
      <Stop offset="0.45" stopColor={color} stopOpacity={0.95} />
      <Stop offset="1" stopColor={color} stopOpacity={0} />
    </RadialGradient>
  );
  const sky = (
    <Rect x={1} y={1} width={46} height={46} rx={6} fill={c.space} stroke={ink} strokeWidth={0.6} />
  );
  /** A few faint background stars. */
  const dust = [
    [8, 9],
    [40, 7],
    [42, 40],
    [6, 38],
    [24, 5],
  ].map(([x, y]) => (
    <Circle key={`${x}${y}`} cx={x} cy={y} r={0.7} fill={c.starWhite} opacity={0.7} />
  ));
  /** A star: a halo and a lit body of radius r. */
  const star = (r: number, color: string, halo = 1.8) => (
    <G>
      <Defs>
        {glow(ids.glow, color)}
        <RadialGradient id={ids.body} cx="0.4" cy="0.38" r="0.65">
          <Stop offset="0" stopColor={c.starWhite} />
          <Stop offset="0.5" stopColor={color} />
          <Stop offset="1" stopColor={color} />
        </RadialGradient>
      </Defs>
      <Circle cx={24} cy={24} r={r * halo} fill={url(ids.glow)} />
      <Circle cx={24} cy={24} r={r} fill={url(ids.body)} />
    </G>
  );
  switch (icon) {
    case 'stellar nebula':
      return (
        <G>
          {sky}
          <Defs>
            {glow(ids.glow, c.nebulaPink, c.nebulaPink)}
            {glow(ids.glow2, c.nebulaBlue, c.nebulaBlue)}
          </Defs>
          <Ellipse cx={20} cy={22} rx={17} ry={13} fill={url(ids.glow)} />
          <Ellipse cx={30} cy={28} rx={15} ry={11} fill={url(ids.glow2)} />
          <Path
            d="M 8 30 C 16 24 24 34 34 26 C 38 23 42 26 44 24"
            stroke={c.shade}
            strokeOpacity={0.6}
            strokeWidth={3}
            fill="none"
          />
          {dust}
        </G>
      );
    case 'protostar':
      return (
        <G>
          {sky}
          <Defs>{glow(ids.glow2, c.nebulaPink, c.nebulaPink)}</Defs>
          <Ellipse cx={24} cy={24} rx={21} ry={6} fill={url(ids.glow2)} />
          {star(5, c.starOrange, 2.2)}
          <Ellipse cx={24} cy={25} rx={20} ry={3.2} fill={c.shade} opacity={0.5} />
          {dust}
        </G>
      );
    case 'Sun-like star':
      return (
        <G>
          {sky}
          {dust}
          {star(9, c.starYellow)}
        </G>
      );
    case 'massive star':
      return (
        <G>
          {sky}
          {dust}
          {star(12, c.starBlue)}
        </G>
      );
    case 'red giant':
      return (
        <G>
          {sky}
          {dust}
          {star(15, c.starOrange, 1.4)}
        </G>
      );
    case 'red supergiant':
      return (
        <G>
          {sky}
          {star(21, c.starRed, 1.1)}
        </G>
      );
    case 'planetary nebula':
      return (
        <G>
          {sky}
          <Defs>{glow(ids.glow2, c.nebulaBlue, c.space)}</Defs>
          <Ellipse cx={24} cy={24} rx={17} ry={14} fill={url(ids.glow2)} />
          <Ellipse
            cx={24}
            cy={24}
            rx={14}
            ry={11}
            fill="none"
            stroke={c.nebulaPink}
            strokeWidth={3.5}
            opacity={0.85}
          />
          <Circle cx={24} cy={24} r={1.6} fill={c.starWhite} />
          {dust}
        </G>
      );
    case 'white dwarf':
      return (
        <G>
          {sky}
          {dust}
          {star(3, c.starWhite, 3)}
        </G>
      );
    case 'supernova':
      return (
        <G>
          {sky}
          <Defs>{glow(ids.glow2, c.starYellow)}</Defs>
          <Path
            d={
              Array.from({ length: 16 }, (_, i) => {
                const a = (i / 16) * Math.PI * 2;
                const r = i % 2 ? 8 : 21;
                return `${i ? 'L' : 'M'} ${(24 + r * Math.cos(a)).toFixed(1)} ${(24 + r * Math.sin(a)).toFixed(1)}`;
              }).join(' ') + ' Z'
            }
            fill={c.starOrange}
            opacity={0.85}
          />
          <Circle cx={24} cy={24} r={13} fill={url(ids.glow2)} />
          {dust}
        </G>
      );
    case 'neutron star':
      return (
        <G>
          {sky}
          {dust}
          {/* A pulsar's two beams from its magnetic poles. */}
          <Path
            d="M 24 24 L 12 3 L 17 2 Z M 24 24 L 36 45 L 31 46 Z"
            fill={c.starBlue}
            opacity={0.7}
          />
          {star(2.2, c.starBlue, 3)}
        </G>
      );
    case 'black hole':
      return (
        <G>
          {sky}
          {dust}
          <Defs>{glow(ids.glow2, c.starOrange)}</Defs>
          <Ellipse cx={24} cy={24} rx={21} ry={8} fill={url(ids.glow2)} />
          <Circle cx={24} cy={24} r={8.5} fill={c.starOrange} opacity={0.9} />
          <Circle cx={24} cy={24} r={7} fill={c.shade} />
          <Path d="M 5 25 C 12 28 36 28 43 25" stroke={c.starYellow} strokeWidth={2} fill="none" />
        </G>
      );
    default:
      return null;
  }
}
