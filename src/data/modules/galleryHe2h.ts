/**
 * College gallery demos, round 2, group H (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC24 `wing`: aerodynamics#0–#2 (docs/plans/he.aero-civil-chemical.md, P1). HC30 `duct`:
 * compressible-flow#0, #2 and propulsion#0~turbojet, #2 (P2). Constants as the
 * plan has them (air γ = 1.4, R = 287 J/(kg·K)); each picture takes them from the page.
 */
import {
  areaRatio,
  exhaustSpeed,
  machFromArea,
  normalShock,
} from '@/components/module/reps/aeroMath';

import { atLeast } from './helpers';
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

// ── HC30: compressible flow (compressible-flow#0, #2; propulsion#0~turbojet, #2) ──
// γ = 1.4 for air, as the plan fixes it; the steps write 0.2 for (γ − 1) ÷ 2 and 3.5 for γ ÷ (γ − 1).

/** Eight figures of a value, for the last round of a trial shown in a step. */
const fig8 = (x: number) => Number(x.toPrecision(8));

/** A ÷ A∗ at M for air, as a step writes it. */
const areaText = (M: string) => `(1 ÷ ${M}) × ((1 + 0.2 × ${M}²) ÷ 1.2)³`;
const areaOf = (M: number) => areaRatio(M, 1.4);

/** Kelvin only (no offset units in the ratios). */
const kelvin = (id: string, symbol: string, name: string) =>
  q(id, symbol, name, 'K', 1, 5000, 0.01, { units: ['K'] });
const kPaVar = (id: string, symbol: string, name: string, max = 1e6) =>
  q(id, symbol, name, 'kPa', 0.001, max, 0.001, { units: ['kPa'] });

const ASSUME_ISENTROPIC = [
  'Adiabatic and frictionless (isentropic), so p₀ and T₀ stay constant along the flow.',
  'Calorically perfect air, γ = 1.4: (γ − 1) ÷ 2 = 0.2 and γ ÷ (γ − 1) = 3.5.',
];

const stationDemo = (id: string, title: string, use: string, M: number, T: number, p: number) => {
  const t = 1 + 0.2 * M * M;
  return demo(id, title, use, {
    assumptions: ASSUME_ISENTROPIC,
    variables: [
      q('M', 'M', 'Mach number', undefined, 0.01, 10, 0.001),
      kelvin('T', 'T', 'Temperature'),
      kPaVar('p', 'p', 'Pressure'),
      kelvin('T0', 'T₀', 'Stagnation temperature'),
      kPaVar('p0', 'p₀', 'Stagnation pressure', 1e9),
      q('r0', 'ρ₀/ρ', 'Density ratio ρ₀ ÷ ρ', undefined, 1, 1e6, 0.0001),
    ],
    ...rules(
      rule(
        'T₀ = T(1 + 0.2M²)',
        '{T0} = {T} × (1 + 0.2 × {M}²)',
        (v) => v.T0! - v.T! * (1 + 0.2 * v.M! ** 2),
        {
          T0: [
            (v) => v.T! * (1 + 0.2 * v.M! ** 2),
            '{T} × (1 + 0.2 × {M}²)',
            'Bring the flow to rest: its kinetic energy heats it by the factor 1 + 0.2M².',
          ],
          T: [
            (v) => v.T0! / (1 + 0.2 * v.M! ** 2),
            '{T0} ÷ (1 + 0.2 × {M}²)',
            'Divide T₀ by 1 + 0.2M².',
          ],
          M: [
            (v) => root(5 * (v.T0! / v.T! - 1)),
            '√(5 × ({T0} ÷ {T} − 1))',
            'Take 1 from T₀ ÷ T, divide by 0.2, then take the root.',
          ],
        },
      ),
      rule(
        'p₀ = p(T₀ ÷ T)^3.5',
        '{p0} = {p} × ({T0} ÷ {T})^3.5',
        (v) => v.p0! - v.p! * (v.T0! / v.T!) ** 3.5,
        {
          p0: [
            (v) => v.p! * (v.T0! / v.T!) ** 3.5,
            '{p} × ({T0} ÷ {T})^3.5',
            'Isentropic: the pressure ratio is the temperature ratio to the power γ ÷ (γ − 1).',
          ],
          p: [
            (v) => v.p0! / (v.T0! / v.T!) ** 3.5,
            '{p0} ÷ ({T0} ÷ {T})^3.5',
            'Divide p₀ by the ratio to the 3.5.',
          ],
          T0: null,
          T: null,
        },
      ),
      rule(
        'ρ₀ ÷ ρ = (T₀ ÷ T)^2.5',
        '{r0} = ({T0} ÷ {T})^2.5',
        (v) => v.r0! - (v.T0! / v.T!) ** 2.5,
        {
          r0: [
            (v) => (v.T0! / v.T!) ** 2.5,
            '({T0} ÷ {T})^2.5',
            'The density ratio is the temperature ratio to the power 1 ÷ (γ − 1).',
          ],
          T0: null,
          T: null,
        },
      ),
    ),
    example: { M, T, p, T0: T * t, p0: p * t ** 3.5, r0: t ** 2.5 },
    startWith: ['M', 'T', 'p'],
    representation: {
      kind: 'duct',
      gamma: 1.4,
      M: 'M',
      T: 'T',
      p: 'p',
      T0: 'T0',
      p0: 'p0',
      more: ['r0'],
    },
  });
};

