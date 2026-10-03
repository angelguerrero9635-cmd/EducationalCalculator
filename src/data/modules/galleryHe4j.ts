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

// ─── HC156: gait (biomechanics#2, ~phases) ──────────────────────────────────────

/** The page's g (m/s²), written into its relations. */
const G = 9.81;

const vOf = (v: Values) => (v.step! * v.cadence!) / 60;
const frOf = (v: Values) => (v.v! * v.v!) / (G * v.leg!);
const runOf = (v: Values) => Math.sqrt(0.5 * G * v.leg!);

const gaitPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'Steady walking on level ground; a step is heel to heel of opposite feet, a stride heel to heel of the same foot, so two steps.',
      'The Froude number compares the speed with the leg’s pendulum: people switch to a run near Fr = 0.5.',
      'g = 9.81 m/s².',
    ],
    variables: [
      num('step', 'step', 'Step length', 'm', 0.1, 3, { step: 0.01 }),
      num('cadence', 'cadence', 'Cadence', 'steps/min', 20, 250, { step: 1 }),
      num('v', 'v', 'Walking speed', 'm/s', 0.01, 15, { step: 0.01 }),
      num('stride', 'stride', 'Stride length', 'm', 0.2, 6, { step: 0.01 }),
      num('leg', 'L', 'Leg length', 'm', 0.3, 1.2, { step: 0.01 }),
      num('fr', 'Fr', 'Froude number', undefined, 0.0001, 50, { step: 0.001 }),
      num('vrun', 'v_run', 'Walk–run speed', 'm/s', 0.5, 5, { step: 0.01 }),
    ],
    rules: [
      rule(
        'speed',
        '{v} = {step} × {cadence} ÷ 60',
        ['v', 'step', 'cadence'],
        (v) => v.v! - vOf(v),
        {
          v: [
            vOf,
            '{step} × {cadence} ÷ 60',
            'Each step moves the body one step length; cadence counts the steps a minute, and a minute is 60 s.',
          ],
          step: [
            (v) => (v.v! * 60) / v.cadence!,
            '{v} × 60 ÷ {cadence}',
            'The meters a minute shared over the steps in that minute.',
          ],
          cadence: [
            (v) => (v.v! * 60) / v.step!,
            '{v} × 60 ÷ {step}',
            'The meters a minute divided by the meters a step.',
          ],
        },
      ),
      rule('stride', '{stride} = 2 × {step}', ['stride', 'step'], (v) => v.stride! - 2 * v.step!, {
        stride: [(v) => 2 * v.step!, '2 × {step}', 'A stride is two steps: left then right.'],
        step: [(v) => v.stride! / 2, '{stride} ÷ 2', 'A step is half a stride.'],
      }),
      rule('froude', '{fr} = {v}² ÷ (9.81 × {leg})', ['fr', 'v', 'leg'], (v) => v.fr! - frOf(v), {
        fr: [
          frOf,
          '{v}² ÷ (9.81 × {leg})',
          'The speed squared over g times the leg length: how fast the walk is for the leg.',
        ],
        v: [
          (v) => Math.sqrt(v.fr! * G * v.leg!),
          '√({fr} × 9.81 × {leg})',
          'Undo the square: the square root of Fr times g times L.',
        ],
        leg: [
          (v) => (v.v! * v.v!) / (G * v.fr!),
          '{v}² ÷ (9.81 × {fr})',
          'Swap Fr and L: the speed squared over g times Fr.',
        ],
      }),
      rule(
        'walk-run speed',
        '{vrun} = √(0.5 × 9.81 × {leg})',
        ['vrun', 'leg'],
        (v) => v.vrun! - runOf(v),
        {
          vrun: [
            runOf,
            '√(0.5 × 9.81 × {leg})',
            'The speed where Fr reaches 0.5: v² = 0.5gL, so v is its square root.',
          ],
          leg: [
            (v) => (v.vrun! * v.vrun!) / (0.5 * G),
            '{vrun}² ÷ (0.5 × 9.81)',
            'Square the speed and divide by 0.5g.',
          ],
        },
      ),
    ],
    example: example(
      typed,
      ['v', vOf],
      ['stride', (v) => 2 * v.step!],
      ['fr', frOf],
      ['vrun', runOf],
    ),
    startWith: ['step', 'cadence', 'leg'],
    representation: {
      kind: 'footprints',
      step: 'step',
      cadence: 'cadence',
      stride: 'stride',
      speed: 'v',
      leg: 'leg',
      froude: 'fr',
      runSpeed: 'vrun',
      g: G,
    },
  });

