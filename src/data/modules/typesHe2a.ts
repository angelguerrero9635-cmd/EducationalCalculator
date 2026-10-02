/**
 * College pictures, round 2, group A (docs/RENDERINGS_HE.md): HC14 `complexPlane` options for
 * electrical pages (`j`, `axes`, `phasors`, `poles`, `locus`) and HC22 `bode` (new kind). Kept
 * apart from `typesHsd.ts` and `types.ts`, which only gain a line each. A `NumOrVar` field is a
 * fixed number or a variable id; a field naming a value the page works out is a variable id,
 * checked by the harness (`harness/picturesHe2a.ts`). Every option is off unless a page sets it.
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── HC14: the complex plane on electrical pages ──────────────────────────────

/**
 * One phasor, an arrow from 0 (or from the tip of `tail`): `mag` long at `angle` degrees. The
 * angle drawn is (−angle when `negate`) + `offset`, so a page passes its own θ: a current
 * lagging by θ is `{ angle: 'theta', negate: true }`, phase b `offset: -120`.
 */
export interface PhasorHe2a {
  mag: NumOrVar;
  angle: NumOrVar;
  negate?: boolean;
  offset?: number;
  /** Its name, "V_an" (the part after "_" is drawn as a subscript). */
  name: string;
  /** Its unit, "V" or "A": phasors of a second unit are drawn to their own scale. */
  unit?: string;
  /** Drawn tip to tail from this phasor's tip (V_ab from V_bn's tip, ending at V_an's). */
  tail?: string;
  /** The phasor whose tip this one ends on (checked): V_ab = V_an − V_bn. */
  ends?: string;
  /** Colour: phase a, b or c, a line value, a current; `lit` for the answer. */
  tone?: 'a' | 'b' | 'c' | 'line' | 'current' | 'lit';
  dashed?: boolean;
}

/**
 * A pole or zero on the s-plane at re + j·im (a conjugate pair when im ≠ 0, both marked). `neg`
 * reads re as its negative: a page's "pole at −a" passes `{ re: 'a', neg: true }`. `tag` writes a
 * value beside it (the residue "A = 2").
 */
export interface PlanePointHe2a {
  re: NumOrVar;
  im?: NumOrVar;
  neg?: boolean;
  tag?: { name: string; value: NumOrVar };
}

/**
 * The root locus of 1 + K·N(s)/D(s) = 0 with D's roots `poles` and N's `zeros`: the branches as K
 * runs from 0 (at the poles) up (to the zeros or off along the asymptotes), the asymptotes
 * dashed from the centroid when there are two or more, the breakaway points on the real axis,
 * and the closed-loop poles at `gain` (a product when a list: K and H) as filled squares.
 */
export interface LocusHe2a {
  poles: PlanePointHe2a[];
  zeros?: PlanePointHe2a[];
  gain: NumOrVar | NumOrVar[];
  /** The page's centroid σ_a (checked). */
  centroid?: string;
  /** The page's breakaway point (checked: dK/ds = 0 there, on the real-axis locus). */
  breakaway?: string;
  /** The page's closed-loop poles, real (checked: each solves D(s) + K·N(s) = 0). */
  closed?: string[];
}

/**
 * HC14: `complexPlane` for electrical pages. With none of `phasors`, `poles`, `zeros`, `locus`,
 * the page's `z` is an impedance (or any phasor) drawn by its parts with the R and jX legs, |Z|
 * along it and θ from the real axis. Drawn by `ComplexPlaneHe2a.tsx` whenever any field here is
 * set (`z` is then not drawn in the phasor and s-plane modes; pass `{ re: 0, im: 0 }`).
 */
export interface ComplexPlaneHe2a {
  /** Writes j for the imaginary unit (30 + j40 Ω). */
  j?: boolean;
  /** The axis names, real then imaginary: ['R (Ω)', 'X (Ω)'], ['σ', 'jω']. */
  axes?: [string, string];
  /** z's name ("Z") and unit ("Ω"); left out, the tip shows the number alone. */
  name?: string;
  unit?: string;
  /** The page's |z| and angle (−180° to 180°), checked. */
  zMag?: string;
  zAngle?: string;
  /** Splits the jX leg into jX_L up and −jX_C down (series RLC). */
  reactances?: { inductive: NumOrVar; capacitive: NumOrVar };
  /** Phasors from 0 (a three-phase star, a line voltage tip to tail). */
  phasors?: PhasorHe2a[];
  /** An angle marked between two phasors (by name): θ between V_an and I_a. */
  between?: { from: string; to: string; label?: string };
  /** Poles (×) and zeros (○) on the s-plane. */
  poles?: PlanePointHe2a[];
  zeros?: PlanePointHe2a[];
  /** G(s) = K·Π(s − zero) ÷ Π(s − pole): the caption works out G(0) (`dc`, checked). */
  transfer?: { gain: NumOrVar; dc?: string };
  /** Writes x(t) = Σ tag·e^(pole·t) from the poles' tags (partial fractions). */
  terms?: boolean;
  locus?: LocusHe2a;
}