const ductStation = stationDemo(
  'g.he-duct-station',
  'Stagnation temperature and pressure at a Mach number',
  'Use this for “Air flows at M = 2 with T = 220 K and p = 20 kPa. Find T₀, p₀ and ρ₀/ρ.”',
  2,
  220,
  20,
);

const ductSubsonic = stationDemo(
  'g.he-duct-subsonic',
  'A subsonic station: the throat it would need',
  'Use this for “Air at sea level (288.15 K, 101.325 kPa) moves at M = 0.5. Find T₀ and p₀.”',
  0.5,
  288.15,
  101.325,
);

// ── HC30: the area–Mach relation (compressible-flow#0~area-mach) ──

const ductAreaMach = (() => {
  const M = 2;
  return demo(
    'g.he-duct-area-mach',
    'Area ratio A/A∗ at a Mach number, and back',
    'Use this for “What area ratio A/A∗ gives M = 2? And what M has A/A∗ = 1.6875?”',
    {
      assumptions: [
        ...ASSUME_ISENTROPIC,
        'Each A/A∗ above 1 has two answers, one subsonic and one supersonic: the side of the throat decides.',
      ],
      variables: [
        q('M', 'M', 'Mach number', undefined, 0.01, 10, 0.001),
        q('AR', 'A/A∗', 'Area ratio', undefined, 1, 1000, 0.0001),
      ],
      ...rules(
        rule(
          'A ÷ A∗ = (1 ÷ M)[(1 + 0.2M²) ÷ 1.2]³',
          `{AR} = ${areaText('{M}')}`,
          (v) => v.AR! - areaOf(v.M!),
          {
            AR: [
              (v) => areaOf(v.M!),
              areaText('{M}'),
              'The area–Mach relation, with (γ + 1) ÷ (2(γ − 1)) = 3 for air.',
            ],
            M: [
              (v) => {
                const sub = machFromArea(v.AR!, 1.4, 'sub');
                const sup = machFromArea(v.AR!, 1.4, 'super');
                return [sub, sup].filter((x): x is number => x !== undefined);
              },
              (v: Values) =>
                v.M! >= 1
                  ? `√(5 × (1.2 × ({AR} × ${fig8(v.M!)})^(1 ÷ 3) − 1))`
                  : `(1 ÷ {AR}) × ((1 + 0.2 × ${fig8(v.M!)}²) ÷ 1.2)³`,
              'M is on both sides: guess M, put it in on the right, and repeat until M stops changing. The last round is shown; the branch nearest the last M is kept.',
            ],
          },
        ),
      ),
      example: { M, AR: areaOf(M) },
      startWith: ['M'],
      representation: { kind: 'duct', gamma: 1.4, M: 'M', areaRatio: 'AR' },
    },
  );
})();

// ── HC30: choked mass flow (compressible-flow#0~choked) ──

