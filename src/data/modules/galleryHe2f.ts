/**
 * College gallery demos, round 2, group F (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC20: the `freeBody` mechanics options (pulley on a table, Atwood with a light and a heavy
 * pulley, ladder, tip or slip, rope on a drum, banked curve), from the physics and mechanical
 * plans, with one demo at the edge of each range.
 *
 * HC25: the `freeBody` aircraft (level, stall, climb, a turn, a steep turn and the bank for a
 * standard-rate turn, static stability stable and unstable, the elevator to trim), from the
 * flight-mechanics plan.
 */
import type { Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef } from './types';

type Fn = (x: Values) => number | number[] | undefined;

/** A relation with its rearrangements, each [solve, expression, how] for the step text. */
interface Rule {
  id: string;
  display: string;
  vars: string[];
  residual: (x: Values) => number;
  solve: Record<string, [Fn, string, string]>;
}

const rule = (
  id: string,
  display: string,
  vars: string[],
  residual: (x: Values) => number,
  solve: Record<string, [Fn, string, string]>,
): Rule => ({ id, display, vars, residual, solve });

type Demo = Omit<ModuleDef, 'relations' | 'steps'> & { rules: Rule[] };

/** A module from its rules: the relations and their step text together. */
function demo({ rules, ...m }: Demo): ModuleDef {
  return {
    ...m,
    relations: rules.map((r) => ({
      id: r.id,
      display: r.display,
      vars: r.vars,
      residual: r.residual,
      solve: Object.fromEntries(Object.entries(r.solve).map(([k, [fn]]) => [k, fn])),
    })),
    steps: Object.fromEntries(
      rules.map((r) => [
        r.id,
        Object.fromEntries(Object.entries(r.solve).map(([k, [, expr, how]]) => [k, { expr, how }])),
      ]),
    ),
  };
}

const vr = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...(unit ? { unit } : {}), min, max, ...more });

const div = (a: number, b: number) => (b === 0 ? undefined : a / b);
const RAD = Math.PI / 180;
const tanD = (d: number) => Math.tan(d * RAD);
const cosD = (d: number) => Math.cos(d * RAD);
const sinD = (d: number) => Math.sin(d * RAD);
const atanD = (x: number) => Math.atan(x) / RAD;

// ─── HC20 freeBody: pulleys ─────────────────────────────────────────────────

const mass = (id: string, symbol: string, name: string) =>
  vr(id, symbol, name, 'kg', 0.01, 1000, { step: 0.1 });

/** a = (m₂ − μm₁)g ÷ (m₁ + m₂) and T = m₂(g − a), with g from the page. */
function tableRules(g: number): Rule[] {
  return [
    rule(
      'a = (m₂ − μₖm₁)g ÷ (m₁ + m₂)',
      `{a} = ({m2} − {mu} × {m1}) × ${g} ÷ ({m1} + {m2})`,
      ['a', 'm2', 'mu', 'm1'],
      (x) => x.a! * (x.m1! + x.m2!) - (x.m2! - x.mu! * x.m1!) * g,
      {
        a: [
          (x) => ((x.m2! - x.mu! * x.m1!) * g) / (x.m1! + x.m2!),
          `({m2} − {mu} × {m1}) × ${g} ÷ ({m1} + {m2})`,
          'Add the two blocks’ equations: the tension cancels, leaving the hanging weight less the friction, moving both masses.',
        ],
        mu: [
          (x) => div(x.m2! * g - x.a! * (x.m1! + x.m2!), x.m1! * g),
          `({m2} × ${g} − {a} × ({m1} + {m2})) ÷ ({m1} × ${g})`,
          'Undo a = (m₂ − μₖm₁)g ÷ (m₁ + m₂) for μₖ.',
        ],
        m2: [
          (x) => div(x.a! * x.m1! + x.mu! * x.m1! * g, g - x.a!),
          `({a} × {m1} + {mu} × {m1} × ${g}) ÷ (${g} − {a})`,
          'Gather the m₂ terms of a(m₁ + m₂) = (m₂ − μₖm₁)g on one side.',
        ],
        m1: [
          (x) => div(x.m2! * (g - x.a!), x.a! + x.mu! * g),
          `{m2} × (${g} − {a}) ÷ ({a} + {mu} × ${g})`,
          'Gather the m₁ terms of a(m₁ + m₂) = (m₂ − μₖm₁)g on one side.',
        ],
      },
    ),
    rule(
      'T = m₂(g − a)',
      `{T} = {m2} × (${g} − {a})`,
      ['T', 'm2', 'a'],
      (x) => x.T! - x.m2! * (g - x.a!),
      {
        T: [
          (x) => x.m2! * (g - x.a!),
          `{m2} × (${g} − {a})`,
          'Newton’s second law on the hanging block: its weight less the tension is m₂a.',
        ],
        m2: [(x) => div(x.T!, g - x.a!), `{T} ÷ (${g} − {a})`, 'Divide the tension by g − a.'],
        a: [(x) => g - x.T! / x.m2!, `${g} − {T} ÷ {m2}`, 'Undo T = m₂(g − a) for a.'],
      },
    ),
  ];
}

const tableEx = (m1: number, m2: number, mu: number, g: number): Values => {
  const a = ((m2 - mu * m1) * g) / (m1 + m2);
  return { m1, m2, mu, a, T: m2 * (g - a) };
};

const pulleyTable = demo({
  id: 'g.he-free-body-pulley-table',
  title: 'Free body: a block on a table pulled by a hanging block',
  use: 'Use this for “A 4 kg block on a table (μₖ = 0.25) is pulled by a 2 kg hanging block. Find a and T.”',
  assumptions: [
    'A light string over a light, frictionless pulley: the tension is the same on both sides.',
    'The blocks move together with one acceleration; g = 9.8 m/s².',
    'a ≤ 0 means μₖ is big enough that nothing slides once at rest.',
  ],
  variables: [
    mass('m1', 'm₁', 'Mass on the table'),
    mass('m2', 'm₂', 'Hanging mass'),
    vr('mu', 'μₖ', 'Kinetic friction coefficient', undefined, 0, 1.5, { step: 0.01 }),
    vr('a', 'a', 'Acceleration', 'm/s²', -100, 9.8, { derived: true }),
    vr('T', 'T', 'Tension', 'N', 0, 1e5, { derived: true }),
  ],
  rules: tableRules(9.8),
  example: tableEx(4, 2, 0.25, 9.8),
  startWith: ['m1', 'm2', 'mu'],
  representation: {
    kind: 'freeBody',
    g: 9.8,
    pulley: { layout: 'table', m1: 'm1', m2: 'm2', mu: 'mu', a: 'a', T: 'T' },
  },
});

const pulleyTableEng = demo({
  id: 'g.he-free-body-pulley-hanging',
  title: 'Free body: a crate on a floor pulled by a hanging mass (g = 9.81 m/s²)',
  use: 'Use this for “A 10 kg crate (μₖ = 0.2) is pulled by a 4 kg mass hanging over a pulley. Find a and the rope tension.”',
  assumptions: [
    'A light rope and pulley; the crate is already sliding.',
    'g = 9.81 m/s², as on the engineering pages; a ≤ 0 means it doesn’t start.',
  ],
  variables: [
    mass('m1', 'm₁', 'Mass on the floor'),
    mass('m2', 'm₂', 'Hanging mass'),
    vr('mu', 'μₖ', 'Kinetic friction coefficient', undefined, 0, 1.5, { step: 0.01 }),
    vr('a', 'a', 'Acceleration', 'm/s²', -100, 9.81, { derived: true }),
    vr('T', 'T', 'Tension', 'N', 0, 1e5, { derived: true }),
  ],
  rules: tableRules(9.81),
  example: tableEx(10, 4, 0.2, 9.81),
  startWith: ['m1', 'm2', 'mu'],
  representation: {
    kind: 'freeBody',
    g: 9.81,
    pulley: { layout: 'table', m1: 'm1', m2: 'm2', mu: 'mu', a: 'a', T: 'T' },
  },
});

