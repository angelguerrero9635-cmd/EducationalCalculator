/**
 * College pictures, round 2, group C (docs/RENDERINGS_HE.md). Spread into
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

const E = 'he.engineering.';

export const HE2C_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC17',
      'propertyDiagram',
      'T–v, P–v and T–s planes: water’s vapor dome (computed from IAPWS), the critical point, a tie line with x, numbered states, processes and whole cycles with q_in and q_out; air’s isobars on T–s; a real gas’s isotherm beside the ideal one on P–v',
      [
        `${E}thermodynamics#0`,
        `${E}thermodynamics#2~entropy`,
        `${E}thermodynamics#2~isentropic`,
        `${E}thermodynamics#3`,
        `${E}thermodynamics#3~rankine`,
        `${E}propulsion#0`,
        `${E}propulsion#0~compressor`,
        `${E}chemical-thermodynamics#0`,
        `${E}chemical-thermodynamics#0~van-der-waals`,
      ],
      [
        'From ME-P10 and ACC-P10, one kind. A new kind (typesHe2c.ts, reps/PropertyDiagram.tsx, the sums in reps/propertyDiagramMath.ts). The dome is computed: T_sat and P_sat from IAPWS-IF97 region 4, v_f, v_g, h_f, h_g, s_f, s_g from the IAPWS supplementary release on saturation properties (checked against the steam tables to 4 figures); nothing is read off a chart.',
        "Fields: { kind: 'propertyDiagram', plane: 'Tv' | 'Pv' | 'Ts', substance: 'water' | 'gas', states?: [{ name, T?, P?, v?, s?, h? (an id, or a sum ['h1', 'wp']), x?, ideal? (hollow dot) }], steps?: [{ from, to, process: 'isobaric' | 'isentropic' | 'isothermal' | 'actual' (dashed), heat?: 'in' | 'out', q? }], cycle?: 'rankine' | 'brayton', tie?: { P, vf?, vg? } (water's tie line with the page's table values), gas?: { cp, k? | R? } (from the page), isobars?: [{ P, name }], ds?: { from, to, value }, more?: [ids said in the caption], isotherm?: { model: 'vdw' | 'virial', T, R, a?, b?, Z?, P?, V?, name? }, units?: { T?: 'K' | '°C', P?: 'kPa' | 'MPa' | 'bar', V?: 'L/mol' | 'm³/mol' } }. Water defaults to °C and kPa, gas to K and bar. A gas state takes T and P (P relative is fine: 1 and 'rp'); s is measured from the first state. Water states take any two of P, T, v, s, h, x; an isentropic step carries s to a partner with none.",
        "Example (thermodynamics#0): { kind: 'propertyDiagram', plane: 'Tv', substance: 'water', tie: { P: 'P', vf: 'vf', vg: 'vg' }, states: [{ name: 'State', P: 'P', v: 'v', x: 'x' }], more: ['h'] } (P is standalone on that page). Example (thermodynamics#3, propulsion#0): { kind: 'propertyDiagram', plane: 'Ts', substance: 'gas', cycle: 'brayton', gas: { cp: 1.005, k: 1.4 }, units: { T: 'K' }, states: [{ name: '1', T: 'T1', P: 1 }, { name: '2', T: 'T2', P: 'rp' }, { name: '3', T: 'T3', P: 'rp' }, { name: '4', T: 'T4', P: 1 }], steps: [{ from: '1', to: '2', process: 'isentropic' }, { from: '2', to: '3', process: 'isobaric', heat: 'in' }, { from: '3', to: '4', process: 'isentropic' }, { from: '4', to: '1', process: 'isobaric', heat: 'out' }], isobars: [{ P: 1, name: 'P₁' }, { P: 'rp', name: 'P₂ = r_p P₁' }], more: ['wnet', 'eta'] }. ~compressor: states 1, 2s (ideal: true, T2s) and 2, steps 1→2s isentropic and 1→2 actual. ~rankine: states { P: 'P1', h: 'h1' }, { P: 'P2', h: ['h1', 'wp'] }, { P: 'P2', h: 'h3' }, { P: 'P1', h: 'h4' }, cycle 'rankine'. chemical-thermodynamics#0: { plane: 'Pv', substance: 'gas', units: { P: 'bar', V: 'L/mol' }, isotherm: { model: 'virial', T: 'T', R: 8.314, Z: 'Z', P: 'P', name: 'propane' } }; ~van-der-waals: isotherm { model: 'vdw', T, R: 8.314, a, b, V, P, name: 'CO₂' }.",
        'Draws: T–v and P–v on a log v axis (P–v log–log), the dome tinted, Liquid / Liquid + vapor / Vapor named, the tie line at P from v_f to v_g with T_sat, the state with x (faint, with the reason, when v lies past v_g or short of v_f); the caption works x = (v − v_f) ÷ (v_g − v_f) and says when the typed v_f, v_g miss IAPWS by more than 2%. T–s water: isobars follow the liquid line, run flat under the dome and rise through the superheat; a superheated state with h but no T (a Rankine page) is placed by shape (the area under its isobar equals h − h_g), said in the caption. T–s gas: isobars T = T₀e^((s − s₀) ÷ c_p) dashed and named, isentropic steps vertical, real ones dashed, q_in and q_out arrows (hot and cold, named), Δs bracketed. P–v gas: the isotherm (vdW with its loop below T_c, the critical isotherm faint and the critical point; or virial through the state), the ideal gas dashed, the state with its P and the ideal P at the same V. Drags: a typed v along the tie line, a typed T on a gas T–s plane, a typed V on the isotherm.',
        'The harness (harness/picturesHe2c.ts) checks every known state is placed; 0 < x < 1 lies under the dome between v_f and v_g and x = (v − v_f) ÷ (v_g − v_f); isentropic steps vertical on T–s; T₂ ÷ T₁ = (P₂ ÷ P₁)^((k − 1) ÷ k), compression heats; the real compressor exit right of and hotter than the ideal; Δs as labelled; Brayton T₂ > T₁, T₃ > T₄; the vdW state on its isotherm and the isotherm meeting the ideal one at large V. Refrigeration (R-134a’s dome), Otto and Diesel are not drawn: no page in the list asks for them yet.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-propertyDiagram-tv-mixture',
      'g.he-propertyDiagram-pv-high-pressure',
      'g.he-propertyDiagram-ts-entropy',
      'g.he-propertyDiagram-ts-compressor',
      'g.he-propertyDiagram-ts-compressor-poor',
      'g.he-propertyDiagram-ts-brayton',
      'g.he-propertyDiagram-ts-rankine',
      'g.he-propertyDiagram-pv-virial',
      'g.he-propertyDiagram-pv-vdw',
    ],
  },
];