const CHOKE = 0.6847;
const ductChoked = (() => {
  const [p0, T0, A] = [500, 500, 0.001];
  return demo(
    'g.he-duct-choked',
    'Choked mass flow through a throat',
    'Use this for “Air from a tank at 500 kPa and 500 K flows through a 0.001 m² throat at M = 1. Find ṁ.”',
    {
      assumptions: [
        'The throat is at M = 1, so lowering the back pressure further adds no flow.',
        'Air: γ = 1.4 (the factor 0.6847) and R = 287 J/(kg·K).',
      ],
      variables: [
        kPaVar('p0', 'p₀', 'Stagnation pressure'),
        kelvin('T0', 'T₀', 'Stagnation temperature'),
        q('A', 'A∗', 'Throat area', 'm²', 1e-6, 100, 0.000001, { units: ['m²'] }),
        q('m', 'ṁ', 'Mass flow', 'kg/s', 0, 1e7, 0.0001),
      ],
      ...rules(
        rule(
          'ṁ = 0.6847p₀A∗ ÷ √(RT₀)',
          '{m} = 0.6847 × {p0} × 1000 × {A} ÷ √(287 × {T0})',
          (v) => v.m! - (CHOKE * v.p0! * 1000 * v.A!) / Math.sqrt(287 * v.T0!),
          {
            m: [
              (v) => (CHOKE * v.p0! * 1000 * v.A!) / Math.sqrt(287 * v.T0!),
              '0.6847 × {p0} × 1000 × {A} ÷ √(287 × {T0})',
              'p₀ in pascals (× 1000), times the throat area and 0.6847, over √(RT₀).',
            ],
            p0: [
              (v) => (v.m! * Math.sqrt(287 * v.T0!)) / (CHOKE * 1000 * v.A!),
              '{m} × √(287 × {T0}) ÷ (0.6847 × 1000 × {A})',
              'Multiply ṁ by √(RT₀), then divide by 0.6847A∗ (and 1000 for kPa).',
            ],
            A: [
              (v) => (v.m! * Math.sqrt(287 * v.T0!)) / (CHOKE * 1000 * v.p0!),
              '{m} × √(287 × {T0}) ÷ (0.6847 × {p0} × 1000)',
              'Multiply ṁ by √(RT₀), then divide by 0.6847p₀.',
            ],
            T0: [
              (v) => ((CHOKE * v.p0! * 1000 * v.A!) / v.m!) ** 2 / 287,
              '(0.6847 × {p0} × 1000 × {A} ÷ {m})² ÷ 287',
              'Square 0.6847p₀A∗ ÷ ṁ, then divide by R.',
            ],
          },
        ),
      ),
      example: { p0, T0, A, m: (CHOKE * p0 * 1000 * A) / Math.sqrt(287 * T0) },
      startWith: ['p0', 'T0', 'A'],
      representation: {
        kind: 'duct',
        gamma: 1.4,
        choked: true,
        M: 1,
        p0: 'p0',
        T0: 'T0',
        throatArea: 'A',
        mdot: 'm',
      },
    },
  );
})();

// ── HC30: a nozzle at its design point (compressible-flow#2 main), and a big expansion ──

const nozzleDemo = (
  id: string,
  title: string,
  use: string,
  p0: number,
  T0: number,
  At: number,
  AeAt: number,
) => {
  const Me = machFromArea(AeAt, 1.4, 'super')!;
  const t = 1 + 0.2 * Me * Me;
  return demo(id, title, use, {
    assumptions: [
      ...ASSUME_ISENTROPIC,
      'The design (shock-free) solution: the back pressure equals p_e and the exit is supersonic.',
    ],
    variables: [
      kPaVar('p0', 'p₀', 'Stagnation pressure'),
      kelvin('T0', 'T₀', 'Stagnation temperature'),
      q('At', 'A_t', 'Throat area', 'm²', 1e-6, 100, 0.000001, { units: ['m²'] }),
      q('AeAt', 'A_e/A_t', 'Exit-to-throat area ratio', undefined, 1, 1000, 0.0001),
      q('Me', 'M_e', 'Exit Mach number', undefined, 1, 10, 0.001),
      kPaVar('pe', 'p_e', 'Exit pressure'),
      kelvin('Te', 'T_e', 'Exit temperature'),
      q('m', 'ṁ', 'Mass flow', 'kg/s', 0, 1e7, 0.0001),
    ],
    ...rules(
      rule('A_e ÷ A_t at M_e', `{AeAt} = ${areaText('{Me}')}`, (v) => v.AeAt! - areaOf(v.Me!), {
        AeAt: [
          (v) => areaOf(v.Me!),
          areaText('{Me}'),
          'The area–Mach relation at the exit, where A∗ is the throat.',
        ],
        Me: [
          (v) => machFromArea(v.AeAt!, 1.4, 'super'),
          (v: Values) => `√(5 × (1.2 × ({AeAt} × ${fig8(v.Me!)})^(1 ÷ 3) − 1))`,
          'Supersonic branch, M on both sides: guess M = 2, put it in on the right, and repeat until it settles. The last round is shown.',
        ],
      }),
      rule(
        'p_e = p₀ ÷ (1 + 0.2M_e²)^3.5',
        '{pe} = {p0} ÷ (1 + 0.2 × {Me}²)^3.5',
        (v) => v.pe! - v.p0! / (1 + 0.2 * v.Me! ** 2) ** 3.5,
        {
          pe: [
            (v) => v.p0! / (1 + 0.2 * v.Me! ** 2) ** 3.5,
            '{p0} ÷ (1 + 0.2 × {Me}²)^3.5',
            'The isentropic pressure ratio at the exit Mach number.',
          ],
          p0: [
            (v) => v.pe! * (1 + 0.2 * v.Me! ** 2) ** 3.5,
            '{pe} × (1 + 0.2 × {Me}²)^3.5',
            'Multiply p_e by the ratio.',
          ],
          Me: null,
        },
      ),
      rule(
        'T_e = T₀ ÷ (1 + 0.2M_e²)',
        '{Te} = {T0} ÷ (1 + 0.2 × {Me}²)',
        (v) => v.Te! - v.T0! / (1 + 0.2 * v.Me! ** 2),
        {
          Te: [
            (v) => v.T0! / (1 + 0.2 * v.Me! ** 2),
            '{T0} ÷ (1 + 0.2 × {Me}²)',
            'The isentropic temperature ratio at the exit.',
          ],
          T0: [
            (v) => v.Te! * (1 + 0.2 * v.Me! ** 2),
            '{Te} × (1 + 0.2 × {Me}²)',
            'Multiply T_e by the ratio.',
          ],
          Me: [
            (v) => root(5 * (v.T0! / v.Te! - 1)),
            '√(5 × ({T0} ÷ {Te} − 1))',
            'Take 1 from T₀ ÷ T_e, divide by 0.2, then take the root.',
          ],
        },
      ),
      rule(
        'ṁ = 0.6847p₀A_t ÷ √(RT₀)',
        '{m} = 0.6847 × {p0} × 1000 × {At} ÷ √(287 × {T0})',
        (v) => v.m! - (CHOKE * v.p0! * 1000 * v.At!) / Math.sqrt(287 * v.T0!),
        {
          m: [
            (v) => (CHOKE * v.p0! * 1000 * v.At!) / Math.sqrt(287 * v.T0!),
            '0.6847 × {p0} × 1000 × {At} ÷ √(287 × {T0})',
            'The throat is choked: p₀ in pascals times A_t and 0.6847, over √(RT₀).',
          ],
          At: [
            (v) => (v.m! * Math.sqrt(287 * v.T0!)) / (CHOKE * 1000 * v.p0!),
            '{m} × √(287 × {T0}) ÷ (0.6847 × {p0} × 1000)',
            'Multiply ṁ by √(RT₀), then divide by 0.6847p₀.',
          ],
          p0: null,
          T0: null,
        },
      ),
    ),
    example: {
      p0,
      T0,
      At,
      AeAt,
      Me,
      pe: p0 / t ** 3.5,
      Te: T0 / t,
      m: (CHOKE * p0 * 1000 * At) / Math.sqrt(287 * T0),
    },
    startWith: ['p0', 'T0', 'At', 'AeAt'],
    representation: {
      kind: 'duct',
      mode: 'nozzle',
      gamma: 1.4,
      axis: true,
      p0: 'p0',
      T0: 'T0',
      throatArea: 'At',
      mdot: 'm',
      areaRatio: 'AeAt',
      Me: 'Me',
      pe: 'pe',
      Te: 'Te',
    },
  });
};

