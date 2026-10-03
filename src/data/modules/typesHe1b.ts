/**
 * Picture specs for college pictures, round 1, group B (HC3 in `pictureRequestsHe1b.ts`; the
 * request is in docs/RENDERINGS_HE.md), kept apart from `types.ts` so that file's union only
 * names them. A `NumOrVar` field is a fixed number or a variable id; every other string is a
 * variable id.
 *
 * Lengths are read in the page's declared units and drawn to one scale: a wall typed in mm
 * beside a width in m keeps its true proportion (lengths convert through the unit registry).
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

/** The cross-sections `section` draws. */
export type SectionShape =
  /** b × h. */
  | 'rectangle'
  /** A flange b_f × t_f on a web t_w × h_w (the web under it). */
  | 'tee'
  /** An I or W-shape: depth d, flanges b_f × t_f, web t_w. */
  | 'wide'
  /** An L: a vertical leg h and a horizontal leg b, both t thick. */
  | 'angle'
  /** A solid round of diameter d. */
  | 'circle'
  /** A round tube, outside diameter d, inside di. */
  | 'tube'
  /** A plate b × h with a round hole (`hole`). */
  | 'hole'
  /** A pressurized cylinder's wall: inside radius r, wall t. */
  | 'cylinder'
  /** A closed thin-walled box b × h to the wall's mid-line, wall t. */
  | 'box'
  /** A reinforced concrete beam or column b × h with its bars. */
  | 'rc';

/**
 * HC3: a cross-section to scale (ME-P3, ACC-P6). The shape from its sizes, the centroid with
 * x̄ and ȳ from the bottom-left corner (the reference axes), the centroidal axis, and options:
 *
 * - `axis`: a parallel axis x′ at distance d below the centroid, I = Ī + Ad²; `parts`: each
 *   part's centroid and its offset dᵢ from the section's (a composite I);
 * - `stress`: the stress block beside the section, `edge` its largest value and `load` what
 *   causes it: `bending` (linear, zero at ȳ, C over T), `shear` (τ = VQ ÷ It, a parabola in a
 *   rectangle), `plastic` (±σ_Y split at the equal-area axis), `torsion` (τ growing with r, on
 *   a circle or tube), `hoop` (a skin element with σ_h and σ_a, or the Lamé curve when `thick`);
 * - `whitney`: an RC beam's strain line from 0.003 at the top to ε_t at the bars, zero at c, and
 *   the 0.85f′_c block of depth a with C and T;
 * - `thinWalled`: a box or tube with equal shear-flow arrows q round the wall, A_m shaded.
 *
 * Every field is optional but the shape and its sizes; a value that is "?" draws nothing (no
 * marker, no label, no block). Sizes that make no section (a hole past the plate's edge, bars
 * that don't fit inside the cover) draw faded with the reason in the caption.
 */
