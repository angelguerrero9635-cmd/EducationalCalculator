/**
 * College gallery demos, round 2, group A (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC14: `complexPlane` on electrical pages (impedance with j, phasors, poles, the root locus).
 * HC22: `bode`.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

type Solver = (v: Values) => number | number[] | undefined;
type Rule = { relation: Relation; steps: Record<string, StepText> };

/** A finite value, or nothing. */
const fin = (x: number) => (Number.isFinite(x) ? x : undefined);
const div = (a: number, b: number) => (b === 0 ? undefined : fin(a / b));
const RAD = Math.PI / 180;
const SQ3 = Math.sqrt(3);

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

/** x = a × b, solved any way. */
const product = (id: string, x: string, a: string, b: string, hows: [string, string, string]) =>
  rule(id, `{${x}} = {${a}} × {${b}}`, [x, a, b], (v) => v[x]! - v[a]! * v[b]!, {
    [x]: [(v) => v[a]! * v[b]!, `{${a}} × {${b}}`, hows[0]],
    [a]: [(v) => div(v[x]!, v[b]!), `{${x}} ÷ {${b}}`, hows[1]],
    [b]: [(v) => div(v[x]!, v[a]!), `{${x}} ÷ {${a}}`, hows[2]],
  });

/** x = a ÷ b, solved any way. */
const quotient = (id: string, x: string, a: string, b: string, hows: [string, string, string]) =>
  rule(id, `{${x}} = {${a}} ÷ {${b}}`, [x, a, b], (v) => v[x]! * v[b]! - v[a]!, {
    [x]: [(v) => div(v[a]!, v[b]!), `{${a}} ÷ {${b}}`, hows[0]],
    [a]: [(v) => v[x]! * v[b]!, `{${x}} × {${b}}`, hows[1]],
    [b]: [(v) => div(v[a]!, v[x]!), `{${a}} ÷ {${x}}`, hows[2]],
  });

// ── HC14: an impedance by its parts (circuits-2#0) ──

/** circuits-2#0 main: a series RLC circuit's impedance and current. */
function seriesRlc(id: string, title: string, use: string, ex: Values): ModuleDef {
  const XL = (ex.w! * ex.L!) / 1000;
  const XC = 1e6 / (ex.w! * ex.C!);
  const X = XL - XC;
  const Z = Math.hypot(ex.R!, X);
  return page({
    id,
    title,
    use,
    assumptions: [
      'j² = −1 and Z = R + j(X_L − X_C): the inductor’s reactance points up, the capacitor’s down.',
      'Steady state: every voltage and current is a sine at the source’s frequency.',
      'The current lags the voltage by θ (leads it when θ < 0).',
    ],
    variables: [
      num('V', 'V', 'Source amplitude', 'V', 0.001, 100000, { step: 1 }),
      num('w', 'ω', 'Angular frequency', 'rad/s', 1, 1e9, { step: 10 }),
      num('R', 'R', 'Resistance', 'Ω', 0.01, 1e6, { step: 1 }),
      num('L', 'L', 'Inductance', 'mH', 0.001, 1e6, { step: 1 }),
      num('C', 'C', 'Capacitance', 'μF', 0.001, 1e6, { step: 1 }),
      num('XL', 'X_L', 'Inductive reactance', 'Ω', 0, 1e12),
      num('XC', 'X_C', 'Capacitive reactance', 'Ω', 0, 1e12),
      num('X', 'X', 'Net reactance', 'Ω', -1e12, 1e12),
      num('Z', '|Z|', 'Impedance magnitude', 'Ω', 0.01, 1e12),
      num('theta', 'θ', 'Impedance angle', '°', -89.9, 89.9),
      num('I', 'I', 'Current amplitude', 'A', 0, 1e7),
    ],
    rules: [
      rule(
        'X_L = ωL',
        '{XL} = {w} × {L} ÷ 1000',
        ['XL', 'w', 'L'],
        (v) => v.XL! * 1000 - v.w! * v.L!,
        {
          XL: [
            (v) => (v.w! * v.L!) / 1000,
            '{w} × {L} ÷ 1000',
            'Multiply ω by L; L in mH is L ÷ 1000 in H.',
          ],
          L: [
            (v) => div(v.XL! * 1000, v.w!),
            '{XL} × 1000 ÷ {w}',
            'Divide the reactance by ω, then turn H into mH.',
          ],
          w: [
            (v) => div(v.XL! * 1000, v.L!),
            '{XL} × 1000 ÷ {L}',
            'Divide the reactance by L in H.',
          ],
        },
      ),
      rule(
        'X_C = 1/(ωC)',
        '{XC} = 1000000 ÷ ({w} × {C})',
        ['XC', 'w', 'C'],
        (v) => v.XC! * v.w! * v.C! - 1e6,
        {
          XC: [
            (v) => div(1e6, v.w! * v.C!),
            '1000000 ÷ ({w} × {C})',
            'One over ωC; C in μF is C ÷ 1,000,000 in F.',
          ],
          C: [(v) => div(1e6, v.w! * v.XC!), '1000000 ÷ ({w} × {XC})', 'One over ωX_C, in μF.'],
          w: [(v) => div(1e6, v.C! * v.XC!), '1000000 ÷ ({C} × {XC})', 'One over C X_C.'],
        },
      ),
      rule('X = X_L − X_C', '{X} = {XL} − {XC}', ['X', 'XL', 'XC'], (v) => v.X! - v.XL! + v.XC!, {
        X: [
          (v) => v.XL! - v.XC!,
          '{XL} − {XC}',
          'The two reactances point opposite ways: subtract.',
        ],
        XL: [(v) => v.X! + v.XC!, '{X} + {XC}', 'Add X_C back.'],
        XC: [(v) => v.XL! - v.X!, '{XL} − {X}', 'Take the net reactance from X_L.'],
      }),
      rule(
        '|Z| = √(R² + X²)',
        '{Z} = √({R}² + {X}²)',
        ['Z', 'R', 'X'],
        (v) => v.Z! ** 2 - v.R! ** 2 - v.X! ** 2,
        {
          Z: [
            (v) => Math.hypot(v.R!, v.X!),
            '√({R}² + {X}²)',
            'R and X are at right angles: Pythagoras gives the length.',
          ],
          R: [
            (v) => (v.Z! >= Math.abs(v.X!) ? Math.sqrt(v.Z! ** 2 - v.X! ** 2) : undefined),
            '√({Z}² − {X}²)',
            'Take X² from |Z|².',
          ],
        },
      ),
      rule(
        'θ = tan⁻¹(X/R)',
        '{theta} = tan⁻¹({X} ÷ {R})',
        ['theta', 'X', 'R'],
        (v) => Math.tan(v.theta! * RAD) * v.R! - v.X!,
        {
          theta: [
            (v) => fin(Math.atan(v.X! / v.R!) / RAD),
            'tan⁻¹({X} ÷ {R})',
            'The angle whose tangent is X over R.',
          ],
          X: [
            (v) => (Math.abs(v.theta!) < 89.95 ? v.R! * Math.tan(v.theta! * RAD) : undefined),
            '{R} × tan({theta}°)',
            'Rise over run: X = R tan θ.',
          ],
        },
      ),
      quotient('I = V/|Z|', 'I', 'V', 'Z', [
        'Ohm’s law with the impedance’s size.',
        'Multiply the current by |Z|.',
        'Divide the voltage by the current.',
      ]),
    ],
    example: {
      ...ex,
      XL,
      XC,
      X,
      Z,
      theta: Math.atan(X / ex.R!) / RAD,
      I: ex.V! / Z,
    },
    startWith: ['V', 'w', 'R', 'L', 'C'],
    representation: {
      kind: 'complexPlane',
      z: { re: 'R', im: 'X' },
      j: true,
      axes: ['R (Ω)', 'X (Ω)'],
      name: 'Z',
      unit: 'Ω',
      zMag: 'Z',
      zAngle: 'theta',
      reactances: { inductive: 'XL', capacitive: 'XC' },
      fixed: true,
    },
  });
}

