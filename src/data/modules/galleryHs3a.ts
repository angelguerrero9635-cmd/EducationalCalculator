/**
 * Grades 9–12 round 3 gallery demos (group H3A: physics (H107); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in: the page that waits
 * (its variables, rules, steps and example) with the picture it will pass. Spread into
 * gallery.ts.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import { SCIENCE_11_MODULES } from './science/11';
import type { ModuleDef, Representation, StepText } from './types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const pageOf = (id: string) => {
  const found = SCIENCE_11_MODULES.find((m) => m.id === id);
  if (!found) throw new Error(`galleryHs3a: no page ${id}`);
  return found;
};

/**
 * A demo from the page that waits, with the picture the page will pass. `vars` changes
 * variables (by id); `example` and `startWith` replace the page's.
 */
function fromPage(
  pageId: string,
  id: string,
  title: string,
  representation: Representation,
  more: Partial<ModuleDef> & { vars?: Record<string, Partial<VariableDef>> } = {},
): ModuleDef {
  const found = pageOf(pageId);
  const { vars, ...rest } = more;
  return {
    ...found,
    id,
    title,
    representation,
    variables: found.variables.map((v) => (vars?.[v.id] ? { ...v, ...vars[v.id] } : v)),
    ...rest,
  };
}

/** A relation and its step text, built together. */
interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}
type Solve = (v: Values) => number | number[] | undefined;

