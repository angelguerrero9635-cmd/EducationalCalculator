/**
 * College gallery demos, round 1, group G (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC6 `fluidSystem`: the fluid-mechanics pages (docs/plans/he.mechanical.md, topic 11) and the
 * hydraulics pipe-network and storm-sewer pages (docs/plans/he.aero-civil-chemical.md, topic 9).
 * g = 9.81 m/s², as the engineering pages have it; the picture takes it from `g`.
 */
import { atLeast } from './helpers';
import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';
import type { FluidManometerSpec, FluidPitotSpec } from './typesHe1g';
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
  parts: Record<string, [Solve, string, string] | null>,
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
];

export const HE1G_GALLERY_LAYOUTS: LayoutDef[] = [];
