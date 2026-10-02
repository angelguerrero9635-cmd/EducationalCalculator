/**
 * College gallery demos, round 2, group I (docs/RENDERINGS_HE.md): HC27 `truss` and its card
 * figure. Each stands in for the college page that waits, built from the plan's worked example
 * (docs/plans/he.mechanical.md, he.aero-civil-chemical.md). Spread into gallery.ts.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, Representation } from './types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Steps = ModuleDef['steps'][string];
type Part = [(x: Values) => number | undefined, string, string];

/** A variable: id, symbol, name, unit and range. */
const v = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...(unit ? { unit } : {}), min, max, ...more });

/** A relation with its residual, a solve for each variable in `parts` and their step text. */
function rel(
  id: string,
  display: string,
  vars: string[],
  residual: (x: Values) => number,
  parts: Record<string, Part>,
): { relation: Relation; steps: Steps } {
  const solve: NonNullable<Relation['solve']> = {};
  const steps: Steps = {};
  for (const [k, [fn, expr, how]] of Object.entries(parts)) {
    solve[k] = fn;
    steps[k] = { expr, how };
  }
  return { relation: { id, display, vars, residual, solve }, steps };
}

/** A demo module from its variables and relations. */
function demo(
  id: string,
  title: string,
  m: {
    use: string;
    assumptions: string[];
    variables: VariableDef[];
    relations: { relation: Relation; steps: Steps }[];
    example: Values;
    startWith: string[];
    representation: Representation;
  },
): ModuleDef {
  return {
    id,
    title,
    use: m.use,
    assumptions: m.assumptions,
    variables: m.variables,
    relations: m.relations.map((r) => r.relation),
    steps: Object.fromEntries(m.relations.map((r) => [r.relation.id, r.steps])),
    example: m.example,
    startWith: m.startWith,
    representation: m.representation,
  };
}

const D = Math.PI / 180;
const sinD = (x: number) => Math.sin(x * D);
const tanD = (x: number) => Math.tan(x * D);
const atanD = (x: number) => Math.atan(x) / D;
/** Undefined unless finite (a solve that divides by zero). */
const fin = (x: number) => (Number.isFinite(x) ? x : undefined);

// ─── HC27 truss: joints of a triangle (statics#1) ────────────────────────────

const triangleVars: VariableDef[] = [
  v('L', 'L', 'Span', 'm', 0.1, 100),
  v('h', 'h', 'Height', 'm', 0.01, 100),
  v('P', 'P', 'Load at the apex', 'kN', 0, 1e5),
  v('theta', 'θ', 'Slope of the inclined members', '°', 0.01, 89.9),
  v('R', 'R', 'Each reaction', 'kN', 0, 1e5),
  v('FAC', 'F_AC', 'Force in each inclined member (− compression)', 'kN', -1e7, 0),
  v('FAB', 'F_AB', 'Force in the bottom chord (+ tension)', 'kN', 0, 1e7),
];

const slopeRel = rel(
  'θ = tan⁻¹(2h ÷ L)',
  '{theta} = tan⁻¹(2{h} ÷ {L})',
  ['theta', 'h', 'L'],
  (x) => x.theta! - atanD((2 * x.h!) / x.L!),
  {
    theta: [
      (x) => fin(atanD((2 * x.h!) / x.L!)),
      'tan⁻¹(2 × {h} ÷ {L})',
      'The rise is h over half the span, so tan θ = h ÷ (L ÷ 2).',
    ],
    h: [
      (x) => (x.L! * tanD(x.theta!)) / 2,
      '{L} × tan({theta}) ÷ 2',
      'Rise = half the span × tan θ.',
    ],
    L: [
      (x) => fin((2 * x.h!) / tanD(x.theta!)),
      '2 × {h} ÷ tan({theta})',
      'Half the span is h ÷ tan θ.',
    ],
  },
);

