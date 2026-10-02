/**
 * College gallery demos, round 4, group B (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC96: `vectorDiagram` `project` (linear-algebra#4 ~projection, ~gram-schmidt).
 * HC171: `vectorDiagram` `forces` (statics#0, ~components).
 * HC108: `vectorDiagram` `cone` (quantum#2).
 * HC100: `vectorDiagram` `masses`, `centerOfMass` (university-1#3~center-of-mass).
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

type Solver = (v: Values) => number | number[] | undefined;
type Rule = { relation: Relation; steps: Record<string, StepText> };

/** A finite value, or nothing. */
const fin = (x: number) => (Number.isFinite(x) ? x : undefined);
const div = (a: number, b: number) => (b === 0 ? undefined : fin(a / b));

/** A value typed or worked out: min to max. */
const num = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...(unit ? { unit } : {}), min, max, ...more });

/** A value the page works out and never starts from. */
const got = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
) => num(id, symbol, name, unit, min, max, { derived: true, ...more });

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

/** A demo from its rules. */
function page(d: Omit<ModuleDef, 'relations' | 'steps'> & { rules: Rule[] }): ModuleDef {
  const { rules, ...rest } = d;
  return {
    workedFigures: 4,
    ...rest,
    relations: rules.map((r) => r.relation),
    steps: Object.fromEntries(rules.map((r) => [r.relation.id, r.steps])),
  };
}

/** x = a × b, solved for x. */
const times = (id: string, x: string, a: string, b: string, how: string) =>
  rule(id, `{${x}} = {${a}} × {${b}}`, [x, a, b], (v) => v[x]! - v[a]! * v[b]!, {
    [x]: [(v) => v[a]! * v[b]!, `{${a}} × {${b}}`, how],
  });

/** x = a − b, solved any way. */
const minus = (id: string, x: string, a: string, b: string, how: string) =>
  rule(id, `{${x}} = {${a}} − {${b}}`, [x, a, b], (v) => v[x]! - v[a]! + v[b]!, {
    [x]: [(v) => v[a]! - v[b]!, `{${a}} − {${b}}`, how],
    [a]: [(v) => v[x]! + v[b]!, `{${x}} + {${b}}`, 'Add the part taken away back on.'],
    [b]: [(v) => v[a]! - v[x]!, `{${a}} − {${x}}`, 'Take the difference from the whole.'],
  });

/** x = a ÷ b, solved any way. */
const over = (id: string, x: string, a: string, b: string, how: string) =>
  rule(id, `{${x}} = {${a}} ÷ {${b}}`, [x, a, b], (v) => v[x]! * v[b]! - v[a]!, {
    [x]: [(v) => div(v[a]!, v[b]!), `{${a}} ÷ {${b}}`, how],
    [a]: [(v) => v[x]! * v[b]!, `{${x}} × {${b}}`, 'Multiply the quotient back by the divisor.'],
    [b]: [(v) => div(v[a]!, v[x]!), `{${a}} ÷ {${x}}`, 'Divide the dividend by the quotient.'],
  });

// ── HC96: the projection of u onto v (linear-algebra#4 ~projection, ~gram-schmidt) ──

