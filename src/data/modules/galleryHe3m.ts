/**
 * College gallery demos, round 3, group M (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC75: the `aquifer` kind (EG-P17): section, head and well.
 * HC76: the `refraction` kind (EG-P20): refraction, reflection and gpr.
 * HC77: the GIS options of `coordinatePlane` (EG-P26): shoelace, buffer, center.
 * HC78: the `projection` kind and its card figure (EG-P28).
 */
import { thiemRate } from '@/components/module/reps/aquiferMath';
import {
  bufferArea,
  meanCenter,
  shoelaceArea,
  sidesCross,
  standardDistance,
} from '@/components/module/reps/gisMath';
import { latitudeAt, parallelY } from '@/components/module/reps/projectionMath';
import {
  criticalAngle,
  crossoverOf,
  depthFromCrossover,
  interceptTime,
  radarDepth,
  radarSpeed,
  reflectionTime,
} from '@/components/module/reps/refractionMath';
import type { Relation, VariableDef, Values } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';
import type { ProjectionCard, ProjectionName } from './typesHe3m';

/** A relation and its step text, built together so a demo lists both from one place. */
interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}

const rules = (...rs: Rule[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

const st = (expr: string, how: string): StepText => ({ expr, how });
const div = (a: number, b: number) => (b === 0 || !Number.isFinite(b) ? undefined : a / b);
const pos = (x: number | undefined) =>
  x !== undefined && x > 0 && Number.isFinite(x) ? x : undefined;

/** A value with a unit that never changes (the formula is written in it). */
const quantity = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  step: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({
  id,
  symbol,
  name,
  ...(unit ? { unit, units: [unit] } : {}),
  min,
  max,
  step,
  ...more,
});

/** a = b × c, solved for each. */
const product = (
  id: string,
  a: string,
  b: string,
  c: string,
  display: string,
  how: Record<'a' | 'b' | 'c', string>,
): Rule => ({
  relation: {
    id,
    display,
    vars: [a, b, c],
    residual: (v) => v[a]! - v[b]! * v[c]!,
    solve: {
      [a]: (v) => v[b]! * v[c]!,
      [b]: (v) => div(v[a]!, v[c]!),
      [c]: (v) => div(v[a]!, v[b]!),
    },
  },
  steps: {
    [a]: st(`{${b}} × {${c}}`, how.a),
    [b]: st(`{${a}} ÷ {${c}}`, how.b),
    [c]: st(`{${a}} ÷ {${b}}`, how.c),
  },
});

/** A page limit, checked only: `ok` must hold, else `why` is the reason. */
const limit = (id: string, display: string, ok: (v: Values) => boolean, why: string): Rule => ({
  relation: {
    id,
    display,
    constraint: true,
    vars: [...new Set([...display.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!))],
    residual: (v: Values) => (ok(v) ? 0 : 1),
    solve: {},
    message: (v: Values) => (ok(v) ? undefined : why),
  },
  steps: {},
});

// ─── HC75 aquifer (EG-P17) ───────────────────────────────────────────────────

/** i = Δh ÷ L. */
const gradientRule = product('i = Δh ÷ L', 'dh', 'i', 'L', '{i} = {dh} ÷ {L}', {
  a: 'The head drop is the gradient times the flow length.',
  b: 'Divide the head drop by the length it falls over.',
  c: 'Divide the head drop by the gradient.',
});

/** Q = KAi. */
const darcyRule: Rule = {
  relation: {
    id: 'Q = KAi',
    display: '{Q} = {K} × {A} × {i}',
    vars: ['Q', 'K', 'A', 'i'],
    residual: (v) => v.Q! - v.K! * v.A! * v.i!,
    solve: {
      Q: (v) => v.K! * v.A! * v.i!,
      K: (v) => div(v.Q!, v.A! * v.i!),
      A: (v) => div(v.Q!, v.K! * v.i!),
      i: (v) => div(v.Q!, v.K! * v.A!),
    },
  },
  steps: {
    Q: st('{K} × {A} × {i}', 'Darcy’s law: conductivity times the area times the gradient.'),
    K: st('{Q} ÷ ({A} × {i})', 'Divide the flow by the area times the gradient.'),
    A: st('{Q} ÷ ({K} × {i})', 'Divide the flow by the conductivity times the gradient.'),
    i: st('{Q} ÷ ({K} × {A})', 'Divide the flow by the conductivity times the area.'),
  },
};

/** q = Q ÷ A. */
const fluxRule = product('Q = qA', 'Q', 'q', 'A', '{q} = {Q} ÷ {A}', {
  a: 'The flow is the flux times the area it crosses.',
  b: 'Divide the flow by the area it crosses.',
  c: 'Divide the flow by the flux.',
});

/** v = q ÷ n. */
const seepageRule = product('q = nv', 'q', 'n', 'v', '{v} = {q} ÷ {n}', {
  a: 'The flux is the porosity times the seepage speed.',
  b: 'Divide the flux by the seepage speed.',
  c: 'Divide the flux by the porosity: water moves only through the pores.',
});

/** t = L ÷ v. */
const travelRule = product('L = vt', 'L', 'v', 't', '{t} = {L} ÷ {v}', {
  a: 'The length is the seepage speed times the travel time.',
  b: 'Divide the length by the travel time.',
  c: 'Divide the length by the seepage speed.',
});

const DARCY_VARS = [
  quantity('K', 'K', 'Hydraulic conductivity', 'm/day', 1e-6, 1000, 0.000001),
  quantity('dh', 'Δh', 'Head drop', 'm', 0.01, 100, 0.01),
  quantity('L', 'L', 'Flow length', 'm', 1, 10000, 0.1),
  quantity('i', 'i', 'Hydraulic gradient', undefined, 1e-6, 100, 0.0001),
  quantity('A', 'A', 'Area', 'm²', 0.01, 1e6, 0.01),
  quantity('Q', 'Q', 'Discharge', 'm³/day', 1e-12, 1e11, 0.0001),
  quantity('q', 'q', 'Darcy flux', 'm/day', 1e-10, 1e5, 0.0001),
  quantity('n', 'n', 'Porosity', undefined, 0.01, 0.5, 0.01),
  quantity('v', 'v', 'Seepage velocity', 'm/day', 1e-8, 1e7, 0.0001),
  quantity('t', 't', 'Travel time', 'days', 1e-9, 1e12, 0.1),
];

const darcyExample = (K: number, dh: number, L: number, A: number, n: number) => {
  const i = dh / L;
  const Q = K * A * i;
  const q = Q / A;
  const v = q / n;
  return { K, dh, L, i, A, Q, q, n, v, t: L / v };
};

const darcyDemo = (
  id: string,
  title: string,
  ex: ReturnType<typeof darcyExample>,
  more: Partial<ModuleDef> & { confined?: boolean } = {},
): ModuleDef => {
  const { confined, ...rest } = more;
  return {
    id,
    title,
    use: 'Use this for flow through an aquifer, the seepage speed and the travel time.',
    assumptions: [
      'Laminar flow through connected pores; water flows from high head to low.',
      'The seepage velocity is faster than q because water moves only through the pores.',
    ],
    variables: DARCY_VARS,
    ...rules(gradientRule, darcyRule, fluxRule, seepageRule, travelRule),
    example: ex,
    startWith: ['K', 'dh', 'L', 'A', 'n'],
    representation: {
      kind: 'aquifer',
      mode: 'section',
      drop: 'dh',
      length: 'L',
      conductivity: 'K',
      area: 'A',
      gradient: 'i',
      discharge: 'Q',
      flux: 'q',
      porosity: 'n',
      velocity: 'v',
      time: 't',
      ...(confined ? { confined: true } : {}),
    },
    ...rest,
  };
};

/** hydrology#2 main: 10 m/day, 2 m over 400 m, 1,000 m², n 0.25. */
const aquiferSection = darcyDemo(
  'g.he-aquifer-section',
  'Darcy’s law: flow between two wells',
  darcyExample(10, 2, 400, 1000, 0.25),
);

/** The same law in a confined aquifer, its potentiometric surface over a clay layer. */
const aquiferConfined = darcyDemo(
  'g.he-aquifer-section-confined',
  'Darcy’s law in a confined aquifer',
  darcyExample(25, 1.5, 1200, 3000, 0.3),
  { confined: true },
);

/** A steep gradient beside a dam: 5 m over 20 m, heights drawn true. */
const aquiferSteep = darcyDemo(
  'g.he-aquifer-section-steep',
  'A steep gradient: seepage under a levee',
  darcyExample(2, 5, 20, 40, 0.3),
);

/** ψ = p ÷ γ (γ = 9.81 kN/m³). */
const pressureRule: Rule = {
  relation: {
    id: 'ψ = p ÷ γ',
    display: '{psi} = {p} ÷ 9.81',
    vars: ['psi', 'p'],
    residual: (v) => 9.81 * v.psi! - v.p!,
    solve: { psi: (v) => v.p! / 9.81, p: (v) => 9.81 * v.psi! },
  },
  steps: {
    psi: st('{p} ÷ 9.81', 'Divide the pressure by water’s unit weight, 9.81 kN/m³.'),
    p: st('9.81 × {psi}', 'Multiply the pressure head by water’s unit weight, 9.81 kN/m³.'),
  },
};

/** h = z + ψ. */
const headRule: Rule = {
  relation: {
    id: 'h = z + ψ',
    display: '{h} = {z} + {psi}',
    vars: ['h', 'z', 'psi'],
    residual: (v) => v.h! - v.z! - v.psi!,
    solve: {
      h: (v) => v.z! + v.psi!,
      z: (v) => v.h! - v.psi!,
      psi: (v) => v.h! - v.z!,
    },
  },
  steps: {
    h: st('{z} + {psi}', 'Add the elevation and the pressure head.'),
    z: st('{h} − {psi}', 'Take the pressure head from the total head.'),
    psi: st('{h} − {z}', 'Take the elevation from the total head.'),
  },
};

const headDemo = (id: string, title: string, z: number, p: number): ModuleDef => ({
  id,
  title,
  use: 'Use this for the hydraulic head from elevation and pressure.',
  assumptions: [
    'Heads are measured from one datum (often sea level); water’s unit weight is 9.81 kN/m³.',
    'Water in a piezometer rises to the total head h = z + ψ.',
  ],
  variables: [
    quantity('z', 'z', 'Elevation', 'm', -1e4, 1e4, 0.01),
    quantity('p', 'p', 'Pressure', 'kPa', -100, 1e5, 0.01),
    quantity('psi', 'ψ', 'Pressure head', 'm', -10, 1e4, 0.01),
    quantity('h', 'h', 'Total head', 'm', -1e4, 2e4, 0.01),
  ],
  ...rules(pressureRule, headRule),
  example: { z, p, psi: p / 9.81, h: z + p / 9.81 },
  startWith: ['z', 'p'],
  representation: {
    kind: 'aquifer',
    mode: 'head',
    elevation: 'z',
    pressure: 'p',
    pressureHead: 'psi',
    head: 'h',
    weight: 9.81,
  },
});

/** hydrology#2~head: 120 m, 98.1 kPa → 10.0 m, h = 130 m. */
const aquiferHead = headDemo('g.he-aquifer-head', 'Hydraulic head in a piezometer', 120, 98.1);
/** A deep screen near the datum under a large pressure: the pressure head is most of h. */
const aquiferHeadDeep = headDemo(
  'g.he-aquifer-head-deep',
  'A deep screen: most of the head is pressure',
  4,
  245.25,
);

/** Q = 2πKb(h₂ − h₁) ÷ ln(r₂ ÷ r₁). */
const thiemRule: Rule = {
  relation: {
    id: 'Q = 2πKb(h₂ − h₁) ÷ ln(r₂ ÷ r₁)',
    display: '{Q} = 2π × {K} × {b} × ({h2} − {h1}) ÷ ln({r2} ÷ {r1})',
    vars: ['Q', 'K', 'b', 'h1', 'h2', 'r1', 'r2'],
    residual: (v) => v.Q! - thiemRate(v.K!, v.b!, v.h1!, v.h2!, v.r1!, v.r2!),
    solve: {
      Q: (v) => (v.r2! > v.r1! ? thiemRate(v.K!, v.b!, v.h1!, v.h2!, v.r1!, v.r2!) : undefined),
      K: (v) => pos(div(v.Q! * Math.log(v.r2! / v.r1!), 2 * Math.PI * v.b! * (v.h2! - v.h1!))),
      b: (v) => pos(div(v.Q! * Math.log(v.r2! / v.r1!), 2 * Math.PI * v.K! * (v.h2! - v.h1!))),
    },
  },
  steps: {
    Q: st(
      '2π × {K} × {b} × ({h2} − {h1}) ÷ ln({r2} ÷ {r1})',
      'Thiem: the head difference times 2πKb, divided by ln of the radius ratio.',
    ),
    K: st(
      '{Q} × ln({r2} ÷ {r1}) ÷ (2π × {b} × ({h2} − {h1}))',
      'Multiply the rate by ln of the radius ratio, then divide by 2πb times the head difference.',
    ),
    b: st(
      '{Q} × ln({r2} ÷ {r1}) ÷ (2π × {K} × ({h2} − {h1}))',
      'Multiply the rate by ln of the radius ratio, then divide by 2πK times the head difference.',
    ),
  },
};

const thiemDemo = (
  id: string,
  title: string,
  K: number,
  b: number,
  h1: number,
  h2: number,
  r1: number,
  r2: number,
): ModuleDef => ({
  id,
  title,
  use: 'Use this for a well’s yield from two observation wells (Thiem).',
  assumptions: [
    'A confined aquifer pumped steadily for a long time; heads rise toward the far well.',
    'The aquifer is even in thickness and conductivity, and the well goes through all of it.',
  ],
  variables: [
    quantity('K', 'K', 'Hydraulic conductivity', 'm/day', 1e-6, 1000, 0.000001),
    quantity('b', 'b', 'Aquifer thickness', 'm', 0.1, 1000, 0.01),
    quantity('h1', 'h₁', 'Head at the near well', 'm', -1e4, 1e4, 0.01),
    quantity('h2', 'h₂', 'Head at the far well', 'm', -1e4, 1e4, 0.01),
    quantity('r1', 'r₁', 'Radius of the near well', 'm', 0.01, 1e5, 0.01),
    quantity('r2', 'r₂', 'Radius of the far well', 'm', 0.01, 1e5, 0.01),
    quantity('Q', 'Q', 'Pumping rate', 'm³/day', 0.0001, 1e7, 0.1),
  ],
  ...rules(
    thiemRule,
    limit(
      'r₂ > r₁',
      '{r2} > {r1}',
      (v) => v.r2! > v.r1!,
      'The far well must be farther out: r₂ > r₁.',
    ),
    limit(
      'h₂ − h₁ ≥ 0.01',
      '{h2} − {h1} ≥ 0.01',
      (v) => v.h2! - v.h1! >= 0.01 - 1e-9,
      'Heads rise toward the far well: h₂ is at least 0.01 m above h₁.',
    ),
  ),
  example: { K, b, h1, h2, r1, r2, Q: thiemRate(K, b, h1, h2, r1, r2) },
  startWith: ['K', 'b', 'h1', 'h2', 'r1', 'r2'],
  representation: {
    kind: 'aquifer',
    mode: 'well',
    thickness: 'b',
    r1: 'r1',
    r2: 'r2',
    h1: 'h1',
    h2: 'h2',
    rate: 'Q',
    conductivity: 'K',
  },
});

/** hydrology#2~thiem: 20 m/day, 15 m, 1.2 m between 10 and 100 m → 982 m³/day. */
const aquiferWell = thiemDemo(
  'g.he-aquifer-well',
  'A well’s yield from two observation wells',
  20,
  15,
  40,
  41.2,
  10,
  100,
);
/** Wells far apart round a thick aquifer: a wide, shallow cone. */
const aquiferWellWide = thiemDemo(
  'g.he-aquifer-well-wide',
  'A wide cone: observation wells 2 m and 300 m out',
  5,
  30,
  30.5,
  33,
  2,
  300,
);

const AQUIFER_DEMOS: ModuleDef[] = [
  aquiferSection,
  aquiferConfined,
  aquiferSteep,
  aquiferHead,
  aquiferHeadDeep,
  aquiferWell,
  aquiferWellWide,
];

// ─── HC76 refraction (EG-P20) ────────────────────────────────────────────────

/** sin i_c = v₁ ÷ v₂. */
const criticalRule: Rule = {
  relation: {
    id: 'sin i_c = v₁ ÷ v₂',
    display: 'sin({ic}°) = {v1} ÷ {v2}',
    vars: ['ic', 'v1', 'v2'],
    residual: (v) => v.ic! - criticalAngle(v.v1!, v.v2!),
    solve: { ic: (v) => (v.v2! > v.v1! ? criticalAngle(v.v1!, v.v2!) : undefined) },
  },
  steps: {
    ic: st(
      'arcsin({v1} ÷ {v2})',
      'The ray bends to run along the faster layer when sin i = v₁ ÷ v₂.',
    ),
  },
};

/** h = (x_c ÷ 2)√((v₂ − v₁) ÷ (v₂ + v₁)). */
const crossoverRule: Rule = {
  relation: {
    id: 'h = (x_c ÷ 2)√((v₂ − v₁) ÷ (v₂ + v₁))',
    display: '{h} = ({xc} ÷ 2) × √(({v2} − {v1}) ÷ ({v2} + {v1}))',
    vars: ['h', 'xc', 'v1', 'v2'],
    residual: (v) => v.h! - depthFromCrossover(v.xc!, v.v1!, v.v2!),
    solve: {
      h: (v) => (v.v2! > v.v1! ? depthFromCrossover(v.xc!, v.v1!, v.v2!) : undefined),
      xc: (v) => (v.v2! > v.v1! ? crossoverOf(v.h!, v.v1!, v.v2!) : undefined),
    },
  },
  steps: {
    h: st(
      '({xc} ÷ 2) × √(({v2} − {v1}) ÷ ({v2} + {v1}))',
      'Half the crossover distance, times the root of the speeds’ difference over their sum.',
    ),
    xc: st(
      '2 × {h} × √(({v2} + {v1}) ÷ ({v2} − {v1}))',
      'Twice the depth, times the root of the speeds’ sum over their difference.',
    ),
  },
};

/** tᵢ = 2h cos i_c ÷ v₁, in ms. */
const interceptRule: Rule = {
  relation: {
    id: 'tᵢ = 2h cos i_c ÷ v₁',
    display: '{ti} = 2 × {h} × cos({ic}°) ÷ {v1} × 1000',
    vars: ['ti', 'h', 'ic', 'v1'],
    residual: (v) => v.ti! - ((2 * v.h! * Math.cos((v.ic! * Math.PI) / 180)) / v.v1!) * 1000,
    solve: {
      ti: (v) => ((2 * v.h! * Math.cos((v.ic! * Math.PI) / 180)) / v.v1!) * 1000,
    },
  },
  steps: {
    ti: st(
      '2 × {h} × cos({ic}°) ÷ {v1} × 1000',
      'The head wave’s extra time down and up through layer 1, in milliseconds.',
    ),
  },
};

const refractionDemo = (
  id: string,
  title: string,
  v1: number,
  v2: number,
  xc: number,
): ModuleDef => {
  const h = depthFromCrossover(xc, v1, v2);
  return {
    id,
    title,
    use: 'Use this for the depth to a layer from a refraction crossover distance.',
    assumptions: [
      'Flat layers; the lower layer is faster, or no head wave comes back up.',
      'Beyond the crossover distance the head wave arrives first.',
    ],
    variables: [
      quantity('v1', 'v₁', 'Upper layer speed', 'm/s', 300, 6000, 1),
      quantity('v2', 'v₂', 'Lower layer speed', 'm/s', 301, 8500, 1),
      quantity('xc', 'x_c', 'Crossover distance', 'm', 1, 10000, 0.1),
      quantity('ic', 'i_c', 'Critical angle', '°', 0.01, 89.99, 0.01),
      quantity('ti', 'tᵢ', 'Intercept time', 'ms', 0.0001, 1e5, 0.01),
      quantity('h', 'h', 'Depth to layer 2', 'm', 0.01, 1e5, 0.01),
    ],
    ...rules(
      criticalRule,
      crossoverRule,
      interceptRule,
      limit(
        'v₂ > v₁',
        '{v2} > {v1}',
        (v) => v.v2! > v.v1!,
        'The lower layer must be faster: v₂ > v₁.',
      ),
    ),
    example: {
      v1,
      v2,
      xc,
      h,
      ic: criticalAngle(v1, v2),
      ti: interceptTime(h, v1, v2) * 1000,
    },
    startWith: ['v1', 'v2', 'xc'],
    representation: {
      kind: 'refraction',
      mode: 'refraction',
      v1: 'v1',
      v2: 'v2',
      crossover: 'xc',
      depth: 'h',
      critical: 'ic',
      intercept: 'ti',
    },
  };
};

/** geophysics#0 main: 1,500 and 4,500 m/s, x_c = 60 m → 19.47°, 21.2 m, 26.7 ms. */
const refractionMain = refractionDemo(
  'g.he-refraction',
  'Depth to a faster layer from the crossover',
  1500,
  4500,
  60,
);
/** A small speed contrast: the crossover is far out for the depth. */
const refractionContrast = refractionDemo(
  'g.he-refraction-small-contrast',
  'A small speed contrast: a far crossover',
  2000,
  2400,
  200,
);

/** t₀ = 2h ÷ v. */
const zeroOffsetRule: Rule = {
  relation: {
    id: 't₀ = 2h ÷ v',
    display: '{t0} = 2 × {h} ÷ {v}',
    vars: ['t0', 'h', 'v'],
    residual: (v) => v.t0! * v.v! - 2 * v.h!,
    solve: {
      t0: (v) => div(2 * v.h!, v.v!),
      h: (v) => (v.t0! * v.v!) / 2,
      v: (v) => div(2 * v.h!, v.t0!),
    },
  },
  steps: {
    t0: st('2 × {h} ÷ {v}', 'Straight down and back up: twice the depth over the speed.'),
    h: st('{t0} × {v} ÷ 2', 'The speed times the time, halved for the trip down.'),
    v: st('2 × {h} ÷ {t0}', 'Twice the depth over the zero-offset time.'),
  },
};

/** t = √(x² + 4h²) ÷ v. */
const offsetRule: Rule = {
  relation: {
    id: 't = √(x² + 4h²) ÷ v',
    display: '{t} = √({x}² + 4 × {h}²) ÷ {v}',
    vars: ['t', 'x', 'h', 'v'],
    residual: (v) => v.t! - reflectionTime(v.x!, v.h!, v.v!),
    solve: { t: (v) => reflectionTime(v.x!, v.h!, v.v!) },
  },
  steps: {
    t: st(
      '√({x}² + 4 × {h}²) ÷ {v}',
      'The path down to the reflector’s midpoint and up is √(x² + 4h²) long.',
    ),
  },
};

/** Δt = t − t₀. */
const moveoutRule: Rule = {
  relation: {
    id: 'Δt = t − t₀',
    display: '{dt} = {t} − {t0}',
    vars: ['dt', 't', 't0'],
    residual: (v) => v.dt! - v.t! + v.t0!,
    solve: { dt: (v) => v.t! - v.t0!, t: (v) => v.dt! + v.t0!, t0: (v) => v.t! - v.dt! },
  },
  steps: {
    dt: st('{t} − {t0}', 'The extra time at the offset over the zero-offset time.'),
    t: st('{t0} + {dt}', 'Add the moveout to the zero-offset time.'),
    t0: st('{t} − {dt}', 'Take the moveout from the time at the offset.'),
  },
};

const reflectionDemo = (id: string, title: string, h: number, v: number, x: number): ModuleDef => {
  const t0 = (2 * h) / v;
  const t = reflectionTime(x, h, v);
  return {
    id,
    title,
    use: 'Use this for the reflection time at an offset and its normal moveout.',
    assumptions: [
      'One flat reflector under a layer of even speed; the source and receiver are on the surface.',
      'The ray reflects halfway between them.',
    ],
    variables: [
      quantity('h', 'h', 'Depth to the reflector', 'm', 1, 1e5, 1),
      quantity('v', 'v', 'Speed', 'm/s', 300, 8500, 1),
      quantity('x', 'x', 'Offset', 'm', 0, 1e5, 1),
      quantity('t0', 't₀', 'Zero-offset time', 's', 1e-6, 1000, 0.001),
      quantity('t', 't', 'Time at the offset', 's', 1e-6, 1000, 0.001),
      quantity('dt', 'Δt', 'Moveout', 's', 0, 1000, 0.001),
    ],
    ...rules(zeroOffsetRule, offsetRule, moveoutRule),
    example: { h, v, x, t0, t, dt: t - t0 },
    startWith: ['h', 'v', 'x'],
    representation: {
      kind: 'refraction',
      mode: 'reflection',
      depth: 'h',
      speed: 'v',
      offset: 'x',
      t0: 't0',
      time: 't',
      moveout: 'dt',
    },
  };
};

/** geophysics#0~reflection: 600 m, 2,000 m/s, x = 800 m → 0.600, 0.721, 0.121 s. */
const reflectionMain = reflectionDemo(
  'g.he-refraction-reflection',
  'Reflection time and moveout at an offset',
  600,
  2000,
  800,
);
/** A far offset, five times the depth: the hyperbola nears its slope 1 ÷ v. */
const reflectionFar = reflectionDemo(
  'g.he-refraction-reflection-far',
  'A far offset: the hyperbola straightens',
  600,
  2000,
  3000,
);

/** v = 0.3 ÷ √εᵣ. */
const radarSpeedRule: Rule = {
  relation: {
    id: 'v = 0.3 ÷ √εᵣ',
    display: '{v} = 0.3 ÷ √{eps}',
    vars: ['v', 'eps'],
    residual: (v) => v.v! - radarSpeed(v.eps!, 0.3),
    solve: { v: (v) => radarSpeed(v.eps!, 0.3), eps: (v) => pos(div(0.09, v.v! * v.v!)) },
  },
  steps: {
    v: st('0.3 ÷ √{eps}', 'Light’s 0.3 m/ns in air, slowed by the root of the permittivity.'),
    eps: st('(0.3 ÷ {v})²', 'How many times slower than light, squared.'),
  },
};

/** d = vt ÷ 2. */
const radarDepthRule: Rule = {
  relation: {
    id: 'd = vt ÷ 2',
    display: '{d} = {v} × {t} ÷ 2',
    vars: ['d', 'v', 't'],
    residual: (v) => 2 * v.d! - v.v! * v.t!,
    solve: {
      d: (v) => radarDepth(v.v!, v.t!),
      t: (v) => div(2 * v.d!, v.v!),
      v: (v) => div(2 * v.d!, v.t!),
    },
  },
  steps: {
    d: st('{v} × {t} ÷ 2', 'Speed times the two-way time, halved for the trip down.'),
    t: st('2 × {d} ÷ {v}', 'Down and back: twice the depth over the speed.'),
    v: st('2 × {d} ÷ {t}', 'Twice the depth over the two-way time.'),
  },
};

const gprDemo = (id: string, title: string, eps: number, t: number): ModuleDef => {
  const v = radarSpeed(eps, 0.3);
  return {
    id,
    title,
    use: 'Use this for the depth of a buried target from radar’s two-way time.',
    assumptions: [
      'Light travels 0.3 m/ns in air; in the ground it is slower by √εᵣ.',
      'The time is two-way: down to the target and back to the antenna.',
    ],
    variables: [
      quantity('eps', 'εᵣ', 'Relative permittivity', undefined, 1, 81, 0.1),
      quantity('v', 'v', 'Radar speed', 'm/ns', 0.0333, 0.3, 0.0001),
      quantity('t', 't', 'Two-way time', 'ns', 0.1, 10000, 0.1),
      quantity('d', 'd', 'Depth', 'm', 0.001, 1000, 0.001),
    ],
    ...rules(radarSpeedRule, radarDepthRule),
    example: { eps, v, t, d: radarDepth(v, t) },
    startWith: ['eps', 't'],
    representation: {
      kind: 'refraction',
      mode: 'gpr',
      permittivity: 'eps',
      time: 't',
      speed: 'v',
      depth: 'd',
      light: 0.3,
    },
  };
};

/** geophysics#3~gpr: εᵣ 9 → 0.1 m/ns; 40 ns → 2.0 m. */
const gprMain = gprDemo('g.he-refraction-gpr', 'Radar depth from two-way time', 9, 40);
/** Water-soaked ground, εᵣ near 81: radar slows to a ninth of light's speed. */
const gprWet = gprDemo('g.he-refraction-gpr-wet', 'Radar in water-soaked ground', 81, 100);

const REFRACTION_DEMOS: ModuleDef[] = [
  refractionMain,
  refractionContrast,
  reflectionMain,
  reflectionFar,
  gprMain,
  gprWet,
];

// ─── HC77 coordinatePlane GIS options (EG-P26) ───────────────────────────────

const SUBS = ['₁', '₂', '₃', '₄', '₅', '₆'];

/** Vertex coordinates x₁, y₁, … as values. */
const vertexVars = (n: number, unit: string): VariableDef[] =>
  Array.from({ length: n }, (_, i) => [
    quantity(`x${i + 1}`, `x${SUBS[i]}`, `x of corner ${i + 1}`, unit, -1e6, 1e6, 1),
    quantity(`y${i + 1}`, `y${SUBS[i]}`, `y of corner ${i + 1}`, unit, -1e6, 1e6, 1),
  ]).flat();

const cornersOf = (n: number, v: Values) =>
  Array.from({ length: n }, (_, i) => [v[`x${i + 1}`]!, v[`y${i + 1}`]!] as [number, number]);

/** Area = ½|Σ(xᵢyᵢ₊₁ − xᵢ₊₁yᵢ)|. */
const shoelaceRule = (n: number): Rule => {
  const vs = Array.from({ length: n }, (_, i) => [`x${i + 1}`, `y${i + 1}`]).flat();
  const terms = Array.from({ length: n }, (_, i) => {
    const j = (i % n) + 1;
    const k = ((i + 1) % n) + 1;
    return `{x${j}} × {y${k}} − {x${k}} × {y${j}}`;
  });
  return {
    relation: {
      id: 'area = ½|Σ(xᵢyᵢ₊₁ − xᵢ₊₁yᵢ)|',
      display: `{area} = ½ × |${terms.join(' + ')}|`,
      vars: ['area', ...vs],
      residual: (v) => v.area! - shoelaceArea(cornersOf(n, v)),
      solve: { area: (v) => shoelaceArea(cornersOf(n, v)) },
    },
    steps: {
      area: st(
        `|${terms.join(' + ')}| ÷ 2`,
        'Cross-multiply each corner with the next, add, and halve the size of the sum.',
      ),
    },
  };
};

const shoelaceDemo = (id: string, title: string, corners: [number, number][]): ModuleDef => {
  const n = corners.length;
  const example: Values = Object.fromEntries(
    corners.flatMap(([x, y], i) => [
      [`x${i + 1}`, x],
      [`y${i + 1}`, y],
    ]),
  );
  return {
    id,
    title,
    use: 'Use this for the area of a parcel or polygon from its vertices.',
    assumptions: [
      'The vertices go in order round the edge, which does not cross itself.',
      'Projected coordinates in metres, so the area comes out in square metres.',
    ],
    variables: [...vertexVars(n, 'm'), quantity('area', 'A', 'Area', 'm²', 0.01, 1e13, 1)],
    ...rules(
      shoelaceRule(n),
      limit(
        'sides do not cross',
        Array.from({ length: n }, (_, i) => `{x${i + 1}} {y${i + 1}}`).join(' '),
        (v) => !sidesCross(cornersOf(n, v)) && shoelaceArea(cornersOf(n, v)) > 0,
        'Put the corners in order round the edge, so no two sides cross.',
      ),
    ),
    example: { ...example, area: shoelaceArea(corners) },
    startWith: Object.keys(example),
    representation: {
      kind: 'coordinatePlane',
      x: 'x1',
      y: 'y1',
      polygon: corners.map((_, i) => [`x${i + 1}`, `y${i + 1}`] as [string, string]),
      shoelace: { area: 'area' },
      extent: 10,
      quadrants: 4,
    },
  };
};

/** gis#1 main: the plan's parcel moved 100 m east and 50 m north (no zero corner): 120,000 m². */
const planeShoelace = shoelaceDemo(
  'g.he-coordinatePlane-shoelace',
  'Area of a parcel from its corners',
  [
    [100, 50],
    [600, 150],
    [500, 450],
    [200, 350],
  ],
);
/** Three corners round the origin, two below the x-axis: negative cross terms. */
const planeShoelaceTriangle = shoelaceDemo(
  'g.he-coordinatePlane-shoelace-triangle',
  'A triangle across the axes',
  [
    [-200, -100],
    [300, -50],
    [50, 350],
  ],
);

/** A = 2rL + πr². */
const bufferRule: Rule = {
  relation: {
    id: 'A = 2rL + πr²',
    display: '{A} = 2 × {r} × {L} + π × {r}²',
    vars: ['A', 'r', 'L'],
    residual: (v) => v.A! - bufferArea(v.L!, v.r!),
    solve: {
      A: (v) => bufferArea(v.L!, v.r!),
      L: (v) => {
        const L = div(v.A! - Math.PI * v.r! * v.r!, 2 * v.r!);
        return L !== undefined && L >= 0 ? L : undefined;
      },
      r: (v) => pos((-2 * v.L! + Math.sqrt(4 * v.L! * v.L! + 4 * Math.PI * v.A!)) / (2 * Math.PI)),
    },
  },
  steps: {
    A: st(
      '2 × {r} × {L} + π × {r}²',
      'A strip 2r wide along the line, plus the two round ends: one circle.',
    ),
    L: st(
      '({A} − π × {r}²) ÷ (2 × {r})',
      'Take the round ends off the area, then divide by the strip’s width.',
    ),
    r: st(
      '(−2 × {L} + √(4 × {L}² + 4π × {A})) ÷ (2π)',
      'Solve πr² + 2Lr − A = 0 for its positive root.',
    ),
  },
};

const bufferDemo = (id: string, title: string, L: number, r: number): ModuleDef => ({
  id,
  title,
  use: 'Use this for the area inside a buffer round a line or a point.',
  assumptions: [
    'The buffer has round ends, so a line’s buffer is a strip plus one circle.',
    'A point’s buffer is a circle: L = 0.',
  ],
  variables: [
    quantity('L', 'L', 'Line length', 'm', 0, 1e7, 1),
    quantity('r', 'r', 'Buffer radius', 'm', 0.01, 1e5, 1),
    quantity('A', 'A', 'Buffer area', 'm²', 0.0001, 1e13, 1),
  ],
  ...rules(bufferRule),
  example: { L, r, A: bufferArea(L, r) },
  startWith: ['L', 'r'],
  representation: {
    kind: 'coordinatePlane',
    x: 'L',
    y: 'r',
    buffer: { area: 'A' },
    extent: 10,
    quadrants: 1,
  },
});

/** gis#1~buffer: a 2 km road, 100 m → 400,000 + 31,416 = 431,416 m². */
const planeBuffer = bufferDemo(
  'g.he-coordinatePlane-buffer',
  'The area within 100 m of a road',
  2000,
  100,
);
/** A short line in a wide buffer: the round ends are most of it. */
const planeBufferWide = bufferDemo(
  'g.he-coordinatePlane-buffer-wide',
  'A wide buffer round a short line',
  50,
  200,
);

/** x̄ = Σx ÷ n (and ȳ). */
const meanRule = (axis: 'x' | 'y', n: number): Rule => {
  const vs = Array.from({ length: n }, (_, i) => `${axis}${i + 1}`);
  const id = axis === 'x' ? 'mx' : 'my';
  return {
    relation: {
      id: `${axis}̄ = Σ${axis} ÷ n`,
      display: `{${id}} = (${vs.map((v) => `{${v}}`).join(' + ')}) ÷ ${n}`,
      vars: [id, ...vs],
      residual: (v) => v[id]! - vs.reduce((a, k) => a + v[k]!, 0) / n,
      solve: { [id]: (v) => vs.reduce((a, k) => a + v[k]!, 0) / n },
    },
    steps: {
      [id]: st(
        `(${vs.map((v) => `{${v}}`).join(' + ')}) ÷ ${n}`,
        `Add the ${axis}-coordinates and divide by the number of points.`,
      ),
    },
  };
};

/** SD = √(Σ((x − x̄)² + (y − ȳ)²) ÷ n). */
const sdRule = (n: number): Rule => {
  const terms = Array.from(
    { length: n },
    (_, i) => `({x${i + 1}} − {mx})² + ({y${i + 1}} − {my})²`,
  );
  const vs = Array.from({ length: n }, (_, i) => [`x${i + 1}`, `y${i + 1}`]).flat();
  return {
    relation: {
      id: 'SD = √(Σ((x − x̄)² + (y − ȳ)²) ÷ n)',
      display: `{sd} = √((${terms.join(' + ')}) ÷ ${n})`,
      vars: ['sd', 'mx', 'my', ...vs],
      residual: (v) => v.sd! - standardDistance(cornersOf(n, v)),
      solve: { sd: (v) => standardDistance(cornersOf(n, v)) },
    },
    steps: {
      sd: st(
        `√((${terms.join(' + ')}) ÷ ${n})`,
        'Square each point’s distance from the mean centre, average them, and take the root.',
      ),
    },
  };
};

const centerDemo = (id: string, title: string, pts: [number, number][]): ModuleDef => {
  const n = pts.length;
  const [mx, my] = meanCenter(pts);
  const example: Values = Object.fromEntries(
    pts.flatMap(([x, y], i) => [
      [`x${i + 1}`, x],
      [`y${i + 1}`, y],
    ]),
  );
  return {
    id,
    title,
    use: 'Use this for the mean centre of a set of points and their standard distance.',
    assumptions: [
      'Projected coordinates in kilometres; each point counts the same.',
      'The standard distance is the root of the points’ mean squared distance from the centre.',
    ],
    variables: [
      ...vertexVars(n, 'km').map((v) => ({
        ...v,
        name: v.name.replace('corner', 'point'),
      })),
      quantity('mx', 'x̄', 'Mean centre x', 'km', -1e6, 1e6, 0.01),
      quantity('my', 'ȳ', 'Mean centre y', 'km', -1e6, 1e6, 0.01),
      quantity('sd', 'SD', 'Standard distance', 'km', 0, 1e7, 0.01),
    ],
    ...rules(meanRule('x', n), meanRule('y', n), sdRule(n)),
    example: { ...example, mx, my, sd: standardDistance(pts) },
    startWith: Object.keys(example),
    representation: {
      kind: 'coordinatePlane',
      x: 'x1',
      y: 'y1',
      center: {
        points: pts.map((_, i) => [`x${i + 1}`, `y${i + 1}`] as [string, string]),
        x: 'mx',
        y: 'my',
        sd: 'sd',
      },
      extent: 10,
      quadrants: 4,
    },
  };
};

/** gis#3~mean-center: (2, 1), (4, 5), (9, 3) → (5, 3), SD = √(34 ÷ 3) = 3.37. */
const planeCenter = centerDemo('g.he-coordinatePlane-center', 'Mean centre and standard distance', [
  [2, 1],
  [4, 5],
  [9, 3],
]);
/** Points nearly in a line, one far out: the centre sits off every point. */
const planeCenterSpread = centerDemo(
  'g.he-coordinatePlane-center-spread',
  'A far point pulls the centre',
  [
    [-6, -2],
    [3, 1],
    [18, 4],
  ],
);

const GIS_DEMOS: ModuleDef[] = [
  planeShoelace,
  planeShoelaceTriangle,
  planeBuffer,
  planeBufferWide,
  planeCenter,
  planeCenterSpread,
];

// ─── HC78 projection (EG-P28) ────────────────────────────────────────────────

const cosd = (x: number) => Math.cos((x * Math.PI) / 180);

const latVar = (max: number) => quantity('lat', 'φ', 'Latitude', '°', -max, max, 0.1);
const radiusVar = quantity('R', 'R', 'Globe radius', 'cm', 1, 100, 0.1);

/** Mercator: k = 1 ÷ cos φ. */
const mercatorScaleRule: Rule = {
  relation: {
    id: 'k = 1 ÷ cos φ',
    display: '{k} = 1 ÷ cos({lat}°)',
    vars: ['k', 'lat'],
    residual: (v) => v.k! * cosd(v.lat!) - 1,
    solve: {
      k: (v) => div(1, cosd(v.lat!)),
    },
  },
  steps: {
    k: st('1 ÷ cos({lat}°)', 'A parallel is stretched to the equator’s length: 1 ÷ cos φ times.'),
  },
};

/** Mercator: area factor = k². */
const mercatorAreaRule: Rule = {
  relation: {
    id: 'area = k²',
    display: '{area} = {k}²',
    vars: ['area', 'k'],
    residual: (v) => v.area! - v.k! * v.k!,
    solve: { area: (v) => v.k! * v.k!, k: (v) => pos(Math.sqrt(v.area!)) },
  },
  steps: {
    area: st('{k}²', 'Stretched k times both ways, so areas grow k² times.'),
    k: st('√{area}', 'The root of the area factor.'),
  },
};

/** Mercator: y = R ln tan(45° + φ ÷ 2). */
const mercatorYRule: Rule = {
  relation: {
    id: 'y = R ln tan(45° + φ ÷ 2)',
    // tan(45° + φ ÷ 2) = 1 ÷ cos φ + tan φ: the same rule with one angle in each function.
    display: '{y} = {R} × ln(1 ÷ cos({lat}°) + tan({lat}°))',
    vars: ['y', 'R', 'lat'],
    residual: (v) => v.y! - parallelY('mercator', v.lat!, v.R!),
    solve: {
      y: (v) => parallelY('mercator', v.lat!, v.R!),
      R: (v) => (v.lat! !== 0 ? pos(v.y! / parallelY('mercator', v.lat!, 1)) : undefined),
    },
  },
  steps: {
    y: st(
      '{R} × ln(1 ÷ cos({lat}°) + tan({lat}°))',
      'Mercator’s rule, R ln tan(45° + φ ÷ 2), written with φ alone.',
    ),
    R: st(
      '{y} ÷ ln(1 ÷ cos({lat}°) + tan({lat}°))',
      'Divide the height by the rule’s factor at φ.',
    ),
  },
};

const mercatorDemo = (id: string, title: string, lat: number, R: number): ModuleDef => {
  const k = 1 / cosd(lat);
  return {
    id,
    title,
    use: 'Use this for Mercator’s scale factor, area distortion and where a parallel is drawn.',
    assumptions: [
      'The Earth is a sphere of radius R on the globe being projected.',
      'Mercator is conformal: small shapes keep their angles while areas grow as k²; the poles never fit.',
    ],
    variables: [
      latVar(85),
      radiusVar,
      quantity('k', 'k', 'Scale factor', undefined, 1, 12, 0.001),
      quantity('area', 'a', 'Area factor', undefined, 1, 144, 0.001),
      quantity('y', 'y', 'Height of the parallel', 'cm', -400, 400, 0.01),
    ],
    ...rules(mercatorScaleRule, mercatorAreaRule, mercatorYRule),
    example: { lat, R, k, area: k * k, y: parallelY('mercator', lat, R) },
    startWith: ['lat', 'R'],
    representation: {
      kind: 'projection',
      projection: 'mercator',
      latitude: 'lat',
      radius: 'R',
      y: 'y',
      kE: 'k',
      kN: 'k',
      area: 'area',
      land: true,
    },
  };
};

/** cartography#0 main: 60° → k = 2, area × 4; R = 10 cm → y = 13.2 cm. */
const projectionMercator = mercatorDemo(
  'g.he-projection-mercator',
  'Mercator: scale, area and where a parallel goes',
  60,
  10,
);
/** Far north, 80°: Greenland's latitude, k near 6 and areas 33 times too big. */
const projectionMercatorHigh = mercatorDemo(
  'g.he-projection-mercator-high',
  'Mercator near the pole: 80° N',
  80,
  10,
);

/** Cylindrical equal-area: y = R sin φ. */
const ceaYRule: Rule = {
  relation: {
    id: 'y = R sin φ',
    display: '{y} = {R} × sin({lat}°)',
    vars: ['y', 'R', 'lat'],
    residual: (v) => v.y! - parallelY('cylindricalEqualArea', v.lat!, v.R!),
    solve: {
      y: (v) => parallelY('cylindricalEqualArea', v.lat!, v.R!),
      lat: (v) =>
        Math.abs(v.y!) <= v.R! ? latitudeAt('cylindricalEqualArea', v.y!, v.R!) : undefined,
    },
  },
  steps: {
    y: st('{R} × sin({lat}°)', 'Straight across from the globe onto the cylinder: R sin φ.'),
    lat: st('arcsin({y} ÷ {R})', 'Undo the rule: the latitude drawn at height y.'),
  },
};

/** k_E = 1 ÷ cos φ. */
const eastRule: Rule = {
  relation: {
    id: 'k_E = 1 ÷ cos φ',
    display: '{kE} = 1 ÷ cos({lat}°)',
    vars: ['kE', 'lat'],
    residual: (v) => v.kE! * cosd(v.lat!) - 1,
    solve: { kE: (v) => div(1, cosd(v.lat!)) },
  },
  steps: {
    kE: st('1 ÷ cos({lat}°)', 'Every parallel is drawn as long as the equator.'),
  },
};

/** k_N = cos φ. */
const northRule: Rule = {
  relation: {
    id: 'k_N = cos φ',
    display: '{kN} = cos({lat}°)',
    vars: ['kN', 'lat'],
    residual: (v) => v.kN! - cosd(v.lat!),
    solve: { kN: (v) => cosd(v.lat!) },
  },
  steps: {
    kN: st('cos({lat}°)', 'North–south is squeezed by just as much: cos φ.'),
  },
};

/** area = k_E k_N. */
const productRule: Rule = {
  relation: {
    id: 'area = k_E × k_N',
    display: '{area} = {kE} × {kN}',
    vars: ['area', 'kE', 'kN'],
    residual: (v) => v.area! - v.kE! * v.kN!,
    solve: { area: (v) => v.kE! * v.kN! },
  },
  steps: {
    area: st('{kE} × {kN}', 'The area factor is the two stretches multiplied.'),
  },
};

const equalAreaDemo = (id: string, title: string, lat: number, R: number): ModuleDef => ({
  id,
  title,
  use: 'Use this for where a parallel goes on the cylindrical equal-area map and its two scales.',
  assumptions: [
    'The Earth is a sphere of radius R; parallels are projected straight across onto the cylinder.',
    'Stretched east–west and squeezed north–south by the same factor, so areas stay true.',
  ],
  variables: [
    latVar(89),
    radiusVar,
    quantity('y', 'y', 'Height of the parallel', 'cm', -100, 100, 0.01),
    quantity('kE', 'k_E', 'East–west scale', undefined, 1, 100, 0.001),
    quantity('kN', 'k_N', 'North–south scale', undefined, 0.01, 1, 0.001),
    quantity('area', 'a', 'Area factor', undefined, 0.01, 10, 0.001),
  ],
  ...rules(ceaYRule, eastRule, northRule, productRule),
  example: {
    lat,
    R,
    y: parallelY('cylindricalEqualArea', lat, R),
    kE: 1 / cosd(lat),
    kN: cosd(lat),
    area: 1,
  },
  startWith: ['lat', 'R'],
  representation: {
    kind: 'projection',
    projection: 'cylindricalEqualArea',
    latitude: 'lat',
    radius: 'R',
    y: 'y',
    kE: 'kE',
    kN: 'kN',
    area: 'area',
    land: true,
  },
});

/** cartography#0~equal-area: 60° → y = 8.66 cm, k_E = 2, k_N = 0.5, area 1. */
const projectionEqualArea = equalAreaDemo(
  'g.he-projection-equal-area',
  'Cylindrical equal-area: shapes squashed, areas true',
  60,
  10,
);
/** Far south, 75° S: the shapes are squashed four times flat. */
const projectionEqualAreaSouth = equalAreaDemo(
  'g.he-projection-equal-area-south',
  'Equal-area far south: 75° S',
  -75,
  10,
);

/** Equirectangular: y = R × φ (radians). */
const plateRule: Rule = {
  relation: {
    id: 'y = Rφ',
    display: '{y} = {R} × {lat} × π ÷ 180',
    vars: ['y', 'R', 'lat'],
    residual: (v) => v.y! - parallelY('equirectangular', v.lat!, v.R!),
    solve: {
      y: (v) => parallelY('equirectangular', v.lat!, v.R!),
      lat: (v) => latitudeAt('equirectangular', v.y!, v.R!),
      R: (v) => (v.lat! !== 0 ? pos(v.y! / parallelY('equirectangular', v.lat!, 1)) : undefined),
    },
  },
  steps: {
    y: st(
      '{R} × {lat} × π ÷ 180',
      'Parallels are evenly spaced: the arc from the equator, R times φ in radians.',
    ),
    lat: st('{y} ÷ {R} × 180 ÷ π', 'The arc divided by R, turned into degrees.'),
    R: st('{y} ÷ ({lat} × π ÷ 180)', 'The arc divided by φ in radians.'),
  },
};

const projectionPlate: ModuleDef = {
  id: 'g.he-projection-equirectangular',
  title: 'Equirectangular: parallels evenly spaced',
  use: 'Use this for where a parallel goes on an equirectangular (plate carrée) map.',
  assumptions: [
    'The Earth is a sphere of radius R; every meridian keeps its true length.',
    'Parallels are stretched east–west by 1 ÷ cos φ, so shapes widen toward the poles.',
  ],
  variables: [
    latVar(90),
    radiusVar,
    quantity('y', 'y', 'Height of the parallel', 'cm', -160, 160, 0.01),
    quantity('kE', 'k_E', 'East–west scale', undefined, 1, 1e4, 0.001),
  ],
  ...rules(plateRule, eastRule),
  example: { lat: 45, R: 10, y: parallelY('equirectangular', 45, 10), kE: 1 / cosd(45) },
  startWith: ['lat', 'R'],
  representation: {
    kind: 'projection',
    projection: 'equirectangular',
    latitude: 'lat',
    radius: 'R',
    y: 'y',
    kE: 'kE',
    land: true,
  },
};

const PROJECTION_DEMOS: ModuleDef[] = [
  projectionMercator,
  projectionMercatorHigh,
  projectionEqualArea,
  projectionEqualAreaSouth,
  projectionPlate,
];

const card = (projection: ProjectionName): ProjectionCard => ({
  kind: 'projection',
  projection,
  tissot: true,
});

/** Stands in for he.geography.cartography#0~properties (the sort, with the card figure). */
const projectionCards: LayoutDef = {
  kind: 'sort',
  id: 'g.he-projection-card-properties',
  title: 'What a projection keeps',
  use: 'Use this for “Is the Mollweide projection conformal, equal-area, equidistant or a compromise?”',
  assumptions: [
    'No flat map keeps shapes, areas and distances all at once.',
    'The dots are Tissot circles: equal-sized circles on the globe, drawn as the map draws them.',
  ],
  question: 'What does the projection keep?',
  bins: [
    {
      id: 'conformal',
      label: 'Conformal',
      why: 'Angles and small shapes: the dots stay round, though their sizes change.',
    },
    {
      id: 'area',
      label: 'Equal-area',
      why: 'Areas: the dots keep one area, though they are squashed.',
    },
    {
      id: 'distance',
      label: 'Equidistant',
      why: 'Distances along the meridians (or from the centre) are true.',
    },
    {
      id: 'compromise',
      label: 'Compromise',
      why: 'A little of each: nothing is true, nothing is badly wrong.',
    },
  ],
  cards: (
    [
      ['Mercator', 'mercator', 'conformal'],
      ['Lambert conformal conic', 'lambertConformalConic', 'conformal'],
      ['Stereographic', 'stereographic', 'conformal'],
      ['Albers equal-area conic', 'albersEqualAreaConic', 'area'],
      ['Mollweide', 'mollweide', 'area'],
      ['Gall–Peters', 'gallPeters', 'area'],
      ['Azimuthal equidistant', 'azimuthalEquidistant', 'distance'],
      ['Equirectangular', 'equirectangular', 'distance'],
      ['Winkel tripel', 'winkelTripel', 'compromise'],
    ] as const
  ).map(([label, p, bin]) => ({ label, bin, figure: card(p) })),
};

export const HE3M_GALLERY_MODULES: ModuleDef[] = [
  ...AQUIFER_DEMOS,
  ...REFRACTION_DEMOS,
  ...GIS_DEMOS,
  ...PROJECTION_DEMOS,
];

export const HE3M_GALLERY_LAYOUTS: LayoutDef[] = [projectionCards];
