/**
 * College gallery demos, round 2, group I (docs/RENDERINGS_HE.md): HC27 `truss` and its card
 * figure, HC26 `soilProfile`. Each stands in for the college page that waits, built from the
 * plan's worked example (docs/plans/he.mechanical.md, he.aero-civil-chemical.md). Spread into
 * gallery.ts.
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
  '{theta} = tan⁻¹(2 × {h} ÷ {L})',
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
      '{FAC} = −{P} ÷ (2 × sin({theta}))',
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
      '{FAB} = {P} ÷ (2 × tan({theta}))',
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
      rel('R = 3P ÷ 2', '{R} = 3 × {P} ÷ 2', ['R', 'P'], (x) => x.R! - (3 * x.P!) / 2, {
        R: [(x) => (3 * x.P!) / 2, '3 × {P} ÷ 2', 'Three loads of P, shared by two supports.'],
        P: [(x) => (2 * x.R!) / 3, '2 × {R} ÷ 3', 'Each support carries one and a half loads.'],
      }),
      rel('x = 2a', '{x} = 2 × {d}', ['x', 'd'], (x) => x.x! - 2 * x.d!, {
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
        '{M} = {R} × {x} − {P} × ({x} − {d})',
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
        '{Fd} = {V} ÷ sin({theta})',
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
        '{R} = ({n} − 1) × {P} ÷ 2',
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
        '{M} = {R} × {n} × {d} ÷ 2 − {P} × {d} × {n} × ({n} − 2) ÷ 8',
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
      rel('m = 4n − 3', '{m} = 4 × {n} − 3', ['m', 'n'], (x) => x.m! - (4 * x.n! - 3), {
        m: [
          (x) => 4 * x.n! - 3,
          '4 × {n} − 3',
          'n bottom chords, n − 2 top chords, 2 end posts, n − 1 verticals and n − 2 diagonals.',
        ],
        n: [(x) => (x.m! + 3) / 4, '({m} + 3) ÷ 4', 'Undo m = 4n − 3.'],
      }),
      rel('j = 2n', '{j} = 2 × {n}', ['j', 'n'], (x) => x.j! - 2 * x.n!, {
        j: [(x) => 2 * x.n!, '2 × {n}', 'n + 1 lower joints and n − 1 upper ones.'],
        n: [(x) => x.j! / 2, '{j} ÷ 2', 'Half the joints.'],
      }),
      rel(
        'degree = m + r − 2j',
        '{deg} = {m} + {r} − 2 × {j}',
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
    rel('F_incl = −5P ÷ 6', '{Fi} = −5 × {P} ÷ 6', ['Fi', 'P'], (x) => x.Fi! + (5 * x.P!) / 6, {
      Fi: [(x) => (-5 * x.P!) / 6, '−5 × {P} ÷ 6', 'At the apex: 2F sin θ = −P with sin θ = 0.6.'],
      P: [(x) => (-6 * x.Fi!) / 5, '−6 × {Fi} ÷ 5', 'Undo F = −5P ÷ 6.'],
    }),
    rel('F_bot = 2P ÷ 3', '{Fb} = 2 × {P} ÷ 3', ['Fb', 'P'], (x) => x.Fb! - (2 * x.P!) / 3, {
      Fb: [(x) => (2 * x.P!) / 3, '2 × {P} ÷ 3', 'At a support: R ÷ tan θ with tan θ = 0.75.'],
      P: [(x) => (3 * x.Fb!) / 2, '3 × {Fb} ÷ 2', 'Undo F = 2P ÷ 3.'],
    }),
    rel(
      'δ = ΣFfL ÷ (AE)',
      '{delta} = 1000 × (2 × {Fi} × (−5 ÷ 6) × 5 + {Fb} × (2 ÷ 3) × 8) ÷ ({A} × {E})',
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
        '{delta} = {du} × cos({theta}) + {dv} × sin({theta})',
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
        '{f} = {A} × {E} × {delta} ÷ (1000 × {L})',
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
        '{sigma} = 1000 × {f} ÷ {A}',
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

// ─── HC26 soilProfile ────────────────────────────────────────────────────────

/** A limit, not a formula: `a` is at most `b`. */
const atMost = (a: string, b: string, display: string, why: string) => ({
  relation: {
    id: `${a} ≤ ${b}`,
    constraint: true,
    display,
    vars: [a, b],
    residual: (x: Values) => (x[a]! <= x[b]! * (1 + 1e-9) ? 0 : 1),
    solve: {},
    message: () => why,
  } as Relation,
  steps: {} as Steps,
});

const log10 = Math.log10;
const GW = 9.81;

