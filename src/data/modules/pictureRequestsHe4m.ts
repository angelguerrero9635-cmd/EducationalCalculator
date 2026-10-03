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
];
