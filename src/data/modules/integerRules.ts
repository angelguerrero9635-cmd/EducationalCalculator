/**
 * Whole-number rules for college pages (HE-E21): a relation with its steps for each integer
 * function (⌊ ⌋, ⌈ ⌉, mod, round, log₂, 2ⁿ, ⌈log₂ ⌉, ⌊log₂ ⌋, gcd, lcm, min, max), a value
 * written in another base, and the two's complement pattern of −N. Each step's lines come from
 * `engine/integers.ts`, so the harness reads them back exactly (`harness/integerLines.ts`).
 *
 * Found forward always; backward only where one value answers (n = 2ᵏ from k = log₂ n, a number
 * from its digits, N from its pattern). A floor, a ceiling, a remainder, a gcd or a minimum has
 * many inputs for one output, so typing it never fills them in.
 */
import {
  ceilDiv,
  ceilLine,
  ceilLog2,
  ceilLog2Line,
  divisionLines,
  floorDiv,
  floorLine,
  floorLog2,
  floorLog2Line,
  gcd,
  gcdLines,
  groupLines,
  isPowerOf2,
  lcm,
  lcmLine,
  log2Exact,
  log2Line,
  maxLine,
  minLine,
  mod,
  modLine,
  placeValueLine,
  powLine,
  roundHalfAway,
  roundLine,
  signedLine,
  twosComplement,
  twosLines,
  type Radix,
} from '@/engine/integers';
import type { Relation, Values } from '@/engine/types';

import type { StepText } from './types';
import type { RulesOf } from './written';

export type IntegerKind =
  | 'floor'
  | 'ceil'
  | 'mod'
  | 'round'
  | 'log2'
  | 'pow2'
  | 'ceilLog2'
  | 'floorLog2'
  | 'gcd'
  | 'lcm'
  | 'min'
  | 'max';

const never = () => undefined;
const whole = (x: number | undefined) => x !== undefined && Number.isInteger(x);

interface KindSpec {
  /** The right side as a template of the argument ids. */
  rhs: (a: string[]) => string;
  f: (x: number[]) => number | undefined;
  lines?: (x: number[]) => (string | undefined)[];
  arity: [number, number];
}

const tpl = (id: string) => `{${id}}`;
const KINDS: Record<IntegerKind, KindSpec> = {
  floor: {
    rhs: (a) => (a.length === 1 ? `⌊${tpl(a[0]!)}⌋` : `⌊${tpl(a[0]!)} ÷ ${tpl(a[1]!)}⌋`),
    f: (x) => (x.length === 1 ? Math.floor(x[0]!) : floorDiv(x[0]!, x[1]!)),
    lines: (x) => (x.length === 2 ? [floorLine(x[0]!, x[1]!)] : []),
    arity: [1, 2],
  },
  ceil: {
    rhs: (a) => (a.length === 1 ? `⌈${tpl(a[0]!)}⌉` : `⌈${tpl(a[0]!)} ÷ ${tpl(a[1]!)}⌉`),
    f: (x) => (x.length === 1 ? Math.ceil(x[0]!) : ceilDiv(x[0]!, x[1]!)),
    lines: (x) => (x.length === 2 ? [ceilLine(x[0]!, x[1]!)] : []),
    arity: [1, 2],
  },
  mod: {
    rhs: (a) => `${tpl(a[0]!)} mod ${tpl(a[1]!)}`,
    f: (x) => mod(x[0]!, x[1]!),
    lines: (x) => [modLine(x[0]!, x[1]!)],
    arity: [2, 2],
  },
  round: {
    rhs: (a) => (a.length === 1 ? `round(${tpl(a[0]!)})` : `round(${tpl(a[0]!)} ÷ ${tpl(a[1]!)})`),
    f: (x) =>
      x.length === 1 ? roundHalfAway(x[0]!) : x[1] ? roundHalfAway(x[0]! / x[1]) : undefined,
    lines: (x) => (x.length === 1 ? [roundLine(x[0]!)] : []),
    arity: [1, 2],
  },
  log2: {
    rhs: (a) => `log₂ ${tpl(a[0]!)}`,
    f: (x) => log2Exact(x[0]!),
    lines: (x) => [log2Line(x[0]!)],
    arity: [1, 1],
  },
  pow2: {
    rhs: (a) => `2^${tpl(a[0]!)}`,
    f: (x) => (whole(x[0]) && x[0]! >= 0 && x[0]! <= 1023 ? 2 ** x[0]! : undefined),
    lines: (x) => (x[0]! > 16 ? [powLine(2, x[0]!)] : []),
    arity: [1, 1],
  },
  ceilLog2: {
    rhs: (a) => `⌈log₂ ${tpl(a[0]!)}⌉`,
    f: (x) => ceilLog2(x[0]!),
    lines: (x) => [ceilLog2Line(x[0]!)],
    arity: [1, 1],
  },
  floorLog2: {
    rhs: (a) => `⌊log₂ ${tpl(a[0]!)}⌋`,
    f: (x) => floorLog2(x[0]!),
    lines: (x) => [floorLog2Line(x[0]!)],
    arity: [1, 1],
  },
  gcd: {
    rhs: (a) => `gcd(${a.map(tpl).join(', ')})`,
    f: (x) => (x.every((y) => whole(y)) ? gcd(...x) : undefined),
    lines: (x) => (x.length === 2 ? gcdLines(x[0]!, x[1]!) : []),
    arity: [2, 8],
  },
  lcm: {
    rhs: (a) => `lcm(${a.map(tpl).join(', ')})`,
    f: (x) => (x.every((y) => whole(y)) ? lcm(...x) : undefined),
    lines: (x) => (x.length === 2 ? [lcmLine(x[0]!, x[1]!)] : []),
    arity: [2, 8],
  },
  min: {
    rhs: (a) => `min(${a.map(tpl).join(', ')})`,
    f: (x) => Math.min(...x),
    lines: (x) => [minLine(x)],
    arity: [2, 8],
  },
  max: {
    rhs: (a) => `max(${a.map(tpl).join(', ')})`,
    f: (x) => Math.max(...x),
    lines: (x) => [maxLine(x)],
    arity: [2, 8],
  },
};

