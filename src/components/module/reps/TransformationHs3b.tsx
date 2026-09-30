/**
 * H106 (round 3, group B): `transformation` turned about the figure's own center
 * (`about: 'center'`). The center is the corners' average (where `symmetry` tests its turns),
 * so a page needs no center values. Point symmetry is drawn: each corner joined through the
 * center to its partner straight across, the two halves ticked equal. The math is in
 * `transformHs3b.ts`, shared with the harness.
 */
import { G, Line } from 'react-native-svg';

import { chart, usePalette } from '@/theme';

import type { Pt } from './transform';
import { pointPartners } from './transformHs3b';

/** The pairs through the center, dashed, each half ticked. */
export function PointPairs({
  pts,
  center,
  P,
}: {
  pts: Pt[];
  center: Pt;
  P: (p: Pt) => readonly [number, number];
}) {
  const c = usePalette();
  const partners = pointPartners(pts, center);
  const [cx, cy] = P(center);
  return (
    <G>
      {pts.map((p, i) => {
        const j = partners[i]!;
        if (j < i) return null; // each pair once (and none without a partner)
        const [x1, y1] = P(p);
        const [x2, y2] = P(pts[j]!);
        const len = Math.hypot(x2 - x1, y2 - y1) || 1;
        const [nx, ny] = [-(y2 - y1) / len, (x2 - x1) / len];
        const tick = (x: number, y: number, k: number) => (
          <Line
            key={`t${i}-${k}`}
            x1={x - nx * 5}
            y1={y - ny * 5}
            x2={x + nx * 5}
            y2={y + ny * 5}
            stroke={c.chartSecond}
            strokeWidth={chart.stroke}
          />
        );
        return (
          <G key={`pp${i}`}>
            <Line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={c.chartSecond}
              strokeWidth={chart.stroke}
              strokeDasharray={chart.dashFine}
            />
            {tick((x1 + cx) / 2, (y1 + cy) / 2, 0)}
            {tick((x2 + cx) / 2, (y2 + cy) / 2, 1)}
          </G>
        );
      })}
    </G>
  );
}