/** linear-algebra#4~projection: proj_v u = (u·v ÷ v·v)v and the part square to v, in the plane. */
function projection(id: string, title: string, use: string, ex: Values): ModuleDef {
  const dot = ex.ux! * ex.vx! + ex.uy! * ex.vy!;
  const vv = ex.vx! ** 2 + ex.vy! ** 2;
  const k = dot / vv;
  const [px, py] = [k * ex.vx!, k * ex.vy!];
  return page({
    id,
    title,
    use,
    assumptions: [
      'proj_v u is the multiple of v closest to u: what is left, u − proj_v u, is square to v.',
      'The factor u·v ÷ v·v is negative when the angle between u and v is obtuse.',
      'v is not the zero vector (v·v > 0).',
    ],
    variables: [
      num('ux', 'u_x', 'u, x-component', undefined, -1000, 1000, { step: 1 }),
      num('uy', 'u_y', 'u, y-component', undefined, -1000, 1000, { step: 1 }),
      num('vx', 'v_x', 'v, x-component', undefined, -1000, 1000, { step: 1 }),
      num('vy', 'v_y', 'v, y-component', undefined, -1000, 1000, { step: 1 }),
      got('dot', 'u·v', 'Dot product u·v', undefined, -1e7, 1e7),
      got('vv', 'v·v', 'Dot product v·v', undefined, 1e-9, 1e7),
      got('k', 'k', 'Factor u·v ÷ v·v', undefined, -1e7, 1e7),
      got('px', 'p_x', 'Projection, x-component', undefined, -1e7, 1e7),
      got('py', 'p_y', 'Projection, y-component', undefined, -1e7, 1e7),
      got('qx', 'q_x', 'Part square to v, x-component', undefined, -1e7, 1e7),
      got('qy', 'q_y', 'Part square to v, y-component', undefined, -1e7, 1e7),
    ],
    rules: [
      rule(
        'u·v = uₓvₓ + u_yv_y',
        '{dot} = {ux} × {vx} + {uy} × {vy}',
        ['dot', 'ux', 'vx', 'uy', 'vy'],
        (v) => v.dot! - v.ux! * v.vx! - v.uy! * v.vy!,
        {
          dot: [
            (v) => v.ux! * v.vx! + v.uy! * v.vy!,
            '{ux} × {vx} + {uy} × {vy}',
            'Multiply matching components and add.',
          ],
        },
      ),
      rule(
        'v·v = vₓ² + v_y²',
        '{vv} = {vx}² + {vy}²',
        ['vv', 'vx', 'vy'],
        (v) => v.vv! - v.vx! ** 2 - v.vy! ** 2,
        {
          vv: [(v) => v.vx! ** 2 + v.vy! ** 2, '{vx}² + {vy}²', 'v·v is the square of v’s length.'],
        },
      ),
      over('k = u·v ÷ v·v', 'k', 'dot', 'vv', 'How many v’s long the projection is: u·v over v·v.'),
      times('pₓ = kvₓ', 'px', 'k', 'vx', 'The projection is k times v: scale v’s x-component.'),
      times('p_y = kv_y', 'py', 'k', 'vy', 'The projection is k times v: scale v’s y-component.'),
      minus(
        'qₓ = uₓ − pₓ',
        'qx',
        'ux',
        'px',
        'What is left of u once the projection is taken off.',
      ),
      minus(
        'q_y = u_y − p_y',
        'qy',
        'uy',
        'py',
        'What is left of u once the projection is taken off.',
      ),
    ],
    example: { ...ex, dot, vv, k, px, py, qx: ex.ux! - px, qy: ex.uy! - py },
    startWith: ['ux', 'uy', 'vx', 'vy'],
    representation: {
      kind: 'vectorDiagram',
      vectors: [
        { name: 'u', x: 'ux', y: 'uy' },
        { name: 'v', x: 'vx', y: 'vy' },
      ],
      project: { dot: 'dot', k: 'k', proj: { x: 'px', y: 'py' }, perp: { x: 'qx', y: 'qy' } },
    },
  });
}

const projectMain = projection(
  'g.he-vector-diagram-project',
  'The projection of u onto v, and the part square to v',
  'Use this for “Project u = ⟨3, 1⟩ onto v = ⟨1, 1⟩ and find the part of u square to v.”',
  { ux: 3, uy: 1, vx: 1, vy: 1 },
);

const projectObtuse = projection(
  'g.he-vector-diagram-project-obtuse',
  'Projecting at an obtuse angle: the projection points against v',
  'Use this for “Project u = ⟨−2, 3⟩ onto v = ⟨4, 1⟩. Why does the projection point away from v?”',
  { ux: -2, uy: 3, vx: 4, vy: 1 },
);

