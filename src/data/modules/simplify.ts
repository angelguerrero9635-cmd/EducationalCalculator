/**
 * The simplifying a teacher writes under a substituted formula, one line per stage:
 *
 *   c = √(3² + 4²)
 *   c = √(9 + 16)
 *   c = √25
 *
 * Each line works out every operation whose operands are plain numbers and whose kind comes
 * first in the order of operations (powers and roots, then × and ÷, then + and −), the way
 * the work is shown in class. Lines are text; the last one is the value itself, which the
 * answer line shows, so callers usually drop it.
 */
import { asFraction, formatNumber, plainDigits, scientific, superscript } from '@/engine/format';

type Node =
  /** `pi`: the value is a multiple of π, printed "30π" (π stays a factor, never 3.1416). */
  | { kind: 'num'; value: number; text?: string; pi?: boolean; deg?: boolean }
  | { kind: 'bin'; op: '+' | '−' | '×' | '÷' | '/' | '^'; left: Node; right: Node }
  | { kind: 'pow'; base: Node; exp: 2 | 3 }
  | { kind: 'sqrt'; arg: Node }
  /**
   * sin(30°), cos, tan: an angle in degrees when it is written with °, else in radians.
   * ln(x); log(x), log₁₀(x) and log_10(x) (common), log₂(x), log_2(x) (`base`); |x| (abs).
   * `text` is the function as written (log₁₀, log_2), `spaced` a log written without brackets
   * round a lone number (log₁₀ 20).
   */
  | { kind: 'fn'; name: Fn; arg: Node; text?: string; base?: number; spaced?: boolean }
  | { kind: 'neg'; arg: Node };