/** σ, u and σ′ under a dry sand over a saturated clay (soil-mechanics#2~effective-stress). */
const effectiveStress = demo(
  'g.he-soil-effective-stress',
  'Effective stress below the water table',
  {
    use: 'Use this for “Sand 3 m thick at 18 kN/m³ lies on clay at 19 kN/m³ saturated, the water table at 3 m. Find σ, u and σ′ at 5 m.”',
    assumptions: [
      'The water table is at the top of the clay; the sand above it is dry (γ), the clay below saturated (γ_sat).',
      'γ_w = 9.81 kN/m³; pore water is still, so u = γ_w × the depth below the water table.',
    ],
    variables: [
      v('zw', 'z_w', 'Depth to the water table', 'm', 0.1, 50),
      v('gamma', 'γ', 'Unit weight of the sand', 'kN/m³', 10, 25),
      v('gsat', 'γ_sat', 'Saturated unit weight of the clay', 'kN/m³', 10, 25),
      v('z', 'z', 'Depth', 'm', 0.1, 100),
      v('sigma', 'σ', 'Total stress', 'kPa', 0, 1e4),
      v('u', 'u', 'Pore water pressure', 'kPa', 0, 1e4),
      v('se', 'σ′', 'Effective stress', 'kPa', 0, 1e4),
    ],
    relations: [
      atMost('zw', 'z', '{zw} ≤ {z}', 'Pick a depth at or below the water table.'),
      rel(
        'σ = γz_w + γ_sat(z − z_w)',
        '{sigma} = {gamma} × {zw} + {gsat} × ({z} − {zw})',
        ['sigma', 'gamma', 'zw', 'gsat', 'z'],
        (x) => x.sigma! - (x.gamma! * x.zw! + x.gsat! * (x.z! - x.zw!)),
        {
          sigma: [
            (x) => x.gamma! * x.zw! + x.gsat! * (x.z! - x.zw!),
            '{gamma} × {zw} + {gsat} × ({z} − {zw})',
            'Add the weight of each layer above the point: unit weight × thickness.',
          ],
          z: [
            (x) => fin(x.zw! + (x.sigma! - x.gamma! * x.zw!) / x.gsat!),
            '{zw} + ({sigma} − {gamma} × {zw}) ÷ {gsat}',
            'Take the sand’s weight off σ; the rest is clay at γ_sat.',
          ],
        },
      ),
      rel(
        'u = γ_w(z − z_w)',
        '{u} = 9.81 × ({z} − {zw})',
        ['u', 'z', 'zw'],
        (x) => x.u! - GW * (x.z! - x.zw!),
        {
          u: [
            (x) => GW * (x.z! - x.zw!),
            '9.81 × ({z} − {zw})',
            'Water pressure grows with depth below the water table.',
          ],
          z: [(x) => x.zw! + x.u! / GW, '{zw} + {u} ÷ 9.81', 'The depth of water that makes u.'],
        },
      ),
      rel(
        'σ′ = σ − u',
        '{se} = {sigma} − {u}',
        ['se', 'sigma', 'u'],
        (x) => x.se! - (x.sigma! - x.u!),
        {
          se: [
            (x) => x.sigma! - x.u!,
            '{sigma} − {u}',
            'The grains carry what the water does not.',
          ],
          sigma: [(x) => x.se! + x.u!, '{se} + {u}', 'Add the water’s share back.'],
          u: [(x) => x.sigma! - x.se!, '{sigma} − {se}', 'The water carries the difference.'],
        },
      ),
    ],
    example: { zw: 3, gamma: 18, gsat: 19, z: 5, sigma: 92, u: 2 * GW, se: 92 - 2 * GW },
    startWith: ['zw', 'gamma', 'gsat', 'z'],
    representation: {
      kind: 'soilProfile',
      mode: 'stress',
      layers: [
        { soil: 'sand', name: 'Sand', thickness: 'zw', gamma: 'gamma' },
        { soil: 'clay', name: 'Clay', thickness: 6, gammaSat: 'gsat' },
      ],
      zw: 'zw',
      z: 'z',
      gammaW: GW,
      sigma: 'sigma',
      u: 'u',
      sigmaEff: 'se',
    },
  },
);