/** linear-algebra#4~gram-schmidt: u₂ = v₂ − proj_(u₁) v₂ in space. */
function gramSchmidt(id: string, title: string, use: string, ex: Values): ModuleDef {
  const dot = ex.ax! * ex.bx! + ex.ay! * ex.by! + ex.az! * ex.bz!;
  const bb = ex.bx! ** 2 + ex.by! ** 2 + ex.bz! ** 2;
  const k = dot / bb;
  const q = [ex.ax! - k * ex.bx!, ex.ay! - k * ex.by!, ex.az! - k * ex.bz!];
  const comp = (axis: 'x' | 'y' | 'z') =>
    rule(
      `u₂${axis === 'x' ? 'ₓ' : `_${axis}`} = v₂ − ku₁`,
      `{q${axis}} = {a${axis}} − {k} × {b${axis}}`,
      [`q${axis}`, `a${axis}`, 'k', `b${axis}`],
      (v) => v[`q${axis}`]! - v[`a${axis}`]! + v.k! * v[`b${axis}`]!,
      {
        [`q${axis}`]: [
          (v) => v[`a${axis}`]! - v.k! * v[`b${axis}`]!,
          `{a${axis}} − {k} × {b${axis}}`,
          'Take the projection onto u₁ off v₂, one component at a time.',
        ],
        [`a${axis}`]: [
          (v) => v[`q${axis}`]! + v.k! * v[`b${axis}`]!,
          `{q${axis}} + {k} × {b${axis}}`,
          'Add the projection back onto u₂ to rebuild v₂.',
        ],
      },
    );
  return page({
    id,
    title,
    use,
    assumptions: [
      'Gram–Schmidt keeps u₁ = v₁ and takes from v₂ its projection onto u₁: u₂ = v₂ − (v₂·u₁ ÷ u₁·u₁)u₁.',
      'u₂ is square to u₁ (u₂·u₁ = 0), and u₁, u₂ span the same plane as v₁, v₂.',
      'v₁ and v₂ are not parallel, so u₂ is not the zero vector.',
    ],
    variables: [
      num('ax', 'v₂ₓ', 'v₂, x-component', undefined, -1000, 1000, { step: 1 }),
      num('ay', 'v₂_y', 'v₂, y-component', undefined, -1000, 1000, { step: 1 }),
      num('az', 'v₂_z', 'v₂, z-component', undefined, -1000, 1000, { step: 1 }),
      num('bx', 'u₁ₓ', 'u₁, x-component', undefined, -1000, 1000, { step: 1 }),
      num('by', 'u₁_y', 'u₁, y-component', undefined, -1000, 1000, { step: 1 }),
      num('bz', 'u₁_z', 'u₁, z-component', undefined, -1000, 1000, { step: 1 }),
      got('dot', 'v₂·u₁', 'Dot product v₂·u₁', undefined, -1e7, 1e7),
      got('bb', 'u₁·u₁', 'Dot product u₁·u₁', undefined, 1e-9, 1e7),
      got('k', 'k', 'Factor v₂·u₁ ÷ u₁·u₁', undefined, -1e7, 1e7),
      got('qx', 'u₂ₓ', 'u₂, x-component', undefined, -1e7, 1e7),
      got('qy', 'u₂_y', 'u₂, y-component', undefined, -1e7, 1e7),
      got('qz', 'u₂_z', 'u₂, z-component', undefined, -1e7, 1e7),
      got('n1', '|u₁|', 'Length of u₁', undefined, 0, 1e7),
      got('n2', '|u₂|', 'Length of u₂', undefined, 0, 1e7),
    ],
    rules: [
      rule(
        'v₂·u₁ = Σ v₂ᵢu₁ᵢ',
        '{dot} = {ax} × {bx} + {ay} × {by} + {az} × {bz}',
        ['dot', 'ax', 'bx', 'ay', 'by', 'az', 'bz'],
        (v) => v.dot! - v.ax! * v.bx! - v.ay! * v.by! - v.az! * v.bz!,
        {
          dot: [
            (v) => v.ax! * v.bx! + v.ay! * v.by! + v.az! * v.bz!,
            '{ax} × {bx} + {ay} × {by} + {az} × {bz}',
            'Multiply matching components and add.',
          ],
        },
      ),
      rule(
        'u₁·u₁ = u₁ₓ² + u₁_y² + u₁_z²',
        '{bb} = {bx}² + {by}² + {bz}²',
        ['bb', 'bx', 'by', 'bz'],
        (v) => v.bb! - v.bx! ** 2 - v.by! ** 2 - v.bz! ** 2,
        {
          bb: [
            (v) => v.bx! ** 2 + v.by! ** 2 + v.bz! ** 2,
            '{bx}² + {by}² + {bz}²',
            'u₁·u₁ is the square of u₁’s length.',
          ],
        },
      ),
      over('k = v₂·u₁ ÷ u₁·u₁', 'k', 'dot', 'bb', 'How many u₁’s long the projection of v₂ is.'),
      comp('x'),
      comp('y'),
      comp('z'),
      rule('|u₁| = √(u₁·u₁)', '{n1} = √{bb}', ['n1', 'bb'], (v) => v.n1! ** 2 - v.bb!, {
        n1: [(v) => Math.sqrt(v.bb!), '√{bb}', 'The length is the square root of u₁·u₁.'],
        bb: [(v) => v.n1! ** 2, '{n1}²', 'Square the length to get u₁·u₁.'],
      }),
      rule(
        '|u₂| = √(u₂ₓ² + u₂_y² + u₂_z²)',
        '{n2} = √({qx}² + {qy}² + {qz}²)',
        ['n2', 'qx', 'qy', 'qz'],
        (v) => v.n2! ** 2 - v.qx! ** 2 - v.qy! ** 2 - v.qz! ** 2,
        {
          n2: [
            (v) => Math.hypot(v.qx!, v.qy!, v.qz!),
            '√({qx}² + {qy}² + {qz}²)',
            'Pythagoras in three dimensions gives u₂’s length.',
          ],
        },
      ),
    ],
    example: {
      ...ex,
      dot,
      bb,
      k,
      qx: q[0]!,
      qy: q[1]!,
      qz: q[2]!,
      n1: Math.sqrt(bb),
      n2: Math.hypot(q[0]!, q[1]!, q[2]!),
    },
    startWith: ['ax', 'ay', 'az', 'bx', 'by', 'bz'],
    representation: {
      kind: 'vectorDiagram',
      vectors: [
        { name: 'v₂', x: 'ax', y: 'ay', z: 'az' },
        { name: 'u₁', x: 'bx', y: 'by', z: 'bz' },
      ],
      space: {},
      project: { k: 'k', perp: { x: 'qx', y: 'qy', z: 'qz' }, perpName: 'u₂' },
      fixed: true,
    },
  });
}

