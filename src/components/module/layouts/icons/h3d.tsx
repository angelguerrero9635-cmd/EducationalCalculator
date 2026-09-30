/**
 * Grades 9–12 round 3 card icons (group H3D), 48 × 48 like every card icon, drawn in their
 * materials with the helpers in reps/paint.tsx. The names are listed in
 * data/modules/layouts/icons/h3d.ts.
 *
 * Early embryo (H109): the zygote, one cell in its clear coat with its nucleus; the morula, a
 * solid ball of cells like a mulberry; the blastula cut open, one layer of cells round a hollow;
 * the gastrula cut open, the cells folding in at the blastopore into three layers (ectoderm
 * blue outside, mesoderm red between, endoderm yellow lining the gut).
 *
 * Land biomes (H109), each a small landscape under its sky: tall layered rainforest in the rain;
 * a sand desert with a cactus under a hot sun; grassland, grass to the horizon; a temperate
 * deciduous forest of broad-leaved trees turning in autumn; taiga, dark conifers in snow; tundra,
 * low shrubs and snow patches on flat ground with no trees.
 */
import type { ReactNode } from 'react';
import { Circle, ClipPath, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { usePalette, type Palette } from '@/theme';

import { Ball, TopLight, url, usePaintIds } from '../../reps/paint';
import type { IconProps } from './types';

type Ids = Record<'cell' | 'egg' | 'light' | 'clip', string>;

export function H3DIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  const ids = usePaintIds('cell', 'egg', 'light', 'clip');
  const body = draw(icon, c, ink, ids);
  return body ? (
    <G>
      <Defs>
        <Ball id={ids.cell} color={c.organ} />
        <Ball id={ids.egg} color={c.petalPink} />
        <TopLight id={ids.light} />
        <ClipPath id={ids.clip}>
          <Rect x={2} y={4} width={44} height={40} rx={7} />
        </ClipPath>
      </Defs>
      {body}
    </G>
  ) : null;
}

