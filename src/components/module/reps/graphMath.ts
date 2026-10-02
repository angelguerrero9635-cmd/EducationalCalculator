/**
 * HC50 graphs: the arithmetic the picture and the harness share. A planar graph of any V and E
 * (up to 3V − 6) as a stacked triangulation drawn with straight edges, degrees, the cheapest
 * path (Dijkstra), a complete binary tree's levels and a prefix code from its lengths.
 */

export interface Pt {
  x: number;
  y: number;
}
export interface PlainEdge {
  from: string;
  to: string;
  cost?: number;
}

/** The most edges a simple planar graph on V vertices can have. */
export const planarMax = (V: number) => (V < 3 ? (V * (V - 1)) / 2 : 3 * V - 6);

/**
 * A connected planar graph with V vertices and E edges (V − 1 ≤ E ≤ 3V − 6), in a unit box (y
 * down): an outer triangle, each next vertex at the centroid of the largest face so far joined
 * to its three corners. The first V − 1 edges are a spanning tree, so any E keeps it connected.
 */
export function planarGraph(V: number, E: number) {
  if (!(V >= 1 && V <= 16 && E >= V - 1 && E <= planarMax(V))) return undefined;
  const pos: Pt[] = [
    { x: 0.5, y: 0.02 },
    { x: 0.02, y: 0.98 },
    { x: 0.98, y: 0.98 },
  ].slice(0, Math.min(V, 3));
  if (V === 2) pos[1] = { x: 0.98, y: 0.5 };
  if (V === 2) pos[0] = { x: 0.02, y: 0.5 };
  const tree: [number, number][] = V >= 2 ? [[0, 1]] : [];
  if (V >= 3) tree.push([1, 2]);
  const rest: [number, number][] = V >= 3 ? [[0, 2]] : [];
  let faces: [number, number, number][] = V >= 3 ? [[0, 1, 2]] : [];
  const area = ([a, b, c]: [number, number, number]) =>
    Math.abs(
      (pos[b]!.x - pos[a]!.x) * (pos[c]!.y - pos[a]!.y) -
        (pos[c]!.x - pos[a]!.x) * (pos[b]!.y - pos[a]!.y),
    ) / 2;
  for (let k = 3; k < V; k++) {
    const f = faces.reduce((best, g) => (area(g) > area(best) ? g : best));
    const [a, b, c] = f;
    pos.push({
      x: (pos[a]!.x + pos[b]!.x + pos[c]!.x) / 3,
      y: (pos[a]!.y + pos[b]!.y + pos[c]!.y) / 3,
    });
    tree.push([k, a]);
    rest.push([k, b], [k, c]);
    faces = faces.filter((g) => g !== f);
    faces.push([a, b, k], [b, c, k], [a, c, k]);
  }
  const edges = [...tree, ...rest].slice(0, E);
  return { pos, edges };
}

/** Each vertex's degree. */
export function degreesOf(names: string[], edges: { from: string; to: string }[]) {
  const d = new Map(names.map((n) => [n, 0]));
  for (const e of edges) {
    d.set(e.from, (d.get(e.from) ?? 0) + 1);
    d.set(e.to, (d.get(e.to) ?? 0) + 1);
  }
  return d;
}

/** Dijkstra from `from`: each vertex's distance and the vertex before it on its cheapest path. */
export function dijkstra(names: string[], edges: PlainEdge[], from: string) {
  const dist = new Map(names.map((n) => [n, Infinity]));
  const prev = new Map<string, string>();
  const done = new Set<string>();
  const order: string[] = [];
  dist.set(from, 0);
  while (done.size < names.length) {
    let u: string | undefined;
    for (const n of names) {
      if (!done.has(n) && (u === undefined || dist.get(n)! < dist.get(u)!)) u = n;
    }
    if (u === undefined || dist.get(u) === Infinity) break;
    done.add(u);
    order.push(u);
    for (const e of edges) {
      const v = e.from === u ? e.to : e.to === u ? e.from : undefined;
      if (v === undefined || done.has(v)) continue;
      const alt = dist.get(u)! + (e.cost ?? 1);
      if (alt < dist.get(v)! - 1e-12) {
        dist.set(v, alt);
        prev.set(v, u);
      }
    }
  }
  return { dist, prev, order };
}

/** The cheapest path's vertices from `from` to `to`, or undefined when there is none. */
export function cheapestPath(names: string[], edges: PlainEdge[], from: string, to: string) {
  const { dist, prev } = dijkstra(names, edges, from);
  if (!Number.isFinite(dist.get(to))) return undefined;
  const path = [to];
  while (path[0] !== from) path.unshift(prev.get(path[0]!)!);
  return { path, cost: dist.get(to)! };
}

/** A complete binary tree of n nodes: the nodes on each level 0…levels − 1. */
export const treeLevels = (n: number, levels: number) =>
  Array.from({ length: levels }, (_, k) => Math.max(0, Math.min(2 ** k, n - (2 ** k - 1))));

/** The least height of a binary tree with n nodes (edges from the root): ⌈log₂(n + 1)⌉ − 1. */
export const leastHeight = (n: number) => Math.ceil(Math.log2(n + 1) - 1e-12) - 1;

/**
 * A prefix code from codeword lengths (canonical: shorter first, in order), with the Kraft sum
 * Σ 2^(−l); no code when the sum is past 1 or a length isn't a whole number from 1 to 8.
 */
export function prefixCode(lengths: number[]) {
  const kraft = lengths.reduce((s, l) => s + 2 ** -l, 0);
  const whole = lengths.every((l) => Number.isInteger(l) && l >= 1 && l <= 8);
  if (!whole || kraft > 1 + 1e-12) return { kraft, codes: undefined };
  const order = lengths.map((l, i) => ({ l, i })).sort((a, b) => a.l - b.l || a.i - b.i);
  const codes: string[] = new Array(lengths.length);
  let code = 0;
  let len = order[0]?.l ?? 0;
  for (const { l, i } of order) {
    code <<= l - len;
    len = l;
    codes[i] = code.toString(2).padStart(l, '0');
    code++;
  }
  return { kraft, codes };
}