const impedance = seriesRlc(
  'g.he-complex-plane-impedance',
  'Series RLC: Z = R + j(X_L − X_C) on the complex plane',
  'Use this for “A series RLC circuit at 1000 rad/s has R = 30 Ω, L = 60 mH, C = 50 μF. Find Z and the current.”',
  { V: 100, w: 1000, R: 30, L: 60, C: 50 },
);

const capacitive = seriesRlc(
  'g.he-complex-plane-impedance-capacitive',
  'Series RLC below resonance: X_C wins and θ < 0',
  'Use this for “The same RLC circuit runs at 500 rad/s. Does the current lead or lag, and by how much?”',
  { V: 100, w: 500, R: 30, L: 60, C: 50 },
);

/** circuits-2#0~phasor-form: polar and rectangular forms of one phasor. */
function phasorForm(id: string, title: string, use: string, A: number, t: number): ModuleDef {
  return page({
    id,
    title,
    use,
    assumptions: [
      'A phasor A∠θ is the complex number a + jb with a = A cos θ and b = A sin θ.',
      'θ is measured from the positive real axis, −180° to 180°; atan2(b, a) finds it in any quadrant.',
      'v(t) = A cos(ωt + θ) has the phasor A∠θ.',
    ],
    variables: [
      num('A', 'A', 'Magnitude', undefined, 0, 1e6, { step: 0.1 }),
      num('theta', 'θ', 'Angle', '°', -180, 180, { step: 0.1 }),
      num('a', 'a', 'Real part', undefined, -1e6, 1e6, { step: 0.1 }),
      num('b', 'b', 'Imaginary part', undefined, -1e6, 1e6, { step: 0.1 }),
    ],
    rules: [
      rule(
        'a = A cos θ',
        '{a} = {A} × cos({theta}°)',
        ['a', 'A', 'theta'],
        (v) => v.a! - v.A! * Math.cos(v.theta! * RAD),
        {
          a: [
            (v) => v.A! * Math.cos(v.theta! * RAD),
            '{A} × cos({theta}°)',
            'The shadow on the real axis.',
          ],
        },
      ),
      rule(
        'b = A sin θ',
        '{b} = {A} × sin({theta}°)',
        ['b', 'A', 'theta'],
        (v) => v.b! - v.A! * Math.sin(v.theta! * RAD),
        {
          b: [
            (v) => v.A! * Math.sin(v.theta! * RAD),
            '{A} × sin({theta}°)',
            'The height above the real axis.',
          ],
        },
      ),
      rule(
        'A = √(a² + b²)',
        '{A} = √({a}² + {b}²)',
        ['A', 'a', 'b'],
        (v) => v.A! ** 2 - v.a! ** 2 - v.b! ** 2,
        {
          A: [(v) => Math.hypot(v.a!, v.b!), '√({a}² + {b}²)', 'Pythagoras on the two parts.'],
        },
      ),
      rule(
        'θ = atan2(b, a)',
        '{theta} = atan2({b}, {a})',
        ['theta', 'a', 'b'],
        (v) =>
          v.a === 0 && v.b === 0
            ? 0
            : Math.sin(((v.theta! - Math.atan2(v.b!, v.a!) / RAD) * RAD) / 2),
        {
          theta: [
            (v) => (v.a === 0 && v.b === 0 ? undefined : Math.atan2(v.b!, v.a!) / RAD),
            'atan2({b}, {a})',
            'The angle of the point (a, b), from the real axis; atan2 keeps the quadrant.',
          ],
        },
      ),
    ],
    example: { A, theta: t, a: A * Math.cos(t * RAD), b: A * Math.sin(t * RAD) },
    startWith: ['A', 'theta'],
    representation: {
      kind: 'complexPlane',
      z: { re: 'a', im: 'b' },
      j: true,
      zMag: 'A',
      zAngle: 'theta',
    },
  });
}