const atwood = demo({
  id: 'g.he-free-body-pulley-atwood',
  title: 'Free body: an Atwood machine, both blocks hanging',
  use: 'Use this for “Blocks of 3 kg and 5 kg hang over a light pulley. Find the acceleration and the tension.”',
  assumptions: [
    'A light string over a light, frictionless pulley: one tension T on both sides.',
    'a > 0 means m₂ goes down and m₁ up; g = 9.8 m/s².',
  ],
  variables: [
    mass('m1', 'm₁', 'Left mass'),
    mass('m2', 'm₂', 'Right mass'),
    vr('a', 'a', 'Acceleration (m₂ down)', 'm/s²', -9.8, 9.8, { derived: true }),
    vr('T', 'T', 'Tension', 'N', 0, 1e5, { derived: true }),
  ],
  rules: [
    rule(
      'a = (m₂ − m₁)g ÷ (m₁ + m₂)',
      '{a} = ({m2} − {m1}) × 9.8 ÷ ({m1} + {m2})',
      ['a', 'm2', 'm1'],
      (x) => x.a! * (x.m1! + x.m2!) - (x.m2! - x.m1!) * 9.8,
      {
        a: [
          (x) => ((x.m2! - x.m1!) * 9.8) / (x.m1! + x.m2!),
          '({m2} − {m1}) × 9.8 ÷ ({m1} + {m2})',
          'Add the blocks’ equations: the difference in weight moves both masses.',
        ],
        m2: [
          (x) => div(x.m1! * (9.8 + x.a!), 9.8 - x.a!),
          '{m1} × (9.8 + {a}) ÷ (9.8 − {a})',
          'Gather the m₂ terms of a(m₁ + m₂) = (m₂ − m₁)g on one side.',
        ],
        m1: [
          (x) => div(x.m2! * (9.8 - x.a!), 9.8 + x.a!),
          '{m2} × (9.8 − {a}) ÷ (9.8 + {a})',
          'Gather the m₁ terms of a(m₁ + m₂) = (m₂ − m₁)g on one side.',
        ],
      },
    ),
    rule(
      'T = 2m₁m₂g ÷ (m₁ + m₂)',
      '{T} = 2 × {m1} × {m2} × 9.8 ÷ ({m1} + {m2})',
      ['T', 'm1', 'm2'],
      (x) => x.T! * (x.m1! + x.m2!) - 2 * x.m1! * x.m2! * 9.8,
      {
        T: [
          (x) => (2 * x.m1! * x.m2! * 9.8) / (x.m1! + x.m2!),
          '2 × {m1} × {m2} × 9.8 ÷ ({m1} + {m2})',
          'Put a back into T − m₁g = m₁a.',
        ],
        m1: [
          (x) => div(x.T! * x.m2!, 2 * x.m2! * 9.8 - x.T!),
          '{T} × {m2} ÷ (2 × {m2} × 9.8 − {T})',
          'Gather the m₁ terms of T(m₁ + m₂) = 2m₁m₂g.',
        ],
        m2: [
          (x) => div(x.T! * x.m1!, 2 * x.m1! * 9.8 - x.T!),
          '{T} × {m1} ÷ (2 × {m1} × 9.8 − {T})',
          'Gather the m₂ terms of T(m₁ + m₂) = 2m₁m₂g.',
        ],
      },
    ),
  ],
  example: { m1: 3, m2: 5, a: 2.45, T: 36.75 },
  startWith: ['m1', 'm2'],
  representation: {
    kind: 'freeBody',
    g: 9.8,
    pulley: { layout: 'atwood', m1: 'm1', m2: 'm2', a: 'a', T: 'T' },
  },
});

/** An Atwood machine with a uniform-disk pulley of mass M (by Lagrange). */
function diskAtwood(id: string, M: number, title: string, use: string): ModuleDef {
  const a0 = (2 * 9.8) / (8 + M / 2);
  return demo({
    id,
    title,
    use,
    assumptions: [
      'The pulley is a uniform disk, I = ½MR², and the string doesn’t slip on it.',
      'Lagrange: T = ½(m₁ + m₂ + I/R²)ẋ² and V = (m₁ − m₂)gx give one equation for a.',
      'a > 0 means m₂ goes down; g = 9.8 m/s².',
    ],
    variables: [
      mass('m1', 'm₁', 'Left mass'),
      mass('m2', 'm₂', 'Right mass'),
      mass('M', 'M', 'Pulley mass'),
      vr('a', 'a', 'Acceleration (m₂ down)', 'm/s²', -9.8, 9.8, { derived: true }),
      vr('T1', 'T₁', 'Tension on m₁', 'N', 0, 1e5, { derived: true }),
      vr('T2', 'T₂', 'Tension on m₂', 'N', 0, 1e5, { derived: true }),
    ],
    rules: [
      rule(
        'a = (m₂ − m₁)g ÷ (m₁ + m₂ + ½M)',
        '{a} = ({m2} − {m1}) × 9.8 ÷ ({m1} + {m2} + {M} ÷ 2)',
        ['a', 'm2', 'm1', 'M'],
        (x) => x.a! * (x.m1! + x.m2! + x.M! / 2) - (x.m2! - x.m1!) * 9.8,
        {
          a: [
            (x) => ((x.m2! - x.m1!) * 9.8) / (x.m1! + x.m2! + x.M! / 2),
            '({m2} − {m1}) × 9.8 ÷ ({m1} + {m2} + {M} ÷ 2)',
            'The Euler–Lagrange equation for x: the weight difference moves both blocks and turns the disk.',
          ],
          M: [
            (x) => {
              const s = div((x.m2! - x.m1!) * 9.8, x.a!);
              return s === undefined ? undefined : 2 * (s - x.m1! - x.m2!);
            },
            '2 × (({m2} − {m1}) × 9.8 ÷ {a} − {m1} − {m2})',
            'Undo a = (m₂ − m₁)g ÷ (m₁ + m₂ + ½M) for M.',
          ],
          m2: [
            (x) => div(x.a! * (x.m1! + x.M! / 2) + x.m1! * 9.8, 9.8 - x.a!),
            '({a} × ({m1} + {M} ÷ 2) + {m1} × 9.8) ÷ (9.8 − {a})',
            'Gather the m₂ terms on one side.',
          ],
          m1: [
            (x) => div(x.m2! * 9.8 - x.a! * (x.m2! + x.M! / 2), 9.8 + x.a!),
            '({m2} × 9.8 − {a} × ({m2} + {M} ÷ 2)) ÷ (9.8 + {a})',
            'Gather the m₁ terms on one side.',
          ],
        },
      ),
      rule(
        'T₁ = m₁(g + a)',
        '{T1} = {m1} × (9.8 + {a})',
        ['T1', 'm1', 'a'],
        (x) => x.T1! - x.m1! * (9.8 + x.a!),
        {
          T1: [
            (x) => x.m1! * (9.8 + x.a!),
            '{m1} × (9.8 + {a})',
            'm₁ rises with a: the tension beats its weight by m₁a.',
          ],
          m1: [(x) => div(x.T1!, 9.8 + x.a!), '{T1} ÷ (9.8 + {a})', 'Divide T₁ by g + a.'],
          a: [(x) => x.T1! / x.m1! - 9.8, '{T1} ÷ {m1} − 9.8', 'Undo T₁ = m₁(g + a) for a.'],
        },
      ),
      rule(
        'T₂ = m₂(g − a)',
        '{T2} = {m2} × (9.8 − {a})',
        ['T2', 'm2', 'a'],
        (x) => x.T2! - x.m2! * (9.8 - x.a!),
        {
          T2: [
            (x) => x.m2! * (9.8 - x.a!),
            '{m2} × (9.8 − {a})',
            'm₂ falls with a: its weight beats the tension by m₂a.',
          ],
          m2: [(x) => div(x.T2!, 9.8 - x.a!), '{T2} ÷ (9.8 − {a})', 'Divide T₂ by g − a.'],
          a: [(x) => 9.8 - x.T2! / x.m2!, '9.8 − {T2} ÷ {m2}', 'Undo T₂ = m₂(g − a) for a.'],
        },
      ),
    ],
    example: { m1: 3, m2: 5, M, a: a0, T1: 3 * (9.8 + a0), T2: 5 * (9.8 - a0) },
    startWith: ['m1', 'm2', 'M'],
    representation: {
      kind: 'freeBody',
      g: 9.8,
      pulley: {
        layout: 'atwood',
        m1: 'm1',
        m2: 'm2',
        pulleyMass: 'M',
        a: 'a',
        T: 'T1',
        T2: 'T2',
      },
    },
  });
}