const triangle = demo('g.he-truss-joints', 'Member forces by the method of joints', {
  use: 'Use this for “A triangular truss spans 8 m and rises 3 m with 10 kN at the apex. Find the force in each member.”',
  assumptions: [
    'Pin joints and loads only at the joints, so each member pulls or pushes along its own line.',
    'A pin at A and a roller at B; + is tension (T), − compression (C).',
  ],
  variables: triangleVars,
  relations: [
    slopeRel,
    rel('R = P ÷ 2', '{R} = {P} ÷ 2', ['R', 'P'], (x) => x.R! - x.P! / 2, {
      R: [(x) => x.P! / 2, '{P} ÷ 2', 'The truss is symmetric, so each support takes half.'],
      P: [(x) => 2 * x.R!, '2 × {R}', 'The two reactions add up to the load.'],
    }),
    rel(
      'F_AC = −P ÷ (2 sin θ)',
      '{FAC} = −{P} ÷ (2 sin {theta})',
      ['FAC', 'P', 'theta'],
      (x) => x.FAC! + x.P! / (2 * sinD(x.theta!)),
      {
        FAC: [
          (x) => fin(-x.P! / (2 * sinD(x.theta!))),
          '−{P} ÷ (2 × sin({theta}))',
          'At the apex the two inclined members hold up P: 2F sin θ = −P.',
        ],
        P: [
          (x) => -2 * x.FAC! * sinD(x.theta!),
          '−2 × {FAC} × sin({theta})',
          'The upward parts of the two member forces hold the load.',
        ],
      },
    ),
    rel(
      'F_AB = P ÷ (2 tan θ)',
      '{FAB} = {P} ÷ (2 tan {theta})',
      ['FAB', 'P', 'theta'],
      (x) => x.FAB! - x.P! / (2 * tanD(x.theta!)),
      {
        FAB: [
          (x) => fin(x.P! / (2 * tanD(x.theta!))),
          '{P} ÷ (2 × tan({theta}))',
          'At A the chord balances the inclined member’s sideways part: R ÷ tan θ.',
        ],
        P: [
          (x) => 2 * x.FAB! * tanD(x.theta!),
          '2 × {FAB} × tan({theta})',
          'Undo the division: multiply by 2 tan θ.',
        ],
      },
    ),
  ],
  example: {
    L: 8,
    h: 3,
    P: 10,
    theta: atanD(0.75),
    R: 5,
    FAC: -10 / (2 * 0.6),
    FAB: 10 / (2 * 0.75),
  },
  startWith: ['L', 'h', 'P'],
  representation: {
    kind: 'truss',
    joints: [
      { name: 'A', x: 0, y: 0 },
      { name: 'B', x: 'L', y: 0 },
      { name: 'C', x: ['L', 0.5], y: 'h' },
    ],
    members: [
      { from: 'A', to: 'B', force: 'FAB' },
      { from: 'A', to: 'C', force: 'FAC' },
      { from: 'B', to: 'C', force: 'FAC' },
    ],
    supports: [
      { joint: 'A', kind: 'pin', reaction: 'R' },
      { joint: 'B', kind: 'roller', reaction: 'R' },
    ],
    loads: [{ joint: 'C', P: 'P' }],
    angle: { joint: 'A', from: 'B', to: 'C', value: 'theta' },
  },
});

// ─── The method of sections (statics#1~sections) ────────────────────────────

const sectionVars: VariableDef[] = [
  v('d', 'a', 'Panel length (P’s distance from A)', 'm', 0.1, 50),
  v('h', 'h', 'Height', 'm', 0.1, 50),
  v('P', 'P', 'Load at each lower joint', 'kN', 0, 1e5),
  v('R', 'R', 'Left reaction', 'kN', 0, 1e5),
  v('x', 'x', 'Cut joint from A', 'm', 0.2, 100),
  v('theta', 'θ', 'Slope of the diagonal', '°', 0.1, 89.9),
  v('M', 'M', 'Moment at the cut joint', 'kN·m', 0, 1e7),
  v('V', 'V', 'Shear in the cut panel', 'kN', 0, 1e5),
  v('F', 'F', 'Top chord force (C)', 'kN', 0, 1e7),
  v('Fd', 'F_d', 'Diagonal force (T)', 'kN', 0, 1e7),
];