/** Three layers with the water table inside the sand, read deep in the gravel. */
const stressLayers = demo(
  'g.he-soil-stress-layers',
  'Stresses through three layers, the water table in the sand',
  {
    use: 'Use this for “The water table is 1.5 m down in a 4 m sand over 5 m of clay on gravel. Find σ′ at 12 m.”',
    assumptions: [
      'Sand 4 m (γ above the water table, γ_sat below it), clay 5 m, then gravel; all saturated below the table.',
      'γ_w = 9.81 kN/m³ and still water.',
    ],
    variables: [
      v('zw', 'z_w', 'Depth to the water table', 'm', 0.1, 4),
      v('g1', 'γ₁', 'Sand above the water table', 'kN/m³', 10, 25),
      v('g1s', 'γ₁,sat', 'Sand below the water table', 'kN/m³', 10, 25),
      v('g2', 'γ₂,sat', 'Clay', 'kN/m³', 10, 25),
      v('g3', 'γ₃,sat', 'Gravel', 'kN/m³', 10, 25),
      v('z', 'z', 'Depth (in the gravel)', 'm', 9, 60),
      v('sigma', 'σ', 'Total stress', 'kPa', 0, 1e4),
      v('u', 'u', 'Pore water pressure', 'kPa', 0, 1e4),
      v('se', 'σ′', 'Effective stress', 'kPa', 0, 1e4),
    ],
    relations: [
      rel(
        'σ = Σγh',
        '{sigma} = {g1} × {zw} + {g1s} × (4 − {zw}) + {g2} × 5 + {g3} × ({z} − 9)',
        ['sigma', 'g1', 'zw', 'g1s', 'g2', 'g3', 'z'],
        (x) => x.sigma! - (x.g1! * x.zw! + x.g1s! * (4 - x.zw!) + x.g2! * 5 + x.g3! * (x.z! - 9)),
        {
          sigma: [
            (x) => x.g1! * x.zw! + x.g1s! * (4 - x.zw!) + x.g2! * 5 + x.g3! * (x.z! - 9),
            '{g1} × {zw} + {g1s} × (4 − {zw}) + {g2} × 5 + {g3} × ({z} − 9)',
            'Each layer’s unit weight times its thickness above the point, added.',
          ],
        },
      ),
      rel(
        'u = γ_w(z − z_w)',
        '{u} = 9.81 × ({z} − {zw})',
        ['u', 'z', 'zw'],
        (x) => x.u! - GW * (x.z! - x.zw!),
        {
          u: [
            (x) => GW * (x.z! - x.zw!),
            '9.81 × ({z} − {zw})',
            'Water pressure grows with depth below the water table.',
          ],
        },
      ),
      rel(
        'σ′ = σ − u',
        '{se} = {sigma} − {u}',
        ['se', 'sigma', 'u'],
        (x) => x.se! - (x.sigma! - x.u!),
        {
          se: [
            (x) => x.sigma! - x.u!,
            '{sigma} − {u}',
            'The grains carry what the water does not.',
          ],
        },
      ),
    ],
    example: (() => {
      const [zw, g1, g1s, g2, g3, z] = [1.5, 17, 20, 18, 21, 12];
      const sigma = g1 * zw + g1s * (4 - zw) + g2 * 5 + g3 * (z - 9);
      const u = GW * (z - zw);
      return { zw, g1, g1s, g2, g3, z, sigma, u, se: sigma - u };
    })(),
    startWith: ['zw', 'g1', 'g1s', 'g2', 'g3', 'z'],
    representation: {
      kind: 'soilProfile',
      mode: 'stress',
      layers: [
        { soil: 'sand', name: 'Sand', thickness: 4, gamma: 'g1', gammaSat: 'g1s' },
        { soil: 'clay', name: 'Clay', thickness: 5, gammaSat: 'g2' },
        { soil: 'gravel', name: 'Gravel', thickness: 4, gammaSat: 'g3' },
      ],
      zw: 'zw',
      z: 'z',
      gammaW: GW,
      sigma: 'sigma',
      u: 'u',
      sigmaEff: 'se',
    },
  },
);

const clayVars = (): VariableDef[] => [
  v('H', 'H', 'Clay layer thickness', 'm', 0.1, 50),
  v('Cc', 'C_c', 'Compression index', undefined, 0.01, 3),
  v('e0', 'e₀', 'Initial void ratio', undefined, 0.1, 5),
  v('s0', 'σ′₀', 'Effective stress at mid-depth now', 'kPa', 1, 5000),
  v('ds', 'Δσ', 'Added stress at mid-depth', 'kPa', 0.1, 5000),
  v('S', 'S', 'Settlement', 'm', 0, 50),
];

