/**
 * The harness reads whole-number lines exactly (HE-E21): every line `engine/integers.ts` writes
 * reads true, a wrong number in any of them is caught (the last digit of 2⁶⁴ too), K–12 lines
 * read as before, and test-only pages built with `integerRules.ts` give steps the harness passes.
 */
import { buildSteps } from '@/data/modules/buildSteps';
import * as z from '@/engine/integers';
import { solve } from '@/engine/solve';

import { checkAlgebraLines } from '../harness/algebraLines';
import { checkCalculus } from '../harness/calculus';
import { evaluate, plainWalkthrough, shownClose } from '../harness/evaluate';
import {
  INTEGER_LINE,
  checkIntegerLine,
  checkIntegerLines,
  formValueAt,
  readInteger,
} from '../harness/integerLines';
import { baseRule, integerRule, twosRule } from '../integerRules';
import type { Values } from '@/engine/types';

import type { ModuleDef } from '../types';
import { joinRules } from '../written';

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

/** Every group of lines the engine writes for these inputs (each group read in order). */
function allLines(r: () => number): string[][] {
  const int = (lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
  const bits = [4, 8, 16, 32][int(0, 3)]!;
  const N = int(1, 2 ** (bits - 1));
  const a = int(-500, 5000);
  const b = int(1, 300);
  const addr = int(0, 2 ** 32 - 1);
  const prefix = int(8, 30);
  return [
    [z.floorLine(a, b)],
    [z.ceilLine(a, b)],
    [z.modLine(a, b)],
    [z.roundLine(a / b)],
    [z.roundLine(a, 5)],
    [z.log2Line(2 ** int(0, 60))!],
    [z.ceilLog2Line(int(1, 1e6))!],
    [z.floorLog2Line(int(1, 1e6))!],
    z.gcdLines(int(1, 5000), int(1, 5000)),
    [z.lcmLine(int(1, 300), int(1, 300))],
    [z.minLine([a, b, int(-9, 9)])],
    [z.maxLine([a, b, int(-9, 9)])],
    [z.sortLine([a, b, int(-9, 9)])],
    [z.factorialLine(int(0, 40))],
    [z.permLine(int(6, 60), int(0, 6))],
    [z.chooseLine(int(10, 80), int(0, 10))],
    [z.powLine(int(2, 9), int(54, 70))],
    [z.stirlingLine(int(10, 150))],
    z.divisionLines(int(0, 1e6), ([2, 8, 16] as const)[int(0, 2)]!),
    [z.placeValueLine(int(0, 2 ** 31), ([2, 8, 16] as const)[int(0, 2)]!)],
    z.groupLines(int(0, 2 ** bits - 1), bits, r() < 0.5 ? 16 : 8),
    z.twosLines(N, bits),
    z.bcdLines(int(0, 99999)),
    [z.signedLine(int(0, 2 ** bits - 1), bits)],
    z.rangeLines(bits),
    z.wrapLines(int(-128, 127), int(-128, 127), 8),
    [z.bitFieldLine(int(0, 2 ** 32 - 1), 14, 12, { bits: 32 })],
    [z.bitFieldLine(int(0, 255), 3, 0, { bits: 8, radix: 2 })],
    z.subnetLines(addr, prefix),
  ];
}

/** The line with one of its numbers changed (a digit up by one), or undefined. */
function broken(line: string, r: () => number): string | undefined {
  // The numbers after the first "=" (a result, a term), never inside a label.
  const at = line.indexOf(' = ');
  if (at < 0) return undefined;
  const tail = line.slice(at);
  const spots = [...tail.matchAll(/\d/g)].map((m) => at + m.index!);
  if (!spots.length) return undefined;
  const k = spots[Math.floor(r() * spots.length)]!;
  const d = Number(line[k]);
  // (a binary digit stays binary)
  const next = String(/^[01][01 .]*₂/.test(line.slice(k)) ? 1 - d : (d + 1) % 10);
  return line.slice(0, k) + next + line.slice(k + 1);
}

describe('reading whole-number lines', () => {
  it('reads every line the engine writes as true', () => {
    const r = rng(7);
    for (let i = 0; i < 150; i++) {
      for (const group of allLines(r)) {
        expect([group, checkIntegerLines(group)]).toEqual([group, []]);
        // Each group starts with a line this reader is for.
        expect([group[0], INTEGER_LINE.test(group[0]!.replace(/(\d),(?=\d{3})/g, '$1'))]).toEqual([
          group[0],
          true,
        ]);
      }
    }
  });

  it('catches a wrong number in any line it reads', () => {
    const r = rng(11);
    let tried = 0;
    let caught = 0;
    for (let i = 0; i < 60; i++) {
      for (const group of allLines(r)) {
        group.forEach((line, k) => {
          const bad = broken(line, r);
          if (!bad || bad === line) return;
          const lines = [...group];
          lines[k] = bad;
          tried++;
          if (checkIntegerLines(lines).length) caught++;
        });
      }
    }
    // (a changed digit can leave a line true: 0 × 2⁴ → 1 × 2⁴ with its sum changed elsewhere is
    // still caught, but a decimal shown beside a floor, ⌊1.2031⌋ → ⌊1.2032⌋, is not wrong)
    expect(tried).toBeGreaterThan(1000);
    expect(caught / tried).toBeGreaterThan(0.9);
  });

  it('reads exactly past 2⁵³', () => {
    expect(checkIntegerLines(['2⁶⁴ = 18,446,744,073,709,551,616'])).toEqual([]);
    expect(checkIntegerLines(['2⁶⁴ = 18,446,744,073,709,551,617'])).toHaveLength(1);
    expect(
      checkIntegerLines(['C(60, 30) = 60! ÷ (30! × 30!) = 118,264,581,564,861,425']),
    ).toHaveLength(1);
    expect(checkIntegerLines(['25! = 15,511,210,043,330,985,984,000,000'])).toEqual([]);
    expect(checkIntegerLines(['25! = 15,511,210,043,330,985,984,000,001'])).toHaveLength(1);
  });

  it('checks a division with its remainder, a flip and a signed reading', () => {
    expect(checkIntegerLines(['45 ÷ 2 = 22 remainder 1'])).toEqual([]);
    expect(checkIntegerLines(['45 ÷ 2 = 21 remainder 3'])).toHaveLength(1);
    expect(checkIntegerLines(['45 ÷ 2 = 22 remainder 2'])).toHaveLength(1);
    expect(
      checkIntegerLines([
        '45 = 00101101₂',
        'Invert every bit: 11010011₂',
        'Add 1: 11010011₂ + 1 = 11010100₂',
      ]),
    ).toHaveLength(1);
    expect(checkIntegerLines(['Signed: 11010011₂ = −45'])).toEqual([]);
    expect(checkIntegerLines(['Signed: 11010011₂ = 211'])).toHaveLength(1);
    expect(checkIntegerLines(['11010011₂ = 211'])).toEqual([]);
    // (a number that can't be what it says)
    expect(checkIntegerLines(['Network: 192.168.300.0'])).toHaveLength(1);
    expect(checkIntegerLines(['45 = 58₈'])).toHaveLength(1);
  });

  it('comparisons, ≈ and clauses', () => {
    expect(checkIntegerLines(['⌈log₂ 5⌉ = 3, since 2² = 4 < 5 ≤ 8 = 2³'])).toEqual([]);
    expect(checkIntegerLines(['⌈log₂ 5⌉ = 3, since 2² = 4 < 3 ≤ 8 = 2³'])).toHaveLength(1);
    expect(checkIntegerLines(['⌈log₂ 9⌉ = 3'])).toHaveLength(1);
    expect(checkIntegerLines(['ln(100!) ≈ 363.7'])).toEqual([]);
    expect(checkIntegerLines(['ln(100!) ≈ 360'])).toHaveLength(1);
    expect(checkIntegerLines(['150 > 127, so 150 − 2⁸ = −106'])).toEqual([]);
    expect(
      checkIntegerLines(['0xB6 AND 0x0F = 0x06; 0xB6 OR 0x0F = 0xBF; 0xB6 XOR 0xFF = 0x49']),
    ).toEqual([]);
    expect(checkIntegerLines(['182 >> 2 = 45 = 00101101₂', '45 << 2 = 180'])).toEqual([]);
    expect(checkIntegerLines(['(6 + 4 − 1) mod 8 = 1'])).toEqual([]);
    expect(checkIntegerLines(['gcd(12, 18, 27) = 3; lcm(4, 6, 10) = 60'])).toEqual([]);
    expect(checkIntegerLines(['round(2.5) = 3; round(−2.5) = −3'])).toEqual([]);
  });

  it('continues a line that starts with "=" and leaves words alone', () => {
    expect(checkIntegerLines(['⌊77 ÷ 64⌋ × 64', '= 64'])).toEqual([]);
    expect(checkIntegerLines(['⌊77 ÷ 64⌋ × 64', '= 65'])).toHaveLength(1);
    expect(checkIntegerLines(['Block = 2⁶ = 64', 'Hosts: 64 − 2 = 62'])).toEqual([]);
    expect(checkIntegerLine('Network octet = ⌊a ÷ block⌋ × block').problems).toEqual([]);
  });

  it('reads K–12 lines as before (powers of i, factors, rounding)', () => {
    for (const line of [
      '45 mod 4 = 1, so i⁴⁵ = i¹ = i',
      'gcd(12, 18) = 6',
      '743 ÷ 6 = 123 remainder 5',
      '17 ÷ 5 = 3, remainder 2: 3 wholes',
      '50 ÷ 12 = 4, remainder 2',
      'min(3, 8) = 3',
      '5! = 5 × 4 × 3 × 2 × 1 = 120',
      'P(A) = 0.3',
      'O₂ + 2H₂ → 2H₂O',
      'F₂ = 12 N',
    ])
      expect([line, checkIntegerLines([line])]).toEqual([line, []]);
  });

  it('the scalar reader reads the forms through its pre-pass', () => {
    expect(evaluate('101101₂')).toBe(45);
    expect(evaluate('0x2D + 1')).toBe(46);
    expect(evaluate('2D₁₆')).toBe(45);
    expect(evaluate('2⁸ − 11010011₂')).toBe(45);
    expect(evaluate('192.168.10.77 AND 255.255.255.192')).toBe(3232238144);
    expect(evaluate('lcm(4, 6)')).toBe(12);
    expect(evaluate('round(2.5)')).toBe(3);
    expect(evaluate('gcd(12, 18, 27)')).toBe(3);
    expect(evaluate('⌈log₂ 5⌉')).toBe(3);
    expect(evaluate('⌊77 ÷ 64⌋ × 64')).toBe(64);
    // (K–12 reads unchanged)
    expect(evaluate('gcd(12, 18)')).toBe(6);
    expect(evaluate('45 mod 4')).toBe(1);
    expect(evaluate('3 + 4')).toBe(7);
    expect(formValueAt('0010 1101₂')).toBe(45);
    expect(formValueAt('192.168.10.64')).toBe(3232238144);
    expect(formValueAt('/26')).toBe(26);
    expect(formValueAt('45')).toBeUndefined();
    expect(readInteger('A₂')).toBeUndefined();
  });
});

// ── Test-only pages ──

const whole = (id: string, symbol: string, name: string, min: number, max: number, more = {}) => ({
  id,
  symbol,
  name,
  min,
  max,
  integer: true,
  ...more,
});

const SUBNET: ModuleDef = {
  id: 'he.test.subnet',
  assumptions: [],
  variables: [
    whole('n', 'n', 'Prefix length', 24, 30, { base: 'prefix' as const }),
    whole('h', 'h', 'Host bits', 2, 8, { derived: true }),
    whole('B', 'B', 'Block size', 4, 256, { derived: true }),
    whole('a', 'a', 'Last octet of the address', 0, 255),
    whole('q', 'q', 'Whole blocks below the address', 0, 255, { derived: true }),
    whole('N', 'N', 'Network octet', 0, 255, { derived: true }),
    whole('M', 'M', 'Mask octet', 0, 255, { derived: true }),
    whole('k', 'k', 'Subnets wanted', 1, 64),
    whole('s', 's', 'Bits borrowed', 0, 6, { derived: true }),
  ],
  ...joinRules(
    {
      relations: [
        {
          id: 'h = 32 − n',
          display: '{h} = 32 − {n}',
          vars: ['h', 'n'],
          residual: (v) => v.h! - (32 - v.n!),
          solve: { h: (v) => 32 - v.n!, n: (v) => 32 - v.h! },
        },
        {
          id: 'M = 256 − B',
          display: '{M} = 256 − {B}',
          vars: ['M', 'B'],
          residual: (v) => v.M! - (256 - v.B!),
          solve: { M: (v) => 256 - v.B!, B: (v) => 256 - v.M! },
        },
        {
          id: 'N = qB',
          display: '{N} = {q} × {B}',
          vars: ['N', 'q', 'B'],
          residual: (v) => v.N! - v.q! * v.B!,
          solve: { N: (v) => v.q! * v.B!, q: () => undefined, B: () => undefined },
        },
      ],
      steps: {
        'h = 32 − n': {
          h: { expr: '32 − {n}', how: 'The bits after the prefix number the hosts.' },
        },
        'M = 256 − B': {
          M: { expr: '256 − {B}', how: 'The mask keeps the bits above the block.' },
        },
        'N = qB': {
          N: { expr: '{q} × {B}', how: 'The network starts at a whole number of blocks.' },
        },
      },
    },
    integerRule({
      target: 'B',
      kind: 'pow2',
      args: ['h'],
      how: 'Each host bit doubles the block.',
    }),
    integerRule({
      target: 'q',
      kind: 'floor',
      args: ['a', 'B'],
      how: 'Whole blocks below the address.',
    }),
    integerRule({
      target: 's',
      kind: 'ceilLog2',
      args: ['k'],
      how: 'Enough bits to number k subnets.',
    }),
  ),
  example: { n: 26, a: 77, k: 5, h: 6, B: 64, q: 1, N: 64, M: 192, s: 3 },
  startWith: ['n', 'a', 'k'],
} as unknown as ModuleDef;

const BINARY: ModuleDef = {
  id: 'he.test.binary',
  assumptions: [],
  variables: [
    whole('N', 'N', 'Number', 1, 2 ** 31),
    whole('n', 'n', 'Width in bits', 4, 32, { allowed: [4, 8, 16, 32] }),
    whole('b', 'b', 'In binary', 0, 2 ** 32, { base: { radix: 2 }, derived: true }),
    whole('x', 'x', 'In hexadecimal', 0, 2 ** 32, { base: { radix: 16 }, derived: true }),
    whole('P', 'P', 'Pattern of −N', 0, 2 ** 32, { base: { radix: 2, bits: 'n' }, derived: true }),
  ],
  ...joinRules(
    baseRule({
      target: 'b',
      of: 'N',
      radix: 2,
      how: 'Divide by 2 again and again; the remainders are the bits.',
    }),
    baseRule({ target: 'x', of: 'N', radix: 16, how: 'Divide by 16 again and again.' }),
    twosRule({
      pattern: 'P',
      magnitude: 'N',
      bits: 'n',
      how: 'Invert every bit of N, then add 1.',
    }),
  ),
  example: { N: 45, n: 8, b: 45, x: 45, P: 211 },
  startWith: ['N', 'n'],
} as unknown as ModuleDef;

const COUNTS: ModuleDef = {
  id: 'he.test.counts',
  assumptions: [],
  variables: [
    whole('n', 'n', 'Items', 0, 60),
    whole('r', 'r', 'Chosen', 0, 60),
    {
      ...whole('C', 'C', 'Combinations', 0, 1e18),
      derived: true,
      exact: z.exactInteger('C', (v) => z.bigChoose(v.n!, v.r!)),
    },
    whole('g', 'g', 'gcd of n and r', 0, 60, { derived: true }),
  ],
  relations: [
    {
      id: 'C = C(n, r)',
      display: '{C} = C({n}, {r})',
      vars: ['C', 'n', 'r'],
      residual: (v: Values) => v.C! - Number(z.bigChoose(v.n!, v.r!)),
      solve: {
        C: (v: Values) => Number(z.bigChoose(v.n!, v.r!)),
        n: () => undefined,
        r: () => undefined,
      },
      message: (v: Values) => (v.r! > v.n! ? 'You can’t choose more than there are.' : undefined),
    },
    ...integerRule({ target: 'g', kind: 'gcd', args: ['n', 'r'], how: 'Euclid’s algorithm.' })
      .relations,
  ],
  steps: {
    'C = C(n, r)': {
      C: {
        expr: 'C({n}, {r})',
        how: 'Choose r of n, order not counted.',
        work: (v: Values) => [z.chooseLine(v.n!, v.r!)],
      },
    },
    ...integerRule({ target: 'g', kind: 'gcd', args: ['n', 'r'], how: 'Euclid’s algorithm.' })
      .steps,
  },
  example: { n: 60, r: 30, C: Number(z.bigChoose(60, 30)), g: 30 },
  startWith: ['n', 'r'],
} as unknown as ModuleDef;

function walk(m: ModuleDef, given: Record<string, number>) {
  const res = solve(
    { variables: m.variables, relations: m.relations },
    Object.entries(given).map(([id, value]) => ({ id, value })),
  );
  return { res, w: plainWalkthrough(buildSteps(m, res)) };
}

/** The checks the sampling test makes on these steps. */
function problems(m: ModuleDef, given: Record<string, number>): string[] {
  const { w } = walk(m, given);
  const out: string[] = [];
  for (const s of w.steps) {
    // (as the sampling test: a step with no substituted line, its work lines saying it, is read
    // by its lines)
    if (!s.substituted) {
      out.push(...checkIntegerLines(s.lines), ...checkAlgebraLines(s.lines));
      continue;
    }
    const line = s.substituted;
    const expr = line.slice(line.indexOf(' = ') + 3);
    const rhs = s.result.split(' = ')[1] ?? '';
    const want = formValueAt(rhs) ?? Number(rhs.replace(/,/g, '').replace(/−/g, '-'));
    const got = evaluate(expr);
    if (got === undefined || !shownClose(got, want, expr))
      out.push(`${s.id}: "${line}" ≠ "${s.result}"`);
    out.push(...checkIntegerLines(s.lines), ...checkAlgebraLines(s.lines));
  }
  const lines = w.steps.flatMap((s) => s.lines);
  for (const v of checkCalculus(lines)) out.push(`calculus ${v.problem}: ${v.line}`);
  return out;
}

describe('pages with whole-number rules', () => {
  it('a subnet page: block, network octet, mask and bits borrowed', () => {
    const { res, w } = walk(SUBNET, { n: 26, a: 77, k: 5 });
    expect(res.values).toMatchObject({ h: 6, B: 64, q: 1, N: 64, M: 192, s: 3 });
    const all = w.steps.flatMap((s) => [s.result, ...s.lines]).join('\n');
    expect(all).toContain('⌊77 ÷ 64⌋ = ⌊1.2031⌋ = 1');
    expect(all).toContain('⌈log₂ 5⌉ = 3, since 2² = 4 < 5 ≤ 8 = 2³');
    expect(problems(SUBNET, { n: 26, a: 77, k: 5 })).toEqual([]);
    const r = rng(3);
    for (let i = 0; i < 40; i++) {
      const given = {
        n: 24 + Math.floor(r() * 7),
        a: Math.floor(r() * 256),
        k: 1 + Math.floor(r() * 64),
      };
      expect([given, problems(SUBNET, given)]).toEqual([given, []]);
    }
  });

  it('backward where one value answers: the block gives the host bits', () => {
    const { res } = walk(SUBNET, { B: 32, a: 77 });
    expect(res.values).toMatchObject({ h: 5, n: 27, q: 2, N: 64 });
    // (a floor never fills its inputs in)
    expect(walk(SUBNET, { q: 1, B: 64 }).res.values.a).toBeUndefined();
    // (and a block that isn't a power of 2 says why)
    expect(walk(SUBNET, { B: 48 }).res.values.h).toBeUndefined();
  });

  it('a binary page: base 2 and 16 by division, −N in n bits', () => {
    const { res, w } = walk(BINARY, { N: 45, n: 8 });
    expect(res.values).toMatchObject({ b: 45, x: 45, P: 211 });
    const results = w.steps.map((s) => s.result);
    expect(results).toEqual(expect.arrayContaining(['b = 101101₂', 'x = 2D₁₆', 'P = 11010011₂']));
    const lines = w.steps.flatMap((s) => s.lines);
    expect(lines).toEqual(expect.arrayContaining(['Invert every bit: 11010010₂', '45 = 101101₂']));
    expect(problems(BINARY, { N: 45, n: 8 })).toEqual([]);
    const r = rng(5);
    for (let i = 0; i < 40; i++) {
      const n = [4, 8, 16, 32][Math.floor(r() * 4)]!;
      const given = { N: 1 + Math.floor(r() * 2 ** (n - 1)), n };
      expect([given, problems(BINARY, given)]).toEqual([given, []]);
    }
    // Back from the pattern: −N read as signed.
    const back = walk(BINARY, { P: 211, n: 8 });
    expect(back.res.values.N).toBe(45);
    expect(back.w.steps.flatMap((s) => s.lines)).toContain(
      'Signed: 11010011₂ = -2⁷ + 2⁶ + 2⁴ + 2¹ + 2⁰ = -128 + 64 + 16 + 2 + 1 = -45',
    );
    expect(problems(BINARY, { P: 211, n: 8 })).toEqual([]);
    // −N that doesn't fit in n bits says so.
    expect(walk(BINARY, { N: 200, n: 8 }).res.values.P).toBeUndefined();
  });

  it('exact counts past 2⁵³ in the box and the steps', () => {
    const { w } = walk(COUNTS, { n: 60, r: 30 });
    const results = w.steps.map((s) => s.result);
    expect(results).toContain('C = 118264581564861424');
    expect(w.steps.flatMap((s) => s.lines)).toContain(
      'C(60, 30) = 60! ÷ (30! × 30!) = 118264581564861424',
    );
    expect(problems(COUNTS, { n: 60, r: 30 })).toEqual([]);
    expect(problems(COUNTS, { n: 52, r: 5 })).toEqual([]);
  });
});