const atwoodDisk = diskAtwood(
  'g.he-free-body-pulley-disk',
  2,
  'Free body: an Atwood machine with a disk pulley, by Lagrange',
  'Use this for “3 kg and 5 kg hang over a 2 kg disk pulley. Find a and both tensions.”',
);

const atwoodFlywheel = diskAtwood(
  'g.he-free-body-pulley-flywheel',
  20,
  'Free body: an Atwood machine with a heavy flywheel pulley',
  'Use this for “3 kg and 5 kg hang over a 20 kg disk. How much slower do they move, and how different are the tensions?”',
);

// ─── HC20 freeBody: ladder ──────────────────────────────────────────────────

function ladder(id: string, deg: number, title: string, use: string): ModuleDef {
  const W = 200;
  const Nw = W / (2 * tanD(deg));
  return demo({
    id,
    title,
    use,
    assumptions: [
      'A uniform ladder: its weight acts at the middle.',
      'The wall is smooth (it only pushes level); the floor is rough.',
      'Torques about the foot remove N_f and f from the balance.',
    ],
    variables: [
      vr('W', 'W', 'Weight of the ladder', 'N', 1, 1e5, { step: 1 }),
      vr('theta', 'θ', 'Angle with the floor', '°', 1, 89, { step: 1 }),
      vr('Nw', 'N_w', 'Push of the wall', 'N', 0, 1e7, { derived: true }),
      vr('Nf', 'N_f', 'Push of the floor', 'N', 1, 1e5, { derived: true }),
      vr('f', 'f', 'Friction at the foot', 'N', 0, 1e7, { derived: true }),
      vr('mu', 'μₛ', 'Least static friction coefficient', undefined, 0, 100, { derived: true }),
    ],
    rules: [
      rule('N_f = W', '{Nf} = {W}', ['Nf', 'W'], (x) => x.Nf! - x.W!, {
        Nf: [
          (x) => x.W!,
          '{W}',
          'Up and down: only the floor holds the weight (the wall is smooth).',
        ],
        W: [(x) => x.Nf!, '{Nf}', 'The floor’s push is the weight.'],
      }),
      rule(
        'N_w = W ÷ (2 tan θ)',
        '{Nw} = {W} ÷ (2 × tan({theta}))',
        ['Nw', 'W', 'theta'],
        (x) => 2 * x.Nw! * tanD(x.theta!) - x.W!,
        {
          Nw: [
            (x) => x.W! / (2 * tanD(x.theta!)),
            '{W} ÷ (2 × tan({theta}))',
            'Torques about the foot: N_w × L sin θ = W × ½L cos θ.',
          ],
          W: [
            (x) => 2 * x.Nw! * tanD(x.theta!),
            '2 × {Nw} × tan({theta})',
            'Undo N_w = W ÷ (2 tan θ).',
          ],
          theta: [
            (x) => atanD(x.W! / (2 * x.Nw!)),
            'tan⁻¹({W} ÷ (2 × {Nw}))',
            'Undo N_w = W ÷ (2 tan θ) for the angle.',
          ],
        },
      ),
      rule('f = N_w', '{f} = {Nw}', ['f', 'Nw'], (x) => x.f! - x.Nw!, {
        f: [(x) => x.Nw!, '{Nw}', 'Level forces: friction at the foot balances the wall’s push.'],
        Nw: [(x) => x.f!, '{f}', 'The wall’s push equals the friction.'],
      }),
      rule('μₛ = f ÷ N_f', '{mu} = {f} ÷ {Nf}', ['mu', 'f', 'Nf'], (x) => x.mu! * x.Nf! - x.f!, {
        mu: [
          (x) => div(x.f!, x.Nf!),
          '{f} ÷ {Nf}',
          'The floor holds while μₛN_f ≥ f: the least μₛ is f ÷ N_f.',
        ],
        f: [(x) => x.mu! * x.Nf!, '{mu} × {Nf}', 'Friction at its limit is μₛN_f.'],
        Nf: [(x) => div(x.f!, x.mu!), '{f} ÷ {mu}', 'Divide f by μₛ.'],
      }),
    ],
    example: { W, theta: deg, Nw, Nf: W, f: Nw, mu: Nw / W },
    startWith: ['W', 'theta'],
    representation: {
      kind: 'freeBody',
      ladder: { angle: 'theta', weight: 'W', wall: 'Nw', floor: 'Nf', friction: 'f', mu: 'mu' },
    },
  });
}

const ladderMain = ladder(
  'g.he-free-body-ladder',
  60,
  'Free body: a ladder against a smooth wall',
  'Use this for “A 200 N ladder leans at 60° on a smooth wall. Find the wall’s push and the least μₛ at the floor.”',
);

const ladderLow = ladder(
  'g.he-free-body-ladder-low',
  20,
  'Free body: a ladder leaning low, at 20°',
  'Use this for “Could a ladder stand at 20° to the floor? How rough must the floor be?”',
);

// ─── HC20 freeBody: tip or slip ─────────────────────────────────────────────

function tip(id: string, h: number, title: string, use: string): ModuleDef {
  const [W, b, mu] = [300, 0.6, 0.4];
  return demo({
    id,
    title,
    use,
    assumptions: [
      'The push is level, at height h; W acts at the crate’s center.',
      'About to tip, N and friction act at the front bottom edge; about to slip, friction is μₛW.',
      'The smaller of the two pushes happens first.',
    ],
    variables: [
      vr('W', 'W', 'Weight of the crate', 'N', 1, 1e5, { step: 1 }),
      vr('b', 'b', 'Width of the crate', 'm', 0.01, 10, { step: 0.01 }),
      vr('h', 'h', 'Height of the push', 'm', 0.01, 10, { step: 0.01 }),
      vr('mu', 'μₛ', 'Static friction coefficient', undefined, 0.01, 1.5, { step: 0.01 }),
      vr('Ptip', 'P_tip', 'Push to tip it', 'N', 0, 1e7, { derived: true }),
      vr('Pslip', 'P_slip', 'Push to slide it', 'N', 0, 1e7, { derived: true }),
    ],
    rules: [
      rule(
        'P_tip = Wb ÷ (2h)',
        '{Ptip} = {W} × {b} ÷ (2 × {h})',
        ['Ptip', 'W', 'b', 'h'],
        (x) => 2 * x.Ptip! * x.h! - x.W! * x.b!,
        {
          Ptip: [
            (x) => (x.W! * x.b!) / (2 * x.h!),
            '{W} × {b} ÷ (2 × {h})',
            'Torques about the front edge: P × h = W × b ÷ 2 when it is about to tip.',
          ],
          h: [
            (x) => div(x.W! * x.b!, 2 * x.Ptip!),
            '{W} × {b} ÷ (2 × {Ptip})',
            'Undo P_tip = Wb ÷ (2h) for h.',
          ],
          b: [
            (x) => div(2 * x.Ptip! * x.h!, x.W!),
            '2 × {Ptip} × {h} ÷ {W}',
            'Undo P_tip = Wb ÷ (2h) for b.',
          ],
          W: [
            (x) => div(2 * x.Ptip! * x.h!, x.b!),
            '2 × {Ptip} × {h} ÷ {b}',
            'Undo P_tip = Wb ÷ (2h) for W.',
          ],
        },
      ),
      rule(
        'P_slip = μₛW',
        '{Pslip} = {mu} × {W}',
        ['Pslip', 'mu', 'W'],
        (x) => x.Pslip! - x.mu! * x.W!,
        {
          Pslip: [
            (x) => x.mu! * x.W!,
            '{mu} × {W}',
            'About to slide, friction is at its limit μₛN, and N = W.',
          ],
          mu: [(x) => div(x.Pslip!, x.W!), '{Pslip} ÷ {W}', 'Divide P_slip by W.'],
          W: [(x) => div(x.Pslip!, x.mu!), '{Pslip} ÷ {mu}', 'Divide P_slip by μₛ.'],
        },
      ),
    ],
    example: { W, b, h, mu, Ptip: (W * b) / (2 * h), Pslip: mu * W },
    startWith: ['W', 'b', 'h', 'mu'],
    representation: {
      kind: 'freeBody',
      tip: { width: 'b', height: 'h', weight: 'W', mu: 'mu', tip: 'Ptip', slip: 'Pslip' },
    },
  });
}

