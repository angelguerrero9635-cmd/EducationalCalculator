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
  {
    ...ask(
      'HC166',
      'gearPair',
      'Spur gears in steel with their teeth drawn and counted, pitch circles d = mN touching, speeds and the tangential force at the mesh; a train of up to four',
      [`${E}machine-design#3`, `${E}machine-design#3~train`],
      [
        'From ME-P18. New kind (typesHe4l.ts GearPairSpec, reps/GearPair.tsx, the layout and tooth outline in reps/he4lMath.ts).',
        "Fields: { kind: 'gearPair', teeth (2 a pair; 3 a simple train with gear 2 an idler; 4 a compound train, gears 2 and 3 on one shaft), module? (m, labels only: the drawing scales with m), diameters? (aligned with teeth, null to skip), speeds? (aligned, null to skip), power?, pitchSpeed? (V), force? (W_t), value? (the train value e) }.",
        'Teeth to scale (addendum m, dedendum 1.25m), each gear’s teeth in its mate’s gaps, pitch circles dashed and touching at the pitch point; turning arrows alternate at each mesh; W_t is an arrow at the first pitch point; V, P and e are in the caption with the working. A "?" N leaves that gear out; a "?" speed draws no arrow or label. No handles.',
        "Examples: main { kind: 'gearPair', teeth: ['N1', 'N2'], module: 'm', diameters: ['d1', 'd2'], speeds: ['n1', 'n2'], power: 'P', pitchSpeed: 'V', force: 'Wt' }; ~train { kind: 'gearPair', teeth: ['N1', 'N2', 'N3', 'N4'], speeds: ['nin', null, null, 'nout'], value: 'e' }.",
        'Harness (harness/picturesHe4l.ts): at least 3 teeth; n_aN_a = n_bN_b at each mesh and gears on one shaft at one speed; meshing gears share a module (d ÷ N agree) and d = mN; e = ΠN driving ÷ ΠN driven and n_out = e n_in; V = πd₁n₁; W_t = P ÷ V.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-gearPair-pair',
      'g.he-gearPair-small-pinion',
      'g.he-gearPair-train',
      'g.he-gearPair-idler',
    ],
  },
];