const ductNozzle = nozzleDemo(
  'g.he-duct-nozzle',
  'A converging–diverging nozzle at its design point',
  'Use this for “A nozzle with A_e/A_t = 1.6875 runs from 1000 kPa and 600 K through a 0.002 m² throat. Find M_e, p_e, T_e and ṁ.”',
  1000,
  600,
  0.002,
  1.6875,
);

const ductHypersonic = nozzleDemo(
  'g.he-duct-hypersonic',
  'A large expansion: A_e/A_t = 25',
  'Use this for “A wind-tunnel nozzle expands from 2000 kPa and 1500 K to 25 times its 0.001 m² throat. Find M_e, p_e and T_e.”',
  2000,
  1500,
  0.001,
  25,
);

// ── HC30: a normal shock standing in the diverging part (the `shock` option) ──

const shockRatio = (M1: number) => normalShock(M1, 1.4).p0;
const ductShock = (() => {
  const [AeAt, AsAt] = [2, 1.5];
  const M1 = machFromArea(AsAt, 1.4, 'super')!;
  const M2 = normalShock(M1, 1.4).M2;
  const r = shockRatio(M1);
  const Me = machFromArea(AeAt * r, 1.4, 'sub')!;
  return demo(
    'g.he-duct-shock',
    'A normal shock inside a nozzle',
    'Use this for “A nozzle with A_e/A_t = 2 has a normal shock where A/A_t = 1.5. Find M before and after it, the exit Mach number and p_e/p₀₁.”',
    {
      assumptions: [
        ...ASSUME_ISENTROPIC.slice(1),
        'Isentropic except across the thin shock; T₀ is the same both sides, p₀ falls.',
        'Behind the shock the flow is subsonic, with a new sonic area A∗₂ = A_t ÷ (p₀₂ ÷ p₀₁).',
      ],
      variables: [
        q('AeAt', 'A_e/A_t', 'Exit-to-throat area ratio', undefined, 1.001, 100, 0.0001),
        q('AsAt', 'A_s/A_t', 'Area ratio at the shock', undefined, 1.0001, 100, 0.0001),
        q('M1', 'M₁', 'Mach number before the shock', undefined, 1, 10, 0.001),
        q('M2', 'M₂', 'Mach number after the shock', undefined, 0.3, 1, 0.001),
        q('r', 'p₀₂/p₀₁', 'Stagnation pressure ratio', undefined, 0.001, 1, 0.0001),
        q('Me', 'M_e', 'Exit Mach number', undefined, 0.01, 1, 0.001),
        q('per', 'p_e/p₀₁', 'Exit pressure over p₀₁', undefined, 0.001, 1, 0.0001),
      ],
      ...rules(
        {
          relation: {
            ...atLeast('AeAt', 'AsAt'),
            message: (v: Values) =>
              v.AeAt! >= v.AsAt!
                ? undefined
                : 'The shock must stand inside the nozzle, before its exit.',
          },
          steps: {},
        },
        rule('A_s ÷ A_t at M₁', `{AsAt} = ${areaText('{M1}')}`, (v) => v.AsAt! - areaOf(v.M1!), {
          AsAt: [
            (v) => areaOf(v.M1!),
            areaText('{M1}'),
            'The area–Mach relation where the shock stands (supersonic, A∗ the throat).',
          ],
          M1: [
            (v) => machFromArea(v.AsAt!, 1.4, 'super'),
            (v: Values) => `√(5 × (1.2 × ({AsAt} × ${fig8(v.M1!)})^(1 ÷ 3) − 1))`,
            'Supersonic branch, M on both sides: repeat until M settles. The last round is shown.',
          ],
        }),
        rule(
          'M₂² = (1 + 0.2M₁²) ÷ (1.4M₁² − 0.2)',
          '{M2} = √((1 + 0.2 × {M1}²) ÷ (1.4 × {M1}² − 0.2))',
          (v) => v.M2! ** 2 * (1.4 * v.M1! ** 2 - 0.2) - (1 + 0.2 * v.M1! ** 2),
          {
            M2: [
              (v) => root((1 + 0.2 * v.M1! ** 2) / (1.4 * v.M1! ** 2 - 0.2)),
              '√((1 + 0.2 × {M1}²) ÷ (1.4 × {M1}² − 0.2))',
              'The normal-shock relation: supersonic in, subsonic out.',
            ],
            M1: [
              (v) => root((1 + 0.2 * v.M2! ** 2) / (1.4 * v.M2! ** 2 - 0.2)),
              '√((1 + 0.2 × {M2}²) ÷ (1.4 × {M2}² − 0.2))',
              'The relation reads the same either way round.',
            ],
          },
        ),
        rule(
          'p₀₂ ÷ p₀₁ across the shock',
          '{r} = (2.4 × {M1}² ÷ (0.4 × {M1}² + 2))^3.5 × (2.4 ÷ (2.8 × {M1}² − 0.4))^2.5',
          (v) => v.r! - shockRatio(v.M1!),
          {
            r: [
              (v) => shockRatio(v.M1!),
              '(2.4 × {M1}² ÷ (0.4 × {M1}² + 2))^3.5 × (2.4 ÷ (2.8 × {M1}² − 0.4))^2.5',
              'The stagnation-pressure ratio of a normal shock: entropy rises, so p₀ falls.',
            ],
            M1: null,
          },
        ),
        rule(
          'A_e ÷ A∗₂ = (A_e ÷ A_t)(p₀₂ ÷ p₀₁) at M_e',
          `{AeAt} × {r} = ${areaText('{Me}')}`,
          (v) => v.AeAt! * v.r! - areaOf(v.Me!),
          {
            Me: [
              (v) => machFromArea(v.AeAt! * v.r!, 1.4, 'sub'),
              (v: Values) => `(1 ÷ ({AeAt} × {r})) × ((1 + 0.2 × ${fig8(v.Me!)}²) ÷ 1.2)³`,
              'Behind the shock A∗ grows by p₀₁ ÷ p₀₂; on the subsonic branch M is on both sides, so repeat until it settles. The last round is shown.',
            ],
            AeAt: [
              (v) => areaOf(v.Me!) / v.r!,
              `${areaText('{Me}')} ÷ {r}`,
              'The exit’s A ÷ A∗₂, divided by p₀₂ ÷ p₀₁.',
            ],
            r: [
              (v) => areaOf(v.Me!) / v.AeAt!,
              `${areaText('{Me}')} ÷ {AeAt}`,
              'The exit’s A ÷ A∗₂ over A_e ÷ A_t.',
            ],
          },
        ),
        rule(
          'p_e ÷ p₀₁ = (p₀₂ ÷ p₀₁) ÷ (1 + 0.2M_e²)^3.5',
          '{per} = {r} ÷ (1 + 0.2 × {Me}²)^3.5',
          (v) => v.per! - v.r! / (1 + 0.2 * v.Me! ** 2) ** 3.5,
          {
            per: [
              (v) => v.r! / (1 + 0.2 * v.Me! ** 2) ** 3.5,
              '{r} ÷ (1 + 0.2 × {Me}²)^3.5',
              'Isentropic from the shock to the exit, from the new p₀₂.',
            ],
            r: [
              (v) => v.per! * (1 + 0.2 * v.Me! ** 2) ** 3.5,
              '{per} × (1 + 0.2 × {Me}²)^3.5',
              'Multiply by the isentropic ratio.',
            ],
            Me: null,
          },
        ),
      ),
      example: { AeAt, AsAt, M1, M2, r, Me, per: r / (1 + 0.2 * Me * Me) ** 3.5 },
      startWith: ['AeAt', 'AsAt'],
      representation: {
        kind: 'duct',
        mode: 'nozzle',
        gamma: 1.4,
        axis: true,
        areaRatio: 'AeAt',
        shockAt: 'AsAt',
        shockM1: 'M1',
        shockM2: 'M2',
        Me: 'Me',
        more: ['r', 'per'],
      },
    },
  );
})();

