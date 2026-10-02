/**
 * College gallery demos, round 3, group M (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC75: the `aquifer` kind (EG-P17): section, head and well.
 */
import { thiemRate } from '@/components/module/reps/aquiferMath';
import type { Relation, VariableDef, Values } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

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

export const HE3M_GALLERY_MODULES: ModuleDef[] = [...AQUIFER_DEMOS];

export const HE3M_GALLERY_LAYOUTS: LayoutDef[] = [];