const gramMain = gramSchmidt(
  'g.he-vector-diagram-project-gram-schmidt',
  'Gram–Schmidt: u₂ = v₂ − projᵤ₁ v₂ in space',
  'Use this for “Make ⟨1, 0, 1⟩ square to u₁ = ⟨1, 1, 0⟩ by Gram–Schmidt. Check u₂·u₁ = 0.”',
  { ax: 1, ay: 0, az: 1, bx: 1, by: 1, bz: 0 },
);

const gramSteep = gramSchmidt(
  'g.he-vector-diagram-project-gram-schmidt-near',
  'Gram–Schmidt on nearly parallel vectors: a short u₂',
  'Use this for “Run Gram–Schmidt on u₁ = ⟨2, 1, 2⟩ and v₂ = ⟨2, 2, 3⟩. How long is u₂?”',
  { ax: 2, ay: 2, az: 3, bx: 2, by: 1, bz: 2 },
);

// ── HC100: point masses and their balance point (university-1#3~center-of-mass) ──

const SUBS = ['₁', '₂', '₃', '₄'];

/** university-1#3~center-of-mass: x_cm = Σmx ÷ Σm for up to three masses (and y on a plane). */
function centerOfMass(
  id: string,
  title: string,
  use: string,
  list: { m: number; x: number; y?: number }[],
): ModuleDef {
  const plane = list.some((q) => q.y !== undefined);
  const n = list.length;
  const idx = list.map((_, i) => i + 1);
  const M = list.reduce((s, q) => s + q.m, 0);
  const cx = list.reduce((s, q) => s + q.m * q.x, 0) / M;
  const cy = list.reduce((s, q) => s + q.m * (q.y ?? 0), 0) / M;
  const ex: Values = { M, xcm: cx, ...(plane ? { ycm: cy } : {}) };
  list.forEach((q, i) => {
    ex[`m${i + 1}`] = q.m;
    ex[`x${i + 1}`] = q.x;
    if (plane) ex[`y${i + 1}`] = q.y!;
  });
  const weighted = (k: 'x' | 'y', target: string) =>
    rule(
      `${k}_cm = Σm${k} ÷ M`,
      `{${target}} = (${idx.map((i) => `{m${i}} × {${k}${i}}`).join(' + ')}) ÷ {M}`,
      [target, ...idx.flatMap((i) => [`m${i}`, `${k}${i}`]), 'M'],
      (v) => v[target]! * v.M! - idx.reduce((s, i) => s + v[`m${i}`]! * v[`${k}${i}`]!, 0),
      {
        [target]: [
          (v) =>
            div(
              idx.reduce((s, i) => s + v[`m${i}`]! * v[`${k}${i}`]!, 0),
              v.M!,
            ),
          `(${idx.map((i) => `{m${i}} × {${k}${i}}`).join(' + ')}) ÷ {M}`,
          `Weight each place by its mass, add, and divide by the total mass.`,
        ],
        [`${k}${n}`]: [
          (v) =>
            div(
              v[target]! * v.M! -
                idx.slice(0, -1).reduce((s, i) => s + v[`m${i}`]! * v[`${k}${i}`]!, 0),
              v[`m${n}`]!,
            ),
          `({${target}} × {M} − ${idx
            .slice(0, -1)
            .map((i) => `{m${i}} × {${k}${i}}`)
            .join(' − ')}) ÷ {m${n}}`,
          `The last mass supplies what the others leave of M times the balance point.`,
        ],
      },
    );
  return page({
    id,
    title,
    use,
    assumptions: [
      'Point masses: each mass sits at one place, and the rod or plate joining them weighs nothing.',
      'The balance point is the mass-weighted average place: Σm(x − x_cm) = 0.',
      'Places are measured from one origin, with + to the right (and up on a plane).',
    ],
    variables: [
      ...idx.flatMap((i) => [
        num(`m${i}`, `m${SUBS[i - 1]}`, `Mass ${i}`, 'kg', 0.001, 1e6, { step: 0.1 }),
        num(`x${i}`, `x${SUBS[i - 1]}`, `Place of mass ${i}${plane ? ', x' : ''}`, 'm', -1e4, 1e4, {
          step: 0.1,
        }),
        ...(plane
          ? [
              num(`y${i}`, `y${SUBS[i - 1]}`, `Place of mass ${i}, y`, 'm', -1e4, 1e4, {
                step: 0.1,
              }),
            ]
          : []),
      ]),
      num('M', 'M', 'Total mass', 'kg', 0.001, 1e7),
      num('xcm', 'x_cm', 'Balance point, x', 'm', -1e4, 1e4),
      ...(plane ? [num('ycm', 'y_cm', 'Balance point, y', 'm', -1e4, 1e4)] : []),
    ],
    rules: [
      rule(
        'M = Σm',
        `{M} = ${idx.map((i) => `{m${i}}`).join(' + ')}`,
        ['M', ...idx.map((i) => `m${i}`)],
        (v) => v.M! - idx.reduce((s, i) => s + v[`m${i}`]!, 0),
        Object.fromEntries([
          [
            'M',
            [
              (v: Values) => idx.reduce((s, i) => s + v[`m${i}`]!, 0),
              idx.map((i) => `{m${i}}`).join(' + '),
              'The total mass is the masses added.',
            ],
          ],
          ...idx.map((i) => [
            `m${i}`,
            [
              (v: Values) => v.M! - idx.filter((j) => j !== i).reduce((s, j) => s + v[`m${j}`]!, 0),
              `{M} − ${idx
                .filter((j) => j !== i)
                .map((j) => `{m${j}}`)
                .join(' − ')}`,
              'Take the other masses from the total.',
            ],
          ]),
        ]) as Record<string, [Solver, string, string]>,
      ),
      weighted('x', 'xcm'),
      ...(plane ? [weighted('y', 'ycm')] : []),
    ],
    example: ex,
    startWith: idx.flatMap((i) => [`m${i}`, `x${i}`, ...(plane ? [`y${i}`] : [])]),
    representation: {
      kind: 'vectorDiagram',
      vectors: [{ name: 'x_cm' }],
      masses: idx.map((i) => ({ m: `m${i}`, x: `x${i}`, ...(plane ? { y: `y${i}` } : {}) })),
      centerOfMass: { x: 'xcm', ...(plane ? { y: 'ycm' } : {}), total: 'M' },
    },
  });
}

