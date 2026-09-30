import { Circle, G } from 'react-native-svg';

import { chart, usePalette } from '@/theme';

import { sig, SubLabel, Vec } from './hskKit';

/** Longest arrow at the point (px). */
const LONG = 64;

/**
 * The `charges` field point (H102): with two charges, the field at a point on their line from
 * each charge, dashed (E₁ above, E₂ below), and their sum E solid through the point, all on one
 * scale, + to the right.
 */
export function PointField({
  x,
  y,
  field,
  w,
  faded,
}: {
  x: number;
  y: number;
  field: { E1: number; E2: number; E: number };
  w: number;
  faded: boolean;
}) {
  const c = usePalette();
  const px = Math.min(w - 14, Math.max(14, x));
  const big = Math.max(1e-300, Math.abs(field.E1), Math.abs(field.E2), Math.abs(field.E));
  const k = LONG / big;
  const parts = [
    { v: field.E1, dy: -22, name: 'E_1' },
    { v: field.E2, dy: 22, name: 'E_2' },
  ];
  return (
    <G opacity={faded ? 0.45 : 1}>
      {parts.map((p) => (
        <G key={p.name}>
          <Vec
            x1={px}
            y1={y + p.dy}
            x2={px + p.v * k}
            y2={y + p.dy}
            color={c.chartMuted}
            width={2}
            dash={chart.dashFine}
            head={7}
          />
          <SubLabel
            x={px + p.v * k + (p.v >= 0 ? 6 : -6)}
            y={y + p.dy + 5}
            text={p.name}
            anchor={p.v >= 0 ? 'start' : 'end'}
            color={c.chartMuted}
            w={w}
          />
        </G>
      ))}
      <Vec x1={px} y1={y} x2={px + field.E * k} y2={y} color={c.forceNet} head={9} />
      <Circle cx={px} cy={y} r={4.5} fill={c.chartInk} stroke={c.card} strokeWidth={1.5} />
      <SubLabel x={px} y={y + 50} text={`E ${sig(field.E)} N/C`} color={c.forceNet} w={w} />
    </G>
  );
}