/** A normally consolidated clay (soil-mechanics#2). */
const consolidation = demo(
  'g.he-soil-consolidation',
  'Settlement of a normally consolidated clay',
  {
    use: 'Use this for “A 4 m clay (C_c = 0.3, e₀ = 0.9) at σ′₀ = 80 kPa takes 60 kPa more. How far does it settle?”',
    assumptions: [
      'Normally consolidated: σ′₀ is the most the clay has carried.',
      'σ′₀ and Δσ are taken at the layer’s middle; one-dimensional, so the clay only shortens.',
    ],
    variables: clayVars(),
    relations: [
      rel(
        'S = C_cH ÷ (1 + e₀) × log((σ′₀ + Δσ) ÷ σ′₀)',
        '{S} = {Cc} × {H} ÷ (1 + {e0}) × log₁₀(({s0} + {ds}) ÷ {s0})',
        ['S', 'Cc', 'H', 'e0', 's0', 'ds'],
        (x) => x.S! - ((x.Cc! * x.H!) / (1 + x.e0!)) * log10((x.s0! + x.ds!) / x.s0!),
        {
          S: [
            (x) => fin(((x.Cc! * x.H!) / (1 + x.e0!)) * log10((x.s0! + x.ds!) / x.s0!)),
            '{Cc} × {H} ÷ (1 + {e0}) × log₁₀(({s0} + {ds}) ÷ {s0})',
            'The void ratio drops by C_c per tenfold rise in σ′; the layer shortens in proportion.',
          ],
          H: [
            (x) => fin((x.S! * (1 + x.e0!)) / (x.Cc! * log10((x.s0! + x.ds!) / x.s0!))),
            '{S} × (1 + {e0}) ÷ ({Cc} × log₁₀(({s0} + {ds}) ÷ {s0}))',
            'Divide the settlement by the strain per metre.',
          ],
          Cc: [
            (x) => fin((x.S! * (1 + x.e0!)) / (x.H! * log10((x.s0! + x.ds!) / x.s0!))),
            '{S} × (1 + {e0}) ÷ ({H} × log₁₀(({s0} + {ds}) ÷ {s0}))',
            'Undo the formula for C_c.',
          ],
          ds: [
            (x) => fin(x.s0! * (10 ** ((x.S! * (1 + x.e0!)) / (x.Cc! * x.H!)) - 1)),
            '{s0} × (10^({S} × (1 + {e0}) ÷ ({Cc} × {H})) − 1)',
            'Undo the log: raise 10 to the power, then take σ′₀ away.',
          ],
        },
      ),
    ],
    example: { H: 4, Cc: 0.3, e0: 0.9, s0: 80, ds: 60, S: ((0.3 * 4) / 1.9) * log10(140 / 80) },
    startWith: ['H', 'Cc', 'e0', 's0', 'ds'],
    representation: {
      kind: 'soilProfile',
      mode: 'consolidation',
      H: 'H',
      Cc: 'Cc',
      e0: 'e0',
      s0: 's0',
      ds: 'ds',
      S: 'S',
    },
  },
);

/** An overconsolidated clay loaded past σ′_p (soil-mechanics#2~overconsolidated). */
const ocS = (x: Values) =>
  (x.H! / (1 + x.e0!)) * (x.Cs! * log10(x.sp! / x.s0!) + x.Cc! * log10((x.s0! + x.ds!) / x.sp!));
const overconsolidated = demo(
  'g.he-soil-overconsolidated',
  'Settlement of an overconsolidated clay',
  {
    use: 'Use this for “The same clay has been loaded to 120 kPa before (C_s = 0.05). How far does it settle now?”',
    assumptions: [
      'Up to σ′_p the clay recompresses along C_s; past it, it compresses along C_c.',
      'σ′₀ ≤ σ′_p ≤ σ′₀ + Δσ: the new load takes the clay past what it has carried.',
    ],
    variables: [
      ...clayVars(),
      v('Cs', 'C_s', 'Swell index', undefined, 0.001, 1),
      v('sp', 'σ′_p', 'Preconsolidation stress', 'kPa', 1, 5000),
    ],
    relations: [
      atMost('s0', 'sp', '{s0} ≤ {sp}', 'σ′_p is at least today’s σ′₀.'),
      {
        relation: {
          id: 'σ′_p ≤ σ′₀ + Δσ',
          constraint: true,
          display: '{sp} ≤ {s0} + {ds}',
          vars: ['sp', 's0', 'ds'],
          residual: (x: Values) => (x.sp! <= (x.s0! + x.ds!) * (1 + 1e-9) ? 0 : 1),
          solve: {},
          message: () => 'This page is for a load that takes the clay past σ′_p.',
        } as Relation,
        steps: {} as Steps,
      },
      rel(
        'S = H ÷ (1 + e₀) × (C_s log(σ′_p ÷ σ′₀) + C_c log((σ′₀ + Δσ) ÷ σ′_p))',
        '{S} = {H} ÷ (1 + {e0}) × ({Cs} × log₁₀({sp} ÷ {s0}) + {Cc} × log₁₀(({s0} + {ds}) ÷ {sp}))',
        ['S', 'H', 'e0', 'Cs', 'sp', 's0', 'Cc', 'ds'],
        (x) => x.S! - ocS(x),
        {
          S: [
            (x) => fin(ocS(x)),
            '{H} ÷ (1 + {e0}) × ({Cs} × log₁₀({sp} ÷ {s0}) + {Cc} × log₁₀(({s0} + {ds}) ÷ {sp}))',
            'Recompression up to σ′_p along C_s, then fresh compression along C_c.',
          ],
        },
      ),
    ],
    example: (() => {
      const x = { H: 4, Cc: 0.3, e0: 0.9, s0: 80, ds: 60, Cs: 0.05, sp: 120 };
      return { ...x, S: ocS(x) };
    })(),
    startWith: ['H', 'Cc', 'e0', 's0', 'ds', 'Cs', 'sp'],
    representation: {
      kind: 'soilProfile',
      mode: 'consolidation',
      H: 'H',
      Cc: 'Cc',
      e0: 'e0',
      s0: 's0',
      ds: 'ds',
      Cs: 'Cs',
      sp: 'sp',
      S: 'S',
    },
  },
);

