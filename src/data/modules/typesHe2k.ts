/**
 * Picture options and specs for the college pictures, round 2, group K (docs/RENDERINGS_HE.md):
 * HC34, the college options of `chemDiagram` mode `rate`, and HC36, the `globe` kind. Kept apart
 * from `types.ts` and the earlier round files so their unions only name them. A `NumOrVar` field
 * is a fixed number or a variable id.
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── HC34: chemDiagram mode `rate`, college options ──────────────────────────

/**
 * How a concentration is written: `bracket` [A] (chemistry pages, the default) or `C` C_A
 * (reaction-engineering pages).
 */
export type ConcNotation = 'bracket' | 'C';

/**
 * College options of `chemDiagram` mode `rate` (HC34; C-P7, ACC-P32). A spec sets exactly one
 * of them (and no `times`, which mark the Grades 9–12 two-reading secant):
 *
 * - `integrated: { order, k, start, t?, conc?, half? }` — an integrated rate law of order 0, 1
 *   or 2: [A] against t from (0, [A]₀), half-lives marked (constant spacing for order 1, each
 *   twice the last for order 2, [A]₀ ÷ (2k) and the time it runs out for order 0) and the point
 *   at t; under it the straight-line plot (ln [A] for order 1, 1/[A] for order 2) with its slope
 *   ∓k. Units come from the variables (k's, t's and [A]₀'s). `conc` and `half` are checked.
 * - `arrhenius: { k1, T1, k2, T2, Ea?, R? }` — ln k against 1/T through the two readings, the
 *   run and rise, slope −Eₐ ÷ R. T in K or °C (by the variable's unit), Eₐ in kJ/mol or J/mol,
 *   R from the page (default 8.314 J/(mol·K)).
 * - `consecutive: { k1, k2, start, t?, tmax?, peak? }` — A → B → C, first-order steps: the three
 *   concentrations against t, B's peak at t_max (`tmax`, `peak` checked), the three values at
 *   t (`at`, checked); [A] + [B] + [C] = [A]₀ dotted. `species` renames A, B, C.
 *
 * `notation: 'C'` writes C_A for [A]. A "?" draws nothing for its value; values that can't make
 * the case (order 0 past the time it runs out, k₁ = k₂ for t_max from the formula, equal
 * temperatures) draw faded with the reason in the caption.
 */
export interface ChemRateHe2kSpec {
  kind: 'chemDiagram';
  mode: 'rate';
  integrated?: {
    order: 0 | 1 | 2;
    k: NumOrVar;
    start: NumOrVar;
    t?: NumOrVar;
    conc?: NumOrVar;
    half?: NumOrVar;
  };
  arrhenius?: {
    k1: NumOrVar;
    T1: NumOrVar;
    k2: NumOrVar;
    T2: NumOrVar;
    Ea?: NumOrVar;
    R?: NumOrVar;
  };
  consecutive?: {
    k1: NumOrVar;
    k2: NumOrVar;
    start: NumOrVar;
    t?: NumOrVar;
    tmax?: NumOrVar;
    peak?: NumOrVar;
    /** The three concentrations at t, checked. */
    at?: [NumOrVar, NumOrVar, NumOrVar];
    species?: [string, string, string];
  };
  /** The reactant's name in `integrated` (default A). */
  species?: string;
  notation?: ConcNotation;
}

export function chemRateHe2kVars(r: ChemRateHe2kSpec): string[] {
  const i = r.integrated;
  const a = r.arrhenius;
  const s = r.consecutive;
  return [
    ...(i ? ids(i.k, i.start, i.t, i.conc, i.half) : []),
    ...(a ? ids(a.k1, a.T1, a.k2, a.T2, a.Ea, a.R) : []),
    ...(s ? ids(s.k1, s.k2, s.start, s.t, s.tmax, s.peak, ...(s.at ?? [])) : []),
  ];
}

// ─── HC36: the globe ─────────────────────────────────────────────────────────

/**
 * An orthographic globe with a graticule (HC36, EG-P3), flat like a diagram, in five modes.
 * Angles in degrees (north and east positive); constants come from the page.
 *
 * - `sun: { latitude, declination, noon?, hour?, day? }` — the Sun's rays from the left, the
 *   axis tilted so the subsolar point is at δ, the circle of illumination edge-on, the place's
 *   parallel with its lit part, the noon ray's angle at the place (`noon` = 90 − |φ − δ|), and
 *   a 24-hour dial lit for the day (`hour` H, cos H = −tan φ tan δ; `day` = 2H ÷ 15 h).
 * - `route: { lat1, lon1, lat2, lon2, angle?, km?, radius? }` — seen square-on to the great
 *   circle through the two places: the arc on the rim, its central angle true at the centre
 *   (`angle`, by the spherical law of cosines), the rhumb line dashed; `km` = R × c (rad),
 *   R = `radius` (default 6,371 km).
 * - `euler: { omega, distance, speed?, radius? }` — the Euler pole, small circles every 30°
 *   about it, the point Δ = `distance` from it with its velocity arrow (∝ sin Δ) beside the
 *   fastest one at 90°; `speed` = ω (rad/Myr) × R × sin Δ, ω in °/Myr, R = `radius` (km,
 *   default 6,371), speed in mm/yr (= km/Myr).
 * - `dipole: { inclination, latitude }` — dipole field lines about a vertical axis, the field
 *   line through the place, its dip I below the horizon (tan I = 2 tan φ).
 * - `momentum: { latitude, wind?, rim? }` — a ring of air carried from the equator to φ keeping
 *   its angular momentum: the ground's speed ΩR cos φ and the eastward wind u on it
 *   (u = ΩR sin²φ ÷ cos φ), ΩR = `rim` (m/s, default 464.6).
 *
 * A "?" draws nothing for its value (the globe and graticule stay); a case the values can't
 * make (the same place twice, antipodes, φ at a pole for `momentum`) draws faded with the
 * reason in the caption.
 */
export type GlobeSpec =
  | {
      kind: 'globe';
      mode: 'sun';
      latitude: NumOrVar;
      declination: NumOrVar;
      noon?: NumOrVar;
      hour?: NumOrVar;
      day?: NumOrVar;
    }
  | {
      kind: 'globe';
      mode: 'route';
      lat1: NumOrVar;
      lon1: NumOrVar;
      lat2: NumOrVar;
      lon2: NumOrVar;
      angle?: NumOrVar;
      km?: NumOrVar;
      radius?: NumOrVar;
    }
  | {
      kind: 'globe';
      mode: 'euler';
      omega: NumOrVar;
      distance: NumOrVar;
      speed?: NumOrVar;
      radius?: NumOrVar;
    }
  | { kind: 'globe'; mode: 'dipole'; inclination: NumOrVar; latitude: NumOrVar }
  | { kind: 'globe'; mode: 'momentum'; latitude: NumOrVar; wind?: NumOrVar; rim?: NumOrVar };

export function globeVars(r: GlobeSpec): string[] {
  switch (r.mode) {
    case 'sun':
      return ids(r.latitude, r.declination, r.noon, r.hour, r.day);
    case 'route':
      return ids(r.lat1, r.lon1, r.lat2, r.lon2, r.angle, r.km, r.radius);
    case 'euler':
      return ids(r.omega, r.distance, r.speed, r.radius);
    case 'dipole':
      return ids(r.inclination, r.latitude);
    case 'momentum':
      return ids(r.latitude, r.wind, r.rim);
  }
}
