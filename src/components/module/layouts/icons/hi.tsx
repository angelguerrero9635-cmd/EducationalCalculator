/**
 * Grades 9–12 card icons (group HI), 48 × 48 like every card icon, drawn in their materials with
 * the helpers in reps/paint.tsx. The names are listed in data/modules/layouts/icons/hi.ts.
 *
 * The reaction types (H49): lit balls in the classroom atom colors, the reactants on top, an
 * arrow down, the products below: synthesis A + B → AB, decomposition AB → A + B, single
 * replacement A + BC → AC + B, double replacement AB + CD → AD + CB, and combustion, a fuel
 * burning in oxygen to carbon dioxide and water over a flame.
 */
import type { ReactNode } from 'react';
import { Circle, Defs, G, Line, Path } from 'react-native-svg';

import { usePalette } from '@/theme';

import { Ball, url, usePaintIds } from '../../reps/paint';
import type { IconProps } from './types';

type Atom = 'a' | 'b' | 'c' | 'd' | 'C' | 'O' | 'H';

export function HIIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  const ids = usePaintIds('a', 'b', 'c', 'd', 'C', 'O', 'H');
  const colors: Record<Atom, string> = {
    a: c.atomO,
    b: c.atomN,
    c: c.atomHalogen,
    d: c.atomS,
    C: c.atomC,
    O: c.atomO,
    H: c.atomH,
  };
  const ball = (k: Atom, x: number, y: number, r = 4.6) => (
    <Circle
      key={`${k}${x}-${y}`}
      cx={x}
      cy={y}
      r={r}
      fill={url(ids[k])}
      stroke={ink}
      strokeOpacity={0.55}
      strokeWidth={0.7}
    />
  );
  /** Balls joined side by side (a compound), left to right from x. */
  const joined = (atoms: Atom[], x: number, y: number, r = 4.6) => (
    <G key={`j${atoms.join('')}${x}-${y}`}>
      {atoms.map((k, i) => ball(k, x + i * r * 1.55, y, r))}
    </G>
  );
  const plus = (x: number, y: number) => (
    <G key={`p${x}-${y}`}>
      <Line x1={x - 2.4} y1={y} x2={x + 2.4} y2={y} stroke={ink} strokeWidth={1.2} />
      <Line x1={x} y1={y - 2.4} x2={x} y2={y + 2.4} stroke={ink} strokeWidth={1.2} />
    </G>
  );
  const arrow = (
    <G>
      <Line x1={24} y1={20} x2={24} y2={26} stroke={ink} strokeWidth={1.4} />
      <Path d="M 24 29 l -3 -4 l 6 0 z" fill={ink} />
    </G>
  );
  const defs = (
    <Defs>
      {(Object.keys(colors) as Atom[]).map((k) => (
        <Ball key={k} id={ids[k]} color={colors[k]} />
      ))}
    </Defs>
  );
  // Reactants on the row at y = 12, products at y = 37.
  const T = 12;
  const B = 37;
  switch (icon) {
    case 'synthesis reaction':
      return (
        <G>
          {defs}
          {ball('a', 13, T)}
          {plus(24, T)}
          {ball('b', 35, T)}
          {arrow}
          {joined(['a', 'b'], 20.4, B)}
        </G>
      );
    case 'decomposition reaction':
      return (
        <G>
          {defs}
          {joined(['a', 'b'], 20.4, T)}
          {arrow}
          {ball('a', 13, B)}
          {plus(24, B)}
          {ball('b', 35, B)}
        </G>
      );
    case 'single replacement reaction':
      return (
        <G>
          {defs}
          {ball('a', 8, T, 4.2)}
          {plus(16, T)}
          {joined(['b', 'c'], 26, T, 4.2)}
          {arrow}
          {joined(['a', 'c'], 8, B, 4.2)}
          {plus(29, B)}
          {ball('b', 39, B, 4.2)}
        </G>
      );
    case 'double replacement reaction':
      return (
        <G>
          {defs}
          {joined(['a', 'b'], 6, T, 4)}
          {plus(24, T)}
          {joined(['c', 'd'], 32, T, 4)}
          {arrow}
          {joined(['a', 'd'], 6, B, 4)}
          {plus(24, B)}
          {joined(['c', 'b'], 32, B, 4)}
        </G>
      );
    case 'combustion reaction':
      return (
        <G>
          {defs}
          {/* Methane and oxygen over a flame. */}
          {ball('C', 11, T, 4.4)}
          {ball('H', 5.5, T - 4, 2.6)}
          {ball('H', 16.5, T - 4, 2.6)}
          {ball('H', 5.5, T + 4, 2.6)}
          {ball('H', 16.5, T + 4, 2.6)}
          {plus(23, T)}
          {joined(['O', 'O'], 30, T, 4)}
          <Path
            d="M 41 21 C 37 17 40 13 41 8 C 44 12 47 15 45 20 C 44 22 42 22 41 21 Z"
            fill={c.orange}
            stroke={ink}
            strokeWidth={0.6}
          />
          <Path
            d="M 42 20 C 40.5 17.5 42 15.5 42.5 13.5 C 44 16 45 18 43.5 20 Z"
            fill={c.sunDisk}
          />
          {arrow}
          {/* Carbon dioxide and water. */}
          {joined(['O', 'C', 'O'], 5, B, 3.8)}
          {plus(24, B)}
          {ball('O', 36, B - 1, 4)}
          {ball('H', 31.5, B + 3.5, 2.6)}
          {ball('H', 40.5, B + 3.5, 2.6)}
        </G>
      );
    default:
      return null;
  }
}