const polarForm = phasorForm(
  'g.he-complex-plane-phasor-form',
  'A phasor in both forms: 10∠36.87° = 8 + j6',
  'Use this for “Write 10∠36.87° in rectangular form, and 8 + j6 in polar form.”',
  10,
  Math.atan2(6, 8) / RAD,
);

const thirdQuadrant = phasorForm(
  'g.he-complex-plane-phasor-third-quadrant',
  'A phasor in the third quadrant: −3 − j4',
  'Use this for “Write −3 − j4 in polar form, with the angle in the right quadrant.”',
  5,
  Math.atan2(-4, -3) / RAD,
);

/** circuits-2#0~parallel-rc: a parallel RC's impedance through its admittance. */
const parallelRc = page({
  id: 'g.he-complex-plane-parallel-rc',
  title: 'Parallel RC: Z from Y = G + jB',
  use: 'Use this for “A 50 Ω resistor is in parallel with a capacitor of reactance 25 Ω. Find the impedance.”',
  assumptions: [
    'In parallel the admittances add: Y = G + jB with G = 1/R and B = 1/X_C.',
    'Z = 1/Y: its size is 1/|Y| and its angle is minus Y’s, so a parallel RC has θ < 0.',
  ],
  variables: [
    num('R', 'R', 'Resistance', 'Ω', 0.01, 1e6, { step: 1 }),
    num('XC', 'X_C', 'Capacitive reactance', 'Ω', 0.01, 1e6, { step: 1 }),
    num('G', 'G', 'Conductance', 'mS', 0.000001, 100000),
    num('B', 'B', 'Susceptance', 'mS', 0.000001, 100000),
    num('Y', '|Y|', 'Admittance magnitude', 'mS', 0.000001, 200000),
    num('Z', '|Z|', 'Impedance magnitude', 'Ω', 0.000001, 1e9),
    num('theta', 'θ', 'Impedance angle', '°', -90, 0),
  ],
  rules: [
    rule('G = 1000/R', '{G} = 1000 ÷ {R}', ['G', 'R'], (v) => v.G! * v.R! - 1000, {
      G: [(v) => div(1000, v.R!), '1000 ÷ {R}', 'Conductance is 1/R; in mS that is 1000 ÷ R.'],
      R: [(v) => div(1000, v.G!), '1000 ÷ {G}', 'Turn the conductance back into ohms.'],
    }),
    rule('B = 1000/X_C', '{B} = 1000 ÷ {XC}', ['B', 'XC'], (v) => v.B! * v.XC! - 1000, {
      B: [(v) => div(1000, v.XC!), '1000 ÷ {XC}', 'Susceptance is 1/X_C, in mS.'],
      XC: [(v) => div(1000, v.B!), '1000 ÷ {B}', 'Turn the susceptance back into ohms.'],
    }),
    rule(
      '|Y| = √(G² + B²)',
      '{Y} = √({G}² + {B}²)',
      ['Y', 'G', 'B'],
      (v) => v.Y! ** 2 - v.G! ** 2 - v.B! ** 2,
      {
        Y: [
          (v) => Math.hypot(v.G!, v.B!),
          '√({G}² + {B}²)',
          'G and B are at right angles: Pythagoras.',
        ],
      },
    ),
    rule('|Z| = 1000/|Y|', '{Z} = 1000 ÷ {Y}', ['Z', 'Y'], (v) => v.Z! * v.Y! - 1000, {
      Z: [
        (v) => div(1000, v.Y!),
        '1000 ÷ {Y}',
        'Impedance is one over admittance; 1 ÷ mS gives kΩ, so 1000 ÷ |Y| in Ω.',
      ],
      Y: [(v) => div(1000, v.Z!), '1000 ÷ {Z}', 'One over the impedance, in mS.'],
    }),
    rule(
      'θ = −tan⁻¹(B/G)',
      '{theta} = −tan⁻¹({B} ÷ {G})',
      ['theta', 'B', 'G'],
      (v) => Math.tan(-v.theta! * RAD) * v.G! - v.B!,
      {
        theta: [
          (v) => fin(-Math.atan(v.B! / v.G!) / RAD),
          '−tan⁻¹({B} ÷ {G})',
          'Y’s angle is tan⁻¹(B/G); Z’s is minus that.',
        ],
      },
    ),
  ],
  example: {
    R: 50,
    XC: 25,
    G: 20,
    B: 40,
    Y: Math.hypot(20, 40),
    Z: 1000 / Math.hypot(20, 40),
    theta: -Math.atan(2) / RAD,
  },
  startWith: ['R', 'XC'],
  representation: {
    kind: 'complexPlane',
    z: { modulus: 'Z', argument: 'theta' },
    j: true,
    axes: ['R (Ω)', 'X (Ω)'],
    name: 'Z',
    unit: 'Ω',
    zMag: 'Z',
    zAngle: 'theta',
    fixed: true,
  },
});

