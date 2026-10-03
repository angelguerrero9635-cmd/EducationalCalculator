/**
 * College pictures, round 4, group G (docs/RENDERINGS_HE.md). Spread into
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

const MET = 'he.earth-science.meteorology';

export const HE4G_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC122',
      'atmosphereLayers',
      'The hypsometric equation: pressure on a log scale against height above p₁, the column at mean temperature T̄ as a straight line (ln p falls by 1 for each H), the levels p₁ and p₂ with the thickness Δz bracketed, and the scale height H where p = p₁ ÷ e',
      { [`${MET}#0`]: '"thickness"', [`${MET}#0~pressure-altitude`]: '"thickness"' },
      [
        'From EG-P10. New mode on atmosphereLayers (typesHe4g.ts AtmosphereThicknessSpec, reps/AtmosphereThickness.tsx, sums in reps/he4gMath.ts); the profile, pressure, parcel and balance modes are unchanged.',
        "Fields: { kind: 'atmosphereLayers', mode: 'thickness', lower (p₁, hPa), upper? (p₂, hPa), temperature? (T̄, K), thickness? (Δz), scaleHeight? (H), unit?: 'm' | 'km' (Δz and H; default m), g? (default 9.81), gasConstant? (R_d, default 287), fixed? }. g and R_d are the page's constants: pass the numbers the page's relations use.",
        "Example (#0): { kind: 'atmosphereLayers', mode: 'thickness', lower: 'p1', upper: 'p2', temperature: 'T', scaleHeight: 'H', thickness: 'dz', g: 9.81, gasConstant: 287 } (1,000 → 500 hPa at 255 K: H = 7,460 m, Δz = 5,171 m).",
        "Example (#0~pressure-altitude, no temperature: the page's H draws the column): { kind: 'atmosphereLayers', mode: 'thickness', lower: 'p0', upper: 'p', thickness: 'z', scaleHeight: 'H', unit: 'km' } (1,013.25 hPa, 1.6 km, H = 8.0 km → 829.6 hPa); the caption then works p = p₀e^(−z ÷ H).",
        'The height axis runs from p₁ to past Δz and H; the pressure axis is log, so the column is a straight line. The caption works H = R_d T̄ ÷ g and Δz = H ln(p₁ ÷ p₂), with typed numbers as typed. Drag the upper level for p₂ (or z when it is the typed one). A "?" p₁ or T̄ (and no H) draws no column; a "?" p₂ with no Δz draws no upper level.',
        'Harness (harness/picturesHe4g.ts): Δz = H ln(p₁ ÷ p₂) to 1 m; the page’s H = R_d T̄ ÷ g; 0 < p₂ < p₁.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-atmosphereLayers-thickness',
      'g.he-atmosphereLayers-thickness-altitude',
      'g.he-atmosphereLayers-thickness-deep',
    ],
  },
];
