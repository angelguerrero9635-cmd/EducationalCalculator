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
];