// ── HC14: three-phase phasors (circuits-2#4) ──

/** circuits-2#4 main: a balanced Y load, its star of phase voltages and one line voltage. */
function wye(
  id: string,
  title: string,
  use: string,
  VL: number,
  Zp: number,
  pf: number,
): ModuleDef {
  const Vph = VL / SQ3;
  const IL = Vph / Zp;
  const S = (SQ3 * VL * IL) / 1000;
  return page({
    id,
    title,
    use,
    assumptions: [
      'A balanced Y: three equal phase voltages 120° apart; the line current is the phase current.',
      'V_ab = V_an − V_bn: √3 times a phase voltage, 30° ahead of V_an (drawn tip to tail).',
      'rms values; a lagging load’s current trails its phase voltage by θ = cos⁻¹(pf).',
    ],
    variables: [
      num('VL', 'V_L', 'Line voltage', 'V', 1, 1e6, { step: 1 }),
      num('Vph', 'V_ph', 'Phase voltage', 'V', 0.5, 1e6),
      num('Zp', '|Z|', 'Phase impedance', 'Ω', 0.01, 1e6, { step: 0.5 }),
      num('pf', 'pf', 'Power factor (lagging)', undefined, 0.05, 1, { step: 0.01 }),
      num('theta', 'θ', 'Power factor angle', '°', 0.01, 90),
      num('IL', 'I_L', 'Line current', 'A', 0, 1e7),
      num('S', 'S', 'Apparent power', 'kVA', 0, 1e9),
      num('P', 'P', 'Real power', 'kW', 0, 1e9),
      num('Q', 'Q', 'Reactive power', 'kvar', 0, 1e9),
    ],
    rules: [
      rule('V_ph = V_L/√3', '{Vph} = {VL} ÷ √3', ['Vph', 'VL'], (v) => v.Vph! * SQ3 - v.VL!, {
        Vph: [
          (v) => v.VL! / SQ3,
          '{VL} ÷ √3',
          'In a Y the line voltage is √3 times a phase voltage.',
        ],
        VL: [(v) => v.Vph! * SQ3, '{Vph} × √3', 'Multiply the phase voltage by √3.'],
      }),
      quotient('I_L = V_ph/|Z|', 'IL', 'Vph', 'Zp', [
        'Each phase is its voltage across its impedance.',
        'Multiply the current by |Z|.',
        'Divide the phase voltage by the current.',
      ]),
      rule(
        'θ = cos⁻¹(pf)',
        '{theta} = cos⁻¹({pf})',
        ['theta', 'pf'],
        (v) => Math.cos(v.theta! * RAD) - v.pf!,
        {
          theta: [
            (v) => (v.pf! <= 1 && v.pf! > 0 ? Math.acos(v.pf!) / RAD : undefined),
            'cos⁻¹({pf})',
            'The power factor is cos θ.',
          ],
          pf: [(v) => Math.cos(v.theta! * RAD), 'cos({theta}°)', 'The power factor is cos θ.'],
        },
      ),
      rule(
        'S = √3 V_L I_L',
        '{S} = √3 × {VL} × {IL} ÷ 1000',
        ['S', 'VL', 'IL'],
        (v) => v.S! * 1000 - SQ3 * v.VL! * v.IL!,
        {
          S: [
            (v) => (SQ3 * v.VL! * v.IL!) / 1000,
            '√3 × {VL} × {IL} ÷ 1000',
            'Three phases of V_ph I_L each, which is √3 V_L I_L; ÷ 1000 for kVA.',
          ],
        },
      ),
      product('P = S × pf', 'P', 'S', 'pf', [
        'The real part of S.',
        'Divide the real power by the power factor.',
        'Divide the real power by S.',
      ]),
      rule(
        'Q = S sin θ',
        '{Q} = {S} × sin({theta}°)',
        ['Q', 'S', 'theta'],
        (v) => v.Q! - v.S! * Math.sin(v.theta! * RAD),
        {
          Q: [
            (v) => v.S! * Math.sin(v.theta! * RAD),
            '{S} × sin({theta}°)',
            'The reactive part of S.',
          ],
        },
      ),
    ],
    example: {
      VL,
      Vph,
      Zp,
      pf,
      theta: Math.acos(pf) / RAD,
      IL,
      S,
      P: S * pf,
      Q: S * Math.sin(Math.acos(pf)),
    },
    startWith: ['VL', 'Zp', 'pf'],
    representation: {
      kind: 'complexPlane',
      z: { re: 0, im: 0 },
      j: true,
      phasors: [
        { name: 'V_an', mag: 'Vph', angle: 0, unit: 'V', tone: 'a' },
        { name: 'V_bn', mag: 'Vph', angle: -120, unit: 'V', tone: 'b' },
        { name: 'V_cn', mag: 'Vph', angle: 120, unit: 'V', tone: 'c' },
        { name: 'V_ab', mag: 'VL', angle: 30, unit: 'V', tail: 'V_bn', ends: 'V_an', tone: 'line' },
        { name: 'I_a', mag: 'IL', angle: 'theta', negate: true, unit: 'A', tone: 'current' },
      ],
      between: { from: 'V_an', to: 'I_a', label: 'θ' },
    },
  });
}

