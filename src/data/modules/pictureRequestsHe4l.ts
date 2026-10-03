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
  {
    ...ask(
      'HC167',
      'printLayers',
      'A part in its powder bed sliced into layers (n counted, a few drawn and a break), the stair steps and cusp c = t cos θ on a sloped face, and a time bar per layer',
      [`${E}manufacturing#2`, `${E}manufacturing#2~cusp`],
      [
        'From ME-P20. New kind (typesHe4l.ts PrintLayersSpec, reps/PrintLayers.tsx, cuspOf and the scan-speed units in reps/he4lMath.ts).',
        "Fields: { kind: 'printLayers', layer (t), height? (H), layers? (n), angle? (θ from the build plate, degrees: draws the sloped face instead of the stack), cusp? (c), area? (A), hatch? (s), speed? (v; mm/s understood), recoat? (t_r), layerTime? (t_layer), buildTime? (T) }.",
        'Stack: a metal part in its powder bed on a steel build plate, layers enlarged (all when n ≤ 12, else five, a break naming n, and two), H dimensioned at the left, t on the first layer, the laser on the top layer. Slope: five enlarged steps against the true face (dashed), one cusp shaded with c square to the face, t and θ marked. Time bar: the scan A ÷ (sv) and recoat t_r to scale, t_layer under it. A "?" t draws no layer lines (no stair on a slope); a "?" time leaves its part of the bar out. No handles.',
        "Examples: main { kind: 'printLayers', layer: 't', height: 'H', layers: 'n', area: 'A', hatch: 's', speed: 'v', recoat: 'tr', layerTime: 'tl', buildTime: 'T' }; ~cusp { kind: 'printLayers', layer: 't', angle: 'th', cusp: 'c' }.",
        'Harness (harness/picturesHe4l.ts): n = H ÷ t; c = t cos θ; t_layer = A ÷ (sv) + t_r; T = n t_layer (in SI); θ within 0° to 90°.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-printLayers-build',
      'g.he-printLayers-few',
      'g.he-printLayers-cusp',
      'g.he-printLayers-cusp-shallow',
    ],
  },
  {
    ...ask(
      'HC168',
      'fitDiagram',
      'Limits and fits: the basic-size zero line, the hole’s and the shaft’s tolerance zones, C_max and C_min dimensioned and the fit named; a stack-up chain with its worst-case and RSS budget',
      [`${E}manufacturing#3`, `${E}manufacturing#3~stack`],
      [
        'From ME-P21. New kind (typesHe4l.ts FitDiagramSpec, reps/FitDiagram.tsx, fitName and the stack sums in reps/he4lMath.ts).',
        "Fields: { kind: 'fitDiagram', basic? (the basic size), hole? { max, min }, shaft? { max, min } (sizes, or deviations ES, EI and es, ei when deviations: true), deviations?, maxClearance? (C_max), minClearance? (C_min), stack? (each dimension's ± tolerance), worst? (ΣTᵢ), rss? (√(ΣTᵢ²)) }.",
        'Fit: deviation runs across, enlarged (a μm scale bar), the zero line at the basic size; the zones as bars with their limits at the ends; C_max (largest hole − smallest shaft) and C_min (smallest hole − largest shaft) dimensioned under them from extension lines, green when positive, red when negative; the fit (clearance, transition, interference) named at the top. Stack: one box per dimension with its ±T, the worst case as a stacked bar and the RSS bar under it to one scale. A "?" limit leaves its zone out; a "?" T leaves the budget out. No handles.',
        "Examples: main (the plan's ES, EI, es, ei typed as sizes, so no example value is 0) { kind: 'fitDiagram', basic: 25, hole: { max: 'Hmax', min: 'Hmin' }, shaft: { max: 'smax', min: 'smin' }, maxClearance: 'Cmax', minClearance: 'Cmin' }, pictureLabels Tf (the fit tolerance C_max − C_min joins the two clearances in one page); a page typing deviations passes deviations: true. ~stack { kind: 'fitDiagram', stack: ['T1', 'T2', 'T3', 'T4'], worst: 'wc', rss: 'rss' }.",
        'Harness (harness/picturesHe4l.ts): each zone’s upper limit ≥ its lower; C_max = ES − ei and C_min = EI − es; worst case ΣTᵢ; RSS √(ΣTᵢ²).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-fitDiagram-clearance',
      'g.he-fitDiagram-transition',
      'g.he-fitDiagram-interference',
      'g.he-fitDiagram-stack',
    ],
  },
  {
    ...ask(
      'HC169',
      'orthographic',
      'Explore figure: a stepped block with a through hole in a glass box, the box unfolded, the three views with one lit, hidden edges dashed and centre lines, the isometric view on 120° axes; card icons for the line types',
      {
        [`${E}cad-graphics#0`]: "figure: { kind: 'orthographic' }",
        [`${E}cad-graphics#0~line-types`]: "icon: 'hidden line'",
        [`${E}cad-graphics#0~angle`]: "angle: 'first'",
      },
      [
        'From ME-P22. Explore figure (typesHe4l.ts OrthoScene and He4lFigure, layouts/orthographicFigure.tsx; card icons in layouts/icons/he4l.tsx, names in data/modules/layouts/icons/he4l.ts).',
        "Scene field: ortho: { view: 'box' | 'unfold' | 'front' | 'top' | 'right' | 'hidden' | 'center' | 'isometric', angle?: 'third' (default) | 'first' }. One block, in mm: a 60 × 40 × 15 base, a 30 × 40 × 20 step on its left, a Ø12 hole through the base.",
        'Views drawn as a drawing is: visible lines thick, hidden lines dashed, centre lines long-short; projection lines faint between views; the lit view on a tinted pane, the others faded; unfold adds the glass panes and their hinges; first angle puts the top view below the front and the right view on the left. The isometric block has flat shaded faces with the hole, and its three axes dashed from the near bottom corner.',
        "Line-type card icons (each lit on a small part): 'visible line', 'hidden line', 'center line', 'dimension line', 'extension line', 'circle center lines'; a card is { label, bin, figure: { kind: 'icon', icon: 'hidden line' } }.",
        "Examples: the main explore's scenes { ortho: { view: 'box' } } to { ortho: { view: 'isometric' } }; ~angle may use { ortho: { view: 'top', angle: 'first' } } beside its sort. Layout check (harness/picturesHe4l.ts orthoFigureIssues): every scene of the figure names a known view; no other figure carries one.",
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-orthographic', 'g.he-orthographic-angle', 'g.he-cardIcons-line-types'],
  },
  {
    ...ask(
      'HC170',
      'icon',
      'Card icons: the 14 GD&T characteristic symbols, drawn by us to the standard’s shapes in a frame cell',
      [`${E}cad-graphics#1`],
      [
        'From ME-P23. Card icons (layouts/icons/he4l.tsx; names in data/modules/layouts/icons/he4l.ts HE4L_GDT_ICONS).',
        "Names: 'GD&T straightness', 'GD&T flatness', 'GD&T circularity', 'GD&T cylindricity', 'GD&T perpendicularity', 'GD&T parallelism', 'GD&T angularity', 'GD&T position', 'GD&T profile of a line', 'GD&T profile of a surface', 'GD&T circular runout', 'GD&T total runout', and the two withdrawn in 2018, 'GD&T concentricity', 'GD&T symmetry'.",
        "Example card: { label: 'Flatness', bin: 'form', figure: { kind: 'icon', icon: 'GD&T flatness' } }. Only the symbol names come from ASME Y14.5; every shape is our own line work. No values, so no harness check.",
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-cardIcons-gdt'],
  },
  {
    ...ask(
      'HC172',
      'casting',
      'A sand mould cut open with the casting and a side riser to scale, V and A named, Chvorinov solidification time bars',
      [`${E}manufacturing#0`, `${E}manufacturing#0~riser`],
      [
        'From ME-P30 (low priority, drawn last). New kind (typesHe4l.ts CastingSpec, reps/Casting.tsx, chvorinov and the riser sizing in reps/he4lMath.ts).',
        "Fields: { kind: 'casting', shape? ('cube' default, 'sphere', 'plate' eight times as wide as thick), volume? (V, cm³), area? (A, cm²), modulus? (M = V ÷ A, cm; alone it sizes a cube of side 6M), moldConstant? (B, min/cm²), time? (t), riser? { modulus? (M_r), diameter? (D, with H = D), time?, ratio? (default 1.25) } }.",
        'A wooden flask, cope over drag with the parting line dashed, sand painted with grains; the casting in its cavity to scale from V, the sprue and runner filled; a side riser (H = D) on a neck at the same scale, open to the top. V and A (or M) labelled on the casting, D under the riser. Time bars: t = BM² for the casting and the riser’s 1.25t beside it (without B, the bars compare the two). A "?" V draws no casting; a "?" D no riser. No handles.',
        "Examples: main { kind: 'casting', shape: 'cube', volume: 'V', area: 'A', modulus: 'M', moldConstant: 'B', time: 't' }; ~riser { kind: 'casting', shape: 'cube', modulus: 'Mc', riser: { modulus: 'Mr', diameter: 'D' } }.",
        'Harness (harness/picturesHe4l.ts): M = V ÷ A; t = BM²; M_r = √1.25 M_c; D = 6M_r; the riser’s time is 1.25 × the casting’s.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-casting-cube', 'g.he-casting-plate', 'g.he-casting-riser'],
  },
];
