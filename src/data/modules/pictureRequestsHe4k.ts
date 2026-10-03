/**
 * College pictures, round 4, group K (docs/RENDERINGS_HE.md). Spread into
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

export const HE4K_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC160',
      'dialyzer',
      'A hollow-fiber dialyzer: blood in at C_in and out at C_out through the fibers, dialysate the other way through the shell, and the blood flow as a band with its cleared share K',
      [`${E}biotransport#2`],
      [
        'From B-P29. New kind (typesHe4k.ts DialyzerSpec, reps/Dialyzer.tsx, reps/he4kMath.ts).',
        "Fields: { kind: 'dialyzer', qb (Q_b, mL/min), cin, cout (C_in, C_out, mg/dL), k? (the page's K, mL/min, checked), qd? (dialysate flow, a label), t? (min), v? (L), ktv?, urr? (% or a share) }.",
        'Painted: the shell (plastic, a sheen) full of dialysate with chevrons pointing left, five fibers carrying blood left to right, urea dots along each fiber crowding where C is high (C falls from C_in to C_out exponentially along the fiber; the dots are spaced by ∫C dx), the blood and dialysate ports with arrows. Under it the band of Q_b with the cleared share (C_in − C_out) ÷ C_in shaded and K written above it. The caption works K = Q_b(C_in − C_out) ÷ C_in, then Kt/V = Kt ÷ 1000V and URR = 1 − e^(−Kt/V) when t and V are given. A "?" C or Q_b draws no dots, label or band; C_out > C_in draws faded with the reason. No handles.',
        "Example: { kind: 'dialyzer', qb: 'qb', cin: 'cin', cout: 'cout', k: 'k', t: 't', v: 'v', ktv: 'ktv', urr: 'urr' } (300 mL/min, 100 → 40 mg/dL → K = 180 mL/min; 240 min, 40 L → Kt/V = 1.08, URR = 66%).",
        'Harness (harness/picturesHe4k.ts): K = Q_b − Q_b·C_out ÷ C_in; C_out ≤ C_in; the dots along a fiber match a midpoint sum of C ÷ C_in; Kt/V and URR as written.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-dialyzer-clearance', 'g.he-dialyzer-high-flow'],
  },
  {
    ...ask(
      'HC161',
      'attenuation',
      'An X-ray beam through a slab: photon tracks stopping at their depths, half-value layers marked, I ÷ I₀ = e^(−μx) under it; `echo`: a probe over two tissues and the pulse’s round trip against time, d = ct ÷ 2',
      [`${E}bioinstrumentation#2`, `${E}bioinstrumentation#2~ultrasound`],
      [
        'From B-P32. New kind (typesHe4k.ts AttenuationSpec, reps/Attenuation.tsx, reps/he4kMath.ts).',
        "Main page (beam, the default): { kind: 'attenuation', mu (μ, cm⁻¹), x (cm), share? (I ÷ I₀, % or a share, checked), hvl? (cm, checked) }. Painted source, slab (to scale across) and detector; twenty tracks, track i stopping at −ln(1 − (i + ½) ÷ 20) ÷ μ, so the tracks still going at z are 20e^(−μz); those that cross reach the detector with arrowheads. Dashed lines at each HVL = ln 2 ÷ μ marked ½, ¼, ⅛ … (thinned when they crowd), and under the slab, on the same depth axis, the curve I ÷ I₀ = e^(−μz) with the exit share ringed and written.",
        "~ultrasound (mode 'echo'): { kind: 'attenuation', mode: 'echo', t (μs), c? (m/s, default 1540; the page passes its own), d? (cm, checked), z1?, z2? (MRayl), r? (%, checked), layers? (the two tissues' names, default 'Tissue 1', 'Tissue 2') }. The tissues painted to scale in depth, the probe on the skin, the pulse drawn down to the boundary at t ÷ 2 and back at t (time along the bottom), the transmitted pulse dashed on, R written at the top.",
        "Example (main): { kind: 'attenuation', mu: 'mu', x: 'x', share: 'share', hvl: 'hvl' } (0.2 cm⁻¹, 10 cm → 13.5%; HVL 3.47 cm). Example (~ultrasound): { kind: 'attenuation', mode: 'echo', t: 't', c: 'c', d: 'd', z1: 'z1', z2: 'z2', r: 'r', layers: ['Fat', 'Muscle'] } (130 μs → 10.0 cm; 1.38 and 1.70 MRayl → 1.08%).",
        'A "?" μ or x draws no tracks, curve or HVLs; a "?" t draws no pulse. No handles.',
        'Harness (harness/picturesHe4k.ts): the tracks past 0.1 to 4 mean free paths number 20e^(−μz) within one; one track a row; HVL by bisection; I ÷ I₀ as a product of slices; d = ct ÷ 2; R = 1 − 4Z₁Z₂ ÷ (Z₁ + Z₂)².',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-attenuation-beam',
      'g.he-attenuation-dense',
      'g.he-attenuation-echo',
      'g.he-attenuation-reflect',
    ],
  },
  {
    ...ask(
      'HC162',
      'scaffold',
      'A porous scaffold as an open-cell cube, three cells a side, its square struts as thick as the relative density ρ∗ ÷ ρ_s makes them, pores open between; a bar of solid and pore beside it',
      [`${E}tissue-engineering#0`],
      [
        'From B-P33. New kind (typesHe4k.ts ScaffoldSpec, reps/Scaffold.tsx, reps/he4kMath.ts).',
        "Fields: { kind: 'scaffold', rhoS (ρ_s, g/cm³), rhoStar (ρ∗, g/cm³), relative? (ρ∗ ÷ ρ_s, checked), porosity? (% or a share, checked), es? (E_s, MPa), estar? (E∗, MPa, checked) }.",
        'Painted in isometric (light from the top: lit tops, shaded sides): struts along every cell edge with thickness s = t ÷ L solved from 3s² − 2s³ = ρ∗ ÷ ρ_s (the exact solid share of a cubic cell of square bars), drawn as disjoint node and segment blocks in grid order so nothing overlaps wrongly. The bar beside it holds the cell’s volume, solid below and pore above, with the porosity; ρ∗ ÷ ρ_s and E∗ = E_s(ρ∗ ÷ ρ_s)² along the bottom and in the caption. A "?" density draws no struts; ρ∗ ≥ ρ_s draws a solid block, faded, with the reason. No handles.',
        "Example: { kind: 'scaffold', rhoS: 'rhoS', rhoStar: 'rhoStar', relative: 'rel', porosity: 'porosity', es: 'es', estar: 'estar' } (PCL 1.145 g/cm³, scaffold 0.229 → 0.2, 80% porous; 400 MPa → 16 MPa).",
        'Harness (harness/picturesHe4k.ts): the drawn strut thickness makes a cell as solid as ρ∗ ÷ ρ_s within 5 points, counted on a 40³ grid of points in one cell; ρ∗ < ρ_s; the relative density, porosity and E∗ as written.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-scaffold-pcl', 'g.he-scaffold-open', 'g.he-scaffold-dense'],
  },
  {
    ...ask(
      'HC163',
      'ligandGrid',
      'Adhesion ligands (RGD) seen from above on a square grid at spacing d under a cell’s edge, a 70 nm ring around one ligand, and focal-adhesion plaques drawn when d ≤ 70 nm',
      [`${E}tissue-engineering#1`],
      [
        'From B-P34. New kind (typesHe4k.ts LigandGridSpec, reps/LigandGrid.tsx, reps/he4kMath.ts).',
        "Fields: { kind: 'ligandGrid', density (per μm², 1 to 10⁵), spacing? (d, nm, checked), threshold? (nm, default 70; the page passes its own) }.",
        'A window of whole grid squares of side d = 1000 ÷ √density (8 to 40 across, about 300 nm wide, so the dots drawn per μm² are the density exactly), a dot in each square; the cell (translucent, its wavy leading edge drawn) over the upper part; a dashed ring of radius 70 nm around the middle ligand under the cell, its neighbours inside outlined; when d ≤ 70 nm, purple plaques over runs of ligands in every other row under the cell (left and right in turn, clear of the ring) and “Adhesions form”; past it, none and “No adhesions”. A scale bar (1, 2 or 5 × 10ⁿ nm). A "?" density draws the substrate and the cell only. No handles.',
        "Example: { kind: 'ligandGrid', density: 'density', spacing: 'd' } (400 per μm² → 50 nm, adhesions form; 100 per μm² → 100 nm, they don't).",
        'Harness (harness/picturesHe4k.ts): the dots drawn over the window’s area are the density (to 0.1%); d = √(10⁶ ÷ density); plaques exactly when d ≤ the threshold.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-ligandGrid-adhere', 'g.he-ligandGrid-sparse', 'g.he-ligandGrid-dense'],
  },
  {
    ...ask(
      'HC164',
      'bioreactor',
      'A stirred glass bioreactor with a sparger bubbling gas into the medium, cells as dots by their density X, and a dissolved-oxygen gauge from 0 to C∗ filled to the steady C = C∗ − qX ÷ k_La',
      [`${E}tissue-engineering#2`],
      [
        'From B-P35. New kind (typesHe4k.ts BioreactorSpec, reps/Bioreactor.tsx, reps/he4kMath.ts). Drawn on its own rather than on controlVolume: the vessel, sparger and gauge are the picture.',
        "Fields: { kind: 'bioreactor', cStar (C∗, mM), kla (k_La, h⁻¹), q (pmol/(cell·h)), x (X, cells/mL), our? (mM/h, checked), c? (C, mM, checked), xMax? (cells/mL, checked) }.",
        'Painted: the glass vessel (Glass sheen) with its metal lid, the medium, an impeller on its shaft, the gas line down the wall to a sparger ring with bubbles rising; cells as dots, each a power of ten of cells/mL (at most 120 dots, the unit written under the vessel); the gauge from 0 to C∗ filled to C with both labelled, OUR beside it, X_max = k_La·C∗ ÷ q in the caption. qX in mM/h is q × X × 10⁻⁶. C ≤ 0 empties the gauge and the caption says the cells outrun the supply (the page’s limit message). A "?" X draws no cells; a "?" C∗, k_La or q leaves the gauge empty. No handles.',
        "Example: { kind: 'bioreactor', cStar: 'cStar', kla: 'kla', q: 'q', x: 'x', our: 'our', c: 'c', xMax: 'xMax' } (0.21 mM, 5 h⁻¹, 0.2 pmol/(cell·h), 2 × 10⁶ cells/mL → OUR = 0.4 mM/h, C = 0.13 mM, X_max = 5.25 × 10⁶ cells/mL).",
        'Harness (harness/picturesHe4k.ts): C = C∗(1 − X ÷ X_max) (another route to C∗ − qX ÷ k_La); OUR, C and X_max as written; the dots times the cells per dot are X within one dot; C ≥ 0.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-bioreactor-steady', 'g.he-bioreactor-crowded'],
  },
  {
    ...ask(
      'HC176',
      'settlingTank',
      'An ideal settling basin in side view to scale: a particle entering at the surface falls at v_s while the flow carries it, landing inside exactly when v_s ≥ v₀ = Q ÷ LW; the critical path dashed and the settled share of the inlet shaded',
      [`${E}environmental#0`],
      [
        'From ACC-P25. New kind (typesHe4k.ts SettlingTankSpec, reps/SettlingTank.tsx, reps/he4kMath.ts).',
        "Fields: { kind: 'settlingTank', length, width, depth (m), q (Q, m³/s), vs (v_s, m/s), v0? (m/s, checked), removal? (% or a share, checked), t? (detention, h, checked) }.",
        'Painted concrete walls and floor, the water deepening down, inflow over the inlet wall and outflow over the weir; length and depth to scale, the depth stretched by a whole factor (1, 2, 3, 4, 5, 10 …) when the basin would be under 70 px deep, and the factor written (“depth ×3”). The particle (a sand grain) enters at the surface and runs straight to where it lands, Q ÷ (W·v_s) downstream, or to the outlet wall; the critical path at v₀ (surface to the far corner) dashed; when v_s < v₀, the band of the inlet below v_s ÷ v₀ of the depth shaded and its limiting path dotted. Q, v₀ and v_s at the top, L and D dimensioned, removal and W along the bottom. A "?" value draws no path. No handles. The page passes v_s (its own Stokes constants: ρ_p, water at 20 °C and g stay in the page’s relation, never the picture).',
        "Example: { kind: 'settlingTank', length: 'len', width: 'wid', depth: 'dep', q: 'q', vs: 'vs', v0: 'v0', removal: 'removal', t: 't' } (0.1 m³/s, 30 × 10 × 3 m → v₀ = 3.33 × 10⁻⁴ m/s, t = 2.5 h; 15 μm → v_s = 2.02 × 10⁻⁴ m/s → 60.6% removed; 20 μm → 100%).",
        'Harness (harness/picturesHe4k.ts): stepping the particle across at Q ÷ WD and down at v_s lands it inside exactly when v_s ≥ v₀, as drawn; v₀, t and removal = min(1, v_s ÷ v₀) as written.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-settlingTank-partial', 'g.he-settlingTank-all'],
  },
];
