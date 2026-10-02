/**
 * HC46 `surfacePlot`: what the picture and the harness both work out from a surface — the
 * critical point and its type, the prism sum over a box, the integral, and level curves. Pure.
 */
import type { Surface } from './exprDiffHe3b';

/** The critical point ∇f = 0 by Newton's method from (x, y) (exact in one step for a quadratic). */
export function criticalOf(
  s: Surface,
  x0: number,
  y0: number,
):
  | { x: number; y: number; z: number; D: number; type: 'min' | 'max' | 'saddle' | 'flat' }
  | undefined {
  let [x, y] = [x0, y0];
  for (let i = 0; i < 40; i++) {
    const [gx, gy] = [s.fx(x, y), s.fy(x, y)];
    const [a, b, d] = [s.fxx(x, y), s.fxy(x, y), s.fyy(x, y)];
    const det = a * d - b * b;
    if (!Number.isFinite(det) || Math.abs(det) < 1e-12) return undefined;
    const dx = (d * gx - b * gy) / det;
    const dy = (a * gy - b * gx) / det;
    x -= dx;
    y -= dy;
    if (Math.hypot(dx, dy) < 1e-12 * Math.max(1, Math.hypot(x, y))) break;
  }
  if (Math.hypot(s.fx(x, y), s.fy(x, y)) > 1e-7 * Math.max(1, Math.abs(s.f(x, y))))
    return undefined;
  const D = s.fxx(x, y) * s.fyy(x, y) - s.fxy(x, y) ** 2;
  const type = Math.abs(D) < 1e-12 ? 'flat' : D < 0 ? 'saddle' : s.fxx(x, y) > 0 ? 'min' : 'max';
  return { x, y, z: s.f(x, y), D, type };
}

/** The n × n prisms over [a, b] × [c, d] at their midpoint heights, and their total. */
export function prismsOf(
  f: (x: number, y: number) => number,
  a: number,
  b: number,
  c: number,
  d: number,
  n: number,
) {
  const [dx, dy] = [(b - a) / n, (d - c) / n];
  const cells: { x0: number; y0: number; x1: number; y1: number; h: number }[] = [];
  let sum = 0;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const h = f(a + (i + 0.5) * dx, c + (j + 0.5) * dy);
      cells.push({ x0: a + i * dx, y0: c + j * dy, x1: a + (i + 1) * dx, y1: c + (j + 1) * dy, h });
      sum += h * dx * dy;
    }
  return { cells, sum, dA: dx * dy };
}

/** ∬ f dA over [a, b] × [c, d] by Simpson's rule both ways (exact for cubics). */
export function integral2(
  f: (x: number, y: number) => number,
  a: number,
  b: number,
  c: number,
  d: number,
  n = 40,
) {
  const w = (i: number) => (i === 0 || i === n ? 1 : i % 2 ? 4 : 2);
  const [hx, hy] = [(b - a) / n, (d - c) / n];
  let s = 0;
  for (let i = 0; i <= n; i++)
    for (let j = 0; j <= n; j++) s += w(i) * w(j) * f(a + i * hx, c + j * hy);
  return (s * hx * hy) / 9;
}

/** Segments of the level curve f = level on an n × n grid over the window (marching squares). */
export function levelSegments(
  f: (x: number, y: number) => number,
  [x0, x1]: [number, number],
  [y0, y1]: [number, number],
  level: number,
  n = 36,
): [number, number, number, number][] {
  const out: [number, number, number, number][] = [];
  const [hx, hy] = [(x1 - x0) / n, (y1 - y0) / n];
  const g: number[][] = [];
  for (let i = 0; i <= n; i++) {
    g.push([]);
    for (let j = 0; j <= n; j++) g[i]!.push(f(x0 + i * hx, y0 + j * hy) - level);
  }
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      // Corners counterclockwise from the lower left, and where each edge crosses the level.
      const c: [number, number, number][] = [
        [x0 + i * hx, y0 + j * hy, g[i]![j]!],
        [x0 + (i + 1) * hx, y0 + j * hy, g[i + 1]![j]!],
        [x0 + (i + 1) * hx, y0 + (j + 1) * hy, g[i + 1]![j + 1]!],
        [x0 + i * hx, y0 + (j + 1) * hy, g[i]![j + 1]!],
      ];
      if (c.some((p) => !Number.isFinite(p[2]))) continue;
      const hits: [number, number][] = [];
      for (let k = 0; k < 4; k++) {
        const [p, q] = [c[k]!, c[(k + 1) % 4]!];
        if (p[2] === 0 && q[2] === 0) continue;
        if ((p[2] < 0 && q[2] >= 0) || (p[2] >= 0 && q[2] < 0)) {
          const t = p[2] / (p[2] - q[2]);
          hits.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
        }
      }
      if (hits.length === 2) out.push([hits[0]![0], hits[0]![1], hits[1]![0], hits[1]![1]]);
      else if (hits.length === 4)
        out.push(
          [hits[0]![0], hits[0]![1], hits[1]![0], hits[1]![1]],
          [hits[2]![0], hits[2]![1], hits[3]![0], hits[3]![1]],
        );
    }
  return out;
}

/** Up to `count` round levels spread over the values f takes on the window. */
export function levelsOf(
  f: (x: number, y: number) => number,
  [x0, x1]: [number, number],
  [y0, y1]: [number, number],
  count = 7,
): number[] {
  const zs: number[] = [];
  for (let i = 0; i <= 20; i++)
    for (let j = 0; j <= 20; j++) {
      const z = f(x0 + ((x1 - x0) * i) / 20, y0 + ((y1 - y0) * j) / 20);
      if (Number.isFinite(z)) zs.push(z);
    }
  if (!zs.length) return [];
  const [lo, hi] = [Math.min(...zs), Math.max(...zs)];
  if (hi - lo < 1e-12) return [];
  const raw = (hi - lo) / (count + 1);
  const p = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? 10 * p;
  const out: number[] = [];
  for (let z = Math.ceil(lo / step) * step; z < hi; z += step)
    if (z > lo) out.push(Number(z.toPrecision(12)));
  return out;
}
