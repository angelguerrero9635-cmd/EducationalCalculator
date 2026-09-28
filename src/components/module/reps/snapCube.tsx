import { G, Path, Rect } from 'react-native-svg';

import { usePalette } from '@/theme';

import { url } from './paint';

/**
 * A plastic snap cube seen from the side, `s` px square with its top-left corner at (x, y): a
 * raised face (a bright edge at the top left, shade at the bottom right, light from above) and
 * the nub on top that snaps into the next cube. Trains leave a 1 px gap between cubes.
 */
export function SnapCube({
  x,
  y,
  s,
  color,
  lightId,
  faded = false,
}: {
  x: number;
  y: number;
  s: number;
  color: string;
  /** Id of a TopLight gradient in the picture's Defs. */
  lightId: string;
  faded?: boolean;
}) {
  const c = usePalette();
  const k = Math.max(1.5, s * 0.08);
  const nubW = s * 0.36;
  const nubH = Math.max(2.5, s * 0.12);
  return (
    <G opacity={faded ? 0.35 : 1}>
      <Rect
        x={x + (s - nubW) / 2}
        y={y - nubH + 1}
        width={nubW}
        height={nubH + 1}
        rx={1.2}
        fill={color}
        stroke={c.chartInk}
        strokeOpacity={0.45}
        strokeWidth={0.8}
      />
      <Rect
        x={x}
        y={y}
        width={s}
        height={s}
        rx={2}
        fill={color}
        stroke={c.chartInk}
        strokeOpacity={0.55}
        strokeWidth={1}
      />
      <Rect x={x} y={y} width={s} height={s} rx={2} fill={url(lightId)} />
      {/* The raised face: light along the top and left, shade along the bottom and right. */}
      <Path
        d={`M ${x + k} ${y + s - k} V ${y + k} H ${x + s - k}`}
        fill="none"
        stroke={c.edgeLight}
        strokeWidth={k * 0.9}
        strokeLinecap="round"
      />
      <Path
        d={`M ${x + s - k} ${y + k} V ${y + s - k} H ${x + k}`}
        fill="none"
        stroke={c.edgeShade}
        strokeWidth={k * 0.9}
        strokeLinecap="round"
      />
    </G>
  );
}
