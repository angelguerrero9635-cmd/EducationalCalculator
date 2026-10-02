/**
 * Picture specs for the Grades 9–12 round 2 physics pictures of group H2C (H102 in
 * `pictureRequestsHs.ts`), kept apart from `types.ts` so that file's union only names them. A
 * `NumOrVar` field is a fixed number or a variable id; every other string is a variable id.
 * The options this group adds to round 1's kinds are typed with those kinds (`typesHsk.ts`,
 * `typesHsj.ts`, `typesMechanics.ts`).
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── H102.2 impulse ──────────────────────────────────────────────────────────

/**
 * Impulse: an object of `mass` (kg) changes velocity from `before` v₀ to `after` v (m/s,
 * signed, + to the right) in a time `time` Δt (s). Its momentum arrows p₀ = mv₀ and p = mv
 * and the change Δp = m(v − v₀) on one scale; under them the force–time graph, a rectangle of
 * height the average force F = Δp/Δt and width Δt whose area is Δp. `compare` (s) adds the
 * same Δp spread over that time, dashed: a slower stop, a smaller force. Drag the rectangle's
 * right edge for Δt.
 */
export interface ImpulseSpec {
  kind: 'impulse';
  mass: NumOrVar;
  before: NumOrVar;
  after: NumOrVar;
  time: NumOrVar;
  /** The change in momentum Δp and the average force F, when the page names them. */
  change?: string;
  force?: string;
  /** A second time (s) for the same Δp, drawn dashed beside it. */
  compare?: NumOrVar;
  fixed?: boolean;
}

// ─── H102.7 powerLift ────────────────────────────────────────────────────────

/**
 * Power: a crate of `mass` (kg) hauled up `height` h (m) on a rope over a pulley in `time` t
 * (s), the start faded on the floor. A stopwatch shows t; the work W = mgh as a bar cut into
 * t one-second pieces of P = W/t joules each (the J/s), up to 20 pieces drawn. `g` defaults to
 * 9.8 N/kg.
 */
export interface PowerLiftSpec {
  kind: 'powerLift';
  mass: NumOrVar;
  height: NumOrVar;
  time: NumOrVar;
  g?: number;
  work?: string;
  power?: string;
  fixed?: boolean;
}

// ─── H102.11 photoelectric ───────────────────────────────────────────────────

/**
 * The photoelectric effect: light of `wavelength` λ (nm) on a metal plate with work function
 * `workFunction` φ (eV). Each photon carries E = hc/λ = 1240/λ eV (`energy`); when E > φ an
 * electron leaves with at most K_max = E − φ (`kinetic`), its arrow as long as its speed;
 * below the threshold λ₀ = 1240/φ nm (`threshold`) none leave, however bright the light. An
 * energy bar splits E into φ and K_max. Drag along the wavelength strip for λ.
 */
export interface PhotoelectricSpec {
  kind: 'photoelectric';
  wavelength: NumOrVar;
  workFunction: NumOrVar;
  energy?: string;
  kinetic?: string;
  threshold?: string;
  fixed?: boolean;
  /**
   * A value shown as "?" draws nothing (H116): λ unknown leaves grey rays and no E; φ unknown
   * leaves no φ split, electrons or λ₀. Without it the picture fades with the example's values.
   */
  blank?: boolean;
}

// ─── H102.12 lightClock ──────────────────────────────────────────────────────

/**
 * Special relativity's light clock: a pulse between two mirrors. At rest it goes straight up
 * and back (one tick, Δt₀); moving at `speed` β = v/c it takes a longer diagonal path, and
 * since light's speed is the same for every observer the tick takes Δt = γΔt₀,
 * γ = 1/√(1 − β²). The half-tick triangle is drawn with its sides cΔt₀/2, vΔt/2 and cΔt/2.
 * `proper` Δt₀ and `dilated` Δt name the times (s); `length` L₀ and `contracted` L = L₀/γ
 * add a rod at rest and moving. Drag the moving clock for β.
 */
export interface LightClockSpec {
  kind: 'lightClock';
  speed: NumOrVar;
  gamma?: string;
  proper?: NumOrVar;
  dilated?: string;
  length?: NumOrVar;
  contracted?: string;
  fixed?: boolean;
}

// ─── The union and the variables each picture reads ──────────────────────────

/** New picture kinds of group H2C. */
export type Hs2cSpec = ImpulseSpec | PowerLiftSpec | PhotoelectricSpec | LightClockSpec;

/** Every variable id a group-H2C picture reads (for modules.test.ts). */
export function hs2cSpecVars(r: Hs2cSpec): string[] {
  switch (r.kind) {
    case 'impulse':
      return ids(r.mass, r.before, r.after, r.time, r.change, r.force, r.compare);
    case 'powerLift':
      return ids(r.mass, r.height, r.time, r.work, r.power);
    case 'photoelectric':
      return ids(r.wavelength, r.workFunction, r.energy, r.kinetic, r.threshold);
    case 'lightClock':
      return ids(r.speed, r.gamma, r.proper, r.dilated, r.length, r.contracted);
  }
}
