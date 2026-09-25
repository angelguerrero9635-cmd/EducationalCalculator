/**
 * College pilot modules, keyed by course topic (`<courseId>#<topicIndex>`). The course and
 * topic titles still come from taxonomy.ts. Written and reviewed against docs/MODULE_GUIDE.md.
 */
import { formatNumber } from '@/engine/format';

import type { ModuleDef } from './types';

const div = (a: number, b: number) => (b === 0 ? undefined : a / b);
/**
 * √x for a quantity computed as a sum of terms of size `scale`: a tiny negative from rounding
 * (a double root, e.g. an object that just stops) counts as 0 instead of no answer.
 */
const rootOf = (x: number, scale: number) => (x < 0 && x > -1e-5 * scale ? 0 : Math.sqrt(x));

const plusMinus = (x: number) => (x === 0 ? [0] : [x, -x]);

/**
 * Real k-th roots of v (k a positive whole number). Even k: ±root, or NaN when v < 0 so the
 * solver reports the impossibility instead of leaving the value blank.
 */
const realRoots = (v: number, k: number): number[] | undefined => {
  if (!Number.isInteger(k) || k < 1 || !Number.isFinite(v)) return undefined;
  if (k % 2 === 1) return [Math.sign(v) * Math.abs(v) ** (1 / k)];
  return v < 0 ? [NaN] : plusMinus(v ** (1 / k));
};

/** d/dx of c·xⁿ = n·c·xⁿ⁻¹ (0 when n = 0, avoiding 0⁻¹). */
const powerRule = (c: number, n: number, x: number) => (n === 0 ? 0 : n * c * x ** (n - 1));

