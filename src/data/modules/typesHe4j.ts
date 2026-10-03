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

/** Every group J picture kind. */
export type He4jSpec = HeartPumpSpec | FootprintsSpec;

/** The variable ids a group J spec names. */
export function he4jSpecVars(r: He4jSpec): string[] {
  switch (r.kind) {
    case 'heartPump':
      return ids(r.edv, r.esv, r.sv, r.ef, r.hr, r.co, r.sbp, r.dbp, r.map, r.tpr);
    case 'footprints':
      return ids(r.step, r.cadence, r.stride, r.speed, r.leg, r.froude, r.runSpeed, r.g);
  }
}
