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
  {
    ...ask(
      'HC23',
      'thermalWall',
      'Heat through things: a layered wall in its materials with the temperature stepping through each layer and film and the resistance network beneath; an insulated pipe in section with its log profile; a pin fin fading from its base; flow in a heated tube; a surface radiating to its surroundings; a wire with heat generation',
      [
        `${E}heat-transfer#0`,
        `${E}heat-transfer#0~cylinder`,
        `${E}heat-transfer#0~fin`,
        `${E}heat-transfer#1`,
        `${E}heat-transfer#2`,
        `${E}transport-phenomena#1`,
        `${E}transport-phenomena#1~cylinder`,
        `${E}transport-phenomena#1~heated-wire`,
      ],
      [
        'From ME-P14 (less blackbody: Planck curves are HC42) and ACC-P31’s temperature mode, one kind. A new kind (typesHe2c.ts, reps/ThermalWall.tsx, the sums in reps/thermalWallMath.ts). HC13’s velocityProfile leaves its temperature mode to this kind.',
        "Fields: { kind: 'thermalWall', mode: 'wall' | 'cylinder' | 'fin' | 'tube' | 'radiation' | 'wire', layers?: [{ L, k, material: 'brick' | 'foam' | 'steel' | 'concrete' | 'wood' | 'glass', name? }], Tin?, Tout?, hIn?, hOut?, R?, q?, r1?, r2?, k?, h?, length?, dT?, Rcond?, Rconv?, rc?, D?, L?, m?, thetaB?, V?, nu?, Re?, Pr?, Nu?, eps?, A?, Ts?, Tsurr?, sigma? (from the page), S?, radius?, Tc?, si? (a factor to metres for r₁, r₂, D, L, radius typed in mm), more? }. A field is a variable id or a number.",
        "Example (heat-transfer#0, transport-phenomena#1): { kind: 'thermalWall', mode: 'wall', Tin: 'Tin', Tout: 'Tout', hIn: 'hi', hOut: 'ho', layers: [{ L: 'L1', k: 'k1', material: 'brick' }, { L: 'L2', k: 'k2', material: 'foam' }], R: 'R', q: 'q' }. ~cylinder (heat-transfer, r in mm): { mode: 'cylinder', r1: 'r1', r2: 'r2', k: 'k', length: 'L', Rcond: 'R', dT: 'dT', q: 'q', si: 0.001 }; ~cylinder (transport, per metre): { mode: 'cylinder', r1, r2, k, h, Tin: 'Ti', Tout: 'To', Rcond, Rconv, q, rc }. ~fin: { mode: 'fin', h, k, D, L, m, thetaB, q }. heat-transfer#1: { mode: 'tube', V, D, nu, Re, Pr, Nu, k, h }. heat-transfer#2: { mode: 'radiation', eps, A, Ts, Tsurr, sigma: 5.67e-8, q }. ~heated-wire: { mode: 'wire', S, radius: 'R', k, Ts, Tc }.",
        'Draws: wall, the layers to scale by L (brick with mortar, foam with cells, steel with a sheen; a layer under 12 px drawn at 12, said), warm and cold air either side, the profile flat in the air, curving down through each film and straight through each layer, every surface and joint with its temperature, the network 1 ÷ h_i, L₁ ÷ k₁ … with each R and q″ along it; the caption adds the drops q″R and names the steepest layer. cylinder: the bore (water), the pipe’s steel, the insulation ring to scale, the outer film dashed, r_c dashed (or said inside the pipe), the log profile T(r) beside it (relative to T₂ when the page has only ΔT), R_cond and R_conv in series. fin: the pin on its base, coloured from hot to the air by θ(x) ÷ θ_b = cosh(m(L − x)) ÷ cosh(mL), arrows leaving as long as the local θ, θ(x) plotted with θ_b and θ_tip. tube: water flowing (flat turbulent profile), heat arrows through the steel wall, a warm film at the wall (k ÷ h, drawn thicker, said), D and h; Re under 10,000 is flagged. radiation: the surface in dashed surroundings, εσT_s⁴ out and εσT_surr⁴ in as arrows to one scale. wire: the section with heat made evenly, the parabola T(r) with T_c and T_s.',
        'The harness (harness/picturesHe2c.ts) checks: the wall’s parts add to R and its drops, each q × R, end at T_out; R_cond = ln(r₂ ÷ r₁) ÷ 2πkL, R_conv = 1 ÷ 2πr₂h, q = ΔT ÷ ΣR, r_c = k ÷ h; m = √(4h ÷ kD), q = √(hPkA_c)θ_b tanh(mL), the tip no hotter than the base; h = Nu k ÷ D, Re = VD ÷ ν; the radiation arrows in the ratio (T_s ÷ T_surr)⁴ and q = εσA(T_s⁴ − T_surr⁴); T_c − T_s = SR² ÷ 4k. The fin’s tanh is taught to the step harness in harness/phrasesHe2c.ts.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-thermalWall-wall',
      'g.he-thermalWall-wall-steel',
      'g.he-thermalWall-cylinder',
      'g.he-thermalWall-cylinder-film',
      'g.he-thermalWall-fin',
      'g.he-thermalWall-tube',
      'g.he-thermalWall-radiation',
      'g.he-thermalWall-wire',
    ],
  },
];
