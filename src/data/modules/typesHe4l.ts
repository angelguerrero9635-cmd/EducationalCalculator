/**
 * College pictures, round 4, group L (docs/RENDERINGS_HE.md), all from the mechanical plan
 * (docs/plans/he.mechanical.md). Kept apart from `types.ts` and `layouts/types.ts` so each gains
 * a line. A `NumOrVar` field is a fixed number or a variable id, read in the variable's own unit
 * (converted to SI where a picture needs lengths to scale).
 *
 * - HC165 `moodyChart` (ME-P13): f against Re on log–log axes, the ε ÷ D curves computed from
 *   Colebrook, the page's point on its lit curve.
 * - HC166 `gearPair` (ME-P18): spur gears in steel, a pair or a train of up to four.
 * - HC167 `printLayers` (ME-P20): a part sliced into layers; the stair and cusp on a slope.
 * - HC168 `fitDiagram` (ME-P21): hole and shaft tolerance zones and the fit; a stack-up.
 * - HC169 explore figure `orthographic` (ME-P22) and HC170 card icons (layouts/icons/he4l).
 * - HC172 `casting` (ME-P30): a sand mould with the casting, a riser, Chvorinov times.
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── HC165: moodyChart (new kind) ──────────────────────────────────────────────

/**
 * HC165 (ME-P13): the Moody chart, drawn from equations, never digitized. Log–log axes, Re from
 * 10³ to 10⁸ and f from 0.005 to 0.1; the laminar line f = 64 ÷ Re up to Re = 2300; the
 * transition band (2300 to 4000) shaded; a family of turbulent curves, one per relative
 * roughness in `curves` (default smooth, 10⁻⁵, 10⁻⁴, 10⁻³, 0.005, 0.01, 0.05), each computed
 * from Colebrook, 1 ÷ √f = −2 log₁₀(ε ÷ 3.7D + 2.51 ÷ (Re√f)). The page's ε ÷ D (`roughness`,
 * or `epsilon` over `diameter`, any length units) is lit; its point (`re`, `f`) is ringed with
 * guides to both axes. A "?" Re draws no point; a "?" f draws the Re guide up to the lit curve
 * and no point; a "?" roughness lights no curve. No handles.
 */
export interface MoodyChartSpec {
  kind: 'moodyChart';
  re: NumOrVar;
  f?: NumOrVar;
  /** ε ÷ D, a ratio. */
  roughness?: NumOrVar;
  /** ε and D, when the page has them apart (lengths, converted by their units). */
  epsilon?: NumOrVar;
  diameter?: NumOrVar;
  /** The family's relative roughnesses (0 draws the smooth pipe). */
  curves?: number[];
}

/** The variable ids a moodyChart spec names. */
export const moodyChartVars = (r: MoodyChartSpec): string[] =>
  ids(r.re, r.f, r.roughness, r.epsilon, r.diameter);

// ─── HC166: gearPair (new kind) ────────────────────────────────────────────────

/**
 * HC166 (ME-P18): spur gears in steel, face on, their teeth counted and drawn (N teeth of
 * module m: pitch circle d = mN dashed, addendum m, dedendum 1.25m), each pitch circle touching
 * its mate's at the pitch point. `teeth` lists the gears: two make a pair; three a simple train
 * (gear 2 an idler, all in a row); four a compound train (gears 2 and 3 keyed to one shaft,
 * gear 3 drawn in front of gear 2, gear 4 meshing gear 3). Each gear's N (and d when the page
 * passes `diameters`) is labelled; `speeds` (aligned with `teeth`, null to skip) are drawn as
 * turning arrows, each mesh turning the next gear the other way; `force` (W_t) is an arrow at
 * the first pitch point along the mesh; `pitchSpeed` (V), `power` and the train `value` e go
 * in the caption. The drawing scales with m, so m only labels. A "?" N leaves that gear out; a
 * "?" speed draws no arrow for it. No handles.
 */
