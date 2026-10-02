/**
 * The `projection` card figure (HC78, `typesHe3m.ts`): one map projection on a sort card, 84 ×
 * 52, computed from its formulas: the outline, the graticule every 30°, the land shapes of
 * `landShapes.ts` shaded, and (`tissot`) small Tissot ellipses that show what it keeps. In the
 * card's text colour; flat.
 */
import { ClipPath, Defs, G, Path } from 'react-native-svg';

import { url, usePaintIds } from '@/components/module/reps/paint';
import { extentOf, mapPaths } from '@/components/module/reps/projectionDraw';
import { RAD, domain, tissot } from '@/components/module/reps/projectionMath';
import {
  PROJECTION_CARD_H,
  PROJECTION_CARD_W,
  type ProjectionCard,
} from '@/data/modules/typesHe3m';

/** Where a card's Tissot ellipses sit: a few latitudes on two meridians, inside the domain. */
const SPOTS: [number, number][] = [
  [0, -60],
  [30, -60],
  [60, -60],
  [0, 60],
  [-30, 60],
  [-60, 60],
];

export function ProjectionCardView({
  f,
  ink,
  shade,
}: {
  f: ProjectionCard;
  ink: string;
  shade: string;
}) {
  const ids = usePaintIds('card');
  const [x0, x1, y0, y1] = extentOf(f.projection);
  const pad = 3;
  const k = Math.min(
    (PROJECTION_CARD_W - 2 * pad) / (x1 - x0),
    (PROJECTION_CARD_H - 2 * pad) / (y1 - y0),
  );
  const ox = (PROJECTION_CARD_W - (x1 - x0) * k) / 2;
  const oy = (PROJECTION_CARD_H - (y1 - y0) * k) / 2;
  const P = (x: number, y: number): [number, number] => [ox + (x - x0) * k, oy + (y1 - y) * k];
  const paths = mapPaths(f.projection, P, { every: 30 });
  const dom = domain(f.projection);
  const spots = SPOTS.filter(
    ([la, lo]) =>
      la >= dom.lat[0] + 5 && la <= dom.lat[1] - 5 && lo >= dom.lon[0] && lo <= dom.lon[1],
  );
  return (
    <G>
      <Defs>
        <ClipPath id={ids.card}>
          <Path d={paths.outline} />
        </ClipPath>
      </Defs>
      <G clipPath={url(ids.card)}>
        {f.land !== false
          ? paths.land.map((d, i) => <Path key={i} d={d} fill={shade} fillOpacity={0.55} />)
          : null}
        {[...paths.parallels.map((p) => p.d), ...paths.meridians.map((m) => m.d)].map((d, i) => (
          <Path key={`g${i}`} d={d} stroke={ink} strokeWidth={0.5} opacity={0.45} fill="none" />
        ))}
        {f.tissot
          ? spots.map(([la, lo], i) => (
              <Path
                key={`t${i}`}
                d={`M ${tissot(f.projection, la, lo, 9 * RAD, 20)
                  .map(([x, y]) =>
                    P(x, y)
                      .map((v) => v.toFixed(1))
                      .join(' '),
                  )
                  .join(' L ')} Z`}
                fill={ink}
                fillOpacity={0.5}
              />
            ))
          : null}
      </G>
      <Path d={paths.outline} stroke={ink} strokeWidth={1.2} fill="none" />
    </G>
  );
}