// ── HC30: a turbojet's thrust (propulsion#0~turbojet) ──

const ductTurbojet = (() => {
  const [m, V0, Ve, mf] = [50, 250, 600, 0.9];
  const F = m * (Ve - V0);
  return demo(
    'g.he-duct-turbojet',
    'Turbojet thrust, TSFC and propulsive efficiency',
    'Use this for “A turbojet takes 50 kg/s of air at 250 m/s and jets it at 600 m/s, burning 0.9 kg/s of fuel. Find F, TSFC and η_p.”',
    {
      assumptions: [
        'Exit pressure matched to the ambient, so there is no pressure thrust.',
        'The fuel’s mass is small beside the air’s and is left out of the momentum.',
      ],
      variables: [
        q('m', 'ṁ', 'Air mass flow', 'kg/s', 0.01, 5000, 0.01),
        q('V0', 'V₀', 'Flight speed', 'm/s', 1, 1500, 0.1, { units: ['m/s'] }),
        q('Ve', 'V_e', 'Jet speed', 'm/s', 1, 3000, 0.1, { units: ['m/s'] }),
        q('F', 'F', 'Thrust', 'N', 0, 1e8, 1, { units: ['N', 'kN'], shownIn: 'kN' }),
        q('mf', 'ṁ_f', 'Fuel flow', 'kg/s', 0.0001, 100, 0.0001),
        q('TSFC', 'TSFC', 'Thrust-specific fuel consumption', 'kg/(N·s)', 0, 1, 1e-8, {
          scientific: true,
        }),
        q('eta', 'η_p', 'Propulsive efficiency', '%', 0, 100, 0.01),
      ],
      ...rules(
        rule('F = ṁ(V_e − V₀)', '{F} = {m} × ({Ve} − {V0})', (v) => v.F! - v.m! * (v.Ve! - v.V0!), {
          F: [
            (v) => v.m! * (v.Ve! - v.V0!),
            '{m} × ({Ve} − {V0})',
            'The momentum the engine adds to each second’s air.',
          ],
          m: [
            (v) => div(v.F!, v.Ve! - v.V0!),
            '{F} ÷ ({Ve} − {V0})',
            'Divide the thrust by the speed gained.',
          ],
          Ve: [
            (v) => v.V0! + v.F! / v.m!,
            '{V0} + {F} ÷ {m}',
            'Add the speed gained, F ÷ ṁ, to V₀.',
          ],
          V0: [
            (v) => v.Ve! - v.F! / v.m!,
            '{Ve} − {F} ÷ {m}',
            'Take the speed gained, F ÷ ṁ, from V_e.',
          ],
        }),
        rule('TSFC = ṁ_f ÷ F', '{TSFC} = {mf} ÷ {F}', (v) => v.TSFC! * v.F! - v.mf!, {
          TSFC: [
            (v) => div(v.mf!, v.F!),
            '{mf} ÷ {F}',
            'Fuel burned each second per newton of thrust.',
          ],
          mf: [(v) => v.TSFC! * v.F!, '{TSFC} × {F}', 'Multiply TSFC by the thrust.'],
          F: [(v) => div(v.mf!, v.TSFC!), '{mf} ÷ {TSFC}', 'Divide the fuel flow by TSFC.'],
        }),
        rule(
          'η_p = 2 ÷ (1 + V_e ÷ V₀)',
          '{eta} = 200 ÷ (1 + {Ve} ÷ {V0})',
          (v) => v.eta! * (1 + v.Ve! / v.V0!) - 200,
          {
            eta: [
              (v) => 200 / (1 + v.Ve! / v.V0!),
              '200 ÷ (1 + {Ve} ÷ {V0})',
              'Thrust power over the jet’s gain in kinetic energy, as a percent.',
            ],
            Ve: [
              (v) => div(v.V0! * (200 - v.eta!), v.eta!),
              '{V0} × (200 − {eta}) ÷ {eta}',
              'Solve 1 + V_e ÷ V₀ = 200 ÷ η_p for V_e.',
            ],
            V0: [
              (v) => div(v.Ve! * v.eta!, 200 - v.eta!),
              '{Ve} × {eta} ÷ (200 − {eta})',
              'Solve 1 + V_e ÷ V₀ = 200 ÷ η_p for V₀.',
            ],
          },
        ),
      ),
      example: { m, V0, Ve, F, mf, TSFC: mf / F, eta: 200 / (1 + Ve / V0) },
      startWith: ['m', 'V0', 'Ve', 'mf'],
      representation: {
        kind: 'duct',
        mode: 'engine',
        mdot: 'm',
        V0: 'V0',
        Ve: 'Ve',
        thrust: 'F',
        fuel: 'mf',
        more: ['TSFC', 'eta'],
      },
    },
  );
})();