const massesLine = centerOfMass(
  'g.he-vector-diagram-masses',
  'Three masses on a rod and the point where it balances',
  'Use this for “2 kg at 0.5 m, 3 kg at 1.5 m and 5 kg at 2.5 m sit on a light rod. Where does it balance?”',
  [
    { m: 2, x: 0.5 },
    { m: 3, x: 1.5 },
    { m: 5, x: 2.5 },
  ],
);

const massesLopsided = centerOfMass(
  'g.he-vector-diagram-masses-lopsided',
  'One heavy mass pulls the balance point toward it',
  'Use this for “0.5 kg at −3 m, 1 kg at 1 m and 12 kg at 4 m. Find the center of mass.”',
  [
    { m: 0.5, x: -3 },
    { m: 1, x: 1 },
    { m: 12, x: 4 },
  ],
);

const massesPlane = centerOfMass(
  'g.he-vector-diagram-masses-plane',
  'Three masses on a plane and their center of mass',
  'Use this for “1 kg at (1, 1) m, 2 kg at (4, 1) m and 1 kg at (1, 5) m. Find the center of mass.”',
  [
    { m: 1, x: 1, y: 1 },
    { m: 2, x: 4, y: 1 },
    { m: 1, x: 1, y: 5 },
  ],
);

// ── HC171: forces from a point, their polygon or resultant (statics#0, ~components) ──

const DEG = Math.PI / 180;
const cosd = (x: number) => Math.cos(x * DEG);
const sind = (x: number) => Math.sin(x * DEG);

