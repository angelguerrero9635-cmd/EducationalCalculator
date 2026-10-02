/**
 * College gallery demos, round 1, group G (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC6 `fluidSystem`: the fluid-mechanics pages (docs/plans/he.mechanical.md, topic 11) and the
 * hydraulics pipe-network and storm-sewer pages (docs/plans/he.aero-civil-chemical.md, topic 9).
 * g = 9.81 m/s², as the engineering pages have it; the picture takes it from `g`.
 */
import {
  colebrook,
  hardyCross,
  hazenWilliams,
  manningFull,
  parallelShare,
  swameeJain,
} from '@/components/module/reps/fluidMath';

import { atLeast } from './helpers';
import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';
import type { FluidLoopSpec, FluidManometerSpec, FluidPitotSpec } from './typesHe1g';
import type { Relation, Values, VariableDef } from '@/engine/types';

/** g on the engineering pages, m/s². */
const G = 9.81;

interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}

/** Gathers rules into a module's `relations` and `steps` (a check has no steps). */
const rules = (...rs: Rule[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

type Solve = (v: Values) => number | number[] | undefined;

/**
 * A rule from its display, its residual and, per variable, how to solve for it with the step
 * text: `[solve, expr, how]`; `null` marks a value this rule never works out (many answers).
 */
const rule = (
  id: string,
  display: string,
  residual: (v: Values) => number,
  parts: Record<string, [Solve, StepText['expr'], string] | null>,
): Rule => ({
  relation: {
    id,
    display,
    vars: [
      ...new Set([...Object.keys(parts), ...[...display.matchAll(/\{(\w+)\}/g)].map((x) => x[1]!)]),
    ],
    residual,
    solve: Object.fromEntries(
      Object.entries(parts).map(([k, p]) => [k, p ? p[0] : () => undefined]),
    ) as Relation['solve'],
  },
  steps: Object.fromEntries(
    Object.entries(parts).flatMap(([k, p]) => (p ? [[k, { expr: p[1], how: p[2] }]] : [])),
  ),
});

/** A check (`big` at least `small`) with the reason it gives when broken. */
const check = (big: string, small: string, message: string): Rule => {
  const c = atLeast(big, small);
  return {
    relation: { ...c, message: (v: Values) => (c.residual(v) === 0 ? undefined : message) },
    steps: {},
  };
};

/** A measured value with its unit and range. */
const q = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  step = 0.1,
  extra: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...(unit ? { unit } : {}), min, max, step, ...extra });

/** A pressure kept in pascals for the formulas and shown in kPa. */
const kPa = (id: string, symbol: string, name: string, min = 0, max = 1e9) =>
  q(id, symbol, name, 'Pa', min, max, 10, { units: ['Pa', 'kPa'], shownIn: 'kPa' });

/** A force kept in newtons and shown in kN. */
const kN = (id: string, symbol: string, name: string) =>
  q(id, symbol, name, 'N', 0, 1e10, 10, { units: ['N', 'kN'], shownIn: 'kN' });

const div = (a: number, b: number) => (Math.abs(b) < 1e-15 ? undefined : a / b);
const root = (x: number) => (x < 0 ? undefined : Math.sqrt(x));

/** A demo module: the page's values and rules, the picture, a title and its use line. */
const demo = (
  id: string,
  title: string,
  use: string,
  m: Omit<ModuleDef, 'id' | 'title' | 'use'>,
): ModuleDef => ({ id, title, use, workedFigures: 4, ...m });

const ASSUME_STATIC = [
  'The fluid is at rest and has the same density at every depth (incompressible).',
  'g = 9.81 m/s².',
];

// ── Fluid statics (fluid-mechanics#0): tank, manometer, gate, buoyancy ──

function tankDemo(id: string, title: string, use: string, h: number, rho: number): ModuleDef {
  const Patm = 101300;
  const Pg = rho * G * h;
  return demo(id, title, use, {
    assumptions: [
      ...ASSUME_STATIC,
      'Gauge pressure is measured from the atmosphere’s; absolute pressure adds P_atm.',
    ],
    variables: [
      q('h', 'h', 'Depth', 'm', 0, 11000, 0.1),
      q('rho', 'ρ', 'Density', 'kg/m³', 1, 20000, 1),
      kPa('Patm', 'P_atm', 'Atmospheric pressure', 1000, 200000),
      kPa('Pg', 'P_gauge', 'Gauge pressure'),
      kPa('Pabs', 'P_abs', 'Absolute pressure'),
    ],
    ...rules(
      rule('P_gauge = ρgh', '{Pg} = {rho} × 9.81 × {h}', (v) => v.Pg! - v.rho! * G * v.h!, {
        Pg: [
          (v) => v.rho! * G * v.h!,
          '{rho} × 9.81 × {h}',
          'Each metre of depth adds ρg pascals: multiply the density by g and the depth.',
        ],
        rho: [
          (v) => div(v.Pg!, G * v.h!),
          '{Pg} ÷ (9.81 × {h})',
          'Divide the gauge pressure by g times the depth.',
        ],
        h: [
          (v) => div(v.Pg!, v.rho! * G),
          '{Pg} ÷ ({rho} × 9.81)',
          'Divide the gauge pressure by ρg, the pressure each metre of depth adds.',
        ],
      }),
      rule('P_abs = P_atm + P_gauge', '{Pabs} = {Patm} + {Pg}', (v) => v.Pabs! - v.Patm! - v.Pg!, {
        Pabs: [
          (v) => v.Patm! + v.Pg!,
          '{Patm} + {Pg}',
          'The air presses on the surface too: add the atmosphere’s pressure to the gauge pressure.',
        ],
        Patm: [(v) => v.Pabs! - v.Pg!, '{Pabs} − {Pg}', 'Subtract the gauge pressure.'],
        Pg: [
          (v) => v.Pabs! - v.Patm!,
          '{Pabs} − {Patm}',
          'Subtract the atmosphere’s pressure from the absolute pressure.',
        ],
      }),
    ),
    example: { h, rho, Patm, Pg, Pabs: Patm + Pg },
    startWith: ['h', 'rho', 'Patm'],
    representation: {
      kind: 'fluidSystem',
      mode: 'tank',
      depth: 'h',
      density: 'rho',
      gauge: 'Pg',
      atm: 'Patm',
      absolute: 'Pabs',
      g: G,
      fluid: 'water',
    },
  });
}

const tank = tankDemo(
  'g.he-fluid-system-tank',
  'Pressure at a depth: water in a tank',
  'Use this for “What is the gauge and absolute pressure 15 m under water?”',
  15,
  1000,
);

const tankDeep = tankDemo(
  'g.he-fluid-system-tank-deep',
  'Pressure at a submarine’s depth in seawater',
  'Use this for “How much pressure does a hull feel 250 m down in seawater of 1025 kg/m³?”',
  250,
  1025,
);

function manometerDemo(
  id: string,
  title: string,
  use: string,
  values: { rho: number; rhoM: number; h: number },
  fluids: Pick<FluidManometerSpec, 'fluid' | 'gaugeFluid'>,
): ModuleDef {
  const { rho, rhoM, h } = values;
  return demo(id, title, use, {
    assumptions: [
      ...ASSUME_STATIC,
      'Taps A and B are at the same height, and the fluid in each leg above the gauge fluid is the pipe’s.',
    ],
    variables: [
      q('h', 'h', 'Manometer reading', 'm', 0, 5, 0.001, { units: ['m', 'cm', 'mm'] }),
      q('rho', 'ρ', 'Density of the fluid in the pipe', 'kg/m³', 0.1, 20000, 0.1),
      q('rhoM', 'ρ_m', 'Density of the gauge fluid', 'kg/m³', 1, 20000, 1),
      kPa('dP', 'ΔP', 'Pressure difference P_A − P_B'),
    ],
    ...rules(
      check('rhoM', 'rho', 'The gauge fluid must be heavier than the fluid in the pipe.'),
      rule(
        'ΔP = (ρ_m − ρ)gh',
        '{dP} = ({rhoM} − {rho}) × 9.81 × {h}',
        (v) => v.dP! - (v.rhoM! - v.rho!) * G * v.h!,
        {
          dP: [
            (v) => (v.rhoM! - v.rho!) * G * v.h!,
            '({rhoM} − {rho}) × 9.81 × {h}',
            'Go down one leg and up the other: only the h where the legs hold different fluids counts, so use the difference of the densities.',
          ],
          h: [
            (v) => div(v.dP!, (v.rhoM! - v.rho!) * G),
            '{dP} ÷ (({rhoM} − {rho}) × 9.81)',
            'Divide the pressure difference by (ρ_m − ρ)g.',
          ],
          rhoM: [
            (v) => (div(v.dP!, G * v.h!) !== undefined ? v.rho! + v.dP! / (G * v.h!) : undefined),
            '{rho} + {dP} ÷ (9.81 × {h})',
            'Divide ΔP by gh to get ρ_m − ρ, then add ρ.',
          ],
          rho: [
            (v) => (div(v.dP!, G * v.h!) !== undefined ? v.rhoM! - v.dP! / (G * v.h!) : undefined),
            '{rhoM} − {dP} ÷ (9.81 × {h})',
            'Divide ΔP by gh to get ρ_m − ρ, then subtract it from ρ_m.',
          ],
        },
      ),
    ),
    example: { h, rho, rhoM, dP: (rhoM - rho) * G * h },
    startWith: ['h', 'rho', 'rhoM'],
    representation: {
      kind: 'fluidSystem',
      mode: 'manometer',
      reading: 'h',
      density: 'rho',
      gaugeDensity: 'rhoM',
      difference: 'dP',
      g: G,
      ...fluids,
    },
  });
}

const manometer = manometerDemo(
  'g.he-fluid-system-manometer',
  'A mercury manometer across a water pipe',
  'Use this for “A mercury manometer on a water pipe reads 0.12 m. What is P_A − P_B?”',
  { rho: 1000, rhoM: 13600, h: 0.12 },
  { fluid: 'water', gaugeFluid: 'mercury' },
);

const manometerAir = manometerDemo(
  'g.he-fluid-system-manometer-air',
  'A water manometer across an air duct',
  'Use this for “A water manometer across a filter in an air duct reads 5 cm. What is the pressure drop?”',
  { rho: 1.2, rhoM: 1000, h: 0.05 },
  { fluid: 'air', gaugeFluid: 'water' },
);

