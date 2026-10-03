/**
 * College pictures, round 4, group M (docs/RENDERINGS_HE.md). Kept apart from `types.ts`,
 * `typesHsd.ts` and `layouts/types.ts` so each gains a line. A `NumOrVar` field is a fixed
 * number or a variable id, read in the variable's shown unit; a string field is the page's own
 * value, checked.
 *
 * - HC174 `soilPhases` (new kind): the three-phase block of a soil.
 * - HC175 `losScale` (new kind): a freeway segment's density on the level-of-service bar.
 * - HC180 `oneLine` (new kind): a power system's one-line diagram with a fault on a bus.
 * - HC181 `rfSpectrum` (new kind): an AM or FM signal in time and its spectrum.
 * - HC182 `complexPlane` `constellation`: M-PSK or M-QAM points, Gray-coded, with boundaries.
 * - HC183 `placeValueChart` `base` 2, 8, 16: columns weighted bᵏ, a two's complement row.
 * - HC173 explore figure `orbitElements`: the equatorial plane, the tilted orbit, one element lit.
 * - HC178 card figure `pfdSymbol`: a process-flow-diagram symbol on a sort card.
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── HC174: soilPhases (new kind) ───────────────────────────────────────────────

/**
 * HC174 (ACC-P16): the phase diagram of a soil, a block cut into air (top), water and solids
 * (bottom) with volumes on the left and weights (or masses) on the right. The heights are to
 * scale: V_s = 1, V_w = Se = wG_s, V_v = e (scaled to `volume` when it is given).
 *
 * `e` is the void ratio; left out, it is worked out as wG_s ÷ S. `S` is the degree of
 * saturation (0–1); left out, wG_s ÷ e. `w` is the water content in % (as the pages type it).
 * `gammaW` is the page's unit weight of water (9.81 kN/m³ on the engineering pages); left out,
 * the weights are written in γ_w. `porosity`, `dryUnitWeight` and `unitWeight` are the page's
 * n, γ_d and γ (checked: n = e ÷ (1 + e), γ_d = G_sγ_w ÷ (1 + e), γ = γ_d(1 + w)).
 *
 * The sand cone (`volume` and `mass`): the block is the hole's volume V, the masses on the
 * right (M_s = M ÷ (1 + w), M_w = wM_s, M_a = 0) in the mass's unit; `density` and
 * `dryDensity` are the page's ρ = M ÷ V and ρ_d = ρ ÷ (1 + w) (checked, in mass and volume
 * units as shown: kg and cm³ make g/cm³ with × 1000). Without G_s and e the block is one
 * piece (the split needs G_s). A "?" draws nothing for that value; S above 1 draws faded with
 * the reason.
 */
export interface SoilPhasesSpec {
  kind: 'soilPhases';
  Gs?: NumOrVar;
  w?: NumOrVar;
  S?: NumOrVar;
  e?: NumOrVar;
  gammaW?: NumOrVar;
  porosity?: string;
  dryUnitWeight?: string;
  unitWeight?: string;
  /** The block's volume and unit (V = 1 m³ of solids when left out). */
  volume?: NumOrVar;
  /** The soil's total (wet) mass: the right side shows masses, not weights. */
  mass?: NumOrVar;
  density?: string;
  dryDensity?: string;
  /** Units written beside the numbers: volumes (m³) and weights (kN) when not from values. */
  volumeUnit?: string;
  weightUnit?: string;
}

/** The variable ids a soilPhases spec names. */
export const soilPhasesVars = (r: SoilPhasesSpec): string[] =>
  ids(
    r.Gs,
    r.w,
    r.S,
    r.e,
    r.gammaW,
    r.porosity,
    r.dryUnitWeight,
    r.unitWeight,
    r.volume,
    r.mass,
    r.density,
    r.dryDensity,
  );

// ─── HC175: losScale (new kind) ─────────────────────────────────────────────────

/**
 * HC175 (ACC-P23): level of service by density. A bar from 0 past the last bound cut into bands
 * A–F with the letters printed and the bounds under it (HCM basic freeway segment: A ≤ 11,
 * B ≤ 18, C ≤ 26, D ≤ 35, E ≤ 45 pc/mi/ln, F above; `bounds` gives another table), the segment's
 * `density` marked with its band outlined. Above it one mile of one lane with the density's
 * cars spaced evenly along it. `flow` and `speed` are the page's v_p and S (checked:
 * D = v_p ÷ S). A "?" density marks nothing and draws no cars.
 */
export interface LosScaleSpec {
  kind: 'losScale';
  density: NumOrVar;
  flow?: NumOrVar;
  speed?: NumOrVar;
  /** The upper bounds of A–E, rising (F is everything above the last). */
  bounds?: [number, number, number, number, number];
  /** The density's unit (pc/mi/ln) and the length the cars stand on (1 mi). */
  unit?: string;
  length?: string;
}

/** The variable ids a losScale spec names. */
export const losScaleVars = (r: LosScaleSpec): string[] => ids(r.density, r.flow, r.speed);

// ─── HC180: oneLine (new kind) ──────────────────────────────────────────────────

