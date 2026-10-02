/**
 * Picture specs for college pictures, round 2, group I (docs/RENDERINGS_HE.md): HC27 `truss`,
 * its card figure `trussJoint` and HC26 `soilProfile`. Kept apart from `types.ts` so its union
 * only names them. A `NumOrVar` field is a fixed number or a variable id, in the page's own
 * units (the spec names them).
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: unknown[]) => xs.filter((x): x is string => typeof x === 'string');

/** A coordinate: a number, a variable id, or `[id, k]` for k times the value (L ÷ 2). */
export type TrussCoord = NumOrVar | [string, number];

/**
 * A pin-jointed truss (HC27; ME-P2, ACC-P15), flat members painted as steel angles on gusset
 * plates, lengths in m and forces in kN unless `units` says otherwise. Every member force is
 * worked out here by the method of joints (+ tension); a member tied to a page value shows that
 * value, and a value that is "?" draws no number.
 *
 * - Joints and members given (`joints`, `members`), or a panel truss (`panels`): `pratt` and
 *   `howe` with inclined end posts (m = 4n − 3, j = 2n), `warren` without verticals
 *   (m = 4n − 1, j = 2n + 1), a load P at every inner bottom joint, a pin at the left and a
 *   roller at the right (two pins when `counts.r` is 4).
 * - `forces`: which members carry their force label: `all` (the default with joints given),
 *   `cut` (the default for panels: only the cut members, listed under the drawing), `none`.
 *   A zero-force member always shows 0, dashed.
 * - `cut`: a section through panel `panel` (0 is the left end panel; `'mid'` the one whose
 *   moment centre is at midspan), its left part shaded as the free body; `chord` names the
 *   chord found by moments about the joint where the other two cut members meet. M, F, V and
 *   F_d are the page's values, checked: F × h = M and F_d sin θ = V.
 * - `counts`: m, j and r drawn and counted; degree = m + r − 2j.
 * - `deflect`: a joint's deflection by the unit load, δ = ΣFfL ÷ (AE), the moved joint dashed
 *   (A in mm², E in GPa, δ in mm).
 * - `mode: 'element'`: one bar element of a finite-element truss: nodes 1 and 2, θ from the
 *   x axis, node 2 moved by Δu and Δv (mm, drawn larger) and δ, the part along the bar. A in
 *   mm², E in GPa, L in m, f in kN, σ in MPa.
 */
export interface TrussSpec {
  kind: 'truss';
  mode?: 'truss' | 'element';
  panels?: {
    type: 'pratt' | 'howe' | 'warren';
    n: NumOrVar;
    length: NumOrVar;
    height: NumOrVar;
    load: NumOrVar;
    /** The page's support reaction (each, by symmetry), checked against (n − 1)P ÷ 2. */
    reaction?: NumOrVar;
  };
  joints?: { name: string; x: TrussCoord; y: TrussCoord }[];
  members?: { from: string; to: string; force?: NumOrVar }[];
  supports?: { joint: string; kind: 'pin' | 'roller'; reaction?: NumOrVar }[];
  loads?: { joint: string; P: NumOrVar; dir?: 'down' | 'up' | 'left' | 'right' }[];
  forces?: 'all' | 'cut' | 'none';
  /** An angle marked at `joint` between two members, its value from the page (degrees). */
  angle?: { joint: string; from: string; to: string; value?: NumOrVar };
  cut?: {
    panel: number | 'mid';
    chord: 'top' | 'bottom';
    /** The moment centre's distance from the left support (checked against the drawing). */
    x?: NumOrVar;
    M?: NumOrVar;
    F?: NumOrVar;
    V?: NumOrVar;
    Fd?: NumOrVar;
    theta?: NumOrVar;
  };
  counts?: { m?: NumOrVar; j?: NumOrVar; r?: NumOrVar; degree?: NumOrVar };
  deflect?: { joint: string; delta: NumOrVar; A: NumOrVar; E: NumOrVar };
  element?: {
    L: NumOrVar;
    theta: NumOrVar;
    du: NumOrVar;
    dv: NumOrVar;
    delta?: NumOrVar;
    A?: NumOrVar;
    E?: NumOrVar;
    f?: NumOrVar;
    sigma?: NumOrVar;
  };
  units?: { length?: string; force?: string };
}

export function trussVars(r: TrussSpec): string[] {
  const coord = (c: TrussCoord) => (Array.isArray(c) ? [c[0]] : ids(c));
  const p = r.panels;
  const e = r.element;
  return [
    ...(p ? ids(p.n, p.length, p.height, p.load, p.reaction) : []),
    ...(r.joints ?? []).flatMap((j) => [...coord(j.x), ...coord(j.y)]),
    ...ids(...(r.members ?? []).map((m) => m.force)),
    ...ids(...(r.supports ?? []).map((s) => s.reaction)),
    ...ids(...(r.loads ?? []).map((l) => l.P)),
    ...ids(r.angle?.value),
    ...(r.cut ? ids(r.cut.x, r.cut.M, r.cut.F, r.cut.V, r.cut.Fd, r.cut.theta) : []),
    ...(r.counts ? ids(r.counts.m, r.counts.j, r.counts.r, r.counts.degree) : []),
    ...(r.deflect ? ids(r.deflect.delta, r.deflect.A, r.deflect.E) : []),
    ...(e ? ids(e.L, e.theta, e.du, e.dv, e.delta, e.A, e.E, e.f, e.sigma) : []),
  ];
}