/**
 * One integer function as a page's relation, found forward: `target` = kind(`args`). `log2`
 * and `pow2` also run backward (n = 2ᵏ, k = log₂ n); a value that isn't a power of 2 gets
 * `message`. `how` explains the forward step; `backHow` the backward one.
 */
export function integerRule(opts: {
  target: string;
  kind: IntegerKind;
  args: string[];
  how: string;
  backHow?: string;
  /** The relation's id (defaults to its display with symbols). */
  id?: string;
  /** Why the rule has no value (log₂ of a number that isn't a power of 2). */
  message?: string;
  /** Leave the worked lines out (a step whose substituted line says it all). */
  noLines?: boolean;
}): RulesOf {
  const { target, kind, args, how } = opts;
  const spec = KINDS[kind];
  if (args.length < spec.arity[0] || args.length > spec.arity[1])
    throw new Error(`${kind} takes ${spec.arity.join(' to ')} values`);
  const rhs = spec.rhs(args);
  const id = opts.id ?? `${target} = ${kind}(${args.join(', ')})`;
  const inputs = (v: Values) => {
    const xs = args.map((a) => v[a]);
    return xs.every((x) => x !== undefined && Number.isFinite(x)) ? (xs as number[]) : undefined;
  };
  const forward = (v: Values) => {
    const xs = inputs(v);
    return xs ? spec.f(xs) : undefined;
  };
  const solve: Relation['solve'] = Object.fromEntries(args.map((a) => [a, never]));
  solve[target] = forward;
  const steps: Record<string, StepText> = {
    [target]: {
      expr: rhs,
      how,
      ...(opts.noLines || !spec.lines
        ? {}
        : {
            work: (v: Values) => {
              const xs = inputs(v);
              return xs ? spec.lines!(xs).filter((l): l is string => !!l) : [];
            },
          }),
    },
  };
  // Backward where one value answers: n = 2ᵏ, k = log₂ n.
  if (kind === 'log2' || kind === 'pow2') {
    const [arg] = args as [string];
    const inverse = kind === 'log2' ? KINDS.pow2 : KINDS.log2;
    solve[arg] = (v) => (v[target] === undefined ? undefined : inverse.f([v[target]!]));
    steps[arg] = {
      expr: inverse.rhs([target]),
      how:
        opts.backHow ??
        (kind === 'log2' ? 'Undo log₂: raise 2 to it.' : 'Undo the power: take log₂.'),
      work: (v) =>
        v[target] === undefined ? [] : inverse.lines!([v[target]!]).filter((l): l is string => !!l),
    };
  }
  const relation: Relation = {
    id,
    display: `{${target}} = ${rhs}`,
    vars: [target, ...args],
    residual: (v) => {
      const y = forward(v);
      return y === undefined ? NaN : v[target]! - y;
    },
    solve,
    message: (v) => {
      const xs = inputs(v);
      if (!xs) return undefined;
      if (kind === 'log2' && !isPowerOf2(xs[0]!))
        return opts.message ?? 'log₂ is a whole number only for a power of 2 (1, 2, 4, 8, …).';
      if (kind === 'pow2' && v[target] !== undefined && !isPowerOf2(v[target]!))
        return opts.message ?? 'Only a power of 2 (1, 2, 4, 8, …) is 2 raised to a whole number.';
      return spec.f(xs) === undefined ? opts.message : undefined;
    },
  };
  return { relations: [relation], steps: { [id]: steps } };
}

