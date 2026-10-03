/**
 * College pictures, round 4, group J (docs/RENDERINGS_HE.md). Kept apart from `types.ts`, which
 * names them with one line. A `NumOrVar` field is a fixed number or a variable id, read in the
 * variable's own unit (converted when the unit is a registered one); a "?" value draws nothing
 * for that value.
 *
 * - HC155 `heartPump`: the left ventricle filling and emptying, a beat counter, the outflow
 *   per minute and a pressure gauge.
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

/** Every group J picture kind. */
export type He4jSpec = HeartPumpSpec;

/** The variable ids a group J spec names. */
export function he4jSpecVars(r: He4jSpec): string[] {
  switch (r.kind) {
    case 'heartPump':
      return ids(r.edv, r.esv, r.sv, r.ef, r.hr, r.co, r.sbp, r.dbp, r.map, r.tpr);
  }
}