function gateDemo(
  id: string,
  title: string,
  use: string,
  values: { rho: number; b: number; H: number; d: number },
): ModuleDef {
  const { rho, b, H, d } = values;
  const hc = d + H / 2;
  return demo(id, title, use, {
    assumptions: [
      ...ASSUME_STATIC,
      'The gate is a vertical rectangle in the wall; the air presses on both sides, so gauge pressure is used.',
    ],
    variables: [
      q('d', 'd', 'Depth of the gate’s top', 'm', 0, 500, 0.1),
      q('b', 'b', 'Gate width', 'm', 0.01, 100, 0.1),
      q('H', 'H', 'Gate height', 'm', 0.01, 100, 0.1),
      q('rho', 'ρ', 'Density', 'kg/m³', 1, 20000, 1),
      q('hc', 'h_c', 'Depth of the centroid', 'm', 0, 600, 0.01),
      kN('F', 'F', 'Force on the gate'),
      q('ycp', 'y_cp', 'Depth of the center of pressure', 'm', 0, 600, 0.01),
    ],
    ...rules(
      rule('h_c = d + H ÷ 2', '{hc} = {d} + {H} ÷ 2', (v) => v.hc! - v.d! - v.H! / 2, {
        hc: [
          (v) => v.d! + v.H! / 2,
          '{d} + {H} ÷ 2',
          'A rectangle’s centroid is halfway down it: add half the height to the top’s depth.',
        ],
        d: [(v) => v.hc! - v.H! / 2, '{hc} − {H} ÷ 2', 'Subtract half the height.'],
        H: [(v) => 2 * (v.hc! - v.d!), '2 × ({hc} − {d})', 'The centroid is half the height down.'],
      }),
      rule(
        'F = ρgh_cbH',
        '{F} = {rho} × 9.81 × {hc} × {b} × {H}',
        (v) => v.F! - v.rho! * G * v.hc! * v.b! * v.H!,
        {
          F: [
            (v) => v.rho! * G * v.hc! * v.b! * v.H!,
            '{rho} × 9.81 × {hc} × {b} × {H}',
            'The pressure at the centroid, ρgh_c, is the average over the gate: multiply it by the area bH.',
          ],
          rho: [
            (v) => div(v.F!, G * v.hc! * v.b! * v.H!),
            '{F} ÷ (9.81 × {hc} × {b} × {H})',
            'Divide the force by g, h_c and the area.',
          ],
          hc: [
            (v) => div(v.F!, v.rho! * G * v.b! * v.H!),
            '{F} ÷ ({rho} × 9.81 × {b} × {H})',
            'Divide the force by ρg and the area.',
          ],
          b: [
            (v) => div(v.F!, v.rho! * G * v.hc! * v.H!),
            '{F} ÷ ({rho} × 9.81 × {hc} × {H})',
            'Divide the force by ρgh_c and the height.',
          ],
          H: [
            (v) => div(v.F!, v.rho! * G * v.hc! * v.b!),
            '{F} ÷ ({rho} × 9.81 × {hc} × {b})',
            'Divide the force by ρgh_c and the width.',
          ],
        },
      ),
      rule(
        'y_cp = h_c + H² ÷ (12h_c)',
        '{ycp} = {hc} + {H}² ÷ (12 × {hc})',
        (v) => v.ycp! - v.hc! - (v.H! * v.H!) / (12 * v.hc!),
        {
          ycp: [
            (v) => (v.hc! > 0 ? v.hc! + (v.H! * v.H!) / (12 * v.hc!) : undefined),
            '{hc} + {H}² ÷ (12 × {hc})',
            'Pressure grows with depth, so the force acts below the centroid by I ÷ (h_cA) = H² ÷ (12h_c) for a rectangle.',
          ],
          H: [
            (v) => root(12 * v.hc! * (v.ycp! - v.hc!)),
            '√(12 × {hc} × ({ycp} − {hc}))',
            'Subtract h_c, multiply by 12h_c, then take the square root.',
          ],
          hc: null,
        },
      ),
    ),
    example: { d, b, H, rho, hc, F: rho * G * hc * b * H, ycp: hc + (H * H) / (12 * hc) },
    startWith: ['d', 'b', 'H', 'rho'],
    representation: {
      kind: 'fluidSystem',
      mode: 'gate',
      width: 'b',
      height: 'H',
      top: 'd',
      density: 'rho',
      centroid: 'hc',
      force: 'F',
      center: 'ycp',
      g: G,
    },
  });
}

const gate = gateDemo(
  'g.he-fluid-system-gate',
  'Force on a submerged gate',
  'Use this for “A gate 2 m wide and 3 m tall has its top 1 m under water. Find the force and where it acts.”',
  { rho: 1000, b: 2, H: 3, d: 1 },
);

const gateDeep = gateDemo(
  'g.he-fluid-system-gate-deep',
  'A deep gate: the center of pressure near the centroid',
  'Use this for “A 1.5 m by 2 m outlet gate has its top 20 m down a dam. How far below its centroid does the force act?”',
  { rho: 1000, b: 1.5, H: 2, d: 20 },
);

function buoyancyDemo(
  id: string,
  title: string,
  use: string,
  values: { V: number; rhoB: number; rho: number },
  body: 'wood' | 'ice',
): ModuleDef {
  const { V, rhoB, rho } = values;
  const Vs = (V * rhoB) / rho;
  return demo(id, title, use, {
    assumptions: [
      ...ASSUME_STATIC,
      'The body floats at rest, so its weight equals the buoyant force (Archimedes).',
    ],
    variables: [
      q('V', 'V', 'Body volume', 'm³', 1e-6, 1e7, 0.001),
      q('rhoB', 'ρ_body', 'Body density', 'kg/m³', 1, 20000, 1),
      q('rho', 'ρ', 'Fluid density', 'kg/m³', 1, 20000, 1),
      q('Vs', 'V_sub', 'Volume under the surface', 'm³', 0, 1e7, 0.001),
      q('FB', 'F_B', 'Buoyant force', 'N', 0, 1e12, 0.1),
    ],
    ...rules(
      check('rho', 'rhoB', 'A body denser than the fluid sinks; it can’t float.'),
      rule(
        'V_sub ÷ V = ρ_body ÷ ρ',
        '{Vs} ÷ {V} = {rhoB} ÷ {rho}',
        (v) => v.Vs! * v.rho! - v.V! * v.rhoB!,
        {
          Vs: [
            (v) => div(v.V! * v.rhoB!, v.rho!),
            '{V} × {rhoB} ÷ {rho}',
            'Floating, the weight ρ_body gV equals the buoyant force ρgV_sub, so V_sub = V × ρ_body ÷ ρ.',
          ],
          V: [
            (v) => div(v.Vs! * v.rho!, v.rhoB!),
            '{Vs} × {rho} ÷ {rhoB}',
            'Multiply V_sub by ρ ÷ ρ_body.',
          ],
          rhoB: [
            (v) => div(v.Vs! * v.rho!, v.V!),
            '{rho} × {Vs} ÷ {V}',
            'The share under the surface times ρ.',
          ],
          rho: [
            (v) => div(v.V! * v.rhoB!, v.Vs!),
            '{rhoB} × {V} ÷ {Vs}',
            'Divide ρ_body by the share under the surface.',
          ],
        },
      ),
      rule('F_B = ρgV_sub', '{FB} = {rho} × 9.81 × {Vs}', (v) => v.FB! - v.rho! * G * v.Vs!, {
        FB: [
          (v) => v.rho! * G * v.Vs!,
          '{rho} × 9.81 × {Vs}',
          'The buoyant force is the weight of the fluid the body pushes aside: ρg times V_sub.',
        ],
        Vs: [(v) => div(v.FB!, v.rho! * G), '{FB} ÷ ({rho} × 9.81)', 'Divide F_B by ρg.'],
        rho: [(v) => div(v.FB!, G * v.Vs!), '{FB} ÷ (9.81 × {Vs})', 'Divide F_B by g and V_sub.'],
      }),
    ),
    example: { V, rhoB, rho, Vs, FB: rho * G * Vs },
    startWith: ['V', 'rhoB', 'rho'],
    representation: {
      kind: 'fluidSystem',
      mode: 'buoyancy',
      volume: 'V',
      bodyDensity: 'rhoB',
      density: 'rho',
      submerged: 'Vs',
      buoyant: 'FB',
      g: G,
      fluid: 'water',
      body,
    },
  });
}

const buoyancy = buoyancyDemo(
  'g.he-fluid-system-buoyancy',
  'A floating block of wood',
  'Use this for “0.06 m³ of wood of 600 kg/m³ floats in water. How much is under, and what is F_B?”',
  { V: 0.06, rhoB: 600, rho: 1000 },
  'wood',
);

const buoyancyIce = buoyancyDemo(
  'g.he-fluid-system-buoyancy-ice',
  'Ice in seawater: most of it under',
  'Use this for “Ice of 917 kg/m³ floats in seawater of 1025 kg/m³. What share is under the surface?”',
  { V: 1000, rhoB: 917, rho: 1025 },
  'ice',
);

// ── Bernoulli and momentum (fluid-mechanics#1, #2): venturi, pitot, jet ──

const ASSUME_FLOW = [
  'Steady, incompressible flow with no losses, along a streamline.',
  'The meter is level, so the heights cancel.',
];

/** A diameter kept in metres for the formulas and shown in mm. */
const mm = (id: string, symbol: string, name: string) =>
  q(id, symbol, name, 'm', 0.001, 10, 0.001, { units: ['mm', 'cm', 'm'], shownIn: 'mm' });

