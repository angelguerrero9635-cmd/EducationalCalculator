/**
 * Picture specs for the college pictures of round 1, group A (HC1 `beam`; see
 * `pictureRequestsHe1a.ts` and docs/RENDERINGS_HE.md), kept apart from `types.ts` so that file's
 * union only names them. A `NumOrVar` field is a fixed number or a variable id.
 *
 * Every value is read in the formula's units (the unit the page declares for the variable), so a
 * page keeps its unit menus; labels show the unit shown. Lengths share one unit (the span's),
 * point loads one force unit, and a distributed load is that force per that length (kN, m and
 * kN/m; or kips, in and kip/in). Every option is off unless a page sets it.
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

/** A support: a pin, a roller or a fixed end (a wall), at `at` from the beam's left end. */
export interface BeamSupport {
  at: NumOrVar;
  kind: 'pin' | 'roller' | 'fixed';
  /** Its letter (default A, B, C … left to right). */
  name?: string;
  /** The page's vertical reaction there, + up. */
  reaction?: NumOrVar;
  /** A fixed end's moment, as the page names it (its size; the picture draws its turn). */
  moment?: NumOrVar;
}

/**
 * A load, pushing down (a negative size pushes up): a point load P at `at`; a uniform load w
 * from `from` to `to` (default the whole beam); a triangular load rising from 0 to w at its
 * `peak` end (default `to`). Arrows are as tall as the load.
 */
export interface BeamLoad {
  kind: 'point' | 'uniform' | 'triangle';
  at?: NumOrVar;
  from?: NumOrVar;
  to?: NumOrVar;
  size: NumOrVar;
  peak?: 'from' | 'to';
  /** The symbol a fixed-number load is labelled with (default P or w). */
  symbol?: string;
  /** A point load's distance to the right end, b = L − a, when the page names it. */
  rest?: NumOrVar;
}

/** One segment of an axial bar, left to right. */
export interface AxialSegment {
  length: NumOrVar;
  /** The cross-section's area, or its `diameter` (a round rod); the bar is drawn as tall as √A. */
  area?: NumOrVar;
  diameter?: NumOrVar;
  /** The segment's own modulus, when the page names one per segment. */
  modulus?: NumOrVar;
  /** The page's elongation of this segment, δᵢ = PᵢLᵢ ÷ (AᵢE). */
  delta?: NumOrVar;
  /** An axial force at this segment's right end, + pulling right. */
  load?: NumOrVar;
}

/**
 * `axial`: a bar of 1–3 segments fixed to a wall at the left, pulled at its right end (or at
 * each segment's end), each segment's δ bracketed and the total. `walls` holds the right end
 * too (a restrained bar): with `temperature` ΔT and `expansion` δ_T the free growth is drawn
 * dashed past the wall and the walls push back with `stress` σ.
 */
export interface BeamAxial {
  segments: AxialSegment[];
  /** The force at the right end, + pulling right (the page's P). */
  load?: NumOrVar;
  /** The modulus for every segment (E). */
  modulus?: NumOrVar;
  /** The page's total elongation δ. */
  total?: NumOrVar;
  walls?: boolean;
  temperature?: NumOrVar;
  expansion?: NumOrVar;
  /** The page's stress: σ = P ÷ A in a one-segment bar, or the walls' σ = −EαΔT. */
  stress?: NumOrVar;
  material?: 'steel' | 'aluminum';
}

/**
 * `column`: an upright column of length L, its ends drawn by K (0.5 fixed–fixed, 0.7
 * fixed–pinned, 1 pinned–pinned, 2 fixed–free), the buckled shape and the half-wave KL
 * bracketed between its inflection points; P pushes down on top.
 */
export interface BeamColumn {
  /** The effective-length factor K: 0.5, 0.7, 1 or 2. */
  k: NumOrVar;
  load?: NumOrVar;
  /** The page's critical load P_cr (or the stress σ_cr with `stress`). */
  pcr?: NumOrVar;
  stress?: NumOrVar;
  /** The page's effective length KL. */
  effective?: NumOrVar;
  /** The page's slenderness KL ÷ r. */
  slenderness?: NumOrVar;
  material?: 'steel' | 'aluminum' | 'concrete';
}

/**
 * `panel`: a skin panel b wide between two stringers, squeezed along them by σ, buckled in
 * half-waves about b long (the shading rises and falls by them; a section shows the wavy skin).
 */