/** One element of a one-line diagram, from the source to the faulted bus. */
export interface OneLineElement {
  type: 'generator' | 'transformer' | 'line' | 'source';
  /** Its reactance in pu on the common base (written jX); left out, the element is unlabelled. */
  x?: NumOrVar;
  /** Its name over it: "G", "T₁", "Line". */
  name?: string;
}

/**
 * HC180 (EC-P13): a one-line diagram of a radial system, the source on the left, a bus (a
 * thick bar) after each element, a load arrow off the last bus and the fault bolt on the
 * faulted bus (the last by default): `'3φ'` bolted, `'slg'` phase a to ground. Each element is
 * written with its reactance (jX pu). Under it the reactance diagram: V_f behind the elements'
 * reactances in series to the fault (X_th = ΣX, `xth` checked), or for a single line-to-ground
 * fault the three sequence networks in series (`sequence`, I_a = 3V_f ÷ (X₁ + X₂ + X₀)).
 * `current` is the page's fault current in pu (checked); `base` the system base with the
 * page's base current (A), the current in kA and the fault MVA (checked). A "?" reactance is
 * left unlabelled and no sum is written.
 */
export interface OneLineSpec {
  kind: 'oneLine';
  elements: OneLineElement[];
  fault?: '3φ' | 'slg';
  /** The faulted bus, counted from 1 after the first element (default the last). */
  faultBus?: number;
  load?: boolean;
  vf?: NumOrVar;
  xth?: NumOrVar;
  current?: NumOrVar;
  sequence?: { x1: NumOrVar; x2: NumOrVar; x0: NumOrVar };
  base?: { s: NumOrVar; v: NumOrVar; iBase?: string; iKA?: string; mva?: string };
}

/** The variable ids a oneLine spec names. */
export const oneLineVars = (r: OneLineSpec): string[] =>
  ids(
    ...r.elements.map((e) => e.x),
    r.vf,
    r.xth,
    r.current,
    r.sequence?.x1,
    r.sequence?.x2,
    r.sequence?.x0,
    r.base?.s,
    r.base?.v,
    r.base?.iBase,
    r.base?.iKA,
    r.base?.mva,
  );

// ─── HC181: rfSpectrum (new kind) ───────────────────────────────────────────────

/**
 * HC181 (EC-P15): a tone-modulated carrier. Above, the signal in time with its envelope dashed
 * (AM: 1 ± μ, to scale; FM: constant, the crests bunching and spreading; the carrier drawn
 * far slower than it is). Below, the spectrum to scale on a frequency axis: AM's carrier
 * (height 1) and the sidebands at f_c ± f_m (height μ ÷ 2); FM's lines every f_m with heights
 * |J_n(β)|, Carson's band 2(Δf + f_m) bracketed. Without `fc` the axis is the offset f − f_c.
 *
 * `mu` is AM's index (0–1; above 1 draws faded, overmodulated); `deviation` FM's Δf and `beta`
 * the page's β (checked: Δf ÷ f_m). `bandwidth` is the page's B (checked: 2f_m, or
 * 2(Δf + f_m)). Powers (AM): `carrierPower` P_c, and the page's `sidebandPower` P_sb (checked:
 * P_cμ² ÷ 2, the two sideband heights squared), `totalPower` and `efficiency` (%, checked).
 * The frequencies are read in one unit (kHz), `fc` and `fm` alike. A "?" draws no line for it.
 */
export interface RfSpectrumSpec {
  kind: 'rfSpectrum';
  mode: 'am' | 'fm';
  fm: NumOrVar;
  fc?: NumOrVar;
  mu?: NumOrVar;
  deviation?: NumOrVar;
  beta?: NumOrVar;
  bandwidth?: NumOrVar;
  carrierPower?: NumOrVar;
  sidebandPower?: string;
  totalPower?: string;
  efficiency?: string;
  /** The frequency unit written on the axis (default fm's unit). */
  unit?: string;
}

/** The variable ids an rfSpectrum spec names. */
export const rfSpectrumVars = (r: RfSpectrumSpec): string[] =>
  ids(
    r.fm,
    r.fc,
    r.mu,
    r.deviation,
    r.beta,
    r.bandwidth,
    r.carrierPower,
    r.sidebandPower,
    r.totalPower,
    r.efficiency,
  );

// ─── HC182: complexPlane constellation ──────────────────────────────────────────

/**
 * HC182 (EC-P16): a digital modulation's constellation on the I–Q plane (`complexPlane`, drawn
 * by `reps/ConstellationHe4m.tsx` whenever `constellation` is set; `z` is not drawn, pass
 * `{ re: 0, im: 0 }`). `M` points: `'psk'` on a circle (M = 2 on the real axis, otherwise
 * offset by π ÷ M), `'qam'` on a square grid (M = 4, 16, 64, 256); left out, PSK up to 8 and
 * QAM above. Each point is labelled with its Gray-coded log₂M bits (to 16 points; 64 and 256
 * draw the points and boundaries only) and the decision boundaries are dashed: rays halfway
 * between PSK points, the grid lines between QAM columns and rows.
 *
 * The page's rates (checked): `symbolRate` R_s, `bitRate` R_b = R_s log₂M, `rolloff` α,
 * `bandwidth` B = R_s(1 + α) and `efficiency` η = R_b ÷ B. A "?" M draws no points.
 */