function venturiDemo(
  id: string,
  title: string,
  use: string,
  values: { D1: number; D2: number; rho: number; dP: number },
): ModuleDef {
  const { D1, D2, rho, dP } = values;
  const V1 = Math.sqrt((2 * dP) / (rho * ((D1 / D2) ** 4 - 1)));
  const V2 = V1 * (D1 / D2) ** 2;
  return demo(id, title, use, {
    assumptions: ASSUME_FLOW,
    variables: [
      kPa('dP', 'ΔP', 'Pressure difference P₁ − P₂'),
      mm('D1', 'D₁', 'Inlet diameter'),
      mm('D2', 'D₂', 'Throat diameter'),
      q('rho', 'ρ', 'Density', 'kg/m³', 0.1, 20000, 0.1),
      q('V1', 'V₁', 'Inlet speed', 'm/s', 0, 1000, 0.01),
      q('V2', 'V₂', 'Throat speed', 'm/s', 0, 1000, 0.01),
      q('Q', 'Q', 'Flow rate', 'm³/s', 0, 1000, 0.0001),
    ],
    ...rules(
      rule(
        'ΔP = ½ρV₁²((D₁ ÷ D₂)⁴ − 1)',
        '{dP} = ½ × {rho} × {V1}² × (({D1} ÷ {D2})⁴ − 1)',
        (v) => v.dP! - 0.5 * v.rho! * v.V1! ** 2 * ((v.D1! / v.D2!) ** 4 - 1),
        {
          V1: [
            (v) => root((2 * v.dP!) / (v.rho! * ((v.D1! / v.D2!) ** 4 - 1))),
            '√(2 × {dP} ÷ ({rho} × (({D1} ÷ {D2})⁴ − 1)))',
            'Put V₂ = V₁(D₁ ÷ D₂)² from continuity into Bernoulli’s ΔP = ½ρ(V₂² − V₁²), then solve for V₁.',
          ],
          dP: [
            (v) => 0.5 * v.rho! * v.V1! ** 2 * ((v.D1! / v.D2!) ** 4 - 1),
            '½ × {rho} × {V1}² × (({D1} ÷ {D2})⁴ − 1)',
            'Bernoulli with V₂ written through V₁ by continuity.',
          ],
          rho: [
            (v) => div(2 * v.dP!, v.V1! ** 2 * ((v.D1! / v.D2!) ** 4 - 1)),
            '2 × {dP} ÷ ({V1}² × (({D1} ÷ {D2})⁴ − 1))',
            'Solve the same equation for ρ.',
          ],
          D1: null,
          D2: null,
        },
      ),
      rule(
        'A₁V₁ = A₂V₂',
        '{D1}² × {V1} = {D2}² × {V2}',
        (v) => v.D1! ** 2 * v.V1! - v.D2! ** 2 * v.V2!,
        {
          V2: [
            (v) => div(v.D1! ** 2 * v.V1!, v.D2! ** 2),
            '{V1} × ({D1} ÷ {D2})²',
            'The same water passes each section: the area shrinks by (D₂ ÷ D₁)², so the speed grows by (D₁ ÷ D₂)².',
          ],
          V1: [
            (v) => div(v.D2! ** 2 * v.V2!, v.D1! ** 2),
            '{V2} × ({D2} ÷ {D1})²',
            'Continuity the other way: the wider inlet is slower.',
          ],
          D1: [
            (v) => (v.V1! > 0 ? v.D2! * Math.sqrt(v.V2! / v.V1!) : undefined),
            '{D2} × √({V2} ÷ {V1})',
            'The areas go inversely as the speeds.',
          ],
          D2: [
            (v) => (v.V2! > 0 ? v.D1! * Math.sqrt(v.V1! / v.V2!) : undefined),
            '{D1} × √({V1} ÷ {V2})',
            'The areas go inversely as the speeds.',
          ],
        },
      ),
      rule(
        'ΔP = ½ρ(V₂² − V₁²)',
        '{dP} = ½ × {rho} × ({V2}² − {V1}²)',
        (v) => v.dP! - 0.5 * v.rho! * (v.V2! ** 2 - v.V1! ** 2),
        {
          dP: [
            (v) => 0.5 * v.rho! * (v.V2! ** 2 - v.V1! ** 2),
            '½ × {rho} × ({V2}² − {V1}²)',
            'Bernoulli on a level line: the pressure falls by the gain in ½ρV².',
          ],
          rho: [
            (v) => div(2 * v.dP!, v.V2! ** 2 - v.V1! ** 2),
            '2 × {dP} ÷ ({V2}² − {V1}²)',
            'Solve Bernoulli for ρ.',
          ],
          V2: [
            (v) => root(v.V1! ** 2 + (2 * v.dP!) / v.rho!),
            '√({V1}² + 2 × {dP} ÷ {rho})',
            'Add 2ΔP ÷ ρ to V₁², then take the square root.',
          ],
          V1: [
            (v) => root(v.V2! ** 2 - (2 * v.dP!) / v.rho!),
            '√({V2}² − 2 × {dP} ÷ {rho})',
            'Take 2ΔP ÷ ρ from V₂², then take the square root.',
          ],
        },
      ),
      rule(
        'Q = A₁V₁',
        '{Q} = π ÷ 4 × {D1}² × {V1}',
        (v) => v.Q! - (Math.PI / 4) * v.D1! ** 2 * v.V1!,
        {
          Q: [
            (v) => (Math.PI / 4) * v.D1! ** 2 * v.V1!,
            'π ÷ 4 × {D1}² × {V1}',
            'The flow is the inlet’s area times its speed.',
          ],
          V1: [
            (v) => div(v.Q!, (Math.PI / 4) * v.D1! ** 2),
            '{Q} ÷ (π ÷ 4 × {D1}²)',
            'Divide the flow by the inlet’s area.',
          ],
          D1: [
            (v) => (v.V1! > 0 ? Math.sqrt((4 * v.Q!) / (Math.PI * v.V1!)) : undefined),
            '√(4 × {Q} ÷ (π × {V1}))',
            'The area is Q ÷ V; turn it into a diameter.',
          ],
        },
      ),
    ),
    example: { dP, D1, D2, rho, V1, V2, Q: (Math.PI / 4) * D1 * D1 * V1 },
    startWith: ['dP', 'D1', 'D2', 'rho'],
    representation: {
      kind: 'fluidSystem',
      mode: 'venturi',
      inlet: 'D1',
      throat: 'D2',
      density: 'rho',
      difference: 'dP',
      speed1: 'V1',
      speed2: 'V2',
      flow: 'Q',
      g: G,
      fluid: 'water',
    },
  });
}

const venturi = venturiDemo(
  'g.he-fluid-system-venturi',
  'A venturi meter: the throat’s pressure falls',
  'Use this for “Water in a venturi narrows from 100 mm to 50 mm and the pressure falls 30 kPa. Find Q.”',
  { D1: 0.1, D2: 0.05, rho: 1000, dP: 30000 },
);

const venturiGentle = venturiDemo(
  'g.he-fluid-system-venturi-gentle',
  'A gentle venturi: a small drop, a slight neck',
  'Use this for “A 200 mm main necks to 160 mm and the gauges differ by 4 kPa. What is the flow?”',
  { D1: 0.2, D2: 0.16, rho: 1000, dP: 4000 },
);

function pitotDemo(
  id: string,
  title: string,
  use: string,
  values: { rho: number; dP: number; rhoM: number },
  fluids: Pick<FluidPitotSpec, 'fluid' | 'gaugeFluid'>,
): ModuleDef {
  const { rho, dP, rhoM } = values;
  return demo(id, title, use, {
    assumptions: [
      'The stream stops at the nose with no loss (a stagnation point); the static ports read the stream’s own pressure.',
      'Incompressible: the speed is well under a third of the speed of sound.',
      `The gauge fluid is ${rhoM} kg/m³ and g = 9.81 m/s².`,
    ],
    variables: [
      q('dP', 'ΔP', 'Stagnation minus static pressure', 'Pa', 0, 1e7, 1, { units: ['Pa', 'kPa'] }),
      q('rho', 'ρ', 'Density of the stream', 'kg/m³', 0.01, 20000, 0.01),
      q('V', 'V', 'Stream speed', 'm/s', 0, 500, 0.01),
    ],
    ...rules(
      rule(
        'V = √(2ΔP ÷ ρ)',
        '{V} = √(2 × {dP} ÷ {rho})',
        (v) => v.V! - Math.sqrt((2 * v.dP!) / v.rho!),
        {
          V: [
            (v) => root((2 * v.dP!) / v.rho!),
            '√(2 × {dP} ÷ {rho})',
            'Bernoulli from the stream to the nose, where it stops: ΔP = ½ρV², so V = √(2ΔP ÷ ρ).',
          ],
          dP: [
            (v) => 0.5 * v.rho! * v.V! ** 2,
            '½ × {rho} × {V}²',
            'The pressure rise where the stream stops is ½ρV².',
          ],
          rho: [(v) => div(2 * v.dP!, v.V! ** 2), '2 × {dP} ÷ {V}²', 'Solve ΔP = ½ρV² for ρ.'],
        },
      ),
    ),
    example: { dP, rho, V: Math.sqrt((2 * dP) / rho) },
    startWith: ['dP', 'rho'],
    representation: {
      kind: 'fluidSystem',
      mode: 'pitot',
      speed: 'V',
      difference: 'dP',
      density: 'rho',
      gaugeDensity: rhoM,
      g: G,
      ...fluids,
    },
  });
}

const pitot = pitotDemo(
  'g.he-fluid-system-pitot',
  'A pitot-static tube in an air stream',
  'Use this for “A pitot tube in air of 1.2 kg/m³ reads 600 Pa. How fast is the air?”',
  { rho: 1.2, dP: 600, rhoM: 1000 },
  { fluid: 'air', gaugeFluid: 'water' },
);

const pitotWater = pitotDemo(
  'g.he-fluid-system-pitot-water',
  'A pitot tube in a water channel, on mercury',
  'Use this for “A pitot tube in a water channel reads 2 kPa on a mercury gauge. Find the speed.”',
  { rho: 1000, dP: 2000, rhoM: 13600 },
  { fluid: 'water', gaugeFluid: 'mercury' },
);

const RAD = Math.PI / 180;