/** The drainage path and the time to consolidate (soil-mechanics#2~time-rate). */
const timeRate = demo('g.he-soil-time-rate', 'How long a clay takes to consolidate', {
  use: 'Use this for “A 4 m clay drained top and bottom has c_v = 2 m²/yr. When is it half consolidated?”',
  assumptions: [
    'Drained at the top and the bottom, so water travels at most H_dr = H ÷ 2.',
    'T_v = (π ÷ 4)U² holds for U up to 60%.',
  ],
  variables: [
    v('H', 'H', 'Clay layer thickness', 'm', 0.1, 50),
    v('Hdr', 'H_dr', 'Drainage path', 'm', 0.05, 25),
    v('cv', 'c_v', 'Coefficient of consolidation', 'm²/yr', 0.01, 100),
    v('U', 'U', 'Degree of consolidation', '%', 1, 60),
    v('Tv', 'T_v', 'Time factor', undefined, 0, 1),
    v('t', 't', 'Time', 'yr', 0, 1e4),
  ],
  relations: [
    rel('H_dr = H ÷ 2', '{Hdr} = {H} ÷ 2', ['Hdr', 'H'], (x) => x.Hdr! - x.H! / 2, {
      Hdr: [
        (x) => x.H! / 2,
        '{H} ÷ 2',
        'Water leaves by the nearer face, at most half the layer away.',
      ],
      H: [(x) => 2 * x.Hdr!, '2 × {Hdr}', 'Twice the drainage path.'],
    }),
    rel(
      'T_v = (π ÷ 4)U²',
      '{Tv} = π ÷ 4 × ({U} ÷ 100)²',
      ['Tv', 'U'],
      (x) => x.Tv! - (Math.PI / 4) * (x.U! / 100) ** 2,
      {
        Tv: [
          (x) => (Math.PI / 4) * (x.U! / 100) ** 2,
          'π ÷ 4 × ({U} ÷ 100)²',
          'The early-time curve: T_v grows as U².',
        ],
        U: [
          (x) => 100 * Math.sqrt((4 * x.Tv!) / Math.PI),
          '100 × √(4 × {Tv} ÷ π)',
          'Undo the square.',
        ],
      },
    ),
    rel(
      't = T_vH_dr² ÷ c_v',
      '{t} = {Tv} × {Hdr}² ÷ {cv}',
      ['t', 'Tv', 'Hdr', 'cv'],
      (x) => x.t! - (x.Tv! * x.Hdr! ** 2) / x.cv!,
      {
        t: [
          (x) => fin((x.Tv! * x.Hdr! ** 2) / x.cv!),
          '{Tv} × {Hdr}² ÷ {cv}',
          'Time grows with the square of the drainage path.',
        ],
        cv: [(x) => fin((x.Tv! * x.Hdr! ** 2) / x.t!), '{Tv} × {Hdr}² ÷ {t}', 'Swap c_v and t.'],
      },
    ),
  ],
  example: { H: 4, Hdr: 2, cv: 2, U: 50, Tv: Math.PI / 16, t: ((Math.PI / 16) * 4) / 2 },
  startWith: ['H', 'cv', 'U'],
  representation: {
    kind: 'soilProfile',
    mode: 'consolidation',
    H: 'H',
    Hdr: 'Hdr',
    drainage: 'double',
  },
});