const sections = demo(
  'g.he-truss-sections',
  'Chord and diagonal forces by the method of sections',
  {
    use: 'Use this for “Cut a Pratt truss through its second panel. Find the top chord and diagonal forces.”',
    assumptions: [
      'A Pratt truss of four equal panels, P at each of the three lower inner joints; pin and roller.',
      'Moments about the joint where the other two cut members meet leave the chord alone; up and down forces give the diagonal.',
    ],
    variables: sectionVars,
    relations: [
      rel('R = 3P ÷ 2', '{R} = 3{P} ÷ 2', ['R', 'P'], (x) => x.R! - (3 * x.P!) / 2, {
        R: [(x) => (3 * x.P!) / 2, '3 × {P} ÷ 2', 'Three loads of P, shared by two supports.'],
        P: [(x) => (2 * x.R!) / 3, '2 × {R} ÷ 3', 'Each support carries one and a half loads.'],
      }),
      rel('x = 2a', '{x} = 2{d}', ['x', 'd'], (x) => x.x! - 2 * x.d!, {
        x: [(x) => 2 * x.d!, '2 × {d}', 'The cut joint is the second lower joint, two panels in.'],
        d: [(x) => x.x! / 2, '{x} ÷ 2', 'Two panels reach the cut joint.'],
      }),
      rel(
        'θ = tan⁻¹(h ÷ a)',
        '{theta} = tan⁻¹({h} ÷ {d})',
        ['theta', 'h', 'd'],
        (x) => x.theta! - atanD(x.h! / x.d!),
        {
          theta: [
            (x) => fin(atanD(x.h! / x.d!)),
            'tan⁻¹({h} ÷ {d})',
            'The diagonal rises h over one panel.',
          ],
          h: [(x) => x.d! * tanD(x.theta!), '{d} × tan({theta})', 'Rise = run × tan θ.'],
        },
      ),
      rel(
        'M = Rx − P(x − a)',
        '{M} = {R}{x} − {P}({x} − {d})',
        ['M', 'R', 'x', 'P', 'd'],
        (x) => x.M! - (x.R! * x.x! - x.P! * (x.x! - x.d!)),
        {
          M: [
            (x) => x.R! * x.x! - x.P! * (x.x! - x.d!),
            '{R} × {x} − {P} × ({x} − {d})',
            'Moments about the cut joint of the forces left of the cut: R turns one way, P the other.',
          ],
          R: [
            (x) => fin((x.M! + x.P! * (x.x! - x.d!)) / x.x!),
            '({M} + {P} × ({x} − {d})) ÷ {x}',
            'Add P’s moment back, then divide by R’s distance.',
          ],
        },
      ),
      rel('V = R − P', '{V} = {R} − {P}', ['V', 'R', 'P'], (x) => x.V! - (x.R! - x.P!), {
        V: [(x) => x.R! - x.P!, '{R} − {P}', 'Up minus down, left of the cut.'],
        R: [(x) => x.V! + x.P!, '{V} + {P}', 'Add the load back.'],
      }),
      rel('F = M ÷ h', '{F} = {M} ÷ {h}', ['F', 'M', 'h'], (x) => x.F! - x.M! / x.h!, {
        F: [
          (x) => fin(x.M! / x.h!),
          '{M} ÷ {h}',
          'Only the top chord turns about the cut joint, with arm h.',
        ],
        M: [(x) => x.F! * x.h!, '{F} × {h}', 'The chord’s force times its arm.'],
      }),
      rel(
        'F_d = V ÷ sin θ',
        '{Fd} = {V} ÷ sin {theta}',
        ['Fd', 'V', 'theta'],
        (x) => x.Fd! - x.V! / sinD(x.theta!),
        {
          Fd: [
            (x) => fin(x.V! / sinD(x.theta!)),
            '{V} ÷ sin({theta})',
            'Only the diagonal has an up-and-down part to carry the shear.',
          ],
          V: [
            (x) => x.Fd! * sinD(x.theta!),
            '{Fd} × sin({theta})',
            'The diagonal’s vertical part.',
          ],
        },
      ),
    ],
    example: {
      d: 3,
      h: 4,
      P: 10,
      R: 15,
      x: 6,
      theta: atanD(4 / 3),
      M: 60,
      V: 5,
      F: 15,
      Fd: 6.25,
    },
    startWith: ['d', 'h', 'P'],
    representation: {
      kind: 'truss',
      panels: { type: 'pratt', n: 4, length: 'd', height: 'h', load: 'P', reaction: 'R' },
      cut: { panel: 1, chord: 'top', x: 'x', M: 'M', F: 'F', V: 'V', Fd: 'Fd', theta: 'theta' },
    },
  },
);