function jetDemo(
  id: string,
  title: string,
  use: string,
  values: { rho: number; V: number; A: number; th: number },
): ModuleDef {
  const { rho, V, A, th } = values;
  const m = rho * V * A;
  return demo(id, title, use, {
    assumptions: [
      'The vane is fixed; the jet keeps its speed across it (no friction).',
      'Atmospheric pressure all round, so only momentum crosses the control volume.',
      'Steady flow; the jet’s weight is ignored.',
    ],
    variables: [
      q('th', 'θ', 'Turning angle', '°', 1, 180, 1),
      q('V', 'V', 'Jet speed', 'm/s', 0.1, 500, 0.1),
      q('A', 'A', 'Jet area', 'm²', 1e-6, 10, 0.0001),
      q('rho', 'ρ', 'Density', 'kg/m³', 1, 20000, 1),
      q('m', 'ṁ', 'Mass flow rate', 'kg/s', 0, 1e7, 0.1),
      q('Fx', 'Fₓ', 'Force along the jet', 'N', 0, 1e9, 1),
      q('Fy', 'F_y', 'Force across the jet', 'N', 0, 1e9, 1),
    ],
    ...rules(
      rule('ṁ = ρVA', '{m} = {rho} × {V} × {A}', (v) => v.m! - v.rho! * v.V! * v.A!, {
        m: [
          (v) => v.rho! * v.V! * v.A!,
          '{rho} × {V} × {A}',
          'Mass per second is the density times the speed times the area.',
        ],
        rho: [(v) => div(v.m!, v.V! * v.A!), '{m} ÷ ({V} × {A})', 'Divide ṁ by VA.'],
        V: [(v) => div(v.m!, v.rho! * v.A!), '{m} ÷ ({rho} × {A})', 'Divide ṁ by ρA.'],
        A: [(v) => div(v.m!, v.rho! * v.V!), '{m} ÷ ({rho} × {V})', 'Divide ṁ by ρV.'],
      }),
      rule(
        'Fₓ = ṁV(1 − cos θ)',
        '{Fx} = {m} × {V} × (1 − cos({th}))',
        (v) => v.Fx! - v.m! * v.V! * (1 - Math.cos(v.th! * RAD)),
        {
          Fx: [
            (v) => v.m! * v.V! * (1 - Math.cos(v.th! * RAD)),
            '{m} × {V} × (1 − cos({th}))',
            'The jet comes in with ṁV along x and leaves with ṁV cos θ: the vane takes the difference.',
          ],
          m: [
            (v) => div(v.Fx!, v.V! * (1 - Math.cos(v.th! * RAD))),
            '{Fx} ÷ ({V} × (1 − cos({th})))',
            'Divide Fₓ by V(1 − cos θ).',
          ],
          V: null,
          th: [
            (v) => {
              const k = div(v.Fx!, v.m! * v.V!);
              return k !== undefined && Math.abs(1 - k) <= 1 ? Math.acos(1 - k) / RAD : undefined;
            },
            'cos⁻¹(1 − {Fx} ÷ ({m} × {V}))',
            'Divide Fₓ by ṁV, take it from 1, and find the angle with that cosine.',
          ],
        },
      ),
      rule(
        'F_y = ṁV sin θ',
        '{Fy} = {m} × {V} × sin({th})',
        (v) => v.Fy! - v.m! * v.V! * Math.sin(v.th! * RAD),
        {
          Fy: [
            (v) => v.m! * v.V! * Math.sin(v.th! * RAD),
            '{m} × {V} × sin({th})',
            'The jet leaves with ṁV sin θ across: the vane is pushed the other way by as much.',
          ],
          m: [
            (v) => div(v.Fy!, v.V! * Math.sin(v.th! * RAD)),
            '{Fy} ÷ ({V} × sin({th}))',
            'Divide F_y by V sin θ.',
          ],
          V: null,
          th: null,
        },
      ),
    ),
    example: {
      th,
      V,
      A,
      rho,
      m,
      Fx: m * V * (1 - Math.cos(th * RAD)),
      Fy: m * V * Math.sin(th * RAD),
    },
    startWith: ['th', 'V', 'A', 'rho'],
    representation: {
      kind: 'fluidSystem',
      mode: 'jet',
      speed: 'V',
      angle: 'th',
      area: 'A',
      density: 'rho',
      massFlow: 'm',
      forceX: 'Fx',
      forceY: 'Fy',
      g: G,
    },
  });
}

const jet = jetDemo(
  'g.he-fluid-system-jet',
  'A water jet on a fixed vane',
  'Use this for “A 20 m/s jet of 0.002 m² is turned 120° by a fixed vane. Find the force on the vane.”',
  { rho: 1000, V: 20, A: 0.002, th: 120 },
);

const jetBucket = jetDemo(
  'g.he-fluid-system-jet-bucket',
  'A jet turned almost back: a turbine bucket',
  'Use this for “A bucket turns a 30 m/s jet of 0.005 m² through 165°. How hard does it push the bucket?”',
  { rho: 1000, V: 30, A: 0.005, th: 165 },
);

// ── Pipe flow and networks (fluid-mechanics#2~pump, #4; hydraulics-hydrology#1, #3) ──

/** ν of water at 20 °C, m²/s, as the hydraulics pages fix it. */
const NU_WATER = 1.0e-6;

/** A roughness kept in metres for the formulas and shown in mm. */
const rough = () =>
  q('eps', 'ε', 'Roughness', 'm', 1e-7, 0.01, 0.000001, { units: ['mm', 'm'], shownIn: 'mm' });

const reynoldsRule = (nu: string | number) =>
  rule(
    'Re = VD ÷ ν',
    typeof nu === 'string' ? `{Re} = {V} × {D} ÷ {${nu}}` : '{Re} = {V} × {D} ÷ 0.000001',
    (v) => v.Re! - (v.V! * v.D!) / (typeof nu === 'string' ? v[nu]! : nu),
    {
      Re: [
        (v) => div(v.V! * v.D!, typeof nu === 'string' ? v[nu]! : nu),
        typeof nu === 'string' ? `{V} × {D} ÷ {${nu}}` : '{V} × {D} ÷ 0.000001',
        'Reynolds number: inertia over viscosity, speed times diameter over ν.',
      ],
      V: [
        (v) => div(v.Re! * (typeof nu === 'string' ? v[nu]! : nu), v.D!),
        typeof nu === 'string' ? `{Re} × {${nu}} ÷ {D}` : '{Re} × 0.000001 ÷ {D}',
        'Multiply Re by ν and divide by D.',
      ],
      D: [
        (v) => div(v.Re! * (typeof nu === 'string' ? v[nu]! : nu), v.V!),
        typeof nu === 'string' ? `{Re} × {${nu}} ÷ {V}` : '{Re} × 0.000001 ÷ {V}',
        'Multiply Re by ν and divide by V.',
      ],
      ...(typeof nu === 'string'
        ? {
            [nu]: [
              (v: Values) => div(v.V! * v.D!, v.Re!),
              '{V} × {D} ÷ {Re}',
              'Divide VD by Re.',
            ] as [Solve, StepText['expr'], string],
          }
        : {}),
    },
  );

const darcyRule = (hl: string) =>
  rule(
    'h_L = f(L ÷ D)V² ÷ 2g',
    `{${hl}} = {f} × {L} ÷ {D} × {V}² ÷ (2 × 9.81)`,
    (v) => v[hl]! - (v.f! * v.L! * v.V! ** 2) / (v.D! * 2 * G),
    {
      [hl]: [
        (v) => (v.f! * v.L! * v.V! ** 2) / (v.D! * 2 * G),
        '{f} × {L} ÷ {D} × {V}² ÷ (2 × 9.81)',
        'Darcy–Weisbach: the friction factor times the pipe’s length in diameters times the velocity head V² ÷ 2g.',
      ],
      f: [
        (v) => div(v[hl]! * v.D! * 2 * G, v.L! * v.V! ** 2),
        `{${hl}} × {D} × 2 × 9.81 ÷ ({L} × {V}²)`,
        'Solve Darcy–Weisbach for f.',
      ],
      L: [
        (v) => div(v[hl]! * v.D! * 2 * G, v.f! * v.V! ** 2),
        `{${hl}} × {D} × 2 × 9.81 ÷ ({f} × {V}²)`,
        'Solve Darcy–Weisbach for L.',
      ],
      V: [
        (v) => root(div(v[hl]! * v.D! * 2 * G, v.f! * v.L!) ?? NaN),
        `√({${hl}} × {D} × 2 × 9.81 ÷ ({f} × {L}))`,
        'Solve Darcy–Weisbach for V².',
      ],
      D: [
        (v) => div(v.f! * v.L! * v.V! ** 2, v[hl]! * 2 * G),
        `{f} × {L} × {V}² ÷ ({${hl}} × 2 × 9.81)`,
        'Solve Darcy–Weisbach for D.',
      ],
    },
  );

const pipeLoss = (() => {
  const [V, D, L, nu, eps] = [2, 0.1, 100, 1.0e-6, 0.000045];
  const Re = (V * D) / nu;
  const f = colebrook(Re, eps / D);
  const hL = (f * L * V * V) / (D * 2 * G);
  return demo(
    'g.he-fluid-system-pipe',
    'Head loss in a pipe: the grade lines fall',
    'Use this for “Water at 2 m/s in 100 m of 0.1 m steel pipe (ε = 0.045 mm). Find h_L and ΔP.”',
    {
      assumptions: [
        'Steady, fully developed turbulent flow (Re > 4000) of water, ρ = 1000 kg/m³.',
        'g = 9.81 m/s²; minor losses are ignored.',
      ],
      variables: [
        q('V', 'V', 'Mean speed', 'm/s', 0.01, 100, 0.01),
        q('D', 'D', 'Diameter', 'm', 0.001, 10, 0.001),
        q('L', 'L', 'Length', 'm', 0.1, 1e6, 1),
        q('nu', 'ν', 'Kinematic viscosity', 'm²/s', 1e-8, 1e-2, 1e-8, { scientific: true }),
        rough(),
        q('Re', 'Re', 'Reynolds number', undefined, 4000, 1e9, 1),
        q('f', 'f', 'Friction factor', undefined, 0.005, 0.1, 0.0001),
        q('hL', 'h_L', 'Head loss', 'm', 0, 1e6, 0.01),
        kPa('dP', 'ΔP', 'Pressure drop'),
      ],
      ...rules(
        reynoldsRule('nu'),
        rule(
          'Colebrook',
          '1 ÷ √{f} = −2 × log₁₀({eps} ÷ (3.7 × {D}) + 2.51 ÷ ({Re} × √{f}))',
          (v) =>
            1 / Math.sqrt(v.f!) +
            2 * Math.log10(v.eps! / (3.7 * v.D!) + 2.51 / (v.Re! * Math.sqrt(v.f!))),
          {
            f: [
              (v) => colebrook(v.Re!, v.eps! / v.D!),
              // f is on both sides: the last round of the iteration, with the f it settles on.
              (v: Values) =>
                `(1 ÷ (−2 × log₁₀({eps} ÷ (3.7 × {D}) + 2.51 ÷ ({Re} × √${Number(colebrook(v.Re!, v.eps! / v.D!).toPrecision(8))}))))²`,
              'Colebrook has f on both sides: guess f = 0.02, put it in on the right, and repeat until f stops changing. The last round is shown.',
            ],
            eps: null,
            D: null,
            Re: null,
          },
        ),
        darcyRule('hL'),
        rule('ΔP = ρgh_L', '{dP} = 1000 × 9.81 × {hL}', (v) => v.dP! - 1000 * G * v.hL!, {
          dP: [
            (v) => 1000 * G * v.hL!,
            '1000 × 9.81 × {hL}',
            'A head of h_L metres of water is a pressure of ρgh_L.',
          ],
          hL: [(v) => v.dP! / (1000 * G), '{dP} ÷ (1000 × 9.81)', 'Divide the pressure by ρg.'],
        }),
      ),
      example: { V, D, L, nu, eps, Re, f, hL, dP: 1000 * G * hL },
      startWith: ['V', 'D', 'L', 'nu', 'eps'],
      pictureLabels: ['nu', 'eps'],
      representation: {
        kind: 'fluidSystem',
        mode: 'pipe',
        diameter: 'D',
        length: 'L',
        speed: 'V',
        headLoss: 'hL',
        drop: 'dP',
        density: 1000,
        friction: 'f',
        reynolds: 'Re',
        g: G,
      },
    },
  );
})();

