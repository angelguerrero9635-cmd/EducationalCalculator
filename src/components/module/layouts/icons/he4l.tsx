/**
 * College card icons, round 4, group L, 48 × 48 like every card icon: the line types of an
 * engineering drawing (HC169), each shown on a small part with the line in question lit. Flat
 * line work, as a drawing is. The names are listed in data/modules/layouts/icons/he4l.ts.
 */
import type { ReactNode } from 'react';
import { Circle, G, Line, Path, Rect } from 'react-native-svg';

import { usePalette } from '@/theme';

import type { IconProps } from './types';

const CENTER = '7 2 2 2';
const HIDDEN = '3.5 2';

export function He4lIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  const lit = c.he4lViewInk;
  /** A part's outline (a block with a step), thin unless it is the line shown. */
  const block = (w = 1.4) => (
    <Path d="M 8 38 H 40 V 24 H 26 V 12 H 8 Z" fill={c.card} stroke={ink} strokeWidth={w} />
  );
  /** A small filled arrowhead at (x, y) pointing along (dx, dy). */
  const head = (x: number, y: number, dx: number, dy: number, color: string) => {
    const l = Math.hypot(dx, dy);
    const [ux, uy] = [dx / l, dy / l];
    return (
      <Path
        d={`M ${x} ${y} L ${x - 4 * ux + 1.8 * uy} ${y - 4 * uy - 1.8 * ux} L ${x - 4 * ux - 1.8 * uy} ${y - 4 * uy + 1.8 * ux} Z`}
        fill={color}
      />
    );
  };
  switch (icon) {
    case 'visible line':
      return (
        <G>
          {block(1)}
          <Line
            x1={8}
            y1={38}
            x2={40}
            y2={38}
            stroke={lit}
            strokeWidth={3.2}
            strokeLinecap="round"
          />
          <Line
            x1={40}
            y1={38}
            x2={40}
            y2={24}
            stroke={lit}
            strokeWidth={3.2}
            strokeLinecap="round"
          />
        </G>
      );
    case 'hidden line':
      return (
        <G>
          {block()}
          <Line
            x1={15}
            y1={38}
            x2={15}
            y2={24}
            stroke={lit}
            strokeWidth={2}
            strokeDasharray={HIDDEN}
          />
          <Line
            x1={21}
            y1={38}
            x2={21}
            y2={24}
            stroke={lit}
            strokeWidth={2}
            strokeDasharray={HIDDEN}
          />
        </G>
      );
    case 'center line':
      return (
        <G>
          {block()}
          <Line
            x1={15}
            y1={38}
            x2={15}
            y2={24}
            stroke={ink}
            strokeWidth={1}
            strokeDasharray={HIDDEN}
          />
          <Line
            x1={21}
            y1={38}
            x2={21}
            y2={24}
            stroke={ink}
            strokeWidth={1}
            strokeDasharray={HIDDEN}
          />
          <Line
            x1={18}
            y1={44}
            x2={18}
            y2={6}
            stroke={lit}
            strokeWidth={1.8}
            strokeDasharray={CENTER}
          />
        </G>
      );
    case 'dimension line':
      return (
        <G>
          <Rect x={8} y={24} width={32} height={16} fill={c.card} stroke={ink} strokeWidth={1.4} />
          <Line x1={8} y1={22} x2={8} y2={8} stroke={ink} strokeWidth={0.8} />
          <Line x1={40} y1={22} x2={40} y2={8} stroke={ink} strokeWidth={0.8} />
          <Line x1={10} y1={13} x2={38} y2={13} stroke={lit} strokeWidth={1.6} />
          {head(9, 13, -1, 0, lit)}
          {head(39, 13, 1, 0, lit)}
          <Rect x={18} y={9} width={12} height={8} fill={c.card} />
          <Path
            d="M 20 15 L 22 10 M 24 10 h 4 l -4 5 h 4"
            stroke={lit}
            strokeWidth={1.2}
            fill="none"
          />
        </G>
      );
    case 'extension line':
      return (
        <G>
          <Rect x={8} y={24} width={32} height={16} fill={c.card} stroke={ink} strokeWidth={1.4} />
          <Line x1={8} y1={21} x2={8} y2={6} stroke={lit} strokeWidth={2} />
          <Line x1={40} y1={21} x2={40} y2={6} stroke={lit} strokeWidth={2} />
          <Line x1={10} y1={11} x2={38} y2={11} stroke={ink} strokeWidth={0.8} />
          {head(9, 11, -1, 0, ink)}
          {head(39, 11, 1, 0, ink)}
        </G>
      );
    case 'circle center lines':
      return (
        <G>
          <Rect x={6} y={6} width={36} height={36} fill={c.card} stroke={ink} strokeWidth={1.4} />
          <Circle cx={24} cy={24} r={10} fill="none" stroke={ink} strokeWidth={1.4} />
          <Line
            x1={10}
            y1={24}
            x2={38}
            y2={24}
            stroke={lit}
            strokeWidth={1.6}
            strokeDasharray={CENTER}
          />
          <Line
            x1={24}
            y1={10}
            x2={24}
            y2={38}
            stroke={lit}
            strokeWidth={1.6}
            strokeDasharray={CENTER}
          />
        </G>
      );
    default:
      return null;
  }
}
