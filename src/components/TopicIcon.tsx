import Svg, { Circle, G, Path } from 'react-native-svg';

import type { TopicIconName } from '@/data/icons';
import { CUSTOM } from '@/icons/custom';

const DRAWINGS: Record<string, string> = CUSTOM;

const num = (s: string) => s.split(',').map(Number) as [number, number, number];

/**
 * One of the Browse icons, drawn in `color` on a 24 × 24 grid. A drawing is a list of parts
 * separated by "|": a path ("M…"), a filled path ("F:M…"), a circle ("c:x,y,r"), a filled
 * circle ("C:x,y,r"), or any of these turned about the center ("R60:M…").
 */
export function TopicIcon({
  name,
  size = 26,
  color,
}: {
  name: TopicIconName;
  size?: number;
  color: string;
}) {
  const stroke = {
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  const part = (spec: string, key: number) => {
    const turn = /^R(\d+):/.exec(spec);
    if (turn) {
      return (
        <G key={key} rotation={Number(turn[1])} origin="12, 12">
          {part(spec.slice(turn[0].length), key)}
        </G>
      );
    }
    if (spec.startsWith('C:') || spec.startsWith('c:')) {
      const [cx, cy, r] = num(spec.slice(2));
      return spec[0] === 'C' ? (
        <Circle key={key} cx={cx} cy={cy} r={r} fill={color} />
      ) : (
        <Circle key={key} cx={cx} cy={cy} r={r} {...stroke} />
      );
    }
    if (spec.startsWith('F:')) return <Path key={key} d={spec.slice(2)} fill={color} />;
    return <Path key={key} d={spec} {...stroke} />;
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {(DRAWINGS[name] ?? '').split('|').map(part)}
    </Svg>
  );
}
