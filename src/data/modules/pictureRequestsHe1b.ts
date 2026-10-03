/**
 * College pictures, round 1, group B (docs/RENDERINGS_HE.md). Spread into
 * HE_PICTURE_REQUESTS in pictureRequestsHe.ts.
 */
import type { PictureRequest } from './pictureRequests';

const ask = (
  id: string,
  kind: string,
  what: string,
  pages: string[],
  notes?: string,
): PictureRequest => ({
  id,
  what,
  kind,
  pages,
  status: 'requested',
  gallery: [],
  ...(notes ? { notes } : {}),
});

const E = 'he.engineering.';

export const HE1B_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC3',
      'section',
      'A cross-section to scale: centroid and axes, I and J, stress blocks, RC bars and the Whitney block, shear flow round a closed cell',
      [
        `${E}statics#2`,
        `${E}statics#2~hole`,
        `${E}statics#3`,
        `${E}statics#3~composite`,
        `${E}statics#3~polar`,
        `${E}statics#3~gyration`,
        `${E}mechanics-of-materials#0~vessel`,
        `${E}mechanics-of-materials#3`,
        `${E}mechanics-of-materials#3~shear-stress`,
        `${E}advanced-solid-mechanics#3`,
        `${E}advanced-solid-mechanics#4~thick`,
        `${E}aerospace-structures#0`,
        `${E}aerospace-structures#0~cabin`,
        `${E}steel-design#1`,
        `${E}steel-design#2`,
        `${E}steel-design#2~shear`,
        `${E}concrete-design#0`,
        `${E}concrete-design#0~min-steel`,
        `${E}concrete-design#1`,
        `${E}concrete-design#2`,
        `${E}concrete-design#2~spiral`,
      ],
      [
        'From HE-mechanical-P3 and HE-aero-civil-chemical-P6. Spec in typesHe1b.ts (`SectionSpec`); every field but `shape` and its sizes is optional, and a "?" value draws nothing.',
        'Shapes and sizes: `rectangle` (b, h), `tee` (bf, tf, hw, tw; flange on top), `wide` (d, bf, tf, tw), `angle` (b, h, t), `circle` (d), `tube` (d, di), `hole` (b, h, hole: { d, x, y? }), `cylinder` (r with t or ro), `box` (b, h to the mid-line, t), `rc` (b with h or d). Lengths convert to one unit, so a wall in mm beside a width in m stays to scale; `unit` names the unit of fixed numbers.',
        'Centroid and axes: `centroid: { x?, y? }` (x̄ from the left edge, ȳ from the bottom), `area`, `inertia` (Ī), `axis: { d, inertia? }` (x′ at d below, I = Ī + Ad²), `parts: { d: [d₁, d₂] }` (each part’s offset; tee parts are flange then web), `polar` (J), `gyration` (k at ±k), `web` (A_w shaded on a W-shape).',
        "Stress beside it: `stress: 'bending' | 'shear' | 'plastic' | 'torsion' | 'hoop'` with `edge` (σ_max, τ_max, σ_Y or σ_h) and `load` (M, V, T or p); hoop adds `axial` (σ_a) and `thick: true` (the Lamé curve with the thin-wall estimate dashed).",
        "RC: `bars` (count), `barSize` (#3–#11) or `barArea` (A_b), `cover` (default 1.5 in), `layout: 'perimeter'` and `tie: 'spiral'` for columns, `steel` (A_s), `stirrup` (A_v); `whitney: true` with `a`, `c`, `epsT`, `fc`, `beta1` (default 0.85). Bars that don’t fit inside the cover, or a hole past the edge, draw faded with the reason.",
        'Thin-walled: `thinWalled: true` on a box or tube with `area` (A_m), `q`, `torque`, `tau`.',
        "Examples: statics#2 `{ kind: 'section', shape: 'tee', bf: 'bf', tf: 'tf', hw: 'hw', tw: 'tw', centroid: { y: 'y' } }`; statics#3 `{ shape: 'rectangle', b, h, area: 'A', inertia: 'Ib', axis: { d: 'd', inertia: 'I' } }`; MoM#3 `{ shape: 'rectangle', b, h, inertia: 'I', stress: 'bending', edge: 's', load: 'M' }`; aerospace-structures#0 `{ shape: 'box', b, h, t, thinWalled: true, area: 'Am', q: 'q', torque: 'T' }`; concrete-design#0 `{ shape: 'rc', b, d, bars: 'n', barArea: 'Ab', steel: 'As', whitney: true, a: 'a', c: 'c', epsT: 'et', fc: 'fc' }`; concrete-design#2 `{ shape: 'rc', b: 'h', h: 'h', layout: 'perimeter', bars: 'n', barArea: 'Ab', area: 'Ag' }` (~spiral adds `tie: 'spiral'`). Each demo below is the page it stands for.",
        'steel-design#1 and #2 pass the W-shape as an inset beside HC1’s column or beam (W18×50 drawn from d, b_f, t_f, t_w); concrete-design#1 shows the two stirrup legs (`stirrup`) beside HC1’s `stirrups` elevation.',
        'Left for later: `interaction` (the P–M curve for concrete-design#2, marked “later” in the request; it waits on N9 in docs/plans/he.aero-civil-chemical.md).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-section-tee',
      'g.he-section-hole',
      'g.he-section-angle',
      'g.he-section-parallel',
      'g.he-section-composite',
      'g.he-section-polar',
      'g.he-section-gyration',
      'g.he-section-bending',
      'g.he-section-shear',
      'g.he-section-plastic',
      'g.he-section-torsion',
      'g.he-section-vessel',
      'g.he-section-thick',
      'g.he-section-cabin',
      'g.he-section-box',
      'g.he-section-web',
      'g.he-section-wide-plastic',
      'g.he-section-whitney',
      'g.he-section-whitney-edge',
      'g.he-section-stirrups',
      'g.he-section-column',
      'g.he-section-spiral',
    ],
  },
];
