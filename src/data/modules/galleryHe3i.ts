/**
 * College gallery demos, round 3, group I (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC81 `simpleMachine` `limb`: joint forces (docs/plans/he.biology.md, P21). HC82 `binaryPhase`,
 * HC83 `machining`, HC84 `linkage` and the HC85 card icons: docs/plans/he.mechanical.md (P8,
 * P19, P29, P31).
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

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

const div = (a: number, b: number) => (b === 0 || !Number.isFinite(b) ? undefined : a / b);
const st = (expr: string, how: string): StepText => ({ expr, how });

/** A demo module: the shared fields filled in (college pages show 4 figures). */
const demo = (m: Omit<ModuleDef, 'workedFigures'> & { workedFigures?: number }): ModuleDef => ({
  workedFigures: 4,
  ...m,
});

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

// ── HC81: a limb as a lever (biomechanics#1, ~hip; anatomy-physiology#1) ──

const force = (id: string, symbol: string, name: string, max = 5000) =>
  quantity(id, symbol, name, 'N', 0, max, 0.1);
const arm = (id: string, symbol: string, name: string, min = 0, max = 60) =>
  quantity(id, symbol, name, 'cm', min, max, 0.1);

/** F_M d_M = Σ F d about the joint, for the muscle and the loads named. */
const momentRule = (
  muscle: string,
  muscleArm: string,
  loads: [string, string][],
  joint: string,
  sym: { muscle: string; arm: string },
  share = 1,
  shareText = '',
): Rule => {
  const sum = (x: Values) =>
    loads.reduce((s, [f, d], i) => s + (i === 0 ? share : 1) * x[f]! * x[d]!, 0);
  const sumText = loads
    .map(([f, d], i) => `${i === 0 && shareText ? `${shareText} × ` : ''}{${f}} × {${d}}`)
    .join(' + ');
  const [f0, d0] = loads[0]!;
  const rest = (x: Values) => loads.slice(1).reduce((s, [f, d]) => s + x[f]! * x[d]!, 0);
  const restText = loads
    .slice(1)
    .map(([f, d]) => ` − {${f}} × {${d}}`)
    .join('');
  return {
    relation: {
      id: `${sym.muscle}${sym.arm} = ΣFd about the ${joint}`,
      display: `{${muscle}} × {${muscleArm}} = ${sumText}`,
      vars: [muscle, muscleArm, ...loads.flat()],
      residual: (x) => x[muscle]! * x[muscleArm]! - sum(x),
      solve: {
        [muscle]: (x) => div(sum(x), x[muscleArm]!),
        [muscleArm]: (x) => div(sum(x), x[muscle]!),
        [f0]: (x) => div(x[muscle]! * x[muscleArm]! - rest(x), share * x[d0]!),
        [d0]: (x) => div(x[muscle]! * x[muscleArm]! - rest(x), share * x[f0]!),
      },
    },
    steps: {
      [muscle]: st(
        `(${sumText}) ÷ {${muscleArm}}`,
        `Moments about the ${joint} balance: the loads’ moments over the muscle’s arm.`,
      ),
      [muscleArm]: st(`(${sumText}) ÷ {${muscle}}`, 'The loads’ moments over the muscle force.'),
      [f0]: st(
        `({${muscle}} × {${muscleArm}}${restText}) ÷ (${shareText ? `${shareText} × ` : ''}{${d0}})`,
        'The muscle’s moment, less the other loads’, over this load’s arm.',
      ),
      [d0]: st(
        `({${muscle}} × {${muscleArm}}${restText}) ÷ (${shareText ? `${shareText} × ` : ''}{${f0}})`,
        'The muscle’s moment, less the other loads’, over this load.',
      ),
    },
  };
};

