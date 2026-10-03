/**
 * College pictures, round 4, group L (docs/RENDERINGS_HE.md). Spread into
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

export const HE4L_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC165',
      'moodyChart',
      'The Moody chart computed from Colebrook: f against Re on log–log axes, the laminar line, the transition band, ε ÷ D curves, the page’s point on its lit curve',
      [`${E}fluid-mechanics#4`],
      [
        'From ME-P13. New kind (typesHe4l.ts MoodyChartSpec, reps/MoodyChart.tsx, the arithmetic in reps/he4lMath.ts).',
        "Fields: { kind: 'moodyChart', re (Re), f? (the page's friction factor), roughness? (ε ÷ D as a ratio) or epsilon? and diameter? (ε and D apart, any length units), curves? (the family's ε ÷ D values; default smooth, 10⁻⁵, 10⁻⁴, 10⁻³, 0.005, 0.01, 0.05) }.",
        'Re from 10³ to 10⁸, f from 0.005 to 0.1; 64 ÷ Re up to 2300 (lit when the point is laminar), the band 2300–4000 shaded; every turbulent curve computed from Colebrook by fixed-point iteration, never digitized. The page’s ε ÷ D curve is drawn heavy and named at the right; its point (Re, f) is ringed with guides to both axes and f labelled. A "?" Re draws no point; a "?" f draws the Re guide up to the lit curve and no point; a "?" ε lights no curve. No handles.',
        "Example (main): { kind: 'moodyChart', re: 'Re', f: 'f', epsilon: 'eps', diameter: 'D' }, with pictureLabels V, L, nu, hL, dP.",
        'Harness (harness/picturesHe4l.ts): the point lies on its curve (f = 64 ÷ Re below 2300; else the Colebrook residual at the page’s f is zero); Re on the chart; ε ÷ D within 0 to 0.05.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-moodyChart-turbulent', 'g.he-moodyChart-rough', 'g.he-moodyChart-laminar'],
  },
];