// ─── A panel truss cut at midspan (structural-analysis#0~truss) ───────────────

function midspan(
  id: string,
  title: string,
  use: string,
  type: 'pratt' | 'howe',
  n: number,
): ModuleDef {
  const chord = type === 'pratt' ? 'top' : 'bottom';
  const [d, h, P] = [3, 3, 10];
  const R = ((n - 1) * P) / 2;
  const M = (P * d * n * n) / 8;
  return demo(id, title, {
    use,
    assumptions: [
      `A ${type === 'pratt' ? 'Pratt' : 'Howe'} truss with n equal panels and P at every inner lower joint; pin and roller.`,
      `Cut through the panel left of midspan and take moments about the midspan joint: only the ${chord} chord turns about it.`,
      type === 'pratt'
        ? 'The top chord is squeezed (C); the bottom chord across the same panel is found about the next joint left.'
        : 'The bottom chord is stretched (T); the top chord across the same panel is found about the next joint left.',
    ],
    variables: [
      v('n', 'n', 'Panels', undefined, 4, 8, { integer: true, allowed: [4, 6, 8] }),
      v('d', 'd', 'Panel length', 'm', 0.5, 20),
      v('h', 'h', 'Height', 'm', 0.5, 20),
      v('P', 'P', 'Load at each inner lower joint', 'kN', 0, 1e4),
      v('R', 'R', 'Each reaction', 'kN', 0, 1e5),
      v('M', 'M', 'Moment at midspan', 'kN·m', 0, 1e7),
      v('F', 'F', `${chord === 'top' ? 'Top' : 'Bottom'} chord force at midspan`, 'kN', 0, 1e7),
    ],
    relations: [
      rel(
        'R = (n − 1)P ÷ 2',
        '{R} = ({n} − 1){P} ÷ 2',
        ['R', 'n', 'P'],
        (x) => x.R! - ((x.n! - 1) * x.P!) / 2,
        {
          R: [
            (x) => ((x.n! - 1) * x.P!) / 2,
            '({n} − 1) × {P} ÷ 2',
            'n − 1 inner joints carry P; the two supports share it.',
          ],
          P: [
            (x) => fin((2 * x.R!) / (x.n! - 1)),
            '2 × {R} ÷ ({n} − 1)',
            'Both reactions over the number of loads.',
          ],
        },
      ),
      rel(
        'M = R(nd ÷ 2) − Pd·n(n − 2) ÷ 8',
        '{M} = {R}({n}{d} ÷ 2) − {P}{d}{n}({n} − 2) ÷ 8',
        ['M', 'R', 'n', 'd', 'P'],
        (x) => x.M! - ((x.R! * x.n! * x.d!) / 2 - (x.P! * x.d! * x.n! * (x.n! - 2)) / 8),
        {
          M: [
            (x) => (x.R! * x.n! * x.d!) / 2 - (x.P! * x.d! * x.n! * (x.n! - 2)) / 8,
            '{R} × {n} × {d} ÷ 2 − {P} × {d} × {n} × ({n} − 2) ÷ 8',
            'R turns about midspan with arm nd ÷ 2; the loads left of it have arms d, 2d, …, adding to d·n(n − 2) ÷ 8 per P.',
          ],
        },
      ),
      rel('F = M ÷ h', '{F} = {M} ÷ {h}', ['F', 'M', 'h'], (x) => x.F! - x.M! / x.h!, {
        F: [
          (x) => fin(x.M! / x.h!),
          '{M} ÷ {h}',
          `Only the ${chord} chord turns about the midspan joint, with arm h.`,
        ],
        M: [(x) => x.F! * x.h!, '{F} × {h}', 'The chord’s force times its arm.'],
        h: [(x) => fin(x.M! / x.F!), '{M} ÷ {F}', 'The arm that makes the chord balance M.'],
      }),
    ],
    example: { n, d, h, P, R, M, F: M / h },
    startWith: ['n', 'd', 'h', 'P'],
    representation: {
      kind: 'truss',
      panels: { type, n: 'n', length: 'd', height: 'h', load: 'P', reaction: 'R' },
      cut: { panel: 'mid', chord, M: 'M', F: 'F' },
    },
  });
}

