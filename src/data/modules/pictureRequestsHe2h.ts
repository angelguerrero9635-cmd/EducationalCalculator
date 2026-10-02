/**
 * College pictures, round 2, group H (docs/RENDERINGS_HE.md). Spread into
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

export const HE2H_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC24',
      'wing',
      'An airfoil section tilted by α against the wind (lift ⟂ the wind), or a wing’s planform with its tip vortices and downwash',
      [
        `${E}aerodynamics#0`,
        `${E}aerodynamics#0~pressure-coefficient`,
        `${E}aerodynamics#0~circulation`,
        `${E}aerodynamics#0~naca`,
        `${E}aerodynamics#1`,
        `${E}aerodynamics#2`,
        `${E}aerodynamics#2~lift-slope`,
        `${E}aerodynamics#2~aspect-ratio`,
      ],
      [
        'From ACC-P1. A new kind (typesHe2h.ts, reps/Wing.tsx, the sums in reps/aeroMath.ts: NACA four-digit camber and thickness, the thin-airfoil zero-lift angle, lifting-line induced drag).',
        "Fields: { kind: 'wing', mode?: 'section' | 'planform', alpha? (°), alphaL0? (°; without digits the camber drawn is the one that gives it), digits?: { d1, d2, d34 }, chord?, camber?, camberAt?, thickness?, cl?, cd?, forces?: { lift, drag }, pressure?: { cp, speed?, at? (x ÷ c, 0.3), surface?: 'upper' | 'lower' }, circulation?: { gamma, lift? }, speed? (V∞), span?, rootChord?, tipChord?, area?, aspectRatio?, taper?, CL?, e?, CDi?, alphaI? (°), more?: [ids labelled under it] }.",
        "Example (aerodynamics#0): { kind: 'wing', alpha: 'alpha', alphaL0: 'aL0', cl: 'cl' }. Example (aerodynamics#1): { kind: 'wing', speed: 'V', cl: 'CL', cd: 'CD', forces: { lift: 'L', drag: 'D' }, more: ['rho', 'S', 'q', 'LD'] }. Example (aerodynamics#2~aspect-ratio): { kind: 'wing', mode: 'planform', span: 'b', rootChord: 'cr', tipChord: 'ct', taper: 'lam', area: 'S', aspectRatio: 'AR' }.",
        'Section: the wind is horizontal from the left, the section turns by α about its quarter chord, lift is drawn vertical (⟂ the wind, never the chord), drag along the wind to scale against L, the zero-lift line dashed through the trailing edge. Planform: to scale from b and the chords (or rectangular from AR alone), S and AR on the skin, tip vortices trailing, and the view from behind with downwash arrows ∝ α_i. A "?" draws no label and no arrow.',
        'The harness (harness/picturesHe2h.ts) checks lift ⟂ the wind, the camber peak at d₂ × 10% of the chord and d₁% high, camber, place and thickness against the chord, L ÷ D = c_l ÷ c_d, C_p = 1 − (V ÷ V∞)², the loop turning with the lift, the drawn AR = b² ÷ S within 2%, S, λ, C_Di and α_i. Demos: the 8 pages plus a symmetric section at −8° and a glider of AR 30 (the edges).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-wing-section',
      'g.he-wing-symmetric',
      'g.he-wing-pressure',
      'g.he-wing-circulation',
      'g.he-wing-naca',
      'g.he-wing-forces',
      'g.he-wing-planform',
      'g.he-wing-glider',
      'g.he-wing-lift-slope',
      'g.he-wing-tapered',
    ],
  },
  {
    ...ask(
      'HC30',
      'duct',
      'A stream tube or converging–diverging nozzle to scale by A ÷ A∗, stations with M, p and T, a chamber, a shock, a turbojet',
      [
        `${E}compressible-flow#0`,
        `${E}compressible-flow#0~area-mach`,
        `${E}compressible-flow#0~choked`,
        `${E}compressible-flow#2`,
        `${E}propulsion#0~turbojet`,
        `${E}propulsion#2`,
        `${E}propulsion#2~exhaust-velocity`,
      ],
      [
        'From ACC-P2. A new kind (typesHe2h.ts, reps/Duct.tsx, the sums in reps/aeroMath.ts: isentropic ratios, the area–Mach relation and its two branches by bisection, the normal shock, the contour).',
        "Fields: { kind: 'duct', mode?: 'station' | 'nozzle' | 'engine', gamma? (default 1.4; the exhaust page passes its γ variable), M?, T?, p?, T0?, p0?, areaRatio? (A ÷ A∗ at the station, or A_e ÷ A_t), branch?: 'sub' | 'super', choked?, throatArea?, mdot?, Me?, pe?, Te?, pressureRatio? (p_e ÷ p₀, sets the exit when no area ratio), shockAt? (A ÷ A_t), shockM1?, shockM2?, chamber?, axis? (p ÷ p₀ and M along the axis), exhaust? (v_e), thrust? (F), V0?, Ve?, fuel? (ṁ_f), more? }.",
        "Example (compressible-flow#0): { kind: 'duct', gamma: 1.4, M: 'M', T: 'T', p: 'p', T0: 'T0', p0: 'p0', more: ['r0'] }. Example (compressible-flow#2): { kind: 'duct', mode: 'nozzle', gamma: 1.4, axis: true, p0: 'p0', T0: 'T0', throatArea: 'At', mdot: 'm', areaRatio: 'AeAt', Me: 'Me', pe: 'pe', Te: 'Te' }. Example (propulsion#0~turbojet): { kind: 'duct', mode: 'engine', mdot: 'm', V0: 'V0', Ve: 'Ve', thrust: 'F', fuel: 'mf', more: ['TSFC', 'eta'] }. Example (propulsion#2): { kind: 'duct', mode: 'nozzle', chamber: true, p0: 'pc', throatArea: 'At', mdot: 'm', thrust: 'F', more: ['CF', 'cs', 'Isp'] }.",
        'Widths go as √(A ÷ A∗) (a round duct). A supersonic station ends a converging–diverging duct; a subsonic one sits in a converging duct at its own A ÷ A∗, the throat it would need dashed beyond; M = 1 (choked) ends at a lit throat. propulsion#2 main has no area ratio, so its nozzle is drawn nominal and the caption says so. A "?" draws no label; an exit narrower than the throat or γ ≤ 1 draws faded with the reason. Write A∗ and c∗ with ∗ (U+2217): the copy editor refuses a plain *.',
        'The harness (harness/picturesHe2h.ts) checks the throat is the narrowest section at A ÷ A∗ = 1, M < 1 before it and M = 1 at it, exit ÷ throat width = √(A_e ÷ A_t), the station drawn at the area–Mach A ÷ A∗, T₀ ÷ T and p₀ ÷ p, M_e and p_e ÷ p₀ from A_e ÷ A_t, the shock inside the diverging part with M₁, M₂ and a subsonic exit, and F = ṁ(V_e − V₀). Demos: the 7 pages plus a subsonic station, a normal shock in the nozzle, and A_e ÷ A_t = 25 (the edge).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-duct-station',
      'g.he-duct-subsonic',
      'g.he-duct-area-mach',
      'g.he-duct-choked',
      'g.he-duct-nozzle',
      'g.he-duct-hypersonic',
      'g.he-duct-shock',
      'g.he-duct-turbojet',
      'g.he-duct-chamber',
      'g.he-duct-exhaust',
    ],
  },
  {
    ...ask(
      'HC31',
      'supersonicFlow',
      'Supersonic flow: a normal shock with ratio bars or a pitot probe, an oblique shock off a wedge, an expansion fan, a flat plate’s waves, a moving point’s Mach cone',
      [
        `${E}aerodynamics#3`,
        `${E}compressible-flow#1`,
        `${E}compressible-flow#1~oblique`,
        `${E}compressible-flow#1~pitot`,
        `${E}compressible-flow#3`,
        `${E}compressible-flow#3~mach-angle`,
        `${E}compressible-flow#3~expansion-fan`,
      ],
      [
        'From ACC-P3. A new kind (typesHe2h.ts, reps/SupersonicFlow.tsx, the sums in reps/aeroMath.ts: normal and oblique shocks, θ–β–M with its weak branch by bisection, Prandtl–Meyer and its inverse, the Rayleigh pitot formula, the centred fan and the plate’s shock-expansion waves). No chart is used: every angle is computed.',
        "Fields: { kind: 'supersonicFlow', mode: 'normal' | 'wedge' | 'corner' | 'flatPlate' | 'mach', gamma? (default 1.4), M1? (M∞ on the plate, M of the point in mach), M2?, beta?, theta?, alpha?, mu? (all °), Mn1?, nu1?, nu2?, ratios?: { p?, rho?, T?, p0? }, probe?: { p02 }, cl?, cd?, more? }.",
        "Example (compressible-flow#1): { kind: 'supersonicFlow', mode: 'normal', gamma: 1.4, M1: 'M1', M2: 'M2', ratios: { p: 'p21', rho: 'r21', T: 'T21', p0: 'p0r' } }. Example (~oblique): { kind: 'supersonicFlow', mode: 'wedge', gamma: 1.4, M1: 'M1', M2: 'M2', beta: 'beta', theta: 'theta', more: ['Mn1', 'p21'] }. Example (~expansion-fan): { kind: 'supersonicFlow', mode: 'corner', gamma: 1.4, M1: 'M1', M2: 'M2', theta: 'theta', more: ['nu1', 'nu2'] }. Example (aerodynamics#3): { kind: 'supersonicFlow', mode: 'mach', M1: 'M', more: ['T', 'a', 'V'] }.",
        'normal: arrows behind the shock shortened by ρ₁ ÷ ρ₂, ratio bars on one scale with 1 dashed; with probe, the bow shock and the tube reading p₀₂. wedge: the shock from the corner at β, μ₁ dashed, streamlines turning by θ. corner: the fan between its first and last Mach lines, streamlines bending at each. flatPlate: exact shocks and fans at both edges (the numbers stay Ackeret’s), lift ⟂ the stream, drag to scale. mach: five fronts from the point; the cone at μ only when M > 1. A "?" draws no label; a β below μ₁ or under θ, M₁ ≤ 1 for a shock, or a turn past ν_max draws faded with the reason.',
        'The harness (harness/picturesHe2h.ts) checks M₂ < 1 and the ratios behind a normal shock, β ≥ μ₁ and β > θ with θ from θ–β–M and M₂, the fan turning the flow by exactly θ (ν rises by θ) and starting at μ₁, M₂ from ν₂, the plate’s faster upper flow and c_l, c_d from Ackeret, and no cone at M ≤ 1 with μ = sin⁻¹(1 ÷ M). Demos: the 7 pages plus M₁ = 10 (the edge above) and M = 0.78 with no cone (the edge below, aerodynamics#3 main).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-supersonicFlow-normal',
      'g.he-supersonicFlow-strong',
      'g.he-supersonicFlow-pitot',
      'g.he-supersonicFlow-wedge',
      'g.he-supersonicFlow-corner',
      'g.he-supersonicFlow-flat-plate',
      'g.he-supersonicFlow-mach',
      'g.he-supersonicFlow-subsonic',
    ],
  },
];
