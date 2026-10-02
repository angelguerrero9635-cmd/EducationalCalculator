/**
 * Paths for the `projection` picture and card (HC78): the graticule, the outline of the
 * projected domain and the land shapes of `landShapes.ts`, each edge cut into short steps so a
 * conic or azimuthal map curves as it should. Pure functions of a projection and a mapper.
 */
import { LAND } from './landShapes';
import { domain, project, type ProjectionName } from './projectionMath';

type ToPx = (x: number, y: number) => [number, number];

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** A path through (lat, lon) points (clamped to the domain's latitudes), projected. */
function trace(
  name: ProjectionName,
  pts: [number, number][],
  toPx: ToPx,
  lat: [number, number],
  close = false,
): string {
  const d = pts.map(([la, lo], i) => {
    const [x, y] = project(name, clamp(la, lat[0], lat[1]), lo);
    const [px, py] = toPx(x, y);
    return `${i ? 'L' : 'M'} ${px.toFixed(1)} ${py.toFixed(1)}`;
  });
  return d.join(' ') + (close ? ' Z' : '');
}

/** Points from a to b (lat, lon) at most `step` degrees apart. */
function steps(a: [number, number], b: [number, number], step = 2): [number, number][] {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) / step));
  return Array.from({ length: n }, (_, k) => [
    a[0] + ((b[0] - a[0]) * k) / n,
    a[1] + ((b[1] - a[1]) * k) / n,
  ]);
}

export function mapPaths(
  name: ProjectionName,
  toPx: ToPx,
  { every = 15, mercatorTop = 80 }: { every?: number; mercatorTop?: number } = {},
) {
  const dom = domain(name, mercatorTop);
  const [la0, la1] = dom.lat;
  const [lo0, lo1] = dom.lon;
  const parallels: { lat: number; d: string }[] = [];
  for (let la = Math.ceil(la0 / every) * every; la <= la1; la += every) {
    if (Math.abs(la) >= 89.9) continue;
    parallels.push({
      lat: la,
      d: trace(name, steps([la, lo0], [la, lo1]).concat([[la, lo1]]), toPx, dom.lat),
    });
  }
  const meridians: { lon: number; d: string }[] = [];
  for (let lo = Math.ceil(lo0 / every) * every; lo <= lo1; lo += every)
    meridians.push({
      lon: lo,
      d: trace(name, steps([la0, lo], [la1, lo]).concat([[la1, lo]]), toPx, dom.lat),
    });
  const outline = trace(
    name,
    [
      ...steps([la0, lo0], [la0, lo1]),
      ...steps([la0, lo1], [la1, lo1]),
      ...steps([la1, lo1], [la1, lo0]),
      ...steps([la1, lo0], [la0, lo0]),
    ],
    toPx,
    dom.lat,
    true,
  );
  const land = LAND.map((ring) => {
    const pts: [number, number][] = [];
    ring.forEach(([lo, la], i) => {
      const [nlo, nla] = ring[(i + 1) % ring.length]!;
      pts.push(...steps([la, lo], [nla, nlo], 3));
    });
    return trace(name, pts, toPx, dom.lat, true);
  });
  return { parallels, meridians, outline, land, dom };
}

/** The projected extent of a domain: [xmin, xmax, ymin, ymax] in globe radii. */
export function extentOf(name: ProjectionName, mercatorTop = 80): [number, number, number, number] {
  const dom = domain(name, mercatorTop);
  let [x0, x1, y0, y1] = [Infinity, -Infinity, Infinity, -Infinity];
  for (let la = dom.lat[0]; la <= dom.lat[1] + 1e-9; la += (dom.lat[1] - dom.lat[0]) / 36)
    for (let lo = dom.lon[0]; lo <= dom.lon[1] + 1e-9; lo += (dom.lon[1] - dom.lon[0]) / 72) {
      const [x, y] = project(name, la, lo);
      [x0, x1, y0, y1] = [Math.min(x0, x), Math.max(x1, x), Math.min(y0, y), Math.max(y1, y)];
    }
  return [x0, x1, y0, y1];
}