const pratt = midspan(
  'g.he-truss-pratt-midspan',
  'A Pratt truss cut at midspan',
  'Use this for “A six-panel Pratt truss, 3 m panels and 3 m deep, carries 10 kN at each inner joint. Find the chord force at midspan.”',
  'pratt',
  6,
);

const howe = midspan(
  'g.he-truss-howe-midspan',
  'A Howe truss of eight panels cut at midspan',
  'Use this for “An eight-panel Howe truss carries 10 kN at each inner lower joint. How hard is the bottom chord pulled at midspan?”',
  'howe',
  8,
);

// ─── Determinacy (structural-analysis#0~determinacy) ──────────────────────────

function determinacy(id: string, title: string, use: string, r: number): ModuleDef {
  const n = 6;
  return demo(id, title, {
    use,
    assumptions: [
      'A Pratt truss with end posts: m = 4n − 3 members and j = 2n joints for n panels.',
      'A pin gives 2 reactions, a roller 1. m + r − 2j < 0 is unstable, 0 determinate, > 0 indeterminate; 0 can still be unstable if members are badly arranged.',
    ],
    variables: [
      v('n', 'n', 'Panels', undefined, 4, 8, { integer: true, allowed: [4, 6, 8] }),
      v('r', 'r', 'Reactions', undefined, 3, 4, { integer: true, allowed: [3, 4] }),
      v('m', 'm', 'Members', undefined, 1, 100, { integer: true }),
      v('j', 'j', 'Joints', undefined, 1, 100, { integer: true }),
      v('deg', 'D', 'Degree of indeterminacy', undefined, -10, 10, { integer: true }),
    ],
    relations: [
      rel('m = 4n − 3', '{m} = 4{n} − 3', ['m', 'n'], (x) => x.m! - (4 * x.n! - 3), {
        m: [
          (x) => 4 * x.n! - 3,
          '4 × {n} − 3',
          'n bottom chords, n − 2 top chords, 2 end posts, n − 1 verticals and n − 2 diagonals.',
        ],
        n: [(x) => (x.m! + 3) / 4, '({m} + 3) ÷ 4', 'Undo m = 4n − 3.'],
      }),
      rel('j = 2n', '{j} = 2{n}', ['j', 'n'], (x) => x.j! - 2 * x.n!, {
        j: [(x) => 2 * x.n!, '2 × {n}', 'n + 1 lower joints and n − 1 upper ones.'],
        n: [(x) => x.j! / 2, '{j} ÷ 2', 'Half the joints.'],
      }),
      rel(
        'degree = m + r − 2j',
        '{deg} = {m} + {r} − 2{j}',
        ['deg', 'm', 'r', 'j'],
        (x) => x.deg! - (x.m! + x.r! - 2 * x.j!),
        {
          deg: [
            (x) => x.m! + x.r! - 2 * x.j!,
            '{m} + {r} − 2 × {j}',
            'Unknowns (member forces and reactions) minus equations (two at each joint).',
          ],
          r: [(x) => x.deg! - x.m! + 2 * x.j!, '{deg} − {m} + 2 × {j}', 'Solve the count for r.'],
        },
      ),
    ],
    example: { n, r, m: 4 * n - 3, j: 2 * n, deg: 4 * n - 3 + r - 4 * n },
    startWith: ['n', 'r'],
    representation: {
      kind: 'truss',
      panels: { type: 'pratt', n: 'n', length: 3, height: 3, load: 10 },
      forces: 'none',
      counts: { m: 'm', j: 'j', r: 'r', degree: 'deg' },
    },
  });
}

const determinate = determinacy(
  'g.he-truss-determinacy',
  'Determinate, indeterminate or unstable: m + r − 2j',
  'Use this for “A six-panel Pratt truss sits on a pin and a roller. Is it statically determinate?”',
  3,
);