const threePhase = wye(
  'g.he-complex-plane-three-phase-wye',
  'A balanced Y: the phase voltages, V_ab tip to tail and I_a',
  'Use this for “A balanced Y load of 12 Ω per phase at pf 0.8 is fed at 208 V line to line. Find the line current and power.”',
  208,
  12,
  0.8,
);

const lowPf = wye(
  'g.he-complex-plane-three-phase-low-pf',
  'A Y load at pf 0.5: I_a 60° behind V_an',
  'Use this for “A 480 V Y-connected motor draws 20 Ω per phase at pf 0.5. Find the line current and the real power.”',
  480,
  20,
  0.5,
);

/** circuits-2#4~delta: a balanced Δ load at unity pf; I_a = I_ab − I_ca tip to tail. */
const delta = page({
  id: 'g.he-complex-plane-three-phase-delta',
  title: 'A balanced Δ: I_a = I_ab − I_ca, √3 times a phase current',
  use: 'Use this for “A balanced Δ load of 20 Ω per phase (pf 1) is fed at 240 V. Find the phase and line currents and the power.”',
  assumptions: [
    'In a Δ each phase impedance sits across a line voltage: V_ph = V_L.',
    'I_a = I_ab − I_ca: √3 times a phase current, 30° behind I_ab (drawn tip to tail).',
    'Unity power factor: each phase current is in step with its phase voltage.',
  ],
  variables: [
    num('VL', 'V_L', 'Line voltage', 'V', 1, 1e6, { step: 1 }),
    num('Vph', 'V_ph', 'Phase voltage', 'V', 1, 1e6),
    num('Zp', '|Z|', 'Phase impedance', 'Ω', 0.01, 1e6, { step: 0.5 }),
    num('Iph', 'I_ph', 'Phase current', 'A', 0, 1e7),
    num('IL', 'I_L', 'Line current', 'A', 0, 1e7),
    num('P', 'P', 'Real power', 'W', 0, 1e12),
  ],
  rules: [
    rule('V_ph = V_L', '{Vph} = {VL}', ['Vph', 'VL'], (v) => v.Vph! - v.VL!, {
      Vph: [(v) => v.VL!, '{VL}', 'Each phase sits across two lines.'],
      VL: [(v) => v.Vph!, '{Vph}', 'Each phase sits across two lines.'],
    }),
    quotient('I_ph = V_ph/|Z|', 'Iph', 'Vph', 'Zp', [
      'Ohm’s law in one phase.',
      'Multiply the phase current by |Z|.',
      'Divide the phase voltage by the current.',
    ]),
    rule('I_L = √3 I_ph', '{IL} = √3 × {Iph}', ['IL', 'Iph'], (v) => v.IL! - SQ3 * v.Iph!, {
      IL: [
        (v) => SQ3 * v.Iph!,
        '√3 × {Iph}',
        'Two phase currents 120° apart, subtracted: √3 times one.',
      ],
      Iph: [(v) => v.IL! / SQ3, '{IL} ÷ √3', 'Divide the line current by √3.'],
    }),
    rule(
      'P = 3 V_ph I_ph',
      '{P} = 3 × {Vph} × {Iph}',
      ['P', 'Vph', 'Iph'],
      (v) => v.P! - 3 * v.Vph! * v.Iph!,
      {
        P: [
          (v) => 3 * v.Vph! * v.Iph!,
          '3 × {Vph} × {Iph}',
          'Three phases, each V_ph I_ph at pf 1.',
        ],
      },
    ),
  ],
  example: { VL: 240, Vph: 240, Zp: 20, Iph: 12, IL: 12 * SQ3, P: 8640 },
  startWith: ['VL', 'Zp'],
  representation: {
    kind: 'complexPlane',
    z: { re: 0, im: 0 },
    j: true,
    phasors: [
      { name: 'I_ab', mag: 'Iph', angle: 0, unit: 'A', tone: 'a' },
      { name: 'I_bc', mag: 'Iph', angle: -120, unit: 'A', tone: 'b' },
      { name: 'I_ca', mag: 'Iph', angle: 120, unit: 'A', tone: 'c' },
      {
        name: '−I_ca',
        mag: 'Iph',
        angle: -60,
        unit: 'A',
        tail: 'I_ab',
        ends: 'I_a',
        tone: 'c',
        dashed: true,
      },
      { name: 'I_a', mag: 'IL', angle: -30, unit: 'A', tone: 'lit' },
    ],
  },
});

