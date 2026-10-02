/**
 * The harness reads linear algebra and complex lines (HE-E16, HE-E17): every form the engine
 * writes is read back and checked, a wrong number in any of them is caught, and the module
 * helpers (`complexRule`, `cramerRules` in written.ts) give steps the harness passes.
 */
import { getModule } from '@/data/modules';
import { buildSteps } from '@/data/modules/buildSteps';
import * as cx from '@/engine/complex';
import * as la from '@/engine/linalg';
import { solve } from '@/engine/solve';

import {
  ALGEBRA_LINE,
  checkAlgebraLine,
  checkAlgebraLines,
  evaluateAlgebra,
  readableSides,
} from '../harness/algebraLines';
import { evaluate, plainWalkthrough } from '../harness/evaluate';
import type { ModuleDef } from '../types';
import {
  complexRule,
  complexVariables,
  polarVariables,
  cramerRules,
  joinRules,
  matrixVariables,
  vectorVariables,
} from '../written';

/** A seeded generator, so a failure repeats. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

const J = { unit: 'j' as const };

/** Every line the engine writes for these inputs. */
function allLines(r: () => number): string[][] {
  const int = (lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
  const mat = (n: number, m = n) =>
    Array.from({ length: n }, () => Array.from({ length: m }, () => int(-6, 6)));
  const vec = (n: number) => Array.from({ length: n }, () => int(-6, 6));
  const z = () => cx.complex(int(-9, 9), int(-9, 9));
  const nz = () => {
    const w = z();
    return w.re === 0 && w.im === 0 ? cx.complex(1, 1) : w;
  };
  const style = r() < 0.5 ? J : { unit: 'i' as const, show: la.exactShow };
  const [A2, A3] = [mat(2), mat(3)];
  return [
    la.matVecLines(mat(2, 3), vec(3)),
    la.matMulLines(mat(2), mat(2)),
    la.matMulLines(mat(3), mat(3, 2)),
    la.detLines(A2),
    la.detLines(A3),
    la.cramerLines(A2, vec(2)),
    la.cramerLines(A3, vec(3)),
    la.inverseLines(A2),
    la.inverseLines(A3),
    la.rrefLines(mat(3, 4), la.exactShow, 3),
    la.rankNullityLines(mat(3, 4)),
    la.eigenLines(A2),
    la.eigenLines([
      [int(-5, 5), int(-5, 5), 0],
      [0, int(-5, 5), 0],
      [int(-5, 5), int(-5, 5), int(-5, 5)],
    ]),
    [la.dotLine(vec(3), vec(3)), la.crossLine(vec(3), vec(3)), la.normLine(vec(2))],
    la.projectionLines(vec(2), [int(1, 5), int(-5, 5)]),
    cx.complexSumLines(z(), z(), r() < 0.5 ? '+' : '−', style),
    cx.complexProductLines(z(), z(), style),
    cx.complexQuotientLines(z(), nz(), style),
    cx.polarProductLines(nz(), nz(), style),
    cx.polarQuotientLines(nz(), nz(), style),
    cx.toPolarLines(nz(), style),
    cx.toRectangularLines(int(1, 50), int(-179, 180), style),
    [cx.conjugateLine(z(), style)],
  ];
}

describe('reading linear algebra and complex lines', () => {
  it('passes every form the engine writes, for many inputs', () => {
    const r = rng(7);
    const problems: string[] = [];
    for (let k = 0; k < 150; k++)
      for (const lines of allLines(r)) problems.push(...checkAlgebraLines(lines));
    expect(problems).toEqual([]);
  });

  it('catches a wrong number in any line it reads', () => {
    const r = rng(11);
    let read = 0;
    const missed: string[] = [];
    for (let k = 0; k < 40; k++) {
      for (const lines of allLines(r)) {
        lines.forEach((line, i) => {
          // Only the lines it reads (a matrix, a vector, i or j, ∠, λ, det, a row operation).
          if (!ALGEBRA_LINE.test(line)) return;
          // The last number of the line, well off (display rounding hides a last digit).
          const last = [...line.matchAll(/\d+(?:\.\d+)?/g)].pop();
          if (!last) return;
          const x = Number(last[0]);
          const wrong = `${line.slice(0, last.index)}${x + 1 + x}${line.slice(last.index! + last[0].length)}`;
          // A given (the start of a reduction), the list of a cubic's roots (each root is
          // checked on its own line) and a number times 0 say nothing to check.
          if (/^(?:Start: |\[A \| I\] = )|: λ = .*, /.test(line)) return;
          if (/(?:^|[^\d.])0 × \(?−?$|(?:^|[^\d.])0⟨[^⟩]*$/.test(line.slice(0, last.index))) return;
          const before = checkAlgebraLines(lines.slice(0, i + 1));
          if (before.length) return;
          const after = checkAlgebraLines([...lines.slice(0, i), wrong]);
          // Lines with one readable side ("A⁻¹ = […]") say nothing to check; a cofactor line's
          // minors are checked by the lines after it.
          if (readableSides(line) < 2 && !/^R[₀-₉]+ [→↔]/.test(line)) return;
          if (/det [^=]*$/.test(line)) return;
          read++;
          if (!after.length) missed.push(`${line}  →  ${wrong}`);
        });
      }
    }
    expect(read).toBeGreaterThan(1000);
    expect(missed).toEqual([]);
  });

  it('reads each form', () => {
    const ok = [
      '[[2, 1], [3, 4]] × ⟨5, −1⟩ = ⟨9, 11⟩',
      'det [[4, 7], [2, 6]] = 4 × 6 − 7 × 2 = 10',
      '⟨1, 2, 3⟩ × ⟨2, 0, 1⟩ = ⟨2, 5, −4⟩',
      '⟨3, 4⟩ · ⟨4, −3⟩ = 0',
      '|⟨3, 4⟩| = 5',
      '[[4, 1], [2, 3]] − 5I = [[−1, 1], [2, −2]]',
      '[[2, 1], [1, 1]]⁻¹ = [[1, −1], [−1, 2]]',
      '[[1, 2], [3, 4]]ᵀ = [[1, 3], [2, 4]]',
      '(1/10)[[6, −7], [−2, 4]] = [[0.6, −0.7], [−0.2, 0.4]]',
      'det([[4 − λ, 1], [2, 3 − λ]]) = λ² − 7λ + 10',
      'λ = (7 ± √9) ÷ 2 = 5 or 2',
      'r = (−2 ± √(4 − 40)) ÷ 2 = −1 ± 3i',
      '(30 + j40) ÷ (1 − j2) = −10 + j20',
      '10∠36.87° = 8 + j6',
      '|8 + j6| = 10',
      'i¹⁵ = i³ = −i',
      '(3 + 4i) ÷ (1 + 2i) = 11/5 − 2/5 i',
      'Z = 30 + j40 Ω = 50∠53.13° Ω',
    ];
    expect(ok.flatMap((l) => checkAlgebraLine(l).problems)).toEqual([]);
    const wrong = [
      '[[2, 1], [3, 4]] × ⟨5, −1⟩ = ⟨9, 12⟩',
      'det [[4, 7], [2, 6]] = 4 × 6 − 7 × 2 = 11',
      '⟨1, 2, 3⟩ × ⟨2, 0, 1⟩ = ⟨2, −5, −4⟩',
      'det([[4 − λ, 1], [2, 3 − λ]]) = λ² − 7λ + 12',
      'λ = (7 ± √9) ÷ 2 = 5 or 3',
      '(30 + j40) ÷ (1 − j2) = −10 − j20',
      '10∠36.87° = 6 + j8',
      '[[1, 2]] = ⟨1, 2, 3⟩',
    ];
    for (const l of wrong) expect([l, checkAlgebraLine(l).problems.length > 0]).toEqual([l, true]);
    // Unit vectors (3i + 4j) and names (A, v) are not read.
    expect(checkAlgebraLine('v = 3i + 4j = ⟨3, 4⟩').problems).toEqual([]);
    expect(checkAlgebraLine('A × v = λv').problems).toEqual([]);
    // A row operation is checked against the matrix before it.
    expect(
      checkAlgebraLines(['Start: [[1, 2], [3, 4]]', 'R₂ → R₂ − 3R₁: [[1, 2], [0, −2]]']),
    ).toEqual([]);
    expect(
      checkAlgebraLines(['Start: [[1, 2], [3, 4]]', 'R₂ → R₂ − 3R₁: [[1, 2], [0, 2]]']).length,
    ).toBe(1);
    expect(checkAlgebraLines(['Start: [[1, 2], [3, 4]]', 'R₁ ↔ R₂: [[1, 2], [3, 4]]']).length).toBe(
      1,
    );
  });

  it('gives the scalar reader complex parts and determinants', () => {
    expect(evaluateAlgebra('Re((30 + j40) ÷ (1 − j2))')).toEqual({ re: -10, im: 0 });
    expect(evaluate('Re((30 + j40) ÷ (1 − j2))')).toBeCloseTo(-10, 9);
    expect(evaluate('Im((30 + j40) ÷ (1 − j2))')).toBeCloseTo(20, 9);
    expect(evaluate('2 × Im((3 + 4i)(1 − 2i))')).toBeCloseTo(-4, 9);
    expect(evaluate('det [[4, 7], [2, 6]] ÷ 5')).toBeCloseTo(2, 9);
    expect(evaluate('|(3 + j4)(1 + j1)|')).toBeCloseTo(5 * Math.SQRT2, 9);
    // What it read before is read the same.
    expect(evaluate('|8 + j6|')).toBeCloseTo(10, 9);
    expect(evaluate('the real part of 10∠36.87°')).toBeCloseTo(8, 3);
  });

  it('reads the complex lines of the Grade 11 pages', () => {
    const m = getModule('m.11.complex-numbers')!;
    const given = m.startWith.map((id) => ({ id, value: m.example[id]! }));
    const w = plainWalkthrough(
      buildSteps(m, solve({ variables: m.variables, relations: m.relations }, given)),
    );
    const lines = w.steps.flatMap((s) => s.lines);
    expect(lines).toContain('(2 + 3i)(1 − 4i) = 2 − 8i + 3i − 12i²');
    expect(checkAlgebraLines(lines)).toEqual([]);
    const at = lines.indexOf('(2 + 3i)(1 − 4i) = 2 − 8i + 3i − 12i²');
    expect(checkAlgebraLines([lines[at]!.replace('12i²', '12i')]).length).toBe(1);
  });
});

/** A page built only from the helpers, to show they give steps the harness passes. */
function walk(m: ModuleDef) {
  const given = m.startWith.map((id) => ({ id, value: m.example[id]! }));
  const res = solve({ variables: m.variables, relations: m.relations }, given);
  return plainWalkthrough(buildSteps(m, res));
}

describe('complex values and systems on a page', () => {
  it('works a transmission line’s input impedance as one complex value', () => {
    // Z_in = Z₀(Z_L + jZ₀ tan βℓ) ÷ (Z₀ + jZ_L tan βℓ), ℓ = λ/8 (tan βℓ = 1): 40 − j30 Ω.
    const style = { unit: 'j' as const, unitText: 'Ω', polar: true };
    const rule = complexRule({
      target: 'Zin',
      symbol: 'Z_in',
      complexInputs: ['ZL'],
      realInputs: ['Z0', 't'],
      formula: '{Z0}({ZL} + j{Z0} × {t}) ÷ ({Z0} + j{ZL} × {t})',
      f: (z, v) => {
        const jt = cx.complex(0, v.t!);
        const top = cx.cScale(cx.cAdd(z.ZL!, cx.cScale(jt, v.Z0!)), v.Z0!);
        return cx.cDiv(top, cx.cAdd(cx.complex(v.Z0!), cx.cMul(jt, z.ZL!)));
      },
      lines: (z, v) => {
        const jt = cx.complex(0, v.t!);
        const top = cx.cScale(cx.cAdd(z.ZL!, cx.cScale(jt, v.Z0!)), v.Z0!);
        const bottom = cx.cAdd(cx.complex(v.Z0!), cx.cMul(jt, z.ZL!));
        return cx.complexQuotientLines(top, bottom, style);
      },
      how: 'Put the load and tan βℓ into the input-impedance rule, then divide by the conjugate.',
      style,
    });
    const m: ModuleDef = {
      id: 'he.engineering.electromagnetics#0~input-impedance',
      title: 'Input impedance',
      assumptions: ['j² = −1.', 'A lossless line.'],
      variables: [
        { id: 'Z0', symbol: 'Z₀', name: 'Line impedance', unit: 'Ω', min: 1, max: 1000 },
        {
          id: 't',
          symbol: 'tan βℓ',
          name: 'Tangent of the electrical length',
          min: -100,
          max: 100,
        },
        ...complexVariables('ZL', 'Z_L', 'Load impedance', { unit: 'Ω' }),
        ...complexVariables('Zin', 'Z_in', 'Input impedance', { unit: 'Ω', derived: true }),
      ],
      ...rule,
      example: { Z0: 50, t: 1, ZLr: 100, ZLi: 0, Zinr: 40, Zini: -30 },
      startWith: ['Z0', 't', 'ZLr', 'ZLi'],
      representation: { kind: 'none' },
    };
    const w = walk(m);
    expect(w.missing).toEqual([]);
    const im = w.steps.find((s) => s.id === 'Zini')!;
    expect(im.result).toBe('Im Z_in = -30 Ω → Z_in = 40 − j30 Ω = 50∠-36.87° Ω');
    for (const s of w.steps) {
      expect(checkAlgebraLines(s.lines)).toEqual([]);
      const line = s.substituted ?? s.rearranged!;
      expect(evaluate(line.slice(line.indexOf(' = ') + 3))).toBeCloseTo(
        s.id === 'Zinr' ? 40 : -30,
        6,
      );
    }
    expect(w.check.every((c) => c.ok)).toBe(true);
  });

  it('takes phasors typed in polar form: a generator’s E = V + jXₛI', () => {
    const style = { unit: 'j' as const, unitText: 'pu', polar: true };
    const rule = complexRule({
      target: 'E',
      symbol: 'E',
      complexInputs: ['V', 'I'],
      polarInputs: ['V', 'I'],
      realInputs: ['X'],
      formula: '{V} + j{X} × {I}',
      f: (z, v) => cx.cAdd(z.V!, cx.cMul(cx.complex(0, v.X!), z.I!)),
      lines: (z, v) => {
        const jx = cx.complex(0, v.X!);
        const drop = cx.cMul(jx, z.I!);
        return [
          ...cx.polarProductLines(jx, z.I!, style),
          ...cx.toRectangularLines(cx.cAbs(drop), cx.cArgDeg(drop), style),
          ...cx.complexSumLines(z.V!, cx.tidyComplex(drop), '+', style),
        ];
      },
      how: 'Add the drop across the synchronous reactance to the terminal voltage.',
      style,
    });
    const m: ModuleDef = {
      id: 'he.engineering.power#1~sync-generator',
      title: 'Synchronous generator',
      assumptions: ['j² = −1.', 'Per-unit values.'],
      variables: [
        ...polarVariables('V', 'V', 'Terminal voltage', { unit: 'pu' }),
        ...polarVariables('I', 'I', 'Armature current', { unit: 'pu' }),
        { id: 'X', symbol: 'Xₛ', name: 'Synchronous reactance', unit: 'pu', min: 0, max: 10 },
        ...complexVariables('E', 'E', 'Internal voltage', { unit: 'pu', derived: true }),
      ],
      ...rule,
      // (the angle of 0.8 − j0.6, so the example holds exactly)
      example: {
        Vm: 1,
        Va: 0,
        Im: 1,
        Ia: cx.cArgDeg(cx.complex(0.8, -0.6)),
        X: 1.2,
        Er: 1.72,
        Ei: 0.96,
      },
      startWith: ['Vm', 'Va', 'Im', 'Ia', 'X'],
      representation: { kind: 'none' },
    };
    const w = walk(m);
    expect(w.missing).toEqual([]);
    expect(w.steps.find((s) => s.id === 'Ei')!.result).toBe(
      'Im E = 0.96 pu → E = 1.72 + j0.96 pu = 1.9698∠29.17° pu',
    );
    for (const s of w.steps) {
      expect(checkAlgebraLines(s.lines)).toEqual([]);
      const line = s.substituted ?? s.rearranged!;
      expect(evaluate(line.slice(line.indexOf(' = ') + 3))).toBeCloseTo(
        s.id === 'Er' ? 1.72 : 0.96,
        3,
      );
    }
    // The groups count once each: V, I, Xₛ and E are four values.
    expect(new Set(m.variables.map((v) => v.group ?? v.id)).size).toBe(4);
  });

  it('solves a 3 × 3 system by Cramer’s rule, the matrix one group', () => {
    const rules = cramerRules({ a: 'A', b: 'b', x: ['x', 'y', 'z'], D: 'D' });
    const m: ModuleDef = {
      id: 'he.math.linear-algebra#2~cramer-demo',
      title: 'Cramer',
      assumptions: ['D ≠ 0.'],
      variables: [
        ...matrixVariables('A', 'a', 'Coefficients', 3, 3),
        ...vectorVariables('b', 'b', 'Right sides', 3),
        { id: 'D', symbol: 'D', name: 'Determinant', min: -1e6, max: 1e6, derived: true },
        ...['x', 'y', 'z'].map((id) => ({
          id,
          symbol: id,
          name: `Solution ${id}`,
          min: -1e6,
          max: 1e6,
          derived: true,
        })),
      ],
      ...joinRules(rules),
      example: {},
      startWith: [],
      representation: { kind: 'none' },
    };
    const A = [
      [1, 1, 1],
      [2, -1, 1],
      [1, 2, -1],
    ];
    const b = [6, 3, 2];
    m.example = Object.fromEntries([
      ...A.flatMap((r, i) => r.map((x, j) => [`A${i + 1}${j + 1}`, x])),
      ...b.map((x, i) => [`b${i + 1}`, x]),
    ]);
    m.startWith = Object.keys(m.example);
    const w = walk(m);
    expect(Object.fromEntries(w.steps.map((s) => [s.id, s.result]))).toEqual({
      D: 'D = 7',
      x: 'x = 1',
      y: 'y = 2',
      z: 'z = 3',
    });
    expect(new Set(m.variables.map((v) => v.group ?? v.id)).size).toBe(6);
    for (const s of w.steps) {
      expect(checkAlgebraLines(s.lines)).toEqual([]);
      const line = s.substituted ?? s.rearranged!;
      expect(evaluate(line.slice(line.indexOf(' = ') + 3))).toBeCloseTo(
        { D: 7, x: 1, y: 2, z: 3 }[s.id]!,
        6,
      );
    }
  });
});
