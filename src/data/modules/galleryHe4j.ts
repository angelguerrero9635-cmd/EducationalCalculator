/**
 * College gallery demos, round 4, group J (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC154: tissue card icons (he.biology.anatomy-physiology#0, ~epithelia).
 * HC155: `heartPump`, the new kind (he.biology.anatomy-physiology#3, ~ejection).
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { CardIcon } from './layouts/types';
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

/** A finite number, or nothing. */
const fin = (x: number) => (Number.isFinite(x) ? x : undefined);

/** A relation with its steps: each variable's solver, expression and explanation. */
function rule(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  parts: Record<string, [(v: Values) => number, StepText['expr'], StepText['how']]>,
): Rule {
  const solve: Record<string, Solver> = {};
  const steps: Record<string, StepText> = {};
  for (const [v, [fn, expr, how]] of Object.entries(parts)) {
    solve[v] = (x: Values) => fin(fn(x));
    steps[v] = { expr, how };
  }
  for (const v of vars) if (!(v in solve)) solve[v] = () => undefined;
  return { relation: { id, display, vars, residual, solve }, steps };
}

/** A demo from its rules. */
function page(
  d: Omit<ModuleDef, 'relations' | 'steps' | 'representation'> & {
    rules: Rule[];
    representation: Representation;
  },
): ModuleDef {
  const { rules, ...rest } = d;
  return {
    ...rest,
    // College pages are metric.
    unitSystems: ['metric'],
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

/** A sort card with its drawn icon. */
const icon = (label: string, bin: string, name: CardIcon) => ({
  label,
  bin,
  figure: { kind: 'icon' as const, icon: name },
});

// ─── HC154: tissues (anatomy-physiology#0, ~epithelia) ──────────────────────────

const sortTissues: LayoutDef = {
  id: 'g.he-cardIcons-tissues',
  title: 'The four tissue types',
  kind: 'sort',
  use: 'Use this for naming the tissue type a section shows: epithelial, connective, muscle or nervous.',
  assumptions: [
    'Epithelium covers surfaces and lines tubes: cells packed side by side on a basement membrane.',
    'Connective tissue is mostly matrix around scattered cells: bone, cartilage, blood and fat.',
    'Muscle cells contract; nervous tissue is neurons and the glia that support them.',
  ],
  question: 'Which tissue type is each section?',
  bins: [
    {
      id: 'epithelial',
      label: 'Epithelial',
      why: 'Cells packed edge to edge on a basement membrane, one free surface.',
    },
    {
      id: 'connective',
      label: 'Connective',
      why: 'Few cells in a lot of matrix: mineral, gel, plasma or stored fat.',
    },
    { id: 'muscle', label: 'Muscle', why: 'Long cells full of contractile filaments.' },
    { id: 'nervous', label: 'Nervous', why: 'Neurons with long processes, glia around them.' },
  ],
  cards: [
    icon('Skin’s surface', 'epithelial', 'stratified squamous epithelium'),
    icon('Bone', 'connective', 'compact bone'),
    icon('Cartilage', 'connective', 'hyaline cartilage'),
    icon('Blood', 'connective', 'blood smear'),
    icon('Adipose (fat)', 'connective', 'adipose tissue'),
    icon('Skeletal muscle', 'muscle', 'skeletal muscle tissue'),
    icon('Cardiac muscle', 'muscle', 'cardiac muscle tissue'),
    icon('Smooth muscle', 'muscle', 'smooth muscle tissue'),
    icon('Neuron with glia', 'nervous', 'neuron with glia'),
  ],
};

const sortEpithelia: LayoutDef = {
  id: 'g.he-cardIcons-epithelia',
  title: 'Epithelia by shape and layers',
  kind: 'sort',
  use: 'Use this for naming an epithelium by its cells’ shape and its layers, from where it lines and what it does.',
  assumptions: [
    'Simple means one layer of cells; stratified means many, named by the shape of the top layer.',
    'Squamous cells are flat, cuboidal as tall as wide, columnar taller than wide.',
    'Thin layers suit diffusion; tall cells absorb and secrete; many layers resist wear.',
  ],
  question: 'Which epithelium lines each place?',
  bins: [
    {
      id: 'squamous',
      label: 'Simple squamous',
      why: 'One layer of flat cells: gases and fluid cross it quickly.',
    },
    {
      id: 'cuboidal',
      label: 'Simple cuboidal',
      why: 'One layer of cube-shaped cells that secrete and absorb.',
    },
    {
      id: 'columnar',
      label: 'Simple columnar',
      why: 'One layer of tall cells with a brush border and mucus-making goblet cells.',
    },
    {
      id: 'stratified',
      label: 'Stratified squamous',
      why: 'Many layers, flat on top: worn cells are shed and replaced from below.',
    },
  ],
  cards: [
    icon('Air sacs of the lung', 'squamous', 'simple squamous epithelium'),
    icon('Capillary walls', 'squamous', 'simple squamous epithelium'),
    icon('Kidney tubules', 'cuboidal', 'simple cuboidal epithelium'),
    icon('Gland ducts', 'cuboidal', 'simple cuboidal epithelium'),
    icon('Small intestine lining', 'columnar', 'simple columnar epithelium'),
    icon('Stomach lining', 'columnar', 'simple columnar epithelium'),
    icon('Skin', 'stratified', 'stratified squamous epithelium'),
    icon('Lining of the mouth', 'stratified', 'stratified squamous epithelium'),
  ],
};

// ─── HC155: the heart as a pump (anatomy-physiology#3, ~ejection) ───────────────

const hrVar = () => num('hr', 'HR', 'Heart rate', 'min⁻¹', 30, 220, { step: 1 });
const svVar = () => num('sv', 'SV', 'Stroke volume', 'mL', 5, 250, { step: 1 });
const coVar = () => num('co', 'CO', 'Cardiac output', 'L/min', 0.2, 40, { step: 0.1 });

const coOf = (v: Values) => (v.hr! * v.sv!) / 1000;
const coRule = rule(
  'cardiac output',
  '{co} = {hr} × {sv} ÷ 1000',
  ['co', 'hr', 'sv'],
  (v) => v.co! - coOf(v),
  {
    co: [
      coOf,
      '{hr} × {sv} ÷ 1000',
      'Each beat pushes out one stroke volume, HR times a minute; 1000 mL make a liter.',
    ],
    hr: [
      (v) => (v.co! * 1000) / v.sv!,
      '{co} × 1000 ÷ {sv}',
      'The milliliters a minute divided by the milliliters a beat give the beats a minute.',
    ],
    sv: [
      (v) => (v.co! * 1000) / v.hr!,
      '{co} × 1000 ÷ {hr}',
      'The milliliters a minute shared over the beats in that minute give each beat’s share.',
    ],
  },
);

const mapOf = (v: Values) => v.dbp! + (v.sbp! - v.dbp!) / 3;

const outputPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'Cardiac output is the blood the left ventricle pumps in a minute: beats a minute times the stroke volume.',
      'The heart spends about two thirds of each beat relaxed, so the mean pressure sits one third of the way from diastolic to systolic.',
      'Total peripheral resistance is the mean pressure the vessels need for each liter a minute of flow.',
    ],
    variables: [
      hrVar(),
      svVar(),
      coVar(),
      num('sbp', 'SBP', 'Systolic pressure', 'mmHg', 60, 280, { step: 1 }),
      num('dbp', 'DBP', 'Diastolic pressure', 'mmHg', 30, 160, { step: 1 }),
      num('map', 'MAP', 'Mean arterial pressure', 'mmHg', 30, 220, { step: 0.1 }),
      num('tpr', 'TPR', 'Total peripheral resistance', 'mmHg·min/L', 1, 100, { step: 0.1 }),
    ],
    rules: [
      coRule,
      rule(
        'mean arterial pressure',
        '{map} = {dbp} + ({sbp} − {dbp}) ÷ 3',
        ['map', 'dbp', 'sbp'],
        (v) => v.map! - mapOf(v),
        {
          map: [
            mapOf,
            '{dbp} + ({sbp} − {dbp}) ÷ 3',
            'Start at the diastolic pressure and add a third of the pulse pressure, SBP − DBP.',
          ],
          sbp: [
            (v) => v.dbp! + 3 * (v.map! - v.dbp!),
            '{dbp} + 3 × ({map} − {dbp})',
            'The mean sits a third of the pulse pressure above DBP, so the pulse pressure is three times that rise.',
          ],
          dbp: [
            (v) => (3 * v.map! - v.sbp!) / 2,
            '(3 × {map} − {sbp}) ÷ 2',
            'Three times the mean is SBP plus twice DBP; take away SBP and halve what is left.',
          ],
        },
      ),
      rule(
        'resistance',
        '{tpr} = {map} ÷ {co}',
        ['tpr', 'map', 'co'],
        (v) => v.tpr! - v.map! / v.co!,
        {
          tpr: [
            (v) => v.map! / v.co!,
            '{map} ÷ {co}',
            'Resistance is the pressure that drives the flow divided by the flow.',
          ],
          map: [
            (v) => v.tpr! * v.co!,
            '{tpr} × {co}',
            'The pressure is the resistance times the flow.',
          ],
          co: [
            (v) => v.map! / v.tpr!,
            '{map} ÷ {tpr}',
            'The flow is the pressure divided by the resistance.',
          ],
        },
      ),
    ],
    example: example(typed, ['co', coOf], ['map', mapOf], ['tpr', (v) => v.map! / v.co!]),
    startWith: ['hr', 'sv', 'sbp', 'dbp'],
    representation: {
      kind: 'heartPump',
      sv: 'sv',
      hr: 'hr',
      co: 'co',
      sbp: 'sbp',
      dbp: 'dbp',
      map: 'map',
      tpr: 'tpr',
    },
  });

