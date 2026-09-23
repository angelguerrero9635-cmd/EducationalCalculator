/**
 * College pilot modules, keyed by course topic (`<courseId>#<topicIndex>`). The course and
 * topic titles still come from taxonomy.ts.
 */
import type { ModuleDef } from './types';

const div = (a: number, b: number) => (b === 0 ? undefined : a / b);
const plusMinus = (x: number) => (x === 0 ? [0] : [x, -x]);

export const COLLEGE_MODULES: ModuleDef[] = [
  {
    // University Physics I: Mechanics → Kinematics
    id: 'he.physics.university-1#0',
    assumptions: [
      'Acceleration is constant for the whole time interval.',
      'Motion is along a straight line. Pick a positive direction once; signs follow it.',
      'The clock starts (t = 0) when the velocity is v₀.',
      'd is displacement (change in position), not total distance traveled.',
    ],
    variables: [
      {
        id: 'v0',
        symbol: 'v₀',
        name: 'Initial velocity',
        unit: 'm/s',
        min: -500,
        max: 500,
        step: 0.5,
      },
      { id: 'v', symbol: 'v', name: 'Final velocity', unit: 'm/s', min: -500, max: 500 },
      { id: 'a', symbol: 'a', name: 'Acceleration', unit: 'm/s²', min: -20, max: 20, step: 0.5 },
      { id: 't', symbol: 't', name: 'Time', unit: 's', min: 0, max: 20, step: 0.1 },
      { id: 'd', symbol: 'd', name: 'Displacement', unit: 'm', min: -5000, max: 5000 },
    ],
    relations: [
      {
        id: 'v = v₀ + at',
        display: '{v} = {v0} + {a} × {t}',
        vars: ['v', 'v0', 'a', 't'],
        residual: (x) => x.v! - x.v0! - x.a! * x.t!,
        solve: {
          v: (x) => x.v0! + x.a! * x.t!,
          v0: (x) => x.v! - x.a! * x.t!,
          a: (x) => div(x.v! - x.v0!, x.t!),
          t: (x) => div(x.v! - x.v0!, x.a!),
        },
      },
      {
        id: 'd = v₀t + ½at²',
        display: '{d} = {v0} × {t} + ½ × {a} × {t}²',
        vars: ['d', 'v0', 'a', 't'],
        residual: (x) => x.d! - x.v0! * x.t! - 0.5 * x.a! * x.t! ** 2,
        solve: {
          d: (x) => x.v0! * x.t! + 0.5 * x.a! * x.t! ** 2,
          v0: (x) => div(x.d! - 0.5 * x.a! * x.t! ** 2, x.t!),
          a: (x) => (x.t === 0 ? undefined : (2 * (x.d! - x.v0! * x.t!)) / x.t! ** 2),
          t: (x) => {
            // ½a·t² + v₀·t − d = 0
            if (x.a === 0) return x.v0 === 0 ? undefined : [x.d! / x.v0!];
            const disc = x.v0! ** 2 + 2 * x.a! * x.d!;
            if (disc < 0) return [];
            const s = Math.sqrt(disc);
            return [(-x.v0! + s) / x.a!, (-x.v0! - s) / x.a!];
          },
        },
      },
      {
        id: 'v² = v₀² + 2ad',
        display: '{v}² = {v0}² + 2 × {a} × {d}',
        vars: ['v', 'v0', 'a', 'd'],
        residual: (x) => x.v! ** 2 - x.v0! ** 2 - 2 * x.a! * x.d!,
        solve: {
          v: (x) => plusMinus(Math.sqrt(x.v0! ** 2 + 2 * x.a! * x.d!)),
          v0: (x) => plusMinus(Math.sqrt(x.v! ** 2 - 2 * x.a! * x.d!)),
          a: (x) => div(x.v! ** 2 - x.v0! ** 2, 2 * x.d!),
          d: (x) => div(x.v! ** 2 - x.v0! ** 2, 2 * x.a!),
        },
      },
      {
        id: 'd = ½(v₀ + v)t',
        display: '{d} = ½ × ({v0} + {v}) × {t}',
        vars: ['d', 'v0', 'v', 't'],
        residual: (x) => x.d! - 0.5 * (x.v0! + x.v!) * x.t!,
        solve: {
          d: (x) => 0.5 * (x.v0! + x.v!) * x.t!,
          v0: (x) => (x.t === 0 ? undefined : (2 * x.d!) / x.t! - x.v!),
          v: (x) => (x.t === 0 ? undefined : (2 * x.d!) / x.t! - x.v0!),
          t: (x) => div(2 * x.d!, x.v0! + x.v!),
        },
      },
    ],
    example: { v0: 5, a: 2, t: 4, v: 13, d: 36 },
    startWith: ['v0', 'a', 't'],
    representation: {
      kind: 'plot',
      x: { var: 't', min: 0, max: 10, label: 't (s)' },
      y: { var: 'v', min: -10, max: 30, label: 'v (m/s)' },
      params: ['v0', 'a'],
      shadeToPoint: true,
    },
  },

  {
    // Circuit Analysis I → Ohm's and Kirchhoff's laws
    id: 'he.engineering.circuits-1#0',
    assumptions: [
      'One resistor is connected across a DC source.',
      'Kirchhoff’s voltage law: the resistor’s voltage equals the source voltage (ideal wires).',
      'Kirchhoff’s current law: the same current flows everywhere in the single loop.',
      'The resistor is ohmic: its resistance does not change with voltage or temperature.',
    ],
    variables: [
      { id: 'V', symbol: 'V', name: 'Voltage', unit: 'V', min: 0, max: 1000, step: 0.5 },
      { id: 'I', symbol: 'I', name: 'Current', unit: 'A', min: 0, max: 100 },
      { id: 'R', symbol: 'R', name: 'Resistance', unit: 'Ω', min: 0.1, max: 1000000 },
      { id: 'P', symbol: 'P', name: 'Power', unit: 'W', min: 0, max: 1000000 },
    ],
    relations: [
      {
        id: 'V = IR',
        display: '{V} = {I} × {R}',
        vars: ['V', 'I', 'R'],
        residual: (x) => x.V! - x.I! * x.R!,
        solve: {
          V: (x) => x.I! * x.R!,
          I: (x) => div(x.V!, x.R!),
          R: (x) => div(x.V!, x.I!),
        },
      },
      {
        id: 'P = VI',
        display: '{P} = {V} × {I}',
        vars: ['P', 'V', 'I'],
        residual: (x) => x.P! - x.V! * x.I!,
        solve: {
          P: (x) => x.V! * x.I!,
          V: (x) => div(x.P!, x.I!),
          I: (x) => div(x.P!, x.V!),
        },
      },
      {
        id: 'P = I²R',
        display: '{P} = {I}² × {R}',
        vars: ['P', 'I', 'R'],
        residual: (x) => x.P! - x.I! ** 2 * x.R!,
        solve: {
          P: (x) => x.I! ** 2 * x.R!,
          I: (x) => (x.R! > 0 ? Math.sqrt(x.P! / x.R!) : undefined),
          R: (x) => div(x.P!, x.I! ** 2),
        },
      },
      {
        id: 'P = V²/R',
        display: '{P} = {V}² ÷ {R}',
        vars: ['P', 'V', 'R'],
        residual: (x) => x.P! * x.R! - x.V! ** 2,
        solve: {
          P: (x) => div(x.V! ** 2, x.R!),
          V: (x) => Math.sqrt(x.P! * x.R!),
          R: (x) => div(x.V! ** 2, x.P!),
        },
      },
    ],
    example: { V: 12, R: 6, I: 2, P: 24 },
    startWith: ['V', 'R'],
    representation: {
      kind: 'plot',
      x: { var: 'V', min: 0, max: 24, label: 'V (volts)' },
      y: { var: 'I', min: 0, max: 4, label: 'I (amps)' },
      params: ['R'],
    },
  },

  {
    // Calculus I → Derivatives and differentiation rules
    id: 'he.math.calc-1#1',
    assumptions: [
      'f(x) = x² is smooth and defined for every real x.',
      'The derivative f′(x) is the slope of the tangent line at x: the instantaneous rate of change.',
      'Power rule: the derivative of xⁿ is n·xⁿ⁻¹, so f′(x) = 2x.',
    ],
    variables: [
      { id: 'x', symbol: 'x', name: 'Point x', min: -4, max: 4, step: 0.1 },
      { id: 'y', symbol: 'f(x)', name: 'Function value', min: 0, max: 16 },
      { id: 'm', symbol: 'f′(x)', name: 'Slope of tangent', min: -8, max: 8 },
    ],
    relations: [
      {
        id: 'f(x) = x²',
        display: '{y} = {x}²',
        vars: ['y', 'x'],
        residual: (v) => v.y! - v.x! ** 2,
        solve: { y: (v) => v.x! ** 2, x: (v) => plusMinus(Math.sqrt(v.y!)) },
      },
      {
        id: 'f′(x) = 2x',
        display: '{m} = 2 × {x}',
        vars: ['m', 'x'],
        residual: (v) => v.m! - 2 * v.x!,
        solve: { m: (v) => 2 * v.x!, x: (v) => v.m! / 2 },
      },
    ],
    example: { x: 1.5, y: 2.25, m: 3 },
    startWith: ['x'],
    representation: {
      kind: 'plot',
      x: { var: 'x', min: -4, max: 4 },
      y: { var: 'y', min: -2, max: 16 },
      params: [],
      tangentSlope: 'm',
    },
  },

  {
    // Human Geography → Population and migration (counting model)
    id: 'he.geography.human-geography#0',
    assumptions: [
      'Counts are for one place over one year.',
      'Population changes only through births, deaths, and people moving in or out.',
      'Natural increase = births − deaths; net migration = immigrants − emigrants.',
      'Counting model: real statistics are estimates and often revised.',
    ],
    variables: [
      { id: 'B', symbol: 'B', name: 'Births', min: 0, max: 1000000, step: 1, integer: true },
      { id: 'D', symbol: 'D', name: 'Deaths', min: 0, max: 1000000, step: 1, integer: true },
      { id: 'I', symbol: 'I', name: 'Immigrants', min: 0, max: 1000000, step: 1, integer: true },
      { id: 'E', symbol: 'E', name: 'Emigrants', min: 0, max: 1000000, step: 1, integer: true },
      {
        id: 'N',
        symbol: 'N',
        name: 'Natural increase',
        min: -1000000,
        max: 1000000,
        integer: true,
      },
      { id: 'M', symbol: 'M', name: 'Net migration', min: -1000000, max: 1000000, integer: true },
      {
        id: 'P',
        symbol: 'ΔP',
        name: 'Population change',
        min: -2000000,
        max: 2000000,
        integer: true,
      },
    ],
    relations: [
      {
        id: 'N = B − D',
        display: '{N} = {B} − {D}',
        vars: ['N', 'B', 'D'],
        residual: (v) => v.N! - (v.B! - v.D!),
        solve: { N: (v) => v.B! - v.D!, B: (v) => v.N! + v.D!, D: (v) => v.B! - v.N! },
      },
      {
        id: 'M = I − E',
        display: '{M} = {I} − {E}',
        vars: ['M', 'I', 'E'],
        residual: (v) => v.M! - (v.I! - v.E!),
        solve: { M: (v) => v.I! - v.E!, I: (v) => v.M! + v.E!, E: (v) => v.I! - v.M! },
      },
      {
        id: 'ΔP = N + M',
        display: '{P} = {N} + {M}',
        vars: ['P', 'N', 'M'],
        residual: (v) => v.P! - (v.N! + v.M!),
        solve: { P: (v) => v.N! + v.M!, N: (v) => v.P! - v.M!, M: (v) => v.P! - v.N! },
      },
    ],
    example: { B: 120, D: 80, I: 50, E: 30, N: 40, M: 20, P: 60 },
    startWith: ['B', 'D', 'I', 'E'],
    representation: {
      kind: 'bars',
      bars: [
        { var: 'B', editable: true },
        { var: 'D', editable: true },
        { var: 'I', editable: true },
        { var: 'E', editable: true },
        { var: 'N' },
        { var: 'M' },
        { var: 'P' },
      ],
      min: -100,
      max: 200,
    },
  },
];
