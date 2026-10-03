/**
 * College card icons, round 4, group L, 48 × 48 like every card icon: the line types of an
 * engineering drawing (HC169), each shown on a small part with the line in question lit; and the
 * 14 GD&T characteristic symbols (HC170), drawn by us to the standard's shapes in a feature
 * control frame's first cell. Flat line work, as a drawing is. The names are listed in data/modules/layouts/icons/he4l.ts.
 */
import type { ReactNode } from 'react';
import { Circle, G, Line, Path, Rect, Text } from 'react-native-svg';

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
          <Text x={24} y={16.5} fontSize={9} fontWeight="700" textAnchor="middle" fill={lit}>
            20
          </Text>
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
      return gdt(icon);
  }

  /** A GD&T symbol in the first cell of a feature control frame. */
  function gdt(name: string): ReactNode {
    const sw = 2.4;
    const line = (x1: number, y1: number, x2: number, y2: number, k: string) => (
      <Line
        key={k}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={ink}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    );
    const arrow = (x1: number, y1: number, x2: number, y2: number, k: string) => (
      <G key={k}>
        {line(x1, y1, x2 - (x2 - x1) * 0.18, y2 - (y2 - y1) * 0.18, `${k}l`)}
        {head(x2, y2, x2 - x1, y2 - y1, ink)}
      </G>
    );
    const shape: Record<string, ReactNode> = {
      'GD&T straightness': line(11, 24, 37, 24, 's'),
      'GD&T flatness': (
        <Path
          d="M 9 32 L 32 32 L 39 16 L 16 16 Z"
          fill="none"
          stroke={ink}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      ),
      'GD&T circularity': (
        <Circle cx={24} cy={24} r={12} fill="none" stroke={ink} strokeWidth={sw} />
      ),
      'GD&T cylindricity': (
        <G>
          <Circle cx={24} cy={24} r={9} fill="none" stroke={ink} strokeWidth={sw} />
          {line(11, 34.4, 20, 7.8, 'a')}
          {line(28, 40.2, 37, 13.6, 'b')}
        </G>
      ),
      'GD&T perpendicularity': (
        <G>
          {line(24, 10, 24, 36, 'a')}
          {line(10, 36, 38, 36, 'b')}
        </G>
      ),
      'GD&T parallelism': (
        <G>
          {line(12, 37, 22, 11, 'a')}
          {line(26, 37, 36, 11, 'b')}
        </G>
      ),
      'GD&T angularity': (
        <G>
          {line(10, 36, 38, 36, 'a')}
          {line(10, 36, 34, 14, 'b')}
        </G>
      ),
      'GD&T position': (
        <G>
          <Circle cx={24} cy={24} r={9} fill="none" stroke={ink} strokeWidth={sw} />
          {line(9, 24, 39, 24, 'a')}
          {line(24, 9, 24, 39, 'b')}
        </G>
      ),
      'GD&T profile of a line': (
        <Path d="M 8 32 A 16 16 0 0 1 40 32" fill="none" stroke={ink} strokeWidth={sw} />
      ),
      'GD&T profile of a surface': (
        <Path
          d="M 8 32 A 16 16 0 0 1 40 32 Z"
          fill="none"
          stroke={ink}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      ),
      'GD&T circular runout': arrow(15, 37, 33, 11, 'a'),
      'GD&T total runout': (
        <G>
          {arrow(10, 36, 23, 12, 'a')}
          {arrow(24, 36, 37, 12, 'b')}
          {line(10, 36, 24, 36, 'c')}
        </G>
      ),
      'GD&T concentricity': (
        <G>
          <Circle cx={24} cy={24} r={13} fill="none" stroke={ink} strokeWidth={sw} />
          <Circle cx={24} cy={24} r={6} fill="none" stroke={ink} strokeWidth={sw} />
        </G>
      ),
      'GD&T symmetry': (
        <G>
          {line(15, 15, 33, 15, 'a')}
          {line(8, 24, 40, 24, 'b')}
          {line(15, 33, 33, 33, 'c')}
        </G>
      ),
    };
    if (!(name in shape)) return null;
    return (
      <G>
        <Rect
          x={2}
          y={2}
          width={44}
          height={44}
          rx={2}
          fill={c.card}
          stroke={ink}
          strokeWidth={1.2}
        />
        {shape[name]}
      </G>
    );
  }
}