const forearmLoad = demo({
  id: 'g.he-simpleMachine-limb-forearm',
  title: 'Biceps and elbow forces holding a ball',
  use: 'Use this for the biceps force and the elbow’s joint force when the hand holds a weight, the forearm’s own weight included.',
  assumptions: [
    'The forearm is level and still: the moments about the elbow add to zero.',
    'The muscle, the weights and the joint force are vertical.',
    'F_J > 0 means the upper arm pushes down on the forearm.',
  ],
  variables: [
    force('L', 'L', 'Load in the hand', 500),
    arm('dL', 'd_L', 'Load arm', 1),
    force('Wf', 'W_f', 'Forearm weight', 100),
    arm('df', 'd_f', 'Forearm weight arm', 1),
    arm('dM', 'd_M', 'Muscle arm', 1, 10),
    force('FM', 'F_M', 'Muscle force'),
    quantity('FJ', 'F_J', 'Joint force', 'N', -5000, 5000, 0.1),
  ],
  ...rules(
    momentRule(
      'FM',
      'dM',
      [
        ['L', 'dL'],
        ['Wf', 'df'],
      ],
      'elbow',
      { muscle: 'F_M', arm: 'd_M' },
    ),
    {
      relation: {
        id: 'F_J = F_M − W_f − L',
        display: '{FJ} = {FM} − {Wf} − {L}',
        vars: ['FJ', 'FM', 'Wf', 'L'],
        residual: (x) => x.FJ! - (x.FM! - x.Wf! - x.L!),
        solve: {
          FJ: (x) => x.FM! - x.Wf! - x.L!,
          FM: (x) => x.FJ! + x.Wf! + x.L!,
          Wf: (x) => x.FM! - x.FJ! - x.L!,
          L: (x) => x.FM! - x.FJ! - x.Wf!,
        },
      },
      steps: {
        FJ: st(
          '{FM} − {Wf} − {L}',
          'Up and down balance: the muscle pulls up, the weights and the elbow push down.',
        ),
        FM: st('{FJ} + {Wf} + {L}', 'The muscle holds up the weights and the elbow’s push.'),
        Wf: st('{FM} − {FJ} − {L}', 'What the muscle lifts, less the elbow’s push and the load.'),
        L: st(
          '{FM} − {FJ} − {Wf}',
          'What the muscle lifts, less the elbow’s push and the forearm.',
        ),
      },
    },
  ),
  example: { L: 50, dL: 35, Wf: 15, df: 15, dM: 4, FM: 1975 / 4, FJ: 1975 / 4 - 65 },
  startWith: ['L', 'dL', 'Wf', 'df', 'dM'],
  representation: {
    kind: 'simpleMachine',
    machine: 'lever',
    load: 'L',
    loadArm: 'dL',
    effortArm: 'dM',
    effort: 'FM',
    limb: { body: 'forearm', loads: [{ force: 'Wf', arm: 'df', name: 'W_f' }], joint: 'FJ' },
  },
});

const forearmLevel = demo({
  id: 'g.he-simpleMachine-limb-forearm-level',
  title: 'The biceps as a third-class lever',
  use: 'Use this for the muscle force that holds a load in the hand, and the arm’s mechanical advantage.',
  assumptions: [
    'The elbow is the fulcrum and the forearm is held level.',
    'The forearm’s own weight is left out.',
  ],
  variables: [
    force('L', 'L', 'Load in the hand', 500),
    arm('dL', 'd_L', 'Load arm', 1),
    arm('dM', 'd_M', 'Muscle arm', 1, 10),
    force('FM', 'F_M', 'Muscle force'),
    quantity('MA', 'MA', 'Mechanical advantage', undefined, 0.001, 10, 0.001),
  ],
  ...rules(momentRule('FM', 'dM', [['L', 'dL']], 'elbow', { muscle: 'F_M', arm: 'd_M' }), {
    relation: {
      id: 'MA = d_M ÷ d_L',
      display: '{MA} = {dM} ÷ {dL}',
      vars: ['MA', 'dM', 'dL'],
      residual: (x) => x.MA! * x.dL! - x.dM!,
      solve: {
        MA: (x) => div(x.dM!, x.dL!),
        dM: (x) => x.MA! * x.dL!,
        dL: (x) => div(x.dM!, x.MA!),
      },
    },
    steps: {
      MA: st(
        '{dM} ÷ {dL}',
        'The muscle’s arm over the load’s arm: below 1 for a third-class lever.',
      ),
      dM: st('{MA} × {dL}', 'The advantage times the load arm.'),
      dL: st('{dM} ÷ {MA}', 'The muscle arm over the advantage.'),
    },
  }),
  example: { L: 20, dL: 32, dM: 4, FM: 160, MA: 0.125 },
  startWith: ['L', 'dL', 'dM'],
  representation: {
    kind: 'simpleMachine',
    machine: 'lever',
    load: 'L',
    loadArm: 'dL',
    effortArm: 'dM',
    effort: 'FM',
    advantage: 'MA',
    limb: { body: 'forearm' },
  },
});

