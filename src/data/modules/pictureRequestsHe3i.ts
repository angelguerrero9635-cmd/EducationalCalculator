/**
 * College pictures, round 3, group I (docs/RENDERINGS_HE.md). Spread into
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

const B = 'he.biology.';
const E = 'he.engineering.';

export const HE3I_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC81',
      'simpleMachine',
      'A limb as a lever: the forearm held level at the elbow, or the pelvis on one leg; bones to scale, the muscle’s pull, the loads and the joint force, and the two moments about the joint as equal bars',
      [`${B}anatomy-physiology#1`, `${E}biomechanics#1`, `${E}biomechanics#1~hip`],
      [
        'From B-P21. An option on the existing simpleMachine lever (typesHe3i.ts LimbOption, reps/SimpleMachineLimb.tsx, the sums in reps/limbMath.ts); off unless a page sets limb.',
        "Fields: the lever's own load (L in the hand, or body weight W), loadArm (d_L or d_W), effortArm (d_M or d_ab), effort (F_M or F_ab), advantage? (MA = d_M ÷ d_L), plus limb: { body: 'forearm' | 'hip', loads?: [{ force, arm, name? }] (further vertical loads: the forearm's weight W_f at d_f), share? (hip: the share of W at d_W, default 5/6), joint? (F_J), ratio? (F_J ÷ W) }. Forces in N, arms in cm or m (mixed units convert).",
        "Example (biomechanics#1): { kind: 'simpleMachine', machine: 'lever', load: 'L', loadArm: 'dL', effortArm: 'dM', effort: 'FM', limb: { body: 'forearm', loads: [{ force: 'Wf', arm: 'df', name: 'W_f' }], joint: 'FJ' } }. Example (~hip): { kind: 'simpleMachine', machine: 'lever', load: 'W', loadArm: 'dW', effortArm: 'dab', effort: 'Fab', limb: { body: 'hip', joint: 'FJ', ratio: 'ratio' } }. Example (anatomy-physiology#1): { kind: 'simpleMachine', machine: 'lever', load: 'L', loadArm: 'dL', effortArm: 'dM', effort: 'FM', advantage: 'MA', limb: { body: 'forearm' } }.",
        'Forearm: the humerus (cut short), ulna and radius painted as bone to scale from the arms, the biceps and its tendon inserting at d_M, the ball in the hand at d_L, the forearm’s centre of mass at d_f; F_M up, the loads down, F_J at the elbow (down on the forearm when positive), all on one scale (the shortest lengthened to 16 px, said in the caption); the arms dimensioned from the elbow. Hip (frontal): the pelvis, sacrum and lumbar vertebrae, the stance femur (the other faded), the abductors from the iliac wing to the greater trochanter; (5/6)W down at the midline, F_ab down at d_ab, F_J up into the socket; d_W and d_ab dimensioned. Both: two bars, the muscle’s moment and the loads’ (stacked), equal when balanced; a "?" value draws no arrow, label or bar for it; F_J is drawn only when the page names it.',
        'The harness (harness/picturesHe3i.ts limbIssues) checks Σ moments about the joint = 0 with the values (F_M d_M = Σ F d, the hip share applied), F_J = F_M − Σ F (forearm) or F_M + Σ F (hip), F_J ÷ W and MA = d_M ÷ d_L. The pages are not built yet: they pass the limb field.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-simpleMachine-limb-forearm',
      'g.he-simpleMachine-limb-forearm-level',
      'g.he-simpleMachine-limb-hip',
      'g.he-simpleMachine-limb-hip-short-arm',
    ],
  },
  {
    ...ask(
      'HC82',
      'binaryPhase',
      'A binary phase diagram (isomorphous lens, eutectic, or the iron–carbon steel corner) with the alloy line, a tie line, the lever arms on the tie line enlarged, and two bars of the phase fractions',
      [
        `${E}materials-science#2`,
        `${E}materials-science#2~eutectic`,
        `${E}materials-science#2~steel`,
      ],
      [
        'From ME-P8. New kind (typesHe3i.ts BinaryPhaseSpec, reps/BinaryPhase.tsx, the boundaries and the lever in reps/binaryPhaseMath.ts).',
        "Fields: { kind: 'binaryPhase', system: 'isomorphous' | 'eutectic' | 'steel', names?: [A, B] ('Cu', 'Ni'; steel is Fe and C), c0 (C₀, wt% B), cl? (isomorphous: the liquid C_L), calpha? (the solid C_α; steel default 0.022), ce? (eutectic C_E; steel's eutectoid, default 0.76), cbeta? (eutectic's β end), temperature? (the tie line's T, a label; steel 727 °C), melts?: [T_A, T_B] (isomorphous: labelled, and with temperature they place the tie line in the lens), wl? (W_L), we? (W_e, or pearlite W_P on steel), walpha? (W_α, or W_α′) }. Fractions are shares from 0 to 1.",
        "Example (materials-science#2): { kind: 'binaryPhase', system: 'isomorphous', names: ['Cu', 'Ni'], c0: 'C0', cl: 'CL', calpha: 'Ca', temperature: 1250, melts: [1085, 1455], wl: 'WL', walpha: 'Wa' }. Example (~eutectic): { kind: 'binaryPhase', system: 'eutectic', names: ['Pb', 'Sn'], c0: 'C0', calpha: 'Ca', ce: 'CE', cbeta: 97.8, we: 'We', walpha: 'Wa' }. Example (~steel): { kind: 'binaryPhase', system: 'steel', c0: 'C0', calpha: 0.022, ce: 0.76, we: 'WP', walpha: 'Wa' }.",
        'Every boundary is computed in code, not traced: the lens is liquidus 100tᵖ over solidus 100t^q, shaped to pass through C_L and C_α at the tie line; the eutectic curves are Béziers through C_α, C_E and C_β; the steel corner draws A3 from 912 °C to the eutectoid, Acm toward 2.14 wt% at 1147 °C, and α to 0.022 wt%. Fields tinted and named (L, α, β, L + α, γ, α + γ, γ + Fe₃C, α + Fe₃C); C₀ dashed; the tie line with its ends; under the plot the tie line enlarged as a lever with the fulcrum at C₀, both arms labelled (C₀ − C_L, C_α − C₀), its ends named by phase; two fraction bars. A one-phase alloy, a lens the ends can’t make, a eutectic out of order or a hypereutectoid steel draws faded with the reason in the caption.',
        'The harness (harness/picturesHe3i.ts) checks the fractions add to 1 and match the lever arms, the compositions lie on the axis and C_α lies below C_E. The pages are not built yet.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-binaryPhase-isomorphous',
      'g.he-binaryPhase-isomorphous-near-liquidus',
      'g.he-binaryPhase-eutectic',
      'g.he-binaryPhase-steel',
      'g.he-binaryPhase-steel-near-eutectoid',
    ],
  },
  {
    ...ask(
      'HC83',
      'machining',
      'A cut in steel with a carbide tool: turning (bar, chuck, tool, end view with v = πDN, the cut enlarged), milling (cutter of n_t teeth over a block, table feed, one tooth’s bite enlarged), and the ideal finish (tool-nose cusps, mean line, R_a)',
      [`${E}manufacturing#1`, `${E}manufacturing#1~milling`, `${E}manufacturing#1~finish`],
      [
        'From ME-P19. New kind (typesHe3i.ts MachiningSpec, reps/Machining.tsx, the sums in reps/machiningMath.ts; shop units in reps/he3iUnits.ts).',
        "Fields: { kind: 'machining', mode: 'turning' | 'milling' | 'finish', diameter? (D), speed? (v), rpm? (N), feed? (f per turn), depth? (d), length? (L) and time? (T_m) for turning, rate? (MRR), teeth? (n_t), toothFeed? (f_t), tableFeed? (f_r) and width? (w) for milling, radius? (nose r), roughness? (R_a) and cusp? (h) for finish, more? }. Units are read from each variable: mm, cm, m, in, μm; m/min, m/s, ft/min; rpm; mm/rev, mm/tooth, mm/min; cm³/min; min.",
        "Example (manufacturing#1): { kind: 'machining', mode: 'turning', diameter: 'D', speed: 'v', rpm: 'N', feed: 'f', depth: 'd', length: 'L', time: 'Tm', rate: 'MRR' }. Example (~milling): { kind: 'machining', mode: 'milling', diameter: 'D', teeth: 'nt', speed: 'v', rpm: 'N', toothFeed: 'ft', tableFeed: 'fr', width: 'w', depth: 'd', rate: 'MRR' }. Example (~finish): { kind: 'machining', mode: 'finish', feed: 'f', radius: 'r', roughness: 'Ra' }.",
        'Turning: the chuck and bar painted in steel to scale (D against L), turned down behind the tool with feed marks, the carbide insert and a hot chip, f along the bar, N round its end, D and L dimensioned; an end view with v tangent at the tool; the cut enlarged with d and the feed marks. Milling: the cutter with its n_t carbide teeth, N, v at the rim, D; the block in oblique cut down by d, w on its edge, f_r under it; one tooth’s comma-shaped bite between two tooth paths f_t apart, enlarged. Finish: the exact tool-nose arcs f apart over four and a half feeds, the tool in a groove, the mean line dashed and the departures shaded (their mean is R_a), f and the cusp h ≈ 4 × R_a marked; heights enlarged, the factor in the picture. A "?" draws no arrow or label for it.',
        'The harness (harness/picturesHe3i.ts) checks v = πDN, MRR = vfd and T_m = L ÷ (fN) (turning), f_r = Nn_tf_t and MRR = wdf_r with whole teeth (milling), R_a = f² ÷ 32r and h = f² ÷ 8r, and that the drawn profile’s own R_a agrees (finish), all in SI from each variable’s unit. A finish page keeps f below r (the rule’s range). The pages are not built yet.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-machining-turning',
      'g.he-machining-turning-small-bar',
      'g.he-machining-milling',
      'g.he-machining-finish',
      'g.he-machining-finish-fine',
    ],
  },
  {
    ...ask(
      'HC84',
      'linkage',
      'Rigid bodies in plane motion with their instantaneous centre: a sliding ladder, a ball or wheel rolling down a slope, and a single closed loop of links with its joints counted for Gruebler',
      [`${E}dynamics#3~rolling`, `${E}dynamics#3~ic`, `${E}cad-graphics#3`],
      [
        'From ME-P29. New kind (typesHe3i.ts LinkageSpec, reps/Linkage.tsx, the sums in reps/linkageMath.ts).',
        "Fields: { kind: 'linkage', mode: 'ladder' | 'rolling' | 'mechanism', length? (L), angle? (θ in degrees: the ladder's with the floor, or the slope's), footSpeed? (v_A), topSpeed? (v_B), omega? (ω), radius? (r), speed? (the centre's v), acceleration? (a), shape? (c = I ÷ mr²), gravity? (g as the page writes it, for the a check), links? (n, with the ground), full? (j₁), half? (j₂), mobility? (M), slider? (a slider-crank), more? }.",
        "Example (dynamics#3~ic): { kind: 'linkage', mode: 'ladder', length: 'L', angle: 'th', footSpeed: 'vA', topSpeed: 'vB', omega: 'w' }. Example (dynamics#3~rolling): { kind: 'linkage', mode: 'rolling', angle: 'th', shape: 'c', acceleration: 'a', gravity: 9.81 }. Example (cad-graphics#3): { kind: 'linkage', mode: 'mechanism', links: 'n', full: 'j1', half: 'j2', mobility: 'M' } (slider: true for a slider-crank).",
        'Ladder: a brick wall, a hatched floor, the ladder in wood to scale from L and θ; the IC where the normals to the two paths meet (above the foot, level with the top), dashed rays r_A = L sin θ and r_B = L cos θ (and to the middle), each velocity ⟂ its ray and ∝ its distance, ω round the IC. Rolling: a ball (painted), disk or hoop by c on a slope at θ, the contact as the IC (v = 0), rays to the centre, the top and three rim points with their velocities ⟂ and ∝ distance (v, 2v at the top; the page’s v when it gives one), a along the slope. Mechanism: the ground hatched as link 1, the moving links numbered from 2, pins ringed, a pin in a slot for each half joint, a slider block and its rail for a slider-crank; a count that needs more than one loop draws the links and says so. A "?" draws no arrow or label for it.',
        'The harness (harness/picturesHe3i.ts) checks ω = v_A ÷ (L sin θ) and v_B = ωL cos θ (velocities ⟂ their IC rays and ∝ distance), ω = v ÷ r and a = g sin θ ÷ (1 + c) on a slope, M = 3(n − 1) − 2j₁ − j₂ with whole counts. A slider-crank draws its slider only at n = 4 (any other n draws the plain loop). The pages are not built yet.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-linkage-ladder',
      'g.he-linkage-ladder-steep',
      'g.he-linkage-rolling',
      'g.he-linkage-rolling-hoop',
      'g.he-linkage-fourbar',
      'g.he-linkage-fivebar',
      'g.he-linkage-slider-crank',
    ],
  },
  {
    ...ask(
      'HC85',
      'icon',
      'Card icons for three sorts: crystal defects (point, line, interfacial, volume), manufacturing process families, and the seven additive families',
      [
        `${E}materials-science#1~defects`,
        `${E}manufacturing#0~families`,
        `${E}manufacturing#2~families`,
      ],
      [
        'From ME-P31. Card icons in layouts/icons/he3i.ts (names) and components/module/layouts/icons/he3i.tsx (drawings), registered in both icon indexes; a line in docs/LAYOUTS.md.',
        "A card passes figure: { kind: 'icon', icon: <name> }. Defects (flat atom diagrams, the defect lit): 'vacancy', 'interstitial atom', 'substitutional impurity', 'edge dislocation', 'screw dislocation', 'grain boundary', 'twin boundary', 'pore in metal', 'inclusion in metal'. Processes (small machines in steel, sand and hot metal): 'sand casting', 'die casting', 'investment casting', 'forging', 'rolling mill', 'extrusion', 'deep drawing', 'press-brake bending', 'lathe turning', 'milling cutter', 'arc welding', 'brazing'. Additive: 'SLA printing', 'DLP printing', 'FDM printing', 'SLS printing', 'laser metal powder fusion', 'electron beam melting', 'PolyJet-style jetting', 'binder jet', 'wire-and-arc DED', 'laminated sheets'.",
        "Example (manufacturing#0~families): cards: [{ label: 'Sand casting', bin: 'casting', figure: { kind: 'icon', icon: 'sand casting' } }, …]. The three gallery sorts are the plans' sorts with every card (bins Point, Line, Interfacial, Volume; Casting, Bulk forming, Sheet forming, Material removal, Joining; the seven ISO/ASTM 52900 families).",
        'Checked by the layout tests (every card names an icon that exists, bins and cards agree). The pages are not built yet.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-cardIcons-defects',
      'g.he-cardIcons-process-families',
      'g.he-cardIcons-additive-families',
    ],
  },
];
