/**
 * College gallery demos, round 4, group M (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC174: `soilPhases`, the new kind (he.engineering.soil-mechanics#0, #1~sand-cone).
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, Representation, StepText } from './types';

type Solver = (v: Values) => number | number[] | undefined;
type Rule = { relation: Relation; steps: Record<string, StepText> };

/** A value with its unit (one unit: the formula is written in it). */
const num = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({
  id,
  symbol,
  name,
  ...(unit ? { unit, units: [unit] } : {}),
  min,
  max,
  ...more,
});

/** A value worked out, never typed. */
const out = (
  id: string,
  symbol: string,
  name: string,
  unit?: string,
  more: Partial<VariableDef> = {},
) => num(id, symbol, name, unit, -1e12, 1e12, { derived: true, ...more });

/** A number written into step text: up to 7 figures, a negative one bracketed. */
const lit = (x: number) => {
  const s = String(Number(x.toPrecision(7))).replace('-', '−');
  return x < 0 ? `(${s})` : s;
};
/** A template with each {id} replaced by its value. */
const fill = (t: string, v: Values) => t.replace(/\{(\w+)\}/g, (_, id: string) => lit(v[id]!));
/** A finite number, or nothing. */
const fin = (x: number) => (Number.isFinite(x) ? x : undefined);

/** A relation with its steps: each variable's solver, expression and explanation. */
function rule(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  parts: Record<string, [Solver, StepText['expr'], StepText['how']]>,
): Rule {
  const solve: Record<string, Solver> = {};
  const steps: Record<string, StepText> = {};
  for (const [v, [fn, expr, how]] of Object.entries(parts)) {
    solve[v] = fn;
    steps[v] = { expr, how };
  }
  for (const v of vars) if (!(v in solve)) solve[v] = () => undefined;
  return { relation: { id, display, vars, residual, solve }, steps };
}

/** A value worked out from others, never solved backwards. */
const derive = (
  id: string,
  x: string,
  inputs: string[],
  display: string,
  f: (v: Values) => number | undefined,
  expr: StepText['expr'],
  how: StepText['how'],
): Rule => {
  const r = rule(id, display, [x, ...inputs], (v) => v[x]! - (f(v) ?? NaN), {
    [x]: [(v) => fin(f(v) ?? NaN), expr, how],
  });
  // A display in words is checked as the step's arithmetic.
  if (/[A-Za-z]{3,}/.test(display.replace(/\{\w+\}/g, '')))
    r.relation.check = (v) =>
      `${fill(typeof expr === 'string' ? expr : expr(v), v)} = ${lit(v[x]!)}`;
  return r;
};

/** A demo from its rules. */
function page(
  d: Omit<ModuleDef, 'relations' | 'steps' | 'representation' | 'startWith'> & {
    rules: Rule[];
    representation: Representation;
    startWith?: string[];
  },
): ModuleDef {
  const { rules, ...rest } = d;
  return {
    // College pages are metric unless the page says otherwise; the example opens whole.
    unitSystems: ['metric'],
    ...rest,
    startWith: d.startWith ?? d.variables.filter((v) => !v.derived).map((v) => v.id),
    relations: rules.map((r) => r.relation),
    steps: Object.fromEntries(rules.map((r) => [r.relation.id, r.steps])),
  };
}

/** Values worked out from the typed ones of an example, in order. */
function example(typed: Values, ...work: [string, (v: Values) => number][]): Values {
  const v: Values = { ...typed };
  for (const [id, f] of work) v[id] = f(v);
  return v;
}

// ─── HC174: soil phases (soil-mechanics#0 main, #1~sand-cone) ─────────────────

const eOf = (v: Values) => ((v.w! / 100) * v.Gs!) / v.S!;
const nOf = (v: Values) => v.e! / (1 + v.e!);
const gdOf = (v: Values) => (v.Gs! * 9.81) / (1 + v.e!);
const gOf = (v: Values) => v.gd! * (1 + v.w! / 100);

const phasesPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'γ_w = 9.81 kN/m³; the air weighs nothing.',
      'The block holds 1 m³ of solids, so the void volume is e and the water volume is Se.',
      'w is the weight of water over the weight of solids, written in %.',
    ],
    variables: [
      num('Gs', 'G_s', 'Specific gravity of solids', undefined, 2.4, 3, { step: 0.01 }),
      num('w', 'w', 'Water content', '%', 0.1, 200, { step: 0.1 }),
      num('S', 'S', 'Degree of saturation', undefined, 0.01, 1, { step: 0.01 }),
      out('e', 'e', 'Void ratio'),
      out('n', 'n', 'Porosity'),
      out('gd', 'γ_d', 'Dry unit weight', 'kN/m³'),
      out('g', 'γ', 'Moist unit weight', 'kN/m³'),
    ],
    rules: [
      derive(
        'e',
        'e',
        ['w', 'Gs', 'S'],
        '{e} = {w} ÷ 100 × {Gs} ÷ {S}',
        eOf,
        '{w} ÷ 100 × {Gs} ÷ {S}',
        'Se = wG_s: the water fills S of the voids, and its volume is w times the solids’ weight over γ_w.',
      ),
      derive(
        'n',
        'n',
        ['e'],
        '{n} = {e} ÷ (1 + {e})',
        nOf,
        '{e} ÷ (1 + {e})',
        'Porosity is the voids over the whole volume: e over 1 + e.',
      ),
      derive(
        'gd',
        'gd',
        ['Gs', 'e'],
        '{gd} = {Gs} × 9.81 ÷ (1 + {e})',
        gdOf,
        '{Gs} × 9.81 ÷ (1 + {e})',
        'The solids weigh G_sγ_w for each 1 of their volume, spread over the whole 1 + e.',
      ),
      derive(
        'g',
        'g',
        ['gd', 'w'],
        '{g} = {gd} × (1 + {w} ÷ 100)',
        gOf,
        '{gd} × (1 + {w} ÷ 100)',
        'The water adds w times the solids’ weight.',
      ),
    ],
    example: example(typed, ['e', eOf], ['n', nOf], ['gd', gdOf], ['g', gOf]),
    startWith: ['Gs', 'w', 'S'],
    representation: {
      kind: 'soilPhases',
      Gs: 'Gs',
      w: 'w',
      S: 'S',
      e: 'e',
      gammaW: 9.81,
      porosity: 'n',
      dryUnitWeight: 'gd',
      unitWeight: 'g',
    },
  });

const PHASES = phasesPage(
  'g.he-soilPhases-main',
  'Void ratio, porosity and unit weights',
  'Use this for “A soil has G_s = 2.70, w = 18% and S = 0.9. Find e, n, γ_d and γ.”',
  { Gs: 2.7, w: 18, S: 0.9 },
);

/** Fully saturated: no air, the voids all water (S = 1). */
const PHASES_SATURATED = phasesPage(
  'g.he-soilPhases-saturated',
  'A saturated clay’s phases',
  'Use this for “A saturated clay has w = 40% and G_s = 2.75. Find its void ratio and unit weight.”',
  { Gs: 2.75, w: 40, S: 1 },
);

const vOf = (v: Values) => (v.msand! * 1000) / v.rhoSand!;
const rhoOf = (v: Values) => (v.mwet! * 1000) / v.V!;
const rhoDOf = (v: Values) => v.rho! / (1 + v.w! / 100);
const gdConeOf = (v: Values) => v.rhoD! * 9.81;
const eConeOf = (v: Values) => (v.Gs! * 1) / v.rhoD! - 1;