/**
 * A whole number and the same number written in another base (`target` has `base` set): the
 * digits by repeated division (or, for hex and octal from bits, by grouping the bits), and back
 * by place value. `bits` is the width's value id or count, for grouping.
 */
export function baseRule(opts: {
  target: string;
  of: string;
  radix: Radix;
  how: string;
  backHow?: string;
  /** Hex or octal by grouping the bits of an n-bit number, not by repeated division. */
  fromBits?: number | string;
  id?: string;
  prefix?: boolean;
}): RulesOf {
  const { target, of, radix, how } = opts;
  const id = opts.id ?? `${target} = ${of} in base ${radix}`;
  const ok = (x: number | undefined) => whole(x) && x! >= 0 && Number.isSafeInteger(x);
  const bitsOf = (v: Values) =>
    typeof opts.fromBits === 'string' ? v[opts.fromBits] : opts.fromBits;
  const relation: Relation = {
    id,
    display: `{${target}} = {${of}}`,
    vars: [target, of],
    residual: (v) => v[target]! - v[of]!,
    solve: {
      [target]: (v) => (ok(v[of]) ? v[of] : undefined),
      [of]: (v) => (ok(v[target]) ? v[target] : undefined),
    },
  };
  return {
    relations: [relation],
    steps: {
      [id]: {
        [target]: {
          expr: `{${of}}`,
          how,
          work: (v) => {
            const x = v[of]!;
            const bits = bitsOf(v);
            if (opts.fromBits !== undefined && radix !== 2 && bits !== undefined && x < 2 ** bits)
              return groupLines(x, bits, radix as 8 | 16);
            return divisionLines(x, radix, { bits, prefix: opts.prefix });
          },
        },
        [of]: {
          expr: `{${target}}`,
          how:
            opts.backHow ??
            'Each digit counts its place: multiply by the power of the base and add.',
          work: (v) => [placeValueLine(v[target]!, radix, { prefix: opts.prefix })],
        },
      },
    },
  };
}

/**
 * The n-bit two's complement pattern of −N, as an unsigned number P = 2ⁿ − N (the box shows it
 * in base 2 at n bits): invert every bit, add 1; back, read the pattern as signed. N runs from
 * 1 to 2ⁿ⁻¹.
 */
export function twosRule(opts: {
  pattern: string;
  magnitude: string;
  bits: string;
  how: string;
  backHow?: string;
  id?: string;
}): RulesOf {
  const { pattern: P, magnitude: N, bits: n, how } = opts;
  const id = opts.id ?? `${P} = 2^${n} − ${N}`;
  const relation: Relation = {
    id,
    display: `{${P}} = 2^{${n}} − {${N}}`,
    vars: [P, N, n],
    residual: (v) => v[P]! - (2 ** v[n]! - v[N]!),
    solve: {
      [P]: (v) => twosComplement(v[N]!, v[n]!),
      [N]: (v) =>
        whole(v[P]) && v[P]! >= 2 ** (v[n]! - 1) && v[P]! < 2 ** v[n]!
          ? 2 ** v[n]! - v[P]!
          : undefined,
      [n]: never,
    },
    message: (v) => {
      const [m, w] = [v[N], v[n]];
      if (m === undefined || w === undefined) return undefined;
      return m < 1 || m > 2 ** (w - 1)
        ? `In ${w} bits, −N fits only for N from 1 to ${2 ** (w - 1)}.`
        : undefined;
    },
  };
  return {
    relations: [relation],
    steps: {
      [id]: {
        [P]: { expr: `2^{${n}} − {${N}}`, how, work: (v) => twosLines(v[N]!, v[n]!) },
        [N]: {
          expr: `2^{${n}} − {${P}}`,
          how: opts.backHow ?? 'Read the pattern as signed: its top bit weighs −2ⁿ⁻¹.',
          work: (v) => [signedLine(v[P]!, v[n]!)],
        },
      },
    },
  };
}