// ── HC14: poles, zeros and the root locus (signals#3, control#0–2) ──

/** signals#3 main: partial fractions, each pole with its residue. */
const residues = page({
  id: 'g.he-complex-plane-poles-residues',
  title: 'X(s) = (s + c)/((s + a)(s + b)): each pole with its residue',
  use: 'Use this for “Find x(t) when X(s) = (s + 3)/((s + 1)(s + 2)).”',
  assumptions: [
    'Distinct poles: the cover-up rule gives each residue.',
    '1/(s + a) ↔ e^(−at)u(t): each pole gives one decaying term.',
  ],
  variables: [
    num('c', 'c', 'Zero at −c', '1/s', 0, 1000, { step: 0.1 }),
    num('a', 'a', 'First pole at −a', '1/s', 0.01, 1000, { step: 0.1 }),
    num('b', 'b', 'Second pole at −b', '1/s', 0.01, 1000, { step: 0.1 }),
    num('A', 'A', 'Residue at −a', undefined, -1e6, 1e6),
    num('B', 'B', 'Residue at −b', undefined, -1e6, 1e6),
    num('t', 't', 'Time', 's', 0, 1000, { step: 0.1 }),
    num('x', 'x', 'x(t)', undefined, -1e6, 1e6),
  ],
  rules: [
    rule(
      'A = (c − a)/(b − a)',
      '{A} = ({c} − {a}) ÷ ({b} − {a})',
      ['A', 'c', 'a', 'b'],
      (v) => v.A! * (v.b! - v.a!) - (v.c! - v.a!),
      {
        A: [
          (v) => div(v.c! - v.a!, v.b! - v.a!),
          '({c} − {a}) ÷ ({b} − {a})',
          'Cover up (s + a) and put s = −a in what is left.',
        ],
      },
    ),
    rule(
      'B = (c − b)/(a − b)',
      '{B} = ({c} − {b}) ÷ ({a} − {b})',
      ['B', 'c', 'a', 'b'],
      (v) => v.B! * (v.a! - v.b!) - (v.c! - v.b!),
      {
        B: [
          (v) => div(v.c! - v.b!, v.a! - v.b!),
          '({c} − {b}) ÷ ({a} − {b})',
          'Cover up (s + b) and put s = −b in what is left.',
        ],
      },
    ),
    rule(
      'x = Ae^(−at) + Be^(−bt)',
      '{x} = {A} × e^(−{a} × {t}) + {B} × e^(−{b} × {t})',
      ['x', 'A', 'a', 'B', 'b', 't'],
      (v) => v.x! - v.A! * Math.exp(-v.a! * v.t!) - v.B! * Math.exp(-v.b! * v.t!),
      {
        x: [
          (v) => fin(v.A! * Math.exp(-v.a! * v.t!) + v.B! * Math.exp(-v.b! * v.t!)),
          '{A} × e^(−{a} × {t}) + {B} × e^(−{b} × {t})',
          'Add the two decaying terms at t.',
        ],
      },
    ),
  ],
  example: { c: 3, a: 1, b: 2, A: 2, B: -1, t: 1, x: 2 * Math.exp(-1) - Math.exp(-2) },
  startWith: ['c', 'a', 'b', 't'],
  representation: {
    kind: 'complexPlane',
    z: { re: 0, im: 0 },
    j: true,
    axes: ['σ', 'jω'],
    poles: [
      { re: 'a', neg: true, tag: { name: 'A', value: 'A' } },
      { re: 'b', neg: true, tag: { name: 'B', value: 'B' } },
    ],
    zeros: [{ re: 'c', neg: true }],
    terms: true,
  },
});

/** control#0~feedback: an open-loop pole moved by feedback. */
const feedback = page({
  id: 'g.he-complex-plane-feedback',
  title: 'Feedback moves the pole: −a to −(a + KH)',
  use: 'Use this for “G(s) = 4/(s + 1) with unity feedback. Where is the closed-loop pole, and what is the DC gain?”',
  assumptions: [
    'T = G ÷ (1 + GH) = K ÷ (s + a + KH): one pole, at −(a + KH).',
    'The locus runs from the open-loop pole −a to the left as KH grows.',
  ],
  variables: [
    num('K', 'K', 'Gain', '1/s', 0.01, 10000, { step: 0.1 }),
    num('a', 'a', 'Open-loop pole at −a', '1/s', 0.01, 10000, { step: 0.1 }),
    num('H', 'H', 'Feedback gain', undefined, 0.01, 100, { step: 0.1 }),
    num('p', 'p', 'Closed-loop pole', '1/s', -1e8, -0.0001),
    num('dc', 'T(0)', 'Closed-loop DC gain', undefined, 0, 1e6),
    num('tau', 'τ', 'Time constant', 's', 0, 1e6),
  ],
  rules: [
    rule(
      'p = −(a + KH)',
      '{p} = −({a} + {K} × {H})',
      ['p', 'a', 'K', 'H'],
      (v) => v.p! + v.a! + v.K! * v.H!,
      {
        p: [
          (v) => -(v.a! + v.K! * v.H!),
          '−({a} + {K} × {H})',
          'The closed loop’s denominator is s + a + KH.',
        ],
        K: [
          (v) => div(-v.p! - v.a!, v.H!),
          '(−{p} − {a}) ÷ {H}',
          'The pole moved by KH; divide by H.',
        ],
      },
    ),
    rule(
      'T(0) = K/(a + KH)',
      '{dc} = {K} ÷ ({a} + {K} × {H})',
      ['dc', 'K', 'a', 'H'],
      (v) => v.dc! * (v.a! + v.K! * v.H!) - v.K!,
      {
        dc: [(v) => div(v.K!, v.a! + v.K! * v.H!), '{K} ÷ ({a} + {K} × {H})', 'Put s = 0 in T(s).'],
      },
    ),
    rule(
      'τ = 1/(a + KH)',
      '{tau} = 1 ÷ ({a} + {K} × {H})',
      ['tau', 'a', 'K', 'H'],
      (v) => v.tau! * (v.a! + v.K! * v.H!) - 1,
      {
        tau: [
          (v) => div(1, v.a! + v.K! * v.H!),
          '1 ÷ ({a} + {K} × {H})',
          'A pole at −σ decays as e^(−σt): τ = 1/σ.',
        ],
      },
    ),
  ],
  example: { K: 4, a: 1, H: 1, p: -5, dc: 0.8, tau: 0.2 },
  startWith: ['K', 'a', 'H'],
  representation: {
    kind: 'complexPlane',
    z: { re: 0, im: 0 },
    j: true,
    axes: ['σ', 'jω'],
    locus: { poles: [{ re: 'a', neg: true }], gain: ['K', 'H'], closed: ['p'] },
  },
});