/** Bearing capacity of a strip or square footing (soil-mechanics#4, ~square). */
function footing(id: string, title: string, use: string, square: boolean, ex: Values): ModuleDef {
  const [k1, k3] = square ? [1.3, 0.4] : [1, 0.5];
  const Nq = (phi: number) => Math.exp(Math.PI * tanD(phi)) * tanD(45 + phi / 2) ** 2;
  const qu = (x: Values) => k1 * x.c! * x.Nc! + x.g! * x.Df! * x.Nq! + k3 * x.g! * x.B! * x.Ng!;
  const nq = Nq(ex.phi!);
  const full = { ...ex, Nq: nq, Nc: (nq - 1) / tanD(ex.phi!), Ng: 2 * (nq + 1) * tanD(ex.phi!) };
  const q = qu(full);
  return demo(id, title, {
    use,
    assumptions: [
      'General shear failure: a wedge under the footing pushes the soil beside it out and up.',
      'N_q and N_c are Reissner–Prandtl’s, N_γ Vesic’s (Terzaghi’s own table differs a little); no water table near the base.',
      square
        ? 'A square footing: shape factors 1.3 on c′N_c and 0.4 on γBN_γ; allowable = q_u ÷ 3.'
        : 'A long strip footing; allowable = q_u ÷ 3 (a factor of safety of 3).',
    ],
    variables: [
      v('phi', 'φ′', 'Friction angle', '°', 1, 45),
      v('c', 'c′', 'Cohesion', 'kPa', 0, 500),
      v('g', 'γ', 'Unit weight', 'kN/m³', 10, 25),
      v('B', 'B', 'Footing width', 'm', 0.2, 20),
      v('Df', 'D_f', 'Depth of the base', 'm', 0.1, 10),
      v('Nq', 'N_q', 'Bearing factor N_q', undefined, 1, 1000),
      v('Nc', 'N_c', 'Bearing factor N_c', undefined, 1, 1000),
      v('Ng', 'N_γ', 'Bearing factor N_γ', undefined, 0, 1000),
      v('qu', 'q_u', 'Ultimate bearing capacity', 'kPa', 0, 1e5),
      v('qa', 'q_all', 'Allowable bearing pressure', 'kPa', 0, 1e5),
    ],
    relations: [
      rel(
        'N_q = e^(π tan φ′) tan²(45° + φ′ ÷ 2)',
        '{Nq} = e^(π × tan({phi})) × (1 + sin({phi})) ÷ (1 − sin({phi}))',
        ['Nq', 'phi'],
        (x) => x.Nq! - Nq(x.phi!),
        {
          Nq: [
            (x) => Nq(x.phi!),
            'e^(π × tan({phi})) × (1 + sin({phi})) ÷ (1 − sin({phi}))',
            'The surcharge beside the footing, carried round the log-spiral zone; tan²(45° + φ′ ÷ 2) = (1 + sin φ′) ÷ (1 − sin φ′).',
          ],
        },
      ),
      rel(
        'N_c = (N_q − 1) cot φ′',
        '{Nc} = ({Nq} − 1) ÷ tan({phi})',
        ['Nc', 'Nq', 'phi'],
        (x) => x.Nc! - (x.Nq! - 1) / tanD(x.phi!),
        {
          Nc: [
            (x) => fin((x.Nq! - 1) / tanD(x.phi!)),
            '({Nq} − 1) ÷ tan({phi})',
            'The cohesion factor follows from N_q.',
          ],
        },
      ),
      rel(
        'N_γ = 2(N_q + 1) tan φ′',
        '{Ng} = 2 × ({Nq} + 1) × tan({phi})',
        ['Ng', 'Nq', 'phi'],
        (x) => x.Ng! - 2 * (x.Nq! + 1) * tanD(x.phi!),
        {
          Ng: [
            (x) => 2 * (x.Nq! + 1) * tanD(x.phi!),
            '2 × ({Nq} + 1) × tan({phi})',
            'The soil’s own weight in the wedges.',
          ],
        },
      ),
      rel(
        square ? 'q_u = 1.3c′N_c + γD_fN_q + 0.4γBN_γ' : 'q_u = c′N_c + γD_fN_q + ½γBN_γ',
        `{qu} = ${k1} × {c} × {Nc} + {g} × {Df} × {Nq} + ${k3} × {g} × {B} × {Ng}`,
        ['qu', 'c', 'Nc', 'g', 'Df', 'Nq', 'B', 'Ng'],
        (x) => x.qu! - qu(x),
        {
          qu: [
            qu,
            `${k1} × {c} × {Nc} + {g} × {Df} × {Nq} + ${k3} × {g} × {B} × {Ng}`,
            'Cohesion, the soil above the base, and the soil’s weight under it, added.',
          ],
          B: [
            (x) => fin((x.qu! - k1 * x.c! * x.Nc! - x.g! * x.Df! * x.Nq!) / (k3 * x.g! * x.Ng!)),
            `({qu} − ${k1} × {c} × {Nc} − {g} × {Df} × {Nq}) ÷ (${k3} × {g} × {Ng})`,
            'Take the first two terms off q_u; the rest grows with B.',
          ],
        },
      ),
      rel('q_all = q_u ÷ 3', '{qa} = {qu} ÷ 3', ['qa', 'qu'], (x) => x.qa! - x.qu! / 3, {
        qa: [(x) => x.qu! / 3, '{qu} ÷ 3', 'A factor of safety of 3.'],
        qu: [(x) => 3 * x.qa!, '3 × {qa}', 'Undo the factor of safety.'],
      }),
    ],
    example: { ...full, qu: q, qa: q / 3 },
    startWith: ['phi', 'c', 'g', 'B', 'Df'],
    representation: {
      kind: 'soilProfile',
      mode: 'footing',
      B: 'B',
      Df: 'Df',
      phi: 'phi',
      q: 'qu',
      c: 'c',
      gamma: 'g',
      ...(square ? { shape: 'square' as const } : {}),
    },
  });
}

const stripFooting = footing(
  'g.he-soil-footing',
  'Bearing capacity of a strip footing',
  'Use this for “A 2 m strip footing sits 1.5 m down in sand, φ′ = 30°, c′ = 5 kPa, γ = 18 kN/m³. Find q_u and q_all.”',
  false,
  { phi: 30, c: 5, g: 18, B: 2, Df: 1.5 },
);

const squareFooting = footing(
  'g.he-soil-footing-square',
  'A square footing on a clayey sand',
  'Use this for “A 1.5 m square footing 1 m down: φ′ = 25°, c′ = 10 kPa, γ = 17 kN/m³. What is q_u?”',
  true,
  { phi: 25, c: 10, g: 17, B: 1.5, Df: 1 },
);