const pointIds = (ps: PlanePointHe2a[] | undefined) =>
  (ps ?? []).flatMap((p) => ids(p.re, p.im, p.tag?.value));

/** Every variable id the HC14 fields name. */
export function complexPlaneHe2aVars(r: ComplexPlaneHe2a): string[] {
  const gain = r.locus ? (Array.isArray(r.locus.gain) ? r.locus.gain : [r.locus.gain]) : [];
  return [
    ...ids(r.zMag, r.zAngle, r.reactances?.inductive, r.reactances?.capacitive),
    ...(r.phasors ?? []).flatMap((p) => ids(p.mag, p.angle)),
    ...pointIds(r.poles),
    ...pointIds(r.zeros),
    ...ids(r.transfer?.gain, r.transfer?.dc),
    ...pointIds(r.locus?.poles),
    ...pointIds(r.locus?.zeros),
    ...ids(...gain, r.locus?.centroid, r.locus?.breakaway, ...(r.locus?.closed ?? [])),
  ];
}

// ─── HC22: the Bode plot ──────────────────────────────────────────────────────

/**
 * HC22 `bode`: magnitude (dB) over phase (°) on one log-frequency axis. The transfer function
 * is K·s^(−n)·Π(s + z) ÷ Π(s + p) ÷ Π(s² + (ω₀/Q)s + ω₀²) with s = jf (corners in the axis's
 * unit, Hz or rad/s), K = `gain` (root form, as control pages write K ÷ (s(s + a))); or, with
 * `dc` in place of `gain`, the low-frequency gain times Π(1 + s/z) ÷ Π(1 + s/p) (a filter's
 * passband gain; negative inverts, the phase starting at 180°). The straight-line asymptotes are
 * dashed, each corner ticked, a marked frequency `at` read on both curves (dragged along the
 * axis), and for a loop the gain crossover with PM and the phase crossover with GM.
 */
export interface BodeSpec {
  kind: 'bode';
  gain?: NumOrVar;
  dc?: NumOrVar;
  /** Corner frequencies of real poles and zeros (positive: a pole at s = −p). */
  poles?: NumOrVar[];
  zeros?: NumOrVar[];
  /** Second-order pole pairs at ω₀ with their Q (or ζ, Q = 1 ÷ (2ζ)). */
  pairs?: { freq: NumOrVar; q?: NumOrVar; zeta?: NumOrVar }[];
  /** Poles at s = 0 (1/s each); −1 for a zero there (a high-pass s). */
  integrators?: number;
  /** The frequency axis's unit (default the `at` variable's unit, else Hz). */
  unit?: string;
  /** Names for the corners, in order poles, zeros, pairs ("f_c", "ω₀"). */
  cornerNames?: string[];
  /** A marked frequency, read on both curves. */
  at?: NumOrVar;
  /** The page's readings at `at` (checked): gain in dB, |H| as a ratio, phase in °, asymptote dB. */
  read?: { db?: string; ratio?: string; phase?: string; asymptote?: string };
  /** The gain crossover (|G| = 0 dB) and the phase margin there, for a loop (checked). */
  crossover?: { freq?: string; margin?: string };
  /** The phase crossover (−180°) and the gain margin there, as a ratio or in dB (checked). */
  margin?: { freq?: string; gain?: string; db?: string };
  /**
   * An op-amp's closed-loop gain (a ratio) under its open-loop line: flat at 20 log G until it
   * meets the line at the bandwidth `bandwidth` (checked: K ÷ G for one integrator).
   */
  closed?: { gain: NumOrVar; bandwidth?: string };
  /** false: the magnitude alone (an op-amp's bandwidth page). */
  phase?: boolean;
  keep?: string[];
  fixed?: boolean;
}

/** Every variable id `bode` names. */
export function bodeVars(r: BodeSpec): string[] {
  return ids(
    r.gain,
    r.dc,
    ...(r.poles ?? []),
    ...(r.zeros ?? []),
    ...(r.pairs ?? []).flatMap((p) => [p.freq, p.q, p.zeta]),
    r.at,
    r.read?.db,
    r.read?.ratio,
    r.read?.phase,
    r.read?.asymptote,
    r.crossover?.freq,
    r.crossover?.margin,
    r.margin?.freq,
    r.margin?.gain,
    r.margin?.db,
    r.closed?.gain,
    r.closed?.bandwidth,
  );
}
