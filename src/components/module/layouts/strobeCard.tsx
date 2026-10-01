import { Circle, G, Line, Path } from 'react-native-svg';

import { STROBE_W, strobeDots, type StrobeCard } from '@/data/modules/layouts/strobeCard';
import { chart } from '@/theme';

/**
 * A motion diagram on a sort card (H102): the dots one second apart along a track (tilted on a
 * ramp), the first one open, and an arrow over them the way it moves. Flat, in the card's ink.
 */
export function StrobeCardView({ f, ink }: { f: StrobeCard; ink: string }) {
  const dots = strobeDots(f);
  const first = dots[0]!;
  const last = dots[dots.length - 1]!;
  const left = f.dir === 'left';
  // The track under the dots, from edge to edge.
  const dx = last.x - first.x || 1;
  const slope = (last.y - first.y) / dx;
  const [ta, tb] = left ? [STROBE_W - 4, 4] : [4, STROBE_W - 4];
  const trackY = (x: number) => first.y + 5 + slope * (x - first.x);
  // The arrow the way it moves, over the middle of the card.
  const [a0, a1] = left
    ? [STROBE_W / 2 + 16, STROBE_W / 2 - 16]
    : [STROBE_W / 2 - 16, STROBE_W / 2 + 16];
  const ay = 8;
  const head = left ? `M ${a1} ${ay} l 6 -4 l 0 8 Z` : `M ${a1} ${ay} l -6 -4 l 0 8 Z`;
  return (
    <G>
      <Line
        x1={ta}
        y1={trackY(ta)}
        x2={tb}
        y2={trackY(tb)}
        stroke={ink}
        strokeWidth={chart.strokeLight}
        opacity={0.5}
      />
      <Line
        x1={a0}
        y1={ay}
        x2={a1 + (left ? 4 : -4)}
        y2={ay}
        stroke={ink}
        strokeWidth={chart.stroke}
      />
      <Path d={head} fill={ink} />
      {dots.map((d, i) => (
        <Circle
          key={i}
          cx={d.x}
          cy={d.y}
          r={3}
          fill={i === 0 ? 'none' : ink}
          stroke={ink}
          strokeWidth={1.25}
        />
      ))}
    </G>
  );
}
