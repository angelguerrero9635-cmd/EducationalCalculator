/**
 * College pictures, round 4, group M (docs/RENDERINGS_HE.md). Spread into
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

export const HE4M_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC174',
      'soilPhases',
      'A soil’s phase diagram: one block cut into air, water and solids to scale (Vₛ = 1, V_w = Se, V_v = e), volumes on the left, weights or masses on the right',
      [`${E}soil-mechanics#0`, `${E}soil-mechanics#1~sand-cone`],
      [
        'From ACC-P16. New kind (typesHe4m.ts SoilPhasesSpec, reps/SoilPhases.tsx, sums in reps/he4mMath.ts).',
        "Fields: { kind: 'soilPhases', Gs?, w? (%), S?, e? (left out: wG_s ÷ S), gammaW? (the page's γ_w; left out, weights are written in γ_w), porosity?, dryUnitWeight?, unitWeight? (checked), volume? (the block's V; left out, Vₛ = 1 m³), mass? (a total mass: masses on the right, M_s = M ÷ (1 + w)), density?, dryDensity? (checked), volumeUnit?, weightUnit? }.",
        'The solids are painted sand, the water water, the air pale; each phase’s volume and weight led to it, totals V and W under the block, the working in the caption. A "?" draws nothing for that value (no split while e cannot be found); S above 1 draws faded with the reason. No handles.',
        "Example (main): { kind: 'soilPhases', Gs: 'Gs', w: 'w', S: 'S', e: 'e', gammaW: 9.81, porosity: 'n', dryUnitWeight: 'gd', unitWeight: 'g' }. Example (~sand-cone): { kind: 'soilPhases', Gs: 'Gs', w: 'w', e: 'e', volume: 'V', mass: 'mwet', density: 'rho', dryDensity: 'rhoD' } (the demo adds G_s and e = G_sρ_w ÷ ρ_d − 1 to split the hole's volume; a page without G_s draws the block whole).",
        'Harness (harness/picturesHe4m.ts): the drawn void ÷ solid height is e, water ÷ voids is S, Se = wG_s; n = e ÷ (1 + e), γ_d = G_sγ_w ÷ (1 + e), γ = γ_d(1 + w); ρ = M ÷ V (up to a unit change), ρ_d = ρ ÷ (1 + w).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-soilPhases-main', 'g.he-soilPhases-saturated', 'g.he-soilPhases-sand-cone'],
  },
  {
    ...ask(
      'HC175',
      'losScale',
      'Level of service by density: a bar cut into bands A–F with the letters and bounds printed, the segment’s density marked and its band outlined; above it a mile of one lane with that many cars',
      [`${E}transportation#3`],
      [
        'From ACC-P23. New kind (typesHe4m.ts LosScaleSpec, reps/LosScale.tsx, the bands in reps/he4mMath.ts).',
        "Fields: { kind: 'losScale', density (D), flow? (v_p), speed? (S), bounds? (A–E upper densities; default HCM 7th edition basic freeway 11, 18, 26, 35, 45 pc/mi/ln), unit? (default the density's unit), length? (default '1 mi') }.",
        'The bar runs from 0 past the larger of 55 and D; the letter is printed in every band, the bounds under the cuts, the density marked by a triangle and ticks with its value, its band outlined and the others paler. The lane above shows round(D) painted cars evenly spaced (at most 90; past that the caption says the lane is full). A "?" density marks nothing and draws no cars. No handles. The page’s LOS letter is the picture’s (a letter value waits on N5).',
        "Example: { kind: 'losScale', density: 'D', flow: 'vp', speed: 'S' } on a page with unitSystems ['us'] (v_p in pc/h/ln, S in mi/h, D in pc/mi/ln).",
        'Harness (harness/picturesHe4m.ts): D = v_p ÷ S; the bounds rise; the band marked holds D.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-losScale-freeway', 'g.he-losScale-breakdown'],
  },
];
