/**
 * College pictures, round 3, group K (docs/RENDERINGS_HE.md): HC86 `lamina`, HC87 `rocket`,
 * HC62 `deviceCurves`, HC63 `stemPlot` (new kinds) and HC91 `waterfall` `decibels` (an option).
 * Kept apart from `types.ts`, which only gains a line or two. A `NumOrVar` field is a fixed
 * number or a variable id; values are read in the formula's units (a page keeps its own units
 * consistent: V, kΩ and mA together). A field naming a value the page works out is checked by
 * the harness (`harness/picturesHe3k.ts`). Every option is off unless a page sets it.
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── HC91: waterfall in decibels ─────────────────────────────────────────────

/**
 * `waterfall` option `decibels` (HC91; EC-P12): the items are gains and losses in dB on a level
 * axis in dB or dBm, the running level carried bar to bar. `level: true` reads the first item as
 * a level (a transmit power, a noise power kTB in dBm), drawn up from the axis's foot, and zooms
 * the axis to the levels; without it every item is a gain from 0 dB (a cascade of stages).
 * `floor` is a reference level drawn dashed across (a noise floor, a receiver's sensitivity, a
 * signal); `margin` is the gap from the end level to it, bracketed.
 */
export interface WaterfallDecibels {
  level?: boolean;
  floor?: string;
  margin?: string;
}

export const waterfallDecibelsVars = (d: WaterfallDecibels | true | undefined): string[] =>
  d && d !== true ? ids(d.floor, d.margin) : [];

// ─── HC86: a composite lamina ────────────────────────────────────────────────

/**
 * A unidirectional lamina (HC86; ACC-P8): its section end-on, fibers in matrix at V_f (the
 * fiber share of the drawn section is V_f), the slab model loaded `along` the fibers (fiber and
 * matrix side by side, the same strain: E₁ = E_fV_f + E_mV_m) or `across` (in series, the same
 * stress: 1 ÷ E₂ = V_f ÷ E_f + V_m ÷ E_m), and bars for E_f, E_m, E₁ and E₂ to one scale. `rho`
 * adds the densities' bars (ρ_c = V_fρ_f + V_mρ_m) and `specific` E₁ ÷ ρ_c in the caption.
 */
export interface LaminaSpec {
  kind: 'lamina';
  load?: 'along' | 'across';
  Vf: NumOrVar;
  Ef?: NumOrVar;
  Em?: NumOrVar;
  E1?: NumOrVar;
  E2?: NumOrVar;
  rho?: { f: NumOrVar; m: NumOrVar; c?: NumOrVar };
  specific?: NumOrVar;
  /** The fiber's paint (default carbon). */
  fiber?: 'carbon' | 'glass' | 'aramid';
}

export const laminaVars = (r: LaminaSpec) =>
  ids(r.Vf, r.Ef, r.Em, r.E1, r.E2, r.rho?.f, r.rho?.m, r.rho?.c, r.specific);

// ─── HC87: a rocket ──────────────────────────────────────────────────────────

/** One stage of a two-stage rocket: its I_sp, its mass at lighting and at burnout, its Δv. */
export interface RocketStage {
  Isp: NumOrVar;
  m0: NumOrVar;
  mf: NumOrVar;
  dv?: NumOrVar;
}

/**
 * A rocket (HC87; ACC-P11), painted, with a cut-away tank filled to its propellant share,
 * beside a bar of m₀ split into propellant and dry mass (the propellant share = 1 − m_f ÷ m₀),
 * v_e out of the nozzle and the ideal Δv = I_sp g ln(m₀ ÷ m_f) on a small curve of Δv against
 * the mass ratio. `thrust` draws the exit plane (p_e inside, p_a outside, A_e) and F split into
 * ṁv_e and (p_e − p_a)A_e. `stages` stacks two stages, the first dropped, Δv₁ + Δv₂ = Δv.
 * Masses in one unit (t or kg); `g` from the page (default 9.81 m/s²); Δv in m/s.
 */
export interface RocketSpec {
  kind: 'rocket';
  Isp?: NumOrVar;
  m0?: NumOrVar;
  mf?: NumOrVar;
  dv?: NumOrVar;
  /** The propellant fraction 1 − m_f ÷ m₀ (checked). */
  fraction?: NumOrVar;
  /** The mass ratio m₀ ÷ m_f (checked). */
  ratio?: NumOrVar;
  g?: NumOrVar;
  thrust?: {
    mdot: NumOrVar;
    ve: NumOrVar;
    pe: NumOrVar;
    pa: NumOrVar;
    Ae: NumOrVar;
    F?: NumOrVar;
    Isp?: NumOrVar;
    /** Factor from the page's pressure × area to the force's unit (kPa × m² in kN: 1). */
    pA?: number;
    /** Factor from ṁv_e (kg/s × m/s, N) to the force's unit (kN: 0.001). */
    mv?: number;
  };
  stages?: [RocketStage, RocketStage];
}

