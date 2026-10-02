/**
 * College pictures, round 3, group J (docs/RENDERINGS_HE.md). Spread into
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

export const HE3J_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC90',
      'blockDiagram',
      'A process-control loop as flat blocks: setpoint R, the comparator with + in and − from the sensor, the controller K_c, the process K_p ÷ (τs + 1) (or ÷ (τs + 1)ⁿ for equal lags), the output Y and the sensor back to the minus; a measured disturbance through K_d to the output and through K_ff to the process input, alone or inside the loop. Every block shows its value',
      [`${E}process-control#1`, `${E}process-control#3`, `${E}process-control#3~feedforward`],
      [
        'From ACC-P34. A new kind (typesHe3j.ts BlockDiagramSpec, reps/BlockDiagram.tsx, the sums in reps/he3jMath.ts). The plan’s `cascade` wiring is not drawn: no listed page asks for it (process-control#3~architecture is a sort page); it can follow when a page does.',
        "Fields: { kind: 'blockDiagram', mode: 'feedback' | 'lags' | 'feedforward', Kc?, Kp?, tau?, setpoint?, lags? (3, a number or a variable), loopGain?, final?, offset?, tauCl?, Kcu?, wu?, Pu?, Kd?, Kff?, valve? (a valve block, when given), sensor? (1), timeUnit? ('min') }. A field is a variable id or a number; a \"?\" block shows its symbol, never a number.",
        "Example (process-control#1): { kind: 'blockDiagram', mode: 'feedback', Kc: 'Kc', Kp: 'Kp', tau: 'tau', setpoint: 'r', loopGain: 'K', final: 'y', offset: 'e', tauCl: 'tcl', sensor: 1 }. #3: { mode: 'lags', lags: 'n' (or 3), tau: 'tau', Kp: 'Kp', Kc: 'Kcu', Kcu: 'Kcu', wu: 'wu', Pu: 'Pu' }. ~feedforward: { mode: 'feedforward', Kd: 'Kd', Kp: 'Kp', Kff: 'Kff' } (add Kc: 'Kc' to draw it inside the loop).",
        'The comparator always takes the sensor with a minus (red), the setpoint with a plus. The harness (harness/picturesHe3j.ts) checks the controller and process blocks have values, K = K_cK_p, the final value R × K ÷ (1 + K), the offset and τ_cl = τ ÷ (1 + K); for n equal lags K_c,uK_p = sec(π ÷ n)ⁿ (8 for three), ω_u = tan(π ÷ n) ÷ τ and P_u = 2π ÷ ω_u; K_ff = −K_d ÷ K_p and K_d + K_ffK_p = 0. The three-lag demo takes n as a value so its two results share one page.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-blockDiagram-feedback',
      'g.he-blockDiagram-feedback-high',
      'g.he-blockDiagram-lags',
      'g.he-blockDiagram-feedforward',
      'g.he-blockDiagram-feedforward-loop',
    ],
  },
  {
    ...ask(
      'HC89',
      'hydrograph',
      'Rainfall and runoff: the storm’s depth P hanging from the top as a column cut into I_a, infiltration F and runoff Q, beside the curve-number curve Q(P) with the storm on it; rain on a painted watershed with the share C running off to the outlet (and, with t_c, the rain bar on a time chart and the runoff peaking at t_c); inflow and outflow triangles over t_b with the storage between them shaded',
      [
        `${E}hydraulics-hydrology#2`,
        `${E}hydraulics-hydrology#2~rational`,
        `${E}hydraulics-hydrology#3~detention`,
      ],
      [
        'From ACC-P21. A new kind (typesHe3j.ts HydrographSpec, reps/Hydrograph.tsx, the sums in reps/he3jMath.ts). EG’s `catchment` (HC129) is the same rational method from above and stays its own request.',
        "Fields: { kind: 'hydrograph', mode: 'split' | 'rational' | 'detention', P?, Ia?, F?, Q?, S?, CN?, depthUnit? ('in'), C?, i? (mm/h), A? (ha), Qp? (m³/s), tc? (min), Qin?, Qout? (m³/s), tb?, V? (m³), tbSeconds? (3600: t_b in hours), peakAt? (0.375 of t_b, the SCS triangle), keep? }. A field is a variable id or a number. Drags: the bottom of the rain column (P) and the outflow peak (Q_o) when the page types them.",
        "Example (main): { kind: 'hydrograph', mode: 'split', CN: 'CN', S: 'S', Ia: 'Ia', P: 'P', Q: 'Q', F: 'F', depthUnit: 'in', keep: ['CN'] } (the page adds F = P − I_a − Q, or the picture works it out). ~rational: { mode: 'rational', C: 'C', i: 'i', A: 'A', Qp: 'Q' } (add tc: 'tc' for the time chart). ~detention: { mode: 'detention', Qin: 'Qi', Qout: 'Qo', tb: 'tb', V: 'V', tbSeconds: 3600 }.",
        'The harness (harness/picturesHe3j.ts) checks S = 1000 ÷ CN − 10, I_a = 0.2S, Q = (P − I_a)² ÷ (P + 0.8S) (0 when P ≤ I_a), F and I_a + F + Q = P with F ≥ 0; 0 ≤ C ≤ 1 and Q = CiA ÷ 360; Q_o < Q_i and V = ½t_b(Q_i − Q_o) (the shaded triangle between the two hydrographs, which meet on the inflow’s falling limb). The watershed outline is drawn for show and says so.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-hydrograph-split',
      'g.he-hydrograph-split-light',
      'g.he-hydrograph-rational',
      'g.he-hydrograph-rational-tc',
      'g.he-hydrograph-detention',
      'g.he-hydrograph-detention-small',
    ],
  },
  {
    ...ask(
      'HC61',
      'connection',
      'Steel connections, painted: a plate with a row of bolt holes and the net section lit through them (the edge view gives t); a lap splice with n bolts in rows of two, in plan and in edge view with its one shear plane; a plate lapped on a gusset with two fillet welds and the throat in an enlarged section; a plate end with a line of holes and the block that tears out along the shear and tension planes',
      [
        `${E}steel-design#1~tension`,
        `${E}steel-design#3`,
        `${E}steel-design#3~weld`,
        `${E}steel-design#3~block-shear`,
      ],
      [
        'From ACC-P24. A new kind (typesHe3j.ts ConnectionSpec, reps/Connection.tsx). US units (in, ksi, kips); the demos offer US units only.',
        "Fields: { kind: 'connection', mode: 'tension' | 'bolts' | 'weld' | 'blockShear', plateWidth?, t?, holes?, holeSize?, Ag?, An?, Ae?, U?, Fy?, Fu?, strength?, d?, n?, Ab?, Fnv?, perBolt?, weldLeg?, weldLength?, welds? (2), Fexx?, throat?, perInch?, Agv?, Anv?, Ant?, Ubs? }. A field is a variable id or a number.",
        "Example (~tension): { kind: 'connection', mode: 'tension', plateWidth: 'w', t: 't', holes: 'nh', holeSize: 'dh', Ag: 'Ag', An: 'An', U: 'U', Ae: 'Ae', Fy: 'Fy', Fu: 'Fu', strength: 'Pn' }. Main (#3): { mode: 'bolts', d: 'd', n: 'n', Ab: 'Ab', Fnv: 'Fnv', perBolt: 'rn', strength: 'Rn' }. ~weld: { mode: 'weld', weldLeg: 'w', weldLength: 'L', welds: 2, Fexx: 'Fexx', throat: 'th', perInch: 'qw', strength: 'R' }. ~block-shear: { mode: 'blockShear', Agv: 'Agv', Anv: 'Anv', Ant: 'Ant', Fy: 'Fy', Fu: 'Fu', Ubs: 'Ubs', strength: 'Rn', holes: 3 }.",
        'The harness (harness/picturesHe3j.ts) checks the holes drawn are a whole count and leave plate (net width = w − holes × size > 0), A_g = wt, A_n = (w − holes × size)t, A_e = UA_n, φP_n = min(0.90F_yA_g, 0.75F_uA_e); A_b = πd² ÷ 4, φr_n = 0.75F_nvA_b, φR_n = nφr_n; throat 0.707w, 0.75 × 0.6F_EXX × throat per inch and the welds’ total; A_nv ≤ A_gv and φR_n = 0.75 × min(0.6F_uA_nv + U_bsF_uA_nt, 0.6F_yA_gv + U_bsF_uA_nt). The block-shear page gives areas, not a layout: the picture draws one thickness throughout, the shear plane’s length, the holes on it and the tension leg in the areas’ ratio, and says so. Bolt spacing is drawn at 3d with 1.5d edges.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-connection-tension',
      'g.he-connection-tension-wide',
      'g.he-connection-bolts',
      'g.he-connection-bolts-seven',
      'g.he-connection-weld',
      'g.he-connection-blockShear',
      'g.he-connection-blockShear-rupture',
    ],
  },
  {
    ...ask(
      'HC60',
      'roadCurve',
      'Road geometry: the road from above with a car, the reaction strip and the braking strip to a box on the road, to one scale; a circular curve between tangents (PC, PI, PT, R, Δ, T, L, E) to scale, with the banked road in section for e and f; a crest vertical curve and the sight line of length S at its worst place, clearing or just touching the crest',
      [
        `${E}transportation#1`,
        `${E}transportation#1~horizontal-curve`,
        `${E}transportation#1~curve-elements`,
        `${E}transportation#1~crest-curve`,
      ],
      [
        'From ACC-P22. A new kind (typesHe3j.ts RoadCurveSpec, reps/RoadCurve.tsx, the sums in reps/he3jMath.ts).',
        "Fields: { kind: 'roadCurve', mode: 'stopping' | 'plan' | 'profile', speed? (km/h), reaction?, decel?, grade? (decimal, + uphill), g? (9.81, from the page), reactionDistance?, brakingDistance?, ssd?, radius?, delta? (°), length?, tangent?, external?, e?, f?, g1?, g2? (%), A?, curveLength?, sight?, eye? (1.08 m), object? (0.60 m), keep? }. A field is a variable id or a number. Drags: the stopping point (sets V) and the PT along the curve (sets Δ) when the page types them.",
        "Example (main): { kind: 'roadCurve', mode: 'stopping', speed: 'V', reaction: 't', decel: 'a', grade: 'G', g: 9.81, reactionDistance: 'dr', brakingDistance: 'db', ssd: 'SSD', keep: ['t', 'a', 'G'] }. ~horizontal-curve: { mode: 'plan', speed: 'V', e: 'e', f: 'f', radius: 'R' } (the arc drawn over 50° to show R). ~curve-elements: { mode: 'plan', radius: 'R', delta: 'D', length: 'L', tangent: 'T', external: 'E' }. ~crest-curve: { mode: 'profile', g1: 'g1', g2: 'g2', A: 'A', sight: 'S', curveLength: 'L', eye: 1.08, object: 0.6 }.",
        'The harness (harness/picturesHe3j.ts) checks 0.278Vt, V² ÷ (254(a ÷ g + G)) and their sum; T = R tan(Δ ÷ 2), L = RΔπ ÷ 180, E; R_min = V² ÷ (127(e + f)); A = |G₁ − G₂|, and the sight line at its worst place along the drawn curve (found numerically) touches the road exactly when L meets the formula (AS² ÷ 658 or 2S − 658 ÷ A, the constant 200(√h₁ + √h₂)² from the eye and object heights), clears it when L is longer and is blocked when shorter. Profile heights are exaggerated by a round factor, printed on the picture. Demos are metric only (the 0.278, 254 and 127 constants are for km/h and m).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-roadCurve-stopping',
      'g.he-roadCurve-stopping-downhill',
      'g.he-roadCurve-radius',
      'g.he-roadCurve-elements',
      'g.he-roadCurve-elements-sharp',
      'g.he-roadCurve-crest',
      'g.he-roadCurve-crest-short',
    ],
  },
  {
    ...ask(
      'HC88',
      'streamChannel',
      'Open-channel flow in a lined rectangular channel: the section to scale with the wetted perimeter lit beside a side view with S, n, V and Fr (sub- or supercritical); the E–y curve with its least E at y_c, the depth and its alternate depth; a hydraulic jump with y₁, the roller, y₂ and the energy line falling by h_L',
      [
        `${E}hydraulics-hydrology#0`,
        `${E}hydraulics-hydrology#0~critical-depth`,
        `${E}hydraulics-hydrology#0~jump`,
      ],
      [
        'From ACC-P19. An option on the Grade 12 `streamChannel`: a spec with `mode` draws the college picture (typesHe3j.ts StreamChannelHeSpec, reps/StreamChannelHe.tsx, the sums in reps/he3jMath.ts); a spec without `mode` keeps the slab picture unchanged.',
        "Fields: { kind: 'streamChannel', mode: 'manning' | 'specificEnergy' | 'jump', width?, depth?, n?, slope?, area?, radius?, discharge?, speed?, froude?, manningK? (1 SI, 1.49 US), g? (9.81, from the page), q?, yc?, Emin?, energy?, y1?, V1?, Fr1?, y2?, hL?, keep? }. A field is a variable id or a number. Drags: the depth (manning: the water surface; specificEnergy: the point on the curve) when the page types it.",
        "Example (main): { kind: 'streamChannel', mode: 'manning', width: 'b', depth: 'y', n: 'n', slope: 'S', area: 'A', radius: 'R', discharge: 'Q', speed: 'V', froude: 'Fr', g: 9.81, keep: ['b', 'n', 'S'] }. ~critical-depth: { mode: 'specificEnergy', discharge: 'Q', width: 'b', q: 'q', yc: 'yc', Emin: 'Emin', depth: 'y', energy: 'E', g: 9.81 }. ~jump: { mode: 'jump', y1: 'y1', V1: 'V1', Fr1: 'Fr1', y2: 'y2', hL: 'hL', g: 9.81 }.",
        'The harness (harness/picturesHe3j.ts) checks A = by, R = A ÷ (b + 2y), Manning’s Q, V = Q ÷ A and Fr = V ÷ √(gy); q = Q ÷ b, y_c = (q² ÷ g)^(1/3), E_min = 1.5y_c, E least at y_c, E at y and its alternate depth equal; Fr₁, y₂ = (y₁ ÷ 2)(√(1 + 8Fr₁²) − 1) > y₁ when Fr₁ > 1, and h_L. A jump with Fr₁ ≤ 1 draws faded with the reason. The side view steepens the slope and the jump’s length is shortened; the captions say so.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-streamChannel-manning',
      'g.he-streamChannel-manning-steep',
      'g.he-streamChannel-specificEnergy',
      'g.he-streamChannel-specificEnergy-shallow',
      'g.he-streamChannel-jump',
      'g.he-streamChannel-jump-weak',
    ],
  },
];