const SAND_CONE = page({
  id: 'g.he-soilPhases-sand-cone',
  title: 'Field density by the sand cone',
  use: 'Use this for “1.62 kg of 1.50 g/cm³ sand fills the hole, and the soil dug out weighs 2.07 kg at w = 10%. Find the dry unit weight.”',
  assumptions: [
    'The sand used is the sand in the hole (the cone’s own sand already taken off).',
    'ρ_w = 1.00 g/cm³, so G_s ÷ ρ_d gives 1 + e; 1 g/cm³ weighs 9.81 kN/m³.',
    'The hole’s soil is all the soil dug out of it.',
  ],
  variables: [
    num('msand', 'm_sand', 'Sand used', 'kg', 0.01, 100, { step: 0.01 }),
    num('rhoSand', 'ρ_sand', 'Sand density', 'g/cm³', 1, 2.5, { step: 0.01 }),
    out('V', 'V', 'Hole volume', 'cm³'),
    num('mwet', 'M', 'Wet soil mass', 'kg', 0.01, 100, { step: 0.01 }),
    out('rho', 'ρ', 'Moist density', 'g/cm³'),
    num('w', 'w', 'Water content', '%', 0.1, 200, { step: 0.1 }),
    out('rhoD', 'ρ_d', 'Dry density', 'g/cm³'),
    out('gd', 'γ_d', 'Dry unit weight', 'kN/m³'),
    num('Gs', 'G_s', 'Specific gravity of solids', undefined, 2.4, 3, { step: 0.01 }),
    // A soil denser than its own solids has no voids: the page refuses it.
    out('e', 'e', 'Void ratio', undefined, { min: 0.01 }),
  ],
  rules: [
    derive(
      'V',
      'V',
      ['msand', 'rhoSand'],
      '{V} = {msand} × 1000 ÷ {rhoSand}',
      vOf,
      '{msand} × 1000 ÷ {rhoSand}',
      'The sand’s mass over its density is the hole’s volume (1 kg = 1000 g).',
    ),
    derive(
      'rho',
      'rho',
      ['mwet', 'V'],
      '{rho} = {mwet} × 1000 ÷ {V}',
      rhoOf,
      '{mwet} × 1000 ÷ {V}',
      'The soil’s mass over the hole’s volume is its moist density.',
    ),
    derive(
      'rhoD',
      'rhoD',
      ['rho', 'w'],
      '{rhoD} = {rho} ÷ (1 + {w} ÷ 100)',
      rhoDOf,
      '{rho} ÷ (1 + {w} ÷ 100)',
      'Taking the water out leaves the solids: divide by 1 + w.',
    ),
    derive(
      'gd',
      'gd',
      ['rhoD'],
      '{gd} = {rhoD} × 9.81',
      gdConeOf,
      '{rhoD} × 9.81',
      'Each 1 g/cm³ weighs 9.81 kN/m³.',
    ),
    derive(
      'e',
      'e',
      ['Gs', 'rhoD'],
      '{e} = {Gs} × 1 ÷ {rhoD} − 1',
      eConeOf,
      '{Gs} × 1 ÷ {rhoD} − 1',
      'The solids alone would be G_sρ_w dense; spread over 1 + e they make ρ_d.',
    ),
  ],
  example: example(
    { msand: 1.62, rhoSand: 1.5, mwet: 2.07, w: 10, Gs: 2.65 },
    ['V', vOf],
    ['rho', rhoOf],
    ['rhoD', rhoDOf],
    ['gd', gdConeOf],
    ['e', eConeOf],
  ),
  startWith: ['msand', 'rhoSand', 'mwet', 'w', 'Gs'],
  representation: {
    kind: 'soilPhases',
    Gs: 'Gs',
    w: 'w',
    e: 'e',
    volume: 'V',
    mass: 'mwet',
    density: 'rho',
    dryDensity: 'rhoD',
  },
});

export const HE4M_GALLERY_MODULES: ModuleDef[] = [PHASES, PHASES_SATURATED, SAND_CONE];

export const HE4M_GALLERY_LAYOUTS: LayoutDef[] = [];