export interface GearPairSpec {
  kind: 'gearPair';
  teeth: NumOrVar[];
  module?: NumOrVar;
  diameters?: (NumOrVar | null)[];
  speeds?: (NumOrVar | null)[];
  power?: NumOrVar;
  pitchSpeed?: NumOrVar;
  force?: NumOrVar;
  /** The train value e = ΠN_driving ÷ ΠN_driven (n_out = e n_in). */
  value?: NumOrVar;
}

/** The variable ids a gearPair spec names. */
export const gearPairVars = (r: GearPairSpec): string[] =>
  ids(
    ...r.teeth,
    r.module,
    ...(r.diameters ?? []).map((x) => x ?? undefined),
    ...(r.speeds ?? []).map((x) => x ?? undefined),
    r.power,
    r.pitchSpeed,
    r.force,
    r.value,
  );

// ─── HC167: printLayers (new kind) ──────────────────────────────────────────────

/**
 * HC167 (ME-P20): additive manufacturing. A part in its powder bed on the build plate, sliced
 * into layers of thickness `layer` (t), the layers enlarged: when n is 12 or fewer all are
 * drawn, else the first five, a break with "n layers", and the last two; H dimensioned and the
 * laser on the top layer. With `angle` (θ from the build plate, degrees) the picture is the
 * sloped face instead: an enlarged stair of layers against the true face (dashed), the cusp
 * c = t cos θ marked square to the face. With the time fields, a bar for one layer: the scan
 * A ÷ (sv) and the recoat t_r to scale, t_layer at its end, and T = n t_layer in the caption.
 * A "?" t draws no layer lines; a "?" θ no stair; a "?" time leaves its part of the bar out.
 */
export interface PrintLayersSpec {
  kind: 'printLayers';
  layer: NumOrVar;
  height?: NumOrVar;
  layers?: NumOrVar;
  angle?: NumOrVar;
  cusp?: NumOrVar;
  /** Area scanned per layer, hatch spacing and scan speed: the scan time A ÷ (sv). */
  area?: NumOrVar;
  hatch?: NumOrVar;
  speed?: NumOrVar;
  recoat?: NumOrVar;
  layerTime?: NumOrVar;
  buildTime?: NumOrVar;
}

/** The variable ids a printLayers spec names. */
export const printLayersVars = (r: PrintLayersSpec): string[] =>
  ids(
    r.layer,
    r.height,
    r.layers,
    r.angle,
    r.cusp,
    r.area,
    r.hatch,
    r.speed,
    r.recoat,
    r.layerTime,
    r.buildTime,
  );

// ─── HC168: fitDiagram (new kind) ───────────────────────────────────────────────

/** A tolerance zone's two limits: sizes (default) or deviations from the basic size. */
export interface FitZone {
  max: NumOrVar;
  min: NumOrVar;
}

/**
 * HC168 (ME-P21): limits and fits, flat. The basic-size zero line, the hole's tolerance zone
 * as a bar and the shaft's beside it, deviations enlarged (in μm on the scale), each limit
 * labelled; C_max (largest hole less smallest shaft) and C_min (smallest hole less largest
 * shaft) bracketed at the right, negative as interference; the fit named (clearance,
 * transition or interference). `hole` and `shaft` give sizes, or deviations (ES, EI and es, ei)
 * when `deviations` is set. With `stack` instead, a chain of dimensions each ±Tᵢ, and the
 * tolerance budget below it: the worst case ΣTᵢ as a stacked bar and the RSS √(ΣTᵢ²) under it,
 * to one scale. A "?" limit leaves its zone out; a "?" T leaves the budget out.
 */
export interface FitDiagramSpec {
  kind: 'fitDiagram';
  basic?: NumOrVar;
  hole?: FitZone;
  shaft?: FitZone;
  deviations?: boolean;
  maxClearance?: NumOrVar;
  minClearance?: NumOrVar;
  /** A stack-up: each dimension's ± tolerance. */
  stack?: NumOrVar[];
  worst?: NumOrVar;
  rss?: NumOrVar;
}

/** The variable ids a fitDiagram spec names. */
export const fitDiagramVars = (r: FitDiagramSpec): string[] =>
  ids(
    r.basic,
    r.hole?.max,
    r.hole?.min,
    r.shaft?.max,
    r.shaft?.min,
    r.maxClearance,
    r.minClearance,
    ...(r.stack ?? []),
    r.worst,
    r.rss,
  );