/** The punching shear perimeter of a square footing (concrete-design#3). */
const punching = demo('g.he-soil-punching', 'Two-way shear around a column on a square footing', {
  use: 'Use this for “A 16 in column on a 7.25 ft square footing, d = 15 in, P_u = 272 kips. Check punching shear.”',
  assumptions: [
    'A square column centred on the footing; the interior column’s 4√f′_c term governs, f′_c = 4000 psi.',
    'The soil pushes up evenly under the factored load; the critical perimeter is d ÷ 2 out from each face.',
  ],
  variables: [
    v('P', 'P', 'Service load', 'kips', 1, 1e4),
    v('q', 'q', 'Net allowable soil pressure', 'ksf', 0.5, 50),
    v('A', 'A_req', 'Area needed', 'ft²', 0.1, 1e4),
    v('B', 'B', 'Footing side', 'ft', 1, 50),
    v('Pu', 'P_u', 'Factored load', 'kips', 1, 2e4),
    v('c', 'c', 'Column side', 'in', 4, 60),
    v('d', 'd', 'Effective depth', 'in', 4, 60),
    v('b0', 'b₀', 'Critical perimeter', 'in', 1, 1000),
    v('Vu', 'V_u', 'Punching shear', 'kips', 0, 2e4),
    v('phiVc', 'φV_c', 'Punching strength', 'kips', 0, 2e4),
  ],
  relations: [
    rel('A_req = P ÷ q', '{A} = {P} ÷ {q}', ['A', 'P', 'q'], (x) => x.A! - x.P! / x.q!, {
      A: [(x) => fin(x.P! / x.q!), '{P} ÷ {q}', 'The area that keeps the soil pressure at q.'],
      P: [(x) => x.A! * x.q!, '{A} × {q}', 'Area times pressure.'],
    }),
    atMost('A', 'B', '{A} ≤ {B}²', 'The footing must be at least as big as the area needed.'),
    {
      relation: {
        id: 'c + d < 12B',
        constraint: true,
        display: '{c} + {d} < 12 × {B}',
        vars: ['c', 'd', 'B'],
        residual: (x: Values) => (x.c! + x.d! < 12 * x.B! ? 0 : 1),
        solve: {},
        message: () => 'The column and d must fit well inside the footing.',
      } as Relation,
      steps: {} as Steps,
    },
    rel(
      'b₀ = 4(c + d)',
      '{b0} = 4 × ({c} + {d})',
      ['b0', 'c', 'd'],
      (x) => x.b0! - 4 * (x.c! + x.d!),
      {
        b0: [
          (x) => 4 * (x.c! + x.d!),
          '4 × ({c} + {d})',
          'Four sides, each the column plus d ÷ 2 on both faces.',
        ],
        d: [(x) => x.b0! / 4 - x.c!, '{b0} ÷ 4 − {c}', 'One side less the column.'],
      },
    ),
    rel(
      'V_u = (P_u ÷ B²)(B² − (c + d)²)',
      '{Vu} = {Pu} ÷ {B}² × ({B}² − (({c} + {d}) ÷ 12)²)',
      ['Vu', 'Pu', 'B', 'c', 'd'],
      (x) => x.Vu! - (x.Pu! / x.B! ** 2) * (x.B! ** 2 - ((x.c! + x.d!) / 12) ** 2),
      {
        Vu: [
          (x) => fin((x.Pu! / x.B! ** 2) * (x.B! ** 2 - ((x.c! + x.d!) / 12) ** 2)),
          '{Pu} ÷ {B}² × ({B}² − (({c} + {d}) ÷ 12)²)',
          'The soil pressure on the footing outside the perimeter (inches ÷ 12 for feet).',
        ],
      },
    ),
    rel(
      'φV_c = 0.75 × 4√f′_c b₀d',
      '{phiVc} = 0.75 × 4 × √4000 × {b0} × {d} ÷ 1000',
      ['phiVc', 'b0', 'd'],
      (x) => x.phiVc! - (0.75 * 4 * Math.sqrt(4000) * x.b0! * x.d!) / 1000,
      {
        phiVc: [
          (x) => (0.75 * 4 * Math.sqrt(4000) * x.b0! * x.d!) / 1000,
          '0.75 × 4 × √4000 × {b0} × {d} ÷ 1000',
          'Concrete’s shear strength over the perimeter’s area b₀d, in pounds ÷ 1000 for kips.',
        ],
      },
    ),
  ],
  example: (() => {
    const [P, q, B, Pu, c, d] = [200, 4, 7.25, 272, 16, 15];
    const b0 = 4 * (c + d);
    return {
      P,
      q,
      A: P / q,
      B,
      Pu,
      c,
      d,
      b0,
      Vu: (Pu / B ** 2) * (B ** 2 - ((c + d) / 12) ** 2),
      phiVc: (0.75 * 4 * Math.sqrt(4000) * b0 * d) / 1000,
    };
  })(),
  startWith: ['P', 'q', 'B', 'Pu', 'c', 'd'],
  representation: { kind: 'soilProfile', mode: 'plan', B: 'B', c: 'c', d: 'd', b0: 'b0', perB: 12 },
});
// The area limit compares A with B², not B: give it its own residual.
punching.relations = punching.relations.map((r) =>
  r.id === 'A ≤ B'
    ? { ...r, residual: (x: Values) => (x.A! <= x.B! ** 2 * (1 + 1e-9) ? 0 : 1) }
    : r,
);