const pipeNetwork = (() => {
  const [D, L, Q, eps] = [0.3, 500, 0.1, 0.000045];
  const V = Q / ((Math.PI / 4) * D * D);
  const Re = (V * D) / NU_WATER;
  const f = swameeJain(Re, eps / D);
  return demo(
    'g.he-fluid-system-pipe-network',
    'One pipe of a network: Swamee–Jain and Darcy',
    'Use this for “0.1 m³/s flows in 500 m of 0.3 m steel pipe (ε = 0.045 mm). Find the head loss.”',
    {
      assumptions: [
        'Turbulent flow (Re > 4000) of water at 20 °C, ν = 10⁻⁶ m²/s.',
        'Minor losses are ignored; g = 9.81 m/s².',
      ],
      variables: [
        q('D', 'D', 'Diameter', 'm', 0.01, 10, 0.01),
        q('L', 'L', 'Length', 'm', 1, 1e6, 1),
        q('Q', 'Q', 'Flow rate', 'm³/s', 1e-5, 1000, 0.001),
        rough(),
        q('V', 'V', 'Mean speed', 'm/s', 0, 100, 0.001),
        q('Re', 'Re', 'Reynolds number', undefined, 4000, 1e9, 1),
        q('f', 'f', 'Friction factor', undefined, 0.005, 0.1, 0.0001),
        q('hf', 'h_f', 'Head loss', 'm', 0, 1e6, 0.01),
      ],
      ...rules(
        rule(
          'V = Q ÷ (πD² ÷ 4)',
          '{V} = {Q} ÷ (π × {D}² ÷ 4)',
          (v) => v.V! - v.Q! / ((Math.PI / 4) * v.D! ** 2),
          {
            V: [
              (v) => v.Q! / ((Math.PI / 4) * v.D! ** 2),
              '{Q} ÷ (π × {D}² ÷ 4)',
              'The mean speed is the flow over the pipe’s area.',
            ],
            Q: [
              (v) => v.V! * (Math.PI / 4) * v.D! ** 2,
              '{V} × π × {D}² ÷ 4',
              'Flow is speed times area.',
            ],
            D: [
              (v) => (v.V! > 0 ? Math.sqrt((4 * v.Q!) / (Math.PI * v.V!)) : undefined),
              '√(4 × {Q} ÷ (π × {V}))',
              'The area is Q ÷ V; turn it into a diameter.',
            ],
          },
        ),
        reynoldsRule(NU_WATER),
        rule(
          'Swamee–Jain',
          '{f} = 0.25 ÷ (log₁₀({eps} ÷ (3.7 × {D}) + 5.74 ÷ {Re}^0.9))²',
          (v) => v.f! - swameeJain(v.Re!, v.eps! / v.D!),
          {
            f: [
              (v) => swameeJain(v.Re!, v.eps! / v.D!),
              '0.25 ÷ (log₁₀({eps} ÷ (3.7 × {D}) + 5.74 ÷ {Re}^0.9))²',
              'Swamee–Jain gives f directly, within 1% of Colebrook: the roughness in diameters, and Re.',
            ],
            eps: null,
            D: null,
            Re: null,
          },
        ),
        darcyRule('hf'),
      ),
      example: { D, L, Q, eps, V, Re, f, hf: (f * L * V * V) / (D * 2 * G) },
      startWith: ['D', 'L', 'Q', 'eps'],
      pictureLabels: ['eps'],
      representation: {
        kind: 'fluidSystem',
        mode: 'pipe',
        diameter: 'D',
        length: 'L',
        flow: 'Q',
        speed: 'V',
        headLoss: 'hf',
        friction: 'f',
        reynolds: 'Re',
        g: G,
      },
    },
  );
})();

/** h_f = 10.67LQ^1.852 ÷ (C^1.852D^4.87) for one pipe's values. */
const hwRule = (id: string, hf: string, Q: string, L: string, D: string) =>
  rule(
    id,
    `{${hf}} = 10.67 × {${L}} × {${Q}}^1.852 ÷ ({C}^1.852 × {${D}}^(4.87))`,
    (v) => v[hf]! - hazenWilliams(v[L]!, v[Q]!, v.C!, v[D]!),
    {
      [hf]: [
        (v) => hazenWilliams(v[L]!, v[Q]!, v.C!, v[D]!),
        `10.67 × {${L}} × {${Q}}^1.852 ÷ ({C}^1.852 × {${D}}^(4.87))`,
        'Hazen–Williams (SI): longer, faster and narrower pipes lose more head; a smoother pipe (larger C) loses less.',
      ],
      [Q]: [
        (v) => ((v[hf]! * v.C! ** 1.852 * v[D]! ** 4.87) / (10.67 * v[L]!)) ** (1 / 1.852),
        `({${hf}} × {C}^1.852 × {${D}}^(4.87) ÷ (10.67 × {${L}}))^(1 ÷ 1.852)`,
        'Solve for Q^1.852, then take the 1.852th root.',
      ],
      [L]: [
        (v) => div(v[hf]! * v.C! ** 1.852 * v[D]! ** 4.87, 10.67 * v[Q]! ** 1.852),
        `{${hf}} × {C}^1.852 × {${D}}^(4.87) ÷ (10.67 × {${Q}}^1.852)`,
        'Solve Hazen–Williams for L.',
      ],
      [D]: [
        (v) => ((10.67 * v[L]! * v[Q]! ** 1.852) / (v[hf]! * v.C! ** 1.852)) ** (1 / 4.87),
        `(10.67 × {${L}} × {${Q}}^1.852 ÷ ({${hf}} × {C}^1.852))^(1 ÷ 4.87)`,
        'Solve for D^4.87, then take the 4.87th root.',
      ],
      C: [
        (v) => ((10.67 * v[L]! * v[Q]! ** 1.852) / (v[hf]! * v[D]! ** 4.87)) ** (1 / 1.852),
        `(10.67 × {${L}} × {${Q}}^1.852 ÷ ({${hf}} × {${D}}^(4.87)))^(1 ÷ 1.852)`,
        'Solve for C^1.852, then take the 1.852th root.',
      ],
    },
  );

const ASSUME_HW = [
  'Water in turbulent flow; Hazen–Williams in SI (Q in m³/s, D and L in m).',
  'Minor losses are ignored.',
];

const pipeHazen = demo(
  'g.he-fluid-system-pipe-hazen',
  'Head loss by Hazen–Williams',
  'Use this for “0.1 m³/s in 500 m of 0.3 m pipe with C = 130. What is h_f?”',
  {
    assumptions: ASSUME_HW,
    variables: [
      q('Q', 'Q', 'Flow rate', 'm³/s', 1e-5, 1000, 0.001),
      q('D', 'D', 'Diameter', 'm', 0.01, 10, 0.01),
      q('L', 'L', 'Length', 'm', 1, 1e6, 1),
      q('C', 'C', 'Hazen–Williams C', undefined, 40, 160, 1),
      q('hf', 'h_f', 'Head loss', 'm', 0, 1e6, 0.01),
    ],
    ...rules(hwRule('Hazen–Williams', 'hf', 'Q', 'L', 'D')),
    example: { Q: 0.1, D: 0.3, L: 500, C: 130, hf: hazenWilliams(500, 0.1, 130, 0.3) },
    startWith: ['Q', 'D', 'L', 'C'],
    pictureLabels: ['C'],
    representation: {
      kind: 'fluidSystem',
      mode: 'pipe',
      diameter: 'D',
      length: 'L',
      flow: 'Q',
      headLoss: 'hf',
      g: G,
    },
  },
);

const pipePump = demo(
  'g.he-fluid-system-pipe-pump',
  'A pump lifting water between reservoirs',
  'Use this for “A pump moves 0.01 m³/s up 20 m with 4 m of losses at 75% efficiency. What power?”',
  {
    assumptions: [
      'Both reservoir surfaces are open to the air and still, so only the heights and losses count.',
      'g = 9.81 m/s².',
    ],
    variables: [
      q('Q', 'Q', 'Flow rate', 'm³/s', 1e-6, 100, 0.001),
      q('dz', 'Δz', 'Rise between surfaces', 'm', 0.01, 2000, 0.1),
      q('hL', 'h_L', 'Head loss', 'm', 0, 2000, 0.1),
      q('hp', 'h_p', 'Pump head', 'm', 0.01, 4000, 0.1),
      q('eta', 'η', 'Pump efficiency', undefined, 0.05, 1, 0.01),
      q('rho', 'ρ', 'Density', 'kg/m³', 1, 20000, 1),
      q('P', 'P', 'Shaft power', 'W', 0, 1e9, 1, { units: ['W', 'kW'], shownIn: 'kW' }),
    ],
    ...rules(
      rule('h_p = Δz + h_L', '{hp} = {dz} + {hL}', (v) => v.hp! - v.dz! - v.hL!, {
        hp: [
          (v) => v.dz! + v.hL!,
          '{dz} + {hL}',
          'Energy from surface to surface: the pump lifts the water Δz and makes up the losses.',
        ],
        dz: [(v) => v.hp! - v.hL!, '{hp} − {hL}', 'Take the losses from the pump head.'],
        hL: [(v) => v.hp! - v.dz!, '{hp} − {dz}', 'Take the rise from the pump head.'],
      }),
      rule(
        'P = ρgQh_p ÷ η',
        '{P} = {rho} × 9.81 × {Q} × {hp} ÷ {eta}',
        (v) => v.P! - (v.rho! * G * v.Q! * v.hp!) / v.eta!,
        {
          P: [
            (v) => div(v.rho! * G * v.Q! * v.hp!, v.eta!),
            '{rho} × 9.81 × {Q} × {hp} ÷ {eta}',
            'The water gains ρgQh_p each second; the shaft must give more, by 1 ÷ η.',
          ],
          eta: [
            (v) => div(v.rho! * G * v.Q! * v.hp!, v.P!),
            '{rho} × 9.81 × {Q} × {hp} ÷ {P}',
            'Power into the water over the shaft power.',
          ],
          Q: [
            (v) => div(v.P! * v.eta!, v.rho! * G * v.hp!),
            '{P} × {eta} ÷ ({rho} × 9.81 × {hp})',
            'Solve for Q.',
          ],
          hp: [
            (v) => div(v.P! * v.eta!, v.rho! * G * v.Q!),
            '{P} × {eta} ÷ ({rho} × 9.81 × {Q})',
            'Solve for h_p.',
          ],
          rho: [
            (v) => div(v.P! * v.eta!, G * v.Q! * v.hp!),
            '{P} × {eta} ÷ (9.81 × {Q} × {hp})',
            'Solve for ρ.',
          ],
        },
      ),
    ),
    example: {
      Q: 0.01,
      dz: 20,
      hL: 4,
      hp: 24,
      eta: 0.75,
      rho: 1000,
      P: (1000 * G * 0.01 * 24) / 0.75,
    },
    startWith: ['Q', 'dz', 'hL', 'eta', 'rho'],
    representation: {
      kind: 'fluidSystem',
      mode: 'pipe',
      pump: true,
      flow: 'Q',
      rise: 'dz',
      headLoss: 'hL',
      pumpHead: 'hp',
      power: 'P',
      efficiency: 'eta',
      density: 'rho',
      g: G,
    },
  },
);