export interface SectionSpec {
  kind: 'section';
  shape: SectionShape;
  /** The length unit of fixed numbers (default the first size variable's unit). */
  unit?: string;
  /** Width: rectangle, plate, box, RC; an angle's horizontal leg. */
  b?: NumOrVar;
  /** Height: rectangle, plate, box, RC (overall); an angle's vertical leg. */
  h?: NumOrVar;
  /** A W-shape's depth; a circle's or tube's outside diameter; an RC beam's effective depth. */
  d?: NumOrVar;
  bf?: NumOrVar;
  tf?: NumOrVar;
  tw?: NumOrVar;
  hw?: NumOrVar;
  /** Wall or leg thickness: angle, box, thin tube, cylinder. */
  t?: NumOrVar;
  /** A tube's inside diameter. */
  di?: NumOrVar;
  /** A cylinder's inside radius. */
  r?: NumOrVar;
  /** A cylinder's outside radius (a thick wall typed by its radii; else `t`). */
  ro?: NumOrVar;
  /** The plate's hole: diameter d, its center x from the left edge (y default mid-height). */
  hole?: { d: NumOrVar; x: NumOrVar; y?: NumOrVar };
  /** x̄ and ȳ, from the left edge and the bottom (the reference axes). */
  centroid?: { x?: string; y?: string };
  /** The area A (the gross area for RC; the enclosed area A_m with `thinWalled`). */
  area?: string;
  /** Ī about the horizontal centroidal axis. */
  inertia?: string;
  /** A parallel axis x′ at distance `d` below the centroidal axis, and I about it. */
  axis?: { d: NumOrVar; inertia?: string };
  /** A composite's parts: each one's offset from the section's centroid (dᵢ, up positive). */
  parts?: { d?: string[] };
  /** The polar moment J (circle, tube). */
  polar?: string;
  /** The radius of gyration k = √(I ÷ A), dashed at ±k from the centroidal axis. */
  gyration?: string;
  /** Steel shear: the web shaded, A_w = d t_w. */
  web?: string;
  stress?: 'bending' | 'shear' | 'plastic' | 'torsion' | 'hoop';
  /** The block's largest value: σ_max, τ_max, σ_Y, σ_h. */
  edge?: NumOrVar;
  /** What makes it: M (bending, plastic), V (shear), T (torsion), p (hoop). */
  load?: NumOrVar;
  /** Hoop: the axial stress σ_a. */
  axial?: string;
  /** Hoop: a thick wall, the Lamé curve σ_θ(r) across it. */
  thick?: boolean;
  // ── RC ──
  /** How many bars. */
  bars?: NumOrVar;
  /** The bar size: #3–#11 (nominal diameters #3 0.375 in to #11 1.41 in). */
  barSize?: NumOrVar;
  /** Or one bar's area A_b (in²), the bar drawn at √(4A_b ÷ π). */
  barArea?: NumOrVar;
  /** Clear cover to the tie (default 1.5 in, read in the section's unit). */
  cover?: NumOrVar;
  /** A beam's bars in a row at the bottom (default), or a column's round the edge. */
  layout?: 'bottom' | 'perimeter';
  /** A column's ties: rectangular ties (default) or a round spiral. */
  tie?: 'tied' | 'spiral';
  /** The steel area A_s (A_st on a column). */
  steel?: string;
  /** A beam's stirrup legs' area A_v (both legs labelled). */
  stirrup?: string;
  whitney?: boolean;
  a?: string;
  c?: string;
  epsT?: string;
  /** β₁ (default 0.85, as the page passes it). */
  beta1?: NumOrVar;
  /** f′_c, for the block's 0.85f′_c label. */
  fc?: NumOrVar;
  // ── thin-walled ──
  thinWalled?: boolean;
  /** Shear flow q, the same all round one closed cell. */
  q?: string;
  /** Torque T on the cell. */
  torque?: NumOrVar;
  /** Shear stress in the wall τ = q ÷ t. */
  tau?: string;
}

export type He1bSpec = SectionSpec;

/** Every variable id a group-B picture reads (for modules.test.ts). */
export function he1bSpecVars(r: He1bSpec): string[] {
  return ids(
    r.b,
    r.h,
    r.d,
    r.bf,
    r.tf,
    r.tw,
    r.hw,
    r.t,
    r.di,
    r.r,
    r.ro,
    r.hole?.d,
    r.hole?.x,
    r.hole?.y,
    r.centroid?.x,
    r.centroid?.y,
    r.area,
    r.inertia,
    r.axis?.d,
    r.axis?.inertia,
    ...(r.parts?.d ?? []),
    r.polar,
    r.gyration,
    r.web,
    r.edge,
    r.load,
    r.axial,
    r.bars,
    r.barSize,
    r.barArea,
    r.cover,
    r.steel,
    r.stirrup,
    r.a,
    r.c,
    r.epsT,
    r.beta1,
    r.fc,
    r.q,
    r.torque,
    r.tau,
  );
}
