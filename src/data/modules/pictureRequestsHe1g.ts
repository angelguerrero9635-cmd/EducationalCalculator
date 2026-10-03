/**
 * College pictures, round 1, group G (docs/RENDERINGS_HE.md). Spread into
 * HE_PICTURE_REQUESTS in pictureRequestsHe.ts.
 */
import type { PictureRequest } from './pictureRequests';

/** A request with its pages (full ids), status `requested` until drawn. */
const ask = (
  id: string,
  kind: string,
  what: string,
  pages: string[],
  notes?: string,
): PictureRequest => ({
  id,
  what,
  kind,
  pages,
  status: 'requested',
  gallery: [],
  ...(notes ? { notes } : {}),
});

const FM = 'he.engineering.fluid-mechanics';
const HH = 'he.engineering.hydraulics-hydrology';

export const HE1G_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC6',
      'fluidSystem',
      'Fluid systems: a tank, manometer, gate, float, venturi, pitot tube, jet on a vane, pipe grade lines, pipe networks, a full sewer, a boundary layer and a model',
      [
        `${FM}#0`,
        `${FM}#0~manometer`,
        `${FM}#0~gate`,
        `${FM}#0~buoyancy`,
        `${FM}#1`,
        `${FM}#1~pitot`,
        `${FM}#2`,
        `${FM}#2~pump`,
        `${FM}#3`,
        `${FM}#4`,
        `${FM}#5`,
        `${HH}#1`,
        `${HH}#1~hazen-williams`,
        `${HH}#1~parallel`,
        `${HH}#1~hardy-cross`,
        `${HH}#3`,
      ],
      [
        "From HE-mechanical-P12 and HE-aero-civil-chemical-P20 (its pipeNetwork merged in as modes). One kind, `fluidSystem`, chosen by `mode`; specs in typesHe1g.ts, pictures in reps/FluidSystem.tsx (FluidStatics, FluidFlow, FluidPipes, FluidLayers), the relations in reps/fluidMath.ts, checks in harness/picturesHe1g.ts, demos in galleryHe1g.ts (each demo is the page's own module, ready to promote).",
        'Every page passes `g: 9.81` (or its own g) and its densities; a "?" value draws nothing for it; values are read in the variable\'s unit and drawn in SI (kPa, mm and kN all work). No page changes beyond adding the representation.',
        "fluid-mechanics#0: { kind: 'fluidSystem', mode: 'tank', depth: 'h', density: 'rho', gauge: 'Pg', atm: 'Patm', absolute: 'Pabs', g: 9.81 } (drag the point for h). ~manometer: { mode: 'manometer', reading: 'h', density: 'rho', gaugeDensity: 'rhoM', difference: 'dP', fluid: 'water', gaugeFluid: 'mercury' } (drag the level). ~gate: { mode: 'gate', width: 'b', height: 'H', top: 'd', density: 'rho', centroid: 'hc', force: 'F', center: 'ycp' } (drag the gate). ~buoyancy: { mode: 'buoyancy', volume: 'V', bodyDensity: 'rhoB', density: 'rho', submerged: 'Vs', buoyant: 'FB', body?: 'ice' }.",
        "fluid-mechanics#1: { mode: 'venturi', inlet: 'D1', throat: 'D2', density: 'rho', difference: 'dP', speed1: 'V1', speed2: 'V2', flow: 'Q' } (drag the throat; the page needs the relation ΔP = ½ρV₁²((D₁ ÷ D₂)⁴ − 1) to find V₁ from ΔP, as the demo has). ~pitot: { mode: 'pitot', speed: 'V', difference: 'dP', density: 'rho', gaugeDensity: 1000, fluid: 'air', gaugeFluid: 'water' }. #2: { mode: 'jet', speed: 'V', angle: 'th', area: 'A', density: 'rho', massFlow: 'm', forceX: 'Fx', forceY: 'Fy' } (drag the vane's tip for θ).",
        "#2~pump: { mode: 'pipe', pump: true, flow: 'Q', rise: 'dz', headLoss: 'hL', pumpHead: 'hp', power: 'P', efficiency: 'eta', density: 'rho' }. #4: { mode: 'pipe', diameter: 'D', length: 'L', speed: 'V', headLoss: 'hL', drop: 'dP', density: 1000, friction: 'f', reynolds: 'Re' }, pictureLabels nu, eps (Colebrook's f step shows its last iteration). hydraulics-hydrology#1: the same with flow: 'Q' (Swamee–Jain); ~hazen-williams: { mode: 'pipe', diameter, length, flow, headLoss: 'hf' }, pictureLabels C. ~parallel: { mode: 'parallel', flow: 'Q', pipes: [{ diameter: 'D1', length: 'L1', flow: 'Q1' }, { diameter: 'D2', length: 'L2', flow: 'Q2' }], headLoss: 'hf', hazen: 'C' } (the split relation Q₁ = Q ÷ (1 + ((L₁ ÷ L₂)(D₂ ÷ D₁)^4.87)^(1 ÷ 1.852)) lets the solver find Q₁ until N2). ~hardy-cross: { mode: 'loop', pipes: [{ constant: 'K1', flow: 'Q1' }, … four], correction: 'dQ' }.",
        "hydraulics-hydrology#3: { mode: 'full', flow: 'Q', manning: 'n', slope: 'S', diameter: 'D', sizes: [300, 375, …, 3600] } (mm; the picture lays the first size at least D; a page with N4's size value passes size: '<id>' instead). #3 (fluid-mechanics): { mode: 'model', rule: 'reynolds', protoSpeed: 'Vp', protoLength: 'Lp', modelLength: 'Lm', modelSpeed: 'Vm', protoViscosity: 'nuP', modelViscosity: 'nuM', reynolds: 'Re' }; ~froude: rule: 'froude', body: 'ship'. #5: { mode: 'plate', speed: 'V', length: 'L', viscosity: 'nu', thickness: 'delta', reynolds: 'Re' }, pictureLabels rho, b, Cf, FD; ~turbulent adds turbulent: true.",
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-fluid-system-tank',
      'g.he-fluid-system-tank-deep',
      'g.he-fluid-system-manometer',
      'g.he-fluid-system-manometer-air',
      'g.he-fluid-system-gate',
      'g.he-fluid-system-gate-deep',
      'g.he-fluid-system-buoyancy',
      'g.he-fluid-system-buoyancy-ice',
      'g.he-fluid-system-venturi',
      'g.he-fluid-system-venturi-gentle',
      'g.he-fluid-system-pitot',
      'g.he-fluid-system-pitot-water',
      'g.he-fluid-system-jet',
      'g.he-fluid-system-jet-bucket',
      'g.he-fluid-system-pipe',
      'g.he-fluid-system-pipe-network',
      'g.he-fluid-system-pipe-hazen',
      'g.he-fluid-system-pipe-pump',
      'g.he-fluid-system-parallel',
      'g.he-fluid-system-parallel-narrow',
      'g.he-fluid-system-loop',
      'g.he-fluid-system-loop-flip',
      'g.he-fluid-system-full',
      'g.he-fluid-system-full-slow',
      'g.he-fluid-system-plate',
      'g.he-fluid-system-plate-turbulent',
      'g.he-fluid-system-model',
      'g.he-fluid-system-model-froude',
    ],
  },
];
