/**
 * Grades 9–12 card icons (group HH), 48 × 48 like every card icon, drawn in their materials with
 * the helpers in reps/paint.tsx. The names are listed in data/modules/layouts/icons/hh.ts.
 *
 * Homologous limbs (H38): a human arm, a bat's wing, a whale's flipper and a cat's foreleg, the
 * same bones in each colored alike (upper arm, the two forearm bones, the wrist, the hand and
 * fingers), inside the limb's skin, fur or membrane; and an insect's wing, which has no bones.
 *
 * The domains and kingdoms (H39): rod-shaped bacteria with no nucleus, lobed archaea over a hot
 * spring, a eukaryotic cell with its nucleus, a paramecium (protists), mushrooms on their
 * threads (fungi), a leafy plant, and a fish (animals).
 */
import type { ReactNode } from 'react';
import { Circle, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import { usePalette } from '@/theme';

import { Ball, url, usePaintIds } from '../../reps/paint';
import type { IconProps } from './types';

type Pt = [number, number];

export function HHIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  const ids = usePaintIds('cell', 'cap', 'fish', 'leaf');
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
    case 'domain Bacteria':
      return (
        <G>
          <Defs>
            <Ball id={ids.cell} color={c.bacteriumCell} />
          </Defs>
          {[
            { x: 5, y: 9, a: -12 },
            { x: 15, y: 28, a: 8 },
          ].map(({ x, y, a }) => (
            <G key={x} transform={`rotate(${a} ${x + 13} ${y + 6})`}>
              <Path
                d={`M ${x + 26} ${y + 6} q 4 -4 7 0 t 7 0`}
                stroke={ink}
                strokeWidth={0.9}
                fill="none"
              />
              <Rect
                x={x}
                y={y}
                width={26}
                height={12}
                rx={6}
                fill={url(ids.cell)}
                stroke={ink}
                strokeWidth={1.1}
              />
              <Path
                d={`M ${x + 6} ${y + 6} c 2 -4 5 4 7 0 s 5 -4 7 0`}
                stroke={ink}
                strokeWidth={0.8}
                fill="none"
                opacity={0.7}
              />
            </G>
          ))}
        </G>
      );
    case 'domain Archaea':
      return (
        <G>
          <Defs>
            <Ball id={ids.cell} color={c.sunRay} />
          </Defs>
          <Rect
            x={2}
            y={35}
            width={44}
            height={12}
            rx={3}
            fill={c.water}
            stroke={ink}
            strokeWidth={0.8}
          />
          {[
            [10, 41],
            [20, 43],
            [33, 40],
          ].map(([bx, by]) => (
            <Circle
              key={bx}
              cx={bx}
              cy={by}
              r={1.6}
              fill="none"
              stroke={c.snow}
              strokeWidth={0.8}
            />
          ))}
          <Path
            d="M 9 33 q -3 -4 0 -8 M 38 33 q 3 -4 0 -8"
            stroke={c.chartMuted}
            strokeWidth={1}
            fill="none"
          />
          {[
            [16, 16, 9],
            [31, 22, 8],
          ].map(([x, y, r]) => (
            <Path
              key={x}
              d={`M ${x! - r!} ${y} C ${x! - r!} ${y! - r! * 1.2} ${x! - r! * 0.2} ${y! - r!} ${x} ${y! - r! * 0.8} C ${x! + r! * 0.6} ${y! - r! * 1.2} ${x! + r! * 1.2} ${y! - r! * 0.4} ${x! + r!} ${y} C ${x! + r! * 1.1} ${y! + r! * 0.8} ${x! + r! * 0.3} ${y! + r! * 1.1} ${x} ${y! + r! * 0.9} C ${x! - r! * 0.6} ${y! + r! * 1.2} ${x! - r! * 1.1} ${y! + r! * 0.6} ${x! - r!} ${y} Z`}
              fill={url(ids.cell)}
              stroke={ink}
              strokeWidth={1.1}
            />
          ))}
        </G>
      );
    case 'domain Eukarya':
      return (
        <G>
          <Defs>
            <Ball id={ids.cell} color={c.fat} />
          </Defs>
          <Circle cx={24} cy={24} r={20} fill={url(ids.cell)} stroke={ink} strokeWidth={1.2} />
          <Path
            d="M 11 18 q 3 -3 6 0 t 6 0 M 12 33 q 3 3 6 0"
            stroke={ink}
            strokeWidth={0.7}
            fill="none"
            opacity={0.6}
          />
          <Ellipse
            cx={31}
            cy={32}
            rx={5}
            ry={2.8}
            fill={c.orange}
            stroke={ink}
            strokeWidth={0.8}
            transform="rotate(-25 31 32)"
          />
          <Circle
            cx={23}
            cy={22}
            r={7.5}
            fill={c.purple}
            fillOpacity={0.75}
            stroke={ink}
            strokeWidth={1}
          />
          <Circle cx={24.5} cy={20.5} r={2.4} fill={c.purple} stroke={ink} strokeWidth={0.6} />
        </G>
      );
    case 'kingdom Protista':
      return (
        <G>
          <Defs>
            <Ball id={ids.cell} color={c.life} />
          </Defs>
          {Array.from({ length: 22 }, (_, i) => {
            const t = (i / 22) * Math.PI * 2;
            const [x, y] = [24 + 19 * Math.cos(t), 24 + 10 * Math.sin(t)];
            const [x2, y2] = [24 + 22 * Math.cos(t), 24 + 12.5 * Math.sin(t)];
            return (
              <Path
                key={i}
                d={`M ${x} ${y} L ${x2} ${y2}`}
                stroke={ink}
                strokeWidth={0.6}
                transform="rotate(-20 24 24)"
              />
            );
          })}
          <Path
            d="M 5 24 C 5 16 14 13 24 14 C 36 14 43 18 43 24 C 43 30 36 34 26 33 C 22 30 18 30 14 33 C 8 33 5 29 5 24 Z"
            fill={url(ids.cell)}
            stroke={ink}
            strokeWidth={1.2}
            transform="rotate(-20 24 24)"
          />
          <Ellipse
            cx={26}
            cy={23}
            rx={5}
            ry={3}
            fill={c.lifeDeep}
            stroke={ink}
            strokeWidth={0.7}
            transform="rotate(-20 24 24)"
          />
          <Circle cx={14} cy={25} r={2} fill="none" stroke={ink} strokeWidth={0.7} />
        </G>
      );
    case 'kingdom Fungi':
      return (
        <G>
          <Defs>
            <Ball id={ids.cap} color={c.fur} />
          </Defs>
          <Rect x={2} y={34} width={44} height={13} rx={2} fill={c.soil} />
          <Path
            d="M 16 36 q -4 4 -9 6 M 16 36 q 2 5 -1 9 M 32 36 q 5 3 10 3 M 32 36 q -2 5 2 9 M 16 38 q 8 3 16 0"
            stroke={c.snow}
            strokeWidth={0.8}
            fill="none"
            opacity={0.8}
          />
          {[
            [16, 36, 11, 12],
            [32, 36, 8, 9],
          ].map(([x, base, r, stem]) => (
            <G key={x}>
              <Rect
                x={x! - 2.5}
                y={base! - stem!}
                width={5}
                height={stem}
                fill={c.featherLight}
                stroke={ink}
                strokeWidth={0.9}
              />
              <Path
                d={`M ${x! - r!} ${base! - stem! + 1} Q ${x} ${base! - stem! - r! * 1.5} ${x! + r!} ${base! - stem! + 1} Z`}
                fill={url(ids.cap)}
                stroke={ink}
                strokeWidth={1.1}
              />
            </G>
          ))}
        </G>
      );
    case 'kingdom Plantae':
      return (
        <G>
          <Defs>
            <Ball id={ids.leaf} color={c.life} />
          </Defs>
          <Path d="M 6 46 Q 24 38 42 46 Z" fill={c.soil} stroke={ink} strokeWidth={0.8} />
          <Path
            d="M 24 44 C 24 34 23 22 24 8"
            stroke={c.lifeDeep}
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
          />
          {[
            [24, 34, -1],
            [24, 25, 1],
            [24, 17, -1],
            [24, 10, 1],
          ].map(([x, y, side], i) => {
            const len = 15 - i * 2;
            const tx = x! + side! * len;
            return (
              <Path
                key={i}
                d={`M ${x} ${y} Q ${x! + side! * len * 0.5} ${y! - len * 0.8} ${tx} ${y! - len * 0.3} Q ${x! + side! * len * 0.5} ${y! + len * 0.25} ${x} ${y} Z`}
                fill={url(ids.leaf)}
                stroke={ink}
                strokeWidth={1}
              />
            );
          })}
        </G>
      );
    case 'kingdom Animalia':
      return (
        <G>
          <Defs>
            <Ball id={ids.fish} color={c.orange} />
          </Defs>
          <Path
            d="M 36 24 L 46 14 L 44 24 L 46 34 Z"
            fill={c.orange}
            stroke={ink}
            strokeWidth={1.1}
            strokeLinejoin="round"
          />
          <Path d="M 18 14 Q 24 6 30 13 Z" fill={c.orange} stroke={ink} strokeWidth={1} />
          <Ellipse
            cx={22}
            cy={24}
            rx={17}
            ry={10.5}
            fill={url(ids.fish)}
            stroke={ink}
            strokeWidth={1.2}
          />
          <Path d="M 14 17 Q 18 24 14 31" stroke={ink} strokeWidth={0.9} fill="none" />
          <Path d="M 22 26 q 4 4 8 0" stroke={ink} strokeWidth={0.8} fill="none" />
          <Circle cx={10} cy={22} r={2} fill={c.animalEye} />
          <Circle cx={9.4} cy={21.4} r={0.6} fill={c.snow} />
        </G>
      );
    default:
      return null;
  }
}