const tipMain = tip(
  'g.he-free-body-tip',
  1.2,
  'Free body: will the crate tip or slip?',
  'Use this for “A 300 N crate 0.6 m wide is pushed at 1.2 m (μₛ = 0.4). Does it tip or slide first, and at what push?”',
);

const tipLow = tip(
  'g.he-free-body-tip-low',
  0.3,
  'Free body: a low push slides the crate',
  'Use this for “Pushed at 0.3 m instead, does the same crate still tip?”',
);

// ─── HC20 freeBody: rope on a drum ──────────────────────────────────────────

function drum(id: string, t1: number, beta: number, title: string, use: string): ModuleDef {
  const mu = 0.3;
  return demo({
    id,
    title,
    use,
    assumptions: [
      'The rope is about to slip on the fixed drum, toward the tight side T₂.',
      'β is the angle of contact; in the formula it is in radians (β° × π ÷ 180).',
    ],
    variables: [
      vr('T1', 'T₁', 'Slack-side tension', 'N', 0.1, 1e6, { step: 1 }),
      vr('mu', 'μ', 'Friction coefficient', undefined, 0.01, 1, { step: 0.01 }),
      vr('beta', 'β', 'Angle of contact', '°', 1, 3600, { step: 1 }),
      vr('T2', 'T₂', 'Tight-side tension', 'N', 0.1, 1e9, { derived: true }),
    ],
    rules: [
      rule(
        'T₂ = T₁e^(μβ)',
        '{T2} = {T1} × e^({mu} × {beta} × π ÷ 180)',
        ['T2', 'T1', 'mu', 'beta'],
        (x) => Math.log(x.T2! / x.T1!) - x.mu! * x.beta! * RAD,
        {
          T2: [
            (x) => x.T1! * Math.exp(x.mu! * x.beta! * RAD),
            '{T1} × e^({mu} × {beta} × π ÷ 180)',
            'Each bit of contact adds friction in proportion to the tension there, so it grows exponentially.',
          ],
          T1: [
            (x) => x.T2! / Math.exp(x.mu! * x.beta! * RAD),
            '{T2} ÷ e^({mu} × {beta} × π ÷ 180)',
            'Divide T₂ by e^(μβ).',
          ],
          mu: [
            (x) => div(Math.log(x.T2! / x.T1!), x.beta! * RAD),
            'ln({T2} ÷ {T1}) ÷ ({beta} × π ÷ 180)',
            'Take the natural log of T₂ ÷ T₁ and divide by β in radians.',
          ],
          beta: [
            (x) => div(Math.log(x.T2! / x.T1!), x.mu! * RAD),
            'ln({T2} ÷ {T1}) ÷ {mu} × 180 ÷ π',
            'Take the natural log of T₂ ÷ T₁, divide by μ, and turn radians into degrees.',
          ],
        },
      ),
    ],
    example: { T1: t1, mu, beta, T2: t1 * Math.exp(mu * beta * RAD) },
    startWith: ['T1', 'mu', 'beta'],
    representation: {
      kind: 'freeBody',
      drum: { t1: 'T1', t2: 'T2', mu: 'mu', wrap: 'beta' },
    },
  });
}

const drumMain = drum(
  'g.he-free-body-drum',
  100,
  180,
  'Free body: a rope over a drum, T₂ = T₁e^(μβ)',
  'Use this for “A rope passes half way round a fixed drum (μ = 0.3) with 100 N on the slack side. What pull makes it slip?”',
);

const drumCapstan = drum(
  'g.he-free-body-drum-capstan',
  50,
  1080,
  'Free body: three turns round a capstan',
  'Use this for “With three turns of rope on a capstan (μ = 0.3), what load can a 50 N pull hold?”',
);

// ─── HC20 freeBody: banked curve ────────────────────────────────────────────

const banked = demo({
  id: 'g.he-free-body-banked',
  title: 'Free body: the speed a frictionless bank is made for',
  use: 'Use this for “A curve of radius 50 m is banked at 15°. At what speed does a car need no friction?”',
  assumptions: [
    'No friction: only N and mg act, and their sum is the centripetal force.',
    'N cos θ = mg and N sin θ = mv²/r, so tan θ = v² ÷ (rg); g = 9.8 m/s².',
  ],
  variables: [
    vr('r', 'r', 'Radius of the curve', 'm', 1, 1e4, { step: 1 }),
    vr('theta', 'θ', 'Bank angle', '°', 0.1, 80, { step: 0.5 }),
    vr('m', 'm', 'Mass of the car', 'kg', 1, 1e5, { step: 10 }),
    vr('v', 'v', 'Design speed', 'm/s', 0, 1000, { derived: true }),
    vr('N', 'N', 'Normal force', 'N', 0, 1e7, { derived: true }),
  ],
  rules: [
    rule(
      'tan θ = v² ÷ (rg)',
      'tan({theta}) = {v}² ÷ ({r} × 9.8)',
      ['v', 'r', 'theta'],
      (x) => x.v! ** 2 - x.r! * 9.8 * tanD(x.theta!),
      {
        v: [
          (x) => Math.sqrt(x.r! * 9.8 * tanD(x.theta!)),
          '√({r} × 9.8 × tan({theta}))',
          'Divide N sin θ = mv²/r by N cos θ = mg: the mass and N cancel.',
        ],
        r: [
          (x) => div(x.v! ** 2, 9.8 * tanD(x.theta!)),
          '{v}² ÷ (9.8 × tan({theta}))',
          'Undo tan θ = v² ÷ (rg) for r.',
        ],
        theta: [
          (x) => atanD(x.v! ** 2 / (x.r! * 9.8)),
          'tan⁻¹({v}² ÷ ({r} × 9.8))',
          'Undo tan θ = v² ÷ (rg) for the angle.',
        ],
      },
    ),
    rule(
      'N = mg ÷ cos θ',
      '{N} = {m} × 9.8 ÷ cos({theta})',
      ['N', 'm', 'theta'],
      (x) => x.N! * cosD(x.theta!) - x.m! * 9.8,
      {
        N: [
          (x) => (x.m! * 9.8) / cosD(x.theta!),
          '{m} × 9.8 ÷ cos({theta})',
          'Up and down: N cos θ holds the weight mg.',
        ],
        m: [
          (x) => (x.N! * cosD(x.theta!)) / 9.8,
          '{N} × cos({theta}) ÷ 9.8',
          'Undo N = mg ÷ cos θ for m.',
        ],
      },
    ),
  ],
  example: {
    r: 50,
    theta: 15,
    m: 1200,
    v: Math.sqrt(50 * 9.8 * tanD(15)),
    N: (1200 * 9.8) / cosD(15),
  },
  startWith: ['r', 'theta', 'm'],
  representation: {
    kind: 'freeBody',
    g: 9.8,
    banked: { angle: 'theta', radius: 'r', speed: 'v', mass: 'm', normal: 'N' },
  },
});

const vmaxOf = (r: number, d: number, mu: number) =>
  Math.sqrt((r * 9.81 * (sinD(d) + mu * cosD(d))) / (cosD(d) - mu * sinD(d)));