function parallelDemo(
  id: string,
  title: string,
  use: string,
  values: { Q: number; D1: number; L1: number; D2: number; L2: number; C: number },
): ModuleDef {
  const { Q, D1, L1, D2, L2, C } = values;
  const Q1 = Q * parallelShare(D1, L1, D2, L2);
  return demo(id, title, use, {
    assumptions: [...ASSUME_HW, 'Both pipes have the same C and join the same two nodes.'],
    variables: [
      q('Q', 'Q', 'Total flow', 'm³/s', 1e-5, 1000, 0.001),
      q('D1', 'D₁', 'Diameter of pipe 1', 'm', 0.01, 10, 0.01),
      q('L1', 'L₁', 'Length of pipe 1', 'm', 1, 1e6, 1),
      q('D2', 'D₂', 'Diameter of pipe 2', 'm', 0.01, 10, 0.01),
      q('L2', 'L₂', 'Length of pipe 2', 'm', 1, 1e6, 1),
      q('C', 'C', 'Hazen–Williams C', undefined, 40, 160, 1),
      q('Q1', 'Q₁', 'Flow in pipe 1', 'm³/s', 0, 1000, 0.0001),
      q('Q2', 'Q₂', 'Flow in pipe 2', 'm³/s', 0, 1000, 0.0001),
      q('hf', 'h_f', 'Head loss from A to B', 'm', 0, 1e6, 0.01),
    ],
    ...rules(
      rule(
        'Equal losses split the flow',
        '{Q1} = {Q} ÷ (1 + ({L1} ÷ {L2} × ({D2} ÷ {D1})^4.87)^(1 ÷ 1.852))',
        (v) => v.Q1! - v.Q! * parallelShare(v.D1!, v.L1!, v.D2!, v.L2!),
        {
          Q1: [
            (v) => v.Q! * parallelShare(v.D1!, v.L1!, v.D2!, v.L2!),
            '{Q} ÷ (1 + ({L1} ÷ {L2} × ({D2} ÷ {D1})^4.87)^(1 ÷ 1.852))',
            'Set the two Hazen–Williams losses equal: Q₂ ÷ Q₁ = ((L₁ ÷ L₂)(D₂ ÷ D₁)^4.87)^(1 ÷ 1.852), and Q₁ + Q₂ = Q.',
          ],
          Q: [
            (v) => div(v.Q1!, parallelShare(v.D1!, v.L1!, v.D2!, v.L2!)),
            '{Q1} × (1 + ({L1} ÷ {L2} × ({D2} ÷ {D1})^4.87)^(1 ÷ 1.852))',
            'Undo the split.',
          ],
          L1: null,
          L2: null,
          D1: null,
          D2: null,
        },
      ),
      rule('Q₁ + Q₂ = Q', '{Q1} + {Q2} = {Q}', (v) => v.Q1! + v.Q2! - v.Q!, {
        Q2: [(v) => v.Q! - v.Q1!, '{Q} − {Q1}', 'What doesn’t take pipe 1 takes pipe 2.'],
        Q1: [(v) => v.Q! - v.Q2!, '{Q} − {Q2}', 'What doesn’t take pipe 2 takes pipe 1.'],
        Q: [(v) => v.Q1! + v.Q2!, '{Q1} + {Q2}', 'The two flows join again at B.'],
      }),
      hwRule('h_f in pipe 1', 'hf', 'Q1', 'L1', 'D1'),
      hwRule('h_f in pipe 2', 'hf', 'Q2', 'L2', 'D2'),
    ),
    example: { Q, D1, L1, D2, L2, C, Q1, Q2: Q - Q1, hf: hazenWilliams(L1, Q1, C, D1) },
    startWith: ['Q', 'D1', 'L1', 'D2', 'L2', 'C'],
    representation: {
      kind: 'fluidSystem',
      mode: 'parallel',
      flow: 'Q',
      pipes: [
        { diameter: 'D1', length: 'L1', flow: 'Q1' },
        { diameter: 'D2', length: 'L2', flow: 'Q2' },
      ],
      headLoss: 'hf',
      hazen: 'C',
      g: G,
    },
  });
}

const parallel = parallelDemo(
  'g.he-fluid-system-parallel',
  'Two pipes in parallel share the flow',
  'Use this for “0.15 m³/s splits between 0.3 m × 500 m and 0.2 m × 400 m pipes (C = 130). Find Q₁, Q₂ and h_f.”',
  { Q: 0.15, D1: 0.3, L1: 500, D2: 0.2, L2: 400, C: 130 },
);

const parallelNarrow = parallelDemo(
  'g.he-fluid-system-parallel-narrow',
  'A narrow bypass takes little of the flow',
  'Use this for “A 0.1 m bypass 300 m long runs beside 600 m of 0.4 m main carrying 0.2 m³/s. How much takes the bypass?”',
  { Q: 0.2, D1: 0.4, L1: 600, D2: 0.1, L2: 300, C: 120 },
);

function loopDemo(
  id: string,
  title: string,
  use: string,
  K: [number, number, number, number],
  Q: [number, number, number, number],
): ModuleDef {
  const hc = hardyCross(K.map((k, i) => ({ K: k, Q: Q[i]! })));
  const n = [1, 2, 3, 4];
  const sum = (f: (i: number) => string) => n.map(f).join(' + ');
  const residual = (v: Values) =>
    v.dQ! - hardyCross(n.map((i) => ({ K: v[`K${i}`]!, Q: v[`Q${i}`]! }))).dQ;
  return demo(id, title, use, {
    assumptions: [
      'h_f = KQ|Q| in each pipe (Darcy with a fixed f); clockwise flows are +.',
      'The assumed flows already balance at every node; one correction is the page.',
    ],
    variables: [
      ...n.map((i) =>
        q(`K${i}`, `K${'₁₂₃₄'[i - 1]}`, `Pipe ${i} constant`, undefined, 0.001, 1e7, 1),
      ),
      ...n.map((i) =>
        q(`Q${i}`, `Q${'₁₂₃₄'[i - 1]}`, `Assumed flow in pipe ${i}`, 'm³/s', -100, 100, 0.001),
      ),
      q('dQ', 'ΔQ', 'Correction', 'm³/s', -100, 100, 0.00001),
    ],
    ...rules(
      rule(
        'ΔQ = −Σh_f ÷ Σ(2h_f ÷ Q)',
        `{dQ} = −(${sum((i) => `{K${i}} × {Q${i}} × |{Q${i}}|`)}) ÷ (2 × (${sum((i) => `{K${i}} × |{Q${i}}|`)}))`,
        residual,
        {
          dQ: [
            (v) => -residual({ ...v, dQ: 0 }),
            `−(${sum((i) => `{K${i}} × {Q${i}} × |{Q${i}}|`)}) ÷ (2 × (${sum((i) => `{K${i}} × |{Q${i}}|`)}))`,
            'Round the loop the head losses must add to 0. Each h_f = KQ|Q| changes by 2K|Q| per unit of flow, so the correction is −Σh_f ÷ Σ2K|Q|.',
          ],
          ...Object.fromEntries(
            n.flatMap((i) => [
              [`K${i}`, null],
              [`Q${i}`, null],
            ]),
          ),
        },
      ),
    ),
    example: {
      ...Object.fromEntries(n.map((i) => [`K${i}`, K[i - 1]!])),
      ...Object.fromEntries(n.map((i) => [`Q${i}`, Q[i - 1]!])),
      dQ: hc.dQ,
    },
    startWith: [...n.map((i) => `K${i}`), ...n.map((i) => `Q${i}`)],
    representation: {
      kind: 'fluidSystem',
      mode: 'loop',
      pipes: [1, 2, 3, 4].map((i) => ({
        constant: `K${i}`,
        flow: `Q${i}`,
      })) as FluidLoopSpec['pipes'],
      correction: 'dQ',
      g: G,
    },
  });
}

const loop = loopDemo(
  'g.he-fluid-system-loop',
  'One Hardy Cross correction round a loop',
  'Use this for “K = 200, 300, 200, 400 and Q = +0.06, +0.03, −0.02, −0.04 m³/s round a loop. Find ΔQ.”',
  [200, 300, 200, 400],
  [0.06, 0.03, -0.02, -0.04],
);

const loopFlip = loopDemo(
  'g.he-fluid-system-loop-flip',
  'A correction that turns one pipe’s flow round',
  'Use this for “Round a loop of four pipes with K = 100 the guesses are +0.05, +0.006, −0.03, −0.005 m³/s. Which flow reverses?”',
  [100, 100, 100, 100],
  [0.05, 0.006, -0.03, -0.005],
);

