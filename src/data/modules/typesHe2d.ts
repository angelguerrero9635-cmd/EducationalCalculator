/**
 * College pictures, round 2, group D (docs/RENDERINGS_HE.md): the op-amp circuits (HC18,
 * `amp` on `seriesCircuit`) and the semiconductor circuits (HC39, `device` on `seriesCircuit`),
 * drawn by reps/OpAmpSchematic.tsx and reps/DeviceSchematic.tsx with round 1's schematic parts
 * (reps/NetSchematic.tsx). Every string is a variable id; a `NumOrVar` is a fixed number or one;
 * a field left out draws its part by name only.
 */
import type { NumOrVar } from './typesGraphs';

// ─── HC18 op-amp circuits ────────────────────────────────────────────────────

/**
 * The circuits `amp` draws, each an ideal op-amp (triangle, − and + inputs, the rails ±V_sat as
 * stubs):
 *
 * - `inverting`: vᵢₙ through `rin` R_in to −, `rf` R_f from − to the output, + grounded.
 * - `nonInverting`: vᵢₙ to +, `rg` R_g from − to ground, `rf` R_f from − to the output.
 * - `summing`: `vin` [v₁, v₂] through `rin` [R₁, R₂] to −, `rf` R_f feedback, + grounded.
 * - `difference`: `vin` [v₁, v₂]: v₁ through R₁ to −, R₂ (`rf`) feedback; v₂ through R₁ to +, R₂
 *   to ground (matched pairs; `rin` [R₁]).
 * - `integrator`: vᵢₙ through R (`rin`) to −, C (`c`) feedback; the ramp from `v0` at t = 0 to
 *   v_out at `time` drawn under it.
 * - `activeLowPass`: the inverting amplifier with C (`c`) across R_f; `cutoff` f_c.
 * - `schmitt`: an inverting Schmitt trigger, vᵢₙ to −, + from the divider R₁ (`rin`, to ground)
 *   and R₂ (`rf`, from the output); the hysteresis loop drawn under it with ±`threshold`.
 * - `instrumentation`: three op-amps; `vin` [V_d, V_cm] drawn as the electrode sources; `rf` R
 *   (each buffer's feedback), `rg` R_g between them; a unity difference stage (four equal R₂).
 */
export type AmpCircuit =
  | 'inverting'
  | 'nonInverting'
  | 'summing'
  | 'difference'
  | 'integrator'
  | 'activeLowPass'
  | 'schmitt'
  | 'instrumentation';

/** `seriesCircuit` with `amp`: an op-amp circuit as a schematic (HC18). */
export interface AmpSpec {
  kind: 'seriesCircuit';
  amp: AmpCircuit;
  /** The input voltage(s): one, or two (summing, difference; V_d and V_cm for instrumentation). */
  vin?: NumOrVar[];
  /** The input resistor(s) (summing: R₁, R₂; schmitt: R₁ to ground). */
  rin?: NumOrVar[];
  /** The feedback resistor R_f (difference and schmitt: R₂; instrumentation: R). */
  rf?: NumOrVar;
  /** R_g: from − to ground (non-inverting), or between the buffers (instrumentation). */
  rg?: NumOrVar;
  /** The capacitor (integrator, active low-pass). */
  c?: NumOrVar;
  /** The output voltage. */
  vout?: string;
  /** The supply rail V_sat: the output stays within ±V_sat. */
  rail?: NumOrVar;
  /** The gain the page writes (A_v, A or G; instrumentation: G, or A_d on a CMRR page). */
  gain?: string;
  /** `integrator`: the time t (a page's time unit) and the output at t = 0. */
  time?: NumOrVar;
  v0?: NumOrVar;
  /** `activeLowPass`: the cutoff f_c (Hz or kHz), and the gain in dB. */
  cutoff?: string;
  db?: string;
  /** `schmitt`: the threshold V_TH (±) and the hysteresis width 2V_TH. */
  threshold?: string;
  width?: string;
  /** `instrumentation`: CMRR in dB, the common-mode gain A_c and the hum at the output. */
  cmrr?: NumOrVar;
  common?: string;
  hum?: string;
}