export interface BeamPanel {
  width: NumOrVar;
  thickness?: NumOrVar;
  /** The buckling coefficient k (4 simply supported edges, 6.97 clamped). */
  k?: NumOrVar;
  stress?: NumOrVar;
  /** The panel's length between ribs (default 3b). */
  length?: NumOrVar;
}

/**
 * `plate`: a circular plate of radius a and thickness t cut through its middle, under a
 * uniform pressure p, its edge clamped or simply supported, and the bent middle surface dashed
 * with w_max at the center (drawn bigger than life, said in the caption).
 */
export interface BeamPlate {
  radius: NumOrVar;
  thickness: NumOrVar;
  pressure: NumOrVar;
  /** The edge: by name, or the page's edge factor (1 clamped; (5 + ν) ÷ (1 + ν) simple). */
  edge: 'clamped' | 'simple' | NumOrVar;
  deflection?: NumOrVar;
  stress?: NumOrVar;
}

/**
 * `influence`: under the beam, the influence line of a support's reaction, the shear or the
 * moment at section c: the effect of a load of 1 standing at each point. The ordinates the
 * page names are labelled; a `load` P stands at the peak, and a `uniform` w over the whole span
 * shades the area under the line.
 */
export interface BeamInfluence {
  of: 'reaction' | 'shear' | 'moment';
  /** The section c (shear, moment), or the support's position (reaction). */
  at: NumOrVar;
  /** The page's peak ordinate (moment, reaction). */
  ordinate?: NumOrVar;
  /** Shear: the page's ordinates just left and just right of c. */
  left?: NumOrVar;
  right?: NumOrVar;
  load?: NumOrVar;
  uniform?: NumOrVar;
}

/**
 * `continuous`: a beam over two or three spans (supports at the ends and between spans), with
 * the moment-distribution table under it: each member end's distribution factor, fixed-end
 * moment, balance and carry-over rows, and the final moments (clockwise +). `far: 'pinned'`
 * uses the modified stiffness 3 ÷ L for an end span whose far end is a pin or roller (no
 * carry-over to it); `'fixed'` (default) uses 4 ÷ L everywhere.
 */
export interface BeamContinuous {
  far?: 'pinned' | 'fixed';
  /** The page's distribution factors at the first interior support (left member, right member). */
  df?: NumOrVar[];
  /** The page's fixed-end moments at the first interior support, as sizes (left span, right span). */
  fem?: NumOrVar[];
  /** The page's moment over the first interior support (its size). */
  moment?: NumOrVar;
}

/**
 * `stirrups`: a concrete beam's elevation with its bars and the stirrups at spacing s along the
 * span (the first at s ÷ 2 from each support), the depth d bracketed and s against d ÷ 2.
 */
export interface BeamStirrups {
  spacing: NumOrVar;
  depth: NumOrVar;
  /** The page's largest spacing allowed (d ÷ 2). */
  max?: NumOrVar;
  /** The factored shear V_u at the supports: drawn falling to 0 at midspan under a uniform load. */
  shear?: NumOrVar;
}

export interface BeamSpec {
  kind: 'beam';
  /** `beam` (default): a beam on supports; `axial`, `column`, `panel`, `plate`: see each field. */
  mode?: 'beam' | 'axial' | 'column' | 'panel' | 'plate';
  /** The span, or a column's length. */
  length?: NumOrVar;
  /**
   * A continuous beam's span lengths, left to right, in place of `length` and the supports'
   * places: supports stand at the spans' ends (a pin, then rollers, unless `supports` names
   * each one's kind, letter or reaction in order) and each span is labelled.
   */
  spans?: NumOrVar[];
  supports?: BeamSupport[];
  /**
   * Supports picked by a page value (a slab's support case: ℓ ÷ 20 simply supported, ℓ ÷ 24 one
   * end continuous …): the case whose `value` is nearest is drawn, in place of `supports`.
   */
  supportCase?: { by: NumOrVar; cases: { value: number; supports: BeamSupport[] }[] };
  loads?: BeamLoad[];
  /** A distributed load's resultant, dashed, at its centroid (the page's F_R at x̄ from the left). */
  resultant?: { size: NumOrVar; at: NumOrVar };
  material?: 'steel' | 'concrete' | 'wood' | 'aluminum';
  /** Units for values the picture works out (default kN and m; `length` labels L). */
  units?: { force?: string; length?: string };
  /** A marked section x, with the page's shear and moment there. */
  at?: NumOrVar;
  shear?: NumOrVar;
  moment?: NumOrVar;
  /** The page's largest shear and moment (else worked out and labelled). */
  maxShear?: NumOrVar;
  maxMoment?: NumOrVar;
  /** The shear and moment diagrams under the beam, on its x axis. */
  diagrams?: boolean;
  /** The bent shape, dashed; a value id names δ_max as the page has it. */
  deflection?: boolean | NumOrVar;
  /** The page's end slope θ (at the free end, or the left support). */
  slope?: NumOrVar;
  influence?: BeamInfluence;
  continuous?: BeamContinuous;
  stirrups?: BeamStirrups;
  axial?: BeamAxial;
  column?: BeamColumn;
  panel?: BeamPanel;
  plate?: BeamPlate;
  /** No drags. */
  fixed?: boolean;
}

