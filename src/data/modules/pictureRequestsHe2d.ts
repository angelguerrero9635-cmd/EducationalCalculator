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
];