/** The structural number of a flexible pavement (transportation#2). */
function pavement(id: string, title: string, use: string, ex: Values, load?: number): ModuleDef {
  const SN = (x: Values) => x.a1! * x.D1! + x.a2! * x.D2! * x.m2! + x.a3! * x.D3! * x.m3!;
  return demo(id, title, {
    use,
    assumptions: [
      'AASHTO 1993: thicknesses in inches; a is a layer’s strength, m its drainage (1 for the surface).',
      'The SN needed comes from the design chart for the traffic and the subgrade, not from this page.',
    ],
    variables: [
      v('a1', 'a₁', 'Surface layer coefficient', undefined, 0.01, 1),
      v('D1', 'D₁', 'Surface thickness', 'in', 0.5, 20),
      v('a2', 'a₂', 'Base layer coefficient', undefined, 0.01, 1),
      v('D2', 'D₂', 'Base thickness', 'in', 0.5, 40),
      v('m2', 'm₂', 'Base drainage coefficient', undefined, 0.2, 1.5),
      v('a3', 'a₃', 'Subbase layer coefficient', undefined, 0.01, 1),
      v('D3', 'D₃', 'Subbase thickness', 'in', 0.5, 60),
      v('m3', 'm₃', 'Subbase drainage coefficient', undefined, 0.2, 1.5),
      v('SN', 'SN', 'Structural number', undefined, 0, 30),
    ],
    relations: [
      rel(
        'SN = a₁D₁ + a₂D₂m₂ + a₃D₃m₃',
        '{SN} = {a1} × {D1} + {a2} × {D2} × {m2} + {a3} × {D3} × {m3}',
        ['SN', 'a1', 'D1', 'a2', 'D2', 'm2', 'a3', 'D3', 'm3'],
        (x) => x.SN! - SN(x),
        {
          SN: [
            SN,
            '{a1} × {D1} + {a2} × {D2} × {m2} + {a3} × {D3} × {m3}',
            'Each layer adds its strength × thickness × drainage.',
          ],
          D3: [
            (x) => fin((x.SN! - x.a1! * x.D1! - x.a2! * x.D2! * x.m2!) / (x.a3! * x.m3!)),
            '({SN} − {a1} × {D1} − {a2} × {D2} × {m2}) ÷ ({a3} × {m3})',
            'What the surface and base leave of SN, the subbase must carry.',
          ],
          D1: [
            (x) => fin((x.SN! - x.a2! * x.D2! * x.m2! - x.a3! * x.D3! * x.m3!) / x.a1!),
            '({SN} − {a2} × {D2} × {m2} − {a3} × {D3} × {m3}) ÷ {a1}',
            'What the base and subbase leave of SN, the surface must carry.',
          ],
        },
      ),
    ],
    example: { ...ex, SN: SN(ex) },
    startWith: ['a1', 'D1', 'a2', 'D2', 'm2', 'a3', 'D3', 'm3'],
    representation: {
      kind: 'soilProfile',
      mode: 'pavement',
      layers: [
        { a: 'a1', D: 'D1' },
        { a: 'a2', D: 'D2', m: 'm2' },
        { a: 'a3', D: 'D3', m: 'm3' },
      ],
      SN: 'SN',
      ...(load ? { load } : {}),
    },
  });
}

const pave = pavement(
  'g.he-soil-pavement',
  'A flexible pavement’s structural number',
  'Use this for “4 in of asphalt (0.44), 8 in of base (0.14, m = 1) and 10 in of subbase (0.11, m = 0.9): find SN.”',
  { a1: 0.44, D1: 4, a2: 0.14, D2: 8, m2: 1, a3: 0.11, D3: 10, m3: 0.9 },
);

const paveThin = pavement(
  'g.he-soil-pavement-thick-subbase',
  'A thin surface on a deep, poorly drained subbase',
  'Use this for “2 in of asphalt over 6 in of base and 24 in of subbase that drains poorly (m = 0.6): what SN does it give?”',
  { a1: 0.44, D1: 2, a2: 0.14, D2: 6, m2: 0.8, a3: 0.11, D3: 24, m3: 0.6 },
  80,
);

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
  effectiveStress,
  stressLayers,
  consolidation,
  overconsolidated,
  timeRate,
  stripFooting,
  squareFooting,
  punching,
  pave,
  paveThin,
];

export const HE2I_GALLERY_LAYOUTS: LayoutDef[] = [zeroForce];