/** The supports a spec draws: `supportCase`'s nearest case to `value`, else `supports`. */
export function supportsOf(r: BeamSpec, value: (x: NumOrVar) => number | undefined): BeamSupport[] {
  if (!r.supportCase) return r.supports ?? [];
  const x = value(r.supportCase.by);
  const cases = r.supportCase.cases;
  if (x === undefined || !cases.length) return r.supports ?? cases[0]?.supports ?? [];
  return cases.reduce((b, k) => (Math.abs(k.value - x) < Math.abs(b.value - x) ? k : b)).supports;
}

/**
 * The beam's length and each support with its place `x` (undefined while a value it needs is
 * blank), from `spans`, or from `length` and the supports (`supportsOf`).
 */
export function geometryOf(
  r: BeamSpec,
  value: (x: NumOrVar) => number | undefined,
): { length: number | undefined; supports: (BeamSupport & { x: number | undefined })[] } {
  if (r.spans?.length) {
    const lens = r.spans.map(value);
    const ends = lens.reduce<(number | undefined)[]>(
      (acc, l) => [
        ...acc,
        l === undefined || acc[acc.length - 1] === undefined ? undefined : acc[acc.length - 1]! + l,
      ],
      [0],
    );
    return {
      length: ends[ends.length - 1],
      supports: ends.map((x, i) => ({
        kind: i ? 'roller' : 'pin',
        ...r.supports?.[i],
        at: x ?? 0,
        x,
      })),
    };
  }
  return {
    length: r.length === undefined ? undefined : value(r.length),
    supports: supportsOf(r, value).map((s) => ({ ...s, x: value(s.at) })),
  };
}

/** Every variable id a `beam` spec names (for the module tests). */
export function he1aSpecVars(r: BeamSpec): string[] {
  return ids(
    r.length,
    ...(r.spans ?? []),
    r.at,
    r.shear,
    r.moment,
    r.maxShear,
    r.maxMoment,
    typeof r.deflection === 'boolean' ? undefined : r.deflection,
    r.slope,
    ...[...(r.supports ?? []), ...(r.supportCase?.cases.flatMap((k) => k.supports) ?? [])].flatMap(
      (s) => [s.at, s.reaction, s.moment],
    ),
    r.supportCase?.by,
    r.resultant?.size,
    r.resultant?.at,
    ...(r.loads ?? []).flatMap((l) => [l.at, l.from, l.to, l.size, l.rest]),
    ...(r.influence
      ? [
          r.influence.at,
          r.influence.ordinate,
          r.influence.left,
          r.influence.right,
          r.influence.load,
          r.influence.uniform,
        ]
      : []),
    ...(r.continuous
      ? [...(r.continuous.df ?? []), ...(r.continuous.fem ?? []), r.continuous.moment]
      : []),
    ...(r.stirrups ? [r.stirrups.spacing, r.stirrups.depth, r.stirrups.max, r.stirrups.shear] : []),
    ...(r.axial
      ? [
          r.axial.load,
          r.axial.modulus,
          r.axial.total,
          r.axial.temperature,
          r.axial.expansion,
          r.axial.stress,
          ...r.axial.segments.flatMap((s) => [
            s.length,
            s.area,
            s.diameter,
            s.modulus,
            s.delta,
            s.load,
          ]),
        ]
      : []),
    ...(r.column
      ? [
          r.column.k,
          r.column.load,
          r.column.pcr,
          r.column.stress,
          r.column.effective,
          r.column.slenderness,
        ]
      : []),
    ...(r.panel
      ? [r.panel.width, r.panel.thickness, r.panel.k, r.panel.stress, r.panel.length]
      : []),
    ...(r.plate
      ? [
          r.plate.radius,
          r.plate.thickness,
          r.plate.pressure,
          typeof r.plate.edge === 'string' && ['clamped', 'simple'].includes(r.plate.edge)
            ? undefined
            : r.plate.edge,
          r.plate.deflection,
          r.plate.stress,
        ]
      : []),
  );
}