const bankedFriction = demo({
  id: 'g.he-free-body-banked-friction',
  title: 'Free body: the top speed on a banked curve with friction',
  use: 'Use this for “A 50 m curve is banked at 20° with μₛ = 0.3. What is the design speed, and the most a car can take it at?”',
  assumptions: [
    'Without friction the bank alone turns the car at v = √(gR tan θ).',
    'At the top speed friction μₛN points down the slope and adds to the inward pull; g = 9.81 m/s².',
  ],
  variables: [
    vr('R', 'R', 'Radius of the curve', 'm', 1, 1e4, { step: 1 }),
    vr('theta', 'θ', 'Bank angle', '°', 0.1, 60, { step: 0.5 }),
    vr('mu', 'μₛ', 'Static friction coefficient', undefined, 0, 1, { step: 0.01 }),
    vr('v', 'v', 'Speed with no friction', 'm/s', 0, 1000, { derived: true }),
    vr('vmax', 'v_max', 'Top speed', 'm/s', 0, 1000, { derived: true }),
  ],
  rules: [
    rule(
      'v = √(gR tan θ)',
      '{v} = √(9.81 × {R} × tan({theta}))',
      ['v', 'R', 'theta'],
      (x) => x.v! ** 2 - 9.81 * x.R! * tanD(x.theta!),
      {
        v: [
          (x) => Math.sqrt(9.81 * x.R! * tanD(x.theta!)),
          '√(9.81 × {R} × tan({theta}))',
          'With no friction, N sin θ = mv²/R and N cos θ = mg.',
        ],
        R: [
          (x) => div(x.v! ** 2, 9.81 * tanD(x.theta!)),
          '{v}² ÷ (9.81 × tan({theta}))',
          'Undo v = √(gR tan θ) for R.',
        ],
        theta: [
          (x) => atanD(x.v! ** 2 / (9.81 * x.R!)),
          'tan⁻¹({v}² ÷ (9.81 × {R}))',
          'Undo v = √(gR tan θ) for the angle.',
        ],
      },
    ),
    rule(
      'v_max = √(gR(sin θ + μ cos θ) ÷ (cos θ − μ sin θ))',
      '{vmax} = √(9.81 × {R} × (sin({theta}) + {mu} × cos({theta})) ÷ (cos({theta}) − {mu} × sin({theta})))',
      ['vmax', 'R', 'theta', 'mu'],
      (x) =>
        x.vmax! ** 2 * (cosD(x.theta!) - x.mu! * sinD(x.theta!)) -
        9.81 * x.R! * (sinD(x.theta!) + x.mu! * cosD(x.theta!)),
      {
        vmax: [
          (x) =>
            cosD(x.theta!) - x.mu! * sinD(x.theta!) > 0 ? vmaxOf(x.R!, x.theta!, x.mu!) : undefined,
          '√(9.81 × {R} × (sin({theta}) + {mu} × cos({theta})) ÷ (cos({theta}) − {mu} × sin({theta})))',
          'Level: N(sin θ + μ cos θ) = mv²/R; up and down: N(cos θ − μ sin θ) = mg; divide.',
        ],
        mu: [
          (x) => {
            const k = x.vmax! ** 2 / (9.81 * x.R!);
            return div(k * cosD(x.theta!) - sinD(x.theta!), cosD(x.theta!) + k * sinD(x.theta!));
          },
          '({vmax}² ÷ (9.81 × {R}) × cos({theta}) − sin({theta})) ÷ (cos({theta}) + {vmax}² ÷ (9.81 × {R}) × sin({theta}))',
          'Gather the μ terms of the top-speed balance on one side.',
        ],
        R: [
          (x) =>
            div(
              x.vmax! ** 2 * (cosD(x.theta!) - x.mu! * sinD(x.theta!)),
              9.81 * (sinD(x.theta!) + x.mu! * cosD(x.theta!)),
            ),
          '{vmax}² × (cos({theta}) − {mu} × sin({theta})) ÷ (9.81 × (sin({theta}) + {mu} × cos({theta})))',
          'Undo the top-speed formula for R.',
        ],
      },
    ),
  ],
  example: {
    R: 50,
    theta: 20,
    mu: 0.3,
    v: Math.sqrt(9.81 * 50 * tanD(20)),
    vmax: vmaxOf(50, 20, 0.3),
  },
  startWith: ['R', 'theta', 'mu'],
  representation: {
    kind: 'freeBody',
    g: 9.81,
    banked: { angle: 'theta', radius: 'R', speed: 'vmax', mu: 'mu' },
  },
});

// ─── HC25 freeBody: aircraft ────────────────────────────────────────────────

const asinD = (x: number) => Math.asin(x) / RAD;
const newtons = (id: string, symbol: string, name: string) =>
  vr(id, symbol, name, 'N', 1, 5e6, { step: 1 });

const levelD = (W: number, rho: number, V: number, S: number, CD0: number, K: number) => {
  const q = 0.5 * rho * V * V;
  const CL = W / (q * S);
  const CD = CD0 + K * CL * CL;
  return { W, rho, V, S, CD0, K, CL, CD, D: q * S * CD };
};

const aircraftLevel = demo({
  id: 'g.he-free-body-aircraft-level',
  title: 'Free body: an airplane in steady, level flight',
  use: 'Use this for “A 50,000 N airplane flies level at 80 m/s where ρ = 1.0 kg/m³ (S = 20 m², C_D0 = 0.025, K = 0.05). Find C_L and the thrust required.”',
  assumptions: [
    'Steady, level, unaccelerated flight: L = W and T = D.',
    'A parabolic drag polar, C_D = C_D0 + KC_L².',
  ],
  variables: [
    newtons('W', 'W', 'Weight'),
    vr('rho', 'ρ', 'Air density', 'kg/m³', 0.01, 2, { step: 0.001 }),
    vr('V', 'V', 'Airspeed', 'm/s', 1, 1000, { step: 1 }),
    vr('S', 'S', 'Wing area', 'm²', 0.1, 1000, { step: 0.1 }),
    vr('CD0', 'C_D0', 'Zero-lift drag coefficient', undefined, 0.001, 0.2, { step: 0.001 }),
    vr('K', 'K', 'Induced drag factor', undefined, 0.001, 1, { step: 0.001 }),
    vr('CL', 'C_L', 'Lift coefficient', undefined, 0.0001, 100, { derived: true }),
    vr('CD', 'C_D', 'Drag coefficient', undefined, 0.0001, 1e4, { derived: true }),
    vr('D', 'D', 'Drag (thrust required)', 'N', 0.001, 1e9, { derived: true }),
  ],
  rules: [
    rule(
      'W = ½ρV²SC_L',
      '{W} = ½ × {rho} × {V}² × {S} × {CL}',
      ['W', 'rho', 'V', 'S', 'CL'],
      (x) => x.W! - 0.5 * x.rho! * x.V! ** 2 * x.S! * x.CL!,
      {
        CL: [
          (x) => x.W! / (0.5 * x.rho! * x.V! ** 2 * x.S!),
          '{W} ÷ (½ × {rho} × {V}² × {S})',
          'Level flight: the lift ½ρV²SC_L carries the weight.',
        ],
        W: [
          (x) => 0.5 * x.rho! * x.V! ** 2 * x.S! * x.CL!,
          '½ × {rho} × {V}² × {S} × {CL}',
          'In level flight the weight is the lift.',
        ],
        S: [
          (x) => x.W! / (0.5 * x.rho! * x.V! ** 2 * x.CL!),
          '{W} ÷ (½ × {rho} × {V}² × {CL})',
          'Undo L = ½ρV²SC_L for the wing area.',
        ],
        V: [
          (x) => Math.sqrt(x.W! / (0.5 * x.rho! * x.S! * x.CL!)),
          '√({W} ÷ (½ × {rho} × {S} × {CL}))',
          'Undo L = ½ρV²SC_L for the speed.',
        ],
        rho: [
          (x) => x.W! / (0.5 * x.V! ** 2 * x.S! * x.CL!),
          '{W} ÷ (½ × {V}² × {S} × {CL})',
          'Undo L = ½ρV²SC_L for the density.',
        ],
      },
    ),
    rule(
      'C_D = C_D0 + KC_L²',
      '{CD} = {CD0} + {K} × {CL}²',
      ['CD', 'CD0', 'K', 'CL'],
      (x) => x.CD! - x.CD0! - x.K! * x.CL! ** 2,
      {
        CD: [
          (x) => x.CD0! + x.K! * x.CL! ** 2,
          '{CD0} + {K} × {CL}²',
          'The drag polar: parasite drag plus the drag due to lift.',
        ],
        CD0: [
          (x) => x.CD! - x.K! * x.CL! ** 2,
          '{CD} − {K} × {CL}²',
          'Take the induced part from C_D.',
        ],
        K: [
          (x) => div(x.CD! - x.CD0!, x.CL! ** 2),
          '({CD} − {CD0}) ÷ {CL}²',
          'Undo the polar for K.',
        ],
      },
    ),
    rule(
      'D = ½ρV²SC_D',
      '{D} = ½ × {rho} × {V}² × {S} × {CD}',
      ['D', 'rho', 'V', 'S', 'CD'],
      (x) => x.D! - 0.5 * x.rho! * x.V! ** 2 * x.S! * x.CD!,
      {
        D: [
          (x) => 0.5 * x.rho! * x.V! ** 2 * x.S! * x.CD!,
          '½ × {rho} × {V}² × {S} × {CD}',
          'Drag is the dynamic pressure × S × C_D; the thrust must match it.',
        ],
        CD: [
          (x) => x.D! / (0.5 * x.rho! * x.V! ** 2 * x.S!),
          '{D} ÷ (½ × {rho} × {V}² × {S})',
          'Undo D = ½ρV²SC_D for C_D.',
        ],
      },
    ),
  ],
  example: levelD(50000, 1, 80, 20, 0.025, 0.05),
  startWith: ['W', 'rho', 'V', 'S', 'CD0', 'K'],
  representation: {
    kind: 'freeBody',
    g: 9.81,
    aircraft: { view: 'side', weight: 'W', lift: 'W', thrust: 'D', drag: 'D' },
  },
});

