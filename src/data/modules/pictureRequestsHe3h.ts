/**
 * College pictures, round 3, group H (docs/RENDERINGS_HE.md). Spread into
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

export const HE3H_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC40',
      'heatExchanger',
      'A double-pipe heat exchanger (steel shell, the hot fluid in the inner tube, the cold in the shell, flow arrows by arrangement) above the hot and cold temperature lines along its length, counter or parallel flow, ΔT₁ and ΔT₂ bracketed at the ends, ΔT_lm dashed where the local difference equals it, C_min named',
      [
        `${E}heat-transfer#3`,
        `${E}heat-transfer#3~balance`,
        `${E}heat-transfer#3~ntu`,
        `${E}heat-transfer#3~parallel`,
        `${E}process-design#1`,
      ],
      [
        'From ME-P15 (heatExchanger) and ACC-P35 (exchangerProfile), one kind. A new kind (typesHe3h.ts, reps/HeatExchanger.tsx, the sums in reps/heatExchangerMath.ts, units in reps/he3hUnits.ts).',
        "Fields: { kind: 'heatExchanger', arrangement: 'counter' | 'parallel', Thi, Tho?, Tci, Tco? (one unit, °C or K), dT1?, dT2?, lmtd? (K), q? (W, kW or MW by its unit), U? (W/(m²·K)), A? (m²), mh?, cph?, mc?, cpc?, Cmin? (W/K or kW/K), Cr?, ntu?, eff?, minSide?: 'hot' | 'cold', hotName?, coldName? ('oil', 'water'), hotFluid?: 'oil' | 'water' | 'gas', coldFluid?: 'water' | 'air' | 'oil', more? }. A field is a variable id or a number.",
        "Example (heat-transfer#3 main, process-design#1): { kind: 'heatExchanger', arrangement: 'counter', Thi: 'Thi', Tho: 'Tho', Tci: 'Tci', Tco: 'Tco', dT1: 'dT1', dT2: 'dT2', lmtd: 'lmtd', q: 'q', U: 'U', A: 'A', hotName: 'oil', coldName: 'water' }. ~parallel: the same with arrangement: 'parallel'. ~balance: { arrangement: 'counter', Thi, Tho, Tci, Tco, q, mh, cph, mc, cpc, hotName, coldName }. ~ntu (no outlets): { arrangement: 'counter', Thi, Tci, q, Cmin, Cr, ntu, eff, minSide: 'hot', more: ['UA'] } (the picture works the outlets out from q ÷ C_min and C_r and says so).",
        'Draws: the profiles from the values (ΔT(x) = ΔT₁(ΔT₂ ÷ ΔT₁)^(x ÷ L), each stream moving in step with the heat passed), so the lines curve as they truly do; the LMTD bracket stands where the local difference equals it; the caption gives ΔT₁, ΔT₂ by their ends, the LMTD, which stream is C_min (the one that changes more), and ε as a share of T_hi − T_ci. Temperatures that cross (or a parallel cold outlet above the hot outlet) draw faded with the reason.',
        'The harness (harness/picturesHe3h.ts) checks: the temperatures can be an exchanger (no crossing in parallel flow, the hot line above the cold); ΔT₁ and ΔT₂ by the arrangement; ΔT_lm between them and by its formula; q = UAΔT_lm; NTU = UA ÷ C_min; ε = q ÷ C_min(T_hi − T_ci); C_min on the stream that changes more and C_r the ratio of the changes.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-heatExchanger-counter',
      'g.he-heatExchanger-parallel',
      'g.he-heatExchanger-balance',
      'g.he-heatExchanger-ntu',
      'g.he-heatExchanger-process',
      'g.he-heatExchanger-counter-close',
    ],
  },
  {
    ...ask(
      'HC59',
      'shaft',
      'A painted steel shaft with T at both ends as curved arrows and a scribed line twisting by φ; the end face with τ growing from the centre (from the bore when hollow); the end view with φ to scale, the speed on a power page, or with bending the moment M and the stress element at the surface with σ and τ',
      [
        `${E}mechanics-of-materials#2`,
        `${E}mechanics-of-materials#2~hollow`,
        `${E}mechanics-of-materials#2~power`,
        `${E}machine-design#2`,
      ],
      [
        'From ME-P6. A new kind (typesHe3h.ts, reps/Shaft.tsx, the sums in reps/shaftMath.ts).',
        "Fields: { kind: 'shaft', d, di? (mm; hollow when given), length? (mm), torque? (N·m), G? (GPa), J? (mm⁴), tau? (MPa), angle? (rad or ° by unit), moment? (N·m; draws bending and the element), sigma?, vonMises?, n?, power? (W or kW), speed? (rpm), tauAllow?, more? }. Each variable is read in its own unit (N·mm, kN·m, m, MPa, Pa … turned into N·m, mm, GPa, MPa); a fixed number is in those units.",
        "Example (mechanics-of-materials#2): { kind: 'shaft', d: 'd', length: 'L', torque: 'T', G: 'G', J: 'J', tau: 'tau', angle: 'phi', more: ['phiDeg'] }. ~hollow: add di: 'di'. ~power: { d: 'd', torque: 'T', tau: 'tauA', power: 'P', speed: 'n', more: ['w'] }. machine-design#2: { d: 'd', torque: 'T', moment: 'M', sigma: 'sigma', tau: 'tau', vonMises: 'sv', n: 'n', more: ['Sy'] }.",
        'Draws: diameter and length not to one scale (said); the scribed line turns by φ, drawn ×2, ×5, ×10 … on the side when φ is under 20° (said), the end view gives φ to scale with its arc; τ arrows along a radius in proportion to r, from τ_max (d_i ÷ d) at the bore when hollow; the bending element with σ arrows out and the shear pairs. The caption gives J, τ_max = 16T ÷ πd³ (or Tc ÷ J), φ = TL ÷ GJ in rad and degrees, ω = 2πn ÷ 60, σ and σ′.',
        'The harness (harness/picturesHe3h.ts) checks: d_i under d; J of the section; τ_max = Tc ÷ J (16T ÷ πd³ solid); φ = TL ÷ GJ; σ = 32M ÷ πd³; σ′ = √(σ² + 3τ²); T = P ÷ ω.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-shaft-solid',
      'g.he-shaft-hollow',
      'g.he-shaft-power',
      'g.he-shaft-bending',
      'g.he-shaft-long',
    ],
  },
];
