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
];
