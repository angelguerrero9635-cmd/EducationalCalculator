/**
 * H109 `flowerCycle` card figure (112 × 76, for sequence stages): one stage of a flowering
 * plant's life cycle, the part it is about lit.
 *
 * - `pollination`: a flower cut in half, pollen carried from an anther to the stigma;
 * - `pollen tube`: the pistil, a pollen grain on the stigma growing its tube down the style to
 *   an ovule in the ovary;
 * - `fertilization`: an ovule close up, the tube's tip at its opening and a sperm meeting the egg;
 * - `seed and fruit`: the ovary grown into a pod (the fruit) with its seeds;
 * - `dispersal`: a dandelion seed on its parachute, drifting on the wind;
 * - `germination`: a seed in the soil, the root growing down and the shoot hooking up;
 * - `seedling`: the young plant, its first leaves open above the soil.
 *
 * Drawn in the plant's colors, light from the top left, outlines in the card's ink.
 */
import { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { FlowerStage } from '@/data/modules/typesHs3d';
import { usePalette, type Palette } from '@/theme';

export const FLOWER_CARD_W = 112;
export const FLOWER_CARD_H = 76;

export function FlowerCycleCard({ stage, ink }: { stage: FlowerStage; ink: string }) {
  const c = usePalette();
  const hi = c.chartHighlight;
  const o = { stroke: ink, strokeWidth: 1, strokeLinejoin: 'round' as const };
  switch (stage) {
    case 'pollination':
      return (
        <G>
          <MiniFlower c={c} o={o} />
          {/* Pollen carried from the left anther to the stigma. */}
          <Path
            d="M 36 24 C 36 6, 52 2, 55 14"
            fill="none"
            stroke={hi}
            strokeWidth={1.6}
            strokeDasharray="3 2"
          />
          <Path d="M 52 11 l 3 4 l 2 -5" fill="none" stroke={hi} strokeWidth={1.6} />
          {[
            [44, 5],
            [50, 6],
          ].map(([x, y]) => (
            <Circle key={x} cx={x} cy={y} r={1.8} fill={c.pollen} stroke={ink} strokeWidth={0.5} />
          ))}
          <Circle cx={56} cy={18} r={7} fill="none" stroke={hi} strokeWidth={1.8} />
        </G>
      );
    case 'pollen tube':
      return (
        <G>
          <Pistil c={c} o={o} />
          <Circle cx={53} cy={9} r={3} fill={c.pollen} stroke={ink} strokeWidth={0.6} />
          <Path
            d="M 54 11 C 56 26, 55 42, 56 54 C 57 58, 60 60, 63 61"
            fill="none"
            stroke={hi}
            strokeWidth={2}
          />
        </G>
      );
    case 'fertilization':
      return (
        <G>
          {/* An ovule: its coats, the sac inside, the egg by the opening at the bottom. */}
          <Ellipse cx={56} cy={36} rx={30} ry={26} fill={c.life} {...o} />
          <Ellipse cx={56} cy={34} rx={22} ry={19} fill={c.flowerWhite} {...o} strokeWidth={0.8} />
          <Circle cx={56} cy={44} r={6} fill={c.petalPink} {...o} />
          <Path d="M 60 75 C 58 68, 57 62, 56 54" fill="none" stroke={hi} strokeWidth={2} />
          <Circle cx={56} cy={51} r={2} fill={hi} />
          <Circle cx={56} cy={44} r={9.5} fill="none" stroke={hi} strokeWidth={1.6} />
        </G>
      );
    case 'seed and fruit':
      return (
        <G>
          {/* A pea pod opened: the ovary's wall, the fruit, around its seeds. */}
          <Path d="M 12 40 C 24 22, 88 18, 102 30 C 96 50, 30 58, 12 40 Z" fill={c.life} {...o} />
          <Path d="M 18 40 C 36 30, 80 28, 96 32" fill="none" stroke={c.lifeDeep} strokeWidth={1} />
          {[28, 43, 58, 73, 87].map((x) => (
            <Circle key={x} cx={x} cy={37} r={6} fill={c.lifeDeep} {...o} />
          ))}
          <Path d="M 102 30 l 6 -6" stroke={c.lifeDeep} strokeWidth={2} />
          <Rect
            x={8}
            y={14}
            width={98}
            height={46}
            rx={10}
            fill="none"
            stroke={hi}
            strokeWidth={1.6}
          />
        </G>
      );
    case 'dispersal':
      return (
        <G>
          {/* Wind lines, and a dandelion seed drifting under its parachute. */}
          {[18, 30, 44].map((y, k) => (
            <Path
              key={y}
              d={`M ${6 + k * 4} ${y} q 10 -4 20 0 t 20 0`}
              fill="none"
              stroke={c.chartMuted}
              strokeWidth={1.2}
            />
          ))}
          <G transform="rotate(18 76 36)">
            {[-60, -40, -20, 0, 20, 40, 60].map((a) => (
              <Line
                key={a}
                x1={76}
                y1={24}
                x2={76 + 16 * Math.sin((a * Math.PI) / 180)}
                y2={24 - 16 * Math.cos((a * Math.PI) / 180)}
                stroke={ink}
                strokeWidth={0.8}
              />
            ))}
            <Line x1={76} y1={24} x2={76} y2={50} stroke={ink} strokeWidth={0.8} />
            <Ellipse cx={76} cy={56} rx={3} ry={7} fill={c.bark} stroke={hi} strokeWidth={1.6} />
          </G>
        </G>
      );
    case 'germination':
      return (
        <G>
          <Soil c={c} y={30} />
          <Ellipse cx={50} cy={46} rx={10} ry={7} fill={c.furLight} {...o} />
          {/* The root down, the shoot's hook up through the soil. */}
          <Path d="M 52 52 C 54 60, 52 66, 56 74" fill="none" stroke={hi} strokeWidth={2.2} />
          <Path
            d="M 56 42 C 60 34, 60 26, 64 22 C 66 20, 68 22, 68 26"
            fill="none"
            stroke={hi}
            strokeWidth={2.2}
          />
        </G>
      );
    case 'seedling':
      return (
        <G>
          <Soil c={c} y={52} />
          <Path d="M 56 52 L 56 22" stroke={c.lifeDeep} strokeWidth={2.4} />
          <Path
            d="M 56 60 C 54 66, 58 70, 55 75 M 56 60 L 48 68 M 56 62 L 64 70"
            fill="none"
            stroke={c.furLight}
            strokeWidth={1.4}
          />
          {[
            'M 56 36 C 46 26, 34 28, 30 34 C 38 40, 48 40, 56 36 Z',
            'M 56 30 C 66 20, 78 22, 82 28 C 74 34, 64 34, 56 30 Z',
          ].map((d) => (
            <Path key={d} d={d} fill={c.life} {...o} />
          ))}
          <Path d="M 56 22 C 50 14, 52 8, 56 6 C 60 8, 62 14, 56 22 Z" fill={c.life} {...o} />
          <Rect
            x={24}
            y={2}
            width={64}
            height={52}
            rx={10}
            fill="none"
            stroke={hi}
            strokeWidth={1.6}
          />
        </G>
      );
  }
}

type Outline = { stroke: string; strokeWidth: number; strokeLinejoin: 'round' };

/** A flower cut in half, small: sepals, petals, two stamens, the pistil. */
function MiniFlower({ c, o }: { c: Palette; o: Outline }) {
  return (
    <G>
      <Path d="M 56 74 L 56 62" stroke={c.lifeDeep} strokeWidth={3} />
      <Path d="M 54 62 C 44 66, 34 64, 28 58 C 38 56, 48 58, 54 62 Z" fill={c.life} {...o} />
      <Path d="M 58 62 C 68 66, 78 64, 84 58 C 74 56, 64 58, 58 62 Z" fill={c.life} {...o} />
      <Path d="M 52 60 C 38 52, 26 38, 28 18 C 40 26, 50 42, 54 58 Z" fill={c.petalPink} {...o} />
      <Path d="M 60 60 C 74 52, 86 38, 84 18 C 72 26, 62 42, 58 58 Z" fill={c.petalPink} {...o} />
      <Path
        d="M 52 58 C 46 46, 40 36, 38 28 M 60 58 C 66 46, 72 36, 74 28"
        fill="none"
        stroke={o.stroke}
        strokeWidth={1}
      />
      <Ellipse cx={37} cy={25} rx={3} ry={5} fill={c.pollen} {...o} />
      <Ellipse cx={75} cy={25} rx={3} ry={5} fill={c.pollen} {...o} />
      <Path d="M 56 52 L 56 22" stroke={c.life} strokeWidth={3} />
      <Ellipse cx={56} cy={55} rx={7} ry={6} fill={c.life} {...o} />
      <Path d="M 51 22 C 52 17, 60 17, 61 22 Z" fill={c.sunDisk} {...o} />
    </G>
  );
}

/** The pistil, large: stigma, style and the ovary with one ovule. */
function Pistil({ c, o }: { c: Palette; o: Outline }) {
  return (
    <G>
      <Path d="M 52 12 L 52 50 L 60 50 L 60 12 Z" fill={c.life} {...o} />
      <Path d="M 44 12 C 46 4, 66 4, 68 12 C 62 9, 50 9, 44 12 Z" fill={c.sunDisk} {...o} />
      <Ellipse cx={56} cy={60} rx={20} ry={13} fill={c.life} {...o} />
      <Ellipse cx={64} cy={61} rx={6} ry={5} fill={c.flowerWhite} {...o} />
    </G>
  );
}

function Soil({ c, y }: { c: Palette; y: number }) {
  return (
    <G>
      <Rect x={4} y={y} width={104} height={76 - y} rx={4} fill={c.soil} />
      <Line x1={4} x2={108} y1={y} y2={y} stroke={c.soilDark} strokeWidth={1.5} />
    </G>
  );
}