type Trig = 'sin' | 'cos' | 'tan';
type Fn = Trig | 'ln' | 'log' | 'abs';
const TRIG = /^(sin|cos|tan)(?=\()/;
/** ln, log, log₁₀, log₂, log_10, log_2: before a bracket, a bar or a space (log₁₀ 20). */
const LOG = /^(ln|log(?:([₀₁₂₃₄₅₆₇₈₉]+)|_(\d+))?)(?=[ (|])/;
const subValue = (sub: string) => Number([...sub].map((c) => '₀₁₂₃₄₅₆₇₈₉'.indexOf(c)).join(''));

type Token =
  | { t: 'num'; value: number; text?: string; pi?: boolean; deg?: boolean }
  | { t: 'op'; v: string }
  | { t: 'fn'; v: Fn; text?: string; base?: number }
  /** An absolute-value bar: opening when nothing or an operator comes before it. */
  | { t: '|'; open: boolean }
  | { t: '('; v?: undefined }
  | { t: ')'; v?: undefined };

const NUMBER = /^\d+(?:\.\d+)?/;
/** A fraction written as one number: "3/4", or mixed "26 2/3" (division is written ÷). */
const FRACTION = /^(?:(\d+) )?(\d+)\/(\d+)(?![\d.])/;

const SCI = /^(\d+(?:\.\d+)?) × 10(⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)/;
const SUPER = /^⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+/;
const superValue = (raised: string) =>
  Number([...raised].map((c) => (c === '⁻' ? '-' : '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c))).join(''));

/**
 * Whether a line is worked in scientific notation: it has a number that can only be one (a
 * power of ten other than ² or ³: 6.674 × 10⁻¹¹, 7 × 10⁶; never 0.1 × 10², a mass times a
 * speed squared, whose work lines read 1/2 × 0.1 × 100). Its 4 × 10³ is then
 * one number too, never 4 × 1,000, and its large results are written the same way.
 */
const SCI_WORK = /\d(?:\.\d+)? × 10(?:⁻|[⁰¹⁴⁵⁶⁷⁸⁹]|[²³][⁰¹²³⁴⁵⁶⁷⁸⁹])/;

function tokenize(
  text: string,
  sciWork = SCI_WORK.test(text),
  timesPi = false,
): Token[] | undefined {
  const s = plainDigits(text).replace(/\s+/g, ' ').trim();
  const out: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i]!;
    if (ch === ' ') {
      i++;
      continue;
    }
    // Scientific notation is one number (6.022 × 10²³), never a power to work out; a lone
    // ² or ³ stays a power (expanded form, 3 × 10² = 300).
    const sci = SCI.exec(s.slice(i));
    if (sci && (sciWork || !/^[²³]$/.test(sci[2]!))) {
      out.push({ t: 'num', value: Number(sci[1]) * 10 ** superValue(sci[2]!), text: sci[0] });
      i += sci[0].length;
      continue;
    }
    // A run of raised digits is one exponent: 10²³ is 10 to the 23rd, not (10²)³.
    const raised = SUPER.exec(s.slice(i));
    if (raised && !/^[²³]$/.test(raised[0])) {
      out.push({ t: 'op', v: '^' }, { t: 'num', value: superValue(raised[0]) });
      i += raised[0].length;
      continue;
    }
    const frac = FRACTION.exec(s.slice(i));
    // Under a root a fraction is not one number: √3/2 is (√3)/2, as it is read.
    const before = out[out.length - 1];
    const rooted = before?.t === 'op' && before.v === '√';
    if (frac && Number(frac[3]) !== 0 && !rooted) {
      const value = Number(frac[1] ?? 0) + Number(frac[2]) / Number(frac[3]);
      out.push({ t: 'num', value, text: frac[0] });
      i += frac[0].length;
      continue;
    }
    const num = NUMBER.exec(s.slice(i));
    if (num) {
      // An angle keeps its degree sign: sin(30°).
      if (s[i + num[0].length] === '°') {
        out.push({ t: 'num', value: Number(num[0]), text: `${num[0]}°`, deg: true });
        i += num[0].length + 1;
      } else {
        out.push({ t: 'num', value: Number(num[0]) });
        i += num[0].length;
      }
      continue;
    }
    const trig = TRIG.exec(s.slice(i));
    if (trig) {
      out.push({ t: 'fn', v: trig[1] as Trig });
      i += trig[0].length;
      continue;
    }
    const log = LOG.exec(s.slice(i));
    if (log) {
      const base = log[2] ? subValue(log[2]) : log[3] ? Number(log[3]) : undefined;
      out.push({
        t: 'fn',
        v: log[1] === 'ln' ? 'ln' : 'log',
        text: log[1],
        ...(base !== undefined && base !== 10 ? { base } : {}),
      });
      i += log[0].length;
      continue;
    }
    // e, the base of natural growth (e^(0.05 × 8), e³), is a number: alone, never in a word.
    if (ch === 'e' && !/[a-zA-Z0-9.]/.test(s[i - 1] ?? '') && !/[a-zA-Z]/.test(s[i + 1] ?? '')) {
      out.push({ t: 'num', value: Math.E, text: 'e' });
      i++;
      continue;
    }
    if (ch === '|') {
      // |−4| opens after nothing, an operator, a bracket, a function or another opening bar.
      const last = out[out.length - 1];
      const open =
        !last ||
        (last.t === 'op' && last.v !== '²' && last.v !== '³') ||
        last.t === '(' ||
        last.t === 'fn' ||
        (last.t === '|' && last.open);
      out.push({ t: '|', open });
      i++;
      continue;
    }
    if (ch === 'π') {
      // 2π is 2 × π when a line is checked (2π × r/v); the working writes it as one number.
      const last = out[out.length - 1];
      if (timesPi && last?.t === 'num' && !last.pi) out.push({ t: 'op', v: '×' });
      out.push({ t: 'num', value: Math.PI, text: 'π', pi: true });
    } else if (ch === '½') out.push({ t: 'num', value: 0.5, text: '½' });
    else if (ch === '(') out.push({ t: '(' });
    else if (ch === ')') out.push({ t: ')' });
    else if ('+−×÷/^²³√-'.includes(ch)) out.push({ t: 'op', v: ch === '-' ? '−' : ch });
    else return undefined;
    i++;
  }
  return out;
}

/** Recursive-descent parser over the tokens; undefined when the text isn't plain arithmetic. */
function parse(tokens: Token[]): Node | undefined {
  let at = 0;
  const peek = () => tokens[at];
  const take = () => tokens[at++];
  const fail = { failed: false };

  const primary = (): Node => {
    const tok = take();
    if (!tok) {
      fail.failed = true;
      return { kind: 'num', value: NaN };
    }
    if (tok.t === 'num')
      return {
        kind: 'num',
        value: tok.value,
        ...(tok.text ? { text: tok.text } : {}),
        ...(tok.pi ? { pi: true } : {}),
        ...(tok.deg ? { deg: true } : {}),
      };
    if (tok.t === 'fn') {
      const extra = {
        ...(tok.text ? { text: tok.text } : {}),
        ...(tok.base !== undefined ? { base: tok.base } : {}),
      };
      const next = peek();
      // A log written without brackets takes the one number after it: log₁₀ 20 ÷ log₁₀ 2.
      if (tok.v !== 'sin' && tok.v !== 'cos' && tok.v !== 'tan' && next?.t !== '(') {
        if (next?.t === '|' && next.open)
          return { kind: 'fn', name: tok.v, arg: primary(), ...extra };
        if (next?.t !== 'num') fail.failed = true;
        return { kind: 'fn', name: tok.v, arg: unary(), ...extra, spaced: true };
      }
      if (next?.t !== '(') fail.failed = true;
      else take();
      const arg = sum();
      if (peek()?.t !== ')') fail.failed = true;
      else take();
      return { kind: 'fn', name: tok.v, arg, ...extra };
    }
    if (tok.t === '|') {
      if (!tok.open) fail.failed = true;
      const inner = sum();
      const close = peek();
      if (close?.t !== '|' || close.open) fail.failed = true;
      else take();
      return { kind: 'fn', name: 'abs', arg: inner };
    }
    if (tok.t === '(') {
      const inner = sum();
      if (peek()?.t !== ')') fail.failed = true;
      else take();
      return inner;
    }
    if (tok.t === 'op' && tok.v === '−') return { kind: 'neg', arg: unary() };
    if (tok.t === 'op' && tok.v === '√') return { kind: 'sqrt', arg: unary() };
    fail.failed = true;
    return { kind: 'num', value: NaN };
  };
  /** A primary with its squares and cubes: 3², (a + b)³. */
  const postfix = (): Node => {
    let node = primary();
    for (;;) {
      const p = peek();
      if (p?.t === 'op' && (p.v === '²' || p.v === '³')) {
        take();
        node = { kind: 'pow', base: node, exp: p.v === '²' ? 2 : 3 };
      } else return node;
    }
  };
  const unary = (): Node => postfix();
  const power = (): Node => {
    const base = unary();
    const p = peek();
    if (p?.t === 'op' && p.v === '^') {
      take();
      return { kind: 'bin', op: '^', left: base, right: power() };
    }
    return base;
  };
  const product = (): Node => {
    const factors: Node[] = [power()];
    const ops: ('×' | '÷' | '/')[] = [];
    for (;;) {
      const p = peek();
      if (p?.t === 'op' && (p.v === '×' || p.v === '÷' || p.v === '/')) {
        take();
        ops.push(p.v);
        factors.push(power());
      } else break;
    }
    // In a plain product, π moves to the end so the numbers multiply first: 1/3 × 9 × 10 × π.
    const isPi = (f: Node) => f.kind === 'num' && !!f.pi;
    if (ops.every((o) => o === '×') && factors.some(isPi) && !factors.every(isPi)) {
      factors.sort((a, b) => Number(isPi(a)) - Number(isPi(b)));
    }
    let node = factors[0]!;
    factors.slice(1).forEach((f, k) => {
      node = { kind: 'bin', op: ops[k]!, left: node, right: f };
    });
    return node;
  };
  const sum = (): Node => {
    let node = product();
    for (;;) {
      const p = peek();
      if (p?.t === 'op' && (p.v === '+' || p.v === '−')) {
        take();
        node = { kind: 'bin', op: p.v, left: node, right: product() };
      } else return node;
    }
  };
  const root = sum();
  if (fail.failed || at !== tokens.length) return undefined;
  return root;
}

/** Order of operations, higher first: powers and roots, then × ÷, then + −. */
const rank = (n: Node): number => {
  if (
    n.kind === 'pow' ||
    n.kind === 'sqrt' ||
    n.kind === 'fn' ||
    (n.kind === 'bin' && n.op === '^')
  )
    return 3;
  if (n.kind === 'bin' && (n.op === '×' || n.op === '÷' || n.op === '/')) return 2;
  if (n.kind === 'bin') return 1;
  return n.kind === 'neg' ? 4 : 0;
};

const isNum = (n: Node): n is Extract<Node, { kind: 'num' }> => n.kind === 'num';

/** Whether every operand of this operation is already a plain number. */
const ready = (n: Node): boolean => {
  switch (n.kind) {
    case 'num':
      return false;
    case 'bin':
      return isNum(n.left) && isNum(n.right);
    case 'pow':
      return isNum(n.base);
    case 'sqrt':
    case 'fn':
    case 'neg':
      return isNum(n.arg);
  }
};

/** Whether a value is an angle in degrees (30°, 90° − 60°). */
const degOf = (n: Node): boolean =>
  n.kind === 'num'
    ? !!n.deg
    : n.kind === 'bin'
      ? degOf(n.left) || degOf(n.right)
      : n.kind === 'pow'
        ? degOf(n.base)
        : n.kind !== 'fn' && degOf(n.arg);

const compute = (n: Node): number => {
  switch (n.kind) {
    case 'num':
      return n.value;
    case 'bin': {
      const [a, b] = [compute(n.left), compute(n.right)];
      return n.op === '+'
        ? a + b
        : n.op === '−'
          ? a - b
          : n.op === '^'
            ? a ** b
            : n.op === '×'
              ? a * b
              : a / b;
    }
    case 'pow':
      return compute(n.base) ** n.exp;
    case 'sqrt':
      return Math.sqrt(compute(n.arg));
    case 'fn': {
      const x = compute(n.arg);
      if (n.name === 'abs') return Math.abs(x);
      if (n.name === 'ln') return Math.log(x);
      // log₁₀ 1000 is exactly 3 (Math.log(1000) / Math.log(10) is 2.9999…).
      if (n.name === 'log') {
        const value = n.base === undefined ? Math.log10(x) : Math.log(x) / Math.log(n.base);
        return Number(value.toPrecision(14));
      }
      const angle = x * (degOf(n.arg) ? Math.PI / 180 : 1);
      const value = Math[n.name](angle);
      // cos 90° is 0, not 6 × 10⁻¹⁷; tan 90° has no value.
      if (n.name === 'tan' && Math.abs(Math.cos(angle)) < 1e-12) return NaN;
      return Math.abs(value) < 1e-12 ? 0 : value;
    }
    case 'neg':
      return -compute(n.arg);
  }
};

/** Whether a value is a multiple of π (true), plain (false), or neither (π², 1 ÷ π, 3 + π). */
const piOf = (n: Node): boolean | undefined => {
  switch (n.kind) {
    case 'num':
      return !!n.pi;
    case 'neg':
      return piOf(n.arg);
    case 'sqrt':
    case 'pow':
      return piOf(n.kind === 'sqrt' ? n.arg : n.base) ? undefined : false;
    case 'fn':
      return piOf(n.arg) === undefined ? undefined : false;
    case 'bin': {
      const [a, b] = [piOf(n.left), piOf(n.right)];
      if (a === undefined || b === undefined) return undefined;
      if (n.op === '+' || n.op === '−') return a === b ? a : undefined;
      if (n.op === '×') return a && b ? undefined : a || b;
      if (n.op === '^') return a || b ? undefined : false;
      return b ? (a ? false : undefined) : a;
    }
  }
};

/**
 * A worked-out value written exactly as class writes it: a decimal to 4 places, a fraction
 * (2/3), or a multiple of π (30π, 2/3π); undefined when it would need rounding (0.3333…),
 * which stops the chain before a line that isn't true arithmetic.
 */
function exactText(value: number, pi: boolean, fractions: boolean): string | undefined {
  const c = pi ? value / Math.PI : value;
  const round = Number(c.toPrecision(12));
  let text: string | undefined;
  if (Math.abs(round * 1e4 - Math.round(round * 1e4)) < 1e-6) text = fmt(round);
  else if (fractions) {
    const f = asFraction(round, 100);
    const [, num, den] = /(\d+)\/(\d+)$/.exec(f ?? '') ?? [];
    const whole = /^−?(\d+) /.exec(f ?? '')?.[1];
    const back = num && den ? Number(whole ?? 0) + Number(num) / Number(den) : NaN;
    if (f && Math.abs(Math.abs(round) - back) < 1e-9) text = f;
  }
  if (text === undefined) return undefined;
  if (!pi) return text;
  return text === '1' ? 'π' : text === '−1' ? '−π' : `${text}π`;
}

/**
 * Whether a child is worked inside brackets (or under a root, or up in an exponent): what is
 * in brackets comes first, whatever its operation.
 */
const grouped = (parent: Node, child: Node, rightSide: boolean): boolean => {
  if (parent.kind === 'sqrt' || parent.kind === 'fn') return true;
  if (parent.kind === 'pow') return child.kind !== 'num';
  if (parent.kind === 'bin' && parent.op === '^') return true;
  if (parent.kind === 'bin' && child.kind === 'bin') {
    return rank(child) < rank(parent) || (rank(child) === rank(parent) && rightSide);
  }
  return false;
};

type Stage = { depth: number; rank: number };
const later = (a: Stage, b: Stage) => a.depth > b.depth || (a.depth === b.depth && a.rank > b.rank);

/** The stage to work out next: the deepest brackets first, then the strongest operation. */
const nextStage = (n: Node, depth = 0): Stage | undefined => {
  if (n.kind === 'num') return undefined;
  let best: Stage | undefined = ready(n) ? { depth, rank: rank(n) } : undefined;
  const children: [Node, boolean][] =
    n.kind === 'bin'
      ? [
          [n.left, false],
          [n.right, true],
        ]
      : n.kind === 'pow'
        ? [[n.base, false]]
        : [[n.arg, false]];
  for (const [child, rightSide] of children) {
    const stage = nextStage(child, depth + (grouped(n, child, rightSide) ? 1 : 0));
    if (stage && (!best || later(stage, best))) best = stage;
  }
  return best;
};

/** Works out every ready operation at the stage (a number in a "−" is kept as a negative). */
/** Marks a value that can't be written exactly: the working stops before it. */
const INEXACT = '≈';

/** Whether the expression being worked writes fractions (3/4), so its results may too. */
let fractionsAllowed = false;
/** Whether the expression being worked is in scientific notation, so its results are too. */
let scientificWork = false;

const reduce = (n: Node, stage: Stage, depth = 0): Node => {
  if (n.kind === 'num') return n;
  if (ready(n) && depth === stage.depth && rank(n) === stage.rank) {
    const value = compute(n);
    const pi = piOf(n);
    const text = pi === undefined ? undefined : exactText(value, pi, fractionsAllowed);
    // NaN marks a value that can't be written exactly; the chain stops before it.
    if (text === undefined || Number.isNaN(value))
      return { kind: 'num', value: NaN, text: INEXACT };
    // An angle worked out stays an angle: sin(90° − 60°), sin(30°).
    if (degOf(n)) return { kind: 'num', value, text: `${text}°`, deg: true };
    return { kind: 'num', value, text, ...(pi ? { pi: true } : {}) };
  }
  const at = (child: Node, rightSide: boolean) =>
    reduce(child, stage, depth + (grouped(n, child, rightSide) ? 1 : 0));
  switch (n.kind) {
    case 'bin':
      return { ...n, left: at(n.left, false), right: at(n.right, true) };
    case 'pow':
      return { ...n, base: at(n.base, false) };
    case 'sqrt':
    case 'fn':
    case 'neg':
      return { ...n, arg: at(n.arg, false) };
  }
};

/** −100 written in brackets is a number, not a stage: −(−4) stays one. */
const signed = (n: Node): Node => {
  switch (n.kind) {
    case 'num':
      return n;
    case 'neg':
      return isNum(n.arg) && n.arg.value > 0
        ? { ...n.arg, value: -n.arg.value, ...(n.arg.text ? { text: `−${n.arg.text}` } : {}) }
        : { ...n, arg: signed(n.arg) };
    case 'bin': {
      const [left, right] = [signed(n.left), signed(n.right)];
      // 4 × π is the number 4π, not a stage of its own.
      if (n.op === '×' && isNum(left) && isNum(right) && !!left.pi !== !!right.pi) {
        const [k, p] = left.pi ? [right, left] : [left, right];
        if (p.text === 'π' && !k.pi && Number.isFinite(k.value) && !k.text?.includes(' ')) {
          return {
            kind: 'num',
            value: k.value * Math.PI,
            text: `${k.text ?? fmt(k.value)}π`,
            pi: true,
          };
        }
      }
      return { ...n, left, right };
    }
    case 'pow':
      return { ...n, base: signed(n.base) };
    case 'sqrt':
    case 'fn':
      return { ...n, arg: signed(n.arg) };
  }
};

/**
 * Works out a stage in every bracket group at the stage's depth, each at its own strongest
 * operation: (2⁶ − 1) ÷ (2 − 1) → (64 − 1) ÷ 1, the top and bottom of a quotient side by side.
 */
const reduceGroups = (n: Node, target: number, depth = 0): Node => {
  if (n.kind === 'num') return n;
  if (depth === target) {
    const own = nextStage(n);
    return own && own.depth === 0 ? reduce(n, own) : n;
  }
  const at = (child: Node, rightSide: boolean) =>
    reduceGroups(child, target, depth + (grouped(n, child, rightSide) ? 1 : 0));
  switch (n.kind) {
    case 'bin':
      return { ...n, left: at(n.left, false), right: at(n.right, true) };
    case 'pow':
      return { ...n, base: at(n.base, false) };
    case 'sqrt':
    case 'fn':
    case 'neg':
      return { ...n, arg: at(n.arg, false) };
  }
};

// In scientific work a large or tiny whole number is written in it too: 3.9844 × 10¹⁴, never
// 398,437,800,000,000.
const fmt = (x: number) =>
  (scientificWork && x !== 0 && (Math.abs(x) >= 1e7 || Math.abs(x) < 1e-4)
    ? scientific(x)
    : formatNumber(x)
  ).replace('-', '−');

/** Prints a node with only the brackets the order of operations needs. */
function print(n: Node, parentRank = 0, rightSide = false, afterSign = false): string {
  switch (n.kind) {
    case 'num': {
      const s = n.text ?? fmt(n.value);
      // A negative number inside an expression is bracketed: 5 − (−3), not 5 − −3; so is a
      // number in scientific notation (÷ (1 × 10⁻¹²)), and a fraction or π multiple under a
      // power: (2/3)².
      const negative = s.startsWith('−');
      const sci = s.includes(' × 10');
      const compound = parentRank === 4 && /[/ π]/.test(s) && s !== 'π';
      // (first in its expression it reads as itself: −60 ÷ 2)
      const after = parentRank > 0 && (rightSide || parentRank === 4);
      // (and so is one that starts what follows a sign: 4 − (−10) × 2)
      return (negative && (after || afterSign)) || (sci && parentRank > 0) || compound
        ? `(${s})`
        : s;
    }
    case 'neg': {
      // −(−4), not −−4.
      const inner = print(n.arg, 4);
      const s = `−${inner.startsWith('−') ? `(${inner})` : inner}`;
      // "+ (−1)", not "+ −1".
      return (parentRank > 0 && parentRank < 4 && rightSide) || afterSign ? `(${s})` : s;
    }
    case 'sqrt': {
      // √25 and √(9 + 16): brackets only around an expression.
      const inner = print(n.arg, 0);
      // √(5.692 × 10⁷), √(3/4): a number with a space or bar in it is bracketed too.
      return isNum(n.arg) && n.arg.value >= 0 && !/[ /]/.test(inner) ? `√${inner}` : `√(${inner})`;
    }
    case 'fn': {
      const inner = print(n.arg, 0);
      if (n.name === 'abs') return `|${inner}|`;
      // A log written round a lone number keeps its form: log₁₀ 20, log₁₀(2 × 10⁻⁵).
      const lone = isNum(n.arg) && n.arg.value >= 0 && !/[ /]/.test(inner);
      return n.spaced && lone ? `${n.text ?? n.name} ${inner}` : `${n.text ?? n.name}(${inner})`;
    }
    case 'pow': {
      const base = print(n.base, 4);
      const needs = !isNum(n.base) || n.base.value < 0;
      return `${needs && !base.startsWith('(') ? `(${base})` : base}${n.exp === 2 ? '²' : '³'}`;
    }
    case 'bin': {
      const r = rank(n);
      // The base of ^ keeps its brackets when negative: (−3)^2, not −3^2.
      const base = n.op === '^' ? print(n.left, 4, false) : undefined;
      // The left piece starts where this node starts: after a sign when this node does.
      const left =
        base === undefined
          ? print(n.left, r, false, afterSign)
          : base.startsWith('−')
            ? `(${base})`
            : base;
      const printedRaw = print(n.right, r, true, true);
      // An exponent that is not a plain whole number keeps its brackets: 27^(2/3), never
      // 27²/3 (which reads as 27² ÷ 3 = 243).
      const printedRight =
        n.op === '^' && !/^−?\d+$/.test(printedRaw) && !printedRaw.startsWith('(')
          ? `(${printedRaw})`
          : printedRaw;
      // Divided by a multiple of π: ÷ (4π), which would read as ÷ 4, then × π.
      const right =
        (n.op === '÷' || n.op === '/') &&
        isNum(n.right) &&
        n.right.pi &&
        printedRight !== 'π' &&
        !printedRight.startsWith('(')
          ? `(${printedRight})`
          : printedRight;
      const text =
        n.op === '/'
          ? `${left}/${right}`
          : n.op === '^'
            ? // A whole-number exponent is written raised: 2⁶, (1.05)².
              superscript(`${left}^${right}`)
            : `${left} ${n.op} ${right}`;
      // Brackets when this sits under a stronger operation, or to the right of − or ÷ at the
      // same level (8 − (5 − 3)), or as the base of a power.
      const needs = parentRank > r || (parentRank === r && rightSide) || parentRank === 4;
      return needs ? `(${text})` : text;
    }
  }
}

/** The value of a plain arithmetic expression as printed, or undefined when it isn't one. */
export function evaluatePrinted(text: string): number | undefined {
  const tokens = tokenize(text, undefined, true);
  const tree = tokens && parse(tokens);
  if (!tree) return undefined;
  const x = compute(tree);
  return Number.isFinite(x) ? x : undefined;
}

/** How many operations the expression has, or undefined when it isn't plain arithmetic. */
export function operationCount(text: string, sciWork?: boolean): number | undefined {
  const tokens = tokenize(text, sciWork);
  const tree = tokens && parse(tokens);
  if (!tree) return undefined;
  const count = (n: Node): number => {
    switch (n.kind) {
      case 'num':
        return 0;
      case 'bin':
        return 1 + count(n.left) + count(n.right);
      case 'pow':
        return 1 + count(n.base);
      case 'sqrt':
      case 'fn':
        return 1 + count(n.arg);
      case 'neg':
        return count(n.arg);
    }
  };
  return count(tree);
}

/** A line without brackets round a lone negative, and without spaces: "6 ÷ (−2)" = "6 ÷ −2". */
const loose = (line: string) =>
  line
    .replace(/-/g, '−')
    .replace(/\((−[\d.,/ ]+)\)/g, '$1')
    .replace(/\s+/g, '');

/**
 * The lines after a substituted expression, one per stage of working out, ending with the
 * value. Empty when the text isn't plain arithmetic, has fewer than two operations, or a stage
 * doesn't come out to a number (a root of a negative, a division by zero).
 */
export function simplifyChain(text: string, options: { scientific?: boolean } = {}): string[] {
  scientificWork = !!options.scientific || SCI_WORK.test(text);
  const tokens = tokenize(text, scientificWork);
  const parsed = tokens && parse(tokens);
  if (!parsed || (operationCount(text, scientificWork) ?? 0) < 2) return [];
  let tree = signed(parsed);
  fractionsAllowed = !!tokens?.some((t) => t.t === 'num' && t.text?.includes('/'));
  const lines: string[] = [];
  for (let guard = 0; guard < 40 && tree.kind !== 'num'; guard++) {
    const stage = nextStage(tree);
    if (!stage) break;
    tree = reduceGroups(tree, stage.depth);
    // "5 − (−3)" and "−(−3)" are one stage each; the reader sees the sign settle on the next line.
    const line = print(tree);
    // A stage that would need rounding ends the working: the answer line gives the value.
    if (line.includes(INEXACT)) return lines;
    // A stage that doesn't come out to a number (a root of a negative, ÷ 0): no working at all.
    if (!Number.isFinite(compute(tree)) || /NaN|Infinity/.test(line)) return [];
    // A line that differs from the one before only in brackets round a negative is not a stage.
    const last = lines[lines.length - 1] ?? text.trim();
    if (loose(line) !== loose(last) && loose(line) !== loose(text)) lines.push(line);
  }
  return lines;
}
