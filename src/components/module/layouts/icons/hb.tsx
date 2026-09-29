/**
 * Grades 9–12 card icons (group HB), 48 × 48 like every card icon. The names are listed in
 * data/modules/layouts/icons/hb.ts.
 *
 * The five sampling methods, each a population of 36 dots with the 9 its method picks filled
 * (`studyMath.ts`, the same picks as the `studyDesign` figure): simple random, stratified (three
 * bands, three from each), cluster (one whole block), systematic (every 4th, arrows along the
 * rows) and convenience (the nearest corner). Flat, like every diagram.
 */
import type { ReactNode } from 'react';
import { Circle, G, Path, Rect } from 'react-native-svg';

import type { SamplingMethod } from '@/data/modules/typesHsb';
import { usePalette } from '@/theme';

import { clustersOf, sampleOf, strataOf, type Grid } from '../studyMath';
import type { IconProps } from './types';

const METHODS: Record<string, SamplingMethod> = {
  'simple random sample': 'simple random',
  'stratified sample': 'stratified',
  'cluster sample': 'cluster',
  'systematic sample': 'systematic',
  'convenience sample': 'convenience',
};

const GRID: Grid = { cols: 6, rows: 6 };
const STEP = 7;
const X0 = 6.5;
const at = (i: number) => ({ x: X0 + (i % 6) * STEP, y: X0 + Math.floor(i / 6) * STEP });

export function HBIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  const method = METHODS[icon];
  if (!method) return null;
  const picked = new Set(sampleOf(method, GRID, 9));
  const strata = method === 'stratified' ? strataOf(GRID) : [];
  const clusters = method === 'cluster' ? clustersOf(GRID) : [];
  return (
    <G>
      {strata.map((s, b) => (
        <Rect
          key={`s${b}`}
          x={2}
          y={at(s[0]!).y - 3.5}
          width={44}
          height={(s.length / 6) * STEP}
          rx={2}
          fill={b % 2 ? c.chartFill : c.chartSurface}
          stroke={ink}
          strokeWidth={0.6}
        />
      ))}
      {clusters.map((cl, b) => {
        const a = at(cl[0]!);
        const z = at(cl[cl.length - 1]!);
        const whole = cl.every((p) => picked.has(p));
        return (
          <Rect
            key={`c${b}`}
            x={a.x - 3.2}
            y={a.y - 3.2}
            width={z.x - a.x + 6.4}
            height={z.y - a.y + 6.4}
            rx={2}
            fill="none"
            stroke={whole ? c.chartHighlight : ink}
            strokeWidth={whole ? 1.6 : 0.6}
          />
        );
      })}
      {method === 'systematic' ? (
        // Counting along the rows: a small arrow at the end of each.
        <G>
          {[0, 1, 2, 3, 4, 5].map((r) => (
            <Path
              key={`a${r}`}
              d={`M${X0 + 5 * STEP + 3.5},${X0 + r * STEP - 1.8}L${X0 + 5 * STEP + 6},${X0 + r * STEP}L${X0 + 5 * STEP + 3.5},${X0 + r * STEP + 1.8}Z`}
              fill={ink}
              opacity={0.6}
            />
          ))}
        </G>
      ) : null}
      {method === 'convenience' ? (
        <Path
          d="M1,1 L10,1 M1,1 L1,10"
          stroke={c.chartSecond}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
      ) : null}
      {Array.from({ length: 36 }, (_, i) => {
        const p = at(i);
        const on = picked.has(i);
        return (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={on ? 2.6 : 1.9}
            fill={on ? c.chartHighlight : 'none'}
            stroke={on ? c.chartHighlight : ink}
            strokeWidth={0.9}
          />
        );
      })}
    </G>
  );
}
