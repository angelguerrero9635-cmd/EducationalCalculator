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
const GEO = 'he.earth-science.geophysics';

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
  {
    ...ask(
      'HC125',
      'atmosphereLayers',
      'The one-layer greenhouse: sunlight S ÷ 4 in, α reflected, F through the layer into the ground; the ground’s infrared G, the share ε absorbed by the layer and the rest escaping; the layer’s εG ÷ 2 up and down; every band to scale and balanced; a thermometer at Tₛ with Tₑ marked',
      { 'he.geography.climatology#0': '"layer"' },
      [
        'From EG-P13. New option on atmosphereLayers mode balance (typesHe4g.ts BalanceLayerSpec, reps/BalanceLayer.tsx, sums in reps/he4gMath.ts layerBudget); balance without layer (s.12.climate-systems~energy-balance) is unchanged.',
        "Fields: { kind: 'atmosphereLayers', mode: 'balance', albedo (α), sunlight? (S, W/m², default 1,361), absorbed? (F, W/m²), temperature? (Tₑ, K), layer: { emissivity (ε, 0–1), surface? (Tₛ, K) } }.",
        "Example (#0): { kind: 'atmosphereLayers', mode: 'balance', albedo: 'al', sunlight: 'S', absorbed: 'F', temperature: 'Te', layer: { emissivity: 'eps', surface: 'Ts' } } (1,361 W/m², α = 0.30, ε = 0.78 → F = 238.2 W/m², Tₑ = 254.6 K, Tₛ = 288.1 K).",
        'Bands at 56 px per 400 W/m²: G = 2F ÷ (2 − ε) = 390.5, εG = 304.6 into the layer, (1 − ε)G = 85.9 and εG ÷ 2 = 152.3 out at the top (238.2 = F), 152.3 back down. The caption works F, Tₑ and Tₛ. A "?" S, α or ε draws the bands faded with "?" numbers.',
        'Harness (harness/picturesHe4g.ts): F = S(1 − α) ÷ 4; σTₑ⁴ = F; Tₛ = Tₑ(2 ÷ (2 − ε))^(1/4); the top, the layer and the ground each balance; 0 ≤ ε ≤ 1.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-atmosphereLayers-balance-layer', 'g.he-atmosphereLayers-balance-layer-opaque'],
  },
  {
    ...ask(
      'HC130',
      'rayDiagram',
      'A seismic ray crossing from a layer of speed v₁ into one of v₂, the layers named by speed, bent by sin r = (v₂ ÷ v₁) sin i, wavefront ticks spaced as each speed; the critical angle marked into a faster layer and total reflection past it',
      { [`${GEO}#0~critical-angle`]: '"speeds"' },
      [
        'From EG-P21. New option on rayDiagram mode refraction (typesHe4g.ts RaySpeedsSpec, reps/RaySpeeds.tsx, snellSpeeds in reps/he4gMath.ts); refraction with n1 and n2 is unchanged.',
        "Fields: { kind: 'rayDiagram', mode: 'refraction', speeds: { v1, v2 } (m/s), angle (i, °), refracted? (r, °), critical? (i_c, °), media?: [top, bottom] (names; default 'upper layer', 'lower layer'), fixed? }.",
        "Example (~critical-angle): { kind: 'rayDiagram', mode: 'refraction', speeds: { v1: 'v1', v2: 'v2' }, angle: 'i', refracted: 'r', critical: 'ic', media: ['water-soaked sand', 'bedrock'] } (1,500 to 4,500 m/s at 10° → r = 31.4°, i_c = 19.47°).",
        'The faint reflection is always drawn; past i_c it is the whole ray and "all reflected" is written. Into a slower layer no critical angle is drawn and the caption says so. Drag the incoming ray for i. A "?" speed draws no layers’ values; a "?" i draws no ray.',
        'Harness (harness/picturesHe4g.ts): r by sin r = (v₂ ÷ v₁) sin i; i_c = sin⁻¹(v₁ ÷ v₂) only when v₂ > v₁; no r past i_c.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-rayDiagram-speeds', 'g.he-rayDiagram-speeds-near-critical'],
  },
  {
    ...ask(
      'HC131',
      'gravityProfile',
      'Gravity and isostasy: a buried sphere in section to scale under its anomaly profile (the peak and the half-width x½ = 0.766z), or crust floating on the mantle, a mountain and its root to the compensation depth with two columns of equal weight',
      { [`${GEO}#1~sphere`]: '"sphere"', [`${GEO}#1~isostasy`]: '"airy"' },
      [
        'From EG-P22. New kind gravityProfile (typesHe4g.ts GravitySphereSpec and GravityAirySpec, reps/GravityProfile.tsx, sums in reps/he4gMath.ts).',
        "Fields (~sphere): { kind: 'gravityProfile', mode: 'sphere', radius (R, m), contrast (Δρ, kg/m³; negative for a light body), depth (z, m, to the centre), mass? (kg), peak? (Δg_max, mGal), halfWidth? (x½, m), G? (default 6.674 × 10⁻¹¹), fixed? }. Example: { kind: 'gravityProfile', mode: 'sphere', radius: 'R', contrast: 'drho', depth: 'z', mass: 'M', peak: 'gmax', halfWidth: 'xh', G: 6.674e-11 } (100 m, 500 kg/m³, 200 m → 2.094 × 10⁹ kg, 0.3494 mGal, x½ = 153.2 m).",
        "Fields (~isostasy): { kind: 'gravityProfile', mode: 'airy', height (h, km), thickness (T, normal crust, km), crust (ρ_c, g/cm³), mantle (ρ_m, g/cm³), root? (r, km), total? (T + h + r, km) }. Example: { kind: 'gravityProfile', mode: 'airy', height: 'h', thickness: 'T', crust: 'rc', mantle: 'rm', root: 'r', total: 'tot' } (3 km, 35 km, 2.8, 3.3 → r = 16.8 km, 54.8 km).",
        'sphere: one scale across and down (±3z), stations on the surface, a scale bar; a low for Δρ < 0; z ≤ R draws faded ("the sphere must be buried"). Drag the sphere for z. airy: heights to scale, widths not; the caption checks the two columns’ weights. The demos add constraints R < z and ρ_c < ρ_m.',
        'Harness (harness/picturesHe4g.ts): mass = (4 ÷ 3)πR³Δρ; Δg_max = GM ÷ z² × 10⁵; x½ = 0.766z (0.1%); r = hρ_c ÷ (ρ_m − ρ_c); total = T + h + r; equal column weights.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-gravityProfile-sphere',
      'g.he-gravityProfile-sphere-salt',
      'g.he-gravityProfile-airy',
      'g.he-gravityProfile-airy-high',
    ],
  },
  {
    ...ask(
      'HC132',
      'electrodeArray',
      'A Wenner survey: four steel electrodes a apart, an ammeter on C₁ and C₂ and a voltmeter on P₁ and P₂, the current’s paths through the ground and the equipotentials (those through P₁ and P₂ lit), the ground sampled to about a ÷ 2 shaded',
      { [`${GEO}#3`]: '"electrodeArray"' },
      [
        'From EG-P23. New kind electrodeArray (typesHe4g.ts ElectrodeArraySpec, reps/ElectrodeArray.tsx, wennerOf in reps/he4gMath.ts).',
        "Fields: { kind: 'electrodeArray', spacing (a, m), voltage (V, V), current (I, A), resistance? (R, Ω), resistivity? (ρ_a, Ω·m), fixed? }.",
        "Example (#3): { kind: 'electrodeArray', spacing: 'a', voltage: 'V', current: 'I', resistance: 'R', resistivity: 'rho' } (10 m, 0.30 V, 0.20 A → 1.5 Ω, 94.25 Ω·m).",
        'The array always spans the same width (the drawing is the same shape at any a, as the physics is); the brackets, the sampled depth and the caption carry a. The current paths are the circles through C₁ and C₂; the equipotentials are contours of 1 ÷ r₁ − 1 ÷ r₂. Drag C₂ for a (the scale holds while dragging, so the array spreads). A "?" V or I reads "?" on its meter and the caption waits.',
        'Harness (harness/picturesHe4g.ts): R = V ÷ I; ρ_a = 2πaV ÷ I; a > 0.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-electrodeArray', 'g.he-electrodeArray-wide'],
  },
  {
    ...ask(
      'HC140',
      'circulationCells',
      'Explore figure: Earth from the side with the Hadley, Ferrel and polar cells of both hemispheres over its limb (edges at 0°, 30°, 60°, 90°), the surface winds on its face, the ITCZ, subtropical highs and subpolar lows; a scene lights a cell, a wind or a belt',
      { 'he.geography.climatology#1~cells': '"circulationCells"' },
      [
        'From EG-P33. New explore figure (typesHe4g.ts He4gFigure and CirculationScene, layouts/circulationFigure.tsx, the cells in reps/he4gMath.ts CELLS); the page ships as a sort today and can become this explore.',
        "Figure: { kind: 'circulationCells' }; each scene: circulation: { lit?: 'hadley' | 'ferrel' | 'polar' | 'trades' | 'westerlies' | 'easterlies' | 'itcz' | 'highs' | 'lows' } (none lights everything).",
        "Example scene: { label: 'Trade winds', lines: [...], circulation: { lit: 'trades' } }; the demo g.he-circulationCells has eight scenes (the three cells, the ITCZ, the trades, the subtropical highs and deserts, the westerlies, the polar cell).",
        'The globe is painted; the cells, arrows and labels are flat. Each loop has its surface and upper arrows; H and L sit at the edges (L at 0° and 60°, H at 30° and the poles); the belts and winds are named in the north, the south mirrors them.',
        'Layout check (harness/picturesHe4g.ts circulationFigureIssues): the edges are 0, 30, 60, 90°; the trades blow toward the equator and the westerlies toward the pole in both hemispheres; every lit name exists.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-circulationCells'],
  },
];
