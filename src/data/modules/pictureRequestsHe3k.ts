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
];