/** statics#0: a weight hung from two cables at θ₁ and θ₂ above level. */
function twoCables(id: string, title: string, use: string, ex: Values): ModuleDef {
  const sum = ex.t1! + ex.t2!;
  const T1 = (ex.W! * cosd(ex.t2!)) / sind(sum);
  const T2 = (ex.W! * cosd(ex.t1!)) / sind(sum);
  const tension = (T: string, other: string, side: string) =>
    rule(
      `${T === 'T1' ? 'T₁' : 'T₂'} = W cos θ ÷ sin(θ₁ + θ₂)`,
      `{${T}} = {W} × cos({${other}}°) ÷ sin({sum}°)`,
      [T, 'W', other, 'sum'],
      (v) => v[T]! * sind(v.sum!) - v.W! * cosd(v[other]!),
      {
        [T]: [
          (v) => div(v.W! * cosd(v[other]!), sind(v.sum!)),
          `{W} × cos({${other}}°) ÷ sin({sum}°)`,
          `Solve ΣFₓ = 0 and ΣF_y = 0 together: the ${side} cable carries W cos of the other cable’s angle over sin of the sum.`,
        ],
        W: [
          (v) => div(v[T]! * sind(v.sum!), cosd(v[other]!)),
          `{${T}} × sin({sum}°) ÷ cos({${other}}°)`,
          'Turn the tension rule round for the weight it holds.',
        ],
      },
    );
  return page({
    id,
    title,
    use,
    assumptions: [
      'The knot is a particle: the forces on it balance, ΣFₓ = 0 and ΣF_y = 0.',
      'Cables only pull, along their length; + x is right and + y is up.',
      'Each angle is measured above the horizontal, T₁ to the left and T₂ to the right.',
    ],
    variables: [
      num('W', 'W', 'Weight', 'N', 0.01, 1e6, { step: 1 }),
      num('t1', 'θ₁', 'Left cable angle above level', '°', 0.1, 89.9, { step: 1 }),
      num('t2', 'θ₂', 'Right cable angle above level', '°', 0.1, 89.9, { step: 1 }),
      got('sum', 'θ₁ + θ₂', 'Sum of the angles', '°', 0.2, 179.8),
      num('T1', 'T₁', 'Left cable tension', 'N', 0, 1e9),
      num('T2', 'T₂', 'Right cable tension', 'N', 0, 1e9),
    ],
    rules: [
      rule('θ₁ + θ₂', '{sum} = {t1} + {t2}', ['sum', 't1', 't2'], (v) => v.sum! - v.t1! - v.t2!, {
        sum: [(v) => v.t1! + v.t2!, '{t1} + {t2}', 'Add the two cable angles.'],
        t1: [(v) => v.sum! - v.t2!, '{sum} − {t2}', 'Take the right angle from the sum.'],
        t2: [(v) => v.sum! - v.t1!, '{sum} − {t1}', 'Take the left angle from the sum.'],
      }),
      tension('T1', 't2', 'left'),
      tension('T2', 't1', 'right'),
    ],
    example: { ...ex, sum, T1, T2 },
    startWith: ['W', 't1', 't2'],
    representation: {
      kind: 'vectorDiagram',
      vectors: [{ name: 'ΣF' }],
      unit: 'N',
      forces: {
        list: [
          { name: 'T₁', magnitude: 'T1', level: 't1', left: true },
          { name: 'T₂', magnitude: 'T2', level: 't2' },
          { name: 'W', magnitude: 'W', direction: 270 },
        ],
        equilibrium: true,
      },
      fixed: true,
    },
  });
}

const forcesCables = twoCables(
  'g.he-vector-diagram-forces',
  'A sign on two cables: the force triangle closes',
  'Use this for “A 500 N sign hangs from two cables at 30° and 60°. Find each tension.”',
  { W: 500, t1: 30, t2: 60 },
);

const forcesShallow = twoCables(
  'g.he-vector-diagram-forces-shallow',
  'Nearly level cables: small weight, huge tensions',
  'Use this for “A 500 N load hangs from two cables only 5° above level. Find the tensions.”',
  { W: 500, t1: 5, t2: 5 },
);

