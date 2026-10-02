/**
 * College gallery demos, round 2, group H (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC24 `wing`: aerodynamics#0–#2 (docs/plans/he.aero-civil-chemical.md, P1). Constants as the
 * plan has them (air γ = 1.4, R = 287 J/(kg·K)); each picture takes them from the page.
 */
import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';
import type { WingSpec } from './typesHe2h';
import type { Relation, Values, VariableDef } from '@/engine/types';

interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}

type Solve = (v: Values) => number | number[] | undefined;

/** Gathers rules into a module's `relations` and `steps`. */
const rules = (...rs: Rule[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

/**
 * A rule from its display, its residual and, per variable, how to solve for it with the step
 * text: `[solve, expr, how]`; `null` marks a value this rule never works out.
 */
const rule = (
  id: string,
  display: string,
  residual: (v: Values) => number,
  parts: Record<string, [Solve, StepText['expr'], string] | null>,
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

/** A value with its unit and range. */
const q = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  step = 0.001,
  extra: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...(unit ? { unit } : {}), min, max, step, ...extra });

const div = (a: number, b: number) => (Math.abs(b) < 1e-15 ? undefined : a / b);
const root = (x: number) => (x < 0 ? undefined : Math.sqrt(x));
const RAD = Math.PI / 180;

/** A demo module: the page's values and rules, the picture, a title and its use line. */
const demo = (
  id: string,
  title: string,
  use: string,
  m: Omit<ModuleDef, 'id' | 'title' | 'use' | 'unitSystems'>,
): ModuleDef => ({ id, title, use, workedFigures: 4, unitSystems: ['metric'], ...m });

/** q = ½ρV² (in Pa from kg/m³ and m/s). */
const dynamicPressure = (qId: string, rho: string, V: string): Rule =>
  rule(
    'q = ½ρV²',
    `{${qId}} = 0.5 × {${rho}} × {${V}}²`,
    (v) => v[qId]! - 0.5 * v[rho]! * v[V]! ** 2,
    {
      [qId]: [
        (v) => 0.5 * v[rho]! * v[V]! ** 2,
        `0.5 × {${rho}} × {${V}}²`,
        'Half the density times the speed squared.',
      ],
      [rho]: [
        (v) => div(2 * v[qId]!, v[V]! ** 2),
        `2 × {${qId}} ÷ {${V}}²`,
        'Double q, then divide by the speed squared.',
      ],
      [V]: [
        (v) => root(div(2 * v[qId]!, v[rho]!) ?? -1),
        `√(2 × {${qId}} ÷ {${rho}})`,
        'Double q, divide by the density, then take the square root.',
      ],
    },
  );

// ── HC24: thin-airfoil lift (aerodynamics#0 main), and a symmetric section at −8° ──

const thinAirfoil = (id: string, title: string, use: string, alpha: number, aL0: number) =>
  demo(id, title, use, {
    assumptions: [
      'Thin airfoil, small angles, no stall: the theory ignores separation past about 12–15°.',
      'A symmetric airfoil has α_L0 = 0; camber makes α_L0 negative.',
      'The lift-curve slope is 2π per radian (0.1097 per degree).',
    ],
    variables: [
      q('alpha', 'α', 'Angle of attack', '°', -10, 20, 0.1),
      q('aL0', 'α_L0', 'Zero-lift angle', '°', -6, 0, 0.1),
      q('cl', 'c_l', 'Lift coefficient', undefined, -1.5, 2.5, 0.001),
    ],
    ...rules(
      rule(
        'c_l = 2π(α − α_L0)',
        '{cl} = 2π × ({alpha} − {aL0}) × π ÷ 180',
        (v) => v.cl! - 2 * Math.PI * (v.alpha! - v.aL0!) * RAD,
        {
          cl: [
            (v) => 2 * Math.PI * (v.alpha! - v.aL0!) * RAD,
            '2π × ({alpha} − {aL0}) × π ÷ 180',
            'Measure α from the zero-lift angle, turn the degrees into radians (× π ÷ 180), then multiply by 2π.',
          ],
          alpha: [
            (v) => v.cl! / (2 * Math.PI) / RAD + v.aL0!,
            '{cl} ÷ (2π) × 180 ÷ π + {aL0}',
            'Divide c_l by 2π for the angle from zero lift in radians, turn it into degrees, then add α_L0.',
          ],
          aL0: [
            (v) => v.alpha! - v.cl! / (2 * Math.PI) / RAD,
            '{alpha} − {cl} ÷ (2π) × 180 ÷ π',
            'The angle from zero lift is c_l ÷ 2π radians; take it from α in degrees.',
          ],
        },
      ),
    ),
    example: { alpha, aL0, cl: 2 * Math.PI * (alpha - aL0) * RAD },
    startWith: ['alpha', 'aL0'],
    representation: { kind: 'wing', alpha: 'alpha', alphaL0: 'aL0', cl: 'cl' },
  });

const wingSection = thinAirfoil(
  'g.he-wing-section',
  'Thin-airfoil lift: c_l from α and the zero-lift angle',
  'Use this for “A cambered airfoil with zero-lift angle −2° flies at 4°. Find c_l.”',
  4,
  -2,
);

const wingSymmetric = thinAirfoil(
  'g.he-wing-symmetric',
  'A symmetric airfoil at a negative angle: lift points down',
  'Use this for “A symmetric airfoil meets the air at −8°. What is c_l, and which way does the lift point?”',
  -8,
  0,
);

// ── HC24: pressure coefficient at a point (aerodynamics#0~pressure-coefficient) ──

const wingPressure = (() => {
  const [rho, Vinf, V] = [1.225, 50, 60];
  const qq = 0.5 * rho * Vinf * Vinf;
  const Cp = 1 - (V / Vinf) ** 2;
  return demo(
    'g.he-wing-pressure',
    'Pressure coefficient from the local speed',
    'Use this for “Air at 1.225 kg/m³ and 50 m/s speeds up to 60 m/s over the top of a wing. Find C_p and p − p∞.”',
    {
      assumptions: [
        'Incompressible flow (low speed), so Bernoulli’s equation holds along the streamline.',
        'C_p < 0 is suction: the surface is pulled outward.',
      ],
      variables: [
        q('rho', 'ρ∞', 'Free-stream density', 'kg/m³', 0.01, 2, 0.001),
        q('Vinf', 'V∞', 'Free-stream speed', 'm/s', 1, 300, 0.1),
        q('V', 'V', 'Local speed', 'm/s', 0, 600, 0.1),
        q('q', 'q∞', 'Dynamic pressure', 'Pa', 0, 1e6, 0.1, { units: ['Pa'] }),
        q('Cp', 'C_p', 'Pressure coefficient', undefined, -40, 1, 0.001),
        q('dp', 'p − p∞', 'Pressure above the free stream', 'Pa', -1e7, 1e6, 0.1, {
          units: ['Pa'],
        }),
      ],
      ...rules(
        dynamicPressure('q', 'rho', 'Vinf'),
        rule(
          'C_p = 1 − (V ÷ V∞)²',
          '{Cp} = 1 − ({V} ÷ {Vinf})²',
          (v) => v.Cp! - (1 - (v.V! / v.Vinf!) ** 2),
          {
            Cp: [
              (v) => 1 - (v.V! / v.Vinf!) ** 2,
              '1 − ({V} ÷ {Vinf})²',
              'Bernoulli: the faster the local flow, the lower its pressure.',
            ],
            V: [
              (v) => (v.Cp! > 1 ? undefined : v.Vinf! * Math.sqrt(1 - v.Cp!)),
              '{Vinf} × √(1 − {Cp})',
              'Take C_p from 1, take the root, then multiply by V∞.',
            ],
            Vinf: [
              (v) => (v.Cp! >= 1 ? undefined : v.V! / Math.sqrt(1 - v.Cp!)),
              '{V} ÷ √(1 − {Cp})',
              'Divide the local speed by the root of 1 − C_p.',
            ],
          },
        ),
        rule('p − p∞ = C_p q∞', '{dp} = {Cp} × {q}', (v) => v.dp! - v.Cp! * v.q!, {
          dp: [(v) => v.Cp! * v.q!, '{Cp} × {q}', 'C_p is the pressure change in units of q∞.'],
          Cp: [(v) => div(v.dp!, v.q!), '{dp} ÷ {q}', 'Divide the pressure change by q∞.'],
          q: [(v) => div(v.dp!, v.Cp!), '{dp} ÷ {Cp}', 'Divide the pressure change by C_p.'],
        }),
      ),
      example: { rho, Vinf, V, q: qq, Cp, dp: Cp * qq },
      startWith: ['rho', 'Vinf', 'V'],
      representation: {
        kind: 'wing',
        speed: 'Vinf',
        pressure: { cp: 'Cp', speed: 'V' },
        more: ['rho', 'q', 'dp'],
      },
    },
  );
})();

// ── HC24: Kutta–Joukowski (aerodynamics#0~circulation) ──

const wingCirculation = (() => {
  const [rho, Vinf, G, c] = [1.225, 40, 20, 1.5];
  const Lp = rho * Vinf * G;
  return demo(
    'g.he-wing-circulation',
    'Lift per span from the circulation (Kutta–Joukowski)',
    'Use this for “Air at 1.225 kg/m³ and 40 m/s; the circulation round a 1.5 m chord is 20 m²/s. Find L′ and c_l.”',
    {
      assumptions: [
        'Steady, inviscid flow past a two-dimensional section: lift per metre of span.',
        'Γ is positive clockwise with the flow from the left: then the lift is up.',
      ],
      variables: [
        q('rho', 'ρ∞', 'Free-stream density', 'kg/m³', 0.01, 2, 0.001),
        q('Vinf', 'V∞', 'Free-stream speed', 'm/s', 1, 300, 0.1),
        q('G', 'Γ', 'Circulation', 'm²/s', -500, 500, 0.01),
        q('Lp', 'L′', 'Lift per span', 'N/m', -1e6, 1e6, 0.1),
        q('c', 'c', 'Chord', 'm', 0.01, 20, 0.001),
        q('cl', 'c_l', 'Lift coefficient', undefined, -3, 3, 0.001),
      ],
      ...rules(
        rule('L′ = ρ∞V∞Γ', '{Lp} = {rho} × {Vinf} × {G}', (v) => v.Lp! - v.rho! * v.Vinf! * v.G!, {
          Lp: [
            (v) => v.rho! * v.Vinf! * v.G!,
            '{rho} × {Vinf} × {G}',
            'Kutta–Joukowski: density times speed times circulation.',
          ],
          G: [
            (v) => div(v.Lp!, v.rho! * v.Vinf!),
            '{Lp} ÷ ({rho} × {Vinf})',
            'Divide the lift per span by ρ∞V∞.',
          ],
          Vinf: [
            (v) => div(v.Lp!, v.rho! * v.G!),
            '{Lp} ÷ ({rho} × {G})',
            'Divide the lift per span by ρ∞Γ.',
          ],
          rho: [
            (v) => div(v.Lp!, v.Vinf! * v.G!),
            '{Lp} ÷ ({Vinf} × {G})',
            'Divide the lift per span by V∞Γ.',
          ],
        }),
        rule(
          'c_l = L′ ÷ (q∞c)',
          '{cl} = {Lp} ÷ (0.5 × {rho} × {Vinf}² × {c})',
          (v) => v.cl! * 0.5 * v.rho! * v.Vinf! ** 2 * v.c! - v.Lp!,
          {
            cl: [
              (v) => div(v.Lp!, 0.5 * v.rho! * v.Vinf! ** 2 * v.c!),
              '{Lp} ÷ (0.5 × {rho} × {Vinf}² × {c})',
              'Divide the lift per span by q∞ = ½ρ∞V∞² and by the chord.',
            ],
            c: [
              (v) => div(v.Lp!, 0.5 * v.rho! * v.Vinf! ** 2 * v.cl!),
              '{Lp} ÷ (0.5 × {rho} × {Vinf}² × {cl})',
              'Divide the lift per span by q∞ and by c_l.',
            ],
            Lp: null,
            rho: null,
            Vinf: null,
          },
        ),
      ),
      example: { rho, Vinf, G, Lp, c, cl: Lp / (0.5 * rho * Vinf * Vinf * c) },
      startWith: ['rho', 'Vinf', 'G', 'c'],
      representation: {
        kind: 'wing',
        speed: 'Vinf',
        chord: 'c',
        circulation: { gamma: 'G', lift: 'Lp' },
        more: ['rho', 'cl'],
      },
    },
  );
})();

// ── HC24: a NACA four-digit section from its digits (aerodynamics#0~naca) ──

const wingNaca = (() => {
  const [d1, d2, d34, c] = [2, 4, 12, 1.5];
  return demo(
    'g.he-wing-naca',
    'What the NACA four digits mean',
    'Use this for “What does NACA 2412 mean? Give the camber and thickness of a 1.5 m chord.”',
    {
      assumptions: [
        'NACA four-digit section: max camber d₁% of the chord, at d₂ tenths of the chord.',
        'The last two digits are the thickness, as a percent of the chord.',
      ],
      variables: [
        q('d1', 'd₁', 'First digit (max camber, %)', undefined, 0, 9, 1, { integer: true }),
        q('d2', 'd₂', 'Second digit (camber place, tenths)', undefined, 0, 9, 1, {
          integer: true,
        }),
        q('d34', 'd₃d₄', 'Last two digits (thickness, %)', undefined, 1, 40, 1, {
          integer: true,
        }),
        q('c', 'c', 'Chord', 'm', 0.01, 50, 0.001),
        q('ym', 'y_c', 'Max camber', 'm', 0, 5, 0.0001),
        q('xm', 'x_c', 'Max camber from the leading edge', 'm', 0, 50, 0.0001),
        q('t', 't', 'Thickness', 'm', 0, 20, 0.0001),
      ],
      ...rules(
        rule('y_c = d₁% of c', '{ym} = {d1} ÷ 100 × {c}', (v) => v.ym! - (v.d1! / 100) * v.c!, {
          ym: [
            (v) => (v.d1! / 100) * v.c!,
            '{d1} ÷ 100 × {c}',
            'The first digit is the camber in percent of the chord.',
          ],
          c: [
            (v) => div(100 * v.ym!, v.d1!),
            '100 × {ym} ÷ {d1}',
            'Divide the camber by its percent.',
          ],
          d1: null,
        }),
        rule('x_c = d₂ × 10% of c', '{xm} = {d2} ÷ 10 × {c}', (v) => v.xm! - (v.d2! / 10) * v.c!, {
          xm: [
            (v) => (v.d2! / 10) * v.c!,
            '{d2} ÷ 10 × {c}',
            'The second digit is the place in tenths of the chord.',
          ],
          d2: null,
          c: null,
        }),
        rule('t = d₃d₄% of c', '{t} = {d34} ÷ 100 × {c}', (v) => v.t! - (v.d34! / 100) * v.c!, {
          t: [
            (v) => (v.d34! / 100) * v.c!,
            '{d34} ÷ 100 × {c}',
            'The last two digits are the thickness in percent of the chord.',
          ],
          c: [
            (v) => div(100 * v.t!, v.d34!),
            '100 × {t} ÷ {d34}',
            'Divide the thickness by its percent.',
          ],
          d34: null,
        }),
      ),
      example: { d1, d2, d34, c, ym: (d1 / 100) * c, xm: (d2 / 10) * c, t: (d34 / 100) * c },
      startWith: ['d1', 'd2', 'd34', 'c'],
      representation: {
        kind: 'wing',
        digits: { d1: 'd1', d2: 'd2', d34: 'd34' },
        chord: 'c',
        camber: 'ym',
        camberAt: 'xm',
        thickness: 't',
      },
    },
  );
})();

// ── HC24: lift and drag from the coefficients (aerodynamics#1 main) ──

const wingForces = (() => {
  const [rho, V, S, CL, CD] = [1.225, 60, 16, 0.5, 0.03];
  const qq = 0.5 * rho * V * V;
  return demo(
    'g.he-wing-forces',
    'Lift and drag from C_L, C_D, speed and area',
    'Use this for “A 16 m² wing flies at 60 m/s in air of 1.225 kg/m³ with C_L = 0.5 and C_D = 0.03. Find L, D and L/D.”',
    {
      assumptions: [
        'The coefficients come from a wind tunnel or a polar at this Reynolds and Mach number.',
        'Lift is ⟂ the oncoming flow, not ⟂ the chord; drag is along it.',
      ],
      variables: [
        q('rho', 'ρ', 'Air density', 'kg/m³', 0.01, 1.3, 0.001),
        q('V', 'V', 'Speed', 'm/s', 0, 1000, 0.1),
        q('S', 'S', 'Wing area', 'm²', 0.1, 1000, 0.01, { units: ['m²'] }),
        q('CL', 'C_L', 'Lift coefficient', undefined, -1, 3, 0.001),
        q('CD', 'C_D', 'Drag coefficient', undefined, 0.003, 2, 0.0001),
        q('q', 'q', 'Dynamic pressure', 'Pa', 0, 1e7, 0.1, { units: ['Pa'] }),
        q('L', 'L', 'Lift', 'N', -1e9, 1e9, 1, { units: ['N', 'kN'], shownIn: 'kN' }),
        q('D', 'D', 'Drag', 'N', 0, 1e9, 1, { units: ['N', 'kN'], shownIn: 'kN' }),
        q('LD', 'L/D', 'Lift-to-drag ratio', undefined, -500, 500, 0.01),
      ],
      ...rules(
        dynamicPressure('q', 'rho', 'V'),
        rule('L = qSC_L', '{L} = {q} × {S} × {CL}', (v) => v.L! - v.q! * v.S! * v.CL!, {
          L: [
            (v) => v.q! * v.S! * v.CL!,
            '{q} × {S} × {CL}',
            'Dynamic pressure times area times C_L.',
          ],
          CL: [(v) => div(v.L!, v.q! * v.S!), '{L} ÷ ({q} × {S})', 'Divide the lift by qS.'],
          S: [(v) => div(v.L!, v.q! * v.CL!), '{L} ÷ ({q} × {CL})', 'Divide the lift by qC_L.'],
          q: [(v) => div(v.L!, v.S! * v.CL!), '{L} ÷ ({S} × {CL})', 'Divide the lift by SC_L.'],
        }),
        rule('D = qSC_D', '{D} = {q} × {S} × {CD}', (v) => v.D! - v.q! * v.S! * v.CD!, {
          D: [
            (v) => v.q! * v.S! * v.CD!,
            '{q} × {S} × {CD}',
            'Dynamic pressure times area times C_D.',
          ],
          CD: [(v) => div(v.D!, v.q! * v.S!), '{D} ÷ ({q} × {S})', 'Divide the drag by qS.'],
          S: null,
          q: null,
        }),
        rule('L/D = C_L ÷ C_D', '{LD} = {CL} ÷ {CD}', (v) => v.LD! * v.CD! - v.CL!, {
          LD: [(v) => div(v.CL!, v.CD!), '{CL} ÷ {CD}', 'q and S cancel: L ÷ D is C_L ÷ C_D.'],
          CL: [(v) => v.LD! * v.CD!, '{LD} × {CD}', 'Multiply L/D by C_D.'],
          CD: [(v) => div(v.CL!, v.LD!), '{CL} ÷ {LD}', 'Divide C_L by L/D.'],
        }),
      ),
      example: { rho, V, S, CL, CD, q: qq, L: qq * S * CL, D: qq * S * CD, LD: CL / CD },
      startWith: ['rho', 'V', 'S', 'CL', 'CD'],
      representation: {
        kind: 'wing',
        speed: 'V',
        cl: 'CL',
        cd: 'CD',
        forces: { lift: 'L', drag: 'D' },
        more: ['rho', 'S', 'q', 'LD'],
      },
    },
  );
})();

// ── HC24: induced drag of a finite wing (aerodynamics#2 main), and a glider at the edge ──

const finiteWing = (id: string, title: string, use: string, CL: number, AR: number, e: number) =>
  demo(id, title, use, {
    assumptions: [
      'Lifting-line theory: e = 1 only for an elliptic lift distribution.',
      'α_i = C_L ÷ (πAR) holds for the elliptic wing; long wings (large AR) cut induced drag.',
    ],
    variables: [
      q('CL', 'C_L', 'Wing lift coefficient', undefined, 0, 2, 0.001),
      q('AR', 'AR', 'Aspect ratio', undefined, 1, 40, 0.01),
      q('e', 'e', 'Span efficiency', undefined, 0.5, 1, 0.01),
      q('CDi', 'C_Di', 'Induced drag coefficient', undefined, 0, 2, 0.00001),
      q('ai', 'α_i', 'Induced angle', '°', 0, 30, 0.001),
    ],
    ...rules(
      rule(
        'C_Di = C_L² ÷ (πeAR)',
        '{CDi} = {CL}² ÷ (π × {e} × {AR})',
        (v) => v.CDi! * Math.PI * v.e! * v.AR! - v.CL! ** 2,
        {
          CDi: [
            (v) => (v.CL! * v.CL!) / (Math.PI * v.e! * v.AR!),
            '{CL}² ÷ (π × {e} × {AR})',
            'Square C_L, then divide by π, e and AR.',
          ],
          AR: [
            (v) => div(v.CL! * v.CL!, Math.PI * v.e! * v.CDi!),
            '{CL}² ÷ (π × {e} × {CDi})',
            'Swap AR and C_Di: divide C_L² by πeC_Di.',
          ],
          e: [
            (v) => div(v.CL! * v.CL!, Math.PI * v.AR! * v.CDi!),
            '{CL}² ÷ (π × {AR} × {CDi})',
            'Swap e and C_Di: divide C_L² by πAR C_Di.',
          ],
          CL: [
            (v) => root(Math.PI * v.e! * v.AR! * v.CDi!),
            '√(π × {e} × {AR} × {CDi})',
            'Multiply C_Di by πeAR, then take the square root.',
          ],
        },
      ),
      rule(
        'α_i = C_L ÷ (πAR)',
        '{ai} = {CL} ÷ (π × {AR}) × 180 ÷ π',
        (v) => v.ai! * RAD * Math.PI * v.AR! - v.CL!,
        {
          ai: [
            (v) => v.CL! / (Math.PI * v.AR!) / RAD,
            '{CL} ÷ (π × {AR}) × 180 ÷ π',
            'Divide C_L by πAR for radians, then turn it into degrees.',
          ],
          CL: [
            (v) => v.ai! * RAD * Math.PI * v.AR!,
            '{ai} × π ÷ 180 × π × {AR}',
            'Turn α_i into radians, then multiply by πAR.',
          ],
          AR: [
            (v) => div(v.CL!, Math.PI * v.ai! * RAD),
            '{CL} ÷ (π × {ai} × π ÷ 180)',
            'Turn α_i into radians, then divide C_L by π times it.',
          ],
        },
      ),
    ),
    example: { CL, AR, e, CDi: (CL * CL) / (Math.PI * e * AR), ai: CL / (Math.PI * AR) / RAD },
    startWith: ['CL', 'AR', 'e'],
    representation: {
      kind: 'wing',
      mode: 'planform',
      aspectRatio: 'AR',
      CL: 'CL',
      e: 'e',
      CDi: 'CDi',
      alphaI: 'ai',
    },
  });

const wingPlanform = finiteWing(
  'g.he-wing-planform',
  'Induced drag of a finite wing',
  'Use this for “A wing of aspect ratio 8 and span efficiency 0.9 flies at C_L = 0.6. Find C_Di and α_i.”',
  0.6,
  8,
  0.9,
);

const wingGlider = finiteWing(
  'g.he-wing-glider',
  'A glider’s long wing: little induced drag',
  'Use this for “A glider of aspect ratio 30 and e = 0.95 climbs in a thermal at C_L = 1.2. Find C_Di and α_i.”',
  1.2,
  30,
  0.95,
);

// ── HC24: the finite-wing lift slope (aerodynamics#2~lift-slope) ──

const wingLiftSlope = (() => {
  const [a0, AR, e] = [2 * Math.PI, 8, 0.9];
  const a = a0 / (1 + a0 / (Math.PI * e * AR));
  return demo(
    'g.he-wing-lift-slope',
    'A finite wing’s lift slope from the airfoil’s',
    'Use this for “An airfoil with a₀ = 2π per radian makes a wing of AR 8, e = 0.9. Find its lift slope a.”',
    {
      assumptions: [
        'Lifting-line theory; e near 1 for a near-elliptic lift distribution.',
        'Slopes are per radian; per degree is × π ÷ 180.',
      ],
      variables: [
        q('a0', 'a₀', 'Airfoil lift slope (per rad)', undefined, 1, 8, 0.0001),
        q('AR', 'AR', 'Aspect ratio', undefined, 1, 40, 0.01),
        q('e', 'e', 'Span efficiency', undefined, 0.5, 1, 0.01),
        q('a', 'a', 'Wing lift slope (per rad)', undefined, 0.1, 8, 0.0001),
        q('aDeg', 'a_deg', 'Wing lift slope (per degree)', undefined, 0.001, 0.15, 0.00001),
      ],
      ...rules(
        rule(
          'a = a₀ ÷ (1 + a₀ ÷ (πeAR))',
          '{a} = {a0} ÷ (1 + {a0} ÷ (π × {e} × {AR}))',
          (v) => v.a! * (1 + v.a0! / (Math.PI * v.e! * v.AR!)) - v.a0!,
          {
            a: [
              (v) => v.a0! / (1 + v.a0! / (Math.PI * v.e! * v.AR!)),
              '{a0} ÷ (1 + {a0} ÷ (π × {e} × {AR}))',
              'The downwash tilts the wind, so the wing needs more α for the same lift: a < a₀.',
            ],
            a0: [
              (v) => div(v.a!, 1 - v.a! / (Math.PI * v.e! * v.AR!)),
              '{a} ÷ (1 − {a} ÷ (π × {e} × {AR}))',
              'Clear the fraction: 1 ÷ a₀ = 1 ÷ a − 1 ÷ (πeAR).',
            ],
            AR: [
              (v) => div(v.a! * v.a0!, Math.PI * v.e! * (v.a0! - v.a!)),
              '{a} × {a0} ÷ (π × {e} × ({a0} − {a}))',
              'Clear the fraction and solve for AR.',
            ],
            e: null,
          },
        ),
        rule('a_deg = a × π ÷ 180', '{aDeg} = {a} × π ÷ 180', (v) => v.aDeg! - v.a! * RAD, {
          aDeg: [(v) => v.a! * RAD, '{a} × π ÷ 180', 'Per degree: multiply by π ÷ 180.'],
          a: [(v) => v.aDeg! / RAD, '{aDeg} × 180 ÷ π', 'Per radian: multiply by 180 ÷ π.'],
        }),
      ),
      example: { a0, AR, e, a, aDeg: a * RAD },
      startWith: ['a0', 'AR', 'e'],
      representation: {
        kind: 'wing',
        mode: 'planform',
        aspectRatio: 'AR',
        e: 'e',
        more: ['a0', 'a', 'aDeg'],
      } satisfies WingSpec,
    },
  );
})();

// ── HC24: a tapered planform (aerodynamics#2~aspect-ratio) ──

const wingTapered = (() => {
  const [b, cr, ct] = [12, 1.8, 0.9];
  const S = (b * (cr + ct)) / 2;
  return demo(
    'g.he-wing-tapered',
    'Aspect ratio and taper of a tapered wing',
    'Use this for “A wing spans 12 m with a 1.8 m root and 0.9 m tip chord. Find λ, S and AR.”',
    {
      assumptions: [
        'Straight taper: the chord changes evenly from root to tip.',
        'S is the planform area seen from above, including the part inside the fuselage.',
      ],
      variables: [
        q('b', 'b', 'Span', 'm', 0.1, 100, 0.01, { units: ['m'] }),
        q('cr', 'c_r', 'Root chord', 'm', 0.01, 30, 0.001, { units: ['m'] }),
        q('ct', 'c_t', 'Tip chord', 'm', 0, 30, 0.001, { units: ['m'] }),
        q('lam', 'λ', 'Taper ratio', undefined, 0, 1, 0.001),
        q('S', 'S', 'Wing area', 'm²', 0.01, 3000, 0.01, { units: ['m²'] }),
        q('AR', 'AR', 'Aspect ratio', undefined, 0.5, 50, 0.01),
      ],
      ...rules(
        rule('λ = c_t ÷ c_r', '{lam} = {ct} ÷ {cr}', (v) => v.lam! * v.cr! - v.ct!, {
          lam: [(v) => div(v.ct!, v.cr!), '{ct} ÷ {cr}', 'Tip chord over root chord.'],
          ct: [(v) => v.lam! * v.cr!, '{lam} × {cr}', 'Multiply the root chord by λ.'],
          cr: [(v) => div(v.ct!, v.lam!), '{ct} ÷ {lam}', 'Divide the tip chord by λ.'],
        }),
        rule(
          'S = b(c_r + c_t) ÷ 2',
          '{S} = {b} × ({cr} + {ct}) ÷ 2',
          (v) => v.S! - (v.b! * (v.cr! + v.ct!)) / 2,
          {
            S: [
              (v) => (v.b! * (v.cr! + v.ct!)) / 2,
              '{b} × ({cr} + {ct}) ÷ 2',
              'A trapezoid: the span times the mean chord.',
            ],
            b: [
              (v) => div(2 * v.S!, v.cr! + v.ct!),
              '2 × {S} ÷ ({cr} + {ct})',
              'Divide the area by the mean chord.',
            ],
            ct: [
              (v) => (v.b! === 0 ? undefined : (2 * v.S!) / v.b! - v.cr!),
              '2 × {S} ÷ {b} − {cr}',
              'Twice the mean chord, less the root chord.',
            ],
            cr: [
              (v) => (v.b! === 0 ? undefined : (2 * v.S!) / v.b! - v.ct!),
              '2 × {S} ÷ {b} − {ct}',
              'Twice the mean chord, less the tip chord.',
            ],
          },
        ),
        rule('AR = b² ÷ S', '{AR} = {b}² ÷ {S}', (v) => v.AR! * v.S! - v.b! ** 2, {
          AR: [(v) => div(v.b! ** 2, v.S!), '{b}² ÷ {S}', 'Span squared over area.'],
          b: [(v) => root(v.AR! * v.S!), '√({AR} × {S})', 'Multiply AR by S, then take the root.'],
          S: [(v) => div(v.b! ** 2, v.AR!), '{b}² ÷ {AR}', 'Span squared over AR.'],
        }),
      ),
      example: { b, cr, ct, lam: ct / cr, S, AR: (b * b) / S },
      startWith: ['b', 'cr', 'ct'],
      representation: {
        kind: 'wing',
        mode: 'planform',
        span: 'b',
        rootChord: 'cr',
        tipChord: 'ct',
        taper: 'lam',
        area: 'S',
        aspectRatio: 'AR',
      },
    },
  );
})();

export const HE2H_GALLERY_MODULES: ModuleDef[] = [
  wingSection,
  wingSymmetric,
  wingPressure,
  wingCirculation,
  wingNaca,
  wingForces,
  wingPlanform,
  wingGlider,
  wingLiftSlope,
  wingTapered,
];

export const HE2H_GALLERY_LAYOUTS: LayoutDef[] = [];
