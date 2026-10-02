/**
 * College Mathematics: the calculator modules of every course whose home field is
 * `math`, keyed by course topic (`<courseId>#<i>`, its problem types `<courseId>#<i>~<slug>`
 * after it), in taxonomy order. Course and topic titles come from taxonomy.ts. Layout pages are
 * in `../layouts/collegeMath.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { formatNumber } from '@/engine/format';

import type { ModuleDef } from '../types';

import { powerRule, realRoots } from './shared';

export const COLLEGE_MATH_MODULES: ModuleDef[] = [
  {
    // Calculus I → Derivatives and differentiation rules
    id: 'he.math.calc-1#1',
    use: 'Use this for “Find the slope of y = 3x⁴ at x = −1.”',
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
          // For even n the negative root is written with its sign.
          expr: (v) => (v.x! < 0 && v.n! % 2 === 0 ? '−' : '') + '({y} ÷ {c})^(1 ÷ {n})',
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
          expr: (v) =>
            (v.x! < 0 && (v.n! - 1) % 2 === 0 ? '−' : '') + '({m} ÷ ({n} × {c}))^(1 ÷ ({n} − 1))',
          how: 'Divide by n·c, then take the (n − 1)-th root.',
        },
      },
    },
    example: { c: 1, n: 2, x: 1.5, y: 2.25, m: 3 },
    startWith: ['x', 'c', 'n'],
    // Moves to `functionGraph` `family: 'power'` with `tangent` once HC37 is drawn (the plan).
    representation: {
      kind: 'plot',
      x: { var: 'x', min: -3, max: 3 },
      y: { var: 'y', min: -4, max: 10 },
      params: ['c', 'n'],
      tangentSlope: 'm',
      autoRange: true,
    },
  },
];