/** statics#0~components: the resultant of up to four forces by components. */
function resultant(id: string, title: string, use: string, fs: [number, number][]): ModuleDef {
  const idx = fs.map((_, i) => i + 1);
  const ex: Values = {};
  fs.forEach(([F, a], i) => {
    ex[`F${i + 1}`] = F;
    ex[`a${i + 1}`] = a;
  });
  const Rx = fs.reduce((s, [F, a]) => s + F * cosd(a), 0);
  const Ry = fs.reduce((s, [F, a]) => s + F * sind(a), 0);
  const heading = (x: number, y: number) => (((Math.atan2(y, x) / DEG) % 360) + 360) % 360;
  const sumOf = (fn: 'cos' | 'sin', k: string) =>
    rule(
      `R${k === 'x' ? 'ₓ' : '_y'} = ΣF ${fn} α`,
      `{R${k}} = ${idx.map((i) => `{F${i}} × ${fn}({a${i}}°)`).join(' + ')}`,
      [`R${k}`, ...idx.flatMap((i) => [`F${i}`, `a${i}`])],
      (v) =>
        v[`R${k}`]! -
        idx.reduce((s, i) => s + v[`F${i}`]! * (fn === 'cos' ? cosd : sind)(v[`a${i}`]!), 0),
      {
        [`R${k}`]: [
          (v) =>
            idx.reduce((s, i) => s + v[`F${i}`]! * (fn === 'cos' ? cosd : sind)(v[`a${i}`]!), 0),
          idx.map((i) => `{F${i}} × ${fn}({a${i}}°)`).join(' + '),
          `Add each force’s ${k}-component, F ${fn} α, signs and all.`,
        ],
      },
    );
  return page({
    id,
    title,
    use,
    assumptions: [
      'Every force acts at one point, so the forces add as vectors.',
      'Each angle α is measured counterclockwise from the positive x-axis.',
      'The direction of R comes from atan2(R_y, Rₓ), so it lands in the right quadrant.',
    ],
    variables: [
      ...idx.flatMap((i) => [
        num(`F${i}`, `F${SUBS[i - 1]}`, `Force ${i}`, 'N', 0.01, 1e6, { step: 1 }),
        num(`a${i}`, `α${SUBS[i - 1]}`, `Angle of force ${i}`, '°', 0.1, 360, { step: 1 }),
      ]),
      got('Rx', 'Rₓ', 'Resultant, x-component', 'N', -1e7, 1e7),
      got('Ry', 'R_y', 'Resultant, y-component', 'N', -1e7, 1e7),
      got('R', 'R', 'Resultant size', 'N', 0, 1e7),
      got('beta', 'β', 'Resultant direction', '°', 0, 360),
    ],
    rules: [
      sumOf('cos', 'x'),
      sumOf('sin', 'y'),
      rule(
        'R = √(Rₓ² + R_y²)',
        '{R} = √({Rx}² + {Ry}²)',
        ['R', 'Rx', 'Ry'],
        (v) => v.R! ** 2 - v.Rx! ** 2 - v.Ry! ** 2,
        {
          R: [
            (v) => Math.hypot(v.Rx!, v.Ry!),
            '√({Rx}² + {Ry}²)',
            'The parts are at right angles: Pythagoras gives the size.',
          ],
        },
      ),
      rule(
        'β = atan2(R_y, Rₓ)',
        '{Ry} = {Rx} × tan({beta}°)',
        ['beta', 'Rx', 'Ry'],
        (v) => ((((v.beta! - heading(v.Rx!, v.Ry!) + 540) % 360) + 360) % 360) - 180,
        {
          beta: [
            (v) => heading(v.Rx!, v.Ry!),
            (v) =>
              v.Rx! < 0
                ? 'tan⁻¹({Ry} ÷ {Rx}) + 180'
                : v.Ry! < 0
                  ? 'tan⁻¹({Ry} ÷ {Rx}) + 360'
                  : 'tan⁻¹({Ry} ÷ {Rx})',
            'The angle whose tangent is R_y over Rₓ, turned into the quadrant the parts point to.',
          ],
        },
      ),
    ],
    example: { ...ex, Rx, Ry, R: Math.hypot(Rx, Ry), beta: heading(Rx, Ry) },
    startWith: idx.flatMap((i) => [`F${i}`, `a${i}`]),
    representation: {
      kind: 'vectorDiagram',
      vectors: [{ name: 'R', x: 'Rx', y: 'Ry', magnitude: 'R', direction: 'beta' }],
      unit: 'N',
      forces: {
        list: idx.map((i) => ({ name: `F${SUBS[i - 1]}`, magnitude: `F${i}`, direction: `a${i}` })),
      },
      fixed: true,
    },
  });
}

const forcesThree = resultant(
  'g.he-vector-diagram-forces-components',
  'Three forces tip to tail and their resultant',
  'Use this for “Forces of 200 N at 15°, 300 N at 90° and 100 N at 225° act at a point. Find the resultant.”',
  [
    [200, 15],
    [300, 90],
    [100, 225],
  ],
);

const forcesFour = resultant(
  'g.he-vector-diagram-forces-four',
  'Four forces: a resultant pointing back left',
  'Use this for “150 N at 30°, 200 N at 120°, 120 N at 200° and 80 N at 300° act at a point. Find R.”',
  [
    [150, 30],
    [200, 120],
    [120, 200],
    [80, 300],
  ],
);

// ── HC108: the vector model of L (quantum#2) ──

/** A rule that only checks (never solved), e.g. |m| ≤ ℓ. */
const limit = (r: Rule): Rule => ({ ...r, relation: { ...r.relation, constraint: true } });

