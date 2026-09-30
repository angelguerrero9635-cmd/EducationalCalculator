/**
 * Grades 9–12 card icons (group HL), 48 × 48 like every card icon, drawn in their materials with
 * the helpers in reps/paint.tsx. The names are listed in data/modules/layouts/icons/hl.ts.
 *
 * Minerals (H71), each in the habit and luster that identify it: quartz as six-sided prisms with
 * pointed ends (glassy); pink feldspar as a blocky crystal with two cleavages at right angles; mica
 * as a book of thin sheets, one peeling; calcite as a rhomb that doubles a line seen through it;
 * halite as clear cubes; pyrite as brassy striated cubes; hematite as metallic kidney ore beside
 * its red-brown streak on a white plate.
 */
import type { ReactNode } from 'react';
import { Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import { usePalette } from '@/theme';

import { Metal, url, usePaintIds } from '../../reps/paint';
import { HLSpaceIcon } from './hlSpace';
import type { IconProps } from './types';

type Pt = [number, number];
const poly = (pts: Pt[]) => `M ${pts.map((p) => p.join(' ')).join(' L ')} Z`;

export function HLIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  const ids = usePaintIds('ore');
  /** A crystal face: its color, lit (light > 0) or shaded (light < 0) from the top left. */
  const face = (pts: Pt[], fill: string, light = 0, key?: string, opacity = 1) => (
    <G key={key ?? pts.join()}>
      <Path d={poly(pts)} fill={fill} fillOpacity={opacity} />
      <Path
        d={poly(pts)}
        fill={light > 0 ? c.shine : c.shade}
        fillOpacity={Math.abs(light) * (light > 0 ? 0.5 : 0.35) * (0.4 + c.sheen * 0.6)}
        stroke={ink}
        strokeWidth={0.8}
        strokeLinejoin="round"
      />
    </G>
  );
  /** A six-sided quartz prism with its point, standing at (x, base), `w` wide and `h` tall. */
  const prism = (x: number, base: number, w: number, h: number, tilt: number, key: string) => {
    const t = (px: number, py: number): Pt => [
      x + px * Math.cos(tilt) - py * Math.sin(tilt),
      base + px * Math.sin(tilt) + py * Math.cos(tilt),
    ];
    const tip = w * 0.9;
    return (
      <G key={key}>
        {face([t(-w / 2, 0), t(-w / 2, -h), t(-w / 6, -h - 1), t(-w / 6, 0)], c.mineralQuartz, 0.6)}
        {face(
          [t(-w / 6, 0), t(-w / 6, -h - 1), t(w / 6, -h - 1), t(w / 6, 0)],
          c.mineralQuartz,
          0.1,
        )}
        {face([t(w / 6, 0), t(w / 6, -h - 1), t(w / 2, -h), t(w / 2, 0)], c.mineralQuartz, -0.5)}
        {face([t(-w / 2, -h), t(0, -h - tip), t(-w / 6, -h - 1)], c.mineralQuartz, 0.8)}
        {face([t(-w / 6, -h - 1), t(0, -h - tip), t(w / 6, -h - 1)], c.mineralQuartz, 0.3)}
        {face([t(w / 6, -h - 1), t(0, -h - tip), t(w / 2, -h)], c.mineralQuartz, -0.3)}
        {/* Faint horizontal striations across the prism faces. */}
        <Path
          d={[0.25, 0.45, 0.65]
            .map((k) => `M ${t(-w / 2, -h * k).join(' ')} L ${t(w / 2, -h * k).join(' ')}`)
            .join(' ')}
          stroke={c.glassEdge}
          strokeWidth={0.5}
          opacity={0.7}
        />
      </G>
    );
  };
  /** A cube in view: front, top and right faces. */
  const cube = (x: number, y: number, s: number, fill: string, key: string, stripes = false) => {
    const d = s * 0.45;
    const front: Pt[] = [
      [x, y],
      [x + s, y],
      [x + s, y + s],
      [x, y + s],
    ];
    const top: Pt[] = [
      [x, y],
      [x + d, y - d * 0.7],
      [x + s + d, y - d * 0.7],
      [x + s, y],
    ];
    const side: Pt[] = [
      [x + s, y],
      [x + s + d, y - d * 0.7],
      [x + s + d, y + s - d * 0.7],
      [x + s, y + s],
    ];
    return (
      <G key={key}>
        {face(front, fill, 0.15)}
        {face(top, fill, 0.7)}
        {face(side, fill, -0.6)}
        {stripes ? (
          <Path
            d={[0.25, 0.5, 0.75]
              .map(
                (k) =>
                  `M ${x + s * k} ${y + 1} L ${x + s * k} ${y + s - 1} M ${x + 1 + d * k} ${y - d * 0.7 * k} L ${x + s + d * k - 1} ${y - d * 0.7 * k}`,
              )
              .join(' ')}
            stroke={c.mineralPyriteDark}
            strokeWidth={0.6}
            opacity={0.8}
          />
        ) : null}
      </G>
    );
  };

  switch (icon) {
    case 'quartz':
      return (
        <G>
          <Ellipse cx={24} cy={43} rx={17} ry={3} fill={c.rock5} opacity={0.8} />
          {prism(15, 43, 9, 18, -0.35, 'a')}
          {prism(33, 43, 9, 16, 0.4, 'b')}
          {prism(24, 44, 11, 24, 0, 'c')}
        </G>
      );
    case 'feldspar':
      // Orthoclase: a blocky pink crystal; two cleavages at right angles give flat steps.
      return (
        <G>
          {face(
            [
              [7, 18],
              [30, 18],
              [30, 42],
              [7, 42],
            ],
            c.mineralFeldspar,
            0.15,
          )}
          {face(
            [
              [7, 18],
              [17, 9],
              [40, 9],
              [30, 18],
            ],
            c.mineralFeldspar,
            0.7,
          )}
          {face(
            [
              [30, 18],
              [40, 9],
              [40, 33],
              [30, 42],
            ],
            c.mineralFeldspar,
            -0.5,
          )}
          {/* Cleavage steps: flat breaks at right angles. */}
          <Path
            d="M 7 27 L 20 27 L 20 33 L 30 33 M 12 18 L 12 24 M 23 18 L 23 22 L 30 22 M 30 26 L 40 17"
            stroke={ink}
            strokeWidth={0.6}
            fill="none"
            opacity={0.6}
          />
          {/* A pearly glint on the top cleavage face. */}
          <Path d="M 18 14 L 30 14" stroke={c.shine} strokeWidth={1.4} opacity={0.7} />
        </G>
      );
    case 'mica':
      // A "book" of mica: thin stacked sheets, one peeling off the top.
      return (
        <G>
          {[0, 1, 2, 3, 4, 5].map((k) => {
            const y = 38 - k * 3;
            return face(
              [
                [6, y],
                [14, y - 7],
                [38, y - 7],
                [42, y],
                [34, y + 4],
                [10, y + 4],
              ],
              c.mineralMica,
              k === 5 ? 0.5 : -0.1 + k * 0.08,
              `s${k}`,
            );
          })}
          {/* The peeling sheet, thin enough to see through. */}
          <Path
            d="M 12 20 C 16 10 30 5 40 8 L 44 14 C 34 12 22 16 18 23 Z"
            fill={c.mineralMica}
            fillOpacity={0.55}
            stroke={ink}
            strokeWidth={0.8}
          />
          <Path d="M 20 15 C 26 11 32 10 38 10" stroke={c.shine} strokeWidth={1} opacity={0.8} />
        </G>
      );
    case 'calcite':
      // A clear rhomb over a line: the line shows twice (double refraction).
      return (
        <G>
          <Path d="M 3 36 L 45 36" stroke={ink} strokeWidth={1.4} />
          {face(
            [
              [8, 22],
              [30, 22],
              [38, 44],
              [16, 44],
            ],
            c.mineralCalcite,
            0.1,
            undefined,
            0.75,
          )}
          {face(
            [
              [8, 22],
              [20, 8],
              [42, 8],
              [30, 22],
            ],
            c.mineralCalcite,
            0.6,
            undefined,
            0.75,
          )}
          {face(
            [
              [30, 22],
              [42, 8],
              [46, 30],
              [38, 44],
            ],
            c.mineralCalcite,
            -0.4,
            undefined,
            0.75,
          )}
          {/* The doubled line, seen through the crystal. */}
          <Path d="M 13 33 L 36 33 M 14 39 L 37 39" stroke={ink} strokeWidth={1.2} />
        </G>
      );
    case 'halite':
      return (
        <G>
          {cube(22, 26, 16, c.mineralHalite, 'b')}
          {cube(6, 22, 18, c.mineralHalite, 'a')}
          {/* A small cube on top, and the stepped (hopper) face salt grows. */}
          {cube(12, 12, 8, c.mineralHalite, 'c')}
          <Rect x={10} y={27} width={10} height={10} fill="none" stroke={ink} strokeWidth={0.5} />
          <Rect x={13} y={30} width={4} height={4} fill="none" stroke={ink} strokeWidth={0.5} />
        </G>
      );
    case 'pyrite':
      return (
        <G>
          {cube(22, 24, 17, c.mineralPyrite, 'b', true)}
          {cube(5, 20, 20, c.mineralPyrite, 'a', true)}
          <Path d="M 7 22 L 13 22" stroke={c.shine} strokeWidth={1.6} opacity={0.9} />
        </G>
      );
    case 'hematite':
      // Kidney ore: metallic grey bulges; beside it the red-brown streak on a white plate.
      return (
        <G>
          <Defs>
            <Metal id={ids.ore} light={c.metalDark} dark={c.mineralHematite} />
          </Defs>
          <Rect
            x={26}
            y={31}
            width={20}
            height={13}
            rx={1.5}
            fill={c.paper}
            stroke={ink}
            strokeWidth={0.8}
          />
          <Path
            d="M 29 38 C 33 35 38 40 43 36"
            stroke={c.mineralHematiteStreak}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 3 30 C 2 20 8 13 15 14 C 18 7 28 8 30 15 C 35 16 36 24 32 28 C 30 34 20 36 13 34 C 8 36 3 34 3 30 Z"
            fill={url(ids.ore)}
            stroke={ink}
            strokeWidth={1}
          />
          <Path
            d="M 9 22 C 11 18 15 18 17 21 M 20 16 C 22 13 26 14 27 17 M 20 28 C 23 25 28 26 29 28"
            stroke={c.shine}
            strokeWidth={1}
            fill="none"
            opacity={0.7}
          />
        </G>
      );
    default:
      // Energy sources, stars and galaxies (H78–H80).
      return <HLSpaceIcon icon={icon} ink={ink} />;
  }
}
