/**
 * Grades 9–12 card icons (group HG), 48 × 48 like every card icon, drawn in their materials with
 * the helpers in reps/paint.tsx. The names are listed in data/modules/layouts/icons/hg.ts.
 *
 * Cells in water of three tonicities (H32), each in a square of water with its solute dots (few,
 * some, many) and blue arrows for the water's net flow:
 * - a red blood cell swollen round in hypotonic water (water in; it can burst), a biconcave disc
 *   with its pale center in isotonic water, and shrunken with a crenated (spiky) edge in
 *   hypertonic water (water out);
 * - a plant cell turgid in hypotonic water (the membrane pressed to the wall, a big vacuole),
 *   flaccid in isotonic water (a smaller vacuole), and plasmolyzed in hypertonic water (the
 *   membrane and cytoplasm pulled away from the wall).
 */
import type { ReactNode } from 'react';
import { Circle, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import { usePalette, type Palette } from '@/theme';

import { Ball, url, usePaintIds } from '../../reps/paint';
import type { IconProps } from './types';

type Tonicity = 'hypotonic' | 'isotonic' | 'hypertonic';

const tonicityOf = (icon: string): Tonicity | undefined =>
  icon.endsWith('hypotonic water')
    ? 'hypotonic'
    : icon.endsWith('isotonic water')
      ? 'isotonic'
      : icon.endsWith('hypertonic water')
        ? 'hypertonic'
        : undefined;

/** Solute dots in the water: few, some or many, at fixed places round the edge. */
const SOLUTE: [number, number][] = [
  [24, 3.5],
  [24, 44.5],
  [3.5, 24],
  [44.5, 24],
  [14, 4],
  [34, 44],
  [44, 14],
  [4, 34],
  [34, 4],
  [14, 44],
  [4, 14],
  [44, 34],
];
const soluteCount: Record<Tonicity, number> = { hypotonic: 2, isotonic: 6, hypertonic: 12 };

export function HGIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  const ids = usePaintIds('cell');
  const t = tonicityOf(icon);
  if (!t) return null;
  const blood = icon.startsWith('red blood cell');
  return (
    <G>
      <Defs>
        <Ball id={ids.cell} color={c.bloodCell} />
      </Defs>
      <Rect x={1} y={1} width={46} height={46} rx={6} fill={c.water} opacity={0.22} />
      {SOLUTE.slice(0, soluteCount[t]).map(([x, y], k) => (
        <Circle key={k} cx={x} cy={y} r={1.6} fill={c.bioSolute} />
      ))}
      {blood ? <BloodCell t={t} fill={url(ids.cell)} c={c} /> : <PlantCell t={t} c={c} />}
      <WaterArrows
        t={t}
        r={blood ? (t === 'hypotonic' ? 17 : t === 'isotonic' ? 15 : 12) : 22}
        c={c}
      />
      <Rect
        x={1}
        y={1}
        width={46}
        height={46}
        rx={6}
        fill="none"
        stroke={ink}
        strokeWidth={0.6}
        opacity={0.4}
      />
    </G>
  );
}

function BloodCell({ t, fill, c }: { t: Tonicity; fill: string; c: Palette }) {
  if (t === 'hypotonic') {
    // Swollen to a sphere: no pale center left.
    return <Circle cx={24} cy={24} r={16} fill={fill} stroke={c.bloodCellDeep} strokeWidth={1} />;
  }
  if (t === 'isotonic') {
    return (
      <G>
        <Circle cx={24} cy={24} r={14} fill={fill} stroke={c.bloodCellDeep} strokeWidth={1} />
        {/* The dimple of the biconcave disc: a paler center. */}
        <Circle cx={24} cy={24} r={6.5} fill={c.shine} opacity={0.3} />
        <Circle
          cx={24}
          cy={24}
          r={6.5}
          fill="none"
          stroke={c.bloodCellDeep}
          strokeWidth={0.6}
          opacity={0.6}
        />
      </G>
    );
  }
  // Crenated: shrunk, the edge in small points.
  const n = 12;
  const d =
    Array.from({ length: 2 * n }, (_, k) => {
      const a = (k * Math.PI) / n;
      const r = k % 2 ? 8.5 : 11.5;
      return `${k ? 'L' : 'M'} ${24 + r * Math.cos(a)} ${24 + r * Math.sin(a)}`;
    }).join(' ') + ' Z';
  return <Path d={d} fill={fill} stroke={c.bloodCellDeep} strokeWidth={1} strokeLinejoin="round" />;
}