const hipDemo = (id: string, title: string, W: number, dab: number, dW: number) => {
  const Fab = ((5 / 6) * W * dW) / dab;
  const FJ = Fab + (5 / 6) * W;
  return demo({
    id,
    title,
    use: 'Use this for “On one leg, how hard does the hip joint push when the abductors are half as far out as the body’s weight?”',
    assumptions: [
      'The stance leg is 1/6 of body weight, so 5/6 W acts at the body’s centre.',
      'The forces are vertical and the pelvis is level and still.',
    ],
    variables: [
      quantity('W', 'W', 'Body weight', 'N', 100, 2000, 0.1),
      arm('dab', 'd_ab', 'Abductor arm', 1, 20),
      arm('dW', 'd_W', 'Weight arm', 1, 30),
      force('Fab', 'F_ab', 'Abductor force', 20000),
      force('FJ', 'F_J', 'Joint force', 30000),
      quantity('ratio', 'F_J/W', 'Joint force in body weights', undefined, 0, 30, 0.01),
    ],
    ...rules(
      momentRule(
        'Fab',
        'dab',
        [['W', 'dW']],
        'hip joint',
        { muscle: 'F_ab', arm: 'd_ab' },
        5 / 6,
        '(5 ÷ 6)',
      ),
      {
        relation: {
          id: 'F_J = F_ab + (5/6)W',
          display: '{FJ} = {Fab} + (5 ÷ 6) × {W}',
          vars: ['FJ', 'Fab', 'W'],
          residual: (x) => x.FJ! - x.Fab! - (5 / 6) * x.W!,
          solve: {
            FJ: (x) => x.Fab! + (5 / 6) * x.W!,
            Fab: (x) => x.FJ! - (5 / 6) * x.W!,
            W: (x) => ((x.FJ! - x.Fab!) * 6) / 5,
          },
        },
        steps: {
          FJ: st(
            '{Fab} + (5 ÷ 6) × {W}',
            'The joint pushes up on both downward pulls: the abductors and the body.',
          ),
          Fab: st('{FJ} − (5 ÷ 6) × {W}', 'The joint’s push, less the body’s share.'),
          W: st(
            '({FJ} − {Fab}) × 6 ÷ 5',
            'What is left of the joint’s push is 5/6 of the body weight.',
          ),
        },
      },
      {
        relation: {
          id: 'F_J ÷ W',
          display: '{ratio} = {FJ} ÷ {W}',
          vars: ['ratio', 'FJ', 'W'],
          residual: (x) => x.ratio! * x.W! - x.FJ!,
          solve: { ratio: (x) => div(x.FJ!, x.W!), FJ: (x) => x.ratio! * x.W! },
        },
        steps: {
          ratio: st('{FJ} ÷ {W}', 'The joint force in body weights.'),
          FJ: st('{ratio} × {W}', 'Body weights times the weight.'),
        },
      },
    ),
    example: { W, dab, dW, Fab, FJ, ratio: FJ / W },
    startWith: ['W', 'dab', 'dW'],
    representation: {
      kind: 'simpleMachine',
      machine: 'lever',
      load: 'W',
      loadArm: 'dW',
      effortArm: 'dab',
      effort: 'Fab',
      limb: { body: 'hip', joint: 'FJ', ratio: 'ratio' },
    },
  });
};

const hipStance = hipDemo(
  'g.he-simpleMachine-limb-hip',
  'The hip joint force in single-leg stance',
  700,
  5,
  10,
);
const hipHeavy = hipDemo(
  'g.he-simpleMachine-limb-hip-short-arm',
  'A short abductor arm: the hip force climbs',
  1500,
  3.5,
  11,
);

export const HE3I_GALLERY_MODULES: ModuleDef[] = [forearmLoad, forearmLevel, hipStance, hipHeavy];

export const HE3I_GALLERY_LAYOUTS: LayoutDef[] = [];