// ─── HC39 semiconductor circuits ─────────────────────────────────────────────

/**
 * The circuits `device` draws:
 *
 * - `diodeR`: Vₛ, R and a diode in series (constant-drop model), the current I round the loop;
 *   `parts` [Vₛ, V_D, R], `values` { current I, vr V_R, power P_D }.
 * - `zener`: Vₛ through R to the zener (cathode up) with the load across it; `parts` [Vₛ, V_Z, R],
 *   `values` { current I_L (load), zener I_Z, power P_Z (no load) }.
 * - `bridge`: a transformer secondary (`parts` [V_sec]) into four diodes, C and R across the
 *   output; the rectified wave with the ripple drawn under it; `parts` [V_sec, R, C],
 *   `values` { peak V_p, ripple V_r, dc V_dc, frequency f_r }, `drop` each diode's drop.
 * - `bjtDivider`: V_CC, R₁ and R₂ to the base, R_C, R_E and an npn; `parts` [V_CC, R₁, R₂, R_C,
 *   R_E], `values` { base V_B, current I_C, vce V_CE }. Drawn active only when V_CE > 0.2 V.
 * - `mosfetCS`: a common-source stage, V_DD, R_D, an n-channel MOSFET; `parts` [R_D, V_DD?],
 *   `values` { current I_D, overdrive V_OV, gm g_m, gain A_v }.
 * - `hybridPi`: the hybrid-π small-signal model of a common-emitter stage, r_π, g_m v_π and
 *   R_C ∥ R_L; `parts` [R_C, R_L], `values` { current I_C, beta β, gm g_m, rpi r_π, rp R_p,
 *   gain A_v }.
 */
export type DeviceCircuit = 'diodeR' | 'zener' | 'bridge' | 'bjtDivider' | 'mosfetCS' | 'hybridPi';

/** The worked values a device circuit labels (each a variable id). */
export interface DeviceValues {
  current?: string;
  vr?: string;
  power?: string;
  zener?: string;
  peak?: string;
  ripple?: string;
  dc?: string;
  frequency?: NumOrVar;
  base?: string;
  vce?: string;
  overdrive?: string;
  gm?: string;
  rpi?: string;
  rp?: string;
  beta?: NumOrVar;
  gain?: string;
}

/** `seriesCircuit` with `device`: a semiconductor circuit as a schematic (HC39). */
export interface DeviceSpec {
  kind: 'seriesCircuit';
  device: DeviceCircuit;
  /** The circuit's given parts, in the order its entry above lists. */
  parts: NumOrVar[];
  values?: DeviceValues;
  /** `bridge`: one diode's drop (two conduct at a time), default 0.7 V. */
  drop?: NumOrVar;
  /** `hybridPi`: the thermal voltage V_T, default 25.85 mV. */
  vt?: NumOrVar;
}

export type He2dSeriesSpec = AmpSpec | DeviceSpec;

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

/** Every variable id an op-amp schematic reads. */
export function ampVars(a: AmpSpec): string[] {
  return ids(
    ...(a.vin ?? []),
    ...(a.rin ?? []),
    ...[a.rf, a.rg, a.c, a.vout, a.rail, a.gain, a.time, a.v0, a.cutoff, a.db],
    ...[a.threshold, a.width, a.cmrr, a.common, a.hum],
  );
}

/** Every variable id a device schematic reads. */
export function deviceVars(d: DeviceSpec): string[] {
  const v = d.values ?? {};
  return ids(
    ...d.parts,
    d.drop,
    d.vt,
    ...[v.current, v.vr, v.power, v.zener, v.peak, v.ripple, v.dc, v.frequency, v.base, v.vce],
    ...[v.overdrive, v.gm, v.rpi, v.rp, v.beta, v.gain],
  );
}

/** The variable ids of a group-HE2D option (modules.test.ts). */
export function he2dSpecVars(r: { kind: string }): string[] {
  const o = r as unknown as Record<string, unknown>;
  if (r.kind !== 'seriesCircuit') return [];
  if (o.amp) return ampVars(o as unknown as AmpSpec);
  if (o.device) return deviceVars(o as unknown as DeviceSpec);
  return [];
}
