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

/** a < b, checked only (a page limit); `why` is the reason a conflict is refused. */
const below = (a: string, b: string, display: string, why: string): Rule => ({
  relation: {
    id: `${a} < ${b}`,
    constraint: true,
    display,
    vars: [a, b],
    residual: (v: Values) => (v[a]! < v[b]! ? 0 : 1),
    solve: {},
    message: () => why,
  },
  steps: {},
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

// ── HC82: phase diagrams and the lever rule (materials-science#2, ~eutectic, ~steel) ──

const wtp = (id: string, symbol: string, name: string, max = 100) =>
  quantity(id, symbol, name, 'wt%', 0, max, 0.001);
const share = (id: string, symbol: string, name: string) =>
  quantity(id, symbol, name, undefined, 0, 1, 0.0001);

/**
 * The lever rule on a tie line from `lo` to `hi` (ids, or a fixed number with its text): the
 * share `w` of the phase at `hi` is (C₀ − C_lo) ÷ (C_hi − C_lo); `rest` is 1 minus it.
 */
const leverRules = (
  c0: string,
  lo: string | [number, string],
  hi: string | [number, string],
  w: string,
  rest: string,
  name: string,
  restName: string,
): Rule[] => {
  const val = (x: string | [number, string], v: Values) => (typeof x === 'string' ? v[x]! : x[0]);
  const txt = (x: string | [number, string]) => (typeof x === 'string' ? `{${x}}` : x[1]);
  const ids = [c0, w, ...[lo, hi].filter((x): x is string => typeof x === 'string')];
  const solve: Record<string, (v: Values) => number | undefined> = {
    [w]: (v) => div(v[c0]! - val(lo, v), val(hi, v) - val(lo, v)),
    [c0]: (v) => val(lo, v) + v[w]! * (val(hi, v) - val(lo, v)),
  };
  const steps: Record<string, StepText> = {
    [w]: st(
      `({${c0}} − ${txt(lo)}) ÷ (${txt(hi)} − ${txt(lo)})`,
      `The lever rule: the ${name} share is the arm on the far side of C₀ over the tie line.`,
    ),
    [c0]: st(
      `${txt(lo)} + {${w}} × (${txt(hi)} − ${txt(lo)})`,
      'The alloy sits that share of the way along the tie line.',
    ),
  };
  if (typeof lo === 'string') {
    solve[lo] = (v) => div(v[c0]! - v[w]! * val(hi, v), 1 - v[w]!);
    steps[lo] = st(
      `({${c0}} − {${w}} × ${txt(hi)}) ÷ (1 − {${w}})`,
      'Solve the lever rule for this end of the tie line.',
    );
  }
  if (typeof hi === 'string') {
    solve[hi] = (v) => div(v[c0]! - val(lo, v) * (1 - v[w]!), v[w]!);
    steps[hi] = st(
      `({${c0}} − ${txt(lo)} × (1 − {${w}})) ÷ {${w}}`,
      'Solve the lever rule for this end of the tie line.',
    );
  }
  return [
    {
      relation: {
        id: `${w} by the lever rule`,
        display: `{${w}} = ({${c0}} − ${txt(lo)}) ÷ (${txt(hi)} − ${txt(lo)})`,
        vars: ids,
        residual: (v) => v[w]! * (val(hi, v) - val(lo, v)) - (v[c0]! - val(lo, v)),
        solve,
      },
      steps,
    },
    {
      relation: {
        id: `${rest} = 1 − ${w}`,
        display: `{${rest}} = 1 − {${w}}`,
        vars: [rest, w],
        residual: (v) => v[rest]! + v[w]! - 1,
        solve: { [rest]: (v) => 1 - v[w]!, [w]: (v) => 1 - v[rest]! },
      },
      steps: {
        [rest]: st(`1 − {${w}}`, `The two shares add to 1: the ${restName} is the rest.`),
        [w]: st(`1 − {${rest}}`, 'The two shares add to 1.'),
      },
    },
  ];
};

const isoDemo = (id: string, title: string, C0: number) => {
  const [CL, Ca] = [31.5, 42.5];
  const WL = (Ca - C0) / (Ca - CL);
  return demo({
    id,
    title,
    use: 'Use this for the shares of liquid and solid in a two-phase alloy, read on the tie line at its temperature.',
    assumptions: [
      'The alloy is inside the two-phase region.',
      'C_L and C_α are read on the tie line at T.',
    ],
    variables: [
      wtp('C0', 'C_0', 'Alloy composition'),
      wtp('CL', 'C_L', 'Liquid composition'),
      wtp('Ca', 'C_α', 'Solid composition'),
      share('WL', 'W_L', 'Liquid share'),
      share('Wa', 'W_α', 'Solid share'),
    ],
    // The liquid's share is the arm from C₀ to C_α: the lever on the tie line from C_α to C_L.
    ...rules(...leverRules('C0', 'Ca', 'CL', 'WL', 'Wa', 'liquid', 'solid')),
    example: { C0, CL, Ca, WL, Wa: 1 - WL },
    startWith: ['C0', 'CL', 'Ca'],
    representation: {
      kind: 'binaryPhase',
      system: 'isomorphous',
      names: ['Cu', 'Ni'],
      c0: 'C0',
      cl: 'CL',
      calpha: 'Ca',
      temperature: 1250,
      melts: [1085, 1455],
      wl: 'WL',
      walpha: 'Wa',
    },
  });
};

const binaryIso = isoDemo('g.he-binaryPhase-isomorphous', 'Liquid and solid in a Cu–Ni alloy', 35);
const binaryIsoEdge = isoDemo(
  'g.he-binaryPhase-isomorphous-near-liquidus',
  'Just inside the lens: nearly all liquid',
  32,
);

const binaryEutectic = (() => {
  const [Ca, CE, C0] = [18.3, 61.9, 40];
  const We = (C0 - Ca) / (CE - Ca);
  return demo({
    id: 'g.he-binaryPhase-eutectic',
    title: 'Eutectic and primary α in a Pb–Sn alloy',
    use: 'Use this for how much of a hypoeutectic alloy ends up as eutectic and how much as primary α.',
    assumptions: [
      'Just above the eutectic temperature: α at C_α and liquid at C_E.',
      'All of that liquid becomes eutectic as it cools through T_E.',
    ],
    variables: [
      wtp('C0', 'C_0', 'Alloy composition'),
      wtp('Ca', 'C_α', 'α composition'),
      wtp('CE', 'C_E', 'Eutectic composition'),
      share('We', 'W_e', 'Eutectic share'),
      share('Wa', 'W_α′', 'Primary α share'),
    ],
    ...rules(
      ...leverRules('C0', 'Ca', 'CE', 'We', 'Wa', 'eutectic', 'primary α'),
      below(
        'Ca',
        'CE',
        '{Ca} < {CE}',
        'α’s end of the eutectic line lies below the eutectic composition.',
      ),
    ),
    example: { C0, Ca, CE, We, Wa: 1 - We },
    startWith: ['C0', 'Ca', 'CE'],
    representation: {
      kind: 'binaryPhase',
      system: 'eutectic',
      names: ['Pb', 'Sn'],
      c0: 'C0',
      calpha: 'Ca',
      ce: 'CE',
      cbeta: 97.8,
      we: 'We',
      walpha: 'Wa',
    },
  });
})();

const steelDemo = (id: string, title: string, C0: number) => {
  const WP = (C0 - 0.022) / (0.76 - 0.022);
  return demo({
    id,
    title,
    use: 'Use this for the shares of pearlite and proeutectoid ferrite in a hypoeutectoid steel.',
    assumptions: [
      'The eutectoid is at 0.76 wt% C and 727 °C (some texts write 0.77 or 0.8).',
      'Ferrite holds 0.022 wt% C at 727 °C; the austenite there becomes pearlite.',
    ],
    variables: [
      wtp('C0', 'C_0', 'Carbon in the steel', 0.76),
      share('WP', 'W_P', 'Pearlite share'),
      share('Wa', 'W_α′', 'Proeutectoid ferrite share'),
    ],
    ...rules(
      ...leverRules('C0', [0.022, '0.022'], [0.76, '0.76'], 'WP', 'Wa', 'pearlite', 'ferrite'),
    ),
    example: { C0, WP, Wa: 1 - WP },
    startWith: ['C0'],
    representation: {
      kind: 'binaryPhase',
      system: 'steel',
      c0: 'C0',
      calpha: 0.022,
      ce: 0.76,
      we: 'WP',
      walpha: 'Wa',
    },
  });
};

const binarySteel = steelDemo(
  'g.he-binaryPhase-steel',
  'Pearlite and ferrite in a 0.40% carbon steel',
  0.4,
);
const binarySteelEdge = steelDemo(
  'g.he-binaryPhase-steel-near-eutectoid',
  'A 0.70% carbon steel: nearly all pearlite',
  0.7,
);

export const HE3I_GALLERY_MODULES: ModuleDef[] = [
  forearmLoad,
  forearmLevel,
  hipStance,
  hipHeavy,
  binaryIso,
  binaryIsoEdge,
  binaryEutectic,
  binarySteel,
  binarySteelEdge,
];

export const HE3I_GALLERY_LAYOUTS: LayoutDef[] = [];