// ── HC30: rocket thrust from C_F and c∗ (propulsion#2 main) ──

const G0 = 9.81;
const ductChamber = (() => {
  const [pc, At, CF, cs] = [7000, 0.05, 1.6, 1600];
  return demo(
    'g.he-duct-chamber',
    'Rocket thrust from C_F, chamber pressure and throat area',
    'Use this for “A rocket chamber at 7 MPa feeds a 0.05 m² throat; C_F = 1.6 and c∗ = 1600 m/s. Find F, ṁ and I_sp.”',
    {
      assumptions: [
        'C_F holds the nozzle’s expansion and the ambient pressure; c∗ holds the propellant and its combustion.',
        'g = 9.81 m/s² defines I_sp.',
      ],
      variables: [
        kPaVar('pc', 'p_c', 'Chamber pressure'),
        q('At', 'A_t', 'Throat area', 'm²', 1e-6, 100, 0.000001, { units: ['m²'] }),
        q('CF', 'C_F', 'Thrust coefficient', undefined, 0.5, 2.5, 0.001),
        q('cs', 'c∗', 'Characteristic velocity', 'm/s', 100, 5000, 0.1, { units: ['m/s'] }),
        q('F', 'F', 'Thrust', 'N', 0, 1e10, 1, { units: ['N', 'kN'], shownIn: 'kN' }),
        q('m', 'ṁ', 'Mass flow', 'kg/s', 0, 1e7, 0.001),
        q('Isp', 'I_sp', 'Specific impulse', 's', 1, 1000, 0.01, { units: ['s'] }),
      ],
      ...rules(
        rule(
          'F = C_Fp_cA_t',
          '{F} = {CF} × {pc} × 1000 × {At}',
          (v) => v.F! - v.CF! * v.pc! * 1000 * v.At!,
          {
            F: [
              (v) => v.CF! * v.pc! * 1000 * v.At!,
              '{CF} × {pc} × 1000 × {At}',
              'p_c in pascals (× 1000) on the throat, times the thrust coefficient.',
            ],
            CF: [
              (v) => div(v.F!, v.pc! * 1000 * v.At!),
              '{F} ÷ ({pc} × 1000 × {At})',
              'Divide the thrust by p_cA_t.',
            ],
            pc: [
              (v) => div(v.F!, v.CF! * 1000 * v.At!),
              '{F} ÷ ({CF} × 1000 × {At})',
              'Divide the thrust by C_FA_t (and 1000 for kPa).',
            ],
            At: [
              (v) => div(v.F!, v.CF! * v.pc! * 1000),
              '{F} ÷ ({CF} × {pc} × 1000)',
              'Divide the thrust by C_Fp_c.',
            ],
          },
        ),
        rule(
          'ṁ = p_cA_t ÷ c∗',
          '{m} = {pc} × 1000 × {At} ÷ {cs}',
          (v) => v.m! * v.cs! - v.pc! * 1000 * v.At!,
          {
            m: [
              (v) => div(v.pc! * 1000 * v.At!, v.cs!),
              '{pc} × 1000 × {At} ÷ {cs}',
              'p_cA_t over the characteristic velocity.',
            ],
            cs: [
              (v) => div(v.pc! * 1000 * v.At!, v.m!),
              '{pc} × 1000 × {At} ÷ {m}',
              'p_cA_t over the mass flow.',
            ],
            pc: null,
            At: null,
          },
        ),
        rule('I_sp = C_Fc∗ ÷ g', '{Isp} = {CF} × {cs} ÷ 9.81', (v) => v.Isp! * G0 - v.CF! * v.cs!, {
          Isp: [
            (v) => (v.CF! * v.cs!) / G0,
            '{CF} × {cs} ÷ 9.81',
            'The exhaust’s effective speed C_Fc∗, in seconds of g.',
          ],
          CF: [
            (v) => div(v.Isp! * G0, v.cs!),
            '{Isp} × 9.81 ÷ {cs}',
            'Multiply I_sp by g, then divide by c∗.',
          ],
          cs: [
            (v) => div(v.Isp! * G0, v.CF!),
            '{Isp} × 9.81 ÷ {CF}',
            'Multiply I_sp by g, then divide by C_F.',
          ],
        }),
      ),
      example: {
        pc,
        At,
        CF,
        cs,
        F: CF * pc * 1000 * At,
        m: (pc * 1000 * At) / cs,
        Isp: (CF * cs) / G0,
      },
      startWith: ['pc', 'At', 'CF', 'cs'],
      representation: {
        kind: 'duct',
        mode: 'nozzle',
        chamber: true,
        p0: 'pc',
        throatArea: 'At',
        mdot: 'm',
        thrust: 'F',
        more: ['CF', 'cs', 'Isp'],
      },
    },
  );
})();

