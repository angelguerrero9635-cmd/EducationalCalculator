/**
 * College gallery demos, round 4, group L (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example (docs/plans/he.mechanical.md).
 * Spread into gallery.ts.
 *
 * HC165 `moodyChart` (he.engineering.fluid-mechanics#4, ME-P13).
 */
import type { Relation, Values, VariableDef } from '@/engine/types';
import { colebrookF } from '@/components/module/reps/he4lMath';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

/** g on the engineering pages, m/s². */
const G = 9.81;

interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}

/** Gathers rules into a module's `relations` and `steps`. */
const rules = (...rs: Rule[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

type Solve = (v: Values) => number | number[] | undefined;

/**
 * A relation from its display and residual; `parts` gives each variable's solver, step
 * expression and explanation (null: never solved for that variable, it is only checked).
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
): VariableDef => ({
  id,
  symbol,
  name,
  ...(unit ? { unit, units: [unit] } : {}),
  min,
  max,
  step,
  ...extra,
});

/** A pressure kept in pascals for the formulas and shown in kPa. */
const kPa = (id: string, symbol: string, name: string) =>
  q(id, symbol, name, 'Pa', 0, 1e9, 10, { units: ['Pa', 'kPa'], shownIn: 'kPa' });

const div = (a: number, b: number) => (Math.abs(b) < 1e-15 ? undefined : a / b);
const root = (x: number) => (x < 0 ? undefined : Math.sqrt(x));

/** A demo module: the page's values and rules, the picture, a title and its use line. */
const demo = (
  id: string,
  title: string,
  use: string,
  m: Omit<ModuleDef, 'id' | 'title' | 'use'>,
): ModuleDef => ({ id, title, use, workedFigures: 4, unitSystems: ['metric'], ...m });

// ─── HC165: the Moody chart (fluid-mechanics#4) ─────────────────────────────────

const reynoldsRule = rule(
  'Re = VD ÷ ν',
  '{Re} = {V} × {D} ÷ {nu}',
  (v) => v.Re! - (v.V! * v.D!) / v.nu!,
  {
    Re: [
      (v) => div(v.V! * v.D!, v.nu!),
      '{V} × {D} ÷ {nu}',
      'Reynolds number: inertia over viscosity, speed times diameter over ν.',
    ],
    V: [(v) => div(v.Re! * v.nu!, v.D!), '{Re} × {nu} ÷ {D}', 'Multiply Re by ν and divide by D.'],
    D: [(v) => div(v.Re! * v.nu!, v.V!), '{Re} × {nu} ÷ {V}', 'Multiply Re by ν and divide by V.'],
    nu: [(v) => div(v.V! * v.D!, v.Re!), '{V} × {D} ÷ {Re}', 'Speed times diameter over Re.'],
  },
);

const colebrookRule = rule(
  'Colebrook',
  '1 ÷ √{f} = −2 × log₁₀({eps} ÷ (3.7 × {D}) + 2.51 ÷ ({Re} × √{f}))',
  (v) =>
    1 / Math.sqrt(v.f!) + 2 * Math.log10(v.eps! / (3.7 * v.D!) + 2.51 / (v.Re! * Math.sqrt(v.f!))),
  {
    f: [
      (v) => colebrookF(v.Re!, v.eps! / v.D!),
      // f is on both sides: the last round of the iteration, with the f it settles on.
      (v: Values) =>
        `(1 ÷ (−2 × log₁₀({eps} ÷ (3.7 × {D}) + 2.51 ÷ ({Re} × √${Number(colebrookF(v.Re!, v.eps! / v.D!).toPrecision(8))}))))²`,
      'Colebrook has f on both sides: guess f = 0.02, put it in on the right, and repeat until f stops changing. The last round is shown.',
    ],
    eps: null,
    D: null,
    Re: null,
  },
);

const laminarRule = rule('f = 64 ÷ Re', '{f} = 64 ÷ {Re}', (v) => v.f! - 64 / v.Re!, {
  f: [(v) => div(64, v.Re!), '64 ÷ {Re}', 'Laminar flow: the friction factor is 64 over Re.'],
  Re: [(v) => div(64, v.f!), '64 ÷ {f}', 'Laminar flow: Re is 64 over f.'],
});

const darcyRule = rule(
  'h_L = f(L ÷ D)V² ÷ 2g',
  '{hL} = {f} × {L} ÷ {D} × {V}² ÷ (2 × 9.81)',
  (v) => v.hL! - (v.f! * v.L! * v.V! ** 2) / (v.D! * 2 * G),
  {
    hL: [
      (v) => (v.f! * v.L! * v.V! ** 2) / (v.D! * 2 * G),
      '{f} × {L} ÷ {D} × {V}² ÷ (2 × 9.81)',
      'Darcy–Weisbach: the friction factor times the pipe’s length in diameters times the velocity head V² ÷ 2g.',
    ],
    L: [
      (v) => div(v.hL! * v.D! * 2 * G, v.f! * v.V! ** 2),
      '{hL} × {D} × 2 × 9.81 ÷ ({f} × {V}²)',
      'Solve Darcy–Weisbach for L.',
    ],
    V: [
      (v) => root(div(v.hL! * v.D! * 2 * G, v.f! * v.L!) ?? NaN),
      '√({hL} × {D} × 2 × 9.81 ÷ ({f} × {L}))',
      'Solve Darcy–Weisbach for V².',
    ],
    f: null,
    D: null,
  },
);

const dropRule = (rho: number) =>
  rule('ΔP = ρgh_L', `{dP} = ${rho} × 9.81 × {hL}`, (v) => v.dP! - rho * G * v.hL!, {
    dP: [
      (v) => rho * G * v.hL!,
      `${rho} × 9.81 × {hL}`,
      'A head of h_L metres of the fluid is a pressure of ρgh_L.',
    ],
    hL: [(v) => v.dP! / (rho * G), `{dP} ÷ (${rho} × 9.81)`, 'Divide the pressure by ρg.'],
  });

/** A pipe-flow page: f from Colebrook (or 64 ÷ Re when laminar), its point on the Moody chart. */
function moodyDemo(
  id: string,
  title: string,
  use: string,
  ex: { V: number; D: number; L: number; nu: number; eps?: number; rho: number; fluid: string },
  laminar = false,
): ModuleDef {
  const Re = (ex.V * ex.D) / ex.nu;
  const f = laminar ? 64 / Re : colebrookF(Re, ex.eps! / ex.D);
  const hL = (f * ex.L * ex.V ** 2) / (ex.D * 2 * G);
  return demo(id, title, use, {
    assumptions: [
      laminar
        ? `Steady, fully developed laminar flow (Re < 2300) of ${ex.fluid}, ρ = ${ex.rho} kg/m³.`
        : `Steady, fully developed turbulent flow (Re ≥ 2300) of ${ex.fluid}, ρ = ${ex.rho} kg/m³.`,
      'g = 9.81 m/s²; minor losses are ignored.',
      laminar
        ? 'Laminar f does not depend on the roughness.'
        : 'Colebrook is solved numerically (fixed-point iteration on 1 ÷ √f).',
    ],
    variables: [
      q('V', 'V', 'Mean speed', 'm/s', 0.01, 100, 0.01),
      q('D', 'D', 'Diameter', 'm', 0.001, 10, 0.001),
      q('L', 'L', 'Length', 'm', 0.1, 1e6, 1),
      q('nu', 'ν', 'Kinematic viscosity', 'm²/s', 1e-8, 1e-2, 1e-8, { scientific: true }),
      ...(laminar
        ? []
        : [
            q('eps', 'ε', 'Roughness', 'm', 1e-7, 0.01, 0.000001, {
              units: ['mm', 'm'],
              shownIn: 'mm',
            }),
          ]),
      laminar
        ? q('Re', 'Re', 'Reynolds number', undefined, 1000, 2299, 1)
        : q('Re', 'Re', 'Reynolds number', undefined, 2300, 1e8, 1),
      q('f', 'f', 'Friction factor', undefined, 0.005, 0.1, 0.0001),
      q('hL', 'h_L', 'Head loss', 'm', 0, 1e6, 0.01),
      kPa('dP', 'ΔP', 'Pressure drop'),
    ],
    ...rules(reynoldsRule, laminar ? laminarRule : colebrookRule, darcyRule, dropRule(ex.rho)),
    example: {
      V: ex.V,
      D: ex.D,
      L: ex.L,
      nu: ex.nu,
      ...(laminar ? {} : { eps: ex.eps }),
      Re,
      f,
      hL,
      dP: ex.rho * G * hL,
    },
    startWith: laminar ? ['V', 'D', 'L', 'nu'] : ['V', 'D', 'L', 'nu', 'eps'],
    pictureLabels: ['V', 'L', 'nu', 'hL', 'dP'],
    representation: laminar
      ? { kind: 'moodyChart', re: 'Re', f: 'f' }
      : { kind: 'moodyChart', re: 'Re', f: 'f', epsilon: 'eps', diameter: 'D' },
  });
}

const MOODY_STEEL = moodyDemo(
  'g.he-moodyChart-turbulent',
  'Head loss in a steel pipe: f from the Moody chart',
  'Use this for “Water at 2 m/s in 100 m of 0.1 m steel pipe (ε = 0.045 mm). Find f, h_L and ΔP.”',
  { V: 2, D: 0.1, L: 100, nu: 1e-6, eps: 0.000045, rho: 1000, fluid: 'water' },
);

/** The rough edge: a concrete main where f hardly changes with Re. */
const MOODY_ROUGH = moodyDemo(
  'g.he-moodyChart-rough',
  'A rough concrete main: f flattens out',
  'Use this for “Water at 3 m/s in 500 m of 0.5 m concrete pipe (ε = 1 mm). Find f and the head loss.”',
  { V: 3, D: 0.5, L: 500, nu: 1e-6, eps: 0.001, rho: 1000, fluid: 'water' },
);

/** Below Re = 2300 the point leaves the curves for the laminar line. */
const MOODY_LAMINAR = moodyDemo(
  'g.he-moodyChart-laminar',
  'Oil in a small tube: laminar, f = 64 ÷ Re',
  'Use this for “Oil (ν = 10⁻⁵ m²/s, ρ = 880 kg/m³) at 0.6 m/s in 20 m of 20 mm tube. Find f and ΔP.”',
  { V: 0.6, D: 0.02, L: 20, nu: 1e-5, rho: 880, fluid: 'oil' },
  true,
);

export const HE4L_GALLERY_MODULES: ModuleDef[] = [MOODY_STEEL, MOODY_ROUGH, MOODY_LAMINAR];

export const HE4L_GALLERY_LAYOUTS: LayoutDef[] = [];
