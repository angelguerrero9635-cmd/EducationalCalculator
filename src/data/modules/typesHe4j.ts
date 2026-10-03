/**
 * College pictures, round 4, group J (docs/RENDERINGS_HE.md). Kept apart from `types.ts`, which
 * names them with one line. A `NumOrVar` field is a fixed number or a variable id, read in the
 * variable's own unit (converted when the unit is a registered one); a "?" value draws nothing
 * for that value.
 *
 * - HC155 `heartPump`: the left ventricle filling and emptying, a beat counter, the outflow
 *   per minute and a pressure gauge.
 * - HC156 `footprints`: prints to scale, step and stride bracketed, a tick a step; card figure
 *   `gait`, a stick leg in one of the six phases.
 * - HC157 `springDashpot`: a Maxwell or Kelvin–Voigt model beside its relaxation or creep curve.
 * - HC159 `diffusionProfile`: a tissue slab shaded by concentration over its erfc profile.
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── HC155: heartPump (new kind) ───────────────────────────────────────────────

/**
 * HC155 (B-P22): the left ventricle in section, its cavity filled to EDV (dashed) and emptied to
 * ESV, the stroke volume between them lit, on a mL scale (the levels to scale for the cavity's
 * shape, a half ellipsoid); the aorta carrying SV out each beat; a dial gauge with the band from
 * DBP to SBP and its needle at MAP, one third of the way up; under them a minute with one tick
 * a beat (HR, whole beats) and the liters pumped in it (CO). Every field is optional: a page
 * passes the values it has. Volumes in mL, HR per minute, CO in L/min, pressures in mmHg (a
 * registered unit converts). `ef` is a share or a percent; `tpr` is named in the caption.
 */
export interface HeartPumpSpec {
  kind: 'heartPump';
  edv?: NumOrVar;
  esv?: NumOrVar;
  sv?: NumOrVar;
  ef?: NumOrVar;
  hr?: NumOrVar;
  co?: NumOrVar;
  sbp?: NumOrVar;
  dbp?: NumOrVar;
  map?: NumOrVar;
  tpr?: NumOrVar;
}

// ─── HC156: footprints (new kind) and the gait card ────────────────────────────

/**
 * HC156 (B-P24): five footprints on a sand walkway, left and right in turn, drawn to scale (the
 * foot `foot` m long, 0.26 by default) with their heels `step` apart; the step bracketed under
 * the prints and the stride (heel to heel of one foot, two steps) over them; under them a tick
 * a step at the cadence, each at its time (60 ÷ cadence s apart). With `leg` (L, m) a bar of the
 * Froude number v² ÷ (gL) against the walk–run line at 0.5, the run speed √(0.5gL) named. `g`
 * is the page's (9.81 m/s² by default). Drag the second print to change `step` (`keep` pins
 * typed values; `fixed` draws no handle). Lengths in m, cadence in steps per minute, speeds in
 * m/s.
 */
export interface FootprintsSpec {
  kind: 'footprints';
  step: NumOrVar;
  cadence?: NumOrVar;
  stride?: NumOrVar;
  speed?: NumOrVar;
  leg?: NumOrVar;
  froude?: NumOrVar;
  runSpeed?: NumOrVar;
  g?: NumOrVar;
  foot?: number;
  keep?: string[];
  fixed?: boolean;
}

/** The gait cycle's six phases, in order (heel strike at 0%, toe off at 60%). */
export const GAIT_PHASES = [
  'heelStrike',
  'footFlat',
  'midstance',
  'heelOff',
  'toeOff',
  'midswing',
] as const;
export type GaitPhase = (typeof GAIT_PHASES)[number];

/** HC156 card figure (112 × 76): a stick walker, the right leg lit, at one phase of its cycle. */
export interface GaitCard {
  kind: 'gait';
  phase: GaitPhase;
}

// ─── HC157: springDashpot (new kind) ───────────────────────────────────────────

/**
 * HC157 (B-P25): a viscoelastic model beside its curve. `model: 'maxwell'` draws a spring and a
 * dashpot in series held at a fixed strain ε₀ between two walls (relaxation): the spring's share
 * of the stretch e^(−t/τ), the dashpot's the rest, and σ = σ₀e^(−t/τ) falling with τ and 37%
 * marked. `model: 'kelvin'` draws them side by side under a held stress (creep): both stretch
 * together and ε = (σ ÷ E)(1 − e^(−t/τ)) rises toward σ ÷ E with τ and 63% marked.
 *
 * Fields: `E` (modulus), `eta` (η, in E's unit times seconds: MPa and MPa·s), `tau?` (τ = η ÷ E,
 * s), `t?` (s; the point on the curve and the model's state). Maxwell: `strain0?` (ε₀),
 * `stress0?` (σ₀ = Eε₀), `stress?` (σ at t). Kelvin: `load?` (σ held), `strain?` (ε at t),
 * `final?` (σ ÷ E). Drag the point to change `t` (`keep` pins typed values; `fixed` no handle).
 */
export interface SpringDashpotSpec {
  kind: 'springDashpot';
  model: 'maxwell' | 'kelvin';
  E: NumOrVar;
  eta: NumOrVar;
  tau?: NumOrVar;
  t?: NumOrVar;
  strain0?: NumOrVar;
  stress0?: NumOrVar;
  stress?: NumOrVar;
  load?: NumOrVar;
  strain?: NumOrVar;
  final?: NumOrVar;
  keep?: string[];
  fixed?: boolean;
}

// ─── HC159: diffusionProfile (new kind) ────────────────────────────────────────

/**
 * HC159 (B-P27): a tissue slab fed from its left face, held at C₀ from t = 0. The slab is shaded
 * by concentration and, under it, the profile C ÷ C₀ = erfc(x ÷ (2√(Dt))) is drawn to scale on a
 * depth axis in μm, the half-concentration depth (0.95√(Dt)) ticked and L = √(2Dt) dashed through
 * both, where C is 32% of C₀. Fields: `D` (cm²/s by default; a registered diffusivity unit
 * converts), `L?` (μm by default; a registered length converts), `t?` (s). With `t` the profile
 * is drawn at t; with only L, at the t that L takes (L² ÷ 2D). Drag the L line to change `L`
 * (`keep` pins typed values; `fixed` no handle).
 */
export interface DiffusionProfileSpec {
  kind: 'diffusionProfile';
  D: NumOrVar;
  L?: NumOrVar;
  t?: NumOrVar;
  keep?: string[];
  fixed?: boolean;
}

/** Every group J picture kind. */
export type He4jSpec = HeartPumpSpec | FootprintsSpec | SpringDashpotSpec | DiffusionProfileSpec;

/** The variable ids a group J spec names. */
export function he4jSpecVars(r: He4jSpec): string[] {
  switch (r.kind) {
    case 'heartPump':
      return ids(r.edv, r.esv, r.sv, r.ef, r.hr, r.co, r.sbp, r.dbp, r.map, r.tpr);
    case 'footprints':
      return ids(r.step, r.cadence, r.stride, r.speed, r.leg, r.froude, r.runSpeed, r.g);
    case 'springDashpot':
      return ids(r.E, r.eta, r.tau, r.t, r.strain0, r.stress0, r.stress, r.load, r.strain, r.final);
    case 'diffusionProfile':
      return ids(r.D, r.L, r.t);
  }
}
