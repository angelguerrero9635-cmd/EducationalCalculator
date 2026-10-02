/**
 * College pictures, round 2, group I (docs/RENDERINGS_HE.md). Spread into
 * HE_PICTURE_REQUESTS in pictureRequestsHe.ts.
 */
import type { PictureRequest } from './pictureRequests';

const E = 'he.engineering.';

export const HE2I_REQUESTS: PictureRequest[] = [
  {
    id: 'HC27',
    kind: 'truss',
    what: 'A pin-jointed truss to scale: steel members, supports, loads, reactions, each force with T or C and pulling or pushing arrows, a section cut with its free body, m, j and r counted, a joint’s deflection, a bar element; card figure trussJoint',
    pages: [
      // Mechanical (ME-P2)
      `${E}statics#1`,
      `${E}statics#1~sections`,
      `${E}statics#1~zero-force`,
      `${E}advanced-solid-mechanics#2~truss`,
      `${E}finite-element-analysis#2`,
      // Civil (ACC-P15)
      `${E}structural-analysis#0~truss`,
      `${E}structural-analysis#0~determinacy`,
    ],
    status: 'drawn',
    gallery: [
      'g.he-truss-joints',
      'g.he-truss-sections',
      'g.he-truss-pratt-midspan',
      'g.he-truss-howe-midspan',
      'g.he-truss-determinacy',
      'g.he-truss-determinacy-two-pins',
      'g.he-truss-deflection',
      'g.he-truss-element',
      'g.he-truss-element-steep',
      'g.he-truss-card-zero-force',
    ],
    notes: [
      'From HE-mechanical-P2 and HE-aero-civil-chemical-P15. Lengths in m and forces in kN unless `units: { length, force }` says otherwise; every member force is worked out by the method of joints (+ tension), and a member tied to a page value shows that value (a "?" draws no number, no letter and no arrows).',
      "Fields: { kind: 'truss', joints?: [{ name, x, y }] (a number, a variable id, or [id, k] for k × the value), members?: [{ from, to, force? }], supports?: [{ joint, kind: 'pin' | 'roller', reaction? }], loads?: [{ joint, P, dir?: 'down' | 'up' | 'left' | 'right' }], panels?: { type: 'pratt' | 'howe' | 'warren', n, length, height, load (at every inner lower joint), reaction? } (instead of joints; a pin and a roller, two pins when counts.r is 4), forces?: 'all' | 'cut' | 'none' (default all for joints, cut for panels; a zero-force member always shows 0, dashed), angle?: { joint, from, to, value? }, cut?: { panel: number | 'mid', chord: 'top' | 'bottom', x?, M?, F?, V?, Fd?, theta? }, counts?: { m?, j?, r?, degree? }, deflect?: { joint, delta, A (mm²), E (GPa) } (δ in mm), mode?: 'element' with element: { L (m), theta (°), du, dv (mm), delta?, A?, E?, f? (kN), sigma? (MPa) } }.",
      "statics#1 main: { kind: 'truss', joints: [{ name: 'A', x: 0, y: 0 }, { name: 'B', x: 'L', y: 0 }, { name: 'C', x: ['L', 0.5], y: 'h' }], members: [{ from: 'A', to: 'B', force: 'FAB' }, { from: 'A', to: 'C', force: 'FAC' }, { from: 'B', to: 'C', force: 'FAC' }], supports: [{ joint: 'A', kind: 'pin', reaction: 'R' }, { joint: 'B', kind: 'roller', reaction: 'R' }], loads: [{ joint: 'C', P: 'P' }], angle: { joint: 'A', from: 'B', to: 'C', value: 'theta' } } (g.he-truss-joints).",
      "statics#1~sections: the page's example is a four-panel Pratt truss (3 m panels, 4 m deep, P at the three inner lower joints, so R = 3P ÷ 2 = 15 kN). { kind: 'truss', panels: { type: 'pratt', n: 4, length: 'a', height: 'h', load: 'P', reaction: 'R' }, cut: { panel: 1, chord: 'top', x: 'x', M: 'M', F: 'F', V: 'V', Fd: 'Fd', theta: 'theta' } }: M = 60 kN·m about the lower joint at x = 6 m gives the top chord F = 15 kN (C); F_d = 6.25 kN (T) (g.he-truss-sections). The page should tie R to P (R = 3P ÷ 2) and x to a (x = 2a) so the drawn truss stays the page's.",
      "statics#1~zero-force: card figure { kind: 'trussJoint', members: [degrees, 0 right, 90 up], load?: the force's direction in degrees (drawn pushing in from the other side), support?: 'pin' | 'roller' }, 96 × 72; it never marks the zero members. The plan's five cards are in g.he-truss-card-zero-force (an unloaded corner [0, 60]; an unloaded T [0, 180, 270]; the T with load 270; a loaded apex [210, 330] with load 270; a support joint [0, 50] with support 'pin'), plus a slanted stem [0, 180, 240].",
      "structural-analysis#0~truss: { kind: 'truss', panels: { type: 'pratt', n: 'n', length: 'd', height: 'h', load: 'P', reaction: 'R' }, cut: { panel: 'mid', chord: 'top', M: 'M', F: 'F' } } (g.he-truss-pratt-midspan). NOTE for the lesson chat: in a Pratt truss the chord found about the midspan joint is the TOP chord, 135 ÷ 3 = 45 kN compression; the bottom chord in that panel is found about the next upper joint left (M = 120 kN·m, 40 kN tension). The plan's 'bottom chord F = 45 kN tension' is true of a Howe truss (g.he-truss-howe-midspan draws one: chord 'bottom', 8 panels, 80 kN T). Either keep Pratt and say top chord, compression, or switch the page to Howe.",
      "structural-analysis#0~determinacy: { kind: 'truss', panels: { type: 'pratt', n: 'n', length: 3, height: 3, load: 10 }, forces: 'none', counts: { m: 'm', j: 'j', r: 'r', degree: 'deg' } } with r allowed 3 or 4 (two pins, degree 1); the checks hold m, j and r to the drawing (m = 4n − 3, j = 2n) (g.he-truss-determinacy, g.he-truss-determinacy-two-pins).",
      "advanced-solid-mechanics#2~truss: statics#1's 8 m by 3 m truss with deflect: { joint: 'C', delta: 'delta', A: 'A', E: 'E' } and members tied to F_incl and F_bot: δ = ΣFfL ÷ (AE) = 105 kN·m ÷ (AE) = 0.525 mm, the moved apex dashed (g.he-truss-deflection).",
      "finite-element-analysis#2: { kind: 'truss', mode: 'element', element: { L: 'L', theta: 'theta', du: 'du', dv: 'dv', delta: 'delta', A: 'A', E: 'E', f: 'f', sigma: 'sigma' } }: element 1 between nodes 1 and 2, θ marked, node 2 moved by Δu then Δv (drawn larger, the factor in the caption), δ along the bar = 0.533 mm, f = 26.65 kN, σ = 53.3 MPa (g.he-truss-element; θ = 120° in g.he-truss-element-steep).",
      'Harness (truss): every joint balances with the drawn forces, reactions and loads; zero-force members are exactly 0; a page force matches the drawn one in size and, when negative, is compression; m, j, r and m + r − 2j match the drawing; the cut chord force × h equals the moment about the cut joint, and F_d sin θ = V; R = (n − 1)P ÷ 2; δ = ΣFfL ÷ (AE); δ = Δu cos θ + Δv sin θ, f = (AE ÷ L)δ, σ = f ÷ A. Cards: members at least 25° apart, the load’s arrow off every member, no member into the support.',
    ].join(' '),
  },
  {
    id: 'HC26',
    kind: 'soilProfile',
    what: 'Soil to scale in its materials: layers with the water table and σ, u, σ′ with depth; a clay layer consolidating under a load; a footing with its failure wedges, or from above with its punching perimeter; a pavement on its subgrade',
    pages: [
      `${E}soil-mechanics#2`,
      `${E}soil-mechanics#2~effective-stress`,
      `${E}soil-mechanics#2~overconsolidated`,
      `${E}soil-mechanics#2~time-rate`,
      `${E}soil-mechanics#4`,
      `${E}soil-mechanics#4~square`,
      `${E}transportation#2`,
      `${E}concrete-design#3`,
    ],
    status: 'drawn',
    gallery: [
      'g.he-soil-effective-stress',
      'g.he-soil-stress-layers',
      'g.he-soil-consolidation',
      'g.he-soil-overconsolidated',
      'g.he-soil-time-rate',
      'g.he-soil-footing',
      'g.he-soil-footing-square',
      'g.he-soil-punching',
      'g.he-soil-pavement',
      'g.he-soil-pavement-thick-subbase',
    ],
    notes: [
      'From HE-aero-civil-chemical-P17. Lengths in m and stresses in kPa unless a mode says otherwise; a field is a variable id or a number, and a "?" draws no number.',
      "Fields: { kind: 'soilProfile', mode: 'stress', layers: [{ soil: 'sand' | 'clay' | 'silt' | 'gravel', name?, thickness, gamma?, gammaSat? }] (the last runs on down), zw, z, gammaW? (the page's γ_w, default 9.81), sigma?, u?, sigmaEff? } | { mode: 'consolidation', H, s0?, ds?, Cc?, e0?, Cs?, sp?, S?, drainage?: 'double' | 'single', Hdr? } | { mode: 'footing', B, Df, phi, q?, c?, gamma?, shape?: 'strip' | 'square' } | { mode: 'plan', B, c, d, b0?, perB? (12 for ft and in), units?: { B, c } } | { mode: 'pavement', layers: [{ a, D (in), m? }], SN?, load? (kN, a wheel's axle load) }.",
      "soil-mechanics#2~effective-stress: { kind: 'soilProfile', mode: 'stress', layers: [{ soil: 'sand', name: 'Sand', thickness: 'zw', gamma: 'gamma' }, { soil: 'clay', name: 'Clay', thickness: 6, gammaSat: 'gsat' }], zw: 'zw', z: 'z', gammaW: 9.81, sigma: 'sigma', u: 'u', sigmaEff: 'se' }: σ = 92 kPa, u = 19.62 kPa, σ′ = 72.38 kPa at 5 m (g.he-soil-effective-stress; three layers with the table inside the sand in g.he-soil-stress-layers).",
      "soil-mechanics#2: { kind: 'soilProfile', mode: 'consolidation', H: 'H', Cc: 'Cc', e0: 'e0', s0: 's0', ds: 'ds', S: 'S' }: S = 0.153 m, the settled surface dashed to the scale of H (g.he-soil-consolidation). ~overconsolidated adds Cs: 'Cs', sp: 'sp' (0.0608 m, g.he-soil-overconsolidated). ~time-rate keeps its functionGraph and may add { mode: 'consolidation', H: 'H', Hdr: 'Hdr', drainage: 'double' } for the drainage path (g.he-soil-time-rate).",
      "soil-mechanics#4: { kind: 'soilProfile', mode: 'footing', B: 'B', Df: 'Df', phi: 'phi', q: 'qu', c: 'c', gamma: 'g' }; ~square adds shape: 'square' (q_u checked with 1.3 and 0.4). NOTE for the lesson chat: the plan's example has c′ = 0, and a value of 0 with a unit fails the module tests, so the demo uses c′ = 5 kPa (q_u = 1051 kPa); the page can keep c′ = 0 by giving c′ no unit or a minimum above 0 in its example (g.he-soil-footing, g.he-soil-footing-square).",
      "concrete-design#3: { kind: 'soilProfile', mode: 'plan', B: 'B', c: 'c', d: 'd', b0: 'b0', perB: 12 }: B in ft, c and d in in; the perimeter d ÷ 2 out from the column, b₀ = 124 in, the area outside it shaded (g.he-soil-punching).",
      "transportation#2: { kind: 'soilProfile', mode: 'pavement', layers: [{ a: 'a1', D: 'D1' }, { a: 'a2', D: 'D2', m: 'm2' }, { a: 'a3', D: 'D3', m: 'm3' }], SN: 'SN' }: SN = 1.76 + 1.12 + 0.99 = 3.87 (g.he-soil-pavement; a thin surface on a deep subbase with load: 80 in g.he-soil-pavement-thick-subbase).",
      'Harness (soilProfile): σ, u and σ′ at z from the layers; σ′ = σ − u; u = 0 above the water table; S from C_c (and C_s, σ′_p); H_dr = H ÷ 2 or H; q_u = c′N_c + γD_fN_q + ½γBN_γ (1.3, 0.4 square) with φ′ in 0–50°; b₀ = 4(c + d) inside the footing; SN = Σ a·D·m. D_f ÷ B, the clay, the perimeter and the layers are drawn to scale by construction.',
    ].join(' '),
  },
];