const twoPins = determinacy(
  'g.he-truss-determinacy-two-pins',
  'Two pins make the truss indeterminate',
  'Use this for “The same truss is pinned at both ends. What is its degree of indeterminacy?”',
  4,
);

// ─── A joint's deflection by the unit load (advanced-solid-mechanics#2~truss) ─

const deflection = demo('g.he-truss-deflection', 'The apex deflection by the unit-load method', {
  use: 'Use this for “The 8 m by 3 m triangular truss carries 10 kN at the apex. With A = 1000 mm² and E = 200 GPa, how far does the apex drop?”',
  assumptions: [
    'The truss of statics#1: 8 m span, 3 m rise, so each inclined member is 5 m and sin θ = 0.6.',
    'f is each member’s force under a load of 1 at the apex: −5 ÷ 6 inclined, 2 ÷ 3 in the chord.',
    'δ = ΣFfL ÷ (AE); kN, m, mm² and GPa give δ in mm with a factor of 1000.',
  ],
  variables: [
    v('P', 'P', 'Load at the apex', 'kN', 0, 1e4),
    v('A', 'A', 'Member area', 'mm²', 1, 1e6),
    v('E', 'E', 'Young’s modulus', 'GPa', 1, 1000),
    v('Fi', 'F_incl', 'Force in each inclined member', 'kN', -1e5, 0),
    v('Fb', 'F_bot', 'Force in the bottom chord', 'kN', 0, 1e5),
    v('delta', 'δ', 'Apex deflection', 'mm', 0, 1e4),
  ],
  relations: [
    rel('F_incl = −5P ÷ 6', '{Fi} = −5{P} ÷ 6', ['Fi', 'P'], (x) => x.Fi! + (5 * x.P!) / 6, {
      Fi: [(x) => (-5 * x.P!) / 6, '−5 × {P} ÷ 6', 'At the apex: 2F sin θ = −P with sin θ = 0.6.'],
      P: [(x) => (-6 * x.Fi!) / 5, '−6 × {Fi} ÷ 5', 'Undo F = −5P ÷ 6.'],
    }),
    rel('F_bot = 2P ÷ 3', '{Fb} = 2{P} ÷ 3', ['Fb', 'P'], (x) => x.Fb! - (2 * x.P!) / 3, {
      Fb: [(x) => (2 * x.P!) / 3, '2 × {P} ÷ 3', 'At a support: R ÷ tan θ with tan θ = 0.75.'],
      P: [(x) => (3 * x.Fb!) / 2, '3 × {Fb} ÷ 2', 'Undo F = 2P ÷ 3.'],
    }),
    rel(
      'δ = ΣFfL ÷ (AE)',
      '{delta} = 1000(2{Fi}(−5 ÷ 6)(5) + {Fb}(2 ÷ 3)(8)) ÷ ({A}{E})',
      ['delta', 'Fi', 'Fb', 'A', 'E'],
      (x) => x.delta! - (1000 * ((-25 / 3) * x.Fi! + (16 / 3) * x.Fb!)) / (x.A! * x.E!),
      {
        delta: [
          (x) => fin((1000 * ((-25 / 3) * x.Fi! + (16 / 3) * x.Fb!)) / (x.A! * x.E!)),
          '1000 × (2 × {Fi} × (−5 ÷ 6) × 5 + {Fb} × (2 ÷ 3) × 8) ÷ ({A} × {E})',
          'Each member adds F × f × L: two inclined members of 5 m and the 8 m chord.',
        ],
        A: [
          (x) => fin((1000 * ((-25 / 3) * x.Fi! + (16 / 3) * x.Fb!)) / (x.delta! * x.E!)),
          '1000 × (2 × {Fi} × (−5 ÷ 6) × 5 + {Fb} × (2 ÷ 3) × 8) ÷ ({delta} × {E})',
          'Swap δ and A: the sum over δE.',
        ],
        E: [
          (x) => fin((1000 * ((-25 / 3) * x.Fi! + (16 / 3) * x.Fb!)) / (x.delta! * x.A!)),
          '1000 × (2 × {Fi} × (−5 ÷ 6) × 5 + {Fb} × (2 ÷ 3) × 8) ÷ ({delta} × {A})',
          'Swap δ and E: the sum over δA.',
        ],
      },
    ),
  ],
  example: { P: 10, A: 1000, E: 200, Fi: -25 / 3, Fb: 20 / 3, delta: 0.525 },
  startWith: ['P', 'A', 'E'],
  representation: {
    kind: 'truss',
    joints: [
      { name: 'A', x: 0, y: 0 },
      { name: 'B', x: 8, y: 0 },
      { name: 'C', x: 4, y: 3 },
    ],
    members: [
      { from: 'A', to: 'B', force: 'Fb' },
      { from: 'A', to: 'C', force: 'Fi' },
      { from: 'B', to: 'C', force: 'Fi' },
    ],
    supports: [
      { joint: 'A', kind: 'pin' },
      { joint: 'B', kind: 'roller' },
    ],
    loads: [{ joint: 'C', P: 'P' }],
    deflect: { joint: 'C', delta: 'delta', A: 'A', E: 'E' },
  },
});

