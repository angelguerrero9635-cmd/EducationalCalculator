/**
 * Grades 9–12 round 2 card icons (group H2D), 48 × 48 like every card icon, drawn in their
 * materials with the helpers in reps/paint.tsx. The names are listed in
 * data/modules/layouts/icons/h2d.ts.
 *
 * The models of the atom (H101 part 13), in the Bohr-model colors (protons red, neutrons grey,
 * electrons blue): Dalton's solid sphere; Thomson's positive pudding with electrons stuck in it;
 * Rutherford's tiny nucleus with electrons flying around it in mostly empty space; Bohr's
 * electrons on two circular levels; and the quantum model's electron cloud, densest near the
 * nucleus.
 */
import type { ReactNode } from 'react';
import { Circle, Defs, Ellipse, G, Line, RadialGradient, Stop } from 'react-native-svg';

import { usePalette } from '@/theme';

import { Ball, url, usePaintIds } from '../../reps/paint';
import type { IconProps } from './types';

/** A few fixed spots in a unit circle, for electrons and cloud dots (the same every time). */
const SPOTS: [number, number][] = [
  [-0.45, -0.35],
  [0.4, -0.5],
  [0.1, 0.05],
  [-0.2, 0.5],
  [0.55, 0.3],
  [-0.62, 0.15],
];

export function H2DIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  const ids = usePaintIds('solid', 'pudding', 'p', 'n', 'e', 'cloud');
  const defs = (
    <Defs>
      <Ball id={ids.solid} color={c.atomMetal} />
      <Ball id={ids.pudding} color={c.wood} />
      <Ball id={ids.p} color={c.atomProton} />
      <Ball id={ids.n} color={c.atomNeutron} />
      <Ball id={ids.e} color={c.atomElectron} />
      <RadialGradient id={ids.cloud} cx="0.5" cy="0.5" r="0.5">
        <Stop offset="0" stopColor={c.atomElectron} stopOpacity={0.75} />
        <Stop offset="0.55" stopColor={c.atomElectron} stopOpacity={0.3} />
        <Stop offset="1" stopColor={c.atomElectron} stopOpacity={0} />
      </RadialGradient>
    </Defs>
  );
  const electron = (x: number, y: number, r = 2.6) => (
    <Circle
      key={`e${x}-${y}`}
      cx={x}
      cy={y}
      r={r}
      fill={url(ids.e)}
      stroke={ink}
      strokeOpacity={0.4}
      strokeWidth={0.5}
    />
  );
  /** A small nucleus: protons and neutrons packed together. */
  const nucleus = (r: number) => (
    <G>
      {[
        [-0.5, -0.4, 'p'],
        [0.5, -0.3, 'n'],
        [0, 0.45, 'p'],
        [-0.45, 0.45, 'n'],
        [0.45, 0.45, 'n'],
        [0, -0.05, 'p'],
      ].map(([dx, dy, k], i) => (
        <Circle
          key={i}
          cx={24 + (dx as number) * r}
          cy={24 + (dy as number) * r}
          r={r * 0.55}
          fill={url(ids[k as 'p' | 'n'])}
          stroke={ink}
          strokeOpacity={0.35}
          strokeWidth={0.4}
        />
      ))}
    </G>
  );
  switch (icon) {
    case 'Dalton atom model':
      return (
        <G>
          {defs}
          <Circle cx={24} cy={24} r={17} fill={url(ids.solid)} stroke={ink} strokeWidth={1} />
        </G>
      );
    case 'Thomson atom model':
      return (
        <G>
          {defs}
          <Circle cx={24} cy={24} r={19} fill={url(ids.pudding)} stroke={ink} strokeWidth={1} />
          {SPOTS.map(([x, y]) => electron(24 + x * 13, 24 + y * 13, 3))}
          {SPOTS.map(([x, y], i) => (
            <Line
              key={`m${i}`}
              x1={24 + x * 13 - 1.6}
              y1={24 + y * 13}
              x2={24 + x * 13 + 1.6}
              y2={24 + y * 13}
              stroke={c.onAtom}
              strokeWidth={0.9}
            />
          ))}
        </G>
      );
    case 'Rutherford atom model':
      return (
        <G>
          {defs}
          {[0, 60, 120].map((a) => (
            <Ellipse
              key={a}
              cx={24}
              cy={24}
              rx={20}
              ry={7}
              fill="none"
              stroke={ink}
              strokeOpacity={0.45}
              strokeWidth={0.8}
              transform={`rotate(${a} 24 24)`}
            />
          ))}
          {nucleus(3)}
          {[
            [0, 20],
            [60, -20],
            [120, 20],
          ].map(([a, d]) => {
            const t = ((a as number) * Math.PI) / 180;
            return electron(24 + Math.cos(t) * (d as number), 24 + Math.sin(t) * (d as number));
          })}
        </G>
      );
    case 'Bohr atom model':
      return (
        <G>
          {defs}
          <Circle cx={24} cy={24} r={11} fill="none" stroke={ink} strokeWidth={0.9} />
          <Circle cx={24} cy={24} r={20} fill="none" stroke={ink} strokeWidth={0.9} />
          {nucleus(4)}
          {electron(24, 13)}
          {electron(24, 35)}
          {[20, 110, 200, 290].map((a) => {
            const t = (a * Math.PI) / 180;
            return electron(24 + Math.cos(t) * 20, 24 + Math.sin(t) * 20);
          })}
        </G>
      );
    case 'quantum atom model':
      return (
        <G>
          {defs}
          <Circle cx={24} cy={24} r={21} fill={url(ids.cloud)} />
          {Array.from({ length: 28 }, (_, i) => {
            // Dots thinning outward: most near the middle, a few far out.
            const t = i * 2.39996;
            const d = 5 + 16 * Math.sqrt(((i * 7) % 28) / 28) ** 1.4;
            return (
              <Circle
                key={i}
                cx={24 + Math.cos(t) * d}
                cy={24 + Math.sin(t) * d}
                r={1.3}
                fill={c.atomElectron}
              />
            );
          })}
          {nucleus(3.2)}
        </G>
      );
  }
  return null;
}