// ─── HC172: casting (new kind) ──────────────────────────────────────────────────

/**
 * HC172 (ME-P30): a sand mould cut open (cope over drag in a wooden flask, sand painted), the
 * casting in its cavity drawn to scale from V (`shape`: a cube of side ∛V, a sphere, or a
 * plate eight times as wide as it is thick), the sprue and runner, and a side riser (a
 * cylinder with H = D) on a neck when `riser` is given; V, A and M = V ÷ A named on the
 * casting; Chvorinov's solidification times t = BM² as bars, the riser's beside the casting's
 * (with no B, the bars compare M² and the riser's reads 1.25 × the casting's). A "?" V draws no
 * casting; a "?" riser D no riser.
 */
export interface CastingSpec {
  kind: 'casting';
  shape?: 'cube' | 'sphere' | 'plate';
  /** The casting's volume, area and modulus (cm³, cm², cm); `modulus` alone sizes a cube (s = 6M). */
  volume?: NumOrVar;
  area?: NumOrVar;
  modulus?: NumOrVar;
  /** The mould constant B (min/cm²) and the casting's time t = BM². */
  moldConstant?: NumOrVar;
  time?: NumOrVar;
  /** A cylindrical side riser, H = D (M = D ÷ 6), and how much longer it must take (1.25). */
  riser?: { modulus?: NumOrVar; diameter?: NumOrVar; time?: NumOrVar; ratio?: number };
}

/** The variable ids a casting spec names. */
export const castingVars = (r: CastingSpec): string[] =>
  ids(
    r.volume,
    r.area,
    r.modulus,
    r.moldConstant,
    r.time,
    r.riser?.modulus,
    r.riser?.diameter,
    r.riser?.time,
  );

// ─── HC169: explore figure `orthographic` ────────────────────────────────────────

/** What an `orthographic` scene shows (the views of one stepped block with a through hole). */
export type OrthoView =
  'box' | 'unfold' | 'front' | 'top' | 'right' | 'hidden' | 'center' | 'isometric';

/**
 * An `orthographic` scene (HC169, ME-P22): a stepped block (a 60 × 40 × 15 base, a 30 × 40 × 20
 * step on its left, a Ø12 hole through the base) in a glass box (`box`); the box unfolded into
 * the three views with its hinge lines (`unfold`); the three views with one lit (`front`,
 * `top`, `right`); the hole's hidden edges lit dashed (`hidden`); its centre lines lit
 * (`center`); or the isometric view on its 120° axes (`isometric`). `angle` lays the views out
 * in third angle (the US default: top above the front, right view on the right) or first angle
 * (ISO: top below, right view on the left).
 */
export interface OrthoScene {
  view: OrthoView;
  angle?: 'third' | 'first';
}

/** The round 4 group L explore figures (listed in `layouts/types.ts`). */
export type He4lFigure = { kind: 'orthographic' };

/** The scene field each group L figure reads (for the layout tests). */
export const HE4L_SCENE_FIELD = { orthographic: 'ortho' } as const;

/** Every view an `orthographic` scene can name (the layout check). */
export const ORTHO_VIEWS: OrthoView[] = [
  'box',
  'unfold',
  'front',
  'top',
  'right',
  'hidden',
  'center',
  'isometric',
];

// ─── Every group L spec ─────────────────────────────────────────────────────────

/** The round 4 group L picture specs (listed once in `types.ts`). */
export type He4lSpec =
  MoodyChartSpec | GearPairSpec | PrintLayersSpec | FitDiagramSpec | CastingSpec;

/** The variable ids a group L spec names. */
export function he4lSpecVars(r: He4lSpec): string[] {
  switch (r.kind) {
    case 'moodyChart':
      return moodyChartVars(r);
    case 'gearPair':
      return gearPairVars(r);
    case 'printLayers':
      return printLayersVars(r);
    case 'fitDiagram':
      return fitDiagramVars(r);
    case 'casting':
      return castingVars(r);
  }
}
