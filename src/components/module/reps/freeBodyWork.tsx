import { G, Line } from 'react-native-svg';

import { chart, usePalette } from '@/theme';

import { SubLabel, Vec } from './hskKit';

/**
 * The `freeBody` displacement option (H102): the pull's part along the floor, F cos θ, dashed
 * from the block's center on the force scale, and the displacement d bracketed under the floor
 * with an arrow the way the block moves (not to the force scale).
 */
export function FreeBodyWork({
  C,
  along,
  floorY,
  w,
  text,
  d,
  faded,
}: {
  /** The block's center. */
  C: { x: number; y: number };
  /** F cos θ in px on the force scale. */
  along: number;
  floorY: number;
  w: number;
  text: string;
  d: string;
  faded: boolean;
}) {
  const c = usePalette();
  const y = floorY + 24;
  // From just past the weight's arrow, the way the block moves.
  const [x0, x1] = [C.x + 10, Math.min(w - 14, C.x + 170)];
  return (
    <G opacity={faded ? 0.45 : 1}>
      <Vec
        x1={C.x}
        y1={C.y}
        x2={C.x + along}
        y2={C.y}
        color={c.forceApplied}
        width={2}
        dash={chart.dashFine}
        head={8}
      />
      {Math.abs(along) > 2 ? (
        <SubLabel
          x={C.x + along + (along >= 0 ? 6 : -6)}
          y={C.y + 18}
          text={text}
          anchor={along >= 0 ? 'start' : 'end'}
          color={c.forceApplied}
          size={chart.label}
          w={w}
        />
      ) : null}
      <Line x1={x0} y1={y - 7} x2={x0} y2={y + 7} stroke={c.chartInk} strokeWidth={1.5} />
      <Vec x1={x0} y1={y} x2={x1} y2={y} color={c.chartInk} width={2} head={9} />
      <SubLabel x={(x0 + x1) / 2} y={y + 22} text={d} w={w} />
    </G>
  );
}
