/**
 * College pictures, round 3, group K (docs/RENDERINGS_HE.md). Spread into
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

export const HE3K_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC91',
      'waterfall',
      'waterfall option decibels: a budget in dB drawn sideways on a level axis in dB or dBm (each row the symbol, the signed value and the name, the bar floating from the running level), a level item rising from the axis foot, a reference level dashed down the rows and the margin to it bracketed',
      [
        'he.engineering.electromagnetics#3',
        'he.engineering.communication-systems#2',
        'he.engineering.electronics#2~cascade',
      ],
      [
        'From EC-P12. An option on the existing kind (types.ts gains `decibels?`; typesHe3k.ts, reps/WaterfallDecibels.tsx, dispatched from reps/index.tsx); off unless a page sets it, so every waterfall page today is unchanged.',
        'Fields: the waterfall’s own `items` (each { var, sign }) and `total`, plus `decibels: true | { level?: boolean, floor?: id, margin?: id }`. `level: true` reads the first item as a level in dBm (a transmit power, kTB) and zooms the axis to the levels; without it the items are gains from 0 dB. `floor` is any reference level drawn dashed (a noise floor, a sensitivity, a signal), `margin` the gap from the end level to it.',
        'electromagnetics#3 main: { kind: "waterfall", items: [{ var: "Pt", sign: 1 }, { var: "Gt", sign: 1 }, { var: "Gr", sign: 1 }, { var: "L", sign: -1 }], total: "Pr", decibels: { level: true } } (with a sensitivity: decibels: { level: true, floor: "S", margin: "M" }). communication-systems#2 main: items N (kTB, dBm) and NF, total the floor Pn, decibels: { level: true, floor: "Ps", margin: "SNR" }. electronics#2~cascade: items G1, G2, total G, decibels: true.',
        'Check (harness/picturesHe3k.ts): the end bar equals the sum of the signed items within 0.05 dB; the bracket |end − floor| equals the margin. A "?" draws nothing for its value or anything that rests on it; the caption writes the sum with every number.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-waterfall-link',
      'g.he-waterfall-link-margin',
      'g.he-waterfall-noise',
      'g.he-waterfall-cascade',
    ],
  },
  {
    ...ask(
      'HC86',
      'lamina',
      'A unidirectional composite lamina: its section end-on (fibers on a hexagonal array in epoxy, painted, the fiber share of the block V_f), the slab model with fiber and matrix as springs side by side (along) or in series (across) between a wall and a pulled plate, and bars of E_f, E_m, E₁, E₂ to one scale (densities to their own)',
      [
        'he.engineering.aerospace-structures#1',
        'he.engineering.aerospace-structures#1~transverse',
        'he.engineering.aerospace-structures#1~specific',
      ],
      [
        'From ACC-P8. A new kind (typesHe3k.ts, reps/Lamina.tsx, the geometry and rules in reps/he3kMath.ts).',
        'Fields: { kind: "lamina", load?: "along" | "across" (default along), Vf, Ef?, Em?, E1?, E2?, rho?: { f, m, c? }, specific? (E₁ ÷ ρ_c, in the caption), fiber?: "carbon" | "glass" | "aramid" (paint, default carbon) }. A field is a variable id or a number; moduli in one unit (GPa).',
        'aerospace-structures#1 main: { kind: "lamina", Vf: "Vf", Ef: "Ef", Em: "Em", E1: "E1" }. ~transverse: { kind: "lamina", load: "across", Vf: "Vf", Ef: "Ef", Em: "Em", E2: "E2" }. ~specific: { kind: "lamina", Vf: "Vf", Ef: "Ef", Em: "Em", E1: "E1", rho: { f: "rf", m: "rm", c: "rc" }, specific: "s" }.',
        'Check (harness/picturesHe3k.ts): the drawn fiber share (measured on a grid over the clipped circles) is V_f within 2%; E₁ by the rule of mixtures, E₂ by the inverse rule, ρ_c by volume share; E₂ ≤ E₁. Past the densest packing (0.907) it draws faded with the reason in the caption; a "?" for V_f draws the block empty (dashed).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-lamina-along',
      'g.he-lamina-across',
      'g.he-lamina-specific',
      'g.he-lamina-across-dense',
      'g.he-lamina-along-sparse',
    ],
  },
  {
    ...ask(
      'HC87',
      'rocket',
      'A painted rocket (white body lit from the left, red nose and fins, bell nozzle, flame) with a cut-away tank filled to the propellant share, v_e out of the nozzle and Δv beside it; a bar of m₀ split into propellant and dry mass; Δv against the mass ratio as a curve with the rocket’s point; the exit plane and F split into ṁv_e and (p_e − p_a)A_e; two stages with the first stage’s tanks dropped and Δv₁ + Δv₂ = Δv',
      [
        'he.engineering.propulsion#1',
        'he.engineering.propulsion#1~thrust',
        'he.engineering.propulsion#1~staging',
      ],
      [
        'From ACC-P11. A new kind (typesHe3k.ts, reps/Rocket.tsx, the sums in reps/he3kMath.ts).',
        'Fields: { kind: "rocket", Isp?, m0?, mf?, dv?, fraction? (1 − m_f ÷ m₀, checked), ratio? (m₀ ÷ m_f, checked), g? (from the page, default 9.81), thrust?: { mdot, ve, pe, pa, Ae, F?, Isp?, mv? (ṁv_e to F’s unit, default 0.001: N to kN), pA? (p × A to F’s unit, default 1: kPa·m² = kN) }, stages?: [{ Isp, m0, mf, dv? }, { Isp, m0, mf, dv? }] (with dv the total) }. Masses in one unit (t); Δv in m/s.',
        'propulsion#1 main: { kind: "rocket", Isp: "Isp", m0: "m0", mf: "mf", dv: "dv", fraction: "zeta", g: 9.81 }. ~thrust: { kind: "rocket", thrust: { mdot: "mdot", ve: "ve", pe: "pe", pa: "pa", Ae: "Ae", F: "F", Isp: "Isp" }, g: 9.81 } (F in kN, p in kPa). ~staging: { kind: "rocket", stages: [{ Isp: "Isp1", m0: "m01", mf: "mf1", dv: "dv1" }, { Isp: "Isp2", m0: "m02", mf: "mf2", dv: "dv2" }], dv: "dv", g: 9.81 }.',
        'Check (harness/picturesHe3k.ts): the propellant bar ÷ the whole is 1 − m_f ÷ m₀ (and the fraction value); Δv by the rocket equation, growing with the mass ratio; F = ṁv_e + (p_e − p_a)A_e and I_sp = F ÷ (ṁg); each stage’s Δv, Δv₁ + Δv₂ = Δv, stage 2 no heavier than stage 1 at burnout. m_f ≥ m₀ (or stage 2 heavier) draws faded with the reason in the caption.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-rocket-mass',
      'g.he-rocket-mass-high',
      'g.he-rocket-thrust',
      'g.he-rocket-thrust-high',
      'g.he-rocket-stages',
    ],
  },
  {
    ...ask(
      'HC62',
      'deviceCurves',
      'Device curves, flat: a diode’s I–V curve (constant drop, or Shockley’s exponential) with the load line from (V_s, 0) to (0, V_s ÷ R) and the Q point where they cross, the ΔV for ten times the current marked; a MOSFET’s I_D–V_DS curves for V_GS and a family around it, the triode–saturation edge dashed, the regions named, and the Q point (at the edge when the page has no V_DS)',
      [
        'he.engineering.electronics#0',
        'he.engineering.electronics#0~shockley',
        'he.engineering.electronics#1~mosfet-sat',
        'he.engineering.electronics#1~mosfet-triode',
      ],
      [
        'From EC-P8. A new kind (typesHe3k.ts, reps/DeviceCurves.tsx, the models in reps/he3kMath.ts).',
        'Fields: { kind: "deviceCurves", device: "diode" | "mosfet", model?: "drop" | "shockley", Vs?, VD?, R?, I?, Is?, n?, VT?, V?, decade? (ΔV for 10×I, checked), kn?, Vgs?, Vt?, Vds?, Id?, Vov?, family?: number[] (other V_GS values; default V_GS − 0.5, + 0.5, + 1 V above V_t), load?: { VDD, RD } }. Units consistent in the formula: V with kΩ and mA (or Ω and A), k_n in mA/V²; the axes take the current’s and voltage’s shown units.',
        'electronics#0 main: { kind: "deviceCurves", device: "diode", model: "drop", Vs: "Vs", VD: "VD", R: "R", I: "I" }. ~shockley: { device: "diode", model: "shockley", Is: "Is", n: "n", VT: "VT", V: "V", I: "I", decade: "dV" } (I in A shown in mA, V_T in V shown in mV). #1~mosfet-sat: { device: "mosfet", kn: "kn", Vgs: "Vgs", Vt: "Vt", Vov: "Vov", Id: "Id" }. ~mosfet-triode: the same plus Vds: "Vds".',
        'Check (harness/picturesHe3k.ts): Q lies on the device curve (I_S(e^(V ÷ nV_T) − 1), V_D upright, or the V_GS curve) and on the load line; ΔV = nV_T ln 10. Below the drop (V_s ≤ V_D) or V_GS ≤ V_t the caption says why nothing flows.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-deviceCurves-diode',
      'g.he-deviceCurves-led',
      'g.he-deviceCurves-shockley',
      'g.he-deviceCurves-shockley-n2',
      'g.he-deviceCurves-mosfet-sat',
      'g.he-deviceCurves-mosfet-triode',
    ],
  },
];