const GAIT_WALK = gaitPage(
  'g.he-footprints-walk',
  'Walking speed from step length and cadence',
  'Use this for “A person takes 0.70 m steps at 110 steps a minute with 0.9 m legs. How fast are they walking, and when would they break into a run?”',
  { step: 0.7, cadence: 110, leg: 0.9 },
);

/** A run: long steps at a high cadence, well past Fr = 0.5. */
const GAIT_RUN = gaitPage(
  'g.he-footprints-run',
  'Running: long steps, high cadence',
  'Use this for “A runner takes 1.6 m steps at 180 steps a minute with 0.9 m legs. How fast, and what is the Froude number?”',
  { step: 1.6, cadence: 180, leg: 0.9 },
);

/** A toddler: short legs, short quick steps. */
const GAIT_TODDLER = gaitPage(
  'g.he-footprints-toddler',
  'A toddler’s short quick steps',
  'Use this for “A toddler with 0.35 m legs takes 0.25 m steps at 170 a minute. How fast is that, and how close to a run?”',
  { step: 0.25, cadence: 170, leg: 0.35 },
);

const gaitPhases: LayoutDef = {
  kind: 'sequence',
  id: 'g.he-gait-phases',
  title: 'The phases of the gait cycle',
  use: 'Use this for naming and ordering the phases of the gait cycle, and how long each lasts.',
  assumptions: [
    'One cycle runs from one heel strike to the next of the same foot: one stride.',
    'The lit leg is the one the phase names: it stands for about 60% of the cycle (stance) and swings for 40%.',
    'Each span is the share of the cycle from that event to the next, in a typical walk.',
  ],
  question: 'Put the phases of one leg’s gait cycle in order.',
  stages: [
    { label: 'Heel strike', span: 2, figure: { kind: 'gait', phase: 'heelStrike' } },
    { label: 'Foot flat', span: 10, figure: { kind: 'gait', phase: 'footFlat' } },
    { label: 'Midstance', span: 20, figure: { kind: 'gait', phase: 'midstance' } },
    { label: 'Heel off', span: 20, figure: { kind: 'gait', phase: 'heelOff' } },
    { label: 'Toe off', span: 8, figure: { kind: 'gait', phase: 'toeOff' } },
    { label: 'Midswing', span: 40, figure: { kind: 'gait', phase: 'midswing' } },
  ],
  unit: '% of the cycle',
  totalLabel: 'Gait cycle',
};

// ─── HC157: viscoelasticity (biomechanics#3, ~creep) ────────────────────────────

const tauRule = rule(
  'time constant',
  '{tau} = {eta} ÷ {E}',
  ['tau', 'eta', 'E'],
  (v) => v.tau! - v.eta! / v.E!,
  {
    tau: [
      (v) => v.eta! / v.E!,
      '{eta} ÷ {E}',
      'The dashpot’s viscosity over the spring’s modulus: how long the dashpot takes to undo the spring.',
    ],
    eta: [
      (v) => v.tau! * v.E!,
      '{tau} × {E}',
      'The viscosity is the time constant times the modulus.',
    ],
    E: [
      (v) => v.eta! / v.tau!,
      '{eta} ÷ {tau}',
      'The modulus is the viscosity over the time constant.',
    ],
  },
);

const modulusVars = () => [
  num('E', 'E', 'Spring modulus', 'MPa', 0.01, 100000, { step: 0.01 }),
  num('eta', 'η', 'Dashpot viscosity', 'MPa·s', 0.001, 1e7, { step: 0.1 }),
  num('tau', 'τ', 'Time constant', 's', 0.001, 1e6, { step: 0.1 }),
  num('t', 't', 'Time', 's', 0.001, 1e6, { step: 1 }),
];

const sigmaOf = (v: Values) => v.s0! * Math.exp(-v.t! / v.tau!);

const relaxPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'A Maxwell solid: a spring and a dashpot in series, stretched to ε₀ and held there.',
      'At first the spring takes all the stretch; the dashpot slowly gives way and the stress relaxes.',
      'After one time constant τ, 37% of the stress is left (e⁻¹).',
    ],
    variables: [
      ...modulusVars(),
      num('e0', 'ε₀', 'Held strain', undefined, 0.0001, 0.5, { step: 0.001 }),
      num('s0', 'σ₀', 'Starting stress', 'MPa', 0.000001, 50000, { step: 0.001 }),
      num('sigma', 'σ', 'Stress at t', 'MPa', 0.000001, 50000, { step: 0.001 }),
    ],
    rules: [
      tauRule,
      rule('starting stress', '{s0} = {E} × {e0}', ['s0', 'E', 'e0'], (v) => v.s0! - v.E! * v.e0!, {
        s0: [(v) => v.E! * v.e0!, '{E} × {e0}', 'At first only the spring stretches: Hooke’s law.'],
        E: [(v) => v.s0! / v.e0!, '{s0} ÷ {e0}', 'The modulus is the stress over the strain.'],
        e0: [(v) => v.s0! / v.E!, '{s0} ÷ {E}', 'The strain is the stress over the modulus.'],
      }),
      rule(
        'relaxation',
        '{sigma} = {s0} × e^(−{t} ÷ {tau})',
        ['sigma', 's0', 't', 'tau'],
        (v) => v.sigma! - sigmaOf(v),
        {
          sigma: [
            sigmaOf,
            '{s0} × e^(−{t} ÷ {tau})',
            'The stress falls by the factor e^(−t/τ) as the dashpot gives way.',
          ],
          s0: [
            (v) => v.sigma! * Math.exp(v.t! / v.tau!),
            '{sigma} × e^({t} ÷ {tau})',
            'Undo the decay: multiply by e^(t/τ).',
          ],
          t: [
            (v) => v.tau! * Math.log(v.s0! / v.sigma!),
            '{tau} × ln({s0} ÷ {sigma})',
            'Take the natural log of how many times the stress has fallen, then times τ.',
          ],
          tau: [
            (v) => v.t! / Math.log(v.s0! / v.sigma!),
            '{t} ÷ ln({s0} ÷ {sigma})',
            'The time divided by the natural log of how many times the stress has fallen.',
          ],
        },
      ),
    ],
    example: example(
      typed,
      ['tau', (v) => v.eta! / v.E!],
      ['s0', (v) => v.E! * v.e0!],
      ['sigma', sigmaOf],
    ),
    startWith: ['E', 'eta', 'e0', 't'],
    representation: {
      kind: 'springDashpot',
      model: 'maxwell',
      E: 'E',
      eta: 'eta',
      tau: 'tau',
      t: 't',
      strain0: 'e0',
      stress0: 's0',
      stress: 'sigma',
    },
  });

const RELAX = relaxPage(
  'g.he-springDashpot-relax',
  'Stress relaxation in a Maxwell solid',
  'Use this for “A tissue with E = 10 MPa and η = 500 MPa·s is held at 5% strain. What stress is left after 50 s?”',
  { E: 10, eta: 500, e0: 0.05, t: 50 },
);

/** Four time constants on: under 2% of the stress is left. */
const RELAX_LATE = relaxPage(
  'g.he-springDashpot-relax-late',
  'Stress almost gone after four time constants',
  'Use this for “The same tissue is held at 5% strain for 200 s. How much of the stress is left?”',
  { E: 10, eta: 500, e0: 0.05, t: 200 },
);

const finalOf = (v: Values) => v.sigma! / v.E!;
const strainOf = (v: Values) => v.final! * (1 - Math.exp(-v.t! / v.tau!));

const creepPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'A Kelvin–Voigt solid: a spring and a dashpot side by side, under a stress held from t = 0.',
      'The dashpot slows the stretch; the strain creeps toward σ ÷ E, where the spring takes all the load, and never flows past it.',
      'After one time constant τ the strain is 63% of the way there (1 − e⁻¹).',
    ],
    variables: [
      num('sigma', 'σ', 'Held stress', 'MPa', 0.0001, 50000, { step: 0.01 }),
      ...modulusVars(),
      num('final', 'ε_∞', 'Final strain', undefined, 0.000001, 10, { step: 0.0001 }),
      num('strain', 'ε', 'Strain at t', undefined, 0.000001, 10, { step: 0.0001 }),
    ],
    rules: [
      tauRule,
      rule(
        'final strain',
        '{final} = {sigma} ÷ {E}',
        ['final', 'sigma', 'E'],
        (v) => v.final! - finalOf(v),
        {
          final: [finalOf, '{sigma} ÷ {E}', 'In the end the spring carries the whole stress.'],
          sigma: [
            (v) => v.final! * v.E!,
            '{final} × {E}',
            'The stress is the modulus times the final strain.',
          ],
          E: [
            (v) => v.sigma! / v.final!,
            '{sigma} ÷ {final}',
            'The modulus is the stress over the final strain.',
          ],
        },
      ),
      rule(
        'creep',
        '{strain} = {final} × (1 − e^(−{t} ÷ {tau}))',
        ['strain', 'final', 't', 'tau'],
        (v) => v.strain! - strainOf(v),
        {
          strain: [
            strainOf,
            '{final} × (1 − e^(−{t} ÷ {tau}))',
            'The share of the final strain reached by t is 1 − e^(−t/τ).',
          ],
          final: [
            (v) => v.strain! / (1 - Math.exp(-v.t! / v.tau!)),
            '{strain} ÷ (1 − e^(−{t} ÷ {tau}))',
            'Divide the strain by the share reached so far.',
          ],
          t: [
            (v) => -v.tau! * Math.log(1 - v.strain! / v.final!),
            '−{tau} × ln(1 − {strain} ÷ {final})',
            'The share still to go is e^(−t/τ): take its natural log and times by −τ.',
          ],
          tau: [
            (v) => -v.t! / Math.log(1 - v.strain! / v.final!),
            '−{t} ÷ ln(1 − {strain} ÷ {final})',
            'The time divided by minus the natural log of the share still to go.',
          ],
        },
      ),
    ],
    example: example(
      typed,
      ['eta', (v) => v.tau! * v.E!],
      ['final', finalOf],
      ['strain', strainOf],
    ),
    startWith: ['sigma', 'E', 'tau', 't'],
    representation: {
      kind: 'springDashpot',
      model: 'kelvin',
      E: 'E',
      eta: 'eta',
      tau: 'tau',
      t: 't',
      load: 'sigma',
      strain: 'strain',
      final: 'final',
    },
  });