export interface ComplexPlaneHe4m {
  constellation?: {
    M: NumOrVar;
    kind?: 'psk' | 'qam';
    symbolRate?: NumOrVar;
    bitRate?: NumOrVar;
    rolloff?: NumOrVar;
    bandwidth?: NumOrVar;
    efficiency?: NumOrVar;
  };
}

/** The variable ids HC182's fields name. */
export function complexPlaneHe4mVars(r: ComplexPlaneHe4m): string[] {
  const k = r.constellation;
  return k ? ids(k.M, k.symbolRate, k.bitRate, k.rolloff, k.bandwidth, k.efficiency) : [];
}

// ─── HC183: placeValueChart base 2, 8, 16 ───────────────────────────────────────

/**
 * HC183 (EC-P17): a whole number's place-value chart in base 2, 8 or 16 (drawn by
 * `reps/PlaceValueBaseHe4m.tsx` whenever `base` is set; `decimals` is 0). Columns weighted
 * bᵏ (the weight written over each column when it fits, else the exponent over each group of
 * four), the digits in them (A–F past 9), and under the chart the weights of the digits added
 * to the number. In base 2 each group of four bits has its hex digit under it. `width` is the
 * number of columns (the bit width n in base 2; left out, as many as the number needs).
 *
 * `twos` (base 2) adds the two's complement of the number: the bits inverted, then 1 added, the
 * n-bit pattern of −N with its hex digits; `twos` is the page's value of that pattern read as an
 * unsigned number, 2ⁿ − N (checked). A "?" value draws empty columns.
 */
export interface PlaceValueBaseHe4m {
  base?: 2 | 8 | 16;
  width?: NumOrVar;
  twos?: string;
}

/** The variable ids HC183's fields name. */
export const placeValueBaseVars = (r: PlaceValueBaseHe4m): string[] => ids(r.width, r.twos);

// ─── HC173: explore figure orbitElements ────────────────────────────────────────

/**
 * An `orbitElements` scene (HC173, ACC-P13): Earth in its equatorial plane with the vernal
 * equinox direction, the orbit tilted through the node line (the half below the plane dashed),
 * periapsis and the satellite marked, and one element lit: `'i'` the tilt across the node line,
 * `'raan'` Ω in the equatorial plane from the vernal equinox to the ascending node, `'argp'` ω in
 * the orbit plane from the node to periapsis, `'nu'` ν from periapsis to the satellite, `'shape'`
 * the major axis 2a with e. Angles in degrees; with i = 0 there is no node line and Ω (and ω)
 * are undefined, which the figure says.
 */
export interface OrbitScene {
  i: number;
  raan: number;
  argp: number;
  nu: number;
  e: number;
  lit?: 'i' | 'raan' | 'argp' | 'nu' | 'shape';
}

/** The round 4 group M explore figures (listed in `layouts/types.ts`). */
export type He4mFigure = { kind: 'orbitElements' };

/** The scene field each group M figure reads (for the layout tests). */
export const HE4M_SCENE_FIELD = { orbitElements: 'orbit' } as const;

// ─── HC178: card figure pfdSymbol ───────────────────────────────────────────────

/** The process units a `pfdSymbol` card draws. */
export const PFD_SYMBOLS = [
  'pump',
  'compressor',
  'exchanger',
  'heater',
  'column',
  'flash',
  'absorber',
  'cstr',
  'packedBed',
] as const;
export type PfdSymbolName = (typeof PFD_SYMBOLS)[number];

/**
 * HC178 (ACC-P36): a process-flow-diagram symbol on a sort card, 84 × 68, in the card's ink with
 * its streams arrowed in and out: a centrifugal pump, a compressor (the narrowing trapezoid), a
 * shell-and-tube exchanger, a fired heater with its stack, a distillation column with trays, a
 * flash drum, a packed absorber, a stirred tank (CSTR) and a packed-bed reactor. Flat line art,
 * as a PFD draws them; the card's label names the unit.
 */
export interface PfdSymbolCard {
  kind: 'pfdSymbol';
  symbol: PfdSymbolName;
}

export const PFD_CARD_W = 84;
export const PFD_CARD_H = 68;

// ─── The new kinds together ──────────────────────────────────────────────────────

/** Group M's new picture kinds (one line in `types.ts`). */
export type He4mSpec = SoilPhasesSpec | LosScaleSpec | OneLineSpec | RfSpectrumSpec;

/** The variable ids a group M new-kind spec names (one case in `modules.test.ts`). */
export function he4mSpecVars(r: He4mSpec): string[] {
  switch (r.kind) {
    case 'soilPhases':
      return soilPhasesVars(r);
    case 'losScale':
      return losScaleVars(r);
    case 'oneLine':
      return oneLineVars(r);
    case 'rfSpectrum':
      return rfSpectrumVars(r);
  }
}
