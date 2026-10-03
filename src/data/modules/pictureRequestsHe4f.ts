/**
 * College pictures, round 4, group F (docs/RENDERINGS_HE.md). Spread into
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

const E = 'he.earth-science.';

export const HE4F_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC116',
      'ternary',
      'A triangle plot of three amounts with a 10% grid and the corners named; the IUGS QAP fields (numbered and keyed) or the feldspar fields (plagioclase along the Ab–An edge, alkali feldspars along Ab–Or), the point’s field lit and named',
      [`${E}physical-geology#0`, `${E}mineralogy#1~plagioclase`],
      [
        'From EG-P1. New kind (typesHe4f.ts TernarySpec, reps/Ternary.tsx; fields and their polygons in reps/he4fMath.ts).',
        "Fields: { kind: 'ternary', a (top corner), b (bottom left), c (bottom right) (amounts in one unit, normalized by their sum), labels: [top, left, right], fields?: 'qap' | 'feldspar', share? (the page's c ÷ (b + c) in %, dashed from the top corner), normalized? ([a′, b′, c′] the page's percents) }.",
        'QAP: Q at the top, A left, P right; rows at Q′ 5, 20, 60, 90%, P ÷ (A + P) lines at 10, 35, 65, 90%; fields 1a–10 numbered in the triangle and keyed under it. Feldspar: Or at the top, Ab left, An right; plagioclase (Or ≤ 10%) named albite … anorthite at An 10, 30, 50, 70, 90% under the base; alkali feldspars (An ≤ 10%) anorthoclase to Or 37%, then sanidine and orthoclase; the miscibility gap between (straight boundaries, a teaching simplification). A "?" amount or a zero sum plots nothing. No handles. Later also sand–silt–clay (a third `fields` value).',
        "Example (physical-geology#0): { kind: 'ternary', a: 'Q', b: 'A', c: 'P', labels: ['Q', 'A', 'P'], fields: 'qap', share: 'share', normalized: ['qn', 'an', 'pn'] } (Q 25, A 30, P 20 → 33.3, 40.0, 26.7%; share 40% → field 3b, monzogranite). Example (mineralogy#1~plagioclase): { kind: 'ternary', a: 0, b: 'na', c: 'ca', labels: ['Or', 'Ab', 'An'], fields: 'feldspar', share: 'an' } (Ca 0.6 → An₆₀, labradorite).",
        'Harness (harness/picturesHe4f.ts): the point’s distance from each side is that amount ÷ the sum (0.5%), the page’s normalized values and share agree; the field the caption names (by the rules) contains the point (by its drawn polygon).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-ternary-qap',
      'g.he-ternary-qap-diorite',
      'g.he-ternary-feldspar',
      'g.he-ternary-feldspar-albite',
    ],
  },
  {
    ...ask(
      'HC117',
      'silicateChain',
      'SiO₄ tetrahedra from above as triangles, O at the corners and Si at the centre (the fourth O on top): isolated, pairs, a ring, a single chain, a double chain, a sheet or a framework; shared oxygens ringed, the repeat unit boxed and its O and charge counted',
      [`${E}physical-geology#0~silicates`],
      [
        'From EG-P2. New kind (typesHe4f.ts SilicateChainSpec, reps/SilicateChain.tsx; the structures and the count in reps/silicateMath.ts).',
        "Fields: { kind: 'silicateChain', shared (s: 0, 1, 2, 2.5, 3, 4), units (n, whole 1–6: the Si boxed), form?: 'ring' | 'chain' (s = 2; default chain; a ring of n tetrahedra when 3 ≤ n ≤ 6), oxygens? (O in the unit), perSi? (O per Si), charge? }.",
        'Shared corner oxygens are ringed and count ½ in the box; a framework (s = 4) rings the apex too. Another s draws faded with the reason; a double chain with an odd n boxes part of a repeat, faded, and says to take an even n. A "?" s draws nothing; a "?" n draws no box. No handles.',
        "Example: { kind: 'silicateChain', shared: 's', units: 'n', oxygens: 'o', perSi: 'perSi', charge: 'q' } (s = 2.5, n = 4 → O = 11, charge −6, Si₄O₁₁⁶⁻; s = 3, n = 2 → Si₂O₅²⁻). The ring: add form: 'ring' (s = 2, n = 6 → Si₆O₁₈¹²⁻).",
        'Harness (harness/picturesHe4f.ts): the oxygens counted from the drawn corners equal n(4 − s ÷ 2); the boxed tetrahedra share s on average; 4n − 2O = −n(4 − s); the page’s O, O per Si and charge agree.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-silicateChain-double',
      'g.he-silicateChain-sheet',
      'g.he-silicateChain-chain',
      'g.he-silicateChain-ring',
      'g.he-silicateChain-pair',
      'g.he-silicateChain-isolated',
      'g.he-silicateChain-framework',
    ],
  },
  {
    ...ask(
      'HC119',
      'earthLayers',
      'Moment magnitude: a block of crust cut along a vertical fault, its near half lifted away so the rupture patch L × W shows on the fault plane to scale, slip arrows D on either side of the trace, and Mw on a bar against an M 6 reference',
      [`${E}physical-geology#2`],
      [
        'From EG-P5. New mode on earthLayers (typesHe4f.ts RuptureSpec, reps/EarthRupture.tsx; M₀, Mw and the patch in reps/he4fMath.ts). The other modes are unchanged.',
        "Fields: { kind: 'earthLayers', mode: 'rupture', length (L, km), width (W, km), slip (D, m), rigidity? (μ, GPa; default 30), area? (km²), moment? (M₀, N·m), magnitude? (Mw) }.",
        'The patch fills the fault face at one scale, its sides in the ratio L : W; the crust is painted, the bars flat; the caption works M₀ = μLWD (μ in Pa, L and W in m) and Mw = (2 ÷ 3)(log₁₀ M₀ − 9.1), and the energy against an M 6 (10^(1.5ΔM)). A "?" L or W draws no patch, a "?" D no slip or bar. No handles.',
        "Example: { kind: 'earthLayers', mode: 'rupture', length: 'L', width: 'W', slip: 'D', rigidity: 'mu', area: 'A', moment: 'M0', magnitude: 'Mw' } (30 GPa, 100 km × 20 km, 2 m → M₀ = 1.2 × 10²⁰ N·m, Mw = 7.32). The interim `magnitude` mode's m1 = 6, m2 = Mw is no longer needed.",
        'Harness (harness/picturesHe4f.ts): the drawn patch’s sides are in the ratio L : W inside the face; A = LW; M₀ = μLWD; Mw = (2 ÷ 3)(log₁₀ M₀ − 9.1) within 0.01 of the page’s; Mw on the 0–10 bar.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-earthLayers-rupture', 'g.he-earthLayers-rupture-great'],
  },
  {
    ...ask(
      'HC120',
      'rockLayers',
      'Index fossils’ ranges as bars on a Ma axis beside a rock column, their overlap shaded and bracketed; and the dated cliff as a sequence page’s header figure (beds tilted under an angular unconformity, flat beds over it, a dike cutting every bed it reaches)',
      {
        [`${E}historical-geology#2`]: "representation: { kind: 'rockLayers', ranges: [...] }",
        [`${E}historical-geology#0`]:
          "header: { kind: 'cliff', beds: [...], unconformity, tilt, intrusion, surface }",
      },
      [
        'From EG-P6. (a) New option on rockLayers (typesHe4f.ts RockRangesSpec, reps/RockRanges.tsx, the window in reps/he4fMath.ts); the dating and fossil-count options are unchanged. (b) New sequence `header` (layouts/types.ts SequenceLayout.header, typesHe4f.ts CliffHeader, layouts/cliffHeaderHe4f.tsx, geometry and events in layouts/cliffMath.ts), drawn above the question.',
        'Fields (a): { kind: \'rockLayers\', ranges: { name, first (Ma, the older), last (Ma) }[] (2–4), oldest? (the youngest first appearance), youngest? (the oldest last appearance), window? (Myr) }. Ranges that never overlap draw no window and the caption says so; a "?" age draws no bar for that fossil.',
        "Fields (b): header: { kind: 'cliff', beds: ('sandstone' | 'shale' | 'limestone' | 'siltstone' | 'conglomerate')[] bottom up, unconformity? (beds under it), tilt? (degrees, the beds under it), intrusion?: { rock?: 'basalt' | 'granite', top? (the highest bed it cuts; default the top bed; one under the unconformity stops at it) }, surface? (today's surface eroded: the last event) }.",
        "Example (a): { kind: 'rockLayers', ranges: [{ name: 'Fossil A', first: 'aFirst', last: 'aLast' }, { name: 'Fossil B', first: 'bFirst', last: 'bLast' }], oldest: 'oldest', youngest: 'youngest', window: 'span' } (A 420–380, B 400–360 Ma → 400 to 380 Ma, 20 Myr). Example (b), historical-geology#0: header: { kind: 'cliff', beds: ['sandstone', 'shale', 'limestone', 'conglomerate', 'siltstone'], unconformity: 3, tilt: 20, intrusion: { rock: 'basalt' }, surface: true } with the plan's eight stages (each stage names its rocks, or says tilted, erosion or dike).",
        'Checks: (a) harness/picturesHe4f.ts: the window is [the older of the last appearances, the younger of the first], none when empty; first ≥ last; the page’s values agree. (b) layouts.test.ts (cliffIssues): flat beds only over the unconformity, tilt only with one; the dike reaches its top bed’s top (or stops at the unconformity); the events read from the stages’ text equal the figure’s order.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-rockLayers-ranges',
      'g.he-rockLayers-ranges-narrow',
      'g.he-rockLayers-cliff',
      'g.he-rockLayers-cliff-old-dike',
    ],
  },
  {
    ...ask(
      'HC121',
      'michelLevy',
      'The interference colour chart, computed in code: retardation 0–1,800 nm across in the first to third orders, thickness 0–50 μm up, birefringence lines from the origin with their values, the grain’s point on its own line with Γ and the colour’s order and name printed by it',
      [`${E}mineralogy#2`],
      [
        'From EG-P9. New kind (typesHe4f.ts MichelLevySpec, reps/MichelLevy.tsx; the colours in reps/michelLevyMath.ts: sin²(πΓ ÷ λ) through crossed polars, lit by a 6,500 K black body, weighed with analytic Gaussian fits of the CIE 1931 colour-matching functions, to sRGB; no scanned chart).',
        "Fields: { kind: 'michelLevy', thickness (t, μm), birefringence (δ), retardation? (Γ, nm), order? }.",
        'Order lines every 550 nm, the standard 30 μm dashed, lines δ = 0.005 … 0.2 labelled where they leave the chart (one near the grain’s left out). A Γ past 1,800 nm widens the chart (to the tenth order) and the caption says high orders wash out to white. A "?" t or δ places no point. No handles.',
        "Example: { kind: 'michelLevy', thickness: 't', birefringence: 'd', retardation: 'G', order: 'ord' } (quartz δ = 0.009, 30 μm → Γ = 270 nm, first-order white; olivine δ = 0.035 → 1,050 nm, second-order red).",
        'Harness (harness/picturesHe4f.ts): Γ = 1,000tδ (and the page’s); the order printed is floor(Γ ÷ 550) + 1 and the colour’s name carries it; the ramp is black at 0 and near white past the third order.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-michelLevy-quartz', 'g.he-michelLevy-olivine', 'g.he-michelLevy-calcite'],
  },
  {
    ...ask(
      'HC126',
      'oceanProfile',
      'A section across a geostrophic current: the sea surface tilted Δη over Δx (the vertical stretch written), the pressure-gradient force down the slope and the Coriolis force back, and the current into or out of the page by hemisphere',
      [`${E}oceanography#2`],
      [
        'From EG-P14. New mode on oceanProfile (typesHe4f.ts OceanSlopeSpec, reps/OceanSlope.tsx; the balance in reps/he4fMath.ts). The other modes are unchanged.',
        "Fields: { kind: 'oceanProfile', mode: 'slope', rise (Δη, m; negative: high on the left), width (Δx, km), latitude (φ, °; negative or hemisphere: 'south' for the south), speed? (v, m/s), coriolis? (f, s⁻¹), g? (default 9.81 m/s²), omega? (default 7.292 × 10⁻⁵ rad/s), hemisphere? }.",
        'The water is painted, the forces flat and equal; ⊗ into the page when high sea level is on the current’s right in the north, ⊙ out of it in the south. Within 1° of the equator no balance is drawn and the caption says why. A "?" draws nothing for that value. No handles.',
        "Example: { kind: 'oceanProfile', mode: 'slope', rise: 'eta', width: 'dx', latitude: 'phi', coriolis: 'f', speed: 'v' } (1 m over 100 km at 35° N → f = 8.37 × 10⁻⁵ s⁻¹, v = 1.17 m/s into the page).",
        'Harness (harness/picturesHe4f.ts): f = 2Ω sin φ; fv = gΔη ÷ Δx (v = gΔη ÷ (fΔx)) and the page’s f and v agree; high sea level on the right in the north, on the left in the south.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-oceanProfile-slope',
      'g.he-oceanProfile-slope-south',
      'g.he-oceanProfile-slope-tropics',
    ],
  },
  {
    ...ask(
      'HC127',
      'tsDiagram',
      'A T–S diagram: temperature up, salinity across, the isopycnals of the page’s equation of state every 0.5 kg/m³, the freezing line with ice below it, the water’s point with its density',
      [`${E}oceanography#1`],
      [
        'From EG-P15. New kind (typesHe4f.ts TsDiagramSpec, reps/TsDiagram.tsx; the state, window and isopycnals in reps/he4fMath.ts).',
        "Fields: { kind: 'tsDiagram', temperature (T, °C), salinity (S, g/kg), density? (ρ, kg/m³), freezing? (T_f, °C), state? ({ rho0, alpha, beta, t0, s0 }: the page's linear equation of state; default 1,027, 1.7 × 10⁻⁴, 7.6 × 10⁻⁴, 10, 35), freezeSlope? (default 0.054 °C per g/kg) }.",
        'The chart is S 30–40 g/kg by T −2.5–30 °C, widened to hold the point (brackish water down to 0 g/kg); isopycnals labelled where they leave it, every 1 or more kg/m³ as room allows. Water below its freezing point draws faded and says so. A "?" draws no point. No handles.',
        "Example: { kind: 'tsDiagram', temperature: 'T', salinity: 'S', density: 'rho', freezing: 'tf' } (2 °C, 34.7 g/kg → ρ = 1,028.2 kg/m³, T_f = −1.87 °C).",
        'Harness (harness/picturesHe4f.ts): the point’s density by the relation is the page’s within 0.01 kg/m³; every isopycnal’s two ends hold its density by the same relation; T_f = −0.054S; the point is on the chart.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-tsDiagram', 'g.he-tsDiagram-surface', 'g.he-tsDiagram-brackish'],
  },
];