const CREEP = creepPage(
  'g.he-springDashpot-creep',
  'Creep in a Kelvin–Voigt solid',
  'Use this for “A ligament model with E = 10 MPa and τ = 50 s carries 0.5 MPa. What is its strain after 100 s?”',
  { sigma: 0.5, E: 10, tau: 50, t: 100 },
);

/** A fifth of a time constant in: the strain has barely begun to creep. */
const CREEP_EARLY = creepPage(
  'g.he-springDashpot-creep-early',
  'The first seconds of creep',
  'Use this for “The same ligament model has carried 0.5 MPa for 10 s. How far has it crept?”',
  { sigma: 0.5, E: 10, tau: 50, t: 10 },
);

// ─── HC159: diffusion in tissue (biotransport#0) ────────────────────────────────

/** t = L² ÷ (2D) with L in μm (10,000 μm to the cm) and D in cm²/s. */
const tOf = (v: Values) => (v.L! / 10000) ** 2 / (2 * v.D!);

const diffusionPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'One-dimensional spread from a face held at a fixed concentration, into tissue with none at first.',
      't = L² ÷ (2D) is a typical time to spread a distance L, not an exact arrival: at L the concentration is about a third of the source’s.',
      'The time grows with the square of the distance: doubling L takes four times as long.',
    ],
    variables: [
      num('D', 'D', 'Diffusivity', 'cm²/s', 1e-10, 0.1, { scientific: true, step: 1e-7 }),
      num('L', 'L', 'Distance', 'μm', 0.01, 100000, { step: 1 }),
      num('t', 't', 'Time to spread', 's', 1e-6, 1e10, { step: 0.1 }),
    ],
    rules: [
      rule(
        'diffusion time',
        '{t} = ({L} ÷ 10000)² ÷ (2 × {D})',
        ['t', 'L', 'D'],
        (v) => v.t! - tOf(v),
        {
          t: [
            tOf,
            '({L} ÷ 10000)² ÷ (2 × {D})',
            'Change L to cm (10,000 μm to the cm), square it, and divide by twice the diffusivity.',
          ],
          L: [
            (v) => 10000 * Math.sqrt(2 * v.D! * v.t!),
            '10000 × √(2 × {D} × {t})',
            'The distance in cm is √(2Dt); times 10,000 gives μm.',
          ],
          D: [
            (v) => (v.L! / 10000) ** 2 / (2 * v.t!),
            '({L} ÷ 10000)² ÷ (2 × {t})',
            'Swap D and t: the squared distance in cm over twice the time.',
          ],
        },
      ),
    ],
    example: example(typed, ['t', tOf]),
    startWith: ['D', 'L'],
    representation: { kind: 'diffusionProfile', D: 'D', L: 'L', t: 't' },
  });

const DIFFUSE = diffusionPage(
  'g.he-diffusionProfile-oxygen',
  'Oxygen diffusing into tissue',
  'Use this for “Oxygen diffuses through tissue at 2 × 10⁻⁵ cm²/s. About how long does it take to spread 100 μm?”',
  { D: 2e-5, L: 100 },
);

