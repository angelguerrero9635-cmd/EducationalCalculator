/**
 * College picture kinds of round 2, group J (docs/RENDERINGS_HE.md): HC28 `stressStrain` and
 * HC33 `stressElement`. Kept apart from `types.ts` so its union only names them. A `NumOrVar` is
 * a fixed number or a variable id; a variable is read in its own unit (MPa, GPa, kPa, psi, ksi,
 * mm, m, N, kN, N·m, mm², mm⁴, % …) and turned into MPa, mm and N for the drawing and the
 * checks; a fixed number is taken in MPa, mm, N and N·mm already.
 */
import type { NumOrVar } from './typesGraphs';

// ─── HC28: a stress–strain curve, a specimen in grips, a tube's section, two members ─────

/**
 * The engineering σ–ε curve and what goes with it.
 *
 * `curve` picks the material model:
 * - `metal` (the default): the elastic line of slope E, a knee through the 0.2% offset point
 *   (σ_Y), hardening to the UTS, necking down to fracture at ε_f (marked ×). Missing `uts` or
 *   `fracture` stops the curve where it is known.
 * - `epp`: elastic–perfectly plastic, flat at σ_Y after ε_Y = σ_Y ÷ E (to `fracture` or 4ε_Y).
 * - `tissue`: a toe region (fibres straightening, `toe` long, default 0.02) then a straight part
 *   of slope E; the page's ε counts from where the straight part meets the axis (said in the
 *   caption).
 * - `linear`: the elastic line alone (a page with E and a point only).
 *
 * `specimen` draws the test piece in grips beside the curve: F at the grips, A (or d) at the
 * waist, the gauge length L and the stretch ΔL (drawn larger when it is too small to see, as the
 * caption says). `section: { shape: 'tube' }` and `parallel` are pictures of their own (no curve):
 * a tube's ring with its neutral axis and bending stress block, and two members sharing a load.
 */
export interface StressStrainSpec {
  kind: 'stressStrain';
  curve?: 'metal' | 'epp' | 'tissue' | 'linear';
  /** Young's modulus (GPa or MPa, by its unit). */
  E?: NumOrVar;
  /** Yield strength σ_Y (the 0.2% offset point on a metal). */
  yield?: NumOrVar;
  /** Ultimate tensile strength. */
  uts?: NumOrVar;
  /** Strain at the UTS (the start of necking); default 0.55 of the fracture strain. */
  uniform?: NumOrVar;
  /** Fracture strain ε_f (a fraction, or % by its unit), and the stress at fracture. */
  fracture?: NumOrVar;
  fractureStress?: NumOrVar;
  /** The point (ε, σ) a page works out; drawn when both are known. */
  strain?: NumOrVar;
  stress?: NumOrVar;
  /** The true curve dashed, σ_T = σ(1 + ε) against ε_T = ln(1 + ε), up to the UTS. */
  true?: boolean;
  /** Shade the resilience triangle (to σ_Y) or the toughness (under the whole curve). */
  area?: 'resilience' | 'toughness';
  /** The page's U_r or U_T (MJ/m³), labelled in the shading. */
  energy?: NumOrVar;
  /** `tissue`: the toe's strain length. */
  toe?: NumOrVar;
  /** A value proportional to the point's strain (F, P, σ, ε or ΔL) that dragging the point sets. */
  drag?: string;
  /** The test piece in grips beside the curve. */
  specimen?: {
    F?: NumOrVar;
    A?: NumOrVar;
    d?: NumOrVar;
    L?: NumOrVar;
    dL?: NumOrVar;
    /** A tendon or ligament in clamps instead of a steel bar. */
    tissue?: boolean;
  };
  /** A hollow round section (a long bone) in bending: the ring, its neutral axis, σ at the edge. */
  section?: {
    shape: 'tube';
    ro: NumOrVar;
    ri: NumOrVar;
    /** Second moment I, the bending moment M and the edge stress σ = Mr_o ÷ I. */
    I?: NumOrVar;
    M?: NumOrVar;
    stress?: NumOrVar;
    /** A solid rod's I for comparison (the stiffness kept, as a percent). */
    solidI?: NumOrVar;
    /** Bone (the default) or steel. */
    material?: 'bone' | 'steel';
  };
  /** Two members bonded side by side under one load, each as wide as its share. */
  parallel?: {
    E1: NumOrVar;
    A1: NumOrVar;
    E2: NumOrVar;
    A2: NumOrVar;
    F?: NumOrVar;
    /** Member 1's share of the load (a fraction, or % by its unit). */
    share?: NumOrVar;
    /** Member 2's stress, σ₂ = F(1 − share) ÷ A₂. */
    stress2?: NumOrVar;
    /** The members' names; default implant and bone. */
    names?: [string, string];
  };
}

export type He2jSpec = StressStrainSpec;

const ids = (xs: (NumOrVar | undefined)[]) => xs.filter((x): x is string => typeof x === 'string');

/** The variable ids a group J picture reads (for the module tests). */
export function he2jSpecVars(r: He2jSpec): string[] {
  const { specimen: sp, section: se, parallel: pa } = r;
  return ids([
    r.E,
    r.yield,
    r.uts,
    r.uniform,
    r.fracture,
    r.fractureStress,
    r.strain,
    r.stress,
    r.energy,
    r.toe,
    r.drag,
    sp?.F,
    sp?.A,
    sp?.d,
    sp?.L,
    sp?.dL,
    se?.ro,
    se?.ri,
    se?.I,
    se?.M,
    se?.stress,
    se?.solidI,
    pa?.E1,
    pa?.A1,
    pa?.E2,
    pa?.A2,
    pa?.F,
    pa?.share,
    pa?.stress2,
  ]);
}