/** control#1~dc-gain: G(0) from the poles and zero. */
const dcGain = page({
  id: 'g.he-complex-plane-dc-gain',
  title: 'G(s) = K(s + z)/((s + p₁)(s + p₂)): poles, zero and G(0)',
  use: 'Use this for “Find the DC gain of G(s) = 5(s + 2)/((s + 1)(s + 4)).”',
  assumptions: [
    'The DC gain is G(0): put s = 0, so each factor (s + r) becomes r.',
    'All poles are in the left half-plane, so the step response settles to G(0).',
  ],
  variables: [
    num('K', 'K', 'Gain', undefined, 0.01, 10000, { step: 0.1 }),
    num('z', 'z', 'Zero at −z', '1/s', 0.01, 10000, { step: 0.1 }),
    num('p1', 'p₁', 'Pole at −p₁', '1/s', 0.01, 10000, { step: 0.1 }),
    num('p2', 'p₂', 'Pole at −p₂', '1/s', 0.01, 10000, { step: 0.1 }),
    num('G0', 'G(0)', 'DC gain', undefined, 0, 1e9),
  ],
  rules: [
    rule(
      'G(0) = Kz/(p₁p₂)',
      '{G0} = {K} × {z} ÷ ({p1} × {p2})',
      ['G0', 'K', 'z', 'p1', 'p2'],
      (v) => v.G0! * v.p1! * v.p2! - v.K! * v.z!,
      {
        G0: [
          (v) => div(v.K! * v.z!, v.p1! * v.p2!),
          '{K} × {z} ÷ ({p1} × {p2})',
          'Put s = 0: each factor s + r becomes r.',
        ],
        K: [
          (v) => div(v.G0! * v.p1! * v.p2!, v.z!),
          '{G0} × {p1} × {p2} ÷ {z}',
          'Undo the poles and the zero.',
        ],
      },
    ),
  ],
  example: { K: 5, z: 2, p1: 1, p2: 4, G0: 2.5 },
  startWith: ['K', 'z', 'p1', 'p2'],
  representation: {
    kind: 'complexPlane',
    z: { re: 0, im: 0 },
    j: true,
    axes: ['σ', 'jω'],
    poles: [
      { re: 'p1', neg: true },
      { re: 'p2', neg: true },
    ],
    zeros: [{ re: 'z', neg: true }],
    transfer: { gain: 'K', dc: 'G0' },
  },
});