const aircraftStall = demo({
  id: 'g.he-free-body-aircraft-stall',
  title: 'Free body: the stall speed, at the most lift the wing gives',
  use: 'Use this for “A 10,000 N airplane has S = 16 m² and C_Lmax = 1.6. What is its stall speed at sea level?”',
  assumptions: [
    'Level flight, L = W, at the largest lift coefficient C_Lmax.',
    'Any slower and the wing can’t carry the weight.',
  ],
  variables: [
    newtons('W', 'W', 'Weight'),
    vr('rho', 'ρ', 'Air density', 'kg/m³', 0.01, 2, { step: 0.001 }),
    vr('S', 'S', 'Wing area', 'm²', 0.1, 1000, { step: 0.1 }),
    vr('CLmax', 'C_Lmax', 'Largest lift coefficient', undefined, 0.1, 5, { step: 0.01 }),
    vr('Vs', 'V_stall', 'Stall speed', 'm/s', 0.01, 1e5, { derived: true }),
  ],
  rules: [
    rule(
      'V_stall = √(2W ÷ (ρSC_Lmax))',
      '{Vs} = √(2 × {W} ÷ ({rho} × {S} × {CLmax}))',
      ['Vs', 'W', 'rho', 'S', 'CLmax'],
      (x) => x.Vs! ** 2 * x.rho! * x.S! * x.CLmax! - 2 * x.W!,
      {
        Vs: [
          (x) => Math.sqrt((2 * x.W!) / (x.rho! * x.S! * x.CLmax!)),
          '√(2 × {W} ÷ ({rho} × {S} × {CLmax}))',
          'Set W = ½ρV²SC_Lmax and solve for V.',
        ],
        W: [
          (x) => (x.Vs! ** 2 * x.rho! * x.S! * x.CLmax!) / 2,
          '{Vs}² × {rho} × {S} × {CLmax} ÷ 2',
          'The weight the wing holds at that speed.',
        ],
        S: [
          (x) => (2 * x.W!) / (x.Vs! ** 2 * x.rho! * x.CLmax!),
          '2 × {W} ÷ ({Vs}² × {rho} × {CLmax})',
          'Undo the stall formula for the wing area.',
        ],
        CLmax: [
          (x) => (2 * x.W!) / (x.Vs! ** 2 * x.rho! * x.S!),
          '2 × {W} ÷ ({Vs}² × {rho} × {S})',
          'Undo the stall formula for C_Lmax.',
        ],
        rho: [
          (x) => (2 * x.W!) / (x.Vs! ** 2 * x.S! * x.CLmax!),
          '2 × {W} ÷ ({Vs}² × {S} × {CLmax})',
          'Undo the stall formula for the density.',
        ],
      },
    ),
  ],
  example: {
    W: 10000,
    rho: 1.225,
    S: 16,
    CLmax: 1.6,
    Vs: Math.sqrt(20000 / (1.225 * 16 * 1.6)),
  },
  startWith: ['W', 'rho', 'S', 'CLmax'],
  representation: {
    kind: 'freeBody',
    g: 9.81,
    aircraft: { view: 'side', weight: 'W', lift: 'W' },
  },
});

const aircraftClimb = demo({
  id: 'g.he-free-body-aircraft-climb',
  title: 'Free body: a steady climb from excess thrust',
  use: 'Use this for “With 6000 N of thrust against 3553 N of drag, how fast does a 50,000 N airplane climb at 80 m/s?”',
  assumptions: [
    'A steady climb at angle γ: T = D + W sin γ and L = W cos γ.',
    'The rate of climb is the vertical part of V, V sin γ.',
  ],
  variables: [
    newtons('T', 'T', 'Thrust'),
    newtons('D', 'D', 'Drag'),
    vr('V', 'V', 'Airspeed', 'm/s', 1, 1000, { step: 1 }),
    newtons('W', 'W', 'Weight'),
    vr('RC', 'RC', 'Rate of climb', 'm/s', -1e6, 1e6, { derived: true }),
    vr('gamma', 'γ', 'Climb angle', '°', -90, 90, { derived: true }),
  ],
  rules: [
    rule(
      'RC = V(T − D) ÷ W',
      '{RC} = {V} × ({T} − {D}) ÷ {W}',
      ['RC', 'V', 'T', 'D', 'W'],
      (x) => x.RC! * x.W! - x.V! * (x.T! - x.D!),
      {
        RC: [
          (x) => (x.V! * (x.T! - x.D!)) / x.W!,
          '{V} × ({T} − {D}) ÷ {W}',
          'The excess power (T − D)V lifts the weight at RC.',
        ],
        T: [
          (x) => x.D! + (x.RC! * x.W!) / x.V!,
          '{D} + {RC} × {W} ÷ {V}',
          'Undo RC = V(T − D) ÷ W for T.',
        ],
        D: [
          (x) => x.T! - (x.RC! * x.W!) / x.V!,
          '{T} − {RC} × {W} ÷ {V}',
          'Undo RC = V(T − D) ÷ W for D.',
        ],
        W: [
          (x) => div(x.V! * (x.T! - x.D!), x.RC!),
          '{V} × ({T} − {D}) ÷ {RC}',
          'Undo RC = V(T − D) ÷ W for W.',
        ],
      },
    ),
    rule(
      'sin γ = (T − D) ÷ W',
      'sin({gamma}) = ({T} − {D}) ÷ {W}',
      ['gamma', 'T', 'D', 'W'],
      (x) => sinD(x.gamma!) * x.W! - (x.T! - x.D!),
      {
        gamma: [
          (x) => (Math.abs(x.T! - x.D!) <= x.W! ? asinD((x.T! - x.D!) / x.W!) : undefined),
          'sin⁻¹(({T} − {D}) ÷ {W})',
          'Along the path: T = D + W sin γ.',
        ],
      },
    ),
  ],
  example: {
    T: 6000,
    D: 3553,
    V: 80,
    W: 50000,
    RC: (80 * 2447) / 50000,
    gamma: asinD(2447 / 50000),
  },
  startWith: ['T', 'D', 'V', 'W'],
  representation: {
    kind: 'freeBody',
    g: 9.81,
    aircraft: { view: 'side', weight: 'W', thrust: 'T', drag: 'D', gamma: 'gamma' },
  },
});