// ── HC30: ideal exhaust speed (propulsion#2~exhaust-velocity); γ is the page's ──

const exhaustOf = (g: number, R: number, Tc: number, pr: number) => exhaustSpeed(g, R, Tc, pr);
const ductExhaust = (() => {
  const [g, R, Tc, pr] = [1.2, 350, 3200, 0.01];
  return demo(
    'g.he-duct-exhaust',
    'Ideal exhaust speed from the chamber state',
    'Use this for “Gas with γ = 1.2 and R = 350 J/(kg·K) leaves a 3200 K chamber, expanding to 1% of the chamber pressure. Find v_e.”',
    {
      assumptions: [
        'Isentropic expansion of a perfect gas with constant γ from rest in the chamber.',
        'The nozzle is drawn to the exit Mach number that p_e ÷ p_c gives at this γ.',
      ],
      variables: [
        q('g', 'γ', 'Ratio of specific heats', undefined, 1.05, 1.67, 0.001),
        q('R', 'R', 'Gas constant', 'J/(kg·K)', 100, 5000, 0.1),
        kelvin('Tc', 'T_c', 'Chamber temperature'),
        q('pr', 'p_e/p_c', 'Exit-to-chamber pressure ratio', undefined, 0.00001, 0.99, 0.00001),
        q('ve', 'v_e', 'Exhaust speed', 'm/s', 0, 10000, 0.1, { units: ['m/s'] }),
      ],
      ...rules(
        rule(
          'v_e = √((2γRT_c ÷ (γ − 1))(1 − (p_e ÷ p_c)^((γ − 1) ÷ γ)))',
          '{ve} = √(2 × {g} × {R} × {Tc} ÷ ({g} − 1) × (1 − {pr}^(({g} − 1) ÷ {g})))',
          (v) => v.ve! - exhaustOf(v.g!, v.R!, v.Tc!, v.pr!),
          {
            ve: [
              (v) => exhaustOf(v.g!, v.R!, v.Tc!, v.pr!),
              '√(2 × {g} × {R} × {Tc} ÷ ({g} − 1) × (1 − {pr}^(({g} − 1) ÷ {g})))',
              'The chamber’s enthalpy, less what is left at p_e, turns into kinetic energy.',
            ],
            Tc: [
              (v) =>
                (v.ve! ** 2 * (v.g! - 1)) / (2 * v.g! * v.R! * (1 - v.pr! ** ((v.g! - 1) / v.g!))),
              '{ve}² × ({g} − 1) ÷ (2 × {g} × {R} × (1 − {pr}^(({g} − 1) ÷ {g})))',
              'Square v_e and solve for T_c.',
            ],
            R: [
              (v) =>
                (v.ve! ** 2 * (v.g! - 1)) / (2 * v.g! * v.Tc! * (1 - v.pr! ** ((v.g! - 1) / v.g!))),
              '{ve}² × ({g} − 1) ÷ (2 × {g} × {Tc} × (1 − {pr}^(({g} − 1) ÷ {g})))',
              'Square v_e and solve for R.',
            ],
            pr: [
              (v) => {
                const k = 1 - (v.ve! ** 2 * (v.g! - 1)) / (2 * v.g! * v.R! * v.Tc!);
                return k <= 0 ? undefined : k ** (v.g! / (v.g! - 1));
              },
              '(1 − {ve}² × ({g} − 1) ÷ (2 × {g} × {R} × {Tc}))^({g} ÷ ({g} − 1))',
              'Square v_e, take its share of 2γRT_c ÷ (γ − 1) from 1, then raise to γ ÷ (γ − 1).',
            ],
            g: null,
          },
        ),
      ),
      example: { g, R, Tc, pr, ve: exhaustOf(g, R, Tc, pr) },
      startWith: ['g', 'R', 'Tc', 'pr'],
      representation: {
        kind: 'duct',
        mode: 'nozzle',
        chamber: true,
        gamma: 'g',
        T0: 'Tc',
        pressureRatio: 'pr',
        exhaust: 've',
        more: ['R', 'pr'],
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
  ductStation,
  ductSubsonic,
  ductAreaMach,
  ductChoked,
  ductNozzle,
  ductHypersonic,
  ductShock,
  ductTurbojet,
  ductChamber,
  ductExhaust,
];

export const HE2H_GALLERY_LAYOUTS: LayoutDef[] = [];
