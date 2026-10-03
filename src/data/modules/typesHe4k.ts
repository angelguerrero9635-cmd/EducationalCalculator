/**
 * College pictures, round 4, group K (docs/RENDERINGS_HE.md): the new kinds HC160 `dialyzer`,
 * HC161 `attenuation`, HC162 `scaffold`,
 * HC163 `ligandGrid`, HC164 `bioreactor`, HC176 `settlingTank`.
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

// ─── HC162: scaffold ───────────────────────────────────────────────────────────

/**
 * HC162 (B-P33): a porous scaffold as an open-cell cube, three cells a side, painted: square
 * struts along every cell edge, their thickness t ÷ L set so the solid share of a cell,
 * 3(t ÷ L)² − 2(t ÷ L)³, is the relative density ρ∗ ÷ ρ_s (`rhoStar`, `rhoS`, g/cm³). Beside it a
 * bar of the volume, solid below and pores above, with the porosity. `relative` and `porosity`
 * (% or a share) are the page's, checked; `es` and `estar` (MPa) add the Gibson–Ashby modulus
 * E∗ = E_s(ρ∗ ÷ ρ_s)² to the caption. ρ∗ ≥ ρ_s draws a solid block, faded, with the reason.
 */
export interface ScaffoldSpec {
  kind: 'scaffold';
  rhoS: NumOrVar;
  rhoStar: NumOrVar;
  relative?: string;
  porosity?: string;
  es?: NumOrVar;
  estar?: string;
}

// ─── HC163: ligandGrid ─────────────────────────────────────────────────────────

/**
 * HC163 (B-P34): adhesion ligands (RGD) seen from above on a square grid at spacing
 * d = 1000 ÷ √density nm (`density` per μm²), a window of whole grid squares (6 to 40 across,
 * so the dots drawn per μm² are the density exactly), a cell's edge lying over the upper part.
 * A ring of radius `threshold` (nm, default 70) around one ligand under the cell takes in its
 * neighbours when d ≤ threshold; then integrins cluster and focal-adhesion plaques are drawn
 * under the cell; past it, none. `spacing` is the page's d (checked). A scale bar in nm.
 */
export interface LigandGridSpec {
  kind: 'ligandGrid';
  density: NumOrVar;
  spacing?: NumOrVar;
  threshold?: NumOrVar;
}

// ─── HC164: bioreactor ─────────────────────────────────────────────────────────

/**
 * HC164 (B-P35): a stirred glass bioreactor, painted: a sparger bubbling gas into the medium
 * (oxygen dissolving at `kla`, h⁻¹), cells as dots by their density `x` (cells/mL; each dot a
 * power of ten of cells/mL, at most about 120 dots), and a dissolved-oxygen gauge from 0 to
 * `cStar` (mM) filled to C = C∗ − qX ÷ k_La at steady state (`q` pmol/(cell·h); qX in mM/h is
 * q × X × 10⁻⁶). `our`, `c` and `xMax` (X_max = k_La·C∗ ÷ q) are the page's, checked. C ≤ 0
 * empties the gauge and the caption says the cells outrun the supply.
 */
export interface BioreactorSpec {
  kind: 'bioreactor';
  cStar: NumOrVar;
  kla: NumOrVar;
  q: NumOrVar;
  x: NumOrVar;
  our?: string;
  c?: string;
  xMax?: string;
}

// ─── HC176: settlingTank ───────────────────────────────────────────────────────

/**
 * HC176 (ACC-P25): an ideal (Camp) rectangular settling basin in side view, painted concrete
 * and water, `length` × `depth` (m) to scale (the depth stretched by a whole factor when the
 * basin is too shallow to read, and the factor written). A particle enters at the surface and
 * falls at `vs` (m/s) while the water carries it at Q ÷ (width × depth): it lands inside exactly
 * when v_s ≥ v₀ = Q ÷ (length × width). The critical path (v₀, surface to the far corner) is
 * dashed; particles entering below min(1, v_s ÷ v₀) of the depth settle, that band shaded at
 * the inlet. `q` m³/s, `width` m (into the page). `v0`, `removal` (% or a share) and `t`
 * (detention, h) are the page's, checked.
 */
export interface SettlingTankSpec {
  kind: 'settlingTank';
  length: NumOrVar;
  width: NumOrVar;
  depth: NumOrVar;
  q: NumOrVar;
  vs: NumOrVar;
  v0?: string;
  removal?: string;
  t?: string;
}

/** Every new kind of group K. */
export type He4kSpec =
  | DialyzerSpec
  | AttenuationSpec
  | ScaffoldSpec
  | LigandGridSpec
  | BioreactorSpec
  | SettlingTankSpec;

const HE4K_KINDS = new Set<string>([
  'dialyzer',
  'attenuation',
  'scaffold',
  'ligandGrid',
  'bioreactor',
  'settlingTank',
]);

/** Whether a picture is one of group K's new kinds. */
export const isHe4k = (r: Representation): r is He4kSpec => HE4K_KINDS.has(r.kind);

/** The variable ids a group K spec names. */
export function he4kSpecVars(r: He4kSpec): string[] {
  switch (r.kind) {
    case 'dialyzer':
      return ids(r.qb, r.cin, r.cout, r.k, r.qd, r.t, r.v, r.ktv, r.urr);
    case 'attenuation':
      return ids(r.mu, r.x, r.share, r.hvl, r.t, r.d, r.c, r.z1, r.z2, r.r);
    case 'scaffold':
      return ids(r.rhoS, r.rhoStar, r.relative, r.porosity, r.es, r.estar);
    case 'ligandGrid':
      return ids(r.density, r.spacing, r.threshold);
    case 'bioreactor':
      return ids(r.cStar, r.kla, r.q, r.x, r.our, r.c, r.xMax);
    case 'settlingTank':
      return ids(r.length, r.width, r.depth, r.q, r.vs, r.v0, r.removal, r.t);
  }
}