function draw(icon: string, c: Palette, ink: string, ids: Ids): ReactNode {
  const o = { stroke: ink, strokeWidth: 0.8 };
  switch (icon) {
    case 'zygote':
      return (
        <G>
          <Circle cx={24} cy={24} r={21} fill="none" stroke={ink} strokeWidth={0.8} />
          <Circle cx={24} cy={24} r={17} fill={url(ids.egg)} {...o} />
          <Circle cx={26} cy={26} r={5.5} fill={c.organDeep} opacity={0.75} />
        </G>
      );
    case 'morula': {
      // A solid ball of cells: an outer ring and a middle, each cell lit.
      const ring = Array.from({ length: 9 }, (_, k) => {
        const a = (k / 9) * 2 * Math.PI;
        return [24 + 11 * Math.cos(a), 24 + 11 * Math.sin(a)] as const;
      });
      return (
        <G>
          <Circle cx={24} cy={24} r={21} fill="none" stroke={ink} strokeWidth={0.8} />
          {ring.map(([x, y], k) => (
            <Circle key={k} cx={x} cy={y} r={6.5} fill={url(ids.cell)} {...o} />
          ))}
          <Circle cx={21} cy={21} r={6.5} fill={url(ids.cell)} {...o} />
          <Circle cx={27} cy={27} r={6} fill={url(ids.cell)} {...o} />
        </G>
      );
    }
    case 'blastula': {
      // Cut open: one layer of cells round a fluid-filled hollow.
      const n = 14;
      return (
        <G>
          <Circle cx={24} cy={24} r={20} fill={c.organ} {...o} />
          <Circle cx={24} cy={24} r={13} fill={c.freshWater} {...o} />
          {Array.from({ length: n }, (_, k) => {
            const a = (k / n) * 2 * Math.PI;
            return (
              <Line
                key={k}
                x1={24 + 13 * Math.cos(a)}
                y1={24 + 13 * Math.sin(a)}
                x2={24 + 20 * Math.cos(a)}
                y2={24 + 20 * Math.sin(a)}
                stroke={ink}
                strokeWidth={0.7}
              />
            );
          })}
        </G>
      );
    }
    case 'gastrula':
      // Cut open: ectoderm outside, the endoderm folded in from the blastopore (bottom) as the
      // gut, mesoderm between them, what is left of the hollow round them.
      return (
        <G>
          <Circle cx={24} cy={22} r={20} fill={c.bioAmino} {...o} />
          <Circle cx={24} cy={22} r={14.5} fill={c.freshWater} {...o} />
          <Ellipse cx={16.5} cy={24} rx={3} ry={8} fill={c.organDeep} {...o} />
          <Ellipse cx={31.5} cy={24} rx={3} ry={8} fill={c.organDeep} {...o} />
          <Rect x={18.5} y={10} width={11} height={36} rx={5.5} fill={c.bioSugar} {...o} />
          <Rect x={22} y={14} width={4} height={34} rx={2} fill={c.card} {...o} strokeWidth={0.5} />
        </G>
      );
    case 'tropical rainforest':
      return (
        <Scene sky={c.rainCloud} ids={ids} ink={ink}>
          {[8, 16, 24, 32, 40].map((x, k) => (
            <Line
              key={x}
              x1={x}
              y1={6 + (k % 2) * 3}
              x2={x - 2}
              y2={12 + (k % 2) * 3}
              stroke={c.freshWater}
              strokeWidth={1.2}
            />
          ))}
          <Rect x={2} y={38} width={44} height={6} fill={c.soilDark} />
          {[
            [10, 30, 8],
            [24, 24, 10],
            [38, 30, 8],
            [17, 34, 7],
            [31, 35, 7],
          ].map(([x, y, r]) => (
            <G key={`${x}-${y}`}>
              <Rect x={x! - 1.2} y={y!} width={2.4} height={44 - y!} fill={c.bark} />
              <Circle cx={x} cy={y} r={r} fill={c.lifeDeep} {...o} />
              <Circle cx={x! - r! / 3} cy={y! - r! / 3} r={r! / 3} fill={c.life} opacity={0.7} />
            </G>
          ))}
          <Path d="M 21 26 q 2 6 -1 12" fill="none" stroke={c.life} strokeWidth={1} />
        </Scene>
      );
    case 'desert':
      return (
        <Scene sky={c.skyMorning} ids={ids} ink={ink}>
          <Circle cx={37} cy={13} r={5} fill={c.sunDisk} />
          <Path d="M 2 34 C 14 28, 26 30, 46 36 V 44 H 2 Z" fill={c.landSand} {...o} />
          <Path d="M 18 40 V 18 a 3 3 0 0 1 6 0 V 40 Z" fill={c.lifeDeep} {...o} />
          <Path
            d="M 18 30 h -4 v -7 a 2 2 0 0 1 4 0 M 24 27 h 4 v -6 a 2 2 0 0 1 4 0 v 6 q 0 3 -4 3 h -4"
            fill={c.lifeDeep}
            {...o}
          />
        </Scene>
      );
    case 'grassland':
      return (
        <Scene sky={c.skyMorning} ids={ids} ink={ink}>
          <Rect x={2} y={30} width={44} height={14} fill={c.landGrass} />
          <Line x1={2} x2={46} y1={30} y2={30} stroke={ink} strokeWidth={0.6} />
          {[6, 12, 18, 24, 30, 36, 42].map((x, k) => (
            <Path
              key={x}
              d={`M ${x} ${42 - (k % 2) * 2} l -3 -12 M ${x} ${42 - (k % 2) * 2} l 0 -14 M ${x} ${42 - (k % 2) * 2} l 3 -11`}
              stroke={k % 3 === 0 ? c.bioSugarEdge : c.lifeDeep}
              strokeWidth={1.1}
              fill="none"
            />
          ))}
        </Scene>
      );
    case 'temperate deciduous forest':
      return (
        <Scene sky={c.skyMorning} ids={ids} ink={ink}>
          <Rect x={2} y={38} width={44} height={6} fill={c.landGrass} />
          {[
            [12, 22, c.orange],
            [26, 18, c.flowerRed],
            [38, 24, c.life],
          ].map(([x, y, col]) => (
            <G key={String(x)}>
              <Rect
                x={(x as number) - 1.5}
                y={y as number}
                width={3}
                height={40 - (y as number)}
                fill={c.bark}
                {...o}
                strokeWidth={0.5}
              />
              <Ellipse
                cx={x as number}
                cy={y as number}
                rx={9}
                ry={8}
                fill={col as string}
                {...o}
              />
            </G>
          ))}
        </Scene>
      );
    case 'taiga':
      return (
        <Scene sky={c.skyMorning} ids={ids} ink={ink}>
          <Rect x={2} y={36} width={44} height={8} fill={c.snow} />
          <Line x1={2} x2={46} y1={36} y2={36} stroke={ink} strokeWidth={0.6} />
          {[
            [10, 12],
            [22, 8],
            [34, 12],
            [44, 16],
          ].map(([x, top]) => (
            <G key={x}>
              <Path
                d={`M ${x} ${top} L ${x! - 6} ${top! + 10} h 3 L ${x! - 7} ${top! + 18} h 3 L ${x! - 8} ${38} h 16 L ${x! + 4} ${top! + 18} h 3 L ${x! + 3} ${top! + 10} h 3 Z`}
                fill={c.lifeDeep}
                {...o}
              />
              <Path d={`M ${x} ${top} l -2 3 h 4 Z`} fill={c.snow} />
            </G>
          ))}
        </Scene>
      );
    case 'tundra':
      return (
        <Scene sky={c.ice} ids={ids} ink={ink}>
          <Rect x={2} y={28} width={44} height={16} fill={c.moss} />
          <Line x1={2} x2={46} y1={28} y2={28} stroke={ink} strokeWidth={0.6} />
          {[
            [10, 34, 7],
            [34, 38, 8],
          ].map(([x, y, rx]) => (
            <Ellipse
              key={x}
              cx={x}
              cy={y}
              rx={rx}
              ry={2.5}
              fill={c.snow}
              {...o}
              strokeWidth={0.5}
            />
          ))}
          {[20, 26, 42].map((x) => (
            <Ellipse
              key={x}
              cx={x}
              cy={31}
              rx={3}
              ry={2}
              fill={c.lichen}
              {...o}
              strokeWidth={0.5}
            />
          ))}
          <Circle cx={12} cy={14} r={4} fill={c.sunDisk} opacity={0.8} />
        </Scene>
      );
    default:
      return null;
  }
}

/** A landscape in a rounded frame: the sky, the drawing clipped to the frame, light on top. */
function Scene({
  sky,
  ids,
  ink,
  children,
}: {
  sky: string;
  ids: Ids;
  ink: string;
  children: ReactNode;
}) {
  return (
    <G>
      <G clipPath={url(ids.clip)}>
        <Rect x={2} y={4} width={44} height={40} fill={sky} />
        {children}
        <Rect x={2} y={4} width={44} height={40} fill={url(ids.light)} />
      </G>
      <Rect x={2} y={4} width={44} height={40} rx={7} fill="none" stroke={ink} strokeWidth={1} />
    </G>
  );
}