function PlantCell({ t, c }: { t: Tonicity; c: Palette }) {
  // The wall keeps its size; what's inside it swells or shrinks.
  const inner =
    t === 'hypertonic' ? { x: 16, y: 17, w: 16, h: 14 } : { x: 10.5, y: 10.5, w: 27, h: 27 };
  const vac =
    t === 'hypotonic'
      ? { rx: 10, ry: 10 }
      : t === 'isotonic'
        ? { rx: 7, ry: 6.5 }
        : { rx: 4, ry: 3.5 };
  const chloro: [number, number][] =
    t === 'hypertonic'
      ? [
          [19, 20],
          [29, 28],
        ]
      : [
          [14, 14],
          [34, 34],
          [34, 14],
          [14, 34],
        ];
  return (
    <G>
      <Rect
        x={8}
        y={8}
        width={32}
        height={32}
        rx={3}
        fill={c.bioStroma}
        stroke={c.lifeDeep}
        strokeWidth={2.4}
      />
      <Rect
        x={inner.x}
        y={inner.y}
        width={inner.w}
        height={inner.h}
        rx={t === 'hypertonic' ? 7 : 2}
        fill={c.life}
        stroke={c.lifeDeep}
        strokeWidth={0.8}
      />
      <Ellipse cx={24} cy={24} rx={vac.rx} ry={vac.ry} fill={c.water} opacity={0.75} />
      {chloro.map(([x, y], k) => (
        <Ellipse key={k} cx={x} cy={y} rx={2.4} ry={1.5} fill={c.lifeDeep} />
      ))}
    </G>
  );
}

/** Short blue arrows at the four sides: in, out, or both ways (isotonic). */
function WaterArrows({ t, r, c }: { t: Tonicity; r: number; c: Palette }) {
  const sides = [0, 1, 2, 3].map((k) => (k * Math.PI) / 2 + Math.PI / 4);
  const head = (x: number, y: number, a: number) =>
    `M ${x - 2.6 * Math.cos(a - 0.6)} ${y - 2.6 * Math.sin(a - 0.6)} L ${x} ${y} L ${x - 2.6 * Math.cos(a + 0.6)} ${y - 2.6 * Math.sin(a + 0.6)}`;
  return (
    <G>
      {sides.map((a, k) => {
        const [x1, y1] = [24 + (r + 7) * Math.cos(a), 24 + (r + 7) * Math.sin(a)];
        const [x2, y2] = [24 + (r + 1) * Math.cos(a), 24 + (r + 1) * Math.sin(a)];
        const d = `M ${x1} ${y1} L ${x2} ${y2}`;
        const tips =
          t === 'hypotonic'
            ? [head(x2, y2, a + Math.PI)]
            : t === 'hypertonic'
              ? [head(x1, y1, a)]
              : [head(x2, y2, a + Math.PI), head(x1, y1, a)];
        return (
          <G key={k}>
            <Path d={d} stroke={c.waterDeep} strokeWidth={1.3} strokeLinecap="round" />
            {tips.map((p, j) => (
              <Path
                key={j}
                d={p}
                stroke={c.waterDeep}
                strokeWidth={1.3}
                fill="none"
                strokeLinecap="round"
              />
            ))}
          </G>
        );
      })}
    </G>
  );
}
