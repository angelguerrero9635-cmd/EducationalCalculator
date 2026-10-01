/**
 * Riemann sums (H106, `functionGraph` `riemann`), pure: the strips and their sum, for the
 * picture and the harness.
 */
import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { FunctionGraphHs3b } from '@/data/modules/typesHs3b';

type Get = (v: NumOrVar | undefined, fallback: number) => number;
export type Riemann = NonNullable<FunctionGraphHs3b['riemann']>;

/** The strips: each one's left edge, width and height; and their sum. */
export function riemannOf(r: Riemann, f: (x: number) => number, get: Get) {
  const n = Math.max(1, Math.round(get(r.n, 4)));
  const [a, b] = [get(r.from, 0), get(r.to, 1)];
  const w = (b - a) / n;
  const at = r.side === 'left' ? 0 : r.side === 'middle' ? 0.5 : 1;
  const strips = Array.from({ length: Math.min(n, 5000) }, (_, i) => {
    const x = a + i * w;
    return { x, w, y: f(x + at * w) };
  });
  const sum = strips.reduce((s, q) => s + q.y * q.w, 0);
  return { n, a, b, w, strips, sum };
}

/** The x values the window must hold. */
export function riemannXs(r: Riemann | undefined, get: Get): number[] {
  return r ? [get(r.from, 0), get(r.to, 1)] : [];
}
