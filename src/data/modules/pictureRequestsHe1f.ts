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
];
