/**
 * College pictures, round 4, group K (docs/RENDERINGS_HE.md): the new kinds HC160 `dialyzer`.
 * Kept apart from `types.ts` so the union only names them.
 *
 * Every string is a variable id; a `NumOrVar` is a fixed number or one. A value is read in its
 * variable's formula unit (the unit each field names); a "?" draws nothing for that value.
 */
import type { Representation } from './types';
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── HC160: dialyzer ───────────────────────────────────────────────────────────

/**
 * HC160 (B-P29): a hollow-fiber dialyzer, painted. Blood (`qb`, mL/min) enters the left header
 * at `cin` and leaves the right at `cout` (mg/dL, urea dots in the fibers thinning from one to
 * the other); dialysate runs the other way through the shell. Under it a band of the blood
 * flow, its cleared share (C_in − C_out) ÷ C_in shaded: the clearance K = Q_b(C_in − C_out) ÷
 * C_in. `k` is the page's K (checked); `t` (min), `v` (L), `ktv` and `urr` (%) add the
 * session's Kt/V and URR = 1 − e^(−Kt/V) to the caption. `qd` labels the dialysate flow. A
 * C_out above C_in draws faded with the reason.
 */
export interface DialyzerSpec {
  kind: 'dialyzer';
  qb: NumOrVar;
  cin: NumOrVar;
  cout: NumOrVar;
  k?: string;
  qd?: NumOrVar;
  t?: NumOrVar;
  v?: NumOrVar;
  ktv?: string;
  urr?: string;
}

/** Every new kind of group K. */
export type He4kSpec = DialyzerSpec;

const HE4K_KINDS = new Set<string>(['dialyzer']);

/** Whether a picture is one of group K's new kinds. */
export const isHe4k = (r: Representation): r is He4kSpec => HE4K_KINDS.has(r.kind);

/** The variable ids a group K spec names. */
export function he4kSpecVars(r: He4kSpec): string[] {
  switch (r.kind) {
    case 'dialyzer':
      return ids(r.qb, r.cin, r.cout, r.k, r.qd, r.t, r.v, r.ktv, r.urr);
  }
}