export const rocketVars = (r: RocketSpec) => [
  ...ids(r.Isp, r.m0, r.mf, r.dv, r.fraction, r.ratio, r.g),
  ...(r.thrust
    ? ids(
        r.thrust.mdot,
        r.thrust.ve,
        r.thrust.pe,
        r.thrust.pa,
        r.thrust.Ae,
        r.thrust.F,
        r.thrust.Isp,
      )
    : []),
  ...(r.stages ?? []).flatMap((s) => ids(s.Isp, s.m0, s.mf, s.dv)),
];

// ─── HC62: device curves ─────────────────────────────────────────────────────

/**
 * A device's curves (HC62; EC-P8). `diode`: the I–V curve, the constant-drop model (`model:
 * 'drop'`, off below V_D, upright at V_D) or Shockley's I = I_S(e^(V ÷ nV_T) − 1) (`model:
 * 'shockley'`); with `Vs` and `R` the load line from (V_s, 0) to (0, V_s ÷ R) and the Q point
 * where they cross; `decade` marks the ΔV that takes the current ten times higher. `mosfet`:
 * I_D against V_DS for V_GS and the `family` of other V_GS values, the triode–saturation edge
 * V_DS = V_GS − V_t dashed, the Q point at V_DS (or the edge, V_DS = V_OV, when the page has
 * none), and a load line from `load`. Keep units consistent: V, kΩ, mA, mA/V².
 */
export interface DeviceCurvesSpec {
  kind: 'deviceCurves';
  device: 'diode' | 'mosfet';
  model?: 'drop' | 'shockley';
  Vs?: NumOrVar;
  VD?: NumOrVar;
  R?: NumOrVar;
  I?: NumOrVar;
  Is?: NumOrVar;
  n?: NumOrVar;
  VT?: NumOrVar;
  V?: NumOrVar;
  /** ΔV = nV_T ln 10 for ten times the current (checked). */
  decade?: NumOrVar;
  kn?: NumOrVar;
  Vgs?: NumOrVar;
  Vt?: NumOrVar;
  Vds?: NumOrVar;
  Id?: NumOrVar;
  Vov?: NumOrVar;
  /** The other V_GS values drawn faint (default V_GS ± 0.5 V and + 1 V where above V_t). */
  family?: number[];
  load?: { VDD: NumOrVar; RD: NumOrVar };
}

export const deviceCurvesVars = (r: DeviceCurvesSpec) =>
  ids(
    r.Vs,
    r.VD,
    r.R,
    r.I,
    r.Is,
    r.n,
    r.VT,
    r.V,
    r.decade,
    r.kn,
    r.Vgs,
    r.Vt,
    r.Vds,
    r.Id,
    r.Vov,
    r.load?.VDD,
    r.load?.RD,
  );

// ─── HC63: stem plots ────────────────────────────────────────────────────────

/**
 * Stems of a sequence (HC63; EC-P9); a spec sets one of:
 *
 * - `cosine: { k, N, period? }` — x[n] = cos(2πkn ÷ N) over two periods, the continuous
 *   cosine faint through the samples, the period N bracketed (k ÷ N in lowest terms).
 * - `recursive: { alpha, n, y?, final? }` — the unit step into y[n] = αy[n − 1] + x[n]: y[n]
 *   from 0, the stem at n lit, the final value 1 ÷ (1 − α) dashed (|α| < 1).
 * - `convolve: { x, h, n, y? }` — x[k] over h[n − k] flipped and shifted, the products and their
 *   sum y[n] (checked), and the whole of y with y[n] lit.
 * - `sampled: { f, fs, alias? }` — the tone cos(2πft), its samples at f_s and the alias tone
 *   dashed through every sample; f and f_s in one unit.
 */
export interface StemPlotSpec {
  kind: 'stemPlot';
  cosine?: { k: NumOrVar; N: NumOrVar; period?: NumOrVar };
  recursive?: { alpha: NumOrVar; n: NumOrVar; y?: NumOrVar; final?: NumOrVar };
  convolve?: { x: NumOrVar[]; h: NumOrVar[]; n: NumOrVar; y?: NumOrVar };
  sampled?: { f: NumOrVar; fs: NumOrVar; alias?: NumOrVar };
}

export const stemPlotVars = (r: StemPlotSpec) => [
  ...(r.cosine ? ids(r.cosine.k, r.cosine.N, r.cosine.period) : []),
  ...(r.recursive ? ids(r.recursive.alpha, r.recursive.n, r.recursive.y, r.recursive.final) : []),
  ...(r.convolve ? ids(...r.convolve.x, ...r.convolve.h, r.convolve.n, r.convolve.y) : []),
  ...(r.sampled ? ids(r.sampled.f, r.sampled.fs, r.sampled.alias) : []),
];

export type He3kSpec = LaminaSpec;

/** The variable ids a group K picture reads (for the module tests). */
export function he3kSpecVars(r: He3kSpec): string[] {
  switch (r.kind) {
    case 'lamina':
      return laminaVars(r);
  }
}
