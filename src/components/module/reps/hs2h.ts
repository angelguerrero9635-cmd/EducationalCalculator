/**
 * Pure helpers for the round 2 group H2H options (H105), shared by the pictures and their
 * harness checks: a value that picks a complex operation or a mirror line, row operations
 * worked out from a matrix, the lab line a rest wavelength names and a tree's outcome names.
 */
import type { Mirror } from '@/data/modules/typesGraphs';
import type { RowOp } from '@/data/modules/typesHsd';
import type { FigureRayPoint } from '@/data/modules/typesHsc';

/** A value read as shown, or undefined while it is "?". */
type Read = (id: string) => number | undefined;

/**
 * `complexPlane` `opFrom`: 1 sum, 2 difference, 3 product, or −1 difference (a ±1 sign value,
 * as `m.11.complex-numbers~add-subtract` stores it); undefined while "?" or another code.
 */
export function complexOp(
  op: 'sum' | 'difference' | 'product' | undefined,
  opFrom: string | undefined,
  read: Read,
): 'sum' | 'difference' | 'product' | undefined {
  if (!opFrom) return op ?? 'sum';
  const code = read(opFrom);
  return code === 1
    ? 'sum'
    : code === 2 || code === -1
      ? 'difference'
      : code === 3
        ? 'product'
        : undefined;
}

/**
 * `transformation` reflect `slope`: a value holding 1 or −1 picks the mirror y = x or y = −x;
 * while it is "?" (or another number) the spec's own `mirror` stands.
 */
export function mirrorOf(m: { mirror: Mirror; slope?: string }, read: Read): Mirror {
  if (!m.slope) return m.mirror;
  const s = read(m.slope);
  return s === 1 ? 'y = x' : s === -1 ? 'y = −x' : m.mirror;
}

const tiny = (x: number) => Math.abs(x) < 1e-9;

/**
 * Row operations worked out from an augmented matrix, as a lesson does them column by column:
 * a zero pivot is swapped with a row below (one with a 1 there first, else the first nonzero),
 * and a pivot that isn't 1 is swapped for a 1 below when there is one; then `echelon` clears
 * under each pivot and scales each pivot row to 1 last (after the rows under it are cleared),
 * and `reduced` scales each pivot to 1 first and clears above and below it (Gauss–Jordan).
 */
export function autoRowOps(m: number[][], how: 'echelon' | 'reduced'): RowOp[] {
  const a = m.map((r) => [...r]);
  const ops: RowOp[] = [];
  const rows = a.length;
  const cols = (a[0]?.length ?? 1) - 1;
  const apply = (op: RowOp) => {
    ops.push(op);
    if ('swap' in op) {
      const [i, j] = op.swap;
      [a[i - 1], a[j - 1]] = [a[j - 1]!, a[i - 1]!];
    } else if ('scale' in op) a[op.scale - 1] = a[op.scale - 1]!.map((x) => x * op.by);
    else
      a[op.add - 1] = a[op.add - 1]!.map((x, j) => {
        const y = x + op.times * a[op.from - 1]![j]!;
        return tiny(y) ? 0 : y;
      });
  };
  const toScale: [number, number][] = [];
  let r = 0;
  for (let j = 0; j < cols && r < rows; j++) {
    const below = Array.from({ length: rows - r }, (_, k) => r + k);
    const one = below.find((i) => Math.abs(a[i]![j]! - 1) < 1e-12);
    const any = below.find((i) => !tiny(a[i]![j]!));
    if (any === undefined) continue;
    const pick = Math.abs(a[r]![j]! - 1) < 1e-12 ? r : (one ?? (tiny(a[r]![j]!) ? any : r));
    if (pick !== r) apply({ swap: [r + 1, pick + 1] });
    const p = a[r]![j]!;
    if (how === 'reduced' && Math.abs(p - 1) > 1e-12) apply({ scale: r + 1, by: 1 / p });
    const pivot = a[r]![j]!;
    for (let i = 0; i < rows; i++) {
      if (i === r || (how === 'echelon' && i < r) || tiny(a[i]![j]!)) continue;
      apply({ add: i + 1, from: r + 1, times: -a[i]![j]! / pivot });
    }
    if (how === 'echelon' && Math.abs(pivot - 1) > 1e-12) toScale.push([r + 1, 1 / pivot]);
    r++;
  }
  for (const [row, by] of toScale) apply({ scale: row, by });
  return ops;
}

const RAD = Math.PI / 180;

/**
 * `markedFigure` points on rays (`FigureRayPoint`): `length` along the ray from `from` at
 * `angle`°, or where it meets the second ray. `reason` says why the values can't place it.
 */
export function rayPoint(
  pts: Record<string, [number, number]>,
  p: FigureRayPoint,
  num: (x: string | number | undefined) => number | undefined,
): { at: [number, number]; reason?: string } {
  const o = pts[p.from] ?? [0, 0];
  const t = num(p.angle);
  let reason = t === undefined ? 'Type the angles that place the rays.' : undefined;
  const d1: [number, number] = [Math.cos((t ?? 45) * RAD), Math.sin((t ?? 45) * RAD)];
  const along = (L: number): [number, number] => [o[0] + L * d1[0], o[1] + L * d1[1]];
  if (!p.meets) {
    const L = p.length === undefined ? 4 : num(p.length);
    if (L === undefined) reason = reason ?? 'Type the lengths that place the points.';
    else if (!(L > 0)) reason = reason ?? 'Every length must be longer than 0.';
    return { at: along(L !== undefined && L > 0 ? L : 4), reason };
  }
  const q = pts[p.meets.from] ?? [0, 0];
  const t2 = num(p.meets.angle);
  if (t2 === undefined) reason = reason ?? 'Type the angles that place the rays.';
  const d2 = [Math.cos((t2 ?? 135) * RAD), Math.sin((t2 ?? 135) * RAD)] as const;
  // o + s·d1 = q + u·d2, both s and u past 0 (the rays, not the lines behind them).
  const D = d2[0] * d1[1] - d1[0] * d2[1];
  const [dx, dy] = [q[0] - o[0], q[1] - o[1]];
  const s = Math.abs(D) < 1e-12 ? NaN : (d2[0] * dy - d2[1] * dx) / D;
  const u = Math.abs(D) < 1e-12 ? NaN : (d1[0] * dy - d1[1] * dx) / D;
  if (!(s > 1e-9 && u > 1e-9))
    return {
      at: along(4),
      reason: reason ?? 'The two rays never meet: no triangle has these angles.',
    };
  return { at: along(s), reason };
}

/** The lab line a spectrum refers to: `line`'s index, or the element's line nearest `rest` nm. */
export function labLineIndex(
  lab: { nm: number }[],
  line: number | 'rest' | undefined,
  restNm: number | undefined,
): number {
  if (line === 'rest') {
    if (restNm === undefined) return 0;
    let best = 0;
    lab.forEach((q, i) => {
      if (Math.abs(q.nm - restNm) < Math.abs(lab[best]!.nm - restNm)) best = i;
    });
    return best;
  }
  return Math.min(lab.length - 1, Math.max(0, line ?? 0));
}