export const COLLEGE_MODULES: ModuleDef[] = [
  {
    // University Physics I: Mechanics → Kinematics
    id: 'he.physics.university-1#0',
    assumptions: [
      'Acceleration is constant, and the clock starts (t = 0) when the velocity is v₀.',
      'Motion is along a straight line. Pick a positive direction; signs follow it.',
      'Free fall: a = −9.8 m/s² (−32.2 ft/s²) if up is positive.',
      'd is displacement (change in position), not total distance traveled.',
    ],
    variables: [
      {
        id: 'v0',
        symbol: 'v₀',
        name: 'Initial velocity',
        unit: 'm/s',
        min: -1000,
        max: 1000,
        step: 0.5,
      },
      { id: 'v', symbol: 'v', name: 'Final velocity', unit: 'm/s', min: -15000, max: 15000 },
      { id: 'a', symbol: 'a', name: 'Acceleration', unit: 'm/s²', min: -100, max: 100, step: 0.1 },
      { id: 't', symbol: 't', name: 'Time', unit: 's', min: 0, max: 120, step: 0.1 },
      { id: 'd', symbol: 'd', name: 'Displacement', unit: 'm', min: -1000000, max: 1000000 },
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
            const s = rootOf(disc, x.v0! ** 2 + Math.abs(2 * x.a! * x.d!));
            if (Number.isNaN(s)) return [];
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
          v: (x) =>
            plusMinus(rootOf(x.v0! ** 2 + 2 * x.a! * x.d!, x.v0! ** 2 + Math.abs(2 * x.a! * x.d!))),
          v0: (x) =>
            plusMinus(rootOf(x.v! ** 2 - 2 * x.a! * x.d!, x.v! ** 2 + Math.abs(2 * x.a! * x.d!))),
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
    steps: {
      'v = v₀ + at': {
        v: {
          expr: '{v0} + {a} × {t}',
          how: 'Velocity changes by a every second, so add a·t to the starting velocity.',
        },
        v0: { expr: '{v} − {a} × {t}', how: 'Subtract a·t from both sides.' },
        a: {
          expr: '({v} − {v0}) ÷ {t}',
          how: 'Acceleration is the change in velocity divided by the time.',
        },
        t: {
          expr: '({v} − {v0}) ÷ {a}',
          how: 'Divide the change in velocity by the acceleration.',
        },
      },
      'd = v₀t + ½at²': {
        d: {
          expr: '{v0} × {t} + ½ × {a} × {t}²',
          how: 'Add the distance covered at the starting velocity to the extra distance from accelerating.',
        },
        v0: {
          expr: '({d} − ½ × {a} × {t}²) ÷ {t}',
          how: 'Subtract ½at² from both sides, then divide by t.',
        },
        a: {
          expr: '2 × ({d} − {v0} × {t}) ÷ {t}²',
          how: 'Subtract v₀t, multiply by 2, then divide by t².',
        },
        t: {
          expr: '(−{v0} ± √({v0}² + 2 × {a} × {d})) ÷ {a}',
          how: 'Rewrite as ½a·t² + v₀·t − d = 0 and use the quadratic formula. Time can’t be negative, so keep the root that is 0 or more.',
        },
      },
      'v² = v₀² + 2ad': {
        v: {
          expr: '±√({v0}² + 2 × {a} × {d})',
          how: 'Add 2ad to v₀², then take the square root. Both + and − solve the equation: the sign is the direction of motion, so keep the one that matches how the object is moving.',
        },
        v0: {
          expr: '±√({v}² − 2 × {a} × {d})',
          how: 'Subtract 2ad from v², then take the square root. Both + and − solve the equation: the sign is the direction of motion, so keep the one that matches how the object was moving at the start.',
        },
        a: {
          expr: '({v}² − {v0}²) ÷ (2 × {d})',
          how: 'Subtract v₀² from both sides, then divide by 2d.',
        },
        d: {
          expr: '({v}² − {v0}²) ÷ (2 × {a})',
          how: 'Subtract v₀² from both sides, then divide by 2a.',
        },
      },
      'd = ½(v₀ + v)t': {
        d: {
          expr: '½ × ({v0} + {v}) × {t}',
          how: 'With constant acceleration, the average velocity is halfway between v₀ and v. Multiply it by the time.',
        },
        v0: {
          expr: '2 × {d} ÷ {t} − {v}',
          how: 'Multiply both sides by 2, divide by t, then subtract v.',
        },
        v: {
          expr: '2 × {d} ÷ {t} − {v0}',
          how: 'Multiply both sides by 2, divide by t, then subtract v₀.',
        },
        t: {
          expr: '2 × {d} ÷ ({v0} + {v})',
          how: 'Divide the displacement by the average velocity, ½(v₀ + v).',
        },
      },
    },
    example: { v0: 5, a: 2, t: 4, v: 13, d: 36 },
    startWith: ['t', 'v0', 'a'],
    representation: {
      kind: 'plot',
      x: { var: 't', min: 0, max: 10 },
      y: { var: 'v', min: -10, max: 30 },
      params: ['v0', 'a'],
      shadeToPoint: true,
      autoRange: true,
    },
  },

  {
    // Circuit Analysis I → Ohm's and Kirchhoff's laws
    id: 'he.engineering.circuits-1#0',
    assumptions: [
      'Two resistors in series with a DC source form one loop, so the same current I flows through each (Kirchhoff’s current law).',
      'Kirchhoff’s voltage law: the voltage drops around the loop add up to the source voltage.',
      'Ohm’s law holds for each resistor (V = IR, R constant); wires and the source have no resistance.',
    ],
    variables: [
      { id: 'V', symbol: 'V', name: 'Source voltage', unit: 'V', min: 0, max: 1000, step: 0.5 },
      { id: 'I', symbol: 'I', name: 'Current', unit: 'A', min: 0, max: 1000 },
      {
        id: 'R1',
        symbol: 'R₁',
        name: 'Resistor 1',
        unit: 'Ω',
        min: 0.1,
        max: 1000000,
        step: 0.5,
      },
      {
        id: 'R2',
        symbol: 'R₂',
        name: 'Resistor 2',
        unit: 'Ω',
        min: 0.1,
        max: 1000000,
        step: 0.5,
      },
      { id: 'V1', symbol: 'V₁', name: 'Voltage across R₁', unit: 'V', min: 0, max: 1000 },
      { id: 'V2', symbol: 'V₂', name: 'Voltage across R₂', unit: 'V', min: 0, max: 1000 },
      { id: 'Rt', symbol: 'Rₜ', name: 'Total resistance', unit: 'Ω', min: 0.2, max: 2000000 },
      { id: 'P', symbol: 'P', name: 'Power from source', unit: 'W', min: 0, max: 1e9 },
    ],
    relations: [
      {
        id: 'V = V₁ + V₂',
        display: '{V} = {V1} + {V2}',
        vars: ['V', 'V1', 'V2'],
        residual: (x) => x.V! - x.V1! - x.V2!,
        solve: { V: (x) => x.V1! + x.V2!, V1: (x) => x.V! - x.V2!, V2: (x) => x.V! - x.V1! },
      },
      {
        id: 'V₁ = IR₁',
        display: '{V1} = {I} × {R1}',
        vars: ['V1', 'I', 'R1'],
        residual: (x) => x.V1! - x.I! * x.R1!,
        solve: {
          V1: (x) => x.I! * x.R1!,
          I: (x) => div(x.V1!, x.R1!),
          R1: (x) => div(x.V1!, x.I!),
        },
      },
      {
        id: 'V₂ = IR₂',
        display: '{V2} = {I} × {R2}',
        vars: ['V2', 'I', 'R2'],
        residual: (x) => x.V2! - x.I! * x.R2!,
        solve: {
          V2: (x) => x.I! * x.R2!,
          I: (x) => div(x.V2!, x.R2!),
          R2: (x) => div(x.V2!, x.I!),
        },
      },
      {
        id: 'Rₜ = R₁ + R₂',
        display: '{Rt} = {R1} + {R2}',
        vars: ['Rt', 'R1', 'R2'],
        residual: (x) => x.Rt! - x.R1! - x.R2!,
        solve: { Rt: (x) => x.R1! + x.R2!, R1: (x) => x.Rt! - x.R2!, R2: (x) => x.Rt! - x.R1! },
      },
      {
        id: 'V = IRₜ',
        display: '{V} = {I} × {Rt}',
        vars: ['V', 'I', 'Rt'],
        residual: (x) => x.V! - x.I! * x.Rt!,
        solve: { V: (x) => x.I! * x.Rt!, I: (x) => div(x.V!, x.Rt!), Rt: (x) => div(x.V!, x.I!) },
      },
      {
        id: 'P = VI',
        display: '{P} = {V} × {I}',
        vars: ['P', 'V', 'I'],
        residual: (x) => x.P! - x.V! * x.I!,
        solve: { P: (x) => x.V! * x.I!, V: (x) => div(x.P!, x.I!), I: (x) => div(x.P!, x.V!) },
      },
      {
        id: 'P = I²Rₜ',
        display: '{P} = {I}² × {Rt}',
        vars: ['P', 'I', 'Rt'],
        residual: (x) => x.P! - x.I! ** 2 * x.Rt!,
        solve: {
          P: (x) => x.I! ** 2 * x.Rt!,
          I: (x) => (x.Rt! > 0 ? Math.sqrt(x.P! / x.Rt!) : undefined),
          Rt: (x) => div(x.P!, x.I! ** 2),
        },
      },
    ],
    steps: {
      'V = V₁ + V₂': {
        V: {
          expr: '{V1} + {V2}',
          how: 'Kirchhoff’s voltage law: the drops across the resistors add up to the source voltage.',
        },
        V1: { expr: '{V} − {V2}', how: 'Whatever voltage R₂ doesn’t use is dropped across R₁.' },
        V2: { expr: '{V} − {V1}', how: 'Whatever voltage R₁ doesn’t use is dropped across R₂.' },
      },
      'V₁ = IR₁': {
        V1: {
          expr: '{I} × {R1}',
          how: 'Ohm’s law for R₁: voltage drop is current times resistance.',
        },
        I: {
          expr: '{V1} ÷ {R1}',
          how: 'Ohm’s law for R₁, divided by R₁. It is the same current everywhere in the loop.',
        },
        R1: { expr: '{V1} ÷ {I}', how: 'Ohm’s law for R₁, divided by the current.' },
      },
      'V₂ = IR₂': {
        V2: {
          expr: '{I} × {R2}',
          how: 'Ohm’s law for R₂: voltage drop is current times resistance.',
        },
        I: {
          expr: '{V2} ÷ {R2}',
          how: 'Ohm’s law for R₂, divided by R₂. It is the same current everywhere in the loop.',
        },
        R2: { expr: '{V2} ÷ {I}', how: 'Ohm’s law for R₂, divided by the current.' },
      },
      'Rₜ = R₁ + R₂': {
        Rt: {
          expr: '{R1} + {R2}',
          how: 'In series the current passes through both resistors, so their resistances add.',
        },
        R1: { expr: '{Rt} − {R2}', how: 'Subtract R₂ from the total resistance.' },
        R2: { expr: '{Rt} − {R1}', how: 'Subtract R₁ from the total resistance.' },
      },
      'V = IRₜ': {
        V: { expr: '{I} × {Rt}', how: 'Ohm’s law for the whole loop, using the total resistance.' },
        I: {
          expr: '{V} ÷ {Rt}',
          how: 'Ohm’s law for the whole loop: source voltage divided by total resistance.',
        },
        Rt: { expr: '{V} ÷ {I}', how: 'Ohm’s law for the whole loop, divided by the current.' },
      },
      'P = VI': {
        P: {
          expr: '{V} × {I}',
          how: 'Power delivered by the source is its voltage times the current.',
        },
        V: { expr: '{P} ÷ {I}', how: 'Divide the power by the current.' },
        I: { expr: '{P} ÷ {V}', how: 'Divide the power by the voltage.' },
      },
      'P = I²Rₜ': {
        P: { expr: '{I}² × {Rt}', how: 'Substitute V = IRₜ into P = VI.' },
        I: {
          expr: '√({P} ÷ {Rt})',
          how: 'Divide by Rₜ, then take the square root (current is positive here).',
        },
        Rt: { expr: '{P} ÷ {I}²', how: 'Divide the power by the current squared.' },
      },
    },
    example: { V: 12, R1: 2, R2: 4, Rt: 6, I: 2, V1: 4, V2: 8, P: 24 },
    startWith: ['V', 'R1', 'R2'],
    representation: {
      kind: 'seriesCircuit',
      source: 'V',
      current: 'I',
      resistors: [
        { r: 'R1', v: 'V1' },
        { r: 'R2', v: 'V2' },
      ],
    },
  },

  {
    // Calculus I → Derivatives and differentiation rules
    id: 'he.math.calc-1#1',
    assumptions: [
      'f′(x) = lim (h → 0) [f(x + h) − f(x)] ÷ h: the slope of the tangent line at x.',
      'Power rule: the derivative of xⁿ is n·xⁿ⁻¹.',
      'Constant-multiple rule: a constant c multiplies the derivative too.',
      'This module covers the power and constant-multiple rules; n is a whole number 0–5, so f is defined for every x.',
    ],
    variables: [
      { id: 'x', symbol: 'x', name: 'Point x', min: -3, max: 3, step: 0.1 },
      { id: 'c', symbol: 'c', name: 'Constant c', min: -5, max: 5, step: 0.5 },
      { id: 'n', symbol: 'n', name: 'Power n', min: 0, max: 5, step: 1, integer: true },
      { id: 'y', symbol: 'f(x)', name: 'Function value', min: -2000, max: 2000 },
      { id: 'm', symbol: 'f′(x)', name: 'Slope of tangent', min: -5000, max: 5000 },
    ],
    relations: [
      {
        id: 'f(x) = c·xⁿ',
        display: '{y} = {c} × {x}^{n}',
        vars: ['y', 'c', 'x', 'n'],
        residual: (v) => v.y! - v.c! * v.x! ** v.n!,
        solve: {
          y: (v) => v.c! * v.x! ** v.n!,
          // Where no value works, return [NaN] so the solver reports the impossibility.
          c: (v) => {
            const xn = v.x! ** v.n!;
            if (xn !== 0) return v.y! / xn;
            return v.y === 0 ? undefined : [NaN];
          },
          x: (v) => {
            // f is constant (c when n = 0, 0 when c = 0): any x works if f matches, none if not.
            if (v.n === 0 || v.c === 0) {
              return Math.abs(v.y! - (v.n === 0 ? v.c! : 0)) < 1e-9 ? undefined : [NaN];
            }
            return realRoots(v.y! / v.c!, v.n!);
          },
          n: (v) => {
            if (v.c === 0) return v.y === 0 ? undefined : [NaN];
            const ratio = v.y! / v.c!;
            if (ratio === 0 || Math.abs(v.x!) === 1 || v.x === 0) return undefined;
            return [Math.round(Math.log(Math.abs(ratio)) / Math.log(Math.abs(v.x!)))];
          },
        },
      },
      {
        id: 'f′(x) = n·c·xⁿ⁻¹',
        display: '{m} = {n} × {c} × {x}^({n} − 1)',
        // A constant (n = 0) has slope 0 everywhere; "0 × c × 0^(−1)" would read as 0 × ∞.
        check: (v) => {
          const num = (x: number) => (x < 0 ? `(${formatNumber(x)})` : formatNumber(x));
          return v.n === 0
            ? `${num(v.m!)} = 0 × ${num(v.c!)}`
            : `${num(v.m!)} = ${v.n} × ${num(v.c!)} × ${num(v.x!)}^(${v.n} − 1)`;
        },
        vars: ['m', 'n', 'c', 'x'],
        residual: (v) => v.m! - powerRule(v.c!, v.n!, v.x!),
        solve: {
          m: (v) => powerRule(v.c!, v.n!, v.x!),
          c: (v) => {
            const d = v.n === 0 ? 0 : v.n! * v.x! ** (v.n! - 1);
            if (d !== 0) return v.m! / d;
            return v.m === 0 ? undefined : [NaN];
          },
          x: (v) => {
            // f′ is constant (0 when n = 0 or c = 0, c when n = 1): any x works, or none.
            if (v.n === 0 || v.c === 0) return v.m === 0 ? undefined : [NaN];
            if (v.n === 1) return Math.abs(v.m! - v.c!) < 1e-9 ? undefined : [NaN];
            return realRoots(v.m! / (v.n! * v.c!), v.n! - 1);
          },
        },
      },
    ],
    steps: {
      'f(x) = c·xⁿ': {
        y: { expr: '{c} × {x}^{n}', how: 'Raise x to the power n, then multiply by c.' },
        c: { expr: '{y} ÷ {x}^{n}', how: 'Divide both sides by xⁿ.' },
        x: {
          expr: '({y} ÷ {c})^(1 ÷ {n})',
          how: 'Divide by c, then take the n-th root. For even n both signs work; the one nearest the current point is shown.',
        },
        n: {
          expr: 'ln|{y} ÷ {c}| ÷ ln|{x}|',
          how: 'Divide by c, then take logarithms of both sides to bring n down; round to the nearest whole number.',
        },
      },
      'f′(x) = n·c·xⁿ⁻¹': {
        m: {
          // A constant (n = 0) has slope 0: "0 × c × x^(−1)" would read as 0 × ∞ at x = 0.
          expr: (v) => (v.n === 0 ? '0 × {c}' : '{n} × {c} × {x}^({n} − 1)'),
          how: (v) =>
            v.n === 0
              ? 'The function is the constant c, so its slope is 0 everywhere.'
              : 'Power rule: bring n down in front and lower the power by 1. Constant-multiple rule: keep c.',
        },
        c: { expr: '{m} ÷ ({n} × {x}^({n} − 1))', how: 'Divide both sides by n·xⁿ⁻¹.' },
        x: {
          expr: '({m} ÷ ({n} × {c}))^(1 ÷ ({n} − 1))',
          how: 'Divide by n·c, then take the (n − 1)-th root.',
        },
      },
    },
    example: { c: 1, n: 2, x: 1.5, y: 2.25, m: 3 },
    startWith: ['x', 'c', 'n'],
    representation: {
      kind: 'plot',
      x: { var: 'x', min: -3, max: 3 },
      y: { var: 'y', min: -4, max: 10 },
      params: ['c', 'n'],
      tangentSlope: 'm',
      autoRange: true,
    },
  },

  {
    // Human Geography → Population and migration
    id: 'he.geography.human-geography#0',
    assumptions: [
      'Counts are for one place over one year; P₀ is the mid-year population.',
      'Population changes only through births, deaths, and people moving in or out.',
      'Rates per 1,000 people (CBR, CDR) let you compare places of different sizes.',
      'Rule of 70: if RNI stays the same (ignoring migration), the population doubles in about 70 ÷ RNI years.',
    ],
    variables: [
      { id: 'Pop', symbol: 'P₀', name: 'Population', min: 1, max: 1e10 },
      { id: 'B', symbol: 'B', name: 'Births', min: 0, max: 1e9, step: 100, integer: true },
      { id: 'D', symbol: 'D', name: 'Deaths', min: 0, max: 1e9, step: 100, integer: true },
      { id: 'I', symbol: 'I', name: 'Immigrants', min: 0, max: 1e9, step: 100, integer: true },
      { id: 'E', symbol: 'E', name: 'Emigrants', min: 0, max: 1e9, step: 100, integer: true },
      { id: 'N', symbol: 'N', name: 'Natural increase', min: -1e9, max: 1e9, integer: true },
      { id: 'M', symbol: 'M', name: 'Net migration', min: -1e9, max: 1e9, integer: true },
      { id: 'P', symbol: 'ΔP', name: 'Population change', min: -2e9, max: 2e9, integer: true },
      { id: 'CBR', symbol: 'CBR', name: 'Crude birth rate', unit: 'per 1,000', min: 0, max: 100 },
      { id: 'CDR', symbol: 'CDR', name: 'Crude death rate', unit: 'per 1,000', min: 0, max: 100 },
      { id: 'RNI', symbol: 'RNI', name: 'Rate of natural increase', unit: '%', min: -10, max: 10 },
      { id: 'Td', symbol: 'T₂', name: 'Doubling time', unit: 'years', min: 0, max: 1e9 },
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
      {
        id: 'CBR = B ÷ P₀ × 1,000',
        display: '{CBR} = {B} ÷ {Pop} × 1,000',
        vars: ['CBR', 'B', 'Pop'],
        residual: (v) => v.CBR! - (1000 * v.B!) / v.Pop!,
        solve: {
          CBR: (v) => div(1000 * v.B!, v.Pop!),
          B: (v) => (v.CBR! * v.Pop!) / 1000,
          Pop: (v) => div(1000 * v.B!, v.CBR!),
        },
      },
      {
        id: 'CDR = D ÷ P₀ × 1,000',
        display: '{CDR} = {D} ÷ {Pop} × 1,000',
        vars: ['CDR', 'D', 'Pop'],
        residual: (v) => v.CDR! - (1000 * v.D!) / v.Pop!,
        solve: {
          CDR: (v) => div(1000 * v.D!, v.Pop!),
          D: (v) => (v.CDR! * v.Pop!) / 1000,
          Pop: (v) => div(1000 * v.D!, v.CDR!),
        },
      },
      {
        id: 'RNI = (CBR − CDR) ÷ 10',
        display: '{RNI} = ({CBR} − {CDR}) ÷ 10',
        vars: ['RNI', 'CBR', 'CDR'],
        residual: (v) => v.RNI! - (v.CBR! - v.CDR!) / 10,
        solve: {
          RNI: (v) => (v.CBR! - v.CDR!) / 10,
          CBR: (v) => 10 * v.RNI! + v.CDR!,
          CDR: (v) => v.CBR! - 10 * v.RNI!,
        },
      },
      {
        id: 'RNI = N ÷ P₀ × 100',
        display: '{RNI} = {N} ÷ {Pop} × 100',
        vars: ['RNI', 'N', 'Pop'],
        residual: (v) => v.RNI! - (100 * v.N!) / v.Pop!,
        solve: {
          RNI: (v) => div(100 * v.N!, v.Pop!),
          N: (v) => (v.RNI! * v.Pop!) / 100,
          Pop: (v) => (v.RNI === 0 ? undefined : div(100 * v.N!, v.RNI!)),
        },
      },
      {
        id: 'T₂ ≈ 70 ÷ RNI',
        display: '{Td} ≈ 70 ÷ {RNI}',
        vars: ['Td', 'RNI'],
        residual: (v) => v.Td! * v.RNI! - 70,
        // Doubling only makes sense for growth, so no doubling time when RNI ≤ 0.
        solve: {
          Td: (v) => (v.RNI! > 0 ? 70 / v.RNI! : undefined),
          RNI: (v) => (v.Td! > 0 ? 70 / v.Td! : undefined),
        },
      },
    ],
    steps: {
      'N = B − D': {
        N: { expr: '{B} − {D}', how: 'Natural increase is births minus deaths.' },
        B: { expr: '{N} + {D}', how: 'Add the deaths back to the natural increase.' },
        D: { expr: '{B} − {N}', how: 'Subtract the natural increase from the births.' },
      },
      'M = I − E': {
        M: { expr: '{I} − {E}', how: 'Net migration is people moving in minus people moving out.' },
        I: { expr: '{M} + {E}', how: 'Add the emigrants back to the net migration.' },
        E: { expr: '{I} − {M}', how: 'Subtract the net migration from the immigrants.' },
      },
      'ΔP = N + M': {
        P: { expr: '{N} + {M}', how: 'Population change is natural increase plus net migration.' },
        N: { expr: '{P} − {M}', how: 'Subtract the net migration from the population change.' },
        M: { expr: '{P} − {N}', how: 'Subtract the natural increase from the population change.' },
      },
      'CBR = B ÷ P₀ × 1,000': {
        CBR: {
          expr: '{B} ÷ {Pop} × 1,000',
          how: 'Births per person, scaled to births per 1,000 people.',
        },
        B: {
          expr: '{CBR} × {Pop} ÷ 1,000',
          how: 'CBR births for every 1,000 people: multiply by the number of thousands.',
        },
        Pop: {
          expr: '{B} ÷ {CBR} × 1,000',
          how: 'Each 1,000 people had CBR births, so divide births by CBR and multiply by 1,000.',
        },
      },
      'CDR = D ÷ P₀ × 1,000': {
        CDR: {
          expr: '{D} ÷ {Pop} × 1,000',
          how: 'Deaths per person, scaled to deaths per 1,000 people.',
        },
        D: {
          expr: '{CDR} × {Pop} ÷ 1,000',
          how: 'CDR deaths for every 1,000 people: multiply by the number of thousands.',
        },
        Pop: {
          expr: '{D} ÷ {CDR} × 1,000',
          how: 'Each 1,000 people had CDR deaths, so divide deaths by CDR and multiply by 1,000.',
        },
      },
      'RNI = (CBR − CDR) ÷ 10': {
        RNI: {
          expr: '({CBR} − {CDR}) ÷ 10',
          how: 'Subtract the death rate from the birth rate; dividing by 10 turns “per 1,000” into a percent.',
        },
        CBR: {
          expr: '10 × {RNI} + {CDR}',
          how: 'Multiply RNI by 10 to get “per 1,000”, then add the death rate.',
        },
        CDR: {
          expr: '{CBR} − 10 × {RNI}',
          how: 'Multiply RNI by 10 to get “per 1,000”, then subtract it from the birth rate.',
        },
      },
      'RNI = N ÷ P₀ × 100': {
        RNI: { expr: '{N} ÷ {Pop} × 100', how: 'Natural increase as a percent of the population.' },
        N: { expr: '{RNI} × {Pop} ÷ 100', how: 'Take RNI percent of the population.' },
        Pop: {
          expr: '{N} ÷ {RNI} × 100',
          how: 'N is RNI percent of the population, so divide by RNI and multiply by 100.',
        },
      },
      'T₂ ≈ 70 ÷ RNI': {
        Td: {
          expr: '70 ÷ {RNI}',
          how: 'Rule of 70: steady growth of RNI% a year doubles a population in about 70 ÷ RNI years.',
        },
        RNI: { expr: '70 ÷ {Td}', how: 'Rule of 70 in reverse: divide 70 by the doubling time.' },
      },
    },
    example: {
      Pop: 500000,
      B: 6000,
      D: 4000,
      I: 3000,
      E: 1000,
      N: 2000,
      M: 2000,
      P: 4000,
      CBR: 12,
      CDR: 8,
      RNI: 0.4,
      Td: 175,
    },
    startWith: ['Pop', 'B', 'D', 'I', 'E'],
    representation: {
      kind: 'waterfall',
      items: [
        { var: 'B', sign: 1, editable: true },
        { var: 'D', sign: -1, editable: true },
        { var: 'I', sign: 1, editable: true },
        { var: 'E', sign: -1, editable: true },
      ],
      total: 'P',
      caption: ['N', 'M', 'P'],
    },
  },
];