// ─── One bar element (finite-element-analysis#2) ──────────────────────────────

function element(
  id: string,
  title: string,
  use: string,
  ex: { A: number; E: number; L: number; theta: number; du: number; dv: number },
): ModuleDef {
  const delta = ex.du * Math.cos(ex.theta * D) + ex.dv * sinD(ex.theta);
  const f = (ex.A * ex.E * delta) / (1000 * ex.L);
  return demo(id, title, {
    use,
    assumptions: [
      'A two-node bar element: only the stretch along the bar makes force.',
      'θ from the global x axis; Δu and Δv are node 2’s moves relative to node 1.',
      'mm², GPa, m and mm give f in kN with a factor of 1000; σ = f ÷ A in MPa.',
    ],
    variables: [
      v('A', 'A', 'Area', 'mm²', 1, 1e6),
      v('E', 'E', 'Young’s modulus', 'GPa', 1, 1000),
      v('L', 'L', 'Length', 'm', 0.01, 100),
      v('theta', 'θ', 'Angle from the x axis', '°', 0, 180),
      v('du', 'Δu', 'Node 2’s move along x', 'mm', -100, 100),
      v('dv', 'Δv', 'Node 2’s move along y', 'mm', -100, 100),
      v('delta', 'δ', 'Stretch along the bar', 'mm', -200, 200),
      v('f', 'f', 'Axial force', 'kN', -1e6, 1e6),
      v('sigma', 'σ', 'Axial stress', 'MPa', -1e5, 1e5),
    ],
    relations: [
      rel(
        'δ = Δu cos θ + Δv sin θ',
        '{delta} = {du} cos {theta} + {dv} sin {theta}',
        ['delta', 'du', 'dv', 'theta'],
        (x) => x.delta! - (x.du! * Math.cos(x.theta! * D) + x.dv! * sinD(x.theta!)),
        {
          delta: [
            (x) => x.du! * Math.cos(x.theta! * D) + x.dv! * sinD(x.theta!),
            '{du} × cos({theta}) + {dv} × sin({theta})',
            'Each move’s part along the bar: Δu cos θ and Δv sin θ.',
          ],
          dv: [
            (x) => fin((x.delta! - x.du! * Math.cos(x.theta! * D)) / sinD(x.theta!)),
            '({delta} − {du} × cos({theta})) ÷ sin({theta})',
            'Take Δu’s part off δ, then divide by sin θ.',
          ],
        },
      ),
      rel(
        'f = (AE ÷ L)δ',
        '{f} = {A}{E}{delta} ÷ (1000{L})',
        ['f', 'A', 'E', 'delta', 'L'],
        (x) => x.f! - (x.A! * x.E! * x.delta!) / (1000 * x.L!),
        {
          f: [
            (x) => fin((x.A! * x.E! * x.delta!) / (1000 * x.L!)),
            '{A} × {E} × {delta} ÷ (1000 × {L})',
            'The bar’s stiffness AE ÷ L times its stretch.',
          ],
          delta: [
            (x) => fin((1000 * x.f! * x.L!) / (x.A! * x.E!)),
            '1000 × {f} × {L} ÷ ({A} × {E})',
            'The force over the stiffness.',
          ],
        },
      ),
      rel(
        'σ = f ÷ A',
        '{sigma} = 1000{f} ÷ {A}',
        ['sigma', 'f', 'A'],
        (x) => x.sigma! - (1000 * x.f!) / x.A!,
        {
          sigma: [
            (x) => fin((1000 * x.f!) / x.A!),
            '1000 × {f} ÷ {A}',
            'Force over area; kN ÷ mm² × 1000 is MPa.',
          ],
          f: [(x) => (x.sigma! * x.A!) / 1000, '{sigma} × {A} ÷ 1000', 'Stress times area.'],
        },
      ),
    ],
    example: { ...ex, delta, f, sigma: (1000 * f) / ex.A },
    startWith: ['A', 'E', 'L', 'theta', 'du', 'dv'],
    representation: {
      kind: 'truss',
      mode: 'element',
      element: {
        L: 'L',
        theta: 'theta',
        du: 'du',
        dv: 'dv',
        delta: 'delta',
        A: 'A',
        E: 'E',
        f: 'f',
        sigma: 'sigma',
      },
    },
  });
}