/** A centimeter: 10,000 times the time of 100 μm. */
const DIFFUSE_FAR = diffusionPage(
  'g.he-diffusionProfile-centimeter',
  'Why diffusion cannot feed a centimeter of tissue',
  'Use this for “How long does oxygen take to diffuse 1 cm through tissue, at 2 × 10⁻⁵ cm²/s?”',
  { D: 2e-5, L: 10000 },
);

/** A large protein diffuses 200 times more slowly than oxygen. */
const DIFFUSE_PROTEIN = diffusionPage(
  'g.he-diffusionProfile-protein',
  'A growth factor spreading through a gel',
  'Use this for “A growth factor diffuses at 1 × 10⁻⁷ cm²/s. How long does it take to spread 100 μm?”',
  { D: 1e-7, L: 100 },
);

export const HE4J_GALLERY_MODULES: ModuleDef[] = [
  HEART_OUTPUT,
  HEART_EXERCISE,
  HEART_EJECTION,
  HEART_FAILURE,
  GAIT_WALK,
  GAIT_RUN,
  GAIT_TODDLER,
  RELAX,
  RELAX_LATE,
  CREEP,
  CREEP_EARLY,
  DIFFUSE,
  DIFFUSE_FAR,
  DIFFUSE_PROTEIN,
];

// ─── HC158: biomaterials and imaging (biomaterials#1~classes, bioinstrumentation#2~modalities) ─

const sortBiomaterials: LayoutDef = {
  id: 'g.he-cardIcons-biomaterials',
  title: 'Metal, polymer or ceramic?',
  kind: 'sort',
  use: 'Use this for sorting implant materials into metals, polymers and ceramics, and why each class is chosen.',
  assumptions: [
    'Metals bear load, polymers bend or dissolve, ceramics wear little but crack.',
    'A coating counts as its own material: the stem under it is still metal.',
  ],
  question: 'Which class of material is each implant made of?',
  bins: [
    {
      id: 'metal',
      label: 'Metal',
      why: 'Strong and tough: stems, screws and heads that carry the body’s weight.',
    },
    {
      id: 'polymer',
      label: 'Polymer',
      why: 'Long-chain molecules: a slippery liner, a grout, a thread that dissolves.',
    },
    {
      id: 'ceramic',
      label: 'Ceramic',
      why: 'Hard and inert, or bone-like: wears little but cannot bend.',
    },
  ],
  cards: [
    icon('Ti-6Al-4V hip stem', 'metal', 'titanium hip stem'),
    icon('CoCrMo femoral head', 'metal', 'CoCrMo femoral head'),
    icon('316L bone screw', 'metal', 'steel bone screw'),
    icon('UHMWPE cup liner', 'polymer', 'polyethylene cup liner'),
    icon('PMMA bone cement', 'polymer', 'PMMA bone cement'),
    icon('PLGA suture', 'polymer', 'PLGA suture'),
    icon('Alumina femoral head', 'ceramic', 'alumina femoral head'),
    icon('Hydroxyapatite coating', 'ceramic', 'hydroxyapatite-coated stem'),
  ],
};

const sortModalities: LayoutDef = {
  id: 'g.he-cardIcons-imaging',
  title: 'Ionizing or not?',
  kind: 'sort',
  use: 'Use this for sorting medical imaging methods by whether they use ionizing radiation.',
  assumptions: [
    'Ionizing radiation (X-rays and gamma rays) carries enough energy to knock electrons off atoms, so its dose is kept low.',
    'Magnetic fields, radio waves, sound and near-infrared light do not ionize.',
  ],
  question: 'Does each method expose the patient to ionizing radiation?',
  bins: [
    {
      id: 'ionizing',
      label: 'Ionizing',
      why: 'X-rays pass through the body, or a tracer gives off gamma rays.',
    },
    {
      id: 'non',
      label: 'Non-ionizing',
      why: 'Radio waves in a magnet, sound echoes or light: no ionizing dose.',
    },
  ],
  cards: [
    icon('X-ray', 'ionizing', 'X-ray tube'),
    icon('CT', 'ionizing', 'CT scanner'),
    icon('PET', 'ionizing', 'PET scanner'),
    icon('SPECT', 'ionizing', 'SPECT camera'),
    icon('MRI', 'non', 'MRI scanner'),
    icon('Ultrasound', 'non', 'ultrasound probe'),
    icon('Optical coherence tomography', 'non', 'OCT probe'),
  ],
};

export const HE4J_GALLERY_LAYOUTS: LayoutDef[] = [
  sortTissues,
  sortEpithelia,
  gaitPhases,
  sortBiomaterials,
  sortModalities,
];
