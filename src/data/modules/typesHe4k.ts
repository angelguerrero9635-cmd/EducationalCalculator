/**
 * College pictures, round 4, group K (docs/RENDERINGS_HE.md): the new kinds HC160 `dialyzer`,
 * HC161 `attenuation`.
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

// ─── HC161: attenuation ────────────────────────────────────────────────────────

/**
 * HC161 (B-P32): a narrow beam through a slab, or an ultrasound echo.
 *
 * `beam` (the default): an X-ray source, twenty photon tracks into a painted slab `x` cm thick
 * (to scale across), each stopping at its own depth (the quantiles of e^(−μz), so the share
 * still going at depth z is e^(−μz)); those that cross reach the detector. Each half-value layer
 * ln 2 ÷ μ is a dashed line marked ½, ¼, ⅛ …, and under the slab, on the same depth axis, the
 * curve I ÷ I₀ = e^(−μz) with the exit share ringed. `mu` per cm; `share` the page's I ÷ I₀
 * (% or a fraction) and `hvl` its half-value layer (cm), both checked.
 *
 * `echo`: a probe on the skin over two tissues meeting at depth `d` (cm), and the pulse's round
 * trip drawn against time: down to the boundary at t ÷ 2 and back at `t` (μs), so d = ct ÷ 2
 * (`c` m/s, default 1540); the transmitted pulse goes on dashed. `z1`, `z2` (MRayl) label the
 * tissues and `r` (%) is the reflected share ((Z₂ − Z₁) ÷ (Z₂ + Z₁))², checked. `layers` names
 * the two tissues (default "Tissue 1", "Tissue 2").
 */
export interface AttenuationSpec {
  kind: 'attenuation';
  mode?: 'beam' | 'echo';
  mu?: NumOrVar;
  x?: NumOrVar;
  share?: string;
  hvl?: string;
  t?: NumOrVar;
  d?: NumOrVar;
  c?: NumOrVar;
  z1?: NumOrVar;
  z2?: NumOrVar;
  r?: string;
  layers?: [string, string];
}

/** Every new kind of group K. */
export type He4kSpec = DialyzerSpec | AttenuationSpec;

const HE4K_KINDS = new Set<string>(['dialyzer', 'attenuation']);

/** Whether a picture is one of group K's new kinds. */
export const isHe4k = (r: Representation): r is He4kSpec => HE4K_KINDS.has(r.kind);

/** The variable ids a group K spec names. */
export function he4kSpecVars(r: He4kSpec): string[] {
  switch (r.kind) {
    case 'dialyzer':
      return ids(r.qb, r.cin, r.cout, r.k, r.qd, r.t, r.v, r.ktv, r.urr);
    case 'attenuation':
      return ids(r.mu, r.x, r.share, r.hvl, r.t, r.d, r.c, r.z1, r.z2, r.r);
  }
}
