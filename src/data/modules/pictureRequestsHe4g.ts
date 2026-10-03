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
  {
    ...ask(
      'HC123',
      'atmosphereLayers',
      'Potential temperature on a temperature against log-pressure chart (dry adiabats labelled θ, the parcel and its adiabat down to 1,000 hPa), and humidity on Tetens’ eₛ(T) curve (the air’s point, up to eₛ at T, across to the curve at the dew point; RH and r)',
      { [`${MET}#1`]: '"adiabat"', [`${MET}#1~humidity`]: '"saturation"' },
      [
        'From EG-P11. Two new modes on atmosphereLayers (typesHe4g.ts AtmosphereAdiabatSpec and AtmosphereSaturationSpec; reps/AtmosphereAdiabat.tsx, reps/AtmosphereSaturation.tsx; sums in reps/he4gMath.ts).',
        "Fields (#1): { kind: 'atmosphereLayers', mode: 'adiabat', temperature (T, K), pressure (p, hPa), theta? (θ, K), kappa? (κ, default 0.286), fixed? }. Example: { kind: 'atmosphereLayers', mode: 'adiabat', temperature: 'T', pressure: 'p', theta: 'th', kappa: 0.286 } (263.15 K at 700 hPa → θ = 291.4 K).",
        "Fields (~humidity): { kind: 'atmosphereLayers', mode: 'saturation', temperature (T, °C), dewPoint (T_d, °C), saturation? (eₛ, hPa), vapor? (e, hPa), rh? (RH, %), pressure? (p, hPa), mixing? (r, g/kg), coefficients? ([6.112, 17.67, 243.5], Tetens' a, b, c as the page writes them), fixed? }. Example: { kind: 'atmosphereLayers', mode: 'saturation', temperature: 'T', dewPoint: 'Td', saturation: 'es', vapor: 'e', rh: 'RH', pressure: 'p', mixing: 'r' } (25 °C, 15 °C, 1,000 hPa → eₛ = 31.67, e = 17.04 hPa, RH = 53.8 %, r = 10.78 g/kg).",
        'adiabat: the chart’s top is the round pressure below p ÷ 1.6; the adiabats every 10 K (20 K on a wide chart) are labelled near the top; the parcel’s adiabat is bold from p down to 1,000 hPa, dashed above. Drag the parcel for T and p. saturation: T from −40 to 50 °C, e up to a round value above eₛ(T) (the curve runs off the top past it). Drag the air’s point for T and the dew point along the curve (T_d ≤ T). A "?" T or p (T or T_d) draws no point.',
        'Harness (harness/picturesHe4g.ts): θ = T(1,000 ÷ p)^κ; eₛ and e by Tetens at T and T_d, RH = 100e ÷ eₛ, r = 622e ÷ (p − e).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-atmosphereLayers-adiabat',
      'g.he-atmosphereLayers-adiabat-high',
      'g.he-atmosphereLayers-saturation',
      'g.he-atmosphereLayers-saturation-cold',
    ],
  },
  {
    ...ask(
      'HC124',
      'atmosphereLayers',
      'The rising parcel with the page’s lapse rates: the parcel’s line at dry °C per km and its dew point’s at dewLapse °C per km meeting at the cloud base, the cumulus beside it on the same scale',
      { [`${MET}#1~lcl`]: '"dewLapse"' },
      [
        'From EG-P12. New options on atmosphereLayers mode parcel (typesHe4g.ts ParcelLapseFields and ParcelLapseSpec), drawn by the existing reps/AirParcel.tsx, which now takes its two lapse rates from the spec (10 and 2 °C/km when a page sets neither, so s.12.atmosphere-weather~cloud-base is unchanged).',
        "Fields: { kind: 'atmosphereLayers', mode: 'parcel', temperature (T, °C), dewPoint (T_d, °C), base? (the cloud base, in baseUnit), dry? (°C/km, default 10), dewLapse? (°C/km, default 2), baseUnit?: 'm' | 'km' (default km), baseTemperature? (°C at the base) }; a page sets dry or dewLapse (or both) to use them.",
        "Example (~lcl): { kind: 'atmosphereLayers', mode: 'parcel', temperature: 'T', dewPoint: 'Td', base: 'z', baseUnit: 'm', baseTemperature: 'Tb', dry: 9.8, dewLapse: 1.8 } (30 °C, 14 °C → 2,000 m, 10.4 °C at the base).",
        'The key and the caption read the page’s rates (−9.8 and −1.8 °C per km; they close 8 °C per km, 125 m per °C); the caption gives the base in km and, with baseUnit m, in metres. Above the base the parcel cools about 6 °C per km, as before.',
        'Harness (harness/picturesHe4g.ts): base = (T − T_d) ÷ (dry − dewLapse) (× 1,000 in m); the temperature at the base = T − dry × base; T_d ≤ T; dry > dewLapse.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-atmosphereLayers-parcel-lapse', 'g.he-atmosphereLayers-parcel-lapse-dry'],
  },
];