/** Pipe sizes made (mm): the page's list, the picture lays the next one up. */
const SEWER_SIZES = [
  300, 375, 450, 525, 600, 675, 750, 825, 900, 1050, 1200, 1350, 1500, 1650, 1800, 1950, 2100, 2250,
  2400, 2700, 3000, 3300, 3600,
];

function fullDemo(
  id: string,
  title: string,
  use: string,
  values: { Q: number; n: number; S: number },
): ModuleDef {
  const { Q, n, S } = values;
  const D = 1000 * manningFull(Q, n, S);
  return demo(id, title, use, {
    assumptions: [
      'The pipe flows full but not under pressure (Manning, SI).',
      'Round up to the next size made; full, the speed should stay above about 0.9 m/s so solids keep moving.',
    ],
    variables: [
      q('Q', 'Q', 'Design flow', 'm³/s', 1e-6, 1e4, 0.001),
      q('n', 'n', 'Manning n', undefined, 0.001, 1, 0.001),
      q('S', 'S', 'Slope', undefined, 0.0001, 1, 0.0001),
      q('D', 'D', 'Diameter needed', 'mm', 1, 1e5, 1, { units: ['mm'] }),
    ],
    ...rules(
      rule(
        'D = (3.208Qn ÷ √S)^(3/8)',
        '{D} = 1000 × (3.208 × {Q} × {n} ÷ √({S}))^(3/8)',
        (v) => v.D! - 1000 * manningFull(v.Q!, v.n!, v.S!),
        {
          D: [
            (v) => 1000 * manningFull(v.Q!, v.n!, v.S!),
            '1000 × (3.208 × {Q} × {n} ÷ √({S}))^(3/8)',
            'Manning’s equation for a round pipe flowing full, solved for D (× 1000 for mm).',
          ],
          Q: [
            (v) => ((v.D! / 1000) ** (8 / 3) * Math.sqrt(v.S!)) / (3.208 * v.n!),
            '({D} ÷ 1000)^(8/3) × √({S}) ÷ (3.208 × {n})',
            'Raise D to the 8/3 power and solve for Q.',
          ],
          n: [
            (v) => ((v.D! / 1000) ** (8 / 3) * Math.sqrt(v.S!)) / (3.208 * v.Q!),
            '({D} ÷ 1000)^(8/3) × √({S}) ÷ (3.208 × {Q})',
            'Raise D to the 8/3 power and solve for n.',
          ],
          S: [
            (v) => ((3.208 * v.Q! * v.n!) / (v.D! / 1000) ** (8 / 3)) ** 2,
            '(3.208 × {Q} × {n} ÷ ({D} ÷ 1000)^(8/3))²',
            'Raise D to the 8/3 power, solve for √S, then square.',
          ],
        },
      ),
    ),
    example: { Q, n, S, D },
    startWith: ['Q', 'n', 'S'],
    unitSystems: ['metric'],
    representation: {
      kind: 'fluidSystem',
      mode: 'full',
      flow: 'Q',
      manning: 'n',
      slope: 'S',
      diameter: 'D',
      sizes: SEWER_SIZES,
      g: G,
    },
  });
}

const full = fullDemo(
  'g.he-fluid-system-full',
  'Sizing a storm sewer flowing full',
  'Use this for “Size a concrete sewer (n = 0.013) on a 0.005 slope for 1.667 m³/s.”',
  { Q: 1.667, n: 0.013, S: 0.005 },
);

const fullSlow = fullDemo(
  'g.he-fluid-system-full-slow',
  'A small flow on a flat slope: too slow',
  'Use this for “Size a sewer for 0.05 m³/s on a 0.001 slope (n = 0.013). Will it keep itself clean?”',
  { Q: 0.05, n: 0.013, S: 0.001 },
);

// ── Boundary layers and models (fluid-mechanics#5, #3) ──

const reynoldsL = rule(
  'Re_L = VL ÷ ν',
  '{Re} = {V} × {L} ÷ {nu}',
  (v) => v.Re! - (v.V! * v.L!) / v.nu!,
  {
    Re: [
      (v) => div(v.V! * v.L!, v.nu!),
      '{V} × {L} ÷ {nu}',
      'Reynolds number at the plate’s end: speed times length over ν.',
    ],
    V: [(v) => div(v.Re! * v.nu!, v.L!), '{Re} × {nu} ÷ {L}', 'Multiply Re by ν and divide by L.'],
    L: [(v) => div(v.Re! * v.nu!, v.V!), '{Re} × {nu} ÷ {V}', 'Multiply Re by ν and divide by V.'],
    nu: [(v) => div(v.V! * v.L!, v.Re!), '{V} × {L} ÷ {Re}', 'Divide VL by Re.'],
  },
);

const plate = (() => {
  const [V, L, nu, rho, b] = [5, 1, 1.5e-5, 1.2, 0.5];
  const Re = (V * L) / nu;
  const Cf = 1.328 / Math.sqrt(Re);
  const laminar: Rule = {
    relation: {
      id: 'Re_L < 5 × 10⁵',
      constraint: true,
      display: '{Re} is under 5 × 10⁵',
      vars: ['Re'],
      residual: (v) => (v.Re! < 5e5 ? 0 : 1),
      solve: {},
      message: (v) =>
        v.Re! < 5e5
          ? undefined
          : 'Past Re = 5 × 10⁵ the layer turns turbulent: use the turbulent page.',
    },
    steps: {},
  };
  return demo(
    'g.he-fluid-system-plate',
    'A laminar boundary layer on a flat plate',
    'Use this for “Air at 5 m/s flows along a 1 m plate 0.5 m wide. Find δ at the end and the drag on one side.”',
    {
      assumptions: [
        'A smooth flat plate along the stream, no pressure change along it (Blasius).',
        'Laminar all the way: Re_L under 5 × 10⁵. Drag on one side.',
      ],
      variables: [
        q('V', 'V', 'Stream speed', 'm/s', 0.01, 300, 0.1),
        q('L', 'L', 'Plate length', 'm', 0.001, 100, 0.01),
        q('nu', 'ν', 'Kinematic viscosity', 'm²/s', 1e-8, 1e-2, 1e-8, { scientific: true }),
        q('rho', 'ρ', 'Density', 'kg/m³', 0.01, 20000, 0.01),
        q('b', 'b', 'Plate width', 'm', 0.001, 100, 0.01),
        q('Re', 'Re_L', 'Reynolds number at L', undefined, 1, 1e10, 1),
        q('delta', 'δ', 'Layer thickness at L', 'm', 0, 10, 0.0001, {
          units: ['mm', 'm'],
          shownIn: 'mm',
        }),
        q('Cf', 'C_f', 'Drag coefficient', undefined, 0, 1, 0.00001),
        q('FD', 'F_D', 'Drag force', 'N', 0, 1e9, 0.0001),
      ],
      ...rules(
        laminar,
        reynoldsL,
        rule(
          'δ = 5L ÷ √Re_L',
          '{delta} = 5 × {L} ÷ √{Re}',
          (v) => v.delta! - (5 * v.L!) / Math.sqrt(v.Re!),
          {
            delta: [
              (v) => (5 * v.L!) / Math.sqrt(v.Re!),
              '5 × {L} ÷ √{Re}',
              'Blasius: the layer is 5x ÷ √Re_x thick, so it grows as √x.',
            ],
            L: [(v) => div(v.delta! * Math.sqrt(v.Re!), 5), '{delta} × √{Re} ÷ 5', 'Solve for L.'],
            Re: [
              (v) => (v.delta! > 0 ? ((5 * v.L!) / v.delta!) ** 2 : undefined),
              '(5 × {L} ÷ {delta})²',
              'Solve for √Re, then square.',
            ],
          },
        ),
        rule(
          'C_f = 1.328 ÷ √Re_L',
          '{Cf} = 1.328 ÷ √{Re}',
          (v) => v.Cf! - 1.328 / Math.sqrt(v.Re!),
          {
            Cf: [
              (v) => 1.328 / Math.sqrt(v.Re!),
              '1.328 ÷ √{Re}',
              'Blasius’s skin friction over the whole plate.',
            ],
            Re: [
              (v) => (v.Cf! > 0 ? (1.328 / v.Cf!) ** 2 : undefined),
              '(1.328 ÷ {Cf})²',
              'Solve for √Re, then square.',
            ],
          },
        ),
        rule(
          'F_D = ½ρV²C_f bL',
          '{FD} = ½ × {rho} × {V}² × {Cf} × {b} × {L}',
          (v) => v.FD! - 0.5 * v.rho! * v.V! ** 2 * v.Cf! * v.b! * v.L!,
          {
            FD: [
              (v) => 0.5 * v.rho! * v.V! ** 2 * v.Cf! * v.b! * v.L!,
              '½ × {rho} × {V}² × {Cf} × {b} × {L}',
              'Drag is C_f times the dynamic pressure ½ρV² times the wetted area bL.',
            ],
            rho: [
              (v) => div(2 * v.FD!, v.V! ** 2 * v.Cf! * v.b! * v.L!),
              '2 × {FD} ÷ ({V}² × {Cf} × {b} × {L})',
              'Solve for ρ.',
            ],
            Cf: [
              (v) => div(2 * v.FD!, v.rho! * v.V! ** 2 * v.b! * v.L!),
              '2 × {FD} ÷ ({rho} × {V}² × {b} × {L})',
              'Solve for C_f.',
            ],
            b: [
              (v) => div(2 * v.FD!, v.rho! * v.V! ** 2 * v.Cf! * v.L!),
              '2 × {FD} ÷ ({rho} × {V}² × {Cf} × {L})',
              'Solve for b.',
            ],
            V: null,
            L: null,
          },
        ),
      ),
      example: {
        V,
        L,
        nu,
        rho,
        b,
        Re,
        delta: (5 * L) / Math.sqrt(Re),
        Cf,
        FD: 0.5 * rho * V * V * Cf * b * L,
      },
      startWith: ['V', 'L', 'nu', 'rho', 'b'],
      pictureLabels: ['rho', 'b', 'Cf', 'FD'],
      representation: {
        kind: 'fluidSystem',
        mode: 'plate',
        speed: 'V',
        length: 'L',
        viscosity: 'nu',
        thickness: 'delta',
        reynolds: 'Re',
        g: G,
      },
    },
  );
})();