const HEART_OUTPUT = outputPage(
  'g.he-heartPump-output',
  'Cardiac output and mean arterial pressure',
  'Use this for “A heart beats 70 times a minute and ejects 70 mL a beat at 120/80 mmHg. What are the cardiac output and the mean arterial pressure?”',
  { hr: 70, sv: 70, sbp: 120, dbp: 80 },
);

/** Hard exercise, near the top of the ranges: the heart pumps four times as much. */
const HEART_EXERCISE = outputPage(
  'g.he-heartPump-exercise',
  'The heart during hard exercise',
  'Use this for “During a sprint the heart beats 180 times a minute, 110 mL a beat, at 190/80 mmHg. What are the cardiac output and the resistance?”',
  { hr: 180, sv: 110, sbp: 190, dbp: 80 },
);

const ejectionPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'End-diastolic volume (EDV) is the blood in the ventricle when it is fullest, just before it contracts; end-systolic volume (ESV) is what is left after.',
      'The stroke volume is the difference; the ejection fraction is the share of EDV pushed out, about 55 to 70% in a healthy heart.',
    ],
    variables: [
      num('edv', 'EDV', 'End-diastolic volume', 'mL', 20, 400, { step: 1 }),
      num('esv', 'ESV', 'End-systolic volume', 'mL', 5, 350, { step: 1 }),
      svVar(),
      num('ef', 'EF', 'Ejection fraction', '%', 1, 95, { step: 0.1 }),
      hrVar(),
      coVar(),
    ],
    rules: [
      rule(
        'stroke volume',
        '{sv} = {edv} − {esv}',
        ['sv', 'edv', 'esv'],
        (v) => v.sv! - (v.edv! - v.esv!),
        {
          sv: [
            (v) => v.edv! - v.esv!,
            '{edv} − {esv}',
            'What the ventricle held when full minus what was left after it contracted.',
          ],
          edv: [
            (v) => v.sv! + v.esv!,
            '{sv} + {esv}',
            'The blood pushed out plus the blood left behind.',
          ],
          esv: [
            (v) => v.edv! - v.sv!,
            '{edv} − {sv}',
            'The full volume minus the blood pushed out.',
          ],
        },
      ),
      rule(
        'ejection fraction',
        '{ef} = {sv} ÷ {edv} × 100',
        ['ef', 'sv', 'edv'],
        (v) => v.ef! - (v.sv! / v.edv!) * 100,
        {
          ef: [
            (v) => (v.sv! / v.edv!) * 100,
            '{sv} ÷ {edv} × 100',
            'The share of the full ventricle pushed out, written as a percent.',
          ],
          sv: [
            (v) => (v.ef! * v.edv!) / 100,
            '{ef} × {edv} ÷ 100',
            'That percent of the end-diastolic volume is the stroke volume.',
          ],
          edv: [
            (v) => (v.sv! * 100) / v.ef!,
            '{sv} × 100 ÷ {ef}',
            'The stroke volume is EF percent of EDV, so divide it by EF and times by 100.',
          ],
        },
      ),
      coRule,
    ],
    example: example(
      typed,
      ['sv', (v) => v.edv! - v.esv!],
      ['ef', (v) => (v.sv! / v.edv!) * 100],
      ['co', coOf],
    ),
    startWith: ['edv', 'esv', 'hr'],
    representation: {
      kind: 'heartPump',
      edv: 'edv',
      esv: 'esv',
      sv: 'sv',
      ef: 'ef',
      hr: 'hr',
      co: 'co',
    },
  });

const HEART_EJECTION = ejectionPage(
  'g.he-heartPump-ejection',
  'Stroke volume and ejection fraction',
  'Use this for “End-diastolic volume 120 mL, end-systolic 50 mL. What are the stroke volume and ejection fraction?”',
  { edv: 120, esv: 50, hr: 70 },
);

/** A failing, dilated ventricle: a big EDV, a small share of it pushed out. */
const HEART_FAILURE = ejectionPage(
  'g.he-heartPump-failure',
  'A dilated ventricle in heart failure',
  'Use this for “A dilated ventricle holds 220 mL when full and 165 mL after it contracts, at 90 beats a minute. What are its ejection fraction and cardiac output?”',
  { edv: 220, esv: 165, hr: 90 },
);

export const HE4J_GALLERY_MODULES: ModuleDef[] = [
  HEART_OUTPUT,
  HEART_EXERCISE,
  HEART_EJECTION,
  HEART_FAILURE,
];

export const HE4J_GALLERY_LAYOUTS: LayoutDef[] = [sortTissues, sortEpithelia];
