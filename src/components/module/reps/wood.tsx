/**
 * A wooden stick (a ruler, a yardstick, a meter stick) for measuring pictures: wood with a few
 * grain lines, light from above and an optional lighter "cream" tone, and a jagged left end for
 * a broken ruler. Ticks and numbers are drawn over it by the picture.
 */
import { G, Path } from 'react-native-svg';

import { usePalette } from '@/theme';

import { url } from './paint';

export function WoodStick({
  x0,
  x1,
  y,
  height,
  lightId,
  r = 2,
  tone = 0,
  jagged = false,
}: {
  x0: number;
  x1: number;
  y: number;
  height: number;
  /** Id of a TopLight gradient in the picture's Defs. */
  lightId: string;
  r?: number;
  /** 1: the lighter, cream tone (every other foot or meter). */
  tone?: 0 | 1;
  /** A broken-off left end. */
  jagged?: boolean;
}) {
  const c = usePalette();
  const w = Math.max(1, x1 - x0);
  const rr = Math.min(r, w / 2, height / 2);
  // The outline, clockwise from the top left, with rounded corners.
  const d = `M ${x0 + rr} ${y} H ${x1 - rr} Q ${x1} ${y} ${x1} ${y + rr} V ${y + height - rr} Q ${x1} ${y + height} ${x1 - rr} ${y + height} H ${x0 + rr} Q ${x0} ${y + height} ${x0} ${y + height - rr} V ${y + rr} Q ${x0} ${y} ${x0 + rr} ${y} Z`;
  // A jagged end: the zigzag runs up from the bottom left corner to the top left.
  const broken = jagged
    ? `M ${x0} ${y} H ${x1 - rr} Q ${x1} ${y} ${x1} ${y + rr} V ${y + height - rr} Q ${x1} ${y + height} ${x1 - rr} ${y + height} H ${x0 + 2} ${Array.from(
        { length: 6 },
        (_, k) => `L ${x0 + (k % 2 === 0 ? 6 : 0)} ${y + height - ((k + 1) * height) / 6}`,
      ).join(' ')} Z`
    : d;
  return (
    <G>
      <Path d={broken} fill={c.wood} stroke={c.woodDark} strokeWidth={1} />
      {tone ? <Path d={broken} fill={c.shine} fillOpacity={0.35 * c.sheen + 0.1} /> : null}
      {[0.28, 0.6, 0.82].map((f, k) => (
        <Path
          key={k}
          d={`M ${x0 + 8} ${y + height * f} q ${w * 0.25} ${k % 2 ? 2 : -2} ${w * 0.5} 0 t ${w * 0.5 - 12} 0`}
          fill="none"
          stroke={c.woodDark}
          strokeOpacity={0.22}
          strokeWidth={1}
        />
      ))}
      <Path d={broken} fill={url(lightId)} />
    </G>
  );
}
