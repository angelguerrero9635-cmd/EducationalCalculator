/**
 * College pictures, round 1, group F (docs/RENDERINGS_HE.md). Spread into
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

export const HE1F_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC5',
      'controlVolume',
      'A process unit or a steady-flow device in a control volume: streams, Q̇ and Ẇ, in = out',
      [
        `${E}material-energy-balances#0`,
        `${E}material-energy-balances#0~dof`,
        `${E}material-energy-balances#1`,
        `${E}material-energy-balances#1~splitter`,
        `${E}material-energy-balances#1~bypass`,
        `${E}material-energy-balances#2~combustion`,
        `${E}material-energy-balances#3`,
        `${E}separations#2`,
        `${E}separations#2~crosscurrent`,
        `${E}separations#3`,
        `${E}separations#3~gas-permeation`,
        `${E}propulsion#3~burner`,
        `${E}environmental#1~activated-sludge`,
        `${E}process-control#0~tank`,
        `${E}thermodynamics#1~steady-flow`,
        `${E}thermodynamics#1~nozzle`,
        `${E}thermodynamics#1~mixing`,
      ],
      [
        'From ACC-P9 (controlVolume) and ME-P11 (steadyFlowDevice), one kind. A new kind (typesHe1f.ts, reps/ControlVolume.tsx, the sums in reps/controlVolumeMath.ts).',
        "Fields: { kind: 'controlVolume', unit?: 'stream' | 'box' | 'mixer' | 'splitter' | 'column' | 'evaporator' | 'burner' | 'tank' | 'heater' | 'membrane' | 'stages', device?: 'turbine' | 'compressor' | 'pump' | 'nozzle' | 'diffuser' | 'valve' | 'mixingChamber', streams: [{ name, dir: 'in' | 'out' | 'inside', flow? (a value, or [1, 'f'] for a sum), symbol?, unit?, fractions?: [{ name, x }], rest? (the component making up 1 − Σx), amounts?: [{ name, n }], h?, V?, T?, P?, more?: [ids labelled on the stream], tags?: [{ text, unknown? }] }], heat? (Q̇ in), work? (Ẇ out; workIn: true for a pump's Ẇ_in), cp? (h = c_pT where a stream has T), bypass?, reaction?: { equation, nu, extent }, recovery?, recoveryPercent?, steam?: { flow, latent }, pressure?: { applied, osmotic?, permeability?, flux? }, selectivity?, volume?, residence?: { tau, factor? }, loading?: { biomass, ratio, substrate }, stages?: { count, flow: 'crosscurrent' | 'countercurrent', kd, ratio, left?, factor? }, dof?: { unknowns, balances, specs, relations, dof }, energyUnit?, balanceUnit? }.",
        'Streams by unit, in order: column feed, distillate, bottoms; evaporator feed, vapour (top), concentrate, or with bypass fresh feed, vapour, product, bypass, evaporator feed, concentrate (the last three inside); burner fuel, air, flue gas; tank and heater in, out; membrane feed, retentate, permeate (bottom); stages feed, solvent, raffinate, extract; devices inlets then outlets.',
        "Example (material-energy-balances#1): { kind: 'controlVolume', unit: 'mixer', streams: [{ name: 'Feed 1', dir: 'in', flow: 'F1', fractions: [{ name: 'ethanol', x: 'x1' }], rest: 'water' }, { name: 'Feed 2', dir: 'in', flow: 'F2', fractions: [{ name: 'ethanol', x: 'x2' }], rest: 'water' }, { name: 'Product', dir: 'out', flow: 'F3', fractions: [{ name: 'ethanol', x: 'x3' }], rest: 'water' }] }. Example (thermodynamics#1~steady-flow): { kind: 'controlVolume', device: 'turbine', streams: [{ name: 'Steam in', dir: 'in', flow: 'm', h: 'h1' }, { name: 'Steam out', dir: 'out', flow: 'm', h: 'h2' }], heat: 'Q', work: 'W' }.",
        'Draws the balance lines under the unit (total and each component; "in + made = out" with a reaction), an energy bar where the streams carry h, c_pT or V (Σṁh in + Q̇ = Σṁh out + Ẇ; per kilogram when no stream has a flow), ΔP and π bars for a membrane, the chain of stages with the solute left after each, and the unit’s own numbers (τ, F/M, DOF, J_w). Arrows thicken with the flow; a "?" draws no label and a thin dashed arrow.',
        'The harness (harness/picturesHe1f.ts) checks every component in (plus ν_iξ) = out to 0.1%, the energy balance, the arrows’ directions, the bypass’s split, evaporator and mixing point, the recovery, Q̇ = ṁ_sλ, τ = V ÷ q, F/M, the stages’ fraction left (crosscurrent or Kremser), DOF = U − B − S − R, J_w = A_w(ΔP − π) and the permeate’s y from α. Demos: the 17 pages plus the cases compressor, pump, diffuser, valve, countercurrent stages and eight washes (the edge). Constants come from the page (R on the membrane demo).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-controlVolume-stream',
      'g.he-controlVolume-dof',
      'g.he-controlVolume-mixer',
      'g.he-controlVolume-column',
      'g.he-controlVolume-bypass',
      'g.he-controlVolume-combustion',
      'g.he-controlVolume-heater',
      'g.he-controlVolume-extraction',
      'g.he-controlVolume-crosscurrent',
      'g.he-controlVolume-crosscurrent-many',
      'g.he-controlVolume-countercurrent',
      'g.he-controlVolume-membrane',
      'g.he-controlVolume-gas-permeation',
      'g.he-controlVolume-combustor',
      'g.he-controlVolume-aeration',
      'g.he-controlVolume-tank',
      'g.he-controlVolume-turbine',
      'g.he-controlVolume-compressor',
      'g.he-controlVolume-pump',
      'g.he-controlVolume-nozzle',
      'g.he-controlVolume-diffuser',
      'g.he-controlVolume-valve',
      'g.he-controlVolume-mixing',
    ],
  },
  {
    ...ask(
      'HC13',
      'velocityProfile',
      'Velocity arrows across a tube, a vessel, two plates or a falling film; concentration across a film or up a Stefan tube; three boundary layers',
      [
        `${E}transport-phenomena#0`,
        `${E}transport-phenomena#0~couette`,
        `${E}transport-phenomena#0~film`,
        `${E}transport-phenomena#2`,
        `${E}transport-phenomena#2~stagnant-film`,
        `${E}transport-phenomena#3`,
        `${E}transport-phenomena#3~mass-analogy`,
        `${E}biotransport#1`,
        `${E}biotransport#1~shear`,
        `${E}biotransport#1~reynolds`,
      ],
      [
        'From ACC-P31 (velocityProfile, less its temperature mode, which is HC23 thermalWall) and B-P28 (vesselFlow), one kind. A new kind (typesHe1f.ts, reps/VelocityProfile.tsx, the sums in reps/velocityProfileMath.ts). The brief counts 9 transport pages: #2~diffusion-time (none) and #3~dimensionless (bars) keep their own pictures, so 7 are listed.',
        "Fields: { kind: 'velocityProfile', mode: 'tube' | 'plates' | 'film' | 'concentration' | 'stefan' | 'analogy', vessel? (a blood vessel's wall and blood), R?, h?, vmax?, vavg?, Q?, tauW?, P1?, P2?, dP?, L?, mu?, V? (plate speed), delta?, angle? (β from vertical, degrees), cA1?, cA2?, D?, flux?, x1?, x2?, c?, Re?, Pr?, Sc?, Nu?, Sh?, more?: [ids labelled under the picture], si?: { field: factor to SI } }. A field is a variable id or a number; si turns a page's mm, cm, mL/min or mPa·s into SI for the drawing and the checks (biotransport: { R: 0.001, L: 0.01, mu: 0.001, Q: 1 / 6e7 }).",
        "Example (transport-phenomena#0): { kind: 'velocityProfile', mode: 'tube', R: 'R', Q: 'Q', vavg: 'vavg', vmax: 'vmax', tauW: 'tau', dP: 'dP', L: 'L', mu: 'mu', Re: 'Re' }. Example (biotransport#1): { kind: 'velocityProfile', mode: 'tube', vessel: true, R: 'r', Q: 'Q', dP: 'dP', L: 'L', mu: 'mu', si: { R: 0.001, L: 0.01, mu: 0.001, Q: 1 / 6e7 } }. Example (transport-phenomena#3): { kind: 'velocityProfile', mode: 'analogy', Re: 'Re', Pr: 'Pr', more: ['f', 'Nu'] }.",
        'Draws: tube, the parabola v = v_max(1 − r²/R²) as arrows from the centre speed (from vmax, 2v_avg or 2Q ÷ πR²) on a speed scale, so they grow with Q; v_avg dashed; τ_w ticks inside both walls; Q, ΔP (or P₁, P₂), R and L bracketed; not to scale, said. plates: the straight profile from the still plate to V, h bracketed, τ. film: the half parabola, still at the wall and v_max = 1.5v_avg at the free surface, δ bracketed, tilted by β. concentration: the straight line from c_A1 to c_A2 across L, N_A from high to low. stefan: the tube in glass with the liquid at the bottom, N_A up, and x_A against height bending from the straight line. analogy: the δ, δ_T = δPr^(−1/3) and δ_c = δSc^(−1/3) layers growing as √x on three plates (a layer whose number is "?" is left out). A "?" draws no label and no arrows.',
        'The harness (harness/picturesHe1f.ts) checks v_max = 2v_avg = 2Q ÷ πR², the centre arrow the fastest, τ_w = ΔPR ÷ 2L (or 4μQ ÷ πR³ on a page with no ΔP), ΔP = P₁ − P₂, τ = μV ÷ h, film v_max = 1.5v_avg, N_A = D(c_A1 − c_A2) ÷ L, the Stefan flux, and the drawn layer ratios. Constants come from the page (ρ, g, R are values on the demos).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-velocityProfile-tube',
      'g.he-velocityProfile-tube-fast',
      'g.he-velocityProfile-couette',
      'g.he-velocityProfile-film',
      'g.he-velocityProfile-diffusion',
      'g.he-velocityProfile-stefan',
      'g.he-velocityProfile-analogy',
      'g.he-velocityProfile-mass-analogy',
      'g.he-velocityProfile-vessel',
      'g.he-velocityProfile-vessel-shear',
      'g.he-velocityProfile-vessel-reynolds',
    ],
  },
];
