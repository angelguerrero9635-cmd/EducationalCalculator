/**
 * College pictures, round 2, group D (docs/RENDERINGS_HE.md). Spread into
 * HE_PICTURE_REQUESTS in pictureRequestsHe.ts.
 */
import type { PictureRequest } from './pictureRequests';

/**
 * `pages` is the page list, or, for a request whose parts go on different pages (and kinds), each
 * page with the text that shows its part is there (`uses`).
 */
const ask = (
  id: string,
  kind: string,
  what: string,
  pages: string[] | Record<string, string>,
  notes?: string,
): PictureRequest => ({
  id,
  what,
  kind,
  ...(Array.isArray(pages) ? { pages } : { pages: Object.keys(pages), uses: pages }),
  status: 'requested',
  gallery: [],
  ...(notes ? { notes } : {}),
});

const EC = 'he.engineering.circuits-1';
const EL = 'he.engineering.electronics';
const BIO = 'he.engineering.bioinstrumentation';
const amp = (t: string) => `"amp":"${t}"`;
const dev = (t: string) => `"device":"${t}"`;

export const HE2D_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC18',
      'seriesCircuit',
      'Op-amp circuits as schematics (`amp`): inverting, non-inverting, summing, difference, integrator, active low-pass, Schmitt, instrumentation',
      {
        [`${EC}#3`]: amp('inverting'),
        [`${EC}#3~non-inverting`]: amp('nonInverting'),
        [`${EC}#3~summing`]: amp('summing'),
        [`${EC}#3~difference`]: amp('difference'),
        [`${EL}#3~integrator`]: amp('integrator'),
        [`${EL}#3~active-lowpass`]: amp('activeLowPass'),
        [`${EL}#3~schmitt`]: amp('schmitt'),
        [`${BIO}#1`]: amp('instrumentation'),
        [`${BIO}#1~inamp`]: amp('instrumentation'),
      },
      [
        'From EC-P2 and B-P31 (op-amp part). Drawn by reps/OpAmpSchematic.tsx with round 1’s part symbols (NetSchematic.tsx `Part`, `Ground`) through the drawing list in he2dSch.ts and he2dKit.tsx; layouts in ampLayout.ts, the arithmetic in ampMath.ts (shared with the harness). A `seriesCircuit` without `amp` draws as before.',
        'Fields (typesHe2d.ts `AmpSpec`): `amp: inverting | nonInverting | summing | difference | integrator | activeLowPass | schmitt | instrumentation`, `vin?: [v] | [v₁, v₂]` (instrumentation: [V_d, V_cm], drawn as the electrode sources), `rin?: [R_in] | [R₁, R₂]` (difference: [R₁]; schmitt: R₁ to ground), `rf?` (R_f; difference and schmitt R₂; instrumentation R), `rg?` (non-inverting R_g; instrumentation R_g), `c?`, `vout?`, `rail?` (V_sat: the ±rail stubs, and the output held inside them), `gain?` (A_v, A, G or A_d), `time?`, `v0?` (integrator: the ramp under the circuit), `cutoff?`, `db?` (active low-pass), `threshold?`, `width?` (schmitt: the hysteresis loop under the circuit), `cmrr?`, `common?`, `hum?` (instrumentation on a CMRR page). Each a variable id or a fixed number (SI); a part left out is drawn by name.',
        'The page limit |v_out| ≤ V_sat goes in as a constraint relation with the message “The output can’t pass the supply rail.” (see the demos’ `railLimit`). Units: kΩ, Ω, MΩ, V, mV, μF, nF, ms, Hz, kHz, dB; the check works in SI.',
        'Harness (picturesHe2d.ts): the gain as written; v_out from the parts (integrator v₀ − v_in t ÷ RC); |v_out| never past the rail; the virtual short v₊ = v₋ within 1 mV with the page’s v_out in place unless at a rail; f_c = 1 ÷ (2πR_f C); V_TH = V_sat R₁ ÷ (R₁ + R₂) and the width 2V_TH; G = 1 + 2R ÷ R_g; A_c = G ÷ 10^(CMRR ÷ 20) and the hum A_c V_cm.',
        'Example (circuits-1#3 main): { kind: "seriesCircuit", amp: "inverting", vin: ["vin"], rin: ["Rin"], rf: "Rf", gain: "Av", vout: "vout", rail: "Vsat" }. Bioinstrumentation#1 main: { kind: "seriesCircuit", amp: "instrumentation", vin: ["Vd", "Vcm"], gain: "Ad", cmrr: "CMRR", common: "Ac", vout: "vout", hum: "hum" }. Each gallery demo is a full page to copy.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-series-circuit-amp-inverting',
      'g.he-series-circuit-amp-non-inverting',
      'g.he-series-circuit-amp-summing',
      'g.he-series-circuit-amp-difference',
      'g.he-series-circuit-amp-integrator',
      'g.he-series-circuit-amp-active-lowpass',
      'g.he-series-circuit-amp-schmitt',
      'g.he-series-circuit-amp-instrumentation',
      'g.he-series-circuit-amp-cmrr',
      'g.he-series-circuit-amp-at-rail',
    ],
  },
  {
    ...ask(
      'HC39',
      'seriesCircuit',
      'Semiconductor circuits as schematics (`device`): diode and R, zener regulator, bridge rectifier with its ripple, divider-biased BJT, common-source MOSFET, hybrid-π model',
      {
        [`${EL}#0`]: dev('diodeR'),
        [`${EL}#0~zener`]: dev('zener'),
        [`${EL}#0~rectifier`]: dev('bridge'),
        [`${EL}#1`]: dev('bjtDivider'),
        [`${EL}#2`]: dev('hybridPi'),
        [`${EL}#2~cs-mosfet`]: dev('mosfetCS'),
      },
      [
        'From EC-P3. Drawn by reps/DeviceSchematic.tsx on the same drawing list and kit as HC18 (he2dSch.ts, he2dKit.tsx: round 1’s R, C and source symbols, with the diode, zener, npn, n-channel MOSFET and g_m v_π diamond added); layouts in deviceLayout.ts, the models in deviceMath.ts (shared with the harness). electronics#0 main uses `diodeR` as its stand-in until the I–V curve (P8) lands.',
        'Fields (typesHe2d.ts `DeviceSpec`): `device`, `parts` in each circuit’s order (diodeR [Vₛ, V_D, R]; zener [Vₛ, V_Z, R]; bridge [V_sec, R, C]; bjtDivider [V_CC, R₁, R₂, R_C, R_E]; mosfetCS [R_D, V_DD?]; hybridPi [R_C, R_L]), `values?: { current, vr, power, zener, peak, ripple, dc, frequency, base, vce, overdrive, gm, rpi, rp, beta, gain }` (the ones the circuit draws), `drop?` (bridge, default 0.7 V), `vt?` (hybrid-π, default 25.85 mV). Each a variable id or a fixed SI number; a part left out is drawn by name.',
        'The bridge draws the wave without C dashed and C’s voltage solid with its ripple, to scale, and V_dc dashed. The BJT is drawn faded once V_CE ≤ 0.2 V; pages add the constraint “Past this the transistor saturates; the active-mode formulas no longer hold.” (see the demos’ `active`), and diodeR the constraint Vₛ > V_D.',
        'Harness (picturesHe2d.ts `deviceIssues`): V_R = Vₛ − V_D, I = V_R ÷ R, P_D = V_D I; I_Z = (Vₛ − V_Z) ÷ R − I_L ≥ 0 and P_Z; V_p = V_sec − 2V_D, V_r = V_p ÷ (f_r RC), V_dc = V_p − V_r ÷ 2; V_B, I_C = (V_B − 0.7) ÷ R_E, V_CE and V_CE > 0.2 V; g_m = 2I_D ÷ V_OV, A_v = −g_m R_D; g_m = I_C ÷ V_T, r_π = β ÷ g_m, R_p, A_v = −g_m R_p; each to 0.1% in SI.',
        'Example (electronics#1 main): { kind: "seriesCircuit", device: "bjtDivider", parts: ["VCC", "R1", "R2", "RC", "RE"], values: { base: "VB", current: "IC", vce: "VCE" } }. Each gallery demo is a full page to copy.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-series-circuit-device-diode-r',
      'g.he-series-circuit-device-zener',
      'g.he-series-circuit-device-rectifier',
      'g.he-series-circuit-device-bjt-divider',
      'g.he-series-circuit-device-mosfet-cs',
      'g.he-series-circuit-device-hybrid-pi',
      'g.he-series-circuit-device-bjt-edge',
    ],
  },
];