/** A level turn at bank φ and speed V: n, R and ω, with g = 9.81 m/s². */
function turnDemo(id: string, phi: number, V: number, title: string, use: string): ModuleDef {
  const n = 1 / cosD(phi);
  const R = (V * V) / (9.81 * Math.sqrt(n * n - 1));
  return demo({
    id,
    title,
    use,
    assumptions: [
      'A level, coordinated turn: L cos φ = W holds the height and L sin φ turns the airplane.',
      'The load factor n = L ÷ W; g = 9.81 m/s².',
    ],
    variables: [
      vr('phi', 'φ', 'Bank angle', '°', 1, 85, { step: 1 }),
      vr('V', 'V', 'Airspeed', 'm/s', 1, 1000, { step: 1 }),
      vr('n', 'n', 'Load factor', undefined, 1, 20, { derived: true }),
      vr('R', 'R', 'Turn radius', 'm', 0.01, 1e9, { derived: true }),
      vr('omega', 'ω', 'Turn rate', 'rad/s', 1e-9, 1e4, { derived: true }),
    ],
    rules: [
      rule('n = 1 ÷ cos φ', '{n} = 1 ÷ cos({phi})', ['n', 'phi'], (x) => x.n! * cosD(x.phi!) - 1, {
        n: [
          (x) => 1 / cosD(x.phi!),
          '1 ÷ cos({phi})',
          'Up and down: L cos φ = W, so L ÷ W = 1 ÷ cos φ.',
        ],
        phi: [
          (x) => Math.acos(1 / x.n!) / RAD,
          'cos⁻¹(1 ÷ {n})',
          'Undo n = 1 ÷ cos φ for the bank.',
        ],
      }),
      rule(
        'R = V² ÷ (g√(n² − 1))',
        '{R} = {V}² ÷ (9.81 × √({n}² − 1))',
        ['R', 'V', 'n'],
        (x) => x.R! * 9.81 * Math.sqrt(Math.max(0, x.n! ** 2 - 1)) - x.V! ** 2,
        {
          R: [
            (x) => div(x.V! ** 2, 9.81 * Math.sqrt(Math.max(0, x.n! ** 2 - 1))),
            '{V}² ÷ (9.81 × √({n}² − 1))',
            'Level: L sin φ = W√(n² − 1) is mV² ÷ R.',
          ],
          V: [
            (x) => Math.sqrt(x.R! * 9.81 * Math.sqrt(Math.max(0, x.n! ** 2 - 1))),
            '√({R} × 9.81 × √({n}² − 1))',
            'Undo the turn radius for V.',
          ],
        },
      ),
      rule('ω = V ÷ R', '{omega} = {V} ÷ {R}', ['omega', 'V', 'R'], (x) => x.omega! * x.R! - x.V!, {
        omega: [(x) => div(x.V!, x.R!), '{V} ÷ {R}', 'The speed round a circle ÷ its radius.'],
      }),
    ],
    example: { phi, V, n, R, omega: V / R },
    startWith: ['phi', 'V'],
    representation: {
      kind: 'freeBody',
      g: 9.81,
      aircraft: { view: 'front', phi: 'phi', factor: 'n', speed: 'V', radius: 'R', rate: 'omega' },
    },
  });
}

const aircraftTurn = turnDemo(
  'g.he-free-body-aircraft-turn',
  60,
  80,
  'Free body: an airplane in a level turn, banked 60°',
  'Use this for “At 80 m/s an airplane banks 60° in a level turn. Find the load factor, the turn radius and the turn rate.”',
);

const aircraftSteep = turnDemo(
  'g.he-free-body-aircraft-steep-turn',
  80,
  150,
  'Free body: a steep 80° turn, n near 6',
  'Use this for “How many g does a pilot pull in an 80° level turn at 150 m/s, and how tight is it?”',
);

const coordPhi = atanD((60 * 3 * RAD) / 9.81);
const aircraftCoordinated = demo({
  id: 'g.he-free-body-aircraft-coordinated',
  title: 'Free body: the bank for a standard-rate turn',
  use: 'Use this for “What bank gives a standard-rate turn (3°/s) at 60 m/s?”',
  assumptions: [
    'A level, coordinated turn: tan φ = Vω ÷ g, with ω in rad/s (°/s × π ÷ 180).',
    'g = 9.81 m/s²; n = 1 ÷ cos φ.',
  ],
  variables: [
    vr('V', 'V', 'Airspeed', 'm/s', 1, 1000, { step: 1 }),
    vr('omega', 'ω', 'Turn rate', '°/s', 0.01, 60, { step: 0.1 }),
    vr('phi', 'φ', 'Bank angle', '°', 0, 89.9, { derived: true }),
    vr('n', 'n', 'Load factor', undefined, 1, 1000, { derived: true }),
  ],
  rules: [
    rule(
      'tan φ = Vω ÷ g',
      'tan({phi}) = {V} × {omega} × π ÷ 180 ÷ 9.81',
      ['phi', 'V', 'omega'],
      (x) => tanD(x.phi!) * 9.81 - x.V! * x.omega! * RAD,
      {
        phi: [
          (x) => atanD((x.V! * x.omega! * RAD) / 9.81),
          'tan⁻¹({V} × {omega} × π ÷ 180 ÷ 9.81)',
          'Divide L sin φ = mVω by L cos φ = mg.',
        ],
        omega: [
          (x) => (9.81 * tanD(x.phi!)) / x.V! / RAD,
          '9.81 × tan({phi}) ÷ {V} × 180 ÷ π',
          'Undo tan φ = Vω ÷ g for ω, in °/s.',
        ],
        V: [
          (x) => div(9.81 * tanD(x.phi!), x.omega! * RAD),
          '9.81 × tan({phi}) ÷ ({omega} × π ÷ 180)',
          'Undo tan φ = Vω ÷ g for V.',
        ],
      },
    ),
    rule('n = 1 ÷ cos φ', '{n} = 1 ÷ cos({phi})', ['n', 'phi'], (x) => x.n! * cosD(x.phi!) - 1, {
      n: [(x) => 1 / cosD(x.phi!), '1 ÷ cos({phi})', 'Up and down: L cos φ = W, so n = 1 ÷ cos φ.'],
      phi: [(x) => Math.acos(1 / x.n!) / RAD, 'cos⁻¹(1 ÷ {n})', 'Undo n = 1 ÷ cos φ for the bank.'],
    }),
  ],
  example: { V: 60, omega: 3, phi: coordPhi, n: 1 / cosD(coordPhi) },
  startWith: ['V', 'omega'],
  representation: {
    kind: 'freeBody',
    g: 9.81,
    aircraft: {
      view: 'front',
      phi: 'phi',
      factor: 'n',
      speed: 'V',
      rate: 'omega',
      rateDegrees: true,
    },
  },
});