/**
 * The `trussJoint` card figure (HC27; statics#1~zero-force): one joint of a truss with its
 * members (directions in degrees, 0 to the right, 90 up), a load pushing on it from the side it
 * points away from (`load`, the force's direction), and a pin under it. It never says which
 * members carry nothing: that is the card's question.
 */
export interface TrussJointCard {
  kind: 'trussJoint';
  members: number[];
  load?: number;
  support?: 'pin' | 'roller';
}

export const TRUSS_CARD_W = 96;
export const TRUSS_CARD_H = 72;

/** A soil layer, top down: its kind (how it is painted), thickness (m) and unit weights. */
export interface SoilLayer {
  soil: 'sand' | 'clay' | 'silt' | 'gravel';
  name?: string;
  thickness: NumOrVar;
  /** Unit weight above the water table, and saturated below it (kN/m³). */
  gamma?: NumOrVar;
  gammaSat?: NumOrVar;
}

/**
 * Soil to scale (HC26; ACC-P17), painted in its materials (sand, silt, clay, gravel, concrete,
 * asphalt); the stress lines and plans stay flat. Lengths in m and stresses in kPa unless a mode
 * says otherwise.
 *
 * - `stress`: layers with the water table at `zw`; σ, u and σ′ against depth beside the column,
 *   read at depth `z` (σ = Σγh, u = γ_w(z − z_w) below the table and 0 above, σ′ = σ − u).
 *   `gammaW` is the page's unit weight of water (default 9.81). The last layer runs on down.
 * - `consolidation`: a clay layer `H` thick under a new load `ds` (Δσ), its mid-depth point
 *   with `s0` (σ′₀), drainage arrows out of the top (and the bottom when `drainage: 'double'`),
 *   the drainage path `Hdr`, and the settled surface `S` dashed to scale. `Cs` and `sp` (σ′_p)
 *   make it overconsolidated.
 * - `footing`: a strip (or `shape: 'square'`) footing `B` wide with its base at `Df`, to scale,
 *   q_u pushing up on its base, and the general shear failure wedges from `phi` (the active
 *   wedge, the log-spiral zone and the passive wedge on each side).
 * - `plan`: a square footing seen from above, `B` on a side, the column `c` square at its
 *   middle, the punching perimeter d ÷ 2 out from the column's faces (b₀ = 4(c + d)), the area
 *   outside it shaded. `perB` is how many units of c and d make one unit of B (12: in and ft).
 * - `pavement`: surface, base and subbase to scale by `D` (in) on the subgrade, each with its
 *   a and m, a wheel and its axle load on top; SN = Σ a·D·m.
 */
export type SoilProfileSpec =
  | {
      kind: 'soilProfile';
      mode: 'stress';
      layers: SoilLayer[];
      zw: NumOrVar;
      z: NumOrVar;
      gammaW?: NumOrVar;
      sigma?: NumOrVar;
      u?: NumOrVar;
      sigmaEff?: NumOrVar;
    }
  | {
      kind: 'soilProfile';
      mode: 'consolidation';
      H: NumOrVar;
      s0?: NumOrVar;
      ds?: NumOrVar;
      Cc?: NumOrVar;
      e0?: NumOrVar;
      Cs?: NumOrVar;
      sp?: NumOrVar;
      S?: NumOrVar;
      drainage?: 'double' | 'single';
      Hdr?: NumOrVar;
    }
  | {
      kind: 'soilProfile';
      mode: 'footing';
      B: NumOrVar;
      Df: NumOrVar;
      phi: NumOrVar;
      /** q_u, checked against the bearing equation when `c` and `gamma` are given. */
      q?: NumOrVar;
      c?: NumOrVar;
      gamma?: NumOrVar;
      shape?: 'strip' | 'square';
    }
  | {
      kind: 'soilProfile';
      mode: 'plan';
      B: NumOrVar;
      c: NumOrVar;
      d: NumOrVar;
      b0?: NumOrVar;
      perB?: number;
      units?: { B?: string; c?: string };
    }
  | {
      kind: 'soilProfile';
      mode: 'pavement';
      layers: { a: NumOrVar; D: NumOrVar; m?: NumOrVar }[];
      SN?: NumOrVar;
      load?: NumOrVar;
    };

export function soilProfileVars(r: SoilProfileSpec): string[] {
  switch (r.mode) {
    case 'stress':
      return [
        ...r.layers.flatMap((l) => ids(l.thickness, l.gamma, l.gammaSat)),
        ...ids(r.zw, r.z, r.gammaW, r.sigma, r.u, r.sigmaEff),
      ];
    case 'consolidation':
      return ids(r.H, r.s0, r.ds, r.Cc, r.e0, r.Cs, r.sp, r.S, r.Hdr);
    case 'footing':
      return ids(r.B, r.Df, r.phi, r.q, r.c, r.gamma);
    case 'plan':
      return ids(r.B, r.c, r.d, r.b0);
    case 'pavement':
      return [...r.layers.flatMap((l) => ids(l.a, l.D, l.m)), ...ids(r.SN, r.load)];
  }
}