/** control#2~root-locus: three real poles, the asymptotes and the breakaway. */
function rootLocus(id: string, title: string, use: string, K: number): ModuleDef {
  const [p1, p2, p3] = [0, -2, -4];
  const S = p1 + p2 + p3;
  const P2 = p1 * p2 + p1 * p3 + p2 * p3;
  return page({
    id,
    title,
    use,
    assumptions: [
      'G(s)H(s) = K ÷ ((s − p₁)(s − p₂)(s − p₃)), no zeros: three branches, all off to infinity.',
      'The asymptotes leave the centroid σ_a = (p₁ + p₂ + p₃) ÷ 3 at 60°, 180° and 300°.',
      'The breakaway is where dK/ds = 0 between the two right-hand poles.',
      'All three poles are real, p₁ > p₂ > p₃, with p₁ at or left of 0.',
    ],
    variables: [
      num('p1', 'p₁', 'First pole', '1/s', -1, 0, { step: 0.1 }),
      num('p2', 'p₂', 'Second pole', '1/s', -3, -1.1, { step: 0.1 }),
      num('p3', 'p₃', 'Third pole', '1/s', -20, -3.1, { step: 0.1 }),
      num('sa', 'σ_a', 'Centroid', '1/s', -20, 0),
      num('sb', 's_b', 'Breakaway point', '1/s', -20, 0),
      num('K', 'K', 'Gain', undefined, 0.01, 100000, { step: 0.5 }),
      num('Kmax', 'K_max', 'Largest stable gain', undefined, 0, 1e6),
      num('gm', 'GM', 'Gain margin', undefined, 0, 1e6),
    ],
    rules: [
      rule(
        'σ_a = (p₁ + p₂ + p₃)/3',
        '{sa} = ({p1} + {p2} + {p3}) ÷ 3',
        ['sa', 'p1', 'p2', 'p3'],
        (v) => 3 * v.sa! - v.p1! - v.p2! - v.p3!,
        {
          sa: [
            (v) => (v.p1! + v.p2! + v.p3!) / 3,
            '({p1} + {p2} + {p3}) ÷ 3',
            'The poles’ centre: their sum over the 3 − 0 asymptotes.',
          ],
        },
      ),
      rule(
        'd/ds[(s − p₁)(s − p₂)(s − p₃)] = 0',
        '3 × {sb}² − 2 × ({p1} + {p2} + {p3}) × {sb} + ({p1} × {p2} + {p1} × {p3} + {p2} × {p3}) = 0',
        ['sb', 'p1', 'p2', 'p3'],
        (v) => {
          const s = v.p1! + v.p2! + v.p3!;
          const q = v.p1! * v.p2! + v.p1! * v.p3! + v.p2! * v.p3!;
          return 3 * v.sb! ** 2 - 2 * s * v.sb! + q;
        },
        {
          sb: [
            (v) => {
              const s = v.p1! + v.p2! + v.p3!;
              const q = v.p1! * v.p2! + v.p1! * v.p3! + v.p2! * v.p3!;
              const d = s * s - 3 * q;
              return d < 0 ? undefined : (s + Math.sqrt(d)) / 3;
            },
            '(({p1} + {p2} + {p3}) + √(({p1} + {p2} + {p3})² − 3 × ({p1} × {p2} + {p1} × {p3} + {p2} × {p3}))) ÷ 3',
            'Set dK/ds = 0 and take the root between the two right-hand poles.',
          ],
        },
      ),
      rule(
        'K_max = −(p₁ + p₂ + p₃)(p₁p₂ + p₁p₃ + p₂p₃) + p₁p₂p₃',
        '{Kmax} = −({p1} + {p2} + {p3}) × ({p1} × {p2} + {p1} × {p3} + {p2} × {p3}) + {p1} × {p2} × {p3}',
        ['Kmax', 'p1', 'p2', 'p3'],
        (v) =>
          v.Kmax! +
          (v.p1! + v.p2! + v.p3!) * (v.p1! * v.p2! + v.p1! * v.p3! + v.p2! * v.p3!) -
          v.p1! * v.p2! * v.p3!,
        {
          Kmax: [
            (v) =>
              -(v.p1! + v.p2! + v.p3!) * (v.p1! * v.p2! + v.p1! * v.p3! + v.p2! * v.p3!) +
              v.p1! * v.p2! * v.p3!,
            '−({p1} + {p2} + {p3}) × ({p1} × {p2} + {p1} × {p3} + {p2} × {p3}) + {p1} × {p2} × {p3}',
            'Routh: s³ + a₂s² + a₁s + a₀ + K is stable while a₂a₁ > a₀ + K; the branches cross the jω axis at K_max.',
          ],
        },
      ),
      quotient('GM = K_max/K', 'gm', 'Kmax', 'K', [
        'How many times K can grow before the poles cross into the right half-plane.',
        'Multiply the gain margin by K.',
        'Divide K_max by the gain margin.',
      ]),
    ],
    example: {
      p1,
      p2,
      p3,
      sa: S / 3,
      sb: (S + Math.sqrt(S * S - 3 * P2)) / 3,
      K,
      Kmax: -S * P2 + p1 * p2 * p3,
      gm: (-S * P2 + p1 * p2 * p3) / K,
    },
    startWith: ['p1', 'p2', 'p3', 'K'],
    representation: {
      kind: 'complexPlane',
      z: { re: 0, im: 0 },
      j: true,
      axes: ['σ', 'jω'],
      locus: {
        poles: [{ re: 'p1' }, { re: 'p2' }, { re: 'p3' }],
        gain: 'K',
        centroid: 'sa',
        breakaway: 'sb',
      },
    },
  });
}

const locus = rootLocus(
  'g.he-complex-plane-root-locus',
  'Root locus of K/(s(s + 2)(s + 4)): asymptotes, breakaway, poles at K',
  'Use this for “Sketch the root locus of K/(s(s + 2)(s + 4)): find the centroid, the asymptote angles and the breakaway point.”',
  15,
);

const locusEdge = rootLocus(
  'g.he-complex-plane-root-locus-edge',
  'Near the edge of stability: K = 45, poles close to the jω axis',
  'Use this for “Where are the closed-loop poles of K/(s(s + 2)(s + 4)) at K = 45, just under K_max = 48?”',
  45,
);

export const HE2A_GALLERY_MODULES: ModuleDef[] = [
  impedance,
  capacitive,
  polarForm,
  thirdQuadrant,
  parallelRc,
  threePhase,
  lowPf,
  delta,
  residues,
  feedback,
  dcGain,
  locus,
  locusEdge,
];

export const HE2A_GALLERY_LAYOUTS: LayoutDef[] = [];