/** Static stability from the tail volume: h_n = h_ac + V_H × effectiveness, SM = h_n − h. */
function stabilityDemo(id: string, h: number, title: string, use: string): ModuleDef {
  const ex = { hac: 0.25, lt: 4, St: 3.2, cbar: 1.6, S: 16, eff: 0.33 };
  const VH = (ex.lt * ex.St) / (ex.cbar * ex.S);
  const hn = ex.hac + VH * ex.eff;
  return demo({
    id,
    title,
    use,
    assumptions: [
      'Stick-fixed; the tail’s lift slope and the downwash are taken as constants.',
      'Positions are fractions of the mean chord c̄ from its leading edge.',
      'Stable needs the CG ahead of the neutral point: SM > 0.',
    ],
    variables: [
      vr('hac', 'h_ac', 'Wing aerodynamic center', undefined, 0, 1, { step: 0.01 }),
      vr('lt', 'l_t', 'Tail arm', 'm', 0.1, 100, { step: 0.1 }),
      vr('St', 'S_t', 'Tail area', 'm²', 0.01, 500, { step: 0.1 }),
      vr('cbar', 'c̄', 'Mean chord', 'm', 0.1, 20, { step: 0.1 }),
      vr('S', 'S', 'Wing area', 'm²', 0.1, 1000, { step: 0.1 }),
      vr('eff', 'η_t', 'Tail effectiveness, (a_t ÷ a)(1 − dε/dα)', undefined, 0.01, 2, {
        step: 0.01,
      }),
      vr('VH', 'V_H', 'Tail volume', undefined, 0, 1e5, { derived: true }),
      vr('hn', 'h_n', 'Neutral point', undefined, -1e5, 1e5, { derived: true }),
      vr('h', 'h', 'Center of gravity', undefined, 0, 1, { step: 0.01 }),
      vr('SM', 'SM', 'Static margin', undefined, -1e5, 1e5, { derived: true }),
    ],
    rules: [
      rule(
        'V_H = l_tS_t ÷ (c̄S)',
        '{VH} = {lt} × {St} ÷ ({cbar} × {S})',
        ['VH', 'lt', 'St', 'cbar', 'S'],
        (x) => x.VH! * x.cbar! * x.S! - x.lt! * x.St!,
        {
          VH: [
            (x) => (x.lt! * x.St!) / (x.cbar! * x.S!),
            '{lt} × {St} ÷ ({cbar} × {S})',
            'The tail’s size and arm against the wing’s.',
          ],
          St: [
            (x) => (x.VH! * x.cbar! * x.S!) / x.lt!,
            '{VH} × {cbar} × {S} ÷ {lt}',
            'Undo V_H for the tail area.',
          ],
          lt: [
            (x) => (x.VH! * x.cbar! * x.S!) / x.St!,
            '{VH} × {cbar} × {S} ÷ {St}',
            'Undo V_H for the tail arm.',
          ],
        },
      ),
      rule(
        'h_n = h_ac + V_H × η_t',
        '{hn} = {hac} + {VH} × {eff}',
        ['hn', 'hac', 'VH', 'eff'],
        (x) => x.hn! - x.hac! - x.VH! * x.eff!,
        {
          hn: [
            (x) => x.hac! + x.VH! * x.eff!,
            '{hac} + {VH} × {eff}',
            'The tail moves the neutral point aft of the wing’s aerodynamic center.',
          ],
          hac: [
            (x) => x.hn! - x.VH! * x.eff!,
            '{hn} − {VH} × {eff}',
            'Undo h_n for the aerodynamic center.',
          ],
          eff: [
            (x) => div(x.hn! - x.hac!, x.VH!),
            '({hn} − {hac}) ÷ {VH}',
            'Undo h_n for the tail effectiveness.',
          ],
          VH: [
            (x) => div(x.hn! - x.hac!, x.eff!),
            '({hn} − {hac}) ÷ {eff}',
            'Undo h_n for the tail volume.',
          ],
        },
      ),
      rule('SM = h_n − h', '{SM} = {hn} − {h}', ['SM', 'hn', 'h'], (x) => x.SM! - x.hn! + x.h!, {
        SM: [
          (x) => x.hn! - x.h!,
          '{hn} − {h}',
          'How far the CG sits ahead of the neutral point, in chords.',
        ],
        h: [(x) => x.hn! - x.SM!, '{hn} − {SM}', 'The CG for a chosen margin.'],
        hn: [(x) => x.h! + x.SM!, '{h} + {SM}', 'Undo SM = h_n − h for the neutral point.'],
      }),
    ],
    example: { ...ex, VH, hn, h, SM: hn - h },
    startWith: ['hac', 'lt', 'St', 'cbar', 'S', 'eff', 'h'],
    representation: {
      kind: 'freeBody',
      aircraft: { view: 'stability', hac: 'hac', h: 'h', hn: 'hn', margin: 'SM' },
    },
  });
}

const aircraftStability = stabilityDemo(
  'g.he-free-body-aircraft-stability',
  0.3,
  'Free body: the neutral point and the static margin',
  'Use this for “With h_ac = 0.25, l_t = 4 m, S_t = 3.2 m², c̄ = 1.6 m and S = 16 m², where is the neutral point, and what is the margin with the CG at 0.30c̄?”',
);

const aircraftUnstable = stabilityDemo(
  'g.he-free-body-aircraft-unstable',
  0.45,
  'Free body: a CG too far aft',
  'Use this for “Loaded with the CG at 0.45c̄, is the same airplane still stable?”',
);

const elevatorOf = (Cm0: number, Cma: number, al: number, Cmd: number) => -(Cm0 + Cma * al) / Cmd;

const aircraftElevator = demo({
  id: 'g.he-free-body-aircraft-elevator',
  title: 'Free body: the elevator angle to trim',
  use: 'Use this for “C_m0 = 0.05, C_mα = −0.012 per degree and C_mδe = −0.02 per degree: what elevator trims the airplane at α = 6°?”',
  assumptions: [
    'Linear pitching-moment coefficients, per degree.',
    'Trailing edge up is negative δe; a forward CG needs more up elevator.',
  ],
  variables: [
    vr('Cm0', 'C_m0', 'Moment coefficient at zero α', undefined, -1, 1, { step: 0.001 }),
    vr('Cma', 'C_mα', 'Moment slope per degree of α', undefined, -1, 1, { step: 0.001 }),
    vr('alpha', 'α', 'Angle of attack', '°', -20, 30, { step: 0.5 }),
    vr('Cmd', 'C_mδe', 'Moment per degree of elevator', undefined, -1, -0.0001, { step: 0.001 }),
    vr('de', 'δe', 'Elevator angle', '°', -1e5, 1e5, { derived: true }),
  ],
  rules: [
    rule(
      'C_m0 + C_mα α + C_mδe δe = 0',
      '{Cm0} + {Cma} × {alpha} + {Cmd} × {de} = 0',
      ['de', 'Cm0', 'Cma', 'alpha', 'Cmd'],
      (x) => x.Cm0! + x.Cma! * x.alpha! + x.Cmd! * x.de!,
      {
        de: [
          (x) => div(-(x.Cm0! + x.Cma! * x.alpha!), x.Cmd!),
          '−({Cm0} + {Cma} × {alpha}) ÷ {Cmd}',
          'Trimmed, the pitching moments add to zero.',
        ],
        alpha: [
          (x) => div(-(x.Cm0! + x.Cmd! * x.de!), x.Cma!),
          '−({Cm0} + {Cmd} × {de}) ÷ {Cma}',
          'Undo the trim balance for the angle of attack.',
        ],
        Cm0: [
          (x) => -(x.Cma! * x.alpha! + x.Cmd! * x.de!),
          '−({Cma} × {alpha} + {Cmd} × {de})',
          'Undo the trim balance for C_m0.',
        ],
      },
    ),
  ],
  example: {
    Cm0: 0.05,
    Cma: -0.012,
    alpha: 6,
    Cmd: -0.02,
    de: elevatorOf(0.05, -0.012, 6, -0.02),
  },
  startWith: ['Cm0', 'Cma', 'Cmd', 'alpha'],
  representation: {
    kind: 'freeBody',
    aircraft: { view: 'side', alpha: 'alpha', elevator: 'de' },
  },
});

export const HE2F_GALLERY_MODULES: ModuleDef[] = [
  pulleyTable,
  pulleyTableEng,
  atwood,
  atwoodDisk,
  atwoodFlywheel,
  ladderMain,
  ladderLow,
  tipMain,
  tipLow,
  drumMain,
  drumCapstan,
  banked,
  bankedFriction,
  aircraftLevel,
  aircraftStall,
  aircraftClimb,
  aircraftTurn,
  aircraftSteep,
  aircraftCoordinated,
  aircraftStability,
  aircraftUnstable,
  aircraftElevator,
];

export const HE2F_GALLERY_LAYOUTS: LayoutDef[] = [];