/** A rule from its display, its residual and, per variable, `[solve, expr, how]`. */
const rule = (
  id: string,
  display: string,
  residual: (v: Values) => number,
  parts: Record<string, [Solve, string, string] | null>,
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

/** Gathers rules into a module's `relations` and `steps`. */
const rules = (...rs: Rule[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
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
): VariableDef => ({ id, symbol, name, ...(unit ? { unit } : {}), min, max, step, ...extra });

/** Division for values far below 1 (a proton's mass, its charge): undefined only for 0. */
const quot = (a: number, b: number) => (b === 0 || !Number.isFinite(b) ? undefined : a / b);

const RAD = Math.PI / 180;

// ─── H107.1 torque: s.11.rotation ────────────────────────────────────────────

const TORQUE_PICTURE: Representation = {
  kind: 'torque',
  arm: 'r',
  force: 'F',
  angle: 'a',
  across: 'p',
  torque: 't',
};

const wrench = fromPage(
  's.11.rotation',
  'g.s-11-rotation-wrench',
  'Torque on a wrench',
  TORQUE_PICTURE,
  {
    use: 'Use this for “An 80 N push at 30° to a 0.25 m wrench. What part of the push turns it, and what is the torque?”',
    pictureLabels: [],
  },
);

const door = fromPage(
  's.11.rotation',
  'g.s-11-rotation-door',
  'Torque on a door',
  { ...TORQUE_PICTURE, body: 'door' },
  {
    use: 'Use this for “A 40 N pull on a door handle 0.8 m from the hinge at 160° to the door. What is the torque?”',
    example: {
      r: 0.8,
      F: 40,
      a: 160,
      p: 40 * Math.sin(160 * RAD),
      t: 0.8 * 40 * Math.sin(160 * RAD),
    },
    pictureLabels: [],
  },
);

// ─── H107.2 simpleMachine seesaw: s.11.rotation~seesaw ───────────────────────

const SEESAW_PICTURE: Representation = {
  kind: 'simpleMachine',
  machine: 'lever',
  load: 'W',
  loadArm: 'l',
  effortArm: 'e',
  effort: 'F',
  seesaw: { torque: 't', pivot: 'P' },
};

const seesaw = fromPage(
  's.11.rotation~seesaw',
  'g.s-11-rotation-seesaw',
  'Balancing a seesaw',
  SEESAW_PICTURE,
  { pictureLabels: [] },
);

const seesawFar = fromPage(
  's.11.rotation~seesaw',
  'g.s-11-rotation-seesaw-far',
  'A light child far out, a heavy one close in',
  SEESAW_PICTURE,
  {
    use: 'Use this for “A 150 N child sits 3 m from the pivot. Where must a 900 N adult sit to balance?”',
    example: { W: 150, l: 3, F: 900, e: 0.5, t: 450, P: 1050 },
    pictureLabels: [],
  },
);

// ─── H107.3 rotor: s.11.rotation~rotational-inertia, ~angular-acceleration, ~angular-speed ──

const SPIN_PICTURE: Representation = {
  kind: 'rotor',
  start: 'u',
  acceleration: 'a',
  time: 't',
  speed: 'w',
  angle: 'd',
  turns: 'n',
};

const spinUp = fromPage(
  's.11.rotation~angular-acceleration',
  'g.s-11-rotation-angular-acceleration',
  'A wheel speeding up: ω–t and the turns',
  SPIN_PICTURE,
  { pictureLabels: [] },
);

const spinDown = fromPage(
  's.11.rotation~angular-acceleration',
  'g.s-11-rotation-angular-acceleration-reverse',
  'A wheel slowing down',
  SPIN_PICTURE,
  {
    // The page counts turns one way only (ω₀ and ω keep their sign), so the demo slows but
    // doesn't turn back.
    use: 'Use this for “A wheel turning at 20 rad/s slows at 2 rad/s² for 8 s. How fast is it turning then, and how many turns does it make?”',
    example: { u: 20, a: -2, t: 8, w: 4, d: 96, n: 96 / (2 * Math.PI) },
    pictureLabels: [],
  },
);

const steadySpin = fromPage(
  's.11.rotation~angular-speed',
  'g.s-11-rotation-angular-speed',
  'Angular speed and rim speed on a wheel',
  { kind: 'rotor', radius: 'r', rpm: 'N', speed: 'w', period: 'T', rim: 'v' },
  { pictureLabels: [] },
);

// ─── H107.4 oscillator: s.11.oscillations, ~hooke ────────────────────────────

const SPRING_PICTURE: Representation = {
  kind: 'oscillator',
  mass: 'm',
  spring: 'k',
  amplitude: 'A',
  period: 'T',
  frequency: 'f',
  angular: 'w',
  top: 'v',
  energy: 'E',
};

const oscillator = fromPage(
  's.11.oscillations',
  'g.s-11-oscillations-spring',
  'A mass on a spring and its x–t trace',
  SPRING_PICTURE,
  { pictureLabels: [] },
);

const oscillatorStiff = fromPage(
  's.11.oscillations',
  'g.s-11-oscillations-spring-stiff',
  'A heavy mass on a soft spring',
  SPRING_PICTURE,
  {
    use: 'Use this for “A 4 kg mass on a 25 N/m spring is pulled out 0.3 m. What is its period, top speed and energy?”',
    example: (() => {
      const [m, k, A] = [4, 25, 0.3];
      const T = 2 * Math.PI * Math.sqrt(m / k);
      const w = (2 * Math.PI) / T;
      return { m, k, A, T, f: 1 / T, w, v: A * w, E: 0.5 * k * A * A };
    })(),
    pictureLabels: [],
  },
);

const hooke = fromPage(
  's.11.oscillations~hooke',
  'g.s-11-oscillations-hooke-hang',
  'A hung mass stretching a spring',
  {
    kind: 'oscillator',
    mode: 'hang',
    mass: 'm',
    stretch: 'x',
    spring: 'k',
    force: 'F',
    energy: 'U',
  },
  { pictureLabels: [] },
);

// ─── H107.5 pendulum: s.11.oscillations~pendulum ─────────────────────────────

const PENDULUM_PICTURE: Representation = {
  kind: 'pendulum',
  length: 'L',
  gravity: 'g',
  period: 'T',
  frequency: 'f',
};

const pendulum = fromPage(
  's.11.oscillations~pendulum',
  'g.s-11-oscillations-pendulum',
  'A pendulum by its length',
  PENDULUM_PICTURE,
  { pictureLabels: [] },
);

const pendulumMoon = fromPage(
  's.11.oscillations~pendulum',
  'g.s-11-oscillations-pendulum-moon',
  'A long pendulum on the Moon',
  PENDULUM_PICTURE,
  {
    use: 'Use this for “What is the period of a 2.5 m pendulum on the Moon, where g is 1.62 m/s²?”',
    example: (() => {
      const [L, g] = [2.5, 1.62];
      const T = 2 * Math.PI * Math.sqrt(L / g);
      return { L, g, T, f: 1 / T };
    })(),
    pictureLabels: [],
  },
);

// ─── H107.6 capacitor: s.11.electric-potential~capacitor, ~parallel-plate ────

const capacitor = fromPage(
  's.11.electric-potential~capacitor',
  'g.s-11-electric-potential-capacitor',
  'Charge and energy on a capacitor',
  { kind: 'capacitor', capacitance: 'C', voltage: 'V', charge: 'Q', energy: 'U', farads: 1e-6 },
  { pictureLabels: [] },
);

const PLATES_PICTURE: Representation = {
  kind: 'capacitor',
  dielectric: 'k',
  area: 'A',
  gap: 'd',
  meters: 1e-3,
  capacitance: 'C',
  voltage: 'V',
  charge: 'Q',
  farads: 1e-12,
};

const parallelPlate = fromPage(
  's.11.electric-potential~parallel-plate',
  'g.s-11-electric-potential-parallel-plate',
  'A parallel-plate capacitor in air',
  PLATES_PICTURE,
  // The page's solver reports consistent values as a conflict when the area is near 0 (sent to
  // the lesson chat); the demo keeps the area at 1 cm² or more.
  { pictureLabels: [], vars: { A: { min: 0.0001 } } },
);

const dielectric = fromPage(
  's.11.electric-potential~parallel-plate',
  'g.s-11-electric-potential-dielectric',
  'An insulator between the plates',
  PLATES_PICTURE,
  {
    use: 'Use this for “A plastic sheet with κ = 3.5 fills the 0.2 mm gap between 0.05 m² plates. What is C, and what charge does 9 V put on it?”',
    example: (() => {
      const [k, A, d, V] = [3.5, 0.05, 0.2, 9];
      const C = (8.85 * k * A) / (d * 1e-3);
      return { k, A, d, C, V, Q: C * V, E: V / (d * 1e-3) };
    })(),
    pictureLabels: [],
  },
);

// ─── H107.7 charges equipotentials: s.11.electric-potential ──────────────────

const EQUIPOTENTIAL_PICTURE: Representation = {
  kind: 'charges',
  charges: ['a'],
  distance: 'r',
  equipotentials: { potential: 'V', test: 't', energy: 'U' },
};

const equipotentials = fromPage(
  's.11.electric-potential',
  'g.s-11-electric-potential-equipotentials',
  'Circles of equal potential round a charge',
  EQUIPOTENTIAL_PICTURE,
  { pictureLabels: [] },
);

const unlike = fromPage(
  's.11.electric-potential',
  'g.s-11-electric-potential-unlike',
  'A − charge and a + charge: U below zero',
  EQUIPOTENTIAL_PICTURE,
  {
    use: 'Use this for “What is the potential 0.2 m from a −3 μC charge, and the potential energy of a +1.5 μC charge there?”',
    example: (() => {
      const [a, r, t] = [-3, 0.2, 1.5];
      const V = (8.99e3 * a) / r;
      return { a, r, V, t, U: t * 1e-6 * V };
    })(),
    pictureLabels: [],
  },
);

// ─── H107.8 charges plates launch: s.11.electric-potential~voltage-energy ────

const LAUNCH_PICTURE: Representation = {
  kind: 'charges',
  mode: 'plates',
  voltage: 'V',
  launch: { charge: 'q', mass: 'm', energy: 'K', speed: 'v' },
};

/**
 * The mass in kg only: with its gram menu the sampling finds a retyped speed cleared (the
 * page's own engine case, reported in H107's notes), which the demo leaves out.
 */
const LAUNCH_VARS = { m: { units: ['kg'] } };

const launch = fromPage(
  's.11.electric-potential~voltage-energy',
  'g.s-11-electric-potential-launch',
  'An electron speeding through a voltage',
  LAUNCH_PICTURE,
  { pictureLabels: [], vars: LAUNCH_VARS },
);

const launchProton = fromPage(
  's.11.electric-potential~voltage-energy',
  'g.s-11-electric-potential-launch-proton',
  'A proton through 5000 V',
  LAUNCH_PICTURE,
  {
    vars: LAUNCH_VARS,
    use: 'Use this for “A proton starts at rest and crosses 5000 V. How much energy does it gain, and how fast does it go?”',
    example: (() => {
      const [q, V, m] = [1, 5000, 1.673e-27];
      return { q, V, K: q * V, m, v: Math.sqrt((2 * q * V * 1.602e-19) / m) };
    })(),
    pictureLabels: [],
  },
);

// ─── H107.9 induction, a moving charge: s.11.electromagnetism (~moving-charge) ─

const E = 1.602e-19;

const movingCircle: ModuleDef = (() => {
  const [n, m, v, B] = [1, 1.673e-27, 2e6, 0.5];
  return {
    id: 'g.s-11-electromagnetism-moving-charge-circle',
    title: 'A proton circling in a magnetic field',
    use: 'Use this for “A proton moves at 2 × 10⁶ m/s square to a 0.5 T field. What force acts on it, and what is the radius of its circle?”',
    unitSystems: ['metric'],
    assumptions: [
      'The field is square to the velocity, so F = |q|vB, with q in electron charges e = 1.602 × 10⁻¹⁹ C.',
      'The force is always square to v: it turns the charge without speeding it up, so the path is a circle.',
      'That force is the centripetal force: |q|vB = mv²/r, so r = mv/(|q|B).',
    ],
    variables: [
      q('n', 'q', 'Charge', 'e', 1, 10, 1, { integer: true }),
      q('m', 'm', 'Mass', 'kg', 9.109e-31, 1e-24, 1e-34, { scientific: true }),
      q('v', 'v', 'Speed', 'm/s', 1, 3e7, 1, { scientific: true, units: ['m/s'] }),
      q('B', 'B', 'Magnetic field', 'T', 0.0001, 10, 0.0001),
      q('F', 'F', 'Force', 'N', 0, 1, 1e-20, { scientific: true }),
      q('r', 'r', 'Radius', 'm', 0, 1e6, 1e-15, { scientific: true, units: ['m'] }),
    ],
    ...rules(
      rule(
        'F = |q|vB',
        '{F} = {n} × 1.602 × 10⁻¹⁹ × {v} × {B}',
        (x) => x.F! / (E * x.n! * x.v! * x.B!) - 1,
        {
          F: [
            (x) => x.n! * E * x.v! * x.B!,
            '{n} × 1.602 × 10⁻¹⁹ × {v} × {B}',
            'The charge in coulombs times the speed and the field.',
          ],
          n: null,
          v: null,
          B: null,
        },
      ),
      rule(
        'r = mv/(|q|B)',
        '{r} = {m} × {v}/({n} × 1.602 × 10⁻¹⁹ × {B})',
        (x) => x.r! * x.n! * E * x.B! - x.m! * x.v!,
        {
          r: [
            (x) => quot(x.m! * x.v!, x.n! * E * x.B!),
            '{m} × {v}/({n} × 1.602 × 10⁻¹⁹ × {B})',
            'Momentum over charge times field: a faster or heavier charge circles wider.',
          ],
          v: [
            (x) => quot(x.r! * x.n! * E * x.B!, x.m!),
            '{r} × {n} × 1.602 × 10⁻¹⁹ × {B}/{m}',
            'Solve r = mv/(|q|B) for the speed.',
          ],
          B: [
            (x) => quot(x.m! * x.v!, x.r! * x.n! * E),
            '{m} × {v}/({r} × {n} × 1.602 × 10⁻¹⁹)',
            'Solve r = mv/(|q|B) for the field.',
          ],
          n: null,
          m: null,
        },
      ),
    ),
    example: { n, m, v, B, F: n * E * v * B, r: (m * v) / (n * E * B) },
    startWith: ['n', 'm', 'v', 'B'],
    representation: {
      kind: 'induction',
      mode: 'charge',
      charge: 'n',
      coulombs: E,
      speed: 'v',
      field: 'B',
      mass: 'm',
      force: 'F',
      radius: 'r',
    },
  };
})();

export const HS3A_GALLERY_MODULES: ModuleDef[] = [
  movingCircle,
  launch,
  launchProton,
  equipotentials,
  unlike,
  capacitor,
  parallelPlate,
  dielectric,
  pendulum,
  pendulumMoon,
  oscillator,
  oscillatorStiff,
  hooke,
  wrench,
  door,
  seesaw,
  seesawFar,
  spinUp,
  spinDown,
  steadySpin,
];

export const HS3A_GALLERY_LAYOUTS: LayoutDef[] = [];
