/**
 * Sums for college round 4, group M's pictures (docs/RENDERINGS_HE.md), shared by the
 * components and the harness checks.
 */

// ─── HC174: soil phases ──────────────────────────────────────────────────────────

export interface SoilPhaseParts {
  /** Void ratio and degree of saturation used. */
  e: number;
  S: number;
  /** Volumes: air, water, solids, voids, total (V_s = 1 unless scaled to a volume). */
  Va: number;
  Vw: number;
  Vs: number;
  Vv: number;
  V: number;
}

/**
 * The phase volumes from what is known: e from wG_s ÷ S when not given, S from wG_s ÷ e.
 * `w` is a fraction. `V` scales the block (V_s = V ÷ (1 + e)); left out, V_s = 1.
 */
export function soilPhaseParts(k: {
  Gs?: number;
  w?: number;
  S?: number;
  e?: number;
  V?: number;
}): SoilPhaseParts | undefined {
  let { e, S } = k;
  const { Gs, w } = k;
  if (e === undefined && S !== undefined && S > 0 && Gs !== undefined && w !== undefined)
    e = (w * Gs) / S;
  if (e === undefined || !(e >= 0) || !Number.isFinite(e)) return undefined;
  if (S === undefined && Gs !== undefined && w !== undefined) S = e > 0 ? (w * Gs) / e : 0;
  if (S === undefined) return undefined;
  const Vs = k.V !== undefined ? k.V / (1 + e) : 1;
  const Vv = e * Vs;
  const Vw = S * Vv;
  return { e, S, Va: Vv - Vw, Vw, Vs, Vv, V: Vs + Vv };
}

/**
 * Labels kept apart along one axis: each wants `want`, keeps at least `gap` from the next and
 * stays in [lo, hi]. Returns the placed positions in the input's order.
 */
export function spreadApart(want: number[], gap: number, lo: number, hi: number): number[] {
  const order = want.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  const ys = order.map((o) => o.y);
  for (let i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i]!, ys[i - 1]! + gap);
  if (ys.length && ys[ys.length - 1]! > hi) {
    ys[ys.length - 1] = hi;
    for (let i = ys.length - 2; i >= 0; i--) ys[i] = Math.min(ys[i]!, ys[i + 1]! - gap);
  }
  if (ys.length && ys[0]! < lo) {
    ys[0] = lo;
    for (let i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i]!, ys[i - 1]! + gap);
  }
  const out = new Array<number>(want.length);
  order.forEach((o, k) => (out[o.i] = ys[k]!));
  return out;
}

// ─── HC175: level of service ─────────────────────────────────────────────────────

/** HCM 7th edition, basic freeway segments: the upper densities of A–E (pc/mi/ln). */
export const LOS_BOUNDS = [11, 18, 26, 35, 45] as const;
export const LOS_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

/** The level of service for a density: the first band whose bound it does not pass. */
export function losOf(d: number, bounds: readonly number[] = LOS_BOUNDS): number {
  const i = bounds.findIndex((b) => d <= b);
  return i === -1 ? bounds.length : i;
}