const plateTurbulent = (() => {
  const [V, L, nu] = [3, 2, 1.0e-6];
  const Re = (V * L) / nu;
  return demo(
    'g.he-fluid-system-plate-turbulent',
    'A turbulent layer on a long plate in water',
    'Use this for “Water at 3 m/s flows along a 2 m plate. How thick is the turbulent layer at the end?”',
    {
      assumptions: [
        'Turbulent from the leading edge (the 1/7-power fit), smooth plate, no pressure change along it.',
      ],
      variables: [
        q('V', 'V', 'Stream speed', 'm/s', 0.01, 300, 0.1),
        q('L', 'L', 'Plate length', 'm', 0.001, 1000, 0.01),
        q('nu', 'ν', 'Kinematic viscosity', 'm²/s', 1e-8, 1e-2, 1e-8, { scientific: true }),
        q('Re', 'Re_L', 'Reynolds number at L', undefined, 1, 1e11, 1),
        q('delta', 'δ', 'Layer thickness at L', 'm', 0, 100, 0.0001, {
          units: ['mm', 'm'],
          shownIn: 'mm',
        }),
        q('Cf', 'C_f', 'Drag coefficient', undefined, 0, 1, 0.00001),
      ],
      ...rules(
        reynoldsL,
        rule(
          'δ = 0.37L ÷ Re_L^0.2',
          '{delta} = 0.37 × {L} ÷ {Re}^0.2',
          (v) => v.delta! - (0.37 * v.L!) / v.Re! ** 0.2,
          {
            delta: [
              (v) => (0.37 * v.L!) / v.Re! ** 0.2,
              '0.37 × {L} ÷ {Re}^0.2',
              'The turbulent fit: δ = 0.37x ÷ Re_x^0.2, so it grows as x^0.8, faster than a laminar layer.',
            ],
            L: [
              (v) => (v.delta! * v.Re! ** 0.2) / 0.37,
              '{delta} × {Re}^0.2 ÷ 0.37',
              'Solve for L.',
            ],
            Re: [
              (v) => (v.delta! > 0 ? ((0.37 * v.L!) / v.delta!) ** 5 : undefined),
              '(0.37 × {L} ÷ {delta})^5',
              'Solve for Re^0.2, then raise to the 5th power.',
            ],
          },
        ),
        rule(
          'C_f = 0.074 ÷ Re_L^0.2',
          '{Cf} = 0.074 ÷ {Re}^0.2',
          (v) => v.Cf! - 0.074 / v.Re! ** 0.2,
          {
            Cf: [
              (v) => 0.074 / v.Re! ** 0.2,
              '0.074 ÷ {Re}^0.2',
              'The turbulent skin friction over the whole plate.',
            ],
            Re: [
              (v) => (v.Cf! > 0 ? (0.074 / v.Cf!) ** 5 : undefined),
              '(0.074 ÷ {Cf})^5',
              'Solve for Re^0.2, then raise to the 5th power.',
            ],
          },
        ),
      ),
      example: { V, L, nu, Re, delta: (0.37 * L) / Re ** 0.2, Cf: 0.074 / Re ** 0.2 },
      startWith: ['V', 'L', 'nu'],
      pictureLabels: ['Cf'],
      representation: {
        kind: 'fluidSystem',
        mode: 'plate',
        speed: 'V',
        length: 'L',
        viscosity: 'nu',
        thickness: 'delta',
        reynolds: 'Re',
        turbulent: true,
        g: G,
      },
    },
  );
})();

const modelReynolds = (() => {
  const [Vp, Lp, Lm, nuP, nuM] = [30, 4, 1, 1.5e-5, 1.5e-5];
  return demo(
    'g.he-fluid-system-model',
    'A car and its model matched by Reynolds number',
    'Use this for “A 1:4 model of a car that drives at 30 m/s is tested in the same air. How fast must the air be?”',
    {
      assumptions: [
        'The model is geometrically similar; viscous drag rules, so Reynolds numbers are matched.',
      ],
      variables: [
        q('Vp', 'V_p', 'Prototype speed', 'm/s', 0.01, 1000, 0.1),
        q('Lp', 'L_p', 'Prototype length', 'm', 0.001, 1000, 0.01),
        q('Lm', 'L_m', 'Model length', 'm', 0.001, 1000, 0.01),
        q('nuP', 'ν_p', 'Prototype fluid’s ν', 'm²/s', 1e-8, 1e-2, 1e-8, { scientific: true }),
        q('nuM', 'ν_m', 'Model fluid’s ν', 'm²/s', 1e-8, 1e-2, 1e-8, { scientific: true }),
        q('Vm', 'V_m', 'Model speed', 'm/s', 0.01, 1e5, 0.1),
        q('Re', 'Re', 'Reynolds number', undefined, 1, 1e12, 1),
      ],
      ...rules(
        rule(
          'Re_p = V_pL_p ÷ ν_p',
          '{Re} = {Vp} × {Lp} ÷ {nuP}',
          (v) => v.Re! - (v.Vp! * v.Lp!) / v.nuP!,
          {
            Re: [
              (v) => div(v.Vp! * v.Lp!, v.nuP!),
              '{Vp} × {Lp} ÷ {nuP}',
              'The prototype’s Reynolds number.',
            ],
            Vp: [(v) => div(v.Re! * v.nuP!, v.Lp!), '{Re} × {nuP} ÷ {Lp}', 'Solve for V_p.'],
            Lp: [(v) => div(v.Re! * v.nuP!, v.Vp!), '{Re} × {nuP} ÷ {Vp}', 'Solve for L_p.'],
            nuP: [(v) => div(v.Vp! * v.Lp!, v.Re!), '{Vp} × {Lp} ÷ {Re}', 'Solve for ν_p.'],
          },
        ),
        rule(
          'V_mL_m ÷ ν_m = Re',
          '{Vm} × {Lm} ÷ {nuM} = {Re}',
          (v) => (v.Vm! * v.Lm!) / v.nuM! - v.Re!,
          {
            Vm: [
              (v) => div(v.Re! * v.nuM!, v.Lm!),
              '{Re} × {nuM} ÷ {Lm}',
              'The model must reach the same Re: V_m = Re × ν_m ÷ L_m.',
            ],
            Lm: [(v) => div(v.Re! * v.nuM!, v.Vm!), '{Re} × {nuM} ÷ {Vm}', 'Solve for L_m.'],
            nuM: [(v) => div(v.Vm! * v.Lm!, v.Re!), '{Vm} × {Lm} ÷ {Re}', 'Solve for ν_m.'],
            Re: [
              (v) => div(v.Vm! * v.Lm!, v.nuM!),
              '{Vm} × {Lm} ÷ {nuM}',
              'The model’s Reynolds number.',
            ],
          },
        ),
      ),
      example: { Vp, Lp, Lm, nuP, nuM, Vm: (Vp * Lp * nuM) / (Lm * nuP), Re: (Vp * Lp) / nuP },
      startWith: ['Vp', 'Lp', 'Lm', 'nuP', 'nuM'],
      representation: {
        kind: 'fluidSystem',
        mode: 'model',
        rule: 'reynolds',
        protoSpeed: 'Vp',
        protoLength: 'Lp',
        modelLength: 'Lm',
        modelSpeed: 'Vm',
        protoViscosity: 'nuP',
        modelViscosity: 'nuM',
        reynolds: 'Re',
        body: 'car',
        g: G,
      },
    },
  );
})();

const modelFroude = (() => {
  const [Vp, Lp, Lm] = [10, 100, 4];
  return demo(
    'g.he-fluid-system-model-froude',
    'A ship and its model matched by Froude number',
    'Use this for “A 100 m ship sails at 10 m/s. How fast should a 4 m model (1:25) be towed?”',
    {
      assumptions: [
        'Waves rule the drag, so Froude numbers V ÷ √(gL) are matched; g is the same for both.',
      ],
      variables: [
        q('Vp', 'V_p', 'Ship speed', 'm/s', 0.01, 1000, 0.1),
        q('Lp', 'L_p', 'Ship length', 'm', 0.01, 1000, 0.1),
        q('Lm', 'L_m', 'Model length', 'm', 0.001, 1000, 0.01),
        q('Vm', 'V_m', 'Model speed', 'm/s', 0, 1000, 0.01),
      ],
      ...rules(
        rule(
          'V_m = V_p√(L_m ÷ L_p)',
          '{Vm} = {Vp} × √({Lm} ÷ {Lp})',
          (v) => v.Vm! - v.Vp! * Math.sqrt(v.Lm! / v.Lp!),
          {
            Vm: [
              (v) => v.Vp! * Math.sqrt(v.Lm! / v.Lp!),
              '{Vp} × √({Lm} ÷ {Lp})',
              'Equal V ÷ √(gL): the speed scales as the square root of the length.',
            ],
            Vp: [
              (v) => div(v.Vm!, Math.sqrt(v.Lm! / v.Lp!)),
              '{Vm} ÷ √({Lm} ÷ {Lp})',
              'Solve for V_p.',
            ],
            Lm: [
              (v) => div(v.Lp! * v.Vm! ** 2, v.Vp! ** 2),
              '{Lp} × ({Vm} ÷ {Vp})²',
              'Square the speed ratio.',
            ],
            Lp: [
              (v) => div(v.Lm! * v.Vp! ** 2, v.Vm! ** 2),
              '{Lm} × ({Vp} ÷ {Vm})²',
              'Square the speed ratio.',
            ],
          },
        ),
      ),
      example: { Vp, Lp, Lm, Vm: Vp * Math.sqrt(Lm / Lp) },
      startWith: ['Vp', 'Lp', 'Lm'],
      representation: {
        kind: 'fluidSystem',
        mode: 'model',
        rule: 'froude',
        protoSpeed: 'Vp',
        protoLength: 'Lp',
        modelLength: 'Lm',
        modelSpeed: 'Vm',
        body: 'ship',
        g: G,
      },
    },
  );
})();

export const HE1G_GALLERY_MODULES: ModuleDef[] = [
  tank,
  tankDeep,
  manometer,
  manometerAir,
  gate,
  gateDeep,
  buoyancy,
  buoyancyIce,
  venturi,
  venturiGentle,
  pitot,
  pitotWater,
  jet,
  jetBucket,
  pipeLoss,
  pipeNetwork,
  pipeHazen,
  pipePump,
  parallel,
  parallelNarrow,
  loop,
  loopFlip,
  full,
  fullSlow,
  plate,
  plateTurbulent,
  modelReynolds,
  modelFroude,
];

export const HE1G_GALLERY_LAYOUTS: LayoutDef[] = [];