const bar = element(
  'g.he-truss-element',
  'A truss element’s force from its nodal displacements',
  'Use this for “A 2 m bar at 30°, 500 mm², 200 GPa: node 2 moves 0.5 mm in x and 0.2 mm in y. Find its force and stress.”',
  { A: 500, E: 200, L: 2, theta: 30, du: 0.5, dv: 0.2 },
);

const barSteep = element(
  'g.he-truss-element-steep',
  'A bar leaning back: θ past 90°',
  'Use this for “A bar at 120° from x: node 2 moves −0.3 mm in x and 0.4 mm in y. Is the bar stretched?”',
  { A: 500, E: 200, L: 2, theta: 120, du: -0.3, dv: 0.4 },
);

// ─── Card figure: zero-force members (statics#1~zero-force) ───────────────────

const zeroForce: LayoutDef = {
  kind: 'sort',
  id: 'g.he-truss-card-zero-force',
  title: 'Zero-force members at a glance',
  use: 'Use this for “Which members of this truss carry no force?”',
  assumptions: [
    'At an unloaded joint, a member that nothing else can balance carries nothing.',
    'Two members at an angle with no load: both carry 0. Three members, two in a line, no load: the third carries 0.',
  ],
  question: 'Does the member asked about carry force?',
  bins: [
    {
      id: 'zero',
      label: 'Zero-force member',
      why: 'Nothing else at the joint has a part along it to balance.',
    },
    {
      id: 'carries',
      label: 'Carries force',
      why: 'A load or a reaction at the joint has to be balanced by it.',
    },
  ],
  cards: [
    {
      label: 'Either member: a corner, no load',
      bin: 'zero',
      figure: { kind: 'trussJoint', members: [0, 60] },
    },
    {
      label: 'The stem of a T, no load',
      bin: 'zero',
      figure: { kind: 'trussJoint', members: [0, 180, 270] },
    },
    {
      label: 'The slanted stem, no load',
      bin: 'zero',
      figure: { kind: 'trussJoint', members: [0, 180, 240] },
    },
    {
      label: 'The stem of a T with a load along it',
      bin: 'carries',
      figure: { kind: 'trussJoint', members: [0, 180, 270], load: 270 },
    },
    {
      label: 'Either member at a loaded apex',
      bin: 'carries',
      figure: { kind: 'trussJoint', members: [210, 330], load: 270 },
    },
    {
      label: 'Either member at a support',
      bin: 'carries',
      figure: { kind: 'trussJoint', members: [0, 50], support: 'pin' },
    },
  ],
};

export const HE2I_GALLERY_MODULES: ModuleDef[] = [
  triangle,
  sections,
  pratt,
  howe,
  determinate,
  twoPins,
  deflection,
  bar,
  barSteep,
];

export const HE2I_GALLERY_LAYOUTS: LayoutDef[] = [zeroForce];