/** quantum#2 main: |L| = √(ℓ(ℓ + 1))ħ, L_z = mħ, cos θ = m ÷ √(ℓ(ℓ + 1)). */
function lCone(id: string, title: string, use: string, l: number, m: number): ModuleDef {
  const size = Math.sqrt(l * (l + 1));
  return page({
    id,
    title,
    use,
    assumptions: [
      'Only |L| and one component, L_z, can be known together: L_x and L_y spread round a cone.',
      'm runs over the whole numbers from −ℓ to ℓ: 2ℓ + 1 cones.',
      '|m| < √(ℓ(ℓ + 1)), so L never points straight along z. Sizes are in units of ħ.',
    ],
    variables: [
      num('l', 'ℓ', 'Orbital quantum number', undefined, 1, 10, { integer: true }),
      num('m', 'm', 'Magnetic quantum number', undefined, -10, 10, { integer: true }),
      got('L', '|L|', 'Size of L', 'ħ', 0, 11),
      got('Lz', 'L_z', 'z-part of L', 'ħ', -10, 10),
      got('theta', 'θ', 'Angle from the z-axis', '°', 0, 180),
      got('n', 'states', 'Number of states', undefined, 3, 21, { integer: true }),
    ],
    rules: [
      limit(
        rule(
          '|m| ≤ ℓ',
          '{m} is from −{l} to {l}',
          ['m', 'l'],
          (v) => (Math.abs(v.m!) <= v.l! ? 0 : 1),
          {},
        ),
      ),
      rule(
        '|L| = √(ℓ(ℓ + 1))',
        '{L} = √({l} × ({l} + 1))',
        ['L', 'l'],
        (v) => v.L! ** 2 - v.l! * (v.l! + 1),
        {
          L: [
            (v) => Math.sqrt(v.l! * (v.l! + 1)),
            '√({l} × ({l} + 1))',
            'The size of L in ħ: the square root of ℓ(ℓ + 1), never quite ℓ.',
          ],
        },
      ),
      rule('L_z = mħ', '{Lz} = {m}', ['Lz', 'm'], (v) => v.Lz! - v.m!, {
        Lz: [(v) => v.m!, '{m}', 'The z-part of L is m units of ħ.'],
      }),
      rule(
        'cos θ = m ÷ |L|',
        '{theta} = cos⁻¹({m} ÷ {L})',
        ['theta', 'm', 'L'],
        (v) => Math.cos(v.theta! * DEG) * v.L! - v.m!,
        {
          theta: [
            (v) => fin(Math.acos(Math.max(-1, Math.min(1, v.m! / v.L!))) / DEG),
            'cos⁻¹({m} ÷ {L})',
            'The z-part over the size is the cosine of the angle from z.',
          ],
        },
      ),
      rule('states = 2ℓ + 1', '{n} = 2 × {l} + 1', ['n', 'l'], (v) => v.n! - 2 * v.l! - 1, {
        n: [(v) => 2 * v.l! + 1, '2 × {l} + 1', 'Count m from −ℓ to ℓ: 2ℓ + 1 values.'],
      }),
    ],
    example: { l, m, L: size, Lz: m, theta: Math.acos(m / size) / DEG, n: 2 * l + 1 },
    startWith: ['l', 'm'],
    representation: {
      kind: 'vectorDiagram',
      vectors: [{ name: 'L' }],
      cone: { l: 'l', m: 'm', size: 'L', lz: 'Lz', angle: 'theta', states: 'n' },
    },
  });
}

const coneMain = lCone(
  'g.he-vector-diagram-cone',
  'The vector model of L: ℓ = 2, m = 1',
  'Use this for “For ℓ = 2 and m = 1, find |L|, its z-part and the angle L makes with the z-axis.”',
  2,
  1,
);

const coneDown = lCone(
  'g.he-vector-diagram-cone-down',
  'A cone below the plane: ℓ = 3, m = −2',
  'Use this for “An f electron has ℓ = 3 and m = −2. At what angle to z does L point?”',
  3,
  -2,
);

const coneTop = lCone(
  'g.he-vector-diagram-cone-top',
  'The top cone still misses the z-axis: ℓ = 4, m = 4',
  'Use this for “For ℓ = 4, how close to the z-axis can L ever point?”',
  4,
  4,
);

export const HE4B_GALLERY_MODULES: ModuleDef[] = [
  projectMain,
  projectObtuse,
  gramMain,
  gramSteep,
  massesLine,
  massesLopsided,
  massesPlane,
  forcesCables,
  forcesShallow,
  forcesThree,
  forcesFour,
  coneMain,
  coneDown,
  coneTop,
];

export const HE4B_GALLERY_LAYOUTS: LayoutDef[] = [];
